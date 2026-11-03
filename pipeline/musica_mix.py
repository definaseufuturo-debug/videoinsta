#!/usr/bin/env python3
"""Mistura uma trilha do Openverse no vídeo pronto (sem apagar o áudio que o vídeo já tem).
  python3 pipeline/musica_mix.py <video.mp4> <trilha.mp3> <saida.mp4> [--gain 0.5] [--inicio 0] [--substituir]
Corta a trilha na duração do vídeo, aplica fade de 1 s no começo e 2 s no fim, e baixa o volume (gain).
--substituir: troca o áudio do vídeo pela trilha (use quando o vídeo não tem narração e a trilha é melhor que a sintética)."""
import argparse, subprocess, json
a = argparse.ArgumentParser()
a.add_argument("video"); a.add_argument("trilha"); a.add_argument("saida")
a.add_argument("--gain", type=float, default=0.5); a.add_argument("--inicio", type=float, default=0.0); a.add_argument("--substituir", action="store_true")
o = a.parse_args()
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", o.video]).strip())
fo = max(0, dur - 2)
trilha = f"[1:a]atrim=start={o.inicio}:duration={dur},asetpts=PTS-STARTPTS,loudnorm=I=-20:TP=-2,volume={o.gain},afade=t=in:d=1,afade=t=out:st={fo}:d=2[m]"
if o.substituir: fc, mapa = trilha, "[m]"
else: fc, mapa = trilha + ";[0:a][m]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]", "[a]"
subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", o.video, "-i", o.trilha, "-filter_complex", fc, "-map", "0:v", "-map", mapa,
                       "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", str(dur), o.saida])
print("ok", o.saida)
