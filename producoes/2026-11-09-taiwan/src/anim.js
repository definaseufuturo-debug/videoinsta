/*
 * POR QUE TAIWAN É TÃO IMPORTANTE? — Mindloop "o mundo em mapas e dados" (geopolítica). 9:16, narrado.
 * Mapas: Natural Earth 50m via pipeline/geo_paises.py (assets/asia.json com lat_ref 24, assets/mundo.json com lat_ref 0).
 * Tom neutro: Taiwan em âmbar, China em verde-azulado, sem bandeiras, sem rostos.
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
  const AMB = '#f2b84b', TEAL = '#2ec4b6', WH = '#f3f5fa', MU = '#8a95ad', RED = '#ff4d5e', BLUE = '#5fb4ff';
  const ALLIES = ['BLZ', 'GTM', 'HTI', 'PRY', 'KNA', 'LCA', 'VCT', 'MHL', 'PLW', 'TUV', 'SWZ', 'VAT'];

  function create(TL, env) {
    const mk = env.createCanvas;
    const ASIA = env.asia || require('../assets/asia.json'), WORLD = env.mundo || require('../assets/mundo.json');
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
    function soft(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    function chip(s, x, y, size, col, k, o = {}) { if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1)); rr(-w / 2 + 6, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1); }
    function bg(t) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(95,180,255,0.05)'; ctx.lineWidth = 2; const off = (t * 20) % 80; for (let x = -80 + off; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -80 + off; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    function header() { ga(0.9); rr(250, 110, 580, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); txt('O MUNDO EM MAPAS E DADOS', 540, 141, 26, { w: 800, color: MU }); ga(1); }
    function fonte(s) { txt(s, 540, 1800, 24, { w: 600, color: 'rgba(255,255,255,0.45)' }); }

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
      // moldura suave do mapa
      const fg = ctx.createLinearGradient(0, RECT[1], 0, RECT[1] + 120); fg.addColorStop(0, 'rgba(15,23,38,1)'); fg.addColorStop(1, 'rgba(15,23,38,0)'); ctx.fillStyle = fg; ctx.fillRect(0, RECT[1], W, 120);
      const fb = ctx.createLinearGradient(0, RECT[1] + RECT[3] - 160, 0, RECT[1] + RECT[3]); fb.addColorStop(0, 'rgba(7,11,20,0)'); fb.addColorStop(1, 'rgba(7,11,20,1)'); ctx.fillStyle = fb; ctx.fillRect(0, RECT[1] + RECT[3] - 160, W, 160);
    }
    const label = (data, iso) => (data.paises.find(p => p.iso === iso) || {}).label;
    const CAM_WIDE = box(ASIA, 104, 136, 12, 40), CAM_TW = box(ASIA, 116.5, 124.5, 20.5, 27), CAM_ST = box(ASIA, 111, 129, 17, 32), CAM_W = box(WORLD, -150, 175, -50, 72);

    // ---------- ícones ----------
    function chipIcon(x, y, s, glow) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (glow) soft(0, 0, 260, 'rgba(242,184,75,A)', 0.5 * glow);
      for (let i = -3; i <= 3; i++) for (const sgn of [-1, 1]) { line([[i * 26, sgn * 110], [i * 26, sgn * 140]], 10, '#b8c2d6'); line([[sgn * 110, i * 26], [sgn * 140, i * 26]], 10, '#b8c2d6'); }
      rr(-110, -110, 220, 220, 22); ctx.fillStyle = '#1f2a3d'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#b8c2d6'; ctx.stroke();
      rr(-62, -62, 124, 124, 12); ctx.fillStyle = AMB; ctx.fill(); for (let i = -1; i <= 1; i++) { line([[-40, i * 28], [40, i * 28]], 6, 'rgba(7,11,20,0.5)'); } ctx.restore(); }
    function ship(x, y, s, ang, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-30, -10); ctx.lineTo(24, -10); ctx.lineTo(36, 0); ctx.lineTo(24, 10); ctx.lineTo(-30, 10); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#ff8a5c', '#5fb4ff', '#f2b84b', '#2ec4b6'][i]; ctx.fillRect(-24 + i * 11, -7, 9, 14); } ctx.restore(); }
    function phoneIcon(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-38, -70, 76, 140, 14); ctx.fillStyle = '#1f2a3d'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#b8c2d6'; ctx.stroke(); rr(-30, -58, 60, 112, 8); ctx.fillStyle = BLUE; ctx.fill(); ctx.restore(); }
    function laptopIcon(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-70, -50, 140, 90, 8); ctx.fillStyle = '#1f2a3d'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#b8c2d6'; ctx.stroke(); rr(-60, -40, 120, 70, 4); ctx.fillStyle = BLUE; ctx.fill(); rr(-90, 42, 180, 14, 6); ctx.fillStyle = '#b8c2d6'; ctx.fill(); ctx.restore(); }
    function aiIcon(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const P = [[-50, -30], [0, -60], [50, -30], [-50, 30], [0, 60], [50, 30], [0, 0]]; [[0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [0, 1], [1, 2], [3, 4], [4, 5]].forEach(([a, b]) => line([P[a], P[b]], 5, '#b8c2d6')); P.forEach(p => circ(p[0], p[1], 12, TEAL)); ctx.restore(); }

    // ---------- tempos ----------
    const s1 = { ilh: wt('c1', 'ilha'), men: wt('c1', 'menor'), rio: wt('c1', 'rio'), qua: wt('c1', 'quase'), chi: wt('c1', 'chips'), ava: wt('c1', 'avancados'), tai: wt('c1', 'taiwan') };
    const s2 = { cer: wt('c2', 'cerca'), nov: wt('c2', 'noventa'), cel: wt('c2', 'celulares'), com: wt('c2', 'computadores'), int: wt('c2', 'inteligencia'), lá: wt('c2', 'saem') };
    const s3 = { ilh: wt('c3', 'ilha'), cen: wt('c3', 'cento'), chi: wt('c3', 'china'), est: wt('c3', 'estreito'), met: wt('c3', 'metade'), nav: wt('c3', 'navios'), ano: wt('c3', '2022') };
    const s4 = { des: wt('c4', 'desde'), gov: wt('c4', 'governo'), ele: wt('c4', 'eleicoes'), exe: wt('c4', 'exercito'), chi: wt('c4', 'china'), ter: wt('c4', 'territorio') };
    const s5 = { doz: wt('c5', 'doze'), ofi: wt('c5', 'oficialmente'), est: wt('c5', 'estados'), nao: wt('c5', 'nao'), ven: wt('c5', 'vendem'), def: wt('c5', 'defesa') };
    const s6 = { ten: wt('c6', 'tensao'), pre: wt('c6', 'preco'), cel: wt('c6', 'celular'), sab: wt('c6', 'sabia'), com: wt('c6', 'comenta'), ama: wt('c6', 'amanha'), mar: wt('c6', 'mar') };
    cue(0, 'music', { part: 'intro' }); cue(s1.ilh, 'whoosh', { dur: 0.5 }); cue(s1.tai, 'impact', { gain: 0.8 }); cue(s1.tai + 0.05, 'sparkle');
    cue(B[1], 'music', { part: 'groove' }); cue(s2.nov, 'riser', { dur: 0.6 }); cue(s2.nov + 0.6, 'stamp'); [s2.cel, s2.com, s2.int].forEach(x => cue(x, 'pop'));
    cue(s3.cen, 'scan', { dur: 0.6, gain: 0.6 }); cue(s3.met, 'water', { dur: 1.2 }); cue(s3.nav, 'pop', { gain: 0.6 });
    cue(s4.des, 'tick', { dur: 0.3 }); [s4.gov, s4.ele, s4.exe].forEach(x => cue(x, 'pop', { gain: 0.7 })); cue(s4.chi, 'swoosh'); cue(s4.ter, 'impact', { gain: 0.5 });
    cue(s5.doz, 'ding'); cue(s5.est, 'swoosh'); cue(s5.ven, 'stamp', { gain: 0.6 });
    cue(B[5], 'music', { part: 'outro' }); cue(s6.pre, 'plus'); cue(s6.com, 'notif'); cue(s6.mar + 0.8, 'tap'); cue(s6.mar + 0.85, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    function scene1(t) {
      const z = sm(t, 0.2, s1.tai);
      const cam = mix(CAM_WIDE, CAM_TW, z), hl = sm(t, s1.tai - 0.4, s1.tai);
      drawMap(ASIA, cam, iso => iso === 'TWN' ? { fill: lerp(0, 1, hl) > 0.5 ? AMB : '#3a4560', glow: hl > 0.5 ? 'rgba(242,184,75,0.8)' : null, edge: AMB, lw: 3 } : null);
      rtxt('TAIWAN', 540, 300, 110, { color: AMB, glow: 'rgba(242,184,75,0.6)', scale: sm(t, s1.tai - 0.2, s1.tai + 0.15, outBack) });
      // comparação de área
      const ck = sm(t, s1.men - 0.2, s1.rio + 0.3);
      if (ck > 0) { ga(ck); rr(90, 1210, 900, 200, 24); ctx.fillStyle = 'rgba(7,11,20,0.82)'; ctx.fill();
        const w1 = 600 * 36 / 43.7, w2 = 600; txt('TAIWAN', 150, 1265, 30, { w: 900, color: AMB, align: 'left' }); rr(330, 1245, w1 * outC(ck), 40, 10); ctx.fillStyle = AMB; ctx.fill(); txt('36 mil km²', 340 + w1 * outC(ck), 1265, 26, { w: 800, align: 'left', a: ck });
        txt('RJ', 150, 1345, 30, { w: 900, color: MU, align: 'left' }); rr(330, 1325, w2 * outC(prog(t, s1.rio - 0.2, s1.rio + 0.4)), 40, 10); ctx.fillStyle = '#4a5878'; ctx.fill(); txt('43,7 mil', 330 + w2 - 4, 1345, 26, { w: 800, align: 'right', a: prog(t, s1.rio, s1.rio + 0.4) }); ga(1); }
      const hk = sm(t, 0.1, 0.5, outBack) * (1 - prog(t, s1.tai - 0.35, s1.tai - 0.1));
      if (hk > 0) { rtxt('MENOR QUE O RJ', 540, 300, 84, { color: WH, scale: hk }); rtxt('E DOMINA OS CHIPS', 540, 400, 66, { color: AMB, scale: sm(t, s1.chi - 0.2, s1.chi + 0.15, outBack) * (1 - prog(t, s1.tai - 0.35, s1.tai - 0.1)) }); }
      fonte('Área: CIA World Factbook e IBGE');
    }
    function scene2(t) {
      const k = sm(t, s2.cer - 0.3, s2.nov);
      chipIcon(540, 640, 1.2 * sm(t, B[1], B[1] + 0.5, outBack), 1);
      const v = Math.round(90 * outC(prog(t, s2.nov - 0.1, s2.nov + 0.6)));
      rtxt(`~${v}%`, 540, 1000, 200, { color: AMB, glow: 'rgba(242,184,75,0.6)', scale: k });
      txt('DOS CHIPS DE PONTA DO MUNDO', 540, 1120, 40, { w: 900, a: prog(t, s2.nov + 0.3, s2.nov + 0.7) });
      const it = [[s2.cel, phoneIcon, 240, 'CELULARES'], [s2.com, laptopIcon, 540, 'COMPUTADORES'], [s2.int, aiIcon, 840, 'IA']];
      it.forEach(([tt, fn, x, l]) => { const kk = sm(t, tt - 0.2, tt + 0.15, outBack); if (kk <= 0) return; ctx.save(); ctx.translate(x, 1300); ctx.scale(kk, kk); fn(0, 0, 1); ctx.restore(); txt(l, x, 1410, 30, { w: 900, color: MU, a: kk }); });
      header(); fonte('TrendForce 2025 · estimativas variam de 90% a 95%');
    }
    function scene3(t) {
      const cam = mix(CAM_TW, CAM_ST, sm(t, B[2], B[2] + 1.2));
      drawMap(ASIA, cam, iso => iso === 'TWN' ? { fill: AMB, edge: AMB, lw: 3 } : iso === 'CHN' ? { fill: '#1d4a52', edge: TEAL, lw: 2 } : null);
      // medida do estreito (~130 km entre Fujian e Taiwan)
      const a = ll(cam, 119.6, 25.1), b = ll(cam, 120.9, 24.6), mk2 = sm(t, s3.cen - 0.3, s3.cen + 0.3);
      if (mk2 > 0) { line([a, [lerp(a[0], b[0], mk2), lerp(a[1], b[1], mk2)]], 6, WH, [14, 10]); circ(a[0], a[1], 8, WH); if (mk2 > 0.95) circ(b[0], b[1], 8, WH); chip('~130 KM', (a[0] + b[0]) / 2 + 150, (a[1] + b[1]) / 2 - 90, 34, WH, prog(t, s3.cen, s3.cen + 0.3)); }
      // navios atravessando o estreito
      const sk = prog(t, s3.met - 0.5, s3.met);
      if (sk > 0) for (let i = 0; i < 12; i++) { const u = ((t * 0.08 + i / 12) % 1), p0 = ll(cam, 117.6, 21.4), p1 = ll(cam, 121.6, 28.9), mid = ll(cam, 119.7, 24.2), x = (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * mid[0] + u * u * p1[0], y = (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * mid[1] + u * u * p1[1] + (i % 3 - 1) * 18; ga(sk); ship(x, y, 0.9, Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), '#d9e2f2'); ga(1); }
      chip('CHINA', ll(cam, 116.5, 28)[0], ll(cam, 116.5, 28)[1], 32, TEAL, prog(t, s3.chi - 0.2, s3.chi + 0.1));
      chip('TAIWAN', ll(cam, 123.4, 22.6)[0], ll(cam, 123.4, 22.6)[1], 32, AMB, prog(t, s3.ilh - 0.2, s3.ilh + 0.1));
      const bk = sm(t, s3.met - 0.2, s3.met + 0.2, outBack); if (bk > 0) { ctx.save(); ctx.translate(540, 1300); ctx.scale(bk, bk); rr(-420, -80, 840, 160, 24); ctx.fillStyle = 'rgba(7,11,20,0.88)'; ctx.fill(); txt('QUASE METADE', 0, -26, 54, { w: 900, color: BLUE }); txt('dos navios de contêiner do mundo (2022)', 0, 34, 30, { w: 700, color: WH, a: prog(t, s3.nav, s3.nav + 0.3) }); ctx.restore(); }
      header(); fonte('Bloomberg 2022 · CSIS ChinaPower · Britannica');
    }
    function scene4(t) {
      const cam = CAM_ST;
      drawMap(ASIA, cam, iso => iso === 'TWN' ? { fill: AMB, edge: AMB, lw: 3, glow: 'rgba(242,184,75,0.5)' } : iso === 'CHN' ? { fill: '#1d4a52', edge: TEAL, lw: 2 } : null, 0.55);
      rtxt('1949', 540, 360, 120, { color: WH, scale: sm(t, s4.des - 0.2, s4.des + 0.15, outBack) });
      txt('desde', 540, 285, 32, { w: 700, color: MU, a: prog(t, s4.des - 0.2, s4.des) });
      // dois lados, cores neutras
      const L = [['GOVERNO PRÓPRIO', s4.gov], ['ELEIÇÕES', s4.ele], ['EXÉRCITO', s4.exe]];
      txt('TAIWAN', 280, 560, 44, { w: 900, color: AMB, a: prog(t, s4.gov - 0.4, s4.gov - 0.1) });
      L.forEach(([s, tt], i) => chip(s, 280, 660 + i * 100, 30, AMB, prog(t, tt - 0.15, tt + 0.15)));
      txt('CHINA', 800, 560, 44, { w: 900, color: TEAL, a: prog(t, s4.chi - 0.3, s4.chi) });
      const ck = sm(t, s4.ter - 0.3, s4.ter + 0.2, outBack); if (ck > 0) { ctx.save(); ctx.translate(800, 720); ctx.scale(ck, ck); rr(-230, -80, 460, 160, 20); ctx.fillStyle = 'rgba(7,11,20,0.9)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = TEAL; ctx.stroke(); txt('"A ilha é parte', 0, -26, 34, { w: 800 }); txt('do nosso território"', 0, 24, 34, { w: 800 }); ctx.restore(); }
      chip('DEFENDE A REUNIFICAÇÃO', 800, 880, 28, TEAL, prog(t, s4.ter + 0.5, s4.ter + 0.8));
      
      header(); fonte('Reuters · BBC');
    }
    function scene5(t) {
      const cam = CAM_W, al = new Set(ALLIES);
      drawMap(WORLD, cam, iso => al.has(iso) && t > s5.doz - 0.2 ? { fill: AMB, edge: AMB, lw: 2 } : iso === 'USA' && t > s5.est - 0.2 ? { fill: '#24496e', edge: BLUE, lw: 2 } : iso === 'TWN' ? { fill: AMB, edge: AMB } : null);
      // pontos pulsando nos 12 (muitos são minúsculos)
      ALLIES.forEach((iso, i) => { const lb = label(WORLD, iso); if (!lb) return; const [x, y] = toS(cam, lb[0], lb[1]), k = prog(t, s5.doz - 0.2 + i * 0.06, s5.doz + i * 0.06); if (k <= 0) return; circ(x, y, 9 * outBack(k), AMB, 3, INK); ctx.beginPath(); ctx.arc(x, y, 9 + 26 * ((t * 1.2 + i * 0.1) % 1), 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(242,184,75,${0.6 * (1 - ((t * 1.2 + i * 0.1) % 1))})`; ctx.stroke(); });
      const lb = label(WORLD, 'TWN'); if (lb) { const [x, y] = toS(cam, lb[0], lb[1]); circ(x, y, 11, AMB, 3, WH); }
      const n = Math.round(12 * outC(prog(t, s5.doz - 0.1, s5.doz + 0.6)));
      rtxt(`${n} PAÍSES`, 540, 330, 110, { color: AMB, scale: sm(t, s5.doz - 0.2, s5.doz + 0.15, outBack) });
      txt('reconhecem Taiwan oficialmente (de 193 na ONU)', 540, 430, 32, { w: 700, a: prog(t, s5.ofi - 0.2, s5.ofi + 0.2) });
      const uk = sm(t, s5.est - 0.2, s5.est + 0.2, outBack); if (uk > 0) { ctx.save(); ctx.translate(540, 1290); ctx.scale(uk, uk); rr(-430, -90, 860, 180, 24); ctx.fillStyle = 'rgba(7,11,20,0.9)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = BLUE; ctx.stroke(); txt('ESTADOS UNIDOS', 0, -40, 40, { w: 900, color: BLUE }); txt('não reconhecem, mas', 0, 8, 32, { w: 700, a: prog(t, s5.nao - 0.1, s5.nao + 0.2) }); txt('vendem armas para a defesa da ilha', 0, 50, 32, { w: 800, color: WH, a: prog(t, s5.ven - 0.1, s5.ven + 0.2) }); ctx.restore(); }
      header(); fonte('Reuters, mai/2026 · Taiwan Relations Act (1979)');
    }
    function scene6(t) {
      const cta = sm(t, s6.sab - 0.3, s6.sab + 0.1);
      if (cta < 1) { ga(1 - cta);
        const pk = sm(t, s6.pre - 0.3, s6.pre + 0.1, outBack); if (pk > 0) { ctx.save(); ctx.translate(380, 700); ctx.scale(pk * 1.6, pk * 1.6); phoneIcon(0, 0, 1); ctx.restore(); const up = prog(t, s6.pre, s6.pre + 0.8); line([[620, 840], [620, lerp(840, 560, up)]], 20, RED); if (up > 0.8) { ctx.beginPath(); ctx.moveTo(580, 590); ctx.lineTo(620, 530); ctx.lineTo(660, 590); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); } txt('PREÇO', 720, 720, 50, { w: 900, color: RED, align: 'left', a: up }); }
        chip('TENSÃO NO ESTREITO', 540, 420, 40, AMB, prog(t, s6.ten - 0.2, s6.ten + 0.15));
        const ek = sm(t, s6.cel + 0.1, s6.cel + 0.6, outBack); if (ek > 0) { ctx.save(); ctx.translate(540, 1150); ctx.scale(ek, ek); circ(0, 0, 130, '#123049', 6, BLUE); for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(0, 0, 130, Math.abs(i) * 40 + 4, 0, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(95,180,255,0.5)'; ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, Math.abs(i) * 40 + 4, 130, 0, 0, TAU); ctx.stroke(); } ctx.restore(); txt('ECONOMIA DO PLANETA', 540, 1340, 40, { w: 900, a: ek }); }
        ga(1); }
      if (cta > 0) { ga(cta);
        rtxt('VOCÊ SABIA?', 540, 470, 110, { color: WH, scale: sm(t, s6.sab - 0.2, s6.sab + 0.15, outBack) });
        chip('COMENTA AQUI', 540, 640, 46, AMB, prog(t, s6.com - 0.15, s6.com + 0.2));
        const nk = sm(t, s6.ama - 0.2, s6.ama + 0.2, outBack); if (nk > 0) { ctx.save(); ctx.translate(540, 880); ctx.scale(nk, nk); rr(-420, -110, 840, 220, 26); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); txt('AMANHÃ', 0, -50, 34, { w: 900, color: MU }); txt('PAÍSES SEM', 0, 8, 60, { w: 900 }); txt('ACESSO AO MAR', 0, 70, 60, { w: 900, color: BLUE, a: prog(t, s6.mar - 0.2, s6.mar + 0.1) }); ctx.restore(); }
        const bk = sm(t, s6.mar + 0.3, s6.mar + 0.7, outBack), press = t > s6.mar + 0.8; if (bk > 0) { ctx.save(); ctx.translate(540, 1170); const pr = bk * (1 - 0.06 * pulse(t, s6.mar + 0.8, 0.03, 0.15)); ctx.scale(pr, pr); rr(-240, -68, 480, 136, 68); ctx.fillStyle = press ? WH : AMB; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
        ga(1); }
      header();
    }

    // ---------- legendas ----------
    const HL = new Set(['menor', 'rio', 'chips', 'avancados', 'taiwan', 'noventa', 'cento', 'china', 'metade', 'navios', '1949', 'governo', 'eleicoes', 'exercito', 'territorio', 'reunificacao', 'doze', 'oficialmente', 'armas', 'preco', 'celular', 'comenta', 'mar']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 68, font = `900 ${size}px Inter`; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1600); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
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
