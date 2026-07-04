import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc4400',
  name: 'ERC-4400',
  shortDescription: 'erc4400.short',
  category: 'nft',
  entryType: 'standard',
  eipNumber: 4400,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-4400',
  relatedSlugs: ['erc721', 'erc165', 'erc2981'],
  sortOrder: 14400,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [165, 721],
  relations: [
    { slug: 'erc721', kind: 'extends' },
    { slug: 'erc165', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-4400 Specification', url: 'https://eips.ethereum.org/EIPS/eip-4400', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc4400.introduction',
  designPurpose: 'erc4400.designPurpose',
  commonUsage: 'erc4400.commonUsage',

  functions: [
    {
      name: 'consumerOf',
      signature: 'consumerOf(uint256 _tokenId) → address',
      type: 'read',
      params: [{ name: '_tokenId', type: 'uint256', description: 'erc4400.fn.consumerOf.params.tokenId' }],
      returns: [{ name: 'consumer', type: 'address', description: 'erc4400.fn.consumerOf.returns.consumer' }],
      description: 'erc4400.fn.consumerOf.desc',
      defaultSimValues: { _tokenId: '1' },
    },
    {
      name: 'changeConsumer',
      signature: 'changeConsumer(address _consumer, uint256 _tokenId)',
      type: 'write',
      params: [
        { name: '_consumer', type: 'address', description: 'erc4400.fn.changeConsumer.params.consumer' },
        { name: '_tokenId', type: 'uint256', description: 'erc4400.fn.changeConsumer.params.tokenId' },
      ],
      description: 'erc4400.fn.changeConsumer.desc',
      defaultSimValues: { _consumer: '0xConsumer', _tokenId: '1' },
    },
    {
      name: 'ConsumerChanged',
      signature: 'ConsumerChanged(address indexed owner, address indexed consumer, uint256 indexed tokenId)',
      type: 'event',
      params: [
        { name: 'owner', type: 'address', description: 'erc4400.fn.ConsumerChanged.params.owner' },
        { name: 'consumer', type: 'address', description: 'erc4400.fn.ConsumerChanged.params.consumer' },
        { name: 'tokenId', type: 'uint256', description: 'erc4400.fn.ConsumerChanged.params.tokenId' },
      ],
      description: 'erc4400.fn.ConsumerChanged.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc4400.node.user',
      data: { address: '0xOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc4400-contract',
      type: 'contract',
      label: 'erc4400.node.contract',
      data: { functions: ['consumerOf', 'changeConsumer'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-changeConsumer',
      type: 'function',
      label: 'changeConsumer()',
      data: { fnType: 'write', signature: 'changeConsumer(address _consumer, uint256 _tokenId)' },
    },
    {
      id: 'storage-consumers',
      type: 'storage',
      label: 'erc4400.node.storageConsumers',
      data: { slots: [{ key: '_consumers', label: 'mapping(uint256 => address)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-consumerChanged',
      type: 'function',
      label: 'ConsumerChanged event',
      data: {
        fnType: 'event',
        signature: 'ConsumerChanged(address indexed owner, address indexed consumer, uint256 indexed tokenId)',
      },
    },
    {
      id: 'consumer',
      type: 'user',
      label: 'erc4400.node.consumer',
      data: { address: '0xConsumer' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-changeConsumer',
      source: 'user',
      target: 'fn-changeConsumer',
      type: 'animated',
      label: 'erc4400.edge.callChangeConsumer',
    },
    {
      id: 'e-changeConsumer-contract',
      source: 'fn-changeConsumer',
      target: 'erc4400-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc4400-contract',
      target: 'storage-consumers',
      type: 'labeled',
      label: 'erc4400.edge.updateConsumers',
    },
    {
      id: 'e-contract-event',
      source: 'erc4400-contract',
      target: 'event-consumerChanged',
      type: 'labeled',
      label: 'erc4400.edge.emitConsumerChanged',
    },
    {
      id: 'e-contract-consumer',
      source: 'erc4400-contract',
      target: 'consumer',
      type: 'labeled',
      label: 'erc4400.edge.grantConsumer',
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
      id: 'change-consumer-walkthrough',
      name: 'erc4400.sim.changeConsumerWalkthrough.name',
      description: 'erc4400.sim.changeConsumerWalkthrough.desc',
      params: [
        {
          id: 'consumer',
          label: 'erc4400.sim.changeConsumerWalkthrough.param.consumer',
          type: 'address',
          defaultValue: '0xConsumer',
        },
        {
          id: 'tokenId',
          label: 'erc4400.sim.changeConsumerWalkthrough.param.tokenId',
          type: 'uint256',
          defaultValue: '1',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc4400.sim.changeConsumerWalkthrough.step.call',
          mobileDescription: 'erc4400.sim.changeConsumerWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-changeConsumer'],
          highlightEdges: ['e-user-changeConsumer'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc4400.sim.changeConsumerWalkthrough.step.execute',
          mobileDescription: 'erc4400.sim.changeConsumerWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-changeConsumer', 'erc4400-contract', 'storage-consumers'],
          highlightEdges: ['e-changeConsumer-contract', 'e-contract-storage'],
          valueChanges: { 'storage-consumers._consumers[1]': '0x0 → 0xConsumer' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc4400.sim.changeConsumerWalkthrough.step.event',
          mobileDescription: 'erc4400.sim.changeConsumerWalkthrough.step.event.mobile',
          highlightNodes: ['erc4400-contract', 'event-consumerChanged'],
          highlightEdges: ['e-contract-event'],
          durationMs: 800,
        },
        {
          id: 'step-grant',
          description: 'erc4400.sim.changeConsumerWalkthrough.step.grant',
          mobileDescription: 'erc4400.sim.changeConsumerWalkthrough.step.grant.mobile',
          highlightNodes: ['erc4400-contract', 'consumer'],
          highlightEdges: ['e-contract-consumer'],
          durationMs: 900,
        },
      ],
    },
  ],
};
