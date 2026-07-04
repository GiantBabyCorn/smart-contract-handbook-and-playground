import type { ProtocolEntry } from '../types';

export const entry: ProtocolEntry = {
  // ─── ERCMeta ───
  slug: 'uniswap-v2',
  name: 'Uniswap V2',
  shortDescription: 'uniswap-v2.short',
  category: 'defi',
  entryType: 'protocol',
  officialUrl: 'https://v2.info.uniswap.org',
  relatedSlugs: ['uniswap-v3', 'uniswap-v4', 'erc20'],
  sortOrder: 2300,

  // ─── ERCContent ───
  introduction: 'uniswap-v2.introduction',
  designPurpose: 'uniswap-v2.designPurpose',
  commonUsage: 'uniswap-v2.commonUsage',

  functions: [
    {
      name: 'swapExactTokensForTokens',
      signature: 'swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) → uint256[]',
      type: 'write',
      params: [
        { name: 'amountIn', type: 'uint256', description: 'uniswap-v2.fn.swapExactTokensForTokens.params.amountIn' },
        { name: 'amountOutMin', type: 'uint256', description: 'uniswap-v2.fn.swapExactTokensForTokens.params.amountOutMin' },
        { name: 'path', type: 'address[]', description: 'uniswap-v2.fn.swapExactTokensForTokens.params.path' },
        { name: 'to', type: 'address', description: 'uniswap-v2.fn.swapExactTokensForTokens.params.to' },
        { name: 'deadline', type: 'uint256', description: 'uniswap-v2.fn.swapExactTokensForTokens.params.deadline' },
      ],
      returns: [{ name: 'amounts', type: 'uint256[]', description: 'uniswap-v2.fn.swapExactTokensForTokens.returns.amounts' }],
      description: 'uniswap-v2.fn.swapExactTokensForTokens.desc',
      defaultSimValues: { amountIn: '1000000000000000000', amountOutMin: '0', to: '0xTrader', deadline: '9999999999' },
    },
    {
      name: 'addLiquidity',
      signature: 'addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → (uint256, uint256, uint256)',
      type: 'write',
      params: [
        { name: 'tokenA', type: 'address', description: 'uniswap-v2.fn.addLiquidity.params.tokenA' },
        { name: 'tokenB', type: 'address', description: 'uniswap-v2.fn.addLiquidity.params.tokenB' },
        { name: 'amountADesired', type: 'uint256', description: 'uniswap-v2.fn.addLiquidity.params.amountADesired' },
        { name: 'amountBDesired', type: 'uint256', description: 'uniswap-v2.fn.addLiquidity.params.amountBDesired' },
        { name: 'amountAMin', type: 'uint256', description: 'uniswap-v2.fn.addLiquidity.params.amountAMin' },
        { name: 'amountBMin', type: 'uint256', description: 'uniswap-v2.fn.addLiquidity.params.amountBMin' },
        { name: 'to', type: 'address', description: 'uniswap-v2.fn.addLiquidity.params.to' },
        { name: 'deadline', type: 'uint256', description: 'uniswap-v2.fn.addLiquidity.params.deadline' },
      ],
      returns: [
        { name: 'amountA', type: 'uint256', description: 'uniswap-v2.fn.addLiquidity.returns.amountA' },
        { name: 'amountB', type: 'uint256', description: 'uniswap-v2.fn.addLiquidity.returns.amountB' },
        { name: 'liquidity', type: 'uint256', description: 'uniswap-v2.fn.addLiquidity.returns.liquidity' },
      ],
      description: 'uniswap-v2.fn.addLiquidity.desc',
      defaultSimValues: { amountADesired: '1000000000000000000', amountBDesired: '3000000000', amountAMin: '0', amountBMin: '0' },
    },
    {
      name: 'removeLiquidity',
      signature: 'removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → (uint256, uint256)',
      type: 'write',
      params: [
        { name: 'tokenA', type: 'address', description: 'uniswap-v2.fn.removeLiquidity.params.tokenA' },
        { name: 'tokenB', type: 'address', description: 'uniswap-v2.fn.removeLiquidity.params.tokenB' },
        { name: 'liquidity', type: 'uint256', description: 'uniswap-v2.fn.removeLiquidity.params.liquidity' },
        { name: 'amountAMin', type: 'uint256', description: 'uniswap-v2.fn.removeLiquidity.params.amountAMin' },
        { name: 'amountBMin', type: 'uint256', description: 'uniswap-v2.fn.removeLiquidity.params.amountBMin' },
        { name: 'to', type: 'address', description: 'uniswap-v2.fn.removeLiquidity.params.to' },
        { name: 'deadline', type: 'uint256', description: 'uniswap-v2.fn.removeLiquidity.params.deadline' },
      ],
      returns: [
        { name: 'amountA', type: 'uint256', description: 'uniswap-v2.fn.removeLiquidity.returns.amountA' },
        { name: 'amountB', type: 'uint256', description: 'uniswap-v2.fn.removeLiquidity.returns.amountB' },
      ],
      description: 'uniswap-v2.fn.removeLiquidity.desc',
      defaultSimValues: { liquidity: '500000000000000000', amountAMin: '0', amountBMin: '0' },
    },
    {
      name: 'getAmountsOut',
      signature: 'getAmountsOut(uint256 amountIn, address[] path) → uint256[]',
      type: 'read',
      params: [
        { name: 'amountIn', type: 'uint256', description: 'uniswap-v2.fn.getAmountsOut.params.amountIn' },
        { name: 'path', type: 'address[]', description: 'uniswap-v2.fn.getAmountsOut.params.path' },
      ],
      returns: [{ name: 'amounts', type: 'uint256[]', description: 'uniswap-v2.fn.getAmountsOut.returns.amounts' }],
      description: 'uniswap-v2.fn.getAmountsOut.desc',
      defaultSimValues: { amountIn: '1000000000000000000' },
    },
    {
      name: 'getReserves',
      signature: 'getReserves() → (uint112, uint112, uint32)',
      type: 'read',
      params: [],
      returns: [
        { name: 'reserve0', type: 'uint112', description: 'uniswap-v2.fn.getReserves.returns.reserve0' },
        { name: 'reserve1', type: 'uint112', description: 'uniswap-v2.fn.getReserves.returns.reserve1' },
        { name: 'blockTimestampLast', type: 'uint32', description: 'uniswap-v2.fn.getReserves.returns.blockTimestampLast' },
      ],
      description: 'uniswap-v2.fn.getReserves.desc',
      defaultSimValues: {},
    },
    {
      name: 'Swap',
      signature: 'Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)',
      type: 'event',
      params: [
        { name: 'sender', type: 'address', description: 'uniswap-v2.fn.Swap.params.sender' },
        { name: 'amount0In', type: 'uint256', description: 'uniswap-v2.fn.Swap.params.amount0In' },
        { name: 'amount1In', type: 'uint256', description: 'uniswap-v2.fn.Swap.params.amount1In' },
        { name: 'amount0Out', type: 'uint256', description: 'uniswap-v2.fn.Swap.params.amount0Out' },
        { name: 'amount1Out', type: 'uint256', description: 'uniswap-v2.fn.Swap.params.amount1Out' },
        { name: 'to', type: 'address', description: 'uniswap-v2.fn.Swap.params.to' },
      ],
      description: 'uniswap-v2.fn.Swap.desc',
    },
    {
      name: 'Sync',
      signature: 'Sync(uint112 reserve0, uint112 reserve1)',
      type: 'event',
      params: [
        { name: 'reserve0', type: 'uint112', description: 'uniswap-v2.fn.Sync.params.reserve0' },
        { name: 'reserve1', type: 'uint112', description: 'uniswap-v2.fn.Sync.params.reserve1' },
      ],
      description: 'uniswap-v2.fn.Sync.desc',
    },
  ],

  // ─── Schema v2 content sections ───
  composes: [
    { slug: 'erc20', role: 'uniswap-v2.compose.erc20.role' },
    { slug: 'erc2612', role: 'uniswap-v2.compose.erc2612.role' },
    { erc: 712, role: 'uniswap-v2.compose.erc712.role' },
  ],

  references: [
    {
      label: 'Uniswap V2 docs — Pools (core concepts)',
      url: 'https://docs.uniswap.org/contracts/v2/concepts/core-concepts/pools',
      kind: 'spec',
    },
    {
      label: 'Uniswap V2 docs — Supporting meta transactions (permit)',
      url: 'https://docs.uniswap.org/contracts/v2/guides/smart-contract-integration/supporting-meta-transactions',
      kind: 'spec',
    },
    {
      label: 'UniswapV2ERC20.sol (LP token with permit)',
      url: 'https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2ERC20.sol',
      kind: 'impl',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'trader',
      type: 'user',
      label: 'uniswap-v2.node.trader',
      data: { address: '0xTrader', balance: '1 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'router',
      type: 'contract',
      label: 'uniswap-v2.node.router',
      data: { functions: ['swapExactTokensForTokens', 'addLiquidity', 'removeLiquidity', 'getAmountsOut'] },
      layoutHint: 'center',
    },
    {
      id: 'factory',
      type: 'contract',
      label: 'uniswap-v2.node.factory',
      data: { functions: ['createPair', 'getPair'] },
    },
    {
      id: 'pair-contract',
      type: 'contract',
      label: 'uniswap-v2.node.pairContract',
      data: { functions: ['swap', 'mint', 'burn', 'getReserves'] },
      layoutHint: 'center',
    },
    {
      id: 'liquidity-pool',
      type: 'storage',
      label: 'uniswap-v2.node.liquidityPool',
      data: {
        slots: [
          { key: 'reserve0', label: 'uint112' },
          { key: 'reserve1', label: 'uint112' },
          { key: 'totalSupply', label: 'uint256 (LP tokens)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'token-a',
      type: 'tokenFlow',
      label: 'uniswap-v2.node.tokenA',
      data: { symbol: 'TOKEN-A', amount: '1000' },
    },
    {
      id: 'token-b',
      type: 'tokenFlow',
      label: 'uniswap-v2.node.tokenB',
      data: { symbol: 'TOKEN-B', amount: '3000' },
    },
  ],

  flowEdges: [
    {
      id: 'e-trader-router',
      source: 'trader',
      target: 'router',
      type: 'animated',
      label: 'uniswap-v2.edge.callSwap',
    },
    {
      id: 'e-router-pair',
      source: 'router',
      target: 'pair-contract',
      type: 'animated',
      label: 'uniswap-v2.edge.routeToPair',
    },
    {
      id: 'e-router-factory',
      source: 'router',
      target: 'factory',
      type: 'labeled',
      label: 'uniswap-v2.edge.lookupPair',
    },
    {
      id: 'e-factory-pair',
      source: 'factory',
      target: 'pair-contract',
      type: 'labeled',
      label: 'uniswap-v2.edge.pairAddress',
    },
    {
      id: 'e-pair-pool',
      source: 'pair-contract',
      target: 'liquidity-pool',
      type: 'labeled',
      label: 'uniswap-v2.edge.updateReserves',
    },
    {
      id: 'e-trader-tokenA',
      source: 'trader',
      target: 'token-a',
      type: 'fundFlow',
      label: 'uniswap-v2.edge.tokenIn',
    },
    {
      id: 'e-pair-tokenA',
      source: 'pair-contract',
      target: 'token-a',
      type: 'fundFlow',
    },
    {
      id: 'e-pair-tokenB',
      source: 'pair-contract',
      target: 'token-b',
      type: 'fundFlow',
    },
    {
      id: 'e-tokenB-trader',
      source: 'token-b',
      target: 'trader',
      type: 'fundFlow',
      label: 'uniswap-v2.edge.tokenOut',
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
      id: 'token-swap',
      name: 'uniswap-v2.sim.tokenSwap.name',
      description: 'uniswap-v2.sim.tokenSwap.desc',
      // Live computation: worker computeSwap (x·y=k with 0.3% fee) against
      // the diagram's 1000 TOKEN-A / 3000 TOKEN-B pool; reserve/output
      // valueChanges below update from the current amountIn.
      compute: {
        kind: 'swap',
        inputs: { amountIn: 'amountIn' },
      },
      params: [
        { id: 'amountIn', label: 'uniswap-v2.sim.tokenSwap.param.amountIn', type: 'uint256', defaultValue: '1000000000000000000' },
        { id: 'path', label: 'uniswap-v2.sim.tokenSwap.param.path', type: 'address', defaultValue: '0xTokenA,0xTokenB' },
        { id: 'to', label: 'uniswap-v2.sim.tokenSwap.param.to', type: 'address', defaultValue: '0xTrader' },
      ],
      steps: [
        {
          id: 'step-call-router',
          description: 'uniswap-v2.sim.tokenSwap.step.callRouter',
          mobileDescription: 'uniswap-v2.sim.tokenSwap.step.callRouter.mobile',
          highlightNodes: ['trader', 'router'],
          highlightEdges: ['e-trader-router'],
          valueChanges: { 'trader.tokenA': '1 TOKEN-A sent to Router' },
          durationMs: 1200,
        },
        {
          id: 'step-route-pair',
          description: 'uniswap-v2.sim.tokenSwap.step.routePair',
          mobileDescription: 'uniswap-v2.sim.tokenSwap.step.routePair.mobile',
          highlightNodes: ['router', 'factory', 'pair-contract'],
          highlightEdges: ['e-router-factory', 'e-factory-pair', 'e-router-pair'],
          valueChanges: { 'factory.pair': 'WETH/USDC pair resolved' },
          durationMs: 1000,
        },
        {
          id: 'step-constant-product',
          description: 'uniswap-v2.sim.tokenSwap.step.constantProduct',
          mobileDescription: 'uniswap-v2.sim.tokenSwap.step.constantProduct.mobile',
          highlightNodes: ['pair-contract', 'liquidity-pool'],
          highlightEdges: ['e-pair-pool'],
          valueChanges: {
            'liquidity-pool.reserve0': '1000 → 1001 TOKEN-A',
            'liquidity-pool.reserve1': '3000 → 2997.01 TOKEN-B (k=const)',
          },
          durationMs: 1500,
        },
        {
          id: 'step-receive-tokens',
          description: 'uniswap-v2.sim.tokenSwap.step.receiveTokens',
          mobileDescription: 'uniswap-v2.sim.tokenSwap.step.receiveTokens.mobile',
          highlightNodes: ['pair-contract', 'token-b', 'trader'],
          highlightEdges: ['e-pair-tokenB', 'e-tokenB-trader'],
          valueChanges: { 'trader.tokenB': '0 → 2.99 TOKEN-B received' },
          durationMs: 1000,
        },
      ],
    },
    {
      id: 'add-liquidity',
      name: 'uniswap-v2.sim.addLiquidity.name',
      description: 'uniswap-v2.sim.addLiquidity.desc',
      params: [
        { id: 'amountA', label: 'uniswap-v2.sim.addLiquidity.param.amountA', type: 'uint256', defaultValue: '1000000000000000000' },
        { id: 'amountB', label: 'uniswap-v2.sim.addLiquidity.param.amountB', type: 'uint256', defaultValue: '3000000000' },
        { id: 'provider', label: 'uniswap-v2.sim.addLiquidity.param.provider', type: 'address', defaultValue: '0xProvider' },
      ],
      steps: [
        {
          id: 'step-approve-tokens',
          description: 'uniswap-v2.sim.addLiquidity.step.approveTokens',
          mobileDescription: 'uniswap-v2.sim.addLiquidity.step.approveTokens.mobile',
          highlightNodes: ['trader', 'token-a', 'token-b'],
          highlightEdges: ['e-trader-tokenA'],
          valueChanges: { 'trader.allowance': 'Router approved for TOKEN-A and TOKEN-B' },
          durationMs: 1000,
        },
        {
          id: 'step-call-addliquidity',
          description: 'uniswap-v2.sim.addLiquidity.step.callAddLiquidity',
          mobileDescription: 'uniswap-v2.sim.addLiquidity.step.callAddLiquidity.mobile',
          highlightNodes: ['trader', 'router'],
          highlightEdges: ['e-trader-router'],
          durationMs: 1000,
        },
        {
          id: 'step-transfer-to-pair',
          description: 'uniswap-v2.sim.addLiquidity.step.transferToPair',
          mobileDescription: 'uniswap-v2.sim.addLiquidity.step.transferToPair.mobile',
          highlightNodes: ['router', 'pair-contract', 'token-a', 'token-b'],
          highlightEdges: ['e-router-pair', 'e-pair-tokenA', 'e-pair-tokenB'],
          valueChanges: {
            'pair-contract.tokenA': '+1 TOKEN-A deposited',
            'pair-contract.tokenB': '+3000 TOKEN-B deposited',
          },
          durationMs: 1200,
        },
        {
          id: 'step-mint-lp',
          description: 'uniswap-v2.sim.addLiquidity.step.mintLP',
          mobileDescription: 'uniswap-v2.sim.addLiquidity.step.mintLP.mobile',
          highlightNodes: ['pair-contract', 'liquidity-pool', 'trader'],
          highlightEdges: ['e-pair-pool'],
          valueChanges: {
            'liquidity-pool.totalSupply': 'LP tokens minted ∝ √(amountA × amountB)',
            'trader.lpTokens': '0 → sqrt(1e18 * 3000e6) LP tokens',
          },
          durationMs: 1500,
        },
      ],
    },
  ],

  contracts: [
    { chain: 'Ethereum', address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', label: 'Factory' },
    { chain: 'Ethereum', address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', label: 'Router V2' },
  ],
};
