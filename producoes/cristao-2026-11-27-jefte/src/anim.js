/*
 * "A BÍBLIA QUE NINGUÉM PREGA: O VOTO DE JEFTÉ" (Juízes 11:30-40), debate em LOUSA DE GIZ ANIMADA, 9:16 (@e_cosdafe). Bonequinhos de giz atuam cada cena.
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

    // ---------------- âncoras ----------------
    const s1 = { pai: wt('c1', 'pai'), pro: wt('c1', 'prometeu'), por: wt('c1', 'porta'), fil: wt('c1', 'filha'), aco: wt('c1', 'aconteceu') };
    const s2 = { jui: wt('c2', 'juizes'), jef: wt('c2', 'jefte'), lut: wt('c2', 'lutar'), amo: wt('c2', 'amonitas'), vot: wt('c2', 'voto'), cas: wt('c2', 'casa'), ven: wt('c2', 'vencedor'), sen: wt('c2', 'senhor') };
    const s3 = { vit: wt('c3', 'vitoria'), vol: wt('c3', 'voltou'), mis: wt('c3', 'mispa'), cor: wt('c3', 'correndo'), tam: wt('c3', 'tamborim'), dan: wt('c3', 'danca'), uni: wt('c3', 'unica') };
    const s4 = { ras: wt('c4', 'rasgou'), ai: wt('c4', 'ai'), abr: wt('c4', 'abri'), vol: wt('c4', 'voltar'), res: wt('c4', 'respondeu'), fac: wt('c4', 'faca'), pro: wt('c4', 'prometeu') };
    const s5 = { ped: wt('c5', 'pediu'), dois: wt('c5', 'dois'), mon: wt('c5', 'montes'), cho: wt('c5', 'chorar'), pas: wt('c5', 'passados'), cum: wt('c5', 'cumpriu'), vot: wt('c5', 'voto'), ano: wt('c5', 'ano'), qua: wt('c5', 'quatro') };
    const s6 = { det: wt('c6', 'detalhe'), lei: wt('c6', 'lei'), pro: wt('c6', 'proibe'), lev: wt('c6', 'levitico'), nun: wt('c6', 'nunca'), inv: wt('c6', 'inventou') };
    const s7 = { jei: wt('c7', 'jeitos'), uns: wt('c7', 'uns'), sac: wt('c7', 'sacrificou'), apr: wt('c7', 'aprovar'), out: wt('c7', 'outros'), con: wt('c7', 'consagrada'), cas: wt('c7', 'casar'), cho: wt('c7', 'chorou') };
    const s8 = { sac: wt('c8', 'sacrificio'), con: wt('c8', 'consagracao'), cmt: wt('c8', 'comenta'), ver: wt('c8', 'versiculo'), mar: wt('c8', 'marca'), seg: wt('c8', 'segue'), deb: wt('c8', 'dia'), am: wt('c8', 'amanha') };
    const shake = t => { const d = t - s4.ras; return d > 0 && d < 0.5 ? 10 * (1 - d / 0.5) : 0; };
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
      txt(L1, 250, 520, 58, { color: c1, scale: outBack(jk) * (1 + 0.02 * Math.sin(t * 6)), stroke: 12 }); txt('ou', 540, 520, 50, { color: CHALK, w: 700, a: jk }); txt(L2, 815, 520, 56, { color: c2, scale: outBack(dk) * (1 + 0.02 * Math.sin(t * 6 + 1)), stroke: 12 });
      const ck = sm(t, A.cmt - 0.1, A.cmt + 0.4, outBack); if (ck > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(ck, ck); ctx.fillStyle = 'rgba(14,30,22,0.9)'; ctx.strokeStyle = CHALK; ctx.lineWidth = 7; rr(-300, -90, 600, 180, 50); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-60, 90); ctx.lineTo(-100, 150); ctx.lineTo(0, 90); ctx.fill(); ctx.stroke(); ctx.restore(); txt('COMENTA', 540, 870, 70, { color: CHALK, a: ck }); txt('+ O VERSÍCULO', 540, 945, 46, { color: GOLD, a: sm(t, A.ver - 0.1, A.ver + 0.3) }); }
      if (t > A.mar - 0.1) { const m3 = sm(t, A.mar - 0.1, A.mar + 0.4, outBack); txt('MARCA QUEM', 540, 1130, 78, { color: CHALK, scale: m3, stroke: 12 }); txt('VAI DISCORDAR', 540, 1225, 78, { color: RED, scale: m3, stroke: 12 }); }
      figure({ x: 130, y: GROUND + 60, s: 1.45, c: PINK, skirt: true, bun: true, a: 0.9, pose: { legs: IDLE.legs, arms: [[2.2 + 0.4 * Math.sin(t * 7), 2.6], [-0.1, -0.1]] } }); figure({ x: 950, y: GROUND + 60, s: 1.45, dir: -1, c: BLUE, a: 0.9, pose: { legs: IDLE.legs, arms: [[2.2 + 0.4 * Math.sin(t * 7 + 1), 2.6], [-0.1, -0.1]] } });
      const bk = sm(t, A.seg - 0.3, A.seg + 0.1, outBack), press = t > A.seg + 0.3;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1390); ctx.scale(bk, bk); ctx.fillStyle = press ? 'rgba(14,30,22,0.9)' : GOLD; rr(-290, -52, 580, 104, 52); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = GOLD; ctx.stroke(); ctx.restore(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR @e_cosdafe', 540, 1393, 46 * bk, { color: press ? GOLD : '#14291f' }); }
      txt(extra[0], 540, 1490, 42, { color: CHALK, a: sm(t, A.deb - 0.1, A.deb + 0.4) });
      if (extra[1]) txt(extra[1], 540, 1560, 36, { color: GOLD, a: sm(t, A.am - 0.1, A.am + 0.4) });
    }
    // ---------------- cenas ----------------
    function scene1(t) {
      write('JUÍZES 11:30-40', 540, 170, 60, sm(t, 0.2, 1.0, x => x), { color: GOLD });
      houseP(640, GROUND, prog(t, s1.por - 1.2, s1.por + 0.2)); doorP(640, GROUND, prog(t, s1.por - 0.3, s1.por + 0.3));
      const k = sm(t, 0.3, s1.pro - 0.3, x => x), px = lerp(-100, 330, k), pw = k < 1 ? walkP(t) : IDLE;
      figure({ x: px, y: GROUND, c: BLUE, beard: true, pose: Object.assign({}, pw, { arms: k < 1 ? pw.arms : armsUp(t) }), mood: 'smile' });
      if (t > s1.pro - 0.1) txt('PROMESSA', 540, 390, 112, { color: GOLD, scale: outBack(prog(t, s1.pro - 0.1, s1.pro + 0.3)), rot: -0.04, stroke: 12 });
      if (t > s1.por) txt('A 1ª COISA QUE SAIR DA PORTA', 540, 540, 50, { color: CHALK, a: sm(t, s1.por, s1.por + 0.5) });
      const fk = sm(t, s1.fil - 0.1, s1.fil + 1.4, x => x), fx = lerp(760, 540, fk);
      if (t > s1.fil - 0.1) { figure({ x: fx, y: GROUND, c: PINK, skirt: true, bun: true, s: 2.2, pose: fk < 1 ? walkP(t, 7) : IDLE, mood: 'smile' }); }
      if (t > s1.aco - 0.1) txt('E AGORA?', 540, 720, 130, { color: RED, scale: outBack(prog(t, s1.aco - 0.1, s1.aco + 0.3)), rot: 0.03, stroke: 12 });
    }
    function scene2(t) {
      HDR(t, 'ANTES DA BATALHA', B[1]);
      const jk = sm(t, s2.jef - 0.3, s2.jef + 0.8), jx = lerp(-100, 300, jk);
      figure({ x: jx, y: GROUND, c: BLUE, beard: true, pose: jk < 1 ? walkP(t) : { legs: IDLE.legs, arms: t > s2.vot ? armsUp(t) : [[0.5, 1.3], [-0.12, -0.1]] }, mood: t > s2.vot ? 'sad' : 'smile' });
      if (t > s2.jef + 0.5) poly([[jx + 90, GROUND - 120], [jx + 90, GROUND - 520]], sm(t, s2.jef + 0.5, s2.jef + 1), BLUE, 7, 101);
      const ak = sm(t, s2.amo - 0.3, s2.amo + 0.6);
      for (let i = 0; i < 3; i++) figure({ x: lerp(1200, 820 + i * 100, ak), y: GROUND - i * 14, dir: -1, s: 1.9, c: RED, pose: ak < 1 ? walkP(t + i, 8) : IDLE, a: 0.5 + 0.5 * ak });
      if (t > s2.amo) txt('AMONITAS', 830, 640, 60, { color: RED, a: sm(t, s2.amo, s2.amo + 0.4), stroke: 10 });
      if (t > s2.vot) txt('O VOTO', 540, 330, 120, { color: GOLD, scale: outBack(prog(t, s2.vot - 0.1, s2.vot + 0.3)), stroke: 12 });
      if (t > s2.cas - 0.3) say(430, 960, 740, 230, 'QUEM SAIR DA MINHA CASA\nAO MEU ENCONTRO\nSERÁ DO SENHOR', 46, prog(t, s2.cas - 0.3, s2.cas + 0.1), 330, 1090, GOLD);
      if (t > s2.ven) txt('SE EU VENCER', 760, 1300 - 120, 54, { color: CHALK, a: sm(t, s2.ven, s2.ven + 0.4) });
    }
    function scene3(t) {
      HDR(t, 'VOLTANDO PARA MISPÁ', B[2]);
      houseP(620, GROUND, prog(t, B[2] + 0.1, B[2] + 1)); doorP(620, GROUND, prog(t, B[2] + 0.6, B[2] + 1.1));
      txt('VITÓRIA!', 400, 480, 120, { color: GOLD, scale: outBack(prog(t, s3.vit - 0.1, s3.vit + 0.3)), rot: -0.05, stroke: 12 });
      const k = sm(t, B[2] + 0.2, s3.cor + 0.2, x => x), jx = lerp(-100, 330, k), walking = k < 1;
      figure({ x: jx, y: GROUND, c: BLUE, beard: true, pose: walking ? walkP(t) : IDLE, mood: t > s3.cor + 0.4 ? 'shock' : 'smile' });
      if (t > s3.cor - 0.3) { const fk = sm(t, s3.cor - 0.3, s3.cor + 1.0, x => x), fx = lerp(780, 470, fk), dance = t > s3.dan - 0.3; figure({ x: fx, y: GROUND, c: PINK, skirt: true, bun: true, s: 2.3, pose: fk < 1 ? walkP(t, 10) : { legs: IDLE.legs, arms: [[2.3 + 0.5 * Math.sin(t * 9), 2.6], [2.0 - 0.5 * Math.sin(t * 9), 2.4]] }, mood: 'smile', bob: dance ? -Math.abs(Math.sin(t * 8)) * 12 : 0 }); }
      if (t > s3.tam) { const x = 470 + 30, y = GROUND - 520 + 12 * Math.sin(t * 9); poly(circ(x, y, 34, 20), sm(t, s3.tam, s3.tam + 0.3), GOLD, 6, 111); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + t * 3; coin(x + Math.cos(a) * 34, y + Math.sin(a) * 34, 6, sm(t, s3.tam + 0.2, s3.tam + 0.4), GOLD); } txt('TAMBORIM E DANÇA', 540, 700, 54, { color: CHALK, a: sm(t, s3.tam, s3.tam + 0.4) }); }
      if (t > s3.uni) txt('A ÚNICA FILHA', 540, 900, 110, { color: PINK, scale: outBack(prog(t, s3.uni - 0.1, s3.uni + 0.3)), rot: -0.03, stroke: 12 });
    }
    function scene4(t) {
      const sad = t > s4.ras;
      figure({ x: 300, y: GROUND, c: BLUE, beard: true, s: 2.6, lean: sad ? 0.25 : 0, pose: { legs: IDLE.legs, arms: sad ? [[2.5, 2.9], [2.3, 2.8]] : IDLE.arms }, mood: sad ? 'sad' : 'smile' });
      if (t > s4.ras) for (let i = 0; i < 3; i++) poly([[260 + i * 28, GROUND - 330 + i * 30], [300 + i * 28, GROUND - 270 + i * 30]], sm(t, s4.ras, s4.ras + 0.3), RED, 7, 121 + i);
      if (t > s4.ras - 0.1) txt('RASGOU AS ROUPAS', 540, 300, 80, { color: RED, scale: outBack(prog(t, s4.ras - 0.1, s4.ras + 0.3)), rot: -0.03, stroke: 12 });
      if (t > s4.ai - 0.2) say(270, 700, 440, 190, 'AI, MINHA FILHA!\nNÃO POSSO\nVOLTAR ATRÁS', 44, prog(t, s4.ai - 0.2, s4.ai + 0.1), 300, 800, BLUE);
      figure({ x: 800, y: GROUND, dir: -1, c: PINK, skirt: true, bun: true, s: 2.3, pose: { legs: IDLE.legs, arms: t > s4.res ? [[0.6, 1.3], [-0.12, -0.1]] : IDLE.arms }, mood: 'sad' });
      if (t > s4.fac - 0.3) say(800, 720, 440, 190, 'FAÇA COMIGO\nO QUE VOCÊ\nPROMETEU', 44, prog(t, s4.fac - 0.3, s4.fac + 0.1), 800, 880, PINK);
    }
    function scene5(t) {
      HDR(t, 'DOIS MESES', B[4]);
      poly([[34, GROUND], [260, 1040], [440, 1260], [640, 960], [900, 1300], [1046, 1180]], prog(t - B[4], 0.1, 1.2), CHALK, 7, 141);
      const k = sm(t, s5.ped, s5.pas - 0.3, x => x), fx = lerp(120, 900, k);
      figure({ x: fx, y: GROUND - 25, c: PINK, skirt: true, bun: true, s: 2.0, pose: k > 0 && k < 1 ? walkP(t, 6) : IDLE, mood: 'sad' });
      if (t > s5.cho) { for (let i = 0; i < 3; i++) { const u = (t - s5.cho - i * 0.4) % 1.2; if (u > 0) coin(fx + 28, GROUND - 330 + u * 90, 8, 1 - u / 1.2, BLUE); } txt('CHORAR', 540, 420, 90, { color: BLUE, a: sm(t, s5.cho, s5.cho + 0.4), stroke: 10 }); }
      // calendário de 2 meses
      const ck = sm(t, s5.dois - 0.1, s5.dois + 0.5); if (ck > 0) { for (let m = 0; m < 2; m++) { const x = 360 + m * 260, y = 560; poly(box(x - 100, y - 60, 200, 120), ck, CHALK, 6, 150 + m); txt('MÊS ' + (m + 1), x, y, 46, { color: GOLD, a: ck }); if (t > s5.pas + m * 0.5) poly([[x - 90, y - 50], [x + 90, y + 50]], sm(t, s5.pas + m * 0.5, s5.pas + m * 0.5 + 0.3), RED, 7, 160 + m); } }
      if (t > s5.cum - 0.1) txt('CUMPRIU O VOTO', 540, 760, 92, { color: RED, scale: outBack(prog(t, s5.cum - 0.1, s5.cum + 0.3)), rot: -0.03, stroke: 12 });
      if (t > s5.qua - 0.4) { const qk = sm(t, s5.qua - 0.4, s5.qua + 0.4); for (let i = 0; i < 4; i++) { const x = 330 + i * 140; poly([[x, 1080], [x, 1010]], qk * (i < 4 ? 1 : 0), CHALK, 8, 170 + i); coin(x, 990 - 6 * Math.sin(t * 8 + i), 12, sm(t, s5.qua + 0.1 * i, s5.qua + 0.3 + 0.1 * i), GOLD); } txt('4 DIAS POR ANO', 540, 1160, 64, { color: GOLD, a: qk, stroke: 10 }); }
    }
    function scene6(t) {
      HDR(t, 'O DETALHE', B[5]);
      const tk = sm(t, s6.lei - 0.2, s6.lei + 0.7); tablet(540, 560, 640, 440, tk, CHALK); txt('LEVÍTICO 18:21', 540, 440, 60, { color: GOLD, a: tk }); txt('SACRIFÍCIO', 540, 560, 84, { color: CHALK, a: sm(t, s6.pro - 0.4, s6.pro, x => x), stroke: 8 }); txt('HUMANO', 540, 660, 84, { color: CHALK, a: sm(t, s6.pro - 0.4, s6.pro, x => x), stroke: 8 });
      if (t > s6.pro) { poly([[260, 380], [820, 760]], sm(t, s6.pro, s6.pro + 0.3), RED, 14, 181); poly([[820, 380], [260, 760]], sm(t, s6.pro + 0.2, s6.pro + 0.5), RED, 14, 182); txt('PROIBIDO', 540, 930, 100, { color: RED, scale: outBack(prog(t, s6.pro + 0.2, s6.pro + 0.5)), rot: -0.04, stroke: 12 }); }
      if (t > s6.nun - 0.1) txt('DEUS NÃO PEDIU', 540, 1090, 88, { color: GOLD, scale: outBack(prog(t, s6.nun - 0.1, s6.nun + 0.3)), stroke: 12 });
      figure({ x: 930, y: GROUND, dir: -1, c: BLUE, beard: true, s: 1.9, pose: { legs: IDLE.legs, arms: t > s6.inv ? [[0.6, 1.3], [-0.12, -0.1]] : IDLE.arms }, mood: t > s6.inv ? 'smile' : 'sad' });
      if (t > s6.inv - 0.1) { txt('A IDEIA FOI DELE', 330, 1250, 64, { color: RED, scale: outBack(prog(t, s6.inv - 0.1, s6.inv + 0.3)), rot: -0.04, stroke: 10 }); poly([[560, 1230], [660, 1170]], sm(t, s6.inv + 0.2, s6.inv + 0.5), RED, 8, 183); }
    }
    function scene7(t) {
      splitBoard(t, B[6]); txt('x', 540, 860, 80, { color: CHALK, a: prog(t - B[6], 0.4, 0.8), w: 700 });
      write('SACRIFÍCIO', 290, 250, 76, sm(t, s7.uns - 0.2, s7.uns + 0.6, x => x), { color: GOLD, stroke: 12 });
      const ak = sm(t, s7.sac - 0.2, s7.sac + 0.6); poly(box(150, 780, 280, 160), ak, GOLD, 8, 191); if (t > s7.sac) { for (let i = 0; i < 3; i++) poly([[230 + i * 60, 760], [215 + i * 60 + 20 * Math.sin(t * 8 + i), 690], [250 + i * 60, 620]], sm(t, s7.sac + 0.2, s7.sac + 0.6), RED, 7, 192 + i); }
      figure({ x: 200, y: GROUND, s: 2.2, c: GOLD, pose: { legs: IDLE.legs, arms: [[1.0, 1.5], [-0.1, -0.1]] }, mood: 'sad' });
      if (t > s7.apr - 0.3) say(300, 1030, 460, 120, 'SÓ CONTA O\nQUE ACONTECEU', 40, prog(t, s7.apr - 0.3, s7.apr), 250, 1100, GOLD);
      write('CONSAGRAÇÃO', 810, 250, 62, sm(t, s7.out - 0.2, s7.out + 0.6, x => x), { color: BLUE, stroke: 12 });
      const dk = sm(t, s7.con - 0.2, s7.con + 0.6); poly(box(700, 700, 220, 280), dk, BLUE, 8, 198); poly([[700, 700], [810, 600], [920, 700]], dk, BLUE, 8, 199); poly([[780, 980], [780, 860], [840, 860], [840, 980]], dk, BLUE, 7, 200);
      figure({ x: 850, y: GROUND, s: 2.2, dir: -1, c: PINK, skirt: true, bun: true, pose: { legs: IDLE.legs, arms: [[0.4, 1.3], [-0.2 + 0.2 * Math.sin(t * 4), -0.3]] }, mood: t > s7.cho ? 'sad' : 'smile' });
      if (t > s7.cas - 0.3) say(790, 1030, 480, 120, t > s7.cho ? 'SEM FILHOS' : 'PARA SEMPRE\nDE DEUS', 40, prog(t, s7.cas - 0.3, s7.cas), 840, 1100, BLUE);
    }
    function scene8(t) { ctaScene(t, B[7], { a: s8.sac, b: s8.con, cmt: s8.cmt, ver: s8.ver, mar: s8.mar, seg: s8.seg, deb: s8.deb, am: s8.am }, 'SACRIFÍCIO', 'CONSAGRAÇÃO', GOLD, BLUE, ['TODO DIA UMA BÍBLIA QUE NINGUÉM PREGA', 'AMANHÃ: JESUS CHAMOU UMA MULHER DE CACHORRINHO?']); }
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8];
    // ---------------- cues ----------------
    cue(0.2, 'wind', { dur: 5 }); cue(s1.pro, 'pop'); cue(s1.por, 'tap'); cue(s1.fil, 'swoosh'); cue(s1.aco, 'reveal');
    cue(B[1], 'swoosh'); cue(s2.amo, 'whoosh'); cue(s2.vot, 'reveal'); cue(s2.cas, 'pop');
    cue(B[2], 'swoosh'); cue(s3.vit, 'tada', { gain: 0.5 }); cue(s3.cor, 'swoosh'); cue(s3.tam, 'ding', { gain: 0.5 }); cue(s3.uni, 'impact', { gain: 0.6 });
    cue(B[3], 'swoosh'); cue(s4.ras, 'impact', { gain: 0.8 }); cue(s4.ras + 0.05, 'crack'); cue(s4.ai, 'pop'); cue(s4.fac, 'pop');
    cue(B[4], 'swoosh'); cue(s5.dois, 'pop'); cue(s5.pas, 'minus'); cue(s5.cum, 'impact', { gain: 0.8 }); cue(s5.qua, 'riser', { dur: 1 });
    cue(B[5], 'swoosh'); cue(s6.lei, 'reveal'); cue(s6.pro, 'error', { gain: 0.6 }); cue(s6.nun, 'ding', { gain: 0.5 }); cue(s6.inv, 'impact', { gain: 0.5 });
    cue(B[6], 'swoosh'); cue(s7.uns, 'pop'); cue(s7.out, 'pop'); cue(s7.cho, 'minus');
    cue(B[7], 'swoosh'); cue(s8.sac, 'pop'); cue(s8.con, 'pop'); cue(s8.cmt, 'sms'); cue(s8.mar, 'pop'); cue(s8.seg + 0.3, 'success');
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
