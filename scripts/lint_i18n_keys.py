#!/usr/bin/env python3
"""Validate i18n key naming conventions and cross-locale consistency.

Checks:
  1. Every locale directory has the same set of JSON files as en/
  2. Every JSON file has the same key set across all locales (deep compare)
  3. Key naming follows conventions (no underscores except _one/_other, max 3 levels)
  4. No empty string values

Exit code 1 if any issues found.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
I18N_DIR = ROOT / "src" / "i18n" / "locales"

LOCALES = ["en", "zh-CN", "zh-TW", "ja", "ko", "es"]
PLURAL_SUFFIXES = {"_one", "_other", "_zero", "_two", "_few", "_many"}

# Keys under these prefixes may use deeper nesting (fn.xxx.params.yyy, sim.xxx.step.yyy)
# and underscores (matching Solidity function/param names like add_liquidity, min_dy)
DEEP_NESTING_PREFIXES = ("fn.", "sim.", "node.", "edge.")


def flatten_keys(obj: dict, prefix: str = "") -> dict[str, str]:
    """Flatten nested JSON into dot-separated keys."""
    result: dict[str, str] = {}
    for key, value in obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            result.update(flatten_keys(value, full_key))
        else:
            result[full_key] = value
    return result


def check_key_convention(key: str) -> list[str]:
    """Check a single key against naming conventions."""
    errors: list[str] = []
    parts = key.split(".")

    is_deep_key = any(key.startswith(p) for p in DEEP_NESTING_PREFIXES)

    # Max 5 nesting levels for fn/sim/node/edge keys, 3 for others
    max_levels = 5 if is_deep_key else 3
    if len(parts) > max_levels:
        errors.append(f"Key '{key}' exceeds max {max_levels} nesting levels ({len(parts)} levels)")

    # Skip underscore checks for fn/sim keys (Solidity names use underscores)
    if not is_deep_key:
        for part in parts:
            if "_" in part:
                has_valid_suffix = any(part.endswith(suffix) for suffix in PLURAL_SUFFIXES)
                if not has_valid_suffix:
                    errors.append(f"Key '{key}' contains underscore in part '{part}' (use camelCase)")

    # Skip SCREAMING_CASE check for fn/sim keys (Solidity names like DOMAIN_SEPARATOR)
    if not is_deep_key:
        for part in parts:
            if part.isupper() and len(part) > 1:
                errors.append(f"Key '{key}' contains SCREAMING_CASE part '{part}'")

    return errors


def main() -> None:
    errors: list[str] = []
    warnings: list[str] = []

    en_dir = I18N_DIR / "en"
    if not en_dir.exists():
        print("ERROR: English locale directory not found", file=sys.stderr)
        sys.exit(1)

    # Get the list of JSON files in en/
    en_files = sorted(f.name for f in en_dir.glob("*.json"))
    if not en_files:
        print("ERROR: No JSON files found in en/ locale", file=sys.stderr)
        sys.exit(1)

    print(f"Checking {len(en_files)} namespace(s) across {len(LOCALES)} locale(s)...\n")

    # Check 1: File consistency across locales
    for locale in LOCALES:
        locale_dir = I18N_DIR / locale
        if not locale_dir.exists():
            errors.append(f"Missing locale directory: {locale}/")
            continue

        locale_files = sorted(f.name for f in locale_dir.glob("*.json"))
        missing = set(en_files) - set(locale_files)
        extra = set(locale_files) - set(en_files)

        for f in sorted(missing):
            errors.append(f"[{locale}] Missing file: {f}")
        for f in sorted(extra):
            warnings.append(f"[{locale}] Extra file (not in en/): {f}")

    # Check 2 & 3 & 4: Key consistency, naming, empty values
    for filename in en_files:
        en_file = en_dir / filename
        try:
            en_data = json.loads(en_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            errors.append(f"[en/{filename}] Invalid JSON: {e}")
            continue

        en_keys = flatten_keys(en_data)

        # Check key naming conventions (only on en/ as reference)
        for key in en_keys:
            conv_errors = check_key_convention(key)
            errors.extend(f"[en/{filename}] {e}" for e in conv_errors)

        # Check for empty values in en/
        for key, value in en_keys.items():
            if isinstance(value, str) and value.strip() == "":
                errors.append(f"[en/{filename}] Empty value for key: {key}")

        # Compare with other locales
        for locale in LOCALES:
            if locale == "en":
                continue

            locale_file = I18N_DIR / locale / filename
            if not locale_file.exists():
                continue  # Already reported as missing file

            try:
                locale_data = json.loads(locale_file.read_text(encoding="utf-8"))
            except json.JSONDecodeError as e:
                errors.append(f"[{locale}/{filename}] Invalid JSON: {e}")
                continue

            locale_keys = flatten_keys(locale_data)

            missing_keys = set(en_keys) - set(locale_keys)
            extra_keys = set(locale_keys) - set(en_keys)

            for key in sorted(missing_keys):
                errors.append(f"[{locale}/{filename}] Missing key: {key}")
            for key in sorted(extra_keys):
                warnings.append(f"[{locale}/{filename}] Extra key (not in en/): {key}")

            # Check for empty values
            for key, value in locale_keys.items():
                if isinstance(value, str) and value.strip() == "":
                    errors.append(f"[{locale}/{filename}] Empty value for key: {key}")

    # Report
    if warnings:
        print(f"Warnings ({len(warnings)}):")
        for w in warnings:
            print(f"  ! {w}")
        print()

    if errors:
        print(f"Errors ({len(errors)}):")
        for e in errors:
            print(f"  x {e}")
        print(f"\nFailed with {len(errors)} error(s).")
        sys.exit(1)
    else:
        print("All checks passed.")
        sys.exit(0)


if __name__ == "__main__":
    main()
