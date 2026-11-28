/*
 * "O SAPATINHO": a mãe guarda o primeiro sapatinho vermelho do bebê numa caixa na estante; o filho cresce e passa; adulto, ele acha a caixa e ela diz "guardei". Bonequinhos de palito, 30 s. Vermelho = o sapatinho. (Lc 2:19)
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
    const DOWN_A = [[0.1, 0.15], [-0.08, 0.1]], OPEN_A = [[1.3, 1.6], [1.2, 1.5]], UP_A = [[2.2, 2.6], [2.1, 2.5]], HOLDS = [[0.9, 0.7], [0.9, 0.7]];
    const PH = [{ in: 0.3, end: 7.2, ks: 0.42 }, { in: 7.6, end: 12.4, ks: 0.62 }, { in: 12.8, end: 17.4, ks: 0.88 }];
    const P4 = { in: 17.8, end: 20.8 }, P5 = { in: 21.0, take: 22.8, open: 23.4, say: 24.0, hug: 25.0 }, FIN = 26.8;
    const SHELFY = FLOOR - 325, BOXX = 640;
    function room(withDoor) { ctx.fillStyle = '#16151b'; ctx.fillRect(-300, -800, 1800, FLOOR + 800); ctx.fillStyle = '#1b1a1f'; ctx.fillRect(-300, FLOOR, 1800, 900); ctx.fillStyle = '#34343a'; ctx.fillRect(-300, FLOOR, 1800, 3);
      ctx.save(); ctx.strokeStyle = '#6a6a72'; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(560, SHELFY); ctx.lineTo(760, SHELFY); ctx.moveTo(580, SHELFY); ctx.lineTo(580, SHELFY + 30); ctx.moveTo(740, SHELFY); ctx.lineTo(740, SHELFY + 30); ctx.stroke();
      ctx.beginPath(); ctx.rect(-10, FLOOR - 330, 120, 330); ctx.stroke(); ctx.fillStyle = '#6a6a72'; ctx.beginPath(); ctx.arc(85, FLOOR - 160, 9, 0, TAU); ctx.fill(); ctx.restore(); }
    function shoe(x, y, k, a = 1, rot = 0) { if (k <= 0 || a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ga(a); ctx.shadowColor = 'rgba(224,38,43,0.9)'; ctx.shadowBlur = 22; ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(-26, -26); ctx.lineTo(-6, -26); ctx.lineTo(-4, -12); ctx.quadraticCurveTo(24, -12, 28, 6); ctx.lineTo(28, 14); ctx.lineTo(-26, 14); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; ctx.restore(); ga(1); }
    function boxObj(x, y, lid) { ctx.save(); ctx.strokeStyle = '#b8b8c0'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.rect(x - 42, y - 44, 84, 44); ctx.stroke(); ctx.translate(x - 46, y - 44); ctx.rotate(-lid * 0.9); ctx.beginPath(); ctx.rect(0, -12, 92, 12); ctx.stroke(); ctx.restore(); }
    const mom = (o) => figure(Object.assign({ x: 700, y: FLOOR, s: FS, dir: -1, hr: 25, legs: STANDL }, o));
    function scenePh(i, t) {
      const P = PH[i], u = t - P.in, fade = 1 - sm(t, P.end - 0.4, P.end); room();
      if (i === 0) {
        const bw = sm(u, 0.6, 3.6, x => x), bx = lerp(150, 400, bw), baby = bw < 1 ? walkPose(u * 5, 0.6) : { legs: STANDL, bob: 0 };
        const hug = sm(u, 3.6, 4.4), hold = sm(u, 4.4, 4.8), go = sm(u, 4.8, 5.8), up = sm(u, 5.8, 6.2) * (1 - sm(u, 6.6, 6.9));
        const mx = lerp(480, 700, go);
        const walkM = go > 0 && go < 1 ? walkPose(t * 8, 1) : { legs: STANDL, bob: 0 };
        const marms = go > 0 ? lerpA(lerpA(OPEN_A, HOLDS, hold), UP_A, up) : lerpA(OPEN_A, K_HUG, hug * (1 - hold));
        const m = mom({ x: mx, lean: go > 0 ? 0.1 : 0.2 - 0.0 * hug, arms: lerpA(go > 0 ? DOWN_A : OPEN_A, go > 0 ? DOWN_A : OPEN_A, 0) && marms, legs: walkM.legs, bob: walkM.bob, a: fade, headTilt: 0.05 });
        const bf = figure({ x: bx, y: FLOOR, s: FS * P.ks, dir: 1, lean: 0.05, arms: [[2.3, 2.6], [2.0, 2.4]], legs: baby.legs, bob: baby.bob, hr: 32, a: fade });
        bubble('PRIMEIROS PASSOS', 330, FLOOR - 250, prog(u, 1.2, 1.5) * (1 - prog(u, 3.0, 3.2)), { size: 28, tail: -0.5 });
        if (u < 4.4) shoe(bx + 14, FLOOR - 12 - (baby.bob ? Math.abs(baby.bob) * 0.2 : 0), 0.45, fade);
        else if (u < 6.0) shoe(m.hands[0][0], m.hands[0][1], 0.5, fade); else if (u < 6.7) shoe(lerp(m.hands[0][0], BOXX, sm(u, 6.0, 6.5)), lerp(m.hands[0][1], SHELFY - 30, sm(u, 6.0, 6.5)), 0.5, fade * (1 - prog(u, 6.45, 6.6))); 
        boxObj(BOXX, SHELFY, u < 6.4 ? 1 : 1 - sm(u, 6.4, 6.9));
        if (u > 6.5) shoe(BOXX, SHELFY - 6, 0.4, fade * sm(u, 6.5, 6.7)); 
      } else {
        boxObj(BOXX, SHELFY, 0); shoe(BOXX + 10, SHELFY - 40, 0.4, fade);
        const dir = i === 1 ? 1 : -1; let kx, kl, kb, ka;
        if (i === 1) { kx = lerp(120, 520, sm(u, 0.4, 3.4, x => x)); const w = walkPose(u * 11, 1.1); kl = w.legs; kb = w.bob; ka = [[-0.9, -0.5], [1.0, 0.6]]; }
        else { kx = lerp(560, -90, sm(u, 0.4, 4.4, x => x)); const w = walkPose(u * 6, 0.7); kl = w.legs; kb = w.bob * 0.5; ka = [[0.1, 0.3], [0.05, 0.25]]; }
        figure({ x: kx, y: FLOOR, s: FS * P.ks, dir, lean: i === 2 ? 0.12 : 0.05, headTilt: i === 2 ? 0.2 : 0, arms: ka, legs: kl, bob: kb, hr: i === 1 ? 29 : 26, a: fade * (i === 2 ? 1 - prog(u, 4.0, 4.4) : 1) });
        const look = sm(u, 0.8, 1.6);
        mom({ x: 700, dir: -1, lean: 0.06, headTilt: -0.15 * look, arms: lerpA(DOWN_A, [[1.0, 1.4], [0.9, 1.3]], 0), a: fade });
        if (i === 1) bubble('MÃE, OLHA!', kx + 40, FLOOR - 300 + 0, prog(u, 1.0, 1.3) * (1 - prog(u, 2.3, 2.5)), { size: 30, tail: -0.5 });
      }
    }
    function sceneSil(t) { room(); const lk = prog(t, P4.in, P4.in + 0.6) * (1 - prog(t, P4.end - 0.4, P4.end)); boxObj(BOXX, SHELFY, 0); shoe(BOXX + 10, SHELFY - 40, 0.4, lk); mom({ x: 640, dir: -1, headTilt: -0.12, lean: 0.06, arms: DOWN_A, a: lk }); spaced('SILÊNCIO.', 400, 1050, 40, { a: lk * 0.9, w: 800, sp: 10 }); }
    function sceneEnd(t) {
      room(); const u = t - P5.in; const wk = sm(t, P5.in, P5.in + 1.6), sx = lerp(20, 560, wk), reach = sm(t, P5.in + 1.8, P5.take) * (1 - sm(t, P5.take + 0.5, P5.take + 0.9));
      const hug = sm(t, P5.hug - 0.3, P5.hug + 0.6), w = walkPose(t * 8, 1), walking = wk > 0 && wk < 1;
      const sarms = t < P5.take + 0.5 ? lerpA(DOWN_A, UP_A, reach) : lerpA(HOLDS, K_HUG, hug);
      const son = figure({ x: lerp(sx, 590, hug), y: FLOOR, s: FS * 1.12, dir: 1, lean: 0.06 + 0.1 * hug, headTilt: 0.05, arms: sarms, legs: walking ? w.legs : STANDL, bob: walking ? w.bob : 0, hr: 25 });
      mom({ x: lerp(700, 660, hug), dir: -1, lean: 0.06 + 0.1 * hug, headTilt: 0.05 + 0.08 * hug, arms: lerpA(DOWN_A, K_HUG, hug) });
      if (t < P5.take) { boxObj(BOXX, SHELFY, 0); shoe(BOXX + 10, SHELFY - 40, 0.4); }
      else { const k = sm(t, P5.take, P5.take + 0.7), bx = lerp(BOXX, son.hands[0][0] + 10, k), by = lerp(SHELFY, son.hands[0][1] + 24, k), lid = sm(t, P5.open - 0.2, P5.open + 0.4);
        if (t < P5.open + 0.3) { boxObj(bx, by, lid); shoe(bx + 6, by - 40, 0.4); } else { const sk = sm(t, P5.open + 0.3, P5.open + 1.0); shoe(lerp(bx + 6, son.hands[0][0], sk), lerp(by - 40, son.hands[0][1] - 20, sk), lerp(0.4, 0.75, sk) * (1 - 0.2 * hug), 1); } }
      bubble('GUARDEI.', 690, FLOOR - 380, prog(t, P5.say, P5.say + 0.3) * (1 - prog(t, P5.hug + 0.2, P5.hug + 0.6)), { size: 36, tail: -0.5 });
    }
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    for (let k = 0; k < 6; k++) cue(PH[0].in + 0.8 + k * 0.45, 'step', { gain: 0.2 }); cue(PH[0].in + 3.6, 'warm'); cue(PH[0].in + 6.0, 'pop');
    for (let k = 0; k < 6; k++) cue(PH[1].in + 0.5 + k * 0.5, 'step', { gain: 0.3 }); cue(PH[2].in + 3.8, 'creak'); PH.forEach(P => cue(P.end - 0.3, 'toggle'));
    cue(P4.in, 'sigh'); for (let k = 0; k < 5; k++) cue(P5.in + 0.2 + k * 0.35, 'step', { gain: 0.3 }); cue(P5.take, 'pop'); cue(P5.open, 'toggle'); cue(P5.hug, 'warm'); cue(FIN, 'final');
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(540, 1500); ctx.scale(1.4, 1.4); ctx.translate(-480, -FLOOR); if (t >= P5.in - 0.3) sceneEnd(t); else if (t >= P4.in - 0.3) sceneSil(t); else { const i = PH.filter(a => t >= a.in - 0.3).length - 1; scenePh(Math.max(0, i), t); } ctx.restore(); ga(1);
      for (const a of [...PH, P4]) { const k = Math.max(prog(t, a.end - 0.2, a.end + 0.1) * (1 - prog(t, a.end + 0.15, a.end + 0.45)), 0); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[3.5, 7.0, '1 ANO'], [7.9, 12.3, '6 ANOS'], [13.1, 17.3, '12 ANOS'], [21.3, 26.5, '25 ANOS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      const h1 = prog(t, 0.0, 0.25) * (1 - prog(t, 3.0, 3.3)); if (h1 > 0) { txt('TODA MÃE GUARDA', 540, 300, 100, { a: h1 }); txt('O PRIMEIRO', 540, 420, 100, { a: h1 * prog(t, 0.1, 0.4) }); txt('SAPATINHO', 540, 540, 116, { a: h1 * prog(t, 0.2, 0.55) }); }
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.88 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        ['AS MÃES', 'GUARDAM TUDO.', 'DIGA QUE', 'VOCÊ SABE.'].forEach((s, i) => { const a0 = FIN + i * 0.45; txt(s, 540, 470 + i * 150, 104, { a: prog(t, a0, a0 + 0.3), scale: lerp(1.25, 1, outC(prog(t, a0, a0 + 0.5))), color: i === 3 ? RED : WHITE, glow: i === 3 ? 'rgba(224,38,43,0.55)' : undefined }); });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 28.6, 29.2), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
