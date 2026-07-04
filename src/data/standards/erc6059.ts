import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc6059',
  name: 'ERC-6059',
  shortDescription: 'erc6059.short',
  category: 'nft',
  entryType: 'standard',
  eipNumber: 6059,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-6059',
  relatedSlugs: ['erc721', 'erc165', 'erc6551', 'erc1155'],
  sortOrder: 16059,
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
    { label: 'ERC-6059 Specification', url: 'https://eips.ethereum.org/EIPS/eip-6059', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc6059.introduction',
  designPurpose: 'erc6059.designPurpose',
  commonUsage: 'erc6059.commonUsage',

  functions: [
    {
      name: 'ownerOf',
      signature: 'ownerOf(uint256 tokenId) → address owner',
      type: 'read',
      params: [{ name: 'tokenId', type: 'uint256', description: 'erc6059.fn.ownerOf.params.tokenId' }],
      returns: [{ name: 'owner', type: 'address', description: 'erc6059.fn.ownerOf.returns.owner' }],
      description: 'erc6059.fn.ownerOf.desc',
      defaultSimValues: { tokenId: '42' },
    },
    {
      name: 'directOwnerOf',
      signature: 'directOwnerOf(uint256 tokenId) → (address owner, uint256 parentId, bool isNft)',
      type: 'read',
      params: [{ name: 'tokenId', type: 'uint256', description: 'erc6059.fn.directOwnerOf.params.tokenId' }],
      returns: [
        { name: 'owner', type: 'address', description: 'erc6059.fn.directOwnerOf.returns.owner' },
        { name: 'parentId', type: 'uint256', description: 'erc6059.fn.directOwnerOf.returns.parentId' },
        { name: 'isNft', type: 'bool', description: 'erc6059.fn.directOwnerOf.returns.isNft' },
      ],
      description: 'erc6059.fn.directOwnerOf.desc',
      defaultSimValues: { tokenId: '42' },
    },
    {
      name: 'burn',
      signature: 'burn(uint256 tokenId, uint256 maxRecursiveBurns) → uint256',
      type: 'write',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc6059.fn.burn.params.tokenId' },
        { name: 'maxRecursiveBurns', type: 'uint256', description: 'erc6059.fn.burn.params.maxRecursiveBurns' },
      ],
      returns: [{ name: 'burnedChildren', type: 'uint256', description: 'erc6059.fn.burn.returns.burnedChildren' }],
      description: 'erc6059.fn.burn.desc',
      defaultSimValues: { tokenId: '42', maxRecursiveBurns: '10' },
    },
    {
      name: 'addChild',
      signature: 'addChild(uint256 parentId, uint256 childId)',
      type: 'write',
      params: [
        { name: 'parentId', type: 'uint256', description: 'erc6059.fn.addChild.params.parentId' },
        { name: 'childId', type: 'uint256', description: 'erc6059.fn.addChild.params.childId' },
      ],
      description: 'erc6059.fn.addChild.desc',
      defaultSimValues: { parentId: '1', childId: '42' },
    },
    {
      name: 'acceptChild',
      signature: 'acceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId)',
      type: 'write',
      params: [
        { name: 'parentId', type: 'uint256', description: 'erc6059.fn.acceptChild.params.parentId' },
        { name: 'childIndex', type: 'uint256', description: 'erc6059.fn.acceptChild.params.childIndex' },
        { name: 'childAddress', type: 'address', description: 'erc6059.fn.acceptChild.params.childAddress' },
        { name: 'childId', type: 'uint256', description: 'erc6059.fn.acceptChild.params.childId' },
      ],
      description: 'erc6059.fn.acceptChild.desc',
      defaultSimValues: { parentId: '1', childIndex: '0', childAddress: '0xChildCollection', childId: '42' },
    },
    {
      name: 'rejectAllChildren',
      signature: 'rejectAllChildren(uint256 parentId, uint256 maxRejections)',
      type: 'write',
      params: [
        { name: 'parentId', type: 'uint256', description: 'erc6059.fn.rejectAllChildren.params.parentId' },
        { name: 'maxRejections', type: 'uint256', description: 'erc6059.fn.rejectAllChildren.params.maxRejections' },
      ],
      description: 'erc6059.fn.rejectAllChildren.desc',
      defaultSimValues: { parentId: '1', maxRejections: '128' },
    },
    {
      name: 'transferChild',
      signature:
        'transferChild(uint256 tokenId, address to, uint256 destinationId, uint256 childIndex, address childAddress, uint256 childId, bool isPending, bytes data)',
      type: 'write',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc6059.fn.transferChild.params.tokenId' },
        { name: 'to', type: 'address', description: 'erc6059.fn.transferChild.params.to' },
        { name: 'destinationId', type: 'uint256', description: 'erc6059.fn.transferChild.params.destinationId' },
        { name: 'childIndex', type: 'uint256', description: 'erc6059.fn.transferChild.params.childIndex' },
        { name: 'childAddress', type: 'address', description: 'erc6059.fn.transferChild.params.childAddress' },
        { name: 'childId', type: 'uint256', description: 'erc6059.fn.transferChild.params.childId' },
        { name: 'isPending', type: 'bool', description: 'erc6059.fn.transferChild.params.isPending' },
        { name: 'data', type: 'bytes', description: 'erc6059.fn.transferChild.params.data' },
      ],
      description: 'erc6059.fn.transferChild.desc',
      defaultSimValues: {
        tokenId: '1',
        to: '0xRecipient',
        destinationId: '0',
        childIndex: '0',
        childAddress: '0xChildCollection',
        childId: '42',
        isPending: 'false',
        data: '0x',
      },
    },
    {
      name: 'nestTransferFrom',
      signature: 'nestTransferFrom(address from, address to, uint256 tokenId, uint256 destinationId)',
      type: 'write',
      params: [
        { name: 'from', type: 'address', description: 'erc6059.fn.nestTransferFrom.params.from' },
        { name: 'to', type: 'address', description: 'erc6059.fn.nestTransferFrom.params.to' },
        { name: 'tokenId', type: 'uint256', description: 'erc6059.fn.nestTransferFrom.params.tokenId' },
        { name: 'destinationId', type: 'uint256', description: 'erc6059.fn.nestTransferFrom.params.destinationId' },
      ],
      description: 'erc6059.fn.nestTransferFrom.desc',
      defaultSimValues: { from: '0xOwner', to: '0xParentCollection', tokenId: '42', destinationId: '1' },
    },
    {
      name: 'NestTransfer',
      signature:
        'NestTransfer(address indexed from, address indexed to, uint256 fromTokenId, uint256 toTokenId, uint256 indexed tokenId)',
      type: 'event',
      params: [
        { name: 'from', type: 'address', description: 'erc6059.fn.NestTransfer.params.from' },
        { name: 'to', type: 'address', description: 'erc6059.fn.NestTransfer.params.to' },
        { name: 'fromTokenId', type: 'uint256', description: 'erc6059.fn.NestTransfer.params.fromTokenId' },
        { name: 'toTokenId', type: 'uint256', description: 'erc6059.fn.NestTransfer.params.toTokenId' },
        { name: 'tokenId', type: 'uint256', description: 'erc6059.fn.NestTransfer.params.tokenId' },
      ],
      description: 'erc6059.fn.NestTransfer.desc',
    },
    {
      name: 'ChildProposed',
      signature:
        'ChildProposed(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)',
      type: 'event',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc6059.fn.ChildProposed.params.tokenId' },
        { name: 'childIndex', type: 'uint256', description: 'erc6059.fn.ChildProposed.params.childIndex' },
        { name: 'childAddress', type: 'address', description: 'erc6059.fn.ChildProposed.params.childAddress' },
        { name: 'childId', type: 'uint256', description: 'erc6059.fn.ChildProposed.params.childId' },
      ],
      description: 'erc6059.fn.ChildProposed.desc',
    },
    {
      name: 'ChildAccepted',
      signature:
        'ChildAccepted(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)',
      type: 'event',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc6059.fn.ChildAccepted.params.tokenId' },
        { name: 'childIndex', type: 'uint256', description: 'erc6059.fn.ChildAccepted.params.childIndex' },
        { name: 'childAddress', type: 'address', description: 'erc6059.fn.ChildAccepted.params.childAddress' },
        { name: 'childId', type: 'uint256', description: 'erc6059.fn.ChildAccepted.params.childId' },
      ],
      description: 'erc6059.fn.ChildAccepted.desc',
    },
    {
      name: 'AllChildrenRejected',
      signature: 'AllChildrenRejected(uint256 indexed tokenId)',
      type: 'event',
      params: [{ name: 'tokenId', type: 'uint256', description: 'erc6059.fn.AllChildrenRejected.params.tokenId' }],
      description: 'erc6059.fn.AllChildrenRejected.desc',
    },
    {
      name: 'ChildTransferred',
      signature:
        'ChildTransferred(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId, bool fromPending)',
      type: 'event',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc6059.fn.ChildTransferred.params.tokenId' },
        { name: 'childIndex', type: 'uint256', description: 'erc6059.fn.ChildTransferred.params.childIndex' },
        { name: 'childAddress', type: 'address', description: 'erc6059.fn.ChildTransferred.params.childAddress' },
        { name: 'childId', type: 'uint256', description: 'erc6059.fn.ChildTransferred.params.childId' },
        { name: 'fromPending', type: 'bool', description: 'erc6059.fn.ChildTransferred.params.fromPending' },
      ],
      description: 'erc6059.fn.ChildTransferred.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc6059.node.user',
      data: { address: '0xRootOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc6059-contract',
      type: 'contract',
      label: 'erc6059.node.contract',
      data: {
        functions: [
          'nestTransferFrom',
          'addChild',
          'acceptChild',
          'rejectAllChildren',
          'transferChild',
          'ownerOf',
          'directOwnerOf',
          'burn',
        ],
      },
      layoutHint: 'center',
    },
    {
      id: 'fn-nestTransferFrom',
      type: 'function',
      label: 'nestTransferFrom()',
      data: {
        fnType: 'write',
        signature: 'nestTransferFrom(address from, address to, uint256 tokenId, uint256 destinationId)',
      },
    },
    {
      id: 'fn-acceptChild',
      type: 'function',
      label: 'acceptChild()',
      data: {
        fnType: 'write',
        signature: 'acceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId)',
      },
    },
    {
      id: 'storage-children',
      type: 'storage',
      label: 'erc6059.node.storageChildren',
      data: {
        slots: [
          { key: 'pendingChildren', label: 'Child[] (max 128)' },
          { key: 'activeChildren', label: 'Child[]' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-childProposed',
      type: 'function',
      label: 'ChildProposed event',
      data: {
        fnType: 'event',
        signature:
          'ChildProposed(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)',
      },
    },
    {
      id: 'event-childAccepted',
      type: 'function',
      label: 'ChildAccepted event',
      data: {
        fnType: 'event',
        signature:
          'ChildAccepted(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)',
      },
    },
  ],

  flowEdges: [
    {
      id: 'e-user-nestTransfer',
      source: 'user',
      target: 'fn-nestTransferFrom',
      type: 'animated',
      label: 'erc6059.edge.callNestTransfer',
    },
    { id: 'e-nestTransfer-contract', source: 'fn-nestTransferFrom', target: 'erc6059-contract', type: 'animated' },
    {
      id: 'e-user-acceptChild',
      source: 'user',
      target: 'fn-acceptChild',
      type: 'animated',
      label: 'erc6059.edge.callAcceptChild',
    },
    { id: 'e-acceptChild-contract', source: 'fn-acceptChild', target: 'erc6059-contract', type: 'animated' },
    {
      id: 'e-contract-storage',
      source: 'erc6059-contract',
      target: 'storage-children',
      type: 'labeled',
      label: 'erc6059.edge.updateChildren',
    },
    {
      id: 'e-contract-proposed',
      source: 'erc6059-contract',
      target: 'event-childProposed',
      type: 'labeled',
      label: 'erc6059.edge.emitChildProposed',
    },
    {
      id: 'e-contract-accepted',
      source: 'erc6059-contract',
      target: 'event-childAccepted',
      type: 'labeled',
      label: 'erc6059.edge.emitChildAccepted',
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
      id: 'nest-accept-walkthrough',
      name: 'erc6059.sim.nestAcceptWalkthrough.name',
      description: 'erc6059.sim.nestAcceptWalkthrough.desc',
      params: [
        {
          id: 'parentId',
          label: 'erc6059.sim.nestAcceptWalkthrough.param.parentId',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'childId',
          label: 'erc6059.sim.nestAcceptWalkthrough.param.childId',
          type: 'uint256',
          defaultValue: '42',
        },
        {
          id: 'childAddress',
          label: 'erc6059.sim.nestAcceptWalkthrough.param.childAddress',
          type: 'address',
          defaultValue: '0xChildCollection',
        },
      ],
      steps: [
        {
          id: 'step-nest',
          description: 'erc6059.sim.nestAcceptWalkthrough.step.nest',
          mobileDescription: 'erc6059.sim.nestAcceptWalkthrough.step.nest.mobile',
          highlightNodes: ['user', 'fn-nestTransferFrom'],
          highlightEdges: ['e-user-nestTransfer'],
          durationMs: 1000,
        },
        {
          id: 'step-propose',
          description: 'erc6059.sim.nestAcceptWalkthrough.step.propose',
          mobileDescription: 'erc6059.sim.nestAcceptWalkthrough.step.propose.mobile',
          highlightNodes: ['fn-nestTransferFrom', 'erc6059-contract', 'storage-children', 'event-childProposed'],
          highlightEdges: ['e-nestTransfer-contract', 'e-contract-storage', 'e-contract-proposed'],
          valueChanges: { 'storage-children.pendingChildren': '[] → [(0xChildCollection, 42)]' },
          durationMs: 1300,
        },
        {
          id: 'step-accept',
          description: 'erc6059.sim.nestAcceptWalkthrough.step.accept',
          mobileDescription: 'erc6059.sim.nestAcceptWalkthrough.step.accept.mobile',
          highlightNodes: ['user', 'fn-acceptChild'],
          highlightEdges: ['e-user-acceptChild'],
          durationMs: 1000,
        },
        {
          id: 'step-commit',
          description: 'erc6059.sim.nestAcceptWalkthrough.step.commit',
          mobileDescription: 'erc6059.sim.nestAcceptWalkthrough.step.commit.mobile',
          highlightNodes: ['fn-acceptChild', 'erc6059-contract', 'storage-children', 'event-childAccepted'],
          highlightEdges: ['e-acceptChild-contract', 'e-contract-storage', 'e-contract-accepted'],
          valueChanges: {
            'storage-children.pendingChildren': '[(0xChildCollection, 42)] → []',
            'storage-children.activeChildren': '[] → [(0xChildCollection, 42)]',
          },
          durationMs: 1200,
        },
      ],
    },
  ],
};
