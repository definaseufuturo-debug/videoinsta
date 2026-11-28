/*
 * SALÁRIO MÍNIMO — debate A x B, estilo "jornal de dados" em papel quadriculado, 9:16.
 * Dados do DIEESE (cesta básica out/2026).
 * Neutro: sem fotos, cores neutras (laranja = Flávio, turquesa = Lula), números oficiais do TSE.
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
  const milhar = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const pct = v => v.toFixed(1).replace('.', ',') + '%';

  function create(TL, env) {
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 6;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Gancho', 'A conta', 'Lado A', 'Lado B', 'Dado que incomoda', 'CTA'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const PAPER = '#f2f1ec', GRIDC = 'rgba(0,0,0,0.06)', INK = '#111111', GREY = '#d8d6cf', MUTE = '#6b6860';
    const RA = '#e5342b', RB = '#1f5fd6', LIME = '#c8f53a';
    // ---------------- primitivas ----------------
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) {
      if (o.scale !== undefined && o.scale <= 0.001) return;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale);
      ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1;
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || PAPER; ctx.strokeText(s, 0, 0); }
      ctx.fillStyle = o.color || INK; ctx.fillText(s, 0, 0); ctx.restore();
    }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { // texto espaçado (estilo jornal)
      const sp = o.sp ?? size * 0.35, w = o.w || 600; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp;
      let cx = o.align === 'left' ? x : x - tot / 2; ga((o.a ?? 1));
      [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || INK }); cx += ws[i] + sp; }); ga(1);
      return tot;
    }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function boxed(s, x, y, size, k, o = {}) { // caixa branca com borda preta e sombra sólida
      if (k <= 0) return; const w = tw(s, size, 900) + size * 0.9, h = size * 1.55, sc = outBack(k);
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3));
      ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 8, -h / 2 + 8, w, h); ctx.fillStyle = o.fill || '#fff'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-w / 2, -h / 2, w, h);
      txt(s, 0, 3, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1);
    }
    function tag(s, x, y, size, col, k) { // etiqueta colorida (nome do candidato)
      if (k <= 0) return; const w = tw(s, size, 900) + size * 0.8, h = size * 1.45, sc = outBack(k);
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3));
      ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w, h); ctx.fillStyle = col; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-w / 2, -h / 2, w, h);
      txt(s, 0, 3, size, { w: 900, color: '#fff' }); ctx.restore(); ga(1);
    }
    function stamp(s, x, y, k, o = {}) {
      if (k <= 0) return; const sc = lerp(2.2, 1, outC(k)), size = o.size || 90, w = tw(s, size, 900) + 60, h = size * 1.4;
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(sc, sc); ga(clamp(k * 3));
      ctx.fillStyle = 'rgba(242,241,236,0.92)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 9; ctx.strokeStyle = o.col || INK; ctx.strokeRect(-w / 2, -h / 2, w, h);
      txt(s, 0, 4, size, { w: 900, color: o.col || INK }); ctx.restore(); ga(1);
    }
    function paper(t) {
      scr(); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 2; ctx.strokeStyle = GRIDC;
      for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
    function header() {
      spaced('OS ESTADOS · 2º TURNO 2026', 540, 120, 30, { w: 600, sp: 9, color: INK });
      ctx.fillStyle = INK; ctx.fillRect(140, 150, 800, 3);
    }

    function header() { spaced('DEBATE · SALÁRIO MÍNIMO', 540, 120, 30, { w: 600, sp: 9, color: INK }); ctx.fillStyle = INK; ctx.fillRect(140, 150, 800, 3); }
    function blk(x, y, w, h, fill, k = 1) { ctx.fillStyle = INK; ctx.fillRect(x + 8, y + 8, w * k, h); ctx.fillStyle = fill; ctx.fillRect(x, y, w * k, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w * k, h); }
    const wrap = (s, x, y, size, o = {}) => { const ls = s.split('\n'); ls.forEach((l, i) => txt(l, x, y + i * size * 1.15, size, o)); };
    function src(s) { txt(s, 540, 1690, 24, { w: 600, color: MUTE }); }

    const brl = v => 'R$ ' + milhar(v);
    const person = (x, y, s, col) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -34, 28, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.roundRect(-38, 6, 76, 82, 26); ctx.fill(); ctx.restore(); };
    function hbar(label, y, frac, k, col, valTxt, labelSize = 38) {
      txt(label, 540, y - 50, labelSize, { w: 900, a: clamp(k * 3) });
      ctx.fillStyle = INK; ctx.fillRect(108, y + 8, 880, 80); ctx.fillStyle = '#fff'; ctx.fillRect(100, y, 880, 80);
      ctx.fillStyle = col; ctx.fillRect(100, y, 880 * frac * outC(k), 80); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(100, y, 880, 80);
      if (valTxt && k > 0.5) txt(valTxt, 100 + 880 * frac * outC(k) + (frac > 0.5 ? -20 : 20), y + 42, 44, { w: 900, color: frac > 0.5 ? '#fff' : INK, align: frac > 0.5 ? 'right' : 'left' });
    }
    // ===== CENA 1: gancho =====
    const s1 = { set: wt('c1', 'sete'), die: wt('c1', 'dieese'), ver: wt('c1', 'verdade'), sei: wt('c1', 'seiscentos'), dev: wt('c1', 'devia'), sub: wt('c1', 'subir') };
    cue(0, 'music', { part: 'intro' }); cue(s1.set, 'impact', { gain: 0.6 }); cue(s1.ver, 'pop'); cue(s1.sei, 'ding'); cue(s1.dev, 'scratch'); cue(s1.sub + 0.3, 'tada'); cue(s1.sub + 0.3, 'music', { part: 'groove' });
    function scene1(t) {
      const k = sm(t, s1.set - 0.2, s1.die + 0.3, outC);
      txt('R$ ' + milhar(7992 * k), 540, 360, 170, { w: 900, color: RA, scale: sm(t, s1.set - 0.25, s1.set + 0.1, outBack) });
      txt('O SALÁRIO MÍNIMO NECESSÁRIO, SEGUNDO O DIEESE', 540, 480, 34, { w: 800, a: prog(t, s1.die - 0.2, s1.die + 0.1) });
      hbar('O MÍNIMO DE VERDADE (2026)', 660, 1621 / 7992, prog(t, s1.ver - 0.1, s1.sei + 0.8), INK, 'R$ 1.621');
      hbar('O NECESSÁRIO (FAMÍLIA DE 4)', 860, 1, prog(t, s1.ver + 0.1, s1.sei + 0.9), RA, 'R$ 7.992');
      const ks = sm(t, s1.sei + 0.7, s1.sei + 1.1, outBack);
      if (ks > 0) { txt('SÓ 20%', 540, 1090, 150, { w: 900, color: INK, scale: ks }); txt('do necessário é o que o mínimo cobre', 540, 1190, 36, { w: 800, color: MUTE, a: clamp(ks) }); }
      boxed('O MÍNIMO DEVIA SUBIR BEM MAIS?', 540, 1370, 42, prog(t, s1.dev - 0.1, s1.dev + 0.25), { fill: LIME });
      src('Fonte: DIEESE (out/2026) · mínimo vigente R$ 1.621');
    }
    // ===== CENA 2: família de 4 = 4,93 mínimos =====
    const s2 = { fam: wt('c2', 'familia'), qua: wt('c2', 'quatro', 0), out: wt('c2', 'outubro'), nov: wt('c2', 'noventa'), vez: wt('c2', 'minimos') };
    cue(s2.fam, 'pop'); cue(s2.out, 'ding'); cue(s2.nov, 'stretch', { dur: 0.6 }); cue(s2.vez, 'lock');
    function scene2(t) {
      spaced('A CONTA DO DIEESE', 540, 250, 34, { w: 700, sp: 8 });
      for (let i = 0; i < 4; i++) { const a = prog(t, s2.qua - 0.2 + i * 0.12, s2.qua + 0.1 + i * 0.12); if (a > 0) person(240 + i * 200, 440, outBack(a), INK); }
      txt('FAMÍLIA DE 4 PESSOAS · 1 SÓ SALÁRIO', 540, 590, 34, { w: 800, color: MUTE, a: prog(t, s2.fam, s2.fam + 0.3) });
      const t0 = s2.out + 0.2, dur = s2.vez - t0 + 0.2;
      for (let i = 0; i < 5; i++) {
        const x = 70 + i * 190, y = 760, f = i < 4 ? 1 : 0.93, k = prog(t, t0 + dur * i / 5, t0 + dur * (i + 1) / 5);
        ctx.fillStyle = INK; ctx.fillRect(x + 8, y + 8, 170, 190); ctx.fillStyle = '#fff'; ctx.fillRect(x, y, 170, 190);
        ctx.fillStyle = i < 4 ? INK : RA; ctx.fillRect(x, y + 190 * (1 - f * outC(k)), 170, 190 * f * outC(k)); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(x, y, 170, 190);
        if (k > 0.4) { txt('1.621', x + 85, y + 80, 36, { w: 900, color: '#fff' }); txt('mínimo', x + 85, y + 125, 26, { w: 700, color: '#fff' }); }
      }
      const kk = sm(t, s2.vez - 0.2, s2.vez + 0.3, outBack);
      if (kk > 0) { txt('4,93 MÍNIMOS', 540, 1130, 108, { w: 900, color: RA, scale: kk }); txt('R$ 7.992,47 · OUTUBRO DE 2026', 540, 1240, 38, { w: 800, a: clamp(kk) }); }
      src('Fonte: DIEESE, Pesquisa Nacional da Cesta Básica (10/11/2026)');
    }
    // ===== CENA 3: LADO A =====
    const s3 = { sim: wt('c3', 'sim'), ces: wt('c3', 'cesta'), cin: wt('c3', 'cinquenta'), pau: wt('c3', 'paulo'), ses: wt('c3', 'sessenta'), oit: wt('c3', 'oitenta'), bil: wt('c3', 'bilhoes'), eco: wt('c3', 'economia') };
    cue(s3.sim, 'impact', { gain: 0.5 }); cue(s3.cin, 'pop'); cue(s3.ses, 'pop'); cue(s3.oit, 'tada');
    function scene3(t) {
      blk(60, 230, 960, 120, RA, sm(t, B[2] + 0.05, B[2] + 0.4)); txt('LADO A · O MÍNIMO PRECISA SUBIR MAIS', 540, 290, 42, { w: 900, color: '#fff', a: sm(t, B[2] + 0.2, B[2] + 0.5) });
      hbar('CESTA BÁSICA NO MÍNIMO LÍQUIDO (MÉDIA DAS CAPITAIS)', 520, 0.5201, prog(t, s3.cin - 0.2, s3.cin + 0.7), RA, '52%', 30);
      hbar('SÓ EM SÃO PAULO', 720, 0.6345, prog(t, s3.ses - 0.2, s3.ses + 0.7), RA, '63%', 34);
      const mk = sm(t, s3.oit - 0.2, s3.oit + 0.25, outBack);
      if (mk > 0) { txt('R$ 81,7 BI', 540, 1050, 160, { w: 900, color: RA, scale: mk }); txt('injetados na economia pelo novo mínimo (est. DIEESE)', 540, 1160, 34, { w: 800, a: clamp(mk) }); }
      src('Fonte: DIEESE (out/2026; est. de dez/2025 via Agência Brasil)');
    }
    // ===== CENA 4: LADO B =====
    const s4 = { nao: wt('c4', 'nao'), cad: wt('c4', 'cada'), tre: wt('c4', 'trezentos'), pre: wt('c4', 'previdencia'), tri: wt('c4', 'trinta'), qua: wt('c4', 'quase'), pis: wt('c4', 'piso') };
    cue(s4.nao, 'impact', { gain: 0.5 }); cue(s4.tre, 'pop'); cue(s4.tri, 'pop'); cue(s4.qua, 'tada');
    function scene4(t) {
      blk(60, 230, 960, 120, RB, sm(t, B[3] + 0.05, B[3] + 0.4)); txt('LADO B · SUBIR COM CALMA, A CONTA É ALTA', 540, 290, 38, { w: 900, color: '#fff', a: sm(t, B[3] + 0.2, B[3] + 0.5) });
      const rows = [[s4.tre, 'R$ 380 MI', 'à Previdência a cada R$ 1 de aumento', 520], [s4.tri, 'R$ 39 BI', 'a mais na Previdência só em 2026', 880], [s4.qua, '62 MILHÕES', 'de brasileiros com renda ligada ao piso', 1240]];
      for (const [tt, big, small, y] of rows) { const k = sm(t, tt - 0.25, tt + 0.25, outBack); if (k > 0) { txt(big, 540, y, 130, { w: 900, color: RB, scale: k }); txt(small, 540, y + 100, 36, { w: 800, a: clamp(k) }); } }
      src('Fonte: DIEESE via Agência Brasil (26/12/2025) e Estadão Conteúdo (22/12/2025)');
    }
    // ===== CENA 5: o dado que incomoda os dois =====
    const s5 = { inc: wt('c5', 'incomoda'), sei: wt('c5', 'seis'), nec: wt('c5', 'necessario'), doz: wt('c5', 'doze'), dis: wt('c5', 'distancia'), ses: wt('c5', 'sessenta'), nov: wt('c5', 'noventa') };
    cue(s5.inc, 'scratch'); cue(s5.sei, 'pop'); cue(s5.doz, 'stretch', { dur: 0.6 }); cue(s5.ses, 'ding'); cue(s5.nov, 'lock');
    function scene5(t) {
      blk(60, 230, 960, 120, LIME, sm(t, B[4] + 0.05, B[4] + 0.4)); txt('O DADO QUE INCOMODA OS DOIS', 540, 290, 46, { w: 900, a: sm(t, B[4] + 0.2, B[4] + 0.5) });
      txt('EM UM ANO (OUT/2025 A OUT/2026)', 540, 410, 32, { w: 800, color: MUTE });
      hbar('SALÁRIO MÍNIMO', 520, 6.8 / 12.3, prog(t, s5.sei - 0.2, s5.sei + 0.7), INK, '+6,8%');
      hbar('O NECESSÁRIO (DIEESE)', 720, 1, prog(t, s5.doz - 0.2, s5.doz + 0.7), RA, '+12,3%');
      txt('A DISTÂNCIA ENTRE OS DOIS', 540, 960, 38, { w: 900, a: prog(t, s5.dis - 0.1, s5.dis + 0.2) });
      const k1 = sm(t, s5.ses - 0.2, s5.ses + 0.2, outBack), k2 = sm(t, s5.nov - 0.2, s5.nov + 0.2, outBack);
      if (k1 > 0) txt('4,69x', 280, 1140, 130, { w: 900, color: MUTE, scale: k1 });
      if (k2 > 0) { txt('4,93x', 800, 1140, 130, { w: 900, color: RA, scale: k2 }); }
      if (k1 > 0) txt('PARA', 540, 1140, 40, { w: 800, color: MUTE, a: clamp(k2 * 3 + 0.3) });
      txt('subiu o mínimo, subiu a conta, e o buraco cresceu', 540, 1290, 34, { w: 800, color: MUTE, a: prog(t, s5.nov + 0.4, s5.nov + 0.8) });
      src('Fonte: DIEESE (out/2025: R$ 7.116,83 · out/2026: R$ 7.992,47)');
    }
    // ===== CENA 6: CTA =====
    const s6 = { voc: wt('c6', 'voce'), a: wt('c6', 'a'), ou: wt('c6', 'ou'), com: wt('c6', 'comenta'), mar: wt('c6', 'marca'), ama: wt('c6', 'amanha'), seg: wt('c6', 'segue') };
    cue(B[5], 'music', { part: 'outro' }); cue(s6.a, 'pop'); cue(s6.ou + 0.25, 'pop'); cue(s6.com, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t) {
      txt('E VOCÊ?', 540, 280, 120, { w: 900, scale: sm(t, s6.voc - 0.2, s6.voc + 0.15, outBack) });
      const ka = sm(t, s6.a - 0.1, s6.a + 0.25, outBack), kb = sm(t, s6.ou + 0.1, s6.ou + 0.45, outBack);
      if (ka > 0) { ctx.save(); ctx.translate(290, 520); ctx.scale(ka, ka); blk(-200, -120, 400, 240, RA); txt('A', 0, -30, 130, { w: 900, color: '#fff' }); txt('SUBIR MAIS', 0, 70, 44, { w: 900, color: '#fff' }); ctx.restore(); }
      if (kb > 0) { ctx.save(); ctx.translate(790, 520); ctx.scale(kb, kb); blk(-200, -120, 400, 240, RB); txt('B', 0, -30, 130, { w: 900, color: '#fff' }); txt('COM CALMA', 0, 70, 44, { w: 900, color: '#fff' }); ctx.restore(); }
      boxed('COMENTA A OU B', 540, 800, 56, prog(t, s6.com - 0.15, s6.com + 0.1), { fill: LIME });
      txt('E MARCA QUEM DISCORDA', 540, 920, 42, { w: 900, a: prog(t, s6.mar - 0.1, s6.mar + 0.2) });
      const ak = prog(t, s6.ama - 0.1, s6.ama + 0.3);
      if (ak > 0) { ga(ak); ctx.fillStyle = INK; ctx.fillRect(80, 1010, 920, 190); txt('AMANHÃ', 540, 1060, 34, { w: 700, color: LIME }); txt('O BRASIL COBRA IMPOSTO DEMAIS?', 540, 1115, 46, { w: 900, color: '#fff' }); txt('A CARGA TRIBUTÁRIA COMPARADA COM O MUNDO', 540, 1170, 30, { w: 800, color: '#fff' }); ga(1); }
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1370); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); blk(-250, -70, 500, 140, press ? '#fff' : LIME); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 60, { w: 900 }); ctx.restore(); txt('@mindloop_u', 540, 1490, 40, { w: 800, color: MUTE, a: bk }); }
    }
    // ================= legendas (caixa branca, palavra falada em verde-limão) =================
    const groups = []; {
      let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); }
      flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; });
    }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return;
      scr(); const size = 62, pad = 26;
      const words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 18, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
      const pop = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15)), bw = total + pad * 2, bh = size * 1.6;
      ctx.save(); ctx.translate(540, 1600); ctx.scale(pop, pop);
      ctx.fillStyle = INK; ctx.fillRect(-bw / 2 + 8, -bh / 2 + 8, bw, bh); ctx.fillStyle = '#fff'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      let x = -total / 2;
      g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < (w.end + 0.02); if (cur) { ctx.fillStyle = LIME; ctx.fillRect(x - 8, -size * 0.62, ws[i] + 16, size * 1.24); } txt(words[i], x + ws[i] / 2, 3, size, { w: 900 }); x += ws[i] + sp; });
      ctx.restore();
    }


    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6];
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      paper(t); header(); ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t);
      ctx.fillStyle = '#fff'; ctx.fillRect(40, 1730, 330, 50); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeRect(40, 1730, 330, 50); spaced('VOZ GERADA POR IA', 205, 1757, 22, { w: 600, sp: 6 });
      txt('conteúdo informativo · debate de ideias', 1040, 1757, 22, { w: 600, color: MUTE, align: 'right' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
