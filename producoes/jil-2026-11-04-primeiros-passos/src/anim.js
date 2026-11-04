/*
 * "PRIMEIROS PASSOS, ÚLTIMOS PASSOS": o pai segura a mão do filho no primeiro passo (1 ano), anda de mão dada
 * (6 anos), se despede dele (18 anos). 50 anos depois, o pai, velho e de bengala, estende a mão; o filho está no
 * celular (vermelho). Virada: o filho guarda o celular, segura a mão do pai e anda no passo dele. (Is 46:4)
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
  const FLOOR = 1390, FS = 1.32, LAMP = 175;
  // cenas
  const S1 = { a: 0.0, b: 4.35 }, S2 = { a: 4.55, b: 7.65 }, S3 = { a: 7.85, b: 10.7 }, S4 = { a: 10.9, b: 13.0 };
  const T = { hl: [13.3, 13.85, 14.6, 15.2], v: 16.6, look: 16.65, pocket: 17.05, walk: 17.45, reach: 18.45, hold: 18.75, wobble: 19.1, go: 19.7, fin: 24.6 };
  const OLDX = 470;      // onde o pai velho para
  const SONX = 860;      // onde o filho adulto fica no celular

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    const fit = (s, size, max = 960) => Math.min(size, size * max / tw(s, size));
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: caminho na praça ao entardecer, poste e árvore ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      let sd = 11; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${0.12 + rnd() * 0.3})`; g.beginPath(); g.arc(rnd() * W, 700 + rnd() * 480, 1 + rnd() * 1.5, 0, TAU); g.fill(); }
      const sp = g.createRadialGradient(LAMP + 60, FLOOR - 40, 30, LAMP + 60, FLOOR - 40, 700); sp.addColorStop(0, 'rgba(255,214,150,0.15)'); sp.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      // pedrinhas do caminho
      for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.beginPath(); g.ellipse(rnd() * W, FLOOR + 20 + rnd() * 90, 10 + rnd() * 14, 3 + rnd() * 3, 0, 0, TAU); g.fill(); }
      // poste
      g.fillStyle = '#2c2c33'; g.fillRect(LAMP - 7, 900, 14, FLOOR - 900); g.fillRect(LAMP - 7, 900, 70, 10); g.fillStyle = '#ffe2a8'; g.beginPath(); g.ellipse(LAMP + 58, 918, 22, 9, 0, 0, TAU); g.fill();
      const cone = g.createLinearGradient(0, 920, 0, FLOOR); cone.addColorStop(0, 'rgba(255,226,168,0.13)'); cone.addColorStop(1, 'rgba(255,226,168,0.02)'); g.fillStyle = cone; g.beginPath(); g.moveTo(LAMP + 40, 920); g.lineTo(LAMP + 76, 920); g.lineTo(LAMP + 380, FLOOR); g.lineTo(LAMP - 220, FLOOR); g.closePath(); g.fill();
      // árvore (silhueta) à direita
      g.fillStyle = '#1b1b20'; g.fillRect(990, 1000, 26, FLOOR - 1000); g.beginPath(); g.arc(1003, 960, 120, 0, TAU); g.arc(930, 1010, 80, 0, TAU); g.arc(1070, 1010, 90, 0, TAU); g.fill();
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho (com IK opcional para dar a mão) ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function ik(sx, sy, tx, ty, l1, l2, bend) { // ângulos (0 = para baixo, + = para frente)
      const dx = tx - sx, dy = ty - sy, d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.5), base = Math.atan2(dx, dy);
      const al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), a1 = base + bend * al;
      const ex = sx + Math.sin(a1) * l1, ey = sy + Math.cos(a1) * l1; return [a1, Math.atan2(tx - ex, ty - ey)];
    }
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
    const A_DOWN = [[0.15, 0.2], [-0.1, 0.1]], A_PHONE = [[0.15, 0.2], [0.45, 2.7]];
    const lerpA = (A, B, k) => A.map((p, i) => p.map((v, j) => lerp(v, B[i][j], k)));

    function phone(x, y, on) { ctx.save(); if (on > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, 150); g.addColorStop(0, `rgba(224,38,43,${0.42 * on})`); g.addColorStop(1, 'rgba(224,38,43,0)'); ctx.fillStyle = g; ctx.fillRect(x - 150, y - 150, 300, 300); }
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 14 * on; ctx.beginPath(); ctx.roundRect(x - 11, y - 18, 22, 36, 5); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = `rgba(255,220,220,${0.55 * on})`; ctx.fillRect(x - 7, y - 13, 14, 24); ctx.restore(); }
    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 50, w = tw(s, size) + 64, h = size * 1.75; ctx.save(); ctx.translate(x, y); const e = 1 + (1 - k) * 0.3; ctx.scale(e, e); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 640, 50, { w: 900, sp: 12 }); ctx.fillStyle = RED; ctx.fillRect(470, 686, 140, 5); ctx.restore(); ga(1); }
    function holdDot(x, y) { ctx.save(); ctx.fillStyle = WHITE; ctx.shadowColor = 'rgba(255,255,255,0.4)'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); ctx.restore(); }

    // ---------- 1 ano: primeiros passos, o pai curvado atrás segurando as duas mãos ----------
    function scene1(t) {
      const k = sm(t, 0.5, 4.3, lin), bx = lerp(500, 720, k), ph = t * 7.5;
      const wob = Math.sin(t * 5.3) * 0.12 + (t > 2.2 && t < 2.8 ? Math.sin((t - 2.2) * 16) * 0.22 * (1 - prog(t, 2.2, 2.8)) : 0);
      const pause = t > 2.2 && t < 2.8 ? 0.25 : 1;
      const kb = walkPose(ph, 0.8 * pause);
      // bebê primeiro (para saber onde estão os ombros)
      const bs = 0.62, by = FLOOR;
      const shx = bx + Math.sin(wob) * 66 * bs, shy = by + (-154 + kb.bob) * bs;
      const H1 = [shx - 16, shy - 40], H2 = [shx - 2, shy - 42];
      const fx = bx - 125, fp = walkPose(ph * 0.5, 0.5);
      figure({ x: fx, y: FLOOR, s: FS, dir: 1, lean: 0.62, headTilt: 0.55, legs: fp.legs, bob: fp.bob, arms: A_DOWN, reach: [[0, H1[0], H1[1], -1], [1, H2[0], H2[1], -1]] });
      figure({ x: bx, y: by, s: bs, hr: 31, dir: 1, lean: wob, headTilt: -0.1, legs: kb.legs, bob: kb.bob, arms: A_DOWN, reach: [[0, H1[0], H1[1], 1], [1, H2[0], H2[1], 1]] });
      holdDot(H1[0], H1[1]); holdDot(H2[0], H2[1]);
    }
    // ---------- 6 anos: de mão dada, depois ele solta e corre ----------
    function scene2(t) {
      const ks = 0.82, ph = t * 7, rel = 6.3;
      const walkK = sm(t, S2.a, rel, lin); let kx = lerp(420, 620, walkK), fx = kx - 110;
      if (t > rel) { kx = lerp(620, 1180, sm(t, rel, S2.b, x => x * x)); fx = 510 + 10 * sm(t, rel, rel + 0.6); }
      const fw = t < rel ? walkPose(t * 5, 0.8) : { legs: STANDL, bob: 0 };
      const kp = walkPose(t > rel ? t * 11 : ph, t > rel ? 1.25 : 1);
      const kshx = kx + Math.sin(0.08) * 66 * ks, kshy = FLOOR + (-154 + kp.bob) * ks, HP = [kshx - 52, kshy + 6];
      const together = t < rel;
      const wave = t > rel + 0.3 ? sm(t, rel + 0.3, rel + 0.6) : 0;
      const farm1 = together ? null : lerpA([[0.9, 0.9]], [[2.6, 3.0 + Math.sin(t * 14) * 0.3]], wave)[0];
      const f = figure({ x: fx, y: FLOOR, s: FS, dir: 1, lean: 0.08, headTilt: 0.25, legs: fw.legs, bob: fw.bob, arms: [farm1 || [0.5, 0.5], [-0.15, 0.05]], reach: together ? [[0, HP[0], HP[1], 1]] : null });
      figure({ x: kx, y: FLOOR, s: ks, hr: 28, dir: 1, lean: t > rel ? 0.2 : 0.08, headTilt: 0, legs: kp.legs, bob: kp.bob, arms: together ? [[0, 0], walkArms(ph)[1]] : walkArms(t * 11), reach: together ? [[0, HP[0], HP[1], -1]] : null });
      if (together) holdDot(HP[0], HP[1]);
      return f;
    }
    // ---------- 18 anos: ele vai embora (mochila), o pai acena ----------
    function scene3(t) {
      const ks = 1.15, go = 8.9, kx = t < go ? 610 : lerp(610, 1200, sm(t, go, S3.b, lin)), ph = t * 6.5;
      const turn = t < go ? -1 : 1;
      const fx = 360, wave = sm(t, 9.3, 9.6);
      figure({ x: fx, y: FLOOR, s: FS, dir: 1, lean: 0.03, headTilt: 0.05, legs: STANDL, arms: [lerpA([[0.3, 0.3]], [[2.6, 3.0 + Math.sin(t * 9) * 0.35]], wave)[0], [-0.15, 0.05]] });
      const kp = t < go ? { legs: STANDL, bob: 0 } : walkPose(ph, 1);
      const r = figure({ x: kx, y: FLOOR, s: ks, hr: 24, dir: turn, lean: t < go ? 0 : 0.08, headTilt: 0, legs: kp.legs, bob: kp.bob, arms: t < go ? [[0.6, 0.8], [-0.1, 0.05]] : walkArms(ph, 0.8) });
      // mochila
      ctx.save(); ctx.fillStyle = '#6b6b74'; const bx = kx - turn * 34 * ks, byy = FLOOR - 140 * ks; ctx.beginPath(); ctx.roundRect(bx - 24, byy - 40, 48, 70, 10); ctx.fill(); ctx.restore();
      bubble('ATÉ LOGO, PAI.', 640, FLOOR - 470, prog(t, 8.15, 8.35) * (1 - prog(t, 9.0, 9.2)), { size: 44, tail: 0.3, tailDir: -1 });
      bubble('VAI COM DEUS, FILHO.', 560, FLOOR - 430, prog(t, 9.35, 9.55) * (1 - prog(t, 10.4, 10.6)), { size: 44, color: '#555', tail: -0.6, tailDir: -1 });
    }
    // ---------- 50 anos depois + virada ----------
    function oldPose(t, walking, k = 0.55) { const w = walkPose(t * 4.2, walking ? k : 0); return w; }
    function scene4(t) {
      const os = 1.24, ss = FS;
      // pai velho: entra devagar pela esquerda até OLDX; tropeça; estende a mão
      let ox = t < 12.0 ? lerp(230, OLDX, sm(t, S4.a, 12.0, lin)) : OLDX;
      const reachOut = t < T.v ? sm(t, 12.15, 12.5) : 1;
      const tremble = Math.sin(t * 31) * 0.05;
      let olean = 0.55 + (t > 12.0 && t < 12.4 ? Math.sin((t - 12.0) * 15) * 0.12 : 0), otilt = 0.15;
      let owalk = t < 12.0;
      // filho no celular, de frente para o pai, cabeça baixa
      let sx = SONX, sdir = -1, stilt = 0.55, sarms = A_PHONE, slean = 0.05, phoneOn = 1, slegs = { legs: STANDL, bob: 0 };
      if (t >= T.look) { const lk = sm(t, T.look, T.look + 0.3); stilt = lerp(0.55, -0.05, lk); }
      if (t >= T.pocket) { const pk = sm(t, T.pocket, T.pocket + 0.35); sarms = lerpA(A_PHONE, A_DOWN, pk); phoneOn = 1 - pk; }
      const HOLDX = (x1, x2) => (x1 + x2) / 2;
      if (t >= T.walk) { sx = lerp(SONX, OLDX + 140, sm(t, T.walk, T.reach)); if (t < T.reach) { slegs = walkPose(t * 7, 1); sarms = walkArms(t * 7, 0.7); slean = 0.1; } }
      // depois de segurar: viram para a direita e andam juntos, no passo do pai
      let together = t >= T.hold, gk = 0;
      if (t >= T.go) { gk = sm(t, T.go, END, lin); ox = lerp(OLDX, OLDX + 300, gk); sx = ox + 140; owalk = true; slegs = walkPose(t * 4.2, 0.45); }
      const odir = 1;
      if (t >= T.go - 0.2) sdir = 1; // o filho vira para o mesmo lado do pai
      const ow = oldPose(t, owalk);
      if (t > T.wobble && t < T.wobble + 0.5) olean += Math.sin((t - T.wobble) * 18) * 0.1 * (1 - prog(t, T.wobble, T.wobble + 0.5));
      // ponto das mãos dadas
      const HY = FLOOR - 128;
      const hx = HOLDX(ox + 40, sx - 40);
      // pai
      const oArmFree = [lerp(0.2, 1.45 + tremble, reachOut), lerp(0.25, 1.6 + tremble, reachOut)];
      const o = figure({ x: ox, y: FLOOR, s: os, hr: 22, dir: odir, lean: olean, headTilt: otilt, legs: ow.legs, bob: ow.bob, arms: [[0.35, 0.35], together ? [0, 0] : oArmFree], cane: 0, reach: together ? [[1, hx, HY, -1]] : null });
      // filho
      const sFree = sarms;
      const sr = figure({ x: sx, y: FLOOR, s: ss, hr: 23, dir: sdir, lean: slean, headTilt: stilt, legs: slegs.legs, bob: slegs.bob, arms: sFree, reach: together ? [[sdir === 1 ? 0 : 1, hx, HY, sdir === 1 ? 1 : -1]] : (t > T.reach - 0.3 && t < T.hold ? [[1, lerp(sx - 80, hx, sm(t, T.reach - 0.3, T.hold)), HY - 10, -1]] : null) });
      if (together) holdDot(hx, HY);
      if (phoneOn > 0.02) { const h = sr.hands[1]; ctx.save(); ga(phoneOn); phone(h[0] - 2, h[1] - 8, phoneOn); ctx.restore(); ga(1); }
      bubble('FILHO...', ox + 120, FLOOR - 440, prog(t, 12.3, 12.5) * (1 - prog(t, 12.95, 13.1)), { size: 46, color: '#555', tail: -0.6, tailDir: -1 });
      bubble('PAI, EU TÔ AQUI.', sx - 40, FLOOR - 470, prog(t, T.hold + 0.1, T.hold + 0.3) * (1 - prog(t, T.go + 1.2, T.go + 1.4)), { size: 46, tail: 0.3, tailDir: -1 });
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    cue(0.2, 'bebe'); for (let k = 0; k < 7; k++) if (Math.abs(0.6 + k * 0.42 - 2.5) > 0.3) cue(0.6 + k * 0.42, 'step', { gain: 0.25 }); cue(2.3, 'bebe', { gain: 0.6 });
    for (const tt of [S1.b, S2.b, S3.b]) cue(tt - 0.05, 'whoosh');
    for (let k = 0; k < 5; k++) cue(4.8 + k * 0.32, 'step', { gain: 0.35 }); for (let k = 0; k < 4; k++) cue(6.45 + k * 0.22, 'step', { gain: 0.4 });
    cue(8.15, 'bubble'); cue(9.35, 'bubble', { gain: 0.6 }); for (let k = 0; k < 5; k++) cue(9.0 + k * 0.38, 'step', { gain: 0.45 });
    for (let k = 0; k < 4; k++) cue(11.1 + k * 0.6, 'step', { gain: 0.35 }); cue(11.4, 'ping'); cue(12.3, 'bubble', { gain: 0.5 }); cue(12.6, 'ping');
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 })); cue(13.0, 'tickstart'); cue(T.v - 0.1, 'tickstop');
    cue(T.pocket + 0.3, 'tap'); for (let k = 0; k < 3; k++) cue(T.walk + 0.15 + k * 0.33, 'step', { gain: 0.55 }); cue(T.hold, 'hold'); cue(T.hold + 0.1, 'bubble');
    for (let k = 0; k < 7; k++) cue(T.go + 0.2 + k * 0.72, 'step', { gain: 0.3 });
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const z = 1.45 * (1 + 0.05 * sm(t, T.v, 26)), camX = t < S4.a ? 590 : lerp(590, 680, sm(t, T.go, END, lin));
      ctx.save(); ctx.translate(540, 1520); ctx.scale(z, z); ctx.translate(-camX, -FLOOR); ctx.drawImage(bgc, 0, 0);
      if (t < S1.b + 0.1) scene1(t); else if (t < S2.b + 0.1) scene2(t); else if (t < S3.b + 0.1) scene3(t); else scene4(t);
      ctx.restore();
      // corte entre cenas: piscada escura
      for (const e of [S1.b, S2.b, S3.b]) { const k = prog(t, e - 0.2, e + 0.1) * (1 - prog(t, e + 0.15, e + 0.45)); if (k > 0) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      // idades
      const ag = [[0.3, S1.b - 0.3, '1 ANO'], [S2.a, S2.b - 0.3, '6 ANOS'], [S3.a, S3.b - 0.3, '18 ANOS'], [S4.a, 12.9, '50 ANOS DEPOIS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      // gancho
      const h1 = prog(t, 0.05, 0.4) * (1 - prog(t, 4.0, 4.3)); if (h1 > 0) { spaced('QUEM TE ENSINOU', 540, 330, 60, { a: h1, w: 900, sp: 10 }); spaced('A ANDAR', 540, 420, 60, { a: h1 * prog(t, 0.3, 0.6), w: 900, sp: 10 }); spaced('VAI PRECISAR DE VOCÊ', 540, 510, 56, { a: h1 * prog(t, 0.7, 1.0), w: 900, sp: 8, color: RED }); }
      // HEADLINE
      const dim = prog(t, 12.95, 13.3) * (1 - prog(t, 16.2, 16.6)); if (dim > 0) { ga(0.9 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['ELE SEGUROU', WHITE], ['A SUA MÃO', WHITE], ['NO SEU PRIMEIRO', WHITE], ['PASSO.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; const size = fit(s, i === 3 ? 150 : 120); txt(s, 540, 640 + i * 150 + (i >= 2 ? 60 : 0) + (i === 3 ? 20 : 0), size, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); });
        ctx.save(); ga(0.5 * dim); ctx.translate(540, 1440); ctx.strokeStyle = WHITE; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 60, 0, TAU); ctx.stroke(); ctx.lineCap = 'round'; ctx.rotate((t - 12.95) * 4.5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -48); ctx.stroke(); ctx.rotate(-(t - 12.95) * 4.5 * 0.92); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -30); ctx.stroke(); ctx.restore(); ga(1); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) { ga(0.62 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('SEGURA A MÃO', 540, 430, fit('SEGURA A MÃO', 124), { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('DE QUEM TE', 540, 570, 124, { a: prog(t, T.fin + 0.35, T.fin + 0.7), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.35, T.fin + 0.85))) });
        txt('ENSINOU A ANDAR.', 540, 715, fit('ENSINOU A ANDAR.', 118), { color: RED, a: prog(t, T.fin + 0.8, T.fin + 1.1), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.8, T.fin + 1.3))), glow: 'rgba(224,38,43,0.55)' });
        spaced('ENQUANTO AINDA DÁ TEMPO.', 540, 860, 40, { a: prog(t, 26.6, 27.2), w: 800, sp: 7 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 27.4, 28.0), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
