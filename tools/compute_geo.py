"""Coastline-derived fields for every spot, from the OSM coastline (tools/fetch_coastline.py).

For each spot with coordinates:
  - distance to the coastline (used by validate_data.py, must be < 300 m)
  - orientation.seaward: bearing from the beach to open water. OSM coastline ways keep
    land on the left and water on the right, so seaward = segment bearing + 90°.
  - marinePoint: a point 6 km along that bearing, used for Open-Meteo marine variables
    (the model masks cells that touch land).

Usage: python tools/compute_geo.py            (updates web/data/spots.json)
       python tools/compute_geo.py --check    (only prints distances)
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COAST = ROOT / "research" / "geo" / "osm_coastline.json"
SPOTS = ROOT / "web" / "data" / "spots.json"
DIRS = ["norte", "nornoreste", "noreste", "estenoreste", "este", "estesudeste", "sudeste", "sursudeste",
        "sur", "sursudoeste", "sudoeste", "oestesudoeste", "oeste", "oestenoroeste", "noroeste", "nornoroeste"]


def load_segments():
    ways = json.loads(COAST.read_text(encoding="utf-8"))["ways"]
    return [(w[i], w[i + 1]) for w in ways for i in range(len(w) - 1)]


def to_xy(p, lat0):
    return (p[1] * 111320 * math.cos(math.radians(lat0)), p[0] * 110540)


def nearest(segments, lat, lon):
    """(distance m, segment, projected point) of the closest coastline segment."""
    best = (float("inf"), None)
    px, py = to_xy((lat, lon), lat)
    for a, b in segments:
        if abs(a[0] - lat) > 0.2 or abs(a[1] - lon) > 0.3:
            continue
        ax, ay = to_xy(a, lat)
        bx, by = to_xy(b, lat)
        dx, dy = bx - ax, by - ay
        t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / ((dx * dx + dy * dy) or 1)))
        d = math.hypot(px - ax - t * dx, py - ay - t * dy)
        if d < best[0]:
            best = (d, (a, b))
    return best


def bearing(a, b):
    la1, la2 = math.radians(a[0]), math.radians(b[0])
    dl = math.radians(b[1] - a[1])
    y = math.sin(dl) * math.cos(la2)
    x = math.cos(la1) * math.sin(la2) - math.sin(la1) * math.cos(la2) * math.cos(dl)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


def destination(lat, lon, brg, km):
    R = 6371.0
    d = km / R
    la1, lo1, b = math.radians(lat), math.radians(lon), math.radians(brg)
    la2 = math.asin(math.sin(la1) * math.cos(d) + math.cos(la1) * math.sin(d) * math.cos(b))
    lo2 = lo1 + math.atan2(math.sin(b) * math.sin(d) * math.cos(la1), math.cos(d) - math.sin(la1) * math.sin(la2))
    return round(math.degrees(la2), 5), round(math.degrees(lo2), 5)


def main(check=False):
    segs = load_segments()
    data = json.loads(SPOTS.read_text(encoding="utf-8"))
    for s in data["spots"]:
        c = s.get("coords")
        if not c:
            print(f"{s['id']:24} sin coordenadas")
            continue
        d, seg = nearest(segs, c["lat"], c["lon"])
        print(f"{s['id']:24} {d:7.0f} m a la costa OSM")
        if check or seg is None:
            continue
        seaward = (bearing(*seg) + 90) % 360
        name = DIRS[round(seaward / 22.5) % 16]
        s["orientation"] = {
            "seaward": round(seaward),
            "t": f"La costa mira hacia el {name} (rumbo aproximado {round(seaward)}°). Calculado a partir del tramo de línea de costa de OpenStreetMap más cercano al punto de acceso.",
            "c": "cientifico", "s": ["osm-coastline"], "method": "calculado a partir de la línea de costa",
        }
        mlat, mlon = destination(c["lat"], c["lon"], seaward, 6)
        s["marinePoint"] = {"lat": mlat, "lon": mlon,
                            "t": f"punto a 6 km mar adentro en dirección {name}, perpendicular a la costa (calculado), porque el modelo no da oleaje en celdas que tocan tierra.",
                            "c": "cientifico", "s": ["osm-coastline", "open-meteo"]}
    if not check:
        SPOTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main("--check" in sys.argv)
