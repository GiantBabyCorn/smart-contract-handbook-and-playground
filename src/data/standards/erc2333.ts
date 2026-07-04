import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2333',
  name: 'ERC-2333',
  shortDescription: 'erc2333.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 2333,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2333',
  relatedSlugs: ['erc1271', 'erc2098', 'erc55'],
  sortOrder: 12333,
  eipStatus: 'Review',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-2333 Specification', url: 'https://eips.ethereum.org/EIPS/eip-2333', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc2333.introduction',
  designPurpose: 'erc2333.designPurpose',
  commonUsage: 'erc2333.commonUsage',

  // ERC-2333 specifies an off-chain key-derivation algorithm, not a Solidity interface — no functions.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc2333.node.user',
      data: { address: '0xSeedOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc2333-scheme',
      type: 'contract',
      label: 'erc2333.node.scheme',
      data: { functions: ['derive_master_SK', 'derive_child_SK'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-deriveMaster',
      type: 'function',
      label: 'derive_master_SK()',
      data: { fnType: 'read', signature: 'derive_master_SK(seed) → SK' },
    },
    {
      id: 'fn-deriveChild',
      type: 'function',
      label: 'derive_child_SK()',
      data: { fnType: 'read', signature: 'derive_child_SK(parent_SK, index) → child_SK' },
    },
    {
      id: 'storage-tree',
      type: 'storage',
      label: 'erc2333.node.storageTree',
      data: {
        slots: [
          { key: 'm', label: 'master SK (tree root)' },
          { key: 'm / i', label: 'child SK, 0 <= i < 2^32' },
        ],
      },
      layoutHint: 'storage',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-deriveMaster',
      source: 'user',
      target: 'fn-deriveMaster',
      type: 'animated',
      label: 'erc2333.edge.provideSeed',
    },
    {
      id: 'e-deriveMaster-scheme',
      source: 'fn-deriveMaster',
      target: 'erc2333-scheme',
      type: 'animated',
    },
    {
      id: 'e-scheme-tree',
      source: 'erc2333-scheme',
      target: 'storage-tree',
      type: 'labeled',
      label: 'erc2333.edge.storeMaster',
    },
    {
      id: 'e-scheme-deriveChild',
      source: 'erc2333-scheme',
      target: 'fn-deriveChild',
      type: 'animated',
      label: 'erc2333.edge.deriveChild',
    },
    {
      id: 'e-deriveChild-tree',
      source: 'fn-deriveChild',
      target: 'storage-tree',
      type: 'labeled',
      label: 'erc2333.edge.populateTree',
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
      id: 'derive-keys-walkthrough',
      name: 'erc2333.sim.deriveKeysWalkthrough.name',
      description: 'erc2333.sim.deriveKeysWalkthrough.desc',
      params: [
        {
          id: 'seed',
          label: 'erc2333.sim.deriveKeysWalkthrough.param.seed',
          type: 'select',
          options: [
            {
              label: 'Test seed A',
              value: '0x3141592653589793238462643383279502884197169399375105820974944592',
            },
            {
              label: 'Test seed B',
              value: '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
            },
          ],
          defaultValue: '0x3141592653589793238462643383279502884197169399375105820974944592',
        },
        {
          id: 'index',
          label: 'erc2333.sim.deriveKeysWalkthrough.param.index',
          type: 'uint256',
          defaultValue: '0',
        },
      ],
      steps: [
        {
          id: 'step-seed',
          description: 'erc2333.sim.deriveKeysWalkthrough.step.seed',
          mobileDescription: 'erc2333.sim.deriveKeysWalkthrough.step.seed.mobile',
          highlightNodes: ['user', 'fn-deriveMaster'],
          highlightEdges: ['e-user-deriveMaster'],
          durationMs: 1000,
        },
        {
          id: 'step-master',
          description: 'erc2333.sim.deriveKeysWalkthrough.step.master',
          mobileDescription: 'erc2333.sim.deriveKeysWalkthrough.step.master.mobile',
          highlightNodes: ['fn-deriveMaster', 'erc2333-scheme', 'storage-tree'],
          highlightEdges: ['e-deriveMaster-scheme', 'e-scheme-tree'],
          valueChanges: { 'storage-tree.m': 'unset → master SK (root of the tree)' },
          durationMs: 1200,
        },
        {
          id: 'step-child',
          description: 'erc2333.sim.deriveKeysWalkthrough.step.child',
          mobileDescription: 'erc2333.sim.deriveKeysWalkthrough.step.child.mobile',
          highlightNodes: ['erc2333-scheme', 'fn-deriveChild', 'storage-tree'],
          highlightEdges: ['e-scheme-deriveChild', 'e-deriveChild-tree'],
          valueChanges: { 'storage-tree.m / 0': 'unset → child SK at index 0' },
          durationMs: 1000,
        },
      ],
    },
  ],
};
