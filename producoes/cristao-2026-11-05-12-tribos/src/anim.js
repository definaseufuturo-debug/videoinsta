/*
 * AS 12 TRIBOS NA TERRA PROMETIDA (Josué 13 – 21). Mapa em pergaminho, 9:16 (perfil cristão).
 * Contornos: Natural Earth 10m (assets/regiao.json, lat_ref 32). Territórios: células de Voronoi a partir de um ponto
 * central tradicional de cada tribo, separando leste/oeste pelo Jordão — divisão APROXIMADA, só ilustrativa.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const GEO = (typeof require === 'function') ? require('../assets/regiao.json') : null;
  const W = 1080, H = 1920, TAU = Math.PI * 2, K = Math.cos((GEO ? GEO.lat_ref : 32) * Math.PI / 180);
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
  const RED = '#b23a2e', BLUE = '#2f5d8a', RIVER = '#4f86b0', GREEN = '#3c7a3e', GRAY = '#6d6d6d', DRY = '#cdb27a';

  // tribos: [nome, lon, lat, cor, lado]  (lado: 'L' = leste do Jordão, 'O' = oeste)
  const TR = [
    ['RÚBEN', 35.78, 31.62, '#c98f5a', 'L'], ['GADE', 35.74, 32.12, '#d6b45a', 'L'], ['MANASSÉS', 35.95, 32.75, '#8fae6a', 'L'],
    ['JUDÁ', 35.08, 31.42, '#c46a5a', 'O'], ['SIMEÃO', 34.72, 31.12, '#b98aa8', 'O'], ['BENJAMIM', 35.3, 31.84, '#7fa3c6', 'O'],
    ['DÃ', 34.82, 31.9, '#9a7fc0', 'O'], ['EFRAIM', 35.2, 32.1, '#6fb0a0', 'O'], ['MANASSÉS', 35.15, 32.4, '#8fae6a', 'O'],
    ['ISSACAR', 35.42, 32.6, '#e09a6a', 'O'], ['ZEBULOM', 35.28, 32.78, '#d8c070', 'O'], ['ASER', 35.12, 33.0, '#a6c08a', 'O'],
    ['NAFTALI', 35.52, 33.05, '#c78c8c', 'O'],
  ];
  // Jordão (aprox.): linha que separa leste/oeste, de sul para norte
  const JL = [[35.48, 30.6], [35.52, 31.0], [35.55, 31.75], [35.57, 32.3], [35.6, 32.72], [35.62, 33.1], [35.62, 33.8]];
  const jordX = la => { for (let i = 1; i < JL.length; i++) if (la <= JL[i][1]) { const u = (la - JL[i - 1][1]) / (JL[i][1] - JL[i - 1][1]); return lerp(JL[i - 1][0], JL[i][0], u); } return JL[JL.length - 1][0]; };
  const REG = [['MAR MEDITERRÂNEO', 34.45, 32.55, 28], ['MAR MORTO', 35.5, 31.15, 22]];

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
    const FULL = box(34.2, 36.4, 30.85, 33.35);
    const SOUTH = box(34.45, 35.85, 30.95, 32.55);
    const NORTH = box(34.75, 36.0, 32.2, 33.4);
    const EAST = box(34.9, 36.4, 31.2, 33.1);
    const CAMS = [FULL, EAST, SOUTH, NORTH, FULL, FULL, FULL];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i], B[i] + 1.0); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const ll = (cam, lo, la) => toS(cam, [lo * K, -la]);
    const inRect = (x, y, m = 0) => x > RECT[0] + m && x < RECT[0] + RECT[2] - m && y > RECT[1] + m && y < RECT[1] + RECT[3] - m;
    function clipMap() { ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); }

    // ---- células de Voronoi (em graus, lon escalado por K), cortadas pelo lado do Jordão
    const BIG = [[33.0, 29.5], [37.5, 29.5], [37.5, 34.5], [33.0, 34.5]];
    function clipHalf(poly, a, b, c) { // mantém a*x + b*y <= c
      const out = []; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length], fp = a * p[0] * K + b * p[1] - c, fq = a * q[0] * K + b * q[1] - c;
        if (fp <= 0) out.push(p); if ((fp < 0) !== (fq < 0)) { const u = fp / (fp - fq); out.push([lerp(p[0], q[0], u), lerp(p[1], q[1], u)]); } } return out; }
    const westPoly = [[33.0, 29.5], [JL[0][0], 29.5], ...JL, [JL[JL.length - 1][0], 34.5], [33.0, 34.5]];
    const eastPoly = [[JL[0][0], 29.5], [37.5, 29.5], [37.5, 34.5], [JL[JL.length - 1][0], 34.5], ...JL.slice().reverse()];
    const CELLS = TR.map((tr, i) => {
      let poly = (tr[4] === 'O' ? westPoly : eastPoly).map(p => p.slice());
      TR.forEach((o, j) => { if (j === i || o[4] !== tr[4]) return; // bissetriz: |x-pi|^2 <= |x-pj|^2  ->  2(pj-pi)·x <= |pj|^2-|pi|^2
        const xi = tr[1] * K, yi = tr[2], xj = o[1] * K, yj = o[2]; poly = clipHalf(poly, 2 * (xj - xi) / K * K, 2 * (yj - yi), (xj * xj + yj * yj) - (xi * xi + yi * yi)); });
      return poly.map(([lo, la]) => [lo * K, -la]);
    });
    const landPath = () => { ctx.beginPath(); for (const r of G.land) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } };
    // fill: array de 0..1 por tribo; hl: destaque (pulso) por tribo
    function drawMap(cam, o = {}) {
      ctx.save(); clipMap();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      landPath(); ctx.fillStyle = LAND; ctx.fill('nonzero');
      // territórios
      ctx.save(); landPath(); ctx.clip('nonzero');
      const f = o.fill || [];
      CELLS.forEach((poly, i) => { const k = clamp(f[i] || 0); if (k <= 0) return; ctx.beginPath(); poly.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
        ctx.globalAlpha = 0.78 * k * (o.dim && o.dim[i] ? 1 - 0.65 * o.dim[i] : 1); ctx.fillStyle = TR[i][3]; ctx.fill(); ctx.globalAlpha = k; ctx.lineWidth = 2.4 / cam.s; ctx.strokeStyle = 'rgba(59,42,26,0.75)'; ctx.setLineDash([7 / cam.s, 5 / cam.s]); ctx.stroke(); ctx.setLineDash([]);
        const h = (o.hl && o.hl[i]) || 0; if (h > 0) { ctx.globalAlpha = h; ctx.lineWidth = 7 / cam.s; ctx.strokeStyle = RED; ctx.stroke(); } ctx.globalAlpha = 1; });
      ctx.restore();
      landPath(); ctx.lineWidth = 2.2 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.beginPath(); for (const r of G.lakes) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } ctx.fillStyle = SEA; ctx.fill(); ctx.lineWidth = 1.5 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.strokeStyle = RIVER; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = (o.jordan ? lerp(6, 14, o.jordan) : 6) / cam.s; for (const r of G.rivers) { ctx.beginPath(); r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
      ctx.restore();
      for (const [n, lo, la, sz] of REG) { const [x, y] = ll(cam, lo, la); if (inRect(x, y, 60)) txt(n, x, y, sz, { w: 800, it: true, color: '#3f6a86', a: 0.85, rot: n.endsWith('NEO') ? -1.45 : 0 }); }
      // nomes das tribos
      const lab = o.lab || [];
      TR.forEach((tr, i) => { const k = clamp(lab[i] || 0); if (k <= 0) return; const [x, y] = ll(cam, tr[1], tr[2]); if (!inRect(x, y, 30)) return; const sz = o.lsize || 30;
        txt(tr[0], x, y, sz, { w: 900, color: INK, stroke: 9, a: clamp(k * 2), scale: outBack(k) }); if (tr[0] === 'MANASSÉS') txt(tr[4] === 'L' ? '(meia tribo)' : '(meia tribo)', x, y + sz * 0.95, sz * 0.62, { w: 800, color: MUTE, stroke: 7, a: clamp(k * 2) }); });
      ctx.restore();
    }
    function frame() { ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
    function header() { spaced('AS 12 TRIBOS', 540, 140, 56, { sp: 10 }); txt('na terra prometida  •  Josué 13 – 21', 540, 210, 30, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(200, 245, 680, 3); }
    function panel(k, fill) { if (k <= 0) return null; const s = outBack(k); ctx.save(); ctx.translate(540, 1240); ctx.scale(s, s); ga(clamp(k * 3)); ctx.fillStyle = fill || 'rgba(247,238,214,0.97)'; ctx.fillRect(-470, -150, 940, 300); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-470, -150, 940, 300); ctx.strokeRect(-460, -140, 920, 280); return true; }
    const endPanel = () => { ctx.restore(); ga(1); };
    function arrowHead(x, y, ang, col, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, -13); ctx.lineTo(-12, 13); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    function lot(x, y, s, rot, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = col || '#e8d6ae'; ctx.beginPath(); ctx.ellipse(0, 0, 26, 18, 0, 0, TAU); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    const idx = (n, side) => TR.findIndex(r => r[0] === n && (!side || r[4] === side));
    const I = { rub: idx('RÚBEN'), gad: idx('GADE'), manL: idx('MANASSÉS', 'L'), jud: idx('JUDÁ'), sim: idx('SIMEÃO'), ben: idx('BENJAMIM'), da: idx('DÃ'), efr: idx('EFRAIM'), manO: idx('MANASSÉS', 'O'), iss: idx('ISSACAR'), zeb: idx('ZEBULOM'), ase: idx('ASER'), naf: idx('NAFTALI') };
    const ALL = TR.map(() => 1);
    // 48 cidades levíticas (pontos espalhados, ilustrativos)
    const LEV = []; { let s = 7; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647); while (LEV.length < 48) { const lo = 34.7 + R() * 1.5, la = 31.1 + R() * 2.0; const east = lo > jordX(la) + 0.05, west = lo < jordX(la) - 0.05; if (!east && !west) continue; if (west && lo < 34.6 + (la - 31) * 0.28) continue; if (east && lo > 36.1) continue; LEV.push([lo, la]); } }

    // ---------------- tempos ----------------
    const s1 = { doz: wt('c1', 'doze'), tri: wt('c1', 'tribos'), ter: wt('c1', 'terra'), mas: wt('c1', 'mas'), uma: wt('c1', 'uma'), sem: wt('c1', 'sem'), nen: wt('c1', 'nenhuma') };
    const s2 = { jos: wt('c2', 'josue'), sor: wt('c2', 'sorteio'), rub: wt('c2', 'ruben'), gad: wt('c2', 'gade'), man: wt('c2', 'manasses'), les: wt('c2', 'leste'), jor: wt('c2', 'jordao') };
    const s3 = { sul: wt('c3', 'sul'), jud: wt('c3', 'juda'), gra: wt('c3', 'grande'), sim: wt('c3', 'simeao'), den: wt('c3', 'dentro'), cen: wt('c3', 'centro'), ben: wt('c3', 'benjamim'), efr: wt('c3', 'efraim'), man: wt('c3', 'manasses') };
    const s4 = { nor: wt('c4', 'norte'), iss: wt('c4', 'issacar'), zeb: wt('c4', 'zebulom'), ase: wt('c4', 'aser'), naf: wt('c4', 'naftali'), da: wt('c4', 'da'), mar: wt('c4', 'mar'), mud: wt('c4', 'muda'), ext: wt('c4', 'extremo') };
    const s5 = { lev: wt('c5', 'levi'), ter: wt('c5', 'territorio'), sen: wt('c5', 'senhor'), her: wt('c5', 'heranca'), qua: wt('c5', 'quarenta'), cid: wt('c5', 'cidades'), out: wt('c5', 'outras') };
    const s6 = { doz: wt('c6', 'doze'), jos: wt('c6', 'jose'), dois: wt('c6', 'dois'), efr: wt('c6', 'efraim'), man: wt('c6', 'manasses'), fil: wt('c6', 'filhos') };
    const s7 = { qua: wt('c7', 'qual'), com: wt('c7', 'comenta'), seg: wt('c7', 'segue'), dav: wt('c7', 'davi'), gol: wt('c7', 'golias') };

    cue(0, 'music', { part: 'intro' }); cue(s1.doz - 0.1, 'stamp'); for (let i = 0; i < 12; i++) cue(s1.doz + i * 0.09, 'pop', { gain: 0.3 }); cue(s1.uma, 'impact', { gain: 0.6 }); cue(s1.nen, 'reveal'); cue(B[1], 'music', { part: 'safe' });
    cue(s2.sor, 'whoosh', { dur: 0.6 }); cue(s2.sor + 0.25, 'pop'); cue(s2.rub, 'pop', { gain: 0.6 }); cue(s2.gad, 'pop', { gain: 0.6 }); cue(s2.man, 'pop', { gain: 0.6 }); cue(s2.jor, 'water', { dur: 1.0, gain: 0.5 });
    cue(s3.jud, 'stamp'); cue(s3.sim, 'pop', { gain: 0.6 }); cue(s3.ben, 'pop', { gain: 0.6 }); cue(s3.efr, 'pop', { gain: 0.6 }); cue(s3.man, 'pop', { gain: 0.6 });
    cue(s4.iss, 'pop', { gain: 0.6 }); cue(s4.zeb, 'pop', { gain: 0.6 }); cue(s4.ase, 'pop', { gain: 0.6 }); cue(s4.naf, 'pop', { gain: 0.6 }); cue(s4.da, 'pop', { gain: 0.6 }); cue(s4.mud, 'whoosh', { dur: 0.9 });
    cue(s5.lev, 'reveal'); cue(s5.ter, 'impact', { gain: 0.5 }); cue(s5.her, 'bell', { gain: 0.5 }); for (let i = 0; i < 16; i++) cue(s5.qua + i * 0.07, 'pop', { gain: 0.22 }); cue(s5.cid, 'ding');
    cue(s6.doz, 'reveal'); cue(s6.dois, 'stamp'); cue(s6.efr, 'pop', { gain: 0.6 }); cue(s6.man, 'pop', { gain: 0.6 }); cue(B[6], 'music', { part: 'outro' });
    cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });

    const fillAt = (t, list) => { const f = TR.map(() => 0); for (const [i, t0] of list) f[i] = prog(t, t0 - 0.15, t0 + 0.35); return f; };
    // ---------------- cenas ----------------
    function scene1(t, cam) {
      const order = [I.naf, I.ase, I.zeb, I.iss, I.manL, I.manO, I.efr, I.gad, I.da, I.ben, I.rub, I.jud, I.sim];
      const f = TR.map(() => 0); order.forEach((i, k) => { f[i] = prog(t, s1.doz - 0.2 + k * 0.08, s1.doz + 0.2 + k * 0.08); });
      const dim = TR.map(() => prog(t, s1.uma - 0.2, s1.uma + 0.2));
      drawMap(cam, { fill: f, dim, lab: f.map(v => v * (1 - prog(t, s1.uma - 0.2, s1.uma))), lsize: 24 });
      frame();
      const qk = sm(t, s1.doz - 0.25, s1.doz + 0.1, outBack), sw = prog(t, s1.mas - 0.2, s1.mas + 0.1);
      if (qk > 0 && sw < 1) { txt('12 TRIBOS', 540, 325, 108, { w: 900, color: RED, scale: qk * (1 - sw) }); txt('E A TERRA PROMETIDA', 540, 405, 38, { w: 900, color: INK, a: prog(t, s1.ter - 0.2, s1.ter + 0.2) * (1 - sw) }); }
      if (t > s1.mas) plaque('1 FICOU SEM TERRA', 540, 360, 52, prog(t, s1.uma - 0.2, s1.uma + 0.1), { col: RED });
      // ponto de interrogação gigante sobre o mapa
      const zk = sm(t, s1.sem - 0.1, s1.sem + 0.3, outBack); if (zk > 0) txt('?', 540, 930, 360, { w: 900, color: RED, stroke: 14, scale: zk, a: 0.9 });
    }
    function scene2(t, cam) {
      const f = fillAt(t, [[I.rub, s2.rub], [I.gad, s2.gad], [I.manL, s2.man]]);
      drawMap(cam, { fill: f, lab: f, jordan: prog(t, s2.les - 0.2, s2.jor) * (1 - prog(t, s2.jor + 0.8, s2.jor + 1.5)) });
      // sorteio: pedrinhas caindo
      const lk = prog(t, s2.sor - 0.3, s2.rub - 0.1); if (lk > 0 && lk < 1) { for (let i = 0; i < 12; i++) { const y = lerp(470, 900, outBack(clamp(lk * 1.6 - i * 0.05))) ; lot(260 + (i % 6) * 110, y + Math.floor(i / 6) * 60, 1.1, i * 0.7, TR[i][3]); } }
      if (t > s2.les - 0.2) { const [x, y] = ll(cam, 35.6, 32.0); ctx.save(); ga(prog(t, s2.les - 0.2, s2.les + 0.2)); txt('RIO JORDÃO', x - 24, y + 40, 28, { w: 900, color: BLUE, stroke: 8, rot: -1.5 }); ctx.restore(); ga(1); }
      frame();
      if (t > s2.les - 0.3) plaque('A LESTE DO JORDÃO (Js 13:8)', 540, 360, 38, prog(t, s2.les - 0.3, s2.les), { col: BLUE });
      else if (t > s2.sor - 0.3) plaque('DIVIDIDA POR SORTEIO (Js 14:2)', 540, 360, 36, prog(t, s2.sor - 0.3, s2.sor));
      else plaque('JOSUÉ DIVIDE A TERRA', 540, 360, 42, prog(t, B[1], B[1] + 0.3));
    }
    function scene3(t, cam) {
      const f = fillAt(t, [[I.rub, 0], [I.gad, 0], [I.manL, 0], [I.jud, s3.jud], [I.sim, s3.sim], [I.ben, s3.ben], [I.efr, s3.efr], [I.manO, s3.man]]);
      const hl = TR.map(() => 0); hl[I.jud] = pulse(t, s3.gra, 0.1, 0.8); hl[I.sim] = pulse(t, s3.den, 0.1, 0.8);
      drawMap(cam, { fill: f, lab: f, hl });
      frame();
      if (t > s3.cen - 0.3) plaque('NO CENTRO', 540, 360, 46, prog(t, s3.cen - 0.3, s3.cen), { col: GREEN });
      else if (t > s3.sim - 0.3) plaque('SIMEÃO DENTRO DE JUDÁ (Js 19:9)', 540, 360, 34, prog(t, s3.sim - 0.3, s3.sim), { col: RED });
      else plaque('NO SUL: JUDÁ', 540, 360, 46, prog(t, B[2], B[2] + 0.3), { col: RED });
    }
    function scene4(t, cam) {
      const prev = [I.rub, I.gad, I.manL, I.jud, I.sim, I.ben, I.efr, I.manO].map(i => [i, 0]);
      const f = fillAt(t, prev.concat([[I.iss, s4.iss], [I.zeb, s4.zeb], [I.ase, s4.ase], [I.naf, s4.naf], [I.da, s4.da]]));
      drawMap(cam, { fill: f, lab: f });
      // Dã muda para o norte (Lesém, Js 19:47): seta tracejada
      const mk2 = prog(t, s4.mud - 0.2, s4.ext + 0.5); if (mk2 > 0) { const a = ll(cam, 34.85, 31.95), b = ll(cam, 35.64, 33.24); const c = [lerp(a[0], b[0], 0.5) - 200, lerp(a[1], b[1], 0.5)];
        ctx.save(); clipMap(); ctx.beginPath(); let last = a; ctx.moveTo(a[0], a[1]); const N = 40, n = Math.floor(N * inOut(mk2)); for (let i = 1; i <= n; i++) { const u = i / N, x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]; ctx.lineTo(x, y); last = [x, y, Math.atan2(y - ctx.__y || 0, 1)]; }
        ctx.lineWidth = 7; ctx.setLineDash([16, 11]); ctx.strokeStyle = TR[I.da][3]; ctx.stroke(); ctx.setLineDash([]);
        if (n >= 2) { const u0 = (n - 1) / N, u1 = n / N, P0 = [(1 - u0) ** 2 * a[0] + 2 * (1 - u0) * u0 * c[0] + u0 * u0 * b[0], (1 - u0) ** 2 * a[1] + 2 * (1 - u0) * u0 * c[1] + u0 * u0 * b[1]]; arrowHead(last[0], last[1], Math.atan2(last[1] - P0[1], last[0] - P0[0]), '#6a4f96', 1.3); }
        if (mk2 > 0.9) { ctx.beginPath(); ctx.arc(b[0], b[1], 12, 0, TAU); ctx.fillStyle = '#6a4f96'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke(); txt('DÃ (LESÉM)', b[0] + 20, b[1] - 6, 26, { w: 900, color: '#6a4f96', stroke: 8, align: 'left' }); }
        ctx.restore(); }
      frame();
      if (t > s4.mud - 0.3) plaque('DÃ SE MUDA PARA O NORTE (Js 19:47)', 540, 360, 31, prog(t, s4.mud - 0.3, s4.mud), { col: '#6a4f96' });
      else if (t > s4.da - 0.3) plaque('DÃ, PERTO DO MAR', 540, 360, 44, prog(t, s4.da - 0.3, s4.da), { col: '#6a4f96' });
      else plaque('NO NORTE', 540, 360, 46, prog(t, B[3], B[3] + 0.3), { col: GREEN });
    }
    function scene5(t, cam) {
      drawMap(cam, { fill: ALL, lab: TR.map(() => 1 - prog(t, s5.qua - 0.3, s5.qua)), lsize: 24, dim: TR.map(() => 0.4 * prog(t, s5.qua - 0.3, s5.qua)) });
      // 48 cidades
      const ck = prog(t, s5.qua - 0.1, s5.cid + 0.1); if (ck > 0) { ctx.save(); clipMap(); LEV.forEach(([lo, la], i) => { const k = outBack(prog(ck, i / 60, i / 60 + 0.2)); if (k <= 0) return; const [x, y] = ll(cam, lo, la); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = GOLD; ctx.fillRect(-9, -9, 18, 18); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeRect(-9, -9, 18, 18); ctx.restore(); }); ctx.restore(); }
      frame();
      const pk = prog(t, s5.lev - 0.3, s5.lev) * (1 - prog(t, s5.qua - 0.4, s5.qua - 0.1)); if (panel(pk)) {
        txt('LEVI', 0, -70, 84, { w: 900, color: GOLD }); txt('0 TERRITÓRIO', 0, 15, 56, { w: 900, color: RED, a: prog(t, s5.ter - 0.2, s5.ter + 0.1) });
        txt('"O SENHOR É A SUA HERANÇA" (Js 13:33)', 0, 90, 30, { w: 800, color: INK, a: prog(t, s5.sen - 0.2, s5.sen + 0.2) }); endPanel(); }
      if (t > s5.qua - 0.3) { plaque('48 CIDADES (Js 21:41)', 540, 360, 50, prog(t, s5.qua - 0.3, s5.qua), { col: GOLD }); }
      else plaque('E LEVI?', 540, 360, 52, prog(t, B[4], B[4] + 0.3), { col: GOLD });
    }
    function scene6(t, cam) {
      const ef = prog(t, s6.efr - 0.2, s6.efr + 0.2), mn = prog(t, s6.man - 0.2, s6.man + 0.2);
      const dim = TR.map((_, i) => (i === I.efr || i === I.manO || i === I.manL) ? 0 : prog(t, s6.jos - 0.2, s6.jos + 0.2) * 0.9);
      const hl = TR.map(() => 0); hl[I.efr] = ef * (0.6 + 0.4 * Math.sin(t * 8)); hl[I.manO] = hl[I.manL] = mn * (0.6 + 0.4 * Math.sin(t * 8));
      drawMap(cam, { fill: ALL, dim, hl, lab: TR.map((_, i) => (i === I.efr || i === I.manO || i === I.manL) ? 1 : 1 - prog(t, s6.jos - 0.2, s6.jos)), lsize: 26 });
      frame();
      const pk = prog(t, s6.jos - 0.3, s6.jos); if (panel(pk)) {
        txt('JOSÉ', -300, -40, 70, { w: 900, color: INK }); txt('=', -150, -40, 70, { w: 900, color: MUTE, a: prog(t, s6.dois - 0.2, s6.dois) });
        txt('EFRAIM', 70, -70, 52, { w: 900, color: '#2f7d6d', a: ef }); txt('+ MANASSÉS', 120, -5, 52, { w: 900, color: '#5d7d3a', a: mn });
        txt('"os filhos de José foram duas tribos" (Js 14:4)', 0, 90, 28, { w: 700, it: true, color: MUTE, a: prog(t, s6.fil - 0.3, s6.fil + 0.2) }); endPanel(); }
      if (t > s6.dois - 0.3) stamp('JOSÉ CONTA POR 2', 540, 355, prog(t, s6.dois - 0.3, s6.dois), { size: 62 });
      else plaque('COMO CONTINUAM 12?', 540, 360, 46, prog(t, B[5], B[5] + 0.3), { col: RED });
    }
    function scene7(t, cam) {
      drawMap(cam, { fill: ALL, lab: ALL, lsize: 24 });
      frame();
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1490); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RED; ctx.fillRect(-200, -46, 400, 92); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-200, -46, 400, 92); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 46, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
      if (t > s7.dav - 0.4) plaque('PRÓXIMA PARTE: DAVI E GOLIAS', 540, 360, 34, prog(t, s7.dav - 0.4, s7.dav), { col: BLUE });
      else plaque('DE QUAL TRIBO VOCÊ SERIA?', 540, 360, 38, prog(t, s7.qua - 0.3, s7.qua), { col: RED });
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
      captions(t); txt('Divisão aproximada, conforme mapas bíblicos tradicionais.', 540, 1780, 22, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
