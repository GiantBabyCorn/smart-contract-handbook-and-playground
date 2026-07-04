#!/usr/bin/env python3
"""Check production bundle sizes against a gzip budget.

Measures the JS emitted by `npm run build` into dist/assets:
  - "initial" JS = the entry <script type="module"> chunk(s) plus all
    <link rel="modulepreload"> chunks referenced by dist/index.html
    (i.e. what the browser must download before first paint)
  - the main entry chunk is gated against --budget-kb (gzip, KiB)
  - total initial JS is reported, and optionally gated via --total-budget-kb

Usage:
  python scripts/check_bundle_size.py [--budget-kb 250] [--total-budget-kb N] [--dist dist]

Exit code 1 if a budget is exceeded or the build output is missing.
"""

from __future__ import annotations

import argparse
import gzip
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

KIB = 1024
TABLE_LAZY_LIMIT = 10  # show the N largest lazy chunks individually


def parse_initial_assets(index_html: Path) -> tuple[list[str], list[str]]:
    """Extract entry-script and modulepreload JS basenames from index.html."""
    html = index_html.read_text(encoding="utf-8")
    entries: list[str] = []
    preloads: list[str] = []

    for tag in re.findall(r"<script\b[^>]*>", html):
        m = re.search(r'src="[^"]*?([^"/]+\.js)"', tag)
        if m:
            entries.append(m.group(1))

    for tag in re.findall(r"<link\b[^>]*>", html):
        if 'rel="modulepreload"' not in tag:
            continue
        m = re.search(r'href="[^"]*?([^"/]+\.js)"', tag)
        if m:
            preloads.append(m.group(1))

    return entries, preloads


def measure(files: list[Path]) -> dict[Path, tuple[float, float]]:
    """Return {file: (raw KiB, gzip KiB)} for each file."""
    sizes: dict[Path, tuple[float, float]] = {}
    for path in files:
        data = path.read_bytes()
        sizes[path] = (len(data) / KIB, len(gzip.compress(data, compresslevel=9)) / KIB)
    return sizes


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Check gzip size of the main entry chunk (and total initial JS) against a budget."
    )
    parser.add_argument(
        "--budget-kb",
        type=float,
        default=250.0,
        metavar="KIB",
        help="gzip budget for the main entry chunk, in KiB (default: 250)",
    )
    parser.add_argument(
        "--total-budget-kb",
        type=float,
        default=None,
        metavar="KIB",
        help="optional gzip budget for total initial JS (entry + modulepreload chunks)",
    )
    parser.add_argument(
        "--dist",
        type=Path,
        default=Path("dist"),
        help="build output directory (default: dist/)",
    )
    args = parser.parse_args()

    dist = args.dist if args.dist.is_absolute() else ROOT / args.dist
    assets_dir = dist / "assets"
    index_html = dist / "index.html"

    if not index_html.exists() or not assets_dir.is_dir():
        print(f"ERROR: {dist} is not a build output (run `npm run build` first)", file=sys.stderr)
        sys.exit(1)

    all_js = sorted(assets_dir.glob("*.js"))
    if not all_js:
        print(f"ERROR: no .js chunks found in {assets_dir}", file=sys.stderr)
        sys.exit(1)

    sizes = measure(all_js)
    by_name = {p.name: p for p in all_js}

    entry_names, preload_names = parse_initial_assets(index_html)
    entry_files = [by_name[n] for n in entry_names if n in by_name]
    if not entry_files:
        # Fallback if index.html parsing finds nothing: index-*.js, else largest chunk
        entry_files = [p for p in all_js if p.name.startswith("index-")]
    if not entry_files:
        entry_files = [max(all_js, key=lambda p: sizes[p][1])]
    main_entry = max(entry_files, key=lambda p: sizes[p][1])

    initial_names = {p.name for p in entry_files} | {n for n in preload_names if n in by_name}
    initial_files = [p for p in all_js if p.name in initial_names]
    lazy_files = sorted(
        (p for p in all_js if p.name not in initial_names),
        key=lambda p: sizes[p][1],
        reverse=True,
    )

    # Table: initial chunks (largest first), then the largest lazy chunks
    rows: list[tuple[str, str, float, float]] = []
    for p in sorted(initial_files, key=lambda p: sizes[p][1], reverse=True):
        kind = "entry" if p == main_entry else "preload"
        rows.append((p.name, kind, *sizes[p]))
    for p in lazy_files[:TABLE_LAZY_LIMIT]:
        rows.append((p.name, "lazy", *sizes[p]))

    rest = lazy_files[TABLE_LAZY_LIMIT:]
    if rest:
        rest_raw = sum(sizes[p][0] for p in rest)
        rest_gz = sum(sizes[p][1] for p in rest)
        rows.append((f"... {len(rest)} more lazy chunks", "lazy", rest_raw, rest_gz))

    name_w = max(len(r[0]) for r in rows)
    print(f"{'chunk':<{name_w}}  {'kind':<7}  {'raw KiB':>9}  {'gzip KiB':>9}")
    print("-" * (name_w + 31))
    for name, kind, raw, gz in rows:
        print(f"{name:<{name_w}}  {kind:<7}  {raw:>9.1f}  {gz:>9.1f}")

    main_gz = sizes[main_entry][1]
    initial_gz = sum(sizes[p][1] for p in initial_files)
    total_note = f" (budget {args.total_budget_kb:.0f} KiB)" if args.total_budget_kb is not None else ""
    print()
    print(f"Main entry chunk : {main_entry.name} = {main_gz:.1f} KiB gzip (budget {args.budget_kb:.0f} KiB)")
    print(f"Total initial JS : {len(initial_files)} chunk(s) = {initial_gz:.1f} KiB gzip{total_note}")

    failed = False
    if main_gz > args.budget_kb:
        print(
            f"\nFAIL: main entry chunk {main_gz:.1f} KiB gzip exceeds budget {args.budget_kb:.0f} KiB",
            file=sys.stderr,
        )
        failed = True
    if args.total_budget_kb is not None and initial_gz > args.total_budget_kb:
        print(
            f"FAIL: total initial JS {initial_gz:.1f} KiB gzip exceeds budget {args.total_budget_kb:.0f} KiB",
            file=sys.stderr,
        )
        failed = True

    if failed:
        sys.exit(1)
    print("\nBundle size within budget.")
    sys.exit(0)


if __name__ == "__main__":
    main()
