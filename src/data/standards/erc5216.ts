import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5216',
  name: 'ERC-5216',
  shortDescription: 'erc5216.short',
  category: 'token',
  entryType: 'standard',
  eipNumber: 5216,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5216',
  relatedSlugs: ['erc1155', 'erc20', 'erc721', 'erc165'],
  sortOrder: 15216,
  eipStatus: 'Last Call',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20, 165, 1155],
  relations: [
    { slug: 'erc1155', kind: 'extends' },
    { slug: 'erc165', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-5216 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5216', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5216.introduction',
  designPurpose: 'erc5216.designPurpose',
  commonUsage: 'erc5216.commonUsage',

  functions: [
    {
      name: 'approve',
      signature: 'approve(address operator, uint256 id, uint256 amount)',
      type: 'write',
      params: [
        { name: 'operator', type: 'address', description: 'erc5216.fn.approve.params.operator' },
        { name: 'id', type: 'uint256', description: 'erc5216.fn.approve.params.id' },
        { name: 'amount', type: 'uint256', description: 'erc5216.fn.approve.params.amount' },
      ],
      description: 'erc5216.fn.approve.desc',
      defaultSimValues: { operator: '0xMarketplace', id: '1', amount: '10' },
    },
    {
      name: 'allowance',
      signature: 'allowance(address account, address operator, uint256 id) → uint256',
      type: 'read',
      params: [
        { name: 'account', type: 'address', description: 'erc5216.fn.allowance.params.account' },
        { name: 'operator', type: 'address', description: 'erc5216.fn.allowance.params.operator' },
        { name: 'id', type: 'uint256', description: 'erc5216.fn.allowance.params.id' },
      ],
      returns: [{ name: 'amount', type: 'uint256', description: 'erc5216.fn.allowance.returns.amount' }],
      description: 'erc5216.fn.allowance.desc',
      defaultSimValues: { account: '0xOwner', operator: '0xMarketplace', id: '1' },
    },
    {
      name: 'Approval',
      signature: 'Approval(address indexed account, address indexed operator, uint256 id, uint256 amount)',
      type: 'event',
      params: [
        { name: 'account', type: 'address', description: 'erc5216.fn.Approval.params.account' },
        { name: 'operator', type: 'address', description: 'erc5216.fn.Approval.params.operator' },
        { name: 'id', type: 'uint256', description: 'erc5216.fn.Approval.params.id' },
        { name: 'amount', type: 'uint256', description: 'erc5216.fn.Approval.params.amount' },
      ],
      description: 'erc5216.fn.Approval.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5216.node.user',
      data: { address: '0xOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc5216-contract',
      type: 'contract',
      label: 'erc5216.node.contract',
      data: { functions: ['approve', 'allowance', 'safeTransferFrom'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-approve',
      type: 'function',
      label: 'approve()',
      data: { fnType: 'write', signature: 'approve(address operator, uint256 id, uint256 amount)' },
    },
    {
      id: 'storage-allowances',
      type: 'storage',
      label: 'erc5216.node.storageAllowances',
      data: {
        slots: [
          { key: '_allowances', label: 'mapping(address => mapping(address => mapping(uint256 => uint256)))' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'operator',
      type: 'user',
      label: 'erc5216.node.operator',
      data: { address: '0xMarketplace' },
      layoutHint: 'sink',
    },
    {
      id: 'event-approval',
      type: 'function',
      label: 'Approval event',
      data: { fnType: 'event', signature: 'Approval(address indexed account, address indexed operator, uint256 id, uint256 amount)' },
    },
  ],

  flowEdges: [
    { id: 'e-user-approve', source: 'user', target: 'fn-approve', type: 'animated', label: 'erc5216.edge.callApprove' },
    { id: 'e-approve-contract', source: 'fn-approve', target: 'erc5216-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc5216-contract', target: 'storage-allowances', type: 'labeled', label: 'erc5216.edge.updateAllowance' },
    { id: 'e-contract-event', source: 'erc5216-contract', target: 'event-approval', type: 'labeled', label: 'erc5216.edge.emitApproval' },
    { id: 'e-contract-operator', source: 'erc5216-contract', target: 'operator', type: 'labeled', label: 'erc5216.edge.grantAllowance' },
    { id: 'e-operator-contract', source: 'operator', target: 'erc5216-contract', type: 'animated', label: 'erc5216.edge.spendAllowance' },
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
      id: 'approve-walkthrough',
      name: 'erc5216.sim.approveWalkthrough.name',
      description: 'erc5216.sim.approveWalkthrough.desc',
      params: [
        {
          id: 'operator',
          label: 'erc5216.sim.approveWalkthrough.param.operator',
          type: 'address',
          defaultValue: '0xMarketplace',
        },
        {
          id: 'id',
          label: 'erc5216.sim.approveWalkthrough.param.id',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'amount',
          label: 'erc5216.sim.approveWalkthrough.param.amount',
          type: 'uint256',
          defaultValue: '10',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5216.sim.approveWalkthrough.step.call',
          mobileDescription: 'erc5216.sim.approveWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-approve'],
          highlightEdges: ['e-user-approve'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc5216.sim.approveWalkthrough.step.execute',
          mobileDescription: 'erc5216.sim.approveWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-approve', 'erc5216-contract', 'storage-allowances'],
          highlightEdges: ['e-approve-contract', 'e-contract-storage'],
          valueChanges: { 'storage-allowances._allowances[0xOwner][0xMarketplace][1]': '0 → 10' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc5216.sim.approveWalkthrough.step.event',
          mobileDescription: 'erc5216.sim.approveWalkthrough.step.event.mobile',
          highlightNodes: ['erc5216-contract', 'operator', 'event-approval'],
          highlightEdges: ['e-contract-operator', 'e-contract-event'],
          durationMs: 800,
        },
        {
          id: 'step-spend',
          description: 'erc5216.sim.approveWalkthrough.step.spend',
          mobileDescription: 'erc5216.sim.approveWalkthrough.step.spend.mobile',
          highlightNodes: ['operator', 'erc5216-contract', 'storage-allowances'],
          highlightEdges: ['e-operator-contract', 'e-contract-storage'],
          valueChanges: { 'storage-allowances._allowances[0xOwner][0xMarketplace][1]': '10 → 7 (3 spent)' },
          durationMs: 1000,
        },
      ],
    },
  ],
};
