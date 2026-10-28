/*
 * GASOLINA POR ESTADO — mapa coroplético do preço médio da gasolina comum (ANP, semana de 18 a 24/10/2026), 9:16.
 * Estilo "jornal de dados" em papel quadriculado. Mapa real dos estados (assets/br.json). Sem marcas de posto.
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
  const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',');

  // ---------------- dados: preço médio da gasolina comum (R$/L), ANP, 18 a 24/10/2026 ----------------
  const P = { AC: 7.43, AL: 6.64, AP: 6.35, AM: 7.03, BA: 6.70, CE: 6.94, DF: 6.39, ES: 6.39, GO: 6.42, MA: 6.52, MT: 6.75, MS: 6.40, MG: 6.32, PA: 6.58,
    PB: 6.31, PR: 6.57, PE: 6.88, PI: 6.71, RJ: 6.59, RN: 6.76, RS: 6.16, RO: 7.43, RR: 7.56, SC: 6.29, SP: 6.35, SE: 6.93, TO: 6.94 };
  const BR = 6.49, PMIN = 6.16, PMAX = 7.56;

  function create(TL, env) {
    const GEO = env.geo || require('../assets/br.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Gancho R$ 70', 'Média Brasil', 'Mais caras', 'Mais baratas', 'SP e MG', 'Norte × Sul', 'CTA sigla'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    const PAPER = '#f2f1ec', GRIDC = 'rgba(0,0,0,0.06)', INK = '#111111', GREY = '#d8d6cf', MUTE = '#6b6860';
    const CHEAP = '#12a89c', MID = '#f5e6a8', EXP = '#e8412c', LIME = '#c8f53a', FUEL = '#ffb000';
    const NAMEUF = { RR: 'RORAIMA', AC: 'ACRE', RO: 'RONDÔNIA', RS: 'RIO GRANDE DO SUL', SC: 'SANTA CATARINA', PB: 'PARAÍBA', SP: 'SÃO PAULO', MG: 'MINAS GERAIS' };

    const bbox = ufs => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const s of GEO) if (ufs.includes(s.uf)) for (const r of s.p) for (const [x, y] of r) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; };
    const ALL = GEO.map(s => s.uf);
    const centroid = {}; for (const s of GEO) { let sx = 0, sy = 0, n = 0; const r = s.p.reduce((a, b) => (b.length > a.length ? b : a)); for (const [x, y] of r) { sx += x; sy += y; n++; } centroid[s.uf] = [sx / n, sy / n]; }
    centroid.MG[1] += 0.3; centroid.SP[0] += 0.6; centroid.PA[1] += 0.5;
    const REGOF = {}; for (const s of GEO) REGOF[s.uf] = s.r;

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
    function spaced(s, x, y, size, o = {}) {
      const sp = o.sp ?? size * 0.35, w = o.w || 600; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp;
      let cx = o.align === 'left' ? x : x - tot / 2; const a0 = ctx.globalAlpha; ga(a0 * (o.a ?? 1));
      [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || INK }); cx += ws[i] + sp; }); ga(a0);
      return tot;
    }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function boxed(s, x, y, size, k, o = {}) {
      if (k <= 0) return; const w = tw(s, size, 900) + size * 0.9, h = size * 1.55, sc = outBack(k);
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3));
      ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 8, -h / 2 + 8, w, h); ctx.fillStyle = o.fill || '#fff'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-w / 2, -h / 2, w, h);
      txt(s, 0, 3, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1);
    }
    function tag(s, x, y, size, col, k) {
      if (k <= 0) return; const w = tw(s, size, 900) + size * 0.8, h = size * 1.45, sc = outBack(k);
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3));
      ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w, h); ctx.fillStyle = col; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-w / 2, -h / 2, w, h);
      txt(s, 0, 3, size, { w: 900, color: '#fff' }); ctx.restore(); ga(1);
    }
    function paper() {
      scr(); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 2; ctx.strokeStyle = GRIDC;
      for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
    function header() { spaced('GASOLINA · PREÇO MÉDIO POR ESTADO', 540, 120, 26, { w: 600, sp: 6 }); ctx.fillStyle = INK; ctx.fillRect(140, 148, 800, 3); }

    const hexs = h => h[0] === '#' ? [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)) : h.match(/\d+/g).map(Number);
    const mixC = (a, b, u) => { const pa = hexs(a), pb = hexs(b); return 'rgb(' + pa.map((x, i) => Math.round(lerp(x, pb[i], clamp(u)))).join(',') + ')'; };
    // escala de cor: barato (turquesa) -> média (creme) -> caro (vermelho)
    const priceCol = v => v <= BR ? mixC(CHEAP, MID, clamp((v - PMIN) / (BR - PMIN))) : mixC(MID, EXP, clamp((v - BR) / (7.2 - BR)));

    // ---------------- mapa ----------------
    const RECT = [70, 560, 940, 760];
    function camFor(ufs, pad = 0.12) { const [x0, y0, x1, y1] = bbox(ufs), bw = (x1 - x0) * (1 + pad * 2), bh = (y1 - y0) * (1 + pad * 2), s = Math.min(RECT[2] / bw, RECT[3] / bh); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; }
    const FULL = camFor(ALL, 0.03);
    const CAMS = [FULL, FULL, camFor(['RR', 'AC', 'RO', 'AM'], 0.08), camFor(['RS', 'SC', 'PB', 'SP', 'MG'], 0.06), camFor(['SP', 'MG', 'RJ', 'PR', 'ES', 'GO', 'MS'], 0.04), FULL, FULL];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i], B[i] + 0.9); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    function statePath(s) { ctx.beginPath(); for (const r of s.p) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } }
    // fill: uf -> 0..1 (quanto da cor de preço), focus: Set com relevo, pop: uf -> 0..1
    function map(cam, fill, focus, o = {}) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, RECT[1] - 40, W, RECT[3] + 80); ctx.clip(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      const lw = 1 / cam.s, dim = o.dim ?? 0.35;
      for (const s of GEO) { if (focus && focus.has(s.uf)) continue; statePath(s); const f = fill[s.uf] || 0; ctx.fillStyle = mixC(GREY, priceCol(P[s.uf]), f * (focus ? dim : 1)); ctx.fill(); ctx.lineWidth = 2.5 * lw; ctx.strokeStyle = '#fff'; ctx.stroke(); }
      if (focus) {
        const d = 14 * lw;
        for (const s of GEO) if (focus.has(s.uf)) { ctx.save(); ctx.translate(d, d); statePath(s); ctx.fillStyle = INK; ctx.fill(); ctx.restore(); }
        for (const s of GEO) if (focus.has(s.uf)) { const p = (o.pop && o.pop[s.uf]) || 0; ctx.save(); if (p > 0) { const [cx, cy] = centroid[s.uf], sc = 1 + 0.07 * Math.sin(Math.PI * clamp(p)); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy); }
          statePath(s); ctx.fillStyle = mixC('#ffffff', priceCol(P[s.uf]), fill[s.uf] ?? 1); ctx.fill(); ctx.lineWidth = 3 * lw; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
      }
      ctx.restore();
    }
    function toScreen(cam, x, y) { return [RECT[0] + RECT[2] / 2 + (x - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (y - cam.cy) * cam.s]; }
    function ufLabel(cam, uf, k, o = {}) { if (k <= 0) return; let [x, y] = toScreen(cam, ...centroid[uf]); x += o.dx || 0; y += o.dy || 0;
      ctx.save(); ctx.translate(x, y); const sc = outBack(k) * (o.s || 1); ctx.scale(sc, sc); ga(clamp(k * 3));
      const s1 = uf, s2 = P[uf].toFixed(2).replace('.', ','); const bw = Math.max(tw(s1, 34, 900), tw(s2, 32, 900)) + 30;
      ctx.fillStyle = INK; ctx.fillRect(-bw / 2 + 5, -40 + 5, bw, 80); ctx.fillStyle = '#fff'; ctx.fillRect(-bw / 2, -40, bw, 80); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -40, bw, 80);
      txt(s1, 0, -14, 32, { w: 900 }); txt(s2, 0, 20, 30, { w: 900, color: P[uf] > BR ? EXP : CHEAP }); ctx.restore(); ga(1); }
    function rank(t, list, col, t0s, y0 = 300) {
      list.forEach((uf, i) => { const k = sm(t, t0s[i] - 0.25, t0s[i] + 0.15, outBack); if (k <= 0) return; const y = y0 + i * 88, w = 560 * (0.6 + 0.4 * Math.abs(P[uf] - BR) / (PMAX - BR)) * outC(k);
        ga(clamp(k * 2)); txt(`${i + 1}º`, 95, y, 42, { w: 900, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(150 + 6, y - 30 + 6, w, 60); ctx.fillStyle = col; ctx.fillRect(150, y - 30, w, 60); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(150, y - 30, w, 60);
        txt(NAMEUF[uf] || uf, 166, y + 2, 28, { w: 900, color: '#fff', align: 'left' }); txt(brl(P[uf]), 150 + w + 16, y + 2, 40, { w: 900, align: 'left' }); ga(1); });
    }
    function legend(a, mark) { if (a <= 0) return; ga(a); const x = 150, y = 1380, w = 780; for (let i = 0; i < 60; i++) { const u = i / 59, v = lerp(PMIN, PMAX, u); ctx.fillStyle = priceCol(v); ctx.fillRect(x + u * w - w / 120, y, w / 59 + 1, 30); }
      ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w, 30); txt('MAIS BARATA', x, y + 60, 26, { w: 900, color: CHEAP, align: 'left' }); txt('MAIS CARA', x + w, y + 60, 26, { w: 900, color: EXP, align: 'right' });
      if (mark > 0) { const mx = x + w * (BR - PMIN) / (PMAX - PMIN); ga(a * mark); ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(mx, y - 4); ctx.lineTo(mx - 14, y - 26); ctx.lineTo(mx + 14, y - 26); ctx.fill(); txt('MÉDIA 6,49', mx, y - 48, 26, { w: 900 }); }
      ga(1); }
    const fillAll = k => { const f = {}; for (const s of GEO) f[s.uf] = k; return f; };
    function pump(x, y, s, t, o = {}) { // bomba de combustível genérica
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = INK; ctx.fillRect(-100 + 10, -160 + 10, 200, 320); ctx.fillStyle = FUEL; ctx.fillRect(-100, -160, 200, 320); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(-100, -160, 200, 320);
      ctx.fillStyle = '#fff'; ctx.fillRect(-70, -130, 140, 90); ctx.strokeRect(-70, -130, 140, 90);
      txt(o.screen || '', 0, -85, 36, { w: 900 });
      ctx.fillStyle = INK; ctx.fillRect(-120, 150, 240, 24);
      ctx.beginPath(); ctx.moveTo(100, -60); ctx.bezierCurveTo(170, -60, 170, 80, 140, 120); ctx.lineWidth = 12; ctx.stroke();
      ctx.fillStyle = INK; ctx.fillRect(120, 110, 50, 30);
      ctx.restore();
    }

    // ================= CENA 1 — gancho =================
    const s1 = { enc: wt('c1', 'encher'), tan: wt('c1', 'tanque'), set: wt('c1', 'setenta'), rea: wt('c1', 'reais'), dep: wt('c1', 'dependendo'), est: wt('c1', 'estado'), olh: wt('c1', 'olha'), map: wt('c1', 'mapa'), gas: wt('c1', 'gasolina') };
    cue(0, 'music', { part: 'intro' }); cue(s1.enc, 'pour', { dur: 0.8 }); cue(s1.set, 'register'); cue(s1.rea, 'impact', { gain: 0.6 }); cue(s1.map, 'scan', { dur: 1.0, gain: 0.6 }); cue(s1.gas, 'music', { part: 'groove' });
    function scene1(t, cam) {
      const wave = prog(t, s1.olh - 0.2, s1.gas + 0.6), f = {}; for (const s of GEO) f[s.uf] = clamp((wave * 1.6 - (centroid[s.uf][1] + 5) / 40 * 0.6) * 3);
      const mk = sm(t, s1.dep - 0.2, s1.olh, outC);
      if (mk > 0) { ga(mk); map(cam, f, null); ga(1); }
      // número + bomba antes do mapa
      const hide = 1 - prog(t, s1.olh - 0.1, s1.olh + 0.3);
      if (hide > 0) { ga(hide);
        const pk = sm(t, 0.05, 0.45, outBack); const v = Math.round(70 * outC(prog(t, s1.set - 0.2, s1.rea + 0.1)));
        if (pk > 0) pump(760, 830, 0.95 * pk, t, { screen: t > s1.set - 0.2 ? `+R$ ${v}` : 'R$ ...' });
        ga(hide); txt('ENCHER', 330, 640, 80, { w: 900, scale: sm(t, s1.enc - 0.2, s1.enc + 0.15, outBack) }); txt('O TANQUE', 330, 735, 72, { w: 900, scale: sm(t, s1.tan - 0.2, s1.tan + 0.15, outBack) });
        if (t > s1.set - 0.25) { txt(`+R$ ${v}`, 330, 900, 120, { w: 900, color: EXP, scale: sm(t, s1.set - 0.25, s1.set + 0.05, outBack) }); }
        if (t > s1.dep - 0.2) tag('DEPENDENDO DO ESTADO', 400, 1060, 38, INK, prog(t, s1.dep - 0.2, s1.dep + 0.1));
        ga(1); }
      txt('GASOLINA', 540, 290, 120, { w: 900, scale: sm(t, 0.0, 0.35, outBack) });
      txt('POR ESTADO', 540, 410, 70, { w: 900, color: EXP, scale: sm(t, 0.15, 0.5, outBack) });
      legend(prog(t, s1.map, s1.map + 0.4) * mk, 0);
    }
    // ================= CENA 2 — média Brasil =================
    const s2 = { ult: wt('c2', 'ultima'), anp: wt('c2', 'anp'), med: wt('c2', 'media'), bra: wt('c2', 'brasil'), sei: wt('c2', 'seis'), qua: wt('c2', 'quarenta'), lit: wt('c2', 'litro') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.anp, 'card'); cue(s2.sei, 'tick', { dur: 0.6 }); cue(s2.qua, 'ding'); cue(s2.lit, 'pop');
    function scene2(t, cam) {
      map(cam, fillAll(1), null);
      spaced('PESQUISA DA ANP', 540, 220, 40, { w: 700, sp: 10, a: sm(t, s2.ult - 0.2, s2.anp + 0.1) });
      txt('semana de 18 a 24 de outubro', 540, 275, 32, { w: 700, color: MUTE, a: prog(t, s2.anp, s2.anp + 0.3) });
      if (t > s2.sei - 0.3) { const v = lerp(5.5, BR, outC(prog(t, s2.sei - 0.2, s2.qua + 0.2))); txt(brl(v), 540, 400, 130, { w: 900, scale: sm(t, s2.sei - 0.3, s2.sei, outBack) }); }
      tag('MÉDIA DO BRASIL · POR LITRO', 540, 510, 32, INK, prog(t, s2.med - 0.1, s2.med + 0.2));
      legend(1, prog(t, s2.qua, s2.lit + 0.2));
    }
    // ================= CENA 3 — mais caras =================
    const s3 = { car: wt('c3', 'cara'), ror: wt('c3', 'roraima'), set: wt('c3', 'sete'), acr: wt('c3', 'acre'), ron: wt('c3', 'rondonia'), set2: wt('c3', 'sete', 1) };
    cue(s3.car, 'alarm'); cue(s3.ror, 'tada'); cue(s3.acr, 'pop'); cue(s3.ron, 'pop'); cue(s3.set2, 'coin');
    function scene3(t, cam) {
      const top = ['RR', 'AC', 'RO'], pop = { RR: prog(t, s3.ror, s3.ror + 0.5), AC: prog(t, s3.acr, s3.acr + 0.5), RO: prog(t, s3.ron, s3.ron + 0.5) };
      map(cam, fillAll(1), new Set(top), { pop });
      spaced('A MAIS CARA', 540, 205, 46, { w: 700, sp: 12, color: EXP, a: sm(t, s3.car - 0.3, s3.car) });
      rank(t, top, EXP, [s3.ror, s3.acr, s3.ron], 300);
      ufLabel(cam, 'RR', prog(t, s3.set - 0.1, s3.set + 0.2), { s: 1.1 }); ufLabel(cam, 'AC', prog(t, s3.set2 - 0.1, s3.set2 + 0.2)); ufLabel(cam, 'RO', prog(t, s3.set2 - 0.1, s3.set2 + 0.2));
    }
    // ================= CENA 4 — mais baratas =================
    const s4 = { bar: wt('c4', 'barata'), rio: wt('c4', 'rio'), sei: wt('c4', 'seis'), san: wt('c4', 'santa'), par: wt('c4', 'paraiba') };
    cue(s4.bar, 'coin'); cue(s4.rio, 'tada'); cue(s4.san, 'pop'); cue(s4.par, 'pop');
    function scene4(t, cam) {
      const top = ['RS', 'SC', 'PB'], pop = { RS: prog(t, s4.rio, s4.rio + 0.5), SC: prog(t, s4.san, s4.san + 0.5), PB: prog(t, s4.par, s4.par + 0.5) };
      map(cam, fillAll(1), new Set(top), { pop });
      spaced('A MAIS BARATA', 540, 205, 46, { w: 700, sp: 12, color: CHEAP, a: sm(t, s4.bar - 0.3, s4.bar) });
      rank(t, top, CHEAP, [s4.rio, s4.san, s4.par], 300);
      ufLabel(cam, 'RS', prog(t, s4.sei - 0.1, s4.sei + 0.2), { s: 1.1 }); ufLabel(cam, 'SC', prog(t, s4.san + 0.2, s4.san + 0.5), { dx: 90 }); ufLabel(cam, 'PB', prog(t, s4.par + 0.1, s4.par + 0.4), { dx: 60, dy: -50 });
    }
    // ================= CENA 5 — SP e MG abaixo da média =================
    const s5 = { doi: wt('c5', 'dois'), gen: wt('c5', 'gente'), aba: wt('c5', 'abaixo'), sao: wt('c5', 'sao'), sei: wt('c5', 'seis'), min: wt('c5', 'minas'), sei2: wt('c5', 'seis', 1) };
    cue(s5.gen, 'pop'); cue(s5.aba, 'minus'); cue(s5.sao, 'ding'); cue(s5.min, 'ding');
    function scene5(t, cam) {
      map(cam, fillAll(1), new Set(['SP', 'MG']), { pop: { SP: prog(t, s5.sao, s5.sao + 0.5), MG: prog(t, s5.min, s5.min + 0.5) } });
      spaced('OS MAIS POPULOSOS', 540, 205, 42, { w: 700, sp: 10, a: sm(t, s5.doi - 0.3, s5.gen) });
      tag('ABAIXO DA MÉDIA (6,49)', 540, 300, 40, CHEAP, prog(t, s5.aba - 0.15, s5.aba + 0.15));
      ufLabel(cam, 'SP', prog(t, s5.sei - 0.1, s5.sei + 0.2), { s: 1.2 }); ufLabel(cam, 'MG', prog(t, s5.sei2 - 0.1, s5.sei2 + 0.2), { s: 1.2 });
      txt('SÃO PAULO', 300, 420, 46, { w: 900, scale: sm(t, s5.sao - 0.2, s5.sao + 0.1, outBack) }); txt('MINAS GERAIS', 780, 420, 46, { w: 900, scale: sm(t, s5.min - 0.2, s5.min + 0.1, outBack) });
    }
    // ================= CENA 6 — Norte paga mais, Sul e Sudeste menos =================
    const s6 = { ger: wt('c6', 'geral'), nor: wt('c6', 'norte'), sul: wt('c6', 'sul'), sud: wt('c6', 'sudeste'), men: wt('c6', 'menos'), ext: wt('c6', 'extremos'), um: wt('c6', 'um'), qua: wt('c6', 'quarenta'), lit: wt('c6', 'litro') };
    cue(s6.nor, 'pop'); cue(s6.sul, 'pop'); cue(s6.ext, 'stretch', { dur: 0.6 }); cue(s6.um, 'impact', { gain: 0.6 }); cue(s6.lit, 'stamp');
    function scene6(t, cam) {
      const nk = prog(t, s6.nor - 0.1, s6.nor + 0.4), sk = prog(t, s6.sul - 0.1, s6.sud + 0.3), all = prog(t, s6.ext - 0.2, s6.ext + 0.3);
      const focus = new Set(); if (t < s6.ext - 0.2) { if (nk > 0) GEO.forEach(s => s.r === 'N' && focus.add(s.uf)); if (sk > 0) GEO.forEach(s => (s.r === 'S' || s.r === 'SE') && focus.add(s.uf)); }
      map(cam, fillAll(1), focus.size ? focus : null, { dim: 0.25 });
      tag('NORTE: PAGA MAIS', 540, 250, 40, EXP, nk * (1 - all)); tag('SUL E SUDESTE: MENOS', 540, 345, 40, CHEAP, sk * (1 - all));
      if (all > 0) { ga(all); spaced('ENTRE OS EXTREMOS', 540, 215, 40, { w: 700, sp: 10 });
        txt('RR 7,56', 280, 320, 58, { w: 900, color: EXP }); txt('×', 540, 320, 54, { w: 900, color: MUTE }); txt('RS 6,16', 800, 320, 58, { w: 900, color: CHEAP }); ga(1);
        boxed('R$ 1,40 POR LITRO', 540, 440, 58, prog(t, s6.um - 0.15, s6.um + 0.15), { fill: LIME });
        legend(all, 1); }
    }
    // ================= CENA 7 — CTA sigla =================
    const s7 = { qua: wt('c7', 'quanto'), ai: wt('c7', 'ai'), com: wt('c7', 'comenta'), sig: wt('c7', 'sigla'), sex: wt('c7', 'sexta'), gen: wt('c7', 'gente'), seg: wt('c7', 'segue') };
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); for (let i = 0; i < 9; i++) cue(s7.sig + i * 0.1, 'pop', { gain: 0.3 }); cue(s7.sex, 'riser', { dur: 0.6 }); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    function scene7(t, cam) {
      ga(0.35); map(cam, fillAll(1), null); ga(1);
      txt('QUANTO ESTÁ', 540, 290, 96, { w: 900, scale: sm(t, s7.qua - 0.2, s7.qua + 0.15, outBack) }); txt('AÍ?', 540, 400, 110, { w: 900, color: EXP, scale: sm(t, s7.ai - 0.2, s7.ai + 0.1, outBack) });
      boxed('COMENTA A SIGLA', 540, 540, 50, prog(t, s7.com - 0.15, s7.com + 0.1), { fill: LIME });
      const ufs = ['SP', 'RJ', 'MG', 'BA', 'PE', 'CE', 'RS', 'PR', 'GO']; ufs.forEach((u, i) => { const k = prog(t, s7.sig + i * 0.1, s7.sig + i * 0.1 + 0.3); if (k <= 0) return; const x = 240 + (i % 3) * 300, y = 710 + Math.floor(i / 3) * 125; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ctx.fillStyle = INK; ctx.fillRect(-100 + 6, -45 + 6, 200, 90); ctx.fillStyle = '#fff'; ctx.fillRect(-100, -45, 200, 90); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-100, -45, 200, 90); txt(u, -45, 3, 44, { w: 900 }); txt(P[u].toFixed(2).replace('.', ','), 40, 3, 32, { w: 900, color: P[u] > BR ? EXP : CHEAP }); ctx.restore(); });
      tag('SEXTA: OS ESTADOS COM MAIS GENTE', 540, 1120, 34, INK, prog(t, s7.sex - 0.15, s7.sex + 0.15));
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1300); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = INK; ctx.fillRect(-250 + 8, -70 + 8, 500, 140); ctx.fillStyle = press ? '#fff' : LIME; ctx.fillRect(-250, -70, 500, 140); ctx.lineWidth = 5; ctx.strokeRect(-250, -70, 500, 140); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 60, { w: 900 }); ctx.restore(); }
    }

    // ================= legendas =================
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
      paper(); header();
      ctx.save(); sceneFns[i](t, camAt(t, i)); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t);
      ctx.fillStyle = '#fff'; ctx.fillRect(40, 1730, 330, 50); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeRect(40, 1730, 330, 50); spaced('VOZ GERADA POR IA', 205, 1757, 22, { w: 600, sp: 6 });
      txt('Fonte: ANP • gasolina comum • 18 a 24/10/2026', 1040, 1757, 22, { w: 600, color: MUTE, align: 'right' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
