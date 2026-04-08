import { useCallback, useEffect, useState } from 'react';
import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from '@xyflow/react';
import type { FlowNodeDef, FlowEdgeDef } from '@/data/types';

const elk = new ELK();

// Module-level cache: avoids re-running ELK when revisiting an entry.
const layoutCache = new Map<string, { nodes: Node[]; edges: Edge[] }>();

function computeCacheKey(
  flowNodes: FlowNodeDef[],
  flowEdges: FlowEdgeDef[],
  opts?: Record<string, string>,
): string {
  return JSON.stringify([
    flowNodes.map((n) => n.id),
    flowEdges.map((e) => e.id),
    opts,
  ]);
}

const DEFAULT_OPTIONS: Record<string, string> = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
};

const GROUP_PADDING: Record<string, string> = {
  'elk.padding': '[top=40,left=20,bottom=20,right=20]',
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.spacing.nodeNode': '40',
  'elk.layered.spacing.nodeNodeBetweenLayers': '60',
};

// Estimate node dimensions by type so ELK can produce non-overlapping layouts
function getNodeDimensions(node: FlowNodeDef): { width: number; height: number } {
  switch (node.type) {
    case 'contract': {
      const fnCount = node.data.functions?.length ?? 0;
      return { width: 220, height: Math.max(120, 80 + fnCount * 20) };
    }
    case 'function':
      return { width: 200, height: 80 };
    case 'user':
      return { width: 160, height: 80 };
    case 'proxy':
      return { width: 220, height: 100 };
    case 'storage': {
      const slotCount = node.data.slots?.length ?? 0;
      return { width: 200, height: Math.max(100, 70 + slotCount * 22) };
    }
    case 'tokenFlow':
      return { width: 180, height: 80 };
    case 'group':
      // Minimum; ELK expands group nodes to fit their children.
      return { width: 300, height: 200 };
    default:
      return { width: 180, height: 80 };
  }
}

/**
 * Build a hierarchical ELK graph. Group nodes become compound nodes whose
 * children are placed inside them. Non-grouped nodes stay at root level.
 */
function buildElkGraph(
  flowNodes: FlowNodeDef[],
  flowEdges: FlowEdgeDef[],
  layoutOptions?: Record<string, string>,
) {
  const groupNodes = flowNodes.filter((n) => n.type === 'group');
  const childMap = new Map<string, FlowNodeDef[]>();
  const rootNodes: FlowNodeDef[] = [];

  // Partition nodes into groups
  for (const node of flowNodes) {
    if (node.type === 'group') continue;
    const pid = 'parentId' in node ? node.parentId : undefined;
    if (pid) {
      const arr = childMap.get(pid) ?? [];
      arr.push(node);
      childMap.set(pid, arr);
    } else {
      rootNodes.push(node);
    }
  }

  // Build ELK children for root level
  const rootChildren: ElkNode[] = [];

  for (const group of groupNodes) {
    const children = childMap.get(group.id) ?? [];
    rootChildren.push({
      id: group.id,
      layoutOptions: { ...GROUP_PADDING },
      children: children.map((c) => {
        const dims = getNodeDimensions(c);
        return { id: c.id, width: dims.width, height: dims.height };
      }),
      // Edges between children inside the group
      edges: flowEdges
        .filter(
          (e) =>
            children.some((c) => c.id === e.source) &&
            children.some((c) => c.id === e.target),
        )
        .map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
    });
  }

  for (const node of rootNodes) {
    const dims = getNodeDimensions(node);
    rootChildren.push({ id: node.id, width: dims.width, height: dims.height });
  }

  // Collect all node IDs that live inside a group (for edge filtering)
  const groupedNodeIds = new Set<string>();
  for (const children of childMap.values()) {
    for (const c of children) groupedNodeIds.add(c.id);
  }

  // Root-level edges: edges that cross group boundaries or connect root nodes.
  // Internal group edges are already placed inside the group node.
  const rootEdges = flowEdges
    .filter((e) => {
      // Skip edges fully inside a single group (already handled)
      for (const [, children] of childMap) {
        const srcIn = children.some((c) => c.id === e.source);
        const tgtIn = children.some((c) => c.id === e.target);
        if (srcIn && tgtIn) return false;
      }
      return true;
    })
    .map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] }));

  return {
    id: 'root',
    layoutOptions: { ...DEFAULT_OPTIONS, ...layoutOptions },
    children: rootChildren,
    edges: rootEdges,
  };
}

/**
 * Flatten ELK layout result into React Flow nodes, handling parent/child
 * relationships. Children inside groups get `parentId` set and their positions
 * are relative to the parent node.
 */
function flattenElkResult(
  layout: ElkNode,
  flowNodes: FlowNodeDef[],
): Node[] {
  const result: Node[] = [];
  const nodeMap = new Map(flowNodes.map((n) => [n.id, n]));

  for (const elkNode of layout.children ?? []) {
    const original = nodeMap.get(elkNode.id);
    if (!original) continue;

    const dims = getNodeDimensions(original);

    if (original.type === 'group') {
      // Group node — use ELK-computed size (includes children + padding)
      result.push({
        id: original.id,
        type: 'group',
        position: { x: elkNode.x ?? 0, y: elkNode.y ?? 0 },
        data: { ...original.data, label: original.label },
        width: elkNode.width ?? dims.width,
        height: elkNode.height ?? dims.height,
        style: { zIndex: -1 },
      });

      // Child nodes inside this group
      for (const childElk of elkNode.children ?? []) {
        const childOriginal = nodeMap.get(childElk.id);
        if (!childOriginal) continue;
        const childDims = getNodeDimensions(childOriginal);
        result.push({
          id: childOriginal.id,
          type: childOriginal.type,
          position: { x: childElk.x ?? 0, y: childElk.y ?? 0 },
          data: { ...childOriginal.data, label: childOriginal.label },
          width: childDims.width,
          height: childDims.height,
          parentId: original.id,
          extent: 'parent' as const,
        });
      }
    } else {
      // Regular root-level node
      result.push({
        id: original.id,
        type: original.type,
        position: { x: elkNode.x ?? 0, y: elkNode.y ?? 0 },
        data: { ...original.data, label: original.label },
        width: dims.width,
        height: dims.height,
      });
    }
  }

  return result;
}

export function useElkLayout(
  flowNodes: FlowNodeDef[],
  flowEdges: FlowEdgeDef[],
  layoutOptions?: Record<string, string>,
) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLayouting, setIsLayouting] = useState(true);

  const computeLayout = useCallback(async () => {
    if (flowNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      setIsLayouting(false);
      return;
    }

    // Check layout cache to skip ELK computation on revisits
    const cacheKey = computeCacheKey(flowNodes, flowEdges, layoutOptions);
    const cached = layoutCache.get(cacheKey);
    if (cached) {
      setNodes(cached.nodes);
      setEdges(cached.edges);
      setIsLayouting(false);
      return;
    }

    setIsLayouting(true);

    const elkGraph = buildElkGraph(flowNodes, flowEdges, layoutOptions);

    try {
      const layout = await elk.layout(elkGraph);
      const positionedNodes = flattenElkResult(layout, flowNodes);

      const mappedEdges: Edge[] = flowEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        label: e.label,
        data: e.data,
        animated: e.type === 'animated',
      }));

      layoutCache.set(cacheKey, { nodes: positionedNodes, edges: mappedEdges });
      setNodes(positionedNodes);
      setEdges(mappedEdges);
    } catch (err) {
      console.error('[useElkLayout] ELK layout failed:', err);
      // Fallback: place nodes in a simple grid so the canvas is never blank
      const cols = Math.ceil(Math.sqrt(flowNodes.length));
      const fallback: Node[] = flowNodes.map((n, i) => {
        const dims = getNodeDimensions(n);
        return {
          id: n.id,
          type: n.type,
          position: {
            x: (i % cols) * (dims.width + 80),
            y: Math.floor(i / cols) * (dims.height + 80),
          },
          data: { ...n.data, label: n.label },
          width: dims.width,
          height: dims.height,
        };
      });
      const fallbackEdges: Edge[] = flowEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        label: e.label,
        data: e.data,
        animated: e.type === 'animated',
      }));
      setNodes(fallback);
      setEdges(fallbackEdges);
    } finally {
      setIsLayouting(false);
    }
  }, [flowNodes, flowEdges, layoutOptions]);

  useEffect(() => {
    void computeLayout();
  }, [computeLayout]);

  return { nodes, edges, isLayouting };
}
