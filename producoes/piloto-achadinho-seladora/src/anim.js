/*
 * PILOTO ACHADINHOS — "por que o salgadinho murcha" + mini seladora (produtos genéricos, sem marca), 9:16 (1080x1920)
 * Formato problema → solução: a ciência do problema primeiro, o achadinho só no fim, CTA "link na bio".
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
    const NAMES = ['Gancho: murchou', 'Fritura tira a água', 'Umidade entra', 'Amido amolece + prendedor', 'Nitrogênio de fábrica', 'Achadinho: mini seladora', 'CTA link na bio'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ------------------------------------------------ paleta
    const BG0 = '#1a0d06', BG1 = '#2e1a0e', GRID = 'rgba(255,200,140,0.07)', INK = '#140a04';
    const CH = '#f6c453', CHD = '#d99a2b', WET = '#b8a77a', AQ = '#6fd3ff', BLU = '#3a86ff', HOT = '#ff4d5e', OR = '#ff9f1c', WH = '#fbf6ee', MU = '#b39c86', Y = '#ffd166', GR = '#3ddc84', BAG = '#e2483d', BAG2 = '#b8322a';

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
      rr(-w / 2, -h / 2, w, h, 16); ctx.fillStyle = 'rgba(20,10,4,0.9)'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.stroke();
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
    function header(s = 'POR QUE ISSO ACONTECE?') { ga(0.85); const w = tw(s, 28, 800) + 70; rr(540 - w / 2, 110, w, 64, 32); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); txt(s, 540, 143, 28, { w: 800, color: MU }); ga(1); }

    // ------------------------------------------------ objetos genéricos
    // batata frita (chip): soft 0..1 = crocante → murcha (cai, perde cor e brilho)
    function crisp(x, y, r, rot, soft = 0, seed = 1) {
      const R = mulberry(seed);
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot + soft * 0.5); ctx.scale(1, lerp(0.62, 0.42, soft));
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU, rr2 = r * (0.9 + 0.1 * Math.sin(a * 5 + seed)); const yy = Math.sin(a) * rr2 + soft * r * 0.45 * Math.cos(a) ** 2; i ? ctx.lineTo(Math.cos(a) * rr2, yy) : ctx.moveTo(Math.cos(a) * rr2, yy); }
      ctx.closePath(); ctx.fillStyle = mix(CH, WET, soft); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      for (let i = 0; i < 4; i++) { circ((R() - 0.5) * r, (R() - 0.5) * r * 0.8, 4 + R() * 5, mix(CHD, '#8a7a55', soft)); }
      if (soft < 0.5) { ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.35, r * 0.12, -0.3, 0, TAU); ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - soft * 2)})`; ctx.fill(); }
      ctx.restore();
    }
    function drop(x, y, s, col = AQ) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -22); ctx.bezierCurveTo(16, 0, 16, 16, 0, 16); ctx.bezierCurveTo(-16, 16, -16, 0, 0, -22); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    // pacote genérico: o = { open (0..1 topo aberto), seal (0..1 costura nova), sealX (progresso da seladora), puff (estufado), gap }
    function bag(x, y, s, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      const w = 420, h = 600, puff = o.puff ?? 0.6, open = o.open || 0;
      // corpo estufado
      ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + 40);
      ctx.bezierCurveTo(-w / 2 - 40 * puff, -h / 6, -w / 2 - 40 * puff, h / 6, -w / 2, h / 2 - 40);
      ctx.lineTo(w / 2, h / 2 - 40);
      ctx.bezierCurveTo(w / 2 + 40 * puff, h / 6, w / 2 + 40 * puff, -h / 6, w / 2, -h / 2 + 40); ctx.closePath();
      ctx.fillStyle = BAG; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
      // faixa e rótulo genérico
      ctx.save(); ctx.clip(); ctx.fillStyle = BAG2; ctx.fillRect(-w, 120, 2 * w, 70); ctx.restore();
      circ(0, -20, 120, '#ffe7a8', 7, INK); crisp(0, -20, 80, -0.3, 0, 3);
      txt('BATATA', 0, 155, 52, { w: 900, color: WH });
      // costuras de cima e de baixo (serrilhadas)
      const crimp = (yy, k = 1) => { ctx.beginPath(); for (let i = 0; i <= 14; i++) { const xx = -w / 2 + i * w / 14; ctx.lineTo(xx, yy + (i % 2 ? 14 : -14) * k); } ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); };
      rr(-w / 2 - 6, h / 2 - 60, w + 12, 50, 8); ctx.fillStyle = BAG2; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); crimp(h / 2 - 35);
      if (open < 0.5) { rr(-w / 2 - 6, -h / 2 + 10, w + 12, 50, 8); ctx.fillStyle = BAG2; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); crimp(-h / 2 + 35); }
      else {
        // boca aberta
        ctx.beginPath(); ctx.ellipse(0, -h / 2 + 40, w / 2, 40 * open, 0, 0, TAU); ctx.fillStyle = '#3a1410'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
        crisp(-70, -h / 2 + 20, 50, 0.4, o.soft || 0, 5); crisp(60, -h / 2 + 15, 46, -0.5, o.soft || 0, 6);
      }
      // costura nova da seladora
      if (o.seal > 0) { const sx = -w / 2 + (w + 12) * clamp(o.seal); rr(-w / 2 - 6, -h / 2 + 10, sx + w / 2 + 6, 50, 8); ctx.fillStyle = BAG2; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
        ctx.beginPath(); for (let i = 0; i <= 28; i++) { const xx = -w / 2 + i * w / 28; if (xx > sx) break; ctx.lineTo(xx, -h / 2 + 35 + (i % 2 ? 10 : -10)); } ctx.lineWidth = 5; ctx.strokeStyle = Y; ctx.stroke(); }
      ctx.restore();
    }
    // prendedor genérico (pregador de plástico)
    function clipper(x, y, s, gapK) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-260, -34, 520, 30, 14); ctx.fillStyle = '#4fb3ff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      rr(-260, 4 + 26 * gapK, 520, 30, 14); ctx.fillStyle = '#2f8fdc'; ctx.fill(); ctx.stroke();
      rr(200, -50, 80, 100 + 26 * gapK, 20); ctx.fillStyle = '#2b78bd'; ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    // mini seladora genérica: duas hastes articuladas, com faixa de aquecimento
    function sealer(x, y, s, hot, rot = 0) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      if (hot > 0) soft(-40, 0, 240, 'rgba(255,77,94,A)', 0.5 * hot);
      rr(-230, -86, 420, 70, 34); ctx.fillStyle = '#f2f2f5'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      rr(-230, 16, 420, 70, 34); ctx.fillStyle = '#e4e4ea'; ctx.fill(); ctx.stroke();
      rr(140, -96, 110, 192, 40); ctx.fillStyle = '#d9d9e2'; ctx.fill(); ctx.stroke();
      rr(-210, -22, 380, 14, 7); ctx.fillStyle = mix('#7a7a86', HOT, hot); ctx.fill();
      rr(-210, 8, 380, 14, 7); ctx.fill();
      circ(195, -40, 14, hot > 0.3 ? GR : '#9a9aa6', 4, INK);
      rr(-120, -72, 160, 22, 11); ctx.fillStyle = '#c9c9d4'; ctx.fill();
      ctx.restore();
    }
    function meter(x, y, lv, label, col) {
      txt(label, x, y - 46, 34, { w: 900, color: WH, stroke: 8 });
      rr(x - 220, y - 20, 440, 40, 20); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
      rr(x - 214, y - 14, 428 * clamp(lv), 28, 14); ctx.fillStyle = col; ctx.fill();
    }
    function n2(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); line([[-22, 0], [22, 0]], 10, INK); circ(-24, 0, 24, '#9fb3ff', 5, INK); circ(24, 0, 24, '#9fb3ff', 5, INK); txt('N', -24, 2, 24, { w: 900, color: INK }); txt('N', 24, 2, 24, { w: 900, color: INK }); ctx.restore(); }

    // ================= CENA 1 — GANCHO =================
    const s1 = { abr: wt('c1', 'abriu'), sal: wt('c1', 'salgadinho'), ont: wt('c1', 'ontem'), hoj: wt('c1', 'hoje'), mur: wt('c1', 'murcho'), est: wt('c1', 'estragou'), que: wt('c1', 'quem'), ar: wt('c1', 'ar'), cas: wt('c1', 'casa') };
    cue(0, 'music', { part: 'intro' }); cue(0.25, 'whoosh', { dur: 0.5 }); cue(s1.abr, 'crack'); cue(s1.hoj, 'tick', { dur: 0.4 }); cue(s1.mur, 'boing'); cue(s1.est, 'error'); cue(s1.ar, 'wind', { dur: 1.0 }); cue(s1.cas, 'stamp'); cue(s1.cas + 0.1, 'music', { part: 'groove' });
    function scene1(t) {
      bg(t, 'rgba(255,77,94,A)'); header();
      const soft1 = prog(t, s1.hoj - 0.1, s1.mur + 0.2);
      bag(540, 900, 1.0, { open: sm(t, s1.abr - 0.1, s1.abr + 0.3), soft: soft1, puff: lerp(0.6, 0.15, soft1) });
      // chips caindo para fora, ficando murchos
      const R = mulberry(11);
      for (let i = 0; i < 5; i++) { const k = sm(t, s1.sal + i * 0.08, s1.sal + 0.5 + i * 0.08, outC); if (k <= 0) continue; crisp(lerp(540, 220 + i * 160, k), lerp(620, 1340 + (i % 2) * 60, k), 64, R() * 2, soft1, 20 + i); }
      rtxt(t < s1.hoj ? 'ONTEM' : 'HOJE', 540, 300, 110, { color: t < s1.hoj ? GR : HOT, sh: '#000', scale: sm(t, s1.ont - 0.2, s1.ont + 0.1, outBack) });
      if (t < s1.est - 0.05) stampMark(540, 470, 'MURCHO', prog(t, s1.mur - 0.05, s1.mur + 0.12), { size: 80 });
      chip('NÃO ESTRAGOU', 540, 470, 48, WH, prog(t, s1.est - 0.1, s1.est + 0.15) * (1 - prog(t, s1.ar - 0.3, s1.ar)), { a: 1 });
      // ar úmido da casa
      const ak = prog(t, s1.ar - 0.2, s1.ar + 0.4);
      if (ak > 0) { for (let i = 0; i < 14; i++) { const ph = (t * 0.5 + i / 14) % 1; ga(ak * (1 - ph) * 0.9); drop(lerp(120, 960, (i * 0.37) % 1), lerp(1480, 560, ph), 0.9); } ga(1);
        rtxt('O AR DA SUA CASA', 540, 470, 74, { color: AQ, sh: '#000', scale: sm(t, s1.ar - 0.2, s1.ar + 0.1, outBack) }); }
    }

    // ================= CENA 2 — fritura tira a água =================
    const s2 = { fri: wt('c2', 'fritura'), qua: wt('c2', 'quase'), agu: wt('c2', 'agua'), bat: wt('c2', 'batata'), eva: wt('c2', 'evapora'), sec: wt('c2', 'seca'), cro: wt('c2', 'crocante') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.fri, 'sizzle', { dur: 1.6 }); cue(s2.agu, 'water', { dur: 0.5 }); cue(s2.eva, 'whoosh', { dur: 0.6 }); cue(s2.sec, 'pop'); cue(s2.cro, 'crack');
    function scene2(t) {
      bg(t, 'rgba(255,159,28,A)'); header('NA FÁBRICA');
      rtxt('NA FRITURA', 540, 290, 96, { color: OR, sh: '#000', scale: sm(t, s2.fri - 0.3, s2.fri + 0.1, outBack) });
      // panela com óleo
      const pk = sm(t, B[1], B[1] + 0.5, outC); ga(pk);
      soft(540, 1150, 420, 'rgba(255,159,28,A)', 0.35);
      rr(170, 1010, 740, 340, 60); ctx.fillStyle = '#3a3f4a'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke();
      rr(200, 1040, 680, 120, 40); ctx.fillStyle = '#e8a12e'; ctx.fill();
      line([[120, 1060], [170, 1060]], 26, '#2a2e36'); line([[910, 1060], [960, 1060]], 26, '#2a2e36');
      const R = mulberry(4); for (let i = 0; i < 26; i++) { const x = 220 + R() * 640, ph = (t * (0.8 + R()) + R()) % 1; circ(x, lerp(1150, 1050, ph), 5 + 8 * ph, null, 4, '#fff1c9'); }
      ga(1);
      // fatia de batata no óleo, perdendo água
      const dry = prog(t, s2.eva - 0.3, s2.sec + 0.3);
      crisp(540, 1040, 150, -0.2, lerp(0.7, 0, dry), 9);
      // vapor de água subindo
      const vk = prog(t, s2.agu - 0.2, s2.eva + 0.8) * (1 - prog(t, s2.cro, s2.cro + 0.6));
      for (let i = 0; i < 9; i++) { const ph = (t * 0.7 + i / 9) % 1; ga(vk * (1 - ph)); drop(lerp(380, 700, (i * 0.41) % 1) + Math.sin(ph * 8 + i) * 20, lerp(980, 520, ph), 1.1); } ga(1);
      chip('A ÁGUA SAI', 820, 650, 44, AQ, prog(t, s2.eva - 0.15, s2.eva + 0.15) * (1 - prog(t, s2.sec - 0.3, s2.sec)));
      if (t > s2.sec - 0.2) { chip('SECA', 330, 640, 60, Y, prog(t, s2.sec - 0.15, s2.sec + 0.1)); chip('= CROCANTE', 690, 640, 60, GR, prog(t, s2.cro - 0.15, s2.cro + 0.1)); }
    }

    // ================= CENA 3 — umidade entra =================
    const s3 = { umi: wt('c3', 'umidade'), abr: wt('c3', 'abriu'), pac: wt('c3', 'pacote'), agu: wt('c3', 'agua'), ent: wt('c3', 'entra'), gru: wt('c3', 'gruda'), ami: wt('c3', 'amido') };
    cue(s3.umi, 'water', { dur: 0.6 }); cue(s3.abr, 'crack'); cue(s3.ent, 'wind', { dur: 1.0 }); cue(s3.gru, 'plop'); cue(s3.ami, 'ding');
    function scene3(t) {
      bg(t, 'rgba(111,211,255,A)'); header();
      rtxt('O AR TEM UMIDADE', 540, 290, 78, { color: AQ, sh: '#000', scale: sm(t, s3.umi - 0.3, s3.umi + 0.1, outBack) * (1 - prog(t, s3.gru - 0.2, s3.gru)) });
      // close-up num chip gigante
      const gk = prog(t, s3.gru - 0.1, s3.ami + 0.6);
      crisp(540, 1060, 300, -0.15, 0.25 * gk, 13);
      // gotas vindo do ar até o chip
      const R = mulberry(21);
      for (let i = 0; i < 18; i++) { const sx = R() * 1080, sy = 420 + R() * 300, tx = 340 + R() * 400, ty = 1000 + R() * 120, st = s3.ent + (i % 6) * 0.07; const k = sm(t, st - 0.4, st + 0.5, outC);
        if (t < s3.umi) continue; const flo = Math.sin(t * 3 + i) * 12; const x = lerp(sx, tx, k) + flo * (1 - k), y = lerp(sy, ty, k) + flo * (1 - k); ga(prog(t, s3.umi, s3.umi + 0.4)); drop(x, y, lerp(1, 0.75, k)); }
      ga(1);
      chip('ÁGUA ENTRA', 260, 820, 44, AQ, prog(t, s3.ent - 0.15, s3.ent + 0.15) * (1 - prog(t, s3.gru - 0.2, s3.gru)));
      if (t > s3.gru - 0.2) rtxt('GRUDA NO AMIDO', 540, 290, 80, { color: Y, sh: '#000', scale: sm(t, s3.gru - 0.2, s3.gru + 0.1, outBack) });
      chip('AMIDO + ÁGUA', 540, 1380, 46, WH, prog(t, s3.ami - 0.15, s3.ami + 0.15));
    }

    // ================= CENA 4 — amolece + prendedor =================
    const s4 = { amo: wt('c4', 'amolece'), cro: wt('c4', 'crocancia'), emb: wt('c4', 'embora'), pre: wt('c4', 'prendedor'), aju: wt('c4', 'ajuda'), sem: wt('c4', 'sempre'), fre: wt('c4', 'fresta') };
    cue(s4.amo, 'stretch', { dur: 0.8 }); cue(s4.emb, 'minus'); cue(s4.pre, 'lock'); cue(s4.aju, 'tap'); cue(s4.fre, 'buzz', { dur: 0.4 }); cue(s4.fre + 0.1, 'wind', { dur: 0.9 });
    function scene4(t) {
      bg(t, 'rgba(255,77,94,A)'); header();
      const part2 = t > s4.pre - 0.3;
      if (!part2) {
        const sk = prog(t, s4.amo - 0.2, s4.emb + 0.2);
        crisp(540, 900, 260, -0.15, lerp(0.25, 1, sk), 13);
        rtxt('AMOLECE', 540, 300, 104, { color: WET, sh: '#000', scale: sm(t, s4.amo - 0.25, s4.amo + 0.1, outBack) });
        meter(540, 1300, lerp(1, 0.12, prog(t, s4.cro - 0.2, s4.emb + 0.4)), 'CROCÂNCIA', mix(GR, HOT, prog(t, s4.cro, s4.emb + 0.4)));
      } else {
        const ck = sm(t, s4.pre - 0.3, s4.pre + 0.2, outBack);
        // pacote dobrado + prendedor
        ctx.save(); ctx.translate(540, 1000);
        rr(-230, -60, 460, 520, 30); ctx.fillStyle = BAG; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
        rr(-230, -150, 460, 110, 20); ctx.fillStyle = BAG2; ctx.fill(); ctx.stroke();
        txt('BATATA', 0, 160, 52, { w: 900, color: WH });
        ctx.restore();
        clipper(540, 900, ck, prog(t, s4.fre - 0.2, s4.fre + 0.2));
        rtxt('PRENDEDOR?', 540, 300, 100, { color: '#4fb3ff', sh: '#000', scale: ck });
        chip('AJUDA...', 540, 440, 48, WH, prog(t, s4.aju - 0.15, s4.aju + 0.15) * (1 - prog(t, s4.sem - 0.2, s4.sem)));
        // fresta: ar entrando pelas pontas
        const fk = prog(t, s4.fre - 0.2, s4.fre + 0.3);
        if (fk > 0) { for (const sx of [-1, 1]) for (let j = 0; j < 4; j++) { const ph = (t * 1.2 + j / 4) % 1; ga(fk * (1 - ph)); drop(540 + sx * lerp(430, 290, ph), 905 + Math.sin(ph * 9) * 10, 0.8); } ga(1);
          stampMark(540, 450, 'FICA UMA FRESTA', fk, { size: 64 }); circ(290, 905, 42 * fk, null, 6, HOT); circ(790, 905, 42 * fk, null, 6, HOT); }
      }
    }

    // ================= CENA 5 — nitrogênio de fábrica =================
    const s5 = { pac: wt('c5', 'pacote'), lac: wt('c5', 'lacrado'), fab: wt('c5', 'fabrica'), nit: wt('c5', 'nitrogenio'), sem: wt('c5', 'sem'), umi: wt('c5', 'umido'), den: wt('c5', 'dentro') };
    cue(s5.lac, 'lock'); cue(s5.fab, 'stamp'); cue(s5.nit, 'sparkle'); cue(s5.sem, 'minus'); cue(s5.den, 'ding');
    function scene5(t) {
      bg(t, 'rgba(159,179,255,A)'); header('LACRADO DE FÁBRICA');
      const bk = sm(t, B[4], B[4] + 0.5, outBack);
      bag(540, 960, 1.15 * bk, { open: 0, puff: 0.9 });
      chip('LACRADO ✓', 540, 560, 48, GR, prog(t, s5.lac - 0.15, s5.lac + 0.15));
      // moléculas de N2 dentro do pacote
      const nk = prog(t, s5.nit - 0.2, s5.nit + 0.3); const R = mulberry(31);
      for (let i = 0; i < 12; i++) { const x = 330 + R() * 420 + Math.sin(t * 2 + i) * 14, y = 700 + R() * 520 + Math.cos(t * 2.4 + i) * 14; ga(nk); n2(x, y, 0.9 * outBack(clamp(nk * 1.4 - i * 0.03))); }
      ga(1);
      if (t > s5.nit - 0.25) rtxt('NITROGÊNIO', 540, 300, 100, { color: '#9fb3ff', sh: '#000', scale: sm(t, s5.nit - 0.25, s5.nit + 0.1, outBack) });
      // ar úmido barrado do lado de fora
      const uk = prog(t, s5.sem - 0.2, s5.umi + 0.3);
      if (uk > 0) { for (let i = 0; i < 6; i++) { const y = 700 + i * 100; ga(uk); drop(150 + Math.sin(t * 4 + i) * 10, y, 0.8); drop(930 - Math.sin(t * 4 + i) * 10, y + 50, 0.8); line([[200, y - 20], [240, y + 20]], 8, HOT); line([[240, y - 20], [200, y + 20]], 8, HOT); } ga(1);
        chip('SEM AR ÚMIDO', 540, 1420, 50, WH, uk); }
    }

    // ================= CENA 6 — ACHADINHO: mini seladora =================
    const s6 = { ach: wt('c6', 'achadinho'), res: wt('c6', 'resolve'), min: wt('c6', 'mini'), sel: wt('c6', 'seladora'), esq: wt('c6', 'esquenta'), bor: wt('c6', 'borda'), lac: wt('c6', 'lacra'), nov: wt('c6', 'novo'), seg: wt('c6', 'segundos') };
    cue(s6.ach, 'reveal'); cue(s6.ach, 'impact', { gain: 0.6 }); cue(s6.sel, 'sparkle'); cue(s6.esq, 'sizzle', { dur: 0.8 }); cue(s6.lac, 'scan', { dur: 1.0, gain: 0.7 }); cue(s6.nov, 'lock'); cue(s6.seg, 'success');
    function scene6(t) {
      bg(t, 'rgba(61,220,132,A)'); header('O ACHADINHO QUE RESOLVE');
      const hk = sm(t, s6.ach - 0.2, s6.ach + 0.15, outBack);
      rtxt('ACHADINHO', 540, 290, 110, { color: Y, sh: '#000', scale: hk * (1 - prog(t, s6.min - 0.2, s6.min)) });
      if (t > s6.min - 0.2) rtxt('MINI SELADORA', 540, 290, 96, { color: GR, sh: '#000', scale: sm(t, s6.min - 0.2, s6.sel + 0.1, outBack) });
      // pacote aberto
      const sealK = prog(t, s6.lac - 0.1, s6.nov + 0.3);
      bag(540, 1080, 0.95, { open: sealK >= 1 ? 0 : 1, seal: sealK, puff: 0.5 });
      // seladora: aparece, vai até a borda e desliza
      const ak = sm(t, s6.sel - 0.3, s6.sel + 0.2, outBack), hot = prog(t, s6.esq - 0.1, s6.esq + 0.4) * (1 - prog(t, s6.seg, s6.seg + 0.6));
      if (ak > 0) {
        const bx = lerp(540, 345, prog(t, s6.bor - 0.4, s6.lac)), x = lerp(bx, 345 + 410, sealK), y = lerp(640, 820, prog(t, s6.bor - 0.4, s6.lac));
        sealer(x + 110 * (1 - ak), y, 0.75 * ak, hot, 0);
      }
      chip('ESQUENTA A BORDA', 540, 470, 46, HOT, prog(t, s6.esq - 0.15, s6.esq + 0.15) * (1 - prog(t, s6.lac - 0.2, s6.lac)), { tc: WH });
      chip('LACRA DE NOVO ✓', 540, 470, 50, GR, prog(t, s6.lac - 0.1, s6.lac + 0.15) * (1 - prog(t, s6.seg - 0.15, s6.seg)));
      if (t > s6.seg - 0.15) stampMark(540, 470, 'EM SEGUNDOS', prog(t, s6.seg - 0.15, s6.seg + 0.1), { size: 70, col: GR, rot: -0.06 });
    }

    // ================= CENA 7 — CTA =================
    const s7 = { lin: wt('c7', 'link'), bio: wt('c7', 'bio'), com: wt('c7', 'comenta'), qua: wt('c7', 'qual'), mur: wt('c7', 'murcha'), rap: wt('c7', 'rapido'), seg: wt('c7', 'segue'), ach: wt('c7', 'achadinhos') };
    cue(B[6], 'music', { part: 'outro' }); cue(s7.lin, 'pop'); cue(s7.bio, 'ding'); cue(s7.com, 'notif'); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success');
    function scene7(t) {
      bg(t, 'rgba(255,209,102,A)'); header('ONDE ACHAR');
      const lk = sm(t, s7.lin - 0.25, s7.lin + 0.1, outBack);
      rtxt('LINK NA BIO', 540, 330, 120, { color: Y, sh: '#000', scale: lk });
      // perfil genérico com seta para o link
      const pk = sm(t, s7.bio - 0.3, s7.bio + 0.1, outBack);
      if (pk > 0) { ctx.save(); ctx.translate(540, 640); ctx.scale(pk, pk);
        rr(-380, -150, 760, 300, 40); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.stroke();
        circ(-260, -40, 70, Y, 6, INK); txt('★', -260, -36, 70, { w: 900, color: INK });
        rr(-150, -90, 300, 34, 17); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill(); rr(-150, -40, 400, 24, 12); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
        const hl = 0.5 + 0.5 * Math.sin(t * 8);
        rr(-150, 10, 380, 64, 32); ctx.fillStyle = mix('#4fb3ff', Y, hl); ctx.fill(); txt('LINK DA BIO', 40, 44, 34, { w: 900, color: INK });
        ctx.restore();
        line([[880, 900], [800, 720]], 12, Y); ctx.beginPath(); ctx.moveTo(790, 690); ctx.lineTo(770, 735); ctx.lineTo(820, 728); ctx.closePath(); ctx.fillStyle = Y; ctx.fill(); }
      // pergunta pra comentar
      const ck = sm(t, s7.com - 0.2, s7.com + 0.15, outBack);
      if (ck > 0) { ctx.save(); ctx.translate(540, 1020); ctx.scale(ck, ck); rr(-420, -90, 840, 180, 40); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
        txt('Qual comida murcha', 0, -26, 46, { w: 900, color: INK }); txt('mais rápido aí?', 0, 34, 46, { w: 900, color: INK }); ctx.restore(); }
      const R = mulberry(41); for (let i = 0; i < 3; i++) { const k = prog(t, s7.mur + i * 0.15, s7.mur + i * 0.15 + 0.3); if (k > 0) crisp(320 + i * 220, 1210, 60 * outBack(k), R() * 2, i * 0.4, 50 + i); }
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1420); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(255,209,102,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : Y; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
    }

    // ================= legendas =================
    const HL = new Set(['murcho', 'estragou', 'ar', 'casa', 'fritura', 'agua', 'evapora', 'seca', 'crocante', 'umidade', 'pacote', 'gruda', 'amido', 'amolece', 'crocancia', 'prendedor', 'fresta', 'lacrado', 'nitrogenio', 'umido', 'achadinho', 'mini', 'seladora', 'esquenta', 'borda', 'lacra', 'segundos', 'link', 'bio', 'comenta', 'segue', 'achadinhos']);
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
      if (fl > 0) { ctx.globalAlpha = clamp(fl) * 0.85; ctx.fillStyle = '#0a0503'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
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
