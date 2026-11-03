#!/usr/bin/env python3
"""Trilha do vídeo "O sucesso que ninguém viu": aplauso de plateia que corta seco quando a cortina sobe, susto,
pancadas da headline, bastidor solitário (papel amassado, bolinhas caindo, contador acelerando), vitória na tentativa
1.000, recomeço "e você?" e acorde final."""
import json, numpy as np, soundfile as sf, subprocess
from scipy import signal
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR); rng = np.random.default_rng(1000)
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
def clap1():
    n = int(.05 * SR); return bp(rng.standard_normal(n), 900, 5000) * env(n, .0008, .012)
# palco: acorde "brilhante" porém oco
put(pad([45, 52, 57, 64], 10.4, 0.06, 900), 0)
for tt, m in [(0.3, 76), (2.4, 74), (5.0, 72), (7.6, 71)]: put(pluck(m, 2.0, 0.09), tt, pan=0.2)
put(pad([33, 40, 45], 4.4, 0.08, 400), 11.0)
# bastidor: piano solitário que sobe; vira maior na vitória
for tt, m in [(15.4, 57), (16.0, 60), (16.9, 64), (17.6, 62), (18.15, 60), (18.6, 64), (18.95, 67), (19.25, 69), (19.5, 71), (19.7, 72)]: put(pluck(m, 1.6, 0.11), tt, pan=-0.15)
put(pad([45, 52, 57], 4.7, 0.06, 600), 15.3)
put(pad([48, 55, 64, 67], 3.0, 0.08, 1500), 20.0)
for i, m in enumerate([72, 76, 79, 84]): put(pluck(m, 1.8, 0.13), 20.0 + i * 0.1, pan=0.3)
put(pad([41, 48, 57, 60], 2.9, 0.07, 1200), 20.9)
put(pad([48, 55, 60, 64, 67], 6.3, 0.09, 1600), 23.7)
for i, m in enumerate([60, 64, 67, 72, 76]): put(pluck(m, 2.5, 0.13), 23.8 + i * 0.25)
for tt in np.arange(16.0, 19.8, 0.5): put(kick(0.15 + 0.2 * (tt - 16) / 4), tt)
for c in doc["cues"]:
    t0, ty = c["t"], c["type"]
    if ty == "applause":
        d = c["dur"]; tt = 0.0
        while tt < d:
            g = 0.18 * min(1, (tt + 0.5) / 1.5); put(clap1(), t0 + tt, g * (0.5 + rng.random()), pan=rng.uniform(-0.9, 0.9)); tt += rng.exponential(0.012)
        n = int(d * SR); x = bp(rng.standard_normal(n), 700, 4000) * 0.05; x[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR)); put(x, t0)
    elif ty == "bow":
        n = int(.4 * SR); put(bp(rng.standard_normal(n), 600, 3000) * env(n, .1, .15) * 0.08, t0)
    elif ty == "bubble":
        n = int(.12 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (500 + 900 * t / .12) * t) * env(n, .002, .04) * 0.13, t0, pan=-0.3)
    elif ty == "curtain":
        n = int(1.1 * SR); t = np.arange(n) / SR; put(bp(rng.standard_normal(n), 300, 3000) * np.sin(np.pi * t / 1.1) * 0.25, t0)
    elif ty == "shock":
        n = int(1.6 * SR); t = np.arange(n) / SR; put(sum(np.sin(2 * np.pi * f * t) for f in (mid(81), mid(82))) * env(n, .005, .6) * 0.12, t0)
    elif ty == "hit":
        n = int(1.6 * SR); t = np.arange(n) / SR; f = 105 * np.exp(-t * 3) + 36
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .5) + lp(rng.standard_normal(n), 2500) * env(n, .001, .05) * 0.5
        put(x, t0, 0.9 if c.get("big") else 0.6)
    elif ty == "back":
        n = int(1.2 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (60 * np.exp(-t * 2) + 40) * t) * env(n, .001, .4) * 0.5, t0)
    elif ty == "crumple":
        n = int(.38 * SR); x = np.zeros(n)
        for k in range(14):
            i = int(rng.random() * (n - 600)); m = int(.012 * SR); x[i:i+m] += bp(rng.standard_normal(m), 1500, 8000) * env(m, .0005, .004)
        put(x, t0, 0.5, pan=-0.2)
    elif ty == "land":
        n = int(.1 * SR); put(lp(rng.standard_normal(n), 1200) * env(n, .001, .02) * 0.35, t0, pan=-0.5)
    elif ty == "count":
        put(pluck(84 + min(c["n"], 8), 0.4, 0.06), t0, pan=0.3)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
