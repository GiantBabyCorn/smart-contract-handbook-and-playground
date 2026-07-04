#!/usr/bin/env python3
"""Validate all data files conform to expected structure.

Checks:
  1. Every entry in allMeta.ts has a corresponding data file
  2. Every data file has a corresponding en/ i18n file
  3. officialUrl is non-empty
  4. Flow edge source/target reference valid node IDs
  5. i18n keys referenced in data files exist in en/ JSON
  6. relatedSlugs (in allMeta.ts and in data files) reference existing slugs
  7. allMeta.ts and data file agree on relatedSlugs (WARN only, does not fail)
  8. Schema v2 fields, when present, are well-formed:
     eipStatus / tier values, references[].url is https, relations[].slug exists,
     simulation scenario kind / compute.kind in allowed sets
  9. --strict-tier-a: every tier 'A' entry has >=2 simulations and >=1 revert path
     (a scenario with kind 'revert' or a step with isRevert) — default OFF

Exit code 1 if any errors found (warnings never affect the exit code).
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
# allMeta.ts is generated (gen_allmeta.py) and merges protocolsMeta via a
# `...protocolsMeta` spread, so protocol meta blocks live in this file:
PROTOCOLS_META = DATA_DIR / "protocolsMeta.ts"

# Allowed values for schema v2 fields (mirror src/data/types.ts)
EIP_STATUSES = {"Draft", "Review", "Last Call", "Final", "Stagnant", "Withdrawn"}
TIERS = {"A", "B"}
SCENARIO_KINDS = {"happy", "revert", "attack"}
COMPUTE_KINDS = {"swap", "interest", "cdp", "stableswap", "rebase", "tokenTransfer"}


def parse_related_slugs(text: str) -> list[str] | None:
    """Extract the relatedSlugs array from a meta block or data file.

    Returns None when the key is absent (generated meta omits it on purpose —
    see gen_allmeta.py), so callers can distinguish "not declared" from "[]".
    """
    m = re.search(r"relatedSlugs:\s*\[([^\]]*)\]", text)
    if not m:
        return None
    return re.findall(r"'([^']+)'", m.group(1))


def parse_all_meta() -> list[dict]:
    """Parse allMeta.ts (+ spread protocolsMeta.ts) for slug/entryType/url/v2 metadata."""
    content = ALL_META.read_text(encoding="utf-8")
    if PROTOCOLS_META.exists():
        content += "\n" + PROTOCOLS_META.read_text(encoding="utf-8")
    entries = []

    blocks = re.findall(r"\{([^}]+)\}", content)
    for block in blocks:
        slug_m = re.search(r"slug:\s*'([^']+)'", block)
        type_m = re.search(r"entryType:\s*'([^']+)'", block)
        url_m = re.search(r"officialUrl:\s*'([^']*)'", block)
        status_m = re.search(r"eipStatus:\s*'([^']+)'", block)
        tier_m = re.search(r"\btier:\s*'([^']+)'", block)
        if slug_m and type_m:
            entries.append({
                "slug": slug_m.group(1),
                "entryType": type_m.group(1),
                "officialUrl": url_m.group(1) if url_m else "",
                "relatedSlugs": parse_related_slugs(block),
                "eipStatus": status_m.group(1) if status_m else None,
                "tier": tier_m.group(1) if tier_m else None,
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

    # ─── Schema v2 fields (all optional — absence yields empty/None values) ───
    status_m = re.search(r"eipStatus:\s*'([^']+)'", content)
    tier_m = re.search(r"\btier:\s*'([^']+)'", content)

    # references: [...] — flat objects, so non-greedy up to the closing "],"
    reference_urls: list[str] = []
    ref_section = re.search(r"references:\s*\[(.*?)\],\s*\n", content, re.DOTALL)
    if ref_section:
        reference_urls = re.findall(r"url:\s*'([^']*)'", ref_section.group(1))

    # relations: [...] — flat { slug, kind } objects
    relation_slugs: list[str] = []
    rel_section = re.search(r"relations:\s*\[(.*?)\],\s*\n", content, re.DOTALL)
    if rel_section:
        relation_slugs = re.findall(r"slug:\s*'([^']+)'", rel_section.group(1))

    # simulations tail: from "simulations: [" to EOF. By file convention only the
    # simulations array (and, for protocols, contracts/addresses — which contain no
    # kind/steps/isRevert keys) follows, so scoped regexes below are safe.
    scenario_count = 0
    sim_kinds: list[str] = []
    has_revert_step = False
    sim_match = re.search(r"simulations:\s*\[", content)
    if sim_match:
        sim_tail = content[sim_match.start():]
        scenario_count = len(re.findall(r"steps:\s*\[", sim_tail))
        sim_kinds = re.findall(r"kind:\s*'([^']+)'", sim_tail)
        has_revert_step = bool(re.search(r"isRevert:\s*true", sim_tail))

    return {
        "node_ids": node_ids,
        "edges": edges,
        "i18n_keys": i18n_keys,
        "relatedSlugs": parse_related_slugs(content),
        "eipStatus": status_m.group(1) if status_m else None,
        "tier": tier_m.group(1) if tier_m else None,
        "reference_urls": reference_urls,
        "relation_slugs": relation_slugs,
        "scenario_count": scenario_count,
        "sim_kinds": sim_kinds,
        "has_revert_step": has_revert_step,
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
    warnings: list[str] = []
    strict_tier_a = "--strict-tier-a" in sys.argv

    entries = parse_all_meta()
    known_slugs = {e["slug"] for e in entries}
    mode = " [--strict-tier-a]" if strict_tier_a else ""
    print(f"Found {len(entries)} entries in allMeta.ts{mode}\n")

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

        # Check 6: relatedSlugs reference existing slugs (allMeta.ts and data file)
        data_rel = data_file.relative_to(ROOT)
        for rs in entry["relatedSlugs"] or []:
            if rs not in known_slugs:
                errors.append(f"[{slug}] allMeta.ts relatedSlug '{rs}' does not reference an existing slug")
        for rs in data["relatedSlugs"] or []:
            if rs not in known_slugs:
                errors.append(f"[{slug}] {data_rel} relatedSlug '{rs}' does not reference an existing slug")

        # Check 7: allMeta.ts <-> data file relatedSlugs consistency (warning only).
        # Skipped when the meta omits relatedSlugs entirely (generated meta drops
        # the unconsumed field; the data file is the single source for it).
        meta_set = set(entry["relatedSlugs"]) if entry["relatedSlugs"] is not None else None
        data_set = set(data["relatedSlugs"] or [])
        if meta_set is not None and meta_set != data_set:
            only_meta = ", ".join(sorted(meta_set - data_set)) or "-"
            only_data = ", ".join(sorted(data_set - meta_set)) or "-"
            warnings.append(
                f"[{slug}] relatedSlugs drift between allMeta.ts and {data_rel}"
                f" (only in meta: {only_meta}; only in data: {only_data})"
            )

        # Check 8: schema v2 field values, only when present
        for source, status, tier in (
            ("allMeta.ts", entry["eipStatus"], entry["tier"]),
            (str(data_rel), data["eipStatus"], data["tier"]),
        ):
            if status is not None and status not in EIP_STATUSES:
                errors.append(f"[{slug}] {source} eipStatus '{status}' not in {sorted(EIP_STATUSES)}")
            if tier is not None and tier not in TIERS:
                errors.append(f"[{slug}] {source} tier '{tier}' not in {sorted(TIERS)}")
        for url in data["reference_urls"]:
            if not url.startswith("https://"):
                errors.append(f"[{slug}] references url '{url}' must start with https://")
        for rel_slug in data["relation_slugs"]:
            if rel_slug not in known_slugs:
                errors.append(f"[{slug}] relations slug '{rel_slug}' does not reference an existing slug")
        for kind in data["sim_kinds"]:
            if kind not in SCENARIO_KINDS and kind not in COMPUTE_KINDS:
                errors.append(
                    f"[{slug}] simulation kind '{kind}' not in scenario kinds"
                    f" {sorted(SCENARIO_KINDS)} or compute kinds {sorted(COMPUTE_KINDS)}"
                )

        # Check 9: tier A content gate (only with --strict-tier-a)
        if strict_tier_a and (data["tier"] or entry["tier"]) == "A":
            if data["scenario_count"] < 2:
                errors.append(f"[{slug}] tier A requires >=2 simulation scenarios (found {data['scenario_count']})")
            if "revert" not in data["sim_kinds"] and not data["has_revert_step"]:
                errors.append(f"[{slug}] tier A requires a revert path (scenario kind 'revert' or a step with isRevert)")

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
        suffix = f" ({len(warnings)} warning(s))" if warnings else ""
        print(f"All checks passed.{suffix}")
        sys.exit(0)


if __name__ == "__main__":
    main()
