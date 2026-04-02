import type { ProtocolEntry } from '../types';

export const entry: ProtocolEntry = {
  // ─── ERCMeta ───
  slug: 'maker-dao',
  name: 'MakerDAO',
  shortDescription: 'maker-dao.short',
  category: 'defi',
  entryType: 'protocol',
  officialUrl: 'https://makerdao.com',
  relatedSlugs: ['aave-v3', 'compound-v3', 'erc20', 'chainlink-oracle'],
  sortOrder: 2800,

  // ─── ERCContent ───
  introduction: 'maker-dao.introduction',
  designPurpose: 'maker-dao.designPurpose',
  commonUsage: 'maker-dao.commonUsage',

  functions: [
    {
      name: 'open',
      signature: 'open(bytes32 ilk, address usr) → uint256 cdp',
      type: 'write',
      params: [
        { name: 'ilk', type: 'bytes32', description: 'maker-dao.fn.open.params.ilk' },
        { name: 'usr', type: 'address', description: 'maker-dao.fn.open.params.usr' },
      ],
      returns: [{ name: 'cdp', type: 'uint256', description: 'maker-dao.fn.open.returns.cdp' }],
      description: 'maker-dao.fn.open.desc',
      defaultSimValues: { ilk: '0x4554482d41000000000000000000000000000000000000000000000000000000', usr: '0xYourAddress' },
    },
    {
      name: 'lock',
      signature: 'lock(uint256 cdp, uint256 wad)',
      type: 'write',
      params: [
        { name: 'cdp', type: 'uint256', description: 'maker-dao.fn.lock.params.cdp' },
        { name: 'wad', type: 'uint256', description: 'maker-dao.fn.lock.params.wad' },
      ],
      description: 'maker-dao.fn.lock.desc',
      defaultSimValues: { cdp: '1', wad: '1000000000000000000' },
    },
    {
      name: 'draw',
      signature: 'draw(uint256 cdp, uint256 wad)',
      type: 'write',
      params: [
        { name: 'cdp', type: 'uint256', description: 'maker-dao.fn.draw.params.cdp' },
        { name: 'wad', type: 'uint256', description: 'maker-dao.fn.draw.params.wad' },
      ],
      description: 'maker-dao.fn.draw.desc',
      defaultSimValues: { cdp: '1', wad: '500000000000000000000' },
    },
    {
      name: 'wipe',
      signature: 'wipe(uint256 cdp, uint256 wad)',
      type: 'write',
      params: [
        { name: 'cdp', type: 'uint256', description: 'maker-dao.fn.wipe.params.cdp' },
        { name: 'wad', type: 'uint256', description: 'maker-dao.fn.wipe.params.wad' },
      ],
      description: 'maker-dao.fn.wipe.desc',
      defaultSimValues: { cdp: '1', wad: '100000000000000000000' },
    },
    {
      name: 'bite',
      signature: 'bite(bytes32 ilk, address urn) → uint256 id',
      type: 'write',
      params: [
        { name: 'ilk', type: 'bytes32', description: 'maker-dao.fn.bite.params.ilk' },
        { name: 'urn', type: 'address', description: 'maker-dao.fn.bite.params.urn' },
      ],
      returns: [{ name: 'id', type: 'uint256', description: 'maker-dao.fn.bite.returns.id' }],
      description: 'maker-dao.fn.bite.desc',
      defaultSimValues: { ilk: '0x4554482d41000000000000000000000000000000000000000000000000000000', urn: '0xUndercollateralizedVault' },
    },
    {
      name: 'frob',
      signature: 'frob(bytes32 i, address u, address v, address w, int256 dink, int256 dart)',
      type: 'write',
      params: [
        { name: 'i', type: 'bytes32', description: 'maker-dao.fn.frob.params.i' },
        { name: 'u', type: 'address', description: 'maker-dao.fn.frob.params.u' },
        { name: 'v', type: 'address', description: 'maker-dao.fn.frob.params.v' },
        { name: 'w', type: 'address', description: 'maker-dao.fn.frob.params.w' },
        { name: 'dink', type: 'int256', description: 'maker-dao.fn.frob.params.dink' },
        { name: 'dart', type: 'int256', description: 'maker-dao.fn.frob.params.dart' },
      ],
      description: 'maker-dao.fn.frob.desc',
      defaultSimValues: { dink: '1000000000000000000', dart: '500000000000000000000' },
    },
    {
      name: 'drip',
      signature: 'drip(bytes32 ilk) → uint256 rate',
      type: 'write',
      params: [
        { name: 'ilk', type: 'bytes32', description: 'maker-dao.fn.drip.params.ilk' },
      ],
      returns: [{ name: 'rate', type: 'uint256', description: 'maker-dao.fn.drip.returns.rate' }],
      description: 'maker-dao.fn.drip.desc',
      defaultSimValues: { ilk: '0x4554482d41000000000000000000000000000000000000000000000000000000' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'vault-owner',
      type: 'user',
      label: 'maker-dao.node.vault-owner',
      data: { address: '0xVaultOwner', balance: '10 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'cdp-manager',
      type: 'contract',
      label: 'maker-dao.node.cdp-manager',
      data: { functions: ['open', 'lock', 'draw', 'wipe', 'frob'] },
      layoutHint: 'center',
    },
    {
      id: 'vat-contract',
      type: 'contract',
      label: 'maker-dao.node.vat-contract',
      data: { functions: ['frob', 'fork', 'grab', 'heal'] },
    },
    {
      id: 'collateral',
      type: 'tokenFlow',
      label: 'maker-dao.node.collateral',
      data: { symbol: 'ETH', amount: '0' },
    },
    {
      id: 'dai-token',
      type: 'tokenFlow',
      label: 'maker-dao.node.dai-token',
      data: { symbol: 'DAI', amount: '0' },
    },
    {
      id: 'jug',
      type: 'contract',
      label: 'maker-dao.node.jug',
      data: { functions: ['drip'] },
    },
    {
      id: 'spotter',
      type: 'contract',
      label: 'maker-dao.node.spotter',
      data: { functions: ['poke'] },
    },
    {
      id: 'liquidation-engine',
      type: 'contract',
      label: 'maker-dao.node.liquidation-engine',
      data: { functions: ['bite', 'bark'] },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-owner-cdp',
      source: 'vault-owner',
      target: 'cdp-manager',
      type: 'animated',
      label: 'maker-dao.edge.openLockDraw',
    },
    {
      id: 'e-cdp-vat',
      source: 'cdp-manager',
      target: 'vat-contract',
      type: 'animated',
      label: 'maker-dao.edge.frob',
    },
    {
      id: 'e-owner-collateral',
      source: 'vault-owner',
      target: 'collateral',
      type: 'fundFlow',
      label: 'maker-dao.edge.lockCollateral',
    },
    {
      id: 'e-collateral-vat',
      source: 'collateral',
      target: 'vat-contract',
      type: 'fundFlow',
    },
    {
      id: 'e-vat-dai',
      source: 'vat-contract',
      target: 'dai-token',
      type: 'fundFlow',
      label: 'maker-dao.edge.mintDai',
    },
    {
      id: 'e-dai-owner',
      source: 'dai-token',
      target: 'vault-owner',
      type: 'fundFlow',
    },
    {
      id: 'e-jug-vat',
      source: 'jug',
      target: 'vat-contract',
      type: 'labeled',
      label: 'maker-dao.edge.accrueInterest',
    },
    {
      id: 'e-spotter-vat',
      source: 'spotter',
      target: 'vat-contract',
      type: 'labeled',
      label: 'maker-dao.edge.updatePrice',
    },
    {
      id: 'e-vat-liquidation',
      source: 'vat-contract',
      target: 'liquidation-engine',
      type: 'animated',
      label: 'maker-dao.edge.triggerLiquidation',
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
      id: 'open-vault-draw-dai',
      name: 'maker-dao.sim.open-vault-draw-dai.name',
      description: 'maker-dao.sim.open-vault-draw-dai.desc',
      params: [
        {
          id: 'collateralAmount',
          label: 'maker-dao.sim.open-vault-draw-dai.param.collateralAmount',
          type: 'uint256',
          defaultValue: '2000000000000000000',
        },
        {
          id: 'daiAmount',
          label: 'maker-dao.sim.open-vault-draw-dai.param.daiAmount',
          type: 'uint256',
          defaultValue: '1000000000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-open',
          description: 'maker-dao.sim.open-vault-draw-dai.step.open',
          mobileDescription: 'maker-dao.sim.open-vault-draw-dai.step.open.mobile',
          highlightNodes: ['vault-owner', 'cdp-manager'],
          highlightEdges: ['e-owner-cdp'],
          valueChanges: { 'cdp-manager.cdpCount': '0 → 1' },
          durationMs: 1200,
        },
        {
          id: 'step-lock',
          description: 'maker-dao.sim.open-vault-draw-dai.step.lock',
          mobileDescription: 'maker-dao.sim.open-vault-draw-dai.step.lock.mobile',
          highlightNodes: ['vault-owner', 'collateral', 'vat-contract'],
          highlightEdges: ['e-owner-collateral', 'e-collateral-vat', 'e-cdp-vat'],
          valueChanges: {
            'collateral.amount': '0 → 2 ETH',
            'vat-contract.ink': '0 → 2e18',
          },
          durationMs: 1500,
        },
        {
          id: 'step-draw',
          description: 'maker-dao.sim.open-vault-draw-dai.step.draw',
          mobileDescription: 'maker-dao.sim.open-vault-draw-dai.step.draw.mobile',
          highlightNodes: ['vat-contract', 'dai-token', 'vault-owner'],
          highlightEdges: ['e-vat-dai', 'e-dai-owner'],
          valueChanges: {
            'dai-token.amount': '0 → 1000 DAI',
            'vault-owner.balance': '10 ETH → 8 ETH + 1000 DAI',
          },
          durationMs: 1500,
        },
        {
          id: 'step-interest',
          description: 'maker-dao.sim.open-vault-draw-dai.step.interest',
          mobileDescription: 'maker-dao.sim.open-vault-draw-dai.step.interest.mobile',
          highlightNodes: ['jug', 'vat-contract'],
          highlightEdges: ['e-jug-vat'],
          valueChanges: { 'vat-contract.rate': 'updated with stability fee' },
          durationMs: 1000,
        },
      ],
    },
    {
      id: 'liquidation-process',
      name: 'maker-dao.sim.liquidation-process.name',
      description: 'maker-dao.sim.liquidation-process.desc',
      params: [
        {
          id: 'vaultAddress',
          label: 'maker-dao.sim.liquidation-process.param.vaultAddress',
          type: 'address',
          defaultValue: '0xUndercollateralizedVault',
        },
      ],
      steps: [
        {
          id: 'step-price-drop',
          description: 'maker-dao.sim.liquidation-process.step.priceDrop',
          mobileDescription: 'maker-dao.sim.liquidation-process.step.priceDrop.mobile',
          highlightNodes: ['spotter', 'vat-contract'],
          highlightEdges: ['e-spotter-vat'],
          valueChanges: { 'spotter.ethPrice': '$2000 → $1200 (below liquidation ratio)' },
          durationMs: 1200,
        },
        {
          id: 'step-bite',
          description: 'maker-dao.sim.liquidation-process.step.bite',
          mobileDescription: 'maker-dao.sim.liquidation-process.step.bite.mobile',
          highlightNodes: ['vat-contract', 'liquidation-engine'],
          highlightEdges: ['e-vat-liquidation'],
          valueChanges: { 'liquidation-engine.auctionId': '0 → 1' },
          durationMs: 1500,
        },
        {
          id: 'step-auction',
          description: 'maker-dao.sim.liquidation-process.step.auction',
          mobileDescription: 'maker-dao.sim.liquidation-process.step.auction.mobile',
          highlightNodes: ['liquidation-engine', 'collateral', 'dai-token'],
          highlightEdges: ['e-collateral-vat', 'e-vat-dai'],
          valueChanges: {
            'collateral.amount': '2 ETH → 0 ETH (auctioned)',
            'dai-token.amount': 'debt repaid via auction',
          },
          durationMs: 2000,
        },
      ],
    },
  ],

  contracts: [
    {
      chain: 'Ethereum',
      address: '0x5ef30b9986345249bc32d8928B7ee64DE9435E39',
      label: 'CDP Manager',
    },
  ],
};
