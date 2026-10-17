"""Merge a spot-research JSON (research/raw2/B_spots_north.json or C_spots_south.json) into web/data.

Applies the owner's confidence policy:
  * strict items (existence/legal/dangers/cut-offs/coordinates) are kept only if they are
    oficial/cientifico or 'local' with 2+ independent sources; single-source dangers are dropped
    and recorded in data/excluded.json;
  * practical fields (access, parking, bottom, best tide, casting distance, fuel, services,
    species per month) may be single-source ('unica');
  * sources whose URL already exists in sources.json are mapped to the existing id.

Usage: python tools/merge_spot_research.py research/raw2/C_spots_south.json
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
D = ROOT / "web" / "data"
STRICT_OK = {"oficial", "cientifico", "local"}
PORT_BY_REGION = {"golfo-san-jorge": "COMO", "sur": "BCAM", "rawson": "RAWS", "golfo-nuevo": "MADR", "valdes": "PIRA", "norte": None}


def L(f):
    return json.loads((D / f).read_text(encoding="utf-8"))


def W(f, d):
    (D / f).write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def main(path):
    R = json.loads(Path(path).read_text(encoding="utf-8"))
    src = L("sources.json")
    by_url = {s["url"].rstrip("/"): s["id"] for s in src["sources"]}
    have = {s["id"] for s in src["sources"]}
    types = {s["id"]: s["type"] for s in src["sources"]}
    remap = {}
    for s in R["sources"]:
        u = s["url"].rstrip("/")
        if u in by_url:
            remap[s["id"]] = by_url[u]
        elif s["id"] not in have:
            s = dict(s); s.setdefault("verified", "2026-10-16")
            src["sources"].append(s); have.add(s["id"]); by_url[u] = s["id"]; types[s["id"]] = s["type"]

    def m(f):
        if not f:
            return None
        f = dict(f)
        f["s"] = list(dict.fromkeys(remap.get(i, i) for i in f.get("s", [])))
        return f

    def independent(ids):
        pubs = {next((x["publisher"] for x in src["sources"] if x["id"] == i), i).split(" (")[0].lower() for i in ids}
        return len(pubs)

    def strict_ok(f):
        if not f or f.get("c") not in STRICT_OK:
            return False
        if f["c"] == "oficial" and not any(types.get(i) == "oficial" for i in f["s"]):
            return False
        if f["c"] == "local" and independent(f["s"]) < 2:
            return False
        return True

    spots = L("spots.json")
    sm = {s["id"]: s for s in spots["spots"]}
    excluded = L("excluded.json")
    species_ids = {s["id"] for s in L("species.json")["species"]}
    report = []
    for r in R["spots"]:
        sid = r["id"]
        existence = m(r.get("existence"))
        if r.get("new") and not strict_ok(existence):
            excluded["items"].append({"category": "Spots", "item": r["name"], "reason": "Existencia como pesquero sin fuente oficial ni dos fuentes independientes.", "consulted": existence["s"] if existence else []})
            report.append(f"{sid}: NEW rejected (existence not strict)")
            continue
        s = sm.get(sid)
        if s is None:
            s = {"id": sid, "name": r["name"], "locality": r.get("locality", ""), "region": r["region"], "coords": None, "modality": ["playa"],
                 "facts": [], "species": [], "dangers": [], "speciesByMonth": [],
                 "tide": {"port": PORT_BY_REGION.get(r["region"]), "kind": "aproximacion" if PORT_BY_REGION.get(r["region"]) else "ninguna"}}
            for k in ("bottom", "bestTide", "castingDistance", "parking", "orientation", "marinePoint", "cutoff", "fuel", "access"):
                s[k] = None
            spots["spots"].append(s); sm[sid] = s
            report.append(f"{sid}: NEW spot added")
        # coordinates (strict: must come with a source; distance is checked by the validator)
        c = r.get("coords")
        if c and c.get("lat") is not None:
            cc = m(c)
            s["coords"] = {"lat": round(c["lat"], 6), "lon": round(c["lon"], 6), "kind": c["kind"], "c": "cientifico" if all(types.get(i) != "oficial" for i in cc["s"]) else "oficial", "s": cc["s"]}
        # existence / legal as facts
        if existence and strict_ok(existence):
            s["facts"] = [f for f in s["facts"] if f["k"] != "uso"]
            s["facts"].insert(0, {"k": "uso", **existence})
        legal = m(r.get("legal"))
        if legal and strict_ok(legal) and not any(f["k"] == "legal" and f["t"] == legal["t"] for f in s["facts"]):
            s["facts"].append({"k": "legal", **legal})
        # practical fields
        for k in ("access", "parking", "bottom", "bestTide", "castingDistance", "fuel"):
            f = m(r.get(k))
            if f and f.get("c"):
                s[k] = f
        for svc in r.get("services", []):
            f = m(svc)
            if f and not any(x["k"] == "servicios" and x["t"] == f["t"] for x in s["facts"]):
                s["facts"].append({"k": "servicios", **f})
        sp = m(r.get("species"))
        if sp and sp.get("ids"):
            ids = [i for i in sp["ids"] if i in species_ids]
            if ids and not s["species"]:
                s["species"] = ids
                s["speciesSrc"] = {"c": sp["c"], "s": sp["s"]}
        for row in r.get("speciesByMonth", []):
            f = m(row)
            if f["species"] not in species_ids or not f.get("months"):
                continue
            if not any(x["species"] == f["species"] and x["t"] == f["t"] for x in s["speciesByMonth"]):
                s["speciesByMonth"].append({"species": f["species"], "months": sorted(set(f["months"])), "t": f["t"], "c": f["c"], "s": f["s"]})
        # dangers and cut-off: strict
        for dg in r.get("dangers", []):
            f = m(dg)
            if strict_ok(f):
                if not any(x["t"] == f["t"] for x in s["dangers"]):
                    s["dangers"].append({"t": f["t"], "c": f["c"], "s": f["s"], **({"lifeRisk": True} if f.get("lifeRisk") else {})})
            else:
                excluded["items"].append({"category": "Seguridad (fuente única)", "item": f"{r['name']}: {f['t'][:140]}", "reason": "Advertencia de seguridad con una sola fuente: no cumple la regla estricta.", "consulted": f["s"]})
                report.append(f"{sid}: danger dropped (single source)")
        co = m(r.get("cutoff"))
        if co:
            if strict_ok(co):
                s["cutoff"] = {"t": co["t"], "phase": co.get("phase", "creciente"), "c": co["c"], "s": co["s"]}
            else:
                report.append(f"{sid}: cutoff dropped (single source)")
    for rej in R.get("rejected", []):
        excluded["items"].append({"category": "Spots", "item": rej["name"], "reason": rej["reason"], "consulted": rej.get("sourcesConsulted", [])[:4]})
    W("sources.json", src)
    W("spots.json", spots)
    W("excluded.json", excluded)
    print("\n".join(report) or "merged")


if __name__ == "__main__":
    main(sys.argv[1])
