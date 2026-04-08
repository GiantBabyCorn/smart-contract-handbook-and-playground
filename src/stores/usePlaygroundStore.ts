import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlowNodeDef, FlowEdgeDef, ContractFunction, ERCEntry } from '@/data/types';

interface PlaygroundStore {
  // ─── State ───────────────────────────────────────────────────────────────────
  nodes: FlowNodeDef[];
  edges: FlowEdgeDef[];
  functions: ContractFunction[];
  addedSlugs: string[];

  // ─── Actions ─────────────────────────────────────────────────────────────────
  addEntry: (slug: string, entry: ERCEntry) => void;
  removeEntry: (slug: string) => void;
  addEdge: (edge: FlowEdgeDef) => void;
  removeEdge: (edgeId: string) => void;
  clear: () => void;
}

// TODO: Future enhancement — allow custom blank nodes:
// addCustomNode(type, label, data) — creates a node not from any entry
// This would enable users to create mock contracts, external protocols, etc.
// The UI for this would be a "Create Custom Node" button in the palette
// that opens a form: name, type (contract/user/proxy), functions list.
// The store already separates nodes from entries via slug-prefixed IDs,
// so custom nodes could use a `custom--{uuid}` prefix.

/**
 * Prefix a node/edge ID with the entry slug to avoid collisions when
 * multiple entries are composed together.
 */
function prefixId(slug: string, id: string): string {
  return `${slug}--${id}`;
}

export const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      functions: [],
      addedSlugs: [],

      addEntry: (slug, entry) =>
        set((state) => {
          if (state.addedSlugs.includes(slug)) return state;

          // Prefix all node IDs to avoid collisions across entries
          const newNodes: FlowNodeDef[] = entry.flowNodes.map((n) => {
            const prefixed = { ...n, id: prefixId(slug, n.id) } as FlowNodeDef;
            // Update parentId if present
            if ('parentId' in n && n.parentId) {
              (prefixed as FlowNodeDef & { parentId?: string }).parentId =
                prefixId(slug, n.parentId);
            }
            return prefixed;
          });

          // Prefix edge source/target IDs
          const newEdges: FlowEdgeDef[] = entry.flowEdges.map((e) => ({
            ...e,
            id: prefixId(slug, e.id),
            source: prefixId(slug, e.source),
            target: prefixId(slug, e.target),
          }));

          return {
            nodes: [...state.nodes, ...newNodes],
            edges: [...state.edges, ...newEdges],
            functions: [...state.functions, ...entry.functions],
            addedSlugs: [...state.addedSlugs, slug],
          };
        }),

      removeEntry: (slug) =>
        set((state) => {
          const prefix = `${slug}--`;
          return {
            nodes: state.nodes.filter((n) => !n.id.startsWith(prefix)),
            edges: state.edges.filter(
              (e) =>
                !e.id.startsWith(prefix) &&
                !e.source.startsWith(prefix) &&
                !e.target.startsWith(prefix),
            ),
            functions: state.functions, // TODO: track per-slug functions
            addedSlugs: state.addedSlugs.filter((s) => s !== slug),
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

      clear: () =>
        set({
          nodes: [],
          edges: [],
          functions: [],
          addedSlugs: [],
        }),
    }),
    {
      name: 'erc-playground-state',
    },
  ),
);
