#!/usr/bin/env python3
"""Roda no GitHub Actions: para cada openverse/jobs/<slug>.json com status "pendente", busca áudio no
Openverse (só licenças que podem ir em conta comercial), baixa os melhores resultados para
openverse/out/<slug>/ e grava resultados.json com autor, licença e a linha de crédito.
Segredos opcionais: OPENVERSE_CLIENT_ID e OPENVERSE_CLIENT_SECRET (sem eles usa o limite anônimo)."""
import json, os, sys, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.openverse.org/v1"
UA = {"User-Agent": "videoinsta-openverse/1.0"}

def token():
    cid, sec = os.environ.get("OPENVERSE_CLIENT_ID", ""), os.environ.get("OPENVERSE_CLIENT_SECRET", "")
    if not (cid and sec): return None
    data = urllib.parse.urlencode({"grant_type": "client_credentials", "client_id": cid, "client_secret": sec}).encode()
    with urllib.request.urlopen(urllib.request.Request(API + "/auth_tokens/token/", data=data, headers=UA), timeout=30) as r:
        return json.load(r)["access_token"]

def get(url, tok):
    h = dict(UA); 
    if tok: h["Authorization"] = "Bearer " + tok
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=90) as r: return r.read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 502, 503, 504) or i == 3: raise
            time.sleep(8 * (i + 1))

tok = None
try: tok = token()
except Exception as e: print("aviso: sem token, usando limite anônimo:", e, file=sys.stderr)

for jf in sorted((ROOT / "openverse/jobs").glob("*.json")):
    job = json.loads(jf.read_text())
    if job.get("status") != "pendente": continue
    out = ROOT / "openverse/out" / jf.stem; out.mkdir(parents=True, exist_ok=True)
    try:
        q = {"q": job["q"], "license": job.get("license", "cc0,pdm,by"), "category": job.get("category", "music"),
             "page_size": 20, "mature": "false"}
        if job.get("duration"): q["duration"] = job["duration"]   # short | medium | long
        resp = json.loads(get(API + "/audio/?" + urllib.parse.urlencode(q), tok))
        res = resp["results"]
        job["diag"] = {"total": resp.get("result_count"), "pagina": len(res), "duracoes_s": [round((r.get("duration") or 0) / 1000) for r in res],
                       "sem_url": sum(1 for r in res if not r.get("url"))}
        mn, mx = job.get("min_s", 0) * 1000, job.get("max_s", 10**6) * 1000
        res = [r for r in res if r.get("url") and mn <= (r.get("duration") or 0) <= mx] if (job.get("min_s") or job.get("max_s")) else [r for r in res if r.get("url")]
        saida = []
        for r in res[: job.get("n", 5)]:
            ext = (r.get("filetype") or "mp3").lower()
            fn = f"{len(saida)+1:02d}-{r['id'][:8]}.{ext}"
            try: (out / fn).write_bytes(get(r["url"], None))
            except Exception as e: print("falhou o download", r["url"], e, file=sys.stderr); continue
            lic = f"{r.get('license','').upper()} {r.get('license_version','')}".strip()
            saida.append({"arquivo": fn, "titulo": r.get("title"), "autor": r.get("creator"), "licenca": lic,
                          "fonte": r.get("source"), "duracao_s": round((r.get("duration") or 0) / 1000, 1),
                          "pagina": r.get("foreign_landing_url"),
                          "credito": r.get("attribution") or f"\"{r.get('title')}\" de {r.get('creator')} ({lic})"})
        (out / "resultados.json").write_text(json.dumps(saida, ensure_ascii=False, indent=2))
        job["status"] = "pronto" if saida else "erro"
        if not saida: job["erro"] = "nenhum áudio encontrado com esses filtros"
    except Exception as e:
        job["status"], job["erro"] = "erro", str(e)[:400]; print("ERRO", jf.stem, e, file=sys.stderr)
    jf.write_text(json.dumps(job, ensure_ascii=False, indent=2))
