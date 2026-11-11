/*
 * "CELULAR": tela dividida, estilo poster escuro. Em cima quem rola a tela (a crianca espera, ele diz "so um minuto"), embaixo quem larga o celular e abraca.
 * "30 anos depois": 4h x 365 x 30 = 5 anos. Sem narracao, 9:16.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, END = 21.5;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = t => 1 - Math.pow(1 - clamp(t), 3);
  const outBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));

  const BG = '#060607', FIG = '#e6e6ea', FIG2 = '#b9b9c2', RED = '#e0262b', MU = '#8d8d96', AMB = '#f2c27a', MILK = '#f7f5ee', SCARF = '#d7262b';
  // painéis
  const PAN = [{ oy: 330, kind: 'grita' }, { oy: 1040, kind: 'ajuda' }], PH = 650, FLOOR = 540;
  // tempos dos dois atos
  const A1 = 0.8, A2 = 9.2, T_SKIP = 7.9, T_END = 15.2;

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot); ctx.font = o.font || `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 26; } ctx.fillStyle = o.color || FIG; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, font) => { ctx.font = font; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = size * 0.3; ctx.font = `800 ${size}px Inter`; const ws = [...s].map(c => ctx.measureText(c).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1); let cx = x - (o.align === 'left' ? 0 : tot / 2); [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w: 800, color: o.color || MU, a: o.a ?? 1 }); cx += ws[i] + sp; }); }
    // frase serifada: partes [texto, itálico?, cor]
    function serif(parts, x, y, size, a = 1) { if (a <= 0) return; const fN = `400 ${size}px Serif`, fI = `italic 400 ${size}px Serif`; let tot = 0; parts.forEach(p => { p.w = tw(p[0], p[1] ? fI : fN); tot += p.w; }); let cx = x - tot / 2; parts.forEach(p => { txt(p[0], cx, y, size, { font: p[1] ? fI : fN, align: 'left', color: p[2] || FIG, a }); cx += p.w; }); }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }

    // ---------- boneco liso (manequim) ----------
    // origem = referência dos pés; ângulos a partir da vertical para baixo (+ = para a frente)
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s; ctx.save(); ctx.translate(o.x, o.y); ctx.scale((o.dir || 1) * s, s);
      const hipY = -92 + (o.crouch || 0) + (o.bob || 0), lean = o.lean || 0, shX = Math.sin(lean) * 64, shY = hipY - Math.cos(lean) * 64;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const col = o.col || FIG;
      const draw = (lw, c) => { ctx.strokeStyle = c; ctx.lineWidth = lw;
        o.legs.forEach(([a, b]) => limb(0, hipY, a, b, 48, 46));
        ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
        return o.arms.map(([a, b]) => limb(shX, shY + 4, a, b, 40, 38)); };
      if (!o.flat) { ctx.shadowColor = 'rgba(255,255,255,0.18)'; ctx.shadowBlur = 14; }
      draw(19, FIG2); ctx.shadowBlur = 0; const hands = draw(13, col);
      // cachecol (identifica o filho que cresce)
      if (o.scarf) { ctx.strokeStyle = SCARF; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(shX - 14, shY - 6); ctx.lineTo(shX + 14, shY - 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(shX - 6, shY - 4); ctx.lineTo(shX - 16 + Math.sin(o.t * 3) * 3, shY + 30); ctx.stroke(); }
      // cabeça (esfera)
      const hx = shX + Math.sin(lean + (o.nod || 0)) * 36, hy = shY - Math.cos(lean + (o.nod || 0)) * 36, hr = o.head || 25;
      const g = ctx.createRadialGradient(hx - hr * 0.35, hy - hr * 0.4, 2, hx, hy, hr); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, col); g.addColorStop(1, '#9d9da6'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
      if (o.cloth) { const [cx, cy] = hands[0]; ctx.fillStyle = '#7fb3d9'; ctx.fillRect(cx - 12, cy - 4, 24, 12); }
      ctx.restore();
      return hands.map(([x, y]) => [o.x + (o.dir || 1) * x * s, o.y + y * s]);
    }
    function figRefl(o, floorY) { ctx.save(); ctx.translate(0, floorY * 2); ctx.scale(1, -1); ga(0.13); figure(Object.assign({}, o, { flat: true })); ga(1); ctx.restore(); }
    // poses
    const P = {
      stand: { lean: 0, crouch: 0, legs: [[-0.1, -0.1], [0.12, 0.1]], arms: [[-0.15, -0.1], [0.15, 0.1]] },
      yell: { lean: 0.28, crouch: 0, legs: [[-0.25, -0.15], [0.3, 0.2]], arms: [[1.6, 2.2], [0.5, 1.6]] },
      kneel: { lean: 0.35, crouch: 46, legs: [[1.5, 0], [0.15, -1.55]], arms: [[1.0, 0.7], [0.7, 0.4]] },
      sit: { lean: 0.05, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.4, 0.5], [0.3, 0.3]] },
      reach: { lean: 0.2, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[1.3, 1.75], [0.4, 0.5]] },
      cower: { lean: -0.3, crouch: 46, legs: [[1.7, 0.6], [1.6, 0.5]], arms: [[2.4, 3.3], [2.2, 3.1]] },
    };
    const mix = (a, b, k) => ({ lean: lerp(a.lean, b.lean, k), crouch: lerp(a.crouch, b.crouch, k), legs: a.legs.map((l, i) => [lerp(l[0], b.legs[i][0], k), lerp(l[1], b.legs[i][1], k)]), arms: a.arms.map((l, i) => [lerp(l[0], b.arms[i][0], k), lerp(l[1], b.arms[i][1], k)]) });

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));
    const walk = ph => ({ lean: 0.03, crouch: 0, legs: [[Math.sin(ph) * 0.55, Math.sin(ph) * 0.2], [-Math.sin(ph) * 0.55, -Math.sin(ph) * 0.2]], arms: [[-Math.sin(ph) * 0.4, -Math.sin(ph) * 0.4], [Math.sin(ph) * 0.4, Math.sin(ph) * 0.4]] });
    const HOLD = { lean: 0.16, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[1.0, 1.9], [0.9, 1.8]] };
    const HUG = { lean: 0.25, crouch: 40, legs: [[1.3, 0], [0.2, -1.4]], arms: [[1.5, 1.6], [1.4, 1.5]] };
    const PH0 = { lean: 0.04, crouch: 46, legs: [[1.5, 0.05], [1.45, -0.05]], arms: [[0.4, 0.5], [0.3, 0.3]] };

    function bubble(x, y, l1, l2, col, bg, a, w = 330) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(a, a); rr(-w / 2, -48, w, 96, 48); ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke(); if (l2) { txt(l1, 0, -14, 30, { color: col }); txt(l2, 0, 22, 30, { color: col }); } else txt(l1, 0, 0, 34, { color: col }); ctx.restore(); }
    function stool(x, F, s = 1.3) { ctx.fillStyle = '#2a2a30'; rr(x - 46 * s, F - 52 * s, 92 * s, 12, 4); ctx.fill(); ctx.fillRect(x - 38 * s, F - 40 * s, 8, 40 * s); ctx.fillRect(x + 30 * s, F - 40 * s, 8, 40 * s); }
    function phone(h, a, dark) { ctx.save(); ctx.translate(h[0], h[1]); ctx.rotate(-0.4); ctx.fillStyle = dark ? '#1a1a1d' : RED; ctx.shadowColor = RED; ctx.shadowBlur = dark ? 0 : 24; rr(-10, -22, 20, 36, 4); ctx.fill(); ctx.restore(); }

    // ---------- um painel: kind 'tela' (rola a tela) ou 'vive'; old = 30 anos depois ----------
    function act(u, kind, oy, old, t) {
      const F = oy + FLOOR, mx = 700, tela = kind === 'tela';
      ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      ctx.fillStyle = BG; ctx.fillRect(0, oy, W, PH);
      const warm = tela ? 0 : sm(u, 1.8, 3.4) * 0.12 + (old ? 0.14 : 0);
      const cone = ctx.createLinearGradient(0, oy, 0, F); cone.addColorStop(0, tela ? 'rgba(255,90,90,0.10)' : 'rgba(255,230,190,0.16)'); cone.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(570, oy + 64); ctx.lineTo(610, oy + 64); ctx.lineTo(1000, F); ctx.lineTo(160, F); ctx.closePath(); ctx.fill();
      glow(600, F, 520, tela ? 'rgba(224,38,43,A)' : 'rgba(255,214,150,A)', tela ? 0.1 : 0.1 + warm);
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(590, oy); ctx.lineTo(590, oy + 40); ctx.stroke();
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(545, oy + 66); ctx.quadraticCurveTo(590, oy + 26, 635, oy + 66); ctx.closePath(); ctx.fill(); glow(590, oy + 70, 70, 'rgba(255,230,190,A)', 0.8);
      const fg = ctx.createLinearGradient(0, F, 0, oy + PH); fg.addColorStop(0, '#16161a'); fg.addColorStop(1, '#060607'); ctx.fillStyle = fg; ctx.fillRect(0, F, W, oy + PH - F); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, F, W, 2);
      const figs = [];
      if (!old) {
        // ---- HOJE ----
        const down = tela ? 0 : sm(u, 0.7, 1.1);               // o pai larga o celular (painel de baixo)
        let mp = tela ? HOLD : mix(HOLD, PH0, down);
        let mxx = mx, my = F - 20, ms = 1.3;
        if (!tela) { const k = sm(u, 1.9, 2.4) * (1 - sm(u, 6.2, 6.6)); mp = mix(mp, HUG, k); mxx = lerp(mx, 600, k); my = lerp(F - 20, F, k); }
        const sway = tela ? Math.sin(t * 3) * 0.04 : 0;
        if (tela || down < 1 || true) stool(mx, F);
        // criança (entra pela esquerda, mostra o desenho)
        const kIn = sm(u, 1.1, 2.3, t2 => t2), kOut = tela ? sm(u, 4.2, 5.6, t2 => t2) : 0;
        let kx = lerp(-80, tela ? 420 : 540, kIn) - kOut * 560; const walking = (kIn > 0 && kIn < 1) || kOut > 0 && kOut < 1;
        let kpz = walking ? walk(t * 9) : P.stand; let kdir = kOut > 0 ? -1 : 1; let nod = tela ? -0.5 * sm(u, 3.7, 4.2) : 0;
        if (tela && u > 3.7 && kOut === 0) kpz = Object.assign({}, P.stand, { arms: [[0.05, 0.05], [0.05, 0.05]] });
        const kid = Object.assign({ x: kx, y: F + (walking ? -Math.abs(Math.sin(t * 9)) * 4 : 0), s: 0.66, dir: kdir, t, head: 27, nod, scarf: true }, kpz);
        if (!tela) { const hugK = sm(u, 2.1, 2.6); Object.assign(kid, mix(kpz, { lean: 0.15, crouch: 0, legs: P.stand.legs, arms: [[1.6, 2.0], [1.5, 1.9]] }, hugK), { dir: hugK > 0.5 ? 1 : 1 }); if (hugK > 0.6) kid.x = 600 + 6; }
        const man = Object.assign({ x: mxx, y: my, s: ms, dir: -1, t, nod: tela ? 0.3 : 0 }, mp, { lean: mp.lean + sway });
        figRefl(man, F);
        if (kIn > 0 && u < 6) figRefl(kid, F);
        const mh = figure(man); if (kIn > 0 && !(kOut >= 1)) { const kh = figure(kid); if (tela && kIn >= 1 && kOut === 0) { ctx.save(); ctx.translate(kh[0][0], kh[0][1]); ctx.rotate(-0.1); ctx.fillStyle = '#f2efe6'; rr(-26, -34, 52, 40, 3); ctx.fill(); ctx.fillStyle = '#d96b6b'; ctx.fillRect(-16, -26, 8, 12); ctx.fillStyle = '#8aa'; ctx.fillRect(-4, -26, 8, 12); ctx.fillStyle = '#e0c97a'; ctx.fillRect(8, -26, 8, 12); ctx.restore(); } }
        if (tela) { phone(mh[0], 1, false); const fl = 0.32 + Math.sin(t * 13) * 0.06; glow(mh[0][0], mh[0][1] - 20, 190, 'rgba(224,38,43,A)', fl); }
        else if (down < 1) phone(mh[0], 1, false);
        else { ctx.save(); ctx.translate(mx - 80, F - 70); ctx.fillStyle = '#1a1a1d'; rr(-14, -4, 30, 8, 3); ctx.fill(); ctx.restore(); }
        // chegada da parceira (baixo, só os dois juntos)
        if (!tela) { const pIn = sm(u, 4.4, 5.6, t2 => t2); if (pIn > 0) { const walkingP = pIn < 1; const pp = Object.assign({ x: lerp(1160, 790, pIn), y: F, s: 1.2, dir: -1, t, bob: walkingP ? Math.abs(Math.sin(t * 9)) * -4 : 0 }, walkingP ? walk(t * 9) : { lean: -0.05, crouch: 0, legs: P.stand.legs, arms: [[1.0, 1.8], [0.1, 0.1]] }); figRefl(pp, F); figure(pp); } }
        // falas
        if (tela) { bubble(430, oy + 120, 'PAPAI?', null, FIG, '#16161a', sm(u, 2.5, 2.75, outBack) * (1 - sm(u, 3.6, 3.85)), 200); bubble(820, oy + 140, 'SÓ UM', 'MINUTO...', RED, '#16161a', sm(u, 3.2, 3.45, outBack) * (1 - sm(u, 5.0, 5.3)), 270); }
        else { bubble(560, oy + 120, 'VEM CÁ!', null, '#1a1a1d', '#efe9dc', sm(u, 1.6, 1.85, outBack) * (1 - sm(u, 3.4, 3.7)), 230); }
      } else {
        // ---- 30 ANOS DEPOIS ----
        const man = Object.assign({ x: mx, y: F - 20, s: 1.2, dir: -1, t, col: FIG2, head: 24, nod: tela ? 0.4 : 0.05 }, tela ? Object.assign({}, HOLD, { lean: 0.42 }) : Object.assign({}, PH0, { lean: 0.22 }));
        stool(mx, F);
        if (tela) {
          stool(330, F);   // cadeira vazia
          ctx.save(); ctx.translate(330, F - 52 * 1.3 - 4); ctx.fillStyle = '#c9c3b4'; ctx.globalAlpha *= 0.5; rr(-26, -34, 52, 40, 3); ctx.fill(); ctx.restore();   // desenho esquecido na cadeira
          figRefl(man, F); const mh = figure(man); phone(mh[0], 1, false); glow(mh[0][0], mh[0][1] - 20, 200, 'rgba(224,38,43,A)', 0.3 + Math.sin(t * 13) * 0.05);
          const a = sm(u, 1.6, 2.2); txt('NINGUÉM VEIO.', 400, oy + 120, 36, { color: MU, a }); 
        } else {
          const ad = Object.assign({ x: 470, y: F, s: 1.22, dir: 1, t, scarf: true }, { lean: -0.04, crouch: 0, legs: P.stand.legs, arms: [[0.9, 1.7], [0.1, 0.1]] });
          const kd = Object.assign({ x: 330, y: F, s: 0.7, dir: 1, t, head: 27 }, P.stand);
          const wi = Object.assign({ x: 860, y: F, s: 1.12, dir: -1, t, col: FIG2, lean: 0.2 }, { crouch: 0, legs: P.stand.legs, arms: [[0.15, 0.1], [0.1, 0.1]] });
          [kd, ad, wi, man].forEach(f => figRefl(f, F)); [kd, ad, wi, man].forEach(f => figure(f));
          bubble(470, oy + 120, 'VOCÊ ESTEVE.', null, '#1a1a1d', '#efe9dc', sm(u, 1.4, 1.7, outBack), 330);
        }
      }
      ctx.restore();
    }

    // ---------- som ----------
    for (let i = 0; i < 10; i++) cue(A1 + 0.5 + i * 0.65, 'scroll');
    cue(A1 + 1.2, 'steps'); cue(A1 + 2.9, 'ping'); cue(A1 + 4.3, 'steps'); cue(A1 + 4.0, 'sad'); cue(A1 + 2.2, 'hug'); cue(A1 + 5.0, 'steps');
    cue(T_SKIP + 0.1, 'whoosh'); cue(T_SKIP + 0.2, 'tickstart'); cue(A2 - 0.1, 'tickstop');
    cue(A2 + 1.6, 'sad2'); cue(A2 + 1.5, 'hug'); cue(T_END + 0.2, 'end');

    function label(s, y, a, col) { spaced(s, 70, y, 24, { align: 'left', color: col || MU, a }); }
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const inA2 = t >= A2 - 0.15, u = inA2 ? (t - A2) : t - A1;
      const fadeIn = sm(t, 0, 0.5), skipDim = sm(t, T_SKIP - 0.2, T_SKIP + 0.2) * (1 - sm(t, A2 - 0.4, A2)), endDim = sm(t, T_END, T_END + 0.6);
      const vis = fadeIn * (1 - skipDim * 0.9) * (1 - endDim * 0.8);
      ['tela', 'vive'].forEach((k, i) => { act(Math.max(0, u), k, PAN[i].oy, inA2, t); if (vis < 1) { ctx.globalAlpha = 1 - vis; ctx.fillStyle = BG; ctx.fillRect(0, PAN[i].oy, W, PH); ctx.globalAlpha = 1; } });
      const la = fadeIn * (1 - skipDim) * (1 - endDim);
      label(inA2 ? '60 ANOS · SÓ A TELA' : 'QUEM ROLA A TELA', PAN[0].oy - 26, la, inA2 ? '#ff5a5f' : MU);
      label(inA2 ? '60 ANOS · CERCADO DE GENTE' : 'QUEM VIVE', PAN[1].oy - 26, la, inA2 ? AMB : MU);
      // faixa do meio: contador
      const bandA = la * (1 - sm(t, T_SKIP - 0.2, T_SKIP));
      if (!inA2 && bandA > 0) { const h = Math.round(4 * clamp(prog(t, 1.0, 4.0))) ; txt('4 HORAS POR DIA', 540, 1010, 38, { color: RED, a: bandA * sm(t, 1.0, 1.5), w: 900 }); }
      // frases do topo
      if (t < T_SKIP) { serif([['Você passa ', false], ['4 horas por dia', true, '#ff5a5f']], 540, 150, 54, sm(t, 0.3, 0.9) * (1 - sm(t, T_SKIP - 0.4, T_SKIP)));
        serif([['vendo a vida ', false], ['dos outros.', true]], 540, 225, 54, sm(t, 3.4, 4.0) * (1 - sm(t, T_SKIP - 0.4, T_SKIP))); }
      else if (t < T_END) { serif([['E um dia, ', false], ['só sobra a tela.', true, '#ff5a5f']], 540, 185, 60, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END)));
        serif([['4h × 365 × 30 anos = ', false], ['5 anos da sua vida.', true, AMB]], 540, 254, 40, sm(t, A2 + 1.0, A2 + 1.7) * (1 - sm(t, T_END - 0.3, T_END))); }
      if (skipDim > 0) { serif([['30 anos ', false], ['depois', true]], 540, 990, 110, skipDim); }
      // final
      if (endDim > 0) { serif([['Você viu 4 horas por dia', false]], 540, 760, 58, endDim); serif([['da vida dos outros.', true]], 540, 835, 58, sm(t, T_END + 0.3, T_END + 0.9));
        const e = sm(t, T_END + 1.4, T_END + 1.9, outBack); if (e > 0) { ctx.save(); ctx.translate(540, 1000); ctx.scale(e, e); txt('E A SUA?', 0, 0, 150, { color: RED, glow: RED }); ctx.restore(); }
        const v = sm(t, T_END + 2.6, T_END + 3.2); ga(v); rr(150, 1130, 780, 150, 18); ctx.fillStyle = '#0c0c0e'; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"Aproveitem ao máximo cada oportunidade."', true]], 540, 1185, 38, v); spaced('EFÉSIOS 5:16', 540, 1240, 22, { color: AMB, a: v }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
