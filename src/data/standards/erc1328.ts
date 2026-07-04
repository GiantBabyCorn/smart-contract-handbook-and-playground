import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1328',
  name: 'ERC-1328',
  shortDescription: 'erc1328.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 1328,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1328',
  relatedSlugs: ['erc681', 'erc4361', 'erc1271'],
  sortOrder: 11328,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-1328 Specification', url: 'https://eips.ethereum.org/EIPS/eip-1328', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc1328.introduction',
  designPurpose: 'erc1328.designPurpose',
  commonUsage: 'erc1328.commonUsage',

  // ERC-1328 specifies a URI grammar, not a Solidity interface — no functions to extract.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'dapp',
      type: 'user',
      label: 'erc1328.node.dapp',
      data: { address: '0xDApp' },
      layoutHint: 'source',
    },
    {
      id: 'uri-builder',
      type: 'contract',
      label: 'erc1328.node.uriBuilder',
      data: {},
      layoutHint: 'center',
    },
    {
      id: 'connection-uri',
      type: 'storage',
      label: 'erc1328.node.connectionUri',
      data: {
        slots: [
          { key: 'scheme', label: 'wc:' },
          { key: 'topic', label: 'STRING' },
          { key: 'version', label: '1*DIGIT' },
          { key: 'symKey', label: 'string (v2)' },
          { key: 'relay-protocol', label: 'string (v2)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'wallet',
      type: 'contract',
      label: 'erc1328.node.wallet',
      data: {},
    },
    {
      id: 'wallet-user',
      type: 'user',
      label: 'erc1328.node.walletUser',
      data: { address: '0xWallet' },
    },
    {
      id: 'pairing',
      type: 'storage',
      label: 'erc1328.node.pairing',
      data: {
        slots: [
          { key: 'topic', label: 'pairing topic' },
          { key: 'symKey', label: 'shared key' },
          { key: 'relay-protocol', label: 'transport' },
        ],
      },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-dapp-builder',
      source: 'dapp',
      target: 'uri-builder',
      type: 'animated',
      label: 'erc1328.edge.buildRequest',
    },
    {
      id: 'e-builder-uri',
      source: 'uri-builder',
      target: 'connection-uri',
      type: 'labeled',
      label: 'erc1328.edge.encodeUri',
    },
    {
      id: 'e-uri-wallet',
      source: 'connection-uri',
      target: 'wallet',
      type: 'animated',
      label: 'erc1328.edge.scanUri',
    },
    {
      id: 'e-user-wallet',
      source: 'wallet-user',
      target: 'wallet',
      type: 'animated',
      label: 'erc1328.edge.approve',
    },
    {
      id: 'e-wallet-pairing',
      source: 'wallet',
      target: 'pairing',
      type: 'labeled',
      label: 'erc1328.edge.establish',
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
      id: 'connection-uri-walkthrough',
      name: 'erc1328.sim.connectionUriWalkthrough.name',
      description: 'erc1328.sim.connectionUriWalkthrough.desc',
      params: [
        {
          id: 'version',
          label: 'erc1328.sim.connectionUriWalkthrough.param.version',
          type: 'select',
          options: [
            { label: 'v1', value: '1' },
            { label: 'v2', value: '2' },
          ],
          defaultValue: '2',
        },
        {
          id: 'expiryTimestamp',
          label: 'erc1328.sim.connectionUriWalkthrough.param.expiryTimestamp',
          type: 'uint256',
          defaultValue: '1705934757',
        },
      ],
      steps: [
        {
          id: 'step-build',
          description: 'erc1328.sim.connectionUriWalkthrough.step.build',
          mobileDescription: 'erc1328.sim.connectionUriWalkthrough.step.build.mobile',
          highlightNodes: ['dapp', 'uri-builder'],
          highlightEdges: ['e-dapp-builder'],
          durationMs: 1000,
        },
        {
          id: 'step-encode',
          description: 'erc1328.sim.connectionUriWalkthrough.step.encode',
          mobileDescription: 'erc1328.sim.connectionUriWalkthrough.step.encode.mobile',
          highlightNodes: ['uri-builder', 'connection-uri'],
          highlightEdges: ['e-builder-uri'],
          valueChanges: {
            'connection-uri.uri': 'wc:7f6e504b…90f9@2?relay-protocol=irn&symKey=587d5484…d303',
          },
          durationMs: 1200,
        },
        {
          id: 'step-scan',
          description: 'erc1328.sim.connectionUriWalkthrough.step.scan',
          mobileDescription: 'erc1328.sim.connectionUriWalkthrough.step.scan.mobile',
          highlightNodes: ['connection-uri', 'wallet', 'wallet-user'],
          highlightEdges: ['e-uri-wallet', 'e-user-wallet'],
          durationMs: 1100,
        },
        {
          id: 'step-pair',
          description: 'erc1328.sim.connectionUriWalkthrough.step.pair',
          mobileDescription: 'erc1328.sim.connectionUriWalkthrough.step.pair.mobile',
          highlightNodes: ['wallet', 'pairing'],
          highlightEdges: ['e-wallet-pairing'],
          valueChanges: {
            'pairing.topic': '7f6e504b…90f9',
            'pairing.symKey': '587d5484…d303',
          },
          durationMs: 900,
        },
      ],
    },
  ],
};
