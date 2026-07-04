import type { ProtocolEntry } from '../types';

export const entry: ProtocolEntry = {
  // ─── ERCMeta ───
  slug: 'curve-stableswap',
  name: 'Curve StableSwap',
  shortDescription: 'curve-stableswap.short',
  category: 'defi',
  entryType: 'protocol',
  officialUrl: 'https://curve.fi',
  relatedSlugs: ['uniswap-v2', 'oneinch-aggregator', 'erc20'],
  sortOrder: 3200,

  // ─── ERCContent ───
  introduction: 'curve-stableswap.introduction',
  designPurpose: 'curve-stableswap.designPurpose',
  commonUsage: 'curve-stableswap.commonUsage',

  functions: [
    {
      name: 'exchange',
      signature: 'exchange(int128 i, int128 j, uint256 dx, uint256 min_dy) → uint256',
      type: 'write',
      params: [
        { name: 'i', type: 'int128', description: 'curve-stableswap.fn.exchange.params.i' },
        { name: 'j', type: 'int128', description: 'curve-stableswap.fn.exchange.params.j' },
        { name: 'dx', type: 'uint256', description: 'curve-stableswap.fn.exchange.params.dx' },
        { name: 'min_dy', type: 'uint256', description: 'curve-stableswap.fn.exchange.params.min_dy' },
      ],
      returns: [{ name: 'dy', type: 'uint256', description: 'curve-stableswap.fn.exchange.returns.dy' }],
      description: 'curve-stableswap.fn.exchange.desc',
      defaultSimValues: { i: '0', j: '1', dx: '1000000000000000000', min_dy: '0' },
    },
    {
      name: 'add_liquidity',
      signature: 'add_liquidity(uint256[2] amounts, uint256 min_mint_amount) → uint256',
      type: 'write',
      params: [
        { name: 'amounts', type: 'uint256[2]', description: 'curve-stableswap.fn.add_liquidity.params.amounts' },
        { name: 'min_mint_amount', type: 'uint256', description: 'curve-stableswap.fn.add_liquidity.params.min_mint_amount' },
      ],
      returns: [{ name: 'lpAmount', type: 'uint256', description: 'curve-stableswap.fn.add_liquidity.returns.lpAmount' }],
      description: 'curve-stableswap.fn.add_liquidity.desc',
      defaultSimValues: { min_mint_amount: '0' },
    },
    {
      name: 'remove_liquidity',
      signature: 'remove_liquidity(uint256 _amount, uint256[2] min_amounts) → uint256[2]',
      type: 'write',
      params: [
        { name: '_amount', type: 'uint256', description: 'curve-stableswap.fn.remove_liquidity.params._amount' },
        { name: 'min_amounts', type: 'uint256[2]', description: 'curve-stableswap.fn.remove_liquidity.params.min_amounts' },
      ],
      returns: [{ name: 'amounts', type: 'uint256[2]', description: 'curve-stableswap.fn.remove_liquidity.returns.amounts' }],
      description: 'curve-stableswap.fn.remove_liquidity.desc',
      defaultSimValues: { _amount: '1000000000000000000' },
    },
    {
      name: 'remove_liquidity_one_coin',
      signature: 'remove_liquidity_one_coin(uint256 _token_amount, int128 i, uint256 _min_amount) → uint256',
      type: 'write',
      params: [
        { name: '_token_amount', type: 'uint256', description: 'curve-stableswap.fn.remove_liquidity_one_coin.params._token_amount' },
        { name: 'i', type: 'int128', description: 'curve-stableswap.fn.remove_liquidity_one_coin.params.i' },
        { name: '_min_amount', type: 'uint256', description: 'curve-stableswap.fn.remove_liquidity_one_coin.params._min_amount' },
      ],
      returns: [{ name: 'coinAmount', type: 'uint256', description: 'curve-stableswap.fn.remove_liquidity_one_coin.returns.coinAmount' }],
      description: 'curve-stableswap.fn.remove_liquidity_one_coin.desc',
      defaultSimValues: { _token_amount: '1000000000000000000', i: '0', _min_amount: '0' },
    },
    {
      name: 'get_dy',
      signature: 'get_dy(int128 i, int128 j, uint256 dx) → uint256',
      type: 'read',
      params: [
        { name: 'i', type: 'int128', description: 'curve-stableswap.fn.get_dy.params.i' },
        { name: 'j', type: 'int128', description: 'curve-stableswap.fn.get_dy.params.j' },
        { name: 'dx', type: 'uint256', description: 'curve-stableswap.fn.get_dy.params.dx' },
      ],
      returns: [{ name: 'dy', type: 'uint256', description: 'curve-stableswap.fn.get_dy.returns.dy' }],
      description: 'curve-stableswap.fn.get_dy.desc',
      defaultSimValues: { i: '0', j: '1', dx: '1000000000000000000' },
    },
    {
      name: 'get_virtual_price',
      signature: 'get_virtual_price() → uint256',
      type: 'read',
      params: [],
      returns: [{ name: 'price', type: 'uint256', description: 'curve-stableswap.fn.get_virtual_price.returns.price' }],
      description: 'curve-stableswap.fn.get_virtual_price.desc',
      defaultSimValues: {},
    },
  ],

  // ─── Schema v2 content sections ───
  composes: [
    { slug: 'erc20', role: 'curve-stableswap.compose.erc20.role' },
    { slug: 'erc2612', role: 'curve-stableswap.compose.erc2612.role' },
  ],

  references: [
    {
      label: 'Curve docs — StableSwap LP tokens overview',
      url: 'https://docs.curve.finance/stableswap-exchange/stableswap/lp_tokens/overview/',
      kind: 'spec',
    },
    {
      label: 'CurveStableSwapNG.vy (ERC-20 pool token with permit)',
      url: 'https://github.com/curvefi/stableswap-ng/blob/main/contracts/main/CurveStableSwapNG.vy',
      kind: 'impl',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'trader',
      type: 'user',
      label: 'curve-stableswap.node.trader',
      data: { address: '0xTrader', balance: '1000 DAI' },
      layoutHint: 'source',
    },
    {
      id: 'stableswap-pool',
      type: 'contract',
      label: 'curve-stableswap.node.stableswapPool',
      data: { functions: ['exchange', 'add_liquidity', 'remove_liquidity', 'get_dy', 'get_virtual_price'] },
      layoutHint: 'center',
    },
    {
      id: 'token-a',
      type: 'tokenFlow',
      label: 'curve-stableswap.node.tokenA',
      data: { symbol: 'DAI', amount: '1000000' },
    },
    {
      id: 'token-b',
      type: 'tokenFlow',
      label: 'curve-stableswap.node.tokenB',
      data: { symbol: 'USDC', amount: '1000000' },
    },
    {
      id: 'lp-token',
      type: 'tokenFlow',
      label: 'curve-stableswap.node.lpToken',
      data: { symbol: '3CRV', amount: '0' },
    },
    {
      id: 'gauge',
      type: 'contract',
      label: 'curve-stableswap.node.gauge',
      data: { functions: ['deposit', 'withdraw', 'claim_rewards'] },
    },
    {
      id: 'crv-rewards',
      type: 'tokenFlow',
      label: 'curve-stableswap.node.crvRewards',
      data: { symbol: 'CRV', amount: '0' },
    },
  ],

  flowEdges: [
    {
      id: 'e-trader-pool',
      source: 'trader',
      target: 'stableswap-pool',
      type: 'animated',
      label: 'curve-stableswap.edge.exchange',
    },
    {
      id: 'e-trader-tokenA',
      source: 'trader',
      target: 'token-a',
      type: 'fundFlow',
      label: 'curve-stableswap.edge.tokenIn',
    },
    {
      id: 'e-pool-tokenA',
      source: 'stableswap-pool',
      target: 'token-a',
      type: 'fundFlow',
    },
    {
      id: 'e-pool-tokenB',
      source: 'stableswap-pool',
      target: 'token-b',
      type: 'fundFlow',
    },
    {
      id: 'e-tokenB-trader',
      source: 'token-b',
      target: 'trader',
      type: 'fundFlow',
      label: 'curve-stableswap.edge.tokenOut',
    },
    {
      id: 'e-pool-lpToken',
      source: 'stableswap-pool',
      target: 'lp-token',
      type: 'fundFlow',
      label: 'curve-stableswap.edge.mintLP',
    },
    {
      id: 'e-lpToken-gauge',
      source: 'lp-token',
      target: 'gauge',
      type: 'animated',
      label: 'curve-stableswap.edge.stakeLP',
    },
    {
      id: 'e-gauge-crvRewards',
      source: 'gauge',
      target: 'crv-rewards',
      type: 'fundFlow',
      label: 'curve-stableswap.edge.crvEmissions',
    },
    {
      id: 'e-crvRewards-trader',
      source: 'crv-rewards',
      target: 'trader',
      type: 'fundFlow',
      label: 'curve-stableswap.edge.claimCRV',
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
      id: 'stablecoin-swap',
      name: 'curve-stableswap.sim.stablecoinSwap.name',
      description: 'curve-stableswap.sim.stablecoinSwap.desc',
      params: [
        { id: 'dx', label: 'curve-stableswap.sim.stablecoinSwap.param.dx', type: 'uint256', defaultValue: '1000000000000000000000' },
        { id: 'tokenIn', label: 'curve-stableswap.sim.stablecoinSwap.param.tokenIn', type: 'select', options: [{ label: 'DAI (index 0)', value: '0' }, { label: 'USDC (index 1)', value: '1' }, { label: 'USDT (index 2)', value: '2' }], defaultValue: '0' },
        { id: 'tokenOut', label: 'curve-stableswap.sim.stablecoinSwap.param.tokenOut', type: 'select', options: [{ label: 'DAI (index 0)', value: '0' }, { label: 'USDC (index 1)', value: '1' }, { label: 'USDT (index 2)', value: '2' }], defaultValue: '1' },
      ],
      steps: [
        {
          id: 'step-query-get-dy',
          description: 'curve-stableswap.sim.stablecoinSwap.step.queryGetDy',
          mobileDescription: 'curve-stableswap.sim.stablecoinSwap.step.queryGetDy.mobile',
          highlightNodes: ['trader', 'stableswap-pool'],
          highlightEdges: ['e-trader-pool'],
          valueChanges: {
            'stableswap-pool.quotedDy': '1000 DAI → ~999.97 USDC (near-zero slippage via StableSwap invariant)',
          },
          durationMs: 1000,
        },
        {
          id: 'step-transfer-token-in',
          description: 'curve-stableswap.sim.stablecoinSwap.step.transferTokenIn',
          mobileDescription: 'curve-stableswap.sim.stablecoinSwap.step.transferTokenIn.mobile',
          highlightNodes: ['trader', 'token-a', 'stableswap-pool'],
          highlightEdges: ['e-trader-tokenA', 'e-pool-tokenA'],
          valueChanges: {
            'token-a.poolBalance': '1,000,000 → 1,001,000 DAI',
            'trader.dai': '-1000 DAI sent',
          },
          durationMs: 1200,
        },
        {
          id: 'step-stableswap-invariant',
          description: 'curve-stableswap.sim.stablecoinSwap.step.stableswapInvariant',
          mobileDescription: 'curve-stableswap.sim.stablecoinSwap.step.stableswapInvariant.mobile',
          highlightNodes: ['stableswap-pool', 'token-a', 'token-b'],
          highlightEdges: ['e-pool-tokenA', 'e-pool-tokenB'],
          valueChanges: {
            'stableswap-pool.amplificationFactor': 'A=2000 → near-linear price curve for stables',
            'stableswap-pool.invariantD': 'D recalculated: A*sum + D = A*n^n*prod + D^(n+1)/(n^n*prod)',
          },
          durationMs: 1500,
        },
        {
          id: 'step-receive-token-out',
          description: 'curve-stableswap.sim.stablecoinSwap.step.receiveTokenOut',
          mobileDescription: 'curve-stableswap.sim.stablecoinSwap.step.receiveTokenOut.mobile',
          highlightNodes: ['stableswap-pool', 'token-b', 'trader'],
          highlightEdges: ['e-pool-tokenB', 'e-tokenB-trader'],
          valueChanges: {
            'token-b.poolBalance': '1,000,000 → 999,000.03 USDC',
            'trader.usdc': '0 → 999.97 USDC (0.04% fee deducted)',
          },
          durationMs: 1200,
        },
      ],
    },
  ],

  contracts: [
    { chain: 'Ethereum', address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7', label: '3Pool (DAI/USDC/USDT)' },
    { chain: 'Ethereum', address: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD', label: 'sUSD Pool' },
  ],
};
