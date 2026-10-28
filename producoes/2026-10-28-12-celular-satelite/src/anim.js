/*
 * CELULAR VIA SATÉLITE — como o celular comum fala direto com o satélite (tudo genérico, sem marca), 9:16 (1080x1920)
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
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, u) => { const pa = hex(a), pb = hex(b); return 'rgb(' + pa.map((x, i) => Math.round(lerp(x, pb[i], clamp(u)))).join(',') + ')'; };

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration;
    const NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Gancho: 50 milhões', 'Torre em terra', 'Satélite = torre no céu', 'Conecta sozinho / céu aberto', 'Sinal fraco: coisa leve', 'Grátis 12 meses', 'CTA'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ------------------------------------------------ paleta
    const BG0 = '#061226', BG1 = '#0d2240', GRID = 'rgba(120,180,255,0.07)', INK = '#081020';
    const ICE = '#7fd8ff', BLU = '#3a86ff', HOT = '#ff4d5e', OR = '#ff9f1c', WH = '#f4f6fb', MU = '#8a94b3', Y = '#ffd166', TE = '#2ec4b6';

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
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1));
      const size = o.size || 84, w = tw(s, size, 900) + 70, h = size * 1.45, col = o.col || HOT;
      rr(-w / 2, -h / 2, w, h, 16); ctx.fillStyle = 'rgba(8,16,32,0.9)'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.stroke();
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
    function header() { ga(0.85); rr(290, 110, 500, 64, 32); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); txt('EM ALTA · COMO FUNCIONA', 540, 143, 28, { w: 800, color: MU }); ga(1); }

    // ------------------------------------------------ celular via satélite (tudo genérico, sem marca)
    const GR = '#3aa86b', GR2 = '#2b7d50', SKY = '#0a1a33';
    const STARS = (() => { const R = mulberry(21), a = []; for (let i = 0; i < 90; i++) a.push([R() * W, R() * 1300, 1 + R() * 2.4, R() * 6]); return a; })();
    function sky(t, tint) {
      bg(t, tint);
      for (const [x, y, r, ph] of STARS) { ga(0.35 + 0.35 * Math.sin(t * 2 + ph)); circ(x, y, r, WH); } ga(1);
    }
    // chão curvo (horizonte da Terra)
    function ground(y0 = 1420, o = {}) {
      const R = 4200;
      soft(540, y0 + 40, 900, 'rgba(58,134,255,A)', 0.18);
      ctx.beginPath(); ctx.arc(540, y0 + R, R + 14, 0, TAU); ctx.fillStyle = 'rgba(127,216,255,0.18)'; ctx.fill();
      ctx.beginPath(); ctx.arc(540, y0 + R, R, 0, TAU); ctx.fillStyle = GR2; ctx.fill();
      ctx.beginPath(); ctx.arc(540, y0 + R + 30, R, 0, TAU); ctx.fillStyle = '#1f5c3b'; ctx.fill();
    }
    function bars(x, y, n, s = 1, col = WH) { // 4 barrinhas de sinal
      for (let i = 0; i < 4; i++) { const h = (14 + i * 12) * s; rr(x + i * 14 * s, y - h, 9 * s, h, 3 * s); ctx.fillStyle = i < n ? col : 'rgba(255,255,255,0.22)'; ctx.fill(); }
    }
    // o = { bars, sat (ícone satélite na tela), msg (balão k), nosig }
    function phone(x, y, s, t, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-92 + 8, -170 + 8, 184, 340, 30); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
      rr(-92, -170, 184, 340, 30); ctx.fillStyle = '#1b2232'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      rr(-80, -150, 160, 300, 20); ctx.fillStyle = o.nosig ? '#2a1a26' : '#16324f'; ctx.fill();
      rr(-24, -162, 48, 8, 4); ctx.fillStyle = '#44506a'; ctx.fill();
      bars(-62, -118, o.bars ?? 4, 0.9, o.nosig ? HOT : WH);
      if (o.sat) { ctx.save(); ctx.translate(48, -128); ctx.scale(0.28, 0.28); satShape(0, 0, 0, ICE); ctx.restore(); }
      if (o.nosig) { txt('SEM', 0, -10, 34, { w: 900, color: HOT }); txt('SINAL', 0, 30, 34, { w: 900, color: HOT }); }
      const mk = o.msg || 0;
      if (mk > 0) { ga(clamp(mk * 3)); const sc = outBack(mk); ctx.save(); ctx.translate(0, 40); ctx.scale(sc, sc); rr(-62, -40, 124, 70, 18); ctx.fillStyle = TE; ctx.fill(); for (let i = 0; i < 3; i++) line([[-44, -20 + i * 18], [i === 2 ? 10 : 44, -20 + i * 18]], 7, INK); ctx.restore(); ga(1); }
      ctx.restore();
    }
    function satShape(x, y, rot, glow) { // satélite genérico: corpo + 2 painéis + antena
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      if (glow) soft(0, 0, 180, 'rgba(127,216,255,A)', 0.25);
      for (const sx of [-1, 1]) {
        line([[sx * 50, 0], [sx * 80, 0]], 8, '#b8c4d6');
        rr(sx > 0 ? 80 : -230, -38, 150, 76, 6); ctx.fillStyle = '#1d4e89'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
        for (let k = 1; k < 5; k++) line([[sx > 0 ? 80 + k * 30 : -230 + k * 30, -36], [sx > 0 ? 80 + k * 30 : -230 + k * 30, 36]], 2.5, 'rgba(127,216,255,0.6)');
        line([[sx > 0 ? 82 : -228, 0], [sx > 0 ? 228 : -82, 0]], 2.5, 'rgba(127,216,255,0.6)');
      }
      rr(-50, -46, 100, 92, 12); ctx.fillStyle = '#dfe6ef'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      rr(-50, -10, 100, 20, 0); ctx.fillStyle = Y; ctx.fill();
      line([[0, 46], [0, 72]], 6, '#b8c4d6'); ctx.beginPath(); ctx.ellipse(0, 80, 30, 12, 0, 0, TAU); ctx.fillStyle = '#b8c4d6'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
      ctx.restore();
    }
    function tower(x, y, s, t, waves, col = '#b8c4d6') { // torre de celular genérica (treliça) com ondas
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      const top = -360;
      line([[-70, 0], [0, top]], 9, col); line([[70, 0], [0, top]], 9, col);
      for (let i = 1; i < 6; i++) { const yy = top * i / 6, w = 70 * (1 - i / 6); line([[-w, yy], [w, yy]], 5, col); if (i < 5) { const yy2 = top * (i + 1) / 6, w2 = 70 * (1 - (i + 1) / 6); line([[-w, yy], [w2, yy2]], 3, col); } }
      rr(-16, top - 10, 32, 60, 6); ctx.fillStyle = '#dfe6ef'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
      if (waves > 0) for (let j = 0; j < 3; j++) { const ph = (t * 0.8 + j / 3) % 1; ga(waves * (1 - ph)); for (const sd of [1, -1]) { ctx.beginPath(); ctx.arc(0, top + 10, 40 + ph * 160, sd > 0 ? -0.7 : Math.PI - 0.7, sd > 0 ? 0.7 : Math.PI + 0.7); ctx.lineWidth = 9; ctx.strokeStyle = TE; ctx.lineCap = 'round'; ctx.stroke(); } }
      ga(1); ctx.restore();
    }
    function link(x0, y0, x1, y1, k, t, col = ICE) { // feixe pontilhado com pacotes subindo
      if (k <= 0) return; const xe = lerp(x0, x1, k), ye = lerp(y0, y1, k);
      ctx.save(); ctx.setLineDash([16, 14]); ctx.lineDashOffset = -t * 60; line([[x0, y0], [xe, ye]], 7, col); ctx.restore(); ctx.setLineDash([]);
      if (k >= 1) for (let i = 0; i < 3; i++) { const u = (t * 0.7 + i / 3) % 1; circ(lerp(x0, x1, u), lerp(y0, y1, u), 10, Y); }
    }
    function tree(x, y, s) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-16, -90, 32, 100, 6); ctx.fillStyle = '#7a5235'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
      for (const [cx, cy, r] of [[0, -200, 90], [-70, -140, 70], [70, -140, 70], [0, -120, 80]]) circ(cx, cy, r, GR, 5, INK);
      for (const [cx, cy, r] of [[0, -200, 84], [-70, -140, 64], [70, -140, 64], [0, -120, 74]]) circ(cx, cy, r, GR);
      ctx.restore();
    }
    function cross(x, y, k, s = 1) { if (k <= 0) return; const sc = outBack(k) * s; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); circ(0, 0, 46, HOT, 6, INK); txt('×', 0, 2, 80, { w: 900, color: WH }); ctx.restore(); }
    function check(x, y, k, s = 1) { if (k <= 0) return; const sc = outBack(k) * s; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); circ(0, 0, 40, TE, 6, INK); txt('✓', 0, 3, 52, { w: 900, color: INK }); ctx.restore(); }

    // ================= CENA 1 — GANCHO =================
    const s1 = { cin: wt('c1', 'cinquenta'), cel: wt('c1', 'celulares'), bra: wt('c1', 'brasil'), men: wt('c1', 'mensagem'), dir: wt('c1', 'direto'), esp: wt('c1', 'espaco'), ant: wt('c1', 'antena') };
    cue(0, 'music', { part: 'intro' }); cue(0.15, 'stamp'); cue(0.2, 'impact', { gain: 0.7 }); cue(s1.cel, 'pop'); cue(s1.men, 'sms'); cue(s1.dir, 'zap'); cue(s1.esp, 'sparkle'); cue(s1.ant, 'stamp'); cue(s1.ant, 'music', { part: 'groove' });
    function scene1(t) {
      sky(t, 'rgba(127,216,255,A)'); header(); ground(1460);
      rtxt('50 MILHÕES', 540, 270, 132, { color: Y, sh: '#000', scale: sm(t, 0.05, 0.45, outBack) });
      chip('DE CELULARES NO BRASIL', 540, 385, 38, WH, prog(t, 0.3, 0.6));
      const sx = 790 + Math.sin(t * 0.6) * 30, sy = 700;
      satShape(sx, sy, -0.15 + Math.sin(t) * 0.04, true);
      const bk = sm(t, s1.men - 0.1, s1.dir + 0.2);
      link(470, 1060, sx - 20, sy + 90, bk, t);
      phone(400, 1200, 1.05, t, { bars: 4, sat: t > s1.dir, msg: prog(t, s1.men - 0.15, s1.men + 0.2) });
      chip('DIRETO PRO ESPAÇO', 760, 900, 40, ICE, prog(t, s1.esp - 0.25, s1.esp + 0.1));
      stampMark(560, 560, 'SEM ANTENA NOVA', prog(t, s1.ant - 0.05, s1.ant + 0.12), { size: 64, col: TE, rot: -0.08 });
    }

    // ================= CENA 2 — torre em terra =================
    const s2 = { nor: wt('c2', 'celular'), tor: wt('c2', 'torre'), ter: wt('c2', 'terra'), sem: wt('c2', 'sem'), per: wt('c2', 'perto'), sin: wt('c2', 'sinal') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.tor, 'ding'); cue(s2.ter, 'scan', { dur: 0.6, gain: 0.6 }); cue(s2.sem, 'swoosh'); cue(s2.sin, 'error'); cue(s2.sin, 'buzz', { dur: 0.4 });
    function scene2(t) {
      sky(t, 'rgba(46,196,182,A)'); header(); ground(1420);
      rtxt('TORRE EM TERRA', 540, 290, 84, { color: WH, sh: '#000', scale: sm(t, s2.tor - 0.25, s2.tor + 0.1, outBack) });
      const tk = sm(t, B[1], B[1] + 0.5, outBack);
      // área de cobertura
      const ck = prog(t, s2.ter - 0.2, s2.ter + 0.4);
      if (ck > 0) { ga(ck); ctx.beginPath(); ctx.ellipse(250, 1430, 330, 110, 0, 0, TAU); ctx.fillStyle = 'rgba(46,196,182,0.18)'; ctx.fill(); ctx.setLineDash([18, 12]); ctx.lineWidth = 5; ctx.strokeStyle = TE; ctx.stroke(); ctx.setLineDash([]); txt('ALCANCE DA TORRE', 250, 1520, 30, { w: 900, color: TE, stroke: 8 }); ga(1); }
      if (tk > 0) tower(250, 1420, 1.1 * tk, t, 1);
      const mv = sm(t, s2.sem - 0.1, s2.per + 0.2);
      const px = lerp(500, 840, mv), out = mv > 0.6;
      if (!out) link(250, 1050, px - 30, 1080, prog(t, s2.nor, s2.tor + 0.3), t, TE);
      phone(px, 1200, 0.95, t, { bars: out ? 0 : Math.round(lerp(4, 1, mv)), nosig: t > s2.per + 0.05 });
      stampMark(780, 800, 'SEM SINAL', prog(t, s2.per + 0.05, s2.per + 0.2), { size: 74 });
      txt('estrada, roça, mar...', 780, 940, 36, { w: 700, color: MU, a: prog(t, s2.sin + 0.2, s2.sin + 0.6) });
    }

    // ================= CENA 3 — o satélite vira torre =================
    const s3 = { ago: wt('c3', 'vivo'), cli: wt('c3', 'clientes'), sat: wt('c3', 'satelites'), alt: wt('c3', 'alto'), cad: wt('c3', 'cada'), pap: wt('c3', 'papel'), tor: wt('c3', 'torre') };
    cue(s3.ago, 'whoosh', { dur: 0.5 }); cue(s3.cli, 'pop'); cue(B[2] + 0.1, 'reveal'); cue(s3.alt, 'riser', { dur: 0.5 }); cue(s3.tor, 'stamp'); cue(s3.tor, 'sparkle');
    function scene3(t) {
      sky(t, 'rgba(127,216,255,A)'); header(); ground(1480);
      chip('LANÇADO EM 26 DE OUTUBRO', 540, 290, 36, WH, prog(t, s3.ago - 0.1, s3.ago + 0.2) * (1 - prog(t, s3.alt - 0.2, s3.alt)));
      // celulares no chão
      for (let i = 0; i < 5; i++) { const k = prog(t, s3.cli - 0.1 + i * 0.07, s3.cli + 0.2 + i * 0.07); if (k > 0) phone(170 + i * 185, 1330, 0.42 * outBack(k), t, { bars: 0, sat: t > s3.tor }); }
      const sk = sm(t, B[2] + 0.1, B[2] + 0.5, outBack), sx = 540 + Math.sin(t * 0.5) * 20, sy = 720;
      // cone de cobertura
      const cone = prog(t, s3.pap - 0.2, s3.tor + 0.2);
      if (cone > 0) { ga(cone * (0.55 + 0.15 * Math.sin(t * 5))); const g = ctx.createLinearGradient(0, sy, 0, 1480); g.addColorStop(0, 'rgba(127,216,255,0.55)'); g.addColorStop(1, 'rgba(127,216,255,0.05)'); ctx.beginPath(); ctx.moveTo(sx - 30, sy + 90); ctx.lineTo(sx + 30, sy + 90); ctx.lineTo(1060, 1460); ctx.lineTo(20, 1460); ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ga(1); }
      if (sk > 0) { ctx.save(); ctx.translate(sx, sy); ctx.scale(1.25 * sk, 1.25 * sk); satShape(0, 0, Math.sin(t) * 0.04, true); ctx.restore(); }
      // altura
      const ak = prog(t, s3.alt - 0.2, s3.alt + 0.3);
      if (ak > 0) { ga(ak); line([[110, 800], [110, lerp(800, 1440, ak)]], 6, Y, [12, 10]); txt('ÓRBITA BAIXA', 60, 1000, 30, { w: 900, color: Y, align: 'left', stroke: 8 }); txt('centenas de km', 60, 1045, 28, { w: 700, color: WH, align: 'left', stroke: 8 }); ga(1); }
      if (t > s3.tor - 0.25) rtxt('TORRE NO CÉU', 540, 300, 96, { color: ICE, sh: '#000', scale: sm(t, s3.tor - 0.25, s3.tor + 0.05, outBack) });
    }

    // ================= CENA 4 — conecta sozinho, mas precisa de céu aberto =================
    const s4 = { con: wt('c4', 'conecta'), soz: wt('c4', 'sozinho'), sat: wt('c4', 'satelite'), pre: wt('c4', 'precisa'), ceu: wt('c4', 'ceu'), abe: wt('c4', 'aberto'), tet: wt('c4', 'teto'), arv: wt('c4', 'arvore'), blo: wt('c4', 'bloqueiam') };
    cue(s4.con, 'lock'); cue(s4.soz, 'success'); cue(s4.sat, 'whoosh', { dur: 0.8, gain: 0.7 }); cue(s4.ceu, 'sparkle'); cue(s4.tet, 'door'); cue(s4.arv, 'plop'); cue(s4.blo, 'error');
    function scene4(t) {
      sky(t, 'rgba(46,196,182,A)'); header(); ground(1460);
      // satélite cruzando o céu
      const u = prog(t, B[3], B[4]), sx = lerp(170, 910, u), sy = 640 - Math.sin(u * Math.PI) * 60;
      satShape(sx, sy, -0.1, true);
      const block = t > s4.tet - 0.05;
      const lk = prog(t, s4.con - 0.2, s4.con + 0.3);
      if (!block) link(540, 1050, sx, sy + 90, lk, t);
      else { // feixe para no teto
        ctx.save(); ctx.setLineDash([16, 14]); line([[540, 1050], [540, 960]], 7, ICE); ctx.restore(); ctx.setLineDash([]);
        line([[sx, sy + 90], [lerp(sx, 540, 0.75), lerp(sy + 90, 900, 0.75)]], 7, 'rgba(127,216,255,0.35)', [16, 14]);
      }
      phone(540, 1200, 0.95, t, { bars: t > s4.con ? 2 : 0, sat: t > s4.con, nosig: t < s4.con - 0.1, msg: block ? 0 : prog(t, s4.soz, s4.soz + 0.3) });
      chip('CONECTA SOZINHO', 540, 300, 46, TE, prog(t, s4.con - 0.15, s4.con + 0.15) * (1 - prog(t, s4.pre - 0.2, s4.pre)));
      if (t > s4.pre - 0.2) rtxt('CÉU ABERTO', 540, 300, 100, { color: ICE, sh: '#000', scale: sm(t, s4.pre - 0.2, s4.ceu + 0.05, outBack) });
      chip('PRECISA DE', 540, 400, 38, WH, prog(t, s4.pre - 0.15, s4.pre + 0.15));
      // teto por cima do celular
      const rk = sm(t, s4.tet - 0.2, s4.tet + 0.1, outC);
      if (rk > 0) { const y = lerp(700, 940, rk); ctx.beginPath(); ctx.moveTo(330, y + 40); ctx.lineTo(540, y - 70); ctx.lineTo(750, y + 40); ctx.closePath(); ctx.fillStyle = '#b5523b'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); txt('TETO', 540, y + 5, 34, { w: 900, color: WH }); cross(760, y - 30, prog(t, s4.tet, s4.tet + 0.25), 0.8); }
      const tk = prog(t, s4.arv - 0.2, s4.arv + 0.2);
      if (tk > 0) { tree(880, 1460, 0.85 * outBack(tk)); cross(880, 1150, prog(t, s4.arv + 0.05, s4.arv + 0.3), 0.8); }
      if (t > s4.blo - 0.1) stampMark(250, 1150, 'BLOQUEIAM', prog(t, s4.blo - 0.05, s4.blo + 0.12), { size: 56, rot: 0.1 });
    }

    // ================= CENA 5 — sinal fraco: só coisa leve =================
    const s5 = { sin: wt('c5', 'sinal'), fra: wt('c5', 'fraco'), lev: wt('c5', 'leve'), tex: wt('c5', 'texto'), aud: wt('c5', 'audio'), loc: wt('c5', 'localizacao'), map: wt('c5', 'mapa'), vid: wt('c5', 'videochamada'), nao: wt('c5', 'nao') };
    cue(s5.fra, 'minus'); cue(s5.lev, 'pop'); cue(s5.tex, 'plus'); cue(s5.aud, 'plus'); cue(s5.loc, 'plus'); cue(s5.map, 'plus'); cue(s5.vid, 'card'); cue(s5.nao, 'error');
    function scene5(t) {
      sky(t, 'rgba(255,209,102,A)'); header();
      const hk = sm(t, s5.sin - 0.3, s5.sin + 0.05, outBack);
      if (hk > 0) { ctx.save(); ctx.translate(140, 300); ctx.scale(hk, hk); bars(0, 40, 1, 2.2, Y); ctx.restore(); }
      rtxt('SINAL FRACO', 600, 290, 92, { color: Y, sh: '#000', scale: sm(t, s5.fra - 0.25, s5.fra + 0.05, outBack) });
      chip('= SÓ COISA LEVE', 540, 420, 42, WH, prog(t, s5.lev - 0.2, s5.lev + 0.1));
      const rows = [['TEXTO', s5.tex, 1], ['ÁUDIO', s5.aud, 1], ['LOCALIZAÇÃO', s5.loc, 1], ['MAPA', s5.map, 1], ['VIDEOCHAMADA', s5.vid, 0]];
      rows.forEach(([lab, tt, ok], i) => {
        const k = prog(t, tt - 0.2, tt + 0.1); if (k <= 0) return; const y = 600 + i * 160;
        ctx.save(); ctx.translate(lerp(-400, 0, outC(k)), 0); ga(clamp(k * 2));
        rr(150, y - 60, 780, 120, 30); ctx.fillStyle = ok ? 'rgba(46,196,182,0.18)' : 'rgba(255,77,94,0.2)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = ok ? TE : HOT; ctx.stroke();
        txt(lab, 220, y + 2, 56, { w: 900, color: WH, align: 'left' });
        ctx.restore(); ga(1);
        if (ok) check(850, y, prog(t, tt, tt + 0.25)); else cross(850, y, prog(t, s5.nao - 0.1, s5.nao + 0.15));
      });
    }

    // ================= CENA 6 — grátis 12 meses =================
    const s6 = { gra: wt('c6', 'gratis'), doz: wt('c6', 'doze'), mes: wt('c6', 'meses'), pla: wt('c6', 'planos'), ele: wt('c6', 'elegiveis'), ati: wt('c6', 'ativar'), nad: wt('c6', 'nada') };
    cue(s6.gra, 'coin'); cue(s6.gra, 'impact', { gain: 0.6 }); cue(s6.doz, 'tick', { dur: 0.6 }); cue(s6.mes, 'ding'); cue(s6.pla, 'card'); cue(s6.ati, 'tap'); cue(s6.nad, 'success');
    function scene6(t) {
      sky(t, 'rgba(46,196,182,A)'); header();
      if (t > s6.gra - 0.3) rtxt('GRÁTIS', 540, 330, 150, { color: TE, sh: '#000', scale: sm(t, s6.gra - 0.3, s6.gra + 0.05, outBack) });
      const nk = sm(t, s6.doz - 0.3, s6.doz, outBack), n = Math.max(1, Math.round(12 * outC(prog(t, s6.doz - 0.1, s6.mes + 0.1))));
      if (nk > 0) rtxt(`${n} MESES`, 540, 530, 120, { color: Y, sh: '#000', scale: nk });
      // calendário: 12 quadradinhos
      for (let i = 0; i < 12; i++) { const k = prog(t, s6.doz - 0.1 + i * 0.05, s6.doz + 0.15 + i * 0.05); if (k <= 0) continue; const x = 255 + (i % 4) * 190, y = 720 + Math.floor(i / 4) * 150; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); rr(-75, -55, 150, 110, 16); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); rr(-75, -55, 150, 30, [16, 16, 0, 0]); ctx.fillStyle = HOT; ctx.fill(); txt(String(i + 1), 0, 14, 44, { w: 900, color: INK }); ctx.restore(); }
      chip('NOS PLANOS ELEGÍVEIS', 540, 1230, 42, WH, prog(t, s6.pla - 0.15, s6.pla + 0.15));
      chip('SEM ATIVAR NADA ✓', 540, 1370, 46, TE, prog(t, s6.ati - 0.15, s6.ati + 0.15));
    }

    // ================= CENA 7 — CTA =================
    const s7 = { ja: wt('c7', 'ja'), sin: wt('c7', 'sinal'), hor: wt('c7', 'hora'), com: wt('c7', 'comenta'), ond: wt('c7', 'onde'), ama: wt('c7', 'amanha'), mic: wt('c7', 'microondas'), seg: wt('c7', 'segue') };
    cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif'); cue(s7.ama, 'riser', { dur: 0.6 }); cue(s7.mic, 'ding'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    function microwave(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-230, -140, 460, 280, 26); ctx.fillStyle = '#dfe6ef'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      rr(-200, -110, 300, 220, 16); ctx.fillStyle = '#1b2a40'; ctx.fill(); soft(-50, 0, 160, 'rgba(255,209,102,A)', 0.4 + 0.2 * Math.sin(t * 6));
      ctx.save(); ctx.translate(-50, 40); ctx.scale(1, 0.35); circ(0, 0, 100, WH, 5, INK); ctx.restore(); circ(-50, 25, 36, OR, 5, INK);
      rr(120, -110, 80, 220, 12); ctx.fillStyle = '#b8c4d6'; ctx.fill(); for (let i = 0; i < 3; i++) circ(160, -60 + i * 50, 14, '#5d6b85');
      ctx.restore();
    }
    function scene7(t) {
      sky(t); header();
      rtxt('JÁ FICOU', 540, 290, 90, { color: WH, sh: '#000', scale: sm(t, s7.ja - 0.1, s7.ja + 0.2, outBack) });
      rtxt('SEM SINAL?', 540, 405, 96, { color: HOT, sh: '#000', scale: sm(t, s7.sin - 0.2, s7.sin + 0.1, outBack) });
      ['na estrada', 'na praia', 'no sítio'].forEach((m, i) => { const k = prog(t, s7.ond + i * 0.15, s7.ond + i * 0.15 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([290, 790, 540][i], [570, 570, 670][i]); ctx.scale(outBack(k), outBack(k)); rr(-170, -42, 340, 84, 32); ctx.fillStyle = WH; ctx.fill(); txt(m, 0, 2, 38, { w: 800, color: INK }); ctx.restore(); });
      const mk2 = sm(t, s7.ama - 0.2, s7.mic, outBack);
      if (mk2 > 0) { chip('AMANHÃ', 540, 820, 44, Y, mk2); microwave(540, 1040, 0.9 * mk2, t); chip('MICRO-ONDAS POR DENTRO', 540, 1240, 38, WH, prog(t, s7.mic, s7.mic + 0.4)); }
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1420); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(127,216,255,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : ICE; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
    }

    // ================= legendas =================
    const HL = new Set(['cinquenta', 'milhoes', 'espaco', 'antena', 'torre', 'terra', 'sinal', 'satelites', 'satelite', 'alto', 'conecta', 'sozinho', 'ceu', 'aberto', 'teto', 'arvore', 'bloqueiam', 'fraco', 'leve', 'texto', 'audio', 'localizacao', 'mapa', 'videochamada', 'gratis', 'doze', 'meses', 'ativar', 'comenta', 'onde', 'microondas', 'segue']);
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
      ctx.save(); ctx.translate(540, 1640); ctx.scale(sc, sc); ctx.globalAlpha = a;
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
      txt('animação e voz feitas com IA', 540, 1840, 26, { w: 600, color: 'rgba(255,255,255,0.45)' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
