#!/usr/bin/env python3
"""
Gera a narração (voz neural Kokoro, pt-BR), mede os tempos REAIS de cada clip
e estima o tempo de cada palavra por alinhamento acústico simples:

  1. cada frase é sintetizada separadamente -> início/fim de cada clip são exatos;
  2. pausas reais (silêncios internos) são detectadas no áudio e ancoradas nas
     vírgulas do texto;
  3. entre âncoras, o tempo é dividido proporcionalmente ao nº de fonemas
     de cada palavra;
  4. cada fronteira entre palavras é "puxada" para o vale de energia mais próximo
     (±70 ms) do envelope do áudio.

Saídas (pasta build/):
  narracao.wav     voz pura, já posicionada na linha do tempo do vídeo
  timeline.json    clips, palavras, trechos de legenda e duração total
  legendas.srt     legendas sincronizadas

Uso:  python3 tools/tts.py            (usa models/kokoro-v1.0.onnx e voices-v1.0.bin)
      python3 tools/tts.py --voice pm_alex
"""
import json, re, sys, argparse, unicodedata
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SR = 24000

def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)

def envelope(x, hop=240):  # 10 ms
    n = len(x) // hop
    fr = x[: n * hop].reshape(n, hop)
    return np.sqrt((fr ** 2).mean(axis=1) + 1e-12)

def trim(x, thr_db=-42):
    env = envelope(x)
    thr = env.max() * 10 ** (thr_db / 20)
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return x, 0
    a = max(0, idx[0] - 2) * 240
    b = min(len(x), (idx[-1] + 4) * 240)
    return x[a:b], a

def find_pauses(x, min_ms=110, thr_db=-34):
    env = envelope(x)
    thr = env.max() * 10 ** (thr_db / 20)
    quiet = env < thr
    pauses, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if (j - i) * 10 >= min_ms and i > 5 and j < len(quiet) - 5:
                pauses.append((i * 0.01, j * 0.01))
            i = j
        else:
            i += 1
    return pauses, env

def align(words, weights, pauses, dur, env):
    """Retorna lista (start,end) relativa ao clip (s)."""
    punct_idx = [i for i, w in enumerate(words[:-1]) if re.search(r"[,;:.!?]$", w)]
    # escolhe as pausas mais longas que casam com as vírgulas
    anchors = {}
    if punct_idx and pauses:
        longest = sorted(pauses, key=lambda p: p[1] - p[0], reverse=True)[: len(punct_idx)]
        longest.sort()
        # emparelha em ordem; se houver menos pausas que vírgulas, casa pelo tempo esperado
        total_w = sum(weights)
        exp_t = {i: sum(weights[: i + 1]) / total_w * dur for i in punct_idx}
        last_i = -1
        for p in longest:  # em ordem de tempo, só pontuações depois da última usada
            mid = (p[0] + p[1]) / 2
            best = min((i for i in punct_idx if i > last_i), key=lambda i: abs(exp_t[i] - mid), default=None)
            if best is not None:
                anchors[best] = p
                last_i = best
    # garante ordem monotônica (pausa posterior nunca ancora pontuação anterior)
    mono, last = {}, -1.0
    for i in sorted(anchors):
        if anchors[i][0] > last:
            mono[i] = anchors[i]; last = anchors[i][1]
    anchors = mono
    # segmentos entre âncoras
    times = [None] * len(words)
    seg_start_t, seg_start_i = 0.0, 0
    keys = sorted(anchors) + [len(words) - 1]
    for k in keys:
        if k in anchors:
            seg_end_t, next_start = anchors[k]
        else:
            seg_end_t, next_start = dur, dur
        ws = weights[seg_start_i : k + 1]
        tot = sum(ws)
        t = seg_start_t
        for off, wgt in enumerate(ws):
            d = (seg_end_t - seg_start_t) * wgt / tot
            times[seg_start_i + off] = [t, t + d]
            t += d
        seg_start_t, seg_start_i = next_start, k + 1
    # snap de fronteiras internas (sem âncora) ao vale de energia
    for i in range(len(words) - 1):
        if i in anchors:
            continue
        b = times[i][1]
        lo, hi = int((b - 0.07) * 100), int((b + 0.07) * 100)
        lo, hi = max(lo, 1), min(hi, len(env) - 1)
        if hi > lo:
            k = lo + int(np.argmin(env[lo:hi]))
            nb = k * 0.01
            if times[i][0] + 0.05 < nb < times[i + 1][1] - 0.05:
                times[i][1] = nb
                times[i + 1][0] = nb
    return times

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice")
    ap.add_argument("--speed", type=float)
    args = ap.parse_args()

    from kokoro_onnx import Kokoro
    script = json.loads((ROOT / "narration/script.json").read_text())
    voice = args.voice or script["voice"]
    speed = args.speed or script["speed"]
    k = Kokoro(str(ROOT / "models/kokoro-v1.0.onnx"), str(ROOT / "models/voices-v1.0.bin"))

    clips_out, all_words, cursor = [], [], 0.0
    pieces = []
    for c in script["clips"]:
        SAY = script.get("say", {})  # pronúncia: troca só no áudio, a legenda mantém o texto original
        say_text = c["text"]
        for a_, b_ in SAY.items(): say_text = re.sub(r"\b" + re.escape(a_) + r"\b", b_, say_text)
        audio, sr = k.create(say_text, voice=voice, speed=speed, lang=script["lang"])
        assert sr == SR
        audio, _ = trim(np.asarray(audio, dtype=np.float32))
        dur = len(audio) / SR
        start = max(c["minStart"], cursor + c["gapAfterPrev"])
        words = c["text"].split()
        weights = []
        for w in words:
            w_say = SAY.get(re.sub(r"[^\wÀ-ÿ]", "", w), w)
            ph = k.tokenizer.phonemize(re.sub(r"[^\wÀ-ÿ]", "", w_say) or w_say, script["lang"])
            n = len(re.sub(r"[ˈˌ\s]", "", ph)) or 1
            weights.append(n)
        pauses, env = find_pauses(audio)
        merged = []  # junta pausas separadas por um "estalo" curto
        for p in pauses:
            if merged and p[0] - merged[-1][1] < 0.1: merged[-1] = (merged[-1][0], p[1])
            else: merged.append(tuple(p))
        pauses = merged
        rel = align(words, weights, pauses, dur, env)
        cw = []
        for i, (w, (a, b)) in enumerate(zip(words, rel)):
            item = {"clip": c["id"], "i": i, "text": w, "norm": norm(w),
                    "start": round(start + a, 3), "end": round(start + b, 3)}
            cw.append(item)
        all_words += cw
        clips_out.append({"id": c["id"], "scene": c["scene"], "text": c["text"],
                          "start": round(start, 3), "end": round(start + dur, 3),
                          "pauses": [[round(start + p[0], 3), round(start + p[1], 3)] for p in pauses]})
        pieces.append((start, audio))
        cursor = start + dur
        print(f"{c['id']:4s} {start:6.2f}–{start+dur:6.2f}s  ({dur:.2f}s)  pausas={len(pauses)}")

    total = round(cursor + script["tailAfterLastClip"], 2)
    out = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for s, a in pieces:
        i = int(round(s * SR))
        out[i : i + len(a)] += a
    out = out[: int(total * SR)]
    peak = np.abs(out).max()
    out = out / peak * 0.89
    (ROOT / "build").mkdir(exist_ok=True)
    sf.write(ROOT / "build/narracao.wav", out, SR, subtype="PCM_16")

    # trechos de legenda: frase a frase; frases longas são divididas em partes equilibradas
    # (preferindo vírgulas), cada parte com até ~44 caracteres (2 linhas curtas no celular)
    import math
    MAXC = 44
    chunks = []
    def emit(cid, ws):
        chunks.append({"clip": cid, "text": " ".join(w["text"] for w in ws), "words": [w["i"] for w in ws],
                       "start": ws[0]["start"], "end": ws[-1]["end"]})
    for c in script["clips"]:
        ws = [w for w in all_words if w["clip"] == c["id"]]
        sent, sents = [], []
        for w in ws:
            sent.append(w)
            if re.search(r"[.!?:]”?$", w["text"]):
                sents.append(sent); sent = []
        if sent: sents.append(sent)
        for sn in sents:
            L = lambda a, b: len(" ".join(x["text"] for x in sn[a:b]))
            n = max(1, math.ceil(L(0, len(sn)) / MAXC))
            if n == 1: emit(c["id"], sn); continue
            target = L(0, len(sn)) / n
            # DP: custo = desvio do tamanho alvo, bônus para quebrar após vírgula
            INF = 1e18; m = len(sn)
            best = [[INF] * (n + 1) for _ in range(m + 1)]; prev = [[0] * (n + 1) for _ in range(m + 1)]
            best[0][0] = 0
            for j in range(1, m + 1):
                for k in range(1, n + 1):
                    for i in range(k - 1, j):
                        if best[i][k - 1] >= INF: continue
                        ln = L(i, j)
                        cost = (ln - target) ** 2 + (1e6 if ln > MAXC + 6 else 0) - (120 if j < m and sn[j - 1]["text"].endswith(",") else 0)
                        if best[i][k - 1] + cost < best[j][k]: best[j][k] = best[i][k - 1] + cost; prev[j][k] = i
            cuts, j = [], m
            for k in range(n, 0, -1): i = prev[j][k]; cuts.append((i, j)); j = i
            for i, j in reversed(cuts): emit(c["id"], sn[i:j])
    kw = {norm(x) for x in script["keywords"]}
    for w in all_words:
        w["key"] = w["norm"] in kw

    # SRT
    def ts(t):
        ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
    lines = []
    for i, ch in enumerate(chunks):
        end = ch["end"] + 0.3
        if i + 1 < len(chunks):
            end = min(end, chunks[i + 1]["start"] - 0.02)
        ch["hold"] = round(end, 3)
        lines += [str(i + 1), f"{ts(ch['start'])} --> {ts(end)}", ch["text"], ""]
    (ROOT / "build/legendas.srt").write_text("\n".join(lines), encoding="utf-8")

    tl = {"duration": total, "fps": 30, "width": 1080, "height": 1920, "voice": voice,
          "clips": clips_out, "words": all_words, "chunks": chunks}
    (ROOT / "build/timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"duração total: {total:.2f}s  ->  build/narracao.wav, build/timeline.json, build/legendas.srt")

if __name__ == "__main__":
    main()
