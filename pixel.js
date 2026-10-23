// Pixel art do journal: tudo desenhado em código (nada copiado do jogo), num canvas de 320x180 ampliado sem suavização.
(() => {
const W = 320, H = 180, T0 = +(new URLSearchParams(location.search).get('t') || 0);
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const lerp = (a, b, t) => a + (b - a) * t;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], t)).toString(16).padStart(2, '0')).join('');

// ---------- primitivas ----------
const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const px = (g, x, y, c) => rect(g, x, y, 1, 1, c);
function ell(g, cx, cy, rx, ry, c) {
  g.fillStyle = c;
  for (let y = -ry; y <= ry; y++) {
    const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry + 0.01))));
    g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
  }
}
function poly(g, pts, c) {
  g.fillStyle = c;
  const ys = pts.map(p => p[1]);
  const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
  for (let y = y0; y <= y1; y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= y + .5 && by > y + .5) || (by <= y + .5 && ay > y + .5)) xs.push(ax + (y + .5 - ay) / (by - ay) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) g.fillRect(Math.round(xs[i]), y, Math.max(1, Math.round(xs[i + 1]) - Math.round(xs[i])), 1);
  }
}
function line(g, x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (;;) {
    px(g, x0, y0, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
}
// contorno escuro à volta de tudo o que é opaco
function outline(cv, color) {
  const g = cv.getContext('2d'), w = cv.width, h = cv.height;
  const d = g.getImageData(0, 0, w, h), a = d.data, o = hex(color), solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > 0;
  const add = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) add.push(y * w + x);
  for (const i of add) { a[i * 4] = o[0]; a[i * 4 + 1] = o[1]; a[i * 4 + 2] = o[2]; a[i * 4 + 3] = 255; }
  g.putImageData(d, 0, 0);
  return cv;
}
// sprites por texto: cada letra uma cor da paleta
function sprite(rows, pal, ol = '#1a0f1f') {
  const cv = mk(rows[0].length + 2, rows.length + 2), g = cv.getContext('2d');
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) px(g, x + 1, y + 1, pal[ch]); }));
  return ol ? outline(cv, ol) : cv;
}

// ---------- sprites ----------
const SLIME = sprite(['...GGGG...', '..GhhGGG..', '.GhGGGGGG.', '.GGEGGEGG.', 'GGGGGGGGGG', 'gGGGGGGGgg'], { G: '#5fcf5a', g: '#3a9a42', h: '#c4f7a0', E: '#1a2a1a' });
const SLIME2 = sprite(['..........', '...GGGG...', '.GhhGGGGG.', 'GhGGGGGGGG', 'GGEGGGGEGG', 'gGGGGGGGGg'], { G: '#5fcf5a', g: '#3a9a42', h: '#c4f7a0', E: '#1a2a1a' });
const SLIME_B = sprite(['...GGGG...', '..GhhGGG..', '.GhGGGGGG.', '.GGEGGEGG.', 'GGGGGGGGGG', 'gGGGGGGGgg'], { G: '#58a8f0', g: '#3a6ec0', h: '#c0e4ff', E: '#10203a' });
const SLIME_B2 = sprite(['..........', '...GGGG...', '.GhhGGGGG.', 'GhGGGGGGGG', 'GGEGGGGEGG', 'gGGGGGGGGg'], { G: '#58a8f0', g: '#3a6ec0', h: '#c0e4ff', E: '#10203a' });
const MUSH = sprite(['..RRR..', '.RWRRR.', 'RRRRWRR', 'RRRRRRR', '..sss..', '..sss..', '..sss..'], { R: '#d8363a', W: '#fff3d6', s: '#e8d5a3' });
const WIZ = sprite([
  '.....P.....', '....PPP....', '...PPYPP...', '..PPPPPPP..', '.PPPPPPPPP.', 'PPPPPPPPPPP',
  '...fffff...', '..fEfffEf..', '..wwwfwww..', '..wwwwwww..', '.bbwwwwwbb.', '.bbbwwwbbb.',
  'bbbbbwbbbbb', 'bbbbbbbbbbb', '.bbbbbbbbb.', '.bbb...bbb.', '.BB.....BB.'
], { P: '#6b3f9a', Y: '#ffd93c', f: '#f2c9a0', E: '#1a1020', w: '#f3efe6', b: '#2d5f9a', B: '#5a3a1a' });
const SWORD = sprite(['......ww', '.....www', '....www.', 'g..www..', '.gwww...', '..gg....', '.gHg....', 'H.......'], { w: '#e8eef5', g: '#e0a82e', H: '#8a5a2b' }, '#1a0f1f');
const GEM = sprite(['..ccc..', '.cwcdc.', 'cwccddc', 'ccccddd', '.ccddd.', '..cdd..', '...d...'], { c: '#5ae0e8', w: '#f0ffff', d: '#2a9ab8' });
const TOME = sprite(['.RRRRRRR.', 'RrrrrrrrR', 'RrYYYYYrR', 'RrYrrrYrR', 'RrYYYYYrR', 'RrrrrrrrR', 'RRRRRRRRR', '.wwwwwww.'], { R: '#8f1d21', r: '#b3262b', Y: '#e0a82e', w: '#f3e6c4' });

// ---------- dragão vermelho (3 poses de asa) ----------
function dragon(pose) {
  const cv = mk(70, 60), g = cv.getContext('2d');
  g.translate(2, 14);
  const D = '#6b1219', R = '#b3262b', L = '#e5484d', O = '#f0a040', I = '#f3e6c4', M = '#8f1d21', M2 = '#c9363a';
  const wings = {
    up: { S: [27, 17], W: [25, 3], T: [[12, -9], [14, -2], [17, 6]], B: [24, 21] },
    mid: { S: [27, 17], W: [18, 10], T: [[3, 6], [7, 14], [13, 20]], B: [24, 21] },
    down: { S: [27, 17], W: [24, 26], T: [[8, 33], [14, 37], [21, 35]], B: [24, 21] }
  }[pose];
  // asa de trás
  { const w2 = { up: { S: [29, 17], W: [30, 5], T: [[20, -6], [22, 0], [25, 8]], B: [27, 21] }, mid: { S: [29, 17], W: [24, 12], T: [[10, 9], [14, 16], [20, 21]], B: [27, 21] }, down: { S: [29, 17], W: [30, 24], T: [[16, 32], [22, 35], [28, 33]], B: [27, 21] } }[pose];
    poly(g, [w2.S, w2.W, ...w2.T, w2.B], M); w2.T.forEach(t => line(g, w2.W[0], w2.W[1], t[0], t[1], D)); }
  // cauda
  poly(g, [[18, 19], [10, 20], [5, 18], [2, 14], [0, 11], [3, 15], [7, 22], [12, 26], [18, 28]], R);
  poly(g, [[0, 11], [-1, 6], [4, 9], [2, 12]], M);
  // corpo
  ell(g, 26, 25, 10, 6, M); ell(g, 26, 22, 10, 6, R); ell(g, 24, 20, 6, 2, L);
  ell(g, 28, 27, 8, 2, O);
  for (let x = 21; x < 35; x += 3) line(g, x, 26, x + 1, 28, '#d9812c');
  // pescoço e cabeça
  poly(g, [[32, 20], [37, 13], [43, 10], [46, 14], [39, 24], [35, 27]], R);
  poly(g, [[34, 19], [38, 14], [42, 11], [42, 13], [38, 17]], L);
  poly(g, [[43, 8], [57, 11], [60, 14], [56, 17], [45, 17]], R);
  poly(g, [[46, 16], [57, 16], [55, 20], [48, 19]], M);
  poly(g, [[44, 8], [40, 2], [47, 7]], I); poly(g, [[47, 7], [46, 1], [51, 8]], I);
  px(g, 51, 11, '#ffe08a'); px(g, 52, 11, '#1a0f1f'); px(g, 58, 12, D); px(g, 56, 17, I); px(g, 53, 17, I);
  // espinhos no dorso
  [[19, 17], [23, 14], [27, 14], [31, 16]].forEach(([x, y]) => poly(g, [[x, y + 3], [x + 1, y - 2], [x + 3, y + 3]], O));
  // patas
  rect(g, 22, 30, 3, 5, M); rect(g, 31, 30, 3, 5, M); px(g, 21, 35, I); px(g, 24, 35, I); px(g, 30, 35, I); px(g, 33, 35, I);
  // asa da frente
  const wf = wings;
  poly(g, [wf.S, wf.W, ...wf.T, wf.B], M2);
  poly(g, [wf.S, wf.W, wf.T[1], wf.B], '#d9453f');
  wf.T.forEach(t => line(g, wf.W[0], wf.W[1], t[0], t[1], O));
  line(g, wf.S[0], wf.S[1], wf.W[0], wf.W[1], O);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return outline(cv, '#2a070d');
}
const DRAGON = [dragon('up'), dragon('mid'), dragon('down'), dragon('mid')];

// ---------- cenário (pré-renderizado) ----------
function skyLayer() {
  const cv = mk(W, H), g = cv.getContext('2d');
  const stops = ['#1c1240', '#3a1f5e', '#7a2f6e', '#c9506a', '#f08a52', '#ffc46a'];
  for (let y = 0; y < H; y += 3) {
    const t = Math.min(1, y / 120) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(t));
    rect(g, 0, y, W, 3, mix(stops[i], stops[i + 1], Math.round((t - i) * 5) / 5));
  }
  ell(g, 236, 112, 30, 30, '#ffb55f'); ell(g, 236, 112, 24, 24, '#ffd98a'); ell(g, 236, 112, 17, 17, '#fff0b8');
  return cv;
}
const STARS = Array.from({ length: 46 }, () => [Math.floor(rnd() * W), Math.floor(rnd() * 70), rnd() * 6]);
function cloud(w, c1, c2) {
  const cv = mk(w + 8, 18), g = cv.getContext('2d');
  for (let i = 0; i < w / 9; i++) ell(g, 8 + i * 9 + rnd() * 3, 9 - Math.abs(Math.sin(i * 1.7)) * 3, 8 + rnd() * 4, 4 + rnd() * 2, c2);
  for (let i = 0; i < w / 9; i++) ell(g, 8 + i * 9 + rnd() * 3, 7 - Math.abs(Math.sin(i * 1.7)) * 3, 8 + rnd() * 3, 3 + rnd() * 2, c1);
  rect(g, 0, 12, w + 8, 6, '#0000');
  return cv;
}
const CLOUDS = [
  { cv: cloud(70, '#ffb08a', '#c96a86'), y: 28, v: 2.2, x: 20 }, { cv: cloud(50, '#ffc9a0', '#d9809a'), y: 52, v: 3.4, x: 180 },
  { cv: cloud(90, '#ff9d80', '#b8587e'), y: 14, v: 1.4, x: 240 }, { cv: cloud(44, '#ffd7b0', '#e09aa0'), y: 76, v: 4.6, x: 110 }
];
function ridge(base, amps, freqs, ph, col, top, extra) {
  const cv = mk(W, H), g = cv.getContext('2d'), ys = [];
  for (let x = 0; x < W; x++) {
    let y = base; amps.forEach((a, i) => y += a * Math.sin(x * freqs[i] + ph[i]));
    y = Math.round(y); ys.push(y);
    rect(g, x, y, 1, H - y, col); px(g, x, y, top);
    if (extra) extra(g, x, y);
  }
  return { cv, ys };
}
const FAR = ridge(112, [14, 7, 3], [.018, .047, .13], [1, 2, 0], '#5a3f7a', '#8a63a8');
const FAR2 = ridge(122, [8, 4], [.03, .09], [0, 3], '#4a3568', '#6d4f8c');
const MID = ridge(138, [8, 4, 2], [.022, .06, .2], [2, 0, 1], '#3f7a3c', '#7bc24f', (g, x, y) => { if (x % 3 === 0 && rnd() < .5) px(g, x, y + 2 + Math.floor(rnd() * 4), '#2f6a34'); });
const NEAR = ridge(154, [5, 3, 1.5], [.03, .08, .25], [4, 1, 2], '#4f9a3a', '#9be05a', (g, x, y) => { if (rnd() < .18) px(g, x, y + 2 + Math.floor(rnd() * 10), rnd() < .5 ? '#3d8a30' : '#68b146'); });
// pinheiros e castelo sobre as colinas
function pine(g, x, y, s) {
  const n = 3 + s, y0 = y - 3 - n * 2;
  rect(g, x, y - 3, 2, 4, '#4a2e1a');
  px(g, x, y0 - 1, '#2f6a34'); px(g, x + 1, y0 - 1, '#2f6a34');
  for (let i = 0; i < n; i++) rect(g, x - i, y0 + i * 2, i * 2 + 2, 2, i % 2 ? '#2f6a34' : '#25562c');
}
function castle() {
  const cv = mk(70, 62), g = cv.getContext('2d'), S = '#3d2b57', S2 = '#503870', R = '#a02a35';
  rect(g, 10, 36, 50, 26, S);
  [[4, 20, 12], [28, 6, 14], [52, 24, 12]].forEach(([x, y, w]) => { rect(g, x, y, w, 62 - y, S2); for (let i = 0; i < w; i += 4) rect(g, x + i, y - 3, 2, 3, S2); poly(g, [[x - 2, y - 3], [x + w / 2, y - 14], [x + w + 2, y - 3]], R); });
  for (let i = 10; i < 60; i += 5) rect(g, i, 33, 3, 3, S);
  rect(g, 30, 46, 10, 16, '#1c1230'); ell(g, 35, 46, 5, 4, '#1c1230');
  line(g, 35, -8, 35, -2, '#2a1a3a');
  return outline(cv, '#1c1230');
}
const CASTLE = castle();
const WINDOWS = [[8, 28], [32, 14], [56, 32], [32, 24], [18, 44], [48, 44]];
const TREES = []; for (let x = 150; x < W; x += 9 + Math.floor(rnd() * 12)) TREES.push([x, MID.ys[x], 1 + (rnd() < .4 ? 1 : 0)]);
const TREES2 = []; for (let x = 4; x < 150; x += 14 + Math.floor(rnd() * 16)) TREES2.push([x, MID.ys[x], 1]);
const FLOWERS = Array.from({ length: 34 }, () => { const x = Math.floor(rnd() * W); return [x, NEAR.ys[x] + 3 + Math.floor(rnd() * 20), ['#fff3d6', '#ff6bc1', '#ffd93c', '#ff8a3c', '#8fd0ff'][Math.floor(rnd() * 5)], rnd() * 6]; });
const FIREFLIES = Array.from({ length: 16 }, () => [rnd() * W, 90 + rnd() * 80, rnd() * 6, .5 + rnd()]);

// ---------- partículas ----------
const sparks = [], embers = [];
function sparkle(x, y) { sparks.push({ x, y, vx: (rnd() - .5) * .5, vy: -.3 - rnd() * .6, life: 40 + rnd() * 30, c: ['#c9a0ff', '#8fe8ff', '#ffffff', '#ff9aeb'][Math.floor(rnd() * 4)] }); }
function ember(x, y) { embers.push({ x, y, vx: 1.2 + rnd() * 1.2, vy: (rnd() - .5) * .6, life: 18 + rnd() * 10 }); }

// ---------- cena ----------
function scene(canvas, still) {
  const g = canvas.getContext('2d'), sky = skyLayer();
  let last = 0, vis = true;
  new IntersectionObserver(e => { vis = e[0].isIntersecting; }).observe(canvas);
  function frame(t) {
    if (!still) requestAnimationFrame(frame);
    if (!vis || t - last < 33) return;
    last = t; const s = t / 1000 + T0;
    g.drawImage(sky, 0, 0);
    STARS.forEach(([x, y, p]) => { if (Math.sin(s * 2 + p) > -.2) px(g, x, y, y < 30 ? '#ffffffcc' : '#ffe9c8aa'); });
    CLOUDS.forEach(c => { const x = ((c.x + s * c.v) % (W + 120)) - 90; g.drawImage(c.cv, Math.round(x), c.y); });
    g.drawImage(FAR.cv, 0, 0); g.drawImage(FAR2.cv, 0, 0);
    g.drawImage(CASTLE, 22, FAR2.ys[56] - 52);
    WINDOWS.forEach(([x, y], i) => { if (Math.sin(s * 1.3 + i * 2) > -.7) rect(g, 22 + x, FAR2.ys[56] - 52 + y, 2, 3, '#ffd93c'); });
    const fx = 22 + 36, fy = FAR2.ys[56] - 52 - 12;
    for (let i = 0; i < 5; i++) px(g, fx + 1 + i, fy + Math.round(Math.sin(s * 5 + i * .8) * 1.2) + (i > 2 ? 1 : 0), '#e5484d');
    g.drawImage(MID.cv, 0, 0);
    TREES.concat(TREES2).forEach(([x, y, k]) => pine(g, x, y, k));
    g.drawImage(NEAR.cv, 0, 0);
    FLOWERS.forEach(([x, y, c, p]) => { const sw = Math.sin(s * 1.6 + p) > 0 ? 1 : 0; px(g, x + sw, y - 2, c); px(g, x + sw, y - 1, c); px(g, x, y, '#2f7a30'); px(g, x, y + 1, '#2f7a30'); });
    // mago, cogumelos, slimes
    const wx = 98, wy = NEAR.ys[98] + 12;
    g.drawImage(WIZ, wx, wy - 19 + Math.round(Math.sin(s * 2) * .6));
    line(g, wx + 14, wy - 21, wx + 14, wy - 3, '#6b3f1a'); line(g, wx + 15, wy - 21, wx + 15, wy - 3, '#8a5a2b');
    const gl = (Math.sin(s * 4) + 1) / 2; ell(g, wx + 14, wy - 24, 3, 3, mix('#5ae0e8', '#c9a0ff', gl)); px(g, wx + 13, wy - 25, '#ffffff');
    if (Math.random() < .5) sparkle(wx + 14 + (Math.random() - .5) * 8, wy - 24);
    g.drawImage(MUSH, 150, NEAR.ys[150] + 5); g.drawImage(MUSH, 158, NEAR.ys[158] + 8);
    const hop = Math.abs(Math.sin(s * 2.2)), hop2 = Math.abs(Math.sin(s * 1.8 + 1));
    g.drawImage(hop > .35 ? SLIME2 : SLIME, 196, NEAR.ys[196] + 7 - Math.round(hop * 10));
    g.drawImage(hop2 > .35 ? SLIME_B2 : SLIME_B, 262 + Math.round(Math.sin(s * .6) * 6), NEAR.ys[262] + 10 - Math.round(hop2 * 8));
    // dragão
    const dp = (s * 18) % (W + 180), dx = dp - 100, dy = 44 + Math.sin(s * 1.1) * 8 + Math.sin(dx * .03) * 6;
    g.drawImage(DRAGON[Math.floor(s * 5) % 4], Math.round(dx), Math.round(dy));
    if (Math.sin(s * .9) > .3) for (let i = 0; i < 2; i++) ember(dx + 63, dy + 28 + Math.random() * 2);
    for (let i = embers.length - 1; i >= 0; i--) { const e = embers[i]; e.x += e.vx; e.y += e.vy; if (--e.life < 0) { embers.splice(i, 1); continue; } px(g, e.x, e.y, e.life > 14 ? '#ffe08a' : e.life > 7 ? '#ff9a3c' : '#e5484d'); if (e.life > 10) px(g, e.x, e.y + 1, '#ff9a3c'); }
    for (let i = sparks.length - 1; i >= 0; i--) { const k = sparks[i]; k.x += k.vx; k.y += k.vy; if (--k.life < 0) { sparks.splice(i, 1); continue; } px(g, k.x, k.y, k.c); if (k.life > 40) px(g, k.x + 1, k.y, k.c); }
    FIREFLIES.forEach(([x, y, p, v]) => { const a = Math.sin(s * v + p); if (a > .3) px(g, (x + Math.sin(s * .4 + p) * 12 + W) % W, y + Math.cos(s * .5 + p) * 6, '#fff3a0'); });
  }
  requestAnimationFrame(frame);
}

// ---------- faixa de relva do rodapé ----------
function grassStrip(canvas) {
  const w = 320, h = 40; canvas.width = w; canvas.height = h;
  const g = canvas.getContext('2d');
  rect(g, 0, 14, w, 26, '#3d8a30'); rect(g, 0, 30, w, 10, '#6b4423');
  for (let x = 0; x < w; x++) { const y = 12 + Math.round(Math.sin(x * .09) * 2 + Math.sin(x * .31)); rect(g, x, y, 1, 4, '#7bc24f'); px(g, x, y, '#b6f06a'); if (rnd() < .3) px(g, x, y - 1 - Math.floor(rnd() * 2), '#7bc24f'); if (rnd() < .2) px(g, x, 32 + Math.floor(rnd() * 7), '#4a2e1a'); }
  for (let x = 6; x < w; x += 11 + Math.floor(rnd() * 20)) { px(g, x, 8, ['#fff3d6', '#ff6bc1', '#ffd93c', '#8fd0ff'][Math.floor(rnd() * 4)]); px(g, x, 9, '#2f7a30'); px(g, x, 10, '#2f7a30'); }
  g.drawImage(MUSH, 40, 7); g.drawImage(MUSH, 250, 8); g.drawImage(SLIME, 150, 4); g.drawImage(SLIME_B2, 292, 6);
}

// ---------- ícones dos títulos ----------
function icons() {
  const map = { sword: SWORD, gem: GEM, tome: TOME };
  document.querySelectorAll('[data-icon]').forEach(el => {
    const src = map[el.dataset.icon]; if (!src) return;
    const c = mk(src.width, src.height); c.getContext('2d').drawImage(src, 0, 0);
    c.className = 'h-icon'; c.setAttribute('aria-hidden', 'true'); el.prepend(c);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sc = document.getElementById('scene'); if (sc) { sc.width = W; sc.height = H; scene(sc, still); }
  const gs = document.getElementById('grass'); if (gs) grassStrip(gs);
  icons();
});
})();
