/*
 * O QUE O CAFÉ FAZ NO CÉREBRO — adenosina × cafeína, explicador animado, 9:16 (1080x1920)
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
    const NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Gancho: não dá energia, engana', 'Adenosina acumula = sono', 'Cafeína ocupa o encaixe', 'Pico e meia-vida no sangue', 'Sono guardado + estudo 6h', 'Tolerância e abstinência', 'CTA: até que horas + série'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ------------------------------------------------ paleta (neutra)
    const BG0 = '#061419', BG1 = '#0e2830', GRID = 'rgba(120,220,220,0.07)', INK = '#08161b';
    const OR = '#ff9f1c', TE = '#2ec4b6', WH = '#f4f6fb', MU = '#8a94b3', Y = '#ffd166', RED = '#ff4d5e';

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
    const BR = '#a0673a', CR = '#e8c39e', PU = '#b388ff', PUd = '#7c4dff', CF = OR;

    // ------------------------------------------------ desenhos próprios
    function cup(x, y, s, t, o = {}) { // caneca genérica com vapor
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      for (let i = 0; i < 3; i++) { const ph = t * 1.4 + i * 2.1; ctx.beginPath(); for (let j = 0; j <= 20; j++) { const u = j / 20; ctx.lineTo(-60 + i * 60 + Math.sin(u * 7 + ph) * 16, -150 - u * 170); } ctx.lineWidth = 12; ctx.strokeStyle = `rgba(255,255,255,${0.25 * (o.steam ?? 1)})`; ctx.lineCap = 'round'; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(170, 0, 70, -1.2, 1.2); ctx.lineWidth = 30; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 18; ctx.strokeStyle = '#f2f2f2'; ctx.stroke();
      rr(-170, -130, 340, 280, 50); ctx.fillStyle = '#f2f2f2'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -128, 160, 34, 0, 0, TAU); ctx.fillStyle = '#5a3420'; ctx.fill(); ctx.lineWidth = 7; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-30, -132, 70, 12, 0, 0, TAU); ctx.fillStyle = 'rgba(232,195,158,0.5)'; ctx.fill();
      rr(-130, -40, 40, 140, 20); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fill();
      ctx.restore();
    }
    function brain(x, y, s, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      if (o.glow) soft(0, 0, 260, o.glowCol || 'rgba(179,136,255,A)', 0.5 * o.glow);
      ctx.beginPath(); for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI; ctx.arc(Math.cos(a) * 110, Math.sin(a) * 70 + 20, 52, 0, TAU); } ctx.fillStyle = '#ff9fb7'; ctx.fill(); rr(-160, 10, 320, 80, 40); ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = '#d86f8c'; line([[0, -70], [0, 80]], 6, '#d86f8c');
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 40, -30); ctx.bezierCurveTo(sx * 90, -60, sx * 120, 0, sx * 80, 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx * 30, 50); ctx.bezierCurveTo(sx * 70, 30, sx * 110, 60, sx * 130, 40); ctx.stroke(); }
      ctx.restore();
    }
    // molécula de purina: hexágono + pentágono fundidos. kind 'A' adenosina (com cauda), 'C' cafeína (3 metilas)
    function mol(x, y, s, kind, o = {}) {
      if (s <= 0.001) return;
      const col = kind === 'A' ? PU : CF;
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ga((o.a ?? 1) * ctx.globalAlpha);
      const hx = [], px = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; hx.push([-26 + Math.cos(a) * 34, Math.sin(a) * 34]); }
      for (let i = 0; i < 5; i++) { const a = Math.PI + i / 5 * TAU; px.push([36 + Math.cos(a) * 28, Math.sin(a) * 28]); }
      if (kind === 'A') { line([[50, 20], [70, 62]], 8, INK); ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i / 5 * TAU; ctx.lineTo(78 + Math.cos(a) * 22, 76 + Math.sin(a) * 22); } ctx.closePath(); ctx.fillStyle = '#d7c4ff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); }
      else { for (const [a, b] of [[-26, -34], [-56, 18], [62, -20]]) { line([[a * 0.8, b * 0.8], [a * 1.35, b * 1.35]], 7, INK); circ(a * 1.45, b * 1.45, 11, '#ffd9a0', 5, INK); } }
      for (const P of [hx, px]) { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); }
      ctx.restore();
    }
    // receptores numa membrana; st[i] = {m: 'A'|'C'|null, k: 0..1 encaixe}
    const RX = [210, 430, 650, 870], RY = 1000;
    function membrane(t, st, o = {}) {
      rr(60, RY + 40, 960, 120, 40); ctx.fillStyle = 'rgba(255,159,183,0.18)'; ctx.fill();
      for (let i = 0; i < 26; i++) { circ(80 + i * 36.8, RY + 52, 12, 'rgba(255,159,183,0.55)'); circ(80 + i * 36.8, RY + 148, 12, 'rgba(255,159,183,0.55)'); }
      txt('NEURÔNIO', 540, RY + 100, 30, { w: 900, color: 'rgba(255,255,255,0.55)' });
      RX.forEach((x, i) => {
        const s = st[i] || {}; const on = s.m === 'A' ? clamp(s.k) : 0, off = s.m === 'C' ? clamp(s.k) : 0;
        // lâmpada de sinal
        const ly = RY + 230; if (on > 0.5) soft(x, ly, 110, 'rgba(179,136,255,A)', 0.8 * on);
        circ(x, ly, 34, on > 0.5 ? '#d7c4ff' : '#2a3340', 6, INK); line([[x, RY + 160], [x, ly - 34]], 8, 'rgba(255,255,255,0.35)');
        if (on > 0.5) txt('z', x + 40, ly - 50 - (t * 30 % 30), 40, { w: 900, color: PU, a: on });
        if (off > 0.8 && o.cross) { const k = clamp(o.cross - i * 0.15); line([[x - 24 * k, ly - 24 * k], [x + 24 * k, ly + 24 * k]], 9, RED); line([[x + 24 * k, ly - 24 * k], [x - 24 * k, ly + 24 * k]], 9, RED); }
        // berço do receptor
        ctx.beginPath(); ctx.moveTo(x - 85, RY - 70); ctx.lineTo(x - 85, RY + 60); ctx.lineTo(x + 85, RY + 60); ctx.lineTo(x + 85, RY - 70); ctx.lineTo(x + 55, RY - 70); ctx.lineTo(x + 55, RY + 20); ctx.lineTo(x - 55, RY + 20); ctx.lineTo(x - 55, RY - 70); ctx.closePath();
        ctx.fillStyle = '#4fc3f7'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
        if (s.m && s.k > 0) { const k = outC(clamp(s.k)), yy = lerp(RY - 420 - i * 40, RY - 20, k), xx = x + (1 - k) * (i % 2 ? 60 : -60); mol(xx, yy, 0.95, s.m, { rot: (1 - k) * (i % 2 ? 1 : -1) * 1.5 }); }
      });
    }
    function sleepMeter(x, y, v, a = 1, label = 'SONO') {
      if (a <= 0) return; ga(a);
      txt(label, x - 330, y, 40, { w: 900, color: PU, align: 'left' });
      rr(x - 170, y - 28, 500, 56, 28); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
      if (v > 0.01) { rr(x - 170, y - 28, Math.max(56, 500 * clamp(v)), 56, 28); ctx.fillStyle = PU; ctx.fill(); }
      ga(1);
    }
    function moon(x, y, r) { ctx.save(); circ(x, y, r, Y); ctx.globalCompositeOperation = 'destination-out'; circ(x + r * 0.45, y - r * 0.25, r * 0.85, '#000'); ctx.restore(); }

    // ================= CENA 1 — GANCHO =================
    const s1 = { caf: wt('c1', 'cafe'), ene: wt('c1', 'energia'), nen: wt('c1', 'nenhuma'), eng: wt('c1', 'engana'), cer: wt('c1', 'cerebro') };
    cue(0, 'music', { part: 'intro' }); cue(s1.caf, 'pop'); cue(s1.ene, 'zap'); cue(s1.nen, 'stamp'); cue(s1.eng, 'whoosh', { dur: 0.4 }); cue(s1.cer, 'sparkle'); cue(s1.cer, 'music', { part: 'groove' });
    function scene1(t) {
      bg(t, 'rgba(255,159,28,A)'); header(t);
      rtxt('O QUE O CAFÉ FAZ', 540, 290, 80, { color: WH, sh: '#000', scale: sm(t, 0.05, 0.4, outBack) });
      rtxt('NO SEU CÉREBRO', 540, 395, 80, { color: OR, sh: '#000', scale: sm(t, 0.2, 0.55, outBack) });
      const go = sm(t, s1.eng - 0.25, s1.eng + 0.3);
      const ck = sm(t, 0.1, 0.6, outBack);
      cup(lerp(540, 300, go), lerp(880, 1060, go), ck * lerp(1.3, 0.75, go), t);
      // bateria vazia
      const bk = sm(t, s1.ene - 0.2, s1.ene + 0.1, outBack) * (1 - go);
      if (bk > 0) { ctx.save(); ctx.translate(800, 650); ctx.scale(bk, bk); rr(-90, -45, 180, 90, 14); ctx.lineWidth = 9; ctx.strokeStyle = WH; ctx.stroke(); rr(92, -18, 16, 36, 4); ctx.fillStyle = WH; ctx.fill();
        const lv = 1 - prog(t, s1.ene, s1.nen + 0.2); if (lv > 0.02) { rr(-78, -33, 156 * lv, 66, 8); ctx.fillStyle = lv > 0.3 ? '#3ccf7a' : RED; ctx.fill(); } ctx.restore(); }
      stampMark(540, 1240, 'NÃO DÁ ENERGIA', prog(t, s1.nen, s1.nen + 0.16) * (1 - go), { size: 70 });
      if (go > 0) {
        brain(720, 900, go * 0.95, { glow: 0.6 });
        mol(560, 1040, go * 0.9, 'C', { rot: Math.sin(t * 3) * 0.2 });
        chip('ELE ENGANA', 540, 1250, 56, OR, prog(t, s1.eng - 0.1, s1.eng + 0.2));
        chip('O SEU CÉREBRO', 540, 1370, 40, WH, prog(t, s1.cer - 0.15, s1.cer + 0.15));
      }
    }

    // ================= CENA 2 — adenosina =================
    const s2 = { acd: wt('c2', 'acordado'), acu: wt('c2', 'acumula'), mol: wt('c2', 'molecula'), ade: wt('c2', 'adenosina'), enc: wt('c2', 'encaixa'), neu: wt('c2', 'neuronios'), son: wt('c2', 'sono') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.acd, 'tick', { dur: s2.ade - s2.acd }); cue(s2.ade, 'pop'); for (let i = 0; i < 4; i++) cue(s2.enc + i * 0.3, 'lock'); cue(s2.son, 'bell');
    function scene2(t) {
      bg(t, 'rgba(179,136,255,A)'); header(t);
      // relógio do dia
      const ck = sm(t, s2.acd - 0.3, s2.acd, outBack), hr = Math.floor(lerp(7, 23, prog(t, s2.acd, s2.son)));
      if (ck > 0) { ctx.save(); ctx.translate(540, 300); ctx.scale(ck, ck); rr(-230, -60, 460, 120, 30); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); txt('ACORDADO', -60, 2, 44, { w: 900, color: WH }); txt(`${String(hr).padStart(2, '0')}h`, 150, 2, 54, { w: 900, color: Y }); ctx.restore(); }
      // moléculas se acumulando no alto
      const n = Math.floor(lerp(0, 9, prog(t, s2.acu, s2.enc)));
      const R = mulberry(11);
      for (let i = 0; i < 9; i++) { const x = 160 + R() * 760, y = 470 + R() * 260; if (i >= n) continue; const k = prog(t, s2.acu + i * 0.12, s2.acu + i * 0.12 + 0.3); const docked = i < 4 && t > s2.enc + i * 0.3 - 0.4; if (!docked) mol(x + Math.sin(t * 2 + i) * 12, y + Math.cos(t * 1.7 + i) * 10, outBack(k) * 1.15, 'A', { rot: i + t * 0.3 }); }
      chip('ADENOSINA', 540, 410, 48, PU, prog(t, s2.ade - 0.15, s2.ade + 0.15), { tc: INK });
      const st = RX.map((_, i) => ({ m: 'A', k: prog(t, s2.enc + i * 0.3 - 0.4, s2.enc + i * 0.3) }));
      ga(sm(t, B[1], B[1] + 0.4)); membrane(t, st); ga(1);
      const filled = st.reduce((a, s) => a + clamp(s.k), 0) / 4;
      sleepMeter(540, 1400, filled, sm(t, s2.enc - 0.3, s2.enc));
      chip('= SONO', 840, 1300, 44, Y, prog(t, s2.son - 0.15, s2.son + 0.15));
    }

    // ================= CENA 3 — cafeína bloqueia =================
    const s3 = { caf: wt('c3', 'cafeina'), mes: wt('c3', 'mesmo'), for: wt('c3', 'formato'), ocu: wt('c3', 'ocupa'), enc: wt('c3', 'encaixe'), nao: wt('c3', 'nao'), sin: wt('c3', 'sinal'), can: wt('c3', 'cansaco'), che: wt('c3', 'chega') };
    cue(B[2], 'music', { part: 'groove' }); cue(s3.caf, 'pop'); cue(s3.for, 'ding'); for (let i = 0; i < 4; i++) cue(s3.ocu + i * 0.2, 'lock'); cue(s3.sin, 'error'); cue(s3.che, 'stamp');
    function scene3(t) {
      bg(t, 'rgba(255,159,28,A)'); header(t);
      const cmp = sm(t, s3.caf - 0.3, s3.caf + 0.1, outBack), cmpOut = sm(t, s3.ocu - 0.5, s3.ocu - 0.1);
      if (cmp > 0 && cmpOut < 1) { ga(1 - cmpOut);
        mol(320, 600, 2.3 * cmp, 'A'); mol(760, 600, 2.3 * sm(t, s3.caf - 0.1, s3.caf + 0.25, outBack), 'C');
        txt('ADENOSINA', 320, 800, 36, { w: 900, color: PU, a: cmp }); txt('CAFEÍNA', 760, 800, 36, { w: 900, color: OR, a: cmp });
        txt('≈', 540, 600, 120, { w: 900, color: WH, a: prog(t, s3.mes - 0.1, s3.mes + 0.2) });
        chip('QUASE O MESMO FORMATO', 540, 340, 44, Y, prog(t, s3.for - 0.2, s3.for + 0.1));
        ga(1); }
      // estado: começa com adenosina encaixada; cafeína substitui
      const st = RX.map((_, i) => { const k = prog(t, s3.ocu + i * 0.2 - 0.4, s3.ocu + i * 0.2); return k > 0 ? { m: 'C', k } : { m: 'A', k: 1 - prog(t, s3.ocu + i * 0.2 - 0.6, s3.ocu + i * 0.2 - 0.4) * 0 }; });
      // adenosina expulsa voando
      if (t > s3.ocu - 0.6) RX.forEach((x, i) => { const k = prog(t, s3.ocu + i * 0.2 - 0.6, s3.ocu + i * 0.2 + 0.6); if (k > 0 && k < 1) mol(x + k * (i % 2 ? 160 : -160), RY - 20 - outC(k) * 520, 0.95 * (1 - k * 0.3), 'A', { rot: k * 4, a: 1 - k * 0.5 }); });
      membrane(t, st.map((s, i) => (s.m === 'A' && t > s3.ocu + i * 0.2 - 0.6 ? {} : s)), { cross: prog(t, s3.sin - 0.3, s3.sin + 0.5) * 1.6 });
      if (cmpOut > 0) chip('OCUPA O ENCAIXE', 540, 360, 48, OR, prog(t, s3.enc - 0.2, s3.enc + 0.1));
      chip('NÃO LIGA O SINAL', 540, 480, 40, WH, prog(t, s3.sin - 0.2, s3.sin + 0.1));
      sleepMeter(540, 1400, lerp(1, 0.08, sm(t, s3.can - 0.3, s3.che)), 1);
      stampMark(780, 1290, 'SEM SONO', prog(t, s3.che - 0.05, s3.che + 0.12), { size: 50, col: OR });
    }

    // ================= CENA 4 — no sangue =================
    const s4 = { pic: wt('c4', 'pico'), san: wt('c4', 'sangue'), tri: wt('c4', 'trinta'), min: wt('c4', 'minutos'), tre: wt('c4', 'tres'), dep: wt('c4', 'depois'), met: wt('c4', 'metade'), la: wt('c4', 'la') };
    cue(B[3], 'music', { part: 'safe' }); cue(s4.pic, 'riser', { dur: 0.7 }); cue(s4.min, 'ding'); cue(s4.tre, 'scan', { dur: 1.0, gain: 0.6 }); cue(s4.met, 'impact', { gain: 0.6 });
    function scene4(t) {
      bg(t, 'rgba(255,159,28,A)'); header(t);
      rtxt('CAFEÍNA NO SANGUE', 540, 300, 70, { color: WH, sh: '#000', scale: sm(t, B[3] + 0.1, B[3] + 0.45, outBack) });
      const x0 = 150, x1 = 950, y0 = 520, y1 = 1260, T = 8; // horas
      const X = h => lerp(x0, x1, h / T), Yv = v => lerp(y1, y0 + 60, v);
      const f = h => (h < 0.75 ? Math.sin(h / 0.75 * Math.PI / 2) : Math.pow(0.5, (h - 0.75) / 4));
      ga(sm(t, B[3], B[3] + 0.4));
      line([[x0, y0], [x0, y1], [x1, y1]], 6, 'rgba(255,255,255,0.5)');
      for (let h = 0; h <= T; h += 2) txt(h + 'h', X(h), y1 + 45, 30, { w: 800, color: MU });
      ga(1);
      // curva desenhada em duas fases
      const hEnd = t < s4.tre ? lerp(0, 0.8, sm(t, s4.pic - 0.3, s4.min)) : lerp(0.8, T, sm(t, s4.tre - 0.2, s4.met + 0.3));
      const pts = []; for (let j = 0; j <= 120; j++) { const h = j / 120 * T; if (h > hEnd) break; pts.push([X(h), Yv(f(h))]); }
      if (pts.length > 1) { ctx.beginPath(); ctx.moveTo(x0, y1); pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(pts[pts.length - 1][0], y1); ctx.closePath(); ctx.fillStyle = 'rgba(255,159,28,0.18)'; ctx.fill(); line(pts, 12, OR); }
      // pico
      const pk = prog(t, s4.tri - 0.2, s4.tri + 0.2);
      if (pk > 0) { ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = 'rgba(255,209,102,0.25)'; ctx.fillRect(X(0.5), y0, X(1) - X(0.5), y1 - y0); ctx.restore(); circ(X(0.75), Yv(1), 16, Y, 5, INK); }
      chip('PICO: 30 A 60 MIN', 470, y0 - 10, 38, Y, prog(t, s4.min - 0.25, s4.min + 0.1));
      // metade
      const mk = prog(t, s4.tre - 0.1, s4.tre + 0.3);
      if (mk > 0) { ctx.save(); ctx.globalAlpha = mk * 0.8; ctx.fillStyle = 'rgba(179,136,255,0.22)'; ctx.fillRect(X(3), y0, X(5) - X(3), y1 - y0); ctx.restore(); txt('3 A 5 H', (X(3) + X(5)) / 2, y1 - 40, 36, { w: 900, color: PU, a: mk }); }
      const hk = prog(t, s4.met - 0.2, s4.met + 0.2); if (hk > 0) { line([[x0, Yv(0.5)], [lerp(x0, x1, hk), Yv(0.5)]], 5, WH, [14, 10]); txt('50%', x0 - 50, Yv(0.5), 30, { w: 900, color: WH, a: hk }); }
      chip('METADE AINDA ESTÁ LÁ', 540, 1400, 46, PU, prog(t, s4.la - 0.3, s4.la + 0.05));
    }

    // ================= CENA 5 — o sono guardado + estudo =================
    const s5 = { ade: wt('c5', 'adenosina'), acu: wt('c5', 'acumulando'), caf: wt('c5', 'cafeina'), sai: wt('c5', 'sai'), gua: wt('c5', 'guardado'), apa: wt('c5', 'aparece'), est: wt('c5', 'estudo'), sei: wt('c5', 'seis'), dor: wt('c5', 'dormir'), tir: wt('c5', 'tirou'), hor: wt('c5', 'hora'), son: wt('c5', 'sono', 1) };
    cue(B[4], 'music', { part: 'stop' }); cue(s5.acu, 'tick', { dur: 1.0 }); cue(s5.sai, 'swoosh'); cue(s5.sai, 'music', { part: 'drop' }); for (let i = 0; i < 4; i++) cue(s5.gua + i * 0.12, 'lock'); cue(s5.apa, 'impact', { gain: 0.8 }); cue(s5.est, 'card'); cue(s5.est, 'music', { part: 'groove' }); cue(s5.tir, 'minus'); cue(s5.hor, 'alarm');
    function scene5(t) {
      bg(t, 'rgba(179,136,255,A)'); header(t);
      const sw = sm(t, s5.est - 0.4, s5.est);
      if (sw < 1) { ga(1 - sw);
        // fila de adenosina crescendo
        const n = Math.floor(lerp(2, 14, prog(t, s5.ade, s5.sai))); const R = mulberry(23);
        for (let i = 0; i < 14; i++) { const x = 140 + R() * 800, y = 330 + R() * 400; if (i >= n) continue; const fall = sm(t, s5.gua + (i % 4) * 0.12 - 0.3, s5.gua + (i % 4) * 0.12); if (i < 4 && fall > 0) continue; mol(x + Math.sin(t * 3 + i) * 10, y, 1.0 * outBack(prog(t, s5.ade + i * 0.08, s5.ade + i * 0.08 + 0.25)), 'A', { rot: i }); }
        const st = RX.map((_, i) => { const lv = prog(t, s5.sai - 0.1 + i * 0.08, s5.sai + 0.4 + i * 0.08); const ad = prog(t, s5.gua + i * 0.12 - 0.3, s5.gua + i * 0.12); return ad > 0 ? { m: 'A', k: ad } : lv > 0 ? {} : { m: 'C', k: 1 }; });
        RX.forEach((x, i) => { const lv = prog(t, s5.sai - 0.1 + i * 0.08, s5.sai + 0.7 + i * 0.08); if (lv > 0 && lv < 1) mol(x, RY - 20 + lv * 0 - outC(lv) * 300, 0.95, 'C', { a: 1 - lv, rot: lv * 2 }); });
        membrane(t, st);
        if (t < s5.sai) chip('CONTINUA SE ACUMULANDO', 540, 800, 40, PU, prog(t, s5.acu - 0.2, s5.acu + 0.1));
        const filled = st.reduce((a, s) => a + (s.m === 'A' ? clamp(s.k) : 0), 0) / 4;
        sleepMeter(540, 1400, filled * 1.0, 1);
        chip('O SONO GUARDADO APARECE', 540, 800, 40, Y, prog(t, s5.apa - 0.25, s5.apa + 0.05));
        ga(1); }
      if (sw > 0) { ga(sw);
        chip('ESTUDO', 540, 320, 46, WH, sw);
        // relógio com xícara às 6h antes
        ctx.save(); ctx.translate(540, 680); const ck = sm(t, s5.sei - 0.3, s5.sei, outBack); ctx.scale(ck, ck);
        circ(0, 0, 220, '#13212b', 12, WH); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line([[Math.sin(a) * 185, -Math.cos(a) * 185], [Math.sin(a) * 205, -Math.cos(a) * 205]], 8, WH); }
        const sweep = sm(t, s5.sei, s5.dor + 0.2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 175, -Math.PI / 2 - Math.PI, -Math.PI / 2 - Math.PI + Math.PI * sweep); ctx.closePath(); ctx.fillStyle = 'rgba(255,159,28,0.35)'; ctx.fill();
        line([[0, 0], [0, -150]], 12, WH); line([[0, 0], [Math.sin(-Math.PI + Math.PI * sweep) * 110, -Math.cos(-Math.PI + Math.PI * sweep) * 110]], 14, Y); circ(0, 0, 16, WH);
        ctx.restore();
        cup(250, 960, 0.35 * ck, t); moon(830, 450, 60 * sm(t, s5.dor - 0.3, s5.dor, outBack));
        chip('6 H ANTES DE DORMIR', 540, 1010, 40, OR, prog(t, s5.sei - 0.1, s5.dor));
        const mk = sm(t, s5.tir - 0.2, s5.tir + 0.2, outBack);
        rtxt('-1 HORA', 540, 1200, 140, { color: RED, sh: '#000', scale: mk });
        txt('DE SONO', 540, 1330, 60, { w: 900, color: WH, a: prog(t, s5.son - 0.2, s5.son + 0.1) });
        ga(1); }
    }

    // ================= CENA 6 — tolerância =================
    const s6 = { tod: wt('c6', 'todo'), dia: wt('c6', 'dia'), aco: wt('c6', 'acostuma'), efe: wt('c6', 'efeito'), dim: wt('c6', 'diminui'), par: wt('c6', 'parar'), rep: wt('c6', 'repente'), dor: wt('c6', 'dor'), cab: wt('c6', 'cabeca') };
    cue(B[5], 'music', { part: 'safe' }); for (let i = 0; i < 7; i++) cue(s6.tod + i * 0.12, 'pop', { gain: 0.5 }); cue(s6.dim, 'minus'); cue(s6.par, 'scratch'); cue(s6.cab, 'boing');
    function scene6(t) {
      bg(t, 'rgba(255,77,94,A)'); header(t);
      rtxt('O CORPO SE ACOSTUMA', 540, 300, 66, { color: WH, sh: '#000', scale: sm(t, s6.aco - 0.3, s6.aco, outBack) });
      for (let i = 0; i < 7; i++) { const k = prog(t, s6.tod + i * 0.12 - 0.1, s6.tod + i * 0.12 + 0.15), x = 150 + i * 130, y = 500; rr(x - 58, y - 70, 116, 140, 18); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); txt(['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][i], x, y - 42, 30, { w: 900, color: MU }); if (k > 0) cup(x - 6, y + 20, 0.17 * outBack(k), t, { steam: 0 }); }
      const ek = sm(t, s6.efe - 0.3, s6.efe, outBack);
      if (ek > 0) { ctx.save(); ctx.translate(540, 700); ctx.scale(ek, ek); txt('EFEITO', -330, 0, 44, { w: 900, color: OR, align: 'left' }); rr(-130, -30, 460, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill(); const lv = lerp(1, 0.3, sm(t, s6.dim - 0.1, s6.dim + 0.6)); rr(-130, -30, 460 * lv, 60, 30); ctx.fillStyle = OR; ctx.fill(); ctx.restore(); }
      chip('DIMINUI', 760, 790, 36, WH, prog(t, s6.dim - 0.1, s6.dim + 0.2));
      // cabeça com dor
      const hk = sm(t, s6.par - 0.3, s6.par + 0.1, outBack);
      if (hk > 0) { ctx.save(); ctx.translate(540, 1160); ctx.scale(hk, hk); circ(0, 0, 130, '#e7b69a', 8, INK); circ(-45, -10, 12, INK); circ(45, -10, 12, INK); line([[-70, -45], [-25, -35]], 8, INK); line([[70, -45], [25, -35]], 8, INK); ctx.beginPath(); ctx.arc(0, 70, 35, Math.PI * 1.15, Math.PI * 1.85); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
        const zk = prog(t, s6.dor - 0.1, s6.dor + 0.3); if (zk > 0) for (const sx of [-1, 1]) { const zz = [[sx * 140, -120], [sx * 175, -150], [sx * 160, -95], [sx * 200, -125]]; line(zz.slice(0, 1 + Math.ceil(zk * 3)), 10, RED); }
        ctx.restore(); }
      chip('PAROU DE REPENTE?', 540, 900, 40, Y, prog(t, s6.rep - 0.2, s6.rep + 0.1));
      chip('DOR DE CABEÇA', 540, 1370, 46, RED, prog(t, s6.cab - 0.15, s6.cab + 0.15), { tc: WH });
    }

    // ================= CENA 7 — CTA =================
    const s7 = { ate: wt('c7', 'ate'), hor: wt('c7', 'horas'), caf: wt('c7', 'cafe'), com: wt('c7', 'comenta'), qui: wt('c7', 'quinta'), ter: wt('c7', 'terra'), est: wt('c7', 'estrela'), seg: wt('c7', 'segue') };
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.qui, 'whoosh', { dur: 0.4 }); cue(s7.est, 'reveal'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    function scene7(t) {
      bg(t, 'rgba(255,159,28,A)'); header(t);
      rtxt('ATÉ QUE HORAS', 540, 300, 84, { color: WH, sh: '#000', scale: sm(t, s7.ate - 0.1, s7.ate + 0.2, outBack) });
      rtxt('VOCÊ TOMA CAFÉ?', 540, 410, 84, { color: OR, sh: '#000', scale: sm(t, s7.caf - 0.3, s7.caf, outBack) });
      ['até 14h', 'até 18h', 'até 22h'].forEach((m, i) => { const k = prog(t, s7.com + i * 0.2, s7.com + i * 0.2 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([250, 540, 830][i], 570); ctx.scale(outBack(k), outBack(k)); rr(-125, -42, 250, 84, 32); ctx.fillStyle = WH; ctx.fill(); txt(m, 0, 2, 36, { w: 800, color: INK }); ctx.restore(); });
      // próximo episódio: Terra × estrela
      const nk = sm(t, s7.qui - 0.3, s7.qui + 0.1, outBack);
      if (nk > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(nk, nk); rr(-420, -170, 840, 340, 40); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke();
        txt('NA QUINTA', -270, -115, 36, { w: 900, color: Y });
        ctx.save(); rr(-420, -170, 840, 340, 40); ctx.clip(); const sk = sm(t, s7.est - 0.3, s7.est + 0.4); soft(470, 80, 520, 'rgba(255,110,60,A)', 0.6 * sk); circ(560, 120, lerp(0, 430, sk), '#ff7a3d'); ctx.restore();
        circ(-250, 40, 16 * prog(t, s7.ter - 0.2, s7.ter), '#3fa9f5', 3, INK); txt('TERRA', -250, 90, 28, { w: 900, color: WH, a: prog(t, s7.ter - 0.2, s7.ter) });
        txt('× MAIOR ESTRELA', 70, 40, 40, { w: 900, color: WH, a: prog(t, s7.est - 0.2, s7.est + 0.1) });
        ctx.restore(); }
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1270); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(255,159,28,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : OR; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
    }


    // ================= legendas =================
    const HL = new Set(['energia', 'nenhuma', 'engana', 'cerebro', 'acordado', 'acumula', 'adenosina', 'encaixa', 'neuronios', 'sono', 'cafeina', 'formato', 'ocupa', 'encaixe', 'sinal', 'cansaco', 'pico', 'sangue', 'trinta', 'sessenta', 'minutos', 'tres', 'cinco', 'metade', 'acumulando', 'guardado', 'aparece', 'estudo', 'seis', 'dormir', 'hora', 'acostuma', 'diminui', 'parar', 'cabeca', 'comenta', 'quinta', 'terra', 'estrela', 'segue']);
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
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
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
      txt('conteúdo educativo • não substitui orientação médica', 540, 1840, 26, { w: 600, color: 'rgba(255,255,255,0.45)' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
