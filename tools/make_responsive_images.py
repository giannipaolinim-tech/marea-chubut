"""Create WebP versions (600 px for cards, 1200 px for the species hero) of every species image.

Usage: python tools/make_responsive_images.py
For web/img/species/<id>.jpg writes <id>-600.webp and <id>-1200.webp next to it.
"""
from pathlib import Path

from PIL import Image

DIR = Path(__file__).resolve().parent.parent / "web" / "img" / "species"

for jpg in sorted(DIR.glob("*.jpg")):
    img = Image.open(jpg).convert("RGB")
    for w in (600, 1200):
        out = jpg.with_name(f"{jpg.stem}-{w}.webp")
        copy = img.copy()
        copy.thumbnail((w, w * 2))
        copy.save(out, "WEBP", quality=78, method=6)
    print(jpg.name, "->", ", ".join(f"{jpg.stem}-{w}.webp" for w in (600, 1200)))
