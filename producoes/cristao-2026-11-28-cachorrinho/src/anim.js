/*
 * "A BÍBLIA QUE NINGUÉM PREGA: A MULHER E OS CACHORRINHOS" (Mateus 15:21-28) em LOUSA DE GIZ ANIMADA, 9:16 (@e_cosdafe). Lado SIM dourado x NÃO vermelho.
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
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  const BOARD = '#1f3d30', CHALK = '#f3f0e4', GOLD = '#ffd36b', RED = '#ff6b5e', BLUE = '#8fd0ff', PINK = '#ffb3c7', GREEN = '#9be8a8';
  const GROUND = 1340;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } console.error('palavra não encontrada', cid, w); return clip(cid).start + 0.6; }
    const END = TL.duration, NS = TL.clips.length;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.3); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);

    // ---------------- giz: texto e traços ----------------
    function txt(s, x, y, size, o = {}) {
      if (o.a !== undefined && o.a <= 0.001) return; if (o.scale !== undefined && o.scale <= 0.001) return;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
      ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      const a = o.a ?? 1;
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || 'rgba(0,0,0,0.92)'; ctx.globalAlpha = a; ctx.strokeText(s, 0, 0); }
      ctx.shadowColor = o.color || CHALK; ctx.shadowBlur = 8; ctx.fillStyle = o.color || CHALK;
      ctx.globalAlpha = a * 0.55; ctx.fillText(s, 1.6, 1.2); ctx.globalAlpha = a * 0.95; ctx.fillText(s, 0, 0);
      ctx.restore();
    }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    // texto que o giz escreve da esquerda para a direita
    function write(s, x, y, size, k, o = {}) {
      if (k <= 0) return; const w = tw(s, size, o.w || 900), x0 = (o.align === 'left' ? x : x - w / 2);
      ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, y - size, (w + 20) * clamp(k), size * 2); ctx.clip(); txt(s, x, y, size, o); ctx.restore();
    }
    function poly(pts, k, col, lw, seed, a = 1) {
      if (k <= 0) return; let tot = 0; const L = [];
      for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
      ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let pass = 0; pass < 2; pass++) {
        ctx.lineWidth = pass ? lw * 0.55 : lw; ctx.globalAlpha = a * (pass ? 0.4 : 0.9); let rem = tot * clamp(k);
        ctx.beginPath(); const j = i => (hash(seed * 31 + i * 7 + pass * 13) - 0.5) * 3.2;
        ctx.moveTo(pts[0][0] + j(0), pts[0][1] + j(1));
        for (let i = 1; i < pts.length; i++) {
          if (rem >= L[i - 1]) { ctx.lineTo(pts[i][0] + j(i * 2), pts[i][1] + j(i * 2 + 1)); rem -= L[i - 1]; }
          else { const f = rem / L[i - 1]; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); break; }
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    const circ = (x, y, r, n = 30) => { const p = []; for (let i = 0; i <= n; i++) p.push([x + Math.cos(i / n * TAU) * r, y + Math.sin(i / n * TAU) * r]); return p; };
    const box = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

    // ---------------- cenário: lousa verde + moldura de madeira ----------------
    const bgc = (() => {
      const cv = mk(W, H), g = cv.getContext('2d'); const gr = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1250); gr.addColorStop(0, '#2a5240'); gr.addColorStop(1, '#14291f'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,255,${0.015 + hash(i) * 0.03})`; g.beginPath(); g.ellipse(hash(i + 50) * W, hash(i + 90) * H, 80 + hash(i + 3) * 260, 30 + hash(i + 8) * 90, hash(i + 20) * 3, 0, TAU); g.fill(); }
      g.strokeStyle = 'rgba(243,240,228,0.35)'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(70, GROUND); for (let x = 70; x <= 1010; x += 20) g.lineTo(x, GROUND + (hash(x) - 0.5) * 3); g.stroke();
      return cv; })();
    const FRAME = (() => {
      const cv = mk(W, H), g = cv.getContext('2d'); const wg = g.createLinearGradient(0, 0, W, H); wg.addColorStop(0, '#8a5a30'); wg.addColorStop(0.5, '#6b4423'); wg.addColorStop(1, '#4a2e16'); g.fillStyle = wg; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.fillRect(34, 34, W - 68, H - 68); g.globalCompositeOperation = 'source-over';
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(34, 34, W - 68, 6); g.fillRect(34, 34, 6, H - 68);
      g.fillStyle = '#5a3a1c'; g.fillRect(34, H - 120, W - 68, 86); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(34, H - 120, W - 68, 4);
      g.fillStyle = CHALK; g.fillRect(150, H - 96, 90, 14); g.fillRect(270, H - 92, 60, 12);
      return cv; })();

    // ---------------- bonequinho de giz ----------------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    const IDLE = { legs: [[0.07, 0.04], [-0.07, -0.04]], arms: [[0.12, 0.25], [-0.12, -0.1]] };
    const walkP = (t, sp = 8) => { const p = Math.sin(t * sp), q = Math.cos(t * sp); return { legs: [[0.55 * p, 0.55 * p - 0.3 * Math.max(0, q)], [-0.55 * p, -0.55 * p - 0.3 * Math.max(0, -q)]], arms: [[-0.5 * p, -0.5 * p + 0.2], [0.5 * p, 0.5 * p + 0.2]], bob: Math.abs(q) * -6 }; };
    function figure(o) {
      const s = o.s || 2.5, dir = o.dir || 1, hr = 23, col = o.c || CHALK, pose = o.pose || IDLE;
      ctx.save(); ctx.translate(o.x, o.y); if (o.fall) { ctx.rotate(-dir * outBack(o.fall) * 1.5); } ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.shadowColor = col; ctx.shadowBlur = 8;
      const bob = pose.bob || o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      if (o.skirt) { ctx.globalAlpha = (o.a ?? 1) * 0.35; ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(-34, hipY + 56); ctx.lineTo(34, hipY + 56); ctx.closePath(); ctx.fill(); ga(o.a ?? 1); ctx.beginPath(); ctx.moveTo(-34, hipY + 56); ctx.lineTo(0, hipY); ctx.lineTo(34, hipY + 56); ctx.stroke(); }
      for (const [a, b] of pose.legs) limb(0, hipY, a, b, 48, 46);
      const hands = (o.arms || pose.arms).map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const hx = shX + Math.sin(lean) * (hr + 11), hy = shY - Math.cos(lean) * (hr + 11);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (o.bun) { ctx.beginPath(); ctx.arc(hx - 4, hy - hr - 8, 11, 0, TAU); ctx.fill(); }
      if (o.beard) { ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(hx + 6, hy + 8); ctx.quadraticCurveTo(hx + 20, hy + 44, hx + 2, hy + 40); ctx.stroke(); }
      ctx.fillStyle = BOARD; ctx.strokeStyle = BOARD; ctx.lineWidth = 3.2;
      if (o.dead || (o.fall && o.fall > 0.5)) { for (const ex of [hx + hr * 0.3, hx + hr * 0.7]) { ctx.beginPath(); ctx.moveTo(ex - 4, hy - 7); ctx.lineTo(ex + 4, hy + 1); ctx.moveTo(ex + 4, hy - 7); ctx.lineTo(ex - 4, hy + 1); ctx.stroke(); } }
      else { const ey = hy - 3; ctx.beginPath(); ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); ctx.fill();
        if (o.mood === 'sad') { ctx.beginPath(); ctx.arc(hx + hr * 0.55, hy + 13, 6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } else if (o.mood === 'smile') { ctx.beginPath(); ctx.arc(hx + hr * 0.55, hy + 5, 7, 0.2, Math.PI - 0.2); ctx.stroke(); } else if (o.mood === 'shock') { ctx.beginPath(); ctx.arc(hx + hr * 0.55, hy + 11, 4, 0, TAU); ctx.fill(); } }
      ctx.restore(); ga(1);
      return { head: [o.x + dir * hx * s, o.y + hy * s], hands: hands.map(([x, y]) => [o.x + dir * x * s, o.y + y * s]) };
    }

    // ---------------- objetos ----------------
    function coin(x, y, r, k = 1, col = GOLD) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = col; ctx.globalAlpha = 0.28; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.restore(); poly(circ(x, y, r * k, 16), 1, col, 4, Math.round(x + y)); txt('$', x, y + 1, r * 1.1 * k, { color: col, w: 900 }); }
    function sack(x, y, s, col, k = 1, label = '$') { if (k <= 0) return; const P = [[-26, -64], [-46, -28], [-58, 22], [-42, 58], [0, 68], [42, 58], [58, 22], [46, -28], [26, -64], [-26, -64]].map(([a, b]) => [x + a * s, y + b * s]);
      ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.18 * k; ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.fill(); ctx.restore();
      poly(P, k, col, 6, 5); poly([[x - 36 * s, y - 56 * s], [x + 36 * s, y - 52 * s]], k, col, 5, 6); txt(label, x, y + 8 * s, 52 * s, { color: col, a: k }); }
    function bubble(x, y, w, h, s, size, k, tx, ty, col = CHALK, dark = true) { if (k <= 0) return; const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y);
      ctx.fillStyle = dark ? 'rgba(14,30,22,0.92)' : 'rgba(0,0,0,0.5)'; ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineJoin = 'round'; rr(x - w / 2, y - h / 2, w, h, 36); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 30, y + h / 2 - 2); ctx.lineTo(tx, ty); ctx.lineTo(x + 30, y + h / 2 - 2); ctx.fillStyle = 'rgba(14,30,22,0.92)'; ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(14,30,22,0.92)'; ctx.fillRect(x - 27, y + h / 2 - 8, 54, 10);
      const lines = s.split('\n'); lines.forEach((l, i) => txt(l, x, y + (i - (lines.length - 1) / 2) * size * 1.15, size, { color: col })); ctx.restore(); }
    function church(x, y, k) { const c = CHALK; poly(box(x, y - 260, 250, 260), prog(k, 0, 0.6), c, 7, 1); poly([[x - 24, y - 260], [x + 125, y - 400], [x + 274, y - 260]], prog(k, 0.3, 0.8), c, 7, 2); poly([[x + 125, y - 400], [x + 125, y - 500]], prog(k, 0.6, 0.9), GOLD, 7, 3); poly([[x + 95, y - 470], [x + 155, y - 470]], prog(k, 0.7, 1), GOLD, 7, 4); poly([[x + 90, y], [x + 90, y - 130], [x + 160, y - 130], [x + 160, y]], prog(k, 0.5, 1), c, 6, 5); poly(box(x + 25, y - 210, 40, 70), prog(k, 0.6, 1), c, 5, 6); poly(box(x + 185, y - 210, 40, 70), prog(k, 0.6, 1), c, 5, 7); }
    function clockFace(x, y, r, ang, k) { poly(circ(x, y, r, 36), k, CHALK, 8, 9); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; poly([[x + Math.sin(a) * r * 0.82, y - Math.cos(a) * r * 0.82], [x + Math.sin(a) * r * 0.94, y - Math.cos(a) * r * 0.94]], k, CHALK, 5, 20 + i); } poly([[x, y], [x + Math.sin(ang) * r * 0.78, y - Math.cos(ang) * r * 0.78]], k, GOLD, 8, 31); poly([[x, y], [x + Math.sin(ang / 12) * r * 0.5, y - Math.cos(ang / 12) * r * 0.5]], k, CHALK, 10, 32); }
    function dust(x, y, t0, t, n = 10, col = '243,240,228') { const u = t - t0; if (u < 0 || u > 1.2) return; for (let i = 0; i < n; i++) { const a = hash(i + t0 * 9) * TAU, d = 30 + hash(i + 40) * 120; ctx.fillStyle = `rgba(${col},${0.5 * (1 - u / 1.2)})`; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d * outC(u), y + Math.sin(a) * d * 0.6 * outC(u) - u * 40, 4 + hash(i) * 8, 0, TAU); ctx.fill(); } }
    let shakeAmt = 0;

    const s1 = { mul: wt('c1', 'mulher'), cac: wt('c1', 'cachorrinho'), big: wt('c1', 'biblia'), nin: wt('c1', 'ninguem') };
    const s2 = { mat: wt('c2', 'mateus'), ter: wt('c2', 'terra'), gri: wt('c2', 'gritava'), sen: wt('c2', 'senhor'), fil: wt('c2', 'filha'), dem: wt('c2', 'demonio') };
    const s3 = { nao: wt('c3', 'respondeu'), pal: wt('c3', 'palavra'), dis: wt('c3', 'discipulos'), man: wt('c3', 'manda'), emb: wt('c3', 'embora') };
    const s4 = { dis: wt('c4', 'disse'), ove: wt('c4', 'ovelhas'), isr: wt('c4', 'israel'), aj: wt('c4', 'ajoelhou'), soc: wt('c4', 'socorre') };
    const s5 = { fra: wt('c5', 'frase'), pao: wt('c5', 'pao'), fil: wt('c5', 'filhos'), jog: wt('c5', 'jogar'), cac: wt('c5', 'cachorrinhos') };
    const s6 = { nao: wt('c6', 'embora'), ver: wt('c6', 'verdade'), cac: wt('c6', 'cachorrinhos'), mig: wt('c6', 'migalhas'), mesa: wt('c6', 'mesa'), don: wt('c6', 'donos') };
    const s7 = { gra: wt('c7', 'grande'), fe: wt('c7', 'fe'), fei: wt('c7', 'feito'), fil: wt('c7', 'filha'), cur: wt('c7', 'curada') };
    const s8 = { det: wt('c8', 'detalhe'), rua: wt('c8', 'rua'), cas: wt('c8', 'casa'), mesa: wt('c8', 'mesa'), dois: wt('c8', 'dois'), estr: wt('c8', 'estrangeiros'), mul: wt('c8', 'mulher'), cen: wt('c8', 'centuriao') };
    const s9 = { uns: wt('c9', 'uns'), tes: wt('c9', 'teste'), fe: wt('c9', 'fe'), out: wt('c9', 'outros'), mis: wt('c9', 'missao'), pov: wt('c9', 'povos'), dur: wt('c9', 'dura') };
    const s10 = { tes: wt('c10', 'teste'), dur: wt('c10', 'duro'), cmt: wt('c10', 'comenta'), ver: wt('c10', 'versiculo'), mar: wt('c10', 'marca'), seg: wt('c10', 'segue'), deb: wt('c10', 'dia'), am: wt('c10', 'amanha') };
    const shake = t => 0;
    const HDR = (t, s, t0, col = GOLD) => write(s, 540, 175, 60, sm(t, t0 + 0.1, t0 + 1.0, x => x), { color: col });
    const houseP = (x, y, k) => { poly([[x, y], [x, y - 200], [x - 50, y - 200], [x + 110, y - 330], [x + 270, y - 200], [x + 220, y - 200], [x + 220, y], [x, y]], k, CHALK, 7, 81); };
    const doorP = (x, y, k) => poly([[x + 70, y], [x + 70, y - 120], [x + 150, y - 120], [x + 150, y]], k, GOLD, 6, 82);
    const tablet = (x, y, w, h, k, col = CHALK) => { poly(box(x - w / 2, y - h / 2, w, h), k, col, 7, 91); };
    const armsUp = (t, ph = 0) => [[2.4 + 0.3 * Math.sin(t * 6 + ph), 2.7], [-0.15, -0.1]];
    const say = (x, y, w, h, s, size, k, tx, ty, col) => { if (k > 0) bubble(x, y, w, h, s, size, k, tx, ty, col); };
    function splitBoard(t, t0) { const u = t - t0; poly([[540, 160], [540, 1540]], prog(u, 0.1, 0.7), CHALK, 8, 131); }
    // CTA padrão (última cena): headline, dois lados, comenta, marca, segue
    function ctaScene(t, B0, A, L1, L2, c1, c2, extra) {
      txt('E VOCÊ?', 540, 230, 150, { color: GOLD, scale: outBack(prog(t, B0 + 0.15, B0 + 0.6)), stroke: 14 });
      const jk = prog(t, A.a - 0.1, A.a + 0.3), dk = prog(t, A.b - 0.1, A.b + 0.3);
      txt(L1, 290, 520, (extra[2] || 84), { color: c1, scale: outBack(jk) * (1 + 0.02 * Math.sin(t * 6)), stroke: 12 }); txt('ou', 540, 520, 50, { color: CHALK, w: 700, a: jk }); txt(L2, 790, 520, (extra[2] || 84), { color: c2, scale: outBack(dk) * (1 + 0.02 * Math.sin(t * 6 + 1)), stroke: 12 });
      const ck = sm(t, A.cmt - 0.1, A.cmt + 0.4, outBack); if (ck > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(ck, ck); ctx.fillStyle = 'rgba(14,30,22,0.9)'; ctx.strokeStyle = CHALK; ctx.lineWidth = 7; rr(-300, -90, 600, 180, 50); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-60, 90); ctx.lineTo(-100, 150); ctx.lineTo(0, 90); ctx.fill(); ctx.stroke(); ctx.restore(); txt('COMENTA', 540, 870, 70, { color: CHALK, a: ck }); txt('+ O VERSÍCULO', 540, 945, 46, { color: GOLD, a: sm(t, A.ver - 0.1, A.ver + 0.3) }); }
      if (t > A.mar - 0.1) { const m3 = sm(t, A.mar - 0.1, A.mar + 0.4, outBack); txt('MARCA QUEM', 540, 1130, 78, { color: CHALK, scale: m3, stroke: 12 }); txt('VAI DISCORDAR', 540, 1225, 78, { color: RED, scale: m3, stroke: 12 }); }
      figure({ x: 130, y: GROUND + 60, s: 1.45, c: PINK, skirt: true, bun: true, a: 0.9, pose: { legs: IDLE.legs, arms: [[2.2 + 0.4 * Math.sin(t * 7), 2.6], [-0.1, -0.1]] } }); figure({ x: 950, y: GROUND + 60, s: 1.45, dir: -1, c: BLUE, a: 0.9, pose: { legs: IDLE.legs, arms: [[2.2 + 0.4 * Math.sin(t * 7 + 1), 2.6], [-0.1, -0.1]] } });
      const bk = sm(t, A.seg - 0.3, A.seg + 0.1, outBack), press = t > A.seg + 0.3;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1390); ctx.scale(bk, bk); ctx.fillStyle = press ? 'rgba(14,30,22,0.9)' : GOLD; rr(-290, -52, 580, 104, 52); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = GOLD; ctx.stroke(); ctx.restore(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR @e_cosdafe', 540, 1393, 46 * bk, { color: press ? GOLD : '#14291f' }); }
      txt(extra[0], 540, 1490, 42, { color: CHALK, a: sm(t, A.deb - 0.1, A.deb + 0.4) });
      if (extra[1]) txt(extra[1], 540, 1560, 36, { color: GOLD, a: sm(t, A.am - 0.1, A.am + 0.4) });
    }
    const crossP = (x, y, k, col = CHALK) => { poly([[x, y], [x, y - 360]], k, col, 9, 301); poly([[x - 100, y - 270], [x + 100, y - 270]], k, col, 9, 302); };
    const xmark = (x, y, r, k) => { poly([[x - r, y - r], [x + r, y + r]], k, RED, 12, 311); poly([[x + r, y - r], [x - r, y + r]], prog(k, 0.4, 1) , RED, 12, 312); };
    function dog(x, y, s, t, col = CHALK, dir = 1, a = 1) {
      if (a <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 6; ctx.globalAlpha = a;
      ctx.beginPath(); ctx.ellipse(0, -50, 54, 28, 0, 0, TAU); ctx.stroke();
      for (const lx of [-36, -16, 22, 42]) { ctx.beginPath(); ctx.moveTo(lx, -26); ctx.lineTo(lx, 0); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(64, -80, 21, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(54, -96); ctx.lineTo(44, -66); ctx.lineTo(62, -72); ctx.stroke();
      const w = Math.sin(t * 12) * 0.5; ctx.beginPath(); ctx.moveTo(-52, -60); ctx.lineTo(-52 - Math.cos(0.9 + w) * 32, -60 - Math.sin(0.9 + w) * 32); ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(70, -84, 3.6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(82, -76, 4.5, 0, TAU); ctx.fill();
      ctx.restore();
    }
    function sheep(x, y, s, a = 1) {
      if (a <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = CHALK; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = a;
      for (const [cx, cy, r] of [[-28, -58, 24], [0, -72, 28], [30, -58, 24], [-8, -42, 26], [20, -40, 24]]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); }
      for (const lx of [-22, 18]) { ctx.beginPath(); ctx.moveTo(lx, -20); ctx.lineTo(lx, 0); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(56, -58, 15, 0, TAU); ctx.stroke(); ctx.fillStyle = CHALK; ctx.beginPath(); ctx.arc(60, -62, 3, 0, TAU); ctx.fill(); ctx.restore();
    }
    function bread(x, y, s, k = 1, col = GOLD) { if (k <= 0) return; poly([[x - 40 * s, y], [x - 46 * s, y - 24 * s], [x - 20 * s, y - 46 * s], [x + 20 * s, y - 46 * s], [x + 46 * s, y - 24 * s], [x + 40 * s, y], [x - 40 * s, y]], k, col, 6, 77); poly([[x - 14 * s, y - 40 * s], [x - 8 * s, y - 14 * s]], k, col, 5, 78); poly([[x + 10 * s, y - 40 * s], [x + 16 * s, y - 14 * s]], k, col, 5, 79); }
    function tableP(x0, x1, y, k) { poly([[x0, y], [x1, y]], k, CHALK, 8, 321); poly([[x0 + 40, y], [x0 + 40, GROUND]], prog(k, 0.2, 1), CHALK, 7, 322); poly([[x1 - 40, y], [x1 - 40, GROUND]], prog(k, 0.2, 1), CHALK, 7, 323); }
    function swirl(x, y, k, t) { if (k <= 0) return; const p = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU * 2.2 + t * 3, r = 8 + i * 1.3; p.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8]); } poly(p, k, RED, 6, 55); }
    function globe(x, y, r, k) { poly(circ(x, y, r, 30), k, BLUE, 6, 91); poly([[x - r, y], [x + r, y]], k, BLUE, 4, 92); poly([[x, y - r], [x, y + r]], k, BLUE, 4, 93); poly(circ(x, y, r * 0.5, 20).map(([a, b]) => [a, y + (b - y) * 2]).filter(([a, b]) => Math.abs(b - y) <= r), k, BLUE, 4, 94); }
    const WOMAN = { c: PINK, skirt: true, bun: true };
    function scene1(t) {
      write('MATEUS 15', 540, 200, 70, sm(t, 0.2, 1.0, x => x), { color: GOLD, stroke: 8 });
      const k = prog(t, 0.2, 1.0);
      figure({ x: 300, y: GROUND, s: 2.3, c: CHALK, beard: true, pose: IDLE, mood: 'smile', a: sm(t, 0.1, 0.6) });
      figure(Object.assign({ x: 800, y: GROUND, s: 2.3, dir: -1, pose: { legs: IDLE.legs, arms: [[1.2 + 0.2 * Math.sin(t * 5), 1.7], [-0.1, -0.1]] }, mood: 'sad', a: sm(t, 0.1, 0.6) }, WOMAN));
      txt('JESUS', 300, 640, 54, { color: CHALK, a: sm(t, 0.5, 1.0) }); txt('MULHER', 800, 640, 54, { color: PINK, a: sm(t, s1.mul - 0.1, s1.mul + 0.3) });
      if (t > s1.cac - 0.2) { txt('CACHORRINHO?', 540, 400, 92, { color: RED, scale: outBack(prog(t, s1.cac - 0.1, s1.cac + 0.35)), rot: -0.03, stroke: 14 }); dog(540, GROUND, 1.5, t, CHALK, 1, sm(t, s1.cac, s1.cac + 0.4)); }
      if (t > s1.big - 0.1) txt('ESTÁ NA BÍBLIA', 540, 1500, 60, { color: GOLD, a: sm(t, s1.big - 0.1, s1.big + 0.4), stroke: 8 });
    }
    function scene2(t) {
      write('TIRO E SIDOM', 540, 190, 72, sm(t, B[1] + 0.1, B[1] + 1, x => x), { color: GOLD, stroke: 8 });
      txt('TERRA DE ESTRANGEIROS', 540, 280, 40, { color: CHALK, a: sm(t, s2.ter - 0.1, s2.ter + 0.4) });
      const u = t - B[1], wk = sm(t, B[1] + 0.1, s2.sen + 1.5, x => x);
      figure({ x: lerp(380, 700, wk), y: GROUND, s: 2.3, dir: 1, c: CHALK, beard: true, pose: walkP(t, 5), mood: 'smile' });
      const cr = sm(t, s2.gri - 0.3, s2.gri + 0.6, x => x);
      figure(Object.assign({ x: lerp(-40, 330, Math.max(cr, wk * 0.9)), y: GROUND, s: 2.3, dir: 1, pose: { legs: walkP(t, 7).legs, arms: [[2.5 + 0.3 * Math.sin(t * 8), 2.8], [-0.1, -0.1]], bob: walkP(t, 7).bob }, mood: 'sad' }, WOMAN));
      say(430, 640, 700, 200, 'SENHOR, TEM PENA\nDE MIM!', 54, prog(t, s2.sen - 0.1, s2.sen + 0.3), 330, 900, PINK);
      const fk = sm(t, s2.fil - 0.2, s2.fil + 0.5);
      if (fk > 0) { figure({ x: 930, y: GROUND, s: 1.4, dir: -1, c: PINK, skirt: true, pose: IDLE, mood: 'sad', a: fk }); txt('FILHA', 930, 1090, 40, { color: PINK, a: fk }); swirl(930, 940, sm(t, s2.dem - 0.2, s2.dem + 0.5), t); }
    }
    function scene3(t) {
      const u = t - B[2];
      figure({ x: 300, y: GROUND, s: 2.3, c: CHALK, beard: true, pose: IDLE, mood: 'sad' });
      figure(Object.assign({ x: 110, y: GROUND, s: 1.9, pose: { legs: IDLE.legs, arms: [[2.5 + 0.3 * Math.sin(t * 8), 2.8], [-0.1, -0.1]] }, mood: 'sad' }, WOMAN));
      const sk = sm(t, s3.nao - 0.2, s3.nao + 0.4);
      if (sk > 0) { bubble(380, 560, 260, 150, '...', 90, sk, 320, 790, CHALK); txt('SEM RESPOSTA', 380, 400, 52, { color: RED, a: sm(t, s3.pal - 0.1, s3.pal + 0.4), stroke: 8 }); }
      const dk = sm(t, s3.dis - 0.3, s3.dis + 0.5, x => x);
      figure({ x: lerp(1150, 790, dk), y: GROUND, dir: -1, s: 2.2, c: BLUE, pose: dk < 1 ? walkP(t, 7) : { legs: IDLE.legs, arms: [[1.3, 1.7], [-0.1, -0.1]] } });
      figure({ x: lerp(1250, 940, dk), y: GROUND, dir: -1, s: 2.0, c: GREEN, pose: dk < 1 ? walkP(t + 1, 7) : { legs: IDLE.legs, arms: [[1.3, 1.6], [-0.1, -0.1]] } });
      if (t > s3.man - 0.1) say(750, 760, 520, 200, 'MANDA ELA\nEMBORA!', 56, prog(t, s3.man - 0.1, s3.man + 0.3), 790, 940, RED);
      if (t > s3.dis) txt('DISCÍPULOS', 860, 1470, 44, { color: BLUE, a: sm(t, s3.dis, s3.dis + 0.4) });
    }
    function scene4(t) {
      write('SÓ AS OVELHAS DE ISRAEL', 540, 190, 62, sm(t, s4.ove - 0.3, s4.ove + 0.9, x => x), { color: GOLD, stroke: 8 });
      figure({ x: 300, y: GROUND, s: 2.3, c: CHALK, beard: true, pose: { legs: IDLE.legs, arms: [[1.0 + 0.2 * Math.sin(t * 4), 1.5], [-0.1, -0.1]] }, mood: 'smile' });
      say(370, 520, 560, 190, 'FUI ENVIADO SÓ\nÀS OVELHAS', 52, prog(t, s4.dis - 0.1, s4.dis + 0.3), 320, 790, CHALK);
      [[690, 1], [820, 0.85], [930, 0.7]].forEach(([x, s], i) => sheep(x, GROUND, s * 1.3, sm(t, s4.ove - 0.1 + i * 0.12, s4.ove + 0.4 + i * 0.12)));
      const ak = sm(t, s4.aj - 0.2, s4.aj + 0.5);
      figure(Object.assign({ x: 560, y: GROUND + 60, s: 1.9, dir: -1, lean: 0.35 * ak, pose: { legs: [[1.2 * ak, 0.1], [0.6 * ak, -0.3]], arms: [[lerp(1.0, 2.4, ak), 2.8], [-0.1, -0.1]] }, mood: 'sad' }, WOMAN));
      if (t > s4.soc - 0.1) say(560, 1000, 520, 150, 'ME SOCORRE!', 60, prog(t, s4.soc - 0.1, s4.soc + 0.3), 560, 1150, PINK);
    }
    function scene5(t) {
      write('MATEUS 15:26', 540, 190, 62, sm(t, B[4] + 0.1, B[4] + 1, x => x), { color: GOLD, stroke: 8 });
      txt('A FRASE QUE CHOCA', 540, 300, 74, { color: RED, scale: outBack(prog(t, s5.fra - 0.1, s5.fra + 0.35)), stroke: 12 });
      tableP(300, 780, 1090, sm(t, B[4] + 0.2, B[4] + 0.9));
      const bk = sm(t, s5.pao - 0.2, s5.pao + 0.4); bread(540, 1090, 1.6, bk);
      if (t > s5.pao - 0.1) txt('O PÃO', 540, 880, 70, { color: GOLD, a: sm(t, s5.pao - 0.1, s5.pao + 0.3), stroke: 10 });
      [[150, GOLD], [250, BLUE]].forEach(([x, c], i) => figure({ x, y: GROUND, s: 1.5, c, dir: 1, mood: 'smile', pose: { legs: IDLE.legs, arms: [[0.5 + 0.2 * Math.sin(t * 4 + i), 1.2], [-0.1, -0.1]] }, a: sm(t, s5.fil - 0.2, s5.fil + 0.4) }));
      if (t > s5.fil - 0.1) txt('DOS FILHOS', 200, 930, 44, { color: GOLD, a: sm(t, s5.fil - 0.1, s5.fil + 0.3) });
      dog(900, GROUND, 1.55, t, CHALK, -1, sm(t, s5.cac - 0.4, s5.cac + 0.2));
      if (t > s5.jog) { const k = sm(t, s5.jog, s5.jog + 0.7, x => x); const bx = lerp(540, 860, k), by = lerp(1050, 1300, k) - Math.sin(k * Math.PI) * 220; bread(bx, by, 1.0, 1 - 0.0, RED); if (k > 0.9) poly([[760, 1130], [960, 1330]], prog(k, 0.9, 1), RED, 10, 41), poly([[960, 1130], [760, 1330]], prog(k, 0.9, 1), RED, 10, 42); }
      if (t > s5.cac - 0.1) txt('AOS CACHORRINHOS', 540, 1480, 60, { color: RED, a: sm(t, s5.cac - 0.1, s5.cac + 0.4), stroke: 10 });
    }
    function scene6(t) {
      write('A RESPOSTA DELA', 540, 190, 66, sm(t, B[5] + 0.1, B[5] + 1, x => x), { color: GOLD, stroke: 8 });
      figure(Object.assign({ x: 150, y: GROUND, s: 2.3, pose: { legs: IDLE.legs, arms: [[0.8, 1.4 + 0.2 * Math.sin(t * 5)], [-0.1, -0.1]] }, mood: 'smile', lean: 0.05 }, WOMAN));
      say(430, 520, 640, 250, 'ATÉ OS CACHORRINHOS\nCOMEM AS MIGALHAS', 46, prog(t, s6.ver - 0.1, s6.ver + 0.35), 200, 800, PINK);
      tableP(480, 960, 1030, sm(t, B[5] + 0.3, B[5] + 0.9)); bread(720, 1030, 1.3, sm(t, s6.mesa - 0.2, s6.mesa + 0.3));
      dog(720, GROUND, 1.5, t, CHALK, 1, sm(t, s6.cac - 0.3, s6.cac + 0.2));
      if (t > s6.mig) for (let i = 0; i < 6; i++) { const ph = ((t - s6.mig) * 0.9 + i * 0.17) % 1, x = 640 + i * 24 + (hash(i) - 0.5) * 20, y = lerp(1040, 1300, ph); ga(1 - ph * 0.5); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(x, y, 6 + hash(i + 3) * 3, 0, TAU); ctx.fill(); ga(1); }
      if (t > s6.mig - 0.1) txt('MIGALHAS', 720, 930, 54, { color: GOLD, a: sm(t, s6.mig - 0.1, s6.mig + 0.3), stroke: 8 });
      if (t > s6.don) txt('DOS DONOS', 540, 1480, 56, { color: CHALK, a: sm(t, s6.don, s6.don + 0.4), stroke: 8 });
    }
    function scene7(t) {
      const u = t - B[6];
      if (t > s7.gra - 0.1) { const k = sm(t, s7.gra - 0.1, s7.gra + 0.5, outBack); ctx.save(); ctx.globalAlpha = 0.5 * k; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; poly([[540 + Math.cos(a) * 260, 470 + Math.sin(a) * 200], [540 + Math.cos(a) * 400, 470 + Math.sin(a) * 310]], k, GOLD, 6, 400 + i, 0.8); } ctx.restore(); txt('GRANDE FÉ!', 540, 470, 140, { color: GOLD, scale: k, stroke: 14, rot: -0.03 }); }
      figure({ x: 300, y: GROUND, s: 2.3, dir: 1, c: CHALK, beard: true, pose: { legs: IDLE.legs, arms: [[1.0 + 0.2 * Math.sin(t * 4), 1.6], [-0.1, -0.1]] }, mood: 'smile' });
      figure(Object.assign({ x: 700, y: GROUND, s: 2.3, dir: -1, pose: { legs: IDLE.legs, arms: [[2.2 + 0.3 * Math.sin(t * 6), 2.7], [-0.1, -0.1]] }, mood: 'smile' }, WOMAN));
      if (t > s7.fei - 0.1) txt('SEJA FEITO COMO QUERES', 540, 690, 50, { color: CHALK, a: sm(t, s7.fei - 0.1, s7.fei + 0.5), stroke: 8 });
      const fk = sm(t, s7.fil - 0.2, s7.fil + 0.4), ck = sm(t, s7.cur - 0.2, s7.cur + 0.5);
      if (fk > 0) { figure({ x: 960, y: GROUND, s: 1.3, dir: -1, c: PINK, skirt: true, pose: ck > 0.5 ? { legs: IDLE.legs, arms: armsUp(t) } : IDLE, mood: ck > 0.5 ? 'smile' : 'sad', a: fk }); swirl(960, 1000, fk * (1 - ck), t); if (ck > 0) txt('♥', 960, 1010 - 40 * ck - 15 * Math.sin(t * 4), 66, { color: PINK, a: ck }); }
      if (t > s7.cur - 0.1) txt('CURADA', 800, 1480, 76, { color: GOLD, scale: outBack(prog(t, s7.cur - 0.1, s7.cur + 0.3)), stroke: 12 });
    }
    function scene8(t) {
      const u = t - B[7], sw = sm(t, s8.dois - 0.4, s8.dois + 0.2), A1 = 1 - sw;
      write('O DETALHE', 540, 190, 84, sm(t, s8.det - 0.1, s8.det + 0.8, x => x), { color: GOLD, stroke: 10 });
      if (A1 > 0.01) {
        ga(A1);
        poly([[540, 300], [540, 1400]], prog(u, 0.6, 1.2), CHALK, 6, 410);
        const rk = sm(t, s8.rua - 0.2, s8.rua + 0.4); dog(260, 1120, 1.6, t, CHALK, 1, rk); txt('DE RUA', 270, 560, 70, { color: CHALK, a: rk, stroke: 10 }); if (rk > 0.8 && t > s8.rua + 0.2) { poly([[110, 880], [430, 1160]], sm(t, s8.rua + 0.2, s8.rua + 0.55), RED, 14, 411); poly([[430, 880], [110, 1160]], sm(t, s8.rua + 0.5, s8.rua + 0.85), RED, 14, 412); }
        const ck = sm(t, s8.cas - 0.2, s8.cas + 0.4); txt('DE CASA', 810, 560, 70, { color: GOLD, a: ck, stroke: 10 }); tableP(630, 990, 960, ck); dog(810, GROUND, 1.5, t, CHALK, 1, ck);
        if (t > s8.mesa - 0.1) txt('EMBAIXO DA MESA', 810, 840, 40, { color: GOLD, a: sm(t, s8.mesa - 0.1, s8.mesa + 0.4) });
        ga(1);
      }
      if (sw > 0.01) {
        ga(sw);
        txt('TAMANHA FÉ', 540, 330, 100, { color: GOLD, stroke: 12, scale: outBack(prog(t, s8.dois, s8.dois + 0.4)) });
        txt('ESTRANGEIROS', 540, 440, 60, { color: RED, a: sm(t, s8.estr - 0.1, s8.estr + 0.4), stroke: 10 });
        const mk = sm(t, s8.mul - 0.2, s8.mul + 0.5), nk = sm(t, s8.cen - 0.2, s8.cen + 0.5);
        figure(Object.assign({ x: 290, y: GROUND, s: 2.4, pose: { legs: IDLE.legs, arms: armsUp(t) }, mood: 'smile', a: mk }, WOMAN)); txt('ELA', 290, 640, 64, { color: PINK, a: mk, stroke: 8 });
        figure({ x: 790, y: GROUND, s: 2.4, dir: -1, c: BLUE, pose: { legs: IDLE.legs, arms: [[1.0, 1.5], [-0.1, -0.1]] }, mood: 'smile', a: nk }); poly([[745, 1010], [790, 975], [835, 1010]], nk, BLUE, 8, 413); txt('CENTURIÃO', 790, 640, 64, { color: BLUE, a: nk, stroke: 8 });
        ga(1);
      }
    }
    function scene9(t) {
      const u = t - B[8]; splitBoard(t, B[8]);
      const lk = sm(t, s9.tes - 0.1, s9.tes + 0.4);
      txt('TESTE', 290, 240, 110, { color: GOLD, scale: outBack(lk), stroke: 12 });
      figure({ x: 220, y: GROUND, s: 2.0, c: CHALK, beard: true, pose: IDLE, mood: 'smile', a: sm(t, B[8] + 0.2, B[8] + 0.7) });
      figure(Object.assign({ x: 400, y: GROUND, s: 2.0, dir: -1, pose: { legs: IDLE.legs, arms: [[1.0, 1.5], [-0.1, -0.1]] }, mood: 'smile', a: sm(t, B[8] + 0.2, B[8] + 0.7) }, WOMAN));
      if (t > s9.fe - 0.1) { const k = sm(t, s9.fe - 0.1, s9.fe + 0.5); poly(circ(290, 760, 110, 24), k, GOLD, 8, 420); poly([[368, 838], [440, 910]], prog(k, 0.5, 1), GOLD, 12, 421); txt('FÉ', 290, 760, 90, { color: GOLD, a: k }); }
      const rk = sm(t, s9.out - 0.1, s9.out + 0.4);
      txt('MISSÃO', 800, 240, 100, { color: RED, scale: outBack(rk), stroke: 12 });
      if (t > s9.mis) { const k = sm(t, s9.mis, s9.mis + 0.8); poly([[800, 460], [800, 640]], k, RED, 9, 430); for (let i = 0; i < 5; i++) { const a = -0.3 + i * 0.6 - 0.9 + 0.9; const ang = (i - 2) * 0.55; poly([[800, 640], [800 + Math.sin(ang) * 170, 640 + Math.cos(ang) * 150]], prog(k, 0.3, 1), RED, 7, 431 + i); } }
      if (t > s9.pov - 0.1) { globe(800, 1000, 120, sm(t, s9.pov - 0.1, s9.pov + 0.6)); txt('TODOS OS POVOS', 800, 1180, 44, { color: BLUE, a: sm(t, s9.pov, s9.pov + 0.5), stroke: 8 }); }
      if (t > s9.dur - 0.1) txt('MAS A FRASE\nCONTINUA DURA'.split('\n')[0], 540, 1440, 52, { color: CHALK, a: sm(t, s9.dur - 0.1, s9.dur + 0.4), stroke: 8 }), txt('CONTINUA DURA', 540, 1500, 52, { color: RED, a: sm(t, s9.dur, s9.dur + 0.5), stroke: 8 });
    }
    function scene10(t) { ctaScene(t, B[9], { a: s10.tes, b: s10.dur, cmt: s10.cmt, ver: s10.ver, mar: s10.mar, seg: s10.seg, deb: s10.deb, am: s10.am }, 'TESTE', 'DURO DEMAIS', GOLD, RED, ['TODO DIA UM DEBATE DA FÉ', 'AMANHÃ: DEUS ENDURECEU O FARAÓ?', 56]); }
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10];
    cue(0.2, 'wind', { dur: 5 }); cue(s1.mul, 'pop'); cue(s1.cac, 'impact', { gain: 0.5 }); cue(s1.big, 'reveal');
    cue(B[1], 'swoosh'); cue(s2.sen, 'pop'); cue(s2.fil, 'pop'); cue(s2.dem, 'minus');
    cue(B[2], 'swoosh'); cue(s3.nao, 'pop'); cue(s3.pal, 'minus'); cue(s3.man, 'pop'); cue(s3.emb, 'error', { gain: 0.4 });
    cue(B[3], 'swoosh'); cue(s4.dis, 'pop'); cue(s4.ove, 'pop'); cue(s4.aj, 'plop'); cue(s4.soc, 'pop');
    cue(B[4], 'swoosh'); cue(s5.fra, 'impact', { gain: 0.5 }); cue(s5.pao, 'pop'); cue(s5.jog, 'whoosh'); cue(s5.cac, 'minus');
    cue(B[5], 'swoosh'); cue(s6.ver, 'pop'); cue(s6.mig, 'ding', { gain: 0.4 }); cue(s6.don, 'pop');
    cue(B[6], 'swoosh'); cue(s7.gra, 'reveal'); cue(s7.fei, 'pop'); cue(s7.cur, 'success');
    cue(B[7], 'swoosh'); cue(s8.det, 'pop'); cue(s8.rua + 0.3, 'minus'); cue(s8.cas, 'pop'); cue(s8.dois, 'reveal'); cue(s8.mul, 'pop'); cue(s8.cen, 'pop');
    cue(B[8], 'swoosh'); cue(s9.tes, 'pop'); cue(s9.fe, 'ding', { gain: 0.5 }); cue(s9.out, 'pop'); cue(s9.pov, 'reveal'); cue(s9.dur, 'minus');
    cue(B[9], 'swoosh'); cue(s10.tes, 'pop'); cue(s10.dur, 'pop'); cue(s10.cmt, 'sms'); cue(s10.mar, 'pop'); cue(s10.seg + 0.3, 'success');
    // ---------------- legendas (palavra a palavra) ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 62, words = g.map(w => w.text.replace(/[.,!?:]$/, '').toUpperCase()), ws = words.map(s => tw(s, size)), sp = 18, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), pop = 0.92 + 0.08 * outBack(prog(t, g.t0, g.t0 + 0.12));
      ctx.save(); ctx.translate(540, 1690); ctx.scale(pop, pop); let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; txt(words[i], x + ws[i] / 2, 0, size, { color: cur ? GOLD : '#ffffff', stroke: 14, sc: 'rgba(0,0,0,0.92)' }); x += ws[i] + sp; }); ctx.restore();
    }

    cues.sort((a, b) => a.t - b.t);
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(bgc, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); ctx.beginPath(); ctx.rect(34, 34, W - 68, H - 68); ctx.clip();
      const sh = shake(t); if (sh > 0.1) ctx.translate((hash(Math.floor(t * 40)) - 0.5) * sh, (hash(Math.floor(t * 40) + 9) - 0.5) * sh);
      sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      const u = t - B[i]; if (i > 0 && u < 0.35) { const k = u / 0.35, ex = W * k; ctx.save(); ctx.beginPath(); ctx.rect(ex, 34, W - ex - 34, H - 68); ctx.clip(); ctx.drawImage(bgc, 0, 0); ctx.restore(); ctx.save(); ctx.fillStyle = '#d8cdb0'; rr(ex - 70, 700, 110, 420, 18); ctx.fill(); ctx.fillStyle = '#3a2a1a'; rr(ex - 70, 1060, 110, 60, 14); ctx.fill(); ctx.restore(); }
      ctx.drawImage(FRAME, 0, 0);
      captions(t);
    }
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
