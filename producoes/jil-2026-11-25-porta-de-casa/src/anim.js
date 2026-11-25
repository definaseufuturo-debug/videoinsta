/*
 * "A PORTA DE CASA": aos 2, 6, 10 e 14 anos o filho corre cada vez menos até o pai que chega; no fim o pai ajoelha na porta e abre os braços, e o filho vem.
 * Bonequinhos de palito, 30 s, 9:16, sem narração. Vermelho = a maçaneta. (Lc 15:20)
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

    const DOORX = 370, DADX = 470, SOFAX = 880;
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = '#0e0d10'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#141318'; g.fillRect(0, FLOOR - 640, W, 640);
      g.fillStyle = '#1b1a1f'; g.fillRect(0, FLOOR, W, 400); g.fillStyle = '#34343a'; g.fillRect(0, FLOOR, W, 3);
      g.fillStyle = '#2a2230'; g.fillRect(SOFAX - 130, FLOOR - 190, 270, 190); g.fillStyle = '#34283b'; g.fillRect(SOFAX - 150, FLOOR - 75, 310, 75); g.fillStyle = '#1d1722'; g.fillRect(SOFAX - 150, FLOOR - 75, 310, 8);
      g.fillStyle = '#251f2b'; g.fillRect(SOFAX - 165, FLOOR - 120, 40, 120); g.fillRect(SOFAX + 135, FLOOR - 120, 40, 120);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    function door(open, a = 1) {
      ctx.save(); ctx.translate(DOORX, FLOOR); ga(a); ctx.fillStyle = AMBER; ctx.globalAlpha = a * (0.3 + 0.7 * open); ctx.fillRect(-42, -240, 84, 240); ga(a);
      const w = lerp(84, 14, open); ctx.fillStyle = '#3a2d22'; ctx.fillRect(-42, -240, w, 240);
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.9)'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(-42 + w - 12, -110, 9, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (open < 0.05) { ctx.fillStyle = 'rgba(255,214,150,0.85)'; ctx.fillRect(-42, -4, 84, 4); }
      ctx.restore(); ga(1); }
    const SIT_LEGS = [[1.5, 0.05], [1.5, 0.05]], KNEEL_LEGS = [[0.05, -1.5], [0.15, -1.45]];
    const IDLE_A = [[0.12, 0.2], [0.1, 0.15]], A_UP = [[2.7, 2.9], [2.5, 2.8]], A_OPEN = [[1.5, 1.3], [1.35, 1.2]], A_HUGD = [[1.7, 2.3], [1.6, 2.2]], A_PLAY = [[0.5, 1.2], [0.2, 0.9]];
    const KS = [0.58, 0.66, 0.82, 0.95], KHR = [30, 28, 26, 25];
    const AG = [{ in: 0.3, end: 5.3 }, { in: 5.7, end: 11.0 }, { in: 11.4, end: 16.7 }];
    const T4 = { in: 17.0, open: [17.4, 18.0], walk: [18.0, 18.9], kneel: [19.7, 20.4], arms: 20.5, turn: 20.9, stand: [21.2, 21.8], go: [21.8, 23.0], heart: 23.2, fin: 24.4 };

    function dadStand(t, x, o = {}) { return figure({ x, y: o.y ?? FLOOR, s: FS, dir: 1, lean: o.lean ?? 0.03, headTilt: o.tilt ?? 0.05, arms: o.arms || IDLE_A, legs: o.legs || STANDL, bob: o.bob || 0, hr: 25, a: o.a ?? 1 }); }
    function sceneAge(i, t) {
      const A = AG[i], u = t - A.in, ks = KS[i], s = FS * ks, hr = KHR[i];
      const open = sm(u, 0.4, 1.0), fade = 1 - sm(t, A.end - 0.4, A.end);
      door(open);
      // pai: aparece na porta e entra
      const wk = prog(u, 1.0, 1.8), dx = lerp(DOORX, DADX, outC(wk)), walking = wk > 0 && wk < 1;
      const reach = i < 2 ? sm(u, 2.1, 2.8) : 0;
      const dadArms = i === 0 ? lerpA(IDLE_A, A_OPEN, reach) : i === 1 ? lerpA(IDLE_A, A_OPEN, reach * 0.8) : IDLE_A;
      const sadTilt = i === 2 ? 0.05 + 0.25 * sm(u, 3.2, 3.8) : 0.05;
      if (walking) { const p = walkPose(t * 8, 0.9); dadStand(t, dx, { legs: p.legs, bob: p.bob, arms: walkArms(t * 8, 0.8), a: fade }); }
      else dadStand(t, dx, { arms: dadArms, tilt: sadTilt, a: fade * sm(u, 0.7, 1.0) });
      // filho
      const KSTART = [1.3, 1.4, 99, 99][i], KEND = [3.0, 3.4, 99, 99][i], kk = prog(u, KSTART, KEND), stopX = DADX + (i === 0 ? 92 : 108);
      if (i < 2) {
        const kx = lerp(930, stopX, kk), run = kk > 0 && kk < 1, p = walkPose(t * (i === 0 ? 17 : 12), 1.15);
        const f = figure({ x: kx, y: FLOOR, s, dir: -1, lean: run ? -0.12 : 0.02, headTilt: 0.05, arms: run ? (i === 0 ? A_UP : walkArms(t * 12, 1.3)) : (kk >= 1 ? (i === 0 ? A_UP : IDLE_A) : A_PLAY), legs: run ? p.legs : STANDL, bob: run ? p.bob : 0, hr, a: fade });
        bubble(i === 0 ? 'PAPAI CHEGOU!' : 'OI, PAI!', Math.min(kx + 40, 830), FLOOR - 330 * ks * 1.05 - 120, prog(u, KSTART, KSTART + 0.2) * (1 - prog(u, KEND + 0.2, KEND + 0.45)), { size: 34, tail: -0.9, tailDir: -1 });
        if (kk >= 1 && i === 0) { const h = prog(u, 3.1, 4.0); if (h > 0 && h < 1) txt('♥', 560, FLOOR - 400 - h * 80, 52, { color: WHITE, a: Math.sin(h * Math.PI) }); }
      } else {
        figure({ x: SOFAX, y: FLOOR + 46 * s, s, dir: -1, lean: 0.06, headTilt: 0.1, arms: [[0.9, 1.6], [1.0, 1.7]], legs: SIT_LEGS, hr, a: fade });
        bubble('OI.', SOFAX - 20, FLOOR - 330, prog(u, 1.9, 2.1) * (1 - prog(u, 3.3, 3.5)), { size: 34, tail: -0.9, tailDir: -1 });
      }
    }
    function scene4(t) {
      const tt = T4, s = FS * KS[3], hr = KHR[3], open = sm(t, tt.open[0], tt.open[1]);
      door(open);
      const wk = prog(t, tt.walk[0], tt.walk[1]), dx = lerp(DOORX, DADX, outC(wk)), walking = wk > 0 && wk < 1, kn = sm(t, tt.kneel[0], tt.kneel[1]);
      const hug = sm(t, tt.go[1] - 0.2, tt.go[1] + 0.3);
      let dadA = lerpA(IDLE_A, A_OPEN, sm(t, tt.arms, tt.arms + 0.5)); dadA = lerpA(dadA, A_HUGD, hug);
      if (walking) { const p = walkPose(t * 8, 0.9); dadStand(t, dx, { legs: p.legs, bob: p.bob, arms: walkArms(t * 8, 0.8), a: sm(t, 17.6, 17.9) }); }
      else dadStand(t, dx, { y: FLOOR + 44 * FS * kn, legs: lerpA(STANDL, KNEEL_LEGS, kn), arms: t < tt.kneel[0] ? IDLE_A : dadA, tilt: t < tt.kneel[0] ? 0.3 : 0.02, lean: 0.03 + 0.05 * kn, a: sm(t, 17.6, 17.9) });
      // filho: sentado no sofá, sem olhar; depois levanta e vem
      const st = sm(t, tt.stand[0], tt.stand[1]), go = prog(t, tt.go[0], tt.go[1]), kx = lerp(SOFAX, DADX + 112, outC(go) * 0.4 + go * 0.6);
      const dir = t < tt.turn ? 1 : -1;
      if (t < tt.stand[0]) figure({ x: SOFAX, y: FLOOR + 46 * s, s, dir, lean: 0.08, headTilt: 0.28, arms: [[0.9, 1.6], [1.0, 1.7]], legs: SIT_LEGS, hr });
      else { const p = walkPose(t * 9, 1.0), moving = go > 0 && go < 1; figure({ x: kx, y: lerp(FLOOR + 46 * s, FLOOR, st), s, dir, lean: 0.03, headTilt: 0.05, arms: go >= 1 ? A_HUGD : (moving ? walkArms(t * 9, 1.1) : IDLE_A), legs: moving ? p.legs : lerpA(SIT_LEGS, STANDL, st), bob: moving ? p.bob : 0, hr }); }
      bubble('...', SOFAX - 10, FLOOR - 330, prog(t, 18.9, 19.1) * (1 - prog(t, 20.2, 20.4)), { size: 36, tail: -0.9, tailDir: -1 });
      if (t > tt.heart) { const k = prog(t, tt.heart, tt.heart + 1.0); if (k < 1) txt('♥', 640, FLOOR - 430 - k * 120, 64, { color: RED, a: Math.sin(k * Math.PI), glow: 'rgba(224,38,43,0.6)' }); }
    }

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    AG.forEach(A => { cue(A.in + 0.4, 'creak', { gain: 0.8 }); cue(A.end - 0.3, 'toggle'); });
    cue(1.3, 'pop'); cue(5.8 + 1.4, 'pop');
    for (let k = 0; k < 5; k++) { cue(0.3 + 1.6 + k * 0.17, 'step', { gain: 0.3 }); }
    for (let k = 0; k < 4; k++) { cue(5.7 + 1.4 + k * 0.3, 'step', { gain: 0.35 }); }
    cue(0.3 + 3.1, 'warm'); cue(11.4 + 1.9, 'pop'); cue(T4.in + 1.9, 'pop');
    cue(T4.open[0], 'creak'); for (let k = 0; k < 4; k++) cue(T4.walk[0] + 0.1 + k * 0.24, 'step', { gain: 0.45 });
    cue(T4.kneel[0], 'sigh'); for (let k = 0; k < 4; k++) cue(T4.go[0] + 0.1 + k * 0.28, 'step', { gain: 0.4 });
    cue(T4.heart, 'warm'); cue(T4.fin, 'final');

    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(540, 1480); ctx.scale(Z, Z); ctx.translate(-CAMX, -FLOOR); ctx.drawImage(bgc, 0, 0);
      if (t >= T4.in - 0.3) scene4(t); else { const i = AG.filter(a => t >= a.in - 0.3).length - 1; sceneAge(Math.max(0, i), t); }
      ctx.restore();
      for (const a of AG) { const k = Math.max(prog(t, a.end - 0.2, a.end + 0.1) * (1 - prog(t, a.end + 0.15, a.end + 0.45)), 0); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[0.3, 5.2, '2 ANOS'], [5.7, 10.9, '6 ANOS'], [11.4, 16.6, '10 ANOS'], [17.0, 24.0, '14 ANOS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      const h1 = prog(t, 0.0, 0.25) * (1 - prog(t, 4.6, 4.9)); if (h1 > 0) {
        txt('A ÚLTIMA VEZ QUE', 540, 300, 100, { a: h1 }); txt('ELE CORREU', 540, 420, 108, { a: h1 * prog(t, 0.1, 0.4) }); txt('ATÉ VOCÊ?', 540, 540, 108, { a: h1 * prog(t, 0.2, 0.55), color: RED, glow: 'rgba(224,38,43,0.55)' }); }
      const f = prog(t, T4.fin, T4.fin + 0.6); if (f > 0) { ga(0.8 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = ['SE ELE PAROU', 'DE CORRER ATÉ', 'VOCÊ, VÁ', 'ATÉ ELE.'];
        L.forEach((s, i) => { const a0 = T4.fin + i * 0.38; txt(s, 540, 400 + i * 135, i === 0 ? 104 : 108, { a: prog(t, a0, a0 + 0.3), scale: lerp(1.25, 1, outC(prog(t, a0, a0 + 0.5))), color: i === 3 ? RED : WHITE, glow: i === 3 ? 'rgba(224,38,43,0.55)' : undefined }); });
        spaced('ABRA OS BRAÇOS. ELE AINDA VEM.', 540, 1050, 36, { a: prog(t, 27.0, 27.6), w: 800, sp: 6 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 28.0, 28.6), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
