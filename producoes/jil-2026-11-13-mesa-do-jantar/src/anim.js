/*
 * "A MESA DO JANTAR": pais e filhos, estilo pôster escuro (fundo preto, luminária, bonecos brancos lisos com reflexo).
 * Em cima, a família de cabeça baixa no celular (telas vermelhas): o filho tenta falar, ninguém olha, ele pega o celular também.
 * Embaixo, a família que conversa. "10 anos depois": em cima a cadeira dele fica vazia; embaixo ele volta pra jantar.
 * Sem narração, ~17,5 s, 9:16. Cenas e frases próprias.
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
  const PAN = [{ oy: 330, kind: 'tela' }, { oy: 1040, kind: 'conversa' }], PH = 650, FLOOR = 540;
  const A1 = 0.7, T_SKIP = 7.3, A2 = 8.7, T_END = 13.6;

  function create(TL, env) {
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot); ctx.font = o.font || `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; ctx.fillStyle = o.color || FIG; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, font) => { ctx.font = font; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = size * 0.3; ctx.font = `800 ${size}px Inter`; const ws = [...s].map(c => ctx.measureText(c).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1); let cx = x - (o.align === 'left' ? 0 : tot / 2); [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w: 800, color: o.color || MU, a: o.a ?? 1 }); cx += ws[i] + sp; }); }
    function serif(parts, x, y, size, a = 1) { if (a <= 0) return; const fN = `400 ${size}px Serif`, fI = `italic 400 ${size}px Serif`; let tot = 0; parts.forEach(p => { p.w = tw(p[0], p[1] ? fI : fN); tot += p.w; }); let cx = x - tot / 2; parts.forEach(p => { txt(p[0], cx, y, size, { font: p[1] ? fI : fN, align: 'left', color: p[2] || FIG, a }); cx += p.w; }); }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }

    // ---------- boneco liso (manequim), mesmo do modelo ----------
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
      // celular (tela vermelha acesa)
      if (o.phone > 0) { const [px, py] = hands[0]; ga(o.phone); glow(px + 4, py - 18, 70, 'rgba(224,38,43,A)', 0.55); ctx.save(); ctx.translate(px + 4, py - 14); ctx.rotate(-0.5); ctx.fillStyle = '#1a1a1e'; rr(-11, -20, 22, 40, 5); ctx.fill(); ctx.fillStyle = RED; rr(-8, -16, 16, 32, 3); ctx.fill(); ctx.restore(); ga(1); }
      ctx.restore();
      return { head: [o.x + d * hx * s, o.y + hy * s] };
    }
    function figRefl(o, floorY) { ctx.save(); ctx.translate(0, floorY * 2); ctx.scale(1, -1); ga(0.13); figure(Object.assign({}, o, { flat: true, phone: 0 })); ga(1); ctx.restore(); }
    const P = {
      sit: { lean: 0.08, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.6, 1.3], [0.5, 1.2]] },
      phone: { lean: 0.22, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.7, 2.7], [0.6, 2.5]], nod: 0.75 },
      talk: { lean: 0.12, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[1.9, 2.7], [0.5, 1.2]], nod: -0.15 },
      lean: { lean: 0.32, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[1.2, 1.6], [0.9, 1.4]], nod: -0.05 },
      stand: { lean: 0, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[-0.15, -0.1], [0.15, 0.1]], nod: 0 },
    };
    const mix = (a, b, k) => ({ lean: lerp(a.lean, b.lean, k), crouch: lerp(a.crouch, b.crouch, k), nod: lerp(a.nod || 0, b.nod || 0, k), legs: a.legs.map((l, i) => [lerp(l[0], b.legs[i][0], k), lerp(l[1], b.legs[i][1], k)]), arms: a.arms.map((l, i) => [lerp(l[0], b.arms[i][0], k), lerp(l[1], b.arms[i][1], k)]) });
    const walk = (t, k) => { const w = Math.sin(t * 9) * 0.45 * k; return { lean: 0.06, crouch: 0, nod: 0, legs: [[w, w * 0.4], [-w, -w * 0.4 - 0.05]], arms: [[-w * 0.7, -w * 0.5], [w * 0.7, w * 0.5]] }; };

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    function chair(x, F, dir, s, hi = 0) { const sy = F - 54 * s / 1.15 - hi; ctx.fillStyle = '#26262b'; rr(x - 34, sy, 68, 11, 4); ctx.fill(); ctx.fillRect(x - 28, sy + 11, 7, F - sy - 11); ctx.fillRect(x + 21, sy + 11, 7, F - sy - 11); const bx = x - dir * 36; ctx.fillRect(bx - 4, sy - 90, 8, 100); }
    function bubble(x, y, l1, l2, b, dark) { if (b <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(b, b); rr(-150, -44, 300, 88, 44); ctx.fillStyle = dark ? '#16161a' : '#e9e5dc'; ctx.fill(); if (dark) { ctx.strokeStyle = MU; ctx.lineWidth = 3; ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-10, 38); ctx.lineTo(-30, 74); ctx.lineTo(18, 40); ctx.fillStyle = dark ? '#16161a' : '#e9e5dc'; ctx.fill(); const c = dark ? MU : '#1a1a1d'; if (l2) { txt(l1, 0, -14, 30, { color: c }); txt(l2, 0, 20, 26, { color: c }); } else txt(l1, 0, 2, 34, { color: c }); ctx.restore(); }

    // ---------- um painel ----------
    function act(u, p, oy, later, t) {
      const F = oy + FLOOR, tx0 = 400, tx1 = 720, tY = F - 112, kidX = 560, momX = 300, dadX = 820;
      const top = p.kind === 'tela';
      const warm = top ? 0 : (later ? sm(u, 1.6, 2.6) : sm(u, 2.6, 3.6));
      ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      ctx.fillStyle = BG; ctx.fillRect(0, oy, W, PH);
      const cone = ctx.createLinearGradient(0, oy, 0, F); cone.addColorStop(0, `rgba(255,${top ? 225 : 236},${top ? 215 : 200},0.15)`); cone.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(545, oy + 64); ctx.lineTo(575, oy + 64); ctx.lineTo(980, F); ctx.lineTo(140, F); ctx.closePath(); ctx.fill();
      glow(560, F, 520, 'rgba(255,214,150,A)', 0.1 + 0.16 * warm);
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(560, oy); ctx.lineTo(560, oy + 40); ctx.stroke();
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(515, oy + 66); ctx.quadraticCurveTo(560, oy + 26, 605, oy + 66); ctx.closePath(); ctx.fill(); glow(560, oy + 70, 70, 'rgba(255,230,190,A)', 0.8);
      const fg = ctx.createLinearGradient(0, F, 0, oy + PH); fg.addColorStop(0, '#16161a'); fg.addColorStop(1, '#060607'); ctx.fillStyle = fg; ctx.fillRect(0, F, W, oy + PH - F); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, F, W, 2);
      ctx.save(); ctx.translate(560, F); ctx.scale(1.5, 1.5); ctx.translate(-560, -F);

      // ---- poses ----
      const S = 1.15, KS = later ? 1.15 : 0.95;
      let mom, dad, kid = null;
      const ping = later ? 0 : 1;
      if (top) {
        if (!later) {
          mom = mix(P.sit, P.phone, sm(u, 0.2, 0.7)); dad = mix(P.sit, P.phone, sm(u, 0.4, 0.9));
          let kp = mix(P.sit, P.talk, sm(u, 1.6, 2.0)); kp.arms[0][1] += Math.sin(t * 10) * 0.25 * sm(u, 1.7, 2.0) * (1 - sm(u, 3.6, 4.0));
          kp = mix(kp, P.sit, sm(u, 3.6, 4.0)); kp.nod = lerp(kp.nod, 0.55, sm(u, 3.6, 4.1));
          kp = mix(kp, P.phone, sm(u, 4.5, 5.0));
          kid = Object.assign({ x: kidX, y: F - 30, s: KS, dir: 1, t, head: 27, phone: sm(u, 4.6, 5.0) }, kp);
          mom = Object.assign({ x: momX, y: F, s: S, dir: 1, t, phone: sm(u, 0.2, 0.6) }, mom);
          dad = Object.assign({ x: dadX, y: F, s: S, dir: -1, t, phone: sm(u, 0.4, 0.8) }, dad);
        } else {
          const look = sm(u, 2.0, 2.6);
          mom = Object.assign({ x: momX, y: F, s: S, dir: 1, t, phone: 1, col: '#d4d4da' }, P.phone);
          const dp = mix(P.phone, Object.assign({}, P.sit, { lean: 0.02, nod: -0.05, arms: [[0.4, 0.6], [0.3, 0.4]] }), look);
          dad = Object.assign({ x: dadX, y: F, s: S, dir: -1, t, phone: 1 - look, col: '#d4d4da' }, dp);
        }
      } else {
        if (!later) {
          let kp = mix(P.sit, P.talk, sm(u, 1.6, 2.0)); kp.arms[0][1] += Math.sin(t * 10) * 0.25 * sm(u, 1.7, 2.0) * (1 - sm(u, 4.6, 5.0)); kp = mix(kp, P.sit, sm(u, 4.6, 5.1));
          kid = Object.assign({ x: kidX, y: F - 30, s: KS, dir: 1, t, head: 27, bob: Math.sin(t * 14) * 2 * sm(u, 3.4, 3.6) * (1 - sm(u, 4.4, 4.6)) }, kp);
          const lk = sm(u, 2.1, 2.6);
          mom = Object.assign({ x: momX, y: F, s: S, dir: 1, t, bob: Math.sin(t * 16) * 2.5 * sm(u, 3.4, 3.6) * (1 - sm(u, 4.4, 4.6)) }, mix(P.sit, P.lean, lk * 0.6));
          dad = Object.assign({ x: dadX, y: F, s: S, dir: -1, t }, mix(P.sit, P.lean, lk));
        } else {
          const wk = sm(u, 0.3, 2.0), sit = sm(u, 2.0, 2.5);
          const kx = lerp(-80, kidX, wk);
          let kp = sit > 0 ? mix(P.stand, P.sit, sit) : walk(t, 1 - sm(u, 1.8, 2.0));
          if (u > 2.8) { kp = mix(kp, P.talk, sm(u, 2.8, 3.2)); kp.arms[0][1] += Math.sin(t * 10) * 0.25 * sm(u, 3.0, 3.2); }
          kid = Object.assign({ x: kx, y: lerp(F, F - 2, sit), s: KS, dir: 1, t }, kp);
          const lk = sm(u, 0.6, 1.4);
          mom = Object.assign({ x: momX, y: F, s: S, dir: 1, t, col: '#d4d4da', bob: Math.sin(t * 16) * 2.5 * sm(u, 3.2, 3.4) }, mix(P.sit, P.lean, lk * 0.5));
          dad = Object.assign({ x: dadX, y: F, s: S, dir: -1, t, col: '#d4d4da' }, mix(P.sit, P.lean, lk));
        }
      }
      // reflexos
      figRefl(mom, F); figRefl(dad, F); if (kid) figRefl(kid, F);
      // cadeiras
      chair(momX, F, 1, S); chair(dadX, F, -1, S); chair(kidX, F, 1, 1.0, later ? 0 : 22);
      figure(mom); figure(dad);
      if (kid) figure(kid);
      // mesa (na frente do filho)
      ctx.fillStyle = '#2c2c32'; rr(tx0, tY, tx1 - tx0, 16, 4); ctx.fill(); ctx.fillRect(tx0 + 24, tY + 16, 12, F - tY - 16); ctx.fillRect(tx1 - 36, tY + 16, 12, F - tY - 16);
      // pratos (o do filho some quando a cadeira fica vazia)
      ctx.fillStyle = '#d9d7d0'; for (const px of [455, 560, 665]) { if (top && later && px === 560) continue; ctx.beginPath(); ctx.ellipse(px, tY - 2, 34, 6, 0, 0, TAU); ctx.fill(); }
      // cadeira vazia em destaque
      if (top && later) glow(kidX, F - 90, 140, 'rgba(255,255,255,A)', 0.12 * sm(u, 2.2, 2.8));
      ctx.restore();
      // notificações (em cima)
      if (top && !later) for (const [u0, x, y] of [[1.0, 330, oy + 200], [2.4, 840, oy + 180], [3.2, 300, oy + 230]]) { const b = sm(u, u0, u0 + 0.2, outBack) * (1 - sm(u, u0 + 0.8, u0 + 1.0)); if (b > 0) { ctx.save(); ctx.translate(x, y); ctx.scale(b, b); ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(0, 0, 20, 0, TAU); ctx.fill(); txt('1', 0, 2, 24, { color: '#fff' }); ctx.restore(); } }
      // falas
      if (!later) bubble(520, oy + 110, 'PAI, OLHA', 'O QUE EU FIZ!', sm(u, 1.8, 2.1, outBack) * (1 - sm(u, top ? 3.5 : 2.6, top ? 3.8 : 2.8)), top);
      if (top && !later) { const b = sm(u, 2.7, 2.9, outBack) * (1 - sm(u, 3.5, 3.8)); if (b > 0) { ctx.save(); ctx.translate(900, oy + 150); ctx.scale(b, b); txt('hum…', 0, 0, 32, { font: 'italic 400 56px Serif', color: MU }); ctx.restore(); } }
      if (!top && !later) bubble(860, oy + 130, 'SÉRIO?', 'ME CONTA!', sm(u, 2.6, 2.9, outBack) * (1 - sm(u, 4.4, 4.7)), false);
      if (!top && later) bubble(400, oy + 110, 'CHEGUEI!', null, sm(u, 1.4, 1.7, outBack) * (1 - sm(u, 2.6, 2.9)), false);
      ctx.restore();
    }

    // ---------- som ----------
    cue(A1 + 0.3, 'phone'); cue(A1 + 1.0, 'ping'); cue(A1 + 1.8, 'voice'); cue(A1 + 2.4, 'ping'); cue(A1 + 2.6, 'laugh'); cue(A1 + 3.2, 'ping'); cue(A1 + 3.6, 'sigh'); cue(A1 + 4.6, 'phone');
    cue(T_SKIP + 0.05, 'whoosh'); cue(T_SKIP + 0.15, 'tickstart'); cue(A2 - 0.1, 'tickstop');
    cue(A2 + 0.3, 'steps'); cue(A2 + 0.2, 'door'); cue(A2 + 1.4, 'hello'); cue(A2 + 2.1, 'chairpull'); cue(A2 + 2.2, 'sigh2');
    cue(T_END + 0.2, 'end');

    function label(s, y, a, col) { spaced(s, 70, y, 24, { align: 'left', color: col || MU, a }); }
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const later = t >= A2 - 0.15, u = later ? t - A2 : t - A1;
      const fadeIn = sm(t, 0, 0.5), skipDim = sm(t, T_SKIP - 0.2, T_SKIP + 0.2) * (1 - sm(t, A2 - 0.4, A2)), endDim = sm(t, T_END, T_END + 0.6);
      const vis = fadeIn * (1 - skipDim * 0.85) * (1 - endDim * 0.78);
      PAN.forEach(p => { act(Math.max(0, u), p, p.oy, later, t); ga(1); if (vis < 1) { ctx.globalAlpha = 1 - vis; ctx.fillStyle = BG; ctx.fillRect(0, p.oy, W, PH); ctx.globalAlpha = 1; } });
      const la = fadeIn * (1 - skipDim) * (1 - endDim);
      label(later ? 'A CADEIRA DELE FICOU VAZIA' : 'MESA DE CABEÇA BAIXA', PAN[0].oy - 26, la);
      label(later ? 'ELE AINDA VOLTA PRA JANTAR' : 'MESA QUE CONVERSA', PAN[1].oy - 26, la);
      if (t < T_SKIP) { serif([['Mesma mesa, mesma hora.', false]], 540, 150, 56, sm(t, 0.2, 0.8) * (1 - sm(t, T_SKIP - 0.4, T_SKIP)));
        serif([['Cada um ', false], ['em outro mundo.', true, '#ff5a5f']], 540, 228, 56, sm(t, 1.4, 2.0) * (1 - sm(t, T_SKIP - 0.4, T_SKIP))); }
      else if (t < T_END) { serif([['E um dia, ', false], ['ele sai de casa.', true]], 540, 190, 60, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END))); }
      if (skipDim > 0) { serif([['10 anos ', false], ['depois', true]], 540, 990, 110, skipDim); }
      if (endDim > 0) { serif([['Ele não vai lembrar da comida.', false]], 540, 840, 56, endDim); serif([['Vai lembrar ', false], ['se você olhou pra ele.', true, AMB]], 540, 922, 56, sm(t, T_END + 0.5, T_END + 1.1));
        const va = sm(t, T_END + 1.3, T_END + 1.9); ga(va); rr(150, 1030, 780, 190, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"Ensina-nos a contar os nossos dias,', true]], 540, 1080, 40, va); serif([['para que alcancemos coração sábio."', true]], 540, 1130, 40, va); spaced('SALMOS 90:12', 540, 1185, 22, { color: AMB, a: va }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
