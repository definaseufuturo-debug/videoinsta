/*
 * A EXPANSÃO E A QUEDA DO IMPÉRIO ROMANO — Mindloop "o mundo em mapas e dados" (sáb: história mundial). 9:16, narrado.
 * Mapa: Natural Earth 50m via pipeline/geo_paises.py (-14..48, 18..60, lat_ref 38). Território aproximado,
 * desenhado sobre as fronteiras de hoje com recortes por latitude/longitude. Neutro: sem rostos, sem violência.
 * Fontes: History Skills, Live Science, Wikipedia.
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
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  const BG0 = '#070b14', BG1 = '#0f1726', SEA = '#0b1a2e', LAND = '#1c2638', EDGE = '#34445e', INK = '#070b14';
  const AMB = '#f2b84b', TEAL = '#2ec4b6', WH = '#f3f5fa', MU = '#8a95ad', RED = '#ff5d6c', BLUE = '#5fb4ff', VIO = '#b58cff', PURP = '#c0392b';
  const ROMA = '#d9534f'; // vermelho romano
  const K = Math.cos(38 * Math.PI / 180);
  const P = (lon, lat) => [lon * K, -lat];

  // território (aproximado). Recorte: lista de retângulos [lon0, lon1, lat0, lat1] (união)
  const R = (a, b, c, d) => [a, b, c, d];
  const ALLR = [R(-30, 60, 0, 70)];
  const CLIP = {
    GBR: [R(-10, 3, 49, 55.2)], NLD: [R(0, 10, 45, 51.9)], DEU: [R(0, 8.3, 45, 51), R(0, 13.5, 45, 48.6)], AUT: [R(0, 20, 40, 48.3)],
    HUN: [R(10, 19.1, 40, 48.3)], ROU: [R(20, 26.2, 43, 48)], EGY: [R(20, 40, 22, 35)], LBY: [R(9, 26, 29.5, 35)], TUN: [R(5, 12, 32, 38)],
    DZA: [R(-3, 10, 34.6, 38)], MAR: [R(-10, -1, 33.6, 37)], SAU: [R(34, 38.5, 27, 33)], IRQ: [R(38, 48, 30, 37.5)],
  };
  // 117 d.C.
  const E117 = ['ITA', 'SMR', 'VAT', 'MLT', 'ESP', 'PRT', 'AND', 'FRA', 'MCO', 'BEL', 'LUX', 'NLD', 'CHE', 'LIE', 'DEU', 'AUT', 'GBR', 'SVN', 'HRV', 'BIH', 'SRB', 'KOS', 'MNE', 'ALB', 'MKD', 'GRC', 'BGR', 'ROU', 'HUN', 'TUR', 'CYP', 'CYN', 'SYR', 'LBN', 'ISR', 'PSE', 'JOR', 'EGY', 'LBY', 'TUN', 'DZA', 'MAR'];
  // 395 d.C.
  const WEST = ['ITA', 'SMR', 'VAT', 'MLT', 'ESP', 'PRT', 'AND', 'FRA', 'MCO', 'BEL', 'LUX', 'NLD', 'CHE', 'LIE', 'DEU', 'AUT', 'GBR', 'SVN', 'HRV', 'BIH', 'HUN', 'TUN', 'DZA', 'MAR', 'LBY'];
  const EAST = ['SRB', 'KOS', 'MNE', 'ALB', 'MKD', 'GRC', 'BGR', 'TUR', 'CYP', 'CYN', 'SYR', 'LBN', 'ISR', 'PSE', 'JOR', 'EGY', 'LBY'];
  const CLIP_W = { LBY: [R(9, 19.5, 29.5, 35)] }, CLIP_E = { LBY: [R(19.5, 26, 29.5, 35)] };
  const ROME = [12.5, 41.9], CONST = [28.97, 41.01];

  function create(TL, env) {
    const WORLD = env.paises || require('../assets/paises.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const BY = {}; for (const p of WORLD.paises) BY[p.iso] = p;

    // ---------- primitivas ----------
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 28; } if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || INK; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore(); }
    function rtxt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; const d = size * 0.06; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.globalAlpha *= o.a ?? 1; ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.12; ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.strokeText(s, d, d); ctx.fillText(s, d, d); ctx.strokeText(s, 0, 0); ctx.fillStyle = o.color || WH; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function circ(x, y, r, fill, lw = 0, sc = WH) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function chip(s, x, y, size, col, k, o = {}) { if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1)); rr(-w / 2 + 6, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1); }
    function panel(x, y, w, h, k, col) { const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); rr(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(7,11,20,0.9)'; ctx.fill(); if (col) { ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); } }
    const endPanel = () => { ctx.restore(); ga(1); };
    function bg(t) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(242,184,75,0.04)'; ctx.lineWidth = 2; const off = (t * 20) % 80; for (let x = -80 + off; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -80 + off; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    function header() { ga(0.9); rr(250, 110, 580, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); txt('O MUNDO EM MAPAS E DADOS', 540, 141, 26, { w: 800, color: MU }); ga(1); }
    function fonte(s) { txt(s, 540, 1800, 24, { w: 600, color: 'rgba(255,255,255,0.45)' }); }

    // ---------- mapa ----------
    const R_MAP = [0, 330, W, 900];
    const box = (lo0, lo1, la0, la1) => { const x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(R_MAP[2] / (x1 - x0), R_MAP[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, R: R_MAP }; };
    const mix = (a, b, k) => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), R: a.R });
    const toS = (cam, lon, lat) => { const [x, y] = P(lon, lat); return [cam.R[0] + cam.R[2] / 2 + (x - cam.cx) * cam.s, cam.R[1] + cam.R[3] / 2 + (y - cam.cy) * cam.s]; };
    function cpath(p) { ctx.beginPath(); for (const pl of p.poly) { pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } }
    function rectsClip(rects) { ctx.beginPath(); for (const [a, b, c, d] of rects) { const [x0, y0] = P(a, d), [x1, y1] = P(b, c); ctx.rect(x0, y0, x1 - x0, y1 - y0); } ctx.clip(); }
    // layers: [{isos, col, a, glow, clip (map iso->rects)}]
    function drawMap(cam, layers, a = 1) {
      const Rr = cam.R; ctx.save(); ga(a); ctx.beginPath(); ctx.rect(Rr[0], Rr[1], Rr[2], Rr[3]); ctx.clip();
      ctx.fillStyle = SEA; ctx.fillRect(Rr[0], Rr[1], Rr[2], Rr[3]);
      ctx.translate(Rr[0] + Rr[2] / 2, Rr[1] + Rr[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      for (const p of WORLD.paises) { cpath(p); ctx.fillStyle = LAND; ctx.fill(); ctx.lineWidth = 1.2 / cam.s; ctx.strokeStyle = EDGE; ctx.stroke(); }
      for (const L of layers) {
        for (const iso of L.isos) { const p = BY[iso]; if (!p) continue; const al = typeof L.a === 'function' ? L.a(iso) : (L.a ?? 1); if (al <= 0.001) continue;
          ctx.save(); rectsClip((L.clip && L.clip[iso]) || CLIP[iso] || ALLR); ctx.globalAlpha = a * al;
          if (L.glow) { ctx.shadowColor = L.glow; ctx.shadowBlur = 30; }
          cpath(p); ctx.fillStyle = typeof L.col === 'function' ? L.col(iso) : L.col; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 1 / cam.s; ctx.strokeStyle = 'rgba(7,11,20,0.5)'; ctx.stroke(); ctx.restore(); }
      }
      ctx.restore(); ga(1);
      const fg = ctx.createLinearGradient(0, Rr[1], 0, Rr[1] + 110); fg.addColorStop(0, 'rgba(15,23,38,1)'); fg.addColorStop(1, 'rgba(15,23,38,0)'); ctx.fillStyle = fg; ctx.fillRect(0, Rr[1], W, 110);
      const fb = ctx.createLinearGradient(0, Rr[1] + Rr[3] - 150, 0, Rr[1] + Rr[3]); fb.addColorStop(0, 'rgba(7,11,20,0)'); fb.addColorStop(1, 'rgba(7,11,20,1)'); ctx.fillStyle = fb; ctx.fillRect(0, Rr[1] + Rr[3] - 150, W, 150);
    }
    function cityDot(cam, ll, name, k, col = WH, dx = 0, dy = -46) { if (k <= 0) return; const [x, y] = toS(cam, ...ll); ga(k); circ(x, y, 18 + 10 * Math.sin(k * Math.PI), 'rgba(255,255,255,0.15)'); circ(x, y, 10, col, 4, INK); ga(1); if (name) chip(name, x + dx, y + dy, 28, col, k); }
    function arrow(cam, a, b, k, col) { if (k <= 0) return; const [x0, y0] = toS(cam, ...a), [x1, y1] = toS(cam, ...b), x = lerp(x0, x1, outC(k)), y = lerp(y0, y1, outC(k)), ang = Math.atan2(y1 - y0, x1 - x0);
      ctx.save(); ctx.lineCap = 'round'; ctx.setLineDash([22, 16]); ctx.lineDashOffset = -k * 60; ctx.lineWidth = 9; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-16, -18); ctx.lineTo(-16, 18); ctx.closePath(); ctx.fill(); ctx.restore(); }

    const CAM_IT = box(4, 22, 36, 47.5), CAM_E = box(-12, 47, 22, 57), CAM_EA = box(12, 46, 24, 47), CAM_C = box(18, 36, 34, 45);
    const CAMS = [CAM_E, CAM_E, CAM_E, CAM_E, CAM_E, CAM_EA, CAM_E];

    // ---------- linha do tempo ----------
    const TX0 = 110, TX1 = 970, TY = 250, ty = y => lerp(TX0, TX1, (y + 753) / (1453 + 753));
    const MARKS = [-753, 117, 395, 476, 1453];
    const yrLab = y => (y < 0 ? `${Math.round(-y)} a.C.` : `${Math.round(y)} d.C.`);
    function timeline(year, a = 1) { ga(a * 0.95); rr(TX0, TY - 4, TX1 - TX0, 8, 4); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill(); rr(TX0, TY - 4, ty(year) - TX0, 8, 4); ctx.fillStyle = AMB; ctx.fill();
      txt('753 a.C.', TX0, TY + 34, 22, { w: 800, color: MU }); txt('1453', TX1, TY + 34, 22, { w: 800, color: MU });
      for (const y of MARKS) circ(ty(y), TY, 7, y <= year + 0.01 ? AMB : '#3a4660');
      circ(ty(year), TY, 14, WH, 4, AMB); ga(1); }

    // ---------- tempos ----------
    const s1 = { aug: wt('c1', 'auge'), imp: wt('c1', 'imperio'), cin: wt('c1', 'cinco'), mil: wt('c1', 'milhoes'), qui: wt('c1', 'quilometros'), com: wt('c1', 'como'), cai: wt('c1', 'caiu') };
    const s2 = { cid: wt('c2', 'cidade'), ita: wt('c2', 'italia'), pou: wt('c2', 'poucos'), rom: wt('c2', 'roma'), cer: wt('c2', 'cercou'), med: wt('c2', 'mediterraneo'), int: wt('c2', 'inteiro') };
    const s3 = { cen: wt('c3', 'cento'), dez: wt('c3', 'dezessete'), bri: wt('c3', 'britania'), egi: wt('c3', 'egito'), cin: wt('c3', 'cinquenta'), set: wt('c3', 'setenta'), pes: wt('c3', 'pessoas') };
    const s4 = { tre: wt('c4', 'trezentos'), div: wt('c4', 'dividido'), doi: wt('c4', 'dois'), oci: wt('c4', 'ocidente'), ori: wt('c4', 'oriente') };
    const s5 = { cri: wt('c5', 'crises'), pre: wt('c5', 'pressao'), ger: wt('c5', 'germanicos'), oci: wt('c5', 'ocidente'), cai: wt('c5', 'caiu'), qua: wt('c5', 'quatrocentos'), seis: wt('c5', 'seis') };
    const s6 = { ori: wt('c6', 'oriente'), biz: wt('c6', 'bizantino'), dur: wt('c6', 'durou'), mil: wt('c6', 'mil'), ate: wt('c6', 'ate'), tres: wt('c6', 'tres') };
    const s7 = { pra: wt('c7', 'pra'), der: wt('c7', 'derrubou'), rom: wt('c7', 'roma'), com: wt('c7', 'comenta'), ama: wt('c7', 'amanha'), can: wt('c7', 'canal'), pan: wt('c7', 'panama'), seg: wt('c7', 'segue'), per: wt('c7', 'perder') };

    cue(0, 'music', { part: 'intro' }); cue(s1.aug, 'scan', { dur: 1.0, gain: 0.5 }); cue(s1.cin, 'riser', { dur: 0.9 }); cue(s1.qui, 'impact', { gain: 0.8 }); cue(s1.cai, 'crack', { gain: 0.5 });
    cue(B[1], 'music', { part: 'groove' }); cue(s2.ita, 'pop'); cue(s2.cer, 'scan', { dur: 1.2, gain: 0.5 }); cue(s2.int, 'stamp', { gain: 0.6 });
    cue(s3.dez, 'ding'); cue(s3.bri, 'pop'); cue(s3.egi, 'pop'); cue(s3.pes, 'stamp', { gain: 0.6 });
    cue(s4.div, 'crack', { gain: 0.6 }); cue(s4.oci, 'pop'); cue(s4.ori, 'pop');
    cue(s5.ger, 'whoosh', { dur: 0.8, gain: 0.6 }); cue(s5.cai, 'impact', { gain: 0.7 }); cue(s5.seis, 'stamp', { gain: 0.6 });
    cue(s6.biz, 'sparkle'); for (let i = 0; i < 10; i++) cue(lerp(s6.mil, s6.tres + 0.3, i / 9), 'tick', { dur: 0.08, gain: 0.4 }); cue(s6.tres + 0.4, 'ding');
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.pan, 'whoosh', { dur: 0.4 }); cue(s7.per + 0.1, 'tap'); cue(s7.per + 0.15, 'success');
    for (const k of [1, 2, 3, 4, 5, 6]) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.45 });

    // distância de Roma (onda de expansão) e de Constantinopla (encolhimento)
    const lab = iso => { const p = BY[iso]; return p && p.label ? [p.label[0] / K, -p.label[1]] : ROME; };
    const dist = (iso, c) => { const [lo, la] = lab(iso); return Math.hypot((lo - c[0]) * K, la - c[1]); };
    const DR = {}, DC = {}; let mR = 0, mC = 0; for (const i of E117) { DR[i] = dist(i, ROME); mR = Math.max(mR, DR[i]); } for (const i of EAST) { DC[i] = dist(i, CONST); mC = Math.max(mC, DC[i]); }
    DR.ITA = 0; DR.VAT = 0; DR.SMR = 0;

    // ================= CENA 1 — 5 milhões de km² =================
    function scene1(t, cam) {
      const w = prog(t, s1.aug - 0.2, s1.mil + 0.3);
      drawMap(cam, [{ isos: E117, col: ROMA, a: iso => clamp((w * 1.3 - DR[iso] / mR) * 4), glow: pulse(t, s1.qui, 0.1, 0.8) > 0.2 ? ROMA : null }]);
      timeline(117, prog(t, 0.1, 0.5));
      chip('IMPÉRIO ROMANO', 540, 380, 44, AMB, sm(t, s1.imp - 0.2, s1.imp + 0.15));
      const ck = sm(t, s1.cin - 0.25, s1.cin + 0.1, outBack);
      if (ck > 0) { panel(540, 1150, 820, 300, ck, ROMA); rtxt('+5 MILHÕES', 0, -40, 120, { color: WH, scale: 1 + 0.08 * pulse(t, s1.qui) }); txt('DE KM² NO AUGE', 0, 85, 50, { w: 900, color: AMB, a: prog(t, s1.qui - 0.2, s1.qui + 0.1) }); endPanel(); }
      const qk = sm(t, s1.com - 0.2, s1.com + 0.15, outBack);
      if (qk > 0) { panel(540, 545, 940, 140, qk, AMB); txt('COMO ALGO TÃO GRANDE CAIU?', 0, 3, 52, { w: 900, color: AMB }); endPanel(); }
      header(); fonte('Auge em 117 d.C. · History Skills / Wikipedia · mapa aproximado');
    }
    // ================= CENA 2 — de uma cidade ao Mediterrâneo =================
    function scene2(t, cam) {
      const zoomOut = sm(t, s2.pou - 0.2, s2.med + 0.3); const c = mix(mix(CAM_E, CAM_IT, sm(t, B[1] - 0.1, B[1] + 0.8)), CAM_E, zoomOut);
      const w = prog(t, s2.pou, s2.int + 0.3);
      const yr = lerp(-753, 117, w); timeline(yr);
      drawMap(c, [{ isos: E117, col: ROMA, a: iso => (iso === 'ITA' || iso === 'VAT' || iso === 'SMR' ? prog(t, s2.ita - 0.1, s2.ita + 0.4) * (0.35 + 0.65 * clamp(w * 3)) : clamp((w * 1.25 - DR[iso] / mR) * 5)) }]);
      cityDot(c, ROME, 'ROMA', prog(t, s2.cid - 0.15, s2.cid + 0.25), AMB);
      chip(yrLab(yr), 540, 400, 44, AMB, prog(t, B[1] + 0.1, B[1] + 0.4));
      const mk = sm(t, s2.med - 0.2, s2.int + 0.1, outBack);
      if (mk > 0) { panel(540, 1170, 840, 230, mk, ROMA); txt('O MEDITERRÂNEO', 0, -38, 60, { w: 900 }); txt('VIROU UM LAGO ROMANO', 0, 42, 46, { w: 900, color: AMB }); endPanel(); }
      header(); fonte('Expansão simplificada · mapa aproximado, fronteiras atuais');
    }
    // ================= CENA 3 — auge em 117 =================
    function scene3(t, cam) {
      timeline(117);
      drawMap(cam, [{ isos: E117, col: ROMA }]);
      chip('117 d.C. · O AUGE', 540, 400, 42, AMB, sm(t, s3.cen - 0.2, s3.dez + 0.1));
      cityDot(cam, [-1.5, 53], 'BRITÂNIA', prog(t, s3.bri - 0.15, s3.bri + 0.2), WH, 0, -48);
      cityDot(cam, [31.2, 27], 'EGITO', prog(t, s3.egi - 0.15, s3.egi + 0.2), WH, 0, 48);
      if (t > s3.egi) { const [x0, y0] = toS(cam, -1.5, 53), [x1, y1] = toS(cam, 31.2, 27), k = sm(t, s3.egi, s3.egi + 0.6); ga(0.85); ctx.setLineDash([14, 12]); ctx.lineWidth = 5; ctx.strokeStyle = WH; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, k), lerp(y0, y1, k)); ctx.stroke(); ctx.setLineDash([]); ga(1); }
      const ck = sm(t, s3.cin - 0.25, s3.cin + 0.1, outBack);
      if (ck > 0) { panel(540, 1170, 840, 270, ck, AMB); rtxt('50 A 70', 0, -45, 120, { color: AMB, scale: 1 + 0.06 * pulse(t, s3.set) }); txt('MILHÕES DE PESSOAS', 0, 75, 50, { w: 900 }); endPanel(); }
      header(); fonte('População estimada · History Skills · mapa aproximado');
    }
    // ================= CENA 4 — 395: dividido em dois =================
    function scene4(t, cam) {
      timeline(lerp(117, 395, sm(t, B[3], B[3] + 0.8)));
      const sp = sm(t, s4.div - 0.1, s4.div + 0.4), kw = prog(t, s4.oci - 0.1, s4.oci + 0.3), ke = prog(t, s4.ori - 0.1, s4.ori + 0.3);
      const lostA = 1 - sp; // Dácia, Mesopotâmia etc. somem
      const extra = E117.filter(i => !WEST.includes(i) && !EAST.includes(i));
      drawMap(cam, [
        { isos: extra, col: ROMA, a: lostA },
        { isos: WEST, col: kw > 0 ? mixC(ROMA, BLUE, kw) : ROMA, clip: sp > 0.5 ? CLIP_W : null },
        { isos: EAST, col: ke > 0 ? mixC(ROMA, AMB, ke) : ROMA, clip: sp > 0.5 ? CLIP_E : null },
      ]);
      // linha de divisão
      if (sp > 0) { const pts = [[19.2, 50], [19.2, 44], [19.5, 41], [19.5, 29]].map(p => toS(cam, ...p)); ga(sp); ctx.setLineDash([16, 12]); ctx.lineWidth = 6; ctx.strokeStyle = WH; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]); ga(1); }
      cityDot(cam, ROME, 'OCIDENTE', kw, BLUE, -40, -50);
      cityDot(cam, CONST, 'ORIENTE', ke, AMB, 30, -50);
      chip('395 d.C.', 540, 400, 44, AMB, sm(t, s4.tre - 0.2, s4.tre + 0.15));
      const dk = sm(t, s4.doi - 0.2, s4.doi + 0.1, outBack);
      if (dk > 0) { panel(540, 1170, 760, 230, dk, WH); rtxt('1 → 2', 0, -10, 130, { color: WH, scale: 1 + 0.06 * pulse(t, s4.doi) }); endPanel(); }
      header(); fonte('Divisão definitiva em 395 · Live Science');
    }
    // ================= CENA 5 — 476: queda do Ocidente =================
    const GERM = [[[8, 57], [2, 48.5]], [[13, 56], [11, 45]], [[19, 55], [17, 46.5]], [[3, 55.5], [-4, 42]]];
    function scene5(t, cam) {
      timeline(lerp(395, 476, sm(t, B[4], B[4] + 0.8)));
      const fall = sm(t, s5.cai - 0.1, s5.cai + 0.6), shake = pulse(t, s5.cai, 0.05, 0.3);
      drawMap(cam, [
        { isos: WEST, col: mixC(BLUE, '#3a4660', fall), clip: CLIP_W },
        { isos: EAST, col: AMB, clip: CLIP_E },
      ]);
      ctx.save(); if (shake > 0.05) ctx.translate(Math.sin(t * 90) * 8 * shake, 0);
      GERM.forEach(([a, b], i) => arrow(cam, a, b, prog(t, s5.pre + i * 0.15, s5.ger + 0.6 + i * 0.15), 'rgba(243,245,250,0.85)'));
      ctx.restore();
      chip('CRISES INTERNAS', 540, 390, 38, RED, prog(t, s5.cri - 0.15, s5.cri + 0.2));
      chip('POVOS GERMÂNICOS', 540, 480, 38, WH, prog(t, s5.ger - 0.2, s5.ger + 0.2));
      const ck = sm(t, s5.qua - 0.2, s5.seis + 0.1, outBack);
      if (ck > 0) { panel(540, 1170, 760, 270, ck, RED); rtxt('476', 0, -45, 130, { color: WH }); txt('FIM DO OCIDENTE', 0, 80, 54, { w: 900, color: RED }); endPanel(); }
      header(); fonte('Queda do Império do Ocidente em 476 · Live Science / History Skills');
    }
    // ================= CENA 6 — Oriente até 1453 =================
    function scene6(t, cam) {
      const yk = sm(t, s6.mil - 0.1, s6.tres + 0.4); const yr = lerp(476, 1453, yk); timeline(yr);
      const shr = prog(t, s6.mil, s6.tres + 0.2);
      drawMap(cam, [
        { isos: WEST, col: '#3a4660', clip: CLIP_W, a: 0.6 },
        { isos: EAST, col: AMB, clip: CLIP_E, a: iso => 1 - 0.8 * clamp((shr * 1.2 - (1 - DC[iso] / mC)) * 3), glow: pulse(t, s6.biz, 0.1, 0.8) > 0.2 ? AMB : null },
      ]);
      cityDot(cam, CONST, 'CONSTANTINOPLA', prog(t, s6.ori - 0.1, s6.ori + 0.3), AMB, 0, -52);
      chip('IMPÉRIO BIZANTINO', 540, 400, 42, AMB, prog(t, s6.biz - 0.2, s6.biz + 0.2));
      const ck = sm(t, s6.dur - 0.2, s6.dur + 0.15, outBack);
      if (ck > 0) { panel(540, 1170, 760, 270, ck, AMB); rtxt(String(Math.round(yr)), 0, -45, 130, { color: yk >= 1 ? AMB : WH, scale: 1 + 0.06 * pulse(t, s6.tres + 0.4) }); txt('QUASE MIL ANOS A MAIS', 0, 80, 48, { w: 900, color: AMB }); endPanel(); }
      header(); fonte('Império Romano do Oriente até 1453 · Live Science');
    }
    // ================= CENA 7 — CTA =================
    function scene7(t, cam) {
      drawMap(cam, [{ isos: E117, col: ROMA }], 0.3);
      rtxt('O QUE', 540, 400, 92, { color: WH, scale: sm(t, s7.pra - 0.2, s7.pra + 0.15, outBack) });
      rtxt('DERRUBOU ROMA?', 540, 510, 92, { color: AMB, scale: sm(t, s7.der - 0.2, s7.der + 0.15, outBack) });
      chip('COMENTA AQUI', 540, 670, 46, AMB, prog(t, s7.com - 0.15, s7.com + 0.2));
      const nk = sm(t, s7.ama - 0.2, s7.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 920); ctx.scale(nk, nk); rr(-430, -120, 860, 240, 26); ctx.fillStyle = 'rgba(7,11,20,0.88)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -60, 34, { w: 900, color: MU }); txt('COMO FUNCIONA O', 0, 5, 56, { w: 900 }); txt('CANAL DO PANAMÁ', 0, 72, 60, { w: 900, color: TEAL, a: prog(t, s7.can - 0.4, s7.can) }); ctx.restore(); }
      const bk = sm(t, s7.seg - 0.2, s7.seg + 0.2, outBack), press = t > s7.per + 0.1; if (bk > 0) { ctx.save(); ctx.translate(540, 1220); const pr = bk * (1 - 0.06 * pulse(t, s7.per + 0.1, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header();
    }
    const mixC = (a, b, u) => { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return 'rgb(' + pa.map((x, i) => Math.round(lerp(x, pb[i], clamp(u)))).join(',') + ')'; };

    // ---------- legendas ----------
    const HL = new Set(['auge', 'imperio', 'cinco', 'milhoes', 'caiu', 'italia', 'roma', 'mediterraneo', 'cento', 'dezessete', 'britania', 'egito', 'cinquenta', 'setenta', 'trezentos', 'dividido', 'ocidente', 'oriente', 'germanicos', 'quatrocentos', 'seis', 'bizantino', 'mil', 'tres', 'derrubou', 'comenta', 'canal', 'panama']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1640); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? AMB : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    function camAt(t, i) { if (i === 0) return CAMS[0]; return mix(CAMS[i - 1], CAMS[i], sm(t, B[i] - 0.1, B[i] + 0.9)); }
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; bg(t);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t, camAt(t, i)); ctx.restore(); scr(); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / 0.15); if (fl > 0) { ctx.globalAlpha = fl * 0.85; ctx.fillStyle = '#04060c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
