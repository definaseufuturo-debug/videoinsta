#!/usr/bin/env python3
"""Acrescenta no FINAL do vídeo um cartão de CTA de 3 s: SEGUE / COMENTA / COMPARTILHA.
Uso: python3 pipeline/cta.py <entrada.mp4> <saida.mp4> <perfil>
perfil: mindloop (@mindloop_u) | cristao (@e_cosdafe) | jesusislove (JesusIsLove)
Rode como ÚLTIMO passo, depois do build (e depois de qualquer mixagem), antes de copiar para videos/."""
import sys, subprocess, tempfile, os
from PIL import Image, ImageDraw, ImageFont
PERFIS = {
    "mindloop":    dict(handle="@mindloop_u", bg=(10, 10, 14), fg=(255, 255, 255), ac=(230, 40, 40)),
    "cristao":     dict(handle="@e_cosdafe", bg=(13, 59, 92), fg=(255, 244, 220), ac=(143, 200, 230)),
    "jesusislove": dict(handle="@JesusIsLove", bg=(10, 10, 14), fg=(255, 255, 255), ac=(230, 40, 40)),
}
DUR = 3.0
def fonte(sz):
    for p in ("/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
def cartao(perfil, path):
    P = PERFIS[perfil]; W, H = 1080, 1920
    im = Image.new("RGB", (W, H), P["bg"]); d = ImageDraw.Draw(im)
    def c(txt, y, sz, col):
        f = fonte(sz); w = d.textlength(txt, font=f); d.text(((W - w) / 2, y), txt, font=f, fill=col)
    c("GOSTOU?", 520, 110, P["fg"])
    c("SEGUE " + P["handle"], 700, 84, P["ac"])
    c("COMENTA", 900, 110, P["fg"])
    c("COMPARTILHA", 1060, 110, P["fg"])
    c("com quem precisa ver isso", 1240, 54, P["fg"])
    im.save(path)
def main():
    ent, sai, perfil = sys.argv[1:4]
    tmp = tempfile.mkdtemp(); png = os.path.join(tmp, "cta.png"); cartao(perfil, png)
    fps = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", ent]).decode().strip()
    fc = ("[1:v]fps={f},format=yuv420p,fade=t=in:st=0:d=0.25[cv];[2:a]anull[ca];"
          "[0:v]format=yuv420p[v0];[v0][0:a][cv][ca]concat=n=2:v=1:a=1[v][a]").format(f=fps)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", ent, "-loop", "1", "-t", str(DUR), "-i", png,
        "-f", "lavfi", "-t", str(DUR), "-i", "anullsrc=r=44100:cl=stereo", "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-ar", "44100",
        "-movflags", "+faststart", sai], check=True)
    print("ok", sai)
main()
