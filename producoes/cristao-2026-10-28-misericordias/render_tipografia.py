"""Devocional em tipografia cinética editorial (papel claro, roxo, letras gastas)."""
import json, random, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS, SR = 1080, 1920, 30, 44100
F = "/home/claude/fonts/"
ANTON, TYPE, SANS = F + "Anton-Regular.ttf", F + "SpecialElite.ttf", F + "MontserratBold.ttf"
SERIF = F + "CormorantGaramond-Italic.ttf"
REPO = "/home/claude/videoinsta/"
SLUG = "cristao-2026-10-28-misericordias"
OUT = "/home/claude/video/dev/"
INK, PURP, PAPER, CARD = (24, 20, 22), (84, 40, 140), (226, 220, 206), (243, 241, 236)

def fnt(p, s, w=None):
    f = ImageFont.truetype(p, s)
    if w:
        try: f.set_variation_by_axes([w])
        except Exception: pass
    return f

def grunge(im, seed, dens=0.0016):
    """fura a tinta com pontinhos claros, tipo serigrafia gasta"""
    a = np.array(im); h, w = a.shape[:2]; r = np.random.default_rng(seed)
    n = int(w * h * dens)
    ys, xs = r.integers(0, h, n), r.integers(0, w, n); rad = r.choice([1, 1, 2, 2, 3, 4], n)
    m = Image.new("L", (w, h), 0); d = ImageDraw.Draw(m)
    for x, y, k in zip(xs, ys, rad): d.ellipse([x - k, y - k, x + k, y + k], fill=255)
    m = np.array(m) > 0; ink = a[..., 3] > 0
    a[m & ink, :3] = (240, 238, 230)
    return Image.fromarray(a)

def word_img(text, size, color, outline=False, underline=False, seed=0, maxw=980):
    f = fnt(ANTON, size)
    while f.getbbox(text)[2] > maxw: size -= 6; f = fnt(ANTON, size)
    bb = f.getbbox(text); w, h = bb[2] + 24, int(size * 1.32)
    im = Image.new("RGBA", (w, h + 24), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if outline:
        d.text((6, 0), text, font=f, fill=(0, 0, 0, 0), stroke_width=max(3, size // 34), stroke_fill=color)
        d.text((6, 0), text, font=f, fill=(0, 0, 0, 0))
    else:
        d.text((6, 0), text, font=f, fill=color)
        im = grunge(im, seed + size)
    if underline:
        d = ImageDraw.Draw(im); y = int(size * 1.22); d.rectangle([6, y, bb[2] - 10, y + max(6, size // 22)], fill=color)
    return im

def verse_strip(ref, words_emph, size=68, w=1030):
    """tira de papel com chip preto da referência e texto em serifa itálica; devolve (img_base, lista de (img_palavra, x, y))"""
    fs = fnt(SERIF, size, 560); fr = fnt(SANS, 26)
    chip_w = fr.getbbox(" ".join(ref))[2] + 36
    x0 = 40 + chip_w + 34; maxw = w - x0 - 40
    pos, x, y, lh = [], x0, 44, int(size * 1.18)
    for wd, em in words_emph:
        ww = fs.getbbox(wd + " ")[2]
        if x + ww - fs.getbbox(" ")[2] > x0 + maxw: x = x0; y += lh
        pos.append((wd, em, x, y)); x += ww
    h = y + lh + 46
    base = Image.new("RGBA", (w + 30, h + 30), (0, 0, 0, 0)); sh = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([10, 16, w + 10, h + 14], fill=(0, 0, 0, 70))
    base = Image.alpha_composite(base, sh.filter(ImageFilter.GaussianBlur(9))); d = ImageDraw.Draw(base)
    d.rectangle([0, 0, w, h], fill=CARD)
    cy = h // 2 - 26; d.rectangle([40, cy, 40 + chip_w, cy + 52], fill=INK)
    d.text((58, cy + 10), " ".join(ref), font=fr, fill=(240, 240, 240))
    words = []
    for wd, em, x, y in pos:
        im = Image.new("RGBA", (fs.getbbox(wd)[2] + 10, int(size * 1.4)), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((0, 0), wd, font=fs, fill=PURP if em else (40, 36, 40))
        words.append((im, x, y))
    return base, words

def record_card(title, ref, fields, w=1000):
    """objeto-metáfora: ficha/registro com barra roxa e campos"""
    fl, ft, fv = fnt(TYPE, 28), fnt(ANTON, 52), fnt(ANTON, 76)
    h = 150 + len(fields) * 132
    im = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0)); sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([12, 20, w + 12, h + 18], 22, fill=(0, 0, 0, 90))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(12))); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w, h], 22, fill=CARD)
    d.rounded_rectangle([0, 0, w, 120], 22, fill=PURP); d.rectangle([0, 60, w, 120], fill=PURP)
    d.text((40, 28), title, font=ft, fill=(245, 243, 238))
    rw = fl.getbbox(" ".join(ref))[2]; d.text((w - 40 - rw, 46), " ".join(ref), font=fl, fill=(225, 215, 240))
    # selo de "carimbo" circular à esquerda, desenhado (sem rosto)
    cx, cy = 150, 120 + (h - 120) // 2
    for k in range(9): d.ellipse([cx - 20 - k * 9, cy - 20 - k * 9, cx + 20 + k * 9, cy + 20 + k * 9], outline=(70, 66, 70), width=2)
    d.text((cx - 62, cy + 110), " ".join("SELO"), font=fl, fill=(70, 66, 70))
    y = 150
    for lab, val in fields:
        d.text((300, y), " ".join(lab), font=fl, fill=(70, 66, 70))
        d.text((300, y + 34), val, font=fv, fill=INK)
        d.line([300, y + 120, w - 40, y + 120], fill=(170, 165, 160), width=3); y += 132
    return im.rotate(-1.2, resample=Image.BICUBIC, expand=True)

def day_strip(label, text, crossed=False, check=False, w=1000):
    fl, fv = fnt(SANS, 26), fnt(SERIF, 58, 600)
    h = 150; im = Image.new("RGBA", (w + 30, h + 30), (0, 0, 0, 0)); sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([10, 16, w + 10, h + 14], fill=(0, 0, 0, 70))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(9))); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, w, h], fill=CARD)
    cw = fl.getbbox(" ".join(label))[2] + 36
    d.rectangle([40, 49, 40 + cw, 101], fill=PURP if check else INK)
    d.text((58, 60), " ".join(label), font=fl, fill=(240, 240, 240))
    tx = 40 + cw + 34; d.text((tx, 38), text, font=fv, fill=PURP if check else (110, 104, 110))
    if crossed:
        tw = fv.getbbox(text)[2]; d.line([tx - 6, 82, tx + tw + 6, 76], fill=(170, 30, 40), width=7)
    if check:
        cx = w - 80; d.line([cx - 30, 75, cx - 8, 100], fill=PURP, width=10); d.line([cx - 8, 100, cx + 34, 48], fill=PURP, width=10)
    return im.rotate(0.6 if crossed else -0.5, resample=Image.BICUBIC, expand=True)

# ---------------- áudio da narração e tempos por palavra ----------------
script = json.load(open(REPO + f"producoes/{SLUG}/narration/script.json"))
clips = script["clips"]

def load_wav(p):
    w = wave.open(p); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    return np.interp(np.arange(0, len(x), sr / SR), np.arange(len(x)), x)

def segments(x):
    hop = int(SR * .02); env = np.array([np.abs(x[i:i + hop]).max() for i in range(0, len(x), hop)]); thr = env.max() * .08
    on = env > thr; segs, i = [], 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j:j + 10].any(): j += 1
            segs.append((i * .02, j * .02)); i = j
        else: i += 1
    return segs

T, tl = 0.3, {}
for k, c in enumerate(clips):
    if k: T += c.get("gapAfterPrev", .5)
    x = load_wav(REPO + f"tts/out/{SLUG}/{c['id']}.wav"); segs = segments(x)
    words = c["text"].split(); tot = sum(len(w) + 1 for w in words); sp = sum(b - a for a, b in segs)
    def at(chars):
        tgt = chars / tot * sp; acc = 0
        for a, b in segs:
            if acc + (b - a) >= tgt: return a + tgt - acc
            acc += b - a
        return segs[-1][1]
    starts, c0 = [], 0
    for w_ in words: starts.append(T + at(c0)); c0 += len(w_) + 1
    tl[c["id"]] = dict(start=T, end=T + len(x) / SR, x=x, words=words, wstart=starts)
    T += len(x) / SR
DUR = T + script.get("tailAfterLastClip", 2.0)

def wt(cid, i):
    s = tl[cid]["wstart"]; return s[min(i, len(s) - 1)]

# ---------------- cenas ----------------
def S(cid): return tl[cid]["start"] - (0.25 if cid != "c1" else 0.3)
scenes = []
# 1 gancho
scenes.append(dict(cid="c1", els=[
    (word_img("ACORDOU", 250, INK, seed=1), 40, 300, wt("c1", 0), "pop"),
    (word_img("CANSADO?", 250, PURP, underline=True, seed=2), 40, 610, wt("c1", 1), "pop"),
    (word_img("SEM ESPERANÇA PRA HOJE?", 120, INK, outline=True), 40, 960, wt("c1", 2), "pop"),
    (word_img("ENTÃO OUVE ISSO.", 90, PURP, seed=3), 40, 1150, wt("c1", 6), "pop"),
]))
# 2 versículo
vtxt = "As misericórdias do Senhor não têm fim. Elas se renovam cada manhã. Grande é a tua fidelidade."
emph = {"misericórdias", "renovam", "cada", "manhã.", "fidelidade."}
base, vw = verse_strip("LM 3.22-23", [(w_, w_ in emph) for w_ in vtxt.split()])
els = [(word_img("CADA", 230, INK, seed=4), 40, 280, wt("c2", 9), "pop"),
       (word_img("MANHÃ.", 230, PURP, underline=True, seed=5), 40, 570, wt("c2", 10), "pop"),
       (base, 10, 930, S("c2") + 0.1, "slide")]
for i, (im, x, y) in enumerate(vw): els.append((im, 10 + x, 930 + y, wt("c2", i), "type"))
scenes.append(dict(cid="c2", els=els))
# 3 contexto: ficha
scenes.append(dict(cid="c3", els=[
    (word_img("ESCRITO", 200, INK, seed=6), 40, 240, wt("c3", 0), "pop"),
    (word_img("NAS RUÍNAS.", 200, PURP, underline=True, seed=7), 40, 500, wt("c3", 6), "pop"),
    (record_card("REGISTRO DE LAMENTAÇÕES", "LM 3", [("LOCAL", "JERUSALÉM"), ("SITUAÇÃO", "EM RUÍNAS"), ("PERDAS", "QUASE TUDO")]), 20, 820, wt("c3", 5), "slide"),
]))
# 4 virada
scenes.append(dict(cid="c4", els=[
    (word_img("E MESMO ASSIM", 110, INK, outline=True), 40, 250, wt("c4", 0), "pop"),
    (word_img("NO PIOR DIA,", 190, INK, seed=8), 40, 420, wt("c4", 4), "pop"),
    (word_img("DEUS", 300, PURP, underline=True, seed=9), 40, 680, wt("c4", 10), "pop"),
    (word_img("COMEÇA DE NOVO.", 150, INK, outline=True), 40, 1090, wt("c4", 11), "pop"),
]))
# 5 aplicação: ontem x hoje
scenes.append(dict(cid="c5", els=[
    (word_img("HOJE", 300, PURP, underline=True, seed=10), 40, 260, wt("c5", 9), "pop"),
    (word_img("CHEGOU UMA NOVA.", 150, INK, seed=11), 40, 680, wt("c5", 10), "pop"),
    (day_strip("ONTEM", "a misericórdia de ontem", crossed=True), 25, 920, wt("c5", 1), "slide"),
    (day_strip("HOJE", "uma nova misericórdia", check=True), 25, 1110, wt("c5", 9), "slide"),
]))
# 6 CTA
scenes.append(dict(cid="c6", els=[
    (word_img("É PRA VOCÊ?", 110, INK, outline=True), 40, 250, wt("c6", 1), "pop"),
    (word_img("COMENTA", 220, INK, seed=12), 40, 420, wt("c6", 5), "pop"),
    (word_img("AMÉM.", 260, PURP, underline=True, seed=13), 40, 700, wt("c6", 6), "pop"),
    (word_img("UMA PALAVRA TODA MANHÃ", 110, INK, outline=True), 40, 1090, wt("c6", 10), "pop"),
    (word_img("@E_COSDAFE", 80, PURP, seed=14), 40, 1250, wt("c6", 9), "pop"),
]))
for i, sc in enumerate(scenes):
    sc["t0"] = 0 if i == 0 else S(sc["cid"])
for i, sc in enumerate(scenes): sc["t1"] = scenes[i + 1]["t0"] if i + 1 < len(scenes) else DUR

# ---------------- fundo ----------------
yy, xx = np.mgrid[0:H, 0:W]
vig = np.clip(1 - 0.55 * (((xx - W / 2) / (W * .8)) ** 2 + ((yy - H / 2) / (H * .7)) ** 2), 0.55, 1)
basebg = np.dstack([vig * PAPER[0], vig * PAPER[1], vig * PAPER[2]]).astype(np.float32)
rng = np.random.default_rng(1)
fiber = np.array(Image.fromarray((rng.random((H // 4, W // 4)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32)[..., None]
bgs = [Image.fromarray(np.clip(basebg + (fiber - 128) * .05 + rng.normal(0, 3.5, (H, W, 1)), 0, 255).astype(np.uint8)).convert("RGBA") for _ in range(4)]
fcap = fnt(SANS, 50)
ease = lambda p: 1 - (1 - min(max(p, 0), 1)) ** 3

def put(frame, im, x, y, t, ti, kind):
    p = (t - ti) / (0.12 if kind == "type" else 0.28)
    if p <= 0: return
    e = ease(p)
    if kind == "pop":
        s = 1.12 - .12 * e
        if s > 1.001:
            im2 = im.resize((int(im.width * s), int(im.height * s)), Image.BILINEAR); x -= (im2.width - im.width) // 2; y -= (im2.height - im.height) // 2; im = im2
    elif kind == "slide": x = int(x + (1 - e) * 160)
    elif kind == "type": y = int(y + (1 - e) * 12)
    if e < 1: im = im.copy(); im.putalpha(im.getchannel("A").point(lambda v: int(v * e)))
    frame.alpha_composite(im, (x, y))

def caption(frame, t):
    for c in clips:
        d = tl[c["id"]]
        if not (d["start"] - .05 <= t < d["end"] + .3): continue
        # janela de até 5 palavras, palavra atual em roxo
        ws, st = d["words"], d["wstart"]; cur = max([i for i in range(len(ws)) if st[i] <= t] or [0])
        a = (cur // 5) * 5; chunk = list(range(a, min(a + 5, len(ws))))
        shown = [i for i in chunk if st[i] <= t + .02]
        if not shown: return
        txt = " ".join(ws[i] for i in shown); tw = fcap.getbbox(txt)[2]
        while tw > 940 and len(shown) > 1: shown = shown[1:]; txt = " ".join(ws[i] for i in shown); tw = fcap.getbbox(txt)[2]
        x = (W - tw) // 2; y = 1480; dr = ImageDraw.Draw(frame)
        dr.rounded_rectangle([x - 26, y - 16, x + tw + 26, y + 74], 12, fill=(24, 20, 22, 230))
        for i in shown:
            dr.text((x, y), ws[i], font=fcap, fill=(196, 160, 255) if i == cur else (245, 243, 238)); x += fcap.getbbox(ws[i] + " ")[2]

CUTS = [sc["t0"] for sc in scenes[1:]]

def render(stills=None):
    if stills is None:
        ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                               "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", OUT + "silent.mp4"], stdin=subprocess.PIPE)
        times = [i / FPS for i in range(int(DUR * FPS))]
    else: times = stills; imgs = []
    for fi, t in enumerate(times):
        frame = bgs[fi % 4].copy()
        for sc in scenes:
            if sc["t0"] <= t < sc["t1"]:
                for im, x, y, ti, kind in sc["els"]: put(frame, im, x, y, t, ti, kind)
        caption(frame, t)
        img = frame.convert("RGB")
        sc = [s for s in scenes if s["t0"] <= t][-1]; z = 1 + .03 * min((t - sc["t0"]) / max(sc["t1"] - sc["t0"], 1), 1)
        nw, nh = int(W * z), int(H * z); img = img.resize((nw, nh), Image.BILINEAR).crop(((nw - W) // 2, (nh - H) // 2, (nw - W) // 2 + W, (nh - H) // 2 + H))
        for c in CUTS:
            if 0 <= t - c < .1: img = Image.blend(img, Image.new("RGB", (W, H), (250, 248, 240)), .5 * (1 - (t - c) / .1))
        if t > DUR - .8: img = Image.blend(img, Image.new("RGB", (W, H), PAPER), min(1, (t - (DUR - .8)) / .8))
        if stills is None: ff.stdin.write(img.tobytes())
        else: imgs.append(img.resize((270, 480)))
    if stills is None: ff.stdin.close(); ff.wait()
    else:
        cols = 6; rows = (len(imgs) + cols - 1) // cols; m = Image.new("RGB", (270 * cols, 480 * rows), "white")
        for i, im in enumerate(imgs): m.paste(im, ((i % cols) * 270, (i // cols) * 480))
        m.save(OUT + "sheet.png")

def audio():
    n = int(DUR * SR); t = np.arange(n) / SR; r = np.random.default_rng(5)
    lp = lambda x, k: np.convolve(x, np.ones(k) / k, "same")
    # pad suave em progressão C - Am - F - G (4 s cada), com ataque lento
    chords = [(130.81, 164.81, 196.0, 261.63), (110.0, 130.81, 164.81, 220.0), (87.31, 130.81, 174.61, 220.0), (98.0, 123.47, 146.83, 196.0)]
    pad = np.zeros(n); seg = 4.0
    for k in range(int(DUR / seg) + 1):
        a, b = int(k * seg * SR), min(int((k + 1) * seg * SR + .8 * SR), n)
        if a >= n: break
        tt = t[: b - a]; env = np.minimum(1, tt / 1.2) * np.minimum(1, np.maximum(0, (b - a) / SR - tt) / .8)
        for f in chords[k % 4]:
            pad[a:b] += env * (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * f * 2.003 * tt)) * .09
    # sininhos (notas do acorde, oitava acima) a cada 0,5 s
    bell = np.zeros(n)
    for k, s in enumerate(np.arange(.5, DUR - 1, .5)):
        f = chords[int(s / seg) % 4][r.integers(0, 4)] * 4; a = int(s * SR); L = min(int(1.5 * SR), n - a); tt = t[:L]
        bell[a:a + L] += .05 * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3.5) * (1 if k % 2 == 0 else .55)
    mus = pad + bell
    # sopro de papel nas trocas de cena
    for c in CUTS:
        a = int((c - .25) * SR); L = int(.5 * SR); nz = r.normal(0, 1, L); nz = nz - lp(nz, 8)
        mus[a:a + L] += .12 * nz * np.hanning(L)
    vo = np.zeros(n)
    for c in clips:
        d = tl[c["id"]]; a = int(d["start"] * SR); L = min(len(d["x"]), n - a); vo[a:a + L] += d["x"][:L]
    env = lp(np.abs(vo), 6000); duck = 1 - .5 * np.clip(env / (env.max() * .3), 0, 1)
    mus = mus / np.abs(mus).max() * .35 * duck * np.minimum(1, np.minimum(t / 1.0, (DUR - t) / 1.5))
    for arr, name in ((vo, "vo.wav"), (mus, "music.wav")):
        with wave.open(OUT + name, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(arr, -1, 1) * 32767).astype(np.int16).tobytes())

if __name__ == "__main__":
    print("dur", round(DUR, 2), "thumb", round(wt("c1", 6) + .5, 2), file=sys.stderr)
    if "sheet" in sys.argv:
        ts = []
        for sc in scenes: ts += [sc["t0"] + .4, (sc["t0"] + sc["t1"]) / 2, sc["t1"] - .3]
        render(ts)
    else:
        audio(); render()
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", OUT + "silent.mp4", "-i", OUT + "vo.wav", "-i", OUT + "music.wav", "-filter_complex",
                        "[1:a]highpass=f=70,acompressor=threshold=0.1:ratio=3:attack=5:release=150:makeup=1.8[v];[v][2:a]amix=inputs=2:normalize=0,"
                        "loudnorm=I=-14:TP=-1.5:LRA=11,aformat=channel_layouts=stereo[a]", "-map", "0:v", "-map", "[a]", "-c:v", "copy",
                        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT + "devocional.mp4"], check=True)
