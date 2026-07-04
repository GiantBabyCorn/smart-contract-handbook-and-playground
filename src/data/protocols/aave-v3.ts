import type { ProtocolEntry } from '../types';

export const entry: ProtocolEntry = {
  // ─── ERCMeta ───
  slug: 'aave-v3',
  name: 'Aave V3',
  shortDescription: 'aave-v3.short',
  category: 'defi',
  entryType: 'protocol',
  officialUrl: 'https://aave.com',
  relatedSlugs: ['compound-v3', 'erc20', 'erc4626', 'chainlink-oracle'],
  sortOrder: 2600,

  // ─── ERCContent ───
  introduction: 'aave-v3.introduction',
  designPurpose: 'aave-v3.designPurpose',
  commonUsage: 'aave-v3.commonUsage',

  functions: [
    {
      name: 'supply',
      signature: 'supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
      type: 'write',
      params: [
        { name: 'asset', type: 'address', description: 'aave-v3.fn.supply.params.asset' },
        { name: 'amount', type: 'uint256', description: 'aave-v3.fn.supply.params.amount' },
        { name: 'onBehalfOf', type: 'address', description: 'aave-v3.fn.supply.params.onBehalfOf' },
        { name: 'referralCode', type: 'uint16', description: 'aave-v3.fn.supply.params.referralCode' },
      ],
      description: 'aave-v3.fn.supply.desc',
      defaultSimValues: { amount: '1000000000000000000', referralCode: '0' },
    },
    {
      name: 'borrow',
      signature: 'borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
      type: 'write',
      params: [
        { name: 'asset', type: 'address', description: 'aave-v3.fn.borrow.params.asset' },
        { name: 'amount', type: 'uint256', description: 'aave-v3.fn.borrow.params.amount' },
        { name: 'interestRateMode', type: 'uint256', description: 'aave-v3.fn.borrow.params.interestRateMode' },
        { name: 'referralCode', type: 'uint16', description: 'aave-v3.fn.borrow.params.referralCode' },
        { name: 'onBehalfOf', type: 'address', description: 'aave-v3.fn.borrow.params.onBehalfOf' },
      ],
      description: 'aave-v3.fn.borrow.desc',
      defaultSimValues: { amount: '500000000000000000000', interestRateMode: '2', referralCode: '0' },
    },
    {
      name: 'repay',
      signature: 'repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) → uint256',
      type: 'write',
      params: [
        { name: 'asset', type: 'address', description: 'aave-v3.fn.repay.params.asset' },
        { name: 'amount', type: 'uint256', description: 'aave-v3.fn.repay.params.amount' },
        { name: 'interestRateMode', type: 'uint256', description: 'aave-v3.fn.repay.params.interestRateMode' },
        { name: 'onBehalfOf', type: 'address', description: 'aave-v3.fn.repay.params.onBehalfOf' },
      ],
      returns: [{ name: 'paybackAmount', type: 'uint256', description: 'aave-v3.fn.repay.returns.paybackAmount' }],
      description: 'aave-v3.fn.repay.desc',
      defaultSimValues: { amount: '115792089237316195423570985008687907853269984665640564039457584007913129639935', interestRateMode: '2' },
    },
    {
      name: 'withdraw',
      signature: 'withdraw(address asset, uint256 amount, address to) → uint256',
      type: 'write',
      params: [
        { name: 'asset', type: 'address', description: 'aave-v3.fn.withdraw.params.asset' },
        { name: 'amount', type: 'uint256', description: 'aave-v3.fn.withdraw.params.amount' },
        { name: 'to', type: 'address', description: 'aave-v3.fn.withdraw.params.to' },
      ],
      returns: [{ name: 'amountWithdrawn', type: 'uint256', description: 'aave-v3.fn.withdraw.returns.amountWithdrawn' }],
      description: 'aave-v3.fn.withdraw.desc',
      defaultSimValues: { amount: '1000000000000000000' },
    },
    {
      name: 'liquidationCall',
      signature: 'liquidationCall(address collateralAsset, address debtAsset, address user, uint256 debtToCover, bool receiveAToken)',
      type: 'write',
      params: [
        { name: 'collateralAsset', type: 'address', description: 'aave-v3.fn.liquidationCall.params.collateralAsset' },
        { name: 'debtAsset', type: 'address', description: 'aave-v3.fn.liquidationCall.params.debtAsset' },
        { name: 'user', type: 'address', description: 'aave-v3.fn.liquidationCall.params.user' },
        { name: 'debtToCover', type: 'uint256', description: 'aave-v3.fn.liquidationCall.params.debtToCover' },
        { name: 'receiveAToken', type: 'bool', description: 'aave-v3.fn.liquidationCall.params.receiveAToken' },
      ],
      description: 'aave-v3.fn.liquidationCall.desc',
      defaultSimValues: { debtToCover: '115792089237316195423570985008687907853269984665640564039457584007913129639935', receiveAToken: 'false' },
    },
    {
      name: 'flashLoan',
      signature: 'flashLoan(address receiverAddress, address[] calldata assets, uint256[] calldata amounts, uint256[] calldata interestRateModes, address onBehalfOf, bytes calldata params, uint16 referralCode)',
      type: 'write',
      params: [
        { name: 'receiverAddress', type: 'address', description: 'aave-v3.fn.flashLoan.params.receiverAddress' },
        { name: 'assets', type: 'address[]', description: 'aave-v3.fn.flashLoan.params.assets' },
        { name: 'amounts', type: 'uint256[]', description: 'aave-v3.fn.flashLoan.params.amounts' },
        { name: 'interestRateModes', type: 'uint256[]', description: 'aave-v3.fn.flashLoan.params.interestRateModes' },
        { name: 'onBehalfOf', type: 'address', description: 'aave-v3.fn.flashLoan.params.onBehalfOf' },
        { name: 'params', type: 'bytes', description: 'aave-v3.fn.flashLoan.params.params' },
        { name: 'referralCode', type: 'uint16', description: 'aave-v3.fn.flashLoan.params.referralCode' },
      ],
      description: 'aave-v3.fn.flashLoan.desc',
      defaultSimValues: { referralCode: '0' },
    },
    {
      name: 'getUserAccountData',
      signature: 'getUserAccountData(address user) → (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
      type: 'read',
      params: [
        { name: 'user', type: 'address', description: 'aave-v3.fn.getUserAccountData.params.user' },
      ],
      returns: [
        { name: 'totalCollateralBase', type: 'uint256', description: 'aave-v3.fn.getUserAccountData.returns.totalCollateralBase' },
        { name: 'totalDebtBase', type: 'uint256', description: 'aave-v3.fn.getUserAccountData.returns.totalDebtBase' },
        { name: 'availableBorrowsBase', type: 'uint256', description: 'aave-v3.fn.getUserAccountData.returns.availableBorrowsBase' },
        { name: 'currentLiquidationThreshold', type: 'uint256', description: 'aave-v3.fn.getUserAccountData.returns.currentLiquidationThreshold' },
        { name: 'ltv', type: 'uint256', description: 'aave-v3.fn.getUserAccountData.returns.ltv' },
        { name: 'healthFactor', type: 'uint256', description: 'aave-v3.fn.getUserAccountData.returns.healthFactor' },
      ],
      description: 'aave-v3.fn.getUserAccountData.desc',
      defaultSimValues: {},
    },
  ],

  // ─── Schema v2 content sections ───
  composes: [
    { slug: 'erc20', role: 'aave-v3.compose.erc20.role' },
    { slug: 'erc2612', role: 'aave-v3.compose.erc2612.role' },
  ],

  references: [
    {
      label: 'Aave V3 docs — Tokenization (aTokens & debt tokens)',
      url: 'https://aave.com/docs/aave-v3/smart-contracts/tokenization',
      kind: 'spec',
    },
    {
      label: 'AToken.sol (EIP-2612 permit)',
      url: 'https://github.com/aave/aave-v3-core/blob/master/contracts/protocol/tokenization/AToken.sol',
      kind: 'impl',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'depositor',
      type: 'user',
      label: 'aave-v3.node.depositor',
      data: { address: '0xDepositor', balance: '10 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'borrower',
      type: 'user',
      label: 'aave-v3.node.borrower',
      data: { address: '0xBorrower', balance: '5 ETH collateral' },
    },
    {
      id: 'pool-contract',
      type: 'contract',
      label: 'aave-v3.node.poolContract',
      data: { functions: ['supply', 'borrow', 'repay', 'withdraw', 'liquidationCall', 'flashLoan'] },
      layoutHint: 'center',
    },
    {
      id: 'atoken',
      type: 'tokenFlow',
      label: 'aave-v3.node.atoken',
      data: { symbol: 'aWETH', amount: '0' },
    },
    {
      id: 'debt-token',
      type: 'tokenFlow',
      label: 'aave-v3.node.debtToken',
      data: { symbol: 'variableDebtUSDC', amount: '0' },
    },
    {
      id: 'oracle',
      type: 'contract',
      label: 'aave-v3.node.oracle',
      data: { functions: ['getAssetPrice', 'getAssetsPrices'] },
    },
    {
      id: 'liquidator',
      type: 'user',
      label: 'aave-v3.node.liquidator',
      data: { address: '0xLiquidator', balance: 'USDC to repay' },
      layoutHint: 'sink',
    },
    {
      id: 'reserve',
      type: 'storage',
      label: 'aave-v3.node.reserve',
      data: {
        slots: [
          { key: 'liquidityIndex', label: 'uint128' },
          { key: 'currentLiquidityRate', label: 'uint128' },
          { key: 'variableBorrowIndex', label: 'uint128' },
          { key: 'currentVariableBorrowRate', label: 'uint128' },
        ],
      },
      layoutHint: 'storage',
    },
  ],

  flowEdges: [
    {
      id: 'e-depositor-pool',
      source: 'depositor',
      target: 'pool-contract',
      type: 'animated',
      label: 'aave-v3.edge.supply',
    },
    {
      id: 'e-pool-atoken',
      source: 'pool-contract',
      target: 'atoken',
      type: 'fundFlow',
      label: 'aave-v3.edge.mintAToken',
    },
    {
      id: 'e-atoken-depositor',
      source: 'atoken',
      target: 'depositor',
      type: 'fundFlow',
      label: 'aave-v3.edge.aTokenToDepositor',
    },
    {
      id: 'e-borrower-pool',
      source: 'borrower',
      target: 'pool-contract',
      type: 'animated',
      label: 'aave-v3.edge.borrow',
    },
    {
      id: 'e-pool-debtToken',
      source: 'pool-contract',
      target: 'debt-token',
      type: 'fundFlow',
      label: 'aave-v3.edge.mintDebtToken',
    },
    {
      id: 'e-pool-reserve',
      source: 'pool-contract',
      target: 'reserve',
      type: 'labeled',
      label: 'aave-v3.edge.updateReserveState',
    },
    {
      id: 'e-oracle-pool',
      source: 'oracle',
      target: 'pool-contract',
      type: 'labeled',
      label: 'aave-v3.edge.assetPrice',
    },
    {
      id: 'e-liquidator-pool',
      source: 'liquidator',
      target: 'pool-contract',
      type: 'animated',
      label: 'aave-v3.edge.liquidationCall',
    },
    {
      id: 'e-pool-liquidator',
      source: 'pool-contract',
      target: 'liquidator',
      type: 'fundFlow',
      label: 'aave-v3.edge.collateralBonus',
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
      id: 'supply-and-borrow',
      name: 'aave-v3.sim.supplyAndBorrow.name',
      description: 'aave-v3.sim.supplyAndBorrow.desc',
      params: [
        { id: 'supplyAmount', label: 'aave-v3.sim.supplyAndBorrow.param.supplyAmount', type: 'uint256', defaultValue: '1000000000000000000' },
        { id: 'borrowAmount', label: 'aave-v3.sim.supplyAndBorrow.param.borrowAmount', type: 'uint256', defaultValue: '500000000' },
        { id: 'interestRateMode', label: 'aave-v3.sim.supplyAndBorrow.param.interestRateMode', type: 'select', options: [{ label: 'Stable (1)', value: '1' }, { label: 'Variable (2)', value: '2' }], defaultValue: '2' },
      ],
      steps: [
        {
          id: 'step-supply',
          description: 'aave-v3.sim.supplyAndBorrow.step.supply',
          mobileDescription: 'aave-v3.sim.supplyAndBorrow.step.supply.mobile',
          highlightNodes: ['depositor', 'pool-contract', 'reserve'],
          highlightEdges: ['e-depositor-pool', 'e-pool-reserve'],
          valueChanges: {
            'pool-contract.wethBalance': '+1 WETH',
            'reserve.liquidityIndex': 'updated with supply rate',
          },
          durationMs: 1200,
        },
        {
          id: 'step-mint-atoken',
          description: 'aave-v3.sim.supplyAndBorrow.step.mintAToken',
          mobileDescription: 'aave-v3.sim.supplyAndBorrow.step.mintAToken.mobile',
          highlightNodes: ['pool-contract', 'atoken', 'depositor'],
          highlightEdges: ['e-pool-atoken', 'e-atoken-depositor'],
          valueChanges: {
            'atoken.totalSupply': '0 → 1 aWETH minted',
            'depositor.aWETH': '0 → 1 aWETH (interest-bearing)',
          },
          durationMs: 1200,
        },
        {
          id: 'step-check-collateral',
          description: 'aave-v3.sim.supplyAndBorrow.step.checkCollateral',
          mobileDescription: 'aave-v3.sim.supplyAndBorrow.step.checkCollateral.mobile',
          highlightNodes: ['pool-contract', 'oracle', 'reserve'],
          highlightEdges: ['e-oracle-pool', 'e-pool-reserve'],
          valueChanges: {
            'pool-contract.healthFactor': '> 1 (safe to borrow)',
            'oracle.ethPrice': '$3000 (collateral valued)',
          },
          durationMs: 1000,
        },
        {
          id: 'step-borrow',
          description: 'aave-v3.sim.supplyAndBorrow.step.borrow',
          mobileDescription: 'aave-v3.sim.supplyAndBorrow.step.borrow.mobile',
          highlightNodes: ['borrower', 'pool-contract', 'debt-token'],
          highlightEdges: ['e-borrower-pool', 'e-pool-debtToken'],
          valueChanges: {
            'pool-contract.usdcBalance': '-500 USDC lent out',
            'debt-token.totalSupply': '0 → 500 variableDebtUSDC minted',
            'borrower.usdc': '0 → 500 USDC received',
          },
          durationMs: 1500,
        },
      ],
    },
    {
      id: 'liquidation',
      name: 'aave-v3.sim.liquidation.name',
      description: 'aave-v3.sim.liquidation.desc',
      params: [
        { id: 'borrowerAddress', label: 'aave-v3.sim.liquidation.param.borrowerAddress', type: 'address', defaultValue: '0xBorrower' },
        { id: 'debtToCover', label: 'aave-v3.sim.liquidation.param.debtToCover', type: 'uint256', defaultValue: '250000000' },
      ],
      steps: [
        {
          id: 'step-health-factor-drop',
          description: 'aave-v3.sim.liquidation.step.healthFactorDrop',
          mobileDescription: 'aave-v3.sim.liquidation.step.healthFactorDrop.mobile',
          highlightNodes: ['oracle', 'pool-contract', 'reserve'],
          highlightEdges: ['e-oracle-pool', 'e-pool-reserve'],
          valueChanges: {
            'oracle.ethPrice': '$3000 → $1500 (price crash)',
            'pool-contract.healthFactor': '1.5 → 0.75 (below 1 = liquidatable)',
          },
          durationMs: 1500,
        },
        {
          id: 'step-liquidation-call',
          description: 'aave-v3.sim.liquidation.step.liquidationCall',
          mobileDescription: 'aave-v3.sim.liquidation.step.liquidationCall.mobile',
          highlightNodes: ['liquidator', 'pool-contract', 'debt-token'],
          highlightEdges: ['e-liquidator-pool', 'e-pool-debtToken'],
          valueChanges: {
            'liquidator.usdc': '-250 USDC repaid on behalf of borrower',
            'debt-token.totalSupply': '500 → 250 variableDebtUSDC burned',
          },
          durationMs: 1500,
        },
        {
          id: 'step-collateral-seized',
          description: 'aave-v3.sim.liquidation.step.collateralSeized',
          mobileDescription: 'aave-v3.sim.liquidation.step.collateralSeized.mobile',
          highlightNodes: ['pool-contract', 'liquidator', 'atoken'],
          highlightEdges: ['e-pool-liquidator'],
          valueChanges: {
            'liquidator.weth': '+0.175 WETH collateral (debt + 5% bonus)',
            'borrower.aWETH': '1 → 0.825 aWETH remaining',
          },
          durationMs: 1200,
        },
      ],
    },
  ],

  contracts: [
    { chain: 'Ethereum', address: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', label: 'Pool V3' },
    { chain: 'Ethereum', address: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e', label: 'PoolAddressesProvider' },
  ],
};
