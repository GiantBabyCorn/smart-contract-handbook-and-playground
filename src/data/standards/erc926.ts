import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc926',
  name: 'ERC-926',
  shortDescription: 'erc926.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 926,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-926',
  relatedSlugs: ['erc165', 'erc6551', 'erc1271'],
  sortOrder: 10926,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [165],
  relations: [{ slug: 'erc165', kind: 'requires' }],
  references: [
    { label: 'ERC-926 Specification', url: 'https://eips.ethereum.org/EIPS/eip-926', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc926.introduction',
  designPurpose: 'erc926.designPurpose',
  commonUsage: 'erc926.commonUsage',

  functions: [
    {
      name: 'provider',
      signature: 'provider(address target) → address',
      type: 'read',
      params: [{ name: 'target', type: 'address', description: 'erc926.fn.provider.params.target' }],
      returns: [{ name: 'provider', type: 'address', description: 'erc926.fn.provider.returns.provider' }],
      description: 'erc926.fn.provider.desc',
      defaultSimValues: { target: '0xUser' },
    },
    {
      name: 'setProvider',
      signature: 'setProvider(address _provider)',
      type: 'write',
      params: [{ name: '_provider', type: 'address', description: 'erc926.fn.setProvider.params.provider' }],
      description: 'erc926.fn.setProvider.desc',
      defaultSimValues: { _provider: '0xProvider' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc926.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'erc926-contract',
      type: 'contract',
      label: 'erc926.node.contract',
      data: { functions: ['setProvider', 'provider'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-setProvider',
      type: 'function',
      label: 'setProvider()',
      data: { fnType: 'write', signature: 'setProvider(address _provider)' },
    },
    {
      id: 'fn-provider',
      type: 'function',
      label: 'provider()',
      data: { fnType: 'read', signature: 'provider(address target) → address' },
    },
    {
      id: 'storage-providers',
      type: 'storage',
      label: 'erc926.node.storageProviders',
      data: { slots: [{ key: 'provider', label: 'mapping(address => address)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'consumer',
      type: 'user',
      label: 'erc926.node.consumer',
      data: { address: '0xConsumer' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    { id: 'e-user-setProvider', source: 'user', target: 'fn-setProvider', type: 'animated', label: 'erc926.edge.callSetProvider' },
    { id: 'e-setProvider-contract', source: 'fn-setProvider', target: 'erc926-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc926-contract', target: 'storage-providers', type: 'labeled', label: 'erc926.edge.updateProvider' },
    { id: 'e-consumer-provider', source: 'consumer', target: 'fn-provider', type: 'animated', label: 'erc926.edge.callProvider' },
    { id: 'e-provider-contract', source: 'fn-provider', target: 'erc926-contract', type: 'animated' },
    { id: 'e-contract-read', source: 'erc926-contract', target: 'storage-providers', type: 'labeled', label: 'erc926.edge.readProvider' },
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
      id: 'register-provider-walkthrough',
      name: 'erc926.sim.registerProviderWalkthrough.name',
      description: 'erc926.sim.registerProviderWalkthrough.desc',
      params: [
        {
          id: 'provider',
          label: 'erc926.sim.registerProviderWalkthrough.param.provider',
          type: 'address',
          defaultValue: '0xProvider',
        },
        {
          id: 'target',
          label: 'erc926.sim.registerProviderWalkthrough.param.target',
          type: 'address',
          defaultValue: '0xUser',
        },
      ],
      steps: [
        {
          id: 'step-set',
          description: 'erc926.sim.registerProviderWalkthrough.step.set',
          mobileDescription: 'erc926.sim.registerProviderWalkthrough.step.set.mobile',
          highlightNodes: ['user', 'fn-setProvider'],
          highlightEdges: ['e-user-setProvider'],
          durationMs: 1000,
        },
        {
          id: 'step-store',
          description: 'erc926.sim.registerProviderWalkthrough.step.store',
          mobileDescription: 'erc926.sim.registerProviderWalkthrough.step.store.mobile',
          highlightNodes: ['fn-setProvider', 'erc926-contract', 'storage-providers'],
          highlightEdges: ['e-setProvider-contract', 'e-contract-storage'],
          valueChanges: { 'storage-providers.provider[0xUser]': '0x0 → 0xProvider' },
          durationMs: 1200,
        },
        {
          id: 'step-lookup',
          description: 'erc926.sim.registerProviderWalkthrough.step.lookup',
          mobileDescription: 'erc926.sim.registerProviderWalkthrough.step.lookup.mobile',
          highlightNodes: ['consumer', 'fn-provider', 'erc926-contract', 'storage-providers'],
          highlightEdges: ['e-consumer-provider', 'e-provider-contract', 'e-contract-read'],
          valueChanges: { 'consumer.result': 'provider(0xUser) → 0xProvider' },
          durationMs: 1000,
        },
      ],
    },
  ],
};
