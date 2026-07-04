import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc831',
  name: 'ERC-831',
  shortDescription: 'erc831.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 831,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-831',
  relatedSlugs: ['erc681', 'erc55', 'erc4361'],
  sortOrder: 10831,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [67, 681],
  relations: [{ slug: 'erc681', kind: 'requires' }],
  references: [
    { label: 'ERC-831 Specification', url: 'https://eips.ethereum.org/EIPS/eip-831', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc831.introduction',
  designPurpose: 'erc831.designPurpose',
  commonUsage: 'erc831.commonUsage',

  // ERC-831 specifies a URI scheme grammar, not a Solidity interface — no functions to extract.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'requester',
      type: 'user',
      label: 'erc831.node.requester',
      data: { address: '0xRequester' },
      layoutHint: 'source',
    },
    {
      id: 'uri-builder',
      type: 'contract',
      label: 'erc831.node.uriBuilder',
      data: {},
      layoutHint: 'center',
    },
    {
      id: 'ethereum-uri',
      type: 'storage',
      label: 'erc831.node.ethereumUri',
      data: {
        slots: [
          { key: 'scheme', label: 'ethereum: / eth:' },
          { key: 'prefix', label: 'STRING (optional)' },
          { key: 'payload', label: 'STRING (0x… if no prefix)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'wallet',
      type: 'contract',
      label: 'erc831.node.wallet',
      data: {},
    },
    {
      id: 'use-case-handler',
      type: 'contract',
      label: 'erc831.node.useCaseHandler',
      data: {},
    },
    {
      id: 'user',
      type: 'user',
      label: 'erc831.node.user',
      data: { address: '0xWallet' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-requester-builder',
      source: 'requester',
      target: 'uri-builder',
      type: 'animated',
      label: 'erc831.edge.composeRequest',
    },
    {
      id: 'e-builder-uri',
      source: 'uri-builder',
      target: 'ethereum-uri',
      type: 'labeled',
      label: 'erc831.edge.encodeUri',
    },
    {
      id: 'e-uri-wallet',
      source: 'ethereum-uri',
      target: 'wallet',
      type: 'animated',
      label: 'erc831.edge.openUri',
    },
    {
      id: 'e-wallet-handler',
      source: 'wallet',
      target: 'use-case-handler',
      type: 'labeled',
      label: 'erc831.edge.routePrefix',
    },
    {
      id: 'e-handler-user',
      source: 'use-case-handler',
      target: 'user',
      type: 'animated',
      label: 'erc831.edge.presentAction',
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
      id: 'uri-routing-walkthrough',
      name: 'erc831.sim.uriRoutingWalkthrough.name',
      description: 'erc831.sim.uriRoutingWalkthrough.desc',
      params: [
        {
          id: 'prefix',
          label: 'erc831.sim.uriRoutingWalkthrough.param.prefix',
          type: 'select',
          options: [
            { label: 'pay-', value: 'pay-' },
            { label: '(none)', value: '' },
          ],
          defaultValue: 'pay-',
        },
        {
          id: 'target',
          label: 'erc831.sim.uriRoutingWalkthrough.param.target',
          type: 'address',
          defaultValue: '0xfb6916095ca1df60bb79Ce92ce3ea74c37c5d359',
        },
      ],
      steps: [
        {
          id: 'step-compose',
          description: 'erc831.sim.uriRoutingWalkthrough.step.compose',
          mobileDescription: 'erc831.sim.uriRoutingWalkthrough.step.compose.mobile',
          highlightNodes: ['requester', 'uri-builder'],
          highlightEdges: ['e-requester-builder'],
          durationMs: 1000,
        },
        {
          id: 'step-encode',
          description: 'erc831.sim.uriRoutingWalkthrough.step.encode',
          mobileDescription: 'erc831.sim.uriRoutingWalkthrough.step.encode.mobile',
          highlightNodes: ['uri-builder', 'ethereum-uri'],
          highlightEdges: ['e-builder-uri'],
          valueChanges: { 'ethereum-uri.value': 'empty → ethereum:pay-0xfb69…d359' },
          durationMs: 1200,
        },
        {
          id: 'step-open',
          description: 'erc831.sim.uriRoutingWalkthrough.step.open',
          mobileDescription: 'erc831.sim.uriRoutingWalkthrough.step.open.mobile',
          highlightNodes: ['ethereum-uri', 'wallet'],
          highlightEdges: ['e-uri-wallet'],
          durationMs: 1100,
        },
        {
          id: 'step-route',
          description: 'erc831.sim.uriRoutingWalkthrough.step.route',
          mobileDescription: 'erc831.sim.uriRoutingWalkthrough.step.route.mobile',
          highlightNodes: ['wallet', 'use-case-handler', 'user'],
          highlightEdges: ['e-wallet-handler', 'e-handler-user'],
          valueChanges: { 'use-case-handler.prefix': 'pay- → EIP-681 payment request' },
          durationMs: 900,
        },
      ],
    },
  ],
};
