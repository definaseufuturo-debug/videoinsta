/*
 * "AMANHÃ EU COMEÇO" (Mindloop: a mente em bonequinhos). Dois bonequinhos com o mesmo sonho (a bandeira vermelha
 * lá no alto). Um fica no sofá dizendo "amanhã eu começo"; o outro sobe UM degrau por dia. Os dias aceleram,
 * o do sofá envelhece. Headline: "AMANHÃ É O ÚNICO DIA QUE NUNCA CHEGA." Final: "COMECE HOJE. MAL FEITO, MAS HOJE."
 * 30 s, 9:16, sem narração.
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
  const mixc = (a, b, k) => { const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const x = p(a), y = p(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(',')})`; };

  const WHITE = '#efefef', GREY = '#8d8d94', RED = '#e0262b', BG = '#0a0a0c';
  const FLOOR = 1500, SEAT = 1412, SX = 230;                       // chão, assento, x do sofá
  const N = 14, ST_X0 = 430, ST_W = 32, ST_H = 50;                  // escada
  const stepTop = k => [ST_X0 + k * ST_W + ST_W / 2, FLOOR - k * ST_H];  // pé do bonequinho no degrau k (0 = chão)
  // dias: cada tique = um degrau (os primeiros devagar, depois acelera)
  const TICK = [3.2, 4.2, 5.1, 5.9, 6.6, 7.2, 7.7, 8.15, 8.6, 9.0, 9.4, 9.8, 10.2, 10.6];
  const DAY = ['DIA 1', 'DIA 2', 'DIA 3', 'DIA 4', 'DIA 7', 'DIA 15', 'DIA 30', 'DIA 60', 'DIA 100', 'DIA 150', 'DIA 200', 'DIA 270', 'DIA 330', 'DIA 365'];
  const HL = [11.6, 12.15, 13.05, 13.6], HL_OUT = 15.1;
  const T5 = 15.3, STAND = 17.0, LOOK = 18.0, B_FLAG = 16.2, B_SAY = 19.6, FIN = 23.4;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(540, 1200, 50, 540, 1200, 950); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 260); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 260); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3; const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.stroke(); };
      rr(70, 1300, 60, 200, 18); rr(90, SEAT, 260, 88, 16); rr(330, 1340, 50, 160, 14);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s, dir = o.dir || 1, hr = o.hr || 23, col = o.col || WHITE; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = 'rgba(255,255,255,0.22)'; ctx.shadowBlur = 10;
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      for (const [a, b] of o.legs) limb(0, hipY, a, b, 48, 46);
      const hands = o.arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const tilt = o.headTilt || 0, hx = shX + Math.sin(lean + tilt) * (hr + 11), hy = shY - Math.cos(lean + tilt) * (hr + 11);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill();
      ctx.restore(); ga(1);
      const rx = (x, y) => [o.x + dir * x * s, o.y + y * s];
      return { head: rx(hx, hy), hands: hands.map(([x, y]) => rx(x, y)) };
    }
    const STAND_P = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const SIT = { legs: [[1.5, 0.1], [1.42, 0.05]], bob: 0 };
    function phone(x, y, on) { ctx.save(); if (on > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, 160); g.addColorStop(0, `rgba(170,215,255,${0.36 * on})`); g.addColorStop(1, 'rgba(170,215,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - 160, y - 160, 320, 320); }
      ctx.fillStyle = on > 0 ? 'rgba(220,240,255,0.95)' : '#555'; ctx.beginPath(); ctx.roundRect(x - 9, y - 15, 18, 30, 4); ctx.fill(); ctx.restore(); }
    function bubble(parts, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 46, full = parts.map(p => p[0]).join(''), w = tw(full, size) + 60, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k) * (o.sc || 1), outBack(k) * (o.sc || 1)); ga(clamp(k * 3) * (o.a ?? 1));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      let cx = -tw(full, size) / 2; for (const [p, col] of parts) { const pw = tw(p, size); txt(p, cx + pw / 2, 3, size, { color: col }); cx += pw; } ctx.restore(); ga(1); }
    function flag(x, y, k, t) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.strokeStyle = '#cfcfd4'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -130); ctx.stroke();
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.moveTo(0, -130); for (let i = 0; i <= 10; i++) { const u = i / 10; ctx.lineTo(u * 80, -130 + Math.sin(u * 4 + t * 5) * 6 * u); } for (let i = 10; i >= 0; i--) { const u = i / 10; ctx.lineTo(u * 80, -80 + Math.sin(u * 4 + t * 5) * 6 * u); } ctx.closePath(); ctx.fill(); ctx.restore(); }

    // quantos degraus existem / onde está B
    const stepsAt = t => { let n = 0; for (const x of TICK) if (t >= x - 0.15) n++; return n; };
    function bPos(t) { // B sobe: entre tiques pula do degrau k-1 para k
      const n = stepsAt(t); let k = n, hop = 0;
      if (n > 0 && n <= N) { const t0 = TICK[n - 1]; const u = prog(t, t0, t0 + 0.35); if (u < 1) { const [x0, y0] = stepTop(n - 1), [x1, y1] = stepTop(n); return { x: lerp(x0, x1, u), y: lerp(y0, y1, u) - Math.sin(u * Math.PI) * 30, walking: true, ph: u * Math.PI * 2 }; } }
      const [x, y] = stepTop(Math.min(k, N)); return { x, y, walking: false, ph: 0 };
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    TICK.forEach((t, i) => { cue(t - 0.15, 'block', { n: i }); cue(t + 0.3, 'tick', { n: i }); });
    [3.2, 4.2, 5.1].forEach(t => cue(t + 0.1, 'bubble')); cue(1.5, 'bubble');
    HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 })); cue(B_FLAG, 'flag'); cue(STAND, 'creak'); cue(B_SAY, 'bubble'); cue(FIN, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.drawImage(bgc, 0, 0);
      const age = sm(t, 7.5, T5 + 0.5);                 // A envelhece
      const aCol = mixc(WHITE, GREY, age);
      // escada
      const n = stepsAt(t);
      for (let k = 1; k <= N; k++) { const kk = k <= n ? 1 : 0; if (!kk) continue; const pop = outBack(prog(t, TICK[k - 1] - 0.15, TICK[k - 1] + 0.1)); const x = ST_X0 + (k - 1) * ST_W, y = FLOOR - k * ST_H;
        ctx.save(); ctx.translate(x + ST_W / 2, FLOOR); ctx.scale(1, pop); ctx.fillStyle = '#2a2a31'; ctx.fillRect(-ST_W / 2, -k * ST_H, ST_W + 1, k * ST_H); ctx.fillStyle = '#4a4a54'; ctx.fillRect(-ST_W / 2, -k * ST_H, ST_W + 1, 5); ctx.restore(); }
      // bandeira (o sonho) no alto: sempre visível, apagada até ser conquistada
      const [fx, fy] = stepTop(N); const fk = t < B_FLAG ? 0.35 : 1;
      ga(fk); flag(fx + 26, fy, 1, t); ga(1);
      if (t < 3) { ctx.save(); ctx.setLineDash([8, 10]); ctx.strokeStyle = 'rgba(224,38,43,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx + 26, fy - 60); ctx.lineTo(SX + 40, SEAT - 260); ctx.moveTo(fx + 26, fy - 60); ctx.lineTo(ST_X0 - 10, FLOOR - 230); ctx.stroke(); ctx.restore(); }
      // A: no sofá com o celular; no fim levanta e olha para cima
      const up = sm(t, STAND, STAND + 0.9), look = sm(t, LOOK, LOOK + 0.6);
      if (up < 0.01) { const r = figure({ x: SX, y: SEAT + 92 * 1.15 - 2, s: 1.15, col: aCol, lean: 0.3 + age * 0.12, headTilt: 0.55, ...SIT, arms: [[0.7, -0.55], [0.6, -0.7]] }); phone(r.hands[0][0] + 4, r.hands[0][1] - 6, 1); }
      else { phone(SX + 60, SEAT - 6, 0); figure({ x: SX + 30 * up, y: lerp(SEAT + 92 * 1.15 - 2, FLOOR, up), s: 1.15, col: aCol, lean: 0.25 + age * 0.1 - look * 0.35, headTilt: -0.7 * look, legs: [[lerp(1.5, 0.12, up), lerp(0.1, 0.06, up)], [lerp(1.42, -0.1, up), lerp(0.05, -0.06, up)]], bob: 0, arms: [[0.2, 0.1], [-0.15, -0.05]] }); }
      // B: sobe um degrau por dia
      const b = bPos(t), top = t > B_FLAG - 0.1, cheer = sm(t, B_FLAG, B_FLAG + 0.4);
      const bArms = top ? [[lerp(0.2, 2.8, cheer), lerp(0.1, 3.0, cheer)], t > B_SAY - 0.2 ? [[lerp(-0.1, -1.5, sm(t, B_SAY - 0.2, B_SAY)), -1.6]][0] : [lerp(-0.1, -2.6, cheer), lerp(-0.05, -2.9, cheer)]] : b.walking ? [[-0.5 * Math.sin(b.ph), 0.2], [0.5 * Math.sin(b.ph), 0.2]] : [[0.15, 0.1], [-0.1, -0.05]];
      figure({ x: b.x, y: b.y, s: 1.0, dir: t > B_SAY - 0.3 ? -1 : 1, lean: b.walking ? 0.15 : 0, arms: bArms, legs: b.walking ? [[0.5 * Math.sin(b.ph), 0.1], [-0.5 * Math.sin(b.ph), -0.3]] : STAND_P.legs, bob: 0 });
      // contador de dias
      const dk = n > 0 ? DAY[Math.min(n, N) - 1] : '', dchip = prog(t, 3.0, 3.3) * (1 - prog(t, 11.2, 11.5));
      if (dchip > 0 && dk) { const pp = 1 + 0.08 * Math.exp(-(t - TICK[Math.max(0, n - 1)]) * 8); spaced(dk, 540, 640 * 1, 52 * pp, { w: 900, sp: 10, a: dchip }); ctx.fillStyle = RED; ga(dchip); ctx.fillRect(470, 690, 140, 5); ga(1); }
      if (t > T5 - 0.1 && t < FIN - 0.2) { const a = prog(t, T5, T5 + 0.4) * (1 - prog(t, FIN - 0.6, FIN - 0.3)); spaced('5 ANOS DEPOIS', 540, 640, 50, { w: 900, sp: 10, a }); ga(a); ctx.fillStyle = RED; ctx.fillRect(470, 690, 140, 5); ga(1); }
      // falas de A ("amanhã eu começo") — cada vez menor e mais apagada
      const says = [[1.5, 2.9, 1], [3.3, 4.0, 0.95], [4.3, 4.9, 0.85], [5.2, 5.8, 0.75], [6.7, 7.1, 0.6], [7.8, 8.1, 0.5], [8.7, 9.0, 0.45], [9.5, 9.8, 0.4], [10.3, 10.6, 0.35]];
      for (const [a, z, sc] of says) { const k = prog(t, a, a + 0.12) * (1 - prog(t, z, z + 0.12)); bubble([['AMANHÃ', RED], [' EU COMEÇO.', '#222']], SX + 70, 1060, k, { sc, tail: -0.6, tailDir: -1, size: 44, a: lerp(1, 0.75, 1 - sc) }); }
      bubble([['...E EU?', '#222']], SX + 70, 1060, prog(t, LOOK + 0.4, LOOK + 0.55) * (1 - prog(t, B_SAY - 0.1, B_SAY + 0.1)), { size: 46, tail: -0.6, tailDir: -1 });
      const [bx, by] = stepTop(N); bubble([['UM DEGRAU', RED], [' POR DIA.', '#222']], bx - 230, by - 300, prog(t, B_SAY, B_SAY + 0.15) * (1 - prog(t, FIN - 0.3, FIN)), { size: 44, tail: 0.6, tailDir: 1 });
      // gancho
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 2.8, 3.1)); if (h1 > 0) { spaced('OS DOIS TINHAM', 540, 360, 58, { a: h1, w: 900, sp: 12 }); spaced('O MESMO SONHO', 540, 445, 58, { a: h1 * prog(t, 0.6, 1.0), w: 900, sp: 12, color: RED }); }
      const h2 = prog(t, 3.3, 3.7) * (1 - prog(t, 10.9, 11.3)); if (h2 > 0) { spaced('SÓ UM COMEÇOU', 540, 400, 54, { a: h2, w: 900, sp: 10 }); }
      // HEADLINE
      const dim = prog(t, 11.2, 11.6) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ga(0.84 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['"AMANHÃ"', RED], ['É O ÚNICO DIA', WHITE], ['QUE NUNCA', WHITE], ['CHEGA.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; txt(s, 540, 650 + i * 150 + (i >= 2 ? 60 : 0), i === 1 ? 104 : 128, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // final
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.66 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('COMECE', 540, 480, 150, { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))) });
        txt('HOJE.', 540, 640, 170, { color: RED, a: prog(t, FIN + 0.35, FIN + 0.7), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.35, FIN + 0.85))), glow: 'rgba(224,38,43,0.55)' });
        spaced('MAL FEITO, MAS HOJE.', 540, 790, 40, { a: prog(t, 24.8, 25.4), w: 800, sp: 8 });
        spaced('MARCA QUEM VIVE DIZENDO "AMANHÃ"', 540, 1700, 36, { a: prog(t, 26.0, 26.6), w: 900, sp: 7, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
