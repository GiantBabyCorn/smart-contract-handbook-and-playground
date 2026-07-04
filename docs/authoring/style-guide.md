# Content Style Guide (normative, all entries)

Cross-entry consistency rules for every author, fact-check, and translate agent. The Tier B
mechanics live in `docs/authoring/tierB-template.md`; this file governs voice, terminology,
cross-references, status caveats, and link selection for **all** tiers.

---

## 1. Terminology

- **English is the source locale.** Write technical terms the way the specs do:
  "allowance", "operator", "storage slot", "interface ID", "domain separator". Identifiers
  (`transfer()`, `balanceOf`, `tokenId`, event names) are code, never reworded.
- **Every non-English locale has a normative glossary** in `docs/i18n-glossary/<lng>.md`
  (zh-CN, zh-TW, ja, ko, es). Translate agents receive the glossary in their prompt and
  must use the canonical column verbatim; each glossary also fixes the keep-English list
  and locale punctuation/voice rules. Highlights that are easy to get wrong:
  - zh-TW: 介面／函式／智能合約／實作合約／授權額度 — never 接口／函数／实现合约; `nonce`
    stays English (never 隨機數).
  - zh-CN: 接口／函数／实现合约／授权额度; `nonce` stays English (never 随机数).
  - ja: インターフェース／アローワンス／署名; `delegatecall` stays English.
  - ko: 인터페이스／허용량／논스; `Timelock` stays English.
  - es: interfaz／asignación (allowance)／billetera; vault/pool/hook/staking stay English.
- One concept = one term within an entry. Do not alternate synonyms for elegance.

## 2. Prose voice (en)

- Third person, present tense, declarative. Spec-grounded facts only; **no marketing
  language** (banned: revolutionary, powerful, seamless, cutting-edge, game-changing,
  unlock, empower).
- Explanations name the mechanism, not the vibe: "computed as keccak256 of a well-known
  string minus 1" beats "cleverly avoids collisions".
- `introduction` states what the standard defines, who proposed it and when (from the EIP
  frontmatter only), and the core mechanism. `designPurpose` = problem → design answer
  ("X was designed to …"). `commonUsage` = concrete consumer categories; name projects only
  at flagship certainty (USDC for ERC-20, OpenSea for ERC-721 class).
- Analogies are allowed once per entry, short, and physical ("like a dollar bill…" in
  erc20). No second-person tutorials in entry prose ("you can then…" → "callers can then…").

### Capitalization conventions (en)

| Surface | Style | Examples from the corpus |
|---|---|---|
| `short` | Title Case noun phrase, no period | "Fungible Token Standard", "Proxy Storage Slots Standard" |
| `sim.*.name` | Title Case | "Basic Token Transfer", "Proxy Delegatecall Flow" |
| `node.*` | Title Case role name | "Token Holder", "Approved Spender", "Standard Storage Slots" |
| `edge.*` | Sentence case, verb first | "Call transfer()", "Update balances", "Emit Transfer event" |
| `sim.*.step.*.mobile` | Sentence case, ≤5 words | "Validate & update balances" |
| Prose | Normal sentences | — |

## 3. Referencing other ERCs

- In prose: **"ERC-20"** with an ASCII hyphen; "EIP-712" for protocol-layer EIPs that are
  not ERCs. First mention in a section uses the full form; never bare "20" or "erc20" in
  prose. When an entry exists on the site, the number alone is enough — do not write URLs
  inside prose strings (link surfaces come from structured fields).
- Structured cross-references, in priority order:
  1. `requires: number[]` — copy of the spec frontmatter `requires:` (catalog.json is the
     source; do not curate).
  2. `relations: { slug, kind }[]` — typed, curated. `extends` (this ERC builds on the
     target's interface), `requires` (functional dependency with an in-site entry),
     `alternative` (competing design, e.g. erc1155 vs erc721), `usedWith` (common pairing,
     e.g. erc2612 with erc20). Slugs must exist in generated `allMeta.ts`.
  3. `relatedSlugs: string[]` — the 2–4 "see also" links shown in the UI; the data file is
     the single source of truth for it. Same existence rule.
- A protocol composing standards is `composes` territory (Phase 5), not `relations`.

## 4. Status caveat boilerplate (en)

For any standard whose `eipStatus` ≠ `Final`, append the matching sentence to the END of
`introduction` (translations adapt it per locale glossary/style):

| eipStatus | Boilerplate |
|---|---|
| `Draft` | "Note: ERC-<N> is a Draft; the specification is still under active development and may change substantially." |
| `Review` | "Note: ERC-<N> is in Review status; the interface may still change before it is finalized." |
| `Last Call` | "Note: ERC-<N> is in Last Call, the final review window before it becomes Final." |
| `Stagnant` | "Note: ERC-<N> is Stagnant — it has been inactive for 6+ months and may never be finalized, but remains historically or technically significant." |
| `Withdrawn` | (not catalogued — `included: false` in catalog.json) |

Do not soften or editorialize the caveat, and never claim a Draft/Stagnant standard is
"widely adopted" without a verifiable example.

## 5. Reference links (`references[]`)

- **spec (required, exactly one):** derive from the catalog row's `sourcePath`:
  - `ERCS/erc-<N>.md` or `EIPS/eip-<N>.md` → `https://eips.ethereum.org/EIPS/eip-<N>`.
    This is the canonical form used across the project (`officialUrl` of all existing
    entries); `https://ercs.ethereum.org/ERCS/erc-<N>` is the same document and acceptable
    only when citing ERC-repo-specific content in reports — data files always use
    eips.ethereum.org. Label: `'ERC-<N> Specification'` (or `'EIP-<N> Specification'`),
    kind `'spec'`.
- **impl (optional, 0–2):** ONLY these hosts, pinned to the official orgs:
  - OpenZeppelin — `https://github.com/OpenZeppelin/openzeppelin-contracts` (deep-link to
    the specific contract path when known, e.g. `.../blob/master/contracts/token/ERC20/ERC20.sol`)
  - Solady — `https://github.com/Vectorized/solady`
  - Solmate — `https://github.com/transmissions11/solmate`
  Include an impl link only when that library actually ships an implementation of this
  exact standard (verify the file exists in the repo tree; unsure → omit). Label = library
  name + contract ("OpenZeppelin ERC20"), kind `'impl'`.
- **audit / article:** Tier A territory (security sections); Tier B entries omit them.
- All URLs https (validate_registry enforces); no blog posts, no aggregator sites, no
  eipsinsight/ethereum.org tutorials in `references[]`.
- Labels are literal proper nouns — they are NOT i18n keys and are never translated.

## 6. Flow & simulation naming

- Node ids: `user`, `<slug>-contract`, `fn-<camelName>`, `storage-<what>`,
  `event-<camelName>`, counterparties `recipient`/`spender`/`operator`.
- Edge ids: `e-<from>-<to>` with short segment names (`e-user-transfer`,
  `e-contract-storage`).
- Function-node labels are literal code (`'transfer()'`, `'Transfer event'`); all other
  node labels and all edge labels are slug-prefixed i18n keys.
- Scenario ids kebab-case (`basic-transfer`); their i18n section camelCase
  (`sim.basicTransfer.*`). Step ids `step-<what>`.

## 7. i18n key discipline

Follow `docs/I18N_CONVENTIONS.md`. Entry namespaces use flat dotted keys (`fn.transfer.desc`)
in the JSON; the data file references them slug-prefixed (`erc20.fn.transfer.desc`).
camelCase segments; no underscores except i18next plurals; every en key must exist in all
6 locales after the translate stage (`lint_i18n_keys.py` enforces parity and an
identical-to-en ratio ≤ 0.08 per locale).
