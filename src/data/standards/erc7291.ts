import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7291',
  name: 'ERC-7291',
  shortDescription: 'erc7291.short',
  category: 'token',
  entryType: 'standard',
  eipNumber: 7291,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7291',
  relatedSlugs: ['erc1155', 'erc20', 'erc173', 'erc5679'],
  sortOrder: 17291,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [165, 173, 1155],
  relations: [
    { slug: 'erc1155', kind: 'extends' },
    { slug: 'erc173', kind: 'requires' },
    { slug: 'erc165', kind: 'requires' },
    { slug: 'erc20', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-7291 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7291', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7291.introduction',
  designPurpose: 'erc7291.designPurpose',
  commonUsage: 'erc7291.commonUsage',

  functions: [
    {
      name: 'initialise',
      signature: 'initialise(address _sovToken, uint256 _expiry, address _pbmWrapperLogic)',
      type: 'write',
      params: [
        { name: '_sovToken', type: 'address', description: 'erc7291.fn.initialise.params.sovToken' },
        { name: '_expiry', type: 'uint256', description: 'erc7291.fn.initialise.params.expiry' },
        { name: '_pbmWrapperLogic', type: 'address', description: 'erc7291.fn.initialise.params.pbmWrapperLogic' },
      ],
      description: 'erc7291.fn.initialise.desc',
      defaultSimValues: { _sovToken: '0xStablecoin', _expiry: '1893456000', _pbmWrapperLogic: '0xWrapperLogic' },
    },
    {
      name: 'uri',
      signature: 'uri(uint256 tokenId) → string',
      type: 'read',
      params: [{ name: 'tokenId', type: 'uint256', description: 'erc7291.fn.uri.params.tokenId' }],
      returns: [{ name: 'uri', type: 'string', description: 'erc7291.fn.uri.returns.uri' }],
      description: 'erc7291.fn.uri.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'safeMint',
      signature: 'safeMint(address receiver, uint256 tokenId, uint256 amount, bytes data)',
      type: 'write',
      params: [
        { name: 'receiver', type: 'address', description: 'erc7291.fn.safeMint.params.receiver' },
        { name: 'tokenId', type: 'uint256', description: 'erc7291.fn.safeMint.params.tokenId' },
        { name: 'amount', type: 'uint256', description: 'erc7291.fn.safeMint.params.amount' },
        { name: 'data', type: 'bytes', description: 'erc7291.fn.safeMint.params.data' },
      ],
      description: 'erc7291.fn.safeMint.desc',
      defaultSimValues: { receiver: '0xRecipient', tokenId: '1', amount: '10', data: '0x' },
    },
    {
      name: 'safeTransferFrom',
      signature: 'safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
      type: 'write',
      params: [
        { name: 'from', type: 'address', description: 'erc7291.fn.safeTransferFrom.params.from' },
        { name: 'to', type: 'address', description: 'erc7291.fn.safeTransferFrom.params.to' },
        { name: 'id', type: 'uint256', description: 'erc7291.fn.safeTransferFrom.params.id' },
        { name: 'amount', type: 'uint256', description: 'erc7291.fn.safeTransferFrom.params.amount' },
        { name: 'data', type: 'bytes', description: 'erc7291.fn.safeTransferFrom.params.data' },
      ],
      description: 'erc7291.fn.safeTransferFrom.desc',
      defaultSimValues: { from: '0xPayer', to: '0xMerchant', id: '1', amount: '10', data: '0x' },
    },
    {
      name: 'burn',
      signature: 'burn(address from, uint256 tokenId, uint256 amount, bytes data)',
      type: 'write',
      params: [
        { name: 'from', type: 'address', description: 'erc7291.fn.burn.params.from' },
        { name: 'tokenId', type: 'uint256', description: 'erc7291.fn.burn.params.tokenId' },
        { name: 'amount', type: 'uint256', description: 'erc7291.fn.burn.params.amount' },
        { name: 'data', type: 'bytes', description: 'erc7291.fn.burn.params.data' },
      ],
      description: 'erc7291.fn.burn.desc',
      defaultSimValues: { from: '0xPayer', tokenId: '1', amount: '10', data: '0x' },
    },
    {
      name: 'revokePBM',
      signature: 'revokePBM(uint256 tokenId)',
      type: 'write',
      params: [{ name: 'tokenId', type: 'uint256', description: 'erc7291.fn.revokePBM.params.tokenId' }],
      description: 'erc7291.fn.revokePBM.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'TokenWrap',
      signature: 'TokenWrap(address from, uint256[] tokenIds, uint256[] amounts, address sovToken, uint256 sovTokenValue)',
      type: 'event',
      params: [
        { name: 'from', type: 'address', description: 'erc7291.fn.TokenWrap.params.from' },
        { name: 'tokenIds', type: 'uint256[]', description: 'erc7291.fn.TokenWrap.params.tokenIds' },
        { name: 'amounts', type: 'uint256[]', description: 'erc7291.fn.TokenWrap.params.amounts' },
        { name: 'sovToken', type: 'address', description: 'erc7291.fn.TokenWrap.params.sovToken' },
        { name: 'sovTokenValue', type: 'uint256', description: 'erc7291.fn.TokenWrap.params.sovTokenValue' },
      ],
      description: 'erc7291.fn.TokenWrap.desc',
    },
    {
      name: 'TokenUnwrapForTarget',
      signature: 'TokenUnwrapForTarget(address from, address to, uint256[] tokenIds, uint256[] amounts, address sovToken, uint256 sovTokenValue)',
      type: 'event',
      params: [
        { name: 'from', type: 'address', description: 'erc7291.fn.TokenUnwrapForTarget.params.from' },
        { name: 'to', type: 'address', description: 'erc7291.fn.TokenUnwrapForTarget.params.to' },
        { name: 'tokenIds', type: 'uint256[]', description: 'erc7291.fn.TokenUnwrapForTarget.params.tokenIds' },
        { name: 'amounts', type: 'uint256[]', description: 'erc7291.fn.TokenUnwrapForTarget.params.amounts' },
        { name: 'sovToken', type: 'address', description: 'erc7291.fn.TokenUnwrapForTarget.params.sovToken' },
        { name: 'sovTokenValue', type: 'uint256', description: 'erc7291.fn.TokenUnwrapForTarget.params.sovTokenValue' },
      ],
      description: 'erc7291.fn.TokenUnwrapForTarget.desc',
    },
    {
      name: 'TokenUnwrapForPBMBurn',
      signature: 'TokenUnwrapForPBMBurn(address from, address to, uint256[] tokenIds, uint256[] amounts, address sovToken, uint256 sovTokenValue)',
      type: 'event',
      params: [
        { name: 'from', type: 'address', description: 'erc7291.fn.TokenUnwrapForPBMBurn.params.from' },
        { name: 'to', type: 'address', description: 'erc7291.fn.TokenUnwrapForPBMBurn.params.to' },
        { name: 'tokenIds', type: 'uint256[]', description: 'erc7291.fn.TokenUnwrapForPBMBurn.params.tokenIds' },
        { name: 'amounts', type: 'uint256[]', description: 'erc7291.fn.TokenUnwrapForPBMBurn.params.amounts' },
        { name: 'sovToken', type: 'address', description: 'erc7291.fn.TokenUnwrapForPBMBurn.params.sovToken' },
        { name: 'sovTokenValue', type: 'uint256', description: 'erc7291.fn.TokenUnwrapForPBMBurn.params.sovTokenValue' },
      ],
      description: 'erc7291.fn.TokenUnwrapForPBMBurn.desc',
    },
    {
      name: 'PBMrevokeWithdraw',
      signature: 'PBMrevokeWithdraw(address beneficiary, uint256 PBMTokenId, address sovToken, uint256 sovTokenValue)',
      type: 'event',
      params: [
        { name: 'beneficiary', type: 'address', description: 'erc7291.fn.PBMrevokeWithdraw.params.beneficiary' },
        { name: 'PBMTokenId', type: 'uint256', description: 'erc7291.fn.PBMrevokeWithdraw.params.PBMTokenId' },
        { name: 'sovToken', type: 'address', description: 'erc7291.fn.PBMrevokeWithdraw.params.sovToken' },
        { name: 'sovTokenValue', type: 'uint256', description: 'erc7291.fn.PBMrevokeWithdraw.params.sovTokenValue' },
      ],
      description: 'erc7291.fn.PBMrevokeWithdraw.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc7291.node.user',
      data: { address: '0xPayer' },
      layoutHint: 'source',
    },
    {
      id: 'erc7291-contract',
      type: 'contract',
      label: 'erc7291.node.contract',
      data: { functions: ['initialise', 'safeMint', 'safeTransferFrom', 'burn', 'revokePBM', 'uri'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-safeMint',
      type: 'function',
      label: 'safeMint()',
      data: { fnType: 'write', signature: 'safeMint(address receiver, uint256 tokenId, uint256 amount, bytes data)' },
    },
    {
      id: 'fn-safeTransferFrom',
      type: 'function',
      label: 'safeTransferFrom()',
      data: { fnType: 'write', signature: 'safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)' },
    },
    {
      id: 'storage-tokens',
      type: 'storage',
      label: 'erc7291.node.storageTokens',
      data: {
        slots: [
          { key: '_pbmTokenDetails', label: 'mapping(uint256 => PBMToken)' },
          { key: '_balances', label: 'mapping(uint256 => mapping(address => uint256))' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-wrap',
      type: 'function',
      label: 'TokenWrap event',
      data: { fnType: 'event', signature: 'TokenWrap(address from, uint256[] tokenIds, uint256[] amounts, address sovToken, uint256 sovTokenValue)' },
    },
    {
      id: 'event-unwrap',
      type: 'function',
      label: 'TokenUnwrapForTarget event',
      data: { fnType: 'event', signature: 'TokenUnwrapForTarget(address from, address to, uint256[] tokenIds, uint256[] amounts, address sovToken, uint256 sovTokenValue)' },
    },
    {
      id: 'merchant',
      type: 'user',
      label: 'erc7291.node.merchant',
      data: { address: '0xMerchant' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    { id: 'e-user-mint', source: 'user', target: 'fn-safeMint', type: 'animated', label: 'erc7291.edge.callSafeMint' },
    { id: 'e-mint-contract', source: 'fn-safeMint', target: 'erc7291-contract', type: 'animated' },
    { id: 'e-user-transfer', source: 'user', target: 'fn-safeTransferFrom', type: 'animated', label: 'erc7291.edge.callTransfer' },
    { id: 'e-transfer-contract', source: 'fn-safeTransferFrom', target: 'erc7291-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc7291-contract', target: 'storage-tokens', type: 'labeled', label: 'erc7291.edge.updateBalances' },
    { id: 'e-contract-wrap', source: 'erc7291-contract', target: 'event-wrap', type: 'labeled', label: 'erc7291.edge.emitWrap' },
    { id: 'e-contract-unwrap', source: 'erc7291-contract', target: 'event-unwrap', type: 'labeled', label: 'erc7291.edge.emitUnwrap' },
    { id: 'e-contract-merchant', source: 'erc7291-contract', target: 'merchant', type: 'fundFlow', label: 'erc7291.edge.releaseSovToken' },
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
      id: 'redeem-walkthrough',
      name: 'erc7291.sim.redeemWalkthrough.name',
      description: 'erc7291.sim.redeemWalkthrough.desc',
      params: [
        { id: 'from', label: 'erc7291.sim.redeemWalkthrough.param.from', type: 'address', defaultValue: '0xPayer' },
        { id: 'to', label: 'erc7291.sim.redeemWalkthrough.param.to', type: 'address', defaultValue: '0xMerchant' },
        { id: 'amount', label: 'erc7291.sim.redeemWalkthrough.param.amount', type: 'uint256', defaultValue: '10' },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc7291.sim.redeemWalkthrough.step.call',
          mobileDescription: 'erc7291.sim.redeemWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-safeTransferFrom'],
          highlightEdges: ['e-user-transfer'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc7291.sim.redeemWalkthrough.step.execute',
          mobileDescription: 'erc7291.sim.redeemWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-safeTransferFrom', 'erc7291-contract', 'storage-tokens'],
          highlightEdges: ['e-transfer-contract', 'e-contract-storage'],
          valueChanges: { 'storage-tokens._balances[1][0xPayer]': '10 → 0' },
          durationMs: 1200,
        },
        {
          id: 'step-unwrap',
          description: 'erc7291.sim.redeemWalkthrough.step.unwrap',
          mobileDescription: 'erc7291.sim.redeemWalkthrough.step.unwrap.mobile',
          highlightNodes: ['erc7291-contract', 'merchant'],
          highlightEdges: ['e-contract-merchant'],
          valueChanges: { 'merchant.sovTokenBalance': '0 → 10' },
          durationMs: 1000,
        },
        {
          id: 'step-event',
          description: 'erc7291.sim.redeemWalkthrough.step.event',
          mobileDescription: 'erc7291.sim.redeemWalkthrough.step.event.mobile',
          highlightNodes: ['erc7291-contract', 'event-unwrap'],
          highlightEdges: ['e-contract-unwrap'],
          durationMs: 800,
        },
      ],
    },
  ],
};
