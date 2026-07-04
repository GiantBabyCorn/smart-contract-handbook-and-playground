#!/usr/bin/env python3
"""Generate public/sitemap.xml from the published registry (plan.md 8.0).

URL set = static routes (/, /catalog, /playground) + one URL per PUBLISHED
entry. Published entries are exactly what the generated src/data/allMeta.ts
(+ spread src/data/protocolsMeta.ts) contains — gen_allmeta.py only emits
published catalog rows, so unpublished skeletons can never leak into the
sitemap. Run scripts/gen_allmeta.py first if the catalog changed.

Usage
    python scripts/generate_sitemap.py [--check]

    --check   Exit 1 if public/sitemap.xml is stale (CI drift guard).
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src" / "data"
CONSTANTS_PATH = ROOT / "src" / "utils" / "constants.ts"
SITEMAP_PATH = ROOT / "public" / "sitemap.xml"

STATIC_PATHS = ["", "catalog", "playground"]


def site_url() -> str:
    content = CONSTANTS_PATH.read_text(encoding="utf-8")
    m = re.search(r"SITE_URL\s*=\s*'([^']+)'", content)
    if not m:
        print(f"ERROR: SITE_URL not found in {CONSTANTS_PATH}", file=sys.stderr)
        sys.exit(1)
    return m.group(1).rstrip("/")


def published_slugs() -> list[str]:
    slugs: set[str] = set()
    for filename in ("allMeta.ts", "protocolsMeta.ts"):
        path = DATA_DIR / filename
        if not path.exists():
            print(f"ERROR: {path} not found — run scripts/gen_allmeta.py first.", file=sys.stderr)
            sys.exit(1)
        slugs.update(re.findall(r"slug:\s*'([^']+)'", path.read_text(encoding="utf-8")))
    return sorted(slugs)


def generate() -> str:
    base = site_url()
    urls = [f"{base}/{p}" if p else f"{base}/" for p in STATIC_PATHS]
    urls += [f"{base}/{slug}" for slug in published_slugs()]

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in urls:
        lines.append(f"  <url><loc>{url}</loc></url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate public/sitemap.xml (published only)")
    parser.add_argument("--check", action="store_true", help="fail if sitemap.xml is stale")
    args = parser.parse_args()

    content = generate()
    url_count = content.count("<loc>")

    if args.check:
        current = SITEMAP_PATH.read_text(encoding="utf-8") if SITEMAP_PATH.exists() else ""
        if current != content:
            print("sitemap.xml is stale — run: python scripts/generate_sitemap.py", file=sys.stderr)
            sys.exit(1)
        print(f"sitemap.xml up to date ({url_count} URLs).")
        return

    with SITEMAP_PATH.open("w", encoding="utf-8", newline="\n") as fh:
        fh.write(content)
    print(f"Wrote public/sitemap.xml ({url_count} URLs).")


if __name__ == "__main__":
    main()
