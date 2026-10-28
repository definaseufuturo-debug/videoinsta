"""Corrida de ranking: maiores economias da América Latina (PIB, Banco Mundial 1960-2023)."""
import json, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H, FPS, SR = 1080, 1920, 30, 44100
F = "/home/claude/fonts/"
ANTON, SANS, TYPE = F + "Anton-Regular.ttf", F + "MontserratBold.ttf", F + "SpecialElite.ttf"
OUT = "/home/claude/rank/"
VO = "/home/claude/videoinsta/tts/out/2026-10-28-ranking-latam/"
INK = (28, 34, 30)
S = {k: {int(y): v for y, v in d.items()} for k, d in json.load(open(OUT + "data/series.json")).items()}
NAMES = dict(ARG="Argentina", BRA="Brasil", MEX="México", VEN="Venezuela", CHL="Chile", COL="Colômbia", PER="Peru", PRI="Porto Rico",
             URY="Uruguai", ECU="Equador", CUB="Cuba", GTM="Guatemala", DOM="R. Dominicana", SLV="El Salvador", PAN="Panamá",
             CRI="Costa Rica", BOL="Bolívia", HND="Honduras", PRY="Paraguai", NIC="Nicarágua")
ISO2 = dict(ARG="ar", BRA="br", MEX="mx", VEN="ve", CHL="cl", COL="co", PER="pe", PRI="pr", URY="uy", ECU="ec", CUB="cu", GTM="gt",
            DOM="do", SLV="sv", PAN="pa", CRI="cr", BOL="bo", HND="hn", PRY="py", NIC="ni")
COL = dict(BRA=(34, 150, 80), MEX=(190, 40, 50), ARG=(95, 165, 220), VEN=(230, 180, 20), CHL=(40, 70, 170), COL=(240, 200, 40),
           PER=(215, 60, 60), PRI=(220, 80, 80), URY=(70, 110, 190), ECU=(235, 190, 30), CUB=(50, 90, 170), GTM=(90, 160, 220),
           DOM=(40, 70, 150), SLV=(40, 90, 180), PAN=(200, 60, 70), CRI=(50, 70, 150), BOL=(60, 150, 70), HND=(70, 130, 200),
           PRY=(190, 50, 60), NIC=(60, 110, 200))
TOP = 10

def fnt(p, s): return ImageFont.truetype(p, s)

def flag_circle(code, d=62):
    im = Image.open(f"/home/claude/rank/flags/{ISO2[code]}.png").convert("RGBA").resize((d * 3, d * 3), Image.LANCZOS)
    m = Image.new("L", (d * 3, d * 3), 0); ImageDraw.Draw(m).ellipse([0, 0, d * 3 - 1, d * 3 - 1], fill=255)
    out = Image.new("RGBA", (d * 3 + 18, d * 3 + 18), (0, 0, 0, 0)); ImageDraw.Draw(out).ellipse([0, 0, d * 3 + 17, d * 3 + 17], fill=(255, 255, 255, 255))
    out.paste(im, (9, 9), m); ImageDraw.Draw(out).ellipse([0, 0, d * 3 + 17, d * 3 + 17], outline=COL[code] + (255,), width=10)
    return out.resize((d + 6, d + 6), Image.LANCZOS)
FLAGS = {c: flag_circle(c) for c in NAMES}

# ---------- narração e linha do tempo ----------
def load_wav(p):
    w = wave.open(p); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    return np.interp(np.arange(0, len(x), sr / SR), np.arange(len(x)), x)
CLIP_AT = [0.6, 19.0, 30.0, 41.2, 48.8]
texts = json.load(open("/home/claude/videoinsta/tts/jobs/2026-10-28-ranking-latam.json"))["clips"]
clips = []
for (c, t0) in zip(texts, CLIP_AT):
    x = load_wav(VO + c["id"] + ".wav")
    clips.append(dict(t0=t0, x=x, t1=t0 + len(x) / SR, words=c["text"].split()))
DUR = clips[-1]["t1"] + 1.8
KEYS = [(0, 1960), (5.0, 1960), (19.0, 1998), (26.0, 2005), (31.0, 2011), (35.0, 2011), (41.0, 2023), (DUR, 2023)]

def year_at(t):
    for (a, ya), (b, yb) in zip(KEYS, KEYS[1:]):
        if a <= t <= b:
            p = (t - a) / (b - a) if b > a else 1
            if ya == yb: return ya
            # leve aceleração nas pontas para não dar tranco
            p = p * p * (3 - 2 * p) * 0.35 + p * 0.65
            return ya + (yb - ya) * p
    return KEYS[-1][1]

def value(c, y):
    s = S[c]; y0 = int(np.floor(y)); f = y - y0
    if y0 not in s: return None
    if y0 + 1 in s: return float(np.exp(np.log(s[y0]) * (1 - f) + np.log(s[y0 + 1]) * f))
    return s[y0] if (f < 0.5 or y0 == 2023) else None

def fmt(v):
    b = v / 1e9
    if b >= 1000: return "US$ " + f"{b / 1000:.2f}".replace(".", ",") + " tri"
    if b >= 100: return "US$ " + f"{b:.0f}" + " bi"
    return "US$ " + f"{b:.1f}".replace(".", ",") + " bi"

# ---------- fundo ----------
yy, xx = np.mgrid[0:H, 0:W]
g = (1 - yy / H)[..., None] * np.array([12, 10, 6]) + np.array([214, 224, 208])
bg = Image.fromarray(np.clip(g + np.random.default_rng(1).normal(0, 2.5, (H, W, 1)), 0, 255).astype(np.uint8)).convert("RGBA")
d = ImageDraw.Draw(bg)
for x in range(0, W, 60): d.line([x, 0, x, H], fill=(200, 212, 196, 255), width=1)
for y in range(0, H, 60): d.line([0, y, W, y], fill=(200, 212, 196, 255), width=1)
ft, fs, fsmall = fnt(ANTON, 92), fnt(SANS, 32), fnt(SANS, 24)
d.text((W // 2, 250), "AS MAIORES ECONOMIAS", font=ft, fill=INK, anchor="mt")
d.text((W // 2, 352), "DA AMÉRICA LATINA", font=ft, fill=(34, 120, 70), anchor="mt")
d.text((W // 2, 466), "PIB em dólares da época  ·  1960 a 2023", font=fs, fill=(70, 80, 72), anchor="mt")
d.text((W // 2, 1500), "Fonte: Banco Mundial (PIB, US$ correntes)", font=fsmall, fill=(80, 90, 82), anchor="mt")

fname, fval, fyear, fcap, frank = fnt(SANS, 32), fnt(SANS, 30), fnt(ANTON, 150), fnt(SANS, 50), fnt(ANTON, 30)
ROW0, RH, BX, BMAX = 570, 72, 400, 380
pos = {}

def draw_frame(t, state):
    fr = bg.copy(); d = ImageDraw.Draw(fr); y = year_at(t)
    vals = {c: value(c, y) for c in NAMES}
    prev = state.setdefault("_order", [])
    live = [c for c in prev if vals.get(c)] + sorted([c for c in NAMES if vals[c] and c not in prev], key=lambda c: -vals[c])
    thr = 1.0 if abs(year_at(t) - year_at(max(0, t - 1 / FPS))) < 1e-6 else 1.03
    for i in range(1, len(live)):  # ordenação com histerese de 3% para não ficar trocando
        j = i
        while j > 0 and vals[live[j]] > vals[live[j - 1]] * thr: live[j - 1], live[j] = live[j], live[j - 1]; j -= 1
    state["_order"] = live
    vmax = vals[live[0]]
    for r, c in enumerate(live):
        tgt = r
        p = state.get(c, tgt + 3); p += (tgt - p) * 0.3; state[c] = p
    for c in [k for k in state if k != '_order']:
        if c not in live: state[c] += 0.25
    order = sorted([k for k in state if k != '_order'], key=lambda c: -state[c])  # desenha de baixo pra cima
    for c in order:
        p = state[c]
        if p > TOP + 0.5: continue
        a = 1.0 if p <= TOP - 1 else max(0.0, (TOP + 0.5 - p) / 1.5)
        yrow = int(ROW0 + p * RH)
        v = vals.get(c) or S[c][max(S[c])]
        bw = max(6, int(BMAX * v / vmax))
        layer = Image.new("RGBA", (W, RH), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
        ld.text((BX - 92, RH // 2), NAMES[c], font=fname, fill=INK, anchor="rm")
        ld.rounded_rectangle([BX, 12, BX + bw, RH - 12], 8, fill=COL[c] + (235,))
        ld.text((BX + bw + 14, RH // 2), fmt(v), font=fval, fill=INK, anchor="lm")
        layer.alpha_composite(FLAGS[c], (BX - 80, (RH - FLAGS[c].height) // 2))
        if c not in live: a *= 0.5
        if a < 1: layer.putalpha(layer.getchannel("A").point(lambda q: int(q * a)))
        fr.alpha_composite(layer, (0, yrow - RH // 2))
    # medalha do 1º lugar
    d.ellipse([18, ROW0 - 24, 66, ROW0 + 24], fill=(214, 168, 40)); d.text((42, ROW0), "1º", font=frank, fill=(255, 255, 255), anchor="mm")
    # ano + barra de progresso
    yi = int(round(y)) if abs(y - round(y)) < 0.02 else int(np.floor(y))
    d.text((60, 1470), str(yi), font=fyear, fill=INK, anchor="ls")
    px0, px1, py = 420, 1020, 1410; prog = (y - 1960) / 63
    d.rounded_rectangle([px0, py - 9, px1, py + 9], 9, fill=(190, 202, 186))
    d.rounded_rectangle([px0, py - 9, px0 + max(18, int((px1 - px0) * prog)), py + 9], 9, fill=(34, 120, 70))
    for yl in (1960, 1980, 2000, 2023):
        xl = px0 + (px1 - px0) * (yl - 1960) / 63; d.text((xl, py + 22), str(yl), font=fsmall, fill=(80, 90, 82), anchor="mt")
    if y > 2014.5: d.text((W // 2, 1536), "*Venezuela sem dados do Banco Mundial após 2014" + ("; Cuba, após 2020" if y > 2020.5 else ""), font=fnt(SANS, 22), fill=(110, 115, 110), anchor="mt")
    # legenda da narração
    for cl in clips:
        if cl["t0"] - .05 <= t < cl["t1"] + .3:
            ws = cl["words"]; n = len(ws); k = min(n, int((t - cl["t0"]) / max(cl["t1"] - cl["t0"], .1) * n) + 1)
            a0 = ((k - 1) // 5) * 5; shown = ws[a0:k]; txt = " ".join(shown); tw = fcap.getbbox(txt)[2]
            while tw > 960: shown = shown[1:]; txt = " ".join(shown); tw = fcap.getbbox(txt)[2]
            x = (W - tw) // 2; yc = 1610
            d.rounded_rectangle([x - 24, yc - 14, x + tw + 24, yc + 72], 14, fill=(28, 34, 30, 235))
            for i, wd in enumerate(shown):
                d.text((x, yc), wd, font=fcap, fill=(150, 230, 160) if i == len(shown) - 1 else (245, 245, 240)); x += fcap.getbbox(wd + " ")[2]
    return fr.convert("RGB")

def render(sheet=False):
    state = {}
    n = int(DUR * FPS)
    if sheet:
        want = set(int(x * FPS) for x in [2, 8, 12, 16, 20, 23, 27, 32, 38, 43, 50, n / FPS - .5]); ims = []
    else:
        ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                               "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", OUT + "silent.mp4"], stdin=subprocess.PIPE)
    for fi in range(n):
        im = draw_frame(fi / FPS, state)
        if sheet:
            if fi in want: ims.append(im.resize((270, 480)))
        else: ff.stdin.write(im.tobytes())
    if sheet:
        m = Image.new("RGB", (270 * 6, 480 * ((len(ims) + 5) // 6)), "white")
        for i, im in enumerate(ims): m.paste(im, ((i % 6) * 270, (i // 6) * 480))
        m.save(OUT + "sheet.png")
    else: ff.stdin.close(); ff.wait()

def audio():
    n = int(DUR * SR); t = np.arange(n) / SR; r = np.random.default_rng(4)
    lp = lambda x, k: np.convolve(x, np.ones(k) / k, "same")
    saw = lambda f, tt: 2 * ((tt * f) % 1) - 1
    bpm = 112; beat = 60 / bpm
    prog = [(110.0, (220.0, 261.63, 329.63)), (87.31, (174.61, 220.0, 261.63)), (130.81, (261.63, 329.63, 392.0)), (98.0, (196.0, 246.94, 293.66))]
    mus = np.zeros(n)
    intensity = np.clip(0.45 + 0.55 * t / 41.0, 0, 1)
    k = 0; s = 0.0
    while s < DUR - 1:
        root, chord = prog[int(s / (beat * 8)) % 4]
        a = int(s * SR); L = min(int(beat / 2 * SR), n - a); tt = t[:L]
        note = root * (2 if k % 4 == 3 else 1)
        mus[a:a + L] += lp(saw(note, tt) + saw(note * 1.005, tt), 30) * np.exp(-tt * 6) * .22 * intensity[a]
        if k % 2 == 0:  # bumbo nos tempos
            Lk = min(int(.3 * SR), n - a); tk = t[:Lk]
            mus[a:a + Lk] += .5 * np.sin(2 * np.pi * (55 + 60 * np.exp(-tk * 30)) * tk) * np.exp(-tk * 9) * intensity[a] * (1 if s > 5 else .4)
        k += 1; s += beat / 2
    # pad de cordas por acorde
    for i in range(int(DUR / (beat * 8)) + 1):
        a = int(i * beat * 8 * SR); L = min(int(beat * 8 * SR), n - a)
        if L <= 0: break
        tt = t[:L]; env = np.minimum(1, tt / .6) * np.minimum(1, (L / SR - tt) / .6)
        for f in prog[i % 4][1]: mus[a:a + L] += env * lp(saw(f, tt) + saw(f * 1.004, tt), 18) * .045
    def hit(s0, g=1.0):
        a = int(s0 * SR); L = min(int(2.2 * SR), n - a); tt = t[:L]
        mus[a:a + L] += g * (.9 * np.sin(2 * np.pi * (48 - 12 * tt) * tt) * np.exp(-tt * 3.5) + .25 * lp(r.normal(0, 1, L), 6) * np.exp(-tt * 8))
    def riser(s0, d=2.0):
        a = int((s0 - d) * SR); L = int(d * SR); tt = np.linspace(0, 1, L); nz = r.normal(0, 1, L); nz = nz - lp(nz, 10)
        mus[a:a + L] += .3 * nz * tt ** 3
    for s0 in (5.0, 19.0, 31.0, 41.0): riser(s0, 1.8); hit(s0)
    hit(DUR - 2.0, 1.2)
    vo = np.zeros(n)
    for cl in clips:
        a = int(cl["t0"] * SR); L = min(len(cl["x"]), n - a); vo[a:a + L] += cl["x"][:L]
    env = lp(np.abs(vo), 6000); duck = 1 - .55 * np.clip(env / (env.max() * .3), 0, 1)
    mus = mus / np.abs(mus).max() * .45 * duck * np.minimum(1, np.minimum(t / .6, (DUR - t) / 1.2))
    for arr, nm in ((vo, "vo.wav"), (mus, "music.wav")):
        with wave.open(OUT + nm, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(arr, -1, 1) * 32767).astype(np.int16).tobytes())

if __name__ == "__main__":
    print("dur", round(DUR, 2), file=sys.stderr)
    if "sheet" in sys.argv: render(True)
    else:
        audio(); render()
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", OUT + "silent.mp4", "-i", OUT + "vo.wav", "-i", OUT + "music.wav", "-filter_complex",
                        "[1:a]highpass=f=70,acompressor=threshold=0.1:ratio=3:attack=5:release=150:makeup=1.8[v];[v][2:a]amix=inputs=2:normalize=0,"
                        "loudnorm=I=-14:TP=-1.5:LRA=11,aformat=channel_layouts=stereo[a]", "-map", "0:v", "-map", "[a]", "-c:v", "libx264",
                        "-preset", "veryfast", "-crf", "25", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
                        OUT + "ranking_latam.mp4"], check=True)
