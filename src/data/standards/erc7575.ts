import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7575',
  name: 'ERC-7575',
  shortDescription: 'erc7575.short',
  category: 'defi',
  entryType: 'standard',
  eipNumber: 7575,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7575',
  relatedSlugs: ['erc4626', 'erc7540', 'erc20', 'erc165'],
  sortOrder: 17575,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20, 165, 2771, 4626],
  relations: [
    { slug: 'erc4626', kind: 'extends' },
    { slug: 'erc20', kind: 'requires' },
    { slug: 'erc165', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-7575 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7575', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7575.introduction',
  designPurpose: 'erc7575.designPurpose',
  commonUsage: 'erc7575.commonUsage',

  functions: [
    {
      name: 'share',
      signature: 'share() → address',
      type: 'read',
      params: [],
      returns: [
        { name: 'shareTokenAddress', type: 'address', description: 'erc7575.fn.share.returns.shareTokenAddress' },
      ],
      description: 'erc7575.fn.share.desc',
      defaultSimValues: {},
    },
    {
      name: 'vault',
      signature: 'vault(address asset) → address',
      type: 'read',
      params: [{ name: 'asset', type: 'address', description: 'erc7575.fn.vault.params.asset' }],
      returns: [{ name: 'vault', type: 'address', description: 'erc7575.fn.vault.returns.vault' }],
      description: 'erc7575.fn.vault.desc',
      defaultSimValues: { asset: '0xAssetA' },
    },
    {
      name: 'VaultUpdate',
      signature: 'VaultUpdate(address indexed asset, address vault)',
      type: 'event',
      params: [
        { name: 'asset', type: 'address', description: 'erc7575.fn.VaultUpdate.params.asset' },
        { name: 'vault', type: 'address', description: 'erc7575.fn.VaultUpdate.params.vault' },
      ],
      description: 'erc7575.fn.VaultUpdate.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc7575.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'erc7575-contract',
      type: 'contract',
      label: 'erc7575.node.contract',
      data: { functions: ['share', 'vault'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-vault',
      type: 'function',
      label: 'vault()',
      data: { fnType: 'read', signature: 'vault(address asset) → address' },
    },
    {
      id: 'fn-share',
      type: 'function',
      label: 'share()',
      data: { fnType: 'read', signature: 'share() → address' },
    },
    {
      id: 'storage-vaults',
      type: 'storage',
      label: 'erc7575.node.storageVaults',
      data: { slots: [{ key: 'vault', label: 'mapping(address asset => address)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-vaultUpdate',
      type: 'function',
      label: 'VaultUpdate event',
      data: { fnType: 'event', signature: 'VaultUpdate(address indexed asset, address vault)' },
    },
  ],

  flowEdges: [
    {
      id: 'e-user-vault',
      source: 'user',
      target: 'fn-vault',
      type: 'animated',
      label: 'erc7575.edge.callVault',
    },
    {
      id: 'e-vault-contract',
      source: 'fn-vault',
      target: 'erc7575-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc7575-contract',
      target: 'storage-vaults',
      type: 'labeled',
      label: 'erc7575.edge.readVaults',
    },
    {
      id: 'e-contract-event',
      source: 'erc7575-contract',
      target: 'event-vaultUpdate',
      type: 'labeled',
      label: 'erc7575.edge.emitVaultUpdate',
    },
    {
      id: 'e-user-share',
      source: 'user',
      target: 'fn-share',
      type: 'animated',
      label: 'erc7575.edge.callShare',
    },
    {
      id: 'e-share-contract',
      source: 'fn-share',
      target: 'erc7575-contract',
      type: 'animated',
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
      id: 'vault-lookup-walkthrough',
      name: 'erc7575.sim.vaultLookupWalkthrough.name',
      description: 'erc7575.sim.vaultLookupWalkthrough.desc',
      params: [
        {
          id: 'asset',
          label: 'erc7575.sim.vaultLookupWalkthrough.param.asset',
          type: 'address',
          defaultValue: '0xAssetA',
        },
      ],
      steps: [
        {
          id: 'step-lookup',
          description: 'erc7575.sim.vaultLookupWalkthrough.step.lookup',
          mobileDescription: 'erc7575.sim.vaultLookupWalkthrough.step.lookup.mobile',
          highlightNodes: ['user', 'fn-vault'],
          highlightEdges: ['e-user-vault'],
          durationMs: 1000,
        },
        {
          id: 'step-read',
          description: 'erc7575.sim.vaultLookupWalkthrough.step.read',
          mobileDescription: 'erc7575.sim.vaultLookupWalkthrough.step.read.mobile',
          highlightNodes: ['fn-vault', 'erc7575-contract', 'storage-vaults'],
          highlightEdges: ['e-vault-contract', 'e-contract-storage'],
          valueChanges: { 'storage-vaults.vault[0xAssetA]': '→ 0xVaultA' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc7575.sim.vaultLookupWalkthrough.step.event',
          mobileDescription: 'erc7575.sim.vaultLookupWalkthrough.step.event.mobile',
          highlightNodes: ['erc7575-contract', 'event-vaultUpdate'],
          highlightEdges: ['e-contract-event'],
          valueChanges: { 'event-vaultUpdate.lastEvent': 'VaultUpdate(0xAssetA, 0xVaultA)' },
          durationMs: 800,
        },
      ],
    },
  ],
};
