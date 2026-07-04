export const meta = {
  name: 'erc-batch-author',
  description: 'Author, fact-check, and translate a batch of Tier B ERC catalog entries',
  phases: [
    { title: 'Author', detail: 'write data + en JSON from the official spec' },
    { title: 'Verify', detail: 'clean-context fact-check against the spec' },
    { title: 'Translate', detail: 'zh-CN/zh-TW/ja/ko/es from the en JSON' },
  ],
}

// args = [{ eip, slug, title, status, requires, sourcePath }, ...]
const rows = typeof args === 'string' ? JSON.parse(args) : args
const REPO = 'C:/data/github/smart-contract-handbook-and-playground'

const AUTHOR_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'wroteData', 'wroteEn', 'category', 'hasInterface', 'functionCount', 'omissions', 'notes'],
  properties: {
    slug: { type: 'string' },
    wroteData: { type: 'boolean', description: 'wrote src/data/standards/<slug>.ts' },
    wroteEn: { type: 'boolean', description: 'wrote src/i18n/locales/en/<slug>.json' },
    category: { type: 'string' },
    hasInterface: { type: 'boolean', description: 'spec defines a Solidity interface' },
    functionCount: { type: 'integer' },
    omissions: { type: 'array', items: { type: 'string' }, description: 'dropped functions/extensions/unknown facts' },
    notes: { type: 'string' },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'pass', 'signaturesVerified', 'keyCorrespondenceOk', 'flowIdsOk', 'issues'],
  properties: {
    slug: { type: 'string' },
    pass: { type: 'boolean' },
    signaturesVerified: { type: 'boolean', description: 'every functions[].signature appears verbatim in the spec Specification section' },
    keyCorrespondenceOk: { type: 'boolean', description: 'every i18n key in the .ts exists unprefixed in en JSON and vice-versa (no orphans)' },
    flowIdsOk: { type: 'boolean', description: 'every edge source/target and highlight id exists in flowNodes/flowEdges' },
    issues: { type: 'array', items: { type: 'string' } },
  },
}

const TRANSLATE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'ok', 'locales', 'notes'],
  properties: {
    slug: { type: 'string' },
    ok: { type: 'boolean' },
    locales: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
}

function specPath(row) {
  return `${REPO}/.cache/ercs-repo/${row.sourcePath}`
}

function authorPrompt(row, priorIssues) {
  const fix = priorIssues && priorIssues.length
    ? `\n\n## THIS IS A RE-AUTHOR — a fact-check found problems. Fix ALL of these, then rewrite BOTH files completely:\n${priorIssues.map((i) => `- ${i}`).join('\n')}\n`
    : ''
  return `You are authoring ONE Tier B ERC catalog entry for the Smart Contract Handbook (${REPO}). Follow the normative template EXACTLY.

## Read first (in this order)
1. ${REPO}/docs/authoring/tierB-template.md — the complete authoring contract (read it fully; the §7 worked example is your shape reference).
2. ${REPO}/docs/authoring/style-guide.md — voice, status caveats, reference-link rules.
3. The official spec: ${specPath(row)} — read it fully, including the YAML frontmatter (author:, created:) for the introduction, and the "## Specification" section for the interface.

## Catalog row (authoritative — copy these verbatim, never guess)
${JSON.stringify(row)}
- eipStatus = "${row.status}"; requires = ${JSON.stringify(row.requires)} (omit the field if empty); sortOrder = ${10000 + row.eip}; officialUrl/spec ref = https://eips.ethereum.org/EIPS/eip-${row.eip}; tier = "B"; published = false.

## Produce EXACTLY two files (nothing else — do NOT touch catalog.json, allMeta.ts, other locales, or any shared file)
- ${REPO}/src/data/standards/${row.slug}.ts  (a StandardEntry, per template §1–§4)
- ${REPO}/src/i18n/locales/en/${row.slug}.json (flat dotted keys WITHOUT the slug prefix, per template §5)

## Critical rules
- functions[] come ONLY from the spec's Specification/interface section, signatures verbatim (names/types/order/indexed), reformatted with the " → " arrow for returns. If the spec defines NO Solidity interface (a URI scheme, an encoding algorithm, a storage-layout formula, a pure convention), set functions: [] — NEVER invent an interface.
- Flow (template §3): when there IS an interface, use the user → contract(with function children) → storage/event shape. When there is NO interface, build a minimal CONCEPTUAL flow of 5–7 valid nodes that models the standard's process (e.g. an actor node → an "encoder"/"processor" contract-type node → a result/consumer node), still using node types from {user, contract, function, storage}, with valid edges (every edge source/target must be a node id) and node labels as i18n keys (except function-type nodes whose labels are literal code). Always include exactly ONE walkthrough simulation whose highlightNodes/highlightEdges reference only ids you defined.
- Every i18n key referenced in the .ts MUST exist (unprefixed) in the en JSON, and the en JSON must have NO orphan keys. Length targets and prose style per template §5. Introduction sentence 2 = proposer + month/year from the frontmatter.
- STATUS CAVEAT: this entry's status is "${row.status}". If it is NOT "Final", append a status-caveat sentence to the introduction per style-guide.md §4, matched to the actual status — e.g. Draft: "Note: ERC-${row.eip} is a Draft; its interface may change before finalization." / Review: "Note: ERC-${row.eip} is in Review and not yet final." / Last Call: "Note: ERC-${row.eip} is in Last Call, the final review window before acceptance." / Stagnant: "Note: ERC-${row.eip} is Stagnant (inactive) and was never finalized; it is documented here for reference." Use the real status word.
- No TODO, no placeholder, no empty strings. Facts with a number/name/date copied from the spec only.
- category: pick ONE of token|nft|proxy|defi|account|utility|identity|oracle|governance|cross-chain|rwa from the subject matter.
- relatedSlugs: 2–4 slugs that are ALREADY published entries. Safe published slugs to reference: erc20, erc721, erc1155, erc165, erc173, erc2981, erc4626, erc2612, erc1271, erc5267, erc1967, erc1822, erc2535, erc4337, erc6551, erc7702, erc7579, erc6900, erc4361, erc3525, erc3643, erc7683, erc55, erc681, erc1046, erc2098, erc5219, erc5564, erc5679, erc5750, erc7201, erc7540. Only use slugs from THIS list (do not reference other batch-mates in the current run — they are not published yet).
${fix}
Verify your two files against the template §8 self-check before finishing. Return the structured result. Your final message must be ONLY the tool call.`
}

function verifyPrompt(row) {
  return `You are an ADVERSARIAL fact-checker with fresh eyes. An agent just authored a Tier B entry for ERC-${row.eip}. Verify it against the official spec — assume it is WRONG until proven right.

## Read
1. The authored data file: ${REPO}/src/data/standards/${row.slug}.ts
2. The authored English strings: ${REPO}/src/i18n/locales/en/${row.slug}.json
3. The official spec: ${specPath(row)}
4. The contract it must follow: ${REPO}/docs/authoring/tierB-template.md (§2, §5, §6, §8).

## Catalog row (authoritative)
${JSON.stringify(row)}

## Checklist — every item must hold or it is a FAIL
1. Every functions[].signature appears VERBATIM in the spec's "## Specification" interface (names, types, order, indexed markers). No invented members; no members from reference implementations. If functions:[] , confirm the spec genuinely has no Solidity interface.
2. eipStatus == "${row.status}", requires matches ${JSON.stringify(row.requires)} (or omitted iff empty), eipNumber == ${row.eip}, officialUrl/spec ref == https://eips.ethereum.org/EIPS/eip-${row.eip}, sortOrder == ${10000 + row.eip}, tier == 'B', published == false.
3. Every factual claim in introduction/designPurpose/commonUsage is supported by the spec, or is properly hedged ("designed to…", not "used by…" unless flagship-certain). The proposer name + month/year in the introduction match the spec frontmatter (author:/created:).
4. KEY CORRESPONDENCE: every i18n key referenced in the .ts exists (unprefixed) in the en JSON, and the en JSON has NO orphan keys. Report any mismatch precisely.
5. FLOW INTEGRITY: every flowEdge source/target is a defined node id; every simulation highlightNodes/highlightEdges id exists; contract node data.functions names match real function names.
6. No TODO / placeholder / empty-string values anywhere. Length targets roughly met (intro/design/usage 300–520 chars; short ≤120).
7. relatedSlugs are all in the published set (see the template's list).

Do NOT edit any file — you only judge. Set pass=false if ANY item fails, listing each concrete problem in issues[] so the author can fix it. Set signaturesVerified/keyCorrespondenceOk/flowIdsOk per checks 1/4/5. Return the structured verdict as your only output.`
}

function translatePrompt(row) {
  return `You are translating ONE authored English entry into 5 locales for the Smart Contract Handbook (${REPO}).

## Read
1. The English source: ${REPO}/src/i18n/locales/en/${row.slug}.json (the exact key set you must reproduce).
2. ALL five glossaries: ${REPO}/docs/i18n-glossary/{zh-CN,zh-TW,ja,ko,es}.md (canonical term translations + keep-English lists — obey them).
3. ${REPO}/docs/authoring/style-guide.md (i18n discipline).

## Write EXACTLY these 5 files (same flat keys as the en file, translated values)
- ${REPO}/src/i18n/locales/zh-CN/${row.slug}.json
- ${REPO}/src/i18n/locales/zh-TW/${row.slug}.json
- ${REPO}/src/i18n/locales/ja/${row.slug}.json
- ${REPO}/src/i18n/locales/ko/${row.slug}.json
- ${REPO}/src/i18n/locales/es/${row.slug}.json

## Rules
- Reproduce the EXACT same set of keys as the en file — no added/dropped keys (parity is gated).
- Follow each glossary's canonical terms. zh-TW MUST use Taiwan Traditional forms (介面 not 接口, 函式 not 函数, 代幣, 簽章, 實作, 重入攻擊) — and must contain ZERO simplified-only characters (a lint gate checks this). zh-CN uses Simplified (接口/函数/代币). Keep English the terms each glossary lists as keep-English (e.g. nonce, gas, wei, calldata, EIP/ERC numbers, Solidity function names, type names). es needs proper diacritics (función, dirección, estándar, …).
- Do NOT translate: function/event names, Solidity signatures, code literals, proper nouns, ERC-N identifiers.
- Values only — never translate keys. Keep JSON valid; no trailing commas; UTF-8.
- Touch ONLY these 5 files. Do not modify the en file or anything else.

Return the structured result (locales you wrote). Your final message must be ONLY the tool call.`
}

log(`Batch: ${rows.length} entries — ${rows.map((r) => r.slug).join(', ')}`)

const results = await pipeline(
  rows,
  // Stage 1: author -> verify -> (reauthor -> reverify once)
  async (row) => {
    await agent(authorPrompt(row, null), { schema: AUTHOR_SCHEMA, phase: 'Author', label: `author:${row.slug}` })
    let verdict = await agent(verifyPrompt(row), { schema: VERDICT_SCHEMA, phase: 'Verify', label: `verify:${row.slug}` })
    if (!verdict || !verdict.pass) {
      const issues = (verdict && verdict.issues) || ['fact-check returned no verdict; re-author defensively']
      log(`${row.slug}: verify FAIL (${issues.length} issue(s)) — re-authoring once`)
      await agent(authorPrompt(row, issues), { schema: AUTHOR_SCHEMA, phase: 'Author', label: `reauthor:${row.slug}` })
      verdict = await agent(verifyPrompt(row), { schema: VERDICT_SCHEMA, phase: 'Verify', label: `reverify:${row.slug}` })
    }
    return { row, verdict }
  },
  // Stage 2: translate only if the entry passed verification
  async (res) => {
    if (!res || !res.verdict || !res.verdict.pass) {
      return { slug: res && res.row ? res.row.slug : 'unknown', pass: false, translated: false, verdict: res ? res.verdict : null }
    }
    const t = await agent(translatePrompt(res.row), { schema: TRANSLATE_SCHEMA, phase: 'Translate', label: `i18n:${res.row.slug}` })
    return { slug: res.row.slug, pass: true, translated: !!(t && t.ok), verdict: res.verdict, translate: t }
  },
)

const clean = results.filter(Boolean)
const passed = clean.filter((r) => r.pass && r.translated).map((r) => r.slug)
const failed = clean.filter((r) => !r.pass || !r.translated)
log(`Done. Passed+translated: ${passed.length}/${rows.length}. Needs attention: ${failed.length}`)

return {
  passed,
  failed: failed.map((r) => ({ slug: r.slug, pass: r.pass, translated: r.translated, issues: r.verdict ? r.verdict.issues : null })),
  all: clean,
}
