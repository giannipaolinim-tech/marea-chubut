"""Download the OpenStreetMap coastline for the Chubut coast (Overpass API).

OSM coastline ways are drawn with land on the LEFT and water on the RIGHT, which
lets us compute the seaward direction of any beach.

Usage: python tools/fetch_coastline.py
Writes research/geo/osm_coastline.json  ({"source", "retrieved", "ways": [[[lat, lon], ...], ...]})
       web/geo/coastline.json           simplified copy (~40 m tolerance) for the map
Data © OpenStreetMap contributors, ODbL.
"""
import json
import math
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "research" / "geo" / "osm_coastline.json"
WEB = ROOT / "web" / "geo" / "coastline.json"
BBOX = (-46.15, -68.2, -41.85, -63.3)  # south, west, north, east
QUERY = f'[out:json][timeout:300];way["natural"="coastline"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});out geom;'


def simplify(points, tol_m):
    """Douglas-Peucker in local metres."""
    if len(points) < 3:
        return points
    lat0 = math.radians(points[0][0])
    xy = [(p[1] * 111320 * math.cos(lat0), p[0] * 110540) for p in points]

    def dist(p, a, b):
        dx, dy = b[0] - a[0], b[1] - a[1]
        if dx == dy == 0:
            return math.hypot(p[0] - a[0], p[1] - a[1])
        t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
        return math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy)

    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        i, j = stack.pop()
        best, idx = 0, None
        for k in range(i + 1, j):
            d = dist(xy[k], xy[i], xy[j])
            if d > best:
                best, idx = d, k
        if idx is not None and best > tol_m:
            keep[idx] = True
            stack += [(i, idx), (idx, j)]
    return [p for p, k in zip(points, keep) if k]


def main():
    req = urllib.request.Request("https://overpass-api.de/api/interpreter",
                                 data=urllib.parse.urlencode({"data": QUERY}).encode(),
                                 headers={"User-Agent": "MareaChubut/1.0 (coastline for shore-fishing app)"})
    with urllib.request.urlopen(req, timeout=400) as r:
        data = json.loads(r.read())
    ways = [[[round(g["lat"], 6), round(g["lon"], 6)] for g in el["geometry"]] for el in data["elements"] if el.get("geometry")]
    RAW.parent.mkdir(parents=True, exist_ok=True)
    RAW.write_text(json.dumps({"source": "OpenStreetMap natural=coastline via Overpass API (© OpenStreetMap contributors, ODbL)",
                               "retrieved": date.today().isoformat(), "bbox": BBOX, "ways": ways}), encoding="utf-8")
    simple = [[[round(a, 5), round(b, 5)] for a, b in simplify(w, 40)] for w in ways]
    simple = [w for w in simple if len(w) > 1]
    WEB.write_text(json.dumps({"source": "© OpenStreetMap contributors (ODbL), natural=coastline, simplificada a ~40 m",
                               "retrieved": date.today().isoformat(), "lines": simple}, separators=(",", ":")), encoding="utf-8")
    n = sum(len(w) for w in ways)
    print(f"{len(ways)} ways, {n} nodes; simplified {sum(len(w) for w in simple)} nodes, {WEB.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
