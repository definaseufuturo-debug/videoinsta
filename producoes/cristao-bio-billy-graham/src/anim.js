/*
 * BIOGRAFIA — Billy Graham, em colagem editorial vintage (papel envelhecido, retícula, recortes de jornal,
 * carimbos, marcações em vermelho). Sem rostos: silhuetas, multidões em pontos, objetos e números.
 * 9:16 (1080x1920). Toda ação é presa à palavra falada (build/timeline.json).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.06, decay = 0.4) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  function mulberry(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration;
    const NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Gancho: 215 milhões', '1918 e a conversão aos 15', 'Los Angeles 1949', 'Seul 1973', 'Rio 1974, Maracanã', '185 países, 1918–2018', 'CTA'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const HITS = [];
    const hit = (t, k = 1) => HITS.push([t, k]);

    // ------------------------------------------------ paleta (papel, tinta, vermelho de revisão)
    const PAPER = '#e9dcc0', PAPER2 = '#d8c6a0', INK = '#1d1813', INK2 = '#3b332a', RED = '#c8322a', CREAM = '#f6eedb', SEPIA = '#7a5a3a', BLUEP = '#2f4a6d';
    const SERIF = 'Times', MONO = 'Mono';

    // ------------------------------------------------ texturas pré-calculadas
    const R0 = mulberry(5);
    const paper = (() => { const cv = mk(W + 160, H + 160), g = cv.getContext('2d');
      g.fillStyle = PAPER; g.fillRect(0, 0, cv.width, cv.height);
      for (let i = 0; i < 26; i++) { const x = R0() * cv.width, y = R0() * cv.height, r = 120 + R0() * 380, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(140,100,50,${0.05 + R0() * 0.09})`); gr.addColorStop(1, 'rgba(140,100,50,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
      for (let i = 0; i < 60000; i++) { g.fillStyle = R0() < 0.5 ? 'rgba(60,40,20,0.10)' : 'rgba(255,255,255,0.10)'; g.fillRect(R0() * cv.width, R0() * cv.height, 1.5, 1.5); }
      // texto de jornal de fundo, bem apagado
      g.fillStyle = 'rgba(40,30,20,0.07)'; for (let y = 40; y < cv.height; y += 22) for (let c = 0; c < 4; c++) { const x0 = 30 + c * 300; let x = x0; while (x < x0 + 260) { const w = 10 + R0() * 40; g.fillRect(x, y, Math.min(w, x0 + 260 - x), 8); x += w + 8; } }
      g.strokeStyle = 'rgba(80,60,40,0.18)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, cv.height * 0.52); g.lineTo(cv.width, cv.height * 0.5); g.stroke(); g.beginPath(); g.moveTo(cv.width * 0.48, 0); g.lineTo(cv.width * 0.5, cv.height); g.stroke();
      return cv; })();
    const dots = (() => { const cv = mk(12, 12), g = cv.getContext('2d'); g.fillStyle = INK; g.beginPath(); g.arc(6, 6, 3.6, 0, TAU); g.fill(); return cv; })();
    const grain = (() => { const cv = mk(540, 960), g = cv.getContext('2d'); for (let i = 0; i < 18000; i++) { g.fillStyle = R0() < 0.5 ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.10)'; g.fillRect(R0() * 540, R0() * 960, 1.2, 1.2); } return cv; })();
    const vig = (() => { const cv = mk(W, H), g = cv.getContext('2d'), gr = g.createRadialGradient(W / 2, H * 0.47, H * 0.28, W / 2, H * 0.5, H * 0.78); gr.addColorStop(0, 'rgba(40,25,10,0)'); gr.addColorStop(1, 'rgba(40,25,10,0.55)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ------------------------------------------------ primitivas
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) {
      if (o.scale !== undefined && o.scale <= 0.001) return;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
      ctx.font = `${o.w || 800} ${size}px ${o.f || 'Inter'}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha *= o.a ?? 1;
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || INK; ctx.strokeText(s, 0, 0); }
      ctx.fillStyle = o.color || INK; ctx.fillText(s, 0, 0); ctx.restore();
    }
    const tw = (s, size, w = 800, f = 'Inter') => { ctx.font = `${w} ${size}px ${f}`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function circ(x, y, r, fill, lw = 0, sc = INK) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    // traço "à mão" (vermelho de revisão)
    function hand(pts, w, col = RED, k = 1, seed = 1) {
      if (k <= 0) return; const R = mulberry(seed); const n = pts.length - 1, upto = k * n;
      ctx.beginPath(); for (let i = 0; i <= n; i++) { if (i > upto + 1) break; let [x, y] = pts[i]; if (i > upto) { const [x0, y0] = pts[i - 1], u = upto - (i - 1); x = lerp(x0, x, u); y = lerp(y0, y, u); } x += (R() - 0.5) * 4; y += (R() - 0.5) * 4; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    }
    function xMark(x, y, s, k, seed = 3) { hand([[x - s, y - s], [x + s, y + s]], 7, RED, prog(k, 0, 0.5) , seed); hand([[x + s, y - s], [x - s, y + s]], 7, RED, prog(k, 0.5, 1), seed + 1); }
    function ring(x, y, rx, ry, k, seed = 7) { if (k <= 0) return; const pts = []; for (let i = 0; i <= 40; i++) { const a = -1.9 + i / 40 * (TAU + 0.5); pts.push([x + Math.cos(a) * rx * (1 + 0.03 * Math.sin(i)), y + Math.sin(a) * ry]); } hand(pts, 7, RED, k, seed); }
    function measure(x0, y0, x1, y1, k, label) { if (k <= 0) return; const xm = lerp(x0, x1, k), ym = lerp(y0, y1, k); hand([[x0, y0], [xm, ym]], 5, RED, 1, 9); xMark(x0, y0, 14, 1, 11); if (k >= 1) xMark(x1, y1, 14, 1, 13); if (label && k > 0.6) txt(label, (x0 + x1) / 2, (y0 + y1) / 2 - 32, 34, { f: MONO, w: 700, color: RED, a: prog(k, 0.6, 1) }); }
    // recorte de papel com borda rasgada
    function torn(x, y, w, h, fill, rot = 0, seed = 1, o = {}) {
      const R = mulberry(seed); ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      const pts = []; const step = 18;
      for (let xx = -w / 2; xx <= w / 2; xx += step) pts.push([xx, -h / 2 + (R() - 0.5) * 12]);
      for (let yy = -h / 2; yy <= h / 2; yy += step) pts.push([w / 2 + (R() - 0.5) * 10, yy]);
      for (let xx = w / 2; xx >= -w / 2; xx -= step) pts.push([xx, h / 2 + (R() - 0.5) * 12]);
      for (let yy = h / 2; yy >= -h / 2; yy -= step) pts.push([-w / 2 + (R() - 0.5) * 10, yy]);
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0] + 10, p[1] + 12) : ctx.moveTo(p[0] + 10, p[1] + 12)); ctx.closePath(); ctx.fillStyle = 'rgba(40,25,10,0.35)'; ctx.fill();
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
      if (o.lines) { ctx.save(); ctx.clip(); const R2 = mulberry(seed + 9); ctx.fillStyle = 'rgba(40,30,20,0.28)'; for (let yy = -h / 2 + (o.top || 30); yy < h / 2 - 10; yy += 18) { let xx = -w / 2 + 20; while (xx < w / 2 - 20) { const ww = 10 + R2() * 46; ctx.fillRect(xx, yy, Math.min(ww, w / 2 - 20 - xx), 7); xx += ww + 8; } } ctx.restore(); }
      ctx.restore();
    }
    // manchete num recorte de jornal
    function headline(s, x, y, size, k, rot = -0.03, seed = 2, o = {}) {
      if (k <= 0) return; const w = Math.min(1000, tw(s, size, 700, SERIF) + 90), h = size * (o.lines ? 2.4 : 1.55);
      ctx.save(); ctx.translate(x, y); ctx.scale(lerp(1.25, 1, outC(k)), lerp(1.25, 1, outC(k))); ga(clamp(k * 3));
      torn(0, o.lines ? size * 0.42 : 0, w, h, o.fill || CREAM, rot, seed, { lines: o.lines, top: size * 1.05 });
      ctx.rotate(rot); txt(s, 0, o.lines ? -size * 0.1 : 4, size, { f: SERIF, w: 700, color: o.color || INK });
      ctx.restore(); ga(1);
    }
    function stamp(lines, x, y, k, o = {}) {
      if (k <= 0) return; const sc = lerp(1.9, 1, outC(k)), col = o.col || RED;
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.18); ctx.scale(sc, sc); ga(clamp(k * 3) * 0.88);
      const rx = o.rx || 200, ry = o.ry || 110;
      ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.lineWidth = 9; ctx.strokeStyle = col; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, rx - 16, ry - 16, 0, 0, TAU); ctx.lineWidth = 3; ctx.stroke();
      lines.forEach((s, i) => txt(s, 0, (i - (lines.length - 1) / 2) * (o.lh || 54), i === 0 ? (o.s0 || 52) : (o.s1 || 34), { f: MONO, w: 700, color: col }));
      ctx.restore(); ga(1);
    }
    function bigNum(s, x, y, size, k, o = {}) {
      if (k <= 0) return; const sc = outBack(k);
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(o.rot || 0);
      ctx.font = `700 ${size}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(40,25,10,0.35)'; ctx.fillText(s, 10, 12);
      ctx.lineWidth = size * 0.05; ctx.strokeStyle = INK; ctx.strokeText(s, 0, 0);
      ctx.fillStyle = o.color || CREAM; ctx.fillText(s, 0, 0);
      if (o.dotfill) { ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.restore(); }
      ctx.restore();
    }
    function chipLabel(s, x, y, size, k, o = {}) {
      if (k <= 0) return; const w = tw(s, size, 700, MONO) + 44, h = size * 1.6;
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(outBack(k), outBack(k));
      ctx.fillStyle = o.bg || INK; ctx.fillRect(-w / 2, -h / 2, w, h); txt(s, 0, 2, size, { f: MONO, w: 700, color: o.color || CREAM });
      ctx.restore();
    }
    // preenchimento em retícula (pontos) dentro do caminho atual
    function halftoneFill(alpha = 1) { ctx.save(); ctx.clip(); ga(alpha); ctx.fillStyle = ctx.createPattern(dots, 'repeat'); ctx.fillRect(-2000, -2000, 4000, 4000); ga(1); ctx.restore(); }

    // ------------------------------------------------ fundos e câmera
    function bg(t, i) {
      scr(); const z = 1.04 + 0.03 * Math.sin(t * 0.21 + i), dx = -60 + 40 * Math.sin(t * 0.13 + i * 2), dy = -60 + 40 * Math.cos(t * 0.11 + i);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); ctx.drawImage(paper, dx, dy); ctx.restore();
    }
    function header(s) {
      txt('BIOGRAFIA', 540, 118, 30, { f: MONO, w: 700, color: RED });
      txt(s || 'BILLY GRAHAM  (1918 – 2018)', 540, 162, 40, { f: SERIF, w: 700, color: INK });
      ctx.fillStyle = INK; ctx.fillRect(200, 190, 680, 4); ctx.fillRect(200, 198, 680, 1.5);
    }

    // ------------------------------------------------ silhuetas e cenários (sem rosto)
    function preacher(x, y, s, arm = 1, alpha = 1) { // silhueta de pregador com a Bíblia erguida
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.arc(0, -330, 70, 0, TAU);
      ctx.moveTo(-150, 200); ctx.lineTo(-120, -200); ctx.quadraticCurveTo(0, -260, 120, -200); ctx.lineTo(150, 200); ctx.closePath();
      ctx.fillStyle = 'rgba(29,24,19,0.15)'; ctx.fill(); halftoneFill(alpha);
      // braço com a Bíblia
      const ax = lerp(150, 230, arm), ay = lerp(-60, -360, arm);
      ctx.beginPath(); ctx.moveTo(95, -190); ctx.lineTo(ax, ay); ctx.lineWidth = 60; ctx.lineCap = 'round'; ctx.strokeStyle = INK2; ctx.stroke();
      ctx.save(); ctx.translate(ax + 10, ay - 40); ctx.rotate(-0.25); ctx.fillStyle = INK; ctx.fillRect(-60, -42, 120, 84); ctx.fillStyle = CREAM; ctx.fillRect(-4, -36, 8, 72); ctx.restore();
      ctx.restore();
    }
    function barn(x, y, s) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-200, 120); ctx.lineTo(-200, -60); ctx.lineTo(-120, -150); ctx.lineTo(120, -150); ctx.lineTo(200, -60); ctx.lineTo(200, 120); ctx.closePath(); ctx.fillStyle = '#9b3a2a'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = CREAM; ctx.fillRect(-60, 0, 120, 120); ctx.strokeRect(-60, 0, 120, 120); ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(60, 120); ctx.moveTo(60, 0); ctx.lineTo(-60, 120); ctx.stroke();
      ctx.fillRect(-40, -110, 80, 60); ctx.strokeRect(-40, -110, 80, 60);
      // silo
      ctx.fillStyle = '#b7a789'; rr(220, -200, 110, 320, 50); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    function cow(x, y, s) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.ellipse(0, 0, 130, 70, 0, 0, TAU); ctx.fillStyle = CREAM; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-40, -10, 40, 30, 0.3, 0, TAU); ctx.ellipse(50, 15, 34, 24, -0.2, 0, TAU); ctx.fillStyle = INK; ctx.fill();
      ctx.beginPath(); ctx.ellipse(150, -40, 46, 36, 0.2, 0, TAU); ctx.fillStyle = CREAM; ctx.fill(); ctx.stroke();
      for (const lx of [-80, -40, 50, 90]) { ctx.fillStyle = INK; ctx.fillRect(lx - 10, 50, 20, 70); }
      ctx.restore();
    }
    function tent(x, y, s, k) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-420, 200); ctx.lineTo(-360, -40); ctx.quadraticCurveTo(-180, -120, 0, -300); ctx.quadraticCurveTo(180, -120, 360, -40); ctx.lineTo(420, 200); ctx.closePath();
      ctx.fillStyle = CREAM; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
      ctx.save(); ctx.clip(); for (let i = -8; i <= 8; i += 2) { ctx.beginPath(); ctx.moveTo(0, -300); ctx.lineTo(i * 60, 220); ctx.lineTo((i + 1) * 60, 220); ctx.closePath(); ctx.fillStyle = 'rgba(200,50,42,0.75)'; ctx.fill(); } ctx.restore();
      ctx.beginPath(); ctx.moveTo(-420, 200); ctx.lineTo(-360, -40); ctx.quadraticCurveTo(-180, -120, 0, -300); ctx.quadraticCurveTo(180, -120, 360, -40); ctx.lineTo(420, 200); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -300); ctx.lineTo(0, -380); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -380); ctx.lineTo(60, -360); ctx.lineTo(0, -340); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); ctx.stroke();
      // entrada escura com fila de pessoas
      ctx.beginPath(); ctx.moveTo(-90, 200); ctx.lineTo(0, 20); ctx.lineTo(90, 200); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
      ctx.restore();
    }
    function crowd(x0, y0, w, h, n, k, seed, r = 7, shape) {
      const R = mulberry(seed); ctx.fillStyle = INK;
      for (let i = 0; i < n; i++) { const u = R(), v = R(); if (R() > k) continue; let x = x0 + u * w, y = y0 + v * h;
        if (shape && !shape(u, v)) continue; const rr2 = r * (0.7 + 0.6 * v); ctx.beginPath(); ctx.arc(x, y, rr2, 0, TAU); ctx.fill(); ctx.fillRect(x - rr2 * 1.1, y + rr2 * 0.8, rr2 * 2.2, rr2 * 1.6); }
    }
    function stadium(x, y, s, fillK, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.ellipse(0, 0, 440, 300, 0, 0, TAU); ctx.fillStyle = '#bfae8c'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, 400, 266, 0, 0, TAU); ctx.ellipse(0, 0, 230, 140, 0, 0, TAU); ctx.save(); ctx.clip('evenodd');
      const R = mulberry(17); ctx.fillStyle = INK; for (let i = 0; i < 2600; i++) { const a = R() * TAU, rr2 = lerp(0.58, 1, Math.sqrt(R())); if (R() > fillK) continue; const px = Math.cos(a) * 400 * rr2, py = Math.sin(a) * 266 * rr2; ctx.fillRect(px - 3, py - 3, 6 + Math.sin(t * 6 + i) * 0.8, 6); } ctx.restore();
      ctx.beginPath(); ctx.ellipse(0, 0, 230, 140, 0, 0, TAU); ctx.fillStyle = '#5f8a4e'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
      // palco
      ctx.fillStyle = CREAM; ctx.fillRect(-60, -20, 120, 40); ctx.strokeRect(-60, -20, 120, 40);
      ctx.restore();
    }
    function globe(x, y, r, t, pins, seed = 23) {
      ctx.save(); ctx.translate(x, y);
      circ(0, 0, r, '#cdbb95', 9, INK);
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(29,24,19,0.45)';
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(0, 0, Math.abs(r * Math.cos((i / 4) * Math.PI / 2 + t * 0.15)) + 1, r, 0, 0, TAU); ctx.stroke(); }
      for (let j = -3; j <= 3; j++) { const yy = j * r / 4; ctx.beginPath(); ctx.moveTo(-r, yy); ctx.lineTo(r, yy); ctx.stroke(); }
      // massas de terra estilizadas em retícula
      const R = mulberry(seed); for (let i = 0; i < 9; i++) { const cx = (R() - 0.5) * r * 1.4, cy = (R() - 0.5) * r * 1.4; ctx.beginPath(); ctx.ellipse(cx, cy, 60 + R() * 90, 40 + R() * 70, R() * 3, 0, TAU); ctx.fillStyle = 'rgba(29,24,19,0.08)'; ctx.fill(); halftoneFill(0.55); }
      const R2 = mulberry(seed + 1); for (let i = 0; i < pins; i++) { const a = R2() * TAU, d = Math.sqrt(R2()) * r * 0.92; const px = Math.cos(a) * d, py = Math.sin(a) * d; circ(px, py, 7, RED, 2, INK); }
      ctx.restore(); ctx.restore();
    }

    // ================= CENA 1 — GANCHO =================
    const s1 = { duz: wt('c1', 'duzentos'), mil: wt('c1', 'milhoes'), pes: wt('c1', 'pessoas'), tud: wt('c1', 'tudo'), faz: wt('c1', 'fazenda'), lei: wt('c1', 'leite') };
    cue(0, 'music', { part: 'intro' }); cue(0.2, 'whoosh', { dur: 0.5 }); cue(s1.duz, 'roll', { dur: 1.0 }); cue(s1.mil, 'stamp'); cue(s1.tud, 'scratch'); cue(s1.faz, 'reveal'); cue(s1.lei, 'stamp'); cue(s1.lei + 0.2, 'music', { part: 'groove' });
    hit(s1.mil); hit(s1.lei, 0.7);
    function scene1(t) {
      bg(t, 0); header();
      const part2 = t > s1.tud - 0.15;
      if (!part2) {
        preacher(640, 1320, 1.0, sm(t, 0.2, 1.0), prog(t, 0, 0.6));
        // multidão em pontos na frente
        crowd(60, 1300, 960, 260, 900, prog(t, s1.pes - 0.6, s1.pes + 0.3), 3, 9);
        headline('AO VIVO', 330, 330, 58, prog(t, 0.25, 0.55), -0.05, 4);
        const n = 215 * outC(prog(t, s1.duz - 0.1, s1.mil + 0.2));
        bigNum(Math.round(n) + '', 470, 520, 260, sm(t, s1.duz - 0.25, s1.duz + 0.05));
        chipLabel('MILHÕES DE PESSOAS', 470, 700, 46, prog(t, s1.mil - 0.1, s1.mil + 0.2), { rot: -0.02 });
        ring(470, 525, 300, 150, prog(t, s1.pes, s1.pes + 0.6), 5);
      } else {
        barn(430, 1000, 1.25); cow(640, 1260, 1.05);
        crowd(0, 0, 0, 0, 0, 0, 1);
        headline('UMA FAZENDA DE LEITE', 540, 420, 64, prog(t, s1.faz - 0.2, s1.faz + 0.15), -0.04, 6, { lines: true });
        stamp(['CHARLOTTE', 'CAROLINA DO NORTE'], 800, 780, prog(t, s1.lei - 0.1, s1.lei + 0.15), { rx: 230, ry: 100, s0: 44, s1: 28, lh: 48 });
        measure(160, 1450, 920, 1450, prog(t, s1.lei, s1.lei + 0.7), 'ONDE TUDO COMEÇOU');
      }
    }

    // ================= CENA 2 — 1918 e a conversão =================
    const s2 = { bil: wt('c2', 'billy'), nas: wt('c2', 'nasceu'), dez: wt('c2', 'dezoito'), cha: wt('c2', 'charlotte'), est: wt('c2', 'estados'), qui: wt('c2', 'quinze'), avi: wt('c2', 'avivamento'), ent: wt('c2', 'entregou'), cri: wt('c2', 'cristo') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.bil, 'type', { n: 12, rate: 16 }); cue(s2.dez, 'stamp'); cue(s2.qui, 'impact', { gain: 0.6 }); cue(s2.avi, 'scratch'); cue(s2.cri, 'bell');
    hit(s2.dez, 0.8); hit(s2.qui);
    function scene2(t) {
      bg(t, 1); header();
      const part2 = t > s2.qui - 0.3;
      // nome datilografado
      const nm = 'BILLY GRAHAM', nk = Math.floor(nm.length * prog(t, s2.bil - 0.1, s2.bil + 0.7));
      if (!part2) {
        torn(540, 380, 820, 150, CREAM, -0.02, 8);
        txt(nm.slice(0, nk) + (nk < nm.length && Math.floor(t * 4) % 2 ? '_' : ''), 540, 380, 84, { f: MONO, w: 700, color: INK, rot: -0.02 });
        bigNum('1918', 540, 760, 300, sm(t, s2.dez - 0.25, s2.dez + 0.05));
        stamp(['7 NOV 1918', 'NASCIMENTO'], 780, 1040, prog(t, s2.nas, s2.nas + 0.3) * prog(t, s2.dez - 0.1, s2.dez + 0.1), { rx: 210, ry: 96, s0: 46, s1: 28, lh: 48, rot: 0.12 });
        chipLabel('PERTO DE CHARLOTTE · EUA', 400, 1250, 38, prog(t, s2.cha - 0.1, s2.est + 0.2), { rot: 0.02 });
        barn(470, 1400, 0.85);
      } else {
        bigNum('15', 330, 640, 360, sm(t, s2.qui - 0.25, s2.qui + 0.05));
        chipLabel('ANOS', 330, 860, 50, prog(t, s2.qui, s2.qui + 0.2));
        headline('REUNIÃO DE AVIVAMENTO', 540, 1040, 58, prog(t, s2.avi - 0.2, s2.avi + 0.15), 0.03, 12, { lines: true });
        stamp(['1934'], 820, 560, prog(t, s2.avi - 0.1, s2.avi + 0.2), { rx: 150, ry: 90, s0: 70 });
        // Bíblia aberta + luz
        const lk = prog(t, s2.ent - 0.2, s2.cri + 0.4);
        if (lk > 0) { const gr = ctx.createRadialGradient(540, 1360, 0, 540, 1360, 420); gr.addColorStop(0, `rgba(255,236,170,${0.55 * lk})`); gr.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = gr; ctx.fillRect(120, 940, 840, 840); }
        ctx.save(); ctx.translate(540, 1390); ctx.scale(sm(t, s2.ent - 0.3, s2.ent, outBack), sm(t, s2.ent - 0.3, s2.ent, outBack));
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(-120, -50, -240, -20); ctx.lineTo(-240, 120); ctx.quadraticCurveTo(-120, 90, 0, 130); ctx.quadraticCurveTo(120, 90, 240, 120); ctx.lineTo(240, -20); ctx.quadraticCurveTo(120, -50, 0, -10); ctx.closePath(); ctx.fillStyle = CREAM; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 130); ctx.stroke();
        ctx.fillStyle = 'rgba(29,24,19,0.35)'; for (let i = 0; i < 6; i++) { ctx.fillRect(-210, 0 + i * 18, 180, 6); ctx.fillRect(30, 0 + i * 18, 180, 6); }
        ctx.restore();
      }
    }

    // ================= CENA 3 — Los Angeles 1949 =================
    const s3 = { qua: wt('c3', 'quarenta'), nov: wt('c3', 'nove', 1), ten: wt('c3', 'tenda'), los: wt('c3', 'los'), lot: wt('c3', 'lotou'), est: wt('c3', 'estendida'), oit: wt('c3', 'oito'), sem: wt('c3', 'semanas') };
    cue(s3.nov, 'stamp'); cue(s3.ten, 'whoosh', { dur: 0.5 }); cue(s3.lot, 'riser', { dur: 0.7 }); cue(s3.oit, 'impact', { gain: 0.6 }); cue(s3.sem, 'tick', { dur: 0.6 });
    hit(s3.nov, 0.7); hit(s3.oit);
    function scene3(t) {
      bg(t, 2); header();
      bigNum('1949', 540, 420, 220, sm(t, s3.qua - 0.2, s3.nov + 0.05), { rot: -0.03 });
      tent(540, 1010, 1.0, 1);
      crowd(120, 1180, 840, 220, 700, prog(t, s3.lot - 0.4, s3.lot + 0.6), 31, 8);
      headline('LOS ANGELES', 540, 640, 64, prog(t, s3.los - 0.15, s3.los + 0.15), -0.03, 14);
      // calendário: 8 semanas carimbadas
      const ck = prog(t, s3.est - 0.3, s3.est);
      if (ck > 0) { ga(ck); torn(540, 1470, 900, 170, CREAM, 0.01, 15); ga(1);
        for (let i = 0; i < 8; i++) { const x = 175 + i * 104, k = prog(t, s3.oit - 0.3 + i * 0.09, s3.oit - 0.15 + i * 0.09); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(x - 42, 1430, 84, 84); txt('S' + (i + 1), x, 1450, 26, { f: MONO, w: 700, color: INK }); if (k > 0) xMark(x, 1488, 22, k, 40 + i); } }
      chipLabel('8 SEMANAS', 540, 1300, 54, prog(t, s3.sem - 0.15, s3.sem + 0.15), { bg: RED });
    }

    // ================= CENA 4 — Seul 1973 =================
    const s4 = { set: wt('c4', 'setenta'), seu: wt('c4', 'seul'), uni: wt('c4', 'unico'), cul: wt('c4', 'culto'), reu: wt('c4', 'reuniu'), mil: wt('c4', 'milhao'), pes: wt('c4', 'pessoas') };
    cue(s4.seu, 'stamp'); cue(s4.reu, 'roll', { dur: 1.2 }); cue(s4.mil, 'impact', { gain: 0.8 }); cue(s4.pes, 'confetti');
    hit(s4.seu, 0.7); hit(s4.mil);
    function scene4(t) {
      bg(t, 3); header();
      // praça vista de cima, enchendo de pontos
      const fk = prog(t, s4.cul - 0.2, s4.mil + 0.4);
      ctx.save(); ctx.translate(540, 1100); ctx.rotate(-0.06);
      rr(-470, -380, 940, 700, 20); ctx.fillStyle = '#c9b48d'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
      const R = mulberry(41); ctx.fillStyle = INK; for (let i = 0; i < 9000; i++) { const x = -450 + R() * 900, y = -360 + R() * 660; if (R() > fk) continue; ctx.fillRect(x, y, 5, 5); }
      ctx.fillStyle = CREAM; ctx.fillRect(-70, -370, 140, 50); ctx.strokeRect(-70, -370, 140, 50);
      ctx.restore();
      stamp(['SEUL', 'JUNHO 1973'], 290, 420, prog(t, s4.seu - 0.1, s4.seu + 0.15), { rx: 200, ry: 100, s0: 56, s1: 30, lh: 52 });
      headline('UM ÚNICO CULTO', 700, 560, 52, prog(t, s4.uni - 0.15, s4.uni + 0.15), 0.04, 18);
      const n = 1100000 * outC(prog(t, s4.reu - 0.1, s4.mil + 0.2));
      if (t > s4.reu - 0.25) { torn(540, 1610 - 120, 900, 190, CREAM, -0.02, 19); txt('+' + fmt(n), 540, 1490, 120, { f: SERIF, w: 700, color: RED, rot: -0.02, scale: sm(t, s4.reu - 0.25, s4.reu, outBack) }); }
      measure(110, 760, 970, 760, prog(t, s4.mil, s4.mil + 0.6), 'PRAÇA YOIDO');
    }

    // ================= CENA 5 — Rio 1974 =================
    const s5 = { seg: wt('c5', 'seguinte'), vei: wt('c5', 'veio'), rio: wt('c5', 'rio'), mar: wt('c5', 'maracana'), duz: wt('c5', 'duzentas'), cin: wt('c5', 'cinquenta'), lot: wt('c5', 'lotaram'), enc: wt('c5', 'encerramento') };
    cue(s5.rio, 'stamp'); cue(s5.mar, 'reveal'); cue(s5.duz, 'roll', { dur: 1.0 }); cue(s5.lot, 'impact', { gain: 0.7 }); cue(s5.enc, 'bell');
    hit(s5.rio, 0.8); hit(s5.lot);
    function scene5(t) {
      bg(t, 4); header();
      stamp(['RIO DE JANEIRO', '1974'], 330, 420, prog(t, s5.rio - 0.1, s5.rio + 0.15), { rx: 250, ry: 105, s0: 44, s1: 40, lh: 52, rot: -0.12 });
      chipLabel('BRASIL', 790, 330, 44, prog(t, s5.vei - 0.1, s5.vei + 0.2), { bg: BLUEP, rot: 0.05 });
      stadium(540, 1050, 1.05, prog(t, s5.mar, s5.lot + 0.5), t);
      headline('MARACANÃ', 540, 640, 76, prog(t, s5.mar - 0.15, s5.mar + 0.15), 0.03, 22);
      const n = 250000 * outC(prog(t, s5.duz - 0.1, s5.cin + 0.3));
      if (t > s5.duz - 0.25) { torn(540, 1480, 860, 190, CREAM, 0.02, 23); txt('≈ ' + fmt(n), 540, 1480, 120, { f: SERIF, w: 700, color: RED, rot: 0.02, scale: sm(t, s5.duz - 0.25, s5.duz, outBack) }); }
      ring(540, 1050, 500, 340, prog(t, s5.enc - 0.2, s5.enc + 0.6), 29);
    }

    // ================= CENA 6 — 185 países, 1918–2018 =================
    const s6 = { cen: wt('c6', 'cento'), pai: wt('c6', 'paises'), par: wt('c6', 'partiu'), doi: wt('c6', 'dois'), nov: wt('c6', 'noventa'), ano: wt('c6', 'anos') };
    cue(s6.cen, 'roll', { dur: 1.0 }); cue(s6.pai, 'stamp'); cue(s6.par, 'riser', { dur: 0.6, gain: 0.5 }); cue(s6.doi, 'stamp'); cue(s6.nov, 'bell');
    hit(s6.pai, 0.8);
    function scene6(t) {
      bg(t, 5); header();
      const part2 = t > s6.par - 0.25;
      if (!part2) {
        const pins = Math.round(185 * outC(prog(t, s6.cen - 0.2, s6.pai + 0.3)));
        globe(540, 1000, 380, t, pins);
        bigNum('+' + pins, 540, 470, 220, sm(t, s6.cen - 0.25, s6.cen + 0.05));
        chipLabel('PAÍSES E TERRITÓRIOS', 540, 640, 44, prog(t, s6.pai - 0.1, s6.pai + 0.2));
      } else {
        const k1 = sm(t, s6.par - 0.25, s6.par + 0.1, outBack);
        preacher(540, 1220, 1.0, 0.15, 0.5 * k1);
        bigNum('1918', 300, 520, 170, k1, { rot: -0.04 });
        bigNum('2018', 780, 520, 170, sm(t, s6.doi - 0.2, s6.doi + 0.1, outBack), { rot: 0.04 });
        hand([[430, 540], [650, 540]], 8, RED, prog(t, s6.doi - 0.3, s6.doi + 0.2), 31);
        stamp(['99 ANOS'], 540, 1500, prog(t, s6.nov - 0.1, s6.nov + 0.15), { rx: 200, ry: 90, s0: 60, rot: -0.06 });
        stamp(['21 FEV 2018'], 760, 760, prog(t, s6.doi, s6.doi + 0.2), { rx: 170, ry: 70, s0: 38, rot: 0.14 });
      }
    }

    // ================= CENA 7 — CTA =================
    const s7 = { qua: wt('c7', 'qual'), pre: wt('c7', 'pregador'), mar: wt('c7', 'marcou'), fe: wt('c7', 'fe'), com: wt('c7', 'comenta'), seg: wt('c7', 'segue'), his: wt('c7', 'historias'), eva: wt('c7', 'evangelho') };
    cue(B[6], 'music', { part: 'outro' }); cue(s7.qua, 'type', { n: 10, rate: 14 }); cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    function scene7(t) {
      bg(t, 6); header('HISTÓRIAS DE FÉ');
      headline('QUAL PREGADOR', 540, 420, 84, sm(t, s7.qua - 0.2, s7.qua + 0.15), -0.03, 33);
      headline('MARCOU A SUA FÉ?', 540, 560, 84, sm(t, s7.mar - 0.2, s7.mar + 0.15), 0.02, 34);
      ring(540, 560, 420, 90, prog(t, s7.fe, s7.fe + 0.5), 35);
      const ck = sm(t, s7.com - 0.2, s7.com + 0.15, outBack);
      if (ck > 0) { ctx.save(); ctx.translate(540, 820); ctx.scale(ck, ck); torn(0, 0, 640, 140, CREAM, -0.02, 36); txt('COMENTA AQUI', 0, 4, 60, { f: MONO, w: 700, color: RED, rot: -0.02 }); ctx.restore(); }
      preacher(540, 1260, 0.75, 1, 0.8 * prog(t, s7.his - 0.3, s7.his + 0.3));
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1470); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = 'rgba(40,25,10,0.35)'; ctx.fillRect(-250 + 10, -70 + 12, 500, 140); ctx.fillStyle = press ? CREAM : INK; ctx.fillRect(-250, -70, 500, 140); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(-250, -70, 500, 140); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 60, { w: 900, color: press ? INK : CREAM }); ctx.restore(); }
    }

    // ================= legendas =================
    const HL = new Set(['duzentos', 'quinze', 'milhoes', 'fazenda', 'leite', 'billy', 'graham', 'dezoito', 'charlotte', 'avivamento', 'cristo', 'tenda', 'los', 'angeles', 'oito', 'semanas', 'seul', 'unico', 'milhao', 'rio', 'maracana', 'cinquenta', 'paises', 'noventa', 'pregador', 'fe', 'comenta', 'segue', 'evangelho']);
    const groups = []; {
      let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); }
      flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; });
    }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return;
      scr(); const size = 66, font = `900 ${size}px Inter`;
      const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.88 + 0.12 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop;
      ctx.save(); ctx.translate(540, 1690); ctx.scale(sc, sc); ctx.globalAlpha = a;
      let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? '#ffd166' : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // ================= composição =================
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    const XT = 0.16;
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      // tremida nas batidas
      let sh = 0; for (const [ht, k] of HITS) sh = Math.max(sh, pulse(t, ht, 0.03, 0.18) * k);
      ctx.save(); if (sh > 0.02) ctx.translate(Math.sin(t * 90) * 10 * sh, Math.cos(t * 77) * 10 * sh);
      sceneFns[i](t); ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / XT);
      scr(); ctx.globalAlpha = 0.3; const f = Math.floor(t * 12); ctx.drawImage(grain, -((f * 37) % 40), -((f * 53) % 40), W + 40, H + 40); ctx.globalAlpha = 1; ctx.drawImage(vig, 0, 0);
      if (fl > 0) { ctx.globalAlpha = clamp(fl) * 0.85; ctx.fillStyle = '#e9dcc0'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t);
      txt('animação e voz feitas com IA', 540, 1840, 26, { w: 600, color: 'rgba(29,24,19,0.55)' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
