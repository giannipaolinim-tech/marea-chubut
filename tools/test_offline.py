"""Automated offline test (M-15).

Checks, without a browser, that everything the app needs to run offline is in
web/precache.json, and that sw.js caches the rest on first use:
  * every ES-module import reachable from js/main.js (dynamic imports included)
  * every data file loaded by js/data.js and every tide table in tide_ports.json
  * fonts referenced by css/app.css, vendor files, geo layers, icons, manifest
  * species images are NOT precached but are handled by the runtime cache in sw.js
  * sw.js VERSION matches precache.json (so phones pick up updates)

Usage: python tools/test_offline.py   (exit 1 on failure)
"""
import json
import re
import sys
from pathlib import Path

WEB = Path(__file__).resolve().parent.parent / "web"
pre = json.loads((WEB / "precache.json").read_text(encoding="utf-8"))
files = set(pre["files"])
fail = []


def need(path, why):
    p = path.lstrip("./")
    if p not in files:
        fail.append(f"not precached: {p} ({why})")
    elif not (WEB / p).exists():
        fail.append(f"precached but missing on disk: {p}")


# Module graph
seen, todo = set(), ["js/main.js"]
while todo:
    mod = todo.pop()
    if mod in seen:
        continue
    seen.add(mod)
    need(mod, "module")
    src = (WEB / mod).read_text(encoding="utf-8")
    for imp in re.findall(r"""(?:import|from)\s*\(?\s*['"](\.{1,2}/[^'"]+)['"]""", src):
        todo.append((Path(mod).parent / imp).as_posix().replace("/./", "/"))
        todo[-1] = str(Path(todo[-1])).replace("\\", "/")
        parts = []
        for seg in todo[-1].split("/"):
            if seg == "..":
                parts.pop()
            elif seg != ".":
                parts.append(seg)
        todo[-1] = "/".join(parts)

# Data files
data_js = (WEB / "js/data.js").read_text(encoding="utf-8")
for name in re.search(r"FILES = \[([^\]]+)\]", data_js).group(1).replace("'", "").split(","):
    need(f"data/{name.strip()}.json", "dataset")
for p in json.loads((WEB / "data/tide_ports.json").read_text(encoding="utf-8"))["reference"]:
    for f in p["files"].values():
        need(f, "tide table")

# CSS fonts, vendor, geo, shell
css = (WEB / "css/app.css").read_text(encoding="utf-8")
for f in re.findall(r"url\(['\"]?\.\./([^'\")]+)", css):
    need(f, "font")
for f in ["index.html", "manifest.json", "css/app.css", "vendor/suncalc/suncalc.js", "vendor/leaflet/leaflet.js",
          "vendor/leaflet/leaflet.css", "geo/coast.json", "geo/coastline.json", "img/icon.svg", "img/icon-192.png", "img/icon-512.png"]:
    need(f, "shell")

# Species images: runtime cache, not precache
if any(f.startswith("img/species/") for f in files):
    fail.append("species images should be cached on first view, not precached (L-08)")
sw = (WEB / "sw.js").read_text(encoding="utf-8")
if "cache: 'reload'" not in sw:
    fail.append("sw.js must precache with cache: 'reload' (otherwise updates can store stale files)")
if "/img/species/" not in sw:
    fail.append("sw.js has no runtime cache for species images")
if f"const VERSION = '{pre['version']}'" not in sw:
    fail.append("sw.js VERSION does not match precache.json: run tools/build_precache.py")

if fail:
    print("\n".join(fail))
    print(f"\nOFFLINE TEST FAILED ({len(fail)})")
    sys.exit(1)
print(f"OFFLINE TEST OK: {len(seen)} modules, {len(files)} precached files, version {pre['version']}")
