#!/usr/bin/env bash
# Cria uma nova produção a partir do template:  pipeline/novo.sh <slug>
set -e
cd "$(dirname "$0")/.."
S="$1"; [ -z "$S" ] && { echo "uso: pipeline/novo.sh <slug>"; exit 1; }
D=producoes/$S; [ -e "$D" ] && { echo "já existe: $D"; exit 1; }
cp -r pipeline/template "$D"; mkdir -p "$D/build"
ln -s ../../pipeline/models "$D/models"
echo "criado $D  ->  edite $D/narration/script.json e $D/src/anim.js"
