#!/usr/bin/env python3
"""Roda no GitHub Actions (o ambiente do Claude não alcança o Openverse).
Monta o banco de trilhas por clima: para cada <grupo>/<clima> de pipeline/clima.json, busca músicas no Openverse
(só cc0, pdm e by, que podem ir em conta comercial), baixa, corta o silêncio do começo, guarda até 62 s em mp3
normalizado e registra autor, licença e crédito em trilhas/banco.json.

Pedido: trilhas/pedido.txt, uma linha por clima: "<grupo>/<clima> [n]" ou "todos [n]" (n = quantas trilhas
cada clima deve ter; padrão 5). Climas que já têm n trilhas são pulados, então pedir de novo só completa o que falta.
Segredos opcionais: OPENVERSE_CLIENT_ID e OPENVERSE_CLIENT_SECRET (sem eles: 20 buscas/min e 200/dia)."""
import json, os, random, subprocess, sys, tempfile, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLIMA = json.loads((ROOT / "pipeline/clima.json").read_text())
PASTA = ROOT / "trilhas"
BANCO = PASTA / "banco.json"
API = "https://api.openverse.org/v1"
UA = {"User-Agent": "videoinsta-trilhas/1.0"}
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
SEG = 62          # segundos guardados de cada trilha (cobre vídeos de até 60 s)
MIN_S = 35        # trilha mais curta aceita
POR_AUTOR = 2     # no máximo 2 trilhas do mesmo autor no mesmo clima (variedade)
LICENCAS = {"cc0", "pdm", "by"}
EVITAR = ("sound effect", "sfx", "ringtone", "jingle", "intro ", "outro", "test", "demo", "voice", "vocal", "speech", "podcast")

_ultima = [0.0]


def token():
    cid, sec = os.environ.get("OPENVERSE_CLIENT_ID", ""), os.environ.get("OPENVERSE_CLIENT_SECRET", "")
    if not (cid and sec):
        return None
    data = urllib.parse.urlencode({"grant_type": "client_credentials", "client_id": cid, "client_secret": sec}).encode()
    with urllib.request.urlopen(urllib.request.Request(API + "/auth_tokens/token/", data=data, headers=UA), timeout=30) as r:
        return json.load(r)["access_token"]


def get(url, tok=None, timeout=90):
    h = dict(UA)
    if tok:
        h["Authorization"] = "Bearer " + tok
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503, 504) or i == 3:
                raise
            time.sleep(10 * (i + 1))
        except (TimeoutError, OSError):
            if i == 3:
                raise
            time.sleep(10)


def buscar(q, pagina, tok):
    espera = (1.2 if tok else 3.3) - (time.time() - _ultima[0])
    if espera > 0:
        time.sleep(espera)
    _ultima[0] = time.time()
    p = {"q": q, "license": "cc0,pdm,by", "category": "music", "page_size": 20, "page": pagina, "mature": "false"}
    return json.loads(get(API + "/audio/?" + urllib.parse.urlencode(p), tok)).get("results", [])


def dur_s(arq):
    out = subprocess.run([FFMPEG, "-i", arq], capture_output=True, text=True).stderr
    try:
        h, m, s = out.split("Duration: ")[1].split(",")[0].split(":")
        return int(h) * 3600 + int(m) * 60 + float(s)
    except Exception:
        return 0


def inicio_som(arq):
    """Primeiro instante com som de verdade (pula silêncio e chiado do começo)."""
    out = subprocess.run([FFMPEG, "-i", arq, "-t", "20", "-af", "silencedetect=noise=-40dB:d=0.3", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    comeca_mudo = False
    for linha in out.splitlines():
        if "silence_start:" in linha and not comeca_mudo:
            if abs(float(linha.split("silence_start:")[1].split()[0])) > 0.05:
                return 0.0          # o primeiro silêncio não está no começo
            comeca_mudo = True
        elif "silence_end:" in linha and comeca_mudo:
            return float(linha.split("silence_end:")[1].split("|")[0])
    return 0.0


def volume_medio(arq):
    out = subprocess.run([FFMPEG, "-i", arq, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
    for linha in out.splitlines():
        if "mean_volume:" in linha:
            return float(linha.split("mean_volume:")[1].split("dB")[0])
    return -99


def preparar(bruto, destino):
    """Corta o silêncio inicial, guarda SEG s, normaliza (-20 LUFS) e faz fades. Devolve a duração final ou 0."""
    total = dur_s(bruto)
    if total < MIN_S:
        return 0
    ini = inicio_som(bruto)
    seg = min(SEG, total - ini)
    if seg < MIN_S - 3:
        return 0
    af = f"loudnorm=I=-20:TP=-2:LRA=11,afade=t=in:d=0.4,afade=t=out:st={max(0, seg - 2.5):.2f}:d=2.5"
    subprocess.run([FFMPEG, "-loglevel", "error", "-y", "-ss", f"{ini:.2f}", "-t", f"{seg:.2f}", "-i", bruto,
                    "-af", af, "-ac", "2", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "128k", str(destino)], check=True)
    if volume_medio(str(destino)) < -45:   # praticamente mudo
        destino.unlink(missing_ok=True)
        return 0
    return round(seg, 1)


def pedidos():
    arq = PASTA / "pedido.txt"
    linhas = [l.split("#")[0].strip() for l in arq.read_text().splitlines()] if arq.exists() else ["todos 5"]
    alvo = {}
    for l in filter(None, linhas):
        partes = l.split()
        n = int(partes[1]) if len(partes) > 1 else 5
        if partes[0] == "todos":
            for g, climas in CLIMA.items():
                if g.startswith("_"):
                    continue
                for c in climas:
                    alvo[f"{g}/{c}"] = n
        else:
            alvo[partes[0]] = n
    return alvo


def main():
    banco = json.loads(BANCO.read_text()) if BANCO.exists() else {}
    descartados = set(banco.get("_descartados", []))
    usados_global = {t["id"] for k, v in banco.items() if not k.startswith("_") for t in v}
    tok = None
    try:
        tok = token()
    except Exception as e:
        print("aviso: sem token, usando limite anônimo:", e, file=sys.stderr)
    rng = random.Random()
    relatorio = []
    for chave, n in pedidos().items():
        g, c = chave.split("/")
        if g not in CLIMA or c not in CLIMA[g]:
            relatorio.append(f"{chave}: não existe em clima.json")
            continue
        lista = banco.setdefault(chave, [])
        if len(lista) >= n:
            relatorio.append(f"{chave}: já tem {len(lista)}")
            continue
        pasta = PASTA / g / c
        pasta.mkdir(parents=True, exist_ok=True)
        autores = {}
        for t in lista:
            autores[t["autor"]] = autores.get(t["autor"], 0) + 1
        buscas = list(CLIMA[g][c]["q"])
        rng.shuffle(buscas)
        vistos = set()
        for q in buscas:
            if len(lista) >= n:
                break
            for pagina in (1, 2):
                if len(lista) >= n:
                    break
                try:
                    res = buscar(q, pagina, tok)
                except Exception as e:
                    print(f"  {chave}: busca '{q}' falhou ({e})", file=sys.stderr)
                    break
                rng.shuffle(res)   # não pegar sempre os primeiros
                for r in res:
                    if len(lista) >= n:
                        break
                    rid, titulo = r.get("id"), (r.get("title") or "").lower()
                    autor = r.get("creator") or "?"
                    if (not rid or rid in vistos or rid in usados_global or rid in descartados or not r.get("url")
                            or (r.get("license") or "").lower() not in LICENCAS
                            or (r.get("duration") or 0) < MIN_S * 1000
                            or any(p in titulo for p in EVITAR) or autores.get(autor, 0) >= POR_AUTOR):
                        continue
                    vistos.add(rid)
                    destino = pasta / f"{rid[:8]}.mp3"
                    with tempfile.TemporaryDirectory() as tmp:
                        bruto = os.path.join(tmp, "bruto." + (r.get("filetype") or "mp3"))
                        try:
                            Path(bruto).write_bytes(get(r["url"], None, 120))
                            seg = preparar(bruto, destino)
                        except Exception as e:
                            print(f"  {chave}: falhou '{r.get('title')}' ({e})", file=sys.stderr)
                            continue
                    if not seg:
                        continue
                    lic = f"{(r.get('license') or '').upper()} {r.get('license_version') or ''}".strip()
                    lista.append({"arquivo": f"{g}/{c}/{destino.name}", "id": rid, "titulo": r.get("title"), "autor": autor,
                                  "licenca": lic, "fonte": r.get("source"), "pagina": r.get("foreign_landing_url"),
                                  "duracao_s": seg, "busca": q,
                                  "credito": "" if lic.startswith(("CC0", "PDM")) else
                                  (r.get("attribution") or f"\"{r.get('title')}\" de {autor} ({lic})")})
                    usados_global.add(rid)
                    autores[autor] = autores.get(autor, 0) + 1
                    print(f"  {chave}: + {destino.name} '{r.get('title')}' ({autor}, {lic}, {seg}s)")
                    BANCO.write_text(json.dumps(banco, ensure_ascii=False, indent=1))
        relatorio.append(f"{chave}: {len(lista)}/{n}")
    BANCO.write_text(json.dumps(banco, ensure_ascii=False, indent=1))
    (PASTA / "relatorio.txt").write_text(time.strftime("%Y-%m-%d %H:%M UTC\n") + "\n".join(relatorio) + "\n")
    print("\n".join(relatorio))


if __name__ == "__main__":
    main()
