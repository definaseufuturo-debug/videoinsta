/*
 * "O DESENHO": o filho desenha a família; a mãe e ele têm rosto, o pai é só um retângulo vermelho de celular.
 * Os desenhos vão se acumulando na parede (4, 7, 10 anos), sempre iguais. Aos 10, ele mostra e o pai diz "HUM...".
 * Headline: NO DESENHO DELE, VOCÊ É UMA TELA. Virada: o pai acha o desenho, larga o celular, ajoelha, abraça,
 * e o desenho novo tem o pai de mãos dadas. Bonequinhos de palito, 30 s, 9:16, sem narração.
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

  const WHITE = '#efefef', RED = '#e0262b', BG = '#0a0a0c', INK = '#2b2b33', PAPER = '#f6f2e8';
  const FLOOR = 1350, SEAT = 1262, PX = 330, KX = 700, TABLE = [745, 905], TTOP = FLOOR - 60;
  const T = {
    room: 4.3, a7: 7.0, a10: 9.2, kStand: 9.9, kWalk: 10.2, kAt: 10.9, olha: 11.0, hum: 11.6, drop: 12.1, kBack: 12.4, kSit: 13.1,
    hl: [13.4, 13.9, 14.85, 15.35], s4: 16.7, look: 16.8, pick: 17.2, ins0: 17.6, ins1: 19.6, phoneDown: 19.75, standUp: 20.0, walk: 20.5, kneel: 21.3,
    kUp: 21.5, hug: 21.9, newPaper: 22.9, fin: 24.7,
  };
  // desenhos colados na parede (mundo) e quando chegam
  const SLOTS = [{ x: 600, y: 905, r: -0.06, t: T.room + 0.6 }, { x: 735, y: 880, r: 0.05, t: 6.9 }, { x: 870, y: 908, r: -0.03, t: 9.1 }];
  const WALLS = 0.2; // escala do desenho na parede
  const Z = 1.28; const toScr = (x, y) => [540 + (x - 550) * Z, 1330 + (y - 1250) * Z];

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenário: sala escura, sofá, mesinha baixa ----------
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(600, 1100, 50, 600, 1100, 900); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 260); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 260); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3;
      const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.stroke(); };
      rr(130, 1150, 70, 200, 18); rr(150, SEAT, 300, 88, 16); rr(150, 1190, 60, 160, 14);
      // mesinha baixa
      g.fillStyle = '#2a2a30'; g.strokeStyle = '#4a4a52'; g.lineWidth = 4; g.beginPath(); g.roundRect(TABLE[0], TTOP, TABLE[1] - TABLE[0], 16, 4); g.fill(); g.stroke();
      g.fillRect(TABLE[0] + 14, TTOP + 16, 10, FLOOR - TTOP - 16); g.fillRect(TABLE[1] - 24, TTOP + 16, 10, FLOOR - TTOP - 16);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- o desenho da criança (coordenadas locais 600 x 460) ----------
    // mode 'tela': pai = retângulo vermelho de celular; 'junto': pai de palito, de mãos dadas, coração vermelho
    function kidFig(x, top, h, o = {}) { // bonequinho de criança, traço de lápis
      const r = h * 0.14, hy = top + r; ctx.beginPath(); ctx.arc(x, hy, r, 0, TAU); ctx.stroke();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x - r * 0.38, hy - r * 0.15, r * 0.12, 0, TAU); ctx.arc(x + r * 0.38, hy - r * 0.15, r * 0.12, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x, hy + r * 0.1, r * 0.5, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
      const nb = hy + r, hip = top + h * 0.62;
      if (o.dress) { ctx.beginPath(); ctx.moveTo(x, nb); ctx.lineTo(x - h * 0.16, hip + 6); ctx.lineTo(x + h * 0.16, hip + 6); ctx.closePath(); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(x, nb); ctx.lineTo(x, hip); ctx.stroke(); }
      const ay = nb + h * 0.1; ctx.beginPath(); ctx.moveTo(x - h * 0.22, ay + (o.armL ?? h * 0.1)); ctx.lineTo(x, ay); ctx.lineTo(x + h * 0.22, ay + (o.armR ?? h * 0.1)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - h * 0.1, top + h); ctx.lineTo(x - (o.dress ? h * 0.06 : 0), hip); ctx.moveTo(x + (o.dress ? h * 0.06 : 0), hip); ctx.lineTo(x + h * 0.1, top + h); ctx.stroke();
    }
    function paper(x, y, s, rot, k, mode, o = {}) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-300, -230); ga(o.a ?? 1);
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 600, 460); ctx.shadowBlur = 0;
      if (o.tape) { ctx.fillStyle = 'rgba(230,225,200,0.75)'; ctx.fillRect(250, -18, 100, 36); }
      ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const st = (a, b) => clamp((k - a) / (b - a));
      const pop = (a, b, fn) => { const p = st(a, b); if (p <= 0) return; ctx.save(); ga((o.a ?? 1) * clamp(p * 2)); fn(p); ctx.restore(); };
      pop(0, 0.12, () => { ctx.font = '700 40px Inter'; ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('MINHA FAMÍLIA', 34, 52); });
      pop(0.08, 0.2, () => { ctx.beginPath(); ctx.arc(520, 70, 30, 0, TAU); ctx.stroke(); for (let i = 0; i < 8; i++) { const a = i * TAU / 8; ctx.beginPath(); ctx.moveTo(520 + Math.cos(a) * 42, 70 + Math.sin(a) * 42); ctx.lineTo(520 + Math.cos(a) * 58, 70 + Math.sin(a) * 58); ctx.stroke(); } });
      pop(0.12, 0.2, () => { ctx.beginPath(); ctx.moveTo(20, 400); ctx.lineTo(580, 400); ctx.stroke(); });
      pop(0.2, 0.42, () => kidFig(120, 190, 210, { dress: true }));
      if (mode === 'junto') {
        pop(0.4, 0.58, () => kidFig(270, 270, 130, { armR: -10 }));
        pop(0.5, 0.75, () => kidFig(420, 160, 240, { armL: 6 }));
        pop(0.62, 0.78, () => { ctx.beginPath(); ctx.moveTo(298, 316); ctx.quadraticCurveTo(340, 300, 368, 314); ctx.stroke(); });
        pop(0.72, 0.95, p => { const sc = outBack(p); ctx.save(); ctx.translate(345, 190); ctx.scale(sc, sc); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.6)'; ctx.shadowBlur = 20;
          ctx.beginPath(); ctx.moveTo(0, 26); ctx.bezierCurveTo(-46, -6, -30, -46, 0, -22); ctx.bezierCurveTo(30, -46, 46, -6, 0, 26); ctx.fill(); ctx.restore(); });
      } else {
        pop(0.4, 0.58, () => kidFig(270, 270, 130));
        pop(0.62, 0.85, p => { const sc = outBack(p); ctx.save(); ctx.translate(425, 300); ctx.scale(sc, sc); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.7)'; ctx.shadowBlur = 24 * (1 + (o.pulse || 0));
          ctx.beginPath(); ctx.roundRect(-46, -88, 92, 176, 14); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.roundRect(-34, -72, 68, 136, 6); ctx.fill();
          ctx.fillStyle = '#7a0f12'; ctx.beginPath(); ctx.arc(0, 76, 5, 0, TAU); ctx.fill(); ctx.restore(); });
      }
      pop(0.3, 0.45, () => { ctx.font = '800 30px Inter'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText('MÃE', 120, 432); });
      pop(0.5, 0.62, () => { ctx.font = '800 30px Inter'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText('EU', 270, 432); });
      pop(0.8, 0.92, () => { ctx.font = '800 30px Inter'; ctx.fillStyle = mode === 'tela' ? RED : INK; ctx.textAlign = 'center'; ctx.fillText('PAI', mode === 'tela' ? 425 : 420, 432); });
      ctx.restore(); ga(1);
    }

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
      if (o.redFace) { ctx.fillStyle = `rgba(224,38,43,${0.35 * o.redFace})`; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); }
      if (o.eyes !== false) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill(); }
      ctx.restore(); ga(1);
      return { head: [o.x + dir * hx * s, o.y + hy * s], hands: hands.map(([x, y]) => [o.x + dir * x * s, o.y + y * s]) };
    }
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const STAND = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const SIT = { legs: [[1.5, 0.1], [1.42, 0.05]], bob: 0 };
    function phone(x, y, on) { ctx.save(); if (on > 0) { const g = ctx.createRadialGradient(x, y, 4, x, y, 190); g.addColorStop(0, `rgba(224,38,43,${0.42 * on})`); g.addColorStop(1, 'rgba(224,38,43,0)'); ctx.fillStyle = g; ctx.fillRect(x - 190, y - 190, 380, 380); }
      ctx.fillStyle = on > 0 ? RED : '#5a1a1c'; ctx.beginPath(); ctx.roundRect(x - 10, y - 17, 20, 34, 4); ctx.fill(); ctx.restore(); }
    function bubble(s, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 52, w = tw(s, size) + 64, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      txt(s, 0, 3, size, { color: o.color || '#222' }); ctx.restore(); ga(1); }
    function ageChip(s, k) { if (k <= 0) return; ctx.save(); ga(k); spaced(s, 540, 640, 48, { w: 900, sp: 12 }); ctx.fillStyle = RED; ctx.fillRect(465, 684, 150, 5); ctx.restore(); ga(1); }

    // ---------- pai ----------
    let dadHand = [0, 0];
    function parent(t) {
      const s = 1.2;
      if (t < T.standUp) { // sentado no celular; no fim pega o desenho do chão
        const lookD = sm(t, T.look, T.look + 0.35), bend = sm(t, T.pick - 0.25, T.pick) * (1 - sm(t, T.pick + 0.05, T.pick + 0.4)), held = t >= T.pick;
        const off = sm(t, T.phoneDown - 0.1, T.phoneDown + 0.2), on = 1 - off;
        const lean = 0.32 + bend * 0.5 - (held ? 0.25 : 0), tilt = held ? 0.15 : 0.55;
        const r = figure({ x: PX, y: SEAT + 92 * s - 2, s, lean, headTilt: tilt + lookD * 0.2, ...SIT, redFace: t < T.ins0 ? 1 : on,
          arms: [[0.7, -0.55], held ? [1.1, 0.4] : [lerp(0.6, 1.0, bend), lerp(-0.7, 0.6, bend)]] });
        if (t < T.phoneDown) phone(r.hands[0][0] + 4, r.hands[0][1] - 6, 1); else phone(PX + 70, SEAT - 8, 0);
        dadHand = r.hands[1]; return r;
      }
      phone(PX + 70, SEAT - 8, 0);
      const up = sm(t, T.standUp, T.walk), xw = t < T.walk ? PX + 20 : lerp(PX + 20, 600, sm(t, T.walk, T.kneel - 0.05, x => x));
      const walking = t > T.walk && t < T.kneel - 0.05, kn = sm(t, T.kneel - 0.05, T.kneel + 0.35), hug = sm(t, T.hug, T.hug + 0.4);
      const ph = t * 6;
      let legs;
      if (up < 1) legs = { legs: [[lerp(1.5, 0.1, up), lerp(0.1, 0.06, up)], [lerp(1.42, -0.1, up), lerp(0.05, -0.06, up)]], bob: 0 };
      else if (walking) legs = walkPose(ph, 0.9);
      else legs = { legs: [[lerp(0.1, 1.45, kn), lerp(0.06, 0.05, kn)], [lerp(-0.1, 0.05, kn), lerp(-0.06, -1.5, kn)]], bob: 0 };
      const yy = up < 1 ? lerp(SEAT + 92 * s - 2, FLOOR, up) : FLOOR + 44 * s * kn;
      const arms = walking ? [[0.9, 0.5], walkArms(ph, 0.8)[1]] : t < T.kneel ? [[0.9, 0.5], [-0.1, 0.1]] : [[lerp(0.9, 1.45, hug), lerp(0.5, 2.3, hug)], [lerp(0.2, 1.3, hug), lerp(0.1, 2.2, hug)]];
      const r = figure({ x: xw, y: yy, s, lean: 0.08 + 0.12 * kn, headTilt: -0.05 * hug, arms, ...legs });
      dadHand = r.hands[0]; return r;
    }
    // ---------- filho ----------
    const KS = { 4: [0.62, 30], 7: [0.78, 28], 10: [0.92, 26] };
    let kidHands = null;
    function kidSit(age, t, a = 1, drawing = true) {
      const [s, hr] = KS[age]; const sc = drawing ? Math.sin(t * 14) * 0.12 : 0;
      const arms = age === 4 ? [[1.2, 1.6 + sc], [1.0, 1.4]] : [[0.9, 1.3 + sc], [0.75, 1.15]];
      const r = figure({ x: KX, y: FLOOR + 46 * s, s, hr, dir: 1, a, lean: 0.22, headTilt: 0.45, legs: [[1.5, 1.5], [1.4, 1.45]], arms, bob: 0 });
      kidHands = r.hands;
      // folhinha na mesa
      ctx.save(); ga(a); ctx.fillStyle = PAPER; ctx.fillRect(TABLE[0] + 20, TTOP - 6, 90, 6); ctx.restore(); ga(1);
    }
    function kid(t) {
      // 4 e 7 anos: desenhando; troca de idade com fade
      const xf = 0.3;
      if (t > T.room - 0.2 && t < T.a7 + xf) kidSit(4, t, prog(t, T.room - 0.2, T.room + 0.3) * (1 - prog(t, T.a7, T.a7 + xf)));
      if (t > T.a7 && t < T.a10 + xf) kidSit(7, t, prog(t, T.a7, T.a7 + xf) * (1 - prog(t, T.a10, T.a10 + xf)));
      if (t <= T.a10) return;
      const [s, hr] = KS[10];
      if (t < T.kStand) { kidSit(10, t, prog(t, T.a10, T.a10 + xf)); return; }
      if (t < T.kBack + 0.05) { // levanta, vai até o pai, mostra o desenho, larga
        const st = sm(t, T.kStand, T.kWalk), walking = t > T.kWalk && t < T.kAt, x = t < T.kWalk ? KX : lerp(KX, 500, sm(t, T.kWalk, T.kAt, x => x)), ph = t * 8;
        const lift = sm(t, T.kAt, T.kAt + 0.3), dropA = sm(t, T.drop - 0.1, T.drop + 0.2), sad = sm(t, T.hum + 0.2, T.hum + 0.6);
        let arms = walking ? [[1.0, 1.2], walkArms(ph)[1]] : [[lerp(1.0, 2.3, lift) - dropA * 2.2, lerp(1.2, 2.6, lift) - dropA * 2.5], [lerp(0.3, 2.2, lift) - dropA * 2.1, lerp(0.2, 2.5, lift) - dropA * 2.4]];
        const legs = st < 1 ? { legs: [[lerp(1.5, 0.1, st), lerp(1.5, 0.06, st)], [lerp(1.4, -0.1, st), lerp(1.45, -0.06, st)]], bob: 0 } : walking ? walkPose(ph) : STAND;
        const r = figure({ x, y: lerp(FLOOR + 46 * s, FLOOR, st), s, hr, dir: t < T.kWalk ? 1 : -1, lean: walking ? 0.1 : sad * 0.15, headTilt: sad * 0.6, arms, ...legs });
        kidHands = r.hands; return;
      }
      if (t < T.kSit) { const x = lerp(500, KX, sm(t, T.kBack, T.kSit - 0.3, x => x)), ph = t * 7, walking = t < T.kSit - 0.3; const sit = sm(t, T.kSit - 0.3, T.kSit);
        figure({ x, y: lerp(FLOOR, FLOOR + 46 * s, sit), s, hr, dir: 1, lean: 0.1, headTilt: 0.6, arms: walking ? walkArms(ph, 0.6) : [[0.2, 0.1], [0.1, 0]], ...(walking ? walkPose(ph, 0.7) : { legs: [[lerp(0.1, 1.5, sit), lerp(0.06, 1.5, sit)], [lerp(-0.1, 1.4, sit), lerp(-0.06, 1.45, sit)]], bob: 0 }) }); return; }
      if (t < T.kUp) { kidSit(10, t, 1, t < T.s4 + 3); return; }
      // levanta e abraça o pai
      const st = sm(t, T.kUp, T.kUp + 0.35), hug = sm(t, T.hug, T.hug + 0.4), x = lerp(KX, 668, sm(t, T.kUp + 0.2, T.hug + 0.2));
      figure({ x, y: lerp(FLOOR + 46 * s, FLOOR, st), s, hr, dir: st > 0.5 ? -1 : 1, lean: 0.12 * hug, headTilt: -0.1 * hug,
        legs: [[lerp(1.5, 0.1, st), lerp(1.5, 0.06, st)], [lerp(1.4, -0.1, st), lerp(1.45, -0.06, st)]], bob: 0,
        arms: [[lerp(0.2, 1.5, hug), lerp(0.1, 2.3, hug)], [lerp(0.1, 1.35, hug), lerp(0.0, 2.2, hug)]] });
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    cue(0.15, 'scribble', { dur: 2.2 }); cue(1.55, 'phonepop'); cue(T.room, 'whoosh');
    cue(T.room + 0.55, 'paper'); cue(SLOTS[1].t - 0.05, 'paper'); cue(SLOTS[2].t - 0.05, 'paper');
    for (const tt of [0.9, 3.3, 5.6, 8.1, 10.3]) cue(tt, 'ping');
    cue(4.9, 'scribble', { dur: 1.8, gain: 0.5 }); cue(7.4, 'scribble', { dur: 1.5, gain: 0.5 }); cue(9.3, 'scribble', { dur: 0.6, gain: 0.5 });
    cue(T.a7 - 0.05, 'clock'); cue(T.a10 - 0.05, 'clock');
    cue(T.olha, 'bubble'); cue(T.hum + 0.2, 'bubble', { gain: 0.5 }); cue(T.drop + 0.1, 'paper');
    T.hl.forEach((t, i) => cue(t, 'hit', { big: i === 3 })); cue(13.0, 'tickstart'); cue(T.s4 - 0.1, 'tickstop');
    cue(T.pick, 'paper'); cue(T.ins0, 'heartbeat'); cue(T.phoneDown + 0.1, 'tap'); cue(T.kneel + 0.2, 'bump'); cue(T.hug, 'hug');
    cue(T.newPaper, 'scribble', { dur: 1.2, gain: 0.6 }); cue(T.newPaper + 1.0, 'chime');
    cue(T.fin, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const roomA = prog(t, T.room - 0.3, T.room + 0.4);
      if (roomA > 0) {
        ctx.save(); ga(roomA); ctx.translate(540, 1330); ctx.scale(Z, Z); ctx.translate(-550, -1250); ctx.drawImage(bgc, 0, 0); ga(1);
        // desenhos já colados na parede (todos com o pai-celular)
        SLOTS.forEach((sl, i) => { if (t >= sl.t) paper(sl.x, sl.y, WALLS, sl.r, 1, 'tela', { tape: true, a: roomA }); });
        // desenho voando da mesa para a parede (7 e 10 anos)
        [1, 2].forEach(i => { const sl = SLOTS[i], k = prog(t, sl.t - 0.6, sl.t); if (k > 0 && k < 1) { const e = inOut(k); paper(lerp(TABLE[0] + 60, sl.x, e), lerp(TTOP - 20, sl.y, e) - Math.sin(k * Math.PI) * 80, lerp(0.08, WALLS, e), lerp(0, sl.r, e) + Math.sin(k * Math.PI) * 0.4, 1, 'tela'); } });
        const p = parent(t);
        kid(t);
        // desenho na mão do filho (10 anos), caindo, no chão, na mão do pai
        if (t > T.kStand + 0.1 && t < T.drop && kidHands) { const h = kidHands; paper((h[0][0] + h[1][0]) / 2, (h[0][1] + h[1][1]) / 2 - 30, 0.13, 0.05, 1, 'tela'); }
        if (t >= T.drop && t < T.pick) { const k = prog(t, T.drop, T.drop + 0.45); paper(lerp(500, 455, k), lerp(1150, FLOOR - 8, k * k), lerp(0.13, 0.13, k), k * 1.45, 1, 'tela', { a: 1 }); }
        if (t >= T.pick && t < T.phoneDown) { const h = dadHand; paper(h[0] + 20, h[1] - 40, 0.14, -0.1, 1, 'tela'); }
        if (t >= T.phoneDown && t < T.newPaper) paper(PX - 60, SEAT + 2, 0.12, 1.5, 1, 'tela'); // fica no sofá
        // falas
        bubble('PAI, OLHA!', 520, 935, prog(t, T.olha - 0.05, T.olha + 0.15) * (1 - prog(t, T.hum + 0.1, T.hum + 0.3)), { size: 46, tail: 0.3, tailDir: 1 });
        bubble('HUM...', PX + 120, 990, prog(t, T.hum + 0.2, T.hum + 0.4) * (1 - prog(t, T.drop + 0.4, T.drop + 0.6)), { color: '#555', tail: -1, tailDir: -1 });
        // luz quente na virada (pai e filho)
        const wl = sm(t, T.kneel, T.hug + 0.6); if (wl > 0) { const g = ctx.createRadialGradient(640, 1180, 20, 640, 1180, 420); g.addColorStop(0, `rgba(255,236,210,${0.2 * wl})`); g.addColorStop(1, 'rgba(255,236,210,0)'); ctx.fillStyle = g; ctx.fillRect(220, 760, 840, 840); }
        ctx.restore();
      }
      // ---- abertura: o desenho em close, depois voa para a parede ----
      if (t < T.room + 0.6) { const k = sm(t, T.room, T.room + 0.6); const [sx, sy] = toScr(SLOTS[0].x, SLOTS[0].y);
        paper(lerp(540, sx, k), lerp(1080, sy, k), lerp(1.35, WALLS * Z, k), lerp(-0.02, SLOTS[0].r, k), prog(t, 0.0, 1.5), 'tela', { pulse: Math.sin(t * 6) * 0.5 + 0.5 }); }
      // idades
      const ag = [[T.room + 0.3, T.a7 - 0.3, '4 ANOS'], [T.a7, T.a10 - 0.3, '7 ANOS'], [T.a10, 12.8, '10 ANOS']];
      for (const [a, b, s] of ag) ageChip(s, prog(t, a, a + 0.4) * (1 - prog(t, b, b + 0.3)));
      // gancho
      const h1 = prog(t, 0.1, 0.45) * (1 - prog(t, T.room + 0.3, T.room + 0.7)); if (h1 > 0) { spaced('É ASSIM QUE', 540, 330, 66, { a: h1, w: 900, sp: 12 }); spaced('SEU FILHO', 540, 425, 66, { a: h1 * prog(t, 0.4, 0.75), w: 900, sp: 12 }); spaced('TE DESENHA', 540, 520, 66, { a: h1 * prog(t, 0.8, 1.15), w: 900, sp: 12, color: RED }); }
      // HEADLINE
      const dim = prog(t, 12.9, 13.3) * (1 - prog(t, 16.3, 16.7)); if (dim > 0) { ga(0.92 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['NO DESENHO', WHITE], ['DELE,', WHITE], ['VOCÊ É', WHITE], ['UMA TELA.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, T.hl[i] - 0.12, T.hl[i] + 0.12); if (pp <= 0) return; txt(s, 540, 660 + i * 150 + (i >= 2 ? 60 : 0), 128, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); });
        const ck = dim; ctx.save(); ga(0.5 * ck); ctx.translate(540, 1440); ctx.strokeStyle = WHITE; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 60, 0, TAU); ctx.stroke(); ctx.lineCap = 'round'; ctx.rotate((t - 12.9) * 4.5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -48); ctx.stroke(); ctx.rotate(-(t - 12.9) * 4.5 * 0.92); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -30); ctx.stroke(); ctx.restore(); ga(1); }
      // insert: o pai vê o desenho de perto
      const ins = prog(t, T.ins0, T.ins0 + 0.35) * (1 - prog(t, T.ins1 - 0.3, T.ins1)); if (ins > 0) { ga(0.75 * ins); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        paper(540, 1080, lerp(0.5, 1.35, outC(ins)), -0.02, 1, 'tela', { a: ins, pulse: Math.sin(t * 8) * 0.5 + 0.5 });
        spaced('ELE TE VÊ', 540, 380, 66, { a: ins * prog(t, T.ins0 + 0.3, T.ins0 + 0.6), w: 900, sp: 12 }); spaced('ASSIM.', 540, 475, 66, { a: ins * prog(t, T.ins0 + 0.7, T.ins0 + 1.0), w: 900, sp: 12, color: RED }); }
      // virada: texto
      const h3 = prog(t, T.phoneDown, T.phoneDown + 0.4) * (1 - prog(t, T.newPaper - 0.2, T.newPaper + 0.2)); if (h3 > 0) { spaced('AINDA DÁ TEMPO', 540, 360, 60, { a: h3, w: 900, sp: 12 }); spaced('DE ENTRAR NO DESENHO', 540, 450, 50, { a: h3 * prog(t, T.walk, T.walk + 0.4), w: 900, sp: 10, color: RED }); }
      // desenho novo: pai de mãos dadas
      if (t > T.newPaper) { const k = prog(t, T.newPaper, T.newPaper + 0.5), fk = sm(t, T.fin, T.fin + 0.7);
        if (fk > 0) { ga(0.62 * fk); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); }
        paper(lerp(780, 540, outC(k)), lerp(1300, lerp(1020, 1270, fk), outC(k)), lerp(0.1, lerp(1.35, 1.12, fk), outC(k)), lerp(0.3, 0.02, outC(k)), prog(t, T.newPaper + 0.2, T.newPaper + 1.4), 'junto'); }
      // final
      const f = prog(t, T.fin, T.fin + 0.6); if (f > 0) {
        txt('SAI DA TELA.', 540, 400, 118, { a: f, scale: lerp(1.3, 1, outC(prog(t, T.fin, T.fin + 0.5))) });
        txt('ENTRA NO', 540, 545, 118, { a: prog(t, T.fin + 0.45, T.fin + 0.8), scale: lerp(1.3, 1, outC(prog(t, T.fin + 0.45, T.fin + 0.9))) });
        txt('DESENHO.', 540, 690, 130, { color: RED, a: prog(t, T.fin + 0.9, T.fin + 1.2), scale: lerp(1.4, 1, outC(prog(t, T.fin + 0.9, T.fin + 1.4))), glow: 'rgba(224,38,43,0.55)' });
        spaced('ELE ESTÁ TE DESENHANDO AGORA.', 540, 830, 36, { a: prog(t, 26.6, 27.2), w: 800, sp: 6 });
        spaced('MARCA QUEM PRECISA VER ISSO', 540, 1720, 38, { a: prog(t, 27.4, 28.0), w: 900, sp: 8, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
