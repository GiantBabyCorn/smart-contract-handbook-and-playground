#!/usr/bin/env python3
"""Scaffold a new standard or protocol entry (manual path; plan.md 8.0).

Usage:
    python scripts/scaffold_entry.py \\
        --slug erc777 \\
        --name "ERC-777" \\
        --category token \\
        --type standard \\
        --eip 777 [--tier A|B] [--unofficial] [--url https://...]

    python scripts/scaffold_entry.py \\
        --slug sushiswap \\
        --name "SushiSwap" \\
        --category defi \\
        --type protocol

Creates / updates:
  1. Data file:  src/data/standards/<slug>.ts  or  src/data/protocols/<slug>.ts
  2. i18n file:  src/i18n/locales/en/<slug>.json
  3. Registry:
       standard -> upserts the row in src/data/catalog.json
                   (published: true, tier, siteCategory; manual rows are
                   appended with sourcePath: null)
       protocol -> appends a meta object to src/data/protocolsMeta.ts
  4. Regenerates src/data/allMeta.ts (gen_allmeta.py) and the catalog
     namespace + search corpus (gen_catalog_ns.py).

Notes:
  - allMeta.ts is GENERATED — never edit it by hand.
  - Batch ingestion (scripts/ingest_ercs.py) is the bulk path; it preserves
    published/tier/siteCategory (and a manual specUrl) for known slugs, and
    carries manual rows (sourcePath: null, like the ones this script appends)
    forward verbatim across re-ingests.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src" / "data"
I18N_DIR = ROOT / "src" / "i18n" / "locales" / "en"
CATALOG_PATH = DATA_DIR / "catalog.json"
PROTOCOLS_META = DATA_DIR / "protocolsMeta.ts"

# Keep in sync with the category registry in src/data/categories.ts (and the
# Category union in src/data/types.ts) — Python cannot import the TS module.
VALID_CATEGORIES = [
    "token", "nft", "proxy", "defi", "account",
    "utility", "identity", "oracle", "governance",
    "cross-chain", "rwa",
]

_SLUG_NUM_RE = re.compile(r"^erc(\d+)([a-z]*)$")


def write_lf(path: Path, content: str) -> None:
    """Write text with LF line endings (Windows-safe; matches prettier endOfLine)."""
    with path.open("w", encoding="utf-8", newline="\n") as fh:
        fh.write(content)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Scaffold a new ERC standard or protocol entry")
    p.add_argument("--slug", required=True, help="URL slug, e.g. erc777 or sushiswap")
    p.add_argument("--name", required=True, help="Display name, e.g. 'ERC-777' or 'SushiSwap'")
    p.add_argument("--category", required=True, choices=VALID_CATEGORIES, help="Entry category")
    p.add_argument("--type", required=True, choices=["standard", "protocol"], dest="entry_type", help="standard or protocol")
    p.add_argument("--eip", type=int, default=None, help="EIP number (required for standards)")
    p.add_argument("--tier", choices=["A", "B"], default="A", help="Catalog tier (standards; default A for manual entries)")
    p.add_argument("--unofficial", action="store_true", help="De-facto standard without an official EIP document")
    p.add_argument("--url", default=None, help="Official specification/docs URL")
    p.add_argument("--sort-order", type=int, default=None, help="Sort order (protocols only; auto-calculated if omitted)")
    p.add_argument("--force", action="store_true", help="Overwrite existing files")
    return p.parse_args()


def protocol_sort_order() -> int:
    """Highest sortOrder in protocolsMeta.ts + 100."""
    content = PROTOCOLS_META.read_text(encoding="utf-8")
    orders = [int(m) for m in re.findall(r"sortOrder:\s*(\d+)", content)]
    return max(orders, default=2200) + 100


def default_url(entry_type: str, slug: str, eip: int | None) -> str:
    if entry_type == "standard" and eip is not None:
        return f"https://eips.ethereum.org/EIPS/eip-{eip}"
    return f"https://example.com/{slug}"


def generate_data_file(args: argparse.Namespace, sort_order: int, url: str) -> str:
    """Generate the TypeScript data file content."""
    if args.entry_type == "standard":
        type_import = "StandardEntry"
        eip_line = f"\n  eipNumber: {args.eip},"
        extra = ""
    else:
        type_import = "ProtocolEntry"
        eip_line = ""
        extra = "\n\n  contracts: [],"

    return textwrap.dedent(f"""\
        import type {{ {type_import} }} from '../types';

        export const entry: {type_import} = {{
          // ─── ERCMeta ───
          slug: '{args.slug}',
          name: '{args.name}',
          shortDescription: '{args.slug}.short',
          category: '{args.category}',
          entryType: '{args.entry_type}',{eip_line}
          officialUrl: '{url}',
          relatedSlugs: [],
          sortOrder: {sort_order},

          // ─── ERCContent ───
          introduction: '{args.slug}.introduction',
          designPurpose: '{args.slug}.designPurpose',
          commonUsage: '{args.slug}.commonUsage',

          functions: [
            // TODO: Add functions
            // {{
            //   name: 'exampleFunction',
            //   signature: 'exampleFunction(address to, uint256 amount) → bool',
            //   type: 'write',
            //   params: [
            //     {{ name: 'to', type: 'address', description: '{args.slug}.fn.exampleFunction.params.to' }},
            //     {{ name: 'amount', type: 'uint256', description: '{args.slug}.fn.exampleFunction.params.amount' }},
            //   ],
            //   returns: [{{ name: 'success', type: 'bool', description: '{args.slug}.fn.exampleFunction.returns.success' }}],
            //   description: '{args.slug}.fn.exampleFunction.desc',
            //   defaultSimValues: {{ to: '0xRecipient', amount: '1000000000000000000' }},
            // }},
          ],

          // ─── ERCFlow ───
          flowNodes: [
            // TODO: Add flow diagram nodes
            // {{
            //   id: 'user',
            //   type: 'user',
            //   label: '{args.slug}.node.user',
            //   data: {{ address: '0xUser', balance: '0' }},
            //   layoutHint: 'source',
            // }},
            // {{
            //   id: 'contract',
            //   type: 'contract',
            //   label: '{args.slug}.node.contract',
            //   data: {{ functions: [] }},
            //   layoutHint: 'center',
            // }},
          ],

          flowEdges: [
            // TODO: Add flow diagram edges
            // {{
            //   id: 'e-user-contract',
            //   source: 'user',
            //   target: 'contract',
            //   type: 'animated',
            //   label: '{args.slug}.edge.callFunction',
            // }},
          ],

          elkLayoutOptions: {{
            'elk.algorithm': 'layered',
            'elk.direction': 'RIGHT',
            'elk.layered.spacing.nodeNodeBetweenLayers': '80',
            'elk.spacing.nodeNode': '40',
          }},

          // ─── ERCSimulation ───
          simulations: [
            // TODO: Add simulation scenarios
            // {{
            //   id: 'basic-scenario',
            //   name: '{args.slug}.sim.basicScenario.name',
            //   description: '{args.slug}.sim.basicScenario.desc',
            //   params: [
            //     {{ id: 'amount', label: '{args.slug}.sim.basicScenario.param.amount', type: 'uint256', defaultValue: '1000000000000000000' }},
            //   ],
            //   steps: [
            //     {{
            //       id: 'step-1',
            //       description: '{args.slug}.sim.basicScenario.step.step1',
            //       highlightNodes: ['user', 'contract'],
            //       highlightEdges: ['e-user-contract'],
            //       durationMs: 1200,
            //     }},
            //   ],
            // }},
          ],{extra}
        }};
    """)


def generate_i18n_file(args: argparse.Namespace) -> dict:
    """Generate the i18n JSON content with TODO placeholders."""
    return {
        "short": f"TODO: Short description for {args.name}",
        "introduction": f"TODO: Introduction for {args.name}. Explain what this {'standard' if args.entry_type == 'standard' else 'protocol'} does and why it matters.",
        "designPurpose": f"TODO: Design purpose for {args.name}. Explain the problem it solves and the design decisions behind it.",
        "commonUsage": f"TODO: Common usage for {args.name}. Describe typical use cases and integrations.",
    }


def catalog_sort_key(row: dict) -> tuple:
    m = _SLUG_NUM_RE.match(row["slug"])
    if m:
        return (int(m.group(1)), m.group(2))
    return (10**9, row["slug"])


def upsert_catalog_row(args: argparse.Namespace, url: str | None) -> None:
    """Mark an existing catalog row published or append a manual row."""
    rows: list[dict] = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    row = next((r for r in rows if r.get("slug") == args.slug), None)

    if row is not None:
        if args.eip is not None and row.get("eip") not in (None, args.eip):
            print(
                f"ERROR: catalog.json row '{args.slug}' has eip {row.get('eip')},"
                f" but --eip {args.eip} was passed.",
                file=sys.stderr,
            )
            sys.exit(1)
        already = row.get("published") is True
        row["published"] = True
        row["tier"] = args.tier
        row["siteCategory"] = args.category
        if url and row.get("sourcePath") is None:
            row["specUrl"] = url
        verb = "already published — refreshed tier/siteCategory" if already else "published"
        print(f"  catalog.json: row '{args.slug}' {verb}")
    else:
        rows.append({
            "eip": args.eip,
            "slug": args.slug,
            "title": args.name,
            "status": None,
            "category": None,
            "requires": [],
            "inDegree": 0,
            "included": True,
            "tier": args.tier,
            "existing": False,
            "unofficial": bool(args.unofficial),
            "published": True,
            "sourcePath": None,
            "specUrl": url or default_url("standard", args.slug, args.eip),
            "sourceNote": "Manually scaffolded entry (scripts/scaffold_entry.py).",
            "siteCategory": args.category,
        })
        rows.sort(key=catalog_sort_key)
        print(f"  catalog.json: appended manual row '{args.slug}' (published: true)")

    with CATALOG_PATH.open("w", encoding="utf-8", newline="\n") as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=2)
        fh.write("\n")


def append_to_protocols_meta(args: argparse.Namespace, sort_order: int, url: str) -> None:
    """Append a new protocol meta object to protocolsMeta.ts before the closing bracket."""
    content = PROTOCOLS_META.read_text(encoding="utf-8")

    if f"slug: '{args.slug}'" in content:
        print(f"  protocolsMeta.ts already contains slug '{args.slug}', skipping.")
        return

    new_entry = "\n".join([
        "  {",
        f"    slug: '{args.slug}',",
        f"    name: '{args.name}',",
        f"    shortDescription: '{args.slug}.short',",
        f"    category: '{args.category}',",
        "    entryType: 'protocol',",
        f"    officialUrl: '{url}',",
        f"    sortOrder: {sort_order},",
        "  },",
    ])

    content = content.rstrip()
    if content.endswith("];"):
        content = content[:-2].rstrip() + "\n" + new_entry + "\n];\n"
    else:
        print("  WARNING: Could not find closing ']; ' in protocolsMeta.ts. Please add entry manually.")
        return

    write_lf(PROTOCOLS_META, content)
    print(f"  Updated protocolsMeta.ts with '{args.slug}'")


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

    # Validate
    if args.entry_type == "standard" and args.eip is None:
        print("ERROR: --eip is required for standards.", file=sys.stderr)
        sys.exit(1)

    if args.entry_type == "standard":
        # Meta sortOrder for non-curated standards is 10000 + eip (gen_allmeta.py);
        # keep the data file in lockstep.
        sort_order = 10000 + args.eip
    else:
        sort_order = args.sort_order if args.sort_order is not None else protocol_sort_order()
    url = args.url or default_url(args.entry_type, args.slug, args.eip)

    subdir = "standards" if args.entry_type == "standard" else "protocols"
    data_file = DATA_DIR / subdir / f"{args.slug}.ts"
    i18n_file = I18N_DIR / f"{args.slug}.json"

    print(f"\nScaffolding {args.entry_type}: {args.name} ({args.slug})")
    print(f"  Category: {args.category}")
    print(f"  Sort order: {sort_order}")
    print()

    # 1. Data file
    if data_file.exists() and not args.force:
        print(f"  SKIP: {data_file.relative_to(ROOT)} already exists (use --force to overwrite)")
    else:
        data_file.parent.mkdir(parents=True, exist_ok=True)
        write_lf(data_file, generate_data_file(args, sort_order, url))
        print(f"  Created {data_file.relative_to(ROOT)}")

    # 2. i18n file
    if i18n_file.exists() and not args.force:
        print(f"  SKIP: {i18n_file.relative_to(ROOT)} already exists (use --force to overwrite)")
    else:
        i18n_file.parent.mkdir(parents=True, exist_ok=True)
        write_lf(i18n_file, json.dumps(generate_i18n_file(args), indent=2, ensure_ascii=False) + "\n")
        print(f"  Created {i18n_file.relative_to(ROOT)}")

    # 3. Registry (catalog.json for standards / protocolsMeta.ts for protocols)
    if args.entry_type == "standard":
        upsert_catalog_row(args, args.url)
    else:
        append_to_protocols_meta(args, sort_order, url)

    # 4. Regenerate allMeta.ts + catalog namespace + search corpus
    run_generators()

    print()
    print("Next steps:")
    print(f"  1. Fill in functions, flowNodes, flowEdges, simulations in {data_file.relative_to(ROOT)}")
    print(f"  2. Replace the TODO strings in {i18n_file.relative_to(ROOT)}, then run:")
    print("     python scripts/sync_translations.py --fix   (other locales)")
    print("     python scripts/gen_catalog_ns.py            (refresh catalog ns + search corpus)")
    print("  3. Run: python scripts/validate_registry.py")
    print()


if __name__ == "__main__":
    main()
