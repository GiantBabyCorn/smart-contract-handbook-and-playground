import { useCallback, useEffect, useState } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from '@xyflow/react';
import type { FlowNodeDef, FlowEdgeDef } from '@/data/types';

const elk = new ELK();

const DEFAULT_OPTIONS: Record<string, string> = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
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
    default:
      return { width: 180, height: 80 };
  }
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

    setIsLayouting(true);

    const elkGraph = {
      id: 'root',
      layoutOptions: { ...DEFAULT_OPTIONS, ...layoutOptions },
      children: flowNodes.map((n) => {
        const dims = getNodeDimensions(n);
        return {
          id: n.id,
          width: dims.width,
          height: dims.height,
        };
      }),
      edges: flowEdges.map((e) => ({
        id: e.id,
        sources: [e.source],
        targets: [e.target],
      })),
    };

    try {
      const layout = await elk.layout(elkGraph);

      const positionedNodes: Node[] = (layout.children ?? []).map((elkNode) => {
        const original = flowNodes.find((n) => n.id === elkNode.id)!;
        const dims = getNodeDimensions(original);
        return {
          id: original.id,
          type: original.type,
          position: { x: elkNode.x ?? 0, y: elkNode.y ?? 0 },
          data: {
            ...original.data,
            label: original.label,
          },
          width: dims.width,
          height: dims.height,
        };
      });

      const mappedEdges: Edge[] = flowEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        label: e.label,
        data: e.data,
        animated: e.type === 'animated',
      }));

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
