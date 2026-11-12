/*
 * OS 10 EXÉRCITOS MAIS PODEROSOS — Mindloop "o mundo em mapas e dados" (poder militar, só dados públicos: Global Firepower 2026). 9:16, narrado.
 * Mapa: Natural Earth 50m via pipeline/geo_paises.py mundo (lat_ref 0).
 * Neutro: sem bandeiras, sem rostos. Ouro/prata/bronze = top 3; azul = 4º a 10º; verde-azulado = Brasil.
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
  const AMB = '#f2b84b', TEAL = '#2ec4b6', WH = '#f3f5fa', MU = '#8a95ad', RED = '#ff4d5e', BLUE = '#5fb4ff';
  const GOLD = '#f5c542', SILV = '#c9d3e3', BRON = '#d98b4f';
  const LBL = { RUS: [95, 61], GBR: [-4, 57], FRA: [1, 46], ITA: [14, 41.5], TUR: [35, 39], CHN: [104, 33], KOR: [128, 36], JPN: [139, 37] };

  function create(TL, env) {
    const WORLD = env.mundo || require('../assets/mundo.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ---------- primitivas ----------
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 28; } if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || INK; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore(); }
    function rtxt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; const d = size * 0.06; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.globalAlpha *= o.a ?? 1; ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.12; ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.strokeText(s, d, d); ctx.fillText(s, d, d); ctx.strokeText(s, 0, 0); ctx.fillStyle = o.color || WH; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function line(pts, w, col, dash) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); }
    function circ(x, y, r, fill, lw = 0, sc = WH) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function chip(s, x, y, size, col, k, o = {}) { if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1)); rr(-w / 2 + 6, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1); }
    function panel(x, y, w, h, k, col) { const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); rr(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(7,11,20,0.9)'; ctx.fill(); if (col) { ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); } }
    const endPanel = () => { ctx.restore(); ga(1); };
    function bg(t) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(95,180,255,0.05)'; ctx.lineWidth = 2; const off = (t * 20) % 80; for (let x = -80 + off; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -80 + off; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    function header() { ga(0.9); rr(250, 110, 580, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); txt('O MUNDO EM MAPAS E DADOS', 540, 141, 26, { w: 800, color: MU }); ga(1); }
    function fonte(s) { txt(s, 540, 1800, 24, { w: 600, color: 'rgba(255,255,255,0.45)' }); }

    // ---------- mapa ----------
    const R_FULL = [0, 330, W, 1120];
    const box = (data, lo0, lo1, la0, la1, R = R_FULL) => { const K = Math.cos(data.lat_ref * Math.PI / 180), x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(R[2] / (x1 - x0), R[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, K, R }; };
    const mix = (a, b, k) => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), K: a.K, R: a.R });
    const toS = (cam, x, y) => [cam.R[0] + cam.R[2] / 2 + (x - cam.cx) * cam.s, cam.R[1] + cam.R[3] / 2 + (y - cam.cy) * cam.s];
    const ll = (cam, lon, lat) => toS(cam, lon * cam.K, -lat);
    function drawMap(data, cam, style, a = 1, o = {}) {
      const R = cam.R; ctx.save(); ga(a); ctx.beginPath(); if (o.round) rr(R[0], R[1], R[2], R[3], 28); else ctx.rect(R[0], R[1], R[2], R[3]); ctx.clip();
      ctx.fillStyle = SEA; ctx.fillRect(R[0], R[1], R[2], R[3]);
      ctx.translate(R[0] + R[2] / 2, R[1] + R[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      for (const p of data.paises) { const st = style(p.iso) || {}; ctx.beginPath(); for (const pl of p.poly) { pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
        if (st.glow) { ctx.save(); ctx.shadowColor = st.glow; ctx.shadowBlur = 40; ctx.fillStyle = st.fill; ctx.fill(); ctx.restore(); }
        ctx.fillStyle = st.fill || LAND; ctx.fill(); ctx.lineWidth = (st.lw || 1.4) / cam.s; ctx.strokeStyle = st.edge || EDGE; ctx.stroke(); }
      ctx.restore(); ga(1);
      if (!o.noFade) { const fg = ctx.createLinearGradient(0, R[1], 0, R[1] + 120); fg.addColorStop(0, 'rgba(15,23,38,1)'); fg.addColorStop(1, 'rgba(15,23,38,0)'); ctx.fillStyle = fg; ctx.fillRect(0, R[1], W, 120);
        const fb = ctx.createLinearGradient(0, R[1] + R[3] - 160, 0, R[1] + R[3]); fb.addColorStop(0, 'rgba(7,11,20,0)'); fb.addColorStop(1, 'rgba(7,11,20,1)'); ctx.fillStyle = fb; ctx.fillRect(0, R[1] + R[3] - 160, W, 160); }
    }
    const lab = (data, iso) => (data.paises.find(p => p.iso === iso) || {}).label;
    const lab2 = iso => (LBL[iso] ? [LBL[iso][0], -LBL[iso][1]] : lab(WORLD, iso));
    const R_MAP = [0, 250, W, 660];
    const CAM_W = box(WORLD, -128, 150, -45, 72, R_MAP), CAM_FULL = box(WORLD, -128, 150, -45, 72), CAM_SA = box(WORLD, -84, -30, -40, 8);

    // ---------- tempos ----------
    const s1 = { cen: wt('c1', 'cento'), pai: wt('c1', 'paises'), ses: wt('c1', 'sessenta'), cri: wt('c1', 'criterios'), que: wt('c1', 'quem'), for: wt('c1', 'fortes') };
    const s2 = { ran: wt('c2', 'ranking'), glo: wt('c2', 'global'), doi: wt('c2', 'dois'), est: wt('c2', 'estados'), pri: wt('c2', 'primeiro'), rus: wt('c2', 'russia'), chi: wt('c2', 'china'), atr: wt('c2', 'atras') };
    const s3 = { dep: wt('c3', 'depois'), ind: wt('c3', 'india'), cor: wt('c3', 'coreia'), fra: wt('c3', 'franca') };
    const s4 = { fec: wt('c4', 'fecham'), top: wt('c4', 'top'), jap: wt('c4', 'japao'), rei: wt('c4', 'reino'), tur: wt('c4', 'turquia'), ita: wt('c4', 'italia') };
    const s5 = { bra: wt('c5', 'brasil'), dec: wt('c5', 'decimo'), lug: wt('c5', 'lugar'), bem: wt('c5', 'bem'), ame: wt('c5', 'america') };
    const s6 = { ind: wt('c6', 'indice'), tro: wt('c6', 'tropas'), equ: wt('c6', 'equipamentos'), orc: wt('c6', 'orcamento'), log: wt('c6', 'logistica'), men: wt('c6', 'menor'), not: wt('c6', 'nota'), for: wt('c6', 'forte') };
    const s7 = { alg: wt('c7', 'alguma'), sur: wt('c7', 'surpreendeu'), com: wt('c7', 'comenta'), ama: wt('c7', 'amanha'), nuc: wt('c7', 'nucleares'), seg: wt('c7', 'segue'), per: wt('c7', 'perder') };

    // ranking (Global Firepower 2026, PwrIndx: menor = mais forte)
    const TOP = [
      ['USA', 'EUA', 0.0741, s2.est], ['RUS', 'RÚSSIA', 0.0791, s2.rus], ['CHN', 'CHINA', 0.0919, s2.chi],
      ['IND', 'ÍNDIA', 0.1346, s3.ind], ['KOR', 'COREIA DO SUL', 0.1642, s3.cor], ['FRA', 'FRANÇA', 0.1798, s3.fra],
      ['JPN', 'JAPÃO', 0.1876, s4.jap], ['GBR', 'REINO UNIDO', 0.1881, s4.rei], ['TUR', 'TURQUIA', 0.1975, s4.tur], ['ITA', 'ITÁLIA', 0.2210, s4.ita]];
    const MEDAL = [GOLD, SILV, BRON];
    const colOf = i => (i < 3 ? MEDAL[i] : BLUE);
    const fmt = v => v.toFixed(4).replace('.', ',');

    cue(0, 'music', { part: 'intro' }); cue(s1.cen, 'scan', { dur: 1.4, gain: 0.5 }); cue(s1.ses, 'stamp', { gain: 0.6 }); cue(s1.for, 'impact', { gain: 0.8 });
    cue(B[1], 'music', { part: 'groove' }); cue(s2.est, 'tada'); cue(s2.rus, 'pop'); cue(s2.chi, 'pop');
    cue(s3.ind, 'pop'); cue(s3.cor, 'pop'); cue(s3.fra, 'pop');
    cue(s4.jap, 'pop'); cue(s4.rei, 'pop'); cue(s4.tur, 'pop'); cue(s4.ita, 'pop');
    cue(s5.bra, 'impact', { gain: 0.6 }); cue(s5.dec, 'ding'); cue(s5.ame, 'sparkle');
    cue(s6.tro, 'pop'); cue(s6.equ, 'pop'); cue(s6.orc, 'pop'); cue(s6.log, 'pop'); cue(s6.men, 'riser', { dur: 0.6 }); cue(s6.for, 'stamp', { gain: 0.6 });
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.nuc, 'whoosh', { dur: 0.4 }); cue(s7.per + 0.1, 'tap'); cue(s7.per + 0.15, 'success');
    for (const k of [1, 4, 5, 6]) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    const ORD = {}; { const lst = WORLD.paises.map(p => [p.iso, p.label[0]]).sort((a, b) => a[1] - b[1]); lst.forEach(([iso], i) => (ORD[iso] = i / (lst.length - 1))); }
    function scene1(t) {
      const w = prog(t, s1.cen - 0.1, s1.cri + 0.2);
      drawMap(WORLD, CAM_FULL, iso => { const k = clamp((w - ORD[iso] * 0.85) * 6); if (k <= 0) return null; const p = 1 - prog(t, s1.que, s1.que + 0.6) * 0.6; return { fill: `rgba(95,180,255,${0.55 * k * p})`, edge: BLUE, lw: 1.2 }; });
      const n = Math.round(145 * outC(prog(t, s1.cen - 0.1, s1.pai + 0.3)));
      rtxt(`${n}`, 540, 380, 220, { color: BLUE, glow: 'rgba(95,180,255,0.6)', scale: sm(t, 0.05, 0.4, outBack) });
      txt('PAÍSES', 540, 520, 60, { w: 900, stroke: 14, a: prog(t, s1.pai - 0.2, s1.pai + 0.1) });
      chip('+ DE 60 CRITÉRIOS', 540, 625, 44, AMB, prog(t, s1.ses - 0.2, s1.cri + 0.1));
      const qk = sm(t, s1.que - 0.2, s1.que + 0.15, outBack);
      if (qk > 0) { panel(540, 1330, 900, 230, qk, GOLD); txt('QUEM É O', 0, -50, 64, { w: 900 }); txt('MAIS FORTE?', 0, 40, 84, { w: 900, color: GOLD, scale: 1 + 0.08 * pulse(t, s1.for) }); endPanel(); }
      header(); fonte('Global Firepower 2026 · 145 países');
    }
    // mapa + ranking (cenas 2 a 4)
    function rankView(t) {
      const ap = TOP.map(r => prog(t, r[3] - 0.2, r[3] + 0.2));
      const sty = {}; TOP.forEach((r, i) => (sty[r[0]] = i));
      drawMap(WORLD, CAM_W, iso => { const i = sty[iso]; if (i === undefined || ap[i] <= 0) return null; const c = colOf(i), fresh = pulse(t, TOP[i][3], 0.08, 0.6); return { fill: c, edge: WH, lw: 1.5 + 3 * fresh, glow: fresh > 0.2 ? c : null }; });
      // marcadores numerados
      TOP.forEach((r, i) => { if (ap[i] <= 0) return; const lb = lab2(r[0]); const [x, y] = toS(CAM_W, lb[0], lb[1]); const k = outBack(ap[i]); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); circ(0, 0, 24, colOf(i), 3, INK); txt(String(i + 1), 0, 2, 26, { w: 900, color: INK }); ctx.restore(); });
      // ranking em barras
      const y0 = 960, dy = 62, BX = 455, BW = 400;
      TOP.forEach((r, i) => { const k = ap[i]; if (k <= 0) return; const y = y0 + i * dy, str = TOP[0][2] / r[2], bw = BW * str * outC(k);
        const hot = pulse(t, r[3], 0.08, 0.8); ga(clamp(k * 2));
        if (hot > 0.05) { rr(40, y - 28, 1000, 56, 14); ctx.fillStyle = `rgba(255,255,255,${0.08 * hot})`; ctx.fill(); }
        txt(`${i + 1}º`, 95, y + 2, 34, { w: 900, color: colOf(i), align: 'right' });
        txt(r[1], 120, y + 2, 34, { w: 900, align: 'left' });
        rr(BX, y - 20, Math.max(bw, 8), 40, 10); ctx.fillStyle = colOf(i); ctx.fill();
        txt(fmt(r[2]), BX + bw + 14, y + 2, 28, { w: 800, color: MU, align: 'left' }); ga(1); });
      const tk = prog(t, s2.ran - 0.2, s2.ran + 0.3);
      if (tk > 0) { ga(tk); txt('TOP 10 · PODER MILITAR', 540, 905, 34, { w: 900, color: MU }); ga(1); }
    }
    function scene2(t) {
      rankView(t);
      chip('GLOBAL FIREPOWER 2026', 540, 260, 36, WH, prog(t, s2.glo - 0.2, s2.doi + 0.2), { fill: WH });
      header(); fonte('Global Firepower 2026 · nota PwrIndx (menor = mais forte)');
    }
    function scene3(t) { rankView(t); chip('GLOBAL FIREPOWER 2026', 540, 260, 36, WH, 1, { fill: WH }); header(); fonte('Global Firepower 2026 · nota PwrIndx (menor = mais forte)'); }
    function scene4(t) { rankView(t); chip('GLOBAL FIREPOWER 2026', 540, 260, 36, WH, 1, { fill: WH }); const k = prog(t, s4.top - 0.2, s4.top + 0.2); if (k > 0) chip('TOP 10', 900, 905, 30, AMB, k); header(); fonte('Global Firepower 2026 · nota PwrIndx (menor = mais forte)'); }
    function scene5(t) {
      const cam = mix(CAM_FULL, CAM_SA, sm(t, B[4], B[4] + 1.0)), bk = prog(t, s5.bra - 0.2, s5.bra + 0.2);
      drawMap(WORLD, cam, iso => iso === 'BRA' && bk > 0 ? { fill: TEAL, edge: WH, lw: 3 + 3 * pulse(t, s5.dec), glow: 'rgba(46,196,182,0.8)' } : null);
      rtxt('E O BRASIL?', 540, 300, 90, { color: WH, scale: sm(t, B[4] + 0.1, B[4] + 0.45, outBack) });
      const dk = sm(t, s5.dec - 0.2, s5.dec + 0.15, outBack);
      if (dk > 0) { const lb = lab(WORLD, 'BRA'), [x, y] = toS(cam, lb[0], lb[1]); ctx.save(); ctx.translate(x, y); ctx.scale(dk, dk); circ(0, 0, 110, 'rgba(7,11,20,0.85)', 6, TEAL); txt('11º', 0, 4, 110, { w: 900, color: TEAL }); ctx.restore(); }
      const lk = sm(t, s5.bem - 0.2, s5.bem + 0.15, outBack);
      if (lk > 0) { panel(540, 1340, 900, 200, lk, TEAL); txt('1º DA AMÉRICA LATINA', 0, -38, 54, { w: 900, color: TEAL }); txt('nota 0,2374  ·  logo atrás da Itália (0,2210)', 0, 40, 32, { w: 700 }); endPanel(); }
      header(); fonte('Global Firepower 2026');
    }
    function scene6(t) {
      drawMap(WORLD, CAM_FULL, () => null, 0.3);
      rtxt('COMO É A NOTA', 540, 330, 80, { color: WH, scale: sm(t, s6.ind - 0.2, s6.ind + 0.15, outBack) });
      const items = [[s6.tro, 'TROPAS', 300, 520], [s6.equ, 'EQUIPAMENTOS', 780, 520], [s6.orc, 'ORÇAMENTO', 300, 680], [s6.log, 'LOGÍSTICA', 780, 680]];
      items.forEach(([tt, s, x, y]) => { const k = sm(t, tt - 0.2, tt + 0.15, outBack); if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); rr(-220, -60, 440, 120, 24); ctx.fillStyle = 'rgba(7,11,20,0.92)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = BLUE; ctx.stroke(); txt(s, 0, 3, s.length > 10 ? 40 : 46, { w: 900 }); ctx.restore(); });
      // escala
      const ek = prog(t, s6.men - 0.3, s6.men + 0.3);
      if (ek > 0) { ga(ek); const x0 = 110, x1 = 970, y = 1060; const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, GOLD); g.addColorStop(1, '#3a4660'); rr(x0, y - 22, (x1 - x0) * outC(ek), 44, 22); ctx.fillStyle = g; ctx.fill();
        txt('0', x0, y + 60, 30, { w: 800, color: MU }); txt('0,30', x1, y + 60, 30, { w: 800, color: MU });
        const mk = prog(t, s6.not, s6.not + 0.4);
        [[0.0741, 'EUA', GOLD], [0.2374, 'BRASIL', TEAL]].forEach(([v, s, c], i) => { const x = lerp(x0, x1, v / 0.30), kk = outBack(clamp(mk * 2 - i * 0.6)); if (kk <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(kk, kk); line([[0, -30], [0, -80]], 4, c); circ(0, 0, 16, c, 3, INK); chip(`${s} ${fmt(v)}`, 0, -120, 30, c, 1); ctx.restore(); }); ga(1); }
      const fk = sm(t, s6.for - 0.2, s6.for + 0.15, outBack); if (fk > 0) { panel(540, 1330, 860, 150, fk, GOLD); txt('MENOR NOTA = MAIS FORTE', 0, 3, 52, { w: 900, color: GOLD }); endPanel(); }
      header(); fonte('Global Firepower · índice privado, não prevê guerras');
    }
    function scene7(t) {
      drawMap(WORLD, CAM_FULL, iso => { const i = TOP.findIndex(r => r[0] === iso); return i >= 0 ? { fill: colOf(i) } : iso === 'BRA' ? { fill: TEAL } : null; }, 0.35);
      rtxt('ALGUMA POSIÇÃO', 540, 400, 92, { color: WH, scale: sm(t, s7.alg - 0.2, s7.alg + 0.15, outBack) });
      rtxt('TE SURPREENDEU?', 540, 510, 92, { color: GOLD, scale: sm(t, s7.sur - 0.2, s7.sur + 0.15, outBack) });
      chip('COMENTA AQUI', 540, 670, 46, GOLD, prog(t, s7.com - 0.15, s7.com + 0.2));
      const nk = sm(t, s7.ama - 0.2, s7.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 920); ctx.scale(nk, nk); rr(-430, -120, 860, 240, 26); ctx.fillStyle = 'rgba(7,11,20,0.85)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -60, 34, { w: 900, color: MU }); txt('OS PAÍSES COM', 0, 5, 60, { w: 900 }); txt('ARMAS NUCLEARES', 0, 72, 60, { w: 900, color: BLUE, a: prog(t, s7.nuc - 0.3, s7.nuc + 0.1) }); ctx.restore(); }
      const bk = sm(t, s7.seg - 0.2, s7.seg + 0.2, outBack), press = t > s7.per + 0.1; if (bk > 0) { ctx.save(); ctx.translate(540, 1220); const pr = bk * (1 - 0.06 * pulse(t, s7.per + 0.1, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : GOLD; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header();
    }

    // ---------- legendas ----------
    const HL = new Set(['cento', 'quarenta', 'cinco', 'sessenta', 'fortes', 'estados', 'unidos', 'primeiro', 'russia', 'china', 'india', 'coreia', 'franca', 'japao', 'reino', 'unido', 'turquia', 'italia', 'brasil', 'decimo', 'primeiro', 'latina', 'tropas', 'equipamentos', 'orcamento', 'logistica', 'menor', 'forte', 'surpreendeu', 'comenta', 'nucleares']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1640); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? AMB : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    const NOFLASH = new Set([2, 3]);
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; bg(t);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) if (!NOFLASH.has(k)) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / 0.15); if (fl > 0) { ctx.globalAlpha = fl * 0.85; ctx.fillStyle = '#04060c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
