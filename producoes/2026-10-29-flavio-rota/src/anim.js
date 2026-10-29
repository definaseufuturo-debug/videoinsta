/*
 * A ROTA DE FLÁVIO BOLSONARO ATÉ MIAMI — infográfico com mapa, 9:16 (1080x1920). Neutro: sem rosto, sem cores de partido.
 * Contornos: Natural Earth 10m (assets/regiao.json, K = cos 0° = 1) e fronteiras 50m (assets/borders.json).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, K = 1;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  const BG0 = '#070d18', BG1 = '#0e1a2e', SEA = '#0b1a30', LAND = '#24344d', LAND2 = '#2c3f5c', COAST = '#5d7598', BORD = 'rgba(160,185,220,0.35)';
  const WH = '#f4f6fb', MU = '#8d9bb5', INK = '#081020', Y = '#ffd166', OR = '#ff9f1c', HOT = '#ff4d5e', TE = '#2ec4b6', ICE = '#7fd8ff';

  const C = { // lon, lat
    'Brasília': [-47.88, -15.79], 'Foz do Iguaçu': [-54.59, -25.52], 'Puerto Iguazú': [-54.47, -25.74], 'Guayaquil': [-79.88, -2.16], 'Miami': [-80.28, 25.91],
  };
  const P = n => [C[n][0] * K, -C[n][1]];

  function create(TL, env) {
    const mk = env.createCanvas, LANDS = require('../assets/regiao.json').land, BORDERS = require('../assets/borders.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Gancho: <12 h', 'Contexto: passaportes', 'Ponte 22h50', 'Jato 23h30 → Guayaquil', 'Abastece', 'Miami', 'CTA'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) {
      if (o.scale !== undefined && o.scale <= 0.001) return;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
      ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1;
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || INK; ctx.strokeText(s, 0, 0); }
      ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore();
    }
    function rtxt(s, x, y, size, o = {}) {
      if (o.scale !== undefined && o.scale <= 0.001) return; const d = o.d ?? size * 0.07;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.globalAlpha *= o.a ?? 1;
      ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = size * 0.12; ctx.strokeStyle = INK; ctx.fillStyle = '#000'; ctx.strokeText(s, d, d); ctx.fillText(s, d, d);
      ctx.strokeText(s, 0, 0); ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore();
    }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function circ(x, y, r, fill, lw = 0, sc = WH) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function soft(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    function chip(s, x, y, size, col, k, o = {}) {
      if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7;
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1));
      rr(-w / 2 + 6, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
      rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill();
      txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1);
    }
    function stampMark(x, y, s, k, o = {}) {
      if (k <= 0) return; const sc = lerp(2.4, 1, outC(k)) * (o.s || 1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(sc, sc); ga(clamp(k * 3));
      const size = o.size || 70, w = tw(s, size, 900) + 60, h = size * 1.45, col = o.col || HOT;
      rr(-w / 2, -h / 2, w, h, 14); ctx.fillStyle = 'rgba(8,16,32,0.92)'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = col; ctx.stroke();
      txt(s, 0, 4, size, { w: 900, color: col }); ctx.restore(); ga(1);
    }
    // cartão de fato (caixa escura com título e linha de apoio)
    function card(x, y, w, title, sub, k, o = {}) {
      if (k <= 0) return; const h = sub ? 150 : 104;
      ctx.save(); ctx.translate(lerp(x + (o.from ?? -60), x, outC(k)), y); ga(clamp(k * 2.5));
      rr(-w / 2 + 6, -h / 2 + 8, w, h, 22); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
      rr(-w / 2, -h / 2, w, h, 22); ctx.fillStyle = 'rgba(10,20,38,0.94)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = o.col || Y; ctx.stroke();
      rr(-w / 2, -h / 2, 16, h, [22, 0, 0, 22]); ctx.fillStyle = o.col || Y; ctx.fill();
      txt(title, -w / 2 + 44, sub ? -26 : 2, o.size || 44, { w: 900, color: o.tcol || WH, align: 'left' });
      if (sub) txt(sub, -w / 2 + 44, 34, 32, { w: 700, color: MU, align: 'left' });
      ctx.restore(); ga(1);
    }

    // fundo
    const vig = (() => { const cv = mk(W, H), g = cv.getContext('2d'), gr = g.createRadialGradient(W / 2, H * 0.48, H * 0.25, W / 2, H * 0.5, H * 0.8); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();
    function bg() { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    function header() { ga(0.9); rr(250, 96, 580, 62, 31); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); txt('INFOGRÁFICO · A ROTA ATÉ MIAMI', 540, 128, 28, { w: 800, color: MU }); ga(1); }

    // ---------------- câmera e mapa ----------------
    const RECT = [0, 230, 1080, 1290];
    const box = (lo0, lo1, la0, la1) => { const x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(RECT[2] / (x1 - x0), RECT[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    const CAMS = [
      box(-92, -34, -32, 30),          // 1 visão geral
      box(-62, -38, -28, -10),         // 2 Brasil (Brasília e Foz)
      box(-55.6, -53.6, -26.4, -24.8), // 3 ponte (zoom)
      box(-91, -49, -30, 2),           // 4 Iguazú → Guayaquil
      box(-88, -70, -10, 8),           // 5 Guayaquil
      box(-96, -64, -8, 34),           // 6 Guayaquil → Miami
      box(-92, -34, -32, 30),          // 7 visão geral
    ];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i] - 0.1, B[i] + 1.1); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const P2 = (cam, n) => toS(cam, P(n));
    function drawMap(cam, t, o = {}) {
      ctx.save(); ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      // grade de meridianos/paralelos
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      ctx.lineWidth = 1.5 / cam.s; ctx.strokeStyle = 'rgba(127,216,255,0.07)';
      for (let lo = -100; lo <= -20; lo += 10) { ctx.beginPath(); ctx.moveTo(lo, -40); ctx.lineTo(lo, 40); ctx.stroke(); }
      for (let la = -40; la <= 40; la += 10) { ctx.beginPath(); ctx.moveTo(-100, -la); ctx.lineTo(-20, -la); ctx.stroke(); }
      ctx.beginPath(); for (const r of LANDS) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
      ctx.fillStyle = LAND; ctx.fill('nonzero'); ctx.lineWidth = 2 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.lineWidth = 2 / cam.s; ctx.strokeStyle = BORD; ctx.setLineDash([6 / cam.s, 5 / cam.s]);
      for (const l of BORDERS) { ctx.beginPath(); l.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
      ctx.setLineDash([]); ctx.restore();
      ctx.restore();
      // bordas suaves do mapa
      const g1 = ctx.createLinearGradient(0, RECT[1], 0, RECT[1] + 120); g1.addColorStop(0, BG1); g1.addColorStop(1, 'rgba(14,26,46,0)'); ctx.fillStyle = g1; ctx.fillRect(0, RECT[1], W, 120);
      const y2 = RECT[1] + RECT[3]; const g2 = ctx.createLinearGradient(0, y2 - 160, 0, y2); g2.addColorStop(0, 'rgba(7,13,24,0)'); g2.addColorStop(1, BG0); ctx.fillStyle = g2; ctx.fillRect(0, y2 - 160, W, 160);
    }
    function country(cam, s, lon, lat, size, a = 1) { const [x, y] = toS(cam, [lon * K, -lat]); if (x < -200 || x > W + 200 || y < RECT[1] - 50 || y > RECT[1] + RECT[3]) return; txt(s, x, y, size, { w: 800, color: 'rgba(200,215,240,0.45)', a }); }
    function countries(cam, a = 1) {
      const z = cam.s; const sz = clamp(z * 0.9, 22, 40);
      if (z < 60) { country(cam, 'BRASIL', -52, -10, sz, a); country(cam, 'ARGENTINA', -65, -27, sz * 0.8, a); country(cam, 'EQUADOR', -77.5, -1, sz * 0.7, a); country(cam, 'COLÔMBIA', -73, 4, sz * 0.7, a); country(cam, 'PERU', -75, -9, sz * 0.7, a); country(cam, 'EUA', -83, 29, sz * 0.8, a); country(cam, 'OCEANO PACÍFICO', -86, -15, sz * 0.6, a * 0.8); country(cam, 'MAR DO CARIBE', -74, 15, sz * 0.6, a * 0.8); country(cam, 'BOLÍVIA', -64.5, -16.5, sz * 0.6, a); country(cam, 'PARAGUAI', -58, -23, sz * 0.6, a); }
      else { country(cam, 'BRASIL', -54.0, -25.0, 34, a); country(cam, 'ARGENTINA', -54.9, -26.1, 34, a); country(cam, 'PARAGUAI', -55.2, -25.1, 30, a); }
    }
    function pin(cam, n, k, o = {}) {
      if (k <= 0) return; const [x, y] = o.at || P2(cam, n); const r = (o.r || 12) * outBack(k);
      if (o.hl) { for (let j = 0; j < 2; j++) { const ph = ((o.t || 0) * 0.9 + j / 2) % 1; ga(0.6 * (1 - ph)); circ(x, y, r + ph * 60, null, 4, o.col || Y); } ga(1); }
      circ(x, y, r, o.col || WH, 4, INK);
      if (o.label) { const [dx, dy] = o.off || [0, -42]; const s = o.label; ga(clamp(k * 2)); const w = tw(s, o.size || 32, 900) + 30; rr(x + dx - w / 2, y + dy - 26, w, 52, 12); ctx.fillStyle = 'rgba(8,16,32,0.88)'; ctx.fill(); txt(s, x + dx, y + dy + 1, o.size || 32, { w: 900, color: o.lcol || WH }); ga(1); }
    }
    // trecho curvo a→b até fração u; devolve cabeça {x,y,ang}
    function arc(cam, a, b, u, o = {}) {
      if (u <= 0) return null; const A = toS(cam, a), Bp = toS(cam, b), cv = o.curve ?? 0.18;
      const mx = (A[0] + Bp[0]) / 2 - (Bp[1] - A[1]) * cv, my = (A[1] + Bp[1]) / 2 + (Bp[0] - A[0]) * cv;
      const Q = v => [(1 - v) * (1 - v) * A[0] + 2 * (1 - v) * v * mx + v * v * Bp[0], (1 - v) * (1 - v) * A[1] + 2 * (1 - v) * v * my + v * v * Bp[1]];
      ctx.beginPath(); const N = 48; for (let j = 0; j <= N * u; j++) { const p = Q(j / N); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } const h = Q(u); ctx.lineTo(h[0], h[1]);
      ctx.lineCap = 'round'; if (o.glow !== false) { ctx.lineWidth = (o.w || 8) + 10; ctx.strokeStyle = 'rgba(255,209,102,0.18)'; ctx.stroke(); }
      ctx.lineWidth = o.w || 8; ctx.strokeStyle = o.col || Y; ctx.setLineDash(o.dash || []); ctx.lineDashOffset = -(o.t || 0) * 40; ctx.stroke(); ctx.setLineDash([]);
      const h2 = Q(Math.min(1, u + 0.01)), h1 = Q(Math.max(0, u - 0.01)); return { x: h[0], y: h[1], ang: Math.atan2(h2[1] - h1[1], h2[0] - h1[0]) };
    }
    function plane(x, y, ang, s = 1) { // aviãozinho genérico visto de cima
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
      soft(0, 0, 70, 'rgba(255,209,102,A)', 0.35);
      ctx.beginPath(); ctx.moveTo(34, 0); ctx.quadraticCurveTo(30, -6, 20, -6); ctx.lineTo(4, -6); ctx.lineTo(-10, -30); ctx.lineTo(-18, -30); ctx.lineTo(-10, -6); ctx.lineTo(-24, -6); ctx.lineTo(-32, -16); ctx.lineTo(-37, -16); ctx.lineTo(-33, 0);
      ctx.lineTo(-37, 16); ctx.lineTo(-32, 16); ctx.lineTo(-24, 6); ctx.lineTo(-10, 6); ctx.lineTo(-18, 30); ctx.lineTo(-10, 30); ctx.lineTo(4, 6); ctx.lineTo(20, 6); ctx.quadraticCurveTo(30, 6, 34, 0); ctx.closePath();
      ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
    }
    function car(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-34, -16, 68, 32, 10); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); rr(-14, -12, 30, 24, 6); ctx.fillStyle = '#5d7598'; ctx.fill(); ctx.restore(); }
    function person(x, y, s, col = WH) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); circ(0, -46, 18, col, 4, INK); rr(-22, -24, 44, 56, 18); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    function passport(x, y, s, k, cancel) {
      if (k <= 0) return; const sc = outBack(k) * s; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
      rr(-90 + 8, -120 + 10, 180, 240, 14); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
      rr(-90, -120, 180, 240, 14); ctx.fillStyle = '#1e3a6b'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      circ(0, -20, 42, null, 5, Y); line2([[-42, -20], [42, -20]], 4, Y); txt('PASSAPORTE', 0, 70, 22, { w: 900, color: Y });
      if (cancel > 0) { ga(clamp(cancel * 3)); ctx.rotate(-0.25); rr(-120, -34, 240, 68, 10); ctx.fillStyle = 'rgba(8,16,32,0.9)'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = HOT; ctx.stroke(); txt('CANCELADO', 0, 3, 36, { w: 900, color: HOT }); ga(1); }
      ctx.restore();
    }
    function line2(pts, w, col) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); }
    function clockChip(s, x, y, k, col = Y) { // relógio pequeno + horário
      if (k <= 0) return; const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3));
      const w = tw(s, 46, 900) + 110; rr(-w / 2 + 6, -40 + 6, w, 80, 40); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); rr(-w / 2, -40, w, 80, 40); ctx.fillStyle = col; ctx.fill();
      circ(-w / 2 + 44, 0, 24, WH, 4, INK); line2([[-w / 2 + 44, 0], [-w / 2 + 44, -14]], 4, INK); line2([[-w / 2 + 44, 0], [-w / 2 + 54, 4]], 4, INK);
      txt(s, 28, 2, 46, { w: 900, color: INK }); ctx.restore(); ga(1);
    }

    // pontos da rota
    const Pb = P('Brasília'), Pf = P('Foz do Iguaçu'), Pi = P('Puerto Iguazú'), Pg = P('Guayaquil'), Pm = P('Miami');

    // ---------------- tempos ----------------
    const s1 = { fro: wt('c1', 'fronteira'), par: wt('c1', 'parana'), mia: wt('c1', 'miami'), men: wt('c1', 'menos'), doz: wt('c1', 'doze'), hor: wt('c1', 'horas'), rot: wt('c1', 'rota') };
    const s2 = { der: wt('c2', 'derrotado'), tur: wt('c2', 'turno'), ord: wt('c2', 'ordem'), ent: wt('c2', 'entregar'), pas: wt('c2', 'passaportes'), pra: wt('c2', 'prazo'), ven: wt('c2', 'venceu'), can: wt('c2', 'cancelou'), doc: wt('c2', 'documentos') };
    const s3 = { ter: wt('c3', 'terca'), dez: wt('c3', 'dez'), cin: wt('c3', 'cinquenta'), noi: wt('c3', 'noite'), cru: wt('c3', 'cruzou'), pon: wt('c3', 'ponte'), foz: wt('c3', 'foz'), arg: wt('c3', 'argentina'), esp: wt('c3', 'esposa'), fil: wt('c3', 'filhas') };
    const s4 = { qua: wt('c4', 'quarenta'), emb: wt('c4', 'embarcou'), jat: wt('c4', 'jato'), pla: wt('c4', 'plano'), des: wt('c4', 'destino'), dec: wt('c4', 'declarado'), gua: wt('c4', 'guayaquil'), equ: wt('c4', 'equador') };
    const s5 = { la: wt('c5', 'la'), par: wt('c5', 'parou'), aba: wt('c5', 'abastecer'), seg: wt('c5', 'seguiu'), nor: wt('c5', 'norte') };
    const s6 = { man: wt('c6', 'manha'), pou: wt('c6', 'pousou'), aer: wt('c6', 'aeroporto'), mia: wt('c6', 'miami'), inv: wt('c6', 'investigado'), lav: wt('c6', 'lavagem'), med: wt('c6', 'medidas'), int: wt('c6', 'intimida') };
    const s7 = { qua: wt('c7', 'quase'), set: wt('c7', 'sete'), qui: wt('c7', 'quilometros'), vol: wt('c7', 'volta'), com: wt('c7', 'comenta'), seg: wt('c7', 'segue') };

    cue(0, 'music', { part: 'intro' }); cue(0.2, 'impact', { gain: 0.6 }); cue(s1.fro, 'whoosh', { dur: 0.8 }); cue(s1.mia, 'pop'); cue(s1.doz, 'tick', { dur: 0.6 }); cue(s1.rot, 'stamp'); cue(s1.rot, 'music', { part: 'groove' });
    cue(B[1], 'music', { part: 'safe' }); cue(s2.der, 'card'); cue(s2.ord, 'stamp'); cue(s2.pas, 'pop'); cue(s2.pra, 'tick', { dur: 0.5 }); cue(s2.can, 'error'); cue(s2.can, 'stamp');
    cue(s3.dez, 'ding'); cue(s3.cru, 'whoosh', { dur: 0.6 }); cue(s3.pon, 'pop'); cue(s3.arg, 'scan', { dur: 0.6, gain: 0.6 }); cue(s3.esp, 'pop', { gain: 0.5 }); cue(s3.fil, 'pop', { gain: 0.5 });
    cue(s4.qua, 'tick', { dur: 0.5 }); cue(s4.emb, 'engine', { dur: 1.6, f0: 80, f1: 160, gain: 0.5 }); cue(s4.jat, 'whoosh', { dur: 0.8 }); cue(s4.des, 'type', { n: 6, rate: 14 }); cue(s4.gua, 'ding');
    cue(s5.par, 'plop'); cue(s5.aba, 'pour', { dur: 0.8 }); cue(s5.seg, 'whoosh', { dur: 0.7 }); cue(s5.nor, 'riser', { dur: 0.6 });
    cue(s6.pou, 'impact', { gain: 0.5 }); cue(s6.mia, 'stamp'); cue(s6.inv, 'card'); cue(s6.lav, 'pop'); cue(s6.med, 'swoosh');
    cue(B[6], 'music', { part: 'outro' }); cue(s7.set, 'tick', { dur: 0.6 }); cue(s7.vol, 'pop'); cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });

    // rota completa desenhada até a fração "f" de cada trecho
    function fullRoute(cam, t, f, o = {}) {
      const [f1, f2, f3] = f; let h = null;
      if (f1 > 0) h = arc(cam, Pf, Pi, f1, { curve: 0, w: o.w || 7, glow: false }) || h;
      if (f2 > 0) h = arc(cam, Pi, Pg, f2, { curve: -0.14, w: o.w || 7, dash: [18, 12], t }) || h;
      if (f3 > 0) h = arc(cam, Pg, Pm, f3, { curve: 0.12, w: o.w || 7, dash: [18, 12], t }) || h;
      return h;
    }

    // ================= CENA 1 =================
    function scene1(t, cam) {
      drawMap(cam, t); countries(cam, 0.9);
      const u = sm(t, s1.fro - 0.1, s1.mia + 0.3);
      const h = fullRoute(cam, t, [clamp(u * 6), clamp(u * 2.2 - 0.15), clamp(u * 2.2 - 1.2)]);
      pin(cam, 'Puerto Iguazú', prog(t, s1.fro - 0.2, s1.fro + 0.1), { label: 'FOZ DO IGUAÇU', off: [130, 20], t, hl: true });
      pin(cam, 'Guayaquil', prog(t, s1.mia - 0.6, s1.mia - 0.3), { r: 9 });
      pin(cam, 'Miami', prog(t, s1.mia - 0.1, s1.mia + 0.2), { label: 'MIAMI', off: [110, 0], t, hl: true });
      if (h && u < 1) plane(h.x, h.y, h.ang, 0.9);
      const nk = sm(t, s1.men - 0.2, s1.doz + 0.05, outBack);
      if (nk > 0) { rtxt('MENOS DE 12 HORAS', 540, 290, 84, { color: Y, scale: nk }); }
      chip('DA FRONTEIRA ATÉ OS EUA', 540, 395, 36, WH, prog(t, s1.hor - 0.1, s1.hor + 0.2));
    }
    // ================= CENA 2 — contexto =================
    function scene2(t, cam) {
      drawMap(cam, t); countries(cam, 0.6);
      ctx.save(); ga(0.75); ctx.fillStyle = 'rgba(7,13,24,0.55)'; ctx.fillRect(0, 230, W, 1290); ctx.restore(); ga(1);
      card(540, 420, 900, '25/10 · 2º TURNO', 'Flávio é derrotado na eleição', prog(t, s2.der - 0.2, s2.der + 0.2), { col: MU });
      card(540, 610, 900, 'ORDEM DO STF', 'entregar os passaportes à PF', prog(t, s2.ord - 0.2, s2.ord + 0.2), { col: Y });
      passport(320, 960, 1, prog(t, s2.pas - 0.2, s2.pas + 0.2), prog(t, s2.can - 0.05, s2.can + 0.2));
      passport(560, 990, 0.85, prog(t, s2.pas - 0.05, s2.pas + 0.3), prog(t, s2.can + 0.05, s2.can + 0.3));
      if (t > s2.pra - 0.2) clockChip('PRAZO: 27/10 · 11H', 780, 1250, prog(t, s2.pra - 0.2, s2.pra + 0.1), Y);
      if (t > s2.ven - 0.1) stampMark(790, 1110, 'VENCEU', prog(t, s2.ven - 0.05, s2.ven + 0.12), { size: 56, rot: 0.1 });
      chip('A PF CANCELA OS DOCUMENTOS', 540, 1420, 40, HOT, prog(t, s2.can - 0.1, s2.can + 0.2), { tc: WH });
    }
    // ================= CENA 3 — a ponte =================
    function scene3(t, cam) {
      drawMap(cam, t); countries(cam, 0.9);
      // rio (fronteira) já vem do mapa; ponte = ponto entre Foz e Puerto Iguazú
      const [fx, fy] = P2(cam, 'Foz do Iguaçu'), [ix, iy] = P2(cam, 'Puerto Iguazú');
      const bx = lerp(fx, ix, 0.5), by = lerp(fy, iy, 0.5);
      pin(cam, 'Foz do Iguaçu', prog(t, B[2] + 0.4, B[2] + 0.7), { label: 'FOZ DO IGUAÇU (BR)', off: [40, -50] });
      pin(cam, 'Puerto Iguazú', prog(t, s3.arg - 0.2, s3.arg + 0.1), { label: 'PUERTO IGUAZÚ (AR)', off: [60, 60], col: Y });
      const ck = sm(t, s3.cru - 0.1, s3.arg + 0.3);
      if (ck > 0) { ctx.save(); ctx.lineWidth = 8; ctx.strokeStyle = Y; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(lerp(fx, ix, ck), lerp(fy, iy, ck)); ctx.stroke(); ctx.restore(); if (ck < 1) car(lerp(fx, ix, ck), lerp(fy, iy, ck) - 4, 0.9); }
      const pk = prog(t, s3.pon - 0.2, s3.pon + 0.1);
      if (pk > 0) { ga(pk); rr(bx - 40, by - 16, 80, 32, 8); ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fill(); ga(1); chip('PONTE TANCREDO NEVES', 540, 1350, 40, WH, pk); }
      clockChip('27/10 · 22H50', 540, 300, prog(t, s3.dez - 0.2, s3.cin + 0.1));
      // família: 4 bonequinhos genéricos
      const fk = prog(t, s3.esp - 0.3, s3.fil + 0.2);
      if (fk > 0) { ctx.save(); ga(clamp(fk * 2)); rr(300, 1440, 480, 0, 0); [0, 1, 2, 3].forEach(i => { const k = prog(t, s3.esp - 0.3 + i * 0.12, s3.esp + i * 0.12); if (k > 0) person(390 + i * 100, 1250, (i < 2 ? 1.3 : 0.95) * outBack(k), i ? '#c9d3e6' : WH); }); ctx.restore(); ga(1); }
      txt('o trajeto até Foz não foi divulgado', 540, 400, 30, { w: 700, color: MU, a: prog(t, B[2] + 0.8, B[2] + 1.2) * (1 - prog(t, s3.dez - 0.3, s3.dez - 0.1)) });
    }
    // ================= CENA 4 — jato para Guayaquil =================
    function scene4(t, cam) {
      drawMap(cam, t); countries(cam, 0.9);
      const u = sm(t, s4.jat - 0.1, s4.gua + 0.1);
      const h = fullRoute(cam, t, [1, u, 0]);
      pin(cam, 'Puerto Iguazú', 1, { label: 'PUERTO IGUAZÚ', off: [-60, 55], col: Y });
      pin(cam, 'Guayaquil', prog(t, s4.gua - 0.3, s4.gua), { label: 'GUAYAQUIL', off: [0, -48], t, hl: true });
      if (h && u < 1) plane(h.x, h.y, h.ang, 1.1);
      clockChip('23H30 · +40 MIN', 540, 300, prog(t, s4.qua - 0.2, s4.qua + 0.2));
      card(500, 950, 820, 'JATO PARTICULAR', 'decolou de Puerto Iguazú (Argentina)', prog(t, s4.jat - 0.2, s4.jat + 0.2), { col: TE });
      const dk = prog(t, s4.des - 0.2, s4.des + 0.15);
      if (dk > 0) { ctx.save(); ctx.translate(540, 1400); ctx.scale(outBack(dk), outBack(dk)); rr(-360, -70, 720, 140, 16); ctx.fillStyle = '#f2f4f8'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
        txt('PLANO DE VOO', -330, -34, 26, { w: 800, color: '#5d6b85', align: 'left' }); const s = 'DESTINO: GUAYAQUIL'; const n = Math.floor(s.length * prog(t, s4.des, s4.gua + 0.1)); txt(s.slice(0, n), -330, 18, 50, { w: 900, color: INK, align: 'left' }); ctx.restore(); }
    }
    // ================= CENA 5 — abastece e segue =================
    function scene5(t, cam) {
      drawMap(cam, t); countries(cam, 0.9);
      const u = sm(t, s5.seg - 0.1, s5.nor + 0.5);
      const h = fullRoute(cam, t, [1, 1, u * 0.35]);
      pin(cam, 'Guayaquil', 1, { label: 'GUAYAQUIL', off: [-40, 70], t, hl: true });
      const [gx, gy] = P2(cam, 'Guayaquil');
      if (u <= 0) { const bob = Math.sin(t * 3) * 3; plane(gx, gy - 40 + bob, -Math.PI / 2 + 0.5, 1.2); }
      else if (h) plane(h.x, h.y, h.ang, 1.2);
      clockChip('28/10 · ~5H40', 540, 300, prog(t, s5.la - 0.2, s5.la + 0.2));
      const fk = prog(t, s5.aba - 0.3, s5.aba + 0.6);
      if (fk > 0) { ctx.save(); ctx.translate(gx + 190, gy + 40); ga(clamp(fk * 3)); rr(-60, -90, 120, 180, 16); ctx.fillStyle = 'rgba(10,20,38,0.94)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = TE; ctx.stroke(); rr(-40, 70 - 140 * fk, 80, 140 * fk, 8); ctx.fillStyle = TE; ctx.fill(); txt('COMBUSTÍVEL', 0, 125, 24, { w: 900, color: TE }); ctx.restore(); ga(1); }
      chip('SÓ PARA ABASTECER', 540, 1400, 44, TE, prog(t, s5.aba - 0.2, s5.aba + 0.15));
      chip('RUMO AO NORTE ▲', 540, 420, 40, WH, prog(t, s5.nor - 0.2, s5.nor + 0.15));
    }
    // ================= CENA 6 — Miami =================
    function scene6(t, cam) {
      drawMap(cam, t); countries(cam, 0.9);
      const u = sm(t, B[5] + 0.2, s6.pou + 0.1);
      const h = fullRoute(cam, t, [1, 1, lerp(0.35, 1, u)]);
      pin(cam, 'Guayaquil', 1, { label: 'GUAYAQUIL', off: [0, 52] });
      pin(cam, 'Miami', prog(t, s6.pou - 0.2, s6.pou + 0.1), { label: 'MIAMI', off: [130, 10], t, hl: true });
      if (h && u < 1) plane(h.x, h.y, h.ang, 1.1);
      clockChip('28/10 · MANHÃ', 540, 300, prog(t, s6.man - 0.2, s6.man + 0.2));
      chip('AEROPORTO EXECUTIVO', 700, 640, 36, WH, prog(t, s6.aer - 0.2, s6.aer + 0.15));
      const ik = prog(t, s6.inv - 0.3, s6.inv + 0.1);
      if (ik > 0) { ga(clamp(ik * 2) * 0.8); ctx.fillStyle = 'rgba(7,13,24,0.7)'; ctx.fillRect(0, 1060, W, 520); ga(1); }
      card(540, 1170, 920, 'INVESTIGADO NO STF', 'suspeita de lavagem de dinheiro', ik, { col: OR });
      card(540, 1360, 920, 'O QUE ELE DIZ', 'as medidas buscam intimidá-lo', prog(t, s6.med - 0.3, s6.med + 0.1), { col: ICE });
    }
    // ================= CENA 7 — resumo e CTA =================
    function scene7(t, cam) {
      drawMap(cam, t); countries(cam, 0.8);
      fullRoute(cam, t, [1, 1, 1], { w: 6 });
      ['Puerto Iguazú', 'Guayaquil', 'Miami'].forEach((n, i) => pin(cam, n, 1, { r: 10 }));
      const nk = sm(t, s7.qua - 0.2, s7.qui + 0.1, outBack); const km = Math.round(6900 * outC(prog(t, s7.set - 0.2, s7.qui + 0.2)) / 100) * 100;
      if (nk > 0) rtxt(`~${km.toLocaleString('pt-BR')} KM`, 540, 300, 104, { color: Y, scale: nk });
      chip('DE VOO, EM LINHA RETA', 540, 410, 34, WH, prog(t, s7.qui, s7.qui + 0.3));
      const vk = sm(t, s7.vol - 0.4, s7.vol + 0.1, outBack);
      if (vk > 0) { ga(0.85); ctx.fillStyle = 'rgba(7,13,24,0.75)'; ctx.fillRect(0, 1080, W, 460); ga(1); rtxt('ELE VOLTA?', 540, 1180, 96, { color: WH, scale: vk }); }
      chip('COMENTA AQUI', 540, 1300, 42, TE, prog(t, s7.com - 0.15, s7.com + 0.2));
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1440); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); rr(-230, -62, 460, 124, 62); ctx.fillStyle = press ? WH : ICE; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 54, { w: 900, color: INK }); ctx.restore(); }
    }

    // ================= legendas =================
    const HL = new Set(['fronteira', 'miami', 'doze', 'horas', 'rota', 'derrotado', 'ordem', 'passaportes', 'prazo', 'venceu', 'cancelou', 'dez', 'cinquenta', 'ponte', 'argentina', 'filhas', 'quarenta', 'jato', 'particular', 'destino', 'guayaquil', 'equador', 'abastecer', 'norte', 'pousou', 'aeroporto', 'executivo', 'investigado', 'lavagem', 'dinheiro', 'intimidalo', 'sete', 'mil', 'quilometros', 'volta', 'comenta', 'segue']);
    const groups = []; {
      let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); }
      flush(); groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; });
    }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return;
      scr(); const size = 66, font = `900 ${size}px Inter`, a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop;
      ctx.save(); ctx.translate(540, 1650); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? Y : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    const XT = 0.14;
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      bg(); ctx.save(); sceneFns[i](t, camAt(t, i)); ctx.restore(); scr(); ctx.globalAlpha = 1; header();
      ctx.drawImage(vig, 0, 0);
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / XT);
      if (fl > 0) { ctx.globalAlpha = clamp(fl) * 0.6; ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t);
      txt('Fontes: Agência Pública, Chequeado, Migraciones (AR), Ámbito · rota aproximada', 540, 1800, 22, { w: 600, color: 'rgba(255,255,255,0.45)' });
      txt('animação e voz feitas com IA', 540, 1840, 24, { w: 600, color: 'rgba(255,255,255,0.45)' });
    }
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
