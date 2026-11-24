/*
 * CELULAR PROIBIDO NA ESCOLA — Mindloop MODO DEBATE (24/11/2026). 9:16, narrado.
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
    const END = TL.duration, NS = 6;
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
        ctx.fillStyle = st.fill || LAND; ctx.fill(); ctx.lineWidth = (st.lw || 1.2) / cam.s; ctx.strokeStyle = st.edge || EDGE; ctx.stroke(); }
      ctx.restore(); ga(1); }
    const CAMW = box(-170, 180, -56, 80, [0, 560, W, 560]);
    const GREEN = '#3ddc84';
    const RICH = new Set(['USA','CAN','GBR','FRA','DEU','ITA','ESP','PRT','NLD','BEL','CHE','AUT','SWE','NOR','DNK','FIN','IRL','ISL','JPN','KOR','AUS','NZL','SGP','ISR','LUX']);
    const LOW = new Set(['AFG','BFA','BDI','CAF','TCD','COD','ERI','ETH','GMB','GIN','GNB','HTI','LBR','MDG','MWI','MLI','MOZ','NER','PRK','RWA','SLE','SOM','SSD','SDN','SYR','TGO','UGA','YEM']);
    function persons(t, y0, tStart, litN, n, litCol, cols = 10, step = 84, r = 30) {
      for (let i = 0; i < n; i++) { const c = i % cols, rw = Math.floor(i / cols), x = 540 + (c - (cols - 1) / 2) * step, y = y0 + rw * step, k = sm(t, tStart + i * 0.01, tStart + i * 0.01 + 0.25, outBack); if (k <= 0) continue;
        const on = i < litN; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); circ(0, 0, r, on ? litCol : 'rgba(255,255,255,0.10)', 4, on ? WH : 'rgba(255,255,255,0.22)'); ctx.restore(); } }

    // ---------- tempos ----------
    const s1 = { cel: wt('c1', 'celular'), esc: wt('c1', 'escola'), fun: wt('c1', 'funcionou'), tre: wt('c1', 'treze'), lib: wt('c1', 'liberavam'), nov: wt('c1', 'noventa'), reg: wt('c1', 'regra') };
    const s2 = { mec: wt('c2', 'mec'), nov: wt('c2', 'noventa'), con: wt('c2', 'concentracao'), oit: wt('c2', 'oitenta'), cyb: wt('c2', 'cyberbullying') };
    const s3 = { est: wt('c3', 'estudo'), mil: wt('c3', 'mil'), not: wt('c3', 'notas'), ans: wt('c3', 'ansiedade'), son: wt('c3', 'sono'), pro: wt('c3', 'proibicao') };
    const s4 = { dad: wt('c4', 'dado'), per: wt('c4', 'percepcao'), nao: wt('c4', 'nao'), qua: wt('c4', 'quarenta'), cai: wt('c4', 'caiu') };
    const s5 = { ing: wt('c5', 'inglaterra'), oit: wt('c5', 'oitenta'), pro: wt('c5', 'professores'), set: wt('c5', 'setenta'), alu: wt('c5', 'alunos'), dis: wt('c5', 'discordam') };
    const s6 = { voc: wt('c6', 'voce'), com: wt('c6', 'comenta'), dis: wt('c6', 'discordar'), ama: wt('c6', 'amanha'), bet: wt('c6', 'bets'), seg: wt('c6', 'segue'), per: wt('c6', 'perder') };

    cue(0, 'music', { part: 'intro' }); cue(s1.tre, 'impact', { gain: 0.6 }); cue(s1.nov, 'impact', { gain: 0.8 }); cue(s1.reg, 'stamp', { gain: 0.5 });
    cue(B[1], 'music', { part: 'groove' }); cue(s2.mec, 'swoosh'); cue(s2.nov, 'stamp', { gain: 0.6 }); cue(s2.oit, 'stamp', { gain: 0.6 });
    cue(s3.est, 'swoosh'); cue(s3.mil, 'impact', { gain: 0.6 }); cue(s3.not, 'pop'); cue(s3.ans, 'pop'); cue(s3.son, 'pop'); cue(s3.pro, 'stamp', { gain: 0.5 });
    cue(s4.dad, 'scratch'); cue(s4.per, 'impact', { gain: 0.7 }); cue(s4.qua, 'stamp', { gain: 0.6 });
    cue(s5.oit, 'impact', { gain: 0.6 }); cue(s5.set, 'impact', { gain: 0.6 }); cue(s5.dis, 'scan', { dur: 0.6, gain: 0.5 });
    cue(B[5], 'music', { part: 'outro' }); cue(s6.com, 'notif'); cue(s6.ama, 'whoosh', { dur: 0.4 }); cue(s6.per + 0.1, 'tap'); cue(s6.per + 0.15, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    function scene1(t) {
      const wave = prog(t, s1.nov, s1.nov + 0.8);
      drawMap(CAMW, iso => ({ fill: wave > 0 && (iso.charCodeAt(0) + iso.charCodeAt(2)) % 5 < 2 ? `rgba(95,180,255,${0.4 * wave})` : LAND }), 0.45);
      ctx.fillStyle = 'rgba(7,11,20,0.4)'; ctx.fillRect(0, 0, W, H);
      chip('DEBATE DO DIA', 540, 300, 36, AMB, prog(t, 0.05, 0.35));
      rtxt('CELULAR PROIBIDO', 540, 440, 92, { scale: sm(t, s1.cel - 0.4, s1.cel - 0.1, outBack) });
      rtxt('NA ESCOLA?', 540, 570, 120, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s1.fun - 0.25, s1.fun + 0.1, outBack) });
      const k3 = sm(t, s1.tre - 0.25, s1.tre + 0.1, outBack), n3 = 13 * outC(prog(t, s1.tre - 0.2, s1.tre + 0.5));
      if (k3 > 0) { rtxt(`${Math.round(n3)}%`, 300, 900, 190, { color: MU, scale: k3 }); chip('LIBERAVAM O CELULAR', 300, 1030, 30, WH, prog(t, s1.lib - 0.2, s1.lib + 0.15), { fill: WH }); txt('ANTES DA LEI', 300, 1100, 32, { w: 800, color: MU, a: prog(t, s1.lib, s1.lib + 0.4) }); }
      const k9 = sm(t, s1.nov - 0.25, s1.nov + 0.1, outBack), n9 = 92 * outC(prog(t, s1.nov - 0.2, s1.nov + 0.6));
      if (k9 > 0) { txt('→', 540, 900, 80, { w: 900, color: AMB, a: clamp(k9) }); rtxt(`${Math.round(n9)}%`, 780, 900, 220, { color: GREEN, glow: 'rgba(61,220,132,0.5)', scale: k9 }); chip('SEGUEM A REGRA', 780, 1030, 30, GREEN, prog(t, s1.reg - 0.2, s1.reg + 0.15)); txt('HOJE', 780, 1100, 32, { w: 800, color: MU, a: prog(t, s1.reg, s1.reg + 0.4) }); }
      header('O ASSUNTO QUE DIVIDE O BRASIL'); fonte('MEC/Inep (2026) · Lei 15.100/2025 · pesquisa com gestores');
    }
    function scene2(t) {
      sides('A', prog(t, B[1], B[1] + 0.3));
      chip('PESQUISA DO MEC', 540, 400, 40, WH, sm(t, s2.mec, s2.mec + 0.3, outBack), { fill: WH });
      const k = sm(t, s2.nov - 0.25, s2.nov + 0.1, outBack), n = 95 * outC(prog(t, s2.nov - 0.2, s2.nov + 0.6));
      rtxt(`${Math.round(n)}%`, 540, 560, 190, { color: RED, glow: 'rgba(255,77,94,0.5)', scale: k });
      persons(t, 730, s2.nov - 0.1, Math.round(n / 5), 20, RED, 10, 92, 32);
      chip('NOTARAM MAIS CONCENTRAÇÃO', 540, 930, 34, RED, prog(t, s2.con - 0.2, s2.con + 0.15));
      const k2 = sm(t, s2.oit - 0.25, s2.oit + 0.1, outBack), n2 = 88 * outC(prog(t, s2.oit - 0.2, s2.oit + 0.6));
      if (k2 > 0) { rtxt(`${Math.round(n2)}%`, 540, 1130, 170, { color: RED, glow: 'rgba(255,77,94,0.5)', scale: k2 }); chip('MENOS CYBERBULLYING', 540, 1280, 34, RED, prog(t, s2.cyb - 0.2, s2.cyb + 0.15)); txt('segundo os diretores de escola', 540, 1360, 30, { w: 700, color: MU, a: prog(t, s2.cyb, s2.cyb + 0.4) }); }
      header(); fonte('MEC/Inep · Alana · Unesco (jun/2026) · percepção dos gestores');
    }
    function scene3(t) {
      sides('B', prog(t, B[2], B[2] + 0.3));
      chip('ESTUDO NA INGLATERRA', 540, 400, 40, WH, sm(t, s3.est, s3.est + 0.3, outBack), { fill: WH });
      const k = sm(t, s3.mil - 0.25, s3.mil + 0.1, outBack), n = 1227 * outC(prog(t, s3.mil - 0.2, s3.mil + 0.6));
      rtxt(Math.round(n).toLocaleString('pt-BR'), 540, 540, 180, { color: BLUE, glow: 'rgba(95,180,255,0.5)', scale: k });
      chip('ALUNOS EM 30 ESCOLAS', 540, 670, 34, BLUE, prog(t, s3.mil + 0.1, s3.mil + 0.4));
      [['NOTAS', s3.not], ['ANSIEDADE', s3.ans], ['SONO', s3.son]].forEach(([nm, t0], i) => { const kk = sm(t, t0 - 0.2, t0 + 0.15, outBack); if (kk <= 0) return; panel(540, 850 + i * 150, 900, 120, kk, BLUE); txt(nm, -400, 0, 56, { w: 900, color: WH, align: 'left' }); txt('SEM DIFERENÇA', 410, 0, 44, { w: 900, color: BLUE, align: 'right' }); endPanel(); });
      stamp('COM x SEM PROIBIÇÃO', 540, 1380, prog(t, s3.pro, s3.pro + 0.3), BLUE, 50);
      header(); fonte('Univ. de Birmingham · Lancet Regional Health Europe (fev/2025)');
    }
    function scene4(t) {
      const hk = sm(t, s4.dad - 0.2, s4.dad + 0.15, outBack);
      if (hk > 0) { ga(clamp(hk * 2)); rr(40, 200, 1000, 96, 20); const g = ctx.createLinearGradient(40, 0, 1040, 0); g.addColorStop(0, RED); g.addColorStop(1, BLUE); ctx.fillStyle = g; ctx.fill(); txt('O DADO QUE INCOMODA OS DOIS', 540, 250, 40, { w: 900, color: INK }); ga(1); }
      txt('O MEC MEDE', 540, 440, 46, { w: 900, a: prog(t, s4.dad + 0.2, s4.dad + 0.5) });
      rtxt('PERCEPÇÃO', 540, 570, 130, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s4.per - 0.25, s4.per + 0.1, outBack) });
      txt('DOS DIRETORES', 540, 690, 52, { w: 900, color: WH, a: prog(t, s4.per + 0.2, s4.per + 0.5) });
      txt('NÃO', 300, 830, 44, { w: 900, color: MU, a: prog(t, s4.nao - 0.2, s4.nao) }); chip('NOTAS', 560, 830, 46, RED, sm(t, s4.nao - 0.1, s4.nao + 0.25, outBack));
      const k = sm(t, s4.qua - 0.25, s4.qua + 0.1, outBack), n = 40 * outC(prog(t, s4.qua - 0.2, s4.qua + 0.5));
      if (k > 0) { rtxt(`-${Math.round(n)} MIN`, 540, 1100, 190, { color: BLUE, glow: 'rgba(95,180,255,0.5)', scale: k }); chip('DE CELULAR NA ESCOLA', 540, 1260, 38, BLUE, prog(t, s4.cai - 0.2, s4.cai + 0.15)); txt('efeito da proibição no estudo inglês', 540, 1340, 30, { w: 700, color: MU, a: prog(t, s4.cai, s4.cai + 0.4) }); }
      header(); fonte('MEC/Inep (2026) · Birmingham/Lancet (2025)');
    }
    function scene5(t) {
      sides('A', 0);
      chip('INGLATERRA · UCL (2026)', 540, 320, 34, WH, prog(t, B[4] + 0.1, B[4] + 0.4), { fill: WH });
      [['PROFESSORES APOIAM', 87, RED, s5.oit - 0.1], ['ALUNOS DISCORDAM', 75, BLUE, s5.set - 0.1]].forEach(([nm, v, col, t0], i) => {
        const k = sm(t, t0, t0 + 0.5, outC), y = 560 + i * 260, w = 640 * (v / 87) * k; if (k <= 0) return;
        txt(nm, 70, y - 62, 38, { w: 900, color: MU, align: 'left' }); ctx.fillStyle = 'rgba(255,255,255,0.08)'; rr(70, y - 30, 640, 80, 14); ctx.fill(); ctx.fillStyle = col; rr(70, y - 30, Math.max(w, 6), 80, 14); ctx.fill();
        txt(`${Math.round(v * k)}%`, 70 + w + 20, y + 10, 76, { w: 900, color: col, align: 'left' }); });
      const dk = sm(t, s5.dis - 0.3, s5.dis + 0.1, outBack);
      if (dk > 0) { panel(540, 1180, 940, 220, dk, AMB); txt('MESMA ESCOLA,', 0, -50, 52, { w: 900, color: WH }); txt('DOIS PONTOS DE VISTA', 0, 30, 60, { w: 900, color: AMB }); txt('732 alunos, 27 educadores, 41 pais', 0, 90, 30, { w: 700, color: MU }); endPanel(); }
      header(); fonte('UCL Institute of Education (30/06/2026) · comunicado de imprensa');
    }
    function scene6(t) {
      rtxt('E VOCÊ?', 540, 340, 120, { color: WH, scale: sm(t, s6.voc - 0.2, s6.voc + 0.15, outBack) });
      const ak = sm(t, s6.voc + 0.3, s6.voc + 0.6, outBack), bk = sm(t, s6.voc + 0.6, s6.voc + 0.9, outBack);
      if (ak > 0) { panel(285, 610, 470, 260, ak, null, RED); txt('A', 0, -60, 90, { w: 900, color: INK }); txt('FUNCIONOU', 0, 50, 56, { w: 900, color: INK }); endPanel(); }
      if (bk > 0) { panel(795, 610, 470, 260, bk, null, BLUE); txt('B', 0, -60, 90, { w: 900, color: INK }); txt('NÃO MUDOU', 0, 50, 56, { w: 900, color: INK }); endPanel(); }
      chip('COMENTA: A OU B?', 540, 820, 46, AMB, prog(t, s6.com - 0.15, s6.com + 0.2));
      chip('MARCA QUEM VAI DISCORDAR', 540, 940, 38, WH, prog(t, s6.dis - 0.4, s6.dis + 0.1), { fill: WH });
      const nk = sm(t, s6.ama - 0.2, s6.ama + 0.2, outBack); if (nk > 0) { panel(540, 1140, 900, 220, nk, 'rgba(255,255,255,0.25)'); txt('AMANHÃ', 0, -60, 34, { w: 800, color: MU }); txt('BETS: O BRASIL', 0, 0, 60, { w: 900, color: WH }); txt('DEVIA PROIBIR?', 0, 70, 56, { w: 900, color: AMB }); endPanel(); }
      const bk2 = sm(t, s6.seg - 0.2, s6.seg + 0.2, outBack), press = t > s6.per + 0.1;
      if (bk2 > 0) { ctx.save(); ctx.translate(540, 1400); const pr = bk2 * (1 - 0.06 * pulse(t, s6.per + 0.1, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 54, { w: 900, color: INK }); ctx.restore(); }
      header('TODO DIA UM ASSUNTO QUE DIVIDE O BRASIL');
    }

    // ---------- legendas ----------
    const HL = new Set(['celular','escola','funcionou','treze','noventa','concentracao','oitenta','cyberbullying','mil','notas','ansiedade','sono','percepcao','quarenta','setenta','discordam','professores','alunos','bets','proibir','comenta','discordar']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1665); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? AMB : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6];
    const NOFLASH = new Set([]);
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
