/*
 * "CHAMADAS PERDIDAS": tela dividida. Em cima, a MÃE na janela ligando; embaixo, o FILHO recusando (18, 25, 35 anos).
 * O contador vermelho de chamadas perdidas sobe (1, 12, 47). Aos 45 é ele quem liga e a cadeira está vazia.
 * Virada: "AINDA DÁ TEMPO" — volta pro hoje, o celular toca, ele ATENDE. Final: "ELA AINDA ATENDE. LIGA PRA ELA." (Êx 20:12)
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

  const WHITE = '#efefef', RED = '#e0262b', GREEN = '#2fbf5b', BG = '#0a0a0c';
  const MF = 930, SF = 1620, FS = 2.25;            // chão da mãe (painel de cima) e do filho (painel de baixo)
  const S1 = { a: 0.0, b: 4.4 }, S2 = { a: 4.6, b: 8.0 }, S3 = { a: 8.2, b: 11.4 }, S4 = { a: 11.6, b: 13.8 };
  const T = { r1: 0.6, x1: 1.6, r2: 5.1, x2: 6.0, r3: 8.7, x3: 9.6, call: 12.0, give: 13.3,
    hl: [14.05, 14.6, 15.2, 15.85], dimA: 13.8, dimB: 16.9, v: 17.0, rew: 17.0, rewEnd: 17.7, r4: 18.2, ans: 19.2, oi: 19.5, filho: 20.0, heart: 20.6, fin: 24.6 };
  const MOMX = 420, SONX = 430;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    const fit = (s, size, max = 960) => Math.min(size, size * max / tw(s, size));
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenários: casa da mãe (cima) e mundo do filho (baixo) ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      // painel da mãe
      const wg = g.createLinearGradient(0, 360, 0, MF); wg.addColorStop(0, '#121016'); wg.addColorStop(1, '#1c1820'); g.fillStyle = wg; g.fillRect(0, 360, W, MF - 360);
      g.strokeStyle = '#38323e'; g.lineWidth = 8; g.strokeRect(720, 470, 200, 250); g.beginPath(); g.moveTo(820, 470); g.lineTo(820, 720); g.moveTo(720, 595); g.lineTo(920, 595); g.stroke();
      const wl = g.createLinearGradient(0, 470, 0, 720); wl.addColorStop(0, 'rgba(70,90,140,0.25)'); wl.addColorStop(1, 'rgba(70,90,140,0.08)'); g.fillStyle = wl; g.fillRect(724, 474, 192, 242);
      const lamp = g.createRadialGradient(560, 560, 20, 560, 640, 520); lamp.addColorStop(0, 'rgba(255,214,150,0.13)'); lamp.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = lamp; g.fillRect(0, 360, W, MF - 360);
      g.fillStyle = '#26222b'; g.fillRect(0, MF, W, 60); g.fillStyle = '#3a3440'; g.fillRect(0, MF, W, 3);
      // divisória
      g.fillStyle = '#050506'; g.fillRect(0, 960, W, 40);
      // painel do filho
      const sg = g.createLinearGradient(0, 1000, 0, SF); sg.addColorStop(0, '#0f1014'); sg.addColorStop(1, '#17181e'); g.fillStyle = sg; g.fillRect(0, 1000, W, SF - 1000);
      g.fillStyle = '#25262c'; g.fillRect(0, SF, W, 80); g.fillStyle = '#3a3b42'; g.fillRect(0, SF, W, 3);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho (mesmo do "A frase que ficou") ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function ik(sx, sy, tx, ty, l1, l2, bend) { const dx = tx - sx, dy = ty - sy, d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.5), base = Math.atan2(dx, dy); const al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), a1 = base + bend * al; const ex = sx + Math.sin(a1) * l1, ey = sy + Math.cos(a1) * l1; return [a1, Math.atan2(tx - ex, ty - ey)]; }
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
      ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
      if (o.bun) { ctx.beginPath(); ctx.arc(hx - hr * 0.85, hy - hr * 0.55, hr * 0.48, 0, TAU); ctx.fill(); }
      ctx.shadowBlur = 0;
      if (o.eyes !== false) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill(); }
      ctx.restore(); ga(1);
      const W2 = ([x, y]) => [o.x + dir * x * s, o.y + y * s];
      return { head: W2([hx, hy]), sh: W2([shX, shY + 4]), hands: hands.map(W2) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const STANDL = [[0.1, 0.06], [-0.1, -0.06]];
    const A_DOWN = [[0.15, 0.2], [-0.1, 0.1]];
    const ear = (o, hr = 23) => { const [sx, sy] = shoulder(o); return [sx + (o.dir || 1) * hr * 0.6 * o.s, sy - (hr + 6) * o.s]; };
    const chest = (o) => { const [sx, sy] = shoulder(o); return [sx + (o.dir || 1) * 62 * o.s, sy + 22 * o.s]; };

    // ---------- celular ----------
    function phone(x, y, s, mode, t, o = {}) {
      ctx.save(); ctx.translate(x, y); if (mode === 'ring') ctx.rotate(Math.sin(t * 55) * 0.08); ctx.scale(s, s);
      if (mode === 'down') { ctx.fillStyle = '#1d1d22'; ctx.beginPath(); ctx.roundRect(-30, -10, 60, 20, 6); ctx.fill(); ctx.restore(); return; }
      ctx.fillStyle = '#18181c'; ctx.beginPath(); ctx.roundRect(-30, -52, 60, 104, 10); ctx.fill();
      const lit = mode === 'off' ? 0.25 : 1; ctx.fillStyle = mode === 'off' ? '#2a2a30' : '#e9eef6'; ga(lit); ctx.beginPath(); ctx.roundRect(-25, -46, 50, 92, 7); ctx.fill(); ga(1);
      if (mode !== 'off') { txt(o.label || 'MÃE', 0, -22, 13, { color: '#222' }); if (mode === 'ring' || mode === 'call') { ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(mode === 'call' ? 0 : -11, 28, 7, 0, TAU); ctx.fill(); } if (mode === 'ring') { ctx.fillStyle = GREEN; ctx.beginPath(); ctx.arc(11, 28, 7, 0, TAU); ctx.fill(); } if (mode === 'talk') { ctx.fillStyle = GREEN; ctx.beginPath(); ctx.arc(0, 28, 7, 0, TAU); ctx.fill(); } }
      ctx.restore();
      if (mode === 'ring' || o.glow) { const g = ctx.createRadialGradient(x, y, 4, x, y, 120 * s); g.addColorStop(0, `rgba(200,220,255,${0.3 * (0.6 + 0.4 * Math.sin(t * 12))})`); g.addColorStop(1, 'rgba(200,220,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - 130 * s, y - 130 * s, 260 * s, 260 * s); }
      if (mode === 'ring') for (let i = 0; i < 2; i++) { const r = (40 + ((t * 90 + i * 30) % 60)) * s; ctx.strokeStyle = `rgba(255,255,255,${0.35 * (1 - ((t * 90 + i * 30) % 60) / 60)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r, -0.7, 0.7); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, r, Math.PI - 0.7, Math.PI + 0.7); ctx.stroke(); }
    }
    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 44, w = tw(s, size) + 60, h = size * 1.75; ctx.save(); ctx.translate(x, y); const e = 1 + (1 - k) * 0.3; ctx.scale(e, e); ga(clamp(k * 3));
      ctx.fillStyle = o.bg || '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 24); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 14, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 26, h / 2 + 30); ctx.lineTo(tx + 16, h / 2 - 2); ctx.fill();
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function chair(x, y) { ctx.save(); ctx.translate(x, y); ctx.scale(1.35, 1.35); ctx.translate(-x, -y); chair0(x, y); ctx.restore(); }
    function chair0(x, y) { ctx.fillStyle = '#3a3440'; ctx.fillRect(x - 60, y - 95, 120, 14); ctx.fillRect(x - 60, y - 210, 14, 129); ctx.fillRect(x - 56, y - 81, 10, 81); ctx.fillRect(x + 46, y - 81, 10, 81); }
    function desk(x, y) { ctx.save(); ctx.translate(x, y); ctx.scale(1.3, 1.3); ctx.translate(-x, -y); desk0(x, y); ctx.restore(); }
    function desk0(x, y) { ctx.fillStyle = '#26272e'; ctx.fillRect(x - 130, y - 150, 260, 14); ctx.fillRect(x - 120, y - 136, 12, 136); ctx.fillRect(x + 108, y - 136, 12, 136); ctx.fillStyle = '#3c3d46'; ctx.fillRect(x - 70, y - 220, 120, 74); ctx.fillStyle = '#7fb1ff'; ga(0.35); ctx.fillRect(x - 64, y - 214, 108, 62); ga(1); }
    function heart(x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ga(a); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(0, 18); ctx.bezierCurveTo(-34, -6, -22, -36, 0, -18); ctx.bezierCurveTo(22, -36, 34, -6, 0, 18); ctx.fill(); ctx.restore(); ga(1); }
    function counter(n, k, t) { if (k <= 0) return; const s = n === 1 ? '1 CHAMADA PERDIDA' : `${n} CHAMADAS PERDIDAS`, w = tw(s, 38) + 80; ctx.save(); ctx.translate(540, 980); const p = 1 + 0.12 * Math.exp(-((t % 100) - 0) * 0); ctx.scale(lerp(1.3, 1, outC(k)), lerp(1.3, 1, outC(k))); ga(clamp(k * 3)); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.roundRect(-w / 2, -34, w, 68, 34); ctx.fill(); ctx.shadowBlur = 0; txt(s, 0, 2, 38, { color: '#fff' }); ctx.restore(); ga(1); }
    function ageChip(s, x, y, k) { if (k <= 0) return; ga(k); spaced(s, x, y, 34, { w: 900, sp: 8 }); ctx.fillStyle = RED; ctx.fillRect(x - 50, y + 30, 100, 4); ga(1); }

    // ---------- a mãe ----------
    function mom(t, o = {}) {
      const base = { x: MOMX, y: MF, s: FS * 0.92, hr: 22, dir: 1, lean: o.lean ?? 0.08, headTilt: o.tilt ?? 0, legs: STANDL, bob: 0, arms: A_DOWN, bun: true, cane: o.cane ? 0 : null };
      const up = o.up ?? 0; const e = ear(base, 22), hand = [lerp(base.x + 50 * base.s, e[0], up), lerp(base.y - 80 * base.s, e[1], up)];
      const f = figure(Object.assign(base, { reach: o.cane ? [[1, hand[0], hand[1], 1]] : [[1, hand[0], hand[1], 1]] }));
      if (o.phone !== false) phone(f.hands[1][0] + 4, f.hands[1][1] - 6, 1.05, o.mode || 'off', t);
      return f;
    }
    // ---------- o filho ----------
    function son(t, o = {}) {
      const base = Object.assign({ x: SONX, y: SF, s: FS, hr: 23, dir: 1, lean: 0.06, headTilt: 0.15, legs: STANDL, bob: 0, arms: A_DOWN }, o.fig || {});
      let reach = null, pp = null;
      if (o.hold === 'chest') { pp = chest(base); reach = [[1, pp[0], pp[1], 1]]; }
      if (o.hold === 'ear') { pp = ear(base); reach = [[1, pp[0], pp[1], 1]]; }
      if (o.hold === 'mix') { const a = chest(base), b = ear(base); pp = [lerp(a[0], b[0], o.mix), lerp(a[1], b[1], o.mix)]; reach = [[1, pp[0], pp[1], 1]]; }
      const f = figure(Object.assign({}, base, { reach }));
      if (pp && o.mode) phone(f.hands[1][0] + 6, f.hands[1][1] - 8, 1.15, o.mode, t, { label: o.label });
      return f;
    }

    // ---------- cenas ----------
    function scene1(t) { // 18 anos: recusa
      const ring = t > T.r1 && t < T.x1, rej = t >= T.x1;
      mom(t, { up: sm(t, 0.2, 0.6) * (1 - sm(t, T.x1 + 0.3, T.x1 + 0.9)), mode: t < T.x1 + 0.3 ? 'call' : 'off', tilt: t > T.x1 + 0.5 ? 0.35 : 0 });
      const f1 = son(t, { hold: 'chest', mode: ring ? 'ring' : rej ? 'off' : 'off', fig: { headTilt: ring ? 0.35 : 0.1 } });
      bubble('TÔ OCUPADO.', f1.head[0] + 300, f1.head[1] - 20, prog(t, T.x1 + 0.05, T.x1 + 0.2) * (1 - prog(t, 3.6, 3.9)), { size: 44, tail: -0.5, tailDir: -1 });
    }
    function scene2(t) { // 25 anos: vira o celular na mesa
      desk(760, SF);
      const ring = t > T.r2 && t < T.x2;
      mom(t, { up: sm(t, S2.a, S2.a + 0.4) * (1 - sm(t, T.x2 + 0.3, T.x2 + 0.9)), mode: t < T.x2 + 0.3 ? 'call' : 'off', tilt: t > T.x2 + 0.5 ? 0.35 : 0, lean: 0.12 });
      const flip = sm(t, T.x2 - 0.25, T.x2);
      const f2 = son(t, { fig: { x: 470, lean: 0.25, headTilt: 0.35, arms: [[0.15, 0.2], [lerp(0.9, 1.3, flip), lerp(1.6, 1.9, flip)]] } });
      phone(720, SF - 158, 0.95, ring ? 'ring' : t >= T.x2 ? 'down' : 'off', t);
      bubble('DEPOIS EU VEJO.', clamp(f2.head[0] + 260, 320, 760), f2.head[1] - 60, prog(t, T.x2 + 0.05, T.x2 + 0.2) * (1 - prog(t, 7.4, 7.7)), { size: 42, tail: -0.3, tailDir: -1 });
    }
    function scene3(t) { // 35 anos: andando apressado, recusa sem parar
      const x = lerp(160, 640, sm(t, S3.a, S3.b, lin)), ph = t * 8, wp = walkPose(ph, 0.9), ring = t > T.r3 && t < T.x3;
      mom(t, { up: sm(t, S3.a, S3.a + 0.4) * (1 - sm(t, T.x3 + 0.3, T.x3 + 0.9)), mode: t < T.x3 + 0.3 ? 'call' : 'off', tilt: t > T.x3 + 0.5 ? 0.4 : 0, lean: 0.3, cane: true });
      const f3 = son(t, { hold: 'chest', mode: ring ? 'ring' : 'off', fig: { x, lean: 0.12, legs: wp.legs, bob: wp.bob, headTilt: 0.25 } });
      bubble('AGORA NÃO, MÃE.', clamp(f3.head[0] + 280, 320, 760), f3.head[1] - 30, prog(t, T.x3 + 0.05, T.x3 + 0.2) * (1 - prog(t, 10.9, 11.2)), { size: 42, tail: -0.5, tailDir: -1 });
    }
    function scene4(t) { // 45 anos: ele liga, a cadeira vazia
      chair(MOMX, MF); phone(MOMX, MF - 150, 1.05, t > T.call && t < T.give ? 'ring' : 'off', t, { label: 'FILHO' });
      son(t, { hold: 'ear', mode: t < T.give ? 'call' : 'off', fig: { lean: lerp(0.08, 0.3, sm(t, T.give, T.give + 0.5)), headTilt: lerp(0, 0.5, sm(t, T.give, T.give + 0.5)) } });
      txt('CHAMANDO...', SONX + 330, SF - 330, 44, { a: prog(t, T.call, T.call + 0.2) * (1 - prog(t, T.give, T.give + 0.3)) * (0.6 + 0.4 * Math.sin(t * 8)) });
    }
    function scene5(t) { // virada: hoje, ele atende
      const ring = t > T.r4 && t < T.ans, talk = t >= T.ans, u = sm(t, T.ans, T.ans + 0.5);
      const warm = sm(t, T.ans, T.heart + 0.5); if (warm > 0) { const g = ctx.createRadialGradient(540, 960, 50, 540, 960, 900); g.addColorStop(0, `rgba(255,214,150,${0.2 * warm})`); g.addColorStop(1, 'rgba(255,214,150,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
      mom(t, { up: sm(t, T.r4 - 0.2, T.r4 + 0.3), mode: talk ? 'talk' : 'call', tilt: lerp(0.1, -0.15, u), lean: 0.22, cane: true });
      const f5 = son(t, { hold: 'mix', mix: u, mode: ring ? 'ring' : talk ? 'talk' : 'off', fig: { headTilt: lerp(0.35, -0.12, u), lean: lerp(0.06, 0.0, u) } });
      bubble('OI, MÃE! TAVA COM SAUDADE.', 600, f5.head[1] - 40, prog(t, T.oi, T.oi + 0.2) * (1 - prog(t, 23.6, 23.9)), { size: 40, tail: -0.4, tailDir: -1 });
      bubble('FILHO!', MOMX + 230, MF - 420, prog(t, T.filho, T.filho + 0.2) * (1 - prog(t, 23.6, 23.9)), { size: 54, tail: -0.5, tailDir: -1 });
      heart(MOMX + 330, MF - 280, 1.6 + 0.15 * Math.sin(t * 6), sm(t, T.heart, T.heart + 0.4) * (1 - prog(t, 23.8, 24.2)));
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    for (const [r, x] of [[T.r1, T.x1], [T.r2, T.x2], [T.r3, T.x3]]) { cue(r, 'ring'); cue(x, 'reject'); cue(x + 0.15, 'miss'); }
    cue(T.x2, 'flip'); for (let k = 0; k < 6; k++) cue(S3.a + 0.2 + k * 0.38, 'step', { gain: 0.35 });
    cue(T.call, 'tickstart'); cue(T.call + 0.1, 'ring', { gain: 0.6 }); cue(T.call + 0.75, 'ring', { gain: 0.5 }); cue(T.give, 'tickstop'); cue(T.give + 0.2, 'sigh');
    for (const tt of [S1.b, S2.b, S3.b]) cue(tt - 0.05, 'whoosh');
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(T.rew, 'rewind'); cue(T.r4, 'ring'); cue(T.ans, 'answer'); cue(T.heart, 'heart'); cue(T.fin, 'whoosh');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.drawImage(bgc, 0, 0);
      if (t < S1.b + 0.1) scene1(t); else if (t < S2.b + 0.1) scene2(t); else if (t < S3.b + 0.1) scene3(t); else if (t < T.v) scene4(t); else scene5(t);
      // rótulos de idade e de quem é quem
      const ag = [[0.3, S1.b - 0.3, '18 ANOS'], [S2.a, S2.b - 0.3, '25 ANOS'], [S3.a, S3.b - 0.3, '35 ANOS'], [S4.a, S4.b, '45 ANOS'], [T.rewEnd, T.fin, 'HOJE']];
      for (const [a, b, s] of ag) ageChip(s, 540, 1730, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      ga(0.7); spaced('MÃE', 160, 410, 30, { w: 900, sp: 8 }); spaced('FILHO', 160, 1040, 30, { w: 900, sp: 8 }); ga(1);
      // contador de chamadas perdidas (vermelho)
      const tn = t < T.x2 + 0.15 ? [1, T.x1 + 0.15] : t < T.x3 + 0.15 ? [12, T.x2 + 0.15] : [47, T.x3 + 0.15];
      if (t > T.x1 + 0.15 && t < S4.a + 0.3) counter(tn[0], prog(t, tn[1], tn[1] + 0.25) * (1 - prog(t, S4.a - 0.1, S4.a + 0.3)) + (tn[0] > 1 ? 0.0001 : 0), t);
      if (t > T.v && t < T.rewEnd) { const back = Math.round(lerp(47, 0, prog(t, T.rew, T.rewEnd))); if (back > 0) counter(back, 1, t); }
      // rebobinar: listras de VHS
      if (t > T.rew && t < T.rewEnd + 0.1) { const k = 1 - prog(t, T.rewEnd - 0.1, T.rewEnd + 0.1); ga(0.5 * k); for (let i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#000'; ctx.fillRect(0, ((i * 157 + t * 2400) % H), W, 6 + (i % 3) * 4); } ga(1); ga(k); ctx.fillStyle = '#fff'; for (const dx of [0, 70]) { ctx.beginPath(); ctx.moveTo(600 - dx, 1240); ctx.lineTo(530 - dx, 1300); ctx.lineTo(600 - dx, 1360); ctx.closePath(); ctx.fill(); } ga(1); }
      // transições
      for (const e of [S1.b, S2.b, S3.b]) { const k = prog(t, e - 0.2, e + 0.1) * (1 - prog(t, e + 0.15, e + 0.45)); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      // gancho
      const h1 = prog(t, 0.05, 0.35) * (1 - prog(t, 4.0, 4.3)); if (h1 > 0) { spaced('ELA LIGOU.', 540, 150, 60, { a: h1, w: 900, sp: 10 }); spaced('VOCÊ RECUSOU.', 540, 235, 60, { a: h1 * prog(t, 0.3, 0.6), w: 900, sp: 10 }); spaced('ATÉ O DIA EM QUE...', 540, 315, 50, { a: h1 * prog(t, 0.7, 1.0), w: 900, sp: 8, color: RED }); }
      // HEADLINE
      const dim = prog(t, T.dimA, T.dimA + 0.3) * (1 - prog(t, T.dimB - 0.4, T.dimB)); if (dim > 0) { ga(0.92 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['ELA LIGOU', WHITE], ['47 VEZES.', WHITE], ['VOCÊ LIGOU UMA.', WHITE], ['TARDE DEMAIS.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; const size = fit(s, i === 3 ? 140 : 120); txt(s, 540, 650 + i * 160 + (i >= 2 ? 60 : 0), size, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // virada: AINDA DÁ TEMPO
      const v = prog(t, T.rewEnd - 0.1, T.rewEnd + 0.3) * (1 - prog(t, T.r4 + 0.6, T.r4 + 1.0)); if (v > 0) { txt('MAS HOJE', 540, 200, 70, { a: v }); txt('AINDA DÁ TEMPO.', 540, 300, fit('AINDA DÁ TEMPO.', 92), { a: v, color: RED, glow: 'rgba(224,38,43,0.5)' }); }
      // final + CTA
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.7 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('ELA AINDA', 540, 420, 124, { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('ATENDE.', 540, 560, 132, { a: prog(t, T.fin + 0.3, T.fin + 0.6), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.3, T.fin + 0.8))) });
        txt('LIGA PRA ELA.', 540, 720, fit('LIGA PRA ELA.', 130), { color: RED, a: prog(t, T.fin + 0.8, T.fin + 1.1), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.8, T.fin + 1.3))), glow: 'rgba(224,38,43,0.55)' });
        const c1 = prog(t, 26.4, 26.9), c2 = prog(t, 27.0, 27.5), c3 = prog(t, 27.6, 28.1);
        if (c1 > 0) { ga(c1); ctx.fillStyle = '#f4f4f4'; const w = tw('COMENTA "LIGUEI"', 54) + 80; ctx.beginPath(); ctx.roundRect(540 - w / 2, 920, w, 100, 50); ctx.fill(); txt('COMENTA "LIGUEI"', 540, 972, 54, { color: '#111' }); ga(1); }
        spaced('SE INSCREVE', 540, 1120, 46, { a: c2, w: 900, sp: 8 });
        spaced('E COMPARTILHA COM QUEM', 540, 1200, 40, { a: c3, w: 800, sp: 6 }); spaced('PRECISA LIGAR HOJE', 540, 1260, 40, { a: c3, w: 900, sp: 6, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
