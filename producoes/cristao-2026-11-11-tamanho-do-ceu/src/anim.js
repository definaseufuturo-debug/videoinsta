/*
 * QUAL O TAMANHO DA CIDADE DO CÉU? — @e_cosdafe, curiosidades e dados. 9:16, narrado (voz 4).
 * Estilo 2D chapado de desenho explicativo: personagens originais (Jesus genérico e duas crianças), cores suaves, sem contorno.
 * Mapa do Brasil: assets/br.json. Fonte: Apocalipse 21 (NVI).
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

  const INK = '#1d2340', GOLD = '#e9b23a', GOLD2 = '#f6d47a', GOLDD = '#c08a1e', CREAM = '#fff7e6', SKY0 = '#8fc8f0', SKY1 = '#fdf0d8';
  const WH = '#ffffff', MU = '#6b7391', RED = '#e2483d', GRN = '#3fae6a', BLUE = '#4a90d9', PEARL = '#f4f1ea';
  const SKIN = '#f2c9a0', SKIN2 = '#d9a77a';

  function create(TL, env) {
    const GEO = env.geo || require('../assets/br.json');
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration, NS = 7;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ---------- primitivas ----------
    const ga = a => { ctx.globalAlpha = clamp(a); };
    const scr = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    function txt(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.font = `${o.w || 800} ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= o.a ?? 1; if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.sc || WH; ctx.strokeText(s, 0, 0); } ctx.fillStyle = o.color || INK; ctx.fillText(s, 0, 0); ctx.restore(); }
    // título "de desenho": texto branco com sombra sólida escura
    function ttl(s, x, y, size, o = {}) { if (o.scale !== undefined && o.scale <= 0.001) return; ctx.save(); ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); ctx.globalAlpha *= o.a ?? 1; ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = INK; ctx.fillStyle = INK; const d = size * 0.07; ctx.strokeText(s, d, d); ctx.fillText(s, d, d); ctx.strokeText(s, 0, 0); ctx.fillStyle = o.color || WH; ctx.fillText(s, 0, 0); ctx.restore(); }
    const tw = (s, size, w = 800) => { ctx.font = `${w} ${size}px Inter`; return ctx.measureText(s).width; };
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function line(pts, w, col, dash) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); }
    function circ(x, y, r, fill, lw = 0, sc = WH) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = sc; ctx.stroke(); } }
    function soft(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    function chip(s, x, y, size, col, k, o = {}) { if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.75; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3)); rr(-w / 2 + 5, -h / 2 + 7, w, h, h / 2); ctx.fillStyle = 'rgba(29,35,64,0.25)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill(); txt(s, 0, 2, size, { w: 900, color: o.tc || WH }); ctx.restore(); ga(1); }
    function card(x, y, w, h, k, col = WH) { if (k <= 0) return false; ctx.save(); ctx.translate(x, y); const s = outBack(k); ctx.scale(s, s); rr(-w / 2 + 6, -h / 2 + 10, w, h, 28); ctx.fillStyle = 'rgba(29,35,64,0.18)'; ctx.fill(); rr(-w / 2, -h / 2, w, h, 28); ctx.fillStyle = col; ctx.fill(); return true; }
    const endCard = () => ctx.restore();
    function sky(t, top = SKY0, bot = SKY1, nocloud) { scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // nuvens chapadas
      if (!nocloud) { ga(0.85); for (let i = 0; i < 4; i++) { const x = ((i * 330 + t * 18) % 1400) - 160, y = 260 + (i % 2) * 220; cloud(x, y, 0.8 + (i % 3) * 0.2); } ga(1); } }
    function cloud(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = WH; [[0, 0, 50], [50, -20, 60], [110, 0, 48], [55, 15, 55]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.fill(); }); ctx.restore(); }
    function header() { rr(300, 104, 480, 58, 29); ctx.fillStyle = 'rgba(29,35,64,0.55)'; ctx.fill(); txt('CURIOSIDADES DA BÍBLIA', 540, 134, 25, { w: 900, color: WH }); }
    function ref(s, y = 1810) { const w = tw(s, 26, 800) + 40; rr(540 - w / 2, y - 22, w, 44, 22); ctx.fillStyle = 'rgba(29,35,64,0.6)'; ctx.fill(); txt(s, 540, y + 1, 26, { w: 800, color: CREAM }); }

    // ---------- personagens 2D (originais) ----------
    // pessoa com os pés em (x,y). kind: 'jesus' | 'boy' | 'girl'. pose: idle | point | wow | cheer | open
    function person(x, y, s, kind, pose, t, o = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
      const bob = Math.sin(t * 3 + (o.ph || 0)) * 3, J = kind === 'jesus';
      const bodyH = J ? 250 : 170, headR = J ? 52 : 50, shirt = o.shirt || (J ? '#f7f3ea' : kind === 'boy' ? '#5bbf8a' : '#9b7be0');
      ctx.translate(0, bob);
      // pernas / pés
      if (J) { ctx.fillStyle = '#8a5a36'; rr(-34, -14, 28, 14, 7); ctx.fill(); rr(6, -14, 28, 14, 7); ctx.fill(); }
      else { ctx.fillStyle = kind === 'boy' ? '#3d5a8c' : '#3d3a6b'; rr(-28, -90, 24, 84, 10); ctx.fill(); rr(4, -90, 24, 84, 10); ctx.fill(); ctx.fillStyle = '#2b2b2b'; rr(-32, -14, 32, 14, 7); ctx.fill(); rr(2, -14, 32, 14, 7); ctx.fill(); }
      // corpo
      const by = J ? -10 : -80, top = by - bodyH + (J ? 0 : 80);
      ctx.fillStyle = shirt;
      if (J) { ctx.beginPath(); ctx.moveTo(-46, top + 20); ctx.quadraticCurveTo(-56, by - 80, -62, by); ctx.lineTo(62, by); ctx.quadraticCurveTo(56, by - 80, 46, top + 20); ctx.quadraticCurveTo(0, top - 6, -46, top + 20); ctx.fill();
        // faixa vermelha diagonal e manto
        ctx.fillStyle = '#c8433a'; ctx.beginPath(); ctx.moveTo(30, top + 14); ctx.lineTo(48, top + 30); ctx.lineTo(-30, by - 90); ctx.lineTo(-46, by - 108); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e8c45a'; rr(-40, by - 130, 80, 10, 5); ctx.fill(); }
      else { rr(-44, top, 88, 110, 30); ctx.fill(); }
      // braços
      const sh = [[-40, top + 30], [40, top + 30]], armCol = shirt, L = J ? 105 : 85;
      const ang = { idle: [[-1.75, -1.4]], point: [[1.75, -0.75]], wow: [[-0.55, -0.3]], cheer: [[-2.5, -0.6]], open: [[-2.3, -0.85]] }[pose] || [[-1.75, -1.4]];
      const aL = pose === 'wow' ? -2.3 : pose === 'cheer' ? -2.5 + Math.sin(t * 8) * 0.15 : pose === 'open' ? -2.6 : pose === 'point' ? -1.8 : -1.8 + Math.sin(t * 2) * 0.05;
      const aR = pose === 'wow' ? -0.85 : pose === 'cheer' ? -0.6 - Math.sin(t * 8) * 0.15 : pose === 'open' ? -0.55 : pose === 'point' ? -0.55 - 0.08 * Math.sin(t * 4) : -1.35 - Math.sin(t * 2) * 0.05;
      [[sh[0], aL], [sh[1], aR]].forEach(([p, a]) => { const ex = p[0] + Math.cos(a) * L, ey = p[1] - Math.sin(-a) * L; line([p, [ex, ey]], J ? 26 : 22, armCol); circ(ex, ey, J ? 14 : 12, SKIN); });
      // pescoço e cabeça
      const hy = top - headR + 6;
      if (J) { ctx.fillStyle = '#6b4226'; ctx.beginPath(); ctx.ellipse(0, hy + 12, headR + 12, headR + 30, 0, Math.PI * 1.0, Math.PI * 2.0); ctx.fill(); rr(-headR - 12, hy, 30, 90, 14); ctx.fill(); rr(headR - 18, hy, 30, 90, 14); ctx.fill();
        if (o.halo) { ctx.beginPath(); ctx.arc(0, hy - 6, headR + 26, 0, TAU); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(233,178,58,0.7)'; ctx.stroke(); } }
      circ(0, hy, headR, SKIN);
      // cabelo
      ctx.fillStyle = J ? '#6b4226' : kind === 'boy' ? '#3b2a20' : '#2a1d17';
      if (J) { ctx.beginPath(); ctx.arc(0, hy - 6, headR + 2, Math.PI * 1.02, Math.PI * 1.98); ctx.fill(); ctx.beginPath(); ctx.moveTo(-34, hy + 18); ctx.quadraticCurveTo(0, hy + 72, 34, hy + 18); ctx.quadraticCurveTo(0, hy + 40, -34, hy + 18); ctx.fill(); }
      else if (kind === 'boy') { ctx.beginPath(); ctx.arc(0, hy - 8, headR + 2, Math.PI * 1.0, Math.PI * 2.0); ctx.fill(); [-30, -8, 14, 34].forEach(dx => { ctx.beginPath(); ctx.arc(dx, hy - headR + 6, 14, 0, TAU); ctx.fill(); }); }
      else { ctx.beginPath(); ctx.arc(0, hy - 6, headR + 3, Math.PI * 0.95, Math.PI * 2.05); ctx.fill(); circ(0, hy - headR - 14, 22, ctx.fillStyle); rr(-headR - 4, hy - 10, 18, 56, 9); ctx.fill(); rr(headR - 14, hy - 10, 18, 56, 9); ctx.fill(); }
      // rosto
      const blink = (Math.sin(t * 1.3 + (o.ph || 0)) > 0.985) ? 0.15 : 1;
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(-17, hy + 2, 6, 8 * blink, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(17, hy + 2, 6, 8 * blink, 0, 0, TAU); ctx.fill();
      if (!J) { circ(-30, hy + 18, 8, 'rgba(240,120,120,0.35)'); circ(30, hy + 18, 8, 'rgba(240,120,120,0.35)'); }
      if (pose === 'wow') { ctx.fillStyle = '#7a2e2e'; ctx.beginPath(); ctx.ellipse(0, hy + 24, 9, 12, 0, 0, TAU); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(0, hy + (J ? 16 : 16), 13, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 5; ctx.strokeStyle = '#7a2e2e'; ctx.stroke(); }
      ctx.restore();
    }
    // personagens no chão: Jesus e duas crianças
    function cast(t, y, s, poses, a = 1) { ga(a); person(250, y, s * 0.82, 'girl', poses[0], t, { ph: 1 }); person(830, y, s * 0.82, 'boy', poses[2], t, { ph: 2, flip: true }); person(540, y, s, 'jesus', poses[1], t, { halo: true }); ga(1); }
    function ground(y, col = '#c9b48a') { ctx.fillStyle = col; ctx.fillRect(0, y, W, H - y); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, y, W, 10); }

    // ---------- mapa do Brasil ----------
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; for (const s of GEO) for (const r of s.p) for (const [x, y] of r) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
    const MR = [60, 300, 960, 1060], MS = Math.min(MR[2] / (bx1 - bx0), MR[3] / (by1 - by0)), MOX = MR[0] + (MR[2] - (bx1 - bx0) * MS) / 2, MOY = MR[1] + (MR[3] - (by1 - by0) * MS) / 2;
    const mp = (lon, ylat) => [MOX + (lon - bx0) * MS, MOY + (ylat - by0) * MS];
    function brMap(a, hl) { ga(a); for (const s of GEO) { ctx.beginPath(); for (const r of s.p) { r.forEach(([x, y], i) => { const [X, Y] = mp(x, y); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); } ctx.fillStyle = hl && hl[s.uf] ? hl[s.uf] : '#7fc29b'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#f3fbf5'; ctx.stroke(); } ga(1); }
    const cent = {}; for (const s of GEO) { const r = s.p.reduce((a, b) => (b.length > a.length ? b : a)); let sx = 0, sy = 0; r.forEach(([x, y]) => { sx += x; sy += y; }); cent[s.uf] = [sx / r.length, sy / r.length]; }

    // ---------- cidade: muro de ouro ----------
    function wallFace(x0, x1, yTop, yBot, shine) { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, GOLDD); g.addColorStop(0.5, GOLD2); g.addColorStop(1, GOLD); ctx.fillStyle = g; ctx.fillRect(x0, yTop, x1 - x0, yBot - yTop);
      ctx.strokeStyle = 'rgba(160,110,20,0.35)'; ctx.lineWidth = 3; const bh = 120, bw = 220; for (let y = yBot, r = 0; y > yTop - bh; y -= bh, r++) { line([[x0, y], [x1, y]], 3, 'rgba(160,110,20,0.35)'); for (let x = x0 + (r % 2) * bw / 2; x < x1; x += bw) line([[x, y], [x, y - bh]], 3, 'rgba(160,110,20,0.35)'); }
      if (shine) { ga(0.35); const sx = lerp(x0 - 200, x1 + 200, shine % 1); ctx.fillStyle = WH; ctx.beginPath(); ctx.moveTo(sx, yTop); ctx.lineTo(sx + 80, yTop); ctx.lineTo(sx - 220, yBot); ctx.lineTo(sx - 300, yBot); ctx.closePath(); ctx.fill(); ga(1); } }

    // ---------- tempos ----------
    const s1 = { seg: wt('c1', 'segundo'), cid: wt('c1', 'cidade'), mil: wt('c1', 'mil'), alt: wt('c1', 'altura'), ima: wt('c1', 'imaginava'), tam: wt('c1', 'tamanho') };
    const s2 = { apo: wt('c2', 'apocalipse'), nov: wt('c2', 'nova'), doz: wt('c2', 'doze'), com: wt('c2', 'comprimento'), lar: wt('c2', 'largura'), alt: wt('c2', 'altura') };
    const s3 = { est: wt('c3', 'estadio'), cen: wt('c3', 'cento'), met: wt('c3', 'metros'), dois: wt('c3', 'dois'), qui: wt('c3', 'quilometros'), lad: wt('c3', 'lado') };
    const s4 = { map: wt('c4', 'mapa'), bra: wt('c4', 'brasil'), rio: wt('c4', 'rio'), bah: wt('c4', 'bahia'), met: wt('c4', 'metade') };
    const s5 = { cim: wt('c5', 'cima'), cin: wt('c5', 'cinco'), est: wt('c5', 'estacao'), qua: wt('c5', 'quatrocentos') };
    const s6 = { rua: wt('c6', 'rua'), our: wt('c6', 'ouro'), vid: wt('c6', 'vidro'), doz: wt('c6', 'doze'), per: wt('c6', 'perolas'), sol: wt('c6', 'sol'), glo: wt('c6', 'gloria'), luz: wt('c6', 'luz') };
    const s7 = { mel: wt('c7', 'melhor'), mor: wt('c7', 'morte'), cho: wt('c7', 'choro'), dor: wt('c7', 'dor'), com: wt('c7', 'comenta'), ame: wt('c7', 'amem'), man: wt('c7', 'manda') };
    cue(0, 'music', { part: 'intro' }); cue(s1.cid, 'whoosh', { dur: 0.5 }); cue(s1.mil, 'riser', { dur: 0.8 }); cue(s1.alt, 'impact', { gain: 0.8 }); cue(s1.ima, 'sparkle');
    cue(B[1], 'music', { part: 'groove' }); cue(s2.apo, 'swoosh'); [s2.com, s2.lar, s2.alt].forEach(x => cue(x, 'pop'));
    cue(s3.cen, 'tick', { dur: 0.5 }); cue(s3.dois, 'riser', { dur: 0.6 }); cue(s3.qui, 'stamp');
    cue(s4.bra, 'whoosh', { dur: 0.4 }); cue(s4.rio, 'pop'); cue(s4.bah, 'pop'); cue(s4.met, 'impact', { gain: 0.6 });
    cue(s5.cim, 'riser', { dur: 0.8 }); cue(s5.cin, 'stamp'); cue(s5.est, 'ding');
    cue(s6.our, 'sparkle'); cue(s6.per, 'pop'); cue(s6.sol, 'swoosh'); cue(s6.luz, 'sparkle');
    cue(B[6], 'music', { part: 'outro' }); [s7.mor, s7.cho, s7.dor].forEach(x => cue(x, 'stamp', { gain: 0.6 })); cue(s7.ame, 'notif'); cue(s7.man, 'plus');
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.5 });

    // ---------- cenas ----------
    function scene1(t) {
      sky(t);
      // câmera desce do topo do muro até o chão
      const pan = sm(t, 0.1, s1.alt + 0.3);
      const GY = lerp(2900, 1440, pan);
      wallFace(160, 920, -400, GY, t * 0.25);
      // bordas laterais da muralha
      ctx.fillStyle = 'rgba(160,110,20,0.25)'; ctx.fillRect(160, -400, 30, GY + 400); ctx.fillRect(890, -400, 30, GY + 400);
      if (GY < H) { ground(GY); cast(t, GY + 10, 0.85, ['wow', 'point', 'wow']); }
      // régua de altura
      const rk = prog(t, s1.mil - 0.3, s1.alt + 0.2); if (rk > 0) { line([[990, GY - 20], [990, lerp(GY - 20, 260, rk)]], 6, INK, [16, 14]); ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(970, lerp(GY - 20, 260, rk) + 10); ctx.lineTo(990, lerp(GY - 20, 260, rk) - 20); ctx.lineTo(1010, lerp(GY - 20, 260, rk) + 10); ctx.fill(); }
      const n = Math.round(2000 * outC(prog(t, s1.mil - 0.2, s1.alt + 0.3)));
      const k = sm(t, s1.mil - 0.3, s1.mil + 0.1, outBack);
      if (k > 0 && card(540, 470, 640, 230, k, INK)) { txt('ALTURA', 0, -62, 34, { w: 900, color: GOLD2 }); txt(`+${n.toLocaleString('pt-BR')} KM`, 0, 24, 96, { w: 900, color: WH }); endCard(); }
      const tk = sm(t, 0.15, 0.6, outBack) * (1 - prog(t, s1.mil - 0.5, s1.mil - 0.25));
      ttl('A CIDADE DO CÉU', 540, 420, 86, { scale: tk }); ttl('SEGUNDO A BÍBLIA', 540, 520, 56, { color: GOLD2, scale: tk });
      chip('VOCÊ IMAGINAVA?', 540, 680, 40, RED, prog(t, s1.ima - 0.2, s1.ima + 0.15));
    }
    function scene2(t) {
      sky(t, '#f7e7c4', '#fdf6e8');
      // livro aberto
      const bk = sm(t, B[1], B[1] + 0.5, outBack);
      if (bk > 0) { ctx.save(); ctx.translate(540, 520); ctx.scale(bk, bk); ctx.fillStyle = '#8a5a36'; rr(-330, -150, 660, 300, 18); ctx.fill(); ctx.fillStyle = CREAM; rr(-315, -140, 305, 270, 10); ctx.fill(); rr(10, -140, 305, 270, 10); ctx.fill(); line([[0, -140], [0, 130]], 6, '#d8c7a0');
        for (let i = 0; i < 6; i++) { line([[-280, -100 + i * 36], [-50, -100 + i * 36]], 8, '#e3d6b8'); line([[50, -100 + i * 36], [280, -100 + i * 36]], 8, '#e3d6b8'); } ctx.restore(); }
      chip('APOCALIPSE 21:16', 540, 330, 40, INK, prog(t, s2.apo - 0.2, s2.apo + 0.15));
      // cubo isométrico
      const ck = sm(t, s2.nov - 0.2, s2.doz + 0.2, outBack);
      if (ck > 0) { ctx.save(); ctx.translate(540, 1080); ctx.scale(ck, ck); const a = 200, c = Math.cos(Math.PI / 6) * a, sh = a / 2;
        ctx.fillStyle = GOLD2; ctx.beginPath(); ctx.moveTo(0, -a); ctx.lineTo(c, -a + sh); ctx.lineTo(0, -a + 2 * sh); ctx.lineTo(-c, -a + sh); ctx.closePath(); ctx.fill();
        ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(-c, -a + sh); ctx.lineTo(0, -a + 2 * sh); ctx.lineTo(0, 2 * sh); ctx.lineTo(-c, sh); ctx.closePath(); ctx.fill();
        ctx.fillStyle = GOLDD; ctx.beginPath(); ctx.moveTo(c, -a + sh); ctx.lineTo(0, -a + 2 * sh); ctx.lineTo(0, 2 * sh); ctx.lineTo(c, sh); ctx.closePath(); ctx.fill();
        const glow = 0.5 + 0.5 * Math.sin(t * 3); soft(0, -40, 320, 'rgba(255,240,190,A)', 0.25 * glow); ctx.restore(); }
      chip('12.000 ESTÁDIOS', 540, 760, 40, GOLDD, prog(t, s2.doz - 0.2, s2.doz + 0.15));
      chip('COMPRIMENTO', 300, 1360, 34, BLUE, prog(t, s2.com - 0.15, s2.com + 0.15));
      chip('LARGURA', 780, 1360, 34, GRN, prog(t, s2.lar - 0.15, s2.lar + 0.15));
      chip('ALTURA', 540, 1450, 34, RED, prog(t, s2.alt - 0.15, s2.alt + 0.15));
      txt('=', 540, 1360, 50, { w: 900, a: prog(t, s2.lar, s2.lar + 0.2) });
      header(); ref('Apocalipse 21:16');
    }
    function scene3(t) {
      sky(t, '#cfe8f7', '#fdf6e8');
      // 1 estádio = pista de corrida simples
      const k1 = sm(t, s3.est - 0.3, s3.est + 0.1, outBack);
      if (k1 > 0 && card(540, 470, 900, 300, k1)) { txt('1 ESTÁDIO', 0, -95, 40, { w: 900, color: MU });
        rr(-360, -30, 720, 90, 45); ctx.fillStyle = '#d98c5f'; ctx.fill(); rr(-330, -10, 660, 50, 25); ctx.fillStyle = '#7fc29b'; ctx.fill();
        const rk = prog(t, s3.cen - 0.2, s3.met); line([[-360, 100], [lerp(-360, 360, rk), 100]], 6, INK); txt('≈ 185 m', 0, 140, 44, { w: 900, color: INK, a: rk }); endCard(); }
      txt('× 12.000', 540, 820, 90, { w: 900, color: INK, a: prog(t, s3.met, s3.met + 0.3) });
      const k2 = sm(t, s3.dois - 0.3, s3.dois + 0.15, outBack);
      if (k2 > 0) { const v = Math.round(2200 * outC(prog(t, s3.dois - 0.2, s3.qui + 0.3))); ttl(`≈ ${v.toLocaleString('pt-BR')} KM`, 540, 1010, 130, { color: GOLD2, scale: k2 }); }
      chip('PRA CADA LADO', 540, 1160, 40, INK, prog(t, s3.lad - 0.2, s3.lad + 0.15));
      ground(1460, '#e3cf9e'); cast(t, 1470, 0.6, ['idle', 'point', 'wow'], prog(t, B[2], B[2] + 0.4));
      header(); ref('Nota da NVI: 12 mil estádios ≈ 2.200 km');
    }
    function scene4(t) {
      sky(t, '#bfe0f3', '#e9f5fb');
      const mk = sm(t, B[3], B[3] + 0.5);
      const hl = {}; if (t > s4.rio - 0.1) hl.RS = '#5aa77c'; if (t > s4.bah - 0.1) hl.BA = '#5aa77c';
      brMap(mk, hl);
      // quadrado de 2.220 km (20° lat x ~23,8° lon) de -31 a -11 de latitude
      const qk = sm(t, s4.bra - 0.1, s4.bah + 0.3);
      if (qk > 0) { const lo0 = -58.5, lo1 = -34.7, la0 = 31.3, la1 = 11.3; const a = mp(lo0, la1), b = mp(lo1, la0); const y1 = lerp(a[1] + (b[1] - a[1]), a[1], 1);
        const top = lerp(b[1], a[1], qk); ga(0.55); ctx.fillStyle = GOLD; ctx.fillRect(a[0], top, b[0] - a[0], b[1] - top); ga(1); ctx.lineWidth = 7; ctx.strokeStyle = GOLDD; ctx.setLineDash([22, 14]); ctx.strokeRect(a[0], top, b[0] - a[0], b[1] - top); ctx.setLineDash([]);
        chip('2.200 KM', (a[0] + b[0]) / 2, b[1] + 50, 32, GOLDD, prog(t, s4.bra, s4.bra + 0.3)); }
      const lab = (uf, nm, tt) => { const c = cent[uf]; if (!c) return; const [x, y] = mp(c[0], c[1]); chip(nm, x + (uf === 'RS' ? -110 : 120), y, 30, INK, prog(t, tt - 0.15, tt + 0.15)); };
      lab('RS', 'RIO GRANDE DO SUL', s4.rio); lab('BA', 'BAHIA', s4.bah);
      const ek = sm(t, s4.met - 0.25, s4.met + 0.15, outBack);
      if (ek > 0 && card(540, 1480, 800, 190, ek, INK)) { txt('MAIS DA METADE', 0, -36, 54, { w: 900, color: GOLD2 }); txt('da área do Brasil (cerca de 58%)', 0, 36, 34, { w: 700, color: WH }); endCard(); }
      header(); ref('Mapa aproximado · IBGE: Brasil tem 8,5 mi km²');
    }
    function scene5(t) {
      // vista lateral com escala real: 1250 px = 2.200 km
      sky(t, '#16244a', '#8fc8f0', true);
      ga(0.7); for (let i = 0; i < 40; i++) circ((i * 263) % W, (i * 137) % 700 + 60, 2 + (i % 3), WH); ga(1);
      const GY = 1500, PX = 1250 / 2200, kk = sm(t, s5.cim - 0.3, s5.cin + 0.4);
      ground(GY, '#6aa66f');
      // torre/cubo dourado subindo
      const hgt = 2200 * PX * kk; const g = ctx.createLinearGradient(330, 0, 760, 0); g.addColorStop(0, GOLDD); g.addColorStop(0.5, GOLD2); g.addColorStop(1, GOLD); ctx.fillStyle = g; ctx.fillRect(330, GY - hgt, 430, hgt);
      if (kk > 0.98) txt('2.200 KM', 545, GY - hgt - 40, 50, { w: 900, color: GOLD2 });
      // Everest minúsculo
      ctx.fillStyle = '#e8eef5'; ctx.beginPath(); ctx.moveTo(110, GY); ctx.lineTo(140, GY - 8848 / 1000 * PX - 3); ctx.lineTo(170, GY); ctx.fill(); txt('Everest', 140, GY + 40, 26, { w: 800, color: WH });
      // Estação Espacial a 400 km
      const ik = prog(t, s5.est - 0.3, s5.est + 0.2), iy = GY - 400 * PX;
      if (ik > 0) { ga(ik); line([[80, iy], [1000, iy]], 3, 'rgba(255,255,255,0.6)', [12, 10]); ctx.save(); ctx.translate(200, iy); ctx.fillStyle = '#c9d4e6'; ctx.fillRect(-20, -10, 40, 20); ctx.fillStyle = '#3a6fb5'; ctx.fillRect(-70, -16, 40, 32); ctx.fillRect(30, -16, 40, 32); ctx.restore(); txt('Estação Espacial', 200, iy - 70, 28, { w: 900, color: WH }); txt('400 km', 200, iy - 38, 28, { w: 900, color: GOLD2 }); ga(1); }
      const ck = sm(t, s5.cin - 0.25, s5.cin + 0.1, outBack);
      if (ck > 0 && card(540, 380, 760, 200, ck, WH)) { txt('MAIS DE', 0, -50, 34, { w: 900, color: MU }); txt('5× MAIS ALTO', 0, 22, 80, { w: 900, color: RED }); endCard(); }
      header(); ref('Escala aproximada · NASA: a Estação orbita a ~400 km');
    }
    function scene6(t) {
      // portão de pérola e rua de ouro, sem sol
      const gk = sm(t, s6.glo - 0.3, s6.luz + 0.3);
      sky(t, lerp(0, 1, gk) > 0.5 ? '#fff4cf' : '#cfe8f7', '#fff9ec');
      soft(540, 640, 900, 'rgba(255,236,170,A)', 0.4 + 0.5 * gk);
      // muro e portão
      wallFace(0, W, 420, 1220, null);
      const pk = sm(t, s6.doz - 0.3, s6.per + 0.2, outBack);
      ctx.save(); ctx.translate(540, 1220); ctx.scale(1, 1); ctx.fillStyle = PEARL; ctx.beginPath(); ctx.moveTo(-220, 0); ctx.lineTo(-220, -420); ctx.arc(0, -420, 220, Math.PI, 0); ctx.lineTo(220, 0); ctx.closePath(); ctx.fill();
      const pg = ctx.createRadialGradient(-60, -500, 20, 0, -400, 300); pg.addColorStop(0, 'rgba(255,255,255,0.9)'); pg.addColorStop(1, 'rgba(210,200,230,0.4)'); ctx.fillStyle = pg; ctx.fill();
      ctx.fillStyle = 'rgba(255,248,220,0.95)'; ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(-150, -380); ctx.arc(0, -380, 150, Math.PI, 0); ctx.lineTo(150, 0); ctx.closePath(); ctx.fill(); ctx.restore();
      // rua de ouro em perspectiva
      const rk = sm(t, s6.rua - 0.3, s6.our + 0.2);
      ctx.fillStyle = '#d8c39a'; ctx.fillRect(0, 1220, W, H - 1220);
      if (rk > 0) { ctx.save(); ctx.beginPath(); ctx.moveTo(390, 1220); ctx.lineTo(690, 1220); ctx.lineTo(lerp(690, 1080, rk), 1920); ctx.lineTo(lerp(390, 0, rk), 1920); ctx.closePath(); const sg = ctx.createLinearGradient(0, 1220, 0, 1920); sg.addColorStop(0, GOLD2); sg.addColorStop(1, GOLD); ctx.fillStyle = sg; ctx.fill(); ctx.clip();
        ga(0.5); const sx = ((t * 0.4) % 1) * 1400 - 200; ctx.fillStyle = WH; ctx.beginPath(); ctx.moveTo(sx, 1220); ctx.lineTo(sx + 60, 1220); ctx.lineTo(sx - 160, 1920); ctx.lineTo(sx - 240, 1920); ctx.fill(); ga(1); ctx.restore(); }
      // 12 pérolas
      for (let i = 0; i < 12; i++) { const k = prog(t, s6.doz - 0.2 + i * 0.05, s6.doz + 0.1 + i * 0.05); if (k <= 0) continue; const x = 100 + i * 80; circ(x, 480, 26 * outBack(k), PEARL); circ(x - 8, 472, 8 * outBack(k), WH); }
      chip('OURO COMO VIDRO', 540, 1500, 36, GOLDD, prog(t, s6.vid - 0.2, s6.vid + 0.15));
      chip('12 PORTAS DE PÉROLA', 540, 580, 36, INK, prog(t, s6.per - 0.2, s6.per + 0.15));
      // sol riscado
      const sk = sm(t, s6.sol - 0.2, s6.sol + 0.2, outBack);
      if (sk > 0) { ctx.save(); ctx.translate(880, 280); ctx.scale(sk, sk); circ(0, 0, 50, '#ffcf4a'); for (let i = 0; i < 8; i++) { const a = i * TAU / 8; line([[Math.cos(a) * 66, Math.sin(a) * 66], [Math.cos(a) * 88, Math.sin(a) * 88]], 10, '#ffcf4a'); } line([[-80, -80], [80, 80]], 16, RED); ctx.restore(); txt('SEM SOL', 880, 400, 32, { w: 900, color: RED, a: sk }); }
      chip('A GLÓRIA DE DEUS É A LUZ', 540, 300, 38, GOLDD, prog(t, s6.glo - 0.2, s6.glo + 0.15));
      header(); ref('Apocalipse 21:21-23');
    }
    function scene7(t) {
      sky(t, '#fdeccc', '#fff8ec');
      soft(540, 900, 700, 'rgba(255,230,160,A)', 0.5);
      const items = [[s7.mor, 'MORTE', 0], [s7.cho, 'CHORO', 1], [s7.dor, 'DOR', 2]];
      items.forEach(([tt, n, i]) => { const x = 210 + i * 330, k = sm(t, tt - 0.25, tt + 0.1, outBack); if (k <= 0) return; ctx.save(); ctx.translate(x, 470); ctx.scale(k, k);
        rr(-140, -130, 280, 260, 30); ctx.fillStyle = WH; ctx.fill();
        if (i === 0) { ctx.fillStyle = '#a7afc2'; ctx.beginPath(); ctx.moveTo(-50, 50); ctx.lineTo(-50, -30); ctx.arc(0, -30, 50, Math.PI, 0); ctx.lineTo(50, 50); ctx.closePath(); ctx.fill(); }
        if (i === 1) { ctx.fillStyle = BLUE; ctx.beginPath(); ctx.moveTo(0, -70); ctx.quadraticCurveTo(50, 0, 0, 50); ctx.quadraticCurveTo(-50, 0, 0, -70); ctx.fill(); }
        if (i === 2) { ctx.save(); ctx.rotate(-0.6); rr(-80, -26, 160, 52, 26); ctx.fillStyle = '#f0c9a0'; ctx.fill(); rr(-28, -26, 56, 52, 8); ctx.fillStyle = '#e6b385'; ctx.fill(); ctx.restore(); }
        const xk = prog(t, tt + 0.1, tt + 0.35); if (xk > 0) { line([[-80, -80], [lerp(-80, 80, xk), lerp(-80, 80, xk)]], 16, RED); }
        txt('SEM ' + n, 0, 100, 32, { w: 900, color: INK }); ctx.restore(); });
      ground(1420, '#e8d7ad'); cast(t, 1430, 0.85, ['cheer', 'open', 'cheer'], prog(t, B[6], B[6] + 0.4));
      const ak = sm(t, s7.com - 0.2, s7.ame + 0.1, outBack);
      if (ak > 0 && card(540, 820, 700, 180, ak, GOLD)) { txt('COMENTA', 0, -40, 36, { w: 900, color: INK }); txt('AMÉM', 0, 26, 92, { w: 900, color: WH, stroke: 10, sc: GOLDD }); endCard(); }
      chip('MANDA PRA QUEM PRECISA VER', 540, 1000, 36, INK, prog(t, s7.man - 0.2, s7.man + 0.15));
      header(); ref('Apocalipse 21:4');
    }

    // ---------- legendas ----------
    const HL = new Set(['ceu', 'mil', 'altura', 'tamanho', 'apocalipse', 'doze', 'estadios', 'comprimento', 'largura', 'cento', 'oitenta', 'metros', 'quilometros', 'lado', 'brasil', 'rio', 'sul', 'bahia', 'metade', 'cinco', 'estacao', 'espacial', 'quatrocentos', 'ouro', 'vidro', 'perolas', 'sol', 'gloria', 'luz', 'morte', 'choro', 'dor', 'amem', 'manda']);
    const groups = []; { let cur = []; const flush = () => { if (cur.length) groups.push(cur); cur = []; };
      for (const w of TL.words) { if (cur.length && (cur[0].clip !== w.clip || cur.length >= 4 || (cur.map(x => x.text).join(' ') + ' ' + w.text).length > 22)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.text)) flush(); } flush();
      groups.forEach((g, i) => { g.t0 = g[0].start - 0.05; const nx = groups[i + 1]; g.t1 = nx && nx[0].clip === g[0].clip ? nx[0].start - 0.05 : g[g.length - 1].end + 0.25; }); }
    function captions(t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; scr(); const size = 66; const a = prog(t, g.t0, g.t0 + 0.1), pop = 0.85 + 0.15 * outBack(prog(t, g.t0, g.t0 + 0.15));
      const text = g.map(w => w.text.toUpperCase()).join(' '), total = tw(text, size, 900), sc = Math.min(1, 980 / total) * pop; ctx.save(); ctx.translate(540, 1690); ctx.scale(sc, sc); ctx.globalAlpha = a; let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = `900 ${size}px Inter`; ctx.lineWidth = 11; ctx.strokeStyle = INK; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? GOLD2 : WH) : 'rgba(255,255,255,0.65)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1; }

    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
    function draw(c, t) { t = clamp(t, 0, END); ctx = c; scr(); ctx.globalAlpha = 1;
      let i = 0; for (let k = 1; k < NS; k++) if (t >= B[k]) i = k;
      ctx.save(); sceneFns[i](t); ctx.restore(); scr(); ctx.globalAlpha = 1;
      let fl = 0; for (let k = 1; k < NS; k++) fl = Math.max(fl, 1 - Math.abs(t - B[k]) / 0.15); if (fl > 0) { ctx.globalAlpha = fl * 0.9; ctx.fillStyle = CREAM; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      captions(t); }
    cues.sort((a, b) => a.t - b.t);
    return { draw, duration: END, cues, scenes: [], width: W, height: H, fps: 30 };
  }
  return { create };
});
