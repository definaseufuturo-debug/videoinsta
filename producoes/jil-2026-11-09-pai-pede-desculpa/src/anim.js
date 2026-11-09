/*
 * "O PAI QUE PEDE DESCULPA": o pai derruba o COPO VERMELHO e culpa o filho ("OLHA O QUE VOCÊ FEZ!"); aos 10 o filho quebra
 * e esconde, aos 16 nega ("NÃO FUI EU"), 30 anos depois ele vira pai e culpa o próprio filho. Virada: o outro pai quebra o
 * copo, ajoelha e diz "O PAPAI ERROU. ME DESCULPA." Final: "QUEM PEDE PERDÃO ENSINA A PERDOAR." (Cl 3:13)
 * Bonequinhos de palito, 30 s, 9:16, sem narração.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, END = 30;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const lin = x => x;

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c';
  const FLOOR = 1390, FS = 1.32;
  const S1 = { a: 0.0, b: 4.35 }, S2 = { a: 4.55, b: 7.75 }, S3 = { a: 7.95, b: 10.95 }, S4 = { a: 11.15, b: 13.75 };
  const T = { hl: [14.05, 14.6, 15.15, 15.8], dimA: 13.7, dimB: 16.9, v: 17.0, bump: 17.45, look: 18.0, kneel: 18.9, errou: 19.2, desc: 20.5, grow: 20.7, hug: 22.2, tudo: 22.7, fin: 24.6 };
  const KIDX = 320, TABX = 590, TOP = FLOOR - 125, DADX = 770;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    const fit = (s, size, max = 960) => Math.min(size, size * max / tw(s, size));
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: cozinha/sala à noite (janela, mesa, luz pendente) ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const wg = g.createLinearGradient(0, 700, 0, FLOOR); wg.addColorStop(0, '#0d0d10'); wg.addColorStop(1, '#16161b'); g.fillStyle = wg; g.fillRect(0, 700, W, FLOOR - 700);
      // janela
      g.strokeStyle = '#2e2e36'; g.lineWidth = 8; g.strokeRect(150, 880, 170, 210); g.beginPath(); g.moveTo(235, 880); g.lineTo(235, 1090); g.moveTo(150, 985); g.lineTo(320, 985); g.stroke();
      let sd = 9; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let i = 0; i < 12; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.4})`; g.beginPath(); g.arc(158 + rnd() * 155, 888 + rnd() * 195, 1 + rnd(), 0, TAU); g.fill(); }
      // luz pendente
      g.strokeStyle = '#2c2c33'; g.lineWidth = 4; g.beginPath(); g.moveTo(820, 700); g.lineTo(820, 960); g.stroke();
      g.fillStyle = '#ffe2a8'; g.beginPath(); g.moveTo(780, 1000); g.lineTo(860, 1000); g.lineTo(840, 960); g.lineTo(800, 960); g.closePath(); g.fill();
      const sp = g.createRadialGradient(820, 1010, 20, 820, 1100, 640); sp.addColorStop(0, 'rgba(255,214,150,0.15)'); sp.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      // mesa ao fundo
      g.fillStyle = '#1d1d23'; g.fillRect(860, 1235, 220, 16); g.fillRect(880, 1251, 12, FLOOR - 1251); g.fillRect(1050, 1251, 12, FLOOR - 1251);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,255,255,0.03)'; g.fillRect(i * 130, FLOOR + 3, 2, 300); }
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function ik(sx, sy, tx, ty, l1, l2, bend) {
      const dx = tx - sx, dy = ty - sy, d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.5), base = Math.atan2(dx, dy);
      const al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), a1 = base + bend * al;
      const ex = sx + Math.sin(a1) * l1, ey = sy + Math.cos(a1) * l1; return [a1, Math.atan2(tx - ex, ty - ey)];
    }
    const shoulder = (o) => { const s = o.s, dir = o.dir || 1, bob = o.bob || 0, lean = o.lean || 0; return [o.x + dir * Math.sin(lean) * 66 * s, o.y + (-158 + bob + 4) * s]; };
    function figure(o) {
      const s = o.s, dir = o.dir || 1, hr = o.hr || 23; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = WHITE; ctx.fillStyle = WHITE; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = 'rgba(255,255,255,0.25)'; ctx.shadowBlur = 10;
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      for (const [a, b] of o.legs) limb(0, hipY, a, b, 48, 46);
      const arms = o.arms.map(a => a.slice());
      if (o.reach) for (const [i, wx, wy, bend] of o.reach) { const lx = (wx - o.x) / (dir * s), ly = (wy - o.y) / s; arms[i] = ik(shX, shY + 4, lx, ly, 40, 38, bend ?? -1); }
      const hands = arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      if (o.cane !== undefined && o.cane !== null) { const [hx0, hy0] = hands[o.cane]; ctx.lineWidth = 10; ctx.strokeStyle = '#d8d8d8'; ctx.shadowBlur = 0; ctx.beginPath(); ctx.moveTo(hx0, hy0 - 6); ctx.lineTo(hx0 + 10, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(hx0 - 9, hy0 - 6, 9, Math.PI, TAU); ctx.stroke(); ctx.strokeStyle = WHITE; ctx.lineWidth = 13; }
      const tilt = o.headTilt || 0, hx = shX + Math.sin(lean + tilt) * (hr + 11), hy = shY - Math.cos(lean + tilt) * (hr + 11);
      ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (o.eyes !== false) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill(); }
      ctx.restore(); ga(1);
      const W2 = ([x, y]) => [o.x + dir * x * s, o.y + y * s];
      return { head: W2([hx, hy]), sh: W2([shX, shY + 4]), hands: hands.map(W2) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const STANDL = [[0.1, 0.06], [-0.1, -0.06]];
    const A_DOWN = [[0.15, 0.2], [-0.1, 0.1]];
    const lerpA = (A, B, k) => A.map((p, i) => p.map((v, j) => lerp(v, B[i][j], k)));

    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 50, w = tw(s, size) + 64, h = size * 1.75; ctx.save(); ctx.translate(x, y); const e = (1 + (1 - k) * 0.3) * (o.scale ?? 1); ctx.scale(e, e); ga(clamp(k * 3) * (o.a ?? 1));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill();
      if (o.think) { const tx = (o.tail || 0) * w * 0.3; for (const [dx, dy, rr] of [[0, h / 2 + 18, 12], [o.tailDir * 18, h / 2 + 46, 8]]) { ctx.beginPath(); ctx.arc(tx + dx, dy, rr, 0, TAU); ctx.fill(); } }
      else { const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill(); }
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 640, 50, { w: 900, sp: 12 }); const w = Math.min(260, tw(s, 50) * 0.4); ctx.fillStyle = RED; ctx.fillRect(540 - w / 2, 686, w, 5); ctx.restore(); ga(1); }
    const kneelLegs = [[1.45, 0.05], [0.05, -1.5]];
    const sway = (t, f = 1.3) => Math.sin(t * f) * 0.04;

    // ---------- mesa e copo vermelho (o erro) ----------
    function table(X = TABX) { const TABX = X; ctx.save(); ctx.strokeStyle = '#cfcfcf'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255,255,255,0.2)'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(TABX - 85, TOP); ctx.lineTo(TABX + 85, TOP); ctx.moveTo(TABX - 66, TOP); ctx.lineTo(TABX - 66, FLOOR); ctx.moveTo(TABX + 66, TOP); ctx.lineTo(TABX + 66, FLOOR); ctx.stroke(); ctx.restore(); }
    function cupShape(x, y, rot, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 70); g.addColorStop(0, 'rgba(224,38,43,0.28)'); g.addColorStop(1, 'rgba(224,38,43,0)'); ctx.fillStyle = g; ctx.fillRect(-70, -70, 140, 140);
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.8)'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(-19, -24); ctx.lineTo(19, -24); ctx.lineTo(14, 24); ctx.lineTo(-14, 24); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(-12, -18, 5, 30); ctx.restore(); }
    const SH = [[-58, 0.4, 13], [-34, 1.9, 10], [-12, 0.9, 15], [8, 2.6, 9], [27, 1.2, 14], [46, 2.2, 10], [66, 0.6, 12], [-80, 2.9, 8]];
    function shards(cx, k, o = {}) { const e = outC(k); ctx.save(); ga(o.a ?? 1); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.8)'; ctx.shadowBlur = 12;
      SH.forEach(([dx, r, s], i) => { const x = cx + dx * e * (o.spread ?? 1), y = FLOOR - 7 - Math.sin(Math.PI * clamp(k * 1.4 - i * 0.02)) * 40 * (1 - e); ctx.save(); ctx.translate(x, y); ctx.rotate(r + e * (i % 2 ? 2 : -2)); ctx.beginPath(); ctx.moveTo(-s, s * 0.5); ctx.lineTo(s * 0.2, -s * 0.7); ctx.lineTo(s, s * 0.6); ctx.closePath(); ctx.fill(); ctx.restore(); });
      ctx.restore(); ga(1); }
    // copo: em cima da mesa até tk, cai (0,4 s) e quebra
    const FALL = 0.4;
    function cup(t, tk, x0, dx, sp = 1) { const u = t - tk; if (u < 0) { cupShape(x0, TOP - 29, 0); return; }
      if (u < FALL) { const p = u / FALL; cupShape(x0 + dx * 70 * p, lerp(TOP - 29, FLOOR - 24, p * p), dx * p * 2.6); return; }
      shards(x0 + dx * 70, prog(u, FALL, FALL + 0.35), { spread: sp }); }
    const PROTECT = [[2.7, 3.1], [2.3, 2.9]], BEHIND = [[-0.35, -0.9], [-0.25, -0.8]], POINT = [[1.65, 1.6], [-0.1, 0.1]];
    const swing = (t, tk) => { const k = sm(t, tk - 0.2, tk) * (1 - sm(t, tk + 0.15, tk + 0.45)); return [[lerp(0.15, 1.15, k), lerp(0.2, 0.9, k)], [-0.1, 0.1]]; };

    // ---------- 6 anos: o pai quebra e culpa ----------
    function blameScene(t, a, kidS, ages) { // usado nos 6 anos e nos 30 anos depois
      const tk = a + 1.0, br = tk + FALL, pt = a + 1.85;
      const walking = t < a + 0.8, dx = lerp(980, DADX, sm(t, a, a + 0.8, outC)), wp = walkPose(t * 8, 0.9);
      const look = sm(t, br, br + 0.25) * (1 - sm(t, pt - 0.1, pt + 0.1));
      const pk = sm(t, pt - 0.15, pt + 0.05);
      const darms = walking ? walkArms(t * 8) : t < pt - 0.15 ? swing(t, tk) : lerpA([[0.15, 0.2], [-0.1, 0.1]], POINT, pk);
      table(); cup(t, tk, TABX + 45, -1);
      figure({ x: dx, y: FLOOR, s: FS, hr: 23, dir: -1, lean: walking ? 0.06 : 0.02 + 0.1 * pk + 0.15 * look, headTilt: lerp(0.1, 0.5, look) - 0.05 * pk, legs: walking ? wp.legs : STANDL, bob: walking ? wp.bob : 0, arms: darms });
      const flinch = sm(t, br, br + 0.15) * (1 - sm(t, br + 0.5, br + 0.8)), sad = sm(t, pt + 0.5, pt + 1.0);
      figure({ x: KIDX, y: FLOOR, s: lerp(kidS, kidS * 0.9, sad), hr: 31, dir: 1, lean: 0.03 + sad * 0.2, headTilt: lerp(-0.15, 0.6, sad), legs: STANDL, bob: 0, arms: flinch > 0.01 ? lerpA(A_DOWN, PROTECT, flinch) : A_DOWN });
      bubble('OLHA O QUE', 600, FLOOR - 520, prog(t, pt, pt + 0.12) * (1 - prog(t, a + 3.55, a + 3.7)), { size: 50, tail: 0.6, tailDir: 1 });
      bubble('VOCÊ FEZ!', 600, FLOOR - 420, prog(t, pt + 0.1, pt + 0.22) * (1 - prog(t, a + 3.55, a + 3.7)), { size: 60, tail: 0.6, tailDir: 1 });
      if (ages === 6) bubble('MAS NÃO FUI EU...', 440, FLOOR - 270, prog(t, a + 2.95, a + 3.1) * (1 - prog(t, S1.b - 0.2, S1.b)), { size: 36, color: RED, think: true, tail: -0.3, tailDir: -1 });
    }
    // ---------- 10 anos: ele quebra e esconde ----------
    function scene2(t) {
      const tk = 5.35, br = tk + FALL;
      const walking = t < 5.05, kx = lerp(110, 420, sm(t, S2.a, 5.05, outC)), wp = walkPose(t * 8, 0.9);
      const reach = sm(t, 5.05, 5.3) * (1 - sm(t, tk + 0.1, tk + 0.35));
      const scared = sm(t, br, br + 0.15);
      const hide = sm(t, 6.3, 6.7), hx = lerp(420, 475, hide);
      table(); cup(t, tk, TABX - 50, -1, lerp(1, 0.35, hide));
      const look = t > br + 0.15 && t < 6.3 ? (Math.sin((t - br) * 9) > 0 ? 1 : -1) : 1;
      let arms = walking ? walkArms(t * 8) : lerpA(A_DOWN, [[2.2, 2.0], [0.2, 0.1]], reach);
      if (scared > 0 && hide < 0.01) arms = lerpA(arms, PROTECT, scared * (1 - sm(t, br + 0.4, br + 0.6)));
      if (hide > 0) arms = lerpA(A_DOWN, BEHIND, hide);
      figure({ x: hx, y: FLOOR, s: 0.86, hr: 30, dir: look, lean: 0.04, headTilt: hide > 0 ? -0.15 : 0.0, legs: walking ? wp.legs : STANDL, bob: walking ? wp.bob : 0, arms });
      bubble('NINGUÉM PODE SABER.', 520, FLOOR - 330, prog(t, 6.75, 6.9) * (1 - prog(t, 7.55, 7.7)), { size: 38, color: RED, think: true, tail: 0.3, tailDir: 1 });
    }
    // ---------- 16 anos: ele nega ----------
    function scene3(t) {
      table(); shards(TABX + 20, 1);
      figure({ x: 440, y: FLOOR, s: 1.08, hr: 26, dir: 1, lean: 0.0, headTilt: t > 9.85 && t < 10.5 ? Math.sin((t - 9.85) * 22) * 0.25 : -0.1, legs: STANDL, bob: 0, arms: BEHIND });
      const walking = t < 8.55, dx = lerp(1000, 830, sm(t, S3.a, 8.55, outC)), wp = walkPose(t * 8, 0.9);
      const look = sm(t, 8.55, 8.75) * (1 - sm(t, 8.95, 9.1)), pk = sm(t, 8.95, 9.1);
      figure({ x: dx, y: FLOOR, s: FS, hr: 23, dir: -1, lean: walking ? 0.06 : 0.04 + 0.15 * look, headTilt: lerp(0.05, 0.5, look), legs: walking ? wp.legs : STANDL, bob: walking ? wp.bob : 0, arms: walking ? walkArms(t * 8) : lerpA([[0.15, 0.2], [-0.1, 0.1]], POINT, pk) });
      bubble('FOI VOCÊ?', 680, FLOOR - 470, prog(t, 9.0, 9.12) * (1 - prog(t, 9.75, 9.9)), { size: 60, tail: 0.5, tailDir: 1 });
      bubble('NÃO FUI EU.', 400, FLOOR - 430, prog(t, 9.95, 10.08) * (1 - prog(t, 10.75, 10.9)), { size: 56, color: RED, tail: -0.1, tailDir: -1 });
    }
    // ---------- virada: o outro pai ----------
    function scene5(t) {
      const br = T.bump + FALL;
      const walking = t < T.v + 0.75, kneel = sm(t, T.kneel - 0.25, T.kneel + 0.15);
      const dx = walking ? lerp(950, 600, prog(t, T.v, T.v + 0.75)) : lerp(600, 470, sm(t, T.look + 0.35, T.kneel)), wp = walkPose(t * 8, 0.9);
      const moving = !walking && t > T.look + 0.35 && t < T.kneel - 0.1, mp = walkPose(t * 7, 0.8);
      const dy = FLOOR + 38 * FS * kneel, dlean = lerp(0.02, 0.32, kneel);
      const dlegs = kneel > 0.02 ? lerpA(STANDL, kneelLegs, kneel) : (walking ? wp.legs : moving ? mp.legs : STANDL);
      const hugK = sm(t, T.hug - 0.4, T.hug), grow = sm(t, T.grow, T.grow + 1.0);
      const flinch = sm(t, br, br + 0.15) * (1 - sm(t, T.desc, T.desc + 0.4));
      const ks = lerp(lerp(0.72, 0.62, sm(t, br, br + 0.3)), 0.8, grow);
      const kx = lerp(KIDX, 360, hugK);
      const dsh = shoulder({ x: dx, y: dy, s: FS, dir: -1, lean: dlean });
      const ksh = shoulder({ x: kx, y: FLOOR, s: ks, dir: 1, lean: 0.05 });
      table(700); cup(t, T.bump, 745, 1);
      if (grow > 0) { const g = ctx.createRadialGradient(kx, FLOOR - 120, 10, kx, FLOOR - 120, 340); g.addColorStop(0, `rgba(255,236,200,${0.25 * grow})`); g.addColorStop(1, 'rgba(255,236,200,0)'); ctx.fillStyle = g; ctx.fillRect(kx - 360, FLOOR - 480, 720, 640); }
      const kreach = hugK > 0 ? [[0, dsh[0] - 6, dsh[1] + 30, -1], [1, dsh[0] + 4, dsh[1] + 55, -1]] : null;
      figure({ x: kx, y: FLOOR, s: ks, hr: 31, dir: 1, lean: 0.03 + 0.15 * flinch, headTilt: lerp(-0.1, 0.45, flinch), legs: STANDL, bob: 0, arms: flinch > 0.01 ? lerpA(A_DOWN, PROTECT, flinch) : A_DOWN, reach: kreach });
      const look = sm(t, br, br + 0.3);
      let darms = t < br && t > T.bump - 0.25 ? lerpA(walkArms(t * 8), [[-0.9, -0.6], [-0.1, 0.1]], sm(t, T.bump - 0.25, T.bump) * (1 - sm(t, T.bump + 0.15, T.bump + 0.45))) : walking ? walkArms(t * 8) : lerpA([[0.15, 0.2], [-0.1, 0.1]], [[0.6, 0.5], [0.3, 0.3]], kneel);
      let dreach = null;
      if (t > T.desc - 0.2) { const k = sm(t, T.desc - 0.2, T.desc + 0.2); dreach = [[1, lerp(dsh[0] - 40, ksh[0] + 16, k), lerp(dsh[1] + 70, ksh[1] + 6, k), 1]]; }
      if (hugK > 0) dreach = [[1, ksh[0] + 10, ksh[1] + 4, 1], [0, ksh[0] - 12, ksh[1] + 30, 1]];
      figure({ x: dx, y: dy, s: FS, hr: 23, dir: -1, lean: dlean + 0.12 * look * (1 - kneel), headTilt: kneel > 0.1 ? lerp(0.3, -0.05, kneel) : lerp(0.1, 0.5, look), legs: dlegs, bob: walking ? wp.bob : 0, arms: darms, reach: dreach });
      bubble('O PAPAI ERROU.', 560, FLOOR - 470, prog(t, T.errou, T.errou + 0.15) * (1 - prog(t, T.desc - 0.2, T.desc - 0.05)), { size: 54, tail: 0.3, tailDir: 1 });
      bubble('ME DESCULPA.', 560, FLOOR - 470, prog(t, T.desc, T.desc + 0.15) * (1 - prog(t, T.hug - 0.3, T.hug - 0.1)), { size: 58, tail: 0.3, tailDir: 1 });
      bubble('TUDO BEM, PAPAI.', 420, FLOOR - 420, prog(t, T.tudo, T.tudo + 0.15) * (1 - prog(t, 24.2, 24.5)), { size: 44, tail: -0.4, tailDir: -1 });
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    const blameCues = (a) => { for (let k = 0; k < 3; k++) cue(a + 0.1 + k * 0.24, 'step', { gain: 0.3 }); cue(a + 1.0, 'bump'); cue(a + 1.0 + FALL, 'break'); cue(a + 1.85, 'bubble'); cue(a + 2.6, 'sigh', { gain: 0.6 }); };
    blameCues(0); cue(2.95, 'bubble', { gain: 0.5 });
    for (const tt of [S1.b, S2.b, S3.b]) cue(tt - 0.05, 'whoosh');
    for (let k = 0; k < 3; k++) cue(S2.a + 0.1 + k * 0.2, 'step', { gain: 0.3 }); cue(5.35, 'bump', { gain: 0.6 }); cue(5.35 + FALL, 'break'); cue(6.3, 'step', { gain: 0.3 }); cue(6.75, 'bubble', { gain: 0.6 });
    for (let k = 0; k < 3; k++) cue(S3.a + 0.1 + k * 0.22, 'step', { gain: 0.3 }); cue(9.0, 'bubble'); cue(9.95, 'bubble', { gain: 0.7 });
    cue(S4.a + 0.1, 'tickstart'); cue(12.9, 'tickstop'); blameCues(S4.a); cue(13.3, 'sigh', { gain: 0.5 });
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    for (let k = 0; k < 2; k++) cue(T.v + 0.05 + k * 0.22, 'step', { gain: 0.3 }); cue(T.bump, 'bump'); cue(T.bump + FALL, 'break'); cue(T.kneel, 'thud', { gain: 0.25 }); cue(T.errou, 'bubble'); cue(T.desc, 'bubble'); cue(T.grow, 'grow'); cue(T.hug, 'hold'); cue(T.tudo, 'bubble', { gain: 0.6 });
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const z = 1.45 * (1 + 0.06 * sm(t, T.v, 26)), camX = t < T.v ? 560 : lerp(560, 480, sm(t, T.v, T.hug + 1));
      let shk = 0; for (const b of [1.0 + FALL, 5.35 + FALL, S4.a + 1.0 + FALL, T.bump + FALL]) if (t > b && t < b + 0.25) shk = Math.sin(t * 90) * 7 * (1 - prog(t, b, b + 0.25));
      ctx.save(); ctx.translate(540 + shk, 1520); ctx.scale(z, z); ctx.translate(-camX, -FLOOR); ctx.drawImage(bgc, 0, 0);
      if (t < S1.b + 0.1) blameScene(t, 0, 0.72, 6); else if (t < S2.b + 0.1) scene2(t); else if (t < S3.b + 0.1) scene3(t); else if (t < T.v) blameScene(t, S4.a, 0.7, 30); else scene5(t);
      ctx.restore();
      for (const e of [S1.b, S2.b, S3.b, T.v]) { const k = prog(t, e - 0.2, e + 0.1) * (1 - prog(t, e + 0.15, e + 0.45)); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[S1.b - 0.2, S1.b - 0.2, ''], [S2.a, S2.b - 0.3, '10 ANOS'], [S3.a, S3.b - 0.3, '16 ANOS'], [S4.a, S4.b - 0.4, '30 ANOS DEPOIS'], [T.v + 0.1, T.hug + 1.5, 'O OUTRO PAI']];
      for (const [a, b, s] of ag) if (s) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      const v30 = prog(t, S4.a + 0.4, S4.a + 0.7) * (1 - prog(t, S4.b - 0.4, S4.b - 0.15)); if (v30 > 0) spaced('ELE VIROU PAI.', 540, 760, 40, { a: v30, w: 800, sp: 8, color: RED });
      // gancho
      const h1 = prog(t, 0.05, 0.35) * (1 - prog(t, 4.0, 4.3)); if (h1 > 0) { spaced('ELE NUNCA OUVIU', 540, 330, 60, { a: h1, w: 900, sp: 8 }); spaced('VOCÊ PEDIR', 540, 425, 60, { a: h1 * prog(t, 0.25, 0.55), w: 900, sp: 8 }); spaced('DESCULPA.', 540, 535, 78, { a: h1 * prog(t, 0.6, 0.9), w: 900, sp: 12, color: RED }); }
      // HEADLINE
      const dim = prog(t, T.dimA, T.dimA + 0.3) * (1 - prog(t, T.dimB - 0.4, T.dimB)); if (dim > 0) { ga(0.9 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['VOCÊ NUNCA', WHITE], ['ADMITIU UM ERRO.', WHITE], ['ELE APRENDEU', WHITE], ['A ESCONDER.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; const size = fit(s, i === 3 ? 150 : 112); txt(s, 540, 640 + i * 150 + (i >= 2 ? 50 : 0) + (i === 3 ? 20 : 0), size, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); });
        ctx.save(); ga(dim * prog(t, T.hl[3], T.hl[3] + 0.3)); ctx.translate(540, 1420); ctx.scale(1.6, 1.6); ctx.translate(-540, -1420); cupShape(540, 1420, 0.25); ctx.restore(); ga(1); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.62 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('QUEM PEDE PERDÃO', 540, 430, fit('QUEM PEDE PERDÃO', 112), { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('ENSINA', 540, 570, fit('ENSINA', 112), { a: prog(t, T.fin + 0.35, T.fin + 0.7), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.35, T.fin + 0.85))) });
        txt('A PERDOAR.', 540, 715, fit('A PERDOAR.', 130), { color: RED, a: prog(t, T.fin + 0.8, T.fin + 1.1), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.8, T.fin + 1.3))), glow: 'rgba(224,38,43,0.55)' });
        spaced('DIZER "EU ERREI" NÃO TE DIMINUI.', 540, 860, 34, { a: prog(t, 26.6, 27.2), w: 800, sp: 4 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 27.4, 28.0), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
