/*
 * MAPA DA VIRADA — região por região (2º turno 2026), estilo "jornal de dados" em papel quadriculado, 9:16.
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
    const END = TL.duration, NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Brasil: +4,4 mi', 'Sul', 'Centro-Oeste + DF', 'Sudeste', 'Norte', 'Nordeste', 'Soma + CTA'];
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
      spaced('MAPA DA VIRADA · 2º TURNO 2026', 540, 120, 30, { w: 600, sp: 9, color: INK });
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
    const CAMS = [camFor(ALL, 0.04), camFor(REG.S.ufs, 0.15), camFor(REG.CO.ufs, 0.1), camFor(REG.SE.ufs, 0.08), camFor(REG.N.ufs, 0.05), camFor(REG.NE.ufs, 0.08), camFor(ALL, 0.04)];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i], B[i] + 0.9); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    function statePath(s) { ctx.beginPath(); for (const r of s.p) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } }
    // fills: uf -> 0..1 (cor do vencedor), focus: set de ufs com relevo, pop: uf -> 0..1 (salta)
    function map(cam, fills, focus, o = {}) {
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
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

    // ================= CENA 1 =================
    const s1 = { lul: wt('c1', 'lula'), qua: wt('c1', 'quatro'), mil: wt('c1', 'milhoes'), map: wt('c1', 'mapa'), ape: wt('c1', 'apertada'), reg: wt('c1', 'regiao') };
    cue(0, 'music', { part: 'intro' }); cue(s1.qua, 'impact', { gain: 0.7 }); cue(s1.map, 'scan', { dur: 1.2, gain: 0.6 }); cue(s1.ape, 'scratch'); cue(s1.reg, 'whoosh', { dur: 0.6 }); cue(s1.reg, 'music', { part: 'groove' });
    function scene1(t, cam) {
      const wave = prog(t, s1.map - 0.2, s1.ape + 0.3), reset = prog(t, s1.reg - 0.1, s1.reg + 0.5), fills = {};
      for (const s of GEO) fills[s.uf] = clamp((wave * 1.4 - (centroid[s.uf][0] + 72) / 40 * 0.4) * 3) * (1 - reset);
      map(cam, fills, null);
      const k = sm(t, s1.qua - 0.3, s1.qua + 0.1, outBack);
      txt('+4,4 MI', 540, 300, 170, { w: 900, scale: k }); tag(`DE VOTOS PARA ${CN.L}`, 540, 420, 34, LU, prog(t, s1.mil - 0.1, s1.mil + 0.2));
      bar(1420, 51.78, 48.22, sm(t, s1.lul - 0.2, s1.lul + 0.6));
      boxed('BEM MAIS APERTADA', 540, 520, 40, prog(t, s1.ape - 0.15, s1.ape + 0.1) * (1 - reset));
    }
    // ================= CENA 2 — SUL =================
    const s2 = { sul: wt('c2', 'sul'), tre: wt('c2', 'tres'), est: wt('c2', 'estados'), qua: wt('c2', 'quatro'), mil: wt('c2', 'milhoes') };
    cue(s2.sul, 'pop'); REG.S.ufs.forEach((u, i) => cue(s2.tre + i * 0.18, 'plop')); cue(s2.qua, 'coin');
    function scene2(t, cam) {
      const f = fillAll(REG.S.ufs, sm(t, s2.sul, s2.tre + 0.4), BASE); map(cam, f, new Set(REG.S.ufs));
      ['PR', 'SC', 'RS'].forEach((u, i) => ufLabel(cam, u, prog(t, s2.tre + i * 0.18, s2.tre + i * 0.18 + 0.25)));
      regionPanel(t, 'REGIÃO SUL', s2.sul, '+4,6 MI', s2.qua, 'F');
      bar(1420, REG.S.L, REG.S.F, sm(t, B[1] + 0.3, B[1] + 0.9));
    }
    // ================= CENA 3 — CENTRO-OESTE =================
    const s3 = { cen: wt('c3', 'centro'), dis: wt('c3', 'distrito'), tam: wt('c3', 'tambem'), fla: wt('c3', 'flavio'), um: wt('c3', 'um'), mil: wt('c3', 'milhao') };
    cue(s3.cen, 'pop'); cue(s3.dis, 'plop'); cue(s3.um, 'coin');
    function scene3(t, cam) {
      const f = fillAll(REG.CO.ufs, sm(t, s3.tam - 0.2, s3.fla + 0.3), BASE); map(cam, f, new Set(REG.CO.ufs));
      ['MT', 'GO', 'MS'].forEach((u, i) => ufLabel(cam, u, prog(t, s3.fla + i * 0.15, s3.fla + i * 0.15 + 0.25), { s: 0.9 }));
      ufLabel(cam, 'DF', prog(t, s3.dis - 0.1, s3.dis + 0.2), { s: 0.8, dx: 150, dy: -60 });
      regionPanel(t, 'CENTRO-OESTE + DF', s3.cen, '+1,9 MI', s3.um, 'F');
      bar(1420, REG.CO.L, REG.CO.F, sm(t, B[2] + 0.3, B[2] + 0.9));
    }
    // ================= CENA 4 — SUDESTE =================
    const s4 = { sud: wt('c4', 'sudeste'), mai: wt('c4', 'maior'), cin: wt('c4', 'cinquenta'), sao: wt('c4', 'sao'), rio: wt('c4', 'rio'), esp: wt('c4', 'espirito'), min: wt('c4', 'minas'), lul: wt('c4', 'lula'), cen: wt('c4', 'cento'), nov: wt('c4', 'nove') };
    cue(s4.cin, 'riser', { dur: 0.7 }); cue(s4.sao, 'plop'); cue(s4.rio, 'plop'); cue(s4.esp, 'plop'); cue(s4.min, 'scratch'); cue(s4.lul, 'ding'); cue(s4.cen, 'stamp');
    function scene4(t, cam) {
      const f = Object.assign({}, BASE); f.SP = sm(t, s4.sao - 0.1, s4.sao + 0.3); f.RJ = sm(t, s4.rio - 0.1, s4.rio + 0.3); f.ES = sm(t, s4.esp - 0.1, s4.esp + 0.3); f.MG = sm(t, s4.lul - 0.2, s4.lul + 0.3);
      map(cam, f, new Set(REG.SE.ufs), { pop: { MG: prog(t, s4.lul - 0.1, s4.lul + 0.5), SP: prog(t, s4.sao, s4.sao + 0.4), RJ: prog(t, s4.rio, s4.rio + 0.4), ES: prog(t, s4.esp, s4.esp + 0.4) } });
      ufLabel(cam, 'SP', prog(t, s4.sao, s4.sao + 0.25)); ufLabel(cam, 'RJ', prog(t, s4.rio, s4.rio + 0.25), { s: 0.85 }); ufLabel(cam, 'ES', prog(t, s4.esp, s4.esp + 0.25), { s: 0.85 });
      spaced('REGIÃO SUDESTE', 540, 240, 52, { w: 700, sp: 14, a: sm(t, s4.sud - 0.2, s4.sud + 0.2) });
      const before = t < s4.min - 0.2;
      if (before) { const k = sm(t, s4.cin - 0.3, s4.cin + 0.1, outBack); txt(milhar(50882232 * outC(prog(t, s4.cin - 0.2, s4.cin + 1.0))), 540, 395, 130, { w: 900, scale: k }); txt('VOTOS VÁLIDOS NO 2º TURNO', 540, 500, 32, { w: 800, color: MUTE, a: prog(t, s4.cin, s4.cin + 0.3) }); }
      else { const k = sm(t, s4.cen - 0.3, s4.cen + 0.1, outBack); txt('MINAS GERAIS', 540, 330, 56, { w: 900, color: LU, a: prog(t, s4.min - 0.2, s4.min + 0.1) }); txt('+109 MIL', 540, 440, 130, { w: 900, scale: k }); tag(`A MAIS PARA ${CN.L}`, 540, 535, 30, LU, prog(t, s4.nov, s4.nov + 0.25)); }
      if (t > s4.lul) { const [x, y] = toScreen(cam, ...centroid.MG); boxed('50,4% × 49,6%', x, y, 34, prog(t, s4.lul + 0.1, s4.lul + 0.35)); }
      bar(1420, REG.SE.L, REG.SE.F, sm(t, B[3] + 0.3, B[3] + 0.9));
    }
    // ================= CENA 5 — NORTE =================
    const s5 = { nor: wt('c5', 'norte'), pra: wt('c5', 'praticamente'), emp: wt('c5', 'empate'), reg: wt('c5', 'regiao'), dif: wt('c5', 'diferenca'), mil: wt('c5', 'mil'), vot: wt('c5', 'votos') };
    cue(s5.nor, 'pop'); cue(s5.emp, 'stamp'); cue(s5.emp + 0.03, 'impact', { gain: 0.6 }); cue(s5.mil, 'coin');
    function scene5(t, cam) {
      const f = fillAll(REG.N.ufs, sm(t, s5.nor, s5.emp), BASE); map(cam, f, new Set(REG.N.ufs));
      spaced('REGIÃO NORTE', 540, 240, 52, { w: 700, sp: 14, a: sm(t, s5.nor - 0.2, s5.nor + 0.2) });
      stamp('EMPATE TÉCNICO', 540, 400, prog(t, s5.emp - 0.05, s5.emp + 0.12) * (1 - prog(t, s5.mil - 0.4, s5.mil - 0.2)), { size: 80 });
      if (t > s5.mil - 0.3) { const k = sm(t, s5.mil - 0.3, s5.mil + 0.1, outBack); txt('1.079', 540, 395, 160, { w: 900, scale: k }); txt('VOTOS DE DIFERENÇA NA REGIÃO', 540, 505, 32, { w: 800, color: MUTE, a: prog(t, s5.vot, s5.vot + 0.3) }); }
      ['PA', 'AM', 'AP'].forEach((u, i) => ufLabel(cam, u, prog(t, s5.pra + i * 0.15, s5.pra + i * 0.15 + 0.25), { s: 0.85 }));
      ['RO', 'AC', 'RR', 'TO'].forEach((u, i) => ufLabel(cam, u, prog(t, s5.reg + i * 0.12, s5.reg + i * 0.12 + 0.25), { s: 0.8 }));
      bar(1420, REG.N.L, REG.N.F, sm(t, B[4] + 0.3, B[4] + 0.9));
    }
    // ================= CENA 6 — NORDESTE =================
    const s6 = { nor: wt('c6', 'nordeste'), nov: wt('c6', 'nove'), est: wt('c6', 'estados'), tre: wt('c6', 'treze'), mil: wt('c6', 'milhoes') };
    cue(s6.nor, 'whoosh', { dur: 0.5 }); for (let i = 0; i < 9; i++) cue(s6.nov + i * 0.09, 'plop'); cue(s6.tre, 'impact'); cue(s6.tre, 'music', { part: 'drop2' });
    const NEo = ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'];
    function scene6(t, cam) {
      const f = Object.assign({}, BASE); NEo.forEach((u, i) => (f[u] = sm(t, s6.nov + i * 0.09, s6.nov + i * 0.09 + 0.3)));
      const pop = {}; NEo.forEach((u, i) => (pop[u] = prog(t, s6.nov + i * 0.09, s6.nov + i * 0.09 + 0.4)));
      map(cam, f, new Set(REG.NE.ufs), { pop });
      ['BA', 'PI', 'CE', 'MA', 'PE'].forEach((u, i) => ufLabel(cam, u, prog(t, s6.est + i * 0.1, s6.est + i * 0.1 + 0.25), { s: 0.85 }));
      regionPanel(t, 'REGIÃO NORDESTE', s6.nor, '+13,7 MI', s6.tre, 'L');
      bar(1420, REG.NE.L, REG.NE.F, sm(t, B[5] + 0.3, B[5] + 0.9));
    }
    // ================= CENA 7 — soma + CTA =================
    const s7 = { som: wt('c7', 'somando'), for: wt('c7', 'fora'), nov: wt('c7', 'nove'), fre: wt('c7', 'frente'), com: wt('c7', 'compensou'), sob: wt('c7', 'sobrou'), qua: wt('c7', 'qual'), sur: wt('c7', 'surpreendeu'), cmt: wt('c7', 'comenta'), seg: wt('c7', 'segue') };
    cue(B[6], 'music', { part: 'outro' }); cue(s7.nov, 'coin'); cue(s7.com, 'stretch', { dur: 0.6 }); cue(s7.sob, 'tada'); cue(s7.cmt, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    function scene7(t, cam) {
      const cta = sm(t, s7.qua - 0.3, s7.qua + 0.1);
      const f = {}; for (const s of GEO) f[s.uf] = 1; ga(lerp(1, 0.35, cta)); map(cam, f, null); ga(1);
      spaced('SOMANDO TUDO', 540, 240, 52, { w: 700, sp: 14, a: sm(t, s7.som - 0.2, s7.som + 0.2) * (1 - cta) });
      // balança
      if (cta < 1) { ga(1 - cta);
        const tilt = lerp(0, -0.12, sm(t, s7.nov - 0.2, s7.nov + 0.3)) + lerp(0, 0.24, sm(t, s7.com - 0.2, s7.com + 0.5, outBack));
        const cx = 540, cy = 470; ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-40, 120); ctx.lineTo(40, 120); ctx.lineTo(0, 0); ctx.fill(); ctx.rotate(tilt); ctx.fillRect(-380, -8, 760, 16); ctx.restore();
        for (const sd of [-1, 1]) { const px = cx + sd * 380 * Math.cos(tilt), py = cy + sd * 380 * Math.sin(tilt) + 90; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, py - 90); ctx.lineTo(px - 100, py - 10); ctx.moveTo(px, py - 90); ctx.lineTo(px + 100, py - 10); ctx.stroke();
          const left = sd < 0, k = left ? prog(t, s7.for - 0.1, s7.for + 0.3) : prog(t, s7.com - 0.4, s7.com); if (k <= 0) continue;
          ctx.save(); ctx.translate(px, py + 20); ctx.scale(outBack(k), outBack(k)); ctx.fillStyle = INK; ctx.fillRect(-150 + 6, -55 + 6, 300, 110); ctx.fillStyle = left ? FL : LU; ctx.fillRect(-150, -55, 300, 110); ctx.lineWidth = 4; ctx.strokeRect(-150, -55, 300, 110);
          txt(left ? '+9,3 MI' : '+13,7 MI', 0, -12, 54, { w: 900, color: '#fff' }); txt(left ? 'FORA DO NORDESTE' : 'NORDESTE', 0, 34, 24, { w: 800, color: '#fff' }); ctx.restore(); }
        boxed('= +4,4 MI PARA LULA', 540, 760, 50, prog(t, s7.sob - 0.15, s7.sob + 0.1), { fill: LIME });
        ga(1); }
      if (cta > 0) { ga(cta);
        txt('QUAL DADO TE', 540, 330, 96, { w: 900, scale: sm(t, s7.qua - 0.1, s7.qua + 0.2, outBack) }); txt('SURPREENDEU?', 540, 440, 96, { w: 900, color: LU, scale: sm(t, s7.sur - 0.2, s7.sur + 0.1, outBack) });
        ['o empate no Norte', 'Minas por 109 mil', 'o Nordeste'].forEach((m, i) => { const k = prog(t, s7.cmt + i * 0.22, s7.cmt + i * 0.22 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([330, 740, 380][i], [720, 840, 960][i]); ctx.scale(outBack(k), outBack(k)); ctx.fillStyle = INK; ctx.fillRect(-195 + 6, -42 + 6, 390, 84); ctx.fillStyle = '#fff'; ctx.fillRect(-195, -42, 390, 84); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-195, -42, 390, 84); txt(m, 0, 2, 34, { w: 800 }); ctx.restore(); });
        const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
        if (bk > 0) { ctx.save(); ctx.translate(540, 1170); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = INK; ctx.fillRect(-250 + 8, -70 + 8, 500, 140); ctx.fillStyle = press ? '#fff' : LIME; ctx.fillRect(-250, -70, 500, 140); ctx.lineWidth = 5; ctx.strokeRect(-250, -70, 500, 140); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 60, { w: 900 }); ctx.restore(); }
        ga(1); }
      bar(1420, 51.78, 48.22, 1 - cta);
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
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      // estados já mostrados ficam coloridos de leve nas cenas seguintes
      for (const k in BASE) delete BASE[k];
      const done = [[], ['S'], ['S', 'CO'], ['S', 'CO', 'SE'], ['S', 'CO', 'SE', 'N'], ['S', 'CO', 'SE', 'N', 'NE'], []][i];
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
