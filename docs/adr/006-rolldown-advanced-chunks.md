# ADR 006: Native Rolldown advancedChunks for Vendor Splitting

Status: Accepted (2026-07)

## Context

Vite 8 runs on Rolldown, and the project's vendor splitting used the legacy
`build.rollupOptions.output.manualChunks` function. Under Rolldown's compat layer a
chunk group also absorbs the *dependencies* of the modules it captures when those
dependencies are not decisively claimed elsewhere. The `flow-vendor` group
(`@xyflow/react` + `elkjs`) therefore absorbed `react`, `react-dom`'s base runtime,
`react/jsx-runtime` and `use-sync-external-store` — modules every chunk needs. The
result: the entry chunk statically imported `flow-vendor`, and `index.html`
modulepreloaded ~483 KiB gzip of diagram code on every page load even though
`FlowCanvas` / `PlaygroundCanvas` are lazy. Total initial JS was 611.9 KiB gzip.
Returning `'react-vendor'` from `manualChunks` for those module ids did **not** fix
it — the absorption overrode the function's assignment.

## Decision

1. **Use `build.rolldownOptions.output.advancedChunks` directly** (the API the
   compat layer targets) with explicit, priority-ordered groups instead of the
   `manualChunks` function.
2. **`react-vendor` claims all initial-graph shared modules at highest priority
   (100)**: `react`, `react-dom`, `scheduler`, `react-router(-dom)`, `zustand`,
   `use-sync-external-store` — matched as exact path segments so `react-i18next`
   is not captured. This also pulls `react-router` core (previously inlined into
   the entry chunk) into the cacheable vendor chunk.
3. **`flow-vendor` (priority 50) claims only `@xyflow/*` and `elkjs`.** Its private
   dependencies (`d3-*`, `classcat`) are intentionally left unclaimed so Rolldown
   co-locates them in `flow-vendor` — here the absorption behaviour works *for* us
   and avoids request waterfalls when a diagram mounts.
4. **Accepted trade-off:** `@xyflow/react`'s nested `zustand` v4 copy
   (`@xyflow/react/node_modules/zustand`, ~1.5 KiB gzip) matches the
   `react-vendor` test and ships in the initial bundle. Not worth an extra
   exclusion rule.

## Consequences

- Total initial JS dropped from 611.9 KiB to 132.8 KiB gzip (entry 48.5 → 19.1;
  `flow-vendor` at 478.2 KiB gzip is now loaded only when a flow diagram or the
  playground mounts). `react` appears exactly once in the chunk graph, so there is
  no double-React hazard.
- **Guardrail:** any future dependency shared between app code and the flow stack
  must be added to the `react-vendor` test (or another initial group), otherwise
  `flow-vendor` will silently absorb it and drag itself back into the initial
  preload set. `scripts/check_bundle_size.py` reports "Total initial JS" — CI
  should gate it via `--total-budget-kb` to catch regressions.
- `manualChunks` must not be reintroduced alongside `advancedChunks`; the two
  mechanisms do not compose.
