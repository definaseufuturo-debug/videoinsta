/*
 * "SEU FILHO FAZ O QUE VOCÊ FAZ": estilo pôster escuro (fundo preto, holofote, bonecos brancos lisos com reflexo).
 * Em cima, o pai que manda o filho ler a Bíblia sem tirar os olhos do celular; o filho larga o livro e pega um celular.
 * Embaixo, o pai que lê; o filho senta do lado e abre o próprio livro. "20 anos depois": o filho de cima repete a ordem
 * de olho no celular com o próprio filho; o de baixo lê com o filho dele. Final: frase-tese + Provérbios 22:6.
 * Único vermelho: o balão da ordem. Sem narração, ~17,8 s, 9:16. Cenas e frases próprias.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, END = 17.8;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));

  const BG = '#060607', FIG = '#e6e6ea', FIG2 = '#b9b9c2', RED = '#e0262b', MU = '#8d8d96', AMB = '#f2c27a', PAGE = '#e9e5dc';
  const PAN = [{ oy: 330, kind: 'manda' }, { oy: 1040, kind: 'faz' }], PH = 650, FLOOR = 560;
  const T_SKIP = 7.4, A2 = 8.8, T_END = 13.9;
  const SA = 1.8, SK = 1.3, SS = 1.75;

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
      draw(19, FIG2); ctx.shadowBlur = 0; const hands = draw(13, col);
      const hx = shX + Math.sin(lean + (o.nod || 0)) * 36, hy = shY - Math.cos(lean + (o.nod || 0)) * 36, hr = o.head || 25;
      const g = ctx.createRadialGradient(hx - hr * 0.35, hy - hr * 0.4, 2, hx, hy, hr); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, col); g.addColorStop(1, '#9d9da6'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
      ctx.restore();
      return hands.map(([x, y]) => [o.x + (o.dir || 1) * x * s, o.y + y * s]);
    }
    function figRefl(o, floorY) { ctx.save(); ctx.translate(0, floorY * 2); ctx.scale(1, -1); ga(0.13); figure(Object.assign({}, o, { flat: true })); ga(1); ctx.restore(); }
    const P = {
      stand: { lean: 0, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[-0.15, -0.1], [0.15, 0.1]] },
      hold: { lean: 0.02, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[0.9, 2.0], [0.7, 1.9]] },
      sit: { lean: 0.05, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.4, 0.5], [0.3, 0.3]] },
      phone: { lean: 0.2, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.9, 2.5], [0.7, 2.4]] },
      read: { lean: 0.12, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.95, 2.15], [0.75, 2.05]] },
    };
    const mix = (a, b, k) => ({ lean: lerp(a.lean, b.lean, k), crouch: lerp(a.crouch, b.crouch, k), legs: a.legs.map((l, i) => [lerp(l[0], b.legs[i][0], k), lerp(l[1], b.legs[i][1], k)]), arms: a.arms.map((l, i) => [lerp(l[0], b.arms[i][0], k), lerp(l[1], b.arms[i][1], k)]) });
    const walk = ph => { const a = Math.sin(ph) * 0.45; return { lean: 0.06, crouch: 0, bob: -Math.abs(Math.cos(ph)) * 4, legs: [[a, a - 0.25 * Math.max(0, a)], [-a, -a - 0.25 * Math.max(0, -a)]], arms: [[-a * 0.6, -a * 0.4], [a * 0.6, a * 0.4]] }; };

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ---------- objetos ----------
    const mid = h => [(h[0][0] + h[1][0]) / 2, (h[0][1] + h[1][1]) / 2];
    function phone(h, s, a = 1) { if (a <= 0) return; const [x, y] = mid(h); ga(a); glow(x, y - 10 * s, 120 * s, 'rgba(170,200,255,A)', 0.45); ctx.fillStyle = '#1b1b20'; rr(x - 13 * s, y - 34 * s, 26 * s, 44 * s, 5 * s); ctx.fill(); ctx.fillStyle = '#cfe0ff'; rr(x - 10 * s, y - 31 * s, 20 * s, 36 * s, 3 * s); ctx.fill(); ga(1); }
    function book(x, y, s, open = 1, a = 1) { if (a <= 0) return; ga(a); ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      const o = open; ctx.fillStyle = '#2b2b31'; rr(-38, -6, 76, 10, 3); ctx.fill();
      ctx.fillStyle = PAGE; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-36, -8 - 14 * o); ctx.lineTo(-36, -50 - 14 * o); ctx.lineTo(0, -42); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(36, -8 - 14 * o); ctx.lineTo(36, -50 - 14 * o); ctx.lineTo(0, -42); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-30, -18 - i * 8 - 10 * o); ctx.lineTo(-6, -14 - i * 8); ctx.moveTo(6, -14 - i * 8); ctx.lineTo(30, -18 - i * 8 - 10 * o); ctx.stroke(); }
      ctx.restore(); ga(1); }
    function closedBook(x, y, s, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = '#3a3a42'; rr(-26, -34, 52, 68, 4); ctx.fill(); ctx.fillStyle = PAGE; ctx.fillRect(22, -30, 4, 60); ctx.strokeStyle = '#c9c4b8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, 14); ctx.moveTo(-10, -6); ctx.lineTo(10, -6); ctx.stroke(); ctx.restore(); }
    function bubble(lines, x, y, k, red, size = 40) { if (k <= 0) return; const b = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(b, b);
      const f = `900 ${size}px Inter`, w = Math.max(...lines.map(l => tw(l, f))) + 70, h = lines.length * size * 1.18 + 44;
      rr(-w / 2, -h / 2, w, h, 30); ctx.fillStyle = red ? '#121214' : '#e9e5dc'; ctx.fill(); if (red) { ctx.lineWidth = 6; ctx.strokeStyle = RED; ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-18, h / 2 - 3); ctx.lineTo(-30, h / 2 + 40); ctx.lineTo(22, h / 2 - 3); ctx.closePath(); ctx.fillStyle = red ? '#121214' : '#e9e5dc'; ctx.fill(); if (red) { ctx.stroke(); ctx.fillStyle = '#121214'; ctx.fillRect(-16, h / 2 - 8, 36, 8); }
      const c = red ? RED : '#1a1a1d'; lines.forEach((l, i) => txt(l, 0, (i - (lines.length - 1) / 2) * size * 1.18 + 2, size, { color: c }));
      ctx.restore(); }
    function stage(oy, F, warm, cold) {
      ctx.fillStyle = BG; ctx.fillRect(0, oy, W, PH); const LX = 820;
      const cone = ctx.createLinearGradient(0, oy, 0, F); cone.addColorStop(0, `rgba(255,${lerp(240, 225, warm)},${lerp(225, 170, warm)},0.15)`); cone.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(LX - 15, oy + 64); ctx.lineTo(LX + 15, oy + 64); ctx.lineTo(1060, F); ctx.lineTo(180, F); ctx.closePath(); ctx.fill();
      glow(600, F, 520, 'rgba(255,214,150,A)', 0.08 + 0.18 * warm);
      if (cold > 0) glow(400, F - 160, 260, 'rgba(170,200,255,A)', 0.12 * cold);
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(LX, oy); ctx.lineTo(LX, oy + 40); ctx.stroke();
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(LX - 45, oy + 66); ctx.quadraticCurveTo(LX, oy + 26, LX + 45, oy + 66); ctx.closePath(); ctx.fill(); glow(LX, oy + 70, 70, 'rgba(255,230,190,A)', 0.8);
      const fg = ctx.createLinearGradient(0, F, 0, oy + PH); fg.addColorStop(0, '#16161a'); fg.addColorStop(1, '#060607'); ctx.fillStyle = fg; ctx.fillRect(0, F, W, oy + PH - F); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, F, W, 2);
    }
    function chair(x, F, s, dir) { const seat = F - 46 * s + 10 * s; ctx.fillStyle = '#26262b'; rr(x - 34 * s, seat, 68 * s, 10 * s, 3); ctx.fill(); ctx.fillRect(x - 28 * s, seat, 7 * s, F - seat); ctx.fillRect(x + 21 * s, seat, 7 * s, F - seat); ctx.fillRect(x - dir * 34 * s, seat - 70 * s, 7 * s, 70 * s); }

    // ---------- um ato ----------
    // u = tempo local; gen 0 = pai e filho, gen 1 = 20 anos depois (o filho é o pai, com o neto)
    function act(u, p, oy, t, gen) {
      const F = oy + FLOOR, S = gen ? SS : SA; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      if (p.kind === 'manda') {
        stage(oy, F, 0, 1);
        const mx = 330; chair(mx, F, S, 1);
        const dad = Object.assign({ x: mx, y: F, s: S, dir: 1, t, nod: 0.45 }, P.phone);
        // filho: de pé com a Bíblia, olha; larga o livro, senta no banquinho e pega um celular igual ao pai
        const kx = 800, sit = sm(u, 3.0, 3.7);
        chair(kx, F, SK, -1);
        let kp = sit <= 0 ? P.hold : mix(P.hold, P.phone, sit);
        const kid = Object.assign({ x: kx, y: F, s: SK, dir: -1, t, head: 27, nod: lerp(-0.15, 0.45, sm(u, 3.2, 3.9)) }, kp);
        figRefl(dad, F); figRefl(kid, F);
        const dh = figure(dad); phone(dh, S);
        const kh = figure(kid);
        // livro: na mão até cair no chão
        const drop = sm(u, 2.3, 2.8);
        if (drop <= 0) closedBook(mid(kh)[0] - 6, mid(kh)[1] - 10, 1.05);
        else { const [bx, by] = mid(kh); closedBook(lerp(bx - 6, 980, drop), lerp(by - 10, F - 18, drop * drop), 1.05, drop * 1.57); }
        phone(kh, SK, sm(u, 3.5, 3.9));
        const line = gen ? ['VAI LER A BÍBLIA,', 'MENINO!'] : ['VAI LER A BÍBLIA,', 'MENINO!'];
        bubble(line, 400, oy + 120, (gen ? prog(u, 0.2, 0.5) : 1) * (1 - prog(u, 2.6, 2.9)), true, 54);
        bubble(['TÁ BOM, PAI.'], 820, oy + 130, prog(u, 1.4, 1.7) * (1 - prog(u, 2.4, 2.6)), false, 34);
        // ícone: o filho copia
        if (u > 4.0) { ga(prog(u, 4.0, 4.4) * (1 - prog(u, 6.2, 6.5))); spaced('IGUALZINHO', 790, oy + 170, 26, { color: FIG }); ga(1); }
      } else {
        stage(oy, F, 0.7 + 0.1 * Math.sin(t * 2), 0);
        const mx = 330; chair(mx, F, S, 1);
        const dad = Object.assign({ x: mx, y: F, s: S, dir: 1, t, nod: 0.3 }, P.read);
        // filho: chega andando, senta do lado e abre o próprio livro
        const kx1 = 720, arrive = sm(u, 0.4, 2.0, x => x), kx = lerp(1000, kx1, arrive), seated = sm(u, 2.1, 2.7);
        chair(kx1, F, SK, -1);
        let kp = arrive < 1 ? walk(u * 9) : mix(P.stand, P.read, seated);
        const kid = Object.assign({ x: kx, y: F, s: SK, dir: -1, t, head: 27, nod: 0.3 * seated }, kp);
        figRefl(dad, F); figRefl(kid, F);
        const dh = figure(dad); const [dx, dy] = mid(dh); book(dx, dy + 4, S * 0.9, 1);
        const kh = figure(kid);
        if (seated < 0.6) closedBook(mid(kh)[0] - 4, mid(kh)[1] - 6, 0.9); else { const [bx, by] = mid(kh); book(bx, by + 4, SK * 0.85, sm(u, 2.6, 3.1)); }
        bubble(['VEM LER COMIGO?'], 420, oy + 120, prog(u, 1.0, 1.3) * (1 - prog(u, 3.4, 3.7)), false, 40);
        if (u > 3.8) { ga(prog(u, 3.8, 4.2) * (1 - prog(u, 6.2, 6.5))); spaced('IGUALZINHO', 720, oy + 170, 26, { color: AMB }); ga(1); }
      }
      ctx.restore();
    }

    // ---------- som ----------
    for (const [a0, g] of [[0, 0], [A2, 1]]) {
      const T = u => a0 + u;
      if (g) cue(T(0.2), 'yell'); else cue(0.05, 'yell');
      cue(T(1.4), 'pop'); cue(T(2.4), 'drop'); cue(T(3.5), 'phone'); cue(T(0.4), 'steps'); cue(T(1.0), 'pop'); cue(T(2.7), 'page'); cue(T(4.0), 'tick');
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
      label(inA2 ? 'O FILHO DO PAI QUE MANDAVA' : 'PAI QUE MANDA', PAN[0].oy - 26, la);
      label(inA2 ? 'O FILHO DO PAI QUE LIA' : 'PAI QUE FAZ', PAN[1].oy - 26, la);
      if (t < T_SKIP) { const fo = 1 - sm(t, T_SKIP - 0.4, T_SKIP);
        serif([['Seu filho não faz ', false], ['o que você manda.', true]], 540, 150, 54, fo);
        serif([['Ele faz ', false], ['o que você faz.', true, AMB]], 540, 228, 58, sm(t, 3.6, 4.2) * fo); }
      else if (t < T_END) { serif([['E um dia, ', false], ['ele manda igual.', true]], 540, 185, 58, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END))); }
      if (skipDim > 0) { serif([['20 anos ', false], ['depois', true]], 540, 990, 110, skipDim); }
      if (endDim > 0) { serif([['Ninguém aprende a ler a Bíblia', false]], 540, 820, 56, endDim); serif([['olhando ', false], ['um pai no celular.', true, AMB]], 540, 900, 56, sm(t, T_END + 0.5, T_END + 1.1));
        const va = sm(t, T_END + 1.4, T_END + 2.0); ga(va); rr(110, 1010, 860, 150, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"Ensina a criança no caminho em que deve andar."', true]], 540, 1065, 38, va); spaced('PROVÉRBIOS 22:6', 540, 1122, 22, { color: AMB, a: va }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
