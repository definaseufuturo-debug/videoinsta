/*
 * "PRESENTE × PRESENÇA": estilo pôster escuro (fundo preto, holofote, bonecos brancos lisos com reflexo).
 * Em cima, o pai entrega o videogame caro ("toma, agora me deixa trabalhar") e sai; o filho joga sozinho.
 * Embaixo, o pai senta no chão e pede pro filho ensinar a jogar. "20 anos depois": em cima o filho adulto entrega um
 * presente ao pai idoso com a mesma frase e vai embora; embaixo o filho senta com o pai e ensina. Final: Salmos 127:3.
 * Único vermelho: o balão da frase. Sem narração, ~17,8 s, 9:16. Cenas e frases próprias.
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
  const PAN = [{ oy: 330, kind: 'presente' }, { oy: 1040, kind: 'presenca' }], PH = 650, FLOOR = 560;
  const T_SKIP = 7.4, A2 = 8.8, T_END = 14.0;
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
      give: { lean: 0.05, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[1.3, 1.6], [1.1, 1.5]] },
      floor: { lean: 0.15, crouch: 84, legs: [[1.6, 0.1], [1.5, -0.1]], arms: [[1.0, 1.9], [0.8, 1.8]] },
      old: { lean: 0.18, crouch: 3, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[1.1, 1.5], [0.9, 1.4]] },
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

    function gift(x, y, s, open = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#4a4a54'; rr(-40, -56, 80, 56, 4); ctx.fill(); ctx.fillStyle = '#d9d6cf'; ctx.fillRect(-6, -56, 12, 56);
      ctx.save(); ctx.translate(-44, -58); ctx.rotate(-1.2 * open); ctx.fillStyle = '#5a5a64'; rr(0, -12, 88, 14, 3); ctx.fill(); ctx.fillStyle = '#d9d6cf'; ctx.fillRect(38, -12, 12, 14); if (open < 0.5) { ctx.strokeStyle = '#d9d6cf'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(32, -20, 14, 9, -0.5, 0, TAU); ctx.ellipse(56, -20, 14, 9, 0.5, 0, TAU); ctx.stroke(); } ctx.restore(); ctx.restore(); }
    function pad(h, s) { const [x, y] = mid(h); ctx.fillStyle = '#2a2a31'; rr(x - 22 * s, y - 10 * s, 44 * s, 20 * s, 9 * s); ctx.fill(); }
    function tv(F, t) { const x = 930, y = F - 200; ctx.fillStyle = '#1e1e24'; ctx.fillRect(x + 50, F - 70, 14, 70); ctx.fillRect(x + 20, F - 6, 74, 6); rr(x - 40, y, 190, 130, 6); ctx.fill(); const fl = 0.75 + 0.25 * Math.sin(t * 7) * Math.sin(t * 3.1); ctx.fillStyle = `rgba(150,190,255,${0.55 * fl})`; ctx.fillRect(x - 32, y + 8, 174, 114); glow(x + 30, y + 70, 300, 'rgba(150,190,255,A)', 0.22 * fl); }

    // ---------- um ato ----------
    // gen 0: pai e filho; gen 1: 20 anos depois (o filho adulto e o pai idoso)
    function act(u, p, oy, t, gen) {
      const F = oy + FLOOR; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      if (p.kind === 'presente') {
        stage(oy, F, 0, gen ? 0.3 : 1); if (!gen) tv(F, t);
        if (!gen) {
          // pai entrega o presente e vai embora; o filho fica sozinho com o videogame
          const leave = sm(u, 2.6, 5.0, x => x), turned = u > 2.5;
          const dad = Object.assign({ x: lerp(380, -200, leave), y: F, s: SA, dir: turned ? -1 : 1, t }, turned ? walk(u * 9) : mix(P.give, P.stand, sm(u, 1.2, 1.6)));
          const sitk = sm(u, 3.0, 3.8), kx = lerp(700, 730, sitk);
          const kid = Object.assign({ x: kx, y: F, s: SK, dir: sitk > 0.5 ? 1 : -1, t, head: 27, nod: 0.35 * sm(u, 4.6, 5.4) }, sitk > 0 ? mix(P.give, P.floor, sitk) : (u < 0.9 ? P.stand : mix(P.stand, P.give, sm(u, 0.9, 1.2))));
          figRefl(dad, F); figRefl(kid, F); const dh = figure(dad); const kh = figure(kid);
          if (u < 1.1) { const [gx, gy] = mid(dh); gift(gx + 30, gy + 28, 1.3); }
          else if (sitk <= 0) { const [gx, gy] = mid(kh); gift(gx - 10, gy + 28, 1.3); }
          else { gift(600, F, 1.3, 1); pad(kh, SK); }
          bubble(['TOMA. AGORA ME', 'DEIXA TRABALHAR.'], 440, oy + 100, 1 - prog(u, 2.5, 2.8), true, 50);
          bubble(['JOGA COMIGO?'], 780, oy + 150, prog(u, 3.2, 3.5) * (1 - prog(u, 5.4, 5.7)), false, 38);
          if (u > 5.6) { ga(prog(u, 5.6, 6.0)); spaced('SOZINHO', 730, oy + 170, 26, { color: FIG }); ga(1); }
        } else {
          // 20 anos depois: o filho adulto entrega o presente ao pai idoso e vai embora
          const leave = sm(u, 2.7, 4.8, x => x), turned = u > 2.6;
          const son = Object.assign({ x: lerp(740, 1300, leave), y: F, s: SS, dir: turned ? 1 : -1, t }, turned ? walk(u * 9) : mix(P.give, P.stand, sm(u, 1.4, 1.8)));
          const old = Object.assign({ x: 360, y: F, s: SA * 0.97, dir: 1, t, col: '#cfcfd6', nod: 0.4 * sm(u, 3.6, 4.4) }, u < 1.0 ? P.old : mix(P.old, P.give, sm(u, 1.0, 1.3)));
          figRefl(old, F); figRefl(son, F); const oh = figure(old); const sh = figure(son);
          if (u < 1.2) { const [gx, gy] = mid(sh); gift(gx - 30, gy + 28, 1.3); } else { const [gx, gy] = mid(oh); gift(gx + 10, gy + 28, 1.3); }
          bubble(['VEM NO NATAL,', 'FILHO?'], 380, oy + 130, prog(u, 0.0, 0.25) * (1 - prog(u, 0.9, 1.1)), false, 38);
          bubble(['TOMA. AGORA ME', 'DEIXA TRABALHAR.'], 660, oy + 100, prog(u, 1.0, 1.3) * (1 - prog(u, 3.6, 3.9)), true, 50);
        }
      } else {
        stage(oy, F, 0.7 + 0.1 * Math.sin(t * 2), 0); tv(F, t);
        const bounce = k => -Math.abs(Math.sin(t * 6 + k)) * 5;
        if (!gen) {
          const dad = Object.assign({ x: 420, y: F, s: SA, dir: 1, t, bob: bounce(0) }, P.floor);
          const kid = Object.assign({ x: 700, y: F, s: SK, dir: 1, t, head: 27, bob: bounce(1.3) }, P.floor);
          figRefl(dad, F); figRefl(kid, F); const dh = figure(dad); pad(dh, SA); const kh = figure(kid); pad(kh, SK);
          gift(250, F, 1.1, 1);
          bubble(['ME ENSINA A JOGAR?'], 420, oy + 150, prog(u, 0.9, 1.2) * (1 - prog(u, 3.0, 3.3)), false, 40);
          bubble(['VOCÊ É RUIM, PAI!'], 720, oy + 150, prog(u, 3.3, 3.6) * (1 - prog(u, 5.6, 5.9)), false, 38);
        } else {
          const old = Object.assign({ x: 420, y: F, s: SA * 0.97, dir: 1, t, col: '#cfcfd6', bob: bounce(0) }, P.floor);
          const son = Object.assign({ x: 700, y: F, s: SS, dir: 1, t, bob: bounce(1.3) }, P.floor);
          figRefl(old, F); figRefl(son, F); const oh = figure(old); pad(oh, SA); const sh = figure(son); pad(sh, SS);
          bubble(['SENTA AQUI, PAI.', 'EU TE ENSINO.'], 680, oy + 130, prog(u, 0.6, 0.9) * (1 - prog(u, 3.6, 3.9)), false, 40);
        }
      }
      ctx.restore();
    }

    // ---------- som ----------
    cue(0, 'amb'); cue(0.05, 'yell'); cue(1.0, 'box'); cue(2.6, 'steps'); cue(4.6, 'door'); cue(3.2, 'pop'); cue(3.9, 'game'); cue(1.0, 'pop'); cue(3.4, 'laugh');
    cue(T_SKIP + 0.1, 'whoosh'); cue(T_SKIP + 0.2, 'tickstart'); cue(A2 - 0.1, 'tickstop');
    cue(A2 + 0.05, 'pop'); cue(A2 + 1.0, 'yell'); cue(A2 + 1.2, 'box'); cue(A2 + 2.7, 'steps'); cue(A2 + 4.5, 'door'); cue(A2 + 0.6, 'pop'); cue(A2 + 1.5, 'laugh');
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
      label(inA2 ? 'O FILHO QUE GANHOU PRESENTE' : 'PAI QUE DÁ PRESENTE', PAN[0].oy - 26, la);
      label(inA2 ? 'O FILHO QUE GANHOU PRESENÇA' : 'PAI QUE DÁ PRESENÇA', PAN[1].oy - 26, la);
      if (t < T_SKIP) { const fo = 1 - sm(t, T_SKIP - 0.4, T_SKIP);
        serif([['Ele deu ', false], ['o videogame mais caro.', true]], 540, 150, 54, fo);
        serif([['O filho só queria ', false], ['ele.', true, AMB]], 540, 228, 58, sm(t, 3.4, 4.0) * fo); }
      else if (t < T_END) { serif([['E um dia, ', false], ['ele devolve igual.', true]], 540, 185, 58, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END))); }
      if (skipDim > 0) { serif([['20 anos ', false], ['depois', true]], 540, 990, 110, skipDim); }
      if (endDim > 0) { serif([['Seu filho não vai lembrar do preço.', false]], 540, 820, 54, endDim); serif([['Vai lembrar de ', false], ['quem sentou com ele.', true, AMB]], 540, 900, 54, sm(t, T_END + 0.5, T_END + 1.1));
        const va = sm(t, T_END + 1.4, T_END + 2.0); ga(va); rr(190, 1010, 700, 150, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"Herança do Senhor são os filhos."', true]], 540, 1065, 42, va); spaced('SALMOS 127:3', 540, 1122, 22, { color: AMB, a: va }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
