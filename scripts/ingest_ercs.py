#!/usr/bin/env python3
"""Ingest the official ERC catalog into src/data/catalog.json.

Sources
  1. ethereum/ERCs         -> ERCS/erc-*.md      (primary; ~600 documents)
  2. ethereum/EIPs         -> EIPS/eip-{n}.md    (supplement allowlist: 712, 6963, 7702)
  3. hardcoded unofficial  -> erc404, erc677, erc721a (no EIP document exists)

Usage
    python scripts/ingest_ercs.py [--repo-dir PATH] [--generate-skeletons]

    --repo-dir PATH        Use an existing ethereum/ERCs checkout. When omitted the
                           script shallow-clones into .cache/ercs-repo (gitignored).
    --generate-skeletons   Stub. Prints "not implemented yet" (entry skeleton
                           generation is a later pipeline step).

Outputs
  - src/data/catalog.json        fully generated catalog (committed)
  - scripts/erc_curation.json    curated Draft/Stagnant lists + full rankings
                                 (human-editable overrides, see docs/ingestion.md)
  - docs/ingestion.md            summary block refreshed between the
                                 INGEST_SUMMARY markers

Idempotency semantics (plan §8.1.5)
  - catalog.json is FULLY regenerated on every run: status / title / category /
    requires / inDegree / included / existing / sourcePath always refresh from
    the sources.
  - "published" and "tier" are PRESERVED from the previous catalog.json for any
    slug already present in it (batch completion flips published:true there and
    re-ingestion must not reset it). New slugs get published = existing,
    tier = A for existing/seed-list entries, else B.
  - "siteCategory" (written by scaffold_entry.py / batch authoring) and a
    manually added "specUrl" are ALSO preserved per row: the upstream sources
    know nothing about them. The generator's own specUrl (unofficial registry
    below) still wins for the rows it defines.
  - MANUAL ROWS — previous rows with sourcePath: null that this run does not
    itself produce (i.e. anything beyond the unofficial registry below; in
    practice rows appended by scaffold_entry.py) — are carried forward
    VERBATIM. A re-ingest never drops or rewrites a manual row.
  - Human curation state otherwise lives ONLY in scripts/erc_curation.json
    (draft_include / stagnant_include / exclude); the ranked lists in that file
    are informational and refreshed on every run.
  - Entry data files (src/data/standards/*.ts) are never touched or overwritten.

Exit codes: 0 ok, 1 inclusion assertion failed (<300), 2 environment/source error.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

try:
    import requests  # noqa: F401  (preferred when available)

    _HAS_REQUESTS = True
except ImportError:  # pragma: no cover - stdlib fallback
    import urllib.request

    _HAS_REQUESTS = False

ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATH = ROOT / "src" / "data" / "catalog.json"
CURATION_PATH = ROOT / "scripts" / "erc_curation.json"
STANDARDS_DIR = ROOT / "src" / "data" / "standards"
DOCS_PATH = ROOT / "docs" / "ingestion.md"
CACHE_DIR = ROOT / ".cache"
DEFAULT_REPO_DIR = CACHE_DIR / "ercs-repo"
SUPPLEMENT_CACHE = CACHE_DIR / "eip-supplements.json"

ERCS_REPO_URL = "https://github.com/ethereum/ERCs.git"
EIPS_RAW_URL = "https://raw.githubusercontent.com/ethereum/EIPs/master/EIPS/eip-{n}.md"

AUTO_INCLUDE_STATUSES = {"Final", "Last Call", "Review"}
STATUS_ORDER = ["Final", "Last Call", "Review", "Draft", "Stagnant", "Withdrawn"]
DRAFT_CURATED_COUNT = 70
STAGNANT_CURATED_COUNT = 20
MIN_INCLUDED = 300

# Tier A seed list from plan §3 (in addition to every already-existing site entry).
SEED_TIER_A = {
    137, 191, 712, 777, 1167, 1271, 1363, 1820, 2309, 2771, 3009, 3156, 3668,
    4494, 4906, 4907, 5192, 5805, 6492, 6909, 6963, 7528, 7674,
}

# EIPs that live in ethereum/EIPs (not in ethereum/ERCs) but must be in the catalog.
SUPPLEMENT_EIPS = [712, 6963, 7702]

# Used only when the network fetch fails AND no .cache/eip-supplements.json exists.
# Values mirror the upstream frontmatter (verified 2026-07).
SUPPLEMENT_FALLBACK = {
    712: {
        "title": "Typed structured data hashing and signing",
        "status": "Final",
        "category": "Interface",
        "requires": [155, 191],
        "created": "2017-09-12",
    },
    6963: {
        "title": "Multi Injected Provider Discovery",
        "status": "Final",
        "category": "Interface",
        "requires": [1193],
        "created": "2023-05-01",
    },
    7702: {
        "title": "Set Code for EOAs",
        "status": "Final",
        "category": "Core",
        "requires": [2, 161, 1052, 2718, 2929, 2930, 3541, 3607, 4844],
        "created": "2024-05-07",
    },
}

# De-facto community standards that never got an EIP document.
UNOFFICIAL_ENTRIES = [
    {
        "eip": 404,
        "slug": "erc404",
        "title": "Hybrid fungible / non-fungible token (experimental)",
        "requires": [20, 721],
        "specUrl": "https://github.com/Pandora-Labs-Org/erc404",
        "sourceNote": (
            "Unofficial, experimental community standard with no EIP document; "
            "see ERC-7631 (Dual Nature Token Pair) for the standardized "
            "in-repo counterpart."
        ),
    },
    {
        "eip": 677,
        "slug": "erc677",
        "title": "transferAndCall Token Standard",
        "requires": [20],
        "specUrl": "https://github.com/ethereum/EIPs/issues/677",
        "sourceNote": (
            "Unofficial standard (Chainlink transferAndCall); specified only in "
            "a GitHub issue, never merged as an EIP document."
        ),
    },
    {
        "eip": None,
        "slug": "erc721a",
        "title": "Gas-optimized ERC-721 batch minting (ERC721A)",
        "requires": [721],
        "specUrl": "https://www.erc721a.org",
        "sourceNote": (
            "Unofficial implementation standard by Chiru Labs; fully ERC-721 "
            "compliant, no EIP document."
        ),
    },
]

SUMMARY_START = "<!-- INGEST_SUMMARY:START -->"
SUMMARY_END = "<!-- INGEST_SUMMARY:END -->"

_SLUG_RE = re.compile(r"^erc(\d+)([0-9a-z]*)$")


def warn(message: str) -> None:
    print(f"warning: {message}", file=sys.stderr)


def fail(message: str, code: int = 2) -> "None":
    print(f"error: {message}", file=sys.stderr)
    sys.exit(code)


# ---------------------------------------------------------------------------
# Source loading
# ---------------------------------------------------------------------------

def ensure_repo(repo_dir_arg: str | None) -> Path:
    """Return a checkout of ethereum/ERCs, shallow-cloning if necessary."""
    if repo_dir_arg:
        repo = Path(repo_dir_arg).resolve()
        if not (repo / "ERCS").is_dir():
            fail(f"--repo-dir {repo} does not contain an ERCS/ directory")
        return repo
    repo = DEFAULT_REPO_DIR
    if (repo / "ERCS").is_dir():
        return repo
    repo.parent.mkdir(parents=True, exist_ok=True)
    print(f"cloning {ERCS_REPO_URL} -> {repo} (shallow) ...")
    try:
        subprocess.run(
            ["git", "clone", "--depth", "1", ERCS_REPO_URL, str(repo)],
            check=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        fail(f"shallow clone failed ({exc}); pass --repo-dir with an existing checkout")
    return repo


def parse_frontmatter(text: str) -> dict[str, str] | None:
    """Minimal YAML-frontmatter reader (flat `key: value` lines only)."""
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    fields: dict[str, str] = {}
    for line in text[3:end].splitlines():
        stripped = line.strip()
        if not stripped or line[:1] in (" ", "\t") or stripped.startswith("-"):
            continue  # continuation / list-item lines
        key, sep, value = line.partition(":")
        if not sep:
            continue
        fields[key.strip()] = value.strip().strip('"').strip("'")
    return fields


def parse_requires(value: str) -> list[int]:
    return [int(tok) for tok in re.findall(r"\d+", value or "")]


def load_docs(repo_dir: Path) -> dict[int, dict]:
    """Parse every ERCS/erc-*.md into {eip: doc}."""
    ercs_dir = repo_dir / "ERCS"
    docs: dict[int, dict] = {}
    for path in sorted(ercs_dir.glob("erc-*.md")):
        fm = parse_frontmatter(path.read_text(encoding="utf-8", errors="replace"))
        if fm is None:
            warn(f"{path.name}: no frontmatter, skipped")
            continue
        raw_eip = fm.get("eip") or ""
        match = re.match(r"erc-(\d+)\.md$", path.name)
        try:
            eip = int(raw_eip)
        except ValueError:
            if not match:
                warn(f"{path.name}: cannot determine EIP number, skipped")
                continue
            eip = int(match.group(1))
        if eip in docs:
            warn(f"{path.name}: duplicate eip {eip}, keeping first occurrence")
            continue
        docs[eip] = {
            "eip": eip,
            "title": fm.get("title") or f"ERC-{eip}",
            "status": fm.get("status") or None,
            "category": fm.get("category") or None,
            "requires": parse_requires(fm.get("requires", "")),
            "created": fm.get("created", ""),
            "sourcePath": f"ERCS/{path.name}",
        }
    if not docs:
        fail(f"no erc-*.md documents found under {ercs_dir}")
    return docs


def compute_in_degree(docs: dict[int, dict]) -> dict[int, int]:
    """indeg[n] = how many OTHER documents list n in their `requires`."""
    indeg: dict[int, int] = {}
    for doc in docs.values():
        for req in set(doc["requires"]):
            if req == doc["eip"]:
                continue
            indeg[req] = indeg.get(req, 0) + 1
    return indeg


def scan_existing_slugs() -> set[str]:
    return {p.stem for p in STANDARDS_DIR.glob("erc*.ts")}


# ---------------------------------------------------------------------------
# Curation (scripts/erc_curation.json)
# ---------------------------------------------------------------------------

def rank_by_centrality(docs: dict[int, dict], indeg: dict[int, int], status: str) -> list[dict]:
    subset = [d for d in docs.values() if d["status"] == status]
    subset.sort(key=lambda d: (-indeg.get(d["eip"], 0), d["created"] or "9999-12-31", d["eip"]))
    return subset


def _int_list(values: object, default: list[int]) -> list[int]:
    if not isinstance(values, list):
        return list(default)
    out: list[int] = []
    for v in values:
        if isinstance(v, bool):
            continue
        if isinstance(v, int):
            out.append(v)
        elif isinstance(v, str) and v.strip().isdigit():
            out.append(int(v.strip()))
    return out


def _exclude_list(values: object) -> list:
    """exclude accepts EIP numbers and/or slug strings (needed for erc721a)."""
    if not isinstance(values, list):
        return []
    out: list = []
    for v in values:
        if isinstance(v, bool):
            continue
        if isinstance(v, int):
            out.append(v)
        elif isinstance(v, str):
            s = v.strip()
            out.append(int(s) if s.isdigit() else s)
    return out


def build_curation(docs: dict[int, dict], indeg: dict[int, int]) -> tuple[dict, list[dict], list[dict]]:
    draft_ranked = rank_by_centrality(docs, indeg, "Draft")
    stagnant_ranked = rank_by_centrality(docs, indeg, "Stagnant")

    previous: dict = {}
    if CURATION_PATH.exists():
        try:
            previous = json.loads(CURATION_PATH.read_text(encoding="utf-8"))
        except ValueError as exc:
            fail(f"{CURATION_PATH} is not valid JSON ({exc}); fix or delete it")
        if not isinstance(previous, dict):
            fail(f"{CURATION_PATH} must contain a JSON object")

    default_draft = [d["eip"] for d in draft_ranked[:DRAFT_CURATED_COUNT]]
    default_stagnant = [d["eip"] for d in stagnant_ranked[:STAGNANT_CURATED_COUNT]]

    def ranked_view(ranked: list[dict]) -> list[dict]:
        return [
            {
                "eip": d["eip"],
                "inDegree": indeg.get(d["eip"], 0),
                "created": d["created"],
                "title": d["title"],
            }
            for d in ranked
        ]

    curation = {
        "_readme": [
            "Human-editable curation for scripts/ingest_ercs.py.",
            "draft_include / stagnant_include: EIP numbers force-included in the catalog.",
            "exclude: EIP numbers or slugs force-excluded (existing site entries can never be excluded).",
            "The three lists above are PRESERVED across runs; edit them freely.",
            "draft_ranked / stagnant_ranked are informational (in-degree desc, created asc) and are REGENERATED on every run.",
        ],
        "draft_include": _int_list(previous.get("draft_include"), default_draft),
        "stagnant_include": _int_list(previous.get("stagnant_include"), default_stagnant),
        "exclude": _exclude_list(previous.get("exclude")),
        "draft_ranked": ranked_view(draft_ranked),
        "stagnant_ranked": ranked_view(stagnant_ranked),
    }
    return curation, draft_ranked, stagnant_ranked


# ---------------------------------------------------------------------------
# ethereum/EIPs supplements
# ---------------------------------------------------------------------------

def http_get(url: str) -> str:
    if _HAS_REQUESTS:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        return resp.text
    with urllib.request.urlopen(url, timeout=30) as fh:  # noqa: S310 (https only)
        return fh.read().decode("utf-8")


def fetch_supplements() -> dict[int, dict]:
    """Fetch frontmatter for SUPPLEMENT_EIPS; cache-first, hardcoded fallback."""
    cache: dict = {}
    if SUPPLEMENT_CACHE.exists():
        try:
            cache = json.loads(SUPPLEMENT_CACHE.read_text(encoding="utf-8"))
        except ValueError:
            warn(f"{SUPPLEMENT_CACHE} unreadable, refetching")
            cache = {}

    out: dict[int, dict] = {}
    changed = False
    for eip in SUPPLEMENT_EIPS:
        key = str(eip)
        if isinstance(cache.get(key), dict) and cache[key].get("title"):
            out[eip] = cache[key]
            continue
        url = EIPS_RAW_URL.format(n=eip)
        try:
            fm = parse_frontmatter(http_get(url)) or {}
            if not fm.get("title"):
                raise ValueError("no frontmatter title in fetched document")
            entry = {
                "title": fm.get("title"),
                "status": fm.get("status") or None,
                "category": fm.get("category") or None,
                "requires": parse_requires(fm.get("requires", "")),
                "created": fm.get("created", ""),
                "origin": "network",
            }
        except Exception as exc:  # network blocked / bad response
            warn(f"fetch failed for {url} ({exc}); using hardcoded frontmatter fallback")
            entry = dict(SUPPLEMENT_FALLBACK[eip])
            entry["origin"] = "fallback"
            entry["sourceNote"] = (
                "Frontmatter hardcoded from a verified snapshot because the "
                "ethereum/EIPs fetch failed (offline sandbox); re-run with "
                "network access to refresh."
            )
        out[eip] = entry
        cache[key] = entry
        changed = True

    if changed:
        write_json(SUPPLEMENT_CACHE, cache)
    return out


# ---------------------------------------------------------------------------
# Catalog assembly
# ---------------------------------------------------------------------------

def load_previous_catalog() -> dict[str, dict]:
    if not CATALOG_PATH.exists():
        return {}
    try:
        data = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    except ValueError:
        warn(f"{CATALOG_PATH} is not valid JSON; previous published/tier state ignored")
        return {}
    if not isinstance(data, list):
        return {}
    return {
        row["slug"]: row
        for row in data
        if isinstance(row, dict) and isinstance(row.get("slug"), str)
    }


def catalog_sort_key(row: dict) -> tuple:
    m = _SLUG_RE.match(row["slug"])
    if m:
        return (int(m.group(1)), m.group(2))
    return (10**9, row["slug"])


def build_rows(
    docs: dict[int, dict],
    indeg: dict[int, int],
    existing_slugs: set[str],
    curation: dict,
    supplements: dict[int, dict],
    prev: dict[str, dict],
) -> list[dict]:
    draft_include = set(curation["draft_include"])
    stagnant_include = set(curation["stagnant_include"])
    exclude_eips = {v for v in curation["exclude"] if isinstance(v, int)}
    exclude_slugs = {v for v in curation["exclude"] if isinstance(v, str)}

    rows: list[dict] = []
    covered: set[str] = set()

    def make_row(
        eip: int | None,
        slug: str,
        title: str,
        status: str | None,
        category: str | None,
        requires: list[int],
        source_path: str | None,
        unofficial: bool = False,
        force_include: bool = False,
        spec_url: str | None = None,
        source_note: str | None = None,
    ) -> dict:
        existing = slug in existing_slugs
        included = (
            force_include
            or status in AUTO_INCLUDE_STATUSES
            or (
                eip is not None
                and (eip in draft_include or eip in stagnant_include or eip in SEED_TIER_A)
            )
        )
        if (eip is not None and eip in exclude_eips) or slug in exclude_slugs:
            included = False
        if existing:  # live site entries are always included, never excludable
            included = True

        prev_row = prev.get(slug)
        if prev_row is not None and prev_row.get("tier") in ("A", "B"):
            tier = prev_row["tier"]
        elif existing or (eip is not None and eip in SEED_TIER_A):
            tier = "A"
        else:
            tier = "B"
        if prev_row is not None and isinstance(prev_row.get("published"), bool):
            published = prev_row["published"]
        else:
            published = existing

        row = {
            "eip": eip,
            "slug": slug,
            "title": title,
            "status": status,
            "category": category,
            "requires": sorted(set(requires)),
            "inDegree": indeg.get(eip, 0) if eip is not None else 0,
            "included": included,
            "tier": tier,
            "existing": existing,
            "unofficial": unofficial,
            "published": published,
            "sourcePath": source_path,
        }
        if spec_url:
            row["specUrl"] = spec_url
        elif prev_row is not None and isinstance(prev_row.get("specUrl"), str) and prev_row["specUrl"]:
            # Manually added specUrl on a row the generator supplies none for
            # (scaffold_entry.py writes these) — preserve it across re-runs.
            row["specUrl"] = prev_row["specUrl"]
        if source_note:
            row["sourceNote"] = source_note
        if prev_row is not None and isinstance(prev_row.get("siteCategory"), str) and prev_row["siteCategory"]:
            # Site-facing category (token/nft/proxy/...) written by
            # scaffold_entry.py / batch authoring; upstream sources know
            # nothing about it — preserve verbatim.
            row["siteCategory"] = prev_row["siteCategory"]
        covered.add(slug)
        return row

    # 1. Primary: every document in ethereum/ERCs (excluded ones carry included:false).
    for doc in docs.values():
        rows.append(
            make_row(
                doc["eip"], f"erc{doc['eip']}", doc["title"], doc["status"],
                doc["category"], doc["requires"], doc["sourcePath"],
            )
        )

    # 2. Supplements from ethereum/EIPs.
    for eip in SUPPLEMENT_EIPS:
        slug = f"erc{eip}"
        if slug in covered:
            warn(f"supplement {slug} already present in ethereum/ERCs; supplement skipped")
            continue
        s = supplements[eip]
        rows.append(
            make_row(
                eip, slug, s["title"], s.get("status"), s.get("category"),
                s.get("requires", []), f"EIPS/eip-{eip}.md",
                force_include=True, source_note=s.get("sourceNote"),
            )
        )

    # 3. Unofficial de-facto standards (no EIP document anywhere).
    for u in UNOFFICIAL_ENTRIES:
        if u["slug"] in covered:
            warn(f"unofficial {u['slug']} collides with an official document; skipped")
            continue
        rows.append(
            make_row(
                u["eip"], u["slug"], u["title"], None, None, u["requires"], None,
                unofficial=True, force_include=True,
                spec_url=u["specUrl"], source_note=u["sourceNote"],
            )
        )

    # 4. Manual rows from the previous catalog: sourcePath is null and this
    #    run produced nothing for the slug (scaffold_entry.py appends such
    #    rows). Nothing about them can be refreshed from the sources, so they
    #    are carried forward VERBATIM — a re-ingest never drops a manual row.
    #    (setdefault only fills keys hand-added rows might miss; it never
    #    overwrites a present value.)
    for slug in sorted(set(prev) - covered):
        prev_row = prev[slug]
        if prev_row.get("sourcePath") is not None:
            continue  # upstream document disappeared — regeneration drops it
        row = dict(prev_row)
        row.setdefault("status", None)
        row.setdefault("included", True)
        row.setdefault("tier", "B")
        row.setdefault("existing", slug in existing_slugs)
        row.setdefault("unofficial", True)
        row.setdefault("published", False)
        rows.append(row)
        covered.add(slug)

    # 5. Safety net: existing site entries with no upstream document and no
    #    previous catalog row at all.
    for slug in sorted(existing_slugs - covered):
        m = _SLUG_RE.match(slug)
        eip = int(m.group(1)) if m else None
        warn(f"existing entry {slug} has no upstream source document")
        rows.append(
            make_row(
                eip, slug, f"ERC-{eip}" if eip is not None else slug, None, None,
                [], None, force_include=True,
                source_note="Existing site entry; no upstream source document found.",
            )
        )

    rows.sort(key=catalog_sort_key)
    return rows


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")


def build_summary(
    docs: dict[int, dict],
    rows: list[dict],
    curation: dict,
    supplements: dict[int, dict],
    draft_ranked: list[dict],
    stagnant_ranked: list[dict],
    indeg: dict[int, int],
) -> str:
    def status_line(counter: Counter) -> str:
        parts = [f"{s}: {counter[s]}" for s in STATUS_ORDER if counter.get(s)]
        parts += [f"{s}: {c}" for s, c in sorted(counter.items()) if s not in STATUS_ORDER]
        return ", ".join(parts)

    source_counts = Counter(d["status"] or "(none)" for d in docs.values())
    included_rows = [r for r in rows if r["included"]]
    included_counts = Counter(
        "Unofficial" if r["unofficial"] else (r["status"] or "(none)")
        for r in included_rows
    )
    tier_counts = Counter(r["tier"] for r in included_rows)
    existing_count = sum(1 for r in rows if r["existing"])
    published_count = sum(1 for r in rows if r["published"])
    supplement_bits = ", ".join(
        f"eip-{n} ({supplements[n].get('origin', 'unknown')})" for n in SUPPLEMENT_EIPS
    )

    lines = [
        f"- Source documents (ethereum/ERCs `ERCS/erc-*.md`): **{len(docs)}**",
        f"  - {status_line(source_counts)}",
        f"- Supplements (ethereum/EIPs): {supplement_bits}",
        "- Unofficial entries (no EIP document): "
        + ", ".join(u["slug"] for u in UNOFFICIAL_ENTRIES),
        f"- Catalog rows: **{len(rows)}**",
        f"- Included: **{len(included_rows)}** (minimum required: {MIN_INCLUDED})",
        f"  - {status_line(included_counts)}",
        f"- Tier among included: A = {tier_counts.get('A', 0)}, B = {tier_counts.get('B', 0)}",
        f"- Existing site entries reconciled: {existing_count} (always included, never overwritten)",
        f"- Published: {published_count}",
        f"- Curation: draft_include {len(curation['draft_include'])}/{len(draft_ranked)} ranked, "
        f"stagnant_include {len(curation['stagnant_include'])}/{len(stagnant_ranked)} ranked, "
        f"exclude {len(curation['exclude'])}",
        "",
        "Top Draft by in-degree:",
    ]
    for i, d in enumerate(draft_ranked[:15], 1):
        lines.append(f"  {i:>2}. ERC-{d['eip']} (in-degree {indeg.get(d['eip'], 0)}) — {d['title']}")
    lines.append("")
    lines.append("Top Stagnant by in-degree:")
    for i, d in enumerate(stagnant_ranked[:10], 1):
        lines.append(f"  {i:>2}. ERC-{d['eip']} (in-degree {indeg.get(d['eip'], 0)}) — {d['title']}")
    return "\n".join(lines)


def update_docs(summary: str) -> None:
    block = f"{SUMMARY_START}\n{summary}\n{SUMMARY_END}"
    if DOCS_PATH.exists():
        text = DOCS_PATH.read_text(encoding="utf-8")
        if SUMMARY_START in text and SUMMARY_END in text:
            pre, _, rest = text.partition(SUMMARY_START)
            _, _, post = rest.partition(SUMMARY_END)
            new_text = pre + block + post
        else:
            new_text = text.rstrip("\n") + f"\n\n## Latest run summary\n\n{block}\n"
    else:
        new_text = f"# ERC ingestion\n\n## Latest run summary\n\n{block}\n"
    DOCS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with DOCS_PATH.open("w", encoding="utf-8", newline="\n") as fh:
        fh.write(new_text)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Generate src/data/catalog.json from ethereum/ERCs (+ supplements)."
    )
    parser.add_argument(
        "--repo-dir",
        help="existing ethereum/ERCs checkout (default: shallow-clone into .cache/ercs-repo)",
    )
    parser.add_argument(
        "--generate-skeletons",
        action="store_true",
        help="stub: entry skeleton generation is a later pipeline step",
    )
    args = parser.parse_args(argv)

    repo = ensure_repo(args.repo_dir)
    docs = load_docs(repo)
    indeg = compute_in_degree(docs)
    existing_slugs = scan_existing_slugs()
    print(f"parsed {len(docs)} documents from {repo / 'ERCS'}")
    print(f"existing site standard entries: {len(existing_slugs)}")

    curation, draft_ranked, stagnant_ranked = build_curation(docs, indeg)
    write_json(CURATION_PATH, curation)

    supplements = fetch_supplements()
    prev = load_previous_catalog()
    rows = build_rows(docs, indeg, existing_slugs, curation, supplements, prev)

    included = sum(1 for r in rows if r["included"])
    if included < MIN_INCLUDED:
        print(
            f"error: included count {included} < required minimum {MIN_INCLUDED}; "
            "catalog NOT written",
            file=sys.stderr,
        )
        return 1

    write_json(CATALOG_PATH, rows)

    summary = build_summary(
        docs, rows, curation, supplements, draft_ranked, stagnant_ranked, indeg
    )
    print()
    print("=== ERC ingestion summary ===")
    print(summary)
    update_docs(summary)

    print()
    print(f"wrote {CATALOG_PATH.relative_to(ROOT)} ({len(rows)} rows, {included} included)")
    print(f"wrote {CURATION_PATH.relative_to(ROOT)}")
    print(f"updated {DOCS_PATH.relative_to(ROOT)}")

    if args.generate_skeletons:
        print("--generate-skeletons: not implemented yet")
    return 0


if __name__ == "__main__":
    sys.exit(main())
