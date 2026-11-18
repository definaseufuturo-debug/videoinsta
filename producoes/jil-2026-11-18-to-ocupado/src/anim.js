/*
 * "VAI BRINCAR LÁ FORA, TÔ OCUPADO!": estilo pôster escuro (fundo preto, holofote, bonecos brancos lisos com reflexo).
 * Em cima, o filho chega com um desenho; o pai, de costas no notebook, nem olha: "VAI BRINCAR LÁ FORA. TÔ OCUPADO!".
 * O filho baixa o desenho, vira e vai embora; o desenho cai no chão.
 * Embaixo, o pai fecha o notebook, se abaixa: "ME MOSTRA O SEU DESENHO." e os dois olham juntos.
 * "20 anos depois": o pai, idoso, chega com o mesmo desenho guardado; em cima o filho adulto responde "TÔ OCUPADO, PAI.",
 * embaixo o filho fecha o notebook: "ME MOSTRA, PAI.". Final: Provérbios 23:26.
 * Único vermelho: o balão do "TÔ OCUPADO". Sem narração, ~18 s, 9:16. Cenas e frases próprias.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, END = 18.4;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));

  const BG = '#060607', FIG = '#e6e6ea', FIG2 = '#b9b9c2', RED = '#e0262b', MU = '#8d8d96', AMB = '#f2c27a', PAPER = '#ebe6da';
  const PAN = [{ oy: 330, kind: 'ocupado' }, { oy: 1040, kind: 'para' }], PH = 650, FLOOR = 560;
  const T_SKIP = 7.4, A2 = 8.8, T_END = 14.3;

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
    const ST = [[-0.1, -0.1], [0.12, 0.1]];
    const P = {
      stand: { lean: 0, crouch: 0, legs: ST, arms: [[-0.15, -0.1], [0.15, 0.1]] },
      type: { lean: 0.14, crouch: 0, legs: ST, arms: [[1.25, 1.95], [1.05, 1.85]] },
      show: { lean: -0.06, crouch: 0, legs: ST, arms: [[2.55, 2.75], [2.3, 2.6]] },
      droop: { lean: 0.1, crouch: 2, legs: ST, arms: [[0.12, 0.05], [-0.08, -0.04]] },
      kneel: { lean: 0.3, crouch: 46, legs: [[1.5, 0], [0.15, -1.55]], arms: [[1.4, 1.7], [0.6, 0.4]] },
      look: { lean: 0.35, crouch: 46, legs: [[1.5, 0], [0.15, -1.55]], arms: [[1.6, 2.1], [1.3, 1.6]] },
      hold: { lean: 0.02, crouch: 0, legs: ST, arms: [[1.7, 2.3], [1.5, 2.2]] },
      old: { lean: 0.26, crouch: 6, legs: [[-0.14, -0.05], [0.16, 0.08]], arms: [[1.55, 1.95], [0.55, 0.25]] },
      oldDroop: { lean: 0.34, crouch: 8, legs: [[-0.14, -0.05], [0.16, 0.08]], arms: [[0.3, 0.1], [0.55, 0.25]] },
      side: { lean: 0.1, crouch: 0, legs: ST, arms: [[1.5, 2.0], [1.9, 2.7]] },
    };
    const mix = (a, b, k) => ({ lean: lerp(a.lean, b.lean, k), crouch: lerp(a.crouch, b.crouch, k), legs: a.legs.map((l, i) => [lerp(l[0], b.legs[i][0], k), lerp(l[1], b.legs[i][1], k)]), arms: a.arms.map((l, i) => [lerp(l[0], b.arms[i][0], k), lerp(l[1], b.arms[i][1], k)]) });
    const walk = (p, ph, amp) => Object.assign({}, p, { legs: [[amp * Math.sin(ph), -amp * 0.4 * Math.max(0, Math.sin(ph))], [-amp * Math.sin(ph), -amp * 0.4 * Math.max(0, -Math.sin(ph))]] });

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    function bubble(lines, x, y, k, red, size = 40, tailX = -24) { if (k <= 0) return; const b = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(b, b);
      const f = `900 ${size}px Inter`, w = Math.max(...lines.map(l => tw(l, f))) + 70, h = lines.length * size * 1.18 + 44;
      const bg = red ? '#121214' : '#e9e5dc';
      rr(-w / 2, -h / 2, w, h, 30); ctx.fillStyle = bg; ctx.fill(); if (red) { ctx.lineWidth = 6; ctx.strokeStyle = RED; ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(tailX + 6, h / 2 - 3); ctx.lineTo(tailX - 10, h / 2 + 40); ctx.lineTo(tailX + 46, h / 2 - 3); ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); if (red) { ctx.stroke(); ctx.fillStyle = bg; ctx.fillRect(tailX + 8, h / 2 - 8, 36, 8); }
      const c = red ? RED : '#1a1a1d'; lines.forEach((l, i) => txt(l, 0, (i - (lines.length - 1) / 2) * size * 1.18 + 2, size, { color: c }));
      ctx.restore(); }
    function stage(oy, F, warm, LX = 720) {
      ctx.fillStyle = BG; ctx.fillRect(0, oy, W, PH);
      const cone = ctx.createLinearGradient(0, oy, 0, F); cone.addColorStop(0, `rgba(255,${lerp(240, 225, warm)},${lerp(225, 170, warm)},0.15)`); cone.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(LX - 15, oy + 64); ctx.lineTo(LX + 15, oy + 64); ctx.lineTo(Math.min(1080, LX + 300), F); ctx.lineTo(Math.max(0, LX - 560), F); ctx.closePath(); ctx.fill();
      glow(LX - 200, F, 520, 'rgba(255,214,150,A)', 0.08 + 0.18 * warm);
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(LX, oy); ctx.lineTo(LX, oy + 40); ctx.stroke();
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(LX - 45, oy + 66); ctx.quadraticCurveTo(LX, oy + 26, LX + 45, oy + 66); ctx.closePath(); ctx.fill(); glow(LX, oy + 70, 70, 'rgba(255,230,190,A)', 0.8);
      const fg = ctx.createLinearGradient(0, F, 0, oy + PH); fg.addColorStop(0, '#16161a'); fg.addColorStop(1, '#060607'); ctx.fillStyle = fg; ctx.fillRect(0, F, W, oy + PH - F); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, F, W, 2);
    }
    // mesa com notebook (open: 1 aberto, 0 fechado); a tela acesa ilumina o rosto do pai
    function desk(x, F, open) {
      const top = F - 150; ctx.fillStyle = '#26262c'; ctx.fillRect(x - 120, top, 240, 12); ctx.fillRect(x - 108, top + 12, 10, 138); ctx.fillRect(x + 98, top + 12, 10, 138);
      ctx.save(); ctx.translate(x - 10, top); ctx.fillStyle = '#3c3c44'; ctx.fillRect(-60, -8, 120, 8);
      ctx.translate(-60, -8); ctx.rotate(-open * 1.45); ctx.fillStyle = '#34343c'; ctx.fillRect(0, -8, 110, 8);
      if (open > 0.3) { ga(open); ctx.fillStyle = '#cfe0ff'; ctx.fillRect(6, -6, 98, 4); ga(1); }
      ctx.restore();
      if (open > 0.05) glow(x + 30, top - 60, 190, 'rgba(170,200,255,A)', 0.3 * open);
    }
    // o desenho do filho: casa, sol e dois bonecos (o pai e ele) de mãos dadas
    function paper(cx, cy, s, rot, a = 1) { if (a <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s); ga(a);
      ctx.fillStyle = PAPER; ctx.fillRect(-62, -46, 124, 92); ctx.strokeStyle = '#4a4a52'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.strokeRect(-48, -6, 36, 30); ctx.beginPath(); ctx.moveTo(-52, -6); ctx.lineTo(-30, -26); ctx.lineTo(-8, -6); ctx.stroke();
      ctx.fillStyle = AMB; ctx.beginPath(); ctx.arc(40, -26, 10, 0, TAU); ctx.fill();
      for (const [px, hh] of [[14, 34], [36, 22]]) { ctx.beginPath(); ctx.arc(px, 30 - hh, 5, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(px, 35 - hh); ctx.lineTo(px, 30 - hh * 0.35); ctx.lineTo(px - 6, 34); ctx.moveTo(px, 30 - hh * 0.35); ctx.lineTo(px + 6, 34); ctx.moveTo(px - 8, 40 - hh * 0.8); ctx.lineTo(px + 8, 40 - hh * 0.8); ctx.stroke(); }
      ga(1); ctx.restore(); }

    // ---------- atos ----------
    // gen 0: pai (no notebook) x filho criança; gen 1: filho adulto (no notebook) x pai idoso
    function act(u, p, oy, t, gen) {
      const F = oy + FLOOR, top = p.kind === 'ocupado'; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      const S = 1.45, VS = gen ? 1.38 : 1.08, deskX = 150, workX = 330, visX = 720;
      stage(oy, F, top ? 0 : 0.2 + 0.6 * sm(u, 1.6, 3.0), 720);
      if (top) {
        // quem trabalha nem vira; quem chegou baixa o desenho, vira e vai embora; o desenho cai
        desk(deskX, F, 1);
        const worker = Object.assign({ x: workX, y: F, s: S, dir: -1, nod: 0.15 * Math.sin(t * 3) }, P.type);
        const drop = sm(u, 1.4, 2.2), turn = u > 2.5, wk = prog(u, 2.6, 5.4);
        const base = gen ? mix(P.old, P.oldDroop, drop) : mix(P.show, P.droop, drop);
        const vis = Object.assign({ x: visX + wk * (gen ? 220 : 330), y: F, s: VS, dir: turn ? 1 : -1, head: gen ? 25 : 30, nod: drop * 0.35 }, wk > 0 && wk < 1 ? walk(base, u * (gen ? 6 : 9), gen ? 0.22 : 0.35) : base);
        figRefl(worker, F); figRefl(vis, F); figure(worker); const hv = figure(vis);
        if (gen) { ctx.strokeStyle = '#7a7a84'; ctx.lineWidth = 7; const [cx, cy] = hv[1]; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (turn ? 10 : -10), F); ctx.stroke(); }
        // desenho: nas mãos até cair no chão
        const fall = sm(u, 2.5, 3.0, x => x * x), hand = gen ? hv[0] : [(hv[0][0] + hv[1][0]) / 2, (hv[0][1] + hv[1][1]) / 2];
        const px = lerp(hand[0] + (gen ? -10 : 0), visX - 40, fall), py = lerp(hand[1] + (gen ? 0 : -50), F - 6, fall);
        paper(px, py, lerp(gen ? 0.85 : 1.15, 0.9, fall), lerp(gen ? -0.1 : 0, 1.45, fall), 1);
        bubble(gen ? ['TÔ OCUPADO, PAI.'] : ['VAI BRINCAR LÁ FORA.', 'TÔ OCUPADO!'], 540, oy + (gen ? 120 : 130), gen ? prog(u, 0.0, 0.25) * (1 - prog(u, 3.0, 3.3)) : 1 - prog(u, 3.0, 3.3), true, gen ? 64 : 58, -230);
        if (u > 4.0) { ga(prog(u, 4.0, 4.5)); spaced(gen ? 'FICOU SÓ' : 'GUARDOU O DESENHO', gen ? 760 : 700, oy + 150, 28, { color: FIG }); ga(1); }
      } else {
        // quem trabalha fecha o notebook, vira e vai até quem chegou; os dois olham o desenho juntos
        const close = sm(u, 0.6, 1.1), go = sm(u, 1.2, 2.2), down = sm(u, 2.0, 2.6), look = sm(u, 2.8, 3.4);
        desk(deskX, F, 1 - close);
        let wp = u < 1.2 ? P.type : (gen ? mix(P.stand, P.side, look) : mix(mix(P.stand, P.kneel, down), P.look, look));
        if (u >= 1.2 && go > 0 && go < 1) wp = walk(wp, u * 9, 0.32);
        const worker = Object.assign({ x: lerp(workX, visX - (gen ? 245 : 200), go), y: F, s: S, dir: u > 1.15 ? 1 : -1, nod: gen ? 0.25 * look : 0.2 * look }, wp);
        const lift = sm(u, 2.6, 3.2);
        const vp = gen ? mix(P.old, P.hold, lift * 0.6) : P.show;
        const vis = Object.assign({ x: visX, y: F, s: VS, dir: -1, head: gen ? 25 : 30, nod: gen ? 0.2 : 0.15, bob: gen ? 0 : -Math.max(0, Math.sin((u - 3.4) * 9)) * 10 * prog(u, 3.4, 3.5) * (1 - prog(u, 4.6, 5)) }, vp);
        figRefl(worker, F); figRefl(vis, F); figure(worker); const hv = figure(vis);
        if (gen) { ctx.strokeStyle = '#7a7a84'; ctx.lineWidth = 7; const [cx, cy] = hv[1]; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 10, F); ctx.stroke(); }
        const hand = gen ? hv[0] : [(hv[0][0] + hv[1][0]) / 2, (hv[0][1] + hv[1][1]) / 2 - 72];
        if (look > 0.3) glow(hand[0], hand[1], 240, 'rgba(255,220,160,A)', 0.32 * look);
        paper(hand[0] - (gen ? 10 : 0), hand[1], gen ? 0.85 + 0.3 * lift : 1.15, gen ? -0.1 : 0, 1);
        bubble(gen ? ['ME MOSTRA, PAI.'] : ['ME MOSTRA', 'O SEU DESENHO.'], 470, oy + 120, prog(u, 1.4, 1.7) * (1 - prog(u, 4.4, 4.7)), false, gen ? 56 : 52, -60);
        if (u > 4.4) { ga(prog(u, 4.4, 4.9)); spaced(gen ? 'FOI VISTO DE NOVO' : 'FOI VISTO', 560, oy + 140, 28, { color: AMB }); ga(1); }
      }
      ctx.restore();
    }

    // ---------- som ----------
    cue(0, 'amb'); cue(0.0, 'typing'); cue(0.05, 'bang'); cue(A2 + 0.05, 'bang');
    for (const a0 of [0, A2]) {
      cue(a0 + 0.7, 'close'); cue(a0 + 1.3, 'steps'); cue(a0 + 1.5, 'soft'); cue(a0 + 2.6, 'paper'); cue(a0 + 2.8, 'steps'); cue(a0 + 3.1, 'warm'); cue(a0 + 4.4, 'sigh');
    }
    cue(T_SKIP + 0.1, 'whoosh'); cue(T_SKIP + 0.2, 'tickstart'); cue(A2 - 0.1, 'tickstop'); cue(A2 + 0.05, 'typing'); cue(T_END + 0.2, 'end');

    function label(s, y, a) { spaced(s, 70, y, 24, { align: 'left', color: MU, a }); }
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const inA2 = t >= A2 - 0.15;
      const skipDim = sm(t, T_SKIP - 0.2, T_SKIP + 0.2) * (1 - sm(t, A2 - 0.4, A2)), endDim = sm(t, T_END, T_END + 0.6);
      const vis = (1 - skipDim * 0.85) * (1 - endDim * 0.8);
      PAN.forEach(p => { act(Math.max(0, inA2 ? t - A2 : t), p, p.oy, t, inA2 ? 1 : 0); ga(1); if (vis < 1) { ctx.globalAlpha = 1 - vis; ctx.fillStyle = BG; ctx.fillRect(0, p.oy, W, PH); ctx.globalAlpha = 1; } });
      const la = (1 - skipDim) * (1 - endDim);
      label(inA2 ? 'O FILHO QUE OUVIU "TÔ OCUPADO"' : 'PAI OCUPADO', PAN[0].oy - 26, la);
      label(inA2 ? 'O FILHO QUE FOI OUVIDO' : 'PAI QUE PARA', PAN[1].oy - 26, la);
      if (t < T_SKIP) { const fo = 1 - sm(t, T_SKIP - 0.4, T_SKIP);
        serif([['Pra ele era só ', false], ['um desenho.', true]], 540, 150, 54, fo);
        serif([['Pro filho, era ', false], ['um convite.', true, AMB]], 540, 228, 54, sm(t, 3.6, 4.2) * fo); }
      else if (t < T_END) { serif([['E um dia, ', false], ['o filho responde igual.', true]], 540, 185, 58, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END))); }
      if (skipDim > 0) { serif([['20 anos ', false], ['depois', true]], 540, 990, 110, skipDim); }
      if (endDim > 0) { serif([['Ele não aprendeu o que você disse.', false]], 540, 800, 52, endDim); serif([['Aprendeu ', false], ['o tempo que você deu.', true, AMB]], 540, 882, 56, sm(t, T_END + 0.5, T_END + 1.1));
        const va = sm(t, T_END + 1.4, T_END + 2.0); ga(va); rr(150, 1000, 780, 150, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"Dá-me, filho meu, o teu coração."', true]], 540, 1058, 42, va); spaced('PROVÉRBIOS 23:26', 540, 1112, 22, { color: AMB, a: va }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
