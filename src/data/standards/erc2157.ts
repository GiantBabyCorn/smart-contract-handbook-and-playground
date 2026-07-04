import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2157',
  name: 'ERC-2157',
  shortDescription: 'erc2157.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 2157,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2157',
  relatedSlugs: ['erc165', 'erc7201', 'erc2535'],
  sortOrder: 12157,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [1900],
  references: [
    { label: 'ERC-2157 Specification', url: 'https://eips.ethereum.org/EIPS/eip-2157', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc2157.introduction',
  designPurpose: 'erc2157.designPurpose',
  commonUsage: 'erc2157.commonUsage',

  functions: [
    {
      name: 'insert',
      signature: 'insert(TypeALib.TypeA data) → bytes32',
      type: 'write',
      params: [
        { name: 'data', type: 'TypeALib.TypeA', description: 'erc2157.fn.insert.params.data' },
      ],
      returns: [
        { name: 'identifier', type: 'bytes32', description: 'erc2157.fn.insert.returns.identifier' },
      ],
      description: 'erc2157.fn.insert.desc',
    },
    {
      name: 'insertBytes',
      signature: 'insertBytes(bytes data) → bytes32',
      type: 'write',
      params: [
        { name: 'data', type: 'bytes', description: 'erc2157.fn.insertBytes.params.data' },
      ],
      returns: [
        { name: 'identifier', type: 'bytes32', description: 'erc2157.fn.insertBytes.returns.identifier' },
      ],
      description: 'erc2157.fn.insertBytes.desc',
    },
    {
      name: 'remove',
      signature: 'remove(bytes32 identifier) → uint256',
      type: 'write',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc2157.fn.remove.params.identifier' },
      ],
      returns: [
        { name: 'index', type: 'uint256', description: 'erc2157.fn.remove.returns.index' },
      ],
      description: 'erc2157.fn.remove.desc',
    },
    {
      name: 'update',
      signature: 'update(bytes32 identifier, TypeALib.TypeA data) → bytes32',
      type: 'write',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc2157.fn.update.params.identifier' },
        { name: 'data', type: 'TypeALib.TypeA', description: 'erc2157.fn.update.params.data' },
      ],
      returns: [
        { name: 'identifier', type: 'bytes32', description: 'erc2157.fn.update.returns.identifier' },
      ],
      description: 'erc2157.fn.update.desc',
    },
    {
      name: 'isStored',
      signature: 'isStored(bytes32 identifier) → bool',
      type: 'read',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc2157.fn.isStored.params.identifier' },
      ],
      returns: [
        { name: 'stored', type: 'bool', description: 'erc2157.fn.isStored.returns.stored' },
      ],
      description: 'erc2157.fn.isStored.desc',
    },
    {
      name: 'getByHash',
      signature: 'getByHash(bytes32 identifier) → TypeALib.TypeA',
      type: 'read',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc2157.fn.getByHash.params.identifier' },
      ],
      returns: [
        { name: 'data', type: 'TypeALib.TypeA', description: 'erc2157.fn.getByHash.returns.data' },
      ],
      description: 'erc2157.fn.getByHash.desc',
    },
    {
      name: 'getByIndex',
      signature: 'getByIndex(uint256 index) → TypeALib.TypeA',
      type: 'read',
      params: [
        { name: 'index', type: 'uint256', description: 'erc2157.fn.getByIndex.params.index' },
      ],
      returns: [
        { name: 'data', type: 'TypeALib.TypeA', description: 'erc2157.fn.getByIndex.returns.data' },
      ],
      description: 'erc2157.fn.getByIndex.desc',
    },
    {
      name: 'count',
      signature: 'count() → uint256',
      type: 'read',
      params: [],
      returns: [
        { name: 'counter', type: 'uint256', description: 'erc2157.fn.count.returns.counter' },
      ],
      description: 'erc2157.fn.count.desc',
    },
    {
      name: 'LogNew',
      signature: 'LogNew(bytes32 indexed identifier, uint256 indexed index)',
      type: 'event',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc2157.fn.LogNew.params.identifier' },
        { name: 'index', type: 'uint256', description: 'erc2157.fn.LogNew.params.index' },
      ],
      description: 'erc2157.fn.LogNew.desc',
    },
    {
      name: 'LogUpdate',
      signature: 'LogUpdate(bytes32 indexed identifier, uint256 indexed index)',
      type: 'event',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc2157.fn.LogUpdate.params.identifier' },
        { name: 'index', type: 'uint256', description: 'erc2157.fn.LogUpdate.params.index' },
      ],
      description: 'erc2157.fn.LogUpdate.desc',
    },
    {
      name: 'LogRemove',
      signature: 'LogRemove(bytes32 indexed identifier, uint256 indexed index)',
      type: 'event',
      params: [
        { name: 'identifier', type: 'bytes32', description: 'erc2157.fn.LogRemove.params.identifier' },
        { name: 'index', type: 'uint256', description: 'erc2157.fn.LogRemove.params.index' },
      ],
      description: 'erc2157.fn.LogRemove.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc2157.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'erc2157-contract',
      type: 'contract',
      label: 'erc2157.node.contract',
      data: {
        functions: ['insert', 'insertBytes', 'remove', 'update', 'isStored', 'getByHash', 'getByIndex', 'count'],
      },
      layoutHint: 'center',
    },
    {
      id: 'fn-insert',
      type: 'function',
      label: 'insert()',
      data: { fnType: 'write', signature: 'insert(TypeALib.TypeA data) → bytes32' },
    },
    {
      id: 'storage-records',
      type: 'storage',
      label: 'erc2157.node.storageRecords',
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
      label: 'erc2157.edge.callInsert',
    },
    {
      id: 'e-insert-contract',
      source: 'fn-insert',
      target: 'erc2157-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc2157-contract',
      target: 'storage-records',
      type: 'labeled',
      label: 'erc2157.edge.updateRecords',
    },
    {
      id: 'e-contract-event',
      source: 'erc2157-contract',
      target: 'event-logNew',
      type: 'labeled',
      label: 'erc2157.edge.emitLogNew',
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
      name: 'erc2157.sim.insertWalkthrough.name',
      description: 'erc2157.sim.insertWalkthrough.desc',
      params: [
        {
          id: 'record',
          label: 'erc2157.sim.insertWalkthrough.param.record',
          type: 'select',
          options: [
            { label: 'Product', value: 'Product' },
            { label: 'Profile', value: 'Profile' },
            { label: 'Order', value: 'Order' },
          ],
          defaultValue: 'Product',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc2157.sim.insertWalkthrough.step.call',
          mobileDescription: 'erc2157.sim.insertWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-insert'],
          highlightEdges: ['e-user-insert'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc2157.sim.insertWalkthrough.step.execute',
          mobileDescription: 'erc2157.sim.insertWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-insert', 'erc2157-contract', 'storage-records'],
          highlightEdges: ['e-insert-contract', 'e-contract-storage'],
          valueChanges: { 'storage-records.typeIndex.length': '0 → 1' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc2157.sim.insertWalkthrough.step.event',
          mobileDescription: 'erc2157.sim.insertWalkthrough.step.event.mobile',
          highlightNodes: ['erc2157-contract', 'event-logNew'],
          highlightEdges: ['e-contract-event'],
          durationMs: 800,
        },
      ],
    },
  ],
};
