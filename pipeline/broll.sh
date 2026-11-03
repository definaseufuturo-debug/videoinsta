#!/usr/bin/env bash
# Pede clipes de vídeo ao GitHub Actions e espera:  pipeline/broll.sh <slug> "<busca em inglês>" [n] [pexels|commons]
# Saída: broll/out/<slug>/01.mp4 … + resultados.json (autor, licença, crédito).
set -e
cd "$(dirname "$0")/.."
S="$1"; Q="$2"; N="${3:-3}"; F="${4:-}"
mkdir -p broll/jobs
python3 -c "import json,sys;j={'status':'pendente','q':sys.argv[1],'n':int(sys.argv[2])};j.update({'fonte':sys.argv[3]} if sys.argv[3] else {});json.dump(j,open('broll/jobs/'+sys.argv[4]+'.json','w'),ensure_ascii=False)" "$Q" "$N" "$F" "$S"
git add "broll/jobs/$S.json"
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -q -m "broll: pedido $S" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
git pull -q --rebase origin main && git push -q origin HEAD:main
echo "pedido enviado; aguardando o GitHub Actions…"
for i in $(seq 1 60); do
  sleep 10; git pull -q --rebase origin main
  st=$(python3 -c "import json;print(json.load(open('broll/jobs/$S.json'))['status'])")
  [ "$st" = "pronto" ] && break
  [ "$st" = "erro" ] && { python3 -c "import json;print('ERRO:',json.load(open('broll/jobs/$S.json')).get('erro'))"; exit 1; }
done
[ "$st" = "pronto" ] || { echo "tempo esgotado"; exit 1; }
python3 -c "
import json
for r in json.load(open('broll/out/$S/resultados.json')): print(r['arquivo'], '|', r['fonte'], '|', r['licenca'], '|', r['autor'], '|', r['titulo'])"
