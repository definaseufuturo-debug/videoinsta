#!/usr/bin/env python3
"""Trilha do vídeo "Depois": piano melancólico, notificações, bola, relógio, pancadas e porta."""
import json, numpy as np, soundfile as sf, subprocess
from scipy import signal
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR); rng = np.random.default_rng(11)
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
# piano: Am F C G (lento), até a headline; depois mais esparso; volta no fim
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55, 60], [55, 59, 62]]
def bar(t0, ch, g=1.0):
    put(pad([n - 12 for n in ch], 3.2, 0.07 * g), t0)
    put(piano(ch[0] - 12, 3.0, 0.22 * g), t0)
    for i, m in enumerate([ch[1] + 12, ch[2] + 12, ch[0] + 24, ch[2] + 12]): put(piano(m, 1.8, 0.11 * g), t0 + 0.75 * i, pan=(-0.25 if i % 2 else 0.25))
for k in range(4): bar(k * 3.0, chords[k % 4])
put(pad([45, 52, 57], 4.0, 0.06), 12.6)          # headline: só um pedal grave
for k in range(2): bar(16.6 + k * 3.0, chords[(k + 1) % 4], 0.85)
put(piano(57 - 12, 4, 0.2), 22.7); put(pad([45, 48, 52], 2.5, 0.05), 22.6)
# final: acorde maior aberto, mais lento
for i, m in enumerate([60, 64, 67, 72, 76]): put(piano(m, 4.5, 0.12), 24.7 + i * 0.32)
put(pad([48, 55, 60, 64], 5.2, 0.08), 24.6)
for c in doc["cues"]:
    t0, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "ping":
        n = int(.5 * SR); t = np.arange(n) / SR; x = (np.sin(2 * np.pi * 1568 * t) * (t < .09) + np.sin(2 * np.pi * 2093 * t) * (t >= .09)) * np.exp(-t * 9); put(x * 0.12, t0, pan=-0.4)
    elif ty == "bounce":
        n = int(.18 * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * (180 * np.exp(-t * 18) + 70) * t) * env(n, .001, .05); put(x * 0.5 * g, t0)
    elif ty == "bubble":
        n = int(.12 * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * (500 + 900 * t / .12) * t) * env(n, .002, .04); put(x * 0.15 * g, t0)
    elif ty == "paper":
        n = int(.45 * SR); put(bp(rng.standard_normal(n), 2000, 8000) * env(n, .02, .15) * 0.2, t0)
    elif ty == "hit":
        n = int(1.6 * SR); t = np.arange(n) / SR; f = 105 * np.exp(-t * 3) + 36
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .5) + lp(rng.standard_normal(n), 2500) * env(n, .001, .05) * 0.5; put(x, t0, 0.9 if c.get("big") else 0.6)
    elif ty == "tickstart":
        for k in range(int(3.8 / 0.5)):
            n = int(.03 * SR); x = bp(rng.standard_normal(n), 2500, 7000) * env(n, .0005, .008); put(x * 0.5, t0 + k * 0.5 + 0.2, pan=0.3 if k % 2 else -0.3)
    elif ty == "tap":
        n = int(.08 * SR); put(lp(rng.standard_normal(n), 2000) * env(n, .001, .02) * 0.4, t0)
    elif ty == "door":
        n = int(1.0 * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * (70 * np.exp(-t * 6) + 45) * t) * env(n, .001, .25) + lp(rng.standard_normal(n), 800) * env(n, .001, .08) * 0.6; put(x * 0.9, t0, pan=0.4)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
