#!/usr/bin/env python3
"""Roda no GitHub Actions. Para cada ig/jobs/*.json com status "pendente":
  {"conta": "cristao", "tipo": "video"|"carrossel"|"teste", "video_url": ..., "image_urls": [...], "caption": ..., "share_to_feed": true, "thumb_offset": 3000}
Usa o token do segredo IG_TOKEN_<CONTA>. "teste" só confere o token e devolve usuário e limite de publicação.
Grava status "postado" + media_id, ou "erro" + mensagem, no próprio job."""
import json, os, time, urllib.request, urllib.parse, urllib.error
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
IG_API = "https://graph.instagram.com/v26.0"
FB_API = "https://graph.facebook.com/v26.0"  # token do login unificado/Facebook (precisa de ig_id)
API = IG_API
IG_IDS = {"cristao": "17841451042007480"}

def call(method, path, token, **params):
    params["access_token"] = token
    data = urllib.parse.urlencode(params).encode()
    url = f"{API}/{path}" + ("" if method == "POST" else "?" + data.decode())
    req = urllib.request.Request(url, data=data if method == "POST" else None, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as r: return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode(errors='ignore')[:400]}")

def wait(cid, token):
    for _ in range(40):  # até ~10 min
        st = call("GET", cid, token, fields="status_code,status").get("status_code")
        if st == "FINISHED": return
        if st in ("ERROR", "EXPIRED"): raise RuntimeError(f"container {st}: {call('GET', cid, token, fields='status')}")
        time.sleep(15)
    raise RuntimeError("container não ficou pronto a tempo")

for jf in sorted((ROOT / "ig/jobs").glob("*.json")):
    job = json.loads(jf.read_text())
    if job.get("status") != "pendente": continue
    token = os.environ.get("IG_TOKEN_" + job["conta"].upper(), "")
    if job["tipo"] == "diag":
        d = {"tamanho_token": len(token), "inicio": token[:4]}
        for nome, host, path, f in [("ig_me", IG_API, "me", "user_id,username"), ("fb_me", FB_API, "me", "id,name"),
                                    ("fb_contas", FB_API, "me/accounts", "name,instagram_business_account{id,username}"),
                                    ("fb_perms", FB_API, "me/permissions", "permission,status"),
                                    ("fb_biz", FB_API, "me/businesses", "id,name,owned_instagram_accounts{id,username},instagram_accounts{id,username}"),
                                    ("fb_ig", FB_API, IG_IDS.get(job["conta"], "x"), "id,username")]:
            API = host
            try: d[nome] = call("GET", path, token, fields=f)
            except Exception as e: d[nome] = str(e)[:300]
        job["diag"], job["status"] = d, "ok"; job["processado_em"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        jf.write_text(json.dumps(job, ensure_ascii=False, indent=2)); print(jf.name, "diag"); continue
    try:
        if not token: raise RuntimeError(f"segredo IG_TOKEN_{job['conta'].upper()} não configurado")
        API = IG_API
        try:
            me = call("GET", "me", token, fields="user_id,username"); uid = me["user_id"]
        except RuntimeError as e1:
            API = FB_API; uid = job.get("ig_id") or IG_IDS.get(job["conta"])
            if not uid: raise RuntimeError(f"token não serve no graph.instagram ({e1}) e não há ig_id")
            me = call("GET", uid, token, fields="id,username")
        job["usuario"] = me.get("username"); job["host"] = API.split("/")[2]
        if job["tipo"] == "teste":
            job["limite"] = call("GET", f"{uid}/content_publishing_limit", token, fields="quota_usage,config")
        elif job["tipo"] == "video":
            p = {"media_type": "REELS", "video_url": job["video_url"], "caption": job.get("caption", ""), "share_to_feed": str(job.get("share_to_feed", True)).lower()}
            if job.get("thumb_offset") is not None: p["thumb_offset"] = job["thumb_offset"]
            cid = call("POST", f"{uid}/media", token, **p)["id"]; wait(cid, token)
            job["media_id"] = call("POST", f"{uid}/media_publish", token, creation_id=cid)["id"]
        elif job["tipo"] == "carrossel":
            kids = [call("POST", f"{uid}/media", token, image_url=u, is_carousel_item="true")["id"] for u in job["image_urls"]]
            for k in kids: wait(k, token)
            cid = call("POST", f"{uid}/media", token, media_type="CAROUSEL", children=",".join(kids), caption=job.get("caption", ""))["id"]; wait(cid, token)
            job["media_id"] = call("POST", f"{uid}/media_publish", token, creation_id=cid)["id"]
        job["status"] = "postado" if job["tipo"] != "teste" else "ok"
    except Exception as e:
        job["status"], job["erro"] = "erro", str(e)[:600]
    job["processado_em"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    jf.write_text(json.dumps(job, ensure_ascii=False, indent=2)); print(jf.name, job["status"], job.get("media_id") or job.get("erro", ""))
