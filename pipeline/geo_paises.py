#!/usr/bin/env python3
"""Países com contorno real (Natural Earth 50m, nomes em português) recortados numa região, já projetados para o anim.js.
  python3 pipeline/geo_paises.py <lon0> <lon1> <lat0> <lat1> <saida.json> [lat_ref]
  python3 pipeline/geo_paises.py mundo <saida.json>        (mundo inteiro, sem Antártida, lat_ref 0)
Saída: {"lat_ref": x, "paises": [{"iso": "TWN", "nome": "Taiwan", "label": [x, y], "poly": [[[x, y], ...], ...]}]}
Pontos em [lon*K, -lat] com K = cos(lat_ref). No anim.js: P = (lon, lat) => [lon*K, -lat]; pinte por "iso" (ex.: destaque = new Set(['TWN','CHN'])).
Baixa o GeoJSON do GitHub (cache em pipeline/models/ne/)."""
import json, math, sys, urllib.request
from pathlib import Path
CACHE = Path(__file__).resolve().parent / "models/ne"; CACHE.mkdir(parents=True, exist_ok=True)
URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson"
f = CACHE / "ne_50m_admin_0_countries.geojson"
if not f.exists(): urllib.request.urlretrieve(URL, f)
G = json.load(open(f))
if sys.argv[1] == "mundo": X0, X1, Y0, Y1, OUT, LREF = -180, 180, -58, 84, sys.argv[2], 0.0
else:
    X0, X1, Y0, Y1 = map(float, sys.argv[1:5]); OUT = sys.argv[5]; LREF = float(sys.argv[6]) if len(sys.argv) > 6 else (Y0 + Y1) / 2
    M = 2.0; X0, X1, Y0, Y1 = X0 - M, X1 + M, Y0 - M, Y1 + M
K = math.cos(math.radians(LREF))
def clip(poly):
    def cl(pts, ins, inter):
        out = []
        for i in range(len(pts)):
            a, b = pts[i - 1], pts[i]
            if ins(b):
                if not ins(a): out.append(inter(a, b))
                out.append(b)
            elif ins(a): out.append(inter(a, b))
        return out
    def ix(x): return lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]))
    def iy(y): return lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y)
    p = poly
    for ins, inter in [(lambda q: q[0] >= X0, ix(X0)), (lambda q: q[0] <= X1, ix(X1)), (lambda q: q[1] >= Y0, iy(Y0)), (lambda q: q[1] <= Y1, iy(Y1))]:
        if not p: break
        p = cl(p, ins, inter)
    return p
BR = {"Vietname": "Vietnã", "Irão": "Irã", "Polónia": "Polônia", "Quénia": "Quênia", "Arménia": "Armênia", "Eslovénia": "Eslovênia", "Macedónia do Norte": "Macedônia do Norte", "Mónaco": "Mônaco", "Benim": "Benin", "Zimbabué": "Zimbábue", "Letónia": "Letônia", "Estónia": "Estônia", "Iémen": "Iêmen", "Chéquia": "Tchéquia", "Baréme": "Bahrein", "Tajiquistão": "Tadjiquistão", "Guiné Equatorial": "Guiné Equatorial", "Moçambique": "Moçambique"}
paises = []
for ft in G["features"]:
    pr = ft["properties"]; g = ft["geometry"]
    if pr.get("ISO_A3") == "ATA" or pr.get("ADM0_A3") == "ATA": continue
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    out = []
    for pl in polys:
        c = clip([tuple(p) for p in pl[0]])
        if len(c) >= 3: out.append([[round(x * K, 3), round(-y, 3)] for x, y in c])
    if not out: continue
    iso = pr.get("ISO_A3") if pr.get("ISO_A3") not in (None, "-99") else pr.get("ADM0_A3")
    lx, ly = pr.get("LABEL_X"), pr.get("LABEL_Y")
    paises.append({"iso": iso, "nome": BR.get(pr.get("NAME_PT"), pr.get("NAME_PT")) or pr.get("NAME"), "label": [round(lx * K, 3), round(-ly, 3)] if lx is not None else None, "poly": out})
json.dump({"lat_ref": LREF, "caixa": [X0, X1, Y0, Y1], "paises": paises}, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
print(OUT, len(paises), "países")
