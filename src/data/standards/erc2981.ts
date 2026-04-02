import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2981',
  name: 'ERC-2981',
  shortDescription: 'erc2981.short',
  category: 'nft',
  entryType: 'standard',
  eipNumber: 2981,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2981',
  relatedSlugs: ['erc721', 'erc1155'],
  sortOrder: 800,

  // ─── ERCContent ───
  introduction: 'erc2981.introduction',
  designPurpose: 'erc2981.designPurpose',
  commonUsage: 'erc2981.commonUsage',

  functions: [
    {
      name: 'royaltyInfo',
      signature: 'royaltyInfo(uint256 tokenId, uint256 salePrice) → (address receiver, uint256 royaltyAmount)',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc2981.fn.royaltyInfo.params.tokenId' },
        { name: 'salePrice', type: 'uint256', description: 'erc2981.fn.royaltyInfo.params.salePrice' },
      ],
      returns: [
        { name: 'receiver', type: 'address', description: 'erc2981.fn.royaltyInfo.returns.receiver' },
        { name: 'royaltyAmount', type: 'uint256', description: 'erc2981.fn.royaltyInfo.returns.royaltyAmount' },
      ],
      description: 'erc2981.fn.royaltyInfo.desc',
      defaultSimValues: { tokenId: '1', salePrice: '1000000000000000000' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'marketplace',
      type: 'user',
      label: 'erc2981.node.marketplace',
      data: { address: '0xMarketplace' },
      layoutHint: 'source',
    },
    {
      id: 'erc2981-contract',
      type: 'contract',
      label: 'erc2981.node.contract',
      data: { functions: ['royaltyInfo'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-royaltyInfo',
      type: 'function',
      label: 'royaltyInfo()',
      data: { fnType: 'read', signature: 'royaltyInfo(uint256 tokenId, uint256 salePrice) → (address, uint256)' },
    },
    {
      id: 'storage',
      type: 'storage',
      label: 'erc2981.node.storage',
      data: {
        slots: [
          { key: '_tokenRoyaltyInfo', label: 'mapping(uint256 => RoyaltyInfo)' },
          { key: '_defaultRoyaltyInfo', label: 'RoyaltyInfo { receiver, feeNumerator }' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'seller',
      type: 'user',
      label: 'erc2981.node.seller',
      data: { address: '0xSeller', balance: '0 ETH' },
      layoutHint: 'sink',
    },
    {
      id: 'royalty-receiver',
      type: 'user',
      label: 'erc2981.node.royaltyReceiver',
      data: { address: '0xCreator', balance: '0 ETH' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-marketplace-fn',
      source: 'marketplace',
      target: 'fn-royaltyInfo',
      type: 'animated',
      label: 'erc2981.edge.queryRoyalty',
    },
    {
      id: 'e-fn-contract',
      source: 'fn-royaltyInfo',
      target: 'erc2981-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc2981-contract',
      target: 'storage',
      type: 'labeled',
      label: 'erc2981.edge.lookupRoyalty',
    },
    {
      id: 'e-marketplace-seller',
      source: 'marketplace',
      target: 'seller',
      type: 'fundFlow',
      label: 'erc2981.edge.saleProceeds',
    },
    {
      id: 'e-marketplace-royaltyReceiver',
      source: 'marketplace',
      target: 'royalty-receiver',
      type: 'fundFlow',
      label: 'erc2981.edge.royaltyPayment',
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
      id: 'royalty-calculation',
      name: 'erc2981.sim.royaltyCalculation.name',
      description: 'erc2981.sim.royaltyCalculation.desc',
      params: [
        {
          id: 'tokenId',
          label: 'erc2981.sim.royaltyCalculation.param.tokenId',
          type: 'uint256',
          defaultValue: '42',
        },
        {
          id: 'salePrice',
          label: 'erc2981.sim.royaltyCalculation.param.salePrice',
          type: 'uint256',
          defaultValue: '1000000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-sale',
          description: 'erc2981.sim.royaltyCalculation.step.sale',
          mobileDescription: 'erc2981.sim.royaltyCalculation.step.sale.mobile',
          highlightNodes: ['marketplace'],
          highlightEdges: [],
          valueChanges: { 'marketplace.salePrice': '1 ETH for tokenId #42' },
          durationMs: 900,
        },
        {
          id: 'step-query',
          description: 'erc2981.sim.royaltyCalculation.step.query',
          mobileDescription: 'erc2981.sim.royaltyCalculation.step.query.mobile',
          highlightNodes: ['marketplace', 'fn-royaltyInfo', 'erc2981-contract', 'storage'],
          highlightEdges: ['e-marketplace-fn', 'e-fn-contract', 'e-contract-storage'],
          valueChanges: {
            'storage._tokenRoyaltyInfo[42]': '{ receiver: 0xCreator, feeNumerator: 500 }',
            'fn-royaltyInfo.output': 'receiver=0xCreator, royaltyAmount=0.05 ETH',
          },
          durationMs: 1200,
        },
        {
          id: 'step-distribute',
          description: 'erc2981.sim.royaltyCalculation.step.distribute',
          mobileDescription: 'erc2981.sim.royaltyCalculation.step.distribute.mobile',
          highlightNodes: ['marketplace', 'seller', 'royalty-receiver'],
          highlightEdges: ['e-marketplace-seller', 'e-marketplace-royaltyReceiver'],
          valueChanges: {
            'seller.balance': '0 → 0.95 ETH',
            'royalty-receiver.balance': '0 → 0.05 ETH',
          },
          durationMs: 1300,
        },
      ],
    },
  ],
};
