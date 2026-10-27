/*
 * FOGÃO DE INDUÇÃO — como funciona e vale a pena (CTA afiliado), 9:16 (1080x1920)
 * Conteúdo educativo e neutro: cores neutras (laranja / turquesa), sem fotos nem símbolos de partido.
 * Toda ação visual é presa ao instante real em que a palavra é falada (build/timeline.json).
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
  const inC = t => clamp(t) ** 3;
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  function kf(t, keys, e = inOut) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e(clamp((t - t0) / (t1 - t0))); return lerp(a, b, u); } return keys[keys.length - 1][1]; }
  function mulberry(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const pct = (v, d = 2) => v.toFixed(d).replace('.', ',') + '%';
  const milhar = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration;
    const NS = 6;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Gancho: ferve e a mão não queima', 'Bobina e campo', 'A panela esquenta', 'Teste do ímã', 'Vale a pena?', 'CTA link na bio'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ------------------------------------------------ paleta (neutra)
    const BG0 = '#061419', BG1 = '#0e2830', GRID = 'rgba(120,220,220,0.07)', INK = '#08161b';
    const OR = '#ff9f1c', TE = '#2ec4b6', WH = '#f4f6fb', MU = '#8a94b3', Y = '#ffd166', RED = '#ff4d5e';
    const CAND = { F: { name: 'FLÁVIO', col: OR }, L: { name: 'LULA', col: TE } };

    // ------------------------------------------------ texturas
    const R0 = mulberry(7);
    const grain = (() => { const cv = mk(540, 960), g = cv.getContext('2d'); for (let i = 0; i < 20000; i++) { const x = R0() * 540, y = R0() * 960, r = 0.4 + R0() * 1.1; g.fillStyle = R0() < 0.5 ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.12)'; g.fillRect(x, y, r, r); } return cv; })();
    const vig = (() => { const cv = mk(W, H), g = cv.getContext('2d'), gr = g.createRadialGradient(W / 2, H * 0.48, H * 0.25, W / 2, H * 0.5, H * 0.78); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ------------------------------------------------ primitivas
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) {
      if (o.scale !== undefined && o.scale <= 0.001) return;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
      ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha *= o.a ?? 1;
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || INK; ctx.strokeText(s, 0, 0); }
      ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore();
    }
    function rtxt(s, x, y, size, o = {}) { // título com contorno + sombra sólida
      if (o.scale !== undefined && o.scale <= 0.001) return;
      const d = o.d ?? size * 0.07;
      ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
      ctx.globalAlpha *= o.a ?? 1;
      ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = o.lw ?? size * 0.12; ctx.strokeStyle = INK; ctx.fillStyle = o.sh || INK;
      ctx.strokeText(s, d, d); ctx.fillText(s, d, d);
      ctx.strokeText(s, 0, 0); ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0);
      ctx.restore();
    }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function line(pts, w, col = WH, dash) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); }
    function circ(x, y, r, fill, lw = 0, sc = WH) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function soft(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    function chip(s, x, y, size, col, k, o = {}) { // etiqueta arredondada que "salta"
      if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7;
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1));
      rr(-w / 2 + 8, -h / 2 + 8, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
      rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill();
      txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1);
    }
    function stampMark(x, y, s, k, o = {}) { // carimbo que cai
      if (k <= 0) return; const sc = lerp(2.4, 1, outC(k)) * (o.s || 1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(sc, sc); ga(clamp(k * 3));
      const size = o.size || 84, w = tw(s, size, 900) + 70, h = size * 1.45, col = o.col || RED;
      rr(-w / 2, -h / 2, w, h, 16); ctx.fillStyle = 'rgba(11,16,32,0.85)'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.stroke();
      rr(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); ctx.lineWidth = 4; ctx.stroke();
      txt(s, 0, 4, size, { w: 900, color: col });
      ctx.restore(); ga(1);
    }
    function bg(t, tint) { // fundo de "telão": gradiente + grade que desliza
      scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (tint) soft(W / 2, H * 0.42, 900, tint, 0.16);
      const off = (t * 30) % 90; ctx.lineWidth = 2; ctx.strokeStyle = GRID;
      for (let x = -90 + off; x < W + 90; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = -90 + off; y < H + 90; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
    function header(t) { // selo fixo no topo
      ga(0.85); rr(290, 120, 500, 64, 32); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
      txt('COMO FUNCIONA • VALE A PENA?', 540, 153, 26, { w: 800, color: MU }); ga(1);
    }
    const mixC = (a, b, u) => { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return 'rgb(' + pa.map((x, i) => Math.round(lerp(x, pb[i], clamp(u)))).join(',') + ')'; };
    const CU = '#d9823b', GLASS = '#151b22', HOT = '#ff5a2a';
    // corte do cooktop: vidro + corpo com a bobina
    function cooktop(x, y, s, t, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-440, 20, 880, 150, 22); ctx.fillStyle = '#262c34'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      if (o.xray) { // bobina em espiral (corte)
        ga(o.xray); rr(-400, 34, 800, 120, 14); ctx.fillStyle = '#10161c'; ctx.fill();
        const on = o.on || 0; if (on > 0) soft(0, 90, 360, 'rgba(255,140,60,A)', 0.35 * on * (0.8 + 0.2 * Math.sin(t * 30)));
        for (let i = 0; i < 9; i++) { const r = 40 + i * 34; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sg * r, 92, 13, 22, 0, 0, TAU); ctx.fillStyle = mixC(CU, '#ffb46e', on * (0.5 + 0.5 * Math.sin(t * 25 + i))); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#5a2e10'; ctx.stroke(); } }
        ga(1); }
      rr(-460, -22, 920, 44, 12); ctx.fillStyle = GLASS; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-440, -16, 880, 6);
      if (!o.xray) { ctx.beginPath(); ctx.arc(0, -22, 200, Math.PI, 0); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.stroke(); }
      ctx.restore();
    }
    // panela (fundo em y = 0)
    function pan(x, y, s, t, o = {}) {
      const heat = o.heat || 0;
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(260, -170, 230, 34, 17); ctx.fillStyle = '#2b2b2b'; ctx.fill(); // cabo
      ctx.beginPath(); ctx.moveTo(-270, -230); ctx.lineTo(-250, -24); ctx.lineTo(250, -24); ctx.lineTo(270, -230); ctx.closePath(); ctx.fillStyle = o.alu ? '#c9ced6' : '#8d949e'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      // água
      ctx.save(); ctx.beginPath(); ctx.moveTo(-262, -190); ctx.lineTo(-250, -30); ctx.lineTo(250, -30); ctx.lineTo(262, -190); ctx.closePath(); ctx.clip();
      if (!o.empty) { ctx.fillStyle = 'rgba(80,170,255,0.55)'; ctx.fillRect(-270, -190 + Math.sin(t * 6) * 3, 540, 200); }
      if (heat > 0.4) for (let i = 0; i < 14; i++) { const k = ((t * (0.8 + (i % 4) * 0.3) + i * 0.137) % 1); circ(-220 + (i * 37) % 440, -40 - k * 150, 5 + (i % 3) * 3, 'rgba(255,255,255,0.7)'); }
      ctx.restore();
      // fundo da panela (onde nasce o calor)
      rr(-256, -34, 512, 34, 8); ctx.fillStyle = mixC('#5d636b', HOT, heat); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      if (heat > 0) soft(0, -16, 330, 'rgba(255,90,42,A)', 0.4 * heat);
      if (o.eddy) for (let i = 0; i < 5; i++) { const cx = -200 + i * 100; ctx.beginPath(); ctx.ellipse(cx, -17, 34, 10, 0, t * 9 + i, t * 9 + i + Math.PI * 1.5); ctx.lineWidth = 4; ctx.strokeStyle = `rgba(255,230,120,${o.eddy})`; ctx.stroke(); }
      if (heat > 0.6) for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i / 3) % 1; ctx.beginPath(); ctx.moveTo(-60 + i * 60, -240 - k * 120); ctx.quadraticCurveTo(-30 + i * 60, -270 - k * 120, -60 + i * 60, -300 - k * 120); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - k)})`; ctx.stroke(); }
      ctx.restore();
    }
    function field(x, y, s, t, k) { // linhas do campo magnético saindo da bobina
      if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ga(k);
      for (let i = 1; i <= 5; i++) { const r = 60 + i * 55; ctx.beginPath(); ctx.ellipse(0, 90, r, r * 0.95, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.setLineDash([18, 14]); ctx.lineDashOffset = -t * 120 * (i % 2 ? 1 : -1); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(46,196,182,0.85)'; ctx.stroke(); }
      ctx.setLineDash([]); ga(1); ctx.restore();
    }
    function hand(x, y, s, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * outBack(k), s * outBack(k)); ga(clamp(k * 3));
      rr(-70, -60, 140, 120, 40); ctx.fillStyle = '#f2c4a0'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      for (let i = 0; i < 4; i++) { rr(-62 + i * 34, -150, 28, 100, 14); ctx.fillStyle = '#f2c4a0'; ctx.fill(); ctx.stroke(); }
      rr(64, -40, 70, 28, 14); ctx.fill(); ctx.stroke(); ctx.restore(); ga(1); }
    function magnet(x, y, s, rot, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ga(clamp(k * 3));
      ctx.beginPath(); ctx.arc(0, -60, 70, Math.PI, 0); ctx.lineWidth = 50; ctx.strokeStyle = RED; ctx.stroke(); ctx.lineWidth = 6;
      for (const sx of [-70, 70]) { rr(sx - 25, -60, 50, 50, 4); ctx.fillStyle = RED; ctx.fill(); rr(sx - 25, -12, 50, 26, 4); ctx.fillStyle = '#d6dbe2'; ctx.fill(); }
      ctx.restore(); ga(1); }
    const CX = 540, CY = 1080; // posição do cooktop na tela

    // ================= CENA 1 — gancho =================
    const s1 = { fer: wt('c1', 'ferve'), agu: wt('c1', 'agua'), enc: wt('c1', 'encostar'), mao: wt('c1', 'mao'), lad: wt('c1', 'lado'), pos: wt('c1', 'possivel') };
    cue(0, 'music', { part: 'intro' }); cue(s1.fer, 'sizzle', { dur: 1.2 }); cue(s1.mao, 'tap'); cue(s1.pos, 'ding'); cue(s1.pos, 'music', { part: 'groove' });
    function scene1(t) {
      bg(t, 'rgba(255,90,42,A)'); header(t);
      const ck = sm(t, 0.1, 0.6, outBack); cooktop(CX, CY, ck, t, {}); pan(CX - 60, CY - 22, ck * 0.9, t, { heat: sm(t, s1.fer - 0.4, s1.fer + 0.4) });
      rtxt('FERVENDO', 540, 330, 100, { color: HOT, sh: '#000', scale: sm(t, s1.fer - 0.2, s1.fer + 0.15, outBack) });
      hand(870, CY - 120, 0.9, prog(t, s1.mao - 0.3, s1.mao)); chip('VIDRO MORNO', 860, CY - 300, 34, TE, prog(t, s1.lad - 0.1, s1.lad + 0.2));
      rtxt('COMO?', 540, 470, 120, { color: Y, sh: '#000', scale: sm(t, s1.pos - 0.25, s1.pos + 0.1, outBack) });
    }
    // ================= CENA 2 — a bobina =================
    const s2 = { deb: wt('c2', 'debaixo'), vid: wt('c2', 'vidro'), bob: wt('c2', 'bobina'), cob: wt('c2', 'cobre'), cor: wt('c2', 'corrente'), mud: wt('c2', 'muda'), mil: wt('c2', 'milhares'), seg: wt('c2', 'segundo'), cam: wt('c2', 'campo'), mag: wt('c2', 'magnetico') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.deb, 'scan', { dur: 0.9, gain: 0.6 }); cue(s2.bob, 'reveal'); cue(s2.cor, 'zap'); cue(s2.mil, 'buzz', { dur: 1.2 }); cue(s2.cam, 'riser', { dur: 0.6 });
    function scene2(t) {
      bg(t); header(t);
      const xr = sm(t, s2.deb - 0.2, s2.vid + 0.2), on = sm(t, s2.cor - 0.1, s2.mud);
      ga(1 - 0.6 * xr); pan(CX, CY - 22, 0.9, t, {}); ga(1);
      cooktop(CX, CY, 1, t, { xray: xr, on });
      chip('BOBINA DE COBRE', 540, CY + 260, 40, CU, prog(t, s2.bob - 0.1, s2.bob + 0.2), { tc: INK });
      if (t > s2.mil - 0.3) { const k = sm(t, s2.mil - 0.3, s2.mil, outBack); rtxt('~25.000×', 540, 330, 110, { color: Y, sh: '#000', scale: k }); txt('vai e volta por segundo', 540, 430, 36, { w: 700, color: MU, a: k }); }
      // seta da corrente alternada
      if (on > 0) { const dir = Math.sin(t * 12) > 0 ? 1 : -1; txt(dir > 0 ? '→' : '←', CX, CY + 92 + 0, 60, { w: 900, color: Y, a: on }); }
      field(CX, CY, 1, t, sm(t, s2.cam - 0.2, s2.mag + 0.2));
      chip('CAMPO MAGNÉTICO', 540, 560, 40, TE, prog(t, s2.mag - 0.1, s2.mag + 0.2));
    }
    // ================= CENA 3 — a panela esquenta =================
    const s3 = { atr: wt('c3', 'atravessa'), cor: wt('c3', 'correntes'), fun: wt('c3', 'fundo'), pro: wt('c3', 'propria'), esq: wt('c3', 'esquenta'), fog: wt('c3', 'fogao') };
    cue(s3.atr, 'whoosh', { dur: 0.6 }); cue(s3.cor, 'zap'); cue(s3.esq, 'sizzle', { dur: 1.4 }); cue(s3.fog, 'stamp');
    function scene3(t) {
      bg(t, 'rgba(255,90,42,A)'); header(t);
      const heat = sm(t, s3.cor, s3.esq + 0.4), ed = sm(t, s3.cor - 0.2, s3.cor + 0.3);
      cooktop(CX, CY, 1, t, { xray: 1, on: 1 }); field(CX, CY, 1, t, 1 - 0.5 * heat);
      pan(CX, CY - 22, 0.9, t, { heat, eddy: ed });
      chip('CORRENTES NO FUNDO DA PANELA', 540, CY + 260, 34, Y, prog(t, s3.fun - 0.1, s3.fun + 0.2));
      rtxt('A PANELA', 540, 320, 100, { color: HOT, sh: '#000', scale: sm(t, s3.pro - 0.2, s3.pro + 0.1, outBack) }); rtxt('É O FOGO', 540, 440, 100, { color: WH, sh: '#000', scale: sm(t, s3.esq - 0.2, s3.esq + 0.1, outBack) });
      stampMark(540, 580, 'NÃO O FOGÃO', prog(t, s3.fog - 0.05, s3.fog + 0.12), { size: 56, col: TE });
    }
    // ================= CENA 4 — teste do ímã =================
    const s4 = { met: wt('c4', 'metal'), mag: wt('c4', 'magnetico'), tes: wt('c4', 'teste'), ima: wt('c4', 'ima'), gru: wt('c4', 'gruda'), fun: wt('c4', 'funciona') };
    cue(s4.ima, 'whoosh', { dur: 0.4 }); cue(s4.gru, 'lock'); cue(s4.fun, 'success');
    function scene4(t) {
      bg(t); header(t);
      rtxt('TESTE DO ÍMÃ', 540, 300, 96, { color: Y, sh: '#000', scale: sm(t, s4.tes - 0.25, s4.tes + 0.1, outBack) });
      chip('PRECISA SER METAL MAGNÉTICO', 540, 430, 36, WH, prog(t, s4.met - 0.1, s4.mag + 0.2));
      // panela virada (fundo pra cima) e o ímã chegando
      ctx.save(); ctx.translate(540, 980); ctx.rotate(Math.PI); pan(0, 0, 0.95, t, { empty: true }); ctx.restore();
      const fly = sm(t, s4.ima - 0.2, s4.gru, inOut), mx = lerp(1250, 540, fly), my = lerp(560, 940, fly) + (t > s4.gru ? 0 : 0);
      magnet(mx, my, 0.9, lerp(0.6, 0, fly), prog(t, s4.ima - 0.3, s4.ima));
      if (t > s4.gru) { soft(540, 960, 200, 'rgba(46,196,182,A)', 0.5 * pulse(t, s4.gru, 0.05, 0.6)); chip('GRUDOU = FUNCIONA ✓', 540, 1300, 44, TE, prog(t, s4.fun - 0.2, s4.fun + 0.1)); }
    }
    // ================= CENA 5 — vale a pena? =================
    const s5 = { val: wt('c5', 'vale'), nov: wt('c5', 'noventa'), cal: wt('c5', 'calor'), con: wt('c5', 'conta'), vin: wt('c5', 'vinte'), bar: wt('c5', 'barato'), bot: wt('c5', 'botijao'), dep: wt('c5', 'depende'), reg: wt('c5', 'regiao') };
    cue(s5.val, 'riser', { dur: 0.5 }); cue(s5.nov, 'coin'); cue(s5.vin, 'coin'); cue(s5.dep, 'scratch');
    function scene5(t) {
      bg(t); header(t);
      rtxt('VALE A PENA?', 540, 300, 100, { color: Y, sh: '#000', scale: sm(t, s5.val - 0.2, s5.val + 0.15, outBack) });
      // barra de eficiência
      const ek = sm(t, s5.nov - 0.3, s5.cal + 0.4); if (ek > 0) { ga(clamp(ek * 3)); txt('CALOR QUE VAI PRA PANELA', 540, 450, 32, { w: 800, color: MU }); rr(110, 490, 860, 80, 40); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill(); rr(110, 490, 860 * 0.9 * outC(ek), 80, 40); ctx.fillStyle = TE; ctx.fill(); txt(`~${Math.round(90 * outC(ek))}%`, 140 + 860 * 0.9 * outC(ek) - 90, 532, 50, { w: 900, color: INK }); ga(1); }
      // contas do mês
      const ck = sm(t, s5.con - 0.3, s5.con + 0.2, outBack);
      if (ck > 0) for (const [i, lab, val, col] of [[0, 'INDUÇÃO', 'R$ 45', TE], [1, 'BOTIJÃO', 'R$ 67', OR]]) { const x = 300 + i * 480, y = 800; ctx.save(); ctx.translate(x, y); ctx.scale(ck, ck); rr(-200, -150, 400, 300, 28); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke(); txt(lab, 0, -90, 40, { w: 900, color: col }); txt(val, 0, 10, 96, { w: 900, color: WH }); txt('por mês*', 0, 95, 30, { w: 700, color: MU }); ctx.restore(); }
      if (t > s5.vin - 0.2) { stampMark(540, 1060, '~R$ 20 A MENOS', prog(t, s5.bar - 0.1, s5.bar + 0.1), { size: 60, col: TE, rot: -0.05 }); }
      txt('*2 h/dia • tarifa média ANEEL R$ 0,76/kWh • botijão R$ 100 a cada 45 dias', 540, 1190, 22, { w: 600, color: MU, a: ck });
      chip('DEPENDE DA TARIFA DA SUA REGIÃO', 540, 1300, 36, Y, prog(t, s5.dep - 0.1, s5.dep + 0.2));
    }
    // ================= CENA 6 — CTA afiliado + seguir =================
    const s6 = { dei: wt('c6', 'deixei'), mod: wt('c6', 'modelo'), lin: wt('c6', 'link'), bio: wt('c6', 'bio'), seg: wt('c6', 'segue'), pro: wt('c6', 'proximo') };
    cue(B[5], 'music', { part: 'outro' }); cue(s6.lin, 'pop'); cue(s6.bio, 'ding'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t) {
      bg(t, 'rgba(46,196,182,A)'); header(t);
      // seta animada pra cima (perfil)
      const ak = sm(t, s6.lin - 0.3, s6.lin + 0.1, outBack);
      if (ak > 0) { const bob = Math.sin(t * 8) * 18; ctx.save(); ctx.translate(540, 360 + bob); ctx.scale(ak, ak); ctx.beginPath(); ctx.moveTo(0, -110); ctx.lineTo(90, 0); ctx.lineTo(35, 0); ctx.lineTo(35, 110); ctx.lineTo(-35, 110); ctx.lineTo(-35, 0); ctx.lineTo(-90, 0); ctx.closePath(); ctx.fillStyle = Y; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
      rtxt('LINK NA BIO', 540, 590, 120, { color: WH, sh: '#000', scale: sm(t, s6.bio - 0.25, s6.bio + 0.1, outBack) });
      chip('O MODELO QUE EU INDICARIA', 540, 720, 38, TE, prog(t, s6.mod - 0.1, s6.mod + 0.2));
      cooktop(540, 960, 0.6, t, {}); pan(540, 960 - 13, 0.55, t, { heat: 0.8 });
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1240); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(46,196,182,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : TE; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
      txt('próximo: VALE A PENA? air fryer × forno', 540, 1360, 32, { w: 800, color: MU, a: prog(t, s6.pro - 0.2, s6.pro + 0.2) });
      chip('#publi • link de afiliado', 540, 1450, 26, WH, prog(t, s6.lin, s6.lin + 0.3), { a: 0.85 });
    }

    // ================= legendas =================
    const HL = new Set(['ferve', 'mao', 'possivel', 'bobina', 'cobre', 'milhares', 'campo', 'magnetico', 'atravessa', 'correntes', 'fundo', 'panela', 'esquenta', 'metal', 'teste', 'ima', 'gruda', 'funciona', 'vale', 'noventa', 'vinte', 'barato', 'botijao', 'depende', 'regiao', 'link', 'bio', 'segue']);
    const groups = []; {
      let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); }
      flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; });
    }
    function captions(t) {
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return;
      scr(); const size = 70, font = `900 ${size}px Inter`;
      const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop;
      ctx.save(); ctx.translate(540, 1590); ctx.scale(sc, sc); ctx.globalAlpha = a;
      let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? Y : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // ================= composição =================
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6];
    const XT = 0.16;
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / XT);
      scr(); ctx.globalAlpha = 0.22; const f = Math.floor(t * 12); ctx.drawImage(grain, -((f * 37) % 40), -((f * 53) % 40), W + 40, H + 40); ctx.globalAlpha = 1; ctx.drawImage(vig, 0, 0);
      if (fl > 0) { ctx.globalAlpha = clamp(fl) * 0.85; ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t);
      txt('conteúdo educativo • valores aproximados', 540, 1840, 26, { w: 600, color: 'rgba(255,255,255,0.45)' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
