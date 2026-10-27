#!/usr/bin/env bash
# Publica via API oficial do Instagram (GitHub Actions) e espera o resultado.
#   pipeline/ig_post.sh <job.json>     (o job tem conta, tipo, video_url|image_urls, caption…)
set -e
cd "$(dirname "$0")/.."
SRC="$1"; ID=$(basename "$SRC" .json)
git pull -q --rebase origin main
python3 - "$SRC" "ig/jobs/$ID.json" <<'PY'
import json, sys
j = json.load(open(sys.argv[1])); j["status"] = "pendente"; json.dump(j, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
PY
git add "ig/jobs/$ID.json"
git -c user.name="bemyveus-prog" -c user.email="bemyveus@gmail.com" commit -q -m "ig-post: pedido $ID" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
git push -q origin HEAD:main
for i in $(seq 1 60); do
  sleep 10; git pull -q --rebase origin main
  st=$(python3 -c "import json;print(json.load(open('ig/jobs/$ID.json'))['status'])")
  [ "$st" != "pendente" ] && break
done
python3 -c "import json;j=json.load(open('ig/jobs/$ID.json'));print(json.dumps({k:j.get(k) for k in ('status','usuario','media_id','erro','limite')},ensure_ascii=False))"
