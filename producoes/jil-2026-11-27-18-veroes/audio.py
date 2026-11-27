#!/usr/bin/env python3
"""'18 verões': sons de cena GRAVADOS (pipeline/sfx.py), sem música e sem voz."""
import json, sys, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, "../../pipeline")
from sfx import Banco
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
B = Banco(SR, semente=2714)
B.cama(put, "amb_casa", 0, DUR, g=0.4)
for c in doc["cues"]:
    t, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "page": B.put(put, "papel", t, g=0.5 * g, pan=0.1)
    elif ty == "pop": B.put(put, "pop", t, g=0.4 * g, pan=0.2)
    elif ty == "toggle": B.put(put, "toggle", t, g=0.45, pan=-0.2)
    elif ty == "sigh": B.put(put, "suspiro", t, g=0.5)
    elif ty == "knock": B.put(put, "batida", t, g=0.5, pan=-0.4)
    elif ty == "creak": B.put(put, "porta_rangendo", t, g=0.4, pan=-0.4)
    elif ty == "step": B.put(put, "passos", t, g=0.4 * g, pan=0.0)
    elif ty == "warm": B.put(put, "sucesso", t, g=0.25, pan=0.2)
    elif ty == "final": B.put(put, "coracao", t, g=0.8)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
