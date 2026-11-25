/*
 * BETS PROIBIDAS — debate A x B, estilo "jornal de dados" em papel quadriculado, 9:16.
 * Mapa real dos estados (assets/br.json, simplificado de GeoJSON público do IBGE via click_that_hood).
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
    const NAMES = ['Gancho', 'A MP', 'Lado A', 'Lado B', 'Dado que incomoda', 'CTA'];
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

    function header() { spaced('DEBATE · BETS PROIBIDAS', 540, 120, 30, { w: 600, sp: 9, color: INK }); ctx.fillStyle = INK; ctx.fillRect(140, 150, 800, 3); }
    function blk(x, y, w, h, fill, k = 1) { ctx.fillStyle = INK; ctx.fillRect(x + 8, y + 8, w * k, h); ctx.fillStyle = fill; ctx.fillRect(x, y, w * k, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w * k, h); }
    const wrap = (s, x, y, size, o = {}) => { const ls = s.split('\n'); ls.forEach((l, i) => txt(l, x, y + i * size * 1.15, size, o)); };
    function src(s) { txt(s, 540, 1690, 24, { w: 600, color: MUTE }); }

    // ===== CENA 1: gancho, contador de R$ 62,5 bi =====
    const s1 = { sess: wt('c1', 'sessenta'), bil: wt('c1', 'bilhoes'), fam: wt('c1', 'familias'), pro: wt('c1', 'proibiu'), ace: wt('c1', 'acertou') };
    cue(0, 'music', { part: 'intro' }); cue(s1.sess, 'impact', { gain: 0.6 }); cue(s1.pro, 'scratch'); cue(s1.ace, 'tada'); cue(s1.ace, 'music', { part: 'groove' });
    function scene1(t) {
      const k = sm(t, s1.sess - 0.2, s1.bil + 0.4, outC), v = 62.5 * k;
      txt('R$ ' + v.toFixed(1).replace('.', ','), 540, 420, 190, { w: 900, color: RA, scale: sm(t, s1.sess - 0.25, s1.sess + 0.1, outBack) });
      txt('BILHÕES', 540, 570, 110, { w: 900, a: sm(t, s1.bil - 0.2, s1.bil + 0.1) });
      boxed('PERDIDOS EM BETS', 540, 720, 56, prog(t, s1.fam - 0.1, s1.fam + 0.25), { fill: '#fff' });
      txt('PELAS FAMÍLIAS BRASILEIRAS · 2025', 540, 830, 36, { w: 800, color: MUTE, a: prog(t, s1.fam, s1.fam + 0.3) });
      // moedas caindo
      for (let i = 0; i < 14; i++) { const t0 = s1.sess + i * 0.13, y = 900 + ((t - t0) * 700) % 1; if (t < t0) continue; const yy = 880 + clamp((t - t0) / 1.2) * 480; ga(1 - clamp((t - t0) / 1.2)); ctx.fillStyle = '#f2b21c'; ctx.beginPath(); ctx.arc(120 + i * 62, yy, 22, 0, TAU); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); txt('$', 120 + i * 62, yy + 2, 26, { w: 900 }); ga(1); }
      stamp('PROIBIRAM.', 540, 1180, prog(t, s1.pro - 0.1, s1.pro + 0.25), { col: RA, size: 100, rot: -0.06 });
      stamp('ACERTARAM?', 540, 1360, prog(t, s1.ace - 0.15, s1.ace + 0.2), { col: INK, size: 100, rot: 0.05 });
    }
    // ===== CENA 2: a MP em linha do tempo =====
    const s2 = { med: wt('c2', 'medida'), set: wt('c2', 'setembro'), con: wt('c2', 'congresso'), mar: wt('c2', 'marco'), lei: wt('c2', 'lei') };
    cue(s2.med, 'pop'); cue(s2.set, 'ding'); cue(s2.con, 'pop'); cue(s2.mar, 'lock');
    function scene2(t) {
      spaced('MEDIDA PROVISÓRIA 1.394/2026', 540, 260, 36, { w: 700, sp: 8, a: sm(t, s2.med - 0.3, s2.med) });
      const y = 760, x0 = 160, x1 = 920, k = prog(t, s2.set - 0.2, s2.mar + 0.2);
      ctx.fillStyle = INK; ctx.fillRect(x0, y - 6, (x1 - x0) * k, 12);
      const pts = [[x0, '25/09', 'MP PUBLICADA', 'apostas online\nproibidas', s2.set, RA], [540, 'OUT', 'SITES FORA\nDO AR', '', s2.con - 0.6, INK], [x1, '05/03/27', 'PRAZO DO\nCONGRESSO', 'vira lei\nou cai', s2.mar, RB]];
      pts.forEach(([x, d, l, sub, tt, col]) => { const kk = prog(t, tt - 0.1, tt + 0.25); if (kk <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(kk), outBack(kk)); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
        txt(d, x, y - 90, 54, { w: 900, color: col, a: kk }); wrap(l, x, y + 100, 34, { w: 900, a: kk }); if (sub) wrap(sub, x, y + 200, 30, { w: 700, color: MUTE, a: kk }); });
      boxed('O CONGRESSO DECIDE', 540, 1180, 56, prog(t, s2.con - 0.1, s2.con + 0.25), { fill: LIME });
      src('Fonte: Senado Notícias (28/09/2026) · Agência Brasil (11/11/2026)');
    }
    // ===== CENA 3: LADO A =====
    const s3 = { fav: wt('c3', 'favor'), rea: wt('c3', 'real'), qua: wt('c3', 'quatro'), mil: wt('c3', 'milhao'), pro: wt('c3', 'problematico') };
    cue(s3.fav, 'impact', { gain: 0.5 }); cue(s3.rea, 'pop'); cue(s3.qua, 'tada'); cue(s3.mil, 'ding');
    function scene3(t) {
      blk(60, 230, 960, 120, RA, sm(t, B[2] + 0.05, B[2] + 0.4)); txt('LADO A · A FAVOR DA PROIBIÇÃO', 540, 290, 46, { w: 900, color: '#fff', a: sm(t, B[2] + 0.2, B[2] + 0.5) });
      // barras 1 x 4
      const bk = prog(t, s3.rea - 0.1, s3.rea + 0.4), qk = prog(t, s3.qua - 0.3, s3.qua + 0.3), base = 1000, u = 118;
      ctx.fillStyle = INK; ctx.fillRect(100, base, 880, 5);
      if (bk > 0) { ga(bk); blk(200, base - u * outC(bk), 200, u * outC(bk), '#fff'); txt('R$ 1', 300, base + 55, 46, { w: 900 }); txt('ARRECADADO', 300, base + 100, 28, { w: 700, color: MUTE }); ga(1); }
      if (qk > 0) { const h = u * 3.9 * outC(qk); blk(640, base - h, 200, h, RA); txt('R$ 4', 740, base - h - 45, 70, { w: 900, color: RA, a: clamp(qk * 2) }); txt('EM DANOS', 740, base + 55, 46, { w: 900, color: RA }); txt('SAÚDE, FAMÍLIAS, DÍVIDAS', 740, base + 100, 26, { w: 700, color: MUTE }); }
      const mk = sm(t, s3.mil - 0.2, s3.mil + 0.2, outBack);
      if (mk > 0) { txt('1,4 MILHÃO', 540, 1290, 96, { w: 900, color: RA, scale: mk }); txt('EM JOGO PROBLEMÁTICO', 540, 1380, 40, { w: 800, a: clamp(mk) }); }
      src('Fonte: Ieps (via Brasil de Fato, 28/09/2026) · estimativa de 2025');
    }
    // ===== CENA 4: LADO B =====
    const s4 = { con: wt('c4', 'contra'), emp: wt('c4', 'empurra'), cla: wt('c4', 'clandestino'), pre: wt('c4', 'prevê'), bil: wt('c4', 'bilhao'), imp: wt('c4', 'imposto') };
    cue(s4.con, 'impact', { gain: 0.5 }); cue(s4.emp, 'whoosh', { dur: 0.4 }); cue(s4.cla, 'scratch'); cue(s4.bil, 'tada');
    function scene4(t) {
      blk(60, 230, 960, 120, RB, sm(t, B[3] + 0.05, B[3] + 0.4)); txt('LADO B · CONTRA A PROIBIÇÃO', 540, 290, 46, { w: 900, color: '#fff', a: sm(t, B[3] + 0.2, B[3] + 0.5) });
      // fluxo apostador -> site legal (fechado) -> site clandestino
      const k1 = prog(t, s4.emp - 0.2, s4.emp + 0.5), k2 = prog(t, s4.cla - 0.1, s4.cla + 0.25);
      blk(80, 520, 280, 150, '#fff', sm(t, B[3] + 0.3, B[3] + 0.7)); txt('APOSTADOR', 220, 595, 38, { w: 900, a: sm(t, B[3] + 0.5, B[3] + 0.8) });
      blk(720, 450, 280, 120, GREY, 1); txt('SITE LEGAL', 860, 510, 34, { w: 900, color: MUTE }); ctx.lineWidth = 10; ctx.strokeStyle = RA; ctx.beginPath(); ctx.moveTo(730, 460); ctx.lineTo(990, 560); ctx.moveTo(990, 460); ctx.lineTo(730, 560); ctx.stroke();
      blk(720, 660, 280, 120, '#222', k2); if (k2 > 0.5) txt('SITE CLANDESTINO', 860, 720, 28, { w: 900, color: '#fff' });
      if (k1 > 0) { ctx.strokeStyle = RB; ctx.lineWidth = 12; ctx.setLineDash([24, 16]); ctx.lineDashOffset = -t * 120; ctx.beginPath(); ctx.moveTo(370, 620); ctx.lineTo(370 + 340 * k1, 620 + 80 * k1); ctx.stroke(); ctx.setLineDash([]); }
      txt('onde o prêmio pode nem ser pago', 540, 880, 34, { w: 700, color: MUTE, a: k2 });
      const mk = sm(t, s4.bil - 0.3, s4.bil + 0.2, outBack);
      if (mk > 0) { txt('- R$ 1,5 BI', 540, 1130, 140, { w: 900, color: RB, scale: mk }); txt('DE IMPOSTO EM 2026 (PREVISÃO DO GOVERNO)', 540, 1240, 34, { w: 800, a: clamp(mk) }); }
      src('Fonte: FGV Ibre (via Broadcast, 12/11/2026) · Senado Notícias');
    }
    // ===== CENA 5: o dado que incomoda os dois =====
    const s5 = { inc: wt('c5', 'incomoda'), cin: wt('c5', 'cinco'), cinq: wt('c5', 'cinquenta'), saud: wt('c5', 'saude') };
    cue(s5.inc, 'scratch'); cue(s5.cin, 'stretch', { dur: 0.6 }); cue(s5.cinq, 'lock'); cue(s5.saud, 'ding');
    function scene5(t) {
      blk(60, 230, 960, 120, LIME, sm(t, B[4] + 0.05, B[4] + 0.4)); txt('O DADO QUE INCOMODA OS DOIS', 540, 290, 46, { w: 900, a: sm(t, B[4] + 0.2, B[4] + 0.5) });
      const bk = prog(t, s5.cin - 0.3, s5.cin + 0.6), w = 880 * outC(bk);
      txt('QUASE R$ 5 BI ARRECADADOS', 540, 470, 62, { w: 900, a: clamp(bk * 2) }); blk(100, 520, 880, 110, '#fff', 1); ctx.fillStyle = '#f2b21c'; ctx.fillRect(100, 520, w, 110); ctx.lineWidth = 5; ctx.strokeRect(100, 520, 880, 110);
      const sk = prog(t, s5.cinq - 0.1, s5.cinq + 0.4);
      if (sk > 0) { txt('R$ 57 MILHÕES PARA A SAÚDE', 540, 800, 52, { w: 900, color: RA, a: clamp(sk * 2) }); ctx.fillStyle = RA; ctx.fillRect(100, 520, 880 * 0.012 * outC(sk) + 4, 110); ctx.lineWidth = 5; ctx.strokeRect(100, 520, 880, 110); }
      const mk = sm(t, s5.saud - 0.2, s5.saud + 0.2, outBack); if (mk > 0) txt('1%', 540, 1030, 260, { w: 900, color: RA, scale: mk });
      txt('pouco mais de 1% do que as bets pagaram', 540, 1200, 36, { w: 800, color: MUTE, a: clamp(mk) });
      src('Fonte: Brasil de Fato (28/09/2026) · fev/2025 a fev/2026');
    }
    // ===== CENA 6: CTA =====
    const s6 = { voc: wt('c6', 'voce'), a: wt('c6', 'a'), ou: wt('c6', 'ou'), com: wt('c6', 'comenta'), mar: wt('c6', 'marca'), ama: wt('c6', 'amanha'), seg: wt('c6', 'segue') };
    cue(B[5], 'music', { part: 'outro' }); cue(s6.a, 'pop'); cue(s6.ou + 0.25, 'pop'); cue(s6.com, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t) {
      txt('E VOCÊ?', 540, 280, 120, { w: 900, scale: sm(t, s6.voc - 0.2, s6.voc + 0.15, outBack) });
      const ka = sm(t, s6.a - 0.1, s6.a + 0.25, outBack), kb = sm(t, s6.ou + 0.1, s6.ou + 0.45, outBack);
      if (ka > 0) { ctx.save(); ctx.translate(290, 520); ctx.scale(ka, ka); blk(-200, -120, 400, 240, RA); txt('A', 0, -30, 130, { w: 900, color: '#fff' }); txt('FAVOR', 0, 70, 44, { w: 900, color: '#fff' }); ctx.restore(); }
      if (kb > 0) { ctx.save(); ctx.translate(790, 520); ctx.scale(kb, kb); blk(-200, -120, 400, 240, RB); txt('B', 0, -30, 130, { w: 900, color: '#fff' }); txt('CONTRA', 0, 70, 44, { w: 900, color: '#fff' }); ctx.restore(); }
      boxed('COMENTA A OU B', 540, 800, 56, prog(t, s6.com - 0.15, s6.com + 0.1), { fill: LIME });
      txt('E MARCA QUEM DISCORDA', 540, 920, 42, { w: 900, a: prog(t, s6.mar - 0.1, s6.mar + 0.2) });
      const ak = prog(t, s6.ama - 0.1, s6.ama + 0.3);
      if (ak > 0) { ga(ak); ctx.fillStyle = INK; ctx.fillRect(80, 1010, 920, 190); txt('AMANHÃ', 540, 1060, 34, { w: 700, color: LIME }); txt('REDE SOCIAL PROIBIDA', 540, 1115, 52, { w: 900, color: '#fff' }); txt('PARA MENOR DE 16: CERTO OU EXAGERO?', 540, 1170, 34, { w: 800, color: '#fff' }); ga(1); }
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
