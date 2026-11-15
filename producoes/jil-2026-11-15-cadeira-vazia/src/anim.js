/*
 * "A CADEIRA VAZIA": estilo pôster escuro (fundo preto, holofote, bonecos brancos lisos com reflexo).
 * Em cima, o pai promete "EU VOU, FILHO. PROMETO." e não aparece na apresentação da escola: a cadeira com o cartão
 * "PAPAI" fica vazia. Embaixo, o pai promete e aparece, sentado na plateia, aplaudindo.
 * "20 anos depois": o pai idoso convida o filho para o aniversário; em cima o filho repete a promessa e a cadeira dele
 * fica vazia; embaixo o filho chega e senta ao lado do pai. Final: Mateus 5:37.
 * Único vermelho: o balão da promessa. Sem narração, ~18 s, 9:16. Cenas e frases próprias.
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
  const PAN = [{ oy: 330, kind: 'promete' }, { oy: 1040, kind: 'aparece' }], PH = 650, FLOOR = 560;
  const T_CUT = 2.7, T_SKIP = 7.5, A2 = 8.9, T_CUT2 = 2.5, T_END = 14.2;
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

    // ---------- atos ----------
    // gen 0: pai e filho (casa -> apresentação da escola); gen 1: 20 anos depois (convite -> aniversário do pai)
    function act(u, p, oy, t, gen) {
      const F = oy + FLOOR, top = p.kind === 'promete'; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      const cutAt = gen ? T_CUT2 : T_CUT, cut = 1 - Math.abs(prog(u, cutAt - 0.25, cutAt + 0.25) * 2 - 1);
      if (!gen) {
        if (u < cutAt) {
          // casa: o filho mostra o convite; o pai, no celular, promete
          stage(oy, F, top ? 0 : 0.5);
          const dad = Object.assign({ x: 380, y: F, s: SA, dir: 1, t }, top ? P.ear : mix(P.ear, P.stand, sm(u, 0.9, 1.3)));
          const kid = Object.assign({ x: 730, y: F, s: SK, dir: -1, t, head: 27 }, P.show);
          figRefl(dad, F); figRefl(kid, F); const dh = figure(dad); const kh = figure(kid); paper(kh, 1.1);
          if (top || u < 1.1) phoneAt(dh[0], SA);
          if (top) bubble(['EU VOU, FILHO.', 'PROMETO.'], 420, oy + 104, 1 - prog(u, 2.3, 2.6), true, 54);
          else bubble(['EU VOU ESTAR LÁ.'], 430, oy + 120, prog(u, 0.15, 0.4) * (1 - prog(u, 2.3, 2.6)), false, 44);
        } else {
          // apresentação: o filho no palco, a plateia nas cadeiras
          stage(oy, F, top ? 0 : 0.6, 840); platform(F);
          const v = u - cutAt;
          const parentL = Object.assign({ x: 140, y: F, s: 1.4, dir: 1, t, col: GRAY, col2: '#6f6f78' }, P.sit), parentR = Object.assign({ x: 470, y: F, s: 1.4, dir: 1, t, col: GRAY, col2: '#6f6f78' }, P.sit);
          chair(140, F, 1.4, 1); chair(470, F, 1.4, 1); chair(305, F, 1.4, 1, top ? 'PAPAI' : null);
          if (top) glow(305, F - 120, 170, 'rgba(255,240,210,A)', 0.22);
          figRefl(parentL, F); figRefl(parentR, F); figure(parentL); figure(parentR);
          let kp;
          if (top) { const d = sm(v, 1.6, 2.3); kp = mix(withArms(P.wave, [[2.7 + 0.25 * Math.sin(t * 9), 3.1], [0.15, 0.1]]), P.stand, d); }
          else kp = withArms(P.wave, [[2.7 + 0.3 * Math.sin(t * 10), 3.1], [0.15, 0.1]]);
          const kid = Object.assign({ x: 800, y: F - 64, s: SK, dir: -1, t, head: 27, nod: top ? 0.5 * sm(v, 2.0, 2.8) : 0, bob: top ? 0 : -Math.abs(Math.sin(t * 7)) * 6 }, kp);
          figRefl(kid, F - 64); figure(kid);
          if (!top) { const cl = Math.sin(t * 16) * 0.25; const dad = Object.assign({ x: 305, y: F, s: SA * 0.95, dir: 1, t }, v < 0.9 ? P.sit : mix(P.sit, withArms(P.clap, [[1.5 + cl, 2.4], [1.3 - cl, 2.6]]), sm(v, 0.9, 1.3))); figRefl(dad, F); figure(dad);
            bubble(['É O MEU PAI!'], 780, oy + 150, prog(v, 1.3, 1.6) * (1 - prog(v, 4.0, 4.3)), false, 40); }
          else { ga(prog(v, 2.4, 2.8)); spaced('VAZIA', 305, oy + 200, 26, { color: FIG }); ga(1); }
        }
      } else {
        if (u < cutAt) {
          // 20 anos depois: o pai idoso convida; o filho adulto, no celular, responde
          stage(oy, F, top ? 0 : 0.5);
          const old = Object.assign({ x: 330, y: F, s: SA * 0.97, dir: 1, t, col: '#cfcfd6' }, P.old);
          const son = Object.assign({ x: 760, y: F, s: SS, dir: -1, t }, top ? P.ear : mix(P.ear, P.stand, sm(u, 1.0, 1.4)));
          figRefl(old, F); figRefl(son, F); figure(old); const sh = figure(son);
          if (top || u < 1.2) phoneAt(sh[0], SS);
          bubble(['VEM NO MEU', 'ANIVERSÁRIO?'], 330, oy + 120, prog(u, 0.0, 0.2) * (1 - prog(u, 0.85, 1.05)), false, 38);
          if (top) bubble(['EU VOU, PAI.', 'PROMETO.'], 680, oy + 104, prog(u, 0.95, 1.2) * (1 - prog(u, 2.1, 2.4)), true, 54);
          else bubble(['EU VOU, PAI.'], 700, oy + 120, prog(u, 0.95, 1.2) * (1 - prog(u, 2.1, 2.4)), false, 44);
        } else {
          // aniversário: o pai idoso à mesa com o bolo
          const v = u - cutAt;
          stage(oy, F, top ? 0.15 : 0.8, 560);
          chair(330, F, SA * 0.97, 1); chair(760, F, SS, -1, top ? 'FILHO' : null);
          table(420, 680, F, true, t);
          const old = Object.assign({ x: 330, y: F, s: SA * 0.97, dir: 1, t, col: '#cfcfd6', nod: top ? 0.45 * sm(v, 1.0, 1.8) : 0 }, P.sit);
          figRefl(old, F); figure(old);
          if (top) glow(760, F - 120, 170, 'rgba(255,240,210,A)', 0.2);
          else { const son = Object.assign({ x: 760, y: F, s: SS, dir: -1, t }, P.sit); figRefl(son, F); figure(son);
            bubble(['CHEGUEI, PAI.'], 700, oy + 130, prog(v, 0.2, 0.5) * (1 - prog(v, 2.4, 2.7)), false, 40); }
        }
      }
      // corte entre as duas cenas de cada ato
      if (cut > 0) { ctx.globalAlpha = cut; ctx.fillStyle = BG; ctx.fillRect(0, oy, W, PH); ctx.globalAlpha = 1; }
      ctx.restore();
    }

    // ---------- som ----------
    cue(0, 'amb'); cue(0.05, 'promise'); cue(0.6, 'paper'); cue(T_CUT, 'whoosh_s');
    cue(T_CUT + 0.4, 'kids'); cue(T_CUT + 1.0, 'clap'); cue(T_CUT + 2.4, 'sigh');
    cue(T_SKIP + 0.1, 'whoosh'); cue(T_SKIP + 0.2, 'tickstart'); cue(A2 - 0.1, 'tickstop');
    cue(A2 + 0.05, 'pop'); cue(A2 + 1.0, 'promise'); cue(A2 + T_CUT2, 'whoosh_s'); cue(A2 + T_CUT2 + 0.2, 'door'); cue(A2 + T_CUT2 + 1.2, 'sigh');
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
      label(inA2 ? 'O FILHO QUE ESPEROU' : 'PAI QUE PROMETE', PAN[0].oy - 26, la);
      label(inA2 ? 'O FILHO QUE VIU O PAI CHEGAR' : 'PAI QUE APARECE', PAN[1].oy - 26, la);
      if (t < T_SKIP) { const fo = 1 - sm(t, T_SKIP - 0.4, T_SKIP);
        serif([['Ele disse ', false], ['"eu vou".', true]], 540, 150, 56, fo);
        serif([['O filho aprendeu ', false], ['quanto isso vale.', true, AMB]], 540, 228, 54, sm(t, 4.4, 5.0) * fo); }
      else if (t < T_END) { serif([['E um dia, ', false], ['ele promete igual.', true]], 540, 185, 58, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END))); }
      if (skipDim > 0) { serif([['20 anos ', false], ['depois', true]], 540, 990, 110, skipDim); }
      if (endDim > 0) { serif([['Seu filho esquece o que você prometeu.', false]], 540, 820, 50, endDim); serif([['Não esquece ', false], ['onde você estava.', true, AMB]], 540, 900, 54, sm(t, T_END + 0.5, T_END + 1.1));
        const va = sm(t, T_END + 1.4, T_END + 2.0); ga(va); rr(150, 1010, 780, 150, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"Seja a tua palavra: Sim, sim; não, não."', true]], 540, 1065, 40, va); spaced('MATEUS 5:37', 540, 1122, 22, { color: AMB, a: va }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
