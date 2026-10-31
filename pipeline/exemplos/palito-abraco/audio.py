#!/usr/bin/env python3
"""Trilha do vídeo "O abraço": caixinha de música/piano terno, risada (whee), coração, pancadas, final esperançoso."""
import json, numpy as np, soundfile as sf, subprocess
from scipy import signal
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR); rng = np.random.default_rng(21)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
def lp(x, f): b, a = signal.butter(2, f / (SR / 2)); return signal.lfilter(b, a, x)
env = lambda n, att, dec: np.minimum(1, np.arange(n) / max(1, att * SR)) * np.exp(-np.arange(n) / (dec * SR))
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
def piano(m, dur=2.2, g=0.2):
    n = int(dur * SR); t = np.arange(n) / SR; f = mid(m)
    return sum(a * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k)) * np.exp(-t * (1.2 + k * 0.9)) for k, a in ((1, 1), (2, .5), (3, .2), (4, .08))) * env(n, .003, 1.5) * g
def musicbox(m, g=0.08):
    n = int(1.4 * SR); t = np.arange(n) / SR; f = mid(m)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 4.02 * t) * np.exp(-t * 8)) * np.exp(-t * 3) * g
def pad(notes, dur, g=0.06):
    n = int(dur * SR); t = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * mid(m) * t) + 0.3 * np.sin(2 * np.pi * mid(m) * 2.003 * t) for m in notes)
    return x * np.clip(np.minimum(t / 1.0, (dur - t) / 1.0), 0, 1) * g / len(notes)
# 0-15: caixinha de música em Dó (C G Am F), alegre e lenta; vai ficando mais vazia
ch = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
mel = [76, 74, 72, 74, 76, 76, 76, 74, 74, 74, 76, 79, 79, 76, 74, 72]
for i, m in enumerate(mel):
    t0 = 0.3 + i * 0.47; g = 0.09 * (1 - 0.5 * (t0 / 15))
    if t0 < 14.8: put(musicbox(m, g), t0, pan=0.2 if i % 2 else -0.2)
for k in range(5):
    c = ch[k % 4]; put(pad([n - 12 for n in c], 3.2, 0.06 * (1 - k * 0.15)), k * 3.0); put(piano(c[0] - 12, 3, 0.16 * (1 - k * 0.15)), k * 3.0)
# headline: só pedal grave em Lá menor
put(pad([45, 52, 57], 4.0, 0.07), 15.2)
# 19-25: piano em Fá e Dó, mais cheio, até o final
for k, c in enumerate([[53, 57, 60, 65], [48, 55, 60, 64]]):
    t0 = 19.2 + k * 2.9; put(pad(c, 3.4, 0.08), t0); put(piano(c[0] - 12, 3.2, 0.2), t0)
    for i, m in enumerate([c[1] + 12, c[2] + 12, c[3] + 12, c[2] + 12]): put(piano(m, 2.0, 0.1), t0 + 0.7 * i, pan=(-0.25 if i % 2 else 0.25))
for i, m in enumerate([60, 64, 67, 72, 76]): put(piano(m, 4.5, 0.12), 25.0 + i * 0.3)
put(pad([48, 55, 60, 64, 67], 5.0, 0.09), 24.9)
for c in doc["cues"]:
    t0, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "whee":   # "uiii": glissando suave para cima
        n = int(.55 * SR); t = np.arange(n) / SR; f = 600 + 700 * (t / .55) ** 0.7; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .55) * 0.07; put(x, t0, g)
    elif ty == "heart":
        for k, dt in enumerate((0, 0.18)): n = int(.15 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (70 - 20 * t / .15) * t) * env(n, .002, .05) * 0.5, t0 + dt, g * (1 - 0.3 * k))
    elif ty == "heartbig":
        for k, dt in enumerate((0, 0.18, 0.8, 0.98)): n = int(.18 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (75 - 25 * t / .18) * t) * env(n, .002, .06) * 0.7, t0 + dt, 1 - 0.25 * (k % 2))
    elif ty == "bubble":
        n = int(.12 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (500 + 900 * t / .12) * t) * env(n, .002, .04) * 0.15, t0)
    elif ty == "step":
        n = int(.08 * SR); put(lp(rng.standard_normal(n), 1500) * env(n, .001, .02) * 0.3, t0)
    elif ty == "hit":
        n = int(1.6 * SR); t = np.arange(n) / SR; f = 105 * np.exp(-t * 3) + 36
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .5) + lp(rng.standard_normal(n), 2500) * env(n, .001, .05) * 0.5
        put(x, t0, 0.35 if c.get("soft") else (0.9 if c.get("big") else 0.6))
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
