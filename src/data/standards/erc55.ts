import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc55',
  name: 'ERC-55',
  shortDescription: 'erc55.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 55,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-55',
  relatedSlugs: ['erc165', 'erc1271', 'erc4361'],
  sortOrder: 10055,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-55 Specification', url: 'https://eips.ethereum.org/EIPS/eip-55', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc55.introduction',
  designPurpose: 'erc55.designPurpose',
  commonUsage: 'erc55.commonUsage',

  // ERC-55 specifies a pure encoding algorithm, not a Solidity interface — no functions.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc55.node.user',
      data: { address: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359' },
      layoutHint: 'source',
    },
    {
      id: 'encoder',
      type: 'contract',
      label: 'erc55.node.encoder',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'storage-hash',
      type: 'storage',
      label: 'erc55.node.storageHash',
      data: { slots: [{ key: 'hash', label: 'keccak256(lowercase hex) → bytes32' }] },
      layoutHint: 'storage',
    },
    {
      id: 'storage-result',
      type: 'storage',
      label: 'erc55.node.storageResult',
      data: { slots: [{ key: 'checksummed', label: '0x + mixed-case hex (40 chars)' }] },
    },
    {
      id: 'verifier',
      type: 'contract',
      label: 'erc55.node.verifier',
      data: { functions: [] },
    },
    {
      id: 'consumer',
      type: 'user',
      label: 'erc55.node.consumer',
      data: { address: '0xWallet' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-encoder',
      source: 'user',
      target: 'encoder',
      type: 'animated',
      label: 'erc55.edge.submitAddress',
    },
    {
      id: 'e-encoder-hash',
      source: 'encoder',
      target: 'storage-hash',
      type: 'labeled',
      label: 'erc55.edge.hashAddress',
    },
    {
      id: 'e-encoder-result',
      source: 'encoder',
      target: 'storage-result',
      type: 'labeled',
      label: 'erc55.edge.applyCasing',
    },
    {
      id: 'e-hash-verifier',
      source: 'storage-hash',
      target: 'verifier',
      type: 'labeled',
      label: 'erc55.edge.readHash',
    },
    {
      id: 'e-result-verifier',
      source: 'storage-result',
      target: 'verifier',
      type: 'animated',
      label: 'erc55.edge.checkChecksum',
    },
    {
      id: 'e-verifier-consumer',
      source: 'verifier',
      target: 'consumer',
      type: 'animated',
      label: 'erc55.edge.deliverAddress',
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
      id: 'checksum-walkthrough',
      name: 'erc55.sim.checksumWalkthrough.name',
      description: 'erc55.sim.checksumWalkthrough.desc',
      params: [
        {
          id: 'address',
          label: 'erc55.sim.checksumWalkthrough.param.address',
          type: 'address',
          defaultValue: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359',
        },
      ],
      steps: [
        {
          id: 'step-submit',
          description: 'erc55.sim.checksumWalkthrough.step.submit',
          mobileDescription: 'erc55.sim.checksumWalkthrough.step.submit.mobile',
          highlightNodes: ['user', 'encoder'],
          highlightEdges: ['e-user-encoder'],
          durationMs: 1000,
        },
        {
          id: 'step-hash',
          description: 'erc55.sim.checksumWalkthrough.step.hash',
          mobileDescription: 'erc55.sim.checksumWalkthrough.step.hash.mobile',
          highlightNodes: ['encoder', 'storage-hash'],
          highlightEdges: ['e-encoder-hash'],
          valueChanges: { 'storage-hash.hash': 'empty → keccak256 of the lowercase hex string' },
          durationMs: 1200,
        },
        {
          id: 'step-case',
          description: 'erc55.sim.checksumWalkthrough.step.case',
          mobileDescription: 'erc55.sim.checksumWalkthrough.step.case.mobile',
          highlightNodes: ['encoder', 'storage-result'],
          highlightEdges: ['e-encoder-result'],
          valueChanges: {
            'storage-result.checksummed':
              '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359 → 0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
          },
          durationMs: 1200,
        },
        {
          id: 'step-verify',
          description: 'erc55.sim.checksumWalkthrough.step.verify',
          mobileDescription: 'erc55.sim.checksumWalkthrough.step.verify.mobile',
          highlightNodes: ['storage-hash', 'storage-result', 'verifier', 'consumer'],
          highlightEdges: ['e-hash-verifier', 'e-result-verifier', 'e-verifier-consumer'],
          valueChanges: { 'verifier.result': 'casing matches hash → checksum valid' },
          durationMs: 1000,
        },
      ],
    },
  ],
};
