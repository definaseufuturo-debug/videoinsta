/*
 * "PENSA DEMAIS × VAI" (Mindloop: a mente em bonequinhos). Os dois diante da mesma porta vermelha.
 * Em volta de um surgem 100 balões "E SE...?" até a porta sumir atrás deles; o outro estoura o único "e se"
 * que teve, gira a maçaneta e passa. Headline: "PENSAR / DEMAIS / TAMBÉM É / DESISTIR." Virada: ele estoura
 * um balão, depois outro, e chega à porta. Final: "E SE DER CERTO?". 30 s, 9:16, sem narração.
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
  const FLOOR = 1460, DX0 = 425, DW = 230, DTOP = 1020, S = 1.25;
  const AX = 210, BX = 870;
  // B: um "e se", estoura, vai até a porta e passa
  const B = { bal: 2.2, poke: 3.3, walk: 3.8, at: 5.4, knob: 5.7, open: 6.0, in: 6.8, gone: 8.0, shut: 8.4 };
  // A: o enxame de "e se" e a virada
  const HL = [11.6, 12.15, 13.05, 13.6], HL_OUT = 15.1, FIN = 23.6;
  const A = { poke1: 15.9, poke2: 16.7, walk: 17.3, at: 20.4, knob: 20.7, open: 21.0, in: 21.6, gone: 22.9 };

  // ---------- os 100 balões ----------
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const BIG = ['E SE DER ERRADO?', 'E SE RIREM DE MIM?', 'E SE EU NÃO FOR BOM?', 'E SE JÁ FOR TARDE?', 'E SE EU PASSAR VERGONHA?', 'E SE NÃO DER CERTO?', 'E SE EU ME ARREPENDER?', 'E SE FALAREM DE MIM?'];
  const MID = ['E SE EU FALHAR?', 'E SE NÃO FOR A HORA?', 'E SE EU PERDER?', 'E SE NINGUÉM LIGAR?', 'E SE DER RUIM?', 'E SE EU CANSAR?', 'E SE...?', 'E SE?'];
  const BAL = [];
  for (let i = 0; i < 100; i++) {
    const t0 = i < 8 ? [1.0, 1.7, 2.4, 3.1, 3.8, 4.4, 5.0, 5.5][i] : 5.9 + Math.pow((i - 8) / 91, 0.75) * 4.7;
    const s = i < 8 ? BIG[i] : i < 30 ? MID[i % MID.length] : (i % 3 ? 'E SE?' : 'E SE...?');
    const size = i < 8 ? 34 : i < 30 ? 30 : 26;
    let x, y;
    // coordenadas de tela (os balões são desenhados fora do zoom da cena)
    if (i < 8) { x = [260, 330, 200, 360, 230, 330, 210, 380][i]; y = [990, 880, 790, 1070, 1170, 780, 890, 960][i] - 20; }
    else if (i < 40) { x = 60 + rnd() * 440; y = 730 + rnd() * 690; }
    else { x = 330 + rnd() * 430; y = 730 + rnd() * 760; }   // estes cobrem a porta
    BAL.push({ i, t0, s, size, x, y, ph: rnd() * TAU });
  }
  // virada: quando cada balão estoura
  BAL.forEach(b => { b.pop = b.i === 3 ? A.poke1 : b.i === 0 ? A.poke2 : A.walk + 0.2 + clamp((b.x - 100) / 650) * 2.6 + rnd() * 0.5; });
  const nAt = t => BAL.filter(b => t >= b.t0).length;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(540, 1200, 50, 540, 1200, 950); sp.addColorStop(0, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, FLOOR, W, 3);
      // parede da porta
      g.fillStyle = '#121216'; g.fillRect(DX0 - 40, DTOP - 40, DW + 80, FLOOR - DTOP + 40);
      g.strokeStyle = '#4a4a52'; g.lineWidth = 8; g.strokeRect(DX0 - 4, DTOP - 4, DW + 8, FLOOR - DTOP + 4);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // porta: k = quanto está aberta (0..1)
    function door(k, knobTurn) {
      const dh = FLOOR - DTOP;
      if (k > 0) { ctx.save(); ctx.fillStyle = '#f2efe6'; ga(clamp(k * 1.5)); ctx.fillRect(DX0, DTOP, DW, dh);
        const g = ctx.createLinearGradient(0, FLOOR, 0, FLOOR + 260); g.addColorStop(0, `rgba(242,239,230,${0.35 * k})`); g.addColorStop(1, 'rgba(242,239,230,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(DX0, FLOOR); ctx.lineTo(DX0 + DW, FLOOR); ctx.lineTo(DX0 + DW + 160 * k, FLOOR + 260); ctx.lineTo(DX0 - 160 * k, FLOOR + 260); ctx.closePath(); ctx.fill();
        const rg = ctx.createRadialGradient(DX0 + DW / 2, FLOOR - dh / 2, 50, DX0 + DW / 2, FLOOR - dh / 2, 520); rg.addColorStop(0, `rgba(255,245,225,${0.18 * k})`); rg.addColorStop(1, 'rgba(255,245,225,0)'); ctx.fillStyle = rg; ctx.fillRect(DX0 - 520, FLOOR - dh / 2 - 520, 1270, 1040); ctx.restore(); ga(1); }
      // folha vermelha, presa na dobradiça da esquerda
      const pw = DW * (1 - 0.82 * k), sk = 36 * k;
      ctx.save(); ctx.fillStyle = RED; ctx.shadowColor = 'rgba(224,38,43,0.55)'; ctx.shadowBlur = 26;
      ctx.beginPath(); ctx.moveTo(DX0, DTOP); ctx.lineTo(DX0 + pw, DTOP - sk); ctx.lineTo(DX0 + pw, FLOOR + sk * 0.6); ctx.lineTo(DX0, FLOOR); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      if (k < 0.5) { ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 4; ctx.strokeRect(DX0 + 26 * (1 - k), DTOP + 30, pw - 52 * (1 - k), 150); ctx.strokeRect(DX0 + 26 * (1 - k), DTOP + 220, pw - 52 * (1 - k), 170);
        // maçaneta
        ctx.save(); ctx.translate(DX0 + pw - 30, DTOP + 225 + (FLOOR - DTOP - 225) * 0.0 + 10); ctx.rotate(-knobTurn * 0.9); ctx.fillStyle = '#2a0c0d'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill(); ctx.fillRect(-30, -5, 30, 10); ctx.restore(); }
      ctx.restore();
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
      if (o.eyes !== false) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill(); }
      ctx.restore(); ga(1);
      return { head: [o.x + dir * hx * s, o.y + hy * s], hands: hands.map(([x, y]) => [o.x + dir * x * s, o.y + y * s]) };
    }
    const STAND = { legs: [[0.1, 0.06], [-0.1, -0.06]], bob: 0 };
    const walkPose = (ph, k = 1) => { const a = 0.42 * Math.sin(ph) * k; return { legs: [[a, a - 0.35 * Math.max(0, Math.sin(ph + 1.4)) * k], [-a, -a - 0.35 * Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k]], bob: -Math.abs(Math.cos(ph)) * 6 * k }; };
    const walkArms = (ph, k = 1) => [[-0.45 * Math.sin(ph) * k, -0.25 * Math.sin(ph) * k + 0.2], [0.45 * Math.sin(ph) * k, 0.25 * Math.sin(ph) * k + 0.2]];
    const HEAD = [[2.75, -2.1], [2.55, -2.35]];      // mãos na cabeça
    const POKE = [[1.9, 1.75], [0.1, 0.05]];        // braço esticado, dedo no balão

    function thought(s, x, y, size, k, a = 1) { if (k <= 0) return; const w = tw(s, size) + size * 1.3, h = size * 1.9; x = clamp(x, w / 2 + 14, W - w / 2 - 14); ctx.save(); ctx.translate(x, y); const sc = outBack(k); ctx.scale(sc, sc); ga(clamp(k * 3) * a);
      ctx.fillStyle = '#ececf0'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.shadowBlur = 0;
      txt(s, 0, 2, size, { color: '#26262b' }); ctx.restore(); ga(1); }
    function popFx(x, y, k) { if (k <= 0 || k >= 1) return; ctx.save(); ga(1 - k); ctx.strokeStyle = '#ececf0'; ctx.lineWidth = 4; for (let i = 0; i < 8; i++) { const a = i * TAU / 8, r0 = 20 + 60 * k, r1 = r0 + 22; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.stroke(); } ctx.restore(); ga(1); }

    // ---------- personagens ----------
    function drawB(t) {
      if (t > B.gone) return;
      let x = BX, dir = -1, arms = [[0.15, 0.1], [-0.12, -0.05]], legs = STAND, lean = 0, a = 1, s = S, tilt = 0;
      const pk = sm(t, B.poke - 0.3, B.poke) * (1 - sm(t, B.poke + 0.15, B.poke + 0.45));
      if (t < B.walk) { tilt = -0.25 * sm(t, B.bal, B.bal + 0.3) * (1 - pk); arms = [[lerp(0.15, POKE[0][0], pk), lerp(0.1, -2.6, pk)], [-0.12, -0.05]]; }
      else if (t < B.at) { const u = sm(t, B.walk, B.at, x => x), ph = t * 7; x = lerp(BX, DX0 + DW + 60, u); legs = walkPose(ph); arms = walkArms(ph); }
      else if (t < B.in) { x = DX0 + DW + 60; const reach = sm(t, B.knob - 0.3, B.knob); arms = [[lerp(0.15, 1.45, reach), lerp(0.1, 1.5, reach)], [-0.12, -0.05]]; if (t > B.open) arms = [[1.45 - sm(t, B.open, B.open + 0.5) * 0.4, 1.5], [-0.12, -0.05]]; }
      else { const u = sm(t, B.in, B.gone), ph = t * 7; x = lerp(DX0 + DW + 60, DX0 + DW / 2, u); s = S * lerp(1, 0.85, u); a = 1 - prog(t, B.gone - 0.5, B.gone); legs = walkPose(ph); arms = walkArms(ph); }
      figure({ x, y: FLOOR, s, dir, lean, a, headTilt: tilt, arms, ...legs });
      // o único "e se" do B
      const bk = prog(t, B.bal, B.bal + 0.25); 
    }
    function drawA(t) {
      const n = nAt(t), worry = clamp((n - 8) / 25) * (1 - sm(t, 15.3, 15.7));
      let x = AX, arms, legs = STAND, lean = -0.08 * worry, tilt = 0.2 * worry, a = 1, s = S;
      const shake = worry > 0.5 && t < 11.2 ? Math.sin(t * 30) * 2 : 0;
      arms = [[lerp(0.15, HEAD[0][0], worry), lerp(0.1, HEAD[0][1], worry)], [lerp(-0.12, HEAD[1][0], worry), lerp(-0.05, HEAD[1][1], worry)]];
      if (t < 4) tilt = -0.3 * sm(t, 0.9, 1.3);   // olha os balões subindo
      const pk = Math.max(sm(t, A.poke1 - 0.35, A.poke1) * (1 - sm(t, A.poke1 + 0.15, A.poke1 + 0.4)), sm(t, A.poke2 - 0.35, A.poke2) * (1 - sm(t, A.poke2 + 0.15, A.poke2 + 0.4)));
      if (t > 15.3 && t < A.walk) { arms = [[lerp(0.15, POKE[0][0], pk), lerp(0.1, POKE[0][1] - 0.3, pk)], [-0.12, -0.05]]; lean = 0.1 * pk; tilt = -0.2; }
      if (t >= A.walk && t < A.at) { const u = sm(t, A.walk, A.at, x => x), ph = t * 7; x = lerp(AX, DX0 - 60, u); legs = walkPose(ph); const jab = Math.max(0, Math.sin(t * 9)); arms = [[0.9 + jab * 0.9, 0.9 + jab * 0.7], walkArms(ph)[1]]; lean = 0.12; }
      if (t >= A.at && t < A.in) { x = DX0 - 60; const reach = sm(t, A.knob - 0.3, A.knob); arms = [[lerp(0.3, 1.45, reach), lerp(0.2, 1.5, reach)], [-0.12, -0.05]]; if (t > A.open) arms = [[1.45 - sm(t, A.open, A.open + 0.5) * 0.4, 1.5], [-0.12, -0.05]]; }
      if (t >= A.in) { const u = sm(t, A.in, A.gone), ph = t * 7; x = lerp(DX0 - 60, DX0 + DW / 2, u); s = S * lerp(1, 0.85, u); a = 1 - prog(t, A.gone - 0.5, A.gone); legs = walkPose(ph); arms = walkArms(ph); }
      if (a <= 0) return null;
      return figure({ x: x + shake, y: FLOOR, s, a, lean, headTilt: tilt, arms, ...legs });
    }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => { if (t >= 0 && t < END) cues.push(Object.assign({ t: +t.toFixed(3), type }, o)); };
    BAL.forEach(b => cue(b.t0, 'bubble', { gain: b.i < 8 ? 1 : b.i < 30 ? 0.5 : 0.25 }));
    BAL.forEach(b => cue(b.pop, 'pop', { gain: b.i === 3 || b.i === 0 ? 1 : 0.35 }));
    cue(B.bal, 'bubble'); cue(B.poke, 'pop'); cue(B.knob, 'knob'); cue(B.open, 'creak'); cue(B.shut + 0.4, 'door');
    cue(A.knob, 'knob'); cue(A.open, 'creak'); cue(A.open, 'flag');
    cue(0.8, 'swarm', { dur: 10.2 });
    HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 })); cue(FIN, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const Z = 1.3, ZC = 1350, zx = x => (x - 540) * Z + 540, zy = y => (y - ZC) * Z + ZC;
      const zoom = () => { ctx.save(); ctx.translate(540, ZC); ctx.scale(Z, Z); ctx.translate(-540, -ZC); };
      zoom(); ctx.drawImage(bgc, 0, 0);
      const dk = sm(t, B.open, B.open + 0.6) * (1 - sm(t, B.shut, B.shut + 0.6)) + sm(t, A.open, A.open + 0.6);
      const kt = sm(t, B.knob - 0.1, B.knob + 0.2) * (1 - sm(t, B.shut, B.shut + 0.3)) + sm(t, A.knob - 0.1, A.knob + 0.2);
      door(clamp(dk), clamp(kt));
      drawB(t); ctx.restore();
      // o único "e se" do B
      if (t < B.poke) thought('E SE DER ERRADO?', 800, 1010, 34, prog(t, B.bal, B.bal + 0.25)); popFx(800, 1010, prog(t, B.poke, B.poke + 0.35));
      // os "e se" do A (por trás dele, cobrindo a porta)
      for (const b of BAL) { if (t < b.t0 || t > b.pop + 0.4) continue; const k = prog(t, b.t0, b.t0 + 0.22), dx = Math.sin(t * 1.3 + b.ph) * 6, dy = Math.cos(t * 1.1 + b.ph) * 5;
        if (t < b.pop) thought(b.s, b.x + dx, b.y + dy, b.size, k); else popFx(b.x + dx, b.y + dy, prog(t, b.pop, b.pop + 0.35)); }
      zoom(); drawA(t); ctx.restore();
      // rótulos no chão
      const la = prog(t, 0.5, 0.9) * (1 - prog(t, 11.0, 11.3)), lb = prog(t, 0.5, 0.9) * (1 - prog(t, B.walk, B.walk + 0.3));
      spaced('PENSA DEMAIS', 210, zy(FLOOR) + 75, 34, { w: 900, sp: 6, a: la, color: RED }); spaced('VAI', zx(BX), zy(FLOOR) + 75, 34, { w: 900, sp: 6, a: lb });
      // contador
      const n = nAt(t), ck = prog(t, 1.0, 1.3) * (1 - prog(t, 11.0, 11.3));
      if (ck > 0 && n > 0) { const last = BAL[n - 1].t0, pp = 1 + 0.08 * Math.exp(-(t - last) * 8); spaced(`${n} "E SE"`, 540, 600, 52 * pp, { w: 900, sp: 10, a: ck }); ga(ck); ctx.fillStyle = RED; ctx.fillRect(470, 648, 140, 5); ga(1); }
      // gancho
      const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 10.9, 11.3)); if (h1 > 0) { spaced('OS DOIS VIRAM', 540, 340, 58, { a: h1, w: 900, sp: 12 }); spaced('A MESMA PORTA', 540, 430, 58, { a: h1 * prog(t, 0.6, 1.0), w: 900, sp: 12, color: RED }); }
      const h3 = prog(t, A.poke1, A.poke1 + 0.3) * (1 - prog(t, FIN - 0.4, FIN)); if (h3 > 0) { spaced('ESTOURA UM.', 540, 360, 58, { a: h3, w: 900, sp: 12 }); spaced('DEPOIS OUTRO.', 540, 450, 58, { a: h3 * prog(t, A.poke2, A.poke2 + 0.3), w: 900, sp: 12, color: RED }); }
      // HEADLINE
      const dim = prog(t, 11.2, 11.6) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ga(0.86 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['PENSAR', WHITE, 130], ['DEMAIS', WHITE, 130], ['TAMBÉM É', WHITE, 120], ['DESISTIR.', RED, 140]];
        L.forEach(([s, col, sz], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; txt(s, 540, 640 + i * 150 + (i >= 2 ? 60 : 0), sz, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // final
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.8 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('E SE', 540, 480, 170, { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))) });
        txt('DER CERTO?', 540, 650, 140, { color: RED, a: prog(t, FIN + 0.4, FIN + 0.75), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.4, FIN + 0.9))), glow: 'rgba(224,38,43,0.55)' });
        spaced('GIRA A MAÇANETA.', 540, 800, 40, { a: prog(t, 25.3, 25.9), w: 800, sp: 8 });
        spaced('MARCA QUEM PENSA DEMAIS', 540, 1730, 38, { a: prog(t, 26.3, 26.9), w: 900, sp: 7, color: RED }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
