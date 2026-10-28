/*
 * GELADEIRA POR DENTRO — raio-X do ciclo de refrigeração (geladeira genérica, sem marca), 9:16 (1080x1920)
 * Diagrama de corte lateral: evaporador (dentro), sucção, compressor, condensador (grade atrás) e tubo capilar.
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
    const NAMES = ['Gancho: atrás está quente', 'Gás ferve a -12 °C', 'Capilar + evaporador', 'Compressor', 'Condensador', 'Ciclo + parede', 'CTA'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ------------------------------------------------ paleta
    const BG0 = '#061226', BG1 = '#0d2240', GRID = 'rgba(120,180,255,0.07)', INK = '#081020';
    const ICE = '#7fd8ff', BLU = '#3a86ff', HOT = '#ff4d5e', OR = '#ff9f1c', WH = '#f4f6fb', MU = '#8a94b3', Y = '#ffd166', TE = '#2ec4b6';

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
      rr(-w / 2, -h / 2, w, h, 16); ctx.fillStyle = 'rgba(8,16,32,0.9)'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.stroke();
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
    function header() { ga(0.85); rr(290, 110, 500, 64, 32); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); txt('COMO FUNCIONA POR DENTRO', 540, 143, 28, { w: 800, color: MU }); ga(1); }

    // ------------------------------------------------ a geladeira (corte lateral) e o circuito do gás
    const FX0 = 150, FX1 = 690, FY0 = 440, FY1 = 1400, DIV = 700;
    // circuito: [x, y, tipo] — cap = tubo capilar, evap = evaporador, suc = sucção, comp = compressor, cond = condensador
    const PATH = [];
    const push = (pts, kind) => pts.forEach(p => PATH.push([p[0], p[1], kind]));
    push([[210, 400], [210, 490]], 'cap');
    push([[210, 490], [630, 490], [630, 560], [210, 560], [210, 630], [630, 630]], 'evap');
    push([[730, 630], [730, 1300], [790, 1330]], 'suc');
    push([[850, 1330], [900, 1290], [900, 1230]], 'comp');
    { const rows = []; for (let i = 0; i <= 10; i++) { const y = 1230 - i * 76, a = i % 2 ? 770 : 900, b = i % 2 ? 900 : 770; rows.push([a, y], [b, y]); } push(rows, 'cond'); }
    push([[770, 470], [770, 400], [210, 400]], 'cap');
    const SEG = []; let LEN = 0;
    for (let i = 0; i < PATH.length; i++) { const a = PATH[i], b = PATH[(i + 1) % PATH.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); SEG.push({ a, b, l, s0: LEN, kind: a[2] }); LEN += l; }
    const KSPAN = {}; for (const s of SEG) { const k = KSPAN[s.kind] = KSPAN[s.kind] || [1e9, -1e9]; k[0] = Math.min(k[0], s.s0); k[1] = Math.max(k[1], s.s0 + s.l); }
    function at(u) { let d = ((u % 1) + 1) % 1 * LEN; for (const s of SEG) if (d <= s.s0 + s.l) { const v = s.l ? (d - s.s0) / s.l : 0; return [lerp(s.a[0], s.b[0], v), lerp(s.a[1], s.b[1], v), s.kind, d]; } return [SEG[0].a[0], SEG[0].a[1], 'cap', 0]; }
    function gasCol(kind, d) {
      const [k0, k1] = KSPAN[kind] || [0, 1], u = clamp((d - k0) / Math.max(1, k1 - k0));
      if (kind === 'evap') return mix(ICE, BLU, u);
      if (kind === 'suc') return BLU;
      if (kind === 'comp') return mix(BLU, HOT, u);
      if (kind === 'cond') return mix(HOT, OR, u);
      return mix(OR, ICE, u); // capilar
    }
    function pipeLine(kind, w, col) { ctx.beginPath(); let started = false; for (const s of SEG) { if (s.kind !== kind) { started = false; continue; } if (!started) { ctx.moveTo(s.a[0], s.a[1]); started = true; } ctx.lineTo(s.b[0], s.b[1]); } ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }

    function food(t, warm) {
      // prateleiras
      line([[FX0 + 30, 960], [FX1 - 30, 960]], 6, 'rgba(255,255,255,0.35)'); line([[FX0 + 30, 1190], [FX1 - 30, 1190]], 6, 'rgba(255,255,255,0.35)');
      if (warm > 0) { soft(330, 880, 200, 'rgba(255,159,28,A)', 0.45 * warm); soft(480, 1100, 200, 'rgba(255,159,28,A)', 0.45 * warm); soft(300, 1320, 180, 'rgba(255,159,28,A)', 0.35 * warm); }
      // garrafa
      rr(250, 1230, 70, 150, 18); ctx.fillStyle = '#5fd38d'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); rr(268, 1200, 34, 36, 8); ctx.fillStyle = '#3aa86b'; ctx.fill(); ctx.stroke();
      // caixa de leite
      rr(360, 1250, 90, 130, 8); ctx.fillStyle = WH; ctx.fill(); ctx.stroke(); rr(360, 1290, 90, 40, 0); ctx.fillStyle = BLU; ctx.fill();
      // frutas
      circ(300, 920, 34, HOT, 5, INK); circ(370, 925, 30, '#ffb347', 5, INK); line([[300, 886], [306, 872]], 5, '#3aa86b');
      // pote
      rr(450, 890, 150, 60, 14); ctx.fillStyle = '#e8d6b0'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); rr(440, 880, 170, 18, 8); ctx.fillStyle = '#c94f7c'; ctx.fill();
      // bolo / queijo
      ctx.beginPath(); ctx.moveTo(420, 1180); ctx.lineTo(600, 1180); ctx.lineTo(600, 1110); ctx.closePath(); ctx.fillStyle = Y; ctx.fill(); ctx.stroke();
      circ(530, 1160, 10, '#e0b040'); circ(570, 1150, 7, '#e0b040');
      // ovos
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(250 + i * 50, 1160, 20, 26, 0, 0, TAU); ctx.fillStyle = '#fff3e0'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
    }
    function compressor(hl) {
      const x = 820, y = 1335;
      if (hl > 0) soft(x, y, 200, 'rgba(255,209,102,A)', 0.55 * hl);
      rr(x - 75, y - 50, 150, 100, 46); ctx.fillStyle = '#2b3446'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = hl > 0.3 ? Y : '#5d6b85'; ctx.stroke();
      rr(x - 40, y - 28, 80, 14, 7); ctx.fillStyle = '#44506a'; ctx.fill();
      rr(x - 90, y + 44, 180, 14, 6); ctx.fillStyle = '#1b2232'; ctx.fill();
    }
    // o = { hl: {cap,evap,comp,cond}, flow, heatIn, heatOut, wall, warm, a }
    function fridge(t, o = {}) {
      const hl = o.hl || {};
      // sombra + corpo
      rr(FX0 + 16, FY0 + 16, FX1 - FX0, FY1 - FY0, 40); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();
      rr(FX0, FY0, FX1 - FX0, FY1 - FY0, 40); ctx.fillStyle = '#dfe6ef'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
      // interior (corte)
      const cold = o.cold ?? 0.6;
      rr(FX0 + 26, FY0 + 26, FX1 - FX0 - 52, DIV - FY0 - 40, 20); ctx.fillStyle = mix('#1d3555', '#123d6e', cold); ctx.fill();
      rr(FX0 + 26, DIV + 14, FX1 - FX0 - 52, FY1 - DIV - 40, 20); ctx.fillStyle = mix('#203a5a', '#17406a', cold); ctx.fill();
      if (cold > 0.3) soft(420, 560, 300, 'rgba(127,216,255,A)', 0.25 * cold);
      food(t, o.warm || 0);
      // pés
      rr(FX0 + 40, FY1 - 6, 60, 30, 8); ctx.fillStyle = '#556'; ctx.fill(); rr(FX1 - 100, FY1 - 6, 60, 30, 8); ctx.fill();
      // canos (base)
      for (const kind of ['evap', 'suc', 'comp', 'cond', 'cap']) {
        const h = hl[kind] || 0, wv = kind === 'cap' ? 8 : 18;
        if (h > 0) pipeLine(kind, wv + 22, `rgba(255,209,102,${0.55 * h})`);
        pipeLine(kind, wv + 8, INK); pipeLine(kind, wv, kind === 'cap' ? '#c9a46a' : '#8796ad');
      }
      compressor(hl.comp || 0);
      // gás circulando
      const fl = o.flow ?? 1;
      if (fl > 0) { const N = 70, sp = 0.045; ga(fl * (o.a ?? 1)); for (let i = 0; i < N; i++) { const [x, y, kind, d] = at(i / N + t * sp); const r = kind === 'cap' ? 5 : kind === 'cond' && d > (KSPAN.cond[0] + KSPAN.cond[1]) / 2 ? 8 : 7; circ(x, y, r, gasCol(kind, d)); } ga(o.a ?? 1); }
      // calor entrando (comida -> evaporador)
      if (o.heatIn > 0) { const k = o.heatIn; for (const [x0, y0] of [[330, 900], [520, 900], [300, 1150], [500, 1140]]) heatWave(x0, y0, x0 + 20, 640, k, t); }
      // calor saindo (grade -> cozinha)
      if (o.heatOut > 0) { const k = o.heatOut, wl = o.wall || 0;
        for (let j = 0; j < 4; j++) { const ph = ((t * 0.9 + j / 4) % 1), r = lerp(40, wl > 0.5 ? 70 : 230, ph); ga(k * (1 - ph) * (o.a ?? 1));
          for (const yy of [600, 850, 1100]) { ctx.beginPath(); ctx.arc(905, yy, r, -0.9, 0.9); ctx.lineWidth = 10; ctx.strokeStyle = OR; ctx.lineCap = 'round'; ctx.stroke(); } }
        ga(o.a ?? 1); }
      // parede
      if (o.wall > 0) { const x = lerp(1180, 945, outC(o.wall)); ctx.fillStyle = '#6b5a4a'; ctx.fillRect(x, 300, 260, 1200); ctx.strokeStyle = '#4a3d31'; ctx.lineWidth = 4; for (let yy = 300; yy < 1500; yy += 60) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + 260, yy); ctx.stroke(); for (let xx = x + ((yy / 60) % 2 ? 30 : 0); xx < x + 260; xx += 60) { ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + 60); ctx.stroke(); } } }
    }
    function heatWave(x0, y0, x1, y1, k, t) {
      const n = 22; ctx.beginPath();
      for (let j = 0; j <= n; j++) { const u = j / n; if (u > k) break; const x = lerp(x0, x1, u) + Math.sin(u * 12 - t * 8) * 12, y = lerp(y0, y1, u); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.lineWidth = 9; ctx.strokeStyle = OR; ctx.lineCap = 'round'; ctx.setLineDash([18, 14]); ctx.lineDashOffset = t * 60; ctx.stroke(); ctx.setLineDash([]);
      if (k >= 1) { const ah = (t * 1.2) % 1; circ(lerp(x0, x1, ah) + Math.sin(ah * 12 - t * 8) * 12, lerp(y0, y1, ah), 12, Y); }
    }
    function hand(x, y, s) { // mão genérica (palma aberta, vista lateral)
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-10, -70, 150, 150, 50); ctx.fillStyle = '#f2b38a'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      for (let i = 0; i < 4; i++) { rr(-80, -62 + i * 36, 110, 30, 15); ctx.fillStyle = '#f2b38a'; ctx.fill(); ctx.stroke(); }
      rr(120, -40, 160, 100, 30); ctx.fillStyle = '#4a6fa5'; ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    function thermo(x, y, lv, col, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-26, -200, 52, 230, 26); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      circ(0, 50, 46, WH, 6, INK); circ(0, 50, 34, col);
      const hh = 200 * clamp(lv); rr(-12, 30 - hh, 24, hh + 10, 12); ctx.fillStyle = col; ctx.fill();
      for (let i = 0; i < 6; i++) line([[14, -170 + i * 34], [24, -170 + i * 34]], 4, INK);
      ctx.restore();
    }

    // ================= CENA 1 — GANCHO =================
    const s1 = { enc: wt('c1', 'encosta'), mao: wt('c1', 'mao'), atr: wt('c1', 'atras'), que: wt('c1', 'quente'), cal: wt('c1', 'calor'), com: wt('c1', 'comida'), nao: wt('c1', 'nao'), cri: wt('c1', 'cria'), fri: wt('c1', 'frio'), tir: wt('c1', 'tira'), cal2: wt('c1', 'calor', 1) };
    cue(0, 'music', { part: 'intro' }); cue(0.25, 'whoosh', { dur: 0.5 }); cue(0.4, 'pop'); cue(s1.mao - 0.1, 'swoosh'); cue(s1.que, 'sizzle', { dur: 0.6 }); cue(s1.com, 'scan', { dur: 0.7, gain: 0.6 }); cue(s1.cri, 'stamp'); cue(s1.cri, 'impact', { gain: 0.7 }); cue(s1.tir, 'sparkle'); cue(s1.tir, 'music', { part: 'groove' });
    function scene1(t) {
      bg(t, 'rgba(255,77,94,A)'); header();
      const tk = sm(t, 0.1, 0.5, outBack);
      rtxt('GELADEIRA', 540, 250, 118, { color: WH, sh: '#000', scale: tk });
      chip('POR DENTRO', 540, 345, 36, ICE, prog(t, 0.3, 0.6));
      fridge(t, { flow: prog(t, s1.com - 0.2, s1.com + 0.4), heatOut: prog(t, s1.que - 0.3, s1.que + 0.3), heatIn: prog(t, s1.com, s1.com + 0.6), warm: prog(t, s1.com - 0.2, s1.com + 0.3), hl: { cond: pulse(t, s1.atr, 0.1, 1.2) } });
      // mão chegando atrás
      const hk = sm(t, s1.enc - 0.1, s1.mao + 0.3, outC), jerk = pulse(t, s1.que + 0.05, 0.08, 0.35);
      if (hk > 0 && t < s1.cri) hand(lerp(1200, 975, hk) + jerk * 40, 860, 0.9);
      chip('QUENTE!', 900, 720, 46, HOT, prog(t, s1.que - 0.1, s1.que + 0.15) * (1 - prog(t, s1.cri - 0.2, s1.cri)), { tc: WH });
      // não cria frio / tira o calor
      stampMark(420, 820, 'NÃO CRIA FRIO', prog(t, s1.cri - 0.05, s1.cri + 0.12), { size: 70 });
      chip('ELA TIRA O CALOR', 420, 1060, 48, Y, prog(t, s1.tir - 0.15, s1.tir + 0.15));
    }

    // ================= CENA 2 — o gás que ferve a -12 °C =================
    const s2 = { den: wt('c2', 'dentro'), can: wt('c2', 'canos'), gas: wt('c2', 'gas'), fer: wt('c2', 'ferve'), doz: wt('c2', 'doze'), gra: wt('c2', 'graus'), aba: wt('c2', 'abaixo'), zer: wt('c2', 'zero') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.can, 'water', { dur: 0.6 }); cue(s2.gas, 'pop'); cue(s2.fer, 'sizzle', { dur: 1.0 }); cue(s2.doz, 'tick', { dur: 0.5 }); cue(s2.zer, 'ding');
    function scene2(t) {
      bg(t, 'rgba(127,216,255,A)'); header();
      rtxt('O GÁS DOS CANOS', 540, 290, 76, { color: WH, sh: '#000', scale: sm(t, s2.can - 0.3, s2.can + 0.1, outBack) });
      // cano em corte com líquido fervendo
      const pk = sm(t, B[1], B[1] + 0.5, outC);
      ga(pk);
      rr(90, 1110, 900, 220, 110); ctx.fillStyle = '#8796ad'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
      rr(120, 1140, 840, 160, 80); ctx.fillStyle = '#0f1d33'; ctx.fill();
      const boil = prog(t, s2.fer - 0.1, s2.fer + 0.5);
      rr(120, lerp(1200, 1235, boil), 840, lerp(100, 65, boil), 50); ctx.fillStyle = ICE; ctx.fill();
      const R = mulberry(3);
      for (let i = 0; i < 40; i++) { const x = 150 + R() * 780, sp = 0.5 + R(), ph = (t * sp + R()) % 1; if (boil <= 0) continue; const y = lerp(1290, 1150, ph); ga(pk * boil * (1 - ph)); circ(x + Math.sin(ph * 9 + i) * 8, y, 6 + 10 * ph, null, 4, WH); }
      ga(1);
      txt('gás refrigerante (isobutano)', 540, 1370, 34, { w: 700, color: MU, a: prog(t, s2.gas, s2.gas + 0.3) });
      // termômetro + número
      const tk = sm(t, s2.fer - 0.3, s2.fer, outBack), v = -Math.round(12 * outC(prog(t, s2.doz - 0.1, s2.gra + 0.1)));
      if (tk > 0) thermo(200, 820, lerp(0.75, 0.25, prog(t, s2.doz - 0.1, s2.gra + 0.1)), ICE, tk);
      chip('FERVE A', 600, 520, 50, Y, prog(t, s2.fer - 0.15, s2.fer + 0.15));
      if (t > s2.doz - 0.3) rtxt(`${v}°C`, 620, 760, 210, { color: ICE, sh: '#000', scale: sm(t, s2.doz - 0.3, s2.doz, outBack) });
      chip('ABAIXO DE ZERO', 620, 960, 42, WH, prog(t, s2.aba - 0.15, s2.aba + 0.15));
    }

    // ================= CENA 3 — capilar + evaporador =================
    const s3 = { pas: wt('c3', 'passa'), tub: wt('c3', 'tubo'), fin: wt('c3', 'fininho'), per: wt('c3', 'perde'), pre: wt('c3', 'pressao'), eva: wt('c3', 'evapora'), den: wt('c3', 'dentro'), eva2: wt('c3', 'evaporar'), rou: wt('c3', 'rouba'), cal: wt('c3', 'calor'), com: wt('c3', 'comida') };
    cue(s3.tub, 'swoosh'); cue(s3.per, 'minus'); cue(s3.eva, 'sparkle'); cue(s3.rou, 'whoosh', { dur: 0.5 }); cue(s3.cal, 'wind', { dur: 1.0 }); cue(s3.com, 'pop');
    function scene3(t) {
      bg(t, 'rgba(127,216,255,A)'); header();
      const capH = sm(t, s3.tub - 0.2, s3.tub + 0.2) * (1 - prog(t, s3.eva, s3.eva + 0.4)), evH = sm(t, s3.eva - 0.2, s3.eva + 0.2);
      fridge(t, { hl: { cap: capH, evap: evH }, heatIn: prog(t, s3.rou - 0.1, s3.cal + 0.4), warm: prog(t, s3.rou - 0.2, s3.rou + 0.2) * (1 - 0.5 * prog(t, s3.com, s3.com + 1)), cold: lerp(0.4, 0.95, evH) });
      chip('TUBO CAPILAR', 480, 330, 42, '#c9a46a', prog(t, s3.tub - 0.1, s3.fin + 0.1) * (1 - prog(t, s3.eva - 0.2, s3.eva)));
      if (t > s3.pre - 0.15 && t < s3.eva) chip('PERDE PRESSÃO ▼', 480, 330, 42, WH, prog(t, s3.pre - 0.15, s3.pre + 0.1));
      chip('EVAPORA', 420, 330, 52, ICE, prog(t, s3.eva - 0.1, s3.eva + 0.15) * (1 - prog(t, s3.rou - 0.2, s3.rou)));
      if (t > s3.rou - 0.2) rtxt('ROUBA O CALOR', 540, 300, 80, { color: OR, sh: '#000', scale: sm(t, s3.rou - 0.2, s3.rou + 0.1, outBack) });
      // termômetro da comida caindo
      if (t > s3.cal - 0.2) { const k = sm(t, s3.cal - 0.2, s3.cal + 0.1, outBack); thermo(980, 1060, lerp(0.7, 0.3, prog(t, s3.cal, s3.com + 0.8)), mix(OR, ICE, prog(t, s3.cal, s3.com + 0.8)), 0.8 * k); }
    }

    // ================= CENA 4 — compressor =================
    const s4 = { dep: wt('c4', 'depois'), com: wt('c4', 'compressor'), mot: wt('c4', 'motor'), emb: wt('c4', 'embaixo'), ape: wt('c4', 'aperta'), apd: wt('c4', 'apertado'), mui: wt('c4', 'muito'), que: wt('c4', 'quente') };
    cue(s4.com, 'ding'); cue(s4.mot, 'engine', { dur: 2.2, f0: 50, f1: 70, gain: 0.5 }); cue(s4.ape, 'squeeze'); cue(s4.apd, 'squeeze'); cue(s4.que, 'fire');
    function scene4(t) {
      bg(t, 'rgba(255,77,94,A)'); header();
      const ch = sm(t, s4.com - 0.2, s4.com + 0.2);
      fridge(t, { hl: { comp: ch, suc: 0 }, flow: 1 });
      rtxt('COMPRESSOR', 540, 290, 86, { color: Y, sh: '#000', scale: sm(t, s4.com - 0.25, s4.com + 0.1, outBack) });
      // seta para o compressor
      const ak = prog(t, s4.emb - 0.2, s4.emb + 0.2); if (ak > 0) { ga(ak); line([[700, 1500], [770, 1420]], 10, Y); ctx.beginPath(); ctx.moveTo(785, 1400); ctx.lineTo(752, 1415); ctx.lineTo(775, 1440); ctx.closePath(); ctx.fillStyle = Y; ctx.fill(); txt('O MOTOR LÁ EMBAIXO', 470, 1505, 34, { w: 900, color: Y, stroke: 8 }); ga(1); }
      // janela: pistão apertando o gás
      const ik = sm(t, s4.ape - 0.35, s4.ape, outBack);
      if (ik > 0) {
        ctx.save(); ctx.translate(420, 1010); ctx.scale(ik, ik);
        rr(-250, -260, 500, 500, 30); ctx.fillStyle = 'rgba(8,16,32,0.94)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = Y; ctx.stroke();
        const sq = sm(t, s4.ape, s4.apd + 0.3) * 0.5 + 0.5 * Math.max(0, Math.sin((t - s4.ape) * 6)) * prog(t, s4.ape, s4.ape + 0.2) * (1 - prog(t, s4.apd, s4.apd + 0.3));
        const top = lerp(-150, 30, clamp(sq));
        rr(-150, -200, 300, 360, 14); ctx.fillStyle = '#1a2840'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#8796ad'; ctx.stroke();
        const hot = prog(t, s4.apd, s4.que + 0.3);
        ctx.fillStyle = mix('#123d6e', '#7a1a26', hot); ctx.fillRect(-144, top, 288, 154 - top);
        const R = mulberry(9); for (let i = 0; i < 26; i++) { const x = -130 + R() * 260, y = lerp(top + 14, 140, R()); circ(x + Math.sin(t * 9 + i) * 4, y + Math.cos(t * 7 + i) * 4, 9, mix(BLU, HOT, hot)); }
        rr(-150, -200, 300, top + 196, 12); ctx.fillStyle = '#b8c4d6'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
        line([[0, -230], [0, top - 10]], 26, '#8796ad');
        txt('▼', 0, top - 50, 60, { w: 900, color: Y });
        if (hot > 0) soft(0, 80, 260, 'rgba(255,77,94,A)', 0.5 * hot);
        ctx.restore();
      }
      chip('MUITO QUENTE', 420, 1300, 50, HOT, prog(t, s4.que - 0.2, s4.que + 0.1), { tc: WH });
    }

    // ================= CENA 5 — condensador =================
    const s5 = { que: wt('c5', 'quente'), gra: wt('c5', 'grade'), sol: wt('c5', 'solta'), coz: wt('c5', 'cozinha'), vir: wt('c5', 'vira'), liq: wt('c5', 'liquido') };
    cue(s5.gra, 'scan', { dur: 0.8, gain: 0.6 }); cue(s5.sol, 'wind', { dur: 1.2 }); cue(s5.coz, 'pop'); cue(s5.liq, 'water', { dur: 0.6 });
    function scene5(t) {
      bg(t, 'rgba(255,159,28,A)'); header();
      const gh = sm(t, s5.gra - 0.2, s5.gra + 0.2);
      fridge(t, { hl: { cond: gh }, heatOut: prog(t, s5.sol - 0.2, s5.sol + 0.4), cold: 0.9 });
      chip('A GRADE DE TRÁS', 420, 330, 46, Y, prog(t, s5.gra - 0.15, s5.gra + 0.15) * (1 - prog(t, s5.sol - 0.2, s5.sol)));
      if (t > s5.sol - 0.2) rtxt('SOLTA O CALOR', 540, 300, 80, { color: OR, sh: '#000', scale: sm(t, s5.sol - 0.2, s5.sol + 0.1, outBack) * (1 - prog(t, s5.vir - 0.2, s5.vir)) });
      chip('NA COZINHA', 900, 1480, 40, OR, prog(t, s5.coz - 0.15, s5.coz + 0.15));
      if (t > s5.vir - 0.2) { rtxt('VIRA LÍQUIDO', 540, 300, 80, { color: ICE, sh: '#000', scale: sm(t, s5.vir - 0.2, s5.liq, outBack) });
        // gotas descendo pela grade
        for (let i = 0; i < 5; i++) { const ph = (t * 0.8 + i / 5) % 1; ctx.save(); ctx.translate(835 + (i % 2) * 40, lerp(500, 1220, ph)); ga(prog(t, s5.liq - 0.2, s5.liq + 0.3)); ctx.beginPath(); ctx.moveTo(0, -18); ctx.bezierCurveTo(13, 0, 13, 14, 0, 14); ctx.bezierCurveTo(-13, 14, -13, 0, 0, -18); ctx.fillStyle = ICE; ctx.fill(); ctx.restore(); ga(1); } }
    }

    // ================= CENA 6 — ciclo + parede =================
    const s6 = { cic: wt('c6', 'ciclo'), rec: wt('c6', 'recomeca'), col: wt('c6', 'colar'), par: wt('c6', 'parede'), atr: wt('c6', 'atrapalha'), cal: wt('c6', 'calor'), ond: wt('c6', 'onde') };
    cue(s6.cic, 'roll', { dur: 1.0 }); cue(s6.par, 'door'); cue(s6.atr, 'error'); cue(s6.ond, 'buzz', { dur: 0.4 });
    function scene6(t) {
      bg(t, 'rgba(46,196,182,A)'); header();
      const wl = sm(t, s6.col - 0.2, s6.par + 0.2);
      const all = sm(t, s6.cic - 0.2, s6.cic + 0.2) * (1 - prog(t, s6.col - 0.2, s6.col + 0.2));
      fridge(t, { hl: { cap: all, evap: all, suc: all, comp: all, cond: all }, heatOut: 1, wall: wl, cold: lerp(0.95, 0.5, prog(t, s6.atr, s6.ond + 0.5)) });
      if (t < s6.col) rtxt('E RECOMEÇA ↻', 540, 300, 84, { color: TE, sh: '#000', scale: sm(t, B[5] + 0.05, B[5] + 0.45, outBack) * (1 - prog(t, s6.col - 0.15, s6.col + 0.05)) });
      chip('NA PAREDE', 540, 300, 50, WH, prog(t, s6.par - 0.15, s6.par + 0.1) * (1 - prog(t, s6.atr - 0.2, s6.atr)));
      if (t > s6.atr - 0.2) { const k = sm(t, s6.atr - 0.2, s6.atr + 0.1, outBack); rtxt('ATRAPALHA', 540, 290, 92, { color: HOT, sh: '#000', scale: k });
        // calor preso entre a grade e a parede
        const hk = prog(t, s6.atr, s6.atr + 0.6); soft(910, 850, 260, 'rgba(255,77,94,A)', 0.6 * hk * (0.8 + 0.2 * Math.sin(t * 10))); }
      chip('O CALOR NÃO TEM PRA ONDE IR', 470, 1490, 38, OR, prog(t, s6.ond - 0.2, s6.ond + 0.15));
    }

    // ================= CENA 7 — CTA =================
    const s7 = { qua: wt('c7', 'qual'), apa: wt('c7', 'aparelho'), den: wt('c7', 'dentro'), com: wt('c7', 'comenta'), ama: wt('c7', 'amanha'), mic: wt('c7', 'microondas'), pra: wt('c7', 'prato'), seg: wt('c7', 'segue') };
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.ama, 'riser', { dur: 0.6 }); cue(s7.mic, 'ding'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    function microwave(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-230, -140, 460, 280, 26); ctx.fillStyle = '#dfe6ef'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      rr(-200, -110, 300, 220, 16); ctx.fillStyle = '#1b2a40'; ctx.fill(); soft(-50, 0, 160, 'rgba(255,209,102,A)', 0.4 + 0.2 * Math.sin(t * 6));
      ctx.save(); ctx.translate(-50, 40); ctx.scale(1, 0.35); circ(0, 0, 100, WH, 5, INK); ctx.restore(); circ(-50, 25, 36, OR, 5, INK);
      rr(120, -110, 80, 220, 12); ctx.fillStyle = '#b8c4d6'; ctx.fill(); for (let i = 0; i < 3; i++) circ(160, -60 + i * 50, 14, '#5d6b85');
      ctx.restore();
    }
    function scene7(t) {
      bg(t); header();
      rtxt('QUAL APARELHO', 540, 300, 90, { color: WH, sh: '#000', scale: sm(t, s7.qua - 0.1, s7.qua + 0.2, outBack) });
      rtxt('POR DENTRO?', 540, 415, 90, { color: ICE, sh: '#000', scale: sm(t, s7.den - 0.2, s7.den + 0.1, outBack) });
      ['ar-condicionado', 'chuveiro', 'lava-louça'].forEach((m, i) => { const k = prog(t, s7.com + i * 0.2, s7.com + i * 0.2 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([300, 760, 540][i], [570, 570, 670][i]); ctx.scale(outBack(k), outBack(k)); rr(-180, -42, 360, 84, 32); ctx.fillStyle = WH; ctx.fill(); txt(m, 0, 2, 36, { w: 800, color: INK }); ctx.restore(); });
      const mk2 = sm(t, s7.ama - 0.2, s7.mic, outBack);
      if (mk2 > 0) { chip('AMANHÃ', 540, 820, 44, Y, mk2); microwave(540, 1040, 0.9 * mk2, t); chip('MICRO-ONDAS POR DENTRO', 540, 1240, 38, WH, prog(t, s7.mic, s7.pra)); }
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1420); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(127,216,255,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : ICE; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
    }

    // ================= legendas =================
    const HL = new Set(['mao', 'quente', 'calor', 'comida', 'frio', 'tira', 'gas', 'ferve', 'doze', 'zero', 'tubo', 'fininho', 'pressao', 'evapora', 'evaporar', 'rouba', 'compressor', 'motor', 'aperta', 'apertado', 'grade', 'cozinha', 'liquido', 'ciclo', 'parede', 'atrapalha', 'aparelho', 'dentro', 'comenta', 'microondas', 'prato', 'segue']);
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
      if (fl > 0) { ctx.globalAlpha = clamp(fl) * 0.85; ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
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
