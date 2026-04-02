import type { ProtocolEntry } from '../types';

export const entry: ProtocolEntry = {
  // ─── ERCMeta ───
  slug: 'eigenlayer',
  name: 'EigenLayer',
  shortDescription: 'eigenlayer.short',
  category: 'defi',
  entryType: 'protocol',
  officialUrl: 'https://eigenlayer.xyz',
  relatedSlugs: ['lido-steth', 'erc20', 'erc4626'],
  sortOrder: 3400,

  // ─── ERCContent ───
  introduction: 'eigenlayer.introduction',
  designPurpose: 'eigenlayer.designPurpose',
  commonUsage: 'eigenlayer.commonUsage',

  functions: [
    {
      name: 'depositIntoStrategy',
      signature: 'depositIntoStrategy(address strategy, address token, uint256 amount) → uint256 shares',
      type: 'write',
      params: [
        { name: 'strategy', type: 'address', description: 'eigenlayer.fn.depositIntoStrategy.params.strategy' },
        { name: 'token', type: 'address', description: 'eigenlayer.fn.depositIntoStrategy.params.token' },
        { name: 'amount', type: 'uint256', description: 'eigenlayer.fn.depositIntoStrategy.params.amount' },
      ],
      returns: [{ name: 'shares', type: 'uint256', description: 'eigenlayer.fn.depositIntoStrategy.returns.shares' }],
      description: 'eigenlayer.fn.depositIntoStrategy.desc',
      defaultSimValues: { strategy: '0xStrategyAddress', token: '0xstETH', amount: '1000000000000000000' },
    },
    {
      name: 'delegateTo',
      signature: 'delegateTo(address operator, tuple approverSignatureAndExpiry, bytes32 approverSalt)',
      type: 'write',
      params: [
        { name: 'operator', type: 'address', description: 'eigenlayer.fn.delegateTo.params.operator' },
        { name: 'approverSignatureAndExpiry', type: 'tuple', description: 'eigenlayer.fn.delegateTo.params.approverSignatureAndExpiry' },
        { name: 'approverSalt', type: 'bytes32', description: 'eigenlayer.fn.delegateTo.params.approverSalt' },
      ],
      description: 'eigenlayer.fn.delegateTo.desc',
      defaultSimValues: { operator: '0xOperatorAddress' },
    },
    {
      name: 'undelegate',
      signature: 'undelegate(address staker) → bytes32[] withdrawalRoots',
      type: 'write',
      params: [
        { name: 'staker', type: 'address', description: 'eigenlayer.fn.undelegate.params.staker' },
      ],
      returns: [{ name: 'withdrawalRoots', type: 'bytes32[]', description: 'eigenlayer.fn.undelegate.returns.withdrawalRoots' }],
      description: 'eigenlayer.fn.undelegate.desc',
      defaultSimValues: { staker: '0xStakerAddress' },
    },
    {
      name: 'completeQueuedWithdrawals',
      signature: 'completeQueuedWithdrawals(tuple[] withdrawals, address[][] tokens, uint256[] middlewareTimesIndexes, bool[] receiveAsTokens)',
      type: 'write',
      params: [
        { name: 'withdrawals', type: 'tuple[]', description: 'eigenlayer.fn.completeQueuedWithdrawals.params.withdrawals' },
        { name: 'tokens', type: 'address[][]', description: 'eigenlayer.fn.completeQueuedWithdrawals.params.tokens' },
        { name: 'middlewareTimesIndexes', type: 'uint256[]', description: 'eigenlayer.fn.completeQueuedWithdrawals.params.middlewareTimesIndexes' },
        { name: 'receiveAsTokens', type: 'bool[]', description: 'eigenlayer.fn.completeQueuedWithdrawals.params.receiveAsTokens' },
      ],
      description: 'eigenlayer.fn.completeQueuedWithdrawals.desc',
      defaultSimValues: {},
    },
    {
      name: 'getShares',
      signature: 'getDeposits(address staker) → (address[] strategies, uint256[] shares)',
      type: 'read',
      params: [
        { name: 'staker', type: 'address', description: 'eigenlayer.fn.getShares.params.staker' },
      ],
      returns: [
        { name: 'strategies', type: 'address[]', description: 'eigenlayer.fn.getShares.returns.strategies' },
        { name: 'shares', type: 'uint256[]', description: 'eigenlayer.fn.getShares.returns.shares' },
      ],
      description: 'eigenlayer.fn.getShares.desc',
      defaultSimValues: { staker: '0xStakerAddress' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'restaker',
      type: 'user',
      label: 'eigenlayer.node.restaker',
      data: { address: '0xRestaker', balance: '10 stETH' },
      layoutHint: 'source',
    },
    {
      id: 'strategy-manager',
      type: 'contract',
      label: 'eigenlayer.node.strategy-manager',
      data: { functions: ['depositIntoStrategy', 'getDeposits'] },
      layoutHint: 'center',
    },
    {
      id: 'delegation-manager',
      type: 'contract',
      label: 'eigenlayer.node.delegation-manager',
      data: { functions: ['delegateTo', 'undelegate', 'completeQueuedWithdrawals'] },
      layoutHint: 'center',
    },
    {
      id: 'strategy',
      type: 'contract',
      label: 'eigenlayer.node.strategy',
      data: { functions: ['deposit', 'withdraw', 'sharesToUnderlying'] },
    },
    {
      id: 'operator',
      type: 'user',
      label: 'eigenlayer.node.operator',
      data: { address: '0xOperator', balance: 'N delegators' },
    },
    {
      id: 'avs',
      type: 'contract',
      label: 'eigenlayer.node.avs',
      data: { functions: ['registerOperatorToAVS'] },
      layoutHint: 'sink',
    },
    {
      id: 'slasher',
      type: 'contract',
      label: 'eigenlayer.node.slasher',
      data: { functions: ['freezeOperator'] },
    },
    {
      id: 'withdrawal-queue',
      type: 'storage',
      label: 'eigenlayer.node.withdrawal-queue',
      data: {
        slots: [
          { key: 'withdrawalRoot', label: 'bytes32' },
          { key: 'withdrawer', label: 'address' },
          { key: 'nonce', label: 'uint96' },
        ],
      },
      layoutHint: 'storage',
    },
  ],

  flowEdges: [
    {
      id: 'e-restaker-stratmgr',
      source: 'restaker',
      target: 'strategy-manager',
      type: 'animated',
      label: 'eigenlayer.edge.depositIntoStrategy',
    },
    {
      id: 'e-stratmgr-strategy',
      source: 'strategy-manager',
      target: 'strategy',
      type: 'animated',
      label: 'eigenlayer.edge.depositTokens',
    },
    {
      id: 'e-restaker-delmgr',
      source: 'restaker',
      target: 'delegation-manager',
      type: 'animated',
      label: 'eigenlayer.edge.delegateTo',
    },
    {
      id: 'e-delmgr-operator',
      source: 'delegation-manager',
      target: 'operator',
      type: 'labeled',
      label: 'eigenlayer.edge.assignDelegate',
    },
    {
      id: 'e-operator-avs',
      source: 'operator',
      target: 'avs',
      type: 'animated',
      label: 'eigenlayer.edge.registerToAVS',
    },
    {
      id: 'e-delmgr-withdrawal',
      source: 'delegation-manager',
      target: 'withdrawal-queue',
      type: 'labeled',
      label: 'eigenlayer.edge.queueWithdrawal',
    },
    {
      id: 'e-slasher-operator',
      source: 'slasher',
      target: 'operator',
      type: 'labeled',
      label: 'eigenlayer.edge.slash',
    },
    {
      id: 'e-strategy-stratmgr',
      source: 'strategy',
      target: 'strategy-manager',
      type: 'labeled',
      label: 'eigenlayer.edge.returnShares',
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
      id: 'deposit-delegate-operator',
      name: 'eigenlayer.sim.deposit-delegate-operator.name',
      description: 'eigenlayer.sim.deposit-delegate-operator.desc',
      params: [
        {
          id: 'depositAmount',
          label: 'eigenlayer.sim.deposit-delegate-operator.param.depositAmount',
          type: 'uint256',
          defaultValue: '1000000000000000000',
        },
        {
          id: 'operatorAddress',
          label: 'eigenlayer.sim.deposit-delegate-operator.param.operatorAddress',
          type: 'address',
          defaultValue: '0xOperatorAddress',
        },
      ],
      steps: [
        {
          id: 'step-approve',
          description: 'eigenlayer.sim.deposit-delegate-operator.step.approve',
          mobileDescription: 'eigenlayer.sim.deposit-delegate-operator.step.approve.mobile',
          highlightNodes: ['restaker', 'strategy-manager'],
          highlightEdges: [],
          valueChanges: { 'strategy-manager.allowance': 'stETH approved for Strategy Manager' },
          durationMs: 1000,
        },
        {
          id: 'step-deposit',
          description: 'eigenlayer.sim.deposit-delegate-operator.step.deposit',
          mobileDescription: 'eigenlayer.sim.deposit-delegate-operator.step.deposit.mobile',
          highlightNodes: ['restaker', 'strategy-manager', 'strategy'],
          highlightEdges: ['e-restaker-stratmgr', 'e-stratmgr-strategy'],
          valueChanges: {
            'strategy.shares': '0 → 1e18 shares',
            'strategy-manager.stakerShares': '+1e18 stETH strategy shares',
          },
          durationMs: 1500,
        },
        {
          id: 'step-delegate',
          description: 'eigenlayer.sim.deposit-delegate-operator.step.delegate',
          mobileDescription: 'eigenlayer.sim.deposit-delegate-operator.step.delegate.mobile',
          highlightNodes: ['restaker', 'delegation-manager', 'operator'],
          highlightEdges: ['e-restaker-delmgr', 'e-delmgr-operator'],
          valueChanges: {
            'delegation-manager.delegatedTo': '0x0 → 0xOperator',
            'operator.delegatedShares': '+1e18 stETH shares',
          },
          durationMs: 1500,
        },
        {
          id: 'step-avs-register',
          description: 'eigenlayer.sim.deposit-delegate-operator.step.avsRegister',
          mobileDescription: 'eigenlayer.sim.deposit-delegate-operator.step.avsRegister.mobile',
          highlightNodes: ['operator', 'avs'],
          highlightEdges: ['e-operator-avs'],
          valueChanges: { 'avs.activeOperators': '+1 operator securing AVS' },
          durationMs: 1200,
        },
      ],
    },
  ],

  contracts: [
    {
      chain: 'Ethereum',
      address: '0x858646372CC42E1A627fcE94aa7A7033e7CF075A',
      label: 'Strategy Manager',
    },
  ],
};
