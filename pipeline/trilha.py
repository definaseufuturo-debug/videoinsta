#!/usr/bin/env python3
"""Trilha de fundo por clima, sem repetir: escolhe uma música do banco trilhas/ e mixa no vídeo pronto.

  python3 pipeline/trilha.py mixar <video.mp4> <grupo>/<clima> <slug> <saida.mp4> [--gain G] [--duck] [--substituir] [--arquivo A]
      Escolhe a trilha (rodízio), corta na duração do vídeo, faz fade e mistura por baixo do áudio que o vídeo já tem.
      --duck: abaixa a música enquanto alguém fala (use em vídeo NARRADO). Bonequinhos sem narração: sem --duck.
      --substituir: troca o áudio do vídeo pela trilha. --arquivo: força uma trilha (caminho relativo a trilhas/).
      Imprime o crédito (linha CREDITO:) quando a licença for BY; ele vai na legenda e na descrição do YouTube.
  python3 pipeline/trilha.py escolher <grupo>/<clima> <slug>      só escolhe e registra (mostra JSON)
  python3 pipeline/trilha.py listar [<grupo>/<clima>]             banco e quantas vezes cada uma foi usada
  python3 pipeline/trilha.py descartar <arquivo>                  tira uma trilha ruim do banco (não volta mais)
  python3 pipeline/trilha.py pedir [todos|<grupo>/<clima>] [n]    pede ao GitHub Actions para completar o banco

Rodízio: a mesma trilha não volta antes de passarem as outras do clima, e nunca se repete nos últimos 15 vídeos
(de qualquer perfil). O registro fica em trilhas/usados.json."""
import argparse, json, random, subprocess, sys, time
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PASTA = ROOT / "trilhas"
BANCO = PASTA / "banco.json"
USADOS = PASTA / "usados.json"
CLIMA = json.loads((ROOT / "pipeline/clima.json").read_text())
JANELA = 15


def ler(p, padrao):
    return json.loads(p.read_text()) if p.exists() else padrao


def gain_do(chave):
    g, c = chave.split("/")
    return CLIMA.get(g, {}).get(c, {}).get("gain", 0.4)


def escolher(chave, slug, forcar=None):
    banco = ler(BANCO, {})
    lista = banco.get(chave, [])
    if forcar:
        t = next((x for x in sum((v for k, v in banco.items() if not k.startswith("_")), []) if x["arquivo"] == forcar), None)
        if not t:
            sys.exit(f"{forcar} não está no banco")
    else:
        if not lista:
            sys.exit(f"SEM_TRILHA: o clima {chave} ainda não tem trilhas no banco. Rode: python3 pipeline/trilha.py pedir {chave}")
        usados = ler(USADOS, [])
        recentes = [u["arquivo"] for u in usados[-JANELA:]]
        ultima_vez = {u["arquivo"]: i for i, u in enumerate(usados)}
        livres = [t for t in lista if t["arquivo"] not in recentes] or lista
        # menos usada recentemente primeiro; empate (nunca usada) no sorteio
        livres.sort(key=lambda t: (ultima_vez.get(t["arquivo"], -1), random.random()))
        t = livres[0]
    usados = ler(USADOS, [])
    usados.append({"data": datetime.now().strftime("%Y-%m-%d %H:%M"), "slug": slug, "clima": chave, "arquivo": t["arquivo"]})
    USADOS.write_text(json.dumps(usados[-300:], ensure_ascii=False, indent=1))
    return t


def duracao(arq):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(arq)]).strip())


def tem_audio(arq):
    return bool(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", str(arq)],
                               capture_output=True, text=True).stdout.strip())


def mixar(o):
    t = escolher(o.clima, o.slug, o.arquivo)
    trilha = PASTA / t["arquivo"]
    if not trilha.exists():
        sys.exit(f"arquivo {trilha} sumiu; rode 'git pull' ou 'trilha.py descartar {t['arquivo']}'")
    dur = duracao(o.video)
    gain = o.gain if o.gain is not None else gain_do(o.clima)
    fo = max(0.0, dur - 2.0)
    m = (f"[1:a]aresample=48000,atrim=duration={dur:.3f},asetpts=PTS-STARTPTS,volume={gain},"
         f"afade=t=in:d=0.6,afade=t=out:st={fo:.3f}:d=2[m]")
    if o.substituir or not tem_audio(o.video):
        fc = m + ";[m]anull[pre]"
    elif o.duck:
        # a voz (áudio do vídeo) comprime a música: ela abaixa ~8 dB quando alguém fala
        fc = (m + ";[0:a]aresample=48000,asplit=2[v][sc];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450[md];"
              "[v][md]amix=inputs=2:duration=first:normalize=0[pre]")
    else:
        fc = m + ";[0:a]aresample=48000[v];[v][m]amix=inputs=2:duration=first:normalize=0[pre]"
    # volume final no padrão de Reels/Shorts (-14 LUFS, pico -1,5 dB)
    fc += ";[pre]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]"
    mapa = "[a]"
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", str(o.video), "-stream_loop", "-1", "-i", str(trilha),
                           "-filter_complex", fc, "-map", "0:v", "-map", mapa, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                           "-t", f"{dur:.3f}", str(o.saida)])
    print(f"ok {o.saida}")
    print(f"TRILHA: {t['arquivo']} | \"{t['titulo']}\" de {t['autor']} | {t['licenca']} | gain {gain}")
    if t.get("credito"):
        print(f"CREDITO: 🎵 {t['credito']}")


def listar(chave=None):
    banco = ler(BANCO, {})
    usos = {}
    for u in ler(USADOS, []):
        usos[u["arquivo"]] = usos.get(u["arquivo"], 0) + 1
    for k, lista in sorted(banco.items()):
        if k.startswith("_") or (chave and k != chave):
            continue
        print(f"{k} ({len(lista)} trilhas, gain {gain_do(k)})")
        for t in lista:
            print(f"  {t['arquivo']}  {t['duracao_s']}s  usada {usos.get(t['arquivo'], 0)}x  | {t['titulo']} ({t['autor']}, {t['licenca']})")
    vazios = [f"{g}/{c}" for g, cs in CLIMA.items() if not g.startswith("_") for c in cs if not banco.get(f"{g}/{c}")]
    if vazios and not chave:
        print("sem trilhas ainda:", ", ".join(vazios))


def descartar(arq):
    banco = ler(BANCO, {})
    for k, lista in banco.items():
        if k.startswith("_"):
            continue
        for t in lista:
            if t["arquivo"] == arq:
                lista.remove(t)
                banco.setdefault("_descartados", []).append(t["id"])
                (PASTA / arq).unlink(missing_ok=True)
                BANCO.write_text(json.dumps(banco, ensure_ascii=False, indent=1))
                print(f"descartada {arq}; para repor: python3 pipeline/trilha.py pedir {k}")
                return
    sys.exit(f"{arq} não está no banco")


def git(*a):
    subprocess.check_call(["git", "-C", str(ROOT), *a])


def pedir(alvo, n):
    (PASTA / "pedido.txt").write_text(f"# {datetime.now():%Y-%m-%d %H:%M}\n{alvo} {n}\n")
    git("add", "trilhas/")
    git("-c", "user.name=bemyveus-prog", "-c", "user.email=bemyveus@gmail.com", "commit", "-q", "-m", f"trilhas: pedido {alvo} {n}",
        "-m", "Co-Authored-By: Claude <noreply@anthropic.com>")
    git("pull", "-q", "--rebase", "origin", "main")
    git("push", "-q", "origin", "HEAD:main")
    antes = (PASTA / "relatorio.txt").read_text() if (PASTA / "relatorio.txt").exists() else ""
    print("pedido enviado; aguardando o GitHub Actions (pode levar alguns minutos)…")
    for _ in range(90):
        time.sleep(20)
        git("pull", "-q", "--rebase", "origin", "main")
        rel = (PASTA / "relatorio.txt").read_text() if (PASTA / "relatorio.txt").exists() else ""
        if rel and rel != antes:
            print(rel)
            return
    sys.exit("tempo esgotado; veja a aba Actions do repositório (workflow trilhas)")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    s = p.add_subparsers(dest="cmd", required=True)
    m = s.add_parser("mixar")
    m.add_argument("video"); m.add_argument("clima"); m.add_argument("slug"); m.add_argument("saida")
    m.add_argument("--gain", type=float); m.add_argument("--duck", action="store_true")
    m.add_argument("--substituir", action="store_true"); m.add_argument("--arquivo")
    e = s.add_parser("escolher"); e.add_argument("clima"); e.add_argument("slug")
    l = s.add_parser("listar"); l.add_argument("clima", nargs="?")
    d = s.add_parser("descartar"); d.add_argument("arquivo")
    pe = s.add_parser("pedir"); pe.add_argument("alvo", nargs="?", default="todos"); pe.add_argument("n", nargs="?", type=int, default=5)
    o = p.parse_args()
    if o.cmd == "mixar":
        mixar(o)
    elif o.cmd == "escolher":
        print(json.dumps(escolher(o.clima, o.slug), ensure_ascii=False, indent=1))
    elif o.cmd == "listar":
        listar(o.clima)
    elif o.cmd == "descartar":
        descartar(o.arquivo)
    else:
        pedir(o.alvo, o.n)


if __name__ == "__main__":
    main()
