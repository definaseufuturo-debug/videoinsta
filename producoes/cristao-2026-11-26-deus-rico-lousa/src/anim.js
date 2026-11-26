/*
 * "DEUS QUER VOCÊ RICO?" (3Jo 2, Dt 8:18, Pv 10:22 x 1Tm 6:9-10, Mt 6:24), DEBATE em LOUSA DE GIZ ANIMADA, 9:16 (perfil cristão @e_cosdafe).
 * Bonequinhos de giz atuam cada cena (nada de texto parado): caem, andam, aplaudem, discutem. Tudo desenhado por código.
 * Cenas = clips c1..c8 (narração). Eventos presos às palavras com wt(clip, palavra).
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
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  const BOARD = '#1f3d30', CHALK = '#f3f0e4', GOLD = '#ffd36b', RED = '#ff6b5e', BLUE = '#8fd0ff', PINK = '#ffb3c7', GREEN = '#9be8a8';
  const GROUND = 1340;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } console.error('palavra não encontrada', cid, w); return clip(cid).start + 0.6; }
    const END = TL.duration, NS = TL.clips.length;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.3); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);

    // ---------------- giz: texto e traços ----------------
    function txt(s, x, y, size, o = {}) {
      if (o.a !== undefined && o.a <= 0.001) return; if (o.scale !== undefined && o.scale <= 0.001) return;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
      ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      const a = o.a ?? 1;
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || 'rgba(0,0,0,0.92)'; ctx.globalAlpha = a; ctx.strokeText(s, 0, 0); }
      ctx.shadowColor = o.color || CHALK; ctx.shadowBlur = 8; ctx.fillStyle = o.color || CHALK;
      ctx.globalAlpha = a * 0.55; ctx.fillText(s, 1.6, 1.2); ctx.globalAlpha = a * 0.95; ctx.fillText(s, 0, 0);
      ctx.restore();
    }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    // texto que o giz escreve da esquerda para a direita
    function write(s, x, y, size, k, o = {}) {
      if (k <= 0) return; const w = tw(s, size, o.w || 900), x0 = (o.align === 'left' ? x : x - w / 2);
      ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, y - size, (w + 20) * clamp(k), size * 2); ctx.clip(); txt(s, x, y, size, o); ctx.restore();
    }
    function poly(pts, k, col, lw, seed, a = 1) {
      if (k <= 0) return; let tot = 0; const L = [];
      for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
      ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let pass = 0; pass < 2; pass++) {
        ctx.lineWidth = pass ? lw * 0.55 : lw; ctx.globalAlpha = a * (pass ? 0.4 : 0.9); let rem = tot * clamp(k);
        ctx.beginPath(); const j = i => (hash(seed * 31 + i * 7 + pass * 13) - 0.5) * 3.2;
        ctx.moveTo(pts[0][0] + j(0), pts[0][1] + j(1));
        for (let i = 1; i < pts.length; i++) {
          if (rem >= L[i - 1]) { ctx.lineTo(pts[i][0] + j(i * 2), pts[i][1] + j(i * 2 + 1)); rem -= L[i - 1]; }
          else { const f = rem / L[i - 1]; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); break; }
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    const circ = (x, y, r, n = 30) => { const p = []; for (let i = 0; i <= n; i++) p.push([x + Math.cos(i / n * TAU) * r, y + Math.sin(i / n * TAU) * r]); return p; };
    const box = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

    // ---------------- cenário: lousa verde + moldura de madeira ----------------
    const bgc = (() => {
      const cv = mk(W, H), g = cv.getContext('2d'); const gr = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1250); gr.addColorStop(0, '#2a5240'); gr.addColorStop(1, '#14291f'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,255,${0.015 + hash(i) * 0.03})`; g.beginPath(); g.ellipse(hash(i + 50) * W, hash(i + 90) * H, 80 + hash(i + 3) * 260, 30 + hash(i + 8) * 90, hash(i + 20) * 3, 0, TAU); g.fill(); }
      g.strokeStyle = 'rgba(243,240,228,0.35)'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(70, GROUND); for (let x = 70; x <= 1010; x += 20) g.lineTo(x, GROUND + (hash(x) - 0.5) * 3); g.stroke();
      return cv; })();
    const FRAME = (() => {
      const cv = mk(W, H), g = cv.getContext('2d'); const wg = g.createLinearGradient(0, 0, W, H); wg.addColorStop(0, '#8a5a30'); wg.addColorStop(0.5, '#6b4423'); wg.addColorStop(1, '#4a2e16'); g.fillStyle = wg; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.fillRect(34, 34, W - 68, H - 68); g.globalCompositeOperation = 'source-over';
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(34, 34, W - 68, 6); g.fillRect(34, 34, 6, H - 68);
      g.fillStyle = '#5a3a1c'; g.fillRect(34, H - 120, W - 68, 86); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(34, H - 120, W - 68, 4);
      g.fillStyle = CHALK; g.fillRect(150, H - 96, 90, 14); g.fillRect(270, H - 92, 60, 12);
      return cv; })();

    // ---------------- bonequinho de giz ----------------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    const IDLE = { legs: [[0.07, 0.04], [-0.07, -0.04]], arms: [[0.12, 0.25], [-0.12, -0.1]] };
    const walkP = (t, sp = 8) => { const p = Math.sin(t * sp), q = Math.cos(t * sp); return { legs: [[0.55 * p, 0.55 * p - 0.3 * Math.max(0, q)], [-0.55 * p, -0.55 * p - 0.3 * Math.max(0, -q)]], arms: [[-0.5 * p, -0.5 * p + 0.2], [0.5 * p, 0.5 * p + 0.2]], bob: Math.abs(q) * -6 }; };
    function figure(o) {
      const s = o.s || 2.5, dir = o.dir || 1, hr = 23, col = o.c || CHALK, pose = o.pose || IDLE;
      ctx.save(); ctx.translate(o.x, o.y); if (o.fall) { ctx.rotate(-dir * outBack(o.fall) * 1.5); } ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.shadowColor = col; ctx.shadowBlur = 8;
      const bob = pose.bob || o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      if (o.skirt) { ctx.globalAlpha = (o.a ?? 1) * 0.35; ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(-34, hipY + 56); ctx.lineTo(34, hipY + 56); ctx.closePath(); ctx.fill(); ga(o.a ?? 1); ctx.beginPath(); ctx.moveTo(-34, hipY + 56); ctx.lineTo(0, hipY); ctx.lineTo(34, hipY + 56); ctx.stroke(); }
      for (const [a, b] of pose.legs) limb(0, hipY, a, b, 48, 46);
      const hands = (o.arms || pose.arms).map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const hx = shX + Math.sin(lean) * (hr + 11), hy = shY - Math.cos(lean) * (hr + 11);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (o.bun) { ctx.beginPath(); ctx.arc(hx - 4, hy - hr - 8, 11, 0, TAU); ctx.fill(); }
      if (o.beard) { ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(hx + 6, hy + 8); ctx.quadraticCurveTo(hx + 20, hy + 44, hx + 2, hy + 40); ctx.stroke(); }
      ctx.fillStyle = BOARD; ctx.strokeStyle = BOARD; ctx.lineWidth = 3.2;
      if (o.dead || (o.fall && o.fall > 0.5)) { for (const ex of [hx + hr * 0.3, hx + hr * 0.7]) { ctx.beginPath(); ctx.moveTo(ex - 4, hy - 7); ctx.lineTo(ex + 4, hy + 1); ctx.moveTo(ex + 4, hy - 7); ctx.lineTo(ex - 4, hy + 1); ctx.stroke(); } }
      else { const ey = hy - 3; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill();
        if (o.mood === 'sad') { ctx.beginPath(); ctx.arc(hx + hr * 0.55, hy + 13, 6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } else if (o.mood === 'smile') { ctx.beginPath(); ctx.arc(hx + hr * 0.55, hy + 5, 7, 0.2, Math.PI - 0.2); ctx.stroke(); } else if (o.mood === 'shock') { ctx.beginPath(); ctx.arc(hx + hr * 0.55, hy + 11, 4, 0, TAU); ctx.fill(); } }
      ctx.restore(); ga(1);
      return { head: [o.x + dir * hx * s, o.y + hy * s], hands: hands.map(([x, y]) => [o.x + dir * x * s, o.y + y * s]) };
    }

    // ---------------- objetos ----------------
    function coin(x, y, r, k = 1, col = GOLD) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = col; ctx.globalAlpha = 0.28; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.restore(); poly(circ(x, y, r * k, 16), 1, col, 4, Math.round(x + y)); txt('$', x, y + 1, r * 1.1 * k, { color: col, w: 900 }); }
    function sack(x, y, s, col, k = 1, label = '$') { if (k <= 0) return; const P = [[-26, -64], [-46, -28], [-58, 22], [-42, 58], [0, 68], [42, 58], [58, 22], [46, -28], [26, -64], [-26, -64]].map(([a, b]) => [x + a * s, y + b * s]);
      ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.18 * k; ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.fill(); ctx.restore();
      poly(P, k, col, 6, 5); poly([[x - 36 * s, y - 56 * s], [x + 36 * s, y - 52 * s]], k, col, 5, 6); txt(label, x, y + 8 * s, 52 * s, { color: col, a: k }); }
    function bubble(x, y, w, h, s, size, k, tx, ty, col = CHALK, dark = true) { if (k <= 0) return; const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y);
      ctx.fillStyle = dark ? 'rgba(14,30,22,0.92)' : 'rgba(0,0,0,0.5)'; ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineJoin = 'round'; rr(x - w / 2, y - h / 2, w, h, 36); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 30, y + h / 2 - 2); ctx.lineTo(tx, ty); ctx.lineTo(x + 30, y + h / 2 - 2); ctx.fillStyle = 'rgba(14,30,22,0.92)'; ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(14,30,22,0.92)'; ctx.fillRect(x - 27, y + h / 2 - 8, 54, 10);
      const lines = s.split('\n'); lines.forEach((l, i) => txt(l, x, y + (i - (lines.length - 1) / 2) * size * 1.15, size, { color: col })); ctx.restore(); }
    function church(x, y, k) { const c = CHALK; poly(box(x, y - 260, 250, 260), prog(k, 0, 0.6), c, 7, 1); poly([[x - 24, y - 260], [x + 125, y - 400], [x + 274, y - 260]], prog(k, 0.3, 0.8), c, 7, 2); poly([[x + 125, y - 400], [x + 125, y - 500]], prog(k, 0.6, 0.9), GOLD, 7, 3); poly([[x + 95, y - 470], [x + 155, y - 470]], prog(k, 0.7, 1), GOLD, 7, 4); poly([[x + 90, y], [x + 90, y - 130], [x + 160, y - 130], [x + 160, y]], prog(k, 0.5, 1), c, 6, 5); poly(box(x + 25, y - 210, 40, 70), prog(k, 0.6, 1), c, 5, 6); poly(box(x + 185, y - 210, 40, 70), prog(k, 0.6, 1), c, 5, 7); }
    function clockFace(x, y, r, ang, k) { poly(circ(x, y, r, 36), k, CHALK, 8, 9); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; poly([[x + Math.sin(a) * r * 0.82, y - Math.cos(a) * r * 0.82], [x + Math.sin(a) * r * 0.94, y - Math.cos(a) * r * 0.94]], k, CHALK, 5, 20 + i); } poly([[x, y], [x + Math.sin(ang) * r * 0.78, y - Math.cos(ang) * r * 0.78]], k, GOLD, 8, 31); poly([[x, y], [x + Math.sin(ang / 12) * r * 0.5, y - Math.cos(ang / 12) * r * 0.5]], k, CHALK, 10, 32); }
    function dust(x, y, t0, t, n = 10, col = '243,240,228') { const u = t - t0; if (u < 0 || u > 1.2) return; for (let i = 0; i < n; i++) { const a = hash(i + t0 * 9) * TAU, d = 30 + hash(i + 40) * 120; ctx.fillStyle = `rgba(${col},${0.5 * (1 - u / 1.2)})`; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d * outC(u), y + Math.sin(a) * d * 0.6 * outC(u) - u * 40, 4 + hash(i) * 8, 0, TAU); ctx.fill(); } }
    let shakeAmt = 0;

    // ---------------- âncoras das palavras ----------------
    const A = {
      c1: ['deus', 'rico', 'dividem'], c2: ['debates', 'lados', 'texto'], c3: ['sim', 'joao', 'escreve', 'amado', 'saude'], c4: ['deuteronomio', 'forca', 'riqueza', 'proverbios', 'enriquece'],
      c5: ['abraao', 'jo', 'salomao', 'bencao', 'pecado'], c6: ['nao', 'paulo', 'ricos', 'tentacao', 'amor', 'raiz'], c7: ['jesus', 'servir', 'dinheiro', 'raposas', 'cabeca'],
      c8: ['detalhe', 'saudacao', 'carta', 'promessa', 'condena'], c9: ['ricos', 'orgulhosos', 'generosos', 'igreja'], c10: ['concordam', 'coracao', 'dinheiro', 'deus', 'prosperidade'],
      c11: ['voce', 'sim', 'nao', 'comenta', 'marca', 'segue', 'debate', 'amanha'] };
    const S = {}; for (const k in A) { S[k] = {}; A[k].forEach((w, i) => { S[k][w] = wt(k, w); }); }
    const sA = S.c1, sB = S.c2, sC = S.c3, sD = S.c4, sE = S.c5, sF = S.c6, sG = S.c7, sH = S.c8, sI = S.c9, sJ = S.c10, sK = S.c11;
    const chip = (s, x, y, size, k, col) => { if (k <= 0) return; const w = tw(s, size) + 50; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ctx.fillStyle = 'rgba(14,30,22,0.92)'; ctx.strokeStyle = col; ctx.lineWidth = 5; rr(-w / 2, -size * 0.85, w, size * 1.7, 22); ctx.fill(); ctx.stroke(); ctx.restore(); txt(s, x, y, size * outBack(k), { color: col }); };
    const pile = (x, y, n, k) => { for (let i = 0; i < n; i++) coin(x + (i % 3) * 36 - 36, y - Math.floor(i / 3) * 26, 18, sm(k, i / n * 0.7, i / n * 0.7 + 0.3)); };
    const T0 = i => B[i - 1];
    const head = (label, t, i, col) => write(label, 540, 190, 70, sm(t, B[i - 1] + 0.1, B[i - 1] + 0.8, x => x), { color: col, stroke: 12 });

    // ---------------- cenas ----------------
    function scene1(t) {
      const rain = t - 0.2; for (let i = 0; i < 14; i++) { const p = ((rain * 0.45 + hash(i) * 3) % 1.4), x = 90 + hash(i + 5) * 900, y = -60 + p * 1500; if (p < 1.3 && rain > 0) coin(x, y, 20 + hash(i) * 10, 1, GOLD); }
      figure({ x: 540, y: GROUND, c: BLUE, s: 3, mood: 'smile', pose: { legs: IDLE.legs, arms: [[2.5 + 0.2 * Math.sin(t * 6), 2.9], [-2.5 - 0.2 * Math.sin(t * 6), -2.9]] } });
      pile(250, GROUND - 5, 9, prog(t, 0.5, 2)); pile(830, GROUND - 5, 9, prog(t, 0.7, 2.2));
      txt('DEUS QUER', 540, 340, 112, { color: CHALK, stroke: 14, scale: outBack(prog(t, 0.2, 0.7)) });
      txt('VOCÊ RICO?', 540, 480, 128, { color: GOLD, stroke: 14, scale: outBack(prog(t, sA.rico - 0.1, sA.rico + 0.3)), rot: -0.03 });
      if (t > sA.dividem - 0.2) { const k = prog(t, sA.dividem - 0.2, sA.dividem + 0.5); poly([[540, 40], [510, 300], [570, 560], [520, 900], [560, 1300], [540, 1880]], k, RED, 10, 201); shakeAmt = 0; txt('OS CRISTÃOS SE DIVIDEM', 540, 700, 58, { color: RED, a: sm(t, sA.dividem, sA.dividem + 0.5), stroke: 10 }); }
    }
    function scene2(t) {
      head('O MAIOR DEBATE', t, 2, GOLD);
      const k = sm(t, B[1] + 0.2, B[1] + 1.0, x => x), mx = lerp(-100, 190, k), fx = lerp(1180, 890, k), w = k < 1 ? walkP(t) : IDLE;
      figure({ x: mx, y: GROUND, c: GOLD, pose: Object.assign({}, w, { arms: [[0.9, 1.4], w.arms[1]] }), mood: 'smile' }); figure({ x: fx, y: GROUND, dir: -1, c: RED, pose: Object.assign({}, w, { arms: [[0.9, 1.4], w.arms[1]] }), mood: 'smile' });
      if (t > sB.lados - 0.3) { bubble(250, 700, 280, 120, 'SIM', 70, prog(t, sB.lados - 0.3, sB.lados), 200, 840, GOLD); bubble(830, 700, 280, 120, 'NÃO', 70, prog(t, sB.lados, sB.lados + 0.3), 880, 840, RED); }
      if (t > sB.texto - 0.2) { const bk = sm(t, sB.texto - 0.2, sB.texto + 0.4, outBack); ctx.save(); ctx.translate(540, 1100); ctx.scale(bk, bk); poly(box(-130, -90, 260, 180), 1, CHALK, 8, 210); poly([[0, -90], [0, 90]], 1, CHALK, 6, 211); ctx.restore(); txt('A BÍBLIA', 540, 1100, 44, { color: GOLD, a: bk }); txt('COM O TEXTO NA MÃO', 540, 1260, 50, { color: CHALK, a: bk }); }
    }
    function scene3(t) {
      head('LADO SIM', t, 3, GOLD);
      figure({ x: 300, y: GROUND, c: GOLD, s: 2.7, mood: 'smile', pose: { legs: IDLE.legs, arms: [[1.0, 1.3], [-0.9, -0.5 + 0.2 * Math.sin(t * 5)]] } });
      chip('3 JOÃO 2', 760, 420, 60, prog(t, sC.joao - 0.1, sC.joao + 0.3), GOLD);
      write('"BEM EM TODAS', 760, 580, 50, sm(t, sC.escreve, sC.amado + 1.2, x => x), { color: CHALK, stroke: 9 }); write('AS COISAS"', 760, 650, 50, sm(t, sC.amado + 1.0, sC.amado + 1.8, x => x), { color: CHALK, stroke: 9 });
      if (t > sC.saude - 0.2) { const k = prog(t, sC.saude - 0.2, sC.saude + 0.4); txt('+ SAÚDE', 760, 820, 84, { color: GREEN, scale: outBack(k), stroke: 12 }); poly([[700, 940], [820, 940]], k, GREEN, 14, 220); poly([[760, 880], [760, 1000]], k, GREEN, 14, 221); }
      const bk = sm(t, sC.sim, sC.sim + 0.5); for (let i = 0; i < 5; i++) { const y = GROUND - 540 - ((t * 120 + i * 90) % 450), x = 300 + Math.sin(t * 2 + i) * 70 + i * 22; ctx.save(); ga(0.8 * bk * (1 - prog(y, GROUND - 990, GROUND - 540) * 0)); txt('♥', x, y, 46, { color: PINK, shadow: false }); ctx.restore(); }
    }
    function scene4(t) {
      head('OS TEXTOS DO SIM', t, 4, GOLD);
      figure({ x: 220, y: GROUND, c: GOLD, s: 2.5, pose: { legs: IDLE.legs, arms: [[2.2, 2.5 + 0.15 * Math.sin(t * 5)], [-0.3, -0.2]] }, mood: 'smile' });
      chip('DT 8:18', 700, 330, 56, prog(t, sD.deuteronomio - 0.1, sD.deuteronomio + 0.3), GOLD); write('FORÇA PARA ADQUIRIR', 700, 440, 46, sm(t, sD.forca - 0.1, sD.forca + 0.9, x => x), { color: CHALK, stroke: 9 }); write('RIQUEZA', 700, 510, 66, sm(t, sD.riqueza - 0.1, sD.riqueza + 0.5, x => x), { color: GOLD, stroke: 10 });
      chip('PV 10:22', 700, 720, 56, prog(t, sD.proverbios - 0.1, sD.proverbios + 0.3), GOLD); write('A BÊNÇÃO ENRIQUECE', 700, 830, 46, sm(t, sD.enriquece - 0.6, sD.enriquece + 0.6, x => x), { color: CHALK, stroke: 9 });
      const gk = sm(t, sD.riqueza, sD.enriquece + 1.2, x => x); for (let i = 0; i < 5; i++) { const h = (80 + i * 85) * clamp(gk * 1.4 - i * 0.12); ctx.save(); ctx.fillStyle = GOLD; ga(0.35); ctx.fillRect(520 + i * 100, GROUND - h, 70, h); ga(1); ctx.restore(); poly(box(520 + i * 100, GROUND - h, 70, h), 1, GOLD, 5, 230 + i); }
    }
    function scene5(t) {
      head('E NA BÍBLIA?', t, 5, GOLD);
      const names = [['ABRAÃO', sE.abraao, 190, BLUE], ['JÓ', sE.jo, 540, GREEN], ['SALOMÃO', sE.salomao, 890, GOLD]];
      names.forEach(([n, ts, x, c], i) => { const k = sm(t, ts - 0.3, ts + 0.3, outBack); figure({ x, y: GROUND, c, s: 2.1, a: k, mood: 'smile', pose: { legs: IDLE.legs, arms: [[0.6, 1.0], [-0.3, -0.2]] }, bun: false }); sack(x + 80, GROUND - 60, 0.6, GOLD, k); txt(n, x, GROUND - 560, 56, { color: c, a: k, stroke: 10 }); });
      if (t > sE.salomao) { poly([[850, GROUND - 500], [870, GROUND - 540], [890, GROUND - 505], [910, GROUND - 540], [930, GROUND - 500], [850, GROUND - 500]], sm(t, sE.salomao + 0.2, sE.salomao + 0.7), GOLD, 7, 240); }
      if (t > sE.bencao - 0.1) { const k = prog(t, sE.bencao - 0.1, sE.bencao + 0.3); txt('BÊNÇÃO', 540, 560, 120, { color: GOLD, scale: outBack(k), stroke: 14 }); for (let i = 0; i < 9; i++) { const a = -Math.PI + i * Math.PI / 8; poly([[540 + Math.cos(a) * 340, 560 + Math.sin(a) * 120 - 20], [540 + Math.cos(a) * 400, 560 + Math.sin(a) * 150 - 30]], k, GOLD, 5, 241 + i); } }
      if (t > sE.pecado - 0.1) { txt('PECADO', 540, 800, 100, { color: CHALK, a: sm(t, sE.pecado - 0.1, sE.pecado + 0.3), stroke: 12 }); poly([[300, 810], [780, 790]], sm(t, sE.pecado + 0.2, sE.pecado + 0.6), RED, 12, 250); poly([[470, 740], [610, 860]], sm(t, sE.pecado + 0.5, sE.pecado + 0.8), RED, 12, 251); }
    }
    function scene6(t) {
      head('LADO NÃO', t, 6, RED);
      // moeda-isca pendurada e figura tentada
      const bob = Math.sin(t * 3) * 14; poly([[780, 60], [780, 420 + bob]], prog(t, sF.tentacao - 0.6, sF.tentacao), CHALK, 5, 260); coin(780, 450 + bob, 46, sm(t, sF.tentacao - 0.5, sF.tentacao - 0.1, outBack), GOLD);
      const lean = 0.35 * sm(t, sF.ricos, sF.tentacao + 0.3), lx = 380 + 40 * sm(t, sF.ricos, sF.tentacao + 0.6);
      figure({ x: lx, y: GROUND, c: RED, s: 2.5, lean, mood: 'shock', pose: { legs: IDLE.legs, arms: [[1.6, 1.9], [0.9, 1.4]] } });
      if (t > sF.tentacao) { const lk = sm(t, sF.tentacao, sF.tentacao + 0.9, x => x); poly(circ(lx, GROUND - 20, 70, 24).map(([x, y]) => [x, (y - GROUND + 20) * 0.3 + GROUND - 20]), lk, CHALK, 8, 261); poly(circ(lx, GROUND - 40, 90, 24).map(([x, y]) => [x, (y - GROUND + 40) * 0.3 + GROUND - 40]), lk * 0.9, CHALK, 8, 262); txt('LAÇOS', lx, GROUND + 45, 44, { color: CHALK, a: lk, stroke: 8 }); }
      chip('1 TM 6:9-10', 540, 330, 54, prog(t, sF.paulo - 0.1, sF.paulo + 0.3), RED);
      if (t > sF.amor - 0.2) { const k = prog(t, sF.amor - 0.2, sF.amor + 0.5); txt('O AMOR AO DINHEIRO', 540, 1475, 50, { color: CHALK, a: k, stroke: 10 }); write('É RAIZ DE TODOS OS MALES', 540, 1545, 50, sm(t, sF.raiz - 0.3, sF.raiz + 0.9, x => x), { color: RED, stroke: 10 }); }
    }
    function scene7(t) {
      head('E JESUS DISSE', t, 7, RED);
      chip('MATEUS 6:24', 540, 330, 54, prog(t, B[6] + 0.8, B[6] + 1.2), RED);
      const k = sm(t, sG.servir - 0.2, sG.servir + 0.9, x => x), sp = 150 * k;
      poly(box(170 - sp * 0.6, GROUND - 60, 260, 60), prog(t, sG.servir - 0.4, sG.servir), GOLD, 7, 270); txt('DEUS', 300 - sp * 0.6, GROUND - 30, 42, { color: GOLD, a: prog(t, sG.servir - 0.3, sG.servir) });
      poly(box(650 + sp * 0.6, GROUND - 60, 260, 60), prog(t, sG.servir - 0.4, sG.servir), RED, 7, 271); txt('DINHEIRO', 780 + sp * 0.6, GROUND - 30, 42, { color: RED, a: prog(t, sG.servir - 0.3, sG.servir) });
      const fall = prog(t, sG.dinheiro + 0.4, sG.dinheiro + 1.0);
      figure({ x: 540, y: GROUND - 60 + fall * 70, c: CHALK, s: 2.3, fall: 0, mood: 'shock', pose: { legs: [[0.5 + sp / 260, 0.5 + sp / 260], [-0.5 - sp / 260, -0.5 - sp / 260]], arms: [[1.4, 1.5], [-1.4, -1.5]] } });
      if (t > sG.raposas - 0.2) { ctx.save(); ga(sm(t, sG.raposas - 0.2, sG.raposas + 0.4)); ctx.fillStyle = BOARD; ctx.fillRect(60, 640, 960, 780); ga(1); ctx.restore(); const fk = sm(t, sG.raposas - 0.2, sG.raposas + 0.8, x => x);
        poly([[160, 1100], [160, 880], [300, 760], [440, 880], [440, 1100]], fk, CHALK, 8, 272); txt('COVA', 300, 1010, 44, { color: CHALK, a: fk });
        poly([[600, 1000], [640, 900], [680, 960], [760, 960], [800, 900], [840, 1000], [720, 1070], [600, 1000]], fk, GOLD, 8, 273); txt('RAPOSAS', 720, 1140, 44, { color: GOLD, a: fk });
        if (t > sG.cabeca - 0.3) { const hk = sm(t, sG.cabeca - 0.3, sG.cabeca + 0.5); figure({ x: 540, y: 700, c: CHALK, s: 1.0, a: hk * 0.0 }); txt('SEM ONDE', 540, 1290, 70, { color: RED, a: hk, stroke: 10 }); txt('REPOUSAR A CABEÇA', 540, 1370, 56, { color: CHALK, a: hk, stroke: 10 }); } }
    }
    function scene8(t) {
      head('A VIRADA', t, 8, GOLD);
      const ek = sm(t, sH.carta - 0.6, sH.carta + 0.5, x => x); poly(box(180, 330, 340, 230), ek, CHALK, 8, 280); poly([[180, 330], [350, 470], [520, 330]], ek, CHALK, 8, 281);
      txt('3 JOÃO 2', 350, 640, 54, { color: GOLD, a: sm(t, sH.saudacao - 0.1, sH.saudacao + 0.3), stroke: 9 }); txt('= SAUDAÇÃO DE CARTA', 350, 710, 44, { color: CHALK, a: sm(t, sH.carta - 0.2, sH.carta + 0.3), stroke: 9 });
      figure({ x: 850, y: GROUND, dir: -1, c: GOLD, s: 2.3, mood: 'smile', pose: { legs: IDLE.legs, arms: [[2.6 + 0.4 * Math.sin(t * 6), 2.9], [-0.1, -0.1]] } });
      if (t > sH.promessa - 0.1) { const k = prog(t, sH.promessa - 0.1, sH.promessa + 0.4); sack(300, 1000, 1.0, GOLD, k); txt('PROMESSA?', 300, 1180, 60, { color: CHALK, a: k, stroke: 10 }); poly([[160, 860], [440, 1120]], sm(t, sH.promessa + 0.3, sH.promessa + 0.7), RED, 12, 282); poly([[440, 860], [160, 1120]], sm(t, sH.promessa + 0.5, sH.promessa + 0.9), RED, 12, 283); }
      if (t > sH.condena - 0.2) { const k = prog(t, sH.condena - 0.2, sH.condena + 0.4); txt('♥ $', 640, 1050, 100, { color: RED, a: k, scale: 1 + 0.04 * Math.sin(t * 8) }); txt('o AMOR ao dinheiro', 640, 1170, 46, { color: RED, a: k, stroke: 8 }); txt('NÃO o dinheiro', 640, 1230, 46, { color: GREEN, a: sm(t, sH.condena + 0.7, sH.condena + 1.1), stroke: 8 }); }
    }
    function scene9(t) {
      head('A MESMA CARTA', t, 9, GOLD);
      church(60, GROUND, prog(t, B[8] + 0.2, B[8] + 1.4));
      const rk = sm(t, sI.ricos - 0.3, sI.ricos + 0.4, outBack); figure({ x: 540, y: GROUND, c: GOLD, s: 2.4, a: rk, pose: { legs: IDLE.legs, arms: [[0.9, 1.3], [-0.2, -0.1]] }, mood: 'smile' }); sack(620, GROUND - 330, 0.7, GOLD, rk);
      txt('SEM ORGULHO', 780, 420, 66, { color: CHALK, a: sm(t, sI.orgulhosos - 0.1, sI.orgulhosos + 0.4), stroke: 10, rot: -0.03 }); poly([[540, 440], [1020, 436]], sm(t, sI.orgulhosos + 0.3, sI.orgulhosos + 0.8), RED, 10, 290);
      if (t > sI.generosos - 0.2) { const gk = sm(t, sI.generosos - 0.2, sI.generosos + 1.0, x => x); figure({ x: 930, y: GROUND, dir: -1, c: PINK, s: 2.0, skirt: true, pose: { legs: IDLE.legs, arms: [[1.3, 1.6], [-0.1, -0.1]] }, mood: 'smile' }); for (let i = 0; i < 6; i++) { const p = clamp(gk * 1.6 - i * 0.18); coin(lerp(640, 890, p), GROUND - 330 - Math.sin(p * Math.PI) * 120, 18, p > 0 && p < 1 ? 1 : 0, GOLD); } txt('GENEROSOS', 780, 560, 70, { color: GOLD, scale: outBack(prog(t, sI.generosos - 0.1, sI.generosos + 0.3)), stroke: 12 }); }
    }
    function scene10(t) {
      head('ONDE OS DOIS CONCORDAM', t, 10, GOLD);
      const hk = sm(t, sJ.coracao - 0.4, sJ.coracao + 0.5, outBack); ctx.save(); ctx.translate(540, 700); ctx.scale(hk * (1 + 0.04 * Math.sin(t * 6)), hk * (1 + 0.04 * Math.sin(t * 6))); ctx.fillStyle = RED; ga(0.4); ctx.beginPath(); ctx.moveTo(0, 130); ctx.bezierCurveTo(-240, -30, -120, -190, 0, -70); ctx.bezierCurveTo(120, -190, 240, -30, 0, 130); ctx.fill(); ga(1); ctx.strokeStyle = RED; ctx.lineWidth = 9; ctx.stroke(); ctx.restore();
      txt('QUEM MANDA', 540, 900, 64, { color: CHALK, a: hk, stroke: 10 }); txt('NO CORAÇÃO?', 540, 975, 64, { color: GOLD, a: hk, stroke: 10 });
      const dk = sm(t, sJ.dinheiro - 0.2, sJ.dinheiro + 0.4, outBack); figure({ x: 170, y: GROUND, c: RED, s: 1.9, a: dk, pose: { legs: IDLE.legs, arms: [[1.4, 1.6], [-0.1, -0.1]] }, mood: 'sad' }); sack(300, GROUND - 270, 0.6, GOLD, dk); txt('DINHEIRO', 190, GROUND - 600, 50, { color: RED, a: dk, stroke: 9 });
      const gk = sm(t, sJ.deus - 0.2, sJ.deus + 0.4, outBack); figure({ x: 910, y: GROUND, dir: -1, c: GOLD, s: 1.9, a: gk, pose: { legs: IDLE.legs, arms: [[2.4, 2.7], [-0.1, -0.1]] }, mood: 'smile' }); txt('DEUS', 890, GROUND - 600, 50, { color: GOLD, a: gk, stroke: 9 });
      if (t > sJ.prosperidade - 0.3) { const k = prog(t, sJ.prosperidade - 0.3, sJ.prosperidade + 0.4); txt('PROSPERIDADE HOJE?', 540, 1180, 62, { color: CHALK, a: k, stroke: 10 }); txt('?', 540, 1300, 120, { color: RED, scale: outBack(k), stroke: 12 }); }
    }
    function scene11(t) {
      txt('E VOCÊ?', 540, 230, 150, { color: GOLD, scale: outBack(prog(t, B[10] + 0.15, B[10] + 0.6)), stroke: 14 });
      const jk = prog(t, sK.sim - 0.1, sK.sim + 0.3), dk = prog(t, sK.nao - 0.1, sK.nao + 0.3);
      txt('SIM', 290, 520, 130, { color: GOLD, scale: outBack(jk) * (1 + 0.02 * Math.sin(t * 6)), stroke: 14 }); txt('ou', 540, 520, 56, { color: CHALK, w: 700, a: jk }); txt('NÃO', 790, 520, 130, { color: RED, scale: outBack(dk) * (1 + 0.02 * Math.sin(t * 6 + 1)), stroke: 14 });
      const ck = sm(t, sK.comenta - 0.1, sK.comenta + 0.4, outBack); if (ck > 0) { ctx.save(); ctx.translate(540, 820); ctx.scale(ck, ck); ctx.fillStyle = 'rgba(14,30,22,0.9)'; ctx.strokeStyle = CHALK; ctx.lineWidth = 7; rr(-300, -80, 600, 160, 50); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-60, 80); ctx.lineTo(-100, 140); ctx.lineTo(0, 80); ctx.fill(); ctx.stroke(); ctx.restore(); txt('COMENTA + VERSÍCULO', 540, 820, 50, { color: CHALK, a: ck }); }
      if (t > sK.marca - 0.1) { const mk3 = sm(t, sK.marca - 0.1, sK.marca + 0.4, outBack); txt('MARCA QUEM', 540, 1030, 74, { color: CHALK, scale: mk3, stroke: 12 }); txt('VAI DISCORDAR', 540, 1120, 74, { color: RED, scale: mk3, stroke: 12 }); }
      figure({ x: 130, y: GROUND + 60, s: 1.45, c: PINK, skirt: true, bun: true, a: 0.9, pose: { legs: IDLE.legs, arms: [[2.2 + 0.4 * Math.sin(t * 7), 2.6], [-0.1, -0.1]] } }); figure({ x: 950, y: GROUND + 60, s: 1.45, dir: -1, c: BLUE, a: 0.9, pose: { legs: IDLE.legs, arms: [[2.2 + 0.4 * Math.sin(t * 7 + 1), 2.6], [-0.1, -0.1]] } });
      const bk = sm(t, sK.segue - 0.3, sK.segue + 0.1, outBack), press = t > sK.segue + 0.3;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1300); ctx.scale(bk, bk); ctx.fillStyle = press ? 'rgba(14,30,22,0.9)' : GOLD; rr(-290, -52, 580, 104, 52); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = GOLD; ctx.stroke(); ctx.restore(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR @e_cosdafe', 540, 1303, 46 * bk, { color: press ? GOLD : '#14291f' }); }
      txt('TODO DIA UM DEBATE DA FÉ', 540, 1410, 44, { color: CHALK, a: sm(t, sK.debate - 0.1, sK.debate + 0.4) });
      if (t > sK.amanha - 0.2) { const k = prog(t, sK.amanha - 0.2, sK.amanha + 0.4); txt('AMANHÃ:', 540, 1500, 44, { color: GOLD, a: k }); txt('PRECISA IR À IGREJA PARA SER SALVO?', 540, 1560, 38, { color: CHALK, a: k }); }
    }

    // ---------------- cues (sons de cena reais) ----------------
    cue(0.2, 'wind', { dur: 5 }); cue(sA.rico, 'coin'); cue(sA.rico + 0.3, 'coin'); cue(sA.dividem, 'crack'); cue(sA.dividem, 'impact', { gain: 0.7 });
    for (let i = 2; i <= 11; i++) cue(B[i - 1], 'swoosh');
    cue(sB.lados, 'pop'); cue(sB.texto, 'card'); cue(sC.joao, 'pop'); cue(sC.saude, 'success', { gain: 0.6 }); cue(sD.riqueza, 'coin'); cue(sD.enriquece, 'reveal'); cue(sE.salomao, 'sparkle'); cue(sE.bencao, 'tada', { gain: 0.5 }); cue(sE.pecado + 0.3, 'minus');
    cue(sF.tentacao, 'riser', { dur: 0.8 }); cue(sF.raiz, 'impact', { gain: 0.7 }); cue(sG.servir, 'whoosh'); cue(sG.dinheiro + 0.5, 'impact', { gain: 0.6 }); cue(sH.promessa + 0.4, 'error', { gain: 0.5 }); cue(sH.condena, 'ding', { gain: 0.5 });
    cue(sI.generosos, 'coin'); cue(sI.generosos + 0.3, 'coin'); cue(sJ.coracao, 'heart'); cue(sJ.prosperidade, 'pop'); cue(sK.voce, 'impact', { gain: 0.5 }); cue(sK.sim, 'pop'); cue(sK.nao, 'pop'); cue(sK.comenta, 'sms'); cue(sK.segue + 0.3, 'success');

    // ---------------- legendas (palavra a palavra) ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 62, words = g.map(w => w.text.replace(/[.,!?:]$/, '').toUpperCase()), ws = words.map(s => tw(s, size)), sp = 18, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), pop = 0.92 + 0.08 * outBack(prog(t, g.t0, g.t0 + 0.12));
      ctx.save(); ctx.translate(540, 1690); ctx.scale(pop, pop); let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; txt(words[i], x + ws[i] / 2, 0, size, { color: cur ? GOLD : '#ffffff', stroke: 14, sc: 'rgba(0,0,0,0.92)' }); x += ws[i] + sp; }); ctx.restore();
    }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11];
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(bgc, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      shakeAmt = 0; ctx.save(); ctx.beginPath(); ctx.rect(34, 34, W - 68, H - 68); ctx.clip();
      // a tremida precisa ser conhecida antes de desenhar: calcula pelas cenas 4 e 5
      const pre = 0;
      if (pre > 0.1) ctx.translate((hash(Math.floor(t * 40)) - 0.5) * pre, (hash(Math.floor(t * 40) + 9) - 0.5) * pre);
      sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      // borracha varre a lousa na troca de cena
      const u = t - B[i]; if (i > 0 && u < 0.35) { const k = u / 0.35, ex = W * k; ctx.save(); ctx.beginPath(); ctx.rect(ex, 34, W - ex - 34, H - 68); ctx.clip(); ctx.drawImage(bgc, 0, 0); ctx.restore(); ctx.save(); ctx.fillStyle = '#d8cdb0'; rr(ex - 70, 700, 110, 420, 18); ctx.fill(); ctx.fillStyle = '#3a2a1a'; rr(ex - 70, 1060, 110, 60, 14); ctx.fill(); ctx.restore(); }
      ctx.drawImage(FRAME, 0, 0);
      captions(t);
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
