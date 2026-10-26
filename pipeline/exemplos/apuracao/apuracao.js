/*
 * POR QUE O RESULTADO VIROU NA APURAÇÃO — explicador em estilo "telão de dados", 9:16 (1080x1920)
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
    const NAMES = ['Gancho: a virada às 20h26', 'Urna → boletim → TSE', 'Estados chegam em ritmos diferentes', 'Parcial ≠ Brasil (pote de balas)', 'O Nordeste chega: resultado final', 'CTA'];
    const cues = []; const cue = (t, type, o = {}) => cues.push(Object.assign({ t: +Math.max(0, t).toFixed(3), type }, o));

    // ------------------------------------------------ paleta (neutra)
    const BG0 = '#0b1020', BG1 = '#141b33', GRID = 'rgba(120,150,220,0.08)', INK = '#0b1020';
    const OR = '#ff9f1c', TE = '#2ec4b6', WH = '#f4f6fb', MU = '#8a94b3', Y = '#ffd166', RED = '#ff4d5e';
    const CAND = { F: { name: 'FLÁVIO', col: OR }, L: { name: 'LULA', col: TE } };

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
      ga(0.85); rr(300, 120, 480, 64, 32); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
      txt('2º TURNO • 25/10/2026', 540, 153, 30, { w: 800, color: MU }); ga(1);
    }
    function lockIcon(x, y, s, col = Y) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); line([[-22, -10], [-22, -34]], 10, col); ctx.beginPath(); ctx.arc(0, -34, 22, Math.PI, 0); ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.stroke(); line([[22, -34], [22, -10]], 10, col); rr(-36, -12, 72, 56, 10); ctx.fillStyle = col; ctx.fill(); circ(0, 12, 8, INK); ctx.restore(); }

    // barra "cabo de guerra": v = % de Lula nos votos válidos; zoom exagera a diferença em torno de 50%
    function tug(x, y, w, h, v, zoom, t) {
      const f = clamp(0.5 + (v - 50) / 100 * zoom, 0.04, 0.96);
      rr(x - 6, y - 6, w + 12, h + 12, h / 2 + 6); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
      ctx.save(); rr(x, y, w, h, h / 2); ctx.clip();
      ctx.fillStyle = OR; ctx.fillRect(x, y, w * (1 - f), h); ctx.fillStyle = TE; ctx.fillRect(x + w * (1 - f), y, w * f, h);
      for (let i = 0; i < 14; i++) { const sx = x + ((i * 90 + t * 120) % (w + 90)) - 45; ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + 30, y); ctx.lineTo(sx - 10, y + h); ctx.lineTo(sx - 40, y + h); ctx.fill(); }
      ctx.restore();
      line([[x + w / 2, y - 26], [x + w / 2, y + h + 26]], 5, WH, [10, 8]); txt('50%', x + w / 2, y - 48, 26, { w: 800, color: MU });
      const bx = x + w * (1 - f); circ(bx, y + h / 2, h * 0.62, WH, 6, INK);
    }
    function candCard(x, y, key, v, lead, k) { // cartão com nome + %
      if (k <= 0) return; const c = CAND[key];
      ctx.save(); ctx.translate(x, y); const s = outBack(k) * (lead ? 1.04 : 0.96); ctx.scale(s, s); ga(clamp(k * 3) * (lead ? 1 : 0.7));
      rr(-215, -105, 430, 210, 28); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill(); ctx.lineWidth = lead ? 8 : 4; ctx.strokeStyle = c.col; ctx.stroke();
      rr(-215, -105, 430, 56, [28, 28, 0, 0]); ctx.fillStyle = c.col; ctx.fill();
      txt(c.name, 0, -76, 34, { w: 900, color: INK });
      txt(pct(v), 0, 22, 84, { w: 900, color: WH });
      if (lead) txt('▲ NA FRENTE', 0, 82, 26, { w: 800, color: c.col });
      ctx.restore(); ga(1);
    }

    // ================= CENA 1 — GANCHO: a virada às 20h26 =================
    const s1 = { ont: wt('c1', 'ontem'), lid: wt('c1', 'liderou'), oit: wt('c1', 'oito'), met: wt('c1', 'metade'), lul: wt('c1', 'lula'), pas: wt('c1', 'passou'), fre: wt('c1', 'frente'), mag: wt('c1', 'magica'), nao: wt('c1', 'nao'), exp: wt('c1', 'explicacao') };
    // linha do tempo real (Plural / TSE): 19h04 28,66% F 50,28 · 20h18 40,23% F 50,20 · 20h26 48,97% L 50,05
    const v1 = t => kf(t, [[s1.ont, 49.72], [s1.oit, 49.80], [s1.pas, 50.05], [s1.pas + 1.2, 50.12]]);
    const u1 = t => kf(t, [[s1.ont, 28.66], [s1.oit, 40.23], [s1.pas, 48.97], [s1.pas + 1.2, 49.6]]);
    const clk1 = t => kf(t, [[s1.ont, 19 * 60 + 4], [s1.oit, 20 * 60 + 18], [s1.pas, 20 * 60 + 26]], x => x);
    cue(0, 'music', { part: 'intro' }); cue(s1.ont, 'tick', { dur: s1.pas - s1.ont });
    cue(s1.pas, 'impact'); cue(s1.pas + 0.02, 'stamp'); cue(s1.pas, 'music', { part: 'groove' });
    cue(s1.mag, 'sparkle'); cue(s1.nao, 'error'); cue(s1.exp, 'ding');
    function scene1(t) {
      bg(t, v1(t) >= 50 ? 'rgba(46,196,182,A)' : 'rgba(255,159,28,A)'); header(t);
      const intro = sm(t, 0, 0.5, outC), shake = pulse(t, s1.pas, 0.03, 0.25) * 18;
      ctx.translate(Math.sin(t * 70) * shake, Math.cos(t * 60) * shake);
      // relógio
      const m = Math.round(clk1(t)), hh = Math.floor(m / 60), mm = m % 60, fl = pulse(t, s1.pas, 0.05, 0.5);
      ga(intro); txt('APURAÇÃO', 540, 270, 44, { w: 900, color: MU });
      rtxt(`${hh}h${String(mm).padStart(2, '0')}`, 540, 390, 150, { color: fl > 0.1 ? Y : WH, sh: '#000', scale: intro * (1 + 0.12 * fl) });
      // urnas apuradas
      const u = u1(t); rr(190, 500, 700, 34, 17); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill(); rr(190, 500, 700 * u / 100, 34, 17); ctx.fillStyle = WH; ctx.fill();
      txt(`${pct(u)} DAS URNAS APURADAS`, 540, 572, 32, { w: 800, color: WH }); ga(1);
      // barra + cartões
      const v = v1(t), lead = v >= 50 ? 'L' : 'F', bk = sm(t, 0.2, 0.8, outBack);
      if (bk > 0) { ctx.save(); ctx.translate(540, 700); ctx.scale(bk, bk); tug(-440, -32, 880, 64, v, 9, t); ctx.restore(); }
      const top = sm(t, s1.mag - 0.3, s1.mag + 0.2), cy = lerp(940, 900, top);
      candCard(290, cy, 'F', 100 - v, lead === 'F', sm(t, 0.35, 0.8)); candCard(790, cy, 'L', v, lead === 'L', sm(t, 0.45, 0.9));
      if (t < s1.mag - 0.2) stampMark(540, 1150, 'VIROU!', prog(t, s1.pas, s1.pas + 0.16), { size: 100, col: Y, rot: -0.08 });
      // "foi mágica?" -> "não, tem explicação"
      if (t > s1.mag - 0.2) {
        ctx.save(); ga(1 - prog(t, s1.exp - 0.1, s1.exp + 0.2)); ctx.fillStyle = 'rgba(11,16,32,0.75)'; ctx.fillRect(0, 1040, W, 360); ctx.restore(); ga(1);
        const mk2 = sm(t, s1.mag - 0.15, s1.mag + 0.15, outBack), out = prog(t, s1.exp - 0.1, s1.exp + 0.15);
        if (out < 1) { rtxt('MÁGICA?', 540, 1210, 130, { color: Y, sh: '#5a3cff', scale: mk2 * (1 - out), rot: Math.sin(t * 9) * 0.03 });
          for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * 2, r = 330 + Math.sin(t * 5 + i) * 20; const k = mk2 * (1 - out); if (k > 0) { ctx.save(); ctx.translate(540 + Math.cos(a) * r, 1210 + Math.sin(a) * r * 0.35); ctx.scale(k, k); ctx.beginPath(); for (let j = 0; j < 8; j++) { const aa = j * Math.PI / 4, rr2 = j % 2 ? 7 : 24; ctx.lineTo(Math.cos(aa) * rr2, Math.sin(aa) * rr2); } ctx.closePath(); ctx.fillStyle = Y; ctx.fill(); ctx.restore(); } }
          const x = sm(t, s1.nao - 0.05, s1.nao + 0.15) * (1 - out); if (x > 0) { line([[260, 1130], [lerp(260, 820, x), lerp(1130, 1290, x)]], 22, RED); line([[820, 1130], [lerp(820, 260, x), lerp(1130, 1290, x)]], 22, RED); } }
        chip('TEM EXPLICAÇÃO', 540, 1230, 54, Y, prog(t, s1.exp - 0.1, s1.exp + 0.25));
      }
    }

    // ================= CENA 2 — urna → boletim → TSE =================
    const s2 = { cin: wt('c2', 'cinco'), urn: wt('c2', 'urna'), imp: wt('c2', 'imprime'), bol: wt('c2', 'boletim'), vot: wt('c2', 'votos'), res: wt('c2', 'resultado'), tra: wt('c2', 'transmitido'), cri: wt('c2', 'criptografado'), tse: wt('c2', 'tse'), som: wt('c2', 'soma') };
    cue(B[1], 'music', { part: 'safe' }); cue(s2.cin, 'bell'); cue(s2.imp, 'type', { n: 10, rate: 14 }); cue(s2.bol, 'pop'); cue(s2.tra, 'send'); cue(s2.tra + 0.05, 'whoosh', { dur: 0.7 });
    cue(s2.cri, 'lock'); cue(s2.tse, 'ding'); cue(s2.som, 'scan', { dur: 1.2, gain: 0.7 });
    function urna(x, y, s, t) { // urna genérica (sem marcas)
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-200, -150, 400, 300, 26); ctx.fillStyle = '#d9dbe2'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
      rr(-175, -120, 200, 150, 12); ctx.fillStyle = '#1c2a3f'; ctx.fill(); txt('FIM', -75, -45, 52, { w: 900, color: '#9fe7c4' });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { rr(50 + c * 44, -118 + r * 44, 36, 36, 7); ctx.fillStyle = '#2b2f3a'; ctx.fill(); }
      rr(50, 62, 40, 30, 6); ctx.fillStyle = '#f4f6fb'; ctx.fill(); rr(96, 62, 40, 30, 6); ctx.fillStyle = '#ff8a3d'; ctx.fill(); rr(142, 62, 40, 30, 6); ctx.fillStyle = '#3ccf7a'; ctx.fill();
      rr(-160, 70, 170, 18, 9); ctx.fillStyle = INK; ctx.fill(); // fenda da impressora
      ctx.restore();
    }
    function server(x, y, s, t, hot) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); soft(0, 0, 260, 'rgba(255,209,102,A)', 0.25 * hot);
      for (let i = 0; i < 3; i++) { rr(-130, -130 + i * 92, 260, 80, 14); ctx.fillStyle = '#26304d'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#4a5a86'; ctx.stroke(); for (let j = 0; j < 4; j++) circ(-95 + j * 26, -90 + i * 92, 7, (Math.sin(t * 9 + i * 2 + j) > 0.2 || hot > 0.5) ? '#3ccf7a' : '#1d4630'); rr(10, -100 + i * 92, 95, 18, 6); ctx.fillStyle = '#121a30'; ctx.fill(); }
      txt('TSE', 0, 175, 54, { w: 900, color: Y }); ctx.restore(); }
    function scene2(t) {
      bg(t); header(t);
      const ck = sm(t, B[1], B[1] + 0.5, outBack);
      rtxt('17h00', 540, 300, 110, { color: WH, sh: '#000', scale: sm(t, s2.cin - 0.15, s2.cin + 0.2, outBack) });
      chip('URNAS FECHAM', 540, 410, 34, MU, prog(t, s2.cin + 0.1, s2.cin + 0.4), { tc: INK });
      // urna e boletim
      const ux = lerp(540, 300, sm(t, s2.res - 0.2, s2.res + 0.4)), us = lerp(1.25, 0.85, sm(t, s2.res - 0.2, s2.res + 0.4));
      urna(ux, 760, us * ck, t);
      const pk = sm(t, s2.imp - 0.05, s2.imp + 0.9, x => x), fly = sm(t, s2.tra, s2.tra + 1.1);
      if (pk > 0 && fly < 1) { // papel saindo da fenda
        const px = ux - 63 * us, py = 760 + 79 * us, ph = 330 * pk * us;
        ctx.save(); ctx.translate(px, py); ga(1 - fly); rr(-75 * us, 0, 150 * us, ph, 6); ctx.fillStyle = '#fffdf6'; ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.rect(-75 * us, 0, 150 * us, ph); ctx.clip(); ctx.scale(us, us);
        txt('BOLETIM', 0, 26, 22, { w: 900, color: INK }); txt('DE URNA', 0, 50, 22, { w: 900, color: INK });
        for (let i = 0; i < 9; i++) { line([[-55, 80 + i * 26], [lerp(-10, 55, (i * 37 % 10) / 10), 80 + i * 26]], 6, '#aab0c0'); }
        ctx.restore(); ctx.restore(); ga(1);
      }
      chip('BOLETIM DE URNA', ux, 520, 36, WH, prog(t, s2.bol - 0.1, s2.bol + 0.2) * (1 - prog(t, s2.res - 0.2, s2.res + 0.1)));
      chip('VOTOS DESTA SEÇÃO', ux, 1130, 32, Y, prog(t, s2.vot - 0.1, s2.vot + 0.2) * (1 - prog(t, s2.res - 0.2, s2.res + 0.1)));
      // servidor + envio criptografado
      const sk = sm(t, s2.res - 0.1, s2.res + 0.4, outBack);
      if (sk > 0) {
        server(800, 640, 0.95 * sk, t, pulse(t, s2.tse, 0.05, 0.8) + prog(t, s2.som, s2.som + 0.3));
        line([[ux + 140, 820], [560, 980], [800, 860]], 6, 'rgba(255,255,255,0.25)', [16, 14]);
      }
      if (t > s2.tra) { // pacote voando (curva) com cadeado
        const k = clamp((t - s2.tra) / 1.1), bx = (1 - k) * (1 - k) * (ux + 140) + 2 * (1 - k) * k * 560 + k * k * 800, by = (1 - k) * (1 - k) * 820 + 2 * (1 - k) * k * 1000 + k * k * 760;
        if (k < 1) { ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.sin(t * 8) * 0.1); rr(-70, -48, 140, 96, 12); ctx.fillStyle = '#fffdf6'; ctx.fill(); line([[-70, -48], [0, 8], [70, -48]], 6, '#aab0c0'); if (t > s2.cri - 0.1) lockIcon(46, -40, 0.75 * outBack(prog(t, s2.cri - 0.1, s2.cri + 0.15))); ctx.restore(); }
        chip('CRIPTOGRAFADO', 540, 1220, 40, Y, prog(t, s2.cri - 0.1, s2.cri + 0.2));
      }
      // soma: vários pacotes chegando + contador
      if (t > s2.tse - 0.2) {
        const R = mulberry(3);
        for (let i = 0; i < 14; i++) { const t0 = s2.som - 0.2 + i * 0.09, k = clamp((t - t0) / 0.6); if (k <= 0 || k >= 1) continue; const a = R() * TAU, sx = 800 + Math.cos(a) * 700, sy = 640 + Math.sin(a) * 700; ctx.save(); ctx.translate(lerp(sx, 800, inC(k)), lerp(sy, 640, inC(k))); rr(-30, -20, 60, 40, 6); ctx.fillStyle = '#fffdf6'; ctx.fill(); ctx.restore(); }
        const n = 128.2e6 * outC(prog(t, s2.tse, s2.som + 0.6));
        rtxt(milhar(n), 540, 1360, 92, { color: Y, sh: '#000', scale: sm(t, s2.tse - 0.2, s2.tse + 0.1, outBack) });
        txt('votos somados pelo TSE', 540, 1440, 34, { w: 700, color: MU, a: prog(t, s2.som, s2.som + 0.3) });
      }
    }

    // ================= CENA 3 — os estados chegam em ritmos diferentes =================
    const s3 = { est: wt('c3', 'estados'), jun: wt('c3', 'juntos'), sul: wt('c3', 'sul'), sud: wt('c3', 'sudeste'), cen: wt('c3', 'centro'), tot: wt('c3', 'totalizaram'), rap: wt('c3', 'rapido'), nor: wt('c3', 'nordeste'), vol: wt('c3', 'volume'), dep: wt('c3', 'depois') };
    // mapa em "blocos" (posição aproximada das regiões) — sem mapa exato para não distorcer fronteiras
    const REG = {
      N: { name: 'NORTE', x: 110, y: 320, w: 440, h: 340, col: 'mix' },
      NE: { name: 'NORDESTE', x: 575, y: 380, w: 395, h: 380, col: TE },
      CO: { name: 'CENTRO-\nOESTE', x: 250, y: 685, w: 380, h: 300, col: OR },
      SE: { name: 'SUDESTE', x: 655, y: 785, w: 330, h: 300, col: OR },
      S: { name: 'SUL', x: 370, y: 1010, w: 330, h: 250, col: OR },
    };
    function region(key, fill, k, t, o = {}) {
      const r = REG[key]; if (k <= 0) return; const cx = r.x + r.w / 2, cy = r.y + r.h / 2, sc = outBack(k) * (o.s || 1);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ga(clamp(k * 3) * (o.a ?? 1));
      if (o.glow) soft(0, 0, Math.max(r.w, r.h) * 0.8, r.col === TE ? 'rgba(46,196,182,A)' : 'rgba(255,159,28,A)', 0.45 * o.glow);
      rr(-r.w / 2, -r.h / 2, r.w, r.h, 26); ctx.fillStyle = '#1b2442'; ctx.fill();
      ctx.save(); rr(-r.w / 2, -r.h / 2, r.w, r.h, 26); ctx.clip(); const fh = r.h * clamp(fill);
      if (r.col === 'mix') { for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? OR : TE; ctx.fillRect(-r.w / 2 + i * r.w / 12, r.h / 2 - fh, r.w / 12 + 1, fh); } }
      else { ctx.fillStyle = r.col; ctx.fillRect(-r.w / 2, r.h / 2 - fh, r.w, fh); }
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-r.w / 2, r.h / 2 - fh, r.w, 6);
      ctx.restore();
      rr(-r.w / 2, -r.h / 2, r.w, r.h, 26); ctx.lineWidth = 6; ctx.strokeStyle = o.hl ? Y : 'rgba(255,255,255,0.35)'; ctx.stroke();
      const lines = r.name.split('\n'); lines.forEach((s, i) => txt(s, 0, -24 + (i - (lines.length - 1) / 2) * 44, 38, { w: 900, color: WH, stroke: 10 }));
      txt(Math.round(clamp(fill) * 100) + '%', 0, 46 + (lines.length - 1) * 20, 50, { w: 900, color: WH, stroke: 10 });
      ctx.restore(); ga(1);
    }
    // quanto cada região já totalizou ao longo da cena (ilustrativo, ordem de chegada relatada na cobertura)
    const fillS3 = (key, t) => {
      const base = { N: kf(t, [[s3.est, 0.05], [s3.rap, 0.45], [s3.dep, 0.6], [s3.dep + 1, 0.95]]), NE: kf(t, [[s3.est, 0.04], [s3.nor, 0.22], [s3.vol, 0.3], [s3.dep, 0.55], [s3.dep + 0.9, 0.97]]),
        CO: kf(t, [[s3.cen - 0.2, 0.06], [s3.rap, 0.88]]), SE: kf(t, [[s3.sud - 0.2, 0.06], [s3.rap, 0.85]]), S: kf(t, [[s3.sul - 0.2, 0.06], [s3.rap, 0.92]]) };
      return base[key];
    };
    cue(B[2], 'whoosh', { dur: 0.5 }); for (const k of ['sul', 'sud', 'cen']) cue(s3[k], 'pop'); cue(s3.tot, 'riser', { dur: s3.rap - s3.tot + 0.2 }); cue(s3.rap, 'success');
    cue(s3.nor, 'tick', { dur: s3.dep - s3.nor }); cue(s3.dep, 'coin');
    function scene3(t) {
      bg(t); header(t);
      rtxt('NÃO CHEGAM JUNTOS', 540, 255, 64, { color: WH, sh: '#000', scale: sm(t, s3.est - 0.2, s3.est + 0.2, outBack) });
      const order = ['N', 'NE', 'CO', 'SE', 'S'];
      order.forEach((k, i) => {
        const ap = sm(t, B[2] + 0.1 + i * 0.08, B[2] + 0.5 + i * 0.08);
        const hl = (k === 'S' && t > s3.sul && t < s3.rap + 0.4) || (k === 'SE' && t > s3.sud && t < s3.rap + 0.4) || (k === 'CO' && t > s3.cen && t < s3.rap + 0.4) || (k === 'NE' && t > s3.nor);
        region(k, fillS3(k, t), ap, t, { hl, glow: k === 'NE' ? pulse(t, s3.dep, 0.1, 0.8) : (hl ? 0.5 : 0) });
      });
      chip('MAIS RÁPIDO', 540, 1335, 44, Y, prog(t, s3.rap - 0.1, s3.rap + 0.2) * (1 - prog(t, s3.nor - 0.2, s3.nor)));
      chip('DEPOIS', 770, 330, 44, TE, prog(t, s3.dep - 0.1, s3.dep + 0.2));
      // relógio pequeno
      const m = Math.round(kf(t, [[B[2], 17 * 60], [s3.rap, 19 * 60], [s3.dep + 1, 21 * 60 + 10]], x => x));
      chip(`${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`, 540, 1440, 34, WH, sm(t, B[2] + 0.2, B[2] + 0.5));
    }

    // ================= CENA 4 — a parcial não era o Brasil inteiro (pote de balas) =================
    const s4 = { par: wt('c4', 'parcial'), bra: wt('c4', 'brasil'), int: wt('c4', 'inteiro'), pri: wt('c4', 'principalmente'), fla: wt('c4', 'flavio'), for: wt('c4', 'forte'), pot: wt('c4', 'pote'), bal: wt('c4', 'balas'), peg: wt('c4', 'pegando'), cim: wt('c4', 'cima') };
    cue(s4.par, 'card'); cue(s4.int, 'scratch'); cue(s4.for, 'pop'); cue(s4.pot, 'whoosh', { dur: 0.5 }); cue(s4.bal, 'roll', { dur: 0.6 }); cue(s4.peg, 'swoosh'); for (let i = 0; i < 5; i++) cue(s4.peg + 0.25 + i * 0.13, 'plop');
    // balas do pote: camadas de cima laranja, de baixo turquesa (mais turquesa no total)
    const CANDY = (() => { const R = mulberry(11), arr = []; const rows = 9, perRow = 7; for (let r = 0; r < rows; r++) for (let c = 0; c < perRow; c++) { const top = r >= 6; arr.push({ x: -150 + c * 50 + (r % 2) * 25 + (R() - 0.5) * 10, y: 210 - r * 46 + (R() - 0.5) * 8, col: top ? (R() < 0.85 ? OR : TE) : (R() < 0.78 ? TE : OR), r, rot: R() * TAU }); } return arr; })();
    function jar(x, y, s, t, taken) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rr(-210, -260, 420, 520, 60); ctx.fillStyle = 'rgba(180,220,255,0.08)'; ctx.fill();
      CANDY.forEach((c, i) => { if (c.r >= 6 && taken > 0 && (8 - c.r) * 7 + (i % 7) < taken * 21) return; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot + t * 0.2); circ(0, 0, 22, c.col, 4, INK); line([[-10, -6], [-2, -12]], 5, 'rgba(255,255,255,0.6)'); ctx.restore(); });
      rr(-210, -260, 420, 520, 60); ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(200,230,255,0.7)'; ctx.stroke();
      rr(-170, -300, 340, 52, 16); ctx.fillStyle = '#c9ccd6'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      line([[-170, -150], [-170, 150]], 10, 'rgba(255,255,255,0.15)');
      ctx.restore();
    }
    function scene4(t) {
      bg(t); header(t);
      const jarIn = sm(t, s4.pot - 0.45, s4.pot - 0.1);
      // parte A: mini-mapa com só as regiões que já tinham chegado
      if (jarIn < 1) {
        ctx.save(); ga(1 - jarIn); ctx.translate(540, 800); ctx.scale(0.82, 0.82); ctx.translate(-540, -800);
        const glow = sm(t, s4.pri - 0.2, s4.for + 0.2);
        for (const k of ['N', 'NE', 'CO', 'SE', 'S']) { const f = { N: 0.45, NE: 0.22, CO: 0.88, SE: 0.85, S: 0.92 }[k]; region(k, f, 1, t, { a: k === 'NE' || k === 'N' ? lerp(1, 0.35, glow) : 1, glow: (k === 'NE' || k === 'N') ? 0 : glow, hl: (k !== 'NE' && k !== 'N') && glow > 0.5 }); }
        ctx.restore(); ga(1);
        chip('PARCIAL DO COMEÇO', 540, 300, 44, WH, prog(t, s4.par - 0.1, s4.par + 0.2) * (1 - jarIn));
        if (t > s4.bra - 0.1) { const k = sm(t, s4.bra - 0.1, s4.bra + 0.2, outBack) * (1 - jarIn); rtxt('≠ BRASIL INTEIRO', 540, 1330, 76, { color: RED, sh: '#000', scale: k }); }
        chip('ONDE O FLÁVIO ESTAVA MAIS FORTE', 540, 1440, 34, OR, prog(t, s4.fla - 0.1, s4.fla + 0.2) * (1 - jarIn));
      }
      if (jarIn > 0) {
        const taken = prog(t, s4.peg + 0.2, s4.cim + 0.5);
        jar(540, 860, 1.25 * outBack(jarIn), t, taken);
        rtxt('POTE DE BALAS', 540, 280, 80, { color: Y, sh: '#000', scale: sm(t, s4.pot - 0.1, s4.pot + 0.2, outBack) });
        // mão/pegador tirando as de cima
        if (t > s4.peg - 0.2) { const k = prog(t, s4.peg - 0.2, s4.cim + 0.6), hx = 540 + Math.sin(k * 10) * 120, hy = lerp(560, 650, Math.abs(Math.sin(k * 5)));
          ctx.save(); ctx.translate(hx, hy); line([[0, -200], [0, -20]], 22, '#c9ccd6'); line([[0, -200], [0, -20]], 10, '#8a94b3'); ctx.beginPath(); ctx.arc(0, 10, 50, 0, Math.PI); ctx.lineWidth = 16; ctx.strokeStyle = '#c9ccd6'; ctx.stroke(); line([[-50, 10], [50, 10]], 12, '#c9ccd6'); ctx.restore(); }
        // placar das que saíram
        const nTaken = Math.round(taken * 10), o = Math.round(nTaken * 0.8), tq = nTaken - o;
        if (taken > 0) { const k = sm(t, s4.peg, s4.peg + 0.3, outBack); ctx.save(); ctx.translate(540, 1300); ctx.scale(k, k);
          rr(-330, -70, 660, 140, 30); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
          circ(-200, 0, 36, OR, 5, INK); txt(String(o), -110, 4, 80, { w: 900, color: OR }); txt('×', 0, 4, 60, { w: 900, color: MU }); circ(110, 0, 36, TE, 5, INK); txt(String(tq), 200, 4, 80, { w: 900, color: TE });
          ctx.restore(); }
        chip('SÓ AS DE CIMA ≠ O POTE TODO', 540, 1450, 36, Y, prog(t, s4.cim - 0.1, s4.cim + 0.2));
      }
    }

    // ================= CENA 5 — o Nordeste chega e a conta vira =================
    const s5 = { qua: wt('c5', 'quando'), nor: wt('c5', 'nordeste'), con: wt('c5', 'conta'), vir: wt('c5', 'virou'), la: wt('c5', 'la'), lul: wt('c5', 'lula'), cat: wt('c5', 'catorze'), mil: wt('c5', 'milhoes'), res: wt('c5', 'resultado'), cin: wt('c5', 'cinquenta'), con2: wt('c5', 'contra'), qua2: wt('c5', 'quarenta') };
    cue(B[4], 'music', { part: 'build' }); cue(s5.vir, 'music', { part: 'drop2' });
    cue(s5.nor, 'whoosh', { dur: 0.6 }); cue(s5.vir, 'impact'); cue(s5.vir + 0.03, 'stamp'); cue(s5.cat, 'coin'); cue(s5.res, 'riser', { dur: s5.cin - s5.res }); cue(s5.cin, 'reveal'); cue(s5.qua2, 'tada');
    const v5 = t => kf(t, [[B[4], 49.8], [s5.nor, 49.82], [s5.vir - 0.1, 49.96], [s5.vir + 0.3, 50.4], [s5.cat, 51.2], [s5.res, 51.6], [s5.cin, 51.78]]);
    function scene5(t) {
      bg(t, v5(t) >= 50 ? 'rgba(46,196,182,A)' : null); header(t);
      const fin = sm(t, s5.res - 0.3, s5.res + 0.3), shake = pulse(t, s5.vir, 0.03, 0.25) * 16; ctx.translate(Math.sin(t * 70) * shake, 0);
      // bloco Nordeste chegando
      if (fin < 1) {
        ga(1 - fin);
        const k = sm(t, s5.nor - 0.3, s5.nor + 0.4, outC), nx = lerp(1400, 540, k);
        ctx.save(); ctx.translate(nx, 400); rr(-260, -95, 520, 190, 30); ctx.fillStyle = TE; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = WH; ctx.stroke();
        txt('NORDESTE', 0, -32, 56, { w: 900, color: INK }); txt('100% CHEGANDO', 0, 38, 34, { w: 800, color: INK }); ctx.restore();
        for (let i = 0; i < 6; i++) if (k > 0 && k < 1) line([[nx + 280 + i * 40, 330 + i * 28], [nx + 520 + i * 40, 330 + i * 28]], 6, 'rgba(46,196,182,0.5)');
        const bk = sm(t, B[4], B[4] + 0.5, outBack); const v = v5(t);
        if (bk > 0) { ctx.save(); ctx.translate(540, 700); ctx.scale(bk, bk); tug(-440, -32, 880, 64, v, 9, t); ctx.restore(); }
        candCard(290, 920, 'F', 100 - v, v < 50, bk); candCard(790, 920, 'L', v, v >= 50, bk);
        stampMark(540, 1160, 'VIROU!', prog(t, s5.vir, s5.vir + 0.16), { size: 100, col: Y, rot: 0.06 });
        if (t > s5.la - 0.1) { const kk = sm(t, s5.cat - 0.25, s5.cat + 0.15, outBack); rtxt('+13,7 MILHÕES', 540, 1320, 96, { color: TE, sh: '#000', scale: kk }); txt('saldo do Lula no Nordeste', 540, 1410, 36, { w: 700, color: MU, a: prog(t, s5.mil, s5.mil + 0.3) }); }
        ga(1);
      }
      // resultado final
      if (fin > 0) {
        ga(fin); chip('100% DAS URNAS', 540, 300, 40, WH, fin);
        rtxt('RESULTADO FINAL', 540, 420, 76, { color: Y, sh: '#000', scale: sm(t, s5.res - 0.2, s5.res + 0.2, outBack) });
        const bars = [['L', 51.78, s5.cin], ['F', 48.22, s5.qua2]];
        bars.forEach(([key, v, t0], i) => {
          const c = CAND[key], k = sm(t, t0 - 0.25, t0 + 0.6, outC), y = 600 + i * 300;
          rr(110, y, 860, 220, 30); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();
          rr(110, y, 860 * (v / 100) * k / 0.6, 220, 30); ctx.save(); ctx.clip(); ctx.fillStyle = c.col; ctx.fillRect(110, y, 860, 220); ctx.restore();
          rr(110, y, 860, 220, 30); ctx.lineWidth = 5; ctx.strokeStyle = c.col; ctx.stroke();
          txt(c.name, 150, y + 60, 46, { w: 900, color: INK, align: 'left', a: k > 0.05 ? 1 : 0 });
          if (k > 0.01) txt(pct(v * k), 930, y + 140, 104, { w: 900, color: WH, align: 'right', stroke: 14 });
        });
        txt('diferença: 4,4 milhões de votos', 540, 1200, 40, { w: 800, color: WH, a: prog(t, s5.qua2 + 0.3, s5.qua2 + 0.6) });
        txt('votos válidos • fonte: TSE', 540, 1260, 30, { w: 700, color: MU, a: prog(t, s5.qua2 + 0.3, s5.qua2 + 0.6) });
        ga(1);
      }
    }

    // ================= CENA 6 — moral + CTA =================
    const s6 = { par: wt('c6', 'parcial'), pre: wt('c6', 'previsao'), cem: wt('c6', 'cem'), dec: wt('c6', 'decide'), man: wt('c6', 'manda'), con: wt('c6', 'confuso'), seg: wt('c6', 'segue'), den: wt('c6', 'dentro') };
    cue(B[5], 'music', { part: 'outro' }); cue(s6.pre, 'stamp'); cue(s6.cem, 'scan', { dur: 0.9 }); cue(s6.dec, 'success'); cue(s6.man, 'send'); cue(s6.seg + 0.2, 'tap'); cue(s6.seg + 0.25, 'success');
    function scene6(t) {
      bg(t, 'rgba(255,209,102,A)'); header(t);
      rtxt('PARCIAL', 540, 330, 120, { color: WH, sh: '#000', scale: sm(t, s6.par - 0.15, s6.par + 0.2, outBack) });
      rtxt('≠ PREVISÃO', 540, 470, 110, { color: RED, sh: '#000', scale: sm(t, s6.pre - 0.15, s6.pre + 0.2, outBack) });
      // anel 100%
      const rk = sm(t, s6.cem - 0.3, s6.cem + 0.1, outBack), fill = sm(t, s6.cem - 0.1, s6.dec + 0.2);
      if (rk > 0) { ctx.save(); ctx.translate(540, 800); ctx.scale(rk, rk); ctx.beginPath(); ctx.arc(0, 0, 170, 0, TAU); ctx.lineWidth = 34; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 170, -Math.PI / 2, -Math.PI / 2 + TAU * fill); ctx.strokeStyle = Y; ctx.lineCap = 'round'; ctx.stroke();
        txt(Math.round(fill * 100) + '%', 0, 0, 104, { w: 900, color: WH }); ctx.restore();
        chip('SÓ O 100% DECIDE', 540, 1050, 46, Y, prog(t, s6.dec - 0.1, s6.dec + 0.2)); }
      // compartilhar
      const mk2 = sm(t, s6.man - 0.2, s6.man + 0.2, outBack);
      if (mk2 > 0) { const fl = prog(t, s6.man, s6.man + 0.9); ctx.save(); ctx.translate(lerp(300, 900, inC(fl)), lerp(1220, 1080, inC(fl))); ctx.rotate(-0.3); ctx.scale(mk2, mk2); ga(1 - fl * 0.8);
        ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(80, -60); ctx.lineTo(20, 70); ctx.lineTo(0, 15); ctx.closePath(); ctx.fillStyle = WH; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); ga(1);
        chip('MANDA PRA QUEM FICOU CONFUSO', 540, 1200, 36, WH, prog(t, s6.con - 0.3, s6.con)); }
      const bk = sm(t, s6.seg - 0.3, s6.seg + 0.1, outBack), press = t > s6.seg + 0.2;
      if (bk > 0) { ctx.save(); ctx.translate(540, 1360); const pr = bk * (1 - 0.06 * pulse(t, s6.seg + 0.2, 0.03, 0.15)); ctx.scale(pr, pr); soft(0, 0, 380, 'rgba(255,209,102,A)', 0.3); rr(-250, -72, 500, 144, 72); ctx.fillStyle = press ? WH : Y; ctx.fill(); txt(press ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, 62, { w: 900, color: INK }); ctx.restore(); }
      txt('como as coisas funcionam por dentro', 540, 1460, 34, { w: 700, color: MU, a: prog(t, s6.den - 0.6, s6.den) });
    }

    // ================= legendas =================
    const HL = new Set(['ontem', 'liderou', 'oito', 'vinte', 'seis', 'metade', 'passou', 'frente', 'magica', 'explicacao', 'cinco', 'boletim', 'transmitido', 'criptografado', 'tse', 'soma', 'juntos', 'sul', 'sudeste', 'centrooeste', 'rapido', 'nordeste', 'depois', 'parcial', 'brasil', 'inteiro', 'forte', 'pote', 'balas', 'cima', 'virou', 'catorze', 'milhoes', 'cinquenta', 'quarenta', 'previsao', 'cem', 'decide', 'manda', 'segue']);
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
      txt('conteúdo educativo • sem viés político', 540, 1840, 26, { w: 600, color: 'rgba(255,255,255,0.45)' });
    }
    for (let k = 1; k < NS; k++) cue(B[k] - 0.15, 'whoosh', { dur: 0.3, gain: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    const scenes = NAMES.map((n, i) => ({ n: i + 1, name: n, t0: +B[i].toFixed(2), t1: +B[i + 1].toFixed(2) }));
    return { draw, duration: END, cues, scenes, width: W, height: H, fps: 30 };
  }
  return { create };
});
