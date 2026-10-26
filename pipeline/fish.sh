#!/usr/bin/env bash
# Gera a narração de uma produção com a Fish Audio via GitHub Actions e espera os áudios.
#   pipeline/fish.sh <slug>      (usa "fish": {"voice": "<id>", "speed": 1.0} do narration/script.json)
set -e
cd "$(dirname "$0")/.."
S="$1"; P=producoes/$S
python3 - "$S" <<'PY'
import json, re, sys
s = sys.argv[1]; sc = json.load(open(f"producoes/{s}/narration/script.json")); f = sc["fish"]
clips = []
for c in sc["clips"]:
    t = c["text"]
    for a, b in sc.get("say", {}).items(): t = re.sub(r"\b" + re.escape(a) + r"\b", b, t)
    clips.append({"id": c["id"], "text": t})
job = {"status": "pendente", "voice": f["voice"], "speed": f.get("speed", 1.0), "model": f.get("model", "s2.1-pro"), "language": "pt", "clips": clips}
json.dump(job, open(f"tts/jobs/{s}.json", "w"), ensure_ascii=False, indent=2)
PY
git add "tts/jobs/$S.json"
git -c user.name="bemyveus-prog" -c user.email="bemyveus@gmail.com" commit -q -m "fish-tts: pedido $S" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
git pull -q --rebase origin main && git push -q origin HEAD:main
echo "pedido enviado; aguardando o GitHub Actions…"
for i in $(seq 1 60); do
  sleep 10; git pull -q --rebase origin main
  st=$(python3 -c "import json;print(json.load(open('tts/jobs/$S.json'))['status'])")
  [ "$st" = "pronto" ] && break
  [ "$st" = "erro" ] && { python3 -c "import json;print('ERRO:',json.load(open('tts/jobs/$S.json')).get('erro'))"; exit 1; }
done
[ "$st" = "pronto" ] || { echo "tempo esgotado"; exit 1; }
mkdir -p "$P/fish"; cp tts/out/$S/*.wav "$P/fish/"; echo "áudios em $P/fish/"
