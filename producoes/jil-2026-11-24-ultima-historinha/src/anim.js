/*
 * "A ÚLTIMA HISTORINHA": o pai lê antes de dormir aos 3, 6 e 9 anos; aos 12 a porta está fechada, ele bate e o filho diz ENTRA.
 * Bonequinhos de palito, 30 s, 9:16, sem narração. Vermelho = o livro. (Dt 6:7)
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
  const DOORX = 370, NSX = 485, STOOLX = 590, BEDL = 655, BEDTOP = FLOOR - 95, HEADX = 930;
  const AGES = [
    { lab: '3 ANOS', s: 0.55, hr: 30, in: 0.3, end: 5.3, ask: [2.8, 4.6], txt: 'MAIS UMA!' },
    { lab: '6 ANOS', s: 0.7, hr: 28, in: 5.7, end: 11.0, ask: [8.2, 10.0], txt: 'MAIS UMA, PAI!' },
    { lab: '9 ANOS', s: 0.85, hr: 26, in: 11.4, end: 16.7, ask: [13.8, 15.8], txt: 'SÓ UM CAPÍTULO!' },
  ];
  const T12 = { in: 17.0, sigh: 17.5, knock: [18.4, 19.0, 19.6], lamp: 20.1, entra: [20.3, 21.9], door: [20.5, 21.2], walk: [21.4, 22.6], sit: [22.6, 23.1], heart: 23.2, fin: 24.4 };

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = '#0e0d10'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#141318'; g.fillRect(0, FLOOR - 640, W, 640);
      g.fillStyle = '#1b1a1f'; g.fillRect(0, FLOOR, W, 400); g.fillStyle = '#34343a'; g.fillRect(0, FLOOR, W, 3);
      g.fillStyle = '#26211a'; g.fillRect(NSX - 38, FLOOR - 110, 76, 110); g.fillStyle = '#332c22'; g.fillRect(NSX - 42, FLOOR - 116, 84, 10);
      g.fillStyle = '#2a2230'; g.fillRect(BEDL, BEDTOP, 420, 95); g.fillStyle = '#1d1722'; g.fillRect(BEDL, BEDTOP + 62, 420, 33); g.fillStyle = '#34283b'; g.fillRect(BEDL + 380, BEDTOP - 150, 50, 245);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

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
    function key(x, y, a) { if (a <= 0.02) return; ctx.save(); ga(a); const g = ctx.createRadialGradient(x, y, 3, x, y, 60); g.addColorStop(0, 'rgba(224,38,43,0.5)'); g.addColorStop(1, 'rgba(224,38,43,0)'); ctx.fillStyle = g; ctx.fillRect(x - 60, y - 60, 120, 120);
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.8)'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); ctx.fillRect(x + 4, y - 3, 26, 6); ctx.fillRect(x + 22, y, 5, 10); ctx.restore(); ga(1); }

    function lampGlow(a) { if (a <= 0.01) return; ctx.save(); ga(a); const g = ctx.createRadialGradient(NSX, FLOOR - 200, 10, NSX, FLOOR - 200, 520); g.addColorStop(0, 'rgba(255,214,150,0.42)'); g.addColorStop(1, 'rgba(255,214,150,0)'); ctx.fillStyle = g; ctx.fillRect(NSX - 520, FLOOR - 720, 1040, 920); ctx.restore(); ga(1); }
    function lampObj(on) { ctx.save(); ctx.fillStyle = on ? '#ffe2a8' : '#4a4034'; ctx.shadowColor = on ? 'rgba(255,226,168,0.9)' : 'transparent'; ctx.shadowBlur = on ? 24 : 0; ctx.beginPath(); ctx.moveTo(NSX - 24, FLOOR - 116); ctx.lineTo(NSX + 24, FLOOR - 116); ctx.lineTo(NSX + 14, FLOOR - 170); ctx.lineTo(NSX - 14, FLOOR - 170); ctx.closePath(); ctx.fill(); ctx.restore(); }
    function door(open) {
      ctx.save(); ctx.translate(DOORX, FLOOR); ctx.fillStyle = AMBER; ctx.globalAlpha = 0.35 + 0.65 * open; ctx.fillRect(-42, -240, 84, 240); ga(1);
      const w = lerp(84, 14, open); ctx.fillStyle = '#3a2d22'; ctx.fillRect(-42, -240, w, 240); ctx.fillStyle = '#6a5a48'; ctx.beginPath(); ctx.arc(-42 + w - 12, -110, 5, 0, TAU); ctx.fill();
      if (open < 0.05) { ctx.fillStyle = 'rgba(255,214,150,0.85)'; ctx.fillRect(-42, -4, 84, 4); }
      ctx.restore(); }
    function child(K, hr, eyes, a = 1) {
      ctx.save(); ga(a); const hrk = hr * K * 0.95, hx = HEADX + 8, hy = BEDTOP - hrk - 8;
      ctx.fillStyle = '#4a3a55'; ctx.beginPath(); ctx.roundRect(BEDL + 40 + (1 - K) * 60, BEDTOP - 26 - 34 * K, hx - BEDL - 30 - (1 - K) * 60, 26 + 34 * K, 28); ctx.fill();
      ctx.fillStyle = WHITE; ctx.shadowColor = 'rgba(255,255,255,0.25)'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(hx, hy, hrk, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (eyes) { ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(hx - hrk * 0.45, hy - 2, 3, 0, TAU); ctx.arc(hx - hrk * 0.05, hy - 2, 3, 0, TAU); ctx.fill(); }
      ctx.restore(); ga(1); }
    function book(hands, flip, a = 1) {
      const cx = (hands[0][0] + hands[1][0]) / 2 + 14, cy = (hands[0][1] + hands[1][1]) / 2 - 6; ctx.save(); ga(a); ctx.translate(cx, cy);
      ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 22; ctx.fillStyle = RED; ctx.beginPath(); ctx.roundRect(-34, -44, 68, 88, 6); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#f2e6d0'; ctx.fillRect(-27, -38, 54, 76); ctx.fillStyle = RED; ctx.fillRect(-1.5, -40, 3, 80);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; for (let r = 0; r < 5; r++) { ctx.beginPath(); ctx.moveTo(-22, -26 + r * 14); ctx.lineTo(-6, -26 + r * 14); ctx.moveTo(6, -26 + r * 14); ctx.lineTo(22, -26 + r * 14); ctx.stroke(); }
      if (flip > 0 && flip < 1) { ctx.fillStyle = '#fff6e2'; ctx.save(); ctx.scale(Math.cos(flip * Math.PI), 1); ctx.fillRect(0, -38, 27, 76); ctx.restore(); }
      ctx.restore(); ga(1); }
    const SIT_LEGS = [[1.5, 0.05], [1.5, 0.05]], READ_ARMS = [[0.95, 1.7], [1.05, 1.85]], IDLE_L = [[0.1, 0.06], [-0.1, -0.06]], IDLE_A = [[0.12, 0.2], [0.1, 0.15]];
    const flipAt = (t, t0) => { const k = (t - t0) % 1.5; return k < 0.4 ? k / 0.4 : 0; };
    function stool(a) { ctx.save(); ga(a); ctx.fillStyle = '#2a241c'; ctx.fillRect(STOOLX - 34, FLOOR - 66, 68, 66); ctx.restore(); ga(1); }
    function sceneRead(A, t) {
      const fade = 1 - sm(t, A.end - 0.4, A.end), appear = sm(t, A.in, A.in + 0.3);
      lampGlow(0.9 * fade); door(0); lampObj(true); child(A.s, A.hr, true, fade); stool(fade);
      const f = figure({ x: STOOLX, y: FLOOR + 46 * FS, s: FS, dir: 1, lean: 0.12, headTilt: 0.2 + Math.sin(t * 1.3) * 0.03, arms: READ_ARMS, legs: SIT_LEGS, hr: 25, a: fade * appear });
      book(f.hands, flipAt(t, A.in + 1.2), fade * appear);
      const k = prog(t, A.ask[0], A.ask[0] + 0.2) * (1 - prog(t, A.ask[1] - 0.2, A.ask[1]));
      bubble(A.txt, 800, BEDTOP - 200, k, { size: 34, tail: 0.9, tailDir: 1 });
    }
    function scene12(t) {
      const tt = T12, lampOn = sm(t, tt.lamp, tt.lamp + 0.3);
      lampGlow(lampOn * 0.9); lampObj(lampOn > 0.5); door(sm(t, tt.door[0], tt.door[1]));
      child(1.0, 25, t > tt.lamp);
      const walkK = prog(t, tt.walk[0], tt.walk[1]), sitK = sm(t, tt.sit[0], tt.sit[1]);
      let fx, dir = 1, legs, arms, bob = 0, lean = 0.05, tilt = 0.12, y = FLOOR;
      const knocking = tt.knock.some(k => t > k - 0.05 && t < k + 0.25);
      if (t < tt.walk[0]) { fx = DOORX + 70; dir = -1; legs = IDLE_L; arms = knocking ? [[2.5, 2.6], [0.1, 0.2]] : IDLE_A; tilt = (t > tt.sigh && t < tt.sigh + 1) ? 0.3 : 0.1; }
      else if (t < tt.sit[0]) { const wk = walkPose(t * 8, 0.9); fx = lerp(DOORX + 70, STOOLX, walkK); legs = wk.legs; bob = wk.bob; arms = IDLE_A; }
      else { fx = STOOLX; legs = lerpA(IDLE_L, SIT_LEGS, sitK); arms = lerpA(IDLE_A, READ_ARMS, sitK); y = lerp(FLOOR, FLOOR + 46 * FS, sitK); lean = 0.05 + 0.07 * sitK; }
      stool(sitK);
      const f = figure({ x: fx, y, s: FS, dir, lean, headTilt: tilt, arms, legs, bob, hr: 25 });
      const h = f.hands[1];
      book(t < tt.sit[0] ? [[h[0] + 4, h[1] + 6], [h[0] + 4, h[1] + 6]] : f.hands, t > tt.sit[1] ? flipAt(t, tt.sit[1] + 0.3) : 0);
      const dark = (1 - lampOn) * 0.62; if (dark > 0.01) { ctx.save(); ga(dark); ctx.fillStyle = '#000'; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); ga(1); }
      bubble('ENTRA.', 830, BEDTOP - 205, prog(t, tt.entra[0], tt.entra[0] + 0.2) * (1 - prog(t, tt.entra[1] - 0.2, tt.entra[1])), { size: 40, tail: 0.6, tailDir: 1 });
      if (t > tt.heart) { const k = prog(t, tt.heart, tt.heart + 1.0); if (k < 1) txt('♥', 790, BEDTOP - 220 - k * 110, 58, { color: RED, a: Math.sin(k * Math.PI), glow: 'rgba(224,38,43,0.6)' }); }
    }

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    AGES.forEach(A => { cue(A.in + 0.2, 'page', { gain: 0.5 }); cue(A.in + 2.7, 'page', { gain: 0.5 }); cue(A.ask[0], 'pop'); cue(A.end - 0.3, 'toggle'); });
    cue(T12.sigh, 'sigh'); T12.knock.forEach(k => cue(k, 'knock')); cue(T12.lamp, 'toggle'); cue(T12.entra[0], 'pop'); cue(T12.door[0], 'creak');
    for (let k = 0; k < 5; k++) cue(T12.walk[0] + k * 0.24, 'step', { gain: 0.45 });
    cue(T12.sit[1] + 0.3, 'page', { gain: 0.5 }); cue(T12.heart, 'warm'); cue(T12.fin, 'final');

    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(540, 1480); ctx.scale(Z, Z); ctx.translate(-CAMX, -FLOOR); ctx.drawImage(bgc, 0, 0);
      const A = AGES.filter(a => t >= a.in - 0.3).pop();
      if (t >= T12.in - 0.3) scene12(t); else sceneRead(A || AGES[0], t);
      ctx.restore();
      for (const a of AGES) { const k = Math.max(prog(t, a.end - 0.2, a.end + 0.1) * (1 - prog(t, a.end + 0.15, a.end + 0.45)), 0); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[0.3, 5.2, '3 ANOS'], [5.7, 10.9, '6 ANOS'], [11.4, 16.6, '9 ANOS'], [17.0, 24.0, '12 ANOS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      const h1 = prog(t, 0.0, 0.25) * (1 - prog(t, 4.6, 4.9)); if (h1 > 0) {
        txt('QUANDO FOI A', 540, 300, 108, { a: h1 }); txt('ÚLTIMA HISTORINHA', 540, 420, 100, { a: h1 * prog(t, 0.1, 0.4) }); txt('ANTES DE DORMIR?', 540, 540, 104, { a: h1 * prog(t, 0.2, 0.55), color: RED, glow: 'rgba(224,38,43,0.55)' }); }
      const f = prog(t, T12.fin, T12.fin + 0.6); if (f > 0) { ga(0.8 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = ['ELE PARA DE PEDIR', 'A HISTÓRIA ANTES', 'DE VOCÊ PARAR', 'DE LER.'];
        L.forEach((s, i) => { const a0 = T12.fin + i * 0.38; txt(s, 540, 400 + i * 135, i === 0 ? 100 : 104, { a: prog(t, a0, a0 + 0.3), scale: lerp(1.25, 1, outC(prog(t, a0, a0 + 0.5))), color: i === 3 ? RED : WHITE, glow: i === 3 ? 'rgba(224,38,43,0.55)' : undefined }); });
        spaced('AINDA DÁ TEMPO DE ABRIR O LIVRO.', 540, 1050, 36, { a: prog(t, 27.0, 27.6), w: 800, sp: 6 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 28.0, 28.6), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
