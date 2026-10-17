"""Download species images from Wikimedia Commons with their license metadata.

Reads the license from the Commons API (extmetadata) at download time, so the
credit shown in the app always matches the file page. Writes:
  web/img/species/<id>.jpg   (max 1200 px wide)
  web/data/images.json       (title, page URL, author, license, license URL)

Usage: python tools/fetch_images.py
"""
import io
import time
import urllib.error
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_IMG = ROOT / "web" / "img" / "species"
OUT_JSON = ROOT / "web" / "data" / "images.json"
UA = "ChubutPescaApp/1.0 (offline fishing guide; contact via project owner)"

FILES = {
    "robalo": "File:Robalo_Patagonico.jpg",
    "pejerrey": "File:Odontesthes_argentinensis_Mar_del_Plata.JPG",
    "salmon": "File:Histoire_naturelle_des_poissons_(Pl._62)_(7949951854).jpg",
    "mero": "File:Acanthistius_patachonicus.jpg",
    "turco": "File:Histoire_naturelle_des_poissons_(Pl._63)_(7949952896).jpg",
    "escrofalo": "File:Eleginops_maclovinus_Sebastes_oculatus.JPG",
    "besugo": "File:FMIB_33944_Sparus_Pagrus_Linnaeus.jpeg",
    "caballa": "File:FMIB_45720_Scomber_colias.jpeg",
    "cazon": "File:Galeorhinus_galeus_SI.jpg",
    "gatuzo": "File:Mustelus_schmitti_-_Ezequiel_Vera_-_212129243.jpeg",
    "pez-gallo": "File:Callorhinchus_callorynchus_18714375.jpg",
    "gatopardo": "File:Cow_shark_(Notorynchus_cepedianus)_(5282477797).jpg",
    "bacota": "File:Bronze_whaler_auckland.jpg",
    "pez-angel": "File:Squatina_guggenheim_221517259.jpg",
    "rayas": "File:Sympterygia_bonapartii_280507153.jpg",
    "chucho": "File:Myliobatis_goodei,_Southern_eagle_ray,_topside.png",
    "palometa": "File:Parona_signata_Argentina.jpg",
}


def get(url, attempts=6):
    for i in range(attempts):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == attempts - 1:
                raise
            time.sleep(10 * (i + 1))  # Commons rate limit: back off and retry


def strip_html(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s or "")).strip()


def main():
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    records = {}
    for sid, title in FILES.items():
        api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
            "action": "query", "titles": title, "prop": "imageinfo",
            "iiprop": "url|extmetadata", "iiurlwidth": 1200, "format": "json",
        })
        page = next(iter(json.loads(get(api))["query"]["pages"].values()))
        info = page["imageinfo"][0]
        meta = info["extmetadata"]
        target = OUT_IMG / f"{sid}.jpg"
        if not target.exists():
            data = get(info.get("thumburl") or info["url"])
            img = Image.open(io.BytesIO(data)).convert("RGB")
            img.thumbnail((1200, 1200))
            img.save(target, "JPEG", quality=82, optimize=True, progressive=True)
            time.sleep(3)
        records[sid] = {
            "file": f"img/species/{sid}.jpg",
            "title": title,
            "page": info["descriptionurl"],
            "author": strip_html(meta.get("Artist", {}).get("value")),
            "license": meta.get("LicenseShortName", {}).get("value"),
            "licenseUrl": meta.get("LicenseUrl", {}).get("value"),
            "credit": strip_html(meta.get("Credit", {}).get("value"))[:200],
            "retrieved": "2026-10-16",
        }
        print(sid, records[sid]["license"], "|", records[sid]["author"][:60])
    OUT_JSON.write_text(json.dumps(records, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
