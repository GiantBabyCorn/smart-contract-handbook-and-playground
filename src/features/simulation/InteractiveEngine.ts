import type {
  ContractFunction,
  FlowNodeDef,
  FlowEdgeDef,
  SimulationScenario,
  SimulationStep,
} from '@/data/types';

// ─── Options ─────────────────────────────────────────────────────────────────

/** Pre-translated step-description builders (defaults are English). */
export interface InteractiveStepTemplates {
  startAt: (label: string) => string;
  callReaches: (label: string) => string;
  updateStorage: (label: string) => string;
  emitEvent: (label: string) => string;
  interactWith: (label: string) => string;
}

export interface InteractiveTraceOptions {
  /** Trace from this node (the user-selected entry point). Falls back to the
   *  first 'user' node, then the first node without incoming edges. */
  startNodeId?: string;
  /** Resolves a raw node/edge label (possibly a slug-prefixed i18n key like
   *  'erc20.node.user') to display text. Defaults to identity, i.e. raw
   *  labels pass through unchanged. */
  resolveLabel?: (raw: string) => string;
  /** Overrides for the generated step descriptions. */
  templates?: Partial<InteractiveStepTemplates>;
}

const DEFAULT_TEMPLATES: InteractiveStepTemplates = {
  startAt: (label) => `Start from ${label}`,
  callReaches: (label) => `Call reaches ${label}`,
  updateStorage: (label) => `Update storage: ${label}`,
  emitEvent: (label) => `Emit event: ${label}`,
  interactWith: (label) => `Interact with ${label}`,
};

const identity = (raw: string): string => raw;

/**
 * Trace the call path of a function through the flow graph using BFS.
 *
 * Strategy:
 * 1. Find the entry point — `options.startNodeId` if given, else a 'user'
 *    node, else the first node with no incoming edges.
 * 2. Find the target — the contract/function node associated with `fn.name`.
 * 3. BFS from entry point following edges to build the path.
 * 4. For 'write' functions, append storage node steps (nodes connected to target).
 * 5. Generate SimulationStep[] with highlights and human-readable
 *    descriptions (node labels resolved via `options.resolveLabel`).
 */
export function traceCallPath(
  fn: ContractFunction,
  flowNodes: FlowNodeDef[],
  flowEdges: FlowEdgeDef[],
  options: InteractiveTraceOptions = {},
): SimulationStep[] {
  const fnNameLower = fn.name.toLowerCase();
  const resolve = options.resolveLabel ?? identity;
  const templates: InteractiveStepTemplates = {
    ...DEFAULT_TEMPLATES,
    ...options.templates,
  };

  const nodeById = new Map(flowNodes.map((n) => [n.id, n]));
  const labelOf = (nodeId: string): string => {
    const node = nodeById.get(nodeId);
    return node ? resolve(node.label) : nodeId;
  };

  // Build adjacency list
  const adjacency = new Map<string, Array<{ nodeId: string; edgeId: string }>>();
  for (const edge of flowEdges) {
    const list = adjacency.get(edge.source) ?? [];
    list.push({ nodeId: edge.target, edgeId: edge.id });
    adjacency.set(edge.source, list);
  }

  // Find the entry point: the caller-selected start node wins, then a 'user'
  // node, then a node with no incoming edges.
  const incomingSet = new Set(flowEdges.map((e) => e.target));
  const selectedNode = options.startNodeId
    ? flowNodes.find((n) => n.id === options.startNodeId)
    : undefined;
  const userNode = flowNodes.find((n) => n.type === 'user');
  const entryNode =
    selectedNode ??
    userNode ??
    flowNodes.find((n) => !incomingSet.has(n.id)) ??
    flowNodes[0];
  if (!entryNode) return [];

  // Find the target node: contract/function node whose functions list or label matches fn.name
  const targetNode = flowNodes.find((n) => {
    if (n.type === 'function') {
      return n.label.toLowerCase().includes(fnNameLower);
    }
    if (n.type === 'contract' && n.data.functions) {
      return n.data.functions.some((f) =>
        f.toLowerCase().includes(fnNameLower),
      );
    }
    return false;
  });

  // BFS from entry to target
  const path = bfsPath(entryNode.id, targetNode?.id, adjacency);

  const steps: SimulationStep[] = [];
  let stepIdx = 0;

  // Generate a step for each hop in the path
  for (let i = 0; i < path.length; i++) {
    const hop = path[i];
    const highlightNodes = [hop.nodeId];
    const highlightEdges: string[] = [];

    if (hop.edgeId) {
      highlightEdges.push(hop.edgeId);
      // Also highlight the previous node
      if (i > 0) highlightNodes.unshift(path[i - 1].nodeId);
    }

    steps.push({
      id: `interactive-step-${stepIdx++}`,
      description:
        i === 0
          ? templates.startAt(labelOf(hop.nodeId))
          : templates.callReaches(labelOf(hop.nodeId)),
      highlightNodes,
      highlightEdges,
      durationMs: 1000,
    });
  }

  // For 'write' functions, look for connected storage nodes from the target
  if (fn.type === 'write' && targetNode) {
    const storageEdges = flowEdges.filter(
      (e) =>
        (e.source === targetNode.id || e.target === targetNode.id) &&
        flowNodes.some(
          (n) =>
            n.type === 'storage' &&
            (n.id === e.source || n.id === e.target),
        ),
    );
    for (const se of storageEdges) {
      const storageNodeId =
        se.source === targetNode.id ? se.target : se.source;
      steps.push({
        id: `interactive-step-${stepIdx++}`,
        description: templates.updateStorage(labelOf(storageNodeId)),
        highlightNodes: [targetNode.id, storageNodeId],
        highlightEdges: [se.id],
        durationMs: 1200,
      });
    }
  }

  // For event functions, look for event-related nodes
  if (fn.type === 'event' || fn.type === 'write') {
    const eventNodes = flowNodes.filter(
      (n) =>
        n.type === 'function' &&
        n.data.fnType === 'event' &&
        flowEdges.some(
          (e) =>
            (e.source === targetNode?.id && e.target === n.id) ||
            (e.target === targetNode?.id && e.source === n.id),
        ),
    );
    for (const en of eventNodes) {
      const connectingEdge = flowEdges.find(
        (e) =>
          (e.source === targetNode?.id && e.target === en.id) ||
          (e.source === en.id && e.target === targetNode?.id),
      );
      steps.push({
        id: `interactive-step-${stepIdx++}`,
        description: templates.emitEvent(resolve(en.label)),
        highlightNodes: [en.id],
        highlightEdges: connectingEdge ? [connectingEdge.id] : [],
        durationMs: 800,
      });
    }
  }

  // If no path found, create a single step highlighting the entry node
  if (steps.length === 0) {
    steps.push({
      id: 'interactive-step-0',
      description: templates.interactWith(fn.name),
      highlightNodes: [entryNode.id],
      highlightEdges: [],
      durationMs: 1000,
    });
  }

  return steps;
}

/**
 * BFS from `start` to `end` in the adjacency graph.
 * Returns the path as array of { nodeId, edgeId } (edgeId is the edge used to reach nodeId).
 */
function bfsPath(
  start: string,
  end: string | undefined,
  adjacency: Map<string, Array<{ nodeId: string; edgeId: string }>>,
): Array<{ nodeId: string; edgeId: string }> {
  if (!end) {
    // No target — just return the start node
    return [{ nodeId: start, edgeId: '' }];
  }

  const visited = new Set<string>();
  const parent = new Map<string, { nodeId: string; edgeId: string }>();
  const queue: string[] = [start];
  visited.add(start);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === end) break;

    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor.nodeId)) {
        visited.add(neighbor.nodeId);
        parent.set(neighbor.nodeId, {
          nodeId: current,
          edgeId: neighbor.edgeId,
        });
        queue.push(neighbor.nodeId);
      }
    }
  }

  // Reconstruct path
  const path: Array<{ nodeId: string; edgeId: string }> = [];
  let cur = end;
  while (cur && cur !== start) {
    const p = parent.get(cur);
    if (!p) {
      // No path found — return just start and end
      return [
        { nodeId: start, edgeId: '' },
        { nodeId: end, edgeId: '' },
      ];
    }
    path.unshift({ nodeId: cur, edgeId: p.edgeId });
    cur = p.nodeId;
  }
  path.unshift({ nodeId: start, edgeId: '' });

  return path;
}

/**
 * Build a complete SimulationScenario from a ContractFunction and flow graph.
 * If `fn.callPath` is defined, uses it directly; otherwise auto-traces.
 */
export function buildInteractiveScenario(
  fn: ContractFunction,
  flowNodes: FlowNodeDef[],
  flowEdges: FlowEdgeDef[],
  userParams: Record<string, string>,
  options: InteractiveTraceOptions = {},
): SimulationScenario {
  const resolve = options.resolveLabel ?? identity;
  let steps: SimulationStep[];

  if (fn.callPath && fn.callPath.length > 0) {
    // Use pre-authored call path (descriptions may be entry i18n keys)
    steps = fn.callPath.map((cp, i) => ({
      id: `interactive-step-${i}`,
      description: resolve(cp.description),
      highlightNodes: cp.highlightNodes,
      highlightEdges: cp.highlightEdges,
      durationMs: 1000,
    }));
  } else {
    steps = traceCallPath(fn, flowNodes, flowEdges, options);
  }

  return {
    id: `interactive-${fn.signature}`,
    name: fn.name,
    description: `Interactive: ${fn.signature}`,
    params: fn.params.map((p) => ({
      id: p.name,
      label: p.name,
      type: p.type === 'bool' ? 'bool' : p.type === 'address' ? 'address' : 'uint256',
      defaultValue: userParams[p.name] ?? fn.defaultSimValues?.[p.name] ?? '',
    })),
    steps,
  };
}
