/*
 * "A PRIMEIRA CHUVA": motivação × disciplina, estilo pôster escuro (fundo preto, holofote, bonecos brancos lisos com reflexo).
 * Em cima, MOTIVAÇÃO: começa a chover e ele volta pra casa. Embaixo, DISCIPLINA: abre o guarda-chuva (vermelho) e segue.
 * "100 chuvas depois": um olha a chuva da janela, o outro chega à porta de luz. Sem narração, ~17,5 s, 9:16. Cenas e frases próprias.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, END = 17.6;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));

  const BG = '#060607', FIG = '#e6e6ea', FIG2 = '#b9b9c2', RED = '#e0262b', MU = '#8d8d96', AMB = '#f2c27a';
  const PAN = [{ oy: 330, kind: 'mot' }, { oy: 1040, kind: 'dis' }], PH = 650, FLOOR = 560;
  const RAIN0 = 2.6, T_SKIP = 7.4, A2 = 9.0, T_END = 13.6;

  function create(TL, env) {
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { ctx.save(); ctx.translate(x, y); ctx.font = o.font || `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; ctx.fillStyle = o.color || FIG; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, font) => { ctx.font = font; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = size * 0.3; ctx.font = `800 ${size}px Inter`; const ws = [...s].map(c => ctx.measureText(c).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1); let cx = x - (o.align === 'left' ? 0 : tot / 2); [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w: 800, color: o.color || MU, a: o.a ?? 1 }); cx += ws[i] + sp; }); }
    function serif(parts, x, y, size, a = 1) { if (a <= 0) return; const fN = `400 ${size}px Serif`, fI = `italic 400 ${size}px Serif`; let tot = 0; parts.forEach(p => { p.w = tw(p[0], p[1] ? fI : fN); tot += p.w; }); let cx = x - tot / 2; parts.forEach(p => { txt(p[0], cx, y, size, { font: p[1] ? fI : fN, align: 'left', color: p[2] || FIG, a }); cx += p.w; }); }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }

    // ---------- boneco liso (manequim), igual ao modelo ----------
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
      hunch: { lean: 0.32, crouch: 6, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[2.5, 3.4], [2.3, 3.2]] },
      sit: { lean: 0.12, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.7, 1.6], [0.5, 1.4]] },
    };
    const mix = (a, b, k) => ({ lean: lerp(a.lean, b.lean, k), crouch: lerp(a.crouch, b.crouch, k), legs: a.legs.map((l, i) => [lerp(l[0], b.legs[i][0], k), lerp(l[1], b.legs[i][1], k)]), arms: a.arms.map((l, i) => [lerp(l[0], b.arms[i][0], k), lerp(l[1], b.arms[i][1], k)]) });
    // ciclo de caminhada (ph em radianos); umb = braço da frente segurando o guarda-chuva
    function walk(ph, amt = 1, umb = 0, hunched = 0) {
      const sw = Math.sin(ph) * 0.42 * amt, kn = Math.max(0, Math.cos(ph)) * 0.35 * amt, kn2 = Math.max(0, -Math.cos(ph)) * 0.35 * amt;
      const arm1 = umb > 0 ? [lerp(-sw * 0.8, 2.35, umb), lerp(-sw * 0.6, 3.05, umb)] : [-sw * 0.8, -sw * 0.6 + 0.2 * amt];
      const p = { lean: 0.06 * amt, crouch: 0, legs: [[sw, sw - kn], [-sw, -sw - kn2]], arms: [arm1, [sw * 0.8, sw * 0.6 + 0.2 * amt]], bob: -Math.abs(Math.cos(ph)) * 4 * amt };
      if (hunched > 0) { const h = mix(p, P.hunch, hunched); h.legs = p.legs; h.bob = p.bob; return h; }
      return p;
    }
    function umbrella(hand, k, t) { if (k <= 0) return; const [x, y] = hand; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08 + Math.sin(t * 2) * 0.03);
      ctx.strokeStyle = '#cfcfd6'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 26); ctx.lineTo(0, -150); ctx.stroke(); ctx.beginPath(); ctx.arc(-10, 26, 10, 0, Math.PI); ctx.stroke();
      const e = outBack(k), R = 135 * e, hh = 80 * e; ctx.translate(0, -150);
      ctx.shadowColor = 'rgba(224,38,43,0.6)'; ctx.shadowBlur = 30; ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(-R, 0);
      ctx.quadraticCurveTo(-R * 0.9, -hh * 1.15, 0, -hh); ctx.quadraticCurveTo(R * 0.9, -hh * 1.15, R, 0);
      for (let i = 4; i >= 0; i--) { const xa = -R + i * (2 * R / 5); ctx.quadraticCurveTo(xa + R / 5, -16 * e, xa, 0); }
      ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; ctx.restore(); }
    function rain(oy, a, t, seed, umbX) { if (a <= 0) return; ctx.save(); ctx.strokeStyle = `rgba(170,185,205,${0.45 * a})`; ctx.lineWidth = 2;
      for (let i = 0; i < 120; i++) { const x0 = ((i * 97 + seed * 31) % 1100) - 10, sp = 1.0 + (i % 5) * 0.12, y = oy + (((t * 900 * sp + i * 173) % (PH + 60)) - 40), x = x0 - (y - oy) * 0.12;
        if (umbX && Math.abs(x - umbX[0]) < umbX[1] && y > umbX[2]) continue; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 34); ctx.stroke(); }
      ctx.restore(); }
    function lamp(oy, warm) { ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(540, oy); ctx.lineTo(540, oy + 40); ctx.stroke();
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(495, oy + 66); ctx.quadraticCurveTo(540, oy + 26, 585, oy + 66); ctx.closePath(); ctx.fill(); glow(540, oy + 70, 70, 'rgba(255,230,190,A)', 0.8 * warm); }
    function stage(oy, F, warm, wet) {
      ctx.fillStyle = BG; ctx.fillRect(0, oy, W, PH);
      const cone = ctx.createLinearGradient(0, oy, 0, F); cone.addColorStop(0, `rgba(255,240,220,${0.15 * warm})`); cone.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(525, oy + 64); ctx.lineTo(555, oy + 64); ctx.lineTo(960, F); ctx.lineTo(120, F); ctx.closePath(); ctx.fill();
      lamp(oy, warm);
      const fg = ctx.createLinearGradient(0, F, 0, oy + PH); fg.addColorStop(0, wet > 0 ? '#1a1c22' : '#16161a'); fg.addColorStop(1, '#060607'); ctx.fillStyle = fg; ctx.fillRect(0, F, W, oy + PH - F); ctx.fillStyle = `rgba(255,255,255,${0.08 + 0.1 * wet})`; ctx.fillRect(0, F, W, 2);
    }
    function groundMarks(F, off) { ctx.fillStyle = 'rgba(255,255,255,0.10)'; for (let i = -1; i < 11; i++) { const x = ((i * 130 - off) % 1300 + 1300) % 1300 - 110; ctx.fillRect(x, F + 22, 60, 4); } }

    // ---------- painel MOTIVAÇÃO ----------
    function panelMot(t, oy) {
      const F = oy + FLOOR; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      if (t < A2 - 0.15) {
        const ra = sm(t, RAIN0, RAIN0 + 0.6);
        stage(oy, F, 1 - 0.5 * ra, ra);
        if (t > RAIN0 + 0.3 && t < RAIN0 + 0.5) { ctx.fillStyle = 'rgba(200,210,255,0.18)'; ctx.fillRect(0, oy, W, PH); }
        // anda parado no lugar com o chão correndo; depois para, encolhe, vira e volta
        const stop = sm(t, 3.2, 3.6), back = t > 4.3;
        const off = t < 3.4 ? t * 260 : 3.4 * 260 + (t - 3.4) * 260 * (1 - stop);
        groundMarks(F, off);
        let fx = 470, dir = 1, pose;
        if (!back) pose = mix(walk(t * 7.5, 1), P.hunch, stop);
        else { dir = -1; fx = 470 - (t - 4.3) * 210; pose = walk(t * 7.5, 1, 0, 0.8); }
        const o = Object.assign({ x: fx, y: F, s: 1.45, dir, t }, pose); figRefl(o, F); figure(o);
        rain(oy, ra, t, 3);
      } else {
        // 100 chuvas depois: sentado em casa, olhando a chuva pela janela
        stage(oy, F, 0.9, 0.3);
        const wx = 620, wy = oy + 150, ww = 300, wh = 270;
        ctx.fillStyle = '#0d0f14'; ctx.fillRect(wx, wy, ww, wh); ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip(); rain(oy, 1, t, 5); ctx.restore();
        ctx.strokeStyle = '#3b3b42'; ctx.lineWidth = 10; ctx.strokeRect(wx, wy, ww, wh); ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
        ctx.fillStyle = '#26262b'; rr(330, F - 82, 110, 14, 4); ctx.fill(); ctx.fillRect(340, F - 68, 9, 68); ctx.fillRect(421, F - 68, 9, 68);
        const o = Object.assign({ x: 385, y: F - 30, s: 1.35, dir: 1, t, nod: -0.25 + Math.sin(t * 1.2) * 0.03 }, P.sit); figRefl(Object.assign({}, o, { y: F }), F); figure(o);
        spaced('AINDA ESPERANDO O TEMPO ABRIR', 650, F + 60, 20, { color: MU, a: sm(t, A2 + 1.0, A2 + 1.6) * (1 - sm(t, T_END, T_END + 0.4)) });
      }
      ctx.restore();
    }
    // ---------- painel DISCIPLINA ----------
    function panelDis(t, oy) {
      const F = oy + FLOOR; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      if (t < A2 - 0.15) {
        const ra = sm(t, RAIN0, RAIN0 + 0.6);
        stage(oy, F, 1 - 0.5 * ra, ra);
        if (t > RAIN0 + 0.3 && t < RAIN0 + 0.5) { ctx.fillStyle = 'rgba(200,210,255,0.18)'; ctx.fillRect(0, oy, W, PH); }
        const pause = sm(t, 3.3, 3.6) * (1 - sm(t, 4.4, 4.8)), um = sm(t, 3.6, 4.2);
        const off = 260 * (t - 0.9 * clamp(t - 3.45, 0, 1.15));
        groundMarks(F, off);
        const o = Object.assign({ x: 470, y: F, s: 1.45, dir: 1, t }, walk(t * 7.5, 1 - pause * 0.9, um));
        figRefl(o, F); const hands = figure(o); umbrella(hands[0], um, t);
        rain(oy, ra, t, 7, um > 0.6 ? [hands[0][0], 140, oy] : null);
      } else {
        // chega à porta de luz; a chuva para
        const u = t - A2, ra = 1 - sm(u, 0.4, 2.0), warm = sm(u, 1.2, 3.0);
        stage(oy, F, 0.5 + 0.5 * warm, ra);
        const dx = 900; glow(dx, F - 150, 360, 'rgba(255,214,150,A)', 0.15 + 0.4 * warm);
        ctx.fillStyle = `rgba(255,230,180,${0.25 + 0.65 * warm})`; rr(dx - 70, F - 300, 140, 300, 70); ctx.fill();
        const walkK = 1 - sm(u, 3.0, 3.6), fx = lerp(330, 760, sm(u, 0, 3.4, x => x));
        groundMarks(F, 0);
        const um = 1 - sm(u, 1.6, 2.3);
        const o = Object.assign({ x: fx, y: F, s: 1.45, dir: 1, t }, walk(t * 7.5, walkK, um));
        figRefl(o, F); const hands = figure(o); umbrella(hands[0], um, t);
        rain(oy, ra, t, 7, um > 0.6 ? [hands[0][0], 140, oy] : null);
        spaced('CHEGOU', 540, F + 60, 22, { color: AMB, a: sm(u, 3.2, 3.8) * (1 - sm(t, T_END, T_END + 0.4)) });
      }
      ctx.restore();
    }

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    cue(0.2, 'steps'); cue(RAIN0, 'rain'); cue(RAIN0 + 0.3, 'thunder'); cue(3.4, 'sigh'); cue(3.75, 'umbrella'); cue(4.4, 'steps');
    cue(T_SKIP - 0.1, 'whoosh'); cue(T_SKIP + 0.1, 'tickstart'); cue(A2 - 0.1, 'tickstop'); cue(A2 + 0.1, 'rain2'); cue(A2 + 2.8, 'door'); cue(A2 + 3.4, 'success'); cue(T_END + 0.2, 'end');

    function label(s, y, a, col) { spaced(s, 70, y, 24, { align: 'left', color: col || MU, a }); }
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const fadeIn = sm(t, 0, 0.5), skipDim = sm(t, T_SKIP - 0.2, T_SKIP + 0.2) * (1 - sm(t, A2 - 0.4, A2)), endDim = sm(t, T_END, T_END + 0.6);
      const vis = fadeIn * (1 - skipDim * 0.85) * (1 - endDim * 0.88);
      panelMot(t, PAN[0].oy); panelDis(t, PAN[1].oy); ga(1);
      if (vis < 1) PAN.forEach(p => { ctx.globalAlpha = 1 - vis; ctx.fillStyle = BG; ctx.fillRect(0, p.oy, W, PH); ctx.globalAlpha = 1; });
      const la = fadeIn * (1 - skipDim) * (1 - endDim);
      label('QUEM DEPENDE DA MOTIVAÇÃO', PAN[0].oy - 26, la);
      label('QUEM TEM DISCIPLINA', PAN[1].oy - 26, la);
      if (t < T_SKIP) {
        serif([['Os dois começaram ', false], ['no mesmo dia.', true]], 540, 150, 56, sm(t, 0.3, 0.9) * (1 - sm(t, T_SKIP - 0.4, T_SKIP)));
        serif([['A diferença apareceu ', false], ['na primeira chuva.', true, '#ff5a5f']], 540, 228, 50, sm(t, 3.9, 4.5) * (1 - sm(t, T_SKIP - 0.4, T_SKIP)));
      } else if (t < T_END) {
        serif([['Um esperou o tempo abrir. ', false]], 540, 150, 54, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END)));
        serif([['O outro ', false], ['chegou.', true, AMB]], 540, 228, 60, sm(t, A2 + 2.6, A2 + 3.2) * (1 - sm(t, T_END - 0.3, T_END)));
      }
      if (skipDim > 0) { serif([['100 chuvas ', false], ['depois', true]], 540, 990, 104, skipDim); }
      if (endDim > 0) {
        serif([['Motivação te leva até ', false]], 540, 820, 58, endDim); serif([['a primeira chuva.', true]], 540, 895, 58, endDim);
        serif([['Disciplina te leva ', false], ['até o fim.', true, AMB]], 540, 990, 62, sm(t, T_END + 0.5, T_END + 1.1));
        const va = sm(t, T_END + 1.3, T_END + 1.9);
        ga(va); rr(150, 1090, 780, 150, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"No tempo próprio colheremos,', true]], 540, 1135, 40, va); serif([['se não desanimarmos."', true]], 540, 1180, 40, va); spaced('GÁLATAS 6:9', 540, 1220, 20, { color: AMB, a: va });
      }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
