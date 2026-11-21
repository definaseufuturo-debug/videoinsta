/*
 * "TÁ BOM, PRA NÃO TER BRIGA": estilo pôster escuro (fundo preto, holofote, bonecos brancos lisos com reflexo).
 * Em cima, a mãe cansada cede ("TÁ BOM, TÁ BOM. PRA NÃO TER BRIGA!") e dá o doce; a criança sai ganhando.
 * Embaixo, a mãe se abaixa: "NÃO, FILHO. EU TE EXPLICO POR QUÊ." A criança chora, se acalma e abraça.
 * "10 anos depois": o filho com 16 anos. Em cima, nunca ouviu um não: "VOCÊ NÃO MANDA EM MIM!".
 * Embaixo, ouve "É tarde, filho. Não vai. Eu explico." e responde "TÁ. EU ENTENDI." Final: Provérbios 29:15.
 * Único vermelho: o balão da frase que cede. Sem narração, ~18 s, 9:16. Cenas e frases próprias.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.F1Anim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 1080, H = 1920, TAU = Math.PI * 2, END = 18.4;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));

  const BG = '#060607', FIG = '#e6e6ea', FIG2 = '#b9b9c2', RED = '#e0262b', MU = '#8d8d96', AMB = '#f2c27a';
  const PAN = [{ oy: 330, kind: 'cede' }, { oy: 1040, kind: 'explica' }], PH = 650, FLOOR = 560;
  const T_SKIP = 7.4, A2 = 8.8, T_END = 14.3;

  function create(TL, env) {
    let ctx = null;
    const ga = a => { ctx.globalAlpha = clamp(a); };
    function txt(s, x, y, size, o = {}) { ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = o.font || `${o.w || 900} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; ctx.fillStyle = o.color || FIG; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, font) => { ctx.font = font; return ctx.measureText(s).width; };
    function spaced(s, x, y, size, o = {}) { const sp = size * 0.3; ctx.font = `800 ${size}px Inter`; const ws = [...s].map(c => ctx.measureText(c).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1); let cx = x - (o.align === 'left' ? 0 : tot / 2); [...s].forEach((c, i) => { txt(c, cx + ws[i] / 2, y, size, { w: 800, color: o.color || MU, a: o.a ?? 1 }); cx += ws[i] + sp; }); }
    function serif(parts, x, y, size, a = 1) { if (a <= 0) return; const fN = `400 ${size}px Serif`, fI = `italic 400 ${size}px Serif`; let tot = 0; parts.forEach(p => { p.w = tw(p[0], p[1] ? fI : fN); tot += p.w; }); let cx = x - tot / 2; parts.forEach(p => { txt(p[0], cx, y, size, { font: p[1] ? fI : fN, align: 'left', color: p[2] || FIG, a }); cx += p.w; }); }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }

    // ---------- boneco liso (manequim) ----------
    function limb(x, y, a1, a2, l1, l2) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2]; }
    function figure(o) {
      const s = o.s, d = o.dir || 1; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(d * s, s);
      const hipY = -92 + (o.crouch || 0) + (o.bob || 0), lean = o.lean || 0, shX = Math.sin(lean) * 64, shY = hipY - Math.cos(lean) * 64;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const col = o.col || FIG;
      const draw = (lw, c) => { ctx.strokeStyle = c; ctx.lineWidth = lw;
        o.legs.forEach(([a, b]) => limb(0, hipY, a, b, 48, 46));
        ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(shX, shY); ctx.stroke();
        return o.arms.map(([a, b]) => limb(shX, shY + 4, a, b, 40, 38)); };
      if (!o.flat) { ctx.shadowColor = 'rgba(255,255,255,0.18)'; ctx.shadowBlur = 14; }
      draw(19, FIG2); ctx.shadowBlur = 0; const hands = draw(13, col);
      const hx = shX + Math.sin(lean + (o.nod || 0)) * 36, hy = shY - Math.cos(lean + (o.nod || 0)) * 36, hr = o.head || 25;
      const g = ctx.createRadialGradient(hx - hr * 0.35, hy - hr * 0.4, 2, hx, hy, hr); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, col); g.addColorStop(1, '#9d9da6'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
      ctx.restore();
      o.hp = [o.x + d * hx * s, o.y + hy * s, hr * s];
      return hands.map(([x, y]) => [o.x + d * x * s, o.y + y * s]);
    }
    function figRefl(o, floorY) { ctx.save(); ctx.translate(0, floorY * 2); ctx.scale(1, -1); ga(0.13); figure(Object.assign({}, o, { flat: true })); ga(1); ctx.restore(); }
    const ST = [[-0.1, -0.1], [0.12, 0.1]];
    const P = {
      stand: { lean: 0, crouch: 0, legs: ST, arms: [[-0.15, -0.1], [0.15, 0.1]] },
      show: { lean: -0.06, crouch: 0, legs: ST, arms: [[2.55, 2.75], [2.3, 2.6]] },
      droop: { lean: 0.1, crouch: 2, legs: ST, arms: [[0.12, 0.05], [-0.08, -0.04]] },
      kneel: { lean: 0.3, crouch: 46, legs: [[1.5, 0], [0.15, -1.55]], arms: [[1.4, 1.7], [0.6, 0.4]] },
      hold: { lean: 0.02, crouch: 0, legs: ST, arms: [[1.7, 2.3], [1.5, 2.2]] },
      holdUp: { lean: 0.1, crouch: 0, legs: [[-0.22, -0.12], [0.26, 0.16]], arms: [[1.95, 2.2], [0.4, 0.3]] },
      ashamed: { lean: 0.12, crouch: 4, legs: [[-0.05, -0.05], [0.07, 0.05]], arms: [[-0.2, 0.25], [0.2, -0.25]] },
      point: { lean: 0.2, crouch: 0, legs: [[-0.25, -0.15], [0.3, 0.2]], arms: [[1.75, 1.85], [0.3, 0.6]] },
      cower2: { lean: 0.05, crouch: 10, legs: [[-0.05, -0.05], [0.07, 0.05]], arms: [[2.3, 3.2], [2.1, 3.0]] },
      offer: { lean: 0.3, crouch: 46, legs: [[1.5, 0], [0.15, -1.55]], arms: [[1.55, 1.6], [0.6, 0.4]] },
    };
    const mix = (a, b, k) => ({ lean: lerp(a.lean, b.lean, k), crouch: lerp(a.crouch, b.crouch, k), legs: a.legs.map((l, i) => [lerp(l[0], b.legs[i][0], k), lerp(l[1], b.legs[i][1], k)]), arms: a.arms.map((l, i) => [lerp(l[0], b.arms[i][0], k), lerp(l[1], b.arms[i][1], k)]) });
    const walk = (p, ph, amp) => Object.assign({}, p, { legs: [[amp * Math.sin(ph), -amp * 0.4 * Math.max(0, Math.sin(ph))], [-amp * Math.sin(ph), -amp * 0.4 * Math.max(0, -Math.sin(ph))]] });

    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    function bubble(lines, x, y, k, red, size = 40, tailX = -24) { if (k <= 0) return; const b = outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(b, b);
      const f = `900 ${size}px Inter`, w = Math.max(...lines.map(l => tw(l, f))) + 70, h = lines.length * size * 1.18 + 44;
      const bg = red ? '#121214' : '#e9e5dc';
      rr(-w / 2, -h / 2, w, h, 30); ctx.fillStyle = bg; ctx.fill(); if (red) { ctx.lineWidth = 6; ctx.strokeStyle = RED; ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(tailX + 6, h / 2 - 3); ctx.lineTo(tailX - 10, h / 2 + 40); ctx.lineTo(tailX + 46, h / 2 - 3); ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); if (red) { ctx.stroke(); ctx.fillStyle = bg; ctx.fillRect(tailX + 8, h / 2 - 8, 36, 8); }
      const c = red ? RED : '#1a1a1d'; lines.forEach((l, i) => txt(l, 0, (i - (lines.length - 1) / 2) * size * 1.18 + 2, size, { color: c }));
      ctx.restore(); }
    function stage(oy, F, warm, LX = 720) {
      ctx.fillStyle = BG; ctx.fillRect(0, oy, W, PH);
      const cone = ctx.createLinearGradient(0, oy, 0, F); cone.addColorStop(0, `rgba(255,${lerp(240, 225, warm)},${lerp(225, 170, warm)},0.15)`); cone.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(LX - 15, oy + 64); ctx.lineTo(LX + 15, oy + 64); ctx.lineTo(Math.min(1080, LX + 300), F); ctx.lineTo(Math.max(0, LX - 560), F); ctx.closePath(); ctx.fill();
      glow(LX - 200, F, 520, 'rgba(255,214,150,A)', 0.08 + 0.18 * warm);
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(LX, oy); ctx.lineTo(LX, oy + 40); ctx.stroke();
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(LX - 45, oy + 66); ctx.quadraticCurveTo(LX, oy + 26, LX + 45, oy + 66); ctx.closePath(); ctx.fill(); glow(LX, oy + 70, 70, 'rgba(255,230,190,A)', 0.8);
      const fg = ctx.createLinearGradient(0, F, 0, oy + PH); fg.addColorStop(0, '#16161a'); fg.addColorStop(1, '#060607'); ctx.fillStyle = fg; ctx.fillRect(0, F, W, oy + PH - F); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, F, W, 2);
    }
    // doce embrulhado (âmbar)
    function candy(x, y, s = 1, a = 1) { if (a <= 0) return; ga(a); ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = AMB; ctx.beginPath(); ctx.ellipse(0, 0, 20, 12, 0, 0, TAU); ctx.fill();
      [-1, 1].forEach(d => { ctx.beginPath(); ctx.moveTo(d * 18, 0); ctx.lineTo(d * 36, -13); ctx.lineTo(d * 36, 13); ctx.closePath(); ctx.fill(); });
      ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 20, 12, 0, 0, TAU); ctx.stroke(); ctx.restore(); ga(1); }

    // ---------- atos ----------
    function act(u, p, oy, t, gen) {
      const F = oy + FLOOR, top = p.kind === 'cede'; ctx.save(); ctx.beginPath(); ctx.rect(0, oy, W, PH); ctx.clip();
      const S = 1.45, KS = 1.0, TS = 1.6;
      stage(oy, F, top ? 0 : 0.2 + 0.6 * sm(u, 1.6, 3.0), 640);
      if (gen === 0) {
        const momX = 300, kidX = 640;
        if (top) {
          // a mãe cansada cede: dá o doce sem explicar; a criança sai ganhando
          const give = sm(u, 1.6, 2.3), take = sm(u, 2.3, 2.8), wk = prog(u, 3.4, 5.6);
          const mp = mix(P.droop, P.hold, give);
          const mom = Object.assign({ x: momX, y: F, s: S, dir: 1, nod: 0.18 }, u < 2.8 ? mp : mix(P.hold, P.ashamed, sm(u, 2.8, 3.6)));
          const tant = u < 1.9 ? Math.abs(Math.sin(t * 13)) * 10 : 0;
          const base = u < 3.4 ? mix(P.holdUp, P.show, sm(u, 2.3, 2.8)) : mix(P.show, P.hold, sm(u, 3.4, 3.9));
          const kp = (u >= 3.4 && wk < 1) ? walk(base, u * 9, 0.3) : base;
          const kid = Object.assign({ x: kidX + wk * 360, y: F, s: KS, dir: u > 3.3 ? 1 : -1, head: 30, bob: tant, nod: 0.1 }, kp);
          figRefl(mom, F); figRefl(kid, F); const hm = figure(mom); const hk = figure(kid);
          if (take < 1) candy(lerp(hm[0][0] + 12, hk[0][0], take), lerp(hm[0][1] - 4, hk[0][1] - 4, take), 1, sm(u, 1.0, 1.3));
          else candy(hk[0][0] + 6, hk[0][1] - 4, 1, 1);
          bubble(['TÁ BOM, TÁ BOM.', 'PRA NÃO TER BRIGA!'], 560, oy + 125, 1 - prog(u, 3.0, 3.3), true, 56, -170);
          if (u > 4.0) { ga(prog(u, 4.0, 4.5)); spaced('SEM LIMITE. SEM PORQUÊ.', 620, oy + 150, 28, { color: FIG }); ga(1); }
        } else {
          // a mãe se abaixa e explica; a criança chora, entende e abraça
          const down = sm(u, 0.3, 1.1), calm = sm(u, 1.3, 2.1), wk = prog(u, 2.4, 3.4), hug = sm(u, 3.5, 4.0);
          const mom = Object.assign({ x: lerp(momX, 400, down), y: F, s: S, dir: 1, nod: 0.2 * down }, mix(mix(P.stand, P.kneel, down), P.offer, hug));
          let kp = mix(P.holdUp, P.ashamed, calm); kp = mix(kp, P.show, hug); if (wk > 0 && wk < 1) kp = walk(kp, u * 9, 0.25);
          const kid = Object.assign({ x: lerp(kidX, 520, inOut(wk)), y: F, s: KS, dir: -1, head: 30, bob: u < 1.4 ? Math.abs(Math.sin(t * 13)) * 10 * (1 - calm) : 0, nod: 0.1 }, kp);
          figRefl(mom, F); figRefl(kid, F); figure(mom); figure(kid);
          glow(520, F - 200, 260, 'rgba(255,220,160,A)', 0.22 * hug);
          bubble(['NÃO, FILHO.', 'EU TE EXPLICO POR QUÊ.'], 560, oy + 120, 1 - prog(u, 3.0, 3.3), false, 50, -130);
          if (u > 4.5) { ga(prog(u, 4.5, 5.0)); spaced('COM LIMITE. COM PORQUÊ.', 560, oy + 150, 28, { color: AMB }); ga(1); }
        }
      } else {
        // 10 anos depois: o filho com 16 anos
        const momX = 300, teenX = 640;
        if (top) {
          // nunca ouviu um "não": grita com a mãe e sai batendo a porta
          const wk = prog(u, 3.4, 5.2);
          const mom = Object.assign({ x: momX, y: F, s: S * 0.93, dir: 1, nod: 0.1 }, mix(P.ashamed, P.cower2, sm(u, 0.8, 1.8)));
          const tp = u < 3.4 ? P.point : (wk < 1 ? walk(P.stand, u * 9, 0.32) : P.stand);
          const teen = Object.assign({ x: teenX + wk * 380, y: F, s: TS, dir: u > 3.3 ? 1 : -1, nod: -0.1, bob: u < 3.0 ? Math.sin(t * 18) * 2 : 0 }, tp);
          figRefl(mom, F); figRefl(teen, F); figure(mom); figure(teen);
          bubble(['VOCÊ NÃO MANDA', 'EM MIM!'], 560, oy + 125, prog(u, 0.2, 0.5) * (1 - prog(u, 3.0, 3.3)), true, 64, -170);
          if (u > 4.0) { ga(prog(u, 4.0, 4.5)); spaced('NUNCA OUVIU "NÃO"', 540, oy + 610, 26, { color: FIG }); ga(1); }
        } else {
          // ouviu "não" com explicação: entende e abraça a mãe
          const wk = prog(u, 3.2, 4.0), hug = sm(u, 4.0, 4.4);
          const mom = Object.assign({ x: momX + 30 * wk, y: F, s: S * 0.93, dir: 1, nod: 0.05 }, mix(P.stand, P.show, hug));
          let tp = mix(P.stand, P.droop, sm(u, 1.0, 1.8)); if (u >= 3.2) tp = mix(tp, P.show, hug); if (wk > 0 && wk < 1) tp = walk(tp, u * 9, 0.3);
          const teen = Object.assign({ x: lerp(teenX, 430, inOut(wk)), y: F, s: TS, dir: -1, nod: 0.12 * sm(u, 1.0, 1.8) }, tp);
          figRefl(mom, F); figRefl(teen, F); figure(mom); figure(teen);
          glow(440, F - 230, 280, 'rgba(255,220,160,A)', 0.22 * hug);
          bubble(['É TARDE, FILHO.', 'NÃO VAI. EU EXPLICO.'], 560, oy + 120, prog(u, 0.2, 0.5) * (1 - prog(u, 2.2, 2.5)), false, 50, -170);
          bubble(['TÁ. EU ENTENDI.'], 690, oy + 125, prog(u, 2.5, 2.8) * (1 - prog(u, 3.6, 3.9)), false, 54, -40);
          if (u > 4.4) { ga(prog(u, 4.4, 4.9)); spaced('OUVIU "NÃO" E ENTENDEU', 540, oy + 610, 26, { color: AMB }); ga(1); }
        }
      }
      ctx.restore();
    }

    // ---------- som ----------
    cue(0, 'amb'); cue(0.05, 'stomp'); cue(0.45, 'stomp'); cue(0.85, 'stomp'); cue(1.25, 'stomp');
    cue(0.7, 'kneel'); cue(1.9, 'give'); cue(2.5, 'take'); cue(2.4, 'steps'); cue(3.4, 'steps'); cue(3.7, 'warm');
    cue(A2 + 0.3, 'yell'); cue(A2 + 2.4, 'sigh'); cue(A2 + 3.4, 'door'); cue(A2 + 3.4, 'steps'); cue(A2 + 4.1, 'warm');
    cue(T_SKIP + 0.1, 'whoosh'); cue(T_SKIP + 0.2, 'tickstart'); cue(A2 - 0.1, 'tickstop'); cue(T_END + 0.2, 'end');
    function label(s, y, a) { spaced(s, 70, y, 24, { align: 'left', color: MU, a }); }
    function draw(c, t) {
      t = clamp(t, 0, END); ctx = c; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const inA2 = t >= A2 - 0.15;
      const skipDim = sm(t, T_SKIP - 0.2, T_SKIP + 0.2) * (1 - sm(t, A2 - 0.4, A2)), endDim = sm(t, T_END, T_END + 0.6);
      const vis = (1 - skipDim * 0.85) * (1 - endDim);
      PAN.forEach(p => { act(Math.max(0, inA2 ? t - A2 : t), p, p.oy, t, inA2 ? 1 : 0); ga(1); if (vis < 1) { ctx.globalAlpha = 1 - vis; ctx.fillStyle = BG; ctx.fillRect(0, p.oy, W, PH); ctx.globalAlpha = 1; } });
      const la = (1 - skipDim) * (1 - endDim);
      label(inA2 ? 'O FILHO QUE NUNCA OUVIU "NÃO"' : 'MÃE QUE CEDE', PAN[0].oy - 26, la);
      label(inA2 ? 'O FILHO QUE OUVIU "NÃO" E O PORQUÊ' : 'MÃE QUE EXPLICA', PAN[1].oy - 26, la);
      if (t < T_SKIP) { const fo = 1 - sm(t, T_SKIP - 0.4, T_SKIP);
        serif([['O "sim" que evita a briga', false]], 540, 150, 54, fo);
        serif([['tem ', false], ['juros.', true, AMB]], 540, 228, 54, sm(t, 3.6, 4.2) * fo); }
      else if (t < T_END) { serif([['E aos 16, ', false], ['quem manda?', true]], 540, 185, 60, sm(t, A2 - 0.2, A2 + 0.5) * (1 - sm(t, T_END - 0.3, T_END))); }
      if (skipDim > 0) { serif([['10 anos ', false], ['depois', true]], 540, 990, 110, skipDim); }
      if (endDim > 0) { serif([['O "não" que você explica', false]], 540, 800, 52, endDim); serif([['vira o limite que ele ', false], ['leva pra vida.', true, AMB]], 540, 882, 52, sm(t, T_END + 0.5, T_END + 1.1));
        const va = sm(t, T_END + 1.4, T_END + 2.0); ga(va); rr(110, 990, 860, 200, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,194,122,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ga(1);
        serif([['"...o filho entregue a si mesmo', true]], 540, 1040, 40, va); serif([['envergonha a sua mãe."', true]], 540, 1092, 40, va); spaced('PROVÉRBIOS 29:15', 540, 1150, 22, { color: AMB, a: va }); }
    }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
