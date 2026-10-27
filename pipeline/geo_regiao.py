#!/usr/bin/env python3
"""Gera o mapa (contornos de terra, lagos e rios) de uma região, já projetado para o anim.js.
  python3 pipeline/geo_regiao.py <lon0> <lon1> <lat0> <lat1> <saida.json> [lat_ref]
Saída: {"land": [...], "lakes": [...], "rivers": [...]}, pontos [lon*cos(lat_ref), -lat] (lat_ref padrão = centro).
No anim.js use K = Math.cos(lat_ref * Math.PI / 180) e P = [lon*K, -lat], como em template_cristao/src/anim.js.
Baixa o Natural Earth 10m do GitHub (fica em cache em pipeline/models/ne/)."""
import json, math, sys, urllib.request
from pathlib import Path
X0, X1, Y0, Y1 = map(float, sys.argv[1:5]); OUT = sys.argv[5]
LREF = float(sys.argv[6]) if len(sys.argv) > 6 else (Y0 + Y1) / 2; K = math.cos(math.radians(LREF))
CACHE = Path(__file__).resolve().parent / "models/ne"; CACHE.mkdir(parents=True, exist_ok=True)
BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
def get(n):
    f = CACHE / f"{n}.geojson"
    if not f.exists(): urllib.request.urlretrieve(BASE + f.name, f)
    return json.load(open(f))
M = 1.0  # margem em graus
X0, X1, Y0, Y1 = X0 - M, X1 + M, Y0 - M, Y1 + M
def clip(poly):  # Sutherland-Hodgman contra o retângulo
    def cl(pts, ins, inter):
        out = []
        for i in range(len(pts)):
            a, b = pts[i - 1], pts[i]
            if ins(b):
                if not ins(a): out.append(inter(a, b))
                out.append(b)
            elif ins(a): out.append(inter(a, b))
        return out
    ix = lambda x: (lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])))
    iy = lambda y: (lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y))
    p = [tuple(q[:2]) for q in poly]
    for ins, it in [(lambda q: q[0] >= X0, ix(X0)), (lambda q: q[0] <= X1, ix(X1)), (lambda q: q[1] >= Y0, iy(Y0)), (lambda q: q[1] <= Y1, iy(Y1))]:
        if not p: break
        p = cl(p, ins, it)
    return p
def rings(g):
    if g["type"] == "Polygon": yield from g["coordinates"]
    elif g["type"] == "MultiPolygon":
        for p in g["coordinates"]: yield from p
def lines(g):
    if g["type"] == "LineString": yield g["coordinates"]
    elif g["type"] == "MultiLineString": yield from g["coordinates"]
pr = lambda r: [[round(x * K, 4), round(-y, 4)] for x, y in r]
out = {"land": [], "lakes": [], "rivers": [], "lat_ref": LREF}
for f in get("ne_10m_land")["features"]:
    for r in rings(f["geometry"]):
        c = clip(r)
        if len(c) > 2: out["land"].append(pr(c))
for f in get("ne_10m_lakes")["features"]:
    for r in rings(f["geometry"]):
        c = clip(r)
        if len(c) > 2: out["lakes"].append(pr(c))
SKIP = ("canal",)  # canais modernos (ex.: Suez) não aparecem em mapas bíblicos
for f in get("ne_10m_rivers_lake_centerlines")["features"]:
    nome = (f["properties"].get("name") or "").lower()
    if any(s in nome for s in SKIP): continue
    for l in lines(f["geometry"]):
        if any(X0 <= x <= X1 and Y0 <= y <= Y1 for x, y in l): out["rivers"].append(pr([p[:2] for p in l]))
json.dump(out, open(OUT, "w"), separators=(",", ":"))
print(f"{OUT}: {len(out['land'])} terras, {len(out['lakes'])} lagos, {len(out['rivers'])} rios, K=cos({LREF:.1f})")
