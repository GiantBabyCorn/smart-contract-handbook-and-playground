import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc725',
  name: 'ERC-725',
  shortDescription: 'erc725.short',
  category: 'account',
  entryType: 'standard',
  eipNumber: 725,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-725',
  relatedSlugs: ['erc165', 'erc173', 'erc4337', 'erc6551'],
  sortOrder: 10725,
  eipStatus: 'Draft',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [165, 173],
  relations: [
    { slug: 'erc165', kind: 'requires' },
    { slug: 'erc173', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-725 Specification', url: 'https://eips.ethereum.org/EIPS/eip-725', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc725.introduction',
  designPurpose: 'erc725.designPurpose',
  commonUsage: 'erc725.commonUsage',

  functions: [
    {
      name: 'execute',
      signature:
        'execute(uint256 operationType, address target, uint256 value, bytes memory data) → bytes',
      type: 'write',
      params: [
        { name: 'operationType', type: 'uint256', description: 'erc725.fn.execute.params.operationType' },
        { name: 'target', type: 'address', description: 'erc725.fn.execute.params.target' },
        { name: 'value', type: 'uint256', description: 'erc725.fn.execute.params.value' },
        { name: 'data', type: 'bytes', description: 'erc725.fn.execute.params.data' },
      ],
      returns: [{ name: 'returnData', type: 'bytes', description: 'erc725.fn.execute.returns.returnData' }],
      description: 'erc725.fn.execute.desc',
      defaultSimValues: { operationType: '0', target: '0xTarget', value: '0', data: '0x' },
    },
    {
      name: 'executeBatch',
      signature:
        'executeBatch(uint256[] memory operationsType, address[] memory targets, uint256[] memory values, bytes[] memory datas) → bytes[]',
      type: 'write',
      params: [
        { name: 'operationsType', type: 'uint256[]', description: 'erc725.fn.executeBatch.params.operationsType' },
        { name: 'targets', type: 'address[]', description: 'erc725.fn.executeBatch.params.targets' },
        { name: 'values', type: 'uint256[]', description: 'erc725.fn.executeBatch.params.values' },
        { name: 'datas', type: 'bytes[]', description: 'erc725.fn.executeBatch.params.datas' },
      ],
      returns: [{ name: 'results', type: 'bytes[]', description: 'erc725.fn.executeBatch.returns.results' }],
      description: 'erc725.fn.executeBatch.desc',
    },
    {
      name: 'getData',
      signature: 'getData(bytes32 dataKey) → bytes',
      type: 'read',
      params: [{ name: 'dataKey', type: 'bytes32', description: 'erc725.fn.getData.params.dataKey' }],
      returns: [{ name: 'dataValue', type: 'bytes', description: 'erc725.fn.getData.returns.dataValue' }],
      description: 'erc725.fn.getData.desc',
      defaultSimValues: { dataKey: '0x6935a24ea384927f250ee0b954ed498cd9203fc5d2bf95c735e52e6ca675e047' },
    },
    {
      name: 'getDataBatch',
      signature: 'getDataBatch(bytes32[] memory dataKeys) → bytes[]',
      type: 'read',
      params: [{ name: 'dataKeys', type: 'bytes32[]', description: 'erc725.fn.getDataBatch.params.dataKeys' }],
      returns: [{ name: 'dataValues', type: 'bytes[]', description: 'erc725.fn.getDataBatch.returns.dataValues' }],
      description: 'erc725.fn.getDataBatch.desc',
    },
    {
      name: 'setData',
      signature: 'setData(bytes32 dataKey, bytes memory dataValue)',
      type: 'write',
      params: [
        { name: 'dataKey', type: 'bytes32', description: 'erc725.fn.setData.params.dataKey' },
        { name: 'dataValue', type: 'bytes', description: 'erc725.fn.setData.params.dataValue' },
      ],
      description: 'erc725.fn.setData.desc',
      defaultSimValues: {
        dataKey: '0x6935a24ea384927f250ee0b954ed498cd9203fc5d2bf95c735e52e6ca675e047',
        dataValue: '0x48656c6c6f',
      },
    },
    {
      name: 'setDataBatch',
      signature: 'setDataBatch(bytes32[] memory dataKeys, bytes[] memory dataValues)',
      type: 'write',
      params: [
        { name: 'dataKeys', type: 'bytes32[]', description: 'erc725.fn.setDataBatch.params.dataKeys' },
        { name: 'dataValues', type: 'bytes[]', description: 'erc725.fn.setDataBatch.params.dataValues' },
      ],
      description: 'erc725.fn.setDataBatch.desc',
    },
    {
      name: 'Executed',
      signature: 'Executed(uint256 indexed operationType, address indexed target, uint256 indexed value, bytes4 data)',
      type: 'event',
      params: [
        { name: 'operationType', type: 'uint256', description: 'erc725.fn.Executed.params.operationType' },
        { name: 'target', type: 'address', description: 'erc725.fn.Executed.params.target' },
        { name: 'value', type: 'uint256', description: 'erc725.fn.Executed.params.value' },
        { name: 'data', type: 'bytes4', description: 'erc725.fn.Executed.params.data' },
      ],
      description: 'erc725.fn.Executed.desc',
    },
    {
      name: 'ContractCreated',
      signature:
        'ContractCreated(uint256 indexed operationType, address indexed contractAddress, uint256 indexed value, bytes32 salt)',
      type: 'event',
      params: [
        { name: 'operationType', type: 'uint256', description: 'erc725.fn.ContractCreated.params.operationType' },
        { name: 'contractAddress', type: 'address', description: 'erc725.fn.ContractCreated.params.contractAddress' },
        { name: 'value', type: 'uint256', description: 'erc725.fn.ContractCreated.params.value' },
        { name: 'salt', type: 'bytes32', description: 'erc725.fn.ContractCreated.params.salt' },
      ],
      description: 'erc725.fn.ContractCreated.desc',
    },
    {
      name: 'DataChanged',
      signature: 'DataChanged(bytes32 indexed dataKey, bytes dataValue)',
      type: 'event',
      params: [
        { name: 'dataKey', type: 'bytes32', description: 'erc725.fn.DataChanged.params.dataKey' },
        { name: 'dataValue', type: 'bytes', description: 'erc725.fn.DataChanged.params.dataValue' },
      ],
      description: 'erc725.fn.DataChanged.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc725.node.user',
      data: { address: '0xOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc725-contract',
      type: 'contract',
      label: 'erc725.node.contract',
      data: { functions: ['execute', 'setData', 'getData'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-execute',
      type: 'function',
      label: 'execute()',
      data: {
        fnType: 'write',
        signature:
          'execute(uint256 operationType, address target, uint256 value, bytes memory data) → bytes',
      },
    },
    {
      id: 'fn-setData',
      type: 'function',
      label: 'setData()',
      data: { fnType: 'write', signature: 'setData(bytes32 dataKey, bytes memory dataValue)' },
    },
    {
      id: 'storage-data',
      type: 'storage',
      label: 'erc725.node.storageData',
      data: { slots: [{ key: '_store', label: 'mapping(bytes32 => bytes)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-executed',
      type: 'function',
      label: 'Executed event',
      data: {
        fnType: 'event',
        signature: 'Executed(uint256 indexed operationType, address indexed target, uint256 indexed value, bytes4 data)',
      },
    },
    {
      id: 'event-dataChanged',
      type: 'function',
      label: 'DataChanged event',
      data: { fnType: 'event', signature: 'DataChanged(bytes32 indexed dataKey, bytes dataValue)' },
    },
    {
      id: 'target',
      type: 'user',
      label: 'erc725.node.target',
      data: { address: '0xTarget' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    { id: 'e-user-execute', source: 'user', target: 'fn-execute', type: 'animated', label: 'erc725.edge.callExecute' },
    { id: 'e-user-setData', source: 'user', target: 'fn-setData', type: 'animated', label: 'erc725.edge.callSetData' },
    { id: 'e-execute-contract', source: 'fn-execute', target: 'erc725-contract', type: 'animated' },
    { id: 'e-setData-contract', source: 'fn-setData', target: 'erc725-contract', type: 'animated' },
    { id: 'e-contract-target', source: 'erc725-contract', target: 'target', type: 'labeled', label: 'erc725.edge.forwardCall' },
    { id: 'e-contract-storage', source: 'erc725-contract', target: 'storage-data', type: 'labeled', label: 'erc725.edge.updateStore' },
    { id: 'e-contract-executed', source: 'erc725-contract', target: 'event-executed', type: 'labeled', label: 'erc725.edge.emitExecuted' },
    { id: 'e-contract-dataChanged', source: 'erc725-contract', target: 'event-dataChanged', type: 'labeled', label: 'erc725.edge.emitDataChanged' },
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
      id: 'set-data-walkthrough',
      name: 'erc725.sim.setDataWalkthrough.name',
      description: 'erc725.sim.setDataWalkthrough.desc',
      params: [
        {
          id: 'dataKey',
          label: 'erc725.sim.setDataWalkthrough.param.dataKey',
          type: 'uint256',
          defaultValue: '0x6935a24ea384927f250ee0b954ed498cd9203fc5d2bf95c735e52e6ca675e047',
        },
        {
          id: 'dataValue',
          label: 'erc725.sim.setDataWalkthrough.param.dataValue',
          type: 'uint256',
          defaultValue: '0x48656c6c6f',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc725.sim.setDataWalkthrough.step.call',
          mobileDescription: 'erc725.sim.setDataWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-setData'],
          highlightEdges: ['e-user-setData'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc725.sim.setDataWalkthrough.step.execute',
          mobileDescription: 'erc725.sim.setDataWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-setData', 'erc725-contract', 'storage-data'],
          highlightEdges: ['e-setData-contract', 'e-contract-storage'],
          valueChanges: { 'storage-data._store[0x6935…]': '0x → 0x48656c6c6f' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc725.sim.setDataWalkthrough.step.event',
          mobileDescription: 'erc725.sim.setDataWalkthrough.step.event.mobile',
          highlightNodes: ['erc725-contract', 'event-dataChanged'],
          highlightEdges: ['e-contract-dataChanged'],
          durationMs: 800,
        },
      ],
    },
  ],
};
