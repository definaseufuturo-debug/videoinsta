/*
 * O DIA EM QUE O SOL PAROU (Josué 10). História que surpreende, pergaminho, 9:16 (perfil cristão).
 * Contornos: Natural Earth 10m (assets/regiao.json). Locais: identificações tradicionais aproximadas
 * (Gilgal perto de Jericó; Gibeom = el-Jib; Bete-Horom = Beit Ur; Aijalom = Yalo; Azeca = Tel Azeca).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const GEO = (typeof require === 'function') ? require('../assets/regiao.json') : null;
  const W = 1080, H = 1920, TAU = Math.PI * 2, K = Math.cos((GEO ? GEO.lat_ref : 31.8) * Math.PI / 180);
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  const PAPER = '#efe2c4', SEA = '#c9d6cf', LAND = '#e6d3a6', COAST = '#8b6b3d', INK = '#3b2a1a', MUTE = '#7a6248', GOLD = '#c08a1e';
  const RED = '#b23a2e', BLUE = '#2f5d8a', RIVER = '#4f86b0', GREEN = '#3c7a3e', SUN = '#f0a020', SUN2 = '#ffd86a';

  function create(TL, env) {
    const mk = env.createCanvas, G = env.geo || GEO;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = TL.clips.length;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot); ctx.font = `${o.it ? 'italic ' : ''}${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || PAPER; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || INK; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.3, w = o.w || 700; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || INK }); cx += ws[i] + sp; }); }
    function plaque(s, x, y, size, k, o = {}) { if (k <= 0) return; const w = tw(s, size, 900) + size * 1.0, h = size * 1.6, sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = o.fill || '#f7eed6'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 4; ctx.strokeStyle = o.col || INK; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14); txt(s, 0, 3, size, { w: 900, color: o.col || INK }); ctx.restore(); ga(1); }
    function stamp(s, x, y, k, o = {}) { if (k <= 0) return; const sc = lerp(2.2, 1, outC(k)), size = o.size || 80, w = tw(s, size, 900) + 60, h = size * 1.4; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.92)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 9; ctx.strokeStyle = o.col || RED; ctx.strokeRect(-w / 2, -h / 2, w, h); txt(s, 0, 4, size, { w: 900, color: o.col || RED }); ctx.restore(); ga(1); }

    const tex = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); let s = 9; const R0 = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 60000; i++) { g.fillStyle = R0() < 0.5 ? 'rgba(120,80,30,0.05)' : 'rgba(255,255,255,0.06)'; g.fillRect(R0() * W, R0() * H, 1 + R0() * 2, 1 + R0() * 2); }
      const gr = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); gr.addColorStop(0, 'rgba(90,55,20,0)'); gr.addColorStop(1, 'rgba(90,55,20,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ---------------- câmera e mapa ----------------
    const RECT = [20, 430, 1040, 1000];
    const box = (lo0, lo1, la0, la1) => { const x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(RECT[2] / (x1 - x0), RECT[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    const FULL = box(34.70, 35.62, 31.50, 32.06);
    const MID = box(34.88, 35.55, 31.70, 32.00);
    const WEST = box(34.85, 35.27, 31.66, 31.95);
    const camLerp = (a, b, k) => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) });
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const ll = (cam, lo, la) => toS(cam, [lo * K, -la]);
    const inRect = (x, y, m = 0) => x > RECT[0] + m && x < RECT[0] + RECT[2] - m && y > RECT[1] + m && y < RECT[1] + RECT[3] - m;
    function clipMap() { ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); }
    const landPath = () => { ctx.beginPath(); for (const r of G.land) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } };
    const HILLS = []; { let s = 11; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 220; i++) { const lo = 34.95 + R() * 0.45, la = 31.5 + R() * 0.55; HILLS.push([lo, la, 0.006 + R() * 0.01]); } }
    const P = { gil: [35.475, 31.862], gib: [35.183, 31.847], jer: [35.235, 31.778], bh: [35.113, 31.887], aij: [34.99, 31.84], aze: [34.936, 31.700],
      heb: [35.10, 31.53], laq: [34.849, 31.565], egl: [34.76, 31.60], jar: [34.975, 31.708] };
    function drawMap(cam, o = {}) {
      ctx.save(); clipMap();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      landPath(); ctx.fillStyle = LAND; ctx.fill('nonzero');
      ctx.save(); landPath(); ctx.clip('nonzero'); ctx.fillStyle = 'rgba(160,120,60,0.08)'; for (const [lo, la, r] of HILLS) { ctx.beginPath(); ctx.ellipse(lo * K, -la, r * 1.6, r, 0, 0, TAU); ctx.fill(); } ctx.restore();
      if (G.rivers) { ctx.beginPath(); for (const r of G.rivers) r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = RIVER; ctx.lineWidth = 3 / cam.s; ctx.stroke(); }
      ctx.beginPath(); for (const r of G.lakes) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } ctx.fillStyle = SEA; ctx.fill(); ctx.lineWidth = 1.5 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.restore();
      { const [x, y] = ll(cam, 35.53, 31.62); if (inRect(x, y, 60)) txt('MAR MORTO', x, y, 26, { w: 800, it: true, color: RIVER }); }
      { const [x, y] = ll(cam, 34.72, 31.95); if (inRect(x, y, 60)) txt('MAR GRANDE', x, y, 26, { w: 800, it: true, color: RIVER }); }
      if (o.night > 0) { ctx.fillStyle = `rgba(14,18,40,${0.6 * o.night})`; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
      ctx.restore();
    }
    function frame() { ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
    function header() { spaced('O DIA EM QUE O SOL PAROU', 540, 140, 46, { sp: 7 }); txt('Josué 10', 540, 210, 30, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(200, 245, 680, 3); }
    function arrowHead(x, y, ang, col, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, -13); ctx.lineTo(-12, 13); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    function place(cam, p, name, k, o = {}) { if (k <= 0) return; const [x, y] = ll(cam, p[0], p[1]); if (!inRect(x, y, 10)) return; ctx.save(); clipMap(); const e = outBack(k);
      ctx.beginPath(); ctx.arc(x, y, (o.r || 12) * e, 0, TAU); ctx.fillStyle = o.col || INK; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke();
      txt(name, x + (o.dx ?? 0), y + (o.dy ?? -36), o.size || 32, { w: 900, color: o.col || INK, stroke: 9, a: clamp(k * 2), align: o.align || 'center' }); ctx.restore(); }
    // rota desenhada (lista de [lon,lat]) até a fração k
    function route(cam, pts, k, col, o = {}) { if (k <= 0) return null; const S = pts.map(p => ll(cam, p[0], p[1])); let L = 0; const seg = []; for (let i = 1; i < S.length; i++) { const d = Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]); seg.push(d); L += d; }
      let rem = L * clamp(k); ctx.save(); clipMap(); ctx.beginPath(); ctx.moveTo(S[0][0], S[0][1]); let end = S[0], ang = 0;
      for (let i = 1; i < S.length && rem > 0; i++) { const f = Math.min(1, rem / seg[i - 1]); end = [lerp(S[i - 1][0], S[i][0], f), lerp(S[i - 1][1], S[i][1], f)]; ang = Math.atan2(S[i][1] - S[i - 1][1], S[i][0] - S[i - 1][0]); ctx.lineTo(end[0], end[1]); rem -= seg[i - 1]; }
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(o.dash || []); ctx.lineWidth = o.lw || 9; ctx.strokeStyle = col; ctx.stroke(); ctx.setLineDash([]);
      arrowHead(end[0], end[1], ang, col, o.head || 1.6); ctx.restore(); return end; }
    function panel(k, y = 1240, h = 300) { if (k <= 0) return null; const s = outBack(k); ctx.save(); ctx.translate(540, y); ctx.scale(s, s); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.97)'; ctx.fillRect(-470, -h / 2, 940, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-470, -h / 2, 940, h); ctx.strokeRect(-460, -h / 2 + 10, 920, h - 20); return true; }
    const endPanel = () => { ctx.restore(); ga(1); };

    // ---------------- céu (cenas do sol) ----------------
    const SKY = [60, 430, 960, 900];
    function sky(k, o = {}) { const [x0, y0, w, h] = SKY; ctx.save(); ga(k); const g = ctx.createLinearGradient(0, y0, 0, y0 + h); const d = o.dusk || 0;
      g.addColorStop(0, d > 0 ? lerpCol('#bcd6e6', '#3b3f6b', d) : '#bcd6e6'); g.addColorStop(1, d > 0 ? lerpCol('#f4e6c4', '#e8a060', d) : '#f4e6c4'); ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h);
      // serras
      ctx.fillStyle = '#c9b07c'; ctx.beginPath(); ctx.moveTo(x0, y0 + h); for (let x = 0; x <= w; x += 40) ctx.lineTo(x0 + x, y0 + h - 150 - 50 * Math.sin(x * 0.012) - 30 * Math.sin(x * 0.031)); ctx.lineTo(x0 + w, y0 + h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a88a55'; ctx.beginPath(); ctx.moveTo(x0, y0 + h); for (let x = 0; x <= w; x += 40) ctx.lineTo(x0 + x, y0 + h - 80 - 35 * Math.sin(x * 0.02 + 1)); ctx.lineTo(x0 + w, y0 + h); ctx.closePath(); ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(x0, y0, w, h); ctx.restore(); ga(1); }
    function lerpCol(a, b, t) { const pa = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16)); return 'rgb(' + pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(',') + ')'; }
    function sun(x, y, r, k, t, glow = 1) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); const g = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2.6); g.addColorStop(0, `rgba(255,210,90,${0.6 * glow})`); g.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = g; ctx.fillRect(-r * 3, -r * 3, r * 6, r * 6);
      ctx.strokeStyle = SUN; ctx.lineWidth = r * 0.12; ctx.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * 0.3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25); ctx.lineTo(Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.6); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = SUN2; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = SUN; ctx.stroke(); ctx.restore(); }
    function moon(x, y, r, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = '#f6f1e0'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = MUTE; ctx.stroke(); ctx.fillStyle = 'rgba(122,98,72,0.25)'; for (const [a, b, c] of [[-0.3, -0.2, 0.18], [0.3, 0.25, 0.14], [0.1, -0.45, 0.1]]) { ctx.beginPath(); ctx.arc(a * r, b * r, c * r, 0, TAU); ctx.fill(); } ctx.restore(); }
    // homem de pé (silhueta sem rosto), braço erguido
    function man(x, y, s, arm, col = INK) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(0, -90); ctx.lineTo(28, 0); ctx.moveTo(0, -90); ctx.lineTo(0, -190); ctx.stroke();
      const a = lerp(0.6, -1.15, arm); ctx.beginPath(); ctx.moveTo(0, -175); ctx.lineTo(Math.cos(a) * 60, -175 + Math.sin(a) * 60 + 0); ctx.lineTo(Math.cos(a) * 115, -175 + Math.sin(a) * 115); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -175); ctx.lineTo(-40, -120); ctx.lineTo(-48, -70); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-30, -180); ctx.lineTo(-44, -40); ctx.lineTo(44, -40); ctx.lineTo(30, -180); ctx.closePath(); ctx.globalAlpha *= 0.85; ctx.fill(); ctx.globalAlpha /= 0.85;
      ctx.beginPath(); ctx.arc(0, -222, 28, 0, TAU); ctx.fill(); ctx.restore(); }
    // pedras de granizo
    const HAIL = []; { let s = 31; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 90; i++) HAIL.push([R(), R(), 8 + R() * 16]); }
    function hail(t, t0, k) { if (k <= 0) return; ctx.save(); clipMap(); for (const [fx, ph, r] of HAIL) { const yy = ((t - t0) * 0.9 + ph) % 1; const x = RECT[0] + fx * RECT[2] + yy * 60, y = RECT[1] + yy * RECT[3]; ga(k * 0.95); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#6f8aa0'; ctx.stroke(); ctx.strokeStyle = 'rgba(111,138,160,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 30, y - 70); ctx.lineTo(x - 4, y - r); ctx.stroke(); } ga(1); ctx.restore(); }
    // pergaminho (livro)
    function scroll(x, y, s, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * outBack(k), s * outBack(k)); ga(clamp(k * 3)); ctx.fillStyle = '#f3e3bd'; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.fillRect(-260, -170, 520, 340); ctx.strokeRect(-260, -170, 520, 340);
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 270, 0, 30, 190, 0, 0, TAU); ctx.fillStyle = '#d6b781'; ctx.fill(); ctx.stroke(); }
      ctx.fillStyle = 'rgba(59,42,26,0.35)'; for (let i = 0; i < 7; i++) ctx.fillRect(-200, -110 + i * 36, 400 - (i % 3) * 50, 10);
      ctx.restore(); ga(1); }

    // ---------------- tempos ----------------
    const s1 = { ord: wt('c1', 'ordem'), sol: wt('c1', 'sol', 1), par: wt('c1', 'parou') };
    const s2 = { jos: wt('c2', 'josue'), cin: wt('c2', 'cinco'), exe: wt('c2', 'exercitos'), cer: wt('c2', 'cercam'), gib: wt('c2', 'gibeom'), paz: wt('c2', 'paz') };
    const s3 = { soc: wt('c3', 'socorro'), noi: wt('c3', 'noite'), gil: wt('c3', 'gilgal'), vin: wt('c3', 'vinte'), sub: wt('c3', 'subindo'), mil: wt('c3', 'mil'), ser: wt('c3', 'serra') };
    const s4 = { rep: wt('c4', 'repente'), fog: wt('c4', 'fogem'), lad: wt('c4', 'ladeira'), bet: wt('c4', 'bete') };
    const s5 = { sur: wt('c5', 'surpresa'), ped: wt('c5', 'pedras'), gra: wt('c5', 'granizo'), mor: wt('c5', 'morrem'), esp: wt('c5', 'espada') };
    const s6 = { aca: wt('c6', 'acabando'), pov: wt('c6', 'povo'), sol: wt('c6', 'sol'), gib: wt('c6', 'gibeom'), lua: wt('c6', 'lua'), aij: wt('c6', 'aijalom') };
    const s7 = { par: wt('c7', 'parou'), mei: wt('c7', 'meio'), apr: wt('c7', 'apressou'), dia: wt('c7', 'dia'), int: wt('c7', 'inteiro') };
    const s8 = { liv: wt('c8', 'livro'), nao: wt('c8', 'temos'), jus: wt('c8', 'justos') };
    const s9 = { for: wt('c9', 'forte'), nun: wt('c9', 'nunca'), ant: wt('c9', 'antes'), dep: wt('c9', 'depois'), ate: wt('c9', 'atendeu'), hom: wt('c9', 'homem') };
    const s10 = { mai: wt('c10', 'maior'), par: wt('c10', 'parar'), ouv: wt('c10', 'ouvir'), lut: wt('c10', 'lutar') };
    const s11 = { voc: wt('c11', 'voce'), com: wt('c11', 'comenta'), seg: wt('c11', 'segue'), jon: wt('c11', 'jonas'), cen: wt('c11', 'cento') };

    cue(0, 'music', { part: 'intro' }); cue(s1.ord, 'riser', { dur: 0.8 }); cue(s1.par, 'stamp'); cue(B[1], 'music', { part: 'safe' });
    cue(s2.jos, 'pop'); cue(s2.cin, 'impact', { gain: 0.5 }); cue(s2.cer, 'swoosh'); cue(s2.gib, 'pop');
    cue(s3.noi, 'bell'); cue(s3.gil, 'whoosh', { dur: 1.2 }); cue(s3.vin, 'pop'); cue(s3.mil, 'stamp');
    cue(s4.rep, 'impact', { gain: 0.7 }); cue(s4.fog, 'whoosh', { dur: 1.0 });
    cue(s5.ped, 'crack'); cue(s5.ped + 0.3, 'crack'); cue(s5.gra, 'impact', { gain: 0.6 }); cue(s5.esp, 'stamp');
    cue(s6.aca, 'riser', { dur: 1.0 }); cue(s6.sol, 'reveal'); cue(s6.lua, 'ding', { gain: 0.5 });
    cue(s7.par, 'impact', { gain: 0.6 }); cue(s7.int, 'stamp'); cue(B[8], 'music', { part: 'outro' });
    cue(s8.liv, 'pop'); cue(s8.jus, 'reveal');
    cue(s9.nun, 'impact', { gain: 0.6 }); cue(s9.hom, 'ding', { gain: 0.6 });
    cue(s10.par, 'minus'); cue(s10.ouv, 'reveal');
    cue(s11.com, 'notif'); cue(s11.seg + 0.2, 'tap'); cue(s11.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });

    // ---------------- cenas ----------------
    function scene1(t) {
      const dusk = 0.5 - 0.5 * sm(t, s1.par - 0.4, s1.par + 0.3); sky(1, { dusk });
      const ap = sm(t, 0, s1.par, x => x), sx = lerp(840, 560, ap), sy = 600 + Math.pow((sx - 540) / 420, 2) * 520; // arco do sol descendo, para perto do alto
      sun(sx, Math.min(sy, 1100), 70, 1, t);
      man(300, 1250, 1.5, sm(t, s1.ord - 0.3, s1.ord + 0.3));
      if (t > s1.par - 0.3) stamp('O SOL PAROU', 540, 380, prog(t, s1.par - 0.3, s1.par), { size: 92 });
      else plaque('UMA ORDEM AO SOL', 540, 360, 52, prog(t, 0.1, 0.5));
    }
    const KINGS = [['heb', 'HEBROM'], ['laq', 'LAQUIS'], ['egl', 'EGLOM'], ['jar', 'JARMUTE'], ['jer', 'JERUSALÉM']];
    function scene2(t) {
      const cam = FULL; drawMap(cam);
      const ck = prog(t, s2.cin - 0.3, s2.exe + 0.4);
      KINGS.forEach(([p, n], i) => { const k = prog(ck, i * 0.12, i * 0.12 + 0.4); place(cam, P[p], n, k, { col: RED, size: 26, dy: p === 'jer' ? 34 : (p === 'egl' ? -30 : 32), dx: p === 'egl' ? 40 : 0 }); });
      const ak = sm(t, s2.cer - 0.3, s2.gib + 0.3); KINGS.forEach(([p], i) => route(cam, [P[p], [lerp(P[p][0], P.gib[0], 0.86), lerp(P[p][1], P.gib[1], 0.86)]], ak, RED, { lw: 7, head: 1.3 }));
      place(cam, P.gib, 'GIBEOM', prog(t, s2.gib - 0.3, s2.gib), { col: BLUE, dy: -40, size: 36, r: 15 });
      frame();
      if (t > s2.cin - 0.3) stamp('5 REIS', 540, 600, prog(t, s2.cin - 0.3, s2.cin), { size: 96 });
      if (t > s2.paz - 0.4) plaque('FEZ PAZ COM ISRAEL (10:1)', 540, 360, 40, prog(t, s2.paz - 0.4, s2.paz), { col: BLUE });
      else plaque('JOSUÉ 10:5', 540, 360, 52, prog(t, B[1], B[1] + 0.3));
    }
    function elevation(k, km) { // perfil de altitude Gilgal -> Gibeom
      if (panel(k, 1250, 300)) { const x0 = -400, x1 = 400, yb = 90, yt = -80; const alt = f => lerp(-250, 770, Math.pow(f, 0.8)) + 60 * Math.sin(f * 14) * f;
        ctx.beginPath(); ctx.moveTo(x0, yb); for (let f = 0; f <= 1.001; f += 0.02) ctx.lineTo(lerp(x0, x1, f), lerp(yb, yt, (alt(f) + 250) / 1100)); ctx.lineTo(x1, yb); ctx.closePath(); ctx.fillStyle = 'rgba(168,138,85,0.35)'; ctx.fill();
        const f = clamp(km); ctx.beginPath(); for (let g = 0; g <= f + 0.001; g += 0.02) { const x = lerp(x0, x1, g), y = lerp(yb, yt, (alt(g) + 250) / 1100); g ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.lineWidth = 8; ctx.strokeStyle = BLUE; ctx.stroke();
        txt('GILGAL −250 m', x0 + 10, yb + 40, 26, { w: 800, color: MUTE, align: 'left' }); txt('GIBEOM ~770 m', x1 - 10, yt - 34, 26, { w: 800, color: MUTE, align: 'right' }); endPanel(); } }
    function scene3(t) {
      const nk = sm(t, s3.noi - 0.4, s3.noi + 0.4), cam = MID; drawMap(cam, { night: nk });
      place(cam, P.gib, 'GIBEOM', 1, { col: BLUE, dy: -40, size: 34, r: 14 }); place(cam, P.gil, 'GILGAL', prog(t, s3.gil - 0.3, s3.gil), { col: INK, dy: 40, size: 32 });
      const rk = sm(t, s3.gil, s3.ser + 0.3, x => x); route(cam, [P.gil, [35.40, 31.85], [35.32, 31.83], [35.25, 31.84], [P.gib[0] + 0.012, P.gib[1]]], rk, '#f7eed6', { lw: 10, dash: [18, 14] });
      frame();
      const km = Math.round(lerp(0, 26, rk)); if (t > s3.vin - 0.4) { txt('+' + km + ' km', 540, 560, 100, { w: 900, color: '#f7eed6', stroke: 14, sc: INK }); }
      elevation(prog(t, s3.sub - 0.5, s3.sub), rk);
      if (t > s3.mil - 0.2) stamp('+1.000 m', 800, 1110, prog(t, s3.mil - 0.2, s3.mil + 0.1), { size: 70, col: BLUE });
      plaque(t > s3.noi - 0.3 ? 'A NOITE INTEIRA (10:9)' : 'SOCORRO! (10:6)', 540, 360, 46, prog(t, B[2], B[2] + 0.3), { col: BLUE });
      txt('distância em linha reta, aproximada', 540, 1420, 24, { w: 600, color: MUTE, a: prog(t, s3.vin, s3.vin + 0.3) });
    }
    function scene4(t) {
      const cam = camLerp(MID, WEST, sm(t, B[3], B[3] + 1.0)); drawMap(cam);
      place(cam, P.gib, 'GIBEOM', 1, { col: BLUE, dy: -40, size: 34, r: 14 });
      const fk = sm(t, s4.fog - 0.2, s4.bet + 1.2, x => x);
      for (let i = 0; i < 4; i++) route(cam, [[P.gib[0] - 0.01, P.gib[1] + 0.01 * (i - 1.5)], [P.bh[0], P.bh[1] + 0.006 * (i - 1.5)], [35.04, 31.80 + 0.006 * i], [P.aze[0] + 0.03, P.aze[1] + 0.03 + 0.008 * i]], clamp(fk - i * 0.05), RED, { lw: 6, head: 1.2 });
      place(cam, P.bh, 'BETE-HOROM', prog(t, s4.lad - 0.3, s4.lad), { col: INK, dy: -36, size: 28 }); place(cam, P.aze, 'AZECA', prog(t, s4.bet, s4.bet + 0.5), { col: INK, dy: 36, size: 28 });
      if (t > s4.rep - 0.1 && t < s4.rep + 0.2) { ga(0.25); ctx.fillStyle = '#fff3d0'; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); ga(1); }
      frame();
      plaque('DE REPENTE (10:9)', 540, 360, 52, prog(t, s4.rep - 0.3, s4.rep), { col: RED });
      if (t > s4.fog - 0.2) stamp('FOGEM', 540, 1300, prog(t, s4.fog - 0.2, s4.fog + 0.1), { size: 96 });
    }
    function scene5(t) {
      const cam = WEST; drawMap(cam); place(cam, P.bh, 'BETE-HOROM', 1, { col: INK, dy: -36, size: 28 }); place(cam, P.aze, 'AZECA', 1, { col: INK, dy: 36, size: 28 });
      for (let i = 0; i < 4; i++) route(cam, [[P.gib[0] - 0.01, P.gib[1] + 0.01 * (i - 1.5)], [P.bh[0], P.bh[1] + 0.006 * (i - 1.5)], [35.04, 31.80 + 0.006 * i], [P.aze[0] + 0.03, P.aze[1] + 0.03 + 0.008 * i]], 1, RED, { lw: 6, head: 1.2 });
      hail(t, B[4], sm(t, s5.ped - 0.3, s5.ped + 0.2)); frame();
      plaque('PEDRAS DO CÉU (10:11)', 540, 360, 50, prog(t, s5.sur - 0.3, s5.sur), { col: BLUE });
      const bk = sm(t, s5.mor - 0.2, s5.esp + 0.3);
      if (panel(prog(t, s5.mor - 0.4, s5.mor), 1240, 300)) {
        txt('PEDRAS', -300, -60, 44, { w: 900, color: BLUE, align: 'center' }); ctx.fillStyle = BLUE; ctx.fillRect(-160, -90, 560 * bk, 60);
        txt('ESPADA', -300, 60, 44, { w: 900, color: RED, align: 'center' }); ctx.fillStyle = RED; ctx.fillRect(-160, 30, 360 * bk, 60);
        txt('morreram mais pelas pedras (10:11)', 0, 128, 26, { w: 700, color: MUTE, a: bk }); endPanel(); }
    }
    function scene6(t) {
      const cam = WEST; const dk = sm(t, s6.aca - 0.4, s6.aca + 0.6) * 0.8; drawMap(cam, { night: dk * 0.7 });
      place(cam, P.gib, 'GIBEOM', 1, { col: BLUE, dy: 44, size: 34, r: 14 }); place(cam, P.aij, 'VALE DE AIJALOM', prog(t, s6.aij - 0.4, s6.aij), { col: INK, dy: 44, size: 30 });
      const [gx, gy] = ll(cam, P.gib[0], P.gib[1]), [ax, ay] = ll(cam, P.aij[0], P.aij[1]);
      ctx.save(); clipMap(); sun(gx, gy - 170, 62, outBack(prog(t, s6.sol - 0.2, s6.sol + 0.2)), t); moon(ax, ay - 170, 44, outBack(prog(t, s6.lua - 0.2, s6.lua + 0.2))); ctx.restore();
      frame();
      plaque(t > s6.pov - 0.3 ? 'DIANTE DE TODO O POVO' : 'O DIA ESTÁ ACABANDO', 540, 360, 46, prog(t, B[5], B[5] + 0.3), { col: t > s6.pov - 0.3 ? BLUE : RED });
      if (panel(prog(t, s6.sol - 0.4, s6.sol), 1260, 280)) { const a = 1;
        txt('"Sol, detém-te em Gibeom,', 0, -70, 50, { w: 800, it: true, a: prog(t, s6.sol - 0.3, s6.sol) });
        txt('e tu, lua, no vale de Aijalom."', 0, 0, 50, { w: 800, it: true, a: prog(t, s6.lua - 0.3, s6.lua) });
        txt('JOSUÉ 10:12', 0, 80, 34, { w: 900, color: MUTE, a }); endPanel(); }
    }
    function scene7(t) {
      sky(1, { dusk: 0 });
      // arco do sol: anda até o meio e para; o relógio de sol mostra a sombra parada
      const ap = sm(t, B[6], s7.par, x => x), cx = 540, r = 380; const ang = lerp(Math.PI * 0.95, Math.PI * 1.5, ap); const sx = cx + Math.cos(ang) * r, sy = 1180 + Math.sin(ang) * r * 0.95;
      ctx.save(); ctx.setLineDash([10, 14]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(122,98,72,0.6)'; ctx.beginPath(); ctx.ellipse(cx, 1180, r, r * 0.95, 0, Math.PI, TAU); ctx.stroke(); ctx.restore();
      const stopped = t > s7.par; sun(sx, sy, 66, 1, t, stopped ? 1 + 0.4 * Math.sin(t * 6) : 1);
      if (stopped) { const k = sm(t, s7.par, s7.par + 0.4); ctx.save(); ga(k); ctx.strokeStyle = RED; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(sx, sy, 120, 0, TAU); ctx.stroke(); ctx.restore(); ga(1); }
      plaque(t > s7.mei - 0.2 ? 'NO MEIO DO CÉU (10:13)' : 'O SOL PAROU', 540, 360, 50, prog(t, B[6], B[6] + 0.3), { col: RED });
      if (t > s7.apr - 0.3) stamp('NÃO SE APRESSOU A PÔR-SE', 540, 1160, prog(t, s7.apr - 0.3, s7.apr), { size: 56 });
      if (t > s7.dia - 0.3) stamp('QUASE UM DIA INTEIRO', 540, 1290, prog(t, s7.dia - 0.3, s7.dia), { size: 64, col: INK, rot: 0.05 });
    }
    function scene8(t) {
      plaque('UM LIVRO QUE NÃO TEMOS', 540, 360, 50, prog(t, B[7], B[7] + 0.3), { col: RED });
      scroll(540, 820, 1.4, prog(t, s8.liv - 0.3, s8.liv + 0.1));
      if (t > s8.nao - 0.2) { const k = sm(t, s8.nao - 0.2, s8.nao + 0.3); txt('?', 540, 820, 300, { w: 900, color: RED, a: k * 0.85, scale: outBack(k) }); }
      if (t > s8.jus - 0.3) stamp('LIVRO DOS JUSTOS', 540, 1180, prog(t, s8.jus - 0.3, s8.jus), { size: 76, col: INK });
      if (t > s8.jus) txt('(Jasar) · Josué 10:13 e 2 Samuel 1:18', 540, 1300, 32, { w: 800, color: MUTE, a: prog(t, s8.jus + 0.2, s8.jus + 0.6) });
    }
    function scene9(t) {
      plaque('O VERSÍCULO MAIS FORTE', 540, 360, 50, prog(t, B[8], B[8] + 0.3), { col: BLUE });
      if (t > s9.nun - 0.3) stamp('NUNCA HOUVE DIA IGUAL', 540, 640, prog(t, s9.nun - 0.3, s9.nun), { size: 70 });
      const ak = prog(t, s9.ant - 0.3, s9.ant), dk = prog(t, s9.dep - 0.3, s9.dep);
      txt('NEM ANTES', 300, 820, 56, { w: 900, color: MUTE, a: ak }); txt('NEM DEPOIS', 780, 820, 56, { w: 900, color: MUTE, a: dk });
      if (panel(prog(t, s9.ate - 0.4, s9.ate), 1140, 300)) { txt('o Senhor atendeu', 0, -60, 60, { w: 900, color: INK }); txt('à voz de um homem', 0, 20, 60, { w: 900, color: RED, a: prog(t, s9.hom - 0.4, s9.hom) }); txt('JOSUÉ 10:14', 0, 100, 32, { w: 900, color: MUTE }); endPanel(); }
    }
    function scene10(t) {
      plaque('O MAIOR MILAGRE', 540, 360, 56, prog(t, B[9], B[9] + 0.3), { col: RED });
      const pk = prog(t, s10.par - 0.4, s10.par); sun(540, 640, 70, outBack(prog(t, B[9], B[9] + 0.4)), t, 0.6);
      txt('NÃO FOI O SOL PARAR', 540, 820, 64, { w: 900, color: MUTE, a: prog(t, s10.mai, s10.mai + 0.3) });
      if (pk > 0) { ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(210, 822); ctx.lineTo(lerp(210, 870, outC(pk)), 822); ctx.stroke(); ctx.restore(); }
      const ok = prog(t, s10.ouv - 0.3, s10.ouv + 0.1); txt('FOI DEUS OUVIR', 540, 1020, 100, { w: 900, color: BLUE, scale: outBack(ok), a: ok });
      const lk = prog(t, s10.lut - 0.3, s10.lut + 0.1); txt('E LUTAR POR ELE', 540, 1150, 84, { w: 900, color: INK, scale: outBack(lk), a: lk });
      txt('"o Senhor pelejava por Israel" (10:14)', 540, 1280, 34, { w: 700, it: true, color: MUTE, a: lk });
    }
    function scene11(t) {
      if (t > s11.jon - 0.5) plaque('AMANHÃ: JONAS E NÍNIVE', 540, 360, 44, prog(t, s11.jon - 0.5, s11.jon), { col: BLUE });
      else plaque('VOCÊ SABIA DESSA?', 540, 360, 52, prog(t, B[10], B[10] + 0.3), { col: RED });
      const ck = outBack(prog(t, s11.com - 0.3, s11.com + 0.1));
      if (ck > 0) for (const [x, s, c] of [[290, 'EU SABIA', GREEN], [790, 'NÃO SABIA', RED]]) { ctx.save(); ctx.translate(x, 800); ctx.scale(ck, ck); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-220, -80, 440, 160); ctx.lineWidth = 7; ctx.strokeStyle = c; ctx.strokeRect(-220, -80, 440, 160); txt(s, 0, 4, 60, { w: 900, color: c }); ctx.restore(); }
      if (ck > 0) txt('comenta aqui embaixo', 540, 940, 36, { w: 800, color: MUTE, a: ck });
      sun(540, 1150, 60, 1, t, 0.4);
      const bk = sm(t, s11.seg - 0.3, s11.seg + 0.1, outBack), press = t > s11.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1420); const pr = bk * (1 - 0.06 * pulse(t, s11.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RED; ctx.fillRect(-200, -46, 400, 92); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-200, -46, 400, 92); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 46, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
    }
    // ---------------- legendas ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 60, words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 16, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), bw = total + 60, bh = size * 1.6, pop = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15));
      ctx.save(); ctx.translate(540, 1610); ctx.scale(pop, pop); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; if (cur) { ctx.fillStyle = '#e8c56a'; ctx.fillRect(x - 6, -size * 0.6, ws[i] + 12, size * 1.2); } txt(words[i], x + ws[i] / 2, 3, size, { w: 900 }); x += ws[i] + sp; }); ctx.restore(); }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.drawImage(tex, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      header(); ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t); txt('Locais: identificação tradicional aproximada.', 540, 1780, 22, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
