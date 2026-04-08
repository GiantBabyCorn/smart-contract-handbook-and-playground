import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import { useTranslation } from 'react-i18next';

import '@xyflow/react/dist/style.css';
import '@/styles/reactflow-overrides.css';

import type { FlowNodeDef, FlowEdgeDef } from '@/data/types';
import { useElkLayout } from '@/components/flow/useElkLayout';

import ContractNode from '@/components/flow/nodes/ContractNode';
import FunctionNode from '@/components/flow/nodes/FunctionNode';
import UserNode from '@/components/flow/nodes/UserNode';
import ProxyNode from '@/components/flow/nodes/ProxyNode';
import StorageNode from '@/components/flow/nodes/StorageNode';
import TokenFlowNode from '@/components/flow/nodes/TokenFlowNode';
import GroupNode from '@/components/flow/nodes/GroupNode';
import AnimatedEdge from '@/components/flow/edges/AnimatedEdge';
import LabeledEdge from '@/components/flow/edges/LabeledEdge';
import FundFlowEdge from '@/components/flow/edges/FundFlowEdge';
import { cn } from '@/utils/cn';

const NODE_TYPES = {
  contract: ContractNode,
  function: FunctionNode,
  user: UserNode,
  proxy: ProxyNode,
  storage: StorageNode,
  tokenFlow: TokenFlowNode,
  group: GroupNode,
} as const;

const EDGE_TYPES = {
  animated: AnimatedEdge,
  labeled: LabeledEdge,
  fundFlow: FundFlowEdge,
} as const;

const EMPTY_STRINGS: string[] = [];

interface PlaygroundCanvasInnerProps {
  layoutNodes: Node[];
  layoutEdges: Edge[];
  isLayouting: boolean;
  highlightedNodes?: string[];
  highlightedEdges?: string[];
  onConnect: (edge: FlowEdgeDef) => void;
  onRelayout: () => void;
  onClear: () => void;
  isEmpty: boolean;
}

function PlaygroundCanvasInner({
  layoutNodes,
  layoutEdges,
  isLayouting,
  highlightedNodes = EMPTY_STRINGS,
  highlightedEdges = EMPTY_STRINGS,
  onConnect: onConnectProp,
  onRelayout,
  onClear,
  isEmpty,
}: PlaygroundCanvasInnerProps) {
  const { t } = useTranslation('common');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(layoutEdges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (!isLayouting && layoutNodes.length > 0) {
      setNodes(layoutNodes);
      setEdges(layoutEdges);
      requestAnimationFrame(() => {
        fitView({ padding: 0.15, duration: 400 });
      });
    }
  }, [isLayouting, layoutNodes, layoutEdges, setNodes, setEdges, fitView]);

  // Apply simulation highlights
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, highlighted: highlightedNodes.includes(n.id) },
      })),
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        data: { ...e.data, highlighted: highlightedEdges.includes(e.id) },
      })),
    );
  }, [highlightedNodes, highlightedEdges, setNodes, setEdges]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const edgeId = `pg-edge-${connection.source}-${connection.target}-${Date.now()}`;
      onConnectProp({
        id: edgeId,
        source: connection.source,
        target: connection.target,
        type: 'animated',
        label: '',
      });
    },
    [onConnectProp],
  );

  return (
    <div className="relative w-full h-full" style={{ background: 'var(--erc-color-bg-primary)' }}>
      {/* Empty state */}
      {isEmpty && !isLayouting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="6" y="6" width="36" height="36" rx="8" stroke="var(--erc-color-border)" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M24 16v16M16 24h16" stroke="var(--erc-color-text-muted)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-[var(--erc-color-text-muted)]">
              {t('playground.empty', 'Add contracts from the palette to get started')}
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {!isEmpty && (
        <div className="absolute top-3 left-3 z-20 flex gap-1.5">
          <button
            type="button"
            onClick={onRelayout}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
              'bg-[var(--erc-color-bg-secondary)] border border-[var(--erc-color-border)]',
              'text-[var(--erc-color-text-secondary)] hover:text-[var(--erc-color-text-primary)]',
              'transition-colors shadow-sm',
            )}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 6a5 5 0 019.33-2.5M11 6a5 5 0 01-9.33 2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
            {t('playground.autoLayout', 'Auto-layout')}
          </button>
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
              'bg-[var(--erc-color-bg-secondary)] border border-[var(--erc-color-border)]',
              'text-[var(--erc-color-text-secondary)] hover:text-red-400',
              'transition-colors shadow-sm',
            )}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
            {t('playground.clearAll', 'Clear all')}
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {isLayouting && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ background: 'var(--erc-color-bg-primary)' }}
        >
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="12" stroke="var(--erc-color-node-border)" strokeWidth="3" />
              <path d="M16 4 A12 12 0 0 1 28 16" stroke="var(--erc-color-accent)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={2.5}
        proOptions={{ hideAttribution: false }}
        aria-label="Playground flow diagram"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--erc-color-node-border)" />
        <Controls
          aria-label="Flow diagram controls"
          style={{
            background: 'var(--erc-color-bg-secondary)',
            border: '1px solid var(--erc-color-border)',
            borderRadius: '0.5rem',
          }}
        />
        <MiniMap
          nodeColor={(n) => {
            switch (n.type) {
              case 'contract': return 'var(--erc-color-accent)';
              case 'function': return 'var(--erc-color-fn-read)';
              case 'user': return 'var(--erc-color-category-account)';
              case 'proxy': return 'var(--erc-color-category-proxy)';
              case 'storage': return 'var(--erc-color-category-defi)';
              case 'tokenFlow': return 'var(--erc-color-category-token)';
              case 'group': return 'var(--erc-color-border)';
              default: return 'var(--erc-color-node-border)';
            }
          }}
          maskColor="var(--erc-color-bg-primary)"
          style={{
            background: 'var(--erc-color-bg-secondary)',
            border: '1px solid var(--erc-color-border)',
            borderRadius: '0.5rem',
          }}
          aria-label="Playground minimap"
        />
      </ReactFlow>
    </div>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

export interface PlaygroundCanvasProps {
  flowNodes: FlowNodeDef[];
  flowEdges: FlowEdgeDef[];
  highlightedNodes?: string[];
  highlightedEdges?: string[];
  onConnect: (edge: FlowEdgeDef) => void;
  onClear: () => void;
}

export default function PlaygroundCanvas({
  flowNodes,
  flowEdges,
  highlightedNodes,
  highlightedEdges,
  onConnect,
  onClear,
}: PlaygroundCanvasProps) {
  const [layoutKey, setLayoutKey] = useState(0);
  const { nodes, edges, isLayouting } = useElkLayout(
    flowNodes,
    flowEdges,
    undefined,
  );

  // Force re-layout when key changes
  const handleRelayout = useCallback(() => {
    setLayoutKey((k) => k + 1);
  }, []);

  return (
    <ReactFlowProvider key={layoutKey}>
      <PlaygroundCanvasInner
        layoutNodes={nodes}
        layoutEdges={edges}
        isLayouting={isLayouting}
        highlightedNodes={highlightedNodes}
        highlightedEdges={highlightedEdges}
        onConnect={onConnect}
        onRelayout={handleRelayout}
        onClear={onClear}
        isEmpty={flowNodes.length === 0}
      />
    </ReactFlowProvider>
  );
}
