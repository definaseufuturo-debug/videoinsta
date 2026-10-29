/*
 * POR QUE 40 ANOS NO DESERTO? Os espias e Cades-Barneia (Números 13 – 14; Deuteronômio 1:2). Mapa em pergaminho, 9:16 (perfil cristão).
 * Contornos: Natural Earth 10m (assets/regiao.json via pipeline/geo_regiao.py, projeção lon*cos(lat_ref), -lat).
 * Locais tradicionais aproximados (Sinai = Jebel Musa; Cades-Barneia = Ein el-Qudeirat).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const GEO = (typeof require === 'function') ? require('../assets/regiao.json') : null;
  const W = 1080, H = 1920, TAU = Math.PI * 2, K = Math.cos((GEO ? GEO.lat_ref : 30.55) * Math.PI / 180);
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
  const RED = '#b23a2e', BLUE = '#2f5d8a', RIVER = '#5a86a3', GREEN = '#3c7a3e', GRAY = '#6d6d6d';

  const C = { // lon, lat (localizações tradicionais, aproximadas)
    'Sinai': [33.97, 28.54], 'Hazerote': [34.42, 28.92], 'w2': [34.55, 29.5], 'w3': [34.5, 30.15], 'Cades': [34.43, 30.65],
    'neg': [34.8, 31.2], 'Hebrom': [35.10, 31.53], 'n1': [35.25, 32.2], 'n2': [35.5, 32.85], 'Escol': [35.07, 31.58],
    'Egito': [32.55, 30.55], 'Ramessés': [31.83, 30.80], 'margem': [32.66, 29.82],
  };
  const P = n => [C[n][0] * K, -C[n][1]];
  const mkRoute = r => { const segs = []; let tot = 0; for (let i = 1; i < r.length; i++) { const a = P(r[i - 1]), b = P(r[i]), len = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, len, s0: tot }); tot += len; } return { segs, tot }; };
  const ROUTE = mkRoute(['Sinai', 'Hazerote', 'w2', 'w3', 'Cades']);
  const SPY = mkRoute(['Cades', 'neg', 'Hebrom', 'n1', 'n2', 'n1', 'Escol', 'neg', 'Cades']);
  const BACK = mkRoute(['Cades', 'Egito']);
  const REG = [['CANAÃ', 35.25, 31.95, 40], ['DESERTO DE PARÃ', 34.0, 30.05, 24], ['PENÍNSULA DO SINAI', 33.55, 29.15, 24], ['EGITO', 32.6, 30.95, 32],
    ['MAR MEDITERRÂNEO', 33.75, 32.15, 26], ['Golfo de Suez', 32.85, 28.75, 22], ['Golfo de Ácaba', 34.95, 28.55, 22], ['NEGUEBE', 35.0, 30.42, 22]];

  function create(TL, env) {
    const mk = env.createCanvas, G = env.geo || GEO;
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
    function stamp(s, x, y, k, o = {}) { if (k <= 0) return; const sc = lerp(2.2, 1, outC(k)), size = o.size || 80, w = tw(s, size, 900) + 60, h = size * 1.4; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.9)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 9; ctx.strokeStyle = o.col || RED; ctx.strokeRect(-w / 2, -h / 2, w, h); txt(s, 0, 4, size, { w: 900, color: o.col || RED }); ctx.restore(); ga(1); }

    const tex = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); let s = 9; const R0 = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 60000; i++) { g.fillStyle = R0() < 0.5 ? 'rgba(120,80,30,0.05)' : 'rgba(255,255,255,0.06)'; g.fillRect(R0() * W, R0() * H, 1 + R0() * 2, 1 + R0() * 2); }
      const gr = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); gr.addColorStop(0, 'rgba(90,55,20,0)'); gr.addColorStop(1, 'rgba(90,55,20,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ---------------- câmera e mapa ----------------
    const RECT = [20, 430, 1040, 1000];
    const box = (lo0, lo1, la0, la1) => { const x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(RECT[2] / (x1 - x0), RECT[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    const FULL = box(32.3, 36.4, 27.95, 33.1);
    const CAMS = [FULL, box(33.3, 35.7, 28.2, 31.1), box(33.9, 36.3, 30.25, 33.15), box(33.9, 36.2, 30.0, 32.6), box(32.3, 36.1, 29.5, 32.6), box(32.7, 36.1, 28.3, 31.6), FULL];
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
      for (const [lo, la] of [[33.75, 28.6], [34.15, 28.75], [33.85, 28.85], [33.55, 28.45], [34.05, 28.3]]) { const [x, y] = ll(cam, lo, la), s = clamp(cam.s / 600, 0.5, 1.4); if (!inRect(x, y, 20)) continue; ctx.beginPath(); ctx.moveTo(x - 22 * s, y + 12 * s); ctx.lineTo(x, y - 18 * s); ctx.lineTo(x + 22 * s, y + 12 * s); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(122,98,72,0.55)'; ctx.stroke(); }
      for (const [n, lo, la, sz] of REG) { const [x, y] = ll(cam, lo, la); const sea = n.startsWith('MAR') || n.startsWith('Golfo'); if (inRect(x, y, 90)) txt(n, x, y, sz, { w: 800, it: sea, color: sea ? '#4f6f7f' : n === 'CANAÃ' ? GREEN : MUTE, a: 0.85 }); }
      ctx.restore();
    }
    function frame() { ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
    function drawRoute(cam, rt, d, o = {}) {
      let hd = null; ctx.save(); clipMap(); ga(o.a ?? 1);
      for (const sg of rt.segs) {
        if (d <= sg.s0) break; const u = clamp((d - sg.s0) / sg.len), a = toS(cam, sg.a), b = toS(cam, sg.b);
        const hx = lerp(a[0], b[0], u), hy = lerp(a[1], b[1], u);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(hx, hy); ctx.lineWidth = o.w || 8; ctx.strokeStyle = o.col || RED; ctx.lineCap = 'round'; ctx.setLineDash(o.dash || []); ctx.stroke(); ctx.setLineDash([]);
        hd = { x: hx, y: hy, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
      }
      ga(1); ctx.restore(); return hd;
    }
    function posAt(cam, rt, d) { d = clamp(d, 0, rt.tot); for (const sg of rt.segs) if (d <= sg.s0 + sg.len + 1e-9) { const u = clamp((d - sg.s0) / sg.len), a = toS(cam, sg.a), b = toS(cam, sg.b); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.atan2(b[1] - a[1], b[0] - a[0])]; } const sg = rt.segs[rt.segs.length - 1]; return [...toS(cam, sg.b), 0]; }
    function crowd(cam, rt, d, t, o = {}) {
      const n = o.n || 80;
      for (let i = 0; i < n; i++) { const r1 = ((i * 7919) % 997) / 997, r2 = ((i * 104729) % 991) / 991; const dd = d - r1 * (o.px || 130) / cam.s; if (dd < 0) continue; const [x, y, ang] = posAt(cam, rt, dd); const off = (r2 - 0.5) * (o.wid || 44) + Math.sin(t * 3 + i) * 2; const px = x - Math.sin(ang) * off, py = y + Math.cos(ang) * off; if (!inRect(px, py)) continue; ctx.beginPath(); ctx.arc(px, py, o.r || 4.4, 0, TAU); ctx.fillStyle = o.col || (i % 5 === 0 ? '#7a3b1f' : '#4a3424'); ctx.fill(); }
    }
    function head(cam, rt, d, col = RED) { const [x, y] = posAt(cam, rt, d); ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke(); }
    function place(cam, n, k, o = {}) { if (k <= 0) return; const [x, y] = toS(cam, P(n)); if (!inRect(x, y)) return; const r = (o.big ? 12 : 9) * outBack(k); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); if (o.label !== false) { const [dx, dy] = o.off || [0, -32]; txt((o.name || n).toUpperCase(), x + dx, y + dy, o.size || 30, { w: 900, color: o.col || INK, stroke: 8, a: clamp(k * 2), align: o.align }); } }
    function mountain(x, y, k, o = {}) { if (k <= 0) return; const s = outBack(k) * (o.s || 1); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-50, 24); ctx.lineTo(-12, -40); ctx.lineTo(0, -30); ctx.lineTo(14, -50); ctx.lineTo(54, 24); ctx.closePath(); ctx.fillStyle = '#9b7b4f'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.moveTo(4, -36); ctx.lineTo(14, -50); ctx.lineTo(24, -34); ctx.fillStyle = '#f2ead8'; ctx.fill(); ctx.restore(); }
    function tents(x, y, k) { if (k <= 0) return; ctx.save(); ga(k); for (let i = 0; i < 7; i++) { const tx = x + ((i * 53) % 110) - 55, ty = y + ((i * 37) % 50) - 10; ctx.beginPath(); ctx.moveTo(tx - 13, ty + 9); ctx.lineTo(tx, ty - 11); ctx.lineTo(tx + 13, ty + 9); ctx.closePath(); ctx.fillStyle = '#d9c39a'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke(); } ctx.restore(); ga(1); }
    // figura simples (sem rosto): cabeça + corpo com manto
    function person(x, y, s, col, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-18, 40); ctx.lineTo(-12, -8); ctx.quadraticCurveTo(0, -16, 12, -8); ctx.lineTo(18, 40); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.arc(0, -24, 11, 0, TAU); ctx.fill(); ctx.stroke(); if (o.staff) { ctx.fillStyle = '#6b4a2b'; ctx.fillRect(20, -30, 5, 72); } ctx.restore(); }
    function header() { spaced('40 ANOS NO DESERTO', 540, 140, 54, { sp: 10 }); txt('Os espias e Cades-Barneia  •  Números 13 – 14', 540, 210, 30, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(200, 245, 680, 3); }
    function panel(k, fill) { if (k <= 0) return null; const s = outBack(k); ctx.save(); ctx.translate(540, 1240); ctx.scale(s, s); ga(clamp(k * 3)); ctx.fillStyle = fill || 'rgba(247,238,214,0.97)'; ctx.fillRect(-470, -150, 940, 300); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-470, -150, 940, 300); ctx.strokeRect(-460, -140, 920, 280); return true; }
    const endPanel = () => { ctx.restore(); ga(1); };
    function arrowHead(x, y, ang, col, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, -13); ctx.lineTo(-12, 13); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    function cadesMark(cam, k = 1, o = {}) { place(cam, 'Cades', k, Object.assign({ big: true, name: 'Cades-Barneia', off: [0, -34], size: 30, col: RED }, o)); }
    function sinaiMark(cam, k = 1, s = 0.9, lab = true) { const [x, y] = toS(cam, P('Sinai')); if (!inRect(x, y)) return; mountain(x, y - 6, k, { s }); if (lab && k > 0) txt('MONTE SINAI', x, y + 46 * s, 26, { w: 900, stroke: 7, a: clamp(k * 2) }); }

    // ---------------- tempos ----------------
    const c1 = clip('c1'), c3 = clip('c3'), c5 = clip('c5'), c6 = clip('c6');
    const s1 = { onz: wt('c1', 'onze'), cam: wt('c1', 'caminhada'), sin: wt('c1', 'sinai'), ter: wt('c1', 'terra'), mas: wt('c1', 'mas'), q40: wt('c1', 'quarenta'), ano: wt('c1', 'anos'), por: wt('c1', 'por') };
    const s2 = { sai: wt('c2', 'saindo'), che: wt('c2', 'chegam'), cad: wt('c2', 'cades'), por: wt('c2', 'porta'), moi: wt('c2', 'moises'), doz: wt('c2', 'doze'), tri: wt('c2', 'tribo') };
    const s3 = { q40: wt('c3', 'quarenta'), per: wt('c3', 'percorrem'), vol: wt('c3', 'voltam'), cac: wt('c3', 'cacho'), uva: wt('c3', 'uvas'), doi: wt('c3', 'dois'), var: wt('c3', 'vara') };
    const s4 = { dez: wt('c4', 'dez'), ass: wt('c4', 'assustam'), cid: wt('c4', 'cidades'), mur: wt('c4', 'muralhas'), gig: wt('c4', 'gigantes'), gaf: wt('c4', 'gafanhotos') };
    const s5 = { jos: wt('c5', 'josue'), cal: wt('c5', 'calebe'), pod: wt('c5', 'podemos'), ent: wt('c5', 'entrar'), cho: wt('c5', 'chora'), vol: wt('c5', 'voltar'), egi: wt('c5', 'egito') };
    const s6 = { sen: wt('c6', 'sentenca'), cad: wt('c6', 'cada'), dia: wt('c6', 'dia'), ano: wt('c6', 'ano'), q40a: wt('c6', 'quarenta'), q40b: wt('c6', 'quarenta', 1), des: wt('c6', 'deserto') };
    const s7 = { qua: wt('c7', 'qual'), com: wt('c7', 'comenta'), seg: wt('c7', 'segue'), jor: wt('c7', 'jordao') };

    cue(0, 'music', { part: 'intro' }); cue(s1.onz - 0.1, 'stamp'); cue(s1.sin, 'reveal'); cue(s1.q40, 'impact', { gain: 0.6 }); cue(s1.por, 'whoosh', { dur: 0.6 }); cue(B[1], 'music', { part: 'safe' });
    cue(s2.sai, 'wind', { dur: 1.4, gain: 0.5 }); cue(s2.cad, 'pop', { gain: 0.5 }); cue(s2.doz, 'reveal'); cue(s2.tri, 'ding');
    cue(s3.q40, 'whoosh', { dur: 0.6 }); cue(s3.q40, 'tick', { dur: Math.max(0.5, s3.vol - 0.3 - s3.q40) }); cue(s3.cac, 'pop', { gain: 0.6 }); cue(s3.uva, 'sparkle'); cue(s3.var, 'swoosh');
    cue(s4.dez, 'riser', { dur: 0.8 }); cue(s4.mur, 'stamp'); cue(s4.gig, 'impact', { gain: 0.6 }); cue(s4.gaf, 'boing', { gain: 0.5 });
    cue(s5.jos, 'ding'); cue(s5.cal, 'ding'); cue(s5.pod, 'success'); cue(s5.cho, 'error'); cue(s5.vol, 'whoosh', { dur: 0.7 });
    cue(s6.sen, 'stamp'); cue(s6.ano, 'bell'); cue(s6.q40b, 'impact', { gain: 0.6 }); cue(s6.des, 'wind', { dur: 1.5, gain: 0.5 }); cue(B[6], 'music', { part: 'outro' });
    cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });

    // ---------------- cenas ----------------
    function scene1(t, cam) {
      drawMap(cam);
      sinaiMark(cam, sm(t, s1.sin - 0.3, s1.sin + 0.2));
      const k = prog(t, s1.cam - 0.3, s1.ter + 0.3); if (k > 0) { drawRoute(cam, ROUTE, ROUTE.tot * inOut(k), { w: 6, dash: [14, 10] }); }
      cadesMark(cam, prog(t, s1.ter - 0.2, s1.ter + 0.2), { name: 'Cades-Barneia' });
      // 40 anos: rabisco de voltas no deserto
      const wk = prog(t, s1.q40 - 0.1, s1.por); if (wk > 0) { ctx.save(); clipMap(); const [cx, cy] = ll(cam, 34.0, 29.85); ctx.beginPath(); const N = Math.floor(240 * wk); for (let i = 0; i <= N; i++) { const a = i / 240 * TAU * 5; const r = 70 + 40 * Math.sin(a * 0.7); const x = cx + Math.cos(a) * r * 1.5 + Math.sin(a * 2.3) * 25, y = cy + Math.sin(a) * r + Math.cos(a * 1.7) * 20; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(178,58,46,0.75)'; ctx.stroke(); ctx.restore(); }
      frame();
      const qk = sm(t, s1.onz - 0.25, s1.onz + 0.1, outBack), sw = prog(t, s1.mas - 0.1, s1.q40);
      if (qk > 0 && sw < 0.5) { txt('11 DIAS', 540, 325, 110, { w: 900, color: GREEN, scale: qk * (1 - sw * 2) }); txt('DO SINAI ATÉ CANAÃ', 540, 405, 34, { w: 900, color: MUTE, a: prog(t, s1.sin - 0.1, s1.sin + 0.2) * (1 - sw * 2) }); }
      if (t >= s1.q40 - 0.15) { stamp('40 ANOS', 540, 330, prog(t, s1.q40 - 0.15, s1.q40 + 0.1), { size: 96 }); const pk = sm(t, s1.por - 0.2, s1.por + 0.15, outBack); if (pk > 0) txt('?', 850, 320, 120, { w: 900, color: RED, scale: pk, rot: 0.15 }); }
    }
    function scene2(t, cam) {
      drawMap(cam); sinaiMark(cam, 1, 1);
      const d = ROUTE.tot * inOut(prog(t, B[1] + 0.2, s2.cad + 0.1)); drawRoute(cam, ROUTE, d); crowd(cam, ROUTE, d, t, { n: 90 }); head(cam, ROUTE, d);
      cadesMark(cam, prog(t, s2.cad - 0.2, s2.cad + 0.2), { size: 32 }); tents(...(() => { const [x, y] = toS(cam, P('Cades')); return [x - 70, y + 40]; })(), prog(t, s2.cad + 0.1, s2.cad + 0.5));
      // porta de Canaã: seta para o norte
      const ak = prog(t, s2.por - 0.2, s2.por + 0.3); if (ak > 0) { const [x, y] = toS(cam, P('Cades')); ctx.save(); ga(ak); ctx.beginPath(); ctx.moveTo(x + 20, y - 50); ctx.lineTo(x + 70, y - 50 - 120 * outC(ak)); ctx.lineWidth = 8; ctx.strokeStyle = GREEN; ctx.setLineDash([12, 10]); ctx.stroke(); ctx.setLineDash([]); arrowHead(x + 70, y - 50 - 120 * outC(ak), Math.atan2(-120, 50), GREEN, 1.4); ctx.restore(); ga(1); }
      const pk = prog(t, s2.doz - 0.35, s2.doz); if (panel(pk)) {
        const n = Math.round(12 * prog(t, s2.doz - 0.1, s2.tri - 0.1));
        for (let i = 0; i < 12; i++) { if (i >= n) break; person(-405 + i * 74, -10, 1.15, i % 2 ? '#8a5a2b' : '#a0703a', { staff: true }); }
        txt(String(n), -300, 100, 54, { w: 900, color: RED }); txt('ESPIAS', -170, 102, 32, { w: 900, color: RED });
        if (t > s2.tri - 0.2) txt('1 DE CADA TRIBO', 170, 102, 32, { w: 900, color: MUTE, a: prog(t, s2.tri - 0.2, s2.tri + 0.1) });
        endPanel(); }
      frame();
      if (t > s2.moi - 0.3) plaque('MOISÉS ENVIA 12 ESPIAS', 540, 360, 38, prog(t, s2.moi - 0.3, s2.moi));
      else if (t > s2.por - 0.3) plaque('NA PORTA DE CANAÃ', 540, 360, 40, prog(t, s2.por - 0.3, s2.por), { col: GREEN });
      else if (t > s2.cad - 0.3) plaque('CADES-BARNEIA', 540, 360, 42, prog(t, s2.cad - 0.3, s2.cad), { col: RED });
      else plaque('SAINDO DO SINAI', 540, 360, 40, prog(t, B[1], B[1] + 0.3));
    }
    function scene3(t, cam) {
      drawMap(cam);
      const sk = prog(t, s3.q40 - 0.1, s3.vol + 0.2), d = SPY.tot * inOut(sk);
      drawRoute(cam, SPY, d, { col: GOLD, w: 6, dash: [12, 9] }); crowd(cam, SPY, d, t, { n: 12, px: 40, wid: 22, r: 5.5, col: '#5a3a1a' }); head(cam, SPY, d, GOLD);
      cadesMark(cam, 1, { size: 26 }); place(cam, 'Hebrom', prog(t, s3.q40, s3.q40 + 0.4), { big: true, off: [80, 0], size: 28 });
      if (sk > 0.25 && t < s3.cac) { const [x, y] = toS(cam, P('n2')); txt('ATÉ O NORTE ▲', x + 10, y - 40, 24, { w: 900, color: MUTE, stroke: 6, a: prog(sk, 0.25, 0.35) }); }
      // contador de dias
      if (t > s3.q40 - 0.2 && t < s3.cac - 0.3) { const n = Math.max(1, Math.round(40 * sk)); plaque('DIA ' + n + ' DE 40', 540, 360, 44, prog(t, s3.q40 - 0.2, s3.q40 + 0.1), { col: GOLD }); }
      const pk = prog(t, s3.cac - 0.35, s3.cac); if (panel(pk)) {
        const walk = Math.sin(t * 6) * 3;
        // dois homens com a vara
        person(-260, 20 + walk, 1.6, '#8a5a2b'); person(260, 20 - walk, 1.6, '#a0703a');
        ctx.fillStyle = '#6b4a2b'; ctx.fillRect(-300, -60, 600, 12);
        // cacho de uvas gigante
        const gk = outBack(prog(t, s3.cac - 0.1, s3.uva + 0.3)); ctx.save(); ctx.translate(0, -48); ctx.scale(gk, gk);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 18); ctx.lineWidth = 6; ctx.strokeStyle = '#5a3f22'; ctx.stroke();
        let rowN = [7, 7, 6, 6, 5, 4, 3, 2, 1]; let gy = 30; for (const rn of rowN) { for (let j = 0; j < rn; j++) { const gx = (j - (rn - 1) / 2) * 30; ctx.beginPath(); ctx.arc(gx, gy, 16, 0, TAU); ctx.fillStyle = (j + rn) % 3 ? '#5b2a6e' : '#6f3a86'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#2e1638'; ctx.stroke(); } gy += 22; }
        ctx.beginPath(); ctx.ellipse(-50, 14, 40, 18, -0.3, 0, TAU); ctx.fillStyle = GREEN; ctx.fill(); ctx.restore();
        endPanel(); }
      frame();
      if (t > s3.doi - 0.3) plaque('DOIS HOMENS, UMA VARA', 540, 360, 38, prog(t, s3.doi - 0.3, s3.doi), { col: '#5b2a6e' });
      else if (t > s3.cac - 0.3) plaque('VALE DE ESCOL: UM CACHO', 540, 360, 36, prog(t, s3.cac - 0.3, s3.cac), { col: '#5b2a6e' });
    }
    function scene4(t, cam) {
      drawMap(cam); cadesMark(cam, 1, { size: 26 }); place(cam, 'Hebrom', 1, { big: true, off: [80, 0], size: 28 });
      const pk = prog(t, s4.dez - 0.35, s4.dez); if (panel(pk)) {
        // 10 espias tremendo
        const fear = prog(t, s4.ass - 0.2, s4.ass + 0.2);
        if (t < s4.cid - 0.2) { for (let i = 0; i < 10; i++) person(-380 + i * 84 + Math.sin(t * 30 + i) * 3 * fear, 10, 1.15, GRAY); txt('10 ESPIAS COM MEDO', 0, 110, 32, { w: 900, color: GRAY, a: fear }); }
        else {
          // muralha com torres
          const mk2 = sm(t, s4.cid - 0.2, s4.mur + 0.1, outBack); ctx.save(); ctx.translate(-250, 110); ctx.scale(1, mk2);
          ctx.fillStyle = '#b8a07a'; ctx.fillRect(-180, -150, 360, 150); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-180, -150, 360, 150);
          for (const tx of [-180, 100]) { ctx.fillStyle = '#a58d66'; ctx.fillRect(tx, -210, 80, 210); ctx.strokeRect(tx, -210, 80, 210); for (let j = 0; j < 3; j++) { ctx.fillRect(tx + j * 30, -232, 20, 22); ctx.strokeRect(tx + j * 30, -232, 20, 22); } }
          ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(59,42,26,0.45)'; for (let r = -125; r < 0; r += 25) { ctx.beginPath(); ctx.moveTo(-100, r); ctx.lineTo(100, r); ctx.stroke(); }
          ctx.fillStyle = '#4a3424'; ctx.beginPath(); ctx.moveTo(-35, 0); ctx.lineTo(-35, -60); ctx.arc(0, -60, 35, Math.PI, 0); ctx.lineTo(35, 0); ctx.fill(); ctx.restore();
          // gigante (silhueta sem rosto) e gafanhoto
          const gk = sm(t, s4.gig - 0.2, s4.gig + 0.2, outBack); if (gk > 0) { ctx.save(); ctx.translate(200, 125); ctx.scale(gk, gk); ctx.fillStyle = '#4a4038'; ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(-38, -170); ctx.quadraticCurveTo(0, -195, 38, -170); ctx.lineTo(50, 0); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0, -205, 26, 0, TAU); ctx.fill(); ctx.restore(); person(330, 95, 0.75, '#8a5a2b'); }
          const hk = sm(t, s4.gaf - 0.2, s4.gaf + 0.2, outBack); if (hk > 0) { ctx.save(); ctx.translate(330, 20 - 30 * pulse(t, s4.gaf, 0.1, 0.3)); ctx.scale(hk, hk); ctx.beginPath(); ctx.ellipse(0, 0, 26, 9, -0.15, 0, TAU); ctx.fillStyle = '#6a8a2e'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(20, -20); ctx.lineTo(30, 10); ctx.moveTo(-8, 4); ctx.lineTo(-14, 16); ctx.moveTo(8, 6); ctx.lineTo(4, 18); ctx.moveTo(24, -6); ctx.lineTo(40, -18); ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); txt('NÓS?', 330, -40, 26, { w: 900, color: GREEN, a: hk }); }
        }
        endPanel(); }
      frame();
      if (t > s4.gaf - 0.3) plaque('PARECÍAMOS GAFANHOTOS', 540, 360, 38, prog(t, s4.gaf - 0.3, s4.gaf), { col: GREEN });
      else if (t > s4.gig - 0.3) plaque('E GIGANTES', 540, 360, 44, prog(t, s4.gig - 0.3, s4.gig), { col: RED });
      else if (t > s4.cid - 0.3) plaque('CIDADES COM MURALHAS', 540, 360, 40, prog(t, s4.cid - 0.3, s4.cid));
      else if (t > s4.dez - 0.3) plaque('10 ESPIAS ASSUSTAM O POVO', 540, 360, 36, prog(t, s4.dez - 0.3, s4.dez), { col: RED });
    }
    function scene5(t, cam) {
      drawMap(cam); drawRoute(cam, ROUTE, ROUTE.tot, { w: 6 }); cadesMark(cam, 1, { size: 26 });
      const [cx, cy] = toS(cam, P('Cades')); tents(cx - 70, cy + 40, 1);
      // vontade de voltar ao Egito
      const bk = prog(t, s5.vol - 0.2, s5.egi + 0.4); if (bk > 0) { const hd = drawRoute(cam, BACK, BACK.tot * outC(bk), { col: GRAY, w: 7, dash: [14, 10] }); if (hd) arrowHead(hd.x, hd.y, hd.ang, GRAY, 1.5); const [ex, ey] = toS(cam, P('Egito')); if (bk > 0.7) txt('EGITO?', ex + 30, ey - 40, 34, { w: 900, color: GRAY, stroke: 8, a: prog(bk, 0.7, 0.9) }); }
      const pk = prog(t, B[4] + 0.1, B[4] + 0.45) * (1 - prog(t, s5.cho - 0.2, s5.cho + 0.1)); if (panel(pk)) {
        const hl = prog(t, s5.jos - 0.2, s5.jos + 0.1), hl2 = prog(t, s5.cal - 0.2, s5.cal + 0.1);
        for (let i = 0; i < 12; i++) { const gold = (i === 5 && hl > 0) || (i === 6 && hl2 > 0); if (gold) { ctx.save(); ctx.globalAlpha *= 0.5; ctx.beginPath(); ctx.arc(-405 + i * 74, -10, 48, 0, TAU); ctx.fillStyle = '#f2d27a'; ctx.fill(); ctx.restore(); } person(-405 + i * 74, -10 - (gold ? 8 : 0), 1.15, gold ? GOLD : GRAY, { staff: true }); }
        if (hl > 0) txt('JOSUÉ', -35, 100, 28, { w: 900, color: GOLD, align: 'right', a: hl }); if (hl2 > 0) txt('CALEBE', 35, 100, 28, { w: 900, color: GOLD, align: 'left', a: hl2 });
        if (t > s5.pod - 0.1) { txt('✓', -300, 100, 50, { w: 900, color: GREEN, a: prog(t, s5.pod - 0.1, s5.pod + 0.2) }); txt('✓', 300, 100, 50, { w: 900, color: GREEN, a: prog(t, s5.pod - 0.1, s5.pod + 0.2) }); }
        endPanel(); }
      frame();
      if (t > s5.vol - 0.3) plaque('VOLTAR PARA O EGITO?', 540, 360, 40, prog(t, s5.vol - 0.3, s5.vol), { col: GRAY });
      else if (t > s5.cho - 0.3) plaque('O POVO CHORA', 540, 360, 42, prog(t, s5.cho - 0.3, s5.cho), { col: RED });
      else if (t > s5.pod - 0.3) plaque('"PODEMOS ENTRAR"', 540, 360, 42, prog(t, s5.pod - 0.3, s5.pod), { col: GREEN });
      else if (t > s5.jos - 0.3) plaque('SÓ JOSUÉ E CALEBE', 540, 360, 40, prog(t, s5.jos - 0.3, s5.jos), { col: GOLD });
    }
    function scene6(t, cam) {
      drawMap(cam); sinaiMark(cam, 1, 0.8, false); cadesMark(cam, 1, { size: 26 });
      // voltas no deserto (40 anos)
      const wk = prog(t, s6.q40a - 0.2, END - 0.2); if (wk > 0) { ctx.save(); clipMap(); const [cx, cy] = ll(cam, 34.1, 29.9); ctx.beginPath(); const N = Math.floor(600 * wk); let lx = cx, ly = cy; for (let i = 0; i <= N; i++) { const a = i / 600 * TAU * 7; const r = 90 + 60 * Math.sin(a * 0.45); lx = cx + Math.cos(a) * r * 1.6 + Math.sin(a * 2.3) * 40; ly = cy + Math.sin(a) * r * 1.1 + Math.cos(a * 1.7) * 30; i ? ctx.lineTo(lx, ly) : ctx.moveTo(lx, ly); } ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(178,58,46,0.8)'; ctx.stroke(); ctx.restore(); ctx.beginPath(); ctx.arc(lx, ly, 12, 0, TAU); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke(); }
      const pk = prog(t, s6.cad - 0.3, s6.cad); if (panel(pk)) {
        const k1 = outBack(prog(t, s6.dia - 0.1, s6.dia + 0.2)), k2 = outBack(prog(t, s6.ano - 0.1, s6.ano + 0.2));
        txt('1 DIA', -230, -20, 90, { w: 900, color: GOLD, scale: k1 }); txt('=', 0, -20, 90, { w: 900, color: INK, a: k2 }); txt('1 ANO', 230, -20, 90, { w: 900, color: RED, scale: k2 });
        if (t > s6.q40a - 0.2) { const n = Math.max(1, Math.round(40 * prog(t, s6.q40a, s6.des))); txt(n + ' DIAS  →  ' + n + ' ANOS', 0, 95, 46, { w: 900, color: INK, a: prog(t, s6.q40a - 0.2, s6.q40a) }); }
        endPanel(); }
      frame();
      if (t > s6.q40b - 0.15) stamp('40 ANOS', 540, 345, prog(t, s6.q40b - 0.15, s6.q40b + 0.1), { size: 80 });
      else if (t > s6.sen - 0.3) plaque('A SENTENÇA (Nm 14:34)', 540, 360, 40, prog(t, s6.sen - 0.3, s6.sen), { col: RED });
    }
    function scene7(t, cam) {
      drawMap(cam); drawRoute(cam, ROUTE, ROUTE.tot, { w: 6 }); drawRoute(cam, SPY, SPY.tot, { col: GOLD, w: 4, dash: [10, 8], a: 0.7 });
      sinaiMark(cam, 1, 0.8); cadesMark(cam, 1, { size: 26 });
      // Jordão/Jericó: próxima parte
      const jk = prog(t, s7.jor - 0.3, s7.jor + 0.2); if (jk > 0) { const [x, y] = ll(cam, 35.45, 31.87); ctx.beginPath(); ctx.arc(x, y, Math.max(1, 14 * outBack(jk) + 6 * Math.sin(t * 6) * jk), 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = BLUE; ctx.stroke(); txt('JERICÓ', x + 80, y + 4, 26, { w: 900, color: BLUE, stroke: 7, a: jk }); }
      frame();
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1490); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RED; ctx.fillRect(-200, -46, 400, 92); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-200, -46, 400, 92); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 46, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
      if (t > s7.jor - 0.4) plaque('PRÓXIMA PARTE: JORDÃO E JERICÓ', 540, 360, 32, prog(t, s7.jor - 0.4, s7.jor), { col: BLUE });
      else if (t > s7.qua - 0.3) plaque('QUAL GIGANTE TE FEZ PARAR?', 540, 360, 36, prog(t, s7.qua - 0.3, s7.qua));
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
      captions(t); txt('Locais tradicionais aproximados. Cades-Barneia e o Sinai são debatidos.', 540, 1780, 22, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
