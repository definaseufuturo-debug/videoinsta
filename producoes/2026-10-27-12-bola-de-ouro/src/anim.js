/*
 * BOLA DE OURO 2026 — Kane em números, 25 anos, como é a votação, pódio, explicador animado, 9:16 (1080x1920)
 * Conteúdo educativo e neutro: cores neutras (laranja / turquesa), sem fotos nem símbolos de partido.
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
  const inC = t => clamp(t) ** 3;
  const outBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const sm = (t, a, b, e = inOut) => e(prog(t, a, b));
  const pulse = (t, t0, rise = 0.08, decay = 0.5) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / decay));
  function kf(t, keys, e = inOut) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e(clamp((t - t0) / (t1 - t0))); return lerp(a, b, u); } return keys[keys.length - 1][1]; }
  function mulberry(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const normWord = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const pct = (v, d = 2) => v.toFixed(d).replace('.', ',') + '%';
  const milhar = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  function create(TL, env) {
    const mk = env.createCanvas;
    let ctx = null;
    const clip = id => TL.clips.find(c => c.id === id);
    function wt(cid, w, occ = 0) { const n = normWord(w); let k = 0; for (const x of TL.words) if (x.clip === cid && x.norm.startsWith(n)) { if (k === occ) return x.start; k++; } throw new Error('palavra não encontrada: ' + cid + ':' + w); }
    const END = TL.duration;
    const NS = 6;
    const B = [0]; for (let k = 2; k <= NS; k++) B.push(clip('c' + k).start - 0.35); B.push(END);
    const NAMES = ['Gancho: 61 gols em 51 jogos', 'Primeiro inglês desde 2001', 'Quem vota: 100 países', 'Temporada: títulos', 'Pódio + Vini 17º', 'CTA: o que achou'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ------------------------------------------------ paleta (neutra)
    const BG0 = '#061419', BG1 = '#0e2830', GRID = 'rgba(120,220,220,0.07)', INK = '#08161b';
    const OR = '#ff9f1c', TE = '#2ec4b6', WH = '#f4f6fb', MU = '#8a94b3', Y = '#ffd166', RED = '#ff4d5e';

    // ------------------------------------------------ texturas
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
    function rtxt(s, x, y, size, o = {}) { // título com contorno + sombra sólida
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
    function chip(s, x, y, size, col, k, o = {}) { // etiqueta arredondada que "salta"
      if (k <= 0) return; const sc = outBack(k), w = tw(s, size, 900) + size * 1.1, h = size * 1.7;
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1));
      rr(-w / 2 + 8, -h / 2 + 8, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
      rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || col; ctx.fill();
      txt(s, 0, 2, size, { w: 900, color: o.tc || INK }); ctx.restore(); ga(1);
    }
    function stampMark(x, y, s, k, o = {}) { // carimbo que cai
      if (k <= 0) return; const sc = lerp(2.4, 1, outC(k)) * (o.s || 1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(sc, sc); ga(clamp(k * 3));
      const size = o.size || 84, w = tw(s, size, 900) + 70, h = size * 1.45, col = o.col || RED;
      rr(-w / 2, -h / 2, w, h, 16); ctx.fillStyle = 'rgba(11,16,32,0.85)'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.stroke();
      rr(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); ctx.lineWidth = 4; ctx.stroke();
      txt(s, 0, 4, size, { w: 900, color: col });
      ctx.restore(); ga(1);
    }
    function bg(t, tint) { // fundo de "telão": gradiente + grade que desliza
      scr(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG1); g.addColorStop(1, BG0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (tint) soft(W / 2, H * 0.42, 900, tint, 0.16);
      const off = (t * 30) % 90; ctx.lineWidth = 2; ctx.strokeStyle = GRID;
      for (let x = -90 + off; x < W + 90; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = -90 + off; y < H + 90; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
    function header(t) { // selo fixo no topo
      ga(0.85); rr(290, 120, 500, 64, 32); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
      txt('EM ALTA • EM NÚMEROS', 540, 153, 28, { w: 800, color: MU }); ga(1);
    }
    const GOLD = '#ffc94a', GOLDD = '#c98a12', PITCH = '#1f6b3a', SHIRT = '#e8ecf4', SHIRT2 = '#5b6b8c';

    // ------------------------------------------------ desenhos próprios (genéricos)
    function goldBall(x, y, s, t, o = {}) { // troféu genérico: esfera dourada sobre pedestal
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      if (o.glow) soft(0, -40, 380, 'rgba(255,201,74,A)', 0.5 * o.glow);
      ctx.beginPath(); ctx.moveTo(-70, 120); ctx.lineTo(70, 120); ctx.lineTo(40, 60); ctx.lineTo(-40, 60); ctx.closePath(); ctx.fillStyle = GOLDD; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      rr(-110, 120, 220, 60, 12); ctx.fillStyle = '#2b2f3a'; ctx.fill(); ctx.stroke();
      const g = ctx.createRadialGradient(-40, -90, 10, 0, -40, 130); g.addColorStop(0, '#fff3c4'); g.addColorStop(0.5, GOLD); g.addColorStop(1, GOLDD);
      circ(0, -40, 110, null); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(0, -40, 110, 0, TAU); ctx.clip(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(150,95,10,0.6)';
      const r0 = t * 0.6; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(0, -40, Math.abs(Math.cos(r0 + i * 0.6)) * 110, 110, 0, 0, TAU); ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(0, -40, 110, 36, 0, 0, TAU); ctx.stroke(); ctx.restore();
      ctx.restore();
    }
    function player(x, y, s, o = {}) { // silhueta genérica, sem rosto, camisa 9
      if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ga((o.a ?? 1) * ctx.globalAlpha);
      ctx.fillStyle = '#20283a'; rr(-62, 120, 52, 170, 22); ctx.fill(); rr(10, 120, 52, 170, 22); ctx.fill();
      rr(-70, 100, 140, 70, 18); ctx.fillStyle = '#2b3550'; ctx.fill();
      rr(-95, -60, 190, 190, 40); ctx.fillStyle = o.shirt || SHIRT; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
      ctx.save(); ctx.rotate(-0.5); rr(-150, -70, 60, 150, 26); ctx.fillStyle = o.shirt || SHIRT; ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.rotate(o.armUp ? -2.4 : 0.5); rr(90, -70, 60, 150, 26); ctx.fillStyle = o.shirt || SHIRT; ctx.fill(); ctx.stroke(); ctx.restore();
      txt('9', 0, 30, 100, { w: 900, color: SHIRT2 });
      circ(0, -120, 62, '#3a4458', 7, INK);
      ga(1); ctx.restore();
    }
    function counter(v0, v1, k) { return Math.round(lerp(v0, v1, outC(k))); }

    // ================= CENA 1 — GANCHO =================
    const s1 = { ses: wt('c1', 'sessenta'), gol: wt('c1', 'gols'), cin: wt('c1', 'cinquenta'), jog: wt('c1', 'jogos'), har: wt('c1', 'harry'), kan: wt('c1', 'kane'), gan: wt('c1', 'ganhou'), bol: wt('c1', 'bola'), our: wt('c1', 'ouro') };
    cue(0, 'music', { part: 'intro' }); cue(s1.ses, 'roll', { dur: s1.gol - s1.ses + 0.2 }); cue(s1.gol, 'impact', { gain: 0.7 }); cue(s1.cin, 'tick', { dur: 0.5 }); cue(s1.jog, 'stamp'); cue(s1.kan, 'pop'); cue(s1.bol, 'reveal'); cue(s1.our, 'music', { part: 'groove' }); cue(s1.our, 'confetti');
    function scene1(t) {
      bg(t, 'rgba(255,201,74,A)'); header(t);
      const gk = prog(t, s1.ses - 0.1, s1.gol + 0.1), up = sm(t, s1.har - 0.3, s1.kan);
      ctx.save(); ctx.translate(0, -up * 60);
      if (gk > 0) { rtxt(String(counter(0, 61, gk)), 540, 420, 260, { color: GOLD, sh: '#000', scale: outBack(prog(t, s1.ses - 0.1, s1.ses + 0.2)) }); txt('GOLS', 540, 590, 64, { w: 900, color: WH, a: prog(t, s1.gol - 0.1, s1.gol + 0.15) }); }
      const jk = prog(t, s1.cin - 0.1, s1.jog);
      if (jk > 0) chip('EM ' + counter(0, 51, jk) + ' JOGOS', 540, 690, 48, WH, prog(t, s1.cin - 0.15, s1.cin + 0.1));
      ctx.restore();
      chip('HARRY KANE', 540, 760, 60, GOLD, prog(t, s1.har - 0.15, s1.kan + 0.05));
      const bk = sm(t, s1.gan - 0.3, s1.bol + 0.1, outBack), b0 = sm(t, 0.1, 0.6, outBack);
      goldBall(540, 1110, lerp(0.55 * b0, 1.25, bk), t, { glow: prog(t, s1.bol, s1.our + 0.4) });
      rtxt('BOLA DE OURO', 540, 1420, 84, { color: GOLD, sh: '#000', scale: sm(t, s1.bol - 0.15, s1.our, outBack) });
      if (t > s1.our) { const R = mulberry(5); for (let i = 0; i < 50; i++) { const k = (t - s1.our) * (0.5 + R() * 0.8); const x = 540 + (R() - 0.5) * 1000 * Math.min(1, k * 1.5), y = 400 + k * 900 * (0.5 + R()); if (y < 1500) { ctx.save(); ctx.translate(x, y); ctx.rotate(k * 8 + i); ctx.fillStyle = [GOLD, WH, TE][i % 3]; ctx.fillRect(-9, -5, 18, 10); ctx.restore(); } } }
    }

    // ================= CENA 2 — 25 anos =================
    const s2 = { pri: wt('c2', 'primeiro'), ing: wt('c2', 'ingles'), mic: wt('c2', 'michael'), dmil: wt('c2', 'dois'), vin: wt('c2', 'vinte'), ano: wt('c2', 'anos'), esp: wt('c2', 'espera') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.ing, 'pop'); cue(s2.dmil, 'card'); cue(s2.vin, 'roll', { dur: s2.ano - s2.vin + 0.3 }); cue(s2.esp, 'bell');
    function scene2(t) {
      bg(t, 'rgba(46,196,182,A)'); header(t);
      rtxt('PRIMEIRO INGLÊS', 540, 300, 82, { color: WH, sh: '#000', scale: sm(t, s2.pri - 0.2, s2.ing + 0.1, outBack) });
      txt('A GANHAR DESDE...', 540, 400, 40, { w: 900, color: MU, a: prog(t, s2.ing, s2.ing + 0.3) });
      // linha do tempo 2001 -> 2026
      const x0 = 160, x1 = 920, y = 760, lk = sm(t, s2.dmil - 0.2, s2.vin + 0.6);
      line([[x0, y], [x1, y]], 10, 'rgba(255,255,255,0.15)');
      if (lk > 0) line([[x0, y], [lerp(x0, x1, lk), y]], 10, GOLD);
      const ak = sm(t, s2.pri - 0.2, s2.ing, outBack);
      if (ak > 0) { circ(x0, y, 26 * ak, WH, 6, INK); txt('2001', x0, y + 80, 52, { w: 900, color: WH, a: ak }); txt('MICHAEL OWEN', x0 + 40, y - 80, 36, { w: 900, color: MU, a: ak }); }
      for (let yr = 2002; yr < 2026; yr++) { const k = prog(t, lerp(s2.dmil, s2.ano, (yr - 2001) / 25) - 0.05, lerp(s2.dmil, s2.ano, (yr - 2001) / 25) + 0.1); if (k > 0) circ(lerp(x0, x1, (yr - 2001) / 25), y, 7 * k, 'rgba(255,255,255,0.6)'); }
      const bk = prog(t, s2.ano - 0.2, s2.ano + 0.2);
      if (bk > 0) { circ(x1, y, 30 * outBack(bk), GOLD, 6, INK); txt('2026', x1, y + 80, 52, { w: 900, color: GOLD, a: bk }); txt('KANE', x1 - 20, y - 80, 36, { w: 900, color: GOLD, a: bk }); }
      const ck = prog(t, s2.vin - 0.1, s2.ano + 0.1);
      if (ck > 0) { rtxt(String(counter(0, 25, ck)), 370, 1120, 230, { color: GOLD, sh: '#000', scale: outBack(prog(t, s2.vin - 0.1, s2.vin + 0.2)) }); txt('ANOS', 560, 1090, 80, { w: 900, color: WH, a: ck, align: 'left' }); txt('DE ESPERA', 560, 1170, 46, { align: 'left', w: 900, color: MU, a: prog(t, s2.esp - 0.2, s2.esp + 0.1) }); }
    }

    // ================= CENA 3 — quem vota =================
    const s3 = { que: wt('c3', 'quem'), esc: wt('c3', 'escolhe'), jor: wt('c3', 'jornalistas'), cem: wt('c3', 'cem'), pai: wt('c3', 'paises'), ran: wt('c3', 'ranking'), fif: wt('c3', 'fifa'), lis: wt('c3', 'lista'), pon: wt('c3', 'pontos'), som: wt('c3', 'somados') };
    cue(B[2], 'music', { part: 'groove' }); cue(s3.que, 'whoosh', { dur: 0.4 }); cue(s3.jor, 'type', { n: 8, rate: 14 }); for (let i = 0; i < 5; i++) cue(s3.cem + i * 0.1, 'pop', { gain: 0.4 }); cue(s3.ran, 'ding'); cue(s3.lis, 'card'); cue(s3.pon, 'plus'); cue(s3.som, 'coin');
    function scene3(t) {
      bg(t, 'rgba(46,196,182,A)'); header(t);
      rtxt('QUEM ESCOLHE?', 540, 290, 90, { color: WH, sh: '#000', scale: sm(t, s3.que - 0.2, s3.esc, outBack) });
      // grade de 100 pontos = 100 países
      const sw = sm(t, s3.lis - 0.4, s3.lis);
      if (sw < 1) { ga(1 - sw);
        for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), c = i % 10, k = prog(t, s3.cem - 0.2 + i * 0.012, s3.cem + i * 0.012); const x = 225 + c * 70, y = 470 + r * 70; if (k <= 0) { circ(x, y, 18, 'rgba(255,255,255,0.08)'); continue; } circ(x, y, 24 * outBack(k), i < 100 ? TE : MU); if (prog(t, s3.ran, s3.fif) > 0) { ga((1 - sw) * prog(t, s3.ran - 0.1, s3.fif)); circ(x, y, 9, WH); ga(1 - sw); } }
        chip('JORNALISTAS DE 100 PAÍSES', 540, 1230, 46, TE, prog(t, s3.jor - 0.2, s3.pai));
        txt('OS PRIMEIROS DO RANKING DA FIFA', 540, 1330, 38, { w: 900, color: WH, a: prog(t, s3.ran - 0.2, s3.fif) });
        ga(1); }
      if (sw > 0) { ga(sw);
        // três cédulas + soma
        for (let j = 0; j < 3; j++) { const k = prog(t, s3.lis - 0.2 + j * 0.15, s3.lis + 0.2 + j * 0.15); if (k <= 0) continue; ctx.save(); ctx.translate(250 + j * 290, 640); ctx.rotate((j - 1) * 0.06); ctx.scale(outBack(k), outBack(k)); rr(-120, -170, 240, 340, 20); ctx.fillStyle = WH; ctx.fill(); for (let n = 0; n < 5; n++) { txt((n + 1) + '.', -80, -110 + n * 60, 32, { w: 900, color: INK }); rr(-50, -124 + n * 60, 140 - n * 12, 26, 13); ctx.fillStyle = n === 0 ? GOLD : '#c7ccd8'; ctx.fill(); } ctx.restore(); }
        const pk = sm(t, s3.pon - 0.2, s3.som + 0.4);
        txt('Σ', 540, 920, 110, { w: 900, color: GOLD, a: prog(t, s3.pon - 0.2, s3.pon + 0.1) });
        for (let i = 0; i < 3; i++) { const w = [600, 470, 400][i] * pk; if (w <= 1) continue; rr(260, 1030 + i * 95, w, 64, 32); ctx.fillStyle = i === 0 ? GOLD : 'rgba(255,255,255,0.3)'; ctx.fill(); txt((i + 1) + 'º', 210, 1062 + i * 95, 40, { w: 900, color: i === 0 ? GOLD : WH }); }
        chip('PONTOS SOMADOS', 540, 1380, 44, GOLD, prog(t, s3.som - 0.2, s3.som + 0.1));
        ga(1); }
    }

    // ================= CENA 4 — temporada =================
    const s4 = { tem: wt('c4', 'temporada'), cam: wt('c4', 'campeao'), ale: wt('c4', 'alemao'), cop: wt('c4', 'copa'), art: wt('c4', 'artilheiro'), ter: wt('c4', 'terceira'), seg: wt('c4', 'seguida') };
    cue(B[3], 'music', { part: 'safe' }); cue(s4.ale, 'success'); cue(s4.cop, 'success'); cue(s4.art, 'success'); for (let i = 0; i < 3; i++) cue(s4.ter + i * 0.18, 'coin', { gain: 0.6 });
    function scene4(t) {
      bg(t, 'rgba(255,201,74,A)'); header(t);
      rtxt('A TEMPORADA', 540, 290, 84, { color: WH, sh: '#000', scale: sm(t, s4.tem - 0.3, s4.tem + 0.1, outBack) });
      txt('2025-26 • BAYERN', 540, 385, 38, { w: 900, color: MU, a: prog(t, s4.tem, s4.tem + 0.3) });
      player(540, 760, sm(t, B[3], B[3] + 0.5, outBack) * 1.1, { armUp: t > s4.ale });
      const items = [['CAMPEÃO ALEMÃO', s4.ale], ['COPA DA ALEMANHA', s4.cop], ['ARTILHEIRO DA LIGA', s4.art]];
      items.forEach(([s, w], i) => { const k = prog(t, w - 0.25, w + 0.1); if (k <= 0) return; const y = 1080 + i * 110; ctx.save(); ctx.translate(lerp(-300, 0, outC(k)), 0); rr(150, y - 44, 780, 88, 44); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill(); circ(205, y, 30, GOLD); txt('✓', 205, y + 2, 38, { w: 900, color: INK }); txt(s, 260, y + 2, 44, { w: 900, color: WH, align: 'left' }); ctx.restore(); });
      for (let i = 0; i < 3; i++) { const k = prog(t, s4.ter + i * 0.18 - 0.1, s4.ter + i * 0.18 + 0.15); if (k > 0) chip((i + 1) + 'ª', 720 + i * 90, 1430, 40, GOLD, k); }
      txt('3ª VEZ SEGUIDA', 400, 1430, 42, { w: 900, color: GOLD, a: prog(t, s4.seg - 0.2, s4.seg + 0.1) });
    }

    // ================= CENA 5 — pódio =================
    const s5 = { pod: wt('c5', 'podio'), kan: wt('c5', 'kane'), mba: wt('c5', 'mbappe'), lam: wt('c5', 'lamine'), mel: wt('c5', 'melhor'), bra: wt('c5', 'brasileiro'), vin: wt('c5', 'vini'), so: wt('c5', 'so'), dec: wt('c5', 'decimo'), set: wt('c5', 'setimo') };
    cue(B[4], 'music', { part: 'stop' }); cue(s5.kan, 'impact', { gain: 0.6 }); cue(s5.mba, 'pop'); cue(s5.lam, 'pop'); cue(s5.bra, 'swoosh'); cue(s5.bra, 'music', { part: 'drop' }); cue(s5.set, 'minus');
    function scene5(t) {
      bg(t, 'rgba(255,201,74,A)'); header(t);
      rtxt('O PÓDIO', 540, 290, 90, { color: WH, sh: '#000', scale: sm(t, s5.pod - 0.3, s5.pod + 0.1, outBack) });
      const P = [[540, 1, 'KANE', s5.kan, 330, GOLD], [250, 2, 'MBAPPÉ', s5.mba, 240, '#cfd6e4'], [830, 3, 'YAMAL', s5.lam, 180, '#d99a5b']];
      for (const [x, n, name, w, h, col] of P) { const k = sm(t, w - 0.3, w + 0.1, outBack); if (k <= 0) continue; const top = 1080 - h * k; rr(x - 130, top, 260, 1080 - top, 16); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); txt(n + 'º', x, top + 70, 80, { w: 900, color: INK, a: k }); player(x, top - 200, 0.6 * k, { shirt: n === 1 ? GOLD : SHIRT, armUp: n === 1 }); txt(name, x, top + 150, 40, { w: 900, color: INK, a: k > 0.8 ? 1 : 0 }); }
      line([[60, 1080], [1020, 1080]], 8, 'rgba(255,255,255,0.4)');
      const vk = sm(t, s5.vin - 0.3, s5.vin + 0.1, outBack);
      if (vk > 0) { ctx.save(); ctx.translate(540, 1290); ctx.scale(vk, vk); rr(-380, -110, 760, 220, 36); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#3ccf7a'; ctx.stroke(); txt('MELHOR BRASILEIRO', -120, -55, 32, { w: 900, color: '#3ccf7a' }); txt('VINI JR.', -120, 20, 70, { w: 900, color: WH }); rtxt(t > s5.dec ? '17º' : '?', 240, 0, 120, { color: RED, sh: '#000', scale: t > s5.dec ? outBack(prog(t, s5.dec - 0.05, s5.set + 0.1)) : 1 }); ctx.restore(); }
    }

    // ================= CENA 6 — CTA =================
    const s6 = { voc: wt('c6', 'voce'), ach: wt('c6', 'achou'), mer: wt('c6', 'merecido'), com: wt('c6', 'comenta'), seg: wt('c6', 'segue'), fut: wt('c6', 'futebol'), num: wt('c6', 'numeros') };
    cue(B[5], 'music', { part: 'outro' }); cue(s6.ach, 'pop'); cue(s6.mer, 'card'); cue(s6.com, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t) {
      bg(t, 'rgba(255,201,74,A)'); header(t);
      rtxt('O QUE VOCÊ', 540, 310, 92, { color: WH, sh: '#000', scale: sm(t, s6.voc - 0.2, s6.voc + 0.15, outBack) });
      rtxt('ACHOU?', 540, 430, 120, { color: GOLD, sh: '#000', scale: sm(t, s6.ach - 0.25, s6.ach + 0.05, outBack) });
      goldBall(540, 760, 0.85 * sm(t, B[5], B[5] + 0.5, outBack), t, { glow: 0.6 });
      [['MERECIDO ✓', '#3ccf7a'], ['NÃO MERECIA ×', RED]].forEach(([m, c], i) => { const k = prog(t, s6.mer - 0.2 + i * 0.2, s6.mer + 0.1 + i * 0.2); if (k <= 0) return; ctx.save(); ctx.translate([300, 780][i], 1010); ctx.scale(outBack(k), outBack(k)); rr(-215, -50, 430, 100, 40); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = c; ctx.stroke(); txt(m, 0, 2, 38, { w: 900, color: INK }); ctx.restore(); });
      chip('COMENTA', 540, 1140, 44, Y, prog(t, s6.com - 0.15, s6.com + 0.1));
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1310); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(255,201,74,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : GOLD; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
      txt('FUTEBOL EXPLICADO EM NÚMEROS', 540, 1440, 34, { w: 900, color: WH, a: prog(t, s6.fut - 0.2, s6.num) });
    }

    // ================= legendas =================
    const HL = new Set(['sessenta', 'um', 'gols', 'cinquenta', 'jogos', 'harry', 'kane', 'bola', 'ouro', 'primeiro', 'ingles', 'owen', 'dois', 'vinte', 'cinco', 'anos', 'espera', 'escolhe', 'jornalistas', 'cem', 'paises', 'fifa', 'lista', 'pontos', 'somados', 'campeao', 'alemao', 'copa', 'alemanha', 'artilheiro', 'terceira', 'podio', 'mbappe', 'lamine', 'yamal', 'brasileiro', 'vini', 'decimo', 'setimo', 'achou', 'merecido', 'comenta', 'segue', 'futebol', 'numeros']);
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
      ctx.save(); ctx.translate(540, 1590); ctx.scale(sc, sc); ctx.globalAlpha = a;
      let x = -total / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (const w of g) { const s = w.text.toUpperCase() + ' ', ww = tw(s, size, 900), said = t >= w.start - 0.02, hl = HL.has(w.norm); ctx.font = font; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, x, 0); ctx.fillStyle = said ? (hl ? Y : '#ffffff') : 'rgba(255,255,255,0.6)'; ctx.fillText(s, x, 0); x += ww; }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // ================= composição =================
    const sceneFns = [scene1, scene2, scene3, scene4, scene5, scene6];
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
      txt('fontes: CNN Brasil • Itatiaia • desenhos genéricos', 540, 1840, 26, { w: 600, color: 'rgba(255,255,255,0.45)' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
