#!/usr/bin/env node
/* Moldura "texto em cima, vídeo no meio, versículo embaixo" (estilo card de fé), 1080x1920.
   Uso: node pipeline/moldura/moldura.js <config.json>
   config: {
     "topo": "A segurança do seu lar não depende da tempestade lá fora...",
     "sub": "Uma mensagem de fé e esperança",            (opcional)
     "verso": "Deus é o nosso refúgio e fortaleza.",
     "ref": "SALMOS 46:1",
     "final": "Que a presença de Deus nunca falte em seu lar.",   (opcional)
     "clip": "broll/out/<slug>/01.mp4", "clip_inicio": 0,
     "duracao": 12, "tema": "claro" | "escuro", "saida": "producoes/<slug>/build/video.mp4"
   }
   Gera um MP4 sem áudio; a música entra depois com pipeline/trilha.py mixar (sem --duck, ou com --duck se tiver voz).
   Sem emoji nos textos (a fonte não tem). */
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');

const ROOT = path.resolve(__dirname, '../..');
const FONTS = path.join(ROOT, 'pipeline/template_cristao/assets/fonts');
for (const f of fs.readdirSync(FONTS)) GlobalFonts.registerFromPath(path.join(FONTS, f), f.replace(/\.(otf|ttf)$/, ''));

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const W = 1080, H = 1920, M = 70;
const TEMAS = {
  claro: { fundo: '#ffffff', texto: '#111111', suave: '#3a3a3a', ouro: '#B8913A', sombra: 'rgba(0,0,0,0.18)' },
  escuro: { fundo: '#0f0f12', texto: '#f4f1ea', suave: '#c9c4ba', ouro: '#D9B25F', sombra: 'rgba(0,0,0,0.6)' },
};
const T = TEMAS[cfg.tema || 'claro'];
const VW = 940, VH = 705, VR = 28;            // caixa do vídeo (4:3) e raio dos cantos
const DUR = cfg.duracao || 12;

function quebra(ctx, texto, larg) {
  const linhas = []; let atual = '';
  for (const p of texto.split(/\s+/)) {
    const t = atual ? atual + ' ' + p : p;
    if (ctx.measureText(t).width > larg && atual) { linhas.push(atual); atual = p; } else atual = t;
  }
  if (atual) linhas.push(atual);
  return linhas;
}
// bloco de texto: {texto, fonte, tam, cor, alt (altura da linha), esp (espaçamento entre letras)}
function medir(b) {
  if (!b.texto) return { ...b, linhas: [], h: 0 };
  const c = createCanvas(10, 10).getContext('2d'); c.font = `${b.tam}px ${b.fonte}`;
  if (b.esp) c.letterSpacing = `${b.esp}px`;
  let tam = b.tam, linhas = quebra(c, b.texto, W - 2 * M);
  while (b.max && linhas.length > b.max && tam > 40) { tam -= 4; c.font = `${tam}px ${b.fonte}`; linhas = quebra(c, b.texto, W - 2 * M); }
  return { ...b, tam, linhas, h: linhas.length * tam * b.alt };
}
const blocos = {
  topo: medir({ texto: cfg.topo, fonte: 'Inter-Black', tam: 80, cor: T.texto, alt: 1.16, max: 4 }),
  sub: medir({ texto: cfg.sub, fonte: 'Inter-Medium', tam: 44, cor: T.suave, alt: 1.3, max: 2 }),
  verso: medir({ texto: cfg.verso, fonte: 'Inter-ExtraBold', tam: 66, cor: T.texto, alt: 1.2, max: 3 }),
  ref: medir({ texto: (cfg.ref || '').toUpperCase(), fonte: 'Inter-Black', tam: 58, cor: T.ouro, alt: 1.25, esp: 2 }),
  final: medir({ texto: cfg.final, fonte: 'Inter-Regular', tam: 46, cor: T.suave, alt: 1.32, max: 3 }),
};
// pilha centralizada entre y=150 e y=1720 (fora da área coberta pela interface do Reels)
const G = { topo_sub: 22, sub_vid: 52, vid_verso: 58, verso_ref: 20, ref_final: 24 };
const total = blocos.topo.h + (blocos.sub.h ? G.topo_sub + blocos.sub.h : 0) + G.sub_vid + VH + G.vid_verso + blocos.verso.h
  + (blocos.ref.h ? G.verso_ref + blocos.ref.h : 0) + (blocos.final.h ? G.ref_final + blocos.final.h : 0);
let y = Math.max(150, 150 + (1570 - total) / 2);
const pos = {};
pos.topo = y; y += blocos.topo.h;
if (blocos.sub.h) { y += G.topo_sub; pos.sub = y; y += blocos.sub.h; }
y += G.sub_vid; const VX = (W - VW) / 2, VY = Math.round(y); y += VH + G.vid_verso;
pos.verso = y; y += blocos.verso.h;
if (blocos.ref.h) { y += G.verso_ref; pos.ref = y; y += blocos.ref.h; }
if (blocos.final.h) { y += G.ref_final; pos.final = y; y += blocos.final.h; }
if (y > 1760) console.error(`aviso: o texto passou do limite (${Math.round(y)} px); encurte topo/verso/final`);

function camada(nomes) {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (const n of nomes) {
    const b = blocos[n]; if (!b.h) continue;
    ctx.font = `${b.tam}px ${b.fonte}`; ctx.fillStyle = b.cor; ctx.letterSpacing = `${b.esp || 0}px`;
    b.linhas.forEach((l, i) => ctx.fillText(l, W / 2, pos[n] + i * b.tam * b.alt + b.tam * (b.alt - 1) / 2));
  }
  return cv;
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'moldura-'));
const salvar = (cv, nome) => { const p = path.join(tmp, nome); fs.writeFileSync(p, cv.toBuffer('image/png')); return p; };
function arred(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
// fundo com sombra suave atrás do vídeo
const fundo = createCanvas(W, H), fc = fundo.getContext('2d');
fc.fillStyle = T.fundo; fc.fillRect(0, 0, W, H);
fc.save(); fc.shadowColor = T.sombra; fc.shadowBlur = 40; fc.shadowOffsetY = 14; fc.fillStyle = T.fundo;
arred(fc, VX, VY, VW, VH, VR); fc.fill(); fc.restore();
// máscara dos cantos arredondados
const masc = createCanvas(VW, VH), mc = masc.getContext('2d');
mc.fillStyle = '#000'; mc.fillRect(0, 0, VW, VH); mc.fillStyle = '#fff'; arred(mc, 0, 0, VW, VH, VR); mc.fill();

const P = {
  fundo: salvar(fundo, 'fundo.png'), masc: salvar(masc, 'masc.png'),
  topo: salvar(camada(['topo', 'sub']), 'topo.png'), verso: salvar(camada(['verso']), 'verso.png'),
  ref: salvar(camada(['ref']), 'ref.png'), final: salvar(camada(['final']), 'final.png'),
};
// entradas: 0 fundo, 1 clipe, 2 máscara, 3 topo, 4 verso, 5 ref, 6 final
const ENTRA = { topo: 0.15, video: 0.5, verso: 1.4, ref: 2.0, final: 2.7 };
const sobe = (s) => `y='if(lt(t,${s}),36,36*max(0,1-(t-${s})/0.7))'`;
const fc2 = [
  `[1:v]scale=${VW}:${VH}:force_original_aspect_ratio=increase,crop=${VW}:${VH},setsar=1,fps=30,format=rgba[cl]`,
  `[2:v]format=gray[mk]`, `[cl][mk]alphamerge,fade=in:st=${ENTRA.video}:d=0.6:alpha=1[vid]`,
  `[0:v][vid]overlay=${VX}:${VY}[b0]`,
  `[3:v]format=rgba,fade=in:st=${ENTRA.topo}:d=0.7:alpha=1[l3]`, `[b0][l3]overlay=0:${sobe(ENTRA.topo)}[b1]`,
  `[4:v]format=rgba,fade=in:st=${ENTRA.verso}:d=0.7:alpha=1[l4]`, `[b1][l4]overlay=0:${sobe(ENTRA.verso)}[b2]`,
  `[5:v]format=rgba,fade=in:st=${ENTRA.ref}:d=0.6:alpha=1[l5]`, `[b2][l5]overlay=0:${sobe(ENTRA.ref)}[b3]`,
  `[6:v]format=rgba,fade=in:st=${ENTRA.final}:d=0.7:alpha=1[l6]`, `[b3][l6]overlay=0:${sobe(ENTRA.final)},format=yuv420p[v]`,
].join(';');
const img = (p) => ['-loop', '1', '-framerate', '30', '-t', String(DUR), '-i', p];
const saida = path.resolve(ROOT, cfg.saida);
fs.mkdirSync(path.dirname(saida), { recursive: true });
execFileSync('ffmpeg', ['-v', 'error', '-y', ...img(P.fundo), '-stream_loop', '-1', '-ss', String(cfg.clip_inicio || 0), '-i', path.resolve(ROOT, cfg.clip),
  ...img(P.masc), ...img(P.topo), ...img(P.verso), ...img(P.ref), ...img(P.final),
  '-filter_complex', fc2, '-map', '[v]', '-t', String(DUR), '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', saida], { stdio: 'inherit' });
fs.rmSync(tmp, { recursive: true, force: true });
console.log('ok', path.relative(ROOT, saida), `(${DUR}s; capa sugerida: ${Math.round((ENTRA.final + 1) * 1000)} ms)`);
