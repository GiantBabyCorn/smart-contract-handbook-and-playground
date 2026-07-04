// ─── 基礎分類 ───
export type Category =
  | 'token'
  | 'nft'
  | 'proxy'
  | 'defi'
  | 'account'
  | 'utility'
  | 'identity'
  | 'oracle'
  | 'governance'
  | 'cross-chain'
  | 'rwa';

export type EntryType = 'standard' | 'protocol';

/** Lifecycle status from the official EIP/ERC document frontmatter (`status`).
 *  Rendered as a badge on list surfaces (sidebar / catalog). */
export type EipStatus = 'Draft' | 'Review' | 'Last Call' | 'Final' | 'Stagnant' | 'Withdrawn';

/** Content depth tier. 'A' = full spec (custom flow, >=2 scenarios incl. a revert path,
 *  security/code/gas notes). 'B' = condensed spec-extracted entry (template flow, generic sim).
 *  Absent = legacy full entry, treated as 'A'. See docs/adr/005. */
export type EntryTier = 'A' | 'B';

export interface ContractFunction {
  name: string;
  signature: string;
  type: 'read' | 'write' | 'event';
  params: FunctionParam[];
  returns?: FunctionParam[];
  description: string;
  defaultSimValues?: Record<string, string>;
  /** Optional pre-authored call path for interactive simulation.
   *  When provided, the interactive engine uses it directly instead of auto-tracing. */
  callPath?: Array<{ highlightNodes: string[]; highlightEdges: string[]; description: string }>;
}

export interface FunctionParam {
  name: string;
  type: string;
  description: string;
}

// FlowNodeDef as discriminated union (no position - elkjs handles layout):
interface ContractNodeData {
  functions?: string[];
}
interface FunctionNodeData {
  fnType: 'read' | 'write' | 'event';
  signature?: string;
}
interface UserNodeData {
  address?: string;
  balance?: string;
}
interface ProxyNodeData {
  implementation?: string;
}
interface StorageNodeData {
  slots?: Array<{ key: string; label: string }>;
}
interface TokenFlowNodeData {
  symbol?: string;
  amount?: string;
}
interface GroupNodeData {
  style?: 'default' | 'dashed';
}

export type FlowNodeDef =
  | {
      id: string;
      type: 'contract';
      label: string;
      data: ContractNodeData;
      layoutHint?: string;
      parentId?: string;
    }
  | {
      id: string;
      type: 'function';
      label: string;
      data: FunctionNodeData;
      layoutHint?: string;
      parentId?: string;
    }
  | {
      id: string;
      type: 'user';
      label: string;
      data: UserNodeData;
      layoutHint?: string;
      parentId?: string;
    }
  | {
      id: string;
      type: 'proxy';
      label: string;
      data: ProxyNodeData;
      layoutHint?: string;
      parentId?: string;
    }
  | {
      id: string;
      type: 'storage';
      label: string;
      data: StorageNodeData;
      layoutHint?: string;
      parentId?: string;
    }
  | {
      id: string;
      type: 'tokenFlow';
      label: string;
      data: TokenFlowNodeData;
      layoutHint?: string;
      parentId?: string;
    }
  | { id: string; type: 'group'; label: string; data: GroupNodeData; layoutHint?: string };

export interface FlowEdgeDef {
  id: string;
  source: string;
  target: string;
  type: 'animated' | 'labeled' | 'fundFlow';
  label?: string;
  data?: Record<string, unknown>;
}

// ─── Schema v2 選用區塊（全部 optional、向後相容；見 docs/adr/005）───

/** Security consideration rendered in the detail page "Security" section.
 *  `title`/`desc`/`mitigation` are i18n keys (slug-prefixed, e.g. 'erc20.sec.approveRace.title');
 *  `source` is a literal URL. */
export interface SecurityNote {
  severity: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  desc: string;
  mitigation?: string;
  source?: string;
}

/** Annotated code sample. `title` is an i18n key; `code` is literal source (never translated). */
export interface CodeExample {
  title: string;
  lang: 'solidity' | 'typescript';
  code: string;
}

/** Custom error / revert condition. `name` and `sig` are literal Solidity identifiers
 *  (e.g. 'ERC20InsufficientBalance', 'ERC20InsufficientBalance(address,uint256,uint256)');
 *  `condition` is an i18n key describing when it reverts. */
export interface ContractError {
  name: string;
  sig?: string;
  condition: string;
}

/** External reference link. `label` is a literal resource title — like `name`, `officialUrl`
 *  and `contracts[].label`, external proper nouns are not translated. `url` must be https. */
export interface Reference {
  label: string;
  url: string;
  kind: 'spec' | 'impl' | 'audit' | 'article';
}

/** Typed relation to another entry; richer complement of `relatedSlugs`. */
export interface EntryRelation {
  slug: string;
  kind: 'extends' | 'requires' | 'alternative' | 'usedWith';
}

/** One standard a protocol composes. Point to an in-site entry via `slug` and/or a raw
 *  EIP/ERC number via `erc` (for standards without an entry). `role` is an i18n key
 *  describing what the standard does inside the protocol. */
export interface ComposedStandard {
  slug?: string;
  erc?: number;
  role: string;
}

/** On-chain deployment record (all fields literal). Schema v2 successor of
 *  `ProtocolEntry.contracts` (same shape, `label` optional). */
export interface DeployedAddress {
  chain: string;
  address: string;
  label?: string;
}

/** Binds a simulation scenario to a real computation in simulation.worker.ts.
 *  `inputs` maps SimulationParam ids → worker argument names, e.g. { amountIn: 'dx' }. */
export interface ComputeBinding {
  kind: 'swap' | 'interest' | 'cdp' | 'stableswap' | 'rebase' | 'tokenTransfer';
  inputs: Record<string, string>;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  params: SimulationParam[];
  steps: SimulationStep[];
  /** Scenario flavour; absent = 'happy'. Tier A entries need >=1 'revert' scenario
   *  (or a step with `isRevert`) — enforced by validate_registry.py --strict-tier-a. */
  kind?: 'happy' | 'revert' | 'attack';
  /** When present, the engine derives valueChanges from a worker computation
   *  driven by user params instead of replaying the hard-coded ones. */
  compute?: ComputeBinding;
}

export interface SimulationParam {
  id: string;
  label: string;
  type: 'address' | 'uint256' | 'bool' | 'select';
  options?: { label: string; value: string }[];
  defaultValue: string;
}

export interface SimulationStep {
  id: string;
  description: string;
  mobileDescription?: string;
  highlightNodes: string[];
  highlightEdges: string[];
  valueChanges?: Record<string, string>;
  durationMs: number;
  /** Marks the step at which execution reverts (rendered with error styling). */
  isRevert?: boolean;
  /** i18n key for the revert reason (e.g. 'erc20.sim.insufficientBalance.revertReason'). */
  revertReason?: string;
}

export interface ERCMeta {
  slug: string;
  name: string;
  shortDescription: string;
  category: Category;
  entryType: EntryType;
  officialUrl: string;
  /** Optional on meta rows: the generated allMeta.ts / protocolsMeta.ts omit it
   *  (list surfaces never read it — RelatedEntries consumes the data-file value,
   *  which BaseEntry re-requires). */
  relatedSlugs?: string[];
  sortOrder: number;
  // Schema v2 list-surface metadata (badges/filtering in sidebar & catalog without
  // loading entry files; inherited by all entries via BaseEntry — see docs/adr/005):
  /** Official EIP/ERC status badge (standards only; absent for protocols). */
  eipStatus?: EipStatus;
  /** Catalog tier; absent = legacy full entry, treated as 'A'. */
  tier?: EntryTier;
  /** false = unreviewed skeleton, hidden from sidebar/catalog/search/sitemap.
   *  Absent = published (all legacy entries). */
  published?: boolean;
  /** De-facto standard without an official EIP/ERC document (e.g. ERC-677, ERC-721A). */
  unofficial?: boolean;
}

export interface ERCContent {
  introduction: string;
  designPurpose: string;
  commonUsage: string;
  functions: ContractFunction[];
  // Schema v2 detail-page content sections (all optional):
  /** "Security considerations" section. */
  security?: SecurityNote[];
  /** "Code examples" section. */
  codeExamples?: CodeExample[];
  /** "Errors & reverts" section. */
  errors?: ContractError[];
  /** i18n key for the "Gas notes" section body. */
  gasNotes?: string;
  /** "References" section (spec/impl/audit/article links). */
  references?: Reference[];
}

export interface ERCFlow {
  flowNodes: FlowNodeDef[];
  flowEdges: FlowEdgeDef[];
  elkLayoutOptions?: Record<string, string>;
}

export interface ERCSimulation {
  simulations: SimulationScenario[];
}

interface BaseEntry extends ERCMeta, ERCContent, ERCFlow, ERCSimulation {
  /** Required on full entries (optional on bare meta rows) — feeds RelatedEntries. */
  relatedSlugs: string[];
  /** EIP numbers this entry depends on (EIP frontmatter `requires`). */
  requires?: number[];
  /** Typed cross-entry relations; complements `relatedSlugs` (slugs must exist). */
  relations?: EntryRelation[];
}

export interface StandardEntry extends BaseEntry {
  entryType: 'standard';
  eipNumber: number;
}

export interface ProtocolEntry extends BaseEntry {
  entryType: 'protocol';
  /** Deployed addresses (schema v1). New entries should prefer `addresses`; see docs/adr/005. */
  contracts?: Array<{ chain: string; address: string; label: string }>;
  version?: string;
  /** Standards this protocol composes — drives the case-study composition graph (Phase 5). */
  composes?: ComposedStandard[];
  /** Chains the protocol is deployed on (literal names, e.g. 'Ethereum', 'Arbitrum'). */
  chains?: string[];
  /** Canonical deployments (schema v2 successor of `contracts`). */
  addresses?: DeployedAddress[];
}

export type ERCEntry = StandardEntry | ProtocolEntry;
