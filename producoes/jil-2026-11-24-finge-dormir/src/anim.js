/*
 * "ELE FINGE QUE DORME NO CARRO": o pai carrega o filho dormindo do carro até a cama aos 3, 6 e 9 anos;
 * aos 12 o filho só finge dormir, o pai percebe ("SEI QUE TÁ ACORDADO") e carrega mesmo assim.
 * Bonequinhos de palito, 30 s, 9:16, sem narração. Vermelho = a chave do carro. (Sl 4:8)
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

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c', AMBER = '#ffd9a0';
  const FLOOR = 1390, FS = 1.32, Z = 1.72, CAMX = 650;
  const DADX = 690, STOPX = 500, SEATX = 800, DOORX = 420;
  const WIN = [[738, FLOOR - 184], [850, FLOOR - 184], [884, FLOOR - 120], [722, FLOOR - 120]];
  // idade: [entra, chega no carro, abre a porta, abaixa, levanta, some na porta de casa]
  const AGES = [
    { lab: '3 ANOS', s: 0.55, hr: 30, in: 0.3, at: 1.5, dome: 1.6, bend: 2.0, lift: 2.35, end: 4.4 },
    { lab: '6 ANOS', s: 0.7, hr: 28, in: 4.7, at: 5.9, dome: 6.0, bend: 6.4, lift: 6.75, end: 8.8 },
    { lab: '9 ANOS', s: 0.85, hr: 26, in: 9.1, at: 10.3, dome: 10.4, bend: 10.8, lift: 11.2, end: 13.2 },
    { lab: '12 ANOS', s: 1.0, hr: 25, in: 13.5, at: 14.6, dome: 14.7, bend: 17.95, lift: 18.35, end: 22.7, twist: true },
  ];
  const TW = { pesado: [14.95, 16.3], peek: [15.55, 16.1], sei: [16.45, 18.0], shh: [17.3, 18.0], fin: 23.2 };

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: rua à noite, casa com a porta acesa à esquerda ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      let sd = 11; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.35})`; g.beginPath(); g.arc(rnd() * W, 460 + rnd() * 600, 1 + rnd() * 1.6, 0, TAU); g.fill(); }
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 400); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      // casa
      g.fillStyle = '#131318'; g.fillRect(240, FLOOR - 400, 330, 400); g.fillStyle = '#0d0d11'; g.beginPath(); g.moveTo(210, FLOOR - 400); g.lineTo(405, FLOOR - 520); g.lineTo(600, FLOOR - 400); g.closePath(); g.fill();
      g.fillStyle = '#2a2417'; g.fillRect(280, FLOOR - 300, 70, 70); g.fillStyle = '#ffe2a8'; g.globalAlpha = 0.55; g.fillRect(286, FLOOR - 294, 58, 58); g.globalAlpha = 1;
      const dg = g.createRadialGradient(DOORX, FLOOR - 110, 20, DOORX, FLOOR - 110, 330); dg.addColorStop(0, 'rgba(255,214,150,0.34)'); dg.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = dg; g.fillRect(0, FLOOR - 460, 800, 560);
      g.fillStyle = AMBER; g.fillRect(DOORX - 38, FLOOR - 230, 76, 230);
      const cone = g.createLinearGradient(0, FLOOR - 230, 0, FLOOR); cone.addColorStop(0, 'rgba(255,226,168,0.16)'); cone.addColorStop(1, 'rgba(255,226,168,0.02)'); g.fillStyle = cone; g.beginPath(); g.moveTo(DOORX - 38, FLOOR - 4); g.lineTo(DOORX + 38, FLOOR - 4); g.lineTo(DOORX + 330, FLOOR + 60); g.lineTo(DOORX - 330, FLOOR + 60); g.closePath(); g.fill();
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho (mesmo motor dos vídeos campeões) ----------
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
    const A_DOWN = [[0.15, 0.2], [-0.1, 0.1]], A_GRAB = [[0.9, 0.55], [0.8, 0.45]], A_HOLD2 = [[0.95, 1.7], [1.05, 1.85]], A_BACK = [[0.15, 0.2], [-0.7, 0.25]];
    const K_LIMP = [[0.25, 0.2], [0.05, 0.1]], K_HUG = [[1.9, 2.5], [1.75, 2.35]];
    const carryPos = (fx, d, ks) => ({ x: fx + d * 82, y: FLOOR - 172 + 92 * ks });
    const seatY = s => FLOOR - 155 + 192 * s;

    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 38, w = tw(s, size) + 56, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 24); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 14, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 26, h / 2 + 30); ctx.lineTo(tx + 16, h / 2 - 2); ctx.fill();
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 640, 50, { w: 900, sp: 12 }); ctx.fillStyle = RED; ctx.fillRect(470, 686, 140, 5); ctx.restore(); ga(1); }
    function key(x, y, a) { if (a <= 0.02) return; ctx.save(); ga(a); const g = ctx.createRadialGradient(x, y, 3, x, y, 60); g.addColorStop(0, 'rgba(224,38,43,0.5)'); g.addColorStop(1, 'rgba(224,38,43,0)'); ctx.fillStyle = g; ctx.fillRect(x - 60, y - 60, 120, 120);
      ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.8)'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); ctx.fillRect(x + 4, y - 3, 26, 6); ctx.fillRect(x + 22, y, 5, 10); ctx.restore(); ga(1); }

    // ---------- carro (de lado, com a janela vazada para ver o filho dormindo) ----------
    function winPath() { ctx.moveTo(WIN[0][0], WIN[0][1]); for (let i = 1; i < WIN.length; i++) ctx.lineTo(WIN[i][0], WIN[i][1]); ctx.closePath(); }
    function drawCar(dome) {
      ctx.save(); ctx.beginPath();
      ctx.moveTo(650, FLOOR - 34); ctx.lineTo(650, FLOOR - 100); ctx.quadraticCurveTo(650, FLOOR - 112, 676, FLOOR - 114); ctx.lineTo(712, FLOOR - 118); ctx.lineTo(724, FLOOR - 196); ctx.lineTo(862, FLOOR - 196); ctx.lineTo(906, FLOOR - 114); ctx.lineTo(940, FLOOR - 104); ctx.quadraticCurveTo(954, FLOOR - 98, 954, FLOOR - 82); ctx.lineTo(954, FLOOR - 34); ctx.closePath();
      winPath(); ctx.fillStyle = '#1c1c22'; ctx.fill('evenodd'); ctx.strokeStyle = '#3d3d46'; ctx.lineWidth = 3; ctx.stroke();
      // vidro
      ctx.beginPath(); winPath(); ctx.fillStyle = 'rgba(140,170,220,0.10)'; ctx.fill();
      if (dome > 0) { const g = ctx.createRadialGradient(805, FLOOR - 178, 4, 805, FLOOR - 178, 120); g.addColorStop(0, `rgba(255,217,160,${0.6 * dome})`); g.addColorStop(1, 'rgba(255,217,160,0)'); ctx.save(); ctx.beginPath(); winPath(); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(700, FLOOR - 200, 220, 100); ctx.restore(); }
      // maçaneta, rodas, farol
      ctx.fillStyle = '#4a4a54'; ctx.fillRect(786, FLOOR - 104, 24, 5);
      for (const wx of [716, 886]) { ctx.fillStyle = '#0c0c0f'; ctx.beginPath(); ctx.arc(wx, FLOOR - 32, 32, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4a4a54'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(wx, FLOOR - 32, 17, 0, TAU); ctx.stroke(); }
      const hg = ctx.createRadialGradient(950, FLOOR - 76, 3, 950, FLOOR - 76, 70); hg.addColorStop(0, 'rgba(255,230,180,0.6)'); hg.addColorStop(1, 'rgba(255,230,180,0)'); ctx.fillStyle = hg; ctx.fillRect(880, FLOOR - 150, 120, 150);
      ctx.restore(); }

    // ---------- uma cena de idade ----------
    function scene(A, t) {
      const ph = t * 9, K = A.s;
      const asleepEyes = A.twist && t >= TW.peek[0] && t < TW.peek[1] || (A.twist && t >= A.lift + 0.5);
      const fade = 1 - sm(t, A.end - 0.4, A.end);
      const L = sm(t, A.lift, A.lift + 0.45), turn = sm(t, A.lift + 0.5, A.lift + 0.8);
      const walkT0 = A.lift + 0.8;
      // --- pai ---
      let fx = DADX, fl = STANDL, farms = A_DOWN, bob = 0, lean = 0.05, tilt = 0;
      if (t < A.at) { fx = lerp(470, DADX, sm(t, A.in, A.at, x => x)); const w = walkPose(ph, 1); fl = w.legs; bob = w.bob; farms = walkArms(ph, 0.9); lean = 0.1; }
      else {
        const B = sm(t, A.bend, A.bend + 0.35);
        farms = lerpA(A_DOWN, A_GRAB, B); lean = 0.05 + B * 0.5; tilt = B * 0.2;
        if (A.twist && t < A.bend) {
          const back = sm(t, TW.pesado[0] - 0.15, TW.pesado[0] + 0.2) * (1 - sm(t, TW.sei[0] - 0.1, TW.sei[0] + 0.25));
          farms = lerpA(A_DOWN, A_BACK, back); lean = 0.05 - 0.05 * back; tilt = 0.18 * sm(t, TW.peek[0] - 0.1, TW.peek[0] + 0.2) - 0.12 * back;
        }
        if (t >= A.lift) { farms = lerpA(A_GRAB, A_HOLD2, L); lean = lerp(0.5, 0.08, L); tilt = lerp(0.2, -0.05, L); }
        if (t >= walkT0) { fx = lerp(DADX, STOPX, sm(t, walkT0, A.end - 0.25, x => x)); const w = walkPose(t * 8, 0.9); fl = w.legs; bob = w.bob; lean = 0.1; }
      }
      const dir = lerp(1, -1, turn);
      // --- filho: dormindo na janela (atrás do carro) até o pai levantar ---
      const sy = seatY(K);
      let seatedHead = null;
      if (t < A.lift) {
        ctx.save(); ctx.beginPath(); winPath(); ctx.clip();
        const f = figure({ x: SEATX, y: sy, s: K, hr: A.hr, dir: 1, lean: 0.12, headTilt: 0.55, arms: K_LIMP, legs: CARRYL, eyes: asleepEyes ? true : false, a: fade });
        seatedHead = f.head; ctx.restore();
      }
      const dome = sm(t, A.dome, A.dome + 0.25) * fade;
      drawCar(dome);
      // pai por cima do carro
      const f = figure({ x: fx, y: FLOOR, s: FS, dir, lean, headTilt: tilt, arms: farms, legs: fl, bob, a: fade });
      key(f.hands[1][0] + 4, f.hands[1][1] - 4, (t > A.in ? 1 : 0) * (1 - sm(t, A.bend - 0.25, A.bend + 0.05)) * fade);
      // filho carregado
      if (t >= A.lift) {
        const c = carryPos(fx, dir, K); let kx = c.x, ky = c.y;
        if (L < 1) { kx = lerp(SEATX, c.x, L); ky = lerp(sy, c.y, L) - Math.sin(L * Math.PI) * 36; }
        const sway = t > walkT0 ? Math.sin((t - walkT0) * 8) * 0.04 : 0;
        const awake = A.twist ? sm(t, A.lift + 0.3, A.lift + 0.8) : 0;
        const karms = lerpA(K_LIMP, K_HUG, awake);
        figure({ x: kx, y: ky, s: K, hr: A.hr, dir: -dir, lean: lerp(0.35, 0.18, awake) + sway, headTilt: lerp(0.5, -0.1, awake), arms: karms, legs: CARRYL, eyes: A.twist && awake > 0.5 ? true : false, a: fade });
        // coração quando ele "acorda" nos braços
        if (A.twist && t > A.lift + 0.9) { const k = prog(t, A.lift + 0.9, A.lift + 1.6); if (k > 0 && k < 1) txt('♥', kx - dir * 4, ky - 250 * K - k * 90, 54, { color: RED, a: Math.sin(k * Math.PI), glow: 'rgba(224,38,43,0.6)' }); }
      }
      // Z z z
      if (seatedHead && !(A.twist && t >= TW.peek[0] && t < TW.peek[1])) {
        for (let k = 0; k < 3; k++) { const p = ((t * 0.7 + k / 3) % 1); txt(k === 1 ? 'z' : 'Z', seatedHead[0] + 38 + k * 14 + p * 14, seatedHead[1] - 44 - p * 90, 26 + k * 8, { a: Math.sin(p * Math.PI) * 0.8 * fade, w: 800 }); }
      }
      // balões do giro de 12 anos
      if (A.twist) {
        const h = f.head;
        bubble('JÁ TÁ PESADO...', 640, FLOOR - 410, prog(t, TW.pesado[0], TW.pesado[0] + 0.2) * (1 - prog(t, TW.pesado[1] - 0.2, TW.pesado[1])), { size: 34, color: '#444', tail: -0.8, tailDir: -1 });
        bubble('SEI QUE TÁ ACORDADO.', 650, FLOOR - 410, prog(t, TW.sei[0], TW.sei[0] + 0.2) * (1 - prog(t, TW.sei[1] - 0.2, TW.sei[1])), { size: 34, tail: -0.8, tailDir: -1 });
        bubble('SHH...', 870, FLOOR - 275, prog(t, TW.shh[0], TW.shh[0] + 0.2) * (1 - prog(t, TW.shh[1] - 0.2, TW.shh[1])), { size: 34, color: '#555', tail: -0.3, tailDir: -1 });
      }
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    AGES.forEach(A => {
      cue(A.in - 0.1, 'car');
      for (let k = 0; k < 4; k++) cue(A.in + 0.25 + k * ((A.at - A.in - 0.4) / 3), 'step', { gain: 0.5 });
      cue(A.at, 'keys'); cue(A.dome, 'cardoor'); cue(A.lift + 0.1, 'lift');
      for (let k = 0; k < 5; k++) cue(A.lift + 0.95 + k * ((A.end - A.lift - 1.5) / 4), 'step', { gain: 0.45 });
      cue(A.end - 0.45, 'housedoor');
    });
    cue(TW.pesado[0], 'sigh'); cue(TW.peek[0], 'peek'); cue(TW.sei[0], 'pop'); cue(TW.shh[0], 'pop', { gain: 0.7 });
    cue(AGES[3].lift + 1.0, 'warm'); cue(TW.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(540, 1480); ctx.scale(Z, Z); ctx.translate(-CAMX, -FLOOR); ctx.drawImage(bgc, 0, 0);
      const A = AGES.filter(a => t >= a.in - 0.3).pop() || AGES[0];
      scene(A, t);
      ctx.restore();
      // corte entre idades: piscada escura
      for (const a of AGES) { const k = Math.max(prog(t, a.end - 0.2, a.end + 0.1) * (1 - prog(t, a.end + 0.15, a.end + 0.45)), 0); if (k > 0 && a !== AGES[3]) { ga(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); } }
      // idades
      const ag = [[0.3, 4.2, '3 ANOS'], [4.7, 8.6, '6 ANOS'], [9.1, 13.0, '9 ANOS'], [13.5, 22.4, '12 ANOS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.35) * (1 - prog(t, b, b + 0.25)));
      // gancho (já no quadro 0, grande)
      const h1 = prog(t, 0.0, 0.25) * (1 - prog(t, 4.0, 4.3)); if (h1 > 0) {
        txt('VOCÊ AINDA', 540, 300, 112, { a: h1 }); txt('CARREGA ELE', 540, 420, 112, { a: h1 * prog(t, 0.1, 0.4) }); txt('DO CARRO?', 540, 540, 118, { a: h1 * prog(t, 0.2, 0.55), color: RED, glow: 'rgba(224,38,43,0.55)' }); }
      // final
      const f = prog(t, TW.fin, TW.fin + 0.6); if (f > 0) { ga(0.7 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = ['ELE AINDA', 'FINGE DORMIR', 'PRA VOCÊ', 'CARREGAR.'];
        L.forEach((s, i) => { const a0 = TW.fin + i * 0.38; txt(s, 540, 380 + i * 135, 112, { a: prog(t, a0, a0 + 0.3), scale: lerp(1.25, 1, outC(prog(t, a0, a0 + 0.5))) }); });
        txt('CARREGUE.', 540, 1010, 146, { color: RED, a: prog(t, TW.fin + 1.7, TW.fin + 2.0), scale: lerp(1.4, 1, outC(prog(t, TW.fin + 1.7, TW.fin + 2.3))), glow: 'rgba(224,38,43,0.55)' });
        spaced('UM DIA ELE PARA DE FINGIR.', 540, 1190, 38, { a: prog(t, 26.0, 26.6), w: 800, sp: 7 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1740, 38, { a: prog(t, 27.2, 27.8), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
