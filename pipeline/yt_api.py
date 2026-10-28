#!/usr/bin/env python3
"""Roda no GitHub Actions: para cada yt/jobs/<id>.json com status "pendente", envia o vídeo ao YouTube
(Data API v3, upload resumable) e grava status "postado" + video_id (ou "erro")."""
import json, os, sys, urllib.request, urllib.parse, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEC = json.loads(os.environ.get("ALL_SECRETS") or "{}")
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
        res = upload(job, at)
        job.update(status="postado", video_id=res["id"], url="https://youtube.com/shorts/" + res["id"],
                   privacidade=res.get("status", {}).get("privacyStatus"), canal_nome=res.get("snippet", {}).get("channelTitle"), canal_id=res.get("snippet", {}).get("channelId"), upload=res.get("status", {}).get("uploadStatus"))
        print(jf.stem, "ok", res["id"], job["privacidade"])
    except urllib.error.HTTPError as e:
        job.update(status="erro", erro=f"HTTP {e.code}: {e.read().decode(errors='ignore')[:500]}")
        print("ERRO", jf.stem, job["erro"], file=sys.stderr)
    except Exception as e:
        job.update(status="erro", erro=str(e)[:500]); print("ERRO", jf.stem, e, file=sys.stderr)
    jf.write_text(json.dumps(job, ensure_ascii=False, indent=2))
