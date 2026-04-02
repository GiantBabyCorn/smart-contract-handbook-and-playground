#!/usr/bin/env python3
"""Scaffold a new standard or protocol entry.

Usage:
    python scripts/scaffold_entry.py \\
        --slug erc777 \\
        --name "ERC-777" \\
        --category token \\
        --type standard \\
        --eip 777

    python scripts/scaffold_entry.py \\
        --slug sushiswap \\
        --name "SushiSwap" \\
        --category defi \\
        --type protocol

Creates:
  1. Data file:  src/data/standards/<slug>.ts  or  src/data/protocols/<slug>.ts
  2. i18n file:  src/i18n/locales/en/<slug>.json
  3. Appends metadata entry to  src/data/allMeta.ts
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src" / "data"
I18N_DIR = ROOT / "src" / "i18n" / "locales" / "en"
ALL_META = DATA_DIR / "allMeta.ts"

VALID_CATEGORIES = [
    "token", "nft", "proxy", "defi", "account",
    "utility", "identity", "oracle", "governance",
    "cross-chain", "rwa",
]


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Scaffold a new ERC standard or protocol entry")
    p.add_argument("--slug", required=True, help="URL slug, e.g. erc777 or sushiswap")
    p.add_argument("--name", required=True, help="Display name, e.g. 'ERC-777' or 'SushiSwap'")
    p.add_argument("--category", required=True, choices=VALID_CATEGORIES, help="Entry category")
    p.add_argument("--type", required=True, choices=["standard", "protocol"], dest="entry_type", help="standard or protocol")
    p.add_argument("--eip", type=int, default=None, help="EIP number (required for standards)")
    p.add_argument("--url", default=None, help="Official specification/docs URL")
    p.add_argument("--sort-order", type=int, default=None, help="Sort order (auto-calculated if omitted)")
    p.add_argument("--force", action="store_true", help="Overwrite existing files")
    return p.parse_args()


def compute_sort_order() -> int:
    """Find the highest sortOrder in allMeta.ts and add 100."""
    content = ALL_META.read_text(encoding="utf-8")
    orders = [int(m) for m in re.findall(r"sortOrder:\s*(\d+)", content)]
    return max(orders, default=0) + 100


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


def append_to_all_meta(args: argparse.Namespace, sort_order: int, url: str) -> None:
    """Append a new entry to allMeta.ts before the closing bracket."""
    content = ALL_META.read_text(encoding="utf-8")

    # Check if slug already exists
    if f"slug: '{args.slug}'" in content:
        print(f"  allMeta.ts already contains slug '{args.slug}', skipping.")
        return

    eip_fields = ""
    if args.entry_type == "standard" and args.eip is not None:
        eip_fields = f"\n    eipNumber: {args.eip},"

    new_entry = textwrap.dedent(f"""\
      {{
        slug: '{args.slug}',
        name: '{args.name}',
        shortDescription: '{args.slug}.short',
        category: '{args.category}',
        entryType: '{args.entry_type}',{eip_fields}
        officialUrl: '{url}',
        relatedSlugs: [],
        sortOrder: {sort_order},
      }},""")

    # Insert before the closing `];`
    content = content.rstrip()
    if content.endswith("];"):
        content = content[:-2].rstrip() + "\n  " + new_entry + "\n];\n"
    else:
        print("  WARNING: Could not find closing ']; ' in allMeta.ts. Please add entry manually.")
        return

    ALL_META.write_text(content, encoding="utf-8")
    print(f"  Updated allMeta.ts with '{args.slug}'")


def main() -> None:
    args = parse_args()

    # Validate
    if args.entry_type == "standard" and args.eip is None:
        print("ERROR: --eip is required for standards.", file=sys.stderr)
        sys.exit(1)

    sort_order = args.sort_order if args.sort_order is not None else compute_sort_order()
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
        data_file.write_text(generate_data_file(args, sort_order, url), encoding="utf-8")
        print(f"  Created {data_file.relative_to(ROOT)}")

    # 2. i18n file
    if i18n_file.exists() and not args.force:
        print(f"  SKIP: {i18n_file.relative_to(ROOT)} already exists (use --force to overwrite)")
    else:
        i18n_file.parent.mkdir(parents=True, exist_ok=True)
        i18n_file.write_text(json.dumps(generate_i18n_file(args), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"  Created {i18n_file.relative_to(ROOT)}")

    # 3. allMeta.ts
    append_to_all_meta(args, sort_order, url)

    print()
    print("Next steps:")
    print(f"  1. Fill in functions, flowNodes, flowEdges, simulations in {data_file.relative_to(ROOT)}")
    print(f"  2. Update i18n translations in {i18n_file.relative_to(ROOT)}")
    print(f"  3. Run: python scripts/validate_registry.py")
    print(f"  4. Run: python scripts/sync_translations.py")
    print()


if __name__ == "__main__":
    main()
