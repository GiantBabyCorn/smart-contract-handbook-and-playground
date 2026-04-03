#!/usr/bin/env python3
"""Generate og:image for each entry and the default og-image.

Creates:
  - public/og-image.png         (default, 1200x630)
  - public/og/<slug>.png        (per-entry, 1200x630)

Requires: pip install Pillow cairosvg
If Pillow is not available, generates a minimal PNG using stdlib only
(solid color with no text - as emergency fallback).
"""

from __future__ import annotations

import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"
OG_DIR = PUBLIC_DIR / "og"
ALL_META = ROOT / "src" / "data" / "allMeta.ts"

WIDTH = 1200
HEIGHT = 630

# Brand colors
BG_COLOR = (15, 23, 42)       # slate-900
ACCENT_COLOR = (99, 102, 241) # indigo-500
TEXT_COLOR = (255, 255, 255)   # white


def create_minimal_png(width: int, height: int, color: tuple[int, int, int]) -> bytes:
    """Create a minimal solid-color PNG using only stdlib (struct + zlib)."""
    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'

    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = _make_chunk(b'IHDR', ihdr_data)

    # IDAT chunk (raw pixel data)
    raw_rows = []
    row = bytes([0] + list(color) * width)  # filter byte 0 + RGB pixels
    for _ in range(height):
        raw_rows.append(row)
    compressed = zlib.compress(b''.join(raw_rows))
    idat = _make_chunk(b'IDAT', compressed)

    # IEND chunk
    iend = _make_chunk(b'IEND', b'')

    return signature + ihdr + idat + iend


def _make_chunk(chunk_type: bytes, data: bytes) -> bytes:
    chunk = chunk_type + data
    return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xFFFFFFFF)


def generate_with_pillow() -> bool:
    """Try to generate OG images with Pillow for text rendering."""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        return False

    import re

    def load_logo() -> Image.Image | None:
        """Load and render the SVG logo to a PIL Image."""
        logo_svg = PUBLIC_DIR / "logo.svg"
        if not logo_svg.exists():
            return None
        try:
            import cairosvg
            import io
            png_data = cairosvg.svg2png(url=str(logo_svg), output_width=200, output_height=293)
            logo = Image.open(io.BytesIO(png_data)).convert('RGBA')
            # Scale to 180px tall
            target_h = 180
            ratio = target_h / logo.height
            target_w = int(logo.width * ratio)
            return logo.resize((target_w, target_h), Image.LANCZOS)
        except ImportError:
            return None

    logo_img = load_logo()

    def make_og_image(title: str, subtitle: str, output_path: Path, *, show_logo: bool = False) -> None:
        img = Image.new('RGBA', (WIDTH, HEIGHT), BG_COLOR + (255,))
        draw = ImageDraw.Draw(img)

        # Draw accent bar at top
        draw.rectangle([0, 0, WIDTH, 6], fill=ACCENT_COLOR)

        # Paste logo if available and requested
        logo_offset = 0
        if show_logo and logo_img is not None:
            lx = (WIDTH - logo_img.width) // 2
            ly = 80
            img.paste(logo_img, (lx, ly), logo_img)
            logo_offset = 40

        # Try to use a decent font, fall back to default
        title_size = 52
        subtitle_size = 28
        try:
            title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", title_size)
            subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", subtitle_size)
        except (OSError, IOError):
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()

        # Draw title centered
        bbox = draw.textbbox((0, 0), title, font=title_font)
        tw = bbox[2] - bbox[0]
        draw.text(((WIDTH - tw) / 2, HEIGHT / 2 - 60 + logo_offset), title, fill=TEXT_COLOR, font=title_font)

        # Draw subtitle centered
        bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
        sw = bbox[2] - bbox[0]
        draw.text(((WIDTH - sw) / 2, HEIGHT / 2 + 20 + logo_offset), subtitle, fill=ACCENT_COLOR, font=subtitle_font)

        # Draw site name at bottom
        site_name = "Smart Contract Handbook"
        bbox = draw.textbbox((0, 0), site_name, font=subtitle_font)
        snw = bbox[2] - bbox[0]
        draw.text(((WIDTH - snw) / 2, HEIGHT - 80), site_name, fill=(148, 163, 184), font=subtitle_font)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        img.convert('RGB').save(output_path, 'PNG')

    # Generate default og-image (with logo)
    make_og_image(
        "Smart Contract Handbook",
        "Interactive ERC Standards & DeFi Protocol Explorer",
        PUBLIC_DIR / "og-image.png",
        show_logo=True,
    )
    print(f"  Created public/og-image.png")

    # Parse entries from allMeta.ts
    content = ALL_META.read_text(encoding="utf-8")
    entries = re.findall(
        r"slug:\s*'([^']+)'.*?name:\s*'([^']+)'.*?category:\s*'([^']+)'",
        content,
        re.DOTALL,
    )

    OG_DIR.mkdir(parents=True, exist_ok=True)
    for slug, name, category in entries:
        make_og_image(name, category.upper(), OG_DIR / f"{slug}.png")
        print(f"  Created public/og/{slug}.png")

    return True


def generate_fallback() -> None:
    """Generate minimal solid-color PNGs without Pillow."""
    print("  Pillow not available, generating minimal fallback PNGs...")

    png_data = create_minimal_png(WIDTH, HEIGHT, BG_COLOR)

    # Default og-image
    (PUBLIC_DIR / "og-image.png").write_bytes(png_data)
    print(f"  Created public/og-image.png (solid color fallback)")

    # Per-entry images
    import re
    content = ALL_META.read_text(encoding="utf-8")
    slugs = re.findall(r"slug:\s*'([^']+)'", content)

    OG_DIR.mkdir(parents=True, exist_ok=True)
    for slug in slugs:
        (OG_DIR / f"{slug}.png").write_bytes(png_data)
        print(f"  Created public/og/{slug}.png (solid color fallback)")


def main() -> None:
    print("Generating OG images...\n")

    if not generate_with_pillow():
        generate_fallback()
        print("\nTip: Install Pillow for branded images with text:")
        print("  pip install Pillow")

    print("\nDone.")


if __name__ == "__main__":
    main()
