/*
 * QUEM CONTROLA AS ROTAS DO MAR? — Mindloop "o mundo em mapas e dados" (geopolítica). 9:16, narrado.
 * Mapas: Natural Earth 50m via pipeline/geo_paises.py (rotas.json lat_ref 15, malaca.json lat_ref 2, ormuz.json lat_ref 26, mundo.json lat_ref 0).
 * Tom neutro: países costeiros em tons neutros (sem lado), sem bandeiras, sem rostos, sem cenas de violência.
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

  const BG0 = '#070b14', BG1 = '#0f1726', SEA = '#0b1220', LAND = '#1c2638', EDGE = '#34445e', INK = '#070b14';
  const AMB = '#f2b84b', TEAL = '#2ec4b6', WH = '#f3f5fa', MU = '#8a95ad', RED = '#ff4d5e', BLUE = '#5fb4ff', LIL = '#b48cff';
  const HIL = '#3b4a66'; // terra dos países costeiros (neutro)

  function create(TL, env) {
    const R = require('../assets/rotas.json'), MAL = require('../assets/malaca.json'), ORM = require('../assets/ormuz.json'), WORLD = require('../assets/mundo.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ---------- primitivas ----------
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 28; } if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || INK; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore(); }
    function rtxt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; const d = size * 0.06; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.globalAlpha *= o.a ?? 1; ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.12; ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.strokeText(s, d, d); ctx.fillText(s, d, d); ctx.strokeText(s, 0, 0); ctx.fillStyle = o.color || WH; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function line(pts, w, col, dash) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); }
    function circ(x, y, r, fill, lw = 0, sc = WH) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function soft(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    function chip(s, x, y, size, col, k, o = {}) { if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1)); rr(-w / 2 + 6, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1); }
    function panel(x, y, w, h, k, stroke) { ctx.save(); ctx.translate(x, y); const s = outBack(k); ctx.scale(s, s); ga(clamp(k * 3)); rr(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(7,11,20,0.9)'; ctx.fill(); if (stroke) { ctx.lineWidth = 4; ctx.strokeStyle = stroke; ctx.stroke(); } }
    const endPanel = () => { ctx.restore(); ga(1); };
    function bg(t) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(95,180,255,0.05)'; ctx.lineWidth = 2; const off = (t * 20) % 80; for (let x = -80 + off; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -80 + off; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    function header() { ga(0.9); rr(250, 110, 580, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); txt('O MUNDO EM MAPAS E DADOS', 540, 141, 26, { w: 800, color: MU }); ga(1); }
    function fonte(s) { txt(s, 540, 1800, 24, { w: 600, color: 'rgba(255,255,255,0.5)' }); }

    // ---------- mapa ----------
    const RECT = [0, 330, W, 1120];
    const box = (data, lo0, lo1, la0, la1) => { const K = Math.cos(data.lat_ref * Math.PI / 180), x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(RECT[2] / (x1 - x0), RECT[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, K }; };
    const mix = (a, b, k) => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), K: a.K });
    const toS = (cam, x, y) => [RECT[0] + RECT[2] / 2 + (x - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (y - cam.cy) * cam.s];
    const ll = (cam, lon, lat) => toS(cam, lon * cam.K, -lat);
    function drawMap(data, cam, style, a = 1) {
      ctx.save(); ga(a); ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      for (const p of data.paises) { const st = style(p.iso) || {}; ctx.beginPath(); for (const pl of p.poly) { pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
        if (st.glow) { ctx.save(); ctx.shadowColor = st.glow; ctx.shadowBlur = 40; ctx.fillStyle = st.fill; ctx.fill(); ctx.restore(); }
        ctx.fillStyle = st.fill || LAND; ctx.fill(); ctx.lineWidth = (st.lw || 1.6) / cam.s; ctx.strokeStyle = st.edge || EDGE; ctx.stroke(); }
      ctx.restore(); ga(1);
      const fg = ctx.createLinearGradient(0, RECT[1], 0, RECT[1] + 120); fg.addColorStop(0, 'rgba(15,23,38,1)'); fg.addColorStop(1, 'rgba(15,23,38,0)'); ctx.fillStyle = fg; ctx.fillRect(0, RECT[1], W, 120);
      const fb = ctx.createLinearGradient(0, RECT[1] + RECT[3] - 160, 0, RECT[1] + RECT[3]); fb.addColorStop(0, 'rgba(7,11,20,0)'); fb.addColorStop(1, 'rgba(7,11,20,1)'); ctx.fillStyle = fb; ctx.fillRect(0, RECT[1] + RECT[3] - 160, W, 160);
    }
    // caminho em tela + ponto ao longo dele (u de 0 a 1 por comprimento)
    function along(pts, u) { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; } let r = clamp(u) * tot; for (let i = 0; i < L.length; i++) { if (r <= L[i] || i === L.length - 1) { const f = L[i] ? clamp(r / L[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f), Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0])]; } r -= L[i]; } return [...pts[0], 0]; }
    function partial(pts, u) { const out = [pts[0]]; const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; } let r = clamp(u) * tot; for (let i = 0; i < L.length; i++) { if (r >= L[i]) { out.push(pts[i + 1]); r -= L[i]; } else { const f = r / L[i]; out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]); break; } } return out; }

    // ---------- ícones ----------
    function ship(x, y, s, ang, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-30, -10); ctx.lineTo(24, -10); ctx.lineTo(36, 0); ctx.lineTo(24, 10); ctx.lineTo(-30, 10); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#ff8a5c', '#5fb4ff', '#f2b84b', '#2ec4b6'][i]; ctx.fillRect(-24 + i * 11, -7, 9, 14); } ctx.restore(); }
    function tanker(x, y, s, ang) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-34, -11); ctx.lineTo(26, -11); ctx.lineTo(38, 0); ctx.lineTo(26, 11); ctx.lineTo(-34, 11); ctx.closePath(); ctx.fillStyle = '#c9d3e6'; ctx.fill(); ctx.fillStyle = '#5a6884'; ctx.fillRect(-34, -11, 12, 22); for (let i = 0; i < 3; i++) circ(-10 + i * 14, 0, 5, '#7a879f'); ctx.restore(); }
    function drop(x, y, s, col) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -80); ctx.bezierCurveTo(30, -30, 60, 0, 60, 30); ctx.arc(0, 30, 60, 0, Math.PI); ctx.bezierCurveTo(-60, 0, -30, -30, 0, -80); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.beginPath(); ctx.ellipse(-24, 30, 12, 22, -0.3, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill(); ctx.restore(); }
    function marker(x, y, t, col, k) { if (k <= 0) return; const ph = (t * 1.1) % 1; ctx.beginPath(); ctx.arc(x, y, 14 + 40 * ph, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = col; ga(k * (1 - ph)); ctx.stroke(); ga(k); circ(x, y, 13 * outBack(k), col, 4, INK); ga(1); }

    // ---------- câmeras e rotas ----------
    const C_WIDE = box(R, 28, 124, -14, 40), C_MALW = box(R, 92, 110, -5, 10);
    const C_MAL = box(MAL, 94, 108.5, -3.5, 8.5), C_ORM = box(ORM, 50.5, 60.5, 22, 30.5);
    const C_CAN = box(WORLD, -98, 52, -18, 50), C_GLB = box(WORLD, -125, 135, -40, 62);
    const ROUTE_R = [[32.5, 31.4], [32.5, 29.9], [34.5, 26.5], [39.5, 18.5], [43.4, 12.6], [51, 12.2], [65, 10.5], [80, 5.8], [92, 5.9], [97, 5.2], [100.5, 2.9], [103.9, 1.2], [106, 3], [110, 8], [114, 14], [118, 20]];
    const ROUTE_G = [[48.8, 29.6], [51.5, 27.3], [54.5, 26.4], [56.4, 26.55], [57.3, 25.4], [60, 23.4], [64, 20]];
    const ROUTE_MAL = [[93.5, 7.2], [97, 5.4], [99.5, 3.6], [101.6, 2.3], [103.2, 1.25], [104.2, 1.2], [105.6, 2.6], [108.5, 6.2]];
    const ROUTE_ORM = [[50.5, 28.2], [52.5, 26.9], [54.8, 26.35], [56.35, 26.55], [56.95, 25.85], [57.6, 24.9], [59.3, 23.7], [61, 23]];
    const P = (cam, pts) => pts.map(p => ll(cam, p[0], p[1]));
    const CH = { mal: [101.2, 2.6], orm: [56.4, 26.5], suez: [32.5, 30.3], pan: [-79.7, 9.1] };

    // ---------- tempos ----------
    const s1 = { cor: wt('c1', 'corredor'), tre: wt('c1', 'tres'), qui: wt('c1', 'quinto'), com: wt('c1', 'comercio'), que: wt('c1', 'quem'), rot: wt('c1', 'rotas') };
    const s2 = { mal: wt('c2', 'malaca'), mys: wt('c2', 'malasia'), idn: wt('c2', 'indonesia'), sgp: wt('c2', 'singapura'), cem: wt('c2', 'cem'), nav: wt('c2', 'navios'), ano: wt('c2', 'dois') };
    const s3 = { orm: wt('c3', 'ormuz'), irn: wt('c3', 'ira'), omn: wt('c3', 'oma'), vin: wt('c3', 'vinte'), pet: wt('c3', 'petroleo'), pla: wt('c3', 'planeta') };
    const s4 = { gue: wt('c4', 'guerra'), fev: wt('c4', 'fevereiro'), tra: wt('c4', 'trafego'), ses: wt('c4', 'sessenta'), aba: wt('c4', 'abaixo'), nor: wt('c4', 'normal') };
    const s5 = { can: wt('c5', 'canais'), don: wt('c5', 'dono'), sue: wt('c5', 'suez'), egi: wt('c5', 'egito'), qui: wt('c5', 'quinze'), pan: wt('c5', 'panama'), cin: wt('c5', 'cinco') };
    const s6 = { est: wt('c6', 'estreitos'), lei: wt('c6', 'lei'), gar: wt('c6', 'garante'), pas: wt('c6', 'passagem'), tra: wt('c6', 'trava'), pre: wt('c6', 'preco'), mun: wt('c6', 'mundo') };
    const s7 = { qua: wt('c7', 'qual'), imp: wt('c7', 'importante'), com: wt('c7', 'comenta'), ama: wt('c7', 'amanha'), fro: wt('c7', 'fronteiras'), est: wt('c7', 'estranhas'), seg: wt('c7', 'segue') };

    cue(0, 'music', { part: 'intro' }); cue(s1.cor, 'scan', { dur: 1.0, gain: 0.6 }); cue(s1.tre, 'impact', { gain: 0.7 }); cue(s1.qui, 'stamp'); cue(s1.que, 'riser', { dur: 0.6 });
    cue(B[1], 'music', { part: 'groove' }); [s2.mys, s2.idn, s2.sgp].forEach(x => cue(x, 'pop')); cue(s2.cem, 'roll', { dur: 0.7 }); cue(s2.nav, 'ding');
    cue(s3.orm, 'swoosh'); [s3.irn, s3.omn].forEach(x => cue(x, 'pop')); cue(s3.vin, 'riser', { dur: 0.5 }); cue(s3.pet, 'pour', { dur: 0.6 });
    cue(s4.tra, 'tick', { dur: 0.3 }); cue(s4.ses, 'minus'); cue(s4.aba, 'stretch', { dur: 0.6 });
    cue(s5.don, 'lock'); cue(s5.sue, 'pop'); cue(s5.qui, 'coin'); cue(s5.pan, 'pop'); cue(s5.cin, 'coin');
    cue(s6.lei, 'stamp', { gain: 0.6 }); cue(s6.tra, 'error'); cue(s6.pre, 'plus');
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    function scene1(t) {
      const z = sm(t, s1.que - 0.3, s1.rot + 0.5), cam = mix(C_WIDE, C_MALW, z);
      const mk = sm(t, s1.que - 0.3, s1.rot);
      drawMap(R, cam, iso => (['MYS', 'IDN', 'SGP'].includes(iso) && mk > 0) ? { fill: HIL, edge: AMB, lw: 2.2 } : null);
      // rota principal Europa-Ásia acendendo
      const pts = P(cam, ROUTE_R), u = sm(t, 0.15, s1.tre + 0.4);
      line(partial(pts, u), 7, 'rgba(95,180,255,0.85)', [16, 12]);
      for (let i = 0; i < 6; i++) { const v = ((t * 0.07 + i / 6) % 1); if (v > u) continue; const [x, y, a] = along(pts, v); ship(x, y, 0.8, a, '#d9e2f2'); }
      const [mx, my] = ll(cam, ...CH.mal); marker(mx, my, t, AMB, prog(t, s1.cor - 0.1, s1.cor + 0.3));
      const out = 1 - prog(t, s1.que - 0.35, s1.que - 0.1);
      if (out > 0) {
        rtxt('MENOS DE 3 KM', 540, 300, 96, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s1.tre - 0.25, s1.tre + 0.1, outBack), a: out });
        rtxt('1/5 DO COMÉRCIO', 540, 420, 80, { color: WH, scale: sm(t, s1.qui - 0.25, s1.qui + 0.1, outBack), a: out });
        rtxt('MARÍTIMO DO MUNDO', 540, 515, 62, { color: BLUE, scale: sm(t, s1.com - 0.2, s1.com + 0.15, outBack), a: out });
      }
      rtxt('QUEM CONTROLA', 540, 330, 96, { color: WH, scale: sm(t, s1.que - 0.2, s1.que + 0.15, outBack) });
      rtxt('AS ROTAS DO MAR?', 540, 445, 88, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s1.rot - 0.2, s1.rot + 0.15, outBack) });
      fonte('Estreito de Malaca · CSIS / Reuters, 2026');
    }
    function scene2(t) {
      const cam = mix(box(MAL, 92, 110, -5, 10), C_MAL, sm(t, B[1], B[1] + 1));
      const on = { MYS: s2.mys, IDN: s2.idn, SGP: s2.sgp };
      drawMap(MAL, cam, iso => on[iso] !== undefined && t > on[iso] - 0.2 ? { fill: HIL, edge: AMB, lw: 2.4 } : null);
      const pts = P(cam, ROUTE_MAL), dens = prog(t, s2.cem - 0.4, s2.nav);
      line(pts, 5, 'rgba(95,180,255,0.35)', [12, 10]);
      const n = Math.round(lerp(5, 16, dens));
      for (let i = 0; i < n; i++) { const v = ((t * 0.06 + i / n) % 1); const [x, y, a] = along(pts, v); ship(x, y + ((i % 3) - 1) * 10, 0.8, a, '#d9e2f2'); }
      chip('MALÁSIA', ...ll(cam, 101.8, 5.2), 30, AMB, prog(t, s2.mys - 0.15, s2.mys + 0.15));
      chip('INDONÉSIA', ...ll(cam, 101.3, 0.3), 30, AMB, prog(t, s2.idn - 0.15, s2.idn + 0.15));
      const sg = ll(cam, 103.85, 1.3); chip('SINGAPURA', sg[0] + 70, sg[1] + 95, 30, AMB, prog(t, s2.sgp - 0.15, s2.sgp + 0.15));
      // ponto mais estreito
      const nk = prog(t, s2.sgp + 0.2, s2.sgp + 0.5); if (nk > 0) { ga(nk); line([[sg[0] - 6, sg[1] - 60], [sg[0] - 6, sg[1] - 18]], 4, WH); txt('2,7 km', sg[0] - 6, sg[1] - 82, 28, { w: 900, color: WH, stroke: 6 }); ga(1); }
      rtxt('ESTREITO DE MALACA', 540, 330, 74, { color: AMB, scale: sm(t, s2.mal - 0.25, s2.mal + 0.1, outBack) });
      const ck = sm(t, s2.cem - 0.3, s2.cem + 0.1, outBack);
      if (ck > 0) { panel(540, 1290, 820, 190, ck, BLUE); const v = Math.round(102500 * outC(prog(t, s2.cem - 0.1, s2.nav + 0.4))); txt(String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'), 0, -30, 84, { w: 900, color: BLUE }); txt('NAVIOS EM 2025', 0, 50, 36, { w: 800, a: prog(t, s2.nav - 0.1, s2.nav + 0.2) }); endPanel(); }
      header(); fonte('Depto. Marítimo da Malásia, via Reuters · CSIS');
    }
    function ormStyle(t, tI, tO) { return iso => iso === 'IRN' && t > tI - 0.2 ? { fill: '#24496e', edge: BLUE, lw: 2.4 } : iso === 'OMN' && t > tO - 0.2 ? { fill: '#1d4a52', edge: TEAL, lw: 2.4 } : null; }
    function scene3(t) {
      const cam = mix(box(ORM, 47, 64, 19, 32), C_ORM, sm(t, B[2], B[2] + 1));
      drawMap(ORM, cam, ormStyle(t, s3.irn, s3.omn));
      const pts = P(cam, ROUTE_ORM); line(pts, 5, 'rgba(242,184,75,0.35)', [12, 10]);
      for (let i = 0; i < 9; i++) { const v = ((t * 0.05 + i / 9) % 1); const [x, y, a] = along(pts, v); tanker(x, y + ((i % 2) ? 8 : -8), 0.8, a); }
      chip('IRÃ', ...ll(cam, 55.2, 28.6), 32, BLUE, prog(t, s3.irn - 0.15, s3.irn + 0.15));
      chip('OMÃ', ...ll(cam, 58.3, 23.9), 32, TEAL, prog(t, s3.omn - 0.15, s3.omn + 0.15));
      const [mx, my] = ll(cam, ...CH.orm); marker(mx, my, t, AMB, prog(t, s3.orm - 0.1, s3.orm + 0.3));
      rtxt('ESTREITO DE ORMUZ', 540, 330, 74, { color: AMB, scale: sm(t, s3.orm - 0.25, s3.orm + 0.1, outBack) });
      const pk = sm(t, s3.vin - 0.3, s3.vin + 0.1, outBack);
      if (pk > 0) { panel(540, 1350, 900, 200, pk, AMB); drop(-330, 5, 0.75, AMB); const v = Math.round(20 * outC(prog(t, s3.vin - 0.1, s3.pet))); txt(`~${v}%`, 60, -40, 100, { w: 900, color: AMB }); txt('do petróleo consumido', 60, 40, 36, { w: 800, a: prog(t, s3.pet - 0.2, s3.pet + 0.1) }); txt('no mundo (2024)', 60, 82, 32, { w: 700, color: MU, a: prog(t, s3.pla - 0.2, s3.pla + 0.1) }); endPanel(); }
      header(); fonte('EIA (2025) · Agência Internacional de Energia');
    }
    function scene4(t) {
      const cam = C_ORM;
      drawMap(ORM, cam, ormStyle(t, 0, 0), 0.5);
      const pts = P(cam, ROUTE_ORM), keep = 1 - 0.65 * prog(t, s4.ses - 0.2, s4.aba + 0.4);
      for (let i = 0; i < 9; i++) { if (i / 9 >= keep) continue; const v = ((t * 0.05 + i / 9) % 1); const [x, y, a] = along(pts, v); ga(0.5); tanker(x, y, 0.8, a); ga(1); }
      chip('GUERRA NA REGIÃO DESDE FEV/2026', 540, 330, 32, WH, prog(t, s4.gue - 0.15, s4.fev + 0.1), { fill: '#e8ecf4' });
      // barras: normal × agora
      const bk = sm(t, s4.tra - 0.3, s4.tra + 0.1, outBack);
      if (bk > 0) { panel(540, 760, 900, 420, bk, null);
        txt('TRÁFEGO DE NAVIOS EM ORMUZ', 0, -160, 38, { w: 900, color: MU });
        const bw = 540; txt('ANTES', -400, -60, 34, { w: 900, align: 'left' }); rr(-170, -86, bw, 52, 12); ctx.fillStyle = '#4a5878'; ctx.fill(); txt('100%', -170 + bw - 16, -60, 32, { w: 900, align: 'right' });
        const g = 1 - 0.65 * outC(prog(t, s4.ses - 0.1, s4.aba + 0.3)); txt('NOV/2026', -400, 40, 32, { w: 900, align: 'left', color: AMB }); rr(-170, 14, bw * g, 52, 12); ctx.fillStyle = AMB; ctx.fill(); txt(`${Math.round(g * 100 - 0.01)}%`, -170 + bw * g + 14, 40, 32, { w: 900, align: 'left', color: AMB });
        const dk = sm(t, s4.ses - 0.2, s4.ses + 0.2, outBack); if (dk > 0) rtxt('-65%', 0, 150, 110, { color: RED, scale: dk });
        endPanel(); }
      txt('abaixo do normal', 540, 1040, 40, { w: 800, a: prog(t, s4.aba - 0.1, s4.aba + 0.3) });
      header(); fonte('UKMTO, via ONU News (13/11/2026) e Gulf News');
    }
    function scene5(t) {
      const cam = mix(C_GLB, C_CAN, sm(t, B[4], B[4] + 1));
      drawMap(WORLD, cam, iso => iso === 'EGY' && t > s5.egi - 0.2 ? { fill: '#5a4a24', edge: AMB, lw: 2.4, glow: 'rgba(242,184,75,0.6)' } : iso === 'PAN' && t > s5.pan - 0.2 ? { fill: '#3d2f5c', edge: LIL, lw: 2.4, glow: 'rgba(180,140,255,0.7)' } : null);
      const se = ll(cam, ...CH.suez), pa = ll(cam, ...CH.pan);
      marker(se[0], se[1], t, AMB, prog(t, s5.sue - 0.15, s5.sue + 0.2)); marker(pa[0], pa[1], t, LIL, prog(t, s5.pan - 0.15, s5.pan + 0.2));
      chip('SUEZ · EGITO', se[0] - 30, se[1] - 70, 30, AMB, prog(t, s5.egi - 0.15, s5.egi + 0.15));
      chip('CANAL DO PANAMÁ', pa[0] + 120, pa[1] + 70, 30, LIL, prog(t, s5.pan - 0.15, s5.pan + 0.15));
      rtxt('OS CANAIS', 540, 300, 88, { color: WH, scale: sm(t, s5.can - 0.25, s5.can + 0.1, outBack) });
      rtxt('TÊM DONO', 540, 405, 88, { color: AMB, scale: sm(t, s5.don - 0.25, s5.don + 0.1, outBack) });
      const pk = sm(t, s5.qui - 0.3, s5.qui + 0.1, outBack);
      if (pk > 0) { panel(540, 1275, 900, 250, pk, null); txt('DO COMÉRCIO MUNDIAL', 0, -88, 30, { w: 900, color: MU });
        const w1 = 600 * outC(prog(t, s5.qui - 0.1, s5.qui + 0.5)); txt('SUEZ', -400, -22, 36, { w: 900, color: AMB, align: 'left' }); rr(-220, -46, w1, 48, 12); ctx.fillStyle = AMB; ctx.fill(); txt('12 a 15%', -220 + w1 - 14, -22, 30, { w: 900, color: INK, align: 'right', a: prog(t, s5.qui + 0.2, s5.qui + 0.5) });
        const w2 = 600 * (5 / 15) * outC(prog(t, s5.cin - 0.1, s5.cin + 0.4)); txt('PANAMÁ', -400, 60, 36, { w: 900, color: LIL, align: 'left', a: prog(t, s5.pan - 0.2, s5.pan) }); rr(-220, 36, w2, 48, 12); ctx.fillStyle = LIL; ctx.fill(); txt('~5%', -220 + w2 + 14, 60, 30, { w: 900, color: LIL, align: 'left', a: prog(t, s5.cin, s5.cin + 0.3) });
        endPanel(); }
      header(); fonte('Atlantic Council (2025) · Rodrigue e Notteboom, PEMP');
    }
    function scene6(t) {
      const cam = C_GLB;
      drawMap(WORLD, cam, () => null, 0.8);
      const pts = [CH.pan, CH.suez, CH.orm, CH.mal].map(p => ll(cam, ...p)), cols = [LIL, AMB, BLUE, TEAL];
      const trv = prog(t, s6.tra - 0.1, s6.tra + 0.3);
      pts.forEach((p, i) => { marker(p[0], p[1], t, (i === 2 && trv > 0) ? RED : cols[i], prog(t, s6.est - 0.2 + i * 0.1, s6.est + 0.1 + i * 0.1)); });
      ['PANAMÁ', 'SUEZ', 'ORMUZ', 'MALACA'].forEach((s, i) => { const [x, y] = pts[i], dy = i % 2 ? 60 : -60; chip(s, clamp(x, 110, 970), y + dy, 26, cols[i], prog(t, s6.est + i * 0.1, s6.est + 0.3 + i * 0.1)); });
      if (trv > 0) { const [x, y] = pts[2]; ga(trv); line([[x - 22, y - 22], [x + 22, y + 22]], 9, RED); line([[x + 22, y - 22], [x - 22, y + 22]], 9, RED); ga(1); }
      const lk = sm(t, s6.lei - 0.25, s6.lei + 0.1, outBack);
      if (lk > 0) { panel(540, 360, 900, 170, lk, BLUE); txt('LEI DO MAR (ONU, 1982)', 0, -36, 44, { w: 900, color: BLUE }); txt('passagem garantida nos estreitos', 0, 34, 34, { w: 800, a: prog(t, s6.gar - 0.1, s6.gar + 0.3) }); endPanel(); }
      const pk = sm(t, s6.pre - 0.3, s6.pre + 0.1, outBack);
      if (pk > 0) { panel(540, 1290, 760, 200, pk, RED); const up = prog(t, s6.pre, s6.pre + 0.7); line([[-250, 60], [-250, lerp(60, -50, up)]], 18, RED); if (up > 0.8) { ctx.beginPath(); ctx.moveTo(-288, -30); ctx.lineTo(-250, -82); ctx.lineTo(-212, -30); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); }
        txt('PREÇO SOBE', 50, -24, 58, { w: 900, color: RED }); txt('no mundo inteiro', 50, 40, 36, { w: 800, a: prog(t, s6.mun - 0.2, s6.mun + 0.1) }); endPanel(); }
      header(); fonte('Convenção da ONU sobre o Direito do Mar (1982)');
    }
    function scene7(t) {
      rtxt('QUAL ROTA É A', 540, 330, 84, { color: WH, scale: sm(t, s7.qua - 0.2, s7.qua + 0.15, outBack) });
      rtxt('MAIS IMPORTANTE?', 540, 430, 84, { color: AMB, scale: sm(t, s7.imp - 0.2, s7.imp + 0.15, outBack) });
      const L = [['MALACA', TEAL], ['ORMUZ', BLUE], ['SUEZ', AMB], ['PANAMÁ', LIL]];
      L.forEach(([s, c], i) => chip(s, 300 + (i % 2) * 480, 570 + Math.floor(i / 2) * 105, 36, c, prog(t, s7.qua + 0.2 + i * 0.12, s7.qua + 0.5 + i * 0.12)));
      chip('COMENTA AQUI', 540, 810, 44, WH, prog(t, s7.com - 0.15, s7.com + 0.2), { fill: '#e8ecf4' });
      const nk = sm(t, s7.ama - 0.2, s7.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 1040); ctx.scale(nk, nk); rr(-420, -110, 840, 220, 26); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -50, 34, { w: 900, color: MU }); txt('AS FRONTEIRAS', 0, 8, 60, { w: 900, a: prog(t, s7.fro - 0.3, s7.fro) }); txt('MAIS ESTRANHAS', 0, 70, 60, { w: 900, color: BLUE, a: prog(t, s7.est - 0.2, s7.est + 0.1) }); ctx.restore(); }
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2; if (bk > 0) { ctx.save(); ctx.translate(540, 1300); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header();
    }

    // ---------- legendas ----------
    const HL = new Set(['tres', 'quilometros', 'quinto', 'comercio', 'rotas', 'malaca', 'malasia', 'indonesia', 'singapura', 'cem', 'navios', 'ormuz', 'ira', 'oma', 'vinte', 'petroleo', 'guerra', 'sessenta', 'cinco', 'abaixo', 'canais', 'dono', 'suez', 'egito', 'quinze', 'panama', 'lei', 'passagem', 'trava', 'preco', 'importante', 'comenta', 'fronteiras', 'estranhas']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1600); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? AMB : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; bg(t);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / 0.15); if (fl > 0) { ctx.globalAlpha = fl * 0.85; ctx.fillStyle = '#04060c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
