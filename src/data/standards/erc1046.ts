import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1046',
  name: 'ERC-1046',
  shortDescription: 'erc1046.short',
  category: 'token',
  entryType: 'standard',
  eipNumber: 1046,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1046',
  relatedSlugs: ['erc20', 'erc721', 'erc1155', 'erc165'],
  sortOrder: 11046,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20, 721, 1155],
  relations: [
    { slug: 'erc20', kind: 'extends' },
    { slug: 'erc721', kind: 'requires' },
    { slug: 'erc1155', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-1046 Specification', url: 'https://eips.ethereum.org/EIPS/eip-1046', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc1046.introduction',
  designPurpose: 'erc1046.designPurpose',
  commonUsage: 'erc1046.commonUsage',

  functions: [
    {
      name: 'tokenURI',
      signature: 'tokenURI() → string',
      type: 'read',
      params: [],
      returns: [{ name: 'uri', type: 'string', description: 'erc1046.fn.tokenURI.returns.uri' }],
      description: 'erc1046.fn.tokenURI.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc1046.node.user',
      data: { address: '0xWallet' },
      layoutHint: 'source',
    },
    {
      id: 'erc1046-contract',
      type: 'contract',
      label: 'erc1046.node.contract',
      data: { functions: ['tokenURI'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-tokenURI',
      type: 'function',
      label: 'tokenURI()',
      data: { fnType: 'read', signature: 'tokenURI() → string' },
    },
    {
      id: 'storage-uri',
      type: 'storage',
      label: 'erc1046.node.storageUri',
      data: { slots: [{ key: '_tokenURI', label: 'string' }] },
      layoutHint: 'storage',
    },
    {
      id: 'metadata',
      type: 'storage',
      label: 'erc1046.node.metadata',
      data: {
        slots: [
          { key: 'interop', label: 'InteroperabilityMetadata' },
          { key: 'name', label: 'string' },
          { key: 'symbol', label: 'string' },
          { key: 'decimals', label: 'number' },
        ],
      },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-tokenURI',
      source: 'user',
      target: 'fn-tokenURI',
      type: 'animated',
      label: 'erc1046.edge.callTokenURI',
    },
    {
      id: 'e-tokenURI-contract',
      source: 'fn-tokenURI',
      target: 'erc1046-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-uri',
      source: 'erc1046-contract',
      target: 'storage-uri',
      type: 'labeled',
      label: 'erc1046.edge.readUri',
    },
    {
      id: 'e-user-metadata',
      source: 'user',
      target: 'metadata',
      type: 'labeled',
      label: 'erc1046.edge.fetchMetadata',
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
      id: 'token-uri-walkthrough',
      name: 'erc1046.sim.tokenUriWalkthrough.name',
      description: 'erc1046.sim.tokenUriWalkthrough.desc',
      params: [
        {
          id: 'token',
          label: 'erc1046.sim.tokenUriWalkthrough.param.token',
          type: 'address',
          defaultValue: '0xToken',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc1046.sim.tokenUriWalkthrough.step.call',
          mobileDescription: 'erc1046.sim.tokenUriWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-tokenURI'],
          highlightEdges: ['e-user-tokenURI'],
          durationMs: 1000,
        },
        {
          id: 'step-resolve',
          description: 'erc1046.sim.tokenUriWalkthrough.step.resolve',
          mobileDescription: 'erc1046.sim.tokenUriWalkthrough.step.resolve.mobile',
          highlightNodes: ['fn-tokenURI', 'erc1046-contract', 'storage-uri'],
          highlightEdges: ['e-tokenURI-contract', 'e-contract-uri'],
          valueChanges: {
            'storage-uri._tokenURI': 'https://example.com/token.json',
            'fn-tokenURI.output': 'https://example.com/token.json',
          },
          durationMs: 1200,
        },
        {
          id: 'step-fetch',
          description: 'erc1046.sim.tokenUriWalkthrough.step.fetch',
          mobileDescription: 'erc1046.sim.tokenUriWalkthrough.step.fetch.mobile',
          highlightNodes: ['user', 'metadata'],
          highlightEdges: ['e-user-metadata'],
          valueChanges: { 'metadata.interop': '{ erc1046: true }' },
          durationMs: 900,
        },
      ],
    },
  ],
};
