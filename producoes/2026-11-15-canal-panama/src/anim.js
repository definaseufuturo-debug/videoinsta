/*
 * COMO FUNCIONA O CANAL DO PANAMÁ — Mindloop "o mundo em mapas e dados" (dom: comércio, energia e recursos). 9:16, narrado.
 * Mapa: Natural Earth 50m via pipeline/geo_paises.py (-128..-30, -57..50, lat_ref 9). Traçado do canal, lago Gatún e rotas
 * desenhados à mão, aproximados. Perfil das eclusas esquemático (fora de escala). Neutro.
 * Fontes: Wikipedia (Panama Canal), Tico Times (2014), Olhar Digital (2024).
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

  const BG0 = '#070b14', BG1 = '#0f1726', SEA = '#0b1a2e', LAND = '#1c2638', EDGE = '#34445e', INK = '#070b14';
  const AMB = '#f2b84b', TEAL = '#2ec4b6', WH = '#f3f5fa', MU = '#8a95ad', RED = '#ff5d6c', BLUE = '#5fb4ff', WATER = '#2f8fe0';
  const K = Math.cos(9 * Math.PI / 180);
  const P = (lon, lat) => [lon * K, -lat];

  // canal (aprox.), lago Gatún (aprox.), cidades
  const CANAL = [[-79.93, 9.42], [-79.92, 9.27], [-79.89, 9.21], [-79.82, 9.15], [-79.74, 9.11], [-79.67, 9.07], [-79.62, 9.03], [-79.59, 9.0], [-79.56, 8.93], [-79.53, 8.86]];
  const LAKE = [[-80.03, 9.13], [-80.0, 9.24], [-79.93, 9.28], [-79.86, 9.26], [-79.79, 9.22], [-79.72, 9.17], [-79.68, 9.11], [-79.72, 9.06], [-79.8, 9.09], [-79.88, 9.05], [-79.97, 9.04]];
  const COLON = [-79.9, 9.36], PCITY = [-79.52, 8.98];
  // rotas (Atlântico -> Pacífico)
  const LONG = [[-72, 38], [-62, 25], [-38, 0], [-36, -12], [-46, -28], [-58, -42], [-65, -56], [-73, -55], [-77, -45], [-76, -30], [-80, -12], [-85, 0], [-98, 12], [-112, 24], [-121, 35]];
  const SHORT = [[-72, 38], [-72, 26], [-74, 19], [-79.9, 10.2], [-79.9, 9.3], [-79.55, 8.9], [-84, 7], [-98, 12], [-112, 24], [-121, 35]];

  function create(TL, env) {
    const WORLD = env.paises || require('../assets/paises.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const BY = {}; for (const p of WORLD.paises) BY[p.iso] = p;

    // ---------- primitivas ----------
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 28; } if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || INK; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore(); }
    function rtxt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; const d = size * 0.06; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.globalAlpha *= o.a ?? 1; ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.12; ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.strokeText(s, d, d); ctx.fillText(s, d, d); ctx.strokeText(s, 0, 0); ctx.fillStyle = o.color || WH; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function circ(x, y, r, fill, lw = 0, sc = WH) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function chip(s, x, y, size, col, k, o = {}) { if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1)); rr(-w / 2 + 6, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1); }
    function panel(x, y, w, h, k, col) { const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); rr(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(7,11,20,0.9)'; ctx.fill(); if (col) { ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); } }
    const endPanel = () => { ctx.restore(); ga(1); };
    function bg(t) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(46,196,182,0.04)'; ctx.lineWidth = 2; const off = (t * 20) % 80; for (let x = -80 + off; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -80 + off; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    function header() { ga(0.9); rr(250, 110, 580, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); txt('O MUNDO EM MAPAS E DADOS', 540, 141, 26, { w: 800, color: MU }); ga(1); }
    function fonte(s) { txt(s, 540, 1800, 24, { w: 600, color: 'rgba(255,255,255,0.45)' }); }
    const mixC = (a, b, u) => { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return 'rgb(' + pa.map((x, i) => Math.round(lerp(x, pb[i], clamp(u)))).join(',') + ')'; };

    // ---------- mapa ----------
    const R_MAP = [0, 300, W, 960];
    const box = (lo0, lo1, la0, la1) => { const x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(R_MAP[2] / (x1 - x0), R_MAP[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, R: R_MAP }; };
    const mix = (a, b, k) => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), R: a.R });
    const toS = (cam, lon, lat) => { const [x, y] = P(lon, lat); return [cam.R[0] + cam.R[2] / 2 + (x - cam.cx) * cam.s, cam.R[1] + cam.R[3] / 2 + (y - cam.cy) * cam.s]; };
    function cpath(p) { ctx.beginPath(); for (const pl of p.poly) { pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } }
    // o: {hl: {iso: [col, a]}, lake: 0..1, canal: 0..1, glow}
    function drawMap(cam, o = {}, a = 1) {
      const Rr = cam.R; ctx.save(); ga(a); ctx.beginPath(); ctx.rect(Rr[0], Rr[1], Rr[2], Rr[3]); ctx.clip();
      ctx.fillStyle = SEA; ctx.fillRect(Rr[0], Rr[1], Rr[2], Rr[3]);
      ctx.save(); ctx.translate(Rr[0] + Rr[2] / 2, Rr[1] + Rr[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      for (const p of WORLD.paises) { cpath(p); const h = o.hl && o.hl[p.iso]; ctx.fillStyle = h && h[1] > 0 ? mixC(LAND, h[0], h[1]) : LAND; if (h && h[1] > 0.5 && o.glow) { ctx.shadowColor = h[0]; ctx.shadowBlur = 30; } ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 1.2 / cam.s; ctx.strokeStyle = EDGE; ctx.stroke(); }
      if (o.lake > 0) { ctx.globalAlpha = a * clamp(o.lake); ctx.beginPath(); LAKE.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fillStyle = WATER; ctx.fill(); ctx.globalAlpha = a; }
      ctx.restore();
      if (o.canal > 0) polyline(cam, CANAL, o.canal, o.canalCol || TEAL, o.canalW || 12, false);
      ctx.restore(); ga(1);
      const fg = ctx.createLinearGradient(0, Rr[1], 0, Rr[1] + 110); fg.addColorStop(0, 'rgba(15,23,38,1)'); fg.addColorStop(1, 'rgba(15,23,38,0)'); ctx.fillStyle = fg; ctx.fillRect(0, Rr[1], W, 110);
      const fb = ctx.createLinearGradient(0, Rr[1] + Rr[3] - 150, 0, Rr[1] + Rr[3]); fb.addColorStop(0, 'rgba(7,11,20,0)'); fb.addColorStop(1, 'rgba(7,11,20,1)'); ctx.fillStyle = fb; ctx.fillRect(0, Rr[1] + Rr[3] - 150, W, 150);
    }
    // linha que anda (por comprimento), com cabeça opcional
    function polyline(cam, pts, k, col, lw, dashed, head) {
      if (k <= 0) return; const S = pts.map(p => toS(cam, ...p)); const L = [0]; for (let i = 1; i < S.length; i++) L.push(L[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
      const goal = L[L.length - 1] * clamp(k); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = col; if (dashed) { ctx.setLineDash([20, 14]); }
      ctx.beginPath(); ctx.moveTo(...S[0]); let hx = S[0][0], hy = S[0][1], ang = 0;
      for (let i = 1; i < S.length; i++) { if (L[i] <= goal) { ctx.lineTo(...S[i]); hx = S[i][0]; hy = S[i][1]; ang = Math.atan2(S[i][1] - S[i - 1][1], S[i][0] - S[i - 1][0]); } else { const u = (goal - L[i - 1]) / (L[i] - L[i - 1]); hx = lerp(S[i - 1][0], S[i][0], u); hy = lerp(S[i - 1][1], S[i][1], u); ang = Math.atan2(S[i][1] - S[i - 1][1], S[i][0] - S[i - 1][0]); ctx.lineTo(hx, hy); break; } }
      ctx.stroke(); ctx.setLineDash([]);
      if (head) { ctx.translate(hx, hy); ctx.rotate(ang); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(lw * 2.4, 0); ctx.lineTo(-lw * 1.6, -lw * 1.8); ctx.lineTo(-lw * 1.6, lw * 1.8); ctx.closePath(); ctx.fill(); }
      ctx.restore(); return [hx, hy];
    }
    function cityDot(cam, ll, name, k, col = WH, dx = 0, dy = -46, size = 28) { if (k <= 0) return; const [x, y] = toS(cam, ...ll); ga(k); circ(x, y, 18 + 10 * Math.sin(k * Math.PI), 'rgba(255,255,255,0.15)'); circ(x, y, 10, col, 4, INK); ga(1); if (name) chip(name, x + dx, y + dy, size, col, k); }

    const CAM_AM = box(-125, -30, -57, 46), CAM_PA = box(-83.2, -77.2, 7.0, 9.9), CAM_CN = box(-80.25, -79.3, 8.75, 9.5);
    const CAMS = [CAM_PA, CAM_AM, CAM_CN, CAM_CN, CAM_CN, CAM_PA, CAM_PA];

    // ---------- tempos ----------
    const s1 = { atr: wt('c1', 'cruzar'), pan: wt('c1', 'panama'), nav: wt('c1', 'navio'), sob: wt('c1', 'sobe'), vin: wt('c1', 'vinte'), met: wt('c1', 'metros'), mar: wt('c1', 'mar'), com: wt('c1', 'como'), can: wt('c1', 'canal') };
    const s2 = { sem: wt('c2', 'sem'), con: wt('c2', 'contornar'), ame: wt('c2', 'america'), sul: wt('c2', 'sul'), sma: wt('c2', 'semanas'), via: wt('c2', 'viagem') };
    const s3 = { ata: wt('c3', 'atalho'), oit: wt('c3', 'oitenta'), qui: wt('c3', 'quilometros'), ina: wt('c3', 'inaugurado'), mil: wt('c3', 'mil'), cat: wt('c3', 'catorze') };
    const s4 = { ecl: wt('c4', 'eclusas'), cam: wt('c4', 'eclusas'), enc: wt('c4', 'enchem'), erg: wt('c4', 'erguem'), lag: wt('c4', 'lago'), gat: wt('c4', 'gatun'), out: wt('c4', 'outro'), des: wt('c4', 'desce'), mar: wt('c4', 'mar') };
    const s5 = { pas: wt('c5', 'passagem'), duz: wt('c5', 'duzentos'), mil: wt('c5', 'milhoes'), lit: wt('c5', 'litros'), agu: wt('c5', 'agua'), doc: wt('c5', 'doce'), tra: wt('c5', 'travessia'), dez: wt('c5', 'dez'), hor: wt('c5', 'horas') };
    const s6 = { est: wt('c6', 'estados'), con: wt('c6', 'construiram'), mil: wt('c6', 'mil'), nov: wt('c6', 'nove', 1), pan: wt('c6', 'panama') };
    const s7 = { qua: wt('c7', 'qual'), can: wt('c7', 'canal'), com: wt('c7', 'comenta'), ama: wt('c7', 'amanha'), rot: wt('c7', 'rotas'), mar: wt('c7', 'maritimas'), seg: wt('c7', 'segue'), per: wt('c7', 'perder') };

    cue(0, 'music', { part: 'intro' }); cue(s1.pan, 'scan', { dur: 0.9, gain: 0.5 }); cue(s1.sob, 'riser', { dur: 0.9 }); cue(s1.met, 'impact', { gain: 0.8 }); cue(s1.can, 'pop');
    cue(B[1], 'music', { part: 'groove' }); cue(s2.con, 'whoosh', { dur: 1.2, gain: 0.5 }); cue(s2.sul, 'scan', { dur: 1.0, gain: 0.4 }); cue(s2.sma, 'stamp', { gain: 0.6 });
    cue(s3.ata, 'zap', { gain: 0.5 }); cue(s3.oit, 'ding'); cue(s3.cat, 'stamp', { gain: 0.6 });
    cue(s4.ecl, 'lock', { gain: 0.6 }); cue(s4.enc, 'water', { dur: 1.4 }); cue(s4.erg, 'riser', { dur: 1.0 }); cue(s4.gat, 'splash'); cue(s4.des, 'pour', { dur: 1.0 });
    cue(s5.duz, 'pour', { dur: 1.2 }); cue(s5.lit, 'impact', { gain: 0.6 }); for (let i = 0; i < 8; i++) cue(lerp(s5.dez - 0.2, s5.hor + 0.4, i / 7), 'tick', { dur: 0.08, gain: 0.4 }); cue(s5.hor + 0.5, 'ding');
    cue(s6.con, 'pop'); cue(s6.mil, 'scan', { dur: 1.0, gain: 0.4 }); cue(s6.pan, 'tada');
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.rot, 'whoosh', { dur: 0.4 }); cue(s7.per + 0.1, 'tap'); cue(s7.per + 0.15, 'success');
    for (const k of [1, 2, 3, 4, 5, 6]) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.45 });

    // ================= CENA 1 — sobe 26 metros =================
    function scene1(t, cam) {
      const c = mix(CAM_AM, CAM_PA, sm(t, 0, s1.pan + 0.4));
      drawMap(c, { hl: { PAN: [TEAL, sm(t, s1.pan - 0.3, s1.pan + 0.2)] }, glow: true, canal: prog(t, s1.nav, s1.sob + 0.3), canalW: 9, canalCol: AMB });
      chip('PANAMÁ', 540, 400, 44, TEAL, sm(t, s1.pan - 0.2, s1.pan + 0.15));
      const ck = sm(t, s1.vin - 0.25, s1.vin + 0.1, outBack);
      if (ck > 0) { panel(540, 1060, 820, 300, ck, AMB); const n = Math.round(26 * sm(t, s1.vin - 0.1, s1.met)); rtxt('▲ ' + n + ' METROS', 0, -40, 104, { color: WH, scale: 1 + 0.08 * pulse(t, s1.met) }); txt('ACIMA DO NÍVEL DO MAR', 0, 80, 46, { w: 900, color: AMB, a: prog(t, s1.mar - 0.3, s1.mar) }); endPanel(); }
      const qk = sm(t, s1.com - 0.2, s1.com + 0.15, outBack);
      if (qk > 0) { panel(540, 545, 900, 140, qk, TEAL); txt('COMO FUNCIONA ESSE CANAL?', 0, 3, 50, { w: 900, color: TEAL }); endPanel(); }
      header(); fonte('Canal do Panamá · Wikipedia / Tico Times');
    }
    // ================= CENA 2 — a volta pela América do Sul =================
    function scene2(t, cam) {
      drawMap(cam, { hl: { PAN: [TEAL, 1] } });
      txt('ATLÂNTICO', 820, 760, 34, { w: 900, color: BLUE, a: prog(t, B[1] + 0.3, B[1] + 0.7) });
      txt('PACÍFICO', 190, 760, 34, { w: 900, color: BLUE, a: prog(t, B[1] + 0.5, B[1] + 0.9) });
      polyline(cam, LONG, sm(t, s2.con - 0.3, s2.sma, x => x), RED, 9, true, true);
      const sk = prog(t, s2.sma, s2.via + 0.3); if (sk > 0) polyline(cam, SHORT, sk, TEAL, 9, false, true);
      chip('SEM O CANAL', 540, 400, 42, RED, prog(t, s2.sem - 0.15, s2.sem + 0.2));
      const k = sm(t, s2.sma - 0.2, s2.sma + 0.1, outBack);
      if (k > 0) { panel(540, 1090, 760, 220, k, RED); rtxt('+ SEMANAS', 0, -20, 96, { color: RED, scale: 1 + 0.06 * pulse(t, s2.sma) }); txt('DE VIAGEM', 0, 65, 40, { w: 900 }); endPanel(); }
      header(); fonte('Rotas ilustrativas · Olhar Digital (2024) / Wikipedia');
    }
    // ================= CENA 3 — 80 km, 1914 =================
    function scene3(t, cam) {
      const c = mix(CAM_PA, CAM_CN, sm(t, B[2] - 0.1, B[2] + 1.0));
      drawMap(c, { hl: { PAN: [TEAL, 0.3] }, lake: sm(t, B[2] + 0.4, B[2] + 1.0), canal: prog(t, s3.ata - 0.1, s3.qui + 0.2) });
      cityDot(c, COLON, 'ATLÂNTICO', prog(t, s3.ata - 0.2, s3.ata + 0.2), BLUE, -30, -50);
      cityDot(c, PCITY, 'PACÍFICO', prog(t, s3.qui - 0.1, s3.qui + 0.3), BLUE, 130, -30);
      chip('O ATALHO', 540, 400, 42, TEAL, sm(t, s3.ata - 0.2, s3.ata + 0.1));
      const k = sm(t, s3.oit - 0.2, s3.oit + 0.1, outBack);
      if (k > 0) { panel(300, 1090, 470, 220, k, TEAL); rtxt('~80 KM', 0, -20, 88, { color: TEAL }); txt('DE EXTENSÃO', 0, 62, 34, { w: 900 }); endPanel(); }
      const k2 = sm(t, s3.mil - 0.2, s3.mil + 0.1, outBack);
      if (k2 > 0) { panel(790, 1090, 450, 220, k2, AMB); const y = Math.round(lerp(1900, 1914, sm(t, s3.mil - 0.1, s3.cat + 0.1))); rtxt(String(y), 0, -20, 88, { color: AMB, scale: 1 + 0.06 * pulse(t, s3.cat + 0.1) }); txt('INAUGURAÇÃO', 0, 62, 34, { w: 900 }); endPanel(); }
      header(); fonte('82 km (Wikipedia) · 80 km (Tico Times) · traçado aproximado');
    }
    // ================= CENA 4 — perfil das eclusas =================
    // segmentos: [x0, x1, nível]
    const SEG = [[40, 150, 0], [150, 250, 1 / 3], [250, 350, 2 / 3], [350, 450, 1], [450, 630, 1], [630, 730, 2 / 3], [730, 830, 1 / 3], [830, 930, 0], [930, 1040, 0]];
    const Y0 = 1180, Y1 = 760; const yl = l => lerp(Y0, Y1, l);
    function shipLevel(x) { // nível que o navio ocupa ao passar em x
      for (let i = 0; i < SEG.length; i++) { const [a, b, l] = SEG[i]; if (x >= a && x < b) { const pl = i ? SEG[i - 1][2] : l; if (l === pl) return l; return lerp(pl, l, sm(x, a, a + (b - a) * 0.9)); } }
      return 0;
    }
    function ship(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = '#d64545'; ctx.beginPath(); ctx.moveTo(-70, -6); ctx.lineTo(74, -6); ctx.lineTo(56, 22); ctx.lineTo(-58, 22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2b3448'; ctx.fillRect(-70, -10, 144, 6);
      const C = [AMB, TEAL, BLUE, WH, AMB, BLUE]; for (let i = 0; i < 6; i++) { ctx.fillStyle = C[i]; ctx.fillRect(-52 + i * 18, -34, 16, 22); }
      ctx.fillStyle = WH; ctx.fillRect(52, -46, 18, 36); ctx.restore(); }
    function scene4(t, cam) {
      const a = sm(t, B[3], B[3] + 0.5);
      chip('ECLUSAS', 540, 400, 44, AMB, sm(t, s4.ecl - 0.2, s4.ecl + 0.15));
      ga(a);
      // céu/fundo do painel
      rr(20, 520, 1040, 760, 28); ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fill();
      // navio
      const u = sm(t, s4.cam - 0.4, s4.mar + 0.3, x => x), sx = lerp(90, 990, u), sl = shipLevel(sx);
      // água
      SEG.forEach(([x0, x1, l], i) => { let lv = l; if (sx >= x0 && sx < x1) lv = sl; ctx.fillStyle = WATER; ctx.globalAlpha = a * 0.9; ctx.fillRect(x0, yl(lv), x1 - x0, Y0 + 40 - yl(lv)); });
      ctx.globalAlpha = a;
      // terreno (degraus)
      ctx.fillStyle = '#26324a'; SEG.forEach(([x0, x1, l], i) => { const floor = yl(l) + 60; ctx.fillRect(x0, floor, x1 - x0, 1260 - floor); });
      ctx.fillStyle = '#26324a'; ctx.fillRect(20, Y0 + 40, 1040, 1260 - Y0 - 40);
      // comportas
      ctx.fillStyle = WH; for (const x of [150, 250, 350, 450, 630, 730, 830]) { const top = Math.min(...SEG.filter(s => s[0] === x || s[1] === x).map(s => yl(s[2]))) - 26; ctx.fillRect(x - 5, top, 10, 1260 - top - 20); }
      ship(sx, yl(sl) - 14 + 3 * Math.sin(t * 3), 0.62);
      // rótulos
      txt('ATLÂNTICO', 120, 1250, 30, { w: 900, color: BLUE }); txt('PACÍFICO', 960, 1250, 30, { w: 900, color: BLUE });
      const gk = sm(t, s4.lag - 0.2, s4.gat + 0.1, outBack); if (gk > 0) chip('LAGO GATÚN', 540, 660, 40, BLUE, gk);
      // cota 26 m
      const ck = sm(t, s4.erg - 0.2, s4.erg + 0.3); if (ck > 0) { ga(a * ck); ctx.strokeStyle = AMB; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(70, yl(0)); ctx.lineTo(70, yl(1)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(52, yl(1)); ctx.lineTo(88, yl(1)); ctx.moveTo(52, yl(0)); ctx.lineTo(88, yl(0)); ctx.stroke(); txt('26 M', 120, yl(0.55), 44, { w: 900, color: AMB }); ga(a); }
      chip('SOBE', 250, 580, 34, AMB, sm(t, s4.erg - 0.2, s4.erg + 0.2)); chip('DESCE', 730, 580, 34, TEAL, sm(t, s4.des - 0.2, s4.des + 0.2));
      ga(1);
      header(); fonte('Esquema fora de escala · Wikipedia / Olhar Digital');
    }
    // ================= CENA 5 — água e tempo =================
    function scene5(t, cam) {
      drawMap(cam, { hl: { PAN: [TEAL, 0.3] }, lake: 1, canal: 1 }, 0.55);
      const k = sm(t, s5.duz - 0.25, s5.duz + 0.1, outBack);
      if (k > 0) { panel(540, 650, 900, 460, k, WATER);
        // gota enchendo
        const f = sm(t, s5.duz, s5.lit + 0.3); ctx.save(); ctx.translate(-300, 0); ctx.beginPath(); ctx.moveTo(0, -120); ctx.bezierCurveTo(60, -40, 95, 10, 95, 50); ctx.arc(0, 50, 95, 0, Math.PI); ctx.bezierCurveTo(-95, 10, -60, -40, 0, -120); ctx.closePath(); ctx.lineWidth = 6; ctx.strokeStyle = WATER; ctx.stroke(); ctx.clip(); ctx.fillStyle = WATER; ctx.fillRect(-100, lerp(150, -125, f), 200, 300); ctx.restore();
        const n = Math.round(200 * sm(t, s5.duz - 0.1, s5.mil + 0.2)); rtxt(String(n), 120, -95, 140, { color: WH, scale: 1 + 0.06 * pulse(t, s5.lit) });
        txt('MILHÕES DE', 120, 20, 46, { w: 900, color: BLUE, a: prog(t, s5.mil - 0.2, s5.mil + 0.1) }); txt('LITROS', 120, 78, 46, { w: 900, color: BLUE, a: prog(t, s5.lit - 0.2, s5.lit + 0.1) });
        txt('DE ÁGUA DOCE POR NAVIO', 0, 170, 38, { w: 900, color: AMB, a: prog(t, s5.agu - 0.2, s5.doc + 0.1) }); endPanel(); }
      const k2 = sm(t, s5.tra - 0.2, s5.tra + 0.1, outBack);
      if (k2 > 0) { panel(540, 1080, 760, 230, k2, AMB); const f = sm(t, s5.dez - 0.2, s5.hor + 0.4);
        ctx.save(); ctx.translate(-240, 0); circ(0, 0, 70, null, 8, 'rgba(255,255,255,0.2)'); ctx.beginPath(); ctx.arc(0, 0, 70, -Math.PI / 2, -Math.PI / 2 + TAU * (10 / 12) * f); ctx.lineWidth = 10; ctx.strokeStyle = AMB; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
        rtxt('~10 HORAS', 90, -20, 82, { color: AMB }); txt('DE TRAVESSIA', 90, 60, 36, { w: 900 }); endPanel(); }
      header(); fonte('~200 mi L (Wikipedia) · 50 mi galões (Olhar Digital) · 8 a 10 h (Tico Times)');
    }
    // ================= CENA 6 — linha do tempo =================
    const TX0 = 140, TX1 = 940, TY = 470, MK = [1914, 1999], tx = y => lerp(TX0, TX1, (y - 1900) / (2010 - 1900));
    function scene6(t, cam) {
      const hp = sm(t, s6.mil - 0.1, s6.pan + 0.3), np = 0;
      drawMap(cam, { hl: { PAN: [TEAL, 0.35 + 0.65 * hp], USA: [BLUE, 0.6 * sm(t, s6.est - 0.2, s6.est + 0.3) * (1 - hp)] }, glow: hp > 0.5, canal: 1, canalW: 9 + 5 * np, canalCol: np > 0.5 ? AMB : TEAL }, 0.6);
      const yr = lerp(lerp(1914, 1999, hp), 2016, np);
      ga(sm(t, B[5], B[5] + 0.4)); rr(TX0, TY - 4, TX1 - TX0, 8, 4); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill(); rr(TX0, TY - 4, tx(yr) - TX0, 8, 4); ctx.fillStyle = TEAL; ctx.fill();
      for (const y of MK) { circ(tx(y), TY, 9, y <= yr + 0.01 ? TEAL : '#3a4660'); txt(String(y), tx(y), TY + 42, 30, { w: 900, color: y <= yr + 0.01 ? WH : MU }); } circ(tx(yr), TY, 15, WH, 4, TEAL); ga(1);
      const k1 = sm(t, s6.est - 0.2, s6.con + 0.1, outBack); if (k1 > 0 && hp < 0.5) { panel(540, 1080, 820, 230, k1 * (1 - hp * 2), BLUE); rtxt('1914', 0, -25, 96, { color: BLUE }); txt('CONSTRUÍDO PELOS EUA', 0, 62, 40, { w: 900 }); endPanel(); }
      if (hp >= 0.5 && np < 0.5) { const k = sm(t, s6.pan - 0.3, s6.pan + 0.05, outBack); panel(540, 1080, 820, 230, Math.max(k, 0.01) * (1 - np * 2), TEAL); rtxt(String(Math.round(lerp(1914, 1999, hp))), 0, -25, 96, { color: TEAL }); txt('PASSA PARA O PANAMÁ', 0, 62, 40, { w: 900 }); endPanel(); }
      header(); fonte('Wikipedia · Tico Times · Olhar Digital');
    }
    // ================= CENA 7 — CTA =================
    function scene7(t, cam) {
      drawMap(cam, { hl: { PAN: [TEAL, 1] }, canal: 1 }, 0.3);
      rtxt('QUAL CANAL', 540, 400, 92, { color: WH, scale: sm(t, s7.qua - 0.2, s7.qua + 0.15, outBack) });
      rtxt('VOCÊ QUER VER?', 540, 510, 84, { color: TEAL, scale: sm(t, s7.can - 0.2, s7.can + 0.15, outBack) });
      chip('COMENTA AQUI', 540, 670, 46, AMB, prog(t, s7.com - 0.15, s7.com + 0.2));
      const nk = sm(t, s7.ama - 0.2, s7.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 920); ctx.scale(nk, nk); rr(-430, -120, 860, 240, 26); ctx.fillStyle = 'rgba(7,11,20,0.88)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -60, 34, { w: 900, color: MU }); txt('QUEM CONTROLA AS', 0, 5, 56, { w: 900 }); txt('ROTAS MARÍTIMAS', 0, 72, 60, { w: 900, color: AMB, a: prog(t, s7.rot - 0.4, s7.rot) }); ctx.restore(); }
      const bk = sm(t, s7.seg - 0.2, s7.seg + 0.2, outBack), press = t > s7.per + 0.1; if (bk > 0) { ctx.save(); ctx.translate(540, 1220); const pr = bk * (1 - 0.06 * pulse(t, s7.per + 0.1, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header();
    }

    // ---------- legendas ----------
    const HL = new Set(['panama', 'vinte', 'seis', 'metros', 'canal', 'atlantico', 'pacifico', 'america', 'sul', 'semanas', 'oitenta', 'quilometros', 'mil', 'catorze', 'eclusas', 'gatun', 'duzentos', 'milhoes', 'litros', 'dez', 'horas', 'estados', 'unidos', 'noventa', 'nove', 'dezesseis', 'maiores', 'comenta', 'rotas', 'maritimas']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1640); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? AMB : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    function camAt(t, i) { if (i === 0) return CAMS[0]; return mix(CAMS[i - 1], CAMS[i], sm(t, B[i] - 0.1, B[i] + 0.9)); }
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; bg(t);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t, camAt(t, i)); ctx.restore(); scr(); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / 0.15); if (fl > 0) { ctx.globalAlpha = fl * 0.85; ctx.fillStyle = '#04060c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
