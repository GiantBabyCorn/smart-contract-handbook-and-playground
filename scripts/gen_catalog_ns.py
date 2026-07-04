#!/usr/bin/env python3
"""Generate the per-locale catalog namespace + the static search corpus (plan.md 8.0).

Outputs (all fully generated — do not edit by hand):
  1. src/i18n/locales/{lng}/catalog.json
       Flat { "<slug>.short": "<translated short description>" } for every
       PUBLISHED entry (standards + protocols). Loaded as a resident i18next
       namespace so list surfaces (Sidebar, /catalog) render short descriptions
       without lazy-loading one namespace per entry.
  2. public/search/{lng}.json
       Search corpus fetched lazily by the client on first search interaction:
       [{ slug, name, eip, short, fns, category, entryType }] — fns are the
       function/param identifiers extracted from the entry data file via the
       regex  name: '([A-Za-z0-9_]+)'  (dotted i18n keys never match).

Inputs
  - src/data/allMeta.ts + src/data/protocolsMeta.ts  (published meta; run
    scripts/gen_allmeta.py first)
  - src/data/catalog.json                            (EIP numbers)
  - src/i18n/locales/{lng}/{slug}.json               ('short' values; falls back
    to en with a warning when a locale is missing one)
  - src/data/{standards,protocols}/{slug}.ts         (fns extraction)

Usage
    python scripts/gen_catalog_ns.py [--check]

    --check   Exit 1 if any output on disk differs (CI drift guard). No writes.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src" / "data"
I18N_DIR = ROOT / "src" / "i18n" / "locales"
SEARCH_DIR = ROOT / "public" / "search"
CATALOG_PATH = DATA_DIR / "catalog.json"

LOCALES = ["en", "zh-CN", "zh-TW", "ja", "ko", "es"]
FN_NAME_RE = re.compile(r"name: '([A-Za-z0-9_]+)'")


def parse_meta_blocks(path: Path) -> list[dict]:
    """Extract { slug, name, category, entryType } object literals from a meta TS file."""
    content = path.read_text(encoding="utf-8")
    entries = []
    for block in re.findall(r"\{([^}]+)\}", content):
        slug_m = re.search(r"slug:\s*'([^']+)'", block)
        name_m = re.search(r"name:\s*'((?:[^'\\]|\\.)*)'", block)
        cat_m = re.search(r"category:\s*'([^']+)'", block)
        type_m = re.search(r"entryType:\s*'([^']+)'", block)
        if slug_m and name_m and type_m:
            entries.append(
                {
                    "slug": slug_m.group(1),
                    "name": name_m.group(1).replace("\\'", "'"),
                    "category": cat_m.group(1) if cat_m else "utility",
                    "entryType": type_m.group(1),
                }
            )
    return entries


def load_published_meta() -> list[dict]:
    """Published meta = generated allMeta.ts standards + protocolsMeta.ts protocols."""
    metas: dict[str, dict] = {}
    for filename in ("allMeta.ts", "protocolsMeta.ts"):
        path = DATA_DIR / filename
        if not path.exists():
            print(f"ERROR: {path} not found — run scripts/gen_allmeta.py first.", file=sys.stderr)
            sys.exit(1)
        for meta in parse_meta_blocks(path):
            metas[meta["slug"]] = meta
    return sorted(metas.values(), key=lambda m: m["slug"])


def extract_fns(slug: str, entry_type: str) -> list[str]:
    subdir = "standards" if entry_type == "standard" else "protocols"
    path = DATA_DIR / subdir / f"{slug}.ts"
    if not path.exists():
        return []
    seen: list[str] = []
    for match in FN_NAME_RE.findall(path.read_text(encoding="utf-8")):
        if match not in seen:
            seen.append(match)
    return seen


def load_short(lng: str, slug: str, warnings: list[str]) -> str:
    """Read the 'short' value for slug in lng, falling back to en."""
    for candidate in ([lng, "en"] if lng != "en" else ["en"]):
        path = I18N_DIR / candidate / f"{slug}.json"
        if not path.exists():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        short = data.get("short")
        if isinstance(short, str) and short.strip():
            if candidate != lng:
                warnings.append(f"[{lng}/{slug}] missing 'short' — fell back to en")
            return short
    warnings.append(f"[{lng}/{slug}] no 'short' found in {lng} or en")
    return slug  # never emit an empty value (lint_i18n_keys rejects those)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate locales/{lng}/catalog.json + public/search/{lng}.json"
    )
    parser.add_argument("--check", action="store_true", help="fail if outputs are stale")
    args = parser.parse_args()

    metas = load_published_meta()
    eip_by_slug = {
        row["slug"]: row.get("eip")
        for row in json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    }
    fns_by_slug = {m["slug"]: extract_fns(m["slug"], m["entryType"]) for m in metas}

    warnings: list[str] = []
    outputs: dict[Path, str] = {}

    for lng in LOCALES:
        ns = {f"{m['slug']}.short": load_short(lng, m["slug"], warnings) for m in metas}
        outputs[I18N_DIR / lng / "catalog.json"] = (
            json.dumps(dict(sorted(ns.items())), indent=2, ensure_ascii=False) + "\n"
        )

        corpus = [
            {
                "slug": m["slug"],
                "name": m["name"],
                "eip": eip_by_slug.get(m["slug"]),
                "short": ns[f"{m['slug']}.short"],
                "fns": fns_by_slug[m["slug"]],
                "category": m["category"],
                "entryType": m["entryType"],
            }
            for m in metas
        ]
        outputs[SEARCH_DIR / f"{lng}.json"] = (
            json.dumps(corpus, ensure_ascii=False, separators=(",", ":")) + "\n"
        )

    for warning in warnings:
        print(f"  ! {warning}")

    if args.check:
        stale = [
            path
            for path, content in outputs.items()
            if not path.exists() or path.read_text(encoding="utf-8") != content
        ]
        if stale:
            for path in stale:
                print(f"stale: {path.relative_to(ROOT)}", file=sys.stderr)
            print("Run: python scripts/gen_catalog_ns.py", file=sys.stderr)
            sys.exit(1)
        print(f"All {len(outputs)} generated files up to date ({len(metas)} published entries).")
        return

    SEARCH_DIR.mkdir(parents=True, exist_ok=True)
    for path, content in outputs.items():
        path.write_text(content, encoding="utf-8")

    sizes = {
        lng: (SEARCH_DIR / f"{lng}.json").stat().st_size for lng in LOCALES
    }
    print(f"Wrote {len(LOCALES)} catalog namespaces + {len(LOCALES)} search corpora")
    print(f"  published entries: {len(metas)}")
    print("  corpus bytes: " + ", ".join(f"{lng}={size}" for lng, size in sizes.items()))


if __name__ == "__main__":
    main()
