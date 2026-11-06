/*
 * "MOTIVADO × DISCIPLINADO" (Mindloop: a mente em bonequinhos). Tela dividida: os dois correm no DIA 1 com uma
 * chama VERMELHA (a vontade) enorme na cabeça; a chama encolhe a cada dia e no DIA 7 a chuva apaga as duas.
 * Na manhã seguinte o despertador toca: o 1 puxa a coberta ("HOJE NÃO."), o 2 calça o tênis e sai na chuva.
 * Headline: "A VONTADE / VAI EMBORA. / O HÁBITO / FICA." Depois: o 1 recomeça toda segunda e para; o 2 corre
 * até o DIA 365 e a chama volta sozinha. Final: "NÃO ESPERE / TER VONTADE." 30 s, 9:16, sem narração.
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

  const WHITE = '#efefef', GREY = '#8d8d94', RED = '#e0262b', BG = '#0a0a0c';
  const FLOOR = 1450, MAT = 1335, S = 1.1, CXA = 270, CXB = 810;
  const DAYS = [[0, 1], [3.2, 2], [3.85, 3], [4.45, 4], [5.0, 5], [5.5, 6], [6.05, 7]];
  const RAIN0 = 6.15, OUT = 6.75, ROOM = 7.4, ALARM = 7.6, OFF = 8.7, HL = [11.65, 12.2, 13.1, 13.65], HL_OUT = 15.0;
  const P2 = 15.0, P2END = 22.65, FIN = 24.7;
  // fase 2: o 1 recomeça e para (loop); o 2 corre sempre
  const ALOOP = [{ say: 16.0, txt: [['SEGUNDA EU ', '#222'], ['VOLTO!', RED]], run0: 16.9, run1: 18.3 }, { say: 19.3, txt: [['AGORA ', '#222'], ['VAI!', RED]], run0: 19.95, run1: 21.2 }];
  const RAINB = [[15.0, 16.4], [17.9, 19.0], [20.4, 21.4]];

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    const fit = (s, size, max = 960, w = 900) => Math.min(size, size * max / tw(s, size, w));
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      for (const cx of [CXA, CXB]) { const sp = g.createRadialGradient(cx, 1250, 30, cx, 1250, 520); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(cx - 540, 0, 1080, H); }
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      return cv; })();
    const vig = (() => { const cv = mk(W, H), g = cv.getContext('2d'); const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); return cv; })();

    // ---------- bonequinho ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s || S, dir = o.dir || 1, hr = o.hr || 23, col = o.col || WHITE; ctx.save(); ctx.translate(o.x, o.y); if (o.rot) ctx.rotate(o.rot); ctx.scale(dir * s, s); ctx.globalAlpha *= clamp(o.a ?? 1);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = 'rgba(255,255,255,0.22)'; ctx.shadowBlur = 10;
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      const feet = o.legs.map(([a, b]) => limb(0, hipY, a, b, 48, 46));
      const hands = o.arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const tilt = o.headTilt || 0, hx = shX + Math.sin(lean + tilt) * (hr + 11), hy = shY - Math.cos(lean + tilt) * (hr + 11);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (o.eyes !== false) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill(); }
      if (o.shoes) for (const [fx, fy] of feet) { ctx.fillStyle = '#9a9aa4'; ctx.beginPath(); ctx.roundRect(fx - 10, fy - 12, 34, 18, 7); ctx.fill(); ctx.fillStyle = '#e8e8ec'; ctx.fillRect(fx - 10, fy + 2, 34, 5); }
      ctx.restore();
      const rx = (x, y) => [o.x + dir * x * s, o.y + y * s];
      return { head: rx(hx, hy), hands: hands.map(([x, y]) => rx(x, y)) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const runPose = (ph, k = 1) => { const a = 0.62 * Math.sin(ph) * k; return { legs: [[a, a - 0.9 * Math.max(0, Math.sin(ph + 1.2)) * k], [-a, -a - 0.9 * Math.max(0, Math.sin(ph + 1.2 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 12 * k, arms: [[0.8 * Math.sin(ph) * k, 0.8 * Math.sin(ph) * k + 1.5], [-0.8 * Math.sin(ph) * k, -0.8 * Math.sin(ph) * k + 1.5]], lean: 0.22 * k }; };
    const STANDP = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    function bubble(parts, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 42, full = parts.map(p => p[0]).join(''), w = tw(full, size) + 56, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ctx.globalAlpha *= clamp(k * 3);
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 24); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 28, h / 2 + 32); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      let cx = -tw(full, size) / 2; for (const [p, col] of parts) { const pw = tw(p, size); txt(p, cx + pw / 2, 3, size, { color: col }); cx += pw; } ctx.restore(); }

    // ---------- objetos ----------
    function flame(x, y, k, t, seed = 0) { if (k <= 0.02) return; ctx.save(); ctx.translate(x, y); const f = 1 + 0.08 * Math.sin(t * 17 + seed) + 0.05 * Math.sin(t * 29 + seed * 2); ctx.scale(k * 1.15, k * f * 1.15); ctx.shadowColor = 'rgba(224,38,43,0.85)'; ctx.shadowBlur = 34;
      const sw = Math.sin(t * 9 + seed) * 6; ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(sw, -78); ctx.bezierCurveTo(30, -40, 38, -12, 30, 6); ctx.bezierCurveTo(22, 26, -22, 26, -30, 6); ctx.bezierCurveTo(-38, -12, -22, -36, sw, -78); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#ff7a6e'; ctx.beginPath(); ctx.moveTo(sw * 0.6, -36); ctx.bezierCurveTo(14, -16, 16, 0, 10, 8); ctx.bezierCurveTo(4, 16, -8, 16, -12, 8); ctx.bezierCurveTo(-16, -2, -8, -20, sw * 0.6, -36); ctx.fill(); ctx.restore(); }
    function smoke(x, y, u) { if (u <= 0 || u >= 1) return; ctx.save(); for (let i = 0; i < 4; i++) { const v = clamp(u * 1.3 - i * 0.12); if (v <= 0) continue; ctx.globalAlpha = 0.45 * (1 - v); ctx.fillStyle = '#8a8a92'; ctx.beginPath(); ctx.arc(x + Math.sin(i * 2 + v * 4) * 14, y - v * 140 - i * 10, 10 + v * 22, 0, TAU); ctx.fill(); } ctx.restore(); }
    function rain(x0, x1, k, t, y0 = 0, y1 = H) { if (k <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip(); ctx.fillStyle = `rgba(0,0,12,${0.28 * k})`; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      ctx.strokeStyle = `rgba(190,205,230,${0.45 * k})`; ctx.lineWidth = 2.5; ctx.beginPath(); const n = Math.round((x1 - x0) * (y1 - y0) / 9000);
      for (let i = 0; i < n; i++) { const x = x0 + ((i * 137.5 + t * 90) % (x1 - x0 + 60)) - 30, y = y0 + ((i * 263.7 + t * 1700) % (y1 - y0 + 80)) - 40; ctx.moveTo(x, y); ctx.lineTo(x - 9, y + 38); } ctx.stroke(); ctx.restore(); }
    function track(cx, t, speed) { ctx.fillStyle = '#34343b'; for (let k = 0; k < 6; k++) { const x = cx - 270 + ((k * 110 - t * speed) % 660 + 660) % 660 - 60; ctx.fillRect(x, FLOOR + 50, 56, 6); ctx.fillRect(x + 30, FLOOR + 120, 56, 6); } }
    function bed(cx) { ctx.save(); ctx.fillStyle = '#26262c'; ctx.strokeStyle = '#3e3e46'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(cx - 215, MAT - 130, 20, FLOOR - MAT + 130, 6); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(cx - 200, MAT + 30, 370, 44, 6); ctx.fill(); ctx.stroke(); ctx.fillRect(cx + 150, MAT + 70, 16, FLOOR - MAT - 70);
      ctx.fillStyle = '#3a3a42'; ctx.beginPath(); ctx.roundRect(cx - 198, MAT, 366, 36, 10); ctx.fill(); ctx.fillStyle = '#5a5a63'; ctx.beginPath(); ctx.ellipse(cx - 150, MAT - 6, 44, 18, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    function windowR(cx, t, k) { ctx.save(); ctx.fillStyle = '#101018'; ctx.fillRect(cx - 80, 860, 160, 200); rain(cx - 80, cx + 80, k, t, 860, 1060); ctx.strokeStyle = '#4a4a52'; ctx.lineWidth = 6; ctx.strokeRect(cx - 80, 860, 160, 200); ctx.beginPath(); ctx.moveTo(cx, 860); ctx.lineTo(cx, 1060); ctx.moveTo(cx - 80, 960); ctx.lineTo(cx + 80, 960); ctx.stroke(); ctx.restore(); }
    function phone(x, y, on, t) { ctx.save(); const sh = on > 0 ? Math.sin(t * 60) * 3 : 0; if (on > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, 130); g.addColorStop(0, `rgba(170,215,255,${0.4 * on})`); g.addColorStop(1, 'rgba(170,215,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - 130, y - 130, 260, 260); }
      ctx.fillStyle = on > 0 ? '#dcecff' : '#555'; ctx.beginPath(); ctx.roundRect(x - 16 + sh, y - 7, 32, 14, 3); ctx.fill(); ctx.restore(); }
    function shoesFloor(x) { ctx.save(); for (const dx of [0, 40]) { ctx.fillStyle = '#9a9aa4'; ctx.beginPath(); ctx.roundRect(x + dx - 16, FLOOR - 18, 34, 18, 7); ctx.fill(); ctx.fillStyle = '#e8e8ec'; ctx.fillRect(x + dx - 16, FLOOR - 4, 34, 5); } ctx.restore(); }
    // deitado: quadril em (hx, hy), cabeça para a esquerda
    function lying(cx, cover, col = WHITE) { figure({ x: cx - 40, y: MAT - 10, rot: -Math.PI / 2, col, s: S * 0.95, eyes: cover < 0.5, legs: [[0.05, 0.02], [-0.05, -0.02]], arms: [[0.15, 0.1], [-0.1, 0]], bob: 92 });
      ctx.save(); ctx.fillStyle = '#5c5c66'; ctx.strokeStyle = '#74747e'; ctx.lineWidth = 3; const x0 = lerp(cx - 70, cx - 205, cover); ctx.beginPath(); ctx.roundRect(x0, MAT - 44, cx + 170 - x0, 50, 16); ctx.fill(); ctx.stroke(); ctx.restore(); }

    // ---------- estado de cada um ----------
    const flameP1 = t => t < OUT ? lerp(1, 0.42, sm(t, 3.2, 6.05)) : 0;
    function dayAt(t) { if (t < P2) { let d = 1; for (const [a, n] of DAYS) if (t >= a) d = n; return d; } return Math.round(8 + 357 * Math.pow(prog(t, P2 + 0.2, P2END - 0.3), 1.6)); }

    function half(cx, who, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(cx - 270, 0, 540, H); ctx.clip(); ctx.translate(cx, 1300); ctx.scale(1.2, 1.2); ctx.translate(-cx, -1300);
      const ph = t * 10.5;
      if (t < ROOM) { // correndo
        track(cx, t, 420 * lerp(1, 0.6, sm(t, 3.2, 6.0)));
        const k = lerp(1, 0.7, sm(t, 3.2, 6.0)), r = runPose(ph + (who ? 1.3 : 0), k);
        const stop = sm(t, OUT + 0.1, ROOM - 0.1), f = figure({ x: cx - 10, y: FLOOR, shoes: true, ...r, lean: r.lean * (1 - stop) + 0.25 * stop, headTilt: 0.4 * stop });
        flame(f.head[0], f.head[1] - 46, flameP1(t), t, who * 3); smoke(f.head[0], f.head[1] - 50, prog(t, OUT, OUT + 1.0));
        rain(cx - 270, cx + 270, prog(t, RAIN0, RAIN0 + 0.4), t);
      } else if (t < P2) { // quarto, manhã seguinte
        windowR(cx, t, 1); bed(cx);
        const alarm = t > ALARM && t < OFF ? 1 : 0;
        if (who === 0) { const cover = sm(t, 9.0, 9.5); lying(cx, cover); phone(cx - 105, MAT - 10, alarm, t);
          bubble([['HOJE ', '#222'], ['NÃO.', RED]], cx + 20, 1170, prog(t, 8.8, 8.95) * (1 - prog(t, 10.4, 10.55)), { tail: -0.4, tailDir: -1 }); }
        else { phone(cx - 105, MAT - 10, alarm, t);
          const up = prog(t, 8.95, 9.25);
          if (up < 1) { ctx.save(); ctx.globalAlpha = 1 - up; lying(cx, 0); ctx.restore(); }
          const ex = cx + 70;
          if (t < 9.95) shoesFloor(cx + 120);
          if (up > 0 && t < 10.25) { const tie = Math.sin(t * 18) * 0.06 * prog(t, 9.4, 9.5) * (1 - prog(t, 9.9, 10.0)); ctx.save(); ctx.globalAlpha = up; figure({ x: ex, y: MAT + 92 * S - 6, lean: lerp(0.1, 0.85, sm(t, 9.25, 9.45)) * (1 - sm(t, 10.0, 10.25)) + tie, headTilt: 0.4, legs: [[1.5, 0.1], [1.42, 0.05]], arms: [[0.55 + tie * 3, 0.3], [0.4, 0.2]], bob: 0, shoes: t > 9.95 }); ctx.restore(); }
          else if (t >= 10.25) { const st = sm(t, 10.25, 10.5), wk = t > 10.5, wx = ex + 30 + (wk ? (t - 10.5) * 280 : 0), wph = t * 8;
            figure({ x: wx, y: lerp(MAT + 92 * S - 6, FLOOR, st), legs: wk ? walkPose(wph).legs : [[lerp(1.5, 0.1, st), lerp(0.1, 0.06, st)], [lerp(1.42, -0.1, st), lerp(0.05, -0.06, st)]], arms: wk ? [[-0.4 * Math.sin(wph), 0.2], [0.4 * Math.sin(wph), 0.2]] : [[0.2, 0.1], [-0.1, 0]], bob: wk ? walkPose(wph).bob : 0, lean: 0.1, shoes: true }); }
        }
      } else { // fase 2
        if (who === 0) { // o 1: cama -> "segunda eu volto" -> corre um pouco -> cama
          const run = ALOOP.find(l => t >= l.run0 && t < l.run1);
          if (run) { track(cx, t, 380); const u = prog(t, run.run0, run.run1), r = runPose(ph, lerp(1, 0.55, u)); const f = figure({ x: cx - 10, y: FLOOR, shoes: true, ...r }); flame(f.head[0], f.head[1] - 46, lerp(1, 0.1, sm(t, run.run0 + 0.2, run.run1 - 0.1)), t, 5); }
          else { windowR(cx, t, 0.5); bed(cx); lying(cx, t > 22.2 ? sm(t, 22.2, 22.6) : 0, WHITE); phone(cx - 105, MAT - 10, 0, t);
            for (const l of ALOOP) { const k = prog(t, l.say, l.say + 0.15) * (1 - prog(t, l.run0 - 0.15, l.run0)); bubble(l.txt, cx + 20, 1150, k, { size: 32, tail: -0.4, tailDir: -1 }); flame(cx - 145, MAT - 52, sm(t, l.say + 0.2, l.say + 0.5, outBack) * (t < l.run0 ? 1 : 0), t, 7); } }
          const cut = ALOOP.some(l => Math.abs(t - l.run0) < 0.08 || Math.abs(t - l.run1) < 0.08); if (cut) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(cx - 270, 0, 540, H); }
        } else { // o 2 corre todo dia, com chuva ou sol, e a chama volta sozinha
          const rk = Math.max(...RAINB.map(([a, b]) => prog(t, a, a + 0.3) * (1 - prog(t, b - 0.3, b))));
          ctx.save(); ctx.globalAlpha = 0.5 * (1 - rk); ctx.fillStyle = '#cfcfd4'; ctx.beginPath(); ctx.arc(cx + 150, 860, 46, 0, TAU); ctx.fill(); ctx.restore();
          track(cx, t, 440); const r = runPose(ph + 1.3, 1.05); const f = figure({ x: cx - 10, y: FLOOR, shoes: true, ...r });
          flame(f.head[0], f.head[1] - 46, 1.05 * sm(t, 16.6, 22.4), t, 11); rain(cx - 270, cx + 270, rk, t);
        }
      }
      ctx.restore();
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => { if (t >= 0 && t < END) cues.push(Object.assign({ t: +t.toFixed(3), type }, o)); };
    for (let t = 0.2; t < OUT + 0.3; t += 0.29 + 0.1 * prog(t, 3.2, 6)) cue(t, 'step', { gain: lerp(1, 0.6, prog(t, 3.2, 6)) });
    DAYS.slice(1).forEach(([t]) => cue(t, 'tick')); cue(0.15, 'ignite');
    cue(RAIN0, 'rain0'); cue(RAIN0 + 0.15, 'thunder'); cue(OUT, 'hiss'); cue(ROOM, 'rainroom'); cue(ALARM, 'alarm'); cue(OFF, 'tap');
    cue(8.8, 'bubble'); cue(9.1, 'sigh'); cue(9.9, 'shoe'); cue(10.6, 'door');
    HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    for (let t = P2 + 0.1; t < P2END; t += 0.3) cue(t, 'step2', { gain: 0.5 });
    ALOOP.forEach(l => { cue(l.say, 'bubble'); cue(l.say + 0.25, 'ignite'); cue(l.run1, 'sigh'); });
    RAINB.forEach(([a, b]) => cue(a, 'rainB', { end: b })); cue(P2END, 'whoosh'); cue(FIN, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(bgc, 0, 0);
      const tt = t > 11.3 && t < P2 ? 11.3 : t;          // congela atrás da headline
      half(CXA, 0, Math.min(tt, END)); half(CXB, 1, Math.min(tt, END));
      ctx.fillStyle = '#2c2c33'; ctx.fillRect(538, 700, 4, 1000);
      ctx.drawImage(vig, 0, 0);
      // números dos dois
      const nk = prog(t, 0.6, 1.0) * (1 - prog(t, P2END - 0.2, P2END));
      if (nk > 0) { txt('1', CXA, 728, 48, { a: nk * 0.6, color: GREY }); txt('2', CXB, 728, 48, { a: nk * 0.6, color: GREY }); }
      // contador de dias
      const ck = (t < 11.1 ? prog(t, 0.4, 0.7) * (1 - prog(t, 10.9, 11.1)) : 0) + (t > P2 ? prog(t, P2 + 0.1, P2 + 0.4) * (1 - prog(t, P2END - 0.2, P2END)) : 0);
      if (ck > 0) { const d = dayAt(t); spaced('DIA ' + d, 540, 620, 52, { w: 900, sp: 12, a: ck }); ctx.globalAlpha = ck; ctx.fillStyle = RED; ctx.fillRect(470, 666, 140, 5); ctx.globalAlpha = 1; }
      // textos
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 2.9, 3.2)); if (h1 > 0) { spaced('OS DOIS COMEÇARAM', 540, 360, 54, { a: h1, w: 900, sp: 10 }); spaced('MUITO MOTIVADOS', 540, 445, 60, { a: h1 * prog(t, 0.6, 1.0), w: 900, sp: 12, color: RED }); }
      const h2 = prog(t, 3.3, 3.6) * (1 - prog(t, 6.0, 6.2)); if (h2 > 0) spaced('A VONTADE FOI DIMINUINDO...', 540, 400, 44, { a: h2, w: 900, sp: 7 });
      const h3 = prog(t, 6.25, 6.5) * (1 - prog(t, 8.3, 8.6)); if (h3 > 0) spaced('E CHOVEU.', 540, 400, 60, { a: h3, w: 900, sp: 12 });
      const h4 = prog(t, 9.5, 9.8) * (1 - prog(t, 10.9, 11.15)); if (h4 > 0) { spaced('UM FICOU.', 540, 360, 54, { a: h4, w: 900, sp: 10 }); spaced('O OUTRO FOI.', 540, 445, 54, { a: h4 * prog(t, 9.9, 10.2), w: 900, sp: 10, color: RED }); }
      const h5 = prog(t, P2 + 0.2, P2 + 0.6) * (1 - prog(t, P2END - 0.3, P2END)); if (h5 > 0) { spaced('UM ESPERA A VONTADE', 540, 360, 50, { a: h5, w: 900, sp: 8 }); spaced('O OUTRO VAI SEM ELA', 540, 445, 50, { a: h5 * prog(t, P2 + 0.9, P2 + 1.3), w: 900, sp: 8, color: RED }); }
      // rótulos finais de cada lado
      const lk = prog(t, P2END, P2END + 0.4) * (1 - prog(t, FIN, FIN + 0.3));
      if (lk > 0) { spaced('DIA 1', CXA, 600, 64, { a: lk, w: 900, sp: 10, color: GREY }); spaced('DE NOVO.', CXA, 680, 40, { a: lk * prog(t, P2END + 0.4, P2END + 0.8), w: 900, sp: 7, color: GREY });
        const rk = prog(t, P2END + 0.7, P2END + 1.1) * (1 - prog(t, FIN, FIN + 0.3)); spaced('DIA 365', CXB, 600, 64, { a: rk, w: 900, sp: 10 }); ctx.globalAlpha = rk; ctx.fillStyle = RED; ctx.fillRect(CXB - 80, 650, 160, 6); ctx.globalAlpha = 1; }
      // HEADLINE
      const dim = prog(t, 11.25, 11.6) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ctx.globalAlpha = 0.86 * dim; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
        const L = [['A VONTADE', WHITE], ['VAI EMBORA.', WHITE], ['O HÁBITO', WHITE], ['FICA.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; txt(s, 540, 650 + i * 150 + (i >= 2 ? 60 : 0), i === 3 ? 170 : fit(s, 124, 940), { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); });
        smoke(540, 1520, prog(t, 11.4, 13.0)); flame(540, 1500, 0.9 * (1 - sm(t, 11.4, 12.3)), t, 2); }
      // final
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ctx.globalAlpha = 0.72 * f; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
        txt('NÃO ESPERE', 540, 480, fit('NÃO ESPERE', 140), { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))) });
        txt('TER VONTADE.', 540, 640, fit('TER VONTADE.', 140), { color: RED, a: prog(t, FIN + 0.35, FIN + 0.7), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.35, FIN + 0.85))), glow: 'rgba(224,38,43,0.55)' });
        spaced('CALCE O TÊNIS MESMO ASSIM.', 540, 790, 38, { a: prog(t, FIN + 1.3, FIN + 1.9), w: 800, sp: 6 });
        spaced('MARCA QUEM COMEÇA TODA SEGUNDA', 540, 1700, 36, { a: prog(t, FIN + 2.3, FIN + 2.9), w: 900, sp: 7, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
