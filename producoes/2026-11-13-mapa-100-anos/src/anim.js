/*
 * COMO O MAPA DO MUNDO MUDOU EM 100 ANOS — Mindloop "o mundo em mapas e dados" (sex: mapas e transformações). 9:16, narrado.
 * Mapa: Natural Earth 50m via pipeline/geo_paises.py mundo (lat_ref 0). Impérios simplificados com as fronteiras de hoje.
 * Neutro: sem bandeiras, sem rostos, sem violência. Fontes: ONU, Britannica, ASC Leiden, Library of Congress.
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
  const AMB = '#f2b84b', TEAL = '#2ec4b6', WH = '#f3f5fa', MU = '#8a95ad', RED = '#ff5d6c', BLUE = '#5fb4ff', VIO = '#b58cff', GREEN = '#7bd88f';

  // impérios por volta de 1926 (aproximado, com as fronteiras atuais)
  const BRIT = ['GBR', 'IRL', 'CAN', 'AUS', 'NZL', 'ZAF', 'NAM', 'IND', 'PAK', 'BGD', 'MMR', 'LKA', 'MYS', 'SGP', 'BRN', 'NGA', 'GHA', 'SLE', 'GMB', 'KEN', 'UGA', 'TZA', 'ZMB', 'ZWE', 'MWI', 'BWA', 'LSO', 'SWZ', 'SDN', 'SSD', 'SOL', 'IRQ', 'JOR', 'ISR', 'PSE', 'CYP', 'MLT', 'GUY', 'BLZ', 'JAM', 'TTO', 'BHS', 'PNG', 'FJI', 'KWT', 'QAT', 'ARE', 'BHR'];
  const FRAN = ['FRA', 'DZA', 'TUN', 'MAR', 'MRT', 'SEN', 'MLI', 'NER', 'TCD', 'BFA', 'GIN', 'CIV', 'BEN', 'TGO', 'CMR', 'GAB', 'COG', 'CAF', 'MDG', 'DJI', 'COM', 'VNM', 'LAO', 'KHM', 'SYR', 'LBN'];
  const OUTR = ['PRT', 'AGO', 'MOZ', 'GNB', 'CPV', 'STP', 'TLS', 'BEL', 'COD', 'RWA', 'BDI', 'NLD', 'IDN', 'SUR', 'ITA', 'LBY', 'ERI', 'SOM', 'ESP', 'ESH', 'GNQ'];
  const AF60 = ['CMR', 'TGO', 'MDG', 'COD', 'SOM', 'BEN', 'NER', 'BFA', 'CIV', 'TCD', 'CAF', 'COG', 'GAB', 'SEN', 'MLI', 'NGA', 'MRT']; // ordem cronológica de 1960
  const USSR = ['RUS', 'UKR', 'BLR', 'MDA', 'EST', 'LVA', 'LTU', 'GEO', 'ARM', 'AZE', 'KAZ', 'UZB', 'TKM', 'KGZ', 'TJK'];
  const USSR_C = ['#e9edf5', '#f2b84b', '#7bd88f', '#5fb4ff', '#b58cff', '#2ec4b6', '#ff8fd1', '#ffd36b', '#9be15d', '#6bc6ff', '#ff9f5a', '#c59bff', '#57e0c3', '#f7e26b', '#ff7aa8'];
  const LBL = { RUS: [95, 62], KAZ: [67, 48], UKR: [31, 49], UZB: [64, 41.5], IND: [79, 22], PAK: [69, 29], BGD: [90, 24] };

  function create(TL, env) {
    const WORLD = env.mundo || require('../assets/mundo.json');
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
    function circ(x, y, r, fill, lw = 0, sc = WH) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function chip(s, x, y, size, col, k, o = {}) { if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1)); rr(-w / 2 + 6, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1); }
    function panel(x, y, w, h, k, col) { const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); rr(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(7,11,20,0.9)'; ctx.fill(); if (col) { ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); } }
    const endPanel = () => { ctx.restore(); ga(1); };
    function bg(t) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(95,180,255,0.05)'; ctx.lineWidth = 2; const off = (t * 20) % 80; for (let x = -80 + off; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -80 + off; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    function header() { ga(0.9); rr(250, 110, 580, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); txt('O MUNDO EM MAPAS E DADOS', 540, 141, 26, { w: 800, color: MU }); ga(1); }
    function fonte(s) { txt(s, 540, 1800, 24, { w: 600, color: 'rgba(255,255,255,0.45)' }); }

    // ---------- mapa ----------
    const R_MAP = [0, 330, W, 900];
    const box = (lo0, lo1, la0, la1, R = R_MAP) => { const K = 1, x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(R[2] / (x1 - x0), R[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, K, R }; };
    const mix = (a, b, k) => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), K: 1, R: a.R });
    const toS = (cam, x, y) => [cam.R[0] + cam.R[2] / 2 + (x - cam.cx) * cam.s, cam.R[1] + cam.R[3] / 2 + (y - cam.cy) * cam.s];
    function drawMap(cam, style, a = 1) {
      const R = cam.R; ctx.save(); ga(a); ctx.beginPath(); ctx.rect(R[0], R[1], R[2], R[3]); ctx.clip();
      ctx.fillStyle = SEA; ctx.fillRect(R[0], R[1], R[2], R[3]);
      ctx.translate(R[0] + R[2] / 2, R[1] + R[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      const glows = [];
      for (const p of WORLD.paises) { const st = style(p.iso) || {}; ctx.beginPath(); for (const pl of p.poly) { pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
        if (st.a !== undefined) { ctx.fillStyle = LAND; ctx.fill(); ctx.globalAlpha = a * st.a; } ctx.fillStyle = st.fill || LAND; ctx.fill(); ctx.globalAlpha = a; ctx.lineWidth = (st.lw || 1.2) / cam.s; ctx.strokeStyle = st.edge || EDGE; ctx.stroke(); if (st.glow) glows.push([p, st]); }
      for (const [p, st] of glows) { ctx.save(); ctx.shadowColor = st.glow; ctx.shadowBlur = 40; ctx.beginPath(); for (const pl of p.poly) { pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } ctx.fillStyle = st.fill; ctx.fill(); ctx.lineWidth = (st.lw || 2) / cam.s; ctx.strokeStyle = st.edge || WH; ctx.stroke(); ctx.restore(); }
      ctx.restore(); ga(1);
      const fg = ctx.createLinearGradient(0, R[1], 0, R[1] + 110); fg.addColorStop(0, 'rgba(15,23,38,1)'); fg.addColorStop(1, 'rgba(15,23,38,0)'); ctx.fillStyle = fg; ctx.fillRect(0, R[1], W, 110);
      const fb = ctx.createLinearGradient(0, R[1] + R[3] - 150, 0, R[1] + R[3]); fb.addColorStop(0, 'rgba(7,11,20,0)'); fb.addColorStop(1, 'rgba(7,11,20,1)'); ctx.fillStyle = fb; ctx.fillRect(0, R[1] + R[3] - 150, W, 150);
    }
    const lab = iso => (LBL[iso] ? [LBL[iso][0], -LBL[iso][1]] : (WORLD.paises.find(p => p.iso === iso) || {}).label);
    function tagAt(cam, iso, s, col, k, size = 30, dy = 0) { if (k <= 0) return; const lb = lab(iso); if (!lb) return; const [x, y] = toS(cam, lb[0], lb[1]); chip(s, x, y + dy, size, col, k); }

    const CAM_W = box(-150, 175, -50, 80), CAM_SAS = box(55, 105, 3, 40), CAM_AF = box(-22, 55, -38, 40), CAM_SU = box(8, 172, 32, 80), CAM_SS = box(14, 44, -2, 24);
    const CAMS = [CAM_W, CAM_W, CAM_SAS, CAM_AF, CAM_SU, CAM_SS, CAM_W];
    function camAt(t, i) { if (i === 0) return CAMS[0]; return mix(CAMS[i - 1], CAMS[i], sm(t, B[i] - 0.1, B[i] + 0.9)); }

    // ---------- linha do tempo (topo) ----------
    const TX0 = 110, TX1 = 970, TY = 250, tx = y => lerp(TX0, TX1, (y - 1926) / 100);
    const MARKS = [[1945, 'ONU'], [1947, ''], [1960, ''], [1991, ''], [2011, '']];
    function timeline(t, year, a = 1) { ga(a * 0.95); rr(TX0, TY - 4, TX1 - TX0, 8, 4); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill(); rr(TX0, TY - 4, tx(year) - TX0, 8, 4); ctx.fillStyle = AMB; ctx.fill();
      txt('1926', TX0, TY + 34, 24, { w: 800, color: MU }); txt('2026', TX1, TY + 34, 24, { w: 800, color: MU });
      for (const [y] of MARKS) circ(tx(y), TY, 7, y <= year + 0.01 ? AMB : '#3a4660');
      circ(tx(year), TY, 14, WH, 4, AMB); ga(1); }
    let YEAR = 1926;

    // ---------- tempos ----------
    const s1 = { mil: wt('c1', 'mil'), onu: wt('c1', 'onu'), cin: wt('c1', 'cinquenta'), pai: wt('c1', 'paises'), hoj: wt('c1', 'hoje'), cen: wt('c1', 'cento'), tre: wt('c1', 'tres'), ond: wt('c1', 'onde'), tan: wt('c1', 'tanto'), pais: wt('c1', 'pais', 1) };
    const s2 = { cem: wt('c2', 'cem'), imp: wt('c2', 'imperios'), eur: wt('c2', 'europeus'), map: wt('c2', 'mapa'), bri: wt('c2', 'britanico'), qua: wt('c2', 'quase'), qrt: wt('c2', 'quarto'), ter: wt('c2', 'terras') };
    const s3 = { mil: wt('c3', 'mil'), set: wt('c3', 'sete'), ind: wt('c3', 'india'), paq: wt('c3', 'paquistao'), inde: wt('c3', 'independentes') };
    const s4 = { mil: wt('c4', 'mil'), ses: wt('c4', 'sessenta'), ano: wt('c4', 'ano'), afr: wt('c4', 'africa'), dez: wt('c4', 'dezessete'), inde: wt('c4', 'independencia') };
    const s5 = { mil: wt('c5', 'mil'), um: wt('c5', 'um'), uni: wt('c5', 'uniao'), aca: wt('c5', 'acabou'), vir: wt('c5', 'virou'), qui: wt('c5', 'quinze'), pai: wt('c5', 'paises') };
    const s6 = { nov: wt('c6', 'novo'), onu: wt('c6', 'onu'), sud: wt('c6', 'sudao'), sul: wt('c6', 'sul'), doi: wt('c6', 'dois'), onz: wt('c6', 'onze') };
    const s7 = { qua: wt('c7', 'qual'), sur: wt('c7', 'surpreendeu'), com: wt('c7', 'comenta'), ama: wt('c7', 'amanha'), que: wt('c7', 'queda'), rom: wt('c7', 'romano'), seg: wt('c7', 'segue'), per: wt('c7', 'perder') };

    cue(0, 'music', { part: 'intro' }); cue(s1.onu, 'stamp', { gain: 0.6 }); cue(s1.cin, 'pop'); cue(s1.cen, 'riser', { dur: 1.0 }); cue(s1.tre, 'impact', { gain: 0.8 }); cue(s1.ond, 'whoosh', { dur: 0.3 });
    cue(B[1], 'music', { part: 'groove' }); cue(s2.imp, 'scan', { dur: 1.2, gain: 0.5 }); cue(s2.bri, 'ding'); cue(s2.qrt, 'stamp', { gain: 0.6 });
    cue(s3.ind, 'pop'); cue(s3.paq, 'pop'); cue(s3.inde, 'sparkle');
    for (let i = 0; i < 17; i++) cue(lerp(s4.dez - 0.1, s4.inde + 0.3, i / 16), 'pop', { gain: 0.35 }); cue(s4.inde + 0.5, 'tada');
    cue(s5.aca, 'crack', { gain: 0.6 }); for (let i = 0; i < 15; i++) cue(lerp(s5.vir, s5.pai + 0.2, i / 14), 'tick', { dur: 0.08, gain: 0.4 });
    cue(s6.sud, 'impact', { gain: 0.6 }); cue(s6.onz, 'ding');
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.rom, 'whoosh', { dur: 0.4 }); cue(s7.per + 0.1, 'tap'); cue(s7.per + 0.15, 'success');
    for (const k of [1, 2, 3, 4, 5, 6]) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.45 });

    const ORD = {}; { const lst = WORLD.paises.map(p => [p.iso, p.label ? p.label[0] : 0]).sort((a, b) => a[1] - b[1]); lst.forEach(([iso], i) => (ORD[iso] = i / (lst.length - 1))); }
    const SB = new Set(BRIT), SF = new Set(FRAN), SO = new Set(OUTR);
    const empireCol = iso => (SB.has(iso) ? AMB : SF.has(iso) ? BLUE : SO.has(iso) ? VIO : null);
    const yearBig = (s, k, col = WH) => rtxt(s, 540, 1140, 150, { color: col, scale: k, glow: 'rgba(242,184,75,0.35)' });

    // ================= CENA 1 — 51 → 193 =================
    function scene1(t, cam) {
      const w = prog(t, s1.cen - 0.2, s1.tre + 0.3);
      drawMap(cam, iso => { const k = clamp((w - ORD[iso] * 0.85) * 6); if (k <= 0) return null; return { fill: `rgba(46,196,182,${0.55 * k})`, edge: TEAL, lw: 1.2 }; });
      const yr = t < s1.hoj - 0.1 ? 1945 : lerp(1945, 2026, sm(t, s1.hoj - 0.1, s1.hoj + 0.5)); YEAR = yr;
      timeline(t, yr, prog(t, 0.1, 0.5));
      // ano
      const lab1 = t < s1.hoj - 0.1 ? '1945' : 'HOJE';
      chip(lab1, 540, 380, 44, t < s1.hoj - 0.1 ? AMB : TEAL, t < s1.hoj - 0.1 ? sm(t, s1.mil - 0.2, s1.mil + 0.15) : prog(t, s1.hoj - 0.1, s1.hoj + 0.2));
      // contador
      const ck = sm(t, s1.cin - 0.25, s1.cin + 0.1, outBack);
      if (ck > 0) { const n = t < s1.cen - 0.1 ? 51 : Math.round(lerp(51, 193, outC(prog(t, s1.cen - 0.1, s1.tre + 0.2)))); const col = n === 193 ? TEAL : WH;
        panel(540, 1150, 760, 300, ck, n === 193 ? TEAL : AMB); rtxt(String(n), 0, -30, 190, { color: col, glow: n === 193 ? 'rgba(46,196,182,0.6)' : null, scale: 1 + 0.1 * pulse(t, s1.tre + 0.2) }); txt('PAÍSES NA ONU', 0, 100, 46, { w: 900, color: MU }); endPanel(); }
      const qk = sm(t, s1.ond - 0.2, s1.ond + 0.15, outBack);
      if (qk > 0) { panel(540, 560, 900, 150, qk, AMB); txt('DE ONDE SAIU TANTO PAÍS?', 0, 3, 54, { w: 900, color: AMB }); endPanel(); }
      header(); fonte('ONU · membros em 1945 e em 2026');
    }
    // ================= CENA 2 — impérios de 1926 =================
    function scene2(t, cam) {
      YEAR = 1926; timeline(t, 1926);
      const w = prog(t, s2.imp - 0.1, s2.map + 0.2), hb = pulse(t, s2.bri, 0.1, 1.2), dim = prog(t, s2.bri - 0.1, s2.bri + 0.3);
      drawMap(cam, iso => { const c = empireCol(iso); if (!c) return null; const k = clamp((w - ORD[iso] * 0.8) * 5); if (k <= 0) return null; const isB = c === AMB; const a = isB ? 1 : 1 - 0.55 * dim; return { fill: c, edge: INK, lw: 0.8, glow: isB && hb > 0.15 ? AMB : null, a } ; });
      chip('1926', 540, 380, 44, AMB, sm(t, s2.cem - 0.25, s2.cem + 0.1));
      // legenda
      const lk = prog(t, s2.eur - 0.2, s2.eur + 0.2);
      if (lk > 0) { ga(lk); [[AMB, 'BRITÂNICO'], [BLUE, 'FRANCÊS'], [VIO, 'OUTROS EUROPEUS']].forEach(([c, s], i) => { const x = [150, 420, 660][i]; rr(x, 1000, 34, 34, 8); ctx.fillStyle = c; ctx.fill(); txt(s, x + 48, 1018, 30, { w: 800, align: 'left' }); }); ga(1); }
      const qk = sm(t, s2.qua - 0.2, s2.qrt + 0.1, outBack);
      if (qk > 0) { panel(540, 1220, 840, 250, qk, AMB); rtxt('≈ 1/4', 0, -40, 130, { color: AMB }); txt('DAS TERRAS DO PLANETA', 0, 75, 44, { w: 900 }); endPanel(); }
      header(); fonte('Império Britânico c. 1920: ~35 mi km² · mapa aproximado, fronteiras atuais');
    }
    // ================= CENA 3 — 1947 Índia e Paquistão =================
    function scene3(t, cam) {
      YEAR = lerp(1926, 1947, sm(t, B[2], B[2] + 0.8)); timeline(t, YEAR);
      const ki = prog(t, s3.ind - 0.15, s3.ind + 0.3), kp = prog(t, s3.paq - 0.15, s3.paq + 0.3);
      drawMap(cam, iso => { if (iso === 'IND') return ki > 0 ? { fill: TEAL, edge: WH, lw: 2, glow: pulse(t, s3.ind) > 0.2 ? TEAL : null } : { fill: AMB, edge: INK }; if (iso === 'PAK' || iso === 'BGD') return kp > 0 ? { fill: GREEN, edge: WH, lw: 2, glow: pulse(t, s3.paq) > 0.2 ? GREEN : null } : { fill: AMB, edge: INK }; if (SB.has(iso)) return { fill: 'rgba(242,184,75,0.35)', edge: INK }; return null; });
      yearBig('1947', sm(t, s3.mil - 0.2, s3.set + 0.1, outBack));
      tagAt(cam, 'IND', 'ÍNDIA', TEAL, ki, 38); tagAt(cam, 'PAK', 'PAQUISTÃO', GREEN, kp, 34);
      tagAt(cam, 'BGD', 'atual Bangladesh', GREEN, prog(t, s3.paq + 0.3, s3.paq + 0.6), 22, 60);
      const ik = sm(t, s3.inde - 0.2, s3.inde + 0.15, outBack); if (ik > 0) chip('INDEPENDENTES', 540, 1300, 48, TEAL, ik);
      header(); fonte('Independência em agosto de 1947 · o Paquistão incluía o atual Bangladesh');
    }
    // ================= CENA 4 — 1960, Ano da África =================
    function scene4(t, cam) {
      YEAR = lerp(1947, 1960, sm(t, B[3], B[3] + 0.8)); timeline(t, YEAR);
      const t0 = s4.dez - 0.1, t1 = s4.inde + 0.3, tk = i => lerp(t0, t1, i / 16), idx = {}; AF60.forEach((c, i) => (idx[c] = i));
      drawMap(cam, iso => { const i = idx[iso]; if (i !== undefined) { const k = prog(t, tk(i), tk(i) + 0.15); if (k > 0) return { fill: TEAL, edge: WH, lw: 1.6, glow: pulse(t, tk(i), 0.05, 0.4) > 0.3 ? TEAL : null }; return { fill: SF.has(iso) ? 'rgba(95,180,255,0.45)' : SB.has(iso) ? 'rgba(242,184,75,0.45)' : 'rgba(181,140,255,0.45)', edge: INK }; } return null; });
      chip('ANO DA ÁFRICA', 540, 400, 42, AMB, prog(t, s4.ano - 0.2, s4.afr + 0.1));
      const n = AF60.filter((c, i) => t >= tk(i)).length;
      const ck = sm(t, s4.mil - 0.2, s4.ses + 0.1, outBack);
      if (ck > 0) { panel(540, 1170, 720, 270, ck, TEAL); rtxt('1960', 0, -50, 110, { color: WH }); txt(n > 0 ? `${n} PAÍSES INDEPENDENTES` : 'ÁFRICA', 0, 70, 44, { w: 900, color: n > 0 ? TEAL : MU, scale: 1 + 0.06 * pulse(t, tk(Math.max(0, n - 1)), 0.03, 0.2) }); endPanel(); }
      header(); fonte('17 independências em 1960 · ASC Leiden / Library of Congress');
    }
    // ================= CENA 5 — 1991, fim da URSS =================
    function scene5(t, cam) {
      YEAR = lerp(1960, 1991, sm(t, B[4], B[4] + 0.8)); timeline(t, YEAR);
      const t0 = s5.vir, t1 = s5.pai + 0.2, tk = i => lerp(t0, t1, i / 14), idx = {}; USSR.forEach((c, i) => (idx[c] = i));
      const shake = pulse(t, s5.aca, 0.05, 0.3);
      drawMap(cam, iso => { const i = idx[iso]; if (i === undefined) return null; const split = t >= tk(i); return split ? { fill: USSR_C[i], edge: INK, lw: 2.5, glow: pulse(t, tk(i), 0.05, 0.4) > 0.3 ? USSR_C[i] : null } : { fill: shake > 0.2 ? '#ff8a96' : RED, edge: RED, lw: 1 }; });
      const n = USSR.filter((c, i) => t >= tk(i)).length;
      chip(n === 0 ? 'UNIÃO SOVIÉTICA' : n < 15 ? 'SE DIVIDINDO…' : '15 PAÍSES', 540, 400, 42, n === 15 ? AMB : RED, prog(t, s5.uni - 0.2, s5.uni + 0.2));
      if (n >= 15) { tagAt(cam, 'RUS', 'RÚSSIA', USSR_C[0], prog(t, t1, t1 + 0.3), 30); tagAt(cam, 'KAZ', 'CAZAQUISTÃO', USSR_C[10], prog(t, t1 + 0.1, t1 + 0.4), 24); tagAt(cam, 'UKR', 'UCRÂNIA', USSR_C[1], prog(t, t1 + 0.2, t1 + 0.5), 24); }
      const ck = sm(t, s5.mil - 0.2, s5.um + 0.1, outBack);
      if (ck > 0) { panel(540, 1170, 720, 270, ck, n ? AMB : RED); rtxt('1991', 0, -50, 110, { color: WH }); rtxt(n ? `1 → ${n}` : '1 PAÍS', 0, 70, 80, { color: n ? AMB : RED, scale: 1 + 0.06 * pulse(t, tk(Math.max(0, n - 1)), 0.03, 0.2) }); endPanel(); }
      header(); fonte('Dezembro de 1991 · Britannica');
    }
    // ================= CENA 6 — Sudão do Sul, 2011 =================
    function scene6(t, cam) {
      YEAR = lerp(1991, 2011, sm(t, B[5], B[5] + 0.8)); timeline(t, YEAR);
      const k = prog(t, s6.sud - 0.15, s6.sud + 0.3);
      drawMap(cam, iso => (iso === 'SSD' ? (k > 0 ? { fill: TEAL, edge: WH, lw: 3, glow: TEAL } : { fill: '#3a4660', edge: EDGE }) : iso === 'SDN' ? { fill: '#3a4660', edge: k > 0 ? WH : EDGE, lw: 2 } : null));
      chip('O MAIS NOVO DA ONU', 540, 400, 42, AMB, prog(t, s6.nov - 0.2, s6.onu + 0.1));
      tagAt(cam, 'SSD', 'SUDÃO DO SUL', TEAL, k, 36, -10); tagAt(cam, 'SDN', 'SUDÃO', '#c9d3e3', prog(t, s6.sul, s6.sul + 0.3), 28);
      const ck = sm(t, s6.doi - 0.2, s6.onz + 0.1, outBack);
      if (ck > 0) { panel(540, 1170, 720, 270, ck, TEAL); rtxt('2011', 0, -50, 110, { color: WH }); txt('193º MEMBRO', 0, 70, 56, { w: 900, color: TEAL }); endPanel(); }
      header(); fonte('ONU · Sudão do Sul admitido em 14/07/2011');
    }
    // ================= CENA 7 — CTA =================
    function scene7(t, cam) {
      drawMap(cam, iso => { const c = empireCol(iso); return c ? { fill: c } : null; }, 0.3);
      rtxt('QUAL MUDANÇA', 540, 400, 92, { color: WH, scale: sm(t, s7.qua - 0.2, s7.qua + 0.15, outBack) });
      rtxt('TE SURPREENDEU?', 540, 510, 92, { color: AMB, scale: sm(t, s7.sur - 0.2, s7.sur + 0.15, outBack) });
      chip('COMENTA AQUI', 540, 670, 46, AMB, prog(t, s7.com - 0.15, s7.com + 0.2));
      const nk = sm(t, s7.ama - 0.2, s7.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 920); ctx.scale(nk, nk); rr(-430, -120, 860, 240, 26); ctx.fillStyle = 'rgba(7,11,20,0.88)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -60, 34, { w: 900, color: MU }); txt('A QUEDA DO', 0, 5, 60, { w: 900 }); txt('IMPÉRIO ROMANO', 0, 72, 60, { w: 900, color: AMB, a: prog(t, s7.rom - 0.4, s7.rom) }); ctx.restore(); }
      const bk = sm(t, s7.seg - 0.2, s7.seg + 0.2, outBack), press = t > s7.per + 0.1; if (bk > 0) { ctx.save(); ctx.translate(540, 1220); const pr = bk * (1 - 0.06 * pulse(t, s7.per + 0.1, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header();
    }

    // ---------- legendas ----------
    const HL = new Set(['onu', 'cinquenta', 'cento', 'noventa', 'tres', 'imperios', 'europeus', 'britanico', 'quarto', 'india', 'paquistao', 'independentes', 'africa', 'dezessete', 'independencia', 'uniao', 'sovietica', 'quinze', 'sudao', 'sul', 'onze', 'surpreendeu', 'comenta', 'romano']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1640); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? AMB : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
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
