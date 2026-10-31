/*
 * "O ABRAÇO": o pai pega o filho no colo aos 2, 5 e 8 anos; aos 11 o filho passa direto.
 * Headline: "NINGUÉM TE AVISA QUAL FOI A ÚLTIMA VEZ." 30 anos depois, o pai velho de bengala
 * e o filho adulto: agora é o filho que segura o pai. Bonequinhos de palito, 30 s, 9:16, sem narração.
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
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));

  const WHITE = '#efefef', GREY = '#a9a9b0', RED = '#e0262b', BG = '#0a0a0c';
  const FLOOR = 1350, PX = 430, DOOR = 905;
  // cenas: [entra, chega, levanta, solta/fim]
  const A = { in: 0.6, at: 1.7, up: 2.0, top: 2.5, down: 4.0, out: 4.5 };      // 2 anos
  const B = { in: 4.6, at: 5.7, up: 6.0, top: 6.6, down: 8.0, out: 8.5 };      // 5 anos
  const C = { in: 8.6, at: 9.6, up: 9.9, top: 10.5, bub: 10.6, down: 11.4, out: 12.0 }; // 8 anos
  const D = { in: 12.2, at: 13.0, bub: 13.3, turn: 14.0, out: 15.0 };          // 11 anos
  const HL = [15.6, 16.15, 17.05, 17.6], HL_OUT = 19.0;
  const E = { in: 19.2, at: 20.6, open: 20.8, hug: 21.4, heart: 21.7, lift: 22.6, end: 25.0 }; // 30 anos depois
  const FIN = 25.0;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: sala escura, sofá, porta ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(520, 1150, 50, 520, 1150, 900); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 260); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 260); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3; const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.stroke(); };
      rr(60, 1150, 60, 200, 18); rr(80, 1262, 230, 88, 16); rr(80, 1190, 50, 160, 14);
      g.strokeStyle = '#4a4a52'; g.lineWidth = 6; g.strokeRect(DOOR, 1010, 150, FLOOR - 1010); g.fillStyle = '#141418'; g.fillRect(DOOR + 3, 1013, 144, FLOOR - 1016);
      g.fillStyle = '#5a5a62'; g.beginPath(); g.arc(DOOR + 22, 1190, 6, 0, TAU); g.fill();
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s, dir = o.dir || 1, hr = o.hr || 23, col = o.col || WHITE; ctx.save(); ctx.translate(o.x, o.y); if (o.rot) ctx.rotate(o.rot); ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = 'rgba(255,255,255,0.22)'; ctx.shadowBlur = 10;
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      for (const [a, b] of o.legs) limb(0, hipY, a, b, 48, 46);
      const hands = o.arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const tilt = o.headTilt || 0, hx = shX + Math.sin(lean + tilt) * (hr + 11), hy = shY - Math.cos(lean + tilt) * (hr + 11);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (o.eyes !== false) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; if (o.closed) { ctx.strokeStyle = BG; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 4, 0.2, Math.PI - 0.2); ctx.moveTo(hx + hr * 0.72 + 4, ey); ctx.arc(hx + hr * 0.72, ey, 4, 0.2, Math.PI - 0.2); ctx.stroke(); }
        else { ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill(); } }
      if (o.smile) { ctx.strokeStyle = BG; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx + hr * 0.55, hy + 5, 7, 0.3, Math.PI - 0.3); ctx.stroke(); }
      if (o.cane) { ctx.strokeStyle = '#8a7a66'; ctx.lineWidth = 8; const [hx2, hy2] = hands[0]; ctx.beginPath(); ctx.moveTo(hx2, hy2); ctx.lineTo(hx2 + 6, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(hx2 - 8, hy2, 9, Math.PI, TAU); ctx.stroke(); }
      ctx.restore(); ga(1);
      const rx = (x, y) => [o.x + dir * x * s, o.y + y * s];
      return { head: rx(hx, hy), hands: hands.map(([x, y]) => rx(x, y)), chest: rx(shX * 0.7, (shY + hipY) / 2 - 10) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const STAND = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    function heart(x, y, sz, a = 1) { if (sz <= 0.01 || a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(sz, sz); ga(a); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(0, 18); ctx.bezierCurveTo(-40, -8, -22, -40, 0, -20); ctx.bezierCurveTo(22, -40, 40, -8, 0, 18); ctx.fill(); ctx.restore(); ga(1); }
    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 50, w = tw(s, size) + 64, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 620, 48, { w: 900, sp: 12 }); ctx.fillStyle = RED; ctx.fillRect(465, 664, 150, 5); ctx.restore(); ga(1); }

    // pai que pega no colo: devolve a posição das mãos
    function dad(t, o) { // o: {lift 0..1 (até onde), up, top, down, out, chest:true (só no peito), strain, sway}
      const s = 1.2, up = sm(t, o.up, o.top), dn = sm(t, o.down, o.down + 0.4), k = up * (1 - dn);
      const hi = o.chest ? [1.7, 1.95] : [2.75, 2.95], lo = [0.25, 0.15];
      const bend = (sm(t, o.up - 0.3, o.up) * (1 - sm(t, o.up, o.up + 0.3)) + sm(t, o.down, o.down + 0.2) * (1 - sm(t, o.down + 0.2, o.down + 0.5))) * 0.55;
      const sway = o.sway ? Math.sin((t - o.top) * 5) * 0.12 * k : 0;
      const arms = [[lerp(lo[0], hi[0], k) + sway, lerp(lo[1], hi[1], k) + sway], [lerp(lo[0] - 0.1, hi[0] - 0.12, k) + sway, lerp(lo[1] - 0.1, hi[1] - 0.12, k) + sway]];
      const r = figure({ x: PX, y: FLOOR, s, lean: bend - (o.strain || 0) * k * 0.15 + sway * 0.5, headTilt: o.chest ? 0.2 * k : -0.35 * k, smile: k > 0.5 && !o.strain, arms, ...STAND, legs: [[0.16 + bend * 0.3, 0.02], [-0.16, -0.08]] });
      return { k, hands: r.hands, h: [(r.hands[0][0] + r.hands[1][0]) / 2, (r.hands[0][1] + r.hands[1][1]) / 2] };
    }
    // filho: anda até o pai, é levantado (segue as mãos) e volta ao chão
    function kidLifted(t, c, s, hr, d, opts = {}) {
      if (t < c.in || t > c.out + 0.4) return;
      const ph = t * 9, ax = PX + 70;
      let x, y = FLOOR, rot = 0, pose;
      if (t < c.at) { x = lerp(DOOR + 30, ax, sm(t, c.in, c.at, z => z)); pose = { dir: -1, lean: 0.15, arms: walkArms(ph, 1.2), ...walkPose(ph, 1.3) }; }
      else if (d.k > 0.02) { const [hx, hy] = d.h; x = hx + 6; y = hy + (92 * s) * 0.85; rot = opts.sway ? Math.sin((t - c.top) * 5) * 0.15 : 0; pose = { dir: -1, lean: -0.1, arms: [[-2.5, -2.7], [-2.3, -2.6]], legs: [[0.35 + Math.sin(t * 8) * 0.25, 0.1], [-0.15 - Math.sin(t * 8) * 0.25, -0.3]], bob: 0, smile: true }; }
      else if (t < c.down) { x = ax; pose = { dir: -1, lean: 0, arms: [[-2.6, -2.8], [-2.4, -2.7]], ...STAND, smile: true }; }
      else { x = lerp(ax, DOOR + 40, sm(t, c.down + 0.45, c.out + 0.4, z => z)); pose = { dir: 1, lean: 0.12, arms: walkArms(ph), ...walkPose(ph, 1.2) }; }
      figure({ x, y, s, hr, rot, ...pose });
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    for (const c of [A, B, C]) { cue(c.top, 'whee', { gain: c === A ? 1 : c === B ? 0.75 : 0.5 }); cue(c.top + 0.1, 'heart', { gain: c === A ? 1 : c === B ? 0.7 : 0.4 }); }
    cue(C.bub, 'bubble'); cue(D.bub, 'bubble'); cue(D.turn, 'step');
    HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(E.hug, 'hit', { soft: true }); cue(E.heart, 'heartbig'); cue(FIN, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const z = 1.12 * (1 + 0.05 * sm(t, E.in, 26)); ctx.save(); ctx.translate(540, 1330); ctx.scale(z, z); ctx.translate(-590, -1250); ctx.drawImage(bgc, 0, 0);
      if (t < E.in - 0.3) {
        // pai jovem e as fases do filho
        let d;
        if (t < A.out) { d = dad(t, { ...A, sway: true }); kidLifted(t, A, 0.55, 30, d, { sway: true }); heart(d.h[0] + 10, d.h[1] - 150, outBack(prog(t, A.top, A.top + 0.4)) * 1.4, 1 - prog(t, A.down, A.down + 0.4)); }
        else if (t < B.out) { d = dad(t, { ...B, sway: true }); kidLifted(t, B, 0.7, 28, d, { sway: true }); heart(d.h[0] + 10, d.h[1] - 170, outBack(prog(t, B.top, B.top + 0.4)) * 1.1, 1 - prog(t, B.down, B.down + 0.4)); }
        else if (t < C.out) { d = dad(t, { ...C, chest: true, strain: 1 }); kidLifted(t, C, 0.84, 27, d); heart(d.h[0] + 10, d.h[1] - 200, outBack(prog(t, C.top, C.top + 0.4)) * 0.7, 1 - prog(t, C.down, C.down + 0.3)); }
        else {
          // 11 anos: o pai abre os braços, o filho passa direto
          const open = sm(t, D.in + 0.3, D.at), drop = sm(t, D.turn + 0.3, D.out);
          figure({ x: PX, y: FLOOR, s: 1.2, lean: drop * 0.12, headTilt: drop * 0.55, arms: [[lerp(0.25, 1.35, open) - drop * 1.1, lerp(0.15, 1.15, open) - drop * 1.0], [lerp(0.15, 1.15, open) - drop * 1.0, lerp(0.05, 0.95, open) - drop * 0.9]], ...STAND });
          if (t > D.in && t < D.out + 0.6) { const s = 0.98, ph = t * 7; let x, dir, walking;
            if (t < D.at) { x = lerp(DOOR + 30, 640, sm(t, D.in, D.at, z => z)); dir = -1; walking = true; } else if (t < D.turn) { x = 640; dir = -1; walking = false; } else { x = lerp(640, DOOR + 60, prog(t, D.turn, D.out + 0.5)); dir = 1; walking = true; }
            figure({ x, y: FLOOR, s, hr: 26, dir, lean: walking ? 0.1 : 0, arms: walking ? walkArms(ph) : [[-0.2, 0.1], [0.3, -2.2]], ...(walking ? walkPose(ph) : STAND) }); }
        }
      } else {
        // 30 anos depois: pai velho de bengala, filho adulto
        const sIn = sm(t, E.in - 0.3, E.in + 0.4); ga(sIn);
        const open = sm(t, E.open, E.hug), hug = sm(t, E.hug, E.hug + 0.4), lift = sm(t, E.lift, E.lift + 0.6) * (1 - sm(t, E.end - 0.6, E.end));
        const sx = t < E.at ? lerp(DOOR + 30, PX + 120, sm(t, E.in, E.at, z => z)) : lerp(PX + 125, PX + 104, hug), ph = t * 6;
        const oldY = FLOOR - lift * 26;
        figure({ x: PX - hug * 6, y: oldY, s: 1.08, col: GREY, lean: 0.32 - hug * 0.2, headTilt: 0.15 - hug * 0.3, closed: hug > 0.5, arms: hug > 0 ? [[lerp(0.6, 1.75, hug), lerp(-0.1, 2.25, hug)], [lerp(0.4, 1.6, hug), lerp(0.2, 2.15, hug)]] : [[0.6, -0.1], [lerp(0.3, 1.3, open), lerp(0.2, 1.0, open)]], cane: hug < 0.4, legs: [[0.18, 0.12], [-0.12, -0.02]], bob: 0 });
        if (hug >= 0.4) { ctx.save(); ga(1 - prog(hug, 0.4, 0.8)); ctx.strokeStyle = '#8a7a66'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(PX + 60, FLOOR - 95); ctx.lineTo(PX + 90, FLOOR); ctx.stroke(); ctx.restore(); ga(sIn); }
        if (t > E.in) figure({ x: sx, y: FLOOR, s: 1.3, dir: -1, lean: t < E.at ? 0.1 : -0.05 + hug * 0.18, closed: hug > 0.5, arms: t < E.at ? walkArms(ph) : [[lerp(0.3, 1.8, Math.max(open, hug)) + lift * 0.1, lerp(0.2, 2.3, Math.max(open, hug))], [lerp(0.2, 1.65, Math.max(open, hug)), lerp(0.1, 2.2, Math.max(open, hug))]], ...(t < E.at ? walkPose(ph) : { legs: [[0.22 + lift * 0.1, 0.05], [-0.2, -0.1]], bob: 0 }) });
        ga(1);
        const hk = outBack(prog(t, E.heart, E.heart + 0.5)); heart(PX + 46, FLOOR - 330 - Math.sin(t * 2) * 6, hk * (1.6 + 0.12 * Math.sin(t * 6)), 1);
      }
      ctx.restore();
      // falas
      bubble('TÁ PESADO, HEIN?', PX + 40, 900, prog(t, C.bub - 0.05, C.bub + 0.15) * (1 - prog(t, C.out - 0.4, C.out - 0.2)), { size: 44, tail: -0.5, tailDir: -1 });
      bubble('AH, PAI... AGORA NÃO.', 700, 940, prog(t, D.bub - 0.05, D.bub + 0.15) * (1 - prog(t, D.turn + 0.5, D.turn + 0.7)), { size: 42, tail: 0.5, tailDir: 1 });
      // idades
      const ag = [[0.4, A.out - 0.3, '2 ANOS'], [B.in - 0.1, B.out - 0.3, '5 ANOS'], [C.in - 0.1, C.out - 0.3, '8 ANOS'], [D.in - 0.1, 15.2, '11 ANOS'], [E.in, FIN - 0.3, '30 ANOS DEPOIS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.4) * (1 - prog(t, b, b + 0.3)));
      // gancho
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 7.4, 7.8)); if (h1 > 0) { spaced('UM DIA VOCÊ VAI', 540, 330, 56, { a: h1, w: 900, sp: 10 }); spaced('PEGAR SEU FILHO NO COLO', 540, 410, 50, { a: h1 * prog(t, 0.6, 1.0), w: 900, sp: 8 }); spaced('PELA ÚLTIMA VEZ', 540, 490, 56, { a: h1 * prog(t, 1.4, 1.8), w: 900, sp: 10, color: RED }); }
      // HEADLINE
      const dim = prog(t, 15.2, 15.6) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ga(0.84 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['NINGUÉM', WHITE], ['TE AVISA', WHITE], ['QUAL FOI', WHITE], ['A ÚLTIMA VEZ.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; txt(s, 540, 640 + i * 150 + (i >= 2 ? 60 : 0), i === 3 ? 112 : 128, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // cena final
      const h3 = prog(t, E.lift - 0.2, E.lift + 0.3) * (1 - prog(t, FIN - 0.3, FIN)); if (h3 > 0) { spaced('AGORA É ELE', 540, 360, 58, { a: h3, w: 900, sp: 12 }); spaced('QUE TE SEGURA', 540, 445, 58, { a: h3 * prog(t, E.lift + 0.3, E.lift + 0.7), w: 900, sp: 12, color: RED }); }
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.62 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('ABRACE', 540, 480, 150, { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))) });
        txt('HOJE.', 540, 640, 170, { color: RED, a: prog(t, FIN + 0.35, FIN + 0.7), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.35, FIN + 0.85))), glow: 'rgba(224,38,43,0.55)' });
        spaced('ENQUANTO ELE AINDA CABE NO SEU COLO', 540, 790, 32, { a: prog(t, 26.2, 26.8), w: 800, sp: 5 });
        spaced('MARCA QUEM VOCÊ VAI ABRAÇAR HOJE', 540, 1700, 36, { a: prog(t, 27.2, 27.8), w: 900, sp: 7, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
