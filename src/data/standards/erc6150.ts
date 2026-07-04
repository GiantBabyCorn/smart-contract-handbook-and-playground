import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc6150',
  name: 'ERC-6150',
  shortDescription: 'erc6150.short',
  category: 'nft',
  entryType: 'standard',
  eipNumber: 6150,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-6150',
  relatedSlugs: ['erc721', 'erc165', 'erc1155', 'erc3525'],
  sortOrder: 16150,
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
    { label: 'ERC-6150 Specification', url: 'https://eips.ethereum.org/EIPS/eip-6150', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc6150.introduction',
  designPurpose: 'erc6150.designPurpose',
  commonUsage: 'erc6150.commonUsage',

  functions: [
    {
      name: 'parentOf',
      signature: 'parentOf(uint256 tokenId) → uint256 parentId',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc6150.fn.parentOf.params.tokenId' },
      ],
      returns: [
        { name: 'parentId', type: 'uint256', description: 'erc6150.fn.parentOf.returns.parentId' },
      ],
      description: 'erc6150.fn.parentOf.desc',
      defaultSimValues: { tokenId: '2' },
    },
    {
      name: 'childrenOf',
      signature: 'childrenOf(uint256 tokenId) → uint256[] childrenIds',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc6150.fn.childrenOf.params.tokenId' },
      ],
      returns: [
        { name: 'childrenIds', type: 'uint256[]', description: 'erc6150.fn.childrenOf.returns.childrenIds' },
      ],
      description: 'erc6150.fn.childrenOf.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'isRoot',
      signature: 'isRoot(uint256 tokenId) → bool',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc6150.fn.isRoot.params.tokenId' },
      ],
      returns: [
        { name: 'root', type: 'bool', description: 'erc6150.fn.isRoot.returns.root' },
      ],
      description: 'erc6150.fn.isRoot.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'isLeaf',
      signature: 'isLeaf(uint256 tokenId) → bool',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc6150.fn.isLeaf.params.tokenId' },
      ],
      returns: [
        { name: 'leaf', type: 'bool', description: 'erc6150.fn.isLeaf.returns.leaf' },
      ],
      description: 'erc6150.fn.isLeaf.desc',
      defaultSimValues: { tokenId: '2' },
    },
    {
      name: 'Minted',
      signature: 'Minted(address indexed minter, address indexed to, uint256 parentId, uint256 tokenId)',
      type: 'event',
      params: [
        { name: 'minter', type: 'address', description: 'erc6150.fn.Minted.params.minter' },
        { name: 'to', type: 'address', description: 'erc6150.fn.Minted.params.to' },
        { name: 'parentId', type: 'uint256', description: 'erc6150.fn.Minted.params.parentId' },
        { name: 'tokenId', type: 'uint256', description: 'erc6150.fn.Minted.params.tokenId' },
      ],
      description: 'erc6150.fn.Minted.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc6150.node.user',
      data: { address: '0xParentOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc6150-contract',
      type: 'contract',
      label: 'erc6150.node.contract',
      data: { functions: ['parentOf', 'childrenOf', 'isRoot', 'isLeaf'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-parentOf',
      type: 'function',
      label: 'parentOf()',
      data: { fnType: 'read', signature: 'parentOf(uint256 tokenId) → uint256 parentId' },
    },
    {
      id: 'fn-childrenOf',
      type: 'function',
      label: 'childrenOf()',
      data: { fnType: 'read', signature: 'childrenOf(uint256 tokenId) → uint256[] childrenIds' },
    },
    {
      id: 'storage-hierarchy',
      type: 'storage',
      label: 'erc6150.node.storageHierarchy',
      data: {
        slots: [
          { key: '_parentOf', label: 'mapping(uint256 => uint256)' },
          { key: '_childrenOf', label: 'mapping(uint256 => uint256[])' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-minted',
      type: 'function',
      label: 'Minted event',
      data: {
        fnType: 'event',
        signature: 'Minted(address indexed minter, address indexed to, uint256 parentId, uint256 tokenId)',
      },
    },
    {
      id: 'recipient',
      type: 'user',
      label: 'erc6150.node.recipient',
      data: { address: '0xChildOwner' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-mint',
      source: 'user',
      target: 'erc6150-contract',
      type: 'animated',
      label: 'erc6150.edge.mintChild',
    },
    {
      id: 'e-contract-hierarchy',
      source: 'erc6150-contract',
      target: 'storage-hierarchy',
      type: 'labeled',
      label: 'erc6150.edge.updateHierarchy',
    },
    {
      id: 'e-contract-event',
      source: 'erc6150-contract',
      target: 'event-minted',
      type: 'labeled',
      label: 'erc6150.edge.emitMinted',
    },
    {
      id: 'e-contract-recipient',
      source: 'erc6150-contract',
      target: 'recipient',
      type: 'labeled',
      label: 'erc6150.edge.assignChild',
    },
    {
      id: 'e-user-parentOf',
      source: 'user',
      target: 'fn-parentOf',
      type: 'animated',
      label: 'erc6150.edge.callParentOf',
    },
    {
      id: 'e-parentOf-contract',
      source: 'fn-parentOf',
      target: 'erc6150-contract',
      type: 'animated',
    },
    {
      id: 'e-user-childrenOf',
      source: 'user',
      target: 'fn-childrenOf',
      type: 'animated',
      label: 'erc6150.edge.callChildrenOf',
    },
    {
      id: 'e-childrenOf-contract',
      source: 'fn-childrenOf',
      target: 'erc6150-contract',
      type: 'animated',
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
      id: 'mint-child-walkthrough',
      name: 'erc6150.sim.mintChild.name',
      description: 'erc6150.sim.mintChild.desc',
      params: [
        {
          id: 'parentId',
          label: 'erc6150.sim.mintChild.param.parentId',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'tokenId',
          label: 'erc6150.sim.mintChild.param.tokenId',
          type: 'uint256',
          defaultValue: '2',
        },
        {
          id: 'to',
          label: 'erc6150.sim.mintChild.param.to',
          type: 'address',
          defaultValue: '0xChildOwner',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc6150.sim.mintChild.step.call',
          mobileDescription: 'erc6150.sim.mintChild.step.call.mobile',
          highlightNodes: ['user', 'erc6150-contract'],
          highlightEdges: ['e-user-mint'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc6150.sim.mintChild.step.execute',
          mobileDescription: 'erc6150.sim.mintChild.step.execute.mobile',
          highlightNodes: ['erc6150-contract', 'storage-hierarchy'],
          highlightEdges: ['e-contract-hierarchy'],
          valueChanges: {
            'storage-hierarchy._parentOf[2]': '0 → 1',
            'storage-hierarchy._childrenOf[1]': '[] → [2]',
          },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc6150.sim.mintChild.step.event',
          mobileDescription: 'erc6150.sim.mintChild.step.event.mobile',
          highlightNodes: ['erc6150-contract', 'event-minted', 'recipient'],
          highlightEdges: ['e-contract-event', 'e-contract-recipient'],
          durationMs: 800,
        },
      ],
    },
  ],
};
