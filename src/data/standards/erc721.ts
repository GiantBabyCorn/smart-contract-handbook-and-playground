import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc721',
  name: 'ERC-721',
  shortDescription: 'erc721.short',
  category: 'nft',
  entryType: 'standard',
  eipNumber: 721,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-721',
  relatedSlugs: ['erc1155', 'erc2981', 'erc6551', 'erc165'],
  sortOrder: 200,

  // ─── ERCContent ───
  introduction: 'erc721.introduction',
  designPurpose: 'erc721.designPurpose',
  commonUsage: 'erc721.commonUsage',

  functions: [
    {
      name: 'balanceOf',
      signature: 'balanceOf(address owner) → uint256',
      type: 'read',
      params: [{ name: 'owner', type: 'address', description: 'erc721.fn.balanceOf.params.owner' }],
      returns: [{ name: 'balance', type: 'uint256', description: 'erc721.fn.balanceOf.returns.balance' }],
      description: 'erc721.fn.balanceOf.desc',
      defaultSimValues: { owner: '0xOwner' },
    },
    {
      name: 'ownerOf',
      signature: 'ownerOf(uint256 tokenId) → address',
      type: 'read',
      params: [{ name: 'tokenId', type: 'uint256', description: 'erc721.fn.ownerOf.params.tokenId' }],
      returns: [{ name: 'owner', type: 'address', description: 'erc721.fn.ownerOf.returns.owner' }],
      description: 'erc721.fn.ownerOf.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'safeTransferFrom',
      signature: 'safeTransferFrom(address from, address to, uint256 tokenId)',
      type: 'write',
      params: [
        { name: 'from', type: 'address', description: 'erc721.fn.safeTransferFrom.params.from' },
        { name: 'to', type: 'address', description: 'erc721.fn.safeTransferFrom.params.to' },
        { name: 'tokenId', type: 'uint256', description: 'erc721.fn.safeTransferFrom.params.tokenId' },
      ],
      description: 'erc721.fn.safeTransferFrom.desc',
      defaultSimValues: { from: '0xOwner', to: '0xRecipient', tokenId: '1' },
    },
    {
      name: 'transferFrom',
      signature: 'transferFrom(address from, address to, uint256 tokenId)',
      type: 'write',
      params: [
        { name: 'from', type: 'address', description: 'erc721.fn.transferFrom.params.from' },
        { name: 'to', type: 'address', description: 'erc721.fn.transferFrom.params.to' },
        { name: 'tokenId', type: 'uint256', description: 'erc721.fn.transferFrom.params.tokenId' },
      ],
      description: 'erc721.fn.transferFrom.desc',
      defaultSimValues: { from: '0xOwner', to: '0xRecipient', tokenId: '1' },
    },
    {
      name: 'approve',
      signature: 'approve(address to, uint256 tokenId)',
      type: 'write',
      params: [
        { name: 'to', type: 'address', description: 'erc721.fn.approve.params.to' },
        { name: 'tokenId', type: 'uint256', description: 'erc721.fn.approve.params.tokenId' },
      ],
      description: 'erc721.fn.approve.desc',
      defaultSimValues: { to: '0xOperator', tokenId: '1' },
    },
    {
      name: 'setApprovalForAll',
      signature: 'setApprovalForAll(address operator, bool approved)',
      type: 'write',
      params: [
        { name: 'operator', type: 'address', description: 'erc721.fn.setApprovalForAll.params.operator' },
        { name: 'approved', type: 'bool', description: 'erc721.fn.setApprovalForAll.params.approved' },
      ],
      description: 'erc721.fn.setApprovalForAll.desc',
      defaultSimValues: { operator: '0xOperator', approved: 'true' },
    },
    {
      name: 'getApproved',
      signature: 'getApproved(uint256 tokenId) → address',
      type: 'read',
      params: [{ name: 'tokenId', type: 'uint256', description: 'erc721.fn.getApproved.params.tokenId' }],
      returns: [{ name: 'operator', type: 'address', description: 'erc721.fn.getApproved.returns.operator' }],
      description: 'erc721.fn.getApproved.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'isApprovedForAll',
      signature: 'isApprovedForAll(address owner, address operator) → bool',
      type: 'read',
      params: [
        { name: 'owner', type: 'address', description: 'erc721.fn.isApprovedForAll.params.owner' },
        { name: 'operator', type: 'address', description: 'erc721.fn.isApprovedForAll.params.operator' },
      ],
      returns: [{ name: 'approved', type: 'bool', description: 'erc721.fn.isApprovedForAll.returns.approved' }],
      description: 'erc721.fn.isApprovedForAll.desc',
      defaultSimValues: { owner: '0xOwner', operator: '0xOperator' },
    },
    {
      name: 'Transfer',
      signature: 'Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
      type: 'event',
      params: [
        { name: 'from', type: 'address', description: 'erc721.fn.Transfer.params.from' },
        { name: 'to', type: 'address', description: 'erc721.fn.Transfer.params.to' },
        { name: 'tokenId', type: 'uint256', description: 'erc721.fn.Transfer.params.tokenId' },
      ],
      description: 'erc721.fn.Transfer.desc',
    },
    {
      name: 'Approval',
      signature: 'Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
      type: 'event',
      params: [
        { name: 'owner', type: 'address', description: 'erc721.fn.Approval.params.owner' },
        { name: 'approved', type: 'address', description: 'erc721.fn.Approval.params.approved' },
        { name: 'tokenId', type: 'uint256', description: 'erc721.fn.Approval.params.tokenId' },
      ],
      description: 'erc721.fn.Approval.desc',
    },
    {
      name: 'ApprovalForAll',
      signature: 'ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
      type: 'event',
      params: [
        { name: 'owner', type: 'address', description: 'erc721.fn.ApprovalForAll.params.owner' },
        { name: 'operator', type: 'address', description: 'erc721.fn.ApprovalForAll.params.operator' },
        { name: 'approved', type: 'bool', description: 'erc721.fn.ApprovalForAll.params.approved' },
      ],
      description: 'erc721.fn.ApprovalForAll.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'owner',
      type: 'user',
      label: 'erc721.node.owner',
      data: { address: '0xOwner', balance: '3 NFTs' },
      layoutHint: 'source',
    },
    {
      id: 'erc721-contract',
      type: 'contract',
      label: 'erc721.node.contract',
      data: {
        functions: [
          'balanceOf', 'ownerOf', 'safeTransferFrom', 'transferFrom',
          'approve', 'setApprovalForAll', 'getApproved', 'isApprovedForAll',
        ],
      },
      layoutHint: 'center',
    },
    {
      id: 'recipient',
      type: 'user',
      label: 'erc721.node.recipient',
      data: { address: '0xRecipient', balance: '0 NFTs' },
      layoutHint: 'sink',
    },
    {
      id: 'operator',
      type: 'user',
      label: 'erc721.node.operator',
      data: { address: '0xOperator' },
      layoutHint: 'sink',
    },
    {
      id: 'storage-ownership',
      type: 'storage',
      label: 'erc721.node.storageOwnership',
      data: {
        slots: [
          { key: '_owners', label: 'mapping(uint256 => address)' },
          { key: '_balances', label: 'mapping(address => uint256)' },
          { key: '_tokenApprovals', label: 'mapping(uint256 => address)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'approval-storage',
      type: 'storage',
      label: 'erc721.node.approvalStorage',
      data: {
        slots: [
          { key: '_operatorApprovals', label: 'mapping(address => mapping(address => bool))' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'fn-safeTransferFrom',
      type: 'function',
      label: 'safeTransferFrom()',
      data: { fnType: 'write', signature: 'safeTransferFrom(address from, address to, uint256 tokenId)' },
    },
    {
      id: 'fn-approve',
      type: 'function',
      label: 'approve()',
      data: { fnType: 'write', signature: 'approve(address to, uint256 tokenId)' },
    },
    {
      id: 'erc721receiver',
      type: 'contract',
      label: 'erc721.node.receiver',
      data: { functions: ['onERC721Received'] },
      layoutHint: 'sink',
    },
    {
      id: 'event-transfer',
      type: 'function',
      label: 'Transfer event',
      data: { fnType: 'event', signature: 'Transfer(address indexed from, address indexed to, uint256 indexed tokenId)' },
    },
  ],

  flowEdges: [
    {
      id: 'e-owner-safeTransfer',
      source: 'owner',
      target: 'fn-safeTransferFrom',
      type: 'animated',
      label: 'erc721.edge.callSafeTransfer',
    },
    {
      id: 'e-safeTransfer-contract',
      source: 'fn-safeTransferFrom',
      target: 'erc721-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc721-contract',
      target: 'storage-ownership',
      type: 'labeled',
      label: 'erc721.edge.updateOwnership',
    },
    {
      id: 'e-contract-receiver',
      source: 'erc721-contract',
      target: 'erc721receiver',
      type: 'animated',
      label: 'erc721.edge.checkReceiver',
    },
    {
      id: 'e-contract-recipient',
      source: 'erc721-contract',
      target: 'recipient',
      type: 'fundFlow',
      label: 'erc721.edge.nftMoves',
    },
    {
      id: 'e-owner-approve',
      source: 'owner',
      target: 'fn-approve',
      type: 'animated',
      label: 'erc721.edge.callApprove',
    },
    {
      id: 'e-approve-contract',
      source: 'fn-approve',
      target: 'erc721-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-approval-storage',
      source: 'erc721-contract',
      target: 'approval-storage',
      type: 'labeled',
      label: 'erc721.edge.storeApproval',
    },
    {
      id: 'e-contract-operator',
      source: 'erc721-contract',
      target: 'operator',
      type: 'labeled',
      label: 'erc721.edge.approvalGranted',
    },
    {
      id: 'e-contract-event',
      source: 'erc721-contract',
      target: 'event-transfer',
      type: 'labeled',
      label: 'erc721.edge.emitTransfer',
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
      id: 'nft-transfer',
      name: 'erc721.sim.nftTransfer.name',
      description: 'erc721.sim.nftTransfer.desc',
      params: [
        {
          id: 'from',
          label: 'erc721.sim.nftTransfer.param.from',
          type: 'address',
          defaultValue: '0xAlice',
        },
        {
          id: 'to',
          label: 'erc721.sim.nftTransfer.param.to',
          type: 'address',
          defaultValue: '0xBob',
        },
        {
          id: 'tokenId',
          label: 'erc721.sim.nftTransfer.param.tokenId',
          type: 'uint256',
          defaultValue: '42',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc721.sim.nftTransfer.step.call',
          mobileDescription: 'erc721.sim.nftTransfer.step.call.mobile',
          highlightNodes: ['owner', 'fn-safeTransferFrom'],
          highlightEdges: ['e-owner-safeTransfer'],
          durationMs: 1000,
        },
        {
          id: 'step-validate',
          description: 'erc721.sim.nftTransfer.step.validate',
          mobileDescription: 'erc721.sim.nftTransfer.step.validate.mobile',
          highlightNodes: ['fn-safeTransferFrom', 'erc721-contract', 'storage-ownership'],
          highlightEdges: ['e-safeTransfer-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-ownership._owners[42]': '0xAlice → 0xBob',
            'storage-ownership._balances[0xAlice]': '3 → 2',
            'storage-ownership._balances[0xBob]': '0 → 1',
          },
          durationMs: 1400,
        },
        {
          id: 'step-receiver-check',
          description: 'erc721.sim.nftTransfer.step.receiverCheck',
          mobileDescription: 'erc721.sim.nftTransfer.step.receiverCheck.mobile',
          highlightNodes: ['erc721-contract', 'erc721receiver'],
          highlightEdges: ['e-contract-receiver'],
          durationMs: 900,
        },
        {
          id: 'step-complete',
          description: 'erc721.sim.nftTransfer.step.complete',
          mobileDescription: 'erc721.sim.nftTransfer.step.complete.mobile',
          highlightNodes: ['erc721-contract', 'recipient', 'event-transfer'],
          highlightEdges: ['e-contract-recipient', 'e-contract-event'],
          valueChanges: { 'recipient.balance': '0 NFTs → 1 NFT (#42)' },
          durationMs: 1000,
        },
      ],
    },
    {
      id: 'safe-transfer-callback',
      name: 'erc721.sim.safeTransferCallback.name',
      description: 'erc721.sim.safeTransferCallback.desc',
      params: [
        {
          id: 'tokenId',
          label: 'erc721.sim.safeTransferCallback.param.tokenId',
          type: 'uint256',
          defaultValue: '7',
        },
        {
          id: 'useContract',
          label: 'erc721.sim.safeTransferCallback.param.useContract',
          type: 'bool',
          defaultValue: 'true',
        },
      ],
      steps: [
        {
          id: 'step-initiate',
          description: 'erc721.sim.safeTransferCallback.step.initiate',
          highlightNodes: ['owner', 'fn-safeTransferFrom'],
          highlightEdges: ['e-owner-safeTransfer'],
          durationMs: 1000,
        },
        {
          id: 'step-ownership-update',
          description: 'erc721.sim.safeTransferCallback.step.ownershipUpdate',
          highlightNodes: ['erc721-contract', 'storage-ownership'],
          highlightEdges: ['e-safeTransfer-contract', 'e-contract-storage'],
          valueChanges: { 'storage-ownership._owners[7]': '0xOwner → 0xContract' },
          durationMs: 1200,
        },
        {
          id: 'step-callback',
          description: 'erc721.sim.safeTransferCallback.step.callback',
          highlightNodes: ['erc721-contract', 'erc721receiver'],
          highlightEdges: ['e-contract-receiver'],
          valueChanges: { 'erc721receiver.response': 'bytes4(0x150b7a02)' },
          durationMs: 1100,
        },
        {
          id: 'step-event',
          description: 'erc721.sim.safeTransferCallback.step.event',
          highlightNodes: ['event-transfer'],
          highlightEdges: ['e-contract-event'],
          durationMs: 700,
        },
      ],
    },
  ],
};
