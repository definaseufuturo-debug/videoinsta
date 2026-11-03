/*
 * "O SUCESSO QUE NINGUÉM VIU" (Mindloop: a mente em bonequinhos). No palco, holofote e plateia aplaudindo; um da
 * plateia diz "ELE TEVE SORTE.". A cortina vermelha (o único vermelho de cena: o que esconde o esforço) sobe e mostra,
 * atrás dele, uma montanha de folhas amassadas. Headline: "VOCÊ VÊ / O PALCO. / NINGUÉM VÊ / O CHÃO."
 * Antes do palco: ele sozinho, tentativa 1, 2, 3… 1.000. Depois, o da plateia em casa: amassa a primeira e pega outra folha.
 * Final: "ERRA. DE NOVO." 30 s, 9:16, sem narração.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, END = 30;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));

  const WHITE = '#efefef', GREY = '#8d8d94', RED = '#e0262b', BG = '#0a0a0c';
  // palco
  const STAGE = 1250, C_TOP = 560, HERO_X = 540, HS = 1.7, AUD_X = 300;
  const CUR = 9.0, CUR_UP = 10.0, SEE = 10.25, HL = [11.6, 12.15, 13.05, 13.6], HL_OUT = 15.1;
  // bastidores (antes do palco)
  const BACK = 15.3, F2 = 1500, S2 = 1.7, CH_X = 360, SEAT2 = F2 - 88, DESK2 = 1340, D2 = [470, 760];
  const THROW = [16.0, 16.9, 17.6, 18.15, 18.6, 18.95, 19.25, 19.5, 19.7];   // arremessos
  const COUNT = [1, 2, 3, 10, 50, 200, 500, 800, 999];
  const WIN = 20.0, HOME = 20.9, A_THROW = 21.9, A_NEW = 22.7, FIN = 23.7;

  // montanha de bolinhas (posições determinísticas)
  function moundBalls(cx, wid, hei, n, seed) { const out = []; let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < n; i++) { const u = (rnd() * 2 - 1), k = i / n; const x = cx + u * wid * (1 - 0.55 * k) * 0.5; const top = hei * Math.pow(1 - Math.abs(u) * (1 - 0.55 * k), 1.4); out.push({ x, y: -top * (0.15 + 0.85 * k) - rnd() * 12, r: 15 + rnd() * 9, rot: rnd() * TAU }); }
    return out; }
  const STAGE_PILE = moundBalls(540, 900, 420, 220, 7);
  const BACK_PILE = moundBalls(175, 300, 230, 70, 11);

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; } ctx.fillStyle = o.color || WHITE; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 900) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = o.sp ?? size * 0.35, w = o.w || 800; let tot = 0; const ws = [...s].map(c => { const v = tw(c, size, w); tot += v + sp; return v; }); tot -= sp; let cx = x - tot / 2; [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w, color: o.color || WHITE, a: o.a ?? 1 }); cx += ws[i] + sp; }); }

    // ---------- cenários fixos ----------
    const stageBg = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      g.fillStyle = '#121216'; g.fillRect(60, C_TOP - 40, W - 120, STAGE - C_TOP + 40);                       // fundo do bastidor
      const fg = g.createLinearGradient(0, STAGE, 0, STAGE + 90); fg.addColorStop(0, '#34343b'); fg.addColorStop(1, '#16161a'); g.fillStyle = fg; g.fillRect(30, STAGE, W - 60, 90); g.fillStyle = '#4a4a52'; g.fillRect(30, STAGE, W - 60, 4);
      return cv; })();
    const roomBg = (() => { const cv = mk(W, H), g = cv.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      const fg = g.createLinearGradient(0, F2, 0, F2 + 300); fg.addColorStop(0, '#26262b'); fg.addColorStop(1, '#0f0f12'); g.fillStyle = fg; g.fillRect(0, F2, W, 300); g.fillStyle = '#3a3a40'; g.fillRect(0, F2, W, 3);
      g.fillStyle = '#1d1d22'; g.strokeStyle = '#3a3a42'; g.lineWidth = 3; const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.stroke(); };
      rr(CH_X - 75, SEAT2, 150, 20, 6); rr(CH_X - 95, SEAT2 - 190, 20, 210, 6); g.fillRect(CH_X - 7, SEAT2 + 20, 14, F2 - SEAT2 - 20);
      rr(D2[0], DESK2, D2[1] - D2[0], 22, 5); g.fillRect(D2[0] + 16, DESK2 + 22, 14, F2 - DESK2 - 22); g.fillRect(D2[1] - 30, DESK2 + 22, 14, F2 - DESK2 - 22);
      // abajur
      g.strokeStyle = '#55555e'; g.lineWidth = 8; g.beginPath(); g.moveTo(D2[1] - 60, DESK2); g.lineTo(D2[1] - 60, DESK2 - 170); g.lineTo(D2[1] - 140, DESK2 - 230); g.stroke(); g.fillStyle = '#55555e'; g.beginPath(); g.moveTo(D2[1] - 175, DESK2 - 250); g.lineTo(D2[1] - 105, DESK2 - 210); g.lineTo(D2[1] - 150, DESK2 - 170); g.closePath(); g.fill();
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return cv; })();

    // ---------- bonequinho ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s, dir = o.dir || 1, hr = o.hr || 23, col = o.col || WHITE; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(dir * s, s); ga(o.a ?? 1);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.shadowColor = 'rgba(255,255,255,0.22)'; ctx.shadowBlur = 10;
      const bob = o.bob || 0, lean = o.lean || 0, hipY = -92 + bob, shY = -158 + bob, shX = Math.sin(lean) * 66;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
      for (const [a, b] of o.legs) limb(0, hipY, a, b, 48, 46);
      const hands = o.arms.map(([u, l]) => limb(shX, shY + 4, u, l, 40, 38));
      const tilt = o.headTilt || 0, hx = shX + Math.sin(lean + tilt) * (hr + 11), hy = shY - Math.cos(lean + tilt) * (hr + 11);
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      if (o.eyes !== false) { ctx.fillStyle = BG; const ey = hy - 3 + tilt * 10; ctx.beginPath(); if (o.front) { ctx.arc(hx - 7, ey, 3.6, 0, TAU); ctx.arc(hx + 7, ey, 3.6, 0, TAU); } else { ctx.arc(hx + hr * 0.38, ey, 3.4, 0, TAU); ctx.arc(hx + hr * 0.72, ey, 3.4, 0, TAU); } ctx.fill(); }
      ctx.restore(); ga(1);
      const rx = (x, y) => [o.x + dir * x * s, o.y + y * s];
      return { head: rx(hx, hy), hands: hands.map(([x, y]) => rx(x, y)) };
    }
    const STAND = [[0.12, 0.06], [-0.12, -0.06]], SIT = [[1.5, 0.05], [1.42, 0.0]];
    function paperBall(x, y, r, rot, col = '#d9d9de') { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, rr = r * (0.85 + 0.15 * Math.sin(i * 2.7)); i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.2); ctx.lineTo(0, r * 0.1); ctx.lineTo(r * 0.4, -r * 0.35); ctx.moveTo(-r * 0.2, r * 0.5); ctx.lineTo(r * 0.1, r * 0.1); ctx.stroke(); ctx.restore(); }
    function sheet(x, y, k = 1, glow = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); if (glow > 0) { ctx.shadowColor = `rgba(255,240,200,${0.8 * glow})`; ctx.shadowBlur = 40 * glow; } ctx.fillStyle = '#f2f2f2'; ctx.fillRect(-38, -50, 76, 100); ctx.shadowBlur = 0; ctx.strokeStyle = '#9a9aa2'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-26, -30 + i * 20); ctx.lineTo(26 - (i === 3 ? 20 : 0), -30 + i * 20); ctx.stroke(); } ctx.restore(); }
    function bubble(parts, x, y, k, o = {}) { if (k <= 0) return; const size = o.size || 46, full = parts.map(p => p[0]).join(''), w = tw(full, size) + 60, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(k), outBack(k)); ga(clamp(k * 3));
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); const tx = (o.tail || 0) * w * 0.3; ctx.beginPath(); ctx.moveTo(tx - 16, h / 2 - 2); ctx.lineTo(tx + (o.tailDir || 1) * 30, h / 2 + 34); ctx.lineTo(tx + 18, h / 2 - 2); ctx.fill();
      let cx = -tw(full, size) / 2; for (const [p, col] of parts) { const pw = tw(p, size); txt(p, cx + pw / 2, 3, size, { color: col }); cx += pw; } ctx.restore(); ga(1); }
    // espectador visto de costas: cabeça + ombros + braços batendo palma
    function viewer(x, y, s, col, clap, ph, raise = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(-58, 90); ctx.quadraticCurveTo(-58, 18, 0, 14); ctx.quadraticCurveTo(58, 18, 58, 90); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -22, 30, 0, TAU); ctx.fill();
      if (clap > 0) { const d = 6 + Math.abs(Math.sin(ph)) * 26 * clap, hy = lerp(40, -60, clap * (0.9 + raise * 0.2)); ctx.beginPath(); ctx.moveTo(-44, 34); ctx.lineTo(-d, hy); ctx.moveTo(44, 34); ctx.lineTo(d, hy); ctx.stroke(); ctx.beginPath(); ctx.arc(-d, hy, 9, 0, TAU); ctx.arc(d, hy, 9, 0, TAU); ctx.fill(); }
      ctx.restore(); }
    function curtain(rise, t) { if (rise >= 1) return; const top = C_TOP, bot = STAGE + 2, h = (bot - top) * (1 - rise); if (h <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(40, top, W - 80, h); ctx.clip();
      const g = ctx.createLinearGradient(40, 0, W - 40, 0); for (let i = 0; i <= 14; i++) { g.addColorStop(i / 14, i % 2 ? '#8e1418' : RED); } ctx.fillStyle = g; ctx.fillRect(40, top, W - 80, bot - top);
      const sh = ctx.createLinearGradient(0, top, 0, bot); sh.addColorStop(0, 'rgba(0,0,0,0.35)'); sh.addColorStop(0.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.3)'); ctx.fillStyle = sh; ctx.fillRect(40, top, W - 80, bot - top);
      ctx.restore(); ctx.fillStyle = '#6e0f13'; ctx.fillRect(40, top + h - 14, W - 80, 14); }

    // ---------- som ----------
    const cues = []; const cue = (t, type, o = {}) => { if (t >= 0 && t < END) cues.push(Object.assign({ t: +t.toFixed(3), type }, o)); };
    cue(0, 'applause', { dur: SEE + 0.1 }); [2.4, 5.0, 7.6].forEach(t => cue(t, 'bow')); cue(3.6, 'bubble'); cue(6.2, 'bubble');
    cue(CUR, 'curtain'); cue(SEE, 'shock'); HL.forEach((t, i) => cue(t, 'hit', { big: i === 3 })); cue(BACK, 'back');
    THROW.forEach((t, i) => { cue(t - 0.45, 'crumple', { n: i }); cue(t + 0.45, 'land', { n: i }); cue(t, 'count', { n: i }); });
    cue(WIN, 'win'); cue(HOME, 'back'); cue(A_THROW - 0.45, 'crumple', { n: 0 }); cue(A_THROW + 0.45, 'land', { n: 0 }); cue(A_NEW, 'count', { n: 1 }); cue(FIN, 'final');

    // um ciclo de tentativa: papel na mesa → amassa → joga pra trás
    function attempt(t, t0, who, col) { // devolve pose dos braços e desenha papel/bolinha
      const crumple = prog(t, t0 - 0.5, t0 - 0.1), thr = prog(t, t0 - 0.1, t0 + 0.45);
      return { crumple, thr };
    }

    // ---------- cena: bastidores / casa ----------
    function room(t, mode) { // mode 'hero' | 'home'
      ctx.drawImage(roomBg, 0, 0);
      const isHero = mode === 'hero';
      const lampK = isHero ? 1 : 0.8; { const lx = D2[1] - 140, ly = DESK2 - 120, g = ctx.createRadialGradient(lx, ly, 10, lx, ly, 520); g.addColorStop(0, `rgba(255,236,200,${0.20 * lampK})`); g.addColorStop(1, 'rgba(255,236,200,0)'); ctx.fillStyle = g; ctx.fillRect(lx - 520, ly - 520, 1040, 1040); }
      const throws = isHero ? THROW : [A_THROW];
      const done = throws.filter(x => t >= x + 0.45).length;
      // pilha atrás da cadeira
      const nb = isHero ? Math.round(BACK_PILE.length * Math.pow(clamp(done / throws.length), 0.8)) : done;
      for (let i = 0; i < nb; i++) { const b = BACK_PILE[i]; paperBall(isHero ? b.x : 130 + i * 40, F2 + (isHero ? b.y : 0) - b.r * 0.8, b.r, b.rot); }
      // tentativa atual
      let cur = throws.findIndex(x => t < x + 0.45); if (cur < 0) cur = throws.length;
      const won = isHero && t >= WIN - 0.2;
      let arms, lean = 0.32, headTilt = 0.3, paper = null;
      const wr = t * 8;
      const writing = [[1.15 + Math.sin(wr) * 0.05, 1.75], [1.05 + Math.sin(wr + 1.4) * 0.05, 1.65]];
      if (cur < throws.length && !won) {
        const t0 = throws[cur], cr = prog(t, t0 - 0.5, t0 - 0.1), th = prog(t, t0 - 0.1, t0 + 0.45);
        if (t < t0 - 0.5) { arms = writing; paper = { x: 520, y: DESK2 - 50, k: 1 }; }
        else if (t < t0 - 0.1) { arms = [[lerp(1.15, 0.9, cr), lerp(1.75, 0.9, cr)], [lerp(1.05, 0.8, cr), lerp(1.65, 0.7, cr)]]; paper = { ball: true, r: lerp(40, 20, cr) }; lean = lerp(0.32, 0.15, cr); headTilt = lerp(0.3, 0.5, cr); }
        else { const sw = outC(th); arms = [[lerp(0.9, -2.6, sw), lerp(0.9, -2.9, sw)], [0.6, 0.4]]; lean = lerp(0.15, -0.1, sw); headTilt = lerp(0.5, -0.2, sw);
          const bx0 = CH_X + 20, by0 = SEAT2 - 260, bb = isHero ? BACK_PILE[Math.min(BACK_PILE.length - 1, Math.round(BACK_PILE.length * Math.pow(clamp((cur + 1) / throws.length), 0.8)) - 1)] : { x: 130 + cur * 40, y: 0, r: 20 };
          paper = { ballFly: true, x: lerp(bx0, bb.x, th), y: lerp(by0, F2 + bb.y - 18, th) - Math.sin(th * Math.PI) * 260, r: 20 }; }
      } else if (won) { const up = sm(t, WIN - 0.2, WIN + 0.4, outBack); arms = [[lerp(1.1, 2.3, up), lerp(1.7, 2.6, up)], [lerp(1.0, 2.2, up), lerp(1.6, 2.5, up)]]; lean = lerp(0.32, 0.0, up); headTilt = lerp(0.3, -0.35, up); paper = { held: true, glow: up }; }
      else { arms = writing; paper = { x: 520, y: DESK2 - 50, k: 1 }; }
      const col = isHero ? WHITE : WHITE;
      const r = figure({ x: CH_X, y: SEAT2 + 92 * S2, s: S2, legs: SIT, lean, headTilt, arms, col });
      if (paper) { const hx = (r.hands[0][0] + r.hands[1][0]) / 2, hy = (r.hands[0][1] + r.hands[1][1]) / 2;
        if (paper.ball) paperBall(hx + 6, hy - 6, paper.r, t * 3);
        else if (paper.ballFly) paperBall(paper.x, paper.y, paper.r, t * 9);
        else if (paper.held) sheet(hx, hy - 60, 1.15, paper.glow);
        else { ctx.save(); ctx.translate(560, DESK2 - 3); ctx.fillStyle = '#f2f2f2'; ctx.fillRect(-70, -8, 140, 8); ctx.restore(); } }
      return r;
    }

    // ---------- desenho ----------
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ga(1); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      if (t < BACK) {
        ctx.drawImage(stageBg, 0, 0);
        const rise = sm(t, CUR, CUR_UP);
        // montanha atrás (só aparece quando a cortina sobe)
        if (rise > 0) { ctx.save(); const lk = rise; const g = ctx.createRadialGradient(540, STAGE - 150, 30, 540, STAGE - 150, 600); g.addColorStop(0, `rgba(255,255,255,${0.10 * lk})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, C_TOP, W, STAGE - C_TOP);
          for (const b of STAGE_PILE) paperBall(b.x, STAGE + b.y - b.r * 0.6, b.r * 1.15, b.rot, mixGrey(b.y)); ctx.restore(); }
        curtain(rise, t);
        // holofote
        const sp = ctx.createRadialGradient(HERO_X, STAGE - 10, 10, HERO_X, STAGE - 10, 260); sp.addColorStop(0, 'rgba(255,245,220,0.35)'); sp.addColorStop(1, 'rgba(255,245,220,0)'); ctx.save(); ctx.translate(HERO_X, STAGE + 4); ctx.scale(1, 0.18); ctx.translate(-HERO_X, -(STAGE + 4)); ctx.fillStyle = sp; ctx.fillRect(HERO_X - 260, STAGE - 256, 520, 520); ctx.restore();
        ctx.save(); const cone = ctx.createLinearGradient(0, 0, 0, STAGE); cone.addColorStop(0, 'rgba(255,245,220,0.02)'); cone.addColorStop(1, 'rgba(255,245,220,0.16)'); ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(HERO_X - 40, 0); ctx.lineTo(HERO_X + 40, 0); ctx.lineTo(HERO_X + 230, STAGE); ctx.lineTo(HERO_X - 230, STAGE); ctx.closePath(); ctx.fill(); ctx.restore();
        // herói: agradece (se curva) e, quando a cortina sobe, olha para trás
        const bows = [2.4, 5.0, 7.6]; let bow = 0; for (const b of bows) bow = Math.max(bow, sm(t, b, b + 0.35) * (1 - sm(t, b + 0.8, b + 1.2)));
        const lookBack = sm(t, CUR_UP, CUR_UP + 0.5);
        figure({ x: HERO_X, y: STAGE, s: HS, dir: -1, front: lookBack < 0.5, lean: bow * 0.7, headTilt: bow * 0.3, legs: STAND, arms: [[lerp(0.9, 0.3, bow), lerp(1.2, 0.2, bow)], [lerp(-0.9, -0.3, bow), lerp(-1.2, -0.2, bow)]], eyes: true });
        // plateia (3 fileiras), A na frente, em branco
        const clapK = 1 - sm(t, SEE - 0.05, SEE + 0.25);
        const rows = [{ y: 1440, s: 0.78, col: '#23232a', n: 7, off: 75 }, { y: 1560, s: 0.95, col: '#2e2e36', n: 6, off: 0 }, { y: 1720, s: 1.15, col: '#3b3b44', n: 5, off: 40 }];
        rows.forEach((rw, ri) => { for (let i = 0; i < rw.n; i++) { const x = rw.off + 90 + i * (W - 180) / (rw.n - 1) * (rw.n > 5 ? 1 : 1); if (ri === 2 && Math.abs(x - AUD_X) < 80) continue; viewer(x, rw.y, rw.s, rw.col, clapK, t * 13 + i * 1.3 + ri, 0.3); } });
        // A
        const aClap = t < 3.4 || (t > 5.3 && t < 6.0) || (t > 8.0) ? clapK : clapK * 0.15;
        viewer(AUD_X, 1720, 1.15, '#d6d6da', aClap, t * 11, 0);
        bubble([['ELE TEVE ', '#222'], ['SORTE.', RED]], AUD_X + 90, 1520, prog(t, 3.5, 3.65) * (1 - prog(t, 5.1, 5.25)), { tail: -0.6, tailDir: -1 });
        bubble([['NASCEU ', '#222'], ['PRONTO.', RED]], AUD_X + 80, 1520, prog(t, 6.1, 6.25) * (1 - prog(t, 7.7, 7.85)), { tail: -0.6, tailDir: -1 });
        const ek = sm(t, SEE, SEE + 0.25, outBack); if (ek > 0) txt('!', AUD_X, 1560, 130, { color: RED, scale: ek, glow: 'rgba(224,38,43,0.6)' });
        // textos
        const h1 = prog(t, 0.1, 0.5) * (1 - prog(t, 3.1, 3.4)); if (h1 > 0) { spaced('TODO MUNDO VÊ', 540, 300, 60, { a: h1, w: 900, sp: 12 }); spaced('O APLAUSO', 540, 395, 76, { a: h1 * prog(t, 0.6, 1.0), w: 900, sp: 16, color: RED }); }
        const h2 = prog(t, 3.5, 3.9) * (1 - prog(t, 8.7, 9.0)); if (h2 > 0) { spaced('E ACHA QUE', 540, 300, 54, { a: h2, w: 900, sp: 10 }); spaced('FOI SORTE.', 540, 385, 54, { a: h2, w: 900, sp: 10 }); }
        const h3 = prog(t, 9.0, 9.4) * (1 - prog(t, 11.1, 11.4)); if (h3 > 0) { spaced('ATÉ A CORTINA', 540, 300, 54, { a: h3, w: 900, sp: 10 }); spaced('SUBIR.', 540, 385, 54, { a: h3, w: 900, sp: 10, color: RED }); }
        const cnt = prog(t, SEE + 0.1, SEE + 0.4) * (1 - prog(t, 11.1, 11.4)); if (cnt > 0) txt('1.000 TENTATIVAS', 540, 470, 46, { a: cnt, w: 900, color: WHITE });
      } else if (t < HOME) {
        room(t, 'hero');
        const nI = THROW.filter(x => t >= x).length, n = t >= WIN ? 1000 : nI ? COUNT[nI - 1] : 0;
        const a = prog(t, BACK + 0.2, BACK + 0.6) * (1 - prog(t, HOME - 0.3, HOME));
        spaced('ANTES DO PALCO', 540, 330, 56, { a, w: 900, sp: 12 });
        if (n > 0) { const last = t >= WIN ? WIN : THROW[nI - 1], pp = 1 + 0.15 * Math.exp(-(t - last) * 8); txt(`TENTATIVA ${n.toLocaleString('pt-BR')}`, 540, 470, (n === 1000 ? 92 : 78) * pp, { a, color: n === 1000 ? RED : WHITE, glow: n === 1000 ? 'rgba(224,38,43,0.55)' : undefined }); }
        if (t > 15.4 && t < 15.9) txt('SOZINHO.', 540, 470, 78, { a: a * prog(t, 15.4, 15.6) * (1 - prog(t, 15.75, 15.9)), color: GREY });
      } else {
        room(t, 'home');
        const a = prog(t, HOME + 0.1, HOME + 0.5) * (1 - prog(t, FIN - 0.1, FIN + 0.2));
        spaced('E VOCÊ?', 540, 330, 64, { a, w: 900, sp: 14 });
        const n = t >= A_NEW ? 2 : 1, last = t >= A_NEW ? A_NEW : HOME + 0.3, pp = 1 + 0.15 * Math.exp(-(t - last) * 8);
        txt(`TENTATIVA ${n}`, 540, 470, 78 * pp, { a: prog(t, HOME + 0.3, HOME + 0.6) * (1 - prog(t, FIN - 0.1, FIN + 0.2)) });
      }
      // HEADLINE
      const dim = prog(t, 11.2, 11.6) * (1 - prog(t, HL_OUT - 0.2, HL_OUT + 0.2)); if (dim > 0) { ga(0.86 * dim); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        const L = [['VOCÊ VÊ', WHITE], ['O PALCO.', WHITE], ['NINGUÉM VÊ', WHITE], ['O CHÃO.', RED]];
        L.forEach(([s, col], i) => { const pp = prog(t, HL[i] - 0.12, HL[i] + 0.12); if (pp <= 0) return; txt(s, 540, 640 + i * 150 + (i >= 2 ? 60 : 0), i === 3 ? 150 : 118, { color: col, scale: lerp(1.6, 1, outC(pp)), a: dim * clamp(pp * 3), glow: col === RED ? 'rgba(224,38,43,0.55)' : undefined }); }); }
      // final
      const f = prog(t, FIN, FIN + 0.6); if (f > 0) { ga(0.72 * f); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ga(1);
        txt('ERRA.', 540, 480, 170, { a: f, scale: lerp(1.3, 1, outC(prog(t, FIN, FIN + 0.5))) });
        txt('DE NOVO.', 540, 650, 160, { color: RED, a: prog(t, FIN + 0.35, FIN + 0.7), scale: lerp(1.4, 1, outC(prog(t, FIN + 0.35, FIN + 0.85))), glow: 'rgba(224,38,43,0.55)' });
        spaced('TODO APLAUSO COMEÇOU ASSIM.', 540, 800, 38, { a: prog(t, 25.1, 25.7), w: 800, sp: 6 });
        spaced('MARCA QUEM NÃO DESISTE', 540, 1700, 40, { a: prog(t, 26.3, 26.9), w: 900, sp: 8, color: RED }); }
    }
    const mixGrey = y => { const k = clamp(-y / 420); const v = Math.round(lerp(150, 225, k)); return `rgb(${v},${v},${v + 4})`; };
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
