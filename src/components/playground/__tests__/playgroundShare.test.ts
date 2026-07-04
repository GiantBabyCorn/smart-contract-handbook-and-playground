import { describe, it, expect } from 'vitest';
import {
  buildSharedState,
  encodeShareParam,
  decodeShareParam,
  SHARE_STATE_VERSION,
} from '@/components/playground/playgroundShare';
import type { FlowEdgeDef } from '@/data/types';

const customEdge: FlowEdgeDef = {
  id: 'pg-edge-a-b-1',
  source: 'erc20--contract',
  target: 'erc2612--user',
  type: 'animated',
  label: '',
};

const entryEdge: FlowEdgeDef = {
  id: 'erc20--e1',
  source: 'erc20--user',
  target: 'erc20--contract',
  type: 'animated',
  label: 'erc20.edge.e1',
};

describe('playgroundShare codec', () => {
  it('round-trips a canvas snapshot and keeps only custom edges', async () => {
    const shared = buildSharedState({
      addedSlugs: ['erc20', 'erc2612', 'uniswap-v2'],
      anchors: { erc20: { x: 0, y: 0 }, erc2612: { x: 900, y: 0 } },
      nodePositions: { 'erc20--user': { x: 12.5, y: -30 } },
      edges: [entryEdge, customEdge],
    });
    expect(shared.edges).toHaveLength(1); // entry edges are re-derivable

    const param = await encodeShareParam(shared);
    expect(param).toMatch(/^[\w-]+$/); // base64url — URL-safe
    const decoded = await decodeShareParam(param);

    expect(decoded.v).toBe(SHARE_STATE_VERSION);
    expect(decoded.slugs).toEqual(['erc20', 'erc2612', 'uniswap-v2']);
    expect(decoded.anchors).toEqual(shared.anchors);
    expect(decoded.positions).toEqual(shared.positions);
    expect(decoded.edges).toEqual([customEdge]);
  });

  it('stays compact for a typical three-entry canvas', async () => {
    const param = await encodeShareParam(
      buildSharedState({
        addedSlugs: ['erc20', 'erc2612', 'uniswap-v2'],
        anchors: {
          erc20: { x: 0, y: 0 },
          erc2612: { x: 950, y: 0 },
          'uniswap-v2': { x: 1900, y: 0 },
        },
        nodePositions: {},
        edges: [customEdge],
      }),
    );
    expect(param.length).toBeLessThan(500);
  });

  it('rejects garbage, oversized and wrong-version payloads', async () => {
    await expect(decodeShareParam('')).rejects.toThrow();
    await expect(decodeShareParam('%%%not-base64%%%')).rejects.toThrow();
    await expect(decodeShareParam('a'.repeat(30_000))).rejects.toThrow();

    const future = await encodeShareParam({
      v: SHARE_STATE_VERSION + 1,
      slugs: [],
      anchors: {},
      positions: {},
      edges: [],
    });
    await expect(decodeShareParam(future)).rejects.toThrow(/version/);
  });

  it('sanitizes invalid slugs, positions and non-custom edges', async () => {
    const param = await encodeShareParam({
      v: SHARE_STATE_VERSION,
      // @ts-expect-error — deliberately malformed payload
      slugs: ['erc20', 'Bad Slug!', 42],
      anchors: { erc20: { x: 1, y: 2 }, 'bad slug': { x: 0, y: 0 } },
      positions: { n1: { x: Infinity, y: 0 }, n2: { x: 3, y: 4 } },
      edges: [entryEdge, customEdge, { id: 'pg-edge-x' }],
    });
    const decoded = await decodeShareParam(param);
    expect(decoded.slugs).toEqual(['erc20']);
    expect(Object.keys(decoded.anchors)).toEqual(['erc20']);
    expect(decoded.positions).toEqual({ n2: { x: 3, y: 4 } });
    expect(decoded.edges).toEqual([customEdge]);
  });
});
