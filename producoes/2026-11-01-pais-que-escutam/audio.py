#!/usr/bin/env python3
"""Trilha do vídeo "Pais que escutam": piano tenso na casa 1, pancadas da headline, virada calorosa na casa 2 e final."""
import json, numpy as np, soundfile as sf, subprocess
from scipy import signal
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR); rng = np.random.default_rng(41)
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
def bar(t0, ch, g=1.0, step=0.6):
    put(pad([n - 12 for n in ch], 2.8, 0.07 * g), t0); put(piano(ch[0] - 12, 2.6, 0.22 * g), t0)
    for i, m in enumerate([ch[1] + 12, ch[2] + 12, ch[0] + 24, ch[2] + 12]): put(piano(m, 1.6, 0.1 * g), t0 + step * i, pan=(-0.25 if i % 2 else 0.25))
# casa 1: Dm Bb Gm A (tenso)
for k, ch in enumerate([[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]]): bar(k * 2.6, ch, 0.9)
put(pad([38, 45, 50], 4.4, 0.08), 10.5)               # headline: pedal grave
# casa 2: F C Dm Bb → C (caloroso)
for k, ch in enumerate([[53, 57, 60], [48, 52, 55], [50, 53, 57], [46, 50, 53]]): bar(15.0 + k * 2.3, ch, 1.0, 0.55)
for i, m in enumerate([60, 64, 67, 72, 76]): put(piano(m, 4.5, 0.12), 24.4 + i * 0.3)
put(pad([48, 55, 60, 64], 5.4, 0.08), 24.3)
for c in doc["cues"]:
    t0, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "step":
        n = int(.07 * SR); put(lp(rng.standard_normal(n), 700) * env(n, .001, .02) * 0.3 * g, t0, pan=0.3)
    elif ty == "paper":
        n = int(.4 * SR); put(bp(rng.standard_normal(n), 2000, 8000) * env(n, .02, .12) * 0.18 * g, t0)
    elif ty == "sting":
        for m in (62, 63): put(piano(m, 1.5, 0.12), t0)
    elif ty == "yell":
        n = int(.7 * SR); t = np.arange(n) / SR; x = signal.sawtooth(2 * np.pi * (160 + 30 * np.sin(t * 40)) * t) * env(n, .01, .25)
        put(lp(x, 1500) * 0.12 * g + np.sin(2 * np.pi * (90 * np.exp(-t * 8) + 40) * t) * env(n, .001, .2) * 0.5 * g, t0)
    elif ty == "tick":
        n = int(.03 * SR); put(bp(rng.standard_normal(n), 2500, 7000) * env(n, .0005, .008) * 0.5, t0, pan=0.3)
    elif ty == "bubble":
        n = int(.12 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (500 + 900 * t / .12) * t) * env(n, .002, .04) * 0.14 * g, t0)
    elif ty == "hit":
        n = int(1.6 * SR); t = np.arange(n) / SR; f = 105 * np.exp(-t * 3) + 36
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .5) + lp(rng.standard_normal(n), 2500) * env(n, .001, .05) * 0.5; put(x, t0, 0.9 if c.get("big") else 0.6)
    elif ty == "soft":
        n = int(.25 * SR); put(lp(rng.standard_normal(n), 400) * env(n, .01, .06) * 0.3, t0)
    elif ty == "whoosh":
        n = int(.6 * SR); t = np.arange(n) / SR; put(bp(rng.standard_normal(n), 600, 4000) * np.sin(np.pi * t / .6) ** 2 * 0.12, t0)
    elif ty == "up":
        for i, m in enumerate([72, 76, 79] if c["n"] < 2 else [72, 76, 79, 84]): put(piano(m, 1.4, 0.12), t0 + i * 0.08, pan=0.3)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
