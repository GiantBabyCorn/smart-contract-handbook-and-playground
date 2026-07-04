# Tier B Entry — Authoring Template (normative)

This is the complete, self-contained spec for authoring one **Tier B** catalog entry
(condensed, spec-extracted standard entry — see `docs/adr/005` and plan.md §3/§8.2).
A fresh agent must be able to follow it verbatim with **only** these inputs:

1. The entry's row in `src/data/catalog.json` (gives `eip`, `slug`, `title`, `status`,
   `requires`, `tier`, `sourcePath`).
2. The official spec markdown at `<ERCs checkout>/<sourcePath>` (local clone under
   `.cache/ercs-repo/`, or `https://eips.ethereum.org/EIPS/eip-<N>`).
3. `docs/authoring/style-guide.md` (voice, status caveats, reference rules).

**You produce exactly two files. Nothing else.**

| File | Purpose |
|---|---|
| `src/data/standards/<slug>.ts` | Data file (`StandardEntry`) |
| `src/i18n/locales/en/<slug>.json` | English strings (translations are a later stage) |

Never edit: `allMeta.ts` (generated), `catalog.json` (ingestion-owned; the batch lead flips
`published`), other locales, any shared component. New data files are auto-discovered via
`import.meta.glob` in `src/data/registry.ts` — no registration step.

---

## 1. Data file skeleton

Copy this shape exactly (section comments included — every existing entry uses them).
Replace `<slug>` (e.g. `erc55`) and `<N>` (the EIP number) throughout.

```ts
import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: '<slug>',
  name: 'ERC-<N>',
  shortDescription: '<slug>.short',
  category: '<category>',            // see §1.1
  entryType: 'standard',
  eipNumber: <N>,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-<N>',
  relatedSlugs: [/* 2–4 existing published slugs, see §1.2 */],
  sortOrder: 1<NNNN>,                // 10000 + eipNumber (gen_allmeta default for catalog-era entries)
  eipStatus: '<status>',             // copy catalog.json row verbatim: 'Draft'|'Review'|'Last Call'|'Final'|'Stagnant'
  tier: 'B',
  published: false,                  // batch lead flips to true (here AND in catalog.json) after gates pass

  // ─── Schema v2 ───
  requires: [/* copy catalog.json row's requires array; omit the field if empty */],
  relations: [/* optional, see §1.2; omit if none */],
  references: [
    { label: 'ERC-<N> Specification', url: 'https://eips.ethereum.org/EIPS/eip-<N>', kind: 'spec' },
    // optional impl links — ONLY OpenZeppelin / Solady / Solmate, see style-guide.md
  ],

  // ─── ERCContent ───
  introduction: '<slug>.introduction',
  designPurpose: '<slug>.designPurpose',
  commonUsage: '<slug>.commonUsage',

  functions: [ /* §2 — from the spec's interface ONLY */ ],

  // ─── ERCFlow ───
  flowNodes: [ /* §3 — 5–8 nodes from the template shape */ ],
  flowEdges: [ /* §3 */ ],

  elkLayoutOptions: {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    'elk.spacing.nodeNode': '40',
  },

  // ─── ERCSimulation ───
  simulations: [ /* §4 — exactly ONE generic scenario */ ],
};
```

### 1.1 Field rules

- **slug**: from catalog.json, always `erc<N>`.
- **name**: `'ERC-<N>'` — even when the catalog `title` is wordy. The title's content goes
  into `<slug>.short`.
- **category**: pick ONE of `token | nft | proxy | defi | account | utility | identity |
  oracle | governance | cross-chain | rwa` from the spec's subject matter. When ambiguous,
  prefer the interface's primary noun (a token extension → `token`; a wallet/AA piece →
  `account`; generic infrastructure → `utility`).
- **officialUrl / references spec URL**: always `https://eips.ethereum.org/EIPS/eip-<N>`
  (the canonical URL used by all 35 existing entries; it serves ERCs too — do not use
  `ercs.ethereum.org` in data files).
- **eipStatus / tier / requires**: copied from the catalog.json row — never guessed. If you
  believe the catalog row is wrong, do NOT fix it; note it in the batch report.
- **published**: `false` at authoring time, mirroring the catalog row. The publish flip
  (batch lead) sets `true` in **both** places in the same commit.

### 1.2 relatedSlugs and relations

- `relatedSlugs`: 2–4 slugs. **Every slug must already exist in the generated
  `allMeta.ts`** (i.e. be a published entry) — `validate_registry.py` fails otherwise.
  Entries from the *same batch* may reference each other only because they flip
  `published` in the same commit; when unsure, stick to the 35 legacy entries.
- `relations` (optional, richer typing): `{ slug, kind }` with kind
  `extends | requires | alternative | usedWith`. Use `requires` for the spec's own
  `requires:` frontmatter targets *that have entries*, `extends` when this standard is an
  extension of another (e.g. metadata extensions), `alternative` for competing designs,
  `usedWith` for common pairings. Same existence rule as relatedSlugs. Omit the field
  entirely when you have nothing typed to say.

---

## 2. functions[] — spec extraction rules

**Source of truth: the spec's `## Specification` section only** (its Solidity
`interface` block(s) and event definitions). Not the Rationale, not reference
implementations, not OpenZeppelin.

- Include, in this order: core interface functions (spec order), then events. For specs
  with optional extensions (Metadata, Enumerable, …), include them only when they are
  small (≤3 members) and clearly part of the ERC; otherwise cover the core interface only
  and mention extensions in `commonUsage`.
- Cap at ~10 members for very large interfaces: keep the members that define the
  standard's behavior (state-changing + events) and drop convenience getters — list any
  dropped members in the batch report.
- **Signatures are copied verbatim from the spec**, reformatted to the project style:
  - functions: `'name(type param, type param) → returnType'` — note the ` → ` Unicode
    arrow (U+2192) before returns; omit the arrow when nothing is returned.
  - events: `'Name(address indexed owner, uint256 value)'` — keep `indexed` markers.
  - keep the spec's parameter names; if the spec declares a parameter type without a name,
    use the name from the spec's prose, else a descriptive lowercase name.
- `type`: `'read'` (view/pure), `'write'` (state-changing), `'event'`.
- `params` / `returns`: one object per parameter with i18n-key descriptions
  (`<slug>.fn.<name>.params.<param>`, `<slug>.fn.<name>.returns.<ret>`). `returns` is
  omitted for functions returning nothing and for events.
- `defaultSimValues` (optional, read/write only): illustrative literals like
  `{ to: '0xRecipient', amount: '1000000000000000000' }`.
- A convention-only ERC with no Solidity interface (URI schemes, process ERCs) gets
  `functions: []` — never invent an interface.

One JSON block per function in `en/<slug>.json` (see §5).

---

## 3. Flow template — 5–8 nodes

Tier B uses the generic **user → contract (with function children) → event** shape. Do not
design custom topologies (that is Tier A work). Pick the standard's 1–3 most important
write functions (or the single read function for query-style ERCs).

Nodes (in this order):

| id | type | label | notes |
|---|---|---|---|
| `user` | `user` | `'<slug>.node.user'` | `data: { address: '0xUser' }`, `layoutHint: 'source'` |
| `<slug>-contract` | `contract` | `'<slug>.node.contract'` | `data.functions`: the function names array, `layoutHint: 'center'` |
| `fn-<name>` ×1–3 | `function` | **literal** `'<name>()'` | `data: { fnType: 'write'|'read', signature: '<full signature>' }` — function-node labels are literal code, NOT i18n keys |
| `storage-<what>` | `storage` | `'<slug>.node.storage<What>'` | `data.slots`: the spec's main mappings/variables, e.g. `{ key: '_labels', label: 'mapping(uint256 => string)' }`, `layoutHint: 'storage'` |
| `event-<name>` | `function` | **literal** `'<Name> event'` | `data: { fnType: 'event', signature: '<event signature>' }` |
| optional: `recipient`/`operator` | `user` | `'<slug>.node.<role>'` | only when the standard inherently involves a counterparty, `layoutHint: 'sink'` |

Edges (every id `e-<source>-<target>` shortened sensibly; source/target must be node ids —
`validate_registry.py` checks):

1. `user → fn-<name>` — `type: 'animated'`, `label: '<slug>.edge.call<Name>'`
2. `fn-<name> → <slug>-contract` — `type: 'animated'`, no label
3. `<slug>-contract → storage-<what>` — `type: 'labeled'`, `label: '<slug>.edge.update<What>'`
   (or `read<What>` for read-only standards)
4. `<slug>-contract → event-<name>` — `type: 'labeled'`, `label: '<slug>.edge.emit<Name>'`
5. optional counterparty edge — `type: 'labeled'` or `'fundFlow'` (fundFlow only when
   value/tokens actually move)

Keep total nodes 5–8 and edges 4–8. Always include the `elkLayoutOptions` block from §1
unchanged.

---

## 4. Simulation — exactly ONE generic scenario (no compute binding)

Tier B simulations are **BFS-highlight walkthroughs**: 3–4 steps that walk the flow graph
from the user to the event along existing edges, highlighting nodes/edges per step. No
`compute` field, no `kind` field (defaults to happy-path), no revert steps (Tier A work).

```ts
simulations: [
  {
    id: '<action>-walkthrough',                     // e.g. 'set-label-walkthrough'
    name: '<slug>.sim.<scenario>.name',             // <scenario> = camelCase id, e.g. setLabelWalkthrough
    description: '<slug>.sim.<scenario>.desc',
    params: [
      {
        id: '<param>',
        label: '<slug>.sim.<scenario>.param.<param>',
        type: 'address' | 'uint256' | 'bool' | 'select',
        defaultValue: '<literal>',
      },
      // 1–3 params mirroring the main function's inputs
    ],
    steps: [
      {
        id: 'step-call',
        description: '<slug>.sim.<scenario>.step.call',
        mobileDescription: '<slug>.sim.<scenario>.step.call.mobile',
        highlightNodes: ['user', 'fn-<name>'],
        highlightEdges: ['e-user-<name>'],
        durationMs: 1000,
      },
      {
        id: 'step-execute',
        description: '<slug>.sim.<scenario>.step.execute',
        mobileDescription: '<slug>.sim.<scenario>.step.execute.mobile',
        highlightNodes: ['fn-<name>', '<slug>-contract', 'storage-<what>'],
        highlightEdges: ['e-<name>-contract', 'e-contract-storage'],
        valueChanges: { 'storage-<what>.<key>': '<old> → <new>' },   // optional, illustrative literals
        durationMs: 1200,
      },
      {
        id: 'step-event',
        description: '<slug>.sim.<scenario>.step.event',
        mobileDescription: '<slug>.sim.<scenario>.step.event.mobile',
        highlightNodes: ['<slug>-contract', 'event-<name>'],
        highlightEdges: ['e-contract-event'],
        durationMs: 800,
      },
    ],
  },
],
```

Every `highlightNodes`/`highlightEdges` id must exist in `flowNodes`/`flowEdges`.
`valueChanges` keys use `<nodeId>.<field>` and free-form ` → ` value strings.

---

## 5. en JSON skeleton — required keys, length targets, style

`src/i18n/locales/en/<slug>.json` is a **flat** JSON object of dotted keys **without** the
slug prefix (the data file references `<slug>.fn.transfer.desc`; the JSON stores
`"fn.transfer.desc"` — the runtime strips the prefix; `validate_registry.py` checks the
correspondence). Blank-line grouping between sections, as in `en/erc20.json`.

```jsonc
{
  "short": "…",                       // REQUIRED
  "introduction": "…",                // REQUIRED
  "designPurpose": "…",               // REQUIRED
  "commonUsage": "…",                 // REQUIRED

  "fn.<name>.desc": "…",              // one per function
  "fn.<name>.params.<param>": "…",    // one per param
  "fn.<name>.returns.<ret>": "…",     // one per return

  "node.<id>": "…",                   // one per NON-function node (user/contract/storage/…)
  "edge.<label>": "…",                // one per labeled edge

  "sim.<scenario>.name": "…",
  "sim.<scenario>.desc": "…",
  "sim.<scenario>.param.<param>": "…",
  "sim.<scenario>.step.<id>": "…",        // one per step
  "sim.<scenario>.step.<id>.mobile": "…"  // one per step
}
```

### Length targets (match the existing 35-entry corpus)

| Key | Target | Corpus reality |
|---|---|---|
| `short` | ≤120 chars, Title-Case noun phrase, no trailing period | 19–96, median 34 |
| `introduction` | 350–520 chars | 362–521, median 453 |
| `designPurpose` | 350–520 chars | 354–478, median 423 |
| `commonUsage` | 350–520 chars (lower end acceptable) | 287–444, median 364 |
| `fn.*.desc` | 1–3 sentences, 60–230 chars | 39–232, median 122 |
| param/return descs | one sentence | — |
| `node.*` / `edge.*` | 1–4 words (`edge.*` verb-first: "Call transfer()", "Update balances", "Emit Transfer event") | — |
| `sim.*.step.*` | 1–2 sentences | — |
| `sim.*.step.*.mobile` | ≤5 words | — |

### Prose style (see style-guide.md for full rules)

- Factual, spec-grounded, third person, present tense. **No marketing fluff** — never
  "revolutionary", "powerful", "seamless", "game-changing".
- `introduction`: sentence 1 — what the standard defines; sentence 2 — proposer(s) and
  month+year **from the EIP frontmatter** (`author:` / `created:`), e.g. "It was proposed
  by Fabian Vogelsteller in November 2015."; remaining sentences — the core mechanism.
  For non-Final specs append the status caveat boilerplate (style-guide.md §4).
- `designPurpose`: the problem before this standard and how the design solves it
  ("<name> was designed to …").
- `commonUsage`: who/what uses it. Name concrete adopters ONLY when certain
  (flagship-level knowledge); otherwise describe use-case categories generically.

---

## 6. "Don't invent" rules (hard constraints)

1. `functions[]` come ONLY from the spec's Specification/interface section. No members
   from reference implementations, rationale sketches, or other ERCs.
2. Signatures verbatim (names, types, order, `indexed`). Never "improve" them.
3. Facts with a number, name, or date (authors, dates, slot constants, magic values,
   interface IDs) must be copied from the spec — never from memory.
4. **Unsure → omit.** Leave the optional field absent (`relations`, impl references,
   `defaultSimValues`, extension functions). No `TODO`, no placeholder text anywhere —
   a no-TODO gate greps for it. Record every deliberate omission in the batch report
   (`docs/agent-status/`, see batch-workflow.md §7).
5. Adoption claims must be hedged unless verifiable ("designed for …", "intended to …" vs
   "used by …").
6. Do not translate; do not touch non-`en` locales (dedicated translate stage).

---

## 7. Worked example — hypothetical "ERC-9999: Token Label Registry"

*(Fictitious standard, for shape calibration only — never ship an erc9999 entry. Assume a
catalog row: `{ "eip": 9999, "slug": "erc9999", "status": "Review", "requires": [165],
"tier": "B", "sourcePath": "ERCS/erc-9999.md" }` and a spec whose interface is
`setLabel(uint256,string)` + `labelOf(uint256) returns (string)` + event
`LabelSet(uint256 indexed id, string label)`.)*

### `src/data/standards/erc9999.ts`

```ts
import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc9999',
  name: 'ERC-9999',
  shortDescription: 'erc9999.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 9999,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-9999',
  relatedSlugs: ['erc165', 'erc721'],
  sortOrder: 19999,
  eipStatus: 'Review',
  tier: 'B',
  published: false,

  // ─── Schema v2 ───
  requires: [165],
  relations: [{ slug: 'erc165', kind: 'requires' }],
  references: [
    { label: 'ERC-9999 Specification', url: 'https://eips.ethereum.org/EIPS/eip-9999', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc9999.introduction',
  designPurpose: 'erc9999.designPurpose',
  commonUsage: 'erc9999.commonUsage',

  functions: [
    {
      name: 'setLabel',
      signature: 'setLabel(uint256 id, string label)',
      type: 'write',
      params: [
        { name: 'id', type: 'uint256', description: 'erc9999.fn.setLabel.params.id' },
        { name: 'label', type: 'string', description: 'erc9999.fn.setLabel.params.label' },
      ],
      description: 'erc9999.fn.setLabel.desc',
      defaultSimValues: { id: '1', label: 'Treasury' },
    },
    {
      name: 'labelOf',
      signature: 'labelOf(uint256 id) → string',
      type: 'read',
      params: [{ name: 'id', type: 'uint256', description: 'erc9999.fn.labelOf.params.id' }],
      returns: [{ name: 'label', type: 'string', description: 'erc9999.fn.labelOf.returns.label' }],
      description: 'erc9999.fn.labelOf.desc',
      defaultSimValues: { id: '1' },
    },
    {
      name: 'LabelSet',
      signature: 'LabelSet(uint256 indexed id, string label)',
      type: 'event',
      params: [
        { name: 'id', type: 'uint256', description: 'erc9999.fn.LabelSet.params.id' },
        { name: 'label', type: 'string', description: 'erc9999.fn.LabelSet.params.label' },
      ],
      description: 'erc9999.fn.LabelSet.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc9999.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'erc9999-contract',
      type: 'contract',
      label: 'erc9999.node.contract',
      data: { functions: ['setLabel', 'labelOf'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-setLabel',
      type: 'function',
      label: 'setLabel()',
      data: { fnType: 'write', signature: 'setLabel(uint256 id, string label)' },
    },
    {
      id: 'storage-labels',
      type: 'storage',
      label: 'erc9999.node.storageLabels',
      data: { slots: [{ key: '_labels', label: 'mapping(uint256 => string)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-labelSet',
      type: 'function',
      label: 'LabelSet event',
      data: { fnType: 'event', signature: 'LabelSet(uint256 indexed id, string label)' },
    },
  ],

  flowEdges: [
    { id: 'e-user-setLabel', source: 'user', target: 'fn-setLabel', type: 'animated', label: 'erc9999.edge.callSetLabel' },
    { id: 'e-setLabel-contract', source: 'fn-setLabel', target: 'erc9999-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc9999-contract', target: 'storage-labels', type: 'labeled', label: 'erc9999.edge.updateLabels' },
    { id: 'e-contract-event', source: 'erc9999-contract', target: 'event-labelSet', type: 'labeled', label: 'erc9999.edge.emitLabelSet' },
  ],

  elkLayoutOptions: {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    'elk.spacing.nodeNode': '40',
  },

  // ─── ERCSimulation ───
  simulations: [
    {
      id: 'set-label-walkthrough',
      name: 'erc9999.sim.setLabelWalkthrough.name',
      description: 'erc9999.sim.setLabelWalkthrough.desc',
      params: [
        { id: 'id', label: 'erc9999.sim.setLabelWalkthrough.param.id', type: 'uint256', defaultValue: '1' },
        {
          id: 'label',
          label: 'erc9999.sim.setLabelWalkthrough.param.label',
          type: 'select', // param types are address|uint256|bool|select — represent string inputs as a select
          options: [
            { label: 'Treasury', value: 'Treasury' },
            { label: 'Vesting', value: 'Vesting' },
          ],
          defaultValue: 'Treasury',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc9999.sim.setLabelWalkthrough.step.call',
          mobileDescription: 'erc9999.sim.setLabelWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-setLabel'],
          highlightEdges: ['e-user-setLabel'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc9999.sim.setLabelWalkthrough.step.execute',
          mobileDescription: 'erc9999.sim.setLabelWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-setLabel', 'erc9999-contract', 'storage-labels'],
          highlightEdges: ['e-setLabel-contract', 'e-contract-storage'],
          valueChanges: { 'storage-labels._labels[1]': '"" → "Treasury"' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc9999.sim.setLabelWalkthrough.step.event',
          mobileDescription: 'erc9999.sim.setLabelWalkthrough.step.event.mobile',
          highlightNodes: ['erc9999-contract', 'event-labelSet'],
          highlightEdges: ['e-contract-event'],
          valueChanges: { 'event-labelSet.lastEvent': 'LabelSet(1, "Treasury")' },
          durationMs: 800,
        },
      ],
    },
  ],
};
```

### `src/i18n/locales/en/erc9999.json`

```json
{
  "short": "Token Label Registry",
  "introduction": "ERC-9999 defines a minimal registry interface for attaching human-readable labels to numeric identifiers such as token IDs. It was proposed by Jane Doe in March 2026. The standard specifies one write function to set a label, one read function to query it, and an event that notifies indexers of changes, allowing wallets and explorers to display consistent names without off-chain metadata services. Note: ERC-9999 is in Review status; the interface may still change before it is finalized.",
  "designPurpose": "ERC-9999 was designed to remove the need for ad-hoc, per-project labeling schemes. Before it, every application stored display names in its own contract layout or off-chain database, so labels could not be shared across wallets, explorers, and marketplaces. By standardizing a single mapping-backed interface with a change event, ERC-9999 makes labels discoverable through one predictable call and keeps indexers synchronized through LabelSet events.",
  "commonUsage": "Label registries are used by DAO treasuries to name positions, by NFT platforms to attach display names to token IDs, and by explorers that render human-readable identifiers instead of raw numbers. Because the interface is a single mapping with an event, it is typically deployed as a small standalone registry or mixed into an existing ERC-721 contract alongside ERC-165 interface detection.",

  "fn.setLabel.desc": "Assigns a human-readable label to the given identifier, overwriting any previous value. Emits a LabelSet event so off-chain indexers can track changes.",
  "fn.setLabel.params.id": "The numeric identifier to label.",
  "fn.setLabel.params.label": "The human-readable label to store.",

  "fn.labelOf.desc": "Returns the label currently assigned to the given identifier, or an empty string if none has been set.",
  "fn.labelOf.params.id": "The numeric identifier to query.",
  "fn.labelOf.returns.label": "The label stored for the identifier.",

  "fn.LabelSet.desc": "Emitted whenever a label is assigned or overwritten for an identifier.",
  "fn.LabelSet.params.id": "The identifier whose label changed.",
  "fn.LabelSet.params.label": "The new label value.",

  "node.user": "Registry User",
  "node.contract": "ERC-9999 Registry",
  "node.storageLabels": "Label Storage",

  "edge.callSetLabel": "Call setLabel()",
  "edge.updateLabels": "Update labels",
  "edge.emitLabelSet": "Emit LabelSet event",

  "sim.setLabelWalkthrough.name": "Set Label Walkthrough",
  "sim.setLabelWalkthrough.desc": "Follow a setLabel call from the user through storage to the LabelSet event.",
  "sim.setLabelWalkthrough.param.id": "Identifier",
  "sim.setLabelWalkthrough.param.label": "Label text",
  "sim.setLabelWalkthrough.step.call": "The user calls setLabel(id, label) on the registry contract to assign a label.",
  "sim.setLabelWalkthrough.step.call.mobile": "Call setLabel()",
  "sim.setLabelWalkthrough.step.execute": "The contract writes the label into the _labels mapping, overwriting any previous value for the identifier.",
  "sim.setLabelWalkthrough.step.execute.mobile": "Store the label",
  "sim.setLabelWalkthrough.step.event": "The contract emits LabelSet(id, label) so indexers and UIs can refresh their cached names.",
  "sim.setLabelWalkthrough.step.event.mobile": "Emit LabelSet event"
}
```

---

## 8. Self-check before hand-off (author agent runs mentally, gates run mechanically)

- [ ] Every i18n key referenced in the `.ts` exists (un-prefixed) in the en JSON, and vice versa — no orphan keys.
- [ ] Every edge `source`/`target` and every `highlightNodes`/`highlightEdges` id exists.
- [ ] All signatures match the spec text character-for-character (modulo the ` → ` formatting).
- [ ] `eipStatus`, `requires`, `sortOrder = 10000 + eip` match the catalog.json row; `tier: 'B'`, `published: false`.
- [ ] No `TODO`, no empty-string values, no English left untranslatable (e.g. hard-coded prose in the `.ts`).
- [ ] Length targets met; status caveat present for non-Final specs.
- [ ] Omissions (dropped functions, skipped extensions, unknown facts) listed in the batch report.
