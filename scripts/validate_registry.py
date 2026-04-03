#!/usr/bin/env python3
"""Validate all data files conform to expected structure.

Checks:
  1. Every entry in allMeta.ts has a corresponding data file
  2. Every data file has a corresponding en/ i18n file
  3. officialUrl is non-empty
  4. Flow edge source/target reference valid node IDs
  5. i18n keys referenced in data files exist in en/ JSON

Exit code 1 if any issues found.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src" / "data"
I18N_EN_DIR = ROOT / "src" / "i18n" / "locales" / "en"
ALL_META = DATA_DIR / "allMeta.ts"


def parse_all_meta() -> list[dict]:
    """Parse allMeta.ts to extract slug, entryType, and officialUrl."""
    content = ALL_META.read_text(encoding="utf-8")
    entries = []

    blocks = re.findall(r"\{([^}]+)\}", content)
    for block in blocks:
        slug_m = re.search(r"slug:\s*'([^']+)'", block)
        type_m = re.search(r"entryType:\s*'([^']+)'", block)
        url_m = re.search(r"officialUrl:\s*'([^']*)'", block)
        if slug_m and type_m:
            entries.append({
                "slug": slug_m.group(1),
                "entryType": type_m.group(1),
                "officialUrl": url_m.group(1) if url_m else "",
            })
    return entries


def parse_data_file(path: Path) -> dict:
    """Extract flow nodes, edges, and i18n key references from a data file."""
    content = path.read_text(encoding="utf-8")

    # Parse node IDs from flowNodes array
    node_ids: set[str] = set()
    node_section = re.search(r"flowNodes:\s*\[(.*?)\],\s*\n\s*flowEdges", content, re.DOTALL)
    if node_section:
        node_ids = set(re.findall(r"id:\s*'([^']+)'", node_section.group(1)))

    # Parse edges from flowEdges array
    edges: list[dict] = []
    edge_section = re.search(r"flowEdges:\s*\[(.*?)\],\s*\n", content, re.DOTALL)
    if edge_section:
        edge_blocks = re.findall(r"\{([^}]+)\}", edge_section.group(1))
        for block in edge_blocks:
            source_m = re.search(r"source:\s*'([^']+)'", block)
            target_m = re.search(r"target:\s*'([^']+)'", block)
            edge_id_m = re.search(r"id:\s*'([^']+)'", block)
            if source_m and target_m:
                edges.append({
                    "id": edge_id_m.group(1) if edge_id_m else "unknown",
                    "source": source_m.group(1),
                    "target": target_m.group(1),
                })

    # Extract i18n key references (strings like slug.xxx.yyy)
    i18n_keys = re.findall(r"'([a-z][a-z0-9-]*\.[a-zA-Z][a-zA-Z0-9.]*)'", content)

    return {
        "node_ids": node_ids,
        "edges": edges,
        "i18n_keys": i18n_keys,
    }


def flatten_json_keys(obj: dict, prefix: str = "") -> set[str]:
    result: set[str] = set()
    for key, value in obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            result.update(flatten_json_keys(value, full_key))
        else:
            result.add(full_key)
    return result


def main() -> None:
    errors: list[str] = []

    entries = parse_all_meta()
    print(f"Found {len(entries)} entries in allMeta.ts\n")

    for entry in entries:
        slug = entry["slug"]
        entry_type = entry["entryType"]
        url = entry["officialUrl"]

        # Check 1: Data file exists
        subdir = "standards" if entry_type == "standard" else "protocols"
        data_file = DATA_DIR / subdir / f"{slug}.ts"
        if not data_file.exists():
            errors.append(f"[{slug}] Missing data file: {data_file.relative_to(ROOT)}")
            continue

        # Check 2: i18n file exists
        i18n_file = I18N_EN_DIR / f"{slug}.json"
        if not i18n_file.exists():
            errors.append(f"[{slug}] Missing i18n file: en/{slug}.json")

        # Check 3: officialUrl is non-empty
        if not url or url == f"https://example.com/{slug}":
            errors.append(f"[{slug}] officialUrl is empty or placeholder: '{url}'")

        # Check 4: Flow edge consistency
        data = parse_data_file(data_file)
        node_ids = data["node_ids"]
        for edge in data["edges"]:
            if edge["source"] not in node_ids:
                errors.append(f"[{slug}] Edge '{edge['id']}' source '{edge['source']}' references unknown node")
            if edge["target"] not in node_ids:
                errors.append(f"[{slug}] Edge '{edge['id']}' target '{edge['target']}' references unknown node")

        # Check 5: i18n key references exist in en/ JSON
        if i18n_file.exists():
            try:
                i18n_data = json.loads(i18n_file.read_text(encoding="utf-8"))
                available_keys = flatten_json_keys(i18n_data)
                prefixed_keys = {f"{slug}.{k}" for k in available_keys}

                for key in data["i18n_keys"]:
                    if key.startswith(f"{slug}.") and key not in prefixed_keys:
                        errors.append(f"[{slug}] i18n key '{key}' not found in en/{slug}.json")
            except json.JSONDecodeError as e:
                errors.append(f"[{slug}] Invalid JSON in en/{slug}.json: {e}")

    # Report
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
