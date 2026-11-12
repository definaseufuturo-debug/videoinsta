#!/usr/bin/env python3
"""'A primeira chuva': sons de cena GRAVADOS (pipeline/sfx.py), sem música e sem voz."""
import json, sys, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, "../../pipeline")
from sfx import Banco
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
B = Banco(SR, semente=1212)
B.cama(put, "amb_noite", 0, DUR, g=0.4)
tick_ini = None; c0 = {c["type"]: c["t"] for c in doc["cues"]}
for c in doc["cues"]:
    t, ty = c["t"], c["type"]
    if ty == "steps": B.put(put, "passos", t, g=0.5)
    elif ty == "rain": B.cama(put, "amb_chuva", t, c0["tickstop"] - 0.2, g=0.8, fade=0.8)
    elif ty == "thunder": B.put(put, "trovao", t, g=0.8)
    elif ty == "sigh": B.put(put, "suspiro", t, g=0.6, pan=-0.3)
    elif ty == "umbrella": B.put(put, "whoosh", t, g=0.5, pan=0.3); B.put(put, "click", t + 0.35, g=0.6, pan=0.3)
    elif ty == "whoosh": B.put(put, "whoosh", t, g=0.7)
    elif ty == "tickstart": tick_ini = t
    elif ty == "tickstop" and tick_ini is not None: B.cama(put, "relogio", tick_ini, t, g=1.2, fade=0.2)
    elif ty == "rain2": B.cama(put, "amb_chuva", t, t + 3.0, g=0.6, fade=1.2)
    elif ty == "door": B.put(put, "porta", t, g=0.6, pan=0.4)
    elif ty == "success": B.put(put, "sucesso", t, g=0.35)
    elif ty == "end": B.put(put, "coracao", t, g=0.8); B.put(put, "sino_igreja", t + 1.4, g=0.35)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
