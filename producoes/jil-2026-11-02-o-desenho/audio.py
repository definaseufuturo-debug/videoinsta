#!/usr/bin/env python3
"""Trilha do vídeo "O desenho": piano melancólico, lápis riscando, notificações, relógio, pancadas da headline,
batida de coração no close do desenho e virada esperançosa quando o pai larga o celular."""
import json, numpy as np, soundfile as sf, subprocess
from scipy import signal
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR); rng = np.random.default_rng(23)
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
# 1) melancólico: Em C G D até a headline
chords = [[52, 55, 59], [48, 52, 55], [43, 47, 50, 55], [50, 54, 57]]
def bar(t0, ch, g=1.0, step=0.75):
    put(pad([n - 12 for n in ch], 3.4, 0.07 * g), t0)
    put(piano(ch[0] - 12, 3.0, 0.22 * g), t0)
    for i, m in enumerate([ch[1] + 12, ch[2] + 12, ch[0] + 24, ch[2] + 12]): put(piano(m, 1.8, 0.11 * g), t0 + step * i, pan=(-0.25 if i % 2 else 0.25))
for k in range(4): bar(k * 3.1, chords[k % 4])
put(pad([40, 47, 52], 4.2, 0.06), 12.9)                     # headline: só um pedal grave
put(piano(40, 3, 0.18), 16.8); put(pad([40, 43, 47], 3.0, 0.05), 16.8)   # o pai vê o desenho
# 2) virada (pai larga o celular): G D Em C, mais claro
hope = [[43, 47, 50, 55], [50, 54, 57], [52, 55, 59], [48, 52, 55, 60]]
for k in range(3): bar(19.75 + k * 1.65, hope[k], 0.9, 0.41)
for i, m in enumerate([67, 71, 74, 79, 83]): put(piano(m, 4.5, 0.12), 24.7 + i * 0.3)
put(pad([43, 50, 55, 59], 5.2, 0.08), 24.6)
for c in doc["cues"]:
    t0, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "scribble":   # lápis riscando: ruído agudo em rajadas
        d = c.get("dur", 1.0); n = int(d * SR); t = np.arange(n) / SR
        am = (0.5 + 0.5 * np.sin(2 * np.pi * 7.5 * t + 2 * np.sin(2 * np.pi * 1.3 * t))) ** 2
        put(bp(rng.standard_normal(n), 2500, 9000) * am * np.clip(np.minimum(t / .05, (d - t) / .1), 0, 1) * 0.16 * g, t0, pan=0.15)
    elif ty == "phonepop":
        n = int(.6 * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * (180 * np.exp(-t * 10) + 60) * t) * env(n, .001, .2); put(x * 0.6, t0)
    elif ty == "whoosh":
        n = int(.5 * SR); t = np.arange(n) / SR; put(bp(rng.standard_normal(n), 400, 3000) * np.sin(np.pi * t / .5) * 0.25, t0)
    elif ty == "paper":
        n = int(.45 * SR); put(bp(rng.standard_normal(n), 2000, 8000) * env(n, .02, .15) * 0.2 * g, t0)
    elif ty == "ping":
        n = int(.5 * SR); t = np.arange(n) / SR; x = (np.sin(2 * np.pi * 1568 * t) * (t < .09) + np.sin(2 * np.pi * 2093 * t) * (t >= .09)) * np.exp(-t * 9); put(x * 0.1, t0, pan=-0.4)
    elif ty == "clock":
        for k in range(4):
            n = int(.03 * SR); put(bp(rng.standard_normal(n), 2500, 7000) * env(n, .0005, .008) * 0.5, t0 - 0.3 + k * 0.1, pan=0.3 if k % 2 else -0.3)
    elif ty == "bubble":
        n = int(.12 * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * (500 + 900 * t / .12) * t) * env(n, .002, .04); put(x * 0.15 * g, t0)
    elif ty == "hit":
        n = int(1.6 * SR); t = np.arange(n) / SR; f = 105 * np.exp(-t * 3) + 36
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .5) + lp(rng.standard_normal(n), 2500) * env(n, .001, .05) * 0.5; put(x, t0, 0.9 if c.get("big") else 0.6)
    elif ty == "tickstart":
        for k in range(int(3.6 / 0.5)):
            n = int(.03 * SR); x = bp(rng.standard_normal(n), 2500, 7000) * env(n, .0005, .008); put(x * 0.5, t0 + k * 0.5 + 0.2, pan=0.3 if k % 2 else -0.3)
    elif ty == "heartbeat":
        for k in range(3):
            for dd, gg in ((0, 1), (0.22, 0.7)):
                n = int(.25 * SR); t = np.arange(n) / SR; put(np.sin(2 * np.pi * (60 * np.exp(-t * 8) + 40) * t) * env(n, .002, .07) * 0.7 * gg, t0 + k * 0.75 + dd)
    elif ty == "tap":
        n = int(.08 * SR); put(lp(rng.standard_normal(n), 2000) * env(n, .001, .02) * 0.4, t0)
    elif ty == "bump":
        n = int(.2 * SR); put(lp(rng.standard_normal(n), 700) * env(n, .001, .05) * 0.35, t0)
    elif ty == "hug":
        n = int(2.5 * SR); t = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * mid(m) * t) for m in (67, 71, 74)) * env(n, .2, 1.0) * 0.05; put(x, t0)
    elif ty == "chime":
        for i, m in enumerate([79, 83, 86]): put(piano(m, 2.0, 0.08), t0 + i * 0.12)
    elif ty == "final":
        pass
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
