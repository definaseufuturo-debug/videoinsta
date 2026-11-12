/*
 * ACHADINHOS — "por que a cebola faz chorar" + mini processador (produtos genéricos, sem marca), 9:16 (1080x1920)
 * Formato problema → solução: a ciência do problema primeiro, o achadinho só no fim, CTA "link na bio".
 * Toda ação visual é presa ao instante real em que a palavra é falada (build/timeline.json).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  function mulberry(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, u) => { const pa = hex(a), pb = hex(b); return 'rgb(' + pa.map((x, i) => Math.round(lerp(x, pb[i], clamp(u)))).join(',') + ')'; };

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration;
    const NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Gancho: cebola faz chorar', 'Células rompem', 'Gás com enxofre', 'Olho arde e lacrimeja', '2 truques', 'Achadinho: mini processador', 'CTA link na bio'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ------------------------------------------------ paleta
    const BG0 = '#1a0d06', BG1 = '#2e1a0e', GRID = 'rgba(255,200,140,0.07)', INK = '#140a04';
    const CH = '#f6c453', CHD = '#d99a2b', WET = '#b8a77a', AQ = '#6fd3ff', BLU = '#3a86ff', HOT = '#ff4d5e', OR = '#ff9f1c', WH = '#fbf6ee', MU = '#b39c86', Y = '#ffd166', GR = '#3ddc84', BAG = '#e2483d', BAG2 = '#b8322a';

    const R0 = mulberry(7);
    const grain = (() => { const cv = mk(540, 960), g = cv.getContext('2d'); for (let i = 0; i < 20000; i++) { const x = R0() * 540, y = R0() * 960, r = 0.4 + R0() * 1.1; g.fillStyle = R0() < 0.5 ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.12)'; g.fillRect(x, y, r, r); } return cv; })();
    const vig = (() => { const cv = mk(W, H), g = cv.getContext('2d'), gr = g.createRadialGradient(W / 2, H * 0.48, H * 0.25, W / 2, H * 0.5, H * 0.78); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ------------------------------------------------ primitivas
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) {
      if (o.scale !== undefined && o.scale <= 0.001) return;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
      ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha *= o.a ?? 1;
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || INK; ctx.strokeText(s, 0, 0); }
      ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore();
    }
    function rtxt(s, x, y, size, o = {}) {
      if (o.scale !== undefined && o.scale <= 0.001) return;
      const d = o.d ?? size * 0.07;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
      ctx.globalAlpha *= o.a ?? 1;
      ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = o.lw ?? size * 0.12; ctx.strokeStyle = INK; ctx.fillStyle = o.sh || INK;
      ctx.strokeText(s, d, d); ctx.fillText(s, d, d);
      ctx.strokeText(s, 0, 0); ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0);
      ctx.restore();
    }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function line(pts, w, col = WH, dash) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); }
    function circ(x, y, r, fill, lw = 0, sc = WH) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function soft(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    function chip(s, x, y, size, col, k, o = {}) {
      if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7;
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1));
      rr(-w / 2 + 8, -h / 2 + 8, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
      rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill();
      txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1);
    }
    function stampMark(x, y, s, k, o = {}) {
      if (k <= 0) return; const sc = lerp(2.4, 1, outC(k)) * (o.s || 1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1));
      const size = o.size || 84, w = tw(s, size, 900) + 70, h = size * 1.45, col = o.col || HOT;
      rr(-w / 2, -h / 2, w, h, 16); ctx.fillStyle = 'rgba(20,10,4,0.9)'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.stroke();
      rr(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); ctx.lineWidth = 4; ctx.stroke();
      txt(s, 0, 4, size, { w: 900, color: col });
      ctx.restore(); ga(1);
    }
    function bg(t, tint) {
      scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (tint) soft(W / 2, H * 0.42, 900, tint, 0.16);
      const off = (t * 30) % 90; ctx.lineWidth = 2; ctx.strokeStyle = GRID;
      for (let x = -90 + off; x < W + 90; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = -90 + off; y < H + 90; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
    function header(s = 'POR QUE ISSO ACONTECE?') { ga(0.85); const w = tw(s, 28, 800) + 70; rr(540 - w / 2, 110, w, 64, 32); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); txt(s, 540, 143, 28, { w: 800, color: MU }); ga(1); }

    // ------------------------------------------------ objetos genéricos
    const ONI = '#e9b07a', ONI2 = '#c98a55', ONIW = '#f6e6d2', GAS = '#b6f07a', TEAR = '#6fd3ff';
    // cebola inteira (ou cortada ao meio quando half > 0)
    function onion(x, y, r, half = 0, rot = 0) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      if (half < 0.5) {
        ctx.beginPath(); ctx.moveTo(0, -r * 1.25); ctx.bezierCurveTo(r * 0.25, -r * 0.9, r * 1.05, -r * 0.6, r, 0); ctx.bezierCurveTo(r * 0.95, r * 0.8, r * 0.4, r, 0, r); ctx.bezierCurveTo(-r * 0.4, r, -r * 0.95, r * 0.8, -r, 0); ctx.bezierCurveTo(-r * 1.05, -r * 0.6, -r * 0.25, -r * 0.9, 0, -r * 1.25); ctx.closePath();
        const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 4, 0, 0, r * 1.2); g.addColorStop(0, '#f6cf9c'); g.addColorStop(1, ONI2); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
        for (const k of [-0.5, 0, 0.5]) { ctx.beginPath(); ctx.moveTo(0, -r * 1.15); ctx.quadraticCurveTo(r * k * 1.4, 0, r * k * 0.4, r * 0.95); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(120,70,30,0.5)'; ctx.stroke(); }
        line([[0, -r * 1.25], [-6, -r * 1.5]], 7, '#7a5a2a'); line([[-10, r * 0.98], [-14, r * 1.12]], 4, '#a08060'); line([[10, r * 0.98], [14, r * 1.12]], 4, '#a08060');
      } else {
        ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.92, 0, 0, TAU); ctx.fillStyle = ONIW; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
        for (let i = 1; i <= 5; i++) { ctx.beginPath(); ctx.ellipse(0, r * 0.05 * i, r * (1 - i * 0.16), r * 0.92 * (1 - i * 0.16), 0, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(190,150,110,0.7)'; ctx.stroke(); }
      }
      ctx.restore();
    }
    function knife(x, y, s, rot, sharp = 0) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(320, -10); ctx.quadraticCurveTo(360, 20, 300, 60); ctx.lineTo(0, 60); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, 60); g.addColorStop(0, '#eef2f7'); g.addColorStop(1, '#9aa6b5'); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      rr(-190, 5, 190, 50, 18); ctx.fillStyle = '#3b2a20'; ctx.fill(); ctx.stroke(); circ(-140, 30, 7, '#bbb'); circ(-60, 30, 7, '#bbb');
      if (sharp > 0) { ga(sharp); line([[40, 58], [300, 58]], 4, '#ffffff'); soft(260, 56, 60, 'rgba(255,255,255,A)', 0.8); ga(1); }
      ctx.restore();
    }
    function eye(x, y, s, irr = 0, t = 0) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-160, 0); ctx.quadraticCurveTo(0, -130 * (1 - irr * 0.45), 160, 0); ctx.quadraticCurveTo(0, 130 * (1 - irr * 0.45), -160, 0); ctx.closePath();
      ctx.fillStyle = WH; ctx.fill(); ctx.save(); ctx.clip();
      if (irr > 0) { ga(irr); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; line([[Math.cos(a) * 160, Math.sin(a) * 80], [Math.cos(a) * 90, Math.sin(a) * 45 + 6], [Math.cos(a) * 70, Math.sin(a) * 30]], 3, HOT); } ga(1); }
      circ(0, 0, 58, '#5a3a22'); circ(0, 0, 28, INK); circ(14, -16, 10, WH); ctx.restore();
      ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
    }
    function tear(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -24); ctx.bezierCurveTo(18, 0, 18, 18, 0, 18); ctx.bezierCurveTo(-18, 18, -18, 0, 0, -24); ctx.fillStyle = TEAR; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    function wisp(x, y, s, a, t, ph = 0) { if (a <= 0) return; ga(a); ctx.save(); ctx.translate(x + Math.sin(t * 2 + ph) * 14, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, 40); ctx.bezierCurveTo(-30, 10, 30, -10, 0, -40); ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = GAS; ctx.stroke(); ctx.restore(); ga(1); }
    // mini processador genérico: copo transparente, tampa, lâminas; pieces 0..1
    function processor(x, y, s, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-190, -40, 380, 300, 40); ctx.fillStyle = 'rgba(200,230,255,0.18)'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(230,245,255,0.9)'; ctx.stroke();
      // pedaços de cebola
      const R = mulberry(5); const n = Math.round(4 + 26 * (o.pieces || 0));
      for (let i = 0; i < n; i++) { const px = (R() - 0.5) * 300, py = 200 - R() * 120 * (0.4 + (o.pieces || 0)); rr(px - 14, py - 10, 28, 20, 5); ctx.fillStyle = i % 3 ? ONIW : '#f1dcc0'; ctx.fill(); }
      if (o.pieces < 0.2) onion(0, 130, 80, 1);
      // lâminas girando
      ctx.save(); ctx.translate(0, 140); ctx.rotate(o.spin || 0); line([[-120, 0], [120, 0]], 10, '#c9d3e0'); line([[0, -40], [0, 40]], 8, '#c9d3e0'); ctx.restore(); line([[0, 0], [0, 140]], 10, '#9aa6b5');
      // gás preso dentro
      if (o.gas) for (let i = 0; i < 4; i++) wisp(-100 + i * 66, 30, 0.7, o.gas * 0.8, o.t || 0, i);
      // tampa e puxador
      rr(-210, -90, 420, 60, 24); ctx.fillStyle = '#2bb673'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      rr(-50, -130 - (o.pull || 0) * 60, 100, 44, 18); ctx.fillStyle = '#1f8f58'; ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // ================= tempos =================
    const s1 = { cor: wt('c1', 'cortou'), ceb: wt('c1', 'cebola'), cho: wt('c1', 'chorar'), emo: wt('c1', 'emocao'), gas: wt('c1', 'gas'), def: wt('c1', 'defender') };
    const s2 = { fac: wt('c2', 'faca'), rom: wt('c2', 'rompe'), cel: wt('c2', 'celulas'), dua: wt('c2', 'duas'), sep: wt('c2', 'separadas'), mis: wt('c2', 'misturam') };
    const s3 = { jun: wt('c3', 'juntas'), gas: wt('c3', 'gas'), enx: wt('c3', 'enxofre'), sob: wt('c3', 'sobe'), olh: wt('c3', 'olhos') };
    const s4 = { olh: wt('c4', 'olho'), ard: wt('c4', 'ardor'), lag: wt('c4', 'lagrima'), lav: wt('c4', 'lavar'), cor: wt('c4', 'corta'), gas: wt('c4', 'gas') };
    const s5 = { fac: wt('c5', 'faca'), afi: wt('c5', 'afiada'), esm: wt('c5', 'esmaga'), ceb: wt('c5', 'cebola'), gel: wt('c5', 'gelada'), sol: wt('c5', 'solta') };
    const s6 = { ach: wt('c6', 'achadinho'), min: wt('c6', 'mini'), pro: wt('c6', 'processador'), pic: wt('c6', 'pica'), tam: wt('c6', 'tampa'), fec: wt('c6', 'fechada'), den: wt('c6', 'dentro') };
    const s7 = { lin: wt('c7', 'link'), bio: wt('c7', 'bio'), com: wt('c7', 'comenta'), ode: wt('c7', 'odeia'), seg: wt('c7', 'segue') };
    cue(0, 'music', { part: 'intro' }); [0, 0.25, 0.5].forEach(d => cue(s1.cor + d, 'tap')); cue(s1.cho, 'water', { dur: 0.6, gain: 0.5 }); cue(s1.gas, 'impact', { gain: 0.8 });
    cue(B[1], 'music', { part: 'groove' }); cue(s2.rom, 'glitch', { dur: 0.3 }); cue(s2.mis, 'pop');
    cue(s3.gas, 'sizzle', { dur: 1.0, gain: 0.5 }); cue(s3.sob, 'riser', { dur: 0.6 });
    cue(s4.ard, 'stamp'); cue(s4.lag, 'water', { dur: 0.8, gain: 0.5 }); cue(s4.cor, 'tick', { dur: 0.6 });
    cue(s5.afi, 'sparkle'); cue(s5.gel, 'ding');
    cue(s6.ach, 'riser', { dur: 0.5 }); cue(s6.pro, 'success'); cue(s6.pic, 'scan', { dur: 0.8, gain: 0.6 }); cue(s6.fec, 'stamp');
    cue(B[6], 'music', { part: 'outro' }); cue(s7.lin, 'impact', { gain: 0.6 }); cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');

    // ================= cenas =================
    function scene1(t) {
      bg(t, 'rgba(182,240,122,A)');
      // tábua e cebola sendo cortada
      rr(160, 860, 760, 120, 30); ctx.fillStyle = '#a0723f'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      const chop = t > s1.cor - 0.1 && t < s1.gas ? Math.abs(Math.sin((t - s1.cor) * 9)) : 0;
      onion(540, 770, 130, t > s1.cor + 0.2 ? 1 : 0);
      knife(620, 560 + chop * 130, 1, 0.25);
      // gás e lágrimas
      const gk = prog(t, s1.cor + 0.3, s1.cho);
      for (let i = 0; i < 5; i++) wisp(430 + i * 55, 640 - ((t * 120 + i * 70) % 300), 0.8, gk * 0.7, t, i);
      const ek = sm(t, s1.cho - 0.3, s1.cho + 0.1, outBack); if (ek > 0) { eye(540, 380, 0.75 * ek, prog(t, s1.cho, s1.gas), t); for (let i = 0; i < 2; i++) { const d = ((t * 1.4 + i * 0.5) % 1); tear(470 + i * 140, 440 + d * 220, 0.9 * prog(t, s1.cho, s1.cho + 0.3)); } }
      const hk = sm(t, 0.15, 0.5, outBack) * (1 - prog(t, s1.cho - 0.5, s1.cho - 0.3));
      rtxt('POR QUE A CEBOLA', 540, 300, 76, { color: WH, scale: hk }); rtxt('FAZ CHORAR?', 540, 400, 96, { color: Y, scale: hk });
      stampMark(540, 1150, 'É UM GÁS', sm(t, s1.gas - 0.15, s1.gas + 0.2), { col: GAS, size: 88, rot: -0.08 });
      chip('DEFESA DA CEBOLA', 540, 1310, 40, OR, prog(t, s1.def - 0.2, s1.def + 0.15));
    }
    function scene2(t) {
      bg(t, 'rgba(255,209,102,A)'); header();
      // células (zoom): grade de células com dois "potes" separados
      const cx = 540, cy = 760, cut = sm(t, s2.rom - 0.2, s2.rom + 0.3);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = cx - 330 + c * 220, y = cy - 220 + r * 220, off = c >= 2 ? cut * 30 : -cut * 30;
        rr(x - 95 + off, y - 95, 190, 190, 40); ctx.fillStyle = 'rgba(246,230,210,0.15)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = cut > 0.5 && (c === 1 || c === 2) ? 'rgba(246,230,210,0.35)' : ONIW; ctx.stroke();
        const mixk = sm(t, s2.mis - 0.3, s2.mis + 0.5) * (c === 1 || c === 2 ? 1 : 0);
        circ(x - 35 + off + mixk * 30, y + mixk * 10, 26, Y, 4, INK); circ(x + 35 + off - mixk * 30, y - mixk * 10, 26, AQ, 4, INK); }
      // linha de corte da faca
      if (cut > 0) line([[540, cy - 360], [540, lerp(cy - 360, cy + 360, cut)]], 10, WH, [26, 14]);
      chip('CÉLULAS DA CEBOLA', 540, 330, 38, WH, prog(t, s2.cel - 0.2, s2.cel + 0.15));
      chip('SUBSTÂNCIA A', 330, 1150, 34, Y, prog(t, s2.dua - 0.2, s2.dua + 0.15)); chip('SUBSTÂNCIA B', 750, 1150, 34, AQ, prog(t, s2.dua, s2.dua + 0.3));
      txt('viviam separadas...', 540, 1260, 44, { w: 700, color: MU, a: prog(t, s2.sep - 0.2, s2.sep + 0.2) * (1 - prog(t, s2.mis, s2.mis + 0.3)) });
      rtxt('SE MISTURAM!', 540, 1270, 80, { color: OR, scale: sm(t, s2.mis - 0.2, s2.mis + 0.15, outBack) });
    }
    function scene3(t) {
      bg(t, 'rgba(182,240,122,A)'); header();
      onion(540, 1180, 150, 1);
      const gk = prog(t, s3.jun - 0.2, s3.gas + 0.4), up = sm(t, s3.sob - 0.2, s3.olh + 0.3);
      for (let i = 0; i < 8; i++) { const yy = 1040 - ((t * 160 + i * 90) % 520) - up * 120; wisp(400 + (i % 4) * 90, yy, 1.1, gk * 0.85, t, i); }
      for (let i = 0; i < 3; i++) { const k = prog(t, s3.enx - 0.1 + i * 0.12, s3.enx + 0.2 + i * 0.12); if (k > 0) { circ(380 + i * 160, 720 - i * 40, 46 * outBack(k), GAS, 5, INK); txt('S', 380 + i * 160, 722 - i * 40, 50, { w: 900, color: INK, a: k }); } }
      chip('ENXOFRE', 540, 560, 44, GAS, prog(t, s3.enx - 0.2, s3.enx + 0.2));
      const ek = sm(t, s3.olh - 0.3, s3.olh + 0.1, outBack); if (ek > 0) eye(540, 320, 0.7 * ek, prog(t, s3.olh, s3.olh + 0.4), t);
      if (up > 0) { ga(up); line([[880, 1000], [880, lerp(1000, 420, up)]], 12, GAS); ctx.beginPath(); ctx.moveTo(850, 440); ctx.lineTo(880, 390); ctx.lineTo(910, 440); ctx.closePath(); ctx.fillStyle = GAS; ctx.fill(); ga(1); }
    }
    function scene4(t) {
      bg(t, 'rgba(255,77,94,A)'); header();
      const irr = sm(t, s4.ard - 0.3, s4.ard + 0.3);
      eye(540, 620, 1.4, irr, t);
      for (let i = 0; i < 6; i++) wisp(260 + i * 110, 900 - ((t * 140 + i * 60) % 260), 0.9, 0.6 * (1 - prog(t, s4.lag, s4.lag + 1.5)), t, i);
      stampMark(540, 330, 'ARDOR', sm(t, s4.ard - 0.2, s4.ard + 0.2), { col: HOT, size: 80 });
      const tk = prog(t, s4.lag - 0.2, s4.lag + 0.3);
      if (tk > 0) for (let i = 0; i < 4; i++) { const d = ((t * 1.3 + i * 0.25) % 1); tear(330 + (i % 2) * 420, 760 + d * 380, 1.3 * tk); }
      chip('LÁGRIMA = LAVAGEM', 540, 1180, 44, TEAR, prog(t, s4.lav - 0.2, s4.lav + 0.15));
      const ck = sm(t, s4.cor - 0.2, s4.cor + 0.2, outBack); if (ck > 0) { ctx.save(); ctx.translate(540, 1360); ctx.scale(ck, ck); rr(-380, -70, 760, 140, 30); ctx.fillStyle = 'rgba(20,10,4,0.85)'; ctx.fill(); txt('+ CORTE  =  + GÁS', 0, 4, 60, { w: 900, color: GAS }); ctx.restore(); }
    }
    function scene5(t) {
      bg(t, 'rgba(111,211,255,A)'); header('2 TRUQUES QUE AJUDAM');
      const k1 = sm(t, s5.fac - 0.3, s5.fac + 0.1, outBack);
      if (k1 > 0) { ctx.save(); ctx.translate(540, 520); ctx.scale(k1, k1); rr(-430, -170, 860, 340, 36); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); knife(-120, -70, 0.9, 0, prog(t, s5.afi - 0.2, s5.afi + 0.3)); txt('1. FACA AFIADA', 0, 100, 50, { w: 900, color: WH }); txt('esmaga menos células', 0, 145, 34, { w: 700, color: MU, a: prog(t, s5.esm - 0.2, s5.esm + 0.2) }); ctx.restore(); }
      const k2 = sm(t, s5.ceb - 0.3, s5.gel + 0.1, outBack);
      if (k2 > 0) { ctx.save(); ctx.translate(540, 980); ctx.scale(k2, k2); rr(-430, -170, 860, 340, 36); ctx.fillStyle = 'rgba(111,211,255,0.12)'; ctx.fill(); onion(-200, -10, 90, 0); ga(0.5); ctx.fillStyle = 'rgba(200,240,255,1)'; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ctx.fillRect(-200 + Math.cos(a) * 130 - 5, -10 + Math.sin(a) * 130 - 5, 10, 10); } ga(1);
        txt('2. CEBOLA GELADA', 150, -30, 48, { w: 900, color: WH }); txt('solta menos gás', 150, 30, 38, { w: 700, color: AQ, a: prog(t, s5.sol - 0.2, s5.sol + 0.2) }); ctx.restore(); }
    }
    function scene6(t) {
      bg(t, 'rgba(61,220,132,A)'); header('O ACHADINHO QUE RESOLVE');
      const pk = sm(t, s6.min - 0.4, s6.pro, outBack);
      const pieces = sm(t, s6.pic - 0.1, s6.pic + 1.5), pull = Math.max(0, Math.sin((t - s6.pic) * 10)) * (t > s6.pic && t < s6.pic + 1.5 ? 1 : 0);
      if (pk > 0) processor(540, 680, 1.35 * pk, { pieces, spin: t * 18 * (pull > 0 ? 1 : 0.1), pull, gas: prog(t, s6.tam, s6.den), t });
      rtxt('MINI PROCESSADOR', 540, 330, 84, { color: GR, scale: sm(t, s6.pro - 0.25, s6.pro + 0.1, outBack) });
      chip('TAMPA FECHADA', 300, 1170, 40, GR, prog(t, s6.fec - 0.2, s6.fec + 0.15));
      const ek = sm(t, s6.den - 0.2, s6.den + 0.3, outBack); if (ek > 0) { eye(800, 1170, 0.45 * ek, 0, t); txt('SEM CHORO', 800, 1290, 40, { w: 900, color: Y, a: ek }); }
    }
    function scene7(t) {
      bg(t, 'rgba(255,209,102,A)'); header('ONDE ACHAR');
      const lk = sm(t, s7.lin - 0.25, s7.lin + 0.1, outBack);
      rtxt('LINK NA BIO', 540, 330, 120, { color: Y, sh: '#000', scale: lk });
      const pk = sm(t, s7.bio - 0.3, s7.bio + 0.1, outBack);
      if (pk > 0) { ctx.save(); ctx.translate(540, 640); ctx.scale(pk, pk);
        rr(-380, -150, 760, 300, 40); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.stroke();
        circ(-260, -40, 70, Y, 6, INK); txt('★', -260, -36, 70, { w: 900, color: INK });
        rr(-150, -90, 300, 34, 17); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill(); rr(-150, -40, 400, 24, 12); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
        const hl = 0.5 + 0.5 * Math.sin(t * 8); rr(-150, 10, 380, 64, 32); ctx.fillStyle = mix('#4fb3ff', Y, hl); ctx.fill(); txt('VITRINE DE OFERTAS', 40, 44, 30, { w: 900, color: INK });
        ctx.restore(); }
      const ck = sm(t, s7.com - 0.2, s7.com + 0.15, outBack);
      if (ck > 0) { ctx.save(); ctx.translate(540, 1020); ctx.scale(ck, ck); rr(-420, -90, 840, 180, 40); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
        txt('Qual comida você', 0, -26, 46, { w: 900, color: INK }); txt('mais odeia cortar?', 0, 34, 46, { w: 900, color: INK }); ctx.restore(); }
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1300); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(255,209,102,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : Y; ctx.fill(); txt(press ? 'INSCRITO ✓' : '+ INSCREVER', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
    }

    // ================= legendas =================
    const HL = new Set(['cebola', 'chorar', 'emocao', 'gas', 'defender', 'faca', 'rompe', 'celulas', 'separadas', 'misturam', 'enxofre', 'olhos', 'olho', 'ardor', 'lagrima', 'lavar', 'afiada', 'gelada', 'achadinho', 'mini', 'processador', 'tampa', 'fechada', 'link', 'bio', 'comenta', 'segue', 'achadinhos']);
    const groups = []; {
      let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); }
      flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; });
    }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return;
      scr(); const size = 70, font = `900 ${size}px Inter`;
      const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop;
      ctx.save(); ctx.translate(540, 1640); ctx.scale(sc, sc); ctx.globalAlpha = a;
      let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? Y : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // ================= composição =================
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    const XT = 0.16;
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / XT);
      scr(); ctx.globalAlpha = 0.22; const f = Math.floor(t * 12); ctx.drawImage(grain, -((f * 37) % 40), -((f * 53) % 40), W + 40, H + 40); ctx.globalAlpha = 1; ctx.drawImage(vig, 0, 0);
      if (fl > 0) { ctx.globalAlpha = clamp(fl) * 0.85; ctx.fillStyle = '#0a0503'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t);
      txt('animação e voz feitas com IA', 540, 1840, 26, { w: 600, color: 'rgba(255,255,255,0.45)' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
