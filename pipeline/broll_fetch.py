#!/usr/bin/env python3
"""Roda no GitHub Actions: baixa clipes de vídeo (b-roll) para a moldura.
Para cada broll/jobs/<slug>.json com status "pendente": {"q": "bird nest", "n": 3, "fonte": "pexels"|"commons"}
- pexels (padrão quando existe o segredo PEXELS_API_KEY): vídeos livres para uso comercial, sem crédito obrigatório;
- commons (Wikimedia Commons, sem chave): só licenças livres; o crédito vai em resultados.json.
Cada clipe sai em broll/out/<slug>/NN.mp4 (até 15 s, 1280 px de largura, sem áudio) + resultados.json."""
import json, os, subprocess, tempfile, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "videoinsta-broll/1.0 (github actions)"}
PEXELS = os.environ.get("PEXELS_API_KEY", "")


def get(url, headers=None, timeout=120):
    for i in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={**UA, **(headers or {})}), timeout=timeout) as r:
                return r.read()
        except Exception:
            if i == 2:
                raise
            time.sleep(5 * (i + 1))


def preparar(bruto, destino, seg=15):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", bruto, "-t", str(seg), "-an",
                    "-vf", "scale=1280:-2:flags=lanczos,fps=30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                    "-pix_fmt", "yuv420p", str(destino)], check=True)


def pexels(q, n):
    url = "https://api.pexels.com/videos/search?" + urllib.parse.urlencode({"query": q, "per_page": 15, "orientation": "landscape", "size": "medium"})
    vids = json.loads(get(url, {"Authorization": PEXELS}))["videos"]
    for v in vids:
        if v.get("duration", 0) < 5:
            continue
        arqs = sorted([f for f in v["video_files"] if f.get("file_type") == "video/mp4" and (f.get("width") or 0) >= 1280],
                      key=lambda f: f["width"])
        if not arqs:
            continue
        yield arqs[0]["link"], {"titulo": v.get("url"), "autor": v.get("user", {}).get("name"), "licenca": "Pexels",
                                "pagina": v.get("url"), "credito": ""}


def commons(q, n):
    p = {"action": "query", "format": "json", "generator": "search", "gsrsearch": f"{q} filetype:video", "gsrnamespace": 6,
         "gsrlimit": 20, "prop": "imageinfo", "iiprop": "url|extmetadata|size"}
    pages = json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p))).get("query", {}).get("pages", {})
    for pg in sorted(pages.values(), key=lambda x: x.get("index", 99)):
        ii = (pg.get("imageinfo") or [{}])[0]
        md = ii.get("extmetadata", {})
        lic = md.get("LicenseShortName", {}).get("value", "")
        if not ii.get("url") or not any(k in lic.upper() for k in ("CC0", "PUBLIC DOMAIN", "CC BY")) or "NC" in lic.upper() or "ND" in lic.upper():
            continue
        if (ii.get("width") or 0) < 640:
            continue
        autor = md.get("Artist", {}).get("value", "")
        autor = __import__("re").sub("<[^>]+>", "", autor).strip()
        yield ii["url"], {"titulo": pg.get("title"), "autor": autor, "licenca": lic, "pagina": ii.get("descriptionurl"),
                          "credito": "" if ("CC0" in lic.upper() or "PUBLIC" in lic.upper()) else f"Vídeo: {autor} ({lic}), Wikimedia Commons"}


for jf in sorted((ROOT / "broll/jobs").glob("*.json")):
    job = json.loads(jf.read_text())
    if job.get("status") != "pendente":
        continue
    out = ROOT / "broll/out" / jf.stem
    out.mkdir(parents=True, exist_ok=True)
    fonte = job.get("fonte") or ("pexels" if PEXELS else "commons")
    if fonte == "pexels" and not PEXELS:
        fonte = "commons"
    saida = []
    try:
        for link, info in (pexels if fonte == "pexels" else commons)(job["q"], job.get("n", 3)):
            if len(saida) >= job.get("n", 3):
                break
            fn = out / f"{len(saida) + 1:02d}.mp4"
            with tempfile.TemporaryDirectory() as tmp:
                bruto = os.path.join(tmp, "bruto")
                try:
                    Path(bruto).write_bytes(get(link, timeout=300))
                    preparar(bruto, fn)
                except Exception as e:
                    print("falhou", link, e)
                    continue
            saida.append({"arquivo": fn.name, "fonte": fonte, **info})
            print("ok", fn.name, info["titulo"])
        job["status"] = "pronto" if saida else "erro"
        if not saida:
            job["erro"] = f"nenhum vídeo encontrado em {fonte} para '{job['q']}'"
    except Exception as e:
        job["status"], job["erro"] = "erro", str(e)[:300]
    job["fonte_usada"] = fonte
    (out / "resultados.json").write_text(json.dumps(saida, ensure_ascii=False, indent=1))
    jf.write_text(json.dumps(job, ensure_ascii=False, indent=1))
