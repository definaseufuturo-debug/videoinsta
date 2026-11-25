/*
 * "EU TE AMO, PRIMEIRO": aos 5 ele diz "eu te amo" sozinho, aos 12 só quando o pai pede, aos 16 nunca; o pai diz primeiro e vem a resposta tímida.
 * Bonequinhos de palito, 30 s, 9:16, sem narração. Vermelho = o "eu te amo" e o coração. (1Jo 4:19)
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

    const DADX = 500, KIDX = 850;
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = '#0e0d10'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#141318'; g.fillRect(0, FLOOR - 640, W, 640);
      g.fillStyle = '#1b1a1f'; g.fillRect(0, FLOOR, W, 400); g.fillStyle = '#34343a'; g.fillRect(0, FLOOR, W, 3);
      g.fillStyle = '#1a1820'; g.fillRect(740, FLOOR - 430, 200, 250); g.fillStyle = '#23212b'; g.fillRect(750, FLOOR - 420, 180, 230); g.fillStyle = '#0e0d12'; g.fillRect(838, FLOOR - 420, 4, 230); g.fillRect(750, FLOOR - 308, 180, 4);
      g.fillStyle = '#211c27'; g.fillRect(380, FLOOR + 40, 600, 24);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();
    const STANDL2 = [[0.1, 0.06], [-0.1, -0.06]];
    const IDLE_A = [[0.12, 0.2], [0.1, 0.15]], A_UP = [[2.7, 2.9], [2.5, 2.8]], A_OPEN = [[1.5, 1.3], [1.35, 1.2]], A_SHY = [[0.1, 0.5], [0.0, 0.4]], A_HUGD = [[1.7, 2.3], [1.6, 2.2]];
    const KS = [0.62, 0.88, 0.95], KHR = [30, 27, 25];
    const AG = [{ in: 0.3, end: 5.3 }, { in: 5.7, end: 11.0 }, { in: 11.4, end: 16.7 }];
    const T4 = { in: 17.0, walk: [17.3, 18.3], say: [18.9, 21.4], turn: 20.3, reply: [21.5, 23.3], heart: 23.2, fin: 24.4 };
    const kidBub = (s, x, y, k, col, size = 34) => bubble(s, x, y, k, { size, tail: 0.9, tailDir: 1, color: col });
    function dadF(x, o = {}) { return figure({ x, y: FLOOR, s: FS, dir: 1, lean: o.lean ?? 0.03, headTilt: o.tilt ?? 0.05, arms: o.arms || IDLE_A, legs: o.legs || STANDL2, bob: o.bob || 0, hr: 25, a: o.a ?? 1 }); }
    function heart(x, y, t, t0, size = 58, rise = 110) { const k = prog(t, t0, t0 + 1.0); if (k > 0 && k < 1) txt('♥', x, y - k * rise, size, { color: RED, a: Math.sin(k * Math.PI), glow: 'rgba(224,38,43,0.6)' }); }
    function sceneAge(i, t) {
      const A = AG[i], u = t - A.in, ks = KS[i], s = FS * ks, hr = KHR[i], fade = 1 - sm(t, A.end - 0.4, A.end), ap = sm(u, 0, 0.3);
      const by = FLOOR - 235 * s - 105;
      if (i === 0) {
        const up = sm(u, 1.0, 1.3), jump = Math.max(0, Math.sin(prog(u, 1.3, 1.9) * Math.PI)) * 14;
        dadF(DADX, { arms: lerpA(IDLE_A, A_OPEN, sm(u, 2.2, 2.8)), tilt: 0.1, a: fade * ap });
        figure({ x: KIDX, y: FLOOR - jump, s, dir: -1, lean: -0.03, headTilt: 0.05, arms: lerpA(IDLE_A, A_UP, up), legs: STANDL2, hr, a: fade * ap });
        kidBub('EU TE AMO, PAI!', KIDX - 60, by, prog(u, 1.4, 1.6) * (1 - prog(u, 3.6, 3.8)), RED);
        heart(600, FLOOR - 420, t, A.in + 2.2);
      } else if (i === 1) {
        dadF(DADX, { arms: lerpA(IDLE_A, A_OPEN, sm(u, 1.0, 1.5) * 0.6), tilt: 0.1, a: fade * ap });
        figure({ x: KIDX, y: FLOOR, s, dir: -1, lean: -0.1, headTilt: 0.32, arms: A_SHY, legs: STANDL2, hr, a: fade * ap });
        bubble('ME DÁ UM "TE AMO"?', 590, FLOOR - 400, prog(u, 1.0, 1.2) * (1 - prog(u, 3.0, 3.2)), { size: 30, tail: -0.5, tailDir: -1 });
        kidBub('...te amo.', KIDX - 40, by, prog(u, 3.4, 3.6) * (1 - prog(u, 4.9, 5.1)), RED, 28);
      } else {
        dadF(DADX, { tilt: 0.1 + 0.2 * sm(u, 2.5, 3.2), arms: IDLE_A, a: fade * ap });
        figure({ x: KIDX, y: FLOOR, s, dir: 1, lean: 0.06, headTilt: 0.32, arms: A_SHY, legs: STANDL2, hr, a: fade * ap });
        kidBub('...', KIDX + 20, by, prog(u, 1.6, 1.8) * (1 - prog(u, 3.6, 3.8)), '#222', 36);
      }
    }
    function scene4(t) {
      const tt = T4, s = FS * KS[2], hr = KHR[2], wk = prog(t, tt.walk[0], tt.walk[1]), dx = lerp(DADX, 610, outC(wk)), walking = wk > 0 && wk < 1;
      const ap = sm(t, 17.0, 17.3);
      const ar = lerpA(IDLE_A, A_OPEN, sm(t, tt.say[0] + 0.4, tt.say[0] + 1.0)), hug = sm(t, 23.0, 23.6);
      if (walking) { const p = walkPose(t * 8, 0.9); dadF(dx, { legs: p.legs, bob: p.bob, arms: walkArms(t * 8, 0.8), a: ap }); }
      else dadF(dx, { arms: lerpA(ar, A_HUGD, hug), tilt: 0.05, a: ap });
      const dir = t < tt.turn ? 1 : -1, kx = lerp(KIDX, 735, sm(t, 22.2, 23.2));
      figure({ x: kx, y: FLOOR, s, dir, lean: 0.04, headTilt: t < tt.turn ? 0.3 : 0.08, arms: lerpA(t < tt.turn ? A_SHY : IDLE_A, A_HUGD, hug), legs: STANDL2, hr, a: ap });
      bubble('EU TE AMO.', 640, FLOOR - 430, prog(t, tt.say[0], tt.say[0] + 0.25) * (1 - prog(t, tt.say[1] - 0.2, tt.say[1])), { size: 56, tail: -0.6, tailDir: -1, color: RED });
      kidBub('EU TAMBÉM.', 760, FLOOR - 400, prog(t, tt.reply[0], tt.reply[0] + 0.2) * (1 - prog(t, tt.reply[1] - 0.2, tt.reply[1])), RED, 34);
      heart(690, FLOOR - 380, t, tt.heart, 70, 45);
    }

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    cue(0.3 + 1.4, 'pop'); cue(0.3 + 2.2, 'warm'); cue(5.7 + 1.0, 'pop'); cue(5.7 + 3.4, 'pop', { gain: 0.6 }); cue(11.4 + 1.6, 'pop', { gain: 0.6 }); cue(11.4 + 3.0, 'sigh');
    AG.forEach(A => cue(A.end - 0.3, 'toggle'));
    for (let k = 0; k < 4; k++) cue(T4.walk[0] + 0.1 + k * 0.26, 'step', { gain: 0.4 });
    cue(T4.say[0], 'pop'); cue(T4.turn, 'creak', { gain: 0.5 }); cue(T4.reply[0], 'pop', { gain: 0.7 }); cue(T4.heart, 'warm'); cue(T4.fin, 'final');

    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(540, 1480); ctx.scale(Z, Z); ctx.translate(-CAMX, -FLOOR); ctx.drawImage(bgc, 0, 0);
      if (t >= T4.in - 0.3) scene4(t); else { const i = AG.filter(a => t >= a.in - 0.3).length - 1; sceneAge(Math.max(0, i), t); }
      ctx.restore();
      for (const a of AG) { const k = Math.max(prog(t, a.end - 0.2, a.end + 0.1) * (1 - prog(t, a.end + 0.15, a.end + 0.45)), 0); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[0.3, 5.2, '5 ANOS'], [5.7, 10.9, '12 ANOS'], [11.4, 16.6, '16 ANOS'], [17.0, 24.0, 'HOJE']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      const h1 = prog(t, 0.0, 0.25) * (1 - prog(t, 4.6, 4.9)); if (h1 > 0) {
        txt('QUANDO ELE DISSE', 540, 300, 100, { a: h1 }); txt('"TE AMO"', 540, 420, 116, { a: h1 * prog(t, 0.1, 0.4) }); txt('SEM VOCÊ PEDIR?', 540, 540, 100, { a: h1 * prog(t, 0.2, 0.55), color: RED, glow: 'rgba(224,38,43,0.55)' }); }
      const f = prog(t, T4.fin, T4.fin + 0.6); if (f > 0) { ga(0.8 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = ['DIGA PRIMEIRO.', 'ELE ESTÁ', 'ESPERANDO.'];
        L.forEach((s, i) => { const a0 = T4.fin + i * 0.38; txt(s, 540, 400 + i * 135, 108, { a: prog(t, a0, a0 + 0.3), scale: lerp(1.25, 1, outC(prog(t, a0, a0 + 0.5))), color: i === 2 ? RED : WHITE, glow: i === 2 ? 'rgba(224,38,43,0.55)' : undefined }); });
        spaced('UM DIA ELE DIZ SEM VOCÊ PEDIR.', 540, 950, 36, { a: prog(t, 27.0, 27.6), w: 800, sp: 6 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 28.0, 28.6), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
