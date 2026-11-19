"""Create web-optimized WebP copies of the portfolio photography and logos.

Source:  site/assets/images/{home,about,logos}
Output:  assets/images/{home,about,logos}
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "site" / "assets" / "images"
DST = ROOT / "assets" / "images"

# folder -> (max width, max height, quality)
RULES = {
    "home": (1800, 1800, 80),
    "about": (1600, 1600, 80),
    "logos": (360, 220, 90),
}


def optimize(folder: str) -> None:
    max_w, max_h, quality = RULES[folder]
    src_dir = SRC / folder
    dst_dir = DST / folder
    dst_dir.mkdir(parents=True, exist_ok=True)
    if not src_dir.exists():
        print(f"skip {folder}: no source")
        return

    used: set[str] = set()
    for path in sorted(src_dir.iterdir()):
        if path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        try:
            with Image.open(path) as im:
                im = ImageOps.exif_transpose(im)
                if im.mode not in ("RGB", "RGBA"):
                    im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
                im.thumbnail((max_w, max_h), Image.LANCZOS)
                stem = path.stem.replace(" ", "-").lower()
                out = dst_dir / f"{stem}.webp"
                if stem in used:
                    # e.g. images.png and images.jpg both map to images.webp
                    out = dst_dir / f"{stem}-{path.suffix.lower().lstrip('.')}.webp"
                used.add(stem)
                im.save(out, "WEBP", quality=quality, method=6)
                print(f"{out.relative_to(ROOT)}  {out.stat().st_size // 1024} KB")
        except Exception as exc:  # pragma: no cover - defensive
            print(f"failed {path.name}: {exc}")


if __name__ == "__main__":
    for folder in RULES:
        optimize(folder)
