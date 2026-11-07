/* Rizzo Games service worker: one worker for the launcher and every game.
   - Every page (index.html, sudoku.html, ethereal-equus.html, ...) opens instantly from the saved copy, and
     GitHub is checked for a newer one at the same time. If there is one, the page is told, and games.js
     reloads into it (on the game's menu, so it never interrupts play). The very first visit uses the internet.
   - You never need to edit this file when you add a game or update one. The launcher tells it which game
     files exist, and it saves each one for offline play.
   - Games can ask "is there a newer version of me?" (Sudoku's update checks do this) and get an answer
     about their own page. */

const SCOPE = self.registration.scope;
const CACHE = 'rizzo-games:' + SCOPE;
const OLD_CACHES = ['sudoku-app:' + SCOPE];           // left behind by the old Sudoku-only worker
const SHELL = ['index.html', 'manifest.webmanifest', 'games.js', 'themes.js', 'cards.js', 'icon-192.png', 'icon-180.png', 'icon-512.png'];
// pages that have a newer version waiting, but no open window has been told yet
const pending = new Set();

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

// Tell the open windows showing this page that a newer version arrived
async function tellPages(key) {
  let told = 0;
  for (const c of await self.clients.matchAll({type: 'window', includeUncontrolled: true}))
    if (pageKey(c.url) === key) { c.postMessage({type: 'updated'}); told++; }
  if (told) pending.delete(key); else pending.add(key);   // nobody listening yet: say so at the next check
}

// The saved copy straight away (so switching games is instant), with a fresh copy fetched in the background
async function servePage(e) {
  const key = pageKey(e.request.url);
  const saved = await (await caches.open(CACHE)).match(key);
  const net = refreshPage(key);
  if (saved) {
    e.waitUntil(net.then(x => x.changed && tellPages(key)).catch(() => {}));
    return saved;
  }
  return net.then(x => x.res);                               // first visit: nothing saved yet
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(SCOPE)) return;
  if (isHtml(req)) { e.respondWith(servePage(e)); return; }
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
      .then(x => {
        const newer = x.changed || pending.has(key);   // also counts a newer copy found while the page was opening
        pending.delete(key);
        reply({status: newer ? 'updated' : 'same', modified: x.res.headers.get('last-modified')});
      })
      .catch(() => reply({status: 'offline'})));
  }
});
