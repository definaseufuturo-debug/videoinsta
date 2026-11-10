/*
 * LIVRE — curta animado narrado, 16:9 (1920x1080), ~2,5 min, para o YouTube JesusIsLove: liberdade do vício em pornografia.
 * Nada explícito: o vício aparece só como o brilho do celular, sempre de costas para a câmera.
 * Personagem próprio "Loop": cabeça redonda clara, olhos grandes e expressivos, moletom escuro.
 * Luz de cinema simulada: abajur quente, celular azul, janela fria; vinheta e grão.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1920, H = 1080, TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  function mulberry(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  let INK = '#0d0d10', SKIN = '#ece6dc', SKIN2 = '#c9c0b2', HOOD = '#2b2d36', HOOD2 = '#1c1d24', PANTS = '#1a1a1f', RED = '#e0262b', WH = '#f4f1ea', MUTE = '#8b8b95', GOLD = '#f2b84b', BLUE = '#5fb4ff';

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 14;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.45); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot); ctx.font = `${o.italic ? 'italic ' : ''}${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 30; } if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || INK; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function line(pts, w, col) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
    function circ(x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); }
    function glow(x, y, r, col, a) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
    function shade(x, y, r, a) { const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

    // texturas
    const R0 = mulberry(7);
    const grain = (() => { const cv = mk(960, 540), g = cv.getContext('2d'); for (let i = 0; i < 26000; i++) { const x = R0() * 960, y = R0() * 540; g.fillStyle = R0() < 0.5 ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.07)'; g.fillRect(x, y, 1.2, 1.2); } return cv; })();
    const vig = (() => { const cv = mk(W, H), g = cv.getContext('2d'), gr = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ======================= PERSONAGEM "LOOP" =======================
    function ik(sx, sy, tx, ty, L1, L2, bend) { let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy); const dm = Math.min(d, L1 + L2 - 1); if (d > dm) { tx = sx + dx / d * dm; ty = sy + dy / d * dm; d = dm; } const a = Math.atan2(ty - sy, tx - sx), c = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * Math.max(d, 1)), -1, 1), b = Math.acos(c) * bend; return [[sx, sy], [sx + Math.cos(a + b) * L1, sy + Math.sin(a + b) * L1], [tx, ty]]; }
    const ARMS = {
      hang: [[-62, -40], [62, -40]], phone: [[-26, -130], [26, -132]], fist: [[-62, -40], [110, -300]], cheer: [[-120, -300], [120, -300]],
      hips: [[-80, -120], [80, -120]], point: [[-62, -40], [190, -230]], tired: [[-50, -20], [50, -20]], head: [[-90, -330], [90, -330]], chest: [[-20, -150], [30, -170]], timer: [[-40, -110], [60, -120]],
    };
    function blinkK(t, seed) { const p = (t + seed) % 3.7; return p < 0.12 ? 0.08 : 1; }
    // rosto: exp = neutro, cansado, triste, feliz, determinado, assustado, culpado, sorriso, focado
    function face(t, o) {
      const exp = o.exp || 'neutro', lk = o.look || [0, 0], bl = blinkK(t, o.seed || 0);
      const lid = { cansado: 0.5, triste: 0.35, culpado: 0.45, focado: 0.25, determinado: 0.18 }[exp] || 0, big = exp === 'assustado';
      for (const sx of [-1, 1]) {
        const ex = sx * 36, ey = -6, rx = big ? 25 : 21, ry = big ? 31 : 27;
        ctx.save(); ctx.translate(ex, ey); ctx.scale(1, bl);
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, rx - 1, ry - 1, 0, 0, TAU); ctx.clip();
        circ(lk[0] * 8, lk[1] * 8 + 2, big ? 9 : 12, '#1b1b1f'); circ(lk[0] * 8 + 4, lk[1] * 8 - 3, 4, '#fff');
        if (lid > 0) { ctx.fillStyle = SKIN2; ctx.fillRect(-rx - 2, -ry - 2, 2 * rx + 4, (2 * ry + 4) * lid); line([[-rx, -ry + (2 * ry) * lid], [rx, -ry + (2 * ry) * lid]], 4, INK); }
        ctx.restore(); ctx.restore();
        // olheiras quando cansado
        if (exp === 'cansado' || exp === 'triste') { ctx.beginPath(); ctx.arc(ex, ey + 24, 16, 0.2, Math.PI - 0.2); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(90,70,90,0.45)'; ctx.stroke(); }
        // sobrancelhas
        const BR = { triste: [-0.35, 6], culpado: [-0.3, 4], cansado: [-0.12, 2], determinado: [0.38, -2], focado: [0.25, 0], assustado: [-0.25, -12], feliz: [-0.1, -6], sorriso: [-0.08, -4], neutro: [0, -2] }[exp] || [0, 0];
        ctx.save(); ctx.translate(ex, ey - ry - 10 + BR[1]); ctx.rotate(BR[0] * sx); rr(-20, -5, 40, 10, 5); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
      }
      ctx.save(); ctx.translate(0, 46);
      if (exp === 'feliz') { ctx.beginPath(); ctx.moveTo(-30, -6); ctx.quadraticCurveTo(0, 4, 30, -6); ctx.quadraticCurveTo(22, 30, 0, 30); ctx.quadraticCurveTo(-22, 30, -30, -6); ctx.closePath(); ctx.fillStyle = '#5a1e1e'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
      else if (exp === 'sorriso') { ctx.beginPath(); ctx.arc(0, -12, 22, 0.35, Math.PI - 0.35); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); }
      else if (exp === 'triste' || exp === 'culpado') { ctx.beginPath(); ctx.arc(0, 16, 18, Math.PI + 0.5, -0.5); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); }
      else if (exp === 'assustado') { ctx.beginPath(); ctx.ellipse(0, 4, 13, 17, 0, 0, TAU); ctx.fillStyle = '#5a1e1e'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
      else if (exp === 'determinado') { rr(-24, -6, 48, 16, 6); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); line([[-24, 2], [24, 2]], 2.5, INK); for (let i = -1; i <= 1; i++) line([[i * 12, -6], [i * 12, 10]], 2, INK); }
      else if (exp === 'cansado') line([[-16, 2], [16, 4]], 5, INK);
      else if (exp === 'focado') line([[-14, 2], [14, 0]], 5, INK);
      else line([[-14, 0], [14, 0]], 5, INK);
      ctx.restore();
      if (o.tear) { const k = o.tear, ty = 20 + ((t * 40) % 50) * k; ctx.beginPath(); ctx.moveTo(-36, ty - 10); ctx.bezierCurveTo(-28, ty + 2, -30, ty + 10, -36, ty + 10); ctx.bezierCurveTo(-42, ty + 10, -44, ty + 2, -36, ty - 10); ctx.fillStyle = `rgba(120,190,255,${0.9 * k})`; ctx.fill(); }
      if (o.sweat) { const k = o.sweat; ctx.save(); ctx.translate(72, -50 + ((t * 30) % 20)); ctx.scale(k, k); ctx.beginPath(); ctx.moveTo(0, -16); ctx.bezierCurveTo(12, 0, 12, 12, 0, 12); ctx.bezierCurveTo(-12, 12, -12, 0, 0, -16); ctx.fillStyle = '#8fd3ff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    }
    function head(t, o, light) {
      ctx.scale(1.3, 1.3);
      // capuz atrás
      circ(0, 18, 92, HOOD2);
      const g = ctx.createRadialGradient(-30 + (light ? light[0] * 40 : 0), -40 + (light ? light[1] * 30 : 0), 10, 0, 0, 96); g.addColorStop(0, '#fbf8f2'); g.addColorStop(0.7, SKIN); g.addColorStop(1, SKIN2);
      ctx.beginPath(); ctx.arc(0, 0, 82, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
      if (o.tint) { ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.fillStyle = o.tint; ctx.fill(); }
      face(t, o);
    }
    // origem = pés (y=0). o: x,y,s,exp,look,arms,walk,sit,slump,tilt,sweat,tear,tint,flip
    function loop(t, o) {
      const s = o.s || 1; if (s <= 0.001) return; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(s * (o.flip ? -1 : 1), s);
      const slump = o.slump || 0, breathe = Math.sin(t * 2 + (o.seed || 0)) * 3;
      // sombra
      ctx.save(); ctx.scale(1, 0.16); circ(0, 0, 110, 'rgba(0,0,0,0.35)'); ctx.restore();
      const hipY = o.sit ? -110 : -150, neckY = hipY - 135 + slump * 22 + breathe * 0.5, headY = neckY - 100 + slump * 14;
      // pernas
      let fl = [-36, 0], fr = [36, 0];
      if (o.sit) { fl = [70, 0]; fr = [100, 0]; }
      if (o.walk !== undefined) { const p = o.walk; fl = [-10 + Math.sin(p) * 60, -Math.max(0, Math.cos(p)) * 26]; fr = [10 + Math.sin(p + Math.PI) * 60, -Math.max(0, Math.cos(p + Math.PI)) * 26]; }
      for (const [hx, f, side] of [[-20, fl, 1], [20, fr, -1]]) { const L = o.sit ? [[hx, hipY], [hx + 95, hipY + 4], [f[0] + 10, f[1] - 6]] : ik(hx, hipY, f[0], f[1] - 8, 76, 76, side); line(L, 30, PANTS); ctx.beginPath(); ctx.ellipse(f[0] + 14, f[1] - 6, 26, 12, 0, 0, TAU); ctx.fillStyle = '#e9e9ee'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
      // braços
      let A = ARMS[o.arms || 'hang']; if (o.arms2) { const Bm = ARMS[o.arms2], m = o.mix || 0; A = [[lerp(A[0][0], Bm[0][0], m), lerp(A[0][1], Bm[0][1], m)], [lerp(A[1][0], Bm[1][0], m), lerp(A[1][1], Bm[1][1], m)]]; }
      let hl = [A[0][0], A[0][1] + (o.sit ? 40 : 0) + slump * 20], hr = [A[1][0], A[1][1] + (o.sit ? 40 : 0) + slump * 20];
      if (o.walk !== undefined) { hl = [-30 + Math.sin(o.walk + Math.PI) * 45, hipY + 40]; hr = [30 + Math.sin(o.walk) * 45, hipY + 40]; }
      const shY = neckY + 22, AL = ik(-46, shY, hl[0], hl[1], 78, 74, -1), AR = ik(46, shY, hr[0], hr[1], 78, 74, 1);
      // tronco (moletom)
      ctx.beginPath(); ctx.moveTo(-58, neckY + 8); ctx.quadraticCurveTo(0, neckY - 6, 58, neckY + 8); ctx.lineTo(66, hipY + 18); ctx.quadraticCurveTo(0, hipY + 30, -66, hipY + 18); ctx.closePath();
      const hg = ctx.createLinearGradient(-60, 0, 60, 0); hg.addColorStop(0, HOOD2); hg.addColorStop(0.45, HOOD); hg.addColorStop(1, HOOD2); ctx.fillStyle = hg; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
      rr(-34, hipY - 40, 68, 34, 10); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill(); // bolso
      line([[-12, neckY + 10], [-14, neckY + 60]], 3, '#9a9aa6'); line([[12, neckY + 10], [14, neckY + 60]], 3, '#9a9aa6'); // cordões
      for (const Ar of [AL, AR]) { line(Ar, 30, INK); line(Ar, 24, HOOD); circ(Ar[2][0], Ar[2][1], 15, SKIN); ctx.beginPath(); ctx.arc(Ar[2][0], Ar[2][1], 15, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
      if (o.phone) { const p = [(AL[2][0] + AR[2][0]) / 2, (AL[2][1] + AR[2][1]) / 2 - 18]; rr(p[0] - 20, p[1] - 34, 40, 66, 7); ctx.fillStyle = '#111'; ctx.fill(); rr(p[0] - 16, p[1] - 30, 32, 58, 5); ctx.fillStyle = BLUE; ctx.fill(); glow(p[0], p[1] - 40, 260, 'rgba(95,180,255,A)', 0.35 * o.phone); }
      // cabeça
      ctx.save(); ctx.translate(0, headY); ctx.rotate((o.tilt || 0) + slump * 0.12); head(t, o, o.light); ctx.restore();
      ctx.restore();
    }

    // ======================= CENÁRIOS =======================
    function room(t, o = {}) { // quarto escuro: parede, chão, rodapé
      scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.wall0 || '#25252e'); g.addColorStop(0.72, o.wall1 || '#1b1b22'); g.addColorStop(0.72, o.floor0 || '#14141a'); g.addColorStop(1, '#060608'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      line([[0, H * 0.72], [W, H * 0.72]], 4, 'rgba(255,255,255,0.05)');
    }
    function windowFrame(x, y, w, h, night, rain, t) {
      const g = ctx.createLinearGradient(0, y, 0, y + h); if (night) { g.addColorStop(0, '#0c1630'); g.addColorStop(1, '#1a2848'); } else { g.addColorStop(0, '#9fb6cf'); g.addColorStop(1, '#d9c8b0'); }
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      if (night) { const R = mulberry(4); for (let i = 0; i < 18; i++) { ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.4 * Math.sin(t * 2 + i)})`; ctx.fillRect(x + R() * w, y + R() * h * 0.7, 2, 2); } }
      if (rain) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); for (let i = 0; i < 60; i++) { const rx = x + ((i * 53 + t * 120) % w), ry = y + ((i * 97 + t * 900) % h); line([[rx, ry], [rx - 6, ry + 26]], 2, 'rgba(200,220,255,0.45)'); } ctx.restore(); }
      ctx.lineWidth = 14; ctx.strokeStyle = '#26262e'; ctx.strokeRect(x, y, w, h); line([[x + w / 2, y], [x + w / 2, y + h]], 10, '#26262e'); line([[x, y + h / 2], [x + w, y + h / 2]], 10, '#26262e');
    }
    function bed(x, y, o = {}) { rr(x - 300, y - 70, 600, 110, 16); ctx.fillStyle = '#23232b'; ctx.fill(); rr(x - 320, y - 170, 40, 210, 10); ctx.fillStyle = '#1b1b22'; ctx.fill(); rr(x - 270, y - 118, 150, 60, 30); ctx.fillStyle = '#d8d4cc'; ctx.fill(); }
    function blanket(x, y, k) { ctx.beginPath(); ctx.moveTo(x - 160, y - 60); ctx.quadraticCurveTo(x - 40, y - 150 * k - 40, x + 120, y - 90); ctx.quadraticCurveTo(x + 260, y - 80, x + 290, y - 40); ctx.lineTo(x + 290, y + 10); ctx.lineTo(x - 160, y + 10); ctx.closePath(); const g = ctx.createLinearGradient(0, y - 160, 0, y); g.addColorStop(0, '#5a3a3e'); g.addColorStop(1, '#3a2428'); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
    function couch(x, y) { rr(x - 280, y - 170, 560, 110, 30); ctx.fillStyle = '#3a2f2a'; ctx.fill(); rr(x - 300, y - 80, 600, 90, 24); ctx.fillStyle = '#4a3b33'; ctx.fill(); rr(x - 330, y - 140, 70, 160, 26); ctx.fill(); rr(x + 260, y - 140, 70, 160, 26); ctx.fill(); ctx.fillStyle = '#1a1512'; ctx.fillRect(x - 280, y + 10, 30, 26); ctx.fillRect(x + 250, y + 10, 30, 26); }
    function lamp(x, y, on, t) { line([[x, y], [x, y - 240]], 8, '#3a3a42'); ctx.beginPath(); ctx.moveTo(x - 60, y - 240); ctx.lineTo(x + 60, y - 240); ctx.lineTo(x + 40, y - 320); ctx.lineTo(x - 40, y - 320); ctx.closePath(); ctx.fillStyle = on ? '#f2c27a' : '#4a4a52'; ctx.fill(); if (on) glow(x, y - 250, 620, 'rgba(255,190,110,A)', 0.32 * on); rr(x - 50, y - 6, 100, 14, 7); ctx.fillStyle = '#2a2a30'; ctx.fill(); }
    function clock(x, y, s, ring, t, label) { ctx.save(); ctx.translate(x + (ring ? Math.sin(t * 60) * 5 * ring : 0), y); ctx.scale(s, s); rr(-120, -70, 240, 140, 26); ctx.fillStyle = '#18181c'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#3a3a44'; ctx.stroke(); txt(label || '6:00', 0, 4, 84, { w: 900, color: RED, glow: 'rgba(224,38,43,0.8)', blur: 20 }); if (ring) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 150 + i * 30 + ((t * 120) % 30), -0.6, 0.6); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(255,255,255,${0.35 * ring})`; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 150 + i * 30 + ((t * 120) % 30), Math.PI - 0.6, Math.PI + 0.6); ctx.stroke(); } ctx.restore(); if (ring) glow(x, y, 300, 'rgba(224,38,43,A)', 0.25 * ring); }
    function bubble(x, y, s, k, col, fill, size = 46, o = {}) { if (k <= 0) return; const w = tw(s, size, 800) + 70, h = size * 1.9; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3) * (o.a ?? 1)); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = fill; ctx.fill(); ctx.beginPath(); ctx.moveTo(o.tx ?? -w * 0.25, h / 2 - 4); ctx.lineTo((o.tx ?? -w * 0.25) - 30, h / 2 + 34); ctx.lineTo((o.tx ?? -w * 0.25) + 26, h / 2 - 4); ctx.fill(); txt(s, 0, 2, size, { w: 800, color: col, italic: o.italic }); ctx.restore(); ga(1); }
    function chip(s, x, y, size, k, o = {}) { if (k <= 0) return; const w = tw(s, size, 900) + size * 1.2, h = size * 1.7; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3)); rr(-w / 2, -h / 2, w, h, 12); ctx.fillStyle = o.fill || WH; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: o.col || INK }); ctx.restore(); ga(1); }
    function bigText(lines, x, y, size, k, o = {}) { if (k <= 0) return; lines.forEach((l, i) => { const kk = clamp(k * 1.6 - i * 0.3); txt(l[0], x, y + i * size * 1.15, size, { w: 900, color: l[1] || WH, scale: outBack(kk), a: clamp(kk * 2) * (o.a ?? 1), glow: l[1] === RED ? 'rgba(224,38,43,0.55)' : null, blur: 26 }); }); }
    function cloud(x, y, s, a, t) { if (a <= 0) return; ga(a); ctx.save(); ctx.translate(x, y + Math.sin(t * 1.4) * 6); ctx.scale(s, s); ctx.fillStyle = '#2a2a33'; ctx.beginPath(); [[-70, 0, 50], [-20, -24, 62], [40, -10, 54], [80, 8, 40], [0, 14, 56]].forEach(([cx, cy, r]) => { ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, TAU); }); ctx.fill(); for (let i = 0; i < 6; i++) { const rx = -60 + i * 24, ry = 50 + ((t * 160 + i * 37) % 70); line([[rx, ry], [rx - 4, ry + 16]], 3, 'rgba(140,170,220,0.6)'); } ctx.restore(); ga(1); }
    function fire(x, y, s, k, t, logs = true) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      if (logs) { ctx.save(); ctx.rotate(0.25); rr(-130, -18, 260, 36, 18); ctx.fillStyle = '#5a3a22'; ctx.fill(); ctx.restore(); ctx.save(); ctx.rotate(-0.25); rr(-130, -18, 260, 36, 18); ctx.fillStyle = '#6b4528'; ctx.fill(); ctx.restore(); }
      if (k > 0) { glow(0, -80, 420 * k, 'rgba(255,150,60,A)', 0.45 * k); for (let i = 0; i < 3; i++) { const h = (150 - i * 40) * k * (0.9 + 0.1 * Math.sin(t * 9 + i)), wv = Math.sin(t * 7 + i * 2) * 10; ctx.beginPath(); ctx.moveTo(-60 + i * 20, -10); ctx.bezierCurveTo(-70 + i * 20, -h * 0.5, wv, -h * 0.8, wv * 0.5, -h - 20); ctx.bezierCurveTo(wv, -h * 0.6, 70 - i * 20, -h * 0.5, 60 - i * 20, -10); ctx.closePath(); ctx.fillStyle = ['#e0532b', '#f39a2b', '#ffe08a'][i]; ctx.fill(); } }
      ctx.restore();
    }
    function spark(x, y, k, t) { if (k <= 0) return; glow(x, y, 300 * k, 'rgba(255,220,120,A)', 0.8 * k); const R = mulberry(9); for (let i = 0; i < 22; i++) { const a = R() * TAU, d = (40 + R() * 200) * (1.2 - k); line([[x + Math.cos(a) * d * 0.6, y + Math.sin(a) * d * 0.6], [x + Math.cos(a) * d, y + Math.sin(a) * d]], 4 * k, `rgba(255,220,120,${k})`); } circ(x, y, 22 * k, '#fff6d0'); }
    function calendarWall(x, y, s, marks, t, hl = -1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-200, -180, 400, 360, 14); ctx.fillStyle = '#e9e4da'; ctx.fill(); rr(-200, -180, 400, 70, [14, 14, 0, 0]); ctx.fillStyle = RED; ctx.fill(); txt('MÊS 1', 0, -145, 34, { w: 900, color: WH });
      for (let i = 0; i < 30; i++) { const cx = -165 + (i % 6) * 66, cy = -78 + Math.floor(i / 6) * 50; ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(cx - 24, cy - 18, 48, 36); if (i < marks) { const k = clamp(marks - i); line([[cx - 14, cy], [cx - 4, cy + 12], [cx + 16, cy - 12]].slice(0, k > 0.5 ? 3 : 2), 6, i === hl ? RED : '#2f8f4e'); } } ctx.restore(); }
    function stairsUp(x, y, n, k, t) { for (let i = 0; i < n; i++) { const kk = clamp(k * n - i); if (kk <= 0) break; ga(kk); rr(x + i * 110, y - i * 48, 110, 48 + i * 48, 4); ctx.fillStyle = `rgb(${40 + i * 6},${40 + i * 6},${48 + i * 6})`; ctx.fill(); line([[x + i * 110, y - i * 48], [x + (i + 1) * 110, y - i * 48]], 4, 'rgba(242,184,75,0.6)'); } ga(1); }

    // ======================= TEMPOS =======================
    const s1 = { dua: wt('c1', 'duas'), sil: wt('c1', 'silencio'), pro: wt('c1', 'promete'), nov: wt('c1', 'novo'), ult: wt('c1', 'ultima') };
    const s2 = { nin: wt('c2', 'ninguem'), fam: wt('c2', 'familia'), igr: wt('c2', 'igreja'), fora: wt('c2', 'fora'), nor: wt('c2', 'normal'), den: wt('c2', 'dentro'), pri: wt('c2', 'prisao') };
    const s3 = { com: wt('c3', 'comecou'), cur: wt('c3', 'curiosidade'), cli: wt('c3', 'clique'), fug: wt('c3', 'fugir'), can: wt('c3', 'cansaco'), sol: wt('c3', 'solidao'), ans: wt('c3', 'ansiedade') };
    const s4 = { vez: wt('c4', 'vez'), voz: wt('c4', 'voz'), pre: wt('c4', 'presta'), cans: wt('c4', 'cansou'), ora: wt('c4', 'orar') };
    const s5 = { mas: wt('c5', 'mas'), deu: wt('c5', 'deus'), bib: wt('c5', 'biblia'), nen: wt('c5', 'nenhuma'), con: wt('c5', 'condenacao'), cri: wt('c5', 'cristo') };
    const s6 = { ver: wt('c6', 'vergonha'), lon: wt('c6', 'longe'), gra: wt('c6', 'graca'), vol: wt('c6', 'volta'), ama: wt('c6', 'ama'), cai: wt('c6', 'cai') };
    const s7 = { gra: wt('c7', 'graca'), des: wt('c7', 'desculpa'), for: wt('c7', 'forca'), lev: wt('c7', 'levantar'), pas: wt('c7', 'passos') };
    const s8 = { pri: wt('c8', 'primeiro'), opo: wt('c8', 'oportunidade'), cel: wt('c8', 'celular'), fil: wt('c8', 'filtro'), neg: wt('c8', 'negociar'), fug: wt('c8', 'fugir') };
    const s9 = { seg: wt('c9', 'segundo'), con: wt('c9', 'conta'), pas: wt('c9', 'pastor'), ami: wt('c9', 'amigo'), psi: wt('c9', 'psicologo'), esc: wt('c9', 'escuro'), cre: wt('c9', 'cresce'), luz: wt('c9', 'luz'), for: wt('c9', 'forca') };
    const s10 = { ter: wt('c10', 'terceiro'), gat: wt('c10', 'gatilho'), can: wt('c10', 'cansaco'), ted: wt('c10', 'tedio'), sol: wt('c10', 'solidao'), ora: wt('c10', 'ora'), lev: wt('c10', 'levanta'), sai: wt('c10', 'sai'), lig: wt('c10', 'liga') };
    const s11 = { cai: wt('c11', 'cair'), cul: wt('c11', 'culpa'), con: wt('c11', 'confessa'), lev: wt('c11', 'levanta'), cont: wt('c11', 'continua'), cfm: wt('c11', 'confessarmos'), per: wt('c11', 'perdoar') };
    const s12 = { dia: wt('c12', 'dia'), sem: wt('c12', 'semana'), mes: wt('c12', 'mes'), con: wt('c12', 'contra'), lut: wt('c12', 'lutando') };
    const s13 = { esc: wt('c13', 'escondido'), liv: wt('c13', 'livre') };
    const s14 = { com: wt('c14', 'comenta'), liv: wt('c14', 'livre'), cmp: wt('c14', 'compartilha'), ins: wt('c14', 'inscreve') };

    cue(0, 'music', { part: 'intro' }); cue(s1.dua, 'tick', { dur: 0.6, gain: 0.4 }); cue(s1.ult, 'impact', { gain: 0.4 });
    cue(B[1], 'music', { part: 'groove' }); cue(s2.den, 'whoosh', { dur: 0.4, gain: 0.4 }); cue(s2.pri, 'stamp', { gain: 0.5 });
    cue(s3.cli, 'tap'); [s3.can, s3.sol, s3.ans].forEach(x => cue(x, 'pop', { gain: 0.5 }));
    cue(s4.pre, 'error', { gain: 0.35 }); cue(s4.cans, 'error', { gain: 0.3 }); cue(s4.ora, 'impact', { gain: 0.35 });
    cue(s5.deu, 'reveal', { gain: 0.5 }); cue(s5.con, 'sparkle');
    cue(s6.ver, 'swoosh', { gain: 0.4 }); cue(s6.gra, 'riser', { dur: 0.8 }); cue(s6.cai, 'reveal', { gain: 0.4 });
    cue(s7.des, 'error', { gain: 0.3 }); cue(s7.for, 'success', { gain: 0.5 });
    cue(s8.pri, 'ding'); cue(s8.cel, 'door'); cue(s8.fil, 'pop'); cue(s8.fug, 'whoosh', { dur: 0.4 });
    cue(s9.seg, 'ding'); cue(s9.luz, 'sparkle');
    cue(s10.ter, 'ding'); [s10.ora, s10.lev, s10.sai, s10.lig].forEach(x => cue(x, 'pop', { gain: 0.5 }));
    cue(s11.cai, 'impact', { gain: 0.4 }); cue(s11.lev, 'success', { gain: 0.4 }); cue(s11.cfm, 'reveal', { gain: 0.4 });
    cue(s12.dia, 'tick', { dur: 0.3 }); cue(s12.sem, 'tick', { dur: 0.3 }); cue(s12.mes, 'riser', { dur: 0.8 }); cue(s12.lut, 'reveal', { gain: 0.5 });
    cue(B[12], 'music', { part: 'outro' }); cue(s13.liv, 'sparkle');
    cue(s14.com, 'notif'); cue(s14.ins, 'tap'); cue(s14.ins + 0.05, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.3 });

    // ======================= EXTRAS =======================
    function cross(x, y, s, a) { ga(a); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); glow(0, 0, 420, 'rgba(255,214,150,A)', 0.5); rr(-14, -150, 28, 300, 6); ctx.fillStyle = '#fff3d6'; ctx.fill(); rr(-90, -90, 180, 28, 6); ctx.fill(); ctx.restore(); ga(1); }
    function bars(x, y, w, h, k) { if (k <= 0) return; ga(k); for (let i = 0; i <= 6; i++) { const xx = x + i * w / 6; line([[xx, y], [xx, y + h * outC(k)]], 14, '#5a5a66'); } line([[x, y], [x + w, y]], 16, '#4a4a55'); line([[x, y + h * outC(k)], [x + w, y + h * outC(k)]], 16, '#4a4a55'); ga(1); }
    function verse(s, ref, x, y, k, o = {}) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3)); const w = o.w || 1300, h = o.h || 250; rr(-w / 2, -h / 2, w, h, 28); ctx.fillStyle = 'rgba(255,246,225,0.96)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = GOLD; ctx.stroke();
      const L = Array.isArray(s) ? s : [s]; L.forEach((l, i) => txt(l, 0, -h / 2 + 70 + i * 66, o.size || 52, { w: 800, color: INK, italic: true })); txt(ref, 0, h / 2 - 40, 32, { w: 900, color: '#a5761e' }); ga(1); ctx.restore(); }
    function step(n, s, k) { if (k <= 0) return; ctx.save(); ctx.translate(960, 120); ctx.scale(outBack(k), outBack(k)); const w = tw(s, 52, 900) + 150; rr(-w / 2, -50, w, 100, 50); ctx.fillStyle = GOLD; ctx.fill(); circ(-w / 2 + 50, 0, 36, INK); txt(String(n), -w / 2 + 50, 3, 46, { w: 900, color: GOLD }); txt(s, 40, 3, 52, { w: 900, color: INK }); ctx.restore(); }
    // celular de costas (só o brilho, nunca a tela)
    function phoneBack(x, y, s, k, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-34, -62, 68, 124, 12); ctx.fillStyle = '#18181d'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#33333c'; ctx.stroke(); circ(-14, -42, 7, '#2a2a33'); ctx.restore(); glow(x, y - 20, 420 * s, 'rgba(95,180,255,A)', 0.4 * k * (0.85 + 0.15 * Math.sin(t * 7))); }
    const HOOD_SWAP = () => { HOOD = '#3d5a8c'; HOOD2 = '#2b4066'; }, HOOD_RESET = () => { HOOD = '#2b2d36'; HOOD2 = '#1c1d24'; };

    // ======================= CENAS =======================
    function scene1(t) { // 2h da manhã, o celular, "a última vez"
      room(t, { wall0: '#141826', wall1: '#0a0b11' }); windowFrame(1420, 160, 320, 360, true, false, t);
      bed(980, 860); clock(420, 610, 0.7, 0, t, '2:00'); rr(290, 680, 260, 180, 10); ctx.fillStyle = '#16161c'; ctx.fill();
      const down = sm(t, s1.pro - 0.4, s1.pro + 0.4);
      loop(t, { x: 900, y: 900, s: 1.35, sit: true, exp: t < s1.pro ? 'cansado' : 'culpado', look: [0, 0.7 - 0.4 * down], arms: down < 0.5 ? 'phone' : 'head', slump: 0.6 + 0.3 * down, tint: 'rgba(95,180,255,0.1)', tear: sm(t, s1.ult, s1.ult + 1) * 0.8 });
      if (down < 0.5) phoneBack(900, 640, 1, 1 - down * 2, t); else { ctx.save(); ctx.translate(1180, 845); ctx.rotate(1.5); rr(-34, -62, 68, 124, 12); ctx.fillStyle = '#18181d'; ctx.fill(); ctx.restore(); }
      shade(900, 600, 1100, 0.5);
      chip('2:00 DA MANHÃ', 960, 110, 40, sm(t, s1.dua - 0.2, s1.dua + 0.2) * (1 - sm(t, s1.pro - 0.3, s1.pro)), { fill: WH });
      bigText([['"FOI A', WH], ['ÚLTIMA VEZ."', RED]], 1460, 640, 84, sm(t, s1.nov - 0.2, s1.ult + 0.2));
    }
    function scene2(t) { // por fora x por dentro
      const sp = sm(t, s2.den - 0.4, s2.den + 0.3);
      scr(); ctx.fillStyle = '#d9c9a8'; ctx.fillRect(0, 0, W, H); glow(500, 300, 1000, 'rgba(255,240,200,A)', 0.35);
      // lado de fora: família e igreja (silhuetas simples)
      ctx.fillStyle = '#b9a785'; ctx.fillRect(0, 780, W, 300);
      [[220, 'rgba(90,70,60,0.35)'], [1180, 'rgba(90,70,60,0.35)'], [1420, 'rgba(90,70,60,0.35)']].forEach(([x, c], i) => { if (t < s2.fam - 0.2 + i * 0.2) return; ctx.fillStyle = c; circ(x, 560, 60, c); rr(x - 70, 620, 140, 200, 50); ctx.fill(); });
      chip('FAMÍLIA', 220, 400, 34, sm(t, s2.fam - 0.2, s2.fam + 0.2)); chip('IGREJA', 1300, 400, 34, sm(t, s2.igr - 0.2, s2.igr + 0.2));
      loop(t, { x: 760, y: 920, s: 1.4, exp: 'sorriso', look: [0.5, -0.2], arms: 'hang' });
      chip('POR FORA: TUDO NORMAL', 760, 160, 40, sm(t, s2.fora - 0.2, s2.nor + 0.2), { fill: WH });
      // por dentro: escuro desce como cortina e grades
      if (sp > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H * sp); ctx.clip(); room(t, { wall0: '#0e0f15', wall1: '#07070a' }); loop(t, { x: 760, y: 920, s: 1.4, exp: 'triste', look: [0, 0.4], slump: 0.7, tint: 'rgba(30,30,60,0.25)' }); bars(470, 280, 580, 640, sm(t, s2.pri - 0.4, s2.pri + 0.3)); shade(760, 600, 900, 0.5); ctx.restore(); }
      bigText([['POR DENTRO,', WH], ['UMA PRISÃO.', RED]], 1460, 420, 70, sm(t, s2.den, s2.pri + 0.3));
      txt('que ninguém vê', 1460, 620, 44, { w: 700, color: MUTE, italic: true, a: sm(t, s2.pri + 0.2, s2.pri + 0.7) });
    }
    function scene3(t) { // começou pequeno: a bola de neve e as fugas
      room(t, { wall0: '#1d1d25', wall1: '#0e0e12' });
      const g = sm(t, s3.com, s3.ans + 0.5), r = lerp(26, 210, g), x = lerp(260, 1150, g);
      ctx.save(); ctx.translate(x, 900 - r); ctx.rotate(t * 2); circ(0, 0, r, '#2a2a36'); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.lineWidth = 6; ctx.strokeStyle = '#4a4a5a'; ctx.stroke(); line([[-r * 0.6, 0], [r * 0.6, 0]], 4, '#4a4a5a'); ctx.restore();
      glow(x, 900 - r, r * 2.4, 'rgba(95,180,255,A)', 0.18);
      chip('CURIOSIDADE', 600, 660, 34, sm(t, s3.cur - 0.2, s3.cur + 0.2)); chip('UM CLIQUE', 780, 540, 34, sm(t, s3.cli - 0.2, s3.cli + 0.2));
      txt('VIROU FUGA DE...', 1450, 260, 56, { w: 900, a: sm(t, s3.fug - 0.2, s3.fug + 0.2) });
      [['CANSAÇO', s3.can], ['SOLIDÃO', s3.sol], ['ANSIEDADE', s3.ans]].forEach(([s, tt], i) => chip(s, 1450, 380 + i * 110, 42, sm(t, tt - 0.2, tt + 0.2), { fill: RED, col: WH }));
      loop(t, { x: 200, y: 1000, s: 0.9, exp: 'neutro', look: [1, -0.2] });
    }
    function scene4(t) { // as vozes da condenação
      room(t, { wall0: '#140f1c', wall1: '#08060c' }); glow(960, 400, 1100, 'rgba(120,60,160,A)', 0.15 + 0.1 * sm(t, s4.voz, s4.ora));
      loop(t, { x: 960, y: 980, s: 1.25, sit: true, exp: 'triste', look: [0, 0.6], arms: 'head', slump: 0.9, tear: sm(t, s4.pre, s4.pre + 0.8), tint: 'rgba(60,30,90,0.18)' });
      const B1 = [['"VOCÊ NÃO PRESTA."', 470, 300, s4.pre], ['"DEUS CANSOU DE VOCÊ."', 1430, 380, s4.cans], ['"NEM ORE HOJE."', 620, 620, s4.ora]];
      B1.forEach(([s, x, y, tt]) => bubble(x, y, s, sm(t, tt - 0.25, tt + 0.15), '#d9c8ff', 'rgba(40,20,60,0.92)', 46, { italic: true }));
      chip('A MESMA VOZ', 960, 110, 40, sm(t, s4.voz - 0.2, s4.voz + 0.2), { fill: '#d9c8ff' });
      shade(960, 600, 1100, 0.4);
    }
    function scene5(t) { // a luz quebra a acusação: Romanos 8:1
      const lk = sm(t, s5.mas - 0.2, s5.deu + 0.4);
      room(t, { wall0: '#140f1c', wall1: '#08060c' });
      glow(960, 260, 1400 * lk, 'rgba(255,220,160,A)', 0.55 * lk);
      ['"VOCÊ NÃO PRESTA."', '"DEUS CANSOU DE VOCÊ."', '"NEM ORE HOJE."'].forEach((s, i) => { const k = 1 - sm(t, s5.mas + i * 0.15, s5.deu + i * 0.15); if (k > 0) bubble([470, 1430, 620][i] + (1 - k) * (i - 1) * 300, [300, 380, 620][i] - (1 - k) * 120, s, k, '#d9c8ff', 'rgba(40,20,60,0.92)', 46, { italic: true, a: k }); });
      loop(t, { x: 960, y: 980, s: 1.25, sit: true, exp: lk > 0.5 ? 'neutro' : 'triste', look: [0, -0.6 * lk], slump: 0.9 - 0.5 * lk, light: [0, -1], tint: 'rgba(255,200,120,0.06)' });
      txt('ESSA VOZ NÃO É DE DEUS.', 960, 110, 52, { w: 900, color: WH, a: sm(t, s5.deu - 0.2, s5.deu + 0.2) * (1 - sm(t, s5.nen - 0.4, s5.nen - 0.1)) });
      verse(['"Agora, pois, já nenhuma condenação há', 'para os que estão em Cristo Jesus."'], 'ROMANOS 8:1', 960, 230, sm(t, s5.nen - 0.3, s5.nen + 0.2), { h: 260, size: 50 });
    }
    function scene6(t) { // vergonha empurra, graça puxa
      room(t, { wall0: '#1e1b22', wall1: '#0e0d12' });
      cross(1640, 560, 1, 0.7 + 0.3 * sm(t, s6.gra, s6.vol));
      const away = sm(t, s6.ver, s6.lon + 0.3) * (1 - sm(t, s6.gra, s6.vol + 0.6));
      const wx = lerp(1050, 380, away) + sm(t, s6.vol, s6.cai, inOut) * 280;
      const walking = (t > s6.ver && t < s6.lon + 0.3) || (t > s6.gra && t < s6.cai);
      loop(t, { x: wx, y: 990, s: 1.3, exp: t < s6.gra ? 'culpado' : t < s6.ama ? 'neutro' : 'sorriso', look: t < s6.gra ? [-1, 0.3] : [1, -0.4], walk: walking ? t * 6 : undefined, flip: t < s6.gra, light: [1, -0.5] });
      chip('VERGONHA', 420, 300, 44, sm(t, s6.ver - 0.2, s6.ver + 0.2) * (1 - sm(t, s6.gra, s6.gra + 0.4)), { fill: '#5a4a6a', col: WH });
      if (t > s6.ver && t < s6.gra) { const p = prog(t, s6.ver, s6.lon); line([[wx + 260, 600], [wx + 120, 600]], 10, 'rgba(160,140,190,0.6)'); }
      chip('GRAÇA', 1620, 250, 50, sm(t, s6.gra - 0.2, s6.gra + 0.2), { fill: GOLD });
      txt('Ele não te ama menos', 760, 130, 60, { w: 900, color: WH, a: sm(t, s6.ama - 0.3, s6.ama + 0.1) });
      txt('no dia em que você cai.', 760, 210, 60, { w: 900, color: GOLD, a: sm(t, s6.cai - 0.3, s6.cai + 0.1) });
      shade(800, 600, 1300, 0.35);
    }
    function scene7(t) { // graça não é desculpa, é força para levantar
      room(t, { wall0: '#24222c', wall1: '#121116' }); glow(1400, 300, 900, 'rgba(242,184,75,A)', 0.12);
      txt('GRAÇA NÃO É DESCULPA', 960, 110, 64, { w: 900, color: WH, scale: sm(t, s7.gra - 0.3, s7.gra + 0.1, outBack) });
      if (t > s7.des) line([[590, 113], [lerp(590, 1330, sm(t, s7.des + 0.2, s7.des + 0.6)), 107]], 10, RED);
      txt('É FORÇA PRA LEVANTAR.', 960, 215, 80, { w: 900, color: GOLD, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s7.for - 0.3, s7.for + 0.1, outBack) });
      const up = sm(t, s7.lev - 0.3, s7.lev + 0.8);
      loop(t, { x: 960, y: 1020, s: 1.2, sit: up < 0.5, exp: up < 0.5 ? 'triste' : 'determinado', look: [0, -0.4], slump: 0.8 * (1 - up), arms: up > 0.5 ? 'fist' : 'hang', light: [0.5, -1] });
      stairsUp(1250, 980, 3, sm(t, s7.pas - 0.3, s7.pas + 0.6), t);
      chip('PASSOS PEQUENOS', 1450, 720, 36, sm(t, s7.pas - 0.1, s7.pas + 0.3), { fill: WH });
    }
    function scene8(t) { // 1: tira a oportunidade
      room(t, { wall0: '#1f2230', wall1: '#0f1016' });
      step(1, 'TIRA A OPORTUNIDADE', sm(t, s8.pri - 0.2, s8.opo + 0.2));
      // porta do quarto e o celular saindo
      rr(1260, 300, 300, 600, 6); ctx.fillStyle = '#3a2a22'; ctx.fill(); circ(1520, 620, 12, GOLD); txt('QUARTO', 1410, 270, 30, { w: 900, color: MUTE });
      const pk = sm(t, s8.cel - 0.3, s8.cel + 0.8), px = lerp(980, 1750, pk);
      loop(t, { x: lerp(820, 900, pk), y: 1040, s: 1.15, exp: 'determinado', look: [1, -0.2], arms: pk < 0.6 ? 'point' : 'hang', light: [1, -0.5] });
      ctx.save(); ctx.translate(px, 640 + Math.sin(pk * Math.PI) * -120); rr(-30, -54, 60, 108, 10); ctx.fillStyle = '#18181d'; ctx.fill(); ctx.restore();
      chip('CELULAR FORA DO QUARTO À NOITE', 1410, 930, 30, sm(t, s8.cel, s8.cel + 0.4), { fill: WH });
      const fk = sm(t, s8.fil - 0.3, s8.fil + 0.1, outBack); if (fk > 0) { ctx.save(); ctx.translate(380, 480); ctx.scale(fk, fk); ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(100, -80); ctx.quadraticCurveTo(100, 60, 0, 120); ctx.quadraticCurveTo(-100, 60, -100, -80); ctx.closePath(); ctx.fillStyle = '#2f8f4e'; ctx.fill(); line([[-40, 0], [-10, 34], [44, -30]], 16, WH); ctx.restore(); txt('FILTRO NO APARELHO', 380, 660, 34, { w: 900, color: '#7fd49b', a: fk }); }
      verse('"Foge das paixões da mocidade."', '2 TIMÓTEO 2:22', 960, 300, sm(t, s8.fug - 0.3, s8.fug + 0.2), { w: 1000, h: 170, size: 46 });
      txt('não negocia.', 960, 235, 40, { w: 700, color: MUTE, italic: true, a: sm(t, s8.neg - 0.2, s8.neg + 0.2) * (1 - sm(t, s8.fug - 0.4, s8.fug - 0.1)) });
    }
    function scene9(t) { // 2: conta pra alguém — o escuro diminui na luz
      room(t, { wall0: '#262632', wall1: '#121218' }); lamp(1720, 900, 1, t);
      step(2, 'CONTA PRA ALGUÉM', sm(t, s9.seg - 0.2, s9.con + 0.2));
      loop(t, { x: 640, y: 1000, s: 1.3, exp: t < s9.luz ? 'culpado' : 'sorriso', look: [1, -0.1], arms: 'chest', light: [1, -0.4] });
      ctx.save(); HOOD_SWAP(); loop(t, { x: 1220, y: 1000, s: 1.3, exp: 'sorriso', look: [-1, -0.1], flip: true, light: [-1, -0.4], seed: 2 }); ctx.restore(); HOOD_RESET();
      [['PASTOR', s9.pas], ['AMIGO DE CONFIANÇA', s9.ami], ['PSICÓLOGO', s9.psi]].forEach(([s, tt], i) => chip(s, 1560, 260 + i * 80, 30, sm(t, tt - 0.2, tt + 0.2), { fill: WH }));
      // a mancha escura que encolhe na luz
      const dk = sm(t, s9.esc - 0.2, s9.cre + 0.3) * (1 - sm(t, s9.luz, s9.for + 0.4));
      if (dk > 0) { const r = 60 + 60 * sm(t, s9.cre - 0.2, s9.cre + 0.4); ga(dk); ctx.fillStyle = '#050507'; ctx.beginPath(); for (let i = 0; i <= 20; i++) { const a = i / 20 * TAU, rr2 = r * (1 + 0.15 * Math.sin(a * 5 + t * 4)); i ? ctx.lineTo(930 + Math.cos(a) * rr2, 300 + Math.sin(a) * rr2) : ctx.moveTo(930 + Math.cos(a) * rr2, 300 + Math.sin(a) * rr2); } ctx.fill(); ga(1); }
      glow(930, 300, 600, 'rgba(255,220,160,A)', 0.5 * sm(t, s9.luz - 0.2, s9.luz + 0.4));
      txt('NA LUZ, PERDE A FORÇA.', 930, 640, 58, { w: 900, color: GOLD, scale: sm(t, s9.for - 0.3, s9.for + 0.1, outBack) });
    }
    function scene10(t) { // 3: gatilhos e plano
      room(t, { wall0: '#1e2028', wall1: '#0d0e12' });
      step(3, 'CONHEÇA SEU GATILHO', sm(t, s10.ter - 0.2, s10.gat + 0.2));
      [['CANSAÇO', s10.can], ['TÉDIO', s10.ted], ['SOLIDÃO', s10.sol]].forEach(([s, tt], i) => chip(s, 480, 330 + i * 120, 44, sm(t, tt - 0.2, tt + 0.2), { fill: RED, col: WH }));
      txt('QUANDO ELE CHEGAR:', 1360, 260, 46, { w: 900, color: MUTE, a: sm(t, s10.ora - 0.6, s10.ora - 0.2) });
      [['ORA', s10.ora], ['LEVANTA', s10.lev], ['SAI DO QUARTO', s10.sai], ['LIGA PRA ALGUÉM', s10.lig]].forEach(([s, tt], i) => chip('✓ ' + s, 1360, 360 + i * 105, 44, sm(t, tt - 0.2, tt + 0.2), { fill: GOLD }));
      loop(t, { x: 860, y: 1010, s: 1.1, exp: t < s10.ora ? 'focado' : 'determinado', look: [1, -0.3], arms: t > s10.lev ? 'fist' : 'hang', walk: t > s10.sai && t < s10.lig ? t * 6 : undefined });
    }
    function scene11(t) { // e se cair? confessa, levanta e continua — 1 João 1:9
      room(t, { wall0: '#24222c', wall1: '#111016' }); glow(960, 200, 1200, 'rgba(255,220,160,A)', 0.2 * sm(t, s11.cfm, s11.per));
      const fall = sm(t, s11.cai - 0.2, s11.cai + 0.3) * (1 - sm(t, s11.lev - 0.3, s11.lev + 0.4));
      loop(t, { x: 330, y: 1000, s: 1.3, sit: fall > 0.5, exp: fall > 0.5 ? 'triste' : t > s11.lev ? 'determinado' : 'neutro', look: [0.4, -0.2], slump: 0.8 * fall, tilt: 0.2 * fall, arms: t > s11.cont ? 'fist' : 'hang', walk: t > s11.cont && t < s11.cfm ? t * 6 : undefined });
      txt('E SE VOCÊ CAIR?', 960, 140, 64, { w: 900, color: WH, a: sm(t, s11.cai - 0.3, s11.cai) * (1 - sm(t, s11.cfm - 0.4, s11.cfm - 0.1)) });
      chip('NÃO VOLTA PRA CULPA', 1420, 360, 36, sm(t, s11.cul - 0.2, s11.cul + 0.2) * (1 - sm(t, s11.cfm - 0.4, s11.cfm - 0.1)), { fill: '#5a4a6a', col: WH });
      [['CONFESSA', s11.con], ['LEVANTA', s11.lev], ['CONTINUA', s11.cont]].forEach(([s, tt], i) => chip(s, 1420, 470 + i * 100, 44, sm(t, tt - 0.2, tt + 0.2) * (1 - sm(t, s11.cfm - 0.4, s11.cfm - 0.1)), { fill: GOLD }));
      verse(['"Se confessarmos os nossos pecados,', 'ele é fiel e justo para nos perdoar."'], '1 JOÃO 1:9', 1150, 260, sm(t, s11.cfm - 0.3, s11.cfm + 0.2), { h: 260, size: 50 });
    }
    function scene12(t) { // dia, semana, mês — Deus lutando com você
      room(t, { wall0: '#2a2630', wall1: '#141218' }); glow(1500, 250, 1000, 'rgba(242,184,75,A)', 0.12 + 0.15 * sm(t, s12.mes, s12.lut));
      const d = t < s12.sem - 0.1 ? 1 : t < s12.mes - 0.1 ? 7 : 30;
      chip(d === 1 ? '1 DIA LIVRE' : d === 7 ? '1 SEMANA' : '1 MÊS', 960, 110, 46, 1 - 0.3 * (pulse(t, s12.sem - 0.1, 0.05, 0.3) + pulse(t, s12.mes - 0.1, 0.05, 0.3)), { fill: d === 30 ? GOLD : WH });
      calendarWall(1450, 500, 0.95, d, t);
      loop(t, { x: 640, y: 1000, s: 1.4, exp: t < s12.con ? 'focado' : 'sorriso', look: [1, -0.3], arms: t > s12.lut ? 'hips' : 'hang', light: [1, -0.6] });
      txt('não é você contra você', 820, 260, 44, { w: 700, color: MUTE, italic: true, a: sm(t, s12.con - 0.2, s12.con + 0.2) * (1 - sm(t, s12.lut - 0.4, s12.lut - 0.1)) });
      txt('É DEUS LUTANDO COM VOCÊ.', 820, 260, 64, { w: 900, color: WH, glow: 'rgba(242,184,75,0.6)', blur: 30, scale: sm(t, s12.lut - 0.3, s12.lut + 0.1, outBack) });
    }
    function scene13(t) { // nascer do sol, correntes quebradas
      scr(); const u = sm(t, B[12], B[13]); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b2238'); g.addColorStop(0.6, u > 0.5 ? '#c9784e' : '#6a4a5a'); g.addColorStop(1, '#f2b36b'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      glow(960, 900, 900, 'rgba(255,214,150,A)', 0.4 + 0.3 * u);
      ctx.fillStyle = '#16121a'; ctx.beginPath(); ctx.moveTo(0, 900); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 880 - Math.sin(x * 0.003) * 60); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      const lv = sm(t, s13.liv - 0.3, s13.liv + 0.3);
      loop(t, { x: 1460, y: 900, s: 1.15, exp: lv > 0.5 ? 'feliz' : 'sorriso', look: [-0.5, -0.6], arms: lv > 0.5 ? 'cheer' : 'hang', light: [-1, 0.2], tint: 'rgba(255,160,80,0.08)' });
      // correntes caindo
      for (let i = 0; i < 6; i++) { const fallY = lv * (300 + i * 40); ga(1 - lv * 0.6); ctx.beginPath(); ctx.ellipse(1400 + i * 22, 640 + fallY, 16, 10, 0.6 * (i % 2 ? 1 : -1), 0, TAU); ctx.lineWidth = 7; ctx.strokeStyle = '#2a2a33'; ctx.stroke(); ga(1); }
      txt('DEUS NÃO QUER TE VER', 700, 330, 70, { w: 900, scale: sm(t, B[12] + 0.2, B[12] + 0.6, outBack) });
      txt('ESCONDIDO.', 700, 420, 70, { w: 900, color: '#d8c8e6', scale: sm(t, s13.esc - 0.3, s13.esc + 0.1, outBack) });
      txt('ELE QUER TE VER LIVRE.', 700, 570, 96, { w: 900, color: WH, glow: 'rgba(255,200,120,0.7)', blur: 40, scale: sm(t, s13.liv - 0.3, s13.liv + 0.1, outBack) });
    }
    function scene14(t) { // CTA
      scr(); ctx.fillStyle = '#0b0b0e'; ctx.fillRect(0, 0, W, H); glow(960, 540, 900, 'rgba(242,184,75,A)', 0.12);
      loop(t, { x: 330, y: 1010, s: 1.4, exp: 'sorriso', look: [1, -0.3], arms: 'point', light: [1, 0] });
      const ck = sm(t, s14.com - 0.3, s14.com + 0.1, outBack); if (ck > 0) { ctx.save(); ctx.translate(1150, 360); ctx.scale(ck, ck); rr(-560, -150, 1120, 300, 30); ctx.fillStyle = '#1c1c22'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#33333c'; ctx.stroke();
        circ(-470, -70, 40, '#3a3a44'); txt('COMENTA AQUI', -400, -80, 34, { w: 900, color: GOLD, align: 'left' });
        txt('"Eu quero ser', -470, 0, 64, { w: 800, align: 'left', italic: true }); txt('livre."', -470, 76, 64, { w: 800, color: GOLD, align: 'left', italic: true, a: prog(t, s14.liv - 0.3, s14.liv) }); ctx.restore(); }
      chip('COMPARTILHA COM QUEM PRECISA', 1150, 620, 36, sm(t, s14.cmp - 0.2, s14.cmp + 0.2), { fill: WH });
      const bk = sm(t, s14.ins - 0.3, s14.ins + 0.1, outBack), press = t > s14.ins + 0.3;
      if (bk > 0) { ctx.save(); ctx.translate(1150, 800); const pr = bk * (1 - 0.06 * pulse(t, s14.ins + 0.3, 0.03, 0.15)); ctx.scale(pr, pr); rr(-220, -60, 440, 120, 60); ctx.fillStyle = press ? '#3a3a44' : RED; ctx.fill(); txt(press ? 'INSCRITO ✓' : 'INSCREVER-SE', 0, 3, 42, { w: 900 }); ctx.restore(); }
    }

    // ======================= LEGENDAS =======================
    const HL = new Set(['ultima', 'prisao', 'curiosidade', 'clique', 'cansaco', 'solidao', 'ansiedade', 'presta', 'deus', 'condenacao', 'cristo', 'vergonha', 'graca', 'ama', 'cai', 'desculpa', 'forca', 'levantar', 'oportunidade', 'celular', 'filtro', 'fugir', 'conta', 'pastor', 'amigo', 'psicologo', 'luz', 'gatilho', 'tedio', 'ora', 'levanta', 'liga', 'confessa', 'continua', 'perdoar', 'semana', 'mes', 'lutando', 'escondido', 'livre', 'comenta', 'compartilha', 'inscreve']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 5 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 30)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.3; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 50, text = g.map(w => w.text).join(' '), total = tw(text, size, 800), sc = Math.min(1, 1500 / total);
      ctx.save(); ctx.translate(960, 1005); ctx.scale(sc, sc); ctx.globalAlpha = prog(t, g.t0, g.t0 + 0.12); let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text + ' ', ww = tw(s, size, 800), said = t >= w.start - 0.02; ctx.font = `800 ${size}px Inter`; ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (HL.has(w.norm) ? GOLD : '#ffffff') : 'rgba(255,255,255,0.55)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12, scene13, scene14];
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1;
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      ctx.globalAlpha = 0.25; const f = Math.floor(t * 12); ctx.drawImage(grain, -((f * 37) % 40), -((f * 53) % 40), W + 40, H + 40); ctx.globalAlpha = 1; ctx.drawImage(vig, 0, 0);
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / 0.22); if (fl > 0) { ctx.globalAlpha = fl; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t);
    }

    // capa do YouTube (1920x1080; reduzir para 1280x720)
    function thumb(c, v) {
      ctx = c; scr(); ctx.globalAlpha = 1;
      const g = ctx.createRadialGradient(1300, 540, 50, 1300, 540, 1300); g.addColorStop(0, '#1a2236'); g.addColorStop(1, '#07080c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (v === 2) { glow(1700, 120, 900, 'rgba(255,214,150,A)', 0.35); }
      loop(0.9, { x: 1500, y: 1950, s: 3.2, exp: v === 2 ? 'determinado' : 'culpado', look: v === 2 ? [-0.6, -0.6] : [0, 0.6], tear: v === 2 ? 0 : 1, arms: v === 2 ? 'fist' : 'phone', tint: v === 2 ? null : 'rgba(95,180,255,0.12)', light: [-1, -0.6] });
      if (v !== 2) glow(1500, 1000, 700, 'rgba(95,180,255,A)', 0.45);
      ctx.drawImage(vig, 0, 0);
      const L = v === 2 ? [['LIVRE.', WH]] : [['O SEGREDO.', WH]];
      L.forEach((l, i) => { ctx.save(); ctx.translate(90, 330 + i * 230); ctx.rotate(-0.04); ctx.font = 'italic 900 200px Inter'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 34; ctx.strokeStyle = '#000'; ctx.strokeText(l[0], 0, 0); ctx.fillStyle = l[1]; ctx.fillText(l[0], 0, 0); ctx.restore(); });
      { const s = v === 2 ? 'DO VÍCIO QUE NINGUÉM VÊ' : 'QUE NINGUÉM VÊ', fz = 64, w = tw(s, fz, 900) + 70; ctx.save(); ctx.translate(100, 560); ctx.rotate(-0.04); rr(0, -62, w, 124, 14); ctx.fillStyle = v === 2 ? GOLD : RED; ctx.fill(); txt(s, w / 2, 2, fz, { w: 900, color: v === 2 ? INK : WH }); ctx.restore(); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { thumb, draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
