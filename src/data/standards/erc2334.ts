import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2334',
  name: 'ERC-2334',
  shortDescription: 'erc2334.short',
  category: 'account',
  entryType: 'standard',
  eipNumber: 2334,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2334',
  relatedSlugs: ['erc4337', 'erc6551', 'erc7702', 'erc1271'],
  sortOrder: 12334,
  eipStatus: 'Review',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [2333],
  references: [
    { label: 'ERC-2334 Specification', url: 'https://eips.ethereum.org/EIPS/eip-2334', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc2334.introduction',
  designPurpose: 'erc2334.designPurpose',
  commonUsage: 'erc2334.commonUsage',

  // ERC-2334 specifies a key-derivation path convention, not a Solidity interface — no functions.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc2334.node.user',
      data: { address: 'mnemonic seed' },
      layoutHint: 'source',
    },
    {
      id: 'deriver',
      type: 'contract',
      label: 'erc2334.node.deriver',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'storage-path',
      type: 'storage',
      label: 'erc2334.node.storagePath',
      data: { slots: [{ key: 'path', label: 'm / 12381 / 3600 / account / use' }] },
      layoutHint: 'storage',
    },
    {
      id: 'storage-withdrawal',
      type: 'storage',
      label: 'erc2334.node.storageWithdrawal',
      data: { slots: [{ key: 'withdrawalKey', label: 'm/12381/3600/i/0' }] },
    },
    {
      id: 'storage-signing',
      type: 'storage',
      label: 'erc2334.node.storageSigning',
      data: { slots: [{ key: 'signingKey', label: 'm/12381/3600/i/0/0' }] },
    },
    {
      id: 'validator',
      type: 'user',
      label: 'erc2334.node.validator',
      data: { address: '0xValidator' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-deriver',
      source: 'user',
      target: 'deriver',
      type: 'animated',
      label: 'erc2334.edge.provideSeed',
    },
    {
      id: 'e-deriver-path',
      source: 'deriver',
      target: 'storage-path',
      type: 'labeled',
      label: 'erc2334.edge.buildPath',
    },
    {
      id: 'e-path-withdrawal',
      source: 'storage-path',
      target: 'storage-withdrawal',
      type: 'labeled',
      label: 'erc2334.edge.deriveWithdrawal',
    },
    {
      id: 'e-withdrawal-signing',
      source: 'storage-withdrawal',
      target: 'storage-signing',
      type: 'labeled',
      label: 'erc2334.edge.deriveSigning',
    },
    {
      id: 'e-signing-validator',
      source: 'storage-signing',
      target: 'validator',
      type: 'animated',
      label: 'erc2334.edge.loadSigning',
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
      name: 'erc2334.sim.deriveKeysWalkthrough.name',
      description: 'erc2334.sim.deriveKeysWalkthrough.desc',
      params: [
        {
          id: 'accountIndex',
          label: 'erc2334.sim.deriveKeysWalkthrough.param.accountIndex',
          type: 'uint256',
          defaultValue: '0',
        },
      ],
      steps: [
        {
          id: 'step-seed',
          description: 'erc2334.sim.deriveKeysWalkthrough.step.seed',
          mobileDescription: 'erc2334.sim.deriveKeysWalkthrough.step.seed.mobile',
          highlightNodes: ['user', 'deriver'],
          highlightEdges: ['e-user-deriver'],
          durationMs: 1000,
        },
        {
          id: 'step-path',
          description: 'erc2334.sim.deriveKeysWalkthrough.step.path',
          mobileDescription: 'erc2334.sim.deriveKeysWalkthrough.step.path.mobile',
          highlightNodes: ['deriver', 'storage-path'],
          highlightEdges: ['e-deriver-path'],
          valueChanges: { 'storage-path.path': 'm → m / 12381 / 3600 / 0 / 0' },
          durationMs: 1200,
        },
        {
          id: 'step-derive',
          description: 'erc2334.sim.deriveKeysWalkthrough.step.derive',
          mobileDescription: 'erc2334.sim.deriveKeysWalkthrough.step.derive.mobile',
          highlightNodes: ['storage-path', 'storage-withdrawal', 'storage-signing'],
          highlightEdges: ['e-path-withdrawal', 'e-withdrawal-signing'],
          valueChanges: {
            'storage-withdrawal.withdrawalKey': 'derived at m/12381/3600/0/0',
            'storage-signing.signingKey': 'derived at m/12381/3600/0/0/0',
          },
          durationMs: 1200,
        },
        {
          id: 'step-load',
          description: 'erc2334.sim.deriveKeysWalkthrough.step.load',
          mobileDescription: 'erc2334.sim.deriveKeysWalkthrough.step.load.mobile',
          highlightNodes: ['storage-signing', 'validator'],
          highlightEdges: ['e-signing-validator'],
          durationMs: 1000,
        },
      ],
    },
  ],
};
