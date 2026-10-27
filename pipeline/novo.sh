#!/usr/bin/env bash
# Cria uma nova produção a partir do template:  pipeline/novo.sh <slug> [template]
#   template padrão = pipeline/template (@mindloop_u); perfil cristão = template_cristao
set -e
cd "$(dirname "$0")/.."
S="$1"; [ -z "$S" ] && { echo "uso: pipeline/novo.sh <slug>"; exit 1; }
D=producoes/$S; [ -e "$D" ] && { echo "já existe: $D"; exit 1; }
TPL="pipeline/${2:-template}"; [ -d "$TPL" ] || { echo "template não existe: $TPL"; exit 1; }
cp -r "$TPL" "$D"; mkdir -p "$D/build"
ln -s ../../pipeline/models "$D/models"
echo "criado $D  ->  edite $D/narration/script.json e $D/src/anim.js"
