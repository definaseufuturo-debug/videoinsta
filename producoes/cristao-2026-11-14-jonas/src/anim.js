/* JONAS E NÍNIVE (Jonas 1-4). História que surpreende, pergaminho, 9:16. Mapa Natural Earth 10m (assets/regiao.json); Társis = local tradicional. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const GEO = (typeof require === 'function') ? require('../assets/regiao.json') : null;
  const W = 1080, H = 1920, TAU = Math.PI * 2, K = Math.cos((GEO ? GEO.lat_ref : 31.8) * Math.PI / 180);
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
  const RED = '#b23a2e', BLUE = '#2f5d8a', RIVER = '#4f86b0', GREEN = '#3c7a3e', SUN = '#f0a020', SUN2 = '#ffd86a';

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
    function stamp(s, x, y, k, o = {}) { if (k <= 0) return; const sc = lerp(2.2, 1, outC(k)), size = o.size || 80, w = tw(s, size, 900) + 60, h = size * 1.4; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.92)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 9; ctx.strokeStyle = o.col || RED; ctx.strokeRect(-w / 2, -h / 2, w, h); txt(s, 0, 4, size, { w: 900, color: o.col || RED }); ctx.restore(); ga(1); }

    const tex = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); let s = 9; const R0 = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 60000; i++) { g.fillStyle = R0() < 0.5 ? 'rgba(120,80,30,0.05)' : 'rgba(255,255,255,0.06)'; g.fillRect(R0() * W, R0() * H, 1 + R0() * 2, 1 + R0() * 2); }
      const gr = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); gr.addColorStop(0, 'rgba(90,55,20,0)'); gr.addColorStop(1, 'rgba(90,55,20,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();


    // ---------------- câmera e mapa ----------------
    let RECT = [20, 430, 1040, 1000];
    const RFULL = [20, 430, 1040, 1000], RWIDE = [20, 560, 1040, 470];
    const box = (lo0, lo1, la0, la1, R = RECT) => { const x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(R[2] / (x1 - x0), R[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    const EAST = box(31.0, 46.0, 29.5, 40.5, RFULL);
    const WIDE = box(-8.5, 45.5, 28.5, 41.5, RWIDE);
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const ll = (cam, lo, la) => toS(cam, [lo * K, -la]);
    const inRect = (x, y, m = 0) => x > RECT[0] + m && x < RECT[0] + RECT[2] - m && y > RECT[1] + m && y < RECT[1] + RECT[3] - m;
    function clipMap() { ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); }
    const landPath = () => { ctx.beginPath(); for (const r of G.land) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } };
    const P = { jope: [34.75, 32.05], nin: [43.15, 36.36], tar: [-6.6, 37.2], jer: [35.23, 31.78] };
    function drawMap(cam) {
      ctx.save(); clipMap();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.save(); ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      landPath(); ctx.fillStyle = LAND; ctx.fill('nonzero'); ctx.lineWidth = 1.5 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      if (G.rivers && cam.s > 40) { ctx.beginPath(); for (const r of G.rivers) r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = RIVER; ctx.lineWidth = 2.5 / cam.s; ctx.stroke(); }
      ctx.beginPath(); for (const r of G.lakes) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } ctx.fillStyle = SEA; ctx.fill();
      ctx.restore();
      { const [x, y] = ll(cam, cam === WIDE ? 17 : 33.2, cam === WIDE ? 35.0 : 33.6); if (inRect(x, y, 60)) txt('MAR GRANDE', x, y, cam === WIDE ? 24 : 28, { w: 800, it: true, color: RIVER }); }
      ctx.restore();
    }
    function frame() { ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]); }
    function header() { spaced('JONAS E NÍNIVE', 540, 140, 50, { sp: 8 }); txt('Jonas 1 – 4', 540, 210, 30, { w: 700, color: MUTE }); ctx.fillStyle = INK; ctx.fillRect(200, 245, 680, 3); }
    function arrowHead(x, y, ang, col, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, -13); ctx.lineTo(-12, 13); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    function place(cam, p, name, k, o = {}) { if (k <= 0) return; const [x, y] = ll(cam, p[0], p[1]); if (!inRect(x, y, 10)) return; ctx.save(); clipMap(); const e = outBack(k);
      ctx.beginPath(); ctx.arc(x, y, (o.r || 12) * e, 0, TAU); ctx.fillStyle = o.col || INK; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f7eed6'; ctx.stroke();
      txt(name, x + (o.dx ?? 0), y + (o.dy ?? -36), o.size || 32, { w: 900, color: o.col || INK, stroke: 9, a: clamp(k * 2), align: o.align || 'center' }); ctx.restore(); }
    function route(cam, pts, k, col, o = {}) { if (k <= 0) return null; const S = pts.map(p => ll(cam, p[0], p[1])); let L = 0; const seg = []; for (let i = 1; i < S.length; i++) { const d = Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]); seg.push(d); L += d; }
      let rem = L * clamp(k); ctx.save(); clipMap(); ctx.beginPath(); ctx.moveTo(S[0][0], S[0][1]); let end = S[0], ang = 0;
      for (let i = 1; i < S.length && rem > 0; i++) { const f = Math.min(1, rem / seg[i - 1]); end = [lerp(S[i - 1][0], S[i][0], f), lerp(S[i - 1][1], S[i][1], f)]; ang = Math.atan2(S[i][1] - S[i - 1][1], S[i][0] - S[i - 1][0]); ctx.lineTo(end[0], end[1]); rem -= seg[i - 1]; }
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(o.dash || []); ctx.lineWidth = o.lw || 9; ctx.strokeStyle = col; ctx.stroke(); ctx.setLineDash([]);
      arrowHead(end[0], end[1], ang, col, o.head || 1.6); ctx.restore(); return end; }
    function panel(k, y = 1240, h = 300) { if (k <= 0) return null; const s = outBack(k); ctx.save(); ctx.translate(540, y); ctx.scale(s, s); ga(clamp(k * 3)); ctx.fillStyle = 'rgba(247,238,214,0.97)'; ctx.fillRect(-470, -h / 2, 940, h); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-470, -h / 2, 940, h); ctx.strokeRect(-460, -h / 2 + 10, 920, h - 20); return true; }
    const endPanel = () => { ctx.restore(); ga(1); };

    // ---------------- desenhos ----------------
    // homem (silhueta sem rosto); pose: 0 de pé, 1 sentado cabisbaixo
    function man(x, y, s, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.rot) ctx.rotate(o.rot); const col = o.col || INK; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const sit = o.sit || 0, hy = lerp(-90, -45, sit);
      ctx.beginPath(); ctx.moveTo(lerp(-28, 50, sit), lerp(0, 0, sit)); ctx.lineTo(lerp(0, 40, sit), hy); ctx.lineTo(0, hy); ctx.moveTo(0, hy); ctx.lineTo(lerp(28, 70, sit), lerp(0, 0, sit)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(0, hy - 100); ctx.stroke();
      const up = o.arm || 0; ctx.beginPath(); ctx.moveTo(0, hy - 85); ctx.lineTo(lerp(40, 60, up), lerp(hy - 30, hy - 160, up)); ctx.moveTo(0, hy - 85); ctx.lineTo(lerp(-40, -60, up), lerp(hy - 30, hy - 160, up)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-30, hy - 90); ctx.lineTo(-44, hy + 50 * (1 - sit)); ctx.lineTo(44, hy + 50 * (1 - sit)); ctx.lineTo(30, hy - 90); ctx.closePath(); ctx.globalAlpha *= 0.85; ctx.fill(); ctx.globalAlpha /= 0.85;
      ctx.beginPath(); ctx.arc(lerp(0, 18, o.bow || 0), hy - 132 + 14 * (o.bow || 0), 28, 0, TAU); ctx.fill(); ctx.restore(); }
    function waves(y0, amp, t, col, k = 1) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(60, 1400); for (let x = 60; x <= 1020; x += 12) ctx.lineTo(x, y0 + amp * Math.sin(x * 0.018 + t * 3.2) * k + amp * 0.5 * Math.sin(x * 0.041 - t * 2.1) * k); ctx.lineTo(1020, 1400); ctx.closePath(); ctx.fill(); }
    function boat(x, y, rot, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = '#6b4a2b'; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-200, -40); ctx.lineTo(200, -40); ctx.lineTo(150, 40); ctx.lineTo(-150, 40); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, -280); ctx.stroke(); ctx.fillStyle = '#f3e3bd'; ctx.beginPath(); ctx.moveTo(8, -270); ctx.quadraticCurveTo(120, -170, 8, -70); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
    function fish(x, y, s, mouth, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#2c4d6b'; ctx.strokeStyle = INK; ctx.lineWidth = 6; const m = 0.05 + 0.35 * mouth;
      ctx.beginPath(); ctx.moveTo(-300, 0); ctx.bezierCurveTo(-300, -170, 150, -190, 260, -20 - 40 * m); ctx.lineTo(120, 0); ctx.lineTo(260, 20 + 40 * m); ctx.bezierCurveTo(150, 190, -300, 170, -300, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      const tw = Math.sin(t * 5) * 30; ctx.beginPath(); ctx.moveTo(-290, 0); ctx.lineTo(-430, -110 + tw); ctx.lineTo(-400, 0); ctx.lineTo(-430, 110 + tw); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(150, -70, 16, 0, TAU); ctx.fillStyle = '#f3e3bd'; ctx.fill(); ctx.restore(); }
    function city(x, y, w, s = 1, col = INK) { ctx.save(); ctx.fillStyle = col; let s0 = 5; const R = () => ((s0 = (s0 * 16807) % 2147483647) / 2147483647); let cx = x - w / 2; while (cx < x + w / 2) { const bw = (40 + R() * 70) * s, bh = (60 + R() * 170) * s; ctx.fillRect(cx, y - bh, bw - 4, bh); if (R() < 0.3) { ctx.beginPath(); ctx.arc(cx + bw / 2 - 2, y - bh, bw / 2 - 2, Math.PI, TAU); ctx.fill(); } cx += bw; } ctx.fillRect(x - w / 2 - 10, y - 50 * s, w + 20, 50 * s); ctx.restore(); }
    const CROWD = []; { let s = 21; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) CROWD.push([120 + c * 105 + (r % 2) * 50 + R() * 20, 1020 + r * 70, R()]); }

    // ---------------- tempos ----------------
    const s1 = { cen: wt('c1', 'cento'), mud: wt('c1', 'mudou'), fra: wt('c1', 'frase'), pre: wt('c1', 'pregador'), que: wt('c1', 'queria') };
    const s2 = { jon: wt('c2', 'jonas'), nin: wt('c2', 'ninive'), ass: wt('c2', 'assiria'), ini: wt('c2', 'inimigo'), isr: wt('c2', 'israel') };
    const s3 = { fog: wt('c3', 'foge'), con: wt('c3', 'contrario'), jop: wt('c3', 'jope'), nav: wt('c3', 'navio'), tar: wt('c3', 'tarsis'), ext: wt('c3', 'extremo') };
    const s4 = { tem: wt('c4', 'tempestade'), lan: wt('c4', 'lancam'), mar: wt('c4', 'mar', 1), aca: wt('c4', 'acalma') };
    const s5 = { sur: wt('c5', 'surpresa'), pei: wt('c5', 'peixe'), eng: wt('c5', 'engole'), tre: wt('c5', 'tres'), noi: wt('c5', 'noites') };
    const s6 = { che: wt('c6', 'chega'), tre: wt('c6', 'tres'), and: wt('c6', 'anda'), um: wt('c6', 'um'), men: wt('c6', 'mensagem'), cin: wt('c6', 'cinco'), qua: wt('c6', 'quarenta'), des: wt('c6', 'destruida') };
    const s7 = { int: wt('c7', 'inteira'), cre: wt('c7', 'cre'), rei: wt('c7', 'rei'), man: wt('c7', 'manto'), cin: wt('c7', 'cinza'), ani: wt('c7', 'animais') };
    const s8 = { arr: wt('c8', 'arrependimento'), nao: wt('c8', 'nao'), des: wt('c8', 'destruida') };
    const s9 = { fin: wt('c9', 'final'), fur: wt('c9', 'furioso'), irr: wt('c9', 'irritado'), mor: wt('c9', 'morrer') };
    const s10 = { ter: wt('c10', 'termina'), per: wt('c10', 'pergunta'), com: wt('c10', 'compaixao'), cen: wt('c10', 'cento'), ani: wt('c10', 'animais') };
    const s11 = { mai: wt('c11', 'maior'), pei: wt('c11', 'peixe'), mis: wt('c11', 'misericordia'), ini: wt('c11', 'inimigo') };
    const s12 = { com: wt('c12', 'comenta'), seg: wt('c12', 'segue'), dan: wt('c12', 'daniel') };

    cue(0, 'music', { part: 'intro' }); cue(s1.cen, 'riser', { dur: 0.8 }); cue(s1.fra, 'pop'); cue(s1.que, 'stamp'); cue(B[1], 'music', { part: 'safe' });
    cue(s2.nin, 'pop'); cue(s2.ass, 'swoosh'); cue(s2.ini, 'impact', { gain: 0.6 });
    cue(s3.fog, 'whoosh', { dur: 0.8 }); cue(s3.con, 'stamp'); cue(s3.jop, 'pop'); cue(s3.tar, 'whoosh', { dur: 1.2 });
    cue(s4.tem, 'wind', { dur: 2.5 }); cue(s4.tem + 0.2, 'impact', { gain: 0.5 }); cue(s4.lan + 0.4, 'splash'); cue(s4.aca, 'water', { dur: 1.5 });
    cue(s5.pei, 'riser', { dur: 0.8 }); cue(s5.eng, 'impact', { gain: 0.7 }); cue(s5.tre, 'stamp');
    cue(s6.che, 'pop'); cue(s6.um, 'ding', { gain: 0.5 }); cue(s6.cin, 'stamp'); cue(s6.qua, 'bell');
    cue(s7.cre, 'reveal'); cue(s7.man, 'swoosh'); cue(s7.ani, 'stamp'); cue(B[7], 'music', { part: 'outro' });
    cue(s8.nao, 'success');
    cue(s9.fur, 'impact', { gain: 0.6 }); cue(s9.mor, 'minus');
    cue(s10.per, 'riser', { dur: 0.8 }); cue(s10.cen, 'stamp'); cue(s10.ani, 'ding', { gain: 0.5 });
    cue(s11.pei, 'minus'); cue(s11.mis, 'reveal');
    cue(s12.com, 'notif'); cue(s12.seg + 0.2, 'tap'); cue(s12.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.4 });

    // ---------------- cenas ----------------
    function scene1(t) {
      city(540, 1260, 900, 1.3, 'rgba(59,42,26,0.85)');
      const ck = 0.82 + 0.18 * sm(t, 0, s1.cen + 0.4, outC); const n = (Math.round(lerp(0, 120000, ck) / 100) * 100).toLocaleString('pt-BR').replace(/,/g, '.');
      txt(n, 540, 600, 190, { w: 900, color: RED, stroke: 16, sc: PAPER });
      txt('PESSOAS', 540, 740, 64, { w: 900, color: INK });
      if (t > s1.fra - 0.3) plaque('1 FRASE SÓ', 540, 360, 60, prog(t, s1.fra - 0.3, s1.fra)); else plaque('UMA CIDADE INTEIRA', 540, 360, 56, 1);
      if (t > s1.pre - 0.2) stamp('E O PREGADOR NÃO QUERIA', 540, 1380, prog(t, s1.pre - 0.2, s1.pre + 0.1), { size: 62 });
    }
    function scene2(t) {
      RECT = RFULL; const cam = EAST; drawMap(cam);
      place(cam, P.jer, 'ISRAEL', prog(t, s2.isr - 0.4, s2.isr), { col: BLUE, dy: 42, size: 34 });
      place(cam, P.nin, 'NÍNIVE', prog(t, s2.nin - 0.3, s2.nin), { col: RED, dy: -44, size: 42, r: 18 });
      { const [x, y] = ll(cam, 43.0, 35.0); txt('ASSÍRIA', x, y + 30, 44, { w: 900, color: RED, it: true, stroke: 9, a: prog(t, s2.ass - 0.3, s2.ass) }); }
      txt('hoje: perto de Mosul, Iraque', 540, 1395, 30, { w: 700, color: MUTE, a: prog(t, s2.ass, s2.ass + 0.4) });
      frame();
      plaque('VAI A NÍNIVE (1:2)', 540, 360, 52, prog(t, B[1], B[1] + 0.3), { col: BLUE });
      if (t > s2.ini - 0.3) stamp('O INIMIGO', 540, 1250, prog(t, s2.ini - 0.3, s2.ini), { size: 96 });
    }
    function scene3(t) {
      RECT = RWIDE; const cam = WIDE; drawMap(cam);
      route(cam, [P.jope, [38, 35.5], P.nin], sm(t, B[2], B[2] + 0.8), 'rgba(59,42,26,0.55)', { lw: 6, dash: [12, 12], head: 1.2 });
      place(cam, P.nin, 'NÍNIVE', 1, { col: RED, dy: -32, dx: -50, size: 28, r: 11 });
      place(cam, P.jope, 'JOPE', prog(t, s3.jop - 0.3, s3.jop), { col: INK, dy: 36, size: 28, r: 11 });
      const rk = sm(t, s3.nav, s3.ext + 0.5, x => x); route(cam, [P.jope, [28, 34.2], [15, 36.2], [5, 37.3], [-2, 36.6], P.tar], rk, RED, { lw: 8, head: 1.5 });
      place(cam, P.tar, 'TÁRSIS', prog(t, s3.tar - 0.3, s3.tar), { col: RED, dy: -32, dx: 50, size: 28, r: 11 });
      frame();
      plaque('JONAS FOGE (1:3)', 540, 360, 56, prog(t, B[2], B[2] + 0.3), { col: RED });
      if (t > s3.con - 0.3) stamp('PARA O LADO CONTRÁRIO', 540, 1360, prog(t, s3.con - 0.3, s3.con), { size: 58 });
      const dk = prog(t, s3.tar, s3.tar + 0.4);
      txt('NÍNIVE: ~900 km', 290, 1150, 40, { w: 900, color: MUTE, a: dk }); txt('TÁRSIS: ~3.500 km', 790, 1150, 40, { w: 900, color: RED, a: dk });
      txt('Társis: local tradicional (sul da Espanha). Distâncias em linha reta.', 540, 1230, 26, { w: 600, color: MUTE, a: dk });
    }
    function scene4(t) {
      const sk = sm(t, s4.tem - 0.3, s4.tem + 0.4), calm = sm(t, s4.aca - 0.2, s4.aca + 0.8);
      const storm = sk * (1 - calm);
      ctx.fillStyle = lerpCol('#bcd6e6', '#2b3247', storm); ctx.fillRect(60, 430, 960, 970);
      if (storm > 0.3 && Math.sin(t * 9) > 0.92) { ga(0.5); ctx.fillStyle = '#fff'; ctx.fillRect(60, 430, 960, 970); ga(1); }
      const rock = 0.05 + 0.25 * storm; const bx = 540, by = 1060 + 25 * storm * Math.sin(t * 3);
      boat(bx, by, Math.sin(t * 2.6) * rock, 1.2);
      // Jonas lançado ao mar
      const fk = prog(t, s4.lan, s4.lan + 0.7);
      if (fk < 1) man(lerp(bx + 60, bx + 330, fk), lerp(by - 50, 1200, fk * fk), 0.55, { rot: fk * 2.4, col: RED });
      waves(1090, 70 * storm + 12, t, '#2f5d8a'); waves(1160, 50 * storm + 8, t + 1, '#244a70');
      ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(60, 430, 960, 970);
      plaque(t > s4.lan - 0.3 ? 'LANÇAM JONAS AO MAR (1:15)' : 'GRANDE TEMPESTADE (1:4)', 540, 360, 44, prog(t, B[3], B[3] + 0.3), { col: BLUE });
      if (t > s4.aca - 0.2) stamp('O MAR SE ACALMA', 540, 640, prog(t, s4.aca - 0.2, s4.aca + 0.1), { size: 72, col: BLUE });
    }
    function scene5(t) {
      const g = ctx.createLinearGradient(0, 430, 0, 1400); g.addColorStop(0, '#5a86a8'); g.addColorStop(1, '#1d3550'); ctx.fillStyle = g; ctx.fillRect(60, 430, 960, 970);
      ctx.save(); ctx.beginPath(); ctx.rect(60, 430, 960, 970); ctx.clip();
      for (let i = 0; i < 14; i++) { const yy = 1400 - ((t * 60 + i * 73) % 970); ctx.beginPath(); ctx.arc(120 + (i * 137) % 860, yy, 6 + (i % 3) * 4, 0, TAU); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.stroke(); }
      const ek = prog(t, s5.pei - 0.6, s5.eng), gone = t > s5.eng + 0.1;
      if (!gone) man(lerp(620, 700, ek), lerp(620, 900, ek), 0.6, { rot: 2.6 + t * 0.4, col: '#f3e3bd' });
      const fx = lerp(-200, 470, sm(t, s5.pei - 0.8, s5.eng, outC)), mouth = t < s5.eng ? prog(t, s5.pei - 0.4, s5.pei + 0.2) : 1 - prog(t, s5.eng, s5.eng + 0.2);
      fish(fx, 980, 1.2, mouth, t);
      ctx.restore(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(60, 430, 960, 970);
      plaque('PRIMEIRA SURPRESA (1:17)', 540, 360, 50, prog(t, B[4], B[4] + 0.3), { col: RED });
      if (t > s5.tre - 0.3) stamp('3 DIAS E 3 NOITES', 540, 1260, prog(t, s5.tre - 0.3, s5.tre), { size: 80 });
    }
    function scene6(t) {
      city(540, 760, 900, 0.9);
      plaque('CHEGA A NÍNIVE (3:3)', 540, 360, 50, prog(t, B[5], B[5] + 0.3), { col: RED });
      const bk = prog(t, s6.tre - 0.4, s6.tre); if (bk > 0) { ga(bk); for (let i = 0; i < 3; i++) { ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(110 + i * 290, 830, 280, 70); txt('DIA ' + (i + 1), 250 + i * 290, 866, 36, { w: 900, color: MUTE }); } ga(1); }
      const wk = sm(t, s6.and, s6.um + 0.4, x => x); if (wk > 0) { ctx.fillStyle = 'rgba(178,58,46,0.85)'; ctx.fillRect(110, 830, 280 * wk, 70); txt('ANDOU SÓ 1 DIA', 250, 950, 34, { w: 900, color: RED, a: prog(t, s6.um, s6.um + 0.3) }); }
      if (t > s6.cin - 0.3) stamp('5 PALAVRAS', 540, 1060, prog(t, s6.cin - 0.3, s6.cin), { size: 80 });
      if (panel(prog(t, s6.qua - 0.4, s6.qua), 1270, 220)) { txt('"Ainda quarenta dias,', 0, -50, 52, { w: 800, it: true }); txt('e Nínive será subvertida."', 0, 15, 52, { w: 800, it: true, a: prog(t, s6.des - 0.6, s6.des) }); txt('JONAS 3:4', 0, 78, 30, { w: 900, color: MUTE }); endPanel(); }
    }
    function scene7(t) {
      plaque('A CIDADE INTEIRA CRÊ (3:5)', 540, 360, 46, prog(t, B[6], B[6] + 0.3), { col: BLUE });
      const kk = sm(t, s7.cre - 0.2, s7.cre + 1.2);
      CROWD.forEach(([x, y, r]) => { const k = clamp(kk * 1.6 - r * 0.6); man(x, y, 0.32, { sit: k, bow: k, col: '#5b4632' }); });
      // rei: coroa cai na cinza
      const ck = prog(t, s7.man - 0.2, s7.cin + 0.3); const [kx, ky] = [540, 770];
      ctx.fillStyle = '#8f8a82'; ctx.beginPath(); ctx.ellipse(kx, ky + 8, 170 * prog(t, s7.cin - 0.4, s7.cin), 30, 0, 0, TAU); ctx.fill();
      man(kx, ky, 0.85, { sit: ck, bow: ck, col: INK });
      const cy = lerp(ky - 255, ky - 10, outC(ck)), cxr = lerp(kx, kx + 130, ck);
      ctx.save(); ctx.translate(cxr, cy); ctx.rotate(ck * 1.2); ctx.fillStyle = GOLD; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, 20); ctx.lineTo(-40, -15); ctx.lineTo(-20, 5); ctx.lineTo(0, -25); ctx.lineTo(20, 5); ctx.lineTo(40, -15); ctx.lineTo(40, 20); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      txt('O REI', kx, ky - 330, 40, { w: 900, color: MUTE, a: prog(t, s7.rei - 0.3, s7.rei) });
      if (t > s7.ani - 0.3) stamp('ATÉ OS ANIMAIS JEJUAM', 540, 1350, prog(t, s7.ani - 0.3, s7.ani), { size: 64 });
    }
    function scene8(t) {
      plaque('JONAS 3:10', 540, 360, 52, prog(t, B[7], B[7] + 0.3), { col: BLUE });
      city(540, 1000, 900, 1.1, GREEN);
      const k = prog(t, s8.arr - 0.4, s8.arr + 0.4); txt('40 DIAS', 540, 620, 150, { w: 900, color: RED, a: k });
      const nk = prog(t, s8.nao - 0.2, s8.nao + 0.2); if (nk > 0) { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(230, 640); ctx.lineTo(lerp(230, 850, outC(nk)), 600); ctx.stroke(); ctx.restore(); }
      if (t > s8.nao - 0.2) stamp('NÃO FOI DESTRUÍDA', 540, 1200, prog(t, s8.nao - 0.2, s8.nao + 0.1), { size: 80, col: GREEN });
    }
    function scene9(t) {
      plaque('A MAIOR SURPRESA', 540, 360, 56, prog(t, B[8], B[8] + 0.3), { col: RED });
      const fk = prog(t, s9.fur - 0.3, s9.fur);
      man(540, 1100, 1.4, { sit: 1, bow: 1, col: INK });
      if (fk > 0) { ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 10; ctx.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.35, r0 = 260 + 10 * Math.sin(t * 20 + i), r1 = r0 + 70 * fk; ctx.beginPath(); ctx.moveTo(560 + Math.cos(a) * r0, 900 + Math.sin(a) * r0 * 0.7); ctx.lineTo(560 + Math.cos(a) * r1, 900 + Math.sin(a) * r1 * 0.7); ctx.stroke(); } ctx.restore(); }
      if (t > s9.fur - 0.3) stamp('JONAS FICA FURIOSO', 540, 1260, fk, { size: 72 });
      txt('Jonas 4:1-3', 540, 1380, 34, { w: 800, color: MUTE, a: prog(t, s9.mor - 0.3, s9.mor) });
    }
    function scene10(t) {
      plaque('O LIVRO TERMINA COM UMA PERGUNTA', 540, 360, 40, prog(t, B[9], B[9] + 0.3), { col: BLUE });
      const qk = prog(t, s10.per - 0.3, s10.per + 0.2); txt('?', 540, 640, 300, { w: 900, color: RED, a: qk * 0.9, scale: outBack(qk) });
      if (panel(prog(t, s10.com - 0.5, s10.com), 1060, 260)) { txt('"não hei de eu ter compaixão', 0, -60, 46, { w: 800, it: true }); txt('da grande cidade de Nínive?"', 0, 0, 46, { w: 800, it: true }); txt('JONAS 4:11', 0, 70, 30, { w: 900, color: MUTE }); endPanel(); }
      if (t > s10.cen - 0.3) stamp('+120.000 PESSOAS', 540, 1300, prog(t, s10.cen - 0.3, s10.cen), { size: 74 });
      txt('E TANTOS ANIMAIS', 540, 1420, 44, { w: 900, color: INK, a: prog(t, s10.ani - 0.3, s10.ani) });
    }
    function scene11(t) {
      plaque('O MAIOR MILAGRE', 540, 360, 56, prog(t, B[10], B[10] + 0.3), { col: RED });
      txt('NÃO FOI O PEIXE', 540, 700, 74, { w: 900, color: MUTE, a: prog(t, s11.mai, s11.mai + 0.3) });
      const pk = prog(t, s11.pei, s11.pei + 0.4); if (pk > 0) { ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(230, 702); ctx.lineTo(lerp(230, 850, outC(pk)), 702); ctx.stroke(); ctx.restore(); }
      const mk = prog(t, s11.mis - 0.3, s11.mis + 0.1); txt('FOI A', 540, 900, 70, { w: 900, color: INK, a: mk }); txt('MISERICÓRDIA', 540, 1020, 110, { w: 900, color: BLUE, scale: outBack(mk), a: mk });
      const ik = prog(t, s11.ini - 0.4, s11.ini); txt('ATÉ PARA O INIMIGO', 540, 1170, 70, { w: 900, color: RED, scale: outBack(ik), a: ik });
    }
    function scene12(t) {
      if (t > s12.dan - 0.5) plaque('AMANHÃ: DANIEL E OS LEÕES', 540, 360, 44, prog(t, s12.dan - 0.5, s12.dan), { col: BLUE });
      else plaque('VOCÊ SABIA DESSA?', 540, 360, 52, prog(t, B[11], B[11] + 0.3), { col: RED });
      const ck = outBack(prog(t, s12.com - 0.3, s12.com + 0.1));
      if (ck > 0) for (const [x, s, c] of [[290, 'EU SABIA', GREEN], [790, 'NÃO SABIA', RED]]) { ctx.save(); ctx.translate(x, 800); ctx.scale(ck, ck); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-220, -80, 440, 160); ctx.lineWidth = 7; ctx.strokeStyle = c; ctx.strokeRect(-220, -80, 440, 160); txt(s, 0, 4, 60, { w: 900, color: c }); ctx.restore(); }
      if (ck > 0) txt('comenta aqui embaixo', 540, 940, 36, { w: 800, color: MUTE, a: ck });
      fish(560, 1160, 0.45, 0.2, t);
      const bk = sm(t, s12.seg - 0.3, s12.seg + 0.1, outBack), press = t > s12.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1420); const pr = bk * (1 - 0.06 * pulse(t, s12.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.fillStyle = press ? '#f7eed6' : RED; ctx.fillRect(-200, -46, 400, 92); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-200, -46, 400, 92); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 46, { w: 900, color: press ? INK : '#fff' }); ctx.restore(); }
    }
    function lerpCol(a, b, t) { const pa = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16)); return 'rgb(' + pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(',') + ')'; }
    // ---------------- legendas ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 60, words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 16, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), bw = total + 60, bh = size * 1.6, pop = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15));
      ctx.save(); ctx.translate(540, 1610); ctx.scale(pop, pop); ctx.fillStyle = '#f7eed6'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; if (cur) { ctx.fillStyle = '#e8c56a'; ctx.fillRect(x - 6, -size * 0.6, ws[i] + 12, size * 1.2); } txt(words[i], x + ws[i] / 2, 3, size, { w: 900 }); x += ws[i] + sp; }); ctx.restore(); }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.drawImage(tex, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      header(); RECT = RFULL; ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      captions(t); txt('Texto: Jonas 1–4 (ARA). Locais aproximados.', 540, 1780, 22, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
