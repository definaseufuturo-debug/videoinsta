#!/usr/bin/env python3
"""'Agora não': sons de cena GRAVADOS (pipeline/sfx.py). Sem música: ela entra pelo pipeline/trilha.py."""
import json, sys, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, "../../pipeline")
from sfx import Banco
SR = 48000; doc = json.load(open("build/cues.json")); DUR = doc["duration"]; N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    L[i:i+len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414
B = Banco(SR, semente=1105)
cats = set(B.categorias())
def tem(*nomes): return next((n for n in nomes if n in cats), None)
amb = tem("amb_casa", "amb_noite")
if amb: B.cama(put, amb, 0, DUR, g=0.8)
tick_ini = None
for c in doc["cues"]:
    t, ty, g = c["t"], c["type"], c.get("gain", 1.0)
    if ty == "step" and tem("passos"): B.put(put, "passos", t, g=0.9 * g, pan=-0.15)
    elif ty == "ping": B.put(put, tem("notificacao", "ding"), t, g=0.6, pan=0.4)
    elif ty == "bubble": B.put(put, "pop", t, g=0.5 * g)
    elif ty == "whoosh": B.put(put, "whoosh", t, g=0.6)
    elif ty == "ball": B.put(put, "batida", t, g=1.2 * g, pan=0.2)
    elif ty == "door" and tem("porta"): B.put(put, "porta", t, g=0.7, pan=-0.5)
    elif ty == "sigh" and tem("suspiro"): B.put(put, "suspiro", t, g=0.45)
    elif ty == "hit": B.put(put, tem("coracao", "batida"), t, g=0.9)
    elif ty == "tap": B.put(put, "click", t, g=0.7)
    elif ty == "kneel": B.put(put, "batida", t, g=0.6)
    elif ty == "tickstart": tick_ini = t
    elif ty == "tickstop" and tick_ini is not None and tem("relogio"): B.cama(put, "relogio", tick_ini, t, g=1.4, fade=0.3)
    elif ty == "hold" and tem("suspiro"): B.put(put, "suspiro", t + 0.3, g=0.5)
mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.9
sf.write("build/audio_raw.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/audio_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "build/audio_final.wav"], check=True)
print("ok")
