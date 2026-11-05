/* Rizzo Games service worker: one worker for the launcher and every game.
   - Every page (index.html, sudoku.html, math-racer.html, ...) is fetched fresh from the internet first,
     so a new commit shows up the next time it's opened. The saved copy is only used offline (or on a very
     slow connection).
   - You never need to edit this file when you add a game or update one. The launcher tells it which game
     files exist, and it saves each one for offline play.
   - Games can ask "is there a newer version of me?" (Sudoku's update checks do this) and get an answer
     about their own page. */

const SCOPE = self.registration.scope;
const CACHE = 'rizzo-games:' + SCOPE;
const OLD_CACHES = ['sudoku-app:' + SCOPE];           // left behind by the old Sudoku-only worker
const SHELL = ['index.html', 'manifest.webmanifest', 'games.js', 'icon-192.png', 'icon-180.png', 'icon-512.png'];
const SLOW = 4000;   // ms to wait for the internet before falling back to the saved copy

// One cache key per page: "/" and "/index.html" are the same page, and ?query / #hash are ignored
const pageKey = url => {
  const u = new URL(url, SCOPE);
  u.search = ''; u.hash = '';
  if (u.href === SCOPE || u.href.endsWith('/')) u.pathname += 'index.html';
  return u.href;
};
const isHtml = req => req.mode === 'navigate' || /\.html$/.test(new URL(req.url).pathname) || new URL(req.url).pathname.endsWith('/');

async function save(urls) {
  const cache = await caches.open(CACHE);
  await Promise.all(urls.map(u => {
    const key = /\.html$/.test(u) ? pageKey(u) : new URL(u, SCOPE).href;
    return fetch(new Request(key, {cache: 'no-cache'})).then(r => r.ok && cache.put(key, r)).catch(() => {});
  }));
}

self.addEventListener('install', e => {
  e.waitUntil(save(SHELL));
  self.skipWaiting();                        // take over straight away, no "close all tabs" needed
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (OLD_CACHES.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Fetch the newest copy of a page, save it, and say whether it differs from the saved copy
async function refreshPage(key) {
  const res = await fetch(key, {cache: 'no-cache'});
  if (!res.ok) throw new Error('bad response');
  const cache = await caches.open(CACHE);
  const old = await cache.match(key);
  const [now, before] = await Promise.all([res.clone().text(), old ? old.text() : null]);
  await cache.put(key, res.clone());
  return {res, changed: before !== null && before !== now};
}

// Tell the open tabs showing this page that a newer version arrived
async function tellPages(key) {
  for (const c of await self.clients.matchAll({type: 'window'}))
    if (pageKey(c.url) === key) c.postMessage({type: 'updated'});
}

async function servePage(req) {
  const key = pageKey(req.url);
  const net = refreshPage(key);
  const timeout = new Promise(r => setTimeout(r, SLOW));
  const first = await Promise.race([net.then(x => x.res).catch(() => null), timeout]);
  if (first) return first;
  // offline or slow: use the saved copy now, and if the internet catches up with a newer version, reload
  net.then(x => x.changed && tellPages(key)).catch(() => {});
  const saved = await (await caches.open(CACHE)).match(key);
  return saved || net.then(x => x.res);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(SCOPE)) return;
  if (isHtml(req)) { e.respondWith(servePage(req)); return; }
  // icons, manifest, games.js etc.: saved copy straight away, refreshed in the background
  e.respondWith(caches.open(CACHE).then(async cache => {
    const saved = await cache.match(req, {ignoreSearch: true});
    const net = fetch(req, {cache: 'no-cache'}).then(r => { if (r.ok) cache.put(req, r.clone()); return r; });
    if (saved) { e.waitUntil(net.catch(() => {})); return saved; }
    return net;
  }));
});

self.addEventListener('message', e => {
  const d = e.data || {};
  // The launcher lists every game file, so they can all be played offline
  if (d.type === 'warm' && Array.isArray(d.urls)) {
    e.waitUntil(save(d.urls.filter(u => typeof u === 'string')));
    return;
  }
  // A game asks "is there something newer than me?"
  // Replies {type: 'checked', status: 'updated' | 'same' | 'offline', modified: <when the file was last committed>}
  if (d.type === 'check') {
    const key = pageKey((e.source && e.source.url) || SCOPE);
    const reply = msg => (e.ports && e.ports[0] ? e.ports[0] : e.source).postMessage({type: 'checked', ...msg});
    e.waitUntil(refreshPage(key)
      .then(x => reply({status: x.changed ? 'updated' : 'same', modified: x.res.headers.get('last-modified')}))
      .catch(() => reply({status: 'offline'})));
  }
});
