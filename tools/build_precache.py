"""List every file the app needs offline and stamp a version so phones pick up updates.

Run after changing any file under web/ (data, code, images):
  python tools/build_precache.py
Writes web/precache.json, which web/sw.js reads at install time.
"""
import hashlib
import json
import re
from pathlib import Path

WEB = Path(__file__).resolve().parent.parent / "web"
EXT = {".html", ".css", ".js", ".json", ".webmanifest", ".woff2", ".jpg", ".png", ".svg"}
SKIP = {"sw.js", "precache.json"}
# Species images are cached on first view by the service worker, not at install (L-08).
SKIP_DIRS = ("img/species/",)

files = sorted(
    p.relative_to(WEB).as_posix()
    for p in WEB.rglob("*")
    if p.is_file() and p.suffix in EXT and p.name not in SKIP
    and not p.relative_to(WEB).as_posix().startswith(SKIP_DIRS)
)
digest = hashlib.sha256()
for f in files:
    digest.update(f.encode())
    digest.update((WEB / f).read_bytes())
version = digest.hexdigest()[:12]
(WEB / "precache.json").write_text(json.dumps({"version": version, "files": ["./"] + files}, indent=1), encoding="utf-8")
sw = WEB / "sw.js"
sw.write_text(re.sub(r"const VERSION = '[^']*';", f"const VERSION = '{version}';", sw.read_text(encoding="utf-8")), encoding="utf-8")
print(f"precache.json: {len(files)} files, version {version}")
