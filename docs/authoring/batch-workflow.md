# Tier B Content Batch — Operational Runbook

How one batch of 10 Tier B entries moves from catalog skeleton to published, translated,
gated content (plan.md §8.2). The batch lead (orchestrating agent or human) follows this
file top to bottom; sub-agents receive only the files named in each stage.

**Shared assets** (inject into prompts as noted; do not paraphrase them):

| Asset | Used by |
|---|---|
| `docs/authoring/tierB-template.md` | author agents |
| `docs/authoring/style-guide.md` | author + fact-check + translate agents |
| `docs/i18n-glossary/<lng>.md` | the matching translate agent |
| Gold exemplars: `src/data/standards/erc20.ts` + `en/erc20.json` (token), `erc721` (nft), `erc1967` (proxy) | author agents (pick the category-nearest one) |
| `i18n/translation-state.json` (via `scripts/gen_translation_state.py`) | batch lead |

---

## 0. Batch selection & preconditions

1. Working tree clean on the content branch; latest `main` merged.
2. Pick 10 slugs from `src/data/catalog.json` where `included: true`,
   `existing: false`, `published: false`, `tier: "B"`, in descending `inDegree`
   (ties: ascending `eip`). Skip slugs already claimed by an open batch.
3. Record the batch manifest (slug list + catalog rows) at the top of the batch report:
   `docs/agent-status/content-batch-<NN>.md`.
4. Each slug's spec source: `.cache/ercs-repo/<sourcePath>` (run
   `python scripts/ingest_ercs.py --repo-dir <dir>` beforehand if the checkout is missing).

## 1. Author — 10 agents in parallel

- One agent per slug. Prompt = task header + `tierB-template.md` + `style-guide.md` +
  the category-nearest gold exemplar pair + the catalog row + the spec markdown text.
- Agents read **only the official spec text** for facts (no web browsing, no memory
  facts with numbers/names/dates). Unsure → omit + list under "Omissions" in their reply.
- Output per agent: `src/data/standards/<slug>.ts`, `src/i18n/locales/en/<slug>.json`,
  and an omissions/notes list which the lead pastes into the batch report.

## 2. Fact-check — 10 clean-context agents in parallel

- One fresh agent per slug (no author context). Inputs: the two produced files + the spec
  markdown + `style-guide.md` + the catalog row.
- Checklist (verdict per item): every `functions[]` signature appears in the spec's
  Specification section verbatim; no spec interface member silently altered; `eipStatus` /
  `requires` / `eipNumber` / URLs match the catalog row and spec; every factual claim in
  introduction/designPurpose/commonUsage is supported by the spec (or is a hedged
  category statement); status caveat present and correct; no invented adopters; template
  shape respected (nodes/edges/sim ids consistent).
- Verdict: **PASS** or **FAIL + itemized findings**.

### Escalation rule (fixed, no judgment calls)

1. FAIL → re-author **once**: a fresh author agent gets the original inputs **plus** the
   fact-check findings. Then a fresh fact-check.
2. Second FAIL → **drop the slug from the batch**: delete its two files, leave
   `published: false` in catalog.json, log the drop + findings in the batch report. The
   slug returns in a later batch. A batch may shrink; it never ships a failed entry.

## 3. Translate — 5 agents in parallel (one per locale)

- Locales: zh-CN, zh-TW, ja, ko, es. Each agent translates **all surviving entries** of
  the batch for its locale: `src/i18n/locales/<lng>/<slug>.json` mirroring every key of
  the en file (same flat key set, same interpolation placeholders).
- Prompt = the en JSON files + `docs/i18n-glossary/<lng>.md` + `style-guide.md` §1–2.
  Glossary canonical terms are mandatory; identifiers/keep-English list stay English.
- Before translating, the lead may run `python scripts/gen_translation_state.py --check`
  to list any previously-stale files worth bundling into the same pass.

## 4. Publish flip

For every surviving slug, in one edit pass:
1. `src/data/catalog.json`: set the row's `"published": true`.
2. `src/data/standards/<slug>.ts`: set `published: true` (keep data file mirroring the row).

## 5. Regenerate derived files

```bash
python scripts/gen_allmeta.py
python scripts/gen_catalog_ns.py
```

(Order matters: catalog-ns reads the regenerated allMeta.)

## 6. Mechanical gates — all must pass

```bash
python scripts/validate_registry.py                       # registry/flow/i18n-ref integrity (validates published entries)
python scripts/lint_i18n_keys.py --max-identical-ratio 0.08   # key conventions + 6-locale parity + identical-ratio
python scripts/check_zh_tw_chars.py                       # zh-TW simplified-character lint (exit 1 on findings)
python scripts/sync_translations.py                       # report mode: must find 0 missing keys
npm run build                                             # tsc + production build
```

Plus two grep gates over the batch's files (expect zero matches):

```bash
grep -rn "TODO" src/data/standards src/data/protocols src/i18n/locales   # no-TODO gate
grep -rn "UNTRANSLATED" src/i18n/locales                                 # no placeholder translations
```

**Solidity signature gate** (plan §8.2): wrap each new entry's `functions[].signature`
in `interface X { … }` and compile with solc, or verify selectors against
4byte.directory. Until a dedicated script lands in `scripts/`, this gate is executed by
the fact-check agents (stage 2 checklist item 1) — the batch report must state
"signatures verified against spec text" per slug.

Optional but recommended once per batch: `npx playwright test e2e/i18n-guard.spec.ts`
(raw-key / TODO leak guard across locales).

### Gate-failure handling

- Mechanical slips (missing key, orphan node id, parity gap): fix in place, re-run gates.
- Content problems surfacing at gates: treat as a stage-2 FAIL → escalation rule (the
  slug has already used its re-author? then drop: unflip `published` in both places,
  delete the entry's files in all locales, regenerate §5, re-run gates).

## 7. Stamp translation state + commit

```bash
python scripts/gen_translation_state.py --update    # record en↔locale hashes for the new namespaces
python scripts/gen_translation_state.py --check     # must print OK
```

Commit **everything of the batch as one commit** on the content branch:

```
content/batch-<NN>: <k> Tier B entries (<slug1>, <slug2>, …)
```

Files in the commit: 2 data/en files per slug, 5 locale files per slug, catalog.json,
generated allMeta.ts + catalog namespaces + search corpus, i18n/translation-state.json,
and `docs/agent-status/content-batch-<NN>.md` (the batch report: manifest, fact-check
verdicts, omissions, drops). Push → Vercel preview → visual spot-check 2–3 entries in
en + zh-TW (desktop/mobile).

---

## 8. Batch 01 calibration gate (hard stop)

Batch 01 does **not** unlock batches 02–30 by passing the gates. After batch 01 is
committed and previewed:

1. A human reviews all 10 entries on the Vercel preview against the spec texts
   (accuracy, tone, flow readability, translation quality spot-check per locale).
2. Every systematic finding is fixed **in the shared assets** (tierB-template.md,
   style-guide.md, the glossaries, prompt headers) — not just in the 10 entries.
3. Batch 01 entries are patched to match the revised assets; gates re-run.
4. Only after explicit human sign-off (recorded in `docs/agent-status/content-batch-01.md`)
   do batches 02–30 proceed, and they may then run with multiple batches in flight
   (distinct slug sets → zero file overlap → no merge conflicts).

## 9. Recurring hygiene

- `python scripts/gen_translation_state.py --check --strict` belongs in CI: it fails when
  anyone edits an en namespace without re-translating (stale locale detection).
- Weekly `ingest_ercs.py` cron PRs may change catalog `status` fields → the affected
  entries' `eipStatus` + status caveat sentence must be updated (small follow-up task,
  never inside a content batch).
- Tier A upgrade batches (5 entries/batch) reuse this runbook with the Tier A additions
  (custom flow, ≥2 scenarios incl. revert, security/code/gas) and
  `python scripts/validate_registry.py --strict-tier-a` added to the gates.
