#!/usr/bin/env python3
"""Coletânea horizontal GENÉRICA (uso: python3 longos/coletanea/montar.py spec.json pasta_saida).
Coletânea horizontal (1920x1080) de bonequinhos verticais de pais e filhos para o YouTube JesusIsLove.
Vertical no centro, laterais desenhadas (número/título e versículo), cartões de transição, abertura e final."""
import subprocess, os, textwrap
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT = "/home/claude/videoinsta"; F = ROOT + "/pipeline/template_cristao/assets/fonts/"; 
W, H = 1920, 1080; BG = (11, 11, 14); WH = (245, 241, 234); RED = (224, 38, 43); MUTE = (139, 139, 149); GOLD = (242, 184, 75)
import json, sys
SPEC = json.load(open(sys.argv[1]))  # {"historias": [[arquivo, título, versículo, referência, segundos], ...], "intro": [linha1, linha2, linha3]}
OUT = sys.argv[2] if len(sys.argv) > 2 else "build"; os.makedirs(OUT, exist_ok=True)
H_ = [tuple(h) for h in SPEC["historias"]]
N = len(H_)
def f(w, s): return ImageFont.truetype(F + f"Inter-{w}.otf", s)
def canvas():
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    g = Image.new("L", (W, H), 0); gd = ImageDraw.Draw(g); gd.ellipse((W * 0.15, -H * 0.2, W * 0.85, H * 1.2), fill=60); g = g.filter(ImageFilter.GaussianBlur(220))
    im = Image.composite(Image.new("RGB", (W, H), (34, 30, 36)), im, g); return im, ImageDraw.Draw(im)
def center(d, txt, y, font, col, x0=0, x1=W):
    w = d.textlength(txt, font=font); d.text((x0 + (x1 - x0 - w) / 2, y), txt, font=font, fill=col)
def wrap(d, txt, font, maxw):
    words, lines, cur = txt.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w_
    lines.append(cur); return lines
def painel(i, path):
    _, tit, vers, ref, _ = H_[i]; im, d = canvas()
    X0, X1 = 70, 600
    d.text((X0, 330), f"HISTÓRIA {i+1} DE {N}", font=f("ExtraBold", 34), fill=RED)
    y = 395
    for ln in wrap(d, tit, f("Black", 76), X1 - X0): d.text((X0, y), ln, font=f("Black", 76), fill=WH); y += 88
    d.rectangle((X0, y + 20, X0 + 120, y + 26), fill=RED)
    R0, R1 = 1320, 1860; y = 410
    d.text((R0 - 6, 262), "“", font=f("Black", 120), fill=GOLD)
    for ln in wrap(d, vers, f("SemiBold", 46), R1 - R0): d.text((R0, y), ln, font=f("SemiBold", 46), fill=WH); y += 60
    d.text((R0, y + 24), ref, font=f("Bold", 34), fill=GOLD)
    center(d, "JesusIsLove", 1000, f("Bold", 28), MUTE, R0, R1)
    # moldura do vídeo
    d.rectangle((654, 0, 656, H), fill=(40, 40, 46)); d.rectangle((1264, 0, 1266, H), fill=(40, 40, 46))
    im.save(path)
def cartao(path, linhas):
    im, d = canvas()
    for txt, y, font, col in linhas: center(d, txt, y, font, col)
    im.save(path)
ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"]
def still(png, dur, out, fade=True):
    vf = f"fade=t=in:d=0.4,fade=t=out:st={dur-0.4}:d=0.4" if fade else "null"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-loop", "1", "-t", str(dur), "-i", png, "-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=48000:cl=stereo", "-vf", vf, "-shortest"] + ENC + [out], check=True)
def historia(i, out):
    src, _, _, _, dur = H_[i]; png = f"{OUT}/painel{i}.png"; painel(i, png)
    fc = f"[1:v]trim=0:{dur},setpts=PTS-STARTPTS,scale=608:1080[v];[0:v][v]overlay=656:0:shortest=1,fade=t=in:d=0.3,fade=t=out:st={dur-0.4}:d=0.4[o];[1:a]atrim=0:{dur},asetpts=PTS-STARTPTS,afade=t=in:d=0.2,afade=t=out:st={dur-0.5}:d=0.5[a]"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-loop", "1", "-i", png, "-i", ROOT + "/" + src, "-filter_complex", fc, "-map", "[o]", "-map", "[a]", "-t", str(dur)] + ENC + [out], check=True)
partes = []
cartao(f"{OUT}/intro.png", [(f"{N} HISTÓRIAS DE", 330, f("Black", 110), WH), ("PAIS E FILHOS", 460, f("Black", 130), RED), (SPEC.get("subtitulo", "que vão te fazer ligar pra sua família hoje"), 650, f("SemiBold", 48), WH), ("assista até o fim", 760, f("Bold", 34), MUTE)])
still(f"{OUT}/intro.png", 5.5, f"{OUT}/p00.mp4"); partes.append("p00.mp4")
for i in range(N):
    cartao(f"{OUT}/t{i}.png", [(f"{i+1}", 300, f("Black", 260), RED), (H_[i][1], 640, f("Black", 96), WH)])
    still(f"{OUT}/t{i}.png", 2.2, f"{OUT}/t{i:02d}.mp4"); partes.append(f"t{i:02d}.mp4")
    historia(i, f"{OUT}/h{i:02d}.mp4"); partes.append(f"h{i:02d}.mp4")
cartao(f"{OUT}/fim.png", [("QUAL DESSAS MAIS", 300, f("Black", 96), WH), ("MEXEU COM VOCÊ?", 410, f("Black", 96), WH), ("comenta o número", 560, f("Bold", 56), GOLD), ("e manda pra alguém que você ama", 640, f("SemiBold", 44), WH), ("INSCREVA-SE: JesusIsLove", 820, f("ExtraBold", 50), RED)])
still(f"{OUT}/fim.png", 7, f"{OUT}/p99.mp4"); partes.append("p99.mp4")
open(f"{OUT}/lista.txt", "w").write("".join(f"file '{p}'\n" for p in partes))
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{OUT}/lista.txt", "-c", "copy", f"{OUT}/coletanea.mp4"], check=True)
print("ok")
