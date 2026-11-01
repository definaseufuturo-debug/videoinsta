#!/usr/bin/env python3
"""Trilha do vídeo "Só mais 5 minutos": teclado e tique-taque, piano melancólico, giros do relógio, pancadas, rebobinar e virada calorosa."""
import json, numpy as np, soundfile as sf, subprocess
from scipy import signal
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR); rng = np.random.default_rng(55)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
def lp(x, f): b, a = signal.butter(2, f / (SR / 2)); return signal.lfilter(b, a, x)
def bp(x, f0, f1): b, a = signal.butter(2, [f0 / (SR / 2), f1 / (SR / 2)], "band"); return signal.lfilter(b, a, x)
env = lambda n, att, dec: np.minimum(1, np.arange(n) / max(1, att * SR)) * np.exp(-np.arange(n) / (dec * SR))
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
def piano(m, dur=2.2, g=0.2):
    n = int(dur * SR); t = np.arange(n) / SR; f = mid(m)
    x = sum(a * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k)) * np.exp(-t * (1.2 + k * 0.9)) for k, a in ((1, 1), (2, .5), (3, .22), (4, .1)))
    return x * env(n, .003, 1.4) * g
def pad(notes, dur, g=0.06):
    n = int(dur * SR); t = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * mid(m) * t) + 0.3 * np.sin(2 * np.pi * mid(m) * 2.002 * t) for m in notes)
    fade = np.clip(np.minimum(t / 1.0, (dur - t) / 1.0), 0, 1); return x * fade * g / len(notes)
def bar(t0, ch, g=1.0, step=0.7):
    put(pad([n - 12 for n in ch], 3.0, 0.07 * g), t0); put(piano(ch[0] - 12, 2.8, 0.22 * g), t0)
    for i, m in enumerate([ch[1] + 12, ch[2] + 12, ch[0] + 24, ch[2] + 12]): put(piano(m, 1.7, 0.1 * g), t0 + step * i, pan=(-0.25 if i % 2 else 0.25))
# 0-11.8: Am F C G (melancólico)
for k, ch in enumerate([[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]): bar(k * 2.9, ch, 0.9)
# tique-taque até a headline
for k in range(int(11.6 / 0.5)):
    n = int(.03 * SR); put(bp(rng.standard_normal(n), 2500, 7000) * env(n, .0005, .008) * 0.3, 0.2 + k * 0.5, pan=0.3 if k % 2 else -0.3)
put(pad([45, 52, 57], 4.0, 0.08), 11.8)
# virada: C G Am F → C (calorosa)
for k, ch in enumerate([[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]]): bar(16.4 + k * 2.0, ch, 1.0, 0.5)
for i, m in enumerate([60, 64, 67, 72, 76]): put(piano(m, 4.5, 0.12), 24.4 + i * 0.3)
put(pad([48, 55, 60, 64], 5.4, 0.08), 24.3)
for c in doc["cues"]:
    t0, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "type":
        for j in range(3):
            n = int(.025 * SR); put(bp(rng.standard_normal(n), 1500, 6000) * env(n, .0005, .006) * 0.18 * g, t0 + j * 0.11 + rng.random() * 0.03, pan=-0.4)
    elif ty == "bubble":
        n = int(.12 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (500 + 900 * t / .12) * t) * env(n, .002, .04) * 0.14 * g, t0)
    elif ty in ("spin", "rewind"):
        d = c["dur"]; n = int(d * SR); t = np.arange(n) / SR; rate = 18 if ty == "spin" else 26
        clicks = np.zeros(n); step = int(SR / rate)
        for i in range(0, n - 200, step): clicks[i:i+120] += bp(rng.standard_normal(120), 2500, 7000) * np.exp(-np.arange(120) / 20)
        sweep = np.sin(2 * np.pi * np.cumsum(300 + (900 if ty == "spin" else -200) * t / d) / SR) * np.sin(np.pi * t / d) * 0.05
        put(clicks * 0.35 + sweep, t0, pan=-0.3)
    elif ty == "door":
        n = int(1.0 * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * (70 * np.exp(-t * 6) + 45) * t) * env(n, .001, .25) + lp(rng.standard_normal(n), 800) * env(n, .001, .08) * 0.6; put(x * 0.6, t0, pan=0.4)
    elif ty == "ring":
        n = int(1.2 * SR); t = np.arange(n) / SR; x = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * ((t % 0.6) < 0.4) * 0.05; put(x, t0)
    elif ty == "hit":
        n = int(1.6 * SR); t = np.arange(n) / SR; f = 105 * np.exp(-t * 3) + 36
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .5) + lp(rng.standard_normal(n), 2500) * env(n, .001, .05) * 0.5; put(x, t0, 0.9 if c.get("big") else 0.6)
    elif ty == "close":
        n = int(.2 * SR); put(lp(rng.standard_normal(n), 1200) * env(n, .001, .04) * 0.6, t0)
    elif ty == "laugh":
        for i, m in enumerate([76, 79, 84]): put(piano(m, 1.0, 0.08), t0 + i * 0.1, pan=0.3)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
