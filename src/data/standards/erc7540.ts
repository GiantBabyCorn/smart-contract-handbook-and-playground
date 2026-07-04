import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7540',
  name: 'ERC-7540',
  shortDescription: 'erc7540.short',
  category: 'defi',
  entryType: 'standard',
  eipNumber: 7540,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7540',
  relatedSlugs: ['erc4626', 'erc20', 'erc165', 'erc1155'],
  sortOrder: 17540,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20, 165, 4626, 7575],
  relations: [
    { slug: 'erc4626', kind: 'extends' },
    { slug: 'erc20', kind: 'requires' },
    { slug: 'erc165', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-7540 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7540', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7540.introduction',
  designPurpose: 'erc7540.designPurpose',
  commonUsage: 'erc7540.commonUsage',

  functions: [
    {
      name: 'requestDeposit',
      signature: 'requestDeposit(uint256 assets, address controller, address owner) → uint256',
      type: 'write',
      params: [
        { name: 'assets', type: 'uint256', description: 'erc7540.fn.requestDeposit.params.assets' },
        { name: 'controller', type: 'address', description: 'erc7540.fn.requestDeposit.params.controller' },
        { name: 'owner', type: 'address', description: 'erc7540.fn.requestDeposit.params.owner' },
      ],
      returns: [{ name: 'requestId', type: 'uint256', description: 'erc7540.fn.requestDeposit.returns.requestId' }],
      description: 'erc7540.fn.requestDeposit.desc',
      defaultSimValues: { assets: '1000000000000000000000', controller: '0xUser', owner: '0xUser' },
    },
    {
      name: 'pendingDepositRequest',
      signature: 'pendingDepositRequest(uint256 requestId, address controller) → uint256',
      type: 'read',
      params: [
        { name: 'requestId', type: 'uint256', description: 'erc7540.fn.pendingDepositRequest.params.requestId' },
        { name: 'controller', type: 'address', description: 'erc7540.fn.pendingDepositRequest.params.controller' },
      ],
      returns: [{ name: 'assets', type: 'uint256', description: 'erc7540.fn.pendingDepositRequest.returns.assets' }],
      description: 'erc7540.fn.pendingDepositRequest.desc',
      defaultSimValues: { requestId: '0', controller: '0xUser' },
    },
    {
      name: 'claimableDepositRequest',
      signature: 'claimableDepositRequest(uint256 requestId, address controller) → uint256',
      type: 'read',
      params: [
        { name: 'requestId', type: 'uint256', description: 'erc7540.fn.claimableDepositRequest.params.requestId' },
        { name: 'controller', type: 'address', description: 'erc7540.fn.claimableDepositRequest.params.controller' },
      ],
      returns: [{ name: 'assets', type: 'uint256', description: 'erc7540.fn.claimableDepositRequest.returns.assets' }],
      description: 'erc7540.fn.claimableDepositRequest.desc',
      defaultSimValues: { requestId: '0', controller: '0xUser' },
    },
    {
      name: 'requestRedeem',
      signature: 'requestRedeem(uint256 shares, address controller, address owner) → uint256',
      type: 'write',
      params: [
        { name: 'shares', type: 'uint256', description: 'erc7540.fn.requestRedeem.params.shares' },
        { name: 'controller', type: 'address', description: 'erc7540.fn.requestRedeem.params.controller' },
        { name: 'owner', type: 'address', description: 'erc7540.fn.requestRedeem.params.owner' },
      ],
      returns: [{ name: 'requestId', type: 'uint256', description: 'erc7540.fn.requestRedeem.returns.requestId' }],
      description: 'erc7540.fn.requestRedeem.desc',
      defaultSimValues: { shares: '1000000000000000000000', controller: '0xUser', owner: '0xUser' },
    },
    {
      name: 'pendingRedeemRequest',
      signature: 'pendingRedeemRequest(uint256 requestId, address controller) → uint256',
      type: 'read',
      params: [
        { name: 'requestId', type: 'uint256', description: 'erc7540.fn.pendingRedeemRequest.params.requestId' },
        { name: 'controller', type: 'address', description: 'erc7540.fn.pendingRedeemRequest.params.controller' },
      ],
      returns: [{ name: 'shares', type: 'uint256', description: 'erc7540.fn.pendingRedeemRequest.returns.shares' }],
      description: 'erc7540.fn.pendingRedeemRequest.desc',
      defaultSimValues: { requestId: '0', controller: '0xUser' },
    },
    {
      name: 'claimableRedeemRequest',
      signature: 'claimableRedeemRequest(uint256 requestId, address controller) → uint256',
      type: 'read',
      params: [
        { name: 'requestId', type: 'uint256', description: 'erc7540.fn.claimableRedeemRequest.params.requestId' },
        { name: 'controller', type: 'address', description: 'erc7540.fn.claimableRedeemRequest.params.controller' },
      ],
      returns: [{ name: 'shares', type: 'uint256', description: 'erc7540.fn.claimableRedeemRequest.returns.shares' }],
      description: 'erc7540.fn.claimableRedeemRequest.desc',
      defaultSimValues: { requestId: '0', controller: '0xUser' },
    },
    {
      name: 'setOperator',
      signature: 'setOperator(address operator, bool approved) → bool',
      type: 'write',
      params: [
        { name: 'operator', type: 'address', description: 'erc7540.fn.setOperator.params.operator' },
        { name: 'approved', type: 'bool', description: 'erc7540.fn.setOperator.params.approved' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc7540.fn.setOperator.returns.success' }],
      description: 'erc7540.fn.setOperator.desc',
      defaultSimValues: { operator: '0xOperator', approved: 'true' },
    },
    {
      name: 'deposit',
      signature: 'deposit(uint256 assets, address receiver, address controller) → uint256',
      type: 'write',
      params: [
        { name: 'assets', type: 'uint256', description: 'erc7540.fn.deposit.params.assets' },
        { name: 'receiver', type: 'address', description: 'erc7540.fn.deposit.params.receiver' },
        { name: 'controller', type: 'address', description: 'erc7540.fn.deposit.params.controller' },
      ],
      returns: [{ name: 'shares', type: 'uint256', description: 'erc7540.fn.deposit.returns.shares' }],
      description: 'erc7540.fn.deposit.desc',
      defaultSimValues: { assets: '1000000000000000000000', receiver: '0xUser', controller: '0xUser' },
    },
    {
      name: 'DepositRequest',
      signature:
        'DepositRequest(address indexed controller, address indexed owner, uint256 indexed requestId, address sender, uint256 assets)',
      type: 'event',
      params: [
        { name: 'controller', type: 'address', description: 'erc7540.fn.DepositRequest.params.controller' },
        { name: 'owner', type: 'address', description: 'erc7540.fn.DepositRequest.params.owner' },
        { name: 'requestId', type: 'uint256', description: 'erc7540.fn.DepositRequest.params.requestId' },
        { name: 'sender', type: 'address', description: 'erc7540.fn.DepositRequest.params.sender' },
        { name: 'assets', type: 'uint256', description: 'erc7540.fn.DepositRequest.params.assets' },
      ],
      description: 'erc7540.fn.DepositRequest.desc',
    },
    {
      name: 'RedeemRequest',
      signature:
        'RedeemRequest(address indexed controller, address indexed owner, uint256 indexed requestId, address sender, uint256 shares)',
      type: 'event',
      params: [
        { name: 'controller', type: 'address', description: 'erc7540.fn.RedeemRequest.params.controller' },
        { name: 'owner', type: 'address', description: 'erc7540.fn.RedeemRequest.params.owner' },
        { name: 'requestId', type: 'uint256', description: 'erc7540.fn.RedeemRequest.params.requestId' },
        { name: 'sender', type: 'address', description: 'erc7540.fn.RedeemRequest.params.sender' },
        { name: 'shares', type: 'uint256', description: 'erc7540.fn.RedeemRequest.params.shares' },
      ],
      description: 'erc7540.fn.RedeemRequest.desc',
    },
    {
      name: 'OperatorSet',
      signature: 'OperatorSet(address indexed controller, address indexed operator, bool approved)',
      type: 'event',
      params: [
        { name: 'controller', type: 'address', description: 'erc7540.fn.OperatorSet.params.controller' },
        { name: 'operator', type: 'address', description: 'erc7540.fn.OperatorSet.params.operator' },
        { name: 'approved', type: 'bool', description: 'erc7540.fn.OperatorSet.params.approved' },
      ],
      description: 'erc7540.fn.OperatorSet.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc7540.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'erc7540-contract',
      type: 'contract',
      label: 'erc7540.node.contract',
      data: {
        functions: ['requestDeposit', 'requestRedeem', 'deposit', 'setOperator', 'pendingDepositRequest', 'claimableDepositRequest'],
      },
      layoutHint: 'center',
    },
    {
      id: 'fn-requestDeposit',
      type: 'function',
      label: 'requestDeposit()',
      data: { fnType: 'write', signature: 'requestDeposit(uint256 assets, address controller, address owner) → uint256' },
    },
    {
      id: 'fn-deposit',
      type: 'function',
      label: 'deposit()',
      data: { fnType: 'write', signature: 'deposit(uint256 assets, address receiver, address controller) → uint256' },
    },
    {
      id: 'storage-requests',
      type: 'storage',
      label: 'erc7540.node.storageRequests',
      data: {
        slots: [
          { key: 'pendingDepositRequest', label: 'mapping(address => uint256)' },
          { key: 'claimableDepositRequest', label: 'mapping(address => uint256)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-depositRequest',
      type: 'function',
      label: 'DepositRequest event',
      data: {
        fnType: 'event',
        signature:
          'DepositRequest(address indexed controller, address indexed owner, uint256 indexed requestId, address sender, uint256 assets)',
      },
    },
  ],

  flowEdges: [
    {
      id: 'e-user-requestDeposit',
      source: 'user',
      target: 'fn-requestDeposit',
      type: 'animated',
      label: 'erc7540.edge.callRequestDeposit',
    },
    {
      id: 'e-requestDeposit-contract',
      source: 'fn-requestDeposit',
      target: 'erc7540-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc7540-contract',
      target: 'storage-requests',
      type: 'labeled',
      label: 'erc7540.edge.updateRequests',
    },
    {
      id: 'e-contract-event',
      source: 'erc7540-contract',
      target: 'event-depositRequest',
      type: 'labeled',
      label: 'erc7540.edge.emitDepositRequest',
    },
    {
      id: 'e-user-deposit',
      source: 'user',
      target: 'fn-deposit',
      type: 'animated',
      label: 'erc7540.edge.callDeposit',
    },
    {
      id: 'e-deposit-contract',
      source: 'fn-deposit',
      target: 'erc7540-contract',
      type: 'animated',
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
      id: 'request-deposit-walkthrough',
      name: 'erc7540.sim.requestDepositWalkthrough.name',
      description: 'erc7540.sim.requestDepositWalkthrough.desc',
      params: [
        {
          id: 'assets',
          label: 'erc7540.sim.requestDepositWalkthrough.param.assets',
          type: 'uint256',
          defaultValue: '1000000000000000000000',
        },
        {
          id: 'controller',
          label: 'erc7540.sim.requestDepositWalkthrough.param.controller',
          type: 'address',
          defaultValue: '0xUser',
        },
      ],
      steps: [
        {
          id: 'step-request',
          description: 'erc7540.sim.requestDepositWalkthrough.step.request',
          mobileDescription: 'erc7540.sim.requestDepositWalkthrough.step.request.mobile',
          highlightNodes: ['user', 'fn-requestDeposit'],
          highlightEdges: ['e-user-requestDeposit'],
          durationMs: 1000,
        },
        {
          id: 'step-pending',
          description: 'erc7540.sim.requestDepositWalkthrough.step.pending',
          mobileDescription: 'erc7540.sim.requestDepositWalkthrough.step.pending.mobile',
          highlightNodes: ['fn-requestDeposit', 'erc7540-contract', 'storage-requests'],
          highlightEdges: ['e-requestDeposit-contract', 'e-contract-storage'],
          valueChanges: { 'storage-requests.pendingDepositRequest[0xUser]': '0 → 1000e18' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc7540.sim.requestDepositWalkthrough.step.event',
          mobileDescription: 'erc7540.sim.requestDepositWalkthrough.step.event.mobile',
          highlightNodes: ['erc7540-contract', 'event-depositRequest'],
          highlightEdges: ['e-contract-event'],
          valueChanges: { 'event-depositRequest.lastEvent': 'DepositRequest(0xUser, 0xUser, 0, 0xUser, 1000e18)' },
          durationMs: 800,
        },
        {
          id: 'step-claim',
          description: 'erc7540.sim.requestDepositWalkthrough.step.claim',
          mobileDescription: 'erc7540.sim.requestDepositWalkthrough.step.claim.mobile',
          highlightNodes: ['user', 'fn-deposit', 'erc7540-contract', 'storage-requests'],
          highlightEdges: ['e-user-deposit', 'e-deposit-contract', 'e-contract-storage'],
          valueChanges: { 'storage-requests.claimableDepositRequest[0xUser]': '1000e18 → 0' },
          durationMs: 1200,
        },
      ],
    },
  ],
};
