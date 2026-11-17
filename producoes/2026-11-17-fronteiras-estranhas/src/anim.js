/*
 * AS FRONTEIRAS MAIS ESTRANHAS DO MUNDO — Mindloop "o mundo em mapas e dados" (curiosidades geográficas). 9:16, narrado.
 * Mapas: Natural Earth 50m via pipeline/geo_paises.py (europa.json lat_ref 47, bering.json 65, nilo.json 22, mundo.json 0).
 * Ilha dos Faisões, enclaves de Baarle, ilhas Diomedes e Bir Tawil/Halaib desenhados de forma esquemática.
 * Tom neutro: cores neutras por país, sem bandeiras, sem rostos, sem lado na disputa Egito-Sudão.
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
  const FB = '#24496e', FT = '#1d4a52', FA = '#5a4a24', FL = '#3d2f5c'; // preenchimentos neutros (azul, verde-água, âmbar, lilás)

  function create(TL, env) {
    const EU = require('../assets/europa.json'), BER = require('../assets/bering.json'), NI = require('../assets/nilo.json'), WORLD = require('../assets/mundo.json');
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
    function panel(x, y, w, h, k, stroke) { ctx.save(); ctx.translate(x, y); const s = outBack(k); ctx.scale(s, s); ga(clamp(k * 3)); rr(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(7,11,20,0.92)'; ctx.fill(); if (stroke) { ctx.lineWidth = 4; ctx.strokeStyle = stroke; ctx.stroke(); } }
    const endPanel = () => { ctx.restore(); ga(1); };
    function bg(t) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(95,180,255,0.05)'; ctx.lineWidth = 2; const off = (t * 20) % 80; for (let x = -80 + off; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -80 + off; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    function header() { ga(0.9); rr(250, 110, 580, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); txt('O MUNDO EM MAPAS E DADOS', 540, 141, 26, { w: 800, color: MU }); ga(1); }
    function fonte(s) { txt(s, 540, 1800, 24, { w: 600, color: 'rgba(255,255,255,0.5)' }); }
    function marker(x, y, t, col, k) { if (k <= 0) return; const ph = (t * 1.1) % 1; ctx.beginPath(); ctx.arc(x, y, 14 + 40 * ph, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = col; ga(k * (1 - ph)); ctx.stroke(); ga(k); circ(x, y, 13 * outBack(k), col, 4, INK); ga(1); }

    // ---------- mapa ----------
    const RECT = [0, 330, W, 1120];
    const box = (data, lo0, lo1, la0, la1) => { const K = Math.cos(data.lat_ref * Math.PI / 180), x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(RECT[2] / (x1 - x0), RECT[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, K }; };
    const mix = (a, b, k) => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), K: a.K });
    const toS = (cam, x, y) => [RECT[0] + RECT[2] / 2 + (x - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (y - cam.cy) * cam.s];
    const ll = (cam, lon, lat) => toS(cam, lon * cam.K, -lat);
    function countryPath(p) { ctx.beginPath(); for (const pl of p.poly) { pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } }
    function drawMap(data, cam, style, a = 1, after) {
      ctx.save(); ga(a); ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      for (const p of data.paises) { const st = style(p.iso) || {}; countryPath(p);
        if (st.glow) { ctx.save(); ctx.shadowColor = st.glow; ctx.shadowBlur = 40; ctx.fillStyle = st.fill; ctx.fill(); ctx.restore(); }
        ctx.fillStyle = st.fill || LAND; ctx.fill(); ctx.lineWidth = (st.lw || 1.6) / cam.s; ctx.strokeStyle = st.edge || EDGE; ctx.stroke(); }
      if (after) after();
      ctx.restore(); ga(1);
      const fg = ctx.createLinearGradient(0, RECT[1], 0, RECT[1] + 120); fg.addColorStop(0, 'rgba(15,23,38,1)'); fg.addColorStop(1, 'rgba(15,23,38,0)'); ctx.fillStyle = fg; ctx.fillRect(0, RECT[1], W, 120);
      const fb = ctx.createLinearGradient(0, RECT[1] + RECT[3] - 160, 0, RECT[1] + RECT[3]); fb.addColorStop(0, 'rgba(7,11,20,0)'); fb.addColorStop(1, 'rgba(7,11,20,1)'); ctx.fillStyle = fb; ctx.fillRect(0, RECT[1] + RECT[3] - 160, W, 160);
    }

    // ---------- lugares ----------
    const PL = { fai: [-1.765, 43.343], baa: [4.93, 51.44], dio: [-169.0, 65.77], bir: [33.6, 21.88] };
    const C_GLB = box(WORLD, -150, 150, -40, 72);
    const C_EU = box(EU, -6, 10, 41, 54), C_FAI = box(EU, -4.2, 0.8, 41.8, 45);
    const C_BAA = box(EU, 2.2, 7.6, 49.6, 53.2);
    const C_BER = box(BER, -177, -159, 62.5, 68.8);
    const C_NI0 = box(NI, 26, 40, 16, 28), C_NI = box(NI, 30.6, 38.6, 19.4, 24.6);
    // Bir Tawil e Halaib (esquemáticos, em lon/lat)
    const BIRP = [[33.18, 22.0], [34.08, 22.0], [33.98, 21.8], [33.6, 21.72], [33.2, 21.82]];
    const HALP = [[34.1, 22.0], [37.4, 22.0], [37.4, 23.6], [35.55, 23.15]];

    // ---------- tempos ----------
    const s1 = { ilh: wt('c1', 'ilha'), mud: wt('c1', 'muda'), sei: wt('c1', 'seis'), mes: wt('c1', 'meses'), nem: wt('c1', 'nem'), est: wt('c1', 'estranha'), mun: wt('c1', 'mundo') };
    const s2 = { ilh: wt('c2', 'ilha'), fai: wt('c2', 'faisoes'), fra: wt('c2', 'franca'), esp: wt('c2', 'espanha'), mei: wt('c2', 'meio'), cad: wt('c2', 'cada'), mil: wt('c2', 'mil'), nov: wt('c2', 'nove') };
    const s3 = { baa: wt('c3', 'baarle'), bel: wt('c3', 'belgica'), vin: wt('c3', 'vinte'), ped: wt('c3', 'pedacos'), pai: wt('c3', 'paises'), cas: wt('c3', 'casas'), cor: wt('c3', 'cortadas'), por: wt('c3', 'porta'), fre: wt('c3', 'frente') };
    const s4 = { est: wt('c4', 'estreito'), ber: wt('c4', 'bering'), rus: wt('c4', 'russa'), ame: wt('c4', 'americana'), qua: wt('c4', 'quatro'), mas: wt('c4', 'mas'), vin: wt('c4', 'vinte'), hor: wt('c4', 'horas'), dif: wt('c4', 'diferenca') };
    const s5 = { bir: wt('c5', 'bir'), egi: wt('c5', 'egito'), sud: wt('c5', 'sudao'), nen: wt('c5', 'nenhum'), rei: wt('c5', 'reivindica'), ace: wt('c5', 'aceitar'), are: wt('c5', 'area'), dez: wt('c5', 'dez'), lad: wt('c5', 'lado') };
    const s6 = { qua: wt('c6', 'qual'), est: wt('c6', 'estranha'), com: wt('c6', 'comenta'), ama: wt('c6', 'amanha'), dez: wt('c6', 'dez'), eco: wt('c6', 'economias'), seg: wt('c6', 'segue') };

    cue(0, 'music', { part: 'intro' }); cue(s1.ilh, 'ding'); cue(s1.mud, 'swoosh'); cue(s1.sei, 'stamp'); cue(s1.nem, 'riser', { dur: 0.6 }); cue(s1.est, 'impact', { gain: 0.7 });
    cue(B[1], 'music', { part: 'groove' }); cue(s2.fai, 'pop'); cue(s2.fra, 'pop'); cue(s2.esp, 'pop'); cue(s2.mei, 'swoosh'); cue(s2.cad, 'swoosh'); cue(s2.mil, 'stamp', { gain: 0.6 });
    cue(s3.baa, 'pop'); cue(s3.vin, 'roll', { dur: 0.8 }); cue(s3.cas, 'door'); cue(s3.por, 'ding');
    cue(s4.ber, 'scan', { dur: 0.8, gain: 0.6 }); cue(s4.rus, 'pop'); cue(s4.ame, 'pop'); cue(s4.qua, 'stretch', { dur: 0.5 }); cue(s4.vin, 'tick', { dur: 0.6 }); cue(s4.hor, 'bell');
    cue(s5.bir, 'reveal'); cue(s5.egi, 'pop'); cue(s5.sud, 'pop'); cue(s5.nen, 'crickets', { dur: 1.0 }); cue(s5.are, 'riser', { dur: 0.4 }); cue(s5.dez, 'impact', { gain: 0.6 });
    cue(B[5], 'music', { part: 'outro' }); cue(s6.com, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    function scene1(t) {
      const cam = C_GLB, flip = Math.floor(t / 0.6) % 2;
      drawMap(WORLD, cam, iso => null, 0.9);
      // os 4 lugares piscando no mapa-múndi
      const pts = [PL.fai, PL.baa, PL.dio, PL.bir].map(p => ll(cam, ...p)), cols = [flip ? BLUE : AMB, AMB, TEAL, LIL];
      marker(...pts[0], t, cols[0], prog(t, s1.ilh - 0.1, s1.ilh + 0.3));
      for (let i = 1; i < 4; i++) marker(...pts[i], t, cols[i], prog(t, s1.nem + i * 0.12, s1.nem + 0.3 + i * 0.12));
      const out = 1 - prog(t, s1.nem - 0.3, s1.nem - 0.05);
      if (out > 0) {
        rtxt('UMA ILHA', 540, 300, 84, { color: WH, scale: sm(t, s1.ilh - 0.25, s1.ilh + 0.1, outBack), a: out });
        rtxt('MUDA DE PAÍS', 540, 410, 96, { color: WH, scale: sm(t, s1.mud - 0.25, s1.mud + 0.1, outBack), a: out });
        rtxt('A CADA 6 MESES', 540, 525, 92, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s1.sei - 0.25, s1.sei + 0.1, outBack), a: out });
      }
      rtxt('E NEM É A', 540, 330, 88, { color: WH, scale: sm(t, s1.nem - 0.2, s1.nem + 0.15, outBack) });
      rtxt('MAIS ESTRANHA', 540, 445, 96, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s1.est - 0.2, s1.est + 0.15, outBack) });
      chip('DO MUNDO', 540, 560, 44, WH, prog(t, s1.mun - 0.15, s1.mun + 0.15), { fill: '#e8ecf4' });
      header();
    }
    function scene2(t) {
      const cam = mix(C_EU, C_FAI, sm(t, B[1], B[1] + 1.1));
      drawMap(EU, cam, iso => iso === 'FRA' && t > s2.fra - 0.2 ? { fill: FB, edge: BLUE, lw: 2.4 } : iso === 'ESP' && t > s2.esp - 0.2 ? { fill: FA, edge: AMB, lw: 2.4 } : null);
      const [mx, my] = ll(cam, ...PL.fai); marker(mx, my, t, WH, prog(t, s2.ilh - 0.1, s2.ilh + 0.3));
      chip('FRANÇA', ...ll(cam, 0.3, 44.4), 32, BLUE, prog(t, s2.fra - 0.15, s2.fra + 0.15));
      chip('ESPANHA', ...ll(cam, -2.8, 42.5), 32, AMB, prog(t, s2.esp - 0.15, s2.esp + 0.15));
      rtxt('ILHA DOS FAISÕES', 540, 330, 80, { color: WH, scale: sm(t, s2.fai - 0.3, s2.fai + 0.1, outBack) });
      // painel esquemático: rio Bidassoa com a ilha trocando de cor
      const pk = sm(t, s2.mei - 0.35, s2.mei + 0.05, outBack);
      if (pk > 0) { panel(540, 1170, 900, 430, pk, WH);
        ctx.fillStyle = FB; ctx.fillRect(-430, -190, 860, 120); ctx.fillStyle = FA; ctx.fillRect(-430, 70, 860, 120);
        txt('FRANÇA', -300, -130, 30, { w: 900, color: BLUE }); txt('ESPANHA', -300, 130, 30, { w: 900, color: AMB });
        ctx.fillStyle = '#123a5a'; ctx.fillRect(-430, -70, 860, 140); txt('rio Bidassoa', 300, -40, 26, { w: 700, color: MU });
        // ciclo: França (ago-jan) -> Espanha (fev-jul) -> França
        const ph = t < s2.cad ? 0 : Math.floor((t - s2.cad) / 0.9) % 2 === 0 ? 1 : 0; const isEsp = t >= s2.mei && ph === 1;
        const col = isEsp ? AMB : BLUE, fill = isEsp ? FA : FB;
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 150, 42, 0, 0, TAU); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
        txt(isEsp ? 'ESPANHA' : 'FRANÇA', 0, 2, 30, { w: 900, color: col });
        endPanel();
        const lab = isEsp ? 'FEV → JUL: ESPANHA' : 'AGO → JAN: FRANÇA';
        chip(lab, 540, 900, 34, isEsp ? AMB : BLUE, prog(t, s2.mei - 0.1, s2.mei + 0.2));
      }
      const dk = sm(t, s2.mil - 0.25, s2.mil + 0.1, outBack); if (dk > 0) rtxt('DESDE 1659', 540, 450, 70, { color: AMB, scale: dk });
      header(); fonte('Tratado dos Pireneus (1659) · ilha em escala esquemática');
    }
    // enclaves de Baarle (esquema): 22 manchas belgas dentro do território neerlandês, 7 com um contraenclave dentro
    const BLOBS = []; { let sd = 7; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
      const big = [[-120, -20, 95, 70], [90, 30, 80, 60]]; big.forEach(b => BLOBS.push(b));
      while (BLOBS.length < 22) { const x = lerp(-370, 370, rnd()), y = lerp(-120, 125, rnd()), r = lerp(14, 34, rnd()); if (BLOBS.every(b => Math.hypot(b[0] - x, (b[1] - y) * 1.2) > b[2] + r + 10)) BLOBS.push([x, y, r, r * lerp(0.7, 1, rnd())]); } }
    const COUNTER = [0, 0, 1, 1, 2, 5, 8]; // em quais manchas ficam os 7 contraenclaves (duas nas maiores)
    function blob(x, y, rx, ry, seed) { ctx.beginPath(); for (let i = 0; i <= 14; i++) { const a = i / 14 * TAU, w = 1 + 0.16 * Math.sin(a * 3 + seed) + 0.08 * Math.cos(a * 5 + seed * 2); const px = x + Math.cos(a) * rx * w, py = y + Math.sin(a) * ry * w; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); }
    function house(x, y, s, k) { // casa cortada pela fronteira, porta da frente do lado belga
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ga(clamp(k * 3));
      ctx.fillStyle = '#d9e2f2'; ctx.fillRect(-110, -40, 220, 140); ctx.beginPath(); ctx.moveTo(-130, -40); ctx.lineTo(0, -130); ctx.lineTo(130, -40); ctx.closePath(); ctx.fillStyle = '#8a95ad'; ctx.fill();
      ctx.fillStyle = '#5fb4ff'; ctx.fillRect(-85, -10, 40, 40); ctx.fillRect(45, -10, 40, 40);
      ctx.fillStyle = AMB; ctx.fillRect(-30, 30, 50, 70); circ(10, 66, 4, INK);
      ctx.restore(); ga(1);
    }
    function scene3(t) {
      const cam = mix(C_FAI, C_BAA, sm(t, B[2], B[2] + 1.1));
      drawMap(EU, cam, iso => iso === 'BEL' && t > s3.bel - 0.2 ? { fill: FA, edge: AMB, lw: 2.4 } : iso === 'NLD' && t > s3.pai - 0.2 ? { fill: FB, edge: BLUE, lw: 2.4 } : null);
      const [mx, my] = ll(cam, ...PL.baa); marker(mx, my, t, WH, prog(t, s3.baa - 0.1, s3.baa + 0.3));
      chip('BÉLGICA', ...ll(cam, 4.4, 50.5), 32, AMB, prog(t, s3.bel - 0.15, s3.bel + 0.15));
      chip('PAÍSES BAIXOS', ...ll(cam, 5.6, 52.3), 32, BLUE, prog(t, s3.pai - 0.15, s3.pai + 0.15));
      rtxt('BAARLE', 540, 330, 96, { color: WH, scale: sm(t, s3.baa - 0.25, s3.baa + 0.1, outBack) });
      const pk = sm(t, s3.vin - 0.4, s3.vin, outBack), swap = prog(t, s3.cas - 0.3, s3.cas);
      if (pk > 0 && swap < 1) { panel(540, 1150, 900, 400, pk * (1 - swap) + (swap > 0 ? 0 : 0), BLUE);
        rr(-420, -170, 840, 340, 18); ctx.fillStyle = FB; ctx.fill();
        const n = Math.round(22 * outC(prog(t, s3.vin, s3.ped + 0.3)));
        for (let i = 0; i < n; i++) { const b = BLOBS[i]; blob(b[0], b[1], b[2], b[3], i); ctx.fillStyle = FA; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = AMB; ctx.stroke(); }
        const ck = prog(t, s3.ped + 0.2, s3.pai + 0.3); COUNTER.forEach((bi, j) => { if (j / 7 >= ck) return; const b = BLOBS[bi], dx = [-0.35, 0.35, -0.3, 0.3, 0, 0, 0][j] * b[2]; blob(b[0] + dx, b[1] + 6, Math.max(6, b[2] * 0.22), Math.max(6, b[3] * 0.22), j + 30); ctx.fillStyle = FB; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = BLUE; ctx.stroke(); });
        endPanel();
        if (n > 0) rtxt(String(n), 540, 470, 120, { color: AMB, glow: 'rgba(242,184,75,0.5)', a: 1 - swap });
        txt('pedaços da Bélgica', 540, 560, 40, { w: 800, a: prog(t, s3.ped - 0.1, s3.ped + 0.2) * (1 - swap) });
      }
      const hk = sm(t, s3.cas - 0.2, s3.cas + 0.2, outBack);
      if (hk > 0) { panel(540, 1150, 900, 400, hk, AMB);
        ctx.fillStyle = FB; ctx.fillRect(-430, -180, 430, 360); ctx.fillStyle = FA; ctx.fillRect(0, -180, 430, 360);
        txt('PAÍSES BAIXOS', -215, -150, 28, { w: 900, color: BLUE }); txt('BÉLGICA', 215, -150, 28, { w: 900, color: AMB });
        house(0, 40, 1, prog(t, s3.cas - 0.1, s3.cas + 0.2));
        const cut = prog(t, s3.cor - 0.1, s3.cor + 0.4); if (cut > 0) line([[0, -180], [0, lerp(-180, 180, cut)]], 6, WH, [16, 12]);
        endPanel();
        const dk = sm(t, s3.por - 0.2, s3.por + 0.15, outBack); if (dk > 0) rtxt('VALE A PORTA', 540, 455, 84, { color: AMB, scale: dk });
        if (dk > 0) rtxt('DA FRENTE', 540, 555, 84, { color: WH, scale: sm(t, s3.fre - 0.2, s3.fre + 0.15, outBack) });
        // seta para a porta
        const ak = prog(t, s3.por, s3.por + 0.3); if (ak > 0) { ga(ak); line([[640, 1120], [560, 1200]], 8, AMB); ctx.beginPath(); ctx.moveTo(548, 1212); ctx.lineTo(556, 1178); ctx.lineTo(582, 1204); ctx.closePath(); ctx.fillStyle = AMB; ctx.fill(); ga(1); }
      }
      header(); fonte('Baarle-Hertog / Baarle-Nassau · enclaves em esquema');
    }
    function clock(x, y, r, h, m, col, day, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); const s = outBack(k); ctx.scale(s, s); ga(clamp(k * 3));
      circ(0, 0, r, '#0f1726', 6, col); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line([[Math.sin(a) * r * 0.8, -Math.cos(a) * r * 0.8], [Math.sin(a) * r * 0.92, -Math.cos(a) * r * 0.92]], 4, MU); }
      const ah = ((h % 12) + m / 60) / 12 * TAU, am = m / 60 * TAU; line([[0, 0], [Math.sin(ah) * r * 0.5, -Math.cos(ah) * r * 0.5]], 9, WH); line([[0, 0], [Math.sin(am) * r * 0.75, -Math.cos(am) * r * 0.75]], 6, WH); circ(0, 0, 7, col);
      txt(day, 0, r + 38, 30, { w: 900, color: col }); ctx.restore(); ga(1); }
    function scene4(t) {
      const cam = C_BER;
      const ml = prog(t, B[3], B[3] + 0.6);
      drawMap(BER, cam, iso => iso === 'RUS' && t > s4.rus - 0.2 ? { fill: FB, edge: BLUE, lw: 2.4 } : iso === 'USA' && t > s4.ame - 0.2 ? { fill: FT, edge: TEAL, lw: 2.4 } : null, ml, () => {
        // Linha Internacional de Data (dobra pelo estreito)
        const dl = prog(t, s4.ber - 0.2, s4.ber + 0.8); if (dl > 0) { const pts = [[-180, 70.5], [-169.0, 68.2], [-169.0, 64.5], [-172.5, 61.0], [-180, 59]].map(([lo, la]) => [lo * cam.K, -la]); ctx.save(); ctx.setLineDash([0.12, 0.09]); ctx.globalAlpha = dl; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = 3 / cam.s; ctx.strokeStyle = AMB; ctx.stroke(); ctx.restore(); }
      });
      const [mx, my] = ll(cam, ...PL.dio); marker(mx, my, t, WH, prog(t, s4.est - 0.1, s4.est + 0.3));
      const cf = 1 - prog(t, s4.vin - 0.4, s4.vin - 0.1);
      chip('RÚSSIA', ...ll(cam, -174, 66.8), 30, BLUE, prog(t, s4.rus - 0.15, s4.rus + 0.15), { a: cf });
      chip('EUA (ALASCA)', ...ll(cam, -162, 66.2), 30, TEAL, prog(t, s4.ame - 0.15, s4.ame + 0.15), { a: cf });
      const [lx, ly] = ll(cam, -169.0, 63.2); txt('LINHA DE DATA', lx, ly, 26, { w: 900, color: AMB, a: prog(t, s4.ber, s4.ber + 0.5), stroke: 6 });
      rtxt('ESTREITO DE BERING', 540, 330, 76, { color: WH, scale: sm(t, s4.est - 0.25, s4.ber + 0.1, outBack) });
      // painel: as duas ilhas Diomedes
      const pk = sm(t, s4.rus - 0.3, s4.rus + 0.1, outBack);
      if (pk > 0) { panel(540, 1170, 940, 440, pk, WH);
        ctx.fillStyle = '#123a5a'; rr(-450, -200, 900, 400, 18); ctx.fill();
        line([[0, -200], [0, 200]], 4, AMB, [14, 10]);
        ctx.beginPath(); ctx.ellipse(-170, 20, 120, 70, -0.2, 0, TAU); ctx.fillStyle = FB; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = BLUE; ctx.stroke();
        const ak = prog(t, s4.ame - 0.2, s4.ame + 0.1); if (ak > 0) { ga(ak); ctx.beginPath(); ctx.ellipse(150, 30, 70, 45, 0.15, 0, TAU); ctx.fillStyle = FT; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = TEAL; ctx.stroke(); ga(1); }
        txt('GRANDE DIOMEDES', -170, -90, 26, { w: 900, color: BLUE }); txt('PEQUENA DIOMEDES', 160, -60, 26, { w: 900, color: TEAL, a: ak });
        const dk = prog(t, s4.qua - 0.2, s4.qua + 0.3); if (dk > 0) { ga(dk); line([[-48, 140], [lerp(-48, 78, outC(dk)), 140]], 5, WH); txt('< 4 km', 15, 172, 30, { w: 900 }); ga(1); }
        endPanel();
      }
      const ck = sm(t, s4.vin - 0.3, s4.vin + 0.1, outBack);
      if (ck > 0) { const sp = clamp((t - s4.vin) / 0.8); clock(250, 600, 95, 10, 0, BLUE, 'RÚSSIA: TER 10:00', ck); clock(830, 600, 95, 13, 0, TEAL, 'EUA: SEG 13:00', ck);
        rtxt('+21 H', 540, 600, 96, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s4.hor - 0.2, s4.hor + 0.15, outBack) }); }
      header(); fonte('Fusos: Kamtchatka (UTC+12) e Alasca (UTC−9), inverno');
    }
    function lonlatPath(cam, pts) { ctx.beginPath(); pts.forEach(([lo, la], i) => (i ? ctx.lineTo(lo * cam.K, -la) : ctx.moveTo(lo * cam.K, -la))); ctx.closePath(); }
    function scene5(t) {
      const cam = mix(C_NI0, C_NI, sm(t, B[4], B[4] + 1.1));
      const bk = prog(t, s5.bir - 0.2, s5.bir + 0.3), hk = prog(t, s5.are - 0.3, s5.are + 0.2);
      drawMap(NI, cam, iso => iso === 'EGY' && t > s5.egi - 0.2 ? { fill: FB, edge: BLUE, lw: 2.4 } : iso === 'SDN' && t > s5.sud - 0.2 ? { fill: FT, edge: TEAL, lw: 2.4 } : null, 1, () => {
        // recorte pela terra do Egito + Sudão
        ctx.save(); ctx.beginPath(); for (const p of NI.paises) if (p.iso === 'EGY' || p.iso === 'SDN') for (const pl of p.poly) { pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } ctx.clip();
        if (hk > 0) { lonlatPath(cam, HALP); ctx.globalAlpha = hk; ctx.fillStyle = FL; ctx.fill(); ctx.lineWidth = 3 / cam.s; ctx.strokeStyle = LIL; ctx.stroke(); ctx.globalAlpha = 1; }
        if (bk > 0) { lonlatPath(cam, BIRP); ctx.globalAlpha = bk; ctx.save(); ctx.shadowColor = 'rgba(242,184,75,0.8)'; ctx.shadowBlur = 30; ctx.fillStyle = AMB; ctx.fill(); ctx.restore(); ctx.lineWidth = 3 / cam.s; ctx.strokeStyle = WH; ctx.stroke(); ctx.globalAlpha = 1; }
        ctx.restore();
        // paralelo 22°N
        const pl = prog(t, s5.bir, s5.bir + 0.6); if (pl > 0) { ctx.save(); ctx.globalAlpha = pl * 0.8; ctx.setLineDash([0.12, 0.09]); ctx.beginPath(); ctx.moveTo(24 * cam.K, -22); ctx.lineTo(lerp(24, 40, pl) * cam.K, -22); ctx.lineWidth = 2.5 / cam.s; ctx.strokeStyle = WH; ctx.stroke(); ctx.restore(); }
      });
      chip('EGITO', ...ll(cam, 31.8, 24.0), 32, BLUE, prog(t, s5.egi - 0.15, s5.egi + 0.15));
      chip('SUDÃO', ...ll(cam, 31.6, 21.0), 32, TEAL, prog(t, s5.sud - 0.15, s5.sud + 0.15));
      const [bx, by] = ll(cam, 33.62, 21.88); chip('BIR TAWIL', bx - 10, by + 85, 30, AMB, prog(t, s5.bir, s5.bir + 0.3));
      const [hx, hy] = ll(cam, 35.6, 22.6); chip('HALAIB', hx + 20, hy - 10, 30, LIL, prog(t, s5.are - 0.1, s5.are + 0.2));
      const [px, py] = ll(cam, 37.6, 22.0); txt('22° N', px, py - 22, 24, { w: 800, color: MU, a: prog(t, s5.bir + 0.3, s5.bir + 0.7), stroke: 5 });
      rtxt('BIR TAWIL', 540, 330, 96, { color: AMB, glow: 'rgba(242,184,75,0.5)', scale: sm(t, s5.bir - 0.25, s5.bir + 0.1, outBack) });
      chip('NENHUM DOS DOIS REIVINDICA', 540, 450, 34, WH, prog(t, s5.nen - 0.15, s5.rei + 0.1), { fill: '#e8ecf4' });
      const pk = sm(t, s5.ace - 0.3, s5.ace + 0.1, outBack);
      if (pk > 0) { panel(540, 1270, 920, 260, pk, null);
        const w1 = 640 * 0.1, w2 = 640 * outC(prog(t, s5.are - 0.1, s5.dez + 0.3));
        txt('BIR TAWIL', -420, -55, 32, { w: 900, color: AMB, align: 'left' }); rr(-170, -78, Math.max(8, w1), 46, 10); ctx.fillStyle = AMB; ctx.fill(); txt('~2.060 km²', -170 + w1 + 14, -55, 30, { w: 900, color: AMB, align: 'left' });
        txt('HALAIB', -420, 30, 32, { w: 900, color: LIL, align: 'left', a: prog(t, s5.are - 0.2, s5.are) }); if (w2 > 1) { rr(-170, 7, w2, 46, 10); ctx.fillStyle = LIL; ctx.fill(); } txt('~20.580 km²', -170 + w2 - 14, 30, 30, { w: 900, color: INK, align: 'right', a: prog(t, s5.dez, s5.dez + 0.3) });
        txt('Halaib: disputado pelos dois, administrado pelo Egito', 0, 100, 26, { w: 700, color: MU, a: prog(t, s5.dez, s5.dez + 0.4) });
        endPanel();
        const dk = sm(t, s5.dez - 0.2, s5.dez + 0.15, outBack); if (dk > 0) rtxt('10× MAIOR', 540, 570, 84, { color: LIL, scale: dk });
      }
      header(); fonte('Áreas aproximadas · contornos em esquema · enciclopédias');
    }
    function scene6(t) {
      rtxt('QUAL É A', 540, 330, 92, { color: WH, scale: sm(t, s6.qua - 0.2, s6.qua + 0.15, outBack) });
      rtxt('MAIS ESTRANHA?', 540, 440, 92, { color: AMB, scale: sm(t, s6.est - 0.2, s6.est + 0.15, outBack) });
      const L = [['ILHA DOS FAISÕES', BLUE], ['BAARLE', AMB], ['DIOMEDES', TEAL], ['BIR TAWIL', LIL]];
      L.forEach(([s, c], i) => chip(`${i + 1}. ${s}`, 540, 570 + i * 88, 36, c, prog(t, s6.qua + 0.2 + i * 0.12, s6.qua + 0.5 + i * 0.12)));
      chip('COMENTA O NÚMERO', 540, 960, 44, WH, prog(t, s6.com - 0.15, s6.com + 0.2), { fill: '#e8ecf4' });
      const nk = sm(t, s6.ama - 0.2, s6.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 1180); ctx.scale(nk, nk); rr(-420, -110, 840, 220, 26); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -50, 34, { w: 900, color: MU }); txt('AS 10 MAIORES', 0, 8, 60, { w: 900, a: prog(t, s6.dez - 0.3, s6.dez) }); txt('ECONOMIAS DO MUNDO', 0, 70, 56, { w: 900, color: BLUE, a: prog(t, s6.eco - 0.2, s6.eco + 0.1) }); ctx.restore(); }
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2; if (bk > 0) { ctx.save(); ctx.translate(540, 1420); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      header();
    }

    // ---------- legendas ----------
    const HL = new Set(['ilha', 'pais', 'seis', 'meses', 'estranha', 'faisoes', 'franca', 'espanha', 'meio', 'mil', 'baarle', 'belgica', 'vinte', 'pedacos', 'paises', 'baixos', 'porta', 'frente', 'bering', 'russa', 'americana', 'quatro', 'horas', 'bir', 'tawil', 'egito', 'sudao', 'nenhum', 'dez', 'maior', 'comenta', 'economias']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1620); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
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
