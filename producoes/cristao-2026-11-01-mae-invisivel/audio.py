#!/usr/bin/env python3
"""Trilha do vídeo "A mãe invisível": piano melancólico na correria do dia, pancadas da headline,
virada esperançosa no abraço (C G Am F com arpejo) e acorde maior no final."""
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
def piano(m, dur=2.2, g=0.2):
    n = int(dur * SR); t = np.arange(n) / SR; f = mid(m)
    x = sum(a * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k)) * np.exp(-t * (1.2 + k * 0.9)) for k, a in ((1, 1), (2, .5), (3, .22), (4, .1)))
    return x * env(n, .003, 1.4) * g
def pad(notes, dur, g=0.06):
    n = int(dur * SR); t = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * mid(m) * t) + 0.3 * np.sin(2 * np.pi * mid(m) * 2.002 * t) for m in notes)
    fade = np.clip(np.minimum(t / 1.0, (dur - t) / 1.0), 0, 1); return x * fade * g / len(notes)
# 1) correria: Am F C G em colcheias (mais apressado que o "Depois")
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55, 60], [55, 59, 62]]
def bar(t0, ch, g=1.0, step=0.5, dur=2.7):
    put(pad([n - 12 for n in ch], dur + 0.4, 0.07 * g), t0)
    put(piano(ch[0] - 12, 3.0, 0.22 * g), t0)
    for i, m in enumerate([ch[1] + 12, ch[2] + 12, ch[0] + 24, ch[2] + 12, ch[1] + 12]): put(piano(m, 1.6, 0.10 * g), t0 + step * i, pan=(-0.25 if i % 2 else 0.25))
for k in range(4): bar(k * 2.65, chords[k % 4])
put(pad([45, 52, 57], 4.4, 0.06), 10.7)            # headline: pedal grave
for i, m in enumerate([64, 62, 60]): put(piano(m, 2.4, 0.11), 15.2 + i * 0.7)   # alguém levanta
# 2) virada: C G Am F com arpejo, a partir do abraço
prog_ = [([48, 55, 64], 17.3), ([43, 50, 59, 62], 19.1), ([45, 52, 60, 64], 20.9), ([41, 48, 57, 60], 22.7)]
for notes, t0 in prog_:
    put(pad(notes, 2.2, 0.09), t0 - 0.05); put(piano(sorted(notes)[0], 2.5, 0.2), t0)
for i in range(int((24.3 - 17.3) / 0.3)):
    tt = 17.3 + i * 0.3; ch = [n for n, t0 in prog_ if t0 <= tt + 0.01][-1]; srt = sorted(ch)
    put(piano(srt[i % len(srt)] + 24, 1.3, 0.07), tt, pan=(-0.3 if i % 2 else 0.3))
# 3) final: acorde maior aberto
for i, m in enumerate([60, 64, 67, 72, 76]): put(piano(m, 4.5, 0.12), 24.5 + i * 0.32)
put(pad([48, 55, 60, 64], 5.4, 0.08), 24.4)
for c in doc["cues"]:
    t0, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "step":
        n = int(.07 * SR); put(lp(rng.standard_normal(n), 1500) * env(n, .001, .018) * 0.5 * g, t0, pan=0.15)
    elif ty == "ping":
        n = int(.5 * SR); t = np.arange(n) / SR; x = (np.sin(2 * np.pi * 1568 * t) * (t < .09) + np.sin(2 * np.pi * 2093 * t) * (t >= .09)) * np.exp(-t * 9); put(x * 0.12, t0, pan=-0.4)
    elif ty == "clink":
        n = int(.6 * SR); t = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((2650, 9), (3910, 12), (5200, 16))) * 0.08; put(x * g, t0)
    elif ty == "tap":
        n = int(.08 * SR); put(lp(rng.standard_normal(n), 2000) * env(n, .001, .02) * 0.4 * g, t0)
    elif ty == "water":
        d = c.get("dur", 5); n = int(d * SR); t = np.arange(n) / SR; x = bp(rng.standard_normal(n), 1500, 6000) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t) ** 2)
        put(x * np.clip(np.minimum(t / 0.5, (d - t) / 0.8), 0, 1) * 0.035, t0, pan=0.35)
    elif ty == "bubble":
        n = int(.12 * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * (500 + 900 * t / .12) * t) * env(n, .002, .04); put(x * 0.15 * g, t0)
    elif ty == "shock":
        n = int(2.0 * SR); t = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * f * t) for f in (mid(81), mid(82))) * env(n, .005, .7) * 0.1; put(x, t0)
    elif ty == "hit":
        n = int(1.6 * SR); t = np.arange(n) / SR; f = 105 * np.exp(-t * 3) + 36
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .5) + lp(rng.standard_normal(n), 2500) * env(n, .001, .05) * 0.5; put(x, t0, 0.9 if c.get("big") else 0.6)
    elif ty == "riser":
        d = c.get("dur", 0.7); n = int(d * SR); t = np.arange(n) / SR; put(bp(rng.standard_normal(n), 800, 6000) * (t / d) ** 2 * 0.3, t0)
    elif ty == "hold":
        n = int(1.4 * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * (60 * np.exp(-t * 2) + 42) * t) * env(n, .002, .4); put(x * 0.6 * g, t0)
    elif ty == "final":
        n = int(1.6 * SR); t = np.arange(n) / SR; f = 90 * np.exp(-t * 3) + 36; put(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .6), t0, 0.7)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
