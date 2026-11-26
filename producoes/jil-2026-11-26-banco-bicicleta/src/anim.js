/*
 * "O BANCO DA BICICLETA": o pai segura o banco, o filho pede "não solta"; o pai solta sem ele ver, o filho pedala sozinho, olha pra trás e o pai levanta os braços de longe. Bonequinhos de palito, 30 s. Vermelho = o banco. (Pv 22:6)
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

    const AG = [{ in: 0.3, end: 5.6 }, { in: 6.0, end: 11.3 }, { in: 11.7, end: 16.7 }];
    const D = { in: 17.1, rel: 19.2, look: 21.4, up: 21.9, heart: 23.5, fin: 24.7 };
    const KS = [0.62, 0.7, 0.78, 0.84], KHR = [30, 28, 26, 25];
    const SPD = [110, 160, 190];
    const IDLE_A = [[0.12, 0.2], [0.1, 0.15]], A_UP = [[2.7, 2.9], [2.5, 2.8]], HOLD = [[1.4, 0.35], [1.25, 0.3]], OPEN = [[1.35, 1.35], [1.2, 1.3]];
    const GRAY = '#cfcfcf';
    // posição da bicicleta (local à cena) e velocidade
    function kxD(t) { const u = t - D.in, r = D.rel - D.in; if (u <= 0) return 0; if (t <= D.rel) return 190 * u; const v1 = 190, d1 = 190 * r; const a = Math.min(t, 20.4) - D.rel; const x1 = d1 + (v1 * a - 0.5 * (v1 - 90) * a * a / 1.2); if (t <= 20.4) return d1 + (v1 * a - 0.5 * (v1 - 90) * a * a / 1.2); return x1 + 90 * (t - 20.4) * 0.67; }
    function drawGround(cx, Zc, a = 1) {
      ctx.save(); ctx.translate(540, 1480); ctx.scale(Zc, Zc); ctx.translate(-cx, -FLOOR); ga(a);
      ctx.fillStyle = '#16151b'; ctx.fillRect(cx - 900, FLOOR - 1500, 1800, 1500); ctx.fillStyle = '#1b1a1f'; ctx.fillRect(cx - 900, FLOOR, 1800, 500); ctx.fillStyle = '#34343a'; ctx.fillRect(cx - 900, FLOOR, 1800, 3);
      const st = 300; for (let k = Math.floor((cx - 900) / st); k < (cx + 900) / st; k++) { const x = k * st; ctx.fillStyle = '#26252c'; ctx.fillRect(x, FLOOR - 260, 14, 260); ctx.fillRect(x - 6, FLOOR - 270, 26, 12); }
      for (let k = Math.floor((cx - 900) / 100); k < (cx + 900) / 100; k++) { ctx.fillStyle = '#2a2930'; ctx.fillRect(k * 100, FLOOR + 30, 56, 6); }
      ctx.restore(); ga(1); }
    function bike(x, rot, ph, rear, a = 1) {
      ctx.save(); ctx.translate(x, FLOOR); ga(a); ctx.strokeStyle = GRAY; ctx.lineWidth = 7; ctx.lineCap = 'round';
      const R = 62; for (const wx of [-58, 62]) { ctx.beginPath(); ctx.arc(wx, -R, R, 0, TAU); ctx.stroke(); ctx.lineWidth = 2.5; for (let k = 0; k < 6; k++) { const an = rot + k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(wx, -R); ctx.lineTo(wx + Math.cos(an) * R, -R + Math.sin(an) * R); ctx.stroke(); } ctx.lineWidth = 7; }
      if (rear) { ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-58 - 4, -22, 22, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(-58 + 34, -22, 0.1, 0, TAU); ctx.moveTo(-58, -R); ctx.lineTo(-62, -22); ctx.stroke(); ctx.lineWidth = 7; }
      ctx.beginPath(); ctx.moveTo(-58, -R); ctx.lineTo(-5, -70); ctx.lineTo(42, -112); ctx.lineTo(62, -R); ctx.moveTo(-5, -70); ctx.lineTo(-8, -118); ctx.moveTo(-5, -70); ctx.lineTo(42, -112); ctx.moveTo(42, -112); ctx.lineTo(50, -140); ctx.lineTo(70, -140); ctx.stroke();
      ctx.lineWidth = 5; const px = Math.cos(ph) * 24, py = Math.sin(ph) * 24; ctx.beginPath(); ctx.moveTo(-5 - px, -70 - py); ctx.lineTo(-5 + px, -70 + py); ctx.stroke();
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.9)'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.roundRect(-34, -132, 52, 14, 7); ctx.fill(); ctx.shadowBlur = 0;
      ctx.restore(); ga(1); }
    function kid(x, ks, ph, rot, o = {}) {
      const s = FS * ks, hr = KHR[o.i || 0];
      bike(x, rot, ph, o.rear, o.a ?? 1);
      const l = [0.9 + 0.45 * Math.sin(ph), 0.15 - 0.55 * Math.sin(ph + 0.8)], r = [0.9 + 0.45 * Math.sin(ph + Math.PI), 0.15 - 0.55 * Math.sin(ph + 0.8 + Math.PI)];
      figure({ x: x - 8, y: FLOOR - 126 + 92 * s, s, dir: 1, lean: 0.3, headTilt: o.tilt ?? 0.05, arms: [[1.3, 1.5], [1.2, 1.4]], legs: [l, r], hr, a: o.a ?? 1 });
    }
    function dadAt(x, t, o = {}) { return figure({ x, y: FLOOR, s: FS, dir: 1, lean: o.lean ?? 0.12, headTilt: o.tilt ?? 0.05, arms: o.arms || IDLE_A, legs: o.legs || STANDL, bob: o.bob || 0, hr: 25, a: o.a ?? 1 }); }
    function sceneAge(i, t) {
      const A = AG[i], u = t - A.in, fade = 1 - sm(t, A.end - 0.4, A.end), v = SPD[i], kx = v * u, cx = kx - 40;
      drawGround(cx, Z, 1);
      const wob = (i === 0 ? 0.1 : 0.16) * Math.sin(u * 3.1), rot = kx / 62, ph = kx / 20;
      ctx.save(); ctx.translate(540, 1480); ctx.scale(Z, Z); ctx.translate(-cx, -FLOOR);
      const dw = walkPose(t * (i === 0 ? 6 : 10), 1.0);
      dadAt(kx - 125, t, { legs: dw.legs, bob: dw.bob, arms: i === 0 ? walkArms(t * 6, 0.5) : HOLD, a: fade, lean: 0.15 });
      ctx.save(); ctx.translate(kx, FLOOR); ctx.rotate(wob); ctx.translate(-kx, -FLOOR); kid(kx, KS[i], ph, rot, { i, rear: i === 0, a: fade }); ctx.restore();
      if (i > 0) bubble('NÃO SOLTA!', kx + 60, FLOOR - 400, prog(u, 1.2, 1.4) * (1 - prog(u, 3.0, 3.2)), { size: 34, tail: -0.5 });
      ctx.restore();
    }
    function sceneD(t) {
      const u = t - D.in, kx = kxD(t), relK = sm(t, D.rel + 0.2, D.rel + 1.3);
      const Zc = lerp(Z, 1.15, relK), cx0 = kxD(D.rel) - 40, cxF = kxD(D.rel) + 170, cx = t < D.rel + 0.2 ? kx - 40 : lerp(kx - 40 > cx0 ? cx0 + (kx - kxD(D.rel + 0.2)) * (1 - relK) : cx0, cxF, relK);
      drawGround(cx, Zc, 1);
      ctx.save(); ctx.translate(540, 1480); ctx.scale(Zc, Zc); ctx.translate(-cx, -FLOOR);
      const rot = kx / 62, ph = kx / 20;
      const dadRun = t < D.rel + 0.9; const xStop = kxD(D.rel) + 55; const dxp = t < D.rel ? kx - 125 : Math.min(kx - 125, lerp(kxD(D.rel) - 125, xStop, outC(prog(t, D.rel, D.rel + 0.9))));
      const dw = walkPose(t * 10, 1.0), slow = 1 - prog(t, D.rel + 0.4, D.rel + 0.9);
      let arms = t < D.rel ? HOLD : lerpA(HOLD, OPEN, sm(t, D.rel, D.rel + 0.35)); arms = lerpA(arms, A_UP, sm(t, D.up, D.up + 0.5));
      dadAt(dxp, t, { legs: dadRun && slow > 0 ? dw.legs : STANDL, bob: dadRun ? dw.bob * slow : 0, arms, lean: 0.15 - 0.1 * sm(t, D.rel + 0.6, D.rel + 1.2), tilt: 0.05 });
      const look = sm(t, D.look, D.look + 0.3);
      ctx.save(); ctx.translate(kx, FLOOR); ctx.rotate(0.05 * Math.sin(u * 3.1) * (1 - relK * 0.7)); ctx.translate(-kx, -FLOOR);
      kid(kx, KS[3], ph, rot, { i: 3, tilt: 0.05 - 0.55 * look });
      ctx.restore();
      bubble('NÃO SOLTA, PAI!', kx + 70, FLOOR - 430, prog(t, 17.9, 18.1) * (1 - prog(t, 19.0, 19.2)), { size: 30, tail: -0.5 });
      bubble('EU TÔ ANDANDO!', kx + 20, FLOOR - 430, prog(t, D.look + 0.3, D.look + 0.5) * (1 - prog(t, 23.2, 23.5)), { size: 30, tail: -0.5 });
      if (t > D.heart) { const k = prog(t, D.heart, D.heart + 1.0); if (k < 1) txt('♥', dxp + 40, FLOOR - 440 - k * 120, 64, { color: RED, a: Math.sin(k * Math.PI), glow: 'rgba(224,38,43,0.6)' }); }
      ctx.restore();
    }

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    AG.forEach((A, i) => { for (let k = 0; k < 6; k++) cue(A.in + 0.3 + k * 0.6, 'step', { gain: 0.3 }); cue(A.end - 0.3, 'toggle'); });
    cue(6.0 + 1.3, 'pop'); cue(11.7 + 1.3, 'pop'); cue(D.in + 0.9, 'pop');
    for (let k = 0; k < 7; k++) cue(D.in + 0.2 + k * 0.35, 'step', { gain: 0.35 });
    cue(D.rel, 'sigh'); cue(D.look, 'pop'); cue(D.up, 'pop'); cue(D.heart, 'warm'); cue(D.fin, 'final');

    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      if (t >= D.in - 0.3) sceneD(t); else { const i = AG.filter(a => t >= a.in - 0.3).length - 1; sceneAge(Math.max(0, i), t); }
      for (const a of AG) { const k = Math.max(prog(t, a.end - 0.2, a.end + 0.1) * (1 - prog(t, a.end + 0.15, a.end + 0.45)), 0); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[0.3, 5.5, 'RODINHAS'], [6.0, 11.2, 'O PAI SEGURA'], [11.7, 16.6, 'MAIS RÁPIDO'], [17.1, 24.0, 'O DIA']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      const h1 = prog(t, 0.0, 0.25) * (1 - prog(t, 4.8, 5.1)); if (h1 > 0) {
        txt('O DIA EM QUE VOCÊ', 540, 300, 100, { a: h1 }); txt('SOLTOU O BANCO', 540, 420, 108, { a: h1 * prog(t, 0.1, 0.4) }); txt('DA BICICLETA', 540, 540, 108, { a: h1 * prog(t, 0.2, 0.55), color: RED, glow: 'rgba(224,38,43,0.55)' }); }
      const f = prog(t, D.fin, D.fin + 0.6); if (f > 0) { ga(0.8 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = ['CRIAR É', 'APRENDER', 'A SOLTAR.'];
        L.forEach((s, i) => { const a0 = D.fin + i * 0.45; txt(s, 540, 450 + i * 150, 116, { a: prog(t, a0, a0 + 0.3), scale: lerp(1.25, 1, outC(prog(t, a0, a0 + 0.5))), color: i === 2 ? RED : WHITE, glow: i === 2 ? 'rgba(224,38,43,0.55)' : undefined }); });
        spaced('ELE OLHA PRA TRÁS PRA VER SE VOCÊ AINDA ESTÁ LÁ.', 540, 1050, 30, { a: prog(t, 27.0, 27.6), w: 800, sp: 4 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 28.0, 28.6), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
