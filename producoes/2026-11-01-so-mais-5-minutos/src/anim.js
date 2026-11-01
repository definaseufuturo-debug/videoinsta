/*
 * "SÓ MAIS 5 MINUTOS" (Mindloop: a mente em bonequinhos, série pais e filhos). O pai no notebook responde
 * "só mais 5 minutos" ao filho de 4, 8 e 13 anos; o relógio vermelho gira. 25 anos depois, o pai liga e o filho,
 * no mesmo notebook, responde "só mais 5 minutos, pai". Headline: "ELE NÃO TE IGNOROU. ELE APRENDEU COM VOCÊ."
 * Virada: o relógio volta, o pai fecha o notebook ("AGORA, FILHO."), e 25 anos depois o filho volta.
 * 30 s, 9:16, sem narração. Elemento vermelho: o relógio de parede.
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
  const win = (t, a, b, f = 0.15) => prog(t, a, a + f) * (1 - prog(t, b, b + f));
  const mixc = (a, b, k) => { const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const x = p(a), y = p(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(',')})`; };

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c', OLD = '#9a9aa2', GLOW = '170,215,255';
  const FLOOR = 1400, SD = 1.35, CHX = 215, SEAT = FLOOR - 66, DESK0 = 300, DESK1 = 560, DTOP = SEAT - 30, DOOR = 900;
  const CLX = 205, CLY = FLOOR - 640, KX = 640;
  const T = {
    k4in: 0.6, k4at: 1.5, k4ask: 1.6, k4ans: 2.25, k4sit: 2.9, sp1: 2.9, k4out: 3.25,
    k8in: 3.4, k8at: 4.1, k8ask: 4.2, k8ans: 4.85, sp2: 5.4, k8out: 5.6,
    k13in: 6.15, k13at: 6.8, k13out: 7.3, sp3: 7.4,
    split: 8.1, call: 8.5, son: 9.6, end25: 11.6,
    hl: [12.2, 12.75, 13.7, 14.25], hlIn: 11.8, hlOut: 15.6,
    rew: 15.8, r4in: 16.4, r4ask: 16.9, close: 17.6, agora: 17.8, play: 19.1, fut: 21.4, sIn: 21.6, sAt: 22.6, vim: 22.8, fin: 24.4,
  };

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(480, 1150, 50, 480, 1150, 900); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      g.strokeStyle = '#4a4a52'; g.lineWidth = 6; g.strokeRect(DOOR, FLOOR - 330, 140, 330); g.fillStyle = '#121216'; g.fillRect(DOOR + 3, FLOOR - 327, 134, 324);
      g.fillStyle = '#5a5a62'; g.beginPath(); g.arc(DOOR + 22, FLOOR - 160, 6, 0, TAU); g.fill();
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s, dir = o.dir || 1, hr = o.hr || 23, col = o.col || WHITE; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = 'rgba(255,255,255,0.22)'; ctx.shadowBlur = 10;
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
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const STAND = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const SIT = { legs: [[1.5, 0.1], [1.42, 0.05]], bob: 0 };
    const TYPE = t => [[1.25 + Math.sin(t * 17) * 0.06, 1.62], [1.1 + Math.cos(t * 15) * 0.06, 1.5]];

    function bubble(parts, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 48, full = parts.map(p => p[0]).join(''), w = tw(full, size) + 60, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      let cx = -tw(full, size) / 2; for (const [p, col] of parts) { const pw = tw(p, size); txt(p, cx + pw / 2, 3, size, { color: col }); cx += pw; } ctx.restore(); ga(1); }
    const S5 = [['SÓ MAIS ', '#222'], ['5 MINUTOS', RED], ['.', '#222']];
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 640, 48, { w: 900, sp: 12 }); ctx.fillStyle = RED; ctx.fillRect(465, 684, 150, 5); ctx.restore(); ga(1); }

    // relógio vermelho: ângulo dos ponteiros acumula; gira rápido nos saltos de tempo e volta na virada
    const spins = [[T.sp1, 0.5, 1], [T.sp2, 0.5, 1], [T.sp3, 0.6, 1.4], [T.split - 0.3, 0.4, 2], [T.rew, 0.9, -5.4], [T.fut - 0.3, 0.5, 2]];
    const clockA = t => t * 0.15 + spins.reduce((a, [t0, d, n]) => a + sm(t, t0, t0 + d) * n * TAU * 2, 0);
    function clock(x, y, t, a = 1) { const A = clockA(t), fast = spins.some(([t0, d]) => t > t0 && t < t0 + d);
      ctx.save(); ga(a); ctx.translate(x, y); ctx.fillStyle = '#16161a'; ctx.beginPath(); ctx.arc(0, 0, 68, 0, TAU); ctx.fill();
      ctx.strokeStyle = RED; ctx.lineWidth = 11; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = fast ? 40 : 18; ctx.beginPath(); ctx.arc(0, 0, 68, 0, TAU); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#d8d8dc'; for (let i = 0; i < 12; i++) { const q = i / 12 * TAU; ctx.fillRect(Math.sin(q) * 50 - 2, -Math.cos(q) * 50 - 2, 5, 5); }
      ctx.strokeStyle = WHITE; ctx.lineCap = 'round'; ctx.lineWidth = 6; ctx.save(); ctx.rotate(A * 12); ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, -48); ctx.stroke(); ctx.restore();
      ctx.lineWidth = 8; ctx.save(); ctx.rotate(A); ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, -32); ctx.stroke(); ctx.restore();
      ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); ctx.restore(); ga(1);
      if (fast) { ctx.save(); ctx.strokeStyle = 'rgba(224,38,43,0.5)'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x, y, 86 + i * 14, A * 3 + i, A * 3 + i + 1.2); ctx.stroke(); } ctx.restore(); } }
    function desk(x0, x1, top, on, open = 1) {
      ctx.fillStyle = '#2e2e35'; ctx.fillRect(x0, top, x1 - x0, 14); ctx.fillRect(x0 + 14, top, 12, FLOOR - top); ctx.fillRect(x1 - 26, top, 12, FLOOR - top);
      const lx = x0 + 70; // notebook
      if (on > 0) { const g = ctx.createRadialGradient(lx + 20, top - 50, 5, lx + 20, top - 50, 230); g.addColorStop(0, `rgba(${GLOW},${0.38 * on})`); g.addColorStop(1, `rgba(${GLOW},0)`); ctx.fillStyle = g; ctx.fillRect(lx - 210, top - 280, 460, 460); }
      ctx.fillStyle = '#6a6a74'; ctx.fillRect(lx - 40, top - 8, 110, 8);
      ctx.save(); ctx.translate(lx + 66, top - 8); ctx.rotate(lerp(1.5, 0.2, open)); ctx.fillStyle = '#6a6a74'; ctx.fillRect(-4, -84, 8, 84); if (on > 0) { ctx.fillStyle = `rgba(215,236,255,${on})`; ctx.fillRect(-12, -80, 8, 74); } ctx.restore(); }
    function chair(x, seatY, col = '#2b2b33') { ctx.fillStyle = col; ctx.fillRect(x - 46, seatY, 92, 12); ctx.fillRect(x - 42, seatY, 9, FLOOR - seatY); ctx.fillRect(x + 33, seatY, 9, FLOOR - seatY); ctx.fillRect(x - 46, seatY - 120, 10, 130); }
    function toy(x, y, kind) { ctx.save(); ctx.translate(x, y); ctx.strokeStyle = '#cfcfd4'; ctx.fillStyle = '#cfcfd4'; ctx.lineWidth = 4;
      if (kind === 'pipa') { ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(22, 0); ctx.lineTo(0, 30); ctx.lineTo(-22, 0); ctx.closePath(); ctx.globalAlpha *= 0.85; ctx.fill(); ctx.beginPath(); ctx.moveTo(0, 30); ctx.quadraticCurveTo(10, 50, -4, 70); ctx.stroke(); }
      else { ctx.beginPath(); ctx.roundRect(-22, -14, 44, 18, 6); ctx.fill(); ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(-12, 6, 6, 0, TAU); ctx.arc(12, 6, 6, 0, TAU); ctx.fill(); }
      ctx.restore(); }
    function phoneAt(x, y, on) { ctx.save(); if (on > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, 140); g.addColorStop(0, `rgba(${GLOW},${0.3 * on})`); g.addColorStop(1, `rgba(${GLOW},0)`); ctx.fillStyle = g; ctx.fillRect(x - 140, y - 140, 280, 280); } ctx.fillStyle = on > 0 ? 'rgba(220,240,255,0.95)' : '#555'; ctx.beginPath(); ctx.roundRect(x - 9, y - 15, 18, 30, 4); ctx.fill(); ctx.restore(); }

    // pai sentado no notebook (cena padrão); old = cinza
    function dadAtDesk(t, o = {}) {
      const col = o.col || WHITE, raise = o.raise || 0, turn = o.turn || 0;
      chair(CHX, SEAT);
      const arms = o.arms || [[lerp(TYPE(t)[0][0], 0.2, raise), lerp(TYPE(t)[0][1], -2.4, raise)], TYPE(t)[1]];
      return figure({ x: CHX + 6, y: SEAT + 92 * SD - 26 * SD, s: SD, col, lean: o.lean ?? 0.22, headTilt: o.tilt ?? 0.3, ...SIT, arms, dir: 1 });
    }
    function kidWalk(t, t0, t1, x0, x1, s, hr, extra = {}) { const ph = t * 8, x = lerp(x0, x1, sm(t, t0, t1, x => x)); return figure({ x, y: FLOOR, s, hr, dir: x1 < x0 ? -1 : 1, lean: 0.1, arms: extra.arms || walkArms(ph), ...walkPose(ph), a: extra.a ?? 1 }); }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    for (let k = 0; k < 18; k++) cue(0.3 + k * 0.42, 'type', { gain: 0.5 });
    [T.k4ask, T.k8ask].forEach(x => cue(x, 'bubble', { gain: 0.7 })); [T.k4ans, T.k8ans].forEach(x => cue(x, 'bubble'));
    spins.forEach(([t0, d, n]) => cue(t0, n < 0 ? 'rewind' : 'spin', { dur: d }));
    cue(T.k8out + 0.4, 'door'); cue(T.k13out + 0.6, 'door'); cue(T.call, 'ring'); cue(T.son, 'bubble');
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(T.r4ask, 'bubble', { gain: 0.7 }); cue(T.close, 'close'); cue(T.agora, 'bubble'); cue(T.play, 'laugh'); cue(T.play + 0.9, 'laugh'); cue(T.vim, 'bubble');
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const age = t > T.split && t < T.rew ? 1 : t > T.fut ? 1 : 0, dCol = age ? OLD : WHITE;
      const ZZ = 1.18; ctx.save(); ctx.translate(565, 1520); ctx.scale(ZZ, ZZ); ctx.translate(-565, -FLOOR); ctx.drawImage(bgc, 0, 0);
      clock(CLX, CLY, t);
      if (t < T.split) {
        const on = 1;
        desk(DESK0, DESK1, DTOP, on);
        const look = Math.max(win(t, T.k4ans - 0.1, T.k4ans + 0.7, 0.2), win(t, T.k8ans - 0.1, T.k8ans + 0.7, 0.2));
        const r = dadAtDesk(t, { raise: look * 0.6, tilt: lerp(0.3, -0.05, look) });
        // 4 anos: puxa o braço, espera sentado no chão, some
        if (t > T.k4in && t < T.k4out + 0.3) { const s = 0.66, hr = 30;
          if (t < T.k4at) kidWalk(t, T.k4in, T.k4at, 980, KX, s, hr, { arms: [walkArms(t * 8)[0], [1.2, -0.6]] });
          else { const sit = sm(t, T.k4sit, T.k4sit + 0.3), a = 1 - prog(t, T.k4out, T.k4out + 0.25), tug = t < T.k4ans ? Math.sin(t * 20) * 0.15 : 0;
            const k = figure({ x: KX - 40 * sit, y: lerp(FLOOR, FLOOR + 43 * s, sit), s, hr, dir: -1, a, lean: 0.1 * sit, headTilt: 0.2 + sit * 0.4, legs: [[lerp(0.1, 1.5, sit), lerp(0.06, 0.4, sit)], [lerp(-0.1, 1.4, sit), lerp(-0.06, 0.3, sit)]], arms: sit > 0 ? [[0.9, 1.5], [0.7, 1.4]] : [[1.5 + tug, 1.7], [1.2, -0.6]], bob: 0 });
            ga(a); toy(k.hands[1][0] - 10, k.hands[1][1] - 6, 'carro'); ga(1); } }
        // 8 anos: com a pipa, depois sai pela porta
        if (t > T.k8in && t < T.k8out + 1.0) { const s = 0.82, hr = 28;
          if (t < T.k8at) { const k = kidWalk(t, T.k8in, T.k8at, 980, KX, s, hr, { arms: [walkArms(t * 8)[0], [1.6, 2.2]] }); toy(k.hands[1][0], k.hands[1][1] - 30, 'pipa'); }
          else if (t < T.k8out) { const sad = sm(t, T.k8ans + 0.4, T.k8ans + 0.8); const k = figure({ x: KX, y: FLOOR, s, hr, dir: -1, lean: sad * 0.12, headTilt: sad * 0.55, arms: [[lerp(2.2, 0.3, sad), lerp(2.6, 0.2, sad)], [lerp(1.8, 0.2, sad), lerp(2.4, 0.1, sad)]], ...STAND }); toy((k.hands[0][0] + k.hands[1][0]) / 2, Math.min(k.hands[0][1], k.hands[1][1]) - 30, 'pipa'); }
          else { const k = kidWalk(t, T.k8out, T.k8out + 1.0, KX, 1000, s, hr, { a: 1 - prog(t, T.k8out + 0.7, T.k8out + 1.0), arms: [walkArms(t * 8)[0], [0.2, 0.1]] }); } }
        // 13 anos: passa, olha, desiste, pega o próprio celular e sai
        if (t > T.k13in && t < T.k13out + 0.8) { const s = 1.02, hr = 25;
          if (t < T.k13at) kidWalk(t, T.k13in, T.k13at, 980, KX + 40, s, hr);
          else if (t < T.k13out) { const k = figure({ x: KX + 40, y: FLOOR, s, hr, dir: -1, headTilt: 0.05, arms: [[0.15, 0.1], [0.7, -0.6]], ...STAND }); phoneAt(k.hands[1][0] - 4, k.hands[1][1] - 8, sm(t, T.k13at + 0.2, T.k13at + 0.4)); }
          else { const k = kidWalk(t, T.k13out, T.k13out + 0.8, KX + 40, 1000, s, hr, { a: 1 - prog(t, T.k13out + 0.5, T.k13out + 0.8), arms: [[0.7, -0.6], walkArms(t * 8)[1]] }); phoneAt(k.hands[0][0] + 4, k.hands[0][1] - 8, 1); } }
        // falas
        bubble([['PAI, BRINCA COMIGO?', '#222']], 700, FLOOR - 330, win(t, T.k4ask, T.k4ans + 0.4), { size: 42, tail: -0.2, tailDir: -1 });
        bubble(S5, 380, FLOOR - 470, win(t, T.k4ans, T.k4sit + 0.35), { size: 46, tail: -0.5, tailDir: -1 });
        bubble([['PAI, VAMOS LÁ FORA?', '#222']], 700, FLOOR - 360, win(t, T.k8ask, T.k8ans + 0.4), { size: 42, tail: -0.2, tailDir: -1 });
        bubble(S5, 380, FLOOR - 470, win(t, T.k8ans, T.k8out), { size: 46, tail: -0.5, tailDir: -1 });
      } else if (t < T.rew) {
        // 25 anos depois: o pai (grisalho) liga; o filho, no mesmo notebook, responde
        const k = sm(t, T.split, T.split + 0.35);
        desk(DESK0, DESK1, DTOP, 0, 0); chair(CHX, SEAT);
        const r = figure({ x: 470, y: FLOOR, s: SD, col: OLD, lean: 0.12, headTilt: 0.15, arms: [[-2.3, -2.9], [0.2, 0.1]], ...STAND });
        phoneAt(r.hands[0][0] + 4, r.hands[0][1] + 4, 0.6);
        // o outro lugar (painel à direita)
        ga(k); ctx.fillStyle = '#0d0d10'; ctx.fillRect(650, FLOOR - 560, 430, 640); ctx.strokeStyle = 'rgba(224,38,43,0.6)'; ctx.setLineDash([12, 12]); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(650, FLOOR - 560); ctx.lineTo(650, FLOOR + 80); ctx.stroke(); ctx.setLineDash([]); ga(1);
        ctx.save(); ga(k); const SX = 760, SS = 1.15, sSeat = FLOOR - 56; chair(SX, sSeat); desk(840, 1060, sSeat - 26, 1);
        const sr = figure({ x: SX + 6, y: sSeat + 92 * SS - 26 * SS, s: SS, lean: 0.22, headTilt: 0.3, ...SIT, arms: [[-2.4, -2.9], TYPE(t)[1]], dir: 1 }); phoneAt(sr.hands[0][0] - 6, sr.hands[0][1] + 4, 0.5); ctx.restore(); ga(1);
        bubble([['FILHO, VEM ME VER?', '#222']], 420, FLOOR - 470, win(t, T.call, T.son - 0.15), { size: 44, tail: 0.2, tailDir: 1 });
        bubble([['SÓ MAIS ', '#222'], ['5 MINUTOS', RED], [', PAI.', '#222']], 660, FLOOR - 470, win(t, T.son, T.end25 + 0.6), { size: 40, tail: 0.5, tailDir: 1 });
      } else if (t < T.fut) {
        // virada: o relógio volta; o pai fecha o notebook e brinca
        const closeK = sm(t, T.close, T.close + 0.35);
        desk(DESK0, DESK1, DTOP, 1 - closeK, 1 - closeK);
        const up = sm(t, T.agora + 0.6, T.play);
        if (up < 0.01) dadAtDesk(t, { raise: closeK * 0.4, tilt: lerp(0.3, -0.1, closeK), arms: closeK > 0 ? [[lerp(1.3, 0.3, closeK), lerp(1.6, 0.2, closeK)], [lerp(1.2, 0.9, closeK), lerp(1.5, -0.4, closeK)]] : undefined });
        else { chair(CHX, SEAT); }
        const s = 0.66, hr = 30;
        if (t < T.play) {
          if (t < T.r4in + 0.4) kidWalk(t, T.r4in - 0.4, T.r4in + 0.4, 980, KX, s, hr, { a: prog(t, T.r4in - 0.4, T.r4in) , arms: [walkArms(t * 8)[0], [1.2, -0.6]] });
          else { const k = figure({ x: KX, y: FLOOR, s, hr, dir: -1, headTilt: 0.1, arms: [[1.5, 1.7], [1.2, -0.6]], ...STAND }); toy(k.hands[1][0] - 10, k.hands[1][1] - 6, 'carro'); }
          if (up > 0) figure({ x: lerp(CHX + 6, 420, up), y: lerp(SEAT + 66 * SD, FLOOR, up), s: SD, lean: 0.1, arms: [[0.3, 0.2], [-0.1, 0]], legs: [[lerp(1.5, 0.1, up), lerp(0.1, 0.06, up)], [lerp(1.42, -0.1, up), lerp(0.05, -0.06, up)]], bob: 0 });
        } else {
          // no chão: o carrinho vai e volta entre os dois
          const u = t - T.play, kn = sm(t, T.play, T.play + 0.35), cyc = (u * 0.9) % 2, cx = cyc < 1 ? lerp(600, 760, inOut(cyc)) : lerp(760, 600, inOut(cyc - 1));
          const pushD = Math.max(0, 1 - Math.abs(cx - 600) / 60), pushK = Math.max(0, 1 - Math.abs(cx - 760) / 60);
          figure({ x: 520, y: FLOOR + 44 * SD * kn, s: SD, lean: 0.15 + kn * 0.2, headTilt: 0.25, arms: [[lerp(0.3, 0.9 + pushD * 0.4, kn), lerp(0.2, 1.2 + pushD * 0.3, kn)], [-0.2, 0.1]], legs: [[lerp(0.1, 1.55, kn), lerp(0.06, 0, kn)], [lerp(-0.1, 0.05, kn), lerp(-0.06, -1.6, kn)]], bob: 0 });
          const hop = Math.abs(Math.sin(u * 5)) * 26 * (1 - pushK);
          figure({ x: 830, y: FLOOR - hop, s, hr, dir: -1, lean: 0.1 * pushK, headTilt: -0.1, arms: pushK > 0.3 ? [[1.2, 1.4], [1.0, 1.2]] : [[-2.6 + Math.sin(u * 10) * 0.2, -2.8], [-2.3, -2.7]], ...STAND });
          toy(cx, FLOOR - 12, 'carro');
        }
        bubble([['PAI, BRINCA COMIGO?', '#222']], 700, FLOOR - 330, win(t, T.r4ask, T.agora + 0.2), { size: 42, tail: -0.2, tailDir: -1 });
        bubble([['AGORA', RED], [', FILHO.', '#222']], 380, FLOOR - 470, win(t, T.agora + 0.25, T.play - 0.1), { size: 52, tail: -0.5, tailDir: -1 });
      } else {
        // 25 anos depois (outro final): o filho volta
        desk(DESK0, DESK1, DTOP, 0, 0);
        dadAtDesk(t, { col: OLD, arms: [[0.4, 0.3], [0.5, 0.4]], tilt: lerp(0.3, -0.1, sm(t, T.sAt - 0.4, T.sAt)), lean: 0.1 });
        const s = 1.2;
        if (t < T.sAt) kidWalk(t, T.sIn, T.sAt, 1000, 470, s, 23, { a: prog(t, T.sIn, T.sIn + 0.3) });
        else { const hug = sm(t, T.sAt + 0.1, T.sAt + 0.5); figure({ x: 470, y: FLOOR, s, dir: -1, lean: 0.15 * hug, headTilt: 0.1, arms: [[lerp(0.2, 1.2, hug), lerp(0.1, 1.9, hug)], [0.2, 0.1]], ...STAND }); }
        bubble([['PAI, ', '#222'], ['VIM TE VER.', RED]], 640, FLOOR - 470, win(t, T.vim, T.fin), { size: 46, tail: -0.3, tailDir: -1 });
      }
      ctx.restore();
      // idades
      const ag = [[0.5, T.k8in - 0.3, '4 ANOS'], [T.k8in - 0.1, T.k13in - 0.3, '8 ANOS'], [T.k13in - 0.1, T.split - 0.3, '13 ANOS'], [T.split, T.hlIn - 0.2, '25 ANOS DEPOIS'], [T.rew + 0.4, T.fut - 0.3, '4 ANOS'], [T.fut, T.fin - 0.4, '25 ANOS DEPOIS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.3) * (1 - prog(t, b, b + 0.3)));
      // gancho
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, T.split - 0.4, T.split)); if (h1 > 0) { spaced('5 MINUTOS', 540, 360, 74, { a: h1, w: 900, sp: 14, color: RED }); spaced('QUE VIRARAM 25 ANOS', 540, 455, 50, { a: h1 * prog(t, 0.7, 1.1), w: 900, sp: 10 }); }
      const h2 = prog(t, T.rew + 0.1, T.rew + 0.5) * (1 - prog(t, T.fut - 0.4, T.fut)); if (h2 > 0) { spaced('E SE A RESPOSTA', 540, 360, 56, { a: h2, w: 900, sp: 10 }); spaced('FOSSE OUTRA?', 540, 450, 56, { a: h2 * prog(t, T.rew + 0.5, T.rew + 0.9), w: 900, sp: 10, color: RED }); }
      // rebobinar
      if (t > T.rew && t < T.rew + 0.9) { ga(0.25 * Math.sin(prog(t, T.rew, T.rew + 0.9) * Math.PI)); ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) ctx.fillRect(0, ((t * 2400 + i * 330) % H), W, 6); ga(1); }
      // HEADLINE
      const dim = prog(t, T.hlIn, T.hlIn + 0.4) * (1 - prog(t, T.hlOut - 0.2, T.hlOut + 0.2)); if (dim > 0) { ga(0.86 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['ELE NÃO TE', WHITE, 108], ['IGNOROU.', WHITE, 128], ['ELE APRENDEU', WHITE, 104], ['COM VOCÊ.', RED, 132]];
        L.forEach(([s, col, sz], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; txt(s, 540, 650 + i * 150 + (i >= 2 ? 70 : 0), sz, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.86 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('ELE VAI TE DAR', 540, 470, 104, { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('O TEMPO QUE', 540, 610, 112, { a: prog(t, T.fin + 0.3, T.fin + 0.6), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.3, T.fin + 0.8))) });
        txt('VOCÊ DEU.', 540, 770, 160, { color: RED, a: prog(t, T.fin + 0.7, T.fin + 1.0), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.7, T.fin + 1.2))), glow: 'rgba(224,38,43,0.55)' });
        spaced('FECHA O NOTEBOOK.', 540, 940, 42, { a: prog(t, 26.0, 26.5), w: 800, sp: 8 });
        spaced('ELE ESTÁ TE CHAMANDO AGORA.', 540, 1005, 40, { a: prog(t, 26.5, 27.0), w: 800, sp: 7 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1700, 38, { a: prog(t, 27.4, 28.0), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
