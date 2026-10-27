#!/usr/bin/env python3
"""Fila de postagens da @mindloop_u (arquivo fila.json na raiz do repo).

  python3 pipeline/fila.py proximo                 -> JSON do vídeo a postar AGORA (ou {"nada": true})
  python3 pipeline/fila.py marcar <id> <media_id>  -> marca como postado
  python3 pipeline/fila.py falhou <id> "<erro>"     -> registra erro (o item continua pendente)
  python3 pipeline/fila.py adicionar <id> <arquivo.mp4 em videos/> <legenda.txt> <YYYY-MM-DDTHH:MM> [thumb_ms]
  python3 pipeline/fila.py adicionar_carrossel <id> <pasta em carrosseis/> <legenda.txt> <YYYY-MM-DDTHH:MM>
  python3 pipeline/fila.py proximo --so-carrossel   -> só carrosséis vencidos (nunca usa a reserva)
  python3 pipeline/fila.py para_reserva <id>       -> tira um agendado pendente do horário e põe no início da reserva
  python3 pipeline/fila.py status                  -> resumo

Regras do "proximo":
  1. item de "agendados" com status "pendente" e postar_em <= agora + 25 min (o mais antigo primeiro);
  2. se não houver, o primeiro item "disponivel" da "reserva" (vídeos prontos para cobrir um horário vazio).
Horários sempre em horário de Brasília (America/Sao_Paulo).
"""
import json, sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILA = ROOT / "fila.json"
RAWROOT = "https://raw.githubusercontent.com/definaseufuturo-debug/videoinsta/main/"
RAW = RAWROOT + "videos/"
BRT = timezone(timedelta(hours=-3))
now = lambda: datetime.now(BRT)

def load(): return json.loads(FILA.read_text())
def save(d): FILA.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
def find(d, i):
    for lst in ("agendados", "reserva"):
        for it in d[lst]:
            if it["id"] == i: return it
    sys.exit(f"id não encontrado: {i}")

def out(it, origem):
    if it.get("tipo") == "carrossel":
        print(json.dumps({"id": it["id"], "origem": origem, "tipo": "carrossel", "image_urls": [RAWROOT + x for x in it["imagens"]], "caption": it["legenda"],
                          "postar_em": it.get("postar_em")}, ensure_ascii=False, indent=2)); return
    print(json.dumps({"id": it["id"], "origem": origem, "tipo": "video", "video_url": RAW + it["video"], "caption": it["legenda"],
                      "thumb_offset": it.get("thumb_offset", 3000), "postar_em": it.get("postar_em")}, ensure_ascii=False, indent=2))

cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
d = load()
if cmd == "proximo":
    lim = now() + timedelta(minutes=25)
    so_car = "--so-carrossel" in sys.argv
    due = sorted([x for x in d["agendados"] if x["status"] == "pendente" and (x.get("tipo") == "carrossel") == so_car and datetime.fromisoformat(x["postar_em"]).replace(tzinfo=BRT) <= lim], key=lambda x: x["postar_em"])
    if due: out(due[0], "agendado")
    elif so_car: print(json.dumps({"nada": True}))
    else:
        res = [x for x in d["reserva"] if x["status"] == "disponivel"]
        if res: out(res[0], "reserva")
        else: print(json.dumps({"nada": True}))
elif cmd == "marcar":
    it = find(d, sys.argv[2]); it["status"] = "postado"; it["media_id"] = sys.argv[3]; it["postado_em"] = now().isoformat(timespec="minutes"); save(d); print("ok")
elif cmd == "falhou":
    it = find(d, sys.argv[2]); it.setdefault("erros", []).append(f"{now().isoformat(timespec='minutes')} {sys.argv[3]}"); save(d); print("registrado")
elif cmd == "adicionar":
    i, video, leg, quando = sys.argv[2:6]
    assert (ROOT / "videos" / video).exists(), "vídeo não está em videos/"
    datetime.fromisoformat(quando)
    item = {"id": i, "video": video, "legenda": Path(leg).read_text().strip(), "postar_em": quando, "status": "pendente"}
    if len(sys.argv) > 6: item["thumb_offset"] = int(sys.argv[6])
    d["agendados"].append(item); d["agendados"].sort(key=lambda x: x["postar_em"]); save(d); print("adicionado", i, quando)
elif cmd == "adicionar_carrossel":
    i, pasta, leg, quando = sys.argv[2:6]
    imgs = sorted(str(p.relative_to(ROOT)) for p in (ROOT / pasta).glob("*.jpg"))
    assert 2 <= len(imgs) <= 10, f"carrossel precisa de 2 a 10 .jpg (achei {len(imgs)})"
    datetime.fromisoformat(quando)
    d["agendados"].append({"id": i, "tipo": "carrossel", "imagens": imgs, "legenda": Path(leg).read_text().strip(), "postar_em": quando, "status": "pendente"})
    d["agendados"].sort(key=lambda x: x["postar_em"]); save(d); print("carrossel adicionado", i, quando, len(imgs), "cards")
elif cmd == "para_reserva":
    it = find(d, sys.argv[2]); assert it in d["agendados"] and it["status"] == "pendente", "precisa ser um agendado pendente"
    d["agendados"].remove(it); it.pop("postar_em", None); it["status"] = "disponivel"; d["reserva"].insert(0, it); save(d); print("na reserva:", it["id"])
else:
    p = [x for x in d["agendados"] if x["status"] == "pendente"]
    print(f"agora: {now():%Y-%m-%d %H:%M} BRT")
    print(f"pendentes: {len(p)}  ->  " + ", ".join(f"{x['postar_em']} {x['id']}" for x in p))
    print(f"reserva disponível: {sum(x['status'] == 'disponivel' for x in d['reserva'])}")
