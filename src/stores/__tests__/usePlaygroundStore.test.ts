import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { StandardEntry } from '@/data/types';

// The store module applies zustand's persist middleware at import time —
// give it a real (in-memory) localStorage before importing.
const memoryStorage = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => memoryStorage.get(key) ?? null,
  setItem: (key: string, value: string) => void memoryStorage.set(key, value),
  removeItem: (key: string) => void memoryStorage.delete(key),
  clear: () => memoryStorage.clear(),
  key: (i: number) => [...memoryStorage.keys()][i] ?? null,
  get length() {
    return memoryStorage.size;
  },
});

const {
  usePlaygroundStore,
  migratePlaygroundState,
  isCustomEdge,
  slugOfPlaygroundId,
  PLAYGROUND_PERSIST_VERSION,
} = await import('@/stores/usePlaygroundStore');

function makeEntry(slug: string): StandardEntry {
  return {
    slug,
    name: slug.toUpperCase(),
    shortDescription: `${slug}.short`,
    category: 'token',
    entryType: 'standard',
    eipNumber: 20,
    officialUrl: 'https://example.com',
    relatedSlugs: [],
    sortOrder: 1,
    introduction: `${slug}.introduction`,
    designPurpose: `${slug}.designPurpose`,
    commonUsage: `${slug}.commonUsage`,
    functions: [
      {
        name: 'transfer',
        signature: 'transfer(address,uint256)',
        type: 'write',
        params: [],
        description: `${slug}.fn.transfer.desc`,
      },
    ],
    flowNodes: [
      { id: 'user', type: 'user', label: `${slug}.node.user`, data: {} },
      {
        id: 'contract',
        type: 'contract',
        label: `${slug}.node.contract`,
        data: { functions: ['transfer'] },
      },
    ],
    flowEdges: [
      {
        id: 'e1',
        source: 'user',
        target: 'contract',
        type: 'animated',
        label: `${slug}.edge.e1`,
      },
    ],
    simulations: [],
  };
}

beforeEach(() => {
  usePlaygroundStore.getState().clear();
});

describe('usePlaygroundStore', () => {
  it('addEntry prefixes ids and records functions per slug', () => {
    usePlaygroundStore.getState().addEntry('erc20', makeEntry('erc20'));
    const s = usePlaygroundStore.getState();

    expect(s.addedSlugs).toEqual(['erc20']);
    expect(s.nodes.map((n) => n.id)).toEqual(['erc20--user', 'erc20--contract']);
    expect(s.edges[0]).toMatchObject({
      id: 'erc20--e1',
      source: 'erc20--user',
      target: 'erc20--contract',
    });
    expect(s.functionsBySlug.erc20).toHaveLength(1);
    expect(slugOfPlaygroundId('erc20--user')).toBe('erc20');
  });

  it('addEntry stores the drop anchor when provided and dedupes slugs', () => {
    const store = usePlaygroundStore.getState();
    store.addEntry('erc20', makeEntry('erc20'), { anchor: { x: 40, y: 60 } });
    store.addEntry('erc20', makeEntry('erc20'));

    const s = usePlaygroundStore.getState();
    expect(s.addedSlugs).toEqual(['erc20']);
    expect(s.anchors.erc20).toEqual({ x: 40, y: 60 });
    expect(s.nodes).toHaveLength(2);
  });

  it('removeEntry leaves zero residue (nodes, edges, functions, anchors, positions)', () => {
    const store = usePlaygroundStore.getState();
    store.addEntry('erc20', makeEntry('erc20'), { anchor: { x: 0, y: 0 } });
    store.addEntry('erc721', makeEntry('erc721'), { anchor: { x: 900, y: 0 } });
    store.setNodePositions({
      'erc20--user': { x: 1, y: 2 },
      'erc721--user': { x: 3, y: 4 },
    });
    // Cross-entry user-drawn edge must also disappear with either endpoint.
    store.addEdge({
      id: 'pg-edge-erc20--contract-erc721--user-1',
      source: 'erc20--contract',
      target: 'erc721--user',
      type: 'animated',
      label: '',
    });

    usePlaygroundStore.getState().removeEntry('erc721');
    const s = usePlaygroundStore.getState();

    expect(s.addedSlugs).toEqual(['erc20']);
    expect(s.nodes.every((n) => !n.id.startsWith('erc721--'))).toBe(true);
    expect(
      s.edges.every(
        (e) =>
          !e.id.startsWith('erc721--') &&
          !e.source.startsWith('erc721--') &&
          !e.target.startsWith('erc721--'),
      ),
    ).toBe(true);
    expect(s.functionsBySlug.erc721).toBeUndefined();
    expect(s.anchors.erc721).toBeUndefined();
    expect(s.nodePositions['erc721--user']).toBeUndefined();
    // The other entry is untouched.
    expect(s.functionsBySlug.erc20).toHaveLength(1);
    expect(s.nodePositions['erc20--user']).toEqual({ x: 1, y: 2 });
  });

  it('setFunctions only fills missing slugs that are still added', () => {
    const store = usePlaygroundStore.getState();
    store.addEntry('erc20', makeEntry('erc20'));
    const original = usePlaygroundStore.getState().functionsBySlug.erc20;

    store.setFunctions('erc20', []); // already present — ignored
    expect(usePlaygroundStore.getState().functionsBySlug.erc20).toBe(original);

    store.setFunctions('erc721', []); // not added — ignored
    expect(
      usePlaygroundStore.getState().functionsBySlug.erc721,
    ).toBeUndefined();
  });

  it('resetLayout clears anchors and node positions but keeps the graph', () => {
    const store = usePlaygroundStore.getState();
    store.addEntry('erc20', makeEntry('erc20'), { anchor: { x: 5, y: 5 } });
    store.setNodePositions({ 'erc20--user': { x: 9, y: 9 } });

    usePlaygroundStore.getState().resetLayout();
    const s = usePlaygroundStore.getState();
    expect(s.anchors).toEqual({});
    expect(s.nodePositions).toEqual({});
    expect(s.nodes).toHaveLength(2);
  });

  it('loadShared rebuilds the canvas from slugs and keeps only valid custom edges', () => {
    usePlaygroundStore.getState().loadShared(
      {
        v: 2,
        slugs: ['erc20', 'erc721', 'missing'],
        anchors: { erc20: { x: 10, y: 20 } },
        positions: {
          'erc20--user': { x: 7, y: 8 },
          'ghost--node': { x: 0, y: 0 },
        },
        edges: [
          {
            id: 'pg-edge-ok',
            source: 'erc20--contract',
            target: 'erc721--user',
            type: 'animated',
            label: '',
          },
          {
            id: 'pg-edge-dangling',
            source: 'erc20--contract',
            target: 'gone--node',
            type: 'animated',
            label: '',
          },
        ],
      },
      { erc20: makeEntry('erc20'), erc721: makeEntry('erc721'), missing: null },
    );

    const s = usePlaygroundStore.getState();
    expect(s.addedSlugs).toEqual(['erc20', 'erc721']);
    expect(s.nodes).toHaveLength(4);
    expect(s.edges.filter(isCustomEdge).map((e) => e.id)).toEqual(['pg-edge-ok']);
    expect(s.anchors).toEqual({ erc20: { x: 10, y: 20 } });
    expect(s.nodePositions).toEqual({ 'erc20--user': { x: 7, y: 8 } });
    expect(Object.keys(s.functionsBySlug).sort()).toEqual(['erc20', 'erc721']);
  });
});

describe('migratePlaygroundState', () => {
  it('drops the flat v0/v1 functions list but keeps the canvas', () => {
    const migrated = migratePlaygroundState(
      {
        nodes: [{ id: 'erc20--user', type: 'user', label: 'x', data: {} }],
        edges: [],
        functions: [{ name: 'transfer' }],
        addedSlugs: ['erc20'],
      },
      0,
    );
    expect(migrated.nodes).toHaveLength(1);
    expect(migrated.addedSlugs).toEqual(['erc20']);
    expect(migrated.functionsBySlug).toEqual({});
    expect(migrated.anchors).toEqual({});
    expect(migrated.nodePositions).toEqual({});
    expect('functions' in migrated).toBe(false);
  });

  it('fills defaults for malformed persisted payloads', () => {
    const migrated = migratePlaygroundState({ nodes: 'nope' }, 0);
    expect(migrated.nodes).toEqual([]);
    expect(migrated.edges).toEqual([]);
    expect(migrated.addedSlugs).toEqual([]);
  });

  it('passes v2 payloads through, backfilling new fields', () => {
    const migrated = migratePlaygroundState(
      { nodes: [], edges: [], addedSlugs: [] },
      PLAYGROUND_PERSIST_VERSION,
    );
    expect(migrated.functionsBySlug).toEqual({});
    expect(migrated.anchors).toEqual({});
  });
});
