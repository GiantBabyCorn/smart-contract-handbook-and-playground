#!/usr/bin/env python3
"""Publish-flip for a content batch (plan.md §8.2 stage 4).

For each slug given, this:
  1. Reads the authored data file `src/data/standards/<slug>.ts` to extract its
     `category` (the author's choice is the source of truth for display grouping).
  2. Sets `published: true` in the matching `src/data/catalog.json` row and copies
     the category into the row's `siteCategory` field (consumed by gen_allmeta.py).
  3. Flips `published: false` -> `published: true` in the data file so it mirrors
     the catalog row.

It does NOT run the generators or gates — the batch lead does that next
(gen_allmeta -> gen_catalog_ns -> validate). Idempotent: re-running is a no-op.

Usage:
  python scripts/publish_batch.py erc55 erc681 erc1046 ...
  python scripts/publish_batch.py --unpublish erc55        # revert (drop handling)
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "src" / "data" / "catalog.json"
STANDARDS = ROOT / "src" / "data" / "standards"

VALID_CATEGORIES = {
    "token", "nft", "proxy", "defi", "account", "utility",
    "identity", "oracle", "governance", "cross-chain", "rwa",
}


def extract_category(ts: str, slug: str) -> str:
    m = re.search(r"category:\s*'([^']+)'", ts)
    if not m:
        sys.exit(f"ERROR: no category field found in {slug}.ts")
    cat = m.group(1)
    if cat not in VALID_CATEGORIES:
        sys.exit(f"ERROR: {slug}.ts has invalid category '{cat}'")
    return cat


def set_data_published(ts: str, value: bool) -> str:
    """Flip the first `published: <bool>` occurrence in the data file."""
    new, n = re.subn(
        r"(published:\s*)(true|false)",
        lambda m: m.group(1) + ("true" if value else "false"),
        ts,
        count=1,
    )
    if n == 0:
        sys.exit("ERROR: no `published:` field found in data file")
    return new


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("slugs", nargs="+", help="entry slugs, e.g. erc55")
    ap.add_argument("--unpublish", action="store_true", help="revert to unpublished")
    args = ap.parse_args()

    publish = not args.unpublish
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    by_slug = {r["slug"]: r for r in catalog}

    changed = []
    for slug in args.slugs:
        row = by_slug.get(slug)
        if row is None:
            sys.exit(f"ERROR: {slug} not found in catalog.json")
        data_path = STANDARDS / f"{slug}.ts"
        if not data_path.exists():
            sys.exit(f"ERROR: {data_path} missing (author it before publishing)")
        ts = data_path.read_text(encoding="utf-8")

        if publish:
            row["published"] = True
            row["siteCategory"] = extract_category(ts, slug)
        else:
            row["published"] = False
            row.pop("siteCategory", None)

        data_path.write_text(set_data_published(ts, publish), encoding="utf-8")
        changed.append(slug)

    CATALOG.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    verb = "published" if publish else "unpublished"
    print(f"{verb} {len(changed)} entr{'y' if len(changed) == 1 else 'ies'}: {', '.join(changed)}")


if __name__ == "__main__":
    main()
