/*
 * "A BAGUNÇA QUE VAI FAZER FALTA": a mãe junta brinquedos aos 3, 6 e 10 anos (cada vez há menos); aos 16 a sala está limpa e vazia; ela acha um carrinho vermelho embaixo do sofá e o abraça. Bonequinhos de palito, 30 s. Vermelho = o carrinho. (Sl 127:3)
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
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const lerpA = (A, B, k) => A.map((p, i) => p.map((v, j) => lerp(v, B[i][j], k)));
  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c', AMBER = '#ffd9a0';
  const FLOOR = 1390, FS = 1.45, Z = 1.6, CAMX = 655;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }
    // ---------- bonequinho (mesmo motor dos vídeos campeões) ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s, dir = o.dir || 1, hr = o.hr || 23; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = WHITE; ctx.fillStyle = WHITE; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = 'rgba(255,255,255,0.25)'; ctx.shadowBlur = 10;
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      for (const [a, b] of o.legs) limb(0, hipY, a, b, 48, 46);
      const hands = o.arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const tilt = o.headTilt || 0, hx = shX + Math.sin(lean + tilt) * (hr + 11), hy = shY - Math.cos(lean + tilt) * (hr + 11);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (o.eyes !== false) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill(); }
      ctx.restore(); ga(1);
      return { head: [o.x + dir * hx * s, o.y + hy * s], hands: hands.map(([x, y]) => [o.x + dir * x * s, o.y + y * s]) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const STANDL = [[0.1, 0.06], [-0.1, -0.06]];
    const CARRYL = [[1.35, 0.35], [1.2, 0.25]];
    const A_DOWN = [[0.15, 0.2], [-0.1, 0.1]], A_GRAB = [[0.9, 0.55], [0.8, 0.45]], A_HOLD2 = [[0.95, 1.7], [1.05, 1.85]], A_BACK = [[0.15, 0.2], [-0.7, 0.25]];
    const K_LIMP = [[0.25, 0.2], [0.05, 0.1]], K_HUG = [[1.9, 2.5], [1.75, 2.35]];
    const carryPos = (fx, d, ks) => ({ x: fx + d * 82, y: FLOOR - 172 + 92 * ks });
    const seatY = s => FLOOR - 155 + 192 * s;

    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 38, w = tw(s, size) + 56, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 24); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 14, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 26, h / 2 + 30); ctx.lineTo(tx + 16, h / 2 - 2); ctx.fill();
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 640, 50, { w: 900, sp: 12 }); ctx.fillStyle = RED; ctx.fillRect(470, 686, 140, 5); ctx.restore(); ga(1); }
    const GRAY = '#cfcfcf';
    const PH = [{ in: 0.3, end: 8.8, toys: [690, 625, 560, 495, 430, 365, 300], ks: 0.5 }, { in: 9.2, end: 14.6, toys: [680, 560, 440, 320], ks: 0.65 }, { in: 15.0, end: 19.6, toys: [600, 380], ks: 0.8 }];
    const P4 = { in: 20.0, end: 22.6 }, P5 = { in: 22.8, car: 23.1, pick: 24.6, hug: 25.0 }, FIN = 26.8;
    const HOLD_A = [[0.9, 0.7], [0.9, 0.7]], K_HUGA = [[1.9, 2.5], [1.75, 2.35]], DOWN_A = [[0.1, 0.15], [-0.08, 0.1]];
    const pickT = (P, j) => P.in + 1.6 + j * ((P.end - P.in - 3.4) / Math.max(1, P.toys.length - 1));
    function toyShape(x, y, j, k, a) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ga(a); ctx.strokeStyle = GRAY; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); const m = j % 3; if (m === 0) ctx.rect(-24, -24, 48, 48); else if (m === 1) ctx.arc(0, 0, 26, 0, TAU); else { ctx.moveTo(-28, 22); ctx.lineTo(28, 22); ctx.lineTo(0, -28); ctx.closePath(); } ctx.stroke(); ctx.restore(); ga(1); }
    function sofa() { ctx.save(); ctx.strokeStyle = '#6a6a72'; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.roundRect(760, FLOOR - 330, 330, 190, 22); ctx.stroke(); ctx.beginPath(); ctx.roundRect(740, FLOOR - 150, 370, 110, 18); ctx.stroke(); ctx.beginPath(); ctx.moveTo(775, FLOOR - 40); ctx.lineTo(775, FLOOR); ctx.moveTo(1080, FLOOR - 40); ctx.lineTo(1080, FLOOR); ctx.stroke(); ctx.restore(); }
    function door(open) { ctx.save(); ctx.strokeStyle = '#6a6a72'; ctx.lineWidth = 7; ctx.beginPath(); ctx.rect(110, FLOOR - 330, 120, 330); ctx.stroke(); ctx.fillStyle = '#6a6a72'; ctx.beginPath(); ctx.arc(205, FLOOR - 160, 9, 0, TAU); ctx.fill(); ctx.restore(); }
    function room(t) { ctx.fillStyle = '#16151b'; ctx.fillRect(-300, -800, 1800, FLOOR + 800); ctx.fillStyle = '#1b1a1f'; ctx.fillRect(-300, FLOOR, 1800, 900); ctx.fillStyle = '#34343a'; ctx.fillRect(-300, FLOOR, 1800, 3); sofa(); door(); }
    function carObj(x, y, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.shadowColor = 'rgba(224,38,43,0.9)'; ctx.shadowBlur = 24; ctx.fillStyle = RED; ctx.beginPath(); ctx.roundRect(-40, -22, 80, 28, 8); ctx.fill(); ctx.beginPath(); ctx.roundRect(-22, -40, 44, 24, 8); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#16151b'; for (const wx of [-24, 24]) { ctx.beginPath(); ctx.arc(wx, 6, 11, 0, TAU); ctx.fill(); ctx.strokeStyle = RED; ctx.lineWidth = 4; ctx.stroke(); } ctx.restore(); }
    // mãe: caminho por waypoints
    function momX(P, t) { const wp = [[P.in - 1, 880]]; P.toys.forEach((x, j) => { const tp = pickT(P, j); wp.push([tp - 0.5, x + 75]); wp.push([tp + 0.4, x + 75]); }); wp.push([P.end + 1, wp[wp.length - 1][1]]); for (let i = 1; i < wp.length; i++) if (t <= wp[i][0]) { const k = sm(t, wp[i - 1][0], wp[i][0]); return lerp(wp[i - 1][1], wp[i][1], k); } return wp[wp.length - 1][1]; }
    function scenePh(i, t) {
      const P = PH[i], u = t - P.in, fade = 1 - sm(t, P.end - 0.4, P.end);
      room(t);
      const mx = momX(P, t), mv = Math.abs(momX(P, t + 0.05) - momX(P, t - 0.05));
      let bend = 0, carry = null; P.toys.forEach((x, j) => { const tp = pickT(P, j); bend = Math.max(bend, 1 - Math.abs(t - tp - 0.1) / 0.45); });
      bend = clamp(bend);
      const walking = mv > 4, wpz = walkPose(t * 9, 1);
      const m = figure({ x: mx, y: FLOOR, s: FS, dir: -1, lean: 0.12 + 0.5 * bend, headTilt: 0.05, arms: bend > 0.05 ? lerpA(DOWN_A, HOLD_A, bend) : DOWN_A, legs: walking ? wpz.legs : STANDL, bob: walking ? wpz.bob : 0, hr: 25, a: fade });
      P.toys.forEach((x, j) => { const tp = pickT(P, j); if (t < tp + 0.1) toyShape(x, FLOOR - 20, j, 1, fade); else if (t < tp + 0.7) { const k = prog(t, tp + 0.1, tp + 0.7); toyShape(lerp(x, m.hands[0][0], k), lerp(FLOOR - 20, m.hands[0][1], k), j, 1 - k * 0.6, fade * (1 - k)); } });
      // criança
      const ks = P.ks, cs = FS * ks; let cx = 270 + 25 * Math.sin(u * 2.4), cd = 1, cp = { legs: STANDL, bob: -Math.abs(Math.sin(u * 5)) * 8 * (1 - i * 0.35) }, ca = [[2.6 + 0.3 * Math.sin(u * 6), 2.8], [-0.2, 0.1]];
      if (i === 1) ca = [[1.5, 1.3], [1.4, 1.2]];
      let cfade = fade;
      if (i === 2) { const lk = sm(t, 17.2, 19.0); cx = lerp(340, 170, lk); cd = -1; cp = lk < 1 && lk > 0 ? walkPose(t * 7, 0.8) : { legs: STANDL, bob: 0 }; ca = DOWN_A; cfade = fade * (1 - prog(t, 18.6, 19.0)); }
      figure({ x: cx, y: FLOOR, s: cs, dir: cd, lean: i === 2 ? 0.05 : 0.1, arms: ca, legs: cp.legs, bob: cp.bob, hr: [30, 28, 26][i], a: cfade });
      if (i === 1) bubble('POR QUÊ?', cx + 70, FLOOR - 330, prog(u, 1.0, 1.2) * (1 - prog(u, 2.4, 2.6)), { size: 30, tail: -0.5 });
    }
    function sceneEnd(t) {
      room(t);
      if (t < P5.in - 0.2) { const lk = prog(t, P4.in, P4.in + 0.6) * (1 - prog(t, P4.end - 0.4, P4.end)); figure({ x: 500, y: FLOOR, s: FS, dir: 1, lean: 0.1, headTilt: 0.18, arms: DOWN_A, legs: STANDL, hr: 25, a: lk }); spaced('SILÊNCIO.', 500, 1050, 40, { a: lk * 0.9, w: 800, sp: 10 }); return; }
      const wk = sm(t, P5.in, P5.car + 0.8), x = lerp(380, 735, wk), cr = sm(t, P5.car + 0.6, P5.car + 1.2) * (1 - sm(t, P5.pick, P5.pick + 0.6));
      const wpz = walkPose(t * 8, 1), walking = wk > 0 && wk < 1;
      const car = sm(t, P5.car, P5.car + 0.6) * (t < P5.pick ? 1 : 0);
      const hugK = sm(t, P5.pick, P5.hug + 0.5);
      const arms = t < P5.pick ? lerpA(DOWN_A, [[1.0, 0.8], [1.0, 0.8]], cr) : lerpA([[1.0, 0.8], [1.0, 0.8]], K_HUGA, hugK);
      const m = figure({ x, y: FLOOR, s: FS, dir: 1, lean: 0.12 + 0.5 * cr, headTilt: 0.05 + 0.1 * hugK, arms, legs: walking ? wpz.legs : STANDL, bob: walking ? wpz.bob : 0, hr: 25 });
      if (t < P5.pick) carObj(840, FLOOR - 18, car); else carObj(lerp(840, m.hands[0][0] - 6, sm(t, P5.pick, P5.pick + 0.7)), lerp(FLOOR - 18, m.hands[0][1], sm(t, P5.pick, P5.pick + 0.7)), 1 - 0.25 * hugK);
    }
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    PH.forEach(P => { P.toys.forEach((x, j) => cue(pickT(P, j) + 0.1, 'pop')); for (let k = 0; k < 8; k++) cue(P.in + 0.4 + k * 0.9, 'step', { gain: 0.25 }); cue(P.end - 0.3, 'toggle'); });
    cue(PH[2].in + 2.4, 'creak'); cue(P4.in, 'sigh'); for (let k = 0; k < 4; k++) cue(P5.in + 0.2 + k * 0.5, 'step', { gain: 0.3 }); cue(P5.car, 'pop'); cue(P5.pick, 'pop'); cue(P5.hug, 'warm'); cue(FIN, 'final');
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(540, 1500); ctx.scale(1.4, 1.4); ctx.translate(-500, -FLOOR); if (t >= P4.in - 0.3) sceneEnd(t); else { const i = PH.filter(a => t >= a.in - 0.3).length - 1; scenePh(Math.max(0, i), t); } ctx.restore(); ga(1);
      for (const a of [...PH, P4]) { const k = Math.max(prog(t, a.end - 0.2, a.end + 0.1) * (1 - prog(t, a.end + 0.15, a.end + 0.45)), 0); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[3.5, 8.6, '3 ANOS'], [9.3, 14.5, '6 ANOS'], [15.1, 19.5, '10 ANOS'], [20.1, 22.4, '16 ANOS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      const h1 = prog(t, 0.0, 0.25) * (1 - prog(t, 3.0, 3.3)); if (h1 > 0) { txt('A BAGUNÇA QUE', 540, 300, 100, { a: h1 }); txt('VOCÊ VAI SENTIR', 540, 420, 100, { a: h1 * prog(t, 0.1, 0.4) }); txt('SAUDADE', 540, 540, 116, { a: h1 * prog(t, 0.2, 0.55) }); }
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.88 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        ['A BAGUNÇA É', 'O BARULHO', 'DE QUEM AINDA', 'MORA AQUI.'].forEach((s, i) => { const a0 = FIN + i * 0.45; txt(s, 540, 470 + i * 150, 104, { a: prog(t, a0, a0 + 0.3), scale: lerp(1.25, 1, outC(prog(t, a0, a0 + 0.5))), color: i === 3 ? RED : WHITE, glow: i === 3 ? 'rgba(224,38,43,0.55)' : undefined }); });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 28.6, 29.2), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
