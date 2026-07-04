import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7930',
  name: 'ERC-7930',
  shortDescription: 'erc7930.short',
  category: 'cross-chain',
  entryType: 'standard',
  eipNumber: 7930,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7930',
  relatedSlugs: ['erc55', 'erc7683', 'erc681'],
  sortOrder: 17930,
  eipStatus: 'Review',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-7930 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7930', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7930.introduction',
  designPurpose: 'erc7930.designPurpose',
  commonUsage: 'erc7930.commonUsage',

  // ERC-7930 specifies a versioned binary envelope format, not a Solidity interface,
  // so there are no callable functions to document.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc7930.node.user',
      data: { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
      layoutHint: 'source',
    },
    {
      id: 'caip350',
      type: 'contract',
      label: 'erc7930.node.caip350',
      data: {},
    },
    {
      id: 'encoder',
      type: 'contract',
      label: 'erc7930.node.encoder',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'storage-envelope',
      type: 'storage',
      label: 'erc7930.node.storageEnvelope',
      data: {
        slots: [
          { key: 'Version', label: '0x0001 — 2-byte version' },
          { key: 'ChainType', label: 'CASA namespace — 2 bytes' },
          { key: 'ChainReference', label: '1-byte length + variable bytes' },
          { key: 'Address', label: '1-byte length + variable bytes' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'storage-result',
      type: 'storage',
      label: 'erc7930.node.storageResult',
      data: {
        slots: [
          { key: 'payload', label: '0x00010000010114d8da6bf26964af9d7eed9e03e53415d37aa96045' },
        ],
      },
    },
    {
      id: 'consumer',
      type: 'user',
      label: 'erc7930.node.consumer',
      data: { address: '0xProtocol' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-encoder',
      source: 'user',
      target: 'encoder',
      type: 'animated',
      label: 'erc7930.edge.submitTarget',
    },
    {
      id: 'e-caip350-encoder',
      source: 'caip350',
      target: 'encoder',
      type: 'labeled',
      label: 'erc7930.edge.provideRules',
    },
    {
      id: 'e-encoder-envelope',
      source: 'encoder',
      target: 'storage-envelope',
      type: 'labeled',
      label: 'erc7930.edge.assembleFields',
    },
    {
      id: 'e-envelope-result',
      source: 'storage-envelope',
      target: 'storage-result',
      type: 'labeled',
      label: 'erc7930.edge.concatenate',
    },
    {
      id: 'e-result-consumer',
      source: 'storage-result',
      target: 'consumer',
      type: 'animated',
      label: 'erc7930.edge.deliverAddress',
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
      id: 'encode-address-walkthrough',
      name: 'erc7930.sim.encodeAddressWalkthrough.name',
      description: 'erc7930.sim.encodeAddressWalkthrough.desc',
      params: [
        {
          id: 'address',
          label: 'erc7930.sim.encodeAddressWalkthrough.param.address',
          type: 'address',
          defaultValue: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        },
        {
          id: 'chain',
          label: 'erc7930.sim.encodeAddressWalkthrough.param.chain',
          type: 'select',
          options: [
            { label: 'Ethereum mainnet', value: 'Ethereum' },
            { label: 'Solana mainnet', value: 'Solana' },
          ],
          defaultValue: 'Ethereum',
        },
      ],
      steps: [
        {
          id: 'step-submit',
          description: 'erc7930.sim.encodeAddressWalkthrough.step.submit',
          mobileDescription: 'erc7930.sim.encodeAddressWalkthrough.step.submit.mobile',
          highlightNodes: ['user', 'encoder'],
          highlightEdges: ['e-user-encoder'],
          durationMs: 1000,
        },
        {
          id: 'step-serialize',
          description: 'erc7930.sim.encodeAddressWalkthrough.step.serialize',
          mobileDescription: 'erc7930.sim.encodeAddressWalkthrough.step.serialize.mobile',
          highlightNodes: ['caip350', 'encoder', 'storage-envelope'],
          highlightEdges: ['e-caip350-encoder', 'e-encoder-envelope'],
          valueChanges: {
            'storage-envelope.Version': '0x0001',
            'storage-envelope.ChainType': '0x0000',
            'storage-envelope.ChainReference': 'length 0x01, value 0x01',
            'storage-envelope.Address': 'length 0x14, value 0xd8da…6045',
          },
          durationMs: 1200,
        },
        {
          id: 'step-concatenate',
          description: 'erc7930.sim.encodeAddressWalkthrough.step.concatenate',
          mobileDescription: 'erc7930.sim.encodeAddressWalkthrough.step.concatenate.mobile',
          highlightNodes: ['storage-envelope', 'storage-result'],
          highlightEdges: ['e-envelope-result'],
          valueChanges: {
            'storage-result.payload': '0x00010000010114d8da6bf26964af9d7eed9e03e53415d37aa96045',
          },
          durationMs: 1100,
        },
        {
          id: 'step-deliver',
          description: 'erc7930.sim.encodeAddressWalkthrough.step.deliver',
          mobileDescription: 'erc7930.sim.encodeAddressWalkthrough.step.deliver.mobile',
          highlightNodes: ['storage-result', 'consumer'],
          highlightEdges: ['e-result-consumer'],
          durationMs: 900,
        },
      ],
    },
  ],
};
