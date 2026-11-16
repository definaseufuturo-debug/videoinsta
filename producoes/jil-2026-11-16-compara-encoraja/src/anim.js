/*
 * "POR QUE VOCÊ NÃO É IGUAL AO SEU IRMÃO?": estilo pôster escuro (fundo preto, holofote, bonecos brancos lisos com reflexo).
 * Em cima, o pai compara: o filho mostra o papel, o irmão segura o troféu, e o filho encolhe até largar o papel.
 * Embaixo, o pai se abaixa, olha o papel: "EU VI O SEU ESFORÇO." e o filho cresce. "20 anos depois": em cima o filho
 * adulto compara o próprio filho com a mesma frase; embaixo ele se abaixa e encoraja. Final: Efésios 4:29.
 * Único vermelho: o balão da comparação. Sem narração, ~18 s, 9:16. Cenas e frases próprias.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, END = 18.2;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));

  const BG = '#060607', FIG = '#e6e6ea', FIG2 = '#b9b9c2', RED = '#e0262b', MU = '#8d8d96', AMB = '#f2c27a', PAGE = '#e9e5dc', GRAY = '#8e8e98';
  const PAN = [{ oy: 330, kind: 'compara' }, { oy: 1040, kind: 'encoraja' }], PH = 650, FLOOR = 560;
  const T_SKIP = 7.4, A2 = 8.8, T_END = 14.2;
  const SA = 1.6, SK = 1.3, SS = 1.55;

  function create(TL, env) {
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = o.font || `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; ctx.fillStyle = o.color || FIG; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, font) => { ctx.font = font; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = size * 0.3; ctx.font = `800 ${size}px Inter`; const ws = [...s].map(c => ctx.measureText(c).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1); let cx = x - (o.align === 'left' ? 0 : tot / 2); [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w: 800, color: o.color || MU, a: o.a ?? 1 }); cx += ws[i] + sp; }); }
    function serif(parts, x, y, size, a = 1) { if (a <= 0) return; const fN = `400 ${size}px Serif`, fI = `italic 400 ${size}px Serif`; let tot = 0; parts.forEach(p => { p.w = tw(p[0], p[1] ? fI : fN); tot += p.w; }); let cx = x - tot / 2; parts.forEach(p => { txt(p[0], cx, y, size, { font: p[1] ? fI : fN, align: 'left', color: p[2] || FIG, a }); cx += p.w; }); }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }

    // ---------- boneco liso (manequim) ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s; ctx.save(); ctx.translate(o.x, o.y); ctx.scale((o.dir || 1) * s, s);
      const hipY = -92 + (o.crouch || 0) + (o.bob || 0), lean = o.lean || 0, shX = Math.sin(lean) * 64, shY = hipY - Math.cos(lean) * 64;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const col = o.col || FIG;
      const draw = (lw, c) => { ctx.strokeStyle = c; ctx.lineWidth = lw;
        o.legs.forEach(([a, b]) => limb(0, hipY, a, b, 48, 46));
        ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
        return o.arms.map(([a, b]) => limb(shX, shY + 4, a, b, 40, 38)); };
      if (!o.flat) { ctx.shadowColor = 'rgba(255,255,255,0.18)'; ctx.shadowBlur = 14; }
      draw(19, o.col2 || FIG2); ctx.shadowBlur = 0; const hands = draw(13, col);
      const hx = shX + Math.sin(lean + (o.nod || 0)) * 36, hy = shY - Math.cos(lean + (o.nod || 0)) * 36, hr = o.head || 25;
      const g = ctx.createRadialGradient(hx - hr * 0.35, hy - hr * 0.4, 2, hx, hy, hr); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, col); g.addColorStop(1, '#9d9da6'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
      ctx.restore();
      return hands.map(([x, y]) => [o.x + (o.dir || 1) * x * s, o.y + y * s]);
    }
    function figRefl(o, floorY) { ctx.save(); ctx.translate(0, floorY * 2); ctx.scale(1, -1); ga(0.13); figure(Object.assign({}, o, { flat: true })); ga(1); ctx.restore(); }
    const P = {
      stand: { lean: 0, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[-0.15, -0.1], [0.15, 0.1]] },
      ear: { lean: 0.04, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[1.9, -2.2], [0.15, 0.1]] },
      show: { lean: 0.05, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[1.3, 1.9], [1.1, 1.8]] },
      sit: { lean: 0.05, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.4, 0.5], [0.3, 0.3]] },
      clap: { lean: 0.08, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[1.5, 2.4], [1.3, 2.6]] },
      wave: { lean: 0, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[2.7, 3.1], [0.15, 0.1]] },
      cower: { lean: -0.25, crouch: 46, legs: [[1.7, 0.6], [1.6, 0.5]], arms: [[2.4, 3.3], [2.2, 3.1]] },
      point: { lean: 0.2, crouch: 0, legs: [[-0.25, -0.15], [0.3, 0.2]], arms: [[1.7, 1.75], [0.3, 0.2]] },
      kneel: { lean: 0.3, crouch: 46, legs: [[1.5, 0], [0.15, -1.55]], arms: [[0.9, 0.6], [0.6, 0.4]] },
      hug: { lean: 0.4, crouch: 46, legs: [[1.5, 0], [0.15, -1.55]], arms: [[1.5, 2.3], [1.3, 2.4]] },
      hugK: { lean: 0.15, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[1.6, 2.4], [1.4, 2.5]] },
      old: { lean: 0.18, crouch: 3, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[0.3, 0.2], [0.2, 0.1]] },
    };
    const mix = (a, b, k) => ({ lean: lerp(a.lean, b.lean, k), crouch: lerp(a.crouch, b.crouch, k), legs: a.legs.map((l, i) => [lerp(l[0], b.legs[i][0], k), lerp(l[1], b.legs[i][1], k)]), arms: a.arms.map((l, i) => [lerp(l[0], b.arms[i][0], k), lerp(l[1], b.arms[i][1], k)]) });
    const withArms = (p, arms) => Object.assign({}, p, { arms });

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ---------- objetos ----------
    const mid = h => [(h[0][0] + h[1][0]) / 2, (h[0][1] + h[1][1]) / 2];
    function phoneAt([x, y], s) { glow(x, y, 70 * s, 'rgba(170,200,255,A)', 0.35); ctx.fillStyle = '#1b1b20'; rr(x - 9 * s, y - 16 * s, 18 * s, 32 * s, 4 * s); ctx.fill(); ctx.fillStyle = '#cfe0ff'; rr(x - 6 * s, y - 13 * s, 12 * s, 24 * s, 2 * s); ctx.fill(); }
    function paper(h, s) { const [x, y] = mid(h); ctx.save(); ctx.translate(x, y - 14 * s); ctx.rotate(-0.08); ctx.fillStyle = PAGE; rr(-30 * s, -38 * s, 60 * s, 76 * s, 3); ctx.fill(); ctx.fillStyle = '#6b6b75'; for (let i = 0; i < 4; i++) ctx.fillRect(-20 * s, (-22 + i * 13) * s, (i === 0 ? 40 : 30) * s, 4 * s); ctx.fillStyle = AMB; ctx.beginPath(); ctx.arc(0, 26 * s, 6 * s, 0, TAU); ctx.fill(); ctx.restore(); }
    function bubble(lines, x, y, k, red, size = 40) { if (k <= 0) return; const b = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(b, b);
      const f = `900 ${size}px Inter`, w = Math.max(...lines.map(l => tw(l, f))) + 70, h = lines.length * size * 1.18 + 44;
      rr(-w / 2, -h / 2, w, h, 30); ctx.fillStyle = red ? '#121214' : '#e9e5dc'; ctx.fill(); if (red) { ctx.lineWidth = 6; ctx.strokeStyle = RED; ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-18, h / 2 - 3); ctx.lineTo(-30, h / 2 + 40); ctx.lineTo(22, h / 2 - 3); ctx.closePath(); ctx.fillStyle = red ? '#121214' : '#e9e5dc'; ctx.fill(); if (red) { ctx.stroke(); ctx.fillStyle = '#121214'; ctx.fillRect(-16, h / 2 - 8, 36, 8); }
      const c = red ? RED : '#1a1a1d'; lines.forEach((l, i) => txt(l, 0, (i - (lines.length - 1) / 2) * size * 1.18 + 2, size, { color: c }));
      ctx.restore(); }
    function stage(oy, F, warm, LX = 820) {
      ctx.fillStyle = BG; ctx.fillRect(0, oy, W, PH);
      const cone = ctx.createLinearGradient(0, oy, 0, F); cone.addColorStop(0, `rgba(255,${lerp(240, 225, warm)},${lerp(225, 170, warm)},0.15)`); cone.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(LX - 15, oy + 64); ctx.lineTo(LX + 15, oy + 64); ctx.lineTo(Math.min(1080, LX + 300), F); ctx.lineTo(Math.max(0, LX - 560), F); ctx.closePath(); ctx.fill();
      glow(LX - 200, F, 520, 'rgba(255,214,150,A)', 0.08 + 0.18 * warm);
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(LX, oy); ctx.lineTo(LX, oy + 40); ctx.stroke();
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(LX - 45, oy + 66); ctx.quadraticCurveTo(LX, oy + 26, LX + 45, oy + 66); ctx.closePath(); ctx.fill(); glow(LX, oy + 70, 70, 'rgba(255,230,190,A)', 0.8);
      const fg = ctx.createLinearGradient(0, F, 0, oy + PH); fg.addColorStop(0, '#16161a'); fg.addColorStop(1, '#060607'); ctx.fillStyle = fg; ctx.fillRect(0, F, W, oy + PH - F); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, F, W, 2);
    }
    function chair(x, F, s, dir, card) { const seat = F - 46 * s + 10 * s; ctx.fillStyle = '#2e2e35'; rr(x - 34 * s, seat, 68 * s, 10 * s, 3); ctx.fill(); ctx.fillRect(x - 28 * s, seat, 7 * s, F - seat); ctx.fillRect(x + 21 * s, seat, 7 * s, F - seat); ctx.fillRect(x - dir * 34 * s - (dir > 0 ? 0 : 7 * s), seat - 70 * s, 7 * s, 70 * s);
      if (card) { const cx = x - dir * 30 * s; ctx.save(); ctx.translate(cx, seat - 42 * s); ctx.fillStyle = PAGE; rr(-46, -20, 92, 40, 4); ctx.fill(); txt(card, 0, 2, 22, { color: '#1a1a1d' }); ctx.restore(); } }
    function table(x0, x1, F, cake, t) { const ty = F - 118; ctx.fillStyle = '#2c2c32'; rr(x0, ty, x1 - x0, 14, 4); ctx.fill(); ctx.fillRect(x0 + 16, ty + 14, 11, F - ty - 14); ctx.fillRect(x1 - 27, ty + 14, 11, F - ty - 14);
      if (cake) { const cx = (x0 + x1) / 2; ctx.fillStyle = '#d9d6cf'; rr(cx - 38, ty - 40, 76, 40, 6); ctx.fill(); ctx.fillStyle = '#bdb8ad'; ctx.fillRect(cx - 38, ty - 24, 76, 5); ctx.fillStyle = '#f0ede6'; ctx.fillRect(cx - 3, ty - 64, 6, 24); const fl = 1 + 0.15 * Math.sin(t * 17); glow(cx, ty - 72, 90, 'rgba(255,200,120,A)', 0.55); ctx.fillStyle = AMB; ctx.beginPath(); ctx.ellipse(cx, ty - 72, 5 * fl, 10 * fl, 0, 0, TAU); ctx.fill(); } }
    function platform(F) { ctx.fillStyle = '#1d1d22'; ctx.fillRect(600, F - 64, 480, 64); ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(600, F - 64, 480, 2); }

    const walk = ph => { const a = Math.sin(ph) * 0.45; return { lean: 0.06, crouch: 0, bob: -Math.abs(Math.cos(ph)) * 4, legs: [[a, a - 0.25 * Math.max(0, a)], [-a, -a - 0.25 * Math.max(0, -a)]], arms: [[-a * 0.6, -a * 0.4], [a * 0.6, a * 0.4]] }; };
    // ---------- atos ----------
    function trophy([x, y], s) { glow(x, y - 20 * s, 110 * s, 'rgba(242,194,122,A)', 0.45); ctx.fillStyle = AMB;
      ctx.beginPath(); ctx.moveTo(x - 22 * s, y - 48 * s); ctx.lineTo(x + 22 * s, y - 48 * s); ctx.quadraticCurveTo(x + 20 * s, y - 14 * s, x, y - 10 * s); ctx.quadraticCurveTo(x - 20 * s, y - 14 * s, x - 22 * s, y - 48 * s); ctx.fill();
      ctx.fillRect(x - 4 * s, y - 12 * s, 8 * s, 12 * s); ctx.fillRect(x - 14 * s, y, 28 * s, 6 * s); ctx.lineWidth = 4 * s; ctx.strokeStyle = AMB; ctx.beginPath(); ctx.arc(x - 22 * s, y - 36 * s, 9 * s, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 22 * s, y - 36 * s, 9 * s, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke(); }
    function floorPaper(x, F, s) { ctx.save(); ctx.translate(x, F - 4); ctx.scale(1, 0.32); ctx.rotate(0.3); ctx.fillStyle = PAGE; rr(-30 * s, -38 * s, 60 * s, 76 * s, 3); ctx.fill(); ctx.restore(); }
    // gen 0: pai e filho (irmão com troféu à esquerda); gen 1: o filho adulto e o neto (com o irmão do neto)
    function act(u, p, oy, t, gen) {
      const F = oy + FLOOR, top = p.kind === 'compara'; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      const S = gen ? SS : SA, dadX = gen ? 450 : 430, kidX = 770, broX = 150;
      stage(oy, F, top ? 0 : 0.25 + 0.55 * sm(u, 1.2, 2.4), 760);
      const bro = Object.assign({ x: broX, y: F, s: SK * 1.12, dir: 1, t }, P.show); figRefl(bro, F); const bh = figure(bro); trophy(mid(bh), 1.1);
      const shake = Math.sin(t * 40) * 2.5;
      if (top) {
        const shr = 1 - 0.32 * sm(u, 0.6, 4.6), drop = u > 2.7;
        const dad = Object.assign({ x: dadX, y: F, s: S, dir: u > 2.9 ? -1 : 1, t }, u > 2.9 ? withArms(P.stand, [[-0.6, -0.4], [-0.5, -0.3]]) : mix(P.point, P.stand, sm(u, 2.4, 2.9)));
        const kp = drop ? mix(P.show, P.cower, sm(u, 2.7, 3.4)) : P.show;
        const kid = Object.assign({ x: kidX + (u < 2.7 ? shake * (1 - prog(u, 1.5, 2.7)) : 0), y: F, s: SK * shr, dir: -1, t, head: 27, nod: drop ? -0.4 * sm(u, 2.8, 3.4) : 0 }, kp);
        figRefl(dad, F); figRefl(kid, F); figure(dad); const kh = figure(kid);
        if (!drop) paper(kh, SK * shr * 0.9); else floorPaper(kidX - 70, F, 1.2);
        bubble(['POR QUE VOCÊ NÃO É', 'IGUAL AO SEU IRMÃO?'], 520, oy + 104, gen ? prog(u, 0.0, 0.25) * (1 - prog(u, 2.6, 2.9)) : 1 - prog(u, 2.6, 2.9), true, 50);
        if (u > 4.6) { ga(prog(u, 4.6, 5.0)); spaced('ENCOLHEU', kidX, oy + 250, 26, { color: FIG }); ga(1); }
      } else {
        const k = sm(u, 1.3, 2.0), h = sm(u, 3.6, 4.2);
        const dp = u < 1.3 ? P.stand : mix(mix(P.stand, P.kneel, k), P.hug, h);
        const dad = Object.assign({ x: lerp(dadX, kidX - 180, k * 0.7 + h * 0.3), y: F, s: S, dir: 1, t }, dp);
        const grow = 1 + 0.14 * sm(u, 2.6, 3.6);
        const kp = mix(P.show, P.hugK, h);
        const kid = Object.assign({ x: kidX, y: F, s: SK * grow, dir: -1, t, head: 27 }, kp);
        figRefl(dad, F); figRefl(kid, F); figure(dad); const kh = figure(kid);
        if (h < 0.5) paper(kh, SK * grow * 0.9);
        if (h > 0.5) glow((dad.x + kidX) / 2, F - 200, 220, 'rgba(255,220,160,A)', 0.25 * h);
        bubble(gen ? ['OLHA, PAI!', 'EU CONSEGUI!'] : ['OLHA, PAI!', 'EU CONSEGUI!'], 770, oy + 110, gen ? prog(u, 0.0, 0.25) * (1 - prog(u, 1.2, 1.4)) : 1 - prog(u, 1.2, 1.4), false, 40);
        bubble(['EU VI O', 'SEU ESFORÇO.'], 450, oy + 110, prog(u, 1.5, 1.8) * (1 - prog(u, 4.6, 4.9)), false, 48);
        if (u > 4.6) { ga(prog(u, 4.6, 5.0)); spaced('CRESCEU', kidX - 80, oy + 120, 26, { color: AMB }); ga(1); }
      }
      ctx.restore();
    }

    // ---------- som ----------
    cue(0, 'amb'); cue(0.05, 'bang'); cue(1.6, 'kneel'); cue(1.5, 'soft'); cue(2.75, 'paper'); cue(3.0, 'steps'); cue(3.7, 'hug'); cue(4.6, 'sigh');
    cue(T_SKIP + 0.1, 'whoosh'); cue(T_SKIP + 0.2, 'tickstart'); cue(A2 - 0.1, 'tickstop');
    cue(A2 + 0.05, 'bang'); cue(A2 + 1.5, 'soft'); cue(A2 + 1.6, 'kneel'); cue(A2 + 2.75, 'paper'); cue(A2 + 3.7, 'hug');
    cue(T_END + 0.2, 'end');

    function label(s, y, a) { spaced(s, 70, y, 24, { align: 'left', color: MU, a }); }
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const inA2 = t >= A2 - 0.15;
      const skipDim = sm(t, T_SKIP - 0.2, T_SKIP + 0.2) * (1 - sm(t, A2 - 0.4, A2)), endDim = sm(t, T_END, T_END + 0.6);
      const vis = (1 - skipDim * 0.85) * (1 - endDim * 0.8);
      PAN.forEach(p => { act(Math.max(0, inA2 ? t - A2 : t), p, p.oy, t, inA2 ? 1 : 0); ga(1); if (vis < 1) { ctx.globalAlpha = 1 - vis; ctx.fillStyle = BG; ctx.fillRect(0, p.oy, W, PH); ctx.globalAlpha = 1; } });
      const la = (1 - skipDim) * (1 - endDim);
      label(inA2 ? 'O FILHO DO PAI QUE COMPARAVA' : 'PAI QUE COMPARA', PAN[0].oy - 26, la);
      label(inA2 ? 'O FILHO DO PAI QUE ENCORAJAVA' : 'PAI QUE ENCORAJA', PAN[1].oy - 26, la);
      if (t < T_SKIP) { const fo = 1 - sm(t, T_SKIP - 0.4, T_SKIP);
        serif([['Ele achou que comparar ', false], ['ia motivar.', true]], 540, 150, 52, fo);
        serif([['O filho aprendeu que ', false], ['nunca basta.', true, AMB]], 540, 228, 54, sm(t, 4.0, 4.6) * fo); }
      else if (t < T_END) { serif([['E um dia, ', false], ['ele compara igual.', true]], 540, 185, 58, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END))); }
      if (skipDim > 0) { serif([['20 anos ', false], ['depois', true]], 540, 990, 110, skipDim); }
      if (endDim > 0) { serif([['Seu filho não precisa ser igual ao irmão.', false]], 540, 800, 46, endDim); serif([['Precisa saber ', false], ['que você o vê.', true, AMB]], 540, 885, 56, sm(t, T_END + 0.5, T_END + 1.1));
        const va = sm(t, T_END + 1.4, T_END + 2.0); ga(va); rr(110, 1000, 860, 190, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"Não saia da vossa boca nenhuma palavra torpe,', true]], 540, 1050, 36, va); serif([['mas só a que for boa para promover a edificação."', true]], 540, 1098, 36, va); spaced('EFÉSIOS 4:29', 540, 1152, 22, { color: AMB, a: va }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
