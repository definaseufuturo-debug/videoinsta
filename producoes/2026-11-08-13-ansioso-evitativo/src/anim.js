/*
 * "ANSIOSO × EVITATIVO" (Mindloop: a mente em bonequinhos). Dois quartos, um em cima do outro, de madrugada.
 * Em cima, ele manda mensagem atrás de mensagem e encara o "digitando..."; embaixo, ela vira o celular pra baixo,
 * se vira de costas, tapa os ouvidos. O contador VERMELHO de notificações sobe (1 → 23): quanto mais ele cobra,
 * mais ela se fecha. Headline: "UM CORRE ATRÁS. O OUTRO FOGE. OS DOIS COM O MESMO MEDO."
 * Virada: ele para, manda UMA mensagem calma ("SEM PRESSA. TÔ AQUI.") e solta o celular; o contador cai pra 1, ela
 * vira o celular e responde "VAMOS CONVERSAR?". A parede entre os quartos some e os dois sentam lado a lado.
 * Final: "MENOS CHAT. MAIS CONVERSA." 30 s, 9:16, sem narração.
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
  // quarto de cima (ele) e de baixo (ela)
  const RA = { y0: 420, y1: 1045 }, FA = 1000, SEAT_A = 905, HX = 330, SA = 1.9;
  const RB = { y0: 1115, y1: 1740 }, FB = 1695, SEAT_B = 1605, SX = 470, SB = 1.9, TBX = 705, TBY = 1590; // mesinha e celular dela
  const DIV = 1080;
  // mensagens dele (envio) e o contador no celular dela (na chegada)
  const MSG = [0.35, 2.35, 3.75, 4.75, 5.5, 6.15, 6.75, 7.3, 7.8, 8.25, 8.65, 9.0, 9.35, 9.65];
  const CNT = [1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 22, 23];
  const FLY = 0.5;
  const SAYS = [[0.35, 1.9, 'OI :)'], [2.35, 3.5, 'TÁ AÍ?'], [3.75, 4.6, '???'], [4.75, 5.4, 'FIZ ALGO?'], [5.5, 6.1, 'RESPONDE'], [6.15, 6.7, 'OI??'], [6.75, 7.25, '...'], [7.3, 7.75, 'TÁ BRAVA?'], [7.8, 8.2, '?'], [8.25, 8.6, 'OI'], [8.65, 8.95, '??'], [9.0, 9.3, 'SÉRIO?'], [9.35, 9.6, '?'], [9.65, 10.0, '???']];
  const TYPING = [2.85, 3.45];                 // "digitando..." dela, que some
  const FLIP = 1.5, TURN = 4.9, EARS = 7.4, STANDA = 4.2, STOPA = 10.05;
  const HL = [11.6, 12.2, 13.05, 13.6], HL_OUT = 15.1;
  const T5 = 15.3, CALM_TYPE = 15.9, CALM_SEND = 16.5, CALM_ARR = 17.0, PUT = 17.4, HER_TURN = 17.7, HER_PICK = 18.3, HER_TYPE = 19.0, HER_SEND = 20.0, HER_ARR = 20.5, MERGE = 21.1, FIN = 23.4;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null, GM = 1;
    const ga = a => { ctx.globalAlpha = clamp(a) * GM; };
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; const mw = o.maxW || 1000; const fit = Math.min(1, mw / Math.max(1, tw(s, size, o.w || 900))); ctx.save(); ctx.translate(x, y); const sc = (o.scale ?? 1) * fit; ctx.scale(sc, sc); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; const k = Math.min(1, (o.maxW || 1000) / tot); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); let cx = -tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, 0, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); ctx.restore(); }

    // ---------- cenários ----------
    const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.stroke(); };
    const bg1 = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      for (const [R, F, cx] of [[RA, FA, 420], [RB, FB, 620]]) {
        g.save(); g.beginPath(); g.roundRect(40, R.y0, 1000, R.y1 - R.y0, 28); g.clip();
        g.fillStyle = '#101014'; g.fillRect(0, R.y0, W, R.y1 - R.y0);
        const sp = g.createRadialGradient(cx, F - 200, 30, cx, F - 200, 620); sp.addColorStop(0, 'rgba(255,255,255,0.07)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, R.y0, W, R.y1 - R.y0);
        const fg = g.createLinearGradient(0, F, 0, R.y1); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#141418'); g.fillStyle = fg; g.fillRect(0, F, W, R.y1 - F); g.fillStyle = '#3a3a40'; g.fillRect(0, F, W, 3);
        // janela com lua
        const wx = R === RA ? 820 : 120, wy = R.y0 + 60; g.fillStyle = '#16161c'; g.strokeStyle = '#34343c'; g.lineWidth = 5; g.fillRect(wx, wy, 170, 150); g.strokeRect(wx, wy, 170, 150); g.beginPath(); g.moveTo(wx + 85, wy); g.lineTo(wx + 85, wy + 150); g.moveTo(wx, wy + 75); g.lineTo(wx + 170, wy + 75); g.stroke();
        g.fillStyle = 'rgba(230,230,240,0.6)'; g.beginPath(); g.arc(wx + 125, wy + 38, 16, 0, TAU); g.fill(); g.fillStyle = '#16161c'; g.beginPath(); g.arc(wx + 133, wy + 32, 14, 0, TAU); g.fill();
        g.restore();
        g.strokeStyle = '#2c2c33'; g.lineWidth = 3; g.beginPath(); g.roundRect(40, R.y0, 1000, R.y1 - R.y0, 28); g.stroke();
      }
      g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3;
      rr(g, 120, SEAT_A, 290, 95, 14); rr(g, 100, SEAT_A - 70, 50, 165, 12);              // cama dele
      rr(g, SX - 250, SEAT_B, 300, 90, 16); rr(g, SX - 270, SEAT_B - 110, 56, 200, 16); // sofá dela
      g.fillStyle = '#1a1a1f'; rr(g, TBX - 70, TBY + 8, 140, 16, 5); g.fillRect(TBX - 55, TBY + 24, 10, FB - TBY - 24); g.fillRect(TBX + 45, TBY + 24, 10, FB - TBY - 24);
      return cv; })();
    const bg2 = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(540, 1250, 50, 540, 1250, 900); sp.addColorStop(0, 'rgba(255,240,220,0.10)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, 1500, 0, 1760); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, 1500, W, 260); g.fillStyle = '#3a3a40'; g.fillRect(0, 1500, W, 3);
      g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3; rr(g, 200, 1412, 560, 88, 16); rr(g, 180, 1300, 56, 200, 16); rr(g, 724, 1300, 56, 200, 16);
      g.fillStyle = '#1a1a1f'; rr(g, 820, 1418, 160, 16, 5); g.fillRect(838, 1434, 10, 66); g.fillRect(952, 1434, 10, 66);
      g.fillStyle = '#4a4a52'; for (const x of [870, 925]) { g.beginPath(); g.roundRect(x - 22, 1408, 44, 10, 3); g.fill(); }
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
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
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
      if (o.bun) { ctx.beginPath(); ctx.arc(hx - hr * 0.95, hy - hr * 0.55, hr * 0.48, 0, TAU); ctx.fill(); }
      ctx.shadowBlur = 0;
      ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill();
      ctx.restore(); ga(1);
      return { head: [o.x + dir * hx * s, o.y + hy * s], hands: hands.map(([x, y]) => [o.x + dir * x * s, o.y + y * s]) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const STAND = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const SIT = { legs: [[1.5, 0.1], [1.42, 0.05]], bob: 0 };
    function phoneHand(x, y, on) { ctx.save(); if (on > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, 170); g.addColorStop(0, `rgba(${GLOW},${0.4 * on})`); g.addColorStop(1, `rgba(${GLOW},0)`); ctx.fillStyle = g; ctx.fillRect(x - 170, y - 170, 340, 340); }
      ctx.fillStyle = on > 0 ? `rgba(220,240,255,${0.5 + 0.5 * on})` : '#555'; ctx.beginPath(); ctx.roundRect(x - 11, y - 18, 22, 36, 5); ctx.fill(); ctx.restore(); }
    // celular deitado numa superfície; up = 1 tela pra cima, 0 pra baixo
    function phoneFlat(x, y, up, buzz) { ctx.save(); ctx.translate(x + buzz, y); const k = Math.abs(Math.cos((1 - up) * Math.PI)); const on = up > 0.5 ? (up - 0.5) * 2 : 0;
      if (on > 0) { const g = ctx.createRadialGradient(0, -6, 4, 0, -6, 140); g.addColorStop(0, `rgba(${GLOW},${0.35 * on})`); g.addColorStop(1, `rgba(${GLOW},0)`); ctx.fillStyle = g; ctx.fillRect(-140, -146, 280, 280); }
      ctx.fillStyle = '#3b3b42'; ctx.beginPath(); ctx.roundRect(-26, -10 - 8 * (1 - k), 52, 10 + 8 * (1 - k), 3); ctx.fill();
      if (on > 0) { ctx.fillStyle = `rgba(220,240,255,${on})`; ctx.fillRect(-23, -12, 46, 4); }
      ctx.restore(); }
    function badge(x, y, n, k) { if (k <= 0 || n <= 0) return; const s = String(n), r = n >= 10 ? 34 : 28; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 26; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; ctx.restore(); txt(s, x, y + 2, 38 * k, { color: '#fff' }); }
    function bubble(parts, x, y, k, o = {}) { if (k <= 0) return; if (typeof parts === 'string') parts = [[parts, o.color || '#222']]; const size = o.size || 46, full = parts.map(p => p[0]).join(''), w = tw(full, size) + 60, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k) * (o.sc || 1), outBack(k) * (o.sc || 1)); ga(clamp(k * 3) * (o.a ?? 1));
      ctx.fillStyle = o.bg || '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      let cx = -tw(full, size) / 2; for (const [p, col] of parts) { const pw = tw(p, size); txt(p, cx + pw / 2, 3, size, { color: col }); cx += pw; } ctx.restore(); ga(1); }
    function envelope(x, y, k, a = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ga(a); ctx.fillStyle = '#f4f4f4'; ctx.shadowColor = 'rgba(255,255,255,0.6)'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.roundRect(-30, -20, 60, 40, 12); ctx.fill(); ctx.beginPath(); ctx.moveTo(-14, 18); ctx.lineTo(-24, 32); ctx.lineTo(0, 18); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#888'; for (const dx of [-14, 0, 14]) { ctx.beginPath(); ctx.arc(dx, 0, 4, 0, TAU); ctx.fill(); } ctx.restore(); ga(1); }
    function chip(s, y, k) { if (k <= 0) return; ctx.save(); ga(k); const w = tw(s, 40) + 70; ctx.fillStyle = '#0a0a0c'; ctx.strokeStyle = '#3a3a42'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(540 - w / 2, y - 34, w, 68, 34); ctx.fill(); ctx.stroke(); ctx.restore(); txt(s, 540, y + 2, 40, { a: k, w: 800 }); }
    const typingDots = (x, y, k, t) => { if (k <= 0) return; ctx.save(); ga(k); ctx.fillStyle = '#3a3a44'; ctx.beginPath(); ctx.roundRect(x - 160, y - 46, 320, 92, 36); ctx.fill(); ga(1); ctx.restore(); txt('digitando', x - 36, y, 40, { w: 700, color: '#cfd6e6', a: k }); for (let i = 0; i < 3; i++) { ctx.save(); ga(k * (0.4 + 0.6 * Math.max(0, Math.sin(t * 9 - i)))); ctx.fillStyle = '#cfd6e6'; ctx.beginPath(); ctx.arc(x + 86 + i * 20, y + 10, 6, 0, TAU); ctx.fill(); ctx.restore(); } ga(1); };

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    MSG.forEach((t, i) => { cue(t - 0.25, 'type', { dur: i < 4 ? 0.3 : 0.15 }); cue(t, 'send', { i }); cue(t + FLY, 'notif', { i }); });
    cue(FLIP + 0.1, 'flip'); cue(TYPING[0] - 0.4, 'flip', { gain: 0.5 }); cue(TYPING[0], 'herType'); cue(TYPING[1] + 0.2, 'flip');
    cue(TURN, 'cloth'); cue(EARS, 'cloth'); cue(STOPA, 'stop');
    for (let t = STANDA + 0.35; t < STOPA; t += 0.36 - 0.12 * prog(t, 4.5, 10)) cue(t, 'step');
    HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(T5 + 0.3, 'sigh'); cue(CALM_TYPE, 'type', { dur: 0.5 }); cue(CALM_SEND, 'send', { i: 99 }); cue(CALM_ARR, 'notifSoft'); cue(PUT, 'flip', { gain: 0.6 });
    cue(HER_PICK, 'flip', { gain: 0.6 }); cue(HER_TYPE, 'herType', { dur: 0.8 }); cue(HER_SEND, 'send', { i: 98 }); cue(HER_ARR, 'notifSoft'); cue(MERGE, 'whoosh'); cue(FIN, 'final');

    // ---------- personagens ----------
    const msgAt = t => { let n = 0; for (const x of MSG) if (t >= x + FLY) n++; return n; };
    function him(t) {
      if (t < STANDA || t >= T5) { // sentado no celular
        const calm = sm(t, PUT, PUT + 0.6), look = t > HER_ARR ? sm(t, HER_ARR, HER_ARR + 0.3) : 0;
        const lean = t < STANDA ? 0.32 + 0.1 * sm(t, 1.0, 3.8) : lerp(0.3, 0.05, calm) + look * 0.25;
        const arms = calm > 0 ? [[lerp(0.7, 0.15, calm) + look * 0.6, lerp(-0.55, 0.3, calm) + look * 0.9], [lerp(0.6, -0.1, calm), lerp(-0.7, 0.1, calm)]] : [[0.7, -0.55], [0.6, -0.7]];
        const r = figure({ x: HX, y: SEAT_A + 92 * SA - 2, s: SA, lean, headTilt: lerp(0.55, 0.1, calm) + look * 0.5, ...SIT, arms });
        if (calm <= 0) phoneHand(r.hands[0][0] + 4, r.hands[0][1] - 8, 1);
        else { const lit = t > HER_ARR ? 1 : 0; const px = lerp(r.hands[0][0] + 4, HX + 125, calm), py = lerp(r.hands[0][1] - 8, SEAT_A - 6, calm); if (calm < 1) phoneHand(px, py, 1 - calm); else phoneFlat(HX + 125, SEAT_A, lit, 0); }
        return r;
      }
      // em pé, andando de um lado pro outro com o celular na cara
      const up = sm(t, STANDA, STANDA + 0.35); const tt = t - STANDA - 0.35; let x = HX + 20, dir = 1, walking = false, ph = 0;
      if (tt > 0 && t < STOPA) { const v = 1 + 0.9 * prog(t, 5, 9.5); const ang = tt * 1.6 * v; x = 480 + Math.sin(ang - 1.2) * 230; dir = Math.cos(ang - 1.2) >= 0 ? 1 : -1; walking = true; ph = tt * 9 * v; }
      else if (t >= STOPA) { const ang = (STOPA - STANDA - 0.35) * 1.6 * (1 + 0.9 * prog(STOPA, 5, 9.5)); x = 480 + Math.sin(ang - 1.2) * 230; dir = 1; }
      const legs = up < 1 ? { legs: [[lerp(1.5, 0.1, up), lerp(0.1, 0.06, up)], [lerp(1.42, -0.1, up), lerp(0.05, -0.06, up)]], bob: 0 } : walking ? walkPose(ph, 0.9) : STAND;
      const stop = sm(t, STOPA, STOPA + 0.25);
      const r = figure({ x, y: lerp(SEAT_A + 92 * SA - 2, FA, up), s: SA, dir, lean: 0.15 - stop * 0.1, headTilt: 0.35 - stop * 0.2, ...legs, arms: [[0.55, 2.55], walking ? [0.4 * Math.sin(ph), 0.25] : [-0.1, 0.05]] });
      phoneHand(r.hands[0][0] + dir * 6, r.hands[0][1] - 10, 1);
      return r;
    }
    function her(t) {
      const bun = true;
      // fases: olha → vira o celular → braços cruzados → vira de costas → mãos nos ouvidos → (virada) volta, pega o celular, responde
      const reach = t < 3.6 ? Math.max(sm(t, FLIP - 0.35, FLIP) * (1 - sm(t, FLIP + 0.25, FLIP + 0.6)), sm(t, TYPING[0] - 0.6, TYPING[0] - 0.3) * (1 - sm(t, TYPING[1] + 0.2, TYPING[1] + 0.5))) : 0;
      const holding = t > TYPING[0] - 0.35 && t < TYPING[1] + 0.25;
      const away = sm(t, TURN, TURN + 0.4) * (1 - sm(t, HER_TURN, HER_TURN + 0.4));
      const ears = sm(t, EARS, EARS + 0.35) * (1 - sm(t, HER_TURN - 0.3, HER_TURN));
      const hold2 = t > HER_PICK && t < MERGE ? sm(t, HER_PICK - 0.3, HER_PICK) : 0;
      const dir = away > 0.5 ? -1 : 1;
      let arms;
      if (ears > 0) arms = [[lerp(0.4, 2.6, ears), lerp(1.9, -2.0, ears)], [lerp(0.3, -2.6, ears), lerp(2.0, 2.0, ears)]];
      else if (holding) arms = [[0.7, -0.55], [0.6, -0.7]];
      else if (hold2 > 0) arms = [[lerp(1.1, 0.7, hold2), lerp(1.3, -0.55, hold2)], [lerp(0.2, 0.6, hold2), lerp(0.1, -0.7, hold2)]];
      else if (reach > 0) arms = [[lerp(0.3, 1.25, reach), lerp(0.1, 1.45, reach)], [0.2, 0.1]];
      else if (t > FLIP + 0.5 && t < HER_TURN) arms = [[0.45, 1.95], [0.35, 2.05]];
      else arms = [[0.3, 0.1], [0.2, 0.0]];
      const lean = 0.18 + reach * 0.45 + (holding || hold2 > 0 ? 0.25 : 0) - (t > FLIP + 0.5 && t < HER_TURN && !holding ? 0.12 : 0) + ears * 0.35;
      const tilt = (holding || hold2 > 0 ? 0.5 : 0.15) + ears * 0.3 + (t < FLIP - 0.3 ? 0.3 * sm(t, 0.9, 1.1) : 0);
      const r = figure({ x: SX + (dir < 0 ? -10 : 0), y: SEAT_B + 92 * SB - 2, s: SB, dir, lean, headTilt: tilt, ...SIT, arms, bun });
      return { r, holding: holding || hold2 > 0.8 };
    }

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; GM = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const mg = sm(t, MERGE, MERGE + 0.7);
      if (mg < 1) {
        ga(1 - mg); ctx.drawImage(bg1, 0, 0); ga(1);
        ctx.save(); GM = 1 - mg; ga(1);
        // --- ele ---
        ctx.save(); ctx.beginPath(); ctx.rect(40, RA.y0, 1000, RA.y1 - RA.y0); ctx.clip();
        const a = him(t);
        ctx.restore();
        // --- ela ---
        ctx.save(); ctx.beginPath(); ctx.rect(40, RB.y0, 1000, RB.y1 - RB.y0); ctx.clip();
        const { r: b, holding } = her(t);
        // celular dela: na mesa (virado) ou na mão
        const n = msgAt(t); const lastArr = MSG.filter(x => x + FLY <= t).pop() ?? -9; const buzz = Math.sin(t * 90) * 4 * Math.exp(-(t - lastArr) * 7) * (t - lastArr < 0.5 ? 1 : 0);
        let up = t < FLIP ? 1 : t < FLIP + 0.3 ? 1 - prog(t, FLIP, FLIP + 0.3) : 0;
        if (holding) phoneHand(b.hands[0][0] + 4, b.hands[0][1] - 8, 1);
        else phoneFlat(TBX, TBY, up, buzz);
        // contador vermelho
        let shown = n > 0 ? CNT[n - 1] : 0; if (t > CALM_ARR) shown = 1;
        const pop = n > 0 ? 1 + 0.25 * Math.exp(-(t - lastArr) * 9) : 0; const bk = t > CALM_ARR - 0.15 && t < CALM_ARR ? 1 - prog(t, CALM_ARR - 0.15, CALM_ARR) : t >= CALM_ARR ? outBack(prog(t, CALM_ARR, CALM_ARR + 0.3)) : pop;
        const bx = holding ? b.hands[0][0] + 40 : TBX + 30, by = holding ? b.hands[0][1] - 50 : TBY - 58;
        if (!(t > HER_PICK + 0.4)) badge(bx, by, shown, bk);
        ctx.restore();
        // mensagens voando (de cima pra baixo; a resposta dela sobe)
        const fly = (t0, fromX, fromY, toX, toY) => { const u = prog(t, t0, t0 + FLY); if (u <= 0 || u >= 1) return; const e = inOut(u); const x = lerp(fromX, toX, e) + Math.sin(e * Math.PI) * 120, y = lerp(fromY, toY, e); envelope(x, y, 1 - 0.2 * Math.sin(e * Math.PI)); };
        MSG.forEach(t0 => fly(t0, a.hands[0][0] + 10, a.hands[0][1] - 40, TBX, TBY - 30));
        fly(CALM_SEND, a.hands[0][0] + 10, a.hands[0][1] - 40, TBX, TBY - 30);
        fly(HER_SEND, b.hands[0][0], b.hands[0][1] - 30, HX + 125, SEAT_A - 30);
        // falas dele
        for (const [t0, t1, s] of SAYS) { const k = prog(t, t0 - 0.05, t0 + 0.1) * (1 - prog(t, t1 - 0.1, t1)); const hx = a.head[0], above = a.head[1] - 120; bubble(s, clamp(hx + 120, 240, 840), above, k, { size: 44, tail: -0.7, tailDir: -1, color: s === '?' || s === '??' || s === '???' ? RED : '#222' }); }
        typingDots(760, 760, prog(t, TYPING[0], TYPING[0] + 0.1) * (1 - prog(t, TYPING[1], TYPING[1] + 0.12)), t);
        // "!" quando ele percebe
        const ex = prog(t, STOPA + 0.1, STOPA + 0.3) * (1 - prog(t, 11.0, 11.2)); if (ex > 0) txt('!', a.head[0], a.head[1] - 110, 110, { color: RED, scale: outBack(ex), glow: 'rgba(224,38,43,0.6)' });
        bubble([['SEM PRESSA.', '#222'], [' TÔ AQUI.', RED]], 600, a.head[1] - 110, prog(t, CALM_TYPE + 0.3, CALM_TYPE + 0.45) * (1 - prog(t, PUT + 0.6, PUT + 0.8)), { size: 44, tail: -0.7, tailDir: -1 });
        bubble([['VAMOS ', '#222'], ['CONVERSAR?', RED]], 640, b.head[1] - 120, prog(t, HER_TYPE + 0.6, HER_TYPE + 0.75) * (1 - prog(t, MERGE - 0.1, MERGE + 0.1)), { size: 46, tail: -0.5, tailDir: -1 });
        // divisória + relógio
        ctx.restore(); GM = 1; ga(1);
        const clocks = [[0, 3.3, '22:10'], [3.3, 6.5, '23:40'], [6.5, 9.0, '00:55'], [9.0, 11.2, '02:20'], [T5, MERGE, '02:21']];
        for (const [c0, c1, s] of clocks) chip(s, DIV, (1 - mg) * prog(t, c0, c0 + 0.15) * (1 - prog(t, c1 - 0.15, c1)) * (c0 === 0 ? 1 : 1));
      }
      if (mg > 0) { // os dois juntos, celulares virados na mesinha
        ga(mg); ctx.drawImage(bg2, 0, 0); ga(1);
        const s = 1.8, ph = t * 2;
        figure({ x: 380, y: 1412 + 92 * s - 2, s, a: mg, dir: 1, lean: 0.12, headTilt: -0.05 + 0.05 * Math.sin(ph), ...SIT, arms: [[0.9 + 0.25 * Math.max(0, Math.sin(t * 3)), 1.6], [0.3, 0.1]] });
        figure({ x: 690, y: 1412 + 92 * s - 2, s, a: mg, dir: -1, lean: 0.12, headTilt: -0.05, ...SIT, arms: [[0.4, 0.1], [0.9, 1.5]], bun: true });
        const tk = [[MERGE + 0.8, MERGE + 1.6, 440], [MERGE + 1.7, MERGE + 2.5, 600]];
        for (const [b0, b1, x] of tk) bubble('...', x, 1060, prog(t, b0, b0 + 0.12) * (1 - prog(t, b1 - 0.1, b1)) * mg, { size: 44, tail: x < 540 ? -0.3 : 0.3, tailDir: x < 540 ? -1 : 1, color: '#555' });
      }
      // gancho e rótulos
      const h1 = prog(t, 0.1, 0.4) * (1 - prog(t, 4.0, 4.3)); if (h1 > 0) { spaced('ELE MANDA MAIS.', 540, 250, 62, { a: h1, w: 900, sp: 10 }); spaced('ELA SOME MAIS.', 540, 340, 62, { a: h1 * prog(t, 0.7, 1.0), w: 900, sp: 10, color: RED }); }
      const h2 = prog(t, 4.3, 4.6) * (1 - prog(t, 10.9, 11.2)); if (h2 > 0) { spaced('QUANTO MAIS ELE COBRA,', 540, 250, 50, { a: h2, w: 900, sp: 7 }); spaced('MAIS ELA SE FECHA.', 540, 335, 50, { a: h2, w: 900, sp: 7, color: RED }); }
      const h3 = prog(t, T5 + 0.1, T5 + 0.4) * (1 - prog(t, MERGE - 0.2, MERGE + 0.1)); if (h3 > 0) { spaced('ATÉ QUE ELE PAROU', 540, 250, 56, { a: h3, w: 900, sp: 8 }); spaced('DE CORRER ATRÁS.', 540, 335, 56, { a: h3 * prog(t, T5 + 0.5, T5 + 0.8), w: 900, sp: 8, color: RED }); }
      const h4 = prog(t, MERGE + 0.5, MERGE + 0.8) * (1 - prog(t, FIN - 0.2, FIN)); if (h4 > 0) { spaced('E A CONVERSA', 540, 520, 60, { a: h4, w: 900, sp: 10 }); spaced('SAIU DO CELULAR.', 540, 610, 60, { a: h4, w: 900, sp: 10, color: RED }); }
      // HEADLINE
      const dim = prog(t, 11.2, 11.6) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ga(0.86 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['UM CORRE ATRÁS.', WHITE], ['O OUTRO FOGE.', WHITE], ['OS DOIS COM', WHITE], ['O MESMO MEDO.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; txt(s, 540, 650 + i * 150 + (i >= 2 ? 60 : 0), 112, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined, maxW: 980 }); }); }
      // final
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.7 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('MENOS CHAT.', 540, 480, 140, { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))), maxW: 990 });
        txt('MAIS CONVERSA.', 540, 650, 130, { color: RED, a: prog(t, FIN + 0.35, FIN + 0.7), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.35, FIN + 0.85))), glow: 'rgba(224,38,43,0.55)', maxW: 990 });
        spaced('MEDO NÃO SE RESOLVE POR MENSAGEM.', 540, 800, 36, { a: prog(t, 24.8, 25.4), w: 800, sp: 6, maxW: 980 });
        spaced('MARCA QUEM VIVE NO "DIGITANDO..."', 540, 1700, 36, { a: prog(t, 26.0, 26.6), w: 900, sp: 7, color: RED, maxW: 980 }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
