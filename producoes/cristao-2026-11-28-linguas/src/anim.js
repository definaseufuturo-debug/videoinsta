/*
 * "DEBATE DA FÉ: FALAR EM LÍNGUAS AINDA EXISTE?" em LOUSA DE GIZ ANIMADA, 9:16 (@e_cosdafe). Lado SIM dourado x NÃO vermelho.
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

    const s1 = { lin: wt('c1', 'linguas'), ain: wt('c1', 'ainda'), apo: wt('c1', 'apostolos'), div: wt('c1', 'dividem') };
    const s2 = { deb: wt('c2', 'debates'), lad: wt('c2', 'lados'), tex: wt('c2', 'texto') };
    const s3 = { sim: wt('c3', 'sim'), atos: wt('c3', 'atos'), pen: wt('c3', 'pentecostes'), esp: wt('c3', 'espirito'), fal: wt('c3', 'falar'), pau: wt('c3', 'paulo'), pro: wt('c3', 'proibais') };
    const s4 = { pau: wt('c4', 'paulo'), mai: wt('c4', 'mais'), tod: wt('c4', 'todos'), nun: wt('c4', 'nunca') };
    const s5 = { nao: wt('c5', 'nao'), cor: wt('c5', 'corintios'), ces: wt('c5', 'cessarao'), sin: wt('c5', 'sinais'), ig: wt('c5', 'igreja'), aca: wt('c5', 'acabaram'), tex: wt('c5', 'texto'), com: wt('c5', 'completo') };
    const s6 = { atos: wt('c6', 'atos'), idi: wt('c6', 'idiomas'), cada: wt('c6', 'cada'), est: wt('c6', 'estrangeiro'), pro: wt('c6', 'propria') };
    const s7 = { det: wt('c7', 'detalhe'), max: wt('c7', 'maximo'), dois: wt('c7', 'dois'), tres: wt('c7', 'tres'), vez: wt('c7', 'vez'), int: wt('c7', 'interprete'), cal: wt('c7', 'calado') };
    const s8 = { tre: wt('c8', 'treze'), hom: wt('c8', 'homens'), anj: wt('c8', 'anjos'), amor: wt('c8', 'amor'), met: wt('c8', 'metal'), soa: wt('c8', 'soa'), con: wt('c8', 'concordam'), bar: wt('c8', 'barulho') };
    const s9 = { sim: wt('c9', 'sim'), nao: wt('c9', 'nao'), cmt: wt('c9', 'comenta'), ver: wt('c9', 'versiculo'), mar: wt('c9', 'marca'), seg: wt('c9', 'segue'), deb: wt('c9', 'dia'), am: wt('c9', 'amanha') };
    const shake = t => 0;
    const HDR = (t, s, t0, col = GOLD) => write(s, 540, 175, 60, sm(t, t0 + 0.1, t0 + 1.0, x => x), { color: col });
    const houseP = (x, y, k) => { poly([[x, y], [x, y - 200], [x - 50, y - 200], [x + 110, y - 330], [x + 270, y - 200], [x + 220, y - 200], [x + 220, y], [x, y]], k, CHALK, 7, 81); };
    const doorP = (x, y, k) => poly([[x + 70, y], [x + 70, y - 120], [x + 150, y - 120], [x + 150, y]], k, GOLD, 6, 82);
    const tablet = (x, y, w, h, k, col = CHALK) => { poly(box(x - w / 2, y - h / 2, w, h), k, col, 7, 91); };
    const armsUp = (t, ph = 0) => [[2.4 + 0.3 * Math.sin(t * 6 + ph), 2.7], [-0.15, -0.1]];
    const say = (x, y, w, h, s, size, k, tx, ty, col) => { if (k > 0) bubble(x, y, w, h, s, size, k, tx, ty, col); };
    function splitBoard(t, t0) { const u = t - t0; poly([[540, 160], [540, 1540]], prog(u, 0.1, 0.7), CHALK, 8, 131); }
    // CTA padrão (última cena): headline, dois lados, comenta, marca, segue
    function ctaScene(t, B0, A, L1, L2, c1, c2, extra) {
      txt('E VOCÊ?', 540, 230, 150, { color: GOLD, scale: outBack(prog(t, B0 + 0.15, B0 + 0.6)), stroke: 14 });
      const jk = prog(t, A.a - 0.1, A.a + 0.3), dk = prog(t, A.b - 0.1, A.b + 0.3);
      txt(L1, 290, 520, (extra[2] || 84), { color: c1, scale: outBack(jk) * (1 + 0.02 * Math.sin(t * 6)), stroke: 12 }); txt('ou', 540, 520, 50, { color: CHALK, w: 700, a: jk }); txt(L2, 790, 520, (extra[2] || 84), { color: c2, scale: outBack(dk) * (1 + 0.02 * Math.sin(t * 6 + 1)), stroke: 12 });
      const ck = sm(t, A.cmt - 0.1, A.cmt + 0.4, outBack); if (ck > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(ck, ck); ctx.fillStyle = 'rgba(14,30,22,0.9)'; ctx.strokeStyle = CHALK; ctx.lineWidth = 7; rr(-300, -90, 600, 180, 50); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-60, 90); ctx.lineTo(-100, 150); ctx.lineTo(0, 90); ctx.fill(); ctx.stroke(); ctx.restore(); txt('COMENTA', 540, 870, 70, { color: CHALK, a: ck }); txt('+ O VERSÍCULO', 540, 945, 46, { color: GOLD, a: sm(t, A.ver - 0.1, A.ver + 0.3) }); }
      if (t > A.mar - 0.1) { const m3 = sm(t, A.mar - 0.1, A.mar + 0.4, outBack); txt('MARCA QUEM', 540, 1130, 78, { color: CHALK, scale: m3, stroke: 12 }); txt('VAI DISCORDAR', 540, 1225, 78, { color: RED, scale: m3, stroke: 12 }); }
      figure({ x: 130, y: GROUND + 60, s: 1.45, c: PINK, skirt: true, bun: true, a: 0.9, pose: { legs: IDLE.legs, arms: [[2.2 + 0.4 * Math.sin(t * 7), 2.6], [-0.1, -0.1]] } }); figure({ x: 950, y: GROUND + 60, s: 1.45, dir: -1, c: BLUE, a: 0.9, pose: { legs: IDLE.legs, arms: [[2.2 + 0.4 * Math.sin(t * 7 + 1), 2.6], [-0.1, -0.1]] } });
      const bk = sm(t, A.seg - 0.3, A.seg + 0.1, outBack), press = t > A.seg + 0.3;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1390); ctx.scale(bk, bk); ctx.fillStyle = press ? 'rgba(14,30,22,0.9)' : GOLD; rr(-290, -52, 580, 104, 52); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = GOLD; ctx.stroke(); ctx.restore(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR @e_cosdafe', 540, 1393, 46 * bk, { color: press ? GOLD : '#14291f' }); }
      txt(extra[0], 540, 1490, 42, { color: CHALK, a: sm(t, A.deb - 0.1, A.deb + 0.4) });
      if (extra[1]) txt(extra[1], 540, 1560, 36, { color: GOLD, a: sm(t, A.am - 0.1, A.am + 0.4) });
    }
    const crossP = (x, y, k, col = CHALK) => { poly([[x, y], [x, y - 360]], k, col, 9, 301); poly([[x - 100, y - 270], [x + 100, y - 270]], k, col, 9, 302); };
    const xmark = (x, y, r, k) => { poly([[x - r, y - r], [x + r, y + r]], k, RED, 12, 311); poly([[x + r, y - r], [x - r, y + r]], prog(k, 0.4, 1) , RED, 12, 312); };
    function flame(x, y, s, k, t, col = GOLD) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.globalAlpha = 0.9; const f = 1 + 0.12 * Math.sin(t * 14 + x); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-26, -24, -4, -62 * f); ctx.quadraticCurveTo(2, -40, 10, -48); ctx.quadraticCurveTo(30, -24, 0, 0); ctx.fill(); ctx.restore(); }
    function wave(x, y, w, k, t, col = CHALK) { if (k <= 0) return; const p = []; for (let i = 0; i <= 24; i++) p.push([x + (i / 24 - 0.5) * w, y + Math.sin(i * 0.9 + t * 8) * 9]); poly(p, k, col, 5, 61); }
    function book(x, y, k, col = CHALK) { poly(box(x - 70, y - 90, 140, 180), k, col, 7, 71); poly([[x - 40, y - 50], [x + 40, y - 50]], prog(k, 0.4, 1), col, 5, 72); poly([[x - 40, y - 10], [x + 40, y - 10]], prog(k, 0.5, 1), col, 5, 73); poly([[x - 40, y + 30], [x + 20, y + 30]], prog(k, 0.6, 1), col, 5, 74); }
    function cymbals(x, y, k, t, col = RED) { if (k <= 0) return; const sh = Math.sin(t * 30) * 4 * k; poly([[x - 110, y - 40 + sh], [x - 10, y - 10], [x - 110, y + 30 - sh]], k, col, 9, 81); poly([[x + 110, y - 40 - sh], [x + 10, y - 10], [x + 110, y + 30 + sh]], k, col, 9, 82); }
    const sp = (t, ph = 0, a0 = 1.2) => ({ legs: IDLE.legs, arms: [[a0 + 0.3 * Math.sin(t * 6 + ph), a0 + 0.4], [-0.1, -0.1]] });
    function scene1(t) {
      write('E AINDA HOJE?', 540, 190, 76, sm(t, 0.2, 1.0, x => x), { color: GOLD, stroke: 8 });
      txt('LÍNGUAS?', 540, 400, 130, { color: RED, scale: outBack(prog(t, s1.lin - 0.1, s1.lin + 0.35)), rot: -0.03, stroke: 14 });
      figure({ x: 540, y: GROUND, s: 2.6, c: CHALK, pose: { legs: IDLE.legs, arms: [[2.6 + 0.2 * Math.sin(t * 5), 2.8], [2.5 - 0.2 * Math.sin(t * 5), 2.7]] }, mood: 'shock' });
      flame(500, 800, 1.6, sm(t, s1.lin, s1.lin + 0.5), t); wave(540, 760, 260, sm(t, s1.lin + 0.2, s1.lin + 0.8), t, GOLD);
      if (t > s1.ain - 0.1) txt('OU ACABOU COM OS APÓSTOLOS?', 540, 1500, 46, { color: CHALK, a: sm(t, s1.ain - 0.1, s1.ain + 0.5), stroke: 8 });
      if (t > s1.div) { txt('SIM', 200, 1010, 90, { color: GOLD, scale: outBack(prog(t, s1.div - 0.1, s1.div + 0.3)), stroke: 12 }); txt('NÃO', 880, 1010, 90, { color: RED, scale: outBack(prog(t, s1.div + 0.1, s1.div + 0.4)), stroke: 12 }); }
    }
    function scene2(t) {
      splitBoard(t, B[1]); txt('x', 540, 860, 80, { color: CHALK, a: prog(t - B[1], 0.4, 0.8), w: 700 });
      write('OS DEBATES', 540, 250, 80, sm(t, s2.deb - 0.2, s2.deb + 0.8, x => x), { color: CHALK, stroke: 10 });
      const lk = sm(t, s2.lad - 0.1, s2.lad + 0.5);
      txt('SIM', 290, 520, 150, { color: GOLD, scale: outBack(lk), stroke: 14 }); txt('NÃO', 790, 520, 150, { color: RED, scale: outBack(sm(t, s2.lad + 0.15, s2.lad + 0.65)), stroke: 14 });
      figure({ x: 250, y: GROUND, s: 2.4, c: GOLD, pose: sp(t, 0, 1.4), mood: 'smile' }); figure({ x: 830, y: GROUND, s: 2.4, dir: -1, c: RED, pose: sp(t, 1, 1.4), mood: 'smile' });
      if (t > s2.tex) { const k = sm(t, s2.tex, s2.tex + 0.5); book(540, 1160, k); }
    }
    function scene3(t) {
      const u = t - B[2];
      txt('LADO SIM', 540, 190, 100, { color: GOLD, scale: outBack(prog(t, s3.sim - 0.1, s3.sim + 0.3)), stroke: 12 });
      const tk = sm(t, s3.atos - 0.2, s3.atos + 0.7); tablet(540, 400, 700, 150, tk, GOLD); txt('ATOS 2 · PENTECOSTES', 540, 400, 54, { color: GOLD, a: tk });
      [[200, GOLD], [400, BLUE], [680, PINK], [880, GREEN]].forEach(([x, c], i) => {
        figure({ x, y: GROUND, s: 1.8, c, skirt: i === 2, pose: sp(t, i, 1.8), mood: 'smile', a: sm(t, s3.pen - 0.4 + i * 0.1, s3.pen + 0.3 + i * 0.1) });
        flame(x, GROUND - 330, 1.3, sm(t, s3.esp + i * 0.12, s3.esp + 0.5 + i * 0.12), t); wave(x, GROUND - 460, 150, sm(t, s3.fal + i * 0.1, s3.fal + 0.6 + i * 0.1), t, c);
      });
      const pk = sm(t, s3.pau - 0.2, s3.pau + 0.7); tablet(540, 640, 700, 170, pk, GOLD); txt('1 CORÍNTIOS 14:39', 540, 610, 52, { color: GOLD, a: pk }); txt('NÃO PROIBAIS FALAR LÍNGUAS', 540, 680, 36, { color: CHALK, a: sm(t, s3.pro - 0.2, s3.pro + 0.4) });
    }
    function scene4(t) {
      write('1 CORÍNTIOS 14:18', 540, 190, 66, sm(t, B[3] + 0.1, B[3] + 1, x => x), { color: GOLD, stroke: 8 });
      figure({ x: 330, y: GROUND, s: 2.6, c: CHALK, beard: true, pose: sp(t, 0, 1.3), mood: 'smile' });
      say(430, 560, 700, 240, 'FALO MAIS LÍNGUAS\nDO QUE VÓS TODOS', 50, prog(t, s4.pau - 0.1, s4.pau + 0.3), 340, 900, GOLD);
      [[760, BLUE], [880, PINK], [1000, GREEN]].forEach(([x, c], i) => figure({ x, y: GROUND, s: 1.4, c, dir: -1, skirt: i === 1, pose: IDLE, mood: 'shock', a: sm(t, s4.tod - 0.3 + i * 0.1, s4.tod + 0.3 + i * 0.1) }));
      if (t > s4.nun - 0.1) txt('O DOM NUNCA\nFOI RETIRADO'.split('\n')[0], 540, 1480, 64, { color: GOLD, a: sm(t, s4.nun - 0.1, s4.nun + 0.4), stroke: 10 }), txt('FOI RETIRADO', 540, 1555, 64, { color: GOLD, a: sm(t, s4.nun, s4.nun + 0.5), stroke: 10 });
    }
    function scene5(t) {
      txt('LADO NÃO', 540, 190, 100, { color: RED, scale: outBack(prog(t, s5.nao - 0.1, s5.nao + 0.3)), stroke: 12 });
      const tk = sm(t, s5.cor - 0.2, s5.cor + 0.7); tablet(540, 400, 700, 150, tk, RED); txt('1 CORÍNTIOS 13:8', 540, 400, 56, { color: RED, a: tk });
      const c = sm(t, s5.cor, s5.cor + 0.6); poly([[540, 1330], [540, 1000]], c, CHALK, 14, 91); poly(box(500, 1000, 80, 0), 0, CHALK, 1, 1);
      const out = prog(t, s5.ces, s5.ces + 0.8); flame(540, 990, 1.8 * (1 - out), c, t);
      if (t > s5.ces - 0.1) txt('CESSARÃO', 540, 700, 110, { color: RED, scale: outBack(prog(t, s5.ces - 0.1, s5.ces + 0.3)), stroke: 14 });
      if (t > s5.sin - 0.1) txt('SINAIS DA IGREJA NASCENTE', 540, 800, 42, { color: CHALK, a: sm(t, s5.sin - 0.1, s5.sin + 0.4), stroke: 8 });
      church(70, GROUND, sm(t, s5.ig - 0.2, s5.ig + 1.0, x => x));
      if (t > s5.tex - 0.1) { const k = sm(t, s5.tex - 0.1, s5.tex + 0.6); book(880, 1150, k, GOLD); }
      if (t > s5.com) txt('COMPLETO', 880, 1010, 44, { color: GOLD, a: sm(t, s5.com, s5.com + 0.4), stroke: 8 });
    }
    function scene6(t) {
      write('ATOS 2:6-8', 540, 190, 70, sm(t, B[5] + 0.1, B[5] + 1, x => x), { color: GOLD, stroke: 8 });
      txt('IDIOMAS REAIS', 540, 300, 76, { color: GOLD, scale: outBack(prog(t, s6.idi - 0.1, s6.idi + 0.35)), stroke: 12 });
      figure({ x: 540, y: GROUND, s: 2.2, c: CHALK, beard: true, pose: sp(t, 0, 1.5), mood: 'smile' }); flame(540, GROUND - 330, 1.2, sm(t, s6.atos, s6.atos + 0.5), t);
      [[200, BLUE, 'HELLO', 1], [380, PINK, 'HOLA', 1], [740, GREEN, 'SHALOM', -1], [900, RED, 'CIAO', -1]].forEach(([x, c, w, d], i) => {
        figure({ x, y: GROUND, s: 1.6, dir: d, c, skirt: i === 1, pose: IDLE, mood: 'shock', a: sm(t, s6.cada - 0.3 + i * 0.12, s6.cada + 0.3 + i * 0.12) });
        say(x, 830, 190, 90, w, 32, prog(t, s6.cada + 0.4 + i * 0.2, s6.cada + 0.8 + i * 0.2), x, 1000, c);
      });
      if (t > s6.pro - 0.1) txt('CADA UM OUVIA NA SUA LÍNGUA', 540, 1500, 44, { color: GOLD, a: sm(t, s6.pro - 0.1, s6.pro + 0.5), stroke: 8 });
    }
    function scene7(t) {
      txt('O DETALHE', 540, 190, 100, { color: GOLD, scale: outBack(prog(t, s7.det - 0.1, s7.det + 0.3)), stroke: 12 });
      const tk = sm(t, s7.det, s7.det + 0.7); tablet(540, 380, 700, 120, tk, GOLD); txt('1 CORÍNTIOS 14:27-28', 540, 380, 50, { color: GOLD, a: tk });
      const turns = [s7.dois, s7.tres, s7.vez];
      [[190, BLUE], [420, PINK], [650, GREEN]].forEach(([x, c], i) => {
        const on = t > turns[i] - 0.1 && t < turns[i] + 1.4;
        figure({ x, y: GROUND, s: 1.8, c, skirt: i === 1, pose: on ? sp(t, i, 1.8) : IDLE, mood: 'smile', a: sm(t, s7.max - 0.3 + i * 0.12, s7.max + 0.3 + i * 0.12) });
        if (t > s7.max - 0.1) txt(String(i + 1), x, 760, 90, { color: on ? GOLD : CHALK, a: sm(t, s7.max - 0.1 + i * 0.15, s7.max + 0.3 + i * 0.15), scale: on ? 1.2 : 1, stroke: 10 });
        if (on) wave(x, GROUND - 430, 140, 1, t, c);
      });
      if (t > s7.max - 0.1) txt('NO MÁXIMO 3', 540, 570, 64, { color: CHALK, a: sm(t, s7.max - 0.1, s7.max + 0.4), stroke: 10 });
      const ik = sm(t, s7.int - 0.3, s7.int + 0.4);
      figure({ x: 910, y: GROUND, s: 1.8, dir: -1, c: GOLD, pose: sp(t, 3, 1.5), mood: 'smile', a: ik }); say(880, 900, 270, 130, '= TRADUÇÃO', 34, prog(t, s7.int, s7.int + 0.4), 910, 1030, GOLD);
      if (t > s7.int - 0.1) txt('COM INTÉRPRETE', 540, 1440, 54, { color: GOLD, a: sm(t, s7.int - 0.1, s7.int + 0.4), stroke: 8 });
      if (t > s7.cal - 0.1) { txt('SEM INTÉRPRETE:', 540, 1500, 46, { color: CHALK, a: sm(t, s7.cal - 0.4, s7.cal), stroke: 8 }); txt('CALADO', 540, 1560, 70, { color: RED, scale: outBack(prog(t, s7.cal - 0.1, s7.cal + 0.3)), stroke: 12 }); }
    }
    function scene8(t) {
      write('1 CORÍNTIOS 13:1', 540, 190, 68, sm(t, s8.tre - 0.2, s8.tre + 0.8, x => x), { color: GOLD, stroke: 8 });
      txt('HOMENS', 280, 320, 70, { color: BLUE, scale: outBack(prog(t, s8.hom - 0.1, s8.hom + 0.3)), stroke: 10 }); txt('ANJOS', 800, 320, 70, { color: GOLD, scale: outBack(prog(t, s8.anj - 0.1, s8.anj + 0.3)), stroke: 10 });
      const hk = sm(t, s8.amor - 0.1, s8.amor + 0.5), mk = sm(t, s8.met - 0.2, s8.met + 0.4);
      if (hk * (1 - mk) > 0.01) { ga(1 - mk); txt('♥', 540, 650, 220, { color: PINK, scale: outBack(hk) }); txt('AMOR', 540, 820, 80, { color: PINK, a: hk, stroke: 10 }); ga(1); }
      cymbals(540, 650, mk, t); if (t > s8.soa) { for (let i = 0; i < 3; i++) { const r = 150 + i * 40 + ((t - s8.soa) * 90) % 40; ga(0.5); poly(circ(540, 650, r, 30), 1, RED, 4, 95 + i); ga(1); } txt('METAL QUE SOA', 540, 820, 60, { color: RED, a: sm(t, s8.soa - 0.1, s8.soa + 0.4), stroke: 10 }); }
      const hk2 = sm(t, s8.con - 0.2, s8.con + 0.9, x => x), lx = lerp(150, 400, hk2), rx = lerp(930, 680, hk2);
      figure({ x: lx, y: GROUND, c: GOLD, s: 2.2, pose: sp(t, 0, hk2 > 0.95 ? 1.0 : 0.3), mood: 'smile' }); figure({ x: rx, y: GROUND, dir: -1, c: RED, s: 2.2, pose: sp(t, 1, hk2 > 0.95 ? 1.0 : 0.3), mood: 'smile' });
      if (t > s8.bar - 0.1) txt('SEM AMOR = BARULHO', 540, 1050, 62, { color: RED, scale: outBack(prog(t, s8.bar - 0.1, s8.bar + 0.3)), stroke: 12 });
    }
    function scene9(t) { ctaScene(t, B[8], { a: s9.sim, b: s9.nao, cmt: s9.cmt, ver: s9.ver, mar: s9.mar, seg: s9.seg, deb: s9.deb, am: s9.am }, 'SIM', 'NÃO', GOLD, RED, ['TODO DIA UM DEBATE DA FÉ', 'AMANHÃ: BATISMO DE CRIANÇA OU SÓ DE ADULTO?', 130]); }
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9];
    cue(0.2, 'wind', { dur: 5 }); cue(s1.lin, 'impact', { gain: 0.5 }); cue(s1.div, 'reveal');
    cue(B[1], 'swoosh'); cue(s2.lad, 'pop'); cue(s2.lad + 0.15, 'pop'); cue(s2.tex, 'reveal');
    cue(B[2], 'swoosh'); cue(s3.sim, 'pop'); cue(s3.atos, 'reveal'); cue(s3.esp, 'ding', { gain: 0.5 }); cue(s3.pau, 'reveal');
    cue(B[3], 'swoosh'); cue(s4.pau, 'pop'); cue(s4.tod, 'pop'); cue(s4.nun, 'ding', { gain: 0.5 });
    cue(B[4], 'swoosh'); cue(s5.nao, 'pop'); cue(s5.cor, 'reveal'); cue(s5.ces, 'minus'); cue(s5.tex, 'pop');
    cue(B[5], 'swoosh'); cue(s6.idi, 'pop'); cue(s6.cada, 'pop'); cue(s6.cada + 0.6, 'pop');
    cue(B[6], 'swoosh'); cue(s7.det, 'pop'); cue(s7.dois, 'pop'); cue(s7.tres, 'pop'); cue(s7.vez, 'pop'); cue(s7.int, 'ding', { gain: 0.5 }); cue(s7.cal, 'minus');
    cue(B[7], 'swoosh'); cue(s8.hom, 'pop'); cue(s8.anj, 'pop'); cue(s8.amor, 'ding', { gain: 0.5 }); cue(s8.met, 'error', { gain: 0.5 }); cue(s8.con, 'ding', { gain: 0.5 }); cue(s8.bar, 'impact', { gain: 0.4 });
    cue(B[8], 'swoosh'); cue(s9.sim, 'pop'); cue(s9.nao, 'pop'); cue(s9.cmt, 'sms'); cue(s9.mar, 'pop'); cue(s9.seg + 0.3, 'success');
    // ---------------- legendas (palavra a palavra) ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 62, words = g.map(w => w.text.replace(/[.,!?:]$/, '').toUpperCase()), ws = words.map(s => tw(s, size)), sp = 18, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), pop = 0.92 + 0.08 * outBack(prog(t, g.t0, g.t0 + 0.12));
      ctx.save(); ctx.translate(540, 1690); ctx.scale(pop, pop); let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; txt(words[i], x + ws[i] / 2, 0, size, { color: cur ? GOLD : '#ffffff', stroke: 14, sc: 'rgba(0,0,0,0.92)' }); x += ws[i] + sp; }); ctx.restore();
    }

    cues.sort((a, b) => a.t - b.t);
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(bgc, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); ctx.beginPath(); ctx.rect(34, 34, W - 68, H - 68); ctx.clip();
      const sh = shake(t); if (sh > 0.1) ctx.translate((hash(Math.floor(t * 40)) - 0.5) * sh, (hash(Math.floor(t * 40) + 9) - 0.5) * sh);
      sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      const u = t - B[i]; if (i > 0 && u < 0.35) { const k = u / 0.35, ex = W * k; ctx.save(); ctx.beginPath(); ctx.rect(ex, 34, W - ex - 34, H - 68); ctx.clip(); ctx.drawImage(bgc, 0, 0); ctx.restore(); ctx.save(); ctx.fillStyle = '#d8cdb0'; rr(ex - 70, 700, 110, 420, 18); ctx.fill(); ctx.fillStyle = '#3a2a1a'; rr(ex - 70, 1060, 110, 60, 14); ctx.fill(); ctx.restore(); }
      ctx.drawImage(FRAME, 0, 0);
      captions(t);
    }
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
