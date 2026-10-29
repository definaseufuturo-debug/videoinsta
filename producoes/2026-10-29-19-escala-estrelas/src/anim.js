/*
 * ESCALA: TERRA, SOL E UMA ESTRELA GIGANTE (UY Scuti), 9:16 (1080x1920)
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
  function kf(t, keys, e = inOut) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e(clamp((t - t0) / (t1 - t0))); return Array.isArray(a) ? a.map((x, j) => lerp(x, b[j], u)) : lerp(a, b, u); } return keys[keys.length - 1][1]; }
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
    const NAMES = ['Gancho: bolinha de gude e Sol de 1 m', '109 Terras / 1,3 milhão', 'Sol vira grãozinho', 'UY Scuti: 1.700x e 5 bi de Sóis', 'No lugar do Sol', '2 km na escala', 'CTA'];
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
    // ------------------------------------------------ espaço
    const SUN = '#ffc93c', SUN2 = '#ff8a1f', EARTH = '#3a86ff', LAND = '#5fd38d', RSG = '#ff5a3c', RSG2 = '#c21f2f', GOLD = '#ffd166';
    const SR = mulberry(42); const STARS = []; for (let i = 0; i < 220; i++) STARS.push([SR() * W, SR() * H, 0.6 + SR() * 2.2, SR() * TAU]);
    function space(t, tint) {
      scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1030'); g.addColorStop(1, '#03040c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (tint) soft(W / 2, H * 0.45, 900, tint, 0.18);
      for (const [x, y, r, p] of STARS) { ga(0.35 + 0.35 * Math.sin(t * 2 + p)); circ(x, y, r, '#ffffff'); } ga(1);
    }
    function header2() { ga(0.85); rr(330, 110, 420, 64, 32); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); txt('ESCALA REAL', 540, 143, 28, { w: 800, color: MU }); ga(1); }
    function earth(x, y, r, t) { soft(x, y, r * 1.8, 'rgba(90,160,255,A)', 0.35); circ(x, y, r, EARTH); if (r > 10) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip(); ctx.fillStyle = LAND; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.2, r * 0.45, r * 0.3, 0.5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + r * 0.4, y + r * 0.35, r * 0.3, r * 0.22, -0.4, 0, TAU); ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.lineWidth = Math.max(2, r * 0.08); ctx.strokeStyle = INK; ctx.stroke(); } }
    function sun(x, y, r, t, a = 1) { if (r <= 0) return; ga(a); soft(x, y, r * 1.7, 'rgba(255,190,60,A)', 0.55); const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, '#fff3b0'); g.addColorStop(0.6, SUN); g.addColorStop(1, SUN2); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = g; ctx.fill(); ga(1); }
    function giant(x, y, r, t, a = 1) { if (r <= 0) return; ga(a); soft(x, y, r * 1.35, 'rgba(255,70,50,A)', 0.5); const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.05, x, y, r); g.addColorStop(0, '#ffb07a'); g.addColorStop(0.55, RSG); g.addColorStop(1, RSG2); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = g; ctx.fill();
      const R = mulberry(9); ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip(); for (let i = 0; i < 26; i++) { const a2 = R() * TAU, d = R() * r * 0.9; soft(x + Math.cos(a2 + t * 0.05) * d, y + Math.sin(a2 + t * 0.05) * d, r * (0.08 + R() * 0.12), 'rgba(255,190,120,A)', 0.25); } ctx.restore(); ga(1); }
    function ruler(x0, x1, y, label, k, col = WH) { if (k <= 0) return; ga(k); const xe = lerp(x0, x1, outC(k)); line([[x0, y], [xe, y]], 6, col); line([[x0, y - 18], [x0, y + 18]], 6, col); if (k > 0.95) line([[x1, y - 18], [x1, y + 18]], 6, col); txt(label, (x0 + x1) / 2, y + 48, 44, { w: 900, color: col }); ga(1); }

    // ================= CENA 1 — gancho =================
    const s1 = { ter: wt('c1', 'terra'), bol: wt('c1', 'bolinha'), gud: wt('c1', 'gude'), sol: wt('c1', 'sol'), bola: wt('c1', 'bola'), met: wt('c1', 'metro'), nem: wt('c1', 'nem'), gra: wt('c1', 'grande') };
    cue(0, 'music', { part: 'intro' }); cue(s1.bol, 'pop'); cue(s1.sol - 0.2, 'riser', { dur: 0.5 }); cue(s1.bola, 'impact', { gain: 0.8 }); cue(s1.met, 'tick', { dur: 0.4 }); cue(s1.nem, 'scratch'); cue(s1.gra, 'stamp');
    function scene1(t) {
      space(t, 'rgba(255,190,60,A)'); header2();
      rtxt('TERRA × SOL', 540, 280, 110, { color: WH, sh: '#000', scale: sm(t, 0.1, 0.55, outBack) });
      const ek = sm(t, s1.bol - 0.3, s1.bol + 0.1, outBack);
      if (ek > 0) { earth(150, 980, 14 * ek, t); chip('BOLINHA DE GUDE', 230, 1200, 34, WH, prog(t, s1.gud - 0.2, s1.gud + 0.1)); txt('1 cm', 150, 1060, 36, { w: 900, color: EARTH, a: ek }); line([[150, 1040], [150, 1000]], 4, EARTH); }
      const sk = sm(t, s1.sol - 0.2, s1.bola + 0.1, outBack);
      sun(640, 980, 330 * sk, t);
      ruler(310, 970, 1380, '1 METRO', prog(t, s1.met - 0.3, s1.met + 0.2), GOLD);
      stampMark(540, 530, 'E NEM É GRANDE', prog(t, s1.gra - 0.15, s1.gra + 0.05), { size: 60, col: RSG, rot: -0.1 });
    }

    // ================= CENA 2 — 109 Terras / 1,3 milhão =================
    const s2 = { cen: wt('c2', 'cento'), nov: wt('c2', 'nove'), lar: wt('c2', 'largo'), ter: wt('c2', 'terra'), den: wt('c2', 'dentro'), mil: wt('c2', 'milhao'), tre: wt('c2', 'trezentas'), ters: wt('c2', 'terras') };
    cue(B[1], 'music', { part: 'groove' }); cue(s2.cen, 'roll', { dur: s2.ter - s2.cen }); cue(s2.ter, 'ding'); cue(s2.den, 'whoosh', { dur: 0.5 }); cue(s2.mil, 'riser', { dur: s2.ters - s2.mil + 0.2 }); cue(s2.ters + 0.1, 'confetti');
    function scene2(t) {
      space(t, 'rgba(255,190,60,A)'); header2();
      const sr = 470, cx = 540, cy = 1000;
      sun(cx, cy, sr, t);
      // fileira de Terras atravessando o diâmetro
      const fk = prog(t, s2.cen - 0.1, s2.ter), part2 = prog(t, s2.den - 0.2, s2.den + 0.3);
      const n = Math.floor(109 * fk), er = sr / 109;
      ga(1 - part2); for (let i = 0; i < n; i++) earth(cx - sr + er + i * 2 * er, cy, er, t); ga(1);
      if (fk > 0) { rtxt(String(Math.max(1, n)) + '×', 540, 330, 150, { color: GOLD, sh: '#000', scale: sm(t, s2.cen - 0.2, s2.cen + 0.1, outBack) * (1 - part2) }); chip('MAIS LARGO QUE A TERRA', 540, 460, 40, WH, prog(t, s2.lar - 0.2, s2.lar + 0.1) * (1 - part2)); }
      // enche de Terras (pontinhos)
      if (part2 > 0) { const fill = prog(t, s2.den, s2.ters + 0.3), R = mulberry(3); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, sr - 6, 0, TAU); ctx.clip(); for (let i = 0; i < 1400 * fill; i++) { const a = R() * TAU, d = Math.sqrt(R()) * sr; earth(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 5, t); } ctx.restore();
        const v = 1.3e6 * outC(prog(t, s2.mil - 0.2, s2.ters)); rtxt(milharS(Math.round(v / 1000) * 1000), 540, 330, 120, { color: GOLD, sh: '#000', scale: sm(t, s2.mil - 0.3, s2.mil, outBack) }); chip('TERRAS CABEM DENTRO', 540, 460, 40, EARTH, prog(t, s2.ters - 0.2, s2.ters + 0.1), { tc: WH }); }
    }
    const milharS = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // ================= CENA 3 — o Sol vira grãozinho =================
    const s3 = { mas: wt('c3', 'mas'), est: wt('c3', 'estrelas'), gig: wt('c3', 'gigantes'), sol: wt('c3', 'sol'), gra: wt('c3', 'graozinho') };
    cue(B[2], 'music', { part: 'safe' }); cue(s3.est, 'whoosh', { dur: 0.9 }); cue(s3.gig, 'impact'); cue(s3.gra, 'pop');
    function scene3(t) {
      space(t, 'rgba(255,70,50,A)'); header2();
      const z = sm(t, s3.mas, s3.gra);
      // zoom-out: o Sol encolhe, a gigante entra pela direita
      giant(lerp(2400, 1250, z), 1000, lerp(1400, 900, z), t, prog(t, s3.est - 0.3, s3.est + 0.2));
      const sr = lerp(260, 10, z); sun(lerp(540, 200, z), 1000, sr, t);
      if (z > 0.6) { line([[200, 980], [200, 860]], 5, GOLD); chip('SOL', 200, 820, 38, GOLD, prog(t, s3.sol - 0.1, s3.sol + 0.2)); }
      rtxt('ESTRELAS GIGANTES', 540, 300, 80, { color: RSG, sh: '#000', scale: sm(t, s3.gig - 0.2, s3.gig + 0.1, outBack) });
      stampMark(540, 1350, 'UM GRÃOZINHO', prog(t, s3.gra - 0.1, s3.gra + 0.08), { size: 64, col: GOLD, rot: -0.08 });
    }

    // ================= CENA 4 — UY Scuti =================
    const s4 = { mai: wt('c4', 'maiores'), uy: wt('c4', 'uy'), rai: wt('c4', 'raio'), mil: wt('c4', 'mil'), set: wt('c4', 'setecentas'), vez: wt('c4', 'vezes'), sol: wt('c4', 'sol'), den: wt('c4', 'dentro'), cin: wt('c4', 'cinco'), bil: wt('c4', 'bilhoes'), sois: wt('c4', 'sois') };
    cue(B[3], 'music', { part: 'groove' }); cue(s4.uy, 'stamp'); cue(s4.rai, 'scan', { dur: 0.6 }); cue(s4.mil, 'riser', { dur: s4.vez - s4.mil + 0.1 }); cue(s4.vez + 0.05, 'impact'); cue(s4.cin, 'coin'); cue(s4.sois, 'sparkle');
    function scene4(t) {
      space(t, 'rgba(255,70,50,A)'); header2();
      const gx = 540, gy = 1080, gr = 520;
      giant(gx, gy, gr * sm(t, B[3], B[3] + 0.6, outC), t);
      chip('UY SCUTI', 540, 440, 56, RSG, prog(t, s4.uy - 0.15, s4.uy + 0.15), { tc: WH });
      txt('uma das maiores já medidas', 540, 540, 34, { w: 800, color: MU, a: prog(t, s4.mai - 0.2, s4.mai + 0.3) });
      // raio
      const rk = prog(t, s4.rai - 0.2, s4.rai + 0.4); if (rk > 0) { line([[gx, gy], [gx + gr * outC(rk), gy]], 8, WH, [18, 12]); circ(gx, gy, 10, WH); }
      if (t > s4.mil - 0.2 && t < s4.den - 0.1) { const v = 1700 * outC(prog(t, s4.mil - 0.2, s4.vez)); rtxt('~' + milharS(v) + '×', 540, 290, 140, { color: GOLD, sh: '#000', scale: sm(t, s4.mil - 0.2, s4.mil + 0.1, outBack) }); chip('O RAIO DO SOL', 540, 1690 - 300, 40, GOLD, prog(t, s4.sol - 0.2, s4.sol + 0.1)); }
      // Sol de referência, um pontinho
      const sk = prog(t, s4.sol - 0.3, s4.sol); if (sk > 0) { sun(gx - gr - 0 + 60, gy - gr - 40, 4, t); line([[gx - gr + 60, gy - gr - 40], [gx - gr + 160, gy - gr - 120]], 4, GOLD); txt('SOL', gx - gr + 205, gy - gr - 135, 34, { w: 900, color: GOLD, a: sk }); }
      if (t > s4.den - 0.2) { const k = prog(t, s4.den - 0.2, s4.sois + 0.3), R = mulberry(17); ctx.save(); ctx.beginPath(); ctx.arc(gx, gy, gr - 8, 0, TAU); ctx.clip(); for (let i = 0; i < 900 * k; i++) { const a = R() * TAU, d = Math.sqrt(R()) * gr; circ(gx + Math.cos(a) * d, gy + Math.sin(a) * d, 3.2, GOLD); } ctx.restore();
        rtxt('5 BILHÕES', 540, 290, 120, { color: GOLD, sh: '#000', scale: sm(t, s4.cin - 0.2, s4.bil + 0.1, outBack) }); chip('DE SÓIS CABERIAM DENTRO', 540, 1390, 40, WH, prog(t, s4.sois - 0.2, s4.sois + 0.1)); }
    }

    // ================= CENA 5 — no lugar do Sol =================
    const s5 = { lug: wt('c5', 'lugar'), eng: wt('c5', 'engoliria'), mer: wt('c5', 'mercurio'), ven: wt('c5', 'venus'), ter: wt('c5', 'terra'), mar: wt('c5', 'marte'), pas: wt('c5', 'passaria'), orb: wt('c5', 'orbita'), jup: wt('c5', 'jupiter') };
    cue(B[4], 'music', { part: 'safe' }); cue(s5.lug, 'whoosh', { dur: 0.5 }); cue(s5.mer, 'pop'); cue(s5.ven, 'pop'); cue(s5.ter, 'impact', { gain: 0.6 }); cue(s5.mar, 'pop'); cue(s5.jup, 'stamp');
    const PL5 = [['MERCÚRIO', 0.39, '#b9b2a8', 'mer'], ['VÊNUS', 0.72, '#e8c27a', 'ven'], ['TERRA', 1.0, EARTH, 'ter'], ['MARTE', 1.52, '#e0643a', 'mar'], ['JÚPITER', 5.2, '#d9a066', 'jup']];
    function scene5(t) {
      space(t); header2();
      rtxt('NO LUGAR DO SOL', 540, 290, 84, { color: WH, sh: '#000', scale: sm(t, s5.lug - 0.3, s5.lug + 0.1, outBack) });
      const keys = [[s5.lug, 0.0047], [s5.mer, 0.5], [s5.ven, 0.85], [s5.ter, 1.15], [s5.mar, 1.7], [s5.pas, 4.0], [s5.jup, 7.9]];
      const rAU = kf(t, keys, outC), cx = 540, cy = 1010, AU = clamp(400 / Math.max(rAU * 1.05, 1.7), 72, 230); // câmera acompanha a estrela (Júpiter = 374 px no fim)
      const ok = sm(t, B[4], B[4] + 0.6, outC);
      // raio da estrela cresce passo a passo, engolindo um planeta por palavra
      const rp = rAU * AU;
      ga(ok); for (const [, d] of PL5) { ctx.beginPath(); ctx.arc(cx, cy, d * AU, 0, TAU); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke(); } ga(1);
      if (t < s5.mer - 0.3) sun(cx, cy, 8, t);
      giant(cx, cy, Math.max(0, rp), t, prog(t, s5.lug, s5.mer));
      PL5.forEach(([nm, d, col, w], i) => { const a = -0.9 + i * 1.25 + t * 0.15 / Math.sqrt(d), px = cx + Math.cos(a) * d * AU, py = cy + Math.sin(a) * d * AU, eaten = rp > d * AU; if (!eaten) { ga(ok); circ(px, py, i === 4 ? 20 : 10, col, 3, INK); ga(1); }
        if (i < 4 && t > s5[w] - 0.2 && t < s5[w] + 0.9 && (i === 3 || t < s5[PL5[i + 1][3]] - 0.2)) chip(nm, 540, 1450, 46, col, prog(t, s5[w] - 0.2, s5[w]) * (1 - prog(t, s5[w] + 0.5, s5[w] + 0.9)), { tc: INK }); });
      ctx.beginPath(); ctx.arc(cx, cy, 5.2 * AU, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(217,160,102,0.9)'; ctx.setLineDash([14, 10]); ctx.stroke(); ctx.setLineDash([]);
      ga(ok); txt('JÚPITER', cx, cy - 5.2 * AU - 30, 32, { w: 900, color: '#d9a066' }); ga(1);
      if (t > s5.jup - 0.2) chip('PASSA DA ÓRBITA DE JÚPITER', 540, 1460, 40, GOLD, prog(t, s5.jup - 0.2, s5.jup + 0.15));
    }

    // ================= CENA 6 — 2 km na escala da bolinha =================
    const s6 = { esc: wt('c6', 'escala'), gud: wt('c6', 'gude'), bola: wt('c6', 'bola'), qua: wt('c6', 'quase'), doi: wt('c6', 'dois'), qui: wt('c6', 'quilometros'), lad: wt('c6', 'lado'), bol2: wt('c6', 'bolinha', 1), cen: wt('c6', 'centimetro') };
    cue(B[5], 'music', { part: 'groove' }); cue(s6.bola, 'impact', { gain: 0.8 }); cue(s6.doi, 'stamp'); cue(s6.bol2, 'pop');
    function scene6(t) {
      // céu de entardecer com cidade genérica e a "bola" vermelha atrás
      scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1030'); g.addColorStop(0.7, '#3a1d3a'); g.addColorStop(1, '#14101c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); header2();
      rtxt('NA ESCALA DA BOLINHA', 540, 290, 70, { color: WH, sh: '#000', scale: sm(t, s6.esc - 0.3, s6.esc + 0.1, outBack) });
      const rise = sm(t, s6.bola - 0.4, s6.bola + 0.6, outC), ground = 1330;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, ground); ctx.clip(); giant(540, lerp(2400, 1420, rise), 900, t); ctx.restore();
      // prédios genéricos (silhueta)
      const R = mulberry(5); let x = -20; ctx.fillStyle = '#0a0812'; while (x < W) { const w = 50 + R() * 70, h = 40 + R() * 110; ctx.fillRect(x, ground - h, w, h + 10); x += w + 6; } ctx.fillRect(0, ground, W, H - ground);
      if (t > s6.doi - 0.2) { ruler(90, 990, 470, '', prog(t, s6.doi - 0.2, s6.qui), GOLD); rtxt('~2 KM', 540, 590, 120, { color: GOLD, sh: '#000', scale: sm(t, s6.doi - 0.2, s6.doi + 0.1, outBack) }); }
      if (t > s6.lad - 0.3) { const k = sm(t, s6.lad - 0.3, s6.bol2, outBack); earth(540, 1440, 8 * k, t); line([[540, 1425], [540, 1390]], 4, EARTH); chip('TERRA = 1 CM', 540, 1360 - 0, 36, EARTH, prog(t, s6.cen - 0.3, s6.cen), { tc: WH }); }
    }

    // ================= CENA 7 — CTA =================
    const s7 = { voc: wt('c7', 'voce'), ima: wt('c7', 'imaginava'), com: wt('c7', 'comenta'), ama: wt('c7', 'amanha'), map: wt('c7', 'mapa'), pop: wt('c7', 'populosos'), seg: wt('c7', 'segue') };
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.ama, 'riser', { dur: 0.6 }); cue(s7.map, 'ding'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    function scene7(t) {
      space(t); header2();
      rtxt('VOCÊ IMAGINAVA', 540, 300, 88, { color: WH, sh: '#000', scale: sm(t, s7.voc - 0.1, s7.voc + 0.2, outBack) });
      rtxt('ESSE TAMANHO?', 540, 415, 88, { color: RSG, sh: '#000', scale: sm(t, s7.ima - 0.1, s7.ima + 0.2, outBack) });
      ['nem de longe', 'já sabia', 'tô chocado'].forEach((m, i) => { const k = prog(t, s7.com + i * 0.2, s7.com + i * 0.2 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([300, 780, 540][i], [570, 570, 670][i]); ctx.scale(outBack(k), outBack(k)); rr(-180, -42, 360, 84, 32); ctx.fillStyle = WH; ctx.fill(); txt(m, 0, 2, 36, { w: 800, color: INK }); ctx.restore(); });
      const mk2 = sm(t, s7.ama - 0.2, s7.map, outBack);
      if (mk2 > 0) { chip('AMANHÃ', 540, 820, 44, GOLD, mk2);
        ctx.save(); ctx.translate(540, 1030); ctx.scale(mk2, mk2); rr(-260, -130, 520, 260, 26); ctx.fillStyle = '#f3efe4'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
          for (let i = 0; i < 5; i++) { const w = [380, 300, 230, 170, 120][i] * prog(t, s7.map + i * 0.1, s7.map + 0.4 + i * 0.1); rr(-200, -100 + i * 42, w, 30, 8); ctx.fillStyle = ['#2a6f97', '#3a86ff', '#61a5c2', '#89c2d9', '#a9d6e5'][i]; ctx.fill(); } ctx.restore();
        chip('ESTADOS MAIS POPULOSOS', 540, 1230, 38, WH, prog(t, s7.pop - 0.2, s7.pop + 0.1)); }
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1420); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(255,209,102,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : GOLD; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
    }

    // ================= legendas =================
    const HL = new Set(['terra','bolinha','gude','sol','bola','metro','grande','cento','nove','largo','milhao','trezentas','terras','gigantes','graozinho','maiores','uy','scuti','raio','setecentas','cinco','bilhoes','sois','engoliria','mercurio','venus','marte','jupiter','dois','quilometros','centimetro','imaginava','tamanho','comenta','mapa','populosos','segue']);
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
