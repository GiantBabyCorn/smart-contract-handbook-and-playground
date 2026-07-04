import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc6944',
  name: 'ERC-6944',
  shortDescription: 'erc6944.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 6944,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-6944',
  relatedSlugs: ['erc5219', 'erc165', 'erc4361'],
  sortOrder: 16944,
  eipStatus: 'Draft',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [4804, 5219],
  relations: [{ slug: 'erc5219', kind: 'requires' }],
  references: [
    { label: 'ERC-6944 Specification', url: 'https://eips.ethereum.org/EIPS/eip-6944', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc6944.introduction',
  designPurpose: 'erc6944.designPurpose',
  commonUsage: 'erc6944.commonUsage',

  functions: [
    {
      name: 'resolveMode',
      signature: 'resolveMode() → bytes32 mode',
      type: 'read',
      params: [],
      returns: [{ name: 'mode', type: 'bytes32', description: 'erc6944.fn.resolveMode.returns.mode' }],
      description: 'erc6944.fn.resolveMode.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc6944.node.user',
      data: { address: '0xGateway' },
      layoutHint: 'source',
    },
    {
      id: 'erc6944-contract',
      type: 'contract',
      label: 'erc6944.node.contract',
      data: { functions: ['resolveMode'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-resolveMode',
      type: 'function',
      label: 'resolveMode()',
      data: { fnType: 'read', signature: 'resolveMode() → bytes32 mode' },
    },
    {
      id: 'storage-mode',
      type: 'storage',
      label: 'erc6944.node.storageMode',
      data: { slots: [{ key: 'mode', label: 'bytes32 "5219"' }] },
      layoutHint: 'storage',
    },
    {
      id: 'browser',
      type: 'user',
      label: 'erc6944.node.browser',
      data: { address: '0xUser' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-resolveMode',
      source: 'user',
      target: 'fn-resolveMode',
      type: 'animated',
      label: 'erc6944.edge.callResolveMode',
    },
    {
      id: 'e-resolveMode-contract',
      source: 'fn-resolveMode',
      target: 'erc6944-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc6944-contract',
      target: 'storage-mode',
      type: 'labeled',
      label: 'erc6944.edge.readMode',
    },
    {
      id: 'e-contract-browser',
      source: 'erc6944-contract',
      target: 'browser',
      type: 'labeled',
      label: 'erc6944.edge.serveResponse',
    },
  ],

  elkLayoutOptions: {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    'elk.spacing.nodeNode': '40',
  },

  // ─── ERCSimulation ───
  simulations: [
    {
      id: 'resolve-mode-walkthrough',
      name: 'erc6944.sim.resolveModeWalkthrough.name',
      description: 'erc6944.sim.resolveModeWalkthrough.desc',
      params: [
        {
          id: 'target',
          label: 'erc6944.sim.resolveModeWalkthrough.param.target',
          type: 'address',
          defaultValue: '0xResolver',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc6944.sim.resolveModeWalkthrough.step.call',
          mobileDescription: 'erc6944.sim.resolveModeWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-resolveMode'],
          highlightEdges: ['e-user-resolveMode'],
          durationMs: 1000,
        },
        {
          id: 'step-resolve',
          description: 'erc6944.sim.resolveModeWalkthrough.step.resolve',
          mobileDescription: 'erc6944.sim.resolveModeWalkthrough.step.resolve.mobile',
          highlightNodes: ['fn-resolveMode', 'erc6944-contract', 'storage-mode'],
          highlightEdges: ['e-resolveMode-contract', 'e-contract-storage'],
          valueChanges: { 'storage-mode.mode': 'bytes32 "5219"' },
          durationMs: 1200,
        },
        {
          id: 'step-serve',
          description: 'erc6944.sim.resolveModeWalkthrough.step.serve',
          mobileDescription: 'erc6944.sim.resolveModeWalkthrough.step.serve.mobile',
          highlightNodes: ['erc6944-contract', 'browser'],
          highlightEdges: ['e-contract-browser'],
          valueChanges: { 'browser.rendered': 'page served via ERC-5219' },
          durationMs: 800,
        },
      ],
    },
  ],
};
