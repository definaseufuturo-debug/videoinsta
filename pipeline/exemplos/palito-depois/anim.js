/*
 * "DEPOIS": o pai no celular e o filho crescendo (4, 8, 12, 18 anos). Aos 18, o pai larga o celular
 * e o filho, de mala na porta, responde "DEPOIS, PAI.". Bonequinhos de palito, 30 s, 9:16, sem narração.
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

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c', GLOW = '170,215,255';
  const FLOOR = 1350, SEAT = 1262, PX = 330, DOOR = 905;   // chão, assento do sofá, x do pai, x da porta
  // linha do tempo
  const T = {
    k4in: 0.8, k4at: 2.0, d1: 3.0, k4out: 4.0, s2: 5.2, k8in: 5.4, k8at: 6.4, d2: 7.2, k8out: 8.3, s3: 9.3, k12in: 9.5, k12at: 10.4, olha: 10.5, hum: 11.1, k12sit: 11.9,
    hl: [13.0, 13.5, 14.45, 14.95], s4: 16.6, phoneDown: 16.9, standUp: 17.5, toBall: 18.1, pick: 18.75, toKid: 19.0, offer: 20.1, depoisPai: 20.5, leave: 21.7, gone: 23.0, drop: 23.3, fin: 24.7,
  };
  const BALL0 = 600; // onde o filho de 4 anos deixa a bola

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário fixo: sala escura, sofá, porta ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(560, 1150, 50, 560, 1150, 900); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 260); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 260); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      // sofá (silhueta)
      g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3;
      const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.stroke(); };
      rr(130, 1150, 70, 200, 18); rr(150, SEAT, 300, 88, 16); rr(150, 1190, 60, 160, 14);
      // porta
      g.strokeStyle = '#4a4a52'; g.lineWidth = 6; g.strokeRect(DOOR, 1010, 150, FLOOR - 1010); g.fillStyle = '#141418'; g.fillRect(DOOR + 3, 1013, 144, FLOOR - 1016);
      g.fillStyle = '#5a5a62'; g.beginPath(); g.arc(DOOR + 22, 1190, 6, 0, TAU); g.fill();
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
    const STAND = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const SIT = { legs: [[1.5, 0.1], [1.42, 0.05]], bob: 0 };
    function phone(x, y, on, t) { ctx.save(); if (on > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, 170); g.addColorStop(0, `rgba(${GLOW},${0.38 * on})`); g.addColorStop(1, `rgba(${GLOW},0)`); ctx.fillStyle = g; ctx.fillRect(x - 170, y - 170, 340, 340); }
      ctx.fillStyle = on > 0 ? `rgba(220,240,255,${0.5 + 0.5 * on})` : '#555'; ctx.beginPath(); ctx.roundRect(x - 9, y - 15, 18, 30, 4); ctx.fill(); ctx.restore(); }
    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 52, w = tw(s, size) + 64, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      if (o.parts) { let cx = -tw(s, size) / 2; for (const [p, col] of o.parts) { const pw = tw(p, size); txt(p, cx + pw / 2, 3, size, { color: col }); cx += pw; } } else txt(s, 0, 3, size, { color: o.color || RED });
      ctx.restore(); ga(1); }
    function ball(x, y, r = 22) { ctx.save(); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.5)'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r * 0.65, -0.6, 1.2); ctx.stroke(); ctx.restore(); }
    function drawing(x, y, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = '#f6f2e8'; ctx.fillRect(-40, -30, 80, 60); ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(24, -14, 8, 0, TAU); ctx.stroke(); // sol
      ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(-26, 20); ctx.lineTo(-26, -2); ctx.lineTo(-14, -12); ctx.lineTo(-2, -2); ctx.lineTo(-2, 20); ctx.stroke(); // casinha
      for (const [hx, sz] of [[10, 1], [22, 0.7]]) { ctx.beginPath(); ctx.arc(hx, 2, 4 * sz, 0, TAU); ctx.moveTo(hx, 6); ctx.lineTo(hx, 16); ctx.stroke(); } ctx.restore(); }
    function suitcase(x, y) { ctx.save(); ctx.fillStyle = '#6b6b74'; ctx.beginPath(); ctx.roundRect(x - 34, y - 62, 68, 62, 8); ctx.fill(); ctx.strokeStyle = '#9a9aa4'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 12, y - 62); ctx.lineTo(x - 12, y - 76); ctx.lineTo(x + 12, y - 76); ctx.lineTo(x + 12, y - 62); ctx.stroke(); ctx.restore(); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 620, 48, { w: 900, sp: 12 }); ctx.fillStyle = RED; ctx.fillRect(465, 664, 150, 5); ctx.restore(); ga(1); }

    // ---------- personagens ----------
    function parent(t) {
      const s = 1.2;
      if (t < T.standUp) { // sentado no celular (cabeça baixa)
        const down = sm(t, T.phoneDown, T.phoneDown + 0.5), on = 1 - sm(t, T.phoneDown + 0.2, T.phoneDown + 0.5);
        const raise = t > T.d1 - 0.25 && t < T.d1 + 1.0 ? sm(t, T.d1 - 0.25, T.d1) * (1 - sm(t, T.d1 + 0.7, T.d1 + 1.0)) : 0; // mão de "espera"
        const r = figure({ x: PX, y: SEAT + 92 * s - 2, s, lean: 0.32 - down * 0.25, headTilt: 0.55 - down * 0.5, ...SIT, arms: [[lerp(0.7, 0.35, down), lerp(-0.55, 0.4, down)], [lerp(0.6, -0.1, raise), lerp(-0.7, -2.6, raise)]] });
        if (on > 0) phone(r.hands[0][0] + 4, r.hands[0][1] - 6, on, t);
        else phone(PX + 70, SEAT - 6, 0, t);
        return r;
      }
      phone(PX + 70, SEAT - 6, 0, t);
      // levanta, vai até a bola, pega, vai até o filho
      const up = sm(t, T.standUp, T.toBall), xw = t < T.toBall ? PX + 20 : t < T.pick ? lerp(PX + 20, BALL0 - 50, sm(t, T.toBall, T.pick - 0.1)) : t < T.toKid ? BALL0 - 50 : lerp(BALL0 - 50, 715, sm(t, T.toKid, T.offer));
      const walking = (t > T.toBall && t < T.pick - 0.1) || (t > T.toKid && t < T.offer);
      const bend = sm(t, T.pick - 0.15, T.pick + 0.05) * (1 - sm(t, T.pick + 0.1, T.pick + 0.35));
      const offer = sm(t, T.offer, T.offer + 0.35), slump = sm(t, T.drop, T.drop + 0.6);
      const ph = t * 6;
      let arms = walking ? walkArms(ph, 0.8) : [[0.15, 0.25], [-0.1, 0.1]];
      if (t >= T.pick) arms = [[lerp(0.6, 1.35, offer) - slump * 1.0, lerp(0.9, 1.45, offer) - slump * 1.3], walking ? walkArms(ph, 0.8)[1] : [-0.1, 0.1]];
      const legs = up < 1 ? { legs: [[lerp(1.5, 0.1, up), lerp(0.1, 0.06, up)], [lerp(1.42, -0.1, up), lerp(0.05, -0.06, up)]], bob: 0 } : walking ? walkPose(ph, 0.9) : STAND;
      const yy = lerp(SEAT + 92 * s - 2, FLOOR, up);
      const r = figure({ x: xw, y: yy, s, lean: 0.1 + bend * 0.7 + slump * 0.35, headTilt: slump * 0.6, arms, ...legs });
      return r;
    }
    function kid(t, age) {
      if (age === 4) { if (t < T.k4in || t > T.k4out + 1.4) return; const s = 0.62, hr = 30;
        let x, dir, walking; if (t < T.k4at) { x = lerp(1120, 640, sm(t, T.k4in, T.k4at, x => x)); dir = -1; walking = true; } else if (t < T.k4out) { x = 640; dir = -1; walking = false; } else { x = lerp(640, 1150, prog(t, T.k4out, T.k4out + 1.3)); dir = 1; walking = true; }
        const ph = t * 9, sad = sm(t, T.d1 + 0.5, T.d1 + 0.9), tug = t > 2.75 && t < T.d1 + 0.2 ? Math.sin(t * 22) * 0.15 : 0;
        const arms = walking ? walkArms(ph) : t > 2.7 ? [[1.55 + tug, 1.6], [0.2 * (1 - sad), 0.1]] : [[0.4, -0.2], [0.3, -0.3]];
        figure({ x, y: FLOOR, s, hr, dir, lean: walking ? 0.12 : -0.05 + sad * 0.15, headTilt: sad * 0.6, arms, ...(walking ? walkPose(ph, 1.2) : STAND) });
        // bola: quica na mão até ficar triste e larga no chão
        if (t < T.d1 + 0.7) { const by = t < T.k4at ? FLOOR - 70 : FLOOR - 22 - Math.abs(Math.sin((t - T.k4at) * 6)) * 110; ball(x + (t < T.k4at ? -18 : -40), by, 18); }
        return; }
      if (age === 8) { if (t < T.k8in || t > T.k8out + 1.3) return; const s = 0.8, hr = 28;
        let x, dir, walking; if (t < T.k8at) { x = lerp(1120, 610, sm(t, T.k8in, T.k8at, x => x)); dir = -1; walking = true; } else if (t < T.k8out) { x = 610; dir = -1; walking = false; } else { x = lerp(610, 1150, prog(t, T.k8out, T.k8out + 1.2)); dir = 1; walking = true; }
        const ph = t * 8, lift = sm(t, T.k8at, T.k8at + 0.3), drop = sm(t, T.d2 + 0.6, T.d2 + 0.9), sad = drop;
        const arms = walking ? walkArms(ph) : [[lerp(0.3, 2.2, lift) - drop * 2.0, lerp(0.2, 2.5, lift) - drop * 2.2], [lerp(0.2, 2.1, lift) - drop * 2.0, lerp(0.1, 2.4, lift) - drop * 2.2]];
        const r = figure({ x, y: FLOOR, s, hr, dir, lean: walking ? 0.1 : -0.05 + sad * 0.15, headTilt: sad * 0.6, arms, ...(walking ? walkPose(ph) : STAND) });
        if (t < T.d2 + 0.6 && t > T.k8at) drawing((r.hands[0][0] + r.hands[1][0]) / 2, (r.hands[0][1] + r.hands[1][1]) / 2 - 20);
        return; }
      if (age === 12) { if (t < T.k12in || t > T.s4) return; const s = 0.95, hr = 26, X = 790;
        let x = t < T.k12at ? lerp(1120, X, sm(t, T.k12in, T.k12at, x => x)) : X; const walking = t < T.k12at, ph = t * 7;
        const wave = t > T.olha - 0.1 && t < T.hum + 0.3 ? Math.sin(t * 14) * 0.35 : 0, sit = sm(t, T.k12sit, T.k12sit + 0.5);
        if (sit <= 0) { figure({ x, y: FLOOR, s, hr, dir: -1, lean: walking ? 0.1 : 0, arms: walking ? walkArms(ph) : t > T.olha - 0.2 ? [[-2.7 + wave, -2.9 + wave], [0.2, 0.1]] : [[0.2, 0.1], [-0.1, 0]], ...(walking ? walkPose(ph) : STAND) }); return; }
        // senta no chão com o próprio celular
        const r = figure({ x: X + 10, y: lerp(FLOOR, FLOOR + 46 * s, sit), s, hr, dir: -1, lean: 0.25 * sit, headTilt: 0.5 * sit, legs: [[lerp(0.1, 1.5, sit), lerp(0.06, 1.5, sit)], [lerp(-0.1, 1.4, sit), lerp(-0.06, 1.45, sit)]], arms: [[0.7, -0.55], [0.6, -0.7]], bob: 0 });
        if (sit > 0.6) phone(r.hands[0][0] - 4, r.hands[0][1] - 6, sm(t, T.k12sit + 0.4, T.k12sit + 0.7), t);
        return; }
      if (age === 18) { if (t < T.s4 || t > T.gone + 0.2) return; const s = 1.18, hr = 23;
        const leaving = t > T.leave; const x = leaving ? lerp(DOOR + 20, DOOR + 120, sm(t, T.leave + 0.3, T.gone)) : DOOR + 20, ph = t * 6;
        const a = leaving ? 1 - sm(t, T.gone - 0.5, T.gone) : 1;
        if (!leaving || t < T.leave + 0.3) figure({ x, y: FLOOR, s, hr, dir: -1, a, arms: [[0.1, 0.1], [-0.15, -0.05]], ...STAND, headTilt: 0 });
        else figure({ x, y: FLOOR, s, hr, dir: 1, a, arms: [walkArms(ph)[0], [0.05, 0.05]], ...walkPose(ph) });
        suitcase(x + (leaving && t > T.leave + 0.3 ? 30 : -38), FLOOR); return; }
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    for (const tt of [0.4, 3.6, 6.0, 8.8, 11.6]) cue(tt, 'ping');           // notificações do celular
    for (let k = 0; k < 6; k++) cue(T.k4at + k * 0.52, 'bounce', { gain: 0.6 });
    cue(T.d1 + 0.75, 'bounce', { gain: 0.4 }); cue(T.d1, 'bubble'); cue(T.d2, 'bubble'); cue(T.hum, 'bubble'); cue(T.olha, 'bubble', { gain: 0.5 }); cue(T.d2 + 0.75, 'paper');
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 })); cue(12.7, 'tickstart'); cue(T.s4 - 0.1, 'tickstop');
    cue(T.phoneDown + 0.3, 'tap'); cue(T.pick, 'bounce', { gain: 0.3 }); cue(T.depoisPai, 'hit', { big: true }); cue(T.gone - 0.2, 'door'); cue(T.drop + 0.3, 'bounce', { gain: 0.5 }); cue(T.drop + 0.75, 'bounce', { gain: 0.3 }); cue(T.drop + 1.05, 'bounce', { gain: 0.15 });
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const z = 1.12 * (1 + 0.05 * sm(t, T.s4, 26)); ctx.save(); ctx.translate(540, 1330); ctx.scale(z, z); ctx.translate(-590, -1250); ctx.drawImage(bgc, 0, 0);
      // luz da porta abrindo quando o filho sai
      const dl = sm(t, T.leave + 0.2, T.leave + 0.6) * (1 - sm(t, T.gone - 0.3, T.gone)); if (dl > 0) { ctx.save(); ga(dl); ctx.fillStyle = '#f2efe6'; ctx.fillRect(DOOR + 3, 1013, 144, FLOOR - 1016); const g = ctx.createLinearGradient(DOOR, 0, DOOR - 400, 0); g.addColorStop(0, 'rgba(242,239,230,0.25)'); g.addColorStop(1, 'rgba(242,239,230,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(DOOR, 1013); ctx.lineTo(DOOR - 420, FLOOR + 200); ctx.lineTo(DOOR, FLOOR + 200); ctx.closePath(); ctx.fill(); ctx.restore(); ga(1); }
      // bola largada no chão (até o pai pegar) e desenho caído
      if (t > T.d1 + 0.7 && t < T.pick) ball(BALL0, FLOOR - 18, 18);
      if (t > T.d2 + 0.6) { const k = prog(t, T.d2 + 0.6, T.d2 + 1.0); drawing(lerp(600, 520, k), lerp(FLOOR - 120, FLOOR - 8, k * k), k * 1.4); }
      const p = parent(t);
      if (t >= T.pick && t < T.drop) { const h = p.hands[0]; ball(h[0] + 14, h[1] - 6, 18); }
      if (t >= T.drop) { const k = prog(t, T.drop, T.drop + 2.0); ball(lerp(745, 880, outC(k)), FLOOR - 18 - Math.abs(Math.sin(k * 9)) * 90 * (1 - k), 18); }
      kid(t, 4); kid(t, 8); kid(t, 12); kid(t, 18);
      // falas
      bubble('DEPOIS.', PX + 150, 1000, prog(t, T.d1 - 0.05, T.d1 + 0.15) * (1 - prog(t, T.d1 + 1.1, T.d1 + 1.3)), { tail: -1, tailDir: -1 });
      bubble('AGORA NÃO.', PX + 160, 1000, prog(t, T.d2 - 0.05, T.d2 + 0.15) * (1 - prog(t, T.d2 + 1.1, T.d2 + 1.3)), { tail: -1, tailDir: -1 });
      bubble('PAI, OLHA!', 790, 900, prog(t, T.olha - 0.05, T.olha + 0.15) * (1 - prog(t, T.hum + 0.1, T.hum + 0.3)), { size: 44, color: '#222', tail: 0.4, tailDir: 1 });
      bubble('HUM...', PX + 130, 1000, prog(t, T.hum + 0.2, T.hum + 0.4) * (1 - prog(t, T.hum + 1.0, T.hum + 1.2)), { color: '#555', tail: -1, tailDir: -1 });
      bubble('DEPOIS, PAI.', DOOR - 110, 880, prog(t, T.depoisPai - 0.05, T.depoisPai + 0.15) * (1 - prog(t, T.leave + 0.3, T.leave + 0.5)), { size: 56, parts: [['DEPOIS', RED], [', PAI.', '#222']], tail: 0.6, tailDir: 1 });
      ctx.restore();
      // idades
      const ag = [[0.6, T.s2 - 0.3, '4 ANOS'], [T.s2, T.s3 - 0.3, '8 ANOS'], [T.s3, 12.6, '12 ANOS'], [T.s4, T.fin - 0.4, '18 ANOS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.4) * (1 - prog(t, b, b + 0.3)));
      // gancho
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 4.6, 5.0)); if (h1 > 0) { spaced('ELE SÓ QUERIA', 540, 360, 62, { a: h1, w: 900, sp: 12 }); spaced('UM MINUTO SEU', 540, 450, 62, { a: h1 * prog(t, 0.7, 1.1), w: 900, sp: 12, color: RED }); }
      // HEADLINE
      const dim = prog(t, 12.6, 13.0) * (1 - prog(t, 16.2, 16.6)); if (dim > 0) { ga(0.82 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['VOCÊ DIZ', WHITE], ['"DEPOIS".', RED], ['ELE CRESCE', WHITE], ['AGORA.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; txt(s, 540, 640 + i * 150 + (i >= 2 ? 60 : 0), 122, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); });
        // relógio correndo
        const ck = dim; ctx.save(); ga(0.5 * ck); ctx.translate(540, 1420); ctx.strokeStyle = WHITE; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 60, 0, TAU); ctx.stroke(); ctx.lineCap = 'round'; ctx.rotate((t - 12.6) * 4.5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -48); ctx.stroke(); ctx.rotate(-(t - 12.6) * 4.5 * 0.92); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -30); ctx.stroke(); ctx.restore(); ga(1); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.6 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('O TEMPO', 540, 470, 128, { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('NÃO ESPERA', 540, 610, 128, { a: prog(t, T.fin + 0.35, T.fin + 0.7), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.35, T.fin + 0.85))) });
        txt('O SEU "DEPOIS".', 540, 760, 100, { color: RED, a: prog(t, T.fin + 0.8, T.fin + 1.1), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.8, T.fin + 1.3))), glow: 'rgba(224,38,43,0.55)' });
        spaced('LARGA O CELULAR. HOJE.', 540, 900, 40, { a: prog(t, 26.6, 27.2), w: 800, sp: 8 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1700, 38, { a: prog(t, 27.4, 28.0), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
