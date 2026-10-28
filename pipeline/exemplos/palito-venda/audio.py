#!/usr/bin/env python3
"""Trilha sintetizada do vídeo "Tire a venda" (sem narração): drone tenso, passos, quedas, pancadas da headline e virada esperançosa."""
import json, numpy as np, soundfile as sf, subprocess
from scipy import signal
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR); rng = np.random.default_rng(7)
t_all = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
def lp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2)); return signal.lfilter(b, a, x)
def bp(x, f0, f1): b, a = signal.butter(2, [f0 / (SR / 2), f1 / (SR / 2)], "band"); return signal.lfilter(b, a, x)
env = lambda n, att, dec: np.minimum(1, np.arange(n) / max(1, att * SR)) * np.exp(-np.arange(n) / (dec * SR))
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
def pad(notes, dur, g=0.12, bright=900):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in notes:
        for d in (-0.08, 0.08): x += signal.sawtooth(2 * np.pi * mid(m + d) * t)
    x = lp(x, bright) * g / len(notes); fade = np.minimum(1, np.minimum(t / 1.2, (dur - t) / 1.2)); return x * np.clip(fade, 0, 1)
def pluck(m, dur=1.6, g=0.25):
    n = int(dur * SR); t = np.arange(n) / SR; x = sum(a * np.sin(2 * np.pi * mid(m) * k * t) * np.exp(-t * k * 2.2) for k, a in ((1, 1), (2, .35), (3, .15))); return x * env(n, .004, .9) * g
# 1) tensão: drone em lá menor até a headline
put(pad([33, 40, 45], 10.8, 0.16, 500), 0)
put(pad([33, 39, 45], 4.2, 0.10, 350), 10.8)          # sob a headline, mais escuro (trítono)
# batida de passos (pulso grave) 0–10.5
for k in range(int(10.4 / 0.46)):
    tt = k * 0.46; n = int(0.12 * SR); x = np.sin(2 * np.pi * 55 * np.arange(n) / SR) * env(n, .002, .05) + lp(rng.standard_normal(n), 900) * env(n, .001, .02) * 0.4
    put(x, tt, 0.35 if k % 2 == 0 else 0.22)
# notas soltas tensas
for tt, m in [(0.5, 69), (2.3, 68), (4.1, 69), (5.9, 64), (7.7, 65)]: put(pluck(m, 1.8, 0.12), tt, pan=-0.2)
# 2) eventos
for c in doc["cues"]:
    t0, ty = c["t"], c["type"]
    if ty == "fall":   # assobio descendo + vento
        n = int(1.1 * SR); tt = np.arange(n) / SR; f = 900 * np.exp(-tt * 1.6); ph = 2 * np.pi * np.cumsum(f) / SR
        x = np.sin(ph) * 0.15 * env(n, .02, .5) + bp(rng.standard_normal(n), 300, 2000) * env(n, .05, .4) * 0.25; put(x, t0, 0.5 * c.get("gain", 1), pan=0.5)
    elif ty == "stop":
        put(lp(rng.standard_normal(int(.15 * SR)), 1200) * env(int(.15 * SR), .002, .05), t0, 0.5)
    elif ty == "cloth":
        n = int(.35 * SR); put(bp(rng.standard_normal(n), 1500, 6000) * env(n, .05, .12), t0 - 0.1, 0.35, pan=-0.1)
    elif ty == "shock":
        n = int(2.0 * SR); tt = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * f * tt) for f in (mid(81), mid(82))) * env(n, .005, .7) * 0.12; put(x, t0, 1.0)
    elif ty == "hit":  # pancada da headline
        n = int(1.6 * SR); tt = np.arange(n) / SR; f = 110 * np.exp(-tt * 3) + 38
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .5) + lp(rng.standard_normal(n), 3000) * env(n, .001, .06) * 0.6
        put(x, t0, 0.9 if c.get("big") else 0.65)
        if c.get("big"):
            n2 = int(3.0 * SR); put(lp(rng.standard_normal(n2), 400) * env(n2, .01, 1.2) * 0.5, t0, 0.5)
    elif ty == "riser":
        d = c.get("dur", 0.7); n = int(d * SR); tt = np.arange(n) / SR; x = np.zeros(n); blk = 1024
        noise = rng.standard_normal(n)
        for s in range(0, n, blk): f = 300 * (12 ** (s / n)); x[s:s+blk] = bp(noise[s:s+blk], f * .7, min(f * 1.4, 20000))
        put(x * (tt / d) ** 2 * 0.6, t0)
    elif ty == "hold":
        n = int(1.6 * SR); tt = np.arange(n) / SR; x = np.sin(2 * np.pi * (60 * np.exp(-tt * 2) + 40) * tt) * env(n, .001, .4); put(x, t0, 0.8)
    elif ty == "bump":
        n = int(.2 * SR); put(lp(rng.standard_normal(n), 700) * env(n, .001, .05), t0, 0.35 * c.get("gain", 1), pan=0.2)
    elif ty == "final":
        n = int(5.4 * SR); tt = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * mid(m) * tt) for m in (48, 55, 60, 64, 67)) * env(n, .02, 2.5) * 0.08; put(x, t0, 1.0)
# corrida: passos rápidos
for k in range(10): tt = 15.15 + k * 0.135; n = int(.08 * SR); put(lp(rng.standard_normal(n), 1500) * env(n, .001, .02), tt, 0.4)
# 3) virada: pad maior + arpejo esperançoso (C G Am F)
prog_ = [([48, 55, 64], 16.5), ([43, 50, 59, 62], 18.5), ([45, 52, 60, 64], 20.5), ([41, 48, 57, 60], 22.5), ([48, 55, 64, 67], 24.5)]
for notes, t0 in prog_: put(pad(notes, 2.6 if t0 < 24 else 5.5, 0.11, 1400), t0 - 0.05)
arp = [72, 76, 79, 76]
for i in range(int((24.4 - 17.0) / 0.36)):
    tt = 17.0 + i * 0.36; ch = [n for n, t0 in prog_ if t0 <= tt + 0.01][-1]; m = sorted(ch)[-1] + 12 if i % 4 == 3 else sorted(ch)[(i % 3) + 0] + 24
    put(pluck(m, 1.2, 0.08), tt, pan=(-0.3 if i % 2 else 0.3))
for i, m in enumerate([72, 76, 79, 84]): put(pluck(m, 2.5, 0.13), 24.6 + i * 0.28)
mix = np.stack([L, R], 1)
mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok build/audio_final.wav")
