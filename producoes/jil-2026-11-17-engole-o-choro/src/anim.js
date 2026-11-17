/*
 * "ENGOLE O CHORO!": estilo pôster escuro (fundo preto, holofote, bonecos brancos lisos com reflexo).
 * Em cima, o filho caiu e chora; o pai aponta: "ENGOLE O CHORO!". O filho enxuga, levanta duro e o choro some por dentro.
 * Embaixo, o pai se abaixa: "PODE CHORAR. EU TÔ AQUI." e abraça. "20 anos depois": o filho adulto faz igual com o próprio
 * filho (em cima, a mesma frase; embaixo, o abraço). Final: Eclesiastes 3:4.
 * Único vermelho: o balão do "ENGOLE O CHORO!". Sem narração, ~18 s, 9:16. Cenas e frases próprias.
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

  const BG = '#060607', FIG = '#e6e6ea', FIG2 = '#b9b9c2', RED = '#e0262b', MU = '#8d8d96', AMB = '#f2c27a', TEAR = '#9cc6ec';
  const PAN = [{ oy: 330, kind: 'engole' }, { oy: 1040, kind: 'acolhe' }], PH = 650, FLOOR = 560;
  const T_SKIP = 7.4, A2 = 8.8, T_END = 14.2;
  const SA = 1.6, SK = 1.4, SS = 1.6;

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
      const s = o.s, d = o.dir || 1; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(d * s, s);
      const hipY = -92 + (o.crouch || 0) + (o.bob || 0), lean = o.lean || 0, shX = Math.sin(lean) * 64, shY = hipY - Math.cos(lean) * 64;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const col = o.col || FIG;
      const draw = (lw, c) => { ctx.strokeStyle = c; ctx.lineWidth = lw;
        o.legs.forEach(([a, b]) => limb(0, hipY, a, b, 48, 46));
        ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
        return o.arms.map(([a, b]) => limb(shX, shY + 4, a, b, 40, 38)); };
      if (!o.flat) { ctx.shadowColor = 'rgba(255,255,255,0.18)'; ctx.shadowBlur = 14; }
      draw(19, FIG2); ctx.shadowBlur = 0; const hands = draw(13, col);
      const hx = shX + Math.sin(lean + (o.nod || 0)) * 36, hy = shY - Math.cos(lean + (o.nod || 0)) * 36, hr = o.head || 25;
      const g = ctx.createRadialGradient(hx - hr * 0.35, hy - hr * 0.4, 2, hx, hy, hr); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, col); g.addColorStop(1, '#9d9da6'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
      ctx.restore();
      o.hp = [o.x + d * hx * s, o.y + hy * s, hr * s];
      return hands.map(([x, y]) => [o.x + d * x * s, o.y + y * s]);
    }
    function figRefl(o, floorY) { ctx.save(); ctx.translate(0, floorY * 2); ctx.scale(1, -1); ga(0.13); figure(Object.assign({}, o, { flat: true })); ga(1); ctx.restore(); }
    const P = {
      stand: { lean: 0, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[-0.15, -0.1], [0.15, 0.1]] },
      stiff: { lean: -0.04, crouch: 0, legs: [[-0.06, -0.06], [0.06, 0.06]], arms: [[-0.06, -0.04], [0.06, 0.04]] },
      sitcry: { lean: 0.14, crouch: 4, legs: [[-0.12, -0.1], [0.14, 0.08]], arms: [[2.55, 3.55], [2.35, 3.35]] },
      sitwipe: { lean: 0.08, crouch: 2, legs: [[-0.12, -0.1], [0.14, 0.08]], arms: [[2.3, 3.8], [0.2, 0.1]] },
      point: { lean: 0.22, crouch: 0, legs: [[-0.25, -0.15], [0.3, 0.2]], arms: [[1.75, 1.8], [0.3, 0.2]] },
      kneel: { lean: 0.3, crouch: 46, legs: [[1.5, 0], [0.15, -1.55]], arms: [[0.9, 0.6], [0.6, 0.4]] },
      hug: { lean: 0.45, crouch: 46, legs: [[1.5, 0], [0.15, -1.55]], arms: [[1.5, 2.3], [1.3, 2.4]] },
      hugK: { lean: 0.15, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[1.6, 2.4], [1.4, 2.5]] },
    };
    const mix = (a, b, k) => ({ lean: lerp(a.lean, b.lean, k), crouch: lerp(a.crouch, b.crouch, k), legs: a.legs.map((l, i) => [lerp(l[0], b.legs[i][0], k), lerp(l[1], b.legs[i][1], k)]), arms: a.arms.map((l, i) => [lerp(l[0], b.arms[i][0], k), lerp(l[1], b.arms[i][1], k)]) });

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

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
    // lágrimas caindo do rosto (intensidade k)
    function tears(hp, k, t, dir) { if (k <= 0.02) return; const [x, y, r] = hp; ctx.fillStyle = TEAR; ga(0.9 * k);
      for (let i = 0; i < 4; i++) { const ph = (t * 1.7 + i / 4) % 1, side = i % 2 ? 1 : -1; const tx = x + side * r * 0.55 + dir * r * 0.25, ty = y + r * 0.2 + ph * 70;
        ctx.beginPath(); ctx.ellipse(tx, ty, 5, 8, 0, 0, TAU); ctx.fill(); }
      ga(1); }
    // brinquedo (bloquinhos derrubados no chão) — o motivo do choro
    function blocks(x, F, s) { ctx.fillStyle = '#3a3a42'; rr(x - 30 * s, F - 22 * s, 22 * s, 22 * s, 3); ctx.fill(); rr(x - 4 * s, F - 22 * s, 22 * s, 22 * s, 3); ctx.fill();
      ctx.save(); ctx.translate(x + 40 * s, F - 10 * s); ctx.rotate(0.5); rr(-11 * s, -11 * s, 22 * s, 22 * s, 3); ctx.fill(); ctx.restore(); }

    // ---------- atos ----------
    function act(u, p, oy, t, gen) {
      const F = oy + FLOOR, top = p.kind === 'engole'; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      const S = gen ? SS : SA, dadX = gen ? 300 : 290, kidX = 700;
      stage(oy, F, top ? 0 : 0.25 + 0.55 * sm(u, 1.2, 2.4), 720);
      blocks(kidX + 150, F, 1.4);
      const sob = Math.sin(t * 26) * 3;
      if (top) {
        // pai aponta, filho chora sentado; depois enxuga e levanta duro, sem lágrima, e o pai vira as costas
        const wipe = sm(u, 2.4, 3.0), up = sm(u, 3.2, 3.9);
        const dad = Object.assign({ x: dadX, y: F, s: S, dir: u > 3.0 ? -1 : 1, t }, mix(P.point, P.stand, sm(u, 2.6, 3.0)));
        const kp = mix(mix(P.sitcry, P.sitwipe, wipe), P.stiff, up);
        const kid = Object.assign({ x: kidX + (wipe < 1 ? sob * (1 - wipe) : 0), y: F, s: SK, dir: -1, t, head: 27, nod: up > 0 ? -0.15 * up : 0.25 * (1 - wipe) }, kp);
        figRefl(dad, F); figRefl(kid, F); figure(dad); figure(kid);
        tears(kid.hp, 1 - wipe, t, -1);
        bubble(['ENGOLE', 'O CHORO!'], 420, oy + 140, gen ? prog(u, 0.0, 0.25) * (1 - prog(u, 2.6, 2.9)) : 1 - prog(u, 2.6, 2.9), true, 66);
        if (u > 4.4) { ga(prog(u, 4.4, 4.9)); spaced('ENGOLIU', kidX, oy + 150, 28, { color: FIG }); ga(1); }
      } else {
        // pai se abaixa: "PODE CHORAR. EU TÔ AQUI." e abraça; o choro acaba no abraço
        const k = sm(u, 1.0, 1.7), h = sm(u, 3.0, 3.6);
        const dp = u < 1.0 ? P.stand : mix(mix(P.stand, P.kneel, k), P.hug, h);
        const dad = Object.assign({ x: lerp(dadX, kidX - 175, k * 0.75 + h * 0.25), y: F, s: S, dir: 1, t }, dp);
        const kp = mix(P.sitcry, P.hugK, h);
        const kid = Object.assign({ x: kidX + sob * (1 - h), y: F, s: SK, dir: -1, t, head: 27, nod: 0.25 * (1 - h) }, kp);
        figRefl(dad, F); figRefl(kid, F); figure(dad); figure(kid);
        tears(kid.hp, 1 - sm(u, 3.6, 4.6), t, -1);
        if (h > 0.5) glow((dad.x + kidX) / 2, F - 180, 230, 'rgba(255,220,160,A)', 0.28 * h);
        bubble(['PODE CHORAR.', 'EU TÔ AQUI.'], 400, oy + 130, prog(u, 1.3, 1.6) * (1 - prog(u, 4.4, 4.7)), false, 50);
        if (u > 4.4) { ga(prog(u, 4.4, 4.9)); spaced('SENTIU', kidX - 90, oy + 140, 28, { color: AMB }); ga(1); }
      }
      ctx.restore();
    }

    // ---------- som ----------
    for (const [a0, g] of [[0, 0], [A2, 1]]) {
      cue(a0 + 0.05, 'bang'); cue(a0 + 0.3, 'sob'); cue(a0 + 1.0, 'kneel'); cue(a0 + 1.35, 'soft');
      cue(a0 + 2.5, 'wipe'); cue(a0 + 3.0, 'steps'); cue(a0 + 3.1, 'hug'); cue(a0 + 4.4, 'sigh');
    }
    cue(0, 'amb'); cue(T_SKIP + 0.1, 'whoosh'); cue(T_SKIP + 0.2, 'tickstart'); cue(A2 - 0.1, 'tickstop'); cue(T_END + 0.2, 'end');

    function label(s, y, a) { spaced(s, 70, y, 24, { align: 'left', color: MU, a }); }
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const inA2 = t >= A2 - 0.15;
      const skipDim = sm(t, T_SKIP - 0.2, T_SKIP + 0.2) * (1 - sm(t, A2 - 0.4, A2)), endDim = sm(t, T_END, T_END + 0.6);
      const vis = (1 - skipDim * 0.85) * (1 - endDim * 0.8);
      PAN.forEach(p => { act(Math.max(0, inA2 ? t - A2 : t), p, p.oy, t, inA2 ? 1 : 0); ga(1); if (vis < 1) { ctx.globalAlpha = 1 - vis; ctx.fillStyle = BG; ctx.fillRect(0, p.oy, W, PH); ctx.globalAlpha = 1; } });
      const la = (1 - skipDim) * (1 - endDim);
      label(inA2 ? 'O FILHO QUE ENGOLIU O CHORO' : 'PAI QUE MANDA ENGOLIR', PAN[0].oy - 26, la);
      label(inA2 ? 'O FILHO QUE PÔDE CHORAR' : 'PAI QUE ACOLHE', PAN[1].oy - 26, la);
      if (t < T_SKIP) { const fo = 1 - sm(t, T_SKIP - 0.4, T_SKIP);
        serif([['Ele queria um filho ', false], ['forte.', true]], 540, 150, 54, fo);
        serif([['Criou um homem que ', false], ['não sabe sentir.', true, AMB]], 540, 228, 54, sm(t, 3.8, 4.4) * fo); }
      else if (t < T_END) { serif([['E um dia, ', false], ['ele diz igual.', true]], 540, 185, 60, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END))); }
      if (skipDim > 0) { serif([['20 anos ', false], ['depois', true]], 540, 990, 110, skipDim); }
      if (endDim > 0) { serif([['Choro engolido não some.', false]], 540, 800, 56, endDim); serif([['Vira ', false], ['silêncio dentro de casa.', true, AMB]], 540, 885, 56, sm(t, T_END + 0.5, T_END + 1.1));
        const va = sm(t, T_END + 1.4, T_END + 2.0); ga(va); rr(150, 1000, 780, 150, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"Há tempo de chorar e tempo de rir."', true]], 540, 1058, 42, va); spaced('ECLESIASTES 3:4', 540, 1112, 22, { color: AMB, a: va }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
