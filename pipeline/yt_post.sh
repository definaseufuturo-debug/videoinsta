#!/usr/bin/env bash
# Publica um Short no YouTube via GitHub Actions e espera o resultado.
#   pipeline/yt_post.sh <id> <video relativo ao repo> <legenda.txt|-> [titulo]
#   Sem título, usa a 1ª linha da legenda. A descrição é a legenda + #Shorts.
set -e
cd "$(dirname "$0")/.."
ID="$1"; VID="$2"; LEG="$3"; TIT="${4:-}"
git pull -q --rebase origin main
python3 - "$ID" "$VID" "$LEG" "$TIT" <<'PY'
import json, re, sys
i, vid, leg, tit = sys.argv[1:5]
txt = sys.stdin.read() if leg == "-" else open(leg).read()
tags = re.findall(r"#(\w+)", txt)
first = txt.strip().splitlines()[0] if txt.strip() else i
title = (tit or re.sub(r"\s*#\w+", "", first)).strip()
title = re.sub(r"[^\w\s.,:;!?()'\"%$-–—/@áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]", "", title).strip()
if len(title) > 90: title = title[:87].rsplit(" ", 1)[0] + "…"
desc = txt.strip() + ("" if "#shorts" in txt.lower() else "\n\n#Shorts")
job = {"status": "pendente", "video": vid, "title": title + " #Shorts", "description": desc,
       "tags": tags[:15] + ["Shorts"], "privacy": "public", "categoryId": 27}
json.dump(job, open(f"yt/jobs/{i}.json", "w"), ensure_ascii=False, indent=2)
print("título:", job["title"])
PY
git add "yt/jobs/$ID.json"
git -c user.name="bemyveus-prog" -c user.email="bemyveus@gmail.com" commit -q -m "yt-post: pedido $ID" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
git push -q origin HEAD:main
for i in $(seq 1 90); do
  sleep 10; git pull -q --rebase origin main
  st=$(python3 -c "import json;print(json.load(open('yt/jobs/$ID.json'))['status'])")
  [ "$st" != "pendente" ] && break
done
python3 -c "import json;j=json.load(open('yt/jobs/$ID.json'));print(json.dumps({k:j.get(k) for k in ('status','video_id','url','privacidade','erro')},ensure_ascii=False))"
