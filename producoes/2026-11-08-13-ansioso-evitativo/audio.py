#!/usr/bin/env python3
"""'Ansioso × evitativo': sons de cena GRAVADOS (pipeline/sfx.py), sem música. Madrugada: ambiente de noite,
teclado, envio, notificação/vibração a cada mensagem, celular virado na mesa, passos acelerando, pancadas da headline."""
import json, sys, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, "../../pipeline")
from sfx import Banco
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
B = Banco(SR, semente=1108)
B.cama(put, "amb_noite", 0, 11.3, g=0.7)
B.cama(put, "amb_noite", 15.2, 21.4, g=0.5)
B.cama(put, "amb_casa", 21.1, 30, g=0.5, fade=0.6)
for c in doc["cues"]:
    t, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "type": B.cama(put, "teclado", t, t + c.get("dur", 0.3), g=0.45, fade=0.03, pan=-0.3)
    elif ty == "herType": B.cama(put, "teclado", t, t + c.get("dur", 0.5), g=0.35, fade=0.03, pan=0.3)
    elif ty == "send": B.put(put, "swipe", t, g=0.35, pan=-0.2)
    elif ty == "notif": B.put(put, "notificacao", t, g=0.55 + 0.25 * min(1, c["i"] / 10), pan=0.3)
    elif ty == "notifSoft": B.put(put, "ding", t, g=0.45)
    elif ty == "flip": B.put(put, "batida", t, g=0.55 * g, pan=0.3)
    elif ty == "cloth": B.put(put, "suspiro", t, g=0.3, pan=0.3)
    elif ty == "step": B.put(put, "passos", t, g=0.4, pan=-0.2)
    elif ty == "stop": B.put(put, "riser", t, g=0.5)
    elif ty == "hit": B.put(put, "impacto" if c.get("big") else "batida", t, g=0.8 if c.get("big") else 1.3)
    elif ty == "sigh": B.put(put, "suspiro", t, g=0.5, pan=-0.2)
    elif ty == "whoosh": B.put(put, "whoosh", t, g=0.45)
    elif ty == "final": B.put(put, "coracao", t + 0.4, g=0.5)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
