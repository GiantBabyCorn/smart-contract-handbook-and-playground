import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc3475',
  name: 'ERC-3475',
  shortDescription: 'erc3475.short',
  category: 'defi',
  entryType: 'standard',
  eipNumber: 3475,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-3475',
  relatedSlugs: ['erc1155', 'erc721', 'erc20', 'erc3525'],
  sortOrder: 13475,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20, 721, 1155],
  relations: [
    { slug: 'erc20', kind: 'requires' },
    { slug: 'erc721', kind: 'requires' },
    { slug: 'erc1155', kind: 'requires' },
    { slug: 'erc3525', kind: 'alternative' },
  ],
  references: [
    { label: 'ERC-3475 Specification', url: 'https://eips.ethereum.org/EIPS/eip-3475', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc3475.introduction',
  designPurpose: 'erc3475.designPurpose',
  commonUsage: 'erc3475.commonUsage',

  functions: [
    {
      name: 'transferFrom',
      signature: 'transferFrom(address from, address to, Transaction[] transactions)',
      type: 'write',
      params: [
        { name: 'from', type: 'address', description: 'erc3475.fn.transferFrom.params.from' },
        { name: 'to', type: 'address', description: 'erc3475.fn.transferFrom.params.to' },
        { name: 'transactions', type: 'Transaction[]', description: 'erc3475.fn.transferFrom.params.transactions' },
      ],
      description: 'erc3475.fn.transferFrom.desc',
      defaultSimValues: { from: '0xHolder', to: '0xBuyer', transactions: '[(1, 14, 500)]' },
    },
    {
      name: 'issue',
      signature: 'issue(address to, Transaction[] transaction)',
      type: 'write',
      params: [
        { name: 'to', type: 'address', description: 'erc3475.fn.issue.params.to' },
        { name: 'transaction', type: 'Transaction[]', description: 'erc3475.fn.issue.params.transaction' },
      ],
      description: 'erc3475.fn.issue.desc',
      defaultSimValues: { to: '0xHolder', transaction: '[(1, 14, 500)]' },
    },
    {
      name: 'redeem',
      signature: 'redeem(address from, Transaction[] transactions)',
      type: 'write',
      params: [
        { name: 'from', type: 'address', description: 'erc3475.fn.redeem.params.from' },
        { name: 'transactions', type: 'Transaction[]', description: 'erc3475.fn.redeem.params.transactions' },
      ],
      description: 'erc3475.fn.redeem.desc',
      defaultSimValues: { from: '0xHolder', transactions: '[(1, 14, 500)]' },
    },
    {
      name: 'burn',
      signature: 'burn(address from, Transaction[] transactions)',
      type: 'write',
      params: [
        { name: 'from', type: 'address', description: 'erc3475.fn.burn.params.from' },
        { name: 'transactions', type: 'Transaction[]', description: 'erc3475.fn.burn.params.transactions' },
      ],
      description: 'erc3475.fn.burn.desc',
      defaultSimValues: { from: '0xHolder', transactions: '[(1, 14, 500)]' },
    },
    {
      name: 'approve',
      signature: 'approve(address spender, Transaction[] transactions)',
      type: 'write',
      params: [
        { name: 'spender', type: 'address', description: 'erc3475.fn.approve.params.spender' },
        { name: 'transactions', type: 'Transaction[]', description: 'erc3475.fn.approve.params.transactions' },
      ],
      description: 'erc3475.fn.approve.desc',
      defaultSimValues: { spender: '0xSpender', transactions: '[(1, 14, 500)]' },
    },
    {
      name: 'setApprovalFor',
      signature: 'setApprovalFor(address operator, bool approved) → bool approved',
      type: 'write',
      params: [
        { name: 'operator', type: 'address', description: 'erc3475.fn.setApprovalFor.params.operator' },
        { name: 'approved', type: 'bool', description: 'erc3475.fn.setApprovalFor.params.approved' },
      ],
      returns: [{ name: 'approved', type: 'bool', description: 'erc3475.fn.setApprovalFor.returns.approved' }],
      description: 'erc3475.fn.setApprovalFor.desc',
      defaultSimValues: { operator: '0xMarketMaker', approved: 'true' },
    },
    {
      name: 'balanceOf',
      signature: 'balanceOf(address account, uint256 classId, uint256 nonceId) → uint256',
      type: 'read',
      params: [
        { name: 'account', type: 'address', description: 'erc3475.fn.balanceOf.params.account' },
        { name: 'classId', type: 'uint256', description: 'erc3475.fn.balanceOf.params.classId' },
        { name: 'nonceId', type: 'uint256', description: 'erc3475.fn.balanceOf.params.nonceId' },
      ],
      returns: [{ name: 'balance', type: 'uint256', description: 'erc3475.fn.balanceOf.returns.balance' }],
      description: 'erc3475.fn.balanceOf.desc',
      defaultSimValues: { account: '0xHolder', classId: '1', nonceId: '14' },
    },
    {
      name: 'Issue',
      signature: 'Issue(address indexed operator, address indexed to, Transaction[] transactions)',
      type: 'event',
      params: [
        { name: 'operator', type: 'address', description: 'erc3475.fn.Issue.params.operator' },
        { name: 'to', type: 'address', description: 'erc3475.fn.Issue.params.to' },
        { name: 'transactions', type: 'Transaction[]', description: 'erc3475.fn.Issue.params.transactions' },
      ],
      description: 'erc3475.fn.Issue.desc',
    },
    {
      name: 'Redeem',
      signature: 'Redeem(address indexed operator, address indexed from, Transaction[] transactions)',
      type: 'event',
      params: [
        { name: 'operator', type: 'address', description: 'erc3475.fn.Redeem.params.operator' },
        { name: 'from', type: 'address', description: 'erc3475.fn.Redeem.params.from' },
        { name: 'transactions', type: 'Transaction[]', description: 'erc3475.fn.Redeem.params.transactions' },
      ],
      description: 'erc3475.fn.Redeem.desc',
    },
    {
      name: 'Transfer',
      signature: 'Transfer(address indexed operator, address indexed from, address indexed to, Transaction[] transactions)',
      type: 'event',
      params: [
        { name: 'operator', type: 'address', description: 'erc3475.fn.Transfer.params.operator' },
        { name: 'from', type: 'address', description: 'erc3475.fn.Transfer.params.from' },
        { name: 'to', type: 'address', description: 'erc3475.fn.Transfer.params.to' },
        { name: 'transactions', type: 'Transaction[]', description: 'erc3475.fn.Transfer.params.transactions' },
      ],
      description: 'erc3475.fn.Transfer.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc3475.node.user',
      data: { address: '0xBank' },
      layoutHint: 'source',
    },
    {
      id: 'erc3475-contract',
      type: 'contract',
      label: 'erc3475.node.contract',
      data: {
        functions: ['transferFrom', 'issue', 'redeem', 'burn', 'approve', 'setApprovalFor', 'balanceOf'],
      },
      layoutHint: 'center',
    },
    {
      id: 'fn-issue',
      type: 'function',
      label: 'issue()',
      data: { fnType: 'write', signature: 'issue(address to, Transaction[] transaction)' },
    },
    {
      id: 'fn-redeem',
      type: 'function',
      label: 'redeem()',
      data: { fnType: 'write', signature: 'redeem(address from, Transaction[] transactions)' },
    },
    {
      id: 'storage-bonds',
      type: 'storage',
      label: 'erc3475.node.storageBonds',
      data: {
        slots: [
          { key: '_balances', label: 'mapping(classId => mapping(nonceId => mapping(address => uint256)))' },
          { key: '_activeSupply', label: 'mapping(classId => mapping(nonceId => uint256))' },
          { key: '_metadata', label: 'mapping(classId => Metadata)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'holder',
      type: 'user',
      label: 'erc3475.node.holder',
      data: { address: '0xHolder' },
      layoutHint: 'sink',
    },
    {
      id: 'event-issue',
      type: 'function',
      label: 'Issue event',
      data: { fnType: 'event', signature: 'Issue(address indexed operator, address indexed to, Transaction[] transactions)' },
    },
    {
      id: 'event-redeem',
      type: 'function',
      label: 'Redeem event',
      data: { fnType: 'event', signature: 'Redeem(address indexed operator, address indexed from, Transaction[] transactions)' },
    },
  ],

  flowEdges: [
    { id: 'e-user-issue', source: 'user', target: 'fn-issue', type: 'animated', label: 'erc3475.edge.callIssue' },
    { id: 'e-issue-contract', source: 'fn-issue', target: 'erc3475-contract', type: 'animated' },
    { id: 'e-user-redeem', source: 'user', target: 'fn-redeem', type: 'animated', label: 'erc3475.edge.callRedeem' },
    { id: 'e-redeem-contract', source: 'fn-redeem', target: 'erc3475-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc3475-contract', target: 'storage-bonds', type: 'labeled', label: 'erc3475.edge.updateBonds' },
    { id: 'e-contract-holder', source: 'erc3475-contract', target: 'holder', type: 'fundFlow', label: 'erc3475.edge.bondsIssued' },
    { id: 'e-contract-event-issue', source: 'erc3475-contract', target: 'event-issue', type: 'labeled', label: 'erc3475.edge.emitIssue' },
    { id: 'e-contract-event-redeem', source: 'erc3475-contract', target: 'event-redeem', type: 'labeled', label: 'erc3475.edge.emitRedeem' },
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
      id: 'issue-bond-walkthrough',
      name: 'erc3475.sim.issueBondWalkthrough.name',
      description: 'erc3475.sim.issueBondWalkthrough.desc',
      params: [
        {
          id: 'to',
          label: 'erc3475.sim.issueBondWalkthrough.param.to',
          type: 'address',
          defaultValue: '0xHolder',
        },
        {
          id: 'classId',
          label: 'erc3475.sim.issueBondWalkthrough.param.classId',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'amount',
          label: 'erc3475.sim.issueBondWalkthrough.param.amount',
          type: 'uint256',
          defaultValue: '500',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc3475.sim.issueBondWalkthrough.step.call',
          mobileDescription: 'erc3475.sim.issueBondWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-issue'],
          highlightEdges: ['e-user-issue'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc3475.sim.issueBondWalkthrough.step.execute',
          mobileDescription: 'erc3475.sim.issueBondWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-issue', 'erc3475-contract', 'storage-bonds'],
          highlightEdges: ['e-issue-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-bonds._balances[1][14][0xHolder]': '0 → 500',
            'storage-bonds._activeSupply[1][14]': '0 → 500',
          },
          durationMs: 1200,
        },
        {
          id: 'step-credit',
          description: 'erc3475.sim.issueBondWalkthrough.step.credit',
          mobileDescription: 'erc3475.sim.issueBondWalkthrough.step.credit.mobile',
          highlightNodes: ['erc3475-contract', 'holder'],
          highlightEdges: ['e-contract-holder'],
          durationMs: 900,
        },
        {
          id: 'step-event',
          description: 'erc3475.sim.issueBondWalkthrough.step.event',
          mobileDescription: 'erc3475.sim.issueBondWalkthrough.step.event.mobile',
          highlightNodes: ['erc3475-contract', 'event-issue'],
          highlightEdges: ['e-contract-event-issue'],
          durationMs: 800,
        },
      ],
    },
  ],
};
