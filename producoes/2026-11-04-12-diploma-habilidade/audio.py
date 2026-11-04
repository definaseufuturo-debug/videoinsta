#!/usr/bin/env python3
"""Sons de cena do vídeo "Diploma × habilidade" (gravações do banco; a música entra depois pelo trilha.py):
cidade ao fundo, papéis caindo na pilha, guarda-chuva virando do avesso, conserto, trovão e chuva, pancadas da headline,
passos na chuva, papel molhado no chão, guarda-chuvas abrindo um a um e o fecho."""
import json, sys, numpy as np, soundfile as sf, subprocess
sys.path.insert(0, "../../pipeline")
from sfx import Banco
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
B = Banco(SR, semente=411)
B.cama(put, "amb_cidade", 0, 9.4, g=0.7)
B.cama(put, "amb_chuva", 8.7, DUR, g=1.4)
for c in doc["cues"]:
    t0, ty = c["t"], c["type"]
    if ty == "paper" and c["n"] in (0, 3, 7, 11): B.put(put, "papel", t0, g=0.7, pan=-0.4)
    elif ty == "paper": B.put(put, "pop", t0, g=0.35, pan=-0.4)
    elif ty == "fail": B.put(put, "whoosh", t0 - 0.05, g=0.6, pan=0.4); B.put(put, "erro", t0 + 0.35, g=0.5, pan=0.4)
    elif ty == "fix": B.put(put, "whoosh", t0 - 0.05, g=0.6, pan=0.2); B.put(put, "sucesso", t0 + 0.15, g=0.6, pan=0.2)
    elif ty == "thunder": B.put(put, "trovao", t0 + 0.1, g=1.1)
    elif ty == "hit": B.put(put, "impacto", t0, g=1.0 if c.get("big") else 0.75)
    elif ty == "walk":
        k = 0
        while k * 0.42 < c["dur"]: B.put(put, "passos", t0 + 0.2 + k * 0.42, g=0.5, pan=0.2 - k * 0.1); k += 1
    elif ty == "splat": B.put(put, "batida", t0, g=0.8, pan=-0.3)
    elif ty == "give": B.put(put, "click", t0 + 0.55, g=0.6, pan=-0.2)
    elif ty == "pop": B.put(put, "pop", t0, g=0.7, pan=0.4)
    elif ty == "final": B.put(put, "riser", t0, g=0.6); B.put(put, "impacto", t0 + 0.4, g=0.8)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
