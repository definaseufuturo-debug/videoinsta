/*
 * "A ÚLTIMA VEZ": o filho pede colo aos 2, 5 e 8 anos; o pai carrega cada vez mais no celular (vermelho),
 * aos 8 diz "você já tá grande" e aos 11 o filho passa direto. Virada: o pai guarda o celular, vai até ele,
 * ajoelha, abre os braços e carrega o filho de novo. Bonequinhos de palito, 30 s, 9:16, sem narração. (Ec 3:1)
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
  const lerpA = (A, B, k) => A.map((p, i) => p.map((v, j) => lerp(v, B[i][j], k)));

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c';
  const FLOOR = 1390, PX = 400, FS = 1.32, LAMP = 175;
  // idades: [entra, chega, pede, (abaixa/levanta), carregado, some]
  const AGES = [
    { lab: '2 ANOS', s: 0.55, hr: 30, in: 0.35, at: 1.5, ask: 1.6, bend: 1.95, lift: 2.35, end: 4.15, phone: false, say: 'COLO!' },
    { lab: '5 ANOS', s: 0.7, hr: 28, in: 4.45, at: 5.4, ask: 5.5, bend: 5.95, lift: 6.3, end: 7.75, phone: true, say: 'COLO, PAI!' },
    { lab: '8 ANOS', s: 0.85, hr: 26, in: 8.05, at: 8.9, ask: 9.0, no: 9.55, end: 10.85, phone: true, say: 'COLO?' },
  ];
  const T = { k11in: 11.0, k11at: 12.55, hl: [13.25, 13.75, 14.55, 15.15], v: 16.6, pocket: 17.0, walk: 17.5, kneel: 18.6, arms: 18.9, vem: 19.0, turn: 19.7, run: 20.0, hug: 20.85, up: 21.6, carried: 22.2, fin: 24.6 };
  const K11 = { s: 1.0, hr: 25, X: 810 };
  const FX2 = 610; // onde o pai ajoelha na virada

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: praça à noite, poste com luz quente ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      let sd = 7; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.35})`; g.beginPath(); g.arc(rnd() * W, 700 + rnd() * 500, 1 + rnd() * 1.6, 0, TAU); g.fill(); }
      const sp = g.createRadialGradient(LAMP + 60, FLOOR - 40, 30, LAMP + 60, FLOOR - 40, 700); sp.addColorStop(0, 'rgba(255,214,150,0.16)'); sp.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      // poste
      g.fillStyle = '#2c2c33'; g.fillRect(LAMP - 7, 900, 14, FLOOR - 900); g.fillRect(LAMP - 7, 900, 70, 10); g.fillStyle = '#ffe2a8'; g.beginPath(); g.ellipse(LAMP + 58, 918, 22, 9, 0, 0, TAU); g.fill();
      const cone = g.createLinearGradient(0, 920, 0, FLOOR); cone.addColorStop(0, 'rgba(255,226,168,0.14)'); cone.addColorStop(1, 'rgba(255,226,168,0.02)'); g.fillStyle = cone; g.beginPath(); g.moveTo(LAMP + 40, 920); g.lineTo(LAMP + 76, 920); g.lineTo(LAMP + 380, FLOOR); g.lineTo(LAMP - 220, FLOOR); g.closePath(); g.fill();
      // banco
      g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3; g.beginPath(); g.roundRect(860, FLOOR - 96, 200, 18, 6); g.fill(); g.stroke(); g.fillRect(880, FLOOR - 80, 12, 80); g.fillRect(1030, FLOOR - 80, 12, 80);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

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
      if (o.eyes !== false) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill(); }
      ctx.restore(); ga(1);
      return { head: [o.x + dir * hx * s, o.y + hy * s], hands: hands.map(([x, y]) => [o.x + dir * x * s, o.y + y * s]) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const STANDL = [[0.1, 0.06], [-0.1, -0.06]];
    const CARRYL = [[1.35, 0.35], [1.2, 0.25]];
    const KNEELL = [[1.35, -0.15], [0.12, -1.5]];
    const A_DOWN = [[0.15, 0.2], [-0.1, 0.1]], A_GRAB = [[0.9, 0.55], [0.8, 0.45]], A_HOLD2 = [[0.95, 1.7], [1.05, 1.85]], A_HOLD1 = [[0.95, 1.7], [0.45, 2.7]], A_PHONE = [[0.15, 0.2], [0.45, 2.7]], A_OPEN = [[1.95, 1.55], [1.6, 1.25]];
    const K_UP = [[2.75, 2.95], [2.55, 2.8]], K_DOWN = [[0.2, 0.1], [-0.1, 0.0]], K_HUG = [[1.9, 2.5], [1.75, 2.35]];

    function phone(x, y, on) { ctx.save(); if (on > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, 150); g.addColorStop(0, `rgba(224,38,43,${0.42 * on})`); g.addColorStop(1, 'rgba(224,38,43,0)'); ctx.fillStyle = g; ctx.fillRect(x - 150, y - 150, 300, 300); }
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 14 * on; ctx.beginPath(); ctx.roundRect(x - 11, y - 18, 22, 36, 5); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = `rgba(255,220,220,${0.55 * on})`; ctx.fillRect(x - 7, y - 13, 14, 24); ctx.restore(); }
    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 52, w = tw(s, size) + 64, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 640, 50, { w: 900, sp: 12 }); ctx.fillStyle = RED; ctx.fillRect(470, 686, 140, 5); ctx.restore(); ga(1); }

    // posição do filho carregado (quadril no antebraço do pai)
    const carryPos = (fx, d, ks) => ({ x: fx + d * 82, y: FLOOR - 172 + 92 * ks });

    // ---------- cena por idade (2, 5, 8 anos) ----------
    function ageScene(A, t) {
      const d = 1, fx = PX, ph = t * 9;
      const standX = fx + 160 * (A.s / 0.7) * 0.75 + 40;
      const L = A.lift ? sm(t, A.lift, A.lift + 0.45) : 0, B = A.bend ? sm(t, A.bend, A.bend + 0.35) * (1 - L) : 0;
      // pai
      const sway = L > 0.99 ? Math.sin((t - A.lift) * 3.2) * 0.05 : 0;
      let farms = A.phone ? A_PHONE : A_DOWN;
      if (A.lift) { farms = lerpA(farms, A_GRAB, B); if (L > 0) farms = lerpA(A_GRAB, A.phone ? A_HOLD1 : A_HOLD2, L); }
      const look = A.phone ? 0.55 : (L > 0.5 ? -0.25 : 0);
      const no = A.no ? sm(t, A.no, A.no + 0.25) : 0;
      const f = figure({ x: fx, y: FLOOR, s: FS, dir: d, lean: 0.05 + B * 0.55 + sway, headTilt: look + B * 0.2 - (A.phone ? no * 0.2 : 0), arms: farms, legs: STANDL, bob: 0 });
      if (A.phone) phone(f.hands[1][0] + 2, f.hands[1][1] - 8, 1);
      // filho
      let kx, ky = FLOOR, kd = -1, kl = STANDL, karms = K_DOWN, bob = 0, lean = 0, tilt = 0;
      if (t < A.at) { kx = lerp(1150, standX, sm(t, A.in, A.at, x => x)); const w = walkPose(ph, 1.2); kl = w.legs; bob = w.bob; karms = walkArms(ph); lean = 0.12; }
      else { kx = standX; const up = sm(t, A.ask - 0.1, A.ask + 0.2); karms = lerpA(K_DOWN, K_UP, up);
        if (A.no) { const sad = sm(t, A.no + 0.5, A.no + 0.9); karms = lerpA(karms, K_DOWN, sad); tilt = sad * 0.65; lean = sad * 0.12; }
        if (L > 0) { const c = carryPos(fx, d, A.s); kx = lerp(standX, c.x, L); ky = lerp(FLOOR, c.y, L) + Math.sin(L * Math.PI) * -40; kl = lerpA(STANDL, CARRYL, L); karms = lerpA(K_UP, K_HUG, L); lean = 0.15 * L; tilt = -0.15 * L;
          if (L > 0.99) { kx += Math.sin((t - A.lift) * 3.2) * 6; } } }
      figure({ x: kx, y: ky, s: A.s, hr: A.hr, dir: kd, lean, headTilt: tilt, arms: karms, legs: kl, bob });
      bubble(A.say, standX + 10, FLOOR - 260 * A.s - 150, prog(t, A.ask, A.ask + 0.2) * (1 - (A.no ? prog(t, A.no - 0.15, A.no) : prog(t, A.bend + 0.4, A.bend + 0.6))), { size: 50, tail: 0.3, tailDir: -1 });
      if (A.no) bubble('VOCÊ JÁ TÁ GRANDE.', fx + 140, FLOOR - 380, prog(t, A.no, A.no + 0.2) * (1 - prog(t, A.end - 0.25, A.end)), { size: 46, color: '#555', tail: -0.8, tailDir: -1 });
    }

    // ---------- 11 anos + virada ----------
    function lateScene(t) {
      const ph = t * 7;
      // pai
      let fx = PX, fd = 1, fy = FLOOR, fl = STANDL, farms = A_PHONE, lean = 0.05, tilt = 0.55, bob = 0, phoneOn = 1;
      const lookUp = sm(t, 12.0, 12.3) * (1 - sm(t, T.v, T.v + 0.2));
      tilt = lerp(0.55, -0.05, lookUp);
      if (t >= T.v) { const pk = sm(t, T.pocket, T.pocket + 0.35); farms = lerpA(A_PHONE, A_DOWN, pk); phoneOn = 1 - pk; tilt = lerp(0.55, 0, sm(t, T.v, T.pocket)); }
      if (t >= T.walk) { const w = sm(t, T.walk, T.kneel, x => x); fx = lerp(PX, FX2, inOut(w)); if (t < T.kneel) { const wp = walkPose(ph, 1); fl = wp.legs; bob = wp.bob; farms = walkArms(ph, 0.8); lean = 0.12; } }
      if (t >= T.kneel) { const kn = sm(t, T.kneel, T.kneel + 0.3); const op = sm(t, T.arms, T.arms + 0.3); const L = sm(t, T.up, T.carried);
        fl = lerpA(lerpA(STANDL, KNEELL, kn), STANDL, L); fy = lerp(FLOOR, lerp(FLOOR + 44 * FS, FLOOR, L), kn); farms = lerpA(lerpA(A_DOWN, A_OPEN, op), A_HOLD2, sm(t, T.hug - 0.2, T.hug + 0.2)); lean = lerp(0.12, 0.05, kn); tilt = 0;
        if (t > T.carried) lean += Math.sin((t - T.carried) * 2.6) * 0.05; }
      const f = figure({ x: fx, y: fy, s: FS, dir: fd, lean, headTilt: tilt, arms: farms, legs: fl, bob });
      if (phoneOn > 0.02) { const h = f.hands[1]; ctx.save(); ga(phoneOn); phone(h[0] + 2, h[1] - 8, phoneOn); ctx.restore(); ga(1); }
      // filho de 11: entra pela esquerda, passa direto e para de costas perto do banco
      let kx, ky = FLOOR, kd = 1, kl = STANDL, karms = K_DOWN, klean = 0, ktilt = 0.45, kb = 0;
      if (t < T.k11at) { kx = lerp(-80, K11.X, sm(t, T.k11in, T.k11at, x => x)); const w = walkPose(t * 7, 0.9); kl = w.legs; kb = w.bob; karms = walkArms(t * 7, 0.6); klean = 0.08; }
      else if (t < T.turn) { kx = K11.X; }
      else { kd = -1; ktilt = lerp(0.45, -0.1, sm(t, T.turn, T.turn + 0.3));
        const r = sm(t, T.run, T.hug, x => x); const hugX = FX2 + 150; kx = lerp(K11.X, hugX, inOut(r));
        if (t < T.hug) { const w = walkPose(t * 9, 1.1); if (t > T.run) { kl = w.legs; kb = w.bob; karms = walkArms(t * 9); klean = 0.12; } }
        else { karms = K_HUG; klean = 0.2;
          const L = sm(t, T.up, T.carried), c = carryPos(FX2, 1, K11.s); kx = lerp(hugX - 40, c.x, L); ky = lerp(FLOOR, c.y, L); kl = lerpA(STANDL, CARRYL, L); ktilt = -0.15;
          if (t > T.carried) kx += Math.sin((t - T.carried) * 2.6) * 7; } }
      figure({ x: kx, y: ky, s: K11.s, hr: K11.hr, dir: kd, lean: klean, headTilt: ktilt, arms: karms, legs: kl, bob: kb });
      bubble('FILHO...', fx + 150, FLOOR - 400, prog(t, 12.25, 12.45) * (1 - prog(t, 12.85, 13.0)), { size: 46, color: '#555', tail: -0.8, tailDir: -1 });
      bubble('VEM CÁ, FILHO.', FX2 + 40, FLOOR - 400, prog(t, T.vem, T.vem + 0.2) * (1 - prog(t, T.run + 0.5, T.run + 0.7)), { size: 50, tail: -0.5, tailDir: -1 });
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    AGES.forEach((A, i) => { cue(A.ask, 'bubble'); if (A.lift) cue(A.lift + 0.2, 'lift'); if (A.no) cue(A.no, 'bubble', { gain: 0.6 }); cue(A.end - 0.05, 'whoosh'); });
    for (const tt of [4.9, 6.9, 9.3, 11.6]) cue(tt, 'ping');
    for (let k = 0; k < 6; k++) cue(T.k11in + 0.2 + k * 0.42, 'step', { gain: 0.5 });
    cue(12.3, 'bubble', { gain: 0.5 });
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 })); cue(12.95, 'tickstart'); cue(T.v - 0.1, 'tickstop');
    cue(T.pocket + 0.3, 'tap'); for (let k = 0; k < 3; k++) cue(T.walk + 0.15 + k * 0.36, 'step', { gain: 0.6 });
    cue(T.vem, 'bubble'); for (let k = 0; k < 3; k++) cue(T.run + 0.1 + k * 0.28, 'step', { gain: 0.5 }); cue(T.hug, 'hug'); cue(T.up + 0.3, 'lift');
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const z = 1.45 * (1 + 0.06 * sm(t, T.v, 26)); ctx.save(); ctx.translate(540, 1520); ctx.scale(z, z); ctx.translate(-590 - (t > T.v ? 50 * sm(t, T.walk, T.kneel) : 0), -FLOOR); ctx.drawImage(bgc, 0, 0);
      const A = AGES.find(a => t >= a.in - 0.3 && t < a.end + 0.3 && (AGES.indexOf(a) === AGES.length - 1 ? t < T.k11in : true));
      if (t < T.k11in - 0.15) { const a = AGES.filter(a => t >= a.in - 0.35).pop() || AGES[0]; ageScene(a, t); }
      else lateScene(t);
      ctx.restore();
      // corte entre idades: piscada escura
      for (const a of AGES) { const k = Math.max(prog(t, a.end - 0.2, a.end + 0.1) * (1 - prog(t, a.end + 0.15, a.end + 0.45)), 0); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      // idades
      const ag = [[0.3, 4.05, '2 ANOS'], [4.45, 7.7, '5 ANOS'], [8.05, 10.8, '8 ANOS'], [11.0, 12.8, '11 ANOS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      // gancho
      const h1 = prog(t, 0.05, 0.4) * (1 - prog(t, 4.0, 4.3)); if (h1 > 0) { spaced('UM DIA VAI SER', 540, 380, 64, { a: h1, w: 900, sp: 12 }); spaced('A ÚLTIMA VEZ', 540, 475, 68, { a: h1 * prog(t, 0.45, 0.8), w: 900, sp: 12, color: RED }); }
      // HEADLINE
      const dim = prog(t, 12.85, 13.2) * (1 - prog(t, 16.2, 16.6)); if (dim > 0) { ga(0.9 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['VOCÊ NÃO', WHITE], ['VAI SABER', WHITE], ['QUE FOI A', WHITE], ['ÚLTIMA VEZ.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; txt(s, 540, 660 + i * 150 + (i >= 2 ? 60 : 0), i === 3 ? 116 : 126, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); });
        const ck = dim; ctx.save(); ga(0.5 * ck); ctx.translate(540, 1420); ctx.strokeStyle = WHITE; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 60, 0, TAU); ctx.stroke(); ctx.lineCap = 'round'; ctx.rotate((t - 12.85) * 4.5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -48); ctx.stroke(); ctx.rotate(-(t - 12.85) * 4.5 * 0.92); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -30); ctx.stroke(); ctx.restore(); ga(1); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.62 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('ELE NÃO VAI', 540, 430, 124, { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('PEDIR COLO', 540, 570, 124, { a: prog(t, T.fin + 0.35, T.fin + 0.7), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.35, T.fin + 0.85))) });
        txt('PRA SEMPRE.', 540, 720, 118, { color: RED, a: prog(t, T.fin + 0.8, T.fin + 1.1), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.8, T.fin + 1.3))), glow: 'rgba(224,38,43,0.55)' });
        spaced('CARREGA HOJE. ABRAÇA HOJE.', 540, 860, 40, { a: prog(t, 26.6, 27.2), w: 800, sp: 7 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 27.4, 28.0), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
