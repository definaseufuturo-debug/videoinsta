/*
 * DEVOCIONAL — estilo TEXTO CINÉTICO (padrão do devocional das 07:00 do @e_cosdafe desde 29/10/2026).
 * Cor chapada por cena, palavras GIGANTES entrando no instante exato em que são faladas, linhas alternando
 * claro/escuro, palavras-chave em destaque, referência bíblica no rodapé do versículo e CTA "comenta amém".
 * Para reaproveitar: troque só o bloco CONFIG (palavras de destaque, referência e paleta). 9:16 (1080x1920).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // ====================== CONFIG (edite por vídeo) ======================
  const CONFIG = {
    accent: ['ansiosos', 'deus', 'oracao', 'gracas', 'preso', 'acorrentado', 'tudo', 'entrega', 'amem', 'pesando', 'preocupacao'],
    refs: { c2: 'FILIPENSES 4:6' },           // referência mostrada no rodapé da cena do versículo
    verseClip: 'c2',                          // cena do versículo (fonte serifada de destaque? não: mantém o bloco, muda a cor)
    ctaClip: 'c6',
    // [fundo, texto A, texto B, destaque] — uma por cena, em ordem
    palettes: [
      ['#e63946', '#fff1d6', '#14141e', '#ffd166'],
      ['#14213d', '#fff1d6', '#9fb3d9', '#fca311'],
      ['#fff1d6', '#14141e', '#e63946', '#e63946'],
      ['#2a9d8f', '#fff1d6', '#0b2b27', '#ffd166'],
      ['#f4a261', '#14141e', '#fff1d6', '#14213d'],
      ['#e63946', '#fff1d6', '#14141e', '#ffd166'],
    ],
    label: 'PALAVRA DA MANHÃ',
  };
  // ======================================================================
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const inC = t => Math.pow(clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const pulse = (t, t0, rise = 0.04, decay = 0.25) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  function mulberry(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const END = TL.duration;
    const clips = TL.clips;
    const ACC = new Set(CONFIG.accent);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const M = mk(10, 10).getContext('2d');
    const measure = (s, size) => { M.font = `900 ${size}px Inter`; return M.measureText(s).width; };

    // ------------------------------------------------ texturas
    const R0 = mulberry(4);
    const grain = (() => { const cv = mk(540, 960), g = cv.getContext('2d'); for (let i = 0; i < 16000; i++) { g.fillStyle = R0() < 0.5 ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.10)'; g.fillRect(R0() * 540, R0() * 960, 1.3, 1.3); } return cv; })();
    const vig = (() => { const cv = mk(W, H), g = cv.getContext('2d'), gr = g.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.5, H * 0.8); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return cv; })();

    // ------------------------------------------------ layout: cada cena vira páginas de linhas gigantes
    const X0 = 80, MAXW = W - 160, TOP = 330, BOTTOM = 1560;
    const scenes = clips.map((c, ci) => {
      const words = TL.words.filter(w => w.clip === c.id);
      const isCta = c.id === CONFIG.ctaClip;
      // escolhe o maior tamanho em que cada página tem até 5 linhas e nenhuma palavra estoura a largura
      let best = null;
      for (let size = 210; size >= 92; size -= 6) {
        const lh = size * 0.98, maxLines = Math.max(3, Math.floor((BOTTOM - TOP - (isCta ? 260 : 0)) / lh));
        const pages = []; let page = [], line = [], lw = 0;
        const pushLine = () => { if (line.length) page.push(line); line = []; lw = 0; };
        for (const w of words) {
          const s = w.text.toUpperCase(), raw = measure(s, size), fit = Math.min(1, MAXW / raw), ww = raw * fit, sp = measure(' ', size);
          if (line.length && lw + sp + ww > MAXW) { pushLine(); if (page.length >= maxLines) { pages.push(page); page = []; } }
          line.push({ w, s, x: line.length ? lw + sp : 0, ww, fit }); lw = (line.length > 1 ? lw + sp : 0) + ww;
          if (/[.?!;]$/.test(w.text) && words.indexOf(w) < words.length - 1 && page.length + 1 >= maxLines - 1) { pushLine(); pages.push(page); page = []; }
        }
        pushLine(); if (page.length) pages.push(page);
        const totalLines = pages.reduce((a, p) => a + p.length, 0);
        if (pages.length <= Math.max(1, Math.ceil(words.length / 5)) || size <= 92) { best = { size, lh, pages, totalLines }; break; }
      }
      best.pages.forEach(p => { p.t0 = p[0][0].w.start - 0.06; });
      return Object.assign(best, { c, ci, isCta, pal: CONFIG.palettes[ci % CONFIG.palettes.length], t0: ci ? c.start - 0.3 : 0, t1: ci < clips.length - 1 ? clips[ci + 1].start - 0.3 : END });
    });

    // ------------------------------------------------ áudio
    cue(0, 'music', { part: 'intro' }); cue(0.15, 'whoosh', { dur: 0.4 });
    scenes.forEach((sc, i) => {
      if (i) { cue(sc.t0 - 0.05, 'whoosh', { dur: 0.3, gain: 0.7 }); }
      if (sc.c.id === CONFIG.verseClip) { cue(sc.t0, 'music', { part: 'safe' }); cue(sc.c.start, 'impact', { gain: 0.5 }); }
      if (i === 2) cue(sc.t0, 'music', { part: 'groove' });
      if (sc.isCta) cue(sc.t0, 'music', { part: 'outro' });
      sc.pages.forEach((p, k) => { if (k) cue(p.t0 - 0.05, 'swoosh', { gain: 0.5 }); for (const ln of p) for (const it of ln) if (ACC.has(it.w.norm)) cue(it.w.start, 'pop'); });
    });
    const cta = scenes.find(s => s.isCta);
    const segue = cta ? (TL.words.find(w => w.clip === cta.c.id && w.norm.startsWith('segue')) || {}).start : null;
    if (segue) { cue(segue + 0.25, 'tap'); cue(segue + 0.3, 'success'); }

    // ------------------------------------------------ desenho
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function text(s, x, y, size, col, o = {}) { ctx.save(); ctx.translate(x, y); if (o.sc) ctx.scale(o.sc, o.sc); ctx.globalAlpha *= o.a ?? 1; ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); }

    function drawScene(sc, t) {
      const [BG, A, Bc, ACCOL] = sc.pal;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      // rótulo do formato
      text(CONFIG.label, X0, 200, 34, sc.ci % 2 ? A : Bc, { w: 800, a: 0.75 });
      ctx.fillStyle = sc.ci % 2 ? A : Bc; ctx.globalAlpha = 0.75; ctx.fillRect(X0, 222, 120, 6); ctx.globalAlpha = 1;
      // página atual
      let pi = 0; sc.pages.forEach((p, k) => { if (t >= p.t0) pi = k; });
      const page = sc.pages[pi];
      const nxt = sc.pages[pi + 1], out = nxt ? prog(t, nxt.t0 - 0.16, nxt.t0) : 0;
      const blockH = page.length * sc.lh, y0 = TOP + Math.max(0, (BOTTOM - TOP - (sc.isCta ? 260 : 0) - blockH) / 2) + sc.size * 0.8;
      ctx.save(); ctx.translate(0, -inC(out) * 300); ctx.globalAlpha = 1 - out;
      page.forEach((ln, li) => {
        const col = li % 2 ? Bc : A, y = y0 + li * sc.lh;
        for (const it of ln) {
          const k = prog(t, it.w.start - 0.05, it.w.start + 0.11); if (k <= 0) continue;
          const acc = ACC.has(it.w.norm), sc2 = lerp(1.45, 1, outBack(k));
          const x = X0 + it.x;
          ctx.save(); ctx.translate(x + it.ww / 2, y - sc.size * 0.35); ctx.scale(sc2, sc2); ctx.translate(-(x + it.ww / 2), -(y - sc.size * 0.35));
          if (acc) { const kk = outC(prog(t, it.w.start, it.w.start + 0.25)); ctx.fillStyle = ACCOL; ctx.fillRect(x - 6, y + sc.size * 0.06, (it.ww + 12) * kk, sc.size * 0.11); }
          text(it.s, x, y, sc.size * it.fit, acc ? ACCOL : col, { a: clamp(k * 2.5) });
          ctx.restore();
        }
      });
      ctx.restore();
      // referência bíblica
      const ref = CONFIG.refs[sc.c.id];
      if (ref) { const k = prog(t, sc.c.start + 0.3, sc.c.start + 0.7); ctx.globalAlpha = k; ctx.fillStyle = ACCOL; ctx.fillRect(X0, 1630, 90, 8); text(ref, X0, 1700, 54, A, { w: 900 }); ctx.globalAlpha = 1; }
      // CTA: botão seguir + "AMÉM"
      if (sc.isCta && segue) {
        const kb = prog(t, segue - 0.3, segue + 0.1), bk = outBack(kb), press = t > segue + 0.25;
        if (kb > 0.01) { ctx.save(); ctx.translate(540, 1520); const pr = bk * (1 - 0.06 * pulse(t, segue + 0.25)); ctx.scale(pr, pr); rr(-270, -78, 540, 156, 78); ctx.fillStyle = press ? A : Bc; ctx.fill(); text(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 24, 66, press ? Bc : A, { align: 'center' }); ctx.restore(); }
      }
    }
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      let i = 0; scenes.forEach((s, k) => { if (t >= s.t0) i = k; });
      const sc = scenes[i];
      // tremidinha quando entra palavra de destaque
      let sh = 0; for (const p of sc.pages) for (const ln of p) for (const it of ln) if (ACC.has(it.w.norm)) sh = Math.max(sh, pulse(t, it.w.start, 0.03, 0.12));
      ctx.save(); if (sh > 0.05) ctx.translate(Math.sin(t * 97) * 7 * sh, Math.cos(t * 83) * 7 * sh);
      drawScene(sc, t); ctx.restore();
      // transição: a cor da próxima cena sobe como uma cortina
      const nx = scenes[i + 1];
      if (nx) { const k = prog(t, nx.t0 - 0.22, nx.t0); if (k > 0) { ctx.fillStyle = nx.pal[0]; const hh = H * outC(k); ctx.fillRect(0, H - hh, W, hh); } }
      if (i > 0) { const k = prog(t, sc.t0, sc.t0 + 0.2); if (k < 1) { ctx.fillStyle = sc.pal[0]; ctx.fillRect(0, 0, W, H * (1 - outC(k))); } }
      ctx.globalAlpha = 0.5; const f = Math.floor(t * 12); ctx.drawImage(grain, -((f * 37) % 40), -((f * 53) % 40), W + 40, H + 40); ctx.globalAlpha = 1; ctx.drawImage(vig, 0, 0);
      text('animação e voz feitas com IA', 540, 1860, 26, 'rgba(255,255,255,0.55)', { w: 600, align: 'center' });
    }
    cues.sort((a, b) => a.t - b.t);
    const scenesOut = scenes.map((s, i) => ({ n: i + 1, name: s.c.id, t0: +s.t0.toFixed(2), t1: +s.t1.toFixed(2) }));
    return { draw, duration: END, cues, scenes: scenesOut, width: W, height: H, fps: 30 };
  }
  return { create };
});
