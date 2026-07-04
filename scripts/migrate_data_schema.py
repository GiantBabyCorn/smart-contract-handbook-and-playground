#!/usr/bin/env python3
"""Migrate data files when schema changes.

Schema history:
  v1 -> v2 (docs/adr/005-schema-v2-and-catalog-tiering.md): purely additive —
  every new field is optional, so existing entry files are already valid v2.
  There is nothing to migrate.

Since no transformation is needed yet, this tool currently offers a --check
mode only: it lints every entry data file for unknown top-level fields against
the allowlist derived from src/data/types.ts (catches typos like
`securityNotes:` and fields added to data files but never to the schema).

Usage:
  python scripts/migrate_data_schema.py            # print migration status
  python scripts/migrate_data_schema.py --check    # lint entry files (exit 1 on findings)
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src" / "data"
TYPES_FILE = DATA_DIR / "types.ts"

# Interfaces in types.ts whose properties make up an entry's top-level fields.
ENTRY_INTERFACES = [
    "ERCMeta", "ERCContent", "ERCFlow", "ERCSimulation",
    "BaseEntry", "StandardEntry", "ProtocolEntry",
]


def build_allowlist() -> set[str]:
    """Collect property names of the entry-level interfaces in types.ts."""
    content = TYPES_FILE.read_text(encoding="utf-8")
    allowed: set[str] = set()
    for name in ENTRY_INTERFACES:
        # Interface bodies end with a closing brace at column 0; nested object
        # types in types.ts are single-line, so the non-greedy match is safe.
        body_m = re.search(rf"interface {name}\b[^{{]*\{{(.*?)\n\}}", content, re.DOTALL)
        if not body_m:
            print(f"  ! interface {name} not found in {TYPES_FILE.relative_to(ROOT)}")
            continue
        allowed.update(re.findall(r"^ {2}(\w+)\??:", body_m.group(1), re.MULTILINE))
    return allowed


def top_level_fields(content: str) -> list[str]:
    """Top-level fields of the `export const entry = { ... }` object.

    Heuristic: Prettier keeps entry properties at exactly 2-space indent.
    Template-literal contents are stripped first so code inside future
    `codeExamples` cannot produce false positives.
    """
    content = re.sub(r"`[^`]*`", "``", content, flags=re.DOTALL)
    return re.findall(r"^ {2}(\w+):", content, re.MULTILINE)


def check() -> int:
    allowed = build_allowlist()
    files = sorted((DATA_DIR / "standards").glob("*.ts")) + sorted((DATA_DIR / "protocols").glob("*.ts"))
    issues = 0
    for path in files:
        for field in top_level_fields(path.read_text(encoding="utf-8")):
            if field not in allowed:
                print(f"  x {path.relative_to(ROOT)}: unknown top-level field '{field}'")
                issues += 1
    if issues:
        print(f"\n{issues} unknown field(s) — fix the typo or add the field to src/data/types.ts.")
        return 1
    print(f"Checked {len(files)} entry files against {len(allowed)} allowed fields: all known.")
    return 0


def main() -> None:
    if "--check" in sys.argv:
        sys.exit(check())
    print("Schema v2 is purely additive — nothing to migrate.")
    print("Run with --check to lint entry files for unknown top-level fields.")
    sys.exit(0)


if __name__ == "__main__":
    main()
