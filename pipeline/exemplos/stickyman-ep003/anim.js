/*
 * STICKY MAN FINANÇAS — Ep. 003: A parcelinha de R$ 49,90. 9:16 (1080x1920), narrado.
 * Personagem e roteiro do Jonas. Visual colorido de desenho, tudo desenhado em código.
 * Cada ação presa ao instante em que a palavra é falada (build/timeline.json).
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
  const brl = v => 'R$ ' + Math.floor(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + String(Math.round((v % 1) * 100)).padStart(2, '0');

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration;
    const NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.3); B.push(END);
    const NAMES = ['Gancho: R$ 399 por mês', 'Uma parcela, mais outra', 'O salário some', 'R$ 4.790 por ano', 'Soma, corta, evita', 'Quantas parcelas você tem?', 'CTA'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ------------------------------------------------ paleta
    const INK = '#141414', WH = '#ffffff', GR = '#1fa84a', GRD = '#0d7a33', Y = '#ffd21f', YD = '#e0a800', RED = '#e8262b', BLU = '#1f5fd6', GOLD = '#ffc53a', GOLDD = '#c98a0a';

    // ------------------------------------------------ primitivas
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) {
      if (o.scale !== undefined && o.scale <= 0.001) return;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
      ctx.font = `${o.italic ? 'italic ' : ''}${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha *= o.a ?? 1;
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || INK; ctx.strokeText(s, 0, 0); }
      ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore();
    }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function line(pts, w, col = INK) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
    function circ(x, y, r, fill, lw = 0, sc = INK) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function fillStroke(fill, lw = 8) { ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); }
    function soft(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    function chip(s, x, y, size, col, k, o = {}) {
      if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7;
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(sc, sc); ga(clamp(k * 3));
      rr(-w / 2 + 7, -h / 2 + 9, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
      rr(-w / 2, -h / 2, w, h, h / 2); fillStroke(col, 7);
      txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1);
    }
    function stampMark(x, y, s, k, o = {}) {
      if (k <= 0) return; const sc = lerp(2.4, 1, outC(k)) * (o.s || 1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.1); ctx.scale(sc, sc); ga(clamp(k * 3));
      const size = o.size || 80, w = tw(s, size, 900) + 70, h = size * 1.45, col = o.col || RED;
      rr(-w / 2, -h / 2, w, h, 18); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 11; ctx.strokeStyle = col; ctx.stroke();
      txt(s, 0, 4, size, { w: 900, color: col }); ctx.restore(); ga(1);
    }
    function burst(x, y, r, k, col = Y) { // tracinhos de "destaque" em volta
      if (k <= 0) return; for (let i = 0; i < 5; i++) { const a = -2.4 + i * 0.42, r0 = r * (1 + 0.15 * (1 - k)), r1 = r0 + 55 * outBack(k); ctx.save(); ctx.translate(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.rotate(a); rr(0, -10, (r1 - r0), 20, 10); fillStroke(col, 5); ctx.restore(); }
    }
    // fundo de desenho: degradê vivo + raios girando
    function bg(t, c0, c1, rays = 0.1) {
      scr(); const g = ctx.createRadialGradient(W / 2, H * 0.42, 50, W / 2, H * 0.45, H * 0.8); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2, H * 0.42); ctx.rotate(t * 0.08); ctx.fillStyle = `rgba(255,255,255,${rays})`;
      for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 1600, i * TAU / 16, i * TAU / 16 + TAU / 32); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    function floor(y, col) { scr(); ctx.fillStyle = col; ctx.fillRect(0, y, W, H - y); line([[0, y], [W, y]], 6, 'rgba(0,0,0,0.18)'); }

    // ------------------------------------------------ logo / cabeçalho
    function chartIcon(x, y, s) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      [[-48, 18], [-22, 34], [4, 52], [30, 74]].forEach(([bx, h]) => { rr(bx, 40 - h, 20, h, 4); fillStroke(Y, 5); });
      line([[-56, 8], [-20, -14], [6, -4], [52, -44]], 9, Y); ctx.beginPath(); ctx.moveTo(60, -54); ctx.lineTo(34, -46); ctx.lineTo(52, -26); ctx.closePath(); ctx.fillStyle = Y; ctx.fill();
      ctx.restore();
    }
    function logo(x, y, s, a = 1) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ga(a);
      const wS = tw('STICKY MAN', 74, 900) * 1.04, tot = 80 + wS + 300, x0 = -tot / 2;
      chartIcon(x0 + 40, -6, 1.0);
      txt('STICKY MAN', x0 + 95, -4, 74, { w: 900, italic: true, align: 'left', color: WH, stroke: 14 });
      const fx = x0 + 95 + wS + 30; ctx.save(); ctx.translate(fx, 0); ctx.beginPath(); ctx.moveTo(-14, -46); ctx.lineTo(268, -46); ctx.lineTo(240, 46); ctx.lineTo(-40, 46); ctx.closePath(); fillStroke(GRD, 7); ctx.restore();
      txt('FINANÇAS', fx + 114, 0, 60, { w: 900, italic: true, color: Y, stroke: 12 });
      ctx.restore(); ga(1);
    }
    function header(t, a = 1) {
      if (a <= 0) return; scr(); ga(a);
      rr(40, 110, 1000, 130, 34); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill(); rr(34, 102, 1000, 130, 34); fillStroke(GR, 7);
      logo(540, 167, 0.86, a);
      ga(a); rr(250, 252, 580, 66, 33); fillStroke(Y, 6);
      txt('EP. 003 · A PARCELINHA', 540, 286, 32, { w: 900, color: INK });
      ga(1);
    }

    // ------------------------------------------------ STICKY MAN
    // origem = quadril. Mãos e pés por alvo (IK de 2 ossos).
    function ik(sx, sy, tx, ty, L1, L2, bend) {
      let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy); const dm = Math.min(d, L1 + L2 - 1);
      if (d > dm) { tx = sx + dx / d * dm; ty = sy + dy / d * dm; d = dm; }
      const a = Math.atan2(ty - sy, tx - sx), c = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * Math.max(d, 1)), -1, 1), b = Math.acos(c) * bend;
      return [[sx, sy], [sx + Math.cos(a + b) * L1, sy + Math.sin(a + b) * L1], [tx, ty]];
    }
    const POSE = {
      hang: { l: [-70, -10], r: [70, -10] },
      point: { l: [-70, -20], r: [215, -270] },
      hold: { l: [-70, -15], r: [175, -150] },
      chin: { l: [-40, -60], r: [40, -215] },
      head: { l: [-150, -360], r: [150, -360] },
      fist: { l: [-70, -15], r: [135, -405] },
      thumb: { l: [-70, -15], r: [175, -200] },
      wave: { l: [-70, -15], r: [190, -330] },
    };
    function blink(t, seed) { const p = (t + seed) % 3.4; return p < 0.13 ? 0.12 : 1; }
    function face(t, exp, look, o) {
      const lx = look[0] * 13, ly = look[1] * 13, bl = blink(t, o.seed || 0);
      const big = exp === 'shock' || exp === 'scared';
      const eye = (ex, wink) => {
        if (wink) { line([[ex - 26, -16], [ex, -36], [ex + 26, -16]], 9); return; }
        ctx.save(); ctx.translate(ex, -22); ctx.scale(1, bl); ctx.beginPath(); ctx.ellipse(0, 0, big ? 36 : 29, big ? 46 : 38, 0, 0, TAU); fillStroke(WH, 6);
        circ(lx, ly + 2, big ? 11 : 15, INK); circ(lx + 5, ly - 4, 4, WH); ctx.restore();
      };
      eye(-50, false); eye(50, exp === 'wink');
      // sobrancelhas
      const br = { think: [[-80, -88, -24, -82], [24, -96, 80, -106]], skeptic: [[-80, -80, -24, -84], [24, -108, 80, -98]], shock: [[-84, -102, -26, -112], [26, -112, 84, -102]], scared: [[-80, -96, -26, -110], [26, -110, 80, -96]], worried: [[-80, -86, -26, -98], [26, -98, 80, -86]], proud: [[-80, -88, -26, -94], [26, -94, 80, -88]] }[exp];
      if (br) br.forEach(b => line([[b[0], b[1]], [b[2], b[3]]], 9));
      // boca
      ctx.save(); ctx.translate(0, 52);
      if (exp === 'happy' || exp === 'wink' || exp === 'proud') {
        const mw = exp === 'proud' ? 70 : 62; ctx.beginPath(); ctx.moveTo(-mw, -6); ctx.quadraticCurveTo(0, 8, mw, -6); ctx.quadraticCurveTo(mw * 0.8, 92, 0, 92); ctx.quadraticCurveTo(-mw * 0.8, 92, -mw, -6); ctx.closePath(); fillStroke('#8c1d1d', 6);
        ctx.save(); ctx.clip(); ctx.beginPath(); ctx.ellipse(0, 86, 34, 22, 0, 0, TAU); ctx.fillStyle = '#ff7a86'; ctx.fill(); ctx.fillStyle = WH; ctx.fillRect(-mw, -10, mw * 2, 18); ctx.restore();
        ctx.beginPath(); ctx.moveTo(-mw, -6); ctx.quadraticCurveTo(0, 8, mw, -6); ctx.quadraticCurveTo(mw * 0.8, 92, 0, 92); ctx.quadraticCurveTo(-mw * 0.8, 92, -mw, -6); ctx.closePath(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      } else if (exp === 'smile') { ctx.beginPath(); ctx.arc(0, -10, 50, 0.25, Math.PI - 0.25); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); }
      else if (exp === 'think') line([[-10, 26], [22, 20], [48, 10]], 9);
      else if (exp === 'skeptic') line([[-38, 22], [38, 16]], 9);
      else if (exp === 'shock') { ctx.beginPath(); ctx.ellipse(0, 34, 30, 40, 0, 0, TAU); fillStroke('#8c1d1d', 6); }
      else if (exp === 'scared') { ctx.beginPath(); ctx.moveTo(-60, 4); ctx.quadraticCurveTo(0, -18, 60, 4); ctx.quadraticCurveTo(50, 80, 0, 78); ctx.quadraticCurveTo(-50, 80, -60, 4); ctx.closePath(); fillStroke('#8c1d1d', 6); ctx.fillStyle = WH; ctx.fillRect(-44, -4, 88, 14); }
      else if (exp === 'worried') { ctx.beginPath(); for (let j = 0; j <= 12; j++) ctx.lineTo(-44 + j * 7.3, 24 + Math.sin(j * 1.3) * 7); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); }
      ctx.restore();
    }
    // o: exp, look, pose, run (fase), sweat, tilt, seed
    function man(x, y, s, t, o = {}) {
      if (s <= 0.001) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.tilt || 0);
      const bob = o.run !== undefined ? -Math.abs(Math.sin(o.run)) * 22 : Math.sin(t * 2.2 + (o.seed || 0)) * 4; ctx.translate(0, bob);
      // sombra no chão
      ctx.save(); ctx.translate(0, 238 - bob); ctx.scale(1, 0.18); circ(0, 0, 130, 'rgba(0,0,0,0.18)'); ctx.restore();
      // pernas
      let fl = [-62, 232], fr = [62, 232];
      if (o.run !== undefined) { const p = o.run; fl = [-15 + Math.sin(p) * 95, 225 - Math.max(0, Math.cos(p)) * 55]; fr = [15 + Math.sin(p + Math.PI) * 95, 225 - Math.max(0, Math.cos(p + Math.PI)) * 55]; }
      for (const [hx, f] of [[-18, fl], [18, fr]]) { const L = ik(hx, 0, f[0], f[1], 122, 118, hx < 0 ? 1 : -1); line(L, 17); ctx.beginPath(); ctx.ellipse(f[0] + (hx < 0 ? -10 : 10), f[1] + 4, 30, 15, 0, 0, TAU); fillStroke(INK, 2); }
      // braços
      let P = POSE[o.pose || 'hang']; let hl = P.l, hr = P.r;
      if (o.run !== undefined) { hl = [-60 + Math.sin(o.run + Math.PI) * 80, -40]; hr = [60 + Math.sin(o.run) * 80, -40]; }
      if (o.pose2 && o.mix) { const Q = POSE[o.pose2]; hl = [lerp(hl[0], Q.l[0], o.mix), lerp(hl[1], Q.l[1], o.mix)]; hr = [lerp(hr[0], Q.r[0], o.mix), lerp(hr[1], Q.r[1], o.mix)]; }
      const AL = ik(-30, -172, hl[0], hl[1], 108, 104, -1), AR = ik(30, -172, hr[0], hr[1], 108, 104, 1);
      line(AL, 17); line(AR, 17);
      // camiseta (manga + tronco)
      for (const A of [AL, AR]) line([A[0], [lerp(A[0][0], A[1][0], 0.55), lerp(A[0][1], A[1][1], 0.55)]], 50, INK);
      for (const A of [AL, AR]) line([A[0], [lerp(A[0][0], A[1][0], 0.5), lerp(A[0][1], A[1][1], 0.5)]], 38, GR);
      ctx.beginPath(); ctx.moveTo(-58, -192); ctx.quadraticCurveTo(0, -176, 58, -192); ctx.lineTo(66, 8); ctx.quadraticCurveTo(0, 18, -66, 8); ctx.closePath(); fillStroke(GR, 7);
      ctx.beginPath(); ctx.moveTo(-26, -186); ctx.quadraticCurveTo(0, -150, 26, -186); ctx.lineWidth = 6; ctx.strokeStyle = GRD; ctx.stroke();
      // mãos
      for (const A of [AL, AR]) circ(A[2][0], A[2][1], 22, WH, 6);
      if (o.pose === 'thumb' && !o.mix) { ctx.save(); ctx.translate(AR[2][0], AR[2][1]); rr(-8, -52, 18, 40, 9); fillStroke(WH, 6); ctx.restore(); }
      // cabeça
      ctx.save(); ctx.translate(0, -330); if (o.headTilt) ctx.rotate(o.headTilt);
      const hg = ctx.createRadialGradient(-40, -50, 20, 0, 0, 150); hg.addColorStop(0, '#ffffff'); hg.addColorStop(1, '#dcdcdc');
      circ(0, 0, 138, hg, 9);
      face(t, o.exp || 'happy', o.look || [0, 0], o);
      if (o.sweat) { const k = o.sweat; ctx.save(); ctx.translate(-150, -40 + ((t * 60) % 30) * k); ctx.scale(k, k); ctx.beginPath(); ctx.moveTo(0, -30); ctx.bezierCurveTo(20, 0, 20, 22, 0, 22); ctx.bezierCurveTo(-20, 22, -20, 0, 0, -30); fillStroke('#5ec8ff', 5); ctx.restore(); }
      ctx.restore();
      ctx.restore();
    }

    // ------------------------------------------------ objetos
    function card(x, y, s, rot, o = {}) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      rr(-262, -160, 540, 340, 36); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
      rr(-270, -170, 540, 340, 36); const g = ctx.createLinearGradient(-270, -170, 270, 170); g.addColorStop(0, '#3f86ff'); g.addColorStop(1, '#173fa8'); fillStroke(g, 9);
      rr(-210, -60, 90, 70, 12); fillStroke(GOLD, 5); line([[-210, -25], [-120, -25]], 4, GOLDD); line([[-165, -60], [-165, 10]], 4, GOLDD);
      txt('CARTÃO', 70, -95, 56, { w: 900 }); txt('DE CRÉDITO', 70, -35, 52, { w: 900 });
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(150, 60, 22 + i * 18, -0.7, 0.7); ctx.lineWidth = 7; ctx.strokeStyle = WH; ctx.stroke(); }
      for (let i = 0; i < 4; i++) rr(-210 + i * 70, 85, 50, 14, 7), ctx.fillStyle = 'rgba(255,255,255,0.85)', ctx.fill();
      if (o.shine) { ctx.save(); rr(-270, -170, 540, 340, 36); ctx.clip(); const sx = lerp(-500, 500, o.shine); ctx.beginPath(); ctx.moveTo(sx, -200); ctx.lineTo(sx + 90, -200); ctx.lineTo(sx - 50, 200); ctx.lineTo(sx - 140, 200); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill(); ctx.restore(); }
      ctx.restore();
    }
    function cloud(x, y, w, h, k, tailTo) {
      if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      if (tailTo) { const [tx, ty] = tailTo; for (let i = 0; i < 3; i++) { const u = 0.55 + i * 0.17; circ((tx - x) * u, (ty - y) * u, 26 - i * 7, WH, 6); } }
      const bumps = 11; ctx.beginPath();
      for (let i = 0; i < bumps; i++) { const a = i / bumps * TAU; ctx.arc(Math.cos(a) * w * 0.42, Math.sin(a) * h * 0.38, Math.min(w, h) * 0.22, 0, TAU); }
      ctx.fillStyle = INK; ctx.save(); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); ctx.fillStyle = WH; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, w * 0.47, h * 0.42, 0, 0, TAU); ctx.fill();
      ctx.restore(); ga(1);
    }
    function pop(fn, x, y, k, s = 1) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); const sc = outBack(k) * s; ctx.scale(sc, sc); ga(clamp(k * 3)); fn(); ctx.restore(); ga(1); }
    const bag = () => { ctx.beginPath(); ctx.moveTo(-70, -40); ctx.lineTo(70, -40); ctx.lineTo(84, 80); ctx.lineTo(-84, 80); ctx.closePath(); fillStroke(RED, 7); ctx.beginPath(); ctx.arc(0, -40, 36, Math.PI, 0); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke(); line([[-60, -30], [60, -30]], 5, '#ff8a8e'); };
    const pad = () => { ctx.beginPath(); ctx.moveTo(-90, -30); ctx.quadraticCurveTo(0, -60, 90, -30); ctx.quadraticCurveTo(130, 70, 80, 70); ctx.quadraticCurveTo(50, 70, 30, 30); ctx.lineTo(-30, 30); ctx.quadraticCurveTo(-50, 70, -80, 70); ctx.quadraticCurveTo(-130, 70, -90, -30); ctx.closePath(); fillStroke('#f2f2f2', 7);
      line([[-60, -5], [-30, -5]], 10); line([[-45, -20], [-45, 10]], 10); circ(40, -14, 10, RED); circ(62, 4, 10, BLU); };
    const plane = () => { ctx.save(); ctx.rotate(-0.4); ctx.beginPath(); ctx.ellipse(0, 0, 100, 22, 0, 0, TAU); fillStroke('#4aa3ff', 6); ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(-50, -90); ctx.lineTo(-20, -90); ctx.lineTo(30, -10); ctx.closePath(); fillStroke('#2c7be5', 6); ctx.beginPath(); ctx.moveTo(-10, 10); ctx.lineTo(-50, 90); ctx.lineTo(-20, 90); ctx.lineTo(30, 10); ctx.closePath(); fillStroke('#2c7be5', 6); ctx.beginPath(); ctx.moveTo(-80, -6); ctx.lineTo(-105, -45); ctx.lineTo(-90, -45); ctx.lineTo(-60, -6); ctx.closePath(); fillStroke('#2c7be5', 5); ctx.restore(); };
    const phone = (lbl) => () => { rr(-50, -90, 100, 180, 18); fillStroke('#20262e', 7); rr(-38, -74, 76, 140, 8); ctx.fillStyle = '#36b3ff'; ctx.fill(); if (lbl) txt(lbl, 0, 0, 40, { w: 900, color: WH, stroke: 8 }); };
    function coins(x, y, n, s = 1, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      for (let i = 0; i < n; i++) { const yy = -i * 22; ctx.beginPath(); ctx.ellipse(0, yy + 10, 56, 20, 0, 0, Math.PI); ctx.lineTo(-56, yy); ctx.fillStyle = GOLDD; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, yy, 56, 20, 0, 0, TAU); fillStroke(GOLD, 5); }
      ctx.restore();
    }
    function calendar(x, y, s, flip, check) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-120, -110, 240, 230, 20); fillStroke(WH, 7); rr(-120, -110, 240, 60, [20, 20, 0, 0]); fillStroke(RED, 7);
      for (let i = 0; i < 4; i++) { rr(-90 + i * 56, -132, 14, 44, 7); fillStroke('#999', 4); }
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { rr(-96 + c * 50, -36 + r * 48, 36, 34, 6); ctx.fillStyle = '#d7e3f2'; ctx.fill(); }
      if (flip > 0) { ctx.save(); ctx.translate(0, -50); ctx.scale(1, 1 - flip); rr(-118, 0, 236, 166, 6); ctx.fillStyle = 'rgba(240,240,240,0.95)'; ctx.fill(); ctx.restore(); }
      if (check > 0) { circ(30, 40, 46 * outBack(check), WH, 8, RED); line([[10, 40], [26, 58], [56, 22]].map(p => [lerp(30, p[0], check), lerp(40, p[1], check)]), 10, RED); }
      ctx.restore();
    }
    function invoice(x, y, s, total, circK, o = {}) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.rotate(0.04); ctx.scale(s, s);
      rr(-300, -400, 600, 790, 20); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();
      rr(-310, -410, 600, 790, 20); fillStroke(WH, 9); rr(-310, -410, 600, 140, [20, 20, 0, 0]); fillStroke(BLU, 9);
      txt('FATURA', -10, -340, 84, { w: 900, color: WH });
      for (let i = 0; i < 6; i++) { line([[-250, -210 + i * 58], [lerp(-40, 200, ((i * 37) % 10) / 10), -210 + i * 58]], 14, '#c9d2de'); line([[150, -210 + i * 58], [230, -210 + i * 58]], 14, '#c9d2de'); }
      txt('TOTAL', -10, 170, 46, { w: 900, color: INK });
      txt(brl(total), -10, 250, 72, { w: 900, color: RED });
      if (circK > 0) { ctx.beginPath(); ctx.ellipse(-10, 250, 230, 72, -0.05, -Math.PI / 2, -Math.PI / 2 + TAU * outC(circK)); ctx.lineWidth = 10; ctx.strokeStyle = RED; ctx.stroke(); }
      if (o.min > 0) { const k = outBack(o.min); ctx.save(); ctx.translate(-10, 330 + 0 * k); ctx.scale(k, k); rr(-250, -36, 500, 72, 36); fillStroke(Y, 6); txt('MÍNIMO: R$ 183,00', 0, 2, 40, { w: 900, color: INK }); ctx.restore(); }
      ctx.restore();
    }
    function board(x, y, s, bars, pct, t) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.03); ctx.scale(s, s);
      rr(-330, -330, 680, 640, 22); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill(); rr(-340, -340, 680, 640, 22); fillStroke('#fbfbf7', 9);
      txt('JUROS', -40, -250, 82, { w: 900, color: RED, rot: -0.04 }); txt('ROTATIVOS', -40, -160, 82, { w: 900, color: RED, rot: -0.04 });
      const hs = [60, 100, 150, 210, 280]; hs.forEach((h, i) => { const k = outC(prog(bars, i * 0.15, i * 0.15 + 0.4)); if (k <= 0) return; rr(-280 + i * 115, 250 - h * k, 80, h * k, 8); fillStroke(RED, 6); });
      if (bars > 0.2) { const k = prog(bars, 0.2, 1); const pts = [[-260, 140], [-120, 90], [20, 30], [180, -60]]; const n = Math.max(2, Math.ceil(k * 4)); const ps = pts.slice(0, n); line(ps, 16, RED); const e = ps[ps.length - 1], p0 = ps[ps.length - 2], a = Math.atan2(e[1] - p0[1], e[0] - p0[0]); ctx.save(); ctx.translate(e[0], e[1]); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(-20, -26); ctx.lineTo(-20, 26); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); ctx.restore(); }
      if (pct > 0) { ctx.save(); ctx.translate(240, -40); const k = outBack(pct); ctx.scale(k, k); ctx.rotate(Math.sin(t * 3) * 0.1); circ(0, 0, 80, Y, 8); txt('%', 0, 4, 96, { w: 900, color: INK }); ctx.restore(); }
      ctx.restore();
    }
    function notebook(x, y, s, items, kk, t) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.rotate(0.03); ctx.scale(s, s);
      rr(-350, -350, 700, 700, 24); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill(); rr(-360, -360, 700, 700, 24); fillStroke('#fffdf4', 9);
      for (let i = 0; i < 10; i++) { const rx = -310 + i * 66; ctx.beginPath(); ctx.arc(rx, -362, 18, Math.PI * 0.9, Math.PI * 2.1); ctx.lineWidth = 8; ctx.strokeStyle = '#555'; ctx.stroke(); }
      rr(-310, -320, 600, 170, 20); ctx.fillStyle = Y; ctx.fill();
      txt('COMO USAR O CARTÃO', -10, -268, 46, { w: 900, color: INK }); txt('COM INTELIGÊNCIA:', -10, -205, 46, { w: 900, color: INK });
      items.forEach((it, i) => { const k = kk[i]; if (k <= 0) return; const yy = -70 + i * 140; ga(clamp(k * 3)); rr(-310, yy - 38, 76, 76, 12); fillStroke(WH, 7);
        const ck = prog(k, 0.3, 1); if (ck > 0) line([[-292, yy], [-274, yy + 20], [-240, yy - 24]].slice(0, ck > 0.5 ? 3 : 2), 14, GR);
        txt(it[0], -210, yy - 22, 40, { w: 900, color: INK, align: 'left' }); txt(it[1], -210, yy + 26, 40, { w: 700, color: '#333', align: 'left' }); ga(1); });
      ctx.restore();
    }
    function shield(x, y, s, t) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      soft(0, 0, 300, 'rgba(255,255,255,A)', 0.6);
      ctx.beginPath(); ctx.moveTo(0, -190); ctx.quadraticCurveTo(110, -140, 170, -150); ctx.quadraticCurveTo(180, 80, 0, 200); ctx.quadraticCurveTo(-180, 80, -170, -150); ctx.quadraticCurveTo(-110, -140, 0, -190); ctx.closePath(); fillStroke(GOLD, 10);
      ctx.beginPath(); ctx.moveTo(0, -150); ctx.quadraticCurveTo(85, -110, 132, -118); ctx.quadraticCurveTo(140, 60, 0, 156); ctx.quadraticCurveTo(-140, 60, -132, -118); ctx.quadraticCurveTo(-85, -110, 0, -150); ctx.closePath(); ctx.fillStyle = GR; ctx.fill();
      line([[-70, 0], [-15, 60], [80, -60]], 34, WH);
      ctx.restore();
    }
    function snowball(x, y, r, rot) {
      ctx.save(); ctx.translate(x, y); circ(0, 0, r, '#f4fbff', 10); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 5, 0, TAU); ctx.clip();
      ctx.rotate(rot); const R = mulberry(3); for (let i = 0; i < 26; i++) { const a = R() * TAU, d = R() * r; circ(Math.cos(a) * d, Math.sin(a) * d, 6 + R() * r * 0.08, '#cfe4f2'); } ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, r, 0.3, 1.6); ctx.lineWidth = r * 0.12; ctx.strokeStyle = 'rgba(120,170,210,0.35)'; ctx.stroke();
      txt('DÍVIDA', 0, 4, r * 0.42, { w: 900, color: '#16306b', rot: -0.08 });
      ctx.restore();
    }

    // ------------------------------------------------ objetos do Ep. 003
    function tag(x, y, s, rot = 0) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      rr(-150, -42, 300, 92, 22); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
      rr(-156, -50, 300, 92, 22); fillStroke(RED, 6); circ(-122, -4, 11, WH, 4);
      txt('R$ 49,90', 14, -2, 50, { w: 900, color: WH, stroke: 8 }); ctx.restore();
    }
    function bills(x, y, n, s) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      for (let i = 0; i < n; i++) { const yy = -i * 34; rr(-160, yy - 44, 320, 88, 12); fillStroke('#62c784', 6); rr(-130, yy - 30, 260, 60, 10); ctx.lineWidth = 4; ctx.strokeStyle = '#2e8a50'; ctx.stroke(); txt('R$', 0, yy, 40, { w: 900, color: '#1d6b3a' }); }
      ctx.restore();
    }
    function chomper(x, y, r, open) {
      ctx.save(); ctx.translate(x, y); const a = 0.12 + 0.55 * open;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, Math.PI + a, Math.PI - a); ctx.closePath(); fillStroke(RED, 9);
      circ(r * 0.1, -r * 0.5, r * 0.13, WH, 5); circ(r * 0.05, -r * 0.5, r * 0.06, INK);
      txt('PARCELAS', r * 0.3, r * 0.38, r * 0.2, { w: 900, color: WH, stroke: 7 }); ctx.restore();
    }
    function plaque(x, y, s, val, t) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.04); ctx.scale(s, s);
      rr(-372, -118, 760, 240, 40); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
      rr(-380, -130, 760, 240, 40); fillStroke(Y, 12); rr(-350, -102, 700, 184, 28); ctx.lineWidth = 6; ctx.strokeStyle = YD; ctx.stroke();
      txt('R$ ' + Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'), 0, -6, 150, { w: 900, color: RED, stroke: 14, strokeColor: INK });
      ctx.restore();
    }
    function scissors(x, y, s, open) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      for (const sg of [1, -1]) { ctx.save(); ctx.rotate(sg * 0.28 * open); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-160, -14 * sg); ctx.lineTo(-160, 4 * sg); ctx.closePath(); fillStroke('#d9dde3', 5);
        ctx.beginPath(); ctx.ellipse(46, 24 * sg, 36, 24, 0, 0, TAU); ctx.lineWidth = 15; ctx.strokeStyle = RED; ctx.stroke(); ctx.restore(); }
      circ(0, 0, 9, INK); ctx.restore();
    }
    function calc(x, y, s) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.15); ctx.scale(s, s); rr(-62, -88, 124, 176, 16); fillStroke('#3a4250', 6);
      rr(-46, -70, 92, 42, 7); ctx.fillStyle = '#bfe7c4'; ctx.fill();
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { rr(-46 + c * 32, -16 + r * 32, 24, 24, 5); ctx.fillStyle = r === 2 && c === 2 ? Y : '#dfe3e8'; ctx.fill(); }
      ctx.restore();
    }
    function clipboard(x, y, s, rowsK, marks, totalK, t) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.rotate(0.03); ctx.scale(s, s);
      rr(-292, -412, 600, 840, 24); ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fill(); rr(-300, -420, 600, 840, 24); fillStroke('#fffdf4', 9);
      rr(-110, -460, 220, 80, 16); fillStroke('#9aa4b2', 7);
      txt('MINHAS PARCELAS', 0, -330, 50, { w: 900, color: INK });
      for (let i = 0; i < 8; i++) { const k = rowsK[i]; if (k <= 0) continue; const yy = -240 + i * 72; ga(clamp(k * 3));
        rr(-250, yy - 26, 52, 52, 10); fillStroke(WH, 5);
        const m = marks[i];
        if (m > 0 && i < 3) line([[-238, yy], [-226, yy + 14], [-206, yy - 14]], 9, GR);
        txt('R$ 49,90', -170, yy, 46, { w: 900, color: m > 0 && i >= 3 ? '#9b9b9b' : INK, align: 'left' });
        if (m > 0 && i >= 3) { const w = 260 * outC(m); line([[-180, yy], [-180 + w, yy]], 8, RED); ctx.save(); ctx.translate(-224, yy); const q = outBack(m); ctx.scale(q, q); line([[-16, -16], [16, 16]], 9, RED); line([[16, -16], [-16, 16]], 9, RED); ctx.restore(); }
        ga(1); }
      if (totalK > 0) { ga(clamp(totalK * 3)); line([[-250, 340], [250, 340]], 6, '#bbb'); txt('TOTAL: R$ 399,20', 0, 385, 52, { w: 900, color: RED }); ga(1); }
      ctx.restore();
    }
    function bubble(x, y, s, t) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-110, -80, 220, 150, 40); fillStroke(RED, 8); ctx.beginPath(); ctx.moveTo(-40, 66); ctx.lineTo(-70, 120); ctx.lineTo(0, 68); ctx.closePath(); fillStroke(RED, 8);
      rr(-90, -60, 180, 110, 30); ctx.fillStyle = RED; ctx.fill();
      for (let i = 0; i < 3; i++) circ(-50 + i * 50, -6 + Math.sin(t * 8 + i) * 6, 16, WH);
      ctx.restore();
    }
    function arrowDown(x, y, s) {
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-34, -120); ctx.lineTo(34, -120); ctx.lineTo(34, 10); ctx.lineTo(80, 10); ctx.lineTo(0, 110); ctx.lineTo(-80, 10); ctx.lineTo(-34, 10); ctx.closePath(); fillStroke(RED, 8); ctx.restore();
    }

    // ================= CENA 1 — R$ 399 por mês =================
    const s1 = { n: wt('c1', '399'), mes: wt('c1', 'mes'), pou: wt('c1', 'pouco'), aca: wt('c1', 'acabando'), sal: wt('c1', 'salario') };
    cue(0, 'music', { part: 'intro' }); cue(s1.n - 0.05, 'impact'); cue(s1.n, 'stamp'); cue(s1.mes, 'coin'); cue(s1.pou, 'boing', { gain: 0.6 }); cue(s1.aca, 'alarm'); cue(s1.sal, 'error');
    function scene1(t) {
      bg(t, '#ff6b5a', '#b3121a', 0.12); header(t);
      const ent = sm(t, 0, 0.4, outBack), late = t > s1.aca - 0.15;
      man(300, 1235, 1.12 * ent, t, { exp: t < s1.pou - 0.1 ? 'shock' : (late ? 'scared' : 'skeptic'), pose: t < s1.pou - 0.1 || late ? 'head' : 'chin', look: [0.7, -0.5], sweat: late ? 1 : 0.5 });
      const nk = prog(t, s1.n - 0.15, s1.n + 0.25); burst(720, 700, 270, nk, Y);
      if (nk > 0) { ctx.save(); ctx.translate(720, 700); const sc = outBack(nk) * (1 + 0.035 * Math.sin(t * 6)); ctx.scale(sc, sc); ctx.rotate(-0.06);
        txt('R$', -175, -175, 110, { w: 900, color: WH, stroke: 16 }); txt('399', 0, 30, 270, { w: 900, color: Y, stroke: 22 }); ctx.restore(); }
      chip('POR MÊS', 720, 935, 56, WH, prog(t, s1.mes - 0.1, s1.mes + 0.2));
      stampMark(700, 1090, 'PARECE POUCO?', prog(t, s1.pou - 0.1, s1.pou + 0.1) * (1 - prog(t, s1.aca - 0.2, s1.aca)), { size: 54, rot: -0.07 });
      chip('ACABA COM O SALÁRIO', 640, 1090, 42, Y, prog(t, s1.aca - 0.1, s1.aca + 0.2), { rot: -0.04 });
    }

    // ================= CENA 2 — uma parcela, mais outra =================
    const s2 = { com: wt('c2', 'compra'), v: wt('c2', '4990'), out: wt('c2', 'outra'), uma: wt('c2', 'uma', 1), per: wt('c2', 'perceber'), oit: wt('c2', 'oito'), par: wt('c2', 'parcelas'), car: wt('c2', 'cartao') };
    const T2 = [s2.v, s2.out, s2.uma]; for (let i = 3; i < 8; i++) T2.push(lerp(s2.per, s2.oit, (i - 3) / 5));
    cue(B[1], 'music', { part: 'groove' }); T2.forEach((x, i) => cue(x, i < 3 ? 'register' : 'pop', { gain: i < 3 ? 0.9 : 0.6 })); cue(s2.oit, 'ding'); cue(s2.car, 'error');
    function scene2(t) {
      bg(t, '#fff3d6', '#f2b65c', 0.18); floor(1470, '#e6a24c'); header(t);
      const worried = t > s2.per + 0.2, mv = sm(t, s2.oit, s2.car + 0.2);
      for (let i = 0; i < 8; i++) { const k = prog(t, T2[i] - 0.05, T2[i] + 0.25); if (k <= 0) continue;
        const ax = 800, ay = 470 + i * 96, bx = 150 + (i % 2) * 150, by = 1010 + Math.floor(i / 2) * 64;
        tag(lerp(ax, bx, mv), lerp(ay, by, mv), outBack(k) * lerp(1, 0.56, mv), lerp(0.03 * Math.sin(i * 1.7), -0.08 + (i % 2) * 0.16, mv)); }
      man(300, 1235 + Math.sin(t * 3) * 4 * mv, 1.12, t, { exp: worried ? 'worried' : 'happy', pose: 'hold', look: worried ? [-0.6, -0.3] : [0.7, -0.5], sweat: mv });
      card(470, 1080, 0.36 * (1 - mv * 0.3), -0.25 + Math.sin(t * 2) * 0.05, {});
      chip('8 PARCELAS', 640, 1330, 48, RED, prog(t, s2.oit - 0.1, s2.oit + 0.2), { tc: WH });
    }

    // ================= CENA 3 — o salário some =================
    const s3 = { sal: wt('c3', 'salario'), ent: wt('c3', 'entra'), par: wt('c3', 'parcelas'), com: wt('c3', 'comem'), qua: wt('c3', 'quase'), ant: wt('c3', 'antes'), usa: wt('c3', 'usar') };
    cue(s3.ent, 'success'); for (let i = 0; i < 6; i++) cue(lerp(s3.com, s3.ant, i / 6), 'chop', { gain: 0.6 }); cue(s3.ant, 'error');
    function scene3(t) {
      bg(t, '#e3f1ff', '#86bdf0', 0.16); floor(1470, '#7aa9d6'); header(t);
      const ck = sm(t, s3.sal - 0.3, s3.sal + 0.1, outBack);
      if (ck > 0) { calendar(250, 600, 1.0 * ck, 0, prog(t, s3.ent, s3.ent + 0.35)); txt('SALÁRIO', 250, 515, 40 * ck, { w: 900, color: WH }); }
      const eat = sm(t, s3.com, s3.ant, x => x), n = Math.round(lerp(8, 1, eat) * prog(t, s3.ent, s3.ent + 0.4));
      bills(560, 1020, n, 0.95);
      const pk = sm(t, s3.par - 0.3, s3.par + 0.1, outBack); if (pk > 0) { const px = lerp(1300, lerp(900, 700, eat), pk); chomper(px, 870, 170, Math.abs(Math.sin(t * 9))); }
      man(170, 1290, 0.78, t, { exp: t < s3.par ? 'happy' : 'scared', pose: t < s3.par ? 'hang' : 'head', look: [0.8, -0.4], sweat: prog(t, s3.com, s3.qua) });
      chip('ANTES DE VOCÊ USAR', 560, 1360, 46, RED, prog(t, s3.ant - 0.1, s3.ant + 0.2), { tc: WH, rot: -0.03 });
    }

    // ================= CENA 4 — R$ 4.790 por ano =================
    const s4 = { fim: wt('c4', 'fim'), ano: wt('c4', 'ano'), num: wt('c4', '4790'), emb: wt('c4', 'embora'), pcl: wt('c4', 'parcelinhas') };
    cue(B[3], 'music', { part: 'drop' }); cue(s4.fim, 'tick', { dur: s4.num - s4.fim }); cue(s4.num - 0.1, 'riser', { dur: 0.8 }); cue(s4.num + 0.7, 'impact'); cue(s4.emb, 'swoosh'); cue(s4.pcl, 'stamp');
    function scene4(t) {
      bg(t, '#ff8a3d', '#c4161c', 0.14); header(t);
      const mk = prog(t, s4.fim - 0.2, s4.fim); if (mk > 0 && t < s4.num + 0.2) { const m = Math.max(1, Math.min(12, Math.floor(lerp(1, 13, prog(t, s4.fim, s4.num))))); chip('MÊS ' + m, 480, 440, 52, WH, mk * (1 - prog(t, s4.num, s4.num + 0.2))); }
      const pk = sm(t, s4.num - 0.3, s4.num + 0.1, outBack);
      plaque(470, 620, 0.95 * pk, 4790 * outC(prog(t, s4.num, s4.num + 0.8)), t); burst(470, 620, 390, prog(t, s4.num + 0.7, s4.num + 1.0), Y);
      chip('POR ANO', 470, 820, 60, RED, prog(t, s4.num + 0.6, s4.num + 0.9), { tc: WH, rot: -0.04 });
      for (let i = 0; i < 6; i++) { const k = prog(t, s4.emb + i * 0.08, s4.emb + i * 0.08 + 0.9); if (k <= 0 || k >= 1) continue; ctx.save(); ctx.translate(lerp(440, 1250, k), lerp(980 + i * 40, 700 - i * 30, k)); ctx.rotate(k * 3 + i); rr(-80, -40, 160, 80, 10); fillStroke('#62c784', 5); txt('R$', 0, 0, 34, { w: 900, color: '#1d6b3a' }); ctx.restore(); }
      man(820, 1240, 1.0, t, { exp: t < s4.num + 0.5 ? 'think' : 'shock', pose: t < s4.num + 0.5 ? 'chin' : 'head', look: [-0.7, -0.6], sweat: prog(t, s4.num + 0.6, s4.num + 1) });
      stampMark(370, 1130, 'SÓ EM PARCELINHAS', prog(t, s4.pcl - 0.1, s4.pcl + 0.1), { size: 46, rot: -0.06 });
    }

    // ================= CENA 5 — soma, corta, evita =================
    const s5 = { som: wt('c5', 'soma'), tud: wt('c5', 'tudo'), cor: wt('c5', 'corta'), ess: wt('c5', 'essencial'), evi: wt('c5', 'evita'), nov: wt('c5', 'nova') };
    cue(B[4], 'music', { part: 'groove' }); cue(s5.som, 'type', { n: 8, rate: 12 }); cue(s5.tud, 'ding');
    for (let i = 0; i < 5; i++) cue(lerp(s5.cor, s5.evi - 0.2, i / 5), 'chop', { gain: 0.7 }); cue(s5.evi, 'stamp'); cue(s5.nov, 'success');
    function scene5(t) {
      bg(t, '#5ee07c', '#11903f', 0.12); header(t);
      const bk = sm(t, B[4], B[4] + 0.5, outBack);
      const rowsK = [], marks = []; for (let i = 0; i < 8; i++) { rowsK.push(prog(t, B[4] + 0.1 + i * 0.05, B[4] + 0.4 + i * 0.05)); marks.push(i < 3 ? prog(t, lerp(s5.som, s5.cor - 0.2, i / 8), lerp(s5.som, s5.cor - 0.2, i / 8) + 0.3) : prog(t, lerp(s5.cor, s5.evi - 0.2, (i - 3) / 5), lerp(s5.cor, s5.evi - 0.2, (i - 3) / 5) + 0.3)); }
      clipboard(660, 820, 0.78 * bk, rowsK, marks, prog(t, s5.tud - 0.1, s5.tud + 0.2), t);
      const sk = prog(t, s5.cor - 0.2, s5.evi); if (sk > 0 && sk < 1) { const row = Math.min(4, Math.floor(sk * 5)); scissors(660 + 120, 820 + (-240 + (3 + row) * 72) * 0.78, 0.8, Math.abs(Math.sin(t * 14))); }
      man(220, 1240, 1.0, t, { exp: t < s5.cor ? 'think' : 'skeptic', pose: 'hold', look: [0.7, -0.5] });
      calc(395, 1075, 0.8);
      stampMark(560, 1420, 'PARCELA NOVA? NÃO!', prog(t, s5.evi - 0.1, s5.evi + 0.1), { size: 46, rot: -0.05 });
    }

    // ================= CENA 6 — quantas parcelas você tem? =================
    const s6 = { qua: wt('c6', 'quantas'), hoj: wt('c6', 'hoje'), com: wt('c6', 'comenta'), emb: wt('c6', 'embaixo') };
    cue(s6.qua - 0.2, 'reveal'); cue(s6.hoj, 'pop'); cue(s6.com, 'notif'); cue(s6.emb, 'tap');
    function scene6(t) {
      bg(t, '#ffe066', '#f0a52c', 0.16); header(t);
      const ck = sm(t, s6.qua - 0.35, s6.qua + 0.05, outBack);
      cloud(660, 640, 680, 480, ck, [430, 860]);
      if (ck > 0) { ctx.save(); ctx.translate(660, 640); ctx.scale(outBack(ck), outBack(ck)); ctx.rotate(-0.04);
        txt('QUANTAS', 0, -130, 92, { w: 900, color: INK }); txt('PARCELAS', 0, -20, 100, { w: 900, color: RED, stroke: 12, strokeColor: INK }); txt('VOCÊ TEM?', 0, 100, 92, { w: 900, color: INK }); ctx.restore(); }
      const ak = prog(t, s6.com - 0.2, s6.com + 0.2); arrowDown(860, 1130 + Math.sin(t * 7) * 18, outBack(ak) * 0.9); bubble(860, 1340, outBack(prog(t, s6.com, s6.com + 0.3)) * 0.9, t);
      man(290, 1240, 1.08, t, { exp: 'wink', pose: t < s6.com ? 'point' : 'thumb', look: [0.7, -0.6] });
    }

    // ================= CENA 7 — CTA =================
    const s7 = { seg: wt('c7', 'segue'), fin: wt('c7', 'financas'), dic: wt('c7', 'dicas') };
    cue(s7.seg, 'music', { part: 'outro' }); cue(s7.fin, 'bell'); cue(s7.dic + 0.25, 'tap'); cue(s7.dic + 0.3, 'confetti');
    function scene7(t) {
      bg(t, '#4fd36f', '#0f8a3a', 0.14);
      const lk = sm(t, s7.seg - 0.3, s7.fin, outBack); logo(540, 470, 1.05 * lk, 1);
      man(300, 1250, 1.1, t, { exp: 'happy', pose: 'point', look: [0.8, -0.4] });
      const bk = sm(t, s7.fin - 0.2, s7.fin + 0.2, outBack), press = t > s7.dic + 0.25;
      if (bk > 0) { ctx.save(); ctx.translate(700, 820); const pr = bk * (1 - 0.06 * pulse(t, s7.dic + 0.25, 0.03, 0.15)); ctx.scale(pr, pr); rr(-230, -72, 460, 144, 72); fillStroke(press ? WH : RED, 9); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 60, { w: 900, color: press ? INK : WH }); ctx.restore();
        ctx.save(); ctx.translate(950, 700); ctx.rotate(Math.sin(t * 14) * 0.25 * pulse(t, s7.fin, 0.05, 0.8)); ctx.scale(bk, bk); ctx.beginPath(); ctx.moveTo(-50, 40); ctx.quadraticCurveTo(-50, -60, 0, -60); ctx.quadraticCurveTo(50, -60, 50, 40); ctx.lineTo(64, 56); ctx.lineTo(-64, 56); ctx.closePath(); fillStroke(Y, 8); circ(0, 70, 16, Y, 6); ctx.restore(); }
      txt('dicas de finanças', 700, 960, 44, { w: 800, color: WH, stroke: 10, a: prog(t, s7.dic - 0.2, s7.dic + 0.2) });
      txt('simples e práticas', 700, 1020, 44, { w: 800, color: WH, stroke: 10, a: prog(t, s7.dic, s7.dic + 0.3) });
    }

    // ================= legendas =================
    const HL = new Set(['399', 'reais', 'mes', 'pouco', 'salario', '4990', 'oito', 'parcelas', 'cartao', 'comem', 'antes', 'ano', '4790', 'parcelinhas', 'soma', 'corta', 'evita', 'nova', 'quantas', 'hoje', 'comenta', 'segue', 'sticky', 'man', 'financas']);
    const groups = []; {
      let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); }
      flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; });
    }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return;
      scr(); const size = 72, font = `900 ${size}px Inter`;
      const a = prog(t, g.t0, g.t0 + 0.1), pop2 = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const label = w => w.text.toUpperCase();
      const text = g.map(label).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop2;
      ctx.save(); ctx.translate(540, 1610); ctx.scale(sc, sc); ctx.globalAlpha = a;
      let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = label(w) + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 18; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? Y : '#ffffff') : 'rgba(255,255,255,0.65)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // ================= composição =================
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    const XT = 0.14;
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / XT);
      if (fl > 0) { ctx.globalAlpha = clamp(fl) * 0.9; ctx.fillStyle = WH; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t);
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
