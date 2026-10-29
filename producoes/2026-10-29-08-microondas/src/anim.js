/*
 * MICRO-ONDAS POR DENTRO — raio-X (aparelho genérico, sem marca), 9:16 (1080x1920)
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
  const milhar = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
    const NAMES = ['Gancho: comida pelando, prato frio', 'Magnetron', 'Ondas viram, água gira', 'Atrito vira calor', 'O prato', 'A grade da porta', 'CTA'];
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
    // ------------------------------------------------ peças do micro-ondas (genérico, sem marca)
    const MW = '#e4e8ef', MWD = '#2a3446', FOOD = '#e8833a', FOODH = '#ff5a3c', PL = '#f4f1ea', WAVE = '#ffd166', H2O = '#7fd8ff';
    function steam(x, y, s, t, a) { if (a <= 0) return; for (let i = 0; i < 3; i++) { ctx.save(); ga(a * (0.5 + 0.3 * Math.sin(t * 3 + i))); ctx.beginPath(); for (let j = 0; j <= 20; j++) { const u = j / 20; ctx.lineTo(x + (i - 1) * 50 * s + Math.sin(u * 7 + t * 4 + i) * 14 * s, y - u * 150 * s - ((t * 40) % 20)); } ctx.lineWidth = 10 * s; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); } ga(1); }
    function plate(x, y, s, o = {}) { // prato de frente, em leve perspectiva, com comida
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.ellipse(0, 20, 230, 70, 0, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, 230, 70, 0, 0, TAU); ctx.fillStyle = o.plateCol || PL; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -4, 160, 45, 0, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(8,16,32,0.25)'; ctx.stroke();
      if (o.food !== false) { const hot = o.hot || 0; ctx.beginPath(); ctx.ellipse(0, -30, 130, 70, 0, Math.PI, TAU); ctx.lineTo(130, -20); ctx.ellipse(0, -20, 130, 30, 0, 0, Math.PI); ctx.closePath(); ctx.fillStyle = mixC(FOOD, FOODH, hot); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
        for (let i = 0; i < 5; i++) circ(-80 + i * 40, -50 - (i % 2) * 22, 9, 'rgba(255,255,255,0.35)'); }
      ctx.restore();
    }
    const mixC = (a, b, u) => { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return 'rgb(' + pa.map((x, i) => Math.round(lerp(x, pb[i], clamp(u)))).join(',') + ')'; };
    function oven(x, y, s, t, o = {}) { // micro-ondas de frente
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-380 + 14, -240 + 18, 760, 480, 40); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();
      rr(-380, -240, 760, 480, 40); ctx.fillStyle = MW; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
      rr(-340, -200, 500, 400, 22); ctx.fillStyle = MWD; ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
      ctx.save(); rr(-330, -190, 480, 380, 18); ctx.clip();
      const gl = o.glow ?? 0; ctx.fillStyle = `rgba(255,190,90,${0.5 * gl})`; ctx.fillRect(-340, -200, 500, 400); soft(-90, 0, 300, 'rgba(255,209,102,A)', 0.5 * gl);
      if (o.inside) o.inside();
      ctx.fillStyle = 'rgba(8,16,32,0.35)'; for (let yy = -185; yy < 190; yy += 18) for (let xx = -325; xx < 150; xx += 18) { ctx.beginPath(); ctx.arc(xx, yy, 4.5, 0, TAU); ctx.fill(); }
      ctx.restore();
      rr(200, -200, 140, 400, 18); ctx.fillStyle = '#cdd4de'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
      rr(215, -180, 110, 70, 10); ctx.fillStyle = '#0d1a14'; ctx.fill(); txt(o.disp || '', 270, -144, 40, { w: 900, color: '#6dff9e' });
      for (let i = 0; i < 6; i++) { rr(222 + (i % 2) * 55, -80 + Math.floor(i / 2) * 60, 42, 40, 8); ctx.fillStyle = '#9aa6b8'; ctx.fill(); }
      circ(270, 150, 34, '#9aa6b8', 5, INK);
      ctx.restore();
    }
    function waveLine(x0, y0, x1, y1, amp, lam, ph, col, w = 8, a = 1) { // onda senoidal entre dois pontos
      if (a <= 0) return; const L = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0); if (L < 2) return;
      ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang); ga(a); ctx.beginPath(); for (let d = 0; d <= L; d += 6) ctx.lineTo(d, Math.sin(d / lam * TAU - ph) * amp); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); ga(1);
    }
    function water(x, y, s, ang, o = {}) { // molécula de água: O grande, 2 H
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
      for (const sg of [-1, 1]) { const hx = Math.sin(sg * 0.91) * 62, hy = Math.cos(0.91) * 62; line([[0, 0], [hx, hy]], 14, INK); circ(hx, hy, 24, WH, 5, INK); txt('+', hx, hy + 1, 26, { w: 900, color: INK }); }
      circ(0, 0, 42, o.col || '#ff5a6e', 6, INK); txt('−', 0, -2, 40, { w: 900, color: WH });
      ctx.restore();
    }
    function heatArrow(x, y, k, col = OR) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ga(k); ctx.beginPath(); for (let j = 0; j <= 12; j++) ctx.lineTo(Math.sin(j * 0.9) * 8, j * 6); ctx.lineWidth = 7; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-12, 66); ctx.lineTo(12, 66); ctx.lineTo(0, 84); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); ga(1); }

    // ================= CENA 1 — gancho =================
    const s1 = { doi: wt('c1', 'dois'), mic: wt('c1', 'microondas'), com: wt('c1', 'comida'), pel: wt('c1', 'pelando'), pra: wt('c1', 'prato'), fri: wt('c1', 'frio'), como: wt('c1', 'como'), esq: wt('c1', 'esquentar') };
    cue(0, 'music', { part: 'intro' }); cue(s1.doi, 'tap'); cue(s1.doi + 0.1, 'tick', { dur: s1.pel - s1.doi - 0.1 }); cue(s1.pel - 0.05, 'ding'); cue(s1.pel, 'sizzle', { dur: 0.8 }); cue(s1.fri, 'pop'); cue(s1.como, 'glitch', { dur: 0.3 });
    function scene1(t) {
      bg(t, 'rgba(255,159,28,A)'); header();
      rtxt('MICRO-ONDAS', 540, 280, 104, { color: WH, sh: '#000', scale: sm(t, 0.1, 0.6, outBack) });
      const tm = 120 * (1 - prog(t, s1.doi + 0.1, s1.pel - 0.05)), disp = t < s1.doi ? '0:00' : `${Math.floor(tm / 60)}:${String(Math.floor(tm % 60)).padStart(2, '0')}`;
      const out = sm(t, s1.pel - 0.1, s1.pel + 0.5);
      const on = t > s1.doi && t < s1.pel - 0.05 ? 1 : 0;
      oven(540, lerp(640, 560, out), lerp(1.12, 0.78, out), t, { disp, glow: on * (0.8 + 0.2 * Math.sin(t * 9)), inside: () => { if (out < 0.5) plate(-90, 110, 0.75, { hot: prog(t, s1.doi, s1.pel) }); } });
      const fadeC = 1 - prog(t, s1.como - 0.1, s1.como + 0.15);
      if (out > 0 && fadeC > 0) { ga(fadeC);
        const py = lerp(900, 1110, outC(out));
        plate(540, py, lerp(0.8, 1.6, outC(out)), { hot: 1 }); steam(540, py - 120, 1.1, t, out);
        stampMark(540, py - 290, 'PELANDO', prog(t, s1.pel, s1.pel + 0.18), { size: 64, col: FOODH, rot: -0.08 });
        if (t > s1.pra - 0.1) { chip('PRATO: QUASE FRIO', 540, py + 200, 50, H2O, prog(t, s1.fri - 0.25, s1.fri + 0.1)); ctx.save(); ga(0.5 * prog(t, s1.pra - 0.1, s1.pra + 0.3)); ctx.translate(540, py); ctx.scale(1.6, 1.6); ctx.beginPath(); ctx.ellipse(0, 0, 232, 72, 0, 0, TAU); ctx.lineWidth = 10; ctx.strokeStyle = H2O; ctx.stroke(); ctx.restore(); ga(1); }
        ga(1); }
      if (t > s1.como - 0.05) { ctx.fillStyle = `rgba(6,18,38,${0.55 * prog(t, s1.como - 0.05, s1.como + 0.2)})`; ctx.fillRect(0, 0, W, H); rtxt('COMO ELE ESCOLHE?', 540, 900, 84, { color: WAVE, sh: '#000', scale: sm(t, s1.como - 0.05, s1.como + 0.25, outBack) }); }
    }

    // ================= CENA 2 — o magnetron =================
    const s2 = { den: wt('c2', 'dentro'), pec: wt('c2', 'peca'), mag: wt('c2', 'magnetron'), tra: wt('c2', 'transforma'), ene: wt('c2', 'energia'), tom: wt('c2', 'tomada'), ond: wt('c2', 'ondas'), cur: wt('c2', 'curtinhas'), mic: wt('c2', 'microondas') };
    cue(B[1], 'music', { part: 'groove' }); cue(s2.den, 'scan', { dur: 0.7, gain: 0.6 }); cue(s2.mag, 'stamp'); cue(s2.ene, 'zap'); cue(s2.tom, 'buzz', { dur: 0.6 }); cue(s2.ond, 'whoosh', { dur: 0.6 }); cue(s2.mic, 'pop');
    function scene2(t) {
      bg(t, 'rgba(255,209,102,A)'); header();
      rtxt('POR DENTRO', 540, 270, 92, { color: WH, sh: '#000', scale: sm(t, B[1], B[1] + 0.4, outBack) });
      // corte: cavidade à esquerda, compartimento técnico à direita
      const ink = sm(t, B[1], B[1] + 0.5, outC); ga(ink);
      rr(90, 480, 900, 640, 30); ctx.fillStyle = MW; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
      rr(130, 520, 560, 560, 18); ctx.fillStyle = MWD; ctx.fill(); ctx.lineWidth = 6; ctx.stroke(); txt('CAVIDADE', 410, 560, 30, { w: 900, color: MU });
      rr(720, 520, 230, 560, 18); ctx.fillStyle = '#c3cbd8'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
      plate(410, 1000, 0.85, { hot: prog(t, s2.mic, s2.mic + 1.5) });
      ga(1);
      // magnetron: corpo cilíndrico com aletas
      const mk2 = sm(t, s2.pec - 0.2, s2.mag + 0.1, outBack), mx = 835, my = 760;
      if (mk2 > 0) { ctx.save(); ctx.translate(mx, my); ctx.scale(mk2, mk2); const hot = prog(t, s2.ene, s2.tom + 0.3); soft(0, 0, 200, 'rgba(255,159,28,A)', 0.6 * hot);
        for (let i = 0; i < 7; i++) { rr(-85, -95 + i * 28, 170, 14, 4); ctx.fillStyle = '#9aa6b8'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
        rr(-55, -110, 110, 220, 20); ctx.fillStyle = mixC('#6b7a90', '#ff9f1c', hot); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
        rr(-130, -18, 80, 36, 8); ctx.fillStyle = '#d9dee6'; ctx.fill(); ctx.stroke(); // antena voltada para a cavidade
        ctx.restore(); }
      chip('MAGNETRON', 800, 420, 46, WAVE, prog(t, s2.mag - 0.1, s2.mag + 0.2));
      // tomada e cabo
      const pk = prog(t, s2.ene - 0.3, s2.ene);
      if (pk > 0) { ga(pk); const cab = [[835, 1110], [835, 1300], [700, 1360]]; line(cab, 18, INK); line(cab, 10, '#3a4458'); rr(560, 1310, 140, 110, 18); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); circ(605, 1365, 12, INK); circ(655, 1365, 12, INK); txt('TOMADA', 630, 1460, 30, { w: 900, color: MU }); ga(1);
        for (let i = 0; i < 4; i++) { const u = ((t * 1.4 + i / 4) % 1); if (t < s2.ene) break; const p = u < 0.5 ? [lerp(700, 835, u * 2), lerp(1360, 1300, u * 2)] : [835, lerp(1300, 1110, (u - 0.5) * 2)]; circ(p[0], p[1], 12, WAVE, 4, INK); } }
      // ondas saindo da antena para a cavidade
      const wk = prog(t, s2.ond - 0.1, s2.ond + 0.4);
      if (wk > 0) { ctx.save(); rr(130, 520, 560, 560, 18); ctx.clip(); for (let i = 0; i < 3; i++) waveLine(700, 760 + (i - 1) * 90, lerp(700, 140, wk), 760 + (i - 1) * 90 + (i - 1) * 60 * wk, 22, lerp(110, 70, prog(t, s2.cur - 0.1, s2.cur + 0.3)), t * 14, WAVE, 8, 0.9); ctx.restore(); }
      chip('MICRO-ONDAS', 410, 1180, 52, WAVE, prog(t, s2.mic - 0.15, s2.mic + 0.15));
      if (t > s2.cur - 0.1 && t < s2.mic - 0.1) chip('ONDAS CURTINHAS', 410, 1180, 44, WH, prog(t, s2.cur - 0.1, s2.cur + 0.15));
    }

    // ================= CENA 3 — as ondas viram, a água gira =================
    const s3 = { ond: wt('c3', 'ondas'), vir: wt('c3', 'viram'), doi: wt('c3', 'dois'), bil: wt('c3', 'bilhoes'), seg: wt('c3', 'segundo'), mol: wt('c3', 'moleculas'), agu: wt('c3', 'agua'), ten: wt('c3', 'tentam'), gir: wt('c3', 'girando'), par: wt('c3', 'parar') };
    cue(B[2], 'music', { part: 'safe' }); cue(s3.vir, 'swoosh'); cue(s3.doi, 'riser', { dur: s3.seg - s3.doi + 0.2 }); cue(s3.seg + 0.15, 'impact', { gain: 0.7 }); cue(s3.agu, 'plop'); cue(s3.gir, 'stretch', { dur: 0.9 });
    function scene3(t) {
      bg(t, 'rgba(127,216,255,A)'); header();
      // campo que vira de lado: seta grande que gira para cima e para baixo
      const fld = Math.sin((t - B[2]) * lerp(2.5, 9, prog(t, s3.doi, s3.seg)) );
      waveLine(60, 430, 1020, 430, 70, 330, t * lerp(4, 16, prog(t, s3.doi, s3.seg)), WAVE, 12, sm(t, s3.ond - 0.2, s3.ond + 0.2));
      const ak = sm(t, s3.vir - 0.2, s3.vir + 0.1, outBack);
      if (ak > 0) { ctx.save(); ctx.translate(540, 640); ctx.scale(ak, ak); txt('CAMPO', 0, -120, 30, { w: 900, color: MU }); const dy = fld * 80; line([[0, -dy], [0, dy]], 22, INK); line([[0, -dy], [0, dy]], 12, WAVE); const s = Math.sign(dy) || 1; ctx.beginPath(); ctx.moveTo(0, dy + s * 34); ctx.lineTo(-30, dy - s * 6); ctx.lineTo(30, dy - s * 6); ctx.closePath(); ctx.fillStyle = WAVE; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
      // contador
      if (t > s3.doi - 0.2) { const v = 2.45e9 * outC(prog(t, s3.doi - 0.1, s3.seg)); const k = sm(t, s3.doi - 0.2, s3.doi + 0.1, outBack);
        rtxt(milhar(v), 540, 830, 96, { color: WAVE, sh: '#000', scale: k }); chip('VEZES POR SEGUNDO', 540, 950, 40, WH, prog(t, s3.seg - 0.15, s3.seg + 0.1)); }
      // moléculas de água seguindo o campo
      const mk2 = sm(t, s3.mol - 0.3, s3.agu, outBack);
      if (mk2 > 0) { const R = mulberry(11), follow = prog(t, s3.ten - 0.2, s3.gir);
        for (let i = 0; i < 6; i++) { const x = 220 + (i % 3) * 320, y = 1160 + Math.floor(i / 3) * 230, a0 = R() * TAU; const tgt = fld > 0 ? 0 : Math.PI; const ang = lerp(a0 + Math.sin(t + i) * 0.3, tgt + fld * 0.35 + Math.sin(t * 30 + i) * 0.08, follow); water(x + Math.sin(t * 2 + i) * 8, y, 0.95 * mk2, ang); }
        chip('ÁGUA (H2O)', 540, 1040, 40, H2O, prog(t, s3.agu - 0.15, s3.agu + 0.15)); }
      if (t > s3.gir - 0.1) chip('GIRAM SEM PARAR', 540, 1520, 40, WAVE, prog(t, s3.gir - 0.1, s3.gir + 0.2));
    }

    // ================= CENA 4 — atrito vira calor =================
    const s4 = { gir: wt('c4', 'giro'), esf: wt('c4', 'esfregar'), out: wt('c4', 'outra'), atr: wt('c4', 'atrito'), cal: wt('c4', 'calor'), com: wt('c4', 'comida'), esq: wt('c4', 'esquenta') };
    cue(B[3], 'music', { part: 'groove' }); cue(s4.esf, 'scratch'); cue(s4.atr, 'crack'); cue(s4.cal, 'fire'); cue(s4.esq, 'sizzle', { dur: 1.0 });
    function scene4(t) {
      const heat = sm(t, s4.cal - 0.3, s4.esq + 0.4);
      bg(t, heat > 0.1 ? 'rgba(255,90,60,A)' : 'rgba(127,216,255,A)'); header();
      rtxt('ATRITO', 540, 290, 110, { color: WAVE, sh: '#000', scale: sm(t, s4.atr - 0.2, s4.atr + 0.15, outBack) });
      if (t > s4.cal - 0.15) rtxt('= CALOR', 540, 410, 90, { color: FOODH, sh: '#000', scale: sm(t, s4.cal - 0.15, s4.cal + 0.15, outBack) });
      // aglomerado de moléculas se esfregando
      const rub = prog(t, s4.esf - 0.2, s4.esf + 0.3), R = mulberry(23);
      ctx.save(); soft(540, 860, 420, 'rgba(255,90,60,A)', 0.55 * heat);
      const pts = []; for (let i = 0; i < 9; i++) { const bx = 300 + (i % 3) * 240, by = 660 + Math.floor(i / 3) * 200, j = (4 + 18 * rub) * (1 + heat); pts.push([bx + Math.sin(t * 40 + i * 1.7) * j, by + Math.cos(t * 37 + i * 2.3) * j]); }
      pts.forEach((p, i) => water(p[0], p[1], 0.8, t * (6 + 10 * rub) * (i % 2 ? 1 : -1) + R() * TAU, { col: mixC('#ff5a6e', '#ffb03a', heat) }));
      if (rub > 0) for (let i = 0; i < 8; i++) { const a = pts[i], b = pts[i + 1]; if (i % 3 === 2) continue; const x = (a[0] + b[0]) / 2, y = (a[1] + b[1]) / 2, f = ((t * 6 + i * 0.37) % 1); if (f < 0.5) { ga(rub * (1 - f * 2)); star(x, y, 26 * (0.6 + f), WAVE, 6); ga(1); } }
      ctx.restore();
      // termômetro + comida
      const tk = sm(t, s4.com - 0.3, s4.com, outBack);
      if (tk > 0) { ctx.save(); ctx.translate(540, 1300); ctx.scale(tk, tk); plate(-120, 70, 0.75, { hot: heat }); steam(-120, -20, 0.8, t, heat);
        rr(230, -190, 60, 300, 30); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); circ(260, 130, 50, FOODH, 6, INK); rr(246, lerp(80, -170, heat), 28, lerp(60, 310, heat), 14); ctx.fillStyle = FOODH; ctx.fill(); ctx.restore(); }
    }
    function star(x, y, r, col, n = 5) { ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r2 = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }

    // ================= CENA 5 — o prato =================
    const s5 = { pra: wt('c5', 'prato'), vid: wt('c5', 'vidro'), lou: wt('c5', 'louca'), qua: wt('c5', 'quase'), agu: wt('c5', 'agua'), ond: wt('c5', 'ondas'), atr: wt('c5', 'atravessam'), dir: wt('c5', 'direto'), mor: wt('c5', 'morno'), com: wt('c5', 'comida'), cal: wt('c5', 'calor') };
    cue(B[4], 'music', { part: 'safe' }); cue(s5.vid, 'ding'); cue(s5.lou, 'ding', { gain: 0.6 }); cue(s5.agu, 'minus'); cue(s5.atr, 'whoosh', { dur: 0.7 }); cue(s5.mor, 'swoosh'); cue(s5.cal, 'sizzle', { dur: 0.6 });
    function scene5(t) {
      bg(t, 'rgba(127,216,255,A)'); header();
      rtxt('E O PRATO?', 540, 280, 96, { color: WH, sh: '#000', scale: sm(t, B[4], B[4] + 0.4, outBack) });
      // corte lateral: comida em cima, prato embaixo
      const cy = 1050;
      const pk = sm(t, s5.pra - 0.3, s5.pra, outBack);
      if (pk > 0) { ctx.save(); ctx.translate(540, cy); ctx.scale(pk, pk);
        ctx.beginPath(); ctx.moveTo(-400, -20); ctx.lineTo(400, -20); ctx.lineTo(320, 50); ctx.lineTo(-320, 50); ctx.closePath(); ctx.fillStyle = PL; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
        const hot = prog(t, s5.ond, s5.dir + 0.5);
        ctx.beginPath(); ctx.ellipse(0, -20, 200, 150, 0, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = mixC(FOOD, FOODH, hot); ctx.fill(); ctx.stroke();
        for (let i = 0; i < 7; i++) { const a = Math.PI + 0.3 + i * 0.37; water(Math.cos(a) * 110, -20 + Math.sin(a) * 75, 0.32, t * 12 + i); }
        ctx.restore(); }
      chip('VIDRO', 300, 1180, 40, WH, prog(t, s5.vid - 0.15, s5.vid + 0.1)); chip('LOUÇA', 780, 1180, 40, WH, prog(t, s5.lou - 0.15, s5.lou + 0.1));
      chip('QUASE SEM ÁGUA', 540, 1290, 46, H2O, prog(t, s5.agu - 0.2, s5.agu + 0.1));
      // ondas descendo: as do centro param na comida, as das bordas atravessam o prato
      const wk = prog(t, s5.ond - 0.2, s5.dir + 0.6);
      if (wk > 0 && t < s5.mor) { const thr = prog(t, s5.atr - 0.1, s5.dir + 0.3);
        for (const x of [180, 900]) waveLine(x, 520, x, lerp(560, 1500, Math.min(wk * 1.2, 0.4 + thr * 0.6)), 22, 80, t * 14, WAVE, 8, 0.95);
        for (const x of [440, 540, 640]) waveLine(x, 520, x, lerp(560, cy - 170 + Math.abs(x - 540) * 0.6, Math.min(1, wk * 2)), 22, 80, t * 14, WAVE, 8, 0.95);
        if (thr > 0) chip('ATRAVESSAM', 180, 1430, 32, WAVE, thr); }
      if (t > s5.mor - 0.3) { const k = prog(t, s5.mor - 0.3, s5.cal + 0.3); for (let i = 0; i < 5; i++) heatArrow(380 + i * 80, cy - 10 + ((t * 60 + i * 13) % 20), k);
        chip('MORNO = CALOR DA COMIDA', 540, 1440, 40, OR, prog(t, s5.com - 0.2, s5.com + 0.15)); }
    }

    // ================= CENA 6 — a grade da porta =================
    const s6 = { gra: wt('c6', 'grade'), por: wt('c6', 'porta'), fur: wt('c6', 'furinhos'), men: wt('c6', 'menores'), ond: wt('c6', 'ondas'), doz: wt('c6', 'doze'), cen: wt('c6', 'centimetros'), luz: wt('c6', 'luz'), pas: wt('c6', 'passa'), mic: wt('c6', 'microondas'), vol: wt('c6', 'voltam') };
    cue(B[5], 'music', { part: 'groove' }); cue(s6.gra, 'scan', { dur: 0.6 }); cue(s6.fur, 'pop'); cue(s6.doz, 'tick', { dur: 0.4 }); cue(s6.luz, 'sparkle'); cue(s6.vol, 'boing');
    function scene6(t) {
      bg(t, 'rgba(255,209,102,A)'); header();
      rtxt('A GRADE DA PORTA', 540, 280, 80, { color: WH, sh: '#000', scale: sm(t, s6.gra - 0.2, s6.gra + 0.15, outBack) });
      // painel de grade (porta) no meio, vista de lado como uma "parede" com furos
      const gk = sm(t, s6.gra - 0.2, s6.por + 0.2, outC), gx = 600;
      ga(gk); rr(gx - 18, 470, 36, 980, 10); ctx.fillStyle = '#9aa6b8'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
      for (let y = 490; y < 1440; y += 34) { ctx.fillStyle = BG0; ctx.fillRect(gx - 20, y, 40, 8); } ga(1);
      // lupa nos furinhos
      if (t > s6.fur - 0.3) { const k = sm(t, s6.fur - 0.3, s6.fur + 0.1, outBack); ctx.save(); ctx.translate(860, 600); ctx.scale(k, k); circ(0, 0, 130, '#0d2240', 10, WH); for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if (i * i + j * j <= 5) circ(i * 46, j * 46, 13, '#000', 0); line([[-92, 92], [-160, 160]], 22, WH); ctx.restore();
        chip('FURINHOS DE ~1 MM', 860, 790, 34, WH, prog(t, s6.men - 0.2, s6.men + 0.1)); }
      // onda de 12 cm com régua
      const wk = prog(t, s6.ond - 0.2, s6.doz);
      if (wk > 0) { const back = prog(t, s6.vol - 0.2, s6.vol + 0.5), x1 = lerp(80, gx - 24, outC(Math.min(1, wk))) - back * 380;
        waveLine(80 - back * 0, 1050, Math.max(90, x1), 1050, 60, 420, t * 6, WAVE, 14);
        if (back > 0) chip('VOLTA', 300, 920, 40, WAVE, back);
        const rk = prog(t, s6.doz - 0.2, s6.cen + 0.1); if (rk > 0) { ga(rk); line([[80, 1160], [500, 1160]], 6, WH); line([[80, 1140], [80, 1180]], 6, WH); line([[500, 1140], [500, 1180]], 6, WH); txt('12 cm', 290, 1210, 52, { w: 900, color: WAVE }); ga(1); } }
      // luz passa
      const lk = prog(t, s6.luz - 0.2, s6.pas + 0.4);
      if (lk > 0) { for (let i = 0; i < 6; i++) { const y = 520 + i * 70, x1 = lerp(80, 1040, lk); line([[80, y + 20], [Math.min(x1, gx - 22), y + 20]], 6, 'rgba(255,240,160,0.9)'); if (x1 > gx + 22) line([[gx + 22, y + 20], [x1, y + 20]], 6, 'rgba(255,240,160,0.9)'); } }
      chip('LUZ PASSA ✓', 820, 1300, 44, '#9be08a', prog(t, s6.pas - 0.15, s6.pas + 0.15));
      chip('MICRO-ONDAS VOLTAM ×', 540, 1420, 44, FOODH, prog(t, s6.vol - 0.15, s6.vol + 0.15), { tc: WH });
    }

    // ================= CENA 7 — CTA =================
    const s7 = { qua: wt('c7', 'qual'), den: wt('c7', 'dentro'), com: wt('c7', 'comenta'), ama: wt('c7', 'amanha'), bat: wt('c7', 'bateria'), cel: wt('c7', 'celular'), vic: wt('c7', 'vicia'), seg: wt('c7', 'segue') };
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.ama, 'riser', { dur: 0.6 }); cue(s7.bat, 'ding'); cue(s7.vic, 'error'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    function phoneBat(x, y, s, t, lvl) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-110, -200, 220, 400, 34); ctx.fillStyle = INK; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = MU; ctx.stroke(); rr(-92, -180, 184, 360, 22); ctx.fillStyle = '#16233a'; ctx.fill();
      rr(-60, -90, 120, 190, 14); ctx.lineWidth = 8; ctx.strokeStyle = WH; ctx.stroke(); rr(-24, -108, 48, 18, 5); ctx.fillStyle = WH; ctx.fill(); const h = 174 * lvl; rr(-52, 92 - h, 104, h, 8); ctx.fillStyle = lvl < 0.3 ? FOODH : '#6dff9e'; ctx.fill(); ctx.restore(); }
    function scene7(t) {
      bg(t); header();
      rtxt('QUAL APARELHO', 540, 300, 90, { color: WH, sh: '#000', scale: sm(t, s7.qua - 0.1, s7.qua + 0.2, outBack) });
      rtxt('POR DENTRO?', 540, 415, 90, { color: WAVE, sh: '#000', scale: sm(t, s7.den - 0.2, s7.den + 0.1, outBack) });
      ['ar-condicionado', 'chuveiro', 'avião'].forEach((m, i) => { const k = prog(t, s7.com + i * 0.2, s7.com + i * 0.2 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([300, 780, 540][i], [570, 570, 670][i]); ctx.scale(outBack(k), outBack(k)); rr(-180, -42, 360, 84, 32); ctx.fillStyle = WH; ctx.fill(); txt(m, 0, 2, 36, { w: 800, color: INK }); ctx.restore(); });
      const mk2 = sm(t, s7.ama - 0.2, s7.bat, outBack);
      if (mk2 > 0) { chip('AMANHÃ', 540, 810, 44, WAVE, mk2); phoneBat(540, 1040, 0.85 * mk2, t, lerp(1, 0.15, prog(t, s7.bat, s7.vic + 0.3))); chip('A BATERIA QUE VICIA', 540, 1260, 38, WH, prog(t, s7.cel - 0.1, s7.cel + 0.2)); }
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1430); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(255,209,102,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : WAVE; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
    }

    // ================= legendas =================
    const HL = new Set(['minutos','pelando','prato','frio','escolhe','esquentar','magnetron','tomada','ondas','curtinhas','microondas','bilhoes','segundo','moleculas','agua','girando','giro','esfregar','atrito','calor','esquenta','vidro','louca','atravessam','direto','morno','grade','porta','furinhos','menores','doze','centimetros','luz','voltam','aparelho','dentro','comenta','bateria','vicia','segue']);
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
