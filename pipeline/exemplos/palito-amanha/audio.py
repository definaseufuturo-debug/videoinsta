#!/usr/bin/env python3
"""Trilha do vídeo "Amanhã eu começo": pulso de relógio, degraus em escala subindo, pancadas da headline, vitória e final."""
import json, numpy as np, soundfile as sf, subprocess
from scipy import signal
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR); rng = np.random.default_rng(31)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
def lp(x, f): b, a = signal.butter(2, f / (SR / 2)); return signal.lfilter(b, a, x)
def bp(x, f0, f1): b, a = signal.butter(2, [f0 / (SR / 2), f1 / (SR / 2)], "band"); return signal.lfilter(b, a, x)
env = lambda n, att, dec: np.minimum(1, np.arange(n) / max(1, att * SR)) * np.exp(-np.arange(n) / (dec * SR))
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(m, dur=1.2, g=0.15):
    n = int(dur * SR); t = np.arange(n) / SR; return sum(a * np.sin(2 * np.pi * mid(m) * k * t) * np.exp(-t * k * 2.5) for k, a in ((1, 1), (2, .4), (3, .15))) * env(n, .003, .7) * g
def pad(notes, dur, g=0.06, br=900):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in notes:
        for d in (-0.07, 0.07): x += signal.sawtooth(2 * np.pi * mid(m + d) * t)
    return lp(x, br) * g / len(notes) * np.clip(np.minimum(t / 0.8, (dur - t) / 0.8), 0, 1)
def kick(g=0.5):
    n = int(.35 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (110 * np.exp(-t * 20) + 45) * t) * env(n, .001, .12) * g
# relógio (tique-taque) 0-11
for k in range(int(11 / 0.5)):
    n = int(.03 * SR); put(bp(rng.standard_normal(n), 2500, 7000) * env(n, .0005, .008) * 0.35, 0.2 + k * 0.5, pan=0.3 if k % 2 else -0.3)
put(pad([45, 52, 57], 11.2, 0.07, 600), 0)
# batida crescendo conforme os dias aceleram
for tt in np.arange(3.0, 11.0, 0.5): put(kick(0.25 + 0.25 * (tt - 3) / 8), tt)
# headline: silêncio + pedal grave
put(pad([33, 40, 45], 4.0, 0.08, 400), 11.2)
# 15-23: pad maior e esperançoso (F C G Am→C)
for k, ch in enumerate([[53, 57, 60], [48, 52, 55], [55, 59, 62], [48, 52, 55, 60]]):
    put(pad(ch, 2.4, 0.07, 1300), 15.2 + k * 2.0)
    for i, m in enumerate([ch[0] + 24, ch[1] + 24, ch[2] + 24]): put(pluck(m, 1.2, 0.07), 15.2 + k * 2.0 + i * 0.5, pan=-0.2 + 0.2 * i)
for i, m in enumerate([60, 64, 67, 72, 76]): put(pluck(m, 2.5, 0.13), 23.5 + i * 0.25)
put(pad([48, 55, 60, 64, 67], 6.5, 0.09, 1600), 23.4)
scale = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 84]
for c in doc["cues"]:
    t0, ty = c["t"], c["type"]
    if ty == "block":
        n = int(.12 * SR); put(lp(rng.standard_normal(n), 900) * env(n, .001, .03) * 0.45, t0)
    elif ty == "tick":
        put(pluck(scale[c["n"]], 0.9, 0.14), t0, pan=0.3)
    elif ty == "bubble":
        n = int(.12 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (500 + 900 * t / .12) * t) * env(n, .002, .04) * 0.13, t0, pan=-0.3)
    elif ty == "hit":
        n = int(1.6 * SR); t = np.arange(n) / SR; f = 105 * np.exp(-t * 3) + 36
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .5) + lp(rng.standard_normal(n), 2500) * env(n, .001, .05) * 0.5
        put(x, t0, 0.9 if c.get("big") else 0.6)
    elif ty == "flag":
        for i, m in enumerate([72, 76, 79, 84]): put(pluck(m, 1.5, 0.16), t0 + i * 0.09, pan=0.4)
    elif ty == "creak":
        n = int(.6 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (180 + 40 * np.sin(t * 30)) * t) * env(n, .05, .2) * 0.06, t0, pan=-0.4)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
