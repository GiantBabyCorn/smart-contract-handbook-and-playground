import type { ProtocolEntry } from '../types';

export const entry: ProtocolEntry = {
  // ─── ERCMeta ───
  slug: 'compound-v3',
  name: 'Compound V3',
  shortDescription: 'compound-v3.short',
  category: 'defi',
  entryType: 'protocol',
  officialUrl: 'https://compound.finance',
  relatedSlugs: ['aave-v3', 'erc20', 'chainlink-oracle'],
  sortOrder: 2700,

  // ─── ERCContent ───
  introduction: 'compound-v3.introduction',
  designPurpose: 'compound-v3.designPurpose',
  commonUsage: 'compound-v3.commonUsage',

  functions: [
    {
      name: 'supply',
      signature: 'supply(address asset, uint amount)',
      type: 'write',
      params: [
        { name: 'asset', type: 'address', description: 'compound-v3.fn.supply.params.asset' },
        { name: 'amount', type: 'uint256', description: 'compound-v3.fn.supply.params.amount' },
      ],
      description: 'compound-v3.fn.supply.desc',
      defaultSimValues: { amount: '1000000000000000000' },
    },
    {
      name: 'withdraw',
      signature: 'withdraw(address asset, uint amount)',
      type: 'write',
      params: [
        { name: 'asset', type: 'address', description: 'compound-v3.fn.withdraw.params.asset' },
        { name: 'amount', type: 'uint256', description: 'compound-v3.fn.withdraw.params.amount' },
      ],
      description: 'compound-v3.fn.withdraw.desc',
      defaultSimValues: { amount: '500000000000000000' },
    },
    {
      name: 'borrow',
      signature: 'withdraw(address asset, uint amount)',
      type: 'write',
      params: [
        { name: 'asset', type: 'address', description: 'compound-v3.fn.borrow.params.asset' },
        { name: 'amount', type: 'uint256', description: 'compound-v3.fn.borrow.params.amount' },
      ],
      description: 'compound-v3.fn.borrow.desc',
      defaultSimValues: { amount: '500000000' },
    },
    {
      name: 'repay',
      signature: 'supply(address asset, uint amount)',
      type: 'write',
      params: [
        { name: 'asset', type: 'address', description: 'compound-v3.fn.repay.params.asset' },
        { name: 'amount', type: 'uint256', description: 'compound-v3.fn.repay.params.amount' },
      ],
      description: 'compound-v3.fn.repay.desc',
      defaultSimValues: { amount: '500000000' },
    },
    {
      name: 'absorb',
      signature: 'absorb(address absorber, address[] calldata accounts)',
      type: 'write',
      params: [
        { name: 'absorber', type: 'address', description: 'compound-v3.fn.absorb.params.absorber' },
        { name: 'accounts', type: 'address[]', description: 'compound-v3.fn.absorb.params.accounts' },
      ],
      description: 'compound-v3.fn.absorb.desc',
      defaultSimValues: {},
    },
    {
      name: 'buyCollateral',
      signature: 'buyCollateral(address asset, uint minAmount, uint baseAmount, address recipient)',
      type: 'write',
      params: [
        { name: 'asset', type: 'address', description: 'compound-v3.fn.buyCollateral.params.asset' },
        { name: 'minAmount', type: 'uint256', description: 'compound-v3.fn.buyCollateral.params.minAmount' },
        { name: 'baseAmount', type: 'uint256', description: 'compound-v3.fn.buyCollateral.params.baseAmount' },
        { name: 'recipient', type: 'address', description: 'compound-v3.fn.buyCollateral.params.recipient' },
      ],
      description: 'compound-v3.fn.buyCollateral.desc',
      defaultSimValues: { minAmount: '0', baseAmount: '1000000000' },
    },
    {
      name: 'getUtilization',
      signature: 'getUtilization() → uint',
      type: 'read',
      params: [],
      returns: [{ name: 'utilization', type: 'uint256', description: 'compound-v3.fn.getUtilization.returns.utilization' }],
      description: 'compound-v3.fn.getUtilization.desc',
      defaultSimValues: {},
    },
    {
      name: 'getSupplyRate',
      signature: 'getSupplyRate(uint utilization) → uint64',
      type: 'read',
      params: [
        { name: 'utilization', type: 'uint256', description: 'compound-v3.fn.getSupplyRate.params.utilization' },
      ],
      returns: [{ name: 'supplyRate', type: 'uint64', description: 'compound-v3.fn.getSupplyRate.returns.supplyRate' }],
      description: 'compound-v3.fn.getSupplyRate.desc',
      defaultSimValues: { utilization: '800000000000000000' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'supplier',
      type: 'user',
      label: 'compound-v3.node.supplier',
      data: { address: '0xSupplier', balance: '10 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'borrower',
      type: 'user',
      label: 'compound-v3.node.borrower',
      data: { address: '0xBorrower', balance: '5 ETH collateral' },
    },
    {
      id: 'comet-contract',
      type: 'contract',
      label: 'compound-v3.node.cometContract',
      data: { functions: ['supply', 'withdraw', 'absorb', 'buyCollateral', 'getUtilization'] },
      layoutHint: 'center',
    },
    {
      id: 'base-token',
      type: 'tokenFlow',
      label: 'compound-v3.node.baseToken',
      data: { symbol: 'USDC', amount: '0' },
    },
    {
      id: 'collateral-token',
      type: 'tokenFlow',
      label: 'compound-v3.node.collateralToken',
      data: { symbol: 'WETH', amount: '0' },
    },
    {
      id: 'price-feed',
      type: 'contract',
      label: 'compound-v3.node.priceFeed',
      data: { functions: ['latestRoundData', 'decimals'] },
    },
    {
      id: 'absorber',
      type: 'user',
      label: 'compound-v3.node.absorber',
      data: { address: '0xAbsorber', balance: 'USDC reward' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-supplier-comet',
      source: 'supplier',
      target: 'comet-contract',
      type: 'animated',
      label: 'compound-v3.edge.supplyBase',
    },
    {
      id: 'e-comet-baseToken',
      source: 'comet-contract',
      target: 'base-token',
      type: 'fundFlow',
      label: 'compound-v3.edge.baseTokenBalance',
    },
    {
      id: 'e-borrower-comet',
      source: 'borrower',
      target: 'comet-contract',
      type: 'animated',
      label: 'compound-v3.edge.supplyCollateral',
    },
    {
      id: 'e-comet-collateralToken',
      source: 'comet-contract',
      target: 'collateral-token',
      type: 'fundFlow',
      label: 'compound-v3.edge.collateralHeld',
    },
    {
      id: 'e-priceFeed-comet',
      source: 'price-feed',
      target: 'comet-contract',
      type: 'labeled',
      label: 'compound-v3.edge.assetPrice',
    },
    {
      id: 'e-comet-borrower-usdc',
      source: 'comet-contract',
      target: 'borrower',
      type: 'fundFlow',
      label: 'compound-v3.edge.borrowedUSDC',
    },
    {
      id: 'e-absorber-comet',
      source: 'absorber',
      target: 'comet-contract',
      type: 'animated',
      label: 'compound-v3.edge.absorb',
    },
    {
      id: 'e-comet-absorber',
      source: 'comet-contract',
      target: 'absorber',
      type: 'fundFlow',
      label: 'compound-v3.edge.absorberReward',
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
      id: 'supply-and-borrow-comet',
      name: 'compound-v3.sim.supplyAndBorrowComet.name',
      description: 'compound-v3.sim.supplyAndBorrowComet.desc',
      params: [
        { id: 'collateralAmount', label: 'compound-v3.sim.supplyAndBorrowComet.param.collateralAmount', type: 'uint256', defaultValue: '1000000000000000000' },
        { id: 'borrowAmount', label: 'compound-v3.sim.supplyAndBorrowComet.param.borrowAmount', type: 'uint256', defaultValue: '500000000' },
      ],
      steps: [
        {
          id: 'step-supply-collateral',
          description: 'compound-v3.sim.supplyAndBorrowComet.step.supplyCollateral',
          mobileDescription: 'compound-v3.sim.supplyAndBorrowComet.step.supplyCollateral.mobile',
          highlightNodes: ['borrower', 'comet-contract', 'collateral-token'],
          highlightEdges: ['e-borrower-comet', 'e-comet-collateralToken'],
          valueChanges: {
            'comet-contract.wethCollateral': '+1 WETH',
            'borrower.weth': '5 → 4 WETH',
          },
          durationMs: 1200,
        },
        {
          id: 'step-check-price',
          description: 'compound-v3.sim.supplyAndBorrowComet.step.checkPrice',
          mobileDescription: 'compound-v3.sim.supplyAndBorrowComet.step.checkPrice.mobile',
          highlightNodes: ['price-feed', 'comet-contract'],
          highlightEdges: ['e-priceFeed-comet'],
          valueChanges: {
            'comet-contract.borrowCapacity': '$3000 (1 WETH × $3000) × 82.5% LTV = $2475 max borrow',
          },
          durationMs: 1000,
        },
        {
          id: 'step-borrow-base',
          description: 'compound-v3.sim.supplyAndBorrowComet.step.borrowBase',
          mobileDescription: 'compound-v3.sim.supplyAndBorrowComet.step.borrowBase.mobile',
          highlightNodes: ['borrower', 'comet-contract', 'base-token'],
          highlightEdges: ['e-borrower-comet', 'e-comet-baseToken', 'e-comet-borrower-usdc'],
          valueChanges: {
            'comet-contract.baseBorrowBalance': '0 → 500 USDC owed',
            'borrower.usdc': '0 → 500 USDC received',
          },
          durationMs: 1500,
        },
        {
          id: 'step-utilization',
          description: 'compound-v3.sim.supplyAndBorrowComet.step.utilization',
          mobileDescription: 'compound-v3.sim.supplyAndBorrowComet.step.utilization.mobile',
          highlightNodes: ['comet-contract', 'supplier'],
          highlightEdges: ['e-supplier-comet'],
          valueChanges: {
            'comet-contract.utilization': '↑ borrow rate adjusts via interest rate model',
            'supplier.interestEarned': '+~3.5% APY accruing on supplied USDC',
          },
          durationMs: 1000,
        },
      ],
    },
  ],

  contracts: [
    { chain: 'Ethereum', address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3', label: 'Comet (USDC)' },
    { chain: 'Ethereum', address: '0x1B0e765F6224C21223AeA2af16c1C46E38885a40', label: 'CometRewards' },
  ],
};
