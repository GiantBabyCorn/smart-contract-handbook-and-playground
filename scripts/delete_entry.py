#!/usr/bin/env python3
"""Delete an existing standard or protocol entry (plan.md 8.0).

Usage:
    python scripts/delete_entry.py --slug erc777 [--dry-run]

Removes:
  1. Data file:   src/data/standards/<slug>.ts  or  src/data/protocols/<slug>.ts
  2. i18n files:  src/i18n/locales/{locale}/<slug>.json  (all 6 locales)
  3. Registry:
       standard, repo-sourced row (sourcePath set)  -> catalog.json row is KEPT,
                                                       published flipped to false
       standard, manual row (sourcePath: null)      -> catalog.json row deleted
       protocol                                     -> meta object removed from
                                                       src/data/protocolsMeta.ts
  4. Regenerates src/data/allMeta.ts + locales/{lng}/catalog.json +
     public/search/{lng}.json (gen_allmeta.py, gen_catalog_ns.py).

allMeta.ts is GENERATED — this script never edits it directly.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src" / "data"
I18N_DIR = ROOT / "src" / "i18n" / "locales"
CATALOG_PATH = DATA_DIR / "catalog.json"
PROTOCOLS_META = DATA_DIR / "protocolsMeta.ts"

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


def update_catalog(slug: str, dry_run: bool) -> bool:
    """Unpublish (repo-sourced) or hard-delete (manual) the catalog.json row."""
    rows: list[dict] = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    row = next((r for r in rows if r.get("slug") == slug), None)
    if row is None:
        return False

    if row.get("sourcePath"):
        # Repo-sourced ERC: the row must survive re-ingestion — just unpublish.
        action = "Would flip" if dry_run else "Flipped"
        row["published"] = False
        row.pop("siteCategory", None)
        print(f"  {action} catalog.json row '{slug}' to published: false (row kept)")
    else:
        # Manual / unofficial row: remove it entirely.
        action = "Would delete" if dry_run else "Deleted"
        rows = [r for r in rows if r.get("slug") != slug]
        print(f"  {action} manual catalog.json row '{slug}'")

    if not dry_run:
        with CATALOG_PATH.open("w", encoding="utf-8", newline="\n") as fh:
            json.dump(rows, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
    return True


def remove_from_protocols_meta(slug: str, dry_run: bool) -> bool:
    content = PROTOCOLS_META.read_text(encoding="utf-8")
    if f"slug: '{slug}'" not in content:
        return False

    pattern = re.compile(
        r"\n?\s*\{[^}]*slug:\s*'" + re.escape(slug) + r"'[^}]*\},?\n?",
        re.DOTALL,
    )
    new_content = pattern.sub("\n", content)

    if dry_run:
        print(f"  Would update protocolsMeta.ts (remove '{slug}' entry)")
    else:
        with PROTOCOLS_META.open("w", encoding="utf-8", newline="\n") as fh:
            fh.write(new_content)
        print(f"  Updated protocolsMeta.ts (removed '{slug}')")
    return True


def run_generators() -> None:
    for script in ("gen_allmeta.py", "gen_catalog_ns.py"):
        result = subprocess.run(
            [sys.executable, str(ROOT / "scripts" / script)],
            cwd=ROOT,
        )
        if result.returncode != 0:
            print(f"ERROR: {script} failed — fix and re-run it manually.", file=sys.stderr)
            sys.exit(result.returncode)


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

    # 3. Registry (catalog.json / protocolsMeta.ts)
    in_registry = update_catalog(slug, dry_run) | remove_from_protocols_meta(slug, dry_run)
    if not in_registry:
        print(f"  SKIP: '{slug}' not found in catalog.json or protocolsMeta.ts")

    print(f"\n{'Would delete' if dry_run else 'Deleted'} {len(deleted)} file(s).")
    if not deleted and not in_registry and not dry_run:
        print(f"WARNING: No files found for slug '{slug}'. Is the slug correct?", file=sys.stderr)
        sys.exit(1)

    # 4. Regenerate allMeta.ts + catalog namespace + search corpus
    if not dry_run:
        run_generators()
        print("\nRemaining manual steps:")
        print(f"  1. Remove '{slug}' from relatedSlugs in other entries' data files")
        print("  2. Run: python scripts/validate_registry.py && npx tsc -b")


if __name__ == "__main__":
    main()
