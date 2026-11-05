/*
 * A HISTÓRIA POR TRÁS DO VERSÍCULO — 2 Timóteo 4:7 (piloto de formato para a Palavra da Manhã).
 * Pergaminho + mapa (Natural Earth, assets/med.json) + cela + versículo revelado. 9:16.
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

  const PAPER = '#efe2c4', SEA = '#cdd9cc', LAND = '#e6d3a6', COAST = '#8b6b3d', INK = '#3b2a1a', MUTE = '#7a6248', RED = '#a8322a', GOLD = '#c08a1e', CREAM = '#f7eed6';
  const C = { 'Antioquia': [36.20, 36.20], 'Jerusalém': [35.23, 31.78], 'Cesareia': [34.89, 32.50], 'Éfeso': [27.34, 37.94], 'Corinto': [22.88, 37.91], 'Atenas': [23.73, 37.98], 'Filipos': [24.29, 41.01], 'Tessalônica': [22.94, 40.64], 'Trôade': [26.16, 39.75], 'Tarso': [34.90, 36.92], 'Icônio': [32.49, 37.87], 'Mirra': [29.98, 36.26], 'Creta': [24.82, 34.93], 'Malta': [14.40, 35.92], 'Siracusa': [15.28, 37.08], 'Putéoli': [14.12, 40.82], 'Roma': [12.50, 41.90] };
  const P = n => [C[n][0] * K, -C[n][1]];
  const PATH = ['Jerusalém', 'Antioquia', 'Tarso', 'Icônio', 'Trôade', 'Filipos', 'Tessalônica', 'Atenas', 'Corinto', 'Éfeso', 'Cesareia', 'Mirra', 'Creta', 'Malta', 'Siracusa', 'Putéoli', 'Roma'];
  const SEGS = (() => { const s = []; let tot = 0; for (let i = 1; i < PATH.length; i++) { const a = P(PATH[i - 1]), b = P(PATH[i]), len = Math.hypot(b[0] - a[0], b[1] - a[1]); s.push({ a, b, len, s0: tot }); tot += len; } s.tot = tot; return s; })();

  function create(TL, env) {
    const mk = env.createCanvas, LANDS = env.geo || require('../assets/med.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot); ctx.font = `${o.italic ? 'italic ' : ''}${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || PAPER; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || INK; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.3, w = o.w || 700; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || INK, a: o.a ?? 1 }); cx += ws[i] + sp; }); }
    function plaque(s, x, y, size, k, o = {}) { if (k <= 0) return; const w = tw(s, size, 900) + size * 1.0, h = size * 1.6, sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.fillStyle = o.fill || CREAM; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 4; ctx.strokeStyle = o.col || INK; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14); txt(s, 0, 3, size, { w: 900, color: o.col || INK }); ctx.restore(); ga(1); }
    function stamp(s, x, y, k, o = {}) { if (k <= 0) return; const sc = lerp(2.2, 1, outC(k)), size = o.size || 80, w = tw(s, size, 900) + 60, h = size * 1.4; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.lineWidth = 9; ctx.strokeStyle = o.col || RED; ctx.strokeRect(-w / 2, -h / 2, w, h); txt(s, 0, 4, size, { w: 900, color: o.col || RED }); ctx.restore(); ga(1); }
    function line(pts, w, col) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }

    const tex = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); let s = 9; const R0 = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 60000; i++) { g.fillStyle = R0() < 0.5 ? 'rgba(120,80,30,0.05)' : 'rgba(255,255,255,0.06)'; g.fillRect(R0() * W, R0() * H, 1 + R0() * 2, 1 + R0() * 2); }
      const gr = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); gr.addColorStop(0, 'rgba(90,55,20,0)'); gr.addColorStop(1, 'rgba(90,55,20,0.38)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ---------------- mapa ----------------
    const RECT = [40, 420, 1000, 1000];
    const box = (lo0, lo1, la0, la1) => { const x0 = lo0 * K, x1 = lo1 * K, y0 = -la1, y1 = -la0, s = Math.min(RECT[2] / (x1 - x0), RECT[3] / (y1 - y0)); return { s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    const CAM_ALL = box(10, 38, 30.5, 44), CAM_ROMA = box(8.5, 16.5, 38.5, 45);
    const toS = (cam, p) => [RECT[0] + RECT[2] / 2 + (p[0] - cam.cx) * cam.s, RECT[1] + RECT[3] / 2 + (p[1] - cam.cy) * cam.s];
    const camMix = (a, b, k) => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) });
    function drawMap(cam) {
      ctx.save(); ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip();
      ctx.fillStyle = SEA; ctx.fillRect(RECT[0], RECT[1], RECT[2], RECT[3]);
      ctx.strokeStyle = 'rgba(80,110,100,0.12)'; ctx.lineWidth = 2; for (let y = RECT[1] + 20; y < RECT[1] + RECT[3]; y += 44) { ctx.beginPath(); for (let x = RECT[0]; x <= RECT[0] + RECT[2]; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.05 + y) * 4); ctx.stroke(); }
      ctx.translate(RECT[0] + RECT[2] / 2, RECT[1] + RECT[3] / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
      ctx.beginPath(); for (const r of LANDS) { r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
      ctx.fillStyle = LAND; ctx.fill('nonzero'); ctx.lineWidth = 2.2 / cam.s; ctx.strokeStyle = COAST; ctx.stroke();
      ctx.restore(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(RECT[0], RECT[1], RECT[2], RECT[3]);
    }
    function journey(cam, d, a = 1) {
      ga(a); ctx.save(); ctx.beginPath(); ctx.rect(RECT[0], RECT[1], RECT[2], RECT[3]); ctx.clip(); let head = null;
      for (const sg of SEGS) { if (d <= sg.s0) break; const u = clamp((d - sg.s0) / sg.len), A = toS(cam, sg.a), Bp = toS(cam, sg.b), x = lerp(A[0], Bp[0], u), y = lerp(A[1], Bp[1], u);
        line([A, [x, y]], 7, RED); head = [x, y]; }
      ctx.restore(); ga(1); return head;
    }
    function city(cam, n, k, size = 24, lbl = true) { if (k <= 0) return; const [x, y] = toS(cam, P(n)); if (x < RECT[0] || x > RECT[0] + RECT[2] || y < RECT[1] || y > RECT[1] + RECT[3]) return; ctx.beginPath(); ctx.arc(x, y, 9 * outBack(k), 0, TAU); ctx.fillStyle = CREAM; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); if (lbl) txt(n.toUpperCase(), x, y - 30, size, { w: 900, stroke: 7, a: clamp(k * 2) }); }
    function chainIcon(x, y, s, k, al = 1) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * outBack(k), s * outBack(k)); ga(clamp(k * 3) * al); for (let i = -2; i <= 2; i++) { ctx.save(); ctx.translate(i * 46, 0); ctx.rotate(i % 2 ? 0 : 0); ctx.beginPath(); if (i % 2) ctx.ellipse(0, 0, 30, 14, 0, 0, TAU); else ctx.ellipse(0, 0, 30, 18, 0, 0, TAU); ctx.lineWidth = 11; ctx.strokeStyle = '#4a4a4a'; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#8a8a8a'; ctx.stroke(); ctx.restore(); } ctx.restore(); ga(al); }

    // ---------------- cela ----------------
    function cell(t, a) {
      ga(a); scr(); ctx.save(); ctx.beginPath(); ctx.rect(40, 300, 1000, 1200); ctx.clip();
      const g = ctx.createLinearGradient(0, 300, 0, 1500); g.addColorStop(0, '#2b241d'); g.addColorStop(1, '#14100c'); ctx.fillStyle = g; ctx.fillRect(40, 300, 1000, 1200);
      for (let r = 0; r < 14; r++) for (let c = 0; c < 6; c++) { const x = 40 + c * 180 + (r % 2) * 90 - 90, y = 300 + r * 86; ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 4; ctx.strokeRect(x, y, 180, 86); ctx.fillStyle = `rgba(255,240,210,${0.02 + ((r * 7 + c * 3) % 5) * 0.008})`; ctx.fillRect(x + 3, y + 3, 174, 80); }
      // janela com grade e feixe de luz
      const wx = 700, wy = 420; ctx.fillStyle = '#c9d6e0'; ctx.fillRect(wx, wy, 180, 140); for (let i = 1; i < 5; i++) { ctx.fillStyle = '#1a1510'; ctx.fillRect(wx + i * 36 - 6, wy, 12, 140); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const bm = ctx.createLinearGradient(wx, wy, 380, 1400); bm.addColorStop(0, `rgba(255,236,190,${0.18 * a})`); bm.addColorStop(1, 'rgba(255,236,190,0)'); ctx.fillStyle = bm; ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + 180, wy + 140); ctx.lineTo(620, 1500); ctx.lineTo(140, 1500); ctx.closePath(); ctx.fill(); ctx.restore();
      // chão, banco, vela e pergaminho
      ctx.fillStyle = '#0e0b08'; ctx.fillRect(40, 1300, 1000, 200);
      ctx.fillStyle = '#3d2c1c'; ctx.fillRect(250, 1180, 520, 34); ctx.fillRect(280, 1214, 26, 100); ctx.fillRect(714, 1214, 26, 100);
      ctx.save(); ctx.translate(480, 1150); ctx.rotate(-0.05); ctx.fillStyle = CREAM; ctx.fillRect(-120, -30, 240, 60); ctx.fillStyle = '#d9c7a0'; ctx.beginPath(); ctx.arc(-120, 0, 30, 0, TAU); ctx.arc(120, 0, 30, 0, TAU); ctx.fill(); for (let i = 0; i < 3; i++) line([[-90, -12 + i * 12], [lerp(30, 90, i / 2), -12 + i * 12]], 3, 'rgba(59,42,26,0.6)'); ctx.restore();
      const fl = Math.sin(t * 9) * 3 + Math.sin(t * 23) * 1.5, cx = 680, cy = 1100; ctx.fillStyle = '#efe6d2'; ctx.fillRect(cx - 16, cy, 32, 80);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const hl = ctx.createRadialGradient(cx, cy - 30, 0, cx, cy - 30, 380); hl.addColorStop(0, `rgba(255,190,90,${0.45 * a})`); hl.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = hl; ctx.fillRect(cx - 380, cy - 410, 760, 760); ctx.restore();
      ctx.beginPath(); ctx.moveTo(cx, cy - 64 + fl); ctx.quadraticCurveTo(cx + 18, cy - 24, cx, cy - 4); ctx.quadraticCurveTo(cx - 18, cy - 24, cx, cy - 64 + fl); ctx.fillStyle = '#ffcf6a'; ctx.fill();
      // corrente na parede
      chainIcon(200, 820, 0.9, 1, a);
      ctx.restore(); ga(1);
    }

    // ---------------- tempos ----------------
    const s1 = { ver: wt('c1', 'versiculo'), esc: wt('c1', 'escrito'), hom: wt('c1', 'homem'), sab: wt('c1', 'sabia'), mor: wt('c1', 'morrer') };
    const s2 = { pau: wt('c2', 'paulo'), ano: wt('c2', 'anos'), cru: wt('c2', 'cruzou'), tre: wt('c2', 'tres'), aco: wt('c2', 'acoites'), pri: wt('c2', 'prisoes') };
    const s3 = { tra: wt('c3', 'tradicao'), pre: wt('c3', 'preso'), rom: wt('c3', 'roma'), aco: wt('c3', 'acorrentado') };
    const s4 = { qua: wt('c4', 'quase'), aba: wt('c4', 'abandonaram'), luc: wt('c4', 'lucas'), cap: wt('c4', 'capa'), fri: wt('c4', 'frio') };
    const s5 = { cel: wt('c5', 'cela'), tim: wt('c5', 'timoteo'), com: wt('c5', 'combati'), car: wt('c5', 'carreira'), gua: wt('c5', 'guardei'), fe: wt('c5', 'fe') };
    const s6 = { nao: wt('c6', 'nao'), ven: wt('c6', 'venci'), esc: wt('c6', 'escreveu', 1), des: wt('c6', 'desisti'), tal: wt('c6', 'talvez'), lar: wt('c6', 'largar'), fe: wt('c6', 'fe') };
    const s7 = { qua: wt('c7', 'qual'), his: wt('c7', 'historia'), com: wt('c7', 'comenta') };
    cue(0, 'music', { part: 'intro' }); cue(s1.mor, 'impact', { gain: 0.5 }); cue(B[1], 'music', { part: 'safe' });
    cue(s2.tre, 'splash', { gain: 0.5 }); cue(s2.aco, 'stamp', { gain: 0.6 }); cue(s2.pri, 'lock', { gain: 0.6 });
    cue(s3.pre, 'stamp', { gain: 0.7 }); cue(s3.aco, 'lock');
    cue(s5.com, 'reveal', { gain: 0.5 }); cue(s5.gua, 'bell', { gain: 0.5 });
    cue(s6.ven, 'scratch', { gain: 0.5 }); cue(s6.des, 'impact', { gain: 0.5 }); cue(B[6], 'music', { part: 'outro' }); cue(s7.com, 'notif');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.35 });

    function header(a = 1) { ga(a); spaced('A HISTÓRIA POR TRÁS', 540, 150, 46, { sp: 9, w: 800 }); spaced('DO VERSÍCULO', 540, 212, 46, { sp: 9, w: 800, color: RED }); ctx.fillStyle = INK; ctx.fillRect(300, 262, 480, 3); ga(1); }

    // ---------------- cenas ----------------
    function scene1(t) {
      header(sm(t, 0, 0.5));
      // pergaminho com o versículo escondido
      const k = sm(t, 0.1, 0.7, outBack);
      if (k > 0) { ctx.save(); ctx.translate(540, 760); ctx.scale(k, k); ctx.rotate(-0.02); ctx.fillStyle = CREAM; ctx.fillRect(-380, -230, 760, 460); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-380, -230, 760, 460); ctx.strokeRect(-366, -216, 732, 432);
        ctx.fillStyle = '#d9c7a0'; ctx.beginPath(); ctx.arc(-380, 0, 50, Math.PI / 2, Math.PI * 1.5); ctx.fill(); ctx.beginPath(); ctx.arc(380, 0, 50, -Math.PI / 2, Math.PI / 2); ctx.fill();
        for (let i = 0; i < 4; i++) { const w = [560, 500, 600, 380][i]; ctx.fillStyle = 'rgba(59,42,26,0.85)'; ctx.fillRect(-w / 2, -140 + i * 80, w, 36); }
        txt('?', 0, 0, 260, { w: 900, color: RED, a: 0.9 * (0.75 + 0.25 * Math.sin(t * 3)) }); ctx.restore(); }
      const a1 = sm(t, s1.esc - 0.2, s1.esc + 0.15, outBack), a2 = sm(t, s1.hom - 0.2, s1.hom + 0.15, outBack), a3 = sm(t, s1.sab - 0.2, s1.sab + 0.15, outBack);
      txt('ESCRITO POR UM HOMEM', 540, 1130, 66, { w: 900, scale: a1 });
      txt('QUE SABIA', 540, 1235, 88, { w: 900, scale: a2 });
      txt('QUE IA MORRER', 540, 1360, 118, { w: 900, color: RED, scale: a3 * (1 + 0.06 * pulse(t, s1.mor, 0.05, 0.4)) });
    }
    function scene2(t) {
      header(); const cam = CAM_ALL; drawMap(cam);
      const d = SEGS.tot * sm(t, s2.pau - 0.2, s2.pri + 0.6);
      const head = journey(cam, d);
      ['Jerusalém', 'Antioquia', 'Éfeso', 'Corinto', 'Atenas', 'Malta', 'Roma'].forEach(n => { const idx = PATH.indexOf(n); let dd = 0; for (let i = 0; i < idx; i++) dd += SEGS[i].len; city(cam, n, prog(d, dd - 0.01, dd + 0.5), 22); });
      if (head) { ctx.beginPath(); ctx.arc(head[0], head[1], 14, 0, TAU); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = CREAM; ctx.stroke(); }
      plaque('PAULO', 540, 350, 44, sm(t, s2.pau - 0.2, s2.pau + 0.1));
      stamp('3 NAUFRÁGIOS', 300, 1260, prog(t, s2.tre - 0.05, s2.tre + 0.12), { size: 46, rot: -0.1 });
      stamp('AÇOITES', 640, 1330, prog(t, s2.aco - 0.05, s2.aco + 0.12), { size: 46, rot: 0.06 });
      stamp('PRISÕES', 870, 1240, prog(t, s2.pri - 0.05, s2.pri + 0.12), { size: 46, rot: -0.05 });
    }
    function scene3(t) {
      header(); const cam = camMix(CAM_ALL, CAM_ROMA, sm(t, B[2], B[2] + 1.4)); drawMap(cam); journey(cam, SEGS.tot, 0.6);
      city(cam, 'Roma', 1, 34); city(cam, 'Putéoli', 1, 22);
      const [rx, ry] = toS(cam, P('Roma'));
      const pr = pulse(t, s3.pre, 0.05, 1.5); ctx.beginPath(); ctx.arc(rx, ry, 30 + 60 * outC(prog(t, s3.pre, s3.pre + 1)), 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = `rgba(168,50,42,${0.8 * pr})`; ctx.stroke();
      plaque('ROMA · c. 67 d.C.', 540, 350, 40, sm(t, s3.rom - 0.3, s3.rom + 0.1));
      txt('segundo a tradição', 540, 1360, 32, { w: 700, color: MUTE, a: prog(t, s3.tra - 0.1, s3.tra + 0.3) });
      stamp('PRESO', rx + 150, ry + 150, prog(t, s3.pre - 0.05, s3.pre + 0.12), { size: 80 });
      chainIcon(540, 1250, 1.2, prog(t, s3.aco - 0.1, s3.aco + 0.25));
    }
    function scene4(t) {
      const a = sm(t, B[3], B[3] + 0.6); cell(t, a); header();
      const q = (s, ref, y, k) => { if (k <= 0) return; ctx.save(); ctx.translate(540, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3)); const w = tw(s, 54, 900) + 90; ctx.fillStyle = CREAM; ctx.fillRect(-w / 2, -62, w, 124); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-w / 2, -62, w, 124); txt(s, 0, -10, 54, { w: 900, italic: true }); txt(ref, 0, 38, 26, { w: 700, color: MUTE }); ctx.restore(); ga(1); };
      txt('QUASE TODOS O ABANDONARAM', 540, 360, 44, { w: 900, color: CREAM, stroke: 0, a: prog(t, s4.aba - 0.3, s4.aba) });
      q('"Só Lucas está comigo."', '2 Timóteo 4:11', 540, prog(t, s4.luc - 0.35, s4.luc + 0.1));
      q('"Traze a capa..."', '2 Timóteo 4:13', 720, prog(t, s4.cap - 0.3, s4.cap + 0.1));
    }
    function scene5(t) {
      cell(t, 1 - sm(t, s5.com - 0.6, s5.com)); header();
      const k = sm(t, s5.cel - 0.2, s5.tim + 0.2, outBack);
      if (k > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(k, k); ctx.fillStyle = CREAM; ctx.fillRect(-420, -420, 840, 840); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-420, -420, 840, 840); ctx.strokeRect(-405, -405, 810, 810);
        txt('A TIMÓTEO', 0, -330, 34, { w: 800, color: MUTE });
        const L = [['COMBATI O', 'BOM COMBATE,', s5.com], ['ACABEI A', 'CARREIRA,', s5.car], ['GUARDEI', 'A FÉ.', s5.gua]];
        L.forEach(([a, b, tt], i) => { const kk = sm(t, tt - 0.2, tt + 0.25, outBack); txt(a, 0, -210 + i * 200, 64, { w: 900, scale: kk }); txt(b, 0, -140 + i * 200, 64, { w: 900, color: i === 2 ? RED : INK, scale: kk }); });
        txt('2 Timóteo 4:7', 0, 360, 34, { w: 800, color: MUTE, a: prog(t, s5.fe, s5.fe + 0.4) }); ctx.restore(); }
    }
    function scene6(t) {
      header();
      const a1 = sm(t, s6.nao - 0.2, s6.nao + 0.15, outBack), x = sm(t, s6.ven + 0.05, s6.ven + 0.35), a2 = sm(t, s6.esc - 0.2, s6.esc + 0.15, outBack), a3 = sm(t, s6.des - 0.25, s6.des + 0.1, outBack);
      txt('ELE NÃO ESCREVEU', 540, 470, 52, { w: 800, color: MUTE, scale: a1 });
      txt('"EU VENCI"', 540, 590, 110, { w: 900, scale: sm(t, s6.ven - 0.25, s6.ven, outBack) });
      if (x > 0) line([[230, 600], [lerp(230, 850, x), lerp(600, 570, x)]], 16, RED);
      txt('ESCREVEU', 540, 800, 52, { w: 800, color: MUTE, scale: a2 });
      txt('"EU NÃO', 540, 930, 120, { w: 900, color: RED, scale: a3 }); txt('DESISTI"', 540, 1060, 120, { w: 900, color: RED, scale: a3 });
      const tk = sm(t, s6.tal - 0.2, s6.tal + 0.2); ga(tk);
      txt('Talvez a sua vitória hoje', 540, 1260, 44, { w: 700 }); txt('seja só não largar a fé.', 540, 1320, 44, { w: 700, a: prog(t, s6.lar - 0.3, s6.lar) }); ga(1);
    }
    function scene7(t) {
      header();
      const k = sm(t, s7.qua - 0.3, s7.qua + 0.1, outBack);
      txt('DE QUAL VERSÍCULO', 540, 560, 72, { w: 900, scale: k }); txt('VOCÊ QUER SABER', 540, 660, 72, { w: 900, scale: k }); txt('A HISTÓRIA?', 540, 770, 92, { w: 900, color: RED, scale: sm(t, s7.his - 0.25, s7.his + 0.1, outBack) });
      const ck = sm(t, s7.com - 0.25, s7.com + 0.15, outBack); if (ck > 0) { ctx.save(); ctx.translate(540, 1010); ctx.scale(ck, ck); ctx.fillStyle = CREAM; ctx.fillRect(-300, -70, 600, 140); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-300, -70, 600, 140); ctx.beginPath(); ctx.moveTo(-200, 70); ctx.lineTo(-240, 130); ctx.lineTo(-140, 70); ctx.fillStyle = CREAM; ctx.fill(); ctx.stroke(); txt('COMENTA AQUI', 0, 4, 60, { w: 900 }); ctx.restore(); }
      txt('e segue a @e_cosdafe', 540, 1210, 40, { w: 700, color: MUTE, a: prog(t, s7.com + 0.3, s7.com + 0.8) });
    }

    // ---------------- legendas ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 58, words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 16, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), bw = total + 60, bh = size * 1.6, pop = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15));
      ctx.save(); ctx.translate(540, 1620); ctx.scale(pop, pop); ctx.fillStyle = CREAM; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; if (cur) { ctx.fillStyle = '#e8c56a'; ctx.fillRect(x - 6, -size * 0.6, ws[i] + 12, size * 1.2); } txt(words[i], x + ws[i] / 2, 3, size, { w: 900 }); x += ws[i] + sp; }); ctx.restore(); }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1; ctx.drawImage(tex, 0, 0);
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / 0.14); if (fl > 0) { ctx.globalAlpha = fl * 0.7; ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t); txt('Rota aproximada · prisão em Roma segundo a tradição', 540, 1790, 24, { w: 600, color: MUTE }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
