#!/usr/bin/env python3
"""Scan and sync missing i18n keys across locales.

Usage:
    python scripts/sync_translations.py          # Report only
    python scripts/sync_translations.py --fix     # Copy English values as placeholders

Compares all locale directories against en/ (source of truth) and reports
or fixes missing keys and files.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
I18N_DIR = ROOT / "src" / "i18n" / "locales"

LOCALES = ["en", "zh-CN", "zh-TW", "ja", "ko", "es"]


def flatten_keys(obj: dict, prefix: str = "") -> dict[str, object]:
    result: dict[str, object] = {}
    for key, value in obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            result.update(flatten_keys(value, full_key))
        else:
            result[full_key] = value
    return result


def unflatten_keys(flat: dict[str, object]) -> dict:
    result: dict = {}
    for key, value in sorted(flat.items()):
        parts = key.split(".")
        node = result
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = value
    return result


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Sync missing i18n keys across locales")
    p.add_argument("--fix", action="store_true", help="Copy English values as placeholders for missing keys")
    return p.parse_args()


def main() -> None:
    args = parse_args()
    en_dir = I18N_DIR / "en"

    if not en_dir.exists():
        print("ERROR: English locale directory not found", file=sys.stderr)
        sys.exit(1)

    en_files = sorted(f for f in en_dir.glob("*.json"))
    total_missing_keys = 0
    total_missing_files = 0
    total_fixed = 0

    print(f"Scanning {len(en_files)} namespace(s) across {len(LOCALES) - 1} locale(s)...\n")

    for locale in LOCALES:
        if locale == "en":
            continue

        locale_dir = I18N_DIR / locale
        if not locale_dir.exists():
            print(f"[{locale}] Directory missing!")
            if args.fix:
                locale_dir.mkdir(parents=True, exist_ok=True)
                print(f"  -> Created {locale}/")
            continue

        locale_missing_keys = 0
        for en_file in en_files:
            filename = en_file.name
            locale_file = locale_dir / filename

            en_data = json.loads(en_file.read_text(encoding="utf-8"))
            en_flat = flatten_keys(en_data)

            if not locale_file.exists():
                total_missing_files += 1
                print(f"[{locale}] Missing file: {filename} ({len(en_flat)} keys)")
                if args.fix:
                    locale_file.write_text(
                        json.dumps(en_data, indent=2, ensure_ascii=False) + "\n",
                        encoding="utf-8",
                    )
                    print(f"  -> Copied from en/{filename}")
                    total_fixed += len(en_flat)
                continue

            locale_data = json.loads(locale_file.read_text(encoding="utf-8"))
            locale_flat = flatten_keys(locale_data)

            missing = set(en_flat) - set(locale_flat)
            if missing:
                locale_missing_keys += len(missing)
                print(f"[{locale}/{filename}] Missing {len(missing)} key(s):")
                for key in sorted(missing):
                    print(f"    {key}")

                if args.fix:
                    for key in missing:
                        locale_flat[key] = en_flat[key]
                    merged = unflatten_keys(locale_flat)
                    locale_file.write_text(
                        json.dumps(merged, indent=2, ensure_ascii=False) + "\n",
                        encoding="utf-8",
                    )
                    print(f"  -> Fixed {len(missing)} key(s) in {locale}/{filename}")
                    total_fixed += len(missing)

        total_missing_keys += locale_missing_keys

    print(f"\nSummary:")
    print(f"  Missing files: {total_missing_files}")
    print(f"  Missing keys:  {total_missing_keys}")
    if args.fix:
        print(f"  Fixed:         {total_fixed} key(s)")

    if total_missing_keys > 0 or total_missing_files > 0:
        if not args.fix:
            print("\nRun with --fix to copy English values as placeholders.")
            sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
