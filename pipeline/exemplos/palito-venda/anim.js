/*
 * "TIRE A VENDA": bonequinhos de palito vendados andam em fila e caem no buraco.
 * Um deles tira a venda, vê o abismo, corre até a beira e segura os outros. 30 s, 9:16, sem narração.
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
  const EDGE = 800, V = 130, HX = 735;            // beira do buraco, velocidade da fila, onde o herói segura
  const T_STOP = 8.2, T_RUN = 15.15, T_HOLD = 16.5;
  const ROWS = [{ y: 1290, s: 1.02, a: 0.38 }, { y: 1352, s: 1.25, a: 1 }], FR = 1;

  // ---------- fila ----------
  // cada andador: linha, instante de entrada (x = -120 em t0)
  const walkers = [];
  const GAP = [1.3, 1.12], OFF = [-6.9, -7.5];
  ROWS.forEach((r, ri) => { for (let i = 0; i < 40; i++) { const t0 = OFF[ri] + i * GAP[ri]; if (t0 > 22) break; walkers.push({ ri, t0, ph: i * 1.7 + ri }); } });
  // herói: na fila da frente; ninguém da fila da frente vem logo atrás dele (abre espaço)
  const HERO_X = 500, heroT0 = T_STOP - (HERO_X + 120) / V;
  for (const w of walkers) if (w.ri === FR && w.t0 > heroT0 - 0.45 && w.t0 < 10.8) w.skip = true;
  
  // quem já passou do ponto do herói quando ele chega segue e cai; os outros param em fila atrás dele
  const freeX = (w, t) => -120 + V * (t - w.t0);
  ROWS.forEach((r, ri) => { let rank = 0; walkers.filter(w => w.ri === ri && !w.skip).sort((a, b) => a.t0 - b.t0).forEach(w => {
    if (freeX(w, T_HOLD) < HX - 55) { w.stopX = HX - 70 * ROWS[ri].s - rank * 112 * ROWS[ri].s; rank++; w.rank = rank - 1; } }); });
  walkers.forEach(w => { if (w.stopX === undefined && !w.skip) w.tFall = w.t0 + (EDGE + 10 + 120) / V; });
  // quem tira a venda no fim (efeito dominó)
  const UNVEIL = [[1, 0, 20.6], [0, 0, 21.4], [1, 1, 22.2], [1, 2, 23.0]];
  UNVEIL.forEach(([ri, rk, t]) => { const w = walkers.find(w => w.ri === ri && w.rank === rk); if (w) w.tUnveil = t; });

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // fundo fixo
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(470, 1050, 50, 470, 1050, 950); sp.addColorStop(0, 'rgba(255,255,255,0.10)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      // chão (vista lateral) até a beira
      const FT = 1240, FB = 1450;
      const fg = g.createLinearGradient(0, FT, 0, FB); fg.addColorStop(0, '#2c2c31'); fg.addColorStop(1, '#151518'); g.fillStyle = fg; g.fillRect(0, FT, EDGE, FB - FT);
      g.fillStyle = '#3d3d44'; g.fillRect(0, FT, EDGE, 3);
      const jag = y => EDGE - 10 + ((y * 37) % 23) - 11 - (y - FB) * 0.08;
      const cg = g.createLinearGradient(0, FB, 0, 1900); cg.addColorStop(0, '#141417'); cg.addColorStop(1, 'rgba(10,10,12,0)'); g.fillStyle = cg;
      g.beginPath(); g.moveTo(0, FB); g.lineTo(EDGE, FB); for (let y = FB; y <= 1900; y += 30) g.lineTo(jag(y), y); g.lineTo(0, 1900); g.closePath(); g.fill();
      g.strokeStyle = '#4a4a52'; g.lineWidth = 3; g.beginPath(); g.moveTo(EDGE, FT); g.lineTo(EDGE, FB); for (let y = FB; y <= 1750; y += 30) g.lineTo(jag(y), y); g.stroke();
      const pg = g.createLinearGradient(EDGE, 0, W, 0); pg.addColorStop(0, 'rgba(0,0,0,0.9)'); pg.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = pg; g.fillRect(EDGE + 2, FT + 8, W - EDGE, H - FT);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho ----------
    // pose: ângulos a partir da vertical para baixo (positivo = para a frente / direita)
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s, dir = o.dir || 1; ctx.save(); ctx.translate(o.x, o.y); if (o.rot) { ctx.translate(0, -100 * s); ctx.rotate(o.rot); ctx.translate(0, 100 * s); } ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = o.col || WHITE; ctx.fillStyle = o.col || WHITE; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13;
      ctx.shadowColor = 'rgba(255,255,255,0.25)'; ctx.shadowBlur = 10;
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob;
      const hipX = 0, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      // pernas
      for (const [t, k] of o.legs) limb(hipX, hipY, t, k, 48, 46);
      // braços
      const hands = o.arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      // cabeça
      const hx = shX + Math.sin(lean) * 34, hy = shY - 34; ctx.beginPath(); ctx.arc(hx, hy, 23, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0;
      if (o.band) { ctx.fillStyle = RED; ctx.fillRect(hx - 24, hy - 9, 48, 14); const fl = Math.sin(o.ph * 3) * 6;
        ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(hx - 22, hy - 2); ctx.quadraticCurveTo(hx - 38, hy + 2 + fl, hx - 52, hy + 6 + fl); ctx.stroke(); ctx.beginPath(); ctx.moveTo(hx - 22, hy - 2); ctx.quadraticCurveTo(hx - 36, hy + 10 + fl * 0.6, hx - 46, hy + 18 + fl * 0.6); ctx.stroke(); }
      else if (o.eyes) { ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(hx + 9, hy - 4, 3.6, 0, TAU); ctx.arc(hx + 17, hy - 4, 3.6, 0, TAU); ctx.fill(); }
      ctx.restore(); ga(1);
      return { head: [o.x + dir * hx * s, o.y + hy * s], hands: hands.map(([x, y]) => [o.x + dir * x * s, o.y + y * s]) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const BLIND_ARMS = ph => [[1.05 + 0.06 * Math.sin(ph), 1.45], [0.85 + 0.06 * Math.sin(ph + 1), 1.3]];
    const STAND = { legs: [[0.12, 0.08], [-0.12, -0.08]], bob: 0 };
    const bands = []; // vendas caídas: {x0,y0,t0,floor}
    function fallenBand(x0, y0, t0, floorY, t) { if (t < t0) return; const k = clamp((t - t0) / 0.7); const x = x0 - 30 * k, y = lerp(y0, floorY, k * k); ctx.save(); ctx.translate(x, y); ctx.rotate(k * 1.2); ctx.fillStyle = RED; ctx.fillRect(-24, -6, 48, 12); ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-44, 10); ctx.stroke(); ctx.restore(); }

    // ---------- herói ----------
    function hero(t) {
      const s = ROWS[FR].s, y = ROWS[FR].y;
      if (t < T_STOP) { const x = -120 + V * (t - heroT0), ph = (t - heroT0) * 5.2; figure({ x, y, s, ph, band: true, arms: BLIND_ARMS(ph), ...walkPose(ph) }); return; }
      if (t < T_RUN) {
        const up = sm(t, 8.45, 8.95), pull = sm(t, 8.95, 9.35), back = sm(t, 9.4, 9.9);
        const look = sm(t, 9.9, 10.3);
        let arms; if (back < 1 && up > 0) arms = [[lerp(0.9, -2.7, up) + pull * 0.5 - back * 0.3, lerp(1.3, -2.9, up) + pull * 1.1], [lerp(0.8, 0.2, up) - back * 0.1, lerp(1.2, 0.3, up)]]; else if (up <= 0) arms = BLIND_ARMS(0); else arms = [[0.25 - look * 0.1, 0.4], [-0.2, -0.1]];
        // treme ao ver o buraco
        const sh = t > 10.2 && t < 14.5 ? Math.sin(t * 40) * 1.5 : 0;
        const r = figure({ x: HERO_X + sh, y, s, ph: t * 5, band: t < 9.2, eyes: t >= 9.2, lean: -0.06 * look, arms, ...STAND });
        fallenBand(HERO_X + 20, y - 230, 9.25, y - 6, t);
        const ek = sm(t, 10.0, 10.25, outBack); if (ek > 0 && t < 13.9) { txt('!', HERO_X + 10, y - 360, 100, { color: RED, scale: ek }); }
        return;
      }
      fallenBand(HERO_X + 20, y - 230, 9.25, y - 6, t);
      // corrida até a beira e segura a fila
      const run = sm(t, T_RUN, T_HOLD), x = lerp(HERO_X, HX + 22, run);
      if (t < T_HOLD) { const ph = (t - T_RUN) * 11; figure({ x, y, s, ph, eyes: true, lean: 0.25, arms: [[-0.7 * Math.sin(ph), -0.4], [0.7 * Math.sin(ph), 0.9]], ...walkPose(ph, 1.4) }); return; }
      // virado para a fila (esquerda), braços abertos, empurrando
      const push = Math.sin(Math.max(0, t - T_HOLD) * 3.2) * 0.04, hold = sm(t, T_HOLD, T_HOLD + 0.35, outBack);
      figure({ x: HX + 22, y, s, dir: -1, ph: 0, eyes: true, lean: -0.12 + push, arms: [[lerp(0.6, 1.62, hold), lerp(0.9, 1.75, hold)], [lerp(0.4, 1.35, hold), lerp(0.6, 1.5, hold)]], legs: [[0.35, 0.2], [-0.32, -0.25]], bob: 0 });
    }

    // ---------- andadores ----------
    function walker(w, t) {
      const R = ROWS[w.ri]; let x = freeX(w, t); if (x < -140) return;
      const ph = (t - w.t0) * 5.2 + w.ph;
      if (w.stopX !== undefined && x >= w.stopX) { // parou na fila atrás do herói
        const tArr = w.t0 + (w.stopX + 120) / V, bump = Math.exp(-(t - tArr) * 6) * Math.sin((t - tArr) * 18) * 6;
        x = w.stopX - Math.max(0, bump);
        const un = w.tUnveil, up = un ? sm(t, un - 0.5, un) : 0, down = un ? sm(t, un + 0.25, un + 0.7) : 0;
        const arms = up > 0 ? [[lerp(1.0, -2.6, up) + down * 2.9, lerp(1.4, -2.8, up) + down * 3.0], [0.85 - up * 0.6, 1.2 - up * 0.8]] : BLIND_ARMS(0.3);
        const r = figure({ x, y: R.y, s: R.s, a: R.a, ph: t * 3 + w.ph, band: !un || t < un, eyes: un && t >= un, arms, ...STAND, lean: un && t > un ? -0.05 : 0.04 });
        if (un) fallenBand(w.stopX + 20 * R.s, R.y - 230 * R.s, un, R.y - 4, t);
        return;
      }
      if (w.tFall !== undefined && t > w.tFall) { // caindo
        const dt = t - w.tFall; const fx = EDGE + 10 + V * 0.55 * dt, fy = R.y + 0.5 * 2600 * dt * dt; if (fy > H + 300) return;
        figure({ x: fx, y: fy, s: R.s, a: R.a * (1 - clamp(dt / 1.1)), ph, rot: dt * 2.6, band: true, arms: [[-2.4 + Math.sin(dt * 20) * 0.4, -2.6], [-2.0 + Math.cos(dt * 18) * 0.4, -2.2]], legs: [[0.6, 0.2], [-0.3, -0.6]], bob: 0 });
        return;
      }
      figure({ x, y: R.y, s: R.s, a: R.a, ph, band: true, arms: BLIND_ARMS(ph), ...walkPose(ph) });
    }

    // ---------- eventos de som ----------
    const cues = []; const cue = (t, type, o = {}) => { if (t >= 0 && t < END) cues.push(Object.assign({ t: +t.toFixed(3), type }, o)); };
    walkers.forEach(w => { if (!w.skip && w.tFall !== undefined) cue(w.tFall, 'fall', { gain: ROWS[w.ri].a }); });
    cue(8.2, 'stop'); cue(9.25, 'cloth'); cue(10.0, 'shock');
    const HL = [11.0, 11.55, 12.45, 13.0]; HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(T_RUN - 0.6, 'riser', { dur: 0.7 }); cue(T_HOLD, 'hold'); walkers.forEach(w => { if (w.stopX !== undefined) { const ta = w.t0 + (w.stopX + 120) / V; if (ta > T_HOLD - 0.2 && ta < 26) cue(ta, 'bump', { gain: ROWS[w.ri].a }); } });
    walkers.forEach(w => { if (w.tUnveil) cue(w.tUnveil, 'cloth'); });
    cue(24.6, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1);
      // leve aproximação no fim
      const z = 1 + 0.06 * sm(t, 17, 30); ctx.drawImage(bgc, 0, 0);
      ctx.save(); ctx.translate(540, 1300); ctx.scale(z, z); ctx.translate(-540, -1300);
      // luz sobre o herói depois que ele tira a venda
      const lk = prog(t, 9.3, 10.2); if (lk > 0) { const hxp = t < T_RUN ? HERO_X : lerp(HERO_X, HX + 22, sm(t, T_RUN, T_HOLD)); const g = ctx.createRadialGradient(hxp, 1180, 20, hxp, 1180, 420); g.addColorStop(0, `rgba(255,240,220,${0.22 * lk})`); g.addColorStop(1, 'rgba(255,240,220,0)'); ctx.fillStyle = g; ctx.fillRect(hxp - 420, 760, 840, 840); }
      for (let ri = 0; ri < ROWS.length; ri++) { walkers.filter(w => w.ri === ri && !w.skip).forEach(w => walker(w, t)); if (ri === FR) hero(t); }
      ctx.restore();
      // ---- textos ----
      // gancho do início
      const h1 = prog(t, 0.2, 0.7) * (1 - prog(t, 7.6, 8.1));
      if (h1 > 0) { spaced('TODO MUNDO', 540, 330, 64, { a: h1, w: 900, sp: 14 }); spaced('ESTÁ SEGUINDO', 540, 420, 64, { a: h1 * prog(t, 0.9, 1.4), w: 900, sp: 14 }); spaced('A FILA', 540, 510, 64, { a: h1 * prog(t, 1.6, 2.1), w: 900, sp: 14, color: RED }); }
      const h2 = prog(t, 8.4, 8.8) * (1 - prog(t, 10.4, 10.7)); if (h2 > 0) spaced('ATÉ QUE UM PAROU', 540, 420, 48, { a: h2, w: 800, sp: 10 });
      // HEADLINE no meio
      const dim = prog(t, 10.6, 11.0) * (1 - prog(t, 14.6, 15.1)); if (dim > 0) { ga(0.8 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['TODO MUNDO', WHITE, 118], ['ESTÁ INDO.', WHITE, 118], ['NINGUÉM', WHITE, 118], ['ESTÁ VENDO.', RED, 118]];
        L.forEach(([s, col, sz], i) => { const p = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (p <= 0) return; const yy = 470 + i * 140 + (i >= 2 ? 60 : 0); txt(s, 540, yy, sz, { color: col, scale: lerp(1.6, 1, outC(p)), a: dim * clamp(p * 3), glow: i === 3 ? 'rgba(224,38,43,0.6)' : undefined }); });
        ga(dim); ctx.fillStyle = RED; ctx.fillRect(390, 715, 300 * sm(t, 12.1, 12.4), 6); ga(1); }
      const h3 = prog(t, 17.0, 17.5) * (1 - prog(t, 24.0, 24.4)); if (h3 > 0) { spaced('BASTA UM', 540, 360, 58, { a: h3, w: 900, sp: 12 }); spaced('ABRIR OS OLHOS', 540, 445, 58, { a: h3 * prog(t, 17.7, 18.2), w: 900, sp: 12, color: RED }); spaced('PRA SEGURAR OS OUTROS', 540, 530, 40, { a: h3 * prog(t, 18.6, 19.1), w: 800, sp: 8 }); }
      // final
      const f = prog(t, 24.4, 25.0); if (f > 0) { ga(0.55 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('TIRE A', 540, 470, 150, { a: f, scale: lerp(1.3, 1, outC(prog(t, 24.5, 25.0))) }); txt('VENDA.', 540, 630, 170, { color: RED, a: prog(t, 24.8, 25.2), scale: lerp(1.4, 1, outC(prog(t, 24.8, 25.25))), glow: 'rgba(224,38,43,0.6)' });
        spaced('E AJUDE ALGUÉM A TIRAR A DELE', 540, 780, 34, { a: prog(t, 25.8, 26.4), w: 800, sp: 6 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1700, 38, { a: prog(t, 26.8, 27.4), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
