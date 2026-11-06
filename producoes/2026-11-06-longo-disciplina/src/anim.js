/*
 * DISCIPLINA — curta animado narrado, 16:9 (1920x1080), ~2 min, para o YouTube da Mindloop.
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

  const INK = '#0d0d10', SKIN = '#ece6dc', SKIN2 = '#c9c0b2', HOOD = '#2b2d36', HOOD2 = '#1c1d24', PANTS = '#1a1a1f', RED = '#e0262b', WH = '#f4f1ea', MUTE = '#8b8b95', GOLD = '#f2b84b', BLUE = '#5fb4ff';

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
    const s1 = { pre: wt('c1', 'precisa'), mot: wt('c1', 'motivacao'), par: wt('c1', 'parar'), esp: wt('c1', 'esperar') };
    const s2 = { seg: wt('c2', 'segunda'), pro: wt('c2', 'promete'), ago: wt('c2', 'agora'), aca: wt('c2', 'academia'), die: wt('c2', 'dieta'), est: wt('c2', 'estudo'), bai: wt('c2', 'baixa'), apl: wt('c2', 'aplicativo') };
    const s3 = { ter: wt('c3', 'terca'), des: wt('c3', 'despertador'), toc: wt('c3', 'toca'), voz: wt('c3', 'voz'), hoj: wt('c3', 'hoje'), ama: wt('c3', 'amanha'), com: wt('c3', 'compensa') };
    const s4 = { qua: wt('c4', 'quarta'), esq: wt('c4', 'esqueceu'), sex: wt('c4', 'sexta'), sof: wt('c4', 'sofa'), rol: wt('c4', 'rolando'), pes: wt('c4', 'peso') };
    const s4b = { cul: wt('c5', 'culpa'), olh: wt('c5', 'olha'), cedo: wt('c5', 'cedo'), tre: wt('c5', 'treina'), con: wt('c5', 'conclui'), fra: wt('c5', 'fraco') };
    const s10b = { mes: wt('c12', 'mes'), tra: wt('c12', 'tras'), rec: wt('c12', 'reconhece'), per: wt('c12', 'perfeito'), des: wt('c12', 'desistiu') };
    const s5 = { pre: wt('c6', 'preguica'), cum: wt('c6', 'cumpre'), von: wt('c6', 'vontade'), vai: wt('c6', 'vai'), vem: wt('c6', 'vem') };
    const s6 = { mot: wt('c7', 'motivacao'), fai: wt('c7', 'faisca'), ace: wt('c7', 'acende'), apa: wt('c7', 'apaga'), dis: wt('c7', 'disciplina'), len: wt('c7', 'lenha'), bon: wt('c7', 'bonita'), fog: wt('c7', 'fogo') };
    const s7 = { ent: wt('c8', 'entao'), dif: wt('c8', 'diferente'), mud: wt('c8', 'mudar'), peq: wt('c8', 'pequena'), dez: wt('c8', 'dez'), so: wt('c8', 'so') };
    const s8 = { pri: wt('c9', 'primeiro'), hor: wt('c9', 'horrivel'), qui: wt('c9', 'quinto'), dif: wt('c9', 'dificil'), dec: wt('c9', 'decimo'), per: wt('c9', 'percebe'), neg: wt('c9', 'negociar') };
    const s9 = { rui: wt('c10', 'ruins'), dif: wt('c10', 'diferenca'), apa: wt('c10', 'aparece'), can: wt('c10', 'cansado'), sem: wt('c10', 'sem'), apa2: wt('c10', 'aparece', 1) };
    const s10 = { dev: wt('c11', 'devagar'), con: wt('c11', 'confiar'), cad: wt('c11', 'cada'), cum: wt('c11', 'cumprida'), vot: wt('c11', 'voto'), tor: wt('c11', 'tornando') };
    const s11 = { dis: wt('c13', 'disciplina'), cas: wt('c13', 'castigar'), res: wt('c13', 'respeitar'), cum: wt('c13', 'cumprir'), pro: wt('c13', 'prometeu') };
    const s12 = { com: wt('c14', 'comenta'), qua: wt('c14', 'qual'), dez: wt('c14', 'dez'), ins: wt('c14', 'inscreve'), pro: wt('c14', 'proximo'), dop: wt('c14', 'dopamina') };

    cue(0, 'music', { part: 'intro' }); cue(s1.mot, 'zap', { gain: 0.4 }); cue(s1.esp, 'impact', { gain: 0.5 });
    cue(B[1], 'music', { part: 'groove' }); [s2.aca, s2.die, s2.est].forEach(x => cue(x, 'pop', { gain: 0.6 })); cue(s2.apl, 'success', { gain: 0.5 });
    cue(s3.toc, 'alarm'); cue(s3.voz, 'whoosh', { dur: 0.4, gain: 0.4 }); cue(s3.com, 'boing', { gain: 0.3 });
    cue(s4.qua, 'tick', { dur: 0.3 }); cue(s4.sex, 'tick', { dur: 0.3 }); cue(s4.rol, 'swoosh', { gain: 0.4 }); cue(s4.pes, 'impact', { gain: 0.4 });
    cue(s4b.cul, 'impact', { gain: 0.35 }); cue(s4b.fra, 'error', { gain: 0.35 }); cue(s10b.mes, 'riser', { dur: 0.8 }); cue(s10b.des, 'reveal', { gain: 0.5 }); cue(s5.pre, 'stamp', { gain: 0.5 }); cue(s6.fai, 'zap', { gain: 0.6 }); cue(s6.apa, 'minus', { gain: 0.4 }); cue(s6.len, 'fire'); cue(s6.fog, 'sizzle', { dur: 1.2 });
    cue(s7.dez, 'ding'); cue(s7.so, 'tick', { dur: 0.5 }); cue(s8.hor, 'error', { gain: 0.4 }); cue(s8.dec, 'success', { gain: 0.5 });
    cue(s9.rui, 'wind', { dur: 2.0 }); cue(s9.apa2, 'door'); cue(s10.cum, 'coin', { gain: 0.5 }); cue(s10.tor, 'riser', { dur: 0.8 });
    cue(B[12], 'music', { part: 'outro' }); cue(s11.res, 'reveal', { gain: 0.5 }); cue(s12.com, 'notif'); cue(s12.ins, 'tap'); cue(s12.ins + 0.05, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.3 });

    // ======================= CENAS =======================
    function scene1(t) { // quarto escuro, a lâmpada da "motivação" piscando e apagando
      room(t); windowFrame(1380, 170, 340, 380, true, false, t);
      const flick = t < s1.par ? (Math.sin(t * 37) > -0.2 || t < s1.mot ? 1 : 0.2) * (0.6 + 0.4 * Math.sin(t * 13)) : 1 - prog(t, s1.par, s1.esp + 0.3);
      // lâmpada pendurada
      line([[600, 0], [600, 260]], 4, '#3a3a42'); circ(600, 300, 44, flick > 0.4 ? '#ffe9b0' : '#4a4a52'); glow(600, 300, 600, 'rgba(255,214,140,A)', 0.4 * flick);
      chip('MOTIVAÇÃO', 600, 390, 30, sm(t, s1.mot - 0.2, s1.mot + 0.2) * (1 - prog(t, s1.esp + 0.3, s1.esp + 0.9)), { fill: 'rgba(255,233,176,0.9)' });
      bed(1100, 790); blanket(1100, 790, 0.4);
      loop(t, { x: 820, y: 900, s: 1.3, sit: true, exp: t < s1.par ? 'cansado' : 'focado', look: [-0.6, -0.8], slump: 0.6 - 0.5 * sm(t, s1.par, s1.esp), light: [-1, -1] });
      shade(700, 500, 1100, 0.4 * (1 - flick * 0.6));
      bigText([['PARE DE', WH], ['ESPERAR.', RED]], 1480, 760, 92, sm(t, s1.par - 0.2, s1.esp + 0.2));
    }
    function scene2(t) { // segunda: empolgado, lista e aplicativo
      room(t, { wall0: '#2a2d38', wall1: '#16171d' }); windowFrame(160, 150, 360, 400, false, false, t); glow(340, 350, 900, 'rgba(255,240,210,A)', 0.18);
      chip('SEGUNDA-FEIRA', 960, 120, 40, sm(t, s2.seg - 0.2, s2.seg + 0.2), { fill: WH });
      const ex = sm(t, s2.pro - 0.2, s2.ago);
      loop(t, { x: 700, y: 1000, s: 1.5, exp: t < s2.pro ? 'sorriso' : 'feliz', arms: 'hang', arms2: 'cheer', mix: ex * (1 - sm(t, s2.bai - 0.3, s2.bai)), look: [0.5, -0.4] });
      if (t > s2.bai - 0.3) loop(t, { x: 700, y: 1000, s: 1.5, exp: 'sorriso', arms: 'phone', phone: 1, look: [0, 0.6], tint: 'rgba(95,180,255,0.08)' });
      // lista de metas
      const lk = sm(t, s2.aca - 0.4, s2.aca, outBack); if (lk > 0) { ctx.save(); ctx.translate(1350, 520); ctx.rotate(0.03); ctx.scale(lk, lk); rr(-260, -260, 520, 520, 18); ctx.fillStyle = '#efe9dd'; ctx.fill(); txt('METAS', 0, -200, 46, { w: 900, color: INK });
        [['ACADEMIA', s2.aca], ['DIETA', s2.die], ['ESTUDO', s2.est]].forEach(([l, tt], i) => { const k = prog(t, tt - 0.15, tt + 0.2); ga(k); rr(-200, -120 + i * 110, 56, 56, 10); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); txt(l, -110, -92 + i * 110, 52, { w: 900, color: INK, align: 'left' }); ga(1); });
        const ak = prog(t, s2.apl - 0.2, s2.apl + 0.3); if (ak > 0) { ga(ak); rr(-150, 200, 300, 40, 20); ctx.fillStyle = '#ccc'; ctx.fill(); rr(-150, 200, 300 * outC(ak), 40, 20); ctx.fillStyle = '#2f8f4e'; ctx.fill(); txt('BAIXANDO APP...', 0, 172, 26, { w: 800, color: MUTE }); ga(1); }
        ctx.restore(); }
      bubble(700, 330, '"AGORA VAI!"', sm(t, s2.ago - 0.2, s2.ago + 0.15) * (1 - prog(t, s2.aca, s2.aca + 0.4)), INK, WH, 54);
    }
    function scene3(t) { // terça 6:00: despertador, a voz do "só hoje"
      room(t, { wall0: '#18203a', wall1: '#0b0d16' }); windowFrame(1450, 150, 300, 340, true, false, t);
      chip('TERÇA', 960, 120, 40, sm(t, s3.ter - 0.2, s3.ter + 0.2));
      bed(900, 860);
      const ring = prog(t, s3.toc - 0.1, s3.toc) * (1 - prog(t, s3.hoj, s3.hoj + 0.4));
      // mesinha e despertador
      rr(260, 700, 260, 160, 10); ctx.fillStyle = '#1d1d24'; ctx.fill(); clock(390, 640, 0.8, ring, t);
      // cabeça no travesseiro + coberta
      ctx.save(); ctx.translate(700, 740); ctx.rotate(-0.25); ctx.scale(1.25, 1.25); head(t, { exp: ring > 0.3 ? 'assustado' : 'cansado', look: [-0.8, -0.2], tint: 'rgba(40,60,120,0.12)' }); ctx.restore();
      blanket(900, 860, 0.7 + 0.1 * Math.sin(t * 2));
      const vk = sm(t, s3.voz - 0.2, s3.hoj, outBack) * (1 - prog(t, B[3] - 0.3, B[3]));
      if (vk > 0) { glow(1180, 420, 380, 'rgba(160,80,200,A)', 0.2 * vk); bubble(1200, 400, '"só hoje..."', vk, '#d9c8ff', 'rgba(40,20,60,0.92)', 54, { italic: true, tx: -140 }); bubble(1300, 560, '"amanhã você compensa"', sm(t, s3.ama - 0.2, s3.ama + 0.2), '#d9c8ff', 'rgba(40,20,60,0.92)', 40, { italic: true, tx: -200 }); }
      shade(700, 700, 1200, 0.35);
    }
    function scene4(t) { // quarta/sexta: calendário, sofá, celular, nuvem
      room(t, { wall0: '#202028', wall1: '#0e0e12' });
      const dayK = sm(t, s4.qua - 0.2, s4.qua + 0.2), sexK = sm(t, s4.sex - 0.2, s4.sex + 0.2);
      chip(sexK > 0.5 ? 'SEXTA' : 'QUARTA', 960, 120, 40, Math.max(dayK, 0.01) * (1 - pulse(t, s4.sex, 0.1, 0.2) * 0.3));
      if (t < s4.sex - 0.1) { // quarta: em pé, perdido, a lista apagando
        loop(t, { x: 760, y: 1000, s: 1.5, exp: 'neutro', look: [0.8, -0.5], arms: 'hang', tilt: 0.12 });
        ctx.save(); ctx.translate(1300, 520); ga(1 - sm(t, s4.esq, s4.esq + 1.0) * 0.85); rr(-220, -220, 440, 440, 18); ctx.fillStyle = '#efe9dd'; ctx.fill(); txt('METAS', 0, -160, 40, { w: 900, color: INK }); ['ACADEMIA', 'DIETA', 'ESTUDO'].forEach((l, i) => txt(l, 0, -60 + i * 90, 44, { w: 900, color: INK })); ga(1); ctx.restore();
        txt('?', 900, 560, 140, { w: 900, color: MUTE, a: sm(t, s4.esq, s4.esq + 0.4) });
      } else { // sexta: sofá, celular, peso
        couch(960, 900); lamp(1500, 900, 0.5, t);
        loop(t, { x: 900, y: 920, s: 1.3, sit: true, exp: t < s4.pes ? 'cansado' : 'triste', arms: 'phone', phone: 1, look: [0, 0.7], slump: 0.8, tint: 'rgba(95,180,255,0.12)' });
        cloud(900, 310, 1.2, sm(t, s4.pes - 0.3, s4.pes + 0.3), t);
        shade(900, 600, 1000, 0.42);
      }
    }
    function scene5(t) { // não é preguiça: o gráfico da vontade
      room(t, { wall0: '#1e1e26', wall1: '#0c0c10' });
      bigText([['NÃO É', WH], ['PREGUIÇA.', RED]], 960, 170, 84, sm(t, s5.pre - 0.3, s5.pre + 0.1) * (1 - sm(t, s5.cum - 0.2, s5.cum + 0.2)));
      const gk = sm(t, s5.cum - 0.3, s5.cum + 0.2); if (gk > 0) { ga(gk); const x0 = 260, x1 = 1660, y0 = 260, y1 = 760;
        line([[x0, y1], [x1, y1]], 4, '#3a3a44'); txt('VONTADE', x0, y0 - 30, 34, { w: 900, color: GOLD, align: 'left' });
        const pr = prog(t, s5.cum, s5.vem + 0.6), N = 120; ctx.beginPath(); let pts = [];
        for (let i = 0; i <= N * pr; i++) { const u = i / N, x = lerp(x0, x1, u), y = lerp(y1, y0, 0.5 + 0.42 * Math.sin(u * 14 + 0.4) * (0.8 + 0.2 * Math.sin(u * 5))); pts.push([x, y]); }
        if (pts.length > 1) { line(pts, 10, GOLD); const hi = pts.filter(p => p[1] < (y0 + y1) / 2); hi.forEach((p, i) => { if (i % 6 === 0) { line([[p[0], y1], [p[0], p[1] + 14]], 4, 'rgba(47,143,78,0.55)'); } }); }
        line([[x0, (y0 + y1) / 2], [x1, (y0 + y1) / 2]], 3, 'rgba(255,255,255,0.18)');
        txt('só cumpre aqui em cima', 1220, 220, 36, { w: 700, color: '#7fd49b', a: prog(t, s5.von, s5.von + 0.4) });
        chip('VAI', 760, 830, 40, prog(t, s5.vai - 0.15, s5.vai + 0.2), { fill: GOLD }); chip('E VEM', 1160, 830, 40, prog(t, s5.vem - 0.15, s5.vem + 0.2), { fill: GOLD });
        ga(1); }
      loop(t, { x: 150, y: 1010, s: 0.95, exp: 'culpado', look: [1, -0.3], slump: 0.4 });
    }
    function scene6(t) { // faísca x lenha
      scr(); ctx.fillStyle = '#08080b'; ctx.fillRect(0, 0, W, H);
      const sk = t < s6.apa ? sm(t, s6.ace - 0.3, s6.ace) : 1 - prog(t, s6.apa, s6.apa + 0.6);
      ctx.save(); ctx.translate(560, 520); ctx.scale(1.7, 1.7); ctx.translate(-560, -520); spark(560, 520, sk, t); ctx.restore();
      txt('MOTIVAÇÃO', 560, 820, 64, { w: 900, color: WH, a: sm(t, s6.mot - 0.2, s6.mot + 0.2) }); txt('= FAÍSCA', 560, 900, 52, { w: 800, color: GOLD, a: sm(t, s6.fai - 0.2, s6.fai + 0.2) });
      const fk = sm(t, s6.len - 0.3, s6.fog);
      fire(1360, 640, 1.3, fk, t, t > s6.dis - 0.3);
      txt('DISCIPLINA', 1360, 820, 64, { w: 900, color: WH, a: sm(t, s6.dis - 0.2, s6.dis + 0.2) }); txt('= LENHA', 1360, 900, 52, { w: 800, color: RED, a: sm(t, s6.len - 0.2, s6.len + 0.2) });
      txt('não é bonita...', 1360, 300, 40, { w: 700, color: MUTE, italic: true, a: sm(t, s6.bon - 0.2, s6.bon + 0.2) * (1 - sm(t, s6.fog - 0.3, s6.fog)) });
      txt('...mas mantém o fogo aceso', 1360, 300, 40, { w: 700, color: GOLD, italic: true, a: sm(t, s6.fog - 0.3, s6.fog + 0.1) });
      line([[960, 220], [960, 940]], 3, 'rgba(255,255,255,0.12)');
    }
    function scene7(t) { // a virada: 10 minutos
      room(t, { wall0: '#262632', wall1: '#121218' }); lamp(1560, 900, 1, t);
      rr(1060, 720, 420, 30, 8); ctx.fillStyle = '#3a2f28'; ctx.fill(); ctx.fillRect(1090, 750, 24, 160); ctx.fillRect(1426, 750, 24, 160);
      const dk = sm(t, s7.dif - 0.3, s7.dif + 0.2);
      loop(t, { x: 760, y: 1000, s: 1.5, exp: t < s7.peq ? 'focado' : 'determinado', look: [0.7, -0.3], arms: 'hang', arms2: 'point', mix: sm(t, s7.dez - 0.3, s7.dez), light: [1, -0.5] });
      txt('NÃO: "VOU MUDAR DE VIDA"', 1270, 230, 44, { w: 800, color: MUTE, a: sm(t, s7.mud - 0.2, s7.mud + 0.2) * (1 - sm(t, s7.peq - 0.2, s7.peq)) });
      if (t > s7.mud) line([[960, 232], [lerp(960, 1580, sm(t, s7.mud + 0.3, s7.mud + 0.7)), 228]], 8, RED);
      const tk = sm(t, s7.dez - 0.3, s7.dez + 0.15, outBack);
      if (tk > 0) { ctx.save(); ctx.translate(1270, 520); ctx.scale(tk, tk); circ(0, 0, 190, '#16161c'); ctx.beginPath(); ctx.arc(0, 0, 190, 0, TAU); ctx.lineWidth = 10; ctx.strokeStyle = '#2a2a33'; ctx.stroke();
        const rem = 600 - 600 * prog(t, s7.so, s7.so + 6) * 0.01; ctx.beginPath(); ctx.arc(0, 0, 190, -Math.PI / 2, -Math.PI / 2 + TAU * (rem / 600)); ctx.lineWidth = 14; ctx.strokeStyle = GOLD; ctx.lineCap = 'round'; ctx.stroke();
        txt('10:00', 0, -6, 110, { w: 900, color: WH }); txt('MINUTOS', 0, 80, 30, { w: 800, color: GOLD }); ctx.restore(); }
      chip('SÓ DEZ.', 1270, 820, 50, sm(t, s7.so - 0.2, s7.so + 0.2), { fill: RED, col: WH });
      shade(1300, 500, 1300, 0.45 * (1 - dk * 0.5));
    }
    function scene8(t) { // dia 1, 5, 12: suando, depois firme
      room(t, { wall0: '#23232c', wall1: '#101016' });
      const d = t < s8.qui - 0.2 ? 1 : t < s8.dec - 0.2 ? 5 : 12;
      chip('DIA ' + d, 960, 120, 48, 1 - 0.4 * (pulse(t, s8.qui - 0.2, 0.05, 0.3) + pulse(t, s8.dec - 0.2, 0.05, 0.3)), { fill: d === 12 ? GOLD : WH });
      calendarWall(1450, 470, 1.0, d, t, d - 1);
      const strain = d === 1 ? 1 : d === 5 ? 0.6 : 0;
      loop(t, { x: 700, y: 1010, s: 1.45, exp: d === 1 ? 'triste' : d === 5 ? 'focado' : 'determinado', look: [0.4, -0.2], arms: d === 12 ? 'fist' : 'tired', sweat: strain, tilt: Math.sin(t * 9) * 0.03 * strain });
      // vozes de negociação que somem
      const nk = d === 12 ? 1 - sm(t, s8.neg - 0.2, s8.neg + 0.8) : 1;
      ['"amanhã..."', '"hoje não..."', '"só hoje..."'].forEach((s, i) => bubble([300, 1020, 360][i], [250, 300, 420][i], s, (d === 1 ? 1 : d === 5 ? 0.75 : 0.6) * nk * clamp(t - B[8] - i * 0.3), '#d9c8ff', 'rgba(40,20,60,0.85)', 32, { italic: true, a: nk }));
      if (d === 12) chip('PAROU DE NEGOCIAR', 700, 200, 40, sm(t, s8.neg, s8.neg + 0.3), { fill: GOLD });
    }
    function scene9(t) { // dias ruins: chuva, mas ele sai
      room(t, { wall0: '#1d2130', wall1: '#0c0d13' }); windowFrame(220, 160, 420, 440, false, true, t);
      ctx.fillStyle = 'rgba(30,40,60,0.35)'; ctx.fillRect(220, 160, 420, 440);
      // porta
      const dx = 1440, open = sm(t, s9.apa2 - 0.6, s9.apa2 + 0.2); rr(dx - 130, 300, 260, 480, 6); ctx.fillStyle = '#0a0a0e'; ctx.fill(); if (open > 0) { ctx.fillStyle = `rgba(170,190,220,${0.5 * open})`; ctx.fillRect(dx - 125, 305, 250 * open, 470); }
      ctx.save(); ctx.translate(dx - 130, 300); ctx.scale(1 - 0.75 * open, 1); rr(0, 0, 260, 480, 6); ctx.fillStyle = '#3a2a22'; ctx.fill(); circ(220, 250, 12, GOLD); ctx.restore();
      const walk = t > s9.apa - 0.2 ? (t - s9.apa) * 7 : undefined, wx = lerp(700, 1300, sm(t, s9.apa, s9.apa2 + 0.4));
      loop(t, { x: wx, y: 1000, s: 1.4, exp: 'cansado', look: [1, 0], walk, slump: 0.35, flip: false });
      bigText([['CANSADO.', WH], ['SEM VONTADE.', WH], ['MAS APARECE.', RED]], 960, 140, 50, 0);
      txt('CANSADO.', 960, 120, 54, { w: 900, a: sm(t, s9.can - 0.2, s9.can + 0.1) }); txt('SEM VONTADE.', 960, 190, 54, { w: 900, a: sm(t, s9.sem - 0.2, s9.sem + 0.1) }); txt('MAS APARECE.', 960, 270, 70, { w: 900, color: RED, glow: 'rgba(224,38,43,0.5)', scale: sm(t, s9.apa2 - 0.2, s9.apa2 + 0.15, outBack) });
      shade(960, 600, 1200, 0.3);
    }
    function scene10(t) { // a confiança volta: escada de promessas cumpridas
      room(t, { wall0: '#2a2632', wall1: '#141218' }); glow(1500, 200, 1100, 'rgba(242,184,75,A)', 0.12 + 0.1 * sm(t, s10.vot, s10.tor));
      const k = sm(t, B[10] + 0.2, s10.tor + 0.3); stairsUp(460, 960, 9, k, t);
      const step = Math.min(8, Math.floor(k * 9)), sx = 460 + step * 110 + 55, sy = 960 - step * 48;
      loop(t, { x: sx, y: sy, s: 0.9, exp: t < s10.con ? 'focado' : 'sorriso', look: [0.8, -0.6], arms: 'hang', walk: k < 0.98 && k > 0 ? t * 6 : undefined });
      for (let i = 0; i < step; i++) { const xx = 460 + i * 110 + 55, yy = 960 - i * 48 - 24; line([[xx - 14, yy], [xx - 4, yy + 12], [xx + 16, yy - 12]], 6, '#2f8f4e'); }
      // medidor de confiança
      const ck = sm(t, s10.con - 0.3, s10.con + 0.2); if (ck > 0) { ga(ck); txt('CONFIANÇA EM VOCÊ', 420, 200, 36, { w: 900, color: GOLD }); rr(140, 240, 560, 36, 18); ctx.fillStyle = '#2a2a33'; ctx.fill(); rr(140, 240, 560 * (0.1 + 0.9 * k), 36, 18); ctx.fillStyle = GOLD; ctx.fill(); ga(1); }
      chip('UM VOTO EM QUEM VOCÊ ESTÁ SE TORNANDO', 520, 330, 32, sm(t, s10.vot - 0.2, s10.vot + 0.3), { fill: WH });
    }
    function scene11(t) { // nascer do sol: a frase final
      scr(); const u = sm(t, B[12], B[13]); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b2238'); g.addColorStop(0.6, lerp(0, 1, u) > 0.5 ? '#c9784e' : '#6a4a5a'); g.addColorStop(1, '#f2b36b'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      glow(960, 900, 900, 'rgba(255,214,150,A)', 0.4 + 0.3 * u);
      ctx.fillStyle = '#16121a'; ctx.beginPath(); ctx.moveTo(0, 900); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 880 - Math.sin(x * 0.003) * 60); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      loop(t, { x: 1480, y: 900, s: 1.15, exp: 'sorriso', look: [-0.5, -0.5], arms: 'hips', light: [-1, 0.2], tint: 'rgba(255,160,80,0.08)' });
      txt('DISCIPLINA NÃO É', 760, 300, 70, { w: 900, scale: sm(t, s11.dis - 0.3, s11.dis + 0.1, outBack) });
      txt('SE CASTIGAR.', 760, 390, 70, { w: 900, color: '#d8c8e6', scale: sm(t, s11.cas - 0.3, s11.cas + 0.1, outBack) });
      if (t > s11.res - 0.3) line([[560, 392], [lerp(560, 960, sm(t, s11.res - 0.3, s11.res + 0.1)), 388]], 8, RED);
      txt('É SE RESPEITAR.', 760, 540, 110, { w: 900, color: WH, glow: 'rgba(255,200,120,0.6)', blur: 40, scale: sm(t, s11.res - 0.3, s11.res + 0.1, outBack) });
      txt('e cumprir o que você mesmo prometeu', 760, 650, 44, { w: 800, color: '#fff3e0', stroke: 8, sc: 'rgba(40,20,30,0.75)', a: sm(t, s11.cum - 0.2, s11.pro + 0.3) });
    }
    function scene12(t) { // CTA
      scr(); ctx.fillStyle = '#0b0b0e'; ctx.fillRect(0, 0, W, H); glow(960, 540, 900, 'rgba(224,38,43,A)', 0.12);
      loop(t, { x: 330, y: 1010, s: 1.4, exp: 'sorriso', look: [1, -0.3], arms: 'point', light: [1, 0] });
      const ck = sm(t, s12.com - 0.3, s12.com + 0.1, outBack); if (ck > 0) { ctx.save(); ctx.translate(1150, 360); ctx.scale(ck, ck); rr(-560, -150, 1120, 300, 30); ctx.fillStyle = '#1c1c22'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#33333c'; ctx.stroke();
        circ(-470, -70, 40, '#3a3a44'); txt('COMENTA AQUI', -400, -80, 34, { w: 900, color: GOLD, align: 'left' });
        txt('Qual é a sua promessa', -470, 0, 56, { w: 800, align: 'left' }); txt('de 10 minutos?', -470, 70, 56, { w: 800, color: GOLD, align: 'left', a: prog(t, s12.dez - 0.3, s12.dez) }); ctx.restore(); }
      const bk = sm(t, s12.ins - 0.3, s12.ins + 0.1, outBack), press = t > s12.ins + 0.3;
      if (bk > 0) { ctx.save(); ctx.translate(900, 700); const pr = bk * (1 - 0.06 * pulse(t, s12.ins + 0.3, 0.03, 0.15)); ctx.scale(pr, pr); rr(-200, -60, 400, 120, 60); ctx.fillStyle = press ? '#3a3a44' : RED; ctx.fill(); txt(press ? 'INSCRITO ✓' : 'INSCREVER-SE', 0, 3, 42, { w: 900 }); ctx.restore(); }
      const nk = sm(t, s12.pro - 0.3, s12.pro + 0.1, outBack); if (nk > 0) { ctx.save(); ctx.translate(1450, 700); ctx.scale(nk, nk); txt('PRÓXIMO', 0, -60, 30, { w: 800, color: MUTE }); txt('DOPAMINA.', 0, 10, 84, { w: 900, color: WH, glow: 'rgba(95,180,255,0.6)', blur: 30, scale: 0.6 + 0.4 * sm(t, s12.dop - 0.2, s12.dop + 0.2, outBack) }); ctx.restore(); }
    }


    function sceneCulpa(t) { // a culpa: comparação com quem "tem disciplina"
      room(t, { wall0: '#1d1d25', wall1: '#16161c' });
      const pk = sm(t, s4b.olh - 0.3, s4b.olh + 0.2, outBack);
      if (pk > 0) { ctx.save(); ctx.translate(1300, 470); ctx.scale(pk, pk); rr(-230, -360, 460, 720, 46); ctx.fillStyle = '#0b0b0e'; ctx.fill(); rr(-206, -330, 412, 660, 30); const sg = ctx.createLinearGradient(0, -330, 0, 330); sg.addColorStop(0, '#f2b36b'); sg.addColorStop(1, '#6fb0e0'); ctx.fillStyle = sg; ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.roundRect(-206, -330, 412, 660, 30); ctx.clip(); ctx.fillStyle = '#2f5a3a'; ctx.fillRect(-206, 170, 412, 200);
        loop(t, { x: -20, y: 210, s: 0.9, exp: 'feliz', walk: t > s4b.tre - 0.3 ? t * 8 : undefined, arms: t < s4b.tre - 0.3 ? 'cheer' : undefined, look: [0.6, -0.3] }); ctx.restore();
        txt('ACORDOU 5H', 0, -270, 36, { w: 900, color: WH, stroke: 8, a: prog(t, s4b.cedo - 0.2, s4b.cedo + 0.2) }); txt('TREINO DIA 200', 0, -220, 30, { w: 800, color: WH, stroke: 7, a: prog(t, s4b.tre - 0.2, s4b.tre + 0.2) });
        glow(0, 0, 600, 'rgba(255,200,140,A)', 0.18); ctx.restore(); }
      loop(t, { x: 640, y: 1000, s: 1.45, exp: t < s4b.con ? 'culpado' : 'triste', look: [1, -0.3], slump: 0.5 + 0.3 * sm(t, s4b.con, s4b.fra), tear: sm(t, s4b.fra, s4b.fra + 0.6), light: [1, 0] });
      const fk = sm(t, s4b.fra - 0.25, s4b.fra + 0.1, outBack); if (fk > 0) { txt('"EU SOU FRACO."', 640, 240, 96, { w: 900, color: RED, glow: 'rgba(224,38,43,0.5)', scale: fk }); }
      chip('A CULPA', 640, 140, 40, sm(t, s4b.cul - 0.2, s4b.cul + 0.2) * (1 - fk), { fill: WH });
      shade(700, 600, 1200, 0.35);
    }
    function sceneMes(t) { // um mês depois: antes x agora
      room(t, { wall0: '#2a2630', wall1: '#1e1b24' }); glow(1300, 300, 1000, 'rgba(242,184,75,A)', 0.15);
      chip('1 MÊS DEPOIS', 960, 120, 44, sm(t, s10b.mes - 0.2, s10b.mes + 0.2), { fill: GOLD });
      calendarWall(1580, 460, 0.85, 30, t);
      const ak = sm(t, s10b.tra - 0.3, s10b.tra + 0.3);
      ga(0.55 * ak); loop(t, { x: 560, y: 1000, s: 1.2, exp: 'cansado', slump: 0.9, look: [0, 0.6], tint: 'rgba(20,20,40,0.35)' }); ga(1);
      txt('ANTES', 560, 370, 40, { w: 900, color: MUTE, a: ak });
      loop(t, { x: 1060, y: 1000, s: 1.25, exp: t < s10b.des ? 'focado' : 'sorriso', arms: t > s10b.des ? 'hips' : 'hang', look: [-1, -0.2], light: [1, -1] });
      txt('AGORA', 1060, 350, 40, { w: 900, color: GOLD, a: ak });
      txt('não ficou perfeito.', 960, 215, 44, { w: 700, color: MUTE, italic: true, a: sm(t, s10b.per - 0.2, s10b.per + 0.2) * (1 - sm(t, s10b.des - 0.3, s10b.des)) });
      txt('NÃO DESISTIU DE VOCÊ.', 960, 215, 66, { w: 900, color: WH, glow: 'rgba(242,184,75,0.6)', blur: 30, scale: sm(t, s10b.des - 0.2, s10b.des + 0.2, outBack) });
    }

    // ======================= LEGENDAS =======================
    const HL = new Set(['culpa', 'fraco', 'reconhece', 'desistiu', 'motivacao', 'esperar', 'segunda', 'agora', 'despertador', 'hoje', 'amanha', 'sofa', 'peso', 'preguica', 'vontade', 'faisca', 'disciplina', 'lenha', 'fogo', 'dez', 'horrivel', 'dificil', 'negociar', 'ruins', 'aparece', 'confiar', 'voto', 'castigar', 'respeitar', 'prometeu', 'comenta', 'inscreve', 'dopamina']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 5 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 30)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.3; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 50, text = g.map(w => w.text).join(' '), total = tw(text, size, 800), sc = Math.min(1, 1500 / total);
      ctx.save(); ctx.translate(960, 1005); ctx.scale(sc, sc); ctx.globalAlpha = prog(t, g.t0, g.t0 + 0.12); let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text + ' ', ww = tw(s, size, 800), said = t >= w.start - 0.02; ctx.font = `800 ${size}px Inter`; ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (HL.has(w.norm) ? GOLD : '#ffffff') : 'rgba(255,255,255,0.55)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, sceneCulpa, scene5, scene6, scene7, scene8, scene9, scene10, sceneMes, scene11, scene12];
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
      const g = ctx.createRadialGradient(1300, 540, 50, 1300, 540, 1300); g.addColorStop(0, '#3a2a2e'); g.addColorStop(1, '#09090c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      glow(1520, 520, 900, 'rgba(224,38,43,A)', 0.28);
      if (v === 2) { clock(1700, 200, 0.9, 1, 0.3, '6:00'); }
      loop(0.9, { x: 1520, y: 1900, s: 3.2, exp: v === 2 ? 'cansado' : 'determinado', look: [-0.6, -0.1], sweat: 1, light: [-1, -0.6], arms: 'fist' });
      ctx.drawImage(vig, 0, 0);
      const L = v === 2 ? [['SÓ HOJE...', WH]] : [['SEM', WH], ['VONTADE.', WH]];
      L.forEach((l, i) => { ctx.save(); ctx.translate(90, 300 + i * 230); ctx.rotate(-0.04); ctx.font = 'italic 900 205px Inter'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 34; ctx.strokeStyle = '#000'; ctx.strokeText(l[0], 0, 0); ctx.fillStyle = l[1]; ctx.fillText(l[0], 0, 0); ctx.restore(); });
      { const s = v === 2 ? 'AMANHÃ EU COMPENSO?' : 'E MESMO ASSIM.', fz = 64, w = tw(s, fz, 900) + 70; ctx.save(); ctx.translate(100, 820); ctx.rotate(-0.04); rr(0, -62, w, 124, 14); ctx.fillStyle = RED; ctx.fill(); txt(s, w / 2, 2, fz, { w: 900, color: WH }); ctx.restore(); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { thumb, draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
