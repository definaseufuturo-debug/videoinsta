/*
 * "DINHEIRO × TEMPO" (Mindloop: a mente em bonequinhos). Um bonequinho empilha moedas numa torre cada vez
 * mais alta enquanto a ampulheta da vida dele (areia VERMELHA) esvazia; quem ele ama chama três vezes
 * ("VAMOS PASSEAR?") e ele responde "SEM TEMPO." até ficar sozinho no alto da torre.
 * Headline: "DINHEIRO / VOLTA. / O TEMPO / NÃO." O outro troca cada moeda por um momento (fotos no varal).
 * Final: "GASTE TEMPO / COM QUEM AMA." 30 s, 9:16, sem narração.
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

  const WHITE = '#efefef', GREY = '#8d8d94', RED = '#e0262b', BG = '#0a0a0c', GOLD = '#cdb36a', GOLD_D = '#8a7640';
  const FLOOR = 1450, SEAT = FLOOR - 88;
  const AX = 430, TX = 655, CW = 118, CH = 17;          // A, torre de moedas
  const HGX = 870, HGY = 1000, HG = 150;                // ampulheta
  // fase A: moedas jogadas na torre (instantes em que cada moeda POUSA)
  const LAND = []; { let t = 0.55, dt = 0.62; while (t < 10.5) { LAND.push(+t.toFixed(3)); t += dt; dt = Math.max(0.24, dt * 0.955); } }
  const N0 = 3;                                          // moedas que já estão na torre no início
  const VIS = [ // visitas de quem ele ama: entra, fala, resposta, sai
    { in0: 1.0, in1: 2.2, say: 2.3, sayEnd: 3.3, rep: 3.4, repEnd: 4.4, out0: 4.5, out1: 5.7, txt: 'VAMOS PASSEAR?', rtxt: [['SEM ', '#222'], ['TEMPO.', RED]] },
    { in0: 5.4, in1: 6.2, say: 6.25, sayEnd: 6.95, rep: 7.0, repEnd: 7.7, out0: 7.75, out1: 8.6, txt: 'VAMOS?', rtxt: [['DEPOIS.', '#222']] },
    { in0: 8.5, in1: 9.1, say: 9.15, sayEnd: 9.6, rep: 99, repEnd: 99, out0: 9.7, out1: 10.9, txt: '...?', rtxt: null, fade: true },
  ];
  const HL = [11.65, 12.2, 13.1, 13.65], HL_OUT = 15.0;
  // fase B
  const B0 = 15.2, WALK1 = 21.3, SIT0 = 21.5, SPLIT = 23.0, FIN = 24.7;
  const TR = [16.0, 17.35, 18.6, 19.75, 20.8];           // moeda trocada por um momento (lançamento)
  const PX = [160, 295, 430, 565, 700], LINE_Y = 830, Z = 1.18;
  const AGES_A = [[0.6, 3.2, '25 ANOS'], [3.2, 5.6, '35 ANOS'], [5.6, 8.3, '45 ANOS'], [8.3, 9.9, '60 ANOS'], [9.9, 11.1, '70 ANOS']];
  const AGES_B = [[15.4, 17.3, '25 ANOS'], [17.3, 18.55, '35 ANOS'], [18.55, 19.7, '45 ANOS'], [19.7, 20.75, '60 ANOS'], [20.75, 22.8, '70 ANOS']];

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    const fit = (s, size, max = 960, w = 900) => Math.min(size, size * max / tw(s, size, w));
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(560, 1150, 50, 560, 1150, 950); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      return cv; })();
    const vig = (() => { const cv = mk(W, H), g = cv.getContext('2d'); const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); return cv; })();

    // ---------- bonequinho ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s, dir = o.dir || 1, hr = o.hr || 23, col = o.col || WHITE; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ctx.globalAlpha *= clamp(o.a ?? 1);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = 'rgba(255,255,255,0.22)'; ctx.shadowBlur = 10;
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      for (const [a, b] of o.legs) limb(0, hipY, a, b, 48, 46);
      const hands = o.arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const tilt = o.headTilt || 0, hx = shX + Math.sin(lean + tilt) * (hr + 11), hy = shY - Math.cos(lean + tilt) * (hr + 11);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill();
      ctx.restore();
      const rx = (x, y) => [o.x + dir * x * s, o.y + y * s];
      return { head: rx(hx, hy), hands: hands.map(([x, y]) => rx(x, y)) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const STANDP = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const SITP = { legs: [[1.5, 0.1], [1.42, 0.05]], bob: 0 };
    function bubble(parts, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 48, full = parts.map(p => p[0]).join(''), w = tw(full, size) + 60, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ctx.globalAlpha *= clamp(k * 3);
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      let cx = -tw(full, size) / 2; for (const [p, col] of parts) { const pw = tw(p, size); txt(p, cx + pw / 2, 3, size, { color: col }); cx += pw; } ctx.restore(); }
    function chip(s, k) { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k; spaced(s, 540, 620, 50, { w: 900, sp: 12 }); ctx.fillStyle = RED; ctx.fillRect(470, 664, 140, 5); ctx.restore(); }

    // ---------- objetos ----------
    function coin(x, y, sx = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1); ctx.fillStyle = GOLD_D; ctx.beginPath(); ctx.ellipse(0, 4, 30, 30, 0, 0, TAU); ctx.fill(); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.ellipse(0, 0, 30, 30, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = GOLD_D; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 19, 0, TAU); ctx.stroke(); ctx.restore(); }
    function tower(n, x = TX) { for (let i = 0; i < n; i++) { const y = FLOOR - (i + 1) * CH, jx = Math.sin(i * 2.3) * 7; ctx.fillStyle = GOLD_D; ctx.beginPath(); ctx.roundRect(x - CW / 2 + jx, y, CW, CH, 6); ctx.fill(); ctx.fillStyle = i % 2 ? GOLD : '#d8c07d'; ctx.beginPath(); ctx.roundRect(x - CW / 2 + jx + 3, y + 2, CW - 6, CH - 7, 5); ctx.fill(); } }
    function hourglass(lvl, t, x = HGX, y = HGY) {
      ctx.save(); ctx.translate(x, y); const w = 66, h = HG;
      const glass = () => { ctx.beginPath(); ctx.moveTo(-w, -h); ctx.lineTo(w, -h); ctx.bezierCurveTo(w, -h * 0.35, 10, -h * 0.18, 8, 0); ctx.bezierCurveTo(10, h * 0.18, w, h * 0.35, w, h); ctx.lineTo(-w, h); ctx.bezierCurveTo(-w, h * 0.35, -10, h * 0.18, -8, 0); ctx.bezierCurveTo(-10, -h * 0.18, -w, -h * 0.35, -w, -h); ctx.closePath(); };
      glass(); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
      ctx.save(); glass(); ctx.clip(); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 20;
      const ht = h * 0.92 * Math.sqrt(clamp(lvl)); if (ht > 1) ctx.fillRect(-w, -ht, 2 * w, ht);               // em cima
      const hb = h * 0.92 * (1 - Math.sqrt(clamp(lvl))); if (hb > 1) { ctx.beginPath(); ctx.moveTo(-w, h); ctx.lineTo(w, h); ctx.lineTo(w * 0.6, h - hb); ctx.quadraticCurveTo(0, h - hb - 22, -w * 0.6, h - hb); ctx.closePath(); ctx.fill(); }
      if (lvl > 0.015 && lvl < 0.999) ctx.fillRect(-2.5, -2, 5, h - hb + 2);                               // filete
      ctx.restore();
      glass(); ctx.strokeStyle = '#cfcfd4'; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#6b6b74'; ctx.beginPath(); ctx.roundRect(-w - 18, -h - 16, 2 * w + 36, 16, 5); ctx.fill(); ctx.beginPath(); ctx.roundRect(-w - 18, h, 2 * w + 36, 16, 5); ctx.fill();
      ctx.restore();
    }
    function doodle(k) { ctx.strokeStyle = '#3a3a3a'; ctx.fillStyle = '#3a3a3a'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      const fig = (x, y, sc = 1) => { ctx.beginPath(); ctx.arc(x, y - 22 * sc, 6 * sc, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(x, y - 16 * sc); ctx.lineTo(x, y); ctx.moveTo(x, y); ctx.lineTo(x - 6 * sc, y + 12 * sc); ctx.moveTo(x, y); ctx.lineTo(x + 6 * sc, y + 12 * sc); ctx.moveTo(x - 8 * sc, y - 10 * sc); ctx.lineTo(x + 8 * sc, y - 10 * sc); ctx.stroke(); };
      if (k === 0) { ctx.beginPath(); ctx.arc(30, -34, 11, 0, TAU); ctx.stroke(); for (let r = 0; r < 2; r++) { ctx.beginPath(); for (let i = 0; i <= 8; i++) ctx.lineTo(-42 + i * 10.5, 18 + r * 14 + (i % 2 ? -5 : 4)); ctx.stroke(); } fig(-18, 2, 0.8); }
      else if (k === 1) { ctx.beginPath(); ctx.moveTo(-44, 30); ctx.lineTo(-12, -24); ctx.lineTo(8, 6); ctx.lineTo(24, -12); ctx.lineTo(46, 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-20, -10); ctx.lineTo(-12, -24); ctx.lineTo(-4, -10); ctx.stroke(); }
      else if (k === 2) { fig(-16, 16); fig(16, 16); ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(8, 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -34); ctx.bezierCurveTo(-14, -48, -20, -30, 0, -20); ctx.bezierCurveTo(20, -30, 14, -48, 0, -34); ctx.fill(); }
      else if (k === 3) { ctx.beginPath(); ctx.moveTo(14, -44); ctx.lineTo(34, -24); ctx.lineTo(14, -4); ctx.lineTo(-6, -24); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(14, -4); ctx.quadraticCurveTo(0, 14, -20, 10); ctx.stroke(); fig(-26, 26, 0.8); }
      else { ctx.beginPath(); ctx.rect(-30, 0, 60, 26); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-30, 10); ctx.lineTo(30, 10); ctx.moveTo(0, 0); ctx.lineTo(0, -16); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -22, 3.5, 6, 0, 0, TAU); ctx.fill(); fig(-40, 22, 0.7); fig(40, 22, 0.7); } }
    function polaroid(x, k, kind, sway) { if (k <= 0) return; ctx.save(); ctx.translate(x, LINE_Y + 10); ctx.rotate(sway); ctx.scale(outBack(k), outBack(k)); ctx.globalAlpha *= clamp(k * 3);
      ctx.fillStyle = '#f3efe4'; ctx.shadowColor = 'rgba(255,255,255,0.18)'; ctx.shadowBlur = 14; ctx.fillRect(-58, 4, 116, 136); ctx.shadowBlur = 0; ctx.fillStyle = '#d9d3c3'; ctx.fillRect(-48, 14, 96, 92);
      ctx.save(); ctx.translate(0, 64); doodle(kind); ctx.restore();
      ctx.fillStyle = '#9a9aa4'; ctx.fillRect(-7, -8, 14, 20); ctx.restore(); }
    function bench(k) { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = '#2a2a31'; ctx.strokeStyle = '#4a4a54'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(300, SEAT, 340, 22, 6); ctx.fill(); ctx.stroke(); ctx.fillRect(320, SEAT + 20, 16, 68); ctx.fillRect(604, SEAT + 20, 16, 68); ctx.beginPath(); ctx.roundRect(300, SEAT - 90, 340, 18, 6); ctx.fill(); ctx.stroke(); ctx.fillRect(330, SEAT - 74, 12, 76); ctx.fillRect(598, SEAT - 74, 12, 76); ctx.restore(); }

    // ---------- fase A ----------
    const landed = t => N0 + LAND.filter(x => x <= t).length;
    function sceneA(t) {
      ctx.drawImage(bgc, 0, 0); ctx.save(); ctx.translate(560, 1250); ctx.scale(Z, Z); ctx.translate(-560, -1250);
      const age = sm(t, 1.0, 10.5, x => x), aCol = mixc(WHITE, GREY, age * 0.85);
      const lvl = 1 - 0.96 * sm(t, 0.2, 10.8, x => x);
      hourglass(lvl, t);
      const n = landed(t); tower(n);
      // A: tira uma moeda do bolso e joga na torre
      let next = LAND.find(x => x > t), prev = [...LAND].reverse().find(x => x <= t);
      const stop = t > LAND[LAND.length - 1] + 0.1;
      let arms, coinPos = null;
      if (!stop && next !== undefined) {
        const per = Math.min(0.62, next - (prev ?? 0)), fly = Math.min(0.32, per * 0.6), t0 = next - fly, u = prog(t, t0, next);
        const wind = prog(t, next - per, t0);                                                    // pega a moeda e prepara
        const throwK = u > 0 ? 1 : wind;
        arms = [[lerp(0.2, -2.3, outC(throwK)) + (u > 0 ? lerp(0, 0.9, u) : 0), lerp(0.4, -2.0, outC(throwK))], [-0.1, -0.05]];
        const topY = FLOOR - (n + 1) * CH + 4;
        if (u > 0) { const sx = AX + 30, sy = FLOOR - 270, ex = TX + Math.sin(n * 2.3) * 7, ey = topY; coinPos = [lerp(sx, ex, u), lerp(sy, ey, u) - Math.sin(u * Math.PI) * 140, Math.cos(u * 18)]; }
        else if (wind > 0.3) coinPos = null;
      } else arms = [[0.15, 0.1], [-0.1, -0.05]];
      const turn = sm(t, 10.6, 11.0), lookUp = sm(t, 10.9, 11.3);
      const r = figure({ x: AX, y: FLOOR, s: 1.15, col: aCol, dir: 1, lean: 0.06 + age * 0.22 - lookUp * 0.2, headTilt: -0.9 * lookUp, arms, ...STANDP });
      if (!stop && next !== undefined && !coinPos) { const per = Math.min(0.62, next - (prev ?? 0)), wind = prog(t, next - per, next - Math.min(0.32, per * 0.6)); if (wind > 0.25) coin(r.hands[0][0], r.hands[0][1], 0.55); }
      if (coinPos) coin(coinPos[0], coinPos[1], Math.max(0.15, Math.abs(coinPos[2])));
      // quem ele ama
      for (const v of VIS) {
        if (t < v.in0 || t > v.out1) continue; let x, dir, walking, sad = 0;
        if (t < v.in1) { x = lerp(-90, 225, sm(t, v.in0, v.in1, x => x)); dir = 1; walking = true; }
        else if (t < v.out0) { x = 225; dir = 1; walking = false; }
        else { x = lerp(225, -110, sm(t, v.out0, v.out1, x => x)); dir = -1; walking = true; sad = 1; }
        const ph = t * 8, wave = t > v.say - 0.1 && t < v.sayEnd ? Math.sin(t * 14) * 0.35 : 0, waiting = !walking;
        const a = v.fade ? 1 - prog(t, v.out0 + 0.3, v.out1) : 1;
        const arms2 = walking ? walkArms(ph) : (t < v.sayEnd ? [[-2.6 + wave, -2.9 + wave], [0.2, 0.1]] : [[0.2, 0.1], [-0.1, 0]]);
        figure({ x, y: FLOOR, s: 1.02, col: aCol, dir, a, lean: walking ? 0.1 : 0, headTilt: sad * 0.5 + (waiting && t > v.rep ? 0.3 : 0), arms: arms2, ...(walking ? walkPose(ph) : STANDP) });
      }
      for (const v of VIS) {
        bubble([[v.txt, '#222']], 320, 1020, prog(t, v.say - 0.05, v.say + 0.12) * (1 - prog(t, v.sayEnd - 0.1, v.sayEnd + 0.05)), { size: 40, tail: -0.3, tailDir: -1 });
        if (v.rtxt) bubble(v.rtxt, 520, 990, prog(t, v.rep - 0.05, v.rep + 0.12) * (1 - prog(t, v.repEnd - 0.1, v.repEnd + 0.05)), { size: 48, tail: -0.2, tailDir: -1 });
      }
      ctx.restore(); ctx.drawImage(vig, 0, 0);
    }

    // ---------- fase B ----------
    function sceneB(t) {
      ctx.drawImage(bgc, 0, 0); ctx.save(); ctx.translate(560, 1250); ctx.scale(Z, Z); ctx.translate(-560, -1250);
      const walkK = 1 - sm(t, WALK1 - 0.4, WALK1), scroll = 230 * (Math.min(t, WALK1) - B0) - 230 * 0.2 * sm(t, WALK1 - 0.4, WALK1);
      // árvores e postes passando
      for (let k = 0; k < 5; k++) { const x = ((k * 360 - scroll * 0.6) % 1800 + 1800) % 1800 - 300; ctx.save(); ctx.fillStyle = '#18181c'; ctx.strokeStyle = '#2c2c33'; ctx.lineWidth = 3;
        if (k % 2) { ctx.fillRect(x - 9, FLOOR - 300, 18, 300); ctx.beginPath(); ctx.arc(x, FLOOR - 340, 90, 0, TAU); ctx.fill(); ctx.stroke(); }
        else { ctx.fillRect(x - 5, FLOOR - 380, 10, 380); ctx.beginPath(); ctx.arc(x, FLOOR - 386, 16, 0, TAU); ctx.fillStyle = '#3a3a40'; ctx.fill(); }
        ctx.restore(); }
      ctx.fillStyle = '#34343b'; for (let k = 0; k < 12; k++) { const x = ((k * 120 - scroll) % 1440 + 1440) % 1440 - 120; ctx.fillRect(x, FLOOR + 50, 60, 6); }
      const lvl = 1 - 0.95 * sm(t, B0 + 0.2, 22.8, x => x); hourglass(lvl, t);
      // varal
      const lineK = prog(t, B0 + 0.3, B0 + 0.8); if (lineK > 0) { ctx.save(); ctx.globalAlpha *= lineK; ctx.strokeStyle = '#6b6b74'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(70, LINE_Y - 8); ctx.quadraticCurveTo(430, LINE_Y + 22, 790, LINE_Y - 8); ctx.stroke(); ctx.restore(); }
      TR.forEach((t0, k) => polaroid(PX[k], prog(t, t0 + 0.5, t0 + 0.75), k, Math.sin(t * 2 + k) * 0.04));
      const age = sm(t, B0 + 0.5, 21.4, x => x), col = mixc(WHITE, GREY, age * 0.85);
      const sit = sm(t, SIT0, SIT0 + 0.6); bench(prog(t, WALK1 - 0.3, SIT0));
      const ph = (t - B0) * 6.5;
      // arremesso: braço da frente sobe
      let thr = 0, cur = TR.find(x => t > x - 0.35 && t < x + 0.55); if (cur !== undefined) thr = sm(t, cur - 0.35, cur) * (1 - sm(t, cur + 0.2, cur + 0.5));
      if (sit <= 0.001) {
        const wp = walkPose(ph, walkK), bob = wp.bob;
        const b = figure({ x: 545, y: FLOOR, s: 1.15, col, lean: 0.08 * walkK + age * 0.12, arms: [[lerp(-0.45 * Math.sin(ph) * walkK + 0.2, -2.5, thr), lerp(0.2, -2.3, thr)], [-0.9, -0.6]], ...wp });
        const c = figure({ x: 420, y: FLOOR, s: 1.02, col, lean: 0.08 * walkK + age * 0.1, arms: [[0.9, 0.6], walkArms(ph + 1, walkK)[1]], ...walkPose(ph + Math.PI, walkK) });
        ctx.strokeStyle = col; ctx.lineWidth = 13 * 1.05; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(c.hands[0][0], c.hands[0][1]); ctx.lineTo(b.hands[1][0], b.hands[1][1]); ctx.stroke();
        if (cur !== undefined) { const u = prog(t, cur, cur + 0.5), k = TR.indexOf(cur); if (u <= 0 && thr > 0.3) coin(b.hands[0][0], b.hands[0][1], 0.5); if (u > 0 && u < 1) coin(lerp(b.hands[0][0], PX[k], u), lerp(b.hands[0][1], LINE_Y + 70, u) - Math.sin(u * Math.PI) * 160, Math.max(0.15, Math.abs(Math.cos(u * 16)))); }
      } else {
        const y0 = FLOOR, ys = SEAT + 92 * 1.15 - 2, yc = SEAT + 92 * 1.02 - 2;
        const legs = k => [[lerp(0.1, 1.5, k), lerp(0.06, 0.1, k)], [lerp(-0.1, 1.42, k), lerp(-0.06, 0.05, k)]];
        const b = figure({ x: 545, y: lerp(y0, ys, sit), s: 1.15, col, lean: 0.1 + age * 0.12, headTilt: -0.15 * sit, arms: [[0.2, 0.3], [-0.9, -0.6]], legs: legs(sit), bob: 0 });
        const c = figure({ x: 420, y: lerp(y0, yc, sit), s: 1.02, col, lean: 0.1 + age * 0.1 + 0.15 * sit, headTilt: 0.35 * sit, arms: [[0.9, 0.6], [0.2, 0.2]], legs: legs(sit), bob: 0 });
        ctx.strokeStyle = col; ctx.lineWidth = 13 * 1.05; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(c.hands[0][0], c.hands[0][1]); ctx.lineTo(b.hands[1][0], b.hands[1][1]); ctx.stroke();
      }
      ctx.restore(); ctx.drawImage(vig, 0, 0);
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => { if (t >= 0 && t < END) cues.push(Object.assign({ t: +t.toFixed(3), type }, o)); };
    LAND.forEach((t, i) => cue(t, 'coin', { n: i }));
    VIS.forEach(v => { cue(v.say, 'bubble'); if (v.rtxt) cue(v.rep, 'bubble'); cue(v.out0 + 0.2, 'steps', { gain: v.fade ? 0.6 : 0.8 }); cue(v.in0 + 0.2, 'steps', { gain: 0.6 }); });
    cue(11.0, 'sigh'); HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    TR.forEach(t => { cue(t, 'whoosh'); cue(t + 0.55, 'photo'); }); cue(SIT0 + 0.3, 'sit'); cue(SPLIT, 'whoosh'); cue(FIN, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      if (t < B0) sceneA(Math.min(t, 11.4));
      else if (t < SPLIT) sceneB(t);
      else { // comparação lado a lado
        const k = sm(t, SPLIT, SPLIT + 0.6);
        const half = (fn, tt, side) => { ctx.save(); ctx.beginPath(); ctx.rect(side ? 540 : 0, 0, 540, H); ctx.clip(); const sc = lerp(0.85, 0.68, k);
          ctx.translate(side ? 810 : 270, 1150); ctx.scale(sc, sc); ctx.translate(-560, -1150); fn(tt); ctx.restore(); };
        if (k < 1) { ctx.save(); ctx.globalAlpha = 1 - k; sceneB(SPLIT); ctx.restore(); }
        ctx.save(); ctx.globalAlpha = k; half(sceneA, 11.4, 0); half(sceneB, SPLIT, 1); ctx.restore();
        ctx.fillStyle = '#3a3a40'; ctx.globalAlpha = k; ctx.fillRect(538, 560, 4, 1100); ctx.globalAlpha = 1;
        const lk = prog(t, SPLIT + 0.5, SPLIT + 0.9) * (1 - prog(t, FIN, FIN + 0.3));
        if (lk > 0) { spaced('JUNTOU', 270, 650, 54, { a: lk, w: 900, sp: 8 }); spaced('TUDO.', 270, 720, 54, { a: lk, w: 900, sp: 8, color: GREY });
          spaced('VIVEU', 810, 650, 54, { a: prog(t, SPLIT + 0.9, SPLIT + 1.3) * (1 - prog(t, FIN, FIN + 0.3)), w: 900, sp: 8 }); spaced('TUDO.', 810, 720, 54, { a: prog(t, SPLIT + 0.9, SPLIT + 1.3) * (1 - prog(t, FIN, FIN + 0.3)), w: 900, sp: 8, color: RED }); }
      }
      // idades
      for (const [a, b, s] of AGES_A) chip(s, prog(t, a, a + 0.3) * (1 - prog(t, b - 0.15, b)));
      for (const [a, b, s] of AGES_B) chip(s, prog(t, a, a + 0.3) * (1 - prog(t, b - 0.15, b)));
      // gancho e textos
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 2.9, 3.2)); if (h1 > 0) { spaced('ELE JUNTAVA DINHEIRO', 540, 360, 52, { a: h1, w: 900, sp: 9 }); spaced('PRA VIVER DEPOIS', 540, 445, 58, { a: h1 * prog(t, 0.6, 1.0), w: 900, sp: 11, color: RED }); }
      const h2 = prog(t, 3.3, 3.7) * (1 - prog(t, 10.4, 10.8)); if (h2 > 0) spaced('SÓ MAIS UM POUCO...', 540, 400, 50, { a: h2, w: 900, sp: 9 });
      const h3 = prog(t, B0 + 0.2, B0 + 0.6) * (1 - prog(t, 22.5, 22.9)); if (h3 > 0) { spaced('O OUTRO TROCAVA', 540, 360, 52, { a: h3, w: 900, sp: 9 }); spaced('MOEDAS POR MOMENTOS', 540, 445, 52, { a: h3 * prog(t, B0 + 0.8, B0 + 1.2), w: 900, sp: 8, color: RED }); }
      // HEADLINE
      const dim = prog(t, 11.25, 11.6) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ctx.globalAlpha = 0.85 * dim; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
        const L = [['DINHEIRO', WHITE], ['VOLTA.', WHITE], ['O TEMPO,', WHITE], ['NÃO.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; txt(s, 540, 650 + i * 150 + (i >= 2 ? 60 : 0), i === 3 ? 170 : 132, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); });
        ctx.save(); ctx.globalAlpha = 0.5 * dim; ctx.translate(540, 1500); ctx.scale(0.55, 0.55); ctx.translate(-HGX, -HGY); hourglass(0.04 - 0.04 * prog(t, 11.3, 14.5), t); ctx.restore(); }
      // final
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ctx.globalAlpha = 0.72 * f; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
        txt('GASTE TEMPO', 540, 480, fit('GASTE TEMPO', 136), { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))) });
        txt('COM QUEM AMA.', 540, 640, fit('COM QUEM AMA.', 136), { color: RED, a: prog(t, FIN + 0.35, FIN + 0.7), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.35, FIN + 0.85))), glow: 'rgba(224,38,43,0.55)' });
        spaced('DINHEIRO A GENTE GANHA DE NOVO.', 540, 790, 36, { a: prog(t, FIN + 1.3, FIN + 1.9), w: 800, sp: 6 });
        spaced('MARCA QUEM VIVE SEM TEMPO', 540, 1700, 38, { a: prog(t, FIN + 2.3, FIN + 2.9), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
