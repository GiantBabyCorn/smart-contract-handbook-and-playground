import type { ProtocolEntry } from '../types';

export const entry: ProtocolEntry = {
  // ─── ERCMeta ───
  slug: 'uniswap-v4',
  name: 'Uniswap V4',
  shortDescription: 'uniswap-v4.short',
  category: 'defi',
  entryType: 'protocol',
  officialUrl: 'https://blog.uniswap.org/uniswap-v4',
  relatedSlugs: ['uniswap-v2', 'uniswap-v3', 'erc20'],
  sortOrder: 2500,

  // ─── ERCContent ───
  introduction: 'uniswap-v4.introduction',
  designPurpose: 'uniswap-v4.designPurpose',
  commonUsage: 'uniswap-v4.commonUsage',

  functions: [
    {
      name: 'swap',
      signature: 'swap(PoolKey memory key, IPoolManager.SwapParams memory params, bytes calldata hookData) → BalanceDelta',
      type: 'write',
      params: [
        { name: 'key', type: 'PoolKey', description: 'uniswap-v4.fn.swap.params.key' },
        { name: 'params', type: 'SwapParams', description: 'uniswap-v4.fn.swap.params.params' },
        { name: 'hookData', type: 'bytes', description: 'uniswap-v4.fn.swap.params.hookData' },
      ],
      returns: [{ name: 'delta', type: 'BalanceDelta', description: 'uniswap-v4.fn.swap.returns.delta' }],
      description: 'uniswap-v4.fn.swap.desc',
      defaultSimValues: { hookData: '0x' },
    },
    {
      name: 'modifyPosition',
      signature: 'modifyPosition(PoolKey memory key, IPoolManager.ModifyPositionParams memory params, bytes calldata hookData) → BalanceDelta',
      type: 'write',
      params: [
        { name: 'key', type: 'PoolKey', description: 'uniswap-v4.fn.modifyPosition.params.key' },
        { name: 'tickLower', type: 'int24', description: 'uniswap-v4.fn.modifyPosition.params.tickLower' },
        { name: 'tickUpper', type: 'int24', description: 'uniswap-v4.fn.modifyPosition.params.tickUpper' },
        { name: 'liquidityDelta', type: 'int256', description: 'uniswap-v4.fn.modifyPosition.params.liquidityDelta' },
        { name: 'hookData', type: 'bytes', description: 'uniswap-v4.fn.modifyPosition.params.hookData' },
      ],
      returns: [{ name: 'delta', type: 'BalanceDelta', description: 'uniswap-v4.fn.modifyPosition.returns.delta' }],
      description: 'uniswap-v4.fn.modifyPosition.desc',
      defaultSimValues: { tickLower: '-60', tickUpper: '60', liquidityDelta: '1000000000000000000', hookData: '0x' },
    },
    {
      name: 'initialize',
      signature: 'initialize(PoolKey memory key, uint160 sqrtPriceX96, bytes calldata hookData) → int24 tick',
      type: 'write',
      params: [
        { name: 'key', type: 'PoolKey', description: 'uniswap-v4.fn.initialize.params.key' },
        { name: 'sqrtPriceX96', type: 'uint160', description: 'uniswap-v4.fn.initialize.params.sqrtPriceX96' },
        { name: 'hookData', type: 'bytes', description: 'uniswap-v4.fn.initialize.params.hookData' },
      ],
      returns: [{ name: 'tick', type: 'int24', description: 'uniswap-v4.fn.initialize.returns.tick' }],
      description: 'uniswap-v4.fn.initialize.desc',
      defaultSimValues: { sqrtPriceX96: '79228162514264337593543950336', hookData: '0x' },
    },
    {
      name: 'donate',
      signature: 'donate(PoolKey memory key, uint256 amount0, uint256 amount1, bytes calldata hookData) → BalanceDelta',
      type: 'write',
      params: [
        { name: 'key', type: 'PoolKey', description: 'uniswap-v4.fn.donate.params.key' },
        { name: 'amount0', type: 'uint256', description: 'uniswap-v4.fn.donate.params.amount0' },
        { name: 'amount1', type: 'uint256', description: 'uniswap-v4.fn.donate.params.amount1' },
        { name: 'hookData', type: 'bytes', description: 'uniswap-v4.fn.donate.params.hookData' },
      ],
      returns: [{ name: 'delta', type: 'BalanceDelta', description: 'uniswap-v4.fn.donate.returns.delta' }],
      description: 'uniswap-v4.fn.donate.desc',
      defaultSimValues: { amount0: '1000000000000000000', amount1: '0', hookData: '0x' },
    },
    {
      name: 'beforeSwap',
      signature: 'beforeSwap(address sender, PoolKey calldata key, IPoolManager.SwapParams calldata params, bytes calldata hookData) → bytes4',
      type: 'write',
      params: [
        { name: 'sender', type: 'address', description: 'uniswap-v4.fn.beforeSwap.params.sender' },
        { name: 'key', type: 'PoolKey', description: 'uniswap-v4.fn.beforeSwap.params.key' },
        { name: 'params', type: 'SwapParams', description: 'uniswap-v4.fn.beforeSwap.params.params' },
        { name: 'hookData', type: 'bytes', description: 'uniswap-v4.fn.beforeSwap.params.hookData' },
      ],
      returns: [{ name: 'selector', type: 'bytes4', description: 'uniswap-v4.fn.beforeSwap.returns.selector' }],
      description: 'uniswap-v4.fn.beforeSwap.desc',
    },
    {
      name: 'afterSwap',
      signature: 'afterSwap(address sender, PoolKey calldata key, IPoolManager.SwapParams calldata params, BalanceDelta delta, bytes calldata hookData) → bytes4',
      type: 'write',
      params: [
        { name: 'sender', type: 'address', description: 'uniswap-v4.fn.afterSwap.params.sender' },
        { name: 'key', type: 'PoolKey', description: 'uniswap-v4.fn.afterSwap.params.key' },
        { name: 'params', type: 'SwapParams', description: 'uniswap-v4.fn.afterSwap.params.params' },
        { name: 'delta', type: 'BalanceDelta', description: 'uniswap-v4.fn.afterSwap.params.delta' },
        { name: 'hookData', type: 'bytes', description: 'uniswap-v4.fn.afterSwap.params.hookData' },
      ],
      returns: [{ name: 'selector', type: 'bytes4', description: 'uniswap-v4.fn.afterSwap.returns.selector' }],
      description: 'uniswap-v4.fn.afterSwap.desc',
    },
  ],

  // ─── Schema v2 content sections ───
  composes: [
    { erc: 6909, role: 'uniswap-v4.compose.erc6909.role' },
    { slug: 'erc20', role: 'uniswap-v4.compose.erc20.role' },
  ],

  references: [
    {
      label: 'Uniswap V4 docs — ERC-6909 claims',
      url: 'https://docs.uniswap.org/contracts/v4/concepts/erc6909',
      kind: 'spec',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'trader',
      type: 'user',
      label: 'uniswap-v4.node.trader',
      data: { address: '0xTrader', balance: '1 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'pool-manager',
      type: 'contract',
      label: 'uniswap-v4.node.poolManager',
      data: { functions: ['swap', 'modifyPosition', 'initialize', 'donate'] },
      layoutHint: 'center',
    },
    {
      id: 'pool',
      type: 'contract',
      label: 'uniswap-v4.node.pool',
      data: { functions: ['swap', 'modifyPosition'] },
      layoutHint: 'center',
    },
    {
      id: 'hook-contract',
      type: 'contract',
      label: 'uniswap-v4.node.hookContract',
      data: { functions: ['beforeSwap', 'afterSwap', 'beforeModifyPosition', 'afterModifyPosition'] },
    },
    {
      id: 'liquidity-provider',
      type: 'user',
      label: 'uniswap-v4.node.liquidityProvider',
      data: { address: '0xLP', balance: '5 ETH' },
    },
    {
      id: 'flash-accounting',
      type: 'storage',
      label: 'uniswap-v4.node.flashAccounting',
      data: {
        slots: [
          { key: 'delta0', label: 'int256 (token0 net)' },
          { key: 'delta1', label: 'int256 (token1 net)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'token-a',
      type: 'tokenFlow',
      label: 'uniswap-v4.node.tokenA',
      data: { symbol: 'TOKEN-A', amount: '1000' },
    },
    {
      id: 'token-b',
      type: 'tokenFlow',
      label: 'uniswap-v4.node.tokenB',
      data: { symbol: 'TOKEN-B', amount: '3000' },
    },
  ],

  flowEdges: [
    {
      id: 'e-trader-poolManager',
      source: 'trader',
      target: 'pool-manager',
      type: 'animated',
      label: 'uniswap-v4.edge.callSwap',
    },
    {
      id: 'e-poolManager-hook-before',
      source: 'pool-manager',
      target: 'hook-contract',
      type: 'animated',
      label: 'uniswap-v4.edge.beforeSwapHook',
    },
    {
      id: 'e-poolManager-pool',
      source: 'pool-manager',
      target: 'pool',
      type: 'animated',
      label: 'uniswap-v4.edge.executeSwap',
    },
    {
      id: 'e-hook-poolManager-after',
      source: 'hook-contract',
      target: 'pool-manager',
      type: 'labeled',
      label: 'uniswap-v4.edge.afterSwapHook',
    },
    {
      id: 'e-poolManager-flashAccounting',
      source: 'pool-manager',
      target: 'flash-accounting',
      type: 'labeled',
      label: 'uniswap-v4.edge.trackDeltas',
    },
    {
      id: 'e-lp-poolManager',
      source: 'liquidity-provider',
      target: 'pool-manager',
      type: 'animated',
      label: 'uniswap-v4.edge.modifyPosition',
    },
    {
      id: 'e-trader-tokenA',
      source: 'trader',
      target: 'token-a',
      type: 'fundFlow',
      label: 'uniswap-v4.edge.tokenIn',
    },
    {
      id: 'e-pool-tokenB',
      source: 'pool',
      target: 'token-b',
      type: 'fundFlow',
    },
    {
      id: 'e-tokenB-trader',
      source: 'token-b',
      target: 'trader',
      type: 'fundFlow',
      label: 'uniswap-v4.edge.tokenOut',
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
      id: 'swap-with-hook-lifecycle',
      name: 'uniswap-v4.sim.swapWithHookLifecycle.name',
      description: 'uniswap-v4.sim.swapWithHookLifecycle.desc',
      params: [
        { id: 'amountIn', label: 'uniswap-v4.sim.swapWithHookLifecycle.param.amountIn', type: 'uint256', defaultValue: '1000000000000000000' },
        { id: 'hookData', label: 'uniswap-v4.sim.swapWithHookLifecycle.param.hookData', type: 'address', defaultValue: '0x' },
        { id: 'recipient', label: 'uniswap-v4.sim.swapWithHookLifecycle.param.recipient', type: 'address', defaultValue: '0xTrader' },
      ],
      steps: [
        {
          id: 'step-call-pool-manager',
          description: 'uniswap-v4.sim.swapWithHookLifecycle.step.callPoolManager',
          mobileDescription: 'uniswap-v4.sim.swapWithHookLifecycle.step.callPoolManager.mobile',
          highlightNodes: ['trader', 'pool-manager'],
          highlightEdges: ['e-trader-poolManager'],
          valueChanges: { 'pool-manager.lockAcquired': 'flash accounting lock acquired' },
          durationMs: 1200,
        },
        {
          id: 'step-before-swap-hook',
          description: 'uniswap-v4.sim.swapWithHookLifecycle.step.beforeSwapHook',
          mobileDescription: 'uniswap-v4.sim.swapWithHookLifecycle.step.beforeSwapHook.mobile',
          highlightNodes: ['pool-manager', 'hook-contract'],
          highlightEdges: ['e-poolManager-hook-before'],
          valueChanges: { 'hook-contract.beforeSwap': 'custom logic executed (e.g. TWAP check, fee override)' },
          durationMs: 1000,
        },
        {
          id: 'step-execute-swap',
          description: 'uniswap-v4.sim.swapWithHookLifecycle.step.executeSwap',
          mobileDescription: 'uniswap-v4.sim.swapWithHookLifecycle.step.executeSwap.mobile',
          highlightNodes: ['pool-manager', 'pool', 'flash-accounting'],
          highlightEdges: ['e-poolManager-pool', 'e-poolManager-flashAccounting'],
          valueChanges: {
            'pool.sqrtPriceX96': 'price updated',
            'flash-accounting.delta0': '+1e18 TOKEN-A owed',
            'flash-accounting.delta1': '-~2.99e18 TOKEN-B owed',
          },
          durationMs: 1500,
        },
        {
          id: 'step-after-swap-hook',
          description: 'uniswap-v4.sim.swapWithHookLifecycle.step.afterSwapHook',
          mobileDescription: 'uniswap-v4.sim.swapWithHookLifecycle.step.afterSwapHook.mobile',
          highlightNodes: ['hook-contract', 'pool-manager'],
          highlightEdges: ['e-hook-poolManager-after'],
          valueChanges: { 'hook-contract.afterSwap': 'post-swap logic executed (e.g. loyalty points, rebates)' },
          durationMs: 1000,
        },
        {
          id: 'step-settle-deltas',
          description: 'uniswap-v4.sim.swapWithHookLifecycle.step.settleDeltas',
          mobileDescription: 'uniswap-v4.sim.swapWithHookLifecycle.step.settleDeltas.mobile',
          highlightNodes: ['trader', 'token-a', 'token-b'],
          highlightEdges: ['e-trader-tokenA', 'e-pool-tokenB', 'e-tokenB-trader'],
          valueChanges: {
            'trader.tokenA': '-1 TOKEN-A settled',
            'trader.tokenB': '+~2.99 TOKEN-B received',
          },
          durationMs: 1200,
        },
      ],
    },
    {
      id: 'custom-hook-execution',
      name: 'uniswap-v4.sim.customHookExecution.name',
      description: 'uniswap-v4.sim.customHookExecution.desc',
      params: [
        { id: 'hookAddress', label: 'uniswap-v4.sim.customHookExecution.param.hookAddress', type: 'address', defaultValue: '0xHookContract' },
        { id: 'poolKey', label: 'uniswap-v4.sim.customHookExecution.param.poolKey', type: 'address', defaultValue: '0xPoolKey' },
      ],
      steps: [
        {
          id: 'step-initialize-pool',
          description: 'uniswap-v4.sim.customHookExecution.step.initializePool',
          mobileDescription: 'uniswap-v4.sim.customHookExecution.step.initializePool.mobile',
          highlightNodes: ['liquidity-provider', 'pool-manager', 'hook-contract'],
          highlightEdges: ['e-lp-poolManager', 'e-poolManager-hook-before'],
          valueChanges: { 'pool-manager.pools': 'new pool with hook registered at deterministic address' },
          durationMs: 1500,
        },
        {
          id: 'step-lp-modify-position',
          description: 'uniswap-v4.sim.customHookExecution.step.modifyPosition',
          mobileDescription: 'uniswap-v4.sim.customHookExecution.step.modifyPosition.mobile',
          highlightNodes: ['liquidity-provider', 'pool-manager', 'pool', 'token-a', 'token-b'],
          highlightEdges: ['e-lp-poolManager', 'e-poolManager-pool'],
          valueChanges: {
            'pool.liquidity': '0 → 1e18 (liquidity added)',
            'pool.token0Balance': '+1 TOKEN-A',
            'pool.token1Balance': '+3000 TOKEN-B',
          },
          durationMs: 1500,
        },
        {
          id: 'step-hook-callback',
          description: 'uniswap-v4.sim.customHookExecution.step.hookCallback',
          mobileDescription: 'uniswap-v4.sim.customHookExecution.step.hookCallback.mobile',
          highlightNodes: ['hook-contract', 'pool-manager', 'flash-accounting'],
          highlightEdges: ['e-hook-poolManager-after', 'e-poolManager-flashAccounting'],
          valueChanges: {
            'hook-contract.state': 'custom state updated (e.g. dynamic fee tiers applied)',
            'flash-accounting.delta0': 'net deltas resolved to zero',
          },
          durationMs: 1200,
        },
      ],
    },
  ],

  contracts: [
    { chain: 'Ethereum', address: '0x000000000004444c5dc75cB358380D2e3dE08A90', label: 'PoolManager' },
  ],
};
