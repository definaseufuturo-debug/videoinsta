#!/usr/bin/env bash
# Mostra as visualizações dos vídeos já postados de uma conta (só leitura, via GitHub Actions + YouTube Data API).
#   pipeline/yt_stats.sh [jesusislove|mindloop]     (padrão: jesusislove; mostra do mais visto ao menos visto)
set -e
cd "$(dirname "$0")/.."
CONTA="${1:-jesusislove}"
case "$CONTA" in
  jesusislove) FILA=fila_jesusislove.json; CANAL=cristao;;
  mindloop) FILA=fila.json; CANAL="";;
  *) echo "conta desconhecida: $CONTA"; exit 1;;
esac
ID="stats-$CONTA-$(date +%Y%m%d-%H%M)"
git pull -q --rebase origin main; mkdir -p yt/jobs
python3 - "$FILA" "$CANAL" "yt/jobs/$ID.json" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
ids = [x.get("youtube_id") for x in d["agendados"] if x.get("status") == "postado" and x.get("youtube_id")]
if not ids: sys.exit("nenhum vídeo postado com youtube_id nessa fila")
json.dump({"status": "pendente", "acao": "stats", "canal": sys.argv[2], "ids": ids}, open(sys.argv[3], "w"), indent=1)
PY
git add "yt/jobs/$ID.json"
git -c user.name="bemyveus-prog" -c user.email="bemyveus@gmail.com" commit -q -m "yt-stats: $ID" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -q origin HEAD:main
for i in $(seq 1 40); do
  sleep 10; git pull -q --rebase origin main
  st=$(python3 -c "import json;print(json.load(open('yt/jobs/$ID.json'))['status'])")
  [ "$st" != "pendente" ] && break
done
python3 - "yt/jobs/$ID.json" <<'PY'
import json, sys
j = json.load(open(sys.argv[1]))
if j["status"] != "ok": sys.exit("erro: " + str(j.get("erro")))
print("views  likes  coment  título")
for k, v in sorted(j["stats"].items(), key=lambda x: -x[1]["views"]):
    print(f'{v["views"]:>6} {v["likes"]:>6} {v["comments"]:>7}  {v["title"][:70]}')
PY
