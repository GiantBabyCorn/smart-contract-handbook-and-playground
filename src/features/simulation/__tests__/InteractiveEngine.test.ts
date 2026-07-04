import { describe, it, expect } from 'vitest';
import {
  traceCallPath,
  buildInteractiveScenario,
} from '@/features/simulation/InteractiveEngine';
import type {
  ContractFunction,
  FlowNodeDef,
  FlowEdgeDef,
} from '@/data/types';

// Two-entry playground graph: each entry has its own user node.
const nodes: FlowNodeDef[] = [
  { id: 'erc20--user', type: 'user', label: 'erc20.node.user', data: {} },
  {
    id: 'erc20--contract',
    type: 'contract',
    label: 'erc20.node.contract',
    data: { functions: ['transfer'] },
  },
  {
    id: 'erc20--storage',
    type: 'storage',
    label: 'erc20.node.storage',
    data: {},
  },
  { id: 'erc721--user', type: 'user', label: 'erc721.node.user', data: {} },
  {
    id: 'erc721--contract',
    type: 'contract',
    label: 'erc721.node.contract',
    data: { functions: ['transfer'] },
  },
];

const edges: FlowEdgeDef[] = [
  {
    id: 'erc20--e1',
    source: 'erc20--user',
    target: 'erc20--contract',
    type: 'animated',
  },
  {
    id: 'erc20--e2',
    source: 'erc20--contract',
    target: 'erc20--storage',
    type: 'animated',
  },
  {
    id: 'erc721--e1',
    source: 'erc721--user',
    target: 'erc721--contract',
    type: 'animated',
  },
];

const transferFn: ContractFunction = {
  name: 'transfer',
  signature: 'transfer(address,uint256)',
  type: 'write',
  params: [{ name: 'to', type: 'address', description: '' }],
  description: 'erc20.fn.transfer.desc',
};

describe('traceCallPath', () => {
  it('defaults to the first user node as entry point', () => {
    const steps = traceCallPath(transferFn, nodes, edges);
    expect(steps[0].highlightNodes).toContain('erc20--user');
  });

  it('traces from the caller-selected startNodeId instead of the first user node', () => {
    const steps = traceCallPath(transferFn, nodes, edges, {
      startNodeId: 'erc721--user',
    });
    expect(steps[0].highlightNodes).toContain('erc721--user');
    // Path stays inside the erc721 cluster (no edge from erc721 user to erc20).
    expect(
      steps.every((s) => !s.highlightNodes.includes('erc20--user')),
    ).toBe(true);
  });

  it('falls back to the default entry when startNodeId does not exist', () => {
    const steps = traceCallPath(transferFn, nodes, edges, {
      startNodeId: 'nope--gone',
    });
    expect(steps[0].highlightNodes).toContain('erc20--user');
  });

  it('resolves labels and applies templates in step descriptions', () => {
    const steps = traceCallPath(transferFn, nodes, edges, {
      resolveLabel: (raw) => raw.replace(/^erc20\.node\./, 'L:'),
      templates: {
        startAt: (l) => `開始：${l}`,
        callReaches: (l) => `到達 ${l}`,
        updateStorage: (l) => `更新 ${l}`,
      },
    });
    expect(steps[0].description).toBe('開始：L:user');
    expect(steps.some((s) => s.description === '到達 L:contract')).toBe(true);
    expect(steps.some((s) => s.description === '更新 L:storage')).toBe(true);
    // No raw node ids or raw i18n keys leak into descriptions.
    for (const s of steps) {
      expect(s.description).not.toMatch(/erc20--/);
      expect(s.description).not.toMatch(/erc20\.node\./);
    }
  });

  it('keeps English defaults when no templates are given', () => {
    const steps = traceCallPath(transferFn, nodes, edges);
    expect(steps[0].description).toMatch(/^Start from /);
  });
});

describe('buildInteractiveScenario', () => {
  it('threads options through to the trace and keeps user params', () => {
    const scenario = buildInteractiveScenario(
      transferFn,
      nodes,
      edges,
      { to: '0xabc' },
      { startNodeId: 'erc721--user' },
    );
    expect(scenario.steps[0].highlightNodes).toContain('erc721--user');
    expect(scenario.params[0].defaultValue).toBe('0xabc');
    expect(scenario.id).toBe('interactive-transfer(address,uint256)');
  });

  it('resolves pre-authored callPath descriptions via resolveLabel', () => {
    const fnWithPath: ContractFunction = {
      ...transferFn,
      callPath: [
        {
          highlightNodes: ['erc20--user'],
          highlightEdges: [],
          description: 'erc20.sim.step.one',
        },
      ],
    };
    const scenario = buildInteractiveScenario(fnWithPath, nodes, edges, {}, {
      resolveLabel: (raw) =>
        raw === 'erc20.sim.step.one' ? 'Step one resolved' : raw,
    });
    expect(scenario.steps[0].description).toBe('Step one resolved');
  });
});
