#!/usr/bin/env node
/*
 * Renderiza a animação quadro a quadro (mesmo código do player) e gera o MP4 final
 * 1080x1920, H.264 (yuv420p) + AAC, pronto para Reels/TikTok/Shorts.
 *
 *   node render.js                     -> build/cerebro_aprende.mp4
 *   node render.js --workers 4         (processos em paralelo; padrão = nº de CPUs)
 *   node render.js --from 30 --to 36   (trecho para conferência rápida)
 *   node render.js --frames 1.2,8,44   (exporta PNGs desses instantes em build/frames/)
 */
const fs = require('fs'), path = require('path'), os = require('os');
const { spawn, execFileSync } = require('child_process');
const { createCanvas, GlobalFonts, loadImage } = require('@napi-rs/canvas');
const F1Anim = require('./src/anim.js');

const ROOT = __dirname, BUILD = path.join(ROOT, 'build');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
for (const f of fs.readdirSync(path.join(ROOT, 'assets/fonts'))) GlobalFonts.registerFromPath(path.join(ROOT, 'assets/fonts', f), f.startsWith('Inter') ? 'Inter' : f.split('-')[0]);
const TL = JSON.parse(fs.readFileSync(path.join(BUILD, 'timeline.json')));
const FPS = +arg('fps', TL.fps || 30);
let anim, W = 1080, H = 1920; // criados em main(), depois de carregar a foto do produto

function ffmpeg(args, opts = {}) { return spawn('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['pipe', 'inherit', 'inherit'], ...opts }); }

async function renderRange(f0, f1, out) { // renderiza quadros [f0, f1) num arquivo de vídeo
  const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
  const enc = ffmpeg(['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS), out]);
  const done = new Promise((res, rej) => enc.on('close', c => (c ? rej(new Error('ffmpeg ' + c)) : res())));
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    anim.draw(ctx, f / FPS);
    const buf = canvas.data();
    if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
    if (process.send && (f - f0) % 15 === 0) process.send({ done: f - f0 + 1 });
  }
  enc.stdin.end(); await done;
  return (Date.now() - t0) / 1000;
}

async function main() {
  const images = {}; const fdir = path.join(ROOT, 'assets/fotos');
  if (fs.existsSync(fdir)) for (const f of fs.readdirSync(fdir)) if (f.endsWith('.png')) images[f.replace('.png', '')] = await loadImage(path.join(fdir, f));
  anim = F1Anim.create(TL, { createCanvas, images }); W = anim.width; H = anim.height;
  if (process.argv.includes('--worker')) { // processo filho
    const [f0, f1, out] = [+arg('f0'), +arg('f1'), arg('out')];
    await renderRange(f0, f1, out); process.send({ finished: true }); process.exit(0);
  }
  if (arg('frames')) { // PNGs de conferência
    const dir = path.join(BUILD, 'frames'); fs.mkdirSync(dir, { recursive: true });
    const c = createCanvas(W, H), ctx = c.getContext('2d');
    for (const t of arg('frames').split(',').map(Number)) { anim.draw(ctx, t); fs.writeFileSync(path.join(dir, `t_${t.toFixed(2)}.png`), c.toBuffer('image/png')); }
    console.log('PNGs em build/frames/'); return;
  }
  const audio = path.join(BUILD, 'audio_final.wav');
  if (!fs.existsSync(audio)) throw new Error('Falta build/audio_final.wav — rode antes: npm run audio');
  const from = +arg('from', 0), to = Math.min(+arg('to', anim.duration), anim.duration);
  const F0 = Math.round(from * FPS), F1 = Math.round(to * FPS), total = F1 - F0;
  const workers = Math.max(1, Math.min(+arg('workers', os.cpus().length), 8));
  const partsDir = path.join(BUILD, 'parts'); fs.rmSync(partsDir, { recursive: true, force: true }); fs.mkdirSync(partsDir, { recursive: true });
  console.log(`Renderizando ${total} quadros (${(total / FPS).toFixed(2)} s @ ${FPS} fps, ${W}x${H}) com ${workers} processo(s)…`);
  const t0 = Date.now(), per = Math.ceil(total / workers), prog = new Array(workers).fill(0), parts = [];
  await Promise.all(Array.from({ length: workers }, (_, i) => new Promise((res, rej) => {
    const a = F0 + i * per, b = Math.min(F1, a + per); if (a >= b) return res();
    const out = path.join(partsDir, `part_${String(i).padStart(2, '0')}.mp4`); parts[i] = out;
    const ch = require('child_process').fork(__filename, ['--worker', '--f0', a, '--f1', b, '--out', out]);
    ch.on('message', m => { if (m.done) { prog[i] = m.done; const d = prog.reduce((s, x) => s + x, 0); process.stdout.write(`\r  ${d}/${total} quadros  (${((Date.now() - t0) / 1000).toFixed(0)} s)   `); } });
    ch.on('exit', c => (c ? rej(new Error('worker ' + i + ' falhou')) : res()));
  })));
  const list = path.join(partsDir, 'list.txt');
  fs.writeFileSync(list, parts.filter(Boolean).map(p => `file '${p}'`).join('\n'));
  const out = arg('out', path.join(BUILD, from === 0 && to === anim.duration ? 'video.mp4' : `trecho_${from}-${to}.mp4`));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-ss', String(from), '-t', String(to - from), '-i', audio,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out]);
  fs.rmSync(partsDir, { recursive: true, force: true });
  console.log(`\nPronto: ${path.relative(ROOT, out)}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
main().catch(e => { console.error(e); process.exit(1); });
