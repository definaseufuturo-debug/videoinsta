/*
 * "A FRASE QUE FICOU": aos 6 anos o filho derruba o copo e o pai grita "VOCÊ NÃO SERVE PRA NADA!". A frase vira uma
 * PEDRA VERMELHA que o filho carrega aos 12 (não levanta a mão), aos 25 (recusa a vaga) e 30 anos depois o pai nem lembra.
 * Virada: o pai, velho, põe a mão no ombro dele: "ME PERDOA. EU ACREDITO EM VOCÊ." e a pedra racha e cai. (Ef 6:4)
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
  const T = { cup: 0.9, cupHit: 1.2, grito: 1.45, stone: 2.7, land: 3.15, dadOut: 3.35,
    hl: [14.05, 14.6, 15.15, 15.8], dimA: 13.7, dimB: 16.9, v: 17.0, look: 17.3, walk: 17.6, arrive: 18.5, perdoa: 18.65, acredito: 19.6, crack: 20.2, brk: 20.75, up: 20.9, hug: 22.0, fin: 24.6 };
  const DADX = 700, KIDX = 450, OLDX = 730;

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

    // ---------- a pedra vermelha ----------
    const SHAPE = (() => { let sd = 77; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; return Array.from({ length: 11 }, (_, i) => [i / 11 * TAU, 0.82 + r() * 0.28]); })();
    function stone(x, y, r, o = {}) { if (r <= 0.5) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ga(o.a ?? 1);
      const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 2.2); g.addColorStop(0, 'rgba(224,38,43,0.35)'); g.addColorStop(1, 'rgba(224,38,43,0)'); ctx.fillStyle = g; ctx.fillRect(-r * 2.2, -r * 2.2, r * 4.4, r * 4.4);
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 18; ctx.beginPath(); SHAPE.forEach(([a, k], i) => { const px = Math.cos(a) * r * k, py = Math.sin(a) * r * k * 0.86; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.32, r * 0.16, -0.5, 0, TAU); ctx.fill();
      if (o.crack > 0) { ctx.strokeStyle = '#0a0a0c'; ctx.lineWidth = Math.max(3, r * 0.06); ctx.lineCap = 'round'; const k = o.crack; ctx.beginPath(); ctx.moveTo(0, -r * 0.8); ctx.lineTo(r * 0.12, -r * 0.8 + r * 0.6 * k); ctx.lineTo(-r * 0.1, -r * 0.2 + r * 0.5 * k); ctx.lineTo(r * 0.15, r * 0.3 + r * 0.45 * k); ctx.moveTo(-r * 0.1, -r * 0.1); ctx.lineTo(-r * 0.1 - r * 0.5 * k, r * 0.1 * k); ctx.stroke(); }
      ctx.restore(); ga(1); }
    const CHUNKS = (() => { let sd = 31; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; return Array.from({ length: 9 }, () => ({ dx: (r() - 0.5) * 1.4, dy: (r() - 0.5) * 1.0, vx: (r() - 0.5) * 260, vy: -r() * 260, sz: 0.18 + r() * 0.2, rot: r() * 6 })); })();
    function chunks(cx, cy, r, u) { for (const c of CHUNKS) { const x = cx + c.dx * r + c.vx * u, y = Math.min(FLOOR - c.sz * r * 0.5, cy + c.dy * r + c.vy * u + 1400 * u * u); stone(x, y, c.sz * r, { rot: c.rot + u * 4, a: 1 - prog(u, 1.4, 2.2) }); } }

    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 50, w = tw(s, size) + 64, h = size * 1.75; ctx.save(); ctx.translate(x, y); const e = (1 + (1 - k) * 0.3) * (o.scale ?? 1); ctx.scale(e, e); ga(clamp(k * 3) * (o.a ?? 1));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill();
      if (o.think) { const tx = (o.tail || 0) * w * 0.3; for (const [dx, dy, rr] of [[0, h / 2 + 18, 12], [o.tailDir * 18, h / 2 + 46, 8]]) { ctx.beginPath(); ctx.arc(tx + dx, dy, rr, 0, TAU); ctx.fill(); } }
      else { const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill(); }
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 640, 50, { w: 900, sp: 12 }); const w = Math.min(260, tw(s, 50) * 0.4); ctx.fillStyle = RED; ctx.fillRect(540 - w / 2, 686, w, 5); ctx.restore(); ga(1); }
    function cup(x, y, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = '#e8e8e8'; ctx.beginPath(); ctx.moveTo(-14, -20); ctx.lineTo(14, -20); ctx.lineTo(10, 20); ctx.lineTo(-10, 20); ctx.closePath(); ctx.fill(); ctx.restore(); }

    // carrega a pedra: no peito (criança) ou nas costas (adulto). Devolve o centro da pedra.
    function carrier(o) {
      const r = o.r, dir = o.dir || 1;
      if (o.back) { const [sx, sy] = shoulder(o); const cx = sx - dir * r * 0.95, cy = sy + r * 0.4;
        stone(cx, cy, r, { crack: o.crack || 0, a: o.sa ?? 1 });
        const f = figure(Object.assign({}, o, { reach: o.reach || [[0, cx + dir * r * 0.2, cy - r * 0.7, 1], [1, cx + dir * r * 0.6, cy - r * 0.35, 1]] }));
        return { f, c: [cx, cy] }; }
      const f = figure(o); const hx = (f.hands[0][0] + f.hands[1][0]) / 2, hy = (f.hands[0][1] + f.hands[1][1]) / 2;
      const c = [hx + dir * 4, hy - r * 0.55]; if (o.r > 0) stone(c[0], c[1], r, { a: o.sa ?? 1 }); return { f, c };
    }
    const A_HOLD = [[0.85, 1.75], [0.75, 1.65]];

    // ---------- 6 anos: o copo e o grito ----------
    function scene1(t) {
      const ks = 0.62;
      const kx = lerp(120, KIDX, sm(t, 0.0, 0.85, outC)); const walking = t < 0.85;
      const pose = walking ? walkPose(t * 9, 1) : { legs: STANDL, bob: 0 };
      const shrink = sm(t, T.grito, T.grito + 0.5);
      const hold = sm(t, T.land - 0.2, T.land);
      let arms = walking ? [[0.9, 1.6], walkArms(t * 9)[1]] : t < T.cup + 0.2 ? [[lerp(0.9, 1.3, prog(t, T.cup, T.cup + 0.15)), 1.6], [0.1, 0.1]] : [[0.6, 0.9], [0.3, 0.6]];
      if (t > T.grito) arms = lerpA(arms, [[0.55, 2.6], [0.45, 2.5]], shrink * (1 - hold)); // mãos na frente do rosto
      if (hold > 0) arms = lerpA(arms, A_HOLD, hold);
      const r = t >= T.land ? 22 : 0;
      const { f } = carrier({ x: kx, y: FLOOR, s: ks, hr: 31, dir: 1, lean: 0.06 + shrink * 0.12 + (t > T.land ? 0.1 : 0), headTilt: t > T.grito ? 0.55 * shrink : -0.15, legs: pose.legs, bob: pose.bob, arms, r });
      // o copo
      if (t < T.cup) { const h = f.hands[0]; cup(h[0] + 8, h[1] - 18, 0); }
      else { const u = prog(t, T.cup, T.cupHit); cup(lerp(KIDX + 50, KIDX + 95, u), lerp(FLOOR - 120, FLOOR - 14, u * u), u * 1.6);
        if (t > T.cupHit) { ga(0.55 * (1 - prog(t, 3.5, 4.2))); ctx.fillStyle = '#cfd8e6'; ctx.beginPath(); ctx.ellipse(KIDX + 120, FLOOR + 4, 34 + 40 * outC(prog(t, T.cupHit, T.cupHit + 0.4)), 7, 0, 0, TAU); ctx.fill(); ga(1); } }
      // o pai: inclina, aponta, grita e vai embora
      const ang = sm(t, T.grito - 0.25, T.grito), away = t > T.dadOut;
      const dx = away ? lerp(DADX, 1180, sm(t, T.dadOut, T.dadOut + 1.3, lin)) : DADX, dpose = away ? walkPose(t * 7, 0.9) : { legs: STANDL, bob: 0 };
      figure({ x: dx, y: FLOOR, s: FS, hr: 23, dir: away ? 1 : -1, lean: away ? 0.06 : lerp(0.02, 0.3, ang), headTilt: away ? 0 : lerp(0.1, -0.1, ang), legs: dpose.legs, bob: dpose.bob, arms: away ? walkArms(t * 7, 0.6) : [[lerp(0.15, 1.75, ang), lerp(0.2, 1.65, ang)], [-0.1, 0.1]] });
      // a frase vira pedra
      const bk = prog(t, T.grito, T.grito + 0.12) * (1 - prog(t, T.stone - 0.1, T.stone + 0.1));
      const shake = t > T.grito && t < T.stone ? Math.sin(t * 61) * 5 : 0;
      bubble('VOCÊ NÃO SERVE', DADX - 110 + shake, FLOOR - 440, bk, { size: 54, tail: 0.5, tailDir: 1 });
      bubble('PRA NADA!', DADX - 110 + shake, FLOOR - 335, bk, { size: 70, tail: 0.5, tailDir: 1 });
      if (t >= T.stone && t < T.land) { const u = sm(t, T.stone, T.land, x => x * x * (3 - 2 * x)); const c0 = [DADX - 110, FLOOR - 380], c1 = [KIDX + 40, FLOOR - 100]; stone(lerp(c0[0], c1[0], u), lerp(c0[1], c1[1], u) - Math.sin(u * Math.PI) * 120, lerp(60, 22, u)); }
    }
    // ---------- 12 anos: não levanta a mão ----------
    function scene2(t) {
      const ks = 0.88, kx = lerp(80, KIDX, sm(t, S2.a, 5.4, outC)), walking = t < 5.4, pose = walking ? walkPose(t * 7, 0.8) : { legs: STANDL, bob: 0 };
      const tryUp = sm(t, 6.05, 6.3) * (1 - sm(t, 6.4, 6.65));
      const arms = [[lerp(0.85, 0.6, tryUp), lerp(1.75, 1.2, tryUp)], [lerp(0.75, 2.9, tryUp), lerp(1.65, 3.0, tryUp)]];
      const sad = sm(t, 6.5, 6.9);
      carrier({ x: kx, y: FLOOR, s: ks, hr: 27, dir: 1, lean: 0.18 + sad * 0.1, headTilt: 0.15 + sad * 0.45, legs: pose.legs, bob: pose.bob, arms: walking ? A_HOLD : arms, r: 34 });
      // professor
      figure({ x: DADX + 40, y: FLOOR, s: FS, hr: 23, dir: -1, lean: 0.02, headTilt: 0.05, legs: STANDL, bob: 0, arms: [[lerp(0.15, 1.3, sm(t, 5.3, 5.5)), lerp(0.2, 1.9, sm(t, 5.3, 5.5))], [-0.1, 0.1]] });
      bubble('QUEM QUER TENTAR?', DADX - 20, FLOOR - 470, prog(t, 5.35, 5.5) * (1 - prog(t, 6.15, 6.3)), { size: 40, tail: 0.4, tailDir: 1 });
      bubble('EU NÃO SIRVO PRA NADA.', kx + 120, FLOOR - 400, prog(t, 6.55, 6.7) * (1 - prog(t, 7.5, 7.7)), { size: 38, color: RED, think: true, tail: -0.4, tailDir: -1 });
    }
    // ---------- 25 anos: recusa a vaga ----------
    function scene3(t) {
      const os = FS, ox = lerp(60, KIDX, sm(t, S3.a, 8.85, lin)), walking = t < 8.85, pose = walking ? walkPose(t * 4.5, 0.6) : { legs: STANDL, bob: 0 };
      carrier({ x: ox, y: FLOOR, s: os, hr: 23, dir: 1, lean: 0.52, headTilt: 0.25 + sm(t, 9.7, 10.0) * 0.3, legs: pose.legs, bob: pose.bob, arms: A_DOWN, r: 70, back: true });
      figure({ x: DADX + 60, y: FLOOR, s: FS, hr: 23, dir: -1, lean: 0.03, headTilt: 0.05, legs: STANDL, bob: 0, arms: [[lerp(0.15, 1.35, sm(t, 8.9, 9.1)), lerp(0.2, 1.5, sm(t, 8.9, 9.1))], [-0.1, 0.1]] });
      bubble('A VAGA É SUA. TOPA?', 640, FLOOR - 470, prog(t, 8.95, 9.1) * (1 - prog(t, 9.65, 9.8)), { size: 40, tail: 0.4, tailDir: 1 });
      bubble('EU? NÃO SIRVO PRA ISSO.', ox + 170, FLOOR - 470, prog(t, 9.75, 9.9) * (1 - prog(t, 10.7, 10.85)), { size: 40, color: RED, tail: -0.5, tailDir: -1 });
    }
    // ---------- 30 anos depois: o pai nem lembra ----------
    function oldDad(t, o = {}) { return figure(Object.assign({ x: OLDX, y: FLOOR, s: 1.24, hr: 22, dir: -1, lean: 0.42, headTilt: 0.12, legs: STANDL, bob: 0, arms: [[0.35, 0.35], [0.2, 0.25]], cane: 0 }, o)); }
    function scene4(t) {
      const ox = lerp(60, KIDX - 20, sm(t, S4.a, 12.0, lin)), walking = t < 12.0, pose = walking ? walkPose(t * 4.5, 0.6) : { legs: STANDL, bob: 0 };
      carrier({ x: ox, y: FLOOR, s: FS, hr: 23, dir: 1, lean: 0.55, headTilt: 0.05, legs: pose.legs, bob: pose.bob, arms: A_DOWN, r: 78, back: true });
      const shrug = sm(t, 12.9, 13.1);
      oldDad(t, { arms: [[0.35, 0.35], [lerp(0.2, -0.6, shrug), lerp(0.25, -2.4, shrug)]] });
      bubble('PAI, EU NUNCA ESQUECI.', KIDX + 110, FLOOR - 500, prog(t, 12.1, 12.25) * (1 - prog(t, 12.8, 12.95)), { size: 40, tail: -0.5, tailDir: -1 });
      bubble('ESQUECEU O QUÊ?', OLDX - 60, FLOOR - 430, prog(t, 12.95, 13.1) * (1 - prog(t, 13.6, 13.75)), { size: 46, color: '#555', tail: 0.4, tailDir: 1 });
    }
    // ---------- virada ----------
    function scene5(t) {
      const sonX = KIDX - 20;
      const upK = sm(t, T.up, T.up + 0.7), r = 78;
      const brk = t >= T.brk;
      const lean = lerp(0.55, 0.05, upK), tilt = lerp(0.05, -0.1, upK);
      // pai vai até o filho
      const dw = t > T.walk && t < T.arrive, dxp = lerp(OLDX, sonX + 205, sm(t, T.walk, T.arrive, lin));
      const hugK = sm(t, T.hug - 0.4, T.hug);
      const dpose = dw ? walkPose(t * 4, 0.5) : { legs: STANDL, bob: 0 };
      const sonSh = shoulder({ x: sonX, y: FLOOR, s: FS, dir: 1, lean });
      let dreach = null;
      if (t > T.arrive - 0.1) dreach = [[1, sonSh[0] + 18, sonSh[1] + 6, 1]];
      // filho
      let sonArms = A_DOWN, sonReach = null;
      if (hugK > 0) { const dsh = shoulder({ x: dxp, y: FLOOR, s: 1.24, dir: -1, lean: lerp(0.42, 0.3, hugK) }); sonReach = [[0, dsh[0] + 10, dsh[1] + 20, -1], [1, dsh[0] + 4, dsh[1] + 44, -1]]; }
      if (!brk) carrier({ x: sonX, y: FLOOR, s: FS, hr: 23, dir: 1, lean, headTilt: tilt, legs: STANDL, bob: 0, arms: sonArms, r, back: true, crack: sm(t, T.crack, T.brk - 0.05) });
      else { const [sx, sy] = shoulder({ x: sonX, y: FLOOR, s: FS, dir: 1, lean: 0.55 }); chunks(sx - r * 0.95, sy + r * 0.4, r, t - T.brk);
        figure({ x: sonX, y: FLOOR, s: FS, hr: 23, dir: 1, lean, headTilt: tilt, legs: STANDL, bob: 0, arms: lerpA([[-0.6, -1.2], [-0.4, -1.0]], A_DOWN, upK), reach: sonReach }); }
      oldDad(t, { x: dxp, lean: lerp(0.42, 0.3, hugK), headTilt: lerp(0.12, -0.05, sm(t, T.look, T.look + 0.3)), legs: dpose.legs, bob: dpose.bob, reach: dreach });
      bubble('ME PERDOA, FILHO.', 600, FLOOR - 420, prog(t, T.perdoa, T.perdoa + 0.15) * (1 - prog(t, T.acredito - 0.15, T.acredito)), { size: 46, tail: 0.3, tailDir: 1 });
      bubble('EU ACREDITO EM VOCÊ.', 570, FLOOR - 450, prog(t, T.acredito, T.acredito + 0.2) * (1 - prog(t, 23.9, 24.2)), { size: 50, tail: 0.5, tailDir: 1 });
      if (hugK > 0.5) { const g = ctx.createRadialGradient(sonX + 90, FLOOR - 170, 10, sonX + 90, FLOOR - 170, 280); g.addColorStop(0, `rgba(255,236,200,${0.22 * hugK})`); g.addColorStop(1, 'rgba(255,236,200,0)'); ctx.fillStyle = g; ctx.fillRect(sonX - 250, FLOOR - 460, 640, 600); }
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    for (let k = 0; k < 3; k++) cue(0.1 + k * 0.25, 'step', { gain: 0.25 }); cue(T.cupHit, 'cup'); cue(T.grito, 'shout'); cue(T.land, 'thud', { gain: 0.9 }); cue(T.stone, 'whoosh', { gain: 0.5 });
    for (let k = 0; k < 4; k++) cue(T.dadOut + 0.2 + k * 0.33, 'step', { gain: 0.35 }); cue(T.dadOut + 1.3, 'door');
    for (const tt of [S1.b, S2.b, S3.b]) cue(tt - 0.05, 'whoosh');
    cue(5.35, 'bubble'); cue(6.55, 'bubble', { gain: 0.6 }); cue(6.55, 'thud', { gain: 0.5 }); cue(6.9, 'sigh');
    for (let k = 0; k < 4; k++) cue(8.0 + k * 0.22, 'step', { gain: 0.35 }); cue(8.95, 'bubble'); cue(9.75, 'bubble', { gain: 0.8 });
    cue(S4.a + 0.1, 'tickstart'); cue(12.05, 'tickstop'); for (let k = 0; k < 3; k++) cue(11.3 + k * 0.5, 'step', { gain: 0.3 }); cue(12.1, 'bubble', { gain: 0.6 }); cue(12.95, 'bubble', { gain: 0.8 });
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(T.v, 'whoosh'); for (let k = 0; k < 3; k++) cue(T.walk + 0.1 + k * 0.3, 'step', { gain: 0.25 }); cue(T.perdoa, 'bubble'); cue(T.acredito, 'bubble'); cue(T.crack, 'crack'); cue(T.brk, 'break'); cue(T.brk + 0.5, 'thud', { gain: 0.4 }); cue(T.hug, 'hold');
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const z = 1.45 * (1 + 0.06 * sm(t, T.v, 26)), camX = t < T.v ? 560 : lerp(560, 540, sm(t, T.v, T.hug + 1));
      let shk = 0; if (t > T.grito && t < T.grito + 0.35) shk = Math.sin(t * 90) * 9 * (1 - prog(t, T.grito, T.grito + 0.35));
      if (t > T.brk && t < T.brk + 0.3) shk = Math.sin(t * 90) * 7 * (1 - prog(t, T.brk, T.brk + 0.3));
      ctx.save(); ctx.translate(540 + shk, 1520); ctx.scale(z, z); ctx.translate(-camX, -FLOOR); ctx.drawImage(bgc, 0, 0);
      if (t < S1.b + 0.1) scene1(t); else if (t < S2.b + 0.1) scene2(t); else if (t < S3.b + 0.1) scene3(t); else if (t < T.v) scene4(t); else scene5(t);
      ctx.restore();
      for (const e of [S1.b, S2.b, S3.b, T.v]) { const k = prog(t, e - 0.2, e + 0.1) * (1 - prog(t, e + 0.15, e + 0.45)); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      const ag = [[0.3, S1.b - 0.3, '6 ANOS'], [S2.a, S2.b - 0.3, '12 ANOS'], [S3.a, S3.b - 0.3, '25 ANOS'], [S4.a, S4.b - 0.4, '30 ANOS DEPOIS'], [T.v + 0.1, T.hug + 1.5, 'AINDA DÁ TEMPO']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      // gancho
      const h1 = prog(t, 0.05, 0.35) * (1 - prog(t, 4.0, 4.3)); if (h1 > 0) { spaced('VOCÊ DISSE', 540, 330, 62, { a: h1, w: 900, sp: 10 }); spaced('UMA VEZ SÓ.', 540, 420, 62, { a: h1 * prog(t, 0.25, 0.55), w: 900, sp: 10 }); spaced('ELE OUVE ATÉ HOJE.', 540, 515, 56, { a: h1 * prog(t, 0.6, 0.9), w: 900, sp: 8, color: RED }); }
      // HEADLINE
      const dim = prog(t, T.dimA, T.dimA + 0.3) * (1 - prog(t, T.dimB - 0.4, T.dimB)); if (dim > 0) { ga(0.9 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['VOCÊ ESQUECEU', WHITE], ['EM 1 MINUTO.', WHITE], ['ELE CARREGOU', WHITE], ['POR 30 ANOS.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; const size = fit(s, i === 3 ? 140 : 118); txt(s, 540, 640 + i * 150 + (i >= 2 ? 50 : 0) + (i === 3 ? 20 : 0), size, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); });
        const sr = 40 + 12 * Math.sin(t * 5); ctx.save(); ga(0.9 * dim * prog(t, T.hl[3], T.hl[3] + 0.3)); stone(540, 1430, sr); ctx.restore(); ga(1); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.62 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('ELE VAI', 540, 430, 124, { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('CARREGAR', 540, 570, fit('CARREGAR', 124), { a: prog(t, T.fin + 0.35, T.fin + 0.7), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.35, T.fin + 0.85))) });
        txt('O QUE VOCÊ DIZ.', 540, 715, fit('O QUE VOCÊ DIZ.', 120), { color: RED, a: prog(t, T.fin + 0.8, T.fin + 1.1), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.8, T.fin + 1.3))), glow: 'rgba(224,38,43,0.55)' });
        spaced('HOJE, DIGA: EU ACREDITO EM VOCÊ.', 540, 860, 36, { a: prog(t, 26.6, 27.2), w: 800, sp: 5 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 27.4, 28.0), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
