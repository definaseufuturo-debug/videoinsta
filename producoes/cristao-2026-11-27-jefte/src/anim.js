/*
 * O ÊXODO: de Ramessés à travessia do Mar Vermelho. Mapa em pergaminho, 9:16 (perfil cristão).
 * Contornos: Natural Earth 10m (assets/egito.json, projeção lon*cos30, -lat). Rota tradicional aproximada (Êxodo 12-14).
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
  const RED = '#b23a2e', BLUE = '#2f5d8a', RIVER = '#5a86a3', NIGHT = '#1b2440';

  const C = { // lon, lat
    'Ramessés': [31.83, 30.80], 'Sucote': [32.10, 30.55], 'Etã': [32.22, 30.47], 'volta': [32.27, 30.12], 'Pi-Hairote': [32.40, 29.83],
    'leste': [32.70, 29.80], 'Sur': [32.92, 29.98], 'Pelúsio': [32.55, 31.04], 'costa': [33.55, 31.14], 'Gaza': [34.45, 31.50], 'Canaã': [35.05, 31.75],
  };
  const P = n => [C[n][0] * K, -C[n][1]];
  const LOFF = { 'Ramessés': [-20, -34], 'Sucote': [-70, 26], 'Etã': [-56, 6], 'Pi-Hairote': [-96, 0] };
  // rota principal: [lugar, modo] (T terra, X travessia do mar)
  const R = [['Ramessés'], ['Sucote', 'T'], ['Etã', 'T'], ['volta', 'T'], ['Pi-Hairote', 'T'], ['leste', 'X'], ['Sur', 'T']];
  const VIA = ['Ramessés', 'Pelúsio', 'costa', 'Gaza', 'Canaã'];
  const mkRoute = r => { const segs = []; let tot = 0; for (let i = 1; i < r.length; i++) { const a = P(r[i - 1][0]), b = P(r[i][0]), len = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, m: r[i][1], len, s0: tot }); tot += len; } return { segs, tot }; };
  const ROUTE = mkRoute(R), VROUTE = mkRoute(VIA.map((n, i) => (i ? [n, 'T'] : [n])));
  const cumAt = idx => (idx <= 0 ? 0 : ROUTE.segs[idx - 1].s0 + ROUTE.segs[idx - 1].len);
  // braço pelusíaco do Nilo (antigo, aproximado)
  const PELUS = [[31.22, 30.12], [31.51, 30.57], [31.83, 30.80], [32.08, 30.95], [32.55, 31.04]].map(([x, y]) => [x * K, -y]);
  // lugares para rótulos de região
  const REG = [['EGITO', 30.75, 29.25, 40], ['DESERTO DE SUR', 33.35, 30.35, 26], ['SINAI', 33.9, 29.0, 34], ['CANAÃ', 35.15, 31.95, 34], ['MAR MEDITERRÂNEO', 32.4, 31.75, 26], ['MAR VERMELHO', 33.25, 28.25, 26], ['Nilo', 31.05, 29.55, 24]];

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
    function stamp(s, x, y, k, o = {}) { if (k <= 0) return; const sc = lerp(2.2, 1, outC(k)), size = o.size || 80, w = tw(s, size, 900) + 60, h = size * 1.4; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.85)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 9; ctx.strokeStyle = o.col || RED; ctx.strokeRect(-w / 2, -h / 2, w, h); txt(s, 0, 4, size, { w: 900, color: o.col || RED }); ctx.restore(); ga(1); }

    const tex = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); let s = 9; const R0 = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 60000; i++) { g.fillStyle = R0() < 0.5 ? 'rgba(120,80,30,0.05)' : 'rgba(255,255,255,0.06)'; g.fillRect(R0() * W, R0() * H, 1 + R0() * 2, 1 + R0() * 2); }
      const gr = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); gr.addColorStop(0, 'rgba(90,55,20,0)'); gr.addColorStop(1, 'rgba(90,55,20,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ---------------- câmera e mapa ----------------
    const RECT = [20, 430, 1040, 1000];
    const box = (lo0, lo1, la0, la1) => { const x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(RECT[2] / (x1 - x0), RECT[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    const CAMS = [box(29.9, 35.9, 27.9, 32.4), box(31.3, 33.2, 29.95, 31.25), box(31.2, 35.6, 29.6, 32.2), box(31.5, 33.2, 29.75, 31.05), box(31.5, 33.3, 29.55, 30.95), box(32.15, 33.05, 29.55, 30.12), box(30.9, 35.5, 28.15, 32.2)];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i], B[i] + 1.0); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const ll = (cam, lo, la) => toS(cam, [lo * K, -la]);
    const inRect = (x, y, m = 0) => x > RECT[0] + m && x < RECT[0] + RECT[2] - m && y > RECT[1] + m && y < RECT[1] + RECT[3] - m;
    function clipMap() { ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); }
    function drawMap(cam, o = {}) {
      ctx.save(); clipMap();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.strokeStyle = 'rgba(80,110,100,0.12)'; ctx.lineWidth = 2; for (let y = RECT[1] + 20; y < RECT[1] + RECT[3]; y += 44) { ctx.beginPath(); for (let x = RECT[0]; x <= RECT[0] + RECT[2]; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.05 + y) * 4); ctx.stroke(); }
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      ctx.beginPath(); for (const r of G.land) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
      ctx.fillStyle = LAND; ctx.fill('nonzero'); ctx.lineWidth = 2.2 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.beginPath(); for (const r of G.lakes) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } ctx.fillStyle = SEA; ctx.fill(); ctx.lineWidth = 1.5 / cam.s; ctx.stroke();
      ctx.strokeStyle = RIVER; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 4 / cam.s; for (const r of G.rivers) { ctx.beginPath(); r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
      ctx.lineWidth = 3 / cam.s; ctx.setLineDash([10 / cam.s, 8 / cam.s]); ctx.beginPath(); PELUS.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      if (o.regions !== false) for (const [n, lo, la, sz] of REG) { const [x, y] = ll(cam, lo, la); if (inRect(x, y, 60)) txt(n, x, y, sz, { w: n === 'Nilo' ? 700 : 800, it: n === 'Nilo' || n.startsWith('MAR'), color: n.startsWith('MAR') || n === 'Nilo' ? '#4f6f7f' : MUTE, a: 0.85 }); }
      ctx.restore();
    }
    function frame() { ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
    function night(k) { if (k <= 0) return; ctx.save(); clipMap(); ctx.fillStyle = `rgba(27,36,64,${0.5 * k})`; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.restore(); }
    // desenha uma rota até a distância d; devolve a cabeça
    function drawRoute(cam, rt, d, o = {}) {
      let head = null; ctx.save(); clipMap(); ga(o.a ?? 1);
      for (const sg of rt.segs) {
        if (d <= sg.s0) break; const u = clamp((d - sg.s0) / sg.len), a = toS(cam, sg.a), b = toS(cam, sg.b);
        const hx = lerp(a[0], b[0], u), hy = lerp(a[1], b[1], u);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(hx, hy); ctx.lineWidth = o.w || 8; ctx.strokeStyle = o.col || RED; ctx.lineCap = 'round'; ctx.setLineDash(o.dash || (sg.m === 'X' ? [16, 12] : [])); ctx.stroke(); ctx.setLineDash([]);
        head = { x: hx, y: hy, ang: Math.atan2(b[1] - a[1], b[0] - a[0]), m: sg.m };
      }
      ga(1); ctx.restore(); return head;
    }
    // multidão: pontinhos atrás da cabeça
    function posAt(cam, rt, d) { d = clamp(d, 0, rt.tot); for (const sg of rt.segs) if (d <= sg.s0 + sg.len + 1e-9) { const u = clamp((d - sg.s0) / sg.len), a = toS(cam, sg.a), b = toS(cam, sg.b); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.atan2(b[1] - a[1], b[0] - a[0])]; } const sg = rt.segs[rt.segs.length - 1]; return [...toS(cam, sg.b), 0]; }
    function crowd(cam, rt, d, t, o = {}) {
      const n = o.n || 70, spread = (o.len || 0.35) / cam.s * 120;
      for (let i = 0; i < n; i++) { const r1 = ((i * 7919) % 997) / 997, r2 = ((i * 104729) % 991) / 991; const dd = d - r1 * (o.px || 120) / cam.s; if (dd < 0) continue; const [x, y, ang] = posAt(cam, rt, dd); const off = (r2 - 0.5) * (o.wid || 46) + Math.sin(t * 3 + i) * 2; const px = x - Math.sin(ang) * off, py = y + Math.cos(ang) * off; if (!inRect(px, py)) continue; ctx.beginPath(); ctx.arc(px, py, o.r || 4.2, 0, TAU); ctx.fillStyle = i % 5 === 0 ? '#7a3b1f' : '#4a3424'; ctx.fill(); }
    }
    function place(cam, n, k, o = {}) { if (k <= 0) return; const [x, y] = toS(cam, P(n)); if (!inRect(x, y)) return; const r = (o.big ? 12 : 9) * outBack(k); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); if (o.label !== false) { const [dx, dy] = o.off || LOFF[n] || [0, -30]; txt(n.toUpperCase(), x + dx, y + dy, o.size || 30, { w: 900, color: INK, stroke: 8, a: clamp(k * 2) }); } }
    function header() { spaced('O ÊXODO', 540, 140, 64, { sp: 16 }); txt('Do Egito ao Mar Vermelho  •  Êxodo 12 – 14', 540, 210, 30, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(220, 245, 640, 3); }
    function dAt(t, sync) { if (t <= sync[0][1]) return cumAt(sync[0][0]); for (let i = 1; i < sync.length; i++) if (t <= sync[i][1]) { const [i0, t0] = sync[i - 1], [i1, t1] = sync[i]; return lerp(cumAt(i0), cumAt(i1), inOut(prog(t, t0, t1))); } return cumAt(sync[sync.length - 1][0]); }
    function cloudPillar(x, y, k, t) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); for (let i = 0; i < 9; i++) { const yy = -30 - i * 26, r = 26 + Math.sin(i * 1.7 + t * 2) * 4 + (i > 6 ? (i - 6) * 10 : 0); for (const dx of [-14, 12, 0]) { ctx.beginPath(); ctx.arc(dx + Math.sin(t * 1.5 + i) * 5, yy, r * 0.8, 0, TAU); ctx.fillStyle = 'rgba(250,250,245,0.9)'; ctx.fill(); } } ctx.restore(); }
    function firePillar(x, y, k, t) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); const gl = ctx.createRadialGradient(0, -120, 10, 0, -120, 220); gl.addColorStop(0, 'rgba(255,190,80,0.55)'); gl.addColorStop(1, 'rgba(255,150,40,0)'); ctx.fillStyle = gl; ctx.fillRect(-220, -340, 440, 440);
      for (let i = 0; i < 14; i++) { const yy = -20 - i * 18, w = 22 + Math.sin(t * 9 + i * 1.3) * 7; ctx.beginPath(); ctx.ellipse(Math.sin(t * 7 + i) * 6, yy, w, 22, 0, 0, TAU); ctx.fillStyle = i % 3 === 0 ? 'rgba(255,230,140,0.95)' : i % 3 === 1 ? 'rgba(255,160,40,0.9)' : 'rgba(230,90,30,0.85)'; ctx.fill(); } ctx.restore(); }
    function chariot(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#2a1d14'; ctx.fillRect(-10, -12, 20, 12); ctx.beginPath(); ctx.arc(-2, 2, 7, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = '#2a1d14'; ctx.stroke(); ctx.beginPath(); ctx.ellipse(-22, -6, 10, 6, 0, 0, TAU); ctx.fill(); ctx.fillRect(-30, -4 + Math.sin(t * 20) * 2, 3, 10); ctx.restore(); }

    // ---------------- tempos ----------------
    const c1 = clip('c1'), c2 = clip('c2'), c3 = clip('c3'), c4 = clip('c4'), c5 = clip('c5'), c6 = clip('c6');
    const s1 = { q: wt('c1', 'quatrocentos'), eg: wt('c1', 'egito'), sei: wt('c1', 'seiscentos'), hom: wt('c1', 'homens'), fora: wt('c1', 'fora'), sai: wt('c1', 'sairam'), olh: wt('c1', 'olha') };
    const s2 = { par: wt('c2', 'partem'), ram: wt('c2', 'ramesses'), nil: wt('c2', 'nilo'), suc: wt('c2', 'sucote'), aca: wt('c2', 'acampam'), eta: wt('c2', 'eta'), des: wt('c2', 'deserto') };
    const s3 = { cur: wt('c3', 'curto'), cos: wt('c3', 'costa'), fil: wt('c3', 'filisteus'), mas: wt('c3', 'mas'), deu: wt('c3', 'deus'), des: wt('c3', 'deserto'), gue: wt('c3', 'guerra') };
    const s4 = { dia: wt('c4', 'dia'), nuv: wt('c4', 'nuvem'), noi: wt('c4', 'noite'), fog: wt('c4', 'fogo') };
    const s5 = { vol: wt('c5', 'voltar'), mar: wt('c5', 'mar'), pi: wt('c5', 'pi'), far: wt('c5', 'farao'), sei: wt('c5', 'seiscentos'), car: wt('c5', 'carros') };
    const s6 = { moi: wt('c6', 'moises'), mao: wt('c6', 'mao'), ven: wt('c6', 'vento'), abr: wt('c6', 'abre'), pov: wt('c6', 'povo'), sec: wt('c6', 'seca') };
    const s7 = { qua: wt('c7', 'qual'), mar: wt('c7', 'marca'), com: wt('c7', 'comenta'), seg: wt('c7', 'segue'), sin: wt('c7', 'sinai') };
    const SY2 = [[0, s2.ram], [1, s2.suc + 0.1], [1, s2.aca - 0.3], [2, s2.eta + 0.2]];
    const SY5 = [[2, s5.vol - 0.1], [4, s5.pi + 0.2]];
    const SY6 = [[4, s6.abr + 0.1], [5, c6.end - 0.2], [6, c6.end + 0.3]];
    cue(0, 'music', { part: 'intro' }); cue(s1.q - 0.1, 'stamp'); cue(s1.sei - 0.05, 'impact', { gain: 0.6 }); cue(s1.olh, 'whoosh', { dur: 0.6 }); cue(B[1], 'music', { part: 'safe' });
    [s2.ram, s2.suc, s2.eta].forEach(x => cue(x, 'pop', { gain: 0.5 }));
    cue(s3.cos, 'swoosh'); cue(s3.mas, 'stamp'); cue(s3.des, 'whoosh', { dur: 0.5 });
    cue(s4.nuv, 'reveal'); cue(s4.noi, 'swoosh'); cue(s4.fog, 'fire');
    cue(s5.vol, 'swoosh'); cue(s5.pi, 'pop', { gain: 0.5 }); cue(s5.far, 'riser', { dur: 1.0 }); cue(s5.sei, 'stamp');
    cue(s6.ven, 'wind', { dur: 2.6 }); cue(s6.abr, 'water', { dur: 1.6 }); cue(s6.sec, 'sparkle'); cue(B[6], 'music', { part: 'outro' });
    cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });

    // ---------------- cenas ----------------
    function scene1(t, cam) {
      drawMap(cam);
      place(cam, 'Ramessés', prog(t, s1.eg - 0.2, s1.eg + 0.2), { big: true });
      const k = prog(t, s1.olh - 0.2, c1.end + 0.2); if (k > 0) { drawRoute(cam, ROUTE, ROUTE.tot * inOut(k), { w: 7 }); }
      crowd(cam, ROUTE, 0.0001 + 0 * k, t, { n: 0 });
      frame();
      const qk = sm(t, s1.q - 0.25, s1.q + 0.1, outBack), sk = sm(t, s1.sei - 0.25, s1.sei + 0.1, outBack);
      if (qk > 0 && t < s1.sei - 0.1) { txt('430 ANOS', 540, 330, 104, { w: 900, color: RED, scale: qk }); txt('NO EGITO', 540, 405, 34, { w: 800, color: MUTE, a: prog(t, s1.eg - 0.2, s1.eg + 0.1) }); }
      if (sk > 0) { txt('600 MIL HOMENS', 540, 330, 92, { w: 900, color: RED, scale: sk }); txt('FORA MULHERES E CRIANÇAS', 540, 405, 34, { w: 800, color: MUTE, a: prog(t, s1.fora - 0.1, s1.fora + 0.2) }); }
    }
    function scene2(t, cam) {
      drawMap(cam);
      const d = dAt(t, SY2); const head = drawRoute(cam, ROUTE, d);
      crowd(cam, ROUTE, d, t, { n: 90 });
      place(cam, 'Ramessés', prog(t, B[1] + 0.2, s2.ram), { big: true });
      if (d >= cumAt(1) - 1e-6) place(cam, 'Sucote', 1, { big: true }); if (d >= cumAt(2) - 1e-6) place(cam, 'Etã', 1, { big: true });
      if (head) { ctx.beginPath(); ctx.arc(head.x, head.y, 12, 0, TAU); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke(); }
      frame();
      if (t > s2.nil - 0.3 && t < s2.suc + 0.2) plaque('DELTA DO NILO', 540, 360, 36, prog(t, s2.nil - 0.3, s2.nil));
      if (t > s2.des - 0.3) plaque('BEIRA DO DESERTO', 540, 360, 36, prog(t, s2.des - 0.3, s2.des));
    }
    function scene3(t, cam) {
      drawMap(cam);
      drawRoute(cam, ROUTE, cumAt(2), { w: 6 });
      const vk = prog(t, s3.cos - 0.4, s3.fil + 0.3); const vh = drawRoute(cam, VROUTE, VROUTE.tot * inOut(vk), { col: '#6d6d6d', w: 6, dash: [14, 12], a: 0.9 });
      if (vk > 0.98) { const [x, y] = toS(cam, P('Gaza')); if (t < s3.mas) plaque('MAIS CURTO', x - 40, y + 70, 30, prog(t, s3.fil - 0.1, s3.fil + 0.2)); }
      if (t > s3.fil - 0.2) { const [x, y] = toS(cam, P('costa')); txt('CAMINHO DOS FILISTEUS', x, y - 50, 26, { w: 900, color: '#555', stroke: 7, a: prog(t, s3.fil - 0.2, s3.fil + 0.1) }); }
      const xk = prog(t, s3.mas - 0.05, s3.mas + 0.15); if (xk > 0) { const [x, y] = toS(cam, P('costa')); ctx.save(); ctx.translate(x, y + 10); ctx.scale(lerp(2, 1, outC(xk)), lerp(2, 1, outC(xk))); ga(xk); ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = RED; ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(40, 40); ctx.moveTo(40, -40); ctx.lineTo(-40, 40); ctx.stroke(); ctx.restore(); ga(1); }
      // seta para o deserto (sul)
      const ak = sm(t, s3.des - 0.3, s3.des + 0.4); if (ak > 0) { const [x0, y0] = toS(cam, P('Etã')), [x1, y1] = toS(cam, P('Pi-Hairote')); const ex = lerp(x0, x1 + 30, ak), ey = lerp(y0, y1, ak); ctx.save(); ctx.lineWidth = 9; ctx.strokeStyle = GOLD; ctx.setLineDash([4, 14]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]); const an = Math.atan2(ey - y0, ex - x0); ctx.translate(ex, ey); ctx.rotate(an); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-14, -14); ctx.lineTo(-14, 14); ctx.closePath(); ctx.fill(); ctx.restore(); }
      crowd(cam, ROUTE, cumAt(2), t, { n: 70 });
      ['Ramessés', 'Sucote', 'Etã'].forEach(n => place(cam, n, 1, { size: 24, label: n !== 'Sucote' }));
      frame();
      if (t > s3.gue - 0.3) plaque('PARA NÃO DESISTIREM', 540, 360, 36, prog(t, s3.gue - 0.3, s3.gue)); else if (t > s3.deu - 0.3) plaque('DEUS ESCOLHE O DESERTO', 540, 360, 36, prog(t, s3.deu - 0.3, s3.deu));
    }
    function scene4(t, cam) {
      drawMap(cam); const dd = lerp(cumAt(2), cumAt(2) + (cumAt(3) - cumAt(2)) * 0.45, prog(t, B[3], clip('c5').start));
      drawRoute(cam, ROUTE, dd); crowd(cam, ROUTE, dd, t, { n: 90 }); ['Ramessés', 'Sucote', 'Etã'].forEach(n => place(cam, n, 1, { size: 26 }));
      const nk = prog(t, s4.noi - 0.3, s4.noi + 0.3); night(nk);
      const [hx, hy] = posAt(cam, ROUTE, dd + 0.02); const px = hx + 10, py = hy - 10;
      ctx.save(); clipMap(); cloudPillar(px, py, sm(t, s4.nuv - 0.3, s4.nuv + 0.2, outBack) * (1 - nk), t); firePillar(px, py, sm(t, s4.noi, s4.noi + 0.4, outBack), t); ctx.restore();
      frame();
      if (nk < 0.5) { if (t > s4.dia - 0.3) plaque('DE DIA: NUVEM', 540, 360, 38, prog(t, s4.dia - 0.3, s4.dia)); } else plaque('DE NOITE: FOGO', 540, 360, 38, prog(t, s4.noi, s4.noi + 0.3), { fill: '#fbe3b0' });
    }
    function scene5(t, cam) {
      drawMap(cam); const d = dAt(t, SY5); drawRoute(cam, ROUTE, d); crowd(cam, ROUTE, d, t, { n: 90 });
      ['Ramessés', 'Sucote', 'Etã'].forEach(n => place(cam, n, 1, { size: 26 })); if (d >= cumAt(4) - 1e-6) place(cam, 'Pi-Hairote', prog(t, s5.pi - 0.1, s5.pi + 0.2), { big: true });
      // perseguição: carros saindo de Ramessés
      const ck = prog(t, s5.far - 0.2, c5.end + 0.4); if (ck > 0) { const dc = lerp(0, cumAt(3) + (cumAt(4) - cumAt(3)) * 0.2, inOut(ck)); ctx.save(); clipMap(); for (let i = 0; i < 9; i++) { const [x, y, ang] = posAt(cam, ROUTE, Math.max(0, dc - i * 0.025)); const off = ((i % 3) - 1) * 18; chariot(x - Math.sin(ang) * off, y + Math.cos(ang) * off, 1.0, t + i); } ctx.restore();
        const [x, y] = posAt(cam, ROUTE, dc); if (t > s5.sei - 0.2) stamp('600 CARROS', Math.min(800, Math.max(280, x + 40)), Math.max(560, y - 110), prog(t, s5.sei - 0.05, s5.sei + 0.12), { size: 52 }); }
      frame();
      if (t > s5.far - 0.3) plaque('O FARAÓ VEM ATRÁS', 540, 360, 38, prog(t, s5.far - 0.3, s5.far), { col: RED }); else if (t > s5.vol - 0.3) plaque('VOLTAR E ACAMPAR', 540, 360, 38, prog(t, s5.vol - 0.3, s5.vol));
    }
    function scene6(t, cam) {
      drawMap(cam);
      const open = sm(t, s6.abr - 0.4, s6.abr + 0.5), nk = 0.6 * prog(t, B[5], s6.ven) * (1 - prog(t, s6.sec, s6.sec + 0.8));
      // corredor no mar
      const [ax, ay] = toS(cam, [32.36 * K, -29.835]), [bx, by] = toS(cam, [32.78 * K, -29.795]);
      if (open > 0) { const an = Math.atan2(by - ay, bx - ax), len = Math.hypot(bx - ax, by - ay), hw = 46 * open; ctx.save(); clipMap(); ctx.translate(ax, ay); ctx.rotate(an);
        ctx.fillStyle = '#d9c08a'; ctx.fillRect(0, -hw, len, hw * 2);
        for (const sgn of [-1, 1]) { const g = ctx.createLinearGradient(0, sgn * hw, 0, sgn * (hw + 40)); g.addColorStop(0, '#2f5d8a'); g.addColorStop(1, 'rgba(47,93,138,0)'); ctx.fillStyle = g; ctx.fillRect(0, sgn > 0 ? hw : -hw - 40, len, 40);
          ctx.beginPath(); for (let x = 0; x <= len; x += 8) ctx.lineTo(x, sgn * (hw + 3 + Math.sin(x * 0.12 + t * 8) * 3)); ctx.lineWidth = 5; ctx.strokeStyle = '#eaf3f7'; ctx.stroke(); }
        ctx.restore(); }
      night(nk);
      // vento oriental
      const wk = prog(t, s6.ven - 0.2, s6.ven + 0.3) * (1 - prog(t, s6.sec, s6.sec + 0.6)); if (wk > 0) { ctx.save(); clipMap(); ctx.strokeStyle = `rgba(240,245,250,${0.7 * wk})`; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 22; i++) { const y = RECT[1] + 60 + ((i * 137) % (RECT[3] - 120)), x = RECT[0] + RECT[2] - ((i * 211 + t * 900) % (RECT[2] + 200)); ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x - 40, y - 12, x - 80, y + 12, x - 130, y); ctx.stroke(); } ctx.restore(); txt('← VENTO FORTE', 820, RECT[1] + 50, 30, { w: 900, color: '#f4f4f4', a: wk }); }
      const d = dAt(t, SY6); drawRoute(cam, ROUTE, d, { w: 7 });
      ctx.save(); clipMap(); crowd(cam, ROUTE, d, t, { n: 120, r: 5, wid: 40 }); ctx.restore();
      place(cam, 'Pi-Hairote', 1, { big: true, off: [-80, -40] });
      frame();
      if (t > s6.sec - 0.3) plaque('EM TERRA SECA', 540, 360, 40, prog(t, s6.sec - 0.3, s6.sec), { col: BLUE }); else if (t > s6.abr - 0.3) plaque('O MAR SE ABRE', 540, 360, 40, prog(t, s6.abr - 0.3, s6.abr), { col: BLUE });
      else if (t > s6.mao - 0.3) plaque('MOISÉS ESTENDE A MÃO', 540, 360, 36, prog(t, s6.mao - 0.3, s6.mao));
    }
    function scene7(t, cam) {
      drawMap(cam); drawRoute(cam, VROUTE, VROUTE.tot, { col: '#6d6d6d', w: 4, dash: [12, 10], a: 0.45 }); drawRoute(cam, ROUTE, ROUTE.tot, { w: 7 });
      ['Ramessés', 'Sucote', 'Etã', 'Pi-Hairote'].forEach(n => place(cam, n, 1, { size: 24, label: n === 'Ramessés' || n === 'Pi-Hairote', off: n === 'Pi-Hairote' ? [-100, 10] : undefined }));
      const sk = sm(t, s7.sin - 0.4, s7.sin + 0.1, outBack); if (sk > 0) { const [x, y] = ll(cam, 33.97, 28.54); ctx.save(); ctx.translate(x, y); ctx.scale(sk, sk); ctx.beginPath(); ctx.moveTo(-34, 18); ctx.lineTo(0, -34); ctx.lineTo(34, 18); ctx.closePath(); ctx.fillStyle = '#9b7b4f'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); txt('MONTE SINAI', x, y + 46, 26, { w: 900, stroke: 7, a: sk }); }
      frame();
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(290, 1340); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RED; ctx.fillRect(-200, -46, 400, 92); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-200, -46, 400, 92); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 46, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
      if (t > s7.sin - 0.4) plaque('PRÓXIMA PARTE: ATÉ O SINAI', 540, 360, 36, prog(t, s7.sin - 0.4, s7.sin), { col: RED });
      else if (t > s7.qua - 0.3) plaque('QUAL PARTE MAIS TE MARCA?', 540, 360, 38, prog(t, s7.qua - 0.3, s7.qua));
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
      captions(t); txt('Rota tradicional aproximada. O local exato da travessia é debatido.', 540, 1780, 23, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
