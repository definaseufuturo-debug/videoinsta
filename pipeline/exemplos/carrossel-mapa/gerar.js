// Carrossel "Mapa da virada" (8 cards 1080x1350, estilo papel quadriculado dos vídeos de mapa)
const fs = require('fs'), path = require('path');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const ROOT = path.resolve(__dirname, '../..');
for (const f of fs.readdirSync(ROOT + '/pipeline/template/assets/fonts')) GlobalFonts.registerFromPath(ROOT + '/pipeline/template/assets/fonts/' + f, 'Inter');
const GEO = JSON.parse(fs.readFileSync(ROOT + '/pipeline/template/assets/br.json'));
const W = 1080, H = 1350, TAU = Math.PI * 2;
const PAPER = '#f2f1ec', GRID = 'rgba(0,0,0,0.06)', INK = '#111111', GREY = '#d8d6cf', MUTE = '#6b6860', FL = '#ff8a1f', LU = '#12a89c', LIME = '#c8f53a';
const UF = { AC: [144513, 287715], AP: [222968, 198674], AM: [1145783, 975245], PA: [2690449, 2199940], RO: [294446, 674382], RR: [83505, 219675], TO: [442962, 467916], AL: [1152621, 744140], BA: [6485258, 2608761], CE: [4036124, 1819478], MA: [2808231, 1229971], PB: [1794059, 865210], PE: [4117513, 1832554], PI: [1653989, 525859], RN: [1413596, 737409], SE: [989041, 433354], DF: [825224, 979542], GO: [1585555, 2345334], MT: [694167, 1351099], MS: [628973, 927892], ES: [1001965, 1294504], MG: [6351099, 6241786], RJ: [4565393, 5169033], SP: [12119274, 14139178], PR: [2566504, 4291444], RS: [2824552, 3874378], SC: [1418314, 3220071] };
const REG = {}; for (const s of GEO) { (REG[s.r] = REG[s.r] || { ufs: [], L: 0, F: 0 }).ufs.push(s.uf); REG[s.r].L += UF[s.uf][0]; REG[s.r].F += UF[s.uf][1]; }
const pct = v => v.toFixed(1).replace('.', ',') + '%';
const mix = (a, b, u) => { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return 'rgb(' + pa.map((x, i) => Math.round(x + (pb[i] - x) * u)).join(',') + ')'; };
let g;
function txt(s, x, y, size, o = {}) { g.save(); g.font = `${o.w || 800} ${size}px Inter`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.fillStyle = o.color || INK; g.fillText(s, x, y); g.restore(); }
const tw = (s, size, w = 800) => { g.font = `${w} ${size}px Inter`; return g.measureText(s).width; };
function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 600; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || INK }); cx += ws[i] + sp; }); }
function boxed(s, x, y, size, o = {}) { const w = tw(s, size, 900) + size * 0.9, h = size * 1.55; g.fillStyle = INK; g.fillRect(x - w / 2 + 8, y - h / 2 + 8, w, h); g.fillStyle = o.fill || '#fff'; g.fillRect(x - w / 2, y - h / 2, w, h); g.lineWidth = 5; g.strokeStyle = INK; g.strokeRect(x - w / 2, y - h / 2, w, h); txt(s, x, y + 3, size, { w: 900, color: o.tc || INK }); }
function tag(s, x, y, size, col) { const w = tw(s, size, 900) + size * 0.8, h = size * 1.45; g.fillStyle = INK; g.fillRect(x - w / 2 + 6, y - h / 2 + 6, w, h); g.fillStyle = col; g.fillRect(x - w / 2, y - h / 2, w, h); g.lineWidth = 4; g.strokeStyle = INK; g.strokeRect(x - w / 2, y - h / 2, w, h); txt(s, x, y + 3, size, { w: 900, color: '#fff' }); }
function stamp(s, x, y, size, col = INK, rot = -0.07) { g.save(); g.translate(x, y); g.rotate(rot); const w = tw(s, size, 900) + 60, h = size * 1.4; g.fillStyle = 'rgba(242,241,236,0.92)'; g.fillRect(-w / 2, -h / 2, w, h); g.lineWidth = 9; g.strokeStyle = col; g.strokeRect(-w / 2, -h / 2, w, h); txt(s, 0, 4, size, { w: 900, color: col }); g.restore(); }
function paper() { g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.lineWidth = 2; g.strokeStyle = GRID; for (let x = 0; x <= W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } }
function header(n) { spaced('MAPA DA VIRADA · 2º TURNO 2026', 540, 70, 26, { sp: 8 }); g.fillStyle = INK; g.fillRect(150, 96, 780, 3); txt(`${n}/8`, 1010, 70, 26, { w: 800, color: MUTE, align: 'right' }); }
function footer() { txt('Fonte: TSE • votos válidos • conteúdo educativo', 540, 1305, 22, { w: 600, color: MUTE }); txt('@mindloop_u', 60, 1305, 24, { w: 900, align: 'left' }); }
function bbox(ufs) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const s of GEO) if (ufs.includes(s.uf)) for (const r of s.p) for (const [x, y] of r) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; }
const ALL = GEO.map(s => s.uf);
function map(rect, focusUfs, opt = {}) { // rect = [x, y, w, h]
  const [x0, y0, x1, y1] = bbox(focusUfs && opt.zoom ? focusUfs : ALL), pad = opt.pad ?? 0.06, bw = (x1 - x0) * (1 + 2 * pad), bh = (y1 - y0) * (1 + 2 * pad), s = Math.min(rect[2] / bw, rect[3] / bh), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  g.save(); g.beginPath(); g.rect(0, rect[1] - 20, W, rect[3] + 40); g.clip(); g.translate(rect[0] + rect[2] / 2, rect[1] + rect[3] / 2); g.scale(s, s); g.translate(-cx, -cy);
  const path = st => { g.beginPath(); for (const r of st.p) { r.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); } };
  const col = uf => (UF[uf][0] > UF[uf][1] ? LU : FL), focus = new Set(focusUfs || []);
  for (const st of GEO) { if (focus.has(st.uf)) continue; path(st); g.fillStyle = focusUfs ? mix(GREY, col(st.uf), opt.dim ?? 0.25) : col(st.uf); g.fill(); g.lineWidth = 2.5 / s; g.strokeStyle = '#fff'; g.stroke(); }
  if (focusUfs) { const d = 14 / s; for (const st of GEO) if (focus.has(st.uf)) { g.save(); g.translate(d, d); path(st); g.fillStyle = INK; g.fill(); g.restore(); }
    for (const st of GEO) if (focus.has(st.uf)) { path(st); g.fillStyle = col(st.uf); g.fill(); g.lineWidth = 3 / s; g.strokeStyle = INK; g.stroke(); } }
  g.restore();
}
function bar(y, L, F) { const tot = L + F, fl = L / tot, x = 70, w = 940, h = 64; g.fillStyle = INK; g.fillRect(x + 8, y + 8, w, h); g.fillStyle = LU; g.fillRect(x, y, w * fl, h); g.fillStyle = FL; g.fillRect(x + w * fl, y, w * (1 - fl), h); g.lineWidth = 5; g.strokeStyle = INK; g.strokeRect(x, y, w, h); g.setLineDash([10, 8]); g.beginPath(); g.moveTo(540, y - 18); g.lineTo(540, y + h + 18); g.lineWidth = 4; g.stroke(); g.setLineDash([]);
  txt(`LULA ${pct(fl * 100)}`, x + 4, y - 32, 34, { w: 900, color: LU, align: 'left' }); txt(`${pct((1 - fl) * 100)} FLÁVIO`, x + w - 4, y - 32, 34, { w: 900, color: FL, align: 'right' }); }
const out = __dirname; let n = 0;
function card(fn) { const c = createCanvas(W, H); g = c.getContext('2d'); paper(); n++; header(n); fn(); footer(); fs.writeFileSync(path.join(out, String(n).padStart(2, '0') + '.jpg'), c.toBuffer('image/jpeg', 92)); }
const MAPR = [60, 480, 960, 640];
// 1 — capa
card(() => { txt('COMO CADA REGIÃO', 540, 200, 66, { w: 900 }); txt('DECIDIU A ELEIÇÃO', 540, 280, 66, { w: 900, color: LU }); txt('+4,4 MI', 540, 400, 120, { w: 900 }); map([60, 480, 960, 640], null); bar(1170, 51.78, 48.22); boxed('ARRASTA →', 900, 1258, 26, { fill: LIME }); });
// 2 — Brasil
card(() => { spaced('BRASIL', 540, 180, 52, { w: 700, sp: 14 }); txt('13 ESTADOS × 14', 540, 290, 84, { w: 900 }); txt('Lula venceu em 13 estados; Flávio em 13 + DF', 540, 375, 32, { w: 700, color: MUTE }); map([60, 440, 960, 680], null); bar(1170, 51.78, 48.22); });
const reg = (title, r, big, who, sub, extra) => card(() => { spaced(title, 540, 170, 48, { w: 700, sp: 13 }); txt(big, 540, 290, 130, { w: 900, color: who === 'L' ? LU : who === 'F' ? FL : INK }); if (sub) tag(sub, 540, 395, 32, who === 'L' ? LU : FL); map([60, 460, 960, 660], REG[r].ufs, { zoom: true, pad: 0.08 }); if (extra) extra(); bar(1170, REG[r].L, REG[r].F); });
reg('REGIÃO SUL', 'S', '+4,6 MI', 'F', 'A MAIS PARA FLÁVIO');
reg('CENTRO-OESTE + DF', 'CO', '+1,9 MI', 'F', 'A MAIS PARA FLÁVIO');
reg('REGIÃO SUDESTE', 'SE', '+2,8 MI', 'F', 'A MAIS PARA FLÁVIO', () => { boxed('MINAS: LULA POR 109 MIL', 540, 1060, 34, { fill: LIME }); });
reg('REGIÃO NORTE', 'N', '1.079', null, null, () => { txt('VOTOS DE DIFERENÇA NA REGIÃO INTEIRA', 540, 395, 30, { w: 800, color: MUTE }); stamp('EMPATE TÉCNICO', 540, 1060, 60); });
reg('REGIÃO NORDESTE', 'NE', '+13,7 MI', 'L', 'A MAIS PARA LULA', () => boxed('LULA VENCEU NOS 9 ESTADOS', 540, 1060, 34, { fill: LIME }));
// 8 — soma + CTA
card(() => { spaced('SOMANDO TUDO', 540, 170, 48, { w: 700, sp: 13 });
  const cx = 540, cy = 330, tilt = 0.14; g.save(); g.translate(cx, cy); g.fillStyle = INK; g.beginPath(); g.moveTo(-40, 120); g.lineTo(40, 120); g.lineTo(0, 0); g.fill(); g.rotate(tilt); g.fillRect(-330, -8, 660, 16); g.restore();
  for (const sd of [-1, 1]) { const px = cx + sd * 330 * Math.cos(tilt), py = cy + sd * 330 * Math.sin(tilt) + 90; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(px, py - 90); g.lineTo(px - 110, py - 10); g.moveTo(px, py - 90); g.lineTo(px + 110, py - 10); g.stroke(); const left = sd < 0;
    g.fillStyle = INK; g.fillRect(px - 160 + 6, py + 25 - 60 + 6, 320, 120); g.fillStyle = left ? FL : LU; g.fillRect(px - 160, py + 25 - 60, 320, 120); g.lineWidth = 4; g.strokeRect(px - 160, py + 25 - 60, 320, 120); txt(left ? '+9,3 MI' : '+13,7 MI', px, py + 11, 56, { w: 900, color: '#fff' }); txt(left ? 'FORA DO NORDESTE' : 'NORDESTE', px, py + 59, 22, { w: 800, color: '#fff' }); }
  boxed('= +4,4 MI PARA LULA', 540, 650, 50, { fill: LIME });
  txt('TODO VOTO VALE IGUAL,', 540, 820, 60, { w: 900 }); txt('DE QUALQUER REGIÃO', 540, 895, 60, { w: 900, color: LU });
  txt('Qual dado te surpreendeu? Comenta!', 540, 1030, 38, { w: 800 });
  g.fillStyle = INK; g.fillRect(290 + 8, 1100 + 8, 500, 120); g.fillStyle = LIME; g.fillRect(290, 1100, 500, 120); g.lineWidth = 5; g.strokeRect(290, 1100, 500, 120); txt('SALVA E SEGUE', 540, 1163, 50, { w: 900 }); });
console.log('ok', n, 'cards');
