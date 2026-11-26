/*
 * "A BÍBLIA QUE NINGUÉM PREGA: ANANIAS E SAFIRA" (Atos 5:1-11), DEBATE em LOUSA DE GIZ ANIMADA, 9:16 (perfil cristão @e_cosdafe).
 * Bonequinhos de giz atuam cada cena (nada de texto parado): caem, andam, aplaudem, discutem. Tudo desenhado por código.
 * Cenas = clips c1..c8 (narração). Eventos presos às palavras com wt(clip, palavra).
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

    // ---------------- âncoras das palavras ----------------
    const s1 = { cas: wt('c1', 'casal'), igr: wt('c1', 'igreja'), din: wt('c1', 'dinheiro'), mor: wt('c1', 'morto'), deu: wt('c1', 'deus'), mat: wt('c1', 'matou'), men: wt('c1', 'mentira') };
    const s2 = { ato: wt('c2', 'atos'), nov: wt('c2', 'nova'), rep: wt('c2', 'repartiam'), bar: wt('c2', 'barnabe'), cam: wt('c2', 'campo'), ent: wt('c2', 'entregou'), apo: wt('c2', 'apostolos'), apl: wt('c2', 'aplaudiu') };
    const s3 = { ana: wt('c3', 'ananias'), ven: wt('c3', 'venderam'), com: wt('c3', 'combinaram'), seg: wt('c3', 'segredo'), par: wt('c3', 'parte'), diz: wt('c3', 'dizer'), tud: wt('c3', 'tudo') };
    const s4 = { poe: wt('c4', 'poe'), ped: wt('c4', 'pedro'), men: wt('c4', 'mentiu'), hom: wt('c4', 'homens'), deu: wt('c4', 'deus'), cai: wt('c4', 'cai'), mor: wt('c4', 'morto') };
    const s5 = { tre: wt('c5', 'tres'), saf: wt('c5', 'safira'), che: wt('c5', 'chega'), ped: wt('c5', 'pedro'), val: wt('c5', 'valor'), rep: wt('c5', 'repete'), men: wt('c5', 'mentira'), cai: wt('c5', 'cai'), mar: wt('c5', 'marido') };
    const s6 = { det: wt('c6', 'detalhe'), ped: wt('c6', 'pedro'), ter: wt('c6', 'terreno'), del: wt('c6', 'deles'), nin: wt('c6', 'ninguem'), obr: wt('c6', 'obrigado'), pec: wt('c6', 'pecado'), gua: wt('c6', 'guardar'), fin: wt('c6', 'fingir'), ger: wt('c6', 'generosidade') };
    const s7 = { cri: wt('c7', 'cristao'), jus: wt('c7', 'justo'), com: wt('c7', 'comeco'), out: wt('c7', 'outro'), dur: wt('c7', 'duro'), cha: wt('c7', 'chance'), arr: wt('c7', 'arrepender') };
    const s8 = { voc: wt('c8', 'voce'), jus: wt('c8', 'justo'), dur: wt('c8', 'duro'), cmt: wt('c8', 'comenta'), ver: wt('c8', 'versiculo'), mar: wt('c8', 'marca'), dis: wt('c8', 'discordar'), seg: wt('c8', 'segue'), deb: wt('c8', 'debate') };

    // ---------------- cenas ----------------
    function scene1(t) {
      const sx = t > s1.mor ? 0 : 0;
      write('ATOS 5:1-11', 540, 170, 62, sm(t, 0.2, 1.0, x => x), { color: GOLD });
      church(640, GROUND, prog(t, 0.1, 1.6));
      const k = sm(t, 0.2, s1.mor - 0.15, x => x), mx = lerp(-120, 330, k), fx = lerp(-300, 170, k), walking = t < s1.mor - 0.15, fall = prog(t, s1.mor, s1.mor + 0.45);
      const pm = walking ? walkP(t) : IDLE;
      const hm = figure({ x: mx, y: GROUND, c: BLUE, pose: Object.assign({}, pm, { arms: walking ? [[0.6, 1.3], pm.arms[1]] : [[0.5, 1.2], [-0.12, -0.1]] }), fall, dir: 1, mood: fall ? 'shock' : 'smile' });
      const hf = figure({ x: fx, y: GROUND, c: PINK, pose: Object.assign({}, pm, { arms: walking ? [[0.6, 1.3], pm.arms[0]] : [[0.5, 1.2], [-0.12, -0.1]] }), skirt: true, bun: true, fall, dir: 1, mood: fall ? 'shock' : 'smile' });
      if (!fall) { sack(hm.hands[0][0] + 10, hm.hands[0][1] + 36, 0.5, GOLD, sm(t, s1.din - 0.5, s1.din - 0.1)); sack(hf.hands[0][0] + 10, hf.hands[0][1] + 36, 0.45, GOLD, sm(t, s1.din - 0.4, s1.din)); }
      if (fall > 0.2) { for (let i = 0; i < 6; i++) coin(mx + 80 + i * 40, GROUND - 20 - Math.abs(Math.sin(i * 2 + 1)) * 30 * (1 - fall * 0.2), 16, outBack(prog(t, s1.mor + 0.1 + i * 0.05, s1.mor + 0.4 + i * 0.05))); }
      dust(mx + 60, GROUND - 10, s1.mor + 0.2, t, 12);
      txt('MORRERAM?', 540, 560, 118, { color: RED, scale: outBack(prog(t, s1.mor - 0.05, s1.mor + 0.35)), rot: -0.04, stroke: 12 });
      write('FOI DEUS?', 540, 780, 130, sm(t, s1.deu - 0.1, s1.deu + 0.6, x => x), { color: GOLD, stroke: 12 });
      if (t > s1.men) { write('POR UMA MENTIRA?', 540, 1000, 80, sm(t, s1.men - 0.1, s1.men + 0.8, x => x), { color: CHALK, stroke: 10 }); poly([[200, 1050], [880, 1048]], sm(t, s1.men + 0.6, s1.men + 1.1), RED, 10, 77); }
    }
    function scene2(t) {
      const u = t - B[1];
      write('NO COMEÇO DA IGREJA', 540, 190, 60, sm(t, B[1] + 0.2, B[1] + 1.2, x => x), { color: GOLD });
      // mesa dos apóstolos
      poly([[720, 1230], [1010, 1230]], prog(u, 0.2, 0.8), CHALK, 8, 41); poly([[750, 1230], [750, GROUND]], prog(u, 0.4, 0.9), CHALK, 7, 42); poly([[980, 1230], [980, GROUND]], prog(u, 0.4, 0.9), CHALK, 7, 43);
      figure({ x: 800, y: GROUND, dir: -1, s: 1.9, c: GOLD, mood: 'smile' }); figure({ x: 930, y: GROUND, dir: -1, s: 1.9, c: GOLD, mood: 'smile' });
      // multidão repartindo
      for (let i = 0; i < 3; i++) { const p = sm(t, s2.rep + i * 0.25 - 0.2, s2.rep + 0.4 + i * 0.25), x = lerp(-80 + i * 40, 150 + i * 150, p); figure({ x, y: GROUND - 20 - i * 6, s: 1.6, c: [PINK, GREEN, CHALK][i], pose: p < 1 ? walkP(t + i, 9) : { legs: IDLE.legs, arms: [[1.6 + 0.2 * Math.sin(t * 5 + i), 1.8], [-0.1, -0.1]] }, a: 0.55 + 0.45 * p }); coin(x + 38, GROUND - 255 - i * 6 - 20 * Math.sin(t * 4 + i), 14, sm(t, s2.rep + i * 0.25, s2.rep + 0.3 + i * 0.25), GOLD); }
      // campo vira dinheiro
      const fk = sm(t, s2.cam - 0.3, s2.cam + 0.7, x => x);
      if (fk > 0 && t < s2.ent + 0.3) { const fx = 330, fy = 520; poly(box(fx, fy, 320, 190), fk, GREEN, 7, 51); for (let i = 1; i < 5; i++) poly([[fx + 10, fy + i * 38], [fx + 310, fy + i * 38 - 6]], prog(fk, i * 0.15, 1), GREEN, 4, 52 + i); txt('CAMPO', fx + 160, fy - 36, 52, { color: GREEN, a: fk }); }
      const bk = sm(t, s2.bar - 0.4, s2.ent + 0.1, x => x), bx = lerp(-100, 640, bk), bw = bk < 1 ? walkP(t * 1.1, 8) : IDLE;
      const bh = figure({ x: bx, y: GROUND, c: BLUE, s: 2.4, pose: Object.assign({}, bw, { arms: [[0.7, 1.4], bw.arms[1]] }), mood: 'smile' });
      const sk = sm(t, s2.cam + 0.4, s2.cam + 1.0); sack(bh.hands[0][0] + 12, bh.hands[0][1] + 40, 0.55, GOLD, sk);
      if (t > s2.ent) { const dk = sm(t, s2.ent, s2.ent + 0.6); for (let i = 0; i < 8; i++) coin(lerp(bx + 80, 790, outC(dk)) + (i % 4) * 14, lerp(900, 1190, dk * dk) - Math.sin(dk * Math.PI) * 90 - (i >> 2) * 30, 17, sm(t, s2.ent + i * 0.04, s2.ent + 0.25 + i * 0.04)); }
      // aplausos
      if (t > s2.apl - 0.2) { txt('👏'.length ? 'APLAUSOS!' : '', 540, 360, 96, { color: GOLD, scale: outBack(prog(t, s2.apl - 0.1, s2.apl + 0.3)) * (1 + 0.04 * Math.sin(t * 14)), rot: -0.05, stroke: 12 }); for (let i = 0; i < 6; i++) { const a = -0.8 + i * 0.3; poly([[540 + Math.cos(a - 0.5) * 380, 360 + Math.sin(a - 0.5) * 120 - 20], [540 + Math.cos(a - 0.5) * 430, 360 + Math.sin(a - 0.5) * 140 - 30]], prog(t, s2.apl, s2.apl + 0.3), GOLD, 6, 60 + i); } }
    }
    function scene3(t) {
      const u = t - B[2];
      write('ANANIAS E SAFIRA', 540, 180, 66, sm(t, B[2] + 0.1, B[2] + 1.0, x => x), { color: GOLD });
      // casa vendida
      const hk = sm(t, s3.ven - 0.4, s3.ven + 0.6, x => x); poly([[120, 560], [120, 440], [60, 440], [190, 330], [320, 440], [260, 440], [260, 560], [120, 560]], hk, CHALK, 7, 71);
      if (t > s3.ven + 0.3) txt('VENDIDA', 190, 640, 52, { color: RED, rot: -0.12, scale: outBack(prog(t, s3.ven + 0.3, s3.ven + 0.6)), stroke: 8 });
      // mesa e saco
      poly([[300, 1230], [780, 1230]], prog(u, 0.1, 0.6), CHALK, 8, 72); poly([[330, 1230], [330, GROUND]], prog(u, 0.2, 0.7), CHALK, 7, 73); poly([[750, 1230], [750, GROUND]], prog(u, 0.2, 0.7), CHALK, 7, 74);
      sack(540, 1155, 1.05, GOLD, sm(t, s3.ven, s3.ven + 0.5));
      const lean = 0.18 * sm(t, s3.com - 0.3, s3.com + 0.4);
      figure({ x: 200, y: GROUND, dir: 1, c: BLUE, lean, mood: t > s3.diz ? 'smile' : undefined, pose: { legs: IDLE.legs, arms: [[0.9, 1.5], [-0.1, -0.1]] } });
      const fh = figure({ x: 880, y: GROUND, dir: -1, c: PINK, skirt: true, bun: true, lean, mood: t > s3.diz ? 'smile' : undefined, pose: { legs: IDLE.legs, arms: [[0.9, 1.5], [-0.1, -0.1]] } });
      // moedas: metade vai pro bolso escondido
      const pk = sm(t, s3.par - 0.3, s3.par + 0.9, x => x);
      for (let i = 0; i < 6; i++) { const home = [470 + (i % 3) * 50, 1060 - (i >> 1) * 8 * 0 - (i >> 2) * 0]; if (i < 3) coin(home[0], 1050 - Math.abs(Math.sin(t * 3 + i)) * 4, 20, sm(t, s3.ven + 0.2 + i * 0.1, s3.ven + 0.5 + i * 0.1)); else { const ax = lerp(home[0], 880, pk), ay = lerp(1050, 960 - 200 * Math.sin(pk * Math.PI), pk) + 0; coin(ax, pk > 0 ? ay + 80 * pk * pk : 1050, 20, sm(t, s3.ven + 0.2 + i * 0.1, s3.ven + 0.5 + i * 0.1)); } }
      if (t > s3.par) { sack(fh.hands[0][0] - 20, fh.hands[0][1] + 40, 0.38, RED, sm(t, s3.par, s3.par + 0.5), '$'); }
      if (t > s3.com && t < s3.par + 0.2) { txt('psiu...', 540, 760, 70, { color: CHALK, w: 700, a: 0.9, rot: -0.04 }); }
      txt('SÓ UMA PARTE', 540, 420, 100, { color: RED, scale: outBack(prog(t, s3.par - 0.05, s3.par + 0.35)), stroke: 12, rot: -0.03 });
      if (t > s3.tud - 0.1) { bubble(300, 800, 360, 130, 'É TUDO!', 70, prog(t, s3.tud - 0.1, s3.tud + 0.25), 230, 940, GOLD); txt('MENTIRA', 540, 560, 92, { color: RED, a: sm(t, s3.tud + 0.2, s3.tud + 0.6), stroke: 12 }); }
    }
    function scene4(t) {
      const u = t - B[3];
      write('PEDRO x ANANIAS', 540, 180, 62, sm(t, B[3] + 0.1, B[3] + 1.0, x => x), { color: GOLD });
      for (let i = 0; i < 2; i++) figure({ x: 920 + i * 90, y: GROUND - 10 - i * 10, dir: -1, s: 1.8, c: GOLD, a: 0.5, mood: 'shock' });
      const ph = figure({ x: 790, y: GROUND, dir: -1, c: GOLD, beard: true, mood: t > s4.ped ? 'shock' : undefined, pose: { legs: IDLE.legs, arms: t > s4.ped ? [[-1.5, -1.6], [-0.1, -0.1]] : IDLE.arms } });
      const ak = sm(t, B[3] + 0.1, s4.poe - 0.1, x => x), ax = lerp(-100, 270, ak), fall = prog(t, s4.cai, s4.cai + 0.5), aw = ak < 1 ? walkP(t, 8) : IDLE;
      const ah = figure({ x: ax, y: GROUND, c: BLUE, pose: Object.assign({}, aw, { arms: [[0.9, 1.4], aw.arms[1]] }), fall, mood: fall ? 'shock' : 'sad' });
      const dk = prog(t, s4.poe - 0.1, s4.poe + 0.45), sy = lerp(GROUND - 250, GROUND - 38, dk * dk) - (dk > 0 ? Math.abs(Math.sin(dk * 7)) * 22 * (1 - dk) : 0);
      sack(t < s4.poe - 0.1 ? ah.hands[0][0] + 12 : 480, t < s4.poe - 0.1 ? ah.hands[0][1] + 40 : sy, 0.6, GOLD, 1 - fall * 0.0);
      if (t > s4.ped) bubble(640, 640, 560, 140, 'POR QUE\nMENTISTE?', 52, prog(t, s4.ped, s4.ped + 0.3), 760, 800, GOLD);
      if (t > s4.hom - 0.2) { write('NÃO FOI AOS HOMENS', 540, 360, 62, sm(t, s4.hom - 0.2, s4.hom + 0.6, x => x), { color: CHALK, stroke: 10 }); poly([[150, 360], [930, 358]], sm(t, s4.hom + 0.4, s4.hom + 0.8), RED, 9, 81); }
      if (t > s4.deu - 0.1) { const k = prog(t, s4.deu - 0.1, s4.deu + 0.35); txt('MAS A DEUS', 540, 500, 110, { color: GOLD, scale: outBack(k), stroke: 12 }); for (let i = 0; i < 9; i++) { const a = -Math.PI + i * Math.PI / 8; poly([[540 + Math.cos(a) * 470, 500 + Math.sin(a) * 120 - 60], [540 + Math.cos(a) * 520, 500 + Math.sin(a) * 150 - 70]], prog(t, s4.deu + 0.1, s4.deu + 0.45), GOLD, 5, 90 + i); } }
      if (fall > 0) { ga(1 - prog(t, s4.cai, s4.cai + 0.25)); ctx.fillStyle = '#fff'; ga(0.6 * (1 - prog(t, s4.cai, s4.cai + 0.3))); ctx.fillRect(0, 0, W, H); ga(1); shakeAmt = 14 * (1 - prog(t, s4.cai, s4.cai + 0.5)); dust(ax + 100, GROUND - 10, s4.cai + 0.2, t, 12); }
    }
    function scene5(t) {
      const u = t - B[4];
      // relógio: três horas
      const ck = sm(t, B[4] + 0.1, B[4] + 0.8, x => x), ang = lerp(0, TAU * 3, sm(t, s5.tre, s5.tre + 1.8, inOut));
      clockFace(540, 360, 150, ang, ck); txt('3 HORAS DEPOIS', 540, 620, 66, { color: GOLD, a: sm(t, s5.tre - 0.1, s5.tre + 0.4), stroke: 10 });
      // Ananias já caído
      figure({ x: 560, y: GROUND, c: BLUE, fall: 1, a: 0.85, dead: true });
      figure({ x: 940, y: GROUND, dir: -1, c: GOLD, beard: true, mood: 'shock', pose: { legs: IDLE.legs, arms: t > s5.ped ? [[-1.5, -1.6], [-0.1, -0.1]] : IDLE.arms } });
      const sk = sm(t, s5.saf - 0.1, s5.che + 0.6, x => x), sx = lerp(-100, 250, sk), swk = sk < 1 ? walkP(t, 8) : IDLE, fall = prog(t, s5.cai, s5.cai + 0.5);
      figure({ x: sx, y: GROUND, c: PINK, skirt: true, bun: true, pose: swk, fall, mood: fall ? 'shock' : 'smile' });
      if (t > s5.ped && t < s5.rep) bubble(700, 800, 540, 130, 'FOI ESSE\nO VALOR?', 52, prog(t, s5.ped, s5.ped + 0.3), 880, 930, GOLD);
      if (t > s5.rep - 0.1) { bubble(300, 900, 520, 120, '"SIM, POR TANTO."', 46, prog(t, s5.rep - 0.1, s5.rep + 0.2), 270, 1010, RED); txt('MESMA MENTIRA', 540, 700, 80, { color: RED, a: sm(t, s5.men - 0.1, s5.men + 0.4), stroke: 10 }); }
      if (fall > 0) { ga(0.5 * (1 - prog(t, s5.cai, s5.cai + 0.3))); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ga(1); shakeAmt = 14 * (1 - prog(t, s5.cai, s5.cai + 0.5)); dust(sx + 100, GROUND - 10, s5.cai + 0.2, t, 12); }
      if (t > s5.mar) txt('JUNTOS', 540, 1130, 90, { color: CHALK, scale: outBack(prog(t, s5.mar, s5.mar + 0.4)), stroke: 12 });
    }
    function scene6(t) {
      const u = t - B[5];
      write('O DETALHE QUE QUASE', 540, 170, 58, sm(t, B[5] + 0.1, B[5] + 0.9, x => x), { color: GOLD }); write('NINGUÉM CONTA', 540, 245, 58, sm(t, B[5] + 0.6, B[5] + 1.3, x => x), { color: GOLD });
      // terreno deles
      const fk = sm(t, s6.ter - 0.2, s6.ter + 0.7, x => x); poly(box(130, 360, 820, 220), fk, GREEN, 8, 101); for (let i = 1; i < 6; i++) poly([[150, 360 + i * 36], [930, 360 + i * 36 - 8]], prog(fk, i * 0.12, 1), GREEN, 4, 102 + i);
      if (t > s6.del - 0.1) txt('DELES', 540, 470, 150, { color: CHALK, scale: outBack(prog(t, s6.del - 0.1, s6.del + 0.3)), stroke: 14, rot: -0.04 });
      // ninguém obrigado
      if (t > s6.nin - 0.1) { write('NINGUÉM ERA OBRIGADO', 540, 720, 66, sm(t, s6.nin - 0.1, s6.obr + 0.6, x => x), { color: CHALK, stroke: 10 }); poly([[210, 765], [870, 762]], sm(t, s6.obr + 0.2, s6.obr + 0.7), GOLD, 8, 111); }
      // pecado
      if (t > s6.pec - 0.1) { const pk = sm(t, s6.pec - 0.1, s6.pec + 0.4); txt('O PECADO NÃO FOI', 540, 880, 54, { color: GOLD, a: pk });
        if (t > s6.gua - 0.1) { txt('GUARDAR $', 300, 1000, 66, { color: CHALK, a: sm(t, s6.gua - 0.1, s6.gua + 0.3), stroke: 10 }); poly([[110, 1000], [500, 996]], sm(t, s6.gua + 0.5, s6.gua + 0.9), RED, 10, 112); poly([[130, 960], [480, 1040]], sm(t, s6.gua + 0.6, s6.gua + 1.0), RED, 10, 113); } }
      if (t > s6.fin - 0.2) { const fk2 = sm(t, s6.fin - 0.2, s6.fin + 0.4); txt('FINGIR', 770, 1000, 100, { color: RED, a: fk2, scale: 1 + 0.03 * Math.sin(t * 8), stroke: 12 }); poly([[560, 1060], [980, 1056]], sm(t, s6.fin + 0.2, s6.fin + 0.6), RED, 10, 114); poly(circ(770, 1000, 215, 40).map(([x, y]) => [x, (y - 1000) * 0.32 + 1000]), sm(t, s6.fin + 0.3, s6.fin + 0.9), GOLD, 7, 115); }
      // máscara de generosidade
      if (t > s6.ger - 0.3) { const mk2 = sm(t, s6.ger - 0.3, s6.ger + 0.4), hh = figure({ x: 540, y: GROUND, c: CHALK, a: mk2, mood: 'sad', pose: { legs: IDLE.legs, arms: [[0.3, 0.6], [-0.3, -0.5]] } }); const [mx, my] = hh.head; ctx.save(); ctx.globalAlpha = mk2; poly(circ(mx + 30, my, 44, 20), 1, GOLD, 6, 120); ctx.fillStyle = BOARD; ctx.beginPath(); ctx.arc(mx + 30, my, 41, 0, TAU); ctx.fill(); poly([[mx + 14, my - 10], [mx + 20, my - 10]], 1, GOLD, 6, 121); poly([[mx + 38, my - 10], [mx + 44, my - 10]], 1, GOLD, 6, 122); ctx.strokeStyle = GOLD; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(mx + 30, my + 4, 18, 0.2, Math.PI - 0.2); ctx.stroke(); ctx.restore(); txt('GENEROSIDADE FALSA', 540, 1450, 52, { color: GOLD, a: mk2, stroke: 10 }); }
    }
    function scene7(t) {
      const u = t - B[6];
      poly([[540, 160], [540, 1540]], prog(u, 0.1, 0.7), CHALK, 8, 131); txt('x', 540, 860, 80, { color: CHALK, a: prog(u, 0.4, 0.8), w: 700 });
      // esquerda: JUSTO
      write('JUSTO', 290, 250, 100, sm(t, s7.jus - 0.2, s7.jus + 0.5, x => x), { color: GOLD, stroke: 12 });
      const tilt = Math.sin(t * 2) * 0.05; ctx.save(); ctx.translate(290, 720); ctx.rotate(tilt); poly([[-150, 0], [150, 0]], sm(t, s7.jus, s7.jus + 0.5), GOLD, 8, 132); poly([[-150, 0], [-190, 110], [-110, 110], [-150, 0]], sm(t, s7.jus + 0.2, s7.jus + 0.7), GOLD, 6, 133); poly([[150, 0], [110, 110], [190, 110], [150, 0]], sm(t, s7.jus + 0.2, s7.jus + 0.7), GOLD, 6, 134); ctx.restore(); poly([[290, 720], [290, 1000]], sm(t, s7.jus, s7.jus + 0.5), GOLD, 8, 135);
      figure({ x: 230, y: GROUND, s: 2.3, c: GOLD, pose: { legs: IDLE.legs, arms: [[1.2 + 0.2 * Math.sin(t * 6), 1.5], [-0.1, -0.1]] }, mood: 'smile' });
      if (t > s7.com - 0.3) bubble(290, 1000, 440, 120, 'COMEÇO DA\nIGREJA', 44, prog(t, s7.com - 0.3, s7.com), 250, 1075, GOLD);
      // direita: DURO DEMAIS
      write('DURO DEMAIS', 810, 250, 66, sm(t, s7.dur - 0.2, s7.dur + 0.6, x => x), { color: RED, stroke: 12 });
      const ck = sm(t, s7.dur, s7.dur + 0.6); clockFace(810, 650, 130, lerp(0, TAU * 1.2, sm(t, s7.cha - 0.2, s7.arr + 0.8, x => x)), ck);
      if (t > s7.cha) poly([[690, 540], [930, 770]], sm(t, s7.arr, s7.arr + 0.5), RED, 10, 136);
      figure({ x: 850, y: GROUND, s: 2.3, dir: -1, c: RED, pose: { legs: IDLE.legs, arms: [[1.0, 1.6], [-0.2 + 0.2 * Math.sin(t * 5), -0.3]] }, mood: 'sad' });
      if (t > s7.cha - 0.3) bubble(800, 1000, 440, 120, t > s7.arr ? 'SEM TEMPO DE\nARREPENDER' : 'SEM\nCHANCE', 40, prog(t, s7.cha - 0.3, s7.cha), 840, 1075, RED);
    }
    function scene8(t) {
      const u = t - B[7];
      txt('E VOCÊ?', 540, 230, 150, { color: GOLD, scale: outBack(prog(t, B[7] + 0.15, B[7] + 0.6)), stroke: 14 });
      const jk = prog(t, s8.jus - 0.1, s8.jus + 0.3), dk = prog(t, s8.dur - 0.1, s8.dur + 0.3);
      txt('JUSTO', 290, 520, 120, { color: GOLD, scale: outBack(jk) * (1 + 0.02 * Math.sin(t * 6)), stroke: 14 }); txt('ou', 540, 520, 56, { color: CHALK, w: 700, a: jk }); txt('DURO', 790, 520, 120, { color: RED, scale: outBack(dk) * (1 + 0.02 * Math.sin(t * 6 + 1)), stroke: 14 }); txt('DEMAIS?', 790, 640, 70, { color: RED, scale: outBack(dk), stroke: 10 });
      // balão de comentário
      const ck = sm(t, s8.cmt - 0.1, s8.cmt + 0.4, outBack); if (ck > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(ck, ck); ctx.fillStyle = 'rgba(14,30,22,0.9)'; ctx.strokeStyle = CHALK; ctx.lineWidth = 7; rr(-300, -90, 600, 180, 50); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-60, 90); ctx.lineTo(-100, 150); ctx.lineTo(0, 90); ctx.fill(); ctx.stroke(); ctx.restore(); txt('COMENTA', 540, 870, 70, { color: CHALK, a: ck }); txt('+ O VERSÍCULO', 540, 945, 46, { color: GOLD, a: sm(t, s8.ver - 0.1, s8.ver + 0.3) }); }
      // marca quem discorda
      if (t > s8.mar - 0.1) { const mk3 = sm(t, s8.mar - 0.1, s8.mar + 0.4, outBack); txt('MARCA QUEM', 540, 1130, 78, { color: CHALK, scale: mk3, stroke: 12 }); txt('VAI DISCORDAR', 540, 1225, 78, { color: RED, scale: mk3, stroke: 12 }); }
      figure({ x: 130, y: GROUND + 60, s: 1.45, c: PINK, skirt: true, bun: true, a: 0.9, pose: { legs: IDLE.legs, arms: [[2.2 + 0.4 * Math.sin(t * 7), 2.6], [-0.1, -0.1]] } }); figure({ x: 950, y: GROUND + 60, s: 1.45, dir: -1, c: BLUE, a: 0.9, pose: { legs: IDLE.legs, arms: [[2.2 + 0.4 * Math.sin(t * 7 + 1), 2.6], [-0.1, -0.1]] } });
      const bk = sm(t, s8.seg - 0.3, s8.seg + 0.1, outBack), press = t > s8.seg + 0.3;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1390); ctx.scale(bk, bk); ctx.fillStyle = press ? 'rgba(14,30,22,0.9)' : GOLD; rr(-290, -52, 580, 104, 52); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = GOLD; ctx.stroke(); ctx.restore(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR @e_cosdafe', 540, 1393, 46 * bk, { color: press ? GOLD : '#14291f' }); }
      txt('TODO DIA UM DEBATE DA FÉ', 540, 1530, 46, { color: CHALK, a: sm(t, s8.deb - 0.1, s8.deb + 0.4) });
    }

    // ---------------- cues (sons de cena reais) ----------------
    cue(0.2, 'wind', { dur: 5 }); cue(s1.cas, 'tap'); cue(s1.din, 'coin'); cue(s1.mor, 'impact', { gain: 0.8 }); cue(s1.mor + 0.1, 'crack'); cue(s1.deu, 'reveal'); cue(s1.men, 'impact', { gain: 0.5 });
    cue(B[1], 'swoosh'); cue(s2.rep, 'swoosh'); cue(s2.cam, 'pop'); cue(s2.ent, 'coin'); cue(s2.apl, 'tada', { gain: 0.6 });
    cue(B[2], 'swoosh'); cue(s3.ven, 'coin'); cue(s3.com, 'whoosh'); cue(s3.par, 'coin'); cue(s3.tud, 'pop'); cue(s3.tud + 0.3, 'error', { gain: 0.5 });
    cue(B[3], 'swoosh'); cue(s4.poe, 'plop'); cue(s4.ped, 'pop'); cue(s4.deu, 'reveal'); cue(s4.cai, 'impact', { gain: 0.9 }); cue(s4.cai + 0.05, 'crack');
    cue(B[4], 'swoosh'); cue(s5.tre, 'riser', { dur: 1.8 }); cue(s5.ped, 'pop'); cue(s5.rep, 'error', { gain: 0.6 }); cue(s5.cai, 'impact', { gain: 0.9 }); cue(s5.mar, 'minus');
    cue(B[5], 'swoosh'); cue(s6.ter, 'reveal'); cue(s6.obr, 'ding', { gain: 0.5 }); cue(s6.gua, 'swoosh'); cue(s6.fin, 'impact', { gain: 0.6 }); cue(s6.ger, 'riser', { dur: 0.8 });
    cue(B[6], 'swoosh'); cue(s7.jus, 'pop'); cue(s7.dur, 'pop'); cue(s7.cha, 'minus');
    cue(B[7], 'swoosh'); cue(s8.voc, 'impact', { gain: 0.5 }); cue(s8.jus, 'pop'); cue(s8.dur, 'pop'); cue(s8.cmt, 'sms'); cue(s8.mar, 'pop'); cue(s8.seg + 0.3, 'success');

    // ---------------- legendas (palavra a palavra) ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 62, words = g.map(w => w.text.replace(/[.,!?:]$/, '').toUpperCase()), ws = words.map(s => tw(s, size)), sp = 18, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), pop = 0.92 + 0.08 * outBack(prog(t, g.t0, g.t0 + 0.12));
      ctx.save(); ctx.translate(540, 1690); ctx.scale(pop, pop); let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; txt(words[i], x + ws[i] / 2, 0, size, { color: cur ? GOLD : '#ffffff', stroke: 14, sc: 'rgba(0,0,0,0.92)' }); x += ws[i] + sp; }); ctx.restore();
    }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8];
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(bgc, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      shakeAmt = 0; ctx.save(); ctx.beginPath(); ctx.rect(34, 34, W - 68, H - 68); ctx.clip();
      // a tremida precisa ser conhecida antes de desenhar: calcula pelas cenas 4 e 5
      const pre = (i === 3 ? 14 * (1 - prog(t, s4.cai, s4.cai + 0.5)) * (t >= s4.cai ? 1 : 0) : i === 4 ? 14 * (1 - prog(t, s5.cai, s5.cai + 0.5)) * (t >= s5.cai ? 1 : 0) : 0);
      if (pre > 0.1) ctx.translate((hash(Math.floor(t * 40)) - 0.5) * pre, (hash(Math.floor(t * 40) + 9) - 0.5) * pre);
      sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      // borracha varre a lousa na troca de cena
      const u = t - B[i]; if (i > 0 && u < 0.35) { const k = u / 0.35, ex = W * k; ctx.save(); ctx.beginPath(); ctx.rect(ex, 34, W - ex - 34, H - 68); ctx.clip(); ctx.drawImage(bgc, 0, 0); ctx.restore(); ctx.save(); ctx.fillStyle = '#d8cdb0'; rr(ex - 70, 700, 110, 420, 18); ctx.fill(); ctx.fillStyle = '#3a2a1a'; rr(ex - 70, 1060, 110, 60, 14); ctx.fill(); ctx.restore(); }
      ctx.drawImage(FRAME, 0, 0);
      captions(t);
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
