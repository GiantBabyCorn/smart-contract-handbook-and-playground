import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5521',
  name: 'ERC-5521',
  shortDescription: 'erc5521.short',
  category: 'nft',
  entryType: 'standard',
  eipNumber: 5521,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5521',
  relatedSlugs: ['erc721', 'erc165', 'erc1155', 'erc2981'],
  sortOrder: 15521,
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
    { label: 'ERC-5521 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5521', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5521.introduction',
  designPurpose: 'erc5521.designPurpose',
  commonUsage: 'erc5521.commonUsage',

  functions: [
    {
      name: 'setNode',
      signature: 'setNode(uint256 tokenId, address[] addresses, uint256[][] tokenIds)',
      type: 'write',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5521.fn.setNode.params.tokenId' },
        { name: 'addresses', type: 'address[]', description: 'erc5521.fn.setNode.params.addresses' },
        { name: 'tokenIds', type: 'uint256[][]', description: 'erc5521.fn.setNode.params.tokenIds' },
      ],
      description: 'erc5521.fn.setNode.desc',
      defaultSimValues: { tokenId: '3', addresses: '[0xThisContract]', tokenIds: '[[1, 2]]' },
    },
    {
      name: 'setNodeReferredExternal',
      signature: 'setNodeReferredExternal(address _address, uint256 tokenId, uint256[] _tokenIds)',
      type: 'write',
      params: [
        { name: '_address', type: 'address', description: 'erc5521.fn.setNodeReferredExternal.params._address' },
        { name: 'tokenId', type: 'uint256', description: 'erc5521.fn.setNodeReferredExternal.params.tokenId' },
        { name: '_tokenIds', type: 'uint256[]', description: 'erc5521.fn.setNodeReferredExternal.params._tokenIds' },
      ],
      description: 'erc5521.fn.setNodeReferredExternal.desc',
      defaultSimValues: { _address: '0xOtherContract', tokenId: '3', _tokenIds: '[1, 2]' },
    },
    {
      name: 'referringOf',
      signature: 'referringOf(address _address, uint256 tokenId) → (address[] addresses, uint256[][] tokenIds)',
      type: 'read',
      params: [
        { name: '_address', type: 'address', description: 'erc5521.fn.referringOf.params._address' },
        { name: 'tokenId', type: 'uint256', description: 'erc5521.fn.referringOf.params.tokenId' },
      ],
      returns: [
        { name: 'addresses', type: 'address[]', description: 'erc5521.fn.referringOf.returns.addresses' },
        { name: 'tokenIds', type: 'uint256[][]', description: 'erc5521.fn.referringOf.returns.tokenIds' },
      ],
      description: 'erc5521.fn.referringOf.desc',
      defaultSimValues: { _address: '0xThisContract', tokenId: '3' },
    },
    {
      name: 'referredOf',
      signature: 'referredOf(address _address, uint256 tokenId) → (address[] addresses, uint256[][] tokenIds)',
      type: 'read',
      params: [
        { name: '_address', type: 'address', description: 'erc5521.fn.referredOf.params._address' },
        { name: 'tokenId', type: 'uint256', description: 'erc5521.fn.referredOf.params.tokenId' },
      ],
      returns: [
        { name: 'addresses', type: 'address[]', description: 'erc5521.fn.referredOf.returns.addresses' },
        { name: 'tokenIds', type: 'uint256[][]', description: 'erc5521.fn.referredOf.returns.tokenIds' },
      ],
      description: 'erc5521.fn.referredOf.desc',
      defaultSimValues: { _address: '0xThisContract', tokenId: '1' },
    },
    {
      name: 'createdTimestampOf',
      signature: 'createdTimestampOf(address _address, uint256 tokenId) → uint256',
      type: 'read',
      params: [
        { name: '_address', type: 'address', description: 'erc5521.fn.createdTimestampOf.params._address' },
        { name: 'tokenId', type: 'uint256', description: 'erc5521.fn.createdTimestampOf.params.tokenId' },
      ],
      returns: [
        { name: 'timestamp', type: 'uint256', description: 'erc5521.fn.createdTimestampOf.returns.timestamp' },
      ],
      description: 'erc5521.fn.createdTimestampOf.desc',
      defaultSimValues: { _address: '0xThisContract', tokenId: '3' },
    },
    {
      name: 'UpdateNode',
      signature: 'UpdateNode(uint256 indexed tokenId, address indexed owner, address[] _address_referringList, uint256[][] _tokenIds_referringList, address[] _address_referredList, uint256[][] _tokenIds_referredList)',
      type: 'event',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5521.fn.UpdateNode.params.tokenId' },
        { name: 'owner', type: 'address', description: 'erc5521.fn.UpdateNode.params.owner' },
        { name: '_address_referringList', type: 'address[]', description: 'erc5521.fn.UpdateNode.params._address_referringList' },
        { name: '_tokenIds_referringList', type: 'uint256[][]', description: 'erc5521.fn.UpdateNode.params._tokenIds_referringList' },
        { name: '_address_referredList', type: 'address[]', description: 'erc5521.fn.UpdateNode.params._address_referredList' },
        { name: '_tokenIds_referredList', type: 'uint256[][]', description: 'erc5521.fn.UpdateNode.params._tokenIds_referredList' },
      ],
      description: 'erc5521.fn.UpdateNode.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5521.node.user',
      data: { address: '0xCreator' },
      layoutHint: 'source',
    },
    {
      id: 'erc5521-contract',
      type: 'contract',
      label: 'erc5521.node.contract',
      data: {
        functions: ['setNode', 'setNodeReferredExternal', 'referringOf', 'referredOf', 'createdTimestampOf'],
      },
      layoutHint: 'center',
    },
    {
      id: 'fn-setNode',
      type: 'function',
      label: 'setNode()',
      data: { fnType: 'write', signature: 'setNode(uint256 tokenId, address[] addresses, uint256[][] tokenIds)' },
    },
    {
      id: 'storage-relationship',
      type: 'storage',
      label: 'erc5521.node.storageRelationship',
      data: {
        slots: [
          { key: 'referring', label: 'mapping(address => uint256[])' },
          { key: 'referred', label: 'mapping(address => uint256[])' },
          { key: 'createdTimestamp', label: 'uint256' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'target-contract',
      type: 'contract',
      label: 'erc5521.node.targetContract',
      data: { functions: ['setNodeReferredExternal'] },
      layoutHint: 'sink',
    },
    {
      id: 'event-updateNode',
      type: 'function',
      label: 'UpdateNode event',
      data: {
        fnType: 'event',
        signature: 'UpdateNode(uint256 indexed tokenId, address indexed owner, address[] _address_referringList, uint256[][] _tokenIds_referringList, address[] _address_referredList, uint256[][] _tokenIds_referredList)',
      },
    },
  ],

  flowEdges: [
    { id: 'e-user-setNode', source: 'user', target: 'fn-setNode', type: 'animated', label: 'erc5521.edge.callSetNode' },
    { id: 'e-setNode-contract', source: 'fn-setNode', target: 'erc5521-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc5521-contract', target: 'storage-relationship', type: 'labeled', label: 'erc5521.edge.updateRelationship' },
    { id: 'e-contract-target', source: 'erc5521-contract', target: 'target-contract', type: 'animated', label: 'erc5521.edge.referExternal' },
    { id: 'e-contract-event', source: 'erc5521-contract', target: 'event-updateNode', type: 'labeled', label: 'erc5521.edge.emitUpdateNode' },
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
      id: 'set-node-walkthrough',
      name: 'erc5521.sim.setNodeWalkthrough.name',
      description: 'erc5521.sim.setNodeWalkthrough.desc',
      params: [
        {
          id: 'tokenId',
          label: 'erc5521.sim.setNodeWalkthrough.param.tokenId',
          type: 'uint256',
          defaultValue: '3',
        },
        {
          id: 'referredTokenId',
          label: 'erc5521.sim.setNodeWalkthrough.param.referredTokenId',
          type: 'uint256',
          defaultValue: '1',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5521.sim.setNodeWalkthrough.step.call',
          mobileDescription: 'erc5521.sim.setNodeWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-setNode'],
          highlightEdges: ['e-user-setNode'],
          durationMs: 1000,
        },
        {
          id: 'step-referring',
          description: 'erc5521.sim.setNodeWalkthrough.step.referring',
          mobileDescription: 'erc5521.sim.setNodeWalkthrough.step.referring.mobile',
          highlightNodes: ['fn-setNode', 'erc5521-contract', 'storage-relationship'],
          highlightEdges: ['e-setNode-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-relationship.referring[0xThisContract]': '[] → [1]',
            'storage-relationship.createdTimestamp': '0 → 1660118400',
          },
          durationMs: 1300,
        },
        {
          id: 'step-referred',
          description: 'erc5521.sim.setNodeWalkthrough.step.referred',
          mobileDescription: 'erc5521.sim.setNodeWalkthrough.step.referred.mobile',
          highlightNodes: ['erc5521-contract', 'target-contract'],
          highlightEdges: ['e-contract-target'],
          durationMs: 1100,
        },
        {
          id: 'step-event',
          description: 'erc5521.sim.setNodeWalkthrough.step.event',
          mobileDescription: 'erc5521.sim.setNodeWalkthrough.step.event.mobile',
          highlightNodes: ['erc5521-contract', 'event-updateNode'],
          highlightEdges: ['e-contract-event'],
          durationMs: 800,
        },
      ],
    },
  ],
};
