import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7572',
  name: 'ERC-7572',
  shortDescription: 'erc7572.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 7572,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7572',
  relatedSlugs: ['erc721', 'erc1155', 'erc1046', 'erc2981'],
  sortOrder: 17572,
  eipStatus: 'Draft',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  relations: [
    { slug: 'erc721', kind: 'usedWith' },
    { slug: 'erc1155', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-7572 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7572', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7572.introduction',
  designPurpose: 'erc7572.designPurpose',
  commonUsage: 'erc7572.commonUsage',

  functions: [
    {
      name: 'contractURI',
      signature: 'contractURI() → string',
      type: 'read',
      params: [],
      returns: [{ name: 'uri', type: 'string', description: 'erc7572.fn.contractURI.returns.uri' }],
      description: 'erc7572.fn.contractURI.desc',
    },
    {
      name: 'ContractURIUpdated',
      signature: 'ContractURIUpdated()',
      type: 'event',
      params: [],
      description: 'erc7572.fn.ContractURIUpdated.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc7572.node.user',
      data: { address: '0xDapp' },
      layoutHint: 'source',
    },
    {
      id: 'erc7572-contract',
      type: 'contract',
      label: 'erc7572.node.contract',
      data: { functions: ['contractURI'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-contractURI',
      type: 'function',
      label: 'contractURI()',
      data: { fnType: 'read', signature: 'contractURI() → string' },
    },
    {
      id: 'storage-uri',
      type: 'storage',
      label: 'erc7572.node.storageUri',
      data: { slots: [{ key: '_contractURI', label: 'string' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-contractURIUpdated',
      type: 'function',
      label: 'ContractURIUpdated event',
      data: { fnType: 'event', signature: 'ContractURIUpdated()' },
    },
    {
      id: 'indexer',
      type: 'user',
      label: 'erc7572.node.indexer',
      data: { address: '0xIndexer' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-contractURI',
      source: 'user',
      target: 'fn-contractURI',
      type: 'animated',
      label: 'erc7572.edge.callContractURI',
    },
    {
      id: 'e-contractURI-contract',
      source: 'fn-contractURI',
      target: 'erc7572-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-uri',
      source: 'erc7572-contract',
      target: 'storage-uri',
      type: 'labeled',
      label: 'erc7572.edge.readUri',
    },
    {
      id: 'e-contract-event',
      source: 'erc7572-contract',
      target: 'event-contractURIUpdated',
      type: 'labeled',
      label: 'erc7572.edge.emitUpdated',
    },
    {
      id: 'e-event-indexer',
      source: 'event-contractURIUpdated',
      target: 'indexer',
      type: 'labeled',
      label: 'erc7572.edge.notifyIndexer',
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
      id: 'read-metadata-walkthrough',
      name: 'erc7572.sim.readMetadataWalkthrough.name',
      description: 'erc7572.sim.readMetadataWalkthrough.desc',
      params: [
        {
          id: 'contract',
          label: 'erc7572.sim.readMetadataWalkthrough.param.contract',
          type: 'address',
          defaultValue: '0xCollection',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc7572.sim.readMetadataWalkthrough.step.call',
          mobileDescription: 'erc7572.sim.readMetadataWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-contractURI'],
          highlightEdges: ['e-user-contractURI'],
          durationMs: 1000,
        },
        {
          id: 'step-read',
          description: 'erc7572.sim.readMetadataWalkthrough.step.read',
          mobileDescription: 'erc7572.sim.readMetadataWalkthrough.step.read.mobile',
          highlightNodes: ['fn-contractURI', 'erc7572-contract', 'storage-uri'],
          highlightEdges: ['e-contractURI-contract', 'e-contract-uri'],
          valueChanges: {
            'storage-uri._contractURI': 'ipfs://Qm.../contract.json',
            'fn-contractURI.output': 'ipfs://Qm.../contract.json',
          },
          durationMs: 1200,
        },
        {
          id: 'step-update',
          description: 'erc7572.sim.readMetadataWalkthrough.step.update',
          mobileDescription: 'erc7572.sim.readMetadataWalkthrough.step.update.mobile',
          highlightNodes: ['erc7572-contract', 'event-contractURIUpdated', 'indexer'],
          highlightEdges: ['e-contract-event', 'e-event-indexer'],
          valueChanges: { 'event-contractURIUpdated.lastEvent': 'ContractURIUpdated()' },
          durationMs: 900,
        },
      ],
    },
  ],
};
