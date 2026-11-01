/*
 * "A MÃE INVISÍVEL": a mãe corre o dia inteiro servindo a família (pai e dois filhos no celular) e vai ficando
 * transparente; só o avental vermelho continua visível. Um filho larga o celular, enxerga, levanta e a abraça:
 * ela volta a ficar inteira, e os outros vão atrás (dominó). Bonequinhos de palito, 30 s, 9:16, sem narração.
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

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c', GLOW = '170,215,255';
  const FLOOR = 1350, CHAIR = 1262, POUF = 1288;
  const DADX = 200, KAX = 360, KBX = 505, SINK = 760;     // pai (poltrona), filho A (pufe), filho B (chão), pia
  const SD = 1.2, SA = 0.86, SB = 0.72, SM = 1.14;       // escalas
  // trajeto da mãe: [t0, t1, x0, x1, ação, item]
  const PATH = [
    [0.0, 1.25, 700, 320, 'walk', 'plate'], [1.25, 1.65, 320, 320, 'give', 'plate'],
    [1.65, 2.95, 320, SINK, 'walk', null], [2.95, 3.3, SINK, SINK, 'grab', 'cup'],
    [3.3, 4.35, SINK, 460, 'walk', 'cup'], [4.35, 4.75, 460, 460, 'give', 'cup'],
    [4.75, 5.25, 460, 615, 'walk', null], [5.25, 5.7, 615, 615, 'bend', 'toy'],
    [5.7, 6.75, 615, SINK, 'walk', 'toy'], [6.75, 7.15, SINK, SINK, 'grab', 'shoe'],
    [7.15, 8.05, SINK, 615, 'walk', 'shoe'], [8.05, 8.5, 615, 615, 'bend', 'shoe'],
    [8.5, 9.5, 615, SINK, 'walk', null], [9.5, 17.0, SINK, SINK, 'wash', null],
  ];
  const T = {
    notice: 9.6, bang: 10.0, hl: [11.2, 11.7, 12.6, 13.1], kaUp: 15.3, kaWalk: 15.7, kaArr: 17.05, momTurn: 16.75, hug: 17.3,
    kbOff: 18.7, kbUp: 19.1, kbWalk: 19.4, kbArr: 20.6, dOff: 20.0, dUp: 20.4, dWalk: 20.75, dArr: 22.25, fin: 24.4,
  };

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    const fit = (s, size, max = 960) => Math.min(size, size * max / tw(s, size));
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: sala + cozinha ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(600, 1150, 50, 600, 1150, 950); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 260); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W + 200, 260); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W + 200, 3);
      g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3;
      const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.stroke(); };
      // poltrona do pai
      rr(20, 1150, 64, 200, 18); rr(40, CHAIR, 240, 88, 16); rr(40, 1190, 56, 160, 14);
      // pufe do filho A
      rr(KAX - 70, POUF, 130, FLOOR - POUF, 16);
      // bancada + pia + armário
      rr(840, 1170, 260, FLOOR - 1170, 8); g.fillStyle = '#2a2a30'; g.fillRect(840, 1165, 260, 12);
      g.strokeStyle = '#55555e'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(862, 1165); g.lineTo(862, 1110); g.lineTo(895, 1110); g.lineTo(895, 1125); g.stroke();
      g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3; rr(840, 900, 260, 140, 8);
      // relógio de parede
      g.strokeStyle = '#4a4a52'; g.lineWidth = 5; g.beginPath(); g.arc(470, 915, 40, 0, TAU); g.stroke();
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s, dir = o.dir || 1, hr = o.hr || 23; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = WHITE; ctx.fillStyle = WHITE; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = o.glowCol || 'rgba(255,255,255,0.25)'; ctx.shadowBlur = o.glowB || 10;
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      for (const [a, b] of o.legs) limb(0, hipY, a, b, 48, 46);
      const hands = o.arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const tilt = o.headTilt || 0, hx = shX + Math.sin(lean + tilt) * (hr + 11), hy = shY - Math.cos(lean + tilt) * (hr + 11);
      if (o.bun) { ctx.beginPath(); ctx.arc(hx - hr * 0.95, hy - hr * 0.45, hr * 0.5, 0, TAU); ctx.fill(); }
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (o.eyes !== false) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill(); }
      if (o.apron) { // avental vermelho: continua visível mesmo quando ela some
        ga(o.apronA ?? 1); const p1x = lerp(shX, 0, 0.18) + 4, p1y = lerp(shY, hipY, 0.18), p2x = 6, p2y = hipY + 44;
        ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.55)'; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.moveTo(p1x - 8, p1y); ctx.lineTo(p1x + 16, p1y); ctx.lineTo(p2x + 30, p2y); ctx.lineTo(p2x - 16, p2y); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = RED; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(lerp(shX, 0, 0.6) - 4, lerp(shY, hipY, 0.6)); ctx.lineTo(lerp(shX, 0, 0.6) - 18, lerp(shY, hipY, 0.6) + 14 + Math.sin(o.ph || 0) * 4); ctx.stroke(); ctx.shadowBlur = 0; }
      ctx.restore(); ga(1);
      return { head: [o.x + dir * hx * s, o.y + hy * s], hands: hands.map(([x, y]) => [o.x + dir * x * s, o.y + y * s]) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const STAND = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const SIT = { legs: [[1.5, 0.1], [1.42, 0.05]], bob: 0 };
    const FLOORSIT = { legs: [[1.5, 1.5], [1.4, 1.45]], bob: 0 };
    function phone(x, y, on) { ctx.save(); if (on > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, 160); g.addColorStop(0, `rgba(${GLOW},${0.36 * on})`); g.addColorStop(1, `rgba(${GLOW},0)`); ctx.fillStyle = g; ctx.fillRect(x - 160, y - 160, 320, 320); }
      ctx.fillStyle = on > 0 ? `rgba(220,240,255,${0.5 + 0.5 * on})` : '#555'; ctx.beginPath(); ctx.roundRect(x - 9, y - 15, 18, 30, 4); ctx.fill(); ctx.restore(); }
    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 48, w = tw(s, size) + 60, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      if (o.parts) { let cx = -tw(s, size) / 2; for (const [p, col] of o.parts) { const pw = tw(p, size); txt(p, cx + pw / 2, 3, size, { color: col }); cx += pw; } } else txt(s, 0, 3, size, { color: o.color || '#222' });
      ctx.restore(); ga(1); }
    // itens (brancos/cinza; o único vermelho é o avental)
    function item(kind, x, y, a = 1) { if (!kind) return; ctx.save(); ga(a); ctx.translate(x, y); ctx.fillStyle = '#f2f2f2'; ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 3;
      if (kind === 'plate') { ctx.beginPath(); ctx.ellipse(0, 0, 34, 10, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#9a9aa2'; ctx.beginPath(); ctx.ellipse(0, -6, 18, 7, 0, 0, TAU); ctx.fill(); }
      else if (kind === 'cup') { ctx.beginPath(); ctx.roundRect(-12, -16, 24, 30, 4); ctx.fill(); ctx.beginPath(); ctx.arc(14, -2, 8, -1.3, 1.3); ctx.stroke(); }
      else if (kind === 'toy') { ctx.fillStyle = '#c9c9d1'; ctx.fillRect(-16, -16, 32, 32); ctx.fillStyle = '#7d7d86'; ctx.fillRect(-6, -6, 12, 12); }
      else if (kind === 'shoe') { ctx.beginPath(); ctx.moveTo(-26, 8); ctx.lineTo(-26, -12); ctx.lineTo(-6, -12); ctx.quadraticCurveTo(0, -2, 24, 0); ctx.lineTo(26, 8); ctx.closePath(); ctx.fill(); }
      ctx.restore(); ga(1); }

    // ---------- mãe ----------
    const seg = t => PATH.find(p => t >= p[0] && t < p[1]) || PATH[PATH.length - 1];
    const momAlpha = t => t < T.hug ? 1 - 0.88 * outC(prog(t, 0.6, 10.2)) : lerp(0.12, 1, sm(t, T.hug + 0.1, T.hug + 0.9));
    function mom(t) {
      const a = momAlpha(t), glow = t > T.hug ? sm(t, T.hug + 0.1, T.hug + 0.9) : 0;
      const base = { s: SM, bun: true, apron: true, apronA: 1, a, glowCol: glow > 0 ? `rgba(255,236,200,${0.25 + 0.5 * glow})` : undefined, glowB: 10 + glow * 30 };
      if (t >= T.momTurn) { // vira para o filho e abraça
        const hk = sm(t, T.hug - 0.1, T.hug + 0.3);
        figure({ ...base, x: SINK, y: FLOOR, dir: -1, ph: t * 3, lean: 0.06 * hk, headTilt: 0.35 * hk, arms: [[lerp(0.2, 1.05, hk), lerp(0.1, 1.9, hk)], [lerp(-0.1, 0.95, hk), lerp(-0.1, 1.75, hk)]], ...STAND }); return;
      }
      const [t0, t1, x0, x1, act, it] = seg(t); const k = prog(t, t0, t1);
      if (act === 'walk') { const x = lerp(x0, x1, inOut(k) * 0.3 + k * 0.7), ph = t * 10.5, dir = x1 > x0 ? 1 : -1;
        const arms = it ? [[1.0 + 0.05 * Math.sin(ph), 1.5], walkArms(ph, 0.9)[1]] : walkArms(ph, 1.1);
        const r = figure({ ...base, x, y: FLOOR, dir, ph, lean: 0.16, arms, ...walkPose(ph, 1.25) }); if (it) item(it, r.hands[0][0] + dir * 8, r.hands[0][1] - 10, a); return; }
      if (act === 'give') { const e = Math.sin(k * Math.PI); const r = figure({ ...base, x: x0, y: FLOOR, dir: -1, ph: t * 4, lean: 0.12 + 0.15 * e, arms: [[lerp(1.0, 1.45, e), lerp(1.5, 1.5, e)], [0.3, 0.4]], ...STAND }); if (k < 0.55) item(it, r.hands[0][0] - 8, r.hands[0][1] - 10, a); return; }
      if (act === 'bend') { const e = Math.sin(k * Math.PI); const r = figure({ ...base, x: x0, y: FLOOR, dir: -1, ph: t * 4, lean: 0.12 + 0.75 * e, arms: [[lerp(0.6, 0.9, e), lerp(0.6, 0.5, e)], [0.2, 0.3]], ...STAND });
        if ((it === 'toy' && k > 0.5) || (it === 'shoe' && k < 0.5)) item(it, r.hands[0][0] - 8, r.hands[0][1] - 10, a); return; }
      if (act === 'grab') { const e = Math.sin(k * Math.PI); const r = figure({ ...base, x: x0, y: FLOOR, dir: 1, ph: t * 4, lean: 0.1, arms: [[lerp(0.8, 1.5, e), lerp(1.2, 1.6, e)], [0.3, 0.4]], ...STAND }); if (k > 0.5) item(it, r.hands[0][0] + 6, r.hands[0][1] - 10, a); return; }
      // lavando a louça
      const w = Math.sin(t * 9); figure({ ...base, x: SINK, y: FLOOR, dir: 1, ph: t * 3, lean: 0.14, headTilt: 0.25, arms: [[1.25 + 0.14 * w, 1.75], [1.1 - 0.14 * w, 1.6]], ...STAND });
    }

    // ---------- família ----------
    // filho A: o que percebe
    function kidA(t) {
      const s = SA, sy = POUF + 92 * s - 2;
      if (t < T.kaUp) { const look = sm(t, T.notice, T.notice + 0.4), on = 1 - sm(t, T.notice, T.notice + 0.3), sh = t > T.bang && t < 10.8 ? Math.sin(t * 40) * 1.5 : 0;
        const r = figure({ x: KAX + sh, y: sy, s, lean: 0.32 - look * 0.32, headTilt: 0.55 - look * 0.7, ...SIT, arms: [[lerp(0.7, 0.3, look), lerp(-0.55, 0.5, look)], [0.6, -0.7 + look * 0.9]] });
        phone(r.hands[0][0] + 4, r.hands[0][1] - 6, on); return r; }
      phone(KAX + 70, POUF - 6, 0);
      const up = sm(t, T.kaUp, T.kaWalk), walking = t > T.kaWalk && t < T.kaArr, ph = t * 9;
      const x = t < T.kaWalk ? KAX + 10 : lerp(KAX + 10, SINK - 90, sm(t, T.kaWalk, T.kaArr, x => x));
      const hk = sm(t, T.hug - 0.15, T.hug + 0.2);
      const legs = up < 1 ? { legs: [[lerp(1.5, 0.1, up), lerp(0.1, 0.06, up)], [lerp(1.42, -0.1, up), lerp(0.05, -0.06, up)]], bob: 0 } : walking ? walkPose(ph, 1.1) : STAND;
      const arms = hk > 0 ? [[lerp(0.2, 1.75, hk), lerp(0.1, 2.35, hk)], [lerp(-0.1, 1.6, hk), lerp(-0.1, 2.2, hk)]] : walking ? walkArms(ph) : [[0.15, 0.2], [-0.1, 0.1]];
      return figure({ x, y: lerp(sy, FLOOR, up), s, lean: walking ? 0.12 : 0.05 + hk * 0.1, headTilt: -0.2 * hk, arms, ...legs });
    }
    // filho B: no chão
    function kidB(t) {
      const s = SB, sy = FLOOR + 46 * s;
      if (t < T.kbUp) { const look = sm(t, T.kbOff, T.kbOff + 0.35), on = 1 - sm(t, T.kbOff, T.kbOff + 0.3);
        const r = figure({ x: KBX, y: sy, s, lean: 0.25 - 0.25 * look, headTilt: 0.5 - 0.6 * look, ...FLOORSIT, arms: [[0.7, -0.55 + look * 0.9], [0.6, -0.7 + look * 0.9]] });
        phone(r.hands[0][0] - 4, r.hands[0][1] - 6, on); return; }
      phone(KBX + 60, FLOOR - 10, 0);
      const up = sm(t, T.kbUp, T.kbWalk), walking = t > T.kbWalk && t < T.kbArr, ph = t * 11, X1 = SINK + 80;
      const x = t < T.kbWalk ? KBX : lerp(KBX, X1, sm(t, T.kbWalk, T.kbArr, x => x)), arrived = t >= T.kbArr, hk = sm(t, T.kbArr, T.kbArr + 0.3);
      const legs = up < 1 ? { legs: [[lerp(1.5, 0.1, up), lerp(1.5, 0.06, up)], [lerp(1.4, -0.1, up), lerp(1.45, -0.06, up)]], bob: 0 } : walking ? walkPose(ph, 1.2) : STAND;
      figure({ x, y: lerp(sy, FLOOR, up), s, dir: arrived ? -1 : 1, lean: walking ? 0.12 : 0.05, headTilt: -0.15 * hk, arms: arrived ? [[lerp(0.2, 1.7, hk), lerp(0.1, 2.3, hk)], [lerp(0, 1.55, hk), lerp(0, 2.1, hk)]] : walking ? walkArms(ph) : [[0.15, 0.2], [-0.1, 0.1]], ...legs });
    }
    function dad(t) {
      const s = SD, sy = CHAIR + 92 * s - 2;
      if (t < T.dUp) { const look = sm(t, T.dOff, T.dOff + 0.35), on = 1 - sm(t, T.dOff, T.dOff + 0.3);
        const r = figure({ x: DADX, y: sy, s, lean: 0.32 - 0.3 * look, headTilt: 0.55 - 0.65 * look, ...SIT, arms: [[lerp(0.7, 0.35, look), lerp(-0.55, 0.4, look)], [0.6, -0.7 + look * 0.8]] });
        phone(r.hands[0][0] + 4, r.hands[0][1] - 6, on); return; }
      phone(DADX + 75, CHAIR - 6, 0);
      const up = sm(t, T.dUp, T.dWalk), walking = t > T.dWalk && t < T.dArr, ph = t * 7.5, X1 = SINK - 175;
      const x = t < T.dWalk ? DADX + 15 : lerp(DADX + 15, X1, sm(t, T.dWalk, T.dArr, x => x)), hk = sm(t, T.dArr - 0.1, T.dArr + 0.35);
      const legs = up < 1 ? { legs: [[lerp(1.5, 0.1, up), lerp(0.1, 0.06, up)], [lerp(1.42, -0.1, up), lerp(0.05, -0.06, up)]], bob: 0 } : walking ? walkPose(ph) : STAND;
      figure({ x, y: lerp(sy, FLOOR, up), s, lean: walking ? 0.1 : 0.05 + hk * 0.18, headTilt: 0.2 * hk, arms: hk > 0 ? [[lerp(0.2, 1.5, hk), lerp(0.1, 1.62, hk)], [lerp(-0.1, 1.38, hk), lerp(-0.1, 1.52, hk)]] : walking ? walkArms(ph) : [[0.15, 0.2], [-0.1, 0.1]], ...legs });
    }
    // itens entregues (ficam com eles)
    function delivered(t) {
      if (t > 1.5) item('plate', DADX + 70, CHAIR - 4);
      if (t > 4.6) item('cup', KAX + 92, FLOOR - 16);
      if (t < 5.45) item('toy', 560, FLOOR - 16);
      if (t > 8.3) item('shoe', KBX + 62, FLOOR - 9);
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => { if (t >= 0 && t < END) cues.push(Object.assign({ t: +t.toFixed(3), type }, o)); };
    for (const p of PATH) if (p[4] === 'walk') for (let tt = p[0] + 0.05; tt < p[1]; tt += Math.PI / 10.5) cue(tt, 'step', { gain: 0.5 });
    for (const tt of [0.25, 3.7, 7.4]) cue(tt, 'ping');
    cue(1.45, 'clink'); cue(3.1, 'clink', { gain: 0.6 }); cue(4.55, 'clink'); cue(5.45, 'tap'); cue(6.95, 'tap'); cue(8.25, 'tap'); cue(9.5, 'water', { dur: 7.5 });
    for (const tt of [0.4, 2.55, 6.3, 8.9]) cue(tt, 'bubble');
    cue(T.notice, 'tap'); cue(T.bang, 'shock');
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(T.hug - 0.7, 'riser', { dur: 0.7 }); cue(T.hug, 'hold'); cue(T.hug + 0.6, 'bubble'); cue(T.kbArr, 'hold', { gain: 0.5 }); cue(T.dArr, 'hold', { gain: 0.6 });
    for (let tt = T.kaWalk; tt < T.kaArr; tt += Math.PI / 9) cue(tt, 'step', { gain: 0.35 });
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const z = 1.36 * (1 + 0.06 * sm(t, 15, 26)), cx = lerp(490, 530, sm(t, 15, 24));
      ctx.save(); ctx.translate(540, 1250); ctx.scale(z, z); ctx.translate(-cx, -1250); ctx.drawImage(bgc, 0, 0);
      // ponteiro do relógio correndo (o dia passando)
      ctx.save(); ctx.translate(470, 915); ctx.strokeStyle = '#6a6a72'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.rotate(Math.min(t, 10.5) * 2.4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -30); ctx.stroke(); ctx.restore();
      // luz sobre o filho que percebe
      const lk = prog(t, T.notice + 0.1, T.bang + 0.2) * (1 - prog(t, T.kaUp, T.kaUp + 1)); if (lk > 0) { const g = ctx.createRadialGradient(KAX, 1130, 20, KAX, 1130, 330); g.addColorStop(0, `rgba(255,240,220,${0.24 * lk})`); g.addColorStop(1, 'rgba(255,240,220,0)'); ctx.fillStyle = g; ctx.fillRect(KAX - 330, 800, 660, 660); }
      // luz quente no abraço
      const wk = sm(t, T.hug, T.hug + 1.2); if (wk > 0) { const g = ctx.createRadialGradient(SINK - 40, 1140, 30, SINK - 40, 1140, 520); g.addColorStop(0, `rgba(255,228,190,${0.26 * wk})`); g.addColorStop(1, 'rgba(255,228,190,0)'); ctx.fillStyle = g; ctx.fillRect(SINK - 600, 600, 1200, 1000); }
      delivered(t);
      dad(t); const ra = t < T.kaUp ? kidA(t) : null; kidB(t); mom(t);
      if (t >= T.kaUp) kidA(t); // no abraço, o filho fica na frente
      // "!" sobre o filho
      const ek = sm(t, T.bang, T.bang + 0.25, outBack); if (ek > 0 && t < 10.9 && ra) txt('!', ra.head[0], ra.head[1] - 95, 100, { color: RED, scale: ek, glow: 'rgba(224,38,43,0.5)' });
      // falas da família (ninguém tira o olho da tela)
      const bw = (t0, d) => prog(t, t0 - 0.05, t0 + 0.15) * (1 - prog(t, t0 + d, t0 + d + 0.2));
      bubble('MÃE!', KBX + 20, 1095, bw(0.4, 1.0), { tail: -0.3, tailDir: -1 });
      bubble('MEU COPO?', KAX + 40, 1010, bw(2.55, 1.2), { tail: -0.2, tailDir: -1 });
      bubble('CADÊ MEU TÊNIS?', KBX + 40, 1095, bw(6.3, 1.3), { size: 44, tail: -0.3, tailDir: -1 });
      bubble('TÁ PRONTO?', DADX + 95, 960, bw(8.9, 1.3), { tail: -0.3, tailDir: -1 });
      ctx.restore();
      bubble('OBRIGADO, MÃE.', 600, 1010, prog(t, T.hug + 0.55, T.hug + 0.75) * (1 - prog(t, 20.3, 20.5)), { size: 54, parts: [['OBRIGADO', RED], [', MÃE.', '#222']], tail: 0.35, tailDir: 1 });
      // horários (o dia inteiro dela)
      const hrs = [[0.5, 2.7, '6:00'], [2.9, 5.2, '12:00'], [5.4, 7.7, '18:00'], [7.9, 10.4, '23:00']];
      for (const [a, b, s] of hrs) { const k = prog(t, a, a + 0.3) * (1 - prog(t, b, b + 0.25)); if (k > 0) { ga(k); spaced(s, 540, 640, 50, { w: 900, sp: 10 }); ctx.fillStyle = RED; ctx.fillRect(480, 684, 120, 5); ga(1); } }
      // gancho
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 9.3, 9.7)); if (h1 > 0) { spaced('ELA FAZ TUDO', 540, 360, 66, { a: h1, w: 900, sp: 12 }); spaced('NINGUÉM VÊ', 540, 455, 66, { a: h1 * prog(t, 0.7, 1.1), w: 900, sp: 12, color: RED }); }
      // HEADLINE
      const dim = prog(t, 10.7, 11.05) * (1 - prog(t, 14.6, 15.0)); if (dim > 0) { ga(0.84 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['ELA NÃO SUMIU.', WHITE], ['VOCÊ É QUE', WHITE], ['PAROU DE', WHITE], ['ENXERGAR.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; txt(s, 540, 640 + i * 150 + (i >= 1 ? 70 : 0), fit(s, 122), { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); });
        ga(dim); ctx.fillStyle = RED; ctx.fillRect(390, 735, 300 * sm(t, 11.9, 12.2), 6); ga(1); }
      // virada
      const h2 = prog(t, 15.2, 15.6) * (1 - prog(t, 17.2, 17.5)); if (h2 > 0) spaced('ATÉ QUE UM LEVANTOU', 540, 420, 48, { a: h2, w: 800, sp: 9 });
      const h3 = prog(t, 17.6, 18.0) * (1 - prog(t, 23.9, 24.3)); if (h3 > 0) { spaced('UM OBRIGADO', 540, 360, 62, { a: h3, w: 900, sp: 12 }); spaced('TRAZ ELA DE VOLTA', 540, 450, 62, { a: h3 * prog(t, 18.2, 18.6), w: 900, sp: 10, color: RED }); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.62 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('ELA NÃO É', 540, 470, 132, { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('INVISÍVEL.', 540, 625, fit('INVISÍVEL.', 150, 940), { color: RED, a: prog(t, T.fin + 0.4, T.fin + 0.75), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.4, T.fin + 0.9))), glow: 'rgba(224,38,43,0.55)' });
        spaced('DIGA OBRIGADO HOJE.', 540, 790, 42, { a: prog(t, 26.2, 26.8), w: 800, sp: 8 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1700, 38, { a: prog(t, 27.2, 27.8), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
