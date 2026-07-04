import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import '@xyflow/react/dist/style.css';
import '@/styles/reactflow-overrides.css';

import type { FlowNodeDef, FlowEdgeDef } from '@/data/types';
import { getCategoryColor } from '@/data/categories';
import { stripEntryPrefix } from '@/i18n/entryText';
import { useElkLayout } from './useElkLayout';
import FlowErrorBoundary from './FlowErrorBoundary';
import LegendPanel from './panels/LegendPanel';

import ContractNode from './nodes/ContractNode';
import FunctionNode from './nodes/FunctionNode';
import UserNode from './nodes/UserNode';
import ProxyNode from './nodes/ProxyNode';
import StorageNode from './nodes/StorageNode';
import TokenFlowNode from './nodes/TokenFlowNode';
import GroupNode from './nodes/GroupNode';
import AnimatedEdge from './edges/AnimatedEdge';
import LabeledEdge from './edges/LabeledEdge';
import FundFlowEdge from './edges/FundFlowEdge';

// Custom node and edge type registries — defined once outside render to avoid
// React Flow's referential equality check re-mounting nodes on every render.
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

// Minimap swatch per node type. User/proxy/storage/tokenFlow reuse the
// category registry hues (account/proxy/defi/token) their node chrome is
// built on, so the minimap stays consistent with the main canvas.
const MINIMAP_NODE_COLORS: Record<string, string> = {
  contract: 'var(--erc-color-accent)',
  function: 'var(--erc-color-fn-read)',
  user: getCategoryColor('account'),
  proxy: getCategoryColor('proxy'),
  storage: getCategoryColor('defi'),
  tokenFlow: getCategoryColor('token'),
  group: 'var(--erc-color-border)',
};

// Stable empty arrays to avoid new-reference-per-render triggering useEffect loops
const EMPTY_STRINGS: string[] = [];

/** Below this zoom, node labels stop being readable — refocus the main
 *  contract group instead of showing the whole graph as confetti. */
const MIN_READABLE_ZOOM = 0.55;

// ─── Node-click popover ───────────────────────────────────────────────────────

interface NodePopoverInfo {
  id: string;
  label: string;
  typeLabel: string;
  signature?: string;
  description?: string;
  x: number;
  y: number;
}

/**
 * Lightweight popover shown on node click: function nodes show
 * signature + description (entry namespace); other nodes show label +
 * node-type description (legend keys). Keyboard focusable, Escape and
 * outside-click close it.
 */
function NodePopover({ info, onClose }: { info: NodePopoverInfo; onClose: () => void }) {
  const { t } = useTranslation('simulation');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, [info.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as globalThis.Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [onClose]);

  const width = 280;
  const left = Math.max(8, Math.min(info.x + 12, window.innerWidth - width - 8));
  const top = Math.max(8, Math.min(info.y + 12, window.innerHeight - 190));

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={info.label}
      tabIndex={-1}
      className="outline-none"
      style={{
        position: 'fixed',
        left,
        top,
        width,
        zIndex: 70,
        background: 'var(--erc-color-bg-secondary)',
        border: '1px solid var(--erc-color-border)',
        borderRadius: '0.5rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        fontFamily: 'var(--erc-font-body)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: 'var(--erc-color-bg-tertiary)',
          borderBottom: '1px solid var(--erc-color-border)',
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: 'var(--erc-color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {info.label}
        </span>
        <span
          style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--erc-color-accent)',
            border: '1px solid var(--erc-color-accent)',
            borderRadius: '0.25rem',
            padding: '0.1rem 0.35rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {info.typeLabel}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('popover.close')}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--erc-color-text-secondary)',
            padding: '0.1rem',
            display: 'flex',
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div style={{ padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {info.signature && (
          <code
            style={{
              display: 'block',
              fontFamily: 'var(--erc-font-mono)',
              fontSize: '0.6875rem',
              lineHeight: 1.5,
              color: 'var(--erc-color-accent)',
              wordBreak: 'break-all',
            }}
          >
            {info.signature}
          </code>
        )}
        {info.description && (
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              lineHeight: 1.55,
              color: 'var(--erc-color-text-secondary)',
            }}
          >
            {info.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Inner canvas (must live inside ReactFlowProvider) ───────────────────────

interface FlowCanvasInnerProps {
  layoutNodes: Node[];
  layoutEdges: Edge[];
  isLayouting: boolean;
  description: string;
  slug?: string;
  zoomOnScroll: boolean;
  highlightedNodes?: string[];
  highlightedEdges?: string[];
}

function FlowCanvasInner({
  layoutNodes,
  layoutEdges,
  isLayouting,
  description,
  slug,
  zoomOnScroll,
  highlightedNodes = EMPTY_STRINGS,
  highlightedEdges = EMPTY_STRINGS,
}: FlowCanvasInnerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(layoutEdges);
  const { fitView, getViewport } = useReactFlow();
  // Entry namespace for node/edge label keys. `useTranslation` also
  // re-renders on language change so labels update live.
  const { t } = useTranslation(slug);
  const { t: tSim } = useTranslation('simulation');
  const [popover, setPopover] = useState<NodePopoverInfo | null>(null);
  const viewTimer = useRef<number | null>(null);

  // Data files author labels as slug-prefixed keys ('erc20.node.user') while
  // locale files store flat keys without the prefix — strip before lookup.
  // Plain labels ('transfer()') fall back to themselves via defaultValue.
  const resolveLabel = useCallback(
    (label: string): string =>
      slug ? t(stripEntryPrefix(slug, label), { defaultValue: label }) : label,
    [slug, t],
  );

  // Translate at render time (not in useElkLayout) so the ELK layout cache
  // keeps raw keys and language switches never serve stale labels.
  const displayNodes = useMemo(
    () =>
      nodes.map((n) =>
        typeof n.data.label === 'string'
          ? { ...n, data: { ...n.data, label: resolveLabel(n.data.label) } }
          : n,
      ),
    [nodes, resolveLabel],
  );
  const displayEdges = useMemo(
    () =>
      edges.map((e) =>
        typeof e.label === 'string' && e.label
          ? { ...e, label: resolveLabel(e.label) }
          : e,
      ),
    [edges, resolveLabel],
  );

  /**
   * Fit the whole graph, then enforce a readable zoom floor: if the full fit
   * lands below MIN_READABLE_ZOOM, refocus on the main contract/proxy nodes
   * instead so labels stay legible (plan §5.6). Also used by "Reset view".
   */
  const applyInitialView = useCallback(() => {
    void fitView({ padding: 0.15, duration: 300 });
    if (viewTimer.current !== null) window.clearTimeout(viewTimer.current);
    viewTimer.current = window.setTimeout(() => {
      viewTimer.current = null;
      if (getViewport().zoom >= MIN_READABLE_ZOOM) return;
      const focus = layoutNodes.filter(
        (n) => n.type === 'contract' || n.type === 'proxy',
      );
      const targets = (focus.length > 0 ? focus : layoutNodes.slice(0, 3)).map(
        (n) => ({ id: n.id }),
      );
      if (targets.length === 0) return;
      void fitView({
        nodes: targets,
        padding: 0.2,
        duration: 300,
        minZoom: MIN_READABLE_ZOOM,
        maxZoom: 1.25,
      });
    }, 350);
  }, [fitView, getViewport, layoutNodes]);

  useEffect(
    () => () => {
      if (viewTimer.current !== null) window.clearTimeout(viewTimer.current);
    },
    [],
  );

  // Sync layout results into React Flow state and fit the view once ready
  useEffect(() => {
    if (!isLayouting && layoutNodes.length > 0) {
      setNodes(layoutNodes);
      setEdges(layoutEdges);
      // fitView after a microtask so nodes have been committed to the DOM
      requestAnimationFrame(() => {
        applyInitialView();
      });
    }
  }, [isLayouting, layoutNodes, layoutEdges, setNodes, setEdges, applyInitialView]);

  // Apply simulation highlights to nodes and edges
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          highlighted: highlightedNodes.includes(n.id),
        },
      })),
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        data: {
          ...e.data,
          highlighted: highlightedEdges.includes(e.id),
        },
      })),
    );
  }, [highlightedNodes, highlightedEdges, setNodes, setEdges]);

  // ─── Node click → popover ──────────────────────────────────────────────────

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.type === 'group') return; // group frames are not interactive
      const label =
        typeof node.data.label === 'string' ? node.data.label : node.id;

      let signature: string | undefined;
      let description: string | undefined;
      let typeLabel: string;

      if (node.type === 'function') {
        signature =
          typeof node.data.signature === 'string' ? node.data.signature : undefined;
        // Function nodes are labelled 'transfer()' / 'Transfer event' —
        // derive the fn name and resolve its description from the entry ns.
        const fnName = label.replace(/\s+event$/i, '').replace(/\(\)\s*$/, '').trim();
        const resolved = slug ? t(`fn.${fnName}.desc`, { defaultValue: '' }) : '';
        description = resolved || undefined;
        typeLabel = tSim('legend.function');
      } else {
        const base =
          node.type && node.type in NODE_TYPES && node.type !== 'group'
            ? node.type
            : 'contract';
        typeLabel = tSim(`legend.${base}`);
        description = tSim(`legend.${base}Desc`);
      }

      setPopover({
        id: node.id,
        label,
        typeLabel,
        signature,
        description,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [slug, t, tSim],
  );

  const closePopover = useCallback(() => setPopover(null), []);

  return (
    <div
      className="relative w-full h-full"
      style={{ background: 'var(--erc-color-bg-primary)' }}
    >
      {/* Loading overlay */}
      {isLayouting && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ background: 'var(--erc-color-bg-primary)' }}
          aria-live="polite"
          aria-label={tSim('flow.computing')}
        >
          <div className="flex flex-col items-center gap-3">
            {/* Spinner */}
            <svg
              className="animate-spin"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="16"
                cy="16"
                r="12"
                stroke="var(--erc-color-node-border)"
                strokeWidth="3"
              />
              <path
                d="M16 4 A12 12 0 0 1 28 16"
                stroke="var(--erc-color-accent)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                color: 'var(--erc-color-text-secondary)',
                fontFamily: 'var(--erc-font-body)',
                fontSize: '0.875rem',
              }}
            >
              {tSim('flow.computing')}
            </span>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2.5}
        // Scroll-trap fix: by default the wheel scrolls the page and only
        // Ctrl/Cmd+wheel zooms (zoomActivationKeyCode defaults to
        // Control/Meta per platform; pinch zoom stays enabled). Fullscreen
        // passes zoomOnScroll so plain wheel zooms there.
        zoomOnScroll={zoomOnScroll}
        preventScrolling={zoomOnScroll}
        // Drag policy: on the inline detail page (zoomOnScroll=false) nodes
        // are locked — dragging there fights page scrolling and mangles the
        // authored layout with no persistence. Fullscreen keeps dragging so
        // users can untangle dense graphs while exploring.
        nodesDraggable={zoomOnScroll}
        onNodeClick={handleNodeClick}
        onPaneClick={closePopover}
        onMoveStart={closePopover}
        proOptions={{ hideAttribution: false }}
        aria-label={description}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--erc-color-node-border)"
        />
        <Controls
          aria-label={tSim('flow.title')}
          style={{
            background: 'var(--erc-color-bg-secondary)',
            border: '1px solid var(--erc-color-border)',
            borderRadius: '0.5rem',
          }}
        />
        <MiniMap
          nodeColor={(n) =>
            MINIMAP_NODE_COLORS[n.type ?? ''] ?? 'var(--erc-color-node-border)'
          }
          maskColor="var(--erc-color-bg-primary)"
          style={{
            background: 'var(--erc-color-bg-secondary)',
            border: '1px solid var(--erc-color-border)',
            borderRadius: '0.5rem',
          }}
          aria-label={tSim('flow.title')}
        />

        {/* Legend (collapsible; default collapsed on small screens) */}
        <LegendPanel />

        {/* Re-layout / reset view */}
        <Panel position="top-right" style={{ margin: '0.75rem' }}>
          <button
            type="button"
            onClick={applyInitialView}
            aria-label={tSim('flow.resetView')}
            title={tSim('flow.resetView')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.65rem',
              background: 'var(--erc-color-bg-secondary)',
              border: '1px solid var(--erc-color-border)',
              borderRadius: '0.5rem',
              color: 'var(--erc-color-text-secondary)',
              fontFamily: 'var(--erc-font-body)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 3 3 3 3 9" />
              <polyline points="15 21 21 21 21 15" />
              <line x1="3" y1="3" x2="10" y2="10" />
              <line x1="21" y1="21" x2="14" y2="14" />
            </svg>
            {tSim('flow.resetView')}
          </button>
        </Panel>
      </ReactFlow>

      {/* Node-click popover */}
      {popover && <NodePopover info={popover} onClose={closePopover} />}
    </div>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

export interface FlowCanvasProps {
  flowNodes: FlowNodeDef[];
  flowEdges: FlowEdgeDef[];
  elkLayoutOptions?: Record<string, string>;
  /** Entry slug — i18n namespace used to resolve node/edge label keys */
  slug?: string;
  /** Accessible description of what the diagram shows */
  description?: string;
  /**
   * Enable plain-wheel zoom. Keep false (default) when the canvas sits
   * inside a scrollable page so the wheel scrolls the page and Ctrl/Cmd+wheel
   * zooms; set true in fixed/fullscreen contexts with nothing to scroll.
   * Also unlocks node dragging (see drag policy note on <ReactFlow>).
   */
  zoomOnScroll?: boolean;
  /** Node IDs to highlight during simulation */
  highlightedNodes?: string[];
  /** Edge IDs to highlight during simulation */
  highlightedEdges?: string[];
}

export default function FlowCanvas({
  flowNodes,
  flowEdges,
  elkLayoutOptions,
  slug,
  description = 'Smart contract interaction flow diagram',
  zoomOnScroll = false,
  highlightedNodes,
  highlightedEdges,
}: FlowCanvasProps) {
  const { nodes, edges, isLayouting } = useElkLayout(
    flowNodes,
    flowEdges,
    elkLayoutOptions,
  );

  return (
    <FlowErrorBoundary>
      <ReactFlowProvider>
        <FlowCanvasInner
          layoutNodes={nodes}
          layoutEdges={edges}
          isLayouting={isLayouting}
          description={description}
          slug={slug}
          zoomOnScroll={zoomOnScroll}
          highlightedNodes={highlightedNodes}
          highlightedEdges={highlightedEdges}
        />
      </ReactFlowProvider>
    </FlowErrorBoundary>
  );
}
