/*
 * "DIPLOMA × HABILIDADE" (Mindloop: a mente em bonequinhos). Um junta papéis (diplomas e um troféu de papel);
 * o outro tenta consertar um guarda-chuva (vermelho) até conseguir. Chove: o papel derrete, o guarda-chuva segura.
 * Headline: "O PAPEL MOLHA. O QUE VOCÊ SABE NINGUÉM TIRA." Virada: ele divide o guarda-chuva, ensina, o conserto se espalha.
 * Final: "APRENDA A FAZER." 30 s, 9:16, sem narração.
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
  const mixc = (a, b, k) => { const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const x = p(a), y = p(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], clamp(k)))).join(',')})`; };
  const rnd = i => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

  const WHITE = '#efefef', GREY = '#8d8d94', RED = '#e0262b', BG = '#0a0a0c', PAPER = '#f3efe4', WETP = '#6f6f76', UMB = '#d6d6dc';
  const FLOOR = 1450, AX = 320, BX0 = 765, BX1 = 470, S = 1.35;
  const CERT = [0.9, 1.7, 2.45, 3.15, 3.8, 4.4, 4.95, 5.45, 5.9, 6.3, 6.7, 7.1];
  const POP = [2.3, 4.25, 6.05, 7.85];                          // B abre o guarda-chuva; os 3 primeiros viram do avesso
  const RAIN = 8.9, WET0 = 9.2, RAISE = 9.15;
  const HL = [11.3, 11.85, 12.8, 13.35], HL_IN = 10.9, HL_OUT = 15.0;
  const BW0 = 15.2, BW1 = 16.5, DROP = 16.0, GIVE = 17.3, AWORK = 17.9, AOPEN = 20.0, FIN = 23.8;
  const Z = 1.45, SCX = x => (x - 540) * Z + 540;
  const BACK = [{ x: 610, t0: 15.6, fix: 21.0 }, { x: 715, t0: 16.0, fix: 21.6 }, { x: 820, t0: 16.4, fix: 22.2 }], BY = 1335, BS = 0.95;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    const fit = (s, size, max, w = 900) => Math.min(size, size * max / tw(s, size, w));
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; if (tot > 980) return spaced(s, x, y, size * 980 / tot, Object.assign({}, o, { sp: sp * 980 / tot })); let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(540, 1200, 50, 540, 1200, 950); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho ----------
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
      const rx = (x, y) => [o.x + dir * x * s, o.y + y * s];
      return { head: rx(hx, hy), hands: hands.map(([x, y]) => rx(x, y)) };
    }
    const STAND = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };

    // ---------- guarda-chuva ----------
    // (hx,hy) = mão; k = aberto (0 fechado .. 1 aberto); inv = virado do avesso (0..1); L = haste da mão até o centro
    const covers = [];
    function umbrella(hx, hy, o) {
      const r = o.r || 140, k = clamp(o.k ?? 1), inv = clamp(o.inv || 0), L = o.L ?? 120, col = o.col || RED, tilt = o.tilt || 0;
      const w = lerp(r * 0.12, r, k), hd = lerp(r * 0.95, r * 0.58, k);
      const apexY = -L - hd * (1 - inv) + inv * 0, rimY = lerp(-L + (1 - k) * r * 0.85, -L - r * 0.62, inv);
      const shake = inv > 0.3 ? Math.sin(o.t * 37) * 3 * inv : 0;
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(tilt + shake * 0.01); ga(o.a ?? 1);
      ctx.strokeStyle = '#bdbdc4'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -Math.min(L, -apexY)); ctx.lineTo(0, 26); ctx.arc(-13, 26, 13, 0, Math.PI * 0.95); ctx.stroke();
      // copa
      ctx.fillStyle = col; if (col === RED) { ctx.shadowColor = 'rgba(224,38,43,0.55)'; ctx.shadowBlur = 22; }
      const cy = rimY + (apexY - rimY) * 0.14;
      ctx.beginPath(); ctx.moveTo(-w, rimY); ctx.quadraticCurveTo(-w * 0.95, apexY, 0, apexY); ctx.quadraticCurveTo(w * 0.95, apexY, w, rimY);
      const n = 5; for (let i = n; i > 0; i--) { const x0 = -w + (2 * w) * i / n, x1 = -w + (2 * w) * (i - 1) / n; ctx.quadraticCurveTo((x0 + x1) / 2, cy, x1, rimY); }
      ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 3; for (let i = 1; i < n; i++) { const x = -w + (2 * w) * i / n; ctx.beginPath(); ctx.moveTo(0, apexY); ctx.quadraticCurveTo(x * 0.85, lerp(apexY, rimY, 0.4), x, rimY); ctx.stroke(); }
      if (inv > 0.5) { ctx.strokeStyle = '#bdbdc4'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * 0.6, rimY + 4); ctx.lineTo(w * 1.15, rimY - 30); ctx.moveTo(-w * 0.2, rimY + 2); ctx.lineTo(-w * 0.35, rimY - 40); ctx.stroke(); }
      ctx.restore(); ga(1);
      if (k > 0.8 && inv < 0.25) covers.push({ x: hx + Math.sin(tilt) * L, y: hy + rimY, w: w * 0.95 });
    }

    // ---------- papéis ----------
    function sheet(x, y, wet, rot = 0, sc = 1, j = 0) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
      const sag = wet * (16 + (j % 3) * 5), w2 = 58;
      ctx.fillStyle = mixc(PAPER, WETP, wet); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-w2, -6 + sag); ctx.quadraticCurveTo(0, -6 - sag * 0.4, w2, -6 + sag); ctx.lineTo(w2, 6 + sag); ctx.quadraticCurveTo(0, 6 - sag * 0.4, -w2, 6 + sag); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = mixc('#a8a8b0', '#55555c', wet); ctx.beginPath(); ctx.arc(w2 - 16, sag * 0.6, 4, 0, TAU); ctx.fill();
      ctx.restore();
    }
    function trophy(x, y, wet, t) { // troféu de papel dobrado
      ctx.save(); ctx.translate(x, y); ctx.rotate(wet * 0.5 + (wet > 0 ? Math.sin(t * 3) * 0.03 : 0)); ctx.scale(1 + wet * 0.15, 1 - wet * 0.55);
      ctx.fillStyle = mixc(PAPER, WETP, wet); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.lineTo(16, -14); ctx.lineTo(8, -14); ctx.lineTo(6, -44); ctx.lineTo(34, -84); ctx.lineTo(-34, -84); ctx.lineTo(-6, -44); ctx.lineTo(-8, -14); ctx.lineTo(-16, -14); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-34, -84); ctx.quadraticCurveTo(-58, -76, -40, -56); ctx.moveTo(34, -84); ctx.quadraticCurveTo(58, -76, 40, -56); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -84); ctx.lineTo(0, -46); ctx.stroke();
      ctx.restore();
    }
    const nCert = t => CERT.filter(c => t >= c + 0.5).length;

    function rain(t, k) {
      if (k <= 0) return; ctx.save(); ctx.strokeStyle = 'rgba(200,215,235,1)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 170; i++) { const v = 1900 + 700 * rnd(i + 3), x = rnd(i) * 1240 - 80, y = ((t * v + rnd(i + 7) * 3000) % 1650) - 140; const xx = x - (y + 140) * 0.06;
        if (y > FLOOR) continue; if (covers.some(c => Math.abs(xx - c.x) < c.w && y > c.y)) continue;
        ga(k * (0.25 + 0.35 * rnd(i + 11))); ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx + 3, y - 44); ctx.stroke(); }
      // respingos
      for (let i = 0; i < 26; i++) { const ph = (t * 2.3 + rnd(i + 40)) % 1, x = rnd(i + 60) * 1080; if (covers.some(c => Math.abs(x - c.x) < c.w)) continue; ga(k * 0.5 * (1 - ph)); ctx.beginPath(); ctx.ellipse(x, FLOOR + 4, 6 + ph * 22, 2 + ph * 4, 0, 0, TAU); ctx.stroke(); }
      ctx.restore(); ga(1);
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    CERT.forEach((c, i) => cue(c + 0.5, 'paper', { n: i }));
    POP.forEach((p, i) => cue(p, i < 3 ? 'fail' : 'fix'));
    cue(RAIN, 'thunder'); HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(BW0, 'walk', { dur: BW1 - BW0 }); cue(DROP + 0.45, 'splat'); cue(GIVE, 'give'); cue(AOPEN, 'fix'); BACK.forEach(b => cue(b.fix, 'pop')); cue(FIN, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); covers.length = 0; ctx.save(); ctx.translate(540, 1440); ctx.scale(Z, Z); ctx.translate(-540, -FLOOR); ctx.drawImage(bgc, 0, 0);
      const rk = prog(t, RAIN, RAIN + 0.6), wet = sm(t, WET0, WET0 + 1.8);
      if (rk > 0) { ga(0.35 * rk); ctx.fillStyle = '#0b1a2e'; ctx.fillRect(-200, 0, W + 400, H); ga(1); }
      // poças
      if (rk > 0) { ctx.save(); ga(0.5 * rk); ctx.fillStyle = '#1d2a3a'; for (const [x, w] of [[180, 160], [560, 220], [930, 150]]) { ctx.beginPath(); ctx.ellipse(x, FLOOR + 30, w * rk, 10, 0, 0, TAU); ctx.fill(); } ctx.restore(); ga(1); }

      // ---- fila de trás (entra na chuva com guarda-chuvas virados) ----
      BACK.forEach((b, i) => { if (t < b.t0) return; const arr = b.t0 + 1.6, walking = t < arr, x = walking ? lerp(1180, b.x, sm(t, b.t0, arr, v => v)) : b.x, ph = t * 7 + i;
        const fixed = sm(t, b.fix, b.fix + 0.3, outBack), joy = sm(t, b.fix + 0.1, b.fix + 0.5);
        const r = figure({ x, y: BY, s: BS, a: 0.55, dir: -1, lean: walking ? 0.12 : 0.18 * (1 - joy), headTilt: 0.35 * (1 - joy), arms: [[2.75, 3.0], walking ? [0.45 * Math.sin(ph), 0.2] : [0.2, 0.1]], ...(walking ? walkPose(ph) : STAND) });
        umbrella(r.hands[0][0], r.hands[0][1], { r: 85, L: 70, k: 1, inv: 1 - fixed, col: UMB, a: 0.6, t: t + i, tilt: walking ? -0.15 : 0.05 * (1 - fixed) });
        if (fixed > 0 && t < b.fix + 1.2) { ga((1 - prog(t, b.fix + 0.4, b.fix + 1.2)) * 0.9); ctx.strokeStyle = WHITE; ctx.lineWidth = 4; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, rr = 70 + 50 * prog(t, b.fix, b.fix + 0.6); ctx.beginPath(); ctx.moveTo(r.hands[0][0] + Math.cos(a) * rr * 0.6, r.hands[0][1] - 110 + Math.sin(a) * rr * 0.4); ctx.lineTo(r.hands[0][0] + Math.cos(a) * rr, r.hands[0][1] - 110 + Math.sin(a) * rr * 0.6); ctx.stroke(); } ga(1); }
      });

      // ---- A: o dos papéis ----
      const n = nCert(t), aCol = mixc(WHITE, '#b9bcc4', wet);
      const dropped = t >= DROP, shelter = sm(t, BW1 - 0.3, BW1 + 0.4), shiver = t > WET0 && t < BW1 ? Math.sin(t * 38) * 1.6 : 0;
      const hunch = wet * (1 - shelter * 0.8);
      let aArms, aLegs = STAND;
      const work = t > AWORK && t < AOPEN, raiseA = sm(t, AOPEN + 0.2, AOPEN + 0.7), getU = sm(t, GIVE + 0.35, GIVE + 0.6);
      if (!dropped) aArms = [[1.25 + hunch * 0.15, 1.75 - hunch * 0.3], [1.15 + hunch * 0.15, 1.85 - hunch * 0.3]];
      else if (t < GIVE) aArms = [[0.35, 0.2], [-0.15, -0.05]];
      else if (t < AOPEN + 0.2) aArms = [[lerp(0.35, 1.2, getU), lerp(0.2, 1.6, getU)], work ? [0.9 + 0.35 * Math.sin(t * 15), 2.2] : [-0.15, -0.05]];
      else aArms = [[lerp(1.2, 2.85, raiseA), lerp(1.6, 3.0, raiseA)], [lerp(0.9, -0.1, raiseA), lerp(2.2, -0.05, raiseA)]];
      const aR = figure({ x: AX + shiver, y: FLOOR, s: S, col: aCol, lean: -0.08 * (n / 12) * (1 - wet) + hunch * 0.3, headTilt: hunch * 0.5 - (t > AOPEN + 0.3 ? 0.35 * raiseA : 0), arms: aArms, ...aLegs });
      // pilha de papéis nas mãos
      if (!dropped || t < DROP + 0.7) {
        const fallK = dropped ? sm(t, DROP, DROP + 0.5, x => x * x) : 0;
        const bx = (aR.hands[0][0] + aR.hands[1][0]) / 2 + 8, by0 = (aR.hands[0][1] + aR.hands[1][1]) / 2 - 4, by = lerp(by0, FLOOR - 10, fallK);
        const th = lerp(12, 5, wet), nn = Math.max(1, n);
        for (let j = 0; j < n; j++) sheet(bx + Math.sin(j * 2.1) * 4 * (1 - wet), by - j * th, wet, Math.sin(j * 1.7) * 0.03 + fallK * 0.3, 1, j);
        trophy(bx + wet * 10, by - nn * th - 4, wet, t);
      }
      if (t >= DROP + 0.5) { // bolo de papel molhado no chão
        ctx.save(); ctx.fillStyle = WETP; ctx.beginPath(); ctx.ellipse(AX + 85, FLOOR - 10, 62, 14, 0.05, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(AX + 70, FLOOR - 24, 30, 12, -0.3, 0, TAU); ctx.fill(); ctx.restore();
      }
      // pedaços caindo quando molha
      for (let i = 0; i < 7; i++) { const t0 = WET0 + 0.6 + i * 0.22, dt = t - t0; if (dt < 0 || dt > 0.9 || dropped) continue; const x = AX + 60 + rnd(i + 90) * 90, y = lerp(FLOOR - 230, FLOOR - 6, outC(dt / 0.6)); ga(1 - prog(dt, 0.6, 0.9)); sheet(x, y, 1, dt * 3 * (i % 2 ? 1 : -1), 0.4, i); ga(1); }
      // papéis voando até a pilha
      CERT.forEach((c0, i) => { const u = prog(t, c0, c0 + 0.5); if (u <= 0 || u >= 1) return; const tx = (aR.hands[0][0] + aR.hands[1][0]) / 2 + 8, ty = (aR.hands[0][1] + aR.hands[1][1]) / 2 - 4 - i * 12 - 30;
        const x = lerp(140, tx, u), y = lerp(1060, ty, u) - Math.sin(u * Math.PI) * 70; sheet(x, y, 0, (1 - u) * 5, 1, i); });
      // guarda-chuva de A (dado por B, fechado, consertado e aberto)
      if (t >= GIVE) {
        const gu = sm(t, GIVE, GIVE + 0.5);
        if (gu < 1) { const bh = [387, 1262]; const x = lerp(bh[0], aR.hands[0][0], gu), y = lerp(bh[1], aR.hands[0][1], gu); umbrella(x, y, { r: 120, L: 70, k: 0, col: UMB, t, tilt: lerp(0.6, 0, gu) }); }
        else { const op = sm(t, AOPEN, AOPEN + 0.3, outBack); umbrella(aR.hands[0][0], aR.hands[0][1], { r: 125, L: lerp(70, 105, raiseA), k: op, col: UMB, t, tilt: work ? Math.sin(t * 15) * 0.05 : 0.08 }); }
      }

      // ---- B: o do guarda-chuva ----
      const walking = t > BW0 && t < BW1, bx = t < BW0 ? BX0 : lerp(BX0, BX1, sm(t, BW0, BW1, v => v)), ph = (t - BW0) * 7;
      let k = 0, inv = 0, slump = 0, working = false;
      for (let i = 0; i < POP.length; i++) { const p = POP[i]; if (t >= p) { k = outBack(prog(t, p, p + 0.25)); if (i < 3) { inv = 1; slump = sm(t, p + 0.2, p + 0.45) * (1 - sm(t, p + 1.0, p + 1.3)); const cl = sm(t, p + 0.85, p + 1.1); k *= 1 - cl; if (cl >= 1) { k = 0; inv = 0; } } else inv = 0; } }
      for (let i = 0; i < POP.length; i++) { const a = i === 0 ? 0.7 : POP[i - 1] + 1.15; if (t > a && t < POP[i] - 0.1) working = true; }
      const up = sm(t, RAISE, RAISE + 0.5), give = t > GIVE - 0.6 && t < GIVE + 0.4 ? Math.sin(prog(t, GIVE - 0.6, GIVE + 0.4) * Math.PI) : 0;
      const shareTilt = sm(t, BW1 - 0.2, BW1 + 0.4) * (1 - sm(t, AOPEN + 0.3, AOPEN + 1.0));
      const holdArm = [lerp(1.2, 2.75, up) + shareTilt * 0.25, lerp(1.6, 3.0, up) + shareTilt * 0.2];
      const otherArm = working && t < POP[3] ? [0.95 + 0.35 * Math.sin(t * 15), 2.1] : walking ? [0.45 * Math.sin(ph), 0.2] : give > 0 ? [lerp(-0.1, 1.4, give), lerp(-0.05, 1.5, give)] : t > 7.9 && t < RAISE + 0.5 ? [lerp(0.95, 0.2, prog(t, 7.9, 8.3)), lerp(2.1, 0.1, prog(t, 7.9, 8.3))] : t > 21 && t < 23.6 ? [-2.0, -2.4] : [0.2, 0.1];
      const bR = figure({ x: bx, y: FLOOR, s: S, dir: -1, lean: walking ? 0.1 : slump * 0.3, headTilt: slump * 0.6 + (working ? 0.35 : 0) - up * 0.15, arms: [holdArm, otherArm], ...(walking ? walkPose(ph) : STAND) });
      umbrella(bR.hands[0][0], bR.hands[0][1], { r: 145, L: lerp(80, 110, up), k: t < POP[0] ? 0 : k, inv, col: RED, t, tilt: (1 - up) * 0.0 + shareTilt * -0.32 });
      // faíscas do conserto
      if (working && t < POP[3]) { const hx = bR.hands[1][0], hy = bR.hands[1][1]; ctx.save(); ctx.strokeStyle = '#ffd9a0'; ctx.lineWidth = 3; for (let q = 0; q < 3; q++) { const a = t * 20 + q * 2.1, rr = 14 + (t * 60 + q * 7) % 18; ga(0.7); ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * 6, hy + Math.sin(a) * 6); ctx.lineTo(hx + Math.cos(a) * rr, hy + Math.sin(a) * rr); ctx.stroke(); } ctx.restore(); ga(1); }
      if (t > AWORK && t < AOPEN) { const hx = aR.hands[1][0], hy = aR.hands[1][1]; ctx.save(); ctx.strokeStyle = '#ffd9a0'; ctx.lineWidth = 3; for (let q = 0; q < 3; q++) { const a = t * 20 + q * 2.1, rr = 14 + (t * 60 + q * 7) % 18; ga(0.7); ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * 6, hy + Math.sin(a) * 6); ctx.lineTo(hx + Math.cos(a) * rr, hy + Math.sin(a) * rr); ctx.stroke(); } ctx.restore(); ga(1); }

      rain(t, rk);
      ctx.restore();
      // relâmpago
      const fl = t > RAIN ? Math.exp(-(t - RAIN) * 7) + 0.6 * Math.exp(-Math.max(0, t - RAIN - 0.25) * 9) * (t > RAIN + 0.25 ? 1 : 0) : 0; if (fl > 0.01) { ga(0.45 * fl); ctx.fillStyle = '#dfe8ff'; ctx.fillRect(0, 0, W, H); ga(1); }

      // ---- rótulos sobre os dois ----
      const lab = prog(t, 1.3, 1.6) * (1 - prog(t, RAISE - 0.2, RAISE + 0.1));
      if (lab > 0) {
        spaced(`DIPLOMAS: ${n}`, SCX(AX) + 40, 720, 40, { a: lab, w: 900, sp: 6 });
        const tries = POP.filter(p => t >= p).length; spaced(tries >= 4 ? 'CONSERTOU' : `TENTATIVA ${Math.max(1, tries + (t > POP[0] - 1.6 ? 0 : 0))}`, SCX(BX0) - 60, 720, 40, { a: lab, w: 900, sp: 6, color: tries >= 4 ? RED : WHITE });
      }
      // gancho
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 8.2, 8.6)); if (h1 > 0) { spaced('UM JUNTOU PAPEL.', 540, 340, 58, { a: h1, w: 900, sp: 12 }); spaced('O OUTRO APRENDEU', 540, 430, 58, { a: h1 * prog(t, 0.7, 1.1), w: 900, sp: 12 }); spaced('A CONSERTAR.', 540, 520, 58, { a: h1 * prog(t, 0.7, 1.1), w: 900, sp: 12, color: RED }); }
      const h2 = prog(t, 8.7, 9.0) * (1 - prog(t, HL_IN - 0.3, HL_IN)); if (h2 > 0) spaced('ATÉ QUE CHOVEU.', 540, 430, 60, { a: h2, w: 900, sp: 12 });
      // HEADLINE
      const dim = prog(t, HL_IN, HL_IN + 0.4) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ga(0.84 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['O PAPEL', WHITE, 128], ['MOLHA.', WHITE, 128], ['O QUE VOCÊ SABE,', WHITE, 100], ['NINGUÉM TIRA.', RED, 118]];
        L.forEach(([s, col, sz], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; const size = fit(s, sz, 960); txt(s, 540, 640 + i * 150 + (i >= 2 ? 60 : 0), size, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // virada
      const h3 = prog(t, 16.8, 17.3) * (1 - prog(t, FIN - 0.5, FIN - 0.1)); if (h3 > 0) { spaced('QUEM SABE FAZER', 540, 340, 58, { a: h3, w: 900, sp: 12 }); spaced('NÃO FICA NA CHUVA', 540, 430, 58, { a: h3 * prog(t, 17.5, 18.0), w: 900, sp: 12, color: RED }); spaced('E AINDA TIRA OS OUTROS DELA', 540, 520, 38, { a: h3 * prog(t, 20.6, 21.1), w: 800, sp: 7 }); }
      // final
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.8 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('APRENDA', 540, 400, 150, { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))) });
        txt('A FAZER.', 540, 570, 170, { color: RED, a: prog(t, FIN + 0.35, FIN + 0.7), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.35, FIN + 0.85))), glow: 'rgba(224,38,43,0.55)' });
        spaced('DIPLOMA É PAPEL.', 540, 715, 40, { a: prog(t, 25.0, 25.5), w: 800, sp: 8 });
        spaced('HABILIDADE É GUARDA-CHUVA.', 540, 775, 40, { a: prog(t, 25.5, 26.0), w: 800, sp: 8 });
        spaced('MARCA QUEM APRENDEU NA PRÁTICA', 540, 1700, 36, { a: prog(t, 26.4, 27.0), w: 900, sp: 7, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
