import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1996',
  name: 'ERC-1996',
  shortDescription: 'erc1996.short',
  category: 'token',
  entryType: 'standard',
  eipNumber: 1996,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1996',
  relatedSlugs: ['erc20', 'erc3643', 'erc2612'],
  sortOrder: 11996,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20],
  relations: [{ slug: 'erc20', kind: 'extends' }],
  references: [
    { label: 'ERC-1996 Specification', url: 'https://eips.ethereum.org/EIPS/eip-1996', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc1996.introduction',
  designPurpose: 'erc1996.designPurpose',
  commonUsage: 'erc1996.commonUsage',

  functions: [
    {
      name: 'hold',
      signature: 'hold(string operationId, address to, address notary, uint256 value, uint256 timeToExpiration) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc1996.fn.hold.params.operationId' },
        { name: 'to', type: 'address', description: 'erc1996.fn.hold.params.to' },
        { name: 'notary', type: 'address', description: 'erc1996.fn.hold.params.notary' },
        { name: 'value', type: 'uint256', description: 'erc1996.fn.hold.params.value' },
        { name: 'timeToExpiration', type: 'uint256', description: 'erc1996.fn.hold.params.timeToExpiration' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc1996.fn.hold.returns.success' }],
      description: 'erc1996.fn.hold.desc',
      defaultSimValues: {
        operationId: 'HOLD-001',
        to: '0xPayee',
        notary: '0xNotary',
        value: '100000000000000000000',
        timeToExpiration: '86400',
      },
    },
    {
      name: 'holdFrom',
      signature: 'holdFrom(string operationId, address from, address to, address notary, uint256 value, uint256 timeToExpiration) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc1996.fn.holdFrom.params.operationId' },
        { name: 'from', type: 'address', description: 'erc1996.fn.holdFrom.params.from' },
        { name: 'to', type: 'address', description: 'erc1996.fn.holdFrom.params.to' },
        { name: 'notary', type: 'address', description: 'erc1996.fn.holdFrom.params.notary' },
        { name: 'value', type: 'uint256', description: 'erc1996.fn.holdFrom.params.value' },
        { name: 'timeToExpiration', type: 'uint256', description: 'erc1996.fn.holdFrom.params.timeToExpiration' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc1996.fn.holdFrom.returns.success' }],
      description: 'erc1996.fn.holdFrom.desc',
      defaultSimValues: {
        operationId: 'HOLD-002',
        from: '0xPayer',
        to: '0xPayee',
        notary: '0xNotary',
        value: '100000000000000000000',
        timeToExpiration: '86400',
      },
    },
    {
      name: 'releaseHold',
      signature: 'releaseHold(string operationId) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc1996.fn.releaseHold.params.operationId' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc1996.fn.releaseHold.returns.success' }],
      description: 'erc1996.fn.releaseHold.desc',
      defaultSimValues: { operationId: 'HOLD-001' },
    },
    {
      name: 'executeHold',
      signature: 'executeHold(string operationId, uint256 value) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc1996.fn.executeHold.params.operationId' },
        { name: 'value', type: 'uint256', description: 'erc1996.fn.executeHold.params.value' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc1996.fn.executeHold.returns.success' }],
      description: 'erc1996.fn.executeHold.desc',
      defaultSimValues: { operationId: 'HOLD-001', value: '100000000000000000000' },
    },
    {
      name: 'renewHold',
      signature: 'renewHold(string operationId, uint256 timeToExpiration) → bool',
      type: 'write',
      params: [
        { name: 'operationId', type: 'string', description: 'erc1996.fn.renewHold.params.operationId' },
        { name: 'timeToExpiration', type: 'uint256', description: 'erc1996.fn.renewHold.params.timeToExpiration' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc1996.fn.renewHold.returns.success' }],
      description: 'erc1996.fn.renewHold.desc',
      defaultSimValues: { operationId: 'HOLD-001', timeToExpiration: '172800' },
    },
    {
      name: 'authorizeHoldOperator',
      signature: 'authorizeHoldOperator(address operator) → bool',
      type: 'write',
      params: [
        { name: 'operator', type: 'address', description: 'erc1996.fn.authorizeHoldOperator.params.operator' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc1996.fn.authorizeHoldOperator.returns.success' }],
      description: 'erc1996.fn.authorizeHoldOperator.desc',
      defaultSimValues: { operator: '0xOperator' },
    },
    {
      name: 'balanceOnHold',
      signature: 'balanceOnHold(address account) → uint256',
      type: 'read',
      params: [
        { name: 'account', type: 'address', description: 'erc1996.fn.balanceOnHold.params.account' },
      ],
      returns: [{ name: 'heldBalance', type: 'uint256', description: 'erc1996.fn.balanceOnHold.returns.heldBalance' }],
      description: 'erc1996.fn.balanceOnHold.desc',
      defaultSimValues: { account: '0xPayer' },
    },
    {
      name: 'HoldCreated',
      signature: 'HoldCreated(address indexed holdIssuer, string operationId, address from, address to, address indexed notary, uint256 value, uint256 expiration)',
      type: 'event',
      params: [
        { name: 'holdIssuer', type: 'address', description: 'erc1996.fn.HoldCreated.params.holdIssuer' },
        { name: 'operationId', type: 'string', description: 'erc1996.fn.HoldCreated.params.operationId' },
        { name: 'from', type: 'address', description: 'erc1996.fn.HoldCreated.params.from' },
        { name: 'to', type: 'address', description: 'erc1996.fn.HoldCreated.params.to' },
        { name: 'notary', type: 'address', description: 'erc1996.fn.HoldCreated.params.notary' },
        { name: 'value', type: 'uint256', description: 'erc1996.fn.HoldCreated.params.value' },
        { name: 'expiration', type: 'uint256', description: 'erc1996.fn.HoldCreated.params.expiration' },
      ],
      description: 'erc1996.fn.HoldCreated.desc',
    },
    {
      name: 'HoldExecuted',
      signature: 'HoldExecuted(address indexed holdIssuer, string operationId, address indexed notary, uint256 heldValue, uint256 transferredValue)',
      type: 'event',
      params: [
        { name: 'holdIssuer', type: 'address', description: 'erc1996.fn.HoldExecuted.params.holdIssuer' },
        { name: 'operationId', type: 'string', description: 'erc1996.fn.HoldExecuted.params.operationId' },
        { name: 'notary', type: 'address', description: 'erc1996.fn.HoldExecuted.params.notary' },
        { name: 'heldValue', type: 'uint256', description: 'erc1996.fn.HoldExecuted.params.heldValue' },
        { name: 'transferredValue', type: 'uint256', description: 'erc1996.fn.HoldExecuted.params.transferredValue' },
      ],
      description: 'erc1996.fn.HoldExecuted.desc',
    },
    {
      name: 'HoldReleased',
      signature: 'HoldReleased(address indexed holdIssuer, string operationId, HoldStatusCode status)',
      type: 'event',
      params: [
        { name: 'holdIssuer', type: 'address', description: 'erc1996.fn.HoldReleased.params.holdIssuer' },
        { name: 'operationId', type: 'string', description: 'erc1996.fn.HoldReleased.params.operationId' },
        { name: 'status', type: 'HoldStatusCode', description: 'erc1996.fn.HoldReleased.params.status' },
      ],
      description: 'erc1996.fn.HoldReleased.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc1996.node.user',
      data: { address: '0xPayer', balance: '100 TOKEN' },
      layoutHint: 'source',
    },
    {
      id: 'notary',
      type: 'user',
      label: 'erc1996.node.notary',
      data: { address: '0xNotary' },
      layoutHint: 'source',
    },
    {
      id: 'erc1996-contract',
      type: 'contract',
      label: 'erc1996.node.contract',
      data: { functions: ['hold', 'holdFrom', 'releaseHold', 'executeHold', 'renewHold', 'balanceOnHold'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-hold',
      type: 'function',
      label: 'hold()',
      data: { fnType: 'write', signature: 'hold(string operationId, address to, address notary, uint256 value, uint256 timeToExpiration)' },
    },
    {
      id: 'fn-executeHold',
      type: 'function',
      label: 'executeHold()',
      data: { fnType: 'write', signature: 'executeHold(string operationId, uint256 value)' },
    },
    {
      id: 'storage-holds',
      type: 'storage',
      label: 'erc1996.node.storageHolds',
      data: {
        slots: [
          { key: '_holds', label: 'mapping(string => Hold)' },
          { key: '_heldBalance', label: 'mapping(address => uint256)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'payee',
      type: 'user',
      label: 'erc1996.node.payee',
      data: { address: '0xPayee' },
      layoutHint: 'sink',
    },
    {
      id: 'event-holdExecuted',
      type: 'function',
      label: 'HoldExecuted event',
      data: { fnType: 'event', signature: 'HoldExecuted(address indexed holdIssuer, string operationId, address indexed notary, uint256 heldValue, uint256 transferredValue)' },
    },
  ],

  flowEdges: [
    { id: 'e-user-hold', source: 'user', target: 'fn-hold', type: 'animated', label: 'erc1996.edge.callHold' },
    { id: 'e-hold-contract', source: 'fn-hold', target: 'erc1996-contract', type: 'animated' },
    { id: 'e-notary-execute', source: 'notary', target: 'fn-executeHold', type: 'animated', label: 'erc1996.edge.callExecuteHold' },
    { id: 'e-execute-contract', source: 'fn-executeHold', target: 'erc1996-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc1996-contract', target: 'storage-holds', type: 'labeled', label: 'erc1996.edge.updateHolds' },
    { id: 'e-contract-payee', source: 'erc1996-contract', target: 'payee', type: 'fundFlow', label: 'erc1996.edge.transferTokens' },
    { id: 'e-contract-event', source: 'erc1996-contract', target: 'event-holdExecuted', type: 'labeled', label: 'erc1996.edge.emitHoldExecuted' },
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
      id: 'hold-walkthrough',
      name: 'erc1996.sim.holdWalkthrough.name',
      description: 'erc1996.sim.holdWalkthrough.desc',
      params: [
        {
          id: 'to',
          label: 'erc1996.sim.holdWalkthrough.param.to',
          type: 'address',
          defaultValue: '0xPayee',
        },
        {
          id: 'notary',
          label: 'erc1996.sim.holdWalkthrough.param.notary',
          type: 'address',
          defaultValue: '0xNotary',
        },
        {
          id: 'value',
          label: 'erc1996.sim.holdWalkthrough.param.value',
          type: 'uint256',
          defaultValue: '100000000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-hold',
          description: 'erc1996.sim.holdWalkthrough.step.hold',
          mobileDescription: 'erc1996.sim.holdWalkthrough.step.hold.mobile',
          highlightNodes: ['user', 'fn-hold'],
          highlightEdges: ['e-user-hold'],
          durationMs: 1000,
        },
        {
          id: 'step-create',
          description: 'erc1996.sim.holdWalkthrough.step.create',
          mobileDescription: 'erc1996.sim.holdWalkthrough.step.create.mobile',
          highlightNodes: ['fn-hold', 'erc1996-contract', 'storage-holds'],
          highlightEdges: ['e-hold-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-holds._heldBalance[0xPayer]': '0 → 100e18',
            'storage-holds._holds[HOLD-001]': 'Nonexistent → Ordered',
          },
          durationMs: 1200,
        },
        {
          id: 'step-execute',
          description: 'erc1996.sim.holdWalkthrough.step.execute',
          mobileDescription: 'erc1996.sim.holdWalkthrough.step.execute.mobile',
          highlightNodes: ['notary', 'fn-executeHold', 'erc1996-contract', 'payee'],
          highlightEdges: ['e-notary-execute', 'e-execute-contract', 'e-contract-payee'],
          valueChanges: {
            'storage-holds._heldBalance[0xPayer]': '100e18 → 0',
            'storage-holds._holds[HOLD-001]': 'Ordered → Executed',
          },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc1996.sim.holdWalkthrough.step.event',
          mobileDescription: 'erc1996.sim.holdWalkthrough.step.event.mobile',
          highlightNodes: ['erc1996-contract', 'event-holdExecuted'],
          highlightEdges: ['e-contract-event'],
          durationMs: 800,
        },
      ],
    },
  ],
};
