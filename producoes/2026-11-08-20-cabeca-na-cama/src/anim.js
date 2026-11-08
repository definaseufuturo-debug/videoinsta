/*
 * "A CABEÇA NA CAMA" (Mindloop: a mente em bonequinhos). Dois na cama às 23h, luz apagada. O da direita dorme;
 * no teto em cima do da esquerda vão aparecendo os pensamentos pendentes (e-mail de amanhã, a frase de 2014,
 * "e se der errado?"...) cada vez mais rápido, enquanto o relógio VERMELHO corre: 23:00 → 03:12. Ele se revira.
 * Headline: "SUA CABEÇA NÃO RESOLVE NADA ÀS 3 DA MANHÃ." Virada: ele acende o abajur, pega um caderno e cada
 * pensamento desce do teto para o papel; o teto fica limpo, ele apaga a luz e dorme.
 * Final: "TIRA DA CABEÇA. PÕE NO PAPEL." 30 s, 9:16, sem narração.
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

  const WHITE = '#efefef', RED = '#e0262b', BG = '#08080b', WARM = '255,196,120';
  const FLOOR = 1650, BED = 1480, BEDB = 1300, S = 2.4, SBB = 2.0;
  const AH = { x: 470, y: BED - 26 }, BH = { x: 470, y: BEDB - 22 };   // B dorme na cama de trás        // quadril de cada um (A cabeça à esquerda, B à direita)
  const NS = { x0: 790, x1: 1000, top: 1400 };                                // criado-mudo entre as camas
  const CLK = { x: 850, y: NS.top - 24 }, LAMP = { x: 950, y: NS.top }, NBK = { x: 905, y: NS.top - 8 };
  // pensamentos: [instante, texto, x, y, rotação]
  const TH = [
    [1.0, 'E-MAIL DE AMANHÃ', 300, 590, -0.05], [2.0, 'AQUELA FRASE DE 2014', 400, 710, 0.04], [2.9, 'E SE DER ERRADO?', 270, 830, -0.03],
    [3.7, 'BOLETO DIA 10', 500, 940, 0.06], [4.4, 'TRANCOU A PORTA?', 290, 1050, -0.06], [5.0, 'PRECISO MALHAR', 520, 560, 0.05],
    [5.6, 'ELE FICOU BRAVO?', 300, 880, 0.07], [6.1, 'PROJETO ATRASADO', 480, 800, -0.07], [6.6, 'POR QUE EU DISSE AQUILO?', 380, 1120, 0.03],
    [7.0, 'ANIVERSÁRIO DA MÃE', 330, 640, 0.08], [7.4, 'E SE EU FOR DEMITIDO?', 430, 1000, -0.05], [7.8, 'RESPONDI ERRADO', 260, 740, -0.09],
    [8.1, 'E SE...?', 560, 680, 0.1], [8.4, 'E SE...?', 200, 960, -0.1], [8.7, 'E SE...?', 600, 1090, 0.06], [9.0, 'E SE...?', 420, 580, -0.08],
    [9.3, 'E SE...?', 190, 1120, 0.12], [9.6, 'E SE...?', 580, 900, -0.12]];
  const CLOCKS = [[0, '23:00'], [3.0, '23:47'], [5.0, '00:58'], [6.8, '01:36'], [8.3, '02:44'], [9.5, '03:12'], [15.3, '03:14'], [21.2, '03:30']];
  const TOSS = [2.4, 4.0, 5.4, 6.4, 7.2, 7.9, 8.5, 9.0, 9.4];
  const SITUP = 10.0, HL = [11.6, 12.2, 13.05, 13.6], HL_OUT = 15.1;
  const T5 = 15.3, LAMP_ON = 15.7, REACH = 16.0, HOLD = 16.4, W0 = 16.7, W1 = 20.0, CLOSE = 20.2, PLACE = 20.5, LAMP_OFF = 20.85, LIE = 21.0, ZZ = 21.7, FIN = 23.4;
  const WDT = (W1 - W0) / TH.length; // um pensamento por vez desce pro caderno (o último que apareceu desce primeiro)

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; const mw = o.maxW || 1000; const fit = Math.min(1, mw / Math.max(1, tw(s, size, o.w || 900))); ctx.save(); ctx.translate(x, y); const sc = (o.scale ?? 1) * fit; ctx.scale(sc, sc); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; const k = Math.min(1, (o.maxW || 1000) / tot); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); let cx = -tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, 0, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); ctx.restore(); }

    // ---------- cenário: quarto escuro, duas camas, criado-mudo ----------
    const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.stroke(); };
    const bgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const sp = g.createRadialGradient(780, 700, 30, 780, 700, 900); sp.addColorStop(0, 'rgba(150,170,220,0.07)'); sp.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sp; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 260); fg.addColorStop(0, '#202026'); fg.addColorStop(1, '#0c0c0f'); g.fillStyle = fg; g.fillRect(0, FLOOR, W, 260); g.fillStyle = '#34343a'; g.fillRect(0, FLOOR, W, 3);
      // janela com lua (lado de quem dorme)
      const wx = 800, wy = 620; g.fillStyle = '#12121a'; g.strokeStyle = '#30303a'; g.lineWidth = 6; g.fillRect(wx, wy, 220, 200); g.strokeRect(wx, wy, 220, 200); g.beginPath(); g.moveTo(wx + 110, wy); g.lineTo(wx + 110, wy + 200); g.moveTo(wx, wy + 100); g.lineTo(wx + 220, wy + 100); g.stroke();
      g.fillStyle = 'rgba(230,230,245,0.75)'; g.beginPath(); g.arc(wx + 160, wy + 50, 22, 0, TAU); g.fill(); g.fillStyle = '#12121a'; g.beginPath(); g.arc(wx + 171, wy + 42, 19, 0, TAU); g.fill();
      // cama de trás (B)
      g.fillStyle = '#18181e'; g.strokeStyle = '#33333b'; g.lineWidth = 3;
      rr(g, 150, BEDB, 620, 66, 10); g.fillRect(745, BEDB + 66, 14, 120); rr(g, 140, BEDB - 150, 28, 330, 8);
      g.fillStyle = '#26262e'; rr(g, 180, BEDB - 34, 130, 38, 18);
      // criado-mudo
      g.fillStyle = '#18181d'; rr(g, NS.x0, NS.top, NS.x1 - NS.x0, FLOOR - NS.top, 8); g.strokeStyle = '#2c2c33'; g.beginPath(); g.moveTo(NS.x0 + 10, NS.top + 90); g.lineTo(NS.x1 - 10, NS.top + 90); g.stroke();
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();
    const fgc = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = '#1d1d24'; g.strokeStyle = '#3a3a44'; g.lineWidth = 3;
      rr(g, 100, BED, 680, 84, 12); g.fillRect(118, BED + 84, 16, FLOOR - BED - 84); g.fillRect(744, BED + 84, 16, FLOOR - BED - 84); rr(g, 90, BED - 190, 34, 190 + FLOOR - BED, 8);
      g.fillStyle = '#2c2c35'; rr(g, 140, BED - 38, 150, 42, 20); return cv; })();

    // ---------- bonequinho na cama ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    // quadril em (x,y); ang = inclinação do tronco (0 em pé/sentado, -π/2 deitado pra trás); pernas esticadas sob a coberta
    function bedFig(o) {
      const s = o.s || S, dir = o.dir || 1, hr = 23, ang = o.ang;
      ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s);
      ctx.strokeStyle = WHITE; ctx.fillStyle = WHITE; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = 'rgba(255,255,255,0.25)'; ctx.shadowBlur = 10;
      limb(0, 0, 1.5, 1.62, 48, 46); limb(0, 0, 1.56, 1.62, 48, 46);   // pernas (cobertas)
      ctx.save(); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -66); ctx.stroke();
      const hands = (o.arms || [[0.3, 0.1], [0.2, 0.0]]).map(([u, l]) => limb(0, -62, u, l, 40, 38));
      const ht = o.headTilt || 0, hx = Math.sin(ht) * (hr + 11), hy = -66 - Math.cos(ht) * (hr + 11);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = BG; if (o.closed) { ctx.strokeStyle = BG; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx + hr * 0.25, hy - 2); ctx.lineTo(hx + hr * 0.5, hy - 2); ctx.moveTo(hx + hr * 0.6, hy - 2); ctx.lineTo(hx + hr * 0.85, hy - 2); ctx.stroke(); }
      else { const er = o.wide ? 5 : 3.4; ctx.beginPath(); ctx.arc(hx + hr * 0.38, hy - 3, er, 0, TAU); ctx.arc(hx + hr * 0.72, hy - 3, er, 0, TAU); ctx.fill(); }
      const m = ctx.getTransform(); ctx.restore();
      const toW = ([x, y]) => { return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; };
      const out = { head: toW([hx, hy]), hands: hands.map(toW) };
      ctx.restore();
      // coberta
      const up = clamp((ang + Math.PI / 2) / (Math.PI / 2)); const left = lerp(-80, -12, up);
      ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ctx.fillStyle = '#4a4a5a'; ctx.strokeStyle = '#60606f'; ctx.lineWidth = 2;
      const wob = o.wob || 0; ctx.beginPath(); ctx.moveTo(left, 22); ctx.bezierCurveTo(left - 4, -18 - wob, 40, -30 + wob, 100, -16); ctx.bezierCurveTo(118, -12, 124, 4, 122, 22); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      return out;
    }
    function thought(s, x, y, rot, k, a = 1, sc = 1) { if (k <= 0) return; const size = s.startsWith('E SE...') ? 40 : 36, w = tw(s, size) + 50, h = size * 1.8; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(outBack(k) * sc, outBack(k) * sc); ga(clamp(k * 3) * a);
      ctx.fillStyle = '#f2f2f2'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 18); ctx.fill(); ctx.shadowBlur = 0; ctx.restore(); ga(1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(outBack(k) * sc, outBack(k) * sc); txt(s, 0, 2, size, { color: s.startsWith('E SE') ? RED : '#1c1c22', a: clamp(k * 3) * a }); ctx.restore(); }
    function notebook(x, y, open, sc = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.fillStyle = '#f2efe6'; ctx.strokeStyle = '#999'; ctx.lineWidth = 2; const w = lerp(46, 92, open); ctx.beginPath(); ctx.roundRect(-w / 2, -30, w, 60, 4); ctx.fill(); ctx.stroke();
      if (open > 0.5) { ctx.strokeStyle = '#b8b4aa'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, 30); for (let i = 0; i < 4; i++) { ctx.moveTo(-40, -16 + i * 11); ctx.lineTo(-6, -16 + i * 11); ctx.moveTo(6, -16 + i * 11); ctx.lineTo(40, -16 + i * 11); } ctx.stroke(); } ctx.restore(); }
    function clockBox(s, k = 1) { ctx.save(); ctx.fillStyle = '#111116'; ctx.strokeStyle = '#2e2e36'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(CLK.x - 40, CLK.y - 22, 80, 44, 8); ctx.fill(); ctx.stroke(); ctx.restore(); txt(s, CLK.x, CLK.y + 2, 25, { color: RED, glow: 'rgba(224,38,43,0.7)', a: k }); }
    function lamp(on) { ctx.save(); if (on > 0) { const g = ctx.createRadialGradient(LAMP.x, LAMP.y + 40, 10, LAMP.x, LAMP.y + 40, 700); g.addColorStop(0, `rgba(${WARM},${0.34 * on})`); g.addColorStop(1, `rgba(${WARM},0)`); ctx.fillStyle = g; ctx.fillRect(0, 500, W, 1300); }
      ctx.fillStyle = '#2a2a30'; ctx.fillRect(LAMP.x - 30, LAMP.y - 8, 60, 8); ctx.fillRect(LAMP.x - 4, LAMP.y - 8, 8, 40);
      ctx.fillStyle = on > 0 ? `rgba(255,214,150,${0.35 + 0.65 * on})` : '#3a3a42'; ctx.beginPath(); ctx.moveTo(LAMP.x - 26, LAMP.y + 20); ctx.lineTo(LAMP.x + 26, LAMP.y + 20); ctx.lineTo(LAMP.x + 38, LAMP.y + 66); ctx.lineTo(LAMP.x - 38, LAMP.y + 66); ctx.closePath(); ctx.fill(); ctx.restore(); }
    function zzz(x, y, t, k) { if (k <= 0) return; for (let i = 0; i < 3; i++) { const u = ((t * 0.55 + i / 3) % 1); txt('Z', x + u * 90 + i * 4, y - u * 110, 40 + 30 * u, { color: '#cfd6e6', a: k * Math.sin(u * Math.PI) * 0.9, w: 800 }); } }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +t.toFixed(3), type }, o));
    cue(0.2, 'switch'); TH.forEach(([t0], i) => cue(t0, 'pop', { i })); CLOCKS.forEach(([t0], i) => { if (i > 0) cue(t0, 'tick'); }); TOSS.forEach(t0 => cue(t0, 'toss'));
    cue(SITUP, 'situp'); HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 }));
    cue(T5 + 0.1, 'sigh'); cue(LAMP_ON, 'switch'); cue(HOLD, 'paper'); for (let i = 0; i < TH.length; i++) if (i % 2 === 0) cue(W0 + i * WDT, 'write', { dur: WDT * 2 });
    cue(CLOSE, 'paper'); cue(LAMP_OFF, 'switch'); cue(LIE, 'toss'); cue(ZZ, 'sleep'); cue(FIN, 'final');

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.drawImage(bgc, 0, 0);
      const lampOn = sm(t, LAMP_ON, LAMP_ON + 0.25) * (1 - sm(t, LAMP_OFF, LAMP_OFF + 0.25));
      const roomLight = 1 - sm(t, 0.2, 0.5); if (roomLight > 0) { ctx.save(); ga(0.12 * roomLight); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); ga(1); }
      lamp(lampOn);
      const ck = CLOCKS.filter(([t0]) => t >= t0).pop()[1]; clockBox(ck);
      // B dorme (cabeça à direita)
      const breath = Math.sin(t * 2.2) * 2;
      const b = bedFig({ x: BH.x, y: BH.y, dir: 1, s: SBB, ang: -Math.PI / 2 + 0.02, closed: true, wob: breath, arms: [[0.2, 0.1], [0.1, 0.0]] });
      zzz(b.head[0] + 60, b.head[1] - 30, t, 1); ctx.drawImage(fgc, 0, 0);
      // A: deitado se revirando → senta → escreve → deita e dorme
      const up = sm(t, SITUP, SITUP + 0.4) * (1 - sm(t, LIE, LIE + 0.5));
      let wob = 0, jit = 0; for (const t0 of TOSS) { const u = prog(t, t0, t0 + 0.5); if (u > 0 && u < 1) { wob = Math.sin(u * Math.PI) * 16; jit = Math.sin(u * Math.PI * 2) * 0.1; } }
      const writing = t > HOLD && t < CLOSE + 0.1, reach = sm(t, REACH, HOLD) * (1 - sm(t, HOLD, HOLD + 0.3)) + sm(t, PLACE - 0.3, PLACE) * (1 - sm(t, PLACE, PLACE + 0.3));
      let arms = [[0.3, 0.1], [0.2, 0.0]];
      if (writing) arms = [[1.1, 2.0 + 0.15 * Math.sin(t * 18)], [0.9, 1.7]];
      else if (reach > 0) arms = [[lerp(0.6, 1.5, reach), lerp(0.4, 1.6, reach)], [0.2, 0.1]];
      else if (up > 0.5) arms = [[0.5, 0.3], [0.4, 0.2]];
      const sleeping = t > ZZ - 0.3;
      const a = bedFig({ x: AH.x, y: AH.y, ang: lerp(-Math.PI / 2 + jit, 0.12 + (reach > 0 ? 0.45 * reach : 0) + (writing ? 0.15 : 0), up), headTilt: writing ? 0.45 : up > 0.5 && t < 11.2 ? -0.5 : 0, wob, arms, wide: t > SITUP && t < 11.3, closed: sleeping });
      if (writing) { const hx = (a.hands[0][0] + a.hands[1][0]) / 2, hy = (a.hands[0][1] + a.hands[1][1]) / 2; notebook(hx + 6, hy + 8, sm(t, HOLD, HOLD + 0.2) * (1 - sm(t, CLOSE - 0.1, CLOSE + 0.1)), 1.9); }
      else if (t < REACH || t > PLACE) notebook(NBK.x, NBK.y, 0, 1.3);
      else { const k = t < HOLD ? sm(t, REACH, HOLD) : 1 - sm(t, CLOSE + 0.1, PLACE); notebook(lerp(NBK.x, a.hands[0][0], k), lerp(NBK.y, a.hands[0][1], k), 0, lerp(1.3, 1.6, k)); }
      if (sleeping) zzz(a.head[0] + 20, a.head[1] - 40, t + 0.4, prog(t, ZZ, ZZ + 0.5));
      // pensamentos no teto
      const nb = writing ? [(a.hands[0][0] + a.hands[1][0]) / 2, (a.hands[0][1] + a.hands[1][1]) / 2] : [AH.x + 100, AH.y - 180];
      TH.forEach(([t0, s, x, y, rot], i) => { const k = prog(t, t0 - 0.05, t0 + 0.2); if (k <= 0) return; const j = TH.length - 1 - i; const d0 = W0 + j * WDT, u = prog(t, d0, d0 + 0.45); if (u >= 1) return;
        const shake = t < SITUP + 0.5 ? Math.sin(t * 13 + i * 2) * 3 * prog(t, 6, 9.5) : 0;
        const e = inOut(u); thought(s, lerp(x + shake, nb[0], e), lerp(y, nb[1] - 10, e), rot * (1 - e), k, 1, lerp(1, 0.15, e)); });
      // "!"
      const ex = prog(t, SITUP + 0.3, SITUP + 0.5) * (1 - prog(t, 11.0, 11.2)); if (ex > 0) txt('!', a.head[0], a.head[1] - 110, 110, { color: RED, scale: outBack(ex), glow: 'rgba(224,38,43,0.6)' });
      // relógio grande no alto
      const bigk = 1 - prog(t, 11.0, 11.3) + prog(t, T5, T5 + 0.3) - prog(t, FIN - 0.3, FIN); const kc = clamp(bigk);
      if (kc > 0) { const last = CLOCKS.filter(([t0]) => t >= t0).pop()[0], pp = 1 + 0.1 * Math.exp(-(t - last) * 8); txt(ck, 540, 470, 120 * pp, { color: RED, glow: 'rgba(224,38,43,0.6)', a: kc }); }
      // gancho e rótulos
      const h1 = prog(t, 0.1, 0.4) * (1 - prog(t, 4.0, 4.3)); if (h1 > 0) { spaced('DOIS NA CAMA ÀS 23H.', 540, 230, 58, { a: h1, w: 900, sp: 9 }); spaced('SÓ UM DORMIU.', 540, 320, 58, { a: h1 * prog(t, 0.7, 1.0), w: 900, sp: 9, color: RED }); }
      const h2 = prog(t, 4.3, 4.6) * (1 - prog(t, 10.9, 11.2)); if (h2 > 0) { spaced('O CORPO DEITOU.', 540, 230, 58, { a: h2, w: 900, sp: 9 }); spaced('A CABEÇA NÃO.', 540, 320, 58, { a: h2 * prog(t, 4.8, 5.1), w: 900, sp: 9, color: RED }); }
      const h3 = prog(t, T5 + 0.1, T5 + 0.4) * (1 - prog(t, LIE - 0.2, LIE + 0.1)); if (h3 > 0) { spaced('ATÉ QUE ELE TIROU', 540, 230, 56, { a: h3, w: 900, sp: 8 }); spaced('TUDO DA CABEÇA.', 540, 320, 56, { a: h3 * prog(t, T5 + 0.5, T5 + 0.8), w: 900, sp: 8, color: RED }); }
      const h4 = prog(t, LIE + 0.2, LIE + 0.5) * (1 - prog(t, FIN - 0.2, FIN)); if (h4 > 0) { spaced('E FINALMENTE', 540, 230, 58, { a: h4, w: 900, sp: 9 }); spaced('DORMIU.', 540, 320, 58, { a: h4, w: 900, sp: 9, color: RED }); }
      // HEADLINE
      const dim = prog(t, 11.2, 11.6) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ga(0.86 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['SUA CABEÇA', WHITE], ['NÃO RESOLVE', WHITE], ['NADA ÀS', WHITE], ['3 DA MANHÃ.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; txt(s, 540, 650 + i * 150 + (i >= 2 ? 60 : 0), 124, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined, maxW: 980 }); }); }
      // final
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.7 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('TIRA DA CABEÇA.', 540, 480, 130, { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))), maxW: 990 });
        txt('PÕE NO PAPEL.', 540, 645, 130, { color: RED, a: prog(t, FIN + 0.35, FIN + 0.7), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.35, FIN + 0.85))), glow: 'rgba(224,38,43,0.55)', maxW: 990 });
        spaced('O PROBLEMA ESPERA ATÉ DE MANHÃ.', 540, 800, 38, { a: prog(t, 24.8, 25.4), w: 800, sp: 6, maxW: 980 });
        spaced('MARCA QUEM PENSA DEMAIS À NOITE', 540, 1760, 36, { a: prog(t, 26.0, 26.6), w: 900, sp: 7, color: RED, maxW: 980 }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
