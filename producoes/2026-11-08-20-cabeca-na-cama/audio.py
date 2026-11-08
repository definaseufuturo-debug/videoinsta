#!/usr/bin/env python3
"""'A cabeça na cama': sons de cena GRAVADOS (pipeline/sfx.py), sem música. Noite (grilos), interruptor, relógio,
um 'pop' a cada pensamento (cada vez mais rápido), lençol se revirando, pancadas da headline, abajur, caneta no papel."""
import json, sys, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, "../../pipeline")
from sfx import Banco
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
B = Banco(SR, semente=2008)
B.cama(put, "amb_noite", 0, 11.3, g=0.75)
B.cama(put, "relogio", 0.5, 11.2, g=0.35, fade=0.4)
B.cama(put, "amb_noite", 15.1, 30, g=0.55, fade=0.6)
for c in doc["cues"]:
    t, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "switch": B.put(put, "toggle", t, g=0.7, pan=0.3)
    elif ty == "pop": B.put(put, "pop", t, g=0.35 + 0.35 * min(1, c["i"] / 12), pan=-0.3 + 0.04 * (c["i"] % 8))
    elif ty == "tick": B.put(put, "tick", t, g=0.7, pan=0.4)
    elif ty == "toss": B.put(put, "whoosh", t, g=0.22, pan=-0.2)
    elif ty == "situp": B.put(put, "riser", t - 0.3, g=0.5)
    elif ty == "hit": B.put(put, "impacto" if c.get("big") else "batida", t, g=0.8 if c.get("big") else 1.3)
    elif ty == "sigh": B.put(put, "suspiro", t, g=0.5, pan=-0.2)
    elif ty == "paper": B.put(put, "papel", t, g=0.6, pan=0.2)
    elif ty == "write": B.put(put, "papel", t, g=0.3, pan=-0.1)
    elif ty == "sleep": B.put(put, "suspiro", t, g=0.35, pan=-0.2)
    elif ty == "final": B.put(put, "coracao", t + 0.4, g=0.5)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
