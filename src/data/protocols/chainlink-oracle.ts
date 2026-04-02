import type { ProtocolEntry } from '../types';

export const entry: ProtocolEntry = {
  // ─── ERCMeta ───
  slug: 'chainlink-oracle',
  name: 'Chainlink Oracle',
  shortDescription: 'chainlink-oracle.short',
  category: 'oracle',
  entryType: 'protocol',
  officialUrl: 'https://chain.link',
  relatedSlugs: ['aave-v3', 'compound-v3', 'maker-dao'],
  sortOrder: 2900,

  // ─── ERCContent ───
  introduction: 'chainlink-oracle.introduction',
  designPurpose: 'chainlink-oracle.designPurpose',
  commonUsage: 'chainlink-oracle.commonUsage',

  functions: [
    {
      name: 'latestRoundData',
      signature: 'latestRoundData() → (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
      type: 'read',
      params: [],
      returns: [
        { name: 'roundId', type: 'uint80', description: 'chainlink-oracle.fn.latestRoundData.returns.roundId' },
        { name: 'answer', type: 'int256', description: 'chainlink-oracle.fn.latestRoundData.returns.answer' },
        { name: 'startedAt', type: 'uint256', description: 'chainlink-oracle.fn.latestRoundData.returns.startedAt' },
        { name: 'updatedAt', type: 'uint256', description: 'chainlink-oracle.fn.latestRoundData.returns.updatedAt' },
        { name: 'answeredInRound', type: 'uint80', description: 'chainlink-oracle.fn.latestRoundData.returns.answeredInRound' },
      ],
      description: 'chainlink-oracle.fn.latestRoundData.desc',
      defaultSimValues: {},
    },
    {
      name: 'getRoundData',
      signature: 'getRoundData(uint80 _roundId) → (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
      type: 'read',
      params: [
        { name: '_roundId', type: 'uint80', description: 'chainlink-oracle.fn.getRoundData.params.roundId' },
      ],
      returns: [
        { name: 'roundId', type: 'uint80', description: 'chainlink-oracle.fn.getRoundData.returns.roundId' },
        { name: 'answer', type: 'int256', description: 'chainlink-oracle.fn.getRoundData.returns.answer' },
        { name: 'startedAt', type: 'uint256', description: 'chainlink-oracle.fn.getRoundData.returns.startedAt' },
        { name: 'updatedAt', type: 'uint256', description: 'chainlink-oracle.fn.getRoundData.returns.updatedAt' },
        { name: 'answeredInRound', type: 'uint80', description: 'chainlink-oracle.fn.getRoundData.returns.answeredInRound' },
      ],
      description: 'chainlink-oracle.fn.getRoundData.desc',
      defaultSimValues: { _roundId: '18446744073709551617' },
    },
    {
      name: 'decimals',
      signature: 'decimals() → uint8',
      type: 'read',
      params: [],
      returns: [{ name: 'decimals', type: 'uint8', description: 'chainlink-oracle.fn.decimals.returns.decimals' }],
      description: 'chainlink-oracle.fn.decimals.desc',
      defaultSimValues: {},
    },
    {
      name: 'description',
      signature: 'description() → string',
      type: 'read',
      params: [],
      returns: [{ name: 'description', type: 'string', description: 'chainlink-oracle.fn.description.returns.description' }],
      description: 'chainlink-oracle.fn.description.desc',
      defaultSimValues: {},
    },
    {
      name: 'AnswerUpdated',
      signature: 'AnswerUpdated(int256 indexed current, uint256 indexed roundId, uint256 updatedAt)',
      type: 'event',
      params: [
        { name: 'current', type: 'int256', description: 'chainlink-oracle.fn.AnswerUpdated.params.current' },
        { name: 'roundId', type: 'uint256', description: 'chainlink-oracle.fn.AnswerUpdated.params.roundId' },
        { name: 'updatedAt', type: 'uint256', description: 'chainlink-oracle.fn.AnswerUpdated.params.updatedAt' },
      ],
      description: 'chainlink-oracle.fn.AnswerUpdated.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'consumer-contract',
      type: 'contract',
      label: 'chainlink-oracle.node.consumer-contract',
      data: { functions: ['latestRoundData', 'getRoundData'] },
      layoutHint: 'source',
    },
    {
      id: 'aggregator-proxy',
      type: 'proxy',
      label: 'chainlink-oracle.node.aggregator-proxy',
      data: { implementation: 'EACAggregatorProxy' },
      layoutHint: 'center',
    },
    {
      id: 'aggregator',
      type: 'contract',
      label: 'chainlink-oracle.node.aggregator',
      data: { functions: ['latestRoundData', 'getRoundData', 'decimals', 'description'] },
    },
    {
      id: 'oracle-nodes',
      type: 'user',
      label: 'chainlink-oracle.node.oracle-nodes',
      data: { address: '0xOracleNetwork', balance: 'N DON nodes' },
    },
    {
      id: 'off-chain-data',
      type: 'tokenFlow',
      label: 'chainlink-oracle.node.off-chain-data',
      data: { symbol: 'PRICE', amount: 'off-chain' },
    },
    {
      id: 'round-storage',
      type: 'storage',
      label: 'chainlink-oracle.node.round-storage',
      data: {
        slots: [
          { key: 'latestRound', label: 'uint80' },
          { key: 'rounds', label: 'mapping(uint80 => Round)' },
          { key: 'answer', label: 'int256' },
        ],
      },
      layoutHint: 'storage',
    },
  ],

  flowEdges: [
    {
      id: 'e-consumer-proxy',
      source: 'consumer-contract',
      target: 'aggregator-proxy',
      type: 'animated',
      label: 'chainlink-oracle.edge.requestPrice',
    },
    {
      id: 'e-proxy-aggregator',
      source: 'aggregator-proxy',
      target: 'aggregator',
      type: 'animated',
      label: 'chainlink-oracle.edge.delegate',
    },
    {
      id: 'e-aggregator-storage',
      source: 'aggregator',
      target: 'round-storage',
      type: 'labeled',
      label: 'chainlink-oracle.edge.readRound',
    },
    {
      id: 'e-offchain-nodes',
      source: 'off-chain-data',
      target: 'oracle-nodes',
      type: 'fundFlow',
      label: 'chainlink-oracle.edge.fetchData',
    },
    {
      id: 'e-nodes-aggregator',
      source: 'oracle-nodes',
      target: 'aggregator',
      type: 'animated',
      label: 'chainlink-oracle.edge.submitAnswer',
    },
    {
      id: 'e-aggregator-proxy-return',
      source: 'aggregator',
      target: 'aggregator-proxy',
      type: 'labeled',
      label: 'chainlink-oracle.edge.returnPrice',
    },
    {
      id: 'e-proxy-consumer-return',
      source: 'aggregator-proxy',
      target: 'consumer-contract',
      type: 'labeled',
      label: 'chainlink-oracle.edge.priceData',
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
      id: 'price-feed-request',
      name: 'chainlink-oracle.sim.price-feed-request.name',
      description: 'chainlink-oracle.sim.price-feed-request.desc',
      params: [
        {
          id: 'consumerAddress',
          label: 'chainlink-oracle.sim.price-feed-request.param.consumerAddress',
          type: 'address',
          defaultValue: '0xMyDeFiContract',
        },
      ],
      steps: [
        {
          id: 'step-off-chain-fetch',
          description: 'chainlink-oracle.sim.price-feed-request.step.offChainFetch',
          mobileDescription: 'chainlink-oracle.sim.price-feed-request.step.offChainFetch.mobile',
          highlightNodes: ['off-chain-data', 'oracle-nodes'],
          highlightEdges: ['e-offchain-nodes'],
          valueChanges: { 'oracle-nodes.pendingAnswers': 'N nodes fetching ETH/USD price' },
          durationMs: 1200,
        },
        {
          id: 'step-submit',
          description: 'chainlink-oracle.sim.price-feed-request.step.submit',
          mobileDescription: 'chainlink-oracle.sim.price-feed-request.step.submit.mobile',
          highlightNodes: ['oracle-nodes', 'aggregator', 'round-storage'],
          highlightEdges: ['e-nodes-aggregator', 'e-aggregator-storage'],
          valueChanges: {
            'round-storage.latestRound': 'roundId++',
            'round-storage.answer': '0 → 200000000000 (2000.00 USD, 8 decimals)',
          },
          durationMs: 1500,
        },
        {
          id: 'step-consumer-call',
          description: 'chainlink-oracle.sim.price-feed-request.step.consumerCall',
          mobileDescription: 'chainlink-oracle.sim.price-feed-request.step.consumerCall.mobile',
          highlightNodes: ['consumer-contract', 'aggregator-proxy'],
          highlightEdges: ['e-consumer-proxy'],
          valueChanges: { 'consumer-contract.status': 'calling latestRoundData()' },
          durationMs: 1000,
        },
        {
          id: 'step-proxy-delegate',
          description: 'chainlink-oracle.sim.price-feed-request.step.proxyDelegate',
          mobileDescription: 'chainlink-oracle.sim.price-feed-request.step.proxyDelegate.mobile',
          highlightNodes: ['aggregator-proxy', 'aggregator', 'round-storage'],
          highlightEdges: ['e-proxy-aggregator', 'e-aggregator-storage', 'e-aggregator-proxy-return', 'e-proxy-consumer-return'],
          valueChanges: { 'consumer-contract.lastPrice': '→ 2000.00 USD' },
          durationMs: 1500,
        },
      ],
    },
  ],

  contracts: [
    {
      chain: 'Ethereum',
      address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      label: 'ETH/USD Price Feed',
    },
  ],
};
