#!/usr/bin/env python3
"""Roda no GitHub Actions. Lê tse/pedido.json:
{"sondar": [urls...], "baixar": [{"url": ..., "filtro": {"coluna": "valor", ...}, "colunas": [...], "saida": "nome.csv"}]}
Sondar: grava status/tamanho em tse/sonda.json. Baixar: baixa zip/csv, filtra linhas (CSV ; latin-1 do TSE) e grava tse/dados/<saida>."""
import json, io, csv, zipfile, urllib.request, urllib.error
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
ped = json.loads((ROOT / "tse/pedido.json").read_text())
UA = {"User-Agent": "Mozilla/5.0"}
res = {}
for u in ped.get("sondar", []):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, method="HEAD", headers=UA), timeout=60)
        res[u] = {"status": r.status, "tamanho": r.headers.get("Content-Length"), "modificado": r.headers.get("Last-Modified")}
    except urllib.error.HTTPError as e: res[u] = {"status": e.code}
    except Exception as e: res[u] = {"erro": str(e)[:200]}
(ROOT / "tse/sonda.json").write_text(json.dumps(res, indent=2, ensure_ascii=False))
out = ROOT / "tse/dados"; out.mkdir(parents=True, exist_ok=True)
for it in ped.get("baixar", []):
    try:
        data = urllib.request.urlopen(urllib.request.Request(it["url"], headers=UA), timeout=600).read()
        if it.get("bruto"):
            (out / it["saida"]).write_bytes(data); res[it["url"]] = {"baixado": it["saida"], "bytes": len(data)}; continue
        files = []
        if it["url"].endswith(".zip"):
            z = zipfile.ZipFile(io.BytesIO(data))
            files = [z.read(n) for n in z.namelist() if n.lower().endswith(".csv") and (it.get("arquivo", "") in n)]
        else: files = [data]
        flt = it.get("filtro", {}); cols = it.get("colunas"); n = 0
        with open(out / it["saida"], "w", newline="", encoding="utf-8") as f:
            w = None
            for raw in files:
                rd = csv.DictReader(io.StringIO(raw.decode(it.get("encoding", "latin-1"))), delimiter=it.get("sep", ";"))
                for row in rd:
                    if all(str(row.get(k, "")).strip() == str(v) for k, v in flt.items()):
                        if w is None: w = csv.DictWriter(f, fieldnames=cols or rd.fieldnames, extrasaction="ignore"); w.writeheader()
                        w.writerow(row); n += 1
        res[it["url"]] = {"baixado": it["saida"], "linhas": n}
    except Exception as e: res[it["url"]] = {"erro_baixar": str(e)[:300]}
(ROOT / "tse/sonda.json").write_text(json.dumps(res, indent=2, ensure_ascii=False))
