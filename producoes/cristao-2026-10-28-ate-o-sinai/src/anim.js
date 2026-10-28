/*
 * DO MAR VERMELHO AO SINAI: Mara, Elim, o maná e Refidim (Êxodo 15:22 – 19:2). Mapa em pergaminho, 9:16 (perfil cristão).
 * Contornos: Natural Earth 10m (assets/egito.json, projeção lon*cos30, -lat). Rota tradicional aproximada (rota sul).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, K = Math.cos(30 * Math.PI / 180);
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
  const RED = '#b23a2e', BLUE = '#2f5d8a', RIVER = '#5a86a3', GREEN = '#3c7a3e';

  const C = { // lon, lat (localizações tradicionais, aproximadas)
    'margem': [32.66, 29.82], 'sur': [32.80, 29.62], 'Mara': [32.90, 29.40], 'Elim': [33.00, 29.25], 'cost': [33.13, 29.05],
    'Sim': [33.26, 28.90], 'wadi': [33.45, 28.78], 'Refidim': [33.64, 28.70], 'Sinai': [33.97, 28.54], 'Ramessés': [31.83, 30.80],
  };
  const P = n => [C[n][0] * K, -C[n][1]];
  const LOFF = { 'Mara': [-80, -6], 'Elim': [-74, 8], 'Sim': [-78, 14], 'Refidim': [0, -36], 'Sinai': [0, 52] };
  const R = [['margem'], ['sur'], ['Mara'], ['Elim'], ['cost'], ['Sim'], ['wadi'], ['Refidim'], ['Sinai']];
  const IDX = { margem: 0, sur: 1, Mara: 2, Elim: 3, Sim: 5, Refidim: 7, Sinai: 8 };
  const mkRoute = r => { const segs = []; let tot = 0; for (let i = 1; i < r.length; i++) { const a = P(r[i - 1][0]), b = P(r[i][0]), len = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, len, s0: tot }); tot += len; } return { segs, tot }; };
  const ROUTE = mkRoute(R);
  const cumAt = idx => (idx <= 0 ? 0 : ROUTE.segs[idx - 1].s0 + ROUTE.segs[idx - 1].len);
  // rota anterior (vídeo do Êxodo), em cinza
  const PREV = mkRoute([['Ramessés'], ['margem']].map(x => x));
  const REG = [['EGITO', 31.2, 29.3, 36], ['DESERTO DE SUR', 33.25, 30.15, 26], ['PENÍNSULA DO SINAI', 34.0, 29.55, 26], ['MAR VERMELHO', 33.55, 27.95, 26], ['Golfo de Suez', 32.75, 28.85, 22], ['Golfo de Ácaba', 34.75, 28.75, 22]];

  function create(TL, env) {
    const mk = env.createCanvas, G = env.geo || require('../assets/egito.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot); ctx.font = `${o.it ? 'italic ' : ''}${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || PAPER; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || INK; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.3, w = o.w || 700; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || INK }); cx += ws[i] + sp; }); }
    function plaque(s, x, y, size, k, o = {}) { if (k <= 0) return; const w = tw(s, size, 900) + size * 1.0, h = size * 1.6, sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = o.fill || '#f7eed6'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 4; ctx.strokeStyle = o.col || INK; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14); txt(s, 0, 3, size, { w: 900, color: o.col || INK }); ctx.restore(); ga(1); }
    function stamp(s, x, y, k, o = {}) { if (k <= 0) return; const sc = lerp(2.2, 1, outC(k)), size = o.size || 80, w = tw(s, size, 900) + 60, h = size * 1.4; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.88)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 9; ctx.strokeStyle = o.col || RED; ctx.strokeRect(-w / 2, -h / 2, w, h); txt(s, 0, 4, size, { w: 900, color: o.col || RED }); ctx.restore(); ga(1); }

    const tex = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); let s = 9; const R0 = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 60000; i++) { g.fillStyle = R0() < 0.5 ? 'rgba(120,80,30,0.05)' : 'rgba(255,255,255,0.06)'; g.fillRect(R0() * W, R0() * H, 1 + R0() * 2, 1 + R0() * 2); }
      const gr = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); gr.addColorStop(0, 'rgba(90,55,20,0)'); gr.addColorStop(1, 'rgba(90,55,20,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ---------------- câmera e mapa ----------------
    const RECT = [20, 430, 1040, 1000];
    const box = (lo0, lo1, la0, la1) => { const x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(RECT[2] / (x1 - x0), RECT[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    const CAMS = [box(31.4, 35.2, 27.6, 31.0), box(32.15, 33.45, 29.05, 30.05), box(32.45, 33.45, 28.75, 29.6), box(32.65, 33.85, 28.45, 29.35), box(33.0, 34.2, 28.25, 29.15), box(33.15, 34.45, 28.1, 29.05), box(31.4, 35.2, 27.6, 31.0)];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i], B[i] + 1.0); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const ll = (cam, lo, la) => toS(cam, [lo * K, -la]);
    const inRect = (x, y, m = 0) => x > RECT[0] + m && x < RECT[0] + RECT[2] - m && y > RECT[1] + m && y < RECT[1] + RECT[3] - m;
    function clipMap() { ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); }
    function drawMap(cam) {
      ctx.save(); clipMap();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.strokeStyle = 'rgba(80,110,100,0.12)'; ctx.lineWidth = 2; for (let y = RECT[1] + 20; y < RECT[1] + RECT[3]; y += 44) { ctx.beginPath(); for (let x = RECT[0]; x <= RECT[0] + RECT[2]; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.05 + y) * 4); ctx.stroke(); }
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      ctx.beginPath(); for (const r of G.land) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
      ctx.fillStyle = LAND; ctx.fill('nonzero'); ctx.lineWidth = 2.2 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.beginPath(); for (const r of G.lakes) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } ctx.fillStyle = SEA; ctx.fill(); ctx.lineWidth = 1.5 / cam.s; ctx.stroke();
      ctx.strokeStyle = RIVER; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 4 / cam.s; for (const r of G.rivers) { ctx.beginPath(); r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
      ctx.restore();
      // montanhas do sul do Sinai (decoração)
      for (const [lo, la] of [[33.75, 28.6], [34.15, 28.75], [33.85, 28.85], [34.3, 28.45], [33.55, 28.45], [34.05, 28.3]]) { const [x, y] = ll(cam, lo, la), s = clamp(cam.s / 900, 0.5, 1.6); if (!inRect(x, y, 20)) continue; ctx.beginPath(); ctx.moveTo(x - 22 * s, y + 12 * s); ctx.lineTo(x, y - 18 * s); ctx.lineTo(x + 22 * s, y + 12 * s); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(122,98,72,0.55)'; ctx.stroke(); }
      for (const [n, lo, la, sz] of REG) { const [x, y] = ll(cam, lo, la); if (inRect(x, y, 90)) txt(n, x, y, sz, { w: 800, it: n.startsWith('MAR') || n.startsWith('Golfo'), color: n.startsWith('MAR') || n.startsWith('Golfo') ? '#4f6f7f' : MUTE, a: 0.85 }); }
      ctx.restore();
    }
    function frame() { ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
    function tint(col, k) { if (k <= 0) return; ctx.save(); clipMap(); ctx.fillStyle = col; ga(k); ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.restore(); ga(1); }
    function drawRoute(cam, rt, d, o = {}) {
      let head = null; ctx.save(); clipMap(); ga(o.a ?? 1);
      for (const sg of rt.segs) {
        if (d <= sg.s0) break; const u = clamp((d - sg.s0) / sg.len), a = toS(cam, sg.a), b = toS(cam, sg.b);
        const hx = lerp(a[0], b[0], u), hy = lerp(a[1], b[1], u);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(hx, hy); ctx.lineWidth = o.w || 8; ctx.strokeStyle = o.col || RED; ctx.lineCap = 'round'; ctx.setLineDash(o.dash || []); ctx.stroke(); ctx.setLineDash([]);
        head = { x: hx, y: hy, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
      }
      ga(1); ctx.restore(); return head;
    }
    function posAt(cam, rt, d) { d = clamp(d, 0, rt.tot); for (const sg of rt.segs) if (d <= sg.s0 + sg.len + 1e-9) { const u = clamp((d - sg.s0) / sg.len), a = toS(cam, sg.a), b = toS(cam, sg.b); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.atan2(b[1] - a[1], b[0] - a[0])]; } const sg = rt.segs[rt.segs.length - 1]; return [...toS(cam, sg.b), 0]; }
    function crowd(cam, d, t, o = {}) {
      const n = o.n || 80;
      for (let i = 0; i < n; i++) { const r1 = ((i * 7919) % 997) / 997, r2 = ((i * 104729) % 991) / 991; const dd = d - r1 * (o.px || 130) / cam.s; if (dd < 0) continue; const [x, y, ang] = posAt(cam, ROUTE, dd); const off = (r2 - 0.5) * (o.wid || 44) + Math.sin(t * 3 + i) * 2; const px = x - Math.sin(ang) * off, py = y + Math.cos(ang) * off; if (!inRect(px, py)) continue; ctx.beginPath(); ctx.arc(px, py, o.r || 4.4, 0, TAU); ctx.fillStyle = i % 5 === 0 ? '#7a3b1f' : '#4a3424'; ctx.fill(); }
    }
    function head(cam, d) { const [x, y] = posAt(cam, ROUTE, d); ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke(); }
    function place(cam, n, k, o = {}) { if (k <= 0) return; const [x, y] = toS(cam, P(n)); if (!inRect(x, y)) return; const r = (o.big ? 12 : 9) * outBack(k); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); if (o.label !== false) { const [dx, dy] = o.off || LOFF[n] || [0, -30]; txt((o.name || n).toUpperCase(), x + dx, y + dy, o.size || 30, { w: 900, color: INK, stroke: 8, a: clamp(k * 2), align: o.align }); } }
    function mountain(x, y, k, o = {}) { if (k <= 0) return; const s = outBack(k) * (o.s || 1); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-50, 24); ctx.lineTo(-12, -40); ctx.lineTo(0, -30); ctx.lineTo(14, -50); ctx.lineTo(54, 24); ctx.closePath(); ctx.fillStyle = '#9b7b4f'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.moveTo(4, -36); ctx.lineTo(14, -50); ctx.lineTo(24, -34); ctx.fillStyle = '#f2ead8'; ctx.fill(); ctx.restore(); }
    function tents(x, y, k) { if (k <= 0) return; ctx.save(); ga(k); for (let i = 0; i < 7; i++) { const tx = x + ((i * 53) % 110) - 55, ty = y + ((i * 37) % 50) - 10; ctx.beginPath(); ctx.moveTo(tx - 13, ty + 9); ctx.lineTo(tx, ty - 11); ctx.lineTo(tx + 13, ty + 9); ctx.closePath(); ctx.fillStyle = '#d9c39a'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke(); } ctx.restore(); ga(1); }
    function palm(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6, -30, 2, -60); ctx.lineWidth = 7; ctx.strokeStyle = '#7a5530'; ctx.lineCap = 'round'; ctx.stroke(); const sw = Math.sin(t * 2 + x) * 0.06; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.55 + sw; ctx.beginPath(); ctx.moveTo(2, -60); ctx.quadraticCurveTo(2 + Math.cos(a) * 26, -60 + Math.sin(a) * 26 - 10, 2 + Math.cos(a) * 44, -60 + Math.sin(a) * 44 + 12); ctx.lineWidth = 6; ctx.strokeStyle = GREEN; ctx.stroke(); } ctx.restore(); }
    function spring(x, y, k, t) { if (k <= 0) return; const r = 14 * outBack(k); ctx.beginPath(); ctx.ellipse(x, y, r * 1.4, r * 0.7, 0, 0, TAU); ctx.fillStyle = '#5e93b8'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = BLUE; ctx.stroke(); ctx.beginPath(); ctx.ellipse(x, y, r * 0.8 * (0.6 + 0.4 * Math.sin(t * 4 + x)), r * 0.35, 0, 0, TAU); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke(); }
    function bird(x, y, s, t, i) { const f = Math.sin(t * 14 + i) * 0.5; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0, 0, TAU); ctx.fillStyle = '#6b4a2b'; ctx.fill(); ctx.beginPath(); ctx.moveTo(-4, -2); ctx.quadraticCurveTo(-10, -14 - f * 10, -20, -6 - f * 14); ctx.moveTo(4, -2); ctx.quadraticCurveTo(10, -14 - f * 10, 20, -6 - f * 14); ctx.lineWidth = 3.5; ctx.strokeStyle = '#4a3424'; ctx.stroke(); ctx.restore(); }
    function header() { spaced('ATÉ O SINAI', 540, 140, 64, { sp: 16 }); txt('Do Mar Vermelho ao monte  •  Êxodo 15 – 19', 540, 210, 30, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(220, 245, 640, 3); }
    function dAt(t, sync) { if (t <= sync[0][1]) return cumAt(sync[0][0]); for (let i = 1; i < sync.length; i++) if (t <= sync[i][1]) { const [i0, t0] = sync[i - 1], [i1, t1] = sync[i]; return lerp(cumAt(i0), cumAt(i1), inOut(prog(t, t0, t1))); } return cumAt(sync[sync.length - 1][0]); }
    // painel ilustrado dentro do mapa (parte de baixo)
    function panel(k, fill) { if (k <= 0) return null; const s = outBack(k); ctx.save(); ctx.translate(540, 1240); ctx.scale(s, s); ga(clamp(k * 3)); ctx.fillStyle = fill || 'rgba(247,238,214,0.97)'; ctx.fillRect(-470, -150, 940, 300); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-470, -150, 940, 300); ctx.strokeRect(-460, -140, 920, 280); return true; }
    const endPanel = () => { ctx.restore(); ga(1); };

    // ---------------- tempos ----------------
    const c1 = clip('c1'), c2 = clip('c2'), c3 = clip('c3'), c4 = clip('c4'), c5 = clip('c5'), c6 = clip('c6');
    const s1 = { tre: wt('c1', 'tres'), des: wt('c1', 'deserto'), nen: wt('c1', 'nenhuma'), agu: wt('c1', 'agua'), cam: wt('c1', 'caminhada'), sin: wt('c1', 'sinai'), olh: wt('c1', 'olha') };
    const s2 = { mar: wt('c2', 'mar'), sur: wt('c2', 'sur'), mara: wt('c2', 'mara'), ama: wt('c2', 'amarga'), moi: wt('c2', 'moises'), mad: wt('c2', 'madeira'), doc: wt('c2', 'doce') };
    const s3 = { eli: wt('c3', 'elim'), doz: wt('c3', 'doze'), fon: wt('c3', 'fontes'), set: wt('c3', 'setenta'), pal: wt('c3', 'palmeiras'), aca: wt('c3', 'acampam') };
    const s4 = { sim: wt('c4', 'sim'), fal: wt('c4', 'falta'), tar: wt('c4', 'tarde'), cod: wt('c4', 'codornizes'), man: wt('c4', 'manha'), mana: wt('c4', 'mana'), cha: wt('c4', 'chao'), gea: wt('c4', 'geada') };
    const s5 = { ref: wt('c5', 'refidim'), nov: wt('c5', 'novo'), moi: wt('c5', 'moises'), bat: wt('c5', 'bate'), roc: wt('c5', 'rocha'), sai: wt('c5', 'sai'), beb: wt('c5', 'beber') };
    const s6 = { ama: wt('c6', 'amaleque'), ata: wt('c6', 'ataca'), mao: wt('c6', 'maos'), isr: wt('c6', 'israel'), ven: wt('c6', 'vence'), ter: wt('c6', 'terceiro'), aca: wt('c6', 'acampam'), sin: wt('c6', 'sinai') };
    const s7 = { qua: wt('c7', 'qual'), com: wt('c7', 'comenta'), seg: wt('c7', 'segue'), qua40: wt('c7', 'quarenta') };
    const SY2 = [[0, s2.mar], [1, s2.sur + 0.2], [2, s2.mara + 0.1]];
    const SY3 = [[2, B[2] + 0.2], [3, s3.eli + 0.1]];
    const SY4 = [[3, B[3] + 0.2], [5, s4.sim + 0.15]];
    const SY5 = [[5, B[4] + 0.2], [7, s5.ref + 0.15]];
    const SY6 = [[7, s6.ter - 0.1], [8, s6.sin + 0.1]];
    cue(0, 'music', { part: 'intro' }); cue(s1.tre - 0.1, 'stamp'); cue(s1.agu, 'impact', { gain: 0.5 }); cue(s1.sin, 'reveal'); cue(s1.olh, 'whoosh', { dur: 0.6 }); cue(B[1], 'music', { part: 'safe' });
    cue(s2.sur, 'wind', { dur: 1.4, gain: 0.5 }); cue(s2.mara, 'pop', { gain: 0.5 }); cue(s2.ama, 'stamp'); cue(s2.mad, 'splash'); cue(s2.doc, 'sparkle');
    cue(s3.eli, 'pop', { gain: 0.5 }); cue(s3.doz, 'water', { dur: 1.2 }); cue(s3.set, 'reveal'); cue(s3.aca, 'ding');
    cue(s4.sim, 'pop', { gain: 0.5 }); cue(s4.cod, 'swoosh'); cue(s4.man, 'bell'); cue(s4.mana, 'sparkle');
    cue(s5.ref, 'pop', { gain: 0.5 }); cue(s5.bat, 'crack'); cue(s5.sai, 'water', { dur: 1.6 });
    cue(s6.ama, 'riser', { dur: 0.8 }); cue(s6.ata, 'impact', { gain: 0.6 }); cue(s6.mao, 'swoosh'); cue(s6.ven, 'stamp'); cue(s6.ter, 'whoosh', { dur: 0.6 }); cue(s6.sin, 'reveal'); cue(B[6], 'music', { part: 'outro' });
    cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });

    const placesUpTo = (cam, d, o = {}) => { for (const n of ['Mara', 'Elim', 'Sim', 'Refidim']) if (d >= cumAt(IDX[n]) - 1e-6) place(cam, n, 1, Object.assign({ big: true, size: o.size || 30 }, n === 'Sim' ? { name: 'Deserto de Sim' } : {})); };
    const sinaiAt = (cam, k, s = 1) => { const [x, y] = toS(cam, P('Sinai')); mountain(x, y - 6, k, { s }); return [x, y]; };

    // ---------------- cenas ----------------
    function scene1(t, cam) {
      drawMap(cam);
      drawRoute(cam, PREV, PREV.tot, { col: '#6d6d6d', w: 5, dash: [12, 10], a: 0.6 });
      const k = prog(t, s1.olh - 0.3, c1.end + 0.25); if (k > 0) drawRoute(cam, ROUTE, ROUTE.tot * inOut(k), { w: 7 });
      const [mx, my] = toS(cam, P('Sinai')); mountain(mx, my - 6, sm(t, s1.sin - 0.3, s1.sin + 0.2), { s: 0.9 });
      if (t > s1.sin - 0.2) txt('MONTE SINAI', mx, my + 44, 26, { w: 900, stroke: 7, a: prog(t, s1.sin - 0.2, s1.sin + 0.2) });
      const [rx, ry] = toS(cam, P('margem')); if (t > 0.2) txt('MAR VERMELHO ATRAVESSADO', rx - 10, ry - 52, 22, { w: 900, color: '#555', stroke: 6, a: 0.9 * (1 - prog(t, s1.sin - 0.5, s1.sin)) });
      frame();
      const qk = sm(t, s1.tre - 0.25, s1.tre + 0.1, outBack);
      if (qk > 0) { txt('3 DIAS', 540, 325, 110, { w: 900, color: RED, scale: qk }); txt('SEM ÁGUA', 540, 405, 38, { w: 900, color: MUTE, a: prog(t, s1.nen - 0.1, s1.agu + 0.1) }); }
    }
    function scene2(t, cam) {
      drawMap(cam);
      const d = dAt(t, SY2); drawRoute(cam, ROUTE, d); crowd(cam, d, t, { n: 90 }); head(cam, d);
      placesUpTo(cam, d);
      // poço de Mara
      const pk = prog(t, s2.ama - 0.3, s2.ama + 0.1); if (pk > 0) {
        const sweet = sm(t, s2.doc - 0.3, s2.doc + 0.3); panel(pk);
        ctx.beginPath(); ctx.ellipse(-150, 40, 210, 70, 0, 0, TAU); ctx.fillStyle = sweet > 0 ? lerpCol([122, 128, 72], [94, 147, 184], sweet) : '#7a8048'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(-150 + Math.sin(t * 2 + i) * 30, 40, 50 + i * 35, 14 + i * 9, 0, 0, TAU); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke(); }
        // pedaço de madeira caindo
        const wk = prog(t, s2.mad - 0.35, s2.mad + 0.1); if (wk > 0) { ctx.save(); ctx.translate(-150, lerp(-140, 30, outC(wk))); ctx.rotate(lerp(-0.9, 0.15, wk)); ctx.fillStyle = '#7a5530'; ctx.fillRect(-70, -9, 140, 18); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeRect(-70, -9, 140, 18); ctx.restore(); if (wk >= 1) { const sp = prog(t, s2.mad + 0.1, s2.mad + 0.6); ctx.beginPath(); ctx.ellipse(-150, 40, 40 + sp * 180, 12 + sp * 55, 0, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - sp)})`; ctx.stroke(); } }
        if (sweet > 0.5) { txt('DOCE', 230, -30, 64, { w: 900, color: BLUE, scale: outBack(prog(t, s2.doc - 0.1, s2.doc + 0.25)) }); txt('✓', 230, 50, 80, { w: 900, color: GREEN, a: prog(t, s2.doc, s2.doc + 0.3) }); }
        else { txt('AMARGA', 230, -30, 64, { w: 900, color: '#6a6a2a' }); txt('×', 230, 50, 90, { w: 900, color: RED }); }
        endPanel(); }
      frame();
      if (t > s2.moi - 0.3) plaque('MOISÉS JOGA UMA MADEIRA', 540, 360, 36, prog(t, s2.moi - 0.3, s2.moi));
      else if (t > s2.mara - 0.3) plaque('MARA: ÁGUA AMARGA', 540, 360, 38, prog(t, s2.mara - 0.3, s2.mara), { col: RED });
      else if (t > s2.sur - 0.3) plaque('DESERTO DE SUR', 540, 360, 38, prog(t, s2.sur - 0.3, s2.sur));
    }
    function lerpCol(a, b, k) { return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`; }
    function scene3(t, cam) {
      drawMap(cam);
      const d = dAt(t, SY3); drawRoute(cam, ROUTE, d); crowd(cam, d, t, { n: 90 }); head(cam, d); placesUpTo(cam, d);
      const [ex, ey] = toS(cam, P('Elim')); tents(ex + 60, ey + 20, prog(t, s3.aca - 0.2, s3.aca + 0.3));
      const pk = prog(t, s3.doz - 0.35, s3.doz); if (panel(pk)) {
        const ns = Math.floor(12 * prog(t, s3.doz - 0.1, s3.fon + 0.35)), np = Math.floor(70 * prog(t, s3.set - 0.1, s3.pal + 0.5));
        for (let i = 0; i < 12; i++) spring(-400 + (i % 6) * 58, -60 + Math.floor(i / 6) * 70, i < ns ? 1 : 0, t);
        txt(String(ns), -255, 90, 60, { w: 900, color: BLUE }); txt('FONTES', -150, 92, 30, { w: 900, color: BLUE, align: 'left' });
        for (let i = 0; i < 70; i++) { if (i >= np) break; const col = i % 14, row = Math.floor(i / 14); palm(10 + col * 32 + (row % 2) * 14, -70 + row * 34, 0.42, t); }
        txt(String(np), 180, 115, 54, { w: 900, color: GREEN, align: 'right' }); txt('PALMEIRAS', 196, 117, 30, { w: 900, color: GREEN, align: 'left' });
        endPanel(); }
      frame();
      if (t > s3.aca - 0.3) plaque('ACAMPAM JUNTO ÀS ÁGUAS', 540, 360, 36, prog(t, s3.aca - 0.3, s3.aca), { col: BLUE });
      else if (t > s3.eli - 0.3) plaque('ELIM: UM OÁSIS', 540, 360, 38, prog(t, s3.eli - 0.3, s3.eli), { col: GREEN });
    }
    function scene4(t, cam) {
      drawMap(cam);
      const d = dAt(t, SY4); drawRoute(cam, ROUTE, d); crowd(cam, d, t, { n: 90 }); head(cam, d); placesUpTo(cam, d);
      const dusk = prog(t, s4.tar - 0.3, s4.tar + 0.2) * (1 - prog(t, s4.man - 0.3, s4.man + 0.3));
      tint('rgba(190,90,40,0.28)', dusk);
      const [cx, cy] = toS(cam, P('Sim'));
      // codornizes chegando
      const qk = prog(t, s4.cod - 0.4, s4.cod + 0.9); if (qk > 0 && dusk > 0.05) { ctx.save(); clipMap(); ga(dusk * 1.4); for (let i = 0; i < 18; i++) { const r1 = ((i * 7919) % 997) / 997, r2 = ((i * 104729) % 991) / 991, u = clamp(qk * 1.3 - r1 * 0.3); const x = lerp(RECT[0] + RECT[2] + 60, cx - 120 + r2 * 240, outC(u)), y = lerp(RECT[1] + 60 + r2 * 200, cy - 40 + r1 * 80, outC(u)); bird(x, y, 1.1, t, i); } ctx.restore(); ga(1); }
      // maná: pontos brancos no chão em volta do acampamento
      const mk2 = prog(t, s4.mana - 0.2, s4.cha + 0.4); if (mk2 > 0) { ctx.save(); clipMap(); for (let i = 0; i < 260; i++) { const r1 = ((i * 7919) % 997) / 997, r2 = ((i * 104729) % 991) / 991; if (r1 > mk2) continue; const ang = r2 * TAU, rr = Math.sqrt(r1) * 210; const x = cx + Math.cos(ang) * rr * 1.3, y = cy + Math.sin(ang) * rr * 0.8; ctx.beginPath(); ctx.arc(x, y, 3.6, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(120,100,70,0.6)'; ctx.stroke(); } ctx.restore(); }
      tents(cx + 10, cy - 30, prog(t, s4.sim, s4.sim + 0.4));
      frame();
      if (t > s4.gea - 0.3) plaque('FINO COMO GEADA', 540, 360, 40, prog(t, s4.gea - 0.3, s4.gea));
      else if (t > s4.man - 0.3) plaque('TODA MANHÃ: O MANÁ', 540, 360, 40, prog(t, s4.man - 0.3, s4.man), { col: GOLD });
      else if (t > s4.tar - 0.3) plaque('À TARDE: CODORNIZES', 540, 360, 38, prog(t, s4.tar - 0.3, s4.tar), { col: '#8a4a1e' });
      else if (t > s4.fal - 0.3) plaque('FALTA COMIDA', 540, 360, 40, prog(t, s4.fal - 0.3, s4.fal), { col: RED });
    }
    function scene5(t, cam) {
      drawMap(cam);
      const d = dAt(t, SY5); drawRoute(cam, ROUTE, d); crowd(cam, d, t, { n: 90 }); head(cam, d); placesUpTo(cam, d);
      const pk = prog(t, s5.moi - 0.4, s5.moi); if (panel(pk)) {
        // rocha
        ctx.beginPath(); ctx.moveTo(-330, 110); ctx.lineTo(-300, -40); ctx.lineTo(-220, -95); ctx.lineTo(-120, -80); ctx.lineTo(-60, -10); ctx.lineTo(-40, 110); ctx.closePath(); ctx.fillStyle = '#8f8270'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-250, -60); ctx.lineTo(-200, 0); ctx.moveTo(-150, -50); ctx.lineTo(-120, 30); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(59,42,26,0.5)'; ctx.stroke();
        // cajado batendo
        const sk = prog(t, s5.bat - 0.35, s5.bat); const ang = lerp(-1.1, -0.35, outC(sk)); ctx.save(); ctx.translate(40, -110); ctx.rotate(ang); ctx.fillStyle = '#6b4a2b'; ctx.fillRect(-170, -6, 190, 12); ctx.restore();
        const fl = pulse(t, s5.bat, 0.03, 0.25); if (fl > 0.01) { ctx.save(); ctx.translate(-115, -60); ga(fl); ctx.strokeStyle = GOLD; ctx.lineWidth = 6; for (let i = 0; i < 8; i++) { const a = i * TAU / 8; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20); ctx.lineTo(Math.cos(a) * 60, Math.sin(a) * 60); ctx.stroke(); } ctx.restore(); ga(1); }
        // água saindo
        const wk = prog(t, s5.sai - 0.2, s5.sai + 1.0); if (wk > 0) { ctx.save(); ctx.strokeStyle = '#5e93b8'; ctx.lineCap = 'round'; for (let j = 0; j < 3; j++) { ctx.lineWidth = 16 - j * 4; ctx.beginPath(); ctx.moveTo(-90, -30 + j * 10); const L = 260 * outC(wk); for (let s = 0; s <= 20; s++) { const u = s / 20 * L; ctx.lineTo(-90 + u, -30 + j * 10 + u * u / 260 * 0.42 + Math.sin(t * 10 + s + j) * 3); } ctx.stroke(); } ctx.beginPath(); ctx.ellipse(160, 110, 170 * outC(prog(t, s5.sai + 0.3, s5.beb + 0.3)), 24, 0, 0, TAU); ctx.fillStyle = '#5e93b8'; ctx.fill(); ctx.restore(); }
        txt('ROCHA', -185, 130, 26, { w: 900, color: MUTE });
        endPanel(); }
      frame();
      if (t > s5.sai - 0.3) plaque('SAI ÁGUA DA ROCHA', 540, 360, 40, prog(t, s5.sai - 0.3, s5.sai), { col: BLUE });
      else if (t > s5.nov - 0.3) plaque('REFIDIM: SEM ÁGUA DE NOVO', 540, 360, 36, prog(t, s5.nov - 0.3, s5.nov), { col: RED });
    }
    function scene6(t, cam) {
      drawMap(cam);
      const d = dAt(t, SY6); drawRoute(cam, ROUTE, d); crowd(cam, d, t, { n: 100 }); head(cam, d); place(cam, 'Refidim', 1, { big: true, size: 28 });
      const [rx, ry] = toS(cam, P('Refidim'));
      // ameaça vinda do norte (pontos escuros) até Israel vencer
      const ak = prog(t, s6.ama - 0.2, s6.ata + 0.3), rk = prog(t, s6.ven, s6.ven + 0.8); if (ak > 0 && rk < 1) { ctx.save(); clipMap(); ga(1 - rk); for (let i = 0; i < 40; i++) { const r1 = ((i * 7919) % 997) / 997, r2 = ((i * 104729) % 991) / 991; const x = rx + 40 + (r2 - 0.5) * 160 + rk * 220, y = lerp(ry - 300, ry - 70, outC(ak)) - r1 * 90 - rk * 200; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fillStyle = '#5a5a5a'; ctx.fill(); } ctx.restore(); ga(1); }
      // mãos erguidas: cajado no alto do monte, brilho
      const hk = sm(t, s6.mao - 0.3, s6.mao + 0.2, outBack) * (1 - prog(t, s6.ter - 0.3, s6.ter)); if (hk > 0) { const hx = rx - 170, hy = ry + 110; ctx.save(); ctx.translate(hx, hy); ctx.scale(hk * 1.7, hk * 1.7); ctx.beginPath(); ctx.moveTo(-60, 30); ctx.lineTo(0, -40); ctx.lineTo(60, 30); ctx.closePath(); ctx.fillStyle = '#b39a6e'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); const gl = ctx.createRadialGradient(0, -70, 4, 0, -70, 70); gl.addColorStop(0, 'rgba(255,215,120,0.8)'); gl.addColorStop(1, 'rgba(255,215,120,0)'); ctx.fillStyle = gl; ctx.fillRect(-70, -140, 140, 140); ctx.fillStyle = '#6b4a2b'; ctx.fillRect(-4, -110, 8, 72); ctx.restore(); }
      if (t > s6.ven - 0.2 && t < s6.ter - 0.1) stamp('ISRAEL VENCE', 540, 1300, prog(t, s6.ven - 0.05, s6.ven + 0.12), { size: 60, col: GREEN });
      const [mx, my] = sinaiAt(cam, sm(t, s6.ter - 0.3, s6.sin + 0.1), 1.2); if (t > s6.sin - 0.2) txt('MONTE SINAI', mx, my + 58, 30, { w: 900, stroke: 8, a: prog(t, s6.sin - 0.2, s6.sin + 0.2) });
      tents(mx - 40, my + 100, prog(t, s6.aca, s6.aca + 0.4));
      frame();
      if (t > s6.ter - 0.3) plaque('3º MÊS: DIANTE DO SINAI', 540, 360, 38, prog(t, s6.ter - 0.3, s6.ter), { col: GOLD });
      else if (t > s6.mao - 0.3) plaque('AS MÃOS DE MOISÉS ERGUIDAS', 540, 360, 34, prog(t, s6.mao - 0.3, s6.mao));
      else if (t > s6.ama - 0.3) plaque('AMALEQUE ATACA', 540, 360, 40, prog(t, s6.ama - 0.3, s6.ama), { col: RED });
    }
    function scene7(t, cam) {
      drawMap(cam); drawRoute(cam, PREV, PREV.tot, { col: '#6d6d6d', w: 4, dash: [12, 10], a: 0.5 }); drawRoute(cam, ROUTE, ROUTE.tot, { w: 7 });
      for (const n of ['Mara', 'Elim', 'Refidim']) place(cam, n, 1, { size: 22, off: n === 'Refidim' ? [0, -30] : [-62, 0] });
      const [mx, my] = sinaiAt(cam, 1, 0.8); txt('MONTE SINAI', mx, my + 40, 24, { w: 900, stroke: 7 });
      frame();
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(290, 1340); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RED; ctx.fillRect(-200, -46, 400, 92); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-200, -46, 400, 92); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 46, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
      if (t > s7.qua40 - 0.4) plaque('PRÓXIMA PARTE: POR QUE 40 ANOS?', 540, 360, 34, prog(t, s7.qua40 - 0.4, s7.qua40), { col: RED });
      else if (t > s7.qua - 0.3) plaque('QUAL PARADA FALA COM VOCÊ?', 540, 360, 36, prog(t, s7.qua - 0.3, s7.qua));
    }

    // ---------------- legendas ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 60, words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 16, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), bw = total + 60, bh = size * 1.6, pop = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15));
      ctx.save(); ctx.translate(540, 1610); ctx.scale(pop, pop); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; if (cur) { ctx.fillStyle = '#e8c56a'; ctx.fillRect(x - 6, -size * 0.6, ws[i] + 12, size * 1.2); } txt(words[i], x + ws[i] / 2, 3, size, { w: 900 }); x += ws[i] + sp; }); ctx.restore(); }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.drawImage(tex, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      header(); ctx.save(); sceneFns[i](t, camAt(t, i)); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t); txt('Rota tradicional aproximada. Os locais exatos são debatidos.', 540, 1780, 23, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
