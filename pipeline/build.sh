#!/usr/bin/env bash
# Gera narração, áudio e vídeo de uma produção:  pipeline/build.sh <slug> [--frames 1,5,9]
set -e
cd "$(dirname "$0")/../producoes/$1"; shift || true
python3 tools/tts.py | tail -8
python3 - <<'PY'
import json;t=json.load(open('build/timeline.json'));w=t['words']
bad=[(a['text'],b['text']) for a,b in zip(w,w[1:]) if b['start']<a['start']]
assert not bad, f"timeline fora de ordem: {bad[:3]}"
print("timeline ok", t['duration'], "s")
PY
node tools/export-cues.js
python3 tools/audio.py | tail -2
if [ "$1" = "--frames" ]; then node render.js --frames "$2"; exit 0; fi
node render.js --workers "$(nproc)" | tail -1
ls -la build/video.mp4
