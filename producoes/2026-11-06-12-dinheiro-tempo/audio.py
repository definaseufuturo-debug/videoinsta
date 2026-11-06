#!/usr/bin/env python3
"""'Dinheiro × tempo': sons de cena GRAVADOS (pipeline/sfx.py). Sem música: ela entra pelo pipeline/trilha.py."""
import json, sys, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, "../../pipeline")
from sfx import Banco
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
B = Banco(SR, semente=1106)
B.cama(put, "amb_casa", 0, 15.2, g=0.8)          # fase A: dentro de casa
B.cama(put, "relogio", 0.2, 11.2, g=1.1, fade=0.4)  # o tempo correndo enquanto ele empilha
B.cama(put, "amb_passaros", 15.0, 23.4, g=0.9)   # fase B: passeando ao ar livre
for c in doc["cues"]:
    t, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "coin": B.put(put, "batida", t, g=0.55, pan=0.25)
    elif ty == "bubble": B.put(put, "pop", t, g=0.5)
    elif ty == "steps":
        for k in range(3): B.put(put, "passos", t + k * 0.38, g=0.7 * g, variacao=2 + k % 2, pan=-0.4)
    elif ty == "sigh": B.put(put, "suspiro", t, g=0.4)
    elif ty == "hit": B.put(put, "impacto" if c.get("big") else "batida", t, g=0.8 if c.get("big") else 1.3)
    elif ty == "whoosh": B.put(put, "whoosh", t, g=0.5)
    elif ty == "photo": B.put(put, "camera", t, g=0.7, pan=-0.2)
    elif ty == "sit": B.put(put, "batida", t, g=0.4)
    elif ty == "final": B.put(put, "coracao", t + 0.4, g=0.6)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
