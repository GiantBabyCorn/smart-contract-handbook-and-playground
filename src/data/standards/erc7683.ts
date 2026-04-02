import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7683',
  name: 'ERC-7683',
  shortDescription: 'erc7683.short',
  category: 'cross-chain',
  entryType: 'standard',
  eipNumber: 7683,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7683',
  relatedSlugs: ['uniswap-v4', 'erc20'],
  sortOrder: 1900,

  // ─── ERCContent ───
  introduction: 'erc7683.introduction',
  designPurpose: 'erc7683.designPurpose',
  commonUsage: 'erc7683.commonUsage',

  functions: [
    {
      name: 'open',
      signature: 'open(OnchainCrossChainOrder calldata order)',
      type: 'write',
      params: [
        { name: 'order', type: 'OnchainCrossChainOrder', description: 'erc7683.fn.open.params.order' },
      ],
      description: 'erc7683.fn.open.desc',
      defaultSimValues: { order: '0x' },
    },
    {
      name: 'fill',
      signature: 'fill(bytes32 orderId, bytes calldata originData, bytes calldata fillerData)',
      type: 'write',
      params: [
        { name: 'orderId', type: 'bytes32', description: 'erc7683.fn.fill.params.orderId' },
        { name: 'originData', type: 'bytes', description: 'erc7683.fn.fill.params.originData' },
        { name: 'fillerData', type: 'bytes', description: 'erc7683.fn.fill.params.fillerData' },
      ],
      description: 'erc7683.fn.fill.desc',
      defaultSimValues: { orderId: '0xOrderHash', originData: '0x', fillerData: '0x' },
    },
    {
      name: 'resolve',
      signature: 'resolve(GaslessCrossChainOrder calldata order, bytes calldata sig, bytes calldata originFillerData) → ResolvedCrossChainOrder',
      type: 'write',
      params: [
        { name: 'order', type: 'GaslessCrossChainOrder', description: 'erc7683.fn.resolve.params.order' },
        { name: 'sig', type: 'bytes', description: 'erc7683.fn.resolve.params.sig' },
        { name: 'originFillerData', type: 'bytes', description: 'erc7683.fn.resolve.params.originFillerData' },
      ],
      returns: [{ name: 'resolvedOrder', type: 'ResolvedCrossChainOrder', description: 'erc7683.fn.resolve.returns.resolvedOrder' }],
      description: 'erc7683.fn.resolve.desc',
      defaultSimValues: { sig: '0x', originFillerData: '0x' },
    },
    {
      name: 'GaslessCrossChainOrder',
      signature: 'GaslessCrossChainOrder(address originSettler, address user, uint256 nonce, uint256 originChainId, uint32 openDeadline, uint32 fillDeadline, bytes32 orderDataType, bytes orderData)',
      type: 'event',
      params: [
        { name: 'originSettler', type: 'address', description: 'erc7683.fn.GaslessCrossChainOrder.params.originSettler' },
        { name: 'user', type: 'address', description: 'erc7683.fn.GaslessCrossChainOrder.params.user' },
        { name: 'nonce', type: 'uint256', description: 'erc7683.fn.GaslessCrossChainOrder.params.nonce' },
        { name: 'originChainId', type: 'uint256', description: 'erc7683.fn.GaslessCrossChainOrder.params.originChainId' },
        { name: 'openDeadline', type: 'uint32', description: 'erc7683.fn.GaslessCrossChainOrder.params.openDeadline' },
        { name: 'fillDeadline', type: 'uint32', description: 'erc7683.fn.GaslessCrossChainOrder.params.fillDeadline' },
        { name: 'orderDataType', type: 'bytes32', description: 'erc7683.fn.GaslessCrossChainOrder.params.orderDataType' },
        { name: 'orderData', type: 'bytes', description: 'erc7683.fn.GaslessCrossChainOrder.params.orderData' },
      ],
      description: 'erc7683.fn.GaslessCrossChainOrder.desc',
    },
    {
      name: 'OnchainCrossChainOrder',
      signature: 'OnchainCrossChainOrder(uint32 fillDeadline, bytes32 orderDataType, bytes orderData)',
      type: 'event',
      params: [
        { name: 'fillDeadline', type: 'uint32', description: 'erc7683.fn.OnchainCrossChainOrder.params.fillDeadline' },
        { name: 'orderDataType', type: 'bytes32', description: 'erc7683.fn.OnchainCrossChainOrder.params.orderDataType' },
        { name: 'orderData', type: 'bytes', description: 'erc7683.fn.OnchainCrossChainOrder.params.orderData' },
      ],
      description: 'erc7683.fn.OnchainCrossChainOrder.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc7683.node.user',
      data: { address: '0xUser', balance: '100 USDC (Origin)' },
      layoutHint: 'source',
    },
    {
      id: 'origin-chain',
      type: 'contract',
      label: 'erc7683.node.originChain',
      data: { functions: ['open', 'resolve'] },
    },
    {
      id: 'settlement-contract',
      type: 'contract',
      label: 'erc7683.node.settlementContract',
      data: { functions: ['open', 'fill', 'settle', 'refund'] },
      layoutHint: 'center',
    },
    {
      id: 'filler',
      type: 'user',
      label: 'erc7683.node.filler',
      data: { address: '0xFiller', balance: '500 USDC (Dest)' },
    },
    {
      id: 'destination-chain',
      type: 'contract',
      label: 'erc7683.node.destinationChain',
      data: { functions: ['fill'] },
    },
    {
      id: 'resolver',
      type: 'contract',
      label: 'erc7683.node.resolver',
      data: { functions: ['resolve', 'validate'] },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-settlement',
      source: 'user',
      target: 'settlement-contract',
      type: 'animated',
      label: 'erc7683.edge.openOrder',
    },
    {
      id: 'e-settlement-origin',
      source: 'settlement-contract',
      target: 'origin-chain',
      type: 'labeled',
      label: 'erc7683.edge.lockFunds',
    },
    {
      id: 'e-settlement-filler',
      source: 'settlement-contract',
      target: 'filler',
      type: 'animated',
      label: 'erc7683.edge.broadcastOrder',
    },
    {
      id: 'e-filler-destination',
      source: 'filler',
      target: 'destination-chain',
      type: 'animated',
      label: 'erc7683.edge.fill',
    },
    {
      id: 'e-destination-resolver',
      source: 'destination-chain',
      target: 'resolver',
      type: 'labeled',
      label: 'erc7683.edge.proveSettlement',
    },
    {
      id: 'e-resolver-settlement',
      source: 'resolver',
      target: 'settlement-contract',
      type: 'fundFlow',
      label: 'erc7683.edge.releaseFunds',
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
      id: 'cross-chain-intent',
      name: 'erc7683.sim.crossChainIntent.name',
      description: 'erc7683.sim.crossChainIntent.desc',
      params: [
        {
          id: 'userAddress',
          label: 'erc7683.sim.crossChainIntent.param.userAddress',
          type: 'address',
          defaultValue: '0xUser',
        },
        {
          id: 'inputToken',
          label: 'erc7683.sim.crossChainIntent.param.inputToken',
          type: 'address',
          defaultValue: '0xUSDC_Ethereum',
        },
        {
          id: 'outputToken',
          label: 'erc7683.sim.crossChainIntent.param.outputToken',
          type: 'address',
          defaultValue: '0xUSDC_Optimism',
        },
        {
          id: 'amount',
          label: 'erc7683.sim.crossChainIntent.param.amount',
          type: 'uint256',
          defaultValue: '100',
        },
      ],
      steps: [
        {
          id: 'step-open',
          description: 'erc7683.sim.crossChainIntent.step.open',
          mobileDescription: 'erc7683.sim.crossChainIntent.step.open.mobile',
          highlightNodes: ['user', 'settlement-contract', 'origin-chain'],
          highlightEdges: ['e-user-settlement', 'e-settlement-origin'],
          valueChanges: {
            'settlement-contract.orderId': '0xOrderHash',
            'origin-chain.lockedFunds': '100 USDC',
          },
          durationMs: 1200,
        },
        {
          id: 'step-broadcast',
          description: 'erc7683.sim.crossChainIntent.step.broadcast',
          mobileDescription: 'erc7683.sim.crossChainIntent.step.broadcast.mobile',
          highlightNodes: ['settlement-contract', 'filler'],
          highlightEdges: ['e-settlement-filler'],
          valueChanges: {
            'filler.seenOrder': '0xOrderHash',
            'filler.profitEstimate': '0.3 USDC',
          },
          durationMs: 1000,
        },
        {
          id: 'step-fill',
          description: 'erc7683.sim.crossChainIntent.step.fill',
          mobileDescription: 'erc7683.sim.crossChainIntent.step.fill.mobile',
          highlightNodes: ['filler', 'destination-chain'],
          highlightEdges: ['e-filler-destination'],
          valueChanges: {
            'destination-chain.userReceived': '99.7 USDC',
            'destination-chain.fillStatus': 'filled',
          },
          durationMs: 1400,
        },
        {
          id: 'step-settle',
          description: 'erc7683.sim.crossChainIntent.step.settle',
          mobileDescription: 'erc7683.sim.crossChainIntent.step.settle.mobile',
          highlightNodes: ['destination-chain', 'resolver', 'settlement-contract'],
          highlightEdges: ['e-destination-resolver', 'e-resolver-settlement'],
          valueChanges: {
            'settlement-contract.status': 'open → settled',
            'filler.received': '100 USDC (origin)',
          },
          durationMs: 1500,
        },
      ],
    },
  ],
};
