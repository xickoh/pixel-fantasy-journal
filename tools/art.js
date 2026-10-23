// Gerador da arte do journal (nada copiado do jogo: o pack de sprites do jogo não pode ser redistribuído). tools/art.html corre isto e exporta os PNG para img/art/.
(() => {
const W = 320, H = 180;
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

function castle() {
  const cv = mk(70, 62), g = cv.getContext('2d'), S = '#3d2b57', S2 = '#503870', R = '#a02a35';
  rect(g, 10, 36, 50, 26, S);
  [[4, 20, 12], [28, 6, 14], [52, 24, 12]].forEach(([x, y, w]) => { rect(g, x, y, w, 62 - y, S2); for (let i = 0; i < w; i += 4) rect(g, x + i, y - 3, 2, 3, S2); poly(g, [[x - 2, y - 3], [x + w / 2, y - 14], [x + w + 2, y - 3]], R); });
  for (let i = 10; i < 60; i += 5) rect(g, i, 33, 3, 3, S);
  rect(g, 30, 46, 10, 16, '#1c1230'); ell(g, 35, 46, 5, 4, '#1c1230');
  line(g, 35, -8, 35, -2, '#2a1a3a');
  return outline(cv, '#1c1230');
}

const BAT = sprite(['B.......B', 'BB.BBB.BB', 'BBBEBEBBB', '.BBBBBBB.', '..B...B..'], { B: '#5a3a7a', E: '#ff4a4a' });
const SKULL = sprite(['..wwww..', '.wwwwww.', 'wwwwwwww', 'wEEwwEEw', 'wEEwwEEw', '.wwwwww.', '.w.ww.w.', '..wwww..'], { w: '#f3efe6', E: '#1a1020' });
const POTION = sprite(['..bbb..', '..ccc..', '..ccc..', '.rrrrr.', 'rrhrrrr', 'rrrrrrr', 'rrrrrrr', '.rrrrr.'], { b: '#8a5a2b', c: '#cfe8ff', r: '#d8363a', h: '#ff9a9a' });
const SLIME_R = sprite(['...GGGG...', '..GhhGGG..', '.GhGGGGGG.', '.GGEGGEGG.', 'GGGGGGGGGG', 'gGGGGGGGgg'], { G: '#e0483c', g: '#a02a35', h: '#ffb0a0', E: '#2a1010' });
function tile(w, h, fn) { const cv = mk(w, h); fn(cv.getContext('2d'), w, h); return cv; }
const TAU = Math.PI * 2;
const GRASS = tile(32, 28, (g, w, h) => {
  rect(g, 0, 10, w, h - 10, '#3f8a30');
  for (let x = 0; x < w; x++) {
    const top = 5 + Math.round(3 * Math.sin(TAU * x / w * 2) + 1.5 * Math.sin(TAU * x / w * 5 + 1));
    rect(g, x, top, 1, 12, '#5fb046'); px(g, x, top, '#b6f06a'); px(g, x, top + 1, '#7bc24f');
    if (x % 4 === 1) px(g, x, top + 6 + (x % 3), '#2f7a30');
  }
  for (let x = 0; x < w; x += 8) { px(g, x + 3, 3, ['#fff3d6', '#ff6bc1', '#ffd93c'][(x / 8) % 3]); px(g, x + 3, 4, '#2f7a30'); }
  rect(g, 0, 20, w, 8, '#6b4423'); for (let x = 0; x < w; x += 5) px(g, x, 22 + (x % 4), '#4a2e1a');
});
const FLAME = tile(32, 30, (g, w, h) => {
  [['#7a1319', 0], ['#c8282d', 3], ['#f0782a', 7], ['#ffd93c', 11]].forEach(([c, sh]) => {
    for (let x = 0; x < w; x++) {
      const top = 4 + sh + Math.round(5 * Math.abs(Math.sin(TAU * x / w * 2)) + 3 * Math.sin(TAU * x / w * 7 + 1));
      rect(g, x, top, 1, h - top, c);
    }
  });
});
const BRICK = tile(32, 32, (g, w, h) => {
  rect(g, 0, 0, w, h, '#4a423a');
  for (let r = 0; r < 4; r++) { const y = r * 8, off = r % 2 ? 8 : 0; rect(g, 0, y + 7, w, 1, '#241e1a'); for (let x = off; x < w + 16; x += 16) { rect(g, x % w, y, 1, 7, '#241e1a'); rect(g, (x + 1) % w, y, 14, 1, '#5e554a'); } }
});
function castleSprite() { return castle(); }
window.ART_LIST = [
  ['dragon', DRAGON[0]], ['dragon_mid', DRAGON[1]], ['wizard', WIZ], ['slime_g', SLIME], ['slime_g2', SLIME2], ['slime_b', SLIME_B], ['slime_r', SLIME_R],
  ['mushroom', MUSH], ['bat', BAT], ['skull', SKULL], ['potion', POTION], ['sword', SWORD], ['gem', GEM], ['tome', TOME],
  ['castle', castleSprite()], ['grass_edge', GRASS], ['flame_edge', FLAME], ['brick', BRICK]
];
})();
