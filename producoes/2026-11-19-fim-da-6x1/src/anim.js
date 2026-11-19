/*
 * FIM DA ESCALA 6x1: EMPREGO OU DEMISSÃO? — Mindloop MODO DEBATE (19/11/2026). 9:16, narrado.
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
    const CAM1 = box(-76, -32, -35, 6, [0, 300, W, 1300]);
    const CAM3 = box(-76, -32, -35, 6, [90, 630, 900, 760]);

    // ---------- tempos ----------
    const s1 = { fim: wt('c1', 'fim'), sei: wt('c1', 'seis'), emp: wt('c1', 'emprego'), ou: wt('c1', 'ou'), dem: wt('c1', 'demissao') };
    const s2 = { sen: wt('c2', 'senado'), set: wt('c2', 'setenta'), um: wt('c2', 'um'), dez: wt('c2', 'dezesseis'), lim: wt('c2', 'limite'), q44: wt('c2', 'quarenta', 0), q42: wt('c2', 'quarenta', 1), hor: wt('c2', 'horas'), q40: wt('c2', 'quarenta', 2), sete: wt('c2', 'sete') };
    const s3 = { fav: wt('c3', 'favor'), qui: wt('c3', 'quinze'), mil: wt('c3', 'milhoes'), esc: wt('c3', 'escala'), die: wt('c3', 'dieese') };
    const s4 = { oit: wt('c4', 'oitenta'), jor: wt('c4', 'jornada'), q48: wt('c4', 'quarenta', 0), q44: wt('c4', 'quarenta', 1), est: wt('c4', 'estudos'), nao: wt('c4', 'nao'), des: wt('c4', 'desemprego') };
    const s5 = { con: wt('c5', 'contra'), ind: wt('c5', 'industria'), cus: wt('c5', 'custo'), duz: wt('c5', 'duzentos'), bil: wt('c5', 'bilhoes'), ano: wt('c5', 'ano'), hor: wt('c5', 'hora'), dez: wt('c5', 'dez'), car: wt('c5', 'cara') };
    const s6 = { dec: wt('c6', 'decisao'), dad: wt('c6', 'dado'), doi: wt('c6', 'dois'), sup: wt('c6', 'supremo'), lib: wt('c6', 'liberou'), aco: wt('c6', 'acordo'), oit: wt('c6', 'oito'), vin: wt('c6', 'vinte'), sem: wt('c6', 'sem', 1), ext: wt('c6', 'extra') };
    const s7 = { voc: wt('c7', 'voce'), emp: wt('c7', 'emprego'), dem: wt('c7', 'demissao'), com: wt('c7', 'comenta'), mar: wt('c7', 'marca'), dis: wt('c7', 'discordar'), ama: wt('c7', 'amanha'), sem: wt('c7', 'semana'), seg: wt('c7', 'segue'), per: wt('c7', 'perder') };

    cue(0, 'music', { part: 'intro' }); cue(s1.fim, 'impact', { gain: 0.8 }); cue(s1.emp, 'pop'); cue(s1.dem, 'pop'); cue(s1.dem + 0.2, 'stamp', { gain: 0.5 });
    cue(B[1], 'music', { part: 'groove' }); cue(s2.set, 'stamp', { gain: 0.6 }); cue(s2.q44, 'tick', { dur: 0.3 }); cue(s2.q42, 'ding'); cue(s2.q40, 'ding');
    cue(s3.fav, 'swoosh'); cue(s3.qui - 0.3, 'scan', { dur: 1.0, gain: 0.5 }); cue(s3.mil, 'impact', { gain: 0.6 }); cue(s3.die, 'pop');
    cue(s4.oit, 'pop'); cue(s4.q44, 'lock'); cue(s4.nao, 'stamp', { gain: 0.6 });
    cue(s5.con, 'swoosh'); cue(s5.duz - 0.2, 'riser', { dur: 0.8 }); cue(s5.bil, 'coin', { gain: 0.7 }); cue(s5.dez, 'impact', { gain: 0.6 });
    cue(s6.dad, 'scratch'); cue(s6.oit, 'tick', { dur: 0.3 }); cue(s6.vin, 'tick', { dur: 0.3 }); cue(s6.sem, 'stamp', { gain: 0.6 });
    cue(B[6], 'music', { part: 'outro' }); cue(s7.emp, 'pop'); cue(s7.dem, 'pop'); cue(s7.com, 'notif'); cue(s7.ama, 'whoosh', { dur: 0.4 }); cue(s7.per + 0.1, 'tap'); cue(s7.per + 0.15, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    function scene1(t) {
      const mk = prog(t, 0, 0.6);
      drawMap(CAM1, iso => iso === 'BRA' ? { fill: `rgba(242,184,75,${0.18 * mk})`, edge: 'rgba(242,184,75,0.6)', lw: 2.5 } : null, 0.55);
      ctx.fillStyle = 'rgba(7,11,20,0.35)'; ctx.fillRect(0, 0, W, H);
      chip('DEBATE DO DIA', 540, 300, 36, AMB, prog(t, 0.05, 0.35));
      rtxt('O FIM DA', 540, 470, 110, { scale: sm(t, s1.fim - 0.25, s1.fim + 0.1, outBack) });
      rtxt('ESCALA 6x1', 540, 610, 150, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s1.sei - 0.3, s1.sei + 0.05, outBack) });
      // tela dividida
      const ak = sm(t, s1.emp - 0.25, s1.emp + 0.1, outBack), bk = sm(t, s1.dem - 0.25, s1.dem + 0.1, outBack);
      if (ak > 0) { panel(278, 930, 450, 330, ak, null, RED); txt('CRIA', 0, -70, 60, { w: 900, color: INK }); txt('EMPREGO?', 0, 25, 64, { w: 900, color: INK }); txt('LADO A', 0, 115, 32, { w: 800, color: 'rgba(7,11,20,0.7)' }); endPanel(); }
      if (bk > 0) { panel(802, 930, 450, 330, bk, null, BLUE); txt('GERA', 0, -70, 60, { w: 900, color: INK }); txt('DEMISSÃO?', 0, 25, 64, { w: 900, color: INK }); txt('LADO B', 0, 115, 32, { w: 800, color: 'rgba(7,11,20,0.7)' }); endPanel(); }
      const vk = sm(t, s1.ou - 0.2, s1.ou + 0.1, outBack); if (vk > 0) { ctx.save(); ctx.translate(540, 930); ctx.scale(vk, vk); circ(0, 0, 62, WH, 6, INK); txt('OU', 0, 3, 42, { w: 900, color: INK }); ctx.restore(); }
      const qk = sm(t, s1.dem + 0.15, s1.dem + 0.45, outBack); if (qk > 0) chip('VOCÊ ESCOLHE', 540, 1240, 44, WH, qk, { fill: WH });
      header('O ASSUNTO QUE DIVIDE O BRASIL');
    }
    function scene2(t) {
      // placar
      const pk = sm(t, s2.sen - 0.2, s2.sen + 0.15, outBack);
      chip('SENADO · 14/10/2026', 540, 260, 36, WH, pk, { fill: WH });
      const vk = sm(t, s2.set - 0.2, s2.set + 0.15, outBack);
      if (vk > 0) { ctx.save(); ctx.translate(540, 420); ctx.scale(vk, vk);
        txt(String(Math.round(75 * outC(prog(t, s2.set - 0.1, s2.um)))), -170, 0, 170, { w: 900, color: '#3ddc84' }); txt('×', 0, 0, 110, { w: 900, color: MU }); txt(t > s2.um - 0.1 ? '1' : '0', 170, 0, 170, { w: 900, color: MU });
        txt('A FAVOR', -170, 110, 30, { w: 800, color: MU }); txt('CONTRA', 170, 110, 30, { w: 800, color: MU }); ctx.restore(); }
      // linha do tempo da jornada
      const lk = prog(t, s2.dez - 0.3, s2.dez + 0.2);
      if (lk > 0) { ga(lk); rr(40, 640, 1000, 600, 30); ctx.fillStyle = 'rgba(7,11,20,0.85)'; ctx.fill(); txt('LIMITE DE HORAS POR SEMANA', 540, 700, 34, { w: 900, color: MU }); ga(1); }
      const N = [['44h', 'ATÉ HOJE', s2.q44, MU], ['42h', '16/DEZ/2026', s2.q42, AMB], ['40h', 'DEZ/2027', s2.q40, '#3ddc84']];
      const xs = [210, 540, 870], y = 870;
      const p1 = prog(t, s2.q44, s2.q42), p2 = prog(t, s2.q42 + 0.2, s2.q40);
      if (lk > 0) { ga(lk); line([[xs[0], y], [xs[2], y]], 8, 'rgba(255,255,255,0.12)'); ga(1); }
      if (p1 > 0) line([[xs[0], y], [lerp(xs[0], xs[1], outC(p1)), y]], 8, AMB);
      if (p2 > 0) line([[xs[1], y], [lerp(xs[1], xs[2], outC(p2)), y]], 8, '#3ddc84');
      N.forEach(([h, d, t0, c], i) => { const k = sm(t, t0 - 0.25, t0 + 0.1, outBack); if (k <= 0) return; ctx.save(); ctx.translate(xs[i], y); ctx.scale(k, k); circ(0, 0, 70, INK, 6, c); txt(h, 0, 4, 54, { w: 900, color: c }); ctx.restore(); txt(d, xs[i], y + 110, 32, { w: 900, color: c, a: clamp(k) }); });
      // semana: 6x1 -> 5x2
      const wk = prog(t, s2.lim - 0.2, s2.lim + 0.2), sw = prog(t, s2.hor - 0.1, s2.hor + 0.3);
      if (wk > 0) { ga(wk); const D = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
        D.forEach((d, i) => { const x = 165 + i * 125, work = i < 5 || (i === 5 && sw < 0.5); rr(x - 52, 1070, 104, 104, 18); ctx.fillStyle = work ? 'rgba(255,255,255,0.14)' : '#3ddc84'; ctx.fill(); txt(d, x, 1124, 48, { w: 900, color: work ? WH : INK }); });
        ga(1);
        chip(sw < 0.5 ? 'HOJE: 6 DIAS E 1 FOLGA' : '2 FOLGAS POR SEMANA', 540, 1310, 40, sw < 0.5 ? WH : '#3ddc84', 1, { fill: sw < 0.5 ? WH : '#3ddc84', a: wk }); }
      header(); fonte('EC 141/2026 (PEC 221/2019) · Agência Senado');
    }
    function scene3(t) {
      sides('A', prog(t, B[2], B[2] + 0.3));
      const bk = prog(t, s3.qui - 0.2, s3.mil + 0.3);
      drawMap(CAM3, iso => iso === 'BRA' ? { fill: `rgba(255,77,94,${0.15 + 0.6 * bk})`, edge: WH, lw: 2.5, glow: bk > 0.5 ? 'rgba(255,77,94,0.6)' : null } : null, 0.9);
      const nk = sm(t, s3.qui - 0.25, s3.qui + 0.1, outBack);
      const n = 15 * outC(prog(t, s3.qui - 0.2, s3.mil + 0.2));
      rtxt(`${Math.round(n)} MILHÕES`, 540, 430, 130, { color: RED, glow: 'rgba(255,77,94,0.5)', scale: nk });
      txt('DE BRASILEIROS', 540, 545, 50, { w: 900, stroke: 12, a: prog(t, s3.mil, s3.mil + 0.3) });
      // grade de pessoas (cada uma = 1 milhão)
      const gk = prog(t, s3.esc - 0.3, s3.esc + 0.6);
      chip('NA ESCALA 6x1', 540, 1455, 44, RED, prog(t, s3.esc - 0.2, s3.esc + 0.2));
      chip('SEGUNDO O DIEESE', 540, 1550, 32, WH, prog(t, s3.die - 0.2, s3.die + 0.2), { fill: WH });
      header(); fonte('Dieese · estimativa com dados da Rais 2024');
    }
    function scene4(t) {
      sides('A', 1);
      rtxt('EM 1988', 540, 400, 120, { color: WH, scale: sm(t, s4.oit - 0.25, s4.oit + 0.1, outBack) });
      chip('NOVA CONSTITUIÇÃO', 540, 520, 36, AMB, prog(t, s4.jor - 0.2, s4.jor + 0.2));
      // barra de horas 48 -> 44
      const X0 = 110, XW = 860, sc = XW / 48, y = 760;
      const k1 = prog(t, s4.q48 - 0.2, s4.q48 + 0.3), k2 = sm(t, s4.q44 - 0.2, s4.q44 + 0.4);
      if (k1 > 0) { ga(clamp(k1 * 2)); txt('HORAS POR SEMANA', X0, y - 90, 34, { w: 900, color: MU, align: 'left' });
        const w = 48 * sc * outC(k1), cut = 4 * sc * k2; rr(X0, y - 50, w, 100, 18); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill();
        rr(X0, y - 50, Math.max(w - cut, 1), 100, 18); ctx.fillStyle = RED; ctx.fill();
        txt(k2 > 0.5 ? '44' : '48', X0 + 30, y + 3, 64, { w: 900, color: INK, align: 'left' });
        if (k2 > 0) { ga(k2); line([[X0 + XW - cut + 6, y - 70], [X0 + XW - cut + 6, y + 70]], 5, WH, [10, 8]); txt('−4h', X0 + XW - cut / 2 + 4, y - 95, 40, { w: 900, color: WH }); }
        ga(1); }
      const ek = sm(t, s4.est - 0.2, s4.est + 0.2, outBack);
      if (ek > 0) { panel(540, 1100, 900, 300, ek, RED); txt('E O DESEMPREGO?', 0, -80, 48, { w: 900, color: MU }); endPanel(); }
      stamp('NÃO SUBIU', 540, 1140, prog(t, s4.nao - 0.1, s4.nao + 0.25), RED, 96);
      txt('entre os trabalhadores afetados, segundo estudo de 2003', 540, 1330, 30, { w: 700, color: MU, a: prog(t, s4.des, s4.des + 0.3) });
      header(); fonte('Gonzaga, Menezes Filho e Camargo (2003), 48h → 44h em 1988');
    }
    function scene5(t) {
      sides('B', prog(t, B[4], B[4] + 0.3));
      chip('ESTIMATIVA DA INDÚSTRIA (CNI)', 540, 390, 36, BLUE, prog(t, s5.ind - 0.2, s5.ind + 0.2));
      const nk = sm(t, s5.cus - 0.25, s5.cus + 0.1, outBack), n = 267 * outC(prog(t, s5.cus - 0.2, s5.bil + 0.2));
      txt('CUSTO DE ATÉ', 540, 520, 46, { w: 900, color: MU, a: prog(t, s5.cus - 0.2, s5.cus + 0.2) });
      rtxt(`R$ ${Math.round(n)} BI`, 540, 650, 160, { color: BLUE, glow: 'rgba(95,180,255,0.5)', scale: nk });
      chip('POR ANO', 540, 790, 44, WH, prog(t, s5.ano - 0.2, s5.ano + 0.2), { fill: WH });
      // relógio + 10%
      const ck = sm(t, s5.hor - 0.25, s5.hor + 0.1, outBack);
      if (ck > 0) { panel(540, 1170, 900, 380, ck, BLUE);
        const cx = -250, r = 120; circ(cx, 0, r, 'rgba(95,180,255,0.12)', 8, BLUE); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line([[cx + Math.cos(a) * (r - 22), Math.sin(a) * (r - 22)], [cx + Math.cos(a) * (r - 8), Math.sin(a) * (r - 8)]], 5, WH); }
        const ha = -Math.PI / 2 + (t - B[4]) * 2.2; line([[cx, 0], [cx + Math.cos(ha) * 80, Math.sin(ha) * 80]], 8, WH); line([[cx, 0], [cx + Math.cos(ha / 6) * 55, Math.sin(ha / 6) * 55]], 10, WH); circ(cx, 0, 10, WH);
        txt('A HORA DE', 140, -80, 44, { w: 900, color: MU }); txt('TRABALHO', 140, -25, 44, { w: 900, color: MU });
        const pk = sm(t, s5.dez - 0.2, s5.dez + 0.1, outBack); txt('+10%', 140, 75, 120, { w: 900, color: BLUE, scale: pk });
        endPanel(); }
      header(); fonte('CNI (2026) · custo estimado para as empresas, de 44h para 40h');
    }
    function scene6(t) {
      const hk = sm(t, s6.dad - 0.2, s6.dad + 0.15, outBack);
      if (hk > 0) { ga(clamp(hk * 2)); rr(40, 200, 1000, 96, 20); const g = ctx.createLinearGradient(40, 0, 1040, 0); g.addColorStop(0, RED); g.addColorStop(1, BLUE); ctx.fillStyle = g; ctx.fill(); txt('O DADO QUE INCOMODA OS DOIS', 540, 250, 40, { w: 900, color: INK }); ga(1); }
      chip('SUPREMO · LIMINAR DE 12/11/2026', 540, 380, 34, WH, prog(t, s6.dec - 0.2, s6.dec + 0.2), { fill: WH });
      // relógio grande 8h24
      const ck = sm(t, s6.sup - 0.3, s6.sup + 0.1, outBack);
      if (ck > 0) { ctx.save(); ctx.translate(540, 760); ctx.scale(ck, ck); const r = 240; circ(0, 0, r, 'rgba(242,184,75,0.10)', 12, AMB);
        for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, L = i % 5 ? 10 : 28; line([[Math.cos(a) * (r - 18 - L), Math.sin(a) * (r - 18 - L)], [Math.cos(a) * (r - 18), Math.sin(a) * (r - 18)]], i % 5 ? 3 : 7, i % 5 ? MU : WH); }
        const hrs = lerp(0, 8 + 24 / 60, outC(prog(t, s6.lib, s6.vin + 0.6)));
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 50, -Math.PI / 2, -Math.PI / 2 + hrs / 12 * TAU); ctx.closePath(); ctx.fillStyle = 'rgba(242,184,75,0.22)'; ctx.fill();
        const ha = -Math.PI / 2 + hrs / 12 * TAU, ma = -Math.PI / 2 + (hrs % 1) * TAU; line([[0, 0], [Math.cos(ha) * 130, Math.sin(ha) * 130]], 16, WH); line([[0, 0], [Math.cos(ma) * 190, Math.sin(ma) * 190]], 9, WH); circ(0, 0, 16, AMB);
        ctx.restore(); }
      const nk = sm(t, s6.oit - 0.2, s6.oit + 0.1, outBack); rtxt(t > s6.vin - 0.1 ? '8h24 POR DIA' : '8h POR DIA', 540, 1110, 100, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: nk });
      chip('SEM ACORDO COLETIVO', 540, 1240, 38, WH, prog(t, s6.aco - 0.2, s6.aco + 0.2), { fill: WH });
      stamp('SEM HORA EXTRA', 540, 1375, prog(t, s6.sem - 0.1, s6.sem + 0.25), AMB, 76);
      txt('o plenário ainda vai julgar · sem data', 540, 1545, 30, { w: 700, color: MU, a: prog(t, s6.ext + 0.2, s6.ext + 0.5) });
      header(); fonte('STF, liminar nas ADIs 8.041 e 8.042 · transição até dez/2027');
    }
    function scene7(t) {
      rtxt('E VOCÊ?', 540, 340, 120, { color: WH, scale: sm(t, s7.voc - 0.2, s7.voc + 0.15, outBack) });
      const ak = sm(t, s7.emp - 0.25, s7.emp + 0.1, outBack), bk = sm(t, s7.dem - 0.25, s7.dem + 0.1, outBack);
      if (ak > 0) { panel(285, 610, 470, 260, ak, null, RED); txt('A', 0, -60, 90, { w: 900, color: INK }); txt('EMPREGO', 0, 50, 62, { w: 900, color: INK }); endPanel(); }
      if (bk > 0) { panel(795, 610, 470, 260, bk, null, BLUE); txt('B', 0, -60, 90, { w: 900, color: INK }); txt('DEMISSÃO', 0, 50, 62, { w: 900, color: INK }); endPanel(); }
      chip('COMENTA: A OU B?', 540, 820, 46, AMB, prog(t, s7.com - 0.15, s7.com + 0.2));
      chip('MARCA QUEM VAI DISCORDAR', 540, 940, 38, WH, prog(t, s7.mar - 0.15, s7.mar + 0.2), { fill: WH });
      const nk = sm(t, s7.ama - 0.2, s7.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 1140); ctx.scale(nk, nk); rr(-430, -100, 860, 200, 26); ctx.fillStyle = 'rgba(7,11,20,0.85)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -45, 34, { w: 900, color: MU }); txt('SEMANA DE 4 DIAS', 0, 25, 64, { w: 900, color: AMB, a: prog(t, s7.sem - 0.3, s7.sem + 0.1) }); ctx.restore(); }
      const bk2 = sm(t, s7.seg - 0.2, s7.seg + 0.2, outBack), press = t > s7.per + 0.1; if (bk2 > 0) { ctx.save(); ctx.translate(540, 1400); const pr = bk2 * (1 - 0.06 * pulse(t, s7.per + 0.1, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header('TODO DIA UM ASSUNTO QUE DIVIDE O BRASIL');
    }

    // ---------- legendas ----------
    const HL = new Set(['escala', 'emprego', 'demissao', 'setenta', 'cinco', 'quarenta', 'duas', 'quatro', 'oito', 'quinze', 'milhoes', 'favor', 'contra', 'desemprego', 'duzentos', 'sessenta', 'sete', 'bilhoes', 'dez', 'cento', 'supremo', 'vinte', 'extra', 'comenta', 'discordar', 'dias']);
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
