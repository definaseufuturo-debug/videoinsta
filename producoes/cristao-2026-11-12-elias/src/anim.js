/*
 * ELIAS, DO CARMELO AO HOREBE (1 Reis 18-19). Mapa em pergaminho, 9:16 (perfil cristão).
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
    const FULL = box(32.2, 36.3, 28.0, 33.1), NORTE = box(34.8, 35.6, 32.3, 32.9), SUL = box(33.2, 35.9, 28.2, 31.7);
    const CAMS = [FULL, NORTE, NORTE, NORTE, NORTE, NORTE, FULL, SUL, FULL, FULL, FULL];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i], B[i] + 1.2); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const ll = (cam, lo, la) => toS(cam, [lo * K, -la]);
    const inRect = (x, y, m = 0) => x > RECT[0] + m && x < RECT[0] + RECT[2] - m && y > RECT[1] + m && y < RECT[1] + RECT[3] - m;
    function clipMap() { ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); }
    const landPath = () => { ctx.beginPath(); for (const r of G.land) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } };
    const DUNES = []; { let s = 13; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 260; i++) DUNES.push([32.2 + R() * 4.2, 27.7 + R() * 5.5, 0.02 + R() * 0.05]); }
    const P = { car: [35.09, 32.67], jez: [35.33, 32.557], ber: [34.84, 31.245], arb: [34.78, 30.92], hor: [33.975, 28.539], jer: [35.23, 31.78] };
    function drawMap(cam, o = {}) {
      ctx.save(); clipMap();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      landPath(); ctx.fillStyle = LAND; ctx.fill('nonzero');
      ctx.save(); landPath(); ctx.clip('nonzero'); ctx.fillStyle = 'rgba(160,120,60,0.06)'; for (const [lo, la, r] of DUNES) { if (la > 31.6) continue; ctx.beginPath(); ctx.ellipse(lo * K, -la, r * 1.8, r * 0.7, 0, 0, TAU); ctx.fill(); } ctx.restore();
      if (G.rivers) { ctx.beginPath(); for (const r of G.rivers) r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = RIVER; ctx.lineWidth = 2.5 / cam.s; ctx.stroke(); }
      landPath(); ctx.lineWidth = 2.2 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.beginPath(); for (const r of G.lakes) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } ctx.fillStyle = SEA; ctx.fill(); ctx.lineWidth = 1.5 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.restore();
      for (const [lo, la, n, rot] of [[33.6, 32.4, 'MAR MEDITERRÂNEO', 0], [34.9, 32.95, 'MAR MEDITERRÂNEO', 0], [33.9, 30.4, 'DESERTO', 0], [34.85, 29.45, 'GOLFO DE ÁCABA', 1.15], [32.85, 29.2, 'GOLFO DE SUEZ', -1.0]]) { const [x, y] = ll(cam, lo, la); if (inRect(x, y, 60) && (n !== 'MAR MEDITERRÂNEO' || (cam.s < NORTE.s * 0.6) === (la < 32.6))) txt(n, x, y, 26, { w: 800, it: true, color: n === 'DESERTO' ? MUTE : '#3f6a86', a: 0.85, rot }); }
      if (o.rain > 0) { ctx.strokeStyle = `rgba(47,93,138,${0.35 * o.rain})`; ctx.lineWidth = 3; for (let i = 0; i < 90; i++) { const x = RECT[0] + (i * 137) % RECT[2], y = RECT[1] + ((o.t * 700 + i * 211) % RECT[3]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 30); ctx.stroke(); } }
      ctx.restore();
    }
    function frame() { ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
    function header() { spaced('ELIAS', 540, 140, 60, { sp: 14 }); txt('do Carmelo ao Horebe  •  1 Reis 18 – 19', 540, 210, 30, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(200, 245, 680, 3); }
    function arrowHead(x, y, ang, col, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, -13); ctx.lineTo(-12, 13); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    function place(cam, p, name, k, o = {}) { if (k <= 0) return; const [x, y] = ll(cam, p[0], p[1]); if (!inRect(x, y, 10)) return; ctx.save(); clipMap(); const e = outBack(k);
      ctx.beginPath(); ctx.arc(x, y, 12 * e, 0, TAU); ctx.fillStyle = o.col || INK; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke();
      txt(name, x + (o.dx ?? 0), y + (o.dy ?? -36), o.size || 32, { w: 900, color: o.col || INK, stroke: 9, a: clamp(k * 2), align: o.align || 'center' }); ctx.restore(); }
    function route(cam, a, b, k, col, o = {}) { if (k <= 0) return; const A = ll(cam, a[0], a[1]), Bp = ll(cam, b[0], b[1]); const c = [lerp(A[0], Bp[0], 0.5) + (o.bend || 0) * cam.s / FULL.s, lerp(A[1], Bp[1], 0.5) + (o.bendY || 0) * cam.s / FULL.s];
      const N = 50, n = Math.max(1, Math.floor(N * clamp(k))); const pt = u => [(1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * c[0] + u * u * Bp[0], (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * c[1] + u * u * Bp[1]];
      ctx.save(); clipMap(); ctx.beginPath(); ctx.moveTo(A[0], A[1]); for (let i = 1; i <= n; i++) { const q = pt(i / N); ctx.lineTo(q[0], q[1]); } ctx.lineWidth = o.w || 7; ctx.lineCap = 'round'; ctx.setLineDash(o.dash || [16, 11]); ctx.strokeStyle = col; ctx.stroke(); ctx.setLineDash([]);
      const q1 = pt(n / N), q0 = pt((n - 1) / N); if (o.arrow !== false && k < 1.001) arrowHead(q1[0], q1[1], Math.atan2(q1[1] - q0[1], q1[0] - q0[0]), col, 1.3);
      if (o.walker && k < 1) { ctx.beginPath(); ctx.arc(q1[0], q1[1], 13, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); }
      ctx.restore(); }
    function panel(k, y = 1240, h = 300) { if (k <= 0) return null; const s = outBack(k); ctx.save(); ctx.translate(540, y); ctx.scale(s, s); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.97)'; ctx.fillRect(-470, -h / 2, 940, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-470, -h / 2, 940, h); ctx.strokeRect(-460, -h / 2 + 10, 920, h - 20); return true; }
    const endPanel = () => { ctx.restore(); ga(1); };
    function veil(a) { if (a <= 0) return; ga(a); ctx.fillStyle = '#f2e6c8'; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); ga(1); }
    // altar de 12 pedras (local: centro x,y)
    function altar(x, y, water, burnt) { ctx.save(); ctx.translate(x, y);
      // rego
      ctx.beginPath(); ctx.ellipse(0, 70, 330, 60, 0, 0, TAU); ctx.lineWidth = 34; ctx.strokeStyle = '#a58d66'; ctx.stroke(); if (water > 0) { ctx.strokeStyle = `rgba(79,134,176,${0.9 * water})`; ctx.lineWidth = 26 * water; ctx.stroke(); }
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const sx = -150 + i * 100 + (r % 2) * 20, sy = 60 - r * 56; ctx.beginPath(); ctx.ellipse(sx, sy, 50, 28, 0, 0, TAU); ctx.fillStyle = burnt ? '#5d544a' : '#9a9183'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
      if (!burnt) { ctx.fillStyle = '#7a5532'; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(-80 + i * 40, -120); ctx.rotate(-0.2 + i * 0.1); ctx.fillRect(-60, -7, 120, 14); ctx.strokeRect(-60, -7, 120, 14); ctx.restore(); } }
      ctx.restore(); }
    function flames(x, y, k, t) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); for (let i = 0; i < 9; i++) { const fx = -260 + i * 65, h = (180 + 90 * Math.sin(t * 9 + i * 1.7)) * k; ctx.beginPath(); ctx.moveTo(fx - 40, 0); ctx.quadraticCurveTo(fx - 30, -h * 0.6, fx, -h); ctx.quadraticCurveTo(fx + 30, -h * 0.6, fx + 40, 0); ctx.closePath(); ctx.fillStyle = i % 2 ? '#f0a020' : '#e0661c'; ga(0.9); ctx.fill(); ga(1); }
      ctx.restore(); }
    function cantaro(x, y, s, tilt) { ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s); ctx.fillStyle = '#b5683c'; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-18, -50); ctx.lineTo(18, -50); ctx.quadraticCurveTo(55, -10, 30, 40); ctx.lineTo(-30, 40); ctx.quadraticCurveTo(-55, -10, -18, -50); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }

    // ---------------- tempos ----------------
    const s1 = { qua: wt('c1', 'quatrocentos'), um: wt('c1', 'um'), qd: wt('c1', 'quarenta'), des: wt('c1', 'deserto') };
    const s2 = { rei: wt('c2', 'reis'), car: wt('c2', 'carmelo'), qua: wt('c2', 'quatrocentos'), baa: wt('c2', 'baal'), fog: wt('c2', 'fogo'), deu: wt('c2', 'deus', 1) };
    const s3 = { cla: wt('c3', 'clamam'), man: wt('c3', 'manha'), tar: wt('c3', 'tarde'), nad: wt('c3', 'nada') };
    const s4 = { agu: wt('c4', 'agua'), qua: wt('c4', 'quatro'), tre: wt('c4', 'tres'), doz: wt('c4', 'doze'), reg: wt('c4', 'rego') };
    const s5 = { fog: wt('c5', 'fogo'), cai: wt('c5', 'cai'), sac: wt('c5', 'sacrificio'), len: wt('c5', 'lenha'), ped: wt('c5', 'pedras'), po: wt('c5', 'po'), lam: wt('c5', 'lambe'), agu: wt('c5', 'agua') };
    const s6 = { chu: wt('c6', 'chuva'), cor: wt('c6', 'corre'), jez: wt('c6', 'jezreel'), vin: wt('c6', 'vinte') };
    const s7 = { vir: wt('c7', 'virada'), jez: wt('c7', 'jezabel'), mat: wt('c7', 'matalo'), fog: wt('c7', 'foge'), med: wt('c7', 'medo'), ber: wt('c7', 'berseba') };
    const s8 = { arb: wt('c8', 'arbusto'), mor: wt('c8', 'morrer'), anj: wt('c8', 'anjo'), dua: wt('c8', 'duas'), pao: wt('c8', 'pao'), agu: wt('c8', 'agua') };
    const s9 = { for: wt('c9', 'forca'), qua: wt('c9', 'quarenta'), hor: wt('c9', 'horebe'), q470: wt('c9', 'quatrocentos'), sao: wt('c9', 'sao'), rio: wt('c9', 'rio') };
    const s10 = { ven: wt('c10', 'vento'), ter: wt('c10', 'terremoto'), fog: wt('c10', 'fogo'), sus: wt('c10', 'sussurro'), sua: wt('c10', 'suave') };
    const s11 = { voc: wt('c11', 'voce'), com: wt('c11', 'comenta'), seg: wt('c11', 'segue'), jon: wt('c11', 'jonas') };

    cue(0, 'music', { part: 'intro' }); cue(s1.qua - 0.1, 'stamp'); cue(s1.um, 'impact', { gain: 0.6 }); cue(s1.qd, 'stamp'); cue(B[1], 'music', { part: 'safe' });
    cue(s2.rei, 'pop'); cue(s2.car, 'pop'); cue(s2.qua, 'stamp'); cue(s2.fog, 'fire');
    cue(s3.man, 'tick', { dur: 0.6 }); cue(s3.tar, 'tick', { dur: 0.6 }); cue(s3.nad, 'error');
    cue(s4.agu, 'pour', { dur: 1.0 }); cue(s4.qua, 'pop'); cue(s4.tre, 'pop'); cue(s4.doz, 'stamp'); cue(s4.reg, 'water', { dur: 1.0, gain: 0.5 });
    cue(s5.fog, 'riser', { dur: 0.5 }); cue(s5.cai, 'impact'); cue(s5.cai + 0.1, 'fire'); cue(s5.sac, 'pop', { gain: 0.5 }); cue(s5.len, 'pop', { gain: 0.5 }); cue(s5.ped, 'pop', { gain: 0.5 }); cue(s5.po, 'pop', { gain: 0.5 }); cue(s5.lam, 'sizzle', { dur: 0.8 });
    cue(s6.chu, 'water', { dur: 2.0, gain: 0.5 }); cue(s6.cor, 'whoosh', { dur: 1.2 }); cue(s6.vin, 'stamp');
    cue(s7.vir, 'reveal'); cue(s7.mat, 'impact', { gain: 0.6 }); cue(s7.fog, 'whoosh', { dur: 1.5 }); cue(s7.ber, 'pop');
    cue(s8.mor, 'minus'); cue(s8.anj, 'sparkle'); cue(s8.pao, 'pop'); cue(s8.agu, 'pop');
    cue(s9.qua, 'whoosh', { dur: 2.0 }); cue(s9.hor, 'stamp'); cue(s9.q470, 'stamp'); cue(s9.sao, 'ding', { gain: 0.5 }); cue(B[9], 'music', { part: 'outro' });
    cue(s10.ven, 'wind', { dur: 1.0 }); cue(s10.ter, 'impact', { gain: 0.5 }); cue(s10.fog, 'fire'); cue(s10.sus, 'sparkle');
    cue(s11.com, 'notif'); cue(s11.seg + 0.2, 'tap'); cue(s11.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });
    const lin = x => x;

    // ---------------- cenas ----------------
    function scene1(t, cam) {
      drawMap(cam); veil(0.85); frame();
      if (panel(prog(t, 0.2, 0.5), 860, 560)) {
        const rk = prog(t, s1.qua - 0.2, s1.um);
        for (let i = 0; i < 450; i++) { if (i / 450 > rk) break; const x = -420 + (i % 30) * 19, y = -200 + Math.floor(i / 30) * 22; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fillStyle = RED; ctx.fill(); }
        const bk = outBack(prog(t, s1.um - 0.15, s1.um + 0.2)); if (bk > 0) { ctx.beginPath(); ctx.arc(320, -50, 40 * bk, 0, TAU); ctx.fillStyle = BLUE; ctx.fill(); txt('ELIAS', 320, 30, 40, { w: 900, color: BLUE, a: bk }); }
        txt('450', -140, 190, 70, { w: 900, color: RED, a: rk }); txt('×', 100, 190, 60, { w: 900, color: MUTE, a: bk }); txt('1', 320, 190, 70, { w: 900, color: BLUE, a: bk });
        endPanel(); }
      if (t > s1.qd - 0.3) stamp('+ 40 DIAS NO DESERTO', 540, 1290, prog(t, s1.qd - 0.3, s1.qd), { size: 60 });
    }
    function scene2(t, cam) {
      drawMap(cam); place(cam, P.car, 'MONTE CARMELO', prog(t, s2.car - 0.2, s2.car + 0.2), { col: INK, dy: -38 });
      place(cam, P.jez, 'JEZREEL', prog(t, B[1] + 0.8, B[1] + 1.2), { col: MUTE, size: 28, dy: 40 });
      frame();
      if (t > s2.fog - 0.3) plaque('"O DEUS QUE RESPONDER COM FOGO" (18:24)', 540, 360, 30, prog(t, s2.fog - 0.3, s2.fog), { col: RED });
      else plaque('1 REIS 18', 540, 360, 52, prog(t, B[1], B[1] + 0.3));
      if (t > s2.qua - 0.3) stamp('450 PROFETAS DE BAAL', 540, 1300, prog(t, s2.qua - 0.3, s2.qua), { size: 58 });
    }
    function scene3(t, cam) {
      drawMap(cam); veil(0.85); frame();
      const sk = sm(t, s3.man - 0.2, s3.tar + 0.2, lin); const ang = Math.PI * (1 - sk), sx = 540 + Math.cos(ang) * 380, sy = 820 - Math.sin(ang) * 260;
      ctx.beginPath(); ctx.arc(sx, sy, 50, 0, TAU); ctx.fillStyle = GOLD; ctx.fill(); txt(sk < 0.5 ? 'MANHÃ' : 'TARDE', sx, sy + 90, 34, { w: 900, color: GOLD });
      altar(540, 1150, 0, false);
      plaque('CLAMAM O DIA INTEIRO (18:26-29)', 540, 360, 38, prog(t, B[2], B[2] + 0.3));
      if (t > s3.nad - 0.3) stamp('NADA', 540, 980, prog(t, s3.nad - 0.3, s3.nad), { size: 120 });
    }
    function scene4(t, cam) {
      drawMap(cam); veil(0.85); frame();
      const wk = sm(t, s4.doz - 0.2, s4.reg + 0.4); altar(540, 1150, wk, false);
      const pour = (t - s4.agu) * 3; if (t > s4.agu - 0.3 && t < s4.reg + 0.5) { for (let i = 0; i < 4; i++) { const x = 300 + i * 160, tilt = 1.6 + 0.2 * Math.sin(pour + i); cantaro(x, 880, 1.1, tilt); ctx.strokeStyle = 'rgba(79,134,176,0.7)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x + 40, 900); ctx.lineTo(x + 30, 1050); ctx.stroke(); } }
      if (t > s4.qua - 0.2) txt('4 CÂNTAROS', 540, 640, 70, { w: 900, color: BLUE, scale: outBack(prog(t, s4.qua - 0.2, s4.qua + 0.2)) });
      if (t > s4.tre - 0.2) txt('× 3 VEZES', 540, 730, 60, { w: 900, color: INK, scale: outBack(prog(t, s4.tre - 0.2, s4.tre + 0.2)) });
      if (t > s4.doz - 0.3) stamp('= 12 CÂNTAROS', 540, 1350, prog(t, s4.doz - 0.3, s4.doz), { size: 64, col: BLUE });
      plaque('ÁGUA NO ALTAR (18:33-35)', 540, 360, 42, prog(t, B[3], B[3] + 0.3), { col: BLUE });
    }
    function scene5(t, cam) {
      drawMap(cam); veil(0.85); frame();
      const fk = sm(t, s5.cai - 0.2, s5.cai + 0.3); if (t > s5.fog - 0.3 && t < s5.cai + 0.3) { ctx.fillStyle = `rgba(255,200,80,${0.5 * prog(t, s5.fog - 0.3, s5.cai)})`; ctx.fillRect(470, 430, 140, 700 * prog(t, s5.fog - 0.3, s5.cai)); }
      const burnt = t > s5.len; altar(540, 1150, 1 - sm(t, s5.lam - 0.1, s5.agu + 0.4), burnt);
      flames(540, 1110, fk * (1 - 0.4 * sm(t, s5.agu, s5.agu + 1.5)), t);
      if (t > s5.cai - 0.1 && t < s5.cai + 0.2) { ga(0.5); ctx.fillStyle = '#fff3d0'; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); ga(1); }
      const items = [['SACRIFÍCIO', s5.sac], ['LENHA', s5.len], ['PEDRAS', s5.ped], ['PÓ', s5.po], ['ÁGUA', s5.lam]];
      items.forEach(([n, tt], i) => { const k = prog(t, tt - 0.15, tt + 0.15); if (k <= 0) return; const x = i < 3 ? 240 + i * 300 : 390 + (i - 3) * 300, y = i < 3 ? 560 : 640; txt(n + ' ✓', x, y, 44, { w: 900, color: RED, scale: outBack(k), stroke: 9 }); });
      plaque('O FOGO CAI (18:38)', 540, 360, 50, prog(t, B[4], B[4] + 0.3), { col: RED });
    }
    function scene6(t, cam) {
      drawMap(cam, { rain: sm(t, s6.chu - 0.3, s6.chu + 0.5), t }); place(cam, P.car, 'CARMELO', 1, { dy: -38 }); place(cam, P.jez, 'JEZREEL', 1, { col: BLUE, dy: 44 });
      route(cam, P.car, P.jez, sm(t, s6.cor - 0.1, s6.vin + 0.6, lin), BLUE, { walker: true, bendY: -30 });
      if (t > s6.vin - 0.2) { const [x, y] = ll(cam, 35.21, 32.66); ctx.save(); clipMap(); txt('≈ 25 km', x + 40, y - 40, 46, { w: 900, color: BLUE, stroke: 10, a: prog(t, s6.vin - 0.2, s6.vin + 0.2) }); txt('correndo, na chuva', x + 40, y + 6, 26, { w: 800, color: MUTE, stroke: 7, a: prog(t, s6.vin - 0.2, s6.vin + 0.2) }); ctx.restore(); }
      frame();
      plaque('CORRE ATÉ JEZREEL (18:46)', 540, 360, 42, prog(t, s6.cor - 0.3, s6.cor), { col: BLUE });
      if (t < s6.cor - 0.3) plaque('VEM A CHUVA (18:45)', 540, 360, 46, prog(t, B[5], B[5] + 0.3), { col: BLUE });
    }
    function scene7(t, cam) {
      drawMap(cam); place(cam, P.car, 'CARMELO', 1, { dy: -38, size: 26 }); place(cam, P.jez, 'JEZREEL', 1, { col: MUTE, dx: 20, dy: 0, align: 'left', size: 26 });
      place(cam, P.jer, 'Jerusalém', prog(t, B[6] + 1.0, B[6] + 1.4), { col: MUTE, size: 22, dx: 18, dy: 0, align: 'left' });
      route(cam, P.car, P.jez, 1, BLUE, { arrow: false, w: 5 });
      route(cam, P.jez, P.ber, sm(t, s7.fog - 0.1, s7.ber + 0.4, lin), RED, { walker: true, bend: -40 });
      place(cam, P.ber, 'BERSEBA', prog(t, s7.ber - 0.2, s7.ber + 0.2), { col: RED, dx: -22, dy: 0, align: 'right' });
      frame();
      if (t > s7.jez - 0.3) plaque('JEZABEL JURA MATÁ-LO (19:2)', 540, 360, 40, prog(t, s7.jez - 0.3, s7.jez), { col: RED });
      else plaque('A VIRADA', 540, 360, 52, prog(t, B[6], B[6] + 0.3), { col: RED });
      if (t > s7.med - 0.3) stamp('FOGE COM MEDO', 540, 1300, prog(t, s7.med - 0.3, s7.med), { size: 64 });
    }
    function scene8(t, cam) {
      drawMap(cam); route(cam, P.jez, P.ber, 1, RED, { arrow: false, w: 5 }); place(cam, P.ber, 'BERSEBA', 1, { col: RED, dx: 22, dy: 0, align: 'left' });
      route(cam, P.ber, P.arb, sm(t, B[7] + 0.5, s8.arb, lin), RED, { walker: true });
      frame();
      if (panel(prog(t, s8.arb - 0.2, s8.arb + 0.1), 1170, 420)) {
        // arbusto
        ctx.fillStyle = GREEN; for (const [x, y, r] of [[-300, 20, 60], [-250, -30, 55], [-200, 20, 60], [-250, 40, 50]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } ctx.fillStyle = '#6b4a2b'; ctx.fillRect(-258, 60, 16, 80);
        txt('DEBAIXO DE UM ARBUSTO', -250, -150, 30, { w: 900 });
        const ak = prog(t, s8.anj - 0.2, s8.anj + 0.2); if (ak > 0) { ga(ak); const g = ctx.createRadialGradient(100, -20, 0, 100, -20, 140); g.addColorStop(0, 'rgba(255,230,150,0.9)'); g.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = g; ctx.fillRect(-40, -160, 280, 280); ga(1); }
        const pk = outBack(prog(t, s8.pao - 0.2, s8.pao + 0.2)); if (pk > 0) { ctx.save(); ctx.translate(60, 60); ctx.scale(pk, pk); ctx.beginPath(); ctx.ellipse(0, 0, 70, 34, 0, 0, TAU); ctx.fillStyle = '#d9a35a'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); txt('PÃO', 60, 130, 32, { w: 900, a: pk }); }
        const wk = prog(t, s8.agu - 0.2, s8.agu + 0.2); if (wk > 0) { cantaro(250, 50, 1.2 * outBack(wk), 0); txt('ÁGUA', 250, 130, 32, { w: 900, color: BLUE, a: wk }); }
        if (t > s8.dua - 0.2) txt('2 VEZES (19:5-7)', 150, -150, 40, { w: 900, color: GOLD, a: prog(t, s8.dua - 0.2, s8.dua + 0.2) });
        endPanel(); }
      if (t > s8.mor - 0.3) plaque('PEDE PARA MORRER (19:4)', 540, 360, 44, prog(t, s8.mor - 0.3, s8.mor), { col: RED });
      else plaque('NO DESERTO', 540, 360, 50, prog(t, B[7], B[7] + 0.3));
    }
    function scene9(t, cam) {
      drawMap(cam); route(cam, P.car, P.jez, 1, BLUE, { arrow: false, w: 5 }); route(cam, P.jez, P.ber, 1, RED, { arrow: false, w: 5 }); route(cam, P.ber, P.arb, 1, RED, { arrow: false, w: 5 });
      place(cam, P.car, 'CARMELO', 1, { dx: -20, dy: 0, align: 'right', size: 26 }); place(cam, P.ber, 'BERSEBA', 1, { col: RED, dx: 22, dy: 0, align: 'left', size: 26 });
      const rk = sm(t, s9.qua - 0.2, s9.hor + 0.2, lin); route(cam, P.arb, P.hor, rk, GOLD, { walker: true, bend: -60, w: 8 });
      place(cam, P.hor, 'MONTE HOREBE', prog(t, s9.hor - 0.3, s9.hor + 0.1), { col: GOLD, dx: 24, dy: 0, align: 'left' });
      if (t > s9.hor - 0.3) { const [x, y] = ll(cam, P.hor[0], P.hor[1]); ctx.save(); clipMap(); txt('(tradicional)', x + 24, y + 34, 22, { w: 700, color: MUTE, stroke: 6, align: 'left', a: prog(t, s9.hor - 0.3, s9.hor) }); ctx.restore(); }
      // linha reta Carmelo–Horebe
      const lk = prog(t, s9.q470 - 0.3, s9.q470 + 0.6); if (lk > 0) { const A = ll(cam, P.car[0], P.car[1]), Bp = ll(cam, P.hor[0], P.hor[1]); ctx.save(); clipMap(); ctx.setLineDash([6, 10]); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(lerp(A[0], Bp[0], lk), lerp(A[1], Bp[1], lk)); ctx.stroke(); ctx.restore(); }
      frame();
      const day = Math.round(40 * rk); if (t > s9.qua - 0.3) { ctx.save(); ctx.fillStyle = 'rgba(247,238,214,0.95)'; ctx.fillRect(40, 1260, 260, 150); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(40, 1260, 260, 150); txt('DIA', 170, 1300, 30, { w: 800, color: MUTE }); txt(String(day), 170, 1365, 84, { w: 900, color: GOLD }); ctx.restore(); }
      if (panel(prog(t, s9.q470 - 0.3, s9.q470), 560, 200)) { txt('≈ 470 km EM LINHA RETA', 0, -40, 50, { w: 900, color: INK }); txt('São Paulo → Rio ≈ 360 km', 0, 40, 40, { w: 800, color: BLUE, a: prog(t, s9.sao - 0.2, s9.sao + 0.2) }); endPanel(); }
      plaque('40 DIAS E 40 NOITES (19:8)', 540, 360, 44, prog(t, s9.qua - 0.3, s9.qua), { col: GOLD });
      if (t < s9.qua - 0.3) plaque('COM A FORÇA DAQUELA COMIDA', 540, 360, 38, prog(t, B[8], B[8] + 0.3));
    }
    function scene10(t, cam) {
      drawMap(cam); veil(0.88); frame();
      plaque('NO HOREBE (19:11-12)', 540, 360, 46, prog(t, B[9], B[9] + 0.3), { col: GOLD });
      const ws = [['VENTO', s10.ven, 620], ['TERREMOTO', s10.ter, 780], ['FOGO', s10.fog, 940]];
      for (const [w, tt, y] of ws) { const k = prog(t, tt - 0.2, tt + 0.1); if (k <= 0) continue; const shake = w === 'TERREMOTO' ? Math.sin(t * 50) * 6 * (1 - prog(t, tt, tt + 0.6)) : 0; txt(w, 540 + shake, y, 80, { w: 900, color: MUTE, scale: outBack(k) }); const xk = prog(t, tt + 0.25, tt + 0.5); if (xk > 0) { const hw = tw(w, 80, 900) / 2 + 20; ctx.lineWidth = 10; ctx.strokeStyle = RED; ctx.beginPath(); ctx.moveTo(540 - hw, y); ctx.lineTo(540 - hw + 2 * hw * xk, y); ctx.stroke(); } }
      const sk = prog(t, s10.sus - 0.3, s10.sua + 0.3); if (sk > 0) { ga(sk); const g = ctx.createRadialGradient(540, 1160, 0, 540, 1160, 380); g.addColorStop(0, 'rgba(255,236,170,0.8)'); g.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = g; ctx.fillRect(160, 780, 760, 760); ga(1); txt('UM SUSSURRO', 540, 1130, 84, { w: 900, color: GOLD, a: sk }); txt('SUAVE', 540, 1230, 84, { w: 900, color: GOLD, a: sk }); }
    }
    function scene11(t, cam) {
      drawMap(cam); route(cam, P.car, P.jez, 1, BLUE, { arrow: false, w: 5 }); route(cam, P.jez, P.ber, 1, RED, { arrow: false, w: 5 }); route(cam, P.ber, P.arb, 1, RED, { arrow: false, w: 5 }); route(cam, P.arb, P.hor, 1, GOLD, { arrow: false, w: 6, bend: -60 });
      place(cam, P.car, 'CARMELO', 1, { dx: -20, dy: 0, align: 'right', size: 26 }); place(cam, P.hor, 'HOREBE', 1, { col: GOLD, dx: 24, dy: 0, align: 'left', size: 28 });
      veil(0.55); frame();
      const ck = outBack(prog(t, s11.com - 0.3, s11.com + 0.1)); if (ck > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(ck, ck); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-230, -80, 460, 160); ctx.lineWidth = 7; ctx.strokeStyle = RED; ctx.strokeRect(-230, -80, 460, 160); txt('EU JÁ', 0, 4, 76, { w: 900, color: RED }); ctx.restore(); txt('comenta aqui embaixo', 540, 1030, 36, { w: 800, color: INK, a: ck, stroke: 8 }); }
      const bk = sm(t, s11.seg - 0.3, s11.seg + 0.1, outBack), press = t > s11.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1250); const pr = bk * (1 - 0.06 * pulse(t, s11.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RED; ctx.fillRect(-200, -46, 400, 92); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-200, -46, 400, 92); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 46, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
      if (t > s11.jon - 0.4) plaque('PRÓXIMA PARTE: JONAS', 540, 360, 44, prog(t, s11.jon - 0.4, s11.jon), { col: BLUE });
      else plaque('FORTE NUM DIA, NO CHÃO NO OUTRO?', 540, 360, 34, prog(t, B[10], B[10] + 0.3), { col: RED });
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
      header(); ctx.save(); sceneFns[i](t, camAt(t, i)); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t); txt('Rota tradicional aproximada. Horebe: localização tradicional.', 540, 1780, 22, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
