/*
 * JONAS: NÍNIVE PARA UM LADO, TÁRSIS PARA O OUTRO (Jonas 1-4). Mapa em pergaminho, 9:16 (perfil cristão).
 * Contornos: Natural Earth 10m (assets/regiao.json, K = cos 35°). Locais: Jope = Jaffa; Nínive = Mosul;
 * Társis = identificação tradicional com Tartessos (sul da Espanha), debatida. Rotas aproximadas.
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


  function create(TL, env) {
    const mk = env.createCanvas, G = env.geo || GEO;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = TL.clips.length;
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
    const FULL = box(-10, 48.5, 27, 44), LEST = box(32, 46, 29.5, 38.5), LEV = box(33.2, 36.6, 30.6, 33.6), MED = box(15, 36, 30, 38);
    const CAMS = [FULL, LEST, LEV, FULL, MED, MED, MED, LEST, LEST, LEST, FULL];
    function camAt(t, i) { const a = CAMS[Math.max(0, i - 1)], b = CAMS[i], k = i === 0 ? 1 : sm(t, B[i], B[i] + 1.2); return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) }; }
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const ll = (cam, lo, la) => toS(cam, [lo * K, -la]);
    const inRect = (x, y, m = 0) => x > RECT[0] + m && x < RECT[0] + RECT[2] - m && y > RECT[1] + m && y < RECT[1] + RECT[3] - m;
    function clipMap() { ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); }
    const landPath = () => { ctx.beginPath(); for (const r of G.land) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } };
    const RIV = (G.rivers || []).filter(r => r.length > 8 && r[0][0] > 29 * K && r[0][1] > -38);
    const P = { jope: [34.75, 32.05], nin: [43.15, 36.36], tar: [-6.95, 37.26], jer: [35.23, 31.78] };
    const SEAR = [P.jope, [30, 33.0], [24, 33.6], [18, 35.2], [12, 36.75], [6, 37.6], [0, 36.9], [-5.6, 35.95], [-7.3, 36.8], P.tar];
    const LANDR = [P.jope, [35.4, 33.4], [36.5, 35.2], [37.3, 36.3], [39.5, 36.8], [41.5, 36.6], P.nin];
    const EASTR = [P.jope, P.nin];
    function drawMap(cam, o = {}) {
      ctx.save(); clipMap();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      landPath(); ctx.fillStyle = LAND; ctx.fill('nonzero');
      ctx.beginPath(); for (const r of RIV) r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = RIVER; ctx.lineWidth = 2.2 / cam.s; ctx.stroke();
      landPath(); ctx.lineWidth = 2.0 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.restore();
      const big = cam.s < 40, mid = cam.s >= 40 && cam.s < 200;
      const LB = [[18, 34.0, 'MAR MEDITERRÂNEO', 30, '#3f6a86', big], [-4, 39.8, 'ESPANHA (hoje)', 24, MUTE, big], [30.5, 34.3, 'MAR MEDITERRÂNEO', 26, '#3f6a86', mid], [44.3, 37.9, 'ASSÍRIA', 30, MUTE, mid], [39.3, 31.0, 'DESERTO', 26, MUTE, mid]];
      for (const [lo, la, n, sz, col, ok] of LB) { if (!ok) continue; const [x, y] = ll(cam, lo, la); if (inRect(x, y, 60)) txt(n, x, y, sz, { w: 800, it: true, color: col, a: 0.85 }); }
      ctx.restore();
    }
    function frame() { ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
    function header() { spaced('JONAS', 540, 140, 60, { sp: 14 }); txt('Nínive para um lado, Társis para o outro  •  Jonas 1 – 4', 540, 210, 29, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(160, 245, 760, 3); }
    function arrowHead(x, y, ang, col, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, -13); ctx.lineTo(-12, 13); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    function place(cam, p, name, k, o = {}) { if (k <= 0) return; const [x, y] = ll(cam, p[0], p[1]); if (!inRect(x, y, 10)) return; ctx.save(); clipMap(); const e = outBack(k);
      ctx.beginPath(); ctx.arc(x, y, 12 * e, 0, TAU); ctx.fillStyle = o.col || INK; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke();
      txt(name, x + (o.dx ?? 0), y + (o.dy ?? -36), o.size || 32, { w: 900, color: o.col || INK, stroke: 9, a: clamp(k * 2), align: o.align || 'center' }); ctx.restore(); }
    function route(cam, a, b, k, col, o = {}) { if (k <= 0) return; const A = ll(cam, a[0], a[1]), Bp = ll(cam, b[0], b[1]); const c = [lerp(A[0], Bp[0], 0.5) + (o.bend || 0) * cam.s / FULL.s, lerp(A[1], Bp[1], 0.5) + (o.bendY || 0) * cam.s / FULL.s];
      const N = 50, n = Math.max(1, Math.floor(N * clamp(k))); const pt = u => [(1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * c[0] + u * u * Bp[0], (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * c[1] + u * u * Bp[1]];
      ctx.save(); clipMap(); ctx.beginPath(); ctx.moveTo(A[0], A[1]); for (let i = 1; i <= n; i++) { const q = pt(i / N); ctx.lineTo(q[0], q[1]); } ctx.lineWidth = o.w || 7; ctx.lineCap = 'round'; ctx.setLineDash(o.dash || [16, 11]); ctx.strokeStyle = col; ctx.stroke(); ctx.setLineDash([]);
      const q1 = pt(n / N), q0 = pt((n - 1) / N); if (o.arrow !== false && k < 1.001) arrowHead(q1[0], q1[1], Math.atan2(q1[1] - q0[1], q1[0] - q0[0]), col, 1.3);
      if (o.walker && k < 1) { ctx.beginPath(); ctx.arc(q1[0], q1[1], 13, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); }
      ctx.restore(); }
    function panel(k, y = 1240, h = 300) { if (k <= 0) return null; const s = outBack(k); ctx.save(); ctx.translate(540, y); ctx.scale(s, s); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.97)'; ctx.fillRect(-470, -h / 2, 940, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-470, -h / 2, 940, h); ctx.strokeRect(-460, -h / 2 + 10, 920, h - 20); return true; }
    const endPanel = () => { ctx.restore(); ga(1); };
    function veil(a) { if (a <= 0) return; ga(a); ctx.fillStyle = '#f2e6c8'; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); ga(1); }
    // rota em polilinha (pontos lon/lat), k = 0..1 pelo comprimento
    function poly(cam, pts, k, col, o = {}) { if (k <= 0) return null; const S = pts.map(p => ll(cam, p[0], p[1])); const L = [0]; for (let i = 1; i < S.length; i++) L.push(L[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1])); const goal = L[L.length - 1] * clamp(k);
      ctx.save(); clipMap(); ctx.beginPath(); ctx.moveTo(S[0][0], S[0][1]); let end = S[0], ang = 0;
      for (let i = 1; i < S.length; i++) { if (L[i] <= goal) { ctx.lineTo(S[i][0], S[i][1]); end = S[i]; ang = Math.atan2(S[i][1] - S[i - 1][1], S[i][0] - S[i - 1][0]); } else { const u = (goal - L[i - 1]) / (L[i] - L[i - 1]); end = [lerp(S[i - 1][0], S[i][0], u), lerp(S[i - 1][1], S[i][1], u)]; ang = Math.atan2(S[i][1] - S[i - 1][1], S[i][0] - S[i - 1][0]); ctx.lineTo(end[0], end[1]); break; } }
      ctx.lineWidth = o.w || 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(o.dash || [16, 11]); ctx.strokeStyle = col; ctx.stroke(); ctx.setLineDash([]);
      if (o.arrow !== false) arrowHead(end[0], end[1], ang, col, 1.3);
      if (o.ship && k < 1) shipIcon(end[0], end[1], 0.55, col);
      if (o.walker && k < 1) { ctx.beginPath(); ctx.arc(end[0], end[1], 13, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); }
      ctx.restore(); return end; }
    function shipIcon(x, y, s, col = INK, rock = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rock); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(90, 0); ctx.lineTo(60, 40); ctx.lineTo(-60, 40); ctx.closePath(); ctx.fillStyle = '#7a5532'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = INK; ctx.fillRect(-4, -120, 8, 120); ctx.beginPath(); ctx.moveTo(4, -112); ctx.quadraticCurveTo(70, -70, 6, -14); ctx.closePath(); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); ctx.restore(); }
    function waves(y0, amp, t, col = BLUE, a = 1) { ga(a); for (let r = 0; r < 4; r++) { ctx.beginPath(); for (let x = 60; x <= 1020; x += 10) { const y = y0 + r * 60 + Math.sin(x / 70 + t * 3 + r) * amp * (1 - r * 0.15); x === 60 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineWidth = 7; ctx.strokeStyle = col; ctx.stroke(); } ga(1); }
    function fish(x, y, s, open) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#4b6576'; ctx.strokeStyle = INK; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(-300, 0); ctx.quadraticCurveTo(-100, -170, 180, -40 - 40 * open); ctx.lineTo(60, 0); ctx.lineTo(180, 40 + 40 * open); ctx.quadraticCurveTo(-100, 170, -300, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-290, 0); ctx.lineTo(-420, -100); ctx.lineTo(-390, 0); ctx.lineTo(-420, 100); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(80, -50, 14, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.beginPath(); ctx.arc(84, -50, 6, 0, TAU); ctx.fillStyle = INK; ctx.fill(); ctx.restore(); }
    const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    function kmTag(cam, lo, la, s, col, k, sub) { if (k <= 0) return; const [x, y] = ll(cam, lo, la); ctx.save(); clipMap(); txt(s, x, y, 48, { w: 900, color: col, stroke: 11, a: k, scale: outBack(k) }); if (sub) txt(sub, x, y + 44, 24, { w: 800, color: MUTE, stroke: 7, a: k }); ctx.restore(); }

    // ---------------- tempos ----------------
    const s1 = { les: wt('c1', 'leste'), com: wt('c1', 'comprou'), qua: wt('c1', 'quatro'), con: wt('c1', 'contraria') };
    const s2 = { cap: wt('c2', 'capitulo'), nin: wt('c2', 'ninive'), gra: wt('c2', 'grande'), ass: wt('c2', 'assiria'), ini: wt('c2', 'inimiga') };
    const s3 = { jop: wt('c3', 'jope'), nav: wt('c3', 'navio'), tar: wt('c3', 'tarsis'), pas: wt('c3', 'passagem'), emb: wt('c3', 'embarca') };
    const s4 = { nin: wt('c4', 'ninive'), nov: wt('c4', 'novecentos'), tar: wt('c4', 'tarsis'), esp: wt('c4', 'espanha'), opo: wt('c4', 'oposto') };
    const s5 = { tem: wt('c5', 'tempestade'), par: wt('c5', 'parte'), car: wt('c5', 'carga'), dor: wt('c5', 'dormindo'), por: wt('c5', 'porao') };
    const s6 = { sor: wt('c6', 'sortes'), cai: wt('c6', 'cai'), jog: wt('c6', 'joguem'), aca: wt('c6', 'acalma') };
    const s7 = { pei: wt('c7', 'peixe'), eng: wt('c7', 'engole'), tre: wt('c7', 'tres'), noi: wt('c7', 'noites'), vom: wt('c7', 'vomita'), ter: wt('c7', 'terra') };
    const s8 = { seg: wt('c8', 'segunda'), nin: wt('c8', 'ninive'), tre: wt('c8', 'tres'), cam: wt('c8', 'caminhada'), qua: wt('c8', 'quarenta'), des: wt('c8', 'destruida') };
    const s9 = { rev: wt('c9', 'reviravolta'), int: wt('c9', 'inteira'), mai: wt('c9', 'maior'), rei: wt('c9', 'rei'), jej: wt('c9', 'jejum'), pou: wt('c9', 'poupa') };
    const s10 = { cho: wt('c10', 'chocante'), rai: wt('c10', 'raiva'), com: wt('c10', 'compaixao'), cen: wt('c10', 'cento'), pes: wt('c10', 'pessoas') };
    const s11 = { voc: wt('c11', 'voce'), com: wt('c11', 'comenta'), seg: wt('c11', 'segue'), exi: wt('c11', 'exilio') };

    cue(0, 'music', { part: 'intro' }); cue(0.1, 'stamp'); cue(s1.les, 'whoosh', { dur: 0.8 }); cue(s1.com, 'coin'); cue(s1.com + 0.1, 'whoosh', { dur: 1.6 }); cue(s1.con, 'stamp'); cue(B[1], 'music', { part: 'safe' });
    cue(s2.nin, 'pop'); cue(s2.gra, 'stamp'); cue(s2.ini, 'impact', { gain: 0.6 });
    cue(s3.jop, 'pop'); cue(s3.nav, 'splash'); cue(s3.pas, 'coin'); cue(s3.emb, 'whoosh', { dur: 0.8 });
    cue(s4.nin, 'whoosh', { dur: 1.2 }); cue(s4.nov, 'stamp'); cue(s4.tar, 'whoosh', { dur: 1.6 }); cue(s4.esp, 'pop'); cue(s4.opo, 'stamp');
    cue(B[4], 'wind', { dur: 3.0 }); cue(s5.tem, 'impact'); cue(s5.par, 'crack'); cue(s5.car, 'splash'); cue(s5.dor, 'crickets', { dur: 1.2 });
    cue(s6.sor, 'roll', { dur: 0.8 }); cue(s6.cai, 'stamp'); cue(s6.jog, 'splash'); cue(s6.aca, 'sparkle');
    cue(s7.pei, 'riser', { dur: 0.6 }); cue(s7.eng, 'impact'); cue(s7.tre, 'tick', { dur: 0.6 }); cue(s7.noi, 'tick', { dur: 0.6 }); cue(s7.vom, 'splash'); cue(s7.ter, 'stamp');
    cue(s8.seg, 'reveal'); cue(s8.tre, 'pop'); cue(s8.qua, 'stamp'); cue(s8.des, 'impact', { gain: 0.6 });
    cue(s9.rev, 'reveal'); cue(s9.int, 'riser', { dur: 1.0 }); cue(s9.rei, 'bell'); cue(s9.pou, 'success'); cue(B[9], 'music', { part: 'outro' });
    cue(s10.rai, 'angry'); cue(s10.cen, 'stamp'); cue(s10.pes, 'sparkle');
    cue(s11.com, 'notif'); cue(s11.seg + 0.2, 'tap'); cue(s11.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });
    const lin = x => x;

    // ---------------- cenas ----------------
    function scene1(t, cam) {
      drawMap(cam); place(cam, P.jope, 'JOPE', 1, { col: INK, dy: 40, size: 28 });
      place(cam, P.nin, 'NÍNIVE', prog(t, s1.les - 0.3, s1.les), { col: GOLD, dy: -34, size: 30 });
      poly(cam, EASTR, sm(t, s1.les - 0.2, s1.les + 0.6, lin), GOLD, { w: 8 });
      if (t > s1.les) { const [x, y] = ll(cam, 41.5, 33.2); ctx.save(); clipMap(); txt('DEUS: VÁ', x, y + 10, 34, { w: 900, color: GOLD, stroke: 9, a: prog(t, s1.les, s1.les + 0.3) }); ctx.restore(); }
      const rk = sm(t, s1.com, s1.con, lin); poly(cam, SEAR, rk, RED, { w: 8, ship: true });
      place(cam, P.tar, 'TÁRSIS', prog(t, s1.con - 0.4, s1.con), { col: RED, dy: -34, size: 30 });
      frame();
      plaque('4.000 KM NA DIREÇÃO ERRADA', 540, 360, 48, prog(t, 0.0, 0.3), { col: RED });
      if (rk > 0) { ctx.save(); ctx.fillStyle = 'rgba(247,238,214,0.95)'; ctx.fillRect(330, 1240, 420, 150); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(330, 1240, 420, 150); txt('KM PARA O LADO ERRADO', 540, 1278, 26, { w: 800, color: MUTE }); txt(fmt(3800 * rk), 540, 1342, 80, { w: 900, color: RED }); ctx.restore(); }
      if (t > s1.con - 0.3) stamp('DIREÇÃO CONTRÁRIA', 540, 1130, prog(t, s1.con - 0.3, s1.con), { size: 62 });
    }
    function scene2(t, cam) {
      drawMap(cam); place(cam, P.jope, 'JOPE', 1, { col: MUTE, dx: -22, dy: 0, align: 'right', size: 26 });
      place(cam, P.nin, 'NÍNIVE', prog(t, s2.nin - 0.3, s2.nin + 0.1), { col: GOLD, dy: -38, size: 38 });
      if (t > s2.nin) { const [x, y] = ll(cam, P.nin[0], P.nin[1]); ctx.save(); clipMap(); txt('hoje: Mosul, Iraque', x, y + 40, 24, { w: 700, color: MUTE, stroke: 6, a: prog(t, s2.nin, s2.nin + 0.3) }); ctx.restore(); }
      const [ix, iy] = ll(cam, 35.6, 31.4); ctx.save(); clipMap(); txt('ISRAEL', ix + 30, iy + 20, 28, { w: 900, color: BLUE, stroke: 8, a: prog(t, B[1] + 0.8, B[1] + 1.2) }); ctx.restore();
      frame();
      if (t > s2.ini - 0.3) plaque('A INIMIGA DE ISRAEL', 540, 360, 48, prog(t, s2.ini - 0.3, s2.ini), { col: RED });
      else plaque('JONAS 1:2', 540, 360, 52, prog(t, B[1], B[1] + 0.3));
      if (t > s2.gra - 0.3) stamp('"A GRANDE CIDADE"', 540, 1300, prog(t, s2.gra - 0.3, s2.gra), { size: 60, col: GOLD });
    }
    function scene3(t, cam) {
      drawMap(cam); place(cam, P.jope, 'JOPE', prog(t, s3.jop - 0.3, s3.jop + 0.1), { col: INK, dx: 22, dy: 0, align: 'left', size: 40 });
      if (t > s3.jop) { const [x, y] = ll(cam, P.jope[0], P.jope[1]); ctx.save(); clipMap(); txt('hoje: Jafa, Tel Aviv', x + 22, y + 40, 24, { w: 700, color: MUTE, stroke: 6, align: 'left', a: prog(t, s3.jop, s3.jop + 0.3) }); ctx.restore(); }
      const nk = prog(t, s3.nav - 0.3, s3.nav + 0.2); if (nk > 0) { const [x, y] = ll(cam, 34.45, 32.15); const dep = sm(t, s3.emb, s3.emb + 1.5); ctx.save(); clipMap(); ga(nk); shipIcon(x - 260 * dep, y, 0.9, RED, 0.05 * Math.sin(t * 3)); ga(1); ctx.restore(); }
      if (t > s3.tar - 0.2) { ctx.save(); clipMap(); const a = prog(t, s3.tar - 0.2, s3.tar + 0.2); ga(a); ctx.fillStyle = RED; ctx.fillRect(100, 640, 200, 12); arrowHead(90, 646, Math.PI, RED, 2); ga(1); txt('TÁRSIS', 200, 600, 44, { w: 900, color: RED, stroke: 10, a }); txt('(oeste)', 200, 700, 26, { w: 800, color: MUTE, stroke: 7, a }); ctx.restore(); }
      frame();
      plaque('DESCE A JOPE (1:3)', 540, 360, 50, prog(t, B[2], B[2] + 0.3));
      if (t > s3.pas - 0.3) stamp('PAGA A PASSAGEM', 540, 1300, prog(t, s3.pas - 0.3, s3.pas), { size: 64 });
    }
    function scene4(t, cam) {
      drawMap(cam); place(cam, P.jope, 'JOPE', 1, { col: INK, dy: 40, size: 28 });
      poly(cam, EASTR, sm(t, s4.nin - 0.2, s4.nov + 0.2, lin), GOLD, { w: 8 }); place(cam, P.nin, 'NÍNIVE', 1, { col: GOLD, dy: -34, size: 30 });
      kmTag(cam, 39.5, 30.6, '≈ 900 km', GOLD, prog(t, s4.nov - 0.2, s4.nov + 0.2), 'para o leste');
      poly(cam, SEAR, sm(t, s4.tar - 0.2, s4.esp + 0.4, lin), RED, { w: 8 }); place(cam, P.tar, 'TÁRSIS', prog(t, s4.esp - 0.3, s4.esp), { col: RED, dy: -34, size: 30 });
      kmTag(cam, 10, 31.6, '≈ 3.800 km', RED, prog(t, s4.esp - 0.2, s4.esp + 0.2), 'para o oeste');
      if (t > s4.esp) { const [x, y] = ll(cam, P.tar[0], P.tar[1]); ctx.save(); clipMap(); txt('(local debatido)', x, y + 40, 22, { w: 700, color: MUTE, stroke: 6, a: prog(t, s4.esp, s4.esp + 0.3) }); ctx.restore(); }
      frame();
      plaque('O CONTRÁRIO DA ORDEM (1:3)', 540, 360, 44, prog(t, B[3], B[3] + 0.3), { col: RED });
      if (t > s4.opo - 0.3) stamp('LADO OPOSTO', 540, 1300, prog(t, s4.opo - 0.3, s4.opo), { size: 70 });
    }
    function scene5(t, cam) {
      drawMap(cam); veil(0.9); const flash = (Math.sin(t * 7) > 0.97 || (t > s5.tem && t < s5.tem + 0.12)) ? 1 : 0;
      ctx.save(); clipMap(); ctx.fillStyle = `rgba(60,70,80,${0.25})`; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.strokeStyle = 'rgba(47,93,138,0.45)'; ctx.lineWidth = 3; for (let i = 0; i < 80; i++) { const x = RECT[0] + (i * 137) % RECT[2], y = RECT[1] + ((t * 900 + i * 211) % RECT[3]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12, y + 34); ctx.stroke(); }
      const rock = 0.22 * Math.sin(t * 2.6); shipIcon(540, 1040, 1.6, INK, rock); waves(1090, 40, t, BLUE);
      const ck = prog(t, s5.car - 0.2, s5.car + 1.0); if (ck > 0) for (let i = 0; i < 3; i++) { const bx = 420 + i * 120 + 160 * ck, by = 900 + 260 * ck * ck + i * 20; ctx.fillStyle = '#9a7246'; ctx.fillRect(bx - 28, by - 28, 56, 56); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(bx - 28, by - 28, 56, 56); }
      if (flash) { ga(0.6); ctx.fillStyle = '#fffbe8'; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]); ga(1); }
      ctx.restore();
      if (t > s5.car - 0.2) txt('CARGA AO MAR', 540, 620, 64, { w: 900, color: INK, stroke: 10, scale: outBack(prog(t, s5.car - 0.2, s5.car + 0.2)) });
      frame();
      plaque('A TEMPESTADE (1:4-5)', 540, 360, 50, prog(t, B[4], B[4] + 0.3), { col: BLUE });
      if (panel(prog(t, s5.dor - 0.3, s5.dor), 1300, 190)) { txt('E JONAS?', 0, -40, 40, { w: 900, color: MUTE }); txt('DORMINDO NO PORÃO', 0, 30, 58, { w: 900, color: RED }); txt('z z z', 330, -50, 40, { w: 900, color: BLUE, it: true }); endPanel(); }
    }
    function scene6(t, cam) {
      drawMap(cam); veil(0.9); frame();
      const calm = sm(t, s6.aca - 0.2, s6.aca + 1.0); ctx.save(); clipMap(); waves(1230, 34 * (1 - calm) + 4, t, BLUE, 0.8); ctx.restore();
      plaque('LANÇAM SORTES (1:7)', 540, 360, 50, prog(t, B[5], B[5] + 0.3));
      const names = ['MARINHEIRO', 'CAPITÃO', 'MARINHEIRO', 'JONAS', 'MARINHEIRO', 'MARINHEIRO'];
      const pick = t > s6.cai - 0.1;
      names.forEach((n, i) => { const x = 210 + (i % 3) * 330, y = 640 + Math.floor(i / 3) * 220, sh = pick ? 0 : Math.sin(t * 20 + i * 2) * 8 * prog(t, s6.sor - 0.3, s6.sor); const k = prog(t, B[5] + 0.3 + i * 0.08, B[5] + 0.6 + i * 0.08); if (k <= 0) return;
        const hot = pick && n === 'JONAS'; ctx.save(); ctx.translate(x + sh, y); ctx.scale(outBack(k) * (hot ? 1 + 0.15 * sm(t, s6.cai - 0.1, s6.cai + 0.2) : 1), outBack(k)); ga(pick && !hot ? 0.35 : 1);
        ctx.beginPath(); ctx.ellipse(0, 0, 130, 70, 0, 0, TAU); ctx.fillStyle = hot ? RED : '#b9a98a'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); txt(n, 0, 3, n === 'JONAS' ? 40 : 26, { w: 900, color: hot ? '#fff' : INK }); ga(1); ctx.restore(); });
      if (t > s6.cai - 0.3) stamp('A SORTE CAI EM JONAS', 540, 1040, prog(t, s6.cai - 0.3, s6.cai), { size: 56 });
      if (t > s6.jog - 0.3) plaque('"ME JOGUEM NO MAR" (1:12)', 540, 1360, 46, prog(t, s6.jog - 0.3, s6.jog), { col: RED });
      if (t > s6.aca - 0.2) txt('O MAR SE ACALMA (1:15)', 540, 1170, 46, { w: 900, color: BLUE, stroke: 10, a: prog(t, s6.aca - 0.2, s6.aca + 0.2) });
    }
    function scene7(t, cam) {
      drawMap(cam); veil(0.9);
      ctx.save(); clipMap(); const g = ctx.createLinearGradient(0, 600, 0, 1430); g.addColorStop(0, 'rgba(47,93,138,0.15)'); g.addColorStop(1, 'rgba(20,40,70,0.55)'); ctx.fillStyle = g; ctx.fillRect(RECT[0], 600, RECT[2], 830); waves(560, 12, t, BLUE, 0.7);
      const fx = lerp(1300, 560, sm(t, s7.pei - 0.4, s7.eng + 0.1)), open = t < s7.eng ? 1 : 0.1; const out = sm(t, s7.vom - 0.2, s7.vom + 0.8);
      if (t < s7.eng + 0.05) { ctx.beginPath(); ctx.arc(lerp(720, 680, prog(t, s7.pei, s7.eng)), 700 + 120 * prog(t, B[6], s7.eng), 16, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = RED; ctx.stroke(); }
      fish(fx - 400 * out, 860 + 10 * Math.sin(t * 2), 1.2, t > s7.vom - 0.2 ? 1 : open);
      if (out > 0) { ctx.fillStyle = '#d8c08a'; ctx.beginPath(); ctx.moveTo(700, 1430); ctx.quadraticCurveTo(880, 1250, 1060, 1260); ctx.lineTo(1060, 1430); ctx.closePath(); ga(out); ctx.fill(); ctx.beginPath(); ctx.arc(lerp(760, 900, out), lerp(860, 1270, out), 16, 0, TAU); ctx.fillStyle = '#f7eed6'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = RED; ctx.stroke(); ga(1); }
      ctx.restore(); frame();
      plaque('UM GRANDE PEIXE (1:17)', 540, 360, 48, prog(t, B[6], B[6] + 0.3), { col: BLUE });
      const dk = prog(t, s7.tre - 0.3, s7.noi + 0.4); if (dk > 0 && t < s7.vom - 0.2) { ctx.save(); ctx.fillStyle = 'rgba(247,238,214,0.95)'; ctx.fillRect(340, 1170, 400, 170); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(340, 1170, 400, 170); txt('DIA', 540, 1210, 30, { w: 800, color: MUTE }); txt(String(Math.max(1, Math.ceil(3 * dk))) + ' DE 3', 540, 1280, 72, { w: 900, color: BLUE }); ctx.restore(); }
      if (t > s7.ter - 0.3) stamp('EM TERRA FIRME (2:10)', 540, 640, prog(t, s7.ter - 0.3, s7.ter), { size: 56, col: GREEN });
    }
    function scene8(t, cam) {
      drawMap(cam); place(cam, P.jope, 'JOPE', 1, { col: MUTE, dx: -22, dy: 0, align: 'right', size: 26 });
      poly(cam, LANDR, sm(t, B[7] + 0.5, s8.cam + 0.3, lin), GOLD, { w: 8, walker: true });
      place(cam, P.nin, 'NÍNIVE', prog(t, s8.nin - 0.3, s8.nin + 0.1), { col: GOLD, dy: -38, size: 38 });
      frame();
      plaque('SEGUNDA CHANCE (3:1)', 540, 360, 50, prog(t, B[7], B[7] + 0.3), { col: GOLD });
      if (t > s8.tre - 0.3 && t < s8.qua - 0.3) { if (panel(prog(t, s8.tre - 0.3, s8.tre), 1290, 170)) { txt('CIDADE DE 3 DIAS', 0, -25, 56, { w: 900, color: INK }); txt('DE CAMINHADA (3:3)', 0, 40, 40, { w: 900, color: MUTE }); endPanel(); } }
      if (t > s8.qua - 0.3) { if (panel(prog(t, s8.qua - 0.3, s8.qua), 1270, 260)) { txt('"AINDA 40 DIAS,', 0, -60, 64, { w: 900, color: RED }); txt('E NÍNIVE SERÁ DESTRUÍDA"', 0, 20, 50, { w: 900, color: RED }); txt('JONAS 3:4', 0, 90, 30, { w: 800, color: MUTE }); endPanel(); } }
    }
    function scene9(t, cam) {
      drawMap(cam); place(cam, P.nin, 'NÍNIVE', 1, { col: GOLD, dy: -38, size: 34 }); veil(0.8); frame();
      plaque('A REVIRAVOLTA (3:5-10)', 540, 360, 48, prog(t, B[8], B[8] + 0.3), { col: GOLD });
      const wave = sm(t, s9.int - 0.2, s9.jej + 0.3, lin);
      for (let i = 0; i < 400; i++) { const c = i % 25, r = Math.floor(i / 25), x = 168 + c * 31, y = 560 + r * 34; const on = (c + r * 0.6) / 34 < wave; const k = prog(t, B[8] + 0.2 + i * 0.0015, B[8] + 0.5 + i * 0.0015); if (k <= 0) continue; ctx.beginPath(); ctx.arc(x, y + (on ? 6 : 0), 9 * outBack(k), 0, TAU); ctx.fillStyle = on ? '#6b5a44' : RED; ctx.fill(); }
      if (t > s9.mai - 0.2) txt('DO MAIOR AO MENOR', 540, 1150, 60, { w: 900, color: INK, stroke: 10, scale: outBack(prog(t, s9.mai - 0.2, s9.mai + 0.2)) });
      const rk = prog(t, s9.rei - 0.2, s9.rei + 0.2); if (rk > 0) { ctx.save(); ctx.translate(540, 1250); ctx.scale(outBack(rk), outBack(rk)); ctx.beginPath(); ctx.moveTo(-50, 20); ctx.lineTo(-50, -20); ctx.lineTo(-25, 0); ctx.lineTo(0, -30); ctx.lineTo(25, 0); ctx.lineTo(50, -20); ctx.lineTo(50, 20); ctx.closePath(); ctx.fillStyle = GOLD; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); txt('ATÉ O REI (3:6)', 540, 1310, 40, { w: 900, color: GOLD, a: rk }); }
      if (t > s9.pou - 0.3) stamp('NÍNIVE POUPADA', 540, 860, prog(t, s9.pou - 0.3, s9.pou), { size: 76, col: GREEN });
    }
    function scene10(t, cam) {
      drawMap(cam); veil(0.88); frame();
      if (t > s10.rai - 0.3) plaque('JONAS FICA COM RAIVA (4:1)', 540, 360, 44, prog(t, s10.rai - 0.3, s10.rai), { col: RED });
      else plaque('O MAIS CHOCANTE', 540, 360, 52, prog(t, B[9], B[9] + 0.3), { col: RED });
      if (t > s10.rai - 0.2 && t < s10.cen - 0.3) txt('RAIVA', 540, 860, 170, { w: 900, color: RED, scale: outBack(prog(t, s10.rai - 0.2, s10.rai + 0.2)), rot: Math.sin(t * 30) * 0.01 });
      const ck = sm(t, s10.cen - 0.3, s10.pes + 0.2, outC); if (ck > 0) { txt(fmt(120000 * ck) + (ck >= 1 ? '+' : ''), 540, 860, 170, { w: 900, color: GOLD }); txt('PESSOAS (4:11)', 540, 990, 56, { w: 900, color: INK, a: prog(t, s10.pes - 0.2, s10.pes + 0.2) }); }
      if (t > s10.com - 0.3) { if (panel(prog(t, s10.com - 0.3, s10.com), 1250, 200)) { txt('"E não hei de eu ter compaixão', 0, -30, 44, { w: 800, it: true, color: INK }); txt('da grande cidade de Nínive?"', 0, 34, 44, { w: 800, it: true, color: INK }); endPanel(); } }
    }
    function scene11(t, cam) {
      drawMap(cam); poly(cam, SEAR, 1, RED, { w: 5, arrow: false }); poly(cam, LANDR, 1, GOLD, { w: 6, arrow: false });
      place(cam, P.nin, 'NÍNIVE', 1, { col: GOLD, dy: -34, size: 28 }); place(cam, P.tar, 'TÁRSIS', 1, { col: RED, dy: -34, size: 28 }); place(cam, P.jope, 'JOPE', 1, { col: INK, dy: 40, size: 26 });
      veil(0.55); frame();
      const ck = outBack(prog(t, s11.com - 0.3, s11.com + 0.1)); if (ck > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(ck, ck); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-230, -80, 460, 160); ctx.lineWidth = 7; ctx.strokeStyle = RED; ctx.strokeRect(-230, -80, 460, 160); txt('EU JÁ', 0, 4, 76, { w: 900, color: RED }); ctx.restore(); txt('comenta aqui embaixo', 540, 1030, 36, { w: 800, color: INK, a: ck, stroke: 8 }); }
      const bk = sm(t, s11.seg - 0.3, s11.seg + 0.1, outBack), press = t > s11.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1250); const pr = bk * (1 - 0.06 * pulse(t, s11.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RED; ctx.fillRect(-200, -46, 400, 92); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-200, -46, 400, 92); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 46, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
      if (t > s11.exi - 0.4) plaque('PRÓXIMA PARTE: O EXÍLIO', 540, 360, 44, prog(t, s11.exi - 0.4, s11.exi), { col: BLUE });
      else plaque('VOCÊ JÁ FUGIU DE DEUS?', 540, 360, 44, prog(t, B[10], B[10] + 0.3), { col: RED });
    }
    // ---------------- legendas ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 60, words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 16, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), bw = total + 60, bh = size * 1.6, pop = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15));
      ctx.save(); ctx.translate(540, 1610); ctx.scale(pop, pop); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; if (cur) { ctx.fillStyle = '#e8c56a'; ctx.fillRect(x - 6, -size * 0.6, ws[i] + 12, size * 1.2); } txt(words[i], x + ws[i] / 2, 3, size, { w: 900 }); x += ws[i] + sp; }); ctx.restore(); }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.drawImage(tex, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      header(); ctx.save(); sceneFns[i](t, camAt(t, i)); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t); txt('Rotas aproximadas. Társis: localização tradicional, debatida.', 540, 1780, 22, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
