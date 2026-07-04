import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1191',
  name: 'ERC-1191',
  shortDescription: 'erc1191.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 1191,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1191',
  relatedSlugs: ['erc55', 'erc681', 'erc4361'],
  sortOrder: 11191,
  eipStatus: 'Last Call',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [55, 155],
  relations: [{ slug: 'erc55', kind: 'extends' }],
  references: [
    { label: 'ERC-1191 Specification', url: 'https://eips.ethereum.org/EIPS/eip-1191', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc1191.introduction',
  designPurpose: 'erc1191.designPurpose',
  commonUsage: 'erc1191.commonUsage',

  // ERC-1191 specifies an address-encoding algorithm, not a Solidity interface — no functions.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc1191.node.user',
      data: { address: '0x27b1fdb04752bbc536007a920d24acb045561c26' },
      layoutHint: 'source',
    },
    {
      id: 'encoder',
      type: 'contract',
      label: 'erc1191.node.encoder',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'storage-input',
      type: 'storage',
      label: 'erc1191.node.storageInput',
      data: { slots: [{ key: 'input', label: 'chainId + "0x" + lowercase hex' }] },
      layoutHint: 'storage',
    },
    {
      id: 'storage-hash',
      type: 'storage',
      label: 'erc1191.node.storageHash',
      data: { slots: [{ key: 'hash', label: 'keccak256(chain-prefixed input) → bytes32' }] },
      layoutHint: 'storage',
    },
    {
      id: 'storage-result',
      type: 'storage',
      label: 'erc1191.node.storageResult',
      data: { slots: [{ key: 'checksummed', label: '0x + mixed-case hex (40 chars)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'verifier',
      type: 'contract',
      label: 'erc1191.node.verifier',
      data: { functions: [] },
    },
    {
      id: 'consumer',
      type: 'user',
      label: 'erc1191.node.consumer',
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
      label: 'erc1191.edge.submitAddress',
    },
    {
      id: 'e-encoder-input',
      source: 'encoder',
      target: 'storage-input',
      type: 'labeled',
      label: 'erc1191.edge.prefixChainId',
    },
    {
      id: 'e-input-hash',
      source: 'storage-input',
      target: 'storage-hash',
      type: 'labeled',
      label: 'erc1191.edge.hashInput',
    },
    {
      id: 'e-encoder-result',
      source: 'encoder',
      target: 'storage-result',
      type: 'labeled',
      label: 'erc1191.edge.applyCasing',
    },
    {
      id: 'e-hash-verifier',
      source: 'storage-hash',
      target: 'verifier',
      type: 'labeled',
      label: 'erc1191.edge.readHash',
    },
    {
      id: 'e-result-verifier',
      source: 'storage-result',
      target: 'verifier',
      type: 'animated',
      label: 'erc1191.edge.checkCasing',
    },
    {
      id: 'e-verifier-consumer',
      source: 'verifier',
      target: 'consumer',
      type: 'animated',
      label: 'erc1191.edge.deliverAddress',
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
      name: 'erc1191.sim.checksumWalkthrough.name',
      description: 'erc1191.sim.checksumWalkthrough.desc',
      params: [
        {
          id: 'address',
          label: 'erc1191.sim.checksumWalkthrough.param.address',
          type: 'address',
          defaultValue: '0x27b1fdb04752bbc536007a920d24acb045561c26',
        },
        {
          id: 'chainId',
          label: 'erc1191.sim.checksumWalkthrough.param.chainId',
          type: 'select',
          options: [
            { label: 'RSK Mainnet (30)', value: '30' },
            { label: 'RSK Testnet (31)', value: '31' },
            { label: 'Ethereum Mainnet (1)', value: '1' },
          ],
          defaultValue: '30',
        },
      ],
      steps: [
        {
          id: 'step-submit',
          description: 'erc1191.sim.checksumWalkthrough.step.submit',
          mobileDescription: 'erc1191.sim.checksumWalkthrough.step.submit.mobile',
          highlightNodes: ['user', 'encoder'],
          highlightEdges: ['e-user-encoder'],
          durationMs: 1000,
        },
        {
          id: 'step-prefix',
          description: 'erc1191.sim.checksumWalkthrough.step.prefix',
          mobileDescription: 'erc1191.sim.checksumWalkthrough.step.prefix.mobile',
          highlightNodes: ['encoder', 'storage-input', 'storage-hash'],
          highlightEdges: ['e-encoder-input', 'e-input-hash'],
          valueChanges: {
            'storage-input.input': 'empty → "300x27b1fdb04752bbc536007a920d24acb045561c26"',
            'storage-hash.hash': 'empty → keccak256 of the chain-prefixed string',
          },
          durationMs: 1200,
        },
        {
          id: 'step-case',
          description: 'erc1191.sim.checksumWalkthrough.step.case',
          mobileDescription: 'erc1191.sim.checksumWalkthrough.step.case.mobile',
          highlightNodes: ['encoder', 'storage-result'],
          highlightEdges: ['e-encoder-result'],
          valueChanges: {
            'storage-result.checksummed':
              '0x27b1fdb04752bbc536007a920d24acb045561c26 → 0x27b1FdB04752BBc536007A920D24ACB045561c26',
          },
          durationMs: 1200,
        },
        {
          id: 'step-verify',
          description: 'erc1191.sim.checksumWalkthrough.step.verify',
          mobileDescription: 'erc1191.sim.checksumWalkthrough.step.verify.mobile',
          highlightNodes: ['storage-hash', 'storage-result', 'verifier', 'consumer'],
          highlightEdges: ['e-hash-verifier', 'e-result-verifier', 'e-verifier-consumer'],
          valueChanges: { 'verifier.result': 'casing matches the chain-30 hash → valid RSK Mainnet address' },
          durationMs: 1000,
        },
      ],
    },
  ],
};
