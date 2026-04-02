import type { ProtocolEntry } from '../types';

export const entry: ProtocolEntry = {
  // ─── ERCMeta ───
  slug: 'oneinch-aggregator',
  name: '1inch Aggregator',
  shortDescription: 'oneinch-aggregator.short',
  category: 'defi',
  entryType: 'protocol',
  officialUrl: 'https://1inch.io',
  relatedSlugs: ['uniswap-v3', 'curve-stableswap', 'erc20'],
  sortOrder: 3000,

  // ─── ERCContent ───
  introduction: 'oneinch-aggregator.introduction',
  designPurpose: 'oneinch-aggregator.designPurpose',
  commonUsage: 'oneinch-aggregator.commonUsage',

  functions: [
    {
      name: 'swap',
      signature: 'swap(IAggregationExecutor executor, SwapDescription calldata desc, bytes calldata permit, bytes calldata data) → (uint256 returnAmount, uint256 spentAmount)',
      type: 'write',
      params: [
        { name: 'executor', type: 'address', description: 'oneinch-aggregator.fn.swap.params.executor' },
        { name: 'srcToken', type: 'address', description: 'oneinch-aggregator.fn.swap.params.srcToken' },
        { name: 'dstToken', type: 'address', description: 'oneinch-aggregator.fn.swap.params.dstToken' },
        { name: 'amount', type: 'uint256', description: 'oneinch-aggregator.fn.swap.params.amount' },
        { name: 'minReturnAmount', type: 'uint256', description: 'oneinch-aggregator.fn.swap.params.minReturnAmount' },
        { name: 'data', type: 'bytes', description: 'oneinch-aggregator.fn.swap.params.data' },
      ],
      returns: [
        { name: 'returnAmount', type: 'uint256', description: 'oneinch-aggregator.fn.swap.returns.returnAmount' },
        { name: 'spentAmount', type: 'uint256', description: 'oneinch-aggregator.fn.swap.returns.spentAmount' },
      ],
      description: 'oneinch-aggregator.fn.swap.desc',
      defaultSimValues: { amount: '1000000000000000000', minReturnAmount: '0' },
    },
    {
      name: 'unoswap',
      signature: 'unoswap(IERC20 srcToken, uint256 amount, uint256 minReturn, uint256[] calldata pools) → uint256 returnAmount',
      type: 'write',
      params: [
        { name: 'srcToken', type: 'address', description: 'oneinch-aggregator.fn.unoswap.params.srcToken' },
        { name: 'amount', type: 'uint256', description: 'oneinch-aggregator.fn.unoswap.params.amount' },
        { name: 'minReturn', type: 'uint256', description: 'oneinch-aggregator.fn.unoswap.params.minReturn' },
        { name: 'pools', type: 'uint256[]', description: 'oneinch-aggregator.fn.unoswap.params.pools' },
      ],
      returns: [{ name: 'returnAmount', type: 'uint256', description: 'oneinch-aggregator.fn.unoswap.returns.returnAmount' }],
      description: 'oneinch-aggregator.fn.unoswap.desc',
      defaultSimValues: { amount: '1000000000000000000', minReturn: '0' },
    },
    {
      name: 'fillOrder',
      signature: 'fillOrder(OrderLib.Order calldata order, bytes calldata signature, bytes calldata interaction, uint256 makingAmount, uint256 takingAmount, uint256 skipPermitAndThresholdAmount) → (uint256, uint256, bytes32)',
      type: 'write',
      params: [
        { name: 'order', type: 'Order', description: 'oneinch-aggregator.fn.fillOrder.params.order' },
        { name: 'signature', type: 'bytes', description: 'oneinch-aggregator.fn.fillOrder.params.signature' },
        { name: 'interaction', type: 'bytes', description: 'oneinch-aggregator.fn.fillOrder.params.interaction' },
        { name: 'makingAmount', type: 'uint256', description: 'oneinch-aggregator.fn.fillOrder.params.makingAmount' },
        { name: 'takingAmount', type: 'uint256', description: 'oneinch-aggregator.fn.fillOrder.params.takingAmount' },
        { name: 'skipPermitAndThresholdAmount', type: 'uint256', description: 'oneinch-aggregator.fn.fillOrder.params.skipPermitAndThresholdAmount' },
      ],
      returns: [
        { name: 'actualMakingAmount', type: 'uint256', description: 'oneinch-aggregator.fn.fillOrder.returns.actualMakingAmount' },
        { name: 'actualTakingAmount', type: 'uint256', description: 'oneinch-aggregator.fn.fillOrder.returns.actualTakingAmount' },
        { name: 'orderHash', type: 'bytes32', description: 'oneinch-aggregator.fn.fillOrder.returns.orderHash' },
      ],
      description: 'oneinch-aggregator.fn.fillOrder.desc',
      defaultSimValues: { makingAmount: '1000000000000000000', takingAmount: '0', skipPermitAndThresholdAmount: '0' },
    },
    {
      name: 'RemainingInvalidated',
      signature: 'RemainingInvalidated(address indexed maker, bytes32 indexed orderHash)',
      type: 'event',
      params: [
        { name: 'maker', type: 'address', description: 'oneinch-aggregator.fn.RemainingInvalidated.params.maker' },
        { name: 'orderHash', type: 'bytes32', description: 'oneinch-aggregator.fn.RemainingInvalidated.params.orderHash' },
      ],
      description: 'oneinch-aggregator.fn.RemainingInvalidated.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'trader',
      type: 'user',
      label: 'oneinch-aggregator.node.trader',
      data: { address: '0xTrader', balance: '1 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'aggregation-router',
      type: 'contract',
      label: 'oneinch-aggregator.node.aggregationRouter',
      data: { functions: ['swap', 'unoswap', 'fillOrder'] },
      layoutHint: 'center',
    },
    {
      id: 'pathfinder',
      type: 'contract',
      label: 'oneinch-aggregator.node.pathfinder',
      data: { functions: ['findBestPath', 'getExpectedReturn'] },
    },
    {
      id: 'dex-a',
      type: 'contract',
      label: 'oneinch-aggregator.node.dexA',
      data: { functions: ['swap'] },
    },
    {
      id: 'dex-b',
      type: 'contract',
      label: 'oneinch-aggregator.node.dexB',
      data: { functions: ['exchange'] },
    },
    {
      id: 'dex-c',
      type: 'contract',
      label: 'oneinch-aggregator.node.dexC',
      data: { functions: ['swap'] },
    },
    {
      id: 'token-in',
      type: 'tokenFlow',
      label: 'oneinch-aggregator.node.tokenIn',
      data: { symbol: 'TOKEN-IN', amount: '1000' },
    },
    {
      id: 'token-out',
      type: 'tokenFlow',
      label: 'oneinch-aggregator.node.tokenOut',
      data: { symbol: 'TOKEN-OUT', amount: '0' },
    },
  ],

  flowEdges: [
    {
      id: 'e-trader-router',
      source: 'trader',
      target: 'aggregation-router',
      type: 'animated',
      label: 'oneinch-aggregator.edge.callSwap',
    },
    {
      id: 'e-router-pathfinder',
      source: 'aggregation-router',
      target: 'pathfinder',
      type: 'labeled',
      label: 'oneinch-aggregator.edge.findBestPath',
    },
    {
      id: 'e-router-dexA',
      source: 'aggregation-router',
      target: 'dex-a',
      type: 'animated',
      label: 'oneinch-aggregator.edge.splitToDexA',
    },
    {
      id: 'e-router-dexB',
      source: 'aggregation-router',
      target: 'dex-b',
      type: 'animated',
      label: 'oneinch-aggregator.edge.splitToDexB',
    },
    {
      id: 'e-router-dexC',
      source: 'aggregation-router',
      target: 'dex-c',
      type: 'animated',
      label: 'oneinch-aggregator.edge.splitToDexC',
    },
    {
      id: 'e-trader-tokenIn',
      source: 'trader',
      target: 'token-in',
      type: 'fundFlow',
      label: 'oneinch-aggregator.edge.tokenIn',
    },
    {
      id: 'e-dexA-tokenOut',
      source: 'dex-a',
      target: 'token-out',
      type: 'fundFlow',
    },
    {
      id: 'e-dexB-tokenOut',
      source: 'dex-b',
      target: 'token-out',
      type: 'fundFlow',
    },
    {
      id: 'e-dexC-tokenOut',
      source: 'dex-c',
      target: 'token-out',
      type: 'fundFlow',
    },
    {
      id: 'e-tokenOut-trader',
      source: 'token-out',
      target: 'trader',
      type: 'fundFlow',
      label: 'oneinch-aggregator.edge.bestOutput',
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
      id: 'aggregated-swap',
      name: 'oneinch-aggregator.sim.aggregatedSwap.name',
      description: 'oneinch-aggregator.sim.aggregatedSwap.desc',
      params: [
        { id: 'amountIn', label: 'oneinch-aggregator.sim.aggregatedSwap.param.amountIn', type: 'uint256', defaultValue: '1000000000000000000' },
        { id: 'srcToken', label: 'oneinch-aggregator.sim.aggregatedSwap.param.srcToken', type: 'address', defaultValue: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
        { id: 'dstToken', label: 'oneinch-aggregator.sim.aggregatedSwap.param.dstToken', type: 'address', defaultValue: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
      ],
      steps: [
        {
          id: 'step-pathfinder-query',
          description: 'oneinch-aggregator.sim.aggregatedSwap.step.pathfinderQuery',
          mobileDescription: 'oneinch-aggregator.sim.aggregatedSwap.step.pathfinderQuery.mobile',
          highlightNodes: ['trader', 'aggregation-router', 'pathfinder'],
          highlightEdges: ['e-trader-router', 'e-router-pathfinder'],
          valueChanges: {
            'pathfinder.routes': '3 routes found: Uniswap V3 (60%), Curve (25%), Balancer (15%)',
            'pathfinder.bestOutput': '~3010 USDC for 1 WETH',
          },
          durationMs: 1200,
        },
        {
          id: 'step-split-routes',
          description: 'oneinch-aggregator.sim.aggregatedSwap.step.splitRoutes',
          mobileDescription: 'oneinch-aggregator.sim.aggregatedSwap.step.splitRoutes.mobile',
          highlightNodes: ['aggregation-router', 'dex-a', 'dex-b', 'dex-c'],
          highlightEdges: ['e-router-dexA', 'e-router-dexB', 'e-router-dexC'],
          valueChanges: {
            'dex-a.trade': '0.6 WETH → Uniswap V3 pool',
            'dex-b.trade': '0.25 WETH → Curve pool',
            'dex-c.trade': '0.15 WETH → Balancer pool',
          },
          durationMs: 1500,
        },
        {
          id: 'step-aggregate-output',
          description: 'oneinch-aggregator.sim.aggregatedSwap.step.aggregateOutput',
          mobileDescription: 'oneinch-aggregator.sim.aggregatedSwap.step.aggregateOutput.mobile',
          highlightNodes: ['dex-a', 'dex-b', 'dex-c', 'token-out'],
          highlightEdges: ['e-dexA-tokenOut', 'e-dexB-tokenOut', 'e-dexC-tokenOut'],
          valueChanges: {
            'token-out.totalReceived': '1806 + 753 + 452 = 3011 USDC aggregated',
          },
          durationMs: 1200,
        },
        {
          id: 'step-deliver-output',
          description: 'oneinch-aggregator.sim.aggregatedSwap.step.deliverOutput',
          mobileDescription: 'oneinch-aggregator.sim.aggregatedSwap.step.deliverOutput.mobile',
          highlightNodes: ['token-out', 'trader'],
          highlightEdges: ['e-tokenOut-trader'],
          valueChanges: {
            'trader.usdc': '0 → 3011 USDC (best rate vs single DEX ~2997)',
            'trader.savings': '+14 USDC vs naive Uniswap V2 route',
          },
          durationMs: 1000,
        },
      ],
    },
  ],

  contracts: [
    { chain: 'Ethereum', address: '0x111111125421cA6dc452d289314280a0f8842A65', label: 'Aggregation Router V6' },
  ],
};
