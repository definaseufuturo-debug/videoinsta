/*
 * MOTOR DE F1 POR DENTRO — raio-X cinematográfico (carro e motor genéricos, sem marcas; regras 2026), 9:16 (1080x1920)
 * Mesmo código no navegador (player) e no Node (render MP4).
 * Toda ação visual é presa ao instante real em que a palavra é falada (build/timeline.json).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const P = { ink: '#121418', cream: '#ffffff', red: '#e2475f', mustard: '#ffc23d' };
  const C = { bg0: P.paper };
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const inC = t => clamp(t) ** 3;
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  function kf(t, keys, e = inOut) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e(clamp((t - t0) / (t1 - t0))); return Array.isArray(a) ? a.map((x, j) => lerp(x, b[j], u)) : lerp(a, b, u); } return keys[keys.length - 1][1]; }
  function mulberry(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const milhar = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration;
    const NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Gancho: 1,6 L e ~1000 cv', 'V6 e 4 tempos', 'Turbo', 'Metade elétrica', 'Freia e recarrega', 'MGU-H saiu + combustível', 'CTA'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ------------------------------------------------ texturas pré-calculadas
    const R0 = mulberry(7);
    const grain = (() => { const cv = mk(540, 960), g = cv.getContext('2d'); for (let i = 0; i < 26000; i++) { const x = R0() * 540, y = R0() * 960, r = 0.4 + R0() * 1.1; g.fillStyle = R0() < 0.6 ? 'rgba(60,40,20,0.22)' : 'rgba(255,250,235,0.3)'; g.fillRect(x, y, r, r); } return cv; })();
    const vignette = (() => { const cv = mk(W, H), g = cv.getContext('2d'), gr = g.createRadialGradient(W / 2, H * 0.45, H * 0.32, W / 2, H * 0.5, H * 0.78); gr.addColorStop(0, 'rgba(60,30,10,0)'); gr.addColorStop(1, 'rgba(60,30,10,0.55)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();
    const layers = [mk(W, H), mk(W, H)];

    // ------------------------------------------------ primitivas
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) {
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
      ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha *= o.a ?? 1;
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || P.ink; ctx.strokeText(s, 0, 0); }
      ctx.fillStyle = o.color || P.ink; ctx.fillText(s, 0, 0); ctx.restore();
    }
    // texto retrô: contorno + sombra sólida deslocada
    function rtxt(s, x, y, size, o = {}) {
      if (o.scale !== undefined && o.scale <= 0.001) return;
      const d = o.d ?? size * 0.07;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
      ctx.globalAlpha *= o.a ?? 1;
      ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = o.lw ?? size * 0.12; ctx.strokeStyle = P.ink; ctx.fillStyle = o.sh || P.ink;
      ctx.strokeText(s, d, d); ctx.fillText(s, d, d);
      ctx.strokeText(s, 0, 0); ctx.fillStyle = o.color || P.cream; ctx.fillText(s, 0, 0);
      ctx.restore();
    }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function cam(fx, fy, z, rot = 0, ox = 0, oy = 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(W / 2 + ox, H / 2 + oy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-fx, -fy); }
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function box(x, y, w, h, o = {}) { // bloco chapado com sombra sólida
      const d = o.d ?? 12, r = o.r ?? 18;
      if (d) { rr(x + d, y + d, w, h, r); ctx.fillStyle = o.sh || P.ink; ctx.fill(); }
      rr(x, y, w, h, r); ctx.fillStyle = o.fill || P.cream; ctx.fill(); ctx.lineWidth = o.lw ?? 6; ctx.strokeStyle = P.ink; ctx.stroke();
    }
    function line(pts, w, col = P.ink) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
    function circ(x, y, r, fill, lw = 6) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = P.ink; ctx.stroke(); } }
    function star(x, y, r, col, n = 5) { ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr2 = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
    function arrow(x0, y0, x1, y1, col = P.red, w = 18, head = 46) {
      const a = Math.atan2(y1 - y0, x1 - x0);
      line([[x0, y0], [x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6]], w + 10, P.ink); line([[x0, y0], [x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6]], w, col);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.5) * head, y1 - Math.sin(a - 0.5) * head); ctx.lineTo(x1 - Math.cos(a + 0.5) * head, y1 - Math.sin(a + 0.5) * head); ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = P.ink; ctx.lineJoin = 'round'; ctx.stroke();
    }
    function stampMark(x, y, s, k, o = {}) { // carimbo que cai
      if (k <= 0) return; const sc = lerp(2.4, 1, outC(k)) * (o.s || 1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.14); ctx.scale(sc, sc); ga(clamp(k * 3));
      const size = o.size || 84, w = tw(s, size, 900) + 70, h = size * 1.45, col = o.col || P.red;
      rr(-w / 2, -h / 2, w, h, 16); ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.stroke();
      rr(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); ctx.lineWidth = 4; ctx.stroke();
      txt(s, 0, 4, size, { w: 900, color: col });
      ctx.restore(); ga(1);
    }

    // ------------------------------------------------ estilo
    const INK = '#121418', HEAD = '#f3f1ec', ME = '#7f93b5', FR1 = '#9a8f86', FR2 = '#8fa08c';
    const vig2 = (() => { const cv = mk(W, H), g = cv.getContext('2d'), gr = g.createRadialGradient(W / 2, H * 0.52, H * 0.25, W / 2, H * 0.52, H * 0.75); gr.addColorStop(0, 'rgba(5,8,15,0)'); gr.addColorStop(1, 'rgba(5,8,15,0.75)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();
    function grainOver(t) { const f = Math.floor(t * 12); scr(); ctx.globalAlpha = 0.28; ctx.drawImage(grain, -((f * 37) % 40), -((f * 53) % 40), W + 40, H + 40); ctx.globalAlpha = 1; }
    function sky(stops) { const g = ctx.createLinearGradient(0, 0, 0, H); stops.forEach(([p, c]) => g.addColorStop(p, c)); ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800); }
    const mixC = (a, b, u) => { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return 'rgb(' + pa.map((x, i) => Math.round(lerp(x, pb[i], clamp(u)))).join(',') + ')'; };
    function soft(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }

    // ------------------------------------------------ o personagem (cabeça redonda)
    function limb(x0, y0, a1, l1, a2, l2, w, col) { const x1 = x0 + Math.sin(a1) * l1, y1 = y0 + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; line([[x0, y0], [x1, y1], [x2, y2]], w + 10, INK); line([[x0, y0], [x1, y1], [x2, y2]], w, col); return [x2, y2]; }
    function guy(x, y, s, o = {}) { // y = chão (ou assento, se sentado)
      const k = o.kid ?? 0, hr = lerp(108, 96, k), legL = lerp(170, 95, k), torso = lerp(210, 120, k), armL = lerp(160, 100, k), col = o.col || '#8a8d93';
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.a !== undefined) ctx.globalAlpha = clamp(o.a);
      const sit = o.pose === 'sit', walk = o.pose === 'walk', ph = o.ph || 0, sw = walk ? Math.sin(ph) * 0.5 : 0, bob = walk ? Math.abs(Math.cos(ph)) * 8 : 0;
      const hipY = sit ? 0 : -legL - bob, shY = hipY - torso, headY = shY - hr * 0.8 + (o.breath ? Math.sin(o.breath) * 3 : 0);
      if (sit) for (const sg of [-1, 1]) limb(sg * 14, hipY, Math.PI / 2 * 0.98, legL * 0.55, 0.05, legL * 0.5, 28, col);
      else for (const sg of [-1, 1]) { const a = sg * sw + sg * 0.07; limb(sg * 14, hipY, a, legL / 2, a - (walk ? Math.max(0, sg * Math.cos(ph)) * 0.35 : 0), legL / 2, 28, col); }
      const arms = o.arms || [[0.16 - sw * 0.7, 0.1 - sw * 0.5], [-0.16 + sw * 0.7, -0.1 + sw * 0.5]];
      const hands = [];
      const drawArm = i => { const [a1, a2] = arms[i]; hands[i] = limb(i ? 26 : -26, shY + 24, a1, armL * 0.5, a2, armL * 0.5, 24, col); };
      drawArm(0);
      line([[0, hipY], [0, shY + 20]], 86, INK); line([[0, hipY], [0, shY + 20]], 74, col);
      drawArm(1);
      if (o.phone) { const [hx, hy] = hands[1]; ctx.save(); ctx.translate(hx, hy - 20); ctx.rotate(-0.25); rr(-22, -40, 44, 80, 8); ctx.fillStyle = INK; ctx.fill(); rr(-17, -34, 34, 66, 4); ctx.fillStyle = '#9fd4ff'; ctx.fill(); ctx.restore(); }
      // cabeça
      const hx = (o.tilt || 0) * 10;
      ctx.save(); ctx.translate(hx, headY); ctx.rotate(o.tilt || 0);
      ctx.beginPath(); ctx.arc(0, 0, hr, 0, TAU); ctx.fillStyle = HEAD; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke();
      if (o.glow) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, hr - 4, 0, TAU); ctx.clip(); const g = ctx.createRadialGradient(hr * 0.7, hr * 0.8, 10, hr * 0.3, hr * 0.4, hr * 1.6); g.addColorStop(0, `rgba(140,200,255,${0.55 * o.glow})`); g.addColorStop(1, 'rgba(140,200,255,0)'); ctx.fillStyle = g; ctx.fillRect(-hr, -hr, 2 * hr, 2 * hr); ctx.restore(); }
      if (o.shade) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, hr - 4, 0, TAU); ctx.clip(); ctx.fillStyle = `rgba(20,25,45,${o.shade})`; ctx.fillRect(-hr, -hr, 2 * hr, 2 * hr); ctx.restore(); }
      const lx = (o.look || 0) * hr * 0.28, ly = (o.lookY || 0) * hr * 0.2 + 4, es = hr * 0.3;
      const blink = (((o.t || 0) * 0.5 + (o.seed || 0) * 1.37) % 3.3) < 0.13;
      for (const sx of [-1, 1]) { const ex = sx * es + lx; if (blink || o.closed) { line([[ex - 9, ly], [ex + 9, ly]], 5, INK); } else { ctx.beginPath(); ctx.arc(ex, ly, hr * 0.085, 0, TAU); ctx.fillStyle = INK; ctx.fill(); } }
      if (o.smile) { ctx.beginPath(); ctx.arc(lx, ly + hr * 0.2, hr * 0.17 * o.smile, 0.25, Math.PI - 0.25); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); }
      if (o.tear) { const u = o.tear; ctx.globalAlpha *= clamp(1 - prog(u, 0.8, 1)); ctx.beginPath(); ctx.ellipse(lx + es + 4, ly + 20 + u * 60, 7, 11, 0, 0, TAU); ctx.fillStyle = '#9fd4ff'; ctx.fill(); }
      ctx.restore();
      ctx.restore();
    }
    const PHONE_ARMS = [[0.12, 0.1], [0.35, 2.55]];

    // ------------------------------------------------ cenários
    function houses(y, col, win, t, seed = 3) { const R = mulberry(seed); let x = -40; while (x < W + 40) { const w = 140 + R() * 120, h = 180 + R() * 220; ctx.fillStyle = col; ctx.fillRect(x, y - h, w, h + 400); ctx.beginPath(); ctx.moveTo(x - 10, y - h); ctx.lineTo(x + w / 2, y - h - 70); ctx.lineTo(x + w + 10, y - h); ctx.fill(); for (let i = 0; i < 2; i++) { if (R() < 0.35) continue; ctx.fillStyle = win; ctx.fillRect(x + 25 + i * (w / 2), y - h + 50, 38, 48); ctx.fillStyle = col; } x += w + 10; } }
    function skyline(t, o = {}) {
      const R = mulberry(o.seed || 5); let x = -60; const lit = o.lit || []; const out = [];
      while (x < W + 60) { const w = 150 + R() * 130, h = 500 + R() * 700, y0 = 1700 - h; ctx.fillStyle = o.col || '#161d2c'; ctx.fillRect(x, y0, w, h + 300); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.strokeRect(x, y0, w, h + 300);
        for (let yy = y0 + 40; yy < 1660; yy += 70) for (let xx = x + 22; xx < x + w - 40; xx += 52) { const r = R(); ctx.fillStyle = r < (o.on ?? 0.08) ? `rgba(255,214,140,${0.35 + 0.3 * r * 10})` : 'rgba(255,255,255,0.05)'; ctx.fillRect(xx, yy, 30, 40); }
        out.push([x, w, y0]); x += w + 14; }
      return out;
    }
    function bigWindow(x, y, w, h, light, inner) { // janela iluminada com alguém dentro
      ctx.save(); rr(x - 8, y - 8, w + 16, h + 16, 6); ctx.fillStyle = INK; ctx.fill();
      rr(x, y, w, h, 4); ctx.fillStyle = mixC('#1c2333', '#ffcf85', light); ctx.fill(); ctx.clip(); if (inner) inner(); ctx.restore();
      line([[x + w / 2, y], [x + w / 2, y + h]], 6, INK); if (light > 0.05) soft(x + w / 2, y + h / 2, w * 1.6, 'rgba(255,200,120,A)', 0.25 * light);
    }
    function phoneUI(x, y, s, fn) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); soft(0, 0, 700, 'rgba(120,180,255,A)', 0.18); rr(-330, -560, 660, 1120, 70); ctx.fillStyle = '#0b0d12'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#2b3140'; ctx.stroke(); ctx.save(); rr(-305, -535, 610, 1070, 50); ctx.clip(); ctx.translate(-305, -535); fn(610, 1070); ctx.restore(); ctx.restore(); }
    function bubble(sw, y, text, side, a, gray = 0) {
      if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a); const size = 34, w = Math.min(470, tw(text, size, 600) + 60), h = 82, x = side > 0 ? sw - 30 - w : 30, dy = (1 - outC(a)) * 30;
      rr(x, y + dy, w, h, 30); ctx.fillStyle = side > 0 ? mixC('#2f7d5f', '#3a3f48', gray) : mixC('#2a2f3a', '#2a2d33', gray); ctx.fill();
      txt(text, x + 30, y + dy + h / 2 + 1, size, { w: 600, color: mixC('#ffffff', '#8a8f99', gray), align: 'left' }); ctx.restore();
    }
    function dateChip(sw, y, s, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a); const w = tw(s, 24, 700) + 40; rr(sw / 2 - w / 2, y, w, 44, 22); ctx.fillStyle = '#1e222b'; ctx.fill(); txt(s, sw / 2, y + 23, 24, { w: 700, color: '#9aa3b2' }); ctx.restore(); }
    function chatHeader(sw, name, sub) { ctx.fillStyle = '#151922'; ctx.fillRect(0, 0, sw, 160); txt('‹', 40, 100, 60, { w: 400, color: '#cfd6e2' }); ctx.save(); ctx.translate(120, 98); ctx.beginPath(); ctx.arc(0, 0, 38, 0, TAU); ctx.fillStyle = HEAD; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 11, 2, 3.5, 0, TAU); ctx.fillStyle = INK; ctx.fill(); } ctx.restore(); txt(name, 180, 84, 34, { w: 700, color: '#ffffff', align: 'left' }); txt(sub, 180, 122, 24, { w: 500, color: '#8a93a3', align: 'left' }); }

    const OR = '#f5a300', OR2 = '#ffcf5c', GR = '#5b5f66', PROD = env.images && env.images.produto;
    const HL = new Set(['motor', 'ponto', 'seis', 'litros', 'mil', 'cavalos', 'como', 'v6', 'turbo', 'pistoes', 'milhares', 'puxam', 'comprimem', 'explodem', 'soltam', 'gas', 'quente', 'desperdicado', 'turbina', 'ar', 'doida', 'metade', 'eletrico', 'trezentos', 'cinquenta', 'quilowatts', 'freia', 'gerador', 'recarrega', 'bateria', 'reta', 'devolve', 'mguh', 'saiu', 'combustivel', 'sustentavel', 'carro', 'dentro', 'comenta', 'segue']);
    function chipO(s, x, y, size, fill, col, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); const sc = outBack(clamp(k)); ctx.scale(sc, sc); const w = tw(s, size, 800) + size * 1.2, h = size * 1.8; rr(-w / 2 + 6, -h / 2 + 8, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); txt(s, 0, 2, size, { w: 800, color: col }); ctx.restore(); }
    function zap(x, y, s, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = clamp(k); const pts = [[0, -60], [-22, -6], [6, -6], [-14, 60], [34, -18], [6, -18], [24, -60]]; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = '#ff4d4d'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    function battery(x, y, s, lvl, col) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-90, -45, 170, 90, 16); ctx.fillStyle = '#20242c'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); rr(82, -18, 18, 36, 5); ctx.fillStyle = INK; ctx.fill(); rr(-78, -33, 146 * clamp(lvl), 66, 9); ctx.fillStyle = col; ctx.fill(); txt(Math.round(lvl * 100) + '%', -5, 2, 36, { w: 900, color: '#fff', stroke: 6, strokeColor: INK }); ctx.restore(); }
    function mgTile(x, y, s, flip, a = 1) { // tile de tabela periódica
      ctx.save(); ctx.translate(x, y); ctx.scale(s * Math.max(0.02, Math.abs(Math.cos(flip * Math.PI))), s); ctx.globalAlpha = a; const front = flip > 0.5;
      rr(-170 + 12, -200 + 14, 340, 400, 30); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
      rr(-170, -200, 340, 400, 30); ctx.fillStyle = front ? '#ffffff' : '#2a2f3a'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = front ? OR : '#555c6b'; ctx.stroke();
      if (front) { txt('12', -120, -150, 40, { w: 800, color: GR, align: 'left' }); txt('Mg', 0, -10, 190, { w: 900, color: INK }); txt('Magnésio', 0, 140, 46, { w: 800, color: OR }); }
      else txt('?', 0, 10, 240, { w: 900, color: '#8a93a3' });
      ctx.restore();
    }
    function bed(x, y) { rr(x - 40, y - 220, 50, 330, 14); ctx.fillStyle = '#5a4535'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); rr(x, y - 30, 760, 120, 20); ctx.fillStyle = '#5a4535'; ctx.fill(); ctx.stroke(); line([[x + 40, y + 90], [x + 40, y + 170]], 16); line([[x + 720, y + 90], [x + 720, y + 170]], 16); }

    const Y = '#ffc400', BK = '#16181d', CARD = env.images && env.images.produto;
    // ------------------------------------------------ peças do kit
    function plugHead(kind, x, y, s, rot = 0, col = Y) { // ponta do cabo apontando para cima
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      rr(-46, 0, 92, 150, 18); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      for (let i = 0; i < 4; i++) line([[-24, 34 + i * 22], [24, 34 + i * 22]], 6, 'rgba(0,0,0,0.35)');
      if (kind === 'c') { rr(-28, -70, 56, 74, 22); ctx.fillStyle = '#d9b45a'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke(); rr(-14, -58, 28, 50, 10); ctx.fillStyle = '#8a6d2a'; ctx.fill(); }
      else if (kind === 'a') { rr(-40, -100, 80, 104, 6); ctx.fillStyle = '#d8dde4'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke(); rr(-28, -84, 56, 30, 4); ctx.fillStyle = '#ff6a3d'; ctx.fill(); }
      else { rr(-20, -86, 40, 90, 14); ctx.fillStyle = '#f2f2f2'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke(); for (let i = 0; i < 4; i++) { ctx.fillStyle = '#c9a24a'; ctx.fillRect(-10, -76 + i * 16, 20, 8); } }
      ctx.restore();
    }
    function cableLine(pts, w = 34) { line(pts, w + 12, INK); line(pts, w, BK); ctx.save(); ctx.setLineDash([6, 10]); line(pts, 4, 'rgba(255,255,255,0.25)'); ctx.restore(); }
    function phone(x, y, s, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); rr(-90, -170, 180, 340, 28); ctx.fillStyle = INK; ctx.fill(); rr(-78, -156, 156, 312, 18); ctx.fillStyle = o.off ? '#0a0b0e' : '#2a3550'; ctx.fill(); if (!o.off && o.bat !== undefined) { battery(0, -20, 0.62, o.bat, o.bat < 0.15 ? '#e2475f' : o.bat < 0.6 ? OR : '#3ecf7a'); if (o.charging) zap(0, 70, 0.5, 1); } rr(-20, 150, 40, 10, 5); ctx.fillStyle = '#333'; ctx.fill(); ctx.restore(); }
    function charger(x, y, s, glowC, glowA) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      line([[-40, -150], [-40, -230]], 22); line([[40, -150], [40, -230]], 22);
      rr(-150 + 12, -150 + 14, 300, 300, 50); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
      rr(-150, -150, 300, 300, 50); ctx.fillStyle = Y; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke();
      txt('GaN', 70, -100, 32, { w: 900, color: INK });
      if (glowC > 0) soft(-50, -10, 120, 'rgba(255,255,255,A)', glowC); if (glowA > 0) soft(-50, 90, 120, 'rgba(255,255,255,A)', glowA);
      rr(-90, -32, 80, 40, 18); ctx.fillStyle = INK; ctx.fill(); txt('C', 30, -12, 30, { w: 900, color: INK });
      rr(-100, 70, 100, 40, 6); ctx.fillStyle = '#ff6a3d'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); txt('A', 30, 90, 30, { w: 900, color: INK });
      ctx.restore();
    }
    function stripes(t, a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.rotate(-0.5); for (let i = -20; i < 30; i++) { const x = i * 120 + (t * 60) % 120; ctx.fillStyle = i % 2 ? 'rgba(255,196,0,0.18)' : 'rgba(0,0,0,0.04)'; ctx.fillRect(x, -800, 60, 4000); } ctx.restore(); }
    function card(x, y, w, a = 1, rot = 0) { if (!CARD) return; const h = w * CARD.height / CARD.width; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); rr(-w / 2 + 12, -h / 2 + 16, w, h, 36); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill(); ctx.save(); rr(-w / 2, -h / 2, w, h, 36); ctx.clip(); ctx.drawImage(CARD, -w / 2, -h / 2, w, h); ctx.restore(); rr(-w / 2, -h / 2, w, h, 36); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    function brightBg(t) { sky([[0, '#fff8df'], [1, '#ffe48a']]); stripes(t); }
    function xMark(x, y, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); const s = outBack(k); ctx.scale(s, s); circ(0, 0, 46, '#e2475f', 6); line([[-18, -18], [18, 18]], 10, '#fff'); line([[18, -18], [-18, 18]], 10, '#fff'); ctx.restore(); }

    function neonChip(s, x, y, size, col, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); const sc = outBack(clamp(k)); ctx.scale(sc, sc); const w = tw(s, size, 900) + size * 1.2, h = size * 1.8; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(10,14,28,0.9)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); txt(s, 0, 2, size, { w: 900, color: col }); ctx.restore(); }
    // ================================================= F1 — carro e motor genéricos (sem marcas)
    const F = { red: '#ff2d2d', ora: '#ff8a1f', ele: '#3ff0ff', bat: '#c6ff3f', air: '#5ab4ff', steel: '#c9ced8', dark: '#0b0c10' };
    const carbonTex = (() => { const cv = mk(64, 64), g = cv.getContext('2d'); g.fillStyle = '#121318'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 16) for (let x = 0; x < 64; x += 16) { const a = ((x + y) / 16) % 2; const gr = g.createLinearGradient(x, y, x + 16, y + 16); gr.addColorStop(0, a ? '#1d1f26' : '#16171c'); gr.addColorStop(1, a ? '#121318' : '#202229'); g.fillStyle = gr; g.fillRect(x, y, 16, 16); } return cv; })();
    function carbonBg(t, o = {}) {
      scr(); ctx.fillStyle = ctx.createPattern(carbonTex, 'repeat'); ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(540, o.cy || 900, 100, 540, o.cy || 900, 1200); g.addColorStop(0, 'rgba(255,45,45,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0.75)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = 0.10; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.restore();
    }
    function wheel(x, y, r, spin, glow = 0) { ctx.save(); ctx.translate(x, y); circ(0, 0, r, '#14151a', 8); circ(0, 0, r * 0.62, '#2a2d36', 5); if (glow > 0) soft(0, 0, r * 0.9, 'rgba(255,90,40,A)', glow); ctx.rotate(spin); for (let k = 0; k < 6; k++) { ctx.rotate(TAU / 6); line([[0, 0], [0, -r * 0.58]], 7, '#5a5f6e'); } circ(0, 0, r * 0.16, F.red, 4); ctx.restore(); }
    // carro de fórmula genérico, de lado, virado para a direita
    function car(x, y, s, t, o = {}) {
      const xr = o.xray || 0, spin = o.spin ?? t * 20;
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      // asas
      ctx.globalAlpha = 1 - 0.6 * xr; rr(-470, -190, 120, 22, 6); ctx.fillStyle = '#1b1c22'; ctx.fill(); rr(-470, -160, 120, 18, 6); ctx.fill(); line([[-410, -140], [-400, -40]], 12, '#1b1c22'); rr(-480, -200, 20, 90, 4); ctx.fillStyle = F.red; ctx.fill();
      rr(400, 50, 140, 16, 6); ctx.fillStyle = '#1b1c22'; ctx.fill(); rr(520, 20, 20, 50, 4); ctx.fillStyle = F.red; ctx.fill();
      // corpo
      const body = () => { ctx.beginPath(); ctx.moveTo(540, 40); ctx.quadraticCurveTo(400, 0, 260, -18); ctx.lineTo(120, -40); ctx.quadraticCurveTo(60, -70, -20, -70); ctx.lineTo(-90, -110); ctx.quadraticCurveTo(-150, -112, -170, -80); ctx.lineTo(-360, -50); ctx.lineTo(-430, -20); ctx.lineTo(-420, 40); ctx.lineTo(-300, 60); ctx.lineTo(380, 60); ctx.closePath(); };
      body(); ctx.globalAlpha = 1 - 0.85 * xr; const gb = ctx.createLinearGradient(0, -110, 0, 60); gb.addColorStop(0, '#e8202a'); gb.addColorStop(1, '#7a0a10'); ctx.fillStyle = gb; ctx.fill(); ctx.globalAlpha = 1;
      body(); ctx.lineWidth = 6; ctx.strokeStyle = xr > 0.1 ? `rgba(63,240,255,${0.4 + 0.6 * xr})` : '#3a0a0e'; if (xr > 0.1) ctx.setLineDash([16, 10]); ctx.stroke(); ctx.setLineDash([]);
      if (xr < 0.9) { ctx.globalAlpha = 1 - xr; rr(-60, -40, 300, 10, 4); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill(); txt('00', 160, 10, 46, { w: 900, color: '#fff' }); ctx.globalAlpha = 1; }
      // capacete + halo
      circ(30, -70, 30, '#ffd23f', 5); ctx.beginPath(); ctx.moveTo(-20, -60); ctx.quadraticCurveTo(40, -130, 110, -45); ctx.lineWidth = 9; ctx.strokeStyle = '#2a2d36'; ctx.stroke();
      // componentes internos (raio-X)
      if (xr > 0.05) { ctx.save(); ctx.globalAlpha = xr;
        rr(-280, -75, 210, 110, 14); ctx.fillStyle = '#2a2d36'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = F.ora; ctx.stroke(); txt('V6', -175, -20, 40, { w: 900, color: F.ora });
        circ(-330, -40, 34, '#3a2a22', 5); ctx.strokeStyle = F.red; ctx.beginPath(); ctx.arc(-330, -40, 34, 0, TAU); ctx.stroke(); txt('T', -330, -38, 26, { w: 900, color: F.red });
        rr(-60, 30, 260, 22, 6); ctx.fillStyle = F.bat; ctx.fill(); rr(-60, 30, 260, 22, 6); ctx.lineWidth = 4; ctx.strokeStyle = '#111'; ctx.stroke();
        rr(-120, 5, 50, 40, 10); ctx.fillStyle = F.ele; ctx.fill(); ctx.stroke();
        ctx.restore(); }
      wheel(-300, 50, 100, spin, o.brake || 0); wheel(330, 50, 92, spin * 1.08, o.brake || 0);
      ctx.restore();
    }
    function rpmGauge(x, y, s, rpm, label = 'RPM') {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, f = clamp(rpm / 15000), R = 150;
      circ(0, 0, 180, '#0b0c10', 6); ctx.beginPath(); ctx.arc(0, 0, R, a0, a1); ctx.lineWidth = 22; ctx.strokeStyle = '#2a2d36'; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, R, a0, lerp(a0, a1, f)); ctx.strokeStyle = f > 0.85 ? F.red : f > 0.6 ? F.ora : F.ele; ctx.stroke();
      for (let k = 0; k <= 15; k += 3) { const a = lerp(a0, a1, k / 15); txt(String(k), Math.cos(a) * 112, Math.sin(a) * 112, 24, { w: 800, color: '#8a93a8' }); }
      const na = lerp(a0, a1, f); line([[0, 0], [Math.cos(na) * 130, Math.sin(na) * 130]], 8, '#fff'); circ(0, 0, 14, F.red, 0);
      txt(milharF(rpm), 0, 70, 44, { w: 900, color: '#fff' }); txt(label, 0, 112, 22, { w: 800, color: '#8a93a8' }); ctx.restore();
    }
    const milharF = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    // corte de um cilindro (ciclo de 4 tempos). c = ângulo do ciclo 0..4π (0 = PMS no início da admissão)
    function cylinder(x, y, s, c, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
      const crankR = 70, L = 220, a = c + Math.PI, pinX = crankR * Math.sin(a), pinY = crankR * Math.cos(a), pistY = pinY - Math.sqrt(L * L - pinX * pinX);
      const top = -L - crankR - 120, cc = ((c % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI), phase = Math.floor(cc / Math.PI);
      // câmara
      ctx.fillStyle = '#20232c'; ctx.fillRect(-80, top, 160, -top - 40); ctx.lineWidth = 8; ctx.strokeStyle = '#5a5f6e'; ctx.strokeRect(-80, top, 160, -top - 40);
      const gas = ctx.createLinearGradient(0, top, 0, pistY - 40); const col = phase === 0 ? 'rgba(90,180,255,0.55)' : phase === 1 ? 'rgba(90,180,255,0.85)' : phase === 2 ? `rgba(255,${Math.round(140 - 100 * (1 - (cc - 2 * Math.PI) / Math.PI))},40,0.9)` : 'rgba(150,150,160,0.6)';
      gas.addColorStop(0, col); gas.addColorStop(1, col); ctx.fillStyle = gas; ctx.fillRect(-76, top + 4, 152, pistY - 40 - top - 4);
      if (phase === 2 && cc - 2 * Math.PI < 0.6) { soft(0, top + 40, 160, 'rgba(255,220,120,A)', 1 - (cc - 2 * Math.PI) / 0.6); star(0, top + 30, 40, '#fff6c0', 7); }
      // válvulas
      const vin = phase === 0 ? Math.sin(cc) * 22 : 0, vex = phase === 3 ? Math.sin(cc - 3 * Math.PI) * 22 : 0;
      line([[-40, top - 70], [-40, top + 6 + vin]], 8, '#8a93a8'); line([[-62, top + 6 + vin], [-18, top + 6 + vin]], 8, F.air);
      line([[40, top - 70], [40, top + 6 + vex]], 8, '#8a93a8'); line([[18, top + 6 + vex], [62, top + 6 + vex]], 8, F.ora);
      // vela
      line([[0, top - 60], [0, top + 2]], 10, '#e8e8e8');
      // pistão + biela + virabrequim
      rr(-74, pistY - 40, 148, 70, 10); ctx.fillStyle = F.steel; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#111'; ctx.stroke(); line([[-74, pistY - 24], [74, pistY - 24]], 3, '#555'); line([[-74, pistY - 12], [74, pistY - 12]], 3, '#555');
      line([[0, pistY], [pinX, pinY]], 18, '#8a93a8');
      circ(0, 0, crankR + 14, '#2a2d36', 6); line([[0, 0], [pinX, pinY]], 26, '#5a5f6e'); circ(pinX, pinY, 14, F.red, 4); circ(0, 0, 12, '#111', 0);
      if (o.labels) { const L4 = ['ADMISSÃO', 'COMPRESSÃO', 'EXPLOSÃO', 'ESCAPE'], C4 = [F.air, F.ele, F.ora, '#9aa0aa']; neonChip(L4[phase], 0, top - 120, 30, C4[phase], 1); }
      ctx.restore();
      return { phase };
    }
    function turbo(x, y, s, t, spin, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      for (const [sx, col, lab] of [[-1, F.red, 'TURBINA'], [1, F.air, 'COMPRESSOR']]) {
        ctx.save(); ctx.translate(sx * 190, 0); ctx.beginPath(); for (let i = 0; i <= 60; i++) { const a = i / 60 * TAU * 0.92, r = 90 + i * 1.2; ctx.lineTo(Math.cos(a) * r * sx, Math.sin(a) * r); } ctx.lineTo(sx * 200, -40); ctx.lineTo(sx * 260, -40); ctx.lineTo(sx * 260, 40); ctx.closePath(); ctx.fillStyle = '#2a2d36'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = col; ctx.stroke();
        if (sx < 0) soft(0, 0, 160, 'rgba(255,80,40,A)', 0.35 * (o.hot ?? 1));
        ctx.save(); ctx.rotate(spin * sx); for (let k = 0; k < 10; k++) { ctx.rotate(TAU / 10); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -40, 10, -78); ctx.lineWidth = 9; ctx.strokeStyle = sx < 0 ? '#ffb08a' : '#cfe8ff'; ctx.stroke(); } ctx.restore(); circ(0, 0, 18, '#111', 0);
        txt(lab, 0, 150, 30, { w: 900, color: col }); ctx.restore();
      }
      rr(-110, -16, 220, 32, 10); ctx.fillStyle = F.steel; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#111'; ctx.stroke(); txt('EIXO', 0, -40, 24, { w: 800, color: '#8a93a8' });
      ctx.restore();
    }
    function particles(path, t, n, col, speed = 0.8, size = 10, a = 1) { if (a <= 0) return; const L = path.length - 1; for (let i = 0; i < n; i++) { const u = ((t * speed + i / n) % 1), f = u * L, k = Math.min(L - 1, Math.floor(f)), r = f - k; const x = lerp(path[k][0], path[k + 1][0], r), y = lerp(path[k][1], path[k + 1][1], r); ctx.globalAlpha = a * Math.sin(u * Math.PI); circ(x, y, size, col, 0); } ctx.globalAlpha = 1; }
    function motorK(x, y, s, t, spin, glow) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); soft(0, 0, 220, 'rgba(63,240,255,A)', 0.4 * glow); rr(-140, -100, 280, 200, 40); ctx.fillStyle = '#20232c'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = F.ele; ctx.stroke(); for (let i = 0; i < 9; i++) line([[-110 + i * 27, -80], [-110 + i * 27, 80]], 12, '#c87533'); ctx.save(); ctx.rotate(spin); line([[-170, 0], [170, 0]], 14, F.steel); ctx.restore(); txt('MGU-K', 0, 140, 34, { w: 900, color: F.ele }); ctx.restore(); }
    function batteryPack(x, y, s, lvl, t, glow) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); soft(0, 0, 220, 'rgba(198,255,63,A)', 0.35 * glow); rr(-170, -80, 340, 160, 18); ctx.fillStyle = '#20232c'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = F.bat; ctx.stroke(); for (let i = 0; i < 8; i++) { rr(-150 + i * 38, -60, 30, 120, 6); ctx.fillStyle = i < Math.round(lvl * 8) ? F.bat : '#2a2d36'; ctx.fill(); } txt('BATERIA', 0, 120, 30, { w: 900, color: F.bat }); txt(Math.round(lvl * 100) + '%', 0, 0, 40, { w: 900, color: '#111', stroke: 6, strokeColor: '#fff' }); ctx.restore(); }

    // ================= CENA 1 — gancho =================
    const s1 = { mot: wt('c1', 'motor'), pon: wt('c1', 'ponto'), lit: wt('c1', 'litros'), com: wt('c1', 'comum'), mas: wt('c1', 'mas'), mil: wt('c1', 'mil'), cav: wt('c1', 'cavalos'), como: wt('c1', 'como') };
    cue(0, 'music', { part: 'intro' }); cue(0.1, 'engine', { dur: 1.6, f0: 120, f1: 520, gain: 1.0 }); cue(0.3, 'whoosh', { dur: 0.8 }); cue(s1.lit, 'stamp'); cue(s1.mil - 0.3, 'engine', { dur: 1.4, f0: 200, f1: 700, gain: 0.8 }); cue(s1.cav, 'impact'); cue(s1.como, 'glitch', { dur: 0.3 });
    function scene1(t) {
      carbonBg(t);
      const enter = sm(t, 0, 1.0, outC), xr = sm(t, s1.mot - 0.1, s1.pon + 0.4), zoom = sm(t, s1.mas - 0.2, s1.mil);
      const shake = pulse(t, s1.cav, 0.02, 0.3) * 14;
      ctx.save(); ctx.translate(Math.sin(t * 70) * shake, 0);
      ctx.translate(540, 760); const z = lerp(0.95, 1.12, zoom); ctx.scale(z, z); ctx.translate(-540 + lerp(0, 60, zoom), -760);
      if (enter < 1) for (let i = 0; i < 8; i++) line([[lerp(-600, 0, enter) - 200 - i * 40, 640 + i * 30], [lerp(-600, 0, enter) + 200 - i * 40, 640 + i * 30]], 6, `rgba(255,255,255,${0.3 * (1 - enter)})`);
      car(lerp(-700, 540, enter), 760, 0.82, t, { xray: xr, spin: t * 30 });
      ctx.restore();
      chipF('1,6 LITRO', 540, 420, 56, F.ora, prog(t, s1.lit - 0.1, s1.lit + 0.2));
      if (t > s1.mil - 0.2) { const k = sm(t, s1.mil - 0.2, s1.cav + 0.2, outBack); rtxt('~1000 cv', 540, 1150, 130, { color: '#fff', sh: F.red, scale: k }); rpmGauge(540, 1380, 0.75, lerp(4000, 15000, prog(t, s1.mil - 0.3, s1.cav + 0.4))); }
      if (t > s1.como - 0.05) rtxt('COMO?', 540, 300, 120, { color: F.red, sh: '#111', scale: sm(t, s1.como - 0.05, s1.como + 0.2, outBack) });
    }
    function chipF(s, x, y, size, col, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); const sc = outBack(clamp(k)); ctx.scale(sc, sc); const w = tw(s, size, 900) + size * 1.2, h = size * 1.7; ctx.beginPath(); ctx.moveTo(-w / 2 + 20, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2 - 20, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: '#111' }); ctx.restore(); }

    // ================= CENA 2 — V6 e o ciclo de 4 tempos =================
    const s2 = { den: wt('c2', 'dentro'), v6: wt('c2', 'v6'), tur: wt('c2', 'turbo'), pis: wt('c2', 'pistoes'), mil: wt('c2', 'milhares'), pux: wt('c2', 'puxam'), com: wt('c2', 'comprimem'), exp: wt('c2', 'explodem'), sol: wt('c2', 'soltam') };
    cue(B[1], 'music', { part: 'groove' }); cue(B[1] + 0.1, 'whoosh', { dur: 0.5 }); cue(s2.v6, 'stamp'); cue(s2.pux, 'wind', { dur: 0.6 }); cue(s2.exp, 'impact', { gain: 0.8 }); cue(s2.sol, 'wipe', { dur: 0.5 }); cue(s2.mil, 'engine', { dur: 1.6, f0: 250, f1: 650, gain: 0.7 });
    function cycleAt(t) { // ciclo lento sincronizado com as palavras, depois acelera
      if (t < s2.pux) return (t - B[1]) * 3; const k = [[s2.pux, 0], [s2.com, Math.PI], [s2.exp, 2 * Math.PI], [s2.sol, 3 * Math.PI], [s2.sol + 0.6, 4 * Math.PI]]; for (let i = 1; i < k.length; i++) if (t < k[i][0]) return lerp(k[i - 1][1], k[i][1], (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])); return 4 * Math.PI + (t - s2.sol - 0.6) * 18; }
    function scene2(t) {
      carbonBg(t);
      const c = cycleAt(t), fast = t < s2.pux;
      // dois cilindros em V (90°)
      ctx.save(); ctx.translate(540, 1080);
      cylinder(-95, 0, 0.95, c, { rot: -Math.PI / 4 }); cylinder(95, 0, 0.95, c + Math.PI * 1.5, { rot: Math.PI / 4 });
      ctx.restore();
      const info = cylinder(-10000, -10000, 0.01, c, {});
      if (!fast) { const L4 = ['ADMISSÃO', 'COMPRESSÃO', 'EXPLOSÃO', 'ESCAPE'], C4 = [F.air, F.ele, F.ora, '#9aa0aa']; chipF(L4[info.phase], 540, 420, 50, C4[info.phase], 1); }
      rtxt('V6 TURBO', 540, 300, 100, { color: '#fff', sh: F.red, scale: sm(t, s2.v6 - 0.1, s2.v6 + 0.2, outBack) * (fast ? 1 : 0) });
      if (t > s2.mil - 0.1 && t < s2.pux) chipF('MILHARES DE VEZES POR MINUTO', 540, 420, 34, F.ora, prog(t, s2.mil - 0.1, s2.mil + 0.2));
      txt('corte de 2 dos 6 cilindros', 540, 1440, 26, { w: 700, color: '#8a93a8' });
    }

    // ================= CENA 3 — turbo =================
    const s3 = { gas: wt('c3', 'gas'), que: wt('c3', 'quente'), des: wt('c3', 'desperdicado'), gir: wt('c3', 'gira'), tur: wt('c3', 'turbina'), emp: wt('c3', 'empurra'), mai: wt('c3', 'mais'), ar: wt('c3', 'ar') };
    cue(s3.gas, 'wind', { dur: 1.2 }); cue(s3.gir, 'riser', { dur: 1.6 }); cue(s3.emp, 'whoosh', { dur: 0.8 });
    function scene3(t) {
      carbonBg(t);
      const sp = t < s3.gir ? 0.5 : 0.5 + (t - s3.gir) * 6;
      const spin = t * 2 + Math.max(0, t - s3.gir) * Math.max(0, t - s3.gir) * 6;
      turbo(540, 860, 1.05, t, spin);
      const exPath = [[0, 1300], [200, 1300], [340, 1050], [340, 860]], exOut = [[340, 860], [180, 760], [80, 560], [80, 300]];
      const airIn = [[1080, 560], [900, 640], [740, 860]], airOut = [[740, 860], [880, 1100], [1000, 1350], [1080, 1400]];
      line(exPath, 34, 'rgba(255,90,40,0.25)'); line(airOut, 34, 'rgba(90,180,255,0.25)');
      particles(exPath, t, 14, F.ora, 0.9, 14, prog(t, s3.gas - 0.2, s3.gas + 0.2)); particles(exOut, t, 10, '#9aa0aa', 0.9, 10, prog(t, s3.gir, s3.gir + 0.3));
      particles(airIn, t, 10, F.air, 1.1, 12, prog(t, s3.gir, s3.gir + 0.3)); particles(airOut, t, 18, F.air, sp * 0.5, 13, prog(t, s3.emp - 0.1, s3.emp + 0.2));
      chipF('GÁS QUENTE DO ESCAPE', 300, 1450, 32, F.ora, prog(t, s3.que - 0.1, s3.que + 0.2));
      if (t > s3.emp - 0.1) chipF('+ AR PRO MOTOR', 800, 1450, 34, F.air, prog(t, s3.emp - 0.1, s3.emp + 0.2));
      rtxt('NÃO É DESPERDIÇADO', 540, 330, 66, { color: '#fff', sh: F.red, scale: sm(t, s3.des - 0.1, s3.des + 0.2, outBack) });
    }

    // ================= CENA 4 — metade elétrica =================
    const s4 = { doi: wt('c4', 'doida'), des: wt('c4', 'desde'), sei: wt('c4', 'seis'), qua: wt('c4', 'quase'), met: wt('c4', 'metade'), ele: wt('c4', 'eletrico'), tre: wt('c4', 'trezentos'), kw: wt('c4', 'quilowatts') };
    cue(s4.doi, 'zap'); cue(s4.des, 'card'); cue(s4.met, 'riser', { dur: 1.0 }); cue(s4.ele, 'zap'); cue(s4.tre, 'roll', { dur: 1.2 }); cue(s4.kw, 'impact', { gain: 0.8 });
    function scene4(t) {
      carbonBg(t, { cy: 800 });
      const yr = sm(t, s4.des - 0.1, s4.sei + 0.2, outBack);
      if (yr > 0) rtxt('2026', 540, 300, 140, { color: F.ele, sh: '#111', scale: yr });
      // barra de potência: combustão x elétrico
      const bk = prog(t, s4.qua - 0.2, s4.met + 0.4); const x0 = 120, wTot = 840, eW = wTot * 350 / 750 * bk;
      rr(x0, 560, wTot, 120, 20); ctx.fillStyle = '#20232c'; ctx.fill();
      rr(x0, 560, wTot - eW, 120, 20); ctx.fillStyle = F.ora; ctx.fill(); txt('COMBUSTÃO ~400 kW', x0 + 30, 620, 32, { w: 900, color: '#111', align: 'left' });
      if (eW > 4) { rr(x0 + wTot - eW, 560, eW, 120, 20); ctx.fillStyle = F.ele; ctx.fill(); if (bk > 0.6) txt('ELÉTRICO', x0 + wTot - 30, 620, 32, { w: 900, color: '#111', align: 'right' }); }
      chipF('QUASE METADE', 540, 760, 44, F.ele, prog(t, s4.met - 0.1, s4.met + 0.2));
      // MGU-K 120 kW -> 350 kW
      const mk2 = sm(t, s4.ele - 0.2, s4.ele + 0.2, outBack); if (mk2 > 0) motorK(540, 1080, mk2 * 1.0, t, t * 12, 1);
      const kw = Math.round(lerp(120, 350, prog(t, s4.tre - 0.1, s4.kw + 0.2)));
      if (t > s4.tre - 0.2) { rtxt(kw + ' kW', 540, 1340, 110, { color: F.ele, sh: '#111' }); txt('antes de 2026: 120 kW', 540, 1440, 30, { w: 800, color: '#8a93a8' }); }
    }

    // ================= CENA 5 — freia e recarrega / reta e devolve =================
    const s5 = { fre: wt('c5', 'freia'), ger: wt('c5', 'gerador'), rec: wt('c5', 'recarrega'), bat: wt('c5', 'bateria'), ret: wt('c5', 'reta'), dev: wt('c5', 'devolve'), vez: wt('c5', 'vez') };
    cue(s5.fre - 0.1, 'scratch'); cue(s5.fre, 'engine', { dur: 1.2, f0: 600, f1: 200, gain: 0.7 }); cue(s5.rec, 'riser', { dur: 1.0 }); cue(s5.ret - 0.1, 'engine', { dur: 2.0, f0: 250, f1: 750, gain: 0.9 }); cue(s5.dev, 'zap'); cue(s5.vez, 'whoosh', { dur: 0.6 });
    function scene5(t) {
      carbonBg(t, { cy: 700 });
      const brake = sm(t, s5.fre - 0.2, s5.fre + 0.2) * (1 - sm(t, s5.ret - 0.3, s5.ret)), boost = sm(t, s5.ret - 0.2, s5.ret + 0.3);
      const speed = 300 - 200 * brake + 30 * boost;
      // pista em movimento
      ctx.fillStyle = '#1a1b20'; ctx.fillRect(0, 760, W, 260); for (let i = 0; i < 12; i++) { const x = ((i * 140 - t * speed * 4) % 1680 + 1680) % 1680 - 300; ctx.fillStyle = i % 2 ? F.red : '#eee'; ctx.fillRect(x, 1000, 70, 20); }
      if (boost > 0) for (let i = 0; i < 8; i++) line([[0, 580 + i * 26], [300 + 200 * Math.sin(i * 3 + t * 9), 580 + i * 26]], 5, `rgba(255,255,255,${0.35 * boost})`);
      car(540, 830, 0.9, t, { xray: 1, spin: t * speed * 0.1, brake: brake });
      // fluxo de energia
      const lvl = clamp(0.35 + 0.55 * prog(t, s5.fre, s5.bat + 0.6) - 0.6 * prog(t, s5.dev - 0.1, s5.vez + 0.6));
      motorK(300, 1250, 0.7, t, t * 10, 1); batteryPack(780, 1250, 0.8, lvl, t, brake || boost);
      const toBat = [[260, 880], [300, 1180], [520, 1250], [640, 1250]], toWheel = [[640, 1250], [520, 1250], [300, 1180], [260, 880]];
      particles(toBat, t, 12, F.bat, 1.0, 12, brake); particles(toWheel, t, 12, '#ffd23f', 1.4, 12, boost * (1 - prog(t, s5.vez + 0.6, s5.vez + 1)));
      if (brake > 0.3) { chipF('FREOU = GERADOR', 540, 420, 50, F.bat, brake); chipF('RECARREGA', 540, 520, 40, '#fff', prog(t, s5.rec - 0.1, s5.rec + 0.2) * brake); }
      if (boost > 0.3) { chipF('RETA = BOOST', 540, 420, 50, '#ffd23f', boost); chipF('~8,5 MJ POR VOLTA', 540, 520, 34, '#fff', prog(t, s5.dev, s5.dev + 0.2)); }
      txt(Math.round(speed) + ' km/h', 900, 300, 48, { w: 900, color: '#fff', stroke: 6, strokeColor: '#111' });
    }

    // ================= CENA 6 — MGU-H saiu + combustível sustentável =================
    const s6 = { pec: wt('c6', 'peca'), ger: wt('c6', 'gerava'), mgu: wt('c6', 'mguh'), sai: wt('c6', 'saiu'), com: wt('c6', 'combustivel'), cem: wt('c6', 'cem'), sus: wt('c6', 'sustentavel') };
    cue(s6.pec, 'card'); cue(s6.sai, 'stamp'); cue(s6.sai + 0.05, 'crack'); cue(s6.com, 'pour', { dur: 0.8 }); cue(s6.sus, 'success');
    function scene6(t) {
      carbonBg(t);
      const out = sm(t, s6.sai, s6.sai + 0.8), fuel = sm(t, s6.com - 0.3, s6.com + 0.2, outBack);
      if (fuel < 1) { ctx.save(); ctx.globalAlpha = 1 - fuel; turbo(540, 760, 0.7, t, t * 6);
        ctx.save(); ctx.translate(540, 760 + 0 + out * 700); ctx.rotate(out * 2); rr(-70, -60, 140, 120, 20); ctx.fillStyle = '#3a2a22'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = F.ora; ctx.stroke(); for (let i = 0; i < 5; i++) line([[-50 + i * 25, -50], [-50 + i * 25, 50]], 8, '#c87533'); txt('MGU-H', 0, 95, 30, { w: 900, color: F.ora }); ctx.restore();
        chipF('GERAVA ENERGIA PELO TURBO', 540, 420, 36, F.ora, prog(t, s6.ger - 0.1, s6.ger + 0.2)); stampMark(540, 1150, 'REMOVIDO EM 2026', prog(t, s6.sai, s6.sai + 0.18), { size: 60, rot: -0.1 }); ctx.restore(); }
      if (fuel > 0) { ctx.save(); ctx.translate(540, 860); ctx.scale(fuel, fuel); soft(0, 0, 360, 'rgba(120,255,120,A)', 0.3); ctx.beginPath(); ctx.moveTo(0, -260); ctx.bezierCurveTo(170, -40, 200, 80, 150, 160); ctx.bezierCurveTo(90, 270, -90, 270, -150, 160); ctx.bezierCurveTo(-200, 80, -170, -40, 0, -260); ctx.fillStyle = '#2f9e4a'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = '#c6ff3f'; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-60, 120); ctx.quadraticCurveTo(-60, -40, 80, -60); ctx.quadraticCurveTo(70, 90, -60, 120); ctx.fillStyle = '#c6ff3f'; ctx.fill(); ctx.restore(); rtxt('100%', 540, 1260, 120, { color: '#c6ff3f', sh: '#111', scale: sm(t, s6.cem - 0.1, s6.cem + 0.2, outBack) }); chipF('COMBUSTÍVEL SUSTENTÁVEL', 540, 1400, 38, '#c6ff3f', prog(t, s6.sus - 0.1, s6.sus + 0.2)); }
    }

    // ================= CENA 7 — CTA =================
    const s7 = { qua: wt('c7', 'qual'), car: wt('c7', 'carro'), den: wt('c7', 'dentro'), com: wt('c7', 'comenta'), seg: wt('c7', 'segue') };
    cue(B[6], 'music', { part: 'outro' }); cue(B[6] + 0.1, 'engine', { dur: 1.4, f0: 300, f1: 800, gain: 0.8 }); cue(B[6] + 0.3, 'whoosh', { dur: 0.6 }); cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    function scene7(t) {
      carbonBg(t);
      const pass = prog(t, B[6], B[6] + 1.4);
      car(lerp(-600, 1700, inC(pass)), 700, 0.85, t, { spin: t * 40 }); if (pass > 0 && pass < 1) for (let i = 0; i < 8; i++) line([[lerp(-600, 1700, inC(pass)) - 500 - i * 30, 620 + i * 22], [lerp(-600, 1700, inC(pass)) - 200, 620 + i * 22]], 6, 'rgba(255,255,255,0.3)');
      if (pass >= 1) car(540, 700, 0.85, t, { xray: 0.5 + 0.5 * Math.sin(t * 2), spin: t * 10 });
      rtxt('QUAL CARRO', 540, 330, 90, { color: '#fff', sh: F.red, scale: sm(t, s7.qua - 0.1, s7.qua + 0.2, outBack) }); rtxt('POR DENTRO?', 540, 440, 90, { color: F.ora, sh: '#111', scale: sm(t, s7.den - 0.1, s7.den + 0.2, outBack) });
      const ck = sm(t, s7.com - 0.2, s7.com + 0.2, outBack); if (ck > 0) ['um carro elétrico!', 'motor de moto GP', 'caminhão!'].forEach((m, i) => { const k = prog(t, s7.com + i * 0.25, s7.com + i * 0.25 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([300, 780, 330][i], [960, 1000, 1110][i]); ctx.scale(outBack(k), outBack(k)); rr(-180, -40, 360, 80, 30); ctx.fillStyle = '#fff'; ctx.fill(); txt(m, 0, 2, 30, { w: 800, color: '#111' }); ctx.restore(); });
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1300); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(255,45,45,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? '#fff' : F.red; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: press ? F.red : '#fff' }); ctx.restore(); }
    }

    // ================= legendas =================
    const groups = []; {
      let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); }
      flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; });
    }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return;
      scr(); const size = 72, font = `900 ${size}px Inter`;
      const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop;
      ctx.save(); ctx.translate(540, 1560); ctx.scale(sc, sc); ctx.globalAlpha = a;
      let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? Y : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // ================= composição =================
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    const XT = 0.18;
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / XT);
      scr(); grainOver(t); ctx.drawImage(vig2, 0, 0);
      if (fl > 0) { ctx.globalAlpha = clamp(fl) * 0.85; ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t);
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
