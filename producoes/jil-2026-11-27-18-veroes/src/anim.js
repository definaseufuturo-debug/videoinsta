/*
 * "18 VERÕES": um pote com 18 bolinhas; uma cai a cada verão (3, 7, 12, 16 anos); no último os dois se abraçam. Bonequinhos de palito, 30 s. Vermelho = a bolinha que cai. (Sl 90:12)
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
    const PH = [{ in: 0.3, end: 7.2, sum: 3, rem: 15, drop: 3, dt: 3.1 }, { in: 7.6, end: 13.2, sum: 7, rem: 11, drop: 4 }, { in: 13.6, end: 19.2, sum: 12, rem: 6, drop: 5 }, { in: 19.6, end: 26.4, sum: 16, rem: 2, drop: 4 }];
    const FIN = 26.6, HUG = 23.6;
    const DOWN_A = [[0.1, 0.15], [-0.08, 0.1]], K_HUGA = [[1.9, 2.5], [1.75, 2.35]], OPENA = [[1.35, 1.35], [1.2, 1.3]];
    const JX = 540, JY = 840;
    const bpos = i => [JX - 130 + (i % 6) * 52, JY + 80 - Math.floor(i / 6) * 52];
    function remaining(t) { let r = 18; for (const P of PH) { const t0 = P.in + (P.dt || 0.3); if (t >= t0) r = P.rem + Math.max(0, P.drop - Math.floor((t - t0) / 0.28) - 1); if (t >= t0 + P.drop * 0.28) r = P.rem; } return r; }
    function jar(t) {
      ctx.save(); ctx.strokeStyle = GRAY; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(JX - 170, JY - 130); ctx.lineTo(JX - 170, JY + 120); ctx.quadraticCurveTo(JX - 170, JY + 135, JX - 150, JY + 135); ctx.lineTo(JX + 150, JY + 135); ctx.quadraticCurveTo(JX + 170, JY + 135, JX + 170, JY + 120); ctx.lineTo(JX + 170, JY - 130); ctx.stroke(); ctx.beginPath(); ctx.moveTo(JX - 190, JY - 130); ctx.lineTo(JX + 190, JY - 130); ctx.stroke();
      const rem = remaining(t); ctx.fillStyle = WHITE; for (let i = 0; i < rem; i++) { const [x, y] = bpos(i); ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill(); } ctx.restore();
      // bolinhas caindo (vermelhas)
      for (const P of PH) for (let k = 0; k < P.drop; k++) { const i = P.rem + (P.drop - 1 - k), t0 = P.in + (P.dt || 0.3) + k * 0.28, u = t - t0; if (u < 0 || u > 1.5) continue; const [x0, y0] = bpos(i + 0); const rise = prog(u, 0, 0.3), fall = prog(u, 0.3, 1.3); const x = lerp(x0, JX + (k % 2 ? 200 : -200), outC(rise) * 0.7 + fall * 0.3), y = fall > 0 ? lerp(JY - 190, JY + 240, fall * fall) : lerp(y0, JY - 190, outC(rise)); ctx.save(); ga(1 - prog(u, 1.1, 1.5)); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.9)'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill(); ctx.restore(); }
      ga(1);
    }
    function ground() { ctx.fillStyle = '#16151b'; ctx.fillRect(-300, -800, 1800, FLOOR + 800); ctx.fillStyle = '#1b1a1f'; ctx.fillRect(-300, FLOOR, 1800, 900); ctx.fillStyle = '#34343a'; ctx.fillRect(-300, FLOOR, 1800, 3); for (let k = -3; k < 16; k++) { ctx.fillStyle = '#2a2930'; ctx.fillRect(k * 100, FLOOR + 30, 56, 6); } }
    function kite(x, y, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(0.15 * Math.sin(t * 2.2)); ctx.strokeStyle = GRAY; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(42, 0); ctx.lineTo(0, 70); ctx.lineTo(-42, 0); ctx.closePath(); ctx.moveTo(0, -60); ctx.lineTo(0, 70); ctx.moveTo(-42, 0); ctx.lineTo(42, 0); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 70); for (let k = 1; k <= 6; k++) ctx.lineTo(Math.sin(t * 4 + k) * 14, 70 + k * 26); ctx.stroke(); ctx.restore(); }
    function sceneP(i, t) {
      const P = PH[i], u = t - P.in, fade = 1 - sm(t, P.end - 0.4, P.end);
      ground(); const wp = walkPose(t * 7, 0.9);
      if (i === 0) {
        const px = 230 + 38 * u, wk = walkPose(t * 7, 0.8), ks = 0.5;
        figure({ x: px, y: FLOOR, s: FS, dir: 1, lean: 0.08, headTilt: 0.05, arms: [[1.2, 0.8], [0.1, 0.2]], legs: wk.legs, bob: wk.bob, hr: 25, a: fade });
        figure({ x: px + 118, y: FLOOR, s: FS * ks, dir: 1, lean: 0.06, arms: [[-1.0, -0.5], [0.3, 0.3]], legs: walkPose(t * 9, 0.9).legs, bob: walkPose(t * 9, 0.9).bob * 0.5, hr: 30, a: fade });
      } else if (i === 1) {
        const ks = 0.65, cx = 420, ch = figure({ x: cx, y: FLOOR, s: FS * ks, dir: 1, lean: -0.1, arms: [[2.4 + 0.1 * Math.sin(u * 3), 2.7], [1.0, 1.4]], legs: STANDL, hr: 28, a: fade });
        figure({ x: 290, y: FLOOR, s: FS, dir: 1, lean: -0.05, headTilt: -0.1, arms: [[2.7 + 0.2 * Math.sin(u * 6), 2.9], [2.5 + 0.2 * Math.sin(u * 6 + 1), 2.8]], legs: STANDL, hr: 25, a: fade });
        const kx = 700 + 30 * Math.sin(u * 1.3), ky = 1160 + 20 * Math.sin(u * 1.9); ga(fade); ctx.save(); ctx.strokeStyle = 'rgba(207,207,207,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ch.hands[0][0], ch.hands[0][1]); ctx.lineTo(kx, ky - 60); ctx.stroke(); ctx.restore(); kite(kx, ky, t); ga(1);
      } else if (i === 2) {
        const lk = sm(t, P.in + 0.6, P.end - 0.5, x => x), cx = lerp(560, 800, lk), mv = lk > 0 && lk < 1, cw = walkPose(t * 7, 0.8);
        figure({ x: cx, y: FLOOR, s: FS * 0.85, dir: 1, lean: 0.05, arms: DOWN_A, legs: mv ? cw.legs : STANDL, bob: mv ? cw.bob * 0.6 : 0, hr: 26, a: fade });
        figure({ x: 380, y: FLOOR, s: FS, dir: 1, lean: 0.1, headTilt: 0.12, arms: [[0.4 + 0.3 * sm(t, P.in + 2.5, P.in + 3), 0.6], [0.1, 0.2]], legs: STANDL, hr: 25, a: fade });
      } else {
        const wk = sm(t, P.in + 0.3, P.in + 3.0), px = lerp(260, 600, wk), mv = wk > 0 && wk < 1, pw = walkPose(t * 7, 0.9), turn = t > HUG - 0.4;
        const ho = sm(t, P.in + 3.1, P.in + 3.5), hk = sm(t, HUG, HUG + 0.6);
        figure({ x: px, y: FLOOR, s: FS, dir: 1, lean: 0.08 - 0.05 * hk, headTilt: 0.08, arms: lerpA(lerpA(DOWN_A, OPENA, ho), K_HUGA, hk), legs: mv ? pw.legs : STANDL, bob: mv ? pw.bob : 0, hr: 25 });
        figure({ x: 705, y: FLOOR, s: FS * 0.95, dir: turn ? -1 : 1, lean: 0.06, headTilt: turn ? 0.06 : 0.2, arms: turn ? lerpA(DOWN_A, K_HUGA, hk) : DOWN_A, legs: STANDL, hr: 25 });
        if (t > HUG + 0.3) { const k = prog(t, HUG + 0.3, HUG + 1.6); txt('♥', 655, FLOOR - 560 - k * 100, 72, { color: WHITE, a: Math.sin(k * Math.PI) }); }
      }
    }
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    PH.forEach((P, i) => { for (let k = 0; k < 7; k++) cue(P.in + 0.4 + k * 0.9, 'step', { gain: 0.25 }); for (let k = 0; k < P.drop; k++) cue(P.in + (P.dt || 0.3) + k * 0.28 + 0.9, 'pop', { gain: 0.5 }); cue(P.end - 0.3, 'toggle'); });
    cue(PH[2].in, 'sigh'); cue(PH[1].in + 1.5, 'pop'); cue(HUG, 'warm'); cue(FIN, 'final');
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const i = Math.max(0, PH.filter(a => t >= a.in - 0.3).length - 1);
      ctx.save(); ctx.translate(540, 1620); ctx.scale(1.4, 1.4); ctx.translate(-500, -FLOOR); sceneP(i, t); ctx.restore(); ga(1);
      ctx.save(); ctx.fillStyle = '#16151b'; ctx.fillRect(0, 560, W, 520); ctx.restore(); jar(t);
      const rem = remaining(t); txt('RESTAM ' + rem, 540, 1010, 54, { a: 0.95 });
      for (const a of PH) { const k = Math.max(prog(t, a.end - 0.2, a.end + 0.1) * (1 - prog(t, a.end + 0.15, a.end + 0.45)), 0); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      for (const P of PH) { const a = P === PH[0] ? 3.4 : P.in + 0.4; ageChip('VERÃO ' + P.sum, prog(t, a, a + 0.35) * (1 - prog(t, P.end - 0.4, P.end - 0.15))); }
      const h1 = prog(t, 0.0, 0.25) * (1 - prog(t, 3.0, 3.3)); if (h1 > 0) { txt('VOCÊ TEM', 540, 300, 100, { a: h1 }); txt('18 VERÕES', 540, 420, 124, { a: h1 * prog(t, 0.1, 0.4) }); txt('COM ELE', 540, 540, 100, { a: h1 * prog(t, 0.2, 0.55) }); }
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.9 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        ['VOCÊ TEM', '18 VERÕES.', 'QUANTOS', 'JÁ GASTOU?'].forEach((s, k) => { const a0 = FIN + k * 0.45; txt(s, 540, 470 + k * 150, 108, { a: prog(t, a0, a0 + 0.3), scale: lerp(1.25, 1, outC(prog(t, a0, a0 + 0.5))), color: k === 3 ? RED : WHITE, glow: k === 3 ? 'rgba(224,38,43,0.55)' : undefined }); });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 28.6, 29.2), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
