import type {
  ContractFunction,
  FlowNodeDef,
  FlowEdgeDef,
  SimulationScenario,
  SimulationStep,
} from '@/data/types';

/**
 * Trace the call path of a function through the flow graph using BFS.
 *
 * Strategy:
 * 1. Find the entry point — a 'user' node, or the first node with no incoming edges.
 * 2. Find the target — the contract/function node associated with `fn.name`.
 * 3. BFS from entry point following edges to build the path.
 * 4. For 'write' functions, append storage node steps (nodes connected to target).
 * 5. Generate SimulationStep[] with highlights for each hop.
 */
export function traceCallPath(
  fn: ContractFunction,
  flowNodes: FlowNodeDef[],
  flowEdges: FlowEdgeDef[],
): SimulationStep[] {
  const fnNameLower = fn.name.toLowerCase();

  // Build adjacency list
  const adjacency = new Map<string, Array<{ nodeId: string; edgeId: string }>>();
  for (const edge of flowEdges) {
    const list = adjacency.get(edge.source) ?? [];
    list.push({ nodeId: edge.target, edgeId: edge.id });
    adjacency.set(edge.source, list);
  }

  // Find the entry point: prefer 'user' node, fallback to node with no incoming edges
  const incomingSet = new Set(flowEdges.map((e) => e.target));
  const userNode = flowNodes.find((n) => n.type === 'user');
  const entryNode =
    userNode ?? flowNodes.find((n) => !incomingSet.has(n.id)) ?? flowNodes[0];
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
      description: `Call reaches ${hop.nodeId}`,
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
        description: `Update storage: ${storageNodeId}`,
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
        description: `Emit event: ${en.label}`,
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
      description: `Interact with ${fn.name}`,
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
): SimulationScenario {
  let steps: SimulationStep[];

  if (fn.callPath && fn.callPath.length > 0) {
    // Use pre-authored call path
    steps = fn.callPath.map((cp, i) => ({
      id: `interactive-step-${i}`,
      description: cp.description,
      highlightNodes: cp.highlightNodes,
      highlightEdges: cp.highlightEdges,
      durationMs: 1000,
    }));
  } else {
    steps = traceCallPath(fn, flowNodes, flowEdges);
  }

  return {
    id: `interactive-${fn.name}`,
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
