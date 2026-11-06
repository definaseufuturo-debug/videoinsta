#!/usr/bin/env python3
"""'Motivado × disciplinado': sons de cena GRAVADOS (pipeline/sfx.py). Sem música: ela entra pelo pipeline/trilha.py."""
import json, sys, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, "../../pipeline")
from sfx import Banco
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
B = Banco(SR, semente=6119)
B.cama(put, "amb_cidade", 0, 6.4, g=0.7)          # corrida na rua
B.cama(put, "amb_chuva", 6.1, 11.4, g=1.0, fade=0.5)   # chuva do dia 7 (lá fora e pela janela)
B.cama(put, "amb_casa", 7.3, 11.4, g=0.6)
B.cama(put, "amb_cidade", 15.0, 23.0, g=0.5)
n = 0
for c in doc["cues"]:
    t, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty in ("step", "step2"):
        n += 1; B.put(put, "passos", t, g=0.55 * g, variacao=2 + n % 2, pan=(-0.35 if n % 2 else 0.35))
    elif ty == "tick": B.put(put, "tick", t, g=0.9)
    elif ty == "ignite": B.put(put, "whoosh", t, g=0.45)
    elif ty == "thunder": B.put(put, "trovao", t + 0.3, g=0.7)
    elif ty == "hiss": B.put(put, "suspiro", t, g=0.35)
    elif ty == "alarm": B.cama(put, "celular", t, t + 1.1, g=1.0, fade=0.05)
    elif ty == "tap": B.put(put, "click", t, g=0.8)
    elif ty == "bubble": B.put(put, "pop", t, g=0.5)
    elif ty == "sigh": B.put(put, "suspiro", t, g=0.4)
    elif ty == "shoe": B.put(put, "batida", t, g=0.6)
    elif ty == "door": B.put(put, "porta", t, g=0.5, pan=0.5)
    elif ty == "hit": B.put(put, "impacto" if c.get("big") else "batida", t, g=0.8 if c.get("big") else 1.3)
    elif ty == "rainB": B.cama(put, "amb_chuva", t, c["end"], g=0.7, fade=0.3, pan=0.5)
    elif ty == "whoosh": B.put(put, "whoosh", t, g=0.5)
    elif ty == "final": B.put(put, "coracao", t + 0.4, g=0.5)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
