import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1900',
  name: 'ERC-1900',
  shortDescription: 'erc1900.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 1900,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1900',
  relatedSlugs: ['erc165', 'erc7201', 'erc2535'],
  sortOrder: 11900,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-1900 Specification', url: 'https://eips.ethereum.org/EIPS/eip-1900', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc1900.introduction',
  designPurpose: 'erc1900.designPurpose',
  commonUsage: 'erc1900.commonUsage',

  functions: [
    {
      name: 'insert',
      signature: 'insert(dTypeLib.dType data) → bytes32',
      type: 'write',
      params: [
        { name: 'data', type: 'dTypeLib.dType', description: 'erc1900.fn.insert.params.data' },
      ],
      returns: [
        { name: 'identifier', type: 'bytes32', description: 'erc1900.fn.insert.returns.identifier' },
      ],
      description: 'erc1900.fn.insert.desc',
    },
    {
      name: 'remove',
      signature: 'remove(bytes32 identifier) → uint256',
      type: 'write',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc1900.fn.remove.params.identifier' },
      ],
      returns: [
        { name: 'index', type: 'uint256', description: 'erc1900.fn.remove.returns.index' },
      ],
      description: 'erc1900.fn.remove.desc',
    },
    {
      name: 'count',
      signature: 'count() → uint256',
      type: 'read',
      params: [],
      returns: [
        { name: 'counter', type: 'uint256', description: 'erc1900.fn.count.returns.counter' },
      ],
      description: 'erc1900.fn.count.desc',
    },
    {
      name: 'getTypeIdentifier',
      signature: 'getTypeIdentifier(string name) → bytes32',
      type: 'read',
      params: [
        { name: 'name', type: 'string', description: 'erc1900.fn.getTypeIdentifier.params.name' },
      ],
      returns: [
        { name: 'identifier', type: 'bytes32', description: 'erc1900.fn.getTypeIdentifier.returns.identifier' },
      ],
      description: 'erc1900.fn.getTypeIdentifier.desc',
      defaultSimValues: { name: 'myBalance' },
    },
    {
      name: 'getByIdentifier',
      signature: 'getByIdentifier(bytes32 identifier) → dTypeLib.dType',
      type: 'read',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc1900.fn.getByIdentifier.params.identifier' },
      ],
      returns: [
        { name: 'dtype', type: 'dTypeLib.dType', description: 'erc1900.fn.getByIdentifier.returns.dtype' },
      ],
      description: 'erc1900.fn.getByIdentifier.desc',
    },
    {
      name: 'get',
      signature: 'get(string name) → dTypeLib.dType',
      type: 'read',
      params: [
        { name: 'name', type: 'string', description: 'erc1900.fn.get.params.name' },
      ],
      returns: [
        { name: 'dtype', type: 'dTypeLib.dType', description: 'erc1900.fn.get.returns.dtype' },
      ],
      description: 'erc1900.fn.get.desc',
      defaultSimValues: { name: 'myBalance' },
    },
    {
      name: 'isRegistered',
      signature: 'isRegistered(bytes32 identifier) → bool',
      type: 'read',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc1900.fn.isRegistered.params.identifier' },
      ],
      returns: [
        { name: 'registered', type: 'bool', description: 'erc1900.fn.isRegistered.returns.registered' },
      ],
      description: 'erc1900.fn.isRegistered.desc',
    },
    {
      name: 'LogNew',
      signature: 'LogNew(bytes32 indexed identifier, uint256 indexed index)',
      type: 'event',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc1900.fn.LogNew.params.identifier' },
        { name: 'index', type: 'uint256', description: 'erc1900.fn.LogNew.params.index' },
      ],
      description: 'erc1900.fn.LogNew.desc',
    },
    {
      name: 'LogUpdate',
      signature: 'LogUpdate(bytes32 indexed identifier, uint256 indexed index)',
      type: 'event',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc1900.fn.LogUpdate.params.identifier' },
        { name: 'index', type: 'uint256', description: 'erc1900.fn.LogUpdate.params.index' },
      ],
      description: 'erc1900.fn.LogUpdate.desc',
    },
    {
      name: 'LogRemove',
      signature: 'LogRemove(bytes32 indexed identifier, uint256 indexed index)',
      type: 'event',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc1900.fn.LogRemove.params.identifier' },
        { name: 'index', type: 'uint256', description: 'erc1900.fn.LogRemove.params.index' },
      ],
      description: 'erc1900.fn.LogRemove.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc1900.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'erc1900-contract',
      type: 'contract',
      label: 'erc1900.node.contract',
      data: {
        functions: ['insert', 'remove', 'count', 'getTypeIdentifier', 'getByIdentifier', 'get', 'isRegistered'],
      },
      layoutHint: 'center',
    },
    {
      id: 'fn-insert',
      type: 'function',
      label: 'insert()',
      data: { fnType: 'write', signature: 'insert(dTypeLib.dType data) → bytes32' },
    },
    {
      id: 'storage-types',
      type: 'storage',
      label: 'erc1900.node.storageTypes',
      data: {
        slots: [
          { key: 'typeStruct', label: 'mapping(bytes32 => Type)' },
          { key: 'typeIndex', label: 'bytes32[]' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-logNew',
      type: 'function',
      label: 'LogNew event',
      data: { fnType: 'event', signature: 'LogNew(bytes32 indexed identifier, uint256 indexed index)' },
    },
  ],

  flowEdges: [
    {
      id: 'e-user-insert',
      source: 'user',
      target: 'fn-insert',
      type: 'animated',
      label: 'erc1900.edge.callInsert',
    },
    {
      id: 'e-insert-contract',
      source: 'fn-insert',
      target: 'erc1900-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc1900-contract',
      target: 'storage-types',
      type: 'labeled',
      label: 'erc1900.edge.updateTypes',
    },
    {
      id: 'e-contract-event',
      source: 'erc1900-contract',
      target: 'event-logNew',
      type: 'labeled',
      label: 'erc1900.edge.emitLogNew',
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
      id: 'insert-walkthrough',
      name: 'erc1900.sim.insertWalkthrough.name',
      description: 'erc1900.sim.insertWalkthrough.desc',
      params: [
        {
          id: 'name',
          label: 'erc1900.sim.insertWalkthrough.param.name',
          type: 'select',
          options: [
            { label: 'uint256', value: 'uint256' },
            { label: 'myBalance', value: 'myBalance' },
            { label: 'myToken', value: 'myToken' },
          ],
          defaultValue: 'myBalance',
        },
        {
          id: 'typeChoice',
          label: 'erc1900.sim.insertWalkthrough.param.typeChoice',
          type: 'select',
          options: [
            { label: 'BaseType', value: 'BaseType' },
            { label: 'Event', value: 'Event' },
          ],
          defaultValue: 'BaseType',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc1900.sim.insertWalkthrough.step.call',
          mobileDescription: 'erc1900.sim.insertWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-insert'],
          highlightEdges: ['e-user-insert'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc1900.sim.insertWalkthrough.step.execute',
          mobileDescription: 'erc1900.sim.insertWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-insert', 'erc1900-contract', 'storage-types'],
          highlightEdges: ['e-insert-contract', 'e-contract-storage'],
          valueChanges: { 'storage-types.typeIndex.length': '0 → 1' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc1900.sim.insertWalkthrough.step.event',
          mobileDescription: 'erc1900.sim.insertWalkthrough.step.event.mobile',
          highlightNodes: ['erc1900-contract', 'event-logNew'],
          highlightEdges: ['e-contract-event'],
          durationMs: 800,
        },
      ],
    },
  ],
};
