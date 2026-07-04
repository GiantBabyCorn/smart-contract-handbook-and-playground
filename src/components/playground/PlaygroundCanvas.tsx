import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from 'react';
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
import { stripEntryPrefix } from '@/i18n/entryText';
import { useElkLayout } from '@/components/flow/useElkLayout';
import {
  usePlaygroundStore,
  slugOfPlaygroundId,
  CUSTOM_EDGE_PREFIX,
  type XY,
} from '@/stores/usePlaygroundStore';
import PlaygroundOnboarding from './PlaygroundOnboarding';
import { SLUG_DND_TYPE } from './constants';

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

/** Horizontal gap between auto-placed entry clusters. */
const CLUSTER_GAP = 150;

// Re-render when lazily loaded namespaces arrive (module-level so the
// useTranslation subscription stays referentially stable across renders).
const I18N_BIND_OPTIONS = { bindI18n: 'languageChanged loaded' };

interface FocusRequest {
  seq: number;
  /** Node ids to fit; null = fit the whole canvas. */
  nodeIds: string[] | null;
}

/**
 * Translate each entry cluster so its bounding-box top-left sits at the
 * cluster's anchor (drop point / auto-placement slot), then apply per-node
 * drag overrides. Children of group nodes are positioned relative to their
 * parent, so only root-level nodes are translated.
 */
function applyAnchorOffsets(
  nodes: Node[],
  anchors: Record<string, XY>,
  overrides: Record<string, XY>,
): Node[] {
  if (nodes.length === 0) return nodes;

  // Per-cluster bounding-box minimum over root-level nodes.
  const mins = new Map<string, XY>();
  for (const n of nodes) {
    if (n.parentId) continue;
    const slug = slugOfPlaygroundId(n.id);
    if (!slug || !anchors[slug]) continue;
    const min = mins.get(slug);
    if (!min) {
      mins.set(slug, { x: n.position.x, y: n.position.y });
    } else {
      min.x = Math.min(min.x, n.position.x);
      min.y = Math.min(min.y, n.position.y);
    }
  }

  const deltas = new Map<string, XY>();
  for (const [slug, min] of mins) {
    const anchor = anchors[slug];
    deltas.set(slug, { x: anchor.x - min.x, y: anchor.y - min.y });
  }

  return nodes.map((n) => {
    const override = overrides[n.id];
    if (override) return { ...n, position: { x: override.x, y: override.y } };
    if (n.parentId) return n; // children move with their parent
    const slug = slugOfPlaygroundId(n.id);
    const delta = slug ? deltas.get(slug) : undefined;
    return delta
      ? {
          ...n,
          position: { x: n.position.x + delta.x, y: n.position.y + delta.y },
        }
      : n;
  });
}

// ─── Inner (needs ReactFlowProvider context) ─────────────────────────────────

interface PlaygroundCanvasInnerProps {
  layoutNodes: Node[];
  layoutEdges: Edge[];
  isLayouting: boolean;
  highlightedNodes?: string[];
  highlightedEdges?: string[];
  onConnect: (edge: FlowEdgeDef) => void;
  onRelayout: () => void;
  onClear: () => void;
  onShare: () => void;
  onAddAt: (slug: string, position: XY) => void;
  placingSlug?: string | null;
  onLoadPreset: (slugs: string[]) => void;
  onNodesMoved: (positions: Record<string, XY>) => void;
  focusRequest: FocusRequest | null;
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
  onShare,
  onAddAt,
  placingSlug,
  onLoadPreset,
  onNodesMoved,
  focusRequest,
  isEmpty,
}: PlaygroundCanvasInnerProps) {
  // bindI18n 'loaded' re-renders once lazily loaded entry namespaces arrive,
  // so labels resolve as soon as their namespace is available.
  const { t, i18n } = useTranslation('common', I18N_BIND_OPTIONS);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(layoutEdges);
  const { fitView, screenToFlowPosition } = useReactFlow();

  // Load the i18n namespaces of every entry present on the canvas (multiple
  // entries coexist here, unlike the detail page).
  const namespacesKey = useMemo(() => {
    const slugs = new Set<string>();
    for (const n of layoutNodes) {
      const slug = slugOfPlaygroundId(n.id);
      if (slug) slugs.add(slug);
    }
    return Array.from(slugs).sort().join(',');
  }, [layoutNodes]);

  useEffect(() => {
    if (namespacesKey) {
      void i18n.loadNamespaces(namespacesKey.split(','));
    }
  }, [namespacesKey, i18n]);

  // Labels are authored as slug-prefixed keys ('erc20.node.user') while
  // locale files store flat keys without the prefix — strip, then look up in
  // the owning entry's namespace. Falls back to the raw value until loaded.
  const resolveLabel = useCallback(
    (ownerId: string, label: string): string => {
      const slug = slugOfPlaygroundId(ownerId);
      if (!slug) return label;
      return t(stripEntryPrefix(slug, label), { ns: slug, defaultValue: label });
    },
    [t],
  );

  const displayNodes = useMemo(
    () =>
      nodes.map((n) =>
        typeof n.data.label === 'string' && n.data.label
          ? { ...n, data: { ...n.data, label: resolveLabel(n.id, n.data.label) } }
          : n,
      ),
    [nodes, resolveLabel],
  );
  const displayEdges = useMemo(
    () =>
      edges.map((e) =>
        typeof e.label === 'string' && e.label
          ? { ...e, label: resolveLabel(e.id, e.label) }
          : e,
      ),
    [edges, resolveLabel],
  );

  // Sync layout results into the interactive node/edge state (also when the
  // canvas becomes empty, so removed entries disappear immediately).
  useEffect(() => {
    if (!isLayouting) {
      setNodes(layoutNodes);
      setEdges(layoutEdges);
    }
  }, [isLayouting, layoutNodes, layoutEdges, setNodes, setEdges]);

  // Viewport focus: fit either the whole canvas or a newly placed cluster.
  useEffect(() => {
    if (!focusRequest) return;
    const raf = requestAnimationFrame(() => {
      void fitView({
        padding: 0.2,
        duration: 450,
        ...(focusRequest.nodeIds && focusRequest.nodeIds.length > 0
          ? { nodes: focusRequest.nodeIds.map((id) => ({ id })) }
          : {}),
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [focusRequest, fitView]);

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
      const edgeId = `${CUSTOM_EDGE_PREFIX}${connection.source}-${connection.target}-${Date.now()}`;
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

  // Persist node positions after a drag so they survive re-layouts,
  // reloads (zustand persist) and the share URL.
  const handleNodeDragStop = useCallback(
    (_event: unknown, node: Node, draggedNodes?: Node[]) => {
      const moved = draggedNodes && draggedNodes.length > 0 ? draggedNodes : [node];
      onNodesMoved(
        Object.fromEntries(
          moved.map((n) => [n.id, { x: n.position.x, y: n.position.y }]),
        ),
      );
    },
    [onNodesMoved],
  );

  // ─── HTML5 drag & drop from the palette ────────────────────────────────────
  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    const types = event.dataTransfer.types;
    if (types.includes(SLUG_DND_TYPE) || types.includes('text/plain')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const slug =
        event.dataTransfer.getData(SLUG_DND_TYPE) ||
        event.dataTransfer.getData('text/plain');
      if (!slug || !/^[a-z0-9-]+$/.test(slug)) return;
      event.preventDefault();
      onAddAt(
        slug,
        screenToFlowPosition({ x: event.clientX, y: event.clientY }),
      );
    },
    [onAddAt, screenToFlowPosition],
  );

  // ─── Touch fallback: armed slug + tap on the pane places the entry ─────────
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!placingSlug) return;
      onAddAt(
        placingSlug,
        screenToFlowPosition({ x: event.clientX, y: event.clientY }),
      );
    },
    [placingSlug, onAddAt, screenToFlowPosition],
  );

  return (
    <div
      className="relative w-full h-full"
      style={{ background: 'var(--erc-color-bg-primary)' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Empty state: onboarding steps + preset combos (hidden while the user
          is placing an armed entry so the pane stays tappable). */}
      {isEmpty && !isLayouting && !placingSlug && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <PlaygroundOnboarding onLoadPreset={onLoadPreset} />
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
            data-testid="playground-share"
            onClick={onShare}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
              'bg-[var(--erc-color-bg-secondary)] border border-[var(--erc-color-border)]',
              'text-[var(--erc-color-text-secondary)] hover:text-[var(--erc-color-text-primary)]',
              'transition-colors shadow-sm',
            )}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="3" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.1" />
              <circle cx="9" cy="2.8" r="1.6" stroke="currentColor" strokeWidth="1.1" />
              <circle cx="9" cy="9.2" r="1.6" stroke="currentColor" strokeWidth="1.1" />
              <path d="M4.4 5.2l3.2-1.7M4.4 6.8l3.2 1.7" stroke="currentColor" strokeWidth="1.1" />
            </svg>
            {t('playground.share', 'Share')}
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

      {/* zoomOnScroll stays enabled here: the playground page is full-height
          with no page scroll, so there is no scroll trap to avoid. */}
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeDragStop={handleNodeDragStop}
        onPaneClick={placingSlug ? handlePaneClick : undefined}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
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
          className="hidden md:block"
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
  onShare: () => void;
  /** Add (or move an already-added) entry at a canvas position — used by
   *  drag & drop and the mobile tap-to-place flow. */
  onAddAt: (slug: string, position: XY) => void;
  /** Slug armed for tap-to-place (mobile flow); tap on the pane places it. */
  placingSlug?: string | null;
  onLoadPreset: (slugs: string[]) => void;
}

export default function PlaygroundCanvas({
  flowNodes,
  flowEdges,
  highlightedNodes,
  highlightedEdges,
  onConnect,
  onClear,
  onShare,
  onAddAt,
  placingSlug,
  onLoadPreset,
}: PlaygroundCanvasProps) {
  const { nodes: elkNodes, edges: elkEdges, isLayouting } = useElkLayout(
    flowNodes,
    flowEdges,
    undefined,
  );

  const anchors = usePlaygroundStore((s) => s.anchors);
  const nodePositions = usePlaygroundStore((s) => s.nodePositions);
  const addedSlugs = usePlaygroundStore((s) => s.addedSlugs);
  const setAnchors = usePlaygroundStore((s) => s.setAnchors);
  const setNodePositions = usePlaygroundStore((s) => s.setNodePositions);
  const resetLayout = usePlaygroundStore((s) => s.resetLayout);

  const positionedNodes = useMemo(
    () => applyAnchorOffsets(elkNodes, anchors, nodePositions),
    [elkNodes, anchors, nodePositions],
  );

  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const focusSeqRef = useRef(0);
  const prevSlugsRef = useRef<Set<string>>(new Set());

  const requestFocus = useCallback((nodeIds: string[] | null) => {
    focusSeqRef.current += 1;
    setFocusRequest({ seq: focusSeqRef.current, nodeIds });
  }, []);

  // Assign anchors to clusters that do not have one yet (click-add, presets,
  // auto-layout reset): place them in a row to the right of the occupied
  // area, then move the viewport to show them. Entries added via drag & drop
  // arrive with their anchor already set, so the viewport stays put.
  useEffect(() => {
    if (isLayouting) return;

    const clusterNodes = new Map<string, Node[]>();
    for (const n of elkNodes) {
      const slug = slugOfPlaygroundId(n.id);
      if (!slug) continue;
      const list = clusterNodes.get(slug);
      if (list) list.push(n);
      else clusterNodes.set(slug, [n]);
    }

    const slugsOnCanvas = addedSlugs.filter((s) => clusterNodes.has(s));
    const missing = slugsOnCanvas.filter((s) => !anchors[s]);
    const prev = prevSlugsRef.current;
    prevSlugsRef.current = new Set(slugsOnCanvas);

    if (missing.length > 0) {
      // Occupied bounding box of the already-anchored clusters, in final
      // (anchor-translated, override-applied) coordinates.
      let occupied = false;
      let maxX = 0;
      let minY = 0;
      for (const n of positionedNodes) {
        if (n.parentId) continue;
        const slug = slugOfPlaygroundId(n.id);
        if (!slug || missing.includes(slug)) continue;
        const right = n.position.x + (n.width ?? 200);
        if (!occupied) {
          occupied = true;
          maxX = right;
          minY = n.position.y;
        } else {
          maxX = Math.max(maxX, right);
          minY = Math.min(minY, n.position.y);
        }
      }

      let cursorX = occupied ? maxX + CLUSTER_GAP : 0;
      const baseY = occupied ? minY : 0;
      const patch: Record<string, XY> = {};
      for (const slug of missing) {
        let clusterMinX = Infinity;
        let clusterMaxX = -Infinity;
        for (const n of clusterNodes.get(slug) ?? []) {
          if (n.parentId) continue;
          clusterMinX = Math.min(clusterMinX, n.position.x);
          clusterMaxX = Math.max(clusterMaxX, n.position.x + (n.width ?? 200));
        }
        const width =
          Number.isFinite(clusterMinX) && Number.isFinite(clusterMaxX)
            ? clusterMaxX - clusterMinX
            : 400;
        patch[slug] = { x: cursorX, y: baseY };
        cursorX += width + CLUSTER_GAP;
      }
      setAnchors(patch);

      // Fit the whole canvas when everything is new (first add, presets,
      // auto-layout reset); otherwise zoom to just the new clusters.
      if (missing.length === slugsOnCanvas.length) {
        requestFocus(null);
      } else {
        const ids: string[] = [];
        for (const slug of missing) {
          for (const n of clusterNodes.get(slug) ?? []) ids.push(n.id);
        }
        requestFocus(ids);
      }
      return;
    }

    // Clusters that appeared with a preset anchor (share/localStorage restore
    // fills a previously empty canvas → fit everything; a drag & drop onto a
    // non-empty canvas keeps the viewport where the user dropped).
    if (prev.size === 0 && slugsOnCanvas.length > 0) {
      requestFocus(null);
    }
  }, [
    isLayouting,
    elkNodes,
    positionedNodes,
    anchors,
    addedSlugs,
    setAnchors,
    requestFocus,
  ]);

  const handleRelayout = useCallback(() => {
    resetLayout();
  }, [resetLayout]);

  const handleNodesMoved = useCallback(
    (positions: Record<string, XY>) => {
      setNodePositions(positions);
    },
    [setNodePositions],
  );

  return (
    <ReactFlowProvider>
      <PlaygroundCanvasInner
        layoutNodes={positionedNodes}
        layoutEdges={elkEdges}
        isLayouting={isLayouting}
        highlightedNodes={highlightedNodes}
        highlightedEdges={highlightedEdges}
        onConnect={onConnect}
        onRelayout={handleRelayout}
        onClear={onClear}
        onShare={onShare}
        onAddAt={onAddAt}
        placingSlug={placingSlug}
        onLoadPreset={onLoadPreset}
        onNodesMoved={handleNodesMoved}
        focusRequest={focusRequest}
        isEmpty={flowNodes.length === 0}
      />
    </ReactFlowProvider>
  );
}
