import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7656',
  name: 'ERC-7656',
  shortDescription: 'erc7656.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 7656,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7656',
  relatedSlugs: ['erc6551', 'erc4337', 'erc721', 'erc1155'],
  sortOrder: 17656,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20, 165, 721, 1155, 1167, 4337],
  relations: [
    { slug: 'erc6551', kind: 'alternative' },
    { slug: 'erc721', kind: 'requires' },
    { slug: 'erc1155', kind: 'requires' },
    { slug: 'erc4337', kind: 'requires' },
    { slug: 'erc165', kind: 'requires' },
    { slug: 'erc20', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-7656 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7656', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7656.introduction',
  designPurpose: 'erc7656.designPurpose',
  commonUsage: 'erc7656.commonUsage',

  functions: [
    {
      name: 'create',
      signature:
        'create(address implementation, bytes32 salt, uint256 chainId, bytes12 mode, address linkedContract, uint256 linkedId) → address',
      type: 'write',
      params: [
        { name: 'implementation', type: 'address', description: 'erc7656.fn.create.params.implementation' },
        { name: 'salt', type: 'bytes32', description: 'erc7656.fn.create.params.salt' },
        { name: 'chainId', type: 'uint256', description: 'erc7656.fn.create.params.chainId' },
        { name: 'mode', type: 'bytes12', description: 'erc7656.fn.create.params.mode' },
        { name: 'linkedContract', type: 'address', description: 'erc7656.fn.create.params.linkedContract' },
        { name: 'linkedId', type: 'uint256', description: 'erc7656.fn.create.params.linkedId' },
      ],
      returns: [{ name: 'service', type: 'address', description: 'erc7656.fn.create.returns.service' }],
      description: 'erc7656.fn.create.desc',
      defaultSimValues: {
        implementation: '0xImplementation',
        salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
        chainId: '1',
        mode: '0x000000000000000000000000',
        linkedContract: '0xNFTContract',
        linkedId: '42',
      },
    },
    {
      name: 'compute',
      signature:
        'compute(address implementation, bytes32 salt, uint256 chainId, bytes12 mode, address linkedContract, uint256 linkedId) → address service',
      type: 'read',
      params: [
        { name: 'implementation', type: 'address', description: 'erc7656.fn.compute.params.implementation' },
        { name: 'salt', type: 'bytes32', description: 'erc7656.fn.compute.params.salt' },
        { name: 'chainId', type: 'uint256', description: 'erc7656.fn.compute.params.chainId' },
        { name: 'mode', type: 'bytes12', description: 'erc7656.fn.compute.params.mode' },
        { name: 'linkedContract', type: 'address', description: 'erc7656.fn.compute.params.linkedContract' },
        { name: 'linkedId', type: 'uint256', description: 'erc7656.fn.compute.params.linkedId' },
      ],
      returns: [{ name: 'service', type: 'address', description: 'erc7656.fn.compute.returns.service' }],
      description: 'erc7656.fn.compute.desc',
      defaultSimValues: {
        chainId: '1',
        mode: '0x000000000000000000000000',
        linkedId: '42',
      },
    },
    {
      name: 'linkedData',
      signature:
        'linkedData() → uint256 chainId, bytes12 mode, address linkedContract, uint256 linkedId',
      type: 'read',
      params: [],
      returns: [
        { name: 'chainId', type: 'uint256', description: 'erc7656.fn.linkedData.returns.chainId' },
        { name: 'mode', type: 'bytes12', description: 'erc7656.fn.linkedData.returns.mode' },
        { name: 'linkedContract', type: 'address', description: 'erc7656.fn.linkedData.returns.linkedContract' },
        { name: 'linkedId', type: 'uint256', description: 'erc7656.fn.linkedData.returns.linkedId' },
      ],
      description: 'erc7656.fn.linkedData.desc',
    },
    {
      name: 'Created',
      signature:
        'Created(address contractAddress, address indexed implementation, bytes32 salt, uint256 chainId, bytes12 mode, address indexed linkedContract, uint256 indexed linkedId)',
      type: 'event',
      params: [
        { name: 'contractAddress', type: 'address', description: 'erc7656.fn.Created.params.contractAddress' },
        { name: 'implementation', type: 'address', description: 'erc7656.fn.Created.params.implementation' },
        { name: 'salt', type: 'bytes32', description: 'erc7656.fn.Created.params.salt' },
        { name: 'chainId', type: 'uint256', description: 'erc7656.fn.Created.params.chainId' },
        { name: 'mode', type: 'bytes12', description: 'erc7656.fn.Created.params.mode' },
        { name: 'linkedContract', type: 'address', description: 'erc7656.fn.Created.params.linkedContract' },
        { name: 'linkedId', type: 'uint256', description: 'erc7656.fn.Created.params.linkedId' },
      ],
      description: 'erc7656.fn.Created.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc7656.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'erc7656-contract',
      type: 'contract',
      label: 'erc7656.node.contract',
      data: { functions: ['create', 'compute'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-create',
      type: 'function',
      label: 'create()',
      data: {
        fnType: 'write',
        signature:
          'create(address implementation, bytes32 salt, uint256 chainId, bytes12 mode, address linkedContract, uint256 linkedId) → address',
      },
    },
    {
      id: 'fn-compute',
      type: 'function',
      label: 'compute()',
      data: {
        fnType: 'read',
        signature:
          'compute(address implementation, bytes32 salt, uint256 chainId, bytes12 mode, address linkedContract, uint256 linkedId) → address service',
      },
    },
    {
      id: 'linked-service',
      type: 'contract',
      label: 'erc7656.node.linkedService',
      data: { functions: ['linkedData'] },
    },
    {
      id: 'storage-linkedData',
      type: 'storage',
      label: 'erc7656.node.storageLinkedData',
      data: {
        slots: [
          { key: 'chainId', label: 'uint256' },
          { key: 'mode', label: 'bytes12' },
          { key: 'linkedContract', label: 'address' },
          { key: 'linkedId', label: 'uint256' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-created',
      type: 'function',
      label: 'Created event',
      data: {
        fnType: 'event',
        signature:
          'Created(address contractAddress, address indexed implementation, bytes32 salt, uint256 chainId, bytes12 mode, address indexed linkedContract, uint256 indexed linkedId)',
      },
    },
  ],

  flowEdges: [
    { id: 'e-user-create', source: 'user', target: 'fn-create', type: 'animated', label: 'erc7656.edge.callCreate' },
    { id: 'e-create-contract', source: 'fn-create', target: 'erc7656-contract', type: 'animated' },
    {
      id: 'e-contract-service',
      source: 'erc7656-contract',
      target: 'linked-service',
      type: 'animated',
      label: 'erc7656.edge.deployService',
    },
    {
      id: 'e-service-storage',
      source: 'linked-service',
      target: 'storage-linkedData',
      type: 'labeled',
      label: 'erc7656.edge.embedData',
    },
    {
      id: 'e-contract-event',
      source: 'erc7656-contract',
      target: 'event-created',
      type: 'labeled',
      label: 'erc7656.edge.emitCreated',
    },
    { id: 'e-user-compute', source: 'user', target: 'fn-compute', type: 'animated', label: 'erc7656.edge.callCompute' },
    { id: 'e-compute-contract', source: 'fn-compute', target: 'erc7656-contract', type: 'animated' },
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
      id: 'create-service-walkthrough',
      name: 'erc7656.sim.createServiceWalkthrough.name',
      description: 'erc7656.sim.createServiceWalkthrough.desc',
      params: [
        {
          id: 'linkedContract',
          label: 'erc7656.sim.createServiceWalkthrough.param.linkedContract',
          type: 'address',
          defaultValue: '0xNFTContract',
        },
        {
          id: 'linkedId',
          label: 'erc7656.sim.createServiceWalkthrough.param.linkedId',
          type: 'uint256',
          defaultValue: '42',
        },
        {
          id: 'mode',
          label: 'erc7656.sim.createServiceWalkthrough.param.mode',
          type: 'select',
          options: [
            { label: 'LINKED_ID', value: '0x000000000000000000000000' },
            { label: 'NO_LINKED_ID', value: '0x000000000000000000000001' },
          ],
          defaultValue: '0x000000000000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc7656.sim.createServiceWalkthrough.step.call',
          mobileDescription: 'erc7656.sim.createServiceWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-create'],
          highlightEdges: ['e-user-create'],
          durationMs: 1000,
        },
        {
          id: 'step-deploy',
          description: 'erc7656.sim.createServiceWalkthrough.step.deploy',
          mobileDescription: 'erc7656.sim.createServiceWalkthrough.step.deploy.mobile',
          highlightNodes: ['fn-create', 'erc7656-contract', 'linked-service'],
          highlightEdges: ['e-create-contract', 'e-contract-service'],
          valueChanges: { 'linked-service.address': '0xService (CREATE2)' },
          durationMs: 1400,
        },
        {
          id: 'step-embed',
          description: 'erc7656.sim.createServiceWalkthrough.step.embed',
          mobileDescription: 'erc7656.sim.createServiceWalkthrough.step.embed.mobile',
          highlightNodes: ['linked-service', 'storage-linkedData'],
          highlightEdges: ['e-service-storage'],
          valueChanges: {
            'storage-linkedData.mode': 'LINKED_ID',
            'storage-linkedData.linkedContract': '0xNFTContract',
            'storage-linkedData.linkedId': '42',
          },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc7656.sim.createServiceWalkthrough.step.event',
          mobileDescription: 'erc7656.sim.createServiceWalkthrough.step.event.mobile',
          highlightNodes: ['erc7656-contract', 'event-created'],
          highlightEdges: ['e-contract-event'],
          valueChanges: { 'event-created.lastEvent': 'Created(0xService, 0xImplementation, …)' },
          durationMs: 800,
        },
      ],
    },
  ],
};
