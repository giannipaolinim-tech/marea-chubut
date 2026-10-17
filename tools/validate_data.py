"""Check the integrity of the app datasets. Run after every data edit:

  python tools/validate_data.py

Rules (owner policy, two levels):
  * Every fact {t, c, s} has a known confidence and existing source ids.
  * "local" needs 2+ INDEPENDENT sources (texts copied across sites count as one).
  * STRICT domains (safety, legal, regulations, protected areas, tide data, coordinates):
    only "oficial" / "cientifico", or "local" with 2+ independent sources. Never "unica".
  * Practical tips may be "unica" (single credible Chubut source).
  * Spot coordinates must lie within 300 m of the OSM coastline.
  * Species `modality` must be a sourced fact {v, c, s}; spot species / speciesByMonth must exist.
Exits with status 1 if anything is wrong.
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
DATA = WEB / "data"
COAST = ROOT / "research" / "geo" / "osm_coastline.json"
CONF = {"oficial", "cientifico", "local", "unica", "modelo"}
MAX_COAST_M = 300
# Sites that republish the same text: one source for independence purposes.
SAME_TEXT = [{"argentinaxplora", "welcomeargentina-madryn", "welcomeargentina-rawson", "welcomeargentina-camarones"}]
errors, warnings = [], []


def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


sources = {s["id"]: s for s in load("sources.json")["sources"]}
ports = load("tide_ports.json")
port_ids = {p["id"] for p in ports["reference"]} | {p["id"] for p in ports["secondary"]}
species = load("species.json")
species_ids = {s["id"] for s in species["species"]}
images = load("images.json")
used = set()


def independent_count(ids):
    groups = set()
    for i in ids:
        src = sources.get(i)
        if not src:
            continue
        key = next((min(g) for g in SAME_TEXT if i in g), None)
        if key is None:
            key = src["publisher"].split(" (")[0].strip().lower()
        groups.add(key)
    return len(groups)


def check_fact(node, where, strict):
    ids = node.get("s", [])
    for sid in ids:
        used.add(sid)
        if sid not in sources:
            errors.append(f"{where}: unknown source '{sid}'")
    c = node.get("c")
    if "t" in node and c is None:
        errors.append(f"{where}: fact without confidence: {node['t'][:60]}")
        return
    if c not in CONF:
        errors.append(f"{where}: bad confidence '{c}'")
        return
    if c in ("oficial", "cientifico", "local") and not ids:
        errors.append(f"{where}: '{c}' fact without sources")
    if c == "local" and independent_count(ids) < 2:
        errors.append(f"{where}: 'local' needs 2+ independent sources, has {independent_count(ids)}: {ids}")
    if strict and c == "unica":
        errors.append(f"{where}: single-source fact in a strict domain (safety/legal/zones/coords): {node.get('t', '')[:60]}")


def walk(node, where, strict):
    if isinstance(node, dict):
        if isinstance(node.get("s"), list) and ("t" in node or "c" in node):
            check_fact(node, where, strict)
        elif isinstance(node.get("s"), list):
            for sid in node["s"]:
                used.add(sid)
                if sid not in sources:
                    errors.append(f"{where}: unknown source '{sid}'")
        for k, v in node.items():
            walk(v, f"{where}.{k}", strict)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            walk(v, f"{where}[{i}]", strict)


# Strict files. Emergency numbers flagged "unconfirmed" are shown only under "A confirmar" (M-13).
for name in ("zones.json", "regulations.json", "guide.json"):
    walk(load(name), name, strict=True)
_safety = load("safety.json")
for i, e in enumerate(_safety["emergency"]):
    walk(e, f"safety.json.emergency[{i}]", strict=not e.get("unconfirmed"))
for key in ("general", "hazards", "wildlife"):
    walk(_safety.get(key, []), f"safety.json.{key}", strict=True)
walk(species, "species.json", strict=False)

# Spots: strict for legal facts, dangers, cut-offs and coordinates; practical fields may be single-source.
SPOT_FIELDS = ("access", "parking", "bottom", "bestTide", "castingDistance", "fuel", "orientation", "marinePoint", "cutoff")
spots = load("spots.json")["spots"]
for s in spots:
    w = f"spots.{s['id']}"
    for i, f in enumerate(s.get("facts", [])):
        walk(f, f"{w}.facts[{i}]", strict=f.get("k") in ("legal", "senal"))
    for i, d in enumerate(s.get("dangers", [])):
        walk(d, f"{w}.dangers[{i}]", strict=True)
    for k in SPOT_FIELDS:
        if k not in s:
            errors.append(f"{w}: missing field '{k}' (use null when there is no data)")
        elif s[k] is not None:
            walk(s[k], f"{w}.{k}", strict=k in ("cutoff",))
    if s.get("coords"):
        walk(s["coords"], f"{w}.coords", strict=True)
    if s.get("speciesSrc"):
        walk(s["speciesSrc"], f"{w}.speciesSrc", strict=False)
    for i, r in enumerate(s.get("speciesByMonth", [])):
        walk(r, f"{w}.speciesByMonth[{i}]", strict=False)
        if r["species"] not in species_ids:
            errors.append(f"{w}.speciesByMonth[{i}]: unknown species {r['species']}")
        if not r["months"] or any(m not in range(1, 13) for m in r["months"]):
            errors.append(f"{w}.speciesByMonth[{i}]: months must be 1–12")
    t = s["tide"]
    if t["port"] is not None and t["port"] not in port_ids:
        errors.append(f"{w}: unknown tide port {t['port']}")
    for sp in s["species"]:
        if sp not in species_ids:
            errors.append(f"{w}: unknown species {sp}")
    if s["species"] and "speciesSrc" not in s:
        errors.append(f"{w}: species without speciesSrc")
    if s.get("orientation") and not isinstance(s["orientation"].get("seaward"), (int, float)):
        errors.append(f"{w}: orientation.seaward must be a number")
    if s.get("marinePoint") and not all(isinstance(s["marinePoint"].get(k), (int, float)) for k in ("lat", "lon")):
        errors.append(f"{w}: marinePoint needs lat/lon")

# Coastline distance rule
if COAST.exists():
    segs = []
    for wy in json.loads(COAST.read_text(encoding="utf-8"))["ways"]:
        segs += [(wy[i], wy[i + 1]) for i in range(len(wy) - 1)]

    def dist_m(lat, lon):
        k = math.cos(math.radians(lat))
        px, py = lon * 111320 * k, lat * 110540
        best = float("inf")
        for a, b in segs:
            if abs(a[0] - lat) > 0.1 or abs(a[1] - lon) > 0.15:
                continue
            ax, ay, bx, by = a[1] * 111320 * k, a[0] * 110540, b[1] * 111320 * k, b[0] * 110540
            dx, dy = bx - ax, by - ay
            t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / ((dx * dx + dy * dy) or 1)))
            best = min(best, math.hypot(px - ax - t * dx, py - ay - t * dy))
        return best

    for s in spots:
        c = s.get("coords")
        if c:
            d = dist_m(c["lat"], c["lon"])
            if d > MAX_COAST_M:
                errors.append(f"spots.{s['id']}: coordinates {d:.0f} m from the OSM coastline (max {MAX_COAST_M} m)")
else:
    warnings.append("research/geo/osm_coastline.json missing: run tools/fetch_coastline.py (coastline rule skipped)")

# Species rules
for sp in species["species"]:
    w = f"species.{sp['id']}"
    m = sp.get("modality")
    if not (isinstance(m, dict) and isinstance(m.get("v"), list) and m.get("c") and m.get("s")):
        errors.append(f"{w}: modality must be a sourced fact {{v, c, s}}")
    if len(sp["season"]) != 12:
        errors.append(f"{w}: season must have 12 months")
    if any(sp["season"]) and not sp.get("seasonSrc"):
        errors.append(f"{w}: season without seasonSrc")
    for k in ("rigShore", "bestHours", "bestTide", "castingDistance"):
        if k not in sp:
            errors.append(f"{w}: missing field '{k}'")
    for b in sp.get("baits", []):
        if "rank" not in b:
            errors.append(f"{w}: bait without rank")
    if sp.get("baits") and not sp.get("rankBasis"):
        errors.append(f"{w}: baits without rankBasis")
    imgs = sp["image"] if isinstance(sp["image"], list) else [sp["image"]]
    for key in imgs:
        img = images.get(key)
        if not img or not (WEB / img["file"]).exists():
            errors.append(f"{w}: image '{key}' missing")

for p in ports["reference"]:
    for year, f in p["files"].items():
        if not (WEB / f).exists():
            errors.append(f"tide file missing: {f}")

unused = sorted(set(sources) - used - {"shn-tablas", "shn-generalidades", "osm", "osm-coastline", "natural-earth", "open-meteo", "suncalc"})
if unused:
    warnings.append("sources not referenced by any fact: " + ", ".join(unused))

for w in warnings:
    print("Note:", w)
if errors:
    print("\n".join(errors))
    print(f"\n{len(errors)} error(s)")
    sys.exit(1)
print(f"OK: {len(sources)} sources, {len(spots)} spots, {len(species_ids)} species, {len(port_ids)} tide ports.")
