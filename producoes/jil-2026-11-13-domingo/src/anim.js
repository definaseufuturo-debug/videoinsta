/*
 * "DOMINGO QUE VEM": estilo pôster escuro (fundo preto, holofote, bonecos brancos lisos com reflexo).
 * Em cima, o pai que trabalha todo domingo ("domingo que vem") e o calendário se enche de X vermelhos.
 * Embaixo, o pai que guarda o domingo e brinca com o filho. "10 anos depois": em cima o filho adulto responde
 * "não dá, pai, trabalho" e vai embora; embaixo o filho adulto senta com o pai e pergunta "domingo que vem, de novo?".
 * Final: frase-tese + Eclesiastes 3:1. Sem narração, ~17,6 s, 9:16. Cenas e frases próprias.
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
  const PAN = [{ oy: 330, kind: 'work' }, { oy: 1040, kind: 'home' }], PH = 650, FLOOR = 560;
  const A1 = 0.8, T_SKIP = 7.6, A2 = 9.0, T_END = 13.8;
  const SA = 1.5, SK = 1.05, SS = 1.42; // escalas: adulto, criança, filho adulto
  const MARKS = [1.0, 2.2, 3.4, 4.6, 5.8]; // domingos marcados (tempo local do ato 1)

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
      if (o.bag) { const [bx, by] = hands[1]; ctx.fillStyle = '#4a4a52'; rr(bx - 22, by - 4, 44, 34, 5); ctx.fill(); }
      ctx.restore();
      return hands.map(([x, y]) => [o.x + (o.dir || 1) * x * s, o.y + y * s]);
    }
    function figRefl(o, floorY) { ctx.save(); ctx.translate(0, floorY * 2); ctx.scale(1, -1); ga(0.13); figure(Object.assign({}, o, { flat: true })); ga(1); ctx.restore(); }
    const P = {
      stand: { lean: 0, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[-0.15, -0.1], [0.15, 0.1]] },
      sad: { lean: 0.12, crouch: 0, legs: [[-0.06, -0.06], [0.08, 0.06]], arms: [[0.02, 0.0], [0.05, 0.02]] },
      ask: { lean: 0.05, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[1.1, 1.5], [0.15, 0.1]] },
      sit: { lean: 0.05, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.4, 0.5], [0.3, 0.3]] },
      type: { lean: 0.22, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[1.15, 1.6], [0.95, 1.5]] },
      kneel: { lean: 0.15, crouch: 46, legs: [[1.5, 0], [0.15, -1.55]], arms: [[1.2, 1.9], [0.9, 1.7]] },
      catch: { lean: 0.05, crouch: 0, legs: [[-0.12, -0.12], [0.14, 0.1]], arms: [[1.3, 1.9], [1.0, 1.7]] },
      old: { lean: 0.16, crouch: 2, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[0.9, 1.2], [0.1, 0.05]] },
    };
    const mix = (a, b, k) => ({ lean: lerp(a.lean, b.lean, k), crouch: lerp(a.crouch, b.crouch, k), legs: a.legs.map((l, i) => [lerp(l[0], b.legs[i][0], k), lerp(l[1], b.legs[i][1], k)]), arms: a.arms.map((l, i) => [lerp(l[0], b.arms[i][0], k), lerp(l[1], b.arms[i][1], k)]) });
    const walk = ph => { const a = Math.sin(ph) * 0.45; return { lean: 0.06, crouch: 0, bob: -Math.abs(Math.cos(ph)) * 4, legs: [[a, a - 0.25 * Math.max(0, a)], [-a, -a - 0.25 * Math.max(0, -a)]], arms: [[-a * 0.6, -a * 0.4], [a * 0.6, a * 0.4]] }; };

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ---------- calendário na parede ----------
    function calendar(x, y, kind, n, a) {
      if (a <= 0) return; ga(a); const cw = 46, ch = 40, w = cw * 7 + 20, h = ch * 5 + 70;
      rr(x, y, w, h, 8); ctx.fillStyle = '#121216'; ctx.fill(); ctx.strokeStyle = '#2e2e35'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = kind === 'work' ? RED : '#3b3b44'; rr(x, y, w, 14, 8); ctx.fill();
      'DSTQQSS'.split('').forEach((c, i) => txt(c, x + 10 + cw * i + cw / 2, y + 36, 20, { w: 800, color: i === 0 ? (kind === 'work' ? RED : FIG) : MU }));
      for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
        const cx = x + 10 + cw * c + cw / 2, cy = y + 60 + ch * r + ch / 2;
        ctx.fillStyle = c === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.035)'; ctx.fillRect(cx - cw / 2 + 3, cy - ch / 2 + 3, cw - 6, ch - 6);
        if (c === 0) { const k = clamp(n - r); if (k <= 0) continue;
          if (kind === 'work') { ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.lineCap = 'round'; const d = 14; const k1 = clamp(k * 2), k2 = clamp(k * 2 - 1);
            ctx.beginPath(); ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx - d + 2 * d * k1, cy - d + 2 * d * k1); ctx.stroke();
            if (k2 > 0) { ctx.beginPath(); ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx + d - 2 * d * k2, cy - d + 2 * d * k2); ctx.stroke(); } }
          else { ctx.strokeStyle = FIG; ctx.lineWidth = 4; ctx.beginPath(); if (k >= 0.999) ctx.ellipse(cx, cy, 15, 15, 0, 0, TAU); else ctx.arc(cx, cy, 15, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); } }
      }
      ga(1);
    }
    function bubble(s1, s2, x, y, k, red) { if (k <= 0) return; const b = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(b, b);
      const w = Math.max(tw(s1, '900 30px Inter'), s2 ? tw(s2, '900 30px Inter') : 0) + 60, h = s2 ? 96 : 66;
      rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = red ? '#121214' : '#e9e5dc'; ctx.fill(); if (red) { ctx.lineWidth = 4; ctx.strokeStyle = RED; ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-14, h / 2 - 2); ctx.lineTo(0, h / 2 + 30); ctx.lineTo(16, h / 2 - 2); ctx.closePath(); ctx.fillStyle = red ? '#121214' : '#e9e5dc'; ctx.fill(); if (red) { ctx.strokeStyle = RED; ctx.stroke(); ctx.fillStyle = '#121214'; ctx.fillRect(-12, h / 2 - 6, 26, 6); }
      const c = red ? RED : '#1a1a1d'; if (s2) { txt(s1, 0, -18, 30, { color: c }); txt(s2, 0, 20, 30, { color: c }); } else txt(s1, 0, 2, 30, { color: c });
      ctx.restore(); }
    function stage(oy, F, warm, cold) {
      ctx.fillStyle = BG; ctx.fillRect(0, oy, W, PH);
      const cone = ctx.createLinearGradient(0, oy, 0, F); cone.addColorStop(0, `rgba(255,${lerp(240, 225, warm)},${lerp(225, 170, warm)},0.15)`); cone.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(600, oy + 64); ctx.lineTo(630, oy + 64); ctx.lineTo(1020, F); ctx.lineTo(240, F); ctx.closePath(); ctx.fill();
      glow(620, F, 520, 'rgba(255,214,150,A)', 0.08 + 0.18 * warm);
      if (cold > 0) glow(560, F - 150, 260, 'rgba(170,200,255,A)', 0.14 * cold);
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(615, oy); ctx.lineTo(615, oy + 40); ctx.stroke();
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(570, oy + 66); ctx.quadraticCurveTo(615, oy + 26, 660, oy + 66); ctx.closePath(); ctx.fill(); glow(615, oy + 70, 70, 'rgba(255,230,190,A)', 0.8);
      const fg = ctx.createLinearGradient(0, F, 0, oy + PH); fg.addColorStop(0, '#16161a'); fg.addColorStop(1, '#060607'); ctx.fillStyle = fg; ctx.fillRect(0, F, W, oy + PH - F); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, F, W, 2);
    }
    function chair(x, F, s, dir) { const seat = F - 46 * s + 10 * s; ctx.fillStyle = '#26262b'; rr(x - 34 * s, seat, 68 * s, 10 * s, 3); ctx.fill(); ctx.fillRect(x - 28 * s, seat, 7 * s, F - seat); ctx.fillRect(x + 21 * s, seat, 7 * s, F - seat); ctx.fillRect(x - dir * 34 * s, seat - 70 * s, 7 * s, 70 * s); }
    function ballAt(x, y, r = 16) { const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, 1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(1, '#8f8f98'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }

    // ---------- ato 1 ----------
    function act1(u, p, oy, t) {
      const F = oy + FLOOR; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      if (p.kind === 'work') {
        stage(oy, F, 0, 1);
        calendar(60, oy + 80, 'work', MARKS.reduce((s, m) => s + prog(u, m, m + 0.35), 0), 1);
        const mx = 380; chair(mx, F, SA, 1);
        const dx0 = mx + 70 * SA, dx1 = dx0 + 190, dy = F - 88 * SA + 2;
        ctx.fillStyle = '#2c2c32'; rr(dx0, dy, dx1 - dx0, 14, 4); ctx.fill(); ctx.fillRect(dx1 - 26, dy + 14, 12, F - dy - 14); ctx.fillRect(dx0 + 14, dy + 14, 12, F - dy - 14);
        // notebook (tela virada para ele)
        ctx.fillStyle = '#3a3a42'; ctx.fillRect(dx0 + 40, dy - 6, 110, 6); ctx.save(); ctx.translate(dx0 + 150, dy - 6); ctx.rotate(-0.25); ctx.fillStyle = '#d8e4ff'; rr(-8, -86, 10, 86, 3); ctx.fill(); ctx.restore(); glow(dx0 + 130, dy - 50, 130, 'rgba(190,210,255,A)', 0.35);
        const tp = Object.assign({}, P.type); const j = Math.sin(t * 26) * 0.08; tp.arms = [[tp.arms[0][0] + j, tp.arms[0][1]], [tp.arms[1][0] - j, tp.arms[1][1]]];
        const man = Object.assign({ x: mx, y: F, s: SA, dir: 1, t, nod: 0.15 }, tp);
        // criança
        const kx = 880, drop = sm(u, 2.9, 3.4);
        let kp = u < 0.5 ? P.stand : u < 2.6 ? mix(P.stand, P.ask, sm(u, 0.5, 0.9)) : mix(P.ask, P.sad, sm(u, 2.6, 3.2));
        const kid = Object.assign({ x: kx, y: F, s: SK, dir: -1, t, head: 27, nod: -0.55 * sm(u, 2.8, 3.4) }, kp);
        figRefl(man, F); figRefl(kid, F); figure(man); const kh = figure(kid);
        // bola: no braço, cai e rola
        if (drop <= 0) ballAt(kh[0][0] - 4, kh[0][1] - 6);
        else { const rx = kh[0][0] - 4 + sm(u, 3.4, 6.5, x => x) * 300, by = lerp(kh[0][1] - 6, F - 16, Math.min(1, drop)); const bounce = u > 3.4 ? Math.abs(Math.sin((u - 3.4) * 7)) * 24 * Math.exp(-(u - 3.4) * 2) : 0; ballAt(rx, by - bounce); }
        bubble('PAI, BRINCA', 'COMIGO?', 840, oy + 160, prog(u, 0.6, 0.9) * (1 - prog(u, 2.0, 2.2)), false);
        bubble('DOMINGO QUE VEM.', null, 560, oy + 150, prog(u, 2.0, 2.3) * (1 - prog(u, 5.8, 6.1)), true);
      } else {
        stage(oy, F, 0.6, 0);
        calendar(60, oy + 80, 'home', MARKS.reduce((s, m) => s + prog(u, m, m + 0.35), 0), 1);
        const fx = 470, kx = 830;
        const man = Object.assign({ x: fx, y: F, s: SA, dir: 1, t }, P.kneel);
        const cyc = 1.6, ph = ((u + 10) % cyc) / cyc; // vai e volta
        const kid = Object.assign({ x: kx, y: F, s: SK, dir: -1, t, head: 27, bob: -Math.abs(Math.sin(u * 4)) * 6 }, P.catch);
        figRefl(man, F); figRefl(kid, F); const mh = figure(man), kh = figure(kid);
        const A = [(mh[0][0] + mh[1][0]) / 2, (mh[0][1] + mh[1][1]) / 2 - 10], Bp = [(kh[0][0] + kh[1][0]) / 2, (kh[0][1] + kh[1][1]) / 2 - 10];
        const go = ph < 0.5, k = inOut(go ? ph * 2 : (ph - 0.5) * 2), p0 = go ? A : Bp, p1 = go ? Bp : A;
        ballAt(lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k) - Math.sin(k * Math.PI) * 130);
        bubble('DE NOVO, PAI!', null, 830, oy + 170, prog(u, 2.6, 2.9) * (1 - prog(u, 4.6, 4.8)), false);
      }
      ctx.restore();
    }
    // ---------- ato 2 (10 anos depois) ----------
    function act2(v, p, oy, t) {
      const F = oy + FLOOR; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      if (p.kind === 'work') {
        stage(oy, F, 0, 0.6);
        calendar(60, oy + 80, 'work', 5, 1);
        const mx = 420, man = Object.assign({ x: mx, y: F, s: SA, dir: 1, t, nod: 0.35 * sm(v, 3.4, 4.0) }, mix(P.ask, P.old, sm(v, 2.0, 2.6)));
        // filho adulto: fala e vai embora
        const leave = sm(v, 2.9, 4.6, x => x), sx = 800 + leave * 420, turned = v > 2.85;
        const sp = turned ? walk(v * 9) : P.stand;
        const son = Object.assign({ x: sx, y: F, s: SS, dir: turned ? 1 : -1, t, bag: true }, sp);
        figRefl(man, F); figRefl(son, F); figure(man); figure(son);
        bubble('VEM ALMOÇAR', 'DOMINGO?', 470, oy + 130, prog(v, 0.2, 0.5) * (1 - prog(v, 1.6, 1.8)), false);
        bubble('NÃO DÁ, PAI.', 'TRABALHO.', 760, oy + 130, prog(v, 1.6, 1.9) * (1 - prog(v, 3.9, 4.2)), true);
      } else {
        stage(oy, F, 0.9 + 0.1 * Math.sin(t * 2), 0);
        calendar(60, oy + 80, 'home', 5, 1);
        const fx = 450, sx = 800, tx0 = fx + 80, tx1 = sx - 80, ty = F - 92;
        chair(fx, F, SA, 1); chair(sx, F, SS, -1);
        ctx.fillStyle = '#2c2c32'; rr(tx0, ty, tx1 - tx0, 14, 4); ctx.fill(); ctx.fillRect((tx0 + tx1) / 2 - 7, ty + 14, 14, F - ty - 14); ctx.fillRect((tx0 + tx1) / 2 - 50, F - 6, 100, 6);
        for (const cx of [tx0 + 50, tx1 - 50]) { ctx.fillStyle = '#d9d6cf'; rr(cx - 14, ty - 34, 28, 34, 4); ctx.fill(); }
        // vapor
        for (let i = 0; i < 2; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3; ctx.beginPath(); const cx = [tx0 + 50, tx1 - 50][i]; for (let k = 0; k < 10; k++) { const yy = ty - 40 - k * 6; ctx.lineTo(cx + Math.sin(t * 3 + k * 0.7 + i) * 5, yy); } ctx.stroke(); }
        const man = Object.assign({ x: fx, y: F, s: SA, dir: 1, t, nod: -0.12 * Math.max(0, Math.sin((v - 3.0) * 6)) * (v > 3.0 && v < 3.6 ? 1 : 0) }, mix(P.sit, P.type, 0.3));
        const son = Object.assign({ x: sx, y: F, s: SS, dir: -1, t }, mix(P.sit, P.type, 0.3));
        figRefl(man, F); figRefl(son, F); figure(man); figure(son);
        bubble('DOMINGO QUE VEM,', 'DE NOVO?', 760, oy + 130, prog(v, 0.9, 1.2) * (1 - prog(v, 3.2, 3.5)), false);
        bubble('SEMPRE.', null, 470, oy + 150, prog(v, 3.3, 3.6) * (1 - prog(v, 4.6, 4.8)), false);
      }
      ctx.restore();
    }

    // ---------- som ----------
    const T1 = u => A1 + u, T2 = v => A2 + v;
    cue(T1(0), 'typing_on'); cue(T_SKIP - 0.2, 'typing_off');
    cue(T1(0.62), 'pop'); cue(T1(2.02), 'pop_red'); cue(T1(3.35), 'drop');
    for (const m of MARKS) cue(T1(m), 'mark');
    for (let u = 0.8; u < 6.6; u += 0.8) cue(T1(u), 'catch');
    cue(T1(2.62), 'laugh');
    cue(T_SKIP + 0.1, 'whoosh'); cue(T_SKIP + 0.2, 'tickstart'); cue(A2 - 0.1, 'tickstop');
    cue(T2(0.22), 'pop'); cue(T2(1.62), 'pop_red'); cue(T2(2.9), 'steps'); cue(T2(4.3), 'door');
    cue(T2(0.3), 'cups'); cue(T2(0.92), 'pop'); cue(T2(3.32), 'warm');
    cue(T_END + 0.2, 'end');

    function label(s, y, a) { spaced(s, 70, y, 24, { align: 'left', color: MU, a }); }
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const inA2 = t >= A2 - 0.15;
      const fadeIn = sm(t, 0, 0.5), skipDim = sm(t, T_SKIP - 0.2, T_SKIP + 0.2) * (1 - sm(t, A2 - 0.4, A2)), endDim = sm(t, T_END, T_END + 0.6);
      const vis = fadeIn * (1 - skipDim * 0.85) * (1 - endDim * 0.78);
      PAN.forEach(p => { if (inA2) act2(Math.max(0, t - A2), p, p.oy, t); else act1(Math.max(0, t - A1), p, p.oy, t); ga(1); if (vis < 1) { ctx.globalAlpha = 1 - vis; ctx.fillStyle = BG; ctx.fillRect(0, p.oy, W, PH); ctx.globalAlpha = 1; } });
      const la = fadeIn * (1 - skipDim) * (1 - endDim);
      label(inA2 ? 'O FILHO DO PAI SEM DOMINGO' : 'PAI QUE TRABALHA TODO DOMINGO', PAN[0].oy - 26, la);
      label(inA2 ? 'O FILHO DO PAI QUE GUARDOU O DOMINGO' : 'PAI QUE GUARDA O DOMINGO', PAN[1].oy - 26, la);
      if (t < T_SKIP) { serif([['Todo domingo ele dizia:', false]], 540, 150, 56, sm(t, 0.3, 0.9) * (1 - sm(t, T_SKIP - 0.4, T_SKIP)));
        serif([['"domingo que vem."', true, '#ff5a5f']], 540, 228, 60, sm(t, 2.9, 3.4) * (1 - sm(t, T_SKIP - 0.4, T_SKIP))); }
      else if (t < T_END) { serif([['O filho cresceu ', false], ['e aprendeu a resposta.', true]], 540, 185, 50, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END))); }
      if (skipDim > 0) { serif([['10 anos ', false], ['depois', true]], 540, 950, 110, skipDim); spaced('520 DOMINGOS', 540, 1060, 30, { color: RED, a: skipDim }); }
      if (endDim > 0) { serif([['Dá pra ganhar mais dinheiro.', false]], 540, 820, 62, endDim); serif([['Não dá pra ganhar ', false], ['mais domingo.', true, AMB]], 540, 905, 62, sm(t, T_END + 0.5, T_END + 1.1));
        const va = sm(t, T_END + 1.4, T_END + 2.0); ga(va); rr(150, 1010, 780, 150, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"Tudo tem o seu tempo determinado."', true]], 540, 1065, 42, va); spaced('ECLESIASTES 3:1', 540, 1122, 22, { color: AMB, a: va }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
