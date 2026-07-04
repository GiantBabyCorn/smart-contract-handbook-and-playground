# ERC Ingestion Pipeline

`scripts/ingest_ercs.py` generates `src/data/catalog.json` — the master catalog of every
ERC/EIP the site tracks — from the official sources. It never touches entry data files
(`src/data/standards/*.ts`); content authoring is a separate, later pipeline step.

## Usage

```bash
python scripts/ingest_ercs.py                    # shallow-clones ethereum/ERCs into .cache/ercs-repo
python scripts/ingest_ercs.py --repo-dir <path>  # reuse an existing checkout
python scripts/ingest_ercs.py --generate-skeletons  # stub, not implemented yet
```

## Sources

1. **ethereum/ERCs** (`ERCS/erc-*.md`, ~600 documents) — YAML frontmatter parsed for
   `eip / title / status / category / requires / created`.
2. **ethereum/EIPs supplement allowlist** — EIP-712, EIP-6963, EIP-7702 live in the EIPs
   repo, not the ERCs repo. Fetched from `raw.githubusercontent.com` and cached in
   `.cache/eip-supplements.json`; if the fetch fails offline, a verified hardcoded
   frontmatter snapshot is used and the row gets a `sourceNote`.
3. **Unofficial registry** — `erc404`, `erc677`, `erc721a` are de-facto community
   standards with no EIP document. Hardcoded with `unofficial: true`, `status: null`
   and a `specUrl`. `erc721a` has no EIP number, so its `eip` is `null` (it sorts right
   after ERC-721 by slug).

## Inclusion rules

- `Final`, `Last Call`, `Review` → always included.
- `Draft` / `Stagnant` → curated by **centrality** (in-degree = how many other ERC
  documents list the number in `requires`, tie-broken by oldest `created`). Defaults:
  top 70 Draft, top 20 Stagnant.
- `Withdrawn` → excluded (rows remain in the catalog with `included: false`).
- Tier-A seed EIPs (plan §3), the EIPs supplements, and the unofficial entries are
  force-included.
- Existing site entries (`src/data/standards/erc*.ts`) are **always included** and can
  never be excluded or overwritten.
- The `exclude` curation list beats every rule above except "existing".

## Curation overrides — `scripts/erc_curation.json`

Human-editable file read on every run:

- `draft_include` / `stagnant_include`: EIP numbers to force-include (defaults are the
  top-70 / top-20 by centrality, written on first run).
- `exclude`: EIP numbers or slugs to force-exclude.
- `draft_ranked` / `stagnant_ranked`: the **full** ranked lists (informational, so
  humans can pick replacements) — regenerated on every run.

The three override lists are preserved verbatim across runs; the script only rewrites
the ranked lists around them.

## Idempotency & preservation semantics (plan §8.1.5)

`catalog.json` is **fully generated** — do not hand-edit it, with these exceptions:
`published`, `tier`, `siteCategory`, a manually added `specUrl`, and whole manual rows.

- On every run, `status / title / category / requires / inDegree / included / existing /
  sourcePath` are refreshed from the sources.
- `published` and `tier` are **preserved** from the previous `catalog.json` for every
  slug already present in it. Batch completion flips `published: true`; re-running the
  ingestion will not reset it. New slugs default to `published = existing` (the
  pre-pipeline entries are live), `tier = A` for existing/seed entries, else `B`.
- `siteCategory` (site-facing category written by `scaffold_entry.py` / batch
  authoring) is **preserved** per row whenever the previous catalog has it — the
  upstream sources know nothing about it. A manually added `specUrl` is preserved the
  same way, except on rows where the generator itself supplies one (the unofficial
  registry stays the source of truth for its own three entries).
- **Manual rows are never dropped**: any previous row with `sourcePath: null` that the
  run does not itself produce (i.e. beyond the unofficial registry — in practice rows
  appended by `scaffold_entry.py`) is carried forward **verbatim**. Nothing about such
  a row can be refreshed from the sources, so nothing in it is rewritten.
- Human/manual state otherwise lives in `scripts/erc_curation.json` (curation) and in
  the entry data files themselves (content). Nothing in the pipeline writes to entry
  files.
- Re-running with unchanged sources produces a byte-identical `catalog.json`.
- The script asserts `included >= 300` and exits 1 without writing the catalog if the
  assertion fails.

## catalog.json field reference

| Field | Meaning |
|---|---|
| `eip` | EIP number (`null` for `erc721a`, which has none) |
| `slug` | `erc{number}` lowercase; unique key |
| `title` | Frontmatter title from the source document |
| `status` | `Final` / `Last Call` / `Review` / `Draft` / `Stagnant` / `Withdrawn` / `null` (unofficial) |
| `category` | `ERC`, `Interface`, `Core`, or `null` |
| `requires` | EIP numbers from frontmatter `requires` (sorted) |
| `inDegree` | Citations from other ERC documents' `requires` (centrality) |
| `included` | Passes the inclusion rules above |
| `tier` | `A` (full spec treatment) or `B` (compact treatment) |
| `existing` | A data file already exists in `src/data/standards/` |
| `unofficial` | No EIP document exists anywhere |
| `published` | Entry is live on the site (flipped by content batches, preserved here) |
| `sourcePath` | `ERCS/erc-N.md`, `EIPS/eip-N.md`, or `null` (unofficial registry or manual row) |
| `specUrl` / `sourceNote` | Optional; unofficial/manual spec link / provenance note |
| `siteCategory` | Optional; site-facing category (`token`, `nft`, ...) written by `scaffold_entry.py` / batch authoring — preserved across runs |

## Latest run summary

<!-- INGEST_SUMMARY:START -->
- Source documents (ethereum/ERCs `ERCS/erc-*.md`): **600**
  - Final: 138, Last Call: 16, Review: 58, Draft: 216, Stagnant: 163, Withdrawn: 9
- Supplements (ethereum/EIPs): eip-712 (network), eip-6963 (network), eip-7702 (network)
- Unofficial entries (no EIP document): erc404, erc677, erc721a
- Catalog rows: **606**
- Included: **312** (minimum required: 300)
  - Final: 141, Last Call: 16, Review: 58, Draft: 71, Stagnant: 23, Unofficial: 3
- Tier among included: A = 44, B = 268
- Existing site entries reconciled: 22 (always included, never overwritten)
- Published: 22
- Curation: draft_include 70/216 ranked, stagnant_include 20/163 ranked, exclude 0

Top Draft by in-degree:
   1. ERC-7579 (in-degree 4) — Minimal Modular Smart Accounts
   2. ERC-6944 (in-degree 3) — ERC-5219 Resolve Mode
   3. ERC-8004 (in-degree 3) — Trustless Agents
   4. ERC-3009 (in-degree 2) — Transfer With Authorization
   5. ERC-7562 (in-degree 2) — Account Abstraction Validation Scope Rules
   6. ERC-8119 (in-degree 2) — Parameterized Storage Keys
   7. ERC-725 (in-degree 1) — General data key/value store and execution
   8. ERC-3770 (in-degree 1) — Chain-specific addresses
   9. ERC-6860 (in-degree 1) — Web3 URL to EVM Call Message Translation
  10. ERC-7572 (in-degree 1) — Contract-level metadata via `contractURI()`
  11. ERC-7700 (in-degree 1) — Cross-chain Storage Router Protocol
  12. ERC-7710 (in-degree 1) — Smart Contract Delegation
  13. ERC-8023 (in-degree 1) — Multi-step Contract Ownership
  14. ERC-8048 (in-degree 1) — Onchain Metadata for Token Registries
  15. ERC-8049 (in-degree 1) — Contract-Level Onchain Metadata

Top Stagnant by in-degree:
   1. ERC-1066 (in-degree 5) — Status Codes
   2. ERC-634 (in-degree 3) — Storage of text records in ENS
   3. ERC-1900 (in-degree 3) — dType - Decentralized Type System for EVM
   4. ERC-1996 (in-degree 3) — Holdable Token
   5. ERC-2304 (in-degree 3) — Multichain address resolution for ENS
   6. ERC-1077 (in-degree 2) — Gas relay for contract calls
   7. ERC-1577 (in-degree 2) — contenthash field for ENS
   8. ERC-831 (in-degree 1) — URI Format for Ethereum
   9. ERC-926 (in-degree 1) — Address metadata registry
  10. ERC-1062 (in-degree 1) — Formalize IPFS hash into ENS(Ethereum Name Service) resolver
<!-- INGEST_SUMMARY:END -->
