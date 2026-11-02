/*
 * "PERFEITO × FEITO" (Mindloop: a mente em bonequinhos). Dois bonequinhos precisam atravessar o rio.
 * Um lixa o MESMO primeiro azulejo (vermelho) sem parar ("ainda não tá bom"); o outro assenta azulejos tortos
 * e atravessa. Headline: "O PERFEITO / É SÓ O MEDO / DE ROUPA / BONITA." Virada: o perfeccionista larga a lixa
 * e dá o primeiro passo. Final: "FEITO É MELHOR QUE PERFEITO." 30 s, 9:16, sem narração.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, END = 30;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c';
  const GA = 1090, GB = 1610;                 // chão das duas raias (A em cima, B embaixo)
  const RX0 = 300, RX1 = 880;                 // margens do rio
  const S = 1.12;                             // escala dos bonequinhos
  const AX = 165;                             // x do perfeccionista
  // azulejos do B: centro, rotação, largura, desnível
  const NT = 8, TW = 66;
  const TILES = Array.from({ length: NT }, (_, i) => ({ x: RX0 + 38 + i * 72, rot: [0.16, -0.12, 0.09, -0.18, 0.13, -0.07, 0.19, -0.14][i], w: [62, 70, 58, 72, 64, 60, 70, 66][i], dy: [4, -3, 6, -2, 5, -5, 3, 0][i] }));
  const TB = [1.3, 2.6, 3.9, 5.1, 6.3, 7.5, 8.7, 9.9];      // quando B assenta cada azulejo
  const B_LAND = 15.7, B_SAY = 16.9;
  const A_INSP = [[3.0, 4.6], [6.4, 7.8], [9.4, 10.8]];  // A levanta o azulejo, olha, "ainda não"
  const A_LOOK = 17.9, A_UP = 19.0, A_WALK = 19.6, A_PLACE = 20.4, A_HOP = 20.9, A_T2 = 21.9, A_HOP2 = 22.5;
  const HL = [11.6, 12.15, 13.05, 13.6], HL_OUT = 15.1, FIN = 23.6;
  const DAYS = [[0.9, 'DIA 1'], [3.0, 'DIA 30'], [5.2, 'DIA 90'], [7.4, 'DIA 180'], [9.6, '1 ANO']];

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: duas margens com rio no meio ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(540, 1300, 50, 540, 1300, 1000); sp.addColorStop(0, 'rgba(255,255,255,0.07)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      for (const G of [GA, GB]) {
        const fg = g.createLinearGradient(0, G, 0, G + 170); fg.addColorStop(0, '#2a2a30'); fg.addColorStop(1, '#101013');
        g.fillStyle = fg; g.fillRect(0, G, RX0, 170); g.fillRect(RX1, G, W - RX1, 170);
        g.fillStyle = '#3d3d44'; g.fillRect(0, G, RX0, 3); g.fillRect(RX1, G, W - RX1, 3);
        const wg = g.createLinearGradient(0, G + 18, 0, G + 170); wg.addColorStop(0, '#16202b'); wg.addColorStop(1, '#0b0f14'); g.fillStyle = wg; g.fillRect(RX0, G + 18, RX1 - RX0, 152);
        g.strokeStyle = '#3d3d44'; g.lineWidth = 3; g.beginPath(); g.moveTo(RX0, G); g.lineTo(RX0, G + 170); g.moveTo(RX1, G); g.lineTo(RX1, G + 170); g.stroke();
      }
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();
    function water(G, t) { ctx.save(); ctx.strokeStyle = 'rgba(140,180,220,0.35)'; ctx.lineWidth = 3; for (let r = 0; r < 3; r++) { ctx.beginPath(); for (let x = RX0 + 4; x <= RX1 - 4; x += 8) { const y = G + 22 + r * 34 + Math.sin(x * 0.03 + t * (2.2 + r * 0.5) + r) * 4; x === RX0 + 4 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); }

    // ---------- bonequinho ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s, dir = o.dir || 1, hr = o.hr || 23; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = WHITE; ctx.fillStyle = WHITE; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = 'rgba(255,255,255,0.25)'; ctx.shadowBlur = 10;
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      for (const [a, b] of o.legs) limb(0, hipY, a, b, 48, 46);
      const hands = o.arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const tilt = o.headTilt || 0, hx = shX + Math.sin(lean + tilt) * (hr + 11), hy = shY - Math.cos(lean + tilt) * (hr + 11);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill();
      ctx.restore(); ga(1);
      return { head: [o.x + dir * hx * s, o.y + hy * s], hands: hands.map(([x, y]) => [o.x + dir * x * s, o.y + y * s]) };
    }
    const STAND = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const KNEEL = { legs: [[1.3, 0.0], [0.35, -1.45]], bob: 33 };
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const mixLegs = (P, Q, k) => ({ legs: P.legs.map((l, i) => [lerp(l[0], Q.legs[i][0], k), lerp(l[1], Q.legs[i][1], k)]), bob: lerp(P.bob, Q.bob, k) });

    function tile(x, y, rot, w, col, shine) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const h = 24;
      if (col === RED) { ctx.shadowColor = `rgba(224,38,43,${0.4 + 0.5 * shine})`; ctx.shadowBlur = 14 + 22 * shine; }
      ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(-w / 2, -h, w, h, 4); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = col === RED ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)'; ctx.fillRect(-w / 2 + 4, -h + 3, w - 8, 4);
      if (col !== RED) { ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w / 2 + 12, -h + 6); ctx.lineTo(-w / 2 + 22, -6); ctx.stroke(); }
      ctx.restore(); }
    function sparkle(x, y, k, t) { if (k <= 0) return; ctx.save(); ga(k); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { const ph = t * 6 + i * 2.1, r = 8 + 6 * Math.abs(Math.sin(ph)); const px = x + Math.cos(i * 2.2) * 34, py = y - 16 + Math.sin(i * 1.7) * 18; ctx.beginPath(); ctx.moveTo(px - r, py); ctx.lineTo(px + r, py); ctx.moveTo(px, py - r); ctx.lineTo(px, py + r); ctx.stroke(); } ctx.restore(); ga(1); }
    function bubble(parts, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 44, full = parts.map(p => p[0]).join(''), w = tw(full, size) + 60, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      let cx = -tw(full, size) / 2; for (const [p, col] of parts) { const pw = tw(p, size); txt(p, cx + pw / 2, 3, size, { color: col }); cx += pw; } ctx.restore(); ga(1); }
    function label(s, x, y, k, col) { if (k <= 0) return; spaced(s, x, y, 34, { w: 900, sp: 6, a: k, color: col || WHITE }); }

    // ---------- B: assenta azulejos tortos e atravessa ----------
    const tileY = i => GB + TILES[i].dy * 0.4;          // topo do azulejo i
    function bState(t) {
      // posição: margem (antes do 1º), azulejo k, ou margem oposta
      let x = RX0 - 50, y = GB, hopping = false, hp = 0;
      for (let i = 0; i < NT; i++) { const h0 = TB[i] + 0.2, h1 = TB[i] + 0.55; if (t >= h1) { x = TILES[i].x; y = tileY(i) - 24; } else if (t > h0) { const u = prog(t, h0, h1); const x0 = i ? TILES[i - 1].x : RX0 - 50, y0 = i ? tileY(i - 1) - 24 : GB; x = lerp(x0, TILES[i].x, u); y = lerp(y0, tileY(i) - 24, u) - Math.sin(u * Math.PI) * 40; hopping = true; hp = u; break; } }
      const l0 = B_LAND - 0.45; if (t > l0) { const u = prog(t, l0, B_LAND); x = lerp(TILES[NT - 1].x, RX1 + 75, u); y = lerp(tileY(NT - 1) - 24, GB, u) - Math.sin(u * Math.PI) * 50; hopping = u < 1; hp = u; }
      return { x, y, hopping, hp };
    }
    function drawB(t) {
      const b = bState(t); let arms, lean = 0, legs = STAND, dir = 1, tilt = 0;
      // abaixa para assentar o próximo azulejo
      let reach = 0; for (let i = 0; i < NT; i++) reach = Math.max(reach, sm(t, TB[i] - 0.55, TB[i] - 0.15) * (1 - sm(t, TB[i] - 0.05, TB[i] + 0.2)));
      // balança ao pousar no azulejo torto
      let wob = 0; for (let i = 0; i < NT; i++) { const d = t - (TB[i] + 0.55); if (d > 0 && d < 0.9) wob += Math.sin(d * 16) * Math.exp(-d * 5) * 0.25; }
      if (b.hopping) { arms = [[-1.2, -0.8], [1.2, 1.6]]; legs = { legs: [[0.7, -0.2], [-0.4, -0.5]], bob: 0 }; lean = 0.15; }
      else { arms = [[lerp(0.2, 1.3, reach) + wob, lerp(0.1, 1.6, reach)], [lerp(-0.15, 1.1, reach) - wob, lerp(-0.05, 1.4, reach)]]; lean = 0.55 * reach + wob * 0.4; legs = mixLegs(STAND, { legs: [[0.5, -0.3], [-0.2, 0.1]], bob: 8 }, reach); }
      const land = sm(t, B_LAND, B_LAND + 0.4);
      if (t >= B_LAND) { const turn = t > A_LOOK + 0.6; dir = turn ? -1 : 1; const wave = turn && t > 20.5 ? Math.sin(t * 9) * 0.35 : 0;
        arms = turn ? [[0.15, 0.1], [lerp(-0.1, -2.7, sm(t, 20.3, 20.6)) + wave, lerp(-0.05, -2.9, sm(t, 20.3, 20.6)) + wave]] : [[lerp(0.2, 2.8, land), lerp(0.1, 3.0, land)], [lerp(-0.1, -2.6, land), lerp(-0.05, -2.9, land)]]; lean = 0; legs = STAND; tilt = 0; }
      const r = figure({ x: b.x, y: b.y, s: S, dir, lean, headTilt: tilt + reach * 0.4, arms, ...legs });
      // azulejo na mão antes de assentar
      for (let i = 0; i < NT; i++) if (t > TB[i] - 0.55 && t < TB[i]) { const h = r.hands[0]; tile(h[0] + 10, h[1] + 14, TILES[i].rot * 0.5, TILES[i].w, '#8a8a92', 0); }
      return r;
    }

    // ---------- A: lixa o primeiro azulejo, para sempre ----------
    function drawA(t) {
      const tx = AX + 108; let tX = tx, tY = GA, tRot = 0;
      let insp = 0; for (const [a, z] of A_INSP) insp = Math.max(insp, sm(t, a, a + 0.35) * (1 - sm(t, z - 0.35, z)));
      const stop = sm(t, A_LOOK - 0.3, A_LOOK);           // para de lixar
      const look = sm(t, A_LOOK, A_LOOK + 0.5);
      const up = sm(t, A_UP, A_UP + 0.6);
      const sand = (1 - insp) * (1 - stop) * Math.sin(t * 13) * 0.32;
      let x = AX, lean = lerp(0.62, 0.15, insp), arms, legs = KNEEL, tilt = lerp(0.35, -0.1, insp);
      const shake = insp > 0.8 ? Math.sin(t * 18) * 0.12 : 0;
      arms = [[lerp(1.0 + sand, 1.75, insp), lerp(1.75 + sand, 1.95, insp)], [lerp(1.05 + sand * 0.6, 1.7, insp), lerp(1.7 + sand * 0.6, 1.9, insp)]];
      if (stop > 0) { arms = arms.map(([u, l]) => [lerp(u, 0.75, stop), lerp(l, 1.5, stop)]); lean = lerp(lean, 0.25, look); tilt = lerp(tilt, -0.45, look); }
      if (up > 0) { legs = mixLegs(KNEEL, STAND, up); lean = lerp(lean, 0.1, up); tilt = lerp(tilt, 0, up); arms = [[lerp(0.75, 1.1, up), lerp(1.5, 1.2, up)], [lerp(0.75, 0.9, up), lerp(1.5, 1.1, up)]]; }
      // anda até a beira e assenta o azulejo vermelho no rio; depois um cinza
      let walking = false, hop = 0, place = 0;
      if (t > A_WALK) { const u = sm(t, A_WALK, A_PLACE - 0.3); x = lerp(AX, RX0 - 55, u); walking = u > 0 && u < 1; }
      place = sm(t, A_PLACE - 0.3, A_PLACE) * (1 - sm(t, A_PLACE + 0.05, A_PLACE + 0.3));
      const p2 = sm(t, A_T2 - 0.35, A_T2) * (1 - sm(t, A_T2 + 0.05, A_T2 + 0.3));
      let y = GA;
      if (t > A_HOP) { const u = prog(t, A_HOP, A_HOP + 0.4); x = lerp(RX0 - 55, TILES[0].x, u); y = lerp(GA, GA - 24, u) - Math.sin(u * Math.PI) * 40; hop = u < 1 ? 1 : 0; }
      if (t > A_HOP2) { const u = prog(t, A_HOP2, A_HOP2 + 0.4); x = lerp(TILES[0].x, TILES[1].x, u); y = GA - 24 - Math.sin(u * Math.PI) * 40 + u * 2; hop = u < 1 ? 1 : 0; }
      if (walking) { const ph = t * 8; legs = walkPose(ph); arms = [[1.1, 1.2], [0.9, 1.1]]; }
      const pl = Math.max(place, p2); if (pl > 0) { lean = 0.55 * pl; arms = [[lerp(1.1, 1.3, pl), lerp(1.2, 1.6, pl)], [lerp(0.9, 1.1, pl), lerp(1.1, 1.4, pl)]]; legs = mixLegs(STAND, { legs: [[0.5, -0.3], [-0.2, 0.1]], bob: 8 }, pl); }
      if (hop) { arms = [[-1.2, -0.8], [1.2, 1.6]]; legs = { legs: [[0.7, -0.2], [-0.4, -0.5]], bob: 0 }; }
      if (t > A_HOP + 0.4 && !hop && p2 === 0) { const ch = sm(t, A_HOP2 + 0.45, A_HOP2 + 0.8); arms = [[lerp(0.3, 2.6, ch), lerp(0.2, 2.9, ch)], [lerp(-0.1, -2.4, ch), lerp(-0.05, -2.8, ch)]]; lean = 0.05; }
      const r = figure({ x, y, s: S, lean, headTilt: tilt + shake, arms, ...legs });
      // o azulejo vermelho: no chão (lixando), levantado (inspecionando), na mão (andando), no rio
      const shine = 0.5 + 0.5 * Math.sin(t * 7);
      const hx = (r.hands[0][0] + r.hands[1][0]) / 2, hy = (r.hands[0][1] + r.hands[1][1]) / 2;
      if (t < A_UP) { if (insp > 0.05) { tX = lerp(tx, hx, insp); tY = lerp(GA, hy + 16, insp); tRot = 0; } }
      else if (t < A_PLACE) { tX = hx + 8; tY = hy + 16; }
      else { tX = TILES[0].x; tY = GA + 2; tRot = 0.04; }
      tile(tX, tY, tRot, TW, RED, t < A_LOOK ? shine : 0.2);
      if (t < A_LOOK && insp < 0.1) sparkle(tX, tY, 0.7, t);
      if (t > A_T2 - 0.35 && t < A_T2) { tile(hx + 8, hy + 16, 0.2, 64, '#8a8a92', 0); }
      if (t >= A_T2) tile(TILES[1].x, GA + 4, -0.13, 64, '#8a8a92', 0);
      // lixa na mão enquanto lixa
      if (t < A_LOOK && insp < 0.3) { const h = r.hands[0]; ctx.save(); ctx.fillStyle = '#b9b9c0'; ctx.translate(h[0], h[1] + 4); ctx.fillRect(-18, -8, 36, 14); ctx.restore(); }
      return r;
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    TB.forEach((t, i) => { cue(t, 'block', { n: i }); cue(t + 0.55, 'tick', { n: i }); });
    cue(B_LAND, 'flag'); A_INSP.forEach(([a]) => cue(a + 0.5, 'bubble')); cue(B_SAY, 'bubble');
    cue(A_LOOK + 0.3, 'shock'); cue(A_PLACE, 'block', { n: 0 }); cue(A_HOP + 0.4, 'tick', { n: 0 }); cue(A_T2, 'block', { n: 1 }); cue(A_HOP2 + 0.4, 'tick', { n: 1 });
    HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 })); cue(FIN, 'final');
    // lixa (raspar) enquanto lixa
    const sandOn = []; let a0 = 0.3; for (const [a, z] of A_INSP) { sandOn.push([a0, a]); a0 = z; } sandOn.push([a0, Math.min(A_LOOK - 0.3, 11.2)]); sandOn.push([15.2, A_LOOK - 0.3]);
    sandOn.forEach(([a, z]) => cue(a, 'sand', { dur: +(z - a).toFixed(3) }));

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const Z = 1.15, ZC = 1350, zy = y => (y - ZC) * Z + ZC; ctx.save(); ctx.translate(540, ZC); ctx.scale(Z, Z); ctx.translate(-540, -ZC); ctx.drawImage(bgc, 0, 0);
      water(GA, t); water(GB, t + 1.3);
      // azulejos já assentados de B
      for (let i = 0; i < NT; i++) { if (t < TB[i]) continue; const pop = outBack(prog(t, TB[i], TB[i] + 0.2)); const T = TILES[i]; ctx.save(); ctx.translate(T.x, tileY(i)); ctx.scale(1, pop); ctx.translate(-T.x, -tileY(i)); tile(T.x, tileY(i), T.rot, T.w, '#8a8a92', 0); ctx.restore(); }
      // luz sobre quem chega / quem percebe
      const lb = prog(t, B_LAND, B_LAND + 0.6); if (lb > 0) { const g = ctx.createRadialGradient(RX1 + 75, GB - 150, 20, RX1 + 75, GB - 150, 330); g.addColorStop(0, `rgba(255,240,220,${0.2 * lb})`); g.addColorStop(1, 'rgba(255,240,220,0)'); ctx.fillStyle = g; ctx.fillRect(RX1 - 300, GB - 500, 700, 700); }
      const la = prog(t, A_LOOK, A_LOOK + 0.8); if (la > 0) { const g = ctx.createRadialGradient(AX + 60, GA - 150, 20, AX + 60, GA - 150, 330); g.addColorStop(0, `rgba(255,240,220,${0.2 * la})`); g.addColorStop(1, 'rgba(255,240,220,0)'); ctx.fillStyle = g; ctx.fillRect(AX - 300, GA - 500, 750, 700); }
      const ra = drawA(t); drawB(t);
      // "!" quando A percebe
      const ek = sm(t, A_LOOK + 0.25, A_LOOK + 0.5, outBack); if (ek > 0 && t < A_UP + 0.4) txt('!', ra.head[0] + 6, ra.head[1] - 110, 100, { color: RED, scale: ek });
      // falas
      A_INSP.forEach(([a, z], i) => { const k = prog(t, a + 0.45, a + 0.6) * (1 - prog(t, z - 0.2, z)); bubble([['AINDA NÃO', RED], [' TÁ BOM.', '#222']], 395, 830, k, { tail: -0.7, tailDir: -1 }); });
      const bt = bState(t); bubble([['TORTO', RED], [', MAS CHEGUEI.', '#222']], 700, 1280, prog(t, B_SAY, B_SAY + 0.15) * (1 - prog(t, A_LOOK + 0.9, A_LOOK + 1.1)), { size: 42, tail: 0.75, tailDir: 1 });
      ctx.restore();
      // rótulos das raias
      const lk = prog(t, 0.5, 0.9) * (1 - prog(t, 11.0, 11.3)) + prog(t, 15.3, 15.6) * (1 - prog(t, FIN - 0.3, FIN));
      label('PERFEITO', 134, zy(GA + 90), lk, RED); label('FEITO', 134, zy(GB + 90), lk);
      // contador de dias
      let dk = ''; for (const [a, s] of DAYS) if (t >= a) dk = s; const dlast = DAYS.filter(([a]) => t >= a).pop();
      const dchip = prog(t, 0.9, 1.2) * (1 - prog(t, 11.0, 11.3));
      if (dchip > 0 && dk) { const pp = 1 + 0.1 * Math.exp(-(t - dlast[0]) * 8); spaced(dk, 540, 600, 52 * pp, { w: 900, sp: 10, a: dchip }); ga(dchip); ctx.fillStyle = RED; ctx.fillRect(470, 648, 140, 5); ga(1); }
      // gancho
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 10.9, 11.3)); if (h1 > 0) { spaced('OS DOIS PRECISAVAM', 540, 340, 56, { a: h1, w: 900, sp: 10 }); spaced('ATRAVESSAR O RIO', 540, 430, 56, { a: h1 * prog(t, 0.6, 1.0), w: 900, sp: 10, color: RED }); }
      const h3 = prog(t, A_HOP + 0.2, A_HOP + 0.6) * (1 - prog(t, FIN - 0.4, FIN)); if (h3 > 0) { spaced('O PRIMEIRO PASSO', 540, 360, 56, { a: h3, w: 900, sp: 10 }); spaced('NUNCA É BONITO', 540, 450, 56, { a: h3 * prog(t, A_HOP + 0.6, A_HOP + 1.0), w: 900, sp: 10, color: RED }); }
      // HEADLINE
      const dim = prog(t, 11.2, 11.6) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ga(0.86 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['O PERFEITO', WHITE, 120], ['É SÓ O MEDO', WHITE, 112], ['DE ROUPA', WHITE, 120], ['BONITA.', RED, 140]];
        L.forEach(([s, col, sz], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; txt(s, 540, 640 + i * 150 + (i >= 2 ? 60 : 0), sz, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // final
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.84 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('FEITO', 540, 470, 170, { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))) });
        spaced('É MELHOR QUE', 540, 610, 64, { a: prog(t, FIN + 0.35, FIN + 0.7), w: 900, sp: 12 });
        txt('PERFEITO.', 540, 750, 150, { color: RED, a: prog(t, FIN + 0.7, FIN + 1.0), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.7, FIN + 1.2))), glow: 'rgba(224,38,43,0.55)' });
        spaced('TORTO, MAS DO OUTRO LADO.', 540, 900, 38, { a: prog(t, 25.4, 26.0), w: 800, sp: 7 });
        spaced('MARCA QUEM É PERFECCIONISTA', 540, 1730, 38, { a: prog(t, 26.4, 27.0), w: 900, sp: 7, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
