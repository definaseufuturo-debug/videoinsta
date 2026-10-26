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
    const END = TL.duration, NS = 6;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Placar 14 × 13', 'Estado Flávio, capital Lula', 'Estado Lula, capital Flávio', 'Mais apertadas', 'Extremos', 'CTA'];
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
      spaced('AS CAPITAIS · 2º TURNO 2026', 540, 120, 30, { w: 600, sp: 9, color: INK });
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
    const RECT = [70, 600, 940, 720]; // área do mapa na tela
    function camFor(ufs, pad = 0.12) { const [x0, y0, x1, y1] = bbox(ufs), bw = (x1 - x0) * (1 + pad * 2), bh = (y1 - y0) * (1 + pad * 2), s = Math.min(RECT[2] / bw, RECT[3] / bh); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; }
    const CAMS = [camFor(ALL, 0.04), camFor(['SP', 'RJ', 'RS', 'SC', 'PR', 'MG', 'ES'], 0.06), camFor(ALL, 0.02), camFor(ALL, 0.02), camFor(ALL, 0.02), camFor(ALL, 0.04)];
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

    // ---------------- capitais (2º turno, % Lula nos votos válidos) ----------------
    const CAP = [['Aracaju','SE',-37.07,-10.91,62.07],['Belém','PA',-48.50,-1.46,55.01],['Belo Horizonte','MG',-43.94,-19.92,49.20],['Boa Vista','RR',-60.67,2.82,24.25],['Brasília','DF',-47.88,-15.79,45.72],['Campo Grande','MS',-54.62,-20.47,38.89],['Cuiabá','MT',-56.10,-15.60,40.42],['Curitiba','PR',-49.27,-25.43,37.71],['Florianópolis','SC',-48.55,-27.60,48.34],['Fortaleza','CE',-38.54,-3.72,60.07],['Goiânia','GO',-49.25,-16.68,37.36],['João Pessoa','PB',-34.86,-7.12,53.83],['Macapá','AP',-51.07,0.03,50.99],['Maceió','AL',-35.74,-9.67,47.99],['Manaus','AM',-60.02,-3.12,44.17],['Natal','RN',-35.21,-5.79,56.00],['Palmas','TO',-48.33,-10.18,39.65],['Porto Alegre','RS',-51.23,-30.03,55.84],['Porto Velho','RO',-63.90,-8.76,38.34],['Recife','PE',-34.88,-8.05,61.27],['Rio Branco','AC',-67.81,-9.97,33.45],['Rio de Janeiro','RJ',-43.17,-22.91,51.54],['Salvador','BA',-38.50,-12.97,73.24],['São Luís','MA',-44.30,-2.53,62.05],['São Paulo','SP',-46.63,-23.55,55.50],['Teresina','PI',-42.80,-5.09,67.98],['Vitória','ES',-40.31,-20.32,48.18]]
      .map(([n, uf, lon, lat, L]) => ({ n, uf, x: lon * 0.97, y: -lat, L }));
    const cap = n => CAP.find(c => c.n === n);
    const ORDER = CAP.slice().sort((a, b) => a.x - b.x);
    function dot(cam, c, k, o = {}) {
      if (k <= 0) return; const [x, y] = toScreen(cam, c.x, c.y); if (y < RECT[1] - 20 || y > RECT[1] + RECT[3] + 20) return; const win = c.L > 50 ? LU : FL, r = (o.r || 15) * outBack(k) * (1 + 0.5 * (o.pulse || 0));
      if (o.pulse) { ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, TAU); ctx.fillStyle = (c.L > 50 ? 'rgba(18,168,156,' : 'rgba(255,138,31,') + (0.35 * o.pulse) + ')'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(x + 3, y + 3, r, 0, TAU); ctx.fillStyle = INK; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = win; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    }
    function capLabel(cam, c, k, o = {}) {
      if (k <= 0) return; let [x, y] = toScreen(cam, c.x, c.y); x += o.dx || 0; y += o.dy ?? -70;
      const L = c.L, win = L > 50 ? 'L' : 'F', p = win === 'L' ? L : 100 - L, s1 = c.n.toUpperCase(), s2 = o.both ? `${pct(L)} × ${pct(100 - L)}` : `${CN[win]} ${pct(p)}`;
      const size = o.size || 32, bw = Math.max(tw(s1, size, 900), tw(s2, size * 0.9, 800)) + 34, bh = size * 2.5;
      ctx.save(); ctx.translate(x, y); const sc = outBack(k); ctx.scale(sc, sc); ga(clamp(k * 3));
      ctx.fillStyle = INK; ctx.fillRect(-bw / 2 + 6, -bh / 2 + 6, bw, bh); ctx.fillStyle = '#fff'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      txt(s1, 0, -size * 0.45, size, { w: 900 }); txt(s2, 0, size * 0.62, size * 0.9, { w: 800, color: o.both ? INK : (win === 'L' ? LU : FL) }); ctx.restore(); ga(1);
    }
    const PALE = 0.45;
    const paleAll = k => { const f = {}; for (const s of GEO) f[s.uf] = PALE * k; return f; };
    function score(t, tF, tL, a = 1) {
      if (t < tF - 0.3) return; ga(a);
      const kF = sm(t, tF - 0.3, tF + 0.1, outBack), kL = sm(t, tL - 0.3, tL + 0.1, outBack);
      if (kF > 0) { ctx.save(); ctx.translate(300, 400); ctx.scale(kF, kF); txt('14', 0, 0, 150, { w: 900, color: FL }); ctx.restore(); tag(CN.F, 300, 500, 32, FL, kF); }
      if (kL > 0) { ctx.save(); ctx.translate(780, 400); ctx.scale(kL, kL); txt('13', 0, 0, 150, { w: 900, color: LU }); ctx.restore(); tag(CN.L, 780, 500, 32, LU, kL); }
      txt('×', 540, 400, 80, { w: 900, color: MUTE, a: Math.min(kF, 1) }); ga(1);
    }

    // ================= CENA 1 — placar das capitais =================
    const s1 = { cap: wt('c1', 'capitais'), qua: wt('c1', 'quase'), emp: wt('c1', 'empate'), cat: wt('c1', 'catorze'), tre: wt('c1', 'treze'), cur: wt('c1', 'curioso'), dif: wt('c1', 'diferente'), est: wt('c1', 'estado') };
    cue(0, 'music', { part: 'intro' }); ORDER.forEach((c, i) => { if (i % 3 === 0) cue(s1.cap + i * 0.05, 'pop', { gain: 0.35 }); }); cue(s1.cat, 'coin'); cue(s1.tre, 'coin'); cue(s1.dif, 'scratch'); cue(s1.dif, 'music', { part: 'groove' });
    function scene1(t, cam) {
      map(cam, paleAll(sm(t, s1.dif - 0.2, s1.est + 0.3)), null);
      ORDER.forEach((c, i) => dot(cam, c, prog(t, s1.cap - 0.2 + i * 0.05, s1.cap + i * 0.05 + 0.15)));
      spaced('AS 27 CAPITAIS', 540, 240, 52, { w: 700, sp: 14, a: sm(t, s1.cap - 0.3, s1.cap) });
      score(t, s1.cat, s1.tre, 1 - prog(t, s1.dif - 0.6, s1.dif - 0.3));
      if (t > s1.dif - 0.3) { boxed('CAPITAL ≠ ESTADO', 540, 420, 64, prog(t, s1.dif - 0.2, s1.dif + 0.1), { fill: LIME }); }
      bar(1420, 13, 14, 0);
    }
    // ================= CENA 2 — estado Flávio, capital Lula =================
    const s2 = { est: wt('c2', 'estado'), sao: wt('c2', 'sao'), fla: wt('c2', 'flavio'), cid: wt('c2', 'cidade'), lul: wt('c2', 'lula'), cin: wt('c2', 'cinquenta'), mes: wt('c2', 'mesmo'), rio: wt('c2', 'rio'), por: wt('c2', 'porto') };
    cue(s2.fla, 'plop'); cue(s2.cid, 'whoosh', { dur: 0.4 }); cue(s2.lul, 'ding'); cue(s2.rio, 'pop'); cue(s2.por, 'pop');
    function scene2(t, cam) {
      const f = paleAll(1); f.SP = lerp(PALE, 1, sm(t, s2.fla - 0.2, s2.fla + 0.3)); f.RJ = lerp(PALE, 1, sm(t, s2.rio - 0.2, s2.rio + 0.2)); f.RS = lerp(PALE, 1, sm(t, s2.por - 0.2, s2.por + 0.2));
      map(cam, f, new Set(['SP', 'RJ', 'RS']));
      for (const c of CAP) dot(cam, c, 1, { r: 11 });
      const sp = cap('São Paulo'), rj = cap('Rio de Janeiro'), pa = cap('Porto Alegre');
      dot(cam, sp, 1, { r: 18, pulse: pulse(t, s2.lul, 0.1, 1.2) }); dot(cam, rj, prog(t, s2.rio - 0.2, s2.rio), { r: 18, pulse: pulse(t, s2.rio, 0.1, 1) }); dot(cam, pa, prog(t, s2.por - 0.2, s2.por), { r: 18, pulse: pulse(t, s2.por, 0.1, 1) });
      tag(`ESTADO: ${CN.F}`, 540, 330, 40, FL, prog(t, s2.fla - 0.15, s2.fla + 0.15) * (1 - prog(t, s2.mes - 0.3, s2.mes)));
      tag(`CAPITAL: ${CN.L}`, 540, 440, 40, LU, prog(t, s2.lul - 0.15, s2.lul + 0.15) * (1 - prog(t, s2.mes - 0.3, s2.mes)));
      spaced('ESTADO ≠ CAPITAL', 540, 240, 52, { w: 700, sp: 14, a: sm(t, B[1] + 0.2, B[1] + 0.6) });
      capLabel(cam, sp, prog(t, s2.cin - 0.2, s2.cin + 0.1), { dx: -150, dy: 40 });
      capLabel(cam, rj, prog(t, s2.rio - 0.1, s2.rio + 0.2), { dx: 150, dy: -50 });
      capLabel(cam, pa, prog(t, s2.por - 0.1, s2.por + 0.2), { dx: 170, dy: 0 });
      if (t > s2.mes - 0.3) txt('O MESMO EM 3 CAPITAIS', 540, 400, 56, { w: 900, scale: sm(t, s2.mes - 0.3, s2.mes, outBack) });
    }
    // ================= CENA 3 — estado Lula, capital Flávio =================
    const s3 = { con: wt('c3', 'contrario'), lul: wt('c3', 'lula'), ama: wt('c3', 'amazonas'), ala: wt('c3', 'alagoas'), min: wt('c3', 'minas'), man: wt('c3', 'manaus'), mac: wt('c3', 'maceio'), bel: wt('c3', 'belo'), fla: wt('c3', 'flavio') };
    cue(s3.con, 'whoosh', { dur: 0.4 }); cue(s3.ama, 'plop'); cue(s3.ala, 'plop'); cue(s3.min, 'plop'); cue(s3.man, 'pop'); cue(s3.mac, 'pop'); cue(s3.bel, 'pop'); cue(s3.fla, 'stamp');
    function scene3(t, cam) {
      const f = paleAll(1); f.AM = lerp(PALE, 1, sm(t, s3.ama - 0.2, s3.ama + 0.2)); f.AL = lerp(PALE, 1, sm(t, s3.ala - 0.2, s3.ala + 0.2)); f.MG = lerp(PALE, 1, sm(t, s3.min - 0.2, s3.min + 0.2));
      map(cam, f, new Set(['AM', 'AL', 'MG']));
      for (const c of CAP) dot(cam, c, 1, { r: 9 });
      const ma = cap('Manaus'), mc = cap('Maceió'), bh = cap('Belo Horizonte');
      [[ma, s3.man], [mc, s3.mac], [bh, s3.bel]].forEach(([c, tt]) => { dot(cam, c, prog(t, tt - 0.2, tt), { r: 16, pulse: pulse(t, tt, 0.1, 1) }); });
      capLabel(cam, ma, prog(t, s3.man - 0.1, s3.man + 0.2), { dy: -75 }); capLabel(cam, mc, prog(t, s3.mac - 0.1, s3.mac + 0.2), { dx: -40, dy: -80 }); capLabel(cam, bh, prog(t, s3.bel - 0.1, s3.bel + 0.2), { dx: -160, dy: 10 });
      spaced('O CONTRÁRIO', 540, 240, 52, { w: 700, sp: 14, a: sm(t, s3.con - 0.3, s3.con) });
      tag(`ESTADO: ${CN.L}`, 540, 340, 40, LU, prog(t, s3.lul - 0.15, s3.lul + 0.15));
      tag(`CAPITAL: ${CN.F}`, 540, 450, 40, FL, prog(t, s3.man - 0.15, s3.man + 0.15));
    }
    // ================= CENA 4 — as mais apertadas =================
    const s4 = { apr: wt('c4', 'apertadas'), mac: wt('c4', 'macapa'), bel: wt('c4', 'belo'), men: wt('c4', 'menos'), doi: wt('c4', 'dois'), pon: wt('c4', 'pontos') };
    cue(s4.apr, 'scratch'); cue(s4.mac, 'pop'); cue(s4.bel, 'pop'); cue(s4.doi, 'stamp');
    function scene4(t, cam) {
      map(cam, paleAll(1), null); for (const c of CAP) dot(cam, c, 1, { r: 9 });
      const mp = cap('Macapá'), bh = cap('Belo Horizonte');
      dot(cam, mp, 1, { r: 16, pulse: pulse(t, s4.mac, 0.1, 1) }); dot(cam, bh, 1, { r: 16, pulse: pulse(t, s4.bel, 0.1, 1) });
      capLabel(cam, mp, prog(t, s4.mac - 0.1, s4.mac + 0.2), { both: true, dy: -80, size: 34 }); capLabel(cam, bh, prog(t, s4.bel - 0.1, s4.bel + 0.2), { both: true, dx: -150, dy: 20, size: 34 });
      spaced('AS MAIS APERTADAS', 540, 240, 52, { w: 700, sp: 14, a: sm(t, s4.apr - 0.3, s4.apr) });
      stamp('< 2 PONTOS', 540, 420, prog(t, s4.doi - 0.05, s4.doi + 0.12), { size: 100 });
    }
    // ================= CENA 5 — extremos =================
    const s5 = { ext: wt('c5', 'extremos'), sal: wt('c5', 'salvador'), set: wt('c5', 'setenta'), boa: wt('c5', 'boa'), set2: wt('c5', 'setenta', 1) };
    cue(s5.ext, 'riser', { dur: 0.6 }); cue(s5.sal, 'impact', { gain: 0.6 }); cue(s5.boa, 'impact', { gain: 0.6 }); cue(s5.boa, 'music', { part: 'drop2' });
    function scene5(t, cam) {
      map(cam, paleAll(1), null); for (const c of CAP) dot(cam, c, 1, { r: 9 });
      const sa = cap('Salvador'), bv = cap('Boa Vista');
      dot(cam, sa, 1, { r: 20, pulse: pulse(t, s5.sal, 0.1, 1.5) }); dot(cam, bv, 1, { r: 20, pulse: pulse(t, s5.boa, 0.1, 1.5) });
      capLabel(cam, sa, prog(t, s5.sal - 0.1, s5.sal + 0.2), { dx: -130, dy: 40, size: 36 }); capLabel(cam, bv, prog(t, s5.boa - 0.1, s5.boa + 0.2), { dx: 140, dy: 30, size: 36 });
      spaced('OS EXTREMOS', 540, 240, 52, { w: 700, sp: 14, a: sm(t, s5.ext - 0.3, s5.ext) });
      const k1 = sm(t, s5.set - 0.3, s5.set + 0.1, outBack), k2 = sm(t, s5.set2 - 0.3, s5.set2 + 0.1, outBack);
      if (k1 > 0) { ctx.save(); ctx.translate(300, 400); ctx.scale(k1, k1); txt('73%', 0, 0, 130, { w: 900, color: LU }); ctx.restore(); txt('SALVADOR', 300, 495, 30, { w: 900, a: k1 }); }
      if (k2 > 0) { ctx.save(); ctx.translate(780, 400); ctx.scale(k2, k2); txt('76%', 0, 0, 130, { w: 900, color: FL }); ctx.restore(); txt('BOA VISTA', 780, 495, 30, { w: 900, a: k2 }); }
    }
    // ================= CENA 6 — CTA =================
    const s6 = { sua: wt('c6', 'sua'), cid: wt('c6', 'cidade'), com: wt('c6', 'comenta'), seg: wt('c6', 'segue') };
    cue(B[5], 'music', { part: 'outro' }); cue(s6.com, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t, cam) {
      ga(0.35); map(cam, paleAll(1), null); for (const c of CAP) dot(cam, c, 1, { r: 9 }); ga(1);
      txt('E NA SUA', 540, 330, 104, { w: 900, scale: sm(t, s6.sua - 0.2, s6.sua + 0.15, outBack) }); txt('CIDADE?', 540, 450, 104, { w: 900, color: LU, scale: sm(t, s6.cid - 0.2, s6.cid + 0.1, outBack) });
      ['aqui deu Lula', 'aqui deu Flávio', 'foi apertado!'].forEach((m, i) => { const k = prog(t, s6.com + i * 0.2, s6.com + i * 0.2 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([330, 750, 380][i], [700, 820, 940][i]); ctx.scale(outBack(k), outBack(k)); ctx.fillStyle = INK; ctx.fillRect(-180 + 6, -42 + 6, 360, 84); ctx.fillStyle = '#fff'; ctx.fillRect(-180, -42, 360, 84); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-180, -42, 360, 84); txt(m, 0, 2, 34, { w: 800 }); ctx.restore(); });
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1170); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = INK; ctx.fillRect(-250 + 8, -70 + 8, 500, 140); ctx.fillStyle = press ? '#fff' : LIME; ctx.fillRect(-250, -70, 500, 140); ctx.lineWidth = 5; ctx.strokeRect(-250, -70, 500, 140); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 60, { w: 900 }); ctx.restore(); }
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
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6];
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
      txt('Fonte: TSE • votos válidos • conteúdo educativo', 1040, 1757, 22, { w: 600, color: MUTE, align: 'right' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
