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
    const NAMES = ['Mapa', 'Pódio Lula', 'Pódio Flávio', 'Minas', 'TO e AP', 'CTA sigla'];
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
      spaced('OS ESTADOS · 2º TURNO 2026', 540, 120, 30, { w: 600, sp: 9, color: INK });
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
    const CAMS = [camFor(ALL, 0.04), camFor(ALL, 0.02), camFor(ALL, 0.02), camFor(['MG'], 0.1), camFor(ALL, 0.02), camFor(ALL, 0.04)];
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

    // ---------------- intensidade (mapa coroplético) ----------------
    const share = uf => { const [L, F] = UF[uf]; return L > F ? L / (L + F) * 100 : F / (L + F) * 100; };
    const inten = uf => 0.22 + 0.78 * clamp((share(uf) - 50) / 26);
    const NAMEUF = { PI: 'PIAUÍ', BA: 'BAHIA', MA: 'MARANHÃO', RR: 'RORAIMA', RO: 'RONDÔNIA', SC: 'SANTA CATARINA', MG: 'MINAS GERAIS', TO: 'TOCANTINS', AP: 'AMAPÁ' };
    function choro(k, only) { const f = {}; for (const s of GEO) f[s.uf] = (only && !only.includes(s.uf) ? 0.12 : inten(s.uf)) * k; return f; }
    function rank(t, list, col, t0s, y0 = 300) { // pódio em barras
      list.forEach((uf, i) => { const k = sm(t, t0s[i] - 0.25, t0s[i] + 0.15, outBack); if (k <= 0) return; const y = y0 + i * 92, p = share(uf), w = 640 * (p - 40) / 40 * outC(k);
        ga(clamp(k * 2)); txt(`${i + 1}º`, 95, y, 44, { w: 900, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(150 + 6, y - 32 + 6, w, 64); ctx.fillStyle = col; ctx.fillRect(150, y - 32, w, 64); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(150, y - 32, w, 64);
        txt(NAMEUF[uf] || uf, 168, y + 2, 34, { w: 900, color: '#fff', align: 'left' }); txt(pct(p), 150 + w + 16, y + 2, 40, { w: 900, color: INK, align: 'left' }); ga(1); });
    }
    function legend(a) { ga(a); const x = 150, y = 1405, w = 780; for (let i = 0; i < 40; i++) { const u = i / 39; ctx.fillStyle = u < 0.5 ? mixC(LU, '#ffffff', u * 2 * 0.85) : mixC('#ffffff', FL, 0.15 + (u - 0.5) * 2 * 0.85); ctx.fillRect(x + u * w - w / 80, y, w / 39 + 1, 30); }
      ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w, 30); txt(`+ ${CN.L}`, x, y + 60, 28, { w: 900, color: LU, align: 'left' }); txt('EMPATE', x + w / 2, y + 60, 24, { w: 800, color: MUTE }); txt(`+ ${CN.F}`, x + w, y + 60, 28, { w: 900, color: FL, align: 'right' }); ga(1); }

    // ================= CENA 1 — o mapa inteiro =================
    const s1 = { qua: wt('c1', 'qual'), lul: wt('c1', 'lula'), fla: wt('c1', 'flavio'), map: wt('c1', 'mapa'), tud: wt('c1', 'tudo') };
    cue(0, 'music', { part: 'intro' }); cue(s1.map, 'scan', { dur: 1.2, gain: 0.6 }); cue(s1.tud, 'impact', { gain: 0.6 }); cue(s1.tud, 'music', { part: 'groove' });
    function scene1(t, cam) {
      const wave = prog(t, s1.qua, s1.tud + 0.2), f = {}; for (const s of GEO) f[s.uf] = inten(s.uf) * clamp((wave * 1.5 - (centroid[s.uf][1] + 5) / 40 * 0.5) * 3);
      map(cam, f, null);
      txt('O ESTADO MAIS', 540, 300, 76, { w: 900, scale: sm(t, s1.qua - 0.2, s1.qua + 0.15, outBack) });
      tag(CN.L, 380, 420, 52, LU, prog(t, s1.lul - 0.15, s1.lul + 0.15)); txt('×', 540, 420, 60, { w: 900, color: MUTE, a: prog(t, s1.fla - 0.2, s1.fla) }); tag(CN.F, 720, 420, 52, FL, prog(t, s1.fla - 0.15, s1.fla + 0.15));
      legend(prog(t, s1.map, s1.map + 0.4));
    }
    // ================= CENA 2 — pódio Lula =================
    const s2 = { lad: wt('c2', 'lado'), cam: wt('c2', 'campeao'), pia: wt('c2', 'piaui'), set: wt('c2', 'setenta'), bah: wt('c2', 'bahia'), mar: wt('c2', 'maranhao') };
    cue(s2.pia, 'tada'); cue(s2.bah, 'pop'); cue(s2.mar, 'pop');
    function scene2(t, cam) {
      const top = ['PI', 'BA', 'MA'], pop = { PI: prog(t, s2.pia, s2.pia + 0.5), BA: prog(t, s2.bah, s2.bah + 0.5), MA: prog(t, s2.mar, s2.mar + 0.5) };
      map(cam, choro(1, top), new Set(top), { pop }); 
      spaced(`MAIS ${CN.L}`, 540, 210, 46, { w: 700, sp: 12, color: LU, a: sm(t, s2.lad - 0.3, s2.lad) });
      rank(t, top, LU, [s2.pia, s2.bah, s2.mar]);
      ufLabel(cam, 'PI', prog(t, s2.set - 0.1, s2.set + 0.2), { s: 1.1 });
    }
    // ================= CENA 3 — pódio Flávio =================
    const s3 = { lad: wt('c3', 'lado'), rec: wt('c3', 'recorde'), ror: wt('c3', 'roraima'), set: wt('c3', 'setenta'), ron: wt('c3', 'rondonia'), san: wt('c3', 'santa') };
    cue(s3.ror, 'tada'); cue(s3.ron, 'pop'); cue(s3.san, 'pop');
    function scene3(t, cam) {
      const top = ['RR', 'RO', 'SC'], pop = { RR: prog(t, s3.ror, s3.ror + 0.5), RO: prog(t, s3.ron, s3.ron + 0.5), SC: prog(t, s3.san, s3.san + 0.5) };
      map(cam, choro(1, top), new Set(top), { pop });
      spaced(`MAIS ${CN.F}`, 540, 210, 46, { w: 700, sp: 12, color: FL, a: sm(t, s3.lad - 0.3, s3.lad) });
      rank(t, top, FL, [s3.ror, s3.ron, s3.san]);
      ufLabel(cam, 'RR', prog(t, s3.set - 0.1, s3.set + 0.2), { s: 1.1 });
    }
    // ================= CENA 4 — Minas, o mais dividido =================
    const s4 = { mai: wt('c4', 'mais'), div: wt('c4', 'dividido'), min: wt('c4', 'minas'), cin: wt('c4', 'cinquenta'), qua: wt('c4', 'quarenta') };
    cue(s4.div, 'scratch'); cue(s4.min, 'ding'); cue(s4.cin, 'stretch', { dur: 0.6 }); cue(s4.qua, 'lock');
    function scene4(t, cam) {
      map(cam, choro(1, ['MG']), new Set(['MG']), { pop: { MG: prog(t, s4.min, s4.min + 0.6) } });
      spaced('O MAIS DIVIDIDO', 540, 210, 46, { w: 700, sp: 12, a: sm(t, s4.div - 0.3, s4.div) });
      txt('MINAS GERAIS', 540, 320, 70, { w: 900, scale: sm(t, s4.min - 0.25, s4.min + 0.1, outBack) });
      // balança quase reta
      const k = sm(t, s4.cin - 0.4, s4.cin), tilt = -0.03 * Math.sin(clamp((t - s4.cin) / 1.2) * Math.PI * 3) * (1 - prog(t, s4.qua, s4.qua + 1));
      if (k > 0) { ga(k); ctx.save(); ctx.translate(540, 420); ctx.rotate(tilt); ctx.fillStyle = INK; ctx.fillRect(-300, -6, 600, 12); ctx.restore();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(510, 500); ctx.lineTo(570, 500); ctx.lineTo(540, 420); ctx.fill();
        tag(`${CN.L} 50,4%`, 290, 470, 34, LU, prog(t, s4.cin - 0.1, s4.cin + 0.2)); tag(`${CN.F} 49,6%`, 790, 470, 34, FL, prog(t, s4.qua - 0.1, s4.qua + 0.2)); ga(1); }
      if (t > s4.qua + 0.3) { const [x, y] = toScreen(cam, ...centroid.MG); boxed('109 MIL VOTOS', x, y, 40, prog(t, s4.qua + 0.3, s4.qua + 0.6), { fill: LIME }); }
    }
    // ================= CENA 5 — Tocantins e Amapá =================
    const s5 = { toc: wt('c5', 'tocantins'), ama: wt('c5', 'amapa'), mei: wt('c5', 'meio') };
    cue(s5.toc, 'pop'); cue(s5.ama, 'pop'); cue(s5.mei, 'ding');
    function scene5(t, cam) {
      map(cam, choro(1, ['TO', 'AP', 'MG']), new Set(['TO', 'AP']), { pop: { TO: prog(t, s5.toc, s5.toc + 0.5), AP: prog(t, s5.ama, s5.ama + 0.5) } });
      spaced('QUASE MEIO A MEIO', 540, 210, 46, { w: 700, sp: 12, a: sm(t, B[4] + 0.1, B[4] + 0.5) });
      ufLabel(cam, 'TO', prog(t, s5.toc - 0.1, s5.toc + 0.2), { s: 1.1 }); ufLabel(cam, 'AP', prog(t, s5.ama - 0.1, s5.ama + 0.2), { s: 1.1 });
      tag(`TOCANTINS: ${CN.F} 51,4%`, 540, 330, 36, FL, prog(t, s5.toc - 0.1, s5.toc + 0.2)); tag(`AMAPÁ: ${CN.L} 52,9%`, 540, 430, 36, LU, prog(t, s5.ama - 0.1, s5.ama + 0.2));
    }
    // ================= CENA 6 — CTA: comenta a sigla =================
    const s6 = { seu: wt('c6', 'seu'), est: wt('c6', 'estado'), com: wt('c6', 'comenta'), sig: wt('c6', 'sigla'), seg: wt('c6', 'segue') };
    cue(B[5], 'music', { part: 'outro' }); cue(s6.com, 'notif'); for (let i = 0; i < 9; i++) cue(s6.sig + i * 0.1, 'pop', { gain: 0.3 }); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t, cam) {
      ga(0.4); map(cam, choro(1), null); ga(1);
      txt('E O SEU', 540, 300, 104, { w: 900, scale: sm(t, s6.seu - 0.2, s6.seu + 0.15, outBack) }); txt('ESTADO?', 540, 420, 104, { w: 900, color: LU, scale: sm(t, s6.est - 0.2, s6.est + 0.1, outBack) });
      boxed('COMENTA A SIGLA', 540, 560, 50, prog(t, s6.com - 0.15, s6.com + 0.1), { fill: LIME });
      const ufs = ['SP', 'RJ', 'MG', 'BA', 'PE', 'CE', 'RS', 'PR', 'GO']; ufs.forEach((u, i) => { const k = prog(t, s6.sig + i * 0.1, s6.sig + i * 0.1 + 0.3); if (k <= 0) return; const x = 240 + (i % 3) * 300, y = 740 + Math.floor(i / 3) * 130; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ctx.fillStyle = INK; ctx.fillRect(-90 + 6, -45 + 6, 180, 90); ctx.fillStyle = '#fff'; ctx.fillRect(-90, -45, 180, 90); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-90, -45, 180, 90); txt(u, 0, 3, 54, { w: 900, color: UF[u][0] > UF[u][1] ? LU : FL }); ctx.restore(); });
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1230); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = INK; ctx.fillRect(-250 + 8, -70 + 8, 500, 140); ctx.fillStyle = press ? '#fff' : LIME; ctx.fillRect(-250, -70, 500, 140); ctx.lineWidth = 5; ctx.strokeRect(-250, -70, 500, 140); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 60, { w: 900 }); ctx.restore(); }
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
