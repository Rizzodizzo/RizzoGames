/* Rizzo Games: add this one line to a game, just before </body>, to plug it into the launcher:

     <script src="games.js" data-game="sudoku"></script>

   It gives the game:
     - a small "Games" button back to the launcher
     - automatic updates: whenever the game is opened, comes back from the background, gets its internet
       back, or every 30 minutes, it checks GitHub for a newer version and reloads into it by itself
     - offline play, and a note of when you last played (so the launcher puts your latest game first)

   Optional settings on the same tag:
     data-show-when="#home:not(.hidden)"   the game's menu. The back button only shows while this matches,
                                           and updates wait for it, so neither ever interrupts play
     data-corner="top-left"                where the button goes: top-left, top-center, top-right,
                                           bottom-left, bottom-center or bottom-right (default top-left)
     data-offset="12"                      gap from the screen edge in pixels (default 12)
     data-pill-top="12"                    how far down the update note sits (default 12)
     data-back="off"                       no back button (the launcher itself uses this)

   Optional hooks: a game can define window.RizzoHooks (any time, any of these) to fine-tune updates:
     loud()          return true to also show "Checking…" and "Up to date" notes, not just updates
     canReload()     return true when it's safe to reload right now (default: the menu is showing)
     beforeReload()  save anything first; whatever it returns is handed to afterReload after the reload
     afterReload(x)  runs once the new version has loaded, e.g. to put the player back in their game
   And it can call RizzoGames.check(true) for a "Check now" button, and listen for the 'rizzo:version'
   event (detail.modified = when the game file was last committed on GitHub).
*/
(() => {
  const tag = document.currentScript || document.querySelector('script[src$="games.js"]');
  const opt = (tag && tag.dataset) || {};
  const id = opt.game || location.pathname.split('/').pop().replace(/\.html$/, '') || 'game';
  const hook = name => { const h = window.RizzoHooks; return h && typeof h[name] === 'function' ? h[name] : null; };
  const onMenu = () => { if (!opt.showWhen) return true; try { return !!document.querySelector(opt.showWhen); } catch { return true; } };
  const store = (k, v) => { try { v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };
  const read = k => { try { return localStorage.getItem(k); } catch { return null; } };

  if (opt.back !== 'off') store('hub-last-' + id, Date.now());

  /* ---------- shared styles ---------- */
  const css = document.createElement('style');
  css.textContent = `
    .rz-back{position:fixed;z-index:2147483000;display:inline-flex;align-items:center;gap:5px;
      padding:7px 13px 7px 9px;border-radius:999px;text-decoration:none;
      font:700 14px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.01em;
      color:#fff;background:rgba(20,22,29,.72);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
      box-shadow:0 2px 10px rgba(0,0,0,.22);-webkit-tap-highlight-color:transparent;
      transition:opacity .2s,transform .15s}
    .rz-back svg{width:16px;height:16px}
    .rz-back:active{transform:scale(.94)}
    .rz-back:focus-visible{outline:3px solid #7cc8ff;outline-offset:2px}
    .rz-back.rz-off{opacity:0;pointer-events:none}
    .rz-pill{position:fixed;left:50%;z-index:2147483001;display:flex;align-items:center;gap:8px;
      width:max-content;max-width:calc(100% - 32px);padding:7px 14px 7px 11px;border-radius:999px;
      font:600 13px/1.25 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#fff;
      background:rgba(20,22,29,.82);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
      box-shadow:0 6px 18px rgba(0,0,0,.25);pointer-events:none;
      opacity:0;transform:translate(-50%,-14px);transition:opacity .25s,transform .3s cubic-bezier(.2,.8,.2,1)}
    .rz-pill.show{opacity:1;transform:translate(-50%,0)}
    .rz-pill i{width:14px;height:14px;flex-shrink:0;border-radius:50%;border:2px solid rgba(255,255,255,.3);
      border-top-color:#7cc8ff;animation:rzspin .8s linear infinite}
    .rz-pill.new i{border-top-color:#5fd38d}
    .rz-pill.ok i,.rz-pill.off i{border:0;animation:none;background:#5fd38d;position:relative}
    .rz-pill.ok i::after{content:"";position:absolute;left:4.5px;top:2px;width:4px;height:7px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}
    .rz-pill.off i{background:#8a90a0}
    @keyframes rzspin{to{transform:rotate(360deg)}}
    @media (prefers-reduced-motion:reduce){.rz-back,.rz-pill{transition:none}.rz-pill i{animation-duration:2.4s}}`;
  document.head.appendChild(css);

  /* ---------- back button ---------- */
  let back = null;
  if (opt.back !== 'off') {
    const corner = (opt.corner || 'top-left').split('-'), gap = (+opt.offset || 12) + 'px';
    back = document.createElement('a');
    back.className = 'rz-back';
    back.href = './';
    back.setAttribute('aria-label', 'Back to all games');
    back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>Games';
    const [v, h] = corner;
    back.style[v === 'bottom' ? 'bottom' : 'top'] = `calc(env(safe-area-inset-${v === 'bottom' ? 'bottom' : 'top'},0px) + ${gap})`;
    if (h === 'center') { back.style.left = '50%'; back.style.translate = '-50% 0'; }
    else back.style[h === 'right' ? 'right' : 'left'] = `calc(env(safe-area-inset-${h === 'right' ? 'right' : 'left'},0px) + ${gap})`;
    document.body.appendChild(back);
  }

  // Watch for the menu appearing and disappearing (shows/hides the button, and lets a waiting update in)
  let queued = false, waiting = false;
  const onChange = () => {
    queued = false;
    const menu = onMenu();
    if (back) { back.classList.toggle('rz-off', !menu); back.tabIndex = menu ? 0 : -1; }
    if (waiting) tryReload();
  };
  if (opt.showWhen) {
    new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(onChange); } })
      .observe(document.body, {subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'], childList: true});
    onChange();
  }

  /* ---------- update note ---------- */
  const pill = document.createElement('div');
  pill.className = 'rz-pill';
  pill.setAttribute('role', 'status');
  pill.setAttribute('aria-live', 'polite');
  pill.style.top = `calc(env(safe-area-inset-top,0px) + ${+opt.pillTop || 12}px)`;
  pill.innerHTML = '<i></i><span></span>';
  document.body.appendChild(pill);
  let pillTimer = 0;
  function note(text, kind, ms) {
    pill.lastChild.textContent = text;
    pill.className = 'rz-pill show ' + (kind || '');
    clearTimeout(pillTimer);
    if (ms) pillTimer = setTimeout(() => pill.classList.remove('show'), ms);
  }
  const loud = () => { const f = hook('loud'); try { return f ? !!f() : false; } catch { return false; } };
  const fmt = v => {
    const d = v && new Date(v);
    return d && !isNaN(d) ? d.toLocaleString(undefined, {day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'}) : null;
  };

  /* ---------- version: when this game's file was last committed ---------- */
  const VERSION_KEY = 'rz-version:' + id, JUST_KEY = 'rz-updated:' + id;
  const announce = v => dispatchEvent(new CustomEvent('rizzo:version', {detail: {modified: v, when: fmt(v)}}));
  announce(read(VERSION_KEY));

  /* ---------- reloading into a new version ---------- */
  let reloading = false;
  function canReload() {
    const f = hook('canReload');
    try { return f ? !!f() : onMenu(); } catch { return onMenu(); }
  }
  function tryReload() {
    if (!canReload()) {
      if (!waiting) {
        waiting = true;
        note('Update ready · it loads when you\'re back on the menu', 'new', 3500);
        const t = setInterval(() => { if (!waiting) clearInterval(t); else if (canReload()) { clearInterval(t); tryReload(); } }, 1000);
      }
      return;
    }
    waiting = false;
    let info = null;
    const f = hook('beforeReload');
    try { if (f) info = f(); } catch {}
    try { sessionStorage.setItem(JUST_KEY, JSON.stringify({info: info === undefined ? null : info})); } catch {}
    location.reload();
  }
  function onUpdate() {
    if (reloading) return;
    reloading = true;
    note('Update found · loading it now…', 'new');
    setTimeout(() => { tryReload(); if (waiting) reloading = false; }, 700);
  }
  // Just reloaded into a new version: let the game pick up where it was, and say so
  let justUpdated = false;
  try {
    const raw = sessionStorage.getItem(JUST_KEY);
    if (raw) {
      sessionStorage.removeItem(JUST_KEY);
      justUpdated = true;
      const f = hook('afterReload');
      if (f) try { f(JSON.parse(raw).info); } catch {}
      setTimeout(() => note('Updated to the newest version', 'ok', 2600), 300);
    }
  } catch {}

  /* ---------- checking GitHub for a newer version ---------- */
  const api = window.RizzoGames = {check: () => note('Updates only work on the hosted site', 'off', 2500)};
  if (!('serviceWorker' in navigator && location.protocol.startsWith('http'))) return;

  const sw = navigator.serviceWorker;
  const hadController = !!sw.controller;
  // the shared sw.js saves every game for offline play and does the actual checking
  sw.register('sw.js', {updateViaCache: 'none'}).catch(() => {});
  // a brand-new sw.js took over (e.g. after you commit a new one)
  sw.addEventListener('controllerchange', () => { if (hadController) onUpdate(); });
  // sw.js served the saved copy (slow or no internet), then found a newer one
  sw.addEventListener('message', e => { if (e.data && e.data.type === 'updated') onUpdate(); });

  let checking = false;
  api.check = manual => {
    if (checking || reloading) return;
    const say = manual || loud();
    sw.ready.then(reg => {
      reg.update().catch(() => {});
      if (!sw.controller) { if (manual) note('Not installed yet · open the game again', 'off', 2500); return; }
      checking = true;
      if (say) note('Checking for updates…', '');
      const ch = new MessageChannel();
      const giveUp = setTimeout(() => { checking = false; if (say) note('Couldn\'t check for updates', 'off', 2500); }, 10000);
      ch.port1.onmessage = e => {
        clearTimeout(giveUp); checking = false;
        const r = e.data || {};
        if (r.modified) { store(VERSION_KEY, r.modified); announce(r.modified); }
        const when = fmt(r.modified);
        if (r.status === 'updated') onUpdate();
        else if (!say) return;
        else if (r.status === 'same') note(when ? `Up to date · ${when}` : 'Up to date', 'ok', 2200);
        else note('Offline · playing the saved version', 'off', 2500);
      };
      sw.controller.postMessage({type: 'check'}, [ch.port2]);
    }).catch(() => {});
  };

  if (!justUpdated && hadController) setTimeout(() => api.check(false), 600);   // every time the game opens
  document.addEventListener('visibilitychange', () => { if (!document.hidden) api.check(false); });
  addEventListener('online', () => api.check(false));
  setInterval(() => { if (!document.hidden) api.check(false); }, 30 * 60 * 1000);   // left open for ages
})();
