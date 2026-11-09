#!/usr/bin/env python3
"""'O pai que pede desculpa': sons de cena GRAVADOS (pipeline/sfx.py). Sem música."""
import json, sys, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, "../../pipeline")
from sfx import Banco
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
B = Banco(SR, semente=1109)
B.cama(put, "amb_casa", 0, DUR, g=0.8)
tick_ini = None
for c in doc["cues"]:
    t, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "step": B.put(put, "passos", t, g=0.9 * g, pan=-0.15)
    elif ty == "bump": B.put(put, "batida", t, g=0.5 * g)
    elif ty == "break": B.put(put, "copo", t, g=1.0); B.put(put, "impacto", t, g=0.45)
    elif ty == "bubble": B.put(put, "pop", t, g=0.5 * g)
    elif ty == "whoosh": B.put(put, "whoosh", t, g=0.6 * g)
    elif ty == "sigh": B.put(put, "suspiro", t, g=0.45 * g)
    elif ty == "hit": B.put(put, "coracao", t, g=0.9)
    elif ty == "thud": B.put(put, "batida", t, g=1.0 * g)
    elif ty == "grow": B.put(put, "riser", t, g=0.45)
    elif ty == "tickstart": tick_ini = t
    elif ty == "tickstop" and tick_ini is not None: B.cama(put, "relogio", tick_ini, t, g=1.4, fade=0.3)
    elif ty == "hold": B.put(put, "suspiro", t + 0.3, g=0.5)
    elif ty == "final": B.put(put, "riser", t - 0.6, g=0.3); B.put(put, "coracao", t + 0.1, g=0.7)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
