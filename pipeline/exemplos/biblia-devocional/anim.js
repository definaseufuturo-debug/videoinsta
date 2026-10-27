/*
 * DEVOCIONAL DA MANHÃ (perfil cristão): "Renovam-se cada manhã" (Lamentações 3:22-23). 9:16.
 * Céu de amanhecer, pergaminho com o versículo palavra a palavra, cidade em ruínas, sol rompendo, calendário ontem/hoje, CTA "amém".
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
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const mix = (c1, c2, k) => { const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const a = p(c1), b = p(c2); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`; };

  const INK = '#3b2a1a', MUTE = '#7a6248', GOLD = '#e8b54a', PAPER = '#f4ead2', CREAM = '#fff6e3';

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 6;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.it ? 'italic ' : ''}${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 4; } ctx.fillStyle = o.color || INK; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.3, w = o.w || 700; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || INK, a: o.a ?? 1 }); cx += ws[i] + sp; }); }
    function chip(s, x, y, size, k, o = {}) { if (k <= 0) return; const w = tw(s, size, 800) + size * 1.4, h = size * 1.9, sc = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || 'rgba(255,246,227,0.92)'; ctx.fill(); txt(s, 0, 2, size, { w: 800, color: o.color || INK }); ctx.restore(); ga(1); }

    // ---------------- céu do amanhecer ----------------
    const SKY = [['#0d1330', '#1d2550', '#3a3a6a'], ['#24315f', '#8a5a7a', '#f0a868'], ['#5d86b8', '#f2b679', '#ffe2a8']];
    const stars = Array.from({ length: 120 }, (_, i) => [((i * 7919) % 1000) / 1000 * W, ((i * 104729) % 997) / 997 * H * 0.6, 1 + (i % 3)]);
    function sky(dawn) { const k1 = clamp(dawn * 2), k2 = clamp(dawn * 2 - 1); const col = j => (dawn < 0.5 ? mix(SKY[0][j], SKY[1][j], k1) : mix(SKY[1][j], SKY[2][j], k2));
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, col(0)); g.addColorStop(0.55, col(1)); g.addColorStop(1, col(2)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const sa = 1 - clamp(dawn * 1.6); if (sa > 0) for (const [x, y, r] of stars) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = `rgba(255,255,240,${0.7 * sa})`; ctx.fill(); } }
    function sun(dawn, t, rays = 0) { const y = lerp(1500, 1050, outC(dawn)), x = 540; const gl = ctx.createRadialGradient(x, y, 20, x, y, 520); gl.addColorStop(0, 'rgba(255,225,150,0.75)'); gl.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
      if (rays > 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.05); for (let i = 0; i < 16; i++) { ctx.rotate(TAU / 16); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -70); ctx.lineTo(1400, 70); ctx.closePath(); ctx.fillStyle = `rgba(255,236,180,${0.13 * rays})`; ctx.fill(); } ctx.restore(); }
      ctx.beginPath(); ctx.arc(x, y, 110, 0, TAU); ctx.fillStyle = '#ffe9a8'; ctx.fill(); return y; }
    function hills(dark = 0) { const layers = [[1460, '#4a3f5e', '#2a2438', 0.004, 60], [1560, '#3a3048', '#1d1828', 0.006, 45], [1660, '#2b2336', '#141019', 0.009, 35]];
      for (const [y0, c1, c2, f, a] of layers) { ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, y0 + Math.sin(x * f + y0) * a + Math.sin(x * f * 2.7) * a * 0.3); ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = mix(c1, c2, dark); ctx.fill(); } }
    // cidade em ruínas (silhueta genérica de muralhas e torres quebradas)
    function ruins(k, light) { if (k <= 0) return; ctx.save(); ga(k); const base = 1500; ctx.fillStyle = mix('#3a2f3a', '#7a5a48', light);
      const blocks = [[60, 120, 140], [190, 90, 220], [290, 140, 120], [440, 70, 260], [520, 160, 160], [690, 110, 230], [810, 130, 110], [950, 90, 190]];
      for (const [x, w, h] of blocks) { ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, base - h); for (let i = 0; i <= 6; i++) ctx.lineTo(x + (w * i) / 6, base - h + (i % 2 ? 18 : 0) + ((x * i) % 37)); ctx.lineTo(x + w, base); ctx.closePath(); ctx.fill(); }
      ctx.fillRect(0, base - 40, W, 200); // muralha baixa
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 14; i++) ctx.fillRect(40 + i * 75, base - 30 + (i % 3) * 8, 34, 16); // pedras caídas
      ga(1); ctx.restore(); }
    function dove(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const f = Math.sin(t * 7) * 0.5; ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.ellipse(0, 0, 34, 14, -0.1, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(30, -8, 10, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(38, -8); ctx.lineTo(50, -4); ctx.lineTo(38, -2); ctx.fillStyle = '#e8b54a'; ctx.fill(); ctx.fillStyle = '#fffaf0';
      ctx.beginPath(); ctx.moveTo(-6, -4); ctx.quadraticCurveTo(-10, -60 * (0.6 + f), -46, -50 * (0.6 + f)); ctx.quadraticCurveTo(-26, -14, -6, -4); ctx.fill(); ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-58, -10); ctx.lineTo(-56, 10); ctx.closePath(); ctx.fill(); ctx.restore(); }
    // pergaminho com o versículo
    const VERSE = ['As misericórdias do Senhor', 'não têm fim.', 'Renovam-se cada manhã.', 'Grande é a tua fidelidade.'];
    function scroll(cx, cy, k, t, hl) { if (k <= 0) return; const w = 900, h = 640 * outC(k); ctx.save(); ctx.translate(cx, cy); ga(clamp(k * 2));
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 40; ctx.fillStyle = PAPER; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0;
      for (const sy of [-1, 1]) { ctx.fillStyle = '#d8c39a'; ctx.beginPath(); ctx.roundRect(-w / 2 - 20, sy * h / 2 - 22, w + 40, 44, 22); ctx.fill(); ctx.strokeStyle = '#a8895c'; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.beginPath(); ctx.rect(-w / 2, -h / 2 + 22, w, h - 44); ctx.clip();
      txt('LAMENTAÇÕES 3:22-23', 0, -230, 30, { w: 800, color: '#a0703a' });
      VERSE.forEach((line, i) => { const a = hl.lines[i]; if (a <= 0) return; const y = -140 + i * 105, sz = i === 3 ? 56 : 52; txt(line, 0, y + (1 - outC(a)) * 20, sz, { w: i === 2 || i === 3 ? 900 : 800, color: i === 2 ? '#b0651e' : INK, a }); });
      ga(1); ctx.restore(); }

    // ---------------- tempos ----------------
    const c1 = clip('c1'), c2 = clip('c2'), c3 = clip('c3'), c4 = clip('c4'), c5 = clip('c5'), c6 = clip('c6');
    const s1 = { aco: wt('c1', 'acordou'), can: wt('c1', 'cansado'), esp: wt('c1', 'esperanca'), ouv: wt('c1', 'ouve') };
    const s2 = { mis: wt('c2', 'misericordias'), fim: wt('c2', 'fim'), ren: wt('c2', 'renovam'), man: wt('c2', 'manha'), gra: wt('c2', 'grande'), fid: wt('c2', 'fidelidade') };
    const s3 = { esc: wt('c3', 'escreveu'), jer: wt('c3', 'jerusalem'), rui: wt('c3', 'ruinas'), per: wt('c3', 'perdido') };
    const s4 = { mes: wt('c4', 'mesmo'), pio: wt('c4', 'pior'), lem: wt('c4', 'lembrou'), deu: wt('c4', 'deus'), nov: wt('c4', 'novo'), hoj: wt('c4', 'hoje') };
    const s5 = { ont: wt('c5', 'ontem'), hoj: wt('c5', 'hoje', 0), che: wt('c5', 'chegou'), nov: wt('c5', 'nova') };
    const s6 = { pal: wt('c6', 'palavra'), ame: wt('c6', 'amem'), seg: wt('c6', 'segue'), man: wt('c6', 'manha') };
    cue(0, 'music', { part: 'intro' }); cue(s1.ouv, 'riser', { dur: 0.6 }); cue(B[1], 'music', { part: 'safe' });
    cue(s2.mis - 0.1, 'reveal'); cue(s2.ren, 'sparkle'); cue(s2.fid, 'bell');
    cue(s3.rui, 'impact', { gain: 0.5 }); cue(s4.lem, 'reveal'); cue(s4.hoj, 'sparkle');
    cue(s5.ont, 'card'); cue(s5.che, 'whoosh', { dur: 0.4 }); cue(s5.nov, 'ding'); cue(B[5], 'music', { part: 'outro' });
    cue(s6.ame, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.35 });

    // ---------------- cenas ----------------
    function header(a = 1, col = CREAM) { spaced('PALAVRA DA MANHÃ', 540, 150, 40, { sp: 10, color: col, a }); ctx.fillStyle = col; ga(0.6 * a); ctx.fillRect(390, 190, 300, 3); ga(1); }
    function scene1(t) {
      const dawn = 0.08 * prog(t, 0, B[1]); sky(dawn); sun(0, t); hills(0.6); header(prog(t, 0.2, 0.8));
      const k1 = sm(t, s1.aco - 0.25, s1.aco + 0.1, outBack), k2 = sm(t, s1.esp - 0.25, s1.esp + 0.1, outBack);
      txt('ACORDOU', 540, 640, 120, { w: 900, color: CREAM, scale: k1, shadow: true });
      txt('CANSADO?', 540, 780, 120, { w: 900, color: '#f0a868', scale: sm(t, s1.can - 0.25, s1.can + 0.1, outBack), shadow: true });
      txt('sem esperança pra hoje', 540, 900, 46, { w: 700, it: true, color: CREAM, a: k2 });
      chip('ENTÃO OUVE ISSO', 540, 1080, 40, prog(t, s1.ouv - 0.2, s1.ouv + 0.1));
    }
    function scene2(t) {
      const dawn = lerp(0.1, 0.75, sm(t, B[1], c2.end)); sky(dawn); sun(dawn, t, prog(t, s2.ren - 0.3, s2.man + 0.4)); hills(0.3); header();
      const lines = [prog(t, s2.mis - 0.3, s2.mis + 0.3), prog(t, s2.fim - 0.4, s2.fim + 0.1), prog(t, s2.ren - 0.2, s2.ren + 0.3), prog(t, s2.gra - 0.2, s2.gra + 0.3)];
      scroll(540, 820, prog(t, B[1], B[1] + 0.6), t, { lines });
      if (t > s2.fid - 0.1) { const k = pulse(t, s2.fid, 0.1, 0.8); ctx.save(); ga(0.5 * k); ctx.fillStyle = '#fff3c4'; ctx.fillRect(0, 0, W, H); ctx.restore(); ga(1); }
    }
    function scene3(t) {
      const dawn = 0.25; sky(dawn); ctx.save(); ga(0.6); sun(0.15, t); ctx.restore(); ga(1); hills(0.7); ruins(prog(t, s3.jer - 0.4, s3.jer + 0.2), 0); header();
      ctx.save(); ga(0.35 * prog(t, B[2], B[2] + 0.5)); ctx.fillStyle = '#1a1420'; ctx.fillRect(0, 0, W, H); ctx.restore(); ga(1);
      txt('QUEM ESCREVEU ISSO', 540, 520, 56, { w: 900, color: CREAM, a: prog(t, s3.esc - 0.3, s3.esc), shadow: true });
      txt('JERUSALÉM', 540, 700, 110, { w: 900, color: CREAM, scale: sm(t, s3.jer - 0.2, s3.jer + 0.15, outBack), shadow: true });
      txt('EM RUÍNAS', 540, 830, 96, { w: 900, color: '#e07a5f', scale: sm(t, s3.rui - 0.2, s3.rui + 0.15, outBack), shadow: true });
      chip('c. 586 a.C.  •  ATRIBUÍDO A JEREMIAS', 540, 960, 30, prog(t, s3.rui + 0.2, s3.rui + 0.5));
      txt('tinha perdido quase tudo', 540, 1080, 44, { w: 700, it: true, color: CREAM, a: prog(t, s3.per - 0.2, s3.per + 0.2) });
    }
    function scene4(t) {
      const br = sm(t, s4.lem - 0.4, s4.deu + 0.3); sky(lerp(0.25, 0.9, br)); const sy = sun(lerp(0.15, 1, br), t, br); hills(lerp(0.7, 0.2, br)); ruins(1, br); header();
      ctx.save(); ga(0.35 * (1 - br)); ctx.fillStyle = '#1a1420'; ctx.fillRect(0, 0, W, H); ctx.restore(); ga(1);
      if (br > 0.3) dove(lerp(-80, 900, prog(t, s4.lem, c4.end + 0.3)), lerp(1260, 1080, prog(t, s4.lem, c4.end + 0.3)), 1.4, t);
      txt('NO PIOR DIA', 540, 520, 76, { w: 900, color: CREAM, a: prog(t, s4.pio - 0.3, s4.pio + 0.1) * (1 - prog(t, s4.lem - 0.1, s4.lem + 0.2)), shadow: true });
      const k = sm(t, s4.deu - 0.3, s4.deu + 0.1, outBack); txt('DEUS COMEÇA', 540, 640, 92, { w: 900, color: INK, scale: k }); txt('DE NOVO', 540, 750, 92, { w: 900, color: '#b0651e', scale: sm(t, s4.nov - 0.3, s4.nov + 0.1, outBack) });
      chip('COMIGO. HOJE.', 540, 870, 40, prog(t, s4.hoj - 0.2, s4.hoj + 0.1), { fill: 'rgba(59,42,26,0.85)', color: CREAM });
    }
    function scene5(t) {
      sky(0.95); sun(1, t, 0.6); hills(0.1); header(1, INK);
      // calendário: ONTEM vira, aparece HOJE
      const flip = sm(t, s5.hoj - 0.2, s5.hoj + 0.35), cx = 540, cy = 820, w = 520, h = 560;
      const card = (lab, sub, col, sc) => { ctx.save(); ctx.translate(cx, cy); ctx.scale(1, sc); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 30; ctx.fillStyle = '#fffaf0'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0; ctx.fillStyle = col; ctx.fillRect(-w / 2, -h / 2, w, 130); txt(lab, 0, -h / 2 + 68, 64, { w: 900, color: '#fff' }); txt(sub, 0, 60, 54, { w: 900, color: INK }); ctx.restore(); };
      if (flip < 0.5) card('ONTEM', 'misericórdia de ontem', '#8a7a6a', 1 - flip * 2); else card('HOJE', '', '#c0652a', (flip - 0.5) * 2);
      if (flip >= 1) { const k = sm(t, s5.nov - 0.3, s5.nov + 0.1, outBack); txt('NOVA', cx, cy + 20, 150, { w: 900, color: '#b0651e', scale: k }); txt('MISERICÓRDIA', cx, cy + 140, 54, { w: 900, color: INK, a: prog(t, s5.nov, s5.nov + 0.3) }); }
      txt('não precisa durar até hoje', 540, 1180, 42, { w: 700, it: true, color: INK, a: prog(t, s5.ont + 0.4, s5.ont + 0.8) * (1 - prog(t, s5.che - 0.2, s5.che + 0.1)) });
      txt('chegou uma nova', 540, 1180, 46, { w: 800, color: INK, a: prog(t, s5.che - 0.1, s5.che + 0.2) });
    }
    function scene6(t) {
      sky(1); sun(1, t, 0.8); hills(0); header(1, INK);
      txt('Se essa palavra', 540, 520, 58, { w: 800, color: INK, a: prog(t, B[5], B[5] + 0.4) }); txt('é pra você,', 540, 590, 58, { w: 800, color: INK, a: prog(t, s6.pal - 0.2, s6.pal + 0.2) });
      const ak = sm(t, s6.ame - 0.3, s6.ame + 0.1, outBack); if (ak > 0) { ctx.save(); ctx.translate(540, 780); ctx.scale(ak, ak); ctx.beginPath(); ctx.roundRect(-330, -100, 660, 200, 40); ctx.fillStyle = '#fffaf0'; ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0; txt('COMENTA', 0, -38, 48, { w: 800, color: MUTE }); txt('AMÉM', 0, 34, 96, { w: 900, color: '#b0651e' }); ctx.restore(); }
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1010); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); ctx.beginPath(); ctx.roundRect(-230, -52, 460, 104, 52); ctx.fillStyle = press ? '#fffaf0' : '#c0652a'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = press ? '#c0652a' : '#c0652a'; ctx.stroke(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3, 50, { w: 900, color: press ? '#c0652a' : '#fff' }); ctx.restore(); }
      txt('uma palavra toda manhã', 540, 1130, 42, { w: 700, it: true, color: INK, a: prog(t, s6.man - 0.3, s6.man + 0.1) });
    }

    // ---------------- legendas ----------------
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 3 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 20)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { if (t >= B[1] && t < B[2]) return; // o pergaminho já mostra o versículo
      const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 58, words = g.map(w => w.text.replace(/[.,!?:]$/, '')), ws = words.map(s => tw(s, size, 900)), sp = 16, total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), bw = total + 64, bh = size * 1.6, pop = 0.9 + 0.1 * outBack(prog(t, g.t0, g.t0 + 0.15));
      ctx.save(); ctx.translate(540, 1640); ctx.scale(pop, pop); ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 22); ctx.fillStyle = 'rgba(255,250,240,0.95)'; ctx.fill();
      let x = -total / 2; g.forEach((w, i) => { const cur = t >= w.start - 0.02 && t < w.end + 0.02; if (cur) { ctx.fillStyle = GOLD; ctx.beginPath(); ctx.roundRect(x - 6, -size * 0.6, ws[i] + 12, size * 1.2, 10); ctx.fill(); } txt(words[i], x + ws[i] / 2, 3, size, { w: 900 }); x += ws[i] + sp; }); ctx.restore(); }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1;
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      // transição suave (clarão)
      for (let k = 1; k < NS; k++) { const d = Math.abs(t - B[k]); if (d < 0.25) { ga(0.5 * (1 - d / 0.25)); ctx.fillStyle = '#fff6e3'; ctx.fillRect(0, 0, W, H); ga(1); } }
      captions(t); txt('@e_cosdafe', 540, 1800, 26, { w: 700, color: i >= 4 ? MUTE : 'rgba(255,246,227,0.7)' }); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
