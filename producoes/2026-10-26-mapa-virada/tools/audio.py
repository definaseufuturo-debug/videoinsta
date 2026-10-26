#!/usr/bin/env python3
"""
Trilha eletrônica (120 BPM) e efeitos sonoros 100% sintetizados, presos aos eventos que a animação
exporta (build/cues.json). Mixagem com a narração e normalização para -14 LUFS.
Saídas: build/musica.wav, build/efeitos.wav, build/audio_final.wav
"""
import json, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(2026)
doc = json.loads((ROOT / "build/cues.json").read_text())
DUR = doc["duration"] + 0.1
N = int(DUR * SR)
CUES = doc["cues"]
tt = lambda n: np.arange(int(n)) / SR
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def place(buf, x, t0, gain=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= len(buf) or len(x) == 0: return
    if i < 0: x = x[-i:]; i = 0
    x = x[: len(buf) - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    if buf.ndim == 1: buf[i:i + len(x)] += x * gain; return
    buf[i:i + len(x), 0] += x * gain * l * 1.414; buf[i:i + len(x), 1] += x * gain * r * 1.414

def filt(x, kind, f, order=2):
    f = np.atleast_1d(np.asarray(f, float)) / (SR / 2); f = np.clip(f, 1e-4, 0.999)
    b, a = signal.butter(order, f if len(f) > 1 else f[0], kind); return signal.lfilter(b, a, x)

def sweep(dur, f0, f1, q=0.6, blk=512):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n); zi = None
    for s in range(0, n, blk):
        f = f0 * (f1 / f0) ** (s / max(n, 1))
        b, a = signal.butter(2, [max(40, f / (1 + q)) / (SR / 2), min(SR / 2 - 200, f * (1 + q)) / (SR / 2)], "band")
        if zi is None: zi = np.zeros(max(len(a), len(b)) - 1)
        y, zi = signal.lfilter(b, a, x[s:s + blk], zi=zi); out[s:s + blk] = y
    return out / (np.abs(out).max() + 1e-9)

def tone(f, dur, parts=((1, 1),), dec=0.3, att=0.003):
    n = int(dur * SR); t = tt(n); x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * m * 0.5 / dec) for m, a in parts)
    return x * np.clip(t / att, 0, 1) * np.exp(-t / dec)

def chirp(f0, f1, dur, dec=None):
    n = int(dur * SR); t = tt(n); f = f0 * (f1 / f0) ** (t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * (np.exp(-t / dec) if dec else np.sin(np.pi * t / dur))

# ============================ MÚSICA ============================
BPM = 120; BEAT = 60 / BPM; BAR = 4 * BEAT
parts = sorted([(c["t"], c["part"]) for c in CUES if c["type"] == "music"]) + [(DUR, "end")]
def part_at(t):
    p = "intro"
    for t0, name in parts:
        if t >= t0: p = name
    return p
# tensão (golpe): Am – F – Dm – E ; proteção: C – G – Am – F
DARK = ([[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]], [45, 41, 38, 40])
SAFE = ([[48, 55, 60, 64], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]], [48, 43, 45, 41])
RETRO = ([[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]], [45, 41, 36, 43])  # Am – F – C – G (synthwave)
_drop = [x for x, n in parts if n == 'drop']
def harm(t): return DARK if part_at(t) in ('stop', 'drop') else SAFE  # tensão só no trecho do antibiótico
kick = np.zeros(N); snare = np.zeros(N); hats = np.zeros(N); bass = np.zeros(N); arp = np.zeros(N); pad = np.zeros(N); duckK = np.ones(N)
def kick_s():
    n = int(0.45 * SR); t = tt(n); f = 48 + 110 * np.exp(-t * 28); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + 0.3 * filt(rng.standard_normal(n), "high", 3000) * np.exp(-t * 120)
def snare_s(): n = int(0.3 * SR); t = tt(n); g = (t < 0.22).astype(float); return filt(rng.standard_normal(n), "band", [1200, 8000]) * (np.exp(-t * 18) * 0.8 + 0.25 * np.exp(-t * 5) * g) + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25) * 0.5  # caixa com 'gated reverb' anos 80
def hat_s(op=False): n = int((0.25 if op else 0.06) * SR); t = tt(n); return filt(rng.standard_normal(n), "high", 7500) * np.exp(-t * (14 if op else 70))
KICK, SNARE = kick_s(), snare_s()
nb = int(DUR / BEAT) + 1
for b in range(nb):
    t0 = b * BEAT; p = part_at(t0 + 0.01); bar = int(t0 // BAR); CH, BASS = harm(t0 + 0.01); ch = CH[bar % 4]; inb = b % 4
    full = p in ("groove", "drop", "drop2", "safe"); build = p == "build"
    if full or build:
        place(kick, KICK, t0, 1.0); i = int(t0 * SR); m = min(N - i, int(0.25 * SR)); duckK[i:i + m] = np.minimum(duckK[i:i + m], 1 - 0.65 * np.exp(-tt(m) * 14))
    if full and inb in (1, 3): place(snare, SNARE, t0, 0.8 if p != "groove" else 0.55)
    if full or build or p == "outro":
        place(hats, hat_s(), t0 + BEAT / 2, 0.5);
        if p in ("drop", "drop2"): place(hats, hat_s(), t0 + BEAT / 4, 0.22); place(hats, hat_s(), t0 + 3 * BEAT / 4, 0.22)
    if build: # rufar acelerando
        prog = (t0 - [x for x, n in parts if n == "build"][0]) / 6.5
        k = 1 if prog < 0.35 else 2 if prog < 0.7 else 4
        for j in range(k): place(snare, SNARE * (0.25 + 0.5 * prog), t0 + j * BEAT / k, 0.6)
    if full or build:
        for j in (0, 0.5) if p != "groove" else (0, 0.5):
            x = tone(midi(BASS[bar % 4]) * (2 if j else 1), BEAT * 0.48, ((1, 1), (2, 0.4), (3, 0.15)), dec=0.18, att=0.004)
            place(bass, filt(x, "low", 900), t0 + j * BEAT, 1.0)
    # arpejo
    if p != "stop":
        for j in range(4):
            m = ch[[0, 2, 1, 3][j]] + 12
            x = tone(midi(m), 0.5, ((1, 1), (2, 0.25), (3, 0.12), (4, 0.05)), dec=0.12, att=0.002)  # timbre suave, tipo marimba
            place(arp, x, t0 + j * BEAT / 4, 0.6 if p == "intro" else 0.8 if j % 2 == 0 else 0.55)
# pad (um acorde por compasso, notas desafinadas)
for bar in range(int(DUR / BAR) + 1):
    t0 = bar * BAR; CH, _ = harm(t0 + 0.01); ch = CH[bar % 4]; n = int((BAR + 0.4) * SR); t = tt(n)
    x = sum(np.sin(2 * np.pi * midi(m + 12) * (1 + d) * t + d * 999) for m in ch for d in (-0.004, 0.004))
    x = filt(x, "low", 2400) * np.clip(t / 0.3, 0, 1) * np.clip((n / SR - t) / 0.4, 0, 1)
    place(pad, x, t0, 0.12)
# sub-drone para a "pausa" dramática
sub = np.zeros(N); st = [x for x, n in parts if n == "stop"]
if st:
    t0 = st[0]; dur = [x for x, n in parts if n == "drop"][0] - t0; n = int(dur * SR); t = tt(n)
    place(sub, np.sin(2 * np.pi * 55 * t) * np.clip(t / 0.4, 0, 1) * np.clip((dur - t) / 0.1, 0, 1), t0, 0.6)
lvl_t = [p[0] for p in parts]
def part_gain(name): return {"intro": 0.7, "groove": 0.8, "build": 0.95, "stop": 0.35, "drop": 1.0, "drop2": 1.0, "safe": 0.95, "outro": 0.75, "end": 0.0}[name]
G = np.zeros(N)
for (t0, n), (t1, _) in zip(parts[:-1], parts[1:]): G[int(t0 * SR):int(t1 * SR)] = part_gain(n)
G = filt(G, "low", 6, 1)
arp = filt(arp, "low", 5200); echo = np.zeros_like(arp); d = int(BEAT * 0.75 * SR); echo[d:] = arp[:-d] * 0.3
fade = np.clip((DUR - tt(N)) / 1.2, 0, 1)
mus = np.zeros((N, 2))
mono = (kick * 0.9 + snare * 0.5 + bass * 0.55 + sub) + (pad * duckK + arp * 0.32 * duckK)
mus[:, 0] = mono + hats * 0.25 + echo * 0.32
mus[:, 1] = mono + np.roll(hats, 240) * 0.25 - echo * 0.1
mus *= (G * fade)[:, None]
mus /= np.abs(mus).max() + 1e-9

# ============================ EFEITOS ============================
fx = np.zeros((N, 2))
def whoosh(t0, dur=0.5, gain=1.0): n = int(dur * SR); x = sweep(dur, 300, 7000, 1.0) * np.sin(np.linspace(0, np.pi, n)) ** 1.5; place(fx, x, t0, 0.13 * gain, -0.3); place(fx, np.roll(x, 300), t0, 0.1 * gain, 0.4)
def swoosh(t0, gain=1.0): n = int(0.28 * SR); x = sweep(0.28, 4000, 900, 1.2) * np.sin(np.linspace(0, np.pi, n)); place(fx, x, t0, 0.09 * gain, rng.uniform(-0.6, 0.6))
def tap(t0): n = int(0.08 * SR); t = tt(n); x = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) + filt(rng.standard_normal(n), "high", 2000) * np.exp(-t * 200) * 0.5; place(fx, x, t0, 0.22)
def zap(t0): place(fx, chirp(400, 3200, 0.35, 0.12), t0, 0.08); place(fx, tone(midi(88), 0.6, ((1, 1), (2, 0.3)), 0.2), t0 + 0.05, 0.06)
def pop(t0, gain=1.0): n = int(0.18 * SR); t = tt(n); f = 300 + 900 * np.exp(-t * 40); place(fx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26), t0, 0.14 * gain, rng.uniform(-0.3, 0.3))
def tick(t0, dur):
    k = 0
    while k * 0.09 < dur: place(fx, tone(3000 if k % 2 else 2400, 0.03, dec=0.008), t0 + k * 0.09, 0.07); k += 1
def scan(t0, dur, gain=1.0): n = int(dur * SR); t = tt(n); x = np.sin(2 * np.pi * (600 + 300 * np.sin(2 * np.pi * 7 * t)) * t) * 0.3 + sweep(dur, 1500, 2500, 0.3) * 0.5; place(fx, x * np.clip(t / 0.05, 0, 1) * np.clip((dur - t) / 0.08, 0, 1), t0, 0.05 * gain)
def coin(t0):
    for j, r in enumerate([1, 1.5]): place(fx, tone(midi(88 + 5 * j), 0.6, ((1, 1), (2.4, 0.3)), 0.25), t0 + j * 0.08, 0.09, 0.2)
def impact(t0, gain=1.0):
    n = int(1.2 * SR); t = tt(n); f = 40 + 100 * np.exp(-t * 12); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.5) + filt(rng.standard_normal(n), "low", 3000) * np.exp(-t * 9) * 0.6
    place(fx, x, t0, 0.32 * gain)
def glitch(t0, dur):
    n = int(dur * SR); x = np.zeros(n); seg = int(0.03 * SR)
    for s in range(0, n, seg):
        kind = rng.integers(0, 3); m = min(seg, n - s); tm = tt(m)
        x[s:s + m] = (np.sign(np.sin(2 * np.pi * rng.uniform(200, 1500) * tm)) * 0.5 if kind == 0 else rng.standard_normal(m) * 0.6 if kind == 1 else 0) * (rng.random() > 0.25)
    place(fx, filt(x, "band", [300, 6000]), t0, 0.06)
def typing(t0, n, rate):
    for k in range(n): m = int(0.03 * SR); tm = tt(m); place(fx, filt(rng.standard_normal(m), "band", [2000, 6000]) * np.exp(-tm * 160), t0 + k * rate + rng.normal(0, 0.006), 0.12, rng.uniform(-0.2, 0.2))
def riser(t0, dur): n = int(dur * SR); t = tt(n); x = sweep(dur, 200, 8000, 0.8) * (t / dur) ** 2 * 0.6 + chirp(200, 1200, dur) * (t / dur) ** 2 * 0.3; place(fx, x, t0, 0.09)
def ding(t0, soft=0):
    for j, m in enumerate([84, 91]): place(fx, tone(midi(m), 1.2, ((1, 1), (2.76, 0.25)), 0.4), t0 + j * 0.09, (0.06 if soft else 0.11), 0.15)
def roll(t0, dur):
    k = 0
    while k * 0.045 < dur: place(fx, tone(2200 + 200 * (k % 3), 0.02, dec=0.006), t0 + k * 0.045, 0.06, rng.uniform(-0.3, 0.3)); k += 1
def lock(t0):
    for j, (f, g) in enumerate([(2400, 0.2), (1200, 0.25)]): m = int(0.05 * SR); tm = tt(m); place(fx, (np.sin(2 * np.pi * f * tm) + rng.standard_normal(m) * 0.5) * np.exp(-tm * 120), t0 + j * 0.06, g)
def reveal(t0): place(fx, sweep(1.0, 200, 3000, 0.5) * np.sin(np.linspace(0, np.pi, int(1.0 * SR))), t0, 0.06); place(fx, tone(midi(62), 2.0, ((1, 1), (2, 0.3)), 1.0, 0.2), t0, 0.08)
def scratch(t0): place(fx, chirp(1800, 200, 0.25) * 0.8 + filt(rng.standard_normal(int(0.25 * SR)), "band", [500, 3000]) * 0.3, t0, 0.07)
def minus(t0): place(fx, tone(midi(64), 0.5, ((1, 1), (2, 0.4)), 0.2) + tone(midi(60), 0.5, ((1, 1),), 0.2) * 0.5, t0, 0.09)
def plus(t0):
    for j, m in enumerate([72, 76, 79]): place(fx, tone(midi(m), 0.5, ((1, 1), (2, 0.3)), 0.25), t0 + j * 0.06, 0.08)
def stamp(t0): n = int(0.4 * SR); t = tt(n); place(fx, np.sin(2 * np.pi * (90 + 120 * np.exp(-t * 30)) * t) * np.exp(-t * 14) + filt(rng.standard_normal(n), "low", 2000) * np.exp(-t * 30) * 0.5, t0, 0.2)
def bell(t0):
    for j in range(3): place(fx, tone(midi(93), 0.7, ((1, 1), (2.4, 0.5), (3.9, 0.2)), 0.25), t0 + j * 0.12, 0.06, 0.2)
def confetti(t0):
    for k in range(18): place(fx, filt(rng.standard_normal(int(0.03 * SR)), "high", 4000) * np.exp(-tt(int(0.03 * SR)) * 100), t0 + rng.random() * 0.8, 0.05, rng.uniform(-0.8, 0.8))
    place(fx, sweep(0.6, 3000, 9000, 0.5) * np.exp(-tt(int(0.6 * SR)) * 5), t0, 0.04)

def sms(t0):
    for j, m in enumerate([88, 84, 91]): place(fx, tone(midi(m), 0.4, ((1, 1), (2, 0.2)), 0.15), t0 + j * 0.11, 0.09, 0.3)
def ring(t0, dur):
    k = 0.0
    while k < dur:
        n = int(0.9 * SR); tm = tt(n); x = (np.sin(2 * np.pi * 1320 * tm) + np.sin(2 * np.pi * 1760 * tm)) * (np.sin(2 * np.pi * 20 * tm) > 0) * np.clip(tm / 0.01, 0, 1) * np.clip((0.9 - tm) / 0.05, 0, 1)
        place(fx, filt(x, "low", 4000), t0 + k, 0.035, 0.1); k += 1.6
def alarm(t0):
    for j in range(2): place(fx, chirp(700, 1100, 0.25) * 0.8, t0 + j * 0.28, 0.07)
def error(t0):
    for j, m in enumerate([62, 56]): n = int(0.22 * SR); tm = tt(n); place(fx, np.sign(np.sin(2 * np.pi * midi(m) * tm)) * 0.4 * np.exp(-tm * 6), t0 + j * 0.18, 0.06)
def send(t0): place(fx, chirp(600, 2400, 0.18, 0.08), t0, 0.07, rng.uniform(-0.5, 0.5))
def key(t0): m = int(0.04 * SR); tm = tt(m); place(fx, np.sin(2 * np.pi * 2600 * tm) * np.exp(-tm * 120), t0, 0.08)
def success(t0):
    for j, m in enumerate([72, 76, 79, 84]): place(fx, tone(midi(m), 0.7, ((1, 1), (2, 0.3)), 0.3), t0 + j * 0.07, 0.07, -0.3 + j * 0.2)
def heart(t0):
    for j in range(2): n = int(0.18 * SR); tm = tt(n); place(fx, np.sin(2 * np.pi * (70 + 40 * np.exp(-tm * 30)) * tm) * np.exp(-tm * 16), t0 + j * 0.22, 0.25)
    place(fx, tone(midi(81), 1.2, ((1, 1), (2, 0.3)), 0.5), t0, 0.05)
def plop(t0): n = int(0.35 * SR); tm = tt(n); place(fx, np.sin(2 * np.pi * (120 + 300 * np.exp(-tm * 20)) * tm) * np.exp(-tm * 10) + filt(rng.standard_normal(n), "low", 1200) * np.exp(-tm * 25) * 0.6, t0, 0.25)
def water(t0, dur): n = int(dur * SR); tm = tt(n); x = filt(rng.standard_normal(n), "band", [800, 6000]) * (0.7 + 0.3 * np.sin(2 * np.pi * 13 * tm)) * np.clip(tm / 0.15, 0, 1) * np.clip((dur - tm) / 0.2, 0, 1); place(fx, x, t0, 0.05)
def sparkle(t0):
    for j, m in enumerate([86, 90, 93, 98]): place(fx, tone(midi(m), 0.8, ((1, 1),), 0.3), t0 + j * 0.05, 0.035, -0.5 + j / 3)
def crack(t0):
    for j in range(5): m = int(0.05 * SR); tm = tt(m); place(fx, filt(rng.standard_normal(m), "high", 1500) * np.exp(-tm * 60), t0 + j * 0.035 + rng.random() * 0.02, 0.18, rng.uniform(-0.5, 0.5))
def splash(t0): n = int(0.9 * SR); tm = tt(n); place(fx, filt(rng.standard_normal(n), "band", [600, 7000]) * np.exp(-tm * 4) * np.clip(tm / 0.01, 0, 1), t0, 0.16)
def slowmo(t0): place(fx, chirp(900, 120, 1.0) * 0.6 + sweep(1.0, 4000, 300, 0.8) * np.sin(np.linspace(0, np.pi, int(1.0 * SR))) * 0.5, t0, 0.07)
def squeeze(t0):
    for j in range(3): m = int(0.12 * SR); tm = tt(m); place(fx, filt(rng.standard_normal(m), "band", [1500, 5000]) * np.sin(np.pi * tm / 0.12), t0 + j * 0.15, 0.08)
def pour(t0, dur): n = int(dur * SR); tm = tt(n); place(fx, filt(rng.standard_normal(n), "band", [300, 2500]) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tm)) * np.sin(np.pi * tm / dur), t0, 0.07)
def laugh(t0):
    for j in range(4): place(fx, chirp(900 - j * 60, 1300 - j * 60, 0.11) * 0.7, t0 + j * 0.13, 0.05, 0.3)
def fire(t0): n = int(1.5 * SR); tm = tt(n); x = filt(rng.standard_normal(n), "low", 1500) * np.clip(tm / 0.2, 0, 1) * np.exp(-np.maximum(tm - 0.6, 0) * 3) + (rng.random(n) > 0.997) * rng.standard_normal(n) * 1.5; place(fx, x, t0, 0.14)
def sizzle(t0, dur): n = int(dur * SR); tm = tt(n); x = filt(rng.standard_normal(n), "high", 3000) * (0.5 + 0.5 * (rng.random(n // 2400 + 2).repeat(2400)[:n])) * np.clip(tm / 0.4, 0, 1) * np.clip((dur - tm) / 0.3, 0, 1); place(fx, x, t0, 0.035)
def chop(t0): n = int(0.2 * SR); tm = tt(n); place(fx, np.sin(2 * np.pi * 180 * tm) * np.exp(-tm * 30) + filt(rng.standard_normal(n), "high", 2000) * np.exp(-tm * 50) * 0.6, t0, 0.22)
def wipe(t0, dur): n = int(dur * SR); tm = tt(n); place(fx, filt(rng.standard_normal(n), "band", [1000, 5000]) * np.sin(np.pi * tm / dur) ** 2, t0, 0.08)
def card(t0): place(fx, chirp(500, 1400, 0.12, 0.05), t0, 0.06, rng.uniform(-0.3, 0.3)); place(fx, tone(midi(84), 0.3, ((1, 1),), 0.1), t0 + 0.02, 0.03)
def buzz(t0, dur): n = int(dur * SR); tm = tt(n); x = np.sign(np.sin(2 * np.pi * 150 * tm)) * (np.sin(2 * np.pi * 6 * tm) > 0) * 0.5; place(fx, filt(x, "low", 800), t0, 0.07)
def notif(t0, gain=1.0): place(fx, tone(midi(88), 0.25, ((1, 1), (2, 0.2)), 0.08) + np.pad(tone(midi(93), 0.25, ((1, 1),), 0.08), (int(0.07 * SR), 0))[:int(0.25 * SR)], t0, 0.07 * gain, rng.uniform(-0.4, 0.4))
def boing(t0, gain=1.0): n = int(0.45 * SR); tm = tt(n); f = 180 + 260 * np.exp(-tm * 6) * (1 + 0.3 * np.sin(2 * np.pi * 14 * tm)); place(fx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tm * 6), t0, 0.12 * gain, rng.uniform(-0.3, 0.3))
def rec(t0): place(fx, tone(midi(76), 0.2, ((1, 1),), 0.08), t0, 0.06)
def stretch(t0, dur): place(fx, chirp(200, 900, dur) * 0.6, t0, 0.06)
def wind(t0, dur): n = int(dur * SR); tm = tt(n); place(fx, filt(rng.standard_normal(n), "band", [300, 1200]) * np.sin(np.pi * tm / dur) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * tm)), t0, 0.06)
def tada(t0):
    for j, m in enumerate([72, 76, 79, 84]): place(fx, tone(midi(m), 0.9, ((1, 1), (2, 0.4), (3, 0.2)), 0.4), t0 + j * 0.06, 0.07, -0.3 + j * 0.2)
def crickets(t0, dur):
    k = 0.0
    while k < dur:
        for j in range(3): m = int(0.035 * SR); tm = tt(m); place(fx, np.sin(2 * np.pi * 4300 * tm) * np.sin(np.pi * tm / 0.035), t0 + k + j * 0.05, 0.03, 0.5)
        k += 0.45
def angry(t0):
    for j in range(5): m = int(0.09 * SR); tm = tt(m); place(fx, chirp(rng.uniform(300, 500), rng.uniform(200, 300), 0.09) * 0.7, t0 + j * 0.1, 0.05, rng.uniform(-0.4, 0.4))
def door(t0): n = int(0.5 * SR); tm = tt(n); place(fx, np.sin(2 * np.pi * (70 + 40 * np.exp(-tm * 20)) * tm) * np.exp(-tm * 9) + filt(rng.standard_normal(n), "low", 1500) * np.exp(-tm * 20) * 0.6, t0, 0.3)
def tvon(t0):
    n = int(0.6 * SR); tm = tt(n); place(fx, np.sin(2 * np.pi * 15700 * tm) * np.exp(-tm * 3) * 0.15 + np.sin(2 * np.pi * (60 + 30 * np.exp(-tm * 30)) * tm) * np.exp(-tm * 10) + filt(rng.standard_normal(n), "band", [800, 6000]) * np.exp(-tm * 8) * 0.5, t0, 0.18)
def static(t0, dur):
    n = int(dur * SR); tm = tt(n); place(fx, filt(rng.standard_normal(n), "band", [400, 9000]) * np.sin(np.pi * tm / dur) ** 0.7 * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * 37 * tm))), t0, 0.07)
def gun(t0):
    for k, (d, f) in enumerate(((0, 2600), (0.07, 1700))):
        m = int(0.06 * SR); tm = tt(m); place(fx, (np.sin(2 * np.pi * f * tm) * 0.6 + filt(rng.standard_normal(m), "high", 1500)) * np.exp(-tm * 110), t0 + d, 0.2 - k * 0.05)
def register(t0):
    bell(t0 + 0.12); coin(t0 + 0.05); n = int(0.15 * SR); tm = tt(n); place(fx, filt(rng.standard_normal(n), "band", [300, 2500]) * np.exp(-tm * 30), t0, 0.15)
def engine(t0, dur, f0, f1, gain=1.0):
    n = int(dur * SR); tm = tt(n); u = tm / dur; f = f0 * (f1 / f0) ** np.clip(u * 1.2, 0, 1)
    ph = 2 * np.pi * np.cumsum(f) / SR; x = sum(np.sin(k * ph) / k for k in range(1, 9)) + 0.35 * np.sign(np.sin(ph * 0.5))
    x = x * (1 + 0.25 * filt(rng.standard_normal(n), "low", 400)) + 0.15 * filt(rng.standard_normal(n), "band", [800, 4000])
    env = np.clip(tm / 0.15, 0, 1) * np.clip((dur - tm) / 0.35, 0, 1)
    place(fx, filt(x, "low", 3500) * env, t0, 0.05 * gain)
H = {"engine": lambda c: engine(c["t"], c["dur"], c["f0"], c["f1"], c.get("gain", 1.0)), "tvon": lambda c: tvon(c["t"]), "static": lambda c: static(c["t"], c.get("dur", 0.4)), "gun": lambda c: gun(c["t"]), "register": lambda c: register(c["t"]), "buzz": lambda c: buzz(c["t"], c["dur"]), "notif": lambda c: notif(c["t"], c.get("gain", 1.0)), "boing": lambda c: boing(c["t"], c.get("gain", 1.0)), "rec": lambda c: rec(c["t"]), "stretch": lambda c: stretch(c["t"], c["dur"]), "wind": lambda c: wind(c["t"], c["dur"]), "tada": lambda c: tada(c["t"]), "crickets": lambda c: crickets(c["t"], c["dur"]), "angry": lambda c: angry(c["t"]), "door": lambda c: door(c["t"]),
     "card": lambda c: card(c["t"]), "plop": lambda c: plop(c["t"]), "water": lambda c: water(c["t"], c["dur"]), "sparkle": lambda c: sparkle(c["t"]), "crack": lambda c: crack(c["t"]), "splash": lambda c: splash(c["t"]), "slowmo": lambda c: slowmo(c["t"]), "squeeze": lambda c: squeeze(c["t"]), "pour": lambda c: pour(c["t"], c["dur"]), "laugh": lambda c: laugh(c["t"]), "fire": lambda c: fire(c["t"]), "sizzle": lambda c: sizzle(c["t"], c["dur"]), "chop": lambda c: chop(c["t"]), "wipe": lambda c: wipe(c["t"], c["dur"]),
     "sms": lambda c: sms(c["t"]), "ring": lambda c: ring(c["t"], c["dur"]), "alarm": lambda c: alarm(c["t"]), "error": lambda c: error(c["t"]), "send": lambda c: send(c["t"]), "key": lambda c: key(c["t"]), "success": lambda c: success(c["t"]), "heart": lambda c: heart(c["t"]),
     "whoosh": lambda c: whoosh(c["t"], c.get("dur", 0.5), c.get("gain", 1.0)), "swoosh": lambda c: swoosh(c["t"], c.get("gain", 1.0)), "tap": lambda c: tap(c["t"]), "zap": lambda c: zap(c["t"]),
     "pop": lambda c: pop(c["t"], c.get("gain", 1.0)), "tick": lambda c: tick(c["t"], c["dur"]), "scan": lambda c: scan(c["t"], c["dur"], c.get("gain", 1.0)), "coin": lambda c: coin(c["t"]),
     "impact": lambda c: impact(c["t"], c.get("gain", 1.0)), "glitch": lambda c: glitch(c["t"], c["dur"]), "type": lambda c: typing(c["t"], c["n"], c["rate"]), "riser": lambda c: riser(c["t"], c["dur"]),
     "ding": lambda c: ding(c["t"], c.get("soft", 0)), "roll": lambda c: roll(c["t"], c["dur"]), "lock": lambda c: lock(c["t"]), "reveal": lambda c: reveal(c["t"]), "scratch": lambda c: scratch(c["t"]),
     "minus": lambda c: minus(c["t"]), "plus": lambda c: plus(c["t"]), "stamp": lambda c: stamp(c["t"]), "bell": lambda c: bell(c["t"]), "confetti": lambda c: confetti(c["t"]), "music": lambda c: None}
for c in CUES: H[c["type"]](c)

# ============================ MIX ============================
voz, sr = sf.read(ROOT / "build/narracao.wav")
if sr != SR: voz = signal.resample_poly(voz, SR, sr)
voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]
voz = voz + 0.2 * filt(voz, "low", 200)
venv = filt(np.abs(voz), "low", 6, 1); venv /= venv.max() + 1e-9
duck = filt(1 - 0.5 * np.clip(venv * 4, 0, 1), "low", 3, 1)
MUSIC, FX = 0.22, 0.9
mix = np.stack([voz, voz], 1) * 0.95 + mus * MUSIC * duck[:, None] + fx * FX
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
sp = venv > 0.08
print(f"voz {db(voz[sp]):.1f} dB | música sob a voz {db((mus[:,0]*MUSIC*duck)[sp]):.1f} dB | música nas pausas {db((mus[:,0]*MUSIC)[~sp]):.1f} dB | efeitos {db(fx[:,0]*FX):.1f} dB")
mix /= np.abs(mix).max() + 1e-9
sf.write(ROOT / "build/musica.wav", (mus * 0.9).astype(np.float32), SR, subtype="PCM_16")
sf.write(ROOT / "build/efeitos.wav", (fx / (np.abs(fx).max() + 1e-9) * 0.9).astype(np.float32), SR, subtype="PCM_16")
tmp = ROOT / "build/_mix.wav"; sf.write(tmp, mix.astype(np.float32), SR, subtype="FLOAT")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), "-c:a", "pcm_s16le", str(ROOT / "build/audio_final.wav")], check=True)
tmp.unlink(); print(f"ok: build/audio_final.wav ({DUR:.1f}s)")
