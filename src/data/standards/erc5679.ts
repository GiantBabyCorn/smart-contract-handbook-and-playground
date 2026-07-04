import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5679',
  name: 'ERC-5679',
  shortDescription: 'erc5679.short',
  category: 'token',
  entryType: 'standard',
  eipNumber: 5679,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5679',
  relatedSlugs: ['erc20', 'erc721', 'erc1155', 'erc165'],
  sortOrder: 15679,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20, 165, 721, 1155],
  relations: [
    { slug: 'erc20', kind: 'extends' },
    { slug: 'erc721', kind: 'extends' },
    { slug: 'erc1155', kind: 'extends' },
    { slug: 'erc165', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-5679 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5679', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5679.introduction',
  designPurpose: 'erc5679.designPurpose',
  commonUsage: 'erc5679.commonUsage',

  functions: [
    {
      name: 'mint',
      signature: 'mint(address _to, uint256 _amount, bytes _data)',
      type: 'write',
      params: [
        { name: '_to', type: 'address', description: 'erc5679.fn.mint.params._to' },
        { name: '_amount', type: 'uint256', description: 'erc5679.fn.mint.params._amount' },
        { name: '_data', type: 'bytes', description: 'erc5679.fn.mint.params._data' },
      ],
      description: 'erc5679.fn.mint.desc',
      defaultSimValues: { _to: '0xRecipient', _amount: '1000000000000000000', _data: '0x' },
    },
    {
      name: 'burn',
      signature: 'burn(address _from, uint256 _amount, bytes _data)',
      type: 'write',
      params: [
        { name: '_from', type: 'address', description: 'erc5679.fn.burn.params._from' },
        { name: '_amount', type: 'uint256', description: 'erc5679.fn.burn.params._amount' },
        { name: '_data', type: 'bytes', description: 'erc5679.fn.burn.params._data' },
      ],
      description: 'erc5679.fn.burn.desc',
      defaultSimValues: { _from: '0xHolder', _amount: '1000000000000000000', _data: '0x' },
    },
    {
      name: 'safeMint',
      signature: 'safeMint(address _to, uint256 _id, bytes _data)',
      type: 'write',
      params: [
        { name: '_to', type: 'address', description: 'erc5679.fn.safeMint.params._to' },
        { name: '_id', type: 'uint256', description: 'erc5679.fn.safeMint.params._id' },
        { name: '_data', type: 'bytes', description: 'erc5679.fn.safeMint.params._data' },
      ],
      description: 'erc5679.fn.safeMint.desc',
      defaultSimValues: { _to: '0xRecipient', _id: '1', _data: '0x' },
    },
    {
      name: 'safeMintBatch',
      signature: 'safeMintBatch(address to, uint256[] ids, uint256[] amounts, bytes data)',
      type: 'write',
      params: [
        { name: 'to', type: 'address', description: 'erc5679.fn.safeMintBatch.params.to' },
        { name: 'ids', type: 'uint256[]', description: 'erc5679.fn.safeMintBatch.params.ids' },
        { name: 'amounts', type: 'uint256[]', description: 'erc5679.fn.safeMintBatch.params.amounts' },
        { name: 'data', type: 'bytes', description: 'erc5679.fn.safeMintBatch.params.data' },
      ],
      description: 'erc5679.fn.safeMintBatch.desc',
      defaultSimValues: { to: '0xRecipient', ids: '[1, 2]', amounts: '[10, 5]', data: '0x' },
    },
    {
      name: 'burnBatch',
      signature: 'burnBatch(address _from, uint256[] ids, uint256[] amounts, bytes _data)',
      type: 'write',
      params: [
        { name: '_from', type: 'address', description: 'erc5679.fn.burnBatch.params._from' },
        { name: 'ids', type: 'uint256[]', description: 'erc5679.fn.burnBatch.params.ids' },
        { name: 'amounts', type: 'uint256[]', description: 'erc5679.fn.burnBatch.params.amounts' },
        { name: '_data', type: 'bytes', description: 'erc5679.fn.burnBatch.params._data' },
      ],
      description: 'erc5679.fn.burnBatch.desc',
      defaultSimValues: { _from: '0xHolder', ids: '[1, 2]', amounts: '[10, 5]', _data: '0x' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5679.node.user',
      data: { address: '0xMinter' },
      layoutHint: 'source',
    },
    {
      id: 'erc5679-contract',
      type: 'contract',
      label: 'erc5679.node.contract',
      data: { functions: ['mint', 'burn', 'safeMint', 'safeMintBatch', 'burnBatch'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-mint',
      type: 'function',
      label: 'mint()',
      data: { fnType: 'write', signature: 'mint(address _to, uint256 _amount, bytes _data)' },
    },
    {
      id: 'fn-burn',
      type: 'function',
      label: 'burn()',
      data: { fnType: 'write', signature: 'burn(address _from, uint256 _amount, bytes _data)' },
    },
    {
      id: 'storage-supply',
      type: 'storage',
      label: 'erc5679.node.storageSupply',
      data: {
        slots: [
          { key: '_totalSupply', label: 'uint256' },
          { key: '_balances', label: 'mapping(address => uint256)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'recipient',
      type: 'user',
      label: 'erc5679.node.recipient',
      data: { address: '0xRecipient' },
      layoutHint: 'sink',
    },
    {
      id: 'event-transfer',
      type: 'function',
      label: 'Transfer event',
      data: { fnType: 'event', signature: 'Transfer(address indexed from, address indexed to, uint256 value)' },
    },
  ],

  flowEdges: [
    { id: 'e-user-mint', source: 'user', target: 'fn-mint', type: 'animated', label: 'erc5679.edge.callMint' },
    { id: 'e-mint-contract', source: 'fn-mint', target: 'erc5679-contract', type: 'animated' },
    { id: 'e-user-burn', source: 'user', target: 'fn-burn', type: 'animated', label: 'erc5679.edge.callBurn' },
    { id: 'e-burn-contract', source: 'fn-burn', target: 'erc5679-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc5679-contract', target: 'storage-supply', type: 'labeled', label: 'erc5679.edge.updateSupply' },
    { id: 'e-contract-recipient', source: 'erc5679-contract', target: 'recipient', type: 'fundFlow', label: 'erc5679.edge.mintTokens' },
    { id: 'e-contract-event', source: 'erc5679-contract', target: 'event-transfer', type: 'labeled', label: 'erc5679.edge.emitTransfer' },
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
      id: 'mint-walkthrough',
      name: 'erc5679.sim.mintWalkthrough.name',
      description: 'erc5679.sim.mintWalkthrough.desc',
      params: [
        {
          id: 'to',
          label: 'erc5679.sim.mintWalkthrough.param.to',
          type: 'address',
          defaultValue: '0xRecipient',
        },
        {
          id: 'amount',
          label: 'erc5679.sim.mintWalkthrough.param.amount',
          type: 'uint256',
          defaultValue: '1000000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5679.sim.mintWalkthrough.step.call',
          mobileDescription: 'erc5679.sim.mintWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-mint'],
          highlightEdges: ['e-user-mint'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc5679.sim.mintWalkthrough.step.execute',
          mobileDescription: 'erc5679.sim.mintWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-mint', 'erc5679-contract', 'storage-supply'],
          highlightEdges: ['e-mint-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-supply._totalSupply': '0 → 1000000000000000000',
            'storage-supply._balances[0xRecipient]': '0 → 1000000000000000000',
          },
          durationMs: 1200,
        },
        {
          id: 'step-transfer',
          description: 'erc5679.sim.mintWalkthrough.step.transfer',
          mobileDescription: 'erc5679.sim.mintWalkthrough.step.transfer.mobile',
          highlightNodes: ['erc5679-contract', 'recipient', 'event-transfer'],
          highlightEdges: ['e-contract-recipient', 'e-contract-event'],
          durationMs: 800,
        },
      ],
    },
  ],
};
