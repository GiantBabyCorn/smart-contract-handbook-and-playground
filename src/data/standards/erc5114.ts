import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5114',
  name: 'ERC-5114',
  shortDescription: 'erc5114.short',
  category: 'nft',
  entryType: 'standard',
  eipNumber: 5114,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5114',
  relatedSlugs: ['erc721', 'erc165', 'erc1155', 'erc6551'],
  sortOrder: 15114,
  eipStatus: 'Last Call',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  relations: [
    { slug: 'erc721', kind: 'usedWith' },
    { slug: 'erc165', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-5114 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5114', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5114.introduction',
  designPurpose: 'erc5114.designPurpose',
  commonUsage: 'erc5114.commonUsage',

  functions: [
    {
      name: 'ownerOf',
      signature: 'ownerOf(uint256 badgeId) → (address nftAddress, uint256 nftTokenId)',
      type: 'read',
      params: [{ name: 'badgeId', type: 'uint256', description: 'erc5114.fn.ownerOf.params.badgeId' }],
      returns: [
        { name: 'nftAddress', type: 'address', description: 'erc5114.fn.ownerOf.returns.nftAddress' },
        { name: 'nftTokenId', type: 'uint256', description: 'erc5114.fn.ownerOf.returns.nftTokenId' },
      ],
      description: 'erc5114.fn.ownerOf.desc',
      defaultSimValues: { badgeId: '1' },
    },
    {
      name: 'collectionUri',
      signature: 'collectionUri() → string collectionUri',
      type: 'read',
      params: [],
      returns: [
        { name: 'collectionUri', type: 'string', description: 'erc5114.fn.collectionUri.returns.collectionUri' },
      ],
      description: 'erc5114.fn.collectionUri.desc',
    },
    {
      name: 'badgeUri',
      signature: 'badgeUri(uint256 badgeId) → string badgeUri',
      type: 'read',
      params: [{ name: 'badgeId', type: 'uint256', description: 'erc5114.fn.badgeUri.params.badgeId' }],
      returns: [{ name: 'badgeUri', type: 'string', description: 'erc5114.fn.badgeUri.returns.badgeUri' }],
      description: 'erc5114.fn.badgeUri.desc',
      defaultSimValues: { badgeId: '1' },
    },
    {
      name: 'metadataFormat',
      signature: 'metadataFormat() → string format',
      type: 'read',
      params: [],
      returns: [{ name: 'format', type: 'string', description: 'erc5114.fn.metadataFormat.returns.format' }],
      description: 'erc5114.fn.metadataFormat.desc',
    },
    {
      name: 'Mint',
      signature: 'Mint(uint256 indexed badgeId, address indexed nftAddress, uint256 indexed nftTokenId)',
      type: 'event',
      params: [
        { name: 'badgeId', type: 'uint256', description: 'erc5114.fn.Mint.params.badgeId' },
        { name: 'nftAddress', type: 'address', description: 'erc5114.fn.Mint.params.nftAddress' },
        { name: 'nftTokenId', type: 'uint256', description: 'erc5114.fn.Mint.params.nftTokenId' },
      ],
      description: 'erc5114.fn.Mint.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'minter',
      type: 'user',
      label: 'erc5114.node.minter',
      data: { address: '0xMinter' },
      layoutHint: 'source',
    },
    {
      id: 'erc5114-contract',
      type: 'contract',
      label: 'erc5114.node.contract',
      data: { functions: ['ownerOf', 'collectionUri', 'badgeUri', 'metadataFormat'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-ownerOf',
      type: 'function',
      label: 'ownerOf()',
      data: { fnType: 'read', signature: 'ownerOf(uint256 badgeId) → (address nftAddress, uint256 nftTokenId)' },
    },
    {
      id: 'storage-binding',
      type: 'storage',
      label: 'erc5114.node.storageBinding',
      data: { slots: [{ key: '_ownerOf', label: 'mapping(uint256 => (address, uint256))' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-mint',
      type: 'function',
      label: 'Mint event',
      data: { fnType: 'event', signature: 'Mint(uint256 indexed badgeId, address indexed nftAddress, uint256 indexed nftTokenId)' },
    },
    {
      id: 'soul',
      type: 'user',
      label: 'erc5114.node.soul',
      data: { address: '0xSoulNFT' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    { id: 'e-minter-contract', source: 'minter', target: 'erc5114-contract', type: 'animated', label: 'erc5114.edge.mint' },
    { id: 'e-contract-storage', source: 'erc5114-contract', target: 'storage-binding', type: 'labeled', label: 'erc5114.edge.storeBinding' },
    { id: 'e-contract-soul', source: 'erc5114-contract', target: 'soul', type: 'labeled', label: 'erc5114.edge.bindSoul' },
    { id: 'e-contract-event', source: 'erc5114-contract', target: 'event-mint', type: 'labeled', label: 'erc5114.edge.emitMint' },
    { id: 'e-minter-ownerOf', source: 'minter', target: 'fn-ownerOf', type: 'animated', label: 'erc5114.edge.queryOwner' },
    { id: 'e-ownerOf-contract', source: 'fn-ownerOf', target: 'erc5114-contract', type: 'animated' },
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
      id: 'mint-badge-walkthrough',
      name: 'erc5114.sim.mintBadgeWalkthrough.name',
      description: 'erc5114.sim.mintBadgeWalkthrough.desc',
      params: [
        {
          id: 'badgeId',
          label: 'erc5114.sim.mintBadgeWalkthrough.param.badgeId',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'nftAddress',
          label: 'erc5114.sim.mintBadgeWalkthrough.param.nftAddress',
          type: 'address',
          defaultValue: '0xSoulNFT',
        },
        {
          id: 'nftTokenId',
          label: 'erc5114.sim.mintBadgeWalkthrough.param.nftTokenId',
          type: 'uint256',
          defaultValue: '42',
        },
      ],
      steps: [
        {
          id: 'step-mint',
          description: 'erc5114.sim.mintBadgeWalkthrough.step.mint',
          mobileDescription: 'erc5114.sim.mintBadgeWalkthrough.step.mint.mobile',
          highlightNodes: ['minter', 'erc5114-contract'],
          highlightEdges: ['e-minter-contract'],
          durationMs: 1000,
        },
        {
          id: 'step-bind',
          description: 'erc5114.sim.mintBadgeWalkthrough.step.bind',
          mobileDescription: 'erc5114.sim.mintBadgeWalkthrough.step.bind.mobile',
          highlightNodes: ['erc5114-contract', 'storage-binding', 'soul'],
          highlightEdges: ['e-contract-storage', 'e-contract-soul'],
          valueChanges: { 'storage-binding._ownerOf[1]': 'unset → (0xSoulNFT, 42)' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc5114.sim.mintBadgeWalkthrough.step.event',
          mobileDescription: 'erc5114.sim.mintBadgeWalkthrough.step.event.mobile',
          highlightNodes: ['erc5114-contract', 'event-mint'],
          highlightEdges: ['e-contract-event'],
          valueChanges: { 'event-mint.lastEvent': 'Mint(1, 0xSoulNFT, 42)' },
          durationMs: 900,
        },
        {
          id: 'step-query',
          description: 'erc5114.sim.mintBadgeWalkthrough.step.query',
          mobileDescription: 'erc5114.sim.mintBadgeWalkthrough.step.query.mobile',
          highlightNodes: ['minter', 'fn-ownerOf', 'erc5114-contract'],
          highlightEdges: ['e-minter-ownerOf', 'e-ownerOf-contract'],
          valueChanges: { 'fn-ownerOf.output': '(0xSoulNFT, 42)' },
          durationMs: 900,
        },
      ],
    },
  ],
};
