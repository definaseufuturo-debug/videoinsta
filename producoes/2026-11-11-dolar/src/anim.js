/*
 * POR QUE O DÓLAR DOMINA O MUNDO — Mindloop "o mundo em mapas e dados" (economia mundial). 9:16, narrado.
 * Mapa: Natural Earth 50m via pipeline/geo_paises.py mundo (lat_ref 0).
 * Neutro: sem bandeiras, sem rostos, sem cédulas reais. Verde = dólar; dourado = ouro; azul = euro; lilás = iene.
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
  const dec = (v, n = 1) => v.toFixed(n).replace('.', ',');

  const BG0 = '#070b14', BG1 = '#0f1726', SEA = '#0b1a2e', LAND = '#1c2638', EDGE = '#34445e', INK = '#070b14';
  const GRN = '#3ddc84', GRN2 = '#1f6b44', GOLD = '#f2c14b', WH = '#f3f5fa', MU = '#8a95ad', RED = '#ff4d5e', BLUE = '#5fb4ff', LIL = '#b48cff';
  // países de onde partem as "trocas" na cena 1 (só decoração: centros financeiros grandes, sem afirmação sobre eles)
  const HUBS = ['GBR', 'DEU', 'FRA', 'JPN', 'CHN', 'IND', 'BRA', 'ZAF', 'AUS', 'SAU', 'MEX', 'KOR', 'IDN', 'NGA', 'ARG', 'TUR', 'EGY', 'RUS', 'CAN', 'SGP'];

  function create(TL, env) {
    const WORLD = env.mundo || require('../assets/mundo.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.3); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ---------- primitivas ----------
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 28; } if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || INK; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore(); }
    function rtxt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; const d = size * 0.06; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.globalAlpha *= o.a ?? 1; ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.12; ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.strokeText(s, d, d); ctx.fillText(s, d, d); ctx.strokeText(s, 0, 0); ctx.fillStyle = o.color || WH; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function line(pts, w, col, dash) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); }
    function circ(x, y, r, fill, lw = 0, sc = WH) { ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function chip(s, x, y, size, col, k, o = {}) { if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1)); rr(-w / 2 + 6, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1); }
    function panel(x, y, w, h, k, col) { const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); rr(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(7,11,20,0.9)'; ctx.fill(); if (col) { ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); } }
    const endPanel = () => { ctx.restore(); ga(1); };
    function bg(t) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(95,180,255,0.05)'; ctx.lineWidth = 2; const off = (t * 20) % 80; for (let x = -80 + off; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -80 + off; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    function header() { ga(0.9); rr(250, 110, 580, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); txt('O MUNDO EM MAPAS E DADOS', 540, 141, 26, { w: 800, color: MU }); ga(1); }
    function fonte(s) { txt(s, 540, 1800, 24, { w: 600, color: 'rgba(255,255,255,0.45)' }); }
    // moeda "US$" desenhada (genérica)
    function coin(x, y, r, k, col = GRN, s = 'US$') { if (k <= 0) return; const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.shadowColor = col; ctx.shadowBlur = 40; circ(0, 0, r, col); ctx.shadowBlur = 0; circ(0, 0, r * 0.82, null, r * 0.06, INK); txt(s, 0, r * 0.04, r * 0.62, { w: 900, color: INK }); ctx.restore(); }
    function goldBar(x, y, w, k) { if (k <= 0) return; const sc = outBack(k), h = w * 0.42; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.shadowColor = GOLD; ctx.shadowBlur = 36; ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(w * 0.36, -h / 2); ctx.lineTo(-w * 0.36, -h / 2); ctx.closePath(); ctx.fillStyle = GOLD; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 4; ctx.strokeStyle = '#a07a1e'; ctx.stroke(); txt('OURO', 0, 4, w * 0.2, { w: 900, color: '#5a420c' }); ctx.restore(); }

    // ---------- mapa ----------
    const R_FULL = [0, 330, W, 1120];
    const box = (data, lo0, lo1, la0, la1, R = R_FULL) => { const K = Math.cos(data.lat_ref * Math.PI / 180), x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(R[2] / (x1 - x0), R[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, K, R }; };
    const mix = (a, b, k) => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), K: a.K, R: a.R });
    const toS = (cam, x, y) => [cam.R[0] + cam.R[2] / 2 + (x - cam.cx) * cam.s, cam.R[1] + cam.R[3] / 2 + (y - cam.cy) * cam.s];
    const ll = (cam, lon, lat) => toS(cam, lon * cam.K, -lat);
    function drawMap(data, cam, style, a = 1, o = {}) {
      const R = cam.R; ctx.save(); ga(a); ctx.beginPath(); ctx.rect(R[0], R[1], R[2], R[3]); ctx.clip();
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
    const CAM_W = box(WORLD, -130, 150, -45, 70), CAM_US = box(WORLD, -128, -62, 22, 52, [0, 330, W, 400]), CAM_W2 = box(WORLD, -130, 150, -45, 70, [0, 330, W, 400]);
    const usaGlow = k => iso => iso === 'USA' && k > 0 ? { fill: k >= 1 ? GRN : GRN2, edge: GRN, lw: 2.5, glow: 'rgba(61,220,132,0.6)' } : null;
    function arcs(cam, t, t0, t1, a = 1) { // trocas: arcos dos centros até os EUA
      const us = lab(WORLD, 'USA'), [ux, uy] = toS(cam, us[0], us[1]);
      HUBS.forEach((iso, i) => { const lb = lab(WORLD, iso); if (!lb) return; const [x, y] = toS(cam, lb[0], lb[1]); const st = lerp(t0, t1, i / HUBS.length), k = outC(prog(t, st, st + 0.6)); if (k <= 0) return;
        const mx = (x + ux) / 2, my = Math.min(y, uy) - 120 - Math.abs(x - ux) * 0.12; ga(0.75 * a); ctx.beginPath(); const N = 24; for (let j = 0; j <= N * k; j++) { const u = j / N, px = (1 - u) * (1 - u) * x + 2 * (1 - u) * u * mx + u * u * ux, py = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * my + u * u * uy; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.lineWidth = 3; ctx.strokeStyle = GRN; ctx.stroke(); ga(a); circ(x, y, 6, WH); ga(1); });
    }

    // ---------- tempos ----------
    const s1 = { qua: wt('c1', 'quase'), nov: wt('c1', 'nove'), tro: wt('c1', 'trocas'), dol: wt('c1', 'dolar'), por: wt('c1', 'por'), man: wt('c1', 'manda') };
    const s2 = { mil: wt('c2', 'mil'), q44: wt('c2', 'quarenta', 1), pai: wt('c2', 'paises'), pre: wt('c2', 'prenderam'), dol: wt('c2', 'dolar', 1), our: wt('c2', 'ouro') };
    const s3 = { mil: wt('c3', 'mil'), set: wt('c3', 'setenta'), dei: wt('c3', 'deixou'), our: wt('c3', 'ouro'), mas: wt('c3', 'mas'), con: wt('c3', 'continuou') };
    const s4 = { hoj: wt('c4', 'hoje'), cin: wt('c4', 'cinquenta'), res: wt('c4', 'reservas'), ban: wt('c4', 'bancos'), dol: wt('c4', 'dolar') };
    const s5 = { tro: wt('c5', 'trocas'), oit: wt('c5', 'oitenta'), eur: wt('c5', 'euro'), vin: wt('c5', 'vinte') };
    const s6 = { tra: wt('c6', 'tras'), eco: wt('c6', 'economia'), mer: wt('c6', 'mercado'), mas: wt('c6', 'mas'), pai: wt('c6', 'paises'), men: wt('c6', 'menos') };
    const s7 = { dol: wt('c7', 'dolar'), top: wt('c7', 'topo'), com: wt('c7', 'comenta'), ama: wt('c7', 'amanha'), dez: wt('c7', 'dez'), exe: wt('c7', 'exercitos'), seg: wt('c7', 'segue'), per: wt('c7', 'perder') };
    cue(0, 'music', { part: 'intro' }); cue(s1.qua, 'riser', { dur: 0.8 }); cue(s1.nov, 'impact', { gain: 0.8 }); cue(s1.tro, 'scan', { dur: 1.2, gain: 0.5 }); cue(s1.por, 'pop'); cue(s1.man, 'stamp');
    cue(B[1], 'music', { part: 'groove' }); cue(s2.mil, 'tick', { dur: 0.4 }); cue(s2.q44, 'pop'); cue(s2.pre, 'lock'); cue(s2.dol, 'ding'); cue(s2.our, 'sparkle');
    cue(s3.set, 'tick', { dur: 0.4 }); cue(s3.dei, 'scratch'); cue(s3.our, 'impact', { gain: 0.6 }); cue(s3.con, 'ding', { gain: 0.6 });
    cue(s4.hoj + 0.1, 'riser', { dur: 0.7 }); cue(s4.res, 'stamp', { gain: 0.6 }); cue(s4.dol, 'ding');
    cue(s5.oit, 'impact', { gain: 0.6 }); cue(s5.eur, 'pop'); cue(s5.vin, 'pop');
    cue(s6.eco, 'pop'); cue(s6.mer, 'pop'); cue(s6.mas, 'swoosh'); cue(s6.men, 'scan', { dur: 0.8, gain: 0.5 });
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.exe, 'whoosh', { dur: 0.4 }); cue(s7.per + 0.1, 'tap'); cue(s7.per + 0.15, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    function scene1(t) {
      const cam = CAM_W, uk = sm(t, s1.dol - 0.3, s1.dol + 0.1);
      drawMap(WORLD, cam, usaGlow(t > s1.tro ? Math.max(uk, 0.5) : 0));
      arcs(cam, t, s1.tro - 0.1, s1.dol + 0.3);
      const n = 89 * outC(prog(t, s1.qua, s1.nov + 0.6));
      rtxt(`${Math.round(n)}%`, 540, 380, 230, { color: GRN, glow: 'rgba(61,220,132,0.6)', scale: sm(t, 0.05, 0.4, outBack) });
      txt('DAS TROCAS DE MOEDA', 540, 525, 54, { w: 900, stroke: 12, a: prog(t, s1.tro - 0.2, s1.tro + 0.2) });
      chip('TÊM O DÓLAR DE UM LADO', 540, 612, 40, GRN, prog(t, s1.dol - 0.2, s1.dol + 0.15));
      const pk = sm(t, s1.por - 0.2, s1.por + 0.15, outBack); if (pk > 0) rtxt('POR QUÊ?', 540, 1330, 120, { color: WH, scale: pk * (1 + 0.06 * pulse(t, s1.man)) });
      header(); fonte('BIS · Pesquisa Trienal · abril de 2025');
    }
    function scene2(t) {
      const cam = mix(CAM_W2, CAM_US, sm(t, B[1], B[1] + 0.9));
      drawMap(WORLD, cam, usaGlow(1), 0.6);
      // pino Bretton Woods (New Hampshire)
      const [bx, by] = ll(cam, -71.44, 44.26), pk = sm(t, s2.mil - 0.2, s2.mil + 0.2, outBack);
      if (pk > 0) { circ(bx, by, 10 + 6 * Math.sin(t * 5), GOLD, 3, INK); chip('BRETTON WOODS · 1944', clamp(bx - 40, 240, 840), by - 70, 30, GOLD, pk); }
      rtxt('1944', 540, 262, 100, { color: GOLD, glow: 'rgba(242,193,75,0.5)', scale: sm(t, s2.mil - 0.2, s2.mil + 0.2, outBack) });
      // anel de 44 moedas presas ao US$
      const cx = 540, cy = 1100, R = 270, rk = prog(t, s2.q44 - 0.2, s2.pai + 0.4), lk = prog(t, s2.pre - 0.1, s2.pre + 0.6);
      if (rk > 0) { ga(0.92); circ(cx, cy, R + 60, 'rgba(7,11,20,0.75)'); ga(1); }
      for (let i = 0; i < 44; i++) { const a = -Math.PI / 2 + i / 44 * TAU, k = prog(rk * 44, i, i + 1); if (k <= 0) continue; const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        if (lk > 0) { const kk = clamp(lk * 1.5 - i / 44 * 0.5); if (kk > 0) line([[x, y], [lerp(x, cx, kk * 0.72), lerp(y, cy, kk * 0.72)]], 2.5, 'rgba(61,220,132,0.55)'); }
        circ(x, y, 13 * outBack(k), BLUE, 3, INK); }
      const n44 = Math.round(44 * rk); if (rk > 0) txt(`${n44} PAÍSES`, cx, cy - R - 60, 52, { w: 900, stroke: 12, color: BLUE });
      coin(cx, cy, 85, sm(t, s2.dol - 0.3, s2.dol + 0.1, outBack));
      // US$ -> ouro
      const ok = sm(t, s2.our - 0.25, s2.our + 0.1, outBack);
      if (ok > 0) { line([[cx, cy + 90], [cx, cy + 90 + 50 * ok]], 6, GOLD); goldBar(cx, cy + 178, 160, ok); chip('US$ 35 = 1 ONÇA DE OURO', cx, cy + R + 70, 32, GOLD, prog(t, s2.our + 0.1, s2.our + 0.4)); }
      header(); fonte('Federal Reserve History · World Gold Council');
    }
    function scene3(t) {
      drawMap(WORLD, CAM_W, usaGlow(1), 0.25);
      // linha do tempo 1944 -> 1971
      const y = 620, x0 = 140, x1 = 940, lk = sm(t, B[2], s3.set + 0.2);
      line([[x0, y], [lerp(x0, x1, lk), y]], 8, 'rgba(255,255,255,0.35)');
      circ(x0, y, 16, GOLD, 4, INK); txt('1944', x0 + 10, y - 60, 48, { w: 900, color: GOLD });
      const k71 = sm(t, s3.set - 0.2, s3.set + 0.15, outBack); if (k71 > 0) { circ(x1, y, 16 * k71, RED, 4, INK); txt('1971', x1 - 10, y - 60, 48, { w: 900, color: RED, scale: k71 }); }
      txt('US$ trocado por ouro', 540, y + 55, 32, { w: 700, color: MU, a: prog(t, B[2] + 0.2, B[2] + 0.6) });
      // corrente US$ — ouro que quebra
      const cy = 1040, br = sm(t, s3.dei - 0.1, s3.dei + 0.5), sep = 140 * br;
      coin(330 - sep, cy, 110, prog(t, B[2], B[2] + 0.4)); goldBar(750 + sep, cy, 230, prog(t, B[2] + 0.1, B[2] + 0.5));
      if (br < 0.05) line([[440, cy], [635, cy]], 10, GOLD, [26, 14]);
      else { line([[440 - sep, cy], [530 - sep * 0.5, cy]], 10, GOLD, [26, 14]); line([[545 + sep * 0.5, cy], [635 + sep, cy]], 10, GOLD, [26, 14]); txt('×', 540, cy, 140 * outBack(br), { w: 900, color: RED }); }
      chip('FIM DA TROCA POR OURO', 540, 1250, 40, RED, prog(t, s3.our - 0.2, s3.our + 0.15), { tc: WH });
      const mk = sm(t, s3.mas - 0.2, s3.mas + 0.15, outBack); if (mk > 0) { panel(540, 1400, 760, 120, mk, GRN); txt('O MUNDO CONTINUOU COM ELE', 0, 3, 40, { w: 900, color: GRN }); endPanel(); }
      header(); fonte('Federal Reserve History · 15 de agosto de 1971');
    }
    function scene4(t) {
      const cx = 540, cy = 860, R = 300, k = outC(prog(t, s4.hoj + 0.2, s4.cin + 0.6)), v = 56.7 * k;
      txt('RESERVAS DOS BANCOS CENTRAIS', 540, 300, 44, { w: 900, a: prog(t, B[3] + 0.1, B[3] + 0.5) });
      txt('em moeda estrangeira, no mundo', 540, 360, 32, { w: 700, color: MU, a: prog(t, B[3] + 0.3, B[3] + 0.7) });
      const ak = sm(t, B[3], B[3] + 0.5); if (ak > 0) { ga(ak); circ(cx, cy, R, null, 90, 'rgba(255,255,255,0.12)'); ga(1); }
      if (k > 0) { ctx.save(); ctx.shadowColor = GRN; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * v / 100); ctx.lineWidth = 90; ctx.strokeStyle = GRN; ctx.stroke(); ctx.restore(); }
      rtxt(`${dec(v)}%`, cx, cy - 20, 118, { color: GRN, scale: sm(t, s4.hoj, s4.hoj + 0.4, outBack) });
      txt('EM DÓLAR', cx, cy + 80, 48, { w: 900, a: prog(t, s4.res - 0.3, s4.res) });
      const ok = prog(t, s4.dol, s4.dol + 0.4); if (ok > 0) { ga(ok); txt('43,3% outras moedas', 540, cy + R + 110, 34, { w: 700, color: MU }); txt('(euro, iene, libra, yuan e outras)', 540, cy + R + 160, 28, { w: 600, color: MU }); ga(1); }
      chip('HOJE', 540, 450, 34, WH, prog(t, s4.hoj - 0.2, s4.hoj + 0.1), { fill: WH });
      header(); fonte('FMI · COFER · 2º trimestre de 2026');
    }
    function scene5(t) {
      txt('PARTICIPAÇÃO NAS TROCAS DE MOEDA', 540, 300, 40, { w: 900, a: prog(t, B[4], B[4] + 0.4) });
      txt('cada troca tem 2 moedas: a soma passa de 100%', 540, 355, 28, { w: 700, color: MU, a: prog(t, B[4] + 0.2, B[4] + 0.6) });
      const R = [['DÓLAR', 89, GRN, s5.oit], ['EURO', 28.9, BLUE, s5.eur], ['IENE', 16.8, LIL, s5.vin + 0.15]];
      R.forEach(([s, v, c, t0], i) => { const k = outC(prog(t, t0 - 0.25, t0 + 0.6)); if (k <= 0) return; const y = 640 + i * 250, w = 760 * v / 100 * k;
        ga(clamp(k * 3)); txt(s, 80, y - 70, 50, { w: 900, align: 'left', color: c }); rr(80, y - 30, 760, 80, 16); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); rr(80, y - 30, Math.max(w, 10), 80, 16); ctx.fillStyle = c; ctx.fill();
        const lbl = (v % 1 ? dec(v * k) : Math.round(v * k)) + '%'; txt(lbl, Math.min(80 + w + 20, 880), y + 10, 54, { w: 900, align: 'left' }); ga(1); });
      header(); fonte('BIS · Pesquisa Trienal · abril de 2025');
    }
    function scene6(t) {
      const ek = prog(t, s6.mas - 0.2, s6.mas + 0.3);
      drawMap(WORLD, CAM_W, iso => iso === 'USA' ? { fill: GRN, edge: GRN, lw: 2.5, glow: 'rgba(61,220,132,0.6)' } : null, 1 - 0.5 * ek);
      txt('POR TRÁS DISSO', 540, 280, 40, { w: 800, color: MU, a: prog(t, s6.tra - 0.2, s6.tra + 0.2) });
      chip('MAIOR ECONOMIA DO MUNDO', 540, 380, 42, GRN, prog(t, s6.eco - 0.3, s6.eco + 0.1));
      chip('MAIOR MERCADO FINANCEIRO', 540, 490, 42, GRN, prog(t, s6.mer - 0.3, s6.mer + 0.1));
      const pk = sm(t, s6.pai - 0.2, s6.pai + 0.2, outBack);
      if (pk > 0) { panel(540, 1290, 900, 230, pk, GOLD); txt('ALGUNS PAÍSES TENTAM', 0, -55, 50, { w: 900 }); txt('DEPENDER MENOS DO DÓLAR', 0, 15, 50, { w: 900, color: GOLD }); txt('comércio em moeda própria · mais ouro nas reservas', 0, 80, 28, { w: 700, color: MU, a: prog(t, s6.men, s6.men + 0.4) }); endPanel(); }
      header(); fonte('FMI · World Economic Outlook · COFER');
    }
    function scene7(t) {
      drawMap(WORLD, CAM_W, usaGlow(1), 0.3);
      rtxt('O DÓLAR', 540, 400, 110, { color: GRN, scale: sm(t, s7.dol - 0.2, s7.dol + 0.15, outBack) });
      rtxt('CONTINUA NO TOPO?', 540, 520, 82, { color: WH, scale: sm(t, s7.top - 0.3, s7.top + 0.1, outBack) });
      chip('COMENTA AQUI', 540, 680, 46, GRN, prog(t, s7.com - 0.15, s7.com + 0.2));
      const nk = sm(t, s7.ama - 0.2, s7.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 920); ctx.scale(nk, nk); rr(-430, -120, 860, 240, 26); ctx.fillStyle = 'rgba(7,11,20,0.85)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -60, 34, { w: 900, color: MU }); txt('OS 10 EXÉRCITOS', 0, 5, 60, { w: 900 }); txt('MAIS PODEROSOS', 0, 72, 60, { w: 900, color: BLUE, a: prog(t, s7.exe - 0.2, s7.exe + 0.2) }); ctx.restore(); }
      const bk = sm(t, s7.seg - 0.2, s7.seg + 0.2, outBack), press = t > s7.per + 0.1; if (bk > 0) { ctx.save(); ctx.translate(540, 1220); const pr = bk * (1 - 0.06 * pulse(t, s7.per + 0.1, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : GRN; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header();
    }

    // ---------- legendas ----------
    const HL = new Set(['nove', 'dez', 'dolar', 'tanto', 'quarenta', 'quatro', 'ouro', 'setenta', 'um', 'continuou', 'cinquenta', 'sete', 'reservas', 'oitenta', 'euro', 'vinte', 'economia', 'mercado', 'menos', 'topo', 'comenta', 'exercitos', 'poderosos']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1640); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? GRN : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; bg(t);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / 0.15); if (fl > 0) { ctx.globalAlpha = fl * 0.85; ctx.fillStyle = '#04060c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
