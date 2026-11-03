/*
 * "MESMO PRAZO" (Mindloop: a mente em bonequinhos). Os dois têm 30 dias. O calendário perde uma folha por dia:
 * um faz um pouquinho todo dia (a barra dele enche devagar); o outro fica no celular ("TENHO TEMPO.").
 * No dia 29 ele percebe. Headline: "O PRAZO / ERA O MESMO. / O PREÇO / NÃO." Última noite: café, suor, relógio
 * correndo, xícara derramada; o outro dorme. Dia 30 (a folha vermelha do PRAZO): os dois entregam, mas um com 0 h de sono.
 * Final: "UM POUCO POR DIA." 30 s, 9:16, sem narração.
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

  const WHITE = '#efefef', GREY = '#8d8d94', RED = '#e0262b', BG = '#0a0a0c', DARK = '#1b1b20';
  const S = 1.32, FLOOR = 1470, SEAT = 1395;                     // escala dos bonecos, chão, assento
  const AX = 250, BX = 830, Z = 1.45;                                        // quadril de A (esquerda, olha p/ direita) e B (direita, olha p/ esquerda)
  const DESK_Y = 1335, A_DESK = [345, 505], B_DESK = [575, 735];   // tampo das mesas
  const CAL_X = 540, CAL_Y = 560, CAL_W = 330, CAL_H = 300;        // bloco de calendário
  // folhas: viram do dia 1 ao 29, acelerando
  const FLIP = []; { let tt = 2.7, d = 0.62; for (let i = 0; i < 28; i++) { FLIP.push(+tt.toFixed(3)); tt += d; d = Math.max(0.13, d * 0.9); } }
  const D29 = FLIP[27];                                            // ~10.0
  const SEE = D29 + 0.25, HL = [11.5, 12.05, 12.95, 13.5], HL_OUT = 15.1;
  const NIGHT = 15.3, CLOCK = [15.6, 16.9, 18.2, 19.5, 20.6], CUPS = [15.9, 17.3, 18.7], SPILL = 19.7;
  const MORN = 21.4, FLIP30 = 21.7, FIN = 23.6;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário fixo: chão, duas cadeiras, duas mesas ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(540, 1250, 50, 540, 1250, 950); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3; const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.stroke(); };
      // cadeiras
      for (const [x, d] of [[AX, 1], [BX, -1]]) { rr(x - 60, SEAT, 120, 18, 6); rr(x - d * 70 - 9, SEAT - 150, 18, 168, 6); g.fillRect(x - 6, SEAT + 18, 12, FLOOR - SEAT - 18); }
      // mesas
      for (const [x0, x1] of [A_DESK, B_DESK]) { rr(x0, DESK_Y, x1 - x0, 20, 5); g.fillRect(x0 + 14, DESK_Y + 20, 12, FLOOR - DESK_Y - 20); g.fillRect(x1 - 26, DESK_Y + 20, 12, FLOOR - DESK_Y - 20); }
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho ----------
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
      ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10;
      if (o.sleep) { ctx.strokeStyle = BG; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx + hr * 0.25, ey); ctx.lineTo(hx + hr * 0.5, ey); ctx.moveTo(hx + hr * 0.6, ey); ctx.lineTo(hx + hr * 0.85, ey); ctx.stroke(); }
      else { const er = o.wide ? 4.6 : 3.4; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, er, 0, TAU); ctx.arc(hx + hr * 0.72, ey, er, 0, TAU); ctx.fill();
        if (o.tired) { ctx.strokeStyle = 'rgba(10,10,12,0.7)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey + 4, 5, 0.2, Math.PI - 0.2); ctx.moveTo(hx + hr * 0.72 + 5, ey + 4); ctx.arc(hx + hr * 0.72, ey + 4, 5, 0.2, Math.PI - 0.2); ctx.stroke(); } }
      ctx.restore(); ga(1);
      const rx = (x, y) => [o.x + dir * x * s, o.y + y * s];
      return { head: rx(hx, hy), hands: hands.map(([x, y]) => rx(x, y)) };
    }
    const SIT = [[1.5, 0.05], [1.42, 0.0]];
    function phone(x, y, on) { ctx.save(); if (on > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, 150); g.addColorStop(0, `rgba(170,215,255,${0.36 * on})`); g.addColorStop(1, 'rgba(170,215,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - 150, y - 150, 300, 300); }
      ctx.fillStyle = on > 0 ? 'rgba(220,240,255,0.95)' : '#555'; ctx.beginPath(); ctx.roundRect(x - 10, y - 16, 20, 32, 4); ctx.fill(); ctx.restore(); }
    // notebook: base no tampo, tela aberta (k = 0 fechado, 1 aberto); dir = para onde a tela "olha"
    function laptop(x, k, on, far) { ctx.save(); ctx.fillStyle = '#4a4a54'; ctx.fillRect(x - 55, DESK_Y - 8, 110, 8);
      const a = lerp(0.02, 1.75, k), hx = x + far * 55, hy = DESK_Y - 6; ctx.strokeStyle = on > 0 ? mixc('#4a4a54', '#cfe6ff', on) : '#5a5a64'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - far * Math.cos(a) * 105, hy - Math.sin(a) * 105); ctx.stroke(); ctx.restore();
      if (on > 0 && k > 0.8) { const gx = x - far * 10, gy = DESK_Y - 60; const g = ctx.createRadialGradient(gx, gy, 5, gx, gy, 220); g.addColorStop(0, `rgba(170,215,255,${0.30 * on})`); g.addColorStop(1, 'rgba(170,215,255,0)'); ctx.fillStyle = g; ctx.fillRect(gx - 220, gy - 220, 440, 440); } }
    function mug(x, k, steam, t, tip = 0) { if (k <= 0) return; ctx.save(); ctx.translate(x, DESK_Y); ctx.scale(outBack(k), outBack(k)); ctx.translate(14, 0); ctx.rotate(tip * 1.5); ctx.translate(-14, 0);
      ctx.fillStyle = '#d8d8dc'; ctx.beginPath(); ctx.roundRect(-14, -36, 28, 36, 4); ctx.fill(); ctx.strokeStyle = '#d8d8dc'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(16, -18, 8, -1.3, 1.3); ctx.stroke();
      if (steam && tip < 0.1) { ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 2; i++) { ctx.beginPath(); for (let j = 0; j <= 10; j++) { const yy = -44 - j * 5, xx = -5 + i * 10 + Math.sin(j * 0.8 + t * 5 + i) * 4; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); } }
      ctx.restore(); }
    function bubble(parts, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 46, full = parts.map(p => p[0]).join(''), w = tw(full, size) + 60, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      let cx = -tw(full, size) / 2; for (const [p, col] of parts) { const pw = tw(p, size); txt(p, cx + pw / 2, 3, size, { color: col }); cx += pw; } ctx.restore(); ga(1); }
    // barra de progresso no chão, abaixo de cada um
    function bar(x, v, a, lab, labA, done) { if (a <= 0) return; ga(a); const bw = 330, y = 1640; txt(`${Math.round(v * 100)}%`, x, y - 70, 84, { color: done ? WHITE : v > 0.001 ? WHITE : GREY });
      ctx.fillStyle = '#2b2b31'; ctx.beginPath(); ctx.roundRect(x - bw / 2, y - 14, bw, 28, 14); ctx.fill(); if (v > 0.005) { ctx.fillStyle = WHITE; ctx.beginPath(); ctx.roundRect(x - bw / 2, y - 14, Math.max(28, bw * v), 28, 14); ctx.fill(); }
      ga(1); if (lab && labA > 0) spaced(lab, x, y + 70, 44, { w: 900, sp: 5, a: a * labA, color: lab.startsWith('0') ? RED : WHITE }); }
    // calendário de destacar
    function calPage(n, x, y, rot, a, red) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ga(a); ctx.fillStyle = red ? RED : '#f2f2f2'; ctx.shadowColor = red ? 'rgba(224,38,43,0.6)' : 'rgba(0,0,0,0)'; ctx.shadowBlur = red ? 30 : 0; ctx.beginPath(); ctx.roundRect(-CAL_W / 2, 0, CAL_W, CAL_H - 40, 14); ctx.fill(); ctx.shadowBlur = 0;
      const tc = red ? WHITE : '#1a1a1e'; txt('DIA', 0, 52, 40, { color: red ? WHITE : '#77777f', w: 800 }); txt(String(n), 0, 150, 140, { color: tc }); if (red) txt('PRAZO', 0, 228, 38, { color: WHITE, w: 900 }); ctx.restore(); ga(1); }
    function calendar(t, a) { if (a <= 0) return; const shown = t >= FLIP30 ? 30 : 1 + FLIP.filter(f => t >= f).length;
      ctx.save(); ga(a); ctx.fillStyle = '#3a3a42'; ctx.beginPath(); ctx.roundRect(CAL_X - CAL_W / 2 - 10, CAL_Y - 10, CAL_W + 20, CAL_H, 18); ctx.fill(); ctx.restore();
      const pa = a; calPage(shown, CAL_X, CAL_Y + 30, 0, pa, shown === 30);
      // folhas que caem
      const fl = FLIP.map((f, i) => [f, i + 1]).concat([[FLIP30, 29]]);
      for (const [f, n] of fl) { const u = (t - f) / 0.5; if (u < 0 || u > 1) continue; const sd = n % 2 ? 1 : -1; calPage(n, CAL_X + sd * u * 380, CAL_Y + 30 - Math.sin(u * 2) * 60 + u * u * 160, sd * u * 1.6, pa * (1 - u) * (1 - u), false); }
      ctx.save(); ga(a); ctx.fillStyle = '#55555e'; ctx.fillRect(CAL_X - CAL_W / 2 - 10, CAL_Y - 10, CAL_W + 20, 36); for (let i = 0; i < 6; i++) { ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(CAL_X - 125 + i * 50, CAL_Y + 8, 7, 0, TAU); ctx.fill(); } ctx.restore(); ga(1); }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => { if (t >= 0 && t < END) cues.push(Object.assign({ t: +t.toFixed(3), type }, o)); };
    FLIP.forEach((t, i) => cue(t, 'flip', { n: i })); cue(FLIP30, 'flip', { n: 29 });
    cue(3.6, 'bubble'); cue(6.4, 'bubble'); cue(SEE, 'shock'); cue(SEE + 0.15, 'drop');
    HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    CLOCK.forEach(t => cue(t, 'clock')); CUPS.forEach(t => cue(t, 'cup')); cue(SPILL, 'spill'); cue(NIGHT, 'night');
    cue(MORN, 'morning'); cue(FLIP30 + 0.2, 'stamp'); cue(FIN, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(540, FLOOR); ctx.scale(Z, Z); ctx.translate(-540, -FLOOR); ctx.drawImage(bgc, 0, 0);
      const day = 1 + FLIP.filter(f => t >= f).length;                           // dia mostrado
      const night = sm(t, NIGHT, NIGHT + 0.6) * (1 - sm(t, MORN, MORN + 0.6));
      const isNight = t >= NIGHT && t < MORN + 0.3, morn = t >= MORN;
      // ---- A (esquerda): celular → percebe → noite de desespero → entrega moído
      const seen = t >= SEE, panic = sm(t, SEE, SEE + 0.3, outBack);
      const aOpen = sm(t, NIGHT, NIGHT + 0.4);
      const aTired = sm(t, 17, MORN);
      const aCol = mixc(WHITE, GREY, sm(t, MORN, MORN + 0.8) * 0.7);
      laptop(A_DESK[0] + 95, aOpen, isNight ? 1 : 0, 1);
      // xícaras de café na mesa de A
      const cupX = [A_DESK[0] + 30, A_DESK[0] + 168, A_DESK[0] + 60];
      CUPS.forEach((tc, i) => { const tip = i === 1 ? sm(t, SPILL, SPILL + 0.25) : 0; mug(cupX[i], prog(t, tc, tc + 0.3), true, t, tip); });
      if (t > SPILL + 0.15) { const k = sm(t, SPILL + 0.15, SPILL + 1.0, outC); ctx.save(); ctx.fillStyle = '#6b4a33'; ctx.beginPath(); ctx.ellipse(cupX[1] + 55, DESK_Y - 1, 70 * k, 6, 0, 0, TAU); ctx.fill();
        const dk = prog(t, SPILL + 0.6, SPILL + 2.2); if (dk > 0) { for (let i = 0; i < 3; i++) { const yy = DESK_Y + 20 + ((dk * 3 + i * 0.33) % 1) * (FLOOR - DESK_Y - 20); ctx.beginPath(); ctx.arc(A_DESK[1] - 6, yy, 5, 0, TAU); ctx.fill(); } ctx.beginPath(); ctx.ellipse(A_DESK[1] + 10, FLOOR + 4, 50 * dk, 7 * dk, 0, 0, TAU); ctx.fill(); } ctx.restore(); }
      let aPose;
      if (!seen) aPose = { lean: -0.12, headTilt: 0.5, arms: [[0.9, 0.2], [0.75, 0.05]] };                          // recostado no celular
      else if (t < NIGHT) aPose = { lean: lerp(-0.12, 0.05, panic), headTilt: lerp(0.5, -0.15, panic), arms: [[lerp(0.9, -2.4, panic), lerp(0.2, -2.7, panic)], [lerp(0.75, -2.2, panic), lerp(0.05, -2.5, panic)]], wide: true };
      else if (!morn) { const f = t * 26; aPose = { lean: 0.42 + Math.sin(t * 3) * 0.03, headTilt: 0.2, arms: [[1.25 + Math.sin(f) * 0.12, 1.75 + Math.sin(f) * 0.2], [1.15 + Math.sin(f + 2) * 0.12, 1.7 + Math.cos(f) * 0.2]], wide: true, tired: false }; }
      else { const sl = sm(t, MORN + 0.3, MORN + 1.2); aPose = { lean: lerp(0.42, 0.75, sl), headTilt: lerp(0.2, 0.8, sl), arms: [[lerp(1.25, 1.5, sl), lerp(1.75, 1.0, sl)], [lerp(1.15, 0.3, sl), lerp(1.7, 0.1, sl)]] }; }
      const ra = figure({ x: AX, y: SEAT + 92 * S, s: S, col: aCol, legs: SIT, ...aPose });
      if (!seen) phone(ra.hands[0][0] + 6, ra.hands[0][1] - 10, 1);
      else { const k = prog(t, SEE, SEE + 0.5); if (k < 1 || t < NIGHT) { const px = lerp(ra.hands[0][0], AX + 120, outC(k)), py = lerp(ra.hands[0][1], FLOOR - 16, k * k); phone(px, py, (1 - k) * 0.8); } else phone(AX + 120, FLOOR - 16, 0); }
      // suor
      if (isNight && t > 16.5) { for (let i = 0; i < 3; i++) { const u = ((t * 1.3 + i * 0.33) % 1); ctx.save(); ga(0.8 * (1 - u)); ctx.fillStyle = '#cfe6ff'; ctx.beginPath(); const hx = ra.head[0] - 30 + i * 14, hy = ra.head[1] - 10 + u * 60; ctx.arc(hx, hy, 6, 0, TAU); ctx.fill(); ctx.restore(); } ga(1); }
      // "!" vermelho
      const ek = sm(t, SEE, SEE + 0.25, outBack); if (ek > 0 && t < 11.2) txt('!', ra.head[0], ra.head[1] - 120, 120, { color: RED, scale: ek, glow: 'rgba(224,38,43,0.6)' });
      // ---- B (direita): trabalha um pouco todo dia → termina → dorme → acorda e espreguiça
      const bDone = t >= FLIP[25] + 0.2;
      const bOn = !bDone ? 1 : 1 - prog(t, FLIP[25] + 0.2, FLIP[25] + 0.6);
      laptop(B_DESK[1] - 95, 1 - sm(t, FLIP[26], FLIP[26] + 0.5) * 0.98, bOn, -1);
      let bPose;
      if (t < FLIP[25] + 0.2) { const f = t * 9; bPose = { lean: 0.3, headTilt: 0.25, arms: [[1.2 + Math.sin(f) * 0.06, 1.7], [1.1 + Math.sin(f + 1.5) * 0.06, 1.65]] }; }
      else if (t < NIGHT) { const r = sm(t, FLIP[25] + 0.2, FLIP[25] + 0.8); bPose = { lean: lerp(0.3, -0.1, r), headTilt: lerp(0.25, -0.1, r), arms: [[lerp(1.2, -2.6, r), lerp(1.7, -2.9, r)], [lerp(1.1, 0.3, r), lerp(1.65, 0.1, r)]] }; }
      else if (!morn) { const br = Math.sin(t * 2.2) * 0.02; bPose = { lean: -0.16 + br, headTilt: -0.45, arms: [[0.35, 0.2], [0.2, 0.05]], sleep: true }; }
      else { const st = sm(t, MORN + 0.4, MORN + 1.1, outBack); bPose = { lean: lerp(-0.16, -0.05, st), headTilt: lerp(-0.45, -0.15, st), arms: [[lerp(0.35, 3.0, st), lerp(0.2, 3.1, st)], [lerp(0.2, -2.9, st), lerp(0.05, -3.0, st)]], sleep: t < MORN + 0.4 }; }
      const rb = figure({ x: BX, y: SEAT + 92 * S, s: S, dir: -1, legs: SIT, ...bPose });
      if (isNight && t > NIGHT + 0.4 && !morn) { for (let i = 0; i < 3; i++) { const u = ((t * 0.55 + i / 3) % 1); txt('Z', rb.head[0] - 30 - u * 70, rb.head[1] - 60 - u * 140, 40 + u * 26, { a: Math.sin(u * Math.PI) * 0.85, w: 900 }); } }
      ctx.restore();
      // noite: escurece tudo, menos o abajur/tela de A
      if (night > 0) { ctx.save(); ga(0.62 * night); ctx.fillStyle = '#03040c'; ctx.fillRect(0, 0, W, H); ctx.restore(); ga(1);
        const lx = 540 + (A_DESK[0] + 60 - 540) * Z, ly = FLOOR - (FLOOR - DESK_Y + 80) * Z, g = ctx.createRadialGradient(lx, ly, 10, lx, ly, 380); g.addColorStop(0, `rgba(200,225,255,${0.20 * night})`); g.addColorStop(1, 'rgba(200,225,255,0)'); ctx.fillStyle = g; ctx.fillRect(lx - 380, ly - 380, 760, 760); }
      // barras
      const ba = prog(t, 2.4, 2.8) * (1 - prog(t, 11.0, 11.3)) + prog(t, NIGHT + 0.3, NIGHT + 0.7) * (1 - prog(t, FIN - 0.3, FIN));
      const vB = clamp((day - 1) / 26), vA = !isNight && !morn ? 0 : morn ? 1 : clamp(Math.floor(prog(t, 15.8, 21.0) * 9) / 9 + 0.02 * Math.sin(t * 9));
      bar(270, t < NIGHT ? 0 : vA, ba, morn ? '0 H DE SONO' : '', prog(t, MORN + 0.8, MORN + 1.2), morn);
      bar(810, vB, ba, morn ? '8 H DE SONO' : '', prog(t, MORN + 1.0, MORN + 1.4), true);
      // falas
      bubble([['TENHO ', '#222'], ['TEMPO.', RED]], 330, 930, prog(t, 3.5, 3.65) * (1 - prog(t, 5.0, 5.15)), { tail: -0.6, tailDir: -1 });
      bubble([['AINDA FALTA ', '#222'], ['MUITO.', RED]], 380, 930, prog(t, 6.3, 6.45) * (1 - prog(t, 7.9, 8.05)), { tail: -0.75, tailDir: -1, size: 42 });
      // calendário (some na noite: vira relógio)
      const ca = prog(t, 0.0, 0.3) * (1 - prog(t, 11.0, 11.3)) + prog(t, MORN, MORN + 0.3) * (1 - prog(t, FIN - 0.3, FIN));
      calendar(t, ca);
      if (t > NIGHT && t < MORN + 0.3) { const a = prog(t, NIGHT + 0.1, NIGHT + 0.5) * (1 - prog(t, MORN - 0.1, MORN + 0.2)); const hrs = ['23:00', '00:00', '02:00', '04:00', '05:59']; const i = CLOCK.filter(c => t >= c).length; const s = i ? hrs[i - 1] : '22:00';
        const pp = 1 + 0.12 * Math.exp(-(t - (i ? CLOCK[i - 1] : NIGHT)) * 7); txt(s, 540, 690, 170 * pp, { a, color: i >= 4 ? RED : WHITE, glow: i >= 4 ? 'rgba(224,38,43,0.55)' : 'rgba(255,255,255,0.15)' }); }
      // textos de topo
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 3.0, 3.3)); if (h1 > 0) { spaced('OS DOIS TINHAM', 540, 330, 60, { a: h1, w: 900, sp: 12 }); spaced('30 DIAS', 540, 420, 72, { a: h1 * prog(t, 0.6, 1.0), w: 900, sp: 16, color: RED }); }
      const h2 = prog(t, 3.4, 3.8) * (1 - prog(t, 10.9, 11.2)); if (h2 > 0) { spaced('UM COMEÇOU NO DIA 1.', 540, 330, 50, { a: h2, w: 900, sp: 8 }); spaced('O OUTRO, NO DIA 29.', 540, 410, 50, { a: h2 * prog(t, D29, D29 + 0.3), w: 900, sp: 8, color: RED }); }
      const h3 = prog(t, NIGHT + 0.2, NIGHT + 0.6) * (1 - prog(t, MORN - 0.2, MORN + 0.1)); if (h3 > 0) spaced('A ÚLTIMA NOITE', 540, 400, 60, { a: h3, w: 900, sp: 12 });
      const h4 = prog(t, MORN + 0.3, MORN + 0.7) * (1 - prog(t, FIN - 0.3, FIN)); if (h4 > 0) spaced('OS DOIS ENTREGARAM.', 540, 400, 52, { a: h4, w: 900, sp: 8 });
      // HEADLINE
      const dim = prog(t, 11.1, 11.5) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ga(0.86 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['O PRAZO', WHITE], ['ERA O MESMO.', WHITE], ['O PREÇO', WHITE], ['NÃO.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; txt(s, 540, 640 + i * 150 + (i >= 2 ? 60 : 0), i === 3 ? 170 : 118, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // final
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.7 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('UM POUCO', 540, 480, 140, { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))) });
        txt('POR DIA.', 540, 640, 160, { color: RED, a: prog(t, FIN + 0.35, FIN + 0.7), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.35, FIN + 0.85))), glow: 'rgba(224,38,43,0.55)' });
        spaced('PESA MENOS QUE TUDO NUMA NOITE.', 540, 790, 36, { a: prog(t, 25.0, 25.6), w: 800, sp: 6 });
        spaced('MARCA QUEM DEIXA TUDO', 540, 1650, 38, { a: prog(t, 26.2, 26.8), w: 900, sp: 7, color: RED });
        spaced('PRA ÚLTIMA HORA', 540, 1710, 38, { a: prog(t, 26.2, 26.8), w: 900, sp: 7, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
