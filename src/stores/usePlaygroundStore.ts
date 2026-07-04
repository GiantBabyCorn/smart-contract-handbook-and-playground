import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlowNodeDef, FlowEdgeDef, ContractFunction, ERCEntry } from '@/data/types';

// ─── Shared primitives ────────────────────────────────────────────────────────

/** A 2-D canvas coordinate. */
export interface XY {
  x: number;
  y: number;
}

/** User-drawn edges (via canvas connect / share restore) get this id prefix;
 *  entry-derived edges are `${slug}--` prefixed instead. */
export const CUSTOM_EDGE_PREFIX = 'pg-edge-';

export function isCustomEdge(edge: Pick<FlowEdgeDef, 'id'>): boolean {
  return edge.id.startsWith(CUSTOM_EDGE_PREFIX);
}

/**
 * Prefix a node/edge ID with the entry slug to avoid collisions when
 * multiple entries are composed together.
 */
function prefixId(slug: string, id: string): string {
  return `${slug}--${id}`;
}

/** Derive the owning entry slug from a `${slug}--` prefixed playground id. */
export function slugOfPlaygroundId(id: string): string | null {
  const sep = id.indexOf('--');
  return sep > 0 ? id.slice(0, sep) : null;
}

/** Copy an entry's flow graph with all ids prefixed by the entry slug. */
function prefixEntryGraph(
  slug: string,
  entry: ERCEntry,
): { nodes: FlowNodeDef[]; edges: FlowEdgeDef[] } {
  const nodes: FlowNodeDef[] = entry.flowNodes.map((n) => {
    const prefixed = { ...n, id: prefixId(slug, n.id) } as FlowNodeDef;
    // Update parentId if present
    if ('parentId' in n && n.parentId) {
      (prefixed as FlowNodeDef & { parentId?: string }).parentId = prefixId(
        slug,
        n.parentId,
      );
    }
    return prefixed;
  });

  const edges: FlowEdgeDef[] = entry.flowEdges.map((e) => ({
    ...e,
    id: prefixId(slug, e.id),
    source: prefixId(slug, e.source),
    target: prefixId(slug, e.target),
  }));

  return { nodes, edges };
}

// ─── Share payload ────────────────────────────────────────────────────────────

/** Serializable canvas snapshot used by the `?state=` share URL (see
 *  components/playground/playgroundShare.ts for the codec). */
export interface SharedPlaygroundState {
  v: number;
  slugs: string[];
  anchors: Record<string, XY>;
  positions: Record<string, XY>;
  /** User-drawn (custom) edges only — entry edges are re-derived from slugs. */
  edges: FlowEdgeDef[];
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface PlaygroundState {
  nodes: FlowNodeDef[];
  edges: FlowEdgeDef[];
  /** Functions grouped per entry slug so removeEntry leaves zero residue and
   *  the interactive panel can group its list by contract. */
  functionsBySlug: Record<string, ContractFunction[]>;
  addedSlugs: string[];
  /** Per-entry cluster anchor: the top-left corner of the entry's node
   *  cluster in canvas coordinates (drop point / auto-placement slot). */
  anchors: Record<string, XY>;
  /** Per-node drag overrides (absolute for root nodes, parent-relative for
   *  children), applied on top of the ELK layout + anchor translation. */
  nodePositions: Record<string, XY>;
}

interface PlaygroundStore extends PlaygroundState {
  addEntry: (slug: string, entry: ERCEntry, opts?: { anchor?: XY }) => void;
  removeEntry: (slug: string) => void;
  /** Idempotent late fill for states migrated from v0/v1 (flat function list). */
  setFunctions: (slug: string, functions: ContractFunction[]) => void;
  addEdge: (edge: FlowEdgeDef) => void;
  removeEdge: (edgeId: string) => void;
  setAnchor: (slug: string, anchor: XY) => void;
  /** Merge a batch of cluster anchors (auto-placement of new entries). */
  setAnchors: (patch: Record<string, XY>) => void;
  /** Merge a batch of per-node drag positions. */
  setNodePositions: (patch: Record<string, XY>) => void;
  /** Clear anchors + drag overrides so the canvas returns to auto-layout. */
  resetLayout: () => void;
  /** Replace the whole canvas from a decoded share payload. */
  loadShared: (
    shared: SharedPlaygroundState,
    entriesBySlug: Record<string, ERCEntry | null>,
  ) => void;
  clear: () => void;
}

// TODO(future): allow custom blank nodes (mock contracts, external protocols)
// via a `custom--{uuid}` id prefix — the slug-prefixed id scheme already
// leaves room for it.

const EMPTY_STATE: PlaygroundState = {
  nodes: [],
  edges: [],
  functionsBySlug: {},
  addedSlugs: [],
  anchors: {},
  nodePositions: {},
};

export const PLAYGROUND_PERSIST_VERSION = 2;

/**
 * Persist migration. v0/v1 stored a flat `functions: ContractFunction[]`
 * with no slug attribution (the removeEntry leak) — drop it and keep the
 * canvas; PlaygroundPage lazily refills `functionsBySlug` from the entry
 * modules for every addedSlug that has no functions yet.
 */
export function migratePlaygroundState(
  persisted: unknown,
  version: number,
): PlaygroundState {
  const p = (persisted ?? {}) as Partial<PlaygroundState>;
  if (version >= PLAYGROUND_PERSIST_VERSION) {
    return { ...EMPTY_STATE, ...p };
  }
  return {
    nodes: Array.isArray(p.nodes) ? p.nodes : [],
    edges: Array.isArray(p.edges) ? p.edges : [],
    functionsBySlug: {},
    addedSlugs: Array.isArray(p.addedSlugs) ? p.addedSlugs : [],
    anchors: {},
    nodePositions: {},
  };
}

function isFiniteXY(value: unknown): value is XY {
  return (
    typeof value === 'object' &&
    value !== null &&
    Number.isFinite((value as XY).x) &&
    Number.isFinite((value as XY).y)
  );
}

export const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set) => ({
      ...EMPTY_STATE,

      addEntry: (slug, entry, opts) =>
        set((state) => {
          if (state.addedSlugs.includes(slug)) return state;

          const { nodes, edges } = prefixEntryGraph(slug, entry);

          return {
            nodes: [...state.nodes, ...nodes],
            edges: [...state.edges, ...edges],
            functionsBySlug: {
              ...state.functionsBySlug,
              [slug]: entry.functions,
            },
            addedSlugs: [...state.addedSlugs, slug],
            anchors: opts?.anchor
              ? { ...state.anchors, [slug]: opts.anchor }
              : state.anchors,
          };
        }),

      removeEntry: (slug) =>
        set((state) => {
          const prefix = `${slug}--`;
          const functionsBySlug = { ...state.functionsBySlug };
          delete functionsBySlug[slug];
          const anchors = { ...state.anchors };
          delete anchors[slug];
          const nodePositions = Object.fromEntries(
            Object.entries(state.nodePositions).filter(
              ([id]) => !id.startsWith(prefix),
            ),
          );
          return {
            nodes: state.nodes.filter((n) => !n.id.startsWith(prefix)),
            edges: state.edges.filter(
              (e) =>
                !e.id.startsWith(prefix) &&
                !e.source.startsWith(prefix) &&
                !e.target.startsWith(prefix),
            ),
            functionsBySlug,
            addedSlugs: state.addedSlugs.filter((s) => s !== slug),
            anchors,
            nodePositions,
          };
        }),

      setFunctions: (slug, functions) =>
        set((state) => {
          if (!state.addedSlugs.includes(slug) || state.functionsBySlug[slug]) {
            return state;
          }
          return {
            functionsBySlug: { ...state.functionsBySlug, [slug]: functions },
          };
        }),

      addEdge: (edge) =>
        set((state) => ({
          edges: [...state.edges, edge],
        })),

      removeEdge: (edgeId) =>
        set((state) => ({
          edges: state.edges.filter((e) => e.id !== edgeId),
        })),

      setAnchor: (slug, anchor) =>
        set((state) => ({
          anchors: { ...state.anchors, [slug]: anchor },
        })),

      setAnchors: (patch) =>
        set((state) => ({
          anchors: { ...state.anchors, ...patch },
        })),

      setNodePositions: (patch) =>
        set((state) => ({
          nodePositions: { ...state.nodePositions, ...patch },
        })),

      resetLayout: () =>
        set({
          anchors: {},
          nodePositions: {},
        }),

      loadShared: (shared, entriesBySlug) =>
        set(() => {
          const nodes: FlowNodeDef[] = [];
          const edges: FlowEdgeDef[] = [];
          const functionsBySlug: Record<string, ContractFunction[]> = {};
          const addedSlugs: string[] = [];

          for (const slug of shared.slugs) {
            const entry = entriesBySlug[slug];
            if (!entry || addedSlugs.includes(slug)) continue;
            const graph = prefixEntryGraph(slug, entry);
            nodes.push(...graph.nodes);
            edges.push(...graph.edges);
            functionsBySlug[slug] = entry.functions;
            addedSlugs.push(slug);
          }

          const nodeIds = new Set(nodes.map((n) => n.id));
          for (const edge of shared.edges) {
            if (
              isCustomEdge(edge) &&
              nodeIds.has(edge.source) &&
              nodeIds.has(edge.target)
            ) {
              edges.push(edge);
            }
          }

          const anchors: Record<string, XY> = {};
          for (const slug of addedSlugs) {
            const anchor = shared.anchors[slug];
            if (isFiniteXY(anchor)) anchors[slug] = { x: anchor.x, y: anchor.y };
          }

          const nodePositions: Record<string, XY> = {};
          for (const [id, pos] of Object.entries(shared.positions)) {
            if (nodeIds.has(id) && isFiniteXY(pos)) {
              nodePositions[id] = { x: pos.x, y: pos.y };
            }
          }

          return { nodes, edges, functionsBySlug, addedSlugs, anchors, nodePositions };
        }),

      clear: () => set({ ...EMPTY_STATE }),
    }),
    {
      name: 'erc-playground-state',
      version: PLAYGROUND_PERSIST_VERSION,
      migrate: (persisted, version) =>
        migratePlaygroundState(persisted, version) as PlaygroundStore,
    },
  ),
);
