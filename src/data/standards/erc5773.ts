import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5773',
  name: 'ERC-5773',
  shortDescription: 'erc5773.short',
  category: 'nft',
  entryType: 'standard',
  eipNumber: 5773,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5773',
  relatedSlugs: ['erc721', 'erc165', 'erc1155'],
  sortOrder: 15773,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [165, 721],
  relations: [
    { slug: 'erc721', kind: 'extends' },
    { slug: 'erc165', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-5773 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5773', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5773.introduction',
  designPurpose: 'erc5773.designPurpose',
  commonUsage: 'erc5773.commonUsage',

  functions: [
    {
      name: 'acceptAsset',
      signature: 'acceptAsset(uint256 tokenId, uint256 index, uint64 assetId)',
      type: 'write',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5773.fn.acceptAsset.params.tokenId' },
        { name: 'index', type: 'uint256', description: 'erc5773.fn.acceptAsset.params.index' },
        { name: 'assetId', type: 'uint64', description: 'erc5773.fn.acceptAsset.params.assetId' },
      ],
      description: 'erc5773.fn.acceptAsset.desc',
      defaultSimValues: { tokenId: '1', index: '0', assetId: '10' },
    },
    {
      name: 'rejectAsset',
      signature: 'rejectAsset(uint256 tokenId, uint256 index, uint64 assetId)',
      type: 'write',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5773.fn.rejectAsset.params.tokenId' },
        { name: 'index', type: 'uint256', description: 'erc5773.fn.rejectAsset.params.index' },
        { name: 'assetId', type: 'uint64', description: 'erc5773.fn.rejectAsset.params.assetId' },
      ],
      description: 'erc5773.fn.rejectAsset.desc',
      defaultSimValues: { tokenId: '1', index: '0', assetId: '10' },
    },
    {
      name: 'rejectAllAssets',
      signature: 'rejectAllAssets(uint256 tokenId, uint256 maxRejections)',
      type: 'write',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5773.fn.rejectAllAssets.params.tokenId' },
        { name: 'maxRejections', type: 'uint256', description: 'erc5773.fn.rejectAllAssets.params.maxRejections' },
      ],
      description: 'erc5773.fn.rejectAllAssets.desc',
      defaultSimValues: { tokenId: '1', maxRejections: '128' },
    },
    {
      name: 'setPriority',
      signature: 'setPriority(uint256 tokenId, uint64[] calldata priorities)',
      type: 'write',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5773.fn.setPriority.params.tokenId' },
        { name: 'priorities', type: 'uint64[]', description: 'erc5773.fn.setPriority.params.priorities' },
      ],
      description: 'erc5773.fn.setPriority.desc',
    },
    {
      name: 'getActiveAssets',
      signature: 'getActiveAssets(uint256 tokenId) → uint64[]',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5773.fn.getActiveAssets.params.tokenId' },
      ],
      returns: [
        { name: 'assetIds', type: 'uint64[]', description: 'erc5773.fn.getActiveAssets.returns.assetIds' },
      ],
      description: 'erc5773.fn.getActiveAssets.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'getPendingAssets',
      signature: 'getPendingAssets(uint256 tokenId) → uint64[]',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5773.fn.getPendingAssets.params.tokenId' },
      ],
      returns: [
        { name: 'assetIds', type: 'uint64[]', description: 'erc5773.fn.getPendingAssets.returns.assetIds' },
      ],
      description: 'erc5773.fn.getPendingAssets.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'getAssetMetadata',
      signature: 'getAssetMetadata(uint256 tokenId, uint64 assetId) → string',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5773.fn.getAssetMetadata.params.tokenId' },
        { name: 'assetId', type: 'uint64', description: 'erc5773.fn.getAssetMetadata.params.assetId' },
      ],
      returns: [
        { name: 'metadata', type: 'string', description: 'erc5773.fn.getAssetMetadata.returns.metadata' },
      ],
      description: 'erc5773.fn.getAssetMetadata.desc',
      defaultSimValues: { tokenId: '1', assetId: '10' },
    },
    {
      name: 'AssetAccepted',
      signature: 'AssetAccepted(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed replacesId)',
      type: 'event',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5773.fn.AssetAccepted.params.tokenId' },
        { name: 'assetId', type: 'uint64', description: 'erc5773.fn.AssetAccepted.params.assetId' },
        { name: 'replacesId', type: 'uint64', description: 'erc5773.fn.AssetAccepted.params.replacesId' },
      ],
      description: 'erc5773.fn.AssetAccepted.desc',
    },
    {
      name: 'AssetRejected',
      signature: 'AssetRejected(uint256 indexed tokenId, uint64 indexed assetId)',
      type: 'event',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5773.fn.AssetRejected.params.tokenId' },
        { name: 'assetId', type: 'uint64', description: 'erc5773.fn.AssetRejected.params.assetId' },
      ],
      description: 'erc5773.fn.AssetRejected.desc',
    },
    {
      name: 'AssetPrioritySet',
      signature: 'AssetPrioritySet(uint256 indexed tokenId)',
      type: 'event',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc5773.fn.AssetPrioritySet.params.tokenId' },
      ],
      description: 'erc5773.fn.AssetPrioritySet.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5773.node.user',
      data: { address: '0xOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc5773-contract',
      type: 'contract',
      label: 'erc5773.node.contract',
      data: { functions: ['acceptAsset', 'rejectAsset', 'setPriority', 'getActiveAssets'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-acceptAsset',
      type: 'function',
      label: 'acceptAsset()',
      data: { fnType: 'write', signature: 'acceptAsset(uint256 tokenId, uint256 index, uint64 assetId)' },
    },
    {
      id: 'fn-rejectAsset',
      type: 'function',
      label: 'rejectAsset()',
      data: { fnType: 'write', signature: 'rejectAsset(uint256 tokenId, uint256 index, uint64 assetId)' },
    },
    {
      id: 'storage-assets',
      type: 'storage',
      label: 'erc5773.node.storageAssets',
      data: {
        slots: [
          { key: '_pendingAssets', label: 'mapping(uint256 => uint64[])' },
          { key: '_activeAssets', label: 'mapping(uint256 => uint64[])' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-assetAccepted',
      type: 'function',
      label: 'AssetAccepted event',
      data: {
        fnType: 'event',
        signature: 'AssetAccepted(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed replacesId)',
      },
    },
  ],

  flowEdges: [
    {
      id: 'e-user-acceptAsset',
      source: 'user',
      target: 'fn-acceptAsset',
      type: 'animated',
      label: 'erc5773.edge.callAcceptAsset',
    },
    {
      id: 'e-user-rejectAsset',
      source: 'user',
      target: 'fn-rejectAsset',
      type: 'animated',
      label: 'erc5773.edge.callRejectAsset',
    },
    {
      id: 'e-acceptAsset-contract',
      source: 'fn-acceptAsset',
      target: 'erc5773-contract',
      type: 'animated',
    },
    {
      id: 'e-rejectAsset-contract',
      source: 'fn-rejectAsset',
      target: 'erc5773-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc5773-contract',
      target: 'storage-assets',
      type: 'labeled',
      label: 'erc5773.edge.updateAssets',
    },
    {
      id: 'e-contract-event',
      source: 'erc5773-contract',
      target: 'event-assetAccepted',
      type: 'labeled',
      label: 'erc5773.edge.emitAssetAccepted',
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
      id: 'accept-asset-walkthrough',
      name: 'erc5773.sim.acceptAssetWalkthrough.name',
      description: 'erc5773.sim.acceptAssetWalkthrough.desc',
      params: [
        {
          id: 'tokenId',
          label: 'erc5773.sim.acceptAssetWalkthrough.param.tokenId',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'index',
          label: 'erc5773.sim.acceptAssetWalkthrough.param.index',
          type: 'uint256',
          defaultValue: '0',
        },
        {
          id: 'assetId',
          label: 'erc5773.sim.acceptAssetWalkthrough.param.assetId',
          type: 'uint256',
          defaultValue: '10',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5773.sim.acceptAssetWalkthrough.step.call',
          mobileDescription: 'erc5773.sim.acceptAssetWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-acceptAsset'],
          highlightEdges: ['e-user-acceptAsset'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc5773.sim.acceptAssetWalkthrough.step.execute',
          mobileDescription: 'erc5773.sim.acceptAssetWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-acceptAsset', 'erc5773-contract', 'storage-assets'],
          highlightEdges: ['e-acceptAsset-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-assets._pendingAssets[1]': '[10] → []',
            'storage-assets._activeAssets[1]': '[] → [10]',
          },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc5773.sim.acceptAssetWalkthrough.step.event',
          mobileDescription: 'erc5773.sim.acceptAssetWalkthrough.step.event.mobile',
          highlightNodes: ['erc5773-contract', 'event-assetAccepted'],
          highlightEdges: ['e-contract-event'],
          valueChanges: { 'event-assetAccepted.lastEvent': 'AssetAccepted(1, 10, 0)' },
          durationMs: 800,
        },
      ],
    },
  ],
};
