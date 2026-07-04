import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2018',
  name: 'ERC-2018',
  shortDescription: 'erc2018.short',
  category: 'token',
  entryType: 'standard',
  eipNumber: 2018,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2018',
  relatedSlugs: ['erc20', 'erc3643', 'erc2612'],
  sortOrder: 12018,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [1996],
  references: [
    { label: 'ERC-2018 Specification', url: 'https://eips.ethereum.org/EIPS/eip-2018', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc2018.introduction',
  designPurpose: 'erc2018.designPurpose',
  commonUsage: 'erc2018.commonUsage',

  functions: [
    {
      name: 'orderTransfer',
      signature: 'orderTransfer(string operationId, address to, uint256 value) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2018.fn.orderTransfer.params.operationId' },
        { name: 'to', type: 'address', description: 'erc2018.fn.orderTransfer.params.to' },
        { name: 'value', type: 'uint256', description: 'erc2018.fn.orderTransfer.params.value' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2018.fn.orderTransfer.returns.success' }],
      description: 'erc2018.fn.orderTransfer.desc',
      defaultSimValues: { operationId: 'CLR-001', to: '0xPayee', value: '100000000000000000000' },
    },
    {
      name: 'orderTransferFrom',
      signature: 'orderTransferFrom(string operationId, address from, address to, uint256 value) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2018.fn.orderTransferFrom.params.operationId' },
        { name: 'from', type: 'address', description: 'erc2018.fn.orderTransferFrom.params.from' },
        { name: 'to', type: 'address', description: 'erc2018.fn.orderTransferFrom.params.to' },
        { name: 'value', type: 'uint256', description: 'erc2018.fn.orderTransferFrom.params.value' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2018.fn.orderTransferFrom.returns.success' }],
      description: 'erc2018.fn.orderTransferFrom.desc',
      defaultSimValues: { operationId: 'CLR-002', from: '0xPayer', to: '0xPayee', value: '100000000000000000000' },
    },
    {
      name: 'cancelTransfer',
      signature: 'cancelTransfer(string operationId) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2018.fn.cancelTransfer.params.operationId' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2018.fn.cancelTransfer.returns.success' }],
      description: 'erc2018.fn.cancelTransfer.desc',
      defaultSimValues: { operationId: 'CLR-001' },
    },
    {
      name: 'processClearableTransfer',
      signature: 'processClearableTransfer(string operationId) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2018.fn.processClearableTransfer.params.operationId' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2018.fn.processClearableTransfer.returns.success' }],
      description: 'erc2018.fn.processClearableTransfer.desc',
      defaultSimValues: { operationId: 'CLR-001' },
    },
    {
      name: 'executeClearableTransfer',
      signature: 'executeClearableTransfer(string operationId) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2018.fn.executeClearableTransfer.params.operationId' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2018.fn.executeClearableTransfer.returns.success' }],
      description: 'erc2018.fn.executeClearableTransfer.desc',
      defaultSimValues: { operationId: 'CLR-001' },
    },
    {
      name: 'rejectClearableTransfer',
      signature: 'rejectClearableTransfer(string operationId, string reason) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2018.fn.rejectClearableTransfer.params.operationId' },
        { name: 'reason', type: 'string', description: 'erc2018.fn.rejectClearableTransfer.params.reason' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2018.fn.rejectClearableTransfer.returns.success' }],
      description: 'erc2018.fn.rejectClearableTransfer.desc',
      defaultSimValues: { operationId: 'CLR-001', reason: 'KYC check failed' },
    },
    {
      name: 'retrieveClearableTransferData',
      signature: 'retrieveClearableTransferData(string operationId) → (address from, address to, uint256 value, ClearableTransferStatusCode status)',
      type: 'read',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2018.fn.retrieveClearableTransferData.params.operationId' },
      ],
      returns: [
        { name: 'from', type: 'address', description: 'erc2018.fn.retrieveClearableTransferData.returns.from' },
        { name: 'to', type: 'address', description: 'erc2018.fn.retrieveClearableTransferData.returns.to' },
        { name: 'value', type: 'uint256', description: 'erc2018.fn.retrieveClearableTransferData.returns.value' },
        { name: 'status', type: 'ClearableTransferStatusCode', description: 'erc2018.fn.retrieveClearableTransferData.returns.status' },
      ],
      description: 'erc2018.fn.retrieveClearableTransferData.desc',
      defaultSimValues: { operationId: 'CLR-001' },
    },
    {
      name: 'ClearableTransferOrdered',
      signature: 'ClearableTransferOrdered(address indexed orderer, string operationId, address indexed from, address indexed to, uint256 value)',
      type: 'event',
      params: [
        { name: 'orderer', type: 'address', description: 'erc2018.fn.ClearableTransferOrdered.params.orderer' },
        { name: 'operationId', type: 'string', description: 'erc2018.fn.ClearableTransferOrdered.params.operationId' },
        { name: 'from', type: 'address', description: 'erc2018.fn.ClearableTransferOrdered.params.from' },
        { name: 'to', type: 'address', description: 'erc2018.fn.ClearableTransferOrdered.params.to' },
        { name: 'value', type: 'uint256', description: 'erc2018.fn.ClearableTransferOrdered.params.value' },
      ],
      description: 'erc2018.fn.ClearableTransferOrdered.desc',
    },
    {
      name: 'ClearableTransferExecuted',
      signature: 'ClearableTransferExecuted(address indexed orderer, string operationId)',
      type: 'event',
      params: [
        { name: 'orderer', type: 'address', description: 'erc2018.fn.ClearableTransferExecuted.params.orderer' },
        { name: 'operationId', type: 'string', description: 'erc2018.fn.ClearableTransferExecuted.params.operationId' },
      ],
      description: 'erc2018.fn.ClearableTransferExecuted.desc',
    },
    {
      name: 'ClearableTransferRejected',
      signature: 'ClearableTransferRejected(address indexed orderer, string operationId, string reason)',
      type: 'event',
      params: [
        { name: 'orderer', type: 'address', description: 'erc2018.fn.ClearableTransferRejected.params.orderer' },
        { name: 'operationId', type: 'string', description: 'erc2018.fn.ClearableTransferRejected.params.operationId' },
        { name: 'reason', type: 'string', description: 'erc2018.fn.ClearableTransferRejected.params.reason' },
      ],
      description: 'erc2018.fn.ClearableTransferRejected.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc2018.node.user',
      data: { address: '0xPayer', balance: '100 TOKEN' },
      layoutHint: 'source',
    },
    {
      id: 'clearingAgent',
      type: 'user',
      label: 'erc2018.node.clearingAgent',
      data: { address: '0xClearingAgent' },
      layoutHint: 'source',
    },
    {
      id: 'erc2018-contract',
      type: 'contract',
      label: 'erc2018.node.contract',
      data: {
        functions: [
          'orderTransfer',
          'orderTransferFrom',
          'cancelTransfer',
          'processClearableTransfer',
          'executeClearableTransfer',
          'rejectClearableTransfer',
          'retrieveClearableTransferData',
        ],
      },
      layoutHint: 'center',
    },
    {
      id: 'fn-orderTransfer',
      type: 'function',
      label: 'orderTransfer()',
      data: { fnType: 'write', signature: 'orderTransfer(string operationId, address to, uint256 value)' },
    },
    {
      id: 'fn-executeClearableTransfer',
      type: 'function',
      label: 'executeClearableTransfer()',
      data: { fnType: 'write', signature: 'executeClearableTransfer(string operationId)' },
    },
    {
      id: 'storage-clearableTransfers',
      type: 'storage',
      label: 'erc2018.node.storageClearableTransfers',
      data: {
        slots: [
          { key: '_clearableTransfers', label: 'mapping(string => ClearableTransfer)' },
          { key: '_heldBalance', label: 'mapping(address => uint256)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'payee',
      type: 'user',
      label: 'erc2018.node.payee',
      data: { address: '0xPayee' },
      layoutHint: 'sink',
    },
    {
      id: 'event-executed',
      type: 'function',
      label: 'ClearableTransferExecuted event',
      data: { fnType: 'event', signature: 'ClearableTransferExecuted(address indexed orderer, string operationId)' },
    },
  ],

  flowEdges: [
    { id: 'e-user-order', source: 'user', target: 'fn-orderTransfer', type: 'animated', label: 'erc2018.edge.callOrderTransfer' },
    { id: 'e-order-contract', source: 'fn-orderTransfer', target: 'erc2018-contract', type: 'animated' },
    { id: 'e-agent-execute', source: 'clearingAgent', target: 'fn-executeClearableTransfer', type: 'animated', label: 'erc2018.edge.callExecute' },
    { id: 'e-execute-contract', source: 'fn-executeClearableTransfer', target: 'erc2018-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc2018-contract', target: 'storage-clearableTransfers', type: 'labeled', label: 'erc2018.edge.updateTransfers' },
    { id: 'e-contract-payee', source: 'erc2018-contract', target: 'payee', type: 'fundFlow', label: 'erc2018.edge.transferTokens' },
    { id: 'e-contract-event', source: 'erc2018-contract', target: 'event-executed', type: 'labeled', label: 'erc2018.edge.emitExecuted' },
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
      id: 'order-transfer-walkthrough',
      name: 'erc2018.sim.orderTransferWalkthrough.name',
      description: 'erc2018.sim.orderTransferWalkthrough.desc',
      params: [
        {
          id: 'operationId',
          label: 'erc2018.sim.orderTransferWalkthrough.param.operationId',
          type: 'select',
          options: [
            { label: 'CLR-001', value: 'CLR-001' },
            { label: 'CLR-002', value: 'CLR-002' },
          ],
          defaultValue: 'CLR-001',
        },
        {
          id: 'to',
          label: 'erc2018.sim.orderTransferWalkthrough.param.to',
          type: 'address',
          defaultValue: '0xPayee',
        },
        {
          id: 'value',
          label: 'erc2018.sim.orderTransferWalkthrough.param.value',
          type: 'uint256',
          defaultValue: '100000000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-order',
          description: 'erc2018.sim.orderTransferWalkthrough.step.order',
          mobileDescription: 'erc2018.sim.orderTransferWalkthrough.step.order.mobile',
          highlightNodes: ['user', 'fn-orderTransfer'],
          highlightEdges: ['e-user-order'],
          durationMs: 1000,
        },
        {
          id: 'step-record',
          description: 'erc2018.sim.orderTransferWalkthrough.step.record',
          mobileDescription: 'erc2018.sim.orderTransferWalkthrough.step.record.mobile',
          highlightNodes: ['fn-orderTransfer', 'erc2018-contract', 'storage-clearableTransfers'],
          highlightEdges: ['e-order-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-clearableTransfers._clearableTransfers[CLR-001]': 'Nonexistent → Ordered',
            'storage-clearableTransfers._heldBalance[0xPayer]': '0 → 100e18',
          },
          durationMs: 1200,
        },
        {
          id: 'step-execute',
          description: 'erc2018.sim.orderTransferWalkthrough.step.execute',
          mobileDescription: 'erc2018.sim.orderTransferWalkthrough.step.execute.mobile',
          highlightNodes: ['clearingAgent', 'fn-executeClearableTransfer', 'erc2018-contract', 'payee'],
          highlightEdges: ['e-agent-execute', 'e-execute-contract', 'e-contract-payee'],
          valueChanges: {
            'storage-clearableTransfers._clearableTransfers[CLR-001]': 'Ordered → Executed',
            'storage-clearableTransfers._heldBalance[0xPayer]': '100e18 → 0',
          },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc2018.sim.orderTransferWalkthrough.step.event',
          mobileDescription: 'erc2018.sim.orderTransferWalkthrough.step.event.mobile',
          highlightNodes: ['erc2018-contract', 'event-executed'],
          highlightEdges: ['e-contract-event'],
          durationMs: 800,
        },
      ],
    },
  ],
};
