import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2021',
  name: 'ERC-2021',
  shortDescription: 'erc2021.short',
  category: 'token',
  entryType: 'standard',
  eipNumber: 2021,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2021',
  relatedSlugs: ['erc20', 'erc3643', 'erc2612'],
  sortOrder: 12021,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20, 1066, 1996],
  relations: [{ slug: 'erc20', kind: 'extends' }],
  references: [
    { label: 'ERC-2021 Specification', url: 'https://eips.ethereum.org/EIPS/eip-2021', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc2021.introduction',
  designPurpose: 'erc2021.designPurpose',
  commonUsage: 'erc2021.commonUsage',

  functions: [
    {
      name: 'orderPayout',
      signature: 'orderPayout(string operationId, uint256 value, string instructions) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2021.fn.orderPayout.params.operationId' },
        { name: 'value', type: 'uint256', description: 'erc2021.fn.orderPayout.params.value' },
        { name: 'instructions', type: 'string', description: 'erc2021.fn.orderPayout.params.instructions' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2021.fn.orderPayout.returns.success' }],
      description: 'erc2021.fn.orderPayout.desc',
      defaultSimValues: {
        operationId: 'PAYOUT-001',
        value: '100000000000000000000',
        instructions: 'IBAN:ES9121000418450200051332',
      },
    },
    {
      name: 'orderPayoutFrom',
      signature: 'orderPayoutFrom(string operationId, address walletToBePaidOut, uint256 value, string instructions) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2021.fn.orderPayoutFrom.params.operationId' },
        { name: 'walletToBePaidOut', type: 'address', description: 'erc2021.fn.orderPayoutFrom.params.walletToBePaidOut' },
        { name: 'value', type: 'uint256', description: 'erc2021.fn.orderPayoutFrom.params.value' },
        { name: 'instructions', type: 'string', description: 'erc2021.fn.orderPayoutFrom.params.instructions' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2021.fn.orderPayoutFrom.returns.success' }],
      description: 'erc2021.fn.orderPayoutFrom.desc',
      defaultSimValues: {
        operationId: 'PAYOUT-002',
        walletToBePaidOut: '0xWalletOwner',
        value: '100000000000000000000',
        instructions: 'IBAN:ES9121000418450200051332',
      },
    },
    {
      name: 'cancelPayout',
      signature: 'cancelPayout(string operationId) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2021.fn.cancelPayout.params.operationId' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2021.fn.cancelPayout.returns.success' }],
      description: 'erc2021.fn.cancelPayout.desc',
      defaultSimValues: { operationId: 'PAYOUT-001' },
    },
    {
      name: 'processPayout',
      signature: 'processPayout(string operationId) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2021.fn.processPayout.params.operationId' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2021.fn.processPayout.returns.success' }],
      description: 'erc2021.fn.processPayout.desc',
      defaultSimValues: { operationId: 'PAYOUT-001' },
    },
    {
      name: 'putFundsInSuspenseInPayout',
      signature: 'putFundsInSuspenseInPayout(string operationId) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2021.fn.putFundsInSuspenseInPayout.params.operationId' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2021.fn.putFundsInSuspenseInPayout.returns.success' }],
      description: 'erc2021.fn.putFundsInSuspenseInPayout.desc',
      defaultSimValues: { operationId: 'PAYOUT-001' },
    },
    {
      name: 'executePayout',
      signature: 'executePayout(string operationId) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2021.fn.executePayout.params.operationId' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2021.fn.executePayout.returns.success' }],
      description: 'erc2021.fn.executePayout.desc',
      defaultSimValues: { operationId: 'PAYOUT-001' },
    },
    {
      name: 'rejectPayout',
      signature: 'rejectPayout(string operationId, string reason) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2021.fn.rejectPayout.params.operationId' },
        { name: 'reason', type: 'string', description: 'erc2021.fn.rejectPayout.params.reason' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc2021.fn.rejectPayout.returns.success' }],
      description: 'erc2021.fn.rejectPayout.desc',
      defaultSimValues: { operationId: 'PAYOUT-001', reason: '0x00' },
    },
    {
      name: 'retrievePayoutData',
      signature: 'retrievePayoutData(string operationId) → (address walletToDebit, uint256 value, string instructions, PayoutStatusCode status)',
      type: 'read',
      params: [
        { name: 'operationId', type: 'string', description: 'erc2021.fn.retrievePayoutData.params.operationId' },
      ],
      returns: [
        { name: 'walletToDebit', type: 'address', description: 'erc2021.fn.retrievePayoutData.returns.walletToDebit' },
        { name: 'value', type: 'uint256', description: 'erc2021.fn.retrievePayoutData.returns.value' },
        { name: 'instructions', type: 'string', description: 'erc2021.fn.retrievePayoutData.returns.instructions' },
        { name: 'status', type: 'PayoutStatusCode', description: 'erc2021.fn.retrievePayoutData.returns.status' },
      ],
      description: 'erc2021.fn.retrievePayoutData.desc',
      defaultSimValues: { operationId: 'PAYOUT-001' },
    },
    {
      name: 'PayoutOrdered',
      signature: 'PayoutOrdered(address indexed orderer, string indexed operationId, address indexed walletToDebit, uint256 value, string instructions)',
      type: 'event',
      params: [
        { name: 'orderer', type: 'address', description: 'erc2021.fn.PayoutOrdered.params.orderer' },
        { name: 'operationId', type: 'string', description: 'erc2021.fn.PayoutOrdered.params.operationId' },
        { name: 'walletToDebit', type: 'address', description: 'erc2021.fn.PayoutOrdered.params.walletToDebit' },
        { name: 'value', type: 'uint256', description: 'erc2021.fn.PayoutOrdered.params.value' },
        { name: 'instructions', type: 'string', description: 'erc2021.fn.PayoutOrdered.params.instructions' },
      ],
      description: 'erc2021.fn.PayoutOrdered.desc',
    },
    {
      name: 'PayoutExecuted',
      signature: 'PayoutExecuted(address indexed orderer, string indexed operationId)',
      type: 'event',
      params: [
        { name: 'orderer', type: 'address', description: 'erc2021.fn.PayoutExecuted.params.orderer' },
        { name: 'operationId', type: 'string', description: 'erc2021.fn.PayoutExecuted.params.operationId' },
      ],
      description: 'erc2021.fn.PayoutExecuted.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc2021.node.user',
      data: { address: '0xWalletOwner', balance: '100 TOKEN' },
      layoutHint: 'source',
    },
    {
      id: 'operator',
      type: 'user',
      label: 'erc2021.node.operator',
      data: { address: '0xOperator' },
      layoutHint: 'source',
    },
    {
      id: 'erc2021-contract',
      type: 'contract',
      label: 'erc2021.node.contract',
      data: {
        functions: [
          'orderPayout',
          'orderPayoutFrom',
          'cancelPayout',
          'processPayout',
          'putFundsInSuspenseInPayout',
          'executePayout',
          'rejectPayout',
          'retrievePayoutData',
        ],
      },
      layoutHint: 'center',
    },
    {
      id: 'fn-orderPayout',
      type: 'function',
      label: 'orderPayout()',
      data: { fnType: 'write', signature: 'orderPayout(string operationId, uint256 value, string instructions)' },
    },
    {
      id: 'fn-executePayout',
      type: 'function',
      label: 'executePayout()',
      data: { fnType: 'write', signature: 'executePayout(string operationId)' },
    },
    {
      id: 'storage-payouts',
      type: 'storage',
      label: 'erc2021.node.storagePayouts',
      data: {
        slots: [
          { key: '_payouts', label: 'mapping(string => Payout)' },
          { key: '_heldBalance', label: 'mapping(address => uint256)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-payoutExecuted',
      type: 'function',
      label: 'PayoutExecuted event',
      data: { fnType: 'event', signature: 'PayoutExecuted(address indexed orderer, string indexed operationId)' },
    },
  ],

  flowEdges: [
    { id: 'e-user-order', source: 'user', target: 'fn-orderPayout', type: 'animated', label: 'erc2021.edge.callOrderPayout' },
    { id: 'e-order-contract', source: 'fn-orderPayout', target: 'erc2021-contract', type: 'animated' },
    { id: 'e-operator-execute', source: 'operator', target: 'fn-executePayout', type: 'animated', label: 'erc2021.edge.callExecutePayout' },
    { id: 'e-execute-contract', source: 'fn-executePayout', target: 'erc2021-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc2021-contract', target: 'storage-payouts', type: 'labeled', label: 'erc2021.edge.updatePayouts' },
    { id: 'e-contract-event', source: 'erc2021-contract', target: 'event-payoutExecuted', type: 'labeled', label: 'erc2021.edge.emitPayoutExecuted' },
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
      id: 'order-payout-walkthrough',
      name: 'erc2021.sim.orderPayoutWalkthrough.name',
      description: 'erc2021.sim.orderPayoutWalkthrough.desc',
      params: [
        {
          id: 'value',
          label: 'erc2021.sim.orderPayoutWalkthrough.param.value',
          type: 'uint256',
          defaultValue: '100000000000000000000',
        },
        {
          id: 'instructions',
          label: 'erc2021.sim.orderPayoutWalkthrough.param.instructions',
          type: 'select',
          options: [
            { label: 'IBAN ES91…', value: 'IBAN:ES9121000418450200051332' },
            { label: 'IBAN DE89…', value: 'IBAN:DE89370400440532013000' },
          ],
          defaultValue: 'IBAN:ES9121000418450200051332',
        },
      ],
      steps: [
        {
          id: 'step-order',
          description: 'erc2021.sim.orderPayoutWalkthrough.step.order',
          mobileDescription: 'erc2021.sim.orderPayoutWalkthrough.step.order.mobile',
          highlightNodes: ['user', 'fn-orderPayout'],
          highlightEdges: ['e-user-order'],
          durationMs: 1000,
        },
        {
          id: 'step-hold',
          description: 'erc2021.sim.orderPayoutWalkthrough.step.hold',
          mobileDescription: 'erc2021.sim.orderPayoutWalkthrough.step.hold.mobile',
          highlightNodes: ['fn-orderPayout', 'erc2021-contract', 'storage-payouts'],
          highlightEdges: ['e-order-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-payouts._payouts[PAYOUT-001]': 'Nonexistent → Ordered',
            'storage-payouts._heldBalance[0xWalletOwner]': '0 → 100e18',
          },
          durationMs: 1200,
        },
        {
          id: 'step-execute',
          description: 'erc2021.sim.orderPayoutWalkthrough.step.execute',
          mobileDescription: 'erc2021.sim.orderPayoutWalkthrough.step.execute.mobile',
          highlightNodes: ['operator', 'fn-executePayout', 'erc2021-contract'],
          highlightEdges: ['e-operator-execute', 'e-execute-contract'],
          valueChanges: {
            'storage-payouts._payouts[PAYOUT-001]': 'Ordered → Executed',
            'storage-payouts._heldBalance[0xWalletOwner]': '100e18 → 0',
          },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc2021.sim.orderPayoutWalkthrough.step.event',
          mobileDescription: 'erc2021.sim.orderPayoutWalkthrough.step.event.mobile',
          highlightNodes: ['erc2021-contract', 'event-payoutExecuted'],
          highlightEdges: ['e-contract-event'],
          durationMs: 800,
        },
      ],
    },
  ],
};
