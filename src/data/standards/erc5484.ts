import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5484',
  name: 'ERC-5484',
  shortDescription: 'erc5484.short',
  category: 'nft',
  entryType: 'standard',
  eipNumber: 5484,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5484',
  relatedSlugs: ['erc721', 'erc165', 'erc1155'],
  sortOrder: 15484,
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
    { label: 'ERC-5484 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5484', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5484.introduction',
  designPurpose: 'erc5484.designPurpose',
  commonUsage: 'erc5484.commonUsage',

  functions: [
    {
      name: 'burnAuth',
      signature: 'burnAuth(uint256 tokenId) → BurnAuth',
      type: 'read',
      params: [{ name: 'tokenId', type: 'uint256', description: 'erc5484.fn.burnAuth.params.tokenId' }],
      returns: [{ name: 'burnAuth', type: 'BurnAuth', description: 'erc5484.fn.burnAuth.returns.burnAuth' }],
      description: 'erc5484.fn.burnAuth.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'Issued',
      signature: 'Issued(address indexed from, address indexed to, uint256 indexed tokenId, BurnAuth burnAuth)',
      type: 'event',
      params: [
        { name: 'from', type: 'address', description: 'erc5484.fn.Issued.params.from' },
        { name: 'to', type: 'address', description: 'erc5484.fn.Issued.params.to' },
        { name: 'tokenId', type: 'uint256', description: 'erc5484.fn.Issued.params.tokenId' },
        { name: 'burnAuth', type: 'BurnAuth', description: 'erc5484.fn.Issued.params.burnAuth' },
      ],
      description: 'erc5484.fn.Issued.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'issuer',
      type: 'user',
      label: 'erc5484.node.issuer',
      data: { address: '0xIssuer' },
      layoutHint: 'source',
    },
    {
      id: 'erc5484-contract',
      type: 'contract',
      label: 'erc5484.node.contract',
      data: { functions: ['burnAuth'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-burnAuth',
      type: 'function',
      label: 'burnAuth()',
      data: { fnType: 'read', signature: 'burnAuth(uint256 tokenId) → BurnAuth' },
    },
    {
      id: 'storage-burnAuth',
      type: 'storage',
      label: 'erc5484.node.storageBurnAuth',
      data: { slots: [{ key: '_burnAuth', label: 'mapping(uint256 => BurnAuth)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-issued',
      type: 'function',
      label: 'Issued event',
      data: { fnType: 'event', signature: 'Issued(address indexed from, address indexed to, uint256 indexed tokenId, BurnAuth burnAuth)' },
    },
    {
      id: 'receiver',
      type: 'user',
      label: 'erc5484.node.receiver',
      data: { address: '0xReceiver' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    { id: 'e-issuer-contract', source: 'issuer', target: 'erc5484-contract', type: 'animated', label: 'erc5484.edge.issue' },
    { id: 'e-contract-storage', source: 'erc5484-contract', target: 'storage-burnAuth', type: 'labeled', label: 'erc5484.edge.storeBurnAuth' },
    { id: 'e-contract-receiver', source: 'erc5484-contract', target: 'receiver', type: 'labeled', label: 'erc5484.edge.mintToken' },
    { id: 'e-contract-event', source: 'erc5484-contract', target: 'event-issued', type: 'labeled', label: 'erc5484.edge.emitIssued' },
    { id: 'e-receiver-burnAuth', source: 'receiver', target: 'fn-burnAuth', type: 'animated', label: 'erc5484.edge.queryBurnAuth' },
    { id: 'e-burnAuth-contract', source: 'fn-burnAuth', target: 'erc5484-contract', type: 'animated' },
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
      id: 'issue-token-walkthrough',
      name: 'erc5484.sim.issueTokenWalkthrough.name',
      description: 'erc5484.sim.issueTokenWalkthrough.desc',
      params: [
        {
          id: 'to',
          label: 'erc5484.sim.issueTokenWalkthrough.param.to',
          type: 'address',
          defaultValue: '0xReceiver',
        },
        {
          id: 'tokenId',
          label: 'erc5484.sim.issueTokenWalkthrough.param.tokenId',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'burnAuth',
          label: 'erc5484.sim.issueTokenWalkthrough.param.burnAuth',
          type: 'select',
          options: [
            { label: 'IssuerOnly', value: 'IssuerOnly' },
            { label: 'OwnerOnly', value: 'OwnerOnly' },
            { label: 'Both', value: 'Both' },
            { label: 'Neither', value: 'Neither' },
          ],
          defaultValue: 'Both',
        },
      ],
      steps: [
        {
          id: 'step-issue',
          description: 'erc5484.sim.issueTokenWalkthrough.step.issue',
          mobileDescription: 'erc5484.sim.issueTokenWalkthrough.step.issue.mobile',
          highlightNodes: ['issuer', 'erc5484-contract'],
          highlightEdges: ['e-issuer-contract'],
          durationMs: 1000,
        },
        {
          id: 'step-store',
          description: 'erc5484.sim.issueTokenWalkthrough.step.store',
          mobileDescription: 'erc5484.sim.issueTokenWalkthrough.step.store.mobile',
          highlightNodes: ['erc5484-contract', 'storage-burnAuth', 'receiver'],
          highlightEdges: ['e-contract-storage', 'e-contract-receiver'],
          valueChanges: { 'storage-burnAuth._burnAuth[1]': 'unset → Both' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc5484.sim.issueTokenWalkthrough.step.event',
          mobileDescription: 'erc5484.sim.issueTokenWalkthrough.step.event.mobile',
          highlightNodes: ['erc5484-contract', 'event-issued'],
          highlightEdges: ['e-contract-event'],
          valueChanges: { 'event-issued.lastEvent': 'Issued(0xIssuer, 0xReceiver, 1, Both)' },
          durationMs: 900,
        },
        {
          id: 'step-query',
          description: 'erc5484.sim.issueTokenWalkthrough.step.query',
          mobileDescription: 'erc5484.sim.issueTokenWalkthrough.step.query.mobile',
          highlightNodes: ['receiver', 'fn-burnAuth', 'erc5484-contract'],
          highlightEdges: ['e-receiver-burnAuth', 'e-burnAuth-contract'],
          valueChanges: { 'fn-burnAuth.output': 'Both' },
          durationMs: 900,
        },
      ],
    },
  ],
};
