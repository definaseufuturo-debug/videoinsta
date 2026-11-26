/*
 * "ELE NÃO OLHOU PRA TRÁS": no portão da escola o filho olha pra trás e acena aos 4 anos, 1 vez aos 8, nenhuma aos 12; aos 16 ele para na porta, olha pra trás e a mãe acena. Bonequinhos de palito, 30 s. Vermelho = o portão. (Dt 31:6)
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

    const GX = 850, MOMX = 430;
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = '#0e0d10'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#16151b'; g.fillRect(0, FLOOR - 640, W, 640);
      g.fillStyle = '#1f1e25'; g.fillRect(GX - 20, FLOOR - 330, 400, 330); // muro da escola
      g.fillStyle = '#1b1a1f'; g.fillRect(0, FLOOR, W, 400); g.fillStyle = '#34343a'; g.fillRect(0, FLOOR, W, 3);
      for (let k = 0; k < 6; k++) { g.fillStyle = '#26252c'; g.fillRect(300 + k * 90, FLOOR + 24, 50, 6); }
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();
    function gate(a = 1) {
      ctx.save(); ctx.translate(GX, FLOOR); ga(a); ctx.fillStyle = '#2d2a33'; ctx.fillRect(-92, -250, 22, 250); ctx.fillRect(70, -250, 22, 250);
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.9)'; ctx.shadowBlur = 22; ctx.fillRect(-92, -262, 184, 16); ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,214,150,0.12)'; ctx.fillRect(-70, -246, 140, 246); ctx.restore(); ga(1); }
    const AG = [{ in: 0.3, end: 6.0 }, { in: 6.4, end: 11.8 }, { in: 12.2, end: 17.0 }];
    const KS = [0.58, 0.8, 0.95, 1.02], KHR = [30, 27, 25, 25];
    const T4 = { in: 17.4, walk: [17.8, 20.0], turn: 21.3, wave: 21.8, heart: 23.4, fin: 24.6 };
    const IDLE_A = [[0.12, 0.2], [0.1, 0.15]];
    const waveA = (t, k, f = 12) => [[lerp(0.12, 2.5, k) + 0.35 * Math.sin(t * f) * k, lerp(0.2, 2.9, k)], [0.1, 0.15]];
    const kidWalk = (t, f) => { const p = walkPose(t * f, 1.0); return { legs: p.legs, bob: p.bob, arms: walkArms(t * f, 0.9) }; };

    function momFig(t, arms, tilt = 0.05, a = 1) { return figure({ x: MOMX, y: FLOOR, s: FS, dir: 1, lean: 0.03, headTilt: tilt, arms, legs: STANDL, hr: 25, a }); }
    function sceneAge(i, t) {
      const A = AG[i], u = t - A.in, s = FS * KS[i], hr = KHR[i], fade = 1 - sm(t, A.end - 0.4, A.end);
      gate(fade);
      const startX = MOMX + 80, reachT = [2.2, 2.0, 1.8][i];
      const wk = prog(u, 0.5, reachT), kx = lerp(startX, GX - 30, i === 0 ? wk : outC(wk) * 0.3 + wk * 0.7), walking = wk > 0 && wk < 1;
      // olhar pra trás: i=0 acena 3x, i=1 uma vez, i=2 nunca
      const look = i === 0 ? sm(u, reachT + 0.1, reachT + 0.4) * (1 - sm(u, 4.6, 4.9)) : i === 1 ? sm(u, reachT + 0.1, reachT + 0.35) * (1 - sm(u, 3.5, 3.8)) : 0;
      const dir = look > 0.5 ? -1 : 1;
      const into = sm(u, i === 2 ? reachT : 4.9 - (i === 1 ? 1.1 : 0), (i === 2 ? reachT : 4.9 - (i === 1 ? 1.1 : 0)) + 0.9);
      const kidX = kx + into * 60;
      const kw = kidWalk(t, i === 0 ? 11 : 9);
      const kidArms = look > 0.5 ? waveA(t, 1, 15) : walking ? kw.arms : IDLE_A;
      if (i === 2) { figure({ x: lerp(startX, GX, wk) + into * 20, y: FLOOR, s, dir: 1, lean: 0.05, headTilt: 0.1, arms: (walking || into > 0) ? kw.arms : IDLE_A, legs: (walking || into > 0) ? kw.legs : STANDL, bob: walking ? kw.bob : 0, hr, a: fade * (1 - into) }); }
      else { const mv = walking || (into > 0 && into < 1); figure({ x: kidX, y: FLOOR, s, dir, lean: 0.03, headTilt: 0.05, arms: kidArms, legs: mv ? kw.legs : STANDL, bob: mv ? kw.bob : 0, hr, a: fade * (1 - into) }); }
      // mãe
      const mw = i === 0 ? sm(u, reachT + 0.3, reachT + 0.6) * (1 - sm(u, 4.7, 5.0)) : i === 1 ? sm(u, reachT + 0.3, reachT + 0.6) * (1 - sm(u, 3.6, 3.9)) : 0;
      if (i === 2) { const up = sm(u, 2.6, 3.0) * (1 - sm(u, 4.0, 4.9)); momFig(t, lerpA(IDLE_A, [[1.4, 1.2], [0.1, 0.15]], up), 0.05 + 0.25 * sm(u, 4.2, 5.0), fade); }
      else momFig(t, mw > 0.02 ? waveA(t, mw, 11) : IDLE_A, 0.05, fade);
      if (i === 0 && look > 0.5) bubble('TCHAU, MÃE!', Math.min(kx + 20, 860), FLOOR - 330 * KS[i] - 150, prog(u, reachT + 0.2, reachT + 0.4) * (1 - prog(u, 4.5, 4.7)), { size: 34, tail: -0.9, tailDir: -1 });
    }
    function scene4(t) {
      const tt = T4, s = FS * KS[3], hr = KHR[3];
      gate();
      const wk = prog(t, tt.walk[0], tt.walk[1]), kx = lerp(MOMX + 80, GX - 30, wk), walking = wk > 0 && wk < 1, kw = kidWalk(t, 9);
      const turn = sm(t, tt.turn, tt.turn + 0.2), dir = t >= tt.turn + 0.1 ? -1 : 1;
      const wv = sm(t, tt.wave, tt.wave + 0.4) * (1 - sm(t, 24.2, 24.5));
      const kidWave = sm(t, tt.wave + 0.4, tt.wave + 0.8) * (1 - sm(t, 24.0, 24.3));
      const enter = sm(t, 24.0, 24.8);
      figure({ x: kx + enter * 50, y: FLOOR, s, dir, lean: 0.03, headTilt: 0.05 + 0.08 * turn, arms: kidWave > 0.02 ? lerpA(IDLE_A, [[2.0, 2.5], [0.1, 0.15]], kidWave) : (walking ? kw.arms : IDLE_A), legs: walking || enter > 0 ? kw.legs : STANDL, bob: walking ? kw.bob : 0, hr, a: 1 - enter });
      momFig(t, wv > 0.02 ? waveA(t, wv, 10) : (t < tt.turn ? IDLE_A : IDLE_A), t < tt.turn ? 0.05 + 0.25 * sm(t, 20.4, 21.0) : 0.02);
      if (t > tt.heart) { const k = prog(t, tt.heart, tt.heart + 1.0); if (k < 1) txt('♥', 700, FLOOR - 470 - k * 120, 64, { color: RED, a: Math.sin(k * Math.PI), glow: 'rgba(224,38,43,0.6)' }); }
    }

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    AG.forEach((A, i) => { for (let k = 0; k < 5; k++) cue(A.in + 0.6 + k * 0.3, 'step', { gain: 0.35 }); cue(A.end - 0.3, 'toggle'); });
    cue(0.3 + 2.4, 'pop'); cue(0.3 + 3.2, 'pop'); cue(0.3 + 4.0, 'pop'); cue(6.4 + 2.2, 'pop');
    cue(12.2 + 3.6, 'sigh');
    for (let k = 0; k < 7; k++) cue(T4.walk[0] + k * 0.3, 'step', { gain: 0.4 });
    cue(T4.turn, 'pop'); cue(T4.wave + 0.3, 'pop'); cue(T4.heart, 'warm'); cue(T4.fin, 'final');

    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(540, 1480); ctx.scale(Z, Z); ctx.translate(-CAMX, -FLOOR); ctx.drawImage(bgc, 0, 0);
      if (t >= T4.in - 0.3) scene4(t); else { const i = AG.filter(a => t >= a.in - 0.3).length - 1; sceneAge(Math.max(0, i), t); }
      ctx.restore();
      for (const a of AG) { const k = Math.max(prog(t, a.end - 0.2, a.end + 0.1) * (1 - prog(t, a.end + 0.15, a.end + 0.45)), 0); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[0.3, 5.9, '4 ANOS'], [6.4, 11.7, '8 ANOS'], [12.2, 16.9, '12 ANOS'], [17.4, 24.0, '16 ANOS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      const h1 = prog(t, 0.0, 0.25) * (1 - prog(t, 5.0, 5.3)); if (h1 > 0) {
        txt('UM DIA ELE ENTRA', 540, 300, 100, { a: h1 }); txt('NA ESCOLA SEM', 540, 420, 108, { a: h1 * prog(t, 0.1, 0.4) }); txt('OLHAR PRA TRÁS', 540, 540, 108, { a: h1 * prog(t, 0.2, 0.55), color: RED, glow: 'rgba(224,38,43,0.55)' }); }
      const f = prog(t, T4.fin, T4.fin + 0.6); if (f > 0) { ga(0.8 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = ['UM DIA ELE', 'NÃO OLHA', 'PRA TRÁS.', 'HOJE AINDA OLHA.', 'ACENA.'];
        L.forEach((s, i) => { const a0 = T4.fin + i * 0.38; txt(s, 540, 380 + i * 130, i === 3 ? 84 : 108, { a: prog(t, a0, a0 + 0.3), scale: lerp(1.25, 1, outC(prog(t, a0, a0 + 0.5))), color: i >= 3 ? RED : WHITE, glow: i >= 3 ? 'rgba(224,38,43,0.55)' : undefined }); });
        spaced('ELE AINDA PROCURA O SEU ACENO.', 540, 1100, 36, { a: prog(t, 27.0, 27.6), w: 800, sp: 6 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 28.0, 28.6), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
