/*
 * DAVI E GOLIAS NO VALE DE ELÁ (1 Samuel 17). Mapa em pergaminho, 9:16 (perfil cristão).
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
    const FULL = box(34.78, 35.28, 31.58, 31.85);
    const VALE = box(34.885, 35.055, 31.635, 31.755);
    const CAMS = [FULL, VALE, VALE, FULL, VALE, FULL, FULL];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i], B[i] + 1.0); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const ll = (cam, lo, la) => toS(cam, [lo * K, -la]);
    const inRect = (x, y, m = 0) => x > RECT[0] + m && x < RECT[0] + RECT[2] - m && y > RECT[1] + m && y < RECT[1] + RECT[3] - m;
    function clipMap() { ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); }
    const landPath = () => { ctx.beginPath(); for (const r of G.land) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } };
    // colinas da Sefelá (sombreado ilustrativo)
    const HILLS = []; { let s = 11; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 140; i++) { const lo = 34.85 + R() * 0.55, la = 31.5 + R() * 0.42; HILLS.push([lo, la, 0.003 + R() * 0.006]); } }
    const P = { bel: [35.2025, 31.7054], jer: [35.2316, 31.7767], soc: [34.975, 31.68], aze: [34.937, 31.70], gat: [34.849, 31.70], ecr: [34.851, 31.779], fil: [34.951, 31.677], isr: [34.977, 31.714], gol: [34.962, 31.692] };
    const VALEY = [[35.03, 31.682], [35.0, 31.689], [34.97, 31.693], [34.94, 31.692], [34.91, 31.697], [34.88, 31.705]];
    function drawMap(cam, o = {}) {
      ctx.save(); clipMap();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      landPath(); ctx.fillStyle = LAND; ctx.fill('nonzero');
      ctx.save(); landPath(); ctx.clip('nonzero'); ctx.fillStyle = 'rgba(160,120,60,0.05)'; for (const [lo, la, r] of HILLS) { ctx.beginPath(); ctx.ellipse(lo * K, -la, r * 1.6, r, 0, 0, TAU); ctx.fill(); } ctx.restore();
      // vale de Elá
      const vk = o.vale || 0; if (vk > 0) { ctx.beginPath(); VALEY.forEach(([lo, la], i) => (i ? ctx.lineTo(lo * K, -la) : ctx.moveTo(lo * K, -la))); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = `rgba(95,140,70,${0.45 * vk})`; ctx.lineWidth = 34 / cam.s * (cam.s > 3000 ? 1 : 0.6); ctx.stroke(); ctx.strokeStyle = `rgba(79,134,176,${0.9 * vk})`; ctx.lineWidth = 5 / cam.s; ctx.setLineDash([10 / cam.s, 7 / cam.s]); ctx.stroke(); ctx.setLineDash([]); }
      landPath(); ctx.lineWidth = 2.2 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.beginPath(); for (const r of G.lakes) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } ctx.fillStyle = SEA; ctx.fill(); ctx.lineWidth = 1.5 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.restore();
      { const [x, y] = ll(cam, 34.66, 31.66); if (inRect(x, y, 40)) txt('MAR MEDITERRÂNEO', x, y, 26, { w: 800, it: true, color: '#3f6a86', a: 0.85, rot: -1.05 }); }
      ctx.restore();
    }
    function frame() { ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
    function header() { spaced('DAVI E GOLIAS', 540, 140, 56, { sp: 10 }); txt('no vale de Elá  •  1 Samuel 17', 540, 210, 30, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(200, 245, 680, 3); }
    function arrowHead(x, y, ang, col, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, -13); ctx.lineTo(-12, 13); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    function place(cam, p, name, k, o = {}) { if (k <= 0) return; const [x, y] = ll(cam, p[0], p[1]); if (!inRect(x, y, 10)) return; ctx.save(); ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); const e = outBack(k);
      ctx.beginPath(); ctx.arc(x, y, 12 * e, 0, TAU); ctx.fillStyle = o.col || INK; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke();
      txt(name, x + (o.dx ?? 0), y + (o.dy ?? -36), o.size || 32, { w: 900, color: o.col || INK, stroke: 9, a: clamp(k * 2), align: o.align || 'center' }); ctx.restore(); }
    function tents(cam, p, col, k, label, dy) { if (k <= 0) return; const [x, y] = ll(cam, p[0], p[1]); const sc = cam.s / VALE.s; ctx.save(); clipMap();
      for (let i = 0; i < 7; i++) { const e = outBack(prog(k, i * 0.08, i * 0.08 + 0.4)); if (e <= 0) continue; const tx = x + (i - 3) * 30 * sc, ty = y + (i % 2) * 18 * sc; ctx.save(); ctx.translate(tx, ty); ctx.scale(e * sc, e * sc); ctx.beginPath(); ctx.moveTo(-16, 12); ctx.lineTo(0, -16); ctx.lineTo(16, 12); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
      if (label) txt(label, x, y + dy * sc, 30, { w: 900, color: col, stroke: 9, a: clamp(k * 2) }); ctx.restore(); }
    function route(cam, a, b, k, col, o = {}) { if (k <= 0) return; const A = ll(cam, a[0], a[1]), Bp = ll(cam, b[0], b[1]); const c = [lerp(A[0], Bp[0], 0.5) + (o.bend || 0), lerp(A[1], Bp[1], 0.5) + (o.bendY || 0)];
      const N = 40, n = Math.max(1, Math.floor(N * clamp(k))); const pt = u => [(1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * c[0] + u * u * Bp[0], (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * c[1] + u * u * Bp[1]];
      ctx.save(); clipMap(); ctx.beginPath(); ctx.moveTo(A[0], A[1]); for (let i = 1; i <= n; i++) { const q = pt(i / N); ctx.lineTo(q[0], q[1]); } ctx.lineWidth = o.w || 7; ctx.lineCap = 'round'; ctx.setLineDash(o.dash || [16, 11]); ctx.strokeStyle = col; ctx.stroke(); ctx.setLineDash([]);
      const q1 = pt(n / N), q0 = pt((n - 1) / N); if (o.arrow !== false) arrowHead(q1[0], q1[1], Math.atan2(q1[1] - q0[1], q1[0] - q0[0]), col, 1.3);
      if (o.walker) { ctx.beginPath(); ctx.arc(q1[0], q1[1], 13, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); }
      ctx.restore(); }
    function panel(k, y = 1240, h = 300) { if (k <= 0) return null; const s = outBack(k); ctx.save(); ctx.translate(540, y); ctx.scale(s, s); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.97)'; ctx.fillRect(-470, -h / 2, 940, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-470, -h / 2, 940, h); ctx.strokeRect(-460, -h / 2 + 10, 920, h - 20); return true; }
    const endPanel = () => { ctx.restore(); ga(1); };
    // silhueta simples (sem rosto)
    function man(x, yFeet, hPx, col, lw) { const u = hPx / 10; ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(x, yFeet - 9 * u, 1.0 * u, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, yFeet - 7.9 * u); ctx.lineTo(x, yFeet - 4.6 * u); ctx.moveTo(x - 1.4 * u, yFeet); ctx.lineTo(x, yFeet - 4.6 * u); ctx.lineTo(x + 1.4 * u, yFeet); ctx.moveTo(x - 1.7 * u, yFeet - 4.3 * u); ctx.lineTo(x, yFeet - 7.3 * u); ctx.lineTo(x + 1.7 * u, yFeet - 4.3 * u); ctx.stroke(); ctx.restore(); }
    function stone(x, y, r, col) { ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, r * 1.15, r, 0.3, 0, TAU); ctx.fillStyle = col || '#9a9183'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.35, r * 0.35, r * 0.2, 0.3, 0, TAU); ctx.fill(); ctx.restore(); }

    // ---------------- tempos ----------------
    const s1 = { tre: wt('c1', 'tres'), met: wt('c1', 'metros'), qua: wt('c1', 'quarenta'), dia: wt('c1', 'dias'), exe: wt('c1', 'exercito') };
    const s2 = { sam: wt('c2', 'samuel'), fil: wt('c2', 'filisteus'), soc: wt('c2', 'soco'), aze: wt('c2', 'azeca'), isr: wt('c2', 'israel'), val: wt('c2', 'vale'), ela: wt('c2', 'ela') };
    const s3 = { gol: wt('c3', 'golias'), gat: wt('c3', 'gate'), cou: wt('c3', 'couraca'), cin: wt('c3', 'cinco'), qui: wt('c3', 'quilos'), nin: wt('c3', 'ninguem'), cor: wt('c3', 'coragem') };
    const s4 = { bel: wt('c4', 'belem'), vin: wt('c4', 'vinte'), dav: wt('c4', 'davi'), nov: wt('c4', 'novo'), com: wt('c4', 'comida'), irm: wt('c4', 'irmaos') };
    const s5 = { cin: wt('c5', 'cinco'), ped: wt('c5', 'pedras'), rib: wt('c5', 'ribeiro'), pre: wt('c5', 'precisou'), uma: wt('c5', 'uma'), so: wt('c5', 'so') };
    const s6 = { gol: wt('c6', 'golias'), cai: wt('c6', 'cai'), fug: wt('c6', 'fogem'), gat: wt('c6', 'gate'), ecr: wt('c6', 'ecrom') };
    const s7 = { qua: wt('c7', 'qual'), com: wt('c7', 'comenta'), seg: wt('c7', 'segue'), eli: wt('c7', 'elias') };

    cue(0, 'music', { part: 'intro' }); cue(s1.tre - 0.1, 'stamp'); cue(s1.met, 'impact', { gain: 0.6 }); cue(s1.qua, 'stamp'); cue(B[1], 'music', { part: 'safe' });
    cue(s2.sam, 'pop'); cue(s2.fil, 'pop', { gain: 0.6 }); cue(s2.soc, 'pop', { gain: 0.5 }); cue(s2.aze, 'pop', { gain: 0.5 }); cue(s2.isr, 'pop', { gain: 0.6 }); cue(s2.val, 'water', { dur: 0.9, gain: 0.4 });
    cue(s3.gol, 'impact', { gain: 0.6 }); cue(s3.gat, 'pop'); cue(s3.cin, 'stamp'); cue(s3.nin, 'reveal');
    cue(s4.bel, 'pop'); cue(s4.vin, 'whoosh', { dur: 1.2 }); cue(s4.dav, 'ding', { gain: 0.6 });
    for (let i = 0; i < 5; i++) cue(s5.cin + i * 0.12, 'pop', { gain: 0.45 }); cue(s5.uma, 'stamp'); cue(s5.so, 'impact', { gain: 0.5 });
    cue(s6.cai, 'impact'); cue(s6.fug, 'whoosh', { dur: 1.0 }); cue(s6.gat, 'pop', { gain: 0.6 }); cue(s6.ecr, 'pop', { gain: 0.6 }); cue(B[6], 'music', { part: 'outro' });
    cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });

    const BLUE2 = BLUE, ISR = BLUE, FIL = RED;
    function camps(cam, k1, k2) { tents(cam, P.fil, FIL, k1, 'FILISTEUS', 52); tents(cam, P.isr, ISR, k2, 'ISRAEL', -44); }
    // ---------------- cenas ----------------
    function scene1(t, cam) {
      drawMap(cam, { vale: 1 }); frame();
      ga(0.85 * prog(t, 0.1, 0.4)); ctx.fillStyle = '#f2e6c8'; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); ga(1); frame();
      // régua de altura: 1 m = 150 px
      const base = 1330, m = 150, gk = sm(t, s1.tre - 0.25, s1.met + 0.2, outC);
      ctx.save(); ctx.strokeStyle = MUTE; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); for (let i = 1; i <= 3; i++) { const y = base - i * m; ctx.beginPath(); ctx.moveTo(160, y); ctx.lineTo(920, y); ctx.stroke(); txt(i + ' m', 120, y, 28, { w: 800, color: MUTE }); } ctx.restore();
      ctx.fillStyle = INK; ctx.fillRect(140, base, 800, 5);
      man(380, base, 1.7 * m * prog(t, 0.2, 0.6), INK, 16); txt('1,70 m', 380, base + 50, 34, { w: 900, color: INK, a: prog(t, 0.3, 0.6) });
      if (gk > 0) { man(680, base, 2.9 * m * gk, RED, 24); txt('≈ 2,9 m', 680, base + 50, 40, { w: 900, color: RED, a: gk }); }
      const qk = sm(t, s1.tre - 0.25, s1.tre + 0.1, outBack); if (qk > 0) txt('QUASE 3 METROS', 540, 335, 92, { w: 900, color: RED, scale: qk });
      if (t > s1.qua - 0.3) stamp('40 DIAS DESAFIANDO', 540, 590, prog(t, s1.qua - 0.3, s1.qua), { size: 60 });
      if (t > s1.met) txt('6 côvados e 1 palmo (1Sm 17:4)', 540, 405, 32, { w: 800, color: MUTE, a: prog(t, s1.met, s1.met + 0.3) });
    }
    function scene2(t, cam) {
      drawMap(cam, { vale: Math.max(0.35 * prog(t, B[1] + 0.5, B[1] + 1.0), prog(t, s2.val - 0.2, s2.ela + 0.3)) });
      place(cam, P.soc, 'SOCÓ', prog(t, s2.soc - 0.2, s2.soc + 0.2), { dx: 22, dy: 2, align: 'left' }); place(cam, P.aze, 'AZECA', prog(t, s2.aze - 0.2, s2.aze + 0.2), { dx: -22, dy: 2, align: 'right' });
      camps(cam, prog(t, s2.fil - 0.2, s2.fil + 0.8), prog(t, s2.isr - 0.2, s2.isr + 0.8));
      if (t > s2.val - 0.1) { const [x, y] = ll(cam, 35.015, 31.703); ctx.save(); clipMap(); txt('VALE DE ELÁ', x, y, 34, { w: 900, color: GREEN, stroke: 9, a: prog(t, s2.val - 0.1, s2.ela) }); ctx.restore(); }
      frame();
      if (t > s2.isr - 0.3) plaque('UM MONTE DE CADA LADO (17:3)', 540, 360, 38, prog(t, s2.isr - 0.3, s2.isr), { col: GREEN });
      else plaque('1 SAMUEL 17', 540, 360, 48, prog(t, B[1], B[1] + 0.3));
    }
    function scene3(t, cam) {
      drawMap(cam, { vale: 1 }); place(cam, P.soc, 'SOCÓ', 1, { dx: 22, dy: 2, align: 'left' }); place(cam, P.aze, 'AZECA', 1, { dx: -22, dy: 2, align: 'right' }); camps(cam, 1, 1);
      place(cam, P.gat, 'GATE', prog(t, s3.gat - 0.2, s3.gat + 0.2), { col: RED, dy: -34 });
      // Golias no meio do vale
      const gk = prog(t, s3.gol - 0.2, s3.gol + 0.3); if (gk > 0) { const [x, y] = ll(cam, P.gol[0], P.gol[1]); ctx.save(); clipMap(); const pr = 1 + 0.15 * Math.sin(t * 6); ctx.beginPath(); ctx.arc(x, y, 26 * outBack(gk) * pr, 0, TAU); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#f7eed6'; ctx.stroke(); txt('GOLIAS', x, y + 56, 34, { w: 900, color: RED, stroke: 9, a: gk }); ctx.restore(); }
      frame();
      const pk = prog(t, s3.cou - 0.3, s3.cou) * (1 - prog(t, s3.nin - 0.4, s3.nin - 0.1)); if (panel(pk)) {
        txt('SÓ A COURAÇA (17:5)', 0, -80, 42, { w: 900, color: INK }); txt('5.000 SICLOS', 0, 0, 84, { w: 900, color: RED, a: prog(t, s3.cin - 0.2, s3.cin + 0.1) });
        txt('≈ 57 kg de bronze', 0, 80, 44, { w: 800, color: INK, a: prog(t, s3.qui - 0.5, s3.qui) }); endPanel(); }
      if (t > s3.nin - 0.3) stamp('NINGUÉM TEM CORAGEM', 540, 1240, prog(t, s3.nin - 0.3, s3.nin), { size: 60 });
      if (t > s3.gat - 0.3) plaque('GOLIAS, DE GATE', 540, 360, 48, prog(t, s3.gat - 0.3, s3.gat), { col: RED });
      else plaque('O GIGANTE', 540, 360, 48, prog(t, B[2], B[2] + 0.3), { col: RED });
    }
    function scene4(t, cam) {
      drawMap(cam, { vale: 1 }); camps(cam, 1, 1); place(cam, P.gat, 'GATE', 1, { col: RED, dy: -34 });
      place(cam, P.jer, 'JERUSALÉM', prog(t, B[3] + 0.6, B[3] + 0.9), { col: MUTE, size: 26, dy: -30 });
      place(cam, P.bel, 'BELÉM', prog(t, s4.bel - 0.2, s4.bel + 0.2), { col: BLUE, dy: 42 });
      const rk = sm(t, s4.vin - 0.2, s4.irm + 0.3, lin); route(cam, P.bel, P.isr, rk, BLUE, { bendY: 60, walker: true });
      if (t > s4.vin - 0.2) { const [x, y] = ll(cam, 35.09, 31.72); ctx.save(); clipMap(); txt('≈ 25 km', x, y - 70, 40, { w: 900, color: BLUE, stroke: 10, a: prog(t, s4.vin - 0.2, s4.vin + 0.2) }); txt('em linha reta', x, y - 30, 24, { w: 800, color: MUTE, stroke: 7, a: prog(t, s4.vin - 0.2, s4.vin + 0.2) }); ctx.restore(); }
      frame();
      if (t > s4.dav - 0.3) plaque('DAVI, O MAIS NOVO (17:14)', 540, 360, 42, prog(t, s4.dav - 0.3, s4.dav), { col: BLUE });
      else plaque('DE BELÉM', 540, 360, 48, prog(t, B[3], B[3] + 0.3), { col: BLUE });
    }
    const lin = x => x;
    function scene5(t, cam) {
      drawMap(cam, { vale: 1 }); camps(cam, 1, 1);
      frame();
      const pk = prog(t, s5.cin - 0.4, s5.cin); if (panel(pk, 1150, 420)) {
        const one = prog(t, s5.pre - 0.1, s5.pre + 0.3);
        for (let i = 0; i < 5; i++) { const e = outBack(prog(t, s5.cin + i * 0.12 - 0.1, s5.cin + i * 0.12 + 0.2)); if (e <= 0) continue; const x = -320 + i * 160; ctx.save(); ga(i === 2 ? 1 : 1 - 0.75 * one); ctx.translate(x, -40); ctx.scale(e * (i === 2 ? 1 + 0.35 * one : 1), e * (i === 2 ? 1 + 0.35 * one : 1)); stone(0, 0, 46, i === 2 && one > 0 ? '#8d8576' : undefined); if (i === 2 && one > 0) { ctx.lineWidth = 7; ctx.strokeStyle = RED; ctx.beginPath(); ctx.arc(0, 0, 70, 0, TAU * one); ctx.stroke(); } ctx.restore(); ga(1); }
        txt('5 PEDRAS LISAS DO RIBEIRO (17:40)', 0, 110, 36, { w: 900, color: INK, a: prog(t, s5.ped - 0.2, s5.ped + 0.2) }); endPanel(); }
      if (t > s5.pre - 0.3) stamp('PRECISOU DE 1', 540, 360, prog(t, s5.pre - 0.3, s5.uma), { size: 68 });
      else plaque('5 PEDRAS', 540, 360, 52, prog(t, B[4], B[4] + 0.3));
    }
    function scene6(t, cam) {
      drawMap(cam, { vale: 1 }); tents(cam, P.isr, ISR, 1, null, -44);
      tents(cam, P.fil, FIL, 1 - prog(t, s6.fug, s6.fug + 0.6), null, 0);
      place(cam, P.gat, 'GATE', 1, { col: RED, dy: -34 }); place(cam, P.ecr, 'ECROM', prog(t, s6.ecr - 0.4, s6.ecr), { col: RED, dy: -34 });
      const fk = sm(t, s6.fug - 0.1, s6.ecr + 0.4, lin); route(cam, P.fil, P.gat, fk, RED, { bendY: 40, w: 8 }); route(cam, P.fil, P.ecr, fk, RED, { bend: 40, w: 8 });
      const ck = prog(t, s6.cai - 0.15, s6.cai + 0.2); { const [x, y] = ll(cam, P.gol[0], P.gol[1]); ctx.save(); clipMap(); ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.fillStyle = RED; ga(1 - 0.5 * ck); ctx.fill(); ga(1); if (ck > 0) { ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.lineCap = 'round'; const r = 30 * outBack(ck); ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke(); } ctx.restore(); }
      frame();
      if (t > s6.fug - 0.3) plaque('FOGEM ATÉ GATE E ECROM (17:52)', 540, 360, 36, prog(t, s6.fug - 0.3, s6.fug), { col: RED });
      else stamp('GOLIAS CAI', 540, 360, prog(t, s6.gol - 0.2, s6.cai), { size: 66 });
    }
    function scene7(t, cam) {
      drawMap(cam, { vale: 1 }); tents(cam, P.isr, ISR, 1, 'ISRAEL', -44); place(cam, P.gat, 'GATE', 1, { col: RED, dy: -34 }); place(cam, P.ecr, 'ECROM', 1, { col: RED, dy: -34 }); place(cam, P.bel, 'BELÉM', 1, { col: BLUE, dy: 42 });
      frame();
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1490); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RED; ctx.fillRect(-200, -46, 400, 92); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-200, -46, 400, 92); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 46, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
      if (t > s7.eli - 0.4) plaque('PRÓXIMA PARTE: ELIAS', 540, 360, 44, prog(t, s7.eli - 0.4, s7.eli), { col: BLUE });
      else plaque('QUAL GIGANTE VOCÊ ENFRENTA?', 540, 360, 38, prog(t, s7.qua - 0.3, s7.qua), { col: RED });
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
      captions(t); txt('Localização tradicional aproximada.', 540, 1780, 22, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
