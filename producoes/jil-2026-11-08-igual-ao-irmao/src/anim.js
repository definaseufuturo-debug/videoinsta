/*
 * "POR QUE VOCÊ NÃO É IGUAL AO SEU IRMÃO?": a cada comparação o filho ENCOLHE ao lado de uma RÉGUA VERMELHA marcada
 * na altura do irmão (6, 10, 16 anos); 30 anos depois ele ainda é pequeno por dentro. Virada: o outro pai quebra a régua,
 * ajoelha, olha o desenho do filho e diz "EU AMO VOCÊ DO SEU JEITO" — e ele volta a crescer. (Sl 139:14)
 * Bonequinhos de palito, 30 s, 9:16, sem narração.
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
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const lin = x => x;

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c';
  const FLOOR = 1390, FS = 1.32;
  const S1 = { a: 0.0, b: 4.35 }, S2 = { a: 4.55, b: 7.75 }, S3 = { a: 7.95, b: 10.95 }, S4 = { a: 11.15, b: 13.75 };
  const T = { show: 0.95, cmp: 1.35, shrink1: 2.3, hl: [14.05, 14.6, 15.15, 15.8], dimA: 13.7, dimB: 16.9, v: 17.0, look: 17.5, snap: 18.05, kneel: 18.6, lindo: 19.15, amo: 20.35, grow: 20.6, hug: 22.2, fin: 24.6 };
  const KIDX = 330, RULX = 430, BROX = 580, DADX = 800;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    const fit = (s, size, max = 960) => Math.min(size, size * max / tw(s, size));
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: cozinha/sala à noite (janela, mesa, luz pendente) ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const wg = g.createLinearGradient(0, 700, 0, FLOOR); wg.addColorStop(0, '#0d0d10'); wg.addColorStop(1, '#16161b'); g.fillStyle = wg; g.fillRect(0, 700, W, FLOOR - 700);
      // janela
      g.strokeStyle = '#2e2e36'; g.lineWidth = 8; g.strokeRect(150, 880, 170, 210); g.beginPath(); g.moveTo(235, 880); g.lineTo(235, 1090); g.moveTo(150, 985); g.lineTo(320, 985); g.stroke();
      let sd = 9; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let i = 0; i < 12; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.4})`; g.beginPath(); g.arc(158 + rnd() * 155, 888 + rnd() * 195, 1 + rnd(), 0, TAU); g.fill(); }
      // luz pendente
      g.strokeStyle = '#2c2c33'; g.lineWidth = 4; g.beginPath(); g.moveTo(820, 700); g.lineTo(820, 960); g.stroke();
      g.fillStyle = '#ffe2a8'; g.beginPath(); g.moveTo(780, 1000); g.lineTo(860, 1000); g.lineTo(840, 960); g.lineTo(800, 960); g.closePath(); g.fill();
      const sp = g.createRadialGradient(820, 1010, 20, 820, 1100, 640); sp.addColorStop(0, 'rgba(255,214,150,0.15)'); sp.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      // mesa ao fundo
      g.fillStyle = '#1d1d23'; g.fillRect(860, 1235, 220, 16); g.fillRect(880, 1251, 12, FLOOR - 1251); g.fillRect(1050, 1251, 12, FLOOR - 1251);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,255,255,0.03)'; g.fillRect(i * 130, FLOOR + 3, 2, 300); }
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function ik(sx, sy, tx, ty, l1, l2, bend) {
      const dx = tx - sx, dy = ty - sy, d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.5), base = Math.atan2(dx, dy);
      const al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), a1 = base + bend * al;
      const ex = sx + Math.sin(a1) * l1, ey = sy + Math.cos(a1) * l1; return [a1, Math.atan2(tx - ex, ty - ey)];
    }
    const shoulder = (o) => { const s = o.s, dir = o.dir || 1, bob = o.bob || 0, lean = o.lean || 0; return [o.x + dir * Math.sin(lean) * 66 * s, o.y + (-158 + bob + 4) * s]; };
    function figure(o) {
      const s = o.s, dir = o.dir || 1, hr = o.hr || 23; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = WHITE; ctx.fillStyle = WHITE; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = 'rgba(255,255,255,0.25)'; ctx.shadowBlur = 10;
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      for (const [a, b] of o.legs) limb(0, hipY, a, b, 48, 46);
      const arms = o.arms.map(a => a.slice());
      if (o.reach) for (const [i, wx, wy, bend] of o.reach) { const lx = (wx - o.x) / (dir * s), ly = (wy - o.y) / s; arms[i] = ik(shX, shY + 4, lx, ly, 40, 38, bend ?? -1); }
      const hands = arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      if (o.cane !== undefined && o.cane !== null) { const [hx0, hy0] = hands[o.cane]; ctx.lineWidth = 10; ctx.strokeStyle = '#d8d8d8'; ctx.shadowBlur = 0; ctx.beginPath(); ctx.moveTo(hx0, hy0 - 6); ctx.lineTo(hx0 + 10, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(hx0 - 9, hy0 - 6, 9, Math.PI, TAU); ctx.stroke(); ctx.strokeStyle = WHITE; ctx.lineWidth = 13; }
      const tilt = o.headTilt || 0, hx = shX + Math.sin(lean + tilt) * (hr + 11), hy = shY - Math.cos(lean + tilt) * (hr + 11);
      ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (o.eyes !== false) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill(); }
      ctx.restore(); ga(1);
      const W2 = ([x, y]) => [o.x + dir * x * s, o.y + y * s];
      return { head: W2([hx, hy]), sh: W2([shX, shY + 4]), hands: hands.map(W2) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const STANDL = [[0.1, 0.06], [-0.1, -0.06]];
    const A_DOWN = [[0.15, 0.2], [-0.1, 0.1]];
    const lerpA = (A, B, k) => A.map((p, i) => p.map((v, j) => lerp(v, B[i][j], k)));

    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 50, w = tw(s, size) + 64, h = size * 1.75; ctx.save(); ctx.translate(x, y); const e = (1 + (1 - k) * 0.3) * (o.scale ?? 1); ctx.scale(e, e); ga(clamp(k * 3) * (o.a ?? 1));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill();
      if (o.think) { const tx = (o.tail || 0) * w * 0.3; for (const [dx, dy, rr] of [[0, h / 2 + 18, 12], [o.tailDir * 18, h / 2 + 46, 8]]) { ctx.beginPath(); ctx.arc(tx + dx, dy, rr, 0, TAU); ctx.fill(); } }
      else { const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill(); }
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 640, 50, { w: 900, sp: 12 }); const w = Math.min(260, tw(s, 50) * 0.4); ctx.fillStyle = RED; ctx.fillRect(540 - w / 2, 686, w, 5); ctx.restore(); ga(1); }

    // ---------- a régua vermelha (a comparação) ----------
    function rulerSeg(cx, cy, len, rot = 0, a = 1) { if (len <= 1) return; ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ga(a);
      const g = ctx.createRadialGradient(0, 0, 4, 0, 0, len * 0.8); g.addColorStop(0, 'rgba(224,38,43,0.22)'); g.addColorStop(1, 'rgba(224,38,43,0)'); ctx.fillStyle = g; ctx.fillRect(-len * 0.8, -len * 0.8, len * 1.6, len * 1.6);
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.roundRect(-11, -len / 2, 22, len, 4); ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(10,10,12,0.8)'; ctx.lineWidth = 3; for (let y = -len / 2 + 10, i = 0; y < len / 2 - 4; y += 14, i++) { ctx.beginPath(); ctx.moveTo(-11, y); ctx.lineTo(i % 5 === 0 ? 4 : -3, y); ctx.stroke(); }
      ctx.restore(); ga(1); }
    // régua em pé no chão + linha tracejada na altura do irmão
    function standRuler(h, k, mark = 1) { if (k <= 0) return; const hh = h * outC(k); rulerSeg(RULX, FLOOR - hh / 2, hh);
      if (mark > 0 && k >= 1) { ctx.save(); ga(0.8 * mark); ctx.strokeStyle = WHITE; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(KIDX - 70, FLOOR - h + 14); ctx.lineTo(RULX + 30, FLOOR - h + 14); ctx.stroke(); ctx.restore(); ga(1); } }

    function paper(x, y, w, h, rot, kind) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = '#f2f2f2'; ctx.shadowColor = 'rgba(255,255,255,0.3)'; ctx.shadowBlur = 8; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0;
      ctx.strokeStyle = '#333'; ctx.fillStyle = '#333'; ctx.lineWidth = Math.max(2, w * 0.04); ctx.lineCap = 'round';
      if (kind === 'draw') { // casinha, sol e dois bonequinhos
        const u = w / 10; ctx.beginPath(); ctx.rect(-3.6 * u, -0.2 * u, 3 * u, 2.6 * u); ctx.moveTo(-4 * u, -0.2 * u); ctx.lineTo(-2.1 * u, -2 * u); ctx.lineTo(-0.2 * u, -0.2 * u); ctx.stroke();
        ctx.beginPath(); ctx.arc(3 * u, -3.4 * u, 1 * u, 0, TAU); ctx.stroke();
        for (const [px, sz] of [[1.4, 1], [3.2, 0.7]]) { ctx.beginPath(); ctx.arc(px * u, (0.6 - sz) * u, 0.45 * sz * u, 0, TAU); ctx.moveTo(px * u, (1.05 - sz) * u + 0.4 * u); ctx.lineTo(px * u, 1.6 * u); ctx.moveTo((px - 0.6) * u, 2.6 * u); ctx.lineTo(px * u, 1.6 * u); ctx.lineTo((px + 0.6) * u, 2.6 * u); ctx.stroke(); }
      } else { ctx.font = `900 ${h * 0.55}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(kind, 0, h * 0.06); ctx.fillRect(-w * 0.35, -h * 0.36, w * 0.7, 3); }
      ctx.restore(); }
    function trophy(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#e8e8e8'; ctx.shadowColor = 'rgba(255,255,255,0.5)'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(-22, -44); ctx.lineTo(22, -44); ctx.quadraticCurveTo(20, -6, 0, -4); ctx.quadraticCurveTo(-20, -6, -22, -44); ctx.fill(); ctx.fillRect(-4, -6, 8, 14); ctx.fillRect(-14, 6, 28, 7); ctx.lineWidth = 5; ctx.strokeStyle = '#e8e8e8'; ctx.beginPath(); ctx.arc(-22, -32, 9, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(22, -32, 9, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke(); ctx.restore(); }
    function medal(x, y) { ctx.save(); ctx.fillStyle = '#e8e8e8'; ctx.shadowColor = 'rgba(255,255,255,0.6)'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(x, y, 15, 0, TAU); ctx.fill(); ctx.restore(); }
    const kneelLegs = [[1.45, 0.05], [0.05, -1.5]];
    const sway = (t, f = 1.3) => Math.sin(t * f) * 0.04;

    // ---------- 6 anos: o desenho e a primeira comparação ----------
    function scene1(t) {
      const walking = t < 0.85, kx = lerp(110, KIDX, sm(t, 0, 0.85, outC)), pose = walking ? walkPose(t * 9, 1) : { legs: STANDL, bob: 0 };
      const ks = lerp(0.62, 0.5, sm(t, T.shrink1, T.shrink1 + 0.6));
      const up = sm(t, T.show - 0.15, T.show + 0.1) * (1 - sm(t, T.shrink1 + 0.1, T.shrink1 + 0.4));
      const sad = sm(t, T.shrink1, T.shrink1 + 0.5);
      const arms = walking ? [[0.9, 1.6], walkArms(t * 9)[1]] : [[lerp(0.9, 2.0, up), lerp(1.6, 2.2, up)], [lerp(0.2, 0.1, sad), 0.1]];
      const f = figure({ x: kx, y: FLOOR, s: ks, hr: 31, dir: 1, lean: 0.05 + sad * 0.15, headTilt: lerp(-0.2, 0.55, sad), legs: pose.legs, bob: pose.bob, arms: sad > 0.5 ? A_DOWN : arms });
      const drop = prog(t, T.shrink1 + 0.15, T.shrink1 + 0.6);
      if (drop <= 0) { const h = f.hands[0]; paper(h[0] + 10, h[1] - 26, 66, 56, -0.08, 'draw'); }
      else paper(lerp(KIDX + 40, KIDX + 70, drop), lerp(FLOOR - 100, FLOOR - 4, drop * drop), 66, 56, lerp(-0.1, 1.45, drop), 'draw');
      // irmão com troféu
      const bf = figure({ x: BROX, y: FLOOR, s: 0.82, hr: 27, dir: 1, lean: 0.02, headTilt: -0.15, legs: STANDL, bob: Math.sin(t * 6) * 2, arms: [[2.6, 3.0], [-0.1, 0.1]] });
      trophy(bf.hands[0][0], bf.hands[0][1] - 4, 0.9);
      // pai: aponta para o irmão
      const pt = sm(t, T.cmp - 0.2, T.cmp);
      figure({ x: DADX, y: FLOOR, s: FS, hr: 23, dir: -1, lean: lerp(0.02, 0.12, pt), headTilt: lerp(0.15, -0.05, pt), legs: STANDL, bob: 0, arms: [[lerp(0.15, 1.65, pt), lerp(0.2, 1.6, pt)], [-0.1, 0.1]] });
      standRuler(176, prog(t, 1.65, 2.05), 1);
      const bk = prog(t, T.cmp, T.cmp + 0.12) * (1 - prog(t, 3.0, 3.15));
      bubble('POR QUE VOCÊ NÃO É', 600, FLOOR - 510, bk, { size: 42, tail: 0.6, tailDir: 1 });
      bubble('IGUAL AO SEU IRMÃO?', 600, FLOOR - 415, bk, { size: 50, tail: 0.6, tailDir: 1 });
    }
    // ---------- 10 anos: o boletim ----------
    function scene2(t) {
      const walking = t < 5.2, kx = lerp(110, KIDX, sm(t, S2.a, 5.2, outC)), pose = walking ? walkPose(t * 8, 0.9) : { legs: STANDL, bob: 0 };
      const ks = lerp(0.5, 0.42, sm(t, 6.15, 6.65)), sad = sm(t, 6.15, 6.6);
      const f = figure({ x: kx, y: FLOOR, s: ks, hr: 30, dir: 1, lean: 0.08 + sad * 0.12, headTilt: lerp(0.0, 0.55, sad), legs: pose.legs, bob: pose.bob, arms: [[lerp(1.9, 0.9, sad), lerp(2.2, 1.6, sad)], [0.15, 0.1]] });
      paper(f.hands[0][0] + 8, f.hands[0][1] - 24, 48, 58, -0.05, '7');
      const bf = figure({ x: BROX, y: FLOOR, s: 1.0, hr: 26, dir: 1, lean: 0.0, headTilt: -0.12, legs: STANDL, bob: Math.sin(t * 6) * 2, arms: [[2.7, 3.0], [-0.1, 0.1]] });
      paper(bf.hands[0][0], bf.hands[0][1] - 30, 54, 64, 0.06, '10');
      const pt = sm(t, 5.1, 5.3);
      figure({ x: DADX, y: FLOOR, s: FS, hr: 23, dir: -1, lean: lerp(0.02, 0.1, pt), headTilt: 0.05, legs: STANDL, bob: 0, arms: [[lerp(0.15, 1.65, pt), lerp(0.2, 1.6, pt)], [-0.1, 0.1]] });
      standRuler(215, 1, 1);
      bubble('SEU IRMÃO TIROU 10.', 600, FLOOR - 470, prog(t, 5.2, 5.35) * (1 - prog(t, 6.15, 6.3)), { size: 46, tail: 0.6, tailDir: 1 });
      bubble('EU SOU MENOS.', 420, FLOOR - 300, prog(t, 6.65, 6.8) * (1 - prog(t, 7.5, 7.7)), { size: 40, color: RED, think: true, tail: -0.2, tailDir: -1 });
    }
    // ---------- 16 anos: a medalha ----------
    function scene3(t) {
      const walking = t < 8.6, kx = lerp(110, KIDX, sm(t, S3.a, 8.6, outC)), pose = walking ? walkPose(t * 7, 0.7) : { legs: STANDL, bob: 0 };
      const ks = lerp(0.42, 0.34, sm(t, 9.45, 9.95)), sad = sm(t, 9.45, 9.9);
      figure({ x: kx, y: FLOOR, s: ks, hr: 28, dir: 1, lean: 0.2 + sad * 0.15, headTilt: lerp(0.2, 0.6, sad), legs: pose.legs, bob: pose.bob, arms: A_DOWN });
      const bf = figure({ x: BROX, y: FLOOR, s: 1.2, hr: 24, dir: 1, lean: -0.02, headTilt: -0.12, legs: STANDL, bob: 0, arms: [[0.5, 0.2], [-0.1, 0.1]] });
      medal(bf.sh[0] + 4, bf.sh[1] + 40);
      const pt = sm(t, 8.6, 8.8);
      figure({ x: DADX, y: FLOOR, s: FS, hr: 23, dir: -1, lean: lerp(0.02, 0.1, pt), headTilt: 0.05, legs: STANDL, bob: 0, arms: [[lerp(0.15, 1.65, pt), lerp(0.2, 1.6, pt)], [-0.1, 0.1]] });
      standRuler(258, 1, 1);
      bubble('SEJA MAIS COMO ELE!', 600, FLOOR - 500, prog(t, 8.7, 8.85) * (1 - prog(t, 9.45, 9.6)), { size: 46, tail: 0.6, tailDir: 1 });
      bubble('NUNCA VOU SER SUFICIENTE.', 470, FLOOR - 330, prog(t, 9.95, 10.1) * (1 - prog(t, 10.75, 10.9)), { size: 34, color: RED, think: true, tail: -0.6, tailDir: -1 });
    }
    // ---------- 30 anos depois: grande por fora, pequeno por dentro ----------
    function scene4(t) {
      const walking = t < 11.85, kx = lerp(110, KIDX, sm(t, S4.a, 11.85, lin)), pose = walking ? walkPose(t * 6, 0.6) : { legs: STANDL, bob: 0 };
      figure({ x: kx, y: FLOOR, s: 0.36, hr: 24, dir: 1, lean: 0.3, headTilt: 0.45, legs: pose.legs, bob: pose.bob, arms: A_DOWN });
      const pt = sm(t, 11.9, 12.1);
      figure({ x: DADX - 120, y: FLOOR, s: FS, hr: 23, dir: -1, lean: 0.03, headTilt: 0.15, legs: STANDL, bob: 0, arms: [[lerp(0.15, 1.3, pt), lerp(0.2, 1.4, pt)], [-0.1, 0.1]] });
      standRuler(284, 1, 1);
      bubble('PARABÉNS! VOCÊ É ÓTIMO!', 600, FLOOR - 470, prog(t, 11.95, 12.1) * (1 - prog(t, 12.7, 12.85)), { size: 40, tail: 0.6, tailDir: 1 });
      bubble('EU? NÃO SOU COMO MEU IRMÃO.', 520, FLOOR - 300, prog(t, 12.85, 13.0) * (1 - prog(t, 13.6, 13.75)), { size: 33, color: RED, tail: -0.6, tailDir: -1 });
    }
    // ---------- virada: o outro pai ----------
    function scene5(t) {
      const ks = lerp(0.42, 0.7, sm(t, T.grow, T.grow + 1.2)), kx = lerp(360, 395, sm(t, T.hug - 0.4, T.hug));
      const kneel = sm(t, T.kneel - 0.2, T.kneel + 0.35);
      const dx = lerp(640, 505, sm(t, T.snap + 0.25, T.kneel + 0.3));
      const dy = FLOOR + 38 * FS * kneel, dlean = lerp(0.02, 0.32, kneel);
      const dlegs = kneel < 0.02 ? STANDL : lerpA(STANDL, kneelLegs, kneel);
      const dsh = shoulder({ x: dx, y: dy, s: FS, dir: -1, lean: dlean });
      const ksh = shoulder({ x: kx, y: FLOOR, s: ks, dir: 1, lean: 0.05 });
      const hugK = sm(t, T.hug - 0.4, T.hug);
      const show = sm(t, T.kneel + 0.2, T.kneel + 0.5) * (1 - hugK);
      const sad = 1 - sm(t, T.lindo, T.grow + 0.6);
      // brilho de quem é visto
      const gk = sm(t, T.grow, T.grow + 1.0); if (gk > 0) { const g = ctx.createRadialGradient(kx, FLOOR - 120, 10, kx, FLOOR - 120, 340); g.addColorStop(0, `rgba(255,236,200,${0.25 * gk})`); g.addColorStop(1, 'rgba(255,236,200,0)'); ctx.fillStyle = g; ctx.fillRect(kx - 360, FLOOR - 480, 720, 640); }
      let karms = [[lerp(0.9, 1.75, show), lerp(1.6, 2.0, show)], [0.15, 0.1]], kreach = null;
      if (hugK > 0) kreach = [[0, dsh[0] - 6, dsh[1] + 30, -1], [1, dsh[0] + 4, dsh[1] + 55, -1]];
      const f = figure({ x: kx, y: FLOOR, s: ks, hr: 30, dir: 1, lean: 0.05 + 0.15 * sad, headTilt: lerp(-0.2, 0.5, sad), legs: STANDL, bob: 0, arms: karms, reach: kreach });
      if (hugK < 0.5) { const h = f.hands[0]; paper(h[0] + 12, h[1] - 28, 66 * Math.max(1, ks / 0.5), 56 * Math.max(1, ks / 0.5), -0.08, 'draw'); }
      // pai: segura a régua, olha, quebra, ajoelha
      const holding = t < T.snap;
      let darms = holding ? [[lerp(0.6, 1.2, sm(t, T.look - 0.2, T.look + 0.2)), lerp(1.2, 2.4, sm(t, T.look - 0.2, T.look + 0.2))], [lerp(0.4, 1.4, sm(t, T.look - 0.1, T.look + 0.3)), lerp(0.8, 2.6, sm(t, T.look - 0.1, T.look + 0.3))]] : lerpA([[1.2, 0.6], [-1.0, -0.6]], [[0.4, 0.4], [0.2, 0.2]], sm(t, T.snap + 0.2, T.snap + 0.6));
      let dreach = null;
      if (t > T.lindo - 0.2) { const k = sm(t, T.lindo - 0.2, T.lindo + 0.2); dreach = [[1, lerp(dsh[0] - 40, ksh[0] + 16, k), lerp(dsh[1] + 70, ksh[1] + 6, k), 1]]; }
      if (hugK > 0) dreach = [[1, ksh[0] + 10, ksh[1] + 4, 1], [0, ksh[0] - 12, ksh[1] + 30, 1]];
      const df = figure({ x: dx, y: dy, s: FS, hr: 23, dir: -1, lean: dlean, headTilt: holding ? lerp(0.1, 0.45, sm(t, T.look - 0.1, T.look + 0.2)) : lerp(0.2, -0.05, kneel), legs: dlegs, bob: 0, arms: darms, reach: dreach });
      if (holding) { const [h0, h1] = df.hands; rulerSeg((h0[0] + h1[0]) / 2, (h0[1] + h1[1]) / 2 - 20, 210, lerp(0, Math.PI / 2, sm(t, T.look - 0.2, T.look + 0.3)) + (t > T.snap - 0.15 ? Math.sin(t * 80) * 0.05 : 0)); }
      else { const u = t - T.snap, cx0 = dx - 60, cy0 = FLOOR - 230; for (const [sg, vx] of [[-1, -260], [1, 200]]) { const x = cx0 + sg * 55 + vx * u, y = Math.min(FLOOR - 10, cy0 - 300 * u + 1500 * u * u); rulerSeg(x, y, 100, Math.PI / 2 + sg * u * 5, 1 - prog(u, 2.2, 3.0)); } }
      bubble('QUE DESENHO LINDO!', 560, FLOOR - 420, prog(t, T.lindo, T.lindo + 0.15) * (1 - prog(t, T.amo - 0.2, T.amo - 0.05)), { size: 46, tail: 0.3, tailDir: 1 });
      bubble('EU AMO VOCÊ', 560, FLOOR - 470, prog(t, T.amo, T.amo + 0.2) * (1 - prog(t, 23.9, 24.2)), { size: 50, tail: 0.3, tailDir: 1 });
      bubble('DO SEU JEITO.', 560, FLOOR - 380, prog(t, T.amo + 0.3, T.amo + 0.5) * (1 - prog(t, 23.9, 24.2)), { size: 50, tail: 0.3, tailDir: 1 });
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    for (let k = 0; k < 3; k++) cue(0.1 + k * 0.25, 'step', { gain: 0.3 });
    cue(T.show, 'paper'); cue(0.3, 'claps', { gain: 0.35 }); cue(T.cmp, 'bubble'); cue(1.65, 'ruler'); cue(T.shrink1, 'shrink'); cue(T.shrink1 + 0.55, 'paper', { gain: 0.6 });
    for (const tt of [S1.b, S2.b, S3.b]) cue(tt - 0.05, 'whoosh');
    for (let k = 0; k < 3; k++) cue(S2.a + 0.1 + k * 0.22, 'step', { gain: 0.3 }); cue(5.2, 'bubble'); cue(5.25, 'ding', { gain: 0.5 }); cue(6.15, 'shrink'); cue(6.65, 'bubble', { gain: 0.6 }); cue(6.9, 'sigh');
    for (let k = 0; k < 3; k++) cue(S3.a + 0.1 + k * 0.22, 'step', { gain: 0.3 }); cue(8.7, 'bubble'); cue(9.45, 'shrink'); cue(9.95, 'bubble', { gain: 0.6 });
    cue(S4.a + 0.1, 'tickstart'); cue(12.6, 'tickstop'); for (let k = 0; k < 3; k++) cue(11.3 + k * 0.22, 'step', { gain: 0.25 }); cue(11.95, 'bubble', { gain: 0.8 }); cue(12.85, 'bubble', { gain: 0.6 }); cue(13.1, 'sigh', { gain: 0.6 });
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(T.v, 'whoosh'); cue(T.snap, 'break'); cue(T.snap + 0.55, 'thud', { gain: 0.4 }); cue(T.kneel, 'thud', { gain: 0.25 }); cue(T.lindo, 'bubble'); cue(T.amo, 'bubble'); cue(T.grow, 'grow'); cue(T.hug, 'hold');
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const z = 1.45 * (1 + 0.06 * sm(t, T.v, 26)), camX = t < T.v ? 560 : lerp(560, 480, sm(t, T.v, T.hug + 1));
      let shk = 0; if (t > T.snap && t < T.snap + 0.3) shk = Math.sin(t * 90) * 8 * (1 - prog(t, T.snap, T.snap + 0.3));
      ctx.save(); ctx.translate(540 + shk, 1520); ctx.scale(z, z); ctx.translate(-camX, -FLOOR); ctx.drawImage(bgc, 0, 0);
      if (t < S1.b + 0.1) scene1(t); else if (t < S2.b + 0.1) scene2(t); else if (t < S3.b + 0.1) scene3(t); else if (t < T.v) scene4(t); else scene5(t);
      ctx.restore();
      for (const e of [S1.b, S2.b, S3.b, T.v]) { const k = prog(t, e - 0.2, e + 0.1) * (1 - prog(t, e + 0.15, e + 0.45)); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[0.3, S1.b - 0.3, '6 ANOS'], [S2.a, S2.b - 0.3, '10 ANOS'], [S3.a, S3.b - 0.3, '16 ANOS'], [S4.a, S4.b - 0.4, '30 ANOS DEPOIS'], [T.v + 0.1, T.hug + 1.5, 'O OUTRO PAI']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      // gancho
      const h1 = prog(t, 0.05, 0.35) * (1 - prog(t, 4.0, 4.3)); if (h1 > 0) { spaced('CADA COMPARAÇÃO', 540, 330, 58, { a: h1, w: 900, sp: 8 }); spaced('DEIXA O SEU FILHO', 540, 420, 58, { a: h1 * prog(t, 0.25, 0.55), w: 900, sp: 8 }); spaced('MENOR.', 540, 520, 70, { a: h1 * prog(t, 0.6, 0.9), w: 900, sp: 12, color: RED }); }
      // HEADLINE
      const dim = prog(t, T.dimA, T.dimA + 0.3) * (1 - prog(t, T.dimB - 0.4, T.dimB)); if (dim > 0) { ga(0.9 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['VOCÊ COMPAROU', WHITE], ['PRA ELE MELHORAR.', WHITE], ['ELE SÓ APRENDEU', WHITE], ['A ENCOLHER.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; const size = fit(s, i === 3 ? 150 : 112); txt(s, 540, 640 + i * 150 + (i >= 2 ? 50 : 0) + (i === 3 ? 20 : 0), size, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); });
        ctx.save(); ga(dim * prog(t, T.hl[3], T.hl[3] + 0.3)); const hh = 170 - 60 * sm(t, T.hl[3], T.hl[3] + 0.9); rulerSeg(540, 1480 - 85, 170); ctx.restore(); ga(1); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.62 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('ELE NÃO NASCEU', 540, 430, fit('ELE NÃO NASCEU', 112), { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('PRA SER CÓPIA.', 540, 570, fit('PRA SER CÓPIA.', 112), { a: prog(t, T.fin + 0.35, T.fin + 0.7), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.35, T.fin + 0.85))) });
        txt('NASCEU PRA SER ELE.', 540, 715, fit('NASCEU PRA SER ELE.', 112), { color: RED, a: prog(t, T.fin + 0.8, T.fin + 1.1), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.8, T.fin + 1.3))), glow: 'rgba(224,38,43,0.55)' });
        spaced('OLHE PRO SEU FILHO, NÃO PRO IRMÃO.', 540, 860, 34, { a: prog(t, 26.6, 27.2), w: 800, sp: 4 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 27.4, 28.0), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
