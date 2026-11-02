/*
 * A TRAVESSIA DO JORDÃO E A QUEDA DE JERICÓ (Josué 3 – 6). Mapa em pergaminho, 9:16 (perfil cristão).
 * Contornos: Natural Earth 10m (assets/regiao.json via pipeline/geo_regiao.py, projeção lon*cos(lat_ref), -lat).
 * Locais tradicionais aproximados (Sitim = Tell el-Hammam; Adã = Tell ed-Damiyeh; Gilgal: a leste de Jericó, debatido).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const GEO = (typeof require === 'function') ? require('../assets/regiao.json') : null;
  const W = 1080, H = 1920, TAU = Math.PI * 2, K = Math.cos((GEO ? GEO.lat_ref : 31.9) * Math.PI / 180);
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

  const C = { // lon, lat (localizações tradicionais, aproximadas)
    'Sitim': [35.67, 31.84], 'Vau': [35.545, 31.85], 'Gilgal': [35.49, 31.865], 'Jericó': [35.444, 31.871], 'Adã': [35.555, 32.105],
    's1': [35.62, 31.845],
  };
  const P = n => [C[n][0] * K, -C[n][1]];
  const mkRoute = r => { const segs = []; let tot = 0; for (let i = 1; i < r.length; i++) { const a = P(r[i - 1]), b = P(r[i]), len = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, len, s0: tot }); tot += len; } return { segs, tot }; };
  const R1 = mkRoute(['Sitim', 's1', 'Vau']);
  const R2 = mkRoute(['Sitim', 's1', 'Vau', 'Gilgal']);
  const REG = [['CANAÃ', 35.18, 32.12, 40], ['MOABE', 35.85, 31.55, 30], ['MAR MORTO', 35.5, 31.5, 28], ['RIO JORDÃO', 35.7, 32.35, 24]];

  function create(TL, env) {
    const mk = env.createCanvas, G = env.geo || GEO;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 7;
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
    const FULL = box(34.75, 36.25, 31.3, 32.75);
    const CITY = box(35.33, 35.555, 31.76, 31.94);
    const CAMS = [box(35.05, 35.95, 31.55, 32.3), box(35.3, 35.85, 31.62, 32.12), box(35.3, 35.82, 31.7, 32.22), box(35.36, 35.72, 31.72, 32.02), CITY, CITY, FULL];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i], B[i] + 1.0); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const ll = (cam, lo, la) => toS(cam, [lo * K, -la]);
    const inRect = (x, y, m = 0) => x > RECT[0] + m && x < RECT[0] + RECT[2] - m && y > RECT[1] + m && y < RECT[1] + RECT[3] - m;
    function clipMap() { ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); }
    // trecho do Jordão entre o mar Morto e Adã (para secar)
    const JORDAN = G.rivers.filter(r => r.length > 50)[0] || [];
    const lowJ = JORDAN.filter(([x, y]) => -y < 32.12).sort((a, b) => b[1] - a[1]); // de baixo (sul) para cima
    function drawMap(cam, o = {}) {
      ctx.save(); clipMap();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      ctx.beginPath(); for (const r of G.land) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
      ctx.fillStyle = LAND; ctx.fill('nonzero'); ctx.lineWidth = 2.2 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.beginPath(); for (const r of G.lakes) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } ctx.fillStyle = SEA; ctx.fill(); ctx.lineWidth = 1.5 / cam.s; ctx.stroke();
      // rio (mais grosso quando transborda)
      const wRiver = (o.flood ? lerp(9, 22, o.flood) : 9) / cam.s;
      ctx.strokeStyle = RIVER; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = wRiver; for (const r of G.rivers) { ctx.beginPath(); r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
      // leito seco: do sul até Adã, conforme o.dry (0..1)
      if (o.dry > 0 && lowJ.length > 1) { const n = Math.max(2, Math.floor(lowJ.length * o.dry)); ctx.beginPath(); for (let i = lowJ.length - n; i < lowJ.length; i++) { const [x, y] = lowJ[lowJ.length - 1 - (i - (lowJ.length - n))]; i === lowJ.length - n ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = DRY; ctx.lineWidth = wRiver + 4 / cam.s; ctx.stroke(); ctx.setLineDash([6 / cam.s, 8 / cam.s]); ctx.strokeStyle = '#a88a52'; ctx.lineWidth = 2 / cam.s; ctx.stroke(); ctx.setLineDash([]); }
      ctx.restore();
      for (const [n, lo, la, sz] of REG) { const [x, y] = ll(cam, lo, la); const sea = n.startsWith('MAR') || n.startsWith('RIO'); if (inRect(x, y, 90)) txt(n, x, y, sz, { w: 800, it: sea, color: sea ? '#3f6a86' : n === 'CANAÃ' ? GREEN : MUTE, a: 0.85, rot: n.startsWith('RIO') ? -1.45 : 0 }); }
      ctx.restore();
    }
    function frame() { ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
    function drawRoute(cam, rt, d, o = {}) {
      let hd = null; ctx.save(); clipMap(); ga(o.a ?? 1);
      for (const sg of rt.segs) {
        if (d <= sg.s0) break; const u = clamp((d - sg.s0) / sg.len), a = toS(cam, sg.a), b = toS(cam, sg.b);
        const hx = lerp(a[0], b[0], u), hy = lerp(a[1], b[1], u);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(hx, hy); ctx.lineWidth = o.w || 8; ctx.strokeStyle = o.col || RED; ctx.lineCap = 'round'; ctx.setLineDash(o.dash || []); ctx.stroke(); ctx.setLineDash([]);
        hd = { x: hx, y: hy, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
      }
      ga(1); ctx.restore(); return hd;
    }
    function posAt(cam, rt, d) { d = clamp(d, 0, rt.tot); for (const sg of rt.segs) if (d <= sg.s0 + sg.len + 1e-9) { const u = clamp((d - sg.s0) / sg.len), a = toS(cam, sg.a), b = toS(cam, sg.b); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.atan2(b[1] - a[1], b[0] - a[0])]; } const sg = rt.segs[rt.segs.length - 1]; return [...toS(cam, sg.b), 0]; }
    function crowd(cam, rt, d, t, o = {}) {
      const n = o.n || 80;
      for (let i = 0; i < n; i++) { const r1 = ((i * 7919) % 997) / 997, r2 = ((i * 104729) % 991) / 991; const dd = d - r1 * (o.px || 130) / cam.s; if (dd < 0) continue; const [x, y, ang] = posAt(cam, rt, dd); const off = (r2 - 0.5) * (o.wid || 44) + Math.sin(t * 3 + i) * 2; const px = x - Math.sin(ang) * off, py = y + Math.cos(ang) * off; if (!inRect(px, py)) continue; ctx.beginPath(); ctx.arc(px, py, o.r || 4.4, 0, TAU); ctx.fillStyle = o.col || (i % 5 === 0 ? '#7a3b1f' : '#4a3424'); ctx.fill(); }
    }
    function head(cam, rt, d, col = RED) { const [x, y] = posAt(cam, rt, d); ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke(); }
    function place(cam, n, k, o = {}) { if (k <= 0) return; const [x, y] = toS(cam, P(n)); if (!inRect(x, y)) return; const r = (o.big ? 12 : 9) * outBack(k); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); if (o.label !== false) { const [dx, dy] = o.off || [0, -32]; txt((o.name || n).toUpperCase(), x + dx, y + dy, o.size || 30, { w: 900, color: o.col || INK, stroke: 8, a: clamp(k * 2), align: o.align }); } }
    function tents(x, y, k) { if (k <= 0) return; ctx.save(); ga(k); for (let i = 0; i < 7; i++) { const tx = x + ((i * 53) % 110) - 55, ty = y + ((i * 37) % 50) - 10; ctx.beginPath(); ctx.moveTo(tx - 13, ty + 9); ctx.lineTo(tx, ty - 11); ctx.lineTo(tx + 13, ty + 9); ctx.closePath(); ctx.fillStyle = '#d9c39a'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke(); } ctx.restore(); ga(1); }
    // cidade murada (vista de cima, ícone): raio r; fall = 0..1 (muralha caindo)
    function city(x, y, r, k, fall = 0, t = 0) {
      if (k <= 0) return; const s = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      // casinhas dentro
      for (let i = 0; i < 14; i++) { const a = i * 2.39996, rr = r * 0.62 * Math.sqrt((i + 0.5) / 14), hx = Math.cos(a) * rr, hy = Math.sin(a) * rr, hs = r * 0.11; ctx.fillStyle = i % 3 ? '#d6bd8e' : '#c7a874'; ctx.fillRect(hx - hs, hy - hs, hs * 2, hs * 2); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.strokeRect(hx - hs, hy - hs, hs * 2, hs * 2); }
      // muralha em 16 blocos
      const NB = 16; for (let i = 0; i < NB; i++) { const a0 = i / NB * TAU + 0.03, a1 = (i + 1) / NB * TAU - 0.03, am = (a0 + a1) / 2;
        const f = clamp(fall * 1.6 - ((i * 7) % NB) / NB * 0.6), out = f * r * 0.28, rot = f * ((i % 2) ? 0.5 : -0.5);
        ctx.save(); ctx.translate(Math.cos(am) * out, Math.sin(am) * out); ctx.rotate(rot * 0.3);
        ctx.beginPath(); ctx.arc(0, 0, r, a0, a1); ctx.arc(0, 0, r * 0.86, a1, a0, true); ctx.closePath();
        ctx.fillStyle = f > 0.5 ? '#9a8158' : '#b8a07a'; ctx.globalAlpha = 1 - f * 0.35; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
        if (i % 4 === 0 && fall < 0.3) { const tx = Math.cos(am) * r * 0.93, ty = Math.sin(am) * r * 0.93; ctx.fillStyle = '#a58d66'; ctx.fillRect(tx - r * 0.09, ty - r * 0.09, r * 0.18, r * 0.18); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeRect(tx - r * 0.09, ty - r * 0.09, r * 0.18, r * 0.18); } }
      // poeira
      if (fall > 0) { for (let i = 0; i < 40; i++) { const a = i * 0.7, d = r * (0.9 + 0.5 * fall + ((i * 13) % 7) * 0.05), sz = r * 0.07 * (1 - fall * 0.5) * (1 + (i % 3)); ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, sz, 0, TAU); ctx.fillStyle = `rgba(160,130,90,${0.35 * (1 - clamp(fall - 0.5) * 1.6)})`; ctx.fill(); } }
      ctx.restore(); ga(1);
    }
    // procissão em volta da cidade: arca dourada à frente, sacerdotes e povo
    function procession(x, y, R, ang, n, a = 1) {
      ctx.save(); ga(a);
      for (let i = n - 1; i >= 0; i--) { const aa = ang - i * 0.075, px = x + Math.cos(aa) * R, py = y + Math.sin(aa) * R * 0.92;
        if (i === 0) { ctx.save(); ctx.translate(px, py); ctx.rotate(aa + Math.PI / 2); ctx.fillStyle = GOLD; ctx.fillRect(-14, -9, 28, 18); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeRect(-14, -9, 28, 18); ctx.restore(); }
        else { ctx.beginPath(); ctx.arc(px, py, i <= 7 ? 7 : 5.5, 0, TAU); ctx.fillStyle = i <= 7 ? '#f2ead8' : (i % 5 ? '#4a3424' : '#7a3b1f'); ctx.fill(); if (i <= 7) { ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke(); } } }
      ctx.restore(); ga(1);
    }
    function ark(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#6b4a2b'; ctx.fillRect(-60, -4, 120, 7); ctx.fillStyle = GOLD; ctx.fillRect(-34, -26, 68, 40); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeRect(-34, -26, 68, 40); ctx.fillStyle = '#e2b84a'; ctx.fillRect(-36, -32, 72, 8); ctx.strokeRect(-36, -32, 72, 8); ctx.restore(); }
    function shofar(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-30, 8); ctx.quadraticCurveTo(0, 14, 22, -6); ctx.lineTo(32, -22); ctx.lineTo(40, -14); ctx.quadraticCurveTo(10, 24, -30, 16); ctx.closePath(); ctx.fillStyle = '#e8d6ae'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    function stone(x, y, r, i) { ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, rr = r * (0.85 + 0.15 * Math.sin(i * 3.1 + k * 1.7)); k ? ctx.lineTo(x + Math.cos(a) * rr * 1.15, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr * 1.15, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = i % 2 ? '#a9a39a' : '#bdb6aa'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
    function header() { spaced('A TRAVESSIA DO JORDÃO', 540, 140, 50, { sp: 9 }); txt('e a queda de Jericó  •  Josué 3 – 6', 540, 210, 30, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(200, 245, 680, 3); }
    function panel(k, fill) { if (k <= 0) return null; const s = outBack(k); ctx.save(); ctx.translate(540, 1240); ctx.scale(s, s); ga(clamp(k * 3)); ctx.fillStyle = fill || 'rgba(247,238,214,0.97)'; ctx.fillRect(-470, -150, 940, 300); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-470, -150, 940, 300); ctx.strokeRect(-460, -140, 920, 280); return true; }
    const endPanel = () => { ctx.restore(); ga(1); };
    function arrowHead(x, y, ang, col, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, -13); ctx.lineTo(-12, 13); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    function jericho(cam, k = 1, r = 34, fall = 0, t = 0, lab = true) { const [x, y] = toS(cam, P('Jericó')); if (!inRect(x, y, -r)) return; city(x, y, r, k, fall, t); if (lab && k > 0) txt('JERICÓ', x - r - 14, y, Math.max(26, Math.min(34, r * 0.6)), { w: 900, color: RED, stroke: 8, a: clamp(k * 2), align: 'right' }); }

    // ---------------- tempos ----------------
    const s1 = { tre: wt('c1', 'treze'), gri: wt('c1', 'grito'), cai: wt('c1', 'caiu'), jer: wt('c1', 'jerico'), ant: wt('c1', 'antes'), rio: wt('c1', 'rio'), par: wt('c1', 'parou') };
    const s2 = { sai: wt('c2', 'sai'), sit: wt('c2', 'sitim'), che: wt('c2', 'chega'), jor: wt('c2', 'jordao'), tra: wt('c2', 'transbordando'), col: wt('c2', 'colheita') };
    const s3 = { sac: wt('c3', 'sacerdotes'), agu: wt('c3', 'agua'), arc: wt('c3', 'arca'), par: wt('c3', 'param'), mon: wt('c3', 'montao'), lon: wt('c3', 'longe'), ada: wt('c3', 'ada') };
    const s4 = { atr: wt('c4', 'atravessa'), sec: wt('c4', 'seco'), jer: wt('c4', 'jerico'), doz: wt('c4', 'doze'), ped: wt('c4', 'pedras'), tri: wt('c4', 'tribo'), mem: wt('c4', 'memorial'), gil: wt('c4', 'gilgal') };
    const s5 = { jer: wt('c5', 'jerico'), ord: wt('c5', 'ordem'), uma: wt('c5', 'volta'), dia: wt('c5', 'dia'), sei: wt('c5', 'seis'), set: wt('c5', 'sete'), tro: wt('c5', 'trombetas') };
    const s6 = { set1: wt('c6', 'setimo'), set2: wt('c6', 'sete'), vol: wt('c6', 'voltas'), tro: wt('c6', 'trombeta'), gri: wt('c6', 'grita'), mur: wt('c6', 'muralha'), cai: wt('c6', 'cai') };
    const s7 = { qua: wt('c7', 'qual'), com: wt('c7', 'comenta'), seg: wt('c7', 'segue'), doz: wt('c7', 'doze'), tri: wt('c7', 'tribos') };

    cue(0, 'music', { part: 'intro' }); cue(s1.tre - 0.1, 'stamp'); cue(s1.gri, 'impact', { gain: 0.6 }); cue(s1.rio, 'water', { dur: 1.2, gain: 0.6 }); cue(s1.par, 'reveal'); cue(B[1], 'music', { part: 'safe' });
    cue(s2.sai, 'wind', { dur: 1.2, gain: 0.5 }); cue(s2.jor, 'pop', { gain: 0.5 }); cue(s2.tra, 'water', { dur: 1.6 }); cue(s2.col, 'ding');
    cue(s3.sac, 'reveal'); cue(s3.agu, 'water', { dur: 1.0, gain: 0.6 }); cue(s3.par, 'riser', { dur: 0.8 }); cue(s3.mon, 'impact', { gain: 0.5 }); cue(s3.ada, 'pop', { gain: 0.5 });
    cue(s4.atr, 'wind', { dur: 1.5, gain: 0.5 }); cue(s4.sec, 'success'); for (let i = 0; i < 12; i++) cue(s4.doz + i * Math.max(0.08, (s4.tri - s4.doz) / 12), 'pop', { gain: 0.35 }); cue(s4.mem, 'stamp');
    cue(s5.ord, 'reveal'); cue(s5.dia, 'tick', { dur: Math.max(0.5, s5.set - 0.2 - s5.dia) }); cue(s5.tro, 'bell', { gain: 0.5 });
    cue(s6.set1, 'stamp'); cue(s6.vol, 'whoosh', { dur: 0.8 }); cue(s6.tro, 'tada'); cue(s6.gri, 'impact', { gain: 0.7 }); cue(s6.cai, 'impact'); cue(s6.cai + 0.1, 'crack'); cue(B[6], 'music', { part: 'outro' });
    cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });

    // ---------------- cenas ----------------
    function scene1(t, cam) {
      const flood = 0, dry = prog(t, s1.par - 0.1, s1.par + 0.8);
      drawMap(cam, { dry });
      const fall = prog(t, s1.cai - 0.1, s1.cai + 0.8) * (1 - prog(t, s1.ant - 0.2, s1.ant + 0.3));
      jericho(cam, sm(t, 0.1, 0.5), 46, fall);
      // 13 voltas em volta da cidade
      const lk = prog(t, s1.tre - 0.1, s1.gri); if (lk > 0 && t < s1.ant) { const [x, y] = toS(cam, P('Jericó')); ctx.save(); ctx.beginPath(); const N = Math.floor(13 * 60 * lk); for (let i = 0; i <= N; i++) { const a = i / 60 * TAU - Math.PI / 2, r = 70 + i / 60 * 4.5; i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(178,58,46,0.8)'; ctx.stroke(); ctx.restore(); }
      // rio: destaque
      const rk = prog(t, s1.rio - 0.2, s1.rio + 0.3); if (rk > 0) { const [x, y] = ll(cam, 35.555, 31.9); txt('RIO JORDÃO', x + 30, y - 30, 30, { w: 900, color: BLUE, stroke: 8, a: rk, align: 'left' }); }
      frame();
      const qk = sm(t, s1.tre - 0.25, s1.tre + 0.1, outBack), sw = prog(t, s1.ant - 0.2, s1.ant + 0.1);
      if (qk > 0 && sw < 1) { txt('13 VOLTAS', 540, 325, 108, { w: 900, color: RED, scale: qk * (1 - sw) }); txt('E UM GRITO', 540, 405, 38, { w: 900, color: INK, a: prog(t, s1.gri - 0.1, s1.gri + 0.2) * (1 - sw) }); }
      if (t > s1.ant) plaque('MAS ANTES, UM RIO PAROU', 540, 360, 40, prog(t, s1.ant, s1.ant + 0.3), { col: BLUE });
    }
    function scene2(t, cam) {
      const flood = prog(t, s2.tra - 0.3, s2.tra + 0.6);
      drawMap(cam, { flood });
      const [sx, sy] = toS(cam, P('Sitim')); tents(sx + 10, sy + 40, prog(t, B[1] + 0.2, B[1] + 0.6));
      place(cam, 'Sitim', prog(t, s2.sit - 0.2, s2.sit + 0.2), { big: true, off: [0, -34] });
      jericho(cam, 1, 34);
      const d = R1.tot * inOut(prog(t, s2.sai, s2.jor + 0.2)); if (d > 0) { drawRoute(cam, R1, d, { w: 6, dash: [14, 10] }); crowd(cam, R1, d, t, { n: 90 }); head(cam, R1, d); }
      if (flood > 0) { const [x, y] = ll(cam, 35.56, 31.98); for (let i = 0; i < 3; i++) { const yy = y + i * 70 - 70, ph = t * 5 + i; ctx.save(); ga(flood); ctx.beginPath(); for (let k = -30; k <= 30; k += 5) ctx.lineTo(x + 40 + k, yy + Math.sin(ph + k * 0.2) * 5); ctx.lineWidth = 4; ctx.strokeStyle = RIVER; ctx.stroke(); ctx.restore(); ga(1); } }
      frame();
      if (t > s2.col - 0.3) plaque('TEMPO DE COLHEITA (Js 3:15)', 540, 360, 36, prog(t, s2.col - 0.3, s2.col), { col: GREEN });
      else if (t > s2.tra - 0.3) plaque('O RIO TRANSBORDANDO', 540, 360, 40, prog(t, s2.tra - 0.3, s2.tra), { col: BLUE });
      else if (t > s2.jor - 0.3) plaque('ATÉ O JORDÃO', 540, 360, 42, prog(t, s2.jor - 0.3, s2.jor), { col: BLUE });
      else plaque('SAINDO DE SITIM', 540, 360, 42, prog(t, B[1], B[1] + 0.3));
    }
    function scene3(t, cam) {
      const dry = prog(t, s3.par - 0.1, s3.ada + 0.3);
      drawMap(cam, { flood: 1 - prog(t, s3.par - 0.2, s3.par + 0.4), dry });
      place(cam, 'Sitim', 1, { off: [0, -30], size: 26 }); jericho(cam, 1, 30);
      drawRoute(cam, R1, R1.tot, { w: 6, dash: [14, 10] }); crowd(cam, R1, R1.tot, t, { n: 90 });
      // arca entrando na água
      const ak = prog(t, s3.sac - 0.3, s3.sac + 0.2); if (ak > 0) { const [x, y] = toS(cam, P('Vau')); const into = sm(t, s3.agu - 0.3, s3.agu + 0.3); ctx.save(); ga(ak); ark(x + 30 * (1 - into), y - 26, 0.9); ctx.restore(); ga(1); }
      // montão de água em Adã
      const mk2 = sm(t, s3.mon - 0.3, s3.mon + 0.3, outBack); const [ax, ay] = toS(cam, P('Adã'));
      if (mk2 > 0 && inRect(ax, ay)) { ctx.save(); ctx.translate(ax, ay - 6); ctx.scale(mk2, mk2); ctx.beginPath(); ctx.moveTo(-50, 26); ctx.quadraticCurveTo(-46, -40, 0, -54); ctx.quadraticCurveTo(46, -40, 50, 26); ctx.closePath(); ctx.fillStyle = 'rgba(79,134,176,0.85)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = BLUE; ctx.stroke(); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-30 + i * 6, 10 - i * 18); ctx.quadraticCurveTo(0, 0 - i * 18, 30 - i * 6, 10 - i * 18); ctx.lineWidth = 3; ctx.strokeStyle = '#d8e8f2'; ctx.stroke(); } ctx.restore(); }
      place(cam, 'Adã', prog(t, s3.ada - 0.2, s3.ada + 0.2), { big: true, name: 'cidade de Adã', off: [62, 0], align: 'left', size: 28, col: BLUE }); if (t > s3.ada - 0.2) { /* ajusta rótulo à direita */ }
      if (dry > 0.2) { const [x, y] = ll(cam, 35.6, 31.98); txt('LEITO SECO', x + 20, y, 26, { w: 900, color: '#8a6a32', stroke: 7, a: prog(dry, 0.2, 0.4), align: 'left' }); }
      frame();
      if (t > s3.lon - 0.3) plaque('"MUI LONGE", PERTO DE ADÃ (Js 3:16)', 540, 360, 32, prog(t, s3.lon - 0.3, s3.lon), { col: BLUE });
      else if (t > s3.par - 0.3) plaque('AS ÁGUAS PARAM', 540, 360, 44, prog(t, s3.par - 0.3, s3.par), { col: BLUE });
      else if (t > s3.sac - 0.3) plaque('OS SACERDOTES E A ARCA', 540, 360, 38, prog(t, s3.sac - 0.3, s3.sac), { col: GOLD });
    }
    function scene4(t, cam) {
      drawMap(cam, { dry: 1 });
      jericho(cam, 1, 40);
      const d = R2.tot * lerp(R1.tot / R2.tot, 1, inOut(prog(t, s4.atr - 0.2, s4.jer + 0.3)));
      drawRoute(cam, R2, d, { w: 7 }); crowd(cam, R2, d, t, { n: 110, px: 200 }); head(cam, R2, d);
      const gk = prog(t, s4.gil - 0.3, s4.gil + 0.2); const [gx, gy] = toS(cam, P('Gilgal'));
      if (gk > 0) { for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.save(); ga(gk); stone(gx + Math.cos(a) * 26, gy + 46 + Math.sin(a) * 14, 6, i); ctx.restore(); } ga(1); txt('GILGAL', gx, gy + 86, 28, { w: 900, color: INK, stroke: 8, a: gk }); }
      const pk = prog(t, s4.doz - 0.35, s4.doz) * (1 - prog(t, s4.mem + 0.1, s4.gil)); if (panel(pk)) {
        const n = Math.round(12 * prog(t, s4.doz - 0.1, s4.tri));
        for (let i = 0; i < 12; i++) { if (i >= n) break; const k = outBack(prog(t, s4.doz - 0.1 + i * (s4.tri - s4.doz) / 12, s4.doz + 0.15 + i * (s4.tri - s4.doz) / 12)); ctx.save(); ctx.translate(-385 + i * 70, -20); ctx.scale(k, k); stone(0, 0, 26, i); ctx.restore(); }
        txt(String(n), -260, 90, 56, { w: 900, color: RED }); txt('PEDRAS', -130, 92, 32, { w: 900, color: RED });
        if (t > s4.tri - 0.3) txt('1 POR TRIBO', 180, 92, 34, { w: 900, color: MUTE, a: prog(t, s4.tri - 0.3, s4.tri) });
        endPanel(); }
      frame();
      if (t > s4.mem - 0.3) plaque('MEMORIAL EM GILGAL (Js 4:20)', 540, 360, 36, prog(t, s4.mem - 0.3, s4.mem));
      else if (t > s4.doz - 0.3) plaque('12 PEDRAS DO MEIO DO RIO', 540, 360, 38, prog(t, s4.doz - 0.3, s4.doz));
      else if (t > s4.sec - 0.3) plaque('EM SECO', 540, 360, 48, prog(t, s4.sec - 0.3, s4.sec), { col: GREEN });
    }
    function scene5(t, cam) {
      drawMap(cam, { dry: 1 });
      const [x, y] = toS(cam, P('Jericó'));
      city(x, y, 150, 1);
      // uma volta por dia: a procissão dá a volta a cada "dia"
      const d0 = s5.dia - 0.2, d1 = s5.set - 0.1, days = 6 * prog(t, d0, d1), ang = -Math.PI / 2 + days * TAU;
      const pa = prog(t, s5.ord - 0.4, s5.ord); if (pa > 0) procession(x, y, 215, ang + (t < d0 ? (t - s5.ord) * 0.6 : 0), 46, pa);
      // trilha desta volta
      if (days > 0) { ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, 215, 215 * 0.92, 0, -Math.PI / 2, ang); ctx.lineWidth = 3; ctx.setLineDash([10, 9]); ctx.strokeStyle = 'rgba(178,58,46,0.7)'; ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
      txt('JERICÓ', x, y - 190, 36, { w: 900, color: RED, stroke: 9, a: 1 - prog(t, s5.ord - 0.4, s5.ord) });
      const pk = prog(t, s5.set - 0.35, s5.set); if (panel(pk)) {
        for (let i = 0; i < 7; i++) { const k = outBack(prog(t, s5.set - 0.1 + i * 0.06, s5.set + 0.15 + i * 0.06)); ctx.save(); ctx.translate(-360 + i * 120, -30 + Math.sin(t * 8 + i) * 3 * (t > s5.tro ? 1 : 0)); ctx.scale(k * 1.4, k * 1.4); shofar(0, 0, 1); ctx.restore(); }
        txt('7 SACERDOTES  •  7 TROMBETAS', 0, 90, 38, { w: 900, color: GOLD });
        endPanel(); }
      frame();
      if (t > d0 && t < s5.set - 0.3) { const n = Math.min(6, Math.floor(days) + 1); plaque('DIA ' + n + ' DE 6: 1 VOLTA', 540, 360, 42, prog(t, d0, d0 + 0.25), { col: RED }); }
      else if (t >= s5.set - 0.3) plaque('TROMBETAS DE CHIFRE (Js 6:4)', 540, 360, 36, prog(t, s5.set - 0.3, s5.set), { col: GOLD });
      else if (t > s5.ord - 0.3) plaque('UMA ORDEM ESTRANHA', 540, 360, 42, prog(t, s5.ord - 0.3, s5.ord));
    }
    function scene6(t, cam) {
      drawMap(cam, { dry: 1 });
      const [x, y] = toS(cam, P('Jericó'));
      const fall = prog(t, s6.cai - 0.1, s6.cai + 1.2), sh = pulse(t, s6.cai, 0.05, 0.6) * 10;
      ctx.save(); ctx.translate(Math.sin(t * 70) * sh, Math.cos(t * 63) * sh);
      city(x, y, 150, 1, fall, t);
      // 7 voltas rápidas
      const v0 = s6.set2 - 0.1, v1 = s6.tro - 0.15, laps = 7 * sm(t, v0, v1, x => x), ang = -Math.PI / 2 + laps * TAU;
      procession(x, y, 215, ang, 46, 1 - prog(t, s6.cai + 0.3, s6.cai + 0.8) * 0.4);
      // trombeta: ondas de som
      const wk = t - s6.tro; if (wk > 0 && wk < 2.5) for (let i = 0; i < 3; i++) { const r = 160 + ((wk * 260 + i * 90) % 280); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = `rgba(192,138,30,${0.6 * (1 - (r - 160) / 280)})`; ctx.stroke(); }
      ctx.restore();
      frame();
      if (t > v0 && t < s6.tro - 0.2) { const n = Math.min(7, Math.floor(laps) + 1); plaque('DIA 7: VOLTA ' + n + ' DE 7', 540, 360, 42, prog(t, v0, v0 + 0.25), { col: RED }); }
      if (t > s6.gri - 0.2 && t < s6.cai - 0.1) { const k = sm(t, s6.gri - 0.2, s6.gri + 0.1, outBack); txt('O POVO GRITA!', 540, 360, 64, { w: 900, color: INK, scale: k, rot: -0.04 }); }
      else if (t > s6.tro - 0.2 && t < s6.gri - 0.2) plaque('A TROMBETA TOCA', 540, 360, 44, prog(t, s6.tro - 0.2, s6.tro), { col: GOLD });
      if (t > s6.cai - 0.15) stamp('A MURALHA CAIU', 540, 350, prog(t, s6.cai - 0.15, s6.cai + 0.1), { size: 70 });
      if (t < s6.set2) plaque('NO SÉTIMO DIA', 540, 360, 44, prog(t, B[5], B[5] + 0.3));
    }
    function scene7(t, cam) {
      drawMap(cam, { dry: 1 - prog(t, B[6], B[6] + 1.5) });
      drawRoute(cam, R2, R2.tot, { w: 6 }); place(cam, 'Sitim', 1, { size: 24 }); place(cam, 'Adã', 1, { size: 24, off: [0, -28], col: BLUE });
      jericho(cam, 1, 22, 1);
      // próxima parte: as 12 tribos (marcas espalhadas por Canaã)
      const jk = prog(t, s7.doz - 0.3, s7.tri + 0.4); if (jk > 0) { const pts = [[35.0, 32.55], [35.3, 32.45], [35.65, 32.6], [35.9, 32.3], [35.0, 32.2], [35.25, 32.05], [35.85, 31.95], [35.05, 31.8], [35.25, 31.55], [35.9, 31.6], [35.05, 31.45], [35.4, 32.3]];
        pts.forEach(([lo, la], i) => { const k = outBack(prog(jk, i / 14, i / 14 + 0.25)); if (k <= 0) return; const [x, y] = ll(cam, lo, la); ctx.beginPath(); ctx.arc(x, y, 14 * k, 0, TAU); ctx.fillStyle = BLUE; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#f7eed6'; ctx.stroke(); }); }
      frame();
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1490); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RED; ctx.fillRect(-200, -46, 400, 92); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-200, -46, 400, 92); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 46, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
      if (t > s7.doz - 0.4) plaque('PRÓXIMA PARTE: AS 12 TRIBOS', 540, 360, 34, prog(t, s7.doz - 0.4, s7.doz), { col: BLUE });
      else if (t > s7.qua - 0.3) plaque('QUAL MURALHA PRECISA CAIR?', 540, 360, 36, prog(t, s7.qua - 0.3, s7.qua));
    }

    // ---------------- legendas ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 60, words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 16, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), bw = total + 60, bh = size * 1.6, pop = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15));
      ctx.save(); ctx.translate(540, 1610); ctx.scale(pop, pop); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; if (cur) { ctx.fillStyle = '#e8c56a'; ctx.fillRect(x - 6, -size * 0.6, ws[i] + 12, size * 1.2); } txt(words[i], x + ws[i] / 2, 3, size, { w: 900 }); x += ws[i] + sp; }); ctx.restore(); }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.drawImage(tex, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      header(); ctx.save(); sceneFns[i](t, camAt(t, i)); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t); txt('Rota tradicional aproximada. Sitim, Adã e Gilgal: locais tradicionais.', 540, 1780, 22, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
