#!/usr/bin/env python3
"""Roda no GitHub Actions: para cada yt/jobs/<id>.json com status "pendente", envia o vídeo ao YouTube
(Data API v3, upload resumable) e grava status "postado" + video_id (ou "erro")."""
import json, os, sys, urllib.request, urllib.parse, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEC = os.environ
CID, CSEC = SEC.get("YT_CLIENT_ID", ""), SEC.get("YT_CLIENT_SECRET", "")

def refresh_token(canal):
    # canal "" ou "mindloop" -> YT_REFRESH_TOKEN; outro canal -> YT_REFRESH_TOKEN_<CANAL>
    nome = "YT_REFRESH_TOKEN" if canal in ("", "mindloop") else "YT_REFRESH_TOKEN_" + canal.upper()
    return nome, SEC.get(nome, "")

def token(rtok):
    data = urllib.parse.urlencode({"client_id": CID, "client_secret": CSEC, "refresh_token": rtok, "grant_type": "refresh_token"}).encode()
    with urllib.request.urlopen(urllib.request.Request("https://oauth2.googleapis.com/token", data=data), timeout=60) as r:
        return json.load(r)["access_token"]

def upload(job, at):
    path = ROOT / job["video"]
    size = path.stat().st_size
    meta = {"snippet": {"title": job["title"][:100], "description": job.get("description", "")[:4900],
                        "tags": job.get("tags", []), "categoryId": str(job.get("categoryId", 27)), "defaultLanguage": "pt-BR",
                        "defaultAudioLanguage": "pt-BR"},
            "status": {"privacyStatus": job.get("privacy", "public"), "selfDeclaredMadeForKids": False,
                       "containsSyntheticMedia": True}}
    q = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status"
    req = urllib.request.Request(q, data=json.dumps(meta).encode(), method="POST", headers={
        "Authorization": "Bearer " + at, "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(size)})
    with urllib.request.urlopen(req, timeout=60) as r:
        loc = r.headers["Location"]
    put = urllib.request.Request(loc, data=path.read_bytes(), method="PUT",
                                 headers={"Authorization": "Bearer " + at, "Content-Type": "video/mp4"})
    with urllib.request.urlopen(put, timeout=900) as r:
        return json.load(r)

for jf in sorted((ROOT / "yt/jobs").glob("*.json")):
    job = json.loads(jf.read_text())
    if job.get("status") != "pendente": continue
    try:
        nome, rtok = refresh_token(job.get("canal", ""))
        if not (CID and CSEC and rtok): raise RuntimeError(f"faltam segredos YT_CLIENT_ID / YT_CLIENT_SECRET / {nome}")
        at = token(rtok)
        if job.get("acao") == "checar":
            job.update(status="ok", token="válido")
            try:
                req = urllib.request.Request("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", headers={"Authorization": "Bearer " + at})
                with urllib.request.urlopen(req, timeout=60) as r: items = json.load(r).get("items", [])
                if items: job["canal_nome"] = items[0]["snippet"]["title"]
            except urllib.error.HTTPError as e:
                job["canal_nome"] = f"(não deu para ler o nome: HTTP {e.code})"
            print(jf.stem, "checagem ok", job.get("canal_nome"))
            jf.write_text(json.dumps(job, ensure_ascii=False, indent=2)); continue
        # trava: um canal que não é o da Mindloop nunca pode postar no YouTube da Mindloop
        if job.get("canal", "") not in ("", "mindloop"):
            req = urllib.request.Request("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", headers={"Authorization": "Bearer " + at})
            try:
                with urllib.request.urlopen(req, timeout=60) as r: items = json.load(r).get("items", [])
            except urllib.error.HTTPError as e:
                if e.code != 403: raise
                items = []  # token só com permissão de upload (sem leitura): não dá para conferir o nome; segue
                print(jf.stem, "aviso: token sem permissão de leitura, nome do canal não conferido")
            nome_canal = items[0]["snippet"]["title"] if items else ""
            if "mindloop" in nome_canal.lower():
                raise RuntimeError(f"token do canal {job.get('canal')} aponta para '{nome_canal}' (Mindloop). Gere o refresh token de novo escolhendo o canal certo.")
        res = upload(job, at)
        if job.get("thumb"):  # capa personalizada (vídeo longo); se falhar (canal sem verificação, etc.) não derruba o post
            try:
                img = (ROOT / job["thumb"]).read_bytes()
                req = urllib.request.Request("https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=" + res["id"], data=img, method="POST",
                                             headers={"Authorization": "Bearer " + at, "Content-Type": "image/jpeg"})
                with urllib.request.urlopen(req, timeout=120) as r: r.read()
                job["thumb_status"] = "ok"
            except urllib.error.HTTPError as e:
                job["thumb_status"] = f"erro HTTP {e.code}: {e.read().decode(errors='ignore')[:300]}"
            except Exception as e:
                job["thumb_status"] = f"erro: {str(e)[:300]}"
        job.update(status="postado", video_id=res["id"], url=("https://youtube.com/watch?v=" if job.get("longo") else "https://youtube.com/shorts/") + res["id"],
                   privacidade=res.get("status", {}).get("privacyStatus"), canal_nome=res.get("snippet", {}).get("channelTitle"), canal_id=res.get("snippet", {}).get("channelId"), upload=res.get("status", {}).get("uploadStatus"))
        print(jf.stem, "ok", res["id"], job["privacidade"])
    except urllib.error.HTTPError as e:
        job.update(status="erro", erro=f"HTTP {e.code}: {e.read().decode(errors='ignore')[:500]}")
        print("ERRO", jf.stem, job["erro"], file=sys.stderr)
    except Exception as e:
        job.update(status="erro", erro=str(e)[:500]); print("ERRO", jf.stem, e, file=sys.stderr)
    jf.write_text(json.dumps(job, ensure_ascii=False, indent=2))
