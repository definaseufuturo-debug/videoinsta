#!/usr/bin/env bash
# Assuntos mais buscados no Brasil agora (Google Trends) + manchete ligada a cada um.
# Busca via GitHub Actions (workflow tse-fetch), porque o ambiente não acessa o Google direto.
set -e
cd "$(dirname "$0")/.."
git pull -q --rebase origin main
printf '{"baixar": [{"url": "https://trends.google.com/trending/rss?geo=BR", "bruto": true, "saida": "trends-br.xml"}], "sondar": [], "pedido_em": "%s"}\n' "$(date -u +%FT%T)" > tse/pedido.json
rm -f tse/sonda.json
git add tse/ && git -c user.name="bemyveus-prog" -c user.email="bemyveus@gmail.com" commit -q -m "trends: pedido" -m "Co-Authored-By: Claude <noreply@anthropic.com>" && git push -q origin HEAD:main
for i in $(seq 1 40); do sleep 8; git pull -q --rebase origin main; [ -f tse/sonda.json ] && break; done
python3 - <<'PY'
import re
s = open('tse/dados/trends-br.xml', encoding='utf-8').read()
for it in re.findall(r'<item>(.*?)</item>', s, re.S):
    t = re.search(r'<title>(.*?)</title>', it).group(1); tr = re.search(r'<ht:approx_traffic>(.*?)</ht:approx_traffic>', it)
    news = re.findall(r'<ht:news_item_title>(.*?)</ht:news_item_title>', it); urls = re.findall(r'<ht:news_item_url>(.*?)</ht:news_item_url>', it)
    print(f"- {t} ({tr.group(1) if tr else '?'}) :: {news[0] if news else ''} :: {urls[0] if urls else ''}")
PY
