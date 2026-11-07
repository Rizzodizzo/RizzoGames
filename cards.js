/* ======================================================================
   Rizzo Games: shared playing cards.
   One look for every card game: the suits, the corners, the pips and the
   King, Queen and Jack art. Load it in the <head>:  <script src="cards.js"></script>

   Cards are numbered 0–51: suit = id ÷ 13 (♠ ♥ ♣ ♦), rank = id % 13 + 1 (Ace … King).

     RZC.face(id)        the inside of a card, to put in an element with class "rzc"
                         (add "r" for a red card, "down" to show its back)
     RZC.el(id, down)    a ready-made card element (<div class="rzc ...">)
     RZC.suit / rank / red / name(id), RZC.RANKS, RZC.SUIT_NAMES
     RZC.suitSVG(s)      a suit symbol on its own, sized by CSS

   Colours come from the page's CSS variables (with sensible fallbacks):
     --face  card face      --red  hearts and diamonds   --black  spades and clubs
     --back / --back2       the two stripes on a card's back
   Size comes from --cw (card width); a card is 1.4 times as tall as it is wide.
   ====================================================================== */
(function () {
  const SUITS = [
    'M12 2C9.6 5.2 4 8.9 4 13.3c0 2.6 2 4.5 4.3 4.5 1.3 0 2.4-.5 3.1-1.4-.3 2.1-1.1 3.7-2.7 5.2h6.6c-1.6-1.5-2.4-3.1-2.7-5.2.7.9 1.8 1.4 3.1 1.4 2.3 0 4.3-1.9 4.3-4.5C20 8.9 14.4 5.2 12 2z',
    'M12 21.2s-8.3-5-9.6-10.4C1.6 7.4 3.8 4.3 7 4.3c2.2 0 3.7 1.3 5 3.2 1.3-1.9 2.8-3.2 5-3.2 3.2 0 5.4 3.1 4.6 6.5C20.3 16.2 12 21.2 12 21.2z',
    'M12 2.3a4.3 4.3 0 0 0-3.8 6.3 4.3 4.3 0 1 0 2.9 7.6c-.3 2-1.1 3.6-2.6 5.1h7c-1.5-1.5-2.3-3.1-2.6-5.1a4.3 4.3 0 1 0 2.9-7.6A4.3 4.3 0 0 0 12 2.3z',
    'M12 1.8l7.6 10.2L12 22.2 4.4 12z',
  ];
  const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const SUIT_NAMES = ['spades', 'hearts', 'clubs', 'diamonds'];
  const RANK_NAMES = ['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];

  /* ---------- the court cards: a portrait in a frame, dressed in the suit's colour ----------
     Drawn on a 40 × 48 grid. currentColor is the suit colour (red or black);
     gold, skin and hair are fixed so the figures read clearly at any size. */
  const GOLD = '#e8b33c', GOLD_D = '#a87412', SKIN = '#f2c9a0', SKIN_D = '#d9a47a', EYE = '#2a1f1f';
  const frame = `<rect x=".8" y=".8" width="38.4" height="46.4" rx="3.2" fill="currentColor" fill-opacity=".07" stroke="currentColor" stroke-width="1.3"/>`;
  const eyes = (y, dx = 2.6) => `<circle cx="${20 - dx}" cy="${y}" r=".95" fill="${EYE}"/><circle cx="${20 + dx}" cy="${y}" r=".95" fill="${EYE}"/>`;
  const badge = y => `<circle cx="20" cy="${y}" r="3.7" fill="#fff" stroke="${GOLD}" stroke-width="1"/>`;   // the suit goes on top of this
  const ART = {
    // a bearded King with a tall crown and a gold chain
    K: frame +
      `<path d="M11.4 19 C11.4 12.5 28.6 12.5 28.6 19 V25 Q28.6 28.4 25.6 28.4 H14.4 Q11.4 28.4 11.4 25Z" fill="#7a5230"/>
       <path d="M4 48 C4 37.5 11 32.6 20 32.6 C29 32.6 36 37.5 36 48Z" fill="currentColor"/>
       <path d="M9.5 36.2 Q20 44 30.5 36.2" fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-linecap="round"/>
       <ellipse cx="20" cy="20.6" rx="7" ry="7.8" fill="${SKIN}"/>
       <path d="M12.8 21.4 C13 29.6 16 33.8 20 33.8 C24 33.8 27 29.6 27.2 21.4 C25.6 25.3 23 26.4 20 26.4 C17 26.4 14.4 25.3 12.8 21.4Z" fill="#7a5230"/>
       <path d="M16.2 25.3 Q18.3 23.7 20 25 Q21.7 23.7 23.8 25.3 Q21.7 26.6 20 25.9 Q18.3 26.6 16.2 25.3Z" fill="#553619"/>
       <path d="M20 21.2v2.3" stroke="${SKIN_D}" stroke-width=".9" stroke-linecap="round"/>
       ${eyes(20.4)}
       <path d="M12 15.4 L11.2 6.6 L15.6 10.7 L20 4.3 L24.4 10.7 L28.8 6.6 L28 15.4Z" fill="${GOLD}" stroke="${GOLD_D}" stroke-width=".7" stroke-linejoin="round"/>
       <rect x="11.8" y="13.3" width="16.4" height="2.7" rx=".7" fill="${GOLD}" stroke="${GOLD_D}" stroke-width=".7"/>
       <circle cx="20" cy="14.65" r="1.05" fill="currentColor"/><circle cx="15.6" cy="14.65" r=".7" fill="currentColor"/><circle cx="24.4" cy="14.65" r=".7" fill="currentColor"/>
       <circle cx="11.2" cy="6.6" r=".9" fill="${GOLD}"/><circle cx="20" cy="4.3" r=".9" fill="${GOLD}"/><circle cx="28.8" cy="6.6" r=".9" fill="${GOLD}"/>
       ${badge(42)}`,
    // a Queen with long hair, a tiara and a necklace
    Q: frame +
      `<path d="M11 20 C10.5 11.4 29.5 11.4 29 20 C29 27 30.8 31.8 32.6 35 C28.2 35.6 25.2 33 24.6 29 H15.4 C14.8 33 11.8 35.6 7.4 35 C9.2 31.8 11 27 11 20Z" fill="#a8652a"/>
       <path d="M5 48 C5 38.6 11.6 33.6 20 33.6 C28.4 33.6 35 38.6 35 48Z" fill="currentColor"/>
       <rect x="18" y="26" width="4" height="8.5" fill="${SKIN}"/>
       <path d="M14.8 33.7 Q20 41 25.2 33.7Z" fill="${SKIN}"/>
       <path d="M15.6 34.5 Q20 39.6 24.4 34.5" fill="none" stroke="${GOLD}" stroke-width="1.1"/>
       <ellipse cx="20" cy="20.6" rx="6.6" ry="7.4" fill="${SKIN}"/>
       <path d="M13.4 19 C13.8 13.2 26.2 13.2 26.6 19 C24.2 16.6 21.6 16 20 17.3 C18.4 16 15.8 16.6 13.4 19Z" fill="#a8652a"/>
       ${eyes(20.8, 2.5)}
       <circle cx="16" cy="23.4" r="1.2" fill="#ee8f86" opacity=".55"/><circle cx="24" cy="23.4" r="1.2" fill="#ee8f86" opacity=".55"/>
       <path d="M18.3 24.8 Q20 26.1 21.7 24.8" fill="none" stroke="#c0392b" stroke-width="1" stroke-linecap="round"/>
       <path d="M13.5 14.6 L14.5 9.6 L17.4 12.3 L20 7.1 L22.6 12.3 L25.5 9.6 L26.5 14.6 Q20 12.7 13.5 14.6Z" fill="${GOLD}" stroke="${GOLD_D}" stroke-width=".7" stroke-linejoin="round"/>
       <circle cx="20" cy="11.9" r="1" fill="currentColor"/>
       <circle cx="14.5" cy="9.6" r=".8" fill="#fff" stroke="${GOLD_D}" stroke-width=".4"/><circle cx="20" cy="7.1" r=".8" fill="#fff" stroke="${GOLD_D}" stroke-width=".4"/><circle cx="25.5" cy="9.6" r=".8" fill="#fff" stroke="${GOLD_D}" stroke-width=".4"/>
       ${badge(42.6)}`,
    // a young Jack in a feathered cap with a white collar
    J: frame +
      `<path d="M12 20 C12 13 28 13 28 20 V27 C26.6 26 25.6 24 25.6 22 H14.4 C14.4 24 13.4 26 12 27Z" fill="#5d3b1d"/>
       <path d="M5.4 48 C5.4 38.6 12 34 20 34 C28 34 34.6 38.6 34.6 48Z" fill="currentColor"/>
       <rect x="18" y="26.5" width="4" height="8" fill="${SKIN}"/>
       <path d="M12.6 35.4 Q20 31.4 27.4 35.4 L24.8 38.8 Q20 36.2 15.2 38.8Z" fill="#fff" stroke="rgba(0,0,0,.25)" stroke-width=".5"/>
       <ellipse cx="20" cy="21" rx="6.5" ry="7.2" fill="${SKIN}"/>
       <path d="M13.5 19.4 C14 15.8 26 15.8 26.5 19.4 C24.4 17.9 22 17.9 20 18.9 C18 17.9 15.6 17.9 13.5 19.4Z" fill="#5d3b1d"/>
       ${eyes(21.2, 2.5)}
       <path d="M20 22 v2" stroke="${SKIN_D}" stroke-width=".9" stroke-linecap="round"/>
       <path d="M18 25.4 Q20 26.8 22 25.4" fill="none" stroke="#8a4632" stroke-width=".95" stroke-linecap="round"/>
       <path d="M27 12.7 C29 6.6 33.6 3.4 36.6 3.7 C35.6 7.6 32 11.2 27.8 13.8Z" fill="${GOLD}" stroke="${GOLD_D}" stroke-width=".6"/>
       <path d="M28 13.2 C30.5 9 33.4 6 36 4.4" fill="none" stroke="${GOLD_D}" stroke-width=".5"/>
       <path d="M10.4 16.8 C9.9 9.6 15 7 21 7 C27.6 7 31.1 10.1 30.6 15.2 C26 13.4 16 13.6 10.4 16.8Z" fill="currentColor"/>
       <path d="M10.7 16.5 C16 13.5 26 13.2 30.5 15" fill="none" stroke="${GOLD}" stroke-width="1.6"/>
       ${badge(42.8)}`,
  };
  const BADGE_Y = {K: 42, Q: 42.6, J: 42.8};

  /* ---------- the symbols go in one hidden <svg>, so 52 cards stay light ---------- */
  function sprite() {
    if (document.getElementById('rzc-sprite') || !document.body) return;
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.id = 'rzc-sprite'; s.setAttribute('aria-hidden', 'true');
    s.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
    s.innerHTML = SUITS.map((d, i) => `<symbol id="rzs${i}" viewBox="0 0 24 24"><path fill="currentColor" d="${d}"/></symbol>`).join('') +
      Object.keys(ART).map(k => `<symbol id="rzc${k}" viewBox="0 0 40 48">${ART[k]}</symbol>`).join('');
    document.body.prepend(s);
  }
  if (document.body) sprite(); else document.addEventListener('DOMContentLoaded', sprite);

  /* ---------- how a card looks ---------- */
  const css = `
.rzc{position:relative;width:var(--cw,60px);height:calc(var(--cw,60px) * 1.4);border-radius:var(--cr,calc(var(--cw,60px) * .09));background:var(--face,#fff);color:var(--black,#1f2328);
  font-weight:900;line-height:1;box-shadow:0 1px 2px rgba(0,0,0,.28),inset 0 0 0 1px rgba(0,0,0,.08)}
.rzc.r{color:var(--red,#d0312d)}
.rzc .rk{position:absolute;left:7%;top:4%;font-size:calc(var(--cw,60px) * .36);letter-spacing:-.06em}
.rzc .s1{position:absolute;right:6%;top:6%;width:calc(var(--cw,60px) * .28);height:calc(var(--cw,60px) * .28)}
.rzc .mid{position:absolute;left:50%;top:62%;width:calc(var(--cw,60px) * .54);height:calc(var(--cw,60px) * .54);translate:-50% -50%}
.rzc .court{position:absolute;left:11%;right:11%;top:30%;bottom:4.5%;width:78%;height:65.5%}
.rzc.down{background:repeating-linear-gradient(45deg,var(--back,#c0392b) 0 calc(var(--cw,60px) * .07),var(--back2,#a52e22) 0 calc(var(--cw,60px) * .14));
  box-shadow:inset 0 0 0 calc(var(--cw,60px) * .05) var(--face,#fff),0 1px 2px rgba(0,0,0,.28)}
.rzc.down>*{display:none}`;
  const st = document.createElement('style'); st.id = 'rzc-css'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  const suit = id => Math.floor(id / 13), rank = id => id % 13 + 1, red = id => suit(id) % 2 === 1;
  const suitSVG = (s, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#rzs${s}"/></svg>`;
  function face(id) {
    sprite();
    const s = suit(id), r = rank(id), R = RANKS[r];
    const art = r > 10
      ? `<svg class="court" viewBox="0 0 40 48" aria-hidden="true"><use href="#rzc${R}"/><use href="#rzs${s}" x="17.3" y="${BADGE_Y[R] - 2.7}" width="5.4" height="5.4"/></svg>`
      : suitSVG(s, 'mid');
    return `<b class="rk">${R}</b>${suitSVG(s, 's1')}${art}`;
  }
  function el(id, down) {
    const c = document.createElement('div');
    c.className = 'rzc' + (red(id) ? ' r' : '') + (down ? ' down' : '');
    c.dataset.id = id; c.innerHTML = face(id);
    return c;
  }
  window.RZC = {suit, rank, red, RANKS, SUIT_NAMES, SUITS, face, el, suitSVG, sprite,
    name: id => `${RANK_NAMES[rank(id)]} of ${SUIT_NAMES[suit(id)]}`};
})();
