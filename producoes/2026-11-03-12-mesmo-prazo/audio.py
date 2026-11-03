#!/usr/bin/env python3
"""Trilha do vídeo "Mesmo prazo": tique-taque e folhas de calendário acelerando, susto no dia 29, pancadas da headline,
noite tensa (teclado frenético, relógio, xícaras, café derramado), manhã esperançosa e acorde final."""
import json, numpy as np, soundfile as sf, subprocess
from scipy import signal
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR); rng = np.random.default_rng(303)
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
def tick(g=0.3):
    n = int(.03 * SR); return bp(rng.standard_normal(n), 2500, 7000) * env(n, .0005, .008) * g
# 0-11: relógio + pad em lá menor; batida que acelera com as folhas
for k in range(int(10.9 / 0.5)): put(tick(0.32), 0.15 + k * 0.5, pan=0.3 if k % 2 else -0.3)
put(pad([45, 52, 57], 11.2, 0.07, 650), 0)
for tt in np.arange(2.7, 10.8, 0.5): put(kick(0.22 + 0.28 * (tt - 2.7) / 8), tt)
for tt, m in [(0.4, 69), (1.9, 72), (3.4, 71), (5.0, 69), (6.6, 68), (8.2, 69)]: put(pluck(m, 1.6, 0.09), tt, pan=-0.2)
# headline: pedal grave
put(pad([33, 40, 45], 4.2, 0.08, 400), 11.1)
# noite: pulso tenso, teclado frenético
put(pad([38, 45, 50, 53], 6.3, 0.07, 500), 15.2)
for tt in np.arange(15.4, 21.3, 0.42): put(kick(0.22), tt); put(kick(0.12), tt + 0.16)
for tt in np.arange(15.8, 21.3, 0.07):
    if rng.random() < 0.8:
        n = int(.018 * SR); put(bp(rng.standard_normal(n), 1800, 6000) * env(n, .0005, .006) * 0.22, tt + rng.random() * 0.03, pan=-0.45)
# manhã + final: maior (C G Am F C)
for k, ch in enumerate([[48, 55, 64], [43, 50, 59, 62]]): put(pad(ch, 1.3, 0.08, 1300), 21.4 + k * 1.1)
put(pad([48, 55, 60, 64, 67], 6.4, 0.09, 1600), 23.6)
for i, m in enumerate([60, 64, 67, 72]): put(pluck(m, 1.5, 0.09), 21.6 + i * 0.3, pan=0.3)
for i, m in enumerate([60, 64, 67, 72, 76]): put(pluck(m, 2.5, 0.13), 23.7 + i * 0.25)
for c in doc["cues"]:
    t0, ty = c["t"], c["type"]
    if ty == "flip":
        n = int(.14 * SR); put(bp(rng.standard_normal(n), 1200, 7000) * env(n, .01, .04) * 0.4, t0, pan=0.25 if c["n"] % 2 else -0.25)
    elif ty == "bubble":
        n = int(.12 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (500 + 900 * t / .12) * t) * env(n, .002, .04) * 0.13, t0, pan=-0.3)
    elif ty == "shock":
        n = int(1.6 * SR); t = np.arange(n) / SR; put(sum(np.sin(2 * np.pi * f * t) for f in (mid(81), mid(82))) * env(n, .005, .6) * 0.12, t0)
    elif ty == "drop":
        n = int(.15 * SR); put(lp(rng.standard_normal(n), 1500) * env(n, .001, .03) * 0.4, t0 + 0.45, pan=-0.3)
    elif ty == "hit":
        n = int(1.6 * SR); t = np.arange(n) / SR; f = 105 * np.exp(-t * 3) + 36
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .5) + lp(rng.standard_normal(n), 2500) * env(n, .001, .05) * 0.5
        put(x, t0, 0.9 if c.get("big") else 0.6)
    elif ty == "clock":
        for i in range(2): put(pluck(88, 0.5, 0.07), t0 + i * 0.12, pan=0.1)
    elif ty == "cup":
        n = int(.2 * SR); t = np.arange(n) / SR; put((np.sin(2 * np.pi * 1900 * t) * 0.4 + lp(rng.standard_normal(n), 2500)) * env(n, .001, .03) * 0.3, t0 + 0.1, pan=-0.4)
    elif ty == "spill":
        n = int(.25 * SR); t = np.arange(n) / SR; put((np.sin(2 * np.pi * 1500 * t) * 0.3 + lp(rng.standard_normal(n), 3000)) * env(n, .001, .05) * 0.45, t0 + 0.15, pan=-0.4)
        n = int(1.0 * SR); put(bp(rng.standard_normal(n), 400, 2500) * env(n, .05, .3) * 0.25, t0 + 0.25, pan=-0.4)
    elif ty == "night":
        n = int(1.2 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (60 * np.exp(-t * 2) + 40) * t) * env(n, .001, .4) * 0.5, t0)
    elif ty == "stamp":
        put(kick(0.7), t0); n = int(.1 * SR); put(lp(rng.standard_normal(n), 2000) * env(n, .001, .02) * 0.4, t0)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
