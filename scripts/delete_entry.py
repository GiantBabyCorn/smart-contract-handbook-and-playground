#!/usr/bin/env python3
"""Delete an existing standard or protocol entry.

Usage:
    python scripts/delete_entry.py --slug erc777

Removes:
  1. Data file:  src/data/standards/<slug>.ts  or  src/data/protocols/<slug>.ts
  2. i18n files: src/i18n/locales/{locale}/<slug>.json  (all 6 locales)
  3. Registry entry from  src/data/allMeta.ts
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src" / "data"
I18N_DIR = ROOT / "src" / "i18n" / "locales"
ALL_META = DATA_DIR / "allMeta.ts"

LOCALES = ["en", "zh-CN", "zh-TW", "ja", "ko", "es"]


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Delete an ERC standard or protocol entry")
    p.add_argument("--slug", required=True, help="URL slug of the entry to delete")
    p.add_argument("--dry-run", action="store_true", help="Show what would be deleted without actually deleting")
    return p.parse_args()


def find_data_file(slug: str) -> Path | None:
    for subdir in ("standards", "protocols"):
        path = DATA_DIR / subdir / f"{slug}.ts"
        if path.exists():
            return path
    return None


def remove_from_all_meta(slug: str, dry_run: bool) -> bool:
    content = ALL_META.read_text(encoding="utf-8")
    if f"slug: '{slug}'" not in content:
        print(f"  SKIP: '{slug}' not found in allMeta.ts")
        return False

    # Remove the entry block: match from leading whitespace + { to },
    pattern = re.compile(
        r"\n?\s*\{[^}]*slug:\s*'" + re.escape(slug) + r"'[^}]*\},?\n?",
        re.DOTALL,
    )
    new_content = pattern.sub("\n", content)

    if dry_run:
        print(f"  Would update allMeta.ts (remove '{slug}' entry)")
    else:
        ALL_META.write_text(new_content, encoding="utf-8")
        print(f"  Updated allMeta.ts (removed '{slug}')")
    return True


def main() -> None:
    args = parse_args()
    slug = args.slug
    dry_run = args.dry_run
    deleted: list[str] = []
    action = "Would delete" if dry_run else "Deleted"

    print(f"\n{'[DRY RUN] ' if dry_run else ''}Deleting entry: {slug}\n")

    # 1. Data file
    data_file = find_data_file(slug)
    if data_file:
        if not dry_run:
            data_file.unlink()
        print(f"  {action}: {data_file.relative_to(ROOT)}")
        deleted.append(str(data_file.relative_to(ROOT)))
    else:
        print(f"  SKIP: No data file found for '{slug}'")

    # 2. i18n files
    for locale in LOCALES:
        i18n_file = I18N_DIR / locale / f"{slug}.json"
        if i18n_file.exists():
            if not dry_run:
                i18n_file.unlink()
            print(f"  {action}: {i18n_file.relative_to(ROOT)}")
            deleted.append(str(i18n_file.relative_to(ROOT)))

    # 3. allMeta.ts
    remove_from_all_meta(slug, dry_run)

    print(f"\n{'Would delete' if dry_run else 'Deleted'} {len(deleted)} file(s).")
    if not deleted and not dry_run:
        print(f"WARNING: No files found for slug '{slug}'. Is the slug correct?", file=sys.stderr)
        sys.exit(1)

    if not dry_run:
        print("\nRemaining manual steps:")
        print(f"  1. Remove '{slug}' from the ns[] array in src/i18n/config.ts")
        print(f"  2. Remove '{slug}' from relatedSlugs in other entries")
        print(f"  3. Run: npx tsc --noEmit")


if __name__ == "__main__":
    main()
