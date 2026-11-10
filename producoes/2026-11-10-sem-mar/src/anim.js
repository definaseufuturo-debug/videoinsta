/*
 * PAÍSES SEM ACESSO AO MAR — Mindloop "o mundo em mapas e dados" (curiosidades geográficas). 9:16, narrado.
 * Mapas: Natural Earth 50m via pipeline/geo_paises.py (mundo.json lat_ref 0, asia.json lat_ref 44, sam.json, eu.json).
 * Neutro: sem bandeiras, sem rostos. Âmbar = sem litoral; azul = mar; verde-azulado = vizinhos citados.
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
  const AMB = '#f2b84b', AMB2 = '#7a5a22', TEAL = '#2ec4b6', WH = '#f3f5fa', MU = '#8a95ad', RED = '#ff4d5e', BLUE = '#5fb4ff';
  const AF = ['BWA', 'BFA', 'BDI', 'CAF', 'TCD', 'ETH', 'LSO', 'MWI', 'MLI', 'NER', 'RWA', 'SSD', 'SWZ', 'UGA', 'ZMB', 'ZWE'];
  const AS = ['AFG', 'ARM', 'AZE', 'BTN', 'KAZ', 'KGZ', 'LAO', 'MNG', 'NPL', 'TJK', 'TKM', 'UZB'];
  const EU = ['AND', 'AUT', 'BLR', 'CZE', 'HUN', 'LIE', 'LUX', 'MKD', 'MDA', 'SMR', 'SRB', 'SVK', 'CHE', 'VAT'];
  const SA = ['BOL', 'PRY'];
  const ALL = [...AF, ...AS, ...EU, ...SA], LL = new Set(ALL);

  function create(TL, env) {
    const WORLD = env.mundo || require('../assets/mundo.json'), ASIA = env.asia || require('../assets/asia.json');
    const SAM = env.sam || require('../assets/sam.json'), EUR = env.eu || require('../assets/eu.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 6;
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
    function chip(s, x, y, size, col, k, o = {}) { if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1)); rr(-w / 2 + 6, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1); }
    function panel(x, y, w, h, k, col) { const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); rr(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(7,11,20,0.9)'; ctx.fill(); if (col) { ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); } }
    const endPanel = () => { ctx.restore(); ga(1); };
    function bg(t) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(95,180,255,0.05)'; ctx.lineWidth = 2; const off = (t * 20) % 80; for (let x = -80 + off; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -80 + off; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    function header() { ga(0.9); rr(250, 110, 580, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); txt('O MUNDO EM MAPAS E DADOS', 540, 141, 26, { w: 800, color: MU }); ga(1); }
    function fonte(s) { txt(s, 540, 1800, 24, { w: 600, color: 'rgba(255,255,255,0.45)' }); }

    // ---------- mapa ----------
    const R_FULL = [0, 330, W, 1120];
    const box = (data, lo0, lo1, la0, la1, R = R_FULL) => { const K = Math.cos(data.lat_ref * Math.PI / 180), x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(R[2] / (x1 - x0), R[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, K, R }; };
    const mix = (a, b, k) => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), K: a.K, R: a.R });
    const toS = (cam, x, y) => [cam.R[0] + cam.R[2] / 2 + (x - cam.cx) * cam.s, cam.R[1] + cam.R[3] / 2 + (y - cam.cy) * cam.s];
    const ll = (cam, lon, lat) => toS(cam, lon * cam.K, -lat);
    function drawMap(data, cam, style, a = 1, o = {}) {
      const R = cam.R; ctx.save(); ga(a); ctx.beginPath(); if (o.round) rr(R[0], R[1], R[2], R[3], 28); else ctx.rect(R[0], R[1], R[2], R[3]); ctx.clip();
      ctx.fillStyle = SEA; ctx.fillRect(R[0], R[1], R[2], R[3]);
      ctx.translate(R[0] + R[2] / 2, R[1] + R[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      for (const p of data.paises) { const st = style(p.iso) || {}; ctx.beginPath(); for (const pl of p.poly) { pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
        if (st.glow) { ctx.save(); ctx.shadowColor = st.glow; ctx.shadowBlur = 40; ctx.fillStyle = st.fill; ctx.fill(); ctx.restore(); }
        ctx.fillStyle = st.fill || LAND; ctx.fill(); ctx.lineWidth = (st.lw || 1.4) / cam.s; ctx.strokeStyle = st.edge || EDGE; ctx.stroke(); }
      ctx.restore(); ga(1);
      if (!o.noFade) { const fg = ctx.createLinearGradient(0, R[1], 0, R[1] + 120); fg.addColorStop(0, 'rgba(15,23,38,1)'); fg.addColorStop(1, 'rgba(15,23,38,0)'); ctx.fillStyle = fg; ctx.fillRect(0, R[1], W, 120);
        const fb = ctx.createLinearGradient(0, R[1] + R[3] - 160, 0, R[1] + R[3]); fb.addColorStop(0, 'rgba(7,11,20,0)'); fb.addColorStop(1, 'rgba(7,11,20,1)'); ctx.fillStyle = fb; ctx.fillRect(0, R[1] + R[3] - 160, W, 160); }
    }
    const lab = (data, iso) => (data.paises.find(p => p.iso === iso) || {}).label;
    const CAM_W = box(WORLD, -95, 150, -42, 62), CAM_AF = box(WORLD, -20, 55, -36, 30), CAM_KZ = box(ASIA, 44, 92, 33, 57), CAM_SA = box(SAM, -82, -45, -36, 0);
    // ordem de acendimento (oeste → leste) na cena 1
    const ORD = {}; { const lst = ALL.map(iso => [iso, (lab(WORLD, iso) || [0])[0]]).sort((a, b) => a[1] - b[1]); lst.forEach(([iso], i) => (ORD[iso] = i / (lst.length - 1))); }

    // ---------- tempos ----------
    const s1 = { qua: wt('c1', 'quarenta'), pai: wt('c1', 'paises'), lit: wt('c1', 'litoral'), pra: wt('c1', 'praia'), por: wt('c1', 'porto') };
    const s2 = { afr: wt('c2', 'africa'), dez: wt('c2', 'dezesseis'), qua: wt('c2', 'qualquer'), eti: wt('c2', 'etiopia'), pop: wt('c2', 'populoso') };
    const s3 = { mai: wt('c3', 'maior'), caz: wt('c3', 'cazaquistao'), doi: wt('c3', 'dois'), mil: wt('c3', 'milhoes'), qui: wt('c3', 'quilometros'), oce: wt('c3', 'oceano') };
    const s4 = { ame: wt('c4', 'america'), par: wt('c4', 'paraguai'), bol: wt('c4', 'bolivia'), bo2: wt('c4', 'bolivia', 1), per: wt('c4', 'perdeu'), chi: wt('c4', 'chile'), gue: wt('c4', 'guerra'), sec: wt('c4', 'seculo') };
    const s5 = { dup: wt('c5', 'duplamente'), lie: wt('c5', 'liechtenstein'), uzb: wt('c5', 'uzbequistao'), tod: wt('c5', 'todos'), viz: wt('c5', 'vizinhos'), lit: wt('c5', 'litoral') };
    const s6 = { qua: wt('c6', 'qual'), sur: wt('c6', 'surpreendeu'), com: wt('c6', 'comenta'), ama: wt('c6', 'amanha'), fro: wt('c6', 'fronteiras'), seg: wt('c6', 'segue'), per: wt('c6', 'perder') };
    const LIT1 = [s1.qua, s1.lit + 0.2];
    cue(0, 'music', { part: 'intro' }); cue(s1.qua, 'scan', { dur: 1.6, gain: 0.5 }); cue(s1.lit, 'impact', { gain: 0.8 }); cue(s1.pra, 'pop'); cue(s1.por, 'pop');
    cue(B[1], 'music', { part: 'groove' }); cue(s2.dez, 'stamp'); cue(s2.eti, 'ding'); cue(s2.pop, 'sparkle');
    cue(s3.caz, 'impact', { gain: 0.6 }); cue(s3.doi, 'riser', { dur: 0.6 }); cue(s3.qui, 'stamp', { gain: 0.6 }); cue(s3.oce, 'water', { dur: 1.0 });
    cue(s4.par, 'pop'); cue(s4.bol, 'pop'); cue(s4.per, 'swoosh'); cue(s4.chi, 'ding', { gain: 0.6 }); cue(s4.gue, 'tick', { dur: 0.3 });
    cue(s5.dup, 'stamp'); cue(s5.lie, 'pop'); cue(s5.uzb, 'pop'); cue(s5.viz, 'scan', { dur: 0.8, gain: 0.5 });
    cue(B[5], 'music', { part: 'outro' }); cue(s6.com, 'notif'); cue(s6.fro, 'whoosh', { dur: 0.4 }); cue(s6.per + 0.1, 'tap'); cue(s6.per + 0.15, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    const lit1 = (t, iso) => prog(t, lerp(LIT1[0], LIT1[1], ORD[iso]) - 0.1, lerp(LIT1[0], LIT1[1], ORD[iso]) + 0.15);
    const styleLL = k => iso => { if (!LL.has(iso)) return null; const v = typeof k === 'function' ? k(iso) : k; if (v <= 0) return null; return { fill: v >= 1 ? AMB : AMB2, edge: AMB, lw: 1.6, glow: v >= 1 ? 'rgba(242,184,75,0.35)' : null }; };
    function dots(cam, data, isos, k, col = AMB) { for (const iso of isos) { const kk = typeof k === 'function' ? k(iso) : k; if (kk <= 0) continue; const lb = lab(data, iso); if (!lb) continue; const [x, y] = toS(cam, lb[0], lb[1]); circ(x, y, 7 * outBack(kk), col, 2, INK); } }
    function scene1(t) {
      const cam = CAM_W;
      drawMap(WORLD, cam, styleLL(iso => lit1(t, iso)));
      dots(cam, WORLD, ['AND', 'LIE', 'SMR', 'VAT', 'LUX'], iso => lit1(t, iso));
      const n = Math.round(44 * outC(prog(t, s1.qua - 0.1, s1.lit + 0.2)));
      rtxt(`${n}`, 540, 360, 230, { color: AMB, glow: 'rgba(242,184,75,0.6)', scale: sm(t, 0.05, 0.45, outBack) });
      rtxt('PAÍSES SEM LITORAL', 540, 520, 70, { color: WH, scale: sm(t, s1.pai - 0.2, s1.pai + 0.15, outBack) });
      // sem praia, sem porto
      const items = [[s1.pra, 'PRAIA', 300], [s1.por, 'PORTO', 780]];
      items.forEach(([tt, s, x]) => { const k = sm(t, tt - 0.2, tt + 0.15, outBack); if (k <= 0) return; ctx.save(); ctx.translate(x, 1300); ctx.scale(k, k); rr(-190, -60, 380, 120, 60); ctx.fillStyle = 'rgba(7,11,20,0.9)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = RED; ctx.stroke(); txt(s, 20, 3, 50, { w: 900 }); txt('×', -125, 0, 70, { w: 900, color: RED }); ctx.restore(); });
      header(); fonte('Britannica · World Atlas');
    }
    function scene2(t) {
      const cam = mix(CAM_W, CAM_AF, sm(t, B[1], B[1] + 1.0)), af = new Set(AF);
      const ek = prog(t, s2.eti - 0.2, s2.eti + 0.2);
      drawMap(WORLD, cam, iso => iso === 'ETH' && ek > 0 ? { fill: AMB, edge: WH, lw: 4 * (1 + 0.5 * pulse(t, s2.eti)), glow: 'rgba(242,184,75,0.9)' } : af.has(iso) ? { fill: ek > 0 ? '#c9963c' : AMB, edge: AMB, lw: 1.6 } : null);
      const n = Math.round(16 * outC(prog(t, s2.dez - 0.15, s2.dez + 0.5)));
      rtxt(`${n}`, 250, 420, 190, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s2.dez - 0.2, s2.dez + 0.15, outBack) });
      txt('NA ÁFRICA', 250, 545, 46, { w: 900, stroke: 12, a: prog(t, s2.dez, s2.dez + 0.3) });
      // ranking por continente
      const R = [['ÁFRICA', 16, AMB], ['EUROPA', 14, '#c9a35a'], ['ÁSIA', 12, '#a88a52'], ['AM. SUL', 2, '#8a7448']];
      const rk = prog(t, s2.qua - 0.3, s2.qua + 0.2);
      if (rk > 0) { ga(rk); rr(560, 330, 470, 290, 22); ctx.fillStyle = 'rgba(7,11,20,0.88)'; ctx.fill(); ga(1);
        R.forEach(([s, v, c], i) => { const k = outC(prog(t, s2.qua - 0.2 + i * 0.12, s2.qua + 0.3 + i * 0.12)); if (k <= 0) return; const y = 380 + i * 64; ga(k); txt(s, 585, y, 28, { w: 900, align: 'left', color: i ? WH : AMB }); rr(745, y - 18, 200 * v / 16 * k, 36, 8); ctx.fillStyle = c; ctx.fill(); txt(String(v), 755 + 200 * v / 16 * k, y + 1, 28, { w: 900, align: 'left' }); ga(1); }); }
      if (ek > 0) { const lb = lab(WORLD, 'ETH'), [x, y] = toS(cam, lb[0], lb[1]); const k = sm(t, s2.eti - 0.1, s2.eti + 0.25, outBack);
        line([[x, y], [x + 60 * k, y + 80 * k]], 4, WH); circ(x, y, 9, WH);
        chip('ETIÓPIA', Math.min(x + 80, 900), y + 110, 36, AMB, k); chip('A MAIS POPULOSA SEM LITORAL', 540, 1360, 34, WH, prog(t, s2.pop - 0.2, s2.pop + 0.15), { fill: WH }); }
      header(); fonte('Britannica · World Atlas · Wikipedia');
    }
    function scene3(t) {
      const cam = CAM_KZ, kz = sm(t, s3.caz - 0.3, s3.caz + 0.1);
      drawMap(ASIA, cam, iso => iso === 'KAZ' ? { fill: kz > 0.5 ? AMB : AMB2, edge: AMB, lw: 3, glow: kz > 0.5 ? 'rgba(242,184,75,0.7)' : null } : LL.has(iso) ? { fill: '#3a3524', edge: '#6d5a30' } : null);
      // Cáspio (fechado)
      const ck = prog(t, s3.oce - 0.3, s3.oce + 0.2); if (ck > 0) { const [x, y] = ll(cam, 50.8, 41.5); chip('MAR CÁSPIO: FECHADO', x + 120, y + 70, 26, BLUE, ck, { tc: INK }); }
      rtxt('CAZAQUISTÃO', 540, 330, 96, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: kz > 0 ? outBack(prog(t, s3.caz - 0.2, s3.caz + 0.15)) : 0 });
      txt('o maior país sem litoral', 540, 255, 34, { w: 700, color: MU, a: prog(t, s3.mai - 0.2, s3.mai + 0.2) });
      const mk = sm(t, s3.doi - 0.2, s3.doi + 0.15, outBack);
      if (mk > 0) { panel(540, 1250, 860, 210, mk, AMB); const v = (2.7 * outC(prog(t, s3.doi - 0.1, s3.mil + 0.3))).toFixed(1).replace('.', ',');
        txt(`${v} MILHÕES`, 0, -40, 78, { w: 900, color: AMB }); txt('de km²  ·  9º maior país do mundo', 0, 45, 34, { w: 800, a: prog(t, s3.qui - 0.1, s3.qui + 0.3) }); endPanel(); }
      header(); fonte('Guinness World Records · CIA World Factbook');
    }
    function scene4(t) {
      const cam = CAM_SA, ch = prog(t, s4.chi - 0.2, s4.chi + 0.2);
      drawMap(SAM, cam, iso => iso === 'BOL' && t > s4.bol - 0.2 ? { fill: AMB, edge: AMB, lw: 3, glow: 'rgba(242,184,75,0.6)' } : iso === 'PRY' && t > s4.par - 0.2 ? { fill: AMB, edge: AMB, lw: 3, glow: 'rgba(242,184,75,0.6)' } : iso === 'CHL' && ch > 0 ? { fill: '#1d4a52', edge: TEAL, lw: 2 } : iso === 'BRA' ? { fill: '#223049' } : null);
      txt('AMÉRICA DO SUL', 540, 255, 34, { w: 800, color: MU, a: prog(t, s4.ame - 0.2, s4.ame + 0.2) });
      rtxt('SÓ DOIS', 540, 340, 100, { color: WH, scale: sm(t, s4.ame, s4.ame + 0.4, outBack) });
      const pl = lab(SAM, 'PRY'), bl = lab(SAM, 'BOL');
      if (pl) { const [x, y] = toS(cam, pl[0], pl[1]); chip('PARAGUAI', x + 40, y, 32, AMB, prog(t, s4.par - 0.15, s4.par + 0.15)); }
      if (bl) { const [x, y] = toS(cam, bl[0], bl[1]); chip('BOLÍVIA', x, y - 20, 32, AMB, prog(t, s4.bol - 0.15, s4.bol + 0.15)); }
      // antigo litoral boliviano (aproximado)
      const lk = prog(t, s4.per - 0.1, s4.per + 0.5);
      if (lk > 0) { const P = [[-70.3, -21.4], [-68.4, -21.1], [-67.1, -22.6], [-67.4, -24.6], [-70.6, -25.4]].map(p => ll(cam, p[0], p[1]));
        ctx.save(); ga(lk); ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = `rgba(242,184,75,${0.25 + 0.15 * Math.sin(t * 6)})`; ctx.fill(); ctx.setLineDash([10, 8]); ctx.lineWidth = 4; ctx.strokeStyle = AMB; ctx.stroke(); ctx.setLineDash([]); ctx.restore(); ga(1);
        const [x, y] = ll(cam, -70.6, -23.4); line([[x - 10, y], [x - 120, y + 40]], 4, WH); chip('LITORAL PERDIDO', x - 120, y + 90, 30, WH, prog(t, s4.per, s4.per + 0.3), { fill: WH }); }
      if (ch > 0) { const [x, y] = ll(cam, -71.5, -31); chip('CHILE', x + 30, y, 30, TEAL, ch); }
      const gk = sm(t, s4.gue - 0.2, s4.gue + 0.15, outBack); if (gk > 0) { panel(540, 1330, 820, 150, gk, AMB); txt('GUERRA DO PACÍFICO', 0, -26, 46, { w: 900, color: AMB }); txt('1879 a 1884  ·  limites fixados em 1904', 0, 34, 30, { w: 700, a: prog(t, s4.sec - 0.2, s4.sec + 0.2) }); endPanel(); }
      header(); fonte('Britannica · Wikipedia · contorno do litoral aproximado');
    }
    const R_TOP = [40, 300, 1000, 560], R_BOT = [40, 900, 1000, 560];
    const CAM_LIE = box(EUR, 5.5, 13.5, 45.4, 48.6, R_TOP), CAM_UZB = box(ASIA, 50, 78, 34, 47, R_BOT);
    function scene5(t) {
      const vk = prog(t, s5.viz - 0.2, s5.viz + 0.4);
      const st = (main, nb, on) => iso => iso === main && on ? { fill: AMB, edge: WH, lw: 3, glow: 'rgba(242,184,75,0.9)' } : nb.includes(iso) && vk > 0 ? { fill: '#1d4a52', edge: TEAL, lw: 2.5 } : null;
      const tk = Math.max(0.65 * sm(t, B[4], B[4] + 0.4), sm(t, s5.lie - 0.3, s5.lie + 0.1)), bk = Math.max(0.65 * sm(t, B[4] + 0.1, B[4] + 0.5), sm(t, s5.uzb - 0.3, s5.uzb + 0.1));
      if (tk > 0) { ga(tk); drawMap(EUR, CAM_LIE, st('LIE', ['CHE', 'AUT'], t > s5.lie - 0.2), tk, { round: true, noFade: true }); const [x, y] = toS(CAM_LIE, ...lab(EUR, 'LIE')); const lk = sm(t, s5.lie - 0.3, s5.lie + 0.1); if (lk > 0) { circ(x, y, 26 + 10 * Math.sin(t * 5), null, 4, AMB); chip('LIECHTENSTEIN', x, y - 75, 34, AMB, lk); }
        if (vk > 0) { const c = toS(CAM_LIE, ...lab(EUR, 'CHE')), a = toS(CAM_LIE, ...lab(EUR, 'AUT')); chip('SUÍÇA', c[0], c[1] + 40, 26, TEAL, vk); chip('ÁUSTRIA', Math.min(a[0], 900), a[1], 26, TEAL, vk); } ga(1); }
      if (bk > 0) { ga(bk); drawMap(ASIA, CAM_UZB, st('UZB', ['KAZ', 'KGZ', 'TJK', 'AFG', 'TKM'], t > s5.uzb - 0.2), bk, { round: true, noFade: true }); const [x, y] = toS(CAM_UZB, ...lab(ASIA, 'UZB')); chip('UZBEQUISTÃO', x, y, 34, AMB, sm(t, s5.uzb - 0.3, s5.uzb + 0.1));
        if (vk > 0) [['KAZ', 'CAZAQUISTÃO', 0, 0], ['TKM', 'TURCOMENISTÃO', 0, 20], ['KGZ', 'QUIRGUISTÃO', 0, -10], ['TJK', 'TADJIQUISTÃO', 30, 20], ['AFG', 'AFEGANISTÃO', 0, 0]].forEach(([iso, s, dx, dy], i) => { const lb = lab(ASIA, iso); if (!lb) return; const [x2, y2] = toS(CAM_UZB, lb[0], lb[1]); chip(s, clamp(x2 + dx, 170, 910), clamp(y2 + dy, 940, 1420), 22, TEAL, prog(t, s5.viz - 0.1 + i * 0.08, s5.viz + 0.2 + i * 0.08)); }); ga(1); }
      rtxt('DUPLAMENTE SEM MAR', 540, 235, 70, { color: WH, scale: sm(t, s5.dup - 0.2, s5.dup + 0.15, outBack) });
      const nk = sm(t, s5.tod - 0.2, s5.tod + 0.2, outBack); if (nk > 0) chip('VIZINHOS TAMBÉM SEM LITORAL', 540, 1500, 32, TEAL, nk);
      header(); fonte('Britannica · Wikipedia');
    }
    function scene6(t) {
      drawMap(WORLD, CAM_W, styleLL(1), 0.35);
      rtxt('QUAL TE', 540, 400, 110, { color: WH, scale: sm(t, s6.qua - 0.2, s6.qua + 0.15, outBack) });
      rtxt('SURPREENDEU?', 540, 520, 100, { color: AMB, scale: sm(t, s6.sur - 0.2, s6.sur + 0.15, outBack) });
      chip('COMENTA AQUI', 540, 680, 46, AMB, prog(t, s6.com - 0.15, s6.com + 0.2));
      const nk = sm(t, s6.ama - 0.2, s6.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 920); ctx.scale(nk, nk); rr(-430, -120, 860, 240, 26); ctx.fillStyle = 'rgba(7,11,20,0.85)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -60, 34, { w: 900, color: MU }); txt('AS FRONTEIRAS', 0, 5, 60, { w: 900 }); txt('MAIS ESTRANHAS', 0, 72, 60, { w: 900, color: BLUE, a: prog(t, s6.fro - 0.2, s6.fro + 0.2) }); ctx.restore(); }
      const bk = sm(t, s6.seg - 0.2, s6.seg + 0.2, outBack), press = t > s6.per + 0.1; if (bk > 0) { ctx.save(); ctx.translate(540, 1220); const pr = bk * (1 - 0.06 * pulse(t, s6.per + 0.1, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header();
    }

    // ---------- legendas ----------
    const HL = new Set(['quarenta', 'quatro', 'litoral', 'praia', 'porto', 'africa', 'dezesseis', 'etiopia', 'populoso', 'cazaquistao', 'dois', 'virgula', 'sete', 'milhoes', 'oceano', 'paraguai', 'bolivia', 'chile', 'pacifico', 'duplamente', 'liechtenstein', 'uzbequistao', 'vizinhos', 'surpreendeu', 'comenta', 'fronteiras', 'estranhas']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1640); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? AMB : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6];
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
