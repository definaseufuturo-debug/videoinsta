/*
 * LUA DO CAÇADOR — por que fica cheia, origem do nome, nascer da lua, ilusão, explicador animado, 9:16 (1080x1920)
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
    const NAMES = ['Gancho: Lua do Caçador, não é superlua', 'Por que fica cheia + horário', 'Origem do nome (hemisfério norte)', 'Nasce só 30 min mais tarde', 'Ilusão do horizonte', 'CTA: superlua 24/11'];
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
      txt('EM ALTA • COMO FUNCIONA', 540, 153, 28, { w: 800, color: MU }); ga(1);
    }
    const MOONC = '#f3ecd2', MOOND = '#c9bf9e', SUNC = '#ffb627', EAR = '#3fa9f5', FIELD = '#1c3a2a', STUB = '#c9a24a', SKYN = '#0b1b3a';

    // ------------------------------------------------ desenhos próprios
    const RS = mulberry(99); const STARS = Array.from({ length: 140 }, () => [RS() * W, RS() * H * 0.8, 0.8 + RS() * 2.6, RS() * TAU]);
    function stars(t, a = 1) { if (a <= 0) return; for (const [x, y, r, ph] of STARS) { ga(a * (0.35 + 0.35 * Math.sin(t * 2 + ph))); circ(x, y, r, WH); } ga(1); }
    // lua cheia com crateras; lit = fração iluminada (0..1, crescente pela direita)
    function moonDisk(x, y, r, o = {}) {
      if (r <= 0.5) return;
      if (o.glow) soft(x, y, r * 2.6, 'rgba(255,240,200,A)', 0.45 * o.glow);
      ctx.save(); circ(x, y, r, MOONC);
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
      for (const [dx, dy, rr0] of [[-0.35, -0.3, 0.22], [0.25, -0.1, 0.16], [-0.1, 0.35, 0.18], [0.42, 0.35, 0.1], [-0.5, 0.15, 0.09], [0.05, -0.55, 0.1]]) circ(x + dx * r, y + dy * r, rr0 * r, MOOND);
      const lit = o.lit ?? 1;
      if (lit < 1) { // sombra: lado esquerdo escuro com terminador elíptico
        ctx.fillStyle = 'rgba(8,14,30,0.92)'; ctx.beginPath();
        const k = 1 - 2 * lit; // 1 = nova, -1 = cheia
        ctx.arc(x, y, r + 1, Math.PI / 2, -Math.PI / 2, false);
        ctx.ellipse(x, y, Math.abs(k) * r + 0.01, r + 1, 0, -Math.PI / 2, Math.PI / 2, k < 0);
        ctx.fill();
      }
      ctx.restore();
      ctx.lineWidth = o.lw ?? 0; if (o.lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.strokeStyle = INK; ctx.stroke(); }
    }
    function sun(x, y, r, t) { soft(x, y, r * 2.4, 'rgba(255,182,39,A)', 0.55); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * 0.4; line([[x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 1.2], [x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5]], 10, SUNC); } circ(x, y, r, SUNC, 7, INK); }
    function earth(x, y, r) { circ(x, y, r, EAR, 6, INK); ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip(); ctx.fillStyle = '#3ccf7a'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.2, r * 0.35, r * 0.5, 0.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + r * 0.4, y + r * 0.35, r * 0.3, r * 0.25, -0.3, 0, TAU); ctx.fill(); ctx.restore(); }
    function horizon(y, col = '#0a1424') { ctx.beginPath(); ctx.moveTo(0, y + 30); for (let x = 0; x <= W; x += 60) ctx.lineTo(x, y + Math.sin(x * 0.011) * 26 + Math.sin(x * 0.03) * 10); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
    function tree(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#071019'; ctx.fillRect(-8, -40, 16, 40); ctx.beginPath(); ctx.moveTo(-60, -40); ctx.lineTo(0, -200); ctx.lineTo(60, -40); ctx.closePath(); ctx.fill(); ctx.restore(); }

    // ================= CENA 1 — GANCHO =================
    const s1 = { lua: wt('c1', 'lua'), sem: wt('c1', 'semana'), nom: wt('c1', 'nome'), cac: wt('c1', 'cacador'), mas: wt('c1', 'mas'), sup: wt('c1', 'superlua') };
    cue(0, 'music', { part: 'intro' }); cue(s1.lua, 'riser', { dur: 0.6 }); cue(s1.nom, 'pop'); cue(s1.cac, 'reveal'); cue(s1.cac, 'music', { part: 'groove' }); cue(s1.mas, 'scratch'); cue(s1.sup, 'stamp');
    function scene1(t) {
      bg(t); ctx.fillStyle = 'rgba(11,27,58,0.55)'; ctx.fillRect(0, 0, W, H); stars(t, sm(t, 0, 0.6)); header(t);
      const mk = sm(t, 0.0, 0.7, outC), shrink = sm(t, s1.mas - 0.2, s1.mas + 0.3);
      const mr = lerp(60, 300, mk) * lerp(1, 0.72, shrink);
      moonDisk(540, lerp(1300, 880, mk) - shrink * 40, mr, { glow: mk });
      horizon(1380);
      for (const [x, s] of [[90, 1.1], [190, 0.8], [900, 1.2], [1000, 0.9]]) tree(x, 1400, s);
      rtxt('LUA DO', 540, 300, 84, { color: WH, sh: '#000', scale: sm(t, s1.nom - 0.1, s1.nom + 0.25, outBack) });
      rtxt('CAÇADOR', 540, 410, 120, { color: Y, sh: '#000', scale: sm(t, s1.cac - 0.25, s1.cac + 0.1, outBack) });
      chip('LUA CHEIA DE OUTUBRO', 540, 530, 40, WH, prog(t, s1.sem - 0.2, s1.sem + 0.1));
      stampMark(540, 1250, 'NÃO É SUPERLUA', prog(t, s1.sup - 0.05, s1.sup + 0.12), { size: 74 });
    }

    // ================= CENA 2 — por que fica cheia =================
    const s2 = { che: wt('c2', 'cheia'), opo: wt('c2', 'oposto'), sol: wt('c2', 'sol'), fac: wt('c2', 'toda'), ilu: wt('c2', 'iluminada'), aug: wt('c2', 'auge'), seg: wt('c2', 'segunda'), uma: wt('c2', 'uma'), doz: wt('c2', 'doze'), mad: wt('c2', 'madrugada') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.opo, 'swoosh'); cue(s2.sol, 'pop'); cue(s2.ilu, 'sparkle'); cue(s2.aug, 'card'); cue(s2.doz, 'ding');
    function scene2(t) {
      bg(t, 'rgba(255,182,39,A)'); stars(t, 0.5); header(t);
      const ak = sm(t, B[1], B[1] + 0.4);
      const cx = 600, cy = 760, R = 300;
      ga(ak);
      // raios do sol
      for (let i = -3; i <= 3; i++) line([[180, cy + i * 70], [1000, cy + i * 70]], 3, 'rgba(255,182,39,0.12)');
      ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.42, 0, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.setLineDash([14, 12]); ctx.stroke(); ctx.setLineDash([]);
      sun(140, cy, 70 * sm(t, s2.sol - 0.3, s2.sol, outBack) + 0.01, t);
      earth(cx, cy, 70);
      ga(1);
      // lua anda na órbita até o lado oposto (direita)
      const ang = lerp(Math.PI * 0.5, 0, sm(t, s2.che - 0.2, s2.opo + 0.3));
      const mx = cx + Math.cos(ang) * R, my = cy + Math.sin(ang) * R * 0.42;
      ga(ak); circ(mx, my, 44, '#2a3350', 5, INK); // lado escuro
      ctx.save(); ctx.beginPath(); ctx.arc(mx, my, 44, Math.PI / 2, -Math.PI / 2); ctx.closePath(); ctx.fillStyle = MOONC; ctx.fill(); ctx.restore(); ga(1);
      txt('SOL', 140, cy + 140, 34, { w: 900, color: SUNC, a: prog(t, s2.sol - 0.2, s2.sol) });
      txt('TERRA', cx, cy + 115, 30, { w: 900, color: WH, a: ak });
      chip('LADO OPOSTO AO SOL', 540, 330, 46, SUNC, prog(t, s2.opo - 0.2, s2.opo + 0.1));
      // o que se vê da Terra
      const vk = sm(t, s2.fac - 0.3, s2.fac, outBack);
      if (vk > 0) { ctx.save(); ctx.translate(540, 1210); ctx.scale(vk, vk); rr(-300, -150, 600, 300, 36); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill(); txt('DAQUI, A GENTE VÊ:', -110, -110, 28, { w: 900, color: MU }); moonDisk(-160, 20, 95, { lit: lerp(0.55, 1, sm(t, s2.fac, s2.ilu + 0.2)), glow: prog(t, s2.ilu - 0.1, s2.ilu + 0.3) }); txt('100%', 120, -10, 90, { w: 900, color: Y, a: prog(t, s2.ilu - 0.2, s2.ilu + 0.1) }); txt('ILUMINADA', 120, 70, 32, { w: 900, color: WH, a: prog(t, s2.ilu - 0.2, s2.ilu + 0.1) }); ctx.restore(); }
      chip('AUGE: SEG 26/10 • 01:12', 540, 460, 44, WH, prog(t, s2.seg - 0.2, s2.seg + 0.1));
      txt('HORÁRIO DE BRASÍLIA', 540, 540, 30, { w: 800, color: MU, a: prog(t, s2.doz - 0.1, s2.doz + 0.2) });
    }

    // ================= CENA 3 — origem do nome =================
    const s3 = { nom: wt('c3', 'nome'), hem: wt('c3', 'hemisferio'), nor: wt('c3', 'norte'), pri: wt('c3', 'primeira'), col: wt('c3', 'colheita'), cam: wt('c3', 'campos'), lim: wt('c3', 'limpos'), luz: wt('c3', 'luz'), caz: wt('c3', 'cacar'), inv: wt('c3', 'inverno') };
    cue(B[2], 'music', { part: 'groove' }); cue(s3.hem, 'whoosh', { dur: 0.4 }); cue(s3.pri, 'card'); cue(s3.col, 'chop'); cue(s3.lim, 'wipe', { dur: 0.4 }); cue(s3.luz, 'sparkle'); cue(s3.caz, 'swoosh'); cue(s3.inv, 'wind', { dur: 1.0 });
    function scene3(t) {
      bg(t, 'rgba(255,209,102,A)'); header(t);
      // globo com o norte destacado
      const gk = sm(t, s3.hem - 0.4, s3.hem, outBack), gOut = sm(t, s3.pri - 0.3, s3.pri);
      if (gk > 0 && gOut < 1) { ga(1 - gOut); ctx.save(); ctx.translate(540, 700); ctx.scale(gk, gk); circ(0, 0, 230, '#1d4f7a', 8, INK); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 230, 0, TAU); ctx.clip(); ctx.fillStyle = 'rgba(255,209,102,' + (0.55 * prog(t, s3.nor - 0.2, s3.nor + 0.2)) + ')'; ctx.fillRect(-240, -240, 480, 240); ctx.restore(); line([[-230, 0], [230, 0]], 6, WH, [16, 12]); txt('NORTE', 0, -110, 56, { w: 900, color: WH }); txt('SUL', 0, 110, 44, { w: 900, color: MU }); ctx.restore(); ga(1); }
      chip('VEM DO HEMISFÉRIO NORTE', 540, 330, 44, Y, prog(t, s3.hem - 0.2, s3.hem + 0.1), { a: 1 - gOut });
      // linha do tempo: colheita -> caçador
      if (gOut > 0) { ga(gOut);
        const ck = prog(t, s3.pri - 0.2, s3.pri + 0.3);
        rr(120, 300, 380, 170, 30); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); moonDisk(200, 385, 48 * outBack(ck)); txt('SETEMBRO', 360, 355, 30, { w: 900, color: MU }); txt('COLHEITA', 360, 410, 40, { w: 900, color: STUB });
        txt('→', 540, 385, 70, { w: 900, color: WH, a: prog(t, s3.col - 0.1, s3.col + 0.2) });
        const k2 = prog(t, s3.col, s3.col + 0.3); rr(580, 300, 380, 170, 30); ctx.fillStyle = 'rgba(255,209,102,0.18)'; ctx.fill(); moonDisk(660, 385, 48 * outBack(k2)); txt('OUTUBRO', 820, 355, 30, { w: 900, color: MU }); txt('CAÇADOR', 820, 410, 40, { w: 900, color: Y });
        // campo colhido sob a lua
        const fk = sm(t, s3.col - 0.1, s3.col + 0.4);
        ctx.save(); ctx.globalAlpha *= fk;
        ctx.fillStyle = SKYN; rr(90, 540, 900, 820, 40); ctx.fill(); ctx.save(); rr(90, 540, 900, 820, 40); ctx.clip();
        stars(t, 0.6 * fk); const lk = sm(t, s3.luz - 0.3, s3.luz + 0.3);
        moonDisk(780, 720, 90, { glow: 0.4 + lk });
        ctx.fillStyle = FIELD; ctx.fillRect(90, 1000, 900, 400);
        const clean = sm(t, s3.lim - 0.3, s3.lim + 0.4);
        for (let r = 0; r < 7; r++) { const y = 1030 + r * 48; for (let i = 0; i < 18; i++) { const x = 110 + i * 50 + (r % 2) * 25; const hgt = lerp(70, 14, clean); line([[x, y], [x, y - hgt]], 8, lerp(0, 1, lk) > 0.5 ? '#e6c56a' : STUB); } }
        if (lk > 0) { ctx.globalAlpha *= 0.25 * lk; ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.moveTo(780, 720); ctx.lineTo(200, 1360); ctx.lineTo(990, 1360); ctx.closePath(); ctx.fill(); }
        ctx.restore(); ctx.restore();
        chip('LUZ PRA CAÇAR', 540, 1000, 44, Y, prog(t, s3.caz - 0.25, s3.caz + 0.05));
        chip('ANTES DO INVERNO', 540, 1290, 40, WH, prog(t, s3.inv - 0.25, s3.inv + 0.05));
        ga(1); }
    }

    // ================= CENA 4 — nasce só 30 min mais tarde =================
    const s4 = { la: wt('c4', 'la'), epo: wt('c4', 'epoca'), nas: wt('c4', 'nasce'), tri: wt('c4', 'trinta'), tar: wt('c4', 'tarde'), noi: wt('c4', 'noite'), cin: wt('c4', 'cinquenta'), for: wt('c4', 'forte'), por: wt('c4', 'por', 1), var: wt('c4', 'varias'), seg: wt('c4', 'seguidas') };
    cue(B[3], 'music', { part: 'safe' }); cue(s4.nas, 'riser', { dur: 0.5 }); cue(s4.tri, 'ding'); cue(s4.cin, 'minus'); cue(s4.por, 'swoosh'); for (let i = 0; i < 3; i++) cue(s4.var + i * 0.22, 'pop', { gain: 0.6 });
    function scene4(t) {
      bg(t, 'rgba(120,160,255,A)'); header(t);
      rtxt('NASCER DA LUA', 540, 290, 76, { color: WH, sh: '#000', scale: sm(t, B[3] + 0.1, B[3] + 0.45, outBack) });
      txt('ATRASO DE UMA NOITE PARA A OUTRA', 540, 380, 32, { w: 800, color: MU, a: sm(t, s4.nas - 0.2, s4.nas + 0.2) });
      // barras
      const bx = 330, bw = 600, by1 = 520, by2 = 680;
      const k1 = sm(t, s4.tri - 0.3, s4.tar), k2 = sm(t, s4.cin - 0.3, s4.cin + 0.2);
      const tk = sm(t, s4.nas - 0.4, s4.nas); if (tk > 0) { ga(tk); txt('NORMAL', 120, by1, 36, { w: 900, color: MU, align: 'left' }); txt('OUTUBRO', 120, by2 - 18, 34, { w: 900, color: Y, align: 'left' }); txt('NO NORTE', 120, by2 + 22, 26, { w: 800, color: MU, align: 'left' }); for (const yy of [by1, by2]) { rr(bx, yy - 40, bw, 80, 40); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); } txt('?', 900, by1, 40, { w: 900, color: MU, a: 1 - k2 }); txt('?', 900, by2, 40, { w: 900, color: MU, a: 1 - k1 }); ga(1); }
      if (k2 > 0) { txt('NORMAL', 120, by1, 36, { w: 900, color: MU, align: 'left', a: k2 }); rr(bx, by1 - 40, bw * k2, 80, 40); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill(); txt('+50 MIN', bx + bw * k2 - 20, by1 + 2, 38, { w: 900, color: WH, align: 'right', a: k2 }); }
      if (k1 > 0) { txt('OUTUBRO', 120, by2 - 18, 34, { w: 900, color: Y, align: 'left', a: k1 }); txt('NO NORTE', 120, by2 + 22, 26, { w: 800, color: MU, align: 'left', a: k1 }); rr(bx, by2 - 40, bw * 0.6 * k1, 80, 40); ctx.fillStyle = Y; ctx.fill(); txt('+30 MIN', bx + bw * 0.6 * k1 - 20, by2 + 2, 38, { w: 900, color: INK, align: 'right', a: k1 }); }
      // pôr do sol + luas em noites seguidas
      const sk = sm(t, s4.for - 0.3, s4.for + 0.1);
      if (sk > 0) { ctx.save(); ctx.globalAlpha *= sk; rr(90, 820, 900, 600, 40); ctx.save(); ctx.clip();
        const g = ctx.createLinearGradient(0, 820, 0, 1420); g.addColorStop(0, '#1b2a5a'); g.addColorStop(1, '#ff8a4c'); ctx.fillStyle = g; ctx.fillRect(90, 820, 900, 600);
        const sunY = lerp(1240, 1400, sm(t, s4.por - 0.2, s4.por + 0.6)); circ(250, sunY, 70, SUNC);
        horizon(1300, '#0a1424');
        for (let i = 0; i < 3; i++) { const k = prog(t, s4.var + i * 0.22 - 0.1, s4.var + i * 0.22 + 0.5); if (k <= 0) continue; const x = 560 + i * 160; moonDisk(x, lerp(1330, 1060 + i * 26, outC(k)), 46, { glow: 0.5 }); txt(['DIA 1', 'DIA 2', 'DIA 3'][i], x, 1360, 26, { w: 900, color: WH, a: k }); }
        ctx.restore(); ctx.restore(); }
      chip('LUA FORTE LOGO APÓS O PÔR DO SOL', 540, 800, 34, Y, prog(t, s4.for - 0.2, s4.for + 0.1));
      chip('VÁRIAS NOITES SEGUIDAS', 540, 1460, 40, WH, prog(t, s4.seg - 0.2, s4.seg + 0.1));
    }

    // ================= CENA 5 — ilusão =================
    const s5 = { gig: wt('c5', 'gigante'), hor: wt('c5', 'horizonte'), ilu: wt('c5', 'ilusao'), cer: wt('c5', 'cerebro'), tam: wt('c5', 'tamanho'), qua: wt('c5', 'quase'), mud: wt('c5', 'muda') };
    cue(B[4], 'music', { part: 'stop' }); cue(s5.gig, 'boing'); cue(s5.ilu, 'glitch', { dur: 0.4 }); cue(s5.tam, 'scan', { dur: 0.8, gain: 0.6 }); cue(s5.mud, 'success'); cue(s5.ilu, 'music', { part: 'drop' });
    function scene5(t) {
      bg(t); ctx.fillStyle = 'rgba(11,27,58,0.6)'; ctx.fillRect(0, 0, W, H); stars(t, 0.8); header(t);
      const meas = sm(t, s5.tam - 0.3, s5.tam + 0.4);
      // lua alta (pequena) e lua no horizonte (parece grande)
      const lowR = lerp(lerp(70, 210, sm(t, s5.gig - 0.4, s5.gig + 0.1, outBack)), 80, meas);
      moonDisk(760, 520, 80, { glow: 0.5 });
      txt('NO ALTO', 760, 650, 30, { w: 900, color: MU });
      moonDisk(330, 1190 - lowR * 0.4, lowR, { glow: 0.8 });
      horizon(1260);
      for (const [x, s] of [[120, 1.0], [640, 0.8], [980, 1.1]]) tree(x, 1280, s);
      chip('NO HORIZONTE', 330, 1380, 36, WH, prog(t, s5.hor - 0.2, s5.hor + 0.1));
      // régua: mesmo tamanho
      if (meas > 0) { ga(meas); for (const [x, y] of [[760, 520], [330, 1190 - 80 * 0.4]]) { line([[x - 80, y - 110], [x + 80, y - 110]], 6, Y); line([[x - 80, y - 125], [x - 80, y - 95]], 6, Y); line([[x + 80, y - 125], [x + 80, y - 95]], 6, Y); } txt('=', 545, 800, 130, { w: 900, color: Y, a: prog(t, s5.qua - 0.1, s5.qua + 0.2) }); ga(1); }
      stampMark(540, 340, 'ILUSÃO DO CÉREBRO', prog(t, s5.ilu - 0.05, s5.ilu + 0.12), { size: 64, col: Y });
      chip('O TAMANHO QUASE NÃO MUDA', 540, 1470, 40, Y, prog(t, s5.mud - 0.3, s5.mud));
    }

    // ================= CENA 6 — CTA =================
    const s6 = { sup: wt('c6', 'superlua'), ver: wt('c6', 'verdade'), vin: wt('c6', 'vinte'), nov: wt('c6', 'novembro'), viu: wt('c6', 'viu'), com: wt('c6', 'comenta'), seg: wt('c6', 'segue'), sup2: wt('c6', 'superlua', 1) };
    cue(B[5], 'music', { part: 'outro' }); cue(s6.sup, 'riser', { dur: 0.6 }); cue(s6.nov, 'impact', { gain: 0.7 }); cue(s6.com, 'notif'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t) {
      bg(t, 'rgba(255,209,102,A)'); stars(t, 0.5); header(t);
      rtxt('SUPERLUA DE VERDADE', 540, 290, 70, { color: WH, sh: '#000', scale: sm(t, s6.sup - 0.2, s6.ver, outBack) });
      // cartão do calendário + lua crescendo
      const ck = sm(t, s6.vin - 0.3, s6.vin + 0.1, outBack);
      if (ck > 0) { ctx.save(); ctx.translate(300, 620); ctx.scale(ck, ck); rr(-170, -170, 340, 340, 36); ctx.fillStyle = WH; ctx.fill(); rr(-170, -170, 340, 90, [36, 36, 0, 0]); ctx.fillStyle = RED; ctx.fill(); txt('NOV', 0, -124, 52, { w: 900, color: WH }); txt('24', 0, 40, 170, { w: 900, color: INK }); ctx.restore(); }
      const mk = sm(t, s6.nov - 0.2, s6.nov + 0.6, outBack);
      moonDisk(770, 620, lerp(60, 170, mk) * clamp(ck * 2), { glow: mk });
      chip('LUA DO CASTOR', 770, 850, 36, Y, prog(t, s6.nov - 0.1, s6.nov + 0.2));
      rtxt('VOCÊ VIU A LUA?', 540, 1010, 76, { color: Y, sh: '#000', scale: sm(t, s6.viu - 0.2, s6.viu + 0.1, outBack) });
      ['SIM', 'NÃO', 'NUBLADO'].forEach((m, i) => { const k = prog(t, s6.com + i * 0.2, s6.com + i * 0.2 + 0.3); if (k <= 0) return; ctx.save(); ctx.translate([270, 540, 810][i], 1130); ctx.scale(outBack(k), outBack(k)); rr(-120, -42, 240, 84, 32); ctx.fillStyle = WH; ctx.fill(); txt(m, 0, 2, 36, { w: 800, color: INK }); ctx.restore(); });
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1320); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(255,209,102,A)', 0.35); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : Y; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
      txt('PRA NÃO PERDER A SUPERLUA', 540, 1440, 34, { w: 900, color: WH, a: prog(t, s6.sup2 - 0.3, s6.sup2) });
    }

    // ================= legendas =================
    const HL = new Set(['lua', 'cacador', 'superlua', 'cheia', 'oposto', 'sol', 'iluminada', 'auge', 'segunda', 'doze', 'hemisferio', 'norte', 'primeira', 'colheita', 'cacar', 'inverno', 'trinta', 'cinquenta', 'tarde', 'noite', 'forte', 'seguidas', 'gigante', 'horizonte', 'ilusao', 'cerebro', 'tamanho', 'muda', 'verdade', 'vinte', 'quatro', 'novembro', 'comenta', 'segue']);
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
      txt('fontes: Star Walk • Farmers’ Almanac', 540, 1840, 26, { w: 600, color: 'rgba(255,255,255,0.45)' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
