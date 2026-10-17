"""Clip Natural Earth (public domain) layers to the Chubut coast for the offline map.

Usage:
  python tools/build_geo.py <ne_10m_land.geojson> <ne_10m_minor_islands.geojson> <ne_10m_admin_1_states_provinces_lines.geojson>
Output:
  web/geo/coast.json  {"land": [...polygons...], "borders": [...lines...]}
"""
import json
import sys
from pathlib import Path

W, E, S, N = -69.5, -61.0, -47.6, -40.6
OUT = Path(__file__).resolve().parent.parent / "web" / "geo" / "coast.json"


def clip_ring(ring):
    """Sutherland-Hodgman against the bounding box."""
    def clip(points, inside, intersect):
        out = []
        for i, cur in enumerate(points):
            prev = points[i - 1]
            if inside(cur):
                if not inside(prev):
                    out.append(intersect(prev, cur))
                out.append(cur)
            elif inside(prev):
                out.append(intersect(prev, cur))
        return out

    def ix_x(x):
        return lambda a, b: [x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])]

    def ix_y(y):
        return lambda a, b: [a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y]

    pts = ring
    for inside, inter in (
        (lambda p: p[0] >= W, ix_x(W)),
        (lambda p: p[0] <= E, ix_x(E)),
        (lambda p: p[1] >= S, ix_y(S)),
        (lambda p: p[1] <= N, ix_y(N)),
    ):
        if not pts:
            break
        pts = clip(pts, inside, inter)
    return pts


def rnd(points):
    out = []
    for x, y in points:
        p = [round(y, 4), round(x, 4)]  # Leaflet order: lat, lon
        if not out or out[-1] != p:
            out.append(p)
    return out


def polygons(geom):
    if not geom:
        return []
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon":
        return geom["coordinates"]
    return []


def lines(geom):
    if not geom:
        return []
    if geom["type"] == "LineString":
        return [geom["coordinates"]]
    if geom["type"] == "MultiLineString":
        return geom["coordinates"]
    return []


def main(land_path, islands_path, borders_path):
    land = []
    for path in (land_path, islands_path):
        for f in json.load(open(path, encoding="utf-8"))["features"]:
            for poly in polygons(f["geometry"]):
                ring = clip_ring(poly[0])
                if len(ring) >= 3:
                    land.append(rnd(ring))
    borders = []
    for f in json.load(open(borders_path, encoding="utf-8"))["features"]:
        for line in lines(f["geometry"]):
            run = []
            for x, y in line:
                if W <= x <= E and S <= y <= N:
                    run.append([x, y])
                elif run:
                    if len(run) > 1:
                        borders.append(rnd(run))
                    run = []
            if len(run) > 1:
                borders.append(rnd(run))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "source": "Natural Earth 1:10m (dominio público), naturalearthdata.com",
        "land": land,
        "borders": borders,
    }, separators=(",", ":")), encoding="utf-8")
    print(f"land polygons: {len(land)}, border lines: {len(borders)}, size: {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main(*sys.argv[1:4])
