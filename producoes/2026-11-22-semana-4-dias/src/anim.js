/*
 * SEMANA DE 4 DIAS — Mindloop MODO DEBATE (22/11/2026). 9:16, narrado.
 * Lado A (a favor) = vermelho, Lado B (contra) = azul, dado que incomoda os dois = âmbar.
 * Mapa: Natural Earth via pipeline/geo_paises.py (-75 -33 -35 6). Sem rostos, sem nomes de políticos.
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
  const AMB = '#f2b84b', WH = '#f3f5fa', MU = '#8a95ad', RED = '#ff4d5e', BLUE = '#5fb4ff';

  function create(TL, env) {
    const GEO = env.paises || require('../assets/paises.json');
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
    function panel(x, y, w, h, k, col, fill) { const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); rr(-w / 2, -h / 2, w, h, 26); ctx.fillStyle = fill || 'rgba(7,11,20,0.9)'; ctx.fill(); if (col) { ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); } }
    const endPanel = () => { ctx.restore(); ga(1); };
    function stamp(s, x, y, k, col, size = 76) { if (k <= 0) return; const sc = lerp(2.2, 1, outC(k)), w = tw(s, size, 900) + 60, h = size * 1.45; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(sc, sc); ga(clamp(k * 3)); rr(-w / 2, -h / 2, w, h, 14); ctx.fillStyle = 'rgba(7,11,20,0.92)'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = col; ctx.stroke(); txt(s, 0, 4, size, { w: 900, color: col }); ctx.restore(); ga(1); }
    function bg(t) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(95,180,255,0.05)'; ctx.lineWidth = 2; const off = (t * 20) % 80; for (let x = -80 + off; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -80 + off; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    function header(s = 'DEBATE DO DIA') { ga(0.9); const w = tw(s, 26, 800) + 70; rr(540 - w / 2, 110, w, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); txt(s, 540, 141, 26, { w: 800, color: MU }); ga(1); }
    function fonte(s) { txt(s, 540, 1800, 24, { w: 600, color: 'rgba(255,255,255,0.45)' }); }
    // barra dos lados (A vermelho x B azul), side = 'A' | 'B'
    function sides(side, k) { if (k <= 0) return; ga(clamp(k * 2)); const y = 200, h = 96;
      rr(40, y, 492, h, 20); ctx.fillStyle = side === 'A' ? RED : 'rgba(255,77,94,0.16)'; ctx.fill();
      rr(548, y, 492, h, 20); ctx.fillStyle = side === 'B' ? BLUE : 'rgba(95,180,255,0.16)'; ctx.fill();
      txt('LADO A · A FAVOR', 286, y + h / 2 + 2, 36, { w: 900, color: side === 'A' ? INK : 'rgba(255,77,94,0.7)' });
      txt('LADO B · CONTRA', 794, y + h / 2 + 2, 36, { w: 900, color: side === 'B' ? INK : 'rgba(95,180,255,0.7)' }); ga(1); }

    // ---------- mapa ----------
    const box = (lo0, lo1, la0, la1, R) => { const K = Math.cos(GEO.lat_ref * Math.PI / 180), x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(R[2] / (x1 - x0), R[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, K, R }; };
    function drawMap(cam, style, a = 1) {
      const R = cam.R; ctx.save(); ga(a); ctx.beginPath(); ctx.rect(R[0], R[1], R[2], R[3]); ctx.clip();
      ctx.translate(R[0] + R[2] / 2, R[1] + R[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      for (const p of GEO.paises) { const st = style(p.iso) || {}; ctx.beginPath(); for (const pl of p.poly) { pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
        if (st.glow) { ctx.save(); ctx.shadowColor = st.glow; ctx.shadowBlur = 50; ctx.fillStyle = st.fill; ctx.fill(); ctx.restore(); }
        ctx.fillStyle = st.fill || LAND; ctx.fill(); ctx.lineWidth = (st.lw || 1.4) / cam.s; ctx.strokeStyle = st.edge || EDGE; ctx.stroke(); }
      ctx.restore(); ga(1); }
    const CAM1 = box(-26, 4, 49, 67, [0, 300, W, 1300]);
    const CAM2 = box(-11, 3, 49.5, 61.2, [30, 330, 500, 880]);
    const CAM4 = box(-25, -12, 63, 67, [50, 330, 980, 470]);
    const GREEN = '#3ddc84';

    // ---------- tempos ----------
    const s1 = { qua: wt('c1', 'quatro'), mes: wt('c1', 'mesmo'), son: wt('c1', 'sonho'), con: wt('c1', 'conta'), fec: wt('c1', 'fecha') };
    const s2 = { rei: wt('c2', 'reino'), ses: wt('c2', 'sessenta'), emp: wt('c2', 'empresas'), tre: wt('c2', 'tres'), qua: wt('c2', 'quatro'), sal: wt('c2', 'salario') };
    const s3 = { fav: wt('c3', 'favor'), cin: wt('c3', 'cinquenta', 0), ses: wt('c3', 'sessenta'), man: wt('c3', 'mantiveram'), ped: wt('c3', 'pedidos'), cin2: wt('c3', 'cinquenta', 1), rec: wt('c3', 'receita'), est: wt('c3', 'estavel') };
    const s4 = { isl: wt('c4', 'islandia'), qui: wt('c4', 'quinze'), dez: wt('c4', 'dezenove'), qnh: wt('c4', 'quinhentos'), pro: wt('c4', 'produtividade'), ott: wt('c4', 'oitenta'), jor: wt('c4', 'jornada') };
    const s5 = { con: wt('c5', 'contra'), qui: wt('c5', 'quiseram'), peq: wt('c5', 'pequenas'), hos: wt('c5', 'hospital'), fab: wt('c5', 'fabrica'), com: wt('c5', 'comercio'), ctr: wt('c5', 'contratar') };
    const s6 = { dad: wt('c6', 'dado'), dez: wt('c6', 'dezoito'), ses: wt('c6', 'sessenta'), per: wt('c6', 'permanente'), ins: wt('c6', 'inscreveram') };
    const s7 = { voc: wt('c7', 'voce'), ou: wt('c7', 'ou'), com: wt('c7', 'comenta'), mar: wt('c7', 'marca'), dis: wt('c7', 'discordar'), ama: wt('c7', 'amanha'), ia: wt('c7', 'inteligencia'), emp: wt('c7', 'emprego'), seg: wt('c7', 'segue'), per: wt('c7', 'perder') };

    cue(0, 'music', { part: 'intro' }); cue(s1.qua, 'impact', { gain: 0.8 }); cue(s1.son, 'pop'); cue(s1.con, 'pop'); cue(s1.fec + 0.2, 'stamp', { gain: 0.5 });
    cue(B[1], 'music', { part: 'groove' }); cue(s2.rei, 'scan', { dur: 0.8, gain: 0.5 }); cue(s2.ses, 'stamp', { gain: 0.6 }); cue(s2.tre, 'pop'); cue(s2.qua, 'tick', { dur: 0.3 }); cue(s2.sal, 'coin', { gain: 0.6 });
    cue(s3.fav, 'swoosh'); for (let i = 0; i < 8; i++) cue(s3.cin + 0.15 + i * 0.12, 'tick', { dur: 0.1, gain: 0.35 }); cue(s3.man, 'ding'); cue(s3.ped, 'swoosh'); cue(s3.cin2, 'stamp', { gain: 0.6 }); cue(s3.est, 'lock');
    cue(s4.isl, 'scan', { dur: 0.8, gain: 0.5 }); cue(s4.qnh, 'pop'); cue(s4.pro, 'ding'); cue(s4.ott, 'impact', { gain: 0.6 });
    cue(s5.con, 'swoosh'); cue(s5.qui, 'pop'); cue(s5.peq, 'pop'); cue(s5.hos, 'pop'); cue(s5.ctr, 'stamp', { gain: 0.6 });
    cue(s6.dad, 'scratch'); cue(s6.dez, 'impact', { gain: 0.7 }); cue(s6.ins, 'stamp', { gain: 0.6 });
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.ama, 'whoosh', { dur: 0.4 }); cue(s7.per + 0.1, 'tap'); cue(s7.per + 0.15, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // grade de 61 empresas
    function dots(t, y0, tStart, tEnd, litN, litCol, o = {}) {
      for (let i = 0; i < 61; i++) { const c = i % 10, r = Math.floor(i / 10), x = 135 + c * 90, y = y0 + r * 86, k = sm(t, tStart + i * 0.012, tStart + i * 0.012 + 0.25, outBack); if (k <= 0) continue;
        const on = i < litN && t >= lerp(tStart, tEnd, i / Math.max(1, litN)); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); circ(0, 0, 32, on ? litCol : 'rgba(255,255,255,0.10)', 4, on ? WH : 'rgba(255,255,255,0.22)'); ctx.restore(); } }

    // ---------- cenas ----------
    function scene1(t) {
      drawMap(CAM1, iso => (iso === 'GBR' || iso === 'ISL') ? { fill: 'rgba(242,184,75,0.22)', edge: 'rgba(242,184,75,0.7)', lw: 2.5 } : null, 0.5);
      ctx.fillStyle = 'rgba(7,11,20,0.4)'; ctx.fillRect(0, 0, W, H);
      chip('DEBATE DO DIA', 540, 300, 36, AMB, prog(t, 0.05, 0.35));
      rtxt('TRABALHAR', 540, 440, 100, { scale: sm(t, s1.qua - 0.4, s1.qua - 0.1, outBack) });
      rtxt('4 DIAS', 540, 590, 170, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s1.qua - 0.25, s1.qua + 0.1, outBack) });
      rtxt('GANHANDO O MESMO', 540, 740, 66, { scale: sm(t, s1.mes - 0.25, s1.mes + 0.1, outBack) });
      const ak = sm(t, s1.son - 0.25, s1.son + 0.1, outBack), bk = sm(t, s1.con - 0.25, s1.con + 0.1, outBack);
      if (ak > 0) { panel(278, 1050, 450, 330, ak, null, RED); txt('SONHO', 0, -60, 66, { w: 900, color: INK }); txt('POSSÍVEL', 0, 25, 66, { w: 900, color: INK }); txt('LADO A', 0, 115, 32, { w: 800, color: 'rgba(7,11,20,0.7)' }); endPanel(); }
      if (bk > 0) { panel(802, 1050, 450, 330, bk, null, BLUE); txt('CONTA QUE', 0, -60, 60, { w: 900, color: INK }); txt('NÃO FECHA', 0, 25, 62, { w: 900, color: INK }); txt('LADO B', 0, 115, 32, { w: 800, color: 'rgba(7,11,20,0.7)' }); endPanel(); }
      const vk = sm(t, s1.con - 0.4, s1.con - 0.1, outBack); if (vk > 0) { ctx.save(); ctx.translate(540, 1050); ctx.scale(vk, vk); circ(0, 0, 62, WH, 6, INK); txt('OU', 0, 3, 42, { w: 900, color: INK }); ctx.restore(); }
      const qk = sm(t, s1.fec, s1.fec + 0.3, outBack); if (qk > 0) chip('VOCÊ ESCOLHE', 540, 1330, 44, WH, qk, { fill: WH });
      header('O ASSUNTO QUE DIVIDE O BRASIL');
    }
    function scene2(t) {
      const mk = prog(t, B[1], B[1] + 0.4);
      drawMap(CAM2, iso => iso === 'GBR' ? { fill: `rgba(242,184,75,${0.15 + 0.6 * prog(t, s2.rei - 0.1, s2.rei + 0.5)})`, edge: WH, lw: 2.5, glow: t > s2.rei + 0.3 ? 'rgba(242,184,75,0.6)' : null } : null, 0.95 * mk);
      chip('REINO UNIDO · 2022', 540, 260, 38, WH, sm(t, s2.rei - 0.2, s2.rei + 0.15, outBack), { fill: WH });
      const k1 = sm(t, s2.ses - 0.25, s2.ses + 0.1, outBack), n1 = 61 * outC(prog(t, s2.ses - 0.2, s2.emp + 0.2));
      if (k1 > 0) { ctx.save(); ctx.translate(790, 470); ctx.scale(k1, k1); txt(String(Math.round(n1)), 0, 0, 190, { w: 900, color: AMB }); txt('EMPRESAS', 0, 110, 44, { w: 900, color: WH }); ctx.restore(); }
      const k2 = sm(t, s2.tre - 0.25, s2.tre + 0.1, outBack), n2 = 2900 * outC(prog(t, s2.tre - 0.2, s2.tre + 0.6));
      if (k2 > 0) { ctx.save(); ctx.translate(790, 760); ctx.scale(k2, k2); txt('~' + String(Math.round(n2 / 10) * 10).replace(/\B(?=(\d{3})+(?!\d))/g, '.'), 0, 0, 120, { w: 900, color: WH }); txt('PESSOAS', 0, 85, 44, { w: 900, color: MU }); ctx.restore(); }
      const k3 = sm(t, s2.qua - 0.25, s2.qua + 0.1, outBack);
      if (k3 > 0) { ctx.save(); ctx.translate(540, 1160); ctx.scale(k3, k3); ga(clamp(k3 * 2)); const D = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
        D.forEach((d, i) => { const x = (i - 2) * 190, work = i < 4; rr(x - 80, -80, 160, 160, 24); ctx.fillStyle = work ? AMB : 'rgba(255,255,255,0.12)'; ctx.fill(); txt(d, x, -10, 46, { w: 900, color: work ? INK : MU }); txt(work ? 'TRAB.' : 'FOLGA', x, 40, 26, { w: 800, color: work ? 'rgba(7,11,20,0.7)' : MU }); });
        ctx.restore(); }
      const k4 = sm(t, s2.sal - 0.25, s2.sal + 0.1, outBack); if (k4 > 0) chip('100% DO SALÁRIO · 80% DAS HORAS', 540, 1390, 40, GREEN, k4);
      header(); fonte('Autonomy / 4 Day Week Global / Cambridge / Boston College · jun-dez/2022');
    }
    function scene3(t) {
      sides('A', prog(t, B[2], B[2] + 0.3));
      chip('DAS 61 EMPRESAS DO TESTE', 540, 360, 34, WH, prog(t, s3.fav, s3.fav + 0.3), { fill: WH });
      dots(t, 450, s3.fav + 0.1, s3.man + 0.2, 56, RED);
      const nk = sm(t, s3.cin - 0.1, s3.cin + 0.2, outBack), n = 56 * outC(prog(t, s3.cin - 0.1, s3.ses + 0.1));
      rtxt(`${Math.round(n)} DE 61`, 540, 1130, 130, { color: RED, glow: 'rgba(255,77,94,0.5)', scale: nk });
      chip('MANTIVERAM A SEMANA DE 4 DIAS', 540, 1235, 34, RED, prog(t, s3.man - 0.1, s3.man + 0.25));
      const pk = sm(t, s3.ped - 0.2, s3.ped + 0.15, outBack), p2 = sm(t, s3.rec - 0.2, s3.rec + 0.15, outBack);
      if (pk > 0) { panel(290, 1420, 470, 200, pk, RED); txt('−' + Math.round(57 * outC(prog(t, s3.cin2 - 0.1, s3.cin2 + 0.5))) + '%', 0, -30, 88, { w: 900, color: RED }); txt('PEDIDOS DE DEMISSÃO', 0, 55, 28, { w: 900, color: MU }); endPanel(); }
      if (p2 > 0) { panel(790, 1420, 470, 200, p2, GREEN); txt('ESTÁVEL', 0, -30, 76, { w: 900, color: GREEN }); txt('RECEITA (+1,4% EM MÉDIA)', 0, 55, 26, { w: 900, color: MU }); endPanel(); }
      header(); fonte('Autonomy · Cambridge · Boston College (fev/2023) · NPR');
    }
    function scene4(t) {
      sides('A', 1);
      drawMap(CAM4, iso => iso === 'ISL' ? { fill: `rgba(255,77,94,${0.2 + 0.6 * prog(t, s4.isl - 0.1, s4.isl + 0.5)})`, edge: WH, lw: 2.5, glow: t > s4.isl + 0.3 ? 'rgba(255,77,94,0.6)' : null } : null, 0.95);
      chip('ISLÂNDIA', 540, 390, 40, WH, sm(t, s4.isl - 0.2, s4.isl + 0.15, outBack), { fill: WH });
      const k = sm(t, s4.qui - 0.2, s4.qui + 0.1, outBack); if (k > 0) chip('2015 A 2019', 540, 870, 40, AMB, k);
      const k2 = sm(t, s4.qnh - 0.25, s4.qnh + 0.1, outBack); if (k2 > 0) { ctx.save(); ctx.translate(540, 1000); ctx.scale(k2, k2); txt('~2.500 TRABALHADORES', 0, 0, 52, { w: 900, color: WH }); ctx.restore(); }
      const k3 = sm(t, s4.pro - 0.25, s4.pro + 0.1, outBack); if (k3 > 0) { panel(540, 1130, 900, 120, k3, GREEN); txt('PRODUTIVIDADE IGUAL OU MAIOR', 0, 4, 44, { w: 900, color: GREEN }); endPanel(); }
      const k4 = sm(t, s4.ott - 0.25, s4.ott + 0.1, outBack), n = 86 * outC(prog(t, s4.ott - 0.2, s4.ott + 0.5));
      rtxt(`${Math.round(n)}%`, 540, 1330, 150, { color: RED, glow: 'rgba(255,77,94,0.5)', scale: k4 });
      txt('HOJE JÁ TÊM JORNADA MENOR OU O DIREITO A ELA', 540, 1440, 30, { w: 800, color: MU, a: prog(t, s4.jor - 0.2, s4.jor + 0.2) });
      header(); fonte('Alda / Autonomy (2021) · testes de 2015 a 2019');
    }
    function scene5(t) {
      sides('B', prog(t, B[4], B[4] + 0.3));
      const items = [[s5.qui, 'ENTRARAM PORQUE QUISERAM', 'AUTOSSELEÇÃO: SÓ QUEM QUIS PARTICIPOU', 'vol'], [s5.peq, 'EM SUA MAIORIA PEQUENAS', 'EQUIPES MENORES, MAIS FÁCEIS DE ADAPTAR', 'peq']];
      items.forEach(([t0, a, b, ic], i) => { const k = sm(t, t0 - 0.25, t0 + 0.1, outBack); if (k <= 0) return; panel(540, 450 + i * 200, 960, 170, k, BLUE); txt(a, 0, -26, 48, { w: 900, color: BLUE }); txt(b, 0, 36, 28, { w: 700, color: MU }); endPanel(); });
      // turnos: semana de 7 dias com vaga a cobrir
      const hk = sm(t, s5.hos - 0.3, s5.hos + 0.1, outBack);
      if (hk > 0) { ga(clamp(hk * 2)); txt('NÃO PODEM PARAR UM DIA:', 540, 880, 40, { w: 900, color: WH });
        [['HOSPITAL', s5.hos], ['FÁBRICA', s5.fab], ['COMÉRCIO', s5.com]].forEach(([n, t0], i) => { const k = sm(t, t0 - 0.2, t0 + 0.1, outBack); if (k <= 0) return; chip(n, 190 + i * 350, 990, 38, BLUE, k); });
        ga(1); }
      const wk = prog(t, s5.com, s5.com + 0.5);
      if (wk > 0) { ga(wk); const D = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
        D.forEach((d, i) => { const x = 135 + i * 135, vago = i === 4; rr(x - 55, 1100, 110, 110, 18); ctx.fillStyle = vago ? 'transparent' : 'rgba(255,255,255,0.14)'; ctx.fill(); if (vago) { ctx.setLineDash([10, 8]); ctx.lineWidth = 5; ctx.strokeStyle = RED; ctx.stroke(); ctx.setLineDash([]); } txt(d, x, 1155, 36, { w: 900, color: vago ? RED : WH }); });
        ga(1); }
      const ck = prog(t, s5.ctr - 0.1, s5.ctr + 0.3); if (ck > 0) { stamp('CONTRATAR MAIS GENTE', 540, 1330, ck, BLUE, 62); txt('para cobrir o dia a menos', 540, 1440, 32, { w: 700, color: MU, a: prog(t, s5.ctr + 0.3, s5.ctr + 0.6) }); }
      header(); fonte('Crítica comum aos pilotos · autosseleção das empresas participantes');
    }
    function scene6(t) {
      const hk = sm(t, s6.dad - 0.2, s6.dad + 0.15, outBack);
      if (hk > 0) { ga(clamp(hk * 2)); rr(40, 200, 1000, 96, 20); const g = ctx.createLinearGradient(40, 0, 1040, 0); g.addColorStop(0, RED); g.addColorStop(1, BLUE); ctx.fillStyle = g; ctx.fill(); txt('O DADO QUE INCOMODA OS DOIS', 540, 250, 40, { w: 900, color: INK }); ga(1); }
      dots(t, 400, s6.dad, s6.per + 0.3, 18, AMB);
      const nk = sm(t, s6.dez - 0.25, s6.dez + 0.1, outBack), n = 18 * outC(prog(t, s6.dez - 0.2, s6.dez + 0.4));
      rtxt(`${Math.round(n)} DE 61`, 540, 1080, 150, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: nk });
      chip('TORNARAM PERMANENTE', 540, 1200, 40, AMB, prog(t, s6.per - 0.15, s6.per + 0.2));
      stamp('TODAS SE INSCREVERAM SOZINHAS', 540, 1370, prog(t, s6.ins - 0.1, s6.ins + 0.25), WH, 46);
      txt('ninguém sabe ainda se funciona para todo mundo', 540, 1500, 30, { w: 700, color: MU, a: prog(t, s6.ins + 0.4, s6.ins + 0.7) });
      header(); fonte('Autonomy / 4 Day Week Global · relatório final do piloto (2023)');
    }
    function scene7(t) {
      rtxt('E VOCÊ?', 540, 340, 120, { color: WH, scale: sm(t, s7.voc - 0.2, s7.voc + 0.15, outBack) });
      const ak = sm(t, s7.ou - 0.1, s7.ou + 0.2, outBack), bk = sm(t, s7.ou + 0.1, s7.ou + 0.4, outBack);
      if (ak > 0) { panel(285, 610, 470, 260, ak, null, RED); txt('A', 0, -60, 90, { w: 900, color: INK }); txt('4 DIAS JÁ', 0, 50, 56, { w: 900, color: INK }); endPanel(); }
      if (bk > 0) { panel(795, 610, 470, 260, bk, null, BLUE); txt('B', 0, -60, 90, { w: 900, color: INK }); txt('NÃO FECHA', 0, 50, 56, { w: 900, color: INK }); endPanel(); }
      chip('COMENTA: A OU B?', 540, 820, 46, AMB, prog(t, s7.com - 0.15, s7.com + 0.2));
      chip('MARCA QUEM VAI DISCORDAR', 540, 940, 38, WH, prog(t, s7.mar - 0.15, s7.mar + 0.2), { fill: WH });
      const nk = sm(t, s7.ama - 0.2, s7.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 1140); ctx.scale(nk, nk); rr(-450, -110, 900, 220, 26); ctx.fillStyle = 'rgba(7,11,20,0.85)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -55, 34, { w: 900, color: MU }); txt('A IA VAI TIRAR', 0, 5, 56, { w: 900, color: AMB, a: prog(t, s7.ia - 0.3, s7.ia + 0.1) }); txt('O SEU EMPREGO?', 0, 70, 56, { w: 900, color: AMB, a: prog(t, s7.emp - 0.3, s7.emp + 0.1) }); ctx.restore(); }
      const bk2 = sm(t, s7.seg - 0.2, s7.seg + 0.2, outBack), press = t > s7.per + 0.1; if (bk2 > 0) { ctx.save(); ctx.translate(540, 1400); const pr = bk2 * (1 - 0.06 * pulse(t, s7.per + 0.1, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header('TODO DIA UM ASSUNTO QUE DIVIDE O BRASIL');
    }

    // ---------- legendas ----------
    const HL = new Set(['quatro','mesmo','sonho','fecha','sessenta','tres','favor','cinquenta','mantiveram','estavel','quinze','dezenove','quinhentos','produtividade','oitenta','contra','quiseram','pequenas','contratar','dezoito','permanente','comenta','discordar','inteligencia','emprego','dias']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1665); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? AMB : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    const NOFLASH = new Set([3]);
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
