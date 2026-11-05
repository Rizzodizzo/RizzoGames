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
    /* the back button: a small Rizzo-blue "R" badge that slides open to "All games" when tapped */
    .rz-back{position:fixed;z-index:2147483000;display:inline-flex;align-items:center;height:38px;
      padding:0 9px;border-radius:999px;text-decoration:none;color:#fff;
      font:800 14px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.01em;white-space:nowrap;
      background:linear-gradient(180deg,#4f9bff,#1d4ed8);border:1.5px solid rgba(255,255,255,.35);
      box-shadow:0 3px 0 #0f2b7a,0 6px 16px rgba(37,99,235,.35);-webkit-tap-highlight-color:transparent;
      transition:opacity .25s,transform .15s,padding .3s cubic-bezier(.2,.8,.2,1)}
    .rz-r{width:18px;height:18px;flex-shrink:0;display:block}
    .rz-lbl{display:inline-flex;align-items:center;gap:3px;overflow:hidden;max-width:0;opacity:0;
      transition:max-width .3s cubic-bezier(.2,.8,.2,1),opacity .2s,margin .3s;margin-left:0}
    .rz-lbl svg{width:14px;height:14px;flex-shrink:0}
    .rz-back.rz-open{padding:0 14px 0 11px}
    .rz-back.rz-open .rz-lbl{max-width:120px;opacity:1;margin-left:8px}
    @media (hover:hover) and (pointer:fine){.rz-back:hover{padding:0 14px 0 11px}.rz-back:hover .rz-lbl{max-width:120px;opacity:1;margin-left:8px}}
    .rz-back:active{transform:translateY(2px);box-shadow:0 1px 0 #0f2b7a,0 4px 10px rgba(37,99,235,.3)}
    .rz-back:focus-visible{outline:3px solid #7cc8ff;outline-offset:3px}
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
    // the same chunky, slanted R as the app icon
    back.innerHTML = '<svg class="rz-r" viewBox="130 105 270 300" aria-hidden="true"><path transform="translate(256 256) skewX(-8) translate(-262 -256)" fill="#fff" stroke="#fff" stroke-width="14" stroke-linejoin="round" fill-rule="evenodd" d="M150 120H286C344 120 380 154 380 205C380 240 362 266 332 280L388 392H306L260 292H226V392H150Z M226 182V236H280C298 236 306 225 306 209C306 193 298 182 280 182Z"/></svg>' +
      '<span class="rz-lbl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>All games</span>';
    const [v, h] = corner;
    back.style[v === 'bottom' ? 'bottom' : 'top'] = `calc(env(safe-area-inset-${v === 'bottom' ? 'bottom' : 'top'},0px) + ${gap})`;
    if (h === 'center') { back.style.left = '50%'; back.style.translate = '-50% 0'; }
    else back.style[h === 'right' ? 'right' : 'left'] = `calc(env(safe-area-inset-${h === 'right' ? 'right' : 'left'},0px) + ${gap})`;
    document.body.appendChild(back);

    // On touch screens: the first tap opens it, a second tap leaves. It closes again by itself.
    let shutTimer = 0;
    const setOpen = on => {
      back.classList.toggle('rz-open', on);
      clearTimeout(shutTimer);
      if (on) shutTimer = setTimeout(() => back.classList.remove('rz-open'), 4000);
    };
    const hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches;
    back.addEventListener('click', e => {
      if (hoverable || back.classList.contains('rz-open')) return;   // already showing "All games": go
      e.preventDefault();
      setOpen(true);
    });
    addEventListener('pointerdown', e => { if (!back.contains(e.target)) setOpen(false); }, true);
    // The first few times, it opens briefly by itself so people learn what it is
    const shown = +(read('rz-back-intro') || 0);
    if (shown < 3) {
      store('rz-back-intro', shown + 1);
      setTimeout(() => { if (onMenu()) { setOpen(true); clearTimeout(shutTimer); shutTimer = setTimeout(() => setOpen(false), 2200); } }, 700);
    }
  }

  // Watch for the menu appearing and disappearing (shows/hides the button, and lets a waiting update in)
  let queued = false, waiting = false;
  const onChange = () => {
    queued = false;
    const menu = onMenu();
    if (back) { back.classList.toggle('rz-off', !menu); back.tabIndex = menu ? 0 : -1; if (!menu) back.classList.remove('rz-open'); }
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
