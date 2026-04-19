"""
Konvertiert alle JPGs in public/assets/{code,games}-themes
zu PNGs mit transparentem weissen Hintergrund.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FOLDERS = [
    ROOT / "public" / "assets" / "games-themes",
    ROOT / "public" / "assets" / "code-themes",
]

# Pixel heller als dieser Schwellwert werden transparent (0-255 pro Kanal)
WHITE_THRESHOLD = 240


def make_white_transparent(src: Path, dst: Path) -> None:
    img = Image.open(src).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    changed = 0
    for y in range(h):
        for x in range(w):
            r, g, b, _ = pixels[x, y]
            if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
                pixels[x, y] = (r, g, b, 0)
                changed += 1
    img.save(dst, "PNG")
    print(f"  {src.name} -> {dst.name}  ({changed} Pixel transparent)")


def main() -> None:
    for folder in FOLDERS:
        if not folder.exists():
            print(f"Ordner fehlt: {folder}")
            continue
        print(f"\n=== {folder.name} ===")
        for jpg in sorted(folder.glob("*.jpg")):
            png = jpg.with_suffix(".png")
            make_white_transparent(jpg, png)
            jpg.unlink()


if __name__ == "__main__":
    main()
