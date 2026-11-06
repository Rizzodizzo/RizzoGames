/* ==========================================================================================
   Rizzo Games: the shared layer every game sits on.

   Add it to a game's <head> (it needs to load before the game's own code):

     <script src="games.js" data-game="sudoku" data-show-when="#home:not(.hidden)"></script>

   Every game then gets:
     - the Settings menu: a button in the top-left corner (or Esc on a computer) opens "All games", sound,
       reduce motion, updates and more. The button takes on the game's own look (see "Styling" below)
     - shared settings: volume, music, sound effects, mute, reduce motion and update notes are the same
       in every game, so you set them once
     - automatic updates: it checks GitHub for a newer version when the game opens, comes back from the
       background, gets its internet back, or every 30 minutes, and reloads into it by itself
     - offline play, and a note of when you last played (so the launcher puts your latest game first)
     - smooth moves: the launcher's card grows into the game, and the game shrinks back into its card
       (in browsers that support page transitions), with a splash screen in the game's colours while it loads

   Settings on the tag (all optional):
     data-show-when="#home:not(.hidden)"  the game's menu screen. Updates wait for it so they never cut into
                                          play, and the button sits lighter while it isn't showing
     data-hide-when=".panel.show"         hide the button while this matches (e.g. the game's own full-screen
                                          panels, so it never covers their back buttons)
     data-top="12" data-left="12"         where the button sits, in pixels from the top-left corner
     data-splash="#loader"                the game has its own loading screen: the launcher's card grows into
                                          that instead of the Rizzo splash (the Rizzo one is still used when
                                          leaving, to shrink back into the card)
     data-sounds="sfx"                    which sound sliders the game uses: "sfx", "music" or "sfx,music"
                                          (default "sfx,music")
     data-pill-top="12"                   how far down the update note sits, in pixels (default 12)
     data-back="off"                      no "All games" button (the launcher itself uses this)

   For game code:
     RizzoGames.settings      {volume, music, sfx, muted, reduceMotion, showUpdates}, volumes 0 to 1
     RizzoGames.level(kind)   the volume to actually play at: "sfx" or "music" (0 when muted)
     RizzoGames.onChange(fn)  fn(settings) runs whenever a shared setting changes
     RizzoGames.set({...})    change shared settings (e.g. a game's own mute button)
     RizzoGames.seed({...})   a game's old settings, used only the very first time (so players keep them)
     RizzoGames.openMenu()    open the Settings menu (e.g. from the game's own settings screen)
     RizzoGames.menuOpen      true while the menu is showing
     RizzoGames.check(true)   check for an update now
     <html> gets the class "rz-reduce-motion" while reduce motion is on
     RizzoGames.device        {touch, phone, tablet, ios, standalone}: what the player is using
                              touch = a touch screen with no mouse (phones and tablets); phone = a touch screen
                              whose short side is under 600px. <html> also gets "rz-touch" / "rz-phone" classes.

   Styling: a game can give the menu button (and the label that slides out of it) its own look by setting
   any of these CSS variables on :root. Each has a Rizzo-blue default. The menu itself always stays Rizzo blue.
     --rz-btn-bg, --rz-btn-fg, --rz-btn-border, --rz-btn-radius, --rz-btn-shadow, --rz-btn-size
   The splash screen uses the button's colours too, unless --rz-splash-bg / --rz-splash-fg are set.

   Optional hooks: define window.RizzoHooks with any of these, at any time:
     onMenuOpen() / onMenuClose()  e.g. pause the game while the menu is up
     leaveWarning()                return a sentence to warn before "All games" (e.g. mid-race), or nothing
     previewSound(kind)            play a short sound when a slider is let go, so players hear the level
     canReload()                   return true when it's safe to reload into an update (default: on the menu)
     beforeReload()                save first; whatever it returns is handed to afterReload
     afterReload(x)                runs once the new version has loaded, e.g. to put the player back in
     loud()                        return true to always show "Checking…" / "Up to date" notes
   ========================================================================================== */
(() => {
  const tag = document.currentScript || document.querySelector('script[src$="games.js"]');
  const opt = (tag && tag.dataset) || {};
  const id = opt.game || location.pathname.split('/').pop().replace(/\.html$/, '') || 'game';
  const isHub = opt.back === 'off';
  const sounds = (opt.sounds || 'sfx,music').split(',').map(s => s.trim());
  const hook = name => { const h = window.RizzoHooks; return h && typeof h[name] === 'function' ? h[name] : null; };
  const call = (name, ...a) => { const f = hook(name); if (f) try { return f(...a); } catch (e) { console.error(e); } };
  const store = (k, v) => { try { v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };
  const read = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const onMenu = () => { if (!opt.showWhen) return true; try { return !!document.querySelector(opt.showWhen); } catch { return true; } };
  const fmt = v => {
    const d = v && new Date(v);
    return d && !isNaN(d) ? d.toLocaleString(undefined, {day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'}) : null;
  };

  if (!isHub) store('hub-last-' + id, Date.now());
  if (isHub) document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (a && a.origin === location.origin && !e.defaultPrevented) try { sessionStorage.setItem('rz-from-hub', Date.now()); } catch {}
  }, true);
  // the same chunky slanted R as the app icon, drawn in the current text colour
  const R_PLAIN = '<svg viewBox="130 105 270 300" aria-hidden="true"><path transform="translate(256 256) skewX(-8) translate(-262 -256)" fill="currentColor" stroke="currentColor" stroke-width="14" stroke-linejoin="round" fill-rule="evenodd" d="M150 120H286C344 120 380 154 380 205C380 240 362 266 332 280L388 392H306L260 292H226V392H150Z M226 182V236H280C298 236 306 225 306 209C306 193 298 182 280 182Z"/></svg>';

  /* ======================= shared settings ======================= */
  const SKEY = 'rz-settings';
  const DEFAULTS = {volume: 0.8, music: 0.7, sfx: 0.9, muted: false, reduceMotion: false, showUpdates: false};
  const KEYS = Object.keys(DEFAULTS);
  const clean = v => {
    const out = {};
    for (const k of KEYS) if (v && k in v) {
      out[k] = typeof DEFAULTS[k] === 'boolean' ? !!v[k] : Math.max(0, Math.min(1, +v[k] || 0));
    }
    return out;
  };
  let syncMenu = () => {}, openMenu = () => {}, closeMenu = () => {};   // filled in once the page is ready
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(SKEY)); } catch {}
  const settings = Object.assign({}, DEFAULTS, clean(saved));
  const listeners = [];
  const persist = () => { store(SKEY, JSON.stringify(settings)); saved = settings; };
  const applyMotion = () => document.documentElement.classList.toggle('rz-reduce-motion', !!settings.reduceMotion);
  function emit() {
    applyMotion();
    for (const fn of listeners) try { fn(settings); } catch (e) { console.error(e); }
    dispatchEvent(new CustomEvent('rizzo:settings', {detail: settings}));
    syncMenu();
  }
  applyMotion();

  /* ======================= smooth moves between the launcher and the games ======================= */
  // Page transitions: the launcher's card for this game and the game's splash share a name, so the browser
  // grows one into the other (and back again). Everything else cross-fades. Reduce motion makes it instant.
  const card = 'rz-card-' + String(id).replace(/[^\w-]/g, '');
  const early = document.createElement('style');
  early.textContent = `
/* no iPhone rubber-band bounce that shows what's underneath the page */
html,body{overscroll-behavior:none}
/* no zooming in when you tap quickly (double or triple taps). Pinching to zoom still works, and anything that
   sets its own touch-action (swipe areas, the race track) keeps it, since this is the weakest possible rule */
*{touch-action:manipulation}
@view-transition{navigation:auto}
::view-transition-group(*){animation-duration:.42s;animation-timing-function:cubic-bezier(.2,.8,.2,1)}
::view-transition-old(root),::view-transition-new(root){animation-duration:.3s}
:root.rz-reduce-motion::view-transition-group(*),:root.rz-reduce-motion::view-transition-old(*),:root.rz-reduce-motion::view-transition-new(*){animation:none}
.rz-splash{position:fixed;inset:0;z-index:2147483005;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
  padding:24px;text-align:center;background:#0b0f22;color:var(--rz-splash-fg,var(--rz-btn-fg,#fff));
  font:800 clamp(22px,6.5vw,34px)/1.15 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.01em;
  view-transition-name:${card};transition:opacity .35s ease}
.rz-splash::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--rz-splash-bg,var(--rz-btn-bg,linear-gradient(180deg,#1d3a8a,#0b1640)))}
.rz-splash>*{position:relative}
.rz-splash svg{width:62px;height:68px}
.rz-splash span{max-width:16em}
.rz-splash i{display:flex;gap:7px;margin-top:4px}
.rz-splash i b{width:8px;height:8px;border-radius:50%;background:currentColor;opacity:.3;animation:rzdot 1s ease-in-out infinite}
.rz-splash i b:nth-child(2){animation-delay:.15s}
.rz-splash i b:nth-child(3){animation-delay:.3s}
@keyframes rzdot{50%{opacity:1;transform:translateY(-4px)}}
.rz-splash.rz-gone{opacity:0;pointer-events:none}
.rz-splash.rz-now{transition:none}
:root.rz-reduce-motion .rz-splash{transition:none}
:root.rz-reduce-motion .rz-splash i b{animation:none;opacity:.7}`;
  if (opt.splash) early.textContent += `\n${opt.splash}{view-transition-name:${card}}`;
  document.head.appendChild(early);
  // arriving with a page transition: the launcher skips its own card slide-in so the two don't fight
  // and the splash stays up until the zoom has finished, or it would fade out halfway through it
  let vtDone = null;
  addEventListener('pagereveal', e => {
    if (!e.viewTransition) return;
    document.documentElement.classList.add('rz-vt');
    vtDone = e.viewTransition.finished.catch(() => {});
  });

  // The splash: shows the moment the game starts loading, and fades away once the game has drawn itself
  let splash = null;
  const showSplash = () => {
    if (!splash) return;
    // the game's own loading screen (if it's somehow still up) hands the name back, so only one thing has it
    if (opt.splash) try { document.querySelectorAll(opt.splash).forEach(el => { el.style.viewTransitionName = 'none'; }); } catch {}
    splash.classList.add('rz-now');
    splash.style.display = '';
    splash.classList.remove('rz-gone');
  };
  const hideSplash = () => {
    if (!splash || splash.classList.contains('rz-gone')) return;
    splash.classList.remove('rz-now');
    splash.classList.add('rz-gone');
    setTimeout(() => { if (splash.classList.contains('rz-gone')) splash.style.display = 'none'; }, 400);
  };
  if (!isHub) {
    splash = document.createElement('div');
    splash.className = 'rz-splash';
    splash.setAttribute('aria-hidden', 'true');
    const title = (opt.name || document.title || '').trim().replace(/[&<>"]/g, '');
    splash.innerHTML = R_PLAIN + (title ? `<span>${title}</span>` : '') + '<i><b></b><b></b><b></b></i>';
    document.documentElement.appendChild(splash);
    if (opt.splash) { splash.classList.add('rz-gone'); splash.style.display = 'none'; }   // the game shows its own while loading
    // Arriving from the launcher, the card is zooming into this splash. Keep it up until the zoom is over:
    // some browsers (Safari) don't say when it ends, so it also stays for at least the zoom's length.
    let fromHub = false;
    try { fromHub = Date.now() - (+sessionStorage.getItem('rz-from-hub') || 0) < 5000; sessionStorage.removeItem('rz-from-hub'); } catch {}
    const ZOOM_MS = 650;
    const ready = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      if (vtDone) vtDone.then(hideSplash);
      else if (fromHub && !settings.reduceMotion) setTimeout(hideSplash, Math.max(0, ZOOM_MS - performance.now()));
      else hideSplash();
    }));
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once: true}); else ready();
    setTimeout(hideSplash, 3000);                                        // never longer than this
    addEventListener('pageshow', e => { if (e.persisted) hideSplash(); });   // coming back with the browser's back button
  }

  // another tab or game window changed a setting
  addEventListener('storage', e => {
    if (e.key !== SKEY) return;
    try { Object.assign(settings, DEFAULTS, clean(JSON.parse(e.newValue))); } catch {}
    emit();
  });

  // What the player is using: a phone or tablet (touch, no mouse) or a computer
  const device = (() => {
    const mm = q => !!(window.matchMedia && matchMedia(q).matches);
    const touch = mm('(hover: none) and (pointer: coarse)') || (navigator.maxTouchPoints > 0 && !mm('(pointer: fine)'));
    const short = Math.min(screen.width || innerWidth, screen.height || innerHeight);
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = mm('(display-mode: standalone)') || navigator.standalone === true;
    return {touch, phone: touch && short < 600, tablet: touch && short >= 600, ios, standalone};
  })();
  // iPhone Safari can leave a locked page scrolled a little after the phone is turned: it still looks right,
  // but every tap lands lower than the button you see. After each turn or resize, snap everything back.
  // Only for pages that are locked in place (a game screen). A page you can scroll, like the launcher, is left
  // alone, and it only happens when the phone actually turns, not when Safari's address bar grows or shrinks.
  const locked = () => {
    try {
      const h = getComputedStyle(document.documentElement), b = getComputedStyle(document.body);
      return h.overflowY === 'hidden' || b.position === 'fixed' || (b.overflowY === 'hidden' && h.overflowY !== 'auto');
    } catch { return false; }
  };
  const unshift = () => {
    if (!locked()) return;
    try {
      if (scrollX || scrollY) scrollTo(0, 0);
      const se = document.scrollingElement || document.documentElement;
      if (se.scrollTop || se.scrollLeft) { se.scrollTop = 0; se.scrollLeft = 0; }
    } catch {}
  };
  let wasWide = innerWidth > innerHeight;
  const turned = () => {
    const wide = innerWidth > innerHeight;
    if (wide === wasWide) return;
    wasWide = wide;
    unshift(); requestAnimationFrame(unshift); setTimeout(unshift, 120); setTimeout(unshift, 450);
  };
  addEventListener('orientationchange', () => setTimeout(turned, 50));
  addEventListener('resize', turned);
  document.documentElement.classList.toggle('rz-touch', device.touch);
  document.documentElement.classList.toggle('rz-phone', device.phone);

  const api = window.RizzoGames = {
    settings,
    device,
    menuOpen: false,
    level: kind => settings.muted ? 0 : settings.volume * (kind === 'music' ? settings.music : kind === 'sfx' ? settings.sfx : 1),
    onChange(fn) { if (typeof fn === 'function') listeners.push(fn); },
    set(v) { Object.assign(settings, clean(v)); persist(); emit(); },
    seed(v) { if (saved) return; Object.assign(settings, clean(v)); persist(); emit(); },
    openMenu: () => openMenu(),
    closeMenu: () => closeMenu(),
    check: () => {},
  };

  /* ======================= everything on screen waits for the page ======================= */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 0);

  function init() {
    /* ---------- styles ---------- */
    const css = document.createElement('style');
    css.textContent = `
.rz-ui{--rz-bg:#f4f7fd;--rz-card:#fff;--rz-ink:#121a33;--rz-muted:#5f6b88;--rz-line:#dde5f4;--rz-blue:#2563eb;--rz-soft:#e8eefb;
  color:var(--rz-ink);font:15px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:normal;text-align:left;text-transform:none;font-style:normal}
@media (prefers-color-scheme:dark){.rz-ui{--rz-bg:#0f1528;--rz-card:#161e36;--rz-ink:#e8eeff;--rz-muted:#93a0c2;--rz-line:#26304f;--rz-blue:#6aa6ff;--rz-soft:#1f2946}}
.rz-ui *{box-sizing:border-box}
/* the menu button (games restyle it with the --rz-btn-* variables). Every rule is prefixed with .rz-ui so a game's
   own button styles (like a "pressed" nudge) can't move or reshape it */
.rz-ui .rz-corner{position:fixed;z-index:2147483000;display:block;transition:opacity .25s,visibility .25s}
.rz-ui .rz-corner.rz-quiet{opacity:.55}
.rz-ui .rz-corner.rz-quiet:hover,.rz-ui .rz-corner.rz-quiet:focus-within,.rz-ui .rz-corner.rz-quiet.rz-intro{opacity:1}
.rz-ui .rz-corner.rz-hide{opacity:0;visibility:hidden;pointer-events:none}
.rz-ui .rz-mbtn{position:relative;z-index:2;width:var(--rz-btn-size,42px);height:var(--rz-btn-size,42px);margin:0;padding:0;
  display:flex;align-items:center;justify-content:center;cursor:pointer;font:inherit;line-height:1;
  background:var(--rz-btn-bg,linear-gradient(180deg,#4f9bff,#1d4ed8));color:var(--rz-btn-fg,#fff);
  border:var(--rz-btn-border,1.5px solid rgba(255,255,255,.4));border-radius:var(--rz-btn-radius,13px);
  box-shadow:var(--rz-btn-shadow,0 3px 0 #0f2b7a,0 6px 16px rgba(37,99,235,.35));
  transform:none;translate:none;-webkit-tap-highlight-color:transparent;transition:filter .15s}
.rz-ui .rz-mbtn svg{width:54%;height:54%;display:block;pointer-events:none}
.rz-ui .rz-mbtn:hover{filter:brightness(1.08)}
.rz-ui .rz-mbtn:active{transform:none;translate:none;filter:brightness(.9)}
.rz-ui .rz-mbtn:focus-visible{outline:3px solid #7cc8ff;outline-offset:3px}
.rz-ui .rz-mbtn.rz-pulse{animation:rzpulse 1.4s ease-in-out 3}
@keyframes rzpulse{50%{box-shadow:var(--rz-btn-shadow,0 3px 0 #0f2b7a,0 6px 16px rgba(37,99,235,.35)),0 0 0 7px rgba(124,200,255,.45)}}
/* the label that slides out from behind the button: same colours, edge and corners as the button */
.rz-ui .rz-fly{position:absolute;z-index:1;top:0;left:calc(var(--rz-btn-size,42px) / 2);height:var(--rz-btn-size,42px);box-sizing:border-box;
  display:flex;align-items:center;gap:7px;white-space:nowrap;cursor:pointer;
  padding:0 15px 0 calc(var(--rz-btn-size,42px) / 2 + 11px);
  background:var(--rz-btn-bg,linear-gradient(180deg,#4f9bff,#1d4ed8));color:var(--rz-btn-fg,#fff);
  border:var(--rz-btn-border,1.5px solid rgba(255,255,255,.4));border-radius:var(--rz-btn-radius,13px);
  box-shadow:var(--rz-btn-shadow,0 3px 0 #0f2b7a,0 6px 16px rgba(37,99,235,.35));
  font:700 14px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.01em;
  clip-path:inset(-12px 100% -12px 0);opacity:0;pointer-events:none;
  transition:clip-path .32s cubic-bezier(.2,.8,.2,1),opacity .2s}
.rz-ui .rz-fly kbd{font:inherit;font-size:11.5px;font-weight:800;padding:3px 6px;border-radius:5px;background:color-mix(in srgb,currentColor 18%,transparent)}
.rz-ui .rz-corner.rz-intro .rz-fly,.rz-ui .rz-corner:has(.rz-mbtn:focus-visible) .rz-fly{clip-path:inset(-12px -24px -12px 0);opacity:1;pointer-events:auto}
@media (hover:hover) and (pointer:fine){
  .rz-ui .rz-corner:hover .rz-fly{clip-path:inset(-12px -24px -12px 0);opacity:1;pointer-events:auto}
}
/* the menu */
.rz-scrim{position:fixed;inset:0;z-index:2147483002;background:rgba(5,9,24,.5);opacity:0;pointer-events:none;transition:opacity .25s}
.rz-scrim.rz-show{opacity:1;pointer-events:auto}
.rz-sheet{position:fixed;left:50%;bottom:0;z-index:2147483003;width:min(480px,100%);max-height:88vh;max-height:88dvh;overflow-y:auto;overscroll-behavior:contain;
  background:var(--rz-bg);border-radius:22px 22px 0 0;box-shadow:0 -12px 40px rgba(0,0,0,.3);
  padding:6px 16px calc(env(safe-area-inset-bottom,0px) + 18px);transform:translate(-50%,105%);visibility:hidden;
  transition:transform .32s cubic-bezier(.2,.8,.2,1),visibility 0s .32s}
.rz-sheet.rz-show{transform:translate(-50%,0);visibility:visible;transition:transform .32s cubic-bezier(.2,.8,.2,1),visibility 0s}
.rz-sheet.rz-drag{transition:none}
.rz-sheet{scrollbar-width:thin;scrollbar-color:var(--rz-line) transparent}
.rz-sheet::-webkit-scrollbar{width:8px}
.rz-sheet::-webkit-scrollbar-track{background:transparent}
.rz-sheet::-webkit-scrollbar-thumb{background:var(--rz-line);border-radius:4px;border:2px solid var(--rz-bg)}
.rz-grab{width:42px;height:5px;border-radius:3px;background:var(--rz-line);margin:6px auto 12px}
.rz-head{display:flex;align-items:center;gap:12px;margin:0 2px 14px}
.rz-badge{width:44px;height:44px;flex-shrink:0;border-radius:12px;background:linear-gradient(160deg,#16245e,#070d26);
  display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(37,99,235,.35)}
.rz-badge svg{width:24px;height:26px}
.rz-head b{display:block;font-size:17px;font-weight:800}
.rz-head small{display:block;color:var(--rz-muted);font-size:13px;margin-top:1px}
.rz-ui .rz-x{margin-left:auto;width:36px;height:36px;flex-shrink:0;border-radius:50%;border:0;background:var(--rz-soft);color:var(--rz-ink);
  display:flex;align-items:center;justify-content:center;cursor:pointer}
.rz-x svg{width:16px;height:16px}
.rz-ui .rz-leave{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:13px;border-radius:14px;border:0;margin:0;
  background:linear-gradient(180deg,#4f9bff,#1d4ed8);color:#fff;font-weight:800;font-size:16px;text-decoration:none;
  box-shadow:0 3px 0 #0f2b7a,0 8px 18px rgba(37,99,235,.3);transform:none;translate:none;-webkit-tap-highlight-color:transparent}
.rz-ui .rz-leave svg{width:17px;height:17px}
.rz-ui .rz-leave:active{transform:none;translate:0 2px;box-shadow:0 1px 0 #0f2b7a}
.rz-ui .rz-leave.rz-armed{background:linear-gradient(180deg,#ff7a5c,#d93b2b);color:#fff;box-shadow:0 3px 0 #7a1d12}
.rz-warn{margin:8px 4px 0;color:#d93b2b;font-size:13.5px;font-weight:600}
.rz-warn:empty{display:none}
.rz-ui h3{margin:20px 4px 8px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--rz-muted)}
.rz-card{background:var(--rz-card);border:1px solid var(--rz-line);border-radius:14px;padding:0 14px}
.rz-row{display:flex;align-items:center;gap:12px;min-height:50px;padding:6px 0;border-bottom:1px solid var(--rz-line)}
.rz-row:last-child{border-bottom:0}
.rz-row .rz-l{flex:1;min-width:0;font-weight:600}
.rz-row small{display:block;color:var(--rz-muted);font-size:12.5px;font-weight:400;margin-top:1px}
.rz-row.rz-slide .rz-l{flex:0 0 96px}
.rz-row input[type=range]{flex:1;min-width:0;margin:0;accent-color:var(--rz-blue);height:28px}
.rz-row output{flex:0 0 40px;text-align:right;font-variant-numeric:tabular-nums;color:var(--rz-muted);font-weight:700;font-size:13px}
.rz-row.rz-dim{opacity:.45}
.rz-ui .rz-sw{appearance:none;-webkit-appearance:none;flex-shrink:0;width:48px;height:29px;margin:0;border-radius:15px;background:var(--rz-line);position:relative;cursor:pointer;transition:background-color .2s}
.rz-ui .rz-sw::after{content:"";position:absolute;top:3px;left:3px;width:23px;height:23px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s cubic-bezier(.2,.8,.2,1)}
.rz-ui .rz-sw:checked{background:var(--rz-blue)}
.rz-ui .rz-sw:checked::after{transform:translateX(19px)}
.rz-sw:focus-visible,.rz-btn:focus-visible,.rz-x:focus-visible,.rz-leave:focus-visible{outline:3px solid #7cc8ff;outline-offset:2px}
.rz-ui .rz-btn{flex-shrink:0;border:0;border-radius:10px;padding:8px 13px;background:var(--rz-soft);color:var(--rz-ink);font:inherit;font-weight:700;font-size:14px;cursor:pointer}
.rz-ui .rz-btn:active{transform:none;translate:0 1px}
.rz-foot{margin:16px 4px 0;color:var(--rz-muted);font-size:12.5px;text-align:center}
/* update note */
.rz-pill{position:fixed;left:50%;z-index:2147483004;display:flex;align-items:center;gap:8px;width:max-content;max-width:calc(100% - 32px);
  padding:7px 14px 7px 11px;border-radius:999px;font:600 13px/1.25 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#fff;
  background:rgba(20,22,29,.85);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 6px 18px rgba(0,0,0,.25);
  pointer-events:none;opacity:0;transform:translate(-50%,-14px);transition:opacity .25s,transform .3s cubic-bezier(.2,.8,.2,1)}
.rz-pill.show{opacity:1;transform:translate(-50%,0)}
.rz-pill i{width:14px;height:14px;flex-shrink:0;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#7cc8ff;animation:rzspin .8s linear infinite}
.rz-pill.new i{border-top-color:#5fd38d}
.rz-pill.ok i,.rz-pill.off i{border:0;animation:none;background:#5fd38d;position:relative}
.rz-pill.ok i::after{content:"";position:absolute;left:4.5px;top:2px;width:4px;height:7px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}
.rz-pill.off i{background:#8a90a0}
@keyframes rzspin{to{transform:rotate(360deg)}}
html.rz-reduce-motion .rz-sheet,html.rz-reduce-motion .rz-scrim,html.rz-reduce-motion .rz-pill,html.rz-reduce-motion .rz-ui .rz-fly,html.rz-reduce-motion .rz-ui .rz-corner,html.rz-reduce-motion .rz-sw::after{transition:none}
html.rz-reduce-motion .rz-pill i{animation-duration:2.4s}
html.rz-reduce-motion .rz-ui .rz-mbtn.rz-pulse{animation:none}`;
    document.head.appendChild(css);

    const R_SVG = '<svg viewBox="130 105 270 300" aria-hidden="true"><defs><linearGradient id="rzR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c6f0ff"/><stop offset=".46" stop-color="#5aa8ff"/><stop offset=".54" stop-color="#1d4ed8"/><stop offset="1" stop-color="#3f86ff"/></linearGradient></defs><path transform="translate(256 256) skewX(-8) translate(-262 -256)" fill="url(#rzR)" stroke="url(#rzR)" stroke-width="14" stroke-linejoin="round" fill-rule="evenodd" d="M150 120H286C344 120 380 154 380 205C380 240 362 266 332 280L388 392H306L260 292H226V392H150Z M226 182V236H280C298 236 306 225 306 209C306 193 298 182 280 182Z"/></svg>';
    const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
    const CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    const gameName = (opt.name || document.title || 'Game').trim();
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const mouse = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
    const standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    const slider = (key, label) => `<label class="rz-row rz-slide" data-row="${key}"><span class="rz-l">${label}</span>
      <input type="range" min="0" max="100" step="5" data-k="${key}" aria-label="${label}"><output></output></label>`;

    /* ---------- the menu button, a first-time tip, and the menu ---------- */
    const ui = document.createElement('div');
    ui.className = 'rz-ui';
    ui.innerHTML = `
<div class="rz-corner"><span class="rz-fly" aria-hidden="true"></span><button class="rz-mbtn" type="button" aria-label="Settings menu${mouse ? ' (Esc)' : ''}" aria-haspopup="dialog" aria-expanded="false">${R_PLAIN}</button></div>
<div class="rz-scrim"></div>
<div class="rz-sheet" role="dialog" aria-modal="true" aria-label="Settings menu" tabindex="-1">
  <div class="rz-grab"></div>
  <div class="rz-head"><span class="rz-badge">${R_SVG}</span>
    <span><b>Settings</b><small>${isHub ? 'Every game' : gameName.replace(/[&<>"]/g, '')}</small></span>
    <button class="rz-x" type="button" aria-label="Close menu">${CLOSE}</button></div>
  ${isHub ? '' : `<a class="rz-leave" href="./">${ARROW}<span>All games</span></a><p class="rz-warn" aria-live="polite"></p>`}
  <h3>Sound</h3>
  <div class="rz-card">
    <label class="rz-row"><span class="rz-l">Sound</span><input type="checkbox" class="rz-sw" data-k="sound" aria-label="Sound on"></label>
    ${slider('volume', 'Volume')}${slider('music', 'Music')}${slider('sfx', 'Effects')}
  </div>
  <h3>Motion</h3>
  <div class="rz-card">
    <label class="rz-row"><span class="rz-l">Reduce motion<small>Fewer animations</small></span><input type="checkbox" class="rz-sw" data-k="reduceMotion"></label>
  </div>
  <h3>Updates</h3>
  <div class="rz-card">
    <label class="rz-row"><span class="rz-l">Show update checks<small>A note when checking for updates</small></span><input type="checkbox" class="rz-sw" data-k="showUpdates"></label>
    <div class="rz-row"><span class="rz-l">Version<small class="rz-ver">Not checked yet</small></span><button class="rz-btn" type="button" data-act="check">Check now</button></div>
    <div class="rz-row"><span class="rz-l">Reload<small>Restart, keeping your progress</small></span><button class="rz-btn" type="button" data-act="reload">Reload</button></div>
  </div>
  <h3>More</h3>
  <div class="rz-card">
    <div class="rz-row"><span class="rz-l">Share Rizzo Games<small class="rz-shared">Send to a friend</small></span><button class="rz-btn" type="button" data-act="share">Share</button></div>
    ${standalone ? '' : `<div class="rz-row"><span class="rz-l">Play as an app<small>${ios ? '<b>Share</b> → <b>Add to Home Screen</b>' : 'Browser menu → <b>Install app</b>'}</small></span></div>`}
  </div>
  <p class="rz-foot">Applies to every game</p>
</div>`;
    document.body.appendChild(ui);
    const $ = s => ui.querySelector(s);
    const btn = $('.rz-mbtn'), corner = $('.rz-corner'), fly = $('.rz-fly'), sheet = $('.rz-sheet'), scrim = $('.rz-scrim');
    const leave = $('.rz-leave'), warn = $('.rz-warn');
    corner.style.top = `calc(env(safe-area-inset-top,0px) + ${+opt.top || 12}px)`;
    corner.style.left = `calc(env(safe-area-inset-left,0px) + ${+opt.left || 12}px)`;
    // the label that slides out: on a computer when the mouse is over the button, on a phone as a first-time tip
    const label = (text, key) => { fly.innerHTML = text + (key ? `<kbd>${key}</kbd>` : ''); };
    if (mouse) label('Settings menu', 'Esc'); else label('Settings menu');
    fly.addEventListener('click', () => openMenu());

    // the music slider only appears active in games that have music (and likewise for effects)
    for (const k of ['music', 'sfx']) if (!sounds.includes(k)) {
      const row = $(`[data-row="${k}"]`);
      row.classList.add('rz-dim');
      row.querySelector('input').disabled = true;
      row.querySelector('.rz-l').innerHTML += `<small>Not used here</small>`;
    }

    /* ---------- keep the menu showing the current settings ---------- */
    syncMenu = () => {
      ui.querySelectorAll('input[data-k]').forEach(el => {
        const k = el.dataset.k;
        if (el.type === 'checkbox') el.checked = k === 'sound' ? !settings.muted : !!settings[k];
        else { el.value = Math.round(settings[k] * 100); el.nextElementSibling.textContent = el.value + '%'; }
      });
      ui.querySelectorAll('.rz-slide').forEach(row => {
        if (!row.querySelector('input').disabled) row.style.opacity = settings.muted ? '.5' : '';
      });
    };
    syncMenu();
    ui.addEventListener('input', e => {
      const el = e.target, k = el.dataset && el.dataset.k;
      if (!k) return;
      if (el.type === 'checkbox') api.set(k === 'sound' ? {muted: !el.checked} : {[k]: el.checked});
      else { el.nextElementSibling.textContent = el.value + '%'; api.set({[k]: el.value / 100}); }
    });
    ui.addEventListener('change', e => {
      const k = e.target.dataset && e.target.dataset.k;
      if (k === 'volume' || k === 'sfx' || k === 'music' || (k === 'sound' && e.target.checked)) call('previewSound', k === 'music' ? 'music' : 'sfx');
    });

    /* ---------- opening and closing ---------- */
    let lastFocus = null, armed = false;
    openMenu = () => {
      if (api.menuOpen) return;
      api.menuOpen = true;
      lastFocus = document.activeElement;
      if (lastFocus && lastFocus.blur) lastFocus.blur();
      syncMenu();
      sheet.scrollTop = 0;
      sheet.classList.add('rz-show'); scrim.classList.add('rz-show');
      btn.setAttribute('aria-expanded', 'true');
      btn.classList.remove('rz-pulse');
      corner.classList.remove('rz-intro');
      store('rz-menu-intro', '9');                       // they've found it: no more tips
      setTimeout(() => sheet.focus({preventScroll: true}), 50);
      call('onMenuOpen');
    };
    closeMenu = () => {
      if (!api.menuOpen) return;
      api.menuOpen = false;
      sheet.classList.remove('rz-show', 'rz-drag'); scrim.classList.remove('rz-show');
      sheet.style.transform = '';
      btn.setAttribute('aria-expanded', 'false');
      disarm();
      call('onMenuClose');
    };
    function disarm() {
      armed = false;
      if (leave) { leave.classList.remove('rz-armed'); leave.lastChild.textContent = 'All games'; warn.textContent = ''; }
    }
    btn.addEventListener('click', openMenu);
    scrim.addEventListener('click', closeMenu);
    $('.rz-x').addEventListener('click', closeMenu);
    // While the menu is open it gets the keyboard: Escape closes it, and the game doesn't see key presses
    addEventListener('keydown', e => {
      if (!api.menuOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
      if (e.key !== 'Tab') e.stopPropagation();
    }, true);
    addEventListener('keyup', e => { if (api.menuOpen) e.stopPropagation(); }, true);

    // On a computer, Escape also opens the menu, but only when the game itself didn't use the key
    // (both games use Escape to close their own panels or pause a race, and they keep that).
    // It watches whether the game changed anything on screen while handling the key press.
    let seen = [];
    const keyWatch = new MutationObserver(r => { if (escBefore) seen.push(...r); });
    keyWatch.observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden', 'style', 'open']});
    let escBefore = false;
    addEventListener('keydown', e => {
      escBefore = e.key === 'Escape' && !api.menuOpen && !e.repeat;
      if (escBefore) { keyWatch.takeRecords(); seen = []; }  // forget anything that happened before this key press
    }, true);
    addEventListener('keydown', e => {
      if (!escBefore || api.menuOpen) return;
      escBefore = false;
      const changes = seen.concat(keyWatch.takeRecords());
      seen = [];
      const gameUsedIt = e.defaultPrevented || changes.some(r => !ui.contains(r.target));
      if (!gameUsedIt) { e.preventDefault(); openMenu(); }
    });


    /* ---------- "All games", with a warning first if the game wants one ---------- */
    if (leave) leave.addEventListener('click', e => {
      const w = call('leaveWarning');
      if (w && !armed) {
        e.preventDefault();
        armed = true;
        warn.textContent = String(w);
        leave.classList.add('rz-armed');
        leave.lastChild.textContent = 'Leave anyway';
        return;
      }
      if (!e.defaultPrevented) {
        // the menu goes at once (not sliding away) so it isn't seen during the shrink, then the splash shrinks into the card
        for (const el of [sheet, scrim]) { el.style.transition = 'none'; el.classList.remove('rz-show'); }
        showSplash();
      }
    });

    /* ---------- menu buttons ---------- */
    ui.addEventListener('click', async e => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'check') { closeMenu(); api.check(true); }
      if (act === 'reload') reloadNow(false);
      if (act === 'share') {
        const url = new URL('./', location.href).href, note = $('.rz-shared');
        try {
          if (navigator.share) await navigator.share({title: 'Rizzo Games', text: 'Come play Rizzo Games with me!', url});
          else { await navigator.clipboard.writeText(url); note.textContent = 'Link copied!'; }
        } catch {}
      }
    });

    /* ---------- swiping down on the menu closes it ---------- */

    let dz = null;
    sheet.addEventListener('touchstart', e => {
      dz = null;
      if (e.touches.length !== 1 || sheet.scrollTop > 0 || e.target.closest('input[type=range]')) return;
      dz = {y: e.touches[0].clientY, t: Date.now(), dy: 0, on: false};
    }, {passive: true});
    sheet.addEventListener('touchmove', e => {
      if (!dz) return;
      const dy = e.touches[0].clientY - dz.y;
      if (!dz.on) { if (dy > 8) { dz.on = true; sheet.classList.add('rz-drag'); } else if (dy < -8) { dz = null; return; } else return; }
      e.preventDefault();
      dz.dy = Math.max(0, dy);
      sheet.style.transform = `translate(-50%,${dz.dy}px)`;
    }, {passive: false});
    const dragEnd = () => {
      if (!dz || !dz.on) { dz = null; return; }
      const fast = dz.dy / Math.max(1, Date.now() - dz.t) > 0.5 && dz.dy > 40;
      sheet.classList.remove('rz-drag');
      if (dz.dy > 90 || fast) closeMenu(); else sheet.style.transform = '';
      dz = null;
    };
    sheet.addEventListener('touchend', dragEnd);
    sheet.addEventListener('touchcancel', dragEnd);

    /* ---------- the button sits lighter during play, and steps aside for the game's own panels ---------- */
    let queued = false, waitingRef = () => false;
    const covered = () => { if (!opt.hideWhen) return false; try { return !!document.querySelector(opt.hideWhen); } catch { return false; } };
    const onChange = () => {
      queued = false;
      const hide = covered() && !api.menuOpen;
      corner.classList.toggle('rz-quiet', !onMenu());
      corner.classList.toggle('rz-hide', hide);
      btn.tabIndex = hide ? -1 : 0;
      if (hide) corner.classList.remove('rz-intro');
      if (waitingRef()) tryReload();
    };
    if (opt.showWhen || opt.hideWhen) {
      new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(onChange); } })
        .observe(document.body, {subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'], childList: true});
    }
    onChange();
    // The first few times, the button gives a gentle pulse and a tip says what it is
    const intro = +(read('rz-menu-intro') || 0);
    if (intro < 3) {
      store('rz-menu-intro', intro + 1);
      setTimeout(() => {
        if (!onMenu() || api.menuOpen || covered()) return;
        btn.classList.add('rz-pulse');
        if (!mouse) label('Tap for settings');
        corner.classList.add('rz-intro');
        setTimeout(() => { corner.classList.remove('rz-intro'); if (!mouse) setTimeout(() => label('Settings menu'), 400); }, 3600);
      }, 900);
    }

    /* ======================= updates ======================= */
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
    const loud = () => settings.showUpdates || !!call('loud');

    // when this game's file was last committed to GitHub
    const VERSION_KEY = 'rz-version:' + id, JUST_KEY = 'rz-updated:' + id;
    const showVersion = v => {
      const when = fmt(v);
      $('.rz-ver').textContent = when ? `Last updated ${when}` : 'Not checked yet';
      dispatchEvent(new CustomEvent('rizzo:version', {detail: {modified: v, when}}));
    };
    showVersion(read(VERSION_KEY));

    let reloading = false, waiting = false;
    waitingRef = () => waiting;
    const canReload = () => { const f = hook('canReload'); try { return f ? !!f() : onMenu(); } catch { return onMenu(); } };
    function reloadNow(isUpdate) {
      const info = call('beforeReload');
      try { sessionStorage.setItem(JUST_KEY, JSON.stringify({info: info === undefined ? null : info, update: isUpdate})); } catch {}
      location.reload();
    }
    function tryReload() {
      if (api.menuOpen || !canReload()) {
        if (!waiting) {
          waiting = true;
          note('Update ready · it loads when you\'re back on the menu', 'new', 3500);
          const t = setInterval(() => { if (!waiting) clearInterval(t); else if (!api.menuOpen && canReload()) { clearInterval(t); tryReload(); } }, 1000);
        }
        return;
      }
      waiting = false;
      reloadNow(true);
    }
    function onUpdate() {
      if (reloading) return;
      reloading = true;
      note('Update found · loading it now…', 'new');
      setTimeout(() => { tryReload(); if (waiting) reloading = false; }, 700);
    }
    // just reloaded: let the game pick up where it was, and say what happened
    let justUpdated = false;
    try {
      const raw = sessionStorage.getItem(JUST_KEY);
      if (raw) {
        sessionStorage.removeItem(JUST_KEY);
        justUpdated = true;
        const j = JSON.parse(raw);
        call('afterReload', j.info);
        setTimeout(() => note(j.update ? 'Updated to the newest version' : 'Reloaded', 'ok', 2400), 300);
      }
    } catch {}

    if (!('serviceWorker' in navigator && location.protocol.startsWith('http'))) {
      api.check = () => note('Updates only work on the hosted site', 'off', 2500);
      return;
    }
    const swc = navigator.serviceWorker;
    const hadController = !!swc.controller;
    // the shared sw.js saves every game for offline play and does the actual checking
    swc.register('sw.js', {updateViaCache: 'none'}).catch(() => {});
    swc.addEventListener('controllerchange', () => { if (hadController) onUpdate(); });   // a new sw.js took over
    swc.addEventListener('message', e => { if (e.data && e.data.type === 'updated') onUpdate(); });   // newer copy arrived late

    let checking = false;
    api.check = manual => {
      if (checking || reloading) return;
      const say = manual || loud();
      swc.ready.then(reg => {
        reg.update().catch(() => {});
        if (!swc.controller) { if (manual) note('Not installed yet · open the game again', 'off', 2500); return; }
        checking = true;
        if (say) note('Checking for updates…', '');
        const ch = new MessageChannel();
        const giveUp = setTimeout(() => { checking = false; if (say) note('Couldn\'t check for updates', 'off', 2500); }, 10000);
        ch.port1.onmessage = e => {
          clearTimeout(giveUp); checking = false;
          const r = e.data || {};
          if (r.modified) { store(VERSION_KEY, r.modified); showVersion(r.modified); }
          const when = fmt(r.modified);
          if (r.status === 'updated') onUpdate();
          else if (!say) return;
          else if (r.status === 'same') note(when ? `Up to date · ${when}` : 'Up to date', 'ok', 2200);
          else note('Offline · playing the saved version', 'off', 2500);
        };
        swc.controller.postMessage({type: 'check'}, [ch.port2]);
      }).catch(() => {});
    };
    if (!justUpdated && hadController) setTimeout(() => api.check(false), 600);   // every time the game opens
    document.addEventListener('visibilitychange', () => { if (!document.hidden) api.check(false); });
    addEventListener('online', () => api.check(false));
    setInterval(() => { if (!document.hidden) api.check(false); }, 30 * 60 * 1000);   // left open for ages
  }
})();
