/*
 * "A MÃE QUE NINGUÉM VÊ": estilo pôster escuro (fundo preto, holofote, bonecos brancos lisos com reflexo).
 * Em cima, a mãe carrega o cesto de roupa: "ALGUÉM PODE ME AJUDAR?" e o filho não tira os olhos do celular; ela se curva e
 * segue sozinha. Embaixo, o filho larga o celular, pega o cesto e diz "OBRIGADO, MÃE." "20 anos depois": o filho adulto
 * repete com a esposa o que viu em casa. Final: Provérbios 31:28.
 * Único vermelho: o balão do pedido ignorado. Sem narração, ~18 s, 9:16. Cenas e frases próprias.
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
  const PAN = [{ oy: 330, kind: 'nao' }, { oy: 1040, kind: 've' }], PH = 650, FLOOR = 560;
  const T_SKIP = 7.4, A2 = 8.8, T_END = 14.2;
  const SA = 1.6, SK = 1.4, SS = 1.55;

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
      if (o.bun) { ctx.fillStyle = '#c9c9d0'; ctx.beginPath(); ctx.arc(hx - hr * 0.85, hy - hr * 0.55, hr * 0.5, 0, TAU); ctx.fill(); }
      ctx.restore();
      o.hp = [o.x + d * hx * s, o.y + hy * s, hr * s];
      return hands.map(([x, y]) => [o.x + d * x * s, o.y + y * s]);
    }
    function figRefl(o, floorY) { ctx.save(); ctx.translate(0, floorY * 2); ctx.scale(1, -1); ga(0.13); figure(Object.assign({}, o, { flat: true })); ga(1); ctx.restore(); }
    const P = {
      stand: { lean: 0, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[-0.15, -0.1], [0.15, 0.1]] },
      carry: { lean: 0.06, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[0.9, 1.7], [0.7, 1.6]] },
      tired: { lean: 0.38, crouch: 8, legs: [[-0.15, -0.1], [0.18, 0.12]], arms: [[0.5, 0.9], [0.4, 0.8]] },
      sit: { lean: 0.05, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.9, 1.9], [0.8, 1.8]] },
      touch: { lean: 0.1, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[1.6, 1.8], [0.15, 0.1]] },
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
    function phoneAt([x, y], s) { glow(x, y, 80 * s, 'rgba(170,200,255,A)', 0.45); ctx.fillStyle = '#1b1b20'; rr(x - 9 * s, y - 16 * s, 18 * s, 32 * s, 4 * s); ctx.fill(); ctx.fillStyle = '#cfe0ff'; rr(x - 6 * s, y - 13 * s, 12 * s, 24 * s, 2 * s); ctx.fill(); }
    function basket([x, y], s) { ctx.save(); ctx.translate(x, y + 6 * s);
      ctx.fillStyle = '#e9e5dc'; for (const [dx, r] of [[-22, 16], [0, 19], [22, 15]]) { ctx.beginPath(); ctx.arc(dx * s, -24 * s, r * s, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#4a4a54'; ctx.beginPath(); ctx.moveTo(-48 * s, -28 * s); ctx.lineTo(48 * s, -28 * s); ctx.lineTo(38 * s, 26 * s); ctx.lineTo(-38 * s, 26 * s); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2c2c33'; ctx.lineWidth = 3 * s; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 17 * s, -24 * s); ctx.lineTo(i * 14 * s, 22 * s); ctx.stroke(); }
      ctx.restore(); }
    function stool(x, F, s) { ctx.fillStyle = '#26262b'; rr(x - 40 * s, F - 50 * s, 80 * s, 10 * s, 4); ctx.fill(); ctx.fillRect(x - 32 * s, F - 42 * s, 7 * s, 42 * s); ctx.fillRect(x + 25 * s, F - 42 * s, 7 * s, 42 * s); }
    const walk = ph => { const a = Math.sin(ph) * 0.45; return { lean: 0.06, crouch: 0, legs: [[a, a - 0.25 * Math.max(0, a)], [-a, -a - 0.25 * Math.max(0, -a)]], arms: [[-a * 0.6, -a * 0.4], [a * 0.6, a * 0.4]] }; };
    const mid = h => [(h[0][0] + h[1][0]) / 2, (h[0][1] + h[1][1]) / 2];

    // ---------- atos ----------
    function act(u, p, oy, t, gen) {
      const F = oy + FLOOR, top = p.kind === 'nao'; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      const S = gen ? SS : SA, momX = 300, kidX = 790, ks = gen ? 1.6 : SK;
      stage(oy, F, top ? 0 : 0.2 + 0.6 * sm(u, 2.4, 3.4), 640);
      stool(kidX, F, ks * 0.9);
      const momBob = Math.sin(t * 9) * 2;
      if (top) {
        // a mãe pede ajuda com o cesto pesado; o filho não tira os olhos do celular; ela se curva e segue sozinha
        const slump = sm(u, 2.8, 3.8);
        const mom = Object.assign({ x: momX + 70 * sm(u, 4.0, 6.5), y: F, s: S, dir: 1, t, bun: true, bob: momBob * (1 - slump) }, mix(P.carry, P.tired, slump));
        const kid = Object.assign({ x: kidX, y: F, s: ks, dir: -1, t, head: gen ? 25 : 27, nod: 0.55 }, P.sit);
        figRefl(mom, F); figRefl(kid, F); const mh = figure(mom); const kh = figure(kid);
        basket(mid(mh), S * 0.85 * (1 + 0.04 * slump)); phoneAt(mid(kh), ks * 1.1);
        bubble(['ALGUÉM PODE', 'ME AJUDAR?'], 400, oy + 140, gen ? prog(u, 0.0, 0.25) * (1 - prog(u, 2.6, 2.9)) : 1 - prog(u, 2.6, 2.9), true, 60);
        if (u > 4.4) { ga(prog(u, 4.4, 4.9)); spaced('SOZINHA', momX + 60, oy + 150, 28, { color: FIG }); ga(1); }
      } else {
        // o filho larga o celular, levanta, pega o cesto: "DEIXA QUE EU LEVO." e "OBRIGADO, MÃE."
        const up = sm(u, 0.9, 1.3), wk = prog(u, 1.3, 2.3), take = sm(u, 2.3, 2.7);
        let kp = mix(P.sit, P.stand, up), kx = kidX;
        if (u > 1.3) { kx = lerp(kidX, momX + 210, inOut(wk)); kp = wk < 1 ? walk(u * 11) : mix(P.stand, P.carry, take); }
        const kid = Object.assign({ x: kx, y: F, s: ks, dir: -1, t, head: gen ? 25 : 27, nod: 0.55 * (1 - up) }, kp);
        const mp = take < 1 ? mix(P.carry, P.stand, take) : mix(P.stand, P.touch, sm(u, 3.0, 3.5));
        const mom = Object.assign({ x: momX, y: F, s: S, dir: 1, t, bun: true, bob: momBob * (1 - take) }, mp);
        figRefl(mom, F); figRefl(kid, F); const mh = figure(mom); const kh = figure(kid);
        if (take < 0.5) basket(mid(mh), S * 0.85); else basket(mid(kh), ks * 0.85);
        if (u < 1.2) phoneAt(mid(kh), ks * 1.1 * (1 - up)); else if (u < 7) phoneAt([kidX - 30, F - 50 * ks * 0.9 - 8], 0.9);
        if (take > 0.5) glow((mom.x + kx) / 2, F - 200, 230, 'rgba(255,220,160,A)', 0.25 * take);
        bubble(['ALGUÉM PODE', 'ME AJUDAR?'], 400, oy + 140, (gen ? prog(u, 0.0, 0.25) : 1) * (1 - prog(u, 1.0, 1.2)), false, 52);
        bubble(['DEIXA QUE', 'EU LEVO.'], 700, oy + 130, prog(u, 1.4, 1.7) * (1 - prog(u, 2.9, 3.1)), false, 50);
        bubble(gen ? ['OBRIGADA,', 'AMOR.'] : ['OBRIGADO,', 'MÃE.'], gen ? 360 : 700, oy + 130, prog(u, 3.1, 3.4) * (1 - prog(u, 5.6, 5.9)), false, 54);
        if (u > 4.4) { ga(prog(u, 4.4, 4.9)); spaced(gen ? 'APRENDEU A VER' : 'VIU A MÃE', 720, oy + 150, 28, { color: AMB }); ga(1); }
      }
      ctx.restore();
    }

    // ---------- som ----------
    for (const a0 of [0, A2]) {
      cue(a0 + 0.05, 'bang'); cue(a0 + 0.4, 'phone'); cue(a0 + 1.0, 'stand'); cue(a0 + 1.4, 'steps'); cue(a0 + 2.4, 'cloth');
      cue(a0 + 2.9, 'sigh'); cue(a0 + 3.2, 'hug'); cue(a0 + 4.4, 'heart');
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
      label(inA2 ? 'O FILHO QUE NUNCA OLHOU' : 'O FILHO QUE NÃO OLHA', PAN[0].oy - 26, la);
      label(inA2 ? 'O FILHO QUE APRENDEU A VER' : 'O FILHO QUE VÊ', PAN[1].oy - 26, la);
      if (t < T_SKIP) { const fo = 1 - sm(t, T_SKIP - 0.4, T_SKIP);
        serif([['Ela faz tudo. ', false], ['Ninguém vê.', true]], 540, 150, 56, fo);
        serif([['O filho aprende que ', false], ['isso é normal.', true, AMB]], 540, 228, 54, sm(t, 3.8, 4.4) * fo); }
      else if (t < T_END) { serif([['E um dia, ', false], ['ele faz igual em casa.', true]], 540, 185, 58, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END))); }
      if (skipDim > 0) { serif([['20 anos ', false], ['depois', true]], 540, 990, 110, skipDim); }
      if (endDim > 0) { serif([['Não espere o Dia das Mães', false]], 540, 800, 56, endDim); serif([['para dizer ', false], ['obrigado.', true, AMB]], 540, 885, 60, sm(t, T_END + 0.5, T_END + 1.1));
        const va = sm(t, T_END + 1.4, T_END + 2.0); ga(va); rr(110, 1000, 860, 150, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"Levantam-se seus filhos e lhe chamam ditosa."', true]], 540, 1058, 40, va); spaced('PROVÉRBIOS 31:28', 540, 1112, 22, { color: AMB, a: va }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
