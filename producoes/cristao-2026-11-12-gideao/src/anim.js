/*
 * GIDEÃO E OS 300 (Juízes 7). História que surpreende, pergaminho, 9:16 (perfil cristão).
 * Contornos: Natural Earth 10m (assets/regiao.json). Locais: identificações tradicionais (Socó = Kh. Shuweikeh,
 * Azeca = Tel Azeca, Gate = Tell es-Safi, Ecrom = Tel Miqne). Acampamentos e vale: posição aproximada.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const GEO = (typeof require === 'function') ? require('../assets/regiao.json') : null;
  const W = 1080, H = 1920, TAU = Math.PI * 2, K = Math.cos((GEO ? GEO.lat_ref : 32) * Math.PI / 180);
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  const PAPER = '#efe2c4', SEA = '#c9d6cf', LAND = '#e6d3a6', COAST = '#8b6b3d', INK = '#3b2a1a', MUTE = '#7a6248', GOLD = '#c08a1e';
  const RED = '#b23a2e', BLUE = '#2f5d8a', RIVER = '#4f86b0', GREEN = '#3c7a3e', GRAY = '#6d6d6d', DRY = '#cdb27a';


  function create(TL, env) {
    const mk = env.createCanvas, G = env.geo || GEO;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = TL.clips.length;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot); ctx.font = `${o.it ? 'italic ' : ''}${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || PAPER; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || INK; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.3, w = o.w || 700; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || INK }); cx += ws[i] + sp; }); }
    function plaque(s, x, y, size, k, o = {}) { if (k <= 0) return; const w = tw(s, size, 900) + size * 1.0, h = size * 1.6, sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = o.fill || '#f7eed6'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 4; ctx.strokeStyle = o.col || INK; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14); txt(s, 0, 3, size, { w: 900, color: o.col || INK }); ctx.restore(); ga(1); }
    function stamp(s, x, y, k, o = {}) { if (k <= 0) return; const sc = lerp(2.2, 1, outC(k)), size = o.size || 80, w = tw(s, size, 900) + 60, h = size * 1.4; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.9)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 9; ctx.strokeStyle = o.col || RED; ctx.strokeRect(-w / 2, -h / 2, w, h); txt(s, 0, 4, size, { w: 900, color: o.col || RED }); ctx.restore(); ga(1); }

    const tex = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); let s = 9; const R0 = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 60000; i++) { g.fillStyle = R0() < 0.5 ? 'rgba(120,80,30,0.05)' : 'rgba(255,255,255,0.06)'; g.fillRect(R0() * W, R0() * H, 1 + R0() * 2, 1 + R0() * 2); }
      const gr = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); gr.addColorStop(0, 'rgba(90,55,20,0)'); gr.addColorStop(1, 'rgba(90,55,20,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ---------------- câmera e mapa ----------------
    const RECT = [20, 430, 1040, 1000];
    const box = (lo0, lo1, la0, la1) => { const x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(RECT[2] / (x1 - x0), RECT[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    const FULL = box(35.12, 35.62, 32.38, 32.74);
    const CAMP = box(35.15, 35.35, 32.56, 32.69);
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const ll = (cam, lo, la) => toS(cam, [lo * K, -la]);
    const inRect = (x, y, m = 0) => x > RECT[0] + m && x < RECT[0] + RECT[2] - m && y > RECT[1] + m && y < RECT[1] + RECT[3] - m;
    function clipMap() { ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); }
    const landPath = () => { ctx.beginPath(); for (const r of G.land) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } };
    const HILLS = []; { let s = 11; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 160; i++) { const lo = 35.05 + R() * 0.65, la = 32.32 + R() * 0.5; if (la > 32.53 && la < 32.66 && lo < 35.4) continue; HILLS.push([lo, la, 0.004 + R() * 0.007]); } }
    const P = { har: [35.383, 32.551], mor: [35.368, 32.622], gil: [35.43, 32.47], mid: [35.25, 32.625], jor: [35.56, 32.56] };
    function drawMap(cam, o = {}) {
      ctx.save(); clipMap();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      landPath(); ctx.fillStyle = LAND; ctx.fill('nonzero');
      ctx.save(); landPath(); ctx.clip('nonzero'); ctx.fillStyle = 'rgba(160,120,60,0.06)'; for (const [lo, la, r] of HILLS) { ctx.beginPath(); ctx.ellipse(lo * K, -la, r * 1.6, r, 0, 0, TAU); ctx.fill(); }
      // vale de Jezreel (faixa verde ilustrativa)
      ctx.strokeStyle = 'rgba(95,140,70,0.22)'; ctx.lineCap = 'round'; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(35.15 * K, -32.62); ctx.lineTo(35.33 * K, -32.59); ctx.lineTo(35.5 * K, -32.52); ctx.stroke(); ctx.restore();
      if (G.rivers) { ctx.beginPath(); for (const r of G.rivers) r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = RIVER; ctx.lineWidth = 3 / cam.s; ctx.stroke(); }
      ctx.beginPath(); for (const r of G.lakes) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } ctx.fillStyle = SEA; ctx.fill(); ctx.lineWidth = 1.5 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.restore();
      // montes (triângulos)
      for (const [p, n, dy] of [[P.mor, 'OUTEIRO DE MORÉ', -44], [P.gil, 'MONTE GILBOA', -42]]) { const [x, y] = ll(cam, p[0], p[1]); if (!inRect(x, y, 20)) continue; ctx.beginPath(); ctx.moveTo(x - 34, y + 16); ctx.lineTo(x, y - 22); ctx.lineTo(x + 34, y + 16); ctx.closePath(); ctx.fillStyle = 'rgba(122,98,72,0.45)'; ctx.fill(); txt(n, x, y + dy, 26, { w: 800, color: MUTE, stroke: 7 }); }
      { const [x, y] = ll(cam, 35.56, 32.66); if (inRect(x, y, 40)) txt('RIO JORDÃO', x, y, 24, { w: 800, it: true, color: RIVER, a: 0.9, rot: 1.45 }); }
      if (o.night > 0) { ctx.fillStyle = `rgba(14,18,40,${0.62 * o.night})`; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
      ctx.restore();
    }
    function frame() { ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
    function header() { spaced('GIDEÃO E OS 300', 540, 140, 56, { sp: 10 }); txt('Juízes 7', 540, 210, 30, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(200, 245, 680, 3); }
    function arrowHead(x, y, ang, col, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, -13); ctx.lineTo(-12, 13); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    function place(cam, p, name, k, o = {}) { if (k <= 0) return; const [x, y] = ll(cam, p[0], p[1]); if (!inRect(x, y, 10)) return; ctx.save(); clipMap(); const e = outBack(k);
      ctx.beginPath(); ctx.arc(x, y, 12 * e, 0, TAU); ctx.fillStyle = o.col || INK; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke();
      txt(name, x + (o.dx ?? 0), y + (o.dy ?? -36), o.size || 32, { w: 900, color: o.col || INK, stroke: 9, a: clamp(k * 2), align: o.align || 'center' }); ctx.restore(); }
    // muitas tendas (midianitas) em volta de um ponto
    const TENTS = []; { let s = 21; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 150; i++) { const a = R() * TAU, r = Math.sqrt(R()); TENTS.push([Math.cos(a) * r * 0.06, Math.sin(a) * r * 0.028, R()]); } }
    function tentAt(x, y, sc, col) { ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.beginPath(); ctx.moveTo(-14, 10); ctx.lineTo(0, -14); ctx.lineTo(14, 10); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    function midian(cam, k, o = {}) { if (k <= 0) return; ctx.save(); clipMap(); const sc = Math.min(1.4, cam.s / FULL.s * 0.8);
      TENTS.forEach(([dx, dy, r], i) => { const e = outBack(prog(k, r * 0.6, r * 0.6 + 0.4)); if (e <= 0) return; let lo = P.mid[0] + dx, la = P.mid[1] + dy;
        let [x, y] = ll(cam, lo, la); if (o.flee > 0) { const f = o.flee, ang = (i * 2.399) % TAU; x += (Math.cos(ang) * 40 + 260) * f * (0.6 + r); y += Math.sin(ang) * 60 * f + 40 * f * r; ga(1 - 0.5 * f); }
        if (o.fire > 0 && r < 0.2) { glowDot(x, y - 6, 18 * sc, o.fire); }
        tentAt(x, y, e * sc, RED); ga(1); });
      ctx.restore(); }
    function glowDot(x, y, r, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2); g.addColorStop(0, `rgba(255,190,80,${a})`); g.addColorStop(1, 'rgba(255,140,40,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4); }
    function israel(cam, k, label) { if (k <= 0) return; const [x, y] = ll(cam, P.har[0], P.har[1]); const sc = cam.s / FULL.s * 0.7; ctx.save(); clipMap();
      for (let i = 0; i < 5; i++) { const e = outBack(prog(k, i * 0.1, i * 0.1 + 0.4)); if (e > 0) tentAt(x + (i - 2) * 26 * sc, y + 26 + (i % 2) * 14 * sc, e * sc, BLUE); }
      if (label) txt(label, x, y + 80 * sc, 28, { w: 900, color: BLUE, stroke: 8, a: clamp(k * 2) }); ctx.restore(); }
    function panel(k, y = 1240, h = 300) { if (k <= 0) return null; const s = outBack(k); ctx.save(); ctx.translate(540, y); ctx.scale(s, s); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.97)'; ctx.fillRect(-470, -h / 2, 940, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-470, -h / 2, 940, h); ctx.strokeRect(-460, -h / 2 + 10, 920, h - 20); return true; }
    const endPanel = () => { ctx.restore(); ga(1); };
    const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // ---------------- grade de soldados (cada ponto = 1 soldado) ----------------
    const GC = 200, GR = 160, GP = 4.8, GX = 540 - GC * GP / 2, GY = 560;
    const layers = (() => { let s = 77; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647); const idx = [...Array(GC * GR).keys()]; for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      const mkL = (list, col, r) => { const cv = mk(W, GR * GP + 20), g = cv.getContext('2d'); g.fillStyle = col; for (const k of list) { const cx = GX + (k % GC) * GP + GP / 2, cy = 10 + Math.floor(k / GC) * GP + GP / 2; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); } return cv; };
      return { keep: idx.slice(0, 300), A: mkL(idx.slice(0, 300), INK, 1.7), B: mkL(idx.slice(300, 10000), INK, 1.7), C: mkL(idx.slice(10000), INK, 1.7) }; })();
    function grid(t, o) { // o: {c: alpha camada C, cy: queda C, b: alpha B, hl: destaque dos 300}
      ctx.save(); ctx.fillStyle = 'rgba(247,238,214,0.7)'; ctx.fillRect(GX - 20, GY - 20, GC * GP + 40, GR * GP + 40); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(GX - 20, GY - 20, GC * GP + 40, GR * GP + 40);
      ctx.beginPath(); ctx.rect(GX - 18, GY - 18, GC * GP + 36, GR * GP + 36); ctx.clip();
      if (o.c > 0) { ga(o.c); ctx.drawImage(layers.C, 0, GY - 10 + (o.cy || 0)); }
      if (o.b > 0) { ga(o.b); ctx.drawImage(layers.B, 0, GY - 10); }
      ga(1); ctx.drawImage(layers.A, 0, GY - 10);
      if (o.hl > 0) { ctx.fillStyle = RED; for (const k of layers.keep) { const cx = GX + (k % GC) * GP + GP / 2, cy = GY + Math.floor(k / GC) * GP + GP / 2; ctx.beginPath(); ctx.arc(cx, cy, 2 + 5 * o.hl, 0, TAU); ctx.fill(); } }
      ctx.restore(); ga(1);
      txt('cada ponto = 1 soldado', 540, GY + GR * GP + 50, 28, { w: 700, color: MUTE }); }
    function counter(n, k, col, y = 395, label = 'SOLDADOS') { if (k <= 0) return; txt(fmt(n), 540, y, 130, { w: 900, color: col || INK, scale: outBack(k) }); txt(label, 540, y + 90, 32, { w: 800, color: MUTE, a: k }); }
    // grandes números: 300 × 135.000
    const BIG = (() => { const cols = 450, rows = 300, p = 2.1, cv = mk(cols * p + 4, rows * p + 4), g = cv.getContext('2d'); g.fillStyle = RED; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) g.fillRect(2 + i * p, 2 + j * p, 1.3, 1.3); return cv; })();
    // objetos: trombeta, jarro, tocha
    function horn(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-70, 30); ctx.quadraticCurveTo(-10, 40, 40, -10); ctx.quadraticCurveTo(60, -40, 50, -70); ctx.lineWidth = 26; ctx.strokeStyle = '#d9c39a'; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.ellipse(50, -72, 20, 10, -0.3, 0, TAU); ctx.fillStyle = '#c4a774'; ctx.fill(); ctx.stroke(); ctx.restore(); }
    function jar(x, y, s, broken) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#b5683c'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
      if (!broken) { ctx.beginPath(); ctx.moveTo(-22, -70); ctx.lineTo(22, -70); ctx.quadraticCurveTo(70, -20, 40, 50); ctx.lineTo(-40, 50); ctx.quadraticCurveTo(-70, -20, -22, -70); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -70, 24, 8, 0, 0, TAU); ctx.fillStyle = '#5a321c'; ctx.fill(); ctx.stroke(); }
      else { for (const [dx, dy, r] of [[-50, 40, 0.5], [40, 46, -0.4], [-10, 60, 1.2], [60, 10, 0.9]]) { ctx.save(); ctx.translate(dx, dy); ctx.rotate(r); ctx.beginPath(); ctx.moveTo(-18, -10); ctx.lineTo(16, -14); ctx.lineTo(10, 12); ctx.lineTo(-14, 8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } }
      ctx.restore(); }
    function torch(x, y, s, fl) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#6b4a2b'; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.fillRect(-8, -40, 16, 110); ctx.strokeRect(-8, -40, 16, 110);
      if (fl > 0) { const f = 1 + 0.08 * Math.sin(y + Date.now() * 0); ctx.save(); ctx.scale(fl, fl * f); ctx.beginPath(); ctx.moveTo(0, -120); ctx.quadraticCurveTo(38, -70, 20, -40); ctx.lineTo(-20, -40); ctx.quadraticCurveTo(-38, -70, 0, -120); ctx.fillStyle = '#f0a020'; ctx.fill(); ctx.beginPath(); ctx.moveTo(0, -90); ctx.quadraticCurveTo(18, -62, 10, -44); ctx.lineTo(-10, -44); ctx.quadraticCurveTo(-18, -62, 0, -90); ctx.fillStyle = '#ffe07a'; ctx.fill(); ctx.restore(); }
      ctx.restore(); }
    // silhuetas bebendo
    function kneelDrink(x, y, col) { ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 50, y); ctx.lineTo(x - 30, y - 40); ctx.lineTo(x + 10, y - 40); ctx.lineTo(x + 50, y - 10); ctx.moveTo(x + 10, y - 40); ctx.lineTo(x + 40, y + 0); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 66, y - 2, 15, 0, TAU); ctx.fill(); ctx.restore(); }
    function handDrink(x, y, col) { ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 30, y); ctx.lineTo(x - 10, y - 45); ctx.lineTo(x + 20, y - 10); ctx.moveTo(x - 10, y - 45); ctx.lineTo(x + 5, y - 100); ctx.moveTo(x + 5, y - 90); ctx.lineTo(x + 35, y - 70); ctx.lineTo(x + 25, y - 115); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 12, y - 125, 16, 0, TAU); ctx.fill(); ctx.restore(); }
    function waterBand(x0, x1, y, k) { if (k <= 0) return; ctx.save(); ctx.fillStyle = `rgba(79,134,176,${0.55 * k})`; ctx.beginPath(); ctx.moveTo(x0, y); for (let x = x0; x <= x1; x += 20) ctx.lineTo(x, y + 6 * Math.sin(x * 0.05)); ctx.lineTo(x1, y + 40); ctx.lineTo(x0, y + 40); ctx.closePath(); ctx.fill(); ctx.restore(); }

    // ---------------- tempos ----------------
    const s1 = { tri: wt('c1', 'trinta'), sol: wt('c1', 'soldados'), dem: wt('c1', 'demais') };
    const s2 = { jui: wt('c2', 'juizes'), gid: wt('c2', 'gideao'), men: wt('c2', 'menor'), fon: wt('c2', 'fonte'), har: wt('c2', 'harode'), mid: wt('c2', 'midianitas'), gaf: wt('c2', 'gafanhotos'), cam: wt('c2', 'camelos') };
    const s3 = { cor: wt('c3', 'corte'), med: wt('c3', 'medo'), vin: wt('c3', 'vinte'), emb: wt('c3', 'embora') };
    const s4 = { dez: wt('c4', 'dez'), mui: wt('c4', 'muito'), agu: wt('c4', 'agua') };
    const s5 = { ajo: wt('c5', 'ajoelham'), tre: wt('c5', 'trezentos'), mao: wt('c5', 'mao'), fic: wt('c5', 'ficam') };
    const s6 = { tre: wt('c6', 'trezentos'), cen: wt('c6', 'cento'), cin: wt('c6', 'cinco'), qua: wt('c6', 'quatrocentos'), cad: wt('c6', 'cada') };
    const s7 = { arm: wt('c7', 'armas'), tro: wt('c7', 'trombeta'), jar: wt('c7', 'jarro'), toc: wt('c7', 'tocha'), esc: wt('c7', 'escondida') };
    const s8 = { mei: wt('c8', 'meianoite'), gru: wt('c8', 'grupos'), cer: wt('c8', 'cercam'), que: wt('c8', 'quebram'), toc: wt('c8', 'tochas'), tro: wt('c8', 'trombetas') };
    const s9 = { nin: wt('c9', 'ninguem'), esc: wt('c9', 'escuro'), esp: wt('c9', 'espada'), fog: wt('c9', 'foge') };
    const s10 = { por: wt('c10', 'por'), exp: wt('c10', 'explica'), isr: wt('c10', 'israel'), liv: wt('c10', 'livrou') };
    const s11 = { voc: wt('c11', 'voce'), com: wt('c11', 'comenta'), seg: wt('c11', 'segue'), sol: wt('c11', 'sol') };

    cue(0, 'music', { part: 'intro' }); cue(s1.tri, 'riser', { dur: 0.8 }); cue(s1.dem, 'stamp'); cue(B[1], 'music', { part: 'safe' });
    cue(s2.jui, 'pop'); cue(s2.har, 'water', { dur: 0.8, gain: 0.4 }); cue(s2.mid, 'pop'); cue(s2.gaf, 'stamp');
    cue(s3.med, 'pop'); cue(s3.vin, 'whoosh', { dur: 1.2 }); cue(s3.emb, 'minus');
    cue(s4.dez, 'stamp'); cue(s4.mui, 'impact', { gain: 0.6 }); cue(s4.agu, 'water', { dur: 1.2, gain: 0.5 });
    cue(s5.ajo, 'splash'); cue(s5.tre, 'reveal'); cue(s5.fic, 'stamp');
    cue(s6.cen, 'impact', { gain: 0.7 }); cue(s6.qua, 'stamp');
    cue(s7.tro, 'pop'); cue(s7.jar, 'pop'); cue(s7.toc, 'fire'); cue(s7.esc, 'whoosh', { dur: 0.4 });
    cue(s8.mei, 'bell'); cue(s8.cer, 'swoosh'); cue(s8.que, 'crack'); cue(s8.que + 0.15, 'crack'); cue(s8.toc, 'fire'); cue(s8.tro, 'riser', { dur: 1.0 });
    cue(s9.esp, 'impact', { gain: 0.6 }); cue(s9.fog, 'whoosh', { dur: 1.0 }); cue(B[9], 'music', { part: 'outro' });
    cue(s10.exp, 'reveal'); cue(s10.liv, 'ding', { gain: 0.6 });
    cue(s11.com, 'notif'); cue(s11.seg + 0.2, 'tap'); cue(s11.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });
    const lin = x => x;

    // ---------------- cenas ----------------
    function scene1(t) {
      grid(t, { c: 1, b: 1, hl: 0 });
      const ck = sm(t, 0.15, 0.6, outC); counter(lerp(0, 32000, sm(t, s1.tri - 0.2, s1.sol, outC)), ck);
      if (t > s1.dem - 0.3) stamp('É GENTE DEMAIS', 540, 960, prog(t, s1.dem - 0.3, s1.dem), { size: 84 });
    }
    function scene2(t) {
      const cam = FULL; drawMap(cam); israel(cam, prog(t, s2.fon - 0.2, s2.har + 0.4), 'GIDEÃO E ISRAEL');
      place(cam, P.har, 'FONTE DE HARODE', prog(t, s2.har - 0.3, s2.har), { col: BLUE, dx: 24, dy: 0, align: 'left' });
      midian(cam, prog(t, s2.mid - 0.2, s2.cam + 0.6));
      if (t > s2.cam - 0.2) { const [x, y] = ll(cam, P.mid[0] - 0.02, P.mid[1] + 0.06); ctx.save(); clipMap(); txt('MIDIANITAS', x, y, 34, { w: 900, color: RED, stroke: 9, a: prog(t, s2.mid, s2.mid + 0.3) }); ctx.restore(); }
      else if (t > s2.mid) { const [x, y] = ll(cam, P.mid[0] - 0.02, P.mid[1] + 0.06); ctx.save(); clipMap(); txt('MIDIANITAS', x, y, 34, { w: 900, color: RED, stroke: 9, a: prog(t, s2.mid, s2.mid + 0.3) }); ctx.restore(); }
      frame();
      if (t > s2.gaf - 0.3) stamp('COMO GAFANHOTOS (7:12)', 540, 1250, prog(t, s2.gaf - 0.3, s2.gaf), { size: 56 });
      if (t > s2.men - 0.3) plaque('O MENOR DA FAMÍLIA MAIS POBRE (6:15)', 540, 360, 32, prog(t, s2.men - 0.3, s2.men), { col: BLUE });
      else plaque('JUÍZES 7', 540, 360, 52, prog(t, B[1], B[1] + 0.3));
    }
    function scene3(t) {
      const f = sm(t, s3.vin - 0.1, s3.emb + 0.4); grid(t, { c: 1 - f, cy: 200 * f, b: 1 });
      counter(lerp(32000, 10000, sm(t, s3.vin, s3.emb + 0.3, outC)), 1);
      if (t > s3.vin - 0.2) stamp('−22.000', 540, 960, prog(t, s3.vin - 0.2, s3.vin + 0.1), { size: 110 });
      plaque('QUEM TEM MEDO, VOLTE (7:3)', 540, 1440, 40, prog(t, s3.med - 0.3, s3.med));
    }
    function scene4(t) {
      grid(t, { c: 0, b: 1 }); counter(10000, 1);
      if (t > s4.mui - 0.3) stamp('AINDA É MUITO', 540, 960, prog(t, s4.mui - 0.3, s4.mui), { size: 84 });
      waterBand(GX - 20, GX + GC * GP + 20, 1395, sm(t, s4.agu - 0.3, s4.agu + 0.4));
      if (t > s4.agu - 0.3) plaque('LEVA ATÉ A ÁGUA (7:4)', 540, 1470, 40, prog(t, s4.agu - 0.3, s4.agu), { col: BLUE });
    }
    function scene5(t) {
      const sw = sm(t, s5.mao - 0.3, s5.mao + 0.1);
      if (sw < 1) { ga(1 - sw); if (panel(prog(t, B[4], B[4] + 0.3), 930, 820)) {
          waterBand(-440, 60, 200, 1); for (let i = 0; i < 3; i++) kneelDrink(-360 + i * 150, 200, MUTE);
          txt('AJOELHARAM-SE', -190, -230, 46, { w: 900, color: MUTE, a: prog(t, s5.ajo - 0.2, s5.ajo + 0.2) });
          txt('9.700', -190, -140, 100, { w: 900, color: INK, a: prog(t, s5.ajo, s5.ajo + 0.3) });
          const hk = prog(t, s5.tre - 0.2, s5.tre + 0.2); if (hk > 0) { ga((1 - sw) * hk); waterBand(140, 440, 200, 1); handDrink(300, 200, BLUE);
            txt('MÃO À BOCA', 290, -230, 46, { w: 900, color: BLUE }); txt('300', 290, -140, 100, { w: 900, color: BLUE }); ga(1 - sw); }
          ctx.fillStyle = INK; ctx.fillRect(98, -300, 4, 540);
          txt('Juízes 7:5-6', 0, 330, 30, { w: 700, color: MUTE }); endPanel(); } ga(1); }
      if (sw > 0) { ga(sw); grid(t, { c: 0, b: 1 - sm(t, s5.mao, s5.fic), hl: sm(t, s5.mao, s5.fic) }); counter(lerp(10000, 300, sm(t, s5.mao, s5.fic, outC)), 1, RED);
        if (t > s5.fic - 0.3) stamp('SÓ ESSES FICAM', 540, 1450, prog(t, s5.fic - 0.3, s5.fic), { size: 60 }); ga(1); }
    }
    function scene6(t) {
      const bk = sm(t, s6.cen - 0.3, s6.cin + 0.3, outC);
      txt('300', 260, 380, 110, { w: 900, color: BLUE, scale: outBack(prog(t, B[5], B[5] + 0.3)) }); txt('×', 470, 380, 80, { w: 900, color: MUTE, a: bk });
      if (bk > 0) { txt(fmt(lerp(0, 135000, bk)), 750, 380, 104, { w: 900, color: RED }); txt('Juízes 8:10', 750, 455, 28, { w: 700, color: MUTE, a: bk }); }
      // massa vermelha e o pequeno bloco azul
      const bw = BIG.width, bh = BIG.height, x0 = 540 - bw / 2, y0 = 540; ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, bw, bh * bk); ctx.clip(); ctx.drawImage(BIG, x0, y0); ctx.restore();
      ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(x0 - 6, y0 - 6, bw + 12, bh + 12);
      ctx.fillStyle = '#f7eed6'; ctx.fillRect(x0 + 10, y0 + bh - 100, 220, 90); ctx.lineWidth = 3; ctx.strokeStyle = BLUE; ctx.strokeRect(x0 + 10, y0 + bh - 100, 220, 90); ctx.fillStyle = BLUE; for (let i = 0; i < 300; i++) ctx.fillRect(x0 + 20 + (i % 30) * 6.8, y0 + bh - 90 + Math.floor(i / 30) * 7, 4, 4);
      txt('← os 300', x0 + 320, y0 + bh - 55, 36, { w: 900, color: BLUE, stroke: 8 });
      if (t > s6.qua - 0.3) stamp('450 PARA 1', 540, 1290, prog(t, s6.qua - 0.3, s6.qua), { size: 100 });
    }
    function scene7(t) {
      plaque('AS ARMAS (7:16)', 540, 360, 50, prog(t, B[6], B[6] + 0.3));
      if (panel(prog(t, B[6] + 0.1, B[6] + 0.4), 900, 700)) {
        const hk = outBack(prog(t, s7.tro - 0.2, s7.tro + 0.2)), jk = outBack(prog(t, s7.jar - 0.2, s7.jar + 0.2)), tk = outBack(prog(t, s7.toc - 0.2, s7.toc + 0.2)), ek = sm(t, s7.esc, s7.esc + 0.6);
        if (hk > 0) { horn(-300, 0, 1.4 * hk); txt('TROMBETA', -300, 200, 40, { w: 900, a: hk }); }
        if (jk > 0) { jar(0, 20, 1.5 * jk); txt('JARRO VAZIO', 0, 200, 40, { w: 900, a: jk }); }
        if (tk > 0) { const tx = lerp(300, 0, ek), ty = lerp(30, -30, ek); torch(tx, ty, 1.2 * tk, 1 - ek * 0.85); if (ek > 0.5) { jar(0, 20, 1.5); glowDot(0, -80, 40, 0.5 * ek); } txt(ek > 0.5 ? 'TOCHA DENTRO' : 'TOCHA', lerp(300, 0, ek), 250, 40, { w: 900, color: RED, a: tk }); }
        endPanel(); }
    }
    function nightCam(t) { return { s: Math.exp(lerp(Math.log(FULL.s), Math.log(CAMP.s), sm(t, B[7], B[7] + 1.2))), cx: lerp(FULL.cx, CAMP.cx, sm(t, B[7], B[7] + 1.2)), cy: lerp(FULL.cy, CAMP.cy, sm(t, B[7], B[7] + 1.2)) }; }
    function ring300(cam, t, k, fire, horns) { const [cx, cy] = ll(cam, P.mid[0], P.mid[1]); ctx.save(); clipMap();
      for (let g = 0; g < 3; g++) for (let i = 0; i < 34; i++) { const e = prog(k, (g * 34 + i) / 110, (g * 34 + i) / 110 + 0.1); if (e <= 0) continue; const a = (g / 3) * TAU + (i / 34) * (TAU / 3 - 0.25) - 1.2, r = 330 + (i % 3) * 14, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.62;
        if (fire > 0) glowDot(x, y, 14, fire * (0.8 + 0.2 * Math.sin(t * 20 + i))); ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fillStyle = fire > 0 ? '#ffd27a' : '#cfe0ff'; ctx.fill(); }
      if (horns > 0) for (let g = 0; g < 3; g++) { const a = (g / 3) * TAU - 1.2 + 0.9, x = cx + Math.cos(a) * 330, y = cy + Math.sin(a) * 330 * 0.62; for (let r = 0; r < 3; r++) { const ph = ((t * 1.6 + r / 3) % 1); ctx.beginPath(); ctx.arc(x, y, 20 + ph * 90, 0, TAU); ctx.strokeStyle = `rgba(255,230,160,${(1 - ph) * 0.7 * horns})`; ctx.lineWidth = 4; ctx.stroke(); } }
      ctx.restore(); }
    function scene8(t) {
      const cam = nightCam(t), nk = sm(t, B[7], B[7] + 1.0); drawMap(cam, { night: nk }); midian(cam, 1);
      const fire = sm(t, s8.toc - 0.3, s8.toc + 0.2); ring300(cam, t, sm(t, s8.gru - 0.2, s8.cer + 0.6, lin), fire, sm(t, s8.tro - 0.1, s8.tro + 0.3));
      if (t > s8.que - 0.05 && t < s8.que + 0.25) { ga(0.25); ctx.fillStyle = '#fff3d0'; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); ga(1); }
      frame();
      if (t > s8.gru - 0.3) plaque('3 GRUPOS DE 100 (7:16)', 540, 360, 44, prog(t, s8.gru - 0.3, s8.gru), { col: BLUE });
      else plaque('MEIA-NOITE (7:19)', 540, 360, 50, prog(t, B[7], B[7] + 0.3));
      if (t > s8.que - 0.2) stamp('QUEBRAM OS JARROS', 540, 1250, prog(t, s8.que - 0.2, s8.que), { size: 64 });
    }
    function scene9(t) {
      const cam = CAMP; drawMap(cam, { night: 1 }); const fl = sm(t, s9.esp - 0.2, s9.fog + 0.8);
      midian(cam, 1, { flee: fl, fire: 0 }); ring300(cam, t, 1, 1, 0);
      if (t > s9.esp - 0.2) { const k = outBack(prog(t, s9.esp - 0.2, s9.esp + 0.2)); const [x, y] = ll(cam, P.mid[0], P.mid[1]); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.strokeStyle = '#f7eed6'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-60, -60); ctx.lineTo(60, 60); ctx.moveTo(60, -60); ctx.lineTo(-60, 60); ctx.stroke(); ctx.strokeStyle = RED; ctx.lineWidth = 8; ctx.stroke(); ctx.restore(); }
      if (t > s9.fog - 0.2) { const [x, y] = ll(cam, 35.32, 32.625); arrowHead(x + 60 * fl, y, 0, RED, 2.2); }
      frame();
      if (t > s9.esp - 0.3) plaque('UM CONTRA O OUTRO (7:22)', 540, 360, 44, prog(t, s9.esp - 0.3, s9.esp), { col: RED });
      else plaque('NINGUÉM SAI DO LUGAR (7:21)', 540, 360, 42, prog(t, B[8], B[8] + 0.3), { col: BLUE });
      if (t > s9.fog - 0.2) stamp('FOGEM', 540, 1250, prog(t, s9.fog - 0.2, s9.fog + 0.1), { size: 90 });
    }
    function scene10(t) {
      plaque('POR QUE TÃO POUCOS?', 540, 360, 56, prog(t, s10.por - 0.3, s10.por), { col: RED });
      if (panel(prog(t, s10.exp - 0.3, s10.exp), 900, 620)) {
        const a = prog(t, s10.isr - 0.4, s10.isr);
        txt('"Para que Israel não se glorie', 0, -170, 46, { w: 800, it: true, a });
        txt('contra mim, dizendo:', 0, -100, 46, { w: 800, it: true, a });
        txt('A minha própria mão', 0, 10, 62, { w: 900, color: RED, a: prog(t, s10.isr, s10.liv - 0.3) });
        txt('me livrou."', 0, 90, 62, { w: 900, color: RED, a: prog(t, s10.isr, s10.liv - 0.3) });
        txt('JUÍZES 7:2', 0, 210, 40, { w: 900, color: MUTE, a }); endPanel(); }
    }
    function scene11(t) {
      if (t > s11.sol - 0.5) plaque('AMANHÃ: O DIA EM QUE O SOL PAROU', 540, 360, 34, prog(t, s11.sol - 0.5, s11.sol), { col: BLUE });
      else plaque('VOCÊ SABIA DESSA?', 540, 360, 52, prog(t, B[10], B[10] + 0.3), { col: RED });
      const ck = outBack(prog(t, s11.com - 0.3, s11.com + 0.1));
      if (ck > 0) for (const [x, s, c] of [[290, 'EU SABIA', GREEN], [790, 'NÃO SABIA', RED]]) { ctx.save(); ctx.translate(x, 800); ctx.scale(ck, ck); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-220, -80, 440, 160); ctx.lineWidth = 7; ctx.strokeStyle = c; ctx.strokeRect(-220, -80, 440, 160); txt(s, 0, 4, 60, { w: 900, color: c }); ctx.restore(); }
      if (ck > 0) txt('comenta aqui embaixo', 540, 940, 36, { w: 800, color: MUTE, a: ck });
      txt('300', 540, 1170, 220, { w: 900, color: INK, a: 0.12 });
      const bk = sm(t, s11.seg - 0.3, s11.seg + 0.1, outBack), press = t > s11.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1420); const pr = bk * (1 - 0.06 * pulse(t, s11.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RED; ctx.fillRect(-200, -46, 400, 92); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-200, -46, 400, 92); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 46, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
    }
    // ---------------- legendas ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 60, words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 16, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), bw = total + 60, bh = size * 1.6, pop = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15));
      ctx.save(); ctx.translate(540, 1610); ctx.scale(pop, pop); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; if (cur) { ctx.fillStyle = '#e8c56a'; ctx.fillRect(x - 6, -size * 0.6, ws[i] + 12, size * 1.2); } txt(words[i], x + ws[i] / 2, 3, size, { w: 900 }); x += ws[i] + sp; }); ctx.restore(); }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.drawImage(tex, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      header(); ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t); txt('Locais: identificação tradicional aproximada.', 540, 1780, 22, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
