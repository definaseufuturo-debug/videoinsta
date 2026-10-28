// Piloto "A porta larga e a estreita" (Mt 7:13-14) — estilo stickman de metáfora visual, 9:16, 30 s, sem narração.
const { createCanvas, GlobalFonts } = require('/home/claude/videoinsta/node_modules/@napi-rs/canvas');
const { spawn } = require('child_process');
const path = require('path');
const FD = '/home/claude/videoinsta/pipeline/template_cristao/assets/fonts';
for (const f of ['Inter-Medium.otf', 'Inter-SemiBold.otf', 'Inter-Bold.otf']) GlobalFonts.registerFromPath(path.join(FD, f), 'Inter');

const W = 1080, H = 1920, FPS = 30, DUR = 30;
const OUT = process.argv[2] || 'porta.mp4';
const FRAMES = process.argv[3] ? process.argv[3].split(',').map(Number) : null;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const sm = t => { t = clamp(t); return t * t * (3 - 2 * t); };
function mulberry(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------- mundo ----------------
// chão em perspectiva: profundidade z 0 (perto) .. 1 (longe)
const FLOOR_NEAR = 1330, FLOOR_FAR = 1060;
const zY = z => lerp(FLOOR_NEAR, FLOOR_FAR, z);
const zS = z => lerp(1.0, 0.36, z);
const GATE_X = 980;          // portão largo (mundo)
const PATH_X0 = -80, DOOR_X = -560, DOOR_Y = 640; // trilha estreita sobe para a esquerda até a porta
const R = mulberry(11);
const crowd = [];
for (let i = 0; i < 90; i++) { const z = R(); crowd.push({ x0: -1000 + R() * 2000, z, sp: 120 + R() * 40, ph: R() * 6.28, seed: i }); }
crowd.sort((a, b) => b.z - a.z);
const climbers = [0, 1, 2].map(i => ({ off: i * 0.33 }));

// câmera
function camAt(t, hero) {
  // x: ponto do mundo no centro da tela; y: ponto do mundo na altura FY; zoom
  let x = lerp(380, 430, sm(prog(t, 0, 7))), y = 1180, zoom = 0.85;
  zoom = lerp(zoom, 1.25, sm(prog(t, 6.5, 10)));
  x = lerp(x, 60, sm(prog(t, 11.5, 16))); zoom = lerp(zoom, 0.78, sm(prog(t, 11.5, 16)));
  const fk = sm(prog(t, 18.5, 21));
  x = lerp(x, hero.x, fk); y = lerp(y, hero.y - 120, fk); zoom = lerp(zoom, 1.0, fk);
  const dk = sm(prog(t, 25.5, 29)); x = lerp(x, DOOR_X + 60, dk); y = lerp(y, DOOR_Y - 40, dk); zoom = lerp(zoom, 2.2, dk);
  return { x, y, zoom };
}
// herói: anda com a multidão, para, olha, sai pela esquerda, sobe a trilha, chega na porta
function heroAt(t) {
  const z = 0.08;
  let x = -50 + 63 * Math.min(t, 7.5); // anda até ~7.5 s
  let walking = t < 7.6 ? 1 : 0, dir = 1, y = zY(z), s = zS(z), stumble = 0, look = 0;
  if (t >= 7.6) { x = -50 + 63 * 7.5; look = prog(t, 8.5, 9.5); }
  if (t >= 17.5) { // vira e caminha para a esquerda até o pé da trilha
    dir = -1; walking = 1; const k = prog(t, 17.5, 20.5); x = lerp(-50 + 63 * 7.5, PATH_X0, k);
    if (t >= 20.5) { // sobe
      const kk = sm(prog(t, 20.5, 26)); x = lerp(PATH_X0, DOOR_X + 60, kk); y = lerp(zY(z), DOOR_Y + 40, kk); s = lerp(zS(z), 0.55, kk);
      stumble = Math.exp(-Math.pow((t - 22.6) / 0.25, 2));
    }
    if (t >= 26) { walking = 0; }
  }
  return { x, y, s, walking, dir, stumble, look };
}

// ---------------- desenho ----------------
function figure(ctx, x, y, s, phase, o = {}) {
  const Hh = 260 * s, col = o.col || '#9c9c9c', lw = Math.max(2, 16 * s);
  const swing = o.walking === 0 ? 0 : Math.sin(phase) * 0.55, dir = o.dir || 1;
  const hip = [x, y - Hh * 0.46], neck = [x + dir * Hh * 0.03 * (o.lean || 0), y - Hh * 0.82];
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const leg = a => { const fx = hip[0] + Math.sin(a) * Hh * 0.28 * dir, fy = y - Math.max(0, Math.cos(a * 2)) * 0; const kx = (hip[0] + fx) / 2 + dir * Hh * 0.07 * Math.max(0, Math.sin(a + 0.6)), ky = (hip[1] + fy) / 2; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy - (Math.sin(a) > 0.2 ? Hh * 0.03 : 0)); ctx.stroke(); };
  leg(swing); leg(-swing);
  ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(neck[0], neck[1]); ctx.stroke();
  const arm = a => { const sh = [neck[0], neck[1] + Hh * 0.05]; const hx = sh[0] + Math.sin(a) * Hh * 0.22 * dir, hy = sh[1] + Hh * 0.30; ctx.beginPath(); ctx.moveTo(sh[0], sh[1]); ctx.lineTo((sh[0] + hx) / 2 - dir * Hh * 0.03, (sh[1] + hy) / 2); ctx.lineTo(hx, hy); ctx.stroke(); };
  if (o.reach) { const sh = [neck[0], neck[1] + Hh * 0.05]; ctx.beginPath(); ctx.moveTo(sh[0], sh[1]); ctx.lineTo(sh[0] - Hh * 0.35, sh[1] - Hh * 0.10 * o.reach); ctx.stroke(); arm(swing * 0.3); }
  else { arm(-swing); arm(swing); }
  const hx = neck[0] + (o.headX || 0) * Hh, hy = neck[1] - Hh * 0.11;
  ctx.beginPath(); ctx.arc(hx, hy, Hh * 0.095, 0, Math.PI * 2); ctx.fill();
}
function drawFig(ctx, x, y, s, phase, o) {
  ctx.save(); ctx.globalAlpha = (o.a ?? 1); figure(ctx, x, y, s, phase, o); ctx.restore();
  // reflexo no chão
  ctx.save(); ctx.globalAlpha = 0.13 * (o.a ?? 1); ctx.translate(0, 2 * y); ctx.scale(1, -1); figure(ctx, x, y, s, phase, o); ctx.restore();
}

const grain = (() => { const c = createCanvas(540, 960), g = c.getContext('2d'), r = mulberry(5); for (let i = 0; i < 14000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)'; g.fillRect(r() * 540, r() * 960, 1.3, 1.3); } return c; })();

function text(ctx, s, y, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = '600 40px Inter'; ctx.letterSpacing = '9px'; ctx.textAlign = 'center'; ctx.fillStyle = '#f2f2f2'; ctx.fillText(s, W / 2, y); ctx.restore();
}

function draw(ctx, t) {
  const hero = heroAt(t), cam = camAt(t, hero);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  // transformação de câmera (zoom em torno do herói/porta)
  const FY = 1150;
  ctx.save(); ctx.translate(W / 2, FY); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.x, -cam.y);
  // luz fria do portão largo
  const gx = GATE_X, gl = ctx.createRadialGradient(gx, 900, 0, gx, 900, 900); gl.addColorStop(0, 'rgba(190,210,255,0.45)'); gl.addColorStop(1, 'rgba(190,210,255,0)'); ctx.fillStyle = gl; ctx.fillRect(gx - 900, 0, 1800, 1900);
  // chão
  const fl = ctx.createLinearGradient(0, FLOOR_FAR - 40, 0, 1900); fl.addColorStop(0, '#141414'); fl.addColorStop(1, '#050505'); ctx.fillStyle = fl; ctx.fillRect(-3000, FLOOR_FAR - 20, 6000, 1400);
  // portão largo: moldura enorme com luzes piscando
  ctx.save(); const flick = 0.75 + 0.25 * Math.sin(t * 23) * Math.sin(t * 7.3);
  ctx.strokeStyle = `rgba(230,235,255,${flick})`; ctx.lineWidth = 18; ctx.shadowColor = 'rgba(200,215,255,0.9)'; ctx.shadowBlur = 40;
  ctx.strokeRect(gx - 260, 600, 520, FLOOR_FAR - 580);
  const r2 = mulberry(3); for (let i = 0; i < 26; i++) { const on = Math.sin(t * (6 + i) + i) > 0; ctx.fillStyle = on ? ['#ff4fa3', '#4fd0ff', '#ffe066'][i % 3] : '#222'; const px = gx - 260 + (i % 13) * 43, py = i < 13 ? 580 : FLOOR_FAR - 10; ctx.beginPath(); ctx.arc(px, py, 9, 0, 6.28); ctx.fill(); }
  ctx.fillStyle = 'rgba(235,240,255,0.92)'; ctx.fillRect(gx - 235, 625, 470, FLOOR_FAR - 625);
  ctx.restore();
  // trilha estreita subindo à esquerda + porta pequena dourada
  ctx.save();
  ctx.beginPath(); ctx.moveTo(PATH_X0 + 80, FLOOR_NEAR + 10); ctx.lineTo(DOOR_X + 130, DOOR_Y + 60); ctx.lineTo(DOOR_X - 10, DOOR_Y + 60); ctx.lineTo(PATH_X0 - 120, FLOOR_NEAR + 10); ctx.closePath();
  ctx.fillStyle = '#1b1b1b'; ctx.fill();
  const rk = mulberry(9); ctx.fillStyle = '#2a2a2a'; for (let i = 0; i < 40; i++) { const u = rk(); const x = lerp(PATH_X0 - 100, DOOR_X, u) + (rk() - 0.5) * 120, y = lerp(FLOOR_NEAR, DOOR_Y + 60, u) + rk() * 20; ctx.beginPath(); ctx.ellipse(x, y, 8 + rk() * 16, 5 + rk() * 9, 0, 0, 6.28); ctx.fill(); }
  // morro escuro atrás
  ctx.beginPath(); ctx.moveTo(-3000, FLOOR_FAR); ctx.lineTo(DOOR_X - 400, DOOR_Y + 80); ctx.lineTo(DOOR_X + 260, DOOR_Y + 120); ctx.lineTo(PATH_X0 + 300, FLOOR_FAR); ctx.closePath(); ctx.fillStyle = '#0b0b0b'; ctx.fill();
  const glow = 1 + 3.5 * sm(prog(t, 25.5, 29));
  const dl = ctx.createRadialGradient(DOOR_X + 60, DOOR_Y - 40, 0, DOOR_X + 60, DOOR_Y - 40, 260 * glow); dl.addColorStop(0, 'rgba(255,205,110,0.85)'); dl.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = dl; ctx.fillRect(DOOR_X + 60 - 1200 * glow, DOOR_Y - 40 - 1200 * glow, 2400 * glow, 2400 * glow);
  ctx.fillStyle = '#3a2a14'; ctx.fillRect(DOOR_X + 18, DOOR_Y - 130, 84, 190); ctx.fillStyle = '#ffd98a'; ctx.shadowColor = '#ffc861'; ctx.shadowBlur = 50; ctx.fillRect(DOOR_X + 28, DOOR_Y - 120, 64, 180);
  ctx.restore();
  // poucos subindo em fila (aparecem quando a câmera revela a trilha)
  for (const c of climbers) { const u = ((t * 0.06 + c.off) % 1); const x = lerp(PATH_X0, DOOR_X + 60, u), y = lerp(FLOOR_NEAR - 30, DOOR_Y + 40, u), s = lerp(0.62, 0.42, u); drawFig(ctx, x, y, s, t * 5 + c.off * 9, { col: '#bdbdbd', dir: -1, a: (1 - prog(u, 0.85, 1)) * 0.9 * prog(t, 11, 13) }); }
  // multidão andando para o portão
  const blur = prog(t, 19, 22);
  for (const p of crowd) {
    let x = p.x0 + p.sp * t; const span = 2100; x = ((x + 1100) % span + span) % span - 1100; // loop
    const z = p.z, y = zY(z), s = zS(z), fog = lerp(1, 0.22, z) * lerp(1, 0.45, blur);
    // perto do herói parado, desviam (esbarrões)
    let dx = 0; if (t > 7.6 && t < 18 && Math.abs(z - 0.08) < 0.12) { const d = x - hero.x; if (Math.abs(d) < 70) dx = Math.sign(d || 1) * (70 - Math.abs(d)) * 0.6; }
    if (x > GATE_X - 120) continue; // entraram no portão
    drawFig(ctx, x + dx, y, s, t * 6.2 + p.ph, { col: z > 0.5 ? '#555555' : '#7d7d7d', a: fog * 0.9 });
  }
  // herói (branco, com brilho)
  ctx.save(); ctx.shadowColor = 'rgba(255,255,255,0.95)'; ctx.shadowBlur = 45;
  const hp = hero.walking ? t * (hero.y < FLOOR_NEAR - 50 ? 4.2 : 6.2) : 0;
  drawFig(ctx, hero.x, hero.y + hero.stumble * 18, hero.s, hp, { col: '#ffffff', dir: hero.dir, walking: hero.walking, headX: hero.look * -0.05, lean: hero.stumble * 3, reach: hero.stumble > 0.3 ? hero.stumble : 0 });
  ctx.restore();
  // poeira e vento na subida
  const wk = prog(t, 19.5, 21) * (1 - prog(t, 25, 26.5)); if (wk > 0) { const rd = mulberry(21); ctx.fillStyle = 'rgba(200,200,200,0.5)'; for (let i = 0; i < 120; i++) { const x = ((rd() * 2400 + t * 900 * (0.6 + rd())) % 2400) - 1500, y = 500 + rd() * 900; ctx.globalAlpha = wk * rd(); ctx.fillRect(x, y, 3 + rd() * 10, 2); } ctx.globalAlpha = 1; }
  ctx.restore();

  // névoa + vinheta
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const fog = ctx.createLinearGradient(0, 700, 0, 1200); fog.addColorStop(0, 'rgba(40,40,40,0)'); fog.addColorStop(1, 'rgba(40,40,40,0.22)'); ctx.fillStyle = fog; ctx.fillRect(0, 700, W, 500);
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.25, W / 2, H * 0.5, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.75)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // luz dourada tomando a tela no final
  const gold = sm(prog(t, 27, 29)); if (gold > 0) { ctx.fillStyle = `rgba(255,214,140,${gold * 0.92})`; ctx.fillRect(0, 0, W, H); }
  ctx.globalAlpha = 0.5; ctx.drawImage(grain, -((t * 31) % 30), -((t * 47) % 30), W + 30, H + 30); ctx.globalAlpha = 1;
  // textos
  text(ctx, 'A PORTA LARGA PARECE MAIS FÁCIL.', 330, prog(t, 1, 2) * (1 - prog(t, 11, 12)));
  text(ctx, 'MAS POUCOS ESCOLHEM A ESTREITA.', 330, prog(t, 13, 14) * (1 - prog(t, 23.5, 24.5)));
  if (t > 24.5) { ctx.save(); ctx.globalAlpha = prog(t, 25, 26) * (1 - prog(t, 29.4, 29.9)); ctx.font = '600 40px Inter'; ctx.letterSpacing = '9px'; ctx.textAlign = 'center'; ctx.fillStyle = gold > 0.5 ? '#2a1d08' : '#f2f2f2'; ctx.fillText('MATEUS 7:13-14', W / 2, 330); ctx.restore(); }
  // corte para preto
  const bk = prog(t, 29.4, 29.9); if (bk > 0) { ctx.fillStyle = `rgba(0,0,0,${bk})`; ctx.fillRect(0, 0, W, H); }
  ctx.font = '500 24px Inter'; ctx.letterSpacing = '0px'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillText('animação feita com IA · @e_cosdafe', W / 2, 1860);
}

const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
if (FRAMES) {
  const fs = require('fs');
  for (const t of FRAMES) { draw(ctx, t); fs.writeFileSync(path.join(path.dirname(OUT), `f_${String(t.toFixed(1)).padStart(4, '0')}.png`), canvas.toBuffer('image/png')); }
  process.exit(0);
}
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
(async () => {
  for (let f = 0; f < DUR * FPS; f++) { draw(ctx, f / FPS); const buf = canvas.data(); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); ff.on('close', () => console.log('ok'));
})();
