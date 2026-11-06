/* ======================================================================
   RIZZO GAMES: shared themes
   Every game uses these: the colour themes, the special themes (unlocked by winning)
   and the seasonal ones, with their decorations: falling petals, fish, stars, cats,
   the Easter bunny, borders and background scenes.

   A game tells it what it needs once:
     RZT.config({theme: () => currentThemeId, fxOn: () => true, reduceMotion: () => false, sound: (name, ...args) => {}})
   and calls RZT.decorate(id) whenever the theme changes. The decorations look for
   #fx and #bursts (empty layers on the page) and #boardWrap around #board.
   Each game decides for itself how its special themes are unlocked.
   ====================================================================== */
(() => {
const C = {theme: () => '', fxOn: () => true, reduceMotion: () => false, sound: () => {}};

/* ---------- colour themes ---------- */
const THEMES = {
  light:    {name: 'Light', bg:'#f6f4ef', panel:'#ffffff', ink:'#1d2433', muted:'#6b7280', line:'#1d2433', thin:'#c9cdd6', peer:'#e8eefc', same:'#c7d6fb', sel:'#9db8f7', entry:'#2f5bd3', bad:'#d64545', badbg:'#fde4e4', accent:'#2f5bd3', onaccent:'#ffffff', btn:'#e9e7e1', gold:'#c48a00', ok:'#2e9b5b', harea:'#fff3d1', hkey:'#ffd56b', helim:'#ffd2d2'},
  dark:     {name: 'Dark', bg:'#14171f', panel:'#1d212b', ink:'#e6e8ee', muted:'#9aa1ae', line:'#e6e8ee', thin:'#3a404d', peer:'#252c3d', same:'#2f3d63', sel:'#3c5596', entry:'#8fb0ff', bad:'#ff7a7a', badbg:'#4a2326', accent:'#8fb0ff', onaccent:'#14171f', btn:'#2a2f3b', gold:'#f2c14e', ok:'#5fd38d', harea:'#352d1c', hkey:'#7a5d1c', helim:'#55262a'},
  ocean:    {name: 'Ocean', bg:'#e6f2f5', panel:'#ffffff', ink:'#12313b', muted:'#5b7883', line:'#12313b', thin:'#b9d2da', peer:'#dcf0f5', same:'#b3e1ec', sel:'#7fcfe0', entry:'#0b7a93', bad:'#d64545', badbg:'#fde4e4', accent:'#0b7a93', onaccent:'#ffffff', btn:'#d3e7ec', gold:'#c48a00', ok:'#1f9468', harea:'#fff3d1', hkey:'#ffd56b', helim:'#ffd2d2'},
  forest:   {name: 'Forest', bg:'#edf3e8', panel:'#fbfdf9', ink:'#1f3324', muted:'#607466', line:'#1f3324', thin:'#c3d3c4', peer:'#e3efdf', same:'#c6e0be', sel:'#9ccc8f', entry:'#2f7d3a', bad:'#c8473b', badbg:'#fbe1dc', accent:'#2f7d3a', onaccent:'#ffffff', btn:'#dde7d7', gold:'#b07d00', ok:'#2f7d3a', harea:'#fbf0c9', hkey:'#f5cf5b', helim:'#f8d3cc'},
  sunset:   {name: 'Sunset', bg:'#fdf0e6', panel:'#fffaf6', ink:'#3b1f17', muted:'#8a6658', line:'#3b1f17', thin:'#e8cbbd', peer:'#fde3d6', same:'#f9c7b1', sel:'#f4a582', entry:'#c4502a', bad:'#b3261e', badbg:'#f9d6d2', accent:'#d9572c', onaccent:'#ffffff', btn:'#f4e0d4', gold:'#b8740a', ok:'#3d8b4f', harea:'#fff0c7', hkey:'#ffd36b', helim:'#f6c9c2'},
  sepia:    {name: 'Sepia', bg:'#f2e8d5', panel:'#fbf6ea', ink:'#3a2f22', muted:'#84735c', line:'#3a2f22', thin:'#d9ccb2', peer:'#efe4cc', same:'#e3d3ad', sel:'#d4bc85', entry:'#7a4f1d', bad:'#b23b2a', badbg:'#f3d6cc', accent:'#8a5a22', onaccent:'#fbf6ea', btn:'#e8dcc3', gold:'#a8700a', ok:'#4f7d3a', harea:'#f6e9bf', hkey:'#ecc860', helim:'#efcfc3'},
  midnight: {name: 'Midnight', bg:'#12101c', panel:'#1c1930', ink:'#e9e6f7', muted:'#9e98bb', line:'#d9d4f2', thin:'#39345a', peer:'#262243', same:'#3a3170', sel:'#5546a8', entry:'#b6a6ff', bad:'#ff7a8a', badbg:'#4a2333', accent:'#9d8cff', onaccent:'#12101c', btn:'#2a2645', gold:'#f2c14e', ok:'#6ad6a0', harea:'#352b4d', hkey:'#7a5d1c', helim:'#572a3d'},
  contrast: {name: 'High contrast', bg:'#ffffff', panel:'#ffffff', ink:'#000000', muted:'#333333', line:'#000000', thin:'#777777', peer:'#e4e4e4', same:'#ffe066', sel:'#ffd400', entry:'#0033cc', bad:'#cc0000', badbg:'#ffd0d0', accent:'#000000', onaccent:'#ffffff', btn:'#e0e0e0', gold:'#8a5a00', ok:'#006b2d', harea:'#fff2b0', hkey:'#ffcc00', helim:'#ffc0c0'},
};
const THEME_ORDER = ['auto', 'light', 'dark', 'ocean', 'forest', 'sunset', 'sepia', 'midnight', 'contrast'];

const SPECIALS = {
  sakura: {name: 'Sakura', badge: 'flower', glow: 'rgba(255,150,190,.75)', desc: 'Falling cherry blossoms', req: {mode: 'classic', diff: 'easy'},
    colors: {bg:'#fdeef3', panel:'#fffafc', ink:'#4a2433', muted:'#9a6d7c', line:'#4a2433', thin:'#f0cdd8', peer:'#fde4ec', same:'#f9c9d8', sel:'#f4a3bd', entry:'#d6457a', bad:'#c0392b', badbg:'#fbd9d4', accent:'#e05a8c', onaccent:'#ffffff', btn:'#f8e1e8', gold:'#c98a1b', ok:'#3f9a6a', harea:'#fff1d6', hkey:'#ffd27a', helim:'#f8cdd0'},
    fx: [{shape: 'petal', anim: 'fall', count: 16, size: [10, 18], dur: [9, 16], colors: ['#f7a8c4', '#f4bfd3', '#ffd6e5', '#ef8fb2']}],
    burst: {shape: 'petal', colors: ['#f7a8c4', '#ef8fb2', '#ffd6e5']}},
  sea: {name: 'Under the Sea', badge: 'fish', glow: 'rgba(127,227,255,.8)', desc: 'Bubbles and little fish', req: {mode: 'classic', diff: 'medium'},
    colors: {bg:'#0c3450', panel:'#114766', ink:'#e8f6ff', muted:'#9cc4da', line:'#d5efff', thin:'#2a6488', peer:'#155777', same:'#1d6f94', sel:'#2a8bb5', entry:'#7fe3ff', bad:'#ff8a80', badbg:'#5a2a35', accent:'#4fd1e8', onaccent:'#06283b', btn:'#175a7d', gold:'#ffd166', ok:'#6be3a8', harea:'#1f5a5a', hkey:'#8a6d1f', helim:'#5a2a3a'},
    fx: [{shape: 'bubble', anim: 'rise', count: 16, size: [6, 18], dur: [8, 15], colors: ['rgba(255,255,255,.6)', 'rgba(127,227,255,.6)']},
         {shape: 'fish', anim: 'swim', count: 12, every: [1, 2.5], size: [18, 40], dur: [12, 26], colors: ['#ffb84d', '#ff7a6b', '#7fe3ff', '#ffd166', '#ff9ec4', '#9be7a4']}],
    burst: {shape: 'bubble', colors: ['rgba(255,255,255,.85)', '#7fe3ff']}},
  autumn: {name: 'Autumn', badge: 'leaf', glow: 'rgba(255,170,80,.7)', desc: 'Tumbling autumn leaves', req: {mode: 'classic', diff: 'hard'},
    colors: {bg:'#f6ebdd', panel:'#fffaf3', ink:'#3d2614', muted:'#8a6a50', line:'#3d2614', thin:'#e2cdb5', peer:'#f7e6d2', same:'#f0cfa8', sel:'#e8ad6e', entry:'#b5541b', bad:'#a8281e', badbg:'#f6d4cc', accent:'#c8641e', onaccent:'#ffffff', btn:'#efdfcb', gold:'#b8740a', ok:'#5a7d2a', harea:'#fbeec5', hkey:'#f2c75c', helim:'#f2c7bd'},
    fx: [{shape: 'leaf', anim: 'fall', count: 14, size: [12, 20], dur: [9, 15], colors: ['#d9622b', '#e8a33d', '#b8401f', '#c8892a']}],
    burst: {shape: 'leaf', colors: ['#d9622b', '#e8a33d', '#b8401f']}},
  space: {name: 'Starry Night', badge: 'moon', glow: 'rgba(220,228,255,.9)', desc: 'Twinkling stars and shooting stars', req: {mode: 'classic', diff: 'expert'},
    colors: {bg:'#0b0f2a', panel:'#141a3d', ink:'#eef0ff', muted:'#a3a9d6', line:'#dfe3ff', thin:'#2c3470', peer:'#1c2452', same:'#2a3575', sel:'#3d4ca3', entry:'#ffd86b', bad:'#ff7a8a', badbg:'#4a2340', accent:'#8fa2ff', onaccent:'#0b0f2a', btn:'#1f2754', gold:'#ffd86b', ok:'#7de0b0', harea:'#2c2d55', hkey:'#6b5a1f', helim:'#4d2440'},
    fx: [{shape: 'star', anim: 'twinkle', count: 40, size: [3, 9], dur: [2, 5], colors: ['#ffffff', '#ffe9a8', '#c9d3ff']},
         {shape: 'shoot', anim: 'shoot', count: 2, every: [2, 5.5], size: [70, 150], dur: [0.9, 1.6], colors: ['#ffffff', '#ffe9a8', '#c9d3ff']}],
    burst: {shape: 'star', colors: ['#ffd86b', '#ffffff', '#c9d3ff']}},
  snow: {name: 'Snowfall', badge: 'snowflake', glow: 'rgba(225,242,255,.9)', desc: 'Snow, with a snow-capped board', req: {mode: 'paper', diff: 'medium'},
    colors: {bg:'#1e2f45', panel:'#263a54', ink:'#eef5ff', muted:'#a9bcd3', line:'#e3eefa', thin:'#3b5372', peer:'#2d4462', same:'#3a5678', sel:'#4d6f99', entry:'#9fd3ff', bad:'#ff8a8a', badbg:'#4d2a35', accent:'#9fd3ff', onaccent:'#13233a', btn:'#2f4664', gold:'#ffd98a', ok:'#8be0b5', harea:'#3b4560', hkey:'#7a6526', helim:'#553042'},
    fx: [{shape: 'snow', anim: 'fall', count: 28, size: [6, 14], dur: [10, 20], colors: ['#ffffff', '#dcecff']}],
    burst: {shape: 'snow', colors: ['#ffffff', '#cfe6ff']}},
  candy: {name: 'Candy', badge: 'heart', glow: 'rgba(255,120,190,.7)', desc: 'Confetti and a candy-cane border', req: {mode: 'killer', diff: 'easy'},
    colors: {bg:'#fff1f8', panel:'#ffffff', ink:'#43264f', muted:'#9a7aa8', line:'#43264f', thin:'#f0d0e6', peer:'#fbe3f4', same:'#e6d5ff', sel:'#c9a8ff', entry:'#8a3ffc', bad:'#e0245e', badbg:'#ffd7e4', accent:'#ff5fa2', onaccent:'#ffffff', btn:'#fbe1ef', gold:'#e09b00', ok:'#20a87a', harea:'#fff4c9', hkey:'#ffd166', helim:'#ffd0dc'},
    fx: [{shape: 'confetti', anim: 'fall', count: 18, size: [7, 11], dur: [7, 13], colors: ['#ff5fa2', '#ffd166', '#7ad3ff', '#a98bff', '#6be3a8']}],
    burst: {shape: 'confetti', colors: ['#ff5fa2', '#ffd166', '#7ad3ff', '#a98bff', '#6be3a8']}},
  neon: {name: 'Neon Arcade', badge: 'bolt', desc: 'Glowing numbers and scanlines', req: {mode: 'killer', diff: 'hard'},
    colors: {bg:'#0a0a12', panel:'#11111d', ink:'#e9fbff', muted:'#8b8fb3', line:'#ff2fd6', thin:'#2a2a44', peer:'#1a1a2e', same:'#2b1b45', sel:'#4a1f6e', entry:'#2ff3ff', bad:'#ff3860', badbg:'#3d1022', accent:'#ff2fd6', onaccent:'#0a0a12', btn:'#1c1c30', gold:'#ffe74c', ok:'#3dff9a', harea:'#25213a', hkey:'#6a5a10', helim:'#45152a'},
    fx: [{shape: 'pixel', anim: 'rise', count: 18, size: [4, 9], dur: [10, 18], colors: ['#ff2fd6', '#2ff3ff', '#ffe74c']}],
    burst: {shape: 'pixel', colors: ['#ff2fd6', '#2ff3ff', '#ffe74c']}},
  gold: {name: 'Royal Gold', badge: 'crown', glow: 'rgba(255,216,107,.8)', desc: 'Solid gold everything, for true masters', req: {mode: null, diff: 'master'},
    colors: {bg:'#0d0a04', panel:'#17120a', ink:'#fff3cf', muted:'#c9ad6a', line:'#d4af37', thin:'#3f3214', peer:'#241b09', same:'#3d2f0c', sel:'#5c4611', entry:'#fff1c9', bad:'#ff7a6b', badbg:'#45180f', accent:'#d4af37', onaccent:'#1a1205', btn:'#211a0b', gold:'#f2cf5b', ok:'#b5e08a', harea:'#33270b', hkey:'#7a5d1c', helim:'#4d2418'},
    fx: [{shape: 'star', anim: 'twinkle', count: 34, size: [4, 13], dur: [1.6, 4], colors: ['#ffe27a', '#fff6cc', '#d4af37']},
         {shape: 'flake', anim: 'fall', count: 22, size: [7, 13], dur: [9, 17], colors: ['#f6e27a', '#d4af37', '#fff3b0', '#c9992a']}],
    burst: {shape: 'coin', colors: ['#f2cf5b', '#d4af37', '#ffe27a']}},
  cats: {name: 'Alex', badge: 'cat', glow: 'rgba(255,242,226,.75)', desc: 'Sleepy cats, coffee and plants', req: null,
    colors: {bg:'#d6bfa3', panel:'#fbf5ea', ink:'#3b281a', muted:'#6f5440', line:'#4a3222', thin:'#dcc8ad', peer:'#f3e7d4', same:'#e7d1ae', sel:'#d4b48a', entry:'#7d4a28', bad:'#b23b2a', badbg:'#f3d6cc', accent:'#6f4528', onaccent:'#fbf5ea', btn:'#e8d6bd', gold:'#8f5e14', ok:'#4f7d3a', harea:'#f4e4c4', hkey:'#e8c35e', helim:'#efcfc3'},
    fx: [{shape: 'leaf', anim: 'fall', count: 5, size: [9, 13], dur: [14, 22], colors: ['#6f9a5c', '#88b06f', '#5c7f48']}],
    burst: {shape: 'paw', colors: ['#a0603a', '#c58a5a', '#e39b93']}},
};
/* Seasonal themes: free to use, but only in their months (testing mode shows them all year) */
Object.assign(SPECIALS, {
  xmas: {name: 'Summer Christmas', badge: 'gift', glow: 'rgba(255,240,180,.8)', desc: 'Pōhutukawa, sunshine and a beach barbie', season: [12],
    colors: {bg:'#8fd6f7', panel:'#ffffff', ink:'#1f2d33', muted:'#5b6d74', line:'#1f2d33', thin:'#dfe8ea', peer:'#eef7fb', same:'#fbd4cf', sel:'#f5a59b', entry:'#c62f36', bad:'#b3261e', badbg:'#f9d6d2', accent:'#d62f3a', onaccent:'#ffffff', btn:'#ffffff', gold:'#b8740a', ok:'#2f7d4f', harea:'#fff3c4', hkey:'#ffd36b', helim:'#f6c9c2'},
    fx: [{shape: 'gull', anim: 'swim', count: 2, every: [3, 7], size: [20, 30], dur: [14, 22], colors: ['#ffffff']}],
    burst: {shape: 'pohutukawa', colors: ['#d62f3a', '#e8414b', '#ffd36b']}},
  matariki: {name: 'Matariki', badge: 'sparkle', glow: 'rgba(200,215,255,.9)', desc: 'The Matariki stars rising in the winter sky', season: [6, 7],
    colors: {bg:'#0a1230', panel:'#121c42', ink:'#eef1ff', muted:'#a3acd6', line:'#dfe5ff', thin:'#2a3670', peer:'#18234f', same:'#263575', sel:'#3a4ca8', entry:'#ffd98a', bad:'#ff7a8a', badbg:'#4a2340', accent:'#9fb3ff', onaccent:'#0a1230', btn:'#1b2654', gold:'#ffd98a', ok:'#7de0b0', harea:'#262f58', hkey:'#6b5a1f', helim:'#4d2440'},
    fx: [{shape: 'star', anim: 'twinkle', count: 40, size: [3, 8], dur: [3.5, 8], colors: ['#ffffff', '#dfe6ff', '#ffe9b8']}],
    burst: {shape: 'star', colors: ['#ffffff', '#ffd98a', '#c9d3ff']}},
  anzac: {name: 'ANZAC', badge: 'poppy', glow: 'rgba(255,170,150,.55)', desc: 'Poppies, in remembrance', season: [4],
    colors: {bg:'#e6dccf', panel:'#fdfaf5', ink:'#2b2622', muted:'#6d6258', line:'#2b2622', thin:'#e0d6c8', peer:'#f5eee4', same:'#f0d6cf', sel:'#e3aaa3', entry:'#9e1f28', bad:'#b3261e', badbg:'#f6d6d2', accent:'#a3222b', onaccent:'#ffffff', btn:'#efe6da', gold:'#9a6b1e', ok:'#4f6f3a', harea:'#f6ead0', hkey:'#ecc96a', helim:'#f3cfc8'},
    fx: [{shape: 'petal', anim: 'fall', count: 6, size: [8, 12], dur: [16, 26], colors: ['#c8202b', '#a8131f', '#e23a40']}],
    burst: {shape: 'petal', colors: ['#c8202b', '#a8131f', '#e23a40']}},
  spooky: {name: 'Spooky', badge: 'ghost', glow: 'rgba(255,150,60,.8)', desc: 'Bats, a black cat and pumpkins', season: [10],
    colors: {bg:'#1b1426', panel:'#251c34', ink:'#f4ecff', muted:'#a99cbf', line:'#e6dcf5', thin:'#3d3154', peer:'#2c2140', same:'#47305e', sel:'#6a3f86', entry:'#ffa94d', bad:'#ff6b7d', badbg:'#4a1d2c', accent:'#ff8a2a', onaccent:'#1b1426', btn:'#2f2443', gold:'#ffc24d', ok:'#8be08a', harea:'#3a2a47', hkey:'#7a4a1c', helim:'#552033'},
    fx: [{shape: 'bat', anim: 'swim', count: 11, every: [.45, 1.3], size: [18, 34], dur: [7, 14], colors: ['#0d0a12', '#1e1629', '#140f1c']},
         {shape: 'star', anim: 'twinkle', count: 12, size: [3, 6], dur: [2, 5], colors: ['#f4ecff', '#ffc24d']}],
    burst: {shape: 'pumpkin', colors: ['#ff8a2a', '#ff9f43', '#f27c1b']}},
  easter: {name: 'Easter', badge: 'egg', glow: 'rgba(255,255,255,.85)', desc: 'An Easter bunny and nests of eggs', season: [4],
    colors: {bg:'#f3f0fb', panel:'#ffffff', ink:'#3a3350', muted:'#857d9e', line:'#3a3350', thin:'#e1dbef', peer:'#f1ecfb', same:'#dcd2f5', sel:'#c2b3ef', entry:'#7c5cc9', bad:'#d64545', badbg:'#fde4e4', accent:'#8a6ad6', onaccent:'#ffffff', btn:'#ebe5f7', gold:'#c48a00', ok:'#3f9a6a', harea:'#fff4d1', hkey:'#ffd56b', helim:'#ffd2d2'},
    fx: [{shape: 'egg', anim: 'fall', count: 12, size: [11, 16], dur: [11, 18], colors: ['#f7b6c9', '#b8e3c8', '#bcd7f7', '#f8e3a1', '#d9c6f5']}],
    burst: {shape: 'egg', colors: ['#f7b6c9', '#b8e3c8', '#bcd7f7', '#f8e3a1', '#d9c6f5']}},
});
const SEASONAL_ORDER = ['xmas', 'easter', 'anzac', 'matariki', 'spooky'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const thisMonth = () => new Date().getMonth() + 1;
const inSeason = id => SPECIALS[id] && SPECIALS[id].season && SPECIALS[id].season.includes(thisMonth());
const seasonText = id => SPECIALS[id].season.map(m => MONTH_NAMES[m - 1]).join(' – ');
for (const [id, t] of Object.entries(SPECIALS)) THEMES[id] = {name: t.name, ...t.colors};
const DARK_THEMES = ['dark', 'midnight', 'sea', 'space', 'snow', 'neon', 'gold', 'matariki', 'spooky'];

// Little line icons for each special theme's badge (24 × 24, drawn with strokes)
const BADGES = {
  flower: '<circle cx="12" cy="12" r="2.3"/><path d="M12 9.7C10.2 6.3 10.7 3.6 12 3c1.3.6 1.8 3.3 0 6.7zM14.2 11.3c2.4-3 4.9-3.4 5.7-2.2.2 1.5-1.9 3.2-5.7 2.2zM13.4 14c3.6.9 4.8 3.2 4 4.3-1.4.6-3.4-.9-4-4.3zM10.6 14c-.6 3.4-2.6 4.9-4 4.3-.8-1.1.4-3.4 4-4.3zM9.8 11.3C6 12.3 3.9 10.6 4.1 9.1c.8-1.2 3.3-.8 5.7 2.2z"/>',
  fish: '<path d="M3 12c3-5 9-6 14 0-5 6-11 5-14 0z"/><path d="M17 12l4-3.5v7z"/><path d="M7.5 11h.01"/>',
  leaf: '<path d="M5 19C5 10 10 4 20 4c0 10-6 15-15 15z"/><path d="M5 19l9-9"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  snowflake: '<path d="M12 2.5v19M3.8 7.3l16.4 9.4M3.8 16.7l16.4-9.4"/><path d="M9.5 4L12 6.5 14.5 4M9.5 20L12 17.5 14.5 20"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  bolt: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
  gift: '<rect x="3.5" y="9" width="17" height="11.5" rx="1.5"/><path d="M2.5 9h19V5.5h-19zM12 5.5v15M12 5.5C10 2 6.5 2.4 7 4.6 7.4 6 10 5.5 12 5.5zM12 5.5c2-3.5 5.5-3.1 5-.9-.4 1.4-3 .9-5 .9z"/>',
  ghost: '<path d="M5 20.5V10a7 7 0 0 1 14 0v10.5l-2.5-2-2.3 2-2.2-2-2.2 2-2.3-2z"/><path d="M9.5 10.5h.01M14.5 10.5h.01"/>',
  poppy: '<circle cx="12" cy="12.5" r="2.4"/><path d="M12 10C10 5.5 4.5 5 4 9s3.4 4.6 5.6 3.5M14.4 12.5c2.2 1.1 5.6.5 5.6-3.5s-6-3.5-8 1M9.6 13c-2.4 1.6-3.4 5.6.6 6.4 1.4.3 2.2-.4 1.8-4.6M14.4 13c2.4 1.6 3.4 5.6-.6 6.4-1.4.3-2.2-.4-1.8-4.6"/>',
  egg: '<path d="M12 2.5c4.4 0 7 7.5 7 11a7 7 0 0 1-14 0c0-3.5 2.6-11 7-11z"/><path d="M5.6 12.5l2.6-1.8 2.6 1.8 2.4-1.8 2.6 1.8 2.6-1.8"/>',
  cat: '<path d="M4.5 10.5V4l4.2 3.2a8 8 0 0 1 6.6 0L19.5 4v6.5a7.5 7.5 0 0 1-15 0z"/><path d="M9.5 12h.01M14.5 12h.01M10.8 15c.7.6 1.7.6 2.4 0"/>',
  crown: '<path d="M3.5 8l4 4L12 5l4.5 7 4-4-1.5 10h-14z"/><path d="M5 20.5h14"/>',
  sparkle: '<path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6-5.6-1.9 5.6-1.9z"/><path d="M19 15.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z"/>',
  lock: '<rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
};

/* ---------- decorations ---------- */
function particleSVG(shape, c) {
  switch (shape) {
    case 'petal':    return `<svg viewBox="0 0 20 20"><path d="M10 1.5c4.5 4 4.5 11 0 17-4.5-6-4.5-13 0-17z" fill="${c}"/></svg>`;
    case 'bubble':   return `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="7" cy="7" r="2" fill="${c}"/></svg>`;
    case 'star':     return `<svg viewBox="0 0 20 20"><path d="M10 0l2.2 7.8L20 10l-7.8 2.2L10 20l-2.2-7.8L0 10l7.8-2.2z" fill="${c}"/></svg>`;
    case 'leaf':     return `<svg viewBox="0 0 20 20"><path d="M2 18C2 9 7 3 18 2c-1 11-7 16-16 16z" fill="${c}"/><path d="M2.5 17.5L11 9" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/></svg>`;
    case 'snow':     return `<svg viewBox="0 0 20 20" stroke="${c}" stroke-width="1.8" stroke-linecap="round"><path d="M10 1v18M2.2 5.5l15.6 9M2.2 14.5l15.6-9"/></svg>`;
    case 'confetti': return `<svg viewBox="0 0 20 20"><rect x="5" y="2" width="10" height="16" rx="2" fill="${c}"/></svg>`;
    case 'pixel':    return `<svg viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" fill="${c}"/></svg>`;
    // fish face right (head on the right); right-to-left swimmers are mirrored in CSS
    case 'fish':     return `<svg viewBox="0 0 24 16"><path d="M23 8c-4-6-11-7-16 0 5 7 12 6 16 0z" fill="${c}"/><path d="M7.5 8L1 2.5v11z" fill="${c}"/><path d="M13 3.5c1 1.5 1 7.5 0 9" stroke="rgba(0,0,0,.18)" stroke-width="1" fill="none"/><circle cx="18.5" cy="7" r="1.3" fill="#06283b"/></svg>`;
    case 'shoot':    return `<i style="background:linear-gradient(90deg,transparent,${c})"></i>`;
    case 'flake':    return `<svg viewBox="0 0 20 20"><path d="M3 7l8-5 6 9-8 7z" fill="${c}"/><path d="M11 2l6 9-6-2z" fill="rgba(255,255,255,.45)"/></svg>`;
    case 'pohutukawa': return `<svg viewBox="0 0 20 20"><g stroke="${c}" stroke-width="1.3" stroke-linecap="round">${[...Array(14)].map((_, k) => { const a = k / 14 * Math.PI * 2; return `<path d="M10 10L${(10 + Math.cos(a) * 8).toFixed(1)} ${(10 + Math.sin(a) * 8).toFixed(1)}"/>`; }).join('')}</g>${[...Array(14)].map((_, k) => { const a = k / 14 * Math.PI * 2; return `<circle cx="${(10 + Math.cos(a) * 8.4).toFixed(1)}" cy="${(10 + Math.sin(a) * 8.4).toFixed(1)}" r="1" fill="#ffd36b"/>`; }).join('')}<circle cx="10" cy="10" r="2.6" fill="${c}"/></svg>`;
    case 'bat':      return `<svg viewBox="0 0 32 16"><g class="batwing"><path d="M16 6C13 2 8 1 1 3c3 1 4 3 4 5 2-1 4-1 5 1 1-2 3-2 6-1z" fill="${c}"/><path d="M16 6c3-4 8-5 15-3-3 1-4 3-4 5-2-1-4-1-5 1-1-2-3-2-6-1z" fill="${c}"/></g><ellipse cx="16" cy="8" rx="2.6" ry="3.4" fill="${c}"/><path d="M14.4 5.2l.6-1.8.8 1.4M17.6 5.2l-.6-1.8-.8 1.4" fill="${c}" stroke="${c}" stroke-width=".6"/><circle cx="15.1" cy="7.4" r=".55" fill="#ffb347"/><circle cx="16.9" cy="7.4" r=".55" fill="#ffb347"/></svg>`;
    case 'pumpkin':  return `<svg viewBox="0 0 20 20"><path d="M10 5.5c-1-2 0-3.5 1.5-4" stroke="#4f7a32" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cx="6.5" cy="12" rx="4.5" ry="6" fill="${c}"/><ellipse cx="13.5" cy="12" rx="4.5" ry="6" fill="${c}"/><ellipse cx="10" cy="12" rx="4" ry="6.4" fill="${c}" stroke="rgba(0,0,0,.18)" stroke-width=".8"/></svg>`;
    case 'egg':      return `<svg viewBox="0 0 20 20"><path d="M10 1.5C14.5 1.5 17 9 17 12.5S14 18.5 10 18.5 3 16 3 12.5 5.5 1.5 10 1.5z" fill="${c}"/><path d="M3.6 11.2l2.6-1.6 2.6 1.6 2.4-1.6 2.6 1.6 2.6-1.6" stroke="#fff" stroke-width="1.3" fill="none" stroke-linejoin="round" opacity=".9"/><circle cx="7" cy="14.6" r="1" fill="#fff" opacity=".85"/><circle cx="10.5" cy="15.4" r="1" fill="#fff" opacity=".85"/><circle cx="13.6" cy="14.4" r="1" fill="#fff" opacity=".85"/></svg>`;
    case 'gull':     return `<svg viewBox="0 0 24 10"><path class="gullwing" d="M1 5C5 1 9 2 12 7 15 2 19 1 23 5" stroke="${c}" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case 'heart':    return `<svg viewBox="0 0 20 20"><path d="M10 17.5S2.5 12.6 2.5 7.4A4 4 0 0 1 10 5a4 4 0 0 1 7.5 2.4c0 5.2-7.5 10.1-7.5 10.1z" fill="${c}"/></svg>`;
    case 'paw':      return `<svg viewBox="0 0 20 20"><ellipse cx="10" cy="13.2" rx="4.6" ry="3.8" fill="${c}"/><ellipse cx="4.4" cy="8.6" rx="1.9" ry="2.4" fill="${c}"/><ellipse cx="8" cy="5.2" rx="1.9" ry="2.5" fill="${c}"/><ellipse cx="12" cy="5.2" rx="1.9" ry="2.5" fill="${c}"/><ellipse cx="15.6" cy="8.6" rx="1.9" ry="2.4" fill="${c}"/></svg>`;
    case 'coin':     return `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="${c}"/><circle cx="10" cy="10" r="9" fill="none" stroke="#8a6414" stroke-width="1"/><circle cx="10" cy="10" r="6" fill="none" stroke="rgba(255,248,214,.8)" stroke-width="1.2"/><path d="M6.5 6.5l3 3" stroke="#fffbe6" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  }
  return '';
}
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.random() * arr.length | 0];
const reduceMotion = () => C.reduceMotion();
const ms = t => reduceMotion() ? 0 : t;   // waits that only exist for animations disappear with reduce motion

let fxTimers = [];
// Fish and shooting stars are spawned one at a time with fresh random paths, so they never repeat a route
function spawnRoaming(layer, f, warm) {
  const p = document.createElement('span'), dur = rnd(...f.dur), size = rnd(...f.size);
  if (f.anim === 'swim') {
    p.className = `p p-swim sh-${f.shape}` + (Math.random() < 0.5 ? ' rtl' : '');
    p.style.cssText = `--size:${size}px;--d:${dur}s;--bob:${rnd(4, 14)}px;top:${rnd(6, 92)}%;` +
      (warm ? `animation-delay:${-rnd(0, dur * 0.9)}s;` : '');
    p.innerHTML = particleSVG(f.shape, pick(f.colors));
  } else {
    const ang = rnd(12, 42) * (Math.random() < 0.25 ? -1 : 1);
    p.className = 'p p-shoot';
    p.style.cssText = `--len:${size}px;--d:${dur}s;--ang:${ang}deg;--dist:${rnd(180, 380)}px;top:${rnd(0, 55)}%;left:${rnd(-5, 75)}%;`;
    p.innerHTML = particleSVG('shoot', pick(f.colors));
  }
  p.addEventListener('animationend', e => { if (e.target === p || e.target.parentNode === p) p.remove(); });
  layer.appendChild(p);
}
function buildFx(id) {
  const layer = document.getElementById('fx');
  layer.innerHTML = '';
  fxTimers.forEach(clearTimeout); fxTimers = [];
  document.body.dataset.fx = SPECIALS[id] ? id : '';
  if (!SPECIALS[id] || !C.fxOn()) return;
  for (const f of SPECIALS[id].fx) {
    if (f.anim !== 'swim' && f.anim !== 'shoot') continue;
    if (f.anim === 'swim') for (let n = 0; n < f.count; n++) spawnRoaming(layer, f, true);   // some already mid-swim
    const loop = () => {
      if (layer.querySelectorAll(f.anim === 'swim' ? '.p-swim' : '.p-shoot').length < f.count) {
        spawnRoaming(layer, f, false);
        if (f.anim === 'shoot' && Math.random() < 0.2) spawnRoaming(layer, f, false);   // now and then, two at once
      }
      fxTimers.push(setTimeout(loop, rnd(...f.every) * 1000));
    };
    fxTimers.push(setTimeout(loop, rnd(0.3, 1.5) * 1000));
  }
  for (const f of SPECIALS[id].fx.filter(f => f.anim !== 'swim' && f.anim !== 'shoot')) for (let n = 0; n < f.count; n++) {
    const p = document.createElement('span');
    const size = rnd(...f.size), dur = rnd(...f.dur);
    p.className = `p p-${f.anim}`;
    p.style.cssText = `--size:${size}px;--d:${dur}s;--delay:${-rnd(0, dur)}s;--sway:${rnd(-40, 40)}px;--rot:${rnd(-540, 540)}deg;` +
      (f.anim === 'twinkle' ? `top:${rnd(0, 100)}%;left:${rnd(0, 100)}%;` : `left:${rnd(0, 100)}%;`);
    p.innerHTML = particleSVG(f.shape, pick(f.colors));
    layer.appendChild(p);
  }
}
// A loafing, sleepy cat, drawn facing right: head sunk into its shoulders, chin resting on tucked
// paws, body melting outward at the base. The board's top-left corner sits at (14, 62) in this
// drawing, so the cat rests on the board's top edge, its tail curled around in front of it.
// mirrored = true is for the right-hand cat (the wrapper flips it), so its z's are drawn reversed.
function catSVG(c, mirrored) {
  const z = (x, y, s, k) => mirrored
    ? `<path class="z z${k}" d="M${x + s} ${y}h${-s}l${s} ${s}h${-s}" />`
    : `<path class="z z${k}" d="M${x} ${y}h${s}l${-s} ${s}h${s}" />`;
  // The tail curls back around the cat: out from behind its rump, round the back of its base, and along
  // the board's top edge in front of its tummy, with the tip curling up short of the paws.
  const tailBase = 'M24 50.4C18 52.4 15.6 58.4 20.4 61';               // round the rump: never moves
  const tailMain = 'M20.4 61C27 63.2 40 62.9 51.5 61.2';                   // along the board: swooshes from (20.4, 61)
  const tailTip  = 'M51.5 61.2C56.5 60.4 60.6 59.2 63.6 56.6';     // one smooth upward sweep, no hook
  return `<svg class="catsvg" viewBox="0 0 120 112" aria-hidden="true">
  <ellipse cx="60" cy="62.4" rx="44" ry="3" fill="rgba(60,35,15,.22)"/>
  <defs>
    <clipPath id="tailclip${mirrored ? 1 : 0}"><rect x="0" y="0" width="31" height="56"/></clipPath>
    <mask id="tailmask${mirrored ? 1 : 0}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="112">
      <rect width="120" height="112" fill="#fff"/>
      <g clip-path="url(#tailclip${mirrored ? 1 : 0})"><path d="M20.5 62C18.4 58.5 18.6 54 19.8 50C22 41.5 30 35.4 41.5 33.6C52.5 31.3 64.5 31.6 73.5 35C80 37.5 85 39.4 91 40.4C99.5 42 104.5 50 103.5 57C103.2 59.5 103.4 61 104.2 62Z" fill="#000" stroke="#000" stroke-width="1.6"/></g>
    </mask>
  </defs>
  <g class="breathe">
    <!-- body: a low loaf whose base spreads out on both sides, shoulders rising up around the head -->
    <path d="M20.5 62C18.4 58.5 18.6 54 19.8 50C22 41.5 30 35.4 41.5 33.6C52.5 31.3 64.5 31.6 73.5 35C80 37.5 85 39.4 91 40.4C99.5 42 104.5 50 103.5 57C103.2 59.5 103.4 61 104.2 62Z" fill="${c.fur}" stroke="${c.line}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M23.5 61.6C21.5 53.5 28.5 47 38.5 47.4C46.5 47.8 49.6 54.5 46.8 61.6Z" fill="${c.shade}"/>
    <path d="M23.5 61.6C21.5 53.5 28.5 47 38.5 47.4" stroke="${c.line}" stroke-width="1.1" fill="none" opacity=".4" stroke-linecap="round"/>
    <path d="M58 61.6C59.5 57 63.5 54.8 68 55.6" stroke="${c.line}" stroke-width="1.1" fill="none" opacity=".35" stroke-linecap="round"/>
    <path d="M40 35.5q3.6 6.2 1.5 12.2M50.5 33q3.8 6.8 1.6 13.4M61 32.6q3.2 6.6 1 12.8M70.5 35q2.6 5.6.6 10.8" stroke="${c.stripe}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M28.5 49q2.5 3 2 7M34 47.6q2.6 3.4 2 8" stroke="${c.stripe}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>
    <!-- chest ruff peeking out under the chin -->
    <path d="M76 59.5C78 56.5 94 56.5 96 59.5C93 61.6 79 61.6 76 59.5Z" fill="${c.light}"/>
  </g>
  <g class="tail" mask="url(#tailmask${mirrored ? 1 : 0})">
    <path d="${tailBase}" stroke="${c.line}" stroke-width="9.4" fill="none" stroke-linecap="round" opacity=".7"/>
    <g class="tailmid"><path d="${tailMain}" stroke="${c.line}" stroke-width="9.4" fill="none" stroke-linecap="round" opacity=".7"/>
      <g class="tailtip"><path d="${tailTip}" stroke="${c.line}" stroke-width="9.4" fill="none" stroke-linecap="round" opacity=".7"/></g></g>
    <path d="${tailBase}" stroke="${c.fur}" stroke-width="6.8" fill="none" stroke-linecap="round"/>
    <g class="tailmid">
      <path d="${tailMain}" stroke="${c.fur}" stroke-width="6.8" fill="none" stroke-linecap="round"/>
      <path d="M30.5 59v4.2M38.5 59.2v4.1M46.5 58.8v4" stroke="${c.stripe}" stroke-width="2" stroke-linecap="round"/>
      <g class="tailtip">
        <path d="${tailTip}" stroke="${c.fur}" stroke-width="6.8" fill="none" stroke-linecap="round"/>
        <path d="M55.6 57.6l.9 3.6" stroke="${c.stripe}" stroke-width="2" stroke-linecap="round"/>
        <path d="${tailTip}" pathLength="100" stroke-dasharray="32 100" stroke-dashoffset="-68" stroke="${c.tip}" stroke-width="6.8" fill="none" stroke-linecap="round"/>
      </g>
    </g>
  </g>
  <g class="headg">
  <g transform="translate(86 61) scale(1.1 .94) translate(-86 -59.4)">
    <!-- ears: wide-set, gently rounded tips -->
    <path class="ear ear-l" d="M72.6 44C71.4 38 71.8 32.6 73.6 28.6C77.4 31.2 80.6 34.4 82.4 38Z" fill="${c.fur}" stroke="${c.line}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M74.8 39.6C74.4 36.4 74.6 33.6 75.4 31.8C77.4 33.4 79 35.2 80 37.2Z" fill="${c.ear}"/>
    <g class="ear-r">
      <path d="M89.6 38C91.4 34.4 94.6 31.2 98.4 28.6C100.2 32.6 100.6 38 99.4 44Z" fill="${c.fur}" stroke="${c.line}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M92 37.2C93 35.2 94.6 33.4 96.6 31.8C97.4 33.6 97.6 36.4 97.2 39.6Z" fill="${c.ear}"/>
    </g>
    <!-- head: flat-ish crown, broad fluffy cheeks, chin sunk down onto the paws -->
    <path d="M70.6 49.5C69.8 42.6 75.4 37.2 86 37.2C96.6 37.2 102.2 42.6 101.4 49.5C103.6 51.6 103.4 55.6 100.4 57.2C101.4 58.2 101 59.4 99.4 59.6C94.6 61.6 77.4 61.6 72.6 59.6C71 59.4 70.6 58.2 71.6 57.2C68.6 55.6 68.4 51.6 70.6 49.5Z" fill="${c.fur}" stroke="${c.line}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M81.6 39v3.8M86 38.2v4.4M90.4 39v3.8" stroke="${c.stripe}" stroke-width="2" stroke-linecap="round"/>
    <path d="M71.4 47.8q-1.6.2-2.6 1M100.6 47.8q1.6.2 2.6 1" stroke="${c.stripe}" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
    <path d="M78.6 53.6C79.6 51 92.4 51 93.4 53.6C94.2 56.8 90.6 58.8 86 58.8C81.4 58.8 77.8 56.8 78.6 53.6Z" fill="${c.light}"/>
    <ellipse cx="76.4" cy="53.4" rx="2.8" ry="1.5" fill="#f08f8a" opacity=".45"/>
    <ellipse cx="95.6" cy="53.4" rx="2.8" ry="1.5" fill="#f08f8a" opacity=".45"/>
    <g class="eyes-shut" stroke="${c.dark}" stroke-width="1.7" fill="none" stroke-linecap="round">
      <path d="M75.6 48.6q3.2 2.6 6.4 0"/><path d="M90 48.6q3.2 2.6 6.4 0"/>
    </g>
    <g class="eyes-open">
      <ellipse cx="78.8" cy="48.4" rx="3.3" ry="3.5" fill="${c.eye}" stroke="${c.pupil || c.dark}" stroke-width="1"/>
      <ellipse cx="93.2" cy="48.4" rx="3.3" ry="3.5" fill="${c.eye}" stroke="${c.pupil || c.dark}" stroke-width="1"/>
      <ellipse cx="79" cy="48.8" rx="2.35" ry="2.6" fill="${c.pupil || c.dark}"/><ellipse cx="93.4" cy="48.8" rx="2.35" ry="2.6" fill="${c.pupil || c.dark}"/>
      <circle cx="80.1" cy="47.4" r="1.05" fill="#fff"/><circle cx="94.5" cy="47.4" r="1.05" fill="#fff"/>
      <circle cx="78" cy="50.1" r=".5" fill="#fff" opacity=".9"/><circle cx="92.4" cy="50.1" r=".5" fill="#fff" opacity=".9"/>
    </g>
    <path d="M84.4 52.4h3.2l-1.6 1.8z" fill="#e0817a" stroke="#b5615a" stroke-width=".5" stroke-linejoin="round"/>
    <path d="M86 54.2q-1.2 1.8-3 1M86 54.2q1.2 1.8 3 1" stroke="${c.dark}" stroke-width="1" fill="none" stroke-linecap="round"/>
    <path d="M79.6 54.6l-9 -1.2M79.6 56.2l-8.8 1.4M92.4 54.6l9 -1.2M92.4 56.2l8.8 1.4" stroke="${c.dark}" stroke-width=".6" opacity=".45" stroke-linecap="round"/>
  </g>
  </g>
  <!-- front paws tucked under the chin -->
  <g class="paws">
    <path d="M73.6 62C73 59.4 75 58 78.6 58C82.2 58 84 59.4 83.6 62Z" fill="${c.light}" stroke="${c.line}" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M86.4 62C86 59.4 87.8 58 91.4 58C95 58 97 59.4 96.4 62Z" fill="${c.light}" stroke="${c.line}" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M76.8 60.4v1.4M79.4 60.2v1.6M89.6 60.2v1.6M92.2 60.4v1.4" stroke="${c.line}" stroke-width=".8" opacity=".45" stroke-linecap="round"/>
  </g>
  <g class="zzz" stroke="${c.dark}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${z(103, 26, 4, 1)}${z(108, 17, 5, 2)}${z(114, 7, 6, 3)}
  </g>
  <ellipse class="petzone" cx="62" cy="47" rx="46" ry="17" fill="transparent"/>
</svg>`;
}
const CAT_COATS = [
  // index 2: a black cat for the Spooky theme (light features so its face shows up, dark pupils)
  {fur: '#dc8d4f', shade: '#cf7c3d', stripe: '#b8672b', light: '#f5d6ae', line: '#7d4a22', tip: '#f5d6ae', ear: '#f2a9a0', dark: '#4e2e15', eye: '#9fc36a'},   // ginger
  {fur: '#a59a90', shade: '#978b80', stripe: '#6f655c', light: '#efe7dc', line: '#55493f', tip: '#6f655c', ear: '#efb0aa', dark: '#3b322b', eye: '#e6c25a'},   // grey tabby,
  {fur: '#26222c', shade: '#1d1a22', stripe: '#302b37', light: '#3a3443', line: '#4f465c', tip: '#26222c', ear: '#7d5868', dark: '#c3b8d6', eye: '#cfe84f', pupil: '#0c0a0f'},   // black
];

// Put the two cats on the board when Catnap is the theme; take them away otherwise
/* ---------- Alex theme: a leafy vine growing around the board ---------- */
const PLANT = {leaf: '#6f9a5c', leaf2: '#88b06f', dark: '#46693a', vein: '#a9c98f', stem: '#5c7f48'};

// A heart-shaped pothos leaf whose stalk is at (0,0), pointing down (+y) before rotation
const pothosLeaf = (x, y, rot, s, light, k) =>
  `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${s.toFixed(2)})">
    <g class="pleaf" style="--d:${(2.6 + (k * 37 % 16) / 10).toFixed(2)}s;--delay:${(-(k * 53 % 30) / 10).toFixed(1)}s;--k:${k}">
    <path d="M0 0C3 -2.4 9.5 -.6 9.5 5.6C9.5 10.4 4.6 13.6 0 17.4C-4.6 13.6 -9.5 10.4 -9.5 5.6C-9.5 -.6 -3 -2.4 0 0Z" fill="${light ? PLANT.leaf2 : PLANT.leaf}" stroke="${PLANT.dark}" stroke-width="1.2"/>
    <path d="M0 1.5V14.5M0 6l3.6-2.6M0 9.5l4-2.4M0 6l-3.6-2.6M0 9.5l-4-2.4" stroke="${PLANT.vein}" stroke-width=".9" stroke-linecap="round" fill="none" opacity=".85"/>
  </g></g>`;

// Walk the board's outline (rounded rectangle) from just under the left cat, down, along the
// bottom, and up to just under the right cat, returning evenly spaced points with outward normals.
function boardOutline(W, H, m, r, step) {
  const pts = [];
  const seg = (x0, y0, x1, y1, nx, ny) => {
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / step));
    for (let k = 0; k < n; k++) pts.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, nx, ny]);
  };
  const arc = (cx, cy, a0, a1) => {
    const n = Math.max(2, Math.round(r * Math.PI / 2 / step));
    for (let k = 0; k < n; k++) { const a = a0 + (a1 - a0) * k / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), Math.cos(a), Math.sin(a)]); }
  };
  const L = m, T = m, R = m + W, B = m + H, under = Math.min(46, W * .14);
  seg(L + under, T, L + r, T, 0, -1);                   // from under the left cat, along the top edge
  arc(L + r, T + r, -Math.PI / 2, -Math.PI);            // round the top-left corner
  seg(L, T + r, L, B - r, -1, 0);                       // down the left side
  arc(L + r, B - r, Math.PI, Math.PI / 2);              // bottom-left corner
  seg(L + r, B, R - r, B, 0, 1);                        // along the bottom
  arc(R - r, B - r, Math.PI / 2, 0);                    // bottom-right corner
  seg(R, B - r, R, T + r, 1, 0);                        // up the right side
  arc(R - r, T + r, 0, -Math.PI / 2);                   // round the top-right corner
  seg(R - r, T, R - under, T, 0, -1);                   // and in under the right cat
  pts.push([R - under, T, 0, -1]);
  return pts;
}

const BORDER_THEMES = ['cats', 'xmas', 'anzac'];
function buildBorder() {
  const id = document.body.dataset.fx;
  document.getElementById('boardWrap').querySelectorAll('.vineborder').forEach(x => x.remove());
  if (id === 'cats') buildVine(); else if (id === 'xmas') buildGarland(); else if (id === 'anzac') buildPoppies();
}
// The whole rounded-rectangle outline of the board, clockwise from the top-left, with outward normals
function boardLoop(W, H, m, r, step) {
  const pts = [], L = m, T = m, R = m + W, B = m + H;
  const seg = (x0, y0, x1, y1, nx, ny) => {
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 0; k < n; k++) pts.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, nx, ny]);
  };
  const arc = (cx, cy, a0, a1) => {
    const n = Math.max(2, Math.round(r * Math.PI / 2 / step));
    for (let k = 0; k < n; k++) { const a = a0 + (a1 - a0) * k / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), Math.cos(a), Math.sin(a)]); }
  };
  seg(L + r, T, R - r, T, 0, -1); arc(R - r, T + r, -Math.PI / 2, 0);
  seg(R, T + r, R, B - r, 1, 0);  arc(R - r, B - r, 0, Math.PI / 2);
  seg(R - r, B, L + r, B, 0, 1);  arc(L + r, B - r, Math.PI / 2, Math.PI);
  seg(L, B - r, L, T + r, -1, 0); arc(L + r, T + r, Math.PI, Math.PI * 1.5);
  return pts;
}
function mountBorder(W, H, m, inner) {
  const div = document.createElement('div');
  div.className = 'vineborder';
  div.style.left = div.style.top = -m + 'px';
  div.setAttribute('aria-hidden', 'true');
  div.innerHTML = `<svg width="${W + 2 * m}" height="${H + 2 * m}" viewBox="0 0 ${W + 2 * m} ${H + 2 * m}">${inner}</svg>`;
  const wrap = document.getElementById('boardWrap');
  wrap.insertBefore(div, document.getElementById('board').nextSibling);
}
// Summer Christmas: a lush pine garland all the way round, with pōhutukawa flowers and fairy lights
const pohuSVG = (x, y, s) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})">${[...Array(14)].map((_, k) => {
  const a = k / 14 * Math.PI * 2, ex = Math.cos(a) * 7.5, ey = Math.sin(a) * 7.5;
  return `<path d="M0 0L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#d62f3a" stroke-width="1.3" stroke-linecap="round"/><circle cx="${(ex * 1.08).toFixed(1)}" cy="${(ey * 1.08).toFixed(1)}" r=".95" fill="#ffd36b"/>`; }).join('')}<circle r="2.4" fill="#b8202a"/></g>`;
function buildGarland() {
  const board = document.getElementById('board'), W = board.offsetWidth, H = board.offsetHeight, m = 18;
  if (!W) return;
  const pts = boardLoop(W, H, m, 10, 3.2);
  let boughs = '', extras = '', lights = '';
  pts.forEach(([x, y, nx, ny], k) => {
    const tx = -ny, ty = nx, base = Math.atan2(ty, tx) * 180 / Math.PI;
    for (const side of [-1, 1]) {
      const off = 4.6 + ((k * 7 + (side > 0 ? 3 : 0)) % 5) * .45;
      const cx = x + nx * off, cy = y + ny * off;
      boughs += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="6.4" ry="2.3" transform="rotate(${(base + side * (34 + (k * 11) % 16)).toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${(k + (side > 0)) % 3 ? '#2f7a43' : '#3f9254'}"/>`;
    }
  });
  const every = Math.max(10, Math.round(pts.length / 26));
  for (let k = 0, n = 0; k < pts.length; k += every, n++) {
    const [x, y, nx, ny] = pts[k];
    extras += pohuSVG(x + nx * 6.5, y + ny * 6.5, .72 + (n % 3) * .07);
    const [x2, y2, nx2, ny2] = pts[(k + Math.floor(every / 2)) % pts.length];
    const col = ['#ffd36b', '#ff6b6b', '#5ad1e8', '#ffd36b', '#9be07a'][n % 5];
    lights += `<g class="bulb" style="animation-delay:${(-(n * 0.37) % 2.4).toFixed(2)}s"><circle cx="${(x2 + nx2 * 7.5).toFixed(1)}" cy="${(y2 + ny2 * 7.5).toFixed(1)}" r="4.2" fill="${col}" opacity=".35"/><circle cx="${(x2 + nx2 * 7.5).toFixed(1)}" cy="${(y2 + ny2 * 7.5).toFixed(1)}" r="2" fill="${col}"/></g>`;
  }
  mountBorder(W, H, m, `<g class="garland">${boughs}</g>${extras}${lights}`);
}
// ANZAC: a row of poppies growing up from the top edge of the board, swaying gently
const poppySVG = (s, bud) => bud
  ? `<g transform="scale(${s})"><path d="M0 0C-2.4 -1 -3 -4.5 -1.4 -6.4C.6 -7.4 2.6 -5.4 2.4 -2.6C2.2 -1 1.2 0 0 0Z" fill="#6f8a55" stroke="#4e663b" stroke-width=".6"/><path d="M-.4 -5.6C.4 -6.6 1.8 -6 1.6 -4.8" stroke="#c8202b" stroke-width="1.4" fill="none"/></g>`
  : `<g transform="scale(${s})">
      <ellipse cx="-3.6" cy="-1.2" rx="5" ry="4.2" fill="#a8131f"/><ellipse cx="3.6" cy="-1.2" rx="5" ry="4.2" fill="#a8131f"/>
      <ellipse cx="-3" cy="1.6" rx="4.8" ry="4" fill="#d22630"/><ellipse cx="3" cy="1.6" rx="4.8" ry="4" fill="#d22630"/>
      <ellipse cx="0" cy="-2.6" rx="4.4" ry="3.4" fill="#e23a40"/>
      <circle r="2.2" fill="#161214"/><circle r="3" fill="none" stroke="#2c2428" stroke-width=".7" stroke-dasharray=".6 .9"/></g>`;
function buildPoppies() {
  const board = document.getElementById('board'), W = board.offsetWidth, H = board.offsetHeight, m = 40;
  if (!W) return;
  let out = '';
  const n = Math.max(9, Math.round(W / 15));
  for (let k = 0; k < n; k++) {
    const x = m + 6 + (W - 12) * (k + .5) / n + Math.sin(k * 2.3) * 3;
    const h = 12 + ((k * 37) % 17), lean = Math.sin(k * 1.7) * 4, bud = k % 5 === 3;
    const tx = x + lean, ty = m - h;
    const leaf = k % 3 === 0 ? `<path d="M${x.toFixed(1)} ${m - 4}c-4 -1-6 -4-6.5 -6.5 2.5.3 5 2 6.5 4.5" fill="#6f8a55"/>` : '';
    out += `<g class="poppy" style="transform-origin:${x.toFixed(1)}px ${m}px;--d:${(3.2 + (k % 4) * .6).toFixed(1)}s;--delay:${(-k * .45).toFixed(2)}s">
      ${leaf}<path d="M${x.toFixed(1)} ${m}Q${(x + lean * .2).toFixed(1)} ${(m - h * .55).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}" stroke="#5f7a47" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <g transform="translate(${tx.toFixed(1)} ${(ty - (bud ? 0 : 3)).toFixed(1)})">${poppySVG(bud ? 1 : .78 + ((k * 13) % 5) * .06, bud)}</g></g>`;
  }
  mountBorder(W, H, m, out);
}
function buildVine() {
  const wrap = document.getElementById('boardWrap'), board = document.getElementById('board');
  const W = board.offsetWidth, H = board.offsetHeight, m = 16;
  if (!W) return;
  const pts = boardOutline(W, H, m, 10, 3);
  // the stem wanders gently either side of the board's border line
  const stem = pts.map(([x, y, nx, ny], k) => {
    const w = Math.sin(k * 0.21) * 1.6 + Math.sin(k * 0.07) * .8;
    return `${k ? 'L' : 'M'}${(x + nx * (1 + w)).toFixed(1)} ${(y + ny * (1 + w)).toFixed(1)}`;
  }).join('');
  // leaves every ~22px, fanning outward, alternating a little left and right of the normal
  const every = 7, leaves = [], buds = [];
  const cornerL = pts.findIndex(p => p[2] === -1 && p[3] === 0), cornerR = pts.length - 1 - [...pts].reverse().findIndex(p => p[2] === 1 && p[3] === 0);
  for (let k = cornerL + 2, n = 0; k < cornerR - 1; k += every, n++) {
    const [x, y, nx, ny] = pts[k];
    const out = Math.atan2(ny, nx) * 180 / Math.PI - 90;     // rotation that points a leaf outward
    const fan = (n % 2 ? 1 : -1) * (22 + (n * 13) % 16);
    const size = 0.56 + ((n * 7) % 5) * 0.035;
    leaves.push(pothosLeaf(x + nx * 1.5, y + ny * 1.5, out + fan, size, n % 3 === 1, n));
    if (n % 3 === 2) buds.push(`<circle cx="${(x + nx * 1.2).toFixed(1)}" cy="${(y + ny * 1.2).toFixed(1)}" r="1.6" fill="${PLANT.leaf2}" stroke="${PLANT.dark}" stroke-width=".7"/>`);
  }
  // at each top corner: a leaf peeking out diagonally and a little curling tendril
  const tl = [m + 10 - 10 * Math.SQRT1_2, m + 10 - 10 * Math.SQRT1_2], tr = [m + W - 10 + 10 * Math.SQRT1_2, tl[1]];
  leaves.push(pothosLeaf(tl[0] - 1, tl[1] - 1, 135, .62, true, 90), pothosLeaf(tr[0] + 1, tr[1] - 1, -135, .62, true, 91));
  const curl = (x, y, dir) => `<path class="tendril" d="M${x} ${y}c${-4 * dir} -1 ${-7 * dir} -4 ${-6 * dir} -8s${4 * dir} -3 ${5 * dir} 0 ${-1 * dir} 4 ${-3 * dir} 3" stroke="${PLANT.stem}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  buds.push(curl(m - 1, m + 16, 1), curl(m + W + 1, m + 16, -1));
  const svg = document.createElement('div');
  svg.className = 'vineborder';
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<svg width="${W + 2 * m}" height="${H + 2 * m}" viewBox="0 0 ${W + 2 * m} ${H + 2 * m}">
    <path class="vinestem" d="${stem}" pathLength="1" stroke="${PLANT.stem}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${buds.join('')}${leaves.join('')}</svg>`;
  wrap.insertBefore(svg, wrap.firstChild.nextSibling);
}
// Rebuild when the board changes size (rotating a phone, resizing a window)
let vineSize = '';
let vineRO = null;
function watchBoard() {
  const b = document.getElementById('board');
  if (!b || !window.ResizeObserver || (vineRO && vineRO.el === b)) return;
  if (vineRO) vineRO.disconnect();
  vineRO = new ResizeObserver(() => {
  const b = document.getElementById('board'), key = b.offsetWidth + 'x' + b.offsetHeight;
  if (key !== vineSize && BORDER_THEMES.includes(document.body.dataset.fx)) { vineSize = key; buildBorder(); }
  });
  vineRO.el = b; vineRO.observe(b);
}
function setupPlants(on) {
  watchBoard();
  document.querySelectorAll('#plants').forEach(x => x.remove());
  vineSize = '';
  if (on) requestAnimationFrame(buildBorder); else buildBorder();
}

function setupCats(id) {
  const wrap = document.getElementById('boardWrap');
  wrap.querySelectorAll('.catlayer').forEach(x => x.remove());
  if (id !== 'cats' && id !== 'spooky') return;
  const layer = document.createElement('div');
  layer.className = 'catlayer';
  layer.innerHTML = id === 'cats'
    ? `<div class="cat cat-a" data-cat="0">${catSVG(CAT_COATS[0], false)}</div>` +
      `<div class="cat cat-b" data-cat="1">${catSVG(CAT_COATS[1], true)}</div>`
    : `<div class="cat cat-a cat-black" data-cat="0">${catSVG(CAT_COATS[2], false)}</div>`;
  wrap.appendChild(layer);
  layer.querySelectorAll('.petzone').forEach(zone => zone.addEventListener('click', e => {
    e.stopPropagation();
    const cat = zone.closest('.cat');
    if (cat.classList.contains('petted')) return;
    cat.classList.remove('dozing');
    cat.classList.add('petted');                       // opens its eyes and gives a happy tail flick
    C.sound('mrrp', +cat.dataset.cat);
    burst(cat.querySelector('.headg'), 6, 40);         // a few little paw prints
    setTimeout(() => doze(cat), 1800);
  }));
}


/* ---------- background scenes for some seasonal themes ---------- */
// The nine stars of Matariki at their real J2000 positions (60′ × 36′ field), turned 180° from northern-hemisphere
// charts the way the cluster appears from Aotearoa: east on the right, north at the bottom. Sizes follow brightness.
const MATARIKI_STARS = [
  ['Matariki', 'Alcyone', 59.4, 29.7, 2.85],
  ['Tupu-ā-rangi', 'Atlas', 91.5, 22.6, 3.62],
  ['Waipuna-ā-rangi', 'Electra', 9.4, 30.9, 3.72],
  ['Waitī', 'Maia', 27.6, 66.1, 3.87],
  ['Ururangi', 'Merope', 37.2, 8.0, 4.14],
  ['Waitā', 'Taygeta', 15.8, 79.9, 4.3],
  ['Tupu-ā-nuku', 'Pleione', 92.0, 34.1, 5.05],
  ['Hiwa-i-te-rangi', 'Celaeno', 8.0, 55.3, 5.45],
  ['Pōhutukawa', 'Sterope', 29.2, 92.0, 5.76],
];
function santaSVG() {
  const skin = '#f2c4a2';
  return `<svg viewBox="0 0 240 200" aria-hidden="true">
  <ellipse cx="128" cy="193" rx="96" ry="5" fill="rgba(120,90,40,.18)"/>
  <rect x="8" y="160" width="42" height="30" rx="4" fill="#2f7fd1"/><rect x="6" y="154" width="46" height="10" rx="3" fill="#f4f7fb"/><rect x="21" y="157" width="16" height="3" rx="1.5" fill="#c9d6e6"/>
  <g class="smoke"><circle class="s1" cx="168" cy="104" r="6"/><circle class="s2" cx="184" cy="100" r="7"/><circle class="s3" cx="200" cy="105" r="5.5"/></g>
  <path d="M158 150L152 190M210 150L216 190M184 150V190" stroke="#2c2f33" stroke-width="3" stroke-linecap="round"/>
  <path d="M150 122C150 104 160 97 184 97S218 104 218 122Z" fill="#4a5059"/>
  <path d="M158 112C162 104 170 101 182 100" stroke="#6b737d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <rect x="152" y="118" width="64" height="6" rx="3" fill="#ff8a3d" class="coals"/>
  <rect x="160" y="113" width="15" height="6" rx="3" fill="#a5512f"/><rect x="179" y="112" width="16" height="6" rx="3" fill="#b4602f"/><rect x="199" y="113" width="12" height="6" rx="3" fill="#9c4a2b"/>
  <path d="M149 121H219" stroke="#7d848c" stroke-width="2"/>
  <rect x="146" y="124" width="76" height="26" rx="4" fill="#3b4048"/><rect x="146" y="124" width="76" height="5" rx="2" fill="#555c66"/>
  <g class="santa">
    <rect x="84" y="152" width="9" height="34" rx="4" fill="${skin}"/><rect x="99" y="152" width="9" height="34" rx="4" fill="${skin}"/>
    <ellipse cx="88" cy="189" rx="8.5" ry="3" fill="#1f3c88"/><ellipse cx="104" cy="189" rx="8.5" ry="3" fill="#1f3c88"/>
    <path d="M77 132H115L117 160H101L96 147L91 160H75Z" fill="#d62f3a"/>
    <circle cx="84" cy="146" r="2.2" fill="#fff" opacity=".85"/><circle cx="108" cy="140" r="2.2" fill="#fff" opacity=".85"/><circle cx="96" cy="137" r="2" fill="#fff" opacity=".85"/>
    <path d="M74 104C66 112 64 122 66 132" stroke="${skin}" stroke-width="8" stroke-linecap="round" fill="none"/>
    <ellipse cx="96" cy="117" rx="25" ry="23" fill="#e23b45"/>
    <path d="M72 100l-7 10 8 5 7-9z" fill="#e23b45"/>
    <rect x="71" y="127" width="50" height="7" fill="#2b2b2b"/><rect x="91" y="126" width="10" height="9" rx="1.5" fill="none" stroke="#f2c14e" stroke-width="2"/>
    <g class="tongs"><path d="M116 106C124 110 131 112 139 110" stroke="${skin}" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M114 100l10 4-3 9-9-4z" fill="#e23b45"/>
      <path d="M139 110L163 116M139 108L163 112" stroke="#9aa3ad" stroke-width="2" stroke-linecap="round"/></g>
    <circle cx="96" cy="80" r="15" fill="${skin}"/>
    <path d="M80 82C80 97 86 107 96 107S112 97 112 82C108 88 104 90 96 90S84 88 80 82Z" fill="#fff" stroke="#e3e3e3"/>
    <circle cx="84" cy="98" r="4" fill="#fff"/><circle cx="108" cy="98" r="4" fill="#fff"/><circle cx="96" cy="104" r="4.5" fill="#fff"/>
    <path d="M88 89c3-3 6-3 8 0 2-3 5-3 8 0-3 2-6 2-8 0-2 2-5 2-8 0z" fill="#fff" stroke="#d9d9d9" stroke-width=".6"/>
    <circle cx="96" cy="85" r="2.6" fill="#e88c7d"/>
    <rect x="85" y="75" width="9" height="6" rx="2.5" fill="#1d1d1d"/><rect x="98" y="75" width="9" height="6" rx="2.5" fill="#1d1d1d"/><path d="M94 77h4" stroke="#1d1d1d" stroke-width="1.5"/>
    <path d="M87 76.5l2-1M100 76.5l2-1" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".8"/>
    <path d="M80 71C82 59 92 53 104 55C114 57 121 66 124 77C118 72 113 70 109 71C104 66 93 66 80 71Z" fill="#d62f3a"/>
    <rect x="78" y="67" width="38" height="8" rx="4" fill="#fff"/><circle cx="125" cy="78" r="4.6" fill="#fff"/>
  </g>
</svg>`;
}
function pohutreeSVG() {
  const blobs = [[92, 74, 26], [62, 66, 22], [120, 84, 20], [36, 82, 17], [140, 66, 18], [104, 50, 20], [72, 44, 17], [48, 54, 15], [126, 104, 14]];
  const flowers = [[96, 56], [66, 48], [118, 66], [42, 70], [138, 58], [106, 36], [80, 60], [130, 86], [56, 86], [88, 88], [150, 74], [30, 76]];
  return `<svg viewBox="0 0 200 200" aria-hidden="true">
  <path d="M34 200C38 172 30 152 44 132C56 114 80 108 98 98" stroke="#6b4a33" stroke-width="13" fill="none" stroke-linecap="round"/>
  <path d="M46 134C40 120 30 108 20 100M70 116C82 112 100 116 118 110" stroke="#6b4a33" stroke-width="7" fill="none" stroke-linecap="round"/>
  <g class="canopy">${blobs.map(([x, y, r], k) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${k % 2 ? '#3e6b3a' : '#4f8247'}"/>`).join('')}
  ${flowers.map(([x, y], k) => pohuSVG(x, y, .9 + (k % 3) * .15)).join('')}</g>
</svg>`;
}
function fieldSVG() {
  // seeded randomness so the field looks natural but is the same every time
  let seed = 20250425;
  const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const items = [];
  const add = (x, d) => items.push({x, d, y: 50 + d * 62 + (rnd() - .5) * 5, bud: rnd() < .13, h: 6 + d * 14 + rnd() * 7, lean: (rnd() - .5) * 9});
  for (let c = 0; c < 15; c++) {                                  // clumps of different sizes and depths
    const cx = rnd() * 440 - 20, depth = rnd(), n = 2 + Math.floor(rnd() * rnd() * 9);
    for (let i = 0; i < n; i++) add(cx + (rnd() + rnd() - 1) * (16 + depth * 34), Math.min(1, Math.max(0, depth + (rnd() - .5) * .3)));
  }
  for (let i = 0; i < 18; i++) add(rnd() * 400, rnd());          // and a scatter of loners
  items.sort((a, b) => a.y - b.y);                                // far ones first
  const poppies = items.map(({x, y, d, bud, h, lean}) => {
    const s = .3 + d * .55;
    return `<g class="fpop" style="opacity:${(.72 + d * .28).toFixed(2)};--d:${(2.8 + rnd() * 2.6).toFixed(1)}s;--delay:${(-rnd() * 5).toFixed(1)}s;transform-origin:${x.toFixed(1)}px ${(y + h).toFixed(1)}px">
      <path d="M${x.toFixed(1)} ${(y + h).toFixed(1)}Q${(x + lean * .2).toFixed(1)} ${(y + h * .5).toFixed(1)} ${(x + lean).toFixed(1)} ${y.toFixed(1)}" stroke="#5f7a47" stroke-width="${(.6 + d * .7).toFixed(2)}" fill="none"/>
      <g transform="translate(${(x + lean).toFixed(1)} ${y.toFixed(1)})">${poppySVG(bud ? s * 1.2 : s, bud)}</g></g>`;
  }).join('');
  return `<svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <path d="M0 56C50 44 110 46 170 52S300 40 400 50V120H0Z" fill="#8e9a76"/>
    <path d="M0 78C70 64 150 72 220 74S340 62 400 70V120H0Z" fill="#76845f"/>${poppies}</svg>`;
}
function setupScene(id) {
  document.querySelectorAll('#scene').forEach(x => x.remove());
  let html = '';
  if (id === 'xmas') html = `<div class="sun"></div><div class="sea"></div><div class="sand"></div>
      <div class="pohutree">${pohutreeSVG()}</div><div class="santa-bbq">${santaSVG()}</div>`;
  if (id === 'matariki') html = `<div class="cluster"><i class="haze"></i>${MATARIKI_STARS.map(([name, west, x, y, mag], k) =>
      `<span class="mstar" title="${name} (${west})" style="left:${x}%;top:${y}%;--s:${(3 + (6 - mag) * 2.1).toFixed(1)}px;--d:${(5 + (k * 1.7) % 5).toFixed(1)}s;--delay:${(-(k * 2.3) % 7).toFixed(1)}s"></span>`).join('')}</div>`;
  if (id === 'easter') html =
      `<div class="eggpile eggpile-l">${eggPileSVG([[34, 60, -18, '#b8e3c8', 'dots', 2.3], [80, 54, 6, '#f8e3a1', 'zig', 2.6], [122, 64, 20, '#bcd7f7', 'band', 2.1]], 150)}</div>` +
      `<div class="eggpile eggpile-r">${eggPileSVG([[40, 60, -12, '#d9c6f5', 'band', 2.4], [84, 58, 14, '#f7b6c9', 'dots', 2.5]], 120)}</div>`;
  if (id === 'anzac') html = `<div class="field">${fieldSVG()}</div><div class="lwf">Lest we forget</div>`;
  if (!html) return;
  const el = document.createElement('div');
  el.id = 'scene';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = html;
  document.body.prepend(el);
}
/* ---------- Easter: a whole bunny sitting on the board, and nests of eggs at its bottom corners ---------- */
const BUN = {fur: '#fbfaf8', shade: '#ebe6f0', line: '#b9aecd', pink: '#f6b7ca', eye: '#3a3350'};
const eggSVG = (cx, cy, rot, fill, deco) => `<g transform="translate(${cx} ${cy}) rotate(${rot})">
    <path d="M0 -11C5 -11 8.5 -1 8.5 3.5S5 11 0 11-8.5 8-8.5 3.5-5-11 0-11z" fill="${fill}" stroke="rgba(80,60,110,.25)" stroke-width=".8"/>
    ${deco === 'zig' ? '<path d="M-8 1.5l2.7-2.4 2.7 2.4 2.6-2.4 2.6 2.4 2.7-2.4 2.7 2.4" stroke="#fff" stroke-width="1.3" fill="none" stroke-linejoin="round"/>'
      : deco === 'dots' ? '<circle cx="-3.5" cy="-3" r="1.3" fill="#fff"/><circle cx="2.5" cy="-5" r="1.1" fill="#fff"/><circle cx="3.5" cy="2" r="1.3" fill="#fff"/><circle cx="-2.5" cy="5" r="1.2" fill="#fff"/>'
      : '<path d="M-8.2 -1h16.4M-8.4 4h16.8" stroke="#fff" stroke-width="1.6"/>'}
    <path d="M-4.5 -6.5C-3.5 -8.5-2 -9.2-.8 -9.4" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/></g>`;
function bunnySVG() {
  const c = BUN;
  return `<svg class="bunnysvg" viewBox="0 0 80 100" aria-hidden="true">
  <ellipse cx="40" cy="99" rx="25" ry="2.4" fill="rgba(70,50,100,.18)"/>
  <g class="bbody">
    <path d="M40 58C24 58 16 71 17 84C18 94 26 99 40 99C54 99 62 94 63 84C64 71 56 58 40 58Z" fill="${c.fur}" stroke="${c.line}" stroke-width="1.4"/>
    <ellipse cx="40" cy="85" rx="13" ry="12" fill="${c.shade}"/>
    <ellipse cx="27" cy="96" rx="9.5" ry="4.6" fill="${c.fur}" stroke="${c.line}" stroke-width="1.3"/>
    <ellipse cx="53" cy="96" rx="9.5" ry="4.6" fill="${c.fur}" stroke="${c.line}" stroke-width="1.3"/>
    <ellipse cx="24" cy="96.4" rx="2.4" ry="1.6" fill="${c.pink}"/><ellipse cx="56" cy="96.4" rx="2.4" ry="1.6" fill="${c.pink}"/>
  </g>
  <g class="begg">${eggSVG(40, 80, 0, '#f7b6c9', 'zig')}</g>
  <ellipse cx="32.5" cy="79" rx="5" ry="4" fill="${c.fur}" stroke="${c.line}" stroke-width="1.2"/>
  <ellipse cx="47.5" cy="79" rx="5" ry="4" fill="${c.fur}" stroke="${c.line}" stroke-width="1.2"/>
  <g class="bhead">
    <g class="bear bear-l">
      <path d="M33 42C27 31 25 13 30 6.5C35 1.5 39 18 38 40Z" fill="${c.fur}" stroke="${c.line}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M33.6 38C30 29 29.4 16 31.4 10.5C33.6 8 35.8 20 35.6 36Z" fill="${c.pink}"/>
    </g>
    <g class="bear bear-r">
      <path d="M47 42C53 31 55 13 50 6.5C45 1.5 41 18 42 40Z" fill="${c.fur}" stroke="${c.line}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M46.4 38C50 29 50.6 16 48.6 10.5C46.4 8 44.2 20 44.4 36Z" fill="${c.pink}"/>
    </g>
    <path d="M24 52C24 42 31 36.5 40 36.5S56 42 56 52C58 55 57 60 53 61C50 64 45 65.5 40 65.5S30 64 27 61C23 60 22 55 24 52Z" fill="${c.fur}" stroke="${c.line}" stroke-width="1.4" stroke-linejoin="round"/>
    <ellipse cx="29" cy="55.5" rx="3.2" ry="1.8" fill="${c.pink}" opacity=".55"/><ellipse cx="51" cy="55.5" rx="3.2" ry="1.8" fill="${c.pink}" opacity=".55"/>
    <g class="beyes">
      <ellipse cx="33.5" cy="49" rx="2.5" ry="3" fill="${c.eye}"/><ellipse cx="46.5" cy="49" rx="2.5" ry="3" fill="${c.eye}"/>
      <circle cx="34.4" cy="47.8" r=".9" fill="#fff"/><circle cx="47.4" cy="47.8" r=".9" fill="#fff"/>
    </g>
    <g class="bnose"><path d="M38.2 54.2h3.6l-1.8 2z" fill="#f08fa8"/></g>
    <path d="M40 56.2q-1.3 2-3 1.1M40 56.2q1.3 2 3 1.1" stroke="${c.eye}" stroke-width=".9" fill="none" stroke-linecap="round"/>
    <path d="M34 56l-8-1.2M34 57.4l-7.6 1.4M46 56l8-1.2M46 57.4l7.6 1.4" stroke="${c.line}" stroke-width=".55" stroke-linecap="round"/>
  </g>
  <ellipse class="petzone" cx="40" cy="62" rx="26" ry="36" fill="transparent"/>
</svg>`;
}
// Big painted eggs piled in the bottom corners of the screen (like the Spooky cobweb)
const eggPileSVG = (eggs, w) => `<svg viewBox="0 0 ${w} 90" aria-hidden="true">
  ${eggs.map(([x, y, rot, fill, deco, sc], k) => `<g class="${k === 1 ? 'eggwob' : ''}" style="transform-origin:${x}px ${y + 11 * sc}px">
    <ellipse cx="${x}" cy="${y + 11 * sc - 1}" rx="${8 * sc}" ry="${1.6 * sc}" fill="rgba(70,50,110,.14)"/>
    <g transform="translate(${x} ${y}) scale(${sc})">${eggSVG(0, 0, rot, fill, deco)}</g></g>`).join('')}
</svg>`;
let bunnyTimer = null;
function setupBunny(on) {
  const wrap = document.getElementById('boardWrap');
  wrap.querySelectorAll('.bunnylayer').forEach(x => x.remove());
  if (!on) return;
  const layer = document.createElement('div');
  layer.className = 'bunnylayer';
  layer.innerHTML = `<div class="bunny">${bunnySVG()}</div>`;
  wrap.appendChild(layer);
  layer.querySelector('.petzone').addEventListener('click', e => {
    e.stopPropagation();
    bunnyHop();
    C.sound('boing');
    burst(layer.querySelector('.bhead'), 7, 46);
  });
}
function bunnyHop() {
  const b = document.querySelector('.bunny');
  if (!b) return;
  b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop');
}
// Both cats wake up for a moment when you win
function wakeCats() {
  bunnyHop();
  const layer = document.querySelector('.catlayer');
  if (!layer) return;
  layer.classList.add('awake');
  setTimeout(() => doze(layer), 4500);
}
// Let a cat (or both) slowly drift back to sleep instead of snapping its eyes shut
function doze(el) {
  if (!el.isConnected) return;
  el.classList.add('dozing');
  el.classList.remove('petted', 'awake');
  setTimeout(() => el.classList.remove('dozing'), 2300);
}
// A little shower of the theme's particles from a square (or a big one from the board on a win)
function burst(el, count = 7, spread = 46, shape = null) {
  const t = SPECIALS[C.theme()];
  if (!t || !el || !C.fxOn()) return;
  const r = el.getBoundingClientRect(), layer = document.getElementById('bursts');
  for (let n = 0; n < count; n++) {
    const p = document.createElement('span'), ang = rnd(0, Math.PI * 2), dist = rnd(spread * 0.5, spread);
    p.className = 'bp';
    p.style.cssText = `left:${r.left + rnd(r.width * 0.3, r.width * 0.7)}px;top:${r.top + rnd(r.height * 0.3, r.height * 0.7)}px;` +
      `--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist - 10}px;--rot:${rnd(-200, 200)}deg;--size:${rnd(8, 14)}px;animation-delay:${rnd(0, 0.08)}s`;
    p.innerHTML = particleSVG(shape || t.burst.shape, pick(shape === 'heart' ? ['#e7837d', '#f0a6a0', '#d9675f'] : t.burst.colors));
    layer.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}

// Everything a theme puts on the page, in one go
function decorate(id) {
  buildFx(id);
  setupCats(id);
  setupBunny(id === 'easter');
  setupPlants(BORDER_THEMES.includes(id));
  setupScene(id);
}
// The colour actually at the top of the page (themes with a gradient background), for the iPhone's status bar
function topColour(fallback) {
  try {
    const img = getComputedStyle(document.body).backgroundImage || '';
    const g = img.match(/gradient\((?:[^,(]|\([^)]*\))*?,?\s*(#[0-9a-f]{3,8}|rgba?\([^)]*\))/i);
    return g ? g[1] : fallback;
  } catch { return fallback; }
}

/* ---------- styles for the decorations ---------- */
const style = document.createElement('style');
style.id = 'rz-themes';
style.textContent = `#fx{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:0}
#fx .p{position:absolute;width:var(--size);height:var(--size);opacity:.85;will-change:transform}
#fx .p svg,.bp svg{width:100%;height:100%;display:block}
.p-fall{top:-30px;animation:fxfall var(--d) linear var(--delay) infinite}
@keyframes fxfall{0%{transform:translate(0,0) rotate(0)}25%{transform:translate(var(--sway),27vh) rotate(calc(var(--rot)*.25))}50%{transform:translate(0,55vh) rotate(calc(var(--rot)*.5))}75%{transform:translate(calc(var(--sway)*-1),82vh) rotate(calc(var(--rot)*.75))}100%{transform:translate(0,112vh) rotate(var(--rot))}}
.p-rise{bottom:-30px;animation:fxrise var(--d) linear var(--delay) infinite}
@keyframes fxrise{0%{transform:translate(0,0)}33%{transform:translate(var(--sway),-38vh)}66%{transform:translate(calc(var(--sway)*-1),-76vh)}100%{transform:translate(0,-115vh)}}
.p-twinkle{animation:fxtwinkle var(--d) ease-in-out var(--delay) infinite}
@keyframes fxtwinkle{0%,100%{opacity:.15;transform:scale(.55) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}
#fx .p-swim{left:0;height:calc(var(--size)*.66);opacity:.8;animation:fxswim var(--d) linear both}
#fx .p-swim.rtl{animation-name:fxswimrtl}
#fx .p-swim.rtl svg{transform:scaleX(-1)}
#fx .p-swim svg{animation:wiggle .5s ease-in-out infinite alternate}
#fx .p-swim.sh-bat{height:calc(var(--size)*.5);opacity:.95}
#fx .p-swim.sh-bat svg{animation:batbob .9s ease-in-out infinite alternate}
#fx .p-swim.sh-bat .batwing{transform-box:fill-box;transform-origin:50% 40%;animation:batflap .22s ease-in-out infinite alternate}
@keyframes batflap{from{transform:scaleY(1)}to{transform:scaleY(-.35)}}
@keyframes batbob{from{translate:0 -3px}to{translate:0 3px}}
#fx .p-swim.rtl svg{animation-name:wigglertl}
@keyframes wiggle{from{rotate:-4deg}to{rotate:4deg}}
@keyframes wigglertl{from{rotate:4deg}to{rotate:-4deg}}
@keyframes fxswim{0%{transform:translate(-60px,0)}25%{transform:translate(calc(25vw - 15px),calc(var(--bob)*-1))}50%{transform:translate(calc(50vw + 30px),var(--bob))}75%{transform:translate(calc(75vw + 75px),calc(var(--bob)*-.6))}100%{transform:translate(calc(100vw + 120px),0)}}
@keyframes fxswimrtl{0%{transform:translate(calc(100vw + 60px),0)}25%{transform:translate(calc(75vw + 15px),var(--bob))}50%{transform:translate(calc(50vw - 30px),calc(var(--bob)*-1))}75%{transform:translate(calc(25vw - 75px),calc(var(--bob)*.6))}100%{transform:translate(-120px,0)}}
#fx .p-shoot{width:var(--len);height:2px;transform:rotate(var(--ang));transform-origin:left center;opacity:1}
#fx .p-shoot i{display:block;width:100%;height:100%;border-radius:2px;box-shadow:0 0 6px rgba(255,255,255,.7);animation:fxshoot var(--d) cubic-bezier(.3,.6,.4,1) both}
@keyframes fxshoot{0%{opacity:0;transform:translateX(0) scaleX(.3)}12%{opacity:1}100%{opacity:0;transform:translateX(var(--dist)) scaleX(1)}}
#bursts{position:fixed;inset:0;pointer-events:none;z-index:4}
.bp{position:fixed;width:var(--size);height:var(--size);margin:calc(var(--size)/-2) 0 0 calc(var(--size)/-2);animation:fxburst .9s cubic-bezier(.15,.7,.3,1) both}
@keyframes fxburst{0%{opacity:1;transform:translate(0,0) scale(.4) rotate(0)}70%{opacity:1}100%{opacity:0;transform:translate(var(--dx),calc(var(--dy) + 30px)) scale(1) rotate(var(--rot))}}
/* Sakura: soft rounded board with a pink glow */
/* Under the Sea: watery glow */
/* Autumn: warm wooden frame */
/* Starry Night: night-sky glow and golden numbers */
/* Snowfall: frosty edge and a snowdrift on top of the board */
/* Catnap: two sleepy cats on the board */
body[data-fx=cats]{background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cg fill='%234a2e1a' opacity='.08'%3E%3Cg transform='translate(24 30) rotate(-25)'%3E%3Cellipse cx='0' cy='4' rx='6' ry='5'/%3E%3Cellipse cx='-7' cy='-3' rx='2.4' ry='3'/%3E%3Cellipse cx='-2.5' cy='-7.5' rx='2.4' ry='3.1'/%3E%3Cellipse cx='2.5' cy='-7.5' rx='2.4' ry='3.1'/%3E%3Cellipse cx='7' cy='-3' rx='2.4' ry='3'/%3E%3C/g%3E%3Cg transform='translate(98 98) rotate(20)'%3E%3Cellipse cx='0' cy='4' rx='6' ry='5'/%3E%3Cellipse cx='-7' cy='-3' rx='2.4' ry='3'/%3E%3Cellipse cx='-2.5' cy='-7.5' rx='2.4' ry='3.1'/%3E%3Cellipse cx='2.5' cy='-7.5' rx='2.4' ry='3.1'/%3E%3Cellipse cx='7' cy='-3' rx='2.4' ry='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") 0 0/140px 140px,radial-gradient(ellipse 120% 70% at 50% 0%,#e6d3bb 0%,#d2b897 55%,#b8977a 100%) fixed}
/* Alex theme: a vine border around the board (leaves point outward, never over the squares) */
.vineborder{position:absolute;left:-16px;top:-16px;z-index:2;pointer-events:none}
.vineborder svg{display:block;overflow:visible}
.vinestem{stroke-dasharray:1;stroke-dashoffset:1;animation:vinegrow 1.6s cubic-bezier(.4,.1,.3,1) .1s forwards}
@keyframes vinegrow{to{stroke-dashoffset:0}}
.pleaf{transform-box:fill-box;transform-origin:50% 0;scale:0;animation:leafin .45s cubic-bezier(.3,1.6,.5,1) calc(.25s + var(--k) * 45ms) forwards,leafflutter var(--d) ease-in-out var(--delay) infinite}
@keyframes leafin{to{scale:1}}
@keyframes leafflutter{0%,100%{rotate:-6deg}50%{rotate:6deg}}

.catlayer{position:absolute;left:0;right:0;top:0;height:0;z-index:3;pointer-events:none}
.cat{position:absolute;top:-62px;width:120px;height:112px}
.cat-a{left:-14px}
.cat-b{right:-14px;transform:scaleX(-1)}
.catsvg{width:100%;height:100%;overflow:visible;display:block}
.cat .petzone{pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent}
.cat svg *{transform-box:view-box}
.cat .breathe{transform-origin:55px 61.5px;animation:catbreathe 3.8s ease-in-out infinite}
@keyframes catbreathe{50%{transform:scale(1.012,1.045)}}
.cat .headg{transform-origin:84px 60px;animation:cathead 3.8s ease-in-out infinite}
@keyframes cathead{50%{transform:translateY(-.7px) rotate(-1.2deg)}}
.cat .tailmid{transform-origin:20.4px 61px;animation:catswish 9s ease-in-out infinite}
@keyframes catswish{0%,58%,100%{transform:rotate(0)}64%{transform:rotate(-4deg)}71%{transform:rotate(-1deg)}78%{transform:rotate(-3deg)}86%{transform:rotate(0)}}
.cat .ear-r{transform-origin:95px 40px;animation:cattwitch 11s linear infinite}
@keyframes cattwitch{0%,90%,100%{transform:rotate(0)}91.5%{transform:rotate(-16deg)}93%{transform:rotate(0)}94.5%{transform:rotate(-11deg)}96%{transform:rotate(0)}}
.cat-b .breathe,.cat-b .headg{animation-duration:4.5s;animation-delay:-1.6s}
.cat-b .tailmid{animation-duration:12.5s;animation-delay:-5s}
.cat .tailtip{transform-origin:51.5px 61.2px;animation:cattip 5.2s ease-in-out infinite}
@keyframes cattip{0%,30%,100%{transform:rotate(0)}38%{transform:rotate(-9deg)}46%{transform:rotate(2deg)}54%{transform:rotate(-4deg)}62%{transform:rotate(0)}76%{transform:rotate(-12deg)}86%{transform:rotate(-10deg)}94%{transform:rotate(0)}}
.cat-b .tailtip{animation-duration:6.4s;animation-delay:-2.7s}
.cat.petted .tailtip,.catlayer.awake .tailtip{animation:cattipquick .45s ease-in-out 4}
@keyframes cattipquick{30%{transform:rotate(-11deg)}70%{transform:rotate(3deg)}}
.cat-b .ear-r{animation-duration:15s;animation-delay:-6s}
.cat .zzz{stroke-width:1.3;opacity:.7}
.cat .z{opacity:0;transform-origin:center;transform-box:fill-box;animation:catz 7.5s ease-out infinite}
.cat .z2{animation-delay:1.2s}.cat .z3{animation-delay:2.4s}
.cat-b .z{animation-delay:-3.8s}.cat-b .z2{animation-delay:-2.6s}.cat-b .z3{animation-delay:-1.4s}
@keyframes catz{0%{opacity:0;transform:translate(-4px,6px) scale(.5)}12%{opacity:.9}45%{opacity:0;transform:translate(3px,-8px) scale(1)}100%{opacity:0}}
.cat .eyes-open{opacity:0;transform-origin:86px 48.4px;transform:scaleY(.08)}
.cat .eyes-shut{opacity:1}
.cat.petted .eyes-open,.catlayer.awake .eyes-open{opacity:1;transform:none;transition:transform .22s var(--ease),opacity .12s}
.cat.petted .eyes-shut,.catlayer.awake .eyes-shut{opacity:0;transition:opacity .1s}
.cat.petted .zzz,.catlayer.awake .zzz{display:none}
/* drifting back to sleep: eyelids droop, flutter, then close; head settles; z's come back after */
.cat.dozing .eyes-open,.catlayer.dozing .eyes-open{animation:catdoze 2.2s ease-in-out forwards}
@keyframes catdoze{0%{opacity:1;transform:none}30%{transform:scaleY(.5)}42%{transform:scaleY(.62)}68%{transform:scaleY(.3)}88%{opacity:1;transform:scaleY(.1)}100%{opacity:0;transform:scaleY(.08)}}
.cat.dozing .eyes-shut,.catlayer.dozing .eyes-shut{animation:catlids 2.2s ease-in forwards}
@keyframes catlids{0%,80%{opacity:0}100%{opacity:1}}
.cat.dozing .headg,.catlayer.dozing .headg{animation:catsettle 2.2s ease-in-out forwards}
@keyframes catsettle{from{transform:translateY(-2.5px) rotate(-3deg)}to{transform:none}}
.cat.dozing .zzz,.catlayer.dozing .zzz{display:none}
.cat.petted .tailmid,.catlayer.awake .tailmid{animation:catflick .9s ease-in-out 2}
@keyframes catflick{25%{transform:rotate(-5deg)}60%{transform:rotate(-1deg)}}
.cat.petted .headg,.catlayer.awake .headg{animation:catperk .5s var(--ease) both}
@keyframes catperk{to{transform:translateY(-2.5px) rotate(-3deg)}}
/* Seasonal theme decorations */
body[data-fx=matariki]{background:radial-gradient(ellipse 140% 80% at 70% 0%,#1b2a66 0%,#0a1230 55%,#060a1e 100%) fixed}
body[data-fx=spooky]{background:radial-gradient(ellipse 120% 70% at 50% 0%,#2e1f44 0%,#1b1426 55%,#0f0b17 100%) fixed}
body[data-fx=spooky]::before{content:'';position:fixed;right:0;bottom:0;width:min(34vw,170px);aspect-ratio:1;z-index:0;pointer-events:none;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 70 70'%3E%3Cg stroke='%23e6dcf5' stroke-width='.9' fill='none' opacity='.55'%3E%3Cpath d='M70 0L20 0M70 0L70 50M70 0L30 22M70 0L48 40M70 0L58 46M70 0L38 8'/%3E%3Cpath d='M56 0Q58 6 70 13M42 0Q46 11 70 27M28 0Q34 16 70 41M70 13Q62 10 61 3'/%3E%3Cpath d='M61 3Q62 8 66 11M50 3Q55 11 66 18M38 3Q47 16 64 26'/%3E%3C/g%3E%3Cpath d='M52 30v12' stroke='%23e6dcf5' stroke-width='.8' opacity='.7'/%3E%3Ccircle cx='52' cy='44' r='3' fill='%230d0a12'/%3E%3Ccircle cx='52' cy='41' r='2' fill='%230d0a12'/%3E%3Cpath d='M49 42l-2-1.5M49 44h-2.5M49 46l-2 1.5M55 42l2-1.5M55 44h2.5M55 46l2 1.5' stroke='%230d0a12' stroke-width='.8'/%3E%3C/svg%3E") center/contain no-repeat;transform:scaleY(-1);opacity:.85}
body[data-fx=easter]{background:linear-gradient(180deg,#f3f0fb 0%,#fdf2f6 100%) fixed}
/* --- Spooky: black cat with a bigger tail swoosh --- */
.cat-black .tailmid{animation:catswishbig 6s ease-in-out infinite}
@keyframes catswishbig{0%,38%,100%{transform:rotate(0)}46%{transform:rotate(-13deg)}54%{transform:rotate(-2deg)}62%{transform:rotate(-10deg)}70%{transform:rotate(-1deg)}80%{transform:rotate(0)}}
.cat-black .tailtip{animation:cattipbig 3.4s ease-in-out infinite}
@keyframes cattipbig{0%,100%{transform:rotate(0)}18%{transform:rotate(-36deg)}36%{transform:rotate(7deg)}56%{transform:rotate(-26deg)}76%{transform:rotate(4deg)}}
.cat-black.petted .tailtip,.catlayer.awake .cat-black .tailtip{animation:cattipquick .35s ease-in-out 6}
/* --- Easter: bunny and egg nests --- */
.bunnylayer{position:absolute;left:0;right:0;top:0;height:0;z-index:3;pointer-events:none}
.bunny{position:absolute;right:13%;top:-83px;width:68px;height:85px}
.bunnysvg{width:100%;height:100%;display:block;overflow:visible;filter:drop-shadow(0 0 5px var(--glow,transparent))}
.bunny .petzone{pointer-events:auto;cursor:pointer}
.bunny svg *{transform-box:view-box}
.bunny .bbody{transform-origin:40px 99px;animation:bunbreathe 3.2s ease-in-out infinite}
@keyframes bunbreathe{50%{transform:scale(1.02,1.04)}}
.bunny .bhead{transform-origin:40px 64px;animation:bunhead 6s ease-in-out infinite}
@keyframes bunhead{0%,100%{transform:rotate(0)}30%{transform:rotate(-4deg)}60%{transform:rotate(3deg)}}
.bunny .bear-l{transform-origin:35px 40px;animation:bunearl 7s ease-in-out infinite}
.bunny .bear-r{transform-origin:45px 40px;animation:bunearr 9s ease-in-out infinite}
@keyframes bunearl{0%,82%,100%{transform:rotate(0)}86%{transform:rotate(-10deg)}90%{transform:rotate(2deg)}}
@keyframes bunearr{0%,60%,100%{transform:rotate(0)}64%{transform:rotate(28deg)}74%{transform:rotate(26deg)}80%{transform:rotate(0)}}
.bunny .bnose{transform-origin:40px 55px;animation:bunnose 1.1s ease-in-out infinite}
@keyframes bunnose{0%,60%,100%{transform:none}70%{transform:scale(1.18,.82)}80%{transform:none}90%{transform:scale(1.12,.88)}}
.bunny .beyes{transform-origin:40px 49px;animation:bunblink 4.6s ease-in-out infinite}
@keyframes bunblink{0%,92%,100%{transform:none}95%{transform:scaleY(.1)}}
.bunny.hop{animation:bunhop .55s cubic-bezier(.3,.7,.4,1)}
@keyframes bunhop{0%{transform:none}18%{transform:scale(1.06,.9)}45%{transform:translateY(-16px) scale(.96,1.05)}75%{transform:none}86%{transform:scale(1.05,.94)}100%{transform:none}}
.eggpile{position:absolute;bottom:calc(var(--ext) - 6px);filter:drop-shadow(0 0 6px var(--glow,transparent))}
.eggpile-l{left:-6px;width:min(40vw,190px)}
.eggpile-r{right:-4px;width:min(31vw,150px)}
.eggwob{transform-box:view-box;animation:eggwob 6s ease-in-out infinite}
@keyframes eggwob{0%,80%,100%{transform:rotate(0)}84%{transform:rotate(-5deg)}88%{transform:rotate(4deg)}92%{transform:rotate(-2deg)}96%{transform:rotate(0)}}
/* --- Summer Christmas: hot summer sky, beach barbie, garland, frosted game panel --- */
body[data-fx=xmas]{background:linear-gradient(180deg,#2aa6ec 0%,#5cc3f3 32%,#a6e0f8 62%,#d9f3fc 100%) fixed}
body[data-fx=xmas] .vineborder svg{filter:drop-shadow(0 1px 1.5px rgba(0,40,20,.3))}
.bulb{animation:bulb 2.4s ease-in-out infinite}
@keyframes bulb{50%{opacity:.35}}
#scene{--ext:160px;position:fixed;left:0;right:0;top:0;bottom:calc(var(--ext) * -1);z-index:0;pointer-events:none;overflow:hidden}
#scene svg{display:block;width:100%;height:auto;overflow:visible}
.sun{position:absolute;right:-60px;top:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,#fffde8 0 26%,#ffeb8a 32%,rgba(255,235,138,.45) 46%,rgba(255,235,138,.12) 60%,transparent 70%);animation:sunpulse 5s ease-in-out infinite}
@keyframes sunpulse{50%{transform:scale(1.06)}}
.sea{position:absolute;left:0;right:0;bottom:calc(92px + var(--ext));height:64px;background:linear-gradient(180deg,#5fd0ec 0%,#22a9d6 60%,#1792c2 100%)}
.sea::after{content:'';position:absolute;left:-40px;right:-40px;bottom:-4px;height:10px;background:radial-gradient(circle at 10px 10px,#fff 6px,transparent 7px) 0 0/20px 10px repeat-x;opacity:.9;animation:surf 6s ease-in-out infinite}
@keyframes surf{50%{transform:translateX(20px)}}
.sand{position:absolute;left:0;right:0;bottom:0;height:calc(96px + var(--ext));background:linear-gradient(180deg,#f8e6b8,#efd49a)}
.santa-bbq{position:absolute;right:3%;bottom:calc(14px + var(--ext));width:min(56vw,250px)}
.pohutree{position:absolute;left:-14px;bottom:calc(48px + var(--ext));width:min(40vw,190px)}
.pohutree .canopy{transform-origin:90px 110px;transform-box:view-box;animation:treesway 7s ease-in-out infinite}
@keyframes treesway{50%{transform:rotate(1.6deg)}}
.santa-bbq .smoke circle{fill:#fff;opacity:0;transform-box:fill-box;transform-origin:center;animation:smoke 3.6s ease-out infinite}
.santa-bbq .smoke .s2{animation-delay:1.2s}.santa-bbq .smoke .s3{animation-delay:2.4s}
@keyframes smoke{0%{opacity:0;transform:translateY(8px) scale(.6)}20%{opacity:.75}100%{opacity:0;transform:translateY(-46px) scale(1.7)}}
.santa-bbq .tongs{transform-box:view-box;transform-origin:116px 106px;animation:tongs 2.6s ease-in-out infinite}
@keyframes tongs{0%,100%{transform:rotate(0)}40%{transform:rotate(-7deg)}55%{transform:rotate(2deg)}}
.santa-bbq .coals{animation:bulb 1.4s ease-in-out infinite}
.santa-bbq .santa{transform-box:view-box;transform-origin:96px 190px;animation:santabob 3s ease-in-out infinite}
@keyframes santabob{50%{transform:scaleY(1.012) translateY(-1px)}}
#fx .p-swim.sh-gull{height:calc(var(--size)*.42);opacity:.95}
#fx .p-swim.sh-gull .gullwing{transform-box:fill-box;transform-origin:50% 70%;animation:batflap .5s ease-in-out infinite alternate}
/* --- Matariki: accurate cluster, glistening stars that fade in and out --- */
.cluster{position:absolute;right:6%;bottom:calc(4vh + var(--ext));width:min(56vw,260px);aspect-ratio:1.65}
.cluster .haze{position:absolute;inset:-12%;border-radius:50%;background:radial-gradient(ellipse at 50% 45%,rgba(140,170,255,.22),rgba(140,170,255,.08) 45%,transparent 70%);animation:haze 9s ease-in-out infinite}
@keyframes haze{50%{opacity:.6}}
.mstar{position:absolute;width:var(--s);height:var(--s);margin:calc(var(--s)/-2) 0 0 calc(var(--s)/-2);border-radius:50%;background:radial-gradient(circle,#fff 0 35%,rgba(220,230,255,.9) 50%,rgba(170,195,255,0) 72%);box-shadow:0 0 calc(var(--s)*1.4) rgba(190,210,255,.85);animation:mshimmer 3.2s ease-in-out var(--delay) infinite}
.mstar::before,.mstar::after{content:'';position:absolute;left:50%;top:50%;width:calc(var(--s)*4.2);height:1.4px;margin:-.7px 0 0 calc(var(--s)*-2.1);background:linear-gradient(90deg,transparent,#fff,transparent);opacity:.35;transform:scaleX(.45);animation:mglint var(--d) ease-in-out var(--delay) infinite}
.mstar::after{transform:rotate(90deg) scaleX(.45);animation-name:mglint2}
@keyframes mshimmer{50%{opacity:.82}}
@keyframes mglint{0%,74%,100%{opacity:.3;transform:scaleX(.45)}82%{opacity:1;transform:scaleX(1.25)}90%{opacity:.4;transform:scaleX(.5)}}
@keyframes mglint2{0%,74%,100%{opacity:.3;transform:rotate(90deg) scaleX(.45)}82%{opacity:1;transform:rotate(90deg) scaleX(1.25)}90%{opacity:.4;transform:rotate(90deg) scaleX(.5)}}
body[data-fx=matariki] #fx .p-twinkle{animation-name:mglisten;animation-timing-function:ease-in-out}
@keyframes mglisten{0%,100%{opacity:0;transform:scale(.3) rotate(0)}30%{opacity:.75;transform:scale(.7) rotate(10deg)}48%{opacity:1;transform:scale(1.35) rotate(45deg)}62%{opacity:.75;transform:scale(.7) rotate(55deg)}}
/* --- ANZAC: dawn sky, poppies on the board, poppy field --- */
body[data-fx=anzac]{background:linear-gradient(180deg,#c3cad8 0%,#d8d3db 34%,#ecd8ca 68%,#f1c7a4 100%) fixed}
body[data-fx=anzac] .vineborder svg{filter:drop-shadow(0 1px 1px rgba(60,20,10,.25))}
.poppy{transform-box:view-box;animation:poppysway var(--d) ease-in-out var(--delay) infinite}
@keyframes poppysway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
.field{position:absolute;left:0;right:0;bottom:0;height:calc(min(20vh,140px) + var(--ext))}
#scene .field svg{position:absolute;left:0;right:0;top:0;width:100%;height:min(20vh,140px)}
.field::after{content:'';position:absolute;left:0;right:0;bottom:0;top:calc(min(20vh,140px) - 1px);background:#76845f}
.fpop{transform-box:view-box;animation:poppysway var(--d) ease-in-out var(--delay) infinite}
.lwf{position:absolute;left:0;right:0;bottom:calc(min(20vh,140px) + 6px + var(--ext));text-align:center;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;letter-spacing:.08em;color:rgba(60,45,38,.55)}

/* Candy: candy-cane striped border */
/* Neon Arcade: glowing grid and numbers, CRT scanlines */
body[data-fx=neon] #fx .p svg{filter:drop-shadow(0 0 4px currentColor)}
body[data-fx=neon]::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:3;background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px)}
/* Royal Gold: metallic gold everywhere, studded frame, crown, shimmering numbers */
body[data-fx=gold]{--gm:linear-gradient(135deg,#7a5a12 0%,#f9e58a 20%,#c9992a 38%,#fff4b8 52%,#b8860b 70%,#f2d36b 86%,#8a6414 100%);background:radial-gradient(ellipse 130% 60% at 50% -5%,#5a4210 0%,#241a06 45%,#0b0803 100%) fixed}
@keyframes goldsheen{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes shimmer{to{background-position:-250% 0}}
/* Faint glow on the special themes' decorations */
#fx .p svg,.bp svg{filter:drop-shadow(0 0 3px var(--glow,transparent))}
#fx .p-shoot i{box-shadow:0 0 6px rgba(255,255,255,.7),0 0 10px var(--glow,transparent)}
.cat .catsvg{filter:drop-shadow(0 0 7px var(--glow,transparent))}
.vineborder svg{filter:drop-shadow(0 0 3.5px rgba(232,242,224,.7))}
body[data-fx=cats] #fx .p svg{filter:none}
`;
const first = document.head.querySelector('style');
if (first) document.head.insertBefore(style, first); else document.head.appendChild(style);

window.RZT = {
  config: o => Object.assign(C, o),
  THEMES, THEME_ORDER, SPECIALS, BADGES, SEASONAL_ORDER, DARK_THEMES, MONTH_NAMES, BORDER_THEMES,
  isDark: id => DARK_THEMES.includes(id), inSeason, seasonText, thisMonth,
  particleSVG, rnd, pick, decorate, buildFx, setupCats, setupBunny, setupPlants, setupScene, wakeCats, bunnyHop, doze, burst, topColour,
};
})();
