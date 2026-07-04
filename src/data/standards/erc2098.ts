import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2098',
  name: 'ERC-2098',
  shortDescription: 'erc2098.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 2098,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2098',
  relatedSlugs: ['erc1271', 'erc2612', 'erc4337'],
  sortOrder: 12098,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [2],
  relations: [
    { slug: 'erc1271', kind: 'usedWith' },
    { slug: 'erc2612', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-2098 Specification', url: 'https://eips.ethereum.org/EIPS/eip-2098', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc2098.introduction',
  designPurpose: 'erc2098.designPurpose',
  commonUsage: 'erc2098.commonUsage',

  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'signer',
      type: 'user',
      label: 'erc2098.node.signer',
      data: { address: '0xSigner' },
      layoutHint: 'source',
    },
    {
      id: 'encoder',
      type: 'contract',
      label: 'erc2098.node.encoder',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'compact-sig',
      type: 'storage',
      label: 'erc2098.node.compactSig',
      data: {
        slots: [
          { key: 'r', label: 'bytes32  (256-bit r)' },
          { key: 'yParityAndS', label: 'bytes32  ((yParity << 255) | s)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'verifier',
      type: 'contract',
      label: 'erc2098.node.verifier',
      data: { functions: [] },
    },
    {
      id: 'recovered',
      type: 'user',
      label: 'erc2098.node.recovered',
      data: { address: '0xSigner' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-signer-encoder',
      source: 'signer',
      target: 'encoder',
      type: 'animated',
      label: 'erc2098.edge.sign',
    },
    {
      id: 'e-encoder-compact',
      source: 'encoder',
      target: 'compact-sig',
      type: 'labeled',
      label: 'erc2098.edge.pack',
    },
    {
      id: 'e-compact-verifier',
      source: 'compact-sig',
      target: 'verifier',
      type: 'animated',
      label: 'erc2098.edge.submit',
    },
    {
      id: 'e-verifier-recovered',
      source: 'verifier',
      target: 'recovered',
      type: 'labeled',
      label: 'erc2098.edge.recover',
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
      id: 'compact-encoding-walkthrough',
      name: 'erc2098.sim.compactEncoding.name',
      description: 'erc2098.sim.compactEncoding.desc',
      params: [
        {
          id: 'yParity',
          label: 'erc2098.sim.compactEncoding.param.yParity',
          type: 'select',
          options: [
            { label: '0  (v = 27)', value: '0' },
            { label: '1  (v = 28)', value: '1' },
          ],
          defaultValue: '0',
        },
      ],
      steps: [
        {
          id: 'step-sign',
          description: 'erc2098.sim.compactEncoding.step.sign',
          mobileDescription: 'erc2098.sim.compactEncoding.step.sign.mobile',
          highlightNodes: ['signer', 'encoder'],
          highlightEdges: ['e-signer-encoder'],
          durationMs: 1000,
        },
        {
          id: 'step-pack',
          description: 'erc2098.sim.compactEncoding.step.pack',
          mobileDescription: 'erc2098.sim.compactEncoding.step.pack.mobile',
          highlightNodes: ['encoder', 'compact-sig'],
          highlightEdges: ['e-encoder-compact'],
          valueChanges: {
            'compact-sig.r': 'r',
            'compact-sig.yParityAndS': '(0 << 255) | s = s',
          },
          durationMs: 1200,
        },
        {
          id: 'step-submit',
          description: 'erc2098.sim.compactEncoding.step.submit',
          mobileDescription: 'erc2098.sim.compactEncoding.step.submit.mobile',
          highlightNodes: ['compact-sig', 'verifier'],
          highlightEdges: ['e-compact-verifier'],
          durationMs: 1000,
        },
        {
          id: 'step-recover',
          description: 'erc2098.sim.compactEncoding.step.recover',
          mobileDescription: 'erc2098.sim.compactEncoding.step.recover.mobile',
          highlightNodes: ['verifier', 'recovered'],
          highlightEdges: ['e-verifier-recovered'],
          valueChanges: {
            'verifier.s': 'yParityAndS & (2^255 - 1)',
            'verifier.yParity': 'yParityAndS >> 255',
          },
          durationMs: 800,
        },
      ],
    },
  ],
};
