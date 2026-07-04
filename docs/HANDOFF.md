# Handoff Notes — Smart Contract Handbook optimization & scale-out

> Last updated: 2026-07-04, branch `fix/phase0`, HEAD `bb6ff21`.
> Read this first, then `plan.md` (the master plan, v2, 3-agent reviewed) and its §14 ledger.
> Full review artifact: https://claude.ai/code/artifact/49bfd457-3e29-46c0-816f-2a63df6a97f9

## 1. Where things stand (all committed, tree green)

**Engineering — DONE** (Phases 0, 0.5, 1, 2, 3a, 4.0, 6 main; each committed & gated):
- P0 fixes incl. THE i18n slug-prefix bug (`stripEntryPrefix`/`resolveEntryText`), language persistence, flow scroll, sim reset, CI, `vercel.json`, e2e raw-key guard.
- Schema v2 (`src/data/types.ts`): security/codeExamples/errors/gasNotes/eipStatus/tier/published/references/relations/composes + `ComputeBinding` for worker-driven sims.
- Simulation visualization: real BigInt worker math wired on erc20 + uniswap-v2, `StateChangesPanel`, storage-node value badges, legend, focus traps, param validation + wei/ETH.
- Playground: drag-drop + mobile bottom-sheet, `?state=` share URL, `removeEntry` cleanup, preset combos.
- IA for scale: `/catalog` page, Ctrl-K full-text search, per-locale `catalog` namespace + `public/search/{lng}.json` corpus, `allMeta.ts` GENERATED from `catalog.json`.
- Perf: initial JS ~612→~135 KiB gz (Rolldown `advancedChunks`, ADR-006). Template-injection prerender (`scripts/prerender.mjs`, en). Reduced-motion, FOUC fix, WCAG contrast, `categories.ts` single registry.
- i18n cleanup: mixed-language literals removed (`jsx-no-literals` ESLint rule active), es diacritics (471 fixes), zh-TW simplified-char lint.

**Content — IN PROGRESS**:
- **92 published ERC standards** + 13 protocols (= 105 live catalog entries). Was 35.
- Batches committed: 01 (10, calibration), 02 (30), 03a (8), 03b (22). Every entry: spec-authored → adversarial fact-check → 5-locale translate → gated. 100% first-pass so far.
- Case-study batch 01 done: `composes` arrays on the 10 existing protocols (source-verified).
- ERC-165 upgraded as the first Tier-A-style v2 content entry (security note + Solidity + 30k-gas fact).

## 2. What remains

1. **Catalog batches to ≥300 published standards** — ~165 Tier B entries left (see §3 loop). This is the bulk.
2. **Tier A value pass** — the ~22 remaining `tier:'A'` seed ERCs (137/191/712/777/1167/1363/1820/2309/2771/3009/3156/3668/4494/4906/4907/5192/5805/6492/6909/6963/7528/7674) deserve richer treatment than the generic Tier B workflow gives: custom flows, ≥2 sims incl. a revert scenario, security notes, code examples. Consider a dedicated richer workflow (the erc-batch.mjs prompt hardcodes `tier:'B'`; author a `tier:'A'` variant or upgrade in place).
3. **Case-study batches 02–05** — ~40 NEW product entries (USDC/USDT/DAI/stETH/wstETH/BAYC/Seaport/WETH/…) per `plan.md §9` (corrected candidate list there — heed the caveats: USDC uses ZeppelinOS unstructured-storage proxy NOT 1967, wstETH is NOT 4626, BUIDL is NOT 3643, Seaport doesn't enforce 2981 on-chain, etc.). These are new `ProtocolEntry` files with `composes`, authored WITH web verification.
4. **Deepen the original 35** (plan Phase 3 content sprint) — security/code/revert-sim content on erc20/erc4626/uniswap/erc2612/etc. Mostly not started (only erc165 done).
5. **Post-execution review** (`plan.md §13`) — clean-context agents: plan-coverage audit, code review, visual/operational verification, content fact-check sampling. **Do this once content settles.**
6. **Deploy** — `vercel.json` + CI are ready; the USER must connect the repo to Vercel (agent can't). `/:lng/` locale URLs + hreflang are deferred to a v2 (plan Phase 6).

## 3. THE BATCH LOOP (proven, repeatable)

Everything below is deterministic and idempotent. One batch = one Workflow call + a fixed post-processing sequence.

### 3a. Pick the next N (highest `requires` in-degree first)
```bash
python -c "
import json, os
rows = json.load(open('src/data/catalog.json'))
c=[r for r in rows if r.get('included') and not r.get('published') and r.get('tier')=='B' and r.get('sourcePath') and os.path.exists(os.path.join('.cache/ercs-repo',r['sourcePath']))]
c.sort(key=lambda r:(-(r.get('inDegree') or 0), r['eip']))
print(json.dumps([{k:r[k] for k in ('eip','slug','title','status','requires','sourcePath')} for r in c[:30]]))
"
```
`.cache/ercs-repo/` is the spec clone (gitignored, 601 files). If missing, re-copy from an ERCs checkout or `git clone --depth 1 https://github.com/ethereum/ERCs .cache/ercs-repo`.

### 3b. Run the workflow (author → adversarial verify → translate ×5)
```
Workflow({ scriptPath: "scripts/wf/erc-batch.mjs", args: <the JSON array from 3a> })
```
- The workflow writes `src/data/standards/<slug>.ts` + `src/i18n/locales/{en,zh-CN,zh-TW,ja,ko,es}/<slug>.json` per entry. It does NOT touch catalog.json/allMeta.
- Result value: `{ passed:[slugs], failed:[…], all:[…] }`. All-passing has been the norm.
- **Batch size**: 30 works when budget is ample; drop to ~8–10 if you suspect the session/weekly limit is near (smaller blast radius on interruption).

### 3c. Publish + regenerate + gate + commit (main loop, NOT a sub-agent)
```bash
rm -f ./NUL yarn.lock                                  # see gotchas
python scripts/publish_batch.py <passed slugs>         # flips published + writes siteCategory from the data file
python scripts/gen_allmeta.py                          # regenerate allMeta.ts (ERC-N names for generated entries)
python scripts/gen_catalog_ns.py                       # regenerate catalog namespace + search corpus
python scripts/gen_translation_state.py --update       # stamp translation memory
python scripts/validate_registry.py                    # must: All checks passed
python scripts/lint_i18n_keys.py --max-identical-ratio 0.08
python scripts/check_zh_tw_chars.py                    # zh-TW simplified-char lint
python scripts/sync_translations.py                    # must: 0 missing
npx tsc -b && npm run build
npx playwright test e2e/i18n-guard.spec.ts             # raw-key/TODO leak guard
rm -f ./NUL yarn.lock; git add -A
git commit -m "content(batch-NN): … (M published standards)"
```
If a gate fails on one entry: fix in place, or drop it (`python scripts/publish_batch.py --unpublish <slug>` + delete its files + regenerate). A batch may shrink; it never ships a failed entry.

## 4. Gotchas (each cost real time — don't rediscover)

- **`args` arrives as a STRING**, not a parsed array. The script already does `typeof args === 'string' ? JSON.parse(args) : args` — keep that.
- **Stray `NUL` file**: sub-agents that run `something 2>NUL` create a Windows-reserved `NUL` file that makes `git add -A` fail with `unable to stat 'NUL'`. Always `rm -f ./NUL` before `git add`.
- **`yarn.lock` reappears**: some sub-agents run `npm install`/`yarn`, recreating `yarn.lock`. npm is canonical (`package-lock.json`). `rm -f yarn.lock` before commit.
- **Scoped `git add` misses generated files**: `public/search/*` and `i18n/translation-state.json` live outside `src/`. Use `git add -A` (after the NUL/yarn cleanup) for content commits.
- **Session/weekly limit interruptions**: the workflow reports per-agent `failed` with the limit message. Nothing is half-committed because publish/gen only run after the whole batch returns. To recover: `rm` all untracked files for that batch's slugs (they're never committed; catalog/allMeta are untouched), verify `published` count unchanged, and re-run the batch later. `plan.md §14` holds the live count.
- **Convention-only ERCs** (no Solidity interface — URI schemes, encoding algorithms, storage-layout formulas) correctly get `functions: []` and a conceptual flow. Verify agents flag this as a non-blocking observation; it's expected.
- **`relatedSlugs`/`relations` must reference already-published slugs**. The workflow prompt carries a fixed allow-list; widen it as more entries publish if you want richer cross-linking (optional).

## 5. Key files

| Path | Role |
|---|---|
| `plan.md` | Master plan v2 + §14 progress ledger (update the count after each batch) |
| `scripts/wf/erc-batch.mjs` | The batch workflow (author/verify/translate) |
| `scripts/publish_batch.py` | Publish-flip helper (`--unpublish` to revert) |
| `scripts/gen_allmeta.py` / `gen_catalog_ns.py` / `gen_translation_state.py` | Derived-file generators (idempotent) |
| `docs/authoring/tierB-template.md` | Normative authoring contract (the workflow enforces it) |
| `docs/authoring/style-guide.md`, `docs/i18n-glossary/{lng}.md` | Voice + per-locale term canon |
| `src/data/catalog.json` | Source of truth for the 312 included ERCs (published flag drives everything) |
| `scripts/ingest_ercs.py` | Re-ingest from ethereum/ERCs (weekly cron `.github/workflows/reingest.yml`) |

## 6. Quick resume (copy-paste for the next session)

1. `git -C <repo> log --oneline -3` and `python -c "import json;print(sum(1 for r in json.load(open('src/data/catalog.json')) if r.get('published')),'published')"` to confirm state.
2. Ensure dev server if you want visual checks: `npm run dev` (localhost:5173).
3. Run §3a → §3b → §3c for each batch until published standards ≥ 300.
4. Then: Tier A pass, case-study batches 02–05, original-35 deepening, post-execution review, ask the user to connect Vercel.
