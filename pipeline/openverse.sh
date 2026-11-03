#!/usr/bin/env bash
# Busca música/efeito sonoro livre no Openverse via GitHub Actions e traz os arquivos.
#   pipeline/openverse.sh <slug> "<busca>" [music|sound_effect] [min_s] [max_s] [n]
# Saída: openverse/out/<slug>/NN-xxxx.mp3 + resultados.json (autor, licença, "credito" para a legenda).
# Só licenças cc0, pdm e by (podem ir em conta comercial; "by" exige creditar o autor na legenda).
set -e
cd "$(dirname "$0")/.."
S="$1"; Q="$2"; CAT="${3:-music}"; MIN="${4:-0}"; MAX="${5:-0}"; N="${6:-5}"
# clima:<grupo>/<chave> (ex.: clima:pais_filhos/saudade) usa as buscas de pipeline/clima.json; a 1ª busca com resultado vale
if [[ "$Q" == clima:* ]]; then
  Q=$(python3 -c "import json,sys;g,k=sys.argv[1].split('/');print(' | '.join(json.load(open('pipeline/clima.json'))[g][k]['q']))" "${Q#clima:}")
  [ "$MIN" = 0 ] && MIN=30
fi
python3 - "$S" "$Q" "$CAT" "$MIN" "$MAX" "$N" <<'PY'
import json, sys
s, q, cat, mn, mx, n = sys.argv[1:7]
job = {"status": "pendente", "q": q, "category": cat, "license": "cc0,pdm,by", "n": int(n)}
if int(mn): job["min_s"] = int(mn)
if int(mx): job["max_s"] = int(mx)
json.dump(job, open(f"openverse/jobs/{s}.json", "w"), ensure_ascii=False, indent=2)
PY
git add "openverse/jobs/$S.json"
git -c user.name="bemyveus-prog" -c user.email="bemyveus@gmail.com" commit -q -m "openverse: pedido $S" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
git pull -q --rebase origin main && git push -q origin HEAD:main
echo "pedido enviado; aguardando o GitHub Actions…"
for i in $(seq 1 40); do
  sleep 10; git pull -q --rebase origin main
  st=$(python3 -c "import json;print(json.load(open('openverse/jobs/$S.json'))['status'])")
  [ "$st" = "pronto" ] && break
  [ "$st" = "erro" ] && { python3 -c "import json;print('ERRO:',json.load(open('openverse/jobs/$S.json')).get('erro'))"; exit 1; }
done
[ "$st" = "pronto" ] || { echo "tempo esgotado"; exit 1; }
python3 -c "
import json
for r in json.load(open('openverse/out/$S/resultados.json')): print(r['arquivo'], r['duracao_s'],'s |', r['licenca'], '|', r['credito'])"
