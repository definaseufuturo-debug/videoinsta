/*
 * "O BILHETE NA LANCHEIRA": a mãe põe um bilhete "te amo" na lancheira aos 6, 10 e 14 anos; ele mostra, esconde, ignora; aos 17 acha o bilhete antigo na mochila. Bonequinhos de palito, 30 s. Vermelho = o bilhete. (Pv 3:3)
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
    const HOLD_A = [[0.9, 0.7], [0.9, 0.7]], DOWN_A = [[0.1, 0.15], [-0.08, 0.1]], PUT_A = [[1.2, 1.4], [1.05, 1.25]], CHEER = [[2.6, 2.8], [2.5, 2.7]];
    const PH = [{ in: 0.3, end: 8.0, ks: 0.55, kx: 328 }, { in: 8.4, end: 13.6, ks: 0.8, kx: 322 }, { in: 14.0, end: 18.6, ks: 1.0, kx: 316 }];
    const P4 = { in: 19.0, end: 22.0 }, P5 = { in: 22.2, take: 24.4, hug: 25.4 }, FIN = 26.8;
    const TABLEX = [370, 470], TOPY = FLOOR - 150, BOXX = 415;
    function kitchen() { ctx.fillStyle = '#16151b'; ctx.fillRect(-300, -800, 1800, FLOOR + 800); ctx.fillStyle = '#1b1a1f'; ctx.fillRect(-300, FLOOR, 1800, 900); ctx.fillStyle = '#34343a'; ctx.fillRect(-300, FLOOR, 1800, 3);
      ctx.save(); ctx.strokeStyle = '#6a6a72'; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.rect(690, FLOOR - 470, 150, 170); ctx.moveTo(765, FLOOR - 470); ctx.lineTo(765, FLOOR - 300); ctx.moveTo(690, FLOOR - 385); ctx.lineTo(840, FLOOR - 385); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(TABLEX[0] - 20, TOPY); ctx.lineTo(TABLEX[1] + 20, TOPY); ctx.moveTo(TABLEX[0], TOPY); ctx.lineTo(TABLEX[0], FLOOR); ctx.moveTo(TABLEX[1], TOPY); ctx.lineTo(TABLEX[1], FLOOR); ctx.stroke(); ctx.restore(); }
    function lunch(x, y, noteK, a = 1) { ctx.save(); ctx.translate(x, y); ga(a); ctx.strokeStyle = '#b8b8c0'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.roundRect(-34, -40, 68, 40, 8); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -40, 16, Math.PI, 0); ctx.stroke(); ctx.restore(); if (noteK > 0) noteObj(x + 6, y - 50 * noteK - 6 + 10, 0.55, 0.2 * 0, a * noteK); ga(1); }
    function noteObj(x, y, k, crumple = 0, a = 1) { if (k <= 0 || a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ga(a); ctx.shadowColor = 'rgba(224,38,43,0.9)'; ctx.shadowBlur = 24; ctx.fillStyle = RED; ctx.beginPath();
      if (crumple > 0) { ctx.moveTo(-22, -18); ctx.lineTo(-6, -26); ctx.lineTo(14, -20); ctx.lineTo(24, -4); ctx.lineTo(16, 16); ctx.lineTo(-4, 24); ctx.lineTo(-20, 14); ctx.lineTo(-26, -2); ctx.closePath(); } else ctx.roundRect(-24, -30, 48, 60, 4); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 4; if (crumple === 0) { ctx.beginPath(); ctx.moveTo(-14, -16); ctx.lineTo(14, -16); ctx.moveTo(-14, -4); ctx.lineTo(14, -4); ctx.stroke(); txt('♥', 0, 14, 22, { color: '#fff' }); } ctx.restore(); ga(1); }
    function pack(x, a = 1) { ctx.save(); ga(a); ctx.strokeStyle = '#8a8a92'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.roundRect(x - 34, FLOOR - 84, 68, 84, 14); ctx.stroke(); ctx.beginPath(); ctx.roundRect(x - 22, FLOOR - 46, 44, 30, 8); ctx.stroke(); ctx.restore(); ga(1); }
    const mom = (o) => figure(Object.assign({ x: 560, y: FLOOR, s: FS, dir: -1, hr: 25, legs: STANDL }, o));
    function scenePh(i, t) {
      const P = PH[i], u = t - P.in, fade = 1 - sm(t, P.end - 0.4, P.end); kitchen(); if (i > 0) pack(130, fade);
      const reach = sm(u, 0.4, 1.0) * (1 - sm(u, 1.6, 2.0)), put = sm(u, 1.1, 1.5);
      mom({ arms: lerpA(DOWN_A, PUT_A, reach), lean: 0.1 + 0.25 * reach, headTilt: 0.05, a: fade });
      const arr = sm(u, 1.7, 2.7), take = u > 3.0;
      let kx = lerp(190, P.kx, arr), kd = 1, kl = STANDL, kb = 0, ka = DOWN_A, kfade = fade, lunchX = BOXX, lunchY = TOPY, hasNote = 1;
      if (arr > 0 && arr < 1) { const w = walkPose(t * 8, 0.9); kl = w.legs; kb = w.bob; }
      if (i === 0) { const cheer = sm(u, 3.2, 3.5); ka = lerpA(DOWN_A, CHEER, cheer); kb = -Math.abs(Math.sin(u * 7)) * 10 * cheer; if (u > 3.0) { lunchX = kx + 20; lunchY = FLOOR - 70; } }
      if (i === 1) { const rd = sm(u, 3.0, 3.4); ka = lerpA(DOWN_A, [[1.0, 1.4], [1.0, 1.4]], rd); if (u > 3.0) { lunchX = kx + 60; lunchY = TOPY; } }
      if (i === 2) { const go = sm(u, 2.9, 4.3); if (u > 2.9) { kx = lerp(P.kx, -80, go); kd = -1; const w = walkPose(t * 8, 1); kl = w.legs; kb = w.bob; ka = HOLD_A; lunchX = kx - 50; lunchY = FLOOR - 60; } kfade = fade * (1 - prog(u, 4.0, 4.4)); }
      const kfig = figure({ x: kx, y: FLOOR, s: FS * P.ks, dir: kd, lean: i === 1 ? 0.12 : 0.05, headTilt: i === 1 ? 0.2 * sm(u, 3.2, 3.6) : 0, arms: ka, legs: kl, bob: kb, hr: [30, 27, 24][i], a: kfade });
      // bilhete e lancheira
      if (i === 0) { const nx = take ? kfig.hands[0][0] : BOXX + 6; const ny = take ? kfig.hands[0][1] - 20 - 20 * sm(u, 3.2, 3.5) : TOPY - 56; lunch(take ? lunchX : BOXX, take ? lunchY : TOPY, 0, fade); noteObj(take ? lerp(BOXX + 6, nx, sm(u, 3.0, 3.3)) : BOXX + 6, take ? lerp(TOPY - 56, ny, sm(u, 3.0, 3.3)) : TOPY - 56, 1 * put, 0, fade); }
      else if (i === 1) { lunch(BOXX, TOPY, 0, fade); const pk = sm(u, 3.5, 4.3, x => x); if (u < 3.4) noteObj(BOXX + 6, TOPY - 56, put, 0, fade); else { const nx = lerp(BOXX + 6, 130, pk), ny = lerp(TOPY - 56, FLOOR - 70, pk) - Math.sin(pk * Math.PI) * 130; noteObj(nx, ny, 1 - 0.3 * pk, pk > 0.2 ? 1 : 0, fade * (1 - prog(pk, 0.92, 1))); } }
      else { if (u < 2.9) { lunch(BOXX, TOPY, put, fade); } else lunch(lunchX, lunchY, 1, kfade); }
      if (i === 0 && u > 3.6) { const fr = sm(u, 3.9, 5.0); [[110, 0.5], [60, 0.45]].forEach(([x0, s], j) => figure({ x: lerp(x0 - 120, 190 + j * 80, fr), y: FLOOR, s: FS * s, dir: 1, legs: STANDL, arms: lerpA(DOWN_A, CHEER, sm(u, 5.0 + j * 0.2, 5.3 + j * 0.2)), bob: fr < 1 ? walkPose(t * 9, 0.8).bob : -Math.abs(Math.sin(u * 8)) * 6, hr: 26, a: fade * sm(u, 3.9, 4.3) })); bubble('QUE LEGAL!', 160, FLOOR - 270, prog(u, 5.4, 5.7) * (1 - prog(u, 7.0, 7.2)), { size: 28, tail: -0.5 }); }
      if (i === 1) bubble('...', kx + 20, FLOOR - 340, prog(u, 3.3, 3.5) * (1 - prog(u, 4.3, 4.5)), { size: 34, tail: -0.5 });
    }
    function sceneSil(t) {
      kitchen(); const lk = prog(t, P4.in, P4.in + 0.6) * (1 - prog(t, P4.end - 0.4, P4.end));
      mom({ x: 520, dir: 1, lean: 0.1, headTilt: 0.18, arms: DOWN_A, a: lk }); lunch(BOXX + 10, TOPY, 0, lk * 0.0);
      ctx.save(); ga(lk * 0.9); ctx.restore(); spaced('SILÊNCIO.', 520, 1050, 40, { a: lk * 0.9, w: 800, sp: 10 });
    }
    function sceneEnd(t) {
      kitchen(); const u = t - P5.in; pack(700);
      const wk = sm(t, P5.in, P5.in + 1.8), x = lerp(250, 650, wk), bend = sm(t, P5.in + 1.8, P5.take - 0.2) * (1 - sm(t, P5.take + 0.4, P5.take + 0.9));
      const wpz = walkPose(t * 8, 1), walking = wk > 0 && wk < 1, hugK = sm(t, P5.take + 0.4, P5.hug + 0.5);
      const arms = t < P5.take ? lerpA(DOWN_A, [[1.0, 0.9], [1.0, 0.9]], bend) : lerpA([[1.0, 0.9], [1.0, 0.9]], [[1.9, 2.5], [1.75, 2.35]], hugK);
      const m = figure({ x, y: FLOOR, s: FS * 1.0, dir: 1, lean: 0.1 + 0.5 * bend, headTilt: 0.05 + 0.1 * hugK, arms, legs: walking ? wpz.legs : STANDL, bob: walking ? wpz.bob : 0, hr: 25 });
      if (t < P5.take) noteObj(700 + 6, FLOOR - 70, sm(t, P5.in + 1.8, P5.in + 2.3) * 0 + 0.0, 1, 1);
      if (t < P5.take) { if (t > P5.in + 1.6) noteObj(704, FLOOR - 56, 0.9, 1, 1); } else { const k = sm(t, P5.take, P5.take + 0.7); noteObj(lerp(704, m.hands[0][0] - 4, k), lerp(FLOOR - 56, m.hands[0][1] - 10, k), lerp(0.9, 1.0, k) * (1 - 0.2 * hugK), 1 - 1 * sm(t, P5.take + 0.9, P5.take + 1.4) * 0, 1); }
    }
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    PH.forEach((P, i) => { cue(P.in + 1.2, 'page'); for (let k = 0; k < 5; k++) cue(P.in + 1.8 + k * 0.25, 'step', { gain: 0.25 }); cue(P.in + 3.0, 'pop'); cue(P.end - 0.3, 'toggle'); });
    cue(PH[0].in + 5.4, 'pop'); cue(PH[1].in + 3.6, 'page'); cue(PH[2].in + 3.2, 'creak'); cue(P4.in, 'sigh'); for (let k = 0; k < 5; k++) cue(P5.in + 0.2 + k * 0.4, 'step', { gain: 0.3 }); cue(P5.take, 'page'); cue(P5.hug, 'warm'); cue(FIN, 'final');
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(540, 1500); ctx.scale(1.4, 1.4); ctx.translate(-480, -FLOOR); if (t >= P5.in - 0.3) sceneEnd(t); else if (t >= P4.in - 0.3) sceneSil(t); else { const i = PH.filter(a => t >= a.in - 0.3).length - 1; scenePh(Math.max(0, i), t); } ctx.restore(); ga(1);
      for (const a of [...PH, P4]) { const k = Math.max(prog(t, a.end - 0.2, a.end + 0.1) * (1 - prog(t, a.end + 0.15, a.end + 0.45)), 0); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[3.5, 7.9, '6 ANOS'], [8.8, 13.5, '10 ANOS'], [14.4, 18.5, '14 ANOS'], [22.5, 26.5, '17 ANOS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      const h1 = prog(t, 0.0, 0.25) * (1 - prog(t, 3.0, 3.3)); if (h1 > 0) { txt('O BILHETE NA', 540, 300, 100, { a: h1 }); txt('LANCHEIRA QUE', 540, 420, 100, { a: h1 * prog(t, 0.1, 0.4) }); txt('ELE FINGE NÃO LER', 540, 540, 82, { a: h1 * prog(t, 0.2, 0.55) }); }
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.88 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        ['AMOR QUE ELE', 'NÃO RESPONDE', 'AINDA É AMOR', 'QUE ELE GUARDA.'].forEach((s, i) => { const a0 = FIN + i * 0.45; txt(s, 540, 470 + i * 150, i === 3 ? 92 : 100, { a: prog(t, a0, a0 + 0.3), scale: lerp(1.25, 1, outC(prog(t, a0, a0 + 0.5))), color: i === 3 ? RED : WHITE, glow: i === 3 ? 'rgba(224,38,43,0.55)' : undefined }); });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 28.6, 29.2), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
