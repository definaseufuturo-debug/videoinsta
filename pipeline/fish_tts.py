#!/usr/bin/env python3
"""Roda no GitHub Actions: para cada tts/jobs/<slug>.json com status "pendente", chama a Fish Audio
por clip e grava tts/out/<slug>/<clip>.wav (24 kHz). Marca o job como "pronto" (ou "erro")."""
import json, os, sys, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEY = os.environ.get("FISH_API_KEY", "")
for jf in sorted((ROOT / "tts/jobs").glob("*.json")):
    job = json.loads(jf.read_text())
    if job.get("status") != "pendente": continue
    out = ROOT / "tts/out" / jf.stem; out.mkdir(parents=True, exist_ok=True)
    if not KEY:
        job["status"], job["erro"] = "erro", "segredo FISH_API_KEY não configurado no repositório"
        jf.write_text(json.dumps(job, ensure_ascii=False, indent=2)); continue
    try:
        for c in job["clips"]:
            body = {"text": c["text"], "reference_id": job["voice"], "format": "wav", "sample_rate": 24000, "latency": "normal",
                    "normalize": True, "language": job.get("language", "pt"), "temperature": job.get("temperature", 0.7), "top_p": 0.7,
                    "prosody": {"speed": job.get("speed", 1.0), "volume": 0, "normalize_loudness": True}}
            for attempt in range(3):
                req = urllib.request.Request("https://api.fish.audio/v1/tts", data=json.dumps(body).encode(), method="POST",
                                             headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json", "model": job.get("model", "s2.1-pro")})
                try:
                    with urllib.request.urlopen(req, timeout=180) as r: audio = r.read()
                    break
                except urllib.error.HTTPError as e:
                    msg = e.read().decode(errors="ignore")[:300]
                    if e.code in (401, 402) or attempt == 2: raise RuntimeError(f"HTTP {e.code}: {msg}")
                    time.sleep(5)
            (out / f"{c['id']}.wav").write_bytes(audio); print(jf.stem, c["id"], len(audio), "bytes")
        job["status"] = "pronto"
    except Exception as e:
        job["status"], job["erro"] = "erro", str(e)[:400]; print("ERRO", jf.stem, e, file=sys.stderr)
    jf.write_text(json.dumps(job, ensure_ascii=False, indent=2))
