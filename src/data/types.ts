// ─── 基礎分類 ───
export type Category =
  | 'token' | 'nft' | 'proxy' | 'defi' | 'account'
  | 'utility' | 'identity' | 'oracle' | 'governance'
  | 'cross-chain' | 'rwa';

export type EntryType = 'standard' | 'protocol';

export interface ContractFunction {
  name: string;
  signature: string;
  type: 'read' | 'write' | 'event';
  params: FunctionParam[];
  returns?: FunctionParam[];
  description: string;
  defaultSimValues?: Record<string, string>;
}

export interface FunctionParam {
  name: string;
  type: string;
  description: string;
}

// FlowNodeDef as discriminated union (no position - elkjs handles layout):
interface ContractNodeData { functions?: string[]; }
interface FunctionNodeData { fnType: 'read' | 'write' | 'event'; signature?: string; }
interface UserNodeData { address?: string; balance?: string; }
interface ProxyNodeData { implementation?: string; }
interface StorageNodeData { slots?: Array<{ key: string; label: string }>; }
interface TokenFlowNodeData { symbol?: string; amount?: string; }

export type FlowNodeDef =
  | { id: string; type: 'contract'; label: string; data: ContractNodeData; layoutHint?: string }
  | { id: string; type: 'function'; label: string; data: FunctionNodeData; layoutHint?: string }
  | { id: string; type: 'user'; label: string; data: UserNodeData; layoutHint?: string }
  | { id: string; type: 'proxy'; label: string; data: ProxyNodeData; layoutHint?: string }
  | { id: string; type: 'storage'; label: string; data: StorageNodeData; layoutHint?: string }
  | { id: string; type: 'tokenFlow'; label: string; data: TokenFlowNodeData; layoutHint?: string };

export interface FlowEdgeDef {
  id: string;
  source: string;
  target: string;
  type: 'animated' | 'labeled' | 'fundFlow';
  label?: string;
  data?: Record<string, unknown>;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  params: SimulationParam[];
  steps: SimulationStep[];
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
}

export interface ERCMeta {
  slug: string;
  name: string;
  shortDescription: string;
  category: Category;
  entryType: EntryType;
  officialUrl: string;
  relatedSlugs: string[];
  sortOrder: number;
}

export interface ERCContent {
  introduction: string;
  designPurpose: string;
  commonUsage: string;
  functions: ContractFunction[];
}

export interface ERCFlow {
  flowNodes: FlowNodeDef[];
  flowEdges: FlowEdgeDef[];
  elkLayoutOptions?: Record<string, string>;
}

export interface ERCSimulation {
  simulations: SimulationScenario[];
}

interface BaseEntry extends ERCMeta, ERCContent, ERCFlow, ERCSimulation {}

export interface StandardEntry extends BaseEntry {
  entryType: 'standard';
  eipNumber: number;
}

export interface ProtocolEntry extends BaseEntry {
  entryType: 'protocol';
  contracts?: Array<{ chain: string; address: string; label: string }>;
  version?: string;
}

export type ERCEntry = StandardEntry | ProtocolEntry;
