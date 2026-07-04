# ADR 005: Schema v2 and Catalog Tiering

Status: Accepted (2026-07)

## Context

The handbook currently holds 35 hand-authored entries. The roadmap scales it to 300+ ERC
standards plus 50+ protocol case studies (plan §3–§9), which the v1 schema cannot express:

- No fields for handbook-grade depth: security notes, code examples, custom errors, gas
  notes, official EIP status, requires, references.
- Mass ingestion will produce skeleton entries that must not leak into the sidebar,
  catalog, search, or sitemap before review.
- The simulation engine is being wired to real worker computations (Phase 1) and needs a
  declarative binding from scenario params to worker functions, plus revert semantics.
- Case studies (USDC, Safe, Uniswap LP…) are *compositions of standards*; a third
  `entryType` would fork every consumer of `ERCEntry`.

## Decision

1. **Additive-only, optional fields.** Every v2 field is optional; all 35 existing entry
   files remain valid without edits. `migrate_data_schema.py` therefore has nothing to
   migrate and instead offers `--check` (lints entry files for unknown top-level fields
   against the `types.ts` allowlist).
2. **Field placement follows the consuming surface**, not the entry type:
   - `ERCMeta` gains `eipStatus` / `tier` / `published` / `unofficial` — list surfaces
     (sidebar, `/catalog`, search, sitemap) badge and filter on these without loading
     entry files. Because `BaseEntry` extends `ERCMeta`, one declaration serves both
     `allMeta.ts` rows and full entries — no mirrored type to drift.
   - `ERCContent` gains `security` / `codeExamples` / `errors` / `gasNotes` /
     `references` — detail-page content sections.
   - `BaseEntry` gains `requires` / `relations` — cross-entry graph data that list
     surfaces do not need.
   - `ProtocolEntry` gains `composes` / `chains` / `addresses`.
3. **Tier A/B.** 'A' = full spec (custom flow, ≥2 scenarios incl. a revert path,
   security/code/gas); 'B' = condensed spec-extracted entry. Absent tier = legacy full
   entry, treated as 'A'. `validate_registry.py --strict-tier-a` arms the machine gate
   (≥2 scenarios, ≥1 revert scenario or `isRevert` step) for the Phase 3/4 content batches.
4. **`published` gate.** `published: false` skeletons are excluded from all list surfaces;
   absent means published (covers every legacy entry).
5. **`ComputeBinding`.** A scenario's `compute` maps param ids → worker argument names so
   the engine derives `valueChanges` from real math instead of replaying static strings.
6. **Case studies stay `ProtocolEntry`.** `composes` (in-site `slug` and/or raw `erc`
   number, plus an i18n `role` key) drives the composition graph; no new entry type.
7. **String conventions.** `SecurityNote.title/desc/mitigation`, `CodeExample.title`,
   `ContractError.condition`, `ComposedStandard.role`, and `SimulationStep.revertReason`
   are slug-prefixed i18n keys. `Reference.label`, `DeployedAddress.*`, and
   `CodeExample.code` are literals — consistent with `name`, `officialUrl`, and
   `contracts[].label` (external titles, addresses, and code are never translated).
8. **`addresses` supersedes `contracts`** (same shape, `label` optional). `contracts`
   stays valid until the 13 existing protocol entries migrate during Phase 5.

## Consequences

- Zero-cost rollout: no data migration, `tsc` and all list surfaces behave as before
  until fields are populated.
- The catalog can render 300+ rows (status/tier/published badges and filters) from meta
  alone; skeletons cannot leak while `published: false`.
- Tier A quality becomes machine-checkable before content batches land, instead of a
  review-time judgment call.
- UI must handle absence everywhere: v2 sections render only when data is present.
- Two deployment-address fields coexist until Phase 5 migrates `contracts`.
- The regex-based validator relies on Prettier formatting conventions (e.g. counting
  scenarios via `steps: [`) — acceptable for a lint-grade gate, revisit if data files
  ever stop being Prettier-formatted.
