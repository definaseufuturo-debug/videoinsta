/*
 * "A PORTA FECHADA": corte da casa (corredor | parede com a PORTA VERMELHA | quarto). Aos 13, 15 e 17 o filho se tranca;
 * o pai bate UMA vez e vai embora (aos 17 nem bate). Dentro, o filho pensa "FICA, PAI...". Aos 18 ele sai de casa com a
 * caixa e passa direto. Virada: o outro pai bate, senta no chão encostado na porta e espera, noite após noite; do outro
 * lado o filho senta encostado também (costas com costas), até a porta abrir e o abraço. Final: "NÃO BATA UMA VEZ. FIQUE." (Lc 15:20)
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

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c';
  const FLOOR = 1390, FS = 1.32;
  const DX = 600, DW = 40, DTOP = FLOOR - 330, CEIL = FLOOR - 540; // porta (parede) no meio
  const S1 = { a: 0.0, b: 4.35 }, S2 = { a: 4.55, b: 7.75 }, S3 = { a: 7.95, b: 10.95 }, S4 = { a: 11.15, b: 13.75 };
  const T = { hl: [14.05, 14.6, 15.2, 15.85], dimA: 13.7, dimB: 16.9, v: 17.0, knock: 17.85, aqui: 18.1, sit: 18.95, n1: 19.3, n2: 20.3, n3: 21.3, nvou: 21.55, open: 22.6, hug: 23.25, pai: 23.45, fin: 24.6 };
  const BEDX = 800, BEDY = FLOOR - 70;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    const fit = (s, size, max = 960) => Math.min(size, size * max / tw(s, size));
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: corte da casa (corredor à esquerda, quarto à direita) ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const wg = g.createLinearGradient(0, CEIL, 0, FLOOR); wg.addColorStop(0, '#0e0e12'); wg.addColorStop(1, '#17171c'); g.fillStyle = wg; g.fillRect(0, CEIL, W, FLOOR - CEIL);
      // quarto um pouco mais frio
      g.fillStyle = 'rgba(70,90,140,0.07)'; g.fillRect(DX, CEIL, W - DX, FLOOR - CEIL);
      g.fillStyle = '#2a2a31'; g.fillRect(0, CEIL - 8, W, 8);
      // quadro no corredor
      g.strokeStyle = '#2e2e36'; g.lineWidth = 6; g.strokeRect(300, FLOOR - 430, 110, 80); g.strokeRect(318, FLOOR - 416, 74, 52);
      // luz do corredor
      g.strokeStyle = '#2c2c33'; g.lineWidth = 4; g.beginPath(); g.moveTo(360, CEIL); g.lineTo(360, CEIL + 70); g.stroke();
      g.fillStyle = '#ffe2a8'; g.beginPath(); g.moveTo(330, CEIL + 100); g.lineTo(390, CEIL + 100); g.lineTo(375, CEIL + 70); g.lineTo(345, CEIL + 70); g.closePath(); g.fill();
      const sp = g.createRadialGradient(360, CEIL + 110, 20, 360, CEIL + 250, 520); sp.addColorStop(0, 'rgba(255,214,150,0.16)'); sp.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = sp; g.fillRect(0, CEIL, DX, FLOOR - CEIL);
      // janela do quarto
      g.strokeStyle = '#2e2e36'; g.lineWidth = 8; g.strokeRect(760, FLOOR - 450, 150, 170); g.beginPath(); g.moveTo(835, FLOOR - 450); g.lineTo(835, FLOOR - 280); g.moveTo(760, FLOOR - 365); g.lineTo(910, FLOOR - 365); g.stroke();
      let sd = 7; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let i = 0; i < 10; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.4})`; g.beginPath(); g.arc(768 + rnd() * 135, FLOOR - 442 + rnd() * 155, 1 + rnd(), 0, TAU); g.fill(); }
      // cama
      g.fillStyle = '#1f1f26'; g.fillRect(700, BEDY, 240, 26); g.fillRect(700, BEDY + 26, 14, FLOOR - BEDY - 26); g.fillRect(926, BEDY + 26, 14, FLOOR - BEDY - 26); g.fillRect(920, BEDY - 70, 20, 96);
      g.fillStyle = '#2a2a33'; g.fillRect(850, BEDY - 18, 70, 18);
      // chão
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,255,255,0.03)'; g.fillRect(i * 130, FLOOR + 3, 2, 300); }
      // parede acima da porta
      g.fillStyle = '#26262d'; g.fillRect(DX - DW / 2 - 6, CEIL, DW + 12, DTOP - CEIL); g.fillStyle = '#34343c'; g.fillRect(DX - DW / 2 - 10, DTOP - 10, DW + 20, 10);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // lua na janela (muda de lugar a cada noite)
    function moon(k) { ctx.save(); ctx.beginPath(); ctx.rect(764, FLOOR - 446, 142, 162); ctx.clip(); const x = lerp(790, 885, k), y = lerp(FLOOR - 330, FLOOR - 410, Math.sin(k * Math.PI) * 0.8 + k * 0.2);
      ctx.fillStyle = '#f2ecd8'; ctx.shadowColor = 'rgba(255,250,230,0.7)'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#121218'; ctx.beginPath(); ctx.arc(x + 8, y - 5, 16, 0, TAU); ctx.fill(); ctx.restore(); }

    // ---------- porta vermelha: open 0 = fechada, 1 = aberta para dentro do quarto ----------
    function door(open, glow = 1) {
      ctx.save();
      if (open > 0.02) { const lg = ctx.createLinearGradient(DX, 0, DX - 380, 0); lg.addColorStop(0, `rgba(255,230,180,${0.22 * open})`); lg.addColorStop(1, 'rgba(255,230,180,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(DX, DTOP); ctx.lineTo(DX - 380, DTOP - 40); ctx.lineTo(DX - 380, FLOOR); ctx.lineTo(DX, FLOOR); ctx.closePath(); ctx.fill(); }
      const hx = DX + DW / 2, L = 150 * Math.sin(open * Math.PI / 2), thick = lerp(DW, 14, open);
      ctx.fillStyle = RED; ctx.shadowColor = `rgba(224,38,43,${0.75 * glow})`; ctx.shadowBlur = 22 * glow;
      ctx.beginPath(); ctx.moveTo(hx - thick, DTOP); ctx.lineTo(hx + L, DTOP - 26 * open); ctx.lineTo(hx + L, FLOOR + 22 * open); ctx.lineTo(hx - thick, FLOOR); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      if (open < 0.3) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(hx - thick + 6, DTOP + 150, 6, 30); }
      ctx.restore();
    }

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
      if (o.box) { const [bx, by] = hands[0]; ctx.shadowBlur = 0; ctx.lineWidth = 7; ctx.strokeRect(bx - 8, by - 34, 62, 52); ctx.beginPath(); ctx.moveTo(bx - 8, by - 8); ctx.lineTo(bx + 54, by - 8); ctx.stroke(); ctx.lineWidth = 13; }
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
    const SHRUG = [[-0.9, -2.2], [0.9, 2.2]];
    // sentado abraçando os joelhos (y = assento)
    const KNEES = [[2.25, 0.3], [2.15, 0.25]], HUGK = [[1.25, 2.1], [1.05, 1.95]];
    function sitCurl(x, seatY, s, dir, o = {}) { return figure({ x, y: seatY + 86 * s, s, hr: o.hr || 30, dir, lean: o.lean ?? 0.32, headTilt: o.tilt ?? 0.55, legs: KNEES, bob: 0, arms: HUGK, a: o.a }); }
    // sentado com as costas na porta, pernas esticadas
    const LEGS_OUT = [[1.62, 1.6], [1.5, 1.52]], ARMS_REST = [[0.7, 1.3], [0.5, 1.2]];
    function sitBack(x, s, dir, o = {}) { return figure({ x, y: FLOOR + 86 * s, s, hr: o.hr || 23, dir, lean: o.lean ?? -0.05, headTilt: o.tilt ?? 0.35, legs: LEGS_OUT, bob: 0, arms: o.arms || ARMS_REST, reach: o.reach }); }

    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 50, w = tw(s, size) + 64, h = size * 1.75; x = clamp(x, 240 + w / 2, 880 - w / 2); ctx.save(); ctx.translate(x, y); const e = (1 + (1 - k) * 0.3) * (o.scale ?? 1); ctx.scale(e, e); ga(clamp(k * 3) * (o.a ?? 1));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill();
      if (o.think) { const tx = (o.tail || 0) * w * 0.3; for (const [dx, dy, rr] of [[0, h / 2 + 18, 12], [o.tailDir * 18, h / 2 + 46, 8]]) { ctx.beginPath(); ctx.arc(tx + dx, dy, rr, 0, TAU); ctx.fill(); } }
      else { const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill(); }
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 640, 50, { w: 900, sp: 12 }); const w = Math.min(260, tw(s, 50) * 0.4); ctx.fillStyle = RED; ctx.fillRect(540 - w / 2, 686, w, 5); ctx.restore(); ga(1); }
    function knockMark(x, y, k) { if (k <= 0 || k >= 1) return; ctx.save(); ga(1 - k); ctx.strokeStyle = WHITE; ctx.lineWidth = 5; for (let i = -1; i <= 1; i++) { const a = i * 0.5 + Math.PI; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (20 + 30 * k), y + Math.sin(a) * (20 + 30 * k)); ctx.lineTo(x + Math.cos(a) * (36 + 40 * k), y + Math.sin(a) * (36 + 40 * k)); ctx.stroke(); } ctx.restore(); ga(1); }

    // ---------- o pai que bate uma vez e vai embora ----------
    const PX = 470; // onde o pai para diante da porta
    function dadKnockLeave(t, a, o) {
      const arrive = a + o.arr, kn = a + o.kn, leave = a + o.lv, gone = a + o.gone;
      let x, walking = false, dir = 1;
      if (t < arrive) { x = lerp(150, PX, prog(t, a + o.start, arrive)); walking = t > a + o.start; }
      else if (t < leave) x = PX;
      else { x = lerp(PX, 120, prog(t, leave, gone)); walking = true; dir = -1; }
      const wp = walkPose(t * 8, 0.9);
      const sh = shoulder({ x, y: FLOOR, s: FS, dir, lean: 0.04 });
      let reach = null;
      if (!walking && o.knock) { const r = sm(t, kn - 0.3, kn - 0.05) * (1 - sm(t, kn + 0.35, kn + 0.6)); if (r > 0) { const bump = Math.max(0, Math.sin((t - kn + 0.05) * 30)) * 10 * (t > kn - 0.05 && t < kn + 0.25); reach = [[0, lerp(sh[0] + 20, DX - DW / 2 - 6 - bump, r), lerp(sh[1] + 70, FLOOR - 225, r), -1]]; } }
      const shrug = o.shrug ? sm(t, leave - 0.45, leave - 0.25) * (1 - sm(t, leave - 0.05, leave + 0.15)) : 0;
      const arms = walking ? walkArms(t * 8) : lerpA(A_DOWN, SHRUG, shrug);
      figure({ x, y: FLOOR, s: FS, hr: 23, dir, lean: walking ? 0.06 : 0.04, headTilt: walking ? 0.05 : lerp(-0.05, 0.2, shrug), legs: walking ? wp.legs : STANDL, bob: walking ? wp.bob : 0, arms, reach });
      if (o.knock) knockMark(DX - DW / 2 - 4, FLOOR - 225, prog(t, kn, kn + 0.35));
      if (o.say) bubble(o.say, 420, FLOOR - 470, prog(t, kn + 0.25, kn + 0.4) * (1 - prog(t, leave - 0.5, leave - 0.35)), { size: 46, tail: 0.3, tailDir: 1 });
    }

    function scene1(t) { // 13 anos: ele entra e bate a porta
      const enter = t < 1.0, kx = lerp(330, 760, sm(t, 0.0, 1.0, x => x)), wp = walkPose(t * 9, 1);
      const shut = sm(t, 1.0, 1.15);
      door(1 - shut);
      if (enter) figure({ x: kx, y: FLOOR, s: 0.86, hr: 30, dir: 1, lean: 0.08, headTilt: 0.15, legs: wp.legs, bob: wp.bob, arms: walkArms(t * 9) });
      else { const sit = sm(t, 1.15, 1.6); if (sit < 1) figure({ x: lerp(760, BEDX, sit), y: lerp(FLOOR, BEDY + 86 * 0.86, sit), s: 0.86, hr: 30, dir: -1, lean: lerp(0.1, 0.32, sit), headTilt: 0.4, legs: lerpA(STANDL, KNEES, sit), bob: 0, arms: lerpA(A_DOWN, HUGK, sit) }); else sitCurl(BEDX, BEDY, 0.86, -1); }
      dadKnockLeave(t, 0, { start: 1.1, arr: 1.95, kn: 2.3, lv: 3.55, gone: 4.35, knock: true, say: 'TUDO BEM AÍ?', shrug: true });
    }
    function scene2(t) { // 15 anos: bate, chama, vai embora; ele pensa "FICA, PAI..."
      door(0); sitCurl(BEDX, BEDY, 0.95, -1, { tilt: t > 6.9 ? lerp(0.55, -0.1, sm(t, 6.9, 7.2)) : 0.55, lean: t > 6.9 ? lerp(0.32, 0.18, sm(t, 6.9, 7.2)) : 0.32 });
      dadKnockLeave(t, S2.a, { start: 0.0, arr: 0.7, kn: 1.0, lv: 2.05, gone: 2.95, knock: true, say: 'VAI JANTAR?', shrug: true });
      bubble('FICA, PAI...', 830, FLOOR - 400, prog(t, 6.75, 6.9) * (1 - prog(t, 7.55, 7.7)), { size: 44, color: RED, think: true, tail: 0, tailDir: -1 });
    }
    function scene3(t) { // 17 anos: ele passa direto
      door(0); sitCurl(BEDX, BEDY, 1.05, -1, { tilt: 0.7, lean: 0.38 });
      const x = lerp(140, 560, prog(t, S3.a + 0.1, S3.a + 1.9)), wp = walkPose(t * 8, 0.9);
      const x2 = t < S3.a + 1.9 ? x : lerp(560, 1000, prog(t, S3.a + 1.9, S3.a + 2.9));
      // passa pelo corredor sem parar (sai pela esquerda de volta)
      const xx = t < S3.a + 1.5 ? lerp(120, 470, prog(t, S3.a + 0.1, S3.a + 1.5)) : lerp(470, 100, prog(t, S3.a + 1.5, S3.a + 2.8));
      const dir = t < S3.a + 1.5 ? 1 : -1;
      if (t < S3.a + 2.8) figure({ x: xx, y: FLOOR, s: FS, hr: 23, dir, lean: 0.06, headTilt: 0.05, legs: wp.legs, bob: wp.bob, arms: walkArms(t * 8) });
      void x2;
      bubble('ELE NEM PERCEBE.', 800, FLOOR - 420, prog(t, 9.55, 9.7) * (1 - prog(t, 10.6, 10.75)), { size: 40, color: RED, think: true, tail: 0, tailDir: -1 });
    }
    function scene4(t) { // 18 anos: sai de casa com a caixa e passa direto pelo pai
      const op = sm(t, S4.a + 0.15, S4.a + 0.5); door(op);
      figure({ x: 270, y: FLOOR, s: FS, hr: 23, dir: 1, lean: 0.02, headTilt: t > S4.a + 1.6 ? lerp(0, 0.55, sm(t, S4.a + 1.6, S4.a + 2.2)) : 0, legs: STANDL, bob: 0, arms: t > S4.a + 0.6 && t < S4.a + 1.4 ? lerpA(A_DOWN, [[1.3, 1.4], [-0.1, 0.1]], sm(t, S4.a + 0.6, S4.a + 0.8) * (1 - sm(t, S4.a + 1.2, S4.a + 1.4))) : A_DOWN });
      const sx = lerp(820, 60, prog(t, S4.a + 0.35, S4.a + 2.0)), wp = walkPose(t * 8.5, 0.95);
      if (t < S4.a + 2.0) figure({ x: sx, y: FLOOR, s: 1.2, hr: 25, dir: -1, lean: 0.07, headTilt: -0.05, legs: wp.legs, bob: wp.bob, arms: [[1.2, 1.5], [0.45 * Math.sin(t * 8.5), 0.3]], box: true });
      bubble('FILHO...', 360, FLOOR - 460, prog(t, S4.a + 0.7, S4.a + 0.85) * (1 - prog(t, S4.a + 1.6, S4.a + 1.75)), { size: 44, tail: -0.2, tailDir: 1 });
    }
    // ---------- virada: o outro pai senta e espera ----------
    function scene5(t) {
      const night = t < T.n2 ? 0 : t < T.n3 ? 1 : 2, open = sm(t, T.open, T.open + 0.45);
      moon(t < T.n1 ? 0 : clamp((t - T.n1) / (T.open - T.n1)));
      // dentro: filho
      if (t < T.n2) sitCurl(BEDX, BEDY, 0.95, -1);
      else if (t < T.open) sitCurl(DX + DW / 2 + 22 + (night === 1 ? 70 : 0), FLOOR, 0.95, 1, { tilt: night === 2 ? 0.2 : 0.45, lean: 0.25 }); // vai chegando perto da porta
      door(open);
      // fora: pai
      const walking = t < T.v + 0.75, wp = walkPose(t * 8, 0.9);
      if (t < T.sit) {
        const x = walking ? lerp(140, PX, prog(t, T.v, T.v + 0.75)) : PX, sh = shoulder({ x, y: FLOOR, s: FS, dir: 1, lean: 0.04 });
        let reach = null; const kn = T.knock, r = sm(t, kn - 0.3, kn - 0.05) * (1 - sm(t, kn + 0.35, kn + 0.6));
        if (!walking && r > 0) { const bump = Math.max(0, Math.sin((t - kn + 0.05) * 30)) * 10 * (t > kn - 0.05 && t < kn + 0.25); reach = [[0, lerp(sh[0] + 20, DX - DW / 2 - 6 - bump, r), lerp(sh[1] + 70, FLOOR - 225, r), -1]]; }
        const turn = sm(t, T.sit - 0.4, T.sit);
        figure({ x: lerp(x, DX - DW / 2 - 30, turn), y: lerp(FLOOR, FLOOR + 50, turn), s: FS, hr: 23, dir: turn > 0.5 ? -1 : 1, lean: walking ? 0.06 : 0.04, headTilt: 0.05, legs: walking ? wp.legs : lerpA(STANDL, [[1.2, 0.2], [1.1, 0.1]], turn), bob: walking ? wp.bob : 0, arms: walking ? walkArms(t * 8) : A_DOWN, reach });
        knockMark(DX - DW / 2 - 4, FLOOR - 225, prog(t, kn, kn + 0.35));
      } else if (t < T.open + 0.2) {
        sitBack(DX - DW / 2 - 26, FS, -1, { tilt: night === 2 ? 0.1 : 0.35 });
      } else {
        // levanta e abraça o filho que sai pela porta
        const up = sm(t, T.open + 0.05, T.open + 0.5), hk = sm(t, T.hug - 0.35, T.hug);
        const dxp = lerp(DX - DW / 2 - 26, 500, up);
        const kx = lerp(DX + 50, 575, sm(t, T.open + 0.45, T.hug));
        const ksh = shoulder({ x: kx, y: FLOOR, s: 1.0, dir: -1, lean: 0.05 });
        const dsh = shoulder({ x: dxp, y: FLOOR, s: FS, dir: 1, lean: 0.1 });
        const KN = [[1.2, 0.2], [1.1, 0.1]], dy2 = up < 0.5 ? lerp(FLOOR + 86 * FS, FLOOR + 40, up * 2) : lerp(FLOOR + 40, FLOOR, up * 2 - 1), dl2 = up < 0.5 ? lerpA(LEGS_OUT, KN, up * 2) : lerpA(KN, STANDL, up * 2 - 1);
        figure({ x: dxp, y: dy2, s: FS, hr: 23, dir: 1, lean: lerp(-0.05, 0.12, up), headTilt: lerp(0.3, 0.25, up), legs: dl2, bob: 0, arms: A_DOWN, reach: hk > 0 ? [[0, ksh[0] + 6, ksh[1] + 10, 1], [1, ksh[0] - 4, ksh[1] + 40, 1]] : null });
        figure({ x: kx, y: FLOOR, s: 1.0, hr: 30, dir: -1, lean: 0.05 + 0.1 * hk, headTilt: 0.3, legs: STANDL, bob: 0, arms: A_DOWN, reach: hk > 0 ? [[0, dsh[0] + 4, dsh[1] + 40, -1], [1, dsh[0] - 6, dsh[1] + 10, -1]] : null });
      }
      bubble('FILHO, EU TÔ AQUI.', 400, FLOOR - 470, prog(t, T.aqui, T.aqui + 0.15) * (1 - prog(t, T.sit - 0.2, T.sit)), { size: 42, tail: 0.3, tailDir: 1 });
      bubble('EU NÃO VOU EMBORA.', 400, FLOOR - 400, prog(t, T.nvou, T.nvou + 0.15) * (1 - prog(t, T.open - 0.15, T.open)), { size: 40, tail: 0.4, tailDir: 1 });
      bubble('PAI...', 650, FLOOR - 400, prog(t, T.pai, T.pai + 0.15) * (1 - prog(t, 24.3, 24.55)), { size: 50, tail: -0.3, tailDir: -1 });
      // brilho no abraço
      const g2 = sm(t, T.hug, T.hug + 0.8); if (g2 > 0) { const g = ctx.createRadialGradient(545, FLOOR - 160, 10, 545, FLOOR - 160, 380); g.addColorStop(0, `rgba(255,236,200,${0.28 * g2})`); g.addColorStop(1, 'rgba(255,236,200,0)'); ctx.fillStyle = g; ctx.fillRect(160, FLOOR - 560, 760, 700); }
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    for (let k = 0; k < 4; k++) cue(0.05 + k * 0.22, 'step', { gain: 0.3 }); cue(1.0, 'slam');
    const dadCues = (a, o) => { for (let k = 0; k < 3; k++) cue(a + o.start + 0.1 + k * 0.24, 'step', { gain: 0.3 }); if (o.kn) { cue(a + o.kn - 0.05, 'knock'); cue(a + o.kn + 0.27, 'bubble', { gain: 0.6 }); } if (o.lv) { cue(a + o.lv - 0.4, 'sigh', { gain: 0.5 }); for (let k = 0; k < 3; k++) cue(a + o.lv + 0.1 + k * 0.26, 'step', { gain: 0.25 }); } };
    dadCues(0, { start: 1.1, kn: 2.3, lv: 3.55 }); dadCues(S2.a, { start: 0, kn: 1.0, lv: 2.05 }); cue(6.75, 'bubble', { gain: 0.5 });
    for (let k = 0; k < 5; k++) cue(S3.a + 0.15 + k * 0.5, 'step', { gain: 0.25 }); cue(9.55, 'bubble', { gain: 0.5 });
    for (const tt of [S1.b, S2.b, S3.b]) cue(tt - 0.05, 'whoosh');
    cue(S4.a + 0.15, 'creak'); for (let k = 0; k < 5; k++) cue(S4.a + 0.4 + k * 0.3, 'step', { gain: 0.3 }); cue(S4.a + 0.7, 'bubble', { gain: 0.5 }); cue(S4.a + 2.1, 'tickstart'); cue(13.6, 'tickstop'); cue(S4.a + 2.0, 'slamfar');
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    for (let k = 0; k < 3; k++) cue(T.v + 0.05 + k * 0.24, 'step', { gain: 0.3 }); cue(T.knock - 0.05, 'knock'); cue(T.aqui, 'bubble'); cue(T.sit, 'thud', { gain: 0.3 });
    cue(T.n1, 'night'); cue(T.n2, 'night'); cue(T.n3, 'night'); cue(T.nvou, 'bubble'); cue(T.open - 0.1, 'grow'); cue(T.open, 'creak'); cue(T.hug, 'hold'); cue(T.pai, 'bubble', { gain: 0.6 });
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const z = 1.45 * (1 + 0.06 * sm(t, T.v, 26)), camX = 560;
      let shk = 0; for (const b of [1.05]) if (t > b && t < b + 0.3) shk = Math.sin(t * 90) * 9 * (1 - prog(t, b, b + 0.3));
      ctx.save(); ctx.translate(540 + shk, 1520); ctx.scale(z, z); ctx.translate(-camX, -FLOOR); ctx.drawImage(bgc, 0, 0);
      if (t < S1.b + 0.1) scene1(t); else if (t < S2.b + 0.1) scene2(t); else if (t < S3.b + 0.1) scene3(t); else if (t < T.v) scene4(t); else scene5(t);
      ctx.restore();
      for (const e of [S1.b, S2.b, S3.b, T.v, T.n2, T.n3]) { const k = prog(t, e - 0.2, e + 0.1) * (1 - prog(t, e + 0.15, e + 0.45)); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[S2.a, S2.b - 0.3, '15 ANOS'], [S3.a, S3.b - 0.3, '17 ANOS'], [S4.a, S4.b - 0.4, '18 ANOS'], [T.v + 0.1, T.n1 - 0.1, 'O OUTRO PAI'], [T.n1, T.n2 - 0.2, '1ª NOITE'], [T.n2 + 0.05, T.n3 - 0.2, '2ª NOITE'], [T.n3 + 0.05, T.open + 0.3, '3ª NOITE']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      const v18 = prog(t, S4.a + 1.0, S4.a + 1.3) * (1 - prog(t, S4.b - 0.4, S4.b - 0.15)); if (v18 > 0) spaced('ELE FOI EMBORA DE CASA.', 540, 760, 38, { a: v18, w: 800, sp: 6, color: RED });
      // gancho
      const h1 = prog(t, 0.05, 0.35) * (1 - prog(t, 4.0, 4.3)); if (h1 > 0) { spaced('ELE FECHOU A PORTA.', 540, 330, 56, { a: h1, w: 900, sp: 7 }); spaced('MAS QUERIA QUE', 540, 425, 56, { a: h1 * prog(t, 0.3, 0.6), w: 900, sp: 7 }); spaced('VOCÊ FICASSE.', 540, 535, 74, { a: h1 * prog(t, 0.7, 1.0), w: 900, sp: 10, color: RED }); }
      // HEADLINE
      const dim = prog(t, T.dimA, T.dimA + 0.3) * (1 - prog(t, T.dimB - 0.4, T.dimB)); if (dim > 0) { ga(0.9 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['VOCÊ BATEU', WHITE], ['UMA VEZ.', WHITE], ['ELE ESPEROU', WHITE], ['A VIDA TODA.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; const size = fit(s, i === 3 ? 140 : 112); txt(s, 540, 640 + i * 150 + (i >= 2 ? 50 : 0) + (i === 3 ? 20 : 0), size, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); });
        ctx.save(); ga(dim * prog(t, T.hl[3], T.hl[3] + 0.3)); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.8)'; ctx.shadowBlur = 24; ctx.fillRect(500, 1330, 80, 190); ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(560, 1420, 8, 24); ctx.restore(); ga(1); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.62 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('NÃO BATA', 540, 430, fit('NÃO BATA', 130), { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('UMA VEZ.', 540, 580, fit('UMA VEZ.', 130), { a: prog(t, T.fin + 0.35, T.fin + 0.7), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.35, T.fin + 0.85))) });
        txt('FIQUE.', 540, 745, fit('FIQUE.', 170), { color: RED, a: prog(t, T.fin + 0.8, T.fin + 1.1), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.8, T.fin + 1.3))), glow: 'rgba(224,38,43,0.55)' });
        spaced('AMOR QUE ESPERA ABRE QUALQUER PORTA.', 540, 890, 32, { a: prog(t, 26.6, 27.2), w: 800, sp: 3 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 27.4, 28.0), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
