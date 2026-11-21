/* ======================================================================
   RIZZO RETRO: shared bits for the pixel arcade games.
     Retro.screen(canvas, W, H)   draw at W x H pixels, scaled up sharply to fill the stage
     Retro.sprite(rows, colours)  a sprite from rows of characters ('.' is see-through)
     Retro.sfx                    chip-tune sounds at the shared Rizzo effects volume
     Retro.keys                   which keys are held down
     Retro.best(id) / save(id, n) high scores
     Retro.loop(step, draw)       a fixed 60-steps-a-second game loop that pauses with the menu
   ====================================================================== */
(() => {
  const RZ = () => window.RizzoGames || null;

  /* ---------- the screen: low resolution, scaled up with sharp pixels ---------- */
  function screen(cv, W, H) {
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const fit = () => {
      const box = cv.parentElement.getBoundingClientRect();
      const k = Math.min(box.width / W, box.height / H);   // as big as the space allows
      cv.style.width = Math.max(1, Math.floor(W * k)) + 'px'; cv.style.height = Math.max(1, Math.floor(H * k)) + 'px';
      cv.dataset.k = k;
    };
    fit(); addEventListener('resize', fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(cv.parentElement);
    return {ctx, W, H, fit,
      // a pointer position in game pixels
      at(e) { const r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H}; }};
  }

  /* ---------- sprites ---------- */
  function sprite(rows, colours) {
    const h = rows.length, w = Math.max(...rows.map(r => r.length)), c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.' && ch !== ' ' && colours[ch]) { g.fillStyle = colours[ch]; g.fillRect(x, y, 1, 1); } }));
    return c;
  }
  // the same sprite as a data: URL (for small pictures in the page, like the how-to-play list)
  const spriteURL = (rows, colours) => sprite(rows, colours).toDataURL();

  /* ---------- sound: square and triangle waves, like an old sound chip ---------- */
  let ac = null;
  const vol = () => { const r = RZ(); return r ? r.level('sfx') : 0.6; };
  function tone(f, d, type = 'square', g = .08, at = 0, slide = 0) {
    const v = vol(); if (!v) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
      const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + d);
      gn.gain.setValueAtTime(g * v, t); gn.gain.setValueAtTime(g * v, t + d * .7); gn.gain.linearRampToValueAtTime(0, t + d);
      o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + d + .02);
    } catch {}
  }
  function noise(d, g = .1, at = 0, hi = 2000) {
    const v = vol(); if (!v) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
      const n = Math.floor(ac.sampleRate * d), buf = ac.createBuffer(1, n, ac.sampleRate), data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain();
      f.type = 'lowpass'; f.frequency.value = hi; gn.gain.value = g * v;
      s.buffer = buf; s.connect(f).connect(gn).connect(ac.destination); s.start(ac.currentTime + at);
    } catch {}
  }
  const sfx = {tone, noise,
    blip: (f = 660) => tone(f, .05, 'square', .06),
    jingle: notes => notes.forEach((f, k) => tone(f, .12, 'square', .07, k * .11)),
    boom: () => { noise(.35, .16, 0, 900); tone(110, .3, 'triangle', .1, 0, .4); },
  };

  /* ---------- keys held down ---------- */
  const keys = new Set();
  addEventListener('keydown', e => { keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key); if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) && !e.target.closest('input,textarea,.rz-ui')) e.preventDefault(); });
  addEventListener('keyup', e => { keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key); });
  addEventListener('blur', () => keys.clear());
  const held = (...names) => names.some(n => keys.has(n));
  // an on-screen button that counts as a key while it's held down
  function hold(btn, name) {
    const down = e => { e.preventDefault(); keys.add(name); btn.classList.add('down'); try { btn.setPointerCapture(e.pointerId); } catch {} };
    const up = () => { keys.delete(name); btn.classList.remove('down'); };
    btn.addEventListener('pointerdown', down); btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('lostpointercapture', up);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  }

  /* ---------- high scores ---------- */
  const best = id => { try { return +(localStorage.getItem(id + '-best') || 0); } catch { return 0; } };
  const save = (id, n) => { if (n > best(id)) { try { localStorage.setItem(id + '-best', String(n)); } catch {} return true; } return false; };

  /* ---------- the game loop: 60 steps a second whatever the screen's speed ---------- */
  function loop(step, draw) {
    let last = 0, acc = 0, on = true;
    const tick = now => {
      requestAnimationFrame(tick);
      const r = RZ();
      if (!on || document.hidden || (r && r.menuOpen)) { last = 0; draw(); return; }
      const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now; acc += dt;
      let n = 0; while (acc >= 1 / 60 && n++ < 6) { step(); acc -= 1 / 60; }
      draw();
    };
    requestAnimationFrame(tick);
    return {pause() { on = false; }, resume() { on = true; last = 0; acc = 0; }, get running() { return on; }};
  }

  window.Retro = {screen, sprite, spriteURL, sfx, keys, held, hold, best, save, loop,
    touch: () => { const r = RZ(); return !!(r && r.device && r.device.touch); }};
})();
