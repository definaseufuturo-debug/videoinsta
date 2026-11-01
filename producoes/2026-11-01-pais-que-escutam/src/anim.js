/*
 * "PAIS QUE ESCUTAM" (Mindloop: a mente em bonequinhos, série pais e filhos). A mesma nota vermelha, duas casas.
 * Na CASA 1 o pai grita, e o filho passa a esconder as provas debaixo do tapete. Na CASA 2 o pai se ajoelha,
 * pergunta "o que foi difícil?" e os dois estudam juntos: 3, 5, 7, 8.
 * Headline: "ELE NÃO PAROU DE ERRAR. PAROU DE TE CONTAR." Final: "ESCUTA ANTES DE GRITAR."
 * 30 s, 9:16, sem narração. Elemento vermelho: a nota baixa.
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
  const win = (t, a, b, f = 0.15) => prog(t, a, a + f) * (1 - prog(t, b, b + f));

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c';
  const P = [{ top: 395, floor: 1000 }, { top: 1045, floor: 1650 }];   // CASA 1 (em cima), CASA 2 (embaixo)
  const PH = 640, DOOR = 890, PX = 300, KX = 610, RUG0 = 690, RUG1 = 880, TBL = 440;
  const SP = 1.32, SK = 0.88;                                              // escala pai / filho
  const T = {
    in0: 0.3, at: 1.8, show: 2.1,
    yell: 3.0, shame: 4.7,
    hide: [6.4, 7.5, 8.5], ask: 9.25, ans: 9.85,
    hl: [11.0, 11.55, 12.5, 13.05], hlIn: 10.6, hlOut: 14.8,
    p2: 15.0, p2show: 15.6, walk: 15.9, kneel: 16.5, q: 16.95, cut: 18.5, g5: 19.8, g7: 20.9, jump: 22.0, ok: 22.3, both: 22.6, fin: 24.4,
  };

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: dois cômodos empilhados ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
      P.forEach((p, i) => {
        g.save(); rr(40, p.top, W - 80, PH - 20, 28); g.clip();
        g.fillStyle = '#121216'; g.fillRect(0, p.top, W, PH);
        const sp = g.createRadialGradient(500, p.floor - 200, 30, 500, p.floor - 200, 600); sp.addColorStop(0, 'rgba(255,255,255,0.09)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, p.top, W, PH);
        const fg = g.createLinearGradient(0, p.floor, 0, p.floor + 70); fg.addColorStop(0, '#27272c'); fg.addColorStop(1, '#141418'); g.fillStyle = fg; g.fillRect(0, p.floor, W, 70); g.fillStyle = '#3a3a40'; g.fillRect(0, p.floor, W, 3);
        // porta
        g.strokeStyle = '#4a4a52'; g.lineWidth = 6; g.strokeRect(DOOR, p.floor - 280, 120, 280); g.fillStyle = '#0d0d10'; g.fillRect(DOOR + 3, p.floor - 277, 114, 274);
        // janela
        g.strokeStyle = '#34343c'; g.lineWidth = 5; g.strokeRect(110, p.floor - 420, 130, 110); g.beginPath(); g.moveTo(175, p.floor - 420); g.lineTo(175, p.floor - 310); g.moveTo(110, p.floor - 365); g.lineTo(240, p.floor - 365); g.stroke();
        g.restore();
        g.strokeStyle = '#2c2c33'; g.lineWidth = 3; rr(40, p.top, W - 80, PH - 20, 28); g.stroke();
      });
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s, dir = o.dir || 1, hr = o.hr || 23, col = o.col || WHITE; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13;
      if (!o.flat) { ctx.shadowColor = 'rgba(255,255,255,0.25)'; ctx.shadowBlur = 10; }
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      for (const [a, b] of o.legs) limb(0, hipY, a, b, 48, 46);
      const hands = o.arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const tilt = o.headTilt || 0, hx = shX + Math.sin(lean + tilt) * (hr + 11), hy = shY - Math.cos(lean + tilt) * (hr + 11);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (!o.flat) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill(); }
      ctx.restore(); ga(1);
      return { head: [o.x + dir * hx * s, o.y + hy * s], hands: hands.map(([x, y]) => [o.x + dir * x * s, o.y + y * s]) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const STAND = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const SIT = { legs: [[1.5, 0.1], [1.42, 0.05]], bob: 0 };
    // ajoelhado: k = 0 em pé, 1 ajoelhado (y do chão = +44)
    const kneelLegs = k => ({ legs: [[lerp(0.1, 1.55, k), lerp(0.06, 0, k)], [lerp(-0.1, 0.05, k), lerp(-0.06, -1.6, k)]], bob: 0 });
    const kneelY = (floor, s, k) => floor + 44 * s * k;

    function paper(x, y, grade, o = {}) { // folha de prova pequena na mão
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); const sc = o.sc || 1; ctx.scale(sc, sc); ga(o.a ?? 1);
      ctx.fillStyle = '#f2efe6'; ctx.fillRect(-20, -26, 40, 52); ctx.fillStyle = '#9a978f'; for (let i = 0; i < 4; i++) ctx.fillRect(-14, -16 + i * 9, 18, 3);
      if (grade) { ctx.strokeStyle = grade === '3' ? RED : '#2a8a4a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(10, 14, 9, 0, TAU); ctx.stroke(); }
      ctx.restore(); ga(1); }
    function card(x, y, grade, k, o = {}) { // folha grande "flutuando" com a nota
      if (k <= 0) return; const red = grade === '3'; ctx.save(); ctx.translate(x, y); const sc = outBack(k) * (o.sc || 1); ctx.scale(sc, sc); ctx.rotate(o.rot || -0.05); ga(clamp(k * 3) * (o.a ?? 1));
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20; ctx.fillStyle = '#f2efe6'; ctx.fillRect(-62, -78, 124, 156); ctx.shadowBlur = 0;
      ctx.fillStyle = '#b5b2aa'; for (let i = 0; i < 4; i++) ctx.fillRect(-46, -58 + i * 16, 60 - (i % 2) * 18, 5);
      ctx.strokeStyle = red ? RED : '#1f1f24'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(12, 32, 40, 0, TAU); ctx.stroke();
      if (red) { ctx.shadowColor = 'rgba(224,38,43,0.6)'; ctx.shadowBlur = 16; }
      ctx.fillStyle = red ? RED : '#1f1f24'; ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(grade, 12, 35); ctx.shadowBlur = 0;
      if (o.check) { ctx.strokeStyle = '#2a8a4a'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-46, 10); ctx.lineTo(-34, 24); ctx.lineTo(-14, -4); ctx.stroke(); }
      ctx.restore(); ga(1); }
    function bubble(parts, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 48, full = parts.map(p => p[0]).join(''), w = tw(full, size) + 60, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3) * (o.a ?? 1));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      let cx = -tw(full, size) / 2; for (const [p, col] of parts) { const pw = tw(p, size); txt(p, cx + pw / 2, 3, size, { color: col }); cx += pw; } ctx.restore(); ga(1); }
    function label(s, x, y, k, col = WHITE) { if (k <= 0) return; spaced(s, x, y, 34, { w: 900, sp: 8, a: k, color: col }); }
    function chip(s, x, y, k) { if (k <= 0) return; ctx.save(); ga(k); ctx.font = '900 34px Inter'; const w = tw(s, 34) + 40; ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 28, w, 56, 28); ctx.fill(); ctx.restore(); txt(s, x, y + 1, 34, { a: k }); }

    // ---------- CASA 1 ----------
    const hidden = t => T.hide.filter(h => t > h + 0.55).length;
    function rug(floor, n, t) {
      const lump = n * 9 + (n > 0 ? 6 : 0);
      ctx.save(); ctx.fillStyle = '#3b3640'; ctx.beginPath(); ctx.moveTo(RUG0, floor); ctx.quadraticCurveTo((RUG0 + RUG1) / 2, floor - 10 - lump * 2, RUG1, floor); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#5a5262'; ctx.lineWidth = 3; ctx.stroke();
      // cantos das provas aparecendo
      for (let i = 0; i < n; i++) { const x = RUG0 + 30 + i * 46, y = floor - 6 - i * 2; ctx.fillStyle = '#e7e3d9'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 26, y - 4); ctx.lineTo(x + 20, y + 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(x + 16, y, 3.5, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
    function house1(t) {
      const p = P[0], F = p.floor;
      rug(F, hidden(t), t);
      // pai
      const loom = sm(t, T.yell, T.yell + 0.5) * (1 - sm(t, 5.9, 6.4)), shake = t > T.yell && t < 5.8 ? Math.sin(t * 38) * 4 * loom : 0;
      const sPar = SP * (1 + 0.22 * loom);
      if (loom > 0) { ga(0.55 * loom); figure({ x: PX - 60, y: F, s: SP * 2.15, col: '#26262e', flat: true, lean: 0.1, arms: [[-2.3 + Math.sin(t * 9) * 0.3, -2.5], [1.0, 1.5]], ...STAND }); ga(1); }
      const angry = t > T.yell - 0.1 && t < 6.0;
      const crossed = t >= 6.0;
      const askA = t > T.ask - 0.2 && t < T.ans + 0.9;
      let arms = angry ? [[-2.2 + Math.sin(t * 9) * 0.35, -2.4 + Math.sin(t * 9) * 0.3], [0.9, 1.4]] : crossed ? [[0.9, -1.4], [0.7, -1.6]] : [[0.15, 0.1], [-0.1, 0]];
      if (askA) arms = [[0.9, 0.2], [0.7, -1.6]];
      figure({ x: PX + shake, y: F, s: sPar, lean: angry ? 0.12 : crossed && !askA ? -0.04 : 0.02, headTilt: crossed && !askA ? -0.25 : 0, dir: crossed && !askA ? -1 : 1, arms, ...STAND });
      // filho
      kid1(t, F);
      // falas
      bubble([['3?! ', RED], ['DE NOVO?!', '#222']], PX + 40, F - 455, win(t, T.yell, 4.5), { size: 54, tail: -0.5, tailDir: -1 });
      bubble([['QUE VERGONHA!', '#222']], PX + 40, F - 455, win(t, T.shame, 5.9), { size: 54, tail: -0.5, tailDir: -1 });
      bubble([['E A PROVA?', '#222']], PX + 40, F - 400, win(t, T.ask, 10.4), { size: 46, tail: -0.5, tailDir: -1 });
      bubble([['NÃO TEVE.', '#222']], KX + 120, F - 300, win(t, T.ans, 10.4), { size: 46, tail: -0.4, tailDir: -1 });
      card(KX, F - 340, '3', win(t, T.show, T.yell + 0.25));
      // contador das provas
      const ci = T.hide.reduce((a, h, i) => (t > h - 0.3 ? i : a), -1);
      if (ci >= 0) { const pp = 1 + 0.08 * Math.exp(-(t - T.hide[ci] + 0.3) * 8); ctx.save(); ctx.translate(840, p.top + 60); ctx.scale(pp, pp); chip(`PROVA ${ci + 2}`, 0, 0, prog(t, T.hide[0] - 0.4, T.hide[0] - 0.2) * (1 - prog(t, 10.3, 10.5))); ctx.restore(); }
    }
    function kid1(t, F) {
      const shrink = sm(t, T.yell + 0.2, T.yell + 0.8), s = SK * (1 - 0.14 * shrink), hr = 28;
      if (t < T.at) { const x = lerp(DOOR + 60, KX, sm(t, T.in0, T.at, x => x)), ph = t * 8; const r = figure({ x, y: F, s, hr, dir: -1, lean: 0.1, arms: [walkArms(ph)[0], [0.6, -0.3]], ...walkPose(ph) }); paper(r.hands[1][0] - 6, r.hands[1][1] - 10, '3'); return; }
      if (t < 6.0) { // mostra a prova e encolhe
        const up = sm(t, T.show - 0.2, T.show + 0.15) * (1 - sm(t, T.yell + 0.3, T.yell + 0.7));
        const r = figure({ x: KX, y: F, s, hr, dir: -1, lean: -0.04 + shrink * 0.2, headTilt: shrink * 0.65, arms: [[lerp(0.6, 2.0, up), lerp(-0.3, 2.3, up)], [0.15 + shrink * 0.1, 0.05]], ...STAND });
        if (t < T.yell + 0.8) paper(r.hands[0][0] - 4, r.hands[0][1] - 8, '3', { rot: up * 0.2 });
        return; }
      // esconde a prova debaixo do tapete, uma por vez
      const X = RUG0 - 10;
      if (t > T.both) { const sk = sm(t, T.both, T.both + 0.5); figure({ x: X - 10, y: lerp(F, F + 43 * s, sk), s, hr, dir: 1, lean: 0.3 * sk, headTilt: 0.7 * sk, legs: [[lerp(0.1, 1.5, sk), lerp(0.06, 0.4, sk)], [lerp(-0.1, 1.4, sk), lerp(-0.06, 0.3, sk)]], arms: [[0.9, 1.6], [0.7, 1.5]], bob: 0 }); return; }
      let kn = 0, slide = -1;
      for (const h of T.hide) { kn = Math.max(kn, sm(t, h, h + 0.3) * (1 - sm(t, h + 0.62, h + 0.9))); if (t > h - 0.35 && t < h + 0.6) slide = prog(t, h + 0.25, h + 0.55); }
      const x = lerp(KX, X, sm(t, 6.0, 6.35)), behind = t > T.ans - 0.4 ? 1 : 0;
      const arms = behind ? [[-0.6, -0.9], [-0.5, -1.0]] : [[lerp(0.4, 1.2, kn), lerp(0.2, 1.7, kn)], [0.15, 0.05]];
      const r = figure({ x, y: kneelY(F, s, kn), s, hr, dir: 1, lean: 0.1 + kn * 0.35, headTilt: behind ? 0.5 : 0.25, arms, ...kneelLegs(kn) });
      if (slide >= 0 && slide < 1) paper(lerp(r.hands[0][0] + 6, RUG0 + 70, slide), lerp(r.hands[0][1], F - 6, slide), '3', { rot: slide * 1.4, sc: 1 - 0.3 * slide });
    }

    // ---------- CASA 2 ----------
    function stool(x, F, h) { ctx.fillStyle = '#2b2b33'; ctx.fillRect(x - 34, F - h, 68, 10); ctx.fillRect(x - 28, F - h, 8, h); ctx.fillRect(x + 20, F - h, 8, h); }
    function table(F, t, on) {
      ctx.fillStyle = '#34343c'; ctx.fillRect(TBL - 120, F - 88, 240, 12); ctx.fillRect(TBL - 108, F - 88, 10, 88); ctx.fillRect(TBL + 98, F - 88, 10, 88);
      // abajur
      if (on > 0) { const g = ctx.createRadialGradient(TBL - 70, F - 150, 10, TBL - 70, F - 150, 300); g.addColorStop(0, `rgba(255,236,200,${0.26 * on})`); g.addColorStop(1, 'rgba(255,236,200,0)'); ctx.fillStyle = g; ctx.fillRect(TBL - 370, F - 450, 600, 450); }
      ctx.strokeStyle = '#5a5a62'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(TBL - 90, F - 88); ctx.lineTo(TBL - 90, F - 150); ctx.lineTo(TBL - 60, F - 170); ctx.stroke();
      ctx.fillStyle = on > 0 ? '#e9dcc0' : '#4a4a52'; ctx.beginPath(); ctx.moveTo(TBL - 80, F - 186); ctx.lineTo(TBL - 40, F - 186); ctx.lineTo(TBL - 30, F - 156); ctx.lineTo(TBL - 90, F - 156); ctx.closePath(); ctx.fill();
    }
    function house2(t) {
      const p = P[1], F = p.floor;
      const atTable = t >= T.cut && t < T.jump;
      table(F, t, atTable ? 1 : 0);
      if (!atTable && t < T.cut) {
        // pai: em pé; depois vai até o filho e se ajoelha
        const xw = lerp(PX, KX - 150, sm(t, T.walk, T.kneel)), walking = t > T.walk && t < T.kneel, ph = t * 7;
        const kn = sm(t, T.kneel, T.kneel + 0.4), hand = sm(t, T.q + 0.6, T.q + 1.0);
        const arms = walking ? walkArms(ph) : kn > 0 ? [[lerp(0.15, 1.35, hand), lerp(0.1, 1.2, hand)], [0.2, 0.1]] : [[0.15, 0.1], [-0.1, 0]];
        figure({ x: xw, y: kneelY(F, SP, kn), s: SP, lean: walking ? 0.1 : 0.05 + kn * 0.05, headTilt: kn * 0.1, arms, ...(walking ? walkPose(ph) : kneelLegs(kn)) });
        // filho: entra, esconde a prova atrás, depois mostra
        if (t < T.at) { const x = lerp(DOOR + 60, KX, sm(t, T.in0, T.at, x => x)), ph2 = t * 8; const r = figure({ x, y: F, s: SK, hr: 28, dir: -1, lean: 0.1, arms: [walkArms(ph2)[0], [0.6, -0.3]], ...walkPose(ph2) }); paper(r.hands[1][0] - 6, r.hands[1][1] - 10, '3'); }
        else {
          const up1 = sm(t, T.show - 0.2, T.show + 0.15) * (1 - sm(t, T.yell + 0.3, T.yell + 0.7));   // mostra junto com a casa 1
          const up2 = sm(t, T.p2show - 0.2, T.p2show + 0.15) * (1 - sm(t, T.q - 0.2, T.q + 0.2));
          const up = Math.max(up1, up2), behind = t > T.yell + 0.7 && t < T.p2show - 0.2;
          const shy = t > T.p2 && t < T.p2show ? Math.sin(t * 30) * 2 : 0, relax = sm(t, T.q + 0.5, T.q + 1.0);
          const arms = behind ? [[-0.6, -0.9], [-0.5, -1.0]] : [[lerp(0.6, 2.0, up), lerp(-0.3, 2.3, up)], [0.15 + relax * 0.5, 0.05 + relax * 0.6]];
          const r = figure({ x: KX + shy, y: F, s: SK, hr: 28, dir: -1, lean: behind ? 0.08 : -0.03, headTilt: behind ? 0.45 : lerp(0.25, -0.15, relax), arms, ...STAND });
          if (!behind) paper(r.hands[0][0] - 4, r.hands[0][1] - 8, '3', { rot: up * 0.2 });
        }
        card(KX, F - 340, '3', Math.max(win(t, T.show, T.yell + 0.25), win(t, T.p2show, T.q - 0.3)));
      }
      if (atTable) {
        const ph = t * 10;
        figure({ x: TBL - 170, y: F + 43 * SP, s: SP, lean: 0.28, headTilt: 0.3, ...SIT, arms: [[1.2, 1.55], [0.9, 1.3]] });
        const r = figure({ x: TBL + 150, y: F + 43 * SK, s: SK, hr: 28, dir: -1, lean: 0.25, headTilt: 0.35, ...SIT, arms: [[1.15 + Math.sin(ph) * 0.12, 1.5 + Math.cos(ph * 1.3) * 0.15], [0.9, 1.2]] });
        stool(TBL - 170, F, 49 * SP); stool(TBL + 150, F, 49 * SK);
        ctx.fillStyle = '#f2efe6'; ctx.fillRect(TBL - 30, F - 96, 70, 8);
        ctx.strokeStyle = '#d9b44a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(r.hands[0][0], r.hands[0][1]); ctx.lineTo(r.hands[0][0] + 6, r.hands[0][1] - 26); ctx.stroke();
        // notas melhorando
        const grade = t < T.g5 ? '3' : t < T.g7 ? '5' : '7', gk = t < T.g5 ? prog(t, T.cut + 0.3, T.cut + 0.5) : t < T.g7 ? prog(t, T.g5, T.g5 + 0.2) : prog(t, T.g7, T.g7 + 0.2);
        card(TBL, F - 330, grade, gk * (1 - prog(t, T.jump - 0.2, T.jump)));
        const ci = t < T.g5 ? 'ESTUDANDO JUNTOS' : t < T.g7 ? 'PROVA 2' : 'PROVA 3';
        const pp = 1 + 0.08 * Math.exp(-(t - (t < T.g5 ? T.cut : t < T.g7 ? T.g5 : T.g7)) * 8);
        ctx.save(); ctx.translate(t < T.g5 ? 700 : 840, p.top + 60); ctx.scale(pp, pp); chip(ci, 0, 0, prog(t, T.cut + 0.2, T.cut + 0.5)); ctx.restore();
      }
      if (t >= T.jump) {
        const j = t - T.jump, hop = Math.abs(Math.sin(j * 6)) * 40 * (1 - prog(t, T.jump + 1.6, T.jump + 2.0));
        figure({ x: TBL - 170, y: F, s: SP, lean: 0, arms: [[-2.6, -2.8], [-2.4, -2.9]].map(([a, b]) => [a + Math.sin(t * 8) * 0.1, b]), ...STAND });
        const r = figure({ x: KX, y: F - hop, s: SK, hr: 28, dir: -1, lean: -0.05, headTilt: -0.2, arms: [[-2.7, -2.9], [-2.3, -2.8]], ...STAND });
        paper(r.hands[0][0], r.hands[0][1] - 10, '8');
        card(KX, F - 360, '8', prog(t, T.jump + 0.1, T.jump + 0.3), { check: true });
        bubble([['CONSEGUI!', '#222']], KX + 230, F - 470, win(t, T.ok, T.fin - 0.3), { size: 46, tail: -0.6, tailDir: -1 });
        stool(TBL - 170, F, 0);
      }
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    for (let k = 0; k < 5; k++) cue(T.in0 + 0.1 + k * 0.32, 'step', { gain: 0.6 });
    cue(T.show + 0.05, 'paper'); cue(T.show + 0.1, 'sting');
    cue(T.yell, 'yell'); cue(T.shame, 'yell', { gain: 0.7 });
    T.hide.forEach(h => { cue(h - 0.3, 'tick'); cue(h + 0.35, 'paper', { gain: 0.6 }); });
    cue(T.ask, 'bubble'); cue(T.ans, 'bubble', { gain: 0.7 });
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(T.p2show, 'paper'); cue(T.kneel + 0.2, 'soft'); cue(T.q, 'bubble');
    cue(T.cut, 'whoosh'); cue(T.g5, 'up', { n: 0 }); cue(T.g7, 'up', { n: 1 }); cue(T.jump + 0.1, 'up', { n: 2 }); cue(T.ok, 'bubble');
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function dimPanel(i, k) { if (k <= 0) return; const p = P[i]; ga(k); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.roundRect(38, p.top - 2, W - 76, PH - 16, 28); ctx.fill(); ga(1); }
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.drawImage(bgc, 0, 0);
      // cada casa recortada no seu painel
      for (const [i, fn] of [[0, house1], [1, house2]]) { const p = P[i]; ctx.save(); ctx.beginPath(); ctx.roundRect(40, p.top, W - 80, PH - 20, 28); ctx.clip(); fn(t); ctx.restore(); }
      // foco: casa 1 de 2.6 a 15; casa 2 de 15 a 22.6; as duas no fim
      const d2 = sm(t, 2.5, 2.9) * (1 - sm(t, T.p2 - 0.3, T.p2));
      const d1 = sm(t, T.p2 - 0.3, T.p2) * (1 - sm(t, T.both, T.both + 0.4));
      dimPanel(1, 0.7 * d2); dimPanel(0, 0.7 * d1);
      // rótulos das casas
      label('CASA 1', 170, P[0].top + 60, prog(t, 0.2, 0.6) * (1 - prog(t, 10.4, 10.6)) * (1 - 0.6 * d1) + prog(t, T.both, T.both + 0.4) * 0);
      label('CASA 2', 170, P[1].top + 60, prog(t, 0.2, 0.6) * (1 - 0.6 * d2) * (1 - prog(t, T.cut - 0.1, T.cut)));
      // no fim, o resultado de cada casa
      const bk = prog(t, T.both + 0.2, T.both + 0.6);
      const bko = bk * (1 - prog(t, T.fin - 0.2, T.fin + 0.2)); if (bko > 0) { label('ESCONDE', 200, P[0].top + 60, bko, RED); label('MELHORA', 200, P[1].top + 60, bko); }
      // gancho
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 10.3, 10.6));
      if (h1 > 0) { spaced('A MESMA NOTA.', 540, 215, 62, { a: h1, w: 900, sp: 12 }); spaced('DUAS CASAS.', 540, 305, 62, { a: h1 * prog(t, 0.7, 1.1), w: 900, sp: 12, color: RED }); }
      const h2 = prog(t, T.p2, T.p2 + 0.4) * (1 - prog(t, T.fin - 0.3, T.fin)); if (h2 > 0) { spaced('NA OUTRA CASA,', 540, 215, 56, { a: h2, w: 900, sp: 10 }); spaced('ELE FOI OUVIDO.', 540, 300, 56, { a: h2 * prog(t, T.p2 + 0.4, T.p2 + 0.8), w: 900, sp: 10, color: RED }); }
      // HEADLINE
      const dim = prog(t, T.hlIn, T.hlIn + 0.4) * (1 - prog(t, T.hlOut - 0.2, T.hlOut + 0.2)); if (dim > 0) { ga(0.86 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['ELE NÃO PAROU', WHITE, 100], ['DE ERRAR.', WHITE, 122], ['PAROU DE', WHITE, 100], ['TE CONTAR.', RED, 128]];
        L.forEach(([s, col, sz], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; txt(s, 540, 650 + i * 150 + (i >= 2 ? 70 : 0), sz, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.9 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('ESCUTA', 540, 470, 160, { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('ANTES DE', 540, 620, 118, { a: prog(t, T.fin + 0.3, T.fin + 0.6), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.3, T.fin + 0.8))) });
        txt('GRITAR.', 540, 775, 170, { color: RED, a: prog(t, T.fin + 0.7, T.fin + 1.0), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.7, T.fin + 1.2))), glow: 'rgba(224,38,43,0.55)' });
        spaced('QUEM TEM MEDO, ESCONDE.', 540, 950, 40, { a: prog(t, 26.0, 26.5), w: 800, sp: 8 });
        spaced('QUEM É OUVIDO, MELHORA.', 540, 1015, 40, { a: prog(t, 26.5, 27.0), w: 800, sp: 8 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1700, 38, { a: prog(t, 27.4, 28.0), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
