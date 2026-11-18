/*
 * AS 10 MAIORES ECONOMIAS — Mindloop "o mundo em mapas e dados" (economia: FMI WEO out/2026, PIB nominal 2026). 9:16, narrado.
 * Mapa: Natural Earth 50m via pipeline/geo_paises.py mundo (lat_ref 0).
 * Neutro: sem bandeiras, sem rostos. Ouro/prata = EUA e China; azul = 3º a 9º; verde-azulado = Brasil.
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
    const s1 = { tri: wt('c1', 'trinta'), dol: wt('c1', 'dolares'), tam: wt('c1', 'tamanho'), mai: wt('c1', 'maior'), que: wt('c1', 'quem'), dez: wt('c1', 'dez') };
    const s2 = { fmi: wt('c2', 'fmi'), doi: wt('c2', 'dois'), est: wt('c2', 'estados'), lid: wt('c2', 'lideram'), chi: wt('c2', 'china'), vin: wt('c2', 'vinte') };
    const s3 = { bem: wt('c3', 'bem'), ale: wt('c3', 'alemanha'), jap: wt('c3', 'japao'), rei: wt('c3', 'reino'), ind: wt('c3', 'india') };
    const s4 = { fec: wt('c4', 'fecham'), top: wt('c4', 'top'), fra: wt('c4', 'franca'), rus: wt('c4', 'russia'), ita: wt('c4', 'italia'), bra: wt('c4', 'brasil'), dec: wt('c4', 'decimo') };
    const s5 = { so: wt('c5', 'so'), est: wt('c5', 'estados'), chi: wt('c5', 'china'), jun: wt('c5', 'juntos'), qua: wt('c5', 'quase'), dob: wt('c5', 'dobro'), oit: wt('c5', 'oito'), som: wt('c5', 'somados') };
    const s6 = { pro: wt('c6', 'projecao'), doi: wt('c6', 'dois'), bra: wt('c6', 'brasil'), oit: wt('c6', 'oitavo'), fre: wt('c6', 'frente'), ita: wt('c6', 'italia'), rus: wt('c6', 'russia') };
    const s7 = { alg: wt('c7', 'alguma'), sur: wt('c7', 'surpreendeu'), com: wt('c7', 'comenta'), ama: wt('c7', 'amanha'), nuc: wt('c7', 'nucleares'), seg: wt('c7', 'segue'), per: wt('c7', 'perder') };

    // ranking FMI (WEO out/2026), PIB nominal 2026 em US$ trilhões
    const TOP = [
      ['USA', 'EUA', 32.642, s2.est], ['CHN', 'CHINA', 21.546, s2.chi],
      ['DEU', 'ALEMANHA', 5.471, s3.ale], ['JPN', 'JAPÃO', 4.342, s3.jap], ['GBR', 'REINO UNIDO', 4.268, s3.rei], ['IND', 'ÍNDIA', 4.060, s3.ind],
      ['FRA', 'FRANÇA', 3.554, s4.fra], ['RUS', 'RÚSSIA', 2.861, s4.rus], ['ITA', 'ITÁLIA', 2.702, s4.ita], ['BRA', 'BRASIL', 2.655, s4.bra]];
    const GREEN = '#3ddc84';
    const colOf = i => (i === 0 ? GOLD : i === 1 ? SILV : i === 9 ? TEAL : BLUE);
    const fmt = v => v.toFixed(2).replace('.', ',');
    const fmt1 = v => v.toFixed(1).replace('.', ',');
    const LBL2 = { USA: [-99, 39], CHN: [104, 34], DEU: [10, 51], JPN: [139, 37], GBR: [-3, 54], IND: [79, 22], FRA: [2, 46.5], RUS: [95, 61], ITA: [13, 42.5], BRA: [-52, -11] };
    // marcadores na Europa ficariam empilhados: desloca o círculo e liga com um fio
    const OFF = { DEU: [40, -50], GBR: [-50, -40], FRA: [-55, 30], ITA: [45, 40] };

    cue(0, 'music', { part: 'intro' }); cue(s1.tri, 'scan', { dur: 1.4, gain: 0.5 }); cue(s1.dol, 'coin', { gain: 0.6 }); cue(s1.dez, 'impact', { gain: 0.8 });
    cue(B[1], 'music', { part: 'groove' }); cue(s2.est, 'tada'); cue(s2.chi, 'pop');
    cue(s3.ale, 'pop'); cue(s3.jap, 'pop'); cue(s3.rei, 'pop'); cue(s3.ind, 'pop');
    cue(s4.fra, 'pop'); cue(s4.rus, 'pop'); cue(s4.ita, 'pop'); cue(s4.bra, 'ding'); cue(s4.dec, 'sparkle');
    cue(s5.est, 'pop'); cue(s5.chi, 'pop'); cue(s5.qua - 0.3, 'riser', { dur: 0.6 }); cue(s5.dob, 'stamp', { gain: 0.6 });
    cue(s6.bra, 'impact', { gain: 0.6 }); cue(s6.oit, 'ding'); cue(s6.fre, 'sparkle');
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.nuc, 'whoosh', { dur: 0.4 }); cue(s7.per + 0.1, 'tap'); cue(s7.per + 0.15, 'success');
    for (const k of [1, 4, 5, 6]) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    const FONTE = 'FMI · World Economic Outlook, out/2026 · PIB nominal 2026 (estimativa)';
    function scene1(t) {
      const gk = prog(t, s1.tri - 0.1, s1.dol + 0.2);
      drawMap(WORLD, CAM_FULL, iso => iso === 'USA' && gk > 0 ? { fill: `rgba(245,197,66,${0.85 * gk})`, edge: WH, lw: 2 + 2 * pulse(t, s1.mai), glow: gk > 0.5 ? 'rgba(245,197,66,0.7)' : null } : null);
      const n = 32.6 * outC(prog(t, s1.tri - 0.1, s1.dol + 0.3));
      rtxt(`US$ ${fmt1(n)}`, 540, 390, 170, { color: GOLD, glow: 'rgba(245,197,66,0.55)', scale: sm(t, 0.05, 0.4, outBack) });
      txt('TRILHÕES', 540, 525, 64, { w: 900, stroke: 14, a: prog(t, s1.dol - 0.3, s1.dol) });
      chip('O PIB DOS EUA EM 2026', 540, 630, 40, AMB, prog(t, s1.tam - 0.2, s1.mai + 0.1));
      const qk = sm(t, s1.que - 0.2, s1.que + 0.15, outBack);
      if (qk > 0) { panel(540, 1330, 900, 230, qk, GOLD); txt('QUEM SÃO AS', 0, -50, 64, { w: 900 }); txt('10 MAIORES?', 0, 40, 88, { w: 900, color: GOLD, scale: 1 + 0.08 * pulse(t, s1.dez) }); endPanel(); }
      header(); fonte('FMI · World Economic Outlook, outubro de 2026');
    }
    function rankView(t) {
      const ap = TOP.map(r => prog(t, r[3] - 0.2, r[3] + 0.2));
      const sty = {}; TOP.forEach((r, i) => (sty[r[0]] = i));
      drawMap(WORLD, CAM_W, iso => { const i = sty[iso]; if (i === undefined || ap[i] <= 0) return null; const c = colOf(i), fresh = pulse(t, TOP[i][3], 0.08, 0.6); return { fill: c, edge: WH, lw: 1.5 + 3 * fresh, glow: fresh > 0.2 ? c : null }; });
      TOP.forEach((r, i) => { if (ap[i] <= 0) return; const lb = LBL2[r[0]]; let [x, y] = ll(CAM_W, lb[0], lb[1]); const o = OFF[r[0]]; const k = outBack(ap[i]);
        if (o) { ga(clamp(ap[i] * 2)); line([[x, y], [x + o[0], y + o[1]]], 3, WH); circ(x, y, 5, WH); ga(1); x += o[0]; y += o[1]; }
        ctx.save(); ctx.translate(x, y); ctx.scale(k, k); circ(0, 0, 22, colOf(i), 3, INK); txt(String(i + 1), 0, 2, 24, { w: 900, color: INK }); ctx.restore(); });
      const y0 = 965, dy = 62, BX = 400, BW = 470;
      TOP.forEach((r, i) => { const k = ap[i]; if (k <= 0) return; const y = y0 + i * dy, bw = BW * (r[2] / TOP[0][2]) * outC(k);
        const hot = pulse(t, r[3], 0.08, 0.8); ga(clamp(k * 2));
        if (hot > 0.05) { rr(40, y - 28, 1000, 56, 14); ctx.fillStyle = `rgba(255,255,255,${0.08 * hot})`; ctx.fill(); }
        txt(`${i + 1}º`, 95, y + 2, 34, { w: 900, color: colOf(i), align: 'right' });
        txt(r[1], 118, y + 2, 34, { w: 900, align: 'left', color: i === 9 ? TEAL : WH });
        rr(BX, y - 20, Math.max(bw, 8), 40, 10); ctx.fillStyle = colOf(i); ctx.fill();
        txt(fmt(r[2]), BX + Math.max(bw, 8) + 14, y + 2, 30, { w: 800, color: i < 2 ? WH : MU, align: 'left' }); ga(1); });
      ga(prog(t, s2.fmi - 0.2, s2.fmi + 0.3)); txt('PIB 2026 · US$ TRILHÕES', 540, 905, 34, { w: 900, color: MU }); ga(1);
    }
    function scene2(t) { rankView(t); chip('RANKING DO FMI', 540, 230, 36, WH, prog(t, s2.fmi - 0.2, s2.doi + 0.2), { fill: WH }); header(); fonte(FONTE); }
    function scene3(t) { rankView(t); chip('RANKING DO FMI', 540, 230, 36, WH, 1, { fill: WH }); header(); fonte(FONTE); }
    function scene4(t) { rankView(t); chip('RANKING DO FMI', 540, 230, 36, WH, 1, { fill: WH }); header(); fonte(FONTE);
      const dk = sm(t, s4.dec - 0.2, s4.dec + 0.15, outBack); if (dk > 0) chip('BRASIL: 10º', 820, 1523, 34, TEAL, dk); }
    function scene5(t) {
      drawMap(WORLD, CAM_FULL, iso => { const i = TOP.findIndex(r => r[0] === iso); if (i < 0) return null; const a = i < 2 ? prog(t, i ? s5.chi - 0.2 : s5.est - 0.2, (i ? s5.chi : s5.est) + 0.2) : prog(t, s5.qua - 0.2, s5.oit + 0.3); return a > 0 ? { fill: i < 2 ? colOf(i) : BLUE, edge: WH, lw: 1.5 } : null; }, 0.55);
      rtxt('SÓ OS 2 PRIMEIROS', 540, 330, 76, { color: WH, scale: sm(t, s5.so - 0.2, s5.so + 0.15, outBack) });
      // duas barras empilhadas
      { const pk = prog(t, s5.est - 0.4, s5.est); if (pk > 0) { ga(pk * 0.92); rr(50, 580, 980, 480, 28); ctx.fillStyle = 'rgba(7,11,20,0.92)'; ctx.fill(); ga(1); } }
      const X0 = 90, XW = 900, SC = XW / 56;
      const k1 = sm(t, s5.est - 0.2, s5.jun + 0.2), y1 = 720;
      if (k1 > 0) { ga(clamp(k1 * 3)); txt('EUA + CHINA', X0, y1 - 75, 44, { w: 900, align: 'left', color: GOLD });
        const wA = 32.642 * SC * outC(prog(t, s5.est - 0.2, s5.est + 0.4)), wB = 21.546 * SC * outC(prog(t, s5.chi - 0.2, s5.chi + 0.4));
        rr(X0, y1 - 45, Math.max(wA, 1), 90, 14); ctx.fillStyle = GOLD; ctx.fill(); if (wB > 1) { rr(X0 + wA + 4, y1 - 45, wB, 90, 14); ctx.fillStyle = SILV; ctx.fill(); }
        if (wA > 200) txt('EUA', X0 + 24, y1 + 2, 38, { w: 900, color: INK, align: 'left' }); if (wB > 200) txt('CHINA', X0 + wA + 28, y1 + 2, 38, { w: 900, color: INK, align: 'left' });
        txt('54,2', X0 + XW, y1 - 75, 52, { w: 900, align: 'right', a: prog(t, s5.jun - 0.2, s5.jun + 0.2) }); ga(1); }
      const k2 = prog(t, s5.qua - 0.3, s5.oit + 0.2), y2 = 960;
      if (k2 > 0) { ga(clamp(k2 * 3)); txt('OS OUTROS 8 SOMADOS', X0, y2 - 75, 44, { w: 900, align: 'left', color: BLUE });
        let x = X0; TOP.slice(2).forEach((r, j) => { const w = r[2] * SC * outC(clamp(k2 * 1.6 - j * 0.08)); if (w <= 0) return; rr(x, y2 - 45, w, 90, 8); ctx.fillStyle = j === 7 ? TEAL : (j % 2 ? '#4a9be0' : BLUE); ctx.fill(); x += w + 3; });
        txt('29,9', X0 + XW, y2 - 75, 52, { w: 900, align: 'right', a: prog(t, s5.oit - 0.2, s5.oit + 0.2) }); ga(1); }
      const dk = sm(t, s5.dob - 0.2, s5.dob + 0.15, outBack);
      if (dk > 0) { panel(540, 1290, 860, 200, dk, GOLD); txt('QUASE O DOBRO', 0, -30, 76, { w: 900, color: GOLD }); txt('54,2 × 29,9 trilhões de dólares', 0, 48, 34, { w: 700, color: MU }); endPanel(); }
      header(); fonte(FONTE);
    }
    const CAM_BR = box(WORLD, -84, -30, -40, 8);
    function scene6(t) {
      const cam = mix(CAM_FULL, CAM_BR, sm(t, B[5], B[5] + 1.0)), bk = prog(t, s6.bra - 0.2, s6.bra + 0.2);
      drawMap(WORLD, cam, iso => iso === 'BRA' && bk > 0 ? { fill: TEAL, edge: WH, lw: 3 + 3 * pulse(t, s6.oit), glow: 'rgba(46,196,182,0.8)' } : null, 0.75);
      rtxt('E EM 2027?', 540, 300, 96, { color: WH, scale: sm(t, B[5] + 0.1, B[5] + 0.45, outBack) });
      chip('PROJEÇÃO DO FMI', 540, 420, 38, AMB, prog(t, s6.pro - 0.2, s6.pro + 0.2));
      // mini ranking: troca de posições 10º -> 8º
      const sw = sm(t, s6.oit - 0.5, s6.oit + 0.4);
      const L26 = [['RÚSSIA', 2.861, BLUE], ['ITÁLIA', 2.702, BLUE], ['BRASIL', 2.655, TEAL]], L27 = { 'BRASIL': [0, 2.796], 'ITÁLIA': [1, 2.772], 'RÚSSIA': [2, 2.675] };
      const pk = sm(t, s6.doi - 0.3, s6.doi + 0.2, outBack);
      if (pk > 0) { panel(540, 1250, 900, 430, pk, null);
        txt(sw < 0.5 ? 'RANKING 2026' : 'PROJEÇÃO 2027', 0, -172, 30, { w: 900, color: sw < 0.5 ? MU : AMB });
        L26.forEach(([n, v, c], i0) => { const [i1, v1] = L27[n], yy = lerp(-100 + i0 * 110, -100 + i1 * 110, sw), pos = Math.round(lerp(8 + i0, 8 + i1, sw)), val = lerp(v, v1, sw), isB = n === 'BRASIL';
          rr(-410, yy - 44, 820, 88, 18); ctx.fillStyle = isB ? 'rgba(46,196,182,0.18)' : 'rgba(255,255,255,0.05)'; ctx.fill(); if (isB) { ctx.lineWidth = 4; ctx.strokeStyle = TEAL; ctx.stroke(); }
          txt(`${pos}º`, -340, yy + 3, 52, { w: 900, color: isB ? TEAL : MU }); txt(n, -260, yy + 3, 50, { w: 900, align: 'left', color: isB ? TEAL : WH }); txt(fmt(val), 380, yy + 3, 48, { w: 800, align: 'right', color: isB ? WH : MU }); });
        endPanel(); }
      const lk = sm(t, s6.fre - 0.2, s6.fre + 0.15, outBack); if (lk > 0) chip('BRASIL SOBE PARA 8º', 540, 1530, 40, TEAL, lk);
      header(); fonte('FMI · WEO out/2026 · projeção para 2027, US$ trilhões');
    }
    function scene7(t) {
      drawMap(WORLD, CAM_FULL, iso => { const i = TOP.findIndex(r => r[0] === iso); return i >= 0 ? { fill: colOf(i) } : null; }, 0.35);
      rtxt('ALGUMA POSIÇÃO', 540, 400, 92, { color: WH, scale: sm(t, s7.alg - 0.2, s7.alg + 0.15, outBack) });
      rtxt('TE SURPREENDEU?', 540, 510, 92, { color: GOLD, scale: sm(t, s7.sur - 0.2, s7.sur + 0.15, outBack) });
      chip('COMENTA AQUI', 540, 670, 46, GOLD, prog(t, s7.com - 0.15, s7.com + 0.2));
      const nk = sm(t, s7.ama - 0.2, s7.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 920); ctx.scale(nk, nk); rr(-430, -120, 860, 240, 26); ctx.fillStyle = 'rgba(7,11,20,0.85)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -60, 34, { w: 900, color: MU }); txt('OS PAÍSES COM', 0, 5, 60, { w: 900 }); txt('ARMAS NUCLEARES', 0, 72, 60, { w: 900, color: BLUE, a: prog(t, s7.nuc - 0.3, s7.nuc + 0.1) }); ctx.restore(); }
      const bk = sm(t, s7.seg - 0.2, s7.seg + 0.2, outBack), press = t > s7.per + 0.1; if (bk > 0) { ctx.save(); ctx.translate(540, 1220); const pr = bk * (1 - 0.06 * pulse(t, s7.per + 0.1, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : GOLD; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header();
    }

    // ---------- legendas ----------
    const HL = new Set(['trinta', 'dois', 'trilhoes', 'dolares', 'maior', 'dez', 'maiores', 'fmi', 'estados', 'unidos', 'china', 'segundo', 'vinte', 'um', 'alemanha', 'japao', 'reino', 'unido', 'india', 'franca', 'russia', 'italia', 'brasil', 'decimo', 'dobro', 'oito', 'oitavo', 'surpreendeu', 'comenta', 'nucleares']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1660); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
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
