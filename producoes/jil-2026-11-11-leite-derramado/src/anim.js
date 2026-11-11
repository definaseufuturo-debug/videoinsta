/*
 * "LEITE DERRAMADO": pais e filhos, estilo pôster escuro (fundo preto, holofote, bonecos brancos lisos com reflexo).
 * Duas telas: em cima o pai que grita, embaixo o pai que ajuda a limpar. "20 anos depois", o filho (cachecol vermelho)
 * repete com o próprio filho o que aprendeu. Sem narração, ~16,5 s, 9:16. Cenas e frases próprias.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, END = 16.5;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));

  const BG = '#060607', FIG = '#e6e6ea', FIG2 = '#b9b9c2', RED = '#e0262b', MU = '#8d8d96', AMB = '#f2c27a', MILK = '#f7f5ee', SCARF = '#d7262b';
  // painéis
  const PAN = [{ oy: 330, kind: 'grita' }, { oy: 1040, kind: 'ajuda' }], PH = 650, FLOOR = 540;
  // tempos dos dois atos
  const A1 = 0.8, A2 = 9.0, SP2 = 1.35, T_SKIP = 7.7, T_END = 13.9;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot); ctx.font = o.font || `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 26; } ctx.fillStyle = o.color || FIG; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, font) => { ctx.font = font; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = size * 0.3; ctx.font = `800 ${size}px Inter`; const ws = [...s].map(c => ctx.measureText(c).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1); let cx = x - (o.align === 'left' ? 0 : tot / 2); [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w: 800, color: o.color || MU, a: o.a ?? 1 }); cx += ws[i] + sp; }); }
    // frase serifada: partes [texto, itálico?, cor]
    function serif(parts, x, y, size, a = 1) { if (a <= 0) return; const fN = `400 ${size}px Serif`, fI = `italic 400 ${size}px Serif`; let tot = 0; parts.forEach(p => { p.w = tw(p[0], p[1] ? fI : fN); tot += p.w; }); let cx = x - tot / 2; parts.forEach(p => { txt(p[0], cx, y, size, { font: p[1] ? fI : fN, align: 'left', color: p[2] || FIG, a }); cx += p.w; }); }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }

    // ---------- boneco liso (manequim) ----------
    // origem = referência dos pés; ângulos a partir da vertical para baixo (+ = para a frente)
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
      // cachecol (identifica o filho que cresce)
      if (o.scarf) { ctx.strokeStyle = SCARF; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(shX - 14, shY - 6); ctx.lineTo(shX + 14, shY - 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(shX - 6, shY - 4); ctx.lineTo(shX - 16 + Math.sin(o.t * 3) * 3, shY + 30); ctx.stroke(); }
      // cabeça (esfera)
      const hx = shX + Math.sin(lean + (o.nod || 0)) * 36, hy = shY - Math.cos(lean + (o.nod || 0)) * 36, hr = o.head || 25;
      const g = ctx.createRadialGradient(hx - hr * 0.35, hy - hr * 0.4, 2, hx, hy, hr); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, col); g.addColorStop(1, '#9d9da6'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
      if (o.cloth) { const [cx, cy] = hands[0]; ctx.fillStyle = '#7fb3d9'; ctx.fillRect(cx - 12, cy - 4, 24, 12); }
      ctx.restore();
      return hands.map(([x, y]) => [o.x + (o.dir || 1) * x * s, o.y + y * s]);
    }
    function figRefl(o, floorY) { ctx.save(); ctx.translate(0, floorY * 2); ctx.scale(1, -1); ga(0.13); figure(Object.assign({}, o, { flat: true })); ga(1); ctx.restore(); }
    // poses
    const P = {
      stand: { lean: 0, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[-0.15, -0.1], [0.15, 0.1]] },
      yell: { lean: 0.28, crouch: 0, legs: [[-0.25, -0.15], [0.3, 0.2]], arms: [[1.6, 2.2], [0.5, 1.6]] },
      kneel: { lean: 0.35, crouch: 46, legs: [[1.5, 0], [0.15, -1.55]], arms: [[1.0, 0.7], [0.7, 0.4]] },
      sit: { lean: 0.05, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.4, 0.5], [0.3, 0.3]] },
      reach: { lean: 0.2, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[1.3, 1.75], [0.4, 0.5]] },
      cower: { lean: -0.3, crouch: 46, legs: [[1.7, 0.6], [1.6, 0.5]], arms: [[2.4, 3.3], [2.2, 3.1]] },
    };
    const mix = (a, b, k) => ({ lean: lerp(a.lean, b.lean, k), crouch: lerp(a.crouch, b.crouch, k), legs: a.legs.map((l, i) => [lerp(l[0], b.legs[i][0], k), lerp(l[1], b.legs[i][1], k)]), arms: a.arms.map((l, i) => [lerp(l[0], b.arms[i][0], k), lerp(l[1], b.arms[i][1], k)]) });

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ---------- um ato (u = tempo local do ato, em s; sp = velocidade) ----------
    // devolve o desenho de um painel. who.adultScarf: o adulto é o filho crescido
    function act(u, p, oy, adultScarf, t) {
      const F = oy + FLOOR, kidX = 360, tableX0 = 430, tableX1 = 760, tableY = F - 132, glassX = 492, adX = 860;
      // luz
      const yelling = p.kind === 'grita' && u > 2.3 && u < 6.6;
      const warm = p.kind === 'ajuda' ? sm(u, 2.4, 3.6) : 0;
      ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      ctx.fillStyle = BG; ctx.fillRect(0, oy, W, PH);
      // cone do holofote
      const cone = ctx.createLinearGradient(0, oy, 0, F); cone.addColorStop(0, `rgba(255,${yelling ? 120 : 240},${yelling ? 110 : 220},0.16)`); cone.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(560, oy + 64); ctx.lineTo(560 + 30, oy + 64); ctx.lineTo(980, F); ctx.lineTo(170, F); ctx.closePath(); ctx.fill();
      glow(580, F, 520, yelling ? 'rgba(224,38,43,A)' : 'rgba(255,214,150,A)', yelling ? 0.22 : 0.12 + 0.12 * warm);
      // luminária pendente
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(575, oy); ctx.lineTo(575, oy + 40); ctx.stroke();
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(530, oy + 66); ctx.quadraticCurveTo(575, oy + 26, 620, oy + 66); ctx.closePath(); ctx.fill(); glow(575, oy + 70, 70, 'rgba(255,230,190,A)', 0.8);
      // chão
      const fg = ctx.createLinearGradient(0, F, 0, oy + PH); fg.addColorStop(0, '#16161a'); fg.addColorStop(1, '#060607'); ctx.fillStyle = fg; ctx.fillRect(0, F, W, oy + PH - F); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, F, W, 2);
      // zoom da cena (móveis, leite e bonecos)
      ctx.save(); ctx.translate(600, F); ctx.scale(1.3, 1.3); ctx.translate(-600, -F);
      // mesa e banquinho
      ctx.fillStyle = '#2c2c32'; rr(tableX0, tableY, tableX1 - tableX0, 16, 4); ctx.fill(); ctx.fillRect(tableX0 + 20, tableY + 16, 12, F - tableY - 16); ctx.fillRect(tableX1 - 32, tableY + 16, 12, F - tableY - 16);
      const kidDown = p.kind === 'ajuda' ? sm(u, 4.4, 5.0) : 0;
      ctx.fillStyle = '#26262b'; rr(kidX - 40, F - 76, 80, 12, 4); ctx.fill(); ctx.fillRect(kidX - 32, F - 64, 8, 64); ctx.fillRect(kidX + 24, F - 64, 8, 64);
      // copo e leite
      const tip = sm(u, 1.05, 1.45), fallX = glassX + 40 * tip;
      const pud = sm(u, 1.3, 2.4) * (1 - (p.kind === 'ajuda' ? sm(u, 5.0, 6.6) : 0));
      if (pud > 0) { ctx.fillStyle = MILK; ga(0.92); ctx.beginPath(); ctx.ellipse(glassX + 110, tableY + 1, 110 * pud, 6, 0, 0, TAU); ctx.fill();
        // pingos da borda da mesa e poça no chão
        const fl = sm(u, 1.7, 3.0) * (1 - (p.kind === 'ajuda' ? sm(u, 5.2, 6.8) : 0)); ctx.beginPath(); ctx.ellipse(640, F + 6, 150 * fl, 12 * fl, 0, 0, TAU); ctx.fill();
        if (u > 1.6 && u < 3.6) for (let i = 0; i < 3; i++) { const d = ((u * 1.6 + i / 3) % 1); ctx.beginPath(); ctx.arc(612 + i * 26, tableY + 16 + d * (F - tableY - 16), 4, 0, TAU); ctx.fill(); } ga(1); }
      ctx.save(); ctx.translate(fallX, tableY - 2); ctx.rotate(1.35 * tip); ctx.fillStyle = 'rgba(220,235,245,0.35)'; ctx.strokeStyle = 'rgba(230,240,250,0.8)'; ctx.lineWidth = 3; rr(-18, -64, 36, 64, 4); ctx.fill(); ctx.stroke(); if (tip < 0.5) { ctx.fillStyle = MILK; rr(-15, -46 + 30 * tip, 30, 44 - 30 * tip, 3); ctx.fill(); } ctx.restore();
      // ---- criança ----
      let kp, kx = kidX, ky = F - 24, ks = 0.92, shake = 0;
      if (u < 0.8) kp = P.sit; else if (u < 1.2) kp = mix(P.sit, P.reach, sm(u, 0.8, 1.15)); else kp = mix(P.reach, P.sit, sm(u, 1.3, 1.8));
      if (p.kind === 'grita') { const c = sm(u, 2.5, 2.9); kp = mix(kp, P.cower, c); ks = lerp(0.92, 0.78, c); ky = F - 24 * ks / 0.92; shake = c * Math.sin(t * 40) * 2.5; }
      else { const d = kidDown; if (d > 0) { kp = mix(P.sit, P.kneel, d); kx = lerp(kidX, 560, d); ky = lerp(F - 24, F, d); } if (u > 6.9) { kp = mix(P.kneel, P.stand, sm(u, 6.9, 7.4)); } }
      const kid = Object.assign({ x: kx + shake, y: ky, s: ks, dir: 1, t, head: 27, scarf: !adultScarf, cloth: p.kind === 'ajuda' && kidDown > 0.9 && u < 6.9, nod: p.kind === 'grita' ? -0.5 * sm(u, 2.5, 2.9) : 0 }, kp);
      if (kid.cloth) { const w = Math.sin(t * 9) * 0.25; kid.arms = [[kp.arms[0][0] + w, kp.arms[0][1] + w], kp.arms[1]]; }
      // ---- adulto ----
      let ap = P.stand, ax = adX, bob = 0, cloth = false;
      if (p.kind === 'grita') { const y = sm(u, 2.1, 2.5) * (1 - sm(u, 6.4, 6.9)); ap = mix(P.stand, P.yell, y); bob = y * Math.sin(t * 22) * 3; }
      else { const k = sm(u, 3.4, 4.1) * (1 - sm(u, 6.9, 7.4)); ap = mix(P.stand, P.kneel, k); ax = lerp(adX, 760, k); cloth = k > 0.9; if (cloth) { const w = Math.sin(t * 8) * 0.3; ap = Object.assign({}, ap, { arms: [[ap.arms[0][0] + w, ap.arms[0][1] + w], ap.arms[1]] }); } if (u > 6.9) { ap = mix(ap, { lean: 0.1, crouch: 0, legs: P.stand.legs, arms: [[1.9, 2.6], [0.15, 0.1]] }, sm(u, 6.9, 7.4)); } }
      const ad = Object.assign({ x: ax, y: F, s: 1.22, dir: -1, t, bob, scarf: adultScarf, cloth }, ap);
      figRefl(ad, F); figRefl(kid, F);
      figure(ad); figure(kid);
      // high five no final (ajuda)
      if (p.kind === 'ajuda' && u > 7.15) glow(650, F - 330, 90, 'rgba(255,220,160,A)', 0.8 * (1 - prog(u, 7.3, 7.8)));
      ctx.restore();
      // falas
      if (p.kind === 'grita') { const b = sm(u, 2.2, 2.45, outBack) * (1 - sm(u, 6.2, 6.5)); if (b > 0) { ctx.save(); ctx.translate(640 + Math.sin(t * 30) * 3 * b, oy + 100); ctx.scale(b, b); ctx.rotate(-0.04);
          ctx.beginPath(); const n = 18; for (let i = 0; i <= n; i++) { const a = i / n * TAU, r = (i % 2 ? 1 : 1.18); ctx.lineTo(Math.cos(a) * 210 * r, Math.sin(a) * 74 * r); } ctx.closePath(); ctx.fillStyle = '#121214'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = RED; ctx.stroke();
          txt('QUANTAS VEZES', 0, -16, 34, { color: RED }); txt('EU JÁ FALEI?!', 0, 24, 34, { color: RED }); ctx.restore(); } }
      else { const b = sm(u, 2.4, 2.65, outBack) * (1 - sm(u, 4.6, 4.9)); if (b > 0) { ctx.save(); ctx.translate(700, oy + 100); ctx.scale(b, b); rr(-170, -46, 340, 92, 46); ctx.fillStyle = '#e9e5dc'; ctx.fill(); ctx.beginPath(); ctx.moveTo(10, 40); ctx.lineTo(30, 80); ctx.lineTo(50, 40); ctx.fill(); txt('TUDO BEM.', 0, -12, 30, { color: '#1a1a1d' }); txt('VAMOS LIMPAR?', 0, 22, 26, { color: '#1a1a1d' }); ctx.restore(); } }
      ctx.restore();
    }

    // ---------- som ----------
    for (const [a0, sp] of [[A1, 1], [A2, SP2]]) {
      const T = u => a0 + u / sp;
      cue(T(0.9), 'reach'); cue(T(1.25), 'glass'); cue(T(1.5), 'spill'); cue(T(2.1), 'bang'); cue(T(2.25), 'yell'); cue(T(2.6), 'flinch');
      cue(T(2.45), 'soft'); cue(T(3.5), 'kneel'); cue(T(4.8), 'kneel'); cue(T(5.2), 'wipe'); cue(T(7.15), 'five');
    }
    cue(T_SKIP + 0.1, 'whoosh'); cue(T_SKIP + 0.2, 'tickstart'); cue(A2 - 0.1, 'tickstop'); cue(T_END + 0.2, 'end');

    // ---------- cena ----------
    function label(s, y, a) { spaced(s, 70, y, 24, { align: 'left', color: MU, a }); }
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const inA2 = t >= A2 - 0.15, u = inA2 ? (t - A2) * SP2 : t - A1;
      const fadeIn = sm(t, 0, 0.5), skipDim = sm(t, T_SKIP - 0.2, T_SKIP + 0.2) * (1 - sm(t, A2 - 0.4, A2)), endDim = sm(t, T_END, T_END + 0.6);
      const vis = fadeIn * (1 - skipDim * 0.85) * (1 - endDim * 0.75);
      PAN.forEach((p, i) => { act(Math.max(0, u), p, p.oy, inA2, t); ga(1); if (vis < 1) { ctx.globalAlpha = 1 - vis; ctx.fillStyle = BG; ctx.fillRect(0, p.oy, W, PH); ctx.globalAlpha = 1; } });
      // rótulos
      const la = fadeIn * (1 - skipDim) * (1 - endDim);
      label(inA2 ? 'O FILHO QUE OUVIU GRITOS' : 'PAI QUE GRITA', PAN[0].oy - 26, la);
      label(inA2 ? 'O FILHO QUE FOI AJUDADO' : 'PAI QUE AJUDA', PAN[1].oy - 26, la);
      // frase de cima
      if (t < T_SKIP) { serif([['Seu filho esquece ', false], ['o leite derramado.', true]], 540, 150, 54, sm(t, 0.3, 0.9) * (1 - sm(t, T_SKIP - 0.4, T_SKIP)));
        serif([['Não esquece ', false], ['o seu grito.', true, '#ff5a5f']], 540, 225, 54, sm(t, 3.4, 4.0) * (1 - sm(t, T_SKIP - 0.4, T_SKIP))); }
      else if (t < T_END) { serif([['E um dia, ', false], ['ele faz igual.', true]], 540, 185, 60, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END))); }
      // 20 anos depois
      if (skipDim > 0) { serif([['20 anos ', false], ['depois', true]], 540, 990, 110, skipDim); }
      // final: versículo
      if (endDim > 0) { serif([['O que você faz com o erro ', false]], 540, 860, 58, endDim); serif([['dele, ', false], ['ele aprende a fazer.', true, AMB]], 540, 940, 58, sm(t, T_END + 0.4, T_END + 1.0));
        ga(sm(t, T_END + 1.2, T_END + 1.8)); rr(200, 1050, 680, 130, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"Pais, não irritem seus filhos."', true]], 540, 1100, 40, sm(t, T_END + 1.2, T_END + 1.8)); spaced('EFÉSIOS 6:4', 540, 1150, 22, { color: AMB, a: sm(t, T_END + 1.2, T_END + 1.8) }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
