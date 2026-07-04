import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc681',
  name: 'ERC-681',
  shortDescription: 'erc681.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 681,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-681',
  relatedSlugs: ['erc20', 'erc4361'],
  sortOrder: 10681,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20, 137],
  relations: [{ slug: 'erc20', kind: 'requires' }],
  references: [
    { label: 'ERC-681 Specification', url: 'https://eips.ethereum.org/EIPS/eip-681', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc681.introduction',
  designPurpose: 'erc681.designPurpose',
  commonUsage: 'erc681.commonUsage',

  // ERC-681 specifies a URL grammar, not a Solidity interface — no functions to extract.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'payee',
      type: 'user',
      label: 'erc681.node.payee',
      data: { address: '0xPayee' },
      layoutHint: 'source',
    },
    {
      id: 'url-builder',
      type: 'contract',
      label: 'erc681.node.urlBuilder',
      data: {},
      layoutHint: 'center',
    },
    {
      id: 'payment-url',
      type: 'storage',
      label: 'erc681.node.paymentUrl',
      data: {
        slots: [
          { key: 'schema', label: 'ethereum:[pay-]' },
          { key: 'target_address', label: '0x… / ENS' },
          { key: 'chain_id', label: 'uint (optional)' },
          { key: 'function_name', label: 'string (optional)' },
          { key: 'parameters', label: 'value / gas / TYPE' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'wallet',
      type: 'contract',
      label: 'erc681.node.wallet',
      data: {},
    },
    {
      id: 'payer',
      type: 'user',
      label: 'erc681.node.payer',
      data: { address: '0xPayer' },
    },
    {
      id: 'transaction',
      type: 'storage',
      label: 'erc681.node.transaction',
      data: {
        slots: [
          { key: 'to', label: 'address' },
          { key: 'value', label: 'uint256 wei' },
          { key: 'data', label: 'bytes (ABI call)' },
        ],
      },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-payee-builder',
      source: 'payee',
      target: 'url-builder',
      type: 'animated',
      label: 'erc681.edge.buildRequest',
    },
    {
      id: 'e-builder-url',
      source: 'url-builder',
      target: 'payment-url',
      type: 'labeled',
      label: 'erc681.edge.encodeUrl',
    },
    {
      id: 'e-url-wallet',
      source: 'payment-url',
      target: 'wallet',
      type: 'animated',
      label: 'erc681.edge.scanUrl',
    },
    {
      id: 'e-payer-wallet',
      source: 'payer',
      target: 'wallet',
      type: 'animated',
      label: 'erc681.edge.confirm',
    },
    {
      id: 'e-wallet-tx',
      source: 'wallet',
      target: 'transaction',
      type: 'labeled',
      label: 'erc681.edge.buildTx',
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
      id: 'payment-request-walkthrough',
      name: 'erc681.sim.paymentRequestWalkthrough.name',
      description: 'erc681.sim.paymentRequestWalkthrough.desc',
      params: [
        {
          id: 'targetAddress',
          label: 'erc681.sim.paymentRequestWalkthrough.param.targetAddress',
          type: 'address',
          defaultValue: '0xfb6916095ca1df60bb79Ce92ce3ea74c37c5d359',
        },
        {
          id: 'value',
          label: 'erc681.sim.paymentRequestWalkthrough.param.value',
          type: 'uint256',
          defaultValue: '2014000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-build',
          description: 'erc681.sim.paymentRequestWalkthrough.step.build',
          mobileDescription: 'erc681.sim.paymentRequestWalkthrough.step.build.mobile',
          highlightNodes: ['payee', 'url-builder'],
          highlightEdges: ['e-payee-builder'],
          durationMs: 1000,
        },
        {
          id: 'step-encode',
          description: 'erc681.sim.paymentRequestWalkthrough.step.encode',
          mobileDescription: 'erc681.sim.paymentRequestWalkthrough.step.encode.mobile',
          highlightNodes: ['url-builder', 'payment-url'],
          highlightEdges: ['e-builder-url'],
          valueChanges: {
            'payment-url.value': 'ethereum:0xfb69…d359?value=2.014e18',
          },
          durationMs: 1200,
        },
        {
          id: 'step-scan',
          description: 'erc681.sim.paymentRequestWalkthrough.step.scan',
          mobileDescription: 'erc681.sim.paymentRequestWalkthrough.step.scan.mobile',
          highlightNodes: ['payment-url', 'wallet', 'payer'],
          highlightEdges: ['e-url-wallet', 'e-payer-wallet'],
          durationMs: 1100,
        },
        {
          id: 'step-send',
          description: 'erc681.sim.paymentRequestWalkthrough.step.send',
          mobileDescription: 'erc681.sim.paymentRequestWalkthrough.step.send.mobile',
          highlightNodes: ['wallet', 'transaction'],
          highlightEdges: ['e-wallet-tx'],
          valueChanges: {
            'transaction.to': '0xfb6916095ca1df60bb79Ce92ce3ea74c37c5d359',
            'transaction.value': '2014000000000000000 wei',
          },
          durationMs: 900,
        },
      ],
    },
  ],
};
