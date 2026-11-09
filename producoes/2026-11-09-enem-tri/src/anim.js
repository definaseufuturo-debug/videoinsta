/*
 * ENEM: MESMOS ACERTOS, NOTAS DIFERENTES (TRI) — Mindloop, 9:16, narrado (roteiro do Jonas).
 * Mapa do Brasil: assets/br.json (estados). Estudantes desenhados genéricos, sem rostos reais.
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

  const BG0 = '#070b14', BG1 = '#0f1726', INK = '#070b14';
  const AMB = '#f2b84b', TEAL = '#2ec4b6', WH = '#f3f5fa', MU = '#8a95ad', RED = '#ff4d5e', BLUE = '#5fb4ff', GRN = '#3ddc84';
  const CA = BLUE, CB = '#c792ff'; // estudante A e B

  function create(TL, env) {
    const GEO = env.geo || require('../assets/br.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 6;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ---------- primitivas ----------
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 28; } ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore(); }
    function rtxt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; const d = size * 0.06; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.globalAlpha *= o.a ?? 1; ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.12; ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.strokeText(s, d, d); ctx.fillText(s, d, d); ctx.strokeText(s, 0, 0); ctx.fillStyle = o.color || WH; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function line(pts, w, col, dash) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); }
    function circ(x, y, r, fill, lw = 0, sc = WH) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function soft(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    function chip(s, x, y, size, col, k, o = {}) { if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1)); rr(-w / 2 + 6, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1); }
    function panel(x, y, w, h, k, edge) { rr(x, y, w, h, 26); ctx.fillStyle = 'rgba(7,11,20,0.85)'; ctx.fill(); if (edge) { ctx.lineWidth = 4; ctx.strokeStyle = edge; ctx.stroke(); } }
    function bg(t) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(95,180,255,0.05)'; ctx.lineWidth = 2; const off = (t * 20) % 80; for (let x = -80 + off; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -80 + off; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    function header() { ga(0.9); rr(270, 110, 540, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); txt('ENEM 2026 · ENTENDA A NOTA', 540, 141, 26, { w: 800, color: MU }); ga(1); }
    function fonte(s) { txt(s, 540, 1800, 24, { w: 600, color: 'rgba(255,255,255,0.45)' }); }
    function check(x, y, s, col) { line([[x - 0.5 * s, y], [x - 0.12 * s, y + 0.38 * s], [x + 0.55 * s, y - 0.42 * s]], s * 0.26, col); }
    function cross(x, y, s, col) { line([[x - 0.42 * s, y - 0.42 * s], [x + 0.42 * s, y + 0.42 * s]], s * 0.24, col); line([[x + 0.42 * s, y - 0.42 * s], [x - 0.42 * s, y + 0.42 * s]], s * 0.24, col); }

    // estudante genérico (cabeça redonda, sem rosto real), com prova na mão
    function student(x, y, s, col, bob) { ctx.save(); ctx.translate(x, y + Math.sin(bob) * 6); ctx.scale(s, s);
      rr(-90, 40, 180, 230, 70); ctx.fillStyle = col; ctx.fill();
      circ(0, -40, 78, '#e9c9a8'); ctx.beginPath(); ctx.arc(0, -52, 80, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 34; ctx.strokeStyle = '#2b2233'; ctx.stroke();
      circ(-26, -36, 8, INK); circ(26, -36, 8, INK); ctx.beginPath(); ctx.arc(0, -10, 22, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      ctx.save(); ctx.translate(70, 150); ctx.rotate(-0.15); rr(-50, -66, 100, 132, 8); ctx.fillStyle = '#f7f3ea'; ctx.fill(); for (let i = 0; i < 5; i++) line([[-32, -40 + i * 22], [32, -40 + i * 22]], 5, '#b9b2a2'); ctx.restore();
      ctx.restore(); }

    // ---------- mapa do Brasil ----------
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; for (const s of GEO) for (const r of s.p) for (const [x, y] of r) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
    const MR = [70, 360, 940, 1000], MS = Math.min(MR[2] / (bx1 - bx0), MR[3] / (by1 - by0)), MOX = MR[0] + (MR[2] - (bx1 - bx0) * MS) / 2, MOY = MR[1] + (MR[3] - (by1 - by0) * MS) / 2;
    const mp = (x, y) => [MOX + (x - bx0) * MS, MOY + (y - by0) * MS];
    function inPoly(x, y, ring) { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
    // pontos de "locais de prova": amostra determinística dentro do território, mais densa no litoral/leste
    const DOTS = []; { let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; let tries = 0;
      while (DOTS.length < 260 && tries < 20000) { tries++; const x = lerp(bx0, bx1, rnd()), y = lerp(by0, by1, rnd()); const east = (x - bx0) / (bx1 - bx0); if (rnd() > 0.25 + 0.75 * east) continue; if (GEO.some(s => s.p.some(r => inPoly(x, y, r)))) DOTS.push({ x, y, d: rnd() }); } }
    function brMap(t, a, lit) { ga(a);
      for (const s of GEO) { ctx.beginPath(); for (const r of s.p) { r.forEach(([x, y], i) => { const [X, Y] = mp(x, y); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); } ctx.fillStyle = '#1c2638'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#34445e'; ctx.stroke(); }
      DOTS.forEach((p, i) => { const k = clamp((lit - p.d) * 6); if (k <= 0) return; const [X, Y] = mp(p.x, p.y); soft(X, Y, 26, 'rgba(242,184,75,A)', 0.35 * k); circ(X, Y, 4.5 * outBack(k), AMB); });
      // linhas entre alguns pontos
      if (lit > 0.4) { ga(a * 0.35 * clamp((lit - 0.4) * 3)); for (let i = 0; i < DOTS.length - 1; i += 9) { const p = mp(DOTS[i].x, DOTS[i].y), q = mp(DOTS[i + 1].x, DOTS[i + 1].y); line([p, q], 2, AMB); } }
      ga(1); }

    // ---------- tempos ----------
    const s1 = { ima: wt('c1', 'imagine'), dua: wt('c1', 'duas'), tri: wt('c1', 'trinta'), mes: wt('c1', 'mesma'), not: wt('c1', 'nota'), sur: wt('c1', 'surpreender') };
    const s2 = { nes: wt('c2', 'neste'), cin: wt('c2', 'cinco'), ins: wt('c2', 'inscreveram'), mil: wt('c2', 'mil'), mun: wt('c2', 'municipios') };
    const s3 = { seg: wt('c3', 'segredo'), tri: wt('c3', 'tri'), teo: wt('c3', 'teoria'), coe: wt('c3', 'coerencia'), res: wt('c3', 'respostas') };
    const s4 = { fa1: wt('c4', 'faceis'), med: wt('c4', 'medias'), coe: wt('c4', 'coerente'), err: wt('c4', 'erra'), fa2: wt('c4', 'faceis', 1), dif: wt('c4', 'dificeis'), chu: wt('c4', 'chute'), cai: wt('c4', 'cai') };
    const s5 = { med: wt('c5', 'media'), cin: wt('c5', 'cinco'), exe: wt('c5', 'exemplo'), sei: wt('c5', 'seiscentos'), ate: wt('c5', 'atencao'), pes: wt('c5', 'pesos') };
    const s6 = { sab: wt('c6', 'sabia'), com: wt('c6', 'comenta'), seg: wt('c6', 'segue'), oit: wt('c6', 'oitocentos'), dif: wt('c6', 'dificil') };
    cue(0, 'music', { part: 'intro' }); cue(s1.dua, 'whoosh', { dur: 0.5 }); cue(s1.tri, 'pop'); cue(s1.tri + 0.2, 'pop'); cue(s1.mes, 'riser', { dur: 0.6 }); cue(s1.sur, 'impact', { gain: 0.8 });
    cue(B[1], 'music', { part: 'groove' }); cue(s2.cin, 'ding'); cue(s2.mil, 'sparkle'); cue(s2.mun, 'stamp', { gain: 0.6 });
    cue(s3.tri, 'impact', { gain: 0.7 }); cue(s3.teo, 'scan', { dur: 0.6, gain: 0.6 }); cue(s3.coe, 'stamp');
    [s4.fa1, s4.med].forEach(x => cue(x, 'pop')); cue(s4.coe, 'success'); cue(s4.err, 'swoosh'); cue(s4.chu, 'glitch', { dur: 0.3 }); cue(s4.cai, 'impact', { gain: 0.6 });
    cue(s5.med, 'tick', { dur: 0.5 }); cue(s5.sei, 'riser', { dur: 0.5 }); cue(s5.sei + 0.5, 'stamp'); cue(s5.pes, 'ding');
    cue(B[5], 'music', { part: 'outro' }); cue(s6.com, 'notif'); cue(s6.dif + 0.6, 'tap'); cue(s6.dif + 0.65, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    function scene1(t) {
      // tela dividida
      const sp = sm(t, 0.1, 0.6);
      ga(sp); ctx.fillStyle = 'rgba(95,180,255,0.07)'; ctx.fillRect(0, 300, 538, 1150); ctx.fillStyle = 'rgba(199,146,255,0.07)'; ctx.fillRect(542, 300, 538, 1150); line([[540, 300], [540, 1450]], 4, 'rgba(255,255,255,0.25)'); ga(1);
      const ka = sm(t, s1.dua - 0.3, s1.dua + 0.1, outBack), kb = sm(t, s1.dua - 0.1, s1.dua + 0.3, outBack);
      if (ka > 0) student(270, 900, 1.25 * ka, CA, t * 3);
      if (kb > 0) student(810, 900, 1.25 * kb, CB, t * 3 + 1.5);
      txt('ALUNO A', 270, 1290, 40, { w: 900, color: CA, a: ka }); txt('ALUNO B', 810, 1290, 40, { w: 900, color: CB, a: kb });
      const n = Math.round(30 * outC(prog(t, s1.tri - 0.3, s1.tri + 0.4)));
      if (t > s1.tri - 0.3) { chip(`${n} ACERTOS`, 270, 1380, 36, CA, prog(t, s1.tri - 0.3, s1.tri)); chip(`${n} ACERTOS`, 810, 1380, 36, CB, prog(t, s1.tri - 0.1, s1.tri + 0.2)); }
      // pergunta e resposta
      const qk = sm(t, s1.mes - 0.25, s1.mes + 0.1, outBack) * (1 - prog(t, s1.sur - 0.3, s1.sur - 0.1));
      rtxt('MESMA NOTA?', 540, 400, 104, { color: WH, scale: qk });
      const hk = sm(t, 0.15, 0.55, outBack) * (1 - prog(t, s1.mes - 0.4, s1.mes - 0.2));
      rtxt('30 ACERTOS CADA', 540, 400, 92, { color: AMB, scale: hk });
      const ak = sm(t, s1.sur - 0.25, s1.sur + 0.1, outBack);
      if (ak > 0) { rtxt('NOTAS', 540, 360, 100, { color: WH, scale: ak }); rtxt('DIFERENTES', 540, 470, 100, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: ak });
        const pk = sm(t, s1.sur, s1.sur + 0.3, outBack); if (pk > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(pk, pk); circ(0, 0, 70, AMB, 6, INK); txt('≠', 0, 4, 100, { w: 900, color: INK }); ctx.restore(); } }
    }
    function scene2(t) {
      const lit = prog(t, s2.nes, s2.mun + 0.6);
      brMap(t, sm(t, B[1], B[1] + 0.5), lit);
      const v = Math.round(5055818 * outC(prog(t, s2.cin - 0.2, s2.ins + 0.4)));
      const k = sm(t, s2.cin - 0.3, s2.cin + 0.1, outBack);
      if (k > 0) { ctx.save(); ctx.translate(540, 300); ctx.scale(k, k); panel(-430, -90, 860, 180, 1, AMB); rtxt(v.toLocaleString('pt-BR'), 0, -20, 92, { color: AMB }); txt('INSCRIÇÕES CONFIRMADAS', 0, 54, 32, { w: 900, color: WH }); ctx.restore(); }
      const mk = sm(t, s2.mil - 0.2, s2.mil + 0.2, outBack);
      if (mk > 0) { ctx.save(); ctx.translate(540, 1330); ctx.scale(mk, mk); panel(-360, -70, 720, 140, 1, TEAL); txt('~1.900', -150, 0, 70, { w: 900, color: TEAL }); txt('MUNICÍPIOS', 150, 0, 44, { w: 900, color: WH, a: prog(t, s2.mun - 0.2, s2.mun + 0.1) }); ctx.restore(); }
      header(); fonte('MEC / Inep, 2026 · dados preliminares');
    }
    function scene3(t) {
      const tk = sm(t, s3.tri - 0.25, s3.tri + 0.1, outBack), up = sm(t, s3.teo - 0.15, s3.teo + 0.35);
      soft(540, lerp(760, 560, up), 420, 'rgba(242,184,75,A)', 0.25 * tk);
      rtxt('TRI', 540, lerp(760, 520, up), lerp(300, 200, up), { color: AMB, glow: 'rgba(242,184,75,0.6)', scale: tk });
      chip('SEGREDO', 540, 380, 34, WH, prog(t, s3.seg - 0.2, s3.seg + 0.1) * (1 - up));
      const words = [['TEORIA', 0], ['DE RESPOSTA', 0.25], ['AO ITEM', 0.5]];
      words.forEach(([w, d], i) => txt(w, 540, 720 + i * 80, 64, { w: 900, a: prog(t, s3.teo + 0.35 + d, s3.teo + 0.6 + d), color: i === 0 ? AMB : WH }));
      // balança da coerência
      const ck = sm(t, s3.coe - 0.25, s3.coe + 0.15, outBack);
      if (ck > 0) { ctx.save(); ctx.translate(540, 1210); ctx.scale(ck, ck); const tilt = 0.12 * Math.sin(t * 3) * (1 - prog(t, s3.res, s3.res + 0.6));
        line([[0, -110], [0, 90]], 10, '#b8c2d6'); line([[-120, 90], [120, 90]], 12, '#b8c2d6'); ctx.save(); ctx.translate(0, -110); ctx.rotate(tilt); line([[-200, 0], [200, 0]], 10, '#b8c2d6');
        for (const sx of [-1, 1]) { line([[sx * 200, 0], [sx * 240, 80]], 4, '#b8c2d6'); line([[sx * 200, 0], [sx * 160, 80]], 4, '#b8c2d6'); ctx.beginPath(); ctx.ellipse(sx * 200, 84, 56, 14, 0, 0, TAU); ctx.fillStyle = sx < 0 ? GRN : AMB; ctx.fill(); }
        ctx.restore(); ctx.restore(); chip('COERÊNCIA', 540, 1400, 48, AMB, prog(t, s3.coe - 0.15, s3.coe + 0.2)); }
      header(); fonte('Inep · Teoria de Resposta ao Item');
    }
    // folha de respostas: linhas por dificuldade, células acerto/erro
    const SHEET = {
      A: { F: [1, 1, 1, 1, 1], M: [1, 1, 1, 0, 1], D: [0, 0, 1, 0, 0] },
      B: { F: [0, 1, 0, 0, 1], M: [1, 0, 1, 1, 0], D: [1, 1, 0, 1, 1] },
    };
    function sheet(x, y, who, col, t, tStart) {
      panel(x - 230, y - 60, 460, 560, 1, col); txt('ALUNO ' + who, x, y - 10, 38, { w: 900, color: col });
      const rows = [['FÁCEIS', 'F', GRN], ['MÉDIAS', 'M', AMB], ['DIFÍCEIS', 'D', RED]];
      rows.forEach(([lab, key, c], r) => { const yy = y + 80 + r * 140; txt(lab, x, yy, 26, { w: 800, color: c });
        SHEET[who][key].forEach((ok, i) => { const cx = x - 160 + i * 80, cy = yy + 56, kk = prog(t, tStart + (r * 5 + i) * 0.045, tStart + (r * 5 + i) * 0.045 + 0.2); if (kk <= 0) return;
          rr(cx - 30, cy - 30, 60, 60, 12); ctx.fillStyle = ok ? 'rgba(61,220,132,0.18)' : 'rgba(255,77,94,0.18)'; ctx.fill(); ga(kk); ok ? check(cx, cy, 34, GRN) : cross(cx, cy, 30, RED); ga(1); }); });
    }
    function scene4(t) {
      const ka = sm(t, B[3], B[3] + 0.4, outBack);
      ctx.save(); ctx.translate(290, 760); ctx.scale(ka, ka); ctx.translate(-290, -760); sheet(290, 500, 'A', CA, t, s4.fa1 - 0.3); ctx.restore();
      const kb = sm(t, s4.err - 0.4, s4.err, outBack);
      if (kb > 0) { ctx.save(); ctx.translate(790, 760); ctx.scale(kb, kb); ctx.translate(-790, -760); sheet(790, 500, 'B', CB, t, s4.err - 0.1); ctx.restore(); }
      chip('COERENTE ✓', 290, 1150, 38, GRN, prog(t, s4.coe - 0.2, s4.coe + 0.15));
      chip('PARECE CHUTE', 790, 1150, 38, RED, prog(t, s4.chu - 0.2, s4.chu + 0.15), { tc: WH });
      // seta de nota caindo
      const dk = sm(t, s4.cai - 0.3, s4.cai + 0.3);
      if (dk > 0) { ga(dk); line([[790, 1240], [790, 1240 + 150 * dk]], 18, RED); if (dk > 0.8) { ctx.beginPath(); ctx.moveTo(750, 1380); ctx.lineTo(790, 1430); ctx.lineTo(830, 1380); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); } txt('NOTA', 640, 1320, 44, { w: 900, color: RED, align: 'right' }); ga(1);
        const uk = prog(t, s4.cai, s4.cai + 0.4); ga(uk); line([[290, 1410], [290, 1260]], 18, GRN); ctx.beginPath(); ctx.moveTo(250, 1270); ctx.lineTo(290, 1220); ctx.lineTo(330, 1270); ctx.closePath(); ctx.fillStyle = GRN; ctx.fill(); ga(1); }
      header(); fonte('Exemplo ilustrativo · Inep');
    }
    const NOTAS = [['Linguagens', 600], ['Humanas', 650], ['Natureza', 550], ['Matemática', 700], ['Redação', 800]];
    function scene5(t) {
      const k0 = sm(t, B[4], B[4] + 0.4, outBack);
      ctx.save(); ctx.translate(540, 700); ctx.scale(k0, k0); ctx.translate(-540, -700);
      panel(110, 300, 860, 720, 1, 'rgba(255,255,255,0.15)');
      txt('EXEMPLO', 540, 360, 30, { w: 900, color: MU });
      NOTAS.forEach(([n, v], i) => { const y = 440 + i * 105, kk = prog(t, s5.med + i * 0.18 - 0.2, s5.med + i * 0.18 + 0.1); if (kk <= 0) return; ga(kk);
        txt(n, 170, y, 40, { w: 800, align: 'left' }); const bw = 330 * v / 800 * outC(kk); rr(470, y - 20, bw, 40, 10); ctx.fillStyle = i === 4 ? AMB : BLUE; ctx.fill(); txt(String(v), 910, y, 42, { w: 900, align: 'right', color: i === 4 ? AMB : WH }); ga(1); });
      ctx.restore();
      line([[170, 1030], [910, 1030]], 4, 'rgba(255,255,255,0.3)');
      const rk = sm(t, s5.sei - 0.2, s5.sei + 0.2, outBack), v = Math.round(660 * outC(prog(t, s5.sei - 0.3, s5.sei + 0.5)));
      if (rk > 0) { txt('MÉDIA SIMPLES', 540, 1100, 36, { w: 900, color: MU, a: rk }); rtxt(`= ${v}`, 540, 1220, 150, { color: AMB, glow: 'rgba(242,184,75,0.55)', scale: rk }); }
      const wk = sm(t, s5.ate - 0.2, s5.ate + 0.15, outBack);
      if (wk > 0) { ctx.save(); ctx.translate(540, 1400); ctx.scale(wk, wk); panel(-420, -70, 840, 140, 1, RED); txt('ATENÇÃO', 0, -26, 34, { w: 900, color: RED }); txt('muitas faculdades usam pesos', 0, 24, 36, { w: 800, a: prog(t, s5.pes - 0.3, s5.pes) }); ctx.restore(); }
      header(); fonte('Notas fictícias · média usada no Sisu, ProUni e Fies');
    }
    function scene6(t) {
      rtxt('VOCÊ SABIA?', 540, 470, 110, { color: WH, scale: sm(t, s6.sab - 0.25, s6.sab + 0.1, outBack) });
      chip('COMENTA AQUI', 540, 640, 46, AMB, prog(t, s6.com - 0.15, s6.com + 0.2));
      const nk = sm(t, s6.seg - 0.2, s6.seg + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(nk, nk); rr(-430, -120, 860, 240, 26); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('PRÓXIMO', 0, -60, 34, { w: 900, color: MU }); txt('POR QUE TIRAR 800', 0, 4, 60, { w: 900, a: prog(t, s6.oit - 0.4, s6.oit) }); txt('É TÃO DIFÍCIL', 0, 70, 60, { w: 900, color: AMB, a: prog(t, s6.dif - 0.3, s6.dif) }); ctx.restore(); }
      const bk = sm(t, s6.dif + 0.1, s6.dif + 0.5, outBack), press = t > s6.dif + 0.6; if (bk > 0) { ctx.save(); ctx.translate(540, 1200); const pr = bk * (1 - 0.06 * pulse(t, s6.dif + 0.6, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header();
    }

    // ---------- legendas ----------
    const HL = new Set(['trinta', 'mesma', 'nota', 'surpreender', 'cinco', 'milhoes', 'mil', 'novecentos', 'municipios', 'tri', 'coerencia', 'faceis', 'medias', 'coerente', 'dificeis', 'chute', 'cai', 'media', 'seiscentos', 'sessenta', 'pesos', 'comenta', 'segue', 'oitocentos']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1610); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? AMB : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6];
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
