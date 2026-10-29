/*
 * CLÁSSICO MINEIRO — o último clássico de 2026 em números (sem escudos, só cores), 9:16 (1080x1920)
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
    const NAMES = ['Gancho: 6º clássico', '2026 até aqui', 'Valeu taça', '23 expulsos', 'Tabela', 'Desde 1921 / 19h30', 'CTA'];
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
    function header() { ga(0.85); rr(290, 110, 500, 64, 32); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); txt('EM ALTA · EM NÚMEROS', 540, 143, 28, { w: 800, color: MU }); ga(1); }

    // ------------------------------------------------ clássico mineiro (tudo genérico: só cores, sem escudo)
    const BL = '#2f6fe4', BLD = '#1a3f8f', GRN = '#1d6b3f';
    const ATLC = '#f4f6fb', CRUC = '#4f8dff';
    function field(t, a = 0.12) { // linhas de campo ao fundo
      ga(a); ctx.lineWidth = 6; ctx.strokeStyle = WH;
      rr(90, 520, 900, 1000, 10); ctx.stroke(); line([[90, 1020], [990, 1020]], 6, WH);
      circ(540, 1020, 150, null, 6, WH); circ(540, 1020, 10, WH);
      rr(300, 520, 480, 180, 4); ctx.stroke(); rr(300, 1340, 480, 180, 4); ctx.stroke(); ga(1);
    }
    function ball(x, y, r, team, k = 1) { // bola-emblema genérica nas cores do time
      if (k <= 0) return; const sc = outBack(k);
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
      circ(8, 10, r, 'rgba(0,0,0,0.45)');
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
      if (team === 'A') { ctx.fillStyle = ATLC; ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.fillStyle = '#111'; for (let i = -3; i <= 3; i += 2) ctx.fillRect(i * r / 3.5 - r / 7, -r, r / 3.5, 2 * r); }
      else { ctx.fillStyle = CRUC; ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.fillStyle = BLD; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, TAU); ctx.fill(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; circ(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32, r * 0.1, WH); } }
      ctx.restore();
      circ(0, 0, r, null, Math.max(6, r * 0.08), INK);
      ctx.restore();
    }
    function teamName(team) { return team === 'A' ? 'ATLÉTICO' : 'CRUZEIRO'; }
    function teamCol(team) { return team === 'A' ? ATLC : CRUC; }
    function redCard(x, y, s, rot, a = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ga(a); rr(-34 + 5, -48 + 6, 68, 96, 8); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill(); rr(-34, -48, 68, 96, 8); ctx.fillStyle = HOT; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ga(1); ctx.restore(); }
    function trophy(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      soft(0, -60, 330, 'rgba(255,209,102,A)', 0.35 + 0.1 * Math.sin(t * 4));
      const G = '#ffc93c', GD = '#c8901a';
      for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * 150, -130, 62, sd > 0 ? -1.6 : Math.PI - 1.6 + 0.0, sd > 0 ? 1.6 : Math.PI + 1.6); ctx.lineWidth = 26; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 16; ctx.strokeStyle = GD; ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-170, -230); ctx.lineTo(170, -230); ctx.quadraticCurveTo(160, 20, 0, 50); ctx.quadraticCurveTo(-160, 20, -170, -230); ctx.closePath(); ctx.fillStyle = G; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-120, -200); ctx.quadraticCurveTo(-110, -40, -30, 10); ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.stroke();
      rr(-28, 45, 56, 80, 6); ctx.fillStyle = GD; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      rr(-110, 120, 220, 70, 12); ctx.fillStyle = '#5a3d1e'; ctx.fill(); ctx.stroke();
      rr(-70, 140, 140, 30, 6); ctx.fillStyle = G; ctx.fill();
      ctx.restore();
    }
    function clockFace(x, y, r, hh, mm, k) {
      if (k <= 0) return; const sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
      circ(8, 10, r, 'rgba(0,0,0,0.45)'); circ(0, 0, r, WH, 10, INK);
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12; line([[Math.sin(a) * r * 0.82, -Math.cos(a) * r * 0.82], [Math.sin(a) * r * 0.92, -Math.cos(a) * r * 0.92]], i % 3 ? 5 : 9, INK); }
      const ah = ((hh % 12) + mm / 60) * TAU / 12, am = mm * TAU / 60;
      line([[0, 0], [Math.sin(ah) * r * 0.5, -Math.cos(ah) * r * 0.5]], 14, INK);
      line([[0, 0], [Math.sin(am) * r * 0.75, -Math.cos(am) * r * 0.75]], 9, HOT);
      circ(0, 0, 12, INK); ctx.restore();
    }

    // ================= CENA 1 — GANCHO =================
    const s1 = { sex: wt('c1', 'sexto'), cla: wt('c1', 'classico'), ult: wt('c1', 'ultimo'), doi: wt('c1', 'dois'), hoj: wt('c1', 'hoje'), noi: wt('c1', 'noite'), atl: wt('c1', 'atletico'), cru: wt('c1', 'cruzeiro'), enf: wt('c1', 'enfrentam') };
    cue(0, 'music', { part: 'intro' }); cue(0.15, 'stamp'); cue(0.2, 'impact', { gain: 0.7 }); cue(s1.cla, 'pop'); cue(s1.ult, 'stamp'); cue(s1.hoj, 'tick', { dur: 0.4 }); cue(s1.atl, 'pop'); cue(s1.cru, 'pop'); cue(s1.enf, 'impact', { gain: 0.6 }); cue(s1.enf, 'music', { part: 'groove' });
    function scene1(t) {
      bg(t, 'rgba(58,134,255,A)'); field(t); header();
      rtxt('6º CLÁSSICO', 540, 300, 128, { color: Y, sh: '#000', scale: sm(t, 0.05, 0.45, outBack) });
      chip('DE 2026', 540, 425, 44, WH, prog(t, 0.3, 0.6));
      stampMark(540, 590, 'O ÚLTIMO DO ANO', prog(t, s1.ult - 0.05, s1.ult + 0.12), { size: 70, col: HOT, rot: -0.07 });
      const bob = Math.sin(t * 2) * 8;
      ball(290, 1000 + bob, 170, 'A', prog(t, s1.cla - 0.2, s1.cla + 0.15));
      ball(790, 1000 - bob, 170, 'C', prog(t, s1.cla - 0.05, s1.cla + 0.3));
      if (t > s1.atl) txt('ATLÉTICO', 290, 1235, 54, { w: 900, color: ATLC, stroke: 12, a: prog(t, s1.atl, s1.atl + 0.2) });
      if (t > s1.cru) txt('CRUZEIRO', 790, 1235, 54, { w: 900, color: CRUC, stroke: 12, a: prog(t, s1.cru, s1.cru + 0.2) });
      const vk = sm(t, s1.enf - 0.15, s1.enf + 0.15, outBack);
      if (vk > 0) { soft(540, 1000, 260, 'rgba(255,209,102,A)', 0.4 * vk); rtxt('X', 540, 1000, 130, { color: Y, sh: '#000', scale: vk }); }
      chip('HOJE À NOITE', 540, 1380, 46, TE, prog(t, s1.hoj - 0.15, s1.hoj + 0.15));
    }

    // ================= CENA 2 — os 5 clássicos de 2026 =================
    const s2 = { cin: wt('c2', 'cinco'), jog: wt('c2', 'jogos'), atl: wt('c2', 'atletico'), v1: wt('c2', 'venceu'), tre: wt('c2', 'tres'), cru: wt('c2', 'cruzeiro'), v2: wt('c2', 'venceu', 1), um: wt('c2', 'um'), emp: wt('c2', 'empate') };
    const GAMES = [['MINEIRO', 2, 1, 'A'], ['FINAL DO MINEIRO', 0, 1, 'C'], ['BRASILEIRÃO', 3, 1, 'A'], ['COPA DO BRASIL', 1, 1, 'E'], ['COPA DO BRASIL', 2, 1, 'A']];
    cue(B[1], 'music', { part: 'safe' }); GAMES.forEach((g, i) => cue(s2.cin + i * 0.16, 'card', { gain: 0.6 })); cue(s2.tre, 'plus'); cue(s2.v2 + 0.1, 'plus'); cue(s2.emp, 'ding');
    function scene2(t) {
      bg(t, 'rgba(255,209,102,A)'); header();
      rtxt('2026 ATÉ AQUI', 540, 290, 92, { color: WH, sh: '#000', scale: sm(t, B[1], B[1] + 0.35, outBack) });
      GAMES.forEach(([lab, a, c, w], i) => {
        const k = prog(t, s2.cin - 0.1 + i * 0.16, s2.cin + 0.2 + i * 0.16); if (k <= 0) return; const y = 460 + i * 132;
        const hl = (w === 'A' && t > s2.tre - 0.1) || (w === 'C' && t > s2.v2) || (w === 'E' && t > s2.emp - 0.1);
        ctx.save(); ctx.translate(lerp(-500, 0, outC(k)), 0); ga(clamp(k * 2));
        rr(90, y - 54, 900, 108, 26); ctx.fillStyle = hl ? (w === 'A' ? 'rgba(244,246,251,0.2)' : w === 'C' ? 'rgba(79,141,255,0.3)' : 'rgba(138,148,179,0.3)') : 'rgba(255,255,255,0.07)'; ctx.fill();
        if (hl) { ctx.lineWidth = 5; ctx.strokeStyle = w === 'A' ? ATLC : w === 'C' ? CRUC : MU; ctx.stroke(); }
        txt(lab, 125, y + 2, 34, { w: 800, color: MU, align: 'left' });
        txt('ATL', 600, y + 2, 40, { w: 900, color: ATLC, align: 'right' });
        txt(`${a} x ${c}`, 700, y + 2, 50, { w: 900, color: Y });
        txt('CRU', 800, y + 2, 40, { w: 900, color: CRUC, align: 'left' });
        ctx.restore(); ga(1);
      });
      // placar resumido
      const rows = [['VITÓRIAS ATLÉTICO', 3, ATLC, s2.tre], ['VITÓRIA CRUZEIRO', 1, CRUC, s2.v2 + 0.1], ['EMPATE', 1, MU, s2.emp]];
      rows.forEach(([lab, n, col, tt], i) => {
        const k = sm(t, tt - 0.2, tt + 0.15, outBack); if (k <= 0) return; const x = 200 + i * 340, y = 1300;
        ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
        rr(-150, -110, 300, 220, 28); ctx.fillStyle = 'rgba(8,16,32,0.85)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
        txt(String(n), 0, -22, 120, { w: 900, color: col });
        txt(lab.split(' ')[0], 0, 62, 30, { w: 900, color: WH });
        if (lab.split(' ')[1]) txt(lab.split(' ')[1], 0, 95, 26, { w: 800, color: MU });
        ctx.restore();
      });
    }

    // ================= CENA 3 — a vitória que valeu taça =================
    const s3 = { mas: wt('c3', 'mas'), vit: wt('c3', 'vitoria'), cru: wt('c3', 'cruzeiro'), val: wt('c3', 'valeu'), tac: wt('c3', 'taca'), um: wt('c3', 'um'), zer: wt('c3', 'zero'), fin: wt('c3', 'final'), min: wt('c3', 'mineiro') };
    cue(s3.mas, 'whoosh', { dur: 0.5 }); cue(s3.tac, 'reveal'); cue(s3.tac, 'sparkle'); cue(s3.um, 'impact', { gain: 0.6 }); cue(s3.zer, 'stamp'); cue(s3.min, 'tada');
    function scene3(t) {
      bg(t, 'rgba(255,209,102,A)'); header();
      rtxt('VALEU TAÇA', 540, 300, 104, { color: Y, sh: '#000', scale: sm(t, s3.val - 0.2, s3.tac + 0.05, outBack) });
      chip('A VITÓRIA DO CRUZEIRO', 540, 300, 44, CRUC, prog(t, s3.vit - 0.15, s3.vit + 0.15) * (1 - prog(t, s3.val - 0.25, s3.val - 0.1)), { tc: WH });
      const tk = sm(t, s3.vit - 0.3, s3.vit + 0.1, outBack);
      if (tk > 0) trophy(540, 820, lerp(0.8, 1.05, sm(t, s3.tac - 0.3, s3.tac + 0.1)) * tk, t);
      const sk = sm(t, s3.um - 0.15, s3.zer + 0.1, outBack);
      if (sk > 0) {
        ctx.save(); ctx.translate(540, 1240); ctx.scale(sk, sk);
        rr(-380, -90, 760, 180, 40); ctx.fillStyle = 'rgba(8,16,32,0.9)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = Y; ctx.stroke();
        txt('CRU', -270, 4, 56, { w: 900, color: CRUC }); txt('ATL', 270, 4, 56, { w: 900, color: ATLC });
        txt(t > s3.zer - 0.05 ? '1 x 0' : '1 x', 0, 4, 100, { w: 900, color: Y });
        ctx.restore();
      }
      chip('FINAL DO MINEIRO · MARÇO', 540, 1420, 40, WH, prog(t, s3.fin - 0.15, s3.fin + 0.15));
    }

    // ================= CENA 4 — 23 expulsos =================
    const s4 = { aqu: wt('c4', 'aquela'), fin: wt('c4', 'final'), bri: wt('c4', 'briga'), vin: wt('c4', 'vinte'), tre: wt('c4', 'tres'), exp: wt('c4', 'expulsos'), rec: wt('c4', 'recorde'), bra: wt('c4', 'brasileiro') };
    cue(s4.bri, 'angry'); cue(s4.vin, 'roll', { dur: 0.7 }); cue(s4.exp, 'error'); cue(s4.rec, 'stamp'); cue(s4.rec, 'impact', { gain: 0.6 });
    function scene4(t) {
      bg(t, 'rgba(255,77,94,A)'); header();
      const nk = sm(t, s4.vin - 0.25, s4.vin, outBack);
      const n = Math.max(1, Math.round(23 * outC(prog(t, s4.vin - 0.1, s4.exp))));
      if (nk > 0) rtxt(String(n), 540, 330, 220, { color: HOT, sh: '#000', scale: nk });
      chip('EXPULSOS', 540, 500, 50, HOT, prog(t, s4.exp - 0.15, s4.exp + 0.15), { tc: WH });
      chip('A FINAL DO MINEIRO', 540, 330, 46, WH, prog(t, B[3], B[3] + 0.3) * (1 - prog(t, s4.bri - 0.3, s4.bri - 0.15)));
      if (t < s4.vin - 0.1) { const sh = t > s4.bri - 0.1 ? Math.sin(t * 40) * 14 : 0, cl = sm(t, s4.bri - 0.2, s4.bri + 0.2) * 90; ball(330 + cl + sh, 900, 140, 'C', prog(t, B[3], B[3] + 0.3)); ball(750 - cl - sh, 900, 140, 'A', prog(t, B[3] + 0.1, B[3] + 0.4)); }
      if (t < s4.vin) { const bk = sm(t, s4.bri - 0.2, s4.bri + 0.15, outBack); if (bk > 0) rtxt('BRIGA', 540, 330, 130, { color: WH, sh: '#000', scale: bk, rot: Math.sin(t * 30) * 0.03 }); }
      // 23 cartões vermelhos caindo numa grade
      for (let i = 0; i < 23; i++) {
        const t0 = s4.vin - 0.1 + i * 0.045, k = prog(t, t0, t0 + 0.35); if (k <= 0) continue;
        const col = i % 6, row = Math.floor(i / 6), x = 220 + col * 128, y = 700 + row * 150;
        const yy = lerp(-200, y, outC(k)), rot = lerp(1.2 * (i % 2 ? 1 : -1), (i % 3 - 1) * 0.12, outC(k));
        redCard(x, yy, 1.1, rot);
      }
      if (t > s4.rec - 0.1) stampMark(540, 1350, 'RECORDE NO BRASIL', prog(t, s4.rec - 0.05, s4.rec + 0.12), { size: 64, col: Y, rot: -0.06 });
      txt('o anterior era 22, em 1954', 540, 1480, 34, { w: 700, color: MU, a: prog(t, s4.bra, s4.bra + 0.3) });
    }

    // ================= CENA 5 — a tabela =================
    const s5 = { tab: wt('c5', 'tabela'), cru: wt('c5', 'cruzeiro'), ter: wt('c5', 'terceiro'), c54: wt('c5', 'cinquenta'), qua: wt('c5', 'quatro'), atl: wt('c5', 'atletico'), sex: wt('c5', 'sexto'), c50: wt('c5', 'cinquenta', 1) };
    cue(s5.tab, 'scan', { dur: 0.6, gain: 0.6 }); cue(s5.ter, 'ding'); cue(s5.qua, 'coin'); cue(s5.sex, 'ding'); cue(s5.c50, 'coin');
    function scene5(t) {
      bg(t, 'rgba(46,196,182,A)'); header();
      rtxt('BRASILEIRÃO', 540, 290, 96, { color: WH, sh: '#000', scale: sm(t, B[4], B[4] + 0.35, outBack) });
      chip('ANTES DA 33ª RODADA', 540, 405, 36, MU, prog(t, s5.tab - 0.1, s5.tab + 0.2), { tc: INK });
      for (let i = 0; i < 6; i++) {
        const k = prog(t, s5.tab - 0.1 + i * 0.06, s5.tab + 0.2 + i * 0.06); if (k <= 0) continue; const y = 560 + i * 135, pos = i + 1;
        const team = pos === 3 ? 'C' : pos === 6 ? 'A' : null, on = team === 'C' ? t > s5.ter - 0.1 : team === 'A' ? t > s5.sex - 0.1 : false;
        ctx.save(); ga(clamp(k * 2) * (team ? 1 : 0.55)); ctx.translate(lerp(400, 0, outC(k)), 0);
        rr(110, y - 52, 860, 104, 22); ctx.fillStyle = on ? (team === 'C' ? 'rgba(79,141,255,0.35)' : 'rgba(244,246,251,0.22)') : 'rgba(255,255,255,0.06)'; ctx.fill();
        if (on) { ctx.lineWidth = 6; ctx.strokeStyle = teamCol(team); ctx.stroke(); }
        txt(pos + 'º', 175, y + 2, 50, { w: 900, color: on ? Y : MU });
        if (team) { ball(285, y, 36, team, 1); txt(teamName(team), 345, y + 2, 50, { w: 900, color: on ? teamCol(team) : MU, align: 'left' }); }
        else { rr(250, y - 10, 300, 20, 10); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill(); }
        if (team && on) { const pk = team === 'C' ? prog(t, s5.c54 - 0.1, s5.qua + 0.2) : prog(t, s5.c50 - 0.1, s5.c50 + 0.3); const pts = Math.round((team === 'C' ? 54 : 50) * outC(pk)); if (pk > 0) txt(pts + ' PTS', 930, y + 2, 50, { w: 900, color: WH, align: 'right' }); }
        ctx.restore(); ga(1);
      }
      const dk = prog(t, s5.c50 + 0.3, s5.c50 + 0.6);
      chip('4 PONTOS DE DIFERENÇA', 540, 1420, 42, Y, dk);
    }

    // ================= CENA 6 — desde 1921 / hoje 19h30 =================
    const s6 = { riv: wt('c6', 'rivalidade'), com: wt('c6', 'comecou'), mil: wt('c6', 'mil'), vin: wt('c6', 'vinte'), bol: wt('c6', 'bola'), rol: wt('c6', 'rola'), set: wt('c6', 'sete'), mei: wt('c6', 'meia'), noi: wt('c6', 'noite') };
    cue(s6.riv, 'whoosh', { dur: 0.5 }); cue(s6.mil, 'tick', { dur: 0.8 }); cue(s6.vin + 0.3, 'stamp'); cue(s6.bol, 'swoosh'); cue(s6.set, 'ring', { dur: 0.5 }); cue(s6.noi, 'success');
    function scene6(t) {
      bg(t, 'rgba(58,134,255,A)'); field(t, 0.08); header();
      const yk = sm(t, s6.mil - 0.2, s6.vin + 0.3, outBack), yr = Math.round(lerp(2026, 1921, outC(prog(t, s6.mil - 0.1, s6.vin + 0.35))));
      if (t < s6.bol - 0.15) {
        chip('RIVALIDADE', 540, 300, 46, WH, prog(t, s6.riv - 0.15, s6.riv + 0.15));
        if (yk > 0) { txt('DESDE', 540, 520, 64, { w: 900, color: MU, a: yk }); rtxt(String(yr), 540, 700, 230, { color: Y, sh: '#000', scale: yk }); }
        txt('mais de 100 anos de clássico', 540, 900, 40, { w: 700, color: WH, a: prog(t, s6.vin + 0.3, s6.vin + 0.6) });
        ball(300, 1180, 110, 'A', prog(t, s6.com - 0.1, s6.com + 0.2)); ball(780, 1180, 110, 'C', prog(t, s6.com, s6.com + 0.3));
      } else {
        const ck = sm(t, s6.bol - 0.15, s6.rol + 0.1, outBack);
        rtxt('HOJE', 540, 320, 120, { color: WH, sh: '#000', scale: ck });
        clockFace(540, 760, 250, 7, 30, prog(t, s6.bol - 0.1, s6.rol + 0.2));
        if (t > s6.set - 0.1) rtxt('19H30', 540, 1150, 140, { color: Y, sh: '#000', scale: sm(t, s6.set - 0.1, s6.mei + 0.1, outBack) });
        chip('33ª RODADA · HORÁRIO DE BRASÍLIA', 540, 1330, 36, WH, prog(t, s6.noi - 0.2, s6.noi + 0.15));
      }
    }

    // ================= CENA 7 — CTA =================
    const s7 = { que: wt('c7', 'quem'), lev: wt('c7', 'leva'), ult: wt('c7', 'ultimo'), com: wt('c7', 'comenta'), pla: wt('c7', 'placar'), seg: wt('c7', 'segue'), ama: wt('c7', 'amanha'), out: wt('c7', 'outro'), ass: wt('c7', 'assunto') };
    cue(B[6], 'music', { part: 'outro' }); cue(s7.lev, 'pop'); cue(s7.com, 'notif'); cue(s7.pla, 'type', { n: 5, rate: 12 }); cue(s7.seg + 0.2, 'tap'); cue(s7.seg + 0.25, 'success'); cue(s7.ama, 'riser', { dur: 0.6 });
    function scene7(t) {
      bg(t, 'rgba(255,209,102,A)'); field(t, 0.08); header();
      rtxt('QUEM LEVA?', 540, 300, 120, { color: Y, sh: '#000', scale: sm(t, s7.que - 0.1, s7.lev + 0.1, outBack) });
      ball(250, 640, 120, 'A', prog(t, s7.lev - 0.1, s7.lev + 0.2)); ball(830, 640, 120, 'C', prog(t, s7.lev, s7.lev + 0.3));
      const pk = sm(t, s7.com - 0.15, s7.com + 0.15, outBack);
      if (pk > 0) {
        ctx.save(); ctx.translate(540, 640); ctx.scale(pk, pk);
        rr(-170, -90, 340, 180, 30); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-60, 88); ctx.lineTo(-100, 140); ctx.lineTo(-10, 88); ctx.closePath(); ctx.fillStyle = WH; ctx.fill();
        txt(t > s7.pla ? '? x ?' : '...', 0, 4, 84, { w: 900, color: INK });
        ctx.restore();
      }
      chip('COMENTA SEU PLACAR', 540, 880, 44, TE, prog(t, s7.pla - 0.15, s7.pla + 0.2));
      const bk = sm(t, s7.seg - 0.3, s7.seg + 0.1, outBack), press = t > s7.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1100); const pr = bk * (1 - 0.06 * pulse(t, s7.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(127,216,255,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : ICE; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
      const ak = sm(t, s7.ama - 0.2, s7.out, outBack);
      if (ak > 0) { chip('AMANHÃ', 540, 1300, 44, Y, ak); chip('OUTRO ASSUNTO DO DIA EXPLICADO', 540, 1420, 36, WH, prog(t, s7.ass - 0.2, s7.ass + 0.2)); }
    }

    // ================= legendas =================
    const HL = new Set(['sexto', 'classico', 'ultimo', 'atletico', 'cruzeiro', 'cinco', 'tres', 'um', 'empate', 'taca', 'zero', 'final', 'mineiro', 'briga', 'vinte', 'expulsos', 'recorde', 'terceiro', 'cinquenta', 'quatro', 'sexto', 'rivalidade', 'mil', 'novecentos', 'sete', 'meia', 'noite', 'quem', 'leva', 'comenta', 'placar', 'segue', 'amanha']);
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
