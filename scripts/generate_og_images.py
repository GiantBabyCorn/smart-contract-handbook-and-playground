#!/usr/bin/env python3
"""Generate og:image for each entry and the default og-image.

Creates:
  - public/og-image.png         (default, 1200x630)
  - public/og/catalog.png       (generic /catalog page card, 1200x630)
  - public/og/<slug>.png        (per-entry, 1200x630)

Usage:
  python scripts/generate_og_images.py                 # everything
  python scripts/generate_og_images.py --only catalog  # just the catalog card
  python scripts/generate_og_images.py --only default erc20 uniswap-v2

--only targets: "default" (og-image.png), "catalog", or entry slugs. Use it to
avoid rewriting dozens of committed PNGs when only one card changed.

Entry list comes from src/data/allMeta.ts (generated; published standards)
plus src/data/protocolsMeta.ts (protocols — spread into allMeta at runtime,
so they must be parsed separately here).

Requires: pip install Pillow cairosvg
If Pillow is not available, generates a minimal PNG using stdlib only
(solid color with no text - as emergency fallback).
"""

from __future__ import annotations

import argparse
import re
import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"
OG_DIR = PUBLIC_DIR / "og"
ALL_META = ROOT / "src" / "data" / "allMeta.ts"
PROTOCOLS_META = ROOT / "src" / "data" / "protocolsMeta.ts"

# Same visual language as the per-entry cards.
CATALOG_TITLE = "Standards Catalog"
CATALOG_SUBTITLE = "ERC STANDARDS & DEFI PROTOCOLS"

# Candidate fonts, tried in order (Linux/CI first — the committed cards were
# rendered with DejaVu Sans — then Windows equivalents for local runs).
BOLD_FONTS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "C:/Windows/Fonts/DejaVuSans-Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]
REGULAR_FONTS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "C:/Windows/Fonts/DejaVuSans.ttf",
    "C:/Windows/Fonts/arial.ttf",
]

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


def parse_entries() -> list[tuple[str, str, str]]:
    """(slug, name, category) for every published entry, standards + protocols."""
    entries: list[tuple[str, str, str]] = []
    seen: set[str] = set()
    for path in (ALL_META, PROTOCOLS_META):
        if not path.exists():
            continue
        content = path.read_text(encoding="utf-8")
        for slug, name, category in re.findall(
            r"slug:\s*'([^']+)'.*?name:\s*'([^']+)'.*?category:\s*'([^']+)'",
            content,
            re.DOTALL,
        ):
            if slug not in seen:
                seen.add(slug)
                entries.append((slug, name, category))
    return entries


def wanted(only: set[str] | None, target: str) -> bool:
    return only is None or target in only


def generate_with_pillow(only: set[str] | None) -> bool:
    """Try to generate OG images with Pillow for text rendering."""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        return False

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

        def load_font(candidates: list[str], size: int):
            for candidate in candidates:
                try:
                    return ImageFont.truetype(candidate, size)
                except (OSError, IOError):
                    continue
            return ImageFont.load_default()

        title_font = load_font(BOLD_FONTS, title_size)
        subtitle_font = load_font(REGULAR_FONTS, subtitle_size)

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
    if wanted(only, "default"):
        make_og_image(
            "Smart Contract Handbook",
            "Interactive ERC Standards & DeFi Protocol Explorer",
            PUBLIC_DIR / "og-image.png",
            show_logo=True,
        )
        print("  Created public/og-image.png")

    # Generic /catalog page card (same style as the per-entry cards)
    if wanted(only, "catalog"):
        make_og_image(CATALOG_TITLE, CATALOG_SUBTITLE, OG_DIR / "catalog.png")
        print("  Created public/og/catalog.png")

    for slug, name, category in parse_entries():
        if wanted(only, slug):
            make_og_image(name, category.upper(), OG_DIR / f"{slug}.png")
            print(f"  Created public/og/{slug}.png")

    return True


def generate_fallback(only: set[str] | None) -> None:
    """Generate minimal solid-color PNGs without Pillow."""
    print("  Pillow not available, generating minimal fallback PNGs...")

    png_data = create_minimal_png(WIDTH, HEIGHT, BG_COLOR)
    OG_DIR.mkdir(parents=True, exist_ok=True)

    if wanted(only, "default"):
        (PUBLIC_DIR / "og-image.png").write_bytes(png_data)
        print("  Created public/og-image.png (solid color fallback)")

    if wanted(only, "catalog"):
        (OG_DIR / "catalog.png").write_bytes(png_data)
        print("  Created public/og/catalog.png (solid color fallback)")

    for slug, _name, _category in parse_entries():
        if wanted(only, slug):
            (OG_DIR / f"{slug}.png").write_bytes(png_data)
            print(f"  Created public/og/{slug}.png (solid color fallback)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate OG images (default card, catalog card, per-entry cards)")
    parser.add_argument(
        "--only",
        nargs="+",
        metavar="TARGET",
        help="generate only these targets: 'default' (og-image.png), 'catalog', or entry slugs",
    )
    args = parser.parse_args()
    only: set[str] | None = set(args.only) if args.only else None

    if only is not None:
        known = {"default", "catalog"} | {slug for slug, _n, _c in parse_entries()}
        unknown = only - known
        if unknown:
            print(f"ERROR: unknown --only target(s): {', '.join(sorted(unknown))}", file=sys.stderr)
            sys.exit(1)

    print("Generating OG images...\n")

    if not generate_with_pillow(only):
        generate_fallback(only)
        print("\nTip: Install Pillow for branded images with text:")
        print("  pip install Pillow")

    print("\nDone.")


if __name__ == "__main__":
    main()
