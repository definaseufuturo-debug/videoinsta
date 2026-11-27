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
    const NAMES = ['Gancho', 'Mapa', 'Lado A', 'Lado B', 'Dado que incomoda', 'CTA'];
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

    function header() { spaced('DEBATE · REDES PROIBIDAS', 540, 120, 30, { w: 600, sp: 9, color: INK }); ctx.fillStyle = INK; ctx.fillRect(140, 150, 800, 3); }
    function blk(x, y, w, h, fill, k = 1) { ctx.fillStyle = INK; ctx.fillRect(x + 8, y + 8, w * k, h); ctx.fillStyle = fill; ctx.fillRect(x, y, w * k, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w * k, h); }
    const wrap = (s, x, y, size, o = {}) => { const ls = s.split('\n'); ls.forEach((l, i) => txt(l, x, y + i * size * 1.15, size, o)); };
    function src(s) { txt(s, 540, 1690, 24, { w: 600, color: MUTE }); }

    // ===== CENA 1: gancho =====
    const s1 = { qua: wt('c1', 'quatro'), set: wt('c1', 'setecentas'), con: wt('c1', 'contas'), oit: wt('c1', 'oito'), jov: wt('c1', 'jovens'), pro: wt('c1', 'proibir'), cer: wt('c1', 'certo'), exa: wt('c1', 'exagero') };
    cue(0, 'music', { part: 'intro' }); cue(s1.qua, 'impact', { gain: 0.6 }); cue(s1.oit, 'pop'); cue(s1.pro, 'scratch'); cue(s1.exa, 'tada'); cue(s1.exa, 'music', { part: 'groove' });
    function scene1(t) {
      const k = sm(t, s1.qua - 0.2, s1.set + 0.5, outC), v = 4.7 * k;
      txt(v.toFixed(1).replace('.', ',') + ' MI', 540, 380, 200, { w: 900, color: RA, scale: sm(t, s1.qua - 0.25, s1.qua + 0.1, outBack) });
      boxed('CONTAS DE MENORES DERRUBADAS', 540, 540, 48, prog(t, s1.con - 0.1, s1.con + 0.25), { fill: '#fff' });
      // 10 jovens, 8 continuam
      const ko = prog(t, s1.oit - 0.1, s1.oit + 1.0);
      for (let i = 0; i < 10; i++) { const x = 130 + (i % 5) * 205, y = 800 + Math.floor(i / 5) * 190, on = i < 8, a = prog(t, s1.oit - 0.1 + i * 0.07, s1.oit + 0.2 + i * 0.07);
        if (a <= 0) continue; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(a), outBack(a)); ctx.fillStyle = on ? INK : GREY; ctx.beginPath(); ctx.arc(0, -34, 28, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.roundRect(-38, 6, 76, 82, 26); ctx.fill(); ctx.restore(); }
      txt('8 EM CADA 10 JOVENS SEGUEM NAS REDES', 540, 1160, 46, { w: 900, color: RA, a: prog(t, s1.oit + 0.5, s1.oit + 0.9) });
      txt('AUSTRÁLIA · ESTUDO DA ESAFETY, 3 MESES DEPOIS', 540, 1225, 28, { w: 700, color: MUTE, a: prog(t, s1.oit + 0.5, s1.oit + 0.9) });
      stamp('CERTO?', 260, 1400, prog(t, s1.cer - 0.1, s1.cer + 0.25), { col: INK, size: 76, rot: -0.06 });
      stamp('EXAGERO?', 760, 1440, prog(t, s1.exa - 0.15, s1.exa + 0.2), { col: RA, size: 76, rot: 0.05 });
    }
    // ===== CENA 2: mapa-múndi =====
    const s2 = { aus: wt('c2', 'australia'), dez: wt('c2', 'dezembro'), mal: wt('c2', 'malasia'), din: wt('c2', 'dinamarca'), gre: wt('c2', 'grecia'), rei: wt('c2', 'reino') };
    cue(s2.aus, 'pop'); cue(s2.mal, 'pop'); cue(s2.din, 'pop'); cue(s2.gre, 'pop'); cue(s2.rei, 'ding');
    const GEO = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'assets', 'paises.json'), 'utf8'));
    function scene2(t) {
      spaced('QUEM JÁ PROIBIU OU VAI PROIBIR', 540, 250, 32, { w: 700, sp: 7 });
      const SC = 2.85, OX = 540 - 0 * SC, OY = 740, P = ([x, y]) => [OX + x * SC, OY + y * SC];
      const ST = { AUS: [s2.aus, RA, 'AUSTRÁLIA', '<16 · em vigor'], MYS: [s2.mal, RA, 'MALÁSIA', '<16'], DNK: [s2.din, RB, 'DINAMARCA', '<15 · anunciado'], GRC: [s2.gre, RB, 'GRÉCIA', '<15 · proposta'], GBR: [s2.rei, RB, 'REINO UNIDO', 'plano p/ 2027'] };
      for (const p of GEO.paises) {
        const st = ST[p.iso], on = st && t >= st[0] - 0.1, flash = st ? pulse(t, st[0], 0.1, 0.6) : 0;
        ctx.fillStyle = on ? st[1] : '#e4e2da'; ctx.strokeStyle = INK; ctx.lineWidth = on ? 3 : 1;
        for (const ring of p.poly) { ctx.beginPath(); ring.forEach((pt, i) => { const [x, y] = P(pt); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      }
      // etiquetas
      const L = { AUS: [0, 150, 60, 0], MYS: [-140, 190, 0, 0], DNK: [-180, -180, 0, 0], GRC: [-20, -70, 0, 0], GBR: [-210, -40, 0, 0] };
      const pos = { AUS: [134, 24], MYS: [113, -3], DNK: [9, -56], GRC: [22, -39], GBR: [-2, -54] };
      for (const iso in ST) { const [tt, col, nome, sub] = ST[iso], k = prog(t, tt - 0.05, tt + 0.3); if (k <= 0) continue; const [px, py] = P(pos[iso]);
        const lx = { AUS: 760, MYS: 330, DNK: 540, GRC: 890, GBR: 190 }[iso], ly = { AUS: 1190, MYS: 1190, DNK: 1030, GRC: 1030, GBR: 1030 }[iso];
        ga(k); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lx, ly - 30); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, 12, 0, TAU); ctx.fill(); ctx.stroke(); ga(1);
        ctx.save(); ctx.translate(lx, ly); ctx.scale(outBack(k), outBack(k)); ctx.fillStyle = INK; ctx.fillRect(-135 + 6, -30 + 6, 270, 80); ctx.fillStyle = '#fff'; ctx.fillRect(-135, -30, 270, 80); ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.strokeRect(-135, -30, 270, 80); txt(nome, 0, -4, 32, { w: 900, color: col }); txt(sub, 0, 30, 24, { w: 700, color: MUTE }); ctx.restore(); }
      boxed('10/12/2025: AUSTRÁLIA ABRIU O CAMINHO', 540, 1380, 40, prog(t, s2.dez - 0.1, s2.dez + 0.25), { fill: LIME });
      src('Fonte: eSafety (governo da Austrália) · Al Jazeera, 03/08/2026');
    }
    // ===== CENA 3: LADO A =====
    const s3 = { fav: wt('c3', 'favor'), lim: wt('c3', 'limite'), vel: wt('c3', 'velocidade'), fal: wt('c3', 'falha'), ace: wt('c3', 'aceleram'), qua: wt('c3', 'quatro'), res: wt('c3', 'restritas') };
    cue(s3.fav, 'impact', { gain: 0.5 }); cue(s3.lim, 'pop'); cue(s3.ace, 'whoosh', { dur: 0.4 }); cue(s3.qua, 'tada');
    function scene3(t) {
      blk(60, 230, 960, 120, RA, sm(t, B[2] + 0.05, B[2] + 0.4)); txt('LADO A · A FAVOR DA PROIBIÇÃO', 540, 290, 46, { w: 900, color: '#fff', a: sm(t, B[2] + 0.2, B[2] + 0.5) });
      const ks = sm(t, s3.lim - 0.2, s3.lim + 0.25, outBack);
      if (ks > 0) { ctx.save(); ctx.translate(300, 680); ctx.scale(ks, ks); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 150, 0, TAU); ctx.fill(); ctx.lineWidth = 26; ctx.strokeStyle = RA; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, 0, 164, 0, TAU); ctx.stroke(); txt('60', 0, 6, 140, { w: 900 }); ctx.restore(); }
      // carros: um respeita, outros aceleram
      const kc = prog(t, s3.vel - 0.1, s3.ace + 0.9);
      ctx.fillStyle = INK; ctx.fillRect(40, 930, 1000, 6);
      for (let i = 0; i < 5; i++) { const fast = i === 2 || i === 4, sp = fast ? 1200 : 420, x = -120 + (i * 230 + kc * sp * (fast && t > s3.ace - 0.2 ? 1 : 0.6)) % 1250; if (kc <= 0) continue; ctx.fillStyle = fast ? RA : '#fff'; ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.roundRect(x, 860, 110, 54, 14); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + 28, 918, 12, 0, TAU); ctx.arc(x + 82, 918, 12, 0, TAU); ctx.fill(); }
      txt('NÃO É FALHA SÓ PORQUE ALGUNS ACELERAM', 540, 1040, 38, { w: 900, color: RA, a: prog(t, s3.fal - 0.1, s3.fal + 0.25) });
      const mk = sm(t, s3.qua - 0.2, s3.qua + 0.2, outBack);
      if (mk > 0) { txt('4,7 MILHÕES', 540, 1230, 130, { w: 900, color: RA, scale: mk }); txt('DE CONTAS RESTRITAS', 540, 1330, 44, { w: 800, a: clamp(mk) }); }
      src('Fonte: eSafety (Austrália), dados de dez/2025 a jan/2026');
    }
    // ===== CENA 4: LADO B =====
    const s4 = { con: wt('c4', 'contra'), vpn: wt('c4', 'vpn'), fot: wt('c4', 'foto'), fal: wt('c4', 'falsa'), met: wt('c4', 'metade'), nun: wt('c4', 'nunca'), ida: wt('c4', 'idade') };
    cue(s4.con, 'impact', { gain: 0.5 }); cue(s4.vpn, 'pop'); cue(s4.fot, 'scratch'); cue(s4.met, 'tada');
    function scene4(t) {
      blk(60, 230, 960, 120, RB, sm(t, B[3] + 0.05, B[3] + 0.4)); txt('LADO B · CONTRA A PROIBIÇÃO', 540, 290, 46, { w: 900, color: '#fff', a: sm(t, B[3] + 0.2, B[3] + 0.5) });
      const kv = sm(t, s4.vpn - 0.2, s4.vpn + 0.25, outBack), kf = sm(t, s4.fot - 0.2, s4.fot + 0.25, outBack);
      if (kv > 0) { ctx.save(); ctx.translate(290, 560); ctx.scale(kv, kv); blk(-200, -100, 400, 200, '#fff'); txt('VPN', 0, -20, 90, { w: 900, color: RB }); txt('esconde o país', 0, 60, 32, { w: 700, color: MUTE }); ctx.restore(); }
      if (kf > 0) { ctx.save(); ctx.translate(790, 560); ctx.scale(kf, kf); blk(-200, -100, 400, 200, '#fff'); ctx.fillStyle = GREY; ctx.beginPath(); ctx.arc(-80, -10, 40, 0, TAU); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); txt('FOTO', 60, -34, 46, { w: 900, color: RB }); txt('FALSA', 60, 14, 46, { w: 900, color: RB }); txt('engana a checagem', 0, 70, 28, { w: 700, color: MUTE }); ctx.restore(); }
      // pizza 50%
      const kp = prog(t, s4.met - 0.2, s4.met + 0.6), cx = 540, cy = 1070, R = 190;
      ctx.fillStyle = GREY; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
      if (kp > 0) { ctx.fillStyle = RB; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * outC(kp)); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      txt('~50%', 540, 1070, 90, { w: 900, color: '#fff', stroke: 10, strokeColor: INK, a: prog(t, s4.met, s4.met + 0.3) });
      txt('DOS QUE FICARAM: A PLATAFORMA NUNCA CHECOU A IDADE', 540, 1340, 32, { w: 900, a: prog(t, s4.nun - 0.1, s4.nun + 0.25) });
      src('Fonte: Al Jazeera (03/08/2026) · Olhar Digital (31/07/2026), estudo da eSafety');
    }
    // ===== CENA 5: o dado que incomoda os dois =====
    const s5 = { inc: wt('c5', 'incomoda'), o1: wt('c5', 'oitenta', 0), o2: wt('c5', 'oitenta', 1), dia: wt('c5', 'diario'), ses: wt('c5', 'sessenta'), cin: wt('c5', 'cinquenta') };
    cue(s5.inc, 'scratch'); cue(s5.o1, 'stretch', { dur: 0.6 }); cue(s5.o2, 'lock'); cue(s5.ses, 'ding'); cue(s5.cin, 'lock');
    function scene5(t) {
      blk(60, 230, 960, 120, LIME, sm(t, B[4] + 0.05, B[4] + 0.4)); txt('O DADO QUE INCOMODA OS DOIS', 540, 290, 46, { w: 900, a: sm(t, B[4] + 0.2, B[4] + 0.5) });
      function bar(label, y, a, b, ta, tb, col) {
        txt(label, 540, y - 70, 40, { w: 900 });
        const ka = prog(t, ta - 0.3, ta + 0.5), kb = prog(t, tb - 0.2, tb + 0.4);
        ctx.fillStyle = INK; ctx.fillRect(100 + 8, y + 8, 880, 80); ctx.fillStyle = '#fff'; ctx.fillRect(100, y, 880, 80);
        ctx.fillStyle = col; ctx.fillRect(100, y, 880 * (a / 100) * outC(ka), 80);
        if (kb > 0) { ctx.fillStyle = INK; ctx.fillRect(100 + 880 * (b / 100) - 4, y - 14, 8, 108); }
        ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(100, y, 880, 80);
        txt(a + '%', 100 + 880 * (a / 100) - 70, y + 42, 44, { w: 900, color: '#fff', a: clamp(ka * 2) });
        if (kb > 0) txt('DEPOIS: ' + b + '%', 100 + 880 * (b / 100) - 20, y + 140, 40, { w: 900, color: RA, align: 'right', scale: outBack(kb) });
      }
      bar('JOVENS QUE USAM REDES (ANTES DA LEI)', 520, 86, 81, s5.o1, s5.o2, MUTE);
      bar('USO DIÁRIO (ANTES DA LEI)', 900, 60, 58, s5.ses, s5.cin, MUTE);
      const mk = sm(t, s5.cin + 0.2, s5.cin + 0.6, outBack); if (mk > 0) { txt('SÓ 2 PONTOS', 540, 1250, 120, { w: 900, color: RA, scale: mk }); txt('de queda no uso diário', 540, 1345, 40, { w: 800, color: MUTE, a: clamp(mk) }); }
      src('Fonte: eSafety via Al Jazeera (03/08/2026) e Olhar Digital (31/07/2026)');
    }
    // ===== CENA 6: CTA =====
    const s6 = { voc: wt('c6', 'voce'), a: wt('c6', 'a'), ou: wt('c6', 'ou'), com: wt('c6', 'comenta'), mar: wt('c6', 'marca'), ama: wt('c6', 'amanha'), seg: wt('c6', 'segue') };
    cue(B[5], 'music', { part: 'outro' }); cue(s6.a, 'pop'); cue(s6.ou + 0.25, 'pop'); cue(s6.com, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t) {
      txt('E VOCÊ?', 540, 280, 120, { w: 900, scale: sm(t, s6.voc - 0.2, s6.voc + 0.15, outBack) });
      const ka = sm(t, s6.a - 0.1, s6.a + 0.25, outBack), kb = sm(t, s6.ou + 0.1, s6.ou + 0.45, outBack);
      if (ka > 0) { ctx.save(); ctx.translate(290, 520); ctx.scale(ka, ka); blk(-200, -120, 400, 240, RA); txt('A', 0, -30, 130, { w: 900, color: '#fff' }); txt('PROIBIR', 0, 70, 44, { w: 900, color: '#fff' }); ctx.restore(); }
      if (kb > 0) { ctx.save(); ctx.translate(790, 520); ctx.scale(kb, kb); blk(-200, -120, 400, 240, RB); txt('B', 0, -30, 130, { w: 900, color: '#fff' }); txt('NÃO PROIBIR', 0, 70, 40, { w: 900, color: '#fff' }); ctx.restore(); }
      boxed('COMENTA A OU B', 540, 800, 56, prog(t, s6.com - 0.15, s6.com + 0.1), { fill: LIME });
      txt('E MARCA QUEM DISCORDA', 540, 920, 42, { w: 900, a: prog(t, s6.mar - 0.1, s6.mar + 0.2) });
      const ak = prog(t, s6.ama - 0.1, s6.ama + 0.3);
      if (ak > 0) { ga(ak); ctx.fillStyle = INK; ctx.fillRect(80, 1010, 920, 190); txt('AMANHÃ', 540, 1060, 34, { w: 700, color: LIME }); txt('SALÁRIO MÍNIMO X O NECESSÁRIO', 540, 1115, 46, { w: 900, color: '#fff' }); txt('SEGUNDO O DIEESE: DÁ PRA VIVER?', 540, 1170, 34, { w: 800, color: '#fff' }); ga(1); }
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
