#!/usr/bin/env python3
"""Sons de cena do vídeo "Renda × gastos" (gravações do banco; a música entra depois pelo trilha.py):
casa ao fundo, água escorrendo (some quando ele fecha a torneira), moedas no dia do salário, notificação de cada gasto,
o susto, pancadas da headline, registro girando, caneca nova e o fecho."""
import json, sys, numpy as np, soundfile as sf, subprocess
sys.path.insert(0, "../../pipeline")
from sfx import Banco
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
B = Banco(SR, semente=1904)
B.cama(put, "amb_casa", 0, DUR, g=0.9)
B.cama(put, "amb_chuva", 0, 16.4, g=0.45)          # água escorrendo das duas torneiras
B.cama(put, "amb_chuva", 16.0, 22.8, g=0.3, pan=-0.4)  # só a dele continua
k = 0
for c in doc["cues"]:
    t0, ty = c["t"], c["type"]
    if ty == "pay" and c["n"] in (0, 2, 4, 6, 8, 10): B.put(put, "moedas", t0 + 0.1, g=0.6)
    elif ty == "spend":
        k += 1
        if k % 3 == 1: B.put(put, "notificacao", t0, g=0.5, pan=-0.3 if c["m"] == 0 else 0.3)
        else: B.put(put, "pop", t0, g=0.35, pan=-0.3 if c["m"] == 0 else 0.3)
    elif ty == "notice": B.put(put, "tick", t0, g=0.8, pan=0.4)
    elif ty == "hit": B.put(put, "impacto", t0, g=1.0 if c.get("big") else 0.75)
    elif ty == "valve": B.put(put, "click", t0, g=0.7); B.put(put, "toggle", t0 + 0.5, g=0.6)
    elif ty == "grow": B.put(put, "whoosh", t0, g=0.6, pan=-0.3); B.put(put, "dinheiro", t0 + 0.3, g=0.5, pan=-0.3)
    elif ty == "point": B.put(put, "ding", t0, g=0.4, pan=0.3)
    elif ty == "final": B.put(put, "riser", t0, g=0.6); B.put(put, "impacto", t0 + 0.4, g=0.8)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
