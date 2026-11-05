/*
 * ORE COMIGO — oração guiada da manhã (piloto de formato para a Palavra da Manhã). 9:16.
 * Céu que amanhece devagar, vela que acende no "ore comigo", anel de progresso em volta da chama,
 * a oração aparece frase a frase acompanhando a voz. Final: AMÉM + "manda pra quem precisa".
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
  const outBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const mixC = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), Bc = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, Bc[i], k))).join(',')})`; };
  function mulberry(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  const WH = '#fff8ec', GOLD = '#f2c15c', MUTE = 'rgba(255,248,236,0.55)';

  function create(TL, env) {
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration;
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.italic ? 'italic ' : ''}${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 30; } ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.3, w = o.w || 700; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WH, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    const c1 = clip('c1'), c2 = clip('c2'), c5 = clip('c5'), c6 = clip('c6');
    const s1 = { par: wt('c1', 'para'), tri: wt('c1', 'trinta'), seg: wt('c1', 'segundos'), ore: wt('c1', 'ore'), com: wt('c1', 'comigo') };
    const s4 = { paz: wt('c4', 'paz') };
    const s5 = { jes: wt('c5', 'jesus') };
    const s6 = { ore: wt('c6', 'orou'), ame: wt('c6', 'amem'), man: wt('c6', 'manda'), pre: wt('c6', 'precisa'), hoj: wt('c6', 'hoje') };
    const LIT = s1.ore - 0.1, P0 = c2.start - 0.2, P1 = c5.end + 0.2, CTA = c6.start - 0.5;
    cue(0, 'music', { part: 'intro' }); cue(LIT, 'sparkle', { gain: 0.6 }); cue(s5.jes + 0.3, 'bell', { gain: 0.45 }); cue(s6.ame, 'sparkle', { gain: 0.5 }); cue(s6.man, 'notif', { gain: 0.5 });

    // partículas de luz
    const R = mulberry(11), DUST = Array.from({ length: 70 }, () => ({ x: R() * W, y: R() * H, r: 1.5 + R() * 3.5, v: 12 + R() * 30, ph: R() * TAU }));

    function sky(t) {
      const u = sm(t, 0, END * 0.95); scr();
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, mixC('#070a16', '#1d2a4a', u)); g.addColorStop(0.55, mixC('#0d1226', '#5a4a6a', u)); g.addColorStop(0.8, mixC('#141327', '#d9895a', u)); g.addColorStop(1, mixC('#1a1424', '#f2b36b', u));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // sol nascendo atrás do horizonte
      const sy = lerp(2150, 1720, u); const sg = ctx.createRadialGradient(540, sy, 0, 540, sy, 900); sg.addColorStop(0, `rgba(255,210,140,${0.55 * u})`); sg.addColorStop(1, 'rgba(255,210,140,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      // estrelas que somem
      ga(0.8 * (1 - u)); const RS = mulberry(3); for (let i = 0; i < 90; i++) { const x = RS() * W, y = RS() * H * 0.55, tw2 = 0.5 + 0.5 * Math.sin(t * 2 + i); ctx.fillStyle = `rgba(255,255,255,${0.6 * tw2})`; ctx.fillRect(x, y, 2.5, 2.5); } ga(1);
      // colinas
      ctx.fillStyle = mixC('#05060c', '#2a1e2c', u); ctx.beginPath(); ctx.moveTo(0, 1560); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 1540 + Math.sin(x * 0.006) * 40 + Math.sin(x * 0.017) * 14); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = mixC('#030308', '#1a121c', u); ctx.beginPath(); ctx.moveTo(0, 1640); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 1630 + Math.sin(x * 0.004 + 1) * 50); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    }
    function candle(t) {
      const cx = 540, cy = 1250, lit = sm(t, LIT, LIT + 0.6), fl = Math.sin(t * 8) * 4 + Math.sin(t * 21) * 2;
      if (lit > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = 520 * (0.9 + 0.1 * Math.sin(t * 5)); const hg = ctx.createRadialGradient(cx, cy - 110, 0, cx, cy - 110, r); hg.addColorStop(0, `rgba(255,180,80,${0.5 * lit})`); hg.addColorStop(0.4, `rgba(255,150,60,${0.18 * lit})`); hg.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = hg; ctx.fillRect(cx - r, cy - 110 - r, 2 * r, 2 * r); ctx.restore(); }
      // vela
      const cg = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0); cg.addColorStop(0, '#d8cdb8'); cg.addColorStop(0.45, '#fbf5e8'); cg.addColorStop(1, '#bfb39c'); ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(cx - 50, cy - 70, 100, 230, 10); ctx.fill();
      ctx.fillStyle = 'rgba(255,200,120,0.35)'; ctx.beginPath(); ctx.ellipse(cx, cy - 70, 50, 12, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3a2a1a'; ctx.fillRect(cx - 3, cy - 98, 6, 30);
      ctx.fillStyle = '#2a2018'; ctx.beginPath(); ctx.ellipse(cx, cy + 165, 120, 26, 0, 0, TAU); ctx.fill(); ctx.fillRect(cx - 120, cy + 150, 240, 16);
      if (lit > 0) { ctx.save(); ctx.translate(cx, cy - 100); ctx.scale(lit, lit); ctx.beginPath(); ctx.moveTo(0, -95 + fl); ctx.bezierCurveTo(34, -40, 30, 10, 0, 14); ctx.bezierCurveTo(-30, 10, -34, -40, 0, -95 + fl); ctx.fillStyle = '#ffb347'; ctx.fill(); ctx.beginPath(); ctx.moveTo(0, -60 + fl * 0.6); ctx.bezierCurveTo(16, -30, 14, 4, 0, 8); ctx.bezierCurveTo(-14, 4, -16, -30, 0, -60 + fl * 0.6); ctx.fillStyle = '#fff2c2'; ctx.fill(); ctx.restore(); }
      // anel de progresso da oração
      const pk = prog(t, P0, P1), ra = sm(t, P0 - 0.6, P0) * (1 - sm(t, CTA, CTA + 0.6));
      if (ra > 0) { ga(ra); ctx.beginPath(); ctx.arc(cx, cy - 60, 250, 0, TAU); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,248,236,0.15)'; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy - 60, 250, -Math.PI / 2, -Math.PI / 2 + TAU * pk); ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.strokeStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; ctx.stroke(); ctx.shadowBlur = 0; ga(1); }
    }
    function dust(t, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const d of DUST) { const y = ((d.y - t * d.v) % H + H) % H, x = d.x + Math.sin(t * 0.6 + d.ph) * 18; ctx.fillStyle = `rgba(255,214,150,${0.35 * a * (0.5 + 0.5 * Math.sin(t * 1.5 + d.ph))})`; ctx.beginPath(); ctx.arc(x, y, d.r, 0, TAU); ctx.fill(); } ctx.restore(); }

    // ------ texto da oração: frases quebradas em linhas, palavra acende quando é falada ------
    const PH = []; { let cur = []; const flush = () => { if (cur.length) PH.push(cur); cur = []; };
      for (const w of TL.words) { if (w.clip === 'c1' || w.clip === 'c6') continue; if (cur.length && cur[0].clip !== w.clip) flush(); cur.push(w); if (/[.,]$/.test(w.text) && cur.length >= 4) flush(); } flush();
      PH.forEach((p, i) => { p.t0 = p[0].start - 0.35; const nx = PH[i + 1]; p.t1 = nx ? nx[0].start - 0.45 : CTA - 0.3; }); }
    function layout(words, size, maxW) { const lines = []; let cur = [], cw = 0; const sp = size * 0.28; for (const w of words) { const ww = tw(w.text, size, 700); if (cur.length && cw + sp + ww > maxW) { lines.push(cur); cur = []; cw = 0; } cur.push(Object.assign({}, w, { ww })); cw += (cur.length > 1 ? sp : 0) + ww; } if (cur.length) lines.push(cur); return lines; }
    function prayer(t) {
      for (const p of PH) { if (t < p.t0 || t > p.t1 + 0.35) continue; prayerOne(t, p); }
    }
    function prayerOne(t, p) {
      const a = sm(t, p.t0, p.t0 + 0.4) * (1 - sm(t, p.t1, p.t1 + 0.35)), size = 66, lines = layout(p, size, 900), lh = size * 1.32, y0 = 640 - (lines.length - 1) * lh / 2, sp = size * 0.28;
      lines.forEach((ln, li) => { const tot = ln.reduce((s, w) => s + w.ww, 0) + sp * (ln.length - 1); let x = 540 - tot / 2;
        ln.forEach(w => { const k = sm(t, w.start - 0.12, w.start + 0.25); txt(w.text, x + w.ww / 2, y0 + li * lh + (1 - k) * 8, size, { w: 700, color: WH, a: a * (0.28 + 0.72 * k), glow: k > 0.5 ? 'rgba(255,200,120,0.5)' : null, blur: 18 }); x += w.ww + sp; }); });
    }

    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1;
      sky(t); dust(t, sm(t, LIT, LIT + 1.5)); candle(t);
      // topo fixo
      const ha = sm(t, 0.2, 0.8) * (1 - sm(t, CTA, CTA + 0.5)); spaced('ORE COMIGO', 540, 170, 40, { sp: 14, w: 800, color: GOLD, a: ha }); txt('a oração da manhã', 540, 225, 28, { w: 600, color: MUTE, a: ha });
      // gancho
      const g1 = 1 - sm(t, c1.end + 0.1, c1.end + 0.6);
      if (g1 > 0) { ga(g1);
        txt('PARA TUDO', 540, 560, 96, { w: 900, scale: sm(t, s1.par - 0.25, s1.par + 0.1, outBack) });
        txt('POR 30 SEGUNDOS', 540, 680, 66, { w: 800, color: MUTE, scale: sm(t, s1.tri - 0.25, s1.seg, outBack) });
        txt('ORE COMIGO', 540, 840, 104, { w: 900, color: GOLD, glow: 'rgba(242,193,92,0.6)', scale: sm(t, s1.ore - 0.25, s1.com + 0.1, outBack) }); ga(1); }
      prayer(t);
      txt('Filipenses 4:6-7', 540, 1580, 30, { w: 700, color: MUTE, a: sm(t, s4.paz, s4.paz + 0.6) * (1 - sm(t, CTA, CTA + 0.5)) });
      // final: AMÉM
      const ck = sm(t, CTA, CTA + 0.6);
      if (ck > 0) { ga(ck);
        txt('SE VOCÊ OROU COMIGO,', 540, 470, 50, { w: 800, color: WH, a: prog(t, s6.ore - 0.4, s6.ore) });
        const ak = sm(t, s6.ame - 0.3, s6.ame + 0.2, outBack), gl = 0.6 + 0.4 * Math.sin(t * 3);
        txt('COMENTA', 540, 580, 56, { w: 800, color: MUTE, scale: ak });
        txt('AMÉM', 540, 730, 190, { w: 900, color: GOLD, glow: `rgba(242,193,92,${gl})`, blur: 50, scale: ak * (1 + 0.04 * pulse(t, s6.ame, 0.05, 0.6)) });
        const mk = sm(t, s6.man - 0.3, s6.man + 0.1, outBack);
        if (mk > 0) { ctx.save(); ctx.translate(540, 1620); ctx.scale(mk, mk); ctx.fillStyle = 'rgba(255,248,236,0.12)'; ctx.beginPath(); ctx.roundRect(-400, -70, 800, 140, 70); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,248,236,0.5)'; ctx.stroke();
          ctx.save(); ctx.translate(-320, 0); ctx.rotate(-0.35); ctx.beginPath(); ctx.moveTo(-34, 4); ctx.lineTo(38, -26); ctx.lineTo(10, 34); ctx.lineTo(2, 10); ctx.closePath(); ctx.fillStyle = GOLD; ctx.fill(); ctx.restore();
          txt('manda pra quem precisa', 40, -18, 40, { w: 700 }); txt('dessa oração hoje', 40, 28, 40, { w: 700, color: GOLD, a: prog(t, s6.pre - 0.2, s6.pre + 0.2) }); ctx.restore(); }
        ga(1); }
      txt('@e_cosdafe', 540, 1830, 28, { w: 700, color: MUTE });
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
