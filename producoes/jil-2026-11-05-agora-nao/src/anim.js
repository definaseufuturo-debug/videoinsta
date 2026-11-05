/*
 * "AGORA NÃO": o filho corre com o desenho (4 anos), com a bola (9), com uma conversa (15) e ouve "AGORA NÃO",
 * cada vez maior. 20 anos depois o pai, velho, pede pra conversar e o filho adulto, no celular (vermelho), responde
 * "AGORA NÃO, PAI". Virada: de volta aos 4 anos, o pai guarda o celular, ajoelha e diz "AGORA SIM". (Gl 6:9)
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
  const T = { hl: [14.05, 14.6, 15.15, 15.8], dimA: 13.7, dimB: 16.9, v: 17.0, run: 17.1, show: 17.9, look: 18.2, pocket: 18.5, kneel: 18.95, sim: 19.6, hug: 20.5, fin: 24.6 };
  const DADX = 700, KIDX = 470;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    const fit = (s, size, max = 960) => Math.min(size, size * max / tw(s, size));
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: sala à noite (janela com lua, abajur, sofá) ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      // parede
      const wg = g.createLinearGradient(0, 700, 0, FLOOR); wg.addColorStop(0, '#0d0d10'); wg.addColorStop(1, '#16161b'); g.fillStyle = wg; g.fillRect(0, 700, W, FLOOR - 700);
      // janela com lua
      g.strokeStyle = '#2e2e36'; g.lineWidth = 8; g.strokeRect(220, 860, 190, 230); g.beginPath(); g.moveTo(315, 860); g.lineTo(315, 1090); g.moveTo(220, 975); g.lineTo(410, 975); g.stroke();
      g.fillStyle = '#d9d9e0'; g.beginPath(); g.arc(365, 915, 22, 0, TAU); g.fill(); g.fillStyle = '#0d0d10'; g.beginPath(); g.arc(374, 909, 20, 0, TAU); g.fill();
      let sd = 5; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.4})`; g.beginPath(); g.arc(228 + rnd() * 175, 868 + rnd() * 215, 1 + rnd(), 0, TAU); g.fill(); }
      // abajur + luz quente
      const lx = 900; g.fillStyle = '#2c2c33'; g.fillRect(lx - 5, 1030, 10, FLOOR - 1030); g.fillRect(lx - 40, FLOOR - 10, 80, 10); g.fillStyle = '#ffe2a8'; g.beginPath(); g.moveTo(lx - 50, 1030); g.lineTo(lx + 50, 1030); g.lineTo(lx + 32, 975); g.lineTo(lx - 32, 975); g.closePath(); g.fill();
      const sp = g.createRadialGradient(lx, 1010, 20, lx, 1010, 620); sp.addColorStop(0, 'rgba(255,214,150,0.16)'); sp.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      // sofá (silhueta) ao fundo
      g.fillStyle = '#1d1d23'; g.beginPath(); g.roundRect(560, 1170, 300, 150, 20); g.fill(); g.beginPath(); g.roundRect(540, 1250, 340, 90, 18); g.fill(); g.fillRect(560, 1330, 14, 60); g.fillRect(846, 1330, 14, 60);
      // chão
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,255,255,0.03)'; g.fillRect(i * 130, FLOOR + 3, 2, 300); }
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho (com IK opcional para dar a mão) ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function ik(sx, sy, tx, ty, l1, l2, bend) { // ângulos (0 = para baixo, + = para frente)
      const dx = tx - sx, dy = ty - sy, d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.5), base = Math.atan2(dx, dy);
      const al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), a1 = base + bend * al;
      const ex = sx + Math.sin(a1) * l1, ey = sy + Math.cos(a1) * l1; return [a1, Math.atan2(tx - ex, ty - ey)];
    }
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
    const A_DOWN = [[0.15, 0.2], [-0.1, 0.1]], A_PHONE = [[0.15, 0.2], [0.45, 2.7]];
    const lerpA = (A, B, k) => A.map((p, i) => p.map((v, j) => lerp(v, B[i][j], k)));

    function phone(x, y, on) { ctx.save(); if (on > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, 150); g.addColorStop(0, `rgba(224,38,43,${0.42 * on})`); g.addColorStop(1, 'rgba(224,38,43,0)'); ctx.fillStyle = g; ctx.fillRect(x - 150, y - 150, 300, 300); }
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 14 * on; ctx.beginPath(); ctx.roundRect(x - 11, y - 18, 22, 36, 5); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = `rgba(255,220,220,${0.55 * on})`; ctx.fillRect(x - 7, y - 13, 14, 24); ctx.restore(); }
    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 50, w = tw(s, size) + 64, h = size * 1.75; ctx.save(); ctx.translate(x, y); const e = 1 + (1 - k) * 0.3; ctx.scale(e, e); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 640, 50, { w: 900, sp: 12 }); ctx.fillStyle = RED; ctx.fillRect(470, 686, 140, 5); ctx.restore(); ga(1); }
    function holdDot(x, y) { ctx.save(); ctx.fillStyle = WHITE; ctx.shadowColor = 'rgba(255,255,255,0.4)'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); ctx.restore(); }

    const KNEEL = [[1.45, 0.0], [0.1, -1.55]];
    function paper(x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = '#f6f6f6'; ctx.shadowColor = 'rgba(255,255,255,0.35)'; ctx.shadowBlur = 10; ctx.fillRect(-34, -26, 68, 52); ctx.shadowBlur = 0;
      ctx.strokeStyle = '#777'; ctx.lineWidth = 3; ctx.lineCap = 'round'; // desenho: casinha e dois bonequinhos
      ctx.beginPath(); ctx.moveTo(-24, 6); ctx.lineTo(-24, -8); ctx.lineTo(-14, -17); ctx.lineTo(-4, -8); ctx.lineTo(-4, 6); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(12, -10, 4, 0, TAU); ctx.moveTo(12, -6); ctx.lineTo(12, 6); ctx.moveTo(12, 6); ctx.lineTo(8, 15); ctx.moveTo(12, 6); ctx.lineTo(16, 15); ctx.stroke();
      ctx.beginPath(); ctx.arc(24, -3, 3, 0, TAU); ctx.moveTo(24, 0); ctx.lineTo(24, 9); ctx.moveTo(24, 9); ctx.lineTo(21, 15); ctx.moveTo(24, 9); ctx.lineTo(27, 15); ctx.stroke(); ctx.restore(); }
    function ball(x, y, r = 26) { ctx.save(); ctx.fillStyle = '#e8e8e8'; ctx.shadowColor = 'rgba(255,255,255,0.3)'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, TAU); ctx.stroke(); ctx.restore(); }

    // pai sentado/em pé no celular (adulto, à direita, olhando para a esquerda)
    function dadPhone(t, o = {}) {
      const tilt = o.tilt ?? 0.55, arms = o.arms || A_PHONE, on = o.on ?? 1;
      const f = figure({ x: o.x ?? DADX, y: FLOOR + (o.drop || 0), s: o.s || FS, hr: 23, dir: -1, lean: o.lean ?? 0.05, headTilt: tilt, legs: o.legs || STANDL, bob: 0, arms, reach: o.reach || null, cane: o.cane ?? null });
      if (on > 0.02) { const h = f.hands[1]; ctx.save(); ga(on); phone(h[0] + 2, h[1] - 8, on); ctx.restore(); ga(1); }
      return f;
    }
    // criança entra correndo da esquerda até KIDX, mostra algo, depois vai embora
    function kid(t, a, o) {
      const s = o.s, inT = o.inT, stop = o.stop ?? KIDX, leave = o.leave;
      let x, dir = 1, pose, arms, lean = 0.08;
      if (t < inT) { x = lerp(80, stop, sm(t, a, inT, outC)); pose = walkPose(t * (o.run ? 12 : 8), o.run ? 1.2 : 0.9); arms = walkArms(t * (o.run ? 12 : 8)); lean = o.run ? 0.22 : 0.08; }
      else if (leave === undefined || t < leave) { x = stop; pose = { legs: STANDL, bob: 0 }; arms = A_DOWN; }
      else { dir = -1; x = lerp(stop, -60, sm(t, leave, leave + 1.6, lin)); pose = walkPose(t * 6, 0.7); arms = walkArms(t * 6, 0.5); lean = 0.12; }
      return { x, dir, pose, arms, lean };
    }

    // ---------- 4 anos: o desenho ----------
    function scene1(t) {
      const k = kid(t, 0.15, { s: 0.6, inT: 1.25, run: true, leave: 3.5 });
      const show = t >= 1.3 && t < 3.15 ? sm(t, 1.3, 1.55) : (t >= 3.15 && t < 3.5 ? 1 - sm(t, 3.15, 3.4) : 0);
      const ks = 0.6;
      const kf = figure({ x: k.x, y: FLOOR, s: ks, hr: 31, dir: k.dir, lean: k.lean, headTilt: t > 3.0 ? 0.45 : -0.2, legs: k.pose.legs, bob: k.pose.bob, arms: show > 0 ? lerpA(A_DOWN, [[2.6, 2.9], [2.5, 2.8]], show) : k.arms });
      const hp = kf.hands[0]; if (t < 3.5) paper(hp[0] + (k.dir) * 6, hp[1] - 18 * show, 1.0, show > 0.5 ? 0 : 0.8);
      dadPhone(t);
      bubble('PAI, OLHA!', k.x + 40, FLOOR - 330, prog(t, 1.45, 1.6) * (1 - prog(t, 2.25, 2.4)), { size: 42, tail: -0.3, tailDir: -1 });
      bubble('AGORA NÃO.', DADX - 20, FLOOR - 470, prog(t, 2.35, 2.5) * (1 - prog(t, 3.6, 3.8)), { size: 44, color: '#555', tail: 0.3, tailDir: 1 });
    }
    // ---------- 9 anos: a bola ----------
    function scene2(t) {
      const ks = 0.85, k = kid(t, S2.a, { s: ks, inT: 5.35, run: true, leave: 6.95 });
      const drop = 6.55;
      const kf = figure({ x: k.x, y: FLOOR, s: ks, hr: 28, dir: k.dir, lean: k.lean, headTilt: t > drop ? 0.4 : -0.1, legs: k.pose.legs, bob: k.pose.bob, arms: t < drop ? [[0.9, 1.5], k.arms[1]] : k.arms });
      if (t < drop) { const h = kf.hands[0]; ball(h[0] + 12, h[1] - 10); }
      else { const u = t - drop, bx = KIDX + 30 + u * 110, by = FLOOR - 26 - Math.abs(Math.sin(u * 7)) * 90 * Math.exp(-u * 2.2); ball(bx, Math.min(FLOOR - 26, by)); }
      dadPhone(t);
      bubble('VAMOS JOGAR?', k.x + 30, FLOOR - 400, prog(t, 5.4, 5.55) * (1 - prog(t, 6.05, 6.2)), { size: 42, tail: -0.3, tailDir: -1 });
      bubble('AGORA NÃO.', DADX - 30, FLOOR - 490, prog(t, 6.15, 6.3) * (1 - prog(t, 7.4, 7.6)), { size: 58, color: '#555', tail: 0.3, tailDir: 1 });
    }
    // ---------- 15 anos: a conversa ----------
    function scene3(t) {
      const ks = 1.12, k = kid(t, S3.a, { s: ks, inT: 8.75, leave: 10.05 });
      figure({ x: k.x, y: FLOOR, s: ks, hr: 24, dir: k.dir, lean: k.lean, headTilt: t > 9.7 ? 0.5 : 0.1, legs: k.pose.legs, bob: k.pose.bob, arms: t > 8.75 && t < 10.05 ? [[0.3, 0.3], [0.5, 1.4]] : k.arms });
      dadPhone(t);
      bubble('PAI, POSSO TE CONTAR', k.x + 60, FLOOR - 500, prog(t, 8.8, 8.95) * (1 - prog(t, 9.45, 9.6)), { size: 36, tail: -0.3, tailDir: -1 });
      bubble('UMA COISA?', k.x + 60, FLOOR - 415, prog(t, 8.95, 9.1) * (1 - prog(t, 9.45, 9.6)), { size: 36, tail: -0.3, tailDir: -1 });
      bubble('AGORA NÃO.', DADX - 60, FLOOR - 470, prog(t, 9.5, 9.65) * (1 - prog(t, 10.75, 10.9)), { size: 74, color: '#555', tail: 0.4, tailDir: 1 });
    }
    // ---------- 20 anos depois: os papéis se invertem ----------
    function scene4(t) {
      const os = 1.24;
      const ox = t < 12.1 ? lerp(120, KIDX, sm(t, S4.a, 12.1, lin)) : KIDX;
      const ow = walkPose(t * 4.2, t < 12.1 ? 0.55 : 0);
      const reachOut = sm(t, 12.2, 12.5) * (1 - sm(t, 13.1, 13.5));
      const tremble = Math.sin(t * 31) * 0.05;
      figure({ x: ox, y: FLOOR, s: os, hr: 22, dir: 1, lean: 0.5 + (t > 13.1 ? 0.12 * sm(t, 13.1, 13.5) : 0), headTilt: 0.15 + (t > 13.1 ? 0.35 * sm(t, 13.1, 13.5) : 0), legs: ow.legs, bob: ow.bob, arms: [[0.35, 0.35], [lerp(0.2, 1.45 + tremble, reachOut), lerp(0.25, 1.6 + tremble, reachOut)]], cane: 0 });
      dadPhone(t, { s: FS });
      bubble('FILHO, VAMOS CONVERSAR?', ox + 120, FLOOR - 470, prog(t, 12.2, 12.35) * (1 - prog(t, 12.75, 12.9)), { size: 36, color: '#555', tail: -0.6, tailDir: -1 });
      bubble('AGORA NÃO, PAI.', DADX - 60, FLOOR - 500, prog(t, 12.85, 13.0) * (1 - prog(t, 13.65, 13.8)), { size: 56, color: RED, tail: 0.3, tailDir: 1 });
    }
    // ---------- virada: de volta aos 4 anos ----------
    function scene5(t) {
      const ks = 0.6;
      // criança
      let kx = lerp(80, KIDX + 40, sm(t, T.run, T.show - 0.1, outC)), kp = t < T.show - 0.1 ? walkPose(t * 12, 1.2) : { legs: STANDL, bob: 0 };
      const hugK = sm(t, T.hug - 0.4, T.hug);
      kx = lerp(kx, DADX - 118, hugK);
      if (t > T.hug - 0.4 && t < T.hug) kp = walkPose(t * 9, 0.8);
      // pai
      const lk = sm(t, T.look, T.look + 0.3), pk = sm(t, T.pocket, T.pocket + 0.35), kn = sm(t, T.kneel, T.kneel + 0.5);
      const dlegs = lerpA(STANDL, KNEEL, kn), drop = 40 * FS * kn;
      const tilt = lerp(lerp(0.55, 0.15, lk), 0.05, kn);
      let darms = lerpA(A_PHONE, A_DOWN, pk);
      const show = t >= T.show && t < T.sim ? sm(t, T.show, T.show + 0.25) : 0;
      // segurando o desenho entre os dois e depois o abraço
      const kshx = kx + 0.08 * 66 * ks, kshy = FLOOR - 154 * ks;
      let dreach = null, kreach = null;
      if (t >= T.sim && hugK < 0.01) { const px = (kx + DADX) / 2 - 20, py = FLOOR - 120; dreach = [[0, px + 30, py, 1]]; kreach = [[0, px - 20, py + 10, 1]]; }
      if (hugK > 0) { dreach = [[0, kshx - 18, kshy + 18, 1], [1, kshx - 10, kshy + 40, 1]]; kreach = [[0, DADX - 34, FLOOR - 150 * FS + drop, -1], [1, DADX - 28, FLOOR - 130 * FS + drop, -1]]; }
      dadPhone(t, { tilt, arms: darms, on: 1 - pk, legs: dlegs, drop, lean: lerp(0.05, 0.25, kn), reach: dreach });
      const kf = figure({ x: kx, y: FLOOR, s: ks, hr: 31, dir: 1, lean: 0.08, headTilt: -0.2, legs: kp.legs, bob: kp.bob, arms: show > 0 ? lerpA(A_DOWN, [[2.6, 2.9], [2.5, 2.8]], show) : A_DOWN, reach: kreach });
      if (hugK < 0.5) { const hp = kf.hands[0]; if (t < T.sim) paper(hp[0] + 6, hp[1] - 18 * show, 1.0, show > 0.5 ? 0 : 0.8); else paper((kx + DADX) / 2, FLOOR - 140, 1.15, 0); }
      bubble('PAI, OLHA!', kx + 30, FLOOR - 330, prog(t, T.show, T.show + 0.15) * (1 - prog(t, T.show + 0.65, T.show + 0.8)), { size: 42, tail: -0.3, tailDir: -1 });
      bubble('AGORA SIM.', DADX - 20, FLOOR - 400, prog(t, T.sim, T.sim + 0.2) * (1 - prog(t, 23.9, 24.2)), { size: 64, tail: 0.3, tailDir: 1 });
      if (hugK > 0.5) { // corações? não: brilho branco suave do abraço
        const g = ctx.createRadialGradient(DADX - 60, FLOOR - 150, 10, DADX - 60, FLOOR - 150, 260); g.addColorStop(0, `rgba(255,236,200,${0.2 * hugK})`); g.addColorStop(1, 'rgba(255,236,200,0)'); ctx.fillStyle = g; ctx.fillRect(DADX - 330, FLOOR - 420, 540, 540); }
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    for (let k = 0; k < 4; k++) cue(0.25 + k * 0.25, 'step', { gain: 0.25 }); cue(0.5, 'ping'); cue(1.45, 'bubble'); cue(2.35, 'bubble', { gain: 0.6 }); cue(3.6, 'sigh');
    for (let k = 0; k < 4; k++) cue(3.6 + k * 0.4, 'step', { gain: 0.2 });
    for (const tt of [S1.b, S2.b, S3.b]) cue(tt - 0.05, 'whoosh');
    for (let k = 0; k < 4; k++) cue(4.7 + k * 0.22, 'step', { gain: 0.35 }); cue(5.4, 'bubble'); cue(6.15, 'bubble', { gain: 0.7 }); cue(6.6, 'ball'); cue(6.95, 'ball', { gain: 0.5 }); cue(7.25, 'ball', { gain: 0.3 }); cue(5.9, 'ping');
    for (let k = 0; k < 3; k++) cue(8.05 + k * 0.3, 'step', { gain: 0.4 }); cue(8.8, 'bubble'); cue(9.5, 'bubble', { gain: 0.8 }); cue(10.6, 'door');
    cue(S4.a + 0.1, 'tickstart'); cue(12.05, 'tickstop'); for (let k = 0; k < 3; k++) cue(11.3 + k * 0.6, 'step', { gain: 0.3 }); cue(12.2, 'bubble', { gain: 0.5 }); cue(12.45, 'ping'); cue(12.85, 'bubble', { gain: 0.8 });
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(T.v, 'whoosh'); for (let k = 0; k < 4; k++) cue(T.run + 0.1 + k * 0.2, 'step', { gain: 0.3 }); cue(T.show, 'bubble'); cue(T.pocket + 0.3, 'tap'); cue(T.kneel + 0.4, 'kneel'); cue(T.sim, 'bubble'); cue(T.hug, 'hold');
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const z = 1.45 * (1 + 0.06 * sm(t, T.v, 26)), camX = t < T.v ? 560 : lerp(560, 620, sm(t, T.v, T.hug + 1));
      ctx.save(); ctx.translate(540, 1520); ctx.scale(z, z); ctx.translate(-camX, -FLOOR); ctx.drawImage(bgc, 0, 0);
      if (t < S1.b + 0.1) scene1(t); else if (t < S2.b + 0.1) scene2(t); else if (t < S3.b + 0.1) scene3(t); else if (t < T.v) scene4(t); else scene5(t);
      ctx.restore();
      for (const e of [S1.b, S2.b, S3.b, T.v]) { const k = prog(t, e - 0.2, e + 0.1) * (1 - prog(t, e + 0.15, e + 0.45)); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[0.3, S1.b - 0.3, '4 ANOS'], [S2.a, S2.b - 0.3, '9 ANOS'], [S3.a, S3.b - 0.3, '15 ANOS'], [S4.a, S4.b - 0.4, '20 ANOS DEPOIS'], [T.v + 0.1, T.hug + 1.5, 'MAS HOJE ELE TEM 4 ANOS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      // gancho
      const h1 = prog(t, 0.05, 0.35) * (1 - prog(t, 4.0, 4.3)); if (h1 > 0) { spaced('QUANTAS VEZES', 540, 330, 60, { a: h1, w: 900, sp: 10 }); spaced('VOCÊ JÁ DISSE', 540, 420, 60, { a: h1 * prog(t, 0.25, 0.55), w: 900, sp: 10 }); spaced('"AGORA NÃO"?', 540, 515, 62, { a: h1 * prog(t, 0.6, 0.9), w: 900, sp: 10, color: RED }); }
      // HEADLINE
      const dim = prog(t, T.dimA, T.dimA + 0.3) * (1 - prog(t, T.dimB - 0.4, T.dimB)); if (dim > 0) { ga(0.9 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['ELE APRENDEU', WHITE], ['A RESPOSTA', WHITE], ['COM VOCÊ:', WHITE], ['"AGORA NÃO."', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; const size = fit(s, i === 3 ? 150 : 120); txt(s, 540, 640 + i * 150 + (i === 3 ? 70 : 0), size, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.62 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('ANTES QUE ELE', 540, 430, fit('ANTES QUE ELE', 124), { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('PARE DE', 540, 570, 124, { a: prog(t, T.fin + 0.35, T.fin + 0.7), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.35, T.fin + 0.85))) });
        txt('PEDIR.', 540, 715, 150, { color: RED, a: prog(t, T.fin + 0.8, T.fin + 1.1), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.8, T.fin + 1.3))), glow: 'rgba(224,38,43,0.55)' });
        spaced('HOJE, DIGA: AGORA SIM.', 540, 860, 42, { a: prog(t, 26.6, 27.2), w: 800, sp: 7 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 27.4, 28.0), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
