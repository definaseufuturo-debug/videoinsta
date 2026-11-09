/*
 * ENEM: MESMOS ACERTOS, NOTAS DIFERENTES (TRI) — versão detalhada com CTA da calculadora — Mindloop, 9:16, narrado (roteiro do Jonas).
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
    const END = TL.duration, NS = 12;
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
    const s1 = { dua: wt('c1', 'duas'), tri: wt('c1', 'trinta'), dif: wt('c1', 'diferentes'), inj: wt('c1', 'injusto'), exp: wt('c1', 'explicacao'), cal: wt('c1', 'calculadora') };
    const s2 = { nes: wt('c2', 'neste'), cin: wt('c2', 'cinco'), ins: wt('c2', 'inscreveram'), mil: wt('c2', 'mil', 1), mun: wt('c2', 'municipios'), dom: wt('c2', 'domingos'), oit: wt('c2', 'oito'), qui: wt('c2', 'quinze') };
    const s3 = { qua: wt('c3', 'quatro'), qrt: wt('c3', 'quarenta'), cen: wt('c3', 'cento'), red: wt('c3', 'redacao') };
    const s4 = { nao: wt('c4', 'nao'), con: wt('c4', 'contando'), tri: wt('c4', 'tri'), teo: wt('c4', 'teoria') };
    const s5 = { tes: wt('c5', 'testada'), tre: wt('c5', 'tres'), dif: wt('c5', 'dificil'), sep: wt('c5', 'separa'), chu: wt('c5', 'chute') };
    const s6 = { coe: wt('c6', 'coerencia'), fa1: wt('c6', 'faceis'), log: wt('c6', 'logico'), err: wt('c6', 'erra'), chu: wt('c6', 'chute'), val: wt('c6', 'valem') };
    const s7 = { zer: wt('c7', 'zero'), mil: wt('c7', 'mil'), min: wt('c7', 'minimo'), max: wt('c7', 'maximo'), are: wt('c7', 'area'), ano: wt('c7', 'ano') };
    const s8 = { red: wt('c8', 'redacao'), cin: wt('c8', 'cinco'), duz: wt('c8', 'duzentos'), doi: wt('c8', 'dois'), dis: wt('c8', 'discordarem'), ter: wt('c8', 'terceiro') };
    const s9 = { cin: wt('c9', 'cinco'), sim: wt('c9', 'simples'), sei: wt('c9', 'seiscentos'), sis: wt('c9', 'sisu'), pes: wt('c9', 'pesos'), tud: wt('c9', 'tudo') };
    const s10 = { ate: wt('c10', 'atencao'), pro: wt('c10', 'prouni'), fie: wt('c10', 'fies'), qua: wt('c10', 'quatrocentos'), red: wt('c10', 'redacao'), zer: wt('c10', 'zero') };
    const s11 = { dic: wt('c11', 'dica'), gar: wt('c11', 'garanta'), fac: wt('c11', 'faceis'), der: wt('c11', 'derruba'), bra: wt('c11', 'branco'), err: wt('c11', 'erro') };
    const s12 = { cal: wt('c12', 'calcular'), com: wt('c12', 'comenta'), cad: wt('c12', 'calculadora'), lin: wt('c12', 'link'), seg: wt('c12', 'segue'), oit: wt('c12', 'oitocentos'), dif: wt('c12', 'dificil') };
    cue(0, 'music', { part: 'intro' }); cue(s1.dua, 'whoosh', { dur: 0.5 }); cue(s1.tri, 'pop'); cue(s1.tri + 0.2, 'pop'); cue(s1.dif, 'impact', { gain: 0.8 }); cue(s1.cal, 'sparkle');
    cue(B[1], 'music', { part: 'groove' }); cue(s2.cin, 'ding'); cue(s2.mil, 'sparkle'); cue(s2.oit, 'pop'); cue(s2.qui, 'pop');
    cue(s3.qua, 'pop'); cue(s3.cen, 'riser', { dur: 0.5 }); cue(s3.cen + 0.5, 'stamp'); cue(s3.red, 'pop');
    cue(s4.con, 'glitch', { dur: 0.3 }); cue(s4.tri, 'impact', { gain: 0.7 }); cue(s4.teo, 'scan', { dur: 0.6, gain: 0.6 });
    cue(s5.tre, 'ding'); [s5.dif, s5.sep, s5.chu].forEach(x => cue(x, 'pop'));
    cue(s6.coe, 'stamp'); cue(s6.log, 'success'); cue(s6.err, 'swoosh'); cue(s6.chu, 'glitch', { dur: 0.3 }); cue(s6.val, 'impact', { gain: 0.5 });
    cue(s7.zer, 'tick', { dur: 0.4 }); cue(s7.min, 'pop'); cue(s7.max, 'pop'); cue(s7.ano, 'swoosh');
    cue(s8.cin, 'tick', { dur: 0.5 }); cue(s8.doi, 'pop'); cue(s8.ter, 'ding');
    cue(s9.sim, 'tick', { dur: 0.5 }); cue(s9.sei, 'riser', { dur: 0.5 }); cue(s9.sei + 0.5, 'stamp'); cue(s9.pes, 'ding');
    cue(s10.pro, 'pop'); cue(s10.fie, 'pop'); cue(s10.qua, 'riser', { dur: 0.5 }); cue(s10.qua + 0.5, 'stamp'); cue(s10.zer, 'buzz', { dur: 0.3, gain: 0.5 });
    cue(s11.dic, 'ding'); cue(s11.gar, 'success'); cue(s11.bra, 'swoosh'); cue(s11.err, 'impact', { gain: 0.5 });
    cue(B[11], 'music', { part: 'outro' }); cue(s12.cad, 'notif'); cue(s12.lin, 'plus'); cue(s12.dif + 0.6, 'tap'); cue(s12.dif + 0.65, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    function scene1(t) {
      const sp = sm(t, 0.1, 0.6);
      ga(sp); ctx.fillStyle = 'rgba(95,180,255,0.07)'; ctx.fillRect(0, 300, 538, 1150); ctx.fillStyle = 'rgba(199,146,255,0.07)'; ctx.fillRect(542, 300, 538, 1150); line([[540, 300], [540, 1450]], 4, 'rgba(255,255,255,0.25)'); ga(1);
      const ka = sm(t, s1.dua - 0.3, s1.dua + 0.1, outBack), kb = sm(t, s1.dua - 0.1, s1.dua + 0.3, outBack);
      if (ka > 0) student(270, 900, 1.25 * ka, CA, t * 3);
      if (kb > 0) student(810, 900, 1.25 * kb, CB, t * 3 + 1.5);
      txt('ALUNO A', 270, 1290, 40, { w: 900, color: CA, a: ka }); txt('ALUNO B', 810, 1290, 40, { w: 900, color: CB, a: kb });
      const n = Math.round(30 * outC(prog(t, s1.tri - 0.3, s1.tri + 0.4)));
      if (t > s1.tri - 0.3) { chip(`${n} ACERTOS`, 270, 1380, 36, CA, prog(t, s1.tri - 0.3, s1.tri)); chip(`${n} ACERTOS`, 810, 1380, 36, CB, prog(t, s1.tri - 0.1, s1.tri + 0.2)); }
      const hk = sm(t, 0.15, 0.55, outBack) * (1 - prog(t, s1.dif - 0.4, s1.dif - 0.2));
      rtxt('30 ACERTOS CADA', 540, 400, 92, { color: AMB, scale: hk });
      const ak = sm(t, s1.dif - 0.25, s1.dif + 0.1, outBack);
      if (ak > 0) { rtxt('NOTAS', 540, 360, 100, { color: WH, scale: ak }); rtxt('DIFERENTES', 540, 470, 100, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: ak });
        const pk = sm(t, s1.dif, s1.dif + 0.3, outBack); if (pk > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(pk, pk); circ(0, 0, 70, AMB, 6, INK); txt('≠', 0, 4, 100, { w: 900, color: INK }); ctx.restore(); } }
      chip('PARECE INJUSTO?', 540, 610, 36, RED, prog(t, s1.inj - 0.2, s1.inj + 0.1) * (1 - prog(t, s1.cal - 0.4, s1.cal - 0.2)), { tc: WH });
      chip('CALCULADORA NO FINAL', 540, 610, 36, GRN, prog(t, s1.cal - 0.2, s1.cal + 0.15));
    }
    function scene2(t) {
      const lit = prog(t, s2.nes, s2.mun + 0.6);
      brMap(t, sm(t, B[1], B[1] + 0.5), lit);
      const v = Math.round(5055818 * outC(prog(t, s2.cin - 0.2, s2.ins + 0.4)));
      const k = sm(t, s2.cin - 0.3, s2.cin + 0.1, outBack);
      if (k > 0) { ctx.save(); ctx.translate(540, 300); ctx.scale(k, k); panel(-430, -90, 860, 180, 1, AMB); rtxt(v.toLocaleString('pt-BR'), 0, -20, 92, { color: AMB }); txt('INSCRIÇÕES CONFIRMADAS', 0, 54, 32, { w: 900, color: WH }); ctx.restore(); }
      const mk = sm(t, s2.mil - 0.2, s2.mil + 0.2, outBack) * (1 - prog(t, s2.dom - 0.3, s2.dom));
      if (mk > 0) { ctx.save(); ctx.translate(540, 1330); ctx.scale(mk, mk); panel(-360, -70, 720, 140, 1, TEAL); txt('~1.900', -150, 0, 70, { w: 900, color: TEAL }); txt('MUNICÍPIOS', 150, 0, 44, { w: 900, color: WH, a: prog(t, s2.mun - 0.2, s2.mun + 0.1) }); ctx.restore(); }
      chip('DOMINGO 8/11', 290, 1330, 40, BLUE, prog(t, s2.oit - 0.2, s2.oit + 0.15));
      chip('DOMINGO 15/11', 790, 1330, 40, CB, prog(t, s2.qui - 0.2, s2.qui + 0.15));
      header(); fonte('MEC / Inep, 2026 · dados preliminares');
    }
    const AR = [['LINGUAGENS', BLUE], ['HUMANAS', CB], ['NATUREZA', TEAL], ['MATEMÁTICA', '#ff8a5c']];
    function scene3(t) {
      AR.forEach(([n, c], i) => { const x = 290 + (i % 2) * 500, y = 520 + Math.floor(i / 2) * 330, k = sm(t, s3.qua - 0.2 + i * 0.15, s3.qua + 0.15 + i * 0.15, outBack); if (k <= 0) return;
        ctx.save(); ctx.translate(x, y); ctx.scale(k, k); panel(-220, -130, 440, 260, 1, c); txt(n, 0, -70, 36, { w: 900, color: c });
        const q = Math.round(45 * outC(prog(t, s3.qrt - 0.2, s3.qrt + 0.5))); rtxt(String(q), 0, 20, 110, { color: WH }); txt('questões', 0, 95, 28, { w: 700, color: MU }); ctx.restore(); });
      const ck = sm(t, s3.cen - 0.2, s3.cen + 0.2, outBack);
      if (ck > 0) { ctx.save(); ctx.translate(540, 1230); ctx.scale(ck, ck); panel(-400, -90, 800, 180, 1, AMB); rtxt(`${Math.round(180 * outC(prog(t, s3.cen - 0.2, s3.cen + 0.6)))} QUESTÕES`, 0, -10, 80, { color: AMB }); txt('+ REDAÇÃO', 0, 60, 40, { w: 900, a: prog(t, s3.red - 0.2, s3.red + 0.1) }); ctx.restore(); }
      header(); fonte('Inep · 45 questões por área');
    }
    function scene4(t) {
      const xk = sm(t, s4.nao - 0.2, s4.nao + 0.2, outBack) * (1 - prog(t, s4.tri - 0.4, s4.tri - 0.1));
      if (xk > 0) { ctx.save(); ctx.translate(540, 760); ctx.scale(xk, xk); txt('30 ÷ 45', 0, 0, 150, { w: 900, color: WH }); txt('× 1000', 0, 140, 90, { w: 900, color: MU }); const sk = prog(t, s4.con, s4.con + 0.3); if (sk > 0) line([[-330, 160], [lerp(-330, 330, sk), lerp(160, -120, sk)]], 22, RED); ctx.restore(); chip('NÃO É ASSIM', 540, 1080, 44, RED, prog(t, s4.con, s4.con + 0.3), { tc: WH }); }
      const tk = sm(t, s4.tri - 0.25, s4.tri + 0.1, outBack), up = sm(t, s4.teo - 0.15, s4.teo + 0.35);
      soft(540, lerp(760, 560, up), 420, 'rgba(242,184,75,A)', 0.25 * tk);
      rtxt('TRI', 540, lerp(760, 520, up), lerp(300, 200, up), { color: AMB, glow: 'rgba(242,184,75,0.6)', scale: tk });
      [['TEORIA', 0], ['DE RESPOSTA', 0.25], ['AO ITEM', 0.5]].forEach(([w, d], i) => txt(w, 540, 720 + i * 80, 64, { w: 900, a: prog(t, s4.teo + 0.35 + d, s4.teo + 0.6 + d), color: i === 0 ? AMB : WH }));
      header(); fonte('Inep · Teoria de Resposta ao Item');
    }
    function scene5(t) {
      rtxt('3 MEDIDAS', 540, 330, 96, { color: AMB, scale: sm(t, B[4], B[4] + 0.5, outBack) });
      txt('cada questão é testada antes', 540, 420, 34, { w: 700, color: MU, a: prog(t, B[4] + 0.2, B[4] + 0.6) });
      const cards = [[s5.dif, 'DIFICULDADE', AMB], [s5.sep, 'DISCRIMINAÇÃO', TEAL], [s5.chu, 'CHANCE DE CHUTE', RED]];
      cards.forEach(([tt, n, c], i) => { const y = 620 + i * 280, k = sm(t, tt - 0.25, tt + 0.1, outBack); if (k <= 0) return; ctx.save(); ctx.translate(540, y); ctx.scale(k, k); panel(-430, -115, 860, 230, 1, c);
        txt(n, -380, -60, 40, { w: 900, color: c, align: 'left' });
        if (i === 0) { [0.3, 0.6, 1].forEach((h, j) => { rr(-380 + j * 90, 80 - 110 * h, 60, 110 * h, 8); ctx.fillStyle = j === 2 ? AMB : 'rgba(242,184,75,0.4)'; ctx.fill(); }); txt('fácil · média · difícil', 60, 30, 32, { w: 700, align: 'left' }); }
        if (i === 1) { for (let j = 0; j < 5; j++) { circ(-360 + j * 34, 10, 13, '#4a5878'); circ(-360 + j * 34, 60, 13, TEAL); } line([[-385, 35], [-200, 35]], 4, WH, [8, 8]); txt('separa quem sabe', 60, 10, 32, { w: 700, align: 'left' }); txt('de quem não sabe', 60, 55, 32, { w: 700, align: 'left', color: MU }); }
        if (i === 2) { rr(-370, -10, 100, 100, 16); ctx.fillStyle = WH; ctx.fill(); [[-345, 15], [-295, 65], [-320, 40]].forEach(([a, b]) => circ(a, b, 9, INK)); txt('acertar sem saber', 60, 10, 32, { w: 700, align: 'left' }); txt('(1 em 5 alternativas)', 60, 55, 30, { w: 700, align: 'left', color: MU }); }
        ctx.restore(); });
      header(); fonte('Inep · parâmetros da TRI');
    }
    const SHEET = {
      A: { F: [1, 1, 1, 1, 1], M: [1, 1, 1, 0, 1], D: [0, 0, 1, 0, 0] },
      B: { F: [0, 1, 0, 0, 1], M: [1, 0, 1, 1, 0], D: [1, 1, 0, 1, 1] },
    };
    function sheet(x, y, who, col, t, tStart) {
      panel(x - 230, y - 60, 460, 560, 1, col); txt('ALUNO ' + who, x, y - 10, 38, { w: 900, color: col });
      [['FÁCEIS', 'F', GRN], ['MÉDIAS', 'M', AMB], ['DIFÍCEIS', 'D', RED]].forEach(([lab, key, c], r) => { const yy = y + 80 + r * 140; txt(lab, x, yy, 26, { w: 800, color: c });
        SHEET[who][key].forEach((ok, i) => { const cx = x - 160 + i * 80, cy = yy + 56, kk = prog(t, tStart + (r * 5 + i) * 0.045, tStart + (r * 5 + i) * 0.045 + 0.2); if (kk <= 0) return;
          rr(cx - 30, cy - 30, 60, 60, 12); ctx.fillStyle = ok ? 'rgba(61,220,132,0.18)' : 'rgba(255,77,94,0.18)'; ctx.fill(); ga(kk); ok ? check(cx, cy, 34, GRN) : cross(cx, cy, 30, RED); ga(1); }); });
    }
    function scene6(t) {
      chip('COERÊNCIA', 540, 300, 44, AMB, prog(t, s6.coe - 0.2, s6.coe + 0.15));
      const ka = sm(t, s6.fa1 - 0.4, s6.fa1, outBack);
      if (ka > 0) { ctx.save(); ctx.translate(290, 760); ctx.scale(ka, ka); ctx.translate(-290, -760); sheet(290, 500, 'A', CA, t, s6.fa1 - 0.3); ctx.restore(); }
      const kb = sm(t, s6.err - 0.4, s6.err, outBack);
      if (kb > 0) { ctx.save(); ctx.translate(790, 760); ctx.scale(kb, kb); ctx.translate(-790, -760); sheet(790, 500, 'B', CB, t, s6.err - 0.1); ctx.restore(); }
      chip('COERENTE ✓', 290, 1150, 38, GRN, prog(t, s6.log - 0.2, s6.log + 0.15));
      chip('PARECE CHUTE', 790, 1150, 38, RED, prog(t, s6.chu - 0.2, s6.chu + 0.15), { tc: WH });
      const dk = sm(t, s6.val - 0.3, s6.val + 0.3);
      if (dk > 0) { ga(dk); line([[790, 1240], [790, 1240 + 150 * dk]], 18, RED); if (dk > 0.8) { ctx.beginPath(); ctx.moveTo(750, 1380); ctx.lineTo(790, 1430); ctx.lineTo(830, 1380); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); } txt('VALEM MENOS', 690, 1320, 36, { w: 900, color: RED, align: 'right' }); ga(1); }
      header(); fonte('Exemplo ilustrativo · Inep');
    }
    // faixas ilustrativas (não são dados oficiais)
    const FAIXA = [['LINGUAGENS', BLUE, 0.29, 0.82], ['HUMANAS', CB, 0.30, 0.86], ['NATUREZA', TEAL, 0.32, 0.87], ['MATEMÁTICA', '#ff8a5c', 0.34, 0.96]];
    function scene7(t) {
      const ak = sm(t, B[6], B[6] + 0.4);
      const x0 = 150, x1 = 930, X = v => lerp(x0, x1, v);
      ga(ak); line([[x0, 1260], [x1, 1260]], 6, MU); txt('0', x0, 1310, 36, { w: 900, color: MU }); txt('1000', x1, 1310, 36, { w: 900, color: MU }); ga(1);
      const zk = sm(t, s7.zer - 0.2, s7.zer + 0.2, outBack) * (1 - prog(t, s7.min - 0.3, s7.min));
      rtxt('0 A 1000?', 540, 360, 110, { color: WH, scale: zk });
      const nk = sm(t, s7.min - 0.2, s7.min + 0.15, outBack); rtxt('NÃO EXATAMENTE', 540, 360, 84, { color: AMB, scale: nk });
      FAIXA.forEach(([n, c, a, b], i) => { const y = 560 + i * 160, k = prog(t, s7.min - 0.1 + i * 0.15, s7.max + 0.3 + i * 0.15); if (k <= 0) return;
        const wob = prog(t, s7.ano - 0.2, s7.ano + 0.6), da = 0.03 * Math.sin(wob * 6 + i) * wob, db = 0.025 * Math.cos(wob * 5 + i) * wob;
        txt(n, x0, y - 45, 30, { w: 900, color: c, align: 'left', a: k });
        rr(X(a + da), y - 18, (X(lerp(a, b, outC(k)) + db) - X(a + da)), 36, 18); ctx.fillStyle = c; ctx.fill(); });
      chip('MÍNIMO', X(0.31), 1180, 30, WH, prog(t, s7.min - 0.1, s7.min + 0.2));
      chip('MÁXIMO', X(0.88), 1180, 30, WH, prog(t, s7.max - 0.1, s7.max + 0.2));
      chip('MUDA POR ÁREA E POR ANO', 540, 1420, 38, AMB, prog(t, s7.are - 0.2, s7.are + 0.15));
      header(); fonte('Faixas ilustrativas · o Inep divulga os valores de cada edição');
    }
    function scene8(t) {
      rtxt('REDAÇÃO', 540, 330, 100, { color: WH, scale: sm(t, s8.red - 0.25, s8.red + 0.1, outBack) });
      for (let i = 0; i < 5; i++) { const k = prog(t, s8.cin - 0.1 + i * 0.12, s8.duz + 0.2 + i * 0.12); if (k <= 0) continue; const y = 480 + i * 92;
        txt('C' + (i + 1), 170, y, 38, { w: 900, color: AMB, align: 'left', a: k }); rr(260, y - 22, 560 * outC(k), 44, 12); ctx.fillStyle = 'rgba(242,184,75,0.85)'; ctx.fill(); txt('200', 900, y, 38, { w: 900, align: 'right', a: k }); }
      const tk = prog(t, s8.duz + 0.4, s8.duz + 0.8); if (tk > 0) { line([[170, 945], [910, 945]], 4, 'rgba(255,255,255,0.3)'); txt('= 1000', 900, 1000, 54, { w: 900, color: AMB, align: 'right', a: tk }); }
      const people = [[300, s8.doi, CA, 'CORRETOR 1'], [540, s8.doi + 0.15, CB, 'CORRETOR 2'], [780, s8.ter, GRN, '3º CORRETOR']];
      people.forEach(([x, tt, c, l]) => { const k = sm(t, tt - 0.2, tt + 0.15, outBack); if (k <= 0) return; ctx.save(); ctx.translate(x, 1240); ctx.scale(k * 0.7, k * 0.7); student(0, -60, 1, c, t * 3 + x); ctx.restore(); txt(l, x, 1420, 28, { w: 900, color: c, a: k }); });
      chip('DIFERENÇA GRANDE?', 420, 1080, 32, RED, prog(t, s8.dis - 0.2, s8.dis + 0.15) * (1 - prog(t, s8.ter + 0.6, s8.ter + 0.9)), { tc: WH });
      header(); fonte('Inep · 3º corretor se a diferença passar de 100 no total ou 80 numa competência');
    }
    const NOTAS = [['Linguagens', 600, 1], ['Humanas', 650, 1], ['Natureza', 550, 3], ['Matemática', 700, 2], ['Redação', 800, 2]];
    function scene9(t) {
      const k0 = sm(t, B[8], B[8] + 0.4, outBack);
      ctx.save(); ctx.translate(540, 700); ctx.scale(k0, k0); ctx.translate(-540, -700);
      panel(110, 300, 860, 720, 1, 'rgba(255,255,255,0.15)');
      txt('EXEMPLO', 540, 360, 30, { w: 900, color: MU });
      const wk = prog(t, s9.pes - 0.2, s9.pes + 0.3);
      NOTAS.forEach(([n, v, p], i) => { const y = 440 + i * 105, kk = prog(t, s9.cin + i * 0.15 - 0.2, s9.cin + i * 0.15 + 0.1); if (kk <= 0) return; ga(kk);
        txt(n, 170, y, 40, { w: 800, align: 'left' }); const bw = 280 * v / 800 * outC(kk); rr(450, y - 20, bw, 40, 10); ctx.fillStyle = i === 4 ? AMB : BLUE; ctx.fill(); txt(String(v), 910, y, 42, { w: 900, align: 'right', color: i === 4 ? AMB : WH });
        if (wk > 0) chip('×' + p, 790, y, 26, p > 1 ? GRN : MU, wk); ga(1); });
      ctx.restore();
      const rk = sm(t, s9.sei - 0.2, s9.sei + 0.2, outBack), v = Math.round(660 * outC(prog(t, s9.sei - 0.3, s9.sei + 0.5)));
      if (rk > 0) { const pk = prog(t, s9.tud - 0.3, s9.tud + 0.2); txt(pk > 0.5 ? 'COM PESOS (EXEMPLO)' : 'MÉDIA SIMPLES', 540, 1100, 36, { w: 900, color: MU, a: rk });
        rtxt(pk > 0.5 ? '= 655,6' : `= ${v}`, 540, 1220, 150, { color: pk > 0.5 ? GRN : AMB, glow: 'rgba(242,184,75,0.55)', scale: rk * (1 + 0.08 * pulse(t, s9.tud, 0.05, 0.3)) }); }
      chip('NO SISU, CADA CURSO TEM SEUS PESOS', 540, 1400, 32, AMB, prog(t, s9.sis - 0.2, s9.sis + 0.15));
      header(); fonte('Notas e pesos fictícios · média usada no Sisu, ProUni e Fies');
    }
    function phone(t, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-190, -360, 380, 720, 46); ctx.fillStyle = '#0b1120'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#b8c2d6'; ctx.stroke();
      txt('CALCULADORA', 0, -290, 30, { w: 900, color: WH }); txt('DA MÉDIA DO ENEM', 0, -252, 26, { w: 900, color: AMB });
      const cols = [BLUE, CB, TEAL, '#ff8a5c', AMB]; cols.forEach((c, i) => { const y = -190 + i * 62; rr(-150, y - 22, 300, 46, 12); ctx.fillStyle = '#131c2e'; ctx.fill(); rr(-150, y - 22, 8, 46, 4); ctx.fillStyle = c; ctx.fill(); rr(-130, y + 10, 200 * (0.5 + 0.4 * Math.abs(Math.sin(t * 1.3 + i))), 6, 3); ctx.fillStyle = c; ctx.fill(); });
      ctx.beginPath(); ctx.arc(0, 230, 110, Math.PI, 0); ctx.lineWidth = 22; ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 230, 110, Math.PI, Math.PI * (1 + 0.66)); ctx.strokeStyle = AMB; ctx.stroke();
      txt('660', 0, 210, 64, { w: 900, color: AMB }); txt('SUA MÉDIA', 0, 262, 20, { w: 900, color: MU }); ctx.restore(); }
    function scene10(t) {
      rtxt('ATENÇÃO', 540, 330, 100, { color: RED, scale: sm(t, s10.ate - 0.25, s10.ate + 0.1, outBack) });
      [[s10.pro, 'PROUNI', 300], [s10.fie, 'FIES', 780]].forEach(([tt, n, x]) => chip(n, x, 520, 54, AMB, prog(t, tt - 0.2, tt + 0.15)));
      const gk = sm(t, s10.qua - 0.3, s10.qua + 0.2, outBack);
      if (gk > 0) { ctx.save(); ctx.translate(540, 870); ctx.scale(gk, gk);
        ctx.beginPath(); ctx.arc(0, 90, 260, Math.PI, 0); ctx.lineWidth = 46; ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke();
        const fill = 0.45 * outC(prog(t, s10.qua - 0.2, s10.qua + 0.6)); ctx.beginPath(); ctx.arc(0, 90, 260, Math.PI, Math.PI * (1 + fill)); ctx.strokeStyle = GRN; ctx.stroke();
        rtxt(String(Math.round(1000 * fill)) + '+', 0, 40, 130, { color: GRN }); txt('MÉDIA MÍNIMA', 0, 130, 36, { w: 900, color: WH }); ctx.restore(); }
      const rk = sm(t, s10.red - 0.2, s10.red + 0.15, outBack);
      if (rk > 0) { ctx.save(); ctx.translate(540, 1270); ctx.scale(rk, rk); panel(-400, -80, 800, 160, 1, RED); txt('REDAÇÃO', -170, 0, 46, { w: 900 }); circ(160, 0, 54, RED); txt('0', 160, 4, 64, { w: 900 }); const zk = prog(t, s10.zer - 0.1, s10.zer + 0.2); if (zk > 0) cross(160, 0, 130 * zk, WH); txt('ZERO', 290, 0, 32, { w: 900, color: RED, align: 'left', a: zk }); ctx.restore(); }
      header(); fonte('Editais ProUni e Fies 2026 · requisitos de nota');
    }
    function scene11(t) {
      chip('DICA PRO DIA 15/11', 540, 320, 44, AMB, prog(t, s11.dic - 0.2, s11.dic + 0.15));
      const k1 = sm(t, s11.gar - 0.25, s11.gar + 0.1, outBack);
      if (k1 > 0) { ctx.save(); ctx.translate(540, 620); ctx.scale(k1, k1); panel(-430, -150, 860, 300, 1, GRN); txt('1', -350, -80, 70, { w: 900, color: GRN });
        txt('GARANTA AS FÁCEIS', 30, -80, 50, { w: 900 }); for (let i = 0; i < 5; i++) { const kk = prog(t, s11.fac + i * 0.1, s11.fac + 0.2 + i * 0.1); rr(-240 + i * 100, 0, 76, 76, 14); ctx.fillStyle = 'rgba(61,220,132,0.18)'; ctx.fill(); if (kk > 0) { ga(kk); check(-202 + i * 100, 38, 40, GRN); ga(1); } }
        txt('errar fácil derruba a coerência', 30, 115, 30, { w: 700, color: MU, a: prog(t, s11.der - 0.2, s11.der + 0.2) }); ctx.restore(); }
      const k2 = sm(t, s11.bra - 0.4, s11.bra, outBack);
      if (k2 > 0) { ctx.save(); ctx.translate(540, 1050); ctx.scale(k2, k2); panel(-430, -150, 860, 300, 1, RED); txt('2', -350, -80, 70, { w: 900, color: RED });
        txt('NADA EM BRANCO', 30, -80, 50, { w: 900 }); ['A', 'B', 'C', 'D', 'E'].forEach((l, i) => { circ(-200 + i * 100, 30, 34, null, 5, 'rgba(255,255,255,0.5)'); txt(l, -200 + i * 100, 32, 30, { w: 900, color: MU }); });
        const ek = prog(t, s11.err - 0.2, s11.err + 0.2); if (ek > 0) { chip('EM BRANCO = ERRO CERTO', 30, 120, 30, RED, ek, { tc: WH }); } ctx.restore(); }
      header(); fonte('Estratégias de prova · Inep (TRI)');
    }
    function scene12(t) {
      const pk = sm(t, B[11], B[11] + 0.5, outBack), cta = prog(t, s12.seg - 0.3, s12.seg);
      if (pk > 0) phone(t, 540, 760, 0.95 * pk * (1 - 0.25 * cta));
      const ck = sm(t, s12.cad - 0.25, s12.cad + 0.1, outBack);
      if (ck > 0) { ctx.save(); ctx.translate(540, 1250); ctx.scale(ck, ck); panel(-440, -110, 880, 220, 1, AMB); txt('COMENTA', 0, -45, 46, { w: 900, color: WH }); rtxt('CALCULADORA', 0, 35, 92, { color: AMB, glow: 'rgba(242,184,75,0.5)' }); ctx.restore(); }
      chip('TE MANDO O LINK NA DM', 540, 1430, 34, GRN, prog(t, s12.lin - 0.2, s12.lin + 0.15));
      const bk = sm(t, s12.seg - 0.1, s12.seg + 0.3, outBack), press = t > s12.dif + 0.6; if (bk > 0) { ctx.save(); ctx.translate(540, 300); const pr = bk * (1 - 0.06 * pulse(t, s12.dif + 0.6, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -60, 480, 120, 60); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 52, { w: 900, color: INK }); ctx.restore(); }
      txt('PRÓXIMO: POR QUE TIRAR 800 É TÃO DIFÍCIL', 540, 1530, 30, { w: 900, color: MU, a: prog(t, s12.oit - 0.3, s12.oit) });
      header();
    }

    // ---------- legendas ----------
    const HL = new Set(['prouni', 'fies', 'quatrocentos', 'cinquenta', 'garanta', 'derruba', 'branco', 'erro', 'calculadora', 'injusto', 'explicacao', 'oito', 'quinze', 'quatro', 'quarenta', 'cento', 'oitenta', 'redacao', 'contando', 'tres', 'dificil', 'separa', 'logico', 'valem', 'zero', 'minimo', 'maximo', 'duzentos', 'terceiro', 'sisu', 'link', 'trinta', 'mesma', 'nota', 'surpreender', 'cinco', 'milhoes', 'mil', 'novecentos', 'municipios', 'tri', 'coerencia', 'faceis', 'medias', 'coerente', 'dificeis', 'chute', 'cai', 'media', 'seiscentos', 'sessenta', 'pesos', 'comenta', 'segue', 'oitocentos']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1610); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? AMB : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12];
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
