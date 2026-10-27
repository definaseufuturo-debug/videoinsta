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
    const NAMES = ['Abertura', 'Norte + Nordeste', 'Sul + Sudeste', 'Centro-Oeste + DF', 'Balança', 'Todo voto vale igual + CTA'];
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
      spaced('BLOCOS REGIONAIS · 2º TURNO 2026', 540, 120, 30, { w: 600, sp: 9, color: INK });
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
    const CAMS = [camFor(ALL, 0.04), camFor(['AM','PA','RR','AP','AC','RO','TO','MA','PI','CE','RN','PB','PE','AL','SE','BA'], 0.04), camFor(['SP','RJ','MG','ES','PR','SC','RS'], 0.05), camFor(['MT','GO','MS','DF'], 0.08), camFor(ALL, 0.04), camFor(ALL, 0.04)];
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

    // ---------------- blocos regionais ----------------
    const G = (rs) => { const ufs = [].concat(...rs.map(r => REG[r].ufs)); return { ufs, L: rs.reduce((a, r) => a + REG[r].L, 0), F: rs.reduce((a, r) => a + REG[r].F, 0) }; };
    const NNE = G(['N', 'NE']), SSE = G(['S', 'SE']), CO = G(['CO']);
    const fillGroup = (g, k, base) => { const f = Object.assign({}, base || {}); g.ufs.forEach(u => (f[u] = Math.max(f[u] || 0, k))); return f; };
    function bigNum(t, s, t0, y, color, sub, subT) { const k = sm(t, t0 - 0.3, t0 + 0.1, outBack); if (k <= 0) return; txt(s, 540, y, 140, { w: 900, color: color || INK, scale: k }); if (sub) txt(sub, 540, y + 95, 32, { w: 800, color: MUTE, a: prog(t, subT ?? t0, (subT ?? t0) + 0.3) }); }

    // ================= CENA 1 =================
    const s1 = { som: wt('c1', 'somando'), reg: wt('c1', 'regiao'), exa: wt('c1', 'exatamente'), dec: wt('c1', 'decidida') };
    cue(0, 'music', { part: 'intro' }); cue(s1.reg, 'scan', { dur: 1.0, gain: 0.6 }); cue(s1.dec, 'impact', { gain: 0.6 }); cue(s1.dec, 'music', { part: 'groove' });
    function scene1(t, cam) {
      const w = prog(t, s1.reg - 0.2, s1.dec), f = {};
      for (const s of GEO) { const grp = NNE.ufs.includes(s.uf) ? 0 : CO.ufs.includes(s.uf) ? 1 : 2; f[s.uf] = clamp(w * 3 - grp); }
      map(cam, f, null);
      spaced('VOTOS POR BLOCO', 540, 240, 52, { w: 700, sp: 14, a: sm(t, s1.som - 0.3, s1.som) });
      txt('ONDE A ELEIÇÃO', 540, 360, 80, { w: 900, scale: sm(t, s1.exa - 0.3, s1.exa, outBack) }); txt('FOI DECIDIDA?', 540, 460, 80, { w: 900, color: LU, scale: sm(t, s1.dec - 0.3, s1.dec, outBack) });
      bar(1420, 51.78, 48.22, sm(t, 0.2, 0.8));
    }
    // ================= CENA 2 — Norte + Nordeste =================
    const s2 = { nor: wt('c2', 'norte'), nord: wt('c2', 'nordeste'), qua: wt('c2', 'quarenta'), lul: wt('c2', 'lula'), ses: wt('c2', 'sessenta'), tre: wt('c2', 'treze') };
    cue(s2.nor, 'pop'); cue(s2.nord, 'pop'); cue(s2.qua, 'riser', { dur: 0.6 }); cue(s2.tre, 'coin');
    function scene2(t, cam) {
      const f = Object.assign({}, fillGroup(G(['N']), sm(t, s2.nor - 0.1, s2.nor + 0.3)), fillGroup(G(['NE']), sm(t, s2.nord - 0.1, s2.nord + 0.3)));
      map(cam, f, new Set(NNE.ufs));
      spaced('NORTE + NORDESTE', 540, 240, 50, { w: 700, sp: 13, a: sm(t, s2.nor - 0.3, s2.nor) });
      if (t < s2.tre - 0.3) bigNum(t, milhar((NNE.L + NNE.F) * outC(prog(t, s2.qua - 0.2, s2.qua + 0.9))), s2.qua, 380, INK, 'VOTOS VÁLIDOS', s2.qua + 0.3);
      else { bigNum(t, '+13,7 MI', s2.tre, 380, LU); tag(`A MAIS PARA ${CN.L}`, 540, 490, 34, LU, prog(t, s2.tre, s2.tre + 0.25)); }
      bar(1420, NNE.L, NNE.F, sm(t, s2.lul - 0.3, s2.ses + 0.3));
    }
    // ================= CENA 3 — Sul + Sudeste =================
    const s3 = { sul: wt('c3', 'sul'), sud: wt('c3', 'sudeste'), ses: wt('c3', 'sessenta'), mai: wt('c3', 'maior'), fla: wt('c3', 'flavio'), cin: wt('c3', 'cinquenta'), set: wt('c3', 'sete') };
    cue(s3.sul, 'pop'); cue(s3.sud, 'pop'); cue(s3.ses, 'riser', { dur: 0.6 }); cue(s3.mai, 'stamp'); cue(s3.set, 'coin');
    function scene3(t, cam) {
      const f = Object.assign({}, fillGroup(G(['S']), sm(t, s3.sul - 0.1, s3.sul + 0.3)), fillGroup(G(['SE']), sm(t, s3.sud - 0.1, s3.sud + 0.3)));
      map(cam, f, new Set(SSE.ufs));
      spaced('SUL + SUDESTE', 540, 240, 50, { w: 700, sp: 13, a: sm(t, s3.sul - 0.3, s3.sul) });
      if (t < s3.set - 0.3) { bigNum(t, milhar((SSE.L + SSE.F) * outC(prog(t, s3.ses - 0.2, s3.ses + 0.9))), s3.ses, 380, INK, 'VOTOS VÁLIDOS', s3.ses + 0.3); stamp('MAIOR BLOCO', 540, 540, prog(t, s3.mai - 0.05, s3.mai + 0.12) * (1 - prog(t, s3.fla - 0.3, s3.fla)), { size: 50 }); }
      else { bigNum(t, '+7,4 MI', s3.set, 380, FL); tag(`A MAIS PARA ${CN.F}`, 540, 490, 34, FL, prog(t, s3.set, s3.set + 0.25)); }
      bar(1420, SSE.L, SSE.F, sm(t, s3.fla - 0.3, s3.cin + 0.3));
    }
    // ================= CENA 4 — Centro-Oeste + DF =================
    const s4 = { cen: wt('c4', 'centro'), dis: wt('c4', 'distrito'), um: wt('c4', 'um'), fla: wt('c4', 'flavio') };
    cue(s4.cen, 'pop'); cue(s4.um, 'coin');
    function scene4(t, cam) {
      map(cam, fillGroup(CO, sm(t, s4.cen - 0.1, s4.dis + 0.3)), new Set(CO.ufs));
      spaced('CENTRO-OESTE + DF', 540, 240, 50, { w: 700, sp: 13, a: sm(t, s4.cen - 0.3, s4.cen) });
      bigNum(t, '+1,9 MI', s4.um, 380, FL); tag(`A MAIS PARA ${CN.F}`, 540, 490, 34, FL, prog(t, s4.fla - 0.1, s4.fla + 0.2));
      bar(1420, CO.L, CO.F, sm(t, B[3] + 0.3, B[3] + 0.9));
    }
    // ================= CENA 5 — a balança =================
    const s5 = { con: wt('c5', 'conta'), van: wt('c5', 'vantagem'), nor: wt('c5', 'norte'), res: wt('c5', 'resto'), som: wt('c5', 'somado'), resu: wt('c5', 'resultado'), qua: wt('c5', 'quatro') };
    cue(s5.van, 'whoosh', { dur: 0.4 }); cue(s5.res, 'whoosh', { dur: 0.4 }); cue(s5.som, 'stretch', { dur: 0.6 }); cue(s5.qua, 'tada'); cue(s5.qua, 'music', { part: 'drop2' });
    function scene5(t, cam) {
      const f = {}; for (const s of GEO) f[s.uf] = 1; ga(0.5); map(cam, f, null); ga(1);
      spaced('NA CONTA FINAL', 540, 240, 50, { w: 700, sp: 13, a: sm(t, s5.con - 0.3, s5.con) });
      const tilt = lerp(0, -0.2, sm(t, s5.som - 0.2, s5.som + 0.6, outBack)), cx = 540, cy = 470;
      ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-40, 120); ctx.lineTo(40, 120); ctx.lineTo(0, 0); ctx.fill(); ctx.rotate(tilt); ctx.fillRect(-380, -8, 760, 16); ctx.restore();
      for (const sd of [-1, 1]) { const px = cx + sd * 380 * Math.cos(tilt), py = cy + sd * 380 * Math.sin(tilt) + 90; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, py - 90); ctx.lineTo(px - 110, py - 10); ctx.moveTo(px, py - 90); ctx.lineTo(px + 110, py - 10); ctx.stroke();
        const left = sd < 0, k = left ? prog(t, s5.nor - 0.2, s5.nor + 0.2) : prog(t, s5.res - 0.2, s5.res + 0.2); if (k <= 0) continue;
        ctx.save(); ctx.translate(px, py + 25); ctx.scale(outBack(k), outBack(k)); ctx.fillStyle = INK; ctx.fillRect(-160 + 6, -60 + 6, 320, 120); ctx.fillStyle = left ? LU : FL; ctx.fillRect(-160, -60, 320, 120); ctx.lineWidth = 4; ctx.strokeRect(-160, -60, 320, 120);
        txt(left ? '+13,7 MI' : '+9,3 MI', 0, -14, 56, { w: 900, color: '#fff' }); txt(left ? 'NORTE + NORDESTE' : 'SUL + SUDESTE + CO', 0, 34, 22, { w: 800, color: '#fff' }); ctx.restore(); }
      boxed('= +4,4 MI PARA LULA', 540, 880, 50, prog(t, s5.qua - 0.15, s5.qua + 0.1), { fill: LIME });
      bar(1420, 51.78, 48.22, sm(t, s5.resu - 0.2, s5.resu + 0.5));
    }
    // ================= CENA 6 — todo voto vale igual + CTA =================
    const s6 = { tod: wt('c6', 'todo'), igu: wt('c6', 'igual'), qua: wt('c6', 'qualquer'), qual: wt('c6', 'qual'), cmt: wt('c6', 'comenta'), seg: wt('c6', 'segue') };
    cue(B[5], 'music', { part: 'outro' }); cue(s6.igu, 'ding'); cue(s6.cmt, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t, cam) {
      const f = {}; for (const s of GEO) f[s.uf] = 1 - 0.75 * sm(t, s6.tod - 0.2, s6.igu); map(cam, f, null);
      txt('TODO VOTO', 540, 330, 104, { w: 900, scale: sm(t, s6.tod - 0.2, s6.tod + 0.15, outBack) }); txt('VALE IGUAL', 540, 450, 104, { w: 900, color: LU, scale: sm(t, s6.igu - 0.2, s6.igu + 0.1, outBack) });
      boxed('DE QUALQUER REGIÃO', 540, 570, 44, prog(t, s6.qua - 0.15, s6.qua + 0.1), { fill: LIME });
      ['o Norte + Nordeste', '69 milhões no Sul/Sudeste', 'o Centro-Oeste'].forEach((m, i) => { const k = prog(t, s6.cmt + i * 0.2, s6.cmt + i * 0.2 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([350, 730, 380][i], [760, 870, 980][i]); ctx.scale(outBack(k), outBack(k)); const w = tw(m, 32, 800) + 60; ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 6, -40 + 6, w, 80); ctx.fillStyle = '#fff'; ctx.fillRect(-w / 2, -40, w, 80); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-w / 2, -40, w, 80); txt(m, 0, 2, 32, { w: 800 }); ctx.restore(); });
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1200); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = INK; ctx.fillRect(-250 + 8, -70 + 8, 500, 140); ctx.fillStyle = press ? '#fff' : LIME; ctx.fillRect(-250, -70, 500, 140); ctx.lineWidth = 5; ctx.strokeRect(-250, -70, 500, 140); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 60, { w: 900 }); ctx.restore(); }
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
