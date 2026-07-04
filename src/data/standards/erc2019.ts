import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2019',
  name: 'ERC-2019',
  shortDescription: 'erc2019.short',
  category: 'token',
  entryType: 'standard',
  eipNumber: 2019,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2019',
  relatedSlugs: ['erc20', 'erc2612', 'erc3643'],
  sortOrder: 12019,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20],
  relations: [{ slug: 'erc20', kind: 'extends' }],
  references: [
    { label: 'ERC-2019 Specification', url: 'https://eips.ethereum.org/EIPS/eip-2019', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc2019.introduction',
  designPurpose: 'erc2019.designPurpose',
  commonUsage: 'erc2019.commonUsage',

  functions: [
    {
      name: 'authorizeFundOperator',
      signature: 'authorizeFundOperator(address orderer) → bool',
      type: 'write',
      params: [{ name: 'orderer', type: 'address', description: 'erc2019.fn.authorizeFundOperator.params.orderer' }],
      returns: [{ name: 'success', type: 'bool', description: 'erc2019.fn.authorizeFundOperator.returns.success' }],
      description: 'erc2019.fn.authorizeFundOperator.desc',
      defaultSimValues: { orderer: '0xOrderer' },
    },
    {
      name: 'orderFund',
      signature: 'orderFund(string calldata operationId, uint256 value, string calldata instructions) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2019.fn.orderFund.params.operationId' },
        { name: 'value', type: 'uint256', description: 'erc2019.fn.orderFund.params.value' },
        { name: 'instructions', type: 'string', description: 'erc2019.fn.orderFund.params.instructions' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2019.fn.orderFund.returns.success' }],
      description: 'erc2019.fn.orderFund.desc',
      defaultSimValues: { operationId: 'fund-2026-001', value: '1000000000000000000000', instructions: 'SEPA transfer, ref 12345' },
    },
    {
      name: 'orderFundFrom',
      signature: 'orderFundFrom(string calldata operationId, address walletToFund, uint256 value, string calldata instructions) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2019.fn.orderFundFrom.params.operationId' },
        { name: 'walletToFund', type: 'address', description: 'erc2019.fn.orderFundFrom.params.walletToFund' },
        { name: 'value', type: 'uint256', description: 'erc2019.fn.orderFundFrom.params.value' },
        { name: 'instructions', type: 'string', description: 'erc2019.fn.orderFundFrom.params.instructions' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2019.fn.orderFundFrom.returns.success' }],
      description: 'erc2019.fn.orderFundFrom.desc',
      defaultSimValues: { operationId: 'fund-2026-002', walletToFund: '0xWalletOwner', value: '1000000000000000000000', instructions: 'SWIFT wire, ref 67890' },
    },
    {
      name: 'cancelFund',
      signature: 'cancelFund(string calldata operationId) → bool',
      type: 'write',
      params: [{ name: 'operationId', type: 'string', description: 'erc2019.fn.cancelFund.params.operationId' }],
      returns: [{ name: 'success', type: 'bool', description: 'erc2019.fn.cancelFund.returns.success' }],
      description: 'erc2019.fn.cancelFund.desc',
      defaultSimValues: { operationId: 'fund-2026-001' },
    },
    {
      name: 'processFund',
      signature: 'processFund(string calldata operationId) → bool',
      type: 'write',
      params: [{ name: 'operationId', type: 'string', description: 'erc2019.fn.processFund.params.operationId' }],
      returns: [{ name: 'success', type: 'bool', description: 'erc2019.fn.processFund.returns.success' }],
      description: 'erc2019.fn.processFund.desc',
      defaultSimValues: { operationId: 'fund-2026-001' },
    },
    {
      name: 'executeFund',
      signature: 'executeFund(string calldata operationId) → bool',
      type: 'write',
      params: [{ name: 'operationId', type: 'string', description: 'erc2019.fn.executeFund.params.operationId' }],
      returns: [{ name: 'success', type: 'bool', description: 'erc2019.fn.executeFund.returns.success' }],
      description: 'erc2019.fn.executeFund.desc',
      defaultSimValues: { operationId: 'fund-2026-001' },
    },
    {
      name: 'rejectFund',
      signature: 'rejectFund(string calldata operationId, string calldata reason) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2019.fn.rejectFund.params.operationId' },
        { name: 'reason', type: 'string', description: 'erc2019.fn.rejectFund.params.reason' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2019.fn.rejectFund.returns.success' }],
      description: 'erc2019.fn.rejectFund.desc',
      defaultSimValues: { operationId: 'fund-2026-001', reason: '0x06 (payment not received)' },
    },
    {
      name: 'FundOrdered',
      signature: 'FundOrdered(address indexed orderer, string indexed operationId, address indexed walletToFund, uint256 value, string instructions)',
      type: 'event',
      params: [
        { name: 'orderer', type: 'address', description: 'erc2019.fn.FundOrdered.params.orderer' },
        { name: 'operationId', type: 'string', description: 'erc2019.fn.FundOrdered.params.operationId' },
        { name: 'walletToFund', type: 'address', description: 'erc2019.fn.FundOrdered.params.walletToFund' },
        { name: 'value', type: 'uint256', description: 'erc2019.fn.FundOrdered.params.value' },
        { name: 'instructions', type: 'string', description: 'erc2019.fn.FundOrdered.params.instructions' },
      ],
      description: 'erc2019.fn.FundOrdered.desc',
    },
    {
      name: 'FundInProcess',
      signature: 'FundInProcess(address indexed orderer, string indexed operationId)',
      type: 'event',
      params: [
        { name: 'orderer', type: 'address', description: 'erc2019.fn.FundInProcess.params.orderer' },
        { name: 'operationId', type: 'string', description: 'erc2019.fn.FundInProcess.params.operationId' },
      ],
      description: 'erc2019.fn.FundInProcess.desc',
    },
    {
      name: 'FundExecuted',
      signature: 'FundExecuted(address indexed orderer, string indexed operationId)',
      type: 'event',
      params: [
        { name: 'orderer', type: 'address', description: 'erc2019.fn.FundExecuted.params.orderer' },
        { name: 'operationId', type: 'string', description: 'erc2019.fn.FundExecuted.params.operationId' },
      ],
      description: 'erc2019.fn.FundExecuted.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc2019.node.user',
      data: { address: '0xWalletOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc2019-contract',
      type: 'contract',
      label: 'erc2019.node.contract',
      data: { functions: ['orderFund', 'orderFundFrom', 'cancelFund', 'processFund', 'executeFund', 'rejectFund', 'authorizeFundOperator'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-orderFund',
      type: 'function',
      label: 'orderFund()',
      data: { fnType: 'write', signature: 'orderFund(string calldata operationId, uint256 value, string calldata instructions) → bool' },
    },
    {
      id: 'fn-executeFund',
      type: 'function',
      label: 'executeFund()',
      data: { fnType: 'write', signature: 'executeFund(string calldata operationId) → bool' },
    },
    {
      id: 'storage-funds',
      type: 'storage',
      label: 'erc2019.node.storageFunds',
      data: {
        slots: [
          { key: '_funds', label: 'mapping(string => FundRequest)' },
          { key: '_operators', label: 'mapping(address => mapping(address => bool))' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'operator',
      type: 'user',
      label: 'erc2019.node.operator',
      data: { address: '0xTokenOperator' },
      layoutHint: 'sink',
    },
    {
      id: 'event-fundOrdered',
      type: 'function',
      label: 'FundOrdered event',
      data: { fnType: 'event', signature: 'FundOrdered(address indexed orderer, string indexed operationId, address indexed walletToFund, uint256 value, string instructions)' },
    },
    {
      id: 'event-fundExecuted',
      type: 'function',
      label: 'FundExecuted event',
      data: { fnType: 'event', signature: 'FundExecuted(address indexed orderer, string indexed operationId)' },
    },
  ],

  flowEdges: [
    { id: 'e-user-orderFund', source: 'user', target: 'fn-orderFund', type: 'animated', label: 'erc2019.edge.callOrderFund' },
    { id: 'e-orderFund-contract', source: 'fn-orderFund', target: 'erc2019-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc2019-contract', target: 'storage-funds', type: 'labeled', label: 'erc2019.edge.recordRequest' },
    { id: 'e-contract-fundOrdered', source: 'erc2019-contract', target: 'event-fundOrdered', type: 'labeled', label: 'erc2019.edge.emitFundOrdered' },
    { id: 'e-operator-executeFund', source: 'operator', target: 'fn-executeFund', type: 'animated', label: 'erc2019.edge.callExecuteFund' },
    { id: 'e-executeFund-contract', source: 'fn-executeFund', target: 'erc2019-contract', type: 'animated' },
    { id: 'e-contract-fundExecuted', source: 'erc2019-contract', target: 'event-fundExecuted', type: 'labeled', label: 'erc2019.edge.emitFundExecuted' },
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
      id: 'fund-request-walkthrough',
      name: 'erc2019.sim.fundRequestWalkthrough.name',
      description: 'erc2019.sim.fundRequestWalkthrough.desc',
      params: [
        {
          id: 'operationId',
          label: 'erc2019.sim.fundRequestWalkthrough.param.operationId',
          type: 'select',
          options: [
            { label: 'fund-2026-001', value: 'fund-2026-001' },
            { label: 'fund-2026-002', value: 'fund-2026-002' },
          ],
          defaultValue: 'fund-2026-001',
        },
        {
          id: 'value',
          label: 'erc2019.sim.fundRequestWalkthrough.param.value',
          type: 'uint256',
          defaultValue: '1000000000000000000000',
        },
        {
          id: 'instructions',
          label: 'erc2019.sim.fundRequestWalkthrough.param.instructions',
          type: 'select',
          options: [
            { label: 'SEPA transfer', value: 'sepa' },
            { label: 'SWIFT wire', value: 'swift' },
          ],
          defaultValue: 'sepa',
        },
      ],
      steps: [
        {
          id: 'step-order',
          description: 'erc2019.sim.fundRequestWalkthrough.step.order',
          mobileDescription: 'erc2019.sim.fundRequestWalkthrough.step.order.mobile',
          highlightNodes: ['user', 'fn-orderFund'],
          highlightEdges: ['e-user-orderFund'],
          durationMs: 1000,
        },
        {
          id: 'step-record',
          description: 'erc2019.sim.fundRequestWalkthrough.step.record',
          mobileDescription: 'erc2019.sim.fundRequestWalkthrough.step.record.mobile',
          highlightNodes: ['fn-orderFund', 'erc2019-contract', 'storage-funds', 'event-fundOrdered'],
          highlightEdges: ['e-orderFund-contract', 'e-contract-storage', 'e-contract-fundOrdered'],
          valueChanges: { 'storage-funds._funds[fund-2026-001]': 'Nonexistent → Ordered' },
          durationMs: 1200,
        },
        {
          id: 'step-execute',
          description: 'erc2019.sim.fundRequestWalkthrough.step.execute',
          mobileDescription: 'erc2019.sim.fundRequestWalkthrough.step.execute.mobile',
          highlightNodes: ['operator', 'fn-executeFund', 'erc2019-contract'],
          highlightEdges: ['e-operator-executeFund', 'e-executeFund-contract'],
          valueChanges: { 'storage-funds._funds[fund-2026-001]': 'Ordered → Executed' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc2019.sim.fundRequestWalkthrough.step.event',
          mobileDescription: 'erc2019.sim.fundRequestWalkthrough.step.event.mobile',
          highlightNodes: ['erc2019-contract', 'event-fundExecuted'],
          highlightEdges: ['e-contract-fundExecuted'],
          valueChanges: { 'erc2019-contract.totalSupply': '+1000 TOKEN (minted)' },
          durationMs: 800,
        },
      ],
    },
  ],
};
