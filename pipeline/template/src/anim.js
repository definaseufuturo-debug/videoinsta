/*
 * CANETA EMAGRECEDORA POR DENTRO — agonistas de GLP-1, explicador animado, 9:16 (1080x1920)
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
    const NAMES = ['Gancho: -20% e não queima gordura', 'GLP-1 natural: saciedade e insulina', 'Dura 2 min: a enzima destrói', 'Versão modificada: 1 semana', 'Efeitos e efeito rebote', 'Receita retida, Anvisa e CTA'];
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
      txt('COMO FUNCIONA POR DENTRO', 540, 153, 28, { w: 800, color: MU }); ga(1);
    }
    const PEN = '#e8edf2', LIQ = '#7fd8ff', GLP = Y, DRUG = TE;
    // caneta genérica (sem marca): horizontal, centro no meio do corpo; o.inj = 0..1 êmbolo
    function pen(x, y, s, rot, t, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      if (o.glow) soft(0, 0, 420, 'rgba(46,196,182,A)', 0.35 * o.glow);
      // agulha
      if (o.needle) { line([[-330, 0], [-380, 0]], 6, '#c9d1d9'); rr(-332, -16, 26, 32, 4); ctx.fillStyle = '#9aa6b2'; ctx.fill(); }
      rr(-310, -52, 120, 104, 22); ctx.fillStyle = '#cfd8e0'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); // ponta
      rr(-200, -62, 400, 124, 30); ctx.fillStyle = PEN; ctx.fill(); ctx.stroke(); // corpo
      rr(-150, -30, 190, 60, 14); ctx.fillStyle = '#123'; ctx.fill(); // janela
      const lv = 1 - (o.inj || 0) * 0.35; rr(-146, -26, 182 * lv, 52, 12); ctx.fillStyle = LIQ; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-140, -22, 170 * lv, 8);
      for (let i = 0; i < 5; i++) line([[60 + i * 22, -40], [60 + i * 22, -20]], 4, '#9aa6b2');
      rr(200, -56, 110, 112, 18); ctx.fillStyle = '#2c3e50'; ctx.fill(); ctx.lineWidth = 7; ctx.stroke(); // seletor de dose
      for (let i = 0; i < 7; i++) line([[214 + i * 14, -46], [214 + i * 14, 46]], 4, '#4b647d');
      rr(306 - (o.inj || 0) * 40, -34, 50, 68, 12); ctx.fillStyle = TE; ctx.fill(); ctx.lineWidth = 6; ctx.stroke(); // botão
      ctx.restore();
    }
    // cadeia de "contas" representando a molécula (peptídeo)
    function chain(x, y, s, t, o = {}) {
      const n = o.n || 9, col = o.col || GLP, broken = o.broken || 0;
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      for (let i = 0; i < n; i++) {
        const bx = (i - (n - 1) / 2) * 62, by = Math.sin(t * 3 + i * 0.8) * 16, split = broken * (i < n / 2 ? -1 : 1) * (60 + Math.abs(i - n / 2) * 25), fall = broken * broken * (i % 3) * 120;
        if (i > 0 && broken < 0.05) { const px = (i - 1 - (n - 1) / 2) * 62, py = Math.sin(t * 3 + (i - 1) * 0.8) * 16; line([[px, py], [bx, by]], 10, 'rgba(255,255,255,0.5)'); }
        ga(1 - broken * 0.6); circ(bx + split, by + fall, 26, col, 5, INK); line([[bx + split - 10, by + fall - 9], [bx + split - 2, by + fall - 14]], 5, 'rgba(255,255,255,0.7)'); ga(1);
      }
      if (o.tail) { const k = o.tail, ex = (n - 1) / 2 * 62 + 26; ctx.beginPath(); for (let j = 0; j <= 20; j++) { const u = j / 20; ctx.lineTo(ex + u * 170 * k, Math.sin(u * 9 + t * 4) * 18 + 10); } ctx.lineWidth = 14; ctx.strokeStyle = Y; ctx.lineCap = 'round'; ctx.stroke(); }
      if (o.shield) { const k = o.shield; ctx.save(); ctx.scale(k, k); ctx.beginPath(); ctx.ellipse(0, 0, (n / 2) * 62 + 70, 90, 0, 0, TAU); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,209,102,0.85)'; ctx.setLineDash([22, 14]); ctx.lineDashOffset = -t * 40; ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
      ctx.restore();
    }
    function pac(x, y, s, t, o = {}) { // enzima "come-come"
      const m = o.mouth ?? (0.25 + 0.25 * Math.abs(Math.sin(t * 14)));
      ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 90, m, TAU - m); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      circ(10, -48, 12, INK); line([[-20, -78], [25, -66]], 8, INK);
      ctx.restore();
      if (o.label) txt('ENZIMA DPP-4', x, y + 125, 30, { w: 900, color: RED, stroke: 8 });
    }
    function flame(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const w = Math.sin(t * 12) * 6;
      ctx.beginPath(); ctx.moveTo(0, 90); ctx.bezierCurveTo(-90, 80, -80, -20, -20 + w, -110); ctx.bezierCurveTo(-10, -40, 30, -40, 40, -80 + w); ctx.bezierCurveTo(100, 0, 90, 80, 0, 90); ctx.fillStyle = OR; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 80); ctx.bezierCurveTo(-40, 70, -40, 10, -5, -30); ctx.bezierCurveTo(10, 10, 50, 20, 0, 80); ctx.fillStyle = Y; ctx.fill(); ctx.restore(); }

    // ================= CENA 1 — GANCHO =================
    const s1 = { est: wt('c1', 'estudos'), can: wt('c1', 'caneta'), per: wt('c1', 'perdeu'), vin: wt('c1', 'vinte'), pes: wt('c1', 'peso'), nao: wt('c1', 'nao'), que: wt('c1', 'queima'), gor: wt('c1', 'gordura'), imi: wt('c1', 'imita'), hor: wt('c1', 'hormonio'), cor: wt('c1', 'corpo') };
    cue(0, 'music', { part: 'intro' }); cue(s1.can - 0.2, 'whoosh', { dur: 0.5 }); cue(s1.can, 'pop'); cue(s1.vin, 'riser', { dur: 0.6 }); cue(s1.pes, 'impact', { gain: 0.8 });
    cue(s1.que, 'fire'); cue(s1.gor, 'stamp'); cue(s1.imi, 'sparkle'); cue(s1.imi, 'music', { part: 'groove' });
    function scene1(t) {
      bg(t, 'rgba(46,196,182,A)'); header(t);
      const pk = sm(t, s1.can - 0.35, s1.can + 0.3, outBack), shrink = sm(t, s1.imi - 0.3, s1.imi + 0.3);
      if (pk > 0) pen(540, lerp(640, 520, shrink), pk * lerp(1.25, 0.9, shrink), lerp(-0.6, -0.12, outC(prog(t, s1.can - 0.35, s1.can + 0.5))) + Math.sin(t * 1.5) * 0.03, t, { glow: 0.6 + 0.4 * Math.sin(t * 3) });
      rtxt('CANETA EMAGRECEDORA', 540, 300, 66, { color: WH, sh: '#000', scale: sm(t, s1.est - 0.1, s1.est + 0.3, outBack) });
      // -20%
      if (t > s1.vin - 0.3 && t < s1.nao + 0.1) {
        const k = sm(t, s1.vin - 0.3, s1.vin, outBack) * (1 - prog(t, s1.nao - 0.2, s1.nao + 0.1)), v = Math.round(20 * outC(prog(t, s1.vin - 0.2, s1.pes)));
        rtxt(`-${v}%`, 540, 950, 210, { color: TE, sh: '#000', scale: k });
        txt('do peso • média em estudos clínicos', 540, 1100, 36, { w: 700, color: MU, a: k });
      }
      // não queima gordura
      if (t > s1.nao - 0.2 && t < s1.imi + 0.2) {
        const k = sm(t, s1.nao - 0.2, s1.que, outBack) * (1 - prog(t, s1.imi - 0.2, s1.imi + 0.2));
        if (k > 0) { flame(540, 960, 1.3 * k, t); const x = sm(t, s1.gor - 0.1, s1.gor + 0.15); if (x > 0) { line([[400, 820], [lerp(400, 680, x), lerp(820, 1100, x)]], 24, RED); line([[680, 820], [lerp(680, 400, x), lerp(820, 1100, x)]], 24, RED); }
          stampMark(540, 1260, 'NÃO QUEIMA GORDURA', prog(t, s1.gor, s1.gor + 0.16) * k, { size: 62 }); }
      }
      // imita um hormônio
      if (t > s1.imi - 0.2) {
        chain(540, 920, sm(t, s1.imi - 0.2, s1.hor, outBack), t, { col: GLP });
        chip('IMITA UM HORMÔNIO', 540, 1110, 48, Y, prog(t, s1.hor - 0.2, s1.hor + 0.15));
        chip('QUE SEU CORPO JÁ TEM', 540, 1220, 36, WH, prog(t, s1.cor - 0.2, s1.cor + 0.15));
      }
    }

    // ================= CENA 2 — o hormônio natural =================
    const s2 = { com: wt('c2', 'come'), int: wt('c2', 'intestino'), lib: wt('c2', 'libera'), glp: wt('c2', 'glp1'), avi: wt('c2', 'avisa'), cer: wt('c2', 'cerebro'), che: wt('c2', 'chega'), sat: wt('c2', 'satisfeito'), man: wt('c2', 'manda'), pan: wt('c2', 'pancreas'), ins: wt('c2', 'insulina') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.com, 'chop'); cue(s2.com + 0.3, 'plop'); cue(s2.int, 'scan', { dur: 0.8, gain: 0.6 }); cue(s2.glp, 'pop'); cue(s2.avi, 'swoosh'); cue(s2.che, 'ding'); cue(s2.sat, 'success'); cue(s2.pan, 'swoosh'); cue(s2.ins, 'water', { dur: 0.6 });
    const BODY = { brain: [540, 330], stom: [470, 800], pan: [590, 905], gut: [540, 1100] };
    function body(t, o) {
      // silhueta
      ga(0.9); circ(540, 340, 150, '#1f3a4a', 6, 'rgba(255,255,255,0.25)');
      rr(330, 520, 420, 760, 160); ctx.fillStyle = '#1f3a4a'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke(); rr(495, 470, 90, 70, 20); ctx.fillStyle = '#1f3a4a'; ctx.fill(); ga(1);
      // cérebro
      const bg2 = o.brain || 0; soft(540, 330, 220, 'rgba(255,209,102,A)', 0.5 * bg2);
      ctx.save(); ctx.translate(540, 330); ctx.beginPath(); for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI; ctx.arc(Math.cos(a) * 75, Math.sin(a) * 50 + 15, 34, 0, TAU); } ctx.fillStyle = '#ff9fb7'; ctx.fill(); rr(-105, 10, 210, 50, 25); ctx.fill(); ctx.restore();
      line([[540, 280], [540, 380]], 5, '#d86f8c');
      // esôfago + estômago
      line([[540, 470], [540, 640], [500, 720]], 18, '#e98c8c');
      ctx.save(); ctx.translate(...BODY.stom); ctx.rotate(-0.3); ctx.beginPath(); ctx.ellipse(0, 0, 120, 80, 0, 0, TAU); ctx.fillStyle = '#ff8a8a'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
      // pâncreas
      const pg = o.pan || 0; soft(...BODY.pan, 170, 'rgba(127,216,255,A)', 0.6 * pg);
      ctx.save(); ctx.translate(...BODY.pan); ctx.beginPath(); ctx.ellipse(0, 0, 110, 30, -0.1, 0, TAU); ctx.fillStyle = '#ffcf6e'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
      // intestino (serpentina)
      const ig = o.gut || 0; soft(...BODY.gut, 260, 'rgba(255,209,102,A)', 0.55 * ig);
      ctx.beginPath(); for (let j = 0; j <= 80; j++) { const u = j / 80, row = Math.floor(u * 4), fx = (u * 4) % 1, xx = row % 2 ? 680 - fx * 280 : 400 + fx * 280; ctx.lineTo(xx, 1010 + row * 55 + Math.sin(fx * Math.PI) * 18); } ctx.lineWidth = 30; ctx.strokeStyle = ig > 0.3 ? '#ffc98a' : '#e7a07a'; ctx.lineJoin = 'round'; ctx.stroke();
    }
    function scene2(t) {
      bg(t); header(t);
      const ink = sm(t, B[1], B[1] + 0.5, outC); ga(ink);
      body(t, { gut: prog(t, s2.int - 0.1, s2.int + 0.3), brain: pulse(t, s2.che, 0.1, 1.2) + prog(t, s2.cer - 0.2, s2.cer), pan: prog(t, s2.pan - 0.1, s2.pan + 0.3) });
      ga(1);
      // comida descendo
      for (let i = 0; i < 3; i++) { const k = prog(t, s2.com + i * 0.15, s2.com + 0.9 + i * 0.15); if (k > 0 && k < 1) circ(540 - k * 60, lerp(420, 760, k), 20, '#c98b4a', 4, INK); }
      // partículas GLP-1 (pequenas cadeias amarelas)
      const R = mulberry(5);
      for (let i = 0; i < 16; i++) {
        const t0 = s2.lib + i * 0.06, toBrain = i % 2 === 0, tgt = toBrain ? BODY.brain : BODY.pan, ta = toBrain ? s2.avi : s2.man, k = prog(t, ta + (i % 8) * 0.05, ta + 0.9 + (i % 8) * 0.05);
        if (t < t0) continue; const ox = 400 + R() * 280, oy = 1020 + R() * 160, gx = ox + (R() - 0.5) * 60, gy = oy - 60 - R() * 40;
        const em = outC(prog(t, t0, t0 + 0.4)), x = lerp(lerp(ox, gx, em), tgt[0], inOut(k)), y = lerp(lerp(oy, gy, em), tgt[1], inOut(k));
        if (k >= 1) continue; circ(x - 9, y, 9, GLP, 3, INK); circ(x + 9, y, 9, GLP, 3, INK);
      }
      chip('INTESTINO', 840, 1110, 32, WH, prog(t, s2.int - 0.1, s2.int + 0.2));
      chip('GLP-1', 840, 990, 48, Y, prog(t, s2.glp - 0.15, s2.glp + 0.15));
      // balão do cérebro
      const bk = sm(t, s2.che - 0.15, s2.che + 0.15, outBack);
      if (bk > 0) { ctx.save(); ctx.translate(820, 260); ctx.scale(bk, bk); rr(-150, -60, 300, 120, 40); ctx.fillStyle = WH; ctx.fill(); ctx.beginPath(); ctx.moveTo(-120, 40); ctx.lineTo(-170, 90); ctx.lineTo(-70, 50); ctx.fill(); txt('CHEGA!', 0, 4, 54, { w: 900, color: INK }); ctx.restore(); }
      chip('SACIEDADE', 260, 330, 36, Y, prog(t, s2.sat - 0.15, s2.sat + 0.15));
      // insulina
      if (t > s2.ins - 0.2) { const k = prog(t, s2.ins - 0.2, s2.ins + 0.8); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, r = 60 + 140 * outC(k); ctx.save(); ctx.translate(BODY.pan[0] + Math.cos(a) * r, BODY.pan[1] + Math.sin(a) * r * 0.6); ctx.scale(1 - k * 0.3, 1 - k * 0.3); ctx.beginPath(); ctx.moveTo(0, -22); ctx.bezierCurveTo(16, 0, 16, 18, 0, 18); ctx.bezierCurveTo(-16, 18, -16, 0, 0, -22); ctx.fillStyle = LIQ; ctx.fill(); ctx.restore(); }
        chip('INSULINA', 840, 860, 40, LIQ, prog(t, s2.ins - 0.15, s2.ins + 0.15)); }
      chip('PÂNCREAS', 260, 905, 32, WH, prog(t, s2.pan - 0.1, s2.pan + 0.2));
    }

    // ================= CENA 3 — dura 2 minutos =================
    const s3 = { pro: wt('c3', 'problema'), nat: wt('c3', 'natural'), dur: wt('c3', 'dura'), doi: wt('c3', 'dois'), min: wt('c3', 'minutos'), enz: wt('c3', 'enzima'), des: wt('c3', 'destroi'), rap: wt('c3', 'rapidinho') };
    cue(B[2], 'music', { part: 'stop' }); cue(s3.dur, 'tick', { dur: s3.enz - s3.dur }); cue(s3.enz - 0.2, 'whoosh', { dur: 0.4 }); cue(s3.des, 'chop'); cue(s3.des + 0.15, 'crack'); cue(s3.rap, 'error');
    function scene3(t) {
      bg(t, 'rgba(255,77,94,A)'); header(t);
      rtxt('O PROBLEMA', 540, 290, 84, { color: RED, sh: '#000', scale: sm(t, s3.pro - 0.2, s3.pro + 0.15, outBack) });
      // cronômetro
      const ck = sm(t, s3.dur - 0.2, s3.dur + 0.15, outBack), left = 120 * (1 - prog(t, s3.doi, s3.des + 0.2));
      if (ck > 0) { ctx.save(); ctx.translate(540, 560); ctx.scale(ck, ck); circ(0, 0, 130, '#13212b', 10, WH); rr(-24, -170, 48, 34, 8); ctx.fillStyle = WH; ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 112, -Math.PI / 2, -Math.PI / 2 + TAU * left / 120); ctx.closePath(); ctx.fillStyle = 'rgba(255,209,102,0.35)'; ctx.fill();
        txt(`${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`, 0, 6, 70, { w: 900, color: WH }); ctx.restore(); }
      chip('DURA ~2 MINUTOS', 540, 760, 40, Y, prog(t, s3.min - 0.15, s3.min + 0.15));
      // molécula + enzima
      const broken = sm(t, s3.des + 0.1, s3.des + 0.6, outC);
      chain(540, 1050, 1.05, t, { col: GLP, broken, n: 9 });
      txt('GLP-1 NATURAL', 540, 950, 34, { w: 900, color: Y, a: 1 - broken });
      if (t > s3.enz - 0.4) { const k = prog(t, s3.enz - 0.4, s3.des + 0.3), px = lerp(-150, 1250, inOut(k)); pac(px, 1050, 1.0, t, { flip: true, label: k > 0.1 && k < 0.95 }); }
      stampMark(540, 1300, 'DESTRUÍDO', prog(t, s3.rap - 0.1, s3.rap + 0.1), { size: 70 });
    }

    // ================= CENA 4 — versão modificada =================
    const s4 = { rem: wt('c4', 'remedio'), can: wt('c4', 'caneta'), mod: wt('c4', 'modificada'), enz: wt('c4', 'enzima'), que: wt('c4', 'quebrar'), dur: wt('c4', 'dura'), sem: wt('c4', 'semana'), inj: wt('c4', 'injecao'), sem2: wt('c4', 'semana', 1) };
    cue(B[3], 'music', { part: 'groove' }); cue(s4.mod, 'sparkle'); cue(s4.enz, 'whoosh', { dur: 0.4 }); cue(s4.que, 'boing'); cue(s4.que + 0.02, 'lock'); for (let i = 0; i < 7; i++) cue(s4.dur + i * 0.12, 'tick', { dur: 0.05 }); cue(s4.sem, 'success'); cue(s4.inj, 'tap'); cue(s4.inj + 0.1, 'squeeze');
    function scene4(t) {
      bg(t, 'rgba(46,196,182,A)'); header(t);
      const part1 = 1 - prog(t, s4.dur - 0.4, s4.dur - 0.15), part2 = sm(t, s4.dur - 0.15, s4.dur + 0.1);
      if (part1 > 0) { ga(part1);
        rtxt('VERSÃO MODIFICADA', 540, 290, 72, { color: TE, sh: '#000', scale: sm(t, s4.mod - 0.2, s4.mod + 0.15, outBack) });
        chain(540, 700, 1.05, t, { col: DRUG, tail: sm(t, s4.mod - 0.1, s4.mod + 0.4), shield: sm(t, s4.mod, s4.mod + 0.4, outBack) });
        txt('remédio da caneta', 540, 590, 34, { w: 800, color: TE, a: prog(t, s4.rem, s4.rem + 0.3) });
        // enzima bate e volta
        if (t > s4.enz - 0.4) { const go = prog(t, s4.enz - 0.4, s4.que), back = prog(t, s4.que, s4.que + 0.8); const px = back > 0 ? lerp(140, -300, outC(back)) : lerp(-200, 140, inC(go)); pac(px, 700, 0.9, t, { flip: true, mouth: back > 0 ? 0.05 : undefined, label: true });
          if (back > 0 && back < 0.5) { txt('!', 230, 600, 90, { w: 900, color: Y }); } }
        chip('A ENZIMA NÃO QUEBRA', 540, 940, 42, Y, prog(t, s4.que - 0.1, s4.que + 0.2));
        ga(1); }
      if (part2 > 0) { ga(part2);
        // calendário de 7 dias
        rtxt('DURA ~1 SEMANA', 540, 300, 76, { color: WH, sh: '#000', scale: part2 });
        for (let i = 0; i < 7; i++) { const k = prog(t, s4.dur + i * 0.12, s4.dur + i * 0.12 + 0.2), x = 150 + i * 130, y = 470; rr(x - 55, y - 60, 110, 120, 16); ctx.fillStyle = k > 0.5 ? TE : 'rgba(255,255,255,0.08)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.stroke(); txt(['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][i], x, y, 48, { w: 900, color: k > 0.5 ? INK : WH }); }
        // aplicação: caneta encostando na pele (barriga)
        const ik = sm(t, s4.inj - 0.4, s4.inj, outC), push = prog(t, s4.inj, s4.inj + 0.5);
        pen(540, lerp(800, 870 + push * 20, ik), 0.95, -Math.PI / 2, t, { needle: true, inj: push });
        rr(140, 1180, 800, 170, 60); ctx.fillStyle = '#e7b69a'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); txt('PELE DA BARRIGA', 540, 1300, 30, { w: 800, color: '#7a4a33' });
        chip('1 INJEÇÃO POR SEMANA', 540, 1460, 44, Y, prog(t, s4.sem2 - 0.2, s4.sem2 + 0.15));
        ga(1); }
    }

    // ================= CENA 5 — efeitos =================
    const s5 = { res: wt('c5', 'resultado'), est: wt('c5', 'estomago'), esv: wt('c5', 'esvazia'), dev: wt('c5', 'devagar'), fom: wt('c5', 'fome'), cai: wt('c5', 'cai'), men: wt('c5', 'menos'), mas: wt('c5', 'mas'), enj: wt('c5', 'enjoo'), par: wt('c5', 'para'), rec: wt('c5', 'recuperar'), pes: wt('c5', 'peso') };
    cue(s5.est, 'water', { dur: 1.0 }); cue(s5.fom, 'minus'); cue(s5.men, 'pop'); cue(s5.mas, 'scratch'); cue(s5.mas, 'music', { part: 'drop' }); cue(s5.enj, 'boing', { gain: 0.6 }); cue(s5.rec, 'riser', { dur: 0.8 }); cue(s5.pes, 'alarm');
    function scene5(t) {
      bg(t); header(t);
      const warn = sm(t, s5.mas - 0.3, s5.mas + 0.1);
      if (warn < 1) { ga(1 - warn);
        // painel 1: estômago com gotejamento lento
        const p1 = sm(t, s5.est - 0.3, s5.est, outBack), p2 = sm(t, s5.fom - 0.3, s5.fom, outBack), p3 = sm(t, s5.men - 0.4, s5.men, outBack);
        if (p1 > 0) { ctx.save(); ctx.translate(540, 470); ctx.scale(p1, p1); ctx.rotate(-0.25); ctx.beginPath(); ctx.ellipse(0, 0, 180, 115, 0, 0, TAU); ctx.fillStyle = '#ff8a8a'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
          for (let i = 0; i < 3; i++) { const k = ((t * 0.35 + i / 3) % 1); circ(700, 560 + k * 140, 12 * (1 - k * 0.5), '#c98b4a', 3, INK); }
          chip('ESVAZIA MAIS DEVAGAR', 540, 660, 36, WH, prog(t, s5.dev - 0.2, s5.dev + 0.1)); }
        if (p2 > 0) { ctx.save(); ctx.translate(540, 880); ctx.scale(p2, p2); txt('FOME', -330, 0, 46, { w: 900, color: WH, align: 'left' }); rr(-150, -30, 470, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill(); const lv = lerp(1, 0.25, sm(t, s5.cai - 0.2, s5.cai + 0.5)); rr(-150, -30, 470 * lv, 60, 30); ctx.fillStyle = lv > 0.5 ? RED : TE; ctx.fill(); ctx.restore(); }
        if (p3 > 0) { ctx.save(); ctx.translate(540, 1170); ctx.scale(p3, p3); ctx.beginPath(); ctx.ellipse(0, 0, 230, 90, 0, 0, TAU); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); const fs = lerp(1, 0.45, sm(t, s5.men - 0.2, s5.men + 0.4)); ctx.beginPath(); ctx.ellipse(0, -10, 150 * fs, 55 * fs, 0, 0, TAU); ctx.fillStyle = '#c98b4a'; ctx.fill(); ctx.restore(); chip('COME MENOS', 540, 1330, 40, Y, prog(t, s5.men - 0.1, s5.men + 0.2)); }
        ga(1); }
      if (warn > 0) { ga(warn);
        stampMark(540, 300, 'ATENÇÃO', warn, { size: 76, col: Y, rot: -0.05 });
        // enjoo
        const ek = sm(t, s5.enj - 0.25, s5.enj + 0.1, outBack); if (ek > 0) { ctx.save(); ctx.translate(540, 560); ctx.scale(ek, ek); circ(0, 0, 110, '#9be08a', 7, INK); for (const sx of [-40, 40]) { ctx.beginPath(); for (let j = 0; j < 30; j++) { const a = j / 30 * TAU * 2, r = j * 0.8; ctx.lineTo(sx + Math.cos(a + t * 6) * r, -20 + Math.sin(a + t * 6) * r); } ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); } ctx.beginPath(); for (let j = 0; j <= 10; j++) ctx.lineTo(-45 + j * 9, 50 + Math.sin(j * 1.6) * 8); ctx.lineWidth = 7; ctx.stroke(); ctx.restore(); chip('ENJOO', 540, 715, 38, '#9be08a', prog(t, s5.enj - 0.1, s5.enj + 0.2)); }
        // gráfico: peso cai, parou -> volta
        const gk = prog(t, s5.par - 0.3, s5.pes);
        if (t > s5.par - 0.4) { const x0 = 170, x1 = 910, y0 = 900, y1 = 1300; line([[x0, y0], [x0, y1], [x1, y1]], 6, 'rgba(255,255,255,0.5)'); txt('PESO', x0 + 10, y0 - 30, 30, { w: 900, color: MU, align: 'left' });
          const pts = []; for (let j = 0; j <= 60; j++) { const u = j / 60; if (u > gk) break; const yv = u < 0.5 ? lerp(950, 1180, outC(u / 0.5)) : lerp(1180, 1010, outC((u - 0.5) / 0.5)); pts.push([lerp(x0 + 20, x1 - 20, u), yv]); }
          if (pts.length > 1) { line(pts.filter(p => p[0] <= lerp(x0 + 20, x1 - 20, 0.5)), 12, TE); const back = pts.filter(p => p[0] >= lerp(x0 + 20, x1 - 20, 0.5)); if (back.length > 1) line(back, 12, RED); }
          if (gk > 0.5) { const mx = lerp(x0 + 20, x1 - 20, 0.5); line([[mx, y0], [mx, y1]], 4, Y, [12, 10]); chip('PAROU', mx, y0 - 10, 30, Y, prog(gk, 0.5, 0.6)); }
          chip('PESO VOLTA', 760, 960, 36, RED, prog(t, s5.pes - 0.2, s5.pes + 0.15)); }
        ga(1); }
    }

    // ================= CENA 6 — regras + CTA =================
    const s6 = { bra: wt('c6', 'brasil'), rec: wt('c6', 'receita'), ret: wt('c6', 'retida'), anv: wt('c6', 'anvisa'), apr: wt('c6', 'apreender'), sem: wt('c6', 'sem'), reg: wt('c6', 'registro'), int: wt('c6', 'internet'), qua: wt('c6', 'qual'), rem: wt('c6', 'remedio'), den: wt('c6', 'dentro'), com: wt('c6', 'comenta'), seg: wt('c6', 'segue') };
    cue(B[5], 'music', { part: 'safe' }); cue(s6.rec, 'card'); cue(s6.ret, 'stamp'); cue(s6.apr, 'stamp'); cue(s6.apr + 0.03, 'impact', { gain: 0.7 }); cue(s6.qua, 'music', { part: 'outro' }); cue(s6.com, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t) {
      bg(t); header(t);
      const cta = sm(t, s6.qua - 0.3, s6.qua + 0.1);
      if (cta < 1) { ga(1 - cta);
        // receita
        const rk = sm(t, s6.rec - 0.3, s6.rec + 0.1, outBack), part2 = sm(t, s6.anv - 0.3, s6.anv + 0.1);
        if (rk > 0 && part2 < 1) { ga((1 - cta) * (1 - part2)); ctx.save(); ctx.translate(540, 800); ctx.rotate(-0.05); ctx.scale(rk, rk); rr(-230, -300, 460, 600, 20); ctx.fillStyle = '#fffdf6'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
          txt('RECEITA', 0, -230, 54, { w: 900, color: INK }); for (let i = 0; i < 7; i++) line([[-170, -140 + i * 50], [lerp(-40, 170, (i * 37 % 10) / 10), -140 + i * 50]], 8, '#aab0c0'); ctx.restore();
          stampMark(540, 900, 'RETIDA', prog(t, s6.ret - 0.05, s6.ret + 0.12), { size: 90, col: RED, rot: -0.15 });
          chip('NO BRASIL', 540, 380, 40, Y, prog(t, s6.bra - 0.15, s6.bra + 0.15)); ga(1 - cta); }
        if (part2 > 0) { ga((1 - cta) * part2);
          // celular com loja suspeita
          ctx.save(); ctx.translate(540, 760); rr(-200, -340, 400, 680, 50); ctx.fillStyle = '#0d1a22'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#3d5566'; ctx.stroke(); rr(-170, -300, 340, 600, 24); ctx.fillStyle = '#f3f5f7'; ctx.fill();
          txt('LOJA ONLINE', 0, -250, 30, { w: 900, color: '#556' }); ctx.restore(); pen(540, 720, 0.45, -0.3, t, {}); txt('?', 690, 600, 110, { w: 900, color: RED });
          txt('R$ 99,90', 540, 900, 50, { w: 900, color: INK }); rr(390, 960, 300, 70, 35); ctx.fillStyle = '#3ccf7a'; ctx.fill(); txt('COMPRAR', 540, 997, 32, { w: 900, color: WH });
          stampMark(540, 800, 'APREENDIDA', prog(t, s6.apr - 0.05, s6.apr + 0.12), { size: 84, col: RED, rot: -0.12 });
          chip('SEM REGISTRO NA ANVISA', 540, 1260, 40, Y, prog(t, s6.reg - 0.15, s6.reg + 0.15));
          chip('VENDIDA NA INTERNET', 540, 1360, 34, WH, prog(t, s6.int - 0.15, s6.int + 0.15)); }
        ga(1); }
      if (cta > 0) { ga(cta);
        rtxt('QUAL REMÉDIO', 540, 330, 92, { color: WH, sh: '#000', scale: sm(t, s6.qua - 0.1, s6.qua + 0.2, outBack) });
        rtxt('POR DENTRO?', 540, 450, 92, { color: TE, sh: '#000', scale: sm(t, s6.den - 0.2, s6.den + 0.1, outBack) });
        const ck = sm(t, s6.com - 0.2, s6.com + 0.2, outBack); if (ck > 0) ['antibiótico', 'anestesia', 'vacina'].forEach((m, i) => { const k = prog(t, s6.com + i * 0.22, s6.com + i * 0.22 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([320, 760, 360][i], [700, 800, 920][i]); ctx.scale(outBack(k), outBack(k)); rr(-170, -42, 340, 84, 32); ctx.fillStyle = WH; ctx.fill(); txt(m, 0, 2, 36, { w: 800, color: INK }); ctx.restore(); });
        const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
        if (bk > 0) { ctx.save(); ctx.translate(540, 1200); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(46,196,182,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : TE; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
        ga(1); }
    }

    // ================= legendas =================
    const HL = new Set(['vinte', 'cento', 'peso', 'queima', 'gordura', 'imita', 'hormonio', 'come', 'intestino', 'glp1', 'cerebro', 'chega', 'satisfeito', 'pancreas', 'insulina', 'problema', 'dois', 'minutos', 'enzima', 'destroi', 'modificada', 'quebrar', 'semana', 'injecao', 'estomago', 'devagar', 'fome', 'menos', 'enjoo', 'recuperar', 'receita', 'retida', 'anvisa', 'apreender', 'registro', 'internet', 'remedio', 'dentro', 'comenta', 'segue']);
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
      txt('conteúdo educativo', 540, 1840, 26, { w: 600, color: 'rgba(255,255,255,0.45)' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
