/*
 * "RENDA × GASTOS" (Mindloop: a mente em bonequinhos). Duas canecas de vidro: o salário entra pingando por cima e
 * os gastos saem por uma torneira VERMELHA aberta embaixo. Todo mês enche e esvazia. Um fecha a torneira e a caneca
 * enche; o outro compra uma caneca maior (com torneira maior) e continua vazio, até fechar a dele também.
 * Headline: "NÃO É QUANTO ENTRA. É QUANTO VAZA." Final: "FECHA A TORNEIRA." 30 s, 9:16, sem narração.
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
  const rnd = i => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c', LIQ = '#bfe0f5';
  const FLOOR = 1450, Z = 1.38, S = 1.25;
  const MUG = [{ x: 375 }, { x: 705 }], MW = 180, MH = 250, MB = 1350, SPOUT = 975;  // canecas: centro x, largura, altura, fundo
  const AX0 = 240, BX0 = 840;
  const PAY1 = [3.0, 4.25, 5.5, 6.75, 8.0, 9.25], PAY2 = [16.9, 18.1, 19.3, 20.5, 21.7, 22.9], PAY = PAY1.concat(PAY2), PAYV = 0.2;
  const NOTICE = 9.7, HL = [11.0, 11.55, 12.5, 13.05], HL_IN = 10.6, HL_OUT = 14.8;
  const B_GO = 15.0, B_CLOSE = [15.6, 16.4], GROW = 16.5, POINT = 21.3, A_GO = 21.7, A_CLOSE = [22.2, 22.8], FIN = 24.0;
  const SPEND = ['DELIVERY', 'PARCELA 7/12', 'ASSINATURA', 'SÓ HOJE!', 'FATURA', 'IMPULSO', 'APP NOVO', 'JUROS'];
  const SPEND_A2 = ['CANECA NOVA', 'PARCELA 1/24', 'UPGRADE', 'MERECI', 'FATURA'];

  // aberturas das torneiras vermelhas
  const openA = t => t < GROW ? 1 : t < A_CLOSE[0] ? 1.6 : 1.6 * (1 - sm(t, A_CLOSE[0], A_CLOSE[1]));
  const openB = t => 1 - 0.85 * sm(t, B_CLOSE[0], B_CLOSE[1]);
  const capA = t => 1 + 0.69 * outBack(prog(t, GROW, GROW + 0.4));   // volume relativo (caneca maior)
  // simulação dos níveis
  const DT = 1 / 240, NS = Math.ceil(END / DT) + 1, VA = new Float32Array(NS), VB = new Float32Array(NS);
  (function sim() { let a = 0.05, b = 0.05;
    for (let i = 0; i < NS; i++) { const t = i * DT; let inf = 0.03; for (const p of PAY) if (t >= p && t < p + 0.4) inf += PAYV / 0.4;
      a = Math.max(0, a + (inf - 0.26 * openA(t)) * DT); b = Math.max(0, b + (inf - 0.26 * openB(t)) * DT); a = Math.min(a, capA(t) * 0.95); b = Math.min(b, 0.93); VA[i] = a; VB[i] = b; } })();
  const vol = (arr, t) => arr[Math.min(NS - 1, Math.max(0, Math.round(t / DT)))];

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    const fit = (s, size, max, w = 900) => Math.min(size, size * max / tw(s, size, w));
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; if (tot > 980) return spaced(s, x, y, size * 980 / tot, Object.assign({}, o, { sp: sp * 980 / tot })); let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(540, 1150, 50, 540, 1150, 950); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      // banquinhos e canos do salário
      for (const m of MUG) { g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3; g.beginPath(); g.roundRect(m.x - 70, MB, 140, FLOOR - MB, 8); g.fill(); g.stroke();
        g.fillStyle = '#2b2b31'; g.fillRect(m.x - 14, 830, 28, 120); g.strokeRect(m.x - 14, 830, 28, 120); g.beginPath(); g.roundRect(m.x - 24, 818, 48, 22, 6); g.fill(); g.stroke(); g.beginPath(); g.roundRect(m.x - 30, 930, 60, 34, 8); g.fill(); g.stroke(); g.fillRect(m.x - 9, 960, 18, 16); }
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
      ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill();
      ctx.restore(); ga(1);
      const rx = (x, y) => [o.x + dir * x * s, o.y + y * s];
      return { head: rx(hx, hy), hands: hands.map(([x, y]) => rx(x, y)) };
    }
    const STAND = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const CROUCH = k => ({ legs: [[lerp(0.1, 1.05, k), lerp(0.06, -0.85, k)], [lerp(-0.1, 0.55, k), lerp(-0.06, -1.2, k)]], bob: 37 * k });
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };

    // ---------- caneca, líquido, torneira ----------
    function mug(cx, sc, level, t, label) {
      const w = MW * sc, h = MH * sc, x0 = cx - w / 2, top = MB - h;
      ctx.save();
      // líquido
      if (level > 0.002) { const ly = MB - 8 - (h - 16) * level; ctx.save(); ctx.beginPath(); ctx.roundRect(x0 + 8, top + 8, w - 16, h - 16, 14); ctx.clip();
        const g = ctx.createLinearGradient(0, ly, 0, MB); g.addColorStop(0, 'rgba(191,224,245,0.85)'); g.addColorStop(1, 'rgba(120,170,210,0.75)'); ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(x0, MB); for (let i = 0; i <= 12; i++) { const x = x0 + w * i / 12; ctx.lineTo(x, ly + Math.sin(i * 1.3 + t * 6) * 3); } ctx.lineTo(x0 + w, MB); ctx.closePath(); ctx.fill(); ctx.restore(); }
      // vidro
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.strokeStyle = 'rgba(239,239,239,0.85)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.roundRect(x0, top, w, h, 18); ctx.fill(); ctx.stroke();
      const sd = cx > 540 ? -1 : 1; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(cx + sd * w / 2, top + h * 0.45, h * 0.2, -Math.PI / 2, Math.PI / 2, sd < 0); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0 + 22, top + 26); ctx.lineTo(x0 + 22, top + h * 0.6); ctx.stroke();
      if (label && label.a > 0) spaced(label.s, cx, top + h * 0.55, 26 * sc, { a: label.a, w: 900, sp: 2, color: '#0e2236' });
      ctx.restore();
    }
    function tap(cx, sc, open, t, a = 1) { // torneira vermelha na frente, embaixo da caneca
      const y = MB - 30, s = 0.9 + 0.45 * (sc - 1) / 0.3 * 0.6; ctx.save(); ctx.translate(cx, y); ctx.scale(s, s); ga(a);
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.6)'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.roundRect(-22, -20, 44, 40, 10); ctx.fill(); ctx.beginPath(); ctx.roundRect(-11, 10, 22, 34, 6); ctx.fill();
      ctx.shadowBlur = 0; ctx.save(); ctx.translate(0, -28); ctx.rotate((1 - Math.min(1, open)) * Math.PI * 1.5); ctx.fillStyle = RED; ctx.fillRect(-30, -6, 60, 12); ctx.fillRect(-6, -18, 12, 24); ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fillStyle = '#9b1418'; ctx.fill(); ctx.restore();
      ctx.restore(); ga(1);
    }
    function stream(cx, sc, open, level, t, gid) {
      const s = 0.9 + 0.45 * (sc - 1) / 0.3 * 0.6, y0 = MB - 30 + 44 * s, wdt = (level > 0.004 ? 1 : 0.3) * open * 9;
      if (wdt > 0.6) { ctx.save(); ctx.strokeStyle = 'rgba(191,224,245,0.85)'; ctx.lineCap = 'round'; ctx.lineWidth = wdt; ctx.beginPath(); ctx.moveTo(cx, y0); for (let y = y0; y <= FLOOR; y += 8) ctx.lineTo(cx + Math.sin(y * 0.08 + t * 18) * 1.5, y); ctx.stroke();
        ga(0.6); ctx.fillStyle = 'rgba(150,190,220,0.6)'; ctx.beginPath(); ctx.ellipse(cx, FLOOR + 6, 30 + wdt * 4, 7, 0, 0, TAU); ctx.fill();
        for (let i = 0; i < 5; i++) { const ph = (t * 3 + i / 5 + gid) % 1; ga(0.7 * (1 - ph)); ctx.beginPath(); ctx.arc(cx + (i % 2 ? 1 : -1) * (6 + ph * 30), FLOOR - Math.sin(ph * Math.PI) * 26, 3, 0, TAU); ctx.fill(); }
        ctx.restore(); ga(1); }
      else if (open > 0.02) { const ph = (t * 1.6 + gid) % 1; ctx.save(); ctx.fillStyle = 'rgba(191,224,245,0.85)'; ctx.beginPath(); ctx.arc(cx, lerp(y0 + 4, FLOOR, ph * ph), 5, 0, TAU); ctx.fill(); ctx.restore(); }
    }
    function drips(cx, t, level, sc) {
      const surf = MB - 8 - (MH * sc - 16) * level; ctx.save(); ctx.fillStyle = 'rgba(191,224,245,0.95)';
      for (let i = 0; i < 3; i++) { const ph = (t * 1.1 + i / 3 + cx * 0.01) % 1, y = lerp(SPOUT, surf, ph * ph); ctx.beginPath(); ctx.ellipse(cx, y, 5, 8, 0, 0, TAU); ctx.fill(); }
      for (const p of PAY) { const u = (t - p) / 0.6; if (u < 0 || u > 1) continue; ctx.fillStyle = 'rgba(191,224,245,0.9)'; ctx.fillRect(cx - 7, SPOUT, 14, (surf - SPOUT) * Math.min(1, u * 3) * (1 - Math.max(0, u - 0.6) * 2.5 * 0)); }
      ctx.restore();
    }

    // ---------- gastos voando ----------
    const pops = [];
    PAY1.forEach((p, i) => { pops.push({ m: 0, t: p + 0.45, s: SPEND[(i * 2) % SPEND.length] }); pops.push({ m: 1, t: p + 0.95, s: SPEND[(i * 2 + 3) % SPEND.length] }); });
    PAY2.slice(0, 5).forEach((p, i) => pops.push({ m: 0, t: p + 0.45, s: SPEND_A2[i] }));
    function pill(s, x, y, a, sc) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(a); const w = tw(s, 30) + 30; ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -24, w, 48, 24); ctx.fill(); txt(s, 0, 2, 30, { color: '#1a1a1e' }); ctx.restore(); ga(1); }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    PAY.forEach((p, i) => cue(p, 'pay', { n: i })); pops.forEach(p => cue(p.t, 'spend', { m: p.m }));
    cue(NOTICE, 'notice'); HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 })); cue(B_CLOSE[0], 'valve'); cue(GROW, 'grow'); cue(POINT, 'point'); cue(A_CLOSE[0], 'valve'); cue(FIN, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1);
      ctx.save(); ctx.translate(540, 1440); ctx.scale(Z, Z); ctx.translate(-540, -FLOOR); ctx.drawImage(bgc, 0, 0);
      const sA = 1 + 0.3 * outBack(prog(t, GROW, GROW + 0.4)), lA = vol(VA, t) / capA(t), lB = vol(VB, t), oA = openA(t), oB = openB(t);
      // luz sobre B quando percebe
      const lk = prog(t, NOTICE, NOTICE + 0.5); if (lk > 0) { const x = t < B_GO ? BX0 : MUG[1].x + 70; const g = ctx.createRadialGradient(x, 1180, 20, x, 1180, 380); g.addColorStop(0, `rgba(255,240,220,${0.18 * lk})`); g.addColorStop(1, 'rgba(255,240,220,0)'); ctx.fillStyle = g; ctx.fillRect(x - 400, 780, 800, 800); }
      // fluxos
      drips(MUG[0].x, t, lA, sA); drips(MUG[1].x, t, lB, 1);
      stream(MUG[0].x, sA, Math.min(oA, 1.6), lA, t, 0); stream(MUG[1].x, 1, oB, lB, t, 0.5);
      mug(MUG[0].x, sA, lA, t); mug(MUG[1].x, 1, lB, t, { s: 'RESERVA', a: prog(lB, 0.45, 0.6) });
      tap(MUG[0].x, sA, Math.min(oA, 1), t); tap(MUG[1].x, 1, oB, t);
      // plaquinhas
      ctx.save(); for (const m of MUG) { ctx.fillStyle = '#3a3a42'; ctx.beginPath(); ctx.roundRect(m.x - 78, 880, 156, 44, 10); ctx.fill(); txt('SALÁRIO', m.x, 903, 28, { color: WHITE }); } ctx.restore();

      // ---- A ----
      const payJoy = PAY.reduce((s, p) => s + Math.max(0, Math.sin(prog(t, p, p + 0.9) * Math.PI)), 0) * (t < HL_IN ? 1 : 0.6);
      const walkA = t > A_GO && t < A_CLOSE[0] - 0.05, axa = t < A_GO ? AX0 : lerp(AX0, MUG[0].x - 95, sm(t, A_GO, A_CLOSE[0] - 0.05, v => v)), crA = sm(t, A_CLOSE[0] - 0.1, A_CLOSE[0] + 0.2) * (1 - sm(t, A_CLOSE[1] + 0.5, A_CLOSE[1] + 0.9));
      const growJoy = t > GROW - 0.4 && t < GROW + 1.2 ? Math.sin(prog(t, GROW - 0.4, GROW + 1.2) * Math.PI) : 0, sweat = t > GROW + 1.5 && t < A_GO ? 1 : 0;
      const turnA = t > A_CLOSE[0] - 0.1 && t < A_CLOSE[1] + 0.2 ? Math.sin(t * 16) * 0.3 : 0;
      let aArms = walkA ? [[0.45 * Math.sin(t * 7), 0.2], [-0.45 * Math.sin(t * 7), 0.2]] : crA > 0 ? [[lerp(0.2, 1.35, crA) + turnA, lerp(0.1, 1.0, crA)], [0.5, 0.3]] : [[lerp(0.3, 2.6, Math.max(payJoy, growJoy)), lerp(0.2, 2.9, Math.max(payJoy, growJoy))], [lerp(-0.2, -2.4, growJoy), lerp(-0.1, -2.7, growJoy)]];
      const looked = t > POINT + 0.2 && t < A_GO ? 1 : 0;
      figure({ x: axa, y: FLOOR, s: S, lean: walkA ? 0.1 : sweat * 0.15 + crA * 0.25, headTilt: crA ? 0.4 : looked ? -0.1 : 0.35 - payJoy * 0.4 + sweat * 0.2, arms: aArms, ...(walkA ? walkPose(t * 7) : crA > 0 ? CROUCH(crA) : STAND) });
      if (sweat) { for (let i = 0; i < 2; i++) { const ph = (t * 1.4 + i * 0.5) % 1; ga(1 - ph); ctx.fillStyle = LIQ; ctx.beginPath(); ctx.ellipse(axa + 38 - i * 50, 1450 - 210 * S + ph * 50, 5, 8, 0, 0, TAU); ctx.fill(); ga(1); } }

      // ---- B ----
      const walkB = t > B_GO && t < B_CLOSE[0] - 0.05, bxa = t < B_GO ? BX0 : lerp(BX0, MUG[1].x + 95, sm(t, B_GO, B_CLOSE[0] - 0.05, v => v)), crB = sm(t, B_CLOSE[0] - 0.1, B_CLOSE[0] + 0.2) * (1 - sm(t, B_CLOSE[1] + 0.3, B_CLOSE[1] + 0.7));
      const turnB = t > B_CLOSE[0] - 0.1 && t < B_CLOSE[1] + 0.1 ? Math.sin(t * 16) * 0.3 : 0, point = t > POINT && t < A_CLOSE[1] ? sm(t, POINT, POINT + 0.3) : 0;
      const proud = t > 20 && t < POINT ? sm(t, 20, 20.4) : 0;
      let bArms = walkB ? [[0.45 * Math.sin(t * 7), 0.2], [-0.45 * Math.sin(t * 7), 0.2]] : crB > 0 ? [[lerp(0.2, 1.35, crB) + turnB, lerp(0.1, 1.0, crB)], [0.5, 0.3]] : point > 0 ? [[lerp(0.2, 1.6, point), lerp(0.1, 1.55, point)], [0.1, 0.05]] : t < HL_IN ? [[lerp(0.3, 2.6, payJoy), lerp(0.2, 2.9, payJoy)], [0.2, 0.1]] : [[lerp(0.2, -0.5, proud), lerp(0.1, -1.0, proud)], [lerp(-0.1, -0.6, proud), lerp(-0.05, -1.4, proud)]];
      const look = t > NOTICE && t < HL_IN ? 0.75 : 0;
      const bR = figure({ x: bxa + (look ? Math.sin(t * 30) * 0.8 : 0), y: FLOOR, s: S, dir: -1, lean: walkB ? 0.1 : crB * 0.25, headTilt: crB ? 0.4 : look ? look : 0.35 - payJoy * 0.4, arms: bArms, ...(walkB ? walkPose(t * 7) : crB > 0 ? CROUCH(crB) : STAND) });
      const ek = sm(t, NOTICE + 0.1, NOTICE + 0.35, outBack); if (ek > 0 && t < HL_IN) txt('!', BX0 - 10, 1080, 100, { color: RED, scale: ek });

      // gastos saindo
      for (const p of pops) { const u = prog(t, p.t, p.t + 1.6); if (u <= 0 || u >= 1) continue; const m = MUG[p.m], dirx = p.m === 0 ? 1 : -1; pill(p.s, m.x + dirx * (30 + 90 * outC(u)), FLOOR - 40 - (p.m === 0 ? 290 : 170) * outC(u), (1 - prog(u, 0.7, 1)) * clamp(u * 6), 0.8 + 0.2 * outBack(prog(u, 0, 0.2))); }
      ctx.restore();

      // ---- textos ----
      const mo = PAY.filter(p => t >= p).length, mchip = prog(t, 2.9, 3.2) * (1 - prog(t, HL_IN - 0.3, HL_IN)) + prog(t, PAY2[0] - 0.1, PAY2[0] + 0.2) * (1 - prog(t, FIN - 0.4, FIN));
      if (mchip > 0 && mo > 0) { const pp = 1 + 0.08 * Math.exp(-(t - PAY[mo - 1]) * 8); spaced(`MÊS ${mo}`, 540, 575, 50 * pp, { w: 900, sp: 10, a: mchip }); ga(mchip); ctx.fillStyle = RED; ctx.fillRect(480, 622, 120, 5); ga(1); }
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, NOTICE - 0.4, NOTICE)); if (h1 > 0) { spaced('O SALÁRIO ENTRA', 540, 290, 58, { a: h1, w: 900, sp: 12 }); spaced('PINGANDO.', 540, 375, 58, { a: h1, w: 900, sp: 12 }); spaced('E SAI DE TORNEIRA ABERTA.', 540, 460, 44, { a: h1 * prog(t, 0.9, 1.3), w: 900, sp: 9, color: RED }); }
      const h2 = prog(t, NOTICE, NOTICE + 0.3) * (1 - prog(t, HL_IN - 0.2, HL_IN)); if (h2 > 0) spaced('ATÉ QUE UM OLHOU PRA BAIXO', 540, 380, 44, { a: h2, w: 900, sp: 8 });
      // HEADLINE
      const dim = prog(t, HL_IN, HL_IN + 0.4) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ga(0.84 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['NÃO É QUANTO', WHITE, 118], ['ENTRA.', WHITE, 128], ['É QUANTO', WHITE, 118], ['VAZA.', RED, 150]];
        L.forEach(([s, col, sz], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; txt(s, 540, 640 + i * 150 + (i >= 2 ? 60 : 0), fit(s, sz, 960), { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // virada
      const h3 = prog(t, 15.3, 15.7) * (1 - prog(t, POINT - 0.3, POINT)); if (h3 > 0) { spaced('UM FECHOU A TORNEIRA.', 540, 290, 52, { a: h3, w: 900, sp: 10 }); spaced('O OUTRO COMPROU', 540, 375, 52, { a: h3 * prog(t, 16.4, 16.8), w: 900, sp: 10 }); spaced('UMA CANECA MAIOR.', 540, 460, 52, { a: h3 * prog(t, 16.4, 16.8), w: 900, sp: 10, color: RED }); }
      const h4 = prog(t, POINT, POINT + 0.3) * (1 - prog(t, FIN - 0.4, FIN)); if (h4 > 0) { spaced('NÃO PRECISAVA', 540, 320, 58, { a: h4, w: 900, sp: 12 }); spaced('DE MAIS CANECA.', 540, 410, 58, { a: h4 * prog(t, POINT + 0.5, POINT + 0.8), w: 900, sp: 12, color: RED }); }
      // final
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.8 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('FECHA A', 540, 420, 150, { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))) });
        txt('TORNEIRA.', 540, 590, fit('TORNEIRA.', 165, 980), { color: RED, a: prog(t, FIN + 0.35, FIN + 0.7), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.35, FIN + 0.85))), glow: 'rgba(224,38,43,0.55)' });
        spaced('ANTES DE PEDIR', 540, 740, 40, { a: prog(t, 25.2, 25.7), w: 800, sp: 8 });
        spaced('UMA CANECA MAIOR.', 540, 800, 40, { a: prog(t, 25.6, 26.1), w: 800, sp: 8 });
        spaced('MARCA QUEM VÊ O SALÁRIO SUMIR NO DIA 10', 540, 1700, 32, { a: prog(t, 26.6, 27.2), w: 900, sp: 5, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
