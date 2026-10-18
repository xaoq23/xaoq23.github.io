#!/usr/bin/env python3
"""Regenerate the site icons from `assert/img.png`.

Usage:
    python scripts/make-favicons.py

Writes PNG favicons, the legacy multi-size favicon.ico and the PWA icons into
`hugo/static/`, where Hugo's project static directory overrides the vendored
theme's defaults. Requires Pillow (`pip install pillow`).
"""

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assert" / "img.png"
OUTPUT = ROOT / "hugo" / "static"

PNG_ICONS = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
}


def square_icon(size: int) -> Image.Image:
    """Center-crop the source to a square and resize with a good filter."""
    with Image.open(SOURCE) as image:
        image = image.convert("RGBA")
        # Slightly above center keeps the face in frame at small sizes.
        return ImageOps.fit(image, (size, size), method=Image.LANCZOS, centering=(0.5, 0.45))


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"missing source image: {SOURCE}")

    OUTPUT.mkdir(parents=True, exist_ok=True)

    for name, size in PNG_ICONS.items():
        square_icon(size).save(OUTPUT / name, optimize=True)
        print(f"wrote {name} ({size}x{size})")

    # Pillow embeds the requested sizes when saving ICO.
    square_icon(48).save(OUTPUT / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print("wrote favicon.ico (16, 32, 48)")


if __name__ == "__main__":
    main()
