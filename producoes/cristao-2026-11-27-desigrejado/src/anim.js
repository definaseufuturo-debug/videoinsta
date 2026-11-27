/*
 * "DEBATE DA FÉ: PRECISA IR À IGREJA PARA SER SALVO?" em LOUSA DE GIZ ANIMADA, 9:16 (@e_cosdafe). Lado SIM dourado x NÃO vermelho.
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

    const s1 = { sal: wt('c1', 'salvo'), igr: wt('c1', 'igreja'), div: wt('c1', 'dividem') };
    const s2 = { deb: wt('c2', 'debate'), des: wt('c2', 'desigrejado'), lad: wt('c2', 'lados') };
    const s3 = { sim: wt('c3', 'sim'), heb: wt('c3', 'hebreus'), cong: wt('c3', 'congregar'), cos: wt('c3', 'costume') };
    const s4 = { ato: wt('c4', 'atos'), jun: wt('c4', 'juntos'), pao: wt('c4', 'pao'), cor: wt('c4', 'corpo'), mem: wt('c4', 'membro'), soz: wt('c4', 'sozinho') };
    const s5 = { nao: wt('c5', 'nao'), luc: wt('c5', 'lucas'), lad: wt('c5', 'ladrao'), hoj: wt('c5', 'hoje'), par: wt('c5', 'paraiso'), igr: wt('c5', 'igreja'), bat: wt('c5', 'batismo'), cul: wt('c5', 'culto') };
    const s6 = { efe: wt('c6', 'efesios'), gra: wt('c6', 'graca'), fe: wt('c6', 'fe'), obr: wt('c6', 'obras'), cul: wt('c6', 'culto'), nin: wt('c6', 'ninguem') };
    const s7 = { det: wt('c7', 'detalhe'), heb: wt('c7', 'hebreus'), sal: wt('c7', 'salva'), est: wt('c7', 'estimular'), sus: wt('c7', 'sustenta'), com: wt('c7', 'compra') };
    const s8 = { con: wt('c8', 'concordam'), gra: wt('c8', 'graca'), div: wt('c8', 'divisao'), fe: wt('c8', 'fe'), soz: wt('c8', 'sozinha'), cmn: wt('c8', 'comunhao') };
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
    function scene1(t) {
      write('IGREJA?', 540, 200, 84, sm(t, 0.2, 1.0, x => x), { color: GOLD, stroke: 8 });
      church(560, GROUND, prog(t, 0.1, 1.6));
      const k = sm(t, 0.3, s1.igr + 0.8, x => x), x = lerp(520, -60, k) , w = k < 1 ? walkP(t, 6) : IDLE;
      figure({ x: lerp(500, 120, k), y: GROUND, dir: -1, c: BLUE, pose: w, mood: 'sad' });
      txt('SALVO', 540, 360, 130, { color: GOLD, scale: outBack(prog(t, s1.sal - 0.1, s1.sal + 0.3)), rot: -0.04, stroke: 12 });
      if (t > s1.igr) txt('SEM IGREJA?', 540, 510, 104, { color: RED, scale: outBack(prog(t, s1.igr - 0.1, s1.igr + 0.3)), stroke: 12 });
      if (t > s1.div) { txt('SIM', 300, 690, 110, { color: GOLD, scale: outBack(prog(t, s1.div - 0.1, s1.div + 0.3)), stroke: 12 }); txt('x', 540, 690, 70, { color: CHALK, a: sm(t, s1.div, s1.div + 0.3), w: 700 }); txt('NÃO', 780, 690, 110, { color: RED, scale: outBack(prog(t, s1.div + 0.1, s1.div + 0.4)), stroke: 12 }); }
    }
    function scene2(t) {
      splitBoard(t, B[1]); txt('x', 540, 860, 80, { color: CHALK, a: prog(t - B[1], 0.4, 0.8), w: 700 });
      write('DESIGREJADO', 540, 250, 80, sm(t, s2.des - 0.2, s2.des + 0.8, x => x), { color: CHALK, stroke: 10 });
      const lk = sm(t, s2.lad - 0.1, s2.lad + 0.5);
      txt('SIM', 290, 520, 150, { color: GOLD, scale: outBack(lk), stroke: 14 }); txt('NÃO', 790, 520, 150, { color: RED, scale: outBack(sm(t, s2.lad + 0.15, s2.lad + 0.65)), stroke: 14 });
      figure({ x: 250, y: GROUND, s: 2.4, c: GOLD, pose: { legs: IDLE.legs, arms: [[1.4 + 0.2 * Math.sin(t * 5), 1.6], [-0.1, -0.1]] }, mood: 'smile' });
      figure({ x: 830, y: GROUND, s: 2.4, dir: -1, c: RED, pose: { legs: IDLE.legs, arms: [[1.4 + 0.2 * Math.sin(t * 5 + 1), 1.6], [-0.1, -0.1]] }, mood: 'smile' });
      if (t > s2.deb) txt('O DEBATE DA FÉ', 540, 1470, 56, { color: CHALK, a: sm(t, s2.deb, s2.deb + 0.5) });
    }
    function scene3(t) {
      const u = t - B[2];
      txt('LADO SIM', 540, 190, 100, { color: GOLD, scale: outBack(prog(t, s3.sim - 0.1, s3.sim + 0.3)), stroke: 12 });
      const tk = sm(t, s3.heb - 0.2, s3.heb + 0.7); tablet(540, 560, 700, 300, tk, GOLD); txt('HEBREUS 10:25', 540, 520, 76, { color: GOLD, a: tk }); txt('NÃO DEIXEMOS DE CONGREGAR', 540, 620, 40, { color: CHALK, a: sm(t, s3.cong - 0.2, s3.cong + 0.4) });
      church(70, GROUND, prog(u, 0.2, 1.2));
      for (let i = 0; i < 4; i++) { const k = sm(t, s3.cong - 0.3 + i * 0.15, s3.cong + 1.0 + i * 0.15, x => x), x = lerp(1100 + i * 90, 560 - i * 70, k); figure({ x, y: GROUND - (i % 2) * 10, dir: -1, s: 1.9, c: [GOLD, BLUE, PINK, GREEN][i], skirt: i === 2, pose: k < 1 ? walkP(t + i, 8) : { legs: IDLE.legs, arms: [[0.3 + 0.1 * Math.sin(t * 4 + i), 0.3], [-0.12, -0.1]] }, mood: 'smile' }); }
      if (t > s3.cos) txt('COMO ALGUNS TÊM POR COSTUME', 540, 860, 50, { color: RED, a: sm(t, s3.cos, s3.cos + 0.5) });
    }
    function scene4(t) {
      write('ATOS 2 · O CORPO', 540, 190, 60, sm(t, B[3] + 0.1, B[3] + 1, x => x), { color: GOLD });
      // mesa com pão
      poly([[260, 1180], [820, 1180]], prog(t, B[3] + 0.2, B[3] + 0.8), CHALK, 8, 321); poly([[300, 1180], [300, GROUND]], prog(t, B[3] + 0.3, B[3] + 0.9), CHALK, 7, 322); poly([[780, 1180], [780, GROUND]], prog(t, B[3] + 0.3, B[3] + 0.9), CHALK, 7, 323);
      if (t > s4.pao - 0.2) poly([[480, 1180], [500, 1130], [580, 1130], [600, 1180]], sm(t, s4.pao - 0.2, s4.pao + 0.4), GOLD, 7, 324);
      [[150, BLUE], [260, PINK], [820, GREEN], [930, GOLD]].forEach(([x, c], i) => figure({ x, y: GROUND, dir: x < 540 ? 1 : -1, s: 1.9, c, skirt: i === 1, mood: 'smile', pose: { legs: IDLE.legs, arms: [[0.6 + 0.2 * Math.sin(t * 3 + i), 1.2], [-0.12, -0.1]] }, a: sm(t, s4.jun - 0.5 + i * 0.1, s4.jun + 0.3 + i * 0.1) }));
      if (t > s4.jun) txt('JUNTOS', 540, 420, 110, { color: GOLD, scale: outBack(prog(t, s4.jun - 0.1, s4.jun + 0.3)), stroke: 12 });
      if (t > s4.cor) { txt('IGREJA = CORPO', 540, 580, 74, { color: CHALK, a: sm(t, s4.cor - 0.1, s4.cor + 0.4), stroke: 8 }); }
      if (t > s4.mem - 0.1) { const k = sm(t, s4.mem - 0.1, s4.mem + 0.5), AY = -100, ax = 540 + (t > s4.soz ? -3 * Math.sin(t * 9) : 0); poly([[ax - 120, 860 + AY], [ax + 80, 860 + AY]], k, RED, 18, 330); poly(circ(ax + 100, 860 + AY, 30, 14), k, RED, 8, 331); txt('MEMBRO SOZINHO', 540, 860, 66, { color: RED, a: sm(t, s4.soz - 0.1, s4.soz + 0.4), stroke: 8 }); }
    }
    function scene5(t) {
      txt('LADO NÃO', 540, 190, 100, { color: RED, scale: outBack(prog(t, s5.nao - 0.1, s5.nao + 0.3)), stroke: 12 });
      write('LUCAS 23:43', 540, 300, 56, sm(t, s5.luc - 0.1, s5.luc + 0.7, x => x), { color: GOLD });
      crossP(540, GROUND, sm(t, s5.lad - 0.2, s5.lad + 0.9));
      figure({ x: 300, y: GROUND, dir: 1, c: BLUE, s: 2.3, lean: 0.1, pose: { legs: IDLE.legs, arms: [[1.0, 1.4], [-0.1, -0.1]] }, mood: t > s5.par ? 'smile' : 'sad', a: sm(t, s5.lad - 0.3, s5.lad + 0.3) });
      if (t > s5.hoj - 0.2) say(800, 600, 440, 230, 'HOJE ESTARÁS\nCOMIGO NO\nPARAÍSO', 52, prog(t, s5.hoj - 0.2, s5.hoj + 0.2), 640, 780, GOLD);
      [['IGREJA', s5.igr], ['BATISMO', s5.bat], ['CULTO', s5.cul]].forEach(([s, tt], i) => { const y = 520 + i * 110; txt('SEM ' + s, 290, y, 52, { color: CHALK, a: sm(t, tt - 0.2, tt + 0.3), stroke: 8 }); if (t > tt + 0.2) poly([[100, y + 6], [480, y - 6]], sm(t, tt + 0.2, tt + 0.5), RED, 9, 340 + i); });
    }
    function scene6(t) {
      write('EFÉSIOS 2:8-9', 540, 200, 70, sm(t, s6.efe - 0.1, s6.efe + 0.8, x => x), { color: GOLD, stroke: 8 });
      txt('GRAÇA', 330, 500, 130, { color: GOLD, scale: outBack(prog(t, s6.gra - 0.1, s6.gra + 0.3)), stroke: 12 });
      txt('+', 540, 640, 80, { color: CHALK, a: sm(t, s6.fe - 0.3, s6.fe, x => x) }); txt('FÉ', 540, 790, 150, { color: GOLD, scale: outBack(prog(t, s6.fe - 0.1, s6.fe + 0.3)), stroke: 12 });
      txt('OBRAS', 760, 1010, 120, { color: CHALK, a: sm(t, s6.obr - 0.1, s6.obr + 0.3), stroke: 12 }); if (t > s6.obr + 0.3) poly([[480, 1050], [1040, 970]], sm(t, s6.obr + 0.3, s6.obr + 0.7), RED, 14, 351);
      if (t > s6.cul - 0.2) { church(110, GROUND, 1); txt('CULTO ≠ SALVAÇÃO', 540, 1190, 64, { color: RED, scale: outBack(prog(t, s6.cul - 0.1, s6.cul + 0.3)), stroke: 10 }); }
      figure({ x: 860, y: GROUND, dir: -1, c: BLUE, s: 1.8, pose: { legs: IDLE.legs, arms: armsUp(t) }, mood: 'smile', a: sm(t, s6.fe, s6.fe + 0.5) });
    }
    function scene7(t) {
      txt('O DETALHE', 540, 190, 100, { color: GOLD, scale: outBack(prog(t, s7.det - 0.1, s7.det + 0.3)), stroke: 12 });
      tablet(540, 450, 760, 160, sm(t, s7.heb - 0.2, s7.heb + 0.6), CHALK); txt('HEBREUS 10:24-25', 540, 450, 56, { color: GOLD, a: sm(t, s7.heb - 0.1, s7.heb + 0.5) });
      if (t > s7.sal - 0.1) { txt('IGREJA SALVA?', 540, 590, 90, { color: CHALK, stroke: 10, a: sm(t, s7.sal - 0.1, s7.sal + 0.3) }); poly([[240, 630], [850, 570]], sm(t, s7.sal + 0.3, s7.sal + 0.7), RED, 12, 361); }
      // estimular: dois bonecos, um ajuda o outro a levantar
      const k = sm(t, s7.est - 0.2, s7.est + 1.0, x => x);
      figure({ x: 330, y: GROUND, c: GOLD, s: 2.2, lean: 0.1, pose: { legs: IDLE.legs, arms: [[1.2, 1.5 + 0.3 * Math.sin(t * 5)], [-0.1, -0.1]] }, mood: 'smile' });
      figure({ x: 540, y: GROUND, dir: -1, c: BLUE, s: 2.0, lean: lerp(0.35, 0, k), pose: { legs: IDLE.legs, arms: [[lerp(0.3, 1.0, k), lerp(0.4, 1.5, k)], [-0.1, -0.1]] }, mood: k > 0.6 ? 'smile' : 'sad' });
      if (t > s7.est) txt('♥', 440, GROUND - 520 - 20 * Math.sin(t * 4), 70, { color: PINK, a: sm(t, s7.est, s7.est + 0.4) });
      if (t > s7.sus - 0.1) txt('SUSTENTA A FÉ', 540, 720, 86, { color: GOLD, scale: outBack(prog(t, s7.sus - 0.1, s7.sus + 0.3)), stroke: 12 });
      if (t > s7.com - 0.1) { txt('NÃO COMPRA A SALVAÇÃO', 540, 820, 56, { color: RED, a: sm(t, s7.com - 0.1, s7.com + 0.4), stroke: 8 }); coin(880, 1000, 36, sm(t, s7.com - 0.2, s7.com + 0.2)); poly([[830, 950], [930, 1050]], sm(t, s7.com + 0.2, s7.com + 0.5), RED, 10, 362); }
    }
    function scene8(t) {
      const u = t - B[7];
      write('OS DOIS LADOS', 540, 190, 70, sm(t, B[7] + 0.1, B[7] + 1, x => x), { color: CHALK, stroke: 8 });
      const hk = sm(t, s8.con - 0.2, s8.con + 0.9, x => x), lx = lerp(150, 400, hk), rx = lerp(930, 680, hk);
      figure({ x: lx, y: GROUND, c: GOLD, s: 2.2, pose: { legs: IDLE.legs, arms: [[hk > 0.95 ? 1.0 : 0.3, 1.5], [-0.1, -0.1]] }, mood: 'smile' }); figure({ x: rx, y: GROUND, dir: -1, c: RED, s: 2.2, pose: { legs: IDLE.legs, arms: [[hk > 0.95 ? 1.0 : 0.3, 1.5], [-0.1, -0.1]] }, mood: 'smile' });
      if (t > s8.gra) txt('PELA GRAÇA', 540, 480, 120, { color: GOLD, scale: outBack(prog(t, s8.gra - 0.1, s8.gra + 0.3)), stroke: 12 });
      if (t > s8.div - 0.1) txt('A DIVISÃO:', 540, 760, 70, { color: RED, a: sm(t, s8.div - 0.1, s8.div + 0.3), stroke: 8 });
      if (t > s8.fe - 0.1) txt('A FÉ SOBREVIVE SOZINHA?', 540, 870, 62, { color: CHALK, a: sm(t, s8.fe - 0.1, s8.fe + 0.4), stroke: 8 });
      if (t > s8.cmn - 0.4) { const k = sm(t, s8.cmn - 0.4, s8.cmn + 0.4); poly([[540, 1000], [540, 1060]], k, GOLD, 8, 371); const fl = 14 + 3 * Math.sin(t * 12); ctx.save(); ctx.fillStyle = GOLD; ctx.globalAlpha = k; ctx.beginPath(); ctx.ellipse(540, 975, 12, fl, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    }
    function scene9(t) { ctaScene(t, B[8], { a: s9.sim, b: s9.nao, cmt: s9.cmt, ver: s9.ver, mar: s9.mar, seg: s9.seg, deb: s9.deb, am: s9.am }, 'SIM', 'NÃO', GOLD, RED, ['TODO DIA UM DEBATE DA FÉ', 'AMANHÃ: FALAR EM LÍNGUAS AINDA EXISTE?', 130]); }
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9];
    cue(0.2, 'wind', { dur: 5 }); cue(s1.sal, 'pop'); cue(s1.igr, 'impact', { gain: 0.5 }); cue(s1.div, 'reveal');
    cue(B[1], 'swoosh'); cue(s2.lad, 'pop'); cue(s2.lad + 0.15, 'pop');
    cue(B[2], 'swoosh'); cue(s3.sim, 'pop'); cue(s3.heb, 'reveal'); cue(s3.cong, 'whoosh'); cue(s3.cos, 'ding', { gain: 0.5 });
    cue(B[3], 'swoosh'); cue(s4.jun, 'pop'); cue(s4.pao, 'plop'); cue(s4.cor, 'pop'); cue(s4.soz, 'minus');
    cue(B[4], 'swoosh'); cue(s5.nao, 'pop'); cue(s5.lad, 'reveal'); cue(s5.hoj, 'pop'); cue(s5.igr + 0.2, 'minus'); cue(s5.bat + 0.2, 'minus'); cue(s5.cul + 0.2, 'minus');
    cue(B[5], 'swoosh'); cue(s6.efe, 'reveal'); cue(s6.gra, 'pop'); cue(s6.fe, 'pop'); cue(s6.obr + 0.3, 'error', { gain: 0.5 });
    cue(B[6], 'swoosh'); cue(s7.det, 'pop'); cue(s7.sal + 0.3, 'minus'); cue(s7.est, 'ding', { gain: 0.5 }); cue(s7.sus, 'pop'); cue(s7.com + 0.2, 'minus');
    cue(B[7], 'swoosh'); cue(s8.con, 'ding', { gain: 0.5 }); cue(s8.div, 'pop'); cue(s8.cmn, 'riser', { dur: 0.8 });
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
