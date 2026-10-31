/*
 * HALLOWEEN — por que é 31 de outubro: Samhain, véu, fogueiras/disfarce, Todos os Santos, nabo -> abóbora, Dia do Saci.
 * Explicador animado 9:16 (1080x1920). Tudo desenhado genérico (sem marcas nem personagens de terceiros).
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
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  function mulberry(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration;
    const NS = 6;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Gancho: por que hoje? +1.000 anos', 'Samhain: ano-novo celta', 'Véu fino, fogueiras, disfarce', 'Todos os Santos -> Halloween', 'Nabo -> abóbora', 'Dia do Saci + CTA'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ------------------------------------------------ paleta
    const BG0 = '#0a0614', BG1 = '#1d1033', GRID = 'rgba(200,160,255,0.06)', INK = '#0b0714';
    const OR = '#ff8a1f', PU = '#9b5de5', WH = '#f6f2fb', MU = '#9c90b8', Y = '#ffd166', RED = '#ff4d5e', GR = '#5fd37a';
    const PUMP = '#ff7a1a', PUMPD = '#c4520a', STEM = '#4f7a2a', TURN = '#efe3f0', TURNP = '#9b4fb0';

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
    function rtxt(s, x, y, size, o = {}) {
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
    function chip(s, x, y, size, col, k, o = {}) {
      if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7;
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1));
      rr(-w / 2 + 8, -h / 2 + 8, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
      rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill();
      txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1);
    }
    function stampMark(x, y, s, k, o = {}) {
      if (k <= 0) return; const sc = lerp(2.4, 1, outC(k)) * (o.s || 1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(sc, sc); ga(clamp(k * 3));
      const size = o.size || 84, w = tw(s, size, 900) + 70, h = size * 1.45, col = o.col || RED;
      rr(-w / 2, -h / 2, w, h, 16); ctx.fillStyle = 'rgba(11,7,20,0.85)'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.stroke();
      rr(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); ctx.lineWidth = 4; ctx.stroke();
      txt(s, 0, 4, size, { w: 900, color: col });
      ctx.restore(); ga(1);
    }
    function bg(t, tint) {
      scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (tint) soft(W / 2, H * 0.42, 900, tint, 0.16);
      const off = (t * 30) % 90; ctx.lineWidth = 2; ctx.strokeStyle = GRID;
      for (let x = -90 + off; x < W + 90; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = -90 + off; y < H + 90; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
    function header() {
      ga(0.85); rr(290, 120, 500, 64, 32); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
      txt('EM ALTA • COMO FUNCIONA', 540, 153, 28, { w: 800, color: MU }); ga(1);
    }

    // ------------------------------------------------ desenhos próprios
    const RS = mulberry(99); const STARS = Array.from({ length: 120 }, () => [RS() * W, RS() * H * 0.75, 0.8 + RS() * 2.4, RS() * TAU]);
    function stars(t, a = 1) { if (a <= 0) return; for (const [x, y, r, ph] of STARS) { ga(a * (0.3 + 0.3 * Math.sin(t * 2 + ph))); circ(x, y, r, WH); } ga(1); }
    function hills(y, col) { ctx.beginPath(); ctx.moveTo(0, y + 40); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.006 + 1) * 60 + Math.sin(x * 0.019) * 18); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
    // abóbora; lit = brilho interno (0..1); carved = 0..1 rosto aparecendo
    function pumpkin(x, y, r, o = {}) {
      if (r <= 1) return; const lit = o.lit ?? 0, carved = o.carved ?? 1;
      ctx.save(); ctx.translate(x, y);
      if (lit > 0) soft(0, 0, r * 2.4, 'rgba(255,140,30,A)', 0.5 * lit);
      ctx.fillStyle = STEM; rr(-r * 0.09, -r * 1.05, r * 0.18, r * 0.32, r * 0.05); ctx.fill();
      for (const [dx, sx] of [[-0.45, 0.62], [0.45, 0.62], [-0.2, 0.6], [0.2, 0.6], [0, 0.58]]) { ctx.beginPath(); ctx.ellipse(dx * r, 0, sx * r, r * 0.86, 0, 0, TAU); ctx.fillStyle = dx === 0 ? PUMP : (Math.abs(dx) > 0.3 ? PUMPD : '#ef6a12'); ctx.fill(); ctx.lineWidth = r * 0.04; ctx.strokeStyle = INK; ctx.stroke(); }
      if (carved > 0) {
        ctx.globalAlpha *= clamp(carved * 1.5);
        const f = lit > 0 ? `rgb(255,${Math.round(lerp(120, 220, lit))},${Math.round(lerp(20, 90, lit))})` : '#3a1a05';
        ctx.fillStyle = f;
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * r * 0.38, -r * 0.32); ctx.lineTo(s * r * 0.16, -r * 0.05); ctx.lineTo(s * r * 0.55, -r * 0.05); ctx.closePath(); ctx.fill(); }
        ctx.beginPath(); ctx.moveTo(0, -r * 0.02); ctx.lineTo(-r * 0.09, r * 0.13); ctx.lineTo(r * 0.09, r * 0.13); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-r * 0.5, r * 0.25);
        const teeth = 6; for (let i = 0; i <= teeth; i++) { const xx = lerp(-r * 0.5, r * 0.5, i / teeth); ctx.lineTo(xx, r * 0.25 + (i % 2 ? r * 0.1 : 0)); }
        ctx.quadraticCurveTo(0, r * 0.75, -r * 0.5, r * 0.25); ctx.fill();
      }
      ctx.restore();
    }
    // nabo esculpido (tradição irlandesa)
    function turnip(x, y, r, o = {}) {
      if (r <= 1) return; const lit = o.lit ?? 0;
      ctx.save(); ctx.translate(x, y);
      if (lit > 0) soft(0, 0, r * 2.2, 'rgba(255,170,60,A)', 0.4 * lit);
      ctx.fillStyle = GR; for (const a of [-0.5, -0.15, 0.2, 0.5]) { ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -r * 1.25, r * 0.13, r * 0.42, 0, 0, TAU); ctx.fill(); ctx.restore(); }
      ctx.beginPath(); ctx.moveTo(0, r * 1.3); ctx.bezierCurveTo(r * 1.15, r * 0.6, r * 1.05, -r * 0.95, 0, -r * 0.92); ctx.bezierCurveTo(-r * 1.05, -r * 0.95, -r * 1.15, r * 0.6, 0, r * 1.3); ctx.closePath();
      ctx.fillStyle = TURN; ctx.fill(); ctx.lineWidth = r * 0.05; ctx.strokeStyle = INK; ctx.stroke();
      ctx.save(); ctx.clip(); ctx.fillStyle = TURNP; ctx.fillRect(-r * 1.2, -r * 1.0, r * 2.4, r * 0.55); ctx.restore();
      const f = lit > 0 ? '#ffb44a' : '#3a2a10'; ctx.fillStyle = f;
      for (const s of [-1, 1]) { circ(s * r * 0.33, r * 0.05, r * 0.14, f); }
      ctx.beginPath(); ctx.ellipse(0, r * 0.55, r * 0.35, r * 0.13, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
    function fire(x, y, s, t, k = 1) {
      if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
      soft(0, -60, 260, 'rgba(255,140,40,A)', 0.55);
      ctx.fillStyle = '#5a3a22'; for (const a of [-0.35, 0.35]) { ctx.save(); ctx.rotate(a); rr(-110, -14, 220, 28, 12); ctx.fill(); ctx.restore(); }
      const fl = (c, w, h, ph) => { const wob = Math.sin(t * 11 + ph) * 8; ctx.beginPath(); ctx.moveTo(-w, 0); ctx.quadraticCurveTo(-w * 0.9 + wob, -h * 0.6, wob, -h); ctx.quadraticCurveTo(w * 0.9 + wob, -h * 0.6, w, 0); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); };
      fl('#ff5a1f', 80, 210 + Math.sin(t * 9) * 14, 0); fl('#ffa51f', 56, 150 + Math.sin(t * 13) * 10, 1); fl('#ffe066', 30, 90 + Math.sin(t * 15) * 8, 2);
      ctx.restore();
    }
    function person(x, y, s, col, o = {}) { // silhueta simples
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
      ctx.fillStyle = col; circ(0, -150, 46, col); rr(-52, -100, 104, 150, 40); ctx.fill(); rr(-44, 40, 34, 90, 14); ctx.fill(); rr(10, 40, 34, 90, 14); ctx.fill();
      if (o.ash) { ctx.globalAlpha *= o.ash; ctx.fillStyle = '#3b3b45'; ctx.beginPath(); ctx.arc(0, -150, 46, 0, TAU); ctx.fill(); ctx.fillStyle = WH; circ(-16, -158, 8, WH); circ(16, -158, 8, WH); }
      ctx.restore();
    }
    function ghost(x, y, s, t, a = 1) {
      if (a <= 0) return; ctx.save(); ctx.translate(x, y + Math.sin(t * 2.4 + x) * 10); ctx.scale(s, s); ctx.globalAlpha *= a;
      ctx.beginPath(); ctx.arc(0, -40, 50, Math.PI, 0); ctx.lineTo(50, 50); for (let i = 0; i < 5; i++) ctx.quadraticCurveTo(50 - i * 20 - 10, 66, 50 - (i + 1) * 20, 50); ctx.closePath();
      ctx.fillStyle = 'rgba(230,225,255,0.85)'; ctx.fill(); circ(-17, -40, 7, INK); circ(17, -40, 7, INK); ctx.restore();
    }
    function calCard(x, y, s, top, big, k, o = {}) {
      if (k <= 0) return; ctx.save(); ctx.translate(x, y); const sc = s * outBack(k); ctx.scale(sc, sc);
      rr(-170, -170, 340, 340, 36); ctx.fillStyle = WH; ctx.fill(); rr(-170, -170, 340, 92, [36, 36, 0, 0]); ctx.fillStyle = o.col || OR; ctx.fill();
      txt(top, 0, -123, 50, { w: 900, color: WH }); txt(big, 0, 42, o.size || 170, { w: 900, color: INK }); ctx.restore();
    }
    // gorro vermelho + redemoinho (folclore, desenho genérico)
    function whirl(x, y, s, t, k) {
      if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * outBack(k), s * outBack(k));
      for (let i = 0; i < 7; i++) { const yy = 120 - i * 34, rx = 30 + i * 22, ph = t * 6 + i; ctx.beginPath(); ctx.ellipse(Math.sin(ph) * 6, yy, rx, rx * 0.22, 0, 0, TAU); ctx.lineWidth = 7; ctx.strokeStyle = `rgba(220,190,140,${0.25 + i * 0.07})`; ctx.stroke(); }
      ctx.save(); ctx.translate(Math.sin(t * 3) * 10, -150); ctx.rotate(Math.sin(t * 2) * 0.12);
      ctx.beginPath(); ctx.moveTo(-90, 40); ctx.quadraticCurveTo(-60, -80, 70, -70); ctx.quadraticCurveTo(30, -20, 90, 40); ctx.closePath(); ctx.fillStyle = '#e63946'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      rr(-100, 28, 200, 30, 14); ctx.fillStyle = '#b5202d'; ctx.fill(); ctx.stroke();
      ctx.restore(); ctx.restore();
    }

    // ================= CENA 1 — GANCHO =================
    const s1 = { hal: wt('c1', 'halloween'), hoj: wt('c1', 'hoje'), tri: wt('c1', 'trinta'), out: wt('c1', 'outubro'), res: wt('c1', 'resposta'), mil: wt('c1', 'mil'), ano: wt('c1', 'anos') };
    cue(0, 'music', { part: 'intro' }); cue(s1.hal, 'reveal'); cue(s1.hoj, 'pop'); cue(s1.tri, 'card'); cue(s1.out, 'music', { part: 'groove' }); cue(s1.res, 'riser', { dur: 0.5 }); cue(s1.mil, 'stamp');
    function scene1(t) {
      bg(t, 'rgba(255,138,31,A)'); stars(t, sm(t, 0, 0.6)); header();
      hills(1330, '#120a20');
      const pk = sm(t, 0.0, 0.6, outBack);
      pumpkin(540, 1100, 230 * pk, { lit: sm(t, s1.hal - 0.2, s1.hal + 0.3), carved: 1 });
      ghost(170, 900, 0.9, t, sm(t, s1.hoj - 0.2, s1.hoj + 0.3) * 0.8); ghost(910, 820, 1.1, t, sm(t, s1.hoj - 0.1, s1.hoj + 0.4) * 0.8);
      rtxt('POR QUE', 540, 300, 96, { color: WH, sh: '#000', scale: sm(t, 0.05, 0.4, outBack) });
      rtxt('HOJE?', 540, 420, 140, { color: OR, sh: '#000', scale: sm(t, s1.hoj - 0.2, s1.hoj + 0.1, outBack) });
      chip('31 DE OUTUBRO', 540, 560, 50, Y, prog(t, s1.tri - 0.2, s1.tri + 0.1));
      stampMark(540, 720, '+ DE 1.000 ANOS', prog(t, s1.mil - 0.05, s1.mil + 0.12), { size: 76, col: Y });
    }

    // ================= CENA 2 — SAMHAIN =================
    const s2 = { cel: wt('c2', 'celtas'), dat: wt('c2', 'data'), sam: wt('c2', 'samhain'), ano: wt('c2', 'ano'), ver: wt('c2', 'verao'), col: wt('c2', 'colheita') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.cel, 'whoosh', { dur: 0.4 }); cue(s2.sam, 'reveal'); cue(s2.ano, 'bell'); cue(s2.ver, 'swoosh'); cue(s2.col, 'chop');
    function scene2(t) {
      bg(t, 'rgba(155,93,229,A)'); header();
      const ak = sm(t, B[1], B[1] + 0.5);
      // paisagem: sol se pondo (fim do verão) e campo colhido
      ctx.save(); ctx.globalAlpha *= ak; rr(90, 760, 900, 640, 40); ctx.save(); ctx.clip();
      const sk = sm(t, s2.ver - 0.3, s2.ver + 1.0);
      const g = ctx.createLinearGradient(0, 760, 0, 1400); g.addColorStop(0, lerp(0, 1, sk) > 0.5 ? '#1d1440' : '#3a6fb0'); g.addColorStop(1, sk > 0.5 ? '#ff7a3c' : '#9fd0ff'); ctx.fillStyle = g; ctx.fillRect(90, 760, 900, 640);
      const sunY = lerp(900, 1240, sk); soft(760, sunY, 200, 'rgba(255,190,60,A)', 0.6); circ(760, sunY, 70, '#ffb627');
      hills(1180, '#2a1a3a');
      // pedras em círculo (genéricas)
      for (const [x, h] of [[220, 150], [320, 190], [430, 160], [620, 175], [720, 140]]) { rr(x - 30, 1230 - h, 60, h, 12); ctx.fillStyle = '#6c6480'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); }
      const ck = sm(t, s2.col - 0.3, s2.col + 0.4);
      ctx.fillStyle = '#3a2a18'; ctx.fillRect(90, 1260, 900, 140);
      for (let i = 0; i < 18; i++) { const x = 110 + i * 50, h = lerp(80, 16, ck); line([[x, 1300], [x, 1300 - h]], 8, '#e6c56a'); }
      ctx.restore(); ctx.restore();
      rtxt('OS CELTAS', 540, 300, 80, { color: WH, sh: '#000', scale: sm(t, s2.cel - 0.2, s2.cel + 0.15, outBack) });
      rtxt('SAMHAIN', 540, 450, 130, { color: OR, sh: '#000', scale: sm(t, s2.sam - 0.25, s2.sam + 0.1, outBack) });
      txt('(PRONUNCIA-SE "SÁUIN")', 540, 550, 32, { w: 800, color: MU, a: prog(t, s2.sam, s2.sam + 0.3) });
      chip('ANO-NOVO CELTA', 540, 660, 50, Y, prog(t, s2.ano - 0.2, s2.ano + 0.1));
      chip('FIM DO VERÃO', 300, 1480, 40, WH, prog(t, s2.ver - 0.2, s2.ver + 0.1));
      chip('FIM DA COLHEITA', 780, 1480, 40, '#e6c56a', prog(t, s2.col - 0.2, s2.col + 0.1));
    }

    // ================= CENA 3 — véu, fogueiras, disfarce =================
    const s3 = { acr: wt('c3', 'acreditavam'), veu: wt('c3', 'veu'), viv: wt('c3', 'vivos'), mor: wt('c3', 'mortos'), fin: wt('c3', 'fino'), fog: wt('c3', 'fogueiras'), cin: wt('c3', 'cinza'), dis: wt('c3', 'disfarcar') };
    cue(B[2], 'music', { part: 'stop' }); cue(s3.veu, 'wind', { dur: 1.0 }); cue(s3.mor, 'glitch', { dur: 0.3 }); cue(s3.fin, 'scan', { dur: 0.6, gain: 0.6 }); cue(s3.fog, 'fire'); cue(s3.fog, 'music', { part: 'drop' }); cue(s3.cin, 'wipe', { dur: 0.4 }); cue(s3.dis, 'success');
    function scene3(t) {
      bg(t); ctx.fillStyle = 'rgba(15,8,30,0.5)'; ctx.fillRect(0, 0, W, H); stars(t, 0.6); header();
      const out = sm(t, s3.fog - 0.35, s3.fog);
      if (out < 1) {
        ga(1 - out);
        rtxt('NESSA NOITE', 540, 300, 76, { color: WH, sh: '#000', scale: sm(t, B[2] + 0.1, B[2] + 0.45, outBack) });
        const vk = sm(t, s3.viv - 0.3, s3.viv + 0.1), mk2 = sm(t, s3.mor - 0.3, s3.mor + 0.1);
        person(270, 1050, 1.4, '#ffd9a8', { a: vk }); txt('VIVOS', 270, 1290, 48, { w: 900, color: Y, a: vk });
        ghost(810, 950, 1.6, t, mk2); txt('MORTOS', 810, 1290, 48, { w: 900, color: '#cfc8ff', a: mk2 });
        // véu: cortina ondulada que fica fina
        const thin = sm(t, s3.fin - 0.2, s3.fin + 0.5), vA = sm(t, s3.veu - 0.3, s3.veu + 0.1);
        if (vA > 0) { const vw = lerp(170, 26, thin); ctx.save(); ctx.globalAlpha *= vA * lerp(0.9, 0.45, thin);
          ctx.beginPath(); for (let y = 640; y <= 1360; y += 20) ctx.lineTo(540 - vw / 2 + Math.sin(y * 0.02 + t * 3) * 18, y); for (let y = 1360; y >= 640; y -= 20) ctx.lineTo(540 + vw / 2 + Math.sin(y * 0.02 + t * 3) * 18, y); ctx.closePath();
          ctx.fillStyle = 'rgba(200,180,255,0.7)'; ctx.fill(); ctx.restore(); }
        chip('O VÉU FICAVA FINO', 540, 500, 48, PU, prog(t, s3.fin - 0.25, s3.fin + 0.05), { tc: WH });
        ga(1);
      }
      if (out > 0) {
        ga(out);
        rtxt('FOGUEIRAS', 540, 300, 96, { color: OR, sh: '#000', scale: out });
        hills(1250, '#120a20');
        fire(540, 1180, 1.25, t, out);
        const ak = sm(t, s3.cin - 0.2, s3.cin + 0.5);
        person(230, 1170, 1.1, '#ffd9a8', { ash: ak }); person(850, 1170, 1.1, '#ffd9a8', { ash: ak });
        chip('CINZA NO ROSTO', 540, 520, 46, WH, prog(t, s3.cin - 0.25, s3.cin + 0.05));
        chip('DISFARCE → FANTASIA', 540, 650, 50, Y, prog(t, s3.dis - 0.25, s3.dis + 0.05));
        ga(1);
      }
    }

    // ================= CENA 4 — Todos os Santos -> Halloween =================
    const s4 = { sec: wt('c4', 'seculo'), pap: wt('c4', 'papa'), fix: wt('c4', 'fixou'), tod: wt('c4', 'todos'), pri: wt('c4', 'primeiro'), nov: wt('c4', 'novembro'), ves: wt('c4', 'vespera'), ing: wt('c4', 'ingles'), hal: wt('c4', 'halloween') };
    cue(B[3], 'music', { part: 'safe' }); cue(s4.sec, 'whoosh', { dur: 0.4 }); cue(s4.fix, 'stamp'); cue(s4.pri, 'card'); cue(s4.ves, 'card'); cue(s4.ing, 'type', { n: 10, rate: 16 }); cue(s4.hal, 'impact', { gain: 0.8 }); cue(s4.hal, 'music', { part: 'groove' });
    function scene4(t) {
      bg(t, 'rgba(255,209,102,A)'); header();
      rtxt('SÉCULO VIII', 540, 290, 92, { color: WH, sh: '#000', scale: sm(t, s4.sec - 0.2, s4.sec + 0.15, outBack) });
      txt('PAPA GREGÓRIO III', 540, 395, 44, { w: 900, color: MU, a: prog(t, s4.pap - 0.1, s4.pap + 0.3) });
      calCard(330, 690, 1, 'OUT', '31', prog(t, s4.ves - 0.25, s4.ves + 0.1), { col: OR });
      calCard(750, 690, 1, 'NOV', '1º', prog(t, s4.fix - 0.25, s4.fix + 0.1), { col: PU, size: 150 });
      chip('TODOS OS SANTOS', 750, 920, 38, Y, prog(t, s4.tod - 0.2, s4.tod + 0.1));
      chip('A VÉSPERA', 330, 920, 38, WH, prog(t, s4.ves - 0.1, s4.ves + 0.2));
      // ALL HALLOWS' EVE -> HALLOWEEN
      const ek = prog(t, s4.ing - 0.25, s4.ing + 0.1), mg = sm(t, s4.hal - 0.35, s4.hal + 0.1);
      if (ek > 0) {
        ga(ek * (1 - mg)); txt('ALL HALLOWS’ EVE', 540, 1110 + mg * 40, 78, { w: 900, color: WH, stroke: 10 });
        txt('"VÉSPERA DE TODOS OS SANTOS"', 540, 1200, 32, { w: 800, color: MU }); ga(1);
        line([[540, 1250], [540, 1300]], 8, Y); if (mg > 0) { ctx.beginPath(); ctx.moveTo(515, 1290); ctx.lineTo(540, 1320); ctx.lineTo(565, 1290); ctx.lineWidth = 8; ctx.strokeStyle = Y; ctx.stroke(); }
      }
      rtxt('HALLOWEEN', 540, 1410, 120, { color: OR, sh: '#000', scale: sm(t, s4.hal - 0.15, s4.hal + 0.2, outBack) });
    }

    // ================= CENA 5 — nabo -> abóbora =================
    const s5 = { abo: wt('c5', 'abobora'), irl: wt('c5', 'irlanda'), esc: wt('c5', 'esculpiam'), nab: wt('c5', 'nabos'), est: wt('c5', 'estados'), imi: wt('c5', 'imigrantes'), tro: wt('c5', 'trocaram'), ab2: wt('c5', 'abobora', 1), fac: wt('c5', 'facil') };
    cue(B[4], 'music', { part: 'safe' }); cue(s5.abo, 'boing'); cue(s5.nab, 'pop'); cue(s5.est, 'whoosh', { dur: 0.6 }); cue(s5.tro, 'swoosh'); cue(s5.ab2, 'reveal'); cue(s5.fac, 'ding');
    function scene5(t) {
      bg(t, 'rgba(255,138,31,A)'); header();
      const q = sm(t, s5.abo - 0.2, s5.abo + 0.15, outBack), qo = sm(t, s5.irl - 0.2, s5.irl + 0.2);
      rtxt('E A ABÓBORA?', 540, 300, 92, { color: OR, sh: '#000', scale: q });
      // mapa esquemático: Irlanda -> oceano -> EUA
      const mk2 = sm(t, s5.irl - 0.3, s5.irl + 0.2);
      if (mk2 > 0) { ga(mk2); rr(90, 470, 900, 300, 40); ctx.fillStyle = '#123050'; ctx.fill();
        ctx.fillStyle = '#2f6b45'; ctx.beginPath(); ctx.ellipse(860, 600, 70, 95, 0.3, 0, TAU); ctx.fill(); txt('IRLANDA', 860, 730, 30, { w: 900, color: WH });
        ctx.beginPath(); ctx.moveTo(90, 500); ctx.lineTo(300, 520); ctx.lineTo(330, 640); ctx.lineTo(250, 740); ctx.lineTo(90, 740); ctx.closePath(); ctx.fill(); txt('EUA', 200, 610, 34, { w: 900, color: WH });
        const pk = sm(t, s5.est - 0.2, s5.tro + 0.2);
        const px = lerp(780, 340, pk), py = 600 - Math.sin(pk * Math.PI) * 70;
        line([[780, 600], [lerp(780, 340, pk * 0.98), 600 - Math.sin(pk * 0.98 * Math.PI) * 70]], 6, Y, [14, 12]);
        if (pk > 0) { ctx.save(); ctx.translate(px, py); ctx.fillStyle = WH; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(30, 0); ctx.lineTo(20, 18); ctx.lineTo(-24, 18); ctx.closePath(); ctx.fill(); line([[0, 0], [0, -40]], 4, WH); ctx.beginPath(); ctx.moveTo(2, -38); ctx.lineTo(26, -8); ctx.lineTo(2, -8); ctx.closePath(); ctx.fill(); ctx.restore(); }
        ga(1); }
      chip('IMIGRANTES IRLANDESES', 540, 830, 38, WH, prog(t, s5.imi - 0.2, s5.imi + 0.1));
      // nabo -> abóbora
      const nk = sm(t, s5.esc - 0.3, s5.nab + 0.1, outBack), sw = sm(t, s5.tro - 0.2, s5.ab2 + 0.1);
      turnip(lerp(540, 290, sw), 1170, 130 * nk, { lit: prog(t, s5.nab, s5.nab + 0.4) });
      if (nk > 0) txt('NABO', lerp(540, 290, sw), 1390, 44, { w: 900, color: TURN, a: nk });
      if (sw > 0) { txt('→', 540, 1170, 90, { w: 900, color: WH, a: sw });
        const pk2 = sm(t, s5.ab2 - 0.25, s5.ab2 + 0.15, outBack); pumpkin(790, 1180, 160 * pk2, { lit: prog(t, s5.ab2, s5.ab2 + 0.4) }); if (pk2 > 0) txt('ABÓBORA', 790, 1390, 44, { w: 900, color: OR, a: pk2 }); }
      chip('MAIS FÁCIL DE ESCULPIR', 540, 1470, 40, Y, prog(t, s5.fac - 0.25, s5.fac + 0.05));
    }

    // ================= CENA 6 — Dia do Saci + CTA =================
    const s6 = { bra: wt('c6', 'brasil'), sac: wt('c6', 'saci'), fol: wt('c6', 'folclore'), tim: wt('c6', 'time'), ha: wt('c6', 'halloween'), sa2: wt('c6', 'saci', 1), com: wt('c6', 'comenta'), seg: wt('c6', 'segue'), ama: wt('c6', 'amanha') };
    cue(B[5], 'music', { part: 'outro' }); cue(s6.sac, 'wind', { dur: 0.8 }); cue(s6.sac, 'reveal'); cue(s6.fol, 'sparkle'); cue(s6.ha, 'pop'); cue(s6.sa2, 'pop'); cue(s6.com, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t) {
      bg(t, 'rgba(95,211,122,A)'); stars(t, 0.4); header();
      chip('NO BRASIL', 540, 270, 44, WH, prog(t, s6.bra - 0.2, s6.bra + 0.1));
      rtxt('DIA DO SACI', 540, 390, 110, { color: '#ff5a5f', sh: '#000', scale: sm(t, s6.sac - 0.25, s6.sac + 0.1, outBack) });
      whirl(540, 720, 1.0, t, sm(t, s6.bra - 0.1, s6.bra + 0.5));
      txt('VALORIZAR O FOLCLORE', 540, 920, 44, { w: 900, color: GR, a: prog(t, s6.fol - 0.3, s6.fol) });
      // enquete
      const tk = prog(t, s6.tim - 0.2, s6.tim + 0.1);
      if (tk > 0) { rtxt('VOCÊ É TIME…', 540, 1030, 64, { color: WH, sh: '#000', scale: outBack(tk) }); }
      for (const [i, lbl, col, tt] of [[0, 'HALLOWEEN', OR, s6.ha], [1, 'SACI', '#e63946', s6.sa2]]) {
        const k = prog(t, tt - 0.25, tt + 0.1); if (k <= 0) continue; const x = [290, 790][i];
        ctx.save(); ctx.translate(x, 1160); ctx.scale(outBack(k), outBack(k)); rr(-210, -56, 420, 112, 40); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); txt(lbl, 0, 3, 50, { w: 900, color: WH }); ctx.restore();
      }
      txt('OU', 540, 1160, 40, { w: 900, color: MU, a: prog(t, s6.sa2 - 0.3, s6.sa2) });
      txt('COMENTA AÍ ↓', 540, 1260, 38, { w: 900, color: Y, a: prog(t, s6.com - 0.2, s6.com + 0.1) });
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1390); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 360, 'rgba(255,138,31,A)', 0.35); rr(-250, -66, 500, 132, 66); ctx.fillStyle = press ? WH : OR; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 58, { w: 900, color: INK }); ctx.restore(); }
      txt('AMANHÃ: OUTRO ASSUNTO DO DIA', 540, 1490, 32, { w: 900, color: WH, a: prog(t, s6.ama - 0.2, s6.ama + 0.2) });
    }

    // ================= legendas =================
    const HL = new Set(['halloween', 'hoje', 'trinta', 'outubro', 'mil', 'anos', 'celtas', 'samhain', 'novo', 'verao', 'colheita', 'veu', 'vivos', 'mortos', 'fino', 'fogueiras', 'cinza', 'disfarcar', 'seculo', 'oito', 'gregorio', 'santos', 'primeiro', 'novembro', 'vespera', 'abobora', 'irlanda', 'nabos', 'estados', 'unidos', 'imigrantes', 'facil', 'brasil', 'saci', 'folclore', 'comenta', 'segue']);
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
      ctx.save(); ctx.translate(540, 1620); ctx.scale(sc, sc); ctx.globalAlpha = a;
      let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? OR : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
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
      if (fl > 0) { ctx.globalAlpha = clamp(fl) * 0.85; ctx.fillStyle = '#05030a'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t);
      txt('fontes: World History Encyclopedia • Britannica • SBT News', 540, 1840, 26, { w: 600, color: 'rgba(255,255,255,0.45)' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
