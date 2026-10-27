/*
 * CAPITAIS — estado × capital (2º turno 2026), estilo "jornal de dados" em papel quadriculado, 9:16.
 * Mapa real dos estados (assets/br.json, simplificado de GeoJSON público do IBGE via click_that_hood).
 * Neutro: sem fotos, cores neutras (laranja = Flávio, turquesa = Lula), números oficiais do TSE.
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
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const milhar = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const pct = v => v.toFixed(1).replace('.', ',') + '%';

  // ---------------- dados (TSE, 2º turno, votos válidos, por estado) ----------------
  const UF = { AC: [144513, 287715], AP: [222968, 198674], AM: [1145783, 975245], PA: [2690449, 2199940], RO: [294446, 674382], RR: [83505, 219675], TO: [442962, 467916],
    AL: [1152621, 744140], BA: [6485258, 2608761], CE: [4036124, 1819478], MA: [2808231, 1229971], PB: [1794059, 865210], PE: [4117513, 1832554], PI: [1653989, 525859], RN: [1413596, 737409], SE: [989041, 433354],
    DF: [825224, 979542], GO: [1585555, 2345334], MT: [694167, 1351099], MS: [628973, 927892],
    ES: [1001965, 1294504], MG: [6351099, 6241786], RJ: [4565393, 5169033], SP: [12119274, 14139178],
    PR: [2566504, 4291444], RS: [2824552, 3874378], SC: [1418314, 3220071] };

  function create(TL, env) {
    const mk = env.createCanvas;
    const GEO = env.geo || require('../assets/br.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 5;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['36 mi e empate', '5 do Lula', '5 do Flávio', 'No detalhe', 'CTA'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ---------------- paleta "papel" ----------------
    const PAPER = '#f2f1ec', GRIDC = 'rgba(0,0,0,0.06)', INK = '#111111', GREY = '#d8d6cf', GREY2 = '#a9a69c', MUTE = '#6b6860';
    const FL = '#ff8a1f', LU = '#12a89c', LIME = '#c8f53a';
    const CN = { L: 'LULA', F: 'FLÁVIO' };

    // regiões
    const REG = {};
    for (const s of GEO) { (REG[s.r] = REG[s.r] || { ufs: [], L: 0, F: 0 }).ufs.push(s.uf); REG[s.r].L += UF[s.uf][0]; REG[s.r].F += UF[s.uf][1]; }
    const bbox = ufs => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const s of GEO) if (ufs.includes(s.uf)) for (const r of s.p) for (const [x, y] of r) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; };
    const ALL = GEO.map(s => s.uf);
    const centroid = {}; for (const s of GEO) { let sx = 0, sy = 0, n = 0; const r = s.p.reduce((a, b) => (b.length > a.length ? b : a)); for (const [x, y] of r) { sx += x; sy += y; n++; } centroid[s.uf] = [sx / n, sy / n]; }
    centroid.MG[1] += 0.3; centroid.SP[0] += 0.6; centroid.RJ[0] += 0.3; centroid.ES[1] += 0.3; centroid.PA[1] += 0.5;

    // ---------------- primitivas ----------------
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) {
      if (o.scale !== undefined && o.scale <= 0.001) return;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale);
      ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1;
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || PAPER; ctx.strokeText(s, 0, 0); }
      ctx.fillStyle = o.color || INK; ctx.fillText(s, 0, 0); ctx.restore();
    }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { // texto espaçado (estilo jornal)
      const sp = o.sp ?? size * 0.35, w = o.w || 600; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp;
      let cx = o.align === 'left' ? x : x - tot / 2; ga((o.a ?? 1));
      [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || INK }); cx += ws[i] + sp; }); ga(1);
      return tot;
    }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function boxed(s, x, y, size, k, o = {}) { // caixa branca com borda preta e sombra sólida
      if (k <= 0) return; const w = tw(s, size, 900) + size * 0.9, h = size * 1.55, sc = outBack(k);
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3));
      ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 8, -h / 2 + 8, w, h); ctx.fillStyle = o.fill || '#fff'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-w / 2, -h / 2, w, h);
      txt(s, 0, 3, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1);
    }
    function tag(s, x, y, size, col, k) { // etiqueta colorida (nome do candidato)
      if (k <= 0) return; const w = tw(s, size, 900) + size * 0.8, h = size * 1.45, sc = outBack(k);
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3));
      ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w, h); ctx.fillStyle = col; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-w / 2, -h / 2, w, h);
      txt(s, 0, 3, size, { w: 900, color: '#fff' }); ctx.restore(); ga(1);
    }
    function stamp(s, x, y, k, o = {}) {
      if (k <= 0) return; const sc = lerp(2.2, 1, outC(k)), size = o.size || 90, w = tw(s, size, 900) + 60, h = size * 1.4;
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(sc, sc); ga(clamp(k * 3));
      ctx.fillStyle = 'rgba(242,241,236,0.92)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 9; ctx.strokeStyle = o.col || INK; ctx.strokeRect(-w / 2, -h / 2, w, h);
      txt(s, 0, 4, size, { w: 900, color: o.col || INK }); ctx.restore(); ga(1);
    }
    function paper(t) {
      scr(); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 2; ctx.strokeStyle = GRIDC;
      for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
    function header() {
      spaced('TOP 10 CIDADES · 2º TURNO 2026', 540, 120, 30, { w: 600, sp: 9, color: INK });
      ctx.fillStyle = INK; ctx.fillRect(140, 150, 800, 3);
    }
    // barra comparativa Lula × Flávio
    function bar(y, L, F, k, o = {}) {
      if (k <= 0) return; const tot = L + F, fl = L / tot, x = 70, w = 940, h = 70; ga(clamp(k * 2));
      ctx.fillStyle = INK; ctx.fillRect(x + 8, y + 8, w, h);
      const gl = w * fl * outC(k), gr2 = w * (1 - fl) * outC(k);
      ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h); ctx.fillStyle = LU; ctx.fillRect(x, y, gl, h); ctx.fillStyle = FL; ctx.fillRect(x + w - gr2, y, gr2, h);
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(540, y - 22); ctx.lineTo(540, y + h + 22); ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]);
      txt(`${CN.L} ${pct(fl * 100)}`, x + 6, y - 34, 36, { w: 900, color: LU, align: 'left' }); txt(`${pct((1 - fl) * 100)} ${CN.F}`, x + w - 6, y - 34, 36, { w: 900, color: FL, align: 'right' });
      ga(1);
    }

    // ---------------- mapa ----------------
    const RECT = [40, 590, 1000, 880]; // área do mapa na tela
    function camFor(ufs, pad = 0.12) { const [x0, y0, x1, y1] = bbox(ufs), bw = (x1 - x0) * (1 + pad * 2), bh = (y1 - y0) * (1 + pad * 2), s = Math.min(RECT[2] / bw, RECT[3] / bh); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; }
    const CAMS = [camFor(ALL, 0.04), camFor(ALL, 0.04), camFor(ALL, 0.04), camFor(ALL, 0.04), camFor(ALL, 0.04)];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i], B[i] + 0.9); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    function statePath(s) { ctx.beginPath(); for (const r of s.p) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } }
    // fills: uf -> 0..1 (cor do vencedor), focus: set de ufs com relevo, pop: uf -> 0..1 (salta)
    function map(cam, fills, focus, o = {}) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, RECT[1] - 30, W, RECT[3] + 60); ctx.clip(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      const lw = 1 / cam.s;
      // fora de foco
      for (const s of GEO) { if (focus && focus.has(s.uf)) continue; statePath(s); const f = fills[s.uf] || 0; ctx.fillStyle = f > 0 ? mixC(GREY, UF[s.uf][0] > UF[s.uf][1] ? LU : FL, f * (focus ? 0.35 : 1)) : GREY; ctx.fill(); ctx.lineWidth = 2.5 * lw; ctx.strokeStyle = '#fff'; ctx.stroke(); }
      if (focus) { // relevo (sombra preta) + estados em foco
        const d = 14 * lw;
        for (const s of GEO) if (focus.has(s.uf)) { ctx.save(); ctx.translate(d, d); statePath(s); ctx.fillStyle = INK; ctx.fill(); ctx.lineWidth = 2 * lw; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
        for (const s of GEO) if (focus.has(s.uf)) { const p = (o.pop && o.pop[s.uf]) || 0; ctx.save(); if (p > 0) { const [cx, cy] = centroid[s.uf], sc = 1 + 0.06 * Math.sin(Math.PI * clamp(p)); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy); }
          statePath(s); const f = fills[s.uf] || 0; ctx.fillStyle = f > 0 ? mixC('#ffffff', UF[s.uf][0] > UF[s.uf][1] ? LU : FL, f) : '#ffffff'; ctx.fill(); ctx.lineWidth = 3 * lw; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
      }
      ctx.restore();
    }
    function toScreen(cam, x, y) { return [RECT[0] + RECT[2] / 2 + (x - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (y - cam.cy) * cam.s]; }
    function ufLabel(cam, uf, k, o = {}) { if (k <= 0) return; let [x, y] = toScreen(cam, ...centroid[uf]); x += o.dx || 0; y += o.dy || 0; const [L, F] = UF[uf], w = L > F ? 'L' : 'F', p = (L > F ? L : F) / (L + F) * 100;
      ctx.save(); ctx.translate(x, y); const sc = outBack(k) * (o.s || 1); ctx.scale(sc, sc); ga(clamp(k * 3));
      const s1 = uf, s2 = pct(p); const bw = Math.max(tw(s1, 34, 900), tw(s2, 30, 800)) + 30;
      ctx.fillStyle = INK; ctx.fillRect(-bw / 2 + 5, -40 + 5, bw, 80); ctx.fillStyle = '#fff'; ctx.fillRect(-bw / 2, -40, bw, 80); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -40, bw, 80);
      txt(s1, 0, -14, 34, { w: 900 }); txt(s2, 0, 20, 30, { w: 800, color: w === 'L' ? LU : FL }); ctx.restore(); ga(1); }
    const mixC = (a, b, u) => { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return 'rgb(' + pa.map((x, i) => Math.round(lerp(x, pb[i], clamp(u)))).join(',') + ')'; };

    // painel "região": título espaçado + número grande + etiqueta
    function regionPanel(t, name, t0, num, numT, who, sub) {
      spaced(name, 540, 240, 52, { w: 700, sp: 14, a: sm(t, t0 - 0.2, t0 + 0.2) });
      if (num && t > numT - 0.3) { const k = sm(t, numT - 0.3, numT + 0.1, outBack); txt(num, 540, 395, 150, { w: 900, color: INK, scale: k }); if (who) tag(who === 'L' ? `A MAIS PARA ${CN.L}` : `A MAIS PARA ${CN.F}`, 540, 505, 34, who === 'L' ? LU : FL, prog(t, numT, numT + 0.25)); if (sub) txt(sub, 540, 505, 34, { w: 800, color: MUTE, a: prog(t, numT, numT + 0.25) }); }
    }
    const fillAll = (ufs, k, map0 = {}) => { const m = Object.assign({}, map0); ufs.forEach(u => (m[u] = Math.max(m[u] || 0, k))); return m; };
    const BASE = {}; // estados já revelados em cenas anteriores (ficam pintados de leve)

    // ---------------- top 10 cidades (IBGE 2025) + 2º turno ----------------
    const TOP = [['São Paulo', 'SP', -46.63, -23.55, 55.50, 11.9], ['Rio de Janeiro', 'RJ', -43.17, -22.91, 51.54, 6.7], ['Brasília', 'DF', -47.88, -15.79, 45.72, 3.0], ['Fortaleza', 'CE', -38.54, -3.72, 60.07, 2.6], ['Salvador', 'BA', -38.50, -12.97, 73.24, 2.6],
      ['Belo Horizonte', 'MG', -43.94, -19.92, 49.20, 2.4], ['Manaus', 'AM', -60.02, -3.12, 44.17, 2.3], ['Curitiba', 'PR', -49.27, -25.43, 37.71, 1.8], ['Recife', 'PE', -34.88, -8.05, 61.27, 1.6], ['Goiânia', 'GO', -49.25, -16.68, 37.36, 1.5]]
      .map(([n, uf, lon, lat, L, pop], i) => ({ n, uf, x: lon * 0.97, y: -lat, L, pop, rank: i + 1 }));
    const city = n => TOP.find(c => c.n === n);
    const PALE = 0.3;
    const paleAll = k => { const f = {}; for (const s of GEO) f[s.uf] = PALE * k; return f; };
    function dot(cam, c, k, o = {}) {
      if (k <= 0) return; const [x, y] = toScreen(cam, c.x, c.y), win = c.L > 50 ? LU : FL, r = (8 + Math.sqrt(c.pop) * 9) * outBack(k) * (1 + 0.4 * (o.pulse || 0)) * (o.s || 1);
      if (o.pulse) { ctx.beginPath(); ctx.arc(x, y, r * 1.9, 0, TAU); ctx.fillStyle = (c.L > 50 ? 'rgba(18,168,156,' : 'rgba(255,138,31,') + (0.35 * o.pulse) + ')'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(x + 4, y + 4, r, 0, TAU); ctx.fillStyle = INK; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = o.grey ? '#ffffff' : win; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    }
    function label(cam, c, k, o = {}) {
      if (k <= 0) return; let [x, y] = toScreen(cam, c.x, c.y); x += o.dx || 0; y += o.dy ?? -80;
      const win = c.L > 50 ? 'L' : 'F', p = win === 'L' ? c.L : 100 - c.L, s1 = c.n.toUpperCase(), s2 = o.both ? `${pct(c.L)} × ${pct(100 - c.L)}` : `${CN[win]} ${pct(p)}`;
      const size = o.size || 30, bw = Math.max(tw(s1, size, 900), tw(s2, size * 0.9, 800)) + 30, bh = size * 2.5;
      ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = INK; ctx.fillRect(-bw / 2 + 6, -bh / 2 + 6, bw, bh); ctx.fillStyle = '#fff'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      txt(s1, 0, -size * 0.45, size, { w: 900 }); txt(s2, 0, size * 0.62, size * 0.9, { w: 800, color: win === 'L' ? LU : FL }); ctx.restore(); ga(1);
    }
    const OFF = { 'São Paulo': [-170, 70], 'Rio de Janeiro': [120, 85], 'Brasília': [-60, -95], 'Fortaleza': [-80, -85], 'Salvador': [-185, 45], 'Belo Horizonte': [180, -15], 'Manaus': [0, -85], 'Curitiba': [-190, 40], 'Recife': [-195, -35], 'Goiânia': [-210, 30] };
    function lbl(cam, n, k, o = {}) { const [dx, dy] = OFF[n]; label(cam, city(n), k, Object.assign({ dx, dy }, o)); }
    function scoreTop(t, tL, tF, a = 1) {
      if (t < Math.min(tL, tF) - 0.3) return; ga(a);
      const kL = sm(t, tL - 0.3, tL + 0.1, outBack), kF = sm(t, tF - 0.3, tF + 0.1, outBack);
      if (kL > 0) { ctx.save(); ctx.translate(300, 410); ctx.scale(kL, kL); txt('5', 0, 0, 160, { w: 900, color: LU }); ctx.restore(); tag(CN.L, 300, 515, 32, LU, kL); }
      if (kF > 0) { ctx.save(); ctx.translate(780, 410); ctx.scale(kF, kF); txt('5', 0, 0, 160, { w: 900, color: FL }); ctx.restore(); tag(CN.F, 780, 515, 32, FL, kF); }
      txt('×', 540, 410, 90, { w: 900, color: MUTE, a: Math.min(kL, kF) }); ga(1);
    }

    // ================= CENA 1 — 36 milhões e o empate =================
    const s1 = { dez: wt('c1', 'dez'), mai: wt('c1', 'maiores'), tri: wt('c1', 'trinta'), pes: wt('c1', 'pessoas'), seg: wt('c1', 'segundo'), emp: wt('c1', 'empate'), cin: wt('c1', 'cinco'), lad: wt('c1', 'lado') };
    cue(0, 'music', { part: 'intro' }); TOP.forEach((c, i) => cue(s1.dez + 0.1 + i * 0.12, 'pop', { gain: 0.35 })); cue(s1.tri, 'riser', { dur: 0.7 }); cue(s1.emp, 'stamp'); cue(s1.emp, 'music', { part: 'groove' });
    function scene1(t, cam) {
      map(cam, paleAll(1), null);
      const colored = t > s1.seg - 0.1;
      TOP.forEach((c, i) => dot(cam, c, prog(t, s1.dez + i * 0.12, s1.dez + i * 0.12 + 0.3), { grey: !colored }));
      spaced('AS 10 MAIORES CIDADES', 540, 240, 46, { w: 700, sp: 12, a: sm(t, s1.dez - 0.3, s1.dez) });
      if (t < s1.emp - 0.3) { const k = sm(t, s1.tri - 0.3, s1.tri + 0.1, outBack); txt(`${(36.4 * outC(prog(t, s1.tri - 0.2, s1.pes))).toFixed(1).replace('.', ',')} MI`, 540, 400, 150, { w: 900, scale: k }); txt('DE HABITANTES', 540, 505, 32, { w: 800, color: MUTE, a: prog(t, s1.pes - 0.2, s1.pes + 0.1) }); }
      else { scoreTop(t, s1.cin, s1.cin); stamp('EMPATE', 540, 560, prog(t, s1.emp - 0.05, s1.emp + 0.12) * (1 - prog(t, s1.cin - 0.2, s1.cin)), { size: 70 }); }
    }
    // ================= CENA 2 — as 5 do Lula =================
    const L5 = ['São Paulo', 'Rio de Janeiro', 'Fortaleza', 'Salvador', 'Recife'];
    const s2 = { lul: wt('c2', 'lula'), sao: wt('c2', 'sao'), rio: wt('c2', 'rio'), for: wt('c2', 'fortaleza'), sal: wt('c2', 'salvador'), rec: wt('c2', 'recife'), sal2: wt('c2', 'salvador', 1), set: wt('c2', 'setenta') };
    const tL5 = [s2.sao, s2.rio, s2.for, s2.sal, s2.rec]; tL5.forEach(x => cue(x, 'plop')); cue(s2.set, 'tada');
    function scene2(t, cam) {
      map(cam, paleAll(1), null);
      TOP.forEach(c => dot(cam, c, 1, { grey: !L5.includes(c.n), s: L5.includes(c.n) ? 1 : 0.6 }));
      L5.forEach((n, i) => dot(cam, city(n), 1, { pulse: pulse(t, tL5[i], 0.1, 0.8) })); L5.forEach((n, i) => { const tt = tL5[i]; lbl(cam, n, prog(t, tt - 0.1, tt + 0.2) * (n === 'Salvador' ? 1 : 1 - 0.5 * prog(t, s2.sal2 - 0.2, s2.sal2))); });
      spaced(`AS 5 DO ${CN.L}`, 540, 240, 50, { w: 700, sp: 13, color: LU, a: sm(t, s2.lul - 0.3, s2.lul) });
      const k = sm(t, s2.set - 0.3, s2.set + 0.1, outBack); if (k > 0) { txt('73%', 540, 400, 150, { w: 900, color: LU, scale: k }); txt('SALVADOR, A MAIS FORTE', 540, 505, 32, { w: 900, a: k }); }
    }
    // ================= CENA 3 — as 5 do Flávio =================
    const F5 = ['Brasília', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Goiânia'];
    const s3 = { fla: wt('c3', 'flavio'), bra: wt('c3', 'brasilia'), bel: wt('c3', 'belo'), man: wt('c3', 'manaus'), cur: wt('c3', 'curitiba'), goi: wt('c3', 'goiania'), goi2: wt('c3', 'goiania', 1), ses: wt('c3', 'sessenta') };
    const tF5 = [s3.bra, s3.bel, s3.man, s3.cur, s3.goi]; tF5.forEach(x => cue(x, 'plop')); cue(s3.ses, 'tada');
    function scene3(t, cam) {
      map(cam, paleAll(1), null);
      TOP.forEach(c => dot(cam, c, 1, { grey: !F5.includes(c.n), s: F5.includes(c.n) ? 1 : 0.6 }));
      F5.forEach((n, i) => dot(cam, city(n), 1, { pulse: pulse(t, tF5[i], 0.1, 0.8) })); F5.forEach((n, i) => lbl(cam, n, prog(t, tF5[i] - 0.1, tF5[i] + 0.2)));
      spaced(`AS 5 DO ${CN.F}`, 540, 240, 50, { w: 700, sp: 13, color: FL, a: sm(t, s3.fla - 0.3, s3.fla) });
      const k = sm(t, s3.ses - 0.3, s3.ses + 0.1, outBack); if (k > 0) { txt('+62%', 540, 400, 150, { w: 900, color: FL, scale: k }); txt('GOIÂNIA E CURITIBA', 540, 505, 32, { w: 900, a: k }); }
    }
    // ================= CENA 4 — as apertadas =================
    const s4 = { apr: wt('c4', 'apertada'), bel: wt('c4', 'belo'), cin: wt('c4', 'cinquenta'), rio: wt('c4', 'rio'), det: wt('c4', 'detalhe'), lul: wt('c4', 'lula'), cin2: wt('c4', 'cinquenta', 1) };
    cue(s4.apr, 'scratch'); cue(s4.bel, 'ding'); cue(s4.rio, 'ding'); cue(s4.det, 'stamp');
    function scene4(t, cam) {
      map(cam, paleAll(1), null);
      TOP.forEach(c => dot(cam, c, 1, { grey: true, s: 0.6 }));
      const bh = city('Belo Horizonte'), rj = city('Rio de Janeiro');
      dot(cam, bh, 1, { pulse: pulse(t, s4.bel, 0.1, 1) }); dot(cam, rj, prog(t, s4.rio - 0.2, s4.rio), { pulse: pulse(t, s4.rio, 0.1, 1) });
      label(cam, bh, prog(t, s4.cin - 0.2, s4.cin + 0.1), { both: true, dx: -190, dy: -60, size: 34 }); label(cam, rj, prog(t, s4.cin2 - 0.2, s4.cin2 + 0.1), { both: true, dx: 140, dy: 70, size: 34 });
      spaced('NO DETALHE', 540, 240, 50, { w: 700, sp: 13, a: sm(t, s4.apr - 0.3, s4.apr) });
      stamp('BH: 1,6 PONTO', 540, 400, prog(t, s4.cin - 0.05, s4.cin + 0.12) * (1 - prog(t, s4.rio - 0.3, s4.rio)), { size: 66 });
      stamp('RIO: 3 PONTOS', 540, 400, prog(t, s4.det - 0.05, s4.det + 0.12), { size: 66, rot: 0.06 });
    }
    // ================= CENA 5 — CTA =================
    const s5 = { sua: wt('c5', 'sua'), cid: wt('c5', 'cidade'), top: wt('c5', 'top'), com: wt('c5', 'comenta'), seg: wt('c5', 'segue') };
    cue(B[4], 'music', { part: 'outro' }); cue(s5.com, 'notif'); cue(s5.seg + 0.2, 'tap'); cue(s5.seg + 0.25, 'success');
    function scene5(t, cam) {
      ga(0.4); map(cam, paleAll(1), null); TOP.forEach(c => dot(cam, c, 1)); ga(1);
      txt('A SUA CIDADE', 540, 320, 96, { w: 900, scale: sm(t, s5.sua - 0.2, s5.sua + 0.15, outBack) }); txt('TÁ NO TOP 10?', 540, 435, 96, { w: 900, color: LU, scale: sm(t, s5.top - 0.2, s5.top + 0.1, outBack) });
      ['Recife!', 'Goiânia aqui', 'Campinas ficou fora'].forEach((m, i) => { const k = prog(t, s5.com + i * 0.2, s5.com + i * 0.2 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([330, 750, 400][i], [720, 840, 960][i]); ctx.scale(outBack(k), outBack(k)); const w = tw(m, 34, 800) + 60; ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 6, -42 + 6, w, 84); ctx.fillStyle = '#fff'; ctx.fillRect(-w / 2, -42, w, 84); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-w / 2, -42, w, 84); txt(m, 0, 2, 34, { w: 800 }); ctx.restore(); });
      const bk = sm(t, s5.seg - 0.3, s5.seg + 0.1, outBack), press = t > s5.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1200); const pr = bk * (1 - 0.06 * pulse(t, s5.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = INK; ctx.fillRect(-250 + 8, -70 + 8, 500, 140); ctx.fillStyle = press ? '#fff' : LIME; ctx.fillRect(-250, -70, 500, 140); ctx.lineWidth = 5; ctx.strokeRect(-250, -70, 500, 140); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 60, { w: 900 }); ctx.restore(); }
    }

    // ================= legendas (caixa branca, palavra falada em verde-limão) =================
    const groups = []; {
      let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); }
      flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; });
    }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return;
      scr(); const size = 62, pad = 26;
      const words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 18, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
      const pop = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15)), bw = total + pad * 2, bh = size * 1.6;
      ctx.save(); ctx.translate(540, 1600); ctx.scale(pop, pop);
      ctx.fillStyle = INK; ctx.fillRect(-bw / 2 + 8, -bh / 2 + 8, bw, bh); ctx.fillStyle = '#fff'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      let x = -total / 2;
      g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < (w.end + 0.02); if (cur) { ctx.fillStyle = LIME; ctx.fillRect(x - 8, -size * 0.62, ws[i] + 16, size * 1.24); } txt(words[i], x + ws[i] / 2, 3, size, { w: 900 }); x += ws[i] + sp; });
      ctx.restore();
    }

    // ================= composição =================
    const sceneFns = [scene1, scene2, scene3, scene4, scene5];
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      // estados já mostrados ficam coloridos de leve nas cenas seguintes
      for (const k in BASE) delete BASE[k];
      const done = [];
      done.forEach(r => REG[r].ufs.forEach(u => (BASE[u] = 1)));
      paper(t); header();
      ctx.save(); sceneFns[i](t, camAt(t, i)); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t);
      ctx.fillStyle = '#fff'; ctx.fillRect(40, 1730, 330, 50); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeRect(40, 1730, 330, 50); spaced('VOZ GERADA POR IA', 205, 1757, 22, { w: 600, sp: 6 });
      txt('Fonte: TSE e IBGE • votos válidos • conteúdo educativo', 1040, 1757, 22, { w: 600, color: MUTE, align: 'right' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
