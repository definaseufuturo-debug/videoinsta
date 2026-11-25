/*
 * "A TRINDADE NÃO ESTÁ NA BÍBLIA?" — novo estilo @e_cosdafe (dinâmico: personagens, linha do tempo, dados, cartões de versículo).
 * 9:16 (1080x1920), narrado. Tudo desenhado em código. Cenas presas aos instantes dos clips (build/timeline.json).
 * Fatos: 'trinitas' em Tertuliano (c. 213), Niceia (325), Constantinopla (381), Mateus 28:19 (singular "nome").
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
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  // paleta: fundo azul-noite, dourado, vermelho de destaque, branco
  const BG = '#0d1430', BG2 = '#1a2350', GOLD = '#f2b233', RED = '#ff4d4d', WHITE = '#f5f1e6', CYAN = '#5ad1ff', MUTE = '#9fb0d8', INK = '#1d1a14', PAPER = '#f4ecd8';

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const END = TL.duration;
    const CL = id => TL.clips.find(c => c.id === id);
    const NS = 7;
    // início de cada cena = início do clip correspondente, com 0,35 s de antecipação
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(CL('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } return CL(cid).start; }

    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 28; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function pop(s, x, y, size, k, o = {}) { if (k <= 0) return; txt(s, x, y, size, Object.assign({ scale: lerp(1.5, 1, outC(k)), a: clamp(k * 3) }, o)); }
    function plaque(s, x, y, size, k, o = {}) { if (k <= 0) return; const w = tw(s, size) + size * 1.2, h = size * 1.7, sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = o.fill || GOLD; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 18); ctx.fill(); txt(s, 0, 2, size, { color: o.col || INK }); ctx.restore(); ga(1); }
    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 60, w = tw(s, size) + 60, h = size * 1.8; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3)); ctx.fillStyle = o.fill || WHITE; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); ctx.beginPath(); ctx.moveTo(-18, h / 2 - 2); ctx.lineTo((o.tailDir || 1) * 26, h / 2 + 34); ctx.lineTo(16, h / 2 - 2); ctx.fill(); txt(s, 0, 3, size, { color: o.color || INK }); ctx.restore(); ga(1); }

    // ---------- personagem palito (com cores vivas) ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function fig(x, y, s, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ga(o.a ?? 1);
      const col = o.col || WHITE; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 12;
      const lean = o.lean || 0, hipY = -92, shY = -158, shX = Math.sin(lean) * 60;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      const legs = o.legs || [[0.1, 0.05], [-0.1, -0.05]]; for (const [a, b] of legs) limb(0, hipY, a, b, 48, 46);
      const arms = o.arms || [[0.3, 0.2], [-0.3, -0.2]]; const hands = arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const hr = o.hr || 24, hx = shX + Math.sin(lean) * (hr + 10), hy = shY - Math.cos(lean) * (hr + 10);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
      ctx.restore(); ga(1);
      return { hands: hands.map(([hx2, hy2]) => [x + hx2 * s, y + hy2 * s]), head: [x + hx * s, y + hy * s] };
    }
    // balança o braço (aceno/gesto) em função do tempo
    const wave = (t, f = 9, amp = 0.5) => Math.sin(t * f) * amp;

    // ---------- fundo com grade e luz ----------
    const bg = (() => { const cv = mk(W, H), g = cv.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, BG); gr.addColorStop(1, BG2); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 2; for (let x = 0; x <= W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H); return cv; })();

    // ---------- cabeçalho fixo ----------
    function header() { txt('A BÍBLIA NO MAPA', 540, 110, 34, { w: 900, color: GOLD }); ctx.fillStyle = GOLD; ctx.fillRect(360, 140, 360, 4); }

    // ---------- cenas ----------
    // cena 1: gancho
    function scene1(t, L) {
      const a = sm(L, 0.05, 0.4, outC), b = prog(L, 0.8, 1.2), q = prog(L, 1.4, 1.9);
      pop('A TRINDADE', 540, 470, 150, a, { color: WHITE });
      pop('NÃO ESTÁ', 540, 640, 130, b, { color: RED, glow: 'rgba(255,77,77,0.5)' });
      pop('NA BÍBLIA?', 540, 790, 130, b, { color: RED, glow: 'rgba(255,77,77,0.5)' });
      // ponto de interrogação girando e pulsando
      const k = q; if (k > 0) { ctx.save(); ctx.translate(540, 1010); const r = 130 * outBack(k); ctx.rotate(Math.sin(L * 2) * 0.08); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); txt('?', 0, 12, 240 * outBack(k), { color: INK }); ctx.restore(); }
      // personagem apontando para a Bíblia fechada
      const pk = prog(L, 2.0, 2.5); if (pk > 0) { fig(540, 1420, 1.25, { arms: [[0.5 + wave(L, 6, 0.1), -1.6], [-0.2, -0.3]], legs: [[0.15, 0.05], [-0.15, -0.05]], lean: 0.05 * pk }); ctx.save(); ga(pk); ctx.fillStyle = WHITE; ctx.fillRect(480, 1260, 120, 26); ctx.fillStyle = RED; ctx.fillRect(480, 1260, 120, 8); ctx.restore(); ga(1); }
    }

    // cena 2: linha do tempo (dados)
    const X = y => 80 + (y - 30) / (400 - 30) * 920; // anos → x
    function scene2(t, L) {
      const axisY = 900; const k = sm(L, 0.1, 0.5, outC);
      ctx.save(); ga(k); ctx.strokeStyle = MUTE; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X(30), axisY); ctx.lineTo(X(400), axisY); ctx.stroke();
      for (const y of [0, 100, 200, 300, 400]) { const x = X(Math.max(30, y)); ctx.beginPath(); ctx.moveTo(x, axisY - 14); ctx.lineTo(x, axisY + 14); ctx.stroke(); txt(y === 0 ? '0' : String(y), x, axisY + 52, 34, { w: 800, color: MUTE }); }
      ctx.restore(); ga(1);
      // barras: cartas de Paulo (50–60) e evangelhos (70–100), crescem em sequência
      const b1 = sm(L, 0.5, 1.1, outC), b2 = sm(L, 1.1, 1.9, outC);
      ctx.fillStyle = CYAN; ctx.beginPath(); ctx.roundRect(X(50), axisY - 300 * b1, X(60) - X(50), 300 * b1, 10); ctx.fill();
      ctx.beginPath(); ctx.roundRect(X(70), axisY - 380 * b2, X(100) - X(70), 380 * b2, 10); ctx.fill();
      // legenda das barras (abaixo do eixo, sem sobrepor)
      ctx.save(); ga(b1); ctx.fillStyle = CYAN; ctx.fillRect(80, 1010, 22, 22); ctx.restore(); txt('CARTAS DE PAULO (c. 50–60)', 116, 1021, 30, { w: 800, align: 'left', color: CYAN, a: b1 });
      ctx.save(); ga(b2); ctx.fillStyle = CYAN; ctx.fillRect(80, 1062, 22, 22); ctx.restore(); txt('EVANGELHOS (c. 70–100)', 116, 1073, 30, { w: 800, align: 'left', color: CYAN, a: b2 });
      // marcador vermelho: a palavra aparece (213)
      const m = sm(L, 2.3, 3.0, outBack);
      if (m > 0) { const x = X(213); ctx.save(); ga(m); ctx.strokeStyle = RED; ctx.lineWidth = 8; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(x, axisY); ctx.lineTo(x, 540); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); ga(1);
        ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(x, axisY, 22 * outBack(m), 0, TAU); ctx.fill();
        pop('213', x, 500, 150, m, { color: RED, glow: 'rgba(255,77,77,0.5)' });
        txt('"TRINITAS" APARECE', x, 610, 40, { color: WHITE, a: m }); }
      // seta de intervalo: "113 anos depois"
      const g = prog(L, 3.4, 3.9); if (g > 0) { ga(g); txt('MAIS DE 100 ANOS DEPOIS', 540, 1190, 52, { color: GOLD }); ga(1); }
      // personagem contando nos dedos
      const pk = prog(L, 4.0, 4.5); if (pk > 0) { fig(540, 1470, 1.1, { arms: [[-2.2 + wave(L, 4, 0.1), -2.6], [0.9, 0.6]], legs: [[0.1, 0.05], [-0.1, -0.05]] }); }
    }

    // cena 3: Tertuliano (escriba) e a palavra
    function scene3(t, L) {
      const k = sm(L, 0.05, 0.4, outC);
      // escrivaninha e pergaminho
      ctx.save(); ga(k); ctx.fillStyle = '#7b5a36'; ctx.fillRect(120, 1040, 380, 26); ctx.fillStyle = PAPER; ctx.fillRect(170, 980, 260, 60); ctx.fillStyle = INK; for (let i = 0; i < 4; i++) ctx.fillRect(190, 995 + i * 12, 200 - i * 20, 4); ctx.restore(); ga(1);
      fig(330, 1420, 1.25, { col: WHITE, arms: [[0.6 + wave(L, 10, 0.25), 1.2], [0.4, 0.9]], legs: [[0.1, 0.05], [-0.1, -0.05]], lean: 0.2 });
      txt('TERTULIANO', 330, 1530, 34, { color: GOLD, a: k });
      txt('CARTAGO • c. 213', 330, 1120, 28, { color: MUTE, a: k });
      // a palavra sai da pena
      const w = sm(L, 0.6, 1.2, outBack);
      pop('TRINITAS', 760, 560, 96, w, { color: RED, glow: 'rgba(255,77,77,0.5)' });
      // três pessoas que ela tenta explicar, em triângulo
      const tr = [[760, 780], [600, 1000], [920, 1000]], names = ['PAI', 'FILHO', 'ESPÍRITO'];
      const cols = [GOLD, CYAN, WHITE];
      for (let i = 0; i < 3; i++) { const kk = sm(L, 1.6 + i * 0.35, 2.1 + i * 0.35, outBack); if (kk <= 0) continue; const [x, y] = tr[i]; ctx.save(); ga(kk); ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.arc(x, y, 34 * outBack(kk), 0, TAU); ctx.fill(); ctx.restore(); ga(1); txt(names[i], x, y + 74, 34, { color: cols[i], a: kk }); }
      const ln = prog(L, 2.7, 3.4); if (ln > 0) { ctx.save(); ctx.strokeStyle = 'rgba(245,241,230,0.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(760, 780); ctx.lineTo(lerp(760, 600, ln), lerp(780, 1000, ln)); ctx.lineTo(lerp(600, 920, ln), 1000); ctx.lineTo(760, 780); ctx.stroke(); ctx.restore(); }
      // seta da pena ao triângulo
      const ar = prog(L, 1.2, 1.6); if (ar > 0) { ctx.save(); ga(ar); ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.moveTo(760, 620); ctx.lineTo(760, 720); ctx.stroke(); ctx.restore(); ga(1); }
    }

    // cena 4: Niceia e Constantinopla — "mesma substância"
    function scene4(t, L) {
      const k = sm(L, 0.05, 0.4, outC);
      txt('MESMA SUBSTÂNCIA', 540, 470, 70, { color: GOLD, a: k });
      const e = sm(L, 0.5, 1.0, outBack);
      fig(330, 1150, 1.5 * e, { col: CYAN, arms: [[0.4, 0.2], [-0.4, -0.2]] });
      fig(750, 1150, 1.5 * e, { col: WHITE, arms: [[-0.4, -0.2], [0.4, 0.2]] });
      const eq = prog(L, 1.2, 1.6); txt('=', 540, 1100, 180 * outBack(eq), { color: RED, a: eq });
      txt('PAI', 330, 1270, 40, { color: CYAN, a: e }); txt('FILHO', 750, 1270, 40, { color: WHITE, a: e });
      plaque('NICEIA • 325', 540, 1350, 46, prog(L, 2.0, 2.4), { fill: GOLD });
      plaque('CONSTANTINOPLA • 381', 540, 1440, 46, prog(L, 2.7, 3.1), { fill: RED, col: WHITE });
    }

    // cena 5: Mateus 28:19 — "nome" no singular
    function scene5(t, L) {
      const k = sm(L, 0.05, 0.4, outC);
      ctx.save(); ga(k); ctx.fillStyle = PAPER; ctx.beginPath(); ctx.roundRect(70, 330, 940, 560, 24); ctx.fill(); ctx.restore(); ga(1);
      txt('MATEUS 28:19', 540, 390, 46, { color: RED, a: k });
      const lines = [['batizando-os em o', 'nome'], ['do Pai, e do Filho,', ''], ['e do Espírito Santo', '']];
      lines.forEach(([s1, s2], i) => { const y = 500 + i * 84; const kk = prog(L, 0.6 + i * 0.4, 1.0 + i * 0.4); if (kk <= 0) return; const full = s2 ? s1 + ' ' + s2 : s1; txt(full, 540, y, 50, { w: 800, color: INK, a: kk }); });
      // destaque da palavra "nome" (sublinhado vermelho e marca)
      const nk = prog(L, 1.6, 2.1); if (nk > 0) { const full = 'batizando-os em o nome', fw = tw(full, 50, 800), pre = tw('batizando-os em o ', 50, 800), nw = tw('nome', 50, 800); const x0 = 540 - fw / 2 + pre; ctx.save(); ctx.fillStyle = RED; ctx.fillRect(x0, 532, nw * outC(nk), 8); ctx.restore(); }
      // comparação: "3 nomes?" riscado vs "1 nome"
      const c1 = sm(L, 2.6, 3.0, outBack), c2 = prog(L, 3.4, 3.9);
      pop('3 NOMES?', 300, 1010, 74, c1, { color: MUTE });
      if (c2 > 0) { ctx.save(); ga(c2); ctx.strokeStyle = RED; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(150, 1010); ctx.lineTo(lerp(150, 450, c2), 1010); ctx.stroke(); ctx.restore(); ga(1); }
      pop('1 NOME', 760, 1010, 86, sm(L, 3.6, 4.0, outBack), { color: GOLD, glow: 'rgba(242,178,51,0.5)' });
      const pk = prog(L, 4.2, 4.6); if (pk > 0) txt('O TEXTO DIZ "NOME", NÃO "NOMES"', 540, 1130, 42, { color: WHITE, a: pk });
      fig(540, 1440, 1.1, { arms: [[-0.4, -0.8], [0.4, 0.8]], legs: [[0.1, 0.05], [-0.1, -0.05]] });
    }

    // cena 6: duas leituras, mesma Bíblia
    function scene6(t, L) {
      const k = sm(L, 0.05, 0.4, outC);
      txt('MESMA BÍBLIA', 540, 420, 84, { color: GOLD, a: k, glow: 'rgba(242,178,51,0.4)' });
      const colA = 280, colB = 800, y0 = 620;
      const a = sm(L, 0.4, 1.0, outBack), b = sm(L, 1.0, 1.6, outBack);
      ctx.save(); ga(a); ctx.fillStyle = 'rgba(90,209,255,0.12)'; ctx.beginPath(); ctx.roundRect(colA - 230, y0 - 80, 460, 560, 26); ctx.fill(); ctx.restore(); ga(1);
      ctx.save(); ga(b); ctx.fillStyle = 'rgba(255,77,77,0.12)'; ctx.beginPath(); ctx.roundRect(colB - 230, y0 - 80, 460, 560, 26); ctx.fill(); ctx.restore(); ga(1);
      txt('ACEITAM', colA, y0 - 20, 48, { color: CYAN, a: a });
      txt('A TRINDADE', colA, y0 + 40, 34, { color: MUTE, a: a });
      txt('NÃO ACEITAM', colB, y0 - 20, 48, { color: RED, a: b });
      txt('(UNITÁRIAS)', colB, y0 + 40, 34, { color: MUTE, a: b });
      // grupos de personagens
      for (let i = 0; i < 3; i++) fig(colA - 100 + i * 100, 1180, 0.85, { col: CYAN, a: a * (0.6 + 0.4 * (i === 1 ? 1 : 0.8)), arms: [[0.3 + wave(L, 6 + i, 0.15), 0.5], [-0.3, -0.5]], legs: [[0.1, 0.05], [-0.1, -0.05]] });
      for (let i = 0; i < 2; i++) fig(colB - 60 + i * 120, 1180, 0.85, { col: RED, a: b, arms: [[-0.3, -0.5], [0.3, 0.5]], legs: [[0.1, 0.05], [-0.1, -0.05]] });
      const q = prog(L, 2.0, 2.6); if (q > 0) txt('AS DUAS LEITURAS SE APOIAM NO MESMO TEXTO.', 540, 1400, 38, { color: WHITE, a: q, w: 800 });
    }

    // cena 7: CTA de comentar e marcar
    function scene7(t, L) {
      const q = sm(L, 0.05, 0.5, outBack);
      pop('E VOCÊ?', 540, 470, 120, q, { color: GOLD });
      txt('A TRINDADE ESTÁ NA BÍBLIA?', 540, 610, 56, { color: WHITE, a: prog(L, 0.4, 0.9) });
      const s1 = sm(L, 1.0, 1.5, outBack), s2 = sm(L, 1.2, 1.7, outBack);
      const pulseS = 1 + 0.04 * Math.sin(L * 6) * (L > 1.6 ? 1 : 0);
      ctx.save(); ctx.translate(290, 900); ctx.scale(s1 * pulseS, s1 * pulseS); ctx.fillStyle = CYAN; ctx.beginPath(); ctx.roundRect(-190, -70, 380, 140, 30); ctx.fill(); ctx.restore();
      txt('SIM', 290, 900, 80, { color: INK, scale: s1 });
      ctx.save(); ctx.translate(790, 900); ctx.scale(s2 * pulseS, s2 * pulseS); ctx.fillStyle = RED; ctx.beginPath(); ctx.roundRect(-190, -70, 380, 140, 30); ctx.fill(); ctx.restore();
      txt('NÃO', 790, 900, 80, { color: WHITE, scale: s2 });
      const c = prog(L, 2.0, 2.6);
      plaque('✓ COMENTA', 300, 1190, 44, c, { fill: GOLD });
      plaque('✓ MARCA', 780, 1190, 44, prog(L, 2.3, 2.9), { fill: GOLD });
      plaque('✓ SEGUE A BÍBLIA QUE NINGUÉM PREGA', 540, 1290, 36, prog(L, 2.7, 3.3), { fill: WHITE, col: INK });
      fig(540, 1570, 0.8, { arms: [[-2.2 + wave(L, 8, 0.4), -2.6], [2.2 - wave(L, 8, 0.4), 2.6]], legs: [[0.1, 0.05], [-0.1, -0.05]] });
    }

    // ---------- legendas (palavra a palavra) ----------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 60, words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 16, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), bw = total + 60, bh = size * 1.6, pop2 = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15));
      ctx.save(); ctx.translate(540, 1640); ctx.scale(pop2, pop2); ctx.fillStyle = PAPER; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; if (cur) { ctx.fillStyle = GOLD; ctx.fillRect(x - 6, -size * 0.6, ws[i] + 12, size * 1.2); } txt(words[i], x + ws[i] / 2, 3, size, { color: INK }); x += ws[i] + sp; }); ctx.restore(); }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.drawImage(bg, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      const L = t - B[i];
      header(); ctx.save(); sceneFns[i](t, L); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t);
    }

    // sons: ritmo de cortes e destaques (tipos existentes em tools/audio.py)
    cue(0, 'wind', { dur: 1.2, gain: 0.5 });
    cue(CL('c1').start + 1.4, 'boing', { gain: 0.7 });
    cue(B[1], 'notif', { gain: 0.6 });
    cue(CL('c2').start + 2.6, 'boing', { gain: 0.6 });
    cue(B[2], 'notif', { gain: 0.5 }); cue(CL('c3').start + 1.0, 'tada', { gain: 0.5 });
    cue(B[3], 'notif', { gain: 0.5 }); cue(CL('c4').start + 2.4, 'boing', { gain: 0.5 });
    cue(B[4], 'notif', { gain: 0.5 }); cue(CL('c5').start + 3.5, 'tada', { gain: 0.6 });
    cue(B[5], 'notif', { gain: 0.5 }); cue(B[6], 'notif', { gain: 0.5 }); cue(CL('c7').start + 2.0, 'boing', { gain: 0.6 });
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'wind', { dur: 0.3, gain: 0.3 });
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
