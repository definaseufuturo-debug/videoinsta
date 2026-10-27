/*
 * AS VIAGENS DE PAULO: mapa animado em estilo pergaminho, 9:16 (teste para o perfil cristão).
 * Contornos: Natural Earth 50m (assets/med.json). Rotas aproximadas tradicionais (Atos 13-28).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, K = Math.cos(37 * Math.PI / 180);
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  // paleta pergaminho
  const PAPER = '#efe2c4', SEA = '#cdd9cc', LAND = '#e6d3a6', COAST = '#8b6b3d', INK = '#3b2a1a', MUTE = '#7a6248', GOLD = '#c08a1e';
  const RC = ['#b23a2e', '#2f5d8a', '#3c7a3e', '#c08a1e'];
  const RN = ['1ª VIAGEM', '2ª VIAGEM', '3ª VIAGEM', 'VIAGEM A ROMA'], RD = ['c. 46–48 d.C.', 'c. 49–52 d.C.', 'c. 53–57 d.C.', 'c. 59–60 d.C.'];

  const C = { // lon, lat
    'Antioquia': [36.20, 36.20], 'Selêucia': [35.93, 36.12], 'Salamina': [33.90, 35.18], 'Pafos': [32.41, 34.76], 'Perge': [30.85, 36.96], 'Atália': [30.70, 36.89],
    'Antioquia da Pisídia': [31.19, 38.30], 'Icônio': [32.49, 37.87], 'Listra': [32.33, 37.58], 'Derbe': [33.35, 37.35], 'Tarso': [34.90, 36.92], 'Trôade': [26.16, 39.75],
    'Neápolis': [24.40, 40.94], 'Filipos': [24.29, 41.01], 'Tessalônica': [22.94, 40.64], 'Bereia': [22.20, 40.52], 'Atenas': [23.73, 37.98], 'Corinto': [22.88, 37.91],
    'Éfeso': [27.34, 37.94], 'Cesareia': [34.89, 32.50], 'Jerusalém': [35.23, 31.78], 'Assôs': [26.34, 39.49], 'Mileto': [27.28, 37.53], 'Rodes': [28.22, 36.43],
    'Pátara': [29.32, 36.26], 'Tiro': [35.20, 33.27], 'Sidom': [35.37, 33.56], 'Mirra': [29.98, 36.26], 'Bons Portos': [24.82, 34.93], 'Malta': [14.40, 35.92],
    'Siracusa': [15.28, 37.08], 'Régio': [15.65, 38.11], 'Putéoli': [14.12, 40.82], 'Roma': [12.50, 41.90],
  };
  const P = n => [C[n][0] * K, -C[n][1]];
  const LBL = new Set(['Antioquia', 'Perge', 'Antioquia da Pisídia', 'Icônio', 'Listra', 'Derbe', 'Tarso', 'Trôade', 'Filipos', 'Tessalônica', 'Atenas', 'Corinto', 'Éfeso', 'Cesareia', 'Jerusalém', 'Mileto', 'Rodes', 'Mirra', 'Malta', 'Siracusa', 'Roma', 'Salamina', 'Pafos']);
  const LOFF = { 'Antioquia': [-45, -30], 'Antioquia da Pisídia': [0, -32], 'Icônio': [44, -22], 'Listra': [-30, 30], 'Derbe': [30, 30], 'Tarso': [26, -28], 'Perge': [-10, 34], 'Trôade': [-50, -18], 'Filipos': [40, -26], 'Tessalônica': [-30, -30],
    'Atenas': [40, 20], 'Corinto': [-44, 28], 'Éfeso': [-40, 16], 'Cesareia': [-56, 0], 'Jerusalém': [-20, 34], 'Mileto': [-40, 26], 'Rodes': [10, 30], 'Mirra': [20, 30], 'Malta': [0, 34], 'Siracusa': [50, 20], 'Roma': [0, -32], 'Salamina': [40, -22], 'Pafos': [-34, 28] };
  // rotas: [cidade, modo para chegar nela] (T = terra, M = mar)
  const R = [
    [['Antioquia'], ['Selêucia', 'T'], ['Salamina', 'M'], ['Pafos', 'T'], ['Perge', 'M'], ['Antioquia da Pisídia', 'T'], ['Icônio', 'T'], ['Listra', 'T'], ['Derbe', 'T'], ['Listra', 'T'], ['Icônio', 'T'], ['Antioquia da Pisídia', 'T'], ['Perge', 'T'], ['Atália', 'T'], ['Antioquia', 'M']],
    [['Antioquia'], ['Tarso', 'T'], ['Derbe', 'T'], ['Listra', 'T'], ['Icônio', 'T'], ['Antioquia da Pisídia', 'T'], ['Trôade', 'T'], ['Neápolis', 'M'], ['Filipos', 'T'], ['Tessalônica', 'T'], ['Bereia', 'T'], ['Atenas', 'M'], ['Corinto', 'T'], ['Éfeso', 'M'], ['Cesareia', 'M'], ['Jerusalém', 'T'], ['Antioquia', 'T']],
    [['Antioquia'], ['Tarso', 'T'], ['Icônio', 'T'], ['Antioquia da Pisídia', 'T'], ['Éfeso', 'T'], ['Trôade', 'T'], ['Neápolis', 'M'], ['Filipos', 'T'], ['Tessalônica', 'T'], ['Corinto', 'T'], ['Tessalônica', 'T'], ['Filipos', 'T'], ['Trôade', 'M'], ['Assôs', 'T'], ['Mileto', 'M'], ['Rodes', 'M'], ['Pátara', 'M'], ['Tiro', 'M'], ['Cesareia', 'M'], ['Jerusalém', 'T']],
    [['Cesareia'], ['Sidom', 'M'], ['Mirra', 'M'], ['Bons Portos', 'M'], ['Malta', 'M'], ['Siracusa', 'M'], ['Régio', 'M'], ['Putéoli', 'M'], ['Roma', 'T']],
  ];
  // geometria de cada rota (trechos de mar levemente curvos)
  const ROUTE = R.map(r => { const segs = []; let tot = 0; for (let i = 1; i < r.length; i++) { const a = P(r[i - 1][0]), b = P(r[i][0]), m = r[i][1], len = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, m, len, s0: tot, to: r[i][0] }); tot += len; } return { segs, tot, cities: r.map(x => x[0]) }; });
  const cumAt = (ri, idx) => (idx <= 0 ? 0 : ROUTE[ri].segs[idx - 1].s0 + ROUTE[ri].segs[idx - 1].len);

  function create(TL, env) {
    const mk = env.createCanvas, LANDS = env.geo || require('../assets/med.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 6;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot); ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || PAPER; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || INK; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.3, w = o.w || 700; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; ga(o.a ?? 1); [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || INK }); cx += ws[i] + sp; }); ga(1); }
    function plaque(s, x, y, size, k, o = {}) { if (k <= 0) return; const w = tw(s, size, 900) + size * 1.0, h = size * 1.6, sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = o.fill || '#f7eed6'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 4; ctx.strokeStyle = o.col || INK; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14); txt(s, 0, 3, size, { w: 900, color: o.col || INK }); ctx.restore(); ga(1); }
    function stamp(s, x, y, k, o = {}) { if (k <= 0) return; const sc = lerp(2.2, 1, outC(k)), size = o.size || 80, w = tw(s, size, 900) + 60, h = size * 1.4; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.lineWidth = 9; ctx.strokeStyle = o.col || RC[0]; ctx.strokeRect(-w / 2, -h / 2, w, h); txt(s, 0, 4, size, { w: 900, color: o.col || RC[0] }); ctx.restore(); ga(1); }

    // textura de pergaminho (pré-calculada)
    const tex = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); let s = 9; const R0 = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 60000; i++) { g.fillStyle = R0() < 0.5 ? 'rgba(120,80,30,0.05)' : 'rgba(255,255,255,0.06)'; g.fillRect(R0() * W, R0() * H, 1 + R0() * 2, 1 + R0() * 2); }
      const gr = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); gr.addColorStop(0, 'rgba(90,55,20,0)'); gr.addColorStop(1, 'rgba(90,55,20,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ---------------- câmera e mapa ----------------
    const RECT = [20, 430, 1040, 1000];
    const box = (lo0, lo1, la0, la1) => { const x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(RECT[2] / (x1 - x0), RECT[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    const CAMS = [box(11, 38, 30.5, 43.5), box(29.3, 37.3, 33.6, 39.3), box(21.2, 37.3, 31.0, 42.0), box(21.2, 37.3, 31.0, 42.0), box(11, 37, 31, 43), box(11, 38, 30.5, 43.5)];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i], B[i] + 1.0); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    function drawMap(cam) {
      ctx.save(); ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      // ondas leves no mar
      ctx.strokeStyle = 'rgba(80,110,100,0.12)'; ctx.lineWidth = 2; for (let y = RECT[1] + 20; y < RECT[1] + RECT[3]; y += 44) { ctx.beginPath(); for (let x = RECT[0]; x <= RECT[0] + RECT[2]; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.05 + y) * 4); ctx.stroke(); }
      ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      ctx.beginPath(); for (const r of LANDS) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
      ctx.fillStyle = LAND; ctx.fill('nonzero'); ctx.lineWidth = 2.2 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.restore();
      ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]);
    }
    // desenha a rota ri até a distância d; retorna a posição/direção do viajante
    function route(cam, ri, d, o = {}) {
      const rt = ROUTE[ri], col = RC[ri]; let head = null;
      ga(o.a ?? 1);
      for (const sg of rt.segs) {
        if (d <= sg.s0) break; const u = clamp((d - sg.s0) / sg.len), a = toS(cam, sg.a), b = toS(cam, sg.b);
        const curve = sg.m === 'M' ? 0.12 : 0.04, mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * curve, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * curve;
        ctx.beginPath(); const N = 24; for (let j = 0; j <= N * u; j++) { const v = j / N, x = (1 - v) * (1 - v) * a[0] + 2 * (1 - v) * v * mx + v * v * b[0], y = (1 - v) * (1 - v) * a[1] + 2 * (1 - v) * v * my + v * v * b[1]; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        const v = u, hx = (1 - v) * (1 - v) * a[0] + 2 * (1 - v) * v * mx + v * v * b[0], hy = (1 - v) * (1 - v) * a[1] + 2 * (1 - v) * v * my + v * v * b[1]; ctx.lineTo(hx, hy);
        ctx.lineWidth = o.w || 7; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.setLineDash(sg.m === 'M' ? [14, 12] : []); ctx.stroke(); ctx.setLineDash([]);
        head = { x: hx, y: hy, m: sg.m, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
      }
      ga(1); return head;
    }
    function ship(x, y, col, s = 1, t = 0) { ctx.save(); ctx.translate(x, y + Math.sin(t * 6) * 3); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.lineTo(18, 14); ctx.lineTo(-18, 14); ctx.closePath(); ctx.fillStyle = '#6b4a2b'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -40); ctx.stroke(); ctx.beginPath(); ctx.moveTo(2, -38); ctx.quadraticCurveTo(26, -22, 2, -6); ctx.closePath(); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.stroke(); ctx.fillStyle = col; ctx.fillRect(-2, -44, 12, 6); ctx.restore(); }
    function walker(x, y, col) { ctx.beginPath(); ctx.arc(x, y, 13, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke(); }
    function city(cam, n, k, o = {}) { if (k <= 0) return; const [x, y] = toS(cam, P(n)); if (x < RECT[0] || x > RECT[0] + RECT[2] || y < RECT[1] || y > RECT[1] + RECT[3]) return;
      const r = (o.big ? 11 : 8) * outBack(k); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); if (o.hl) { ctx.beginPath(); ctx.arc(x, y, r * 2.4 * (1 + 0.3 * o.hl), 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(59,42,26,${0.6 * o.hl})`; ctx.stroke(); }
      if (o.label !== false && LBL.has(n)) { const [dx, dy] = LOFF[n] || [0, -28]; txt(n.toUpperCase(), x + dx, y + dy, o.size || 24, { w: 900, color: INK, stroke: 7, a: clamp(k * 2) }); } }
    // progresso sincronizado: pontos [indiceCidade, tempo]
    function dAt(ri, t, sync) { if (t <= sync[0][1]) return cumAt(ri, sync[0][0]); for (let i = 1; i < sync.length; i++) if (t <= sync[i][1]) { const [i0, t0] = sync[i - 1], [i1, t1] = sync[i]; return lerp(cumAt(ri, i0), cumAt(ri, i1), inOut(prog(t, t0, t1))); } return cumAt(ri, sync[sync.length - 1][0]); }
    function legend(ri, t0, t) { const k = sm(t, t0 - 0.2, t0 + 0.3, outBack); if (k <= 0) return; ctx.save(); ctx.translate(540, 360); ctx.scale(k, k); const s = `${RN[ri]}  •  ${RD[ri]}`, w = tw(s, 34, 900) + 70; ctx.fillStyle = RC[ri]; ctx.fillRect(-w / 2, -32, w, 64); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-w / 2, -32, w, 64); txt(s, 0, 2, 34, { w: 900, color: '#fff' }); ctx.restore(); }
    function header() { spaced('AS VIAGENS DE PAULO', 540, 140, 54, { sp: 12 }); txt('Atos 13 – 28', 540, 205, 30, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(220, 240, 640, 3); }

    // ---------------- tempos ----------------
    const s1 = { anos: wt('c1', 'anos'), pau: wt('c1', 'paulo'), dez: wt('c1', 'dez'), pe: wt('c1', 'pe'), bar: wt('c1', 'barco'), olh: wt('c1', 'olha') };
    const c2 = clip('c2'), c3 = clip('c3'), c4 = clip('c4'), c5 = clip('c5');
    const s2 = { pri: wt('c2', 'primeira'), ant: wt('c2', 'antioquia'), chi: wt('c2', 'chipre'), gal: wt('c2', 'galacia'), ico: wt('c2', 'iconio'), lis: wt('c2', 'listra'), der: wt('c2', 'derbe') };
    const s3 = { seg: wt('c3', 'segunda'), eur: wt('c3', 'europa'), fil: wt('c3', 'filipos'), tes: wt('c3', 'tessalonica'), ate: wt('c3', 'atenas'), cor: wt('c3', 'corinto'), mei: wt('c3', 'meio') };
    const s4 = { ter: wt('c4', 'terceira'), tre: wt('c4', 'tres'), efe: wt('c4', 'efeso'), vol: wt('c4', 'volta'), jer: wt('c4', 'jerusalem'), pre: wt('c4', 'preso') };
    const s5 = { ult: wt('c5', 'ultima'), pri: wt('c5', 'prisioneiro'), rom: wt('c5', 'roma'), cam: wt('c5', 'caminho'), tem: wt('c5', 'tempestade'), cat: wt('c5', 'catorze'), nav: wt('c5', 'navio'), nau: wt('c5', 'naufraga'), mal: wt('c5', 'malta') };
    const s6 = { car: wt('c6', 'cartas'), bib: wt('c6', 'biblia'), fav: wt('c6', 'favorita'), com: wt('c6', 'comenta'), seg: wt('c6', 'segue') };
    const SY = [
      [[0, s2.ant], [2, s2.chi], [4, s2.gal], [6, s2.ico], [7, s2.lis], [8, s2.der], [14, c2.end + 0.25]],
      [[0, s3.seg], [6, s3.eur], [8, s3.fil], [9, s3.tes], [11, s3.ate], [12, s3.cor], [12, s3.mei], [16, c3.end + 0.25]],
      [[0, s4.ter], [4, s4.efe], [4, s4.vol - 0.2], [19, s4.jer + 0.2]],
      [[0, s5.ult], [1, s5.pri], [2, s5.rom], [3, s5.cam], [3, s5.tem], [4, s5.mal], [8, c5.end + 0.1]],
    ];
    cue(0, 'music', { part: 'intro' }); cue(s1.dez, 'riser', { dur: 0.8 }); cue(s1.olh, 'whoosh', { dur: 0.6 }); cue(B[1], 'music', { part: 'safe' });
    [s2.chi, s2.ico, s2.lis, s2.der, s3.fil, s3.tes, s3.ate, s3.cor, s4.efe, s4.jer].forEach(x => cue(x, 'pop', { gain: 0.5 }));
    cue(s4.pre, 'lock'); cue(s5.tem, 'wind', { dur: 2.4 }); cue(s5.nav, 'crack'); cue(s5.nau, 'splash'); cue(s5.mal, 'impact', { gain: 0.6 }); cue(c5.end, 'bell'); cue(B[5], 'music', { part: 'outro' }); cue(s6.com, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });

    // ---------------- cenas ----------------
    function allRoutes(cam, t, a, upto = 4) { for (let ri = 0; ri < upto; ri++) route(cam, ri, ROUTE[ri].tot, { a, w: 5 }); }
    function citiesOf(cam, ri, d, t) { const rt = ROUTE[ri]; rt.cities.forEach((n, i) => { const reached = d >= cumAt(ri, i) - 1e-6; city(cam, n, reached ? 1 : 0, { hl: reached ? pulse(t, 0, 0, 1) * 0 : 0 }); }); }
    function scene1(t, cam) {
      drawMap(cam);
      const k = prog(t, s1.pau, s1.olh + 0.5); for (let ri = 0; ri < 4; ri++) route(cam, ri, ROUTE[ri].tot * clamp(k * 4 - ri), { a: 0.85, w: 5 });
      ['Antioquia', 'Jerusalém', 'Éfeso', 'Corinto', 'Atenas', 'Roma', 'Malta'].forEach((n, i) => city(cam, n, prog(t, s1.pau + i * 0.2, s1.pau + i * 0.2 + 0.3)));
      const nk = sm(t, s1.dez - 0.3, s1.dez + 0.1, outBack); if (nk > 0) { txt('+10.000 KM', 540, 320, 92, { w: 900, color: RC[0], scale: nk }); txt('A PÉ E DE BARCO', 540, 395, 32, { w: 800, color: MUTE, a: prog(t, s1.pe, s1.bar + 0.2) }); }
    }
    function sceneR(ri, t0, extra) { return (t, cam) => {
      drawMap(cam); for (let j = 0; j < ri; j++) route(cam, j, ROUTE[j].tot, { a: 0.25, w: 4 });
      const d = dAt(ri, t, SY[ri]); const head = route(cam, ri, d, { w: 7 });
      ROUTE[ri].cities.forEach((n, i) => { const reached = d >= cumAt(ri, i) - 1e-6; if (reached) city(cam, n, 1, { big: true }); });
      if (head && d < ROUTE[ri].tot - 1e-6) { if (head.m === 'M') ship(head.x, head.y - 6, RC[ri], 0.9, t); else walker(head.x, head.y, RC[ri]); }
      legend(ri, t0, t); if (extra) extra(t, cam, d);
    }; }
    const scene2 = sceneR(0, B[1] + 0.2);
    const scene3 = sceneR(1, B[2] + 0.2, (t, cam) => { if (t > s3.eur - 0.3 && t < s3.fil + 0.6) { plaque('O EVANGELHO CHEGA À EUROPA', 540, 1470, 34, prog(t, s3.eur - 0.2, s3.eur + 0.1)); } if (t > s3.cor) { const [x, y] = toS(cam, P('Corinto')); plaque('1 ANO E MEIO', x + 40, y + 90, 30, prog(t, s3.mei - 0.3, s3.mei)); } });
    const scene4 = sceneR(2, B[3] + 0.2, (t, cam) => { if (t > s4.efe - 0.2) { const [x, y] = toS(cam, P('Éfeso')); plaque('~3 ANOS', x - 30, y + 100, 32, prog(t, s4.efe - 0.1, s4.efe + 0.2)); } if (t > s4.pre - 0.2) { const [x, y] = toS(cam, P('Jerusalém')); stamp('PRESO', x - 120, y - 70, prog(t, s4.pre - 0.05, s4.pre + 0.12), { size: 56 }); } });
    const scene5 = sceneR(3, B[4] + 0.2, (t, cam) => {
      const storm = prog(t, s5.tem - 0.2, s5.tem + 0.3) * (1 - prog(t, s5.mal + 0.2, s5.mal + 0.8));
      if (storm > 0) { ctx.save(); ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); ctx.fillStyle = `rgba(40,50,60,${0.35 * storm})`; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
        for (let i = 0; i < 40; i++) { const x = RECT[0] + ((i * 97 + t * 900) % RECT[2]), y = RECT[1] + ((i * 151 + t * 1400) % RECT[3]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 14, y + 34); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(230,240,255,${0.5 * storm})`; ctx.stroke(); }
        if (Math.sin(t * 13) > 0.92) { ctx.fillStyle = `rgba(255,255,240,${0.25 * storm})`; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); } ctx.restore();
        txt('14 DIAS DE TEMPESTADE', 540, 1470, 40, { w: 900, color: '#2c3e50', a: prog(t, s5.cat - 0.2, s5.cat + 0.1) }); }
      if (t > s5.nau - 0.2) { const [x, y] = toS(cam, P('Malta')); stamp('NAUFRÁGIO', x + 40, y - 90, prog(t, s5.nau - 0.05, s5.nau + 0.12), { size: 48 }); }
      if (t > c5.end - 0.3) { const [x, y] = toS(cam, P('Roma')); plaque('ROMA', x + 10, y - 70, 34, prog(t, c5.end - 0.3, c5.end), { col: RC[3] }); }
    });
    const LETTERS = ['Romanos', '1 e 2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses', 'Colossenses', '1 e 2 Tessalonicenses', 'Filemom'];
    function scene6(t, cam) {
      drawMap(cam); allRoutes(cam, t, 0.9);
      ['Antioquia', 'Jerusalém', 'Éfeso', 'Corinto', 'Filipos', 'Tessalônica', 'Roma'].forEach(n => city(cam, n, 1, { size: 22 }));
      // pergaminho com as cartas
      const k = sm(t, s6.car - 0.3, s6.car + 0.2, outBack);
      if (k > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(k, k); ctx.fillStyle = 'rgba(247,238,214,0.96)'; ctx.fillRect(-380, -330, 760, 660); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-380, -330, 760, 660); ctx.strokeRect(-368, -318, 736, 636);
        txt('CARTAS DE PAULO', 0, -265, 44, { w: 900 }); txt('na Bíblia até hoje', 0, -215, 28, { w: 700, color: MUTE });
        LETTERS.forEach((l, i) => { const a = prog(t, s6.car + 0.15 + i * 0.12, s6.car + 0.35 + i * 0.12); txt(l, 0, -140 + i * 58, 38, { w: 800, color: RC[i % 4], a }); });
        ctx.restore(); }
      if (t > s6.fav - 0.3) { ctx.save(); ctx.fillStyle = 'rgba(239,226,196,0.92)'; ctx.fillRect(0, 1240, W, 210); ctx.restore(); txt('QUAL É A SUA FAVORITA?', 540, 1300, 56, { w: 900, scale: sm(t, s6.fav - 0.3, s6.fav, outBack) }); }
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1395); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RC[0]; ctx.fillRect(-230, -50, 460, 100); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-230, -50, 460, 100); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 50, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
    }

    // ---------------- legendas (placa de pergaminho, palavra falada em dourado) ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 60, words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 16, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), bw = total + 60, bh = size * 1.6, pop = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15));
      ctx.save(); ctx.translate(540, 1610); ctx.scale(pop, pop); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; if (cur) { ctx.fillStyle = '#e8c56a'; ctx.fillRect(x - 6, -size * 0.6, ws[i] + 12, size * 1.2); } txt(words[i], x + ws[i] / 2, 3, size, { w: 900 }); x += ws[i] + sp; }); ctx.restore(); }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.drawImage(tex, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      header(); ctx.save(); sceneFns[i](t, camAt(t, i)); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t); txt('Rotas aproximadas, segundo o livro de Atos', 540, 1780, 24, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
