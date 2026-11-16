/* VOCÊ É CRISTÃO OU SÓ APRENDEU A PARECER CRISTÃO? (Mateus 23:27). Série "Você é cristão ou...?" ep. 01.
   Estética cinematográfica escura (preto, dourado, bege, marrom, vermelho escuro): personagem 2D consistente,
   luz volumétrica simulada, partículas, granulação, câmera com dolly/pan, tipografia com tracking/máscara. 9:16. */
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
  const outBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  const BLACK = '#0b0907', GOLD = '#d9a94e', GOLD2 = '#ffd98a', BEIGE = '#eadcc0', BROWN = '#5a3d26', DRED = '#8e2323', RED = '#c23b30', COLD = '#4d7396', MUTE = '#8d7f6c';
  const SKIN = '#c4946a', HAIR = '#2a1d14';

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = TL.clips.length;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);

    // ---------------- tipografia ----------------
    const fnt = (size, o = {}) => (o.serif ? `${o.it ? 'italic ' : ''}${size}px Serif` : `${o.it ? 'italic ' : ''}${o.w || 800} ${size}px Inter`);
    function txt(s, x, y, size, o = {}) { if (o.a !== undefined && o.a <= 0.001) return; if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = fnt(size, o); ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1;
      if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = o.sb ?? 18; }
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || 'rgba(0,0,0,0.9)'; ctx.strokeText(s, 0, 0); }
      ctx.fillStyle = o.color || BEIGE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, o = {}) => { ctx.font = fnt(size, o); return ctx.measureText(s).width; };
    // tracking: letras chegam abertas e se fecham
    function tTrack(s, x, y, size, k, o = {}) { if (k <= 0) return; const e = outC(k), sp = lerp(size * 0.55, o.sp ?? size * 0.06, e); const cs = [...s], ws = cs.map(c => tw(c, size, o)); const tot = ws.reduce((a, b) => a + b, 0) + sp * (cs.length - 1); let cx = x - tot / 2; cs.forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, Object.assign({}, o, { a: (o.a ?? 1) * clamp(k * 1.6) })); cx += ws[i] + sp; }); }
    // máscara: sobe de baixo de uma linha invisível
    function tMask(s, x, y, size, k, o = {}) { if (k <= 0) return; const e = outC(k); ctx.save(); ctx.beginPath(); ctx.rect(0, y - size * 0.8, W, size * 1.45); ctx.clip(); txt(s, x, y + size * 1.1 * (1 - e), size, Object.assign({}, o, { a: (o.a ?? 1) * clamp(k * 2) })); ctx.restore(); }
    // desfoque progressivo (cópias deslocadas que convergem)
    function tBlur(s, x, y, size, k, o = {}) { if (k <= 0) return; const e = outC(k), d = (1 - e) * 26; if (d > 0.5) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; txt(s, x + Math.cos(a) * d, y + Math.sin(a) * d, size, Object.assign({}, o, { a: (o.a ?? 1) * 0.16 * e, shadow: false, scale: lerp(1.08, 1, e) })); } txt(s, x, y, size, Object.assign({}, o, { a: (o.a ?? 1) * e * e, scale: lerp(1.08, 1, e) })); }
    function chip(s, x, y, size, k, o = {}) { if (k <= 0) return; const e = outBack(k), w = tw(s, size, { w: 900 }) + size * 1.3, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(e, e); ga(clamp(k * 3) * (o.a ?? 1)); ctx.fillStyle = o.fill || 'rgba(14,10,7,0.86)'; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = o.col || GOLD; ctx.stroke(); ctx.restore(); ga(1); txt(s, x, y + 2, size * e, { w: 900, color: o.col || GOLD, a: clamp(k * 3) * (o.a ?? 1), shadow: false }); }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

    // ---------------- texturas pré-calculadas ----------------
    const rng = seed => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
    const GRAIN = [1, 2, 3].map(sd => { const cv = mk(W / 2, H / 2), g = cv.getContext('2d'); const R = rng(sd * 7919); for (let i = 0; i < 26000; i++) { const v = R() < 0.5 ? 0 : 255; g.fillStyle = `rgba(${v},${v},${v},${0.05 + R() * 0.06})`; g.fillRect(R() * W / 2, R() * H / 2, 1, 1); } return cv; });
    const VIG = (() => { const cv = mk(W, H), g = cv.getContext('2d'); const gr = g.createRadialGradient(W / 2, H * 0.46, H * 0.22, W / 2, H * 0.5, H * 0.72); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.78)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();
    const DUST = (() => { const R = rng(77); return Array.from({ length: 90 }, () => [R() * W, R() * H, 0.6 + R() * 2.2, R() * TAU, 0.2 + R() * 0.8]); })();

    // ---------------- luz ----------------
    function glow(x, y, r, col, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= clamp(a); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
    // feixe volumétrico: de (x0,y0) com largura w0 até (x1,y1) com largura w1
    function beam(x0, y0, w0, x1, y1, w1, col, a, t = 0) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= clamp(a * (0.85 + 0.15 * Math.sin(t * 1.3 + x0))); ctx.fillStyle = g; const dx = y1 - y0, dy = -(x1 - x0), L = Math.hypot(dx, dy) || 1, nx = dx / L, ny = dy / L;
      ctx.beginPath(); ctx.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2); ctx.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); ctx.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2); ctx.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2); ctx.closePath(); ctx.fill(); ctx.restore(); }
    function dust(t, a = 1, col = '255,220,160', box = [0, 0, W, H]) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [x, y, r, ph, sp] of DUST) { const xx = box[0] + ((x + Math.sin(t * 0.3 * sp + ph) * 30 + t * 6 * sp) % box[2] + box[2]) % box[2], yy = box[1] + ((y - t * 14 * sp) % box[3] + box[3]) % box[3]; ctx.globalAlpha = a * (0.25 + 0.35 * Math.sin(t * 1.5 + ph) ** 2); ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(xx, yy, r, 0, TAU); ctx.fill(); } ctx.restore(); ctx.globalAlpha = 1; }

    // ---------------- personagem ----------------
    function shade(hex, f) { const p = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16)); return 'rgb(' + p.map(v => Math.round(v * f)).join(',') + ')'; }
    function limb(ax, ay, bx, by, w, col) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
    const vec = (a, L) => [Math.sin(a) * L, Math.cos(a) * L];
    // o: f (1 dir, -1 esq, 0 frente), pose ('stand'|'sit'|'kneel'|'floor'), walk (fase), lean, tilt, armF/armB [ombro, cotovelo], mood, look, bible, phone, dress, robe, child, t
    function person(x, y, s, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      const f = o.f ?? 1; if (f < 0) ctx.scale(-1, 1);
      const front = f === 0, t = o.t || 0;
      const jacket = o.jacket || '#3a2a1e', shirt = o.shirt || BEIGE, pants = o.pants || '#1c1612', shoe = '#120d0a', skin = o.skin || SKIN, hair = o.hair || HAIR;
      const L1 = 92, L2 = 88, pose = o.pose || 'stand';
      let legs;
      if (pose === 'sit') legs = [[1.5, 0.08], [1.45, 0.02]];
      else if (pose === 'kneel') legs = [[0.12, -1.45], [0.05, -1.5]];
      else if (pose === 'floor') legs = [[2.25, 0.35], [2.0, 0.55]];
      else { const w = o.walk; if (w === undefined) legs = [[0.04, 0], [-0.04, 0]]; else { const a = 0.36 * Math.sin(w); legs = [[a, a - 0.45 * Math.max(0, Math.sin(w + 1.4))], [-a, -a - 0.45 * Math.max(0, Math.sin(w + 1.4 + Math.PI))]]; } }
      let low = 0; const pts = legs.map(([a1, a2]) => { const k = vec(a1, L1), fo = vec(a2, L2); const knee = k, foot = [k[0] + fo[0], k[1] + fo[1]]; low = Math.max(low, knee[1] + 8, foot[1]); return [knee, foot]; });
      const hipY = front ? -(L1 + L2) : -low, hx = 0, breath = Math.sin(t * 2.1) * 2;
      const lean = o.lean || 0, sh = [hx + Math.sin(lean) * 128, hipY - Math.cos(lean) * 128 + breath];
      // sombra no chão
      ctx.save(); ctx.globalAlpha *= 0.45; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(10, 2, 80, 12, 0, 0, TAU); ctx.fill(); ctx.restore();
      // braço de trás
      const arm = (A, col, side) => { const [u, v] = A; const sx = sh[0] + (front ? side * 40 : 0), sy = sh[1] + 10; const e = vec(u * (front ? side : 1), 74), h2 = vec(v * (front ? side : 1), 70); const el = [sx + e[0], sy + e[1]], hd = [el[0] + h2[0], el[1] + h2[1]]; limb(sx, sy, el[0], el[1], 25, col); limb(el[0], el[1], hd[0], hd[1], 22, col); ctx.fillStyle = shade(skin, side === -1 && !front ? 0.8 : 1); ctx.beginPath(); ctx.arc(hd[0], hd[1], 12, 0, TAU); ctx.fill(); return hd; };
      const AB = o.armB || [-0.15, 0.1], AF = o.armF || [0.15, 0.3];
      if (!front) arm(AB, shade(o.dress || o.robe || jacket, 0.72), -1);
      // pernas
      if (!o.robe) {
        if (front) { for (const sd of [-1, 1]) { limb(sd * 18, hipY + 10, sd * 20, -12, 30, pants); ctx.fillStyle = shoe; ctx.beginPath(); ctx.ellipse(sd * 22, -6, 20, 10, 0, 0, TAU); ctx.fill(); } }
        else pts.forEach(([knee, foot], i) => { const col = i ? pants : shade(pants, 0.75); limb(hx, hipY, hx + knee[0], hipY + knee[1], 30, col); limb(hx + knee[0], hipY + knee[1], hx + foot[0], hipY + foot[1], 27, col); ctx.fillStyle = shoe; ctx.beginPath(); ctx.ellipse(hx + foot[0] + 12, hipY + foot[1] - 4, 22, 10, 0, 0, TAU); ctx.fill(); });
      }
      // tronco
      const wS = front ? 60 : 36, wH = front ? 48 : 31;
      ctx.fillStyle = o.robe || o.dress || jacket;
      if (o.robe) { ctx.beginPath(); ctx.moveTo(sh[0] - wS, sh[1]); ctx.lineTo(sh[0] + wS, sh[1]); ctx.lineTo(70, -4); ctx.lineTo(-70, -4); ctx.closePath(); ctx.fill(); ctx.fillStyle = o.stripe || '#2b3a58'; ctx.fillRect(-70, -70, 140, 16); ctx.fillRect(-64, -110, 128, 8); }
      else { ctx.beginPath(); ctx.moveTo(sh[0] - wS, sh[1] + 6); ctx.quadraticCurveTo(sh[0], sh[1] - 12, sh[0] + wS, sh[1] + 6); ctx.lineTo(hx + wH, hipY + 14); ctx.lineTo(hx - wH, hipY + 14); ctx.closePath(); ctx.fill();
        if (o.dress) { ctx.beginPath(); ctx.moveTo(hx - wH, hipY + 4); ctx.lineTo(hx + wH, hipY + 4); ctx.lineTo(hx + wH + 34, hipY + 110); ctx.lineTo(hx - wH - 30, hipY + 110); ctx.closePath(); ctx.fill(); }
        else if (!o.child) { ctx.fillStyle = shirt; ctx.beginPath(); ctx.moveTo(sh[0] - (front ? 16 : 4), sh[1] + 2); ctx.lineTo(sh[0] + (front ? 16 : 18), sh[1] + 2); ctx.lineTo(sh[0] + (front ? 0 : 10), sh[1] + 62); ctx.closePath(); ctx.fill(); } }
      // cabeça
      const hs = o.child ? 1.22 : 1, tilt = (o.tilt || 0) + lean * 0.6;
      ctx.save(); ctx.translate(sh[0], sh[1] - 8); ctx.rotate(tilt); ctx.scale(hs, hs);
      ctx.fillStyle = shade(skin, 0.85); ctx.fillRect(-9, -22, 18, 24);
      const hy = -52; ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(front ? 0 : 3, hy, 30, 35, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = o.robe ? (o.hood || BEIGE) : hair;
      if (o.robe) { ctx.beginPath(); ctx.ellipse(-4, hy - 6, 38, 42, 0, Math.PI * 0.95, Math.PI * 2.08); ctx.lineTo(-30, hy + 60); ctx.closePath(); ctx.fill(); }
      else if (o.dress) { ctx.beginPath(); ctx.ellipse(-2, hy - 6, 33, 33, 0, Math.PI * 0.9, Math.PI * 2.05); ctx.fill(); ctx.beginPath(); ctx.ellipse(front ? 0 : -18, hy + 22, front ? 34 : 22, 40, 0, 0, TAU); ctx.fill(); ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(front ? 0 : 6, hy + 4, 25, 29, 0, 0, TAU); ctx.fill(); }
      else { ctx.beginPath(); ctx.ellipse(front ? 0 : -3, hy - 12, 31, 25, 0, Math.PI, TAU); ctx.fill(); if (!front) { ctx.beginPath(); ctx.ellipse(-20, hy - 2, 13, 22, 0, 0, TAU); ctx.fill(); } }
      if (!front) { ctx.fillStyle = skin; ctx.beginPath(); ctx.moveTo(30, hy - 2); ctx.lineTo(39, hy + 8); ctx.lineTo(30, hy + 12); ctx.closePath(); ctx.fill(); }
      face(front, hy, o.mood || 'neutral', o.look || 0, t, o.blink);
      ctx.restore();
      // braço da frente + objetos
      const hd = arm(AF, shade(o.dress || o.robe || jacket, front ? 0.9 : 1.08), 1);
      if (front) arm(o.armB || AF, shade(o.dress || jacket, 0.9), -1);
      if (o.bible) { ctx.save(); ctx.translate(hd[0] + 4, hd[1] - 6); ctx.rotate(-0.25); ctx.fillStyle = '#3d1f12'; ctx.fillRect(-24, -34, 48, 64); ctx.fillStyle = GOLD; ctx.fillRect(-24, -34, 6, 64); ctx.fillRect(4, -14, 3, 18); ctx.fillRect(-2, -8, 15, 3); ctx.restore(); }
      if (o.phone) { ctx.save(); ctx.translate(hd[0] + 8, hd[1] - 14); ctx.rotate(-0.4); ctx.fillStyle = '#111'; ctx.fillRect(-12, -22, 24, 42); ctx.fillStyle = o.phone === 'off' ? '#000' : '#9fd0ff'; ctx.fillRect(-9, -18, 18, 34); ctx.restore(); if (o.phone !== 'off') glow(hd[0] + 8, hd[1] - 30, 190, 'rgba(110,170,255,0.55)', 1); }
      ctx.restore();
    }
    function face(front, hy, mood, look, t, blink) {
      const ex = front ? [-11, 11] : [16], ey = hy - 4; const bl = blink ?? (((t * 0.45) % 1) > 0.965 ? 0.15 : 1);
      ctx.fillStyle = '#1a120c'; for (const x of ex) { ctx.beginPath(); ctx.ellipse(x + look * 3, ey, 4.2, 5.2 * bl, 0, 0, TAU); ctx.fill(); }
      const br = { neutral: 0, smile: -0.1, calm: 0.05, frown: 0.32, shout: 0.42, sad: -0.32, shame: -0.25, proud: -0.12 }[mood] ?? 0;
      ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (const x of ex) { const sgn = front ? (x < 0 ? 1 : -1) : -1; ctx.beginPath(); ctx.moveTo(x - 9, ey - 13 - br * 8 * sgn); ctx.lineTo(x + 9, ey - 13 + br * 8 * sgn); ctx.stroke(); }
      const mx = front ? 0 : 18, my = hy + 17; ctx.beginPath();
      if (mood === 'smile' || mood === 'proud') { ctx.arc(mx, my - 7, 11, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
      else if (mood === 'shout') { ctx.fillStyle = '#3a0f0c'; ctx.ellipse(mx, my + 2, 8, 10, 0, 0, TAU); ctx.fill(); }
      else if (mood === 'frown' || mood === 'sad' || mood === 'shame') { ctx.arc(mx, my + 8, 10, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
      else { ctx.moveTo(mx - 8, my); ctx.lineTo(mx + 8, my); ctx.stroke(); }
    }
    const crowd = (y, n, s, col, seed, t) => { const R = rng(seed); for (let i = 0; i < n; i++) { const x = (i + 0.5) * (W + 200) / n - 100 + R() * 40, hh = 0.9 + R() * 0.2; ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y - 60 * s * hh + Math.sin(t * 1.3 + i) * 2, 24 * s, 28 * s, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + 10 * s, 50 * s, 46 * s, 0, Math.PI, TAU); ctx.fill(); } };

    // ---------------- cenários ----------------
    function sky(c0, c1, c2) { const g = ctx.createLinearGradient(0, -200, 0, 1300); g.addColorStop(0, c0); g.addColorStop(0.65, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 1600); }
    function church(x, base, t, lit = 1) {
      ctx.fillStyle = '#140e0a'; ctx.fillRect(x - 280, base - 430, 560, 430); ctx.beginPath(); ctx.moveTo(x - 310, base - 420); ctx.lineTo(x, base - 640); ctx.lineTo(x + 310, base - 420); ctx.closePath(); ctx.fill();
      ctx.fillRect(x - 45, base - 860, 90, 240); ctx.beginPath(); ctx.moveTo(x - 60, base - 860); ctx.lineTo(x, base - 960); ctx.lineTo(x + 60, base - 860); ctx.closePath(); ctx.fill();
      ctx.fillStyle = GOLD; ctx.fillRect(x - 5, base - 1050, 10, 95); ctx.fillRect(x - 30, base - 1022, 60, 10);
      for (const wx of [-190, 190]) { ctx.fillStyle = `rgba(255,190,90,${0.75 * lit})`; ctx.beginPath(); ctx.moveTo(wx + x - 34, base - 170); ctx.lineTo(wx + x - 34, base - 300); ctx.arc(wx + x, base - 300, 34, Math.PI, TAU); ctx.lineTo(wx + x + 34, base - 170); ctx.closePath(); ctx.fill(); glow(wx + x, base - 250, 160, 'rgba(255,170,70,0.35)', lit); }
      ctx.fillStyle = `rgba(255,200,110,${0.95 * lit})`; ctx.beginPath(); ctx.moveTo(x - 70, base); ctx.lineTo(x - 70, base - 200); ctx.arc(x, base - 200, 70, Math.PI, TAU); ctx.lineTo(x + 70, base); ctx.closePath(); ctx.fill();
      glow(x, base - 120, 380, 'rgba(255,180,80,0.5)', lit);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28 * lit; ctx.fillStyle = 'rgb(255,190,100)'; ctx.beginPath(); ctx.moveTo(x - 70, base); ctx.lineTo(x + 70, base); ctx.lineTo(x + 240, base + 260); ctx.lineTo(x - 240, base + 260); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    function ground(y, col = '#0d0a08') { ctx.fillStyle = col; ctx.fillRect(-300, y, W + 600, 1000); }
    function tomb(x, y, s, inside, t, shine = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      // rocha ao redor
      ctx.fillStyle = '#2a211a'; ctx.beginPath(); ctx.moveTo(-330, 0); ctx.quadraticCurveTo(-360, -420, -60, -470); ctx.quadraticCurveTo(300, -480, 340, -160); ctx.lineTo(350, 0); ctx.closePath(); ctx.fill();
      // fachada caiada
      ctx.fillStyle = '#f2ece0'; ctx.fillRect(-230, -360, 460, 360); ctx.beginPath(); ctx.moveTo(-250, -360); ctx.lineTo(0, -450); ctx.lineTo(250, -360); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d9d0bf'; for (let i = 0; i < 5; i++) ctx.fillRect(-230, -330 + i * 70, 460, 3);
      // interior (corte) com ossos
      if (inside > 0) { ctx.save(); ctx.beginPath(); ctx.rect(-230, -360 + 360 * (1 - inside), 460, 360 * inside); ctx.clip(); ctx.fillStyle = '#100b08'; ctx.fillRect(-230, -360, 460, 360); ctx.strokeStyle = '#3b2c20'; ctx.lineWidth = 3; ctx.strokeRect(-215, -345, 430, 330);
        ctx.fillStyle = '#b9ae98'; const bone = (bx, by, a, L) => { ctx.save(); ctx.translate(bx, by); ctx.rotate(a); ctx.fillRect(-L / 2, -5, L, 10); for (const e of [-1, 1]) for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(e * L / 2, d * 6, 8, 0, TAU); ctx.fill(); } ctx.restore(); };
        bone(-120, -40, 0.2, 120); bone(20, -30, -0.3, 140); bone(130, -50, 0.5, 100); bone(-40, -80, 1.2, 90); bone(90, -100, -0.9, 110); bone(-150, -110, -0.6, 80);
        ctx.fillStyle = 'rgba(90,70,50,0.35)'; for (let i = 0; i < 40; i++) ctx.fillRect(-210 + (i * 53) % 420, -330 + (i * 37) % 300, 3, 3);
        ctx.restore(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-230, -360 + 360 * (1 - inside) - 3, 460, 6); }
      // porta e pedra
      if (inside < 0.99) { ctx.fillStyle = '#e4dccb'; ctx.beginPath(); ctx.arc(150, -110, 105, 0, TAU); ctx.fill(); ctx.strokeStyle = '#c9bea9'; ctx.lineWidth = 6; ctx.stroke(); }
      ctx.restore();
      glow(x, y - 230 * s, 520 * s, 'rgba(255,250,235,0.45)', shine);
    }
    function room(warm, t) { // sala de casa: warm 0 = fria (azul), 1 = quente
      const top = warm > 0.5 ? '#2a1a10' : '#0b1018', g = ctx.createLinearGradient(0, 300, 0, 1400); g.addColorStop(0, lerpCol('#0a0f16', '#2b1b10', warm)); g.addColorStop(1, lerpCol('#05080c', '#140c07', warm)); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 1800);
      ctx.fillStyle = lerpCol('#070a0e', '#1a110a', warm); ctx.fillRect(-300, 1290, W + 600, 700);
      // janela
      ctx.fillStyle = lerpCol('#122033', '#5a3a1c', warm); ctx.fillRect(700, 520, 230, 300); ctx.strokeStyle = lerpCol('#05080c', '#140c07', warm); ctx.lineWidth = 12; ctx.strokeRect(700, 520, 230, 300); ctx.beginPath(); ctx.moveTo(815, 520); ctx.lineTo(815, 820); ctx.moveTo(700, 670); ctx.lineTo(930, 670); ctx.stroke();
      if (warm < 0.5) { ctx.fillStyle = '#d8e4f0'; ctx.beginPath(); ctx.arc(870, 580, 22, 0, TAU); ctx.fill(); glow(870, 580, 120, 'rgba(160,190,230,0.3)', 1 - warm * 2); }
      else glow(815, 670, 420, 'rgba(255,180,90,0.45)', warm);
      // quadro e luminária
      ctx.fillStyle = lerpCol('#0d131b', '#3a2616', warm); ctx.fillRect(130, 560, 180, 130); ctx.strokeStyle = lerpCol('#1d2733', GOLD, warm); ctx.lineWidth = 6; ctx.strokeRect(130, 560, 180, 130);
    }
    function sofa(x, y, warm) { ctx.fillStyle = lerpCol('#141b26', '#4a2c1a', warm); rr(x - 230, y - 150, 460, 110, 30); ctx.fill(); rr(x - 260, y - 70, 520, 80, 24); ctx.fill(); ctx.fillStyle = lerpCol('#0c1118', '#2e1b10', warm); ctx.fillRect(x - 240, y + 4, 20, 30); ctx.fillRect(x + 220, y + 4, 20, 30); }
    function lerpCol(a, b, t) { const pa = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16)); return 'rgb(' + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(t)))).join(',') + ')'; }
    function bibleOpen(x, y, s, open, t, light = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = '#2c160c'; ctx.beginPath(); ctx.moveTo(-250, 10); ctx.lineTo(250, 10); ctx.lineTo(220, -60); ctx.lineTo(-220, -60); ctx.closePath(); ctx.fill();
      const pg = (sgn, k) => { ctx.fillStyle = '#efe4c8'; ctx.beginPath(); ctx.moveTo(0, -50); ctx.quadraticCurveTo(sgn * 110 * k, -95, sgn * 230 * k, -70); ctx.lineTo(sgn * 205 * k, 0); ctx.quadraticCurveTo(sgn * 100 * k, -20, 0, -4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(80,55,30,0.35)'; ctx.lineWidth = 2; for (let i = 1; i < 7; i++) { const yy = -62 + i * 8.5; ctx.beginPath(); ctx.moveTo(sgn * 30 * k, yy + 2); ctx.lineTo(sgn * 190 * k, yy - 4 + i * 0.5); ctx.stroke(); } };
      pg(-1, 1); pg(1, lerp(-1, 1, outC(open)));
      ctx.restore(); glow(x, y - 70 * s, 420 * s, 'rgba(255,200,110,0.55)', light * open); }

    // ---------------- tempos (palavras) ----------------
    const s1 = { dom: wt('c1', 'domingo'), pri: wt('c1', 'primeiro'), igr: wt('c1', 'igreja'), bib: wt('c1', 'biblia'), sor: wt('c1', 'sorriso'), cr0: wt('c1', 'cristao'), apr: wt('c1', 'aprendeu'), par: wt('c1', 'parecer'), cr1: wt('c1', 'cristao', 1) };
    const s2 = { mao: wt('c2', 'maos'), lou: wt('c2', 'louvores'), cum: wt('c2', 'cumprimenta'), nom: wt('c2', 'nome'), com: wt('c2', 'comenta'), hom: wt('c2', 'homem'), deu: wt('c2', 'deus') };
    const s3 = { por: wt('c3', 'porta'), fec: wt('c3', 'fechar'), gri: wt('c3', 'grita'), esp: wt('c3', 'esposa'), ign: wt('c3', 'ignora'), fil: wt('c3', 'filho'), tel: wt('c3', 'tela'), nin: wt('c3', 'ninguem') };
    const s4 = { jes: wt('c4', 'jesus'), mat: wt('c4', 'mateus'), ai: wt('c4', 'ai'), hip: wt('c4', 'hipocritas'), sem: wt('c4', 'semelhantes'), sep: wt('c4', 'sepulcros'), fora: wt('c4', 'fora'), for: wt('c4', 'formosos'), int: wt('c4', 'interiormente'), oss: wt('c4', 'ossos'), mor: wt('c4', 'mortos') };
    const s5 = { far: wt('c5', 'fariseus'), lei: wt('c5', 'lei'), pub: wt('c5', 'publico'), jej: wt('c5', 'jejuavam'), diz: wt('c5', 'dizimo'), cmp: wt('c5', 'comparou'), tum: wt('c5', 'tumulos'), bra: wt('c5', 'branco') };
    const s6 = { dec: wt('c6', 'decorar'), mud: wt('c6', 'mudar'), can: wt('c6', 'cantar'), dom: wt('c6', 'domingo'), seg: wt('c6', 'segunda'), mas: wt('c6', 'mascara'), pes: wt('c6', 'pessoas'), en1: wt('c6', 'engana', 1), deu: wt('c6', 'deus', 1) };
    const s7 = { noi: wt('c7', 'noite'), soz: wt('c7', 'sozinho'), abr: wt('c7', 'abre'), ver: wt('c7', 'versiculo'), pri: wt('c7', 'primeira'), pe1: wt('c7', 'pensa', 1), mes: wt('c7', 'mesmo') };
    const s8 = { per: wt('c8', 'perdao'), sen: wt('c8', 'senta'), fil: wt('c8', 'filho'), des: wt('c8', 'desliga'), tel: wt('c8', 'tela'), nin: wt('c8', 'ninguem'), apl: wt('c8', 'aplaude'), par: wt('c8', 'parecendo'), mud: wt('c8', 'mudando') };
    const s9 = { voc: wt('c9', 'voce'), apa: wt('c9', 'aparencia'), cri: wt('c9', 'cristo'), tra: wt('c9', 'transforme'), com: wt('c9', 'comenta'), seg: wt('c9', 'segue'), ben: wt('c9', 'bencaos') };

    cue(0, 'music', { part: 'intro' }); cue(0.2, 'wind', { dur: 4 }); cue(s1.cr0, 'riser', { dur: 0.7 }); cue(s1.cr0 + 0.05, 'reveal'); cue(s1.par, 'impact', { gain: 0.55 }); cue(B[1], 'music', { part: 'safe' });
    cue(s2.mao, 'swoosh'); cue(s2.nom, 'pop'); cue(s2.hom, 'sparkle');
    cue(s3.fec, 'door'); cue(s3.fec + 0.15, 'impact', { gain: 0.5 }); cue(s3.gri, 'angry'); cue(s3.ign, 'minus'); cue(s3.tel, 'notif', { gain: 0.6 }); cue(s3.nin, 'glitch', { dur: 0.3 });
    cue(s4.mat, 'bell'); cue(s4.hip, 'impact', { gain: 0.7 }); cue(s4.sep - 0.2, 'whoosh', { dur: 0.6 }); cue(s4.for, 'sparkle'); cue(s4.int, 'riser', { dur: 0.6 }); cue(s4.oss, 'impact', { gain: 0.6 });
    cue(s5.lei, 'pop'); cue(s5.pub, 'pop'); cue(s5.jej, 'pop'); cue(s5.diz, 'coin'); cue(s5.tum, 'reveal');
    cue(s6.dec, 'type', { n: 6, rate: 14 }); cue(s6.mud, 'error'); cue(s6.can, 'swoosh'); cue(s6.seg, 'glitch', { dur: 0.3 }); cue(s6.mas, 'riser', { dur: 1.2 }); cue(s6.en1, 'crack'); cue(s6.deu - 0.05, 'impact', { gain: 0.8 }); cue(B[6], 'music', { part: 'outro' });
    cue(s7.abr, 'card'); cue(s7.mes, 'ding', { gain: 0.4 });
    cue(s8.per, 'heart'); cue(s8.sen, 'pop'); cue(s8.des, 'tap'); cue(s8.par, 'minus'); cue(s8.mud, 'success');
    cue(s9.voc, 'bell'); cue(s9.com, 'notif'); cue(s9.seg + 0.2, 'tap'); cue(s9.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.35, gain: 0.35 });

    // ---------------- câmera ----------------
    function cam(z, fx = 540, fy = 960, px = 0, py = 0) { ctx.translate(fx + px, fy + py); ctx.scale(z, z); ctx.translate(-fx, -fy); }
    const MAN = { jacket: '#3b2a1d', shirt: '#e8dcc2', pants: '#1b1511' };
    const WIFE = { dress: '#5c2a2a', hair: '#24170f', skin: '#b98a63' };
    const SON = { jacket: '#36506b', pants: '#2a241e', child: true, skin: '#c99a70' };

    // ---------------- cenas ----------------
    function scene1(t) { const T0 = 0, T1 = B[1];
      ctx.save(); cam(lerp(1.0, 1.1, sm(t, T0, T1, x => x)), 640, 1000);
      sky('#0d0806', '#3b2213', '#8a5424'); glow(640, 1150, 900, 'rgba(255,150,60,0.35)', 1);
      ctx.save(); ctx.translate(640, 1430); ctx.scale(0.66, 0.66); church(0, 0, t); ctx.restore(); ground(1430);
      beam(640, 1300, 90, 640, 1850, 520, 'rgba(255,190,100,0.22)', 1, t);
      const wk = sm(t, 0.2, s1.igr + 0.7, x => x), mx = lerp(60, 420, wk), walking = wk < 1;
      person(mx, 1460, 1.5, Object.assign({}, MAN, { f: 1, walk: walking ? t * 7.5 : undefined, armF: [walking ? 0.25 * Math.sin(t * 7.5) : 0.25, 0.9], armB: [walking ? -0.25 * Math.sin(t * 7.5) : -0.1, 0.1], bible: true, mood: t > s1.sor - 0.2 ? 'smile' : 'neutral', t }));
      glow(mx + 20, 1000, 360, 'rgba(255,170,80,0.18)', 1);
      dust(t, 0.6); ctx.restore();
      chip('EP. 01', 540, 150, 30, prog(t, 0.2, 0.6));
      const hide = prog(t, s1.cr0 - 0.6, s1.cr0 - 0.2);
      tMask('DOMINGO, 8H', 540, 300, 56, prog(t, s1.dom - 0.2, s1.dom + 0.3) * (1 - hide), { w: 900, color: BEIGE });
      tTrack('CRISTÃO', 540, 290, 190, prog(t, s1.cr0 - 0.15, s1.cr0 + 0.7), { serif: true, color: GOLD2, sp: 10 });
      tMask('OU SÓ APRENDEU', 540, 450, 74, prog(t, s1.apr - 0.15, s1.apr + 0.35), { w: 900, color: BEIGE });
      tMask('A PARECER?', 540, 550, 110, prog(t, s1.par - 0.1, s1.par + 0.35), { w: 900, color: RED });
    }
    function scene2(t) { const T0 = B[1], T1 = B[2], k = sm(t, T0, T1, x => x);
      ctx.save(); cam(1.06, 540, 960, lerp(40, -40, k), 0);
      const g = ctx.createLinearGradient(0, 0, 0, 1400); g.addColorStop(0, '#1d140d'); g.addColorStop(1, '#0c0806'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 2400);
      for (const wx of [170, 540, 910]) { ctx.fillStyle = 'rgba(255,205,130,0.85)'; ctx.beginPath(); ctx.moveTo(wx - 50, 560); ctx.lineTo(wx - 50, 330); ctx.arc(wx, 330, 50, Math.PI, TAU); ctx.lineTo(wx + 50, 560); ctx.closePath(); ctx.fill(); beam(wx, 450, 90, wx + 240, 1350, 420, 'rgba(255,200,120,0.2)', 1, t); }
      dust(t, 0.7);
      ctx.save(); ctx.translate(lerp(-30, 30, k), 0); crowd(1020, 9, 0.85, '#120c08', 3, t); ctx.restore();
      ctx.save(); ctx.translate(lerp(-60, 60, k), 0); crowd(1120, 7, 1.05, '#0e0906', 4, t); ctx.restore();
      ground(1290, '#0a0705');
      const up = sm(t, s2.mao - 0.3, s2.mao + 0.3) * (1 - sm(t, s2.cum - 0.5, s2.cum - 0.1));
      const sh = sm(t, s2.cum - 0.3, s2.cum + 0.2);
      if (sh < 0.5) person(540, 1450, 1.6, Object.assign({}, MAN, { f: 0, armF: [lerp(0.12, 2.65, up), lerp(0.15, 2.9, up)], mood: 'smile', t, look: 0 }));
      else { person(400, 1450, 1.55, Object.assign({}, MAN, { f: 1, armF: [1.2, 1.45 + 0.08 * Math.sin(t * 9)], armB: [-0.1, 0.1], mood: 'smile', t })); person(730, 1450, 1.45, { f: -1, jacket: '#2a2420', pants: '#15110e', skin: '#a77b55', armF: [1.25, 1.5 + 0.08 * Math.sin(t * 9)], mood: 'smile', t: t + 1 }); }
      glow(540, 900, 380, 'rgba(255,190,110,0.2)', 1);
      ctx.restore();
      tBlur('"Que homem de Deus."', 540, 360, 92, prog(t, s2.hom - 0.35, s2.hom + 0.4), { serif: true, it: true, color: GOLD2 });
      txt('— todo mundo', 540, 460, 40, { w: 700, color: MUTE, a: prog(t, s2.deu, s2.deu + 0.4) });
    }
    function scene3(t) { const T0 = B[2], T1 = B[3];
      const dk = sm(t, s3.por - 0.2, s3.fec + 0.3);
      if (t < s3.fec + 0.55) { // porta fechando
        ctx.save(); cam(lerp(1.0, 1.12, prog(t, T0, s3.fec + 0.55)));
        ctx.fillStyle = '#0c0907'; ctx.fillRect(0, 0, W, H);
        const gap = lerp(300, 0, dk);
        ctx.fillStyle = '#ffcc80'; ctx.fillRect(540 - gap / 2, 420, gap, 1000); glow(540, 900, 300 + gap, 'rgba(255,180,80,0.6)', gap / 300);
        beam(540, 900, gap, 540, 1700, gap * 3, 'rgba(255,190,110,0.35)', gap / 300, t);
        ctx.fillStyle = '#3a2416'; ctx.fillRect(540 - gap / 2 - 360, 400, 360, 1040); ctx.fillRect(540 + gap / 2, 400, 360, 1040);
        ctx.strokeStyle = '#24160d'; ctx.lineWidth = 8; for (const x0 of [540 - gap / 2 - 330, 540 + gap / 2 + 30]) { ctx.strokeRect(x0, 450, 300, 420); ctx.strokeRect(x0, 920, 300, 470); }
        ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(540 + gap / 2 + 40, 900, 14, 0, TAU); ctx.fill();
        ctx.restore();
        tMask('EM CASA', 540, 250, 70, prog(t, s3.fec, s3.fec + 0.3), { w: 900, color: '#cfe0f0' });
        return;
      }
      const k = prog(t, s3.fec + 0.55, T1);
      ctx.save(); cam(lerp(1.08, 1.0, sm(t, s3.fec + 0.55, T1)), 540, 1100);
      room(0, t);
      const phoneStage = t > s3.tel - 0.35, ignore = t > s3.ign - 0.25 && !phoneStage, shout = t > s3.gri - 0.2 && !ignore && !phoneStage;
      if (!phoneStage) {
        const flinch = shout ? sm(t, s3.gri - 0.1, s3.gri + 0.3) : 0;
        person(160, 1420, 1.3, Object.assign({}, WIFE, { f: 1, lean: -0.12 * flinch, armF: [0.3 + 0.9 * flinch, 1.6 * flinch + 0.2], mood: shout ? 'sad' : 'neutral', t }));
        person(920, 1420, 0.88, Object.assign({}, SON, { f: -1, armF: [ignore ? 1.1 : 0.6, ignore ? 1.3 : 0.9], mood: ignore ? 'sad' : 'neutral', t }));
        if (ignore) { ctx.save(); ctx.translate(830, 1170); ctx.rotate(0.15); ctx.fillStyle = '#f2ead8'; ctx.fillRect(-45, -35, 90, 70); ctx.strokeStyle = '#c23b30'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-15, 0, 10, 0, TAU); ctx.moveTo(-15, 10); ctx.lineTo(-15, 25); ctx.moveTo(15, -5); ctx.lineTo(25, 25); ctx.stroke(); ctx.restore(); }
        const shk = shout ? Math.sin(t * 60) * 3 * (1 - prog(t, s3.gri, s3.gri + 0.8)) : 0;
        person(500 + shk, 1420, 1.45, Object.assign({}, MAN, { f: ignore ? 1 : -1, lean: shout ? 0.12 : 0, armF: shout ? [1.45, 1.55] : ignore ? [0.2, 1.1] : [0.15, 0.3], phone: ignore ? 'on' : undefined, mood: shout ? 'shout' : ignore ? 'neutral' : 'frown', t, tilt: ignore ? 0.25 : 0 }));
        if (shout) { const ak = prog(t, s3.gri - 0.1, s3.gri + 0.2); ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 7; ctx.lineCap = 'round'; ga(ak * (1 - prog(t, s3.ign - 0.6, s3.ign - 0.25))); for (let i = 0; i < 4; i++) { const yy = 940 + i * 32; ctx.beginPath(); ctx.moveTo(420, yy - 120); for (let j = 1; j <= 5; j++) ctx.lineTo(420 - j * 30 * ak, yy + (j % 2 ? -14 : 14)); ctx.stroke(); } ctx.restore(); ga(1); }
      } else {
        person(150, 1420, 1.25, Object.assign({}, WIFE, { f: 1, mood: 'sad', t, armF: [0.1, 0.2] }));
        person(930, 1420, 0.85, Object.assign({}, SON, { f: -1, mood: 'sad', t, armF: [0.4, 0.7] }));
        ctx.save(); ga(0.6); ctx.fillStyle = '#000'; ctx.fillRect(-300, 0, W + 600, H); ctx.restore(); ga(1);
        sofa(540, 1420, 0); ctx.save(); ctx.translate(540,1420); ctx.scale(1.3,1.3); ctx.translate(-540,-1420); person(560, 1420, 1.1, Object.assign({}, MAN, { f: 1, pose: 'sit', lean: 0.12, tilt: 0.35, armF: [1.0, 2.2], armB: [0.8, 1.9], phone: 'on', mood: 'neutral', t })); ctx.restore();
      }
      dust(t, 0.25, '170,200,240'); ctx.restore();
      tMask('ONDE NINGUÉM VÊ', 540, 340, 84, prog(t, s3.nin - 0.2, s3.nin + 0.3), { w: 900, color: '#cfe0f0' });
    }
    const VERSE = (t, items) => { for (const [s, y, size, k, o] of items) tMask(s, 540, y, size, k, Object.assign({ serif: true, color: BEIGE }, o)); };
    function scene4(t) { const T0 = B[3], T1 = B[4];
      const phaseB = t > s4.sep - 0.35;
      ctx.save(); cam(phaseB ? lerp(1.0, 1.08, prog(t, s4.sep - 0.35, T1)) : lerp(1.1, 1.0, prog(t, T0, s4.sep - 0.35)), 540, 1100);
      ctx.fillStyle = BLACK; ctx.fillRect(-300, -300, W + 600, 2600);
      if (!phaseB) { for (let i = -3; i <= 3; i++) beam(540, 1150, 40, 540 + i * 220, 200, 260, 'rgba(255,200,110,0.16)', 1, t + i); bibleOpen(540, 1260, 1.6, prog(t, T0, T0 + 1.2), t); dust(t, 0.7); }
      else { const ins = sm(t, s4.int - 0.1, s4.oss + 0.2); tomb(540, 1360, 1.05, ins, t, (1 - ins) * (0.7 + 0.6 * Math.exp(-Math.max(0, t - s4.for) * 2) * (t > s4.for ? 1 : 0)) + 0.2); if (t > s4.for - 0.1 && ins < 0.5) for (let i = 0; i < 5; i++) { const a = i * 1.3 + t * 0.6, r = 260 + i * 30; glow(540 + Math.cos(a) * r * 0.9, 1000 + Math.sin(a) * r * 0.5, 50, 'rgba(255,255,255,0.8)', prog(t, s4.for - 0.1, s4.for + 0.3) * (1 - ins * 2)); } dust(t, 0.35, '230,230,230'); }
      ctx.restore();
      tTrack('MATEUS 23:27', 540, 200, 46, prog(t, s4.mat - 0.2, s4.mat + 0.5), { w: 900, color: GOLD, sp: 8 });
      if (!phaseB) VERSE(t, [['"Ai de vós, escribas', 380, 84, prog(t, s4.ai - 0.15, s4.ai + 0.3)], ['e fariseus,', 480, 84, prog(t, s4.ai + 0.4, s4.ai + 0.8)]]);
      if (!phaseB) { const hk = prog(t, s4.hip - 0.1, s4.hip + 0.25); txt('HIPÓCRITAS!', 540, 640, 128, { w: 900, color: RED, a: hk, scale: lerp(1.6, 1, outC(hk)) }); }
      if (phaseB) VERSE(t, [['sepulcros caiados,', 330, 82, prog(t, s4.sep - 0.2, s4.sep + 0.25), { color: '#ffffff' }], ['por fora parecem formosos,', 430, 66, prog(t, s4.fora - 0.15, s4.fora + 0.3)], ['mas interiormente estão cheios', 530, 60, prog(t, s4.int - 0.15, s4.int + 0.3)], ['de ossos de mortos."', 630, 82, prog(t, s4.oss - 0.15, s4.oss + 0.3), { color: RED }]]);
      txt('Mateus 23:27 (ARC)', 540, 1500, 30, { w: 700, color: MUTE, a: prog(t, s4.mat, s4.mat + 0.5) });
    }
    function scene5(t) { const T0 = B[4], T1 = B[5], k = sm(t, T0, T1, x => x);
      const mk = sm(t, s5.tum - 0.35, s5.tum + 0.4);
      ctx.save(); cam(lerp(1.0, 1.1, k), 540, 1000, lerp(-30, 30, k), 0);
      const g = ctx.createLinearGradient(0, 0, 0, 1400); g.addColorStop(0, '#2a1a10'); g.addColorStop(1, '#130c08'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 2600);
      ctx.fillStyle = '#3a2819'; for (let r = 0; r < 14; r++) for (let c = 0; c < 9; c++) { const x = c * 150 - 150 + (r % 2) * 75, y = 260 + r * 78; if (y > 1290) continue; ctx.fillRect(x + 4, y + 4, 142, 70); }
      ctx.fillStyle = '#1a110b'; ctx.beginPath(); ctx.moveTo(380, 1290); ctx.lineTo(380, 760); ctx.arc(540, 760, 160, Math.PI, TAU); ctx.lineTo(700, 1290); ctx.closePath(); ctx.fill();
      ground(1290, '#100a07'); beam(820, 200, 80, 600, 1300, 380, 'rgba(255,200,120,0.22)', 1, t);
      ga(1 - mk); person(540, 1420, 1.55, { f: 0, robe: '#d8c7a2', hood: '#e8dcc0', stripe: '#2b3a58', skin: '#b5865d', armF: [2.3, 2.7], mood: 'proud', t }); ga(1);
      if (mk > 0) { ga(mk); tomb(540, 1400, 0.9, 0, t, mk); ga(1); }
      dust(t, 0.5); ctx.restore();
      const items = [['SABIAM A LEI DE COR', s5.lei], ['ORAVAM EM PÚBLICO', s5.pub], ['JEJUAVAM', s5.jej], ['DAVAM O DÍZIMO', s5.diz]];
      items.forEach(([s, tt], i) => chip(s, 540, 300 + i * 105, 42, prog(t, tt - 0.25, tt + 0.1) * (1 - mk)));
      tTrack('OS FARISEUS', 540, 200, 44, prog(t, s5.far - 0.2, s5.far + 0.4) * (1 - mk), { w: 900, color: MUTE, sp: 8 });
      tMask('TÚMULOS', 540, 330, 130, prog(t, s5.tum - 0.15, s5.tum + 0.3), { w: 900, color: '#ffffff' });
      tMask('pintados de branco.', 540, 450, 76, prog(t, s5.bra - 0.25, s5.bra + 0.2), { serif: true, it: true, color: BEIGE });
      txt('Mt 6:5 · Lc 18:12 · Mt 23:23', 540, 1500, 28, { w: 700, color: MUTE, a: prog(t, s5.pub, s5.pub + 0.5) * (1 - mk) });
    }
    function scene6(t) { const T0 = B[5], T1 = B[6];
      const split = t > s6.can - 0.3 && t < s6.mas - 0.3, maskSt = t >= s6.mas - 0.3;
      if (!split && !maskSt) { ctx.save(); cam(lerp(1.0, 1.06, prog(t, T0, s6.can - 0.3))); ctx.fillStyle = BLACK; ctx.fillRect(-300, -300, W + 600, 2600); person(540, 1330, 1.5, Object.assign({}, MAN, { f: 0, armF: [0.9, 2.3], mood: 'neutral', t })); bibleOpen(540, 1420, 1.5, 1, t, 0.6); if (0) person(540, 1180, 0.9, Object.assign({}, MAN, { f: 0, armF: [0.5, 1.6], mood: 'neutral', t })); dust(t, 0.4); ctx.restore();
        tMask('DECORAR', 540, 360, 120, prog(t, s6.dec - 0.15, s6.dec + 0.3), { serif: true, color: GOLD2 }); const mk = prog(t, s6.mud - 0.2, s6.mud + 0.2); txt('≠', 540, 490, 100, { w: 900, color: RED, a: mk }); tMask('MUDAR', 540, 620, 120, mk, { w: 900, color: BEIGE }); return; }
      if (split) { const sk = prog(t, s6.can - 0.3, s6.can + 0.1);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 540, H); ctx.clip(); cam(1.0, 270, 1000); const g = ctx.createLinearGradient(0, 0, 0, 1400); g.addColorStop(0, '#3a240f'); g.addColorStop(1, '#120a05'); ctx.fillStyle = g; ctx.fillRect(-300, -300, 1200, 2600); beam(270, 300, 80, 270, 1400, 500, 'rgba(255,200,110,0.3)', 1, t); person(270, 1420, 1.35, Object.assign({}, MAN, { f: 0, armF: [2.5, 2.8], mood: 'smile', t })); dust(t, 0.5, '255,220,160', [0, 0, 540, H]); ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.rect(540, 0, 540, H); ctx.clip(); ga(sm(t, s6.seg - 0.4, s6.seg)); ctx.fillStyle = '#060a10'; ctx.fillRect(540, 0, 540, H); person(810, 1420, 1.35, Object.assign({}, MAN, { f: -1, armF: [1.0, 2.2], tilt: 0.3, phone: 'on', mood: 'frown', t })); ctx.restore(); ga(1);
        ctx.fillStyle = GOLD; ctx.fillRect(538, 0, 4, H * sk);
        tTrack('DOMINGO', 270, 330, 64, prog(t, s6.dom - 0.2, s6.dom + 0.4), { w: 900, color: GOLD2, sp: 6 });
        tTrack('SEGUNDA', 810, 330, 64, prog(t, s6.seg - 0.2, s6.seg + 0.4), { w: 900, color: '#cfe0f0', sp: 6 });
        return; }
      // máscara: clímax
      const crack = prog(t, s6.en1 - 0.1, s6.en1 + 0.35), fall = sm(t, s6.deu - 0.15, s6.deu + 0.8), shake = (crack > 0 && fall < 0.6) ? Math.sin(t * 70) * 6 * (1 - fall) : 0;
      ctx.save(); cam(lerp(1.0, 1.18, sm(t, s6.mas - 0.3, s6.deu)), 540, 860, shake, 0);
      ctx.fillStyle = BLACK; ctx.fillRect(-300, -300, W + 600, 2600);
      crowd(1380, 8, 1.1, '#140e0a', 9, t); txt('', 0, 0, 10);
      // rosto grande
      ctx.save(); ctx.translate(540, 900); ctx.scale(4.2, 4.2); ctx.fillStyle = '#2b1d14'; ctx.fillRect(-12, 25, 24, 30); ctx.beginPath(); ctx.ellipse(0, 70, 60, 26, 0, Math.PI, TAU); ctx.fill(); ctx.fillStyle = '#4a3324'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 35, 0, 0, TAU); ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,200,120,' + (0.25 + 0.6 * fall) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 35, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.fillStyle = HAIR; ctx.beginPath(); ctx.ellipse(0, -12, 31, 25, 0, Math.PI, TAU); ctx.fill(); ctx.fillStyle = '#120b07'; for (const ex of [-11, 11]) { ctx.beginPath(); ctx.ellipse(ex, -2 + 2 * fall, 4, 1.5 + 2.5 * (1 - fall), 0, 0, TAU); ctx.fill(); } ctx.strokeStyle = '#120b07'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, 18); ctx.lineTo(6, 18); ctx.stroke(); ctx.restore();
      // máscara branca sorridente
      if (fall < 1) for (const half of [-1, 1]) { ctx.save(); ctx.translate(540 + half * 260 * fall, 900 + 700 * fall * fall); ctx.rotate(half * 0.5 * fall); ctx.scale(4.35, 4.35); ctx.beginPath(); ctx.rect(half < 0 ? -40 : 0, -45, 40, 90); ctx.clip();
        ctx.fillStyle = '#f4efe6'; ctx.beginPath(); ctx.ellipse(0, -2, 31, 36, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#0b0907'; for (const ex of [-11, 11]) { ctx.beginPath(); ctx.ellipse(ex, -6, 6, 4.5, 0, 0, TAU); ctx.fill(); }
        ctx.strokeStyle = DRED; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 6, 13, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); ctx.fillStyle = 'rgba(200,90,80,0.25)'; for (const ex of [-17, 17]) { ctx.beginPath(); ctx.arc(ex, 8, 5, 0, TAU); ctx.fill(); }
        if (crack > 0) { ctx.strokeStyle = '#2b1f17'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -38); const pts = [[3, -26], [-2, -14], [2, -2], [-3, 10], [1, 22], [0, 34]]; const n = Math.ceil(pts.length * crack); for (let i = 0; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); ctx.beginPath(); ctx.moveTo(2, -2); ctx.lineTo(2 + 14 * crack, -10 * crack); ctx.moveTo(-3, 10); ctx.lineTo(-3 - 12 * crack, 18 * crack); ctx.stroke(); }
        ctx.restore(); }
      const lk = sm(t, s6.deu - 0.2, s6.deu + 0.6); beam(540, -100, 260, 540, 1500, 700, 'rgba(255,215,140,0.55)', lk, t); glow(540, 700, 700, 'rgba(255,210,130,0.45)', lk);
      dust(t, 0.3 + 0.6 * lk); ctx.restore();
      tMask('A MÁSCARA ENGANA', 540, 280, 76, prog(t, s6.mas - 0.2, s6.mas + 0.3) * (1 - prog(t, s6.en1 - 0.75, s6.en1 - 0.5)), { w: 900, color: BEIGE });
      tMask('AS PESSOAS.', 540, 375, 76, prog(t, s6.pes - 0.2, s6.pes + 0.3) * (1 - prog(t, s6.en1 - 0.75, s6.en1 - 0.5)), { w: 900, color: BEIGE });
      tBlur('MAS NÃO', 540, 300, 96, prog(t, s6.en1 - 0.5, s6.en1), { w: 900, color: BEIGE });
      tBlur('ENGANA DEUS.', 540, 420, 118, prog(t, s6.deu - 0.25, s6.deu + 0.35), { serif: true, color: GOLD2 });
    }
    function scene7(t) { const T0 = B[6], T1 = B[7];
      ctx.save(); cam(lerp(1.22, 1.0, sm(t, T0, T1)), 520, 1150);
      ctx.fillStyle = '#070505'; ctx.fillRect(-300, -300, W + 600, 2600);
      ctx.fillStyle = '#0e1520'; ctx.fillRect(660, 520, 260, 330); ctx.fillStyle = '#d8e4f0'; ctx.beginPath(); ctx.arc(830, 600, 24, 0, TAU); ctx.fill(); glow(830, 600, 150, 'rgba(160,190,230,0.25)', 1); ctx.strokeStyle = '#070505'; ctx.lineWidth = 10; ctx.strokeRect(660, 520, 260, 330); ctx.beginPath(); ctx.moveTo(790, 520); ctx.lineTo(790, 850); ctx.stroke();
      // mesa e luminária
      ctx.fillStyle = '#24160d'; ctx.fillRect(470, 1140, 470, 26); ctx.fillRect(500, 1166, 18, 230); ctx.fillRect(890, 1166, 18, 230);
      ctx.fillStyle = '#1a110b'; ctx.fillRect(840, 980, 10, 160); ctx.beginPath(); ctx.moveTo(800, 990); ctx.lineTo(890, 990); ctx.lineTo(870, 940); ctx.lineTo(820, 940); ctx.closePath(); ctx.fill();
      const fl = 0.92 + 0.08 * Math.sin(t * 7) * Math.sin(t * 3.1); beam(845, 990, 90, 700, 1140, 340, 'rgba(255,190,100,0.35)', fl, t); glow(760, 1100, 420, 'rgba(255,170,80,0.55)', fl);
      bibleOpen(700, 1142, 0.62, prog(t, s7.abr - 0.2, s7.abr + 0.8), t, 0.9);
      const bow = sm(t, s7.pe1 - 0.4, s7.pe1 + 0.6);
      ctx.fillStyle = '#1e130c'; ctx.fillRect(330, 1210, 140, 20); ctx.fillRect(335, 1000, 18, 230); ctx.fillRect(340, 1230, 14, 160); ctx.fillRect(450, 1230, 14, 160);
      person(410, 1390, 1.12, Object.assign({}, MAN, { f: 1, pose: 'sit', lean: lerp(0.18, 0.42, bow), tilt: lerp(0.25, 0.5, bow), armF: bow > 0.5 ? [lerp(1.6, 2.4, bow), lerp(2.2, 3.4, bow)] : [1.45, 1.75], armB: [1.3, 1.6], mood: bow > 0.4 ? 'shame' : 'calm', t, blink: bow > 0.6 ? 0.2 : undefined }));
      dust(t * 0.4, 0.45); ctx.restore();
      tMask('Pela primeira vez,', 540, 300, 70, prog(t, s7.pri - 0.2, s7.pri + 0.3), { serif: true, it: true, color: BEIGE });
      tBlur('ele pensou nele mesmo.', 540, 400, 70, prog(t, s7.mes - 0.4, s7.mes + 0.3), { serif: true, it: true, color: GOLD2 });
    }
    function scene8(t) { const T0 = B[7], T1 = B[8];
      const st = t < s8.sen - 0.25 ? 0 : t < s8.des - 0.3 ? 1 : 2;
      ctx.save();
      if (st === 0) { const k = prog(t, T0, s8.sen - 0.25); cam(lerp(1.0, 1.08, k), 540, 1100); room(1, t); dust(t, 0.4);
        const near = sm(t, s8.per + 0.2, s8.sen - 0.4);
        person(lerp(360, 420, near), 1420, 1.45, Object.assign({}, MAN, { f: 1, lean: 0.1, tilt: 0.3, armF: [0.75, 1.2], armB: [0.6, 1.0], mood: 'shame', t }));
        person(760, 1420, 1.3, Object.assign({}, WIFE, { f: -1, armF: [lerp(0.2, 1.3, near), lerp(0.3, 1.5, near)], mood: near > 0.5 ? 'calm' : 'sad', t }));
        chip('PEDE PERDÃO', 540, 300, 44, prog(t, s8.per - 0.25, s8.per + 0.1)); }
      else if (st === 1) { const k = prog(t, s8.sen - 0.25, s8.des - 0.3); cam(lerp(1.05, 1.0, k), 540, 1200); room(1, t); dust(t, 0.4);
        person(330, 1420, 1.4, Object.assign({}, MAN, { f: 1, pose: 'floor', lean: 0.15, armF: [1.3, 1.6], armB: [1.1, 1.3], mood: 'smile', t }));
        person(780, 1420, 0.92, Object.assign({}, SON, { f: -1, pose: 'floor', armF: [1.4, 1.8 + 0.2 * Math.sin(t * 4)], mood: 'smile', t }));
        const cols = [RED, GOLD, COLD, '#6b8f4e']; for (let i = 0; i < 4; i++) { const bk = outBack(prog(t, s8.sen + 0.3 + i * 0.35, s8.sen + 0.6 + i * 0.35)); if (bk <= 0) continue; ctx.fillStyle = cols[i]; ctx.fillRect(560 - 36, 1420 - 72 * (i + 1) * bk, 72, 70); }
        chip('BRINCA COM O FILHO', 540, 300, 44, prog(t, s8.sen - 0.1, s8.sen + 0.2)); }
      else { const off = t > s8.des + 0.1, k = prog(t, s8.des - 0.3, T1);
        if (t < s8.nin - 0.3) { cam(lerp(1.0, 1.05, k)); ctx.fillStyle = '#0a0705'; ctx.fillRect(-300, -300, W + 600, 2600); ctx.save(); ctx.translate(540, 980); ctx.fillStyle = '#151515'; rr(-170, -320, 340, 640, 40); ctx.fill(); ctx.fillStyle = off ? '#020202' : '#7fb6f0'; rr(-150, -290, 300, 580, 26); ctx.fill(); if (!off) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 6; i++) rr(-120, -250 + i * 90, 240, 60, 10), ctx.fill(); } ctx.restore(); if (!off) glow(540, 980, 600, 'rgba(110,170,255,0.4)', 1);
          ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(700, 1120, 60, 34, -0.5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(640, 1060, 22, 16, -0.9, 0, TAU); ctx.fill();
          chip('DESLIGA A TELA', 540, 300, 44, prog(t, s8.des - 0.2, s8.des + 0.1)); }
        else { cam(lerp(1.0, 1.1, prog(t, s8.nin - 0.3, T1)), 540, 1150); room(1, t); glow(540, 900, 700, 'rgba(255,180,90,0.3)', 1); dust(t, 0.5);
          person(320, 1420, 1.3, Object.assign({}, WIFE, { f: 1, armF: [0.9, 1.2], mood: 'smile', t }));
          person(560, 1420, 1.45, Object.assign({}, MAN, { f: -1, armF: [0.6, 1.0], armB: [0.9, 1.3], mood: 'smile', t }));
          person(760, 1420, 0.9, Object.assign({}, SON, { f: -1, armF: [1.8, 2.1 + 0.2 * Math.sin(t * 5)], mood: 'smile', t }));
          tMask('ninguém aplaude.', 540, 260, 62, prog(t, s8.apl - 0.3, s8.apl + 0.2) * (1 - prog(t, s8.par - 0.6, s8.par - 0.3)), { serif: true, it: true, color: MUTE });
          const pk = prog(t, s8.par - 0.2, s8.par + 0.2); txt('PARECENDO', 540, 330, 84, { w: 900, color: MUTE, a: pk }); const lk = prog(t, s8.par + 0.3, s8.par + 0.7); if (lk > 0) { ctx.save(); ctx.restore(); }
          if (lk > 0) { scr(); ctx.fillStyle = RED; ctx.fillRect(540 - 260, 326, 520 * outC(lk), 10); }
          tBlur('MUDANDO.', 540, 470, 150, prog(t, s8.mud - 0.25, s8.mud + 0.3), { serif: true, color: GOLD2 }); }
      }
      ctx.restore();
    }
    function scene9(t) { const T0 = B[8], T1 = B[9];
      ctx.save(); cam(lerp(1.0, 1.08, sm(t, T0, T1, x => x)), 540, 1100);
      sky('#20120a', '#7a4419', '#e09a46'); glow(540, 1230, 1000, 'rgba(255,190,90,0.55)', 1); ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(540, 1250, 120, 0, TAU); ctx.fill();
      for (let i = -4; i <= 4; i++) beam(540, 1250, 40, 540 + i * 300, -200, 300, 'rgba(255,210,140,0.12)', 1, t + i);
      ctx.fillStyle = '#100a06'; ctx.beginPath(); ctx.moveTo(-300, 1360); ctx.quadraticCurveTo(540, 1270, 1380, 1360); ctx.lineTo(1380, 2200); ctx.lineTo(-300, 2200); ctx.closePath(); ctx.fill();
      const fam = { t }; person(330, 1360, 1.25, Object.assign({}, WIFE, fam, { f: 1, armF: [0.6, 0.8] })); person(540, 1360, 1.4, Object.assign({}, MAN, fam, { f: -1, armF: [0.5, 0.9], armB: [0.9, 1.2] })); person(730, 1360, 0.86, Object.assign({}, SON, fam, { f: -1, armF: [0.3, 0.5] }));
      dust(t, 0.6); ctx.restore();
      tBlur('E VOCÊ?', 540, 300, 150, prog(t, s9.voc - 0.2, s9.voc + 0.4) * (1 - prog(t, s9.com - 0.5, s9.com - 0.2)), { serif: true, color: GOLD2 });
      const ck = prog(t, s9.com - 0.25, s9.com + 0.15);
      chip('APARÊNCIA', 540, 270, 54, ck, { col: BEIGE }); txt('ou', 540, 370, 44, { serif: true, it: true, color: BEIGE, a: ck }); chip('TRANSFORMAÇÃO', 540, 470, 54, prog(t, s9.com + 0.4, s9.com + 0.7), { col: GOLD2 });
      txt('comenta aqui embaixo', 540, 565, 34, { w: 700, color: BEIGE, a: prog(t, s9.com + 0.6, s9.com + 1) });
      const bk = sm(t, s9.seg - 0.3, s9.seg + 0.1, outBack), press = t > s9.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 720); ctx.scale(bk, bk); ctx.fillStyle = press ? 'rgba(14,10,7,0.85)' : GOLD; rr(-210, -48, 420, 96, 48); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = GOLD; ctx.stroke(); ctx.restore(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 540, 723, 46 * bk, { w: 900, color: press ? GOLD : '#1a120c', shadow: false, a: bk }); }
      txt('PRÓXIMO EPISÓDIO', 540, 1450, 30, { w: 900, color: GOLD, a: prog(t, s9.seg + 0.3, s9.seg + 0.7) });
      txt('Você quer Deus ou só as bênçãos dele?', 540, 1505, 44, { serif: true, it: true, color: BEIGE, a: prog(t, s9.seg + 0.5, s9.seg + 0.9) });
    }

    // ---------------- legendas (palavra a palavra) ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 62, words = g.map(w => w.text.replace(/[.,!?:]$/, '').toUpperCase()), ws = words.map(s => tw(s, size, { w: 900 })), sp = 18, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), pop = 0.92 + 0.08 * outBack(prog(t, g.t0, g.t0 + 0.15));
      ctx.save(); ctx.translate(540, 1680); ctx.scale(pop, pop); let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; txt(words[i], x + ws[i] / 2, 0, size, { w: 900, color: cur ? GOLD2 : '#ffffff', stroke: 12, sc: 'rgba(0,0,0,0.92)', sb: 10 }); x += ws[i] + sp; }); ctx.restore(); }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9];
    let frameN = 0;
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = BLACK; ctx.fillRect(0, 0, W, H);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(VIG, 0, 0);
      // corte com mergulho no preto
      const a0 = i > 0 ? 1 - prog(t, B[i], B[i] + 0.3) : 1 - prog(t, 0, 0.5), a1 = i < NS - 1 ? prog(t, B[i + 1] - 0.22, B[i + 1]) : 0, bk = Math.max(a0, a1);
      if (bk > 0) { ga(bk); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1); }
      captions(t);
      ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(GRAIN[Math.floor(t * 30) % 3], 0, 0, W, H); ctx.restore();
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
