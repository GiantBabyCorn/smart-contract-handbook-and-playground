import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc3770',
  name: 'ERC-3770',
  shortDescription: 'erc3770.short',
  category: 'cross-chain',
  entryType: 'standard',
  eipNumber: 3770,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-3770',
  relatedSlugs: ['erc55', 'erc681', 'erc7683', 'erc4361'],
  sortOrder: 13770,
  eipStatus: 'Draft',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  relations: [{ slug: 'erc55', kind: 'usedWith' }],
  references: [
    { label: 'ERC-3770 Specification', url: 'https://eips.ethereum.org/EIPS/eip-3770', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc3770.introduction',
  designPurpose: 'erc3770.designPurpose',
  commonUsage: 'erc3770.commonUsage',

  // ERC-3770 specifies a text syntax for prefixing addresses, not a Solidity interface — no functions.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc3770.node.user',
      data: { address: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359' },
      layoutHint: 'source',
    },
    {
      id: 'formatter',
      type: 'contract',
      label: 'erc3770.node.formatter',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'storage-registry',
      type: 'storage',
      label: 'erc3770.node.storageRegistry',
      data: { slots: [{ key: 'shortName', label: 'ethereum-lists/chains: chainId → shortName' }] },
      layoutHint: 'storage',
    },
    {
      id: 'storage-address',
      type: 'storage',
      label: 'erc3770.node.storageAddress',
      data: { slots: [{ key: 'chainSpecific', label: 'shortName + ":" + ERC-55 address' }] },
    },
    {
      id: 'resolver',
      type: 'contract',
      label: 'erc3770.node.resolver',
      data: { functions: [] },
    },
    {
      id: 'wallet',
      type: 'user',
      label: 'erc3770.node.wallet',
      data: { address: '0xWallet' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-formatter',
      source: 'user',
      target: 'formatter',
      type: 'animated',
      label: 'erc3770.edge.submitAddress',
    },
    {
      id: 'e-formatter-registry',
      source: 'formatter',
      target: 'storage-registry',
      type: 'labeled',
      label: 'erc3770.edge.lookupShortName',
    },
    {
      id: 'e-formatter-address',
      source: 'formatter',
      target: 'storage-address',
      type: 'labeled',
      label: 'erc3770.edge.buildPrefix',
    },
    {
      id: 'e-registry-resolver',
      source: 'storage-registry',
      target: 'resolver',
      type: 'labeled',
      label: 'erc3770.edge.readShortName',
    },
    {
      id: 'e-address-resolver',
      source: 'storage-address',
      target: 'resolver',
      type: 'animated',
      label: 'erc3770.edge.parsePrefix',
    },
    {
      id: 'e-resolver-wallet',
      source: 'resolver',
      target: 'wallet',
      type: 'animated',
      label: 'erc3770.edge.routeToChain',
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
      id: 'format-address-walkthrough',
      name: 'erc3770.sim.formatAddressWalkthrough.name',
      description: 'erc3770.sim.formatAddressWalkthrough.desc',
      params: [
        {
          id: 'shortName',
          label: 'erc3770.sim.formatAddressWalkthrough.param.shortName',
          type: 'select',
          options: [
            { label: 'eth (Ethereum)', value: 'eth' },
            { label: 'oeth (Optimism)', value: 'oeth' },
            { label: 'gno (Gnosis)', value: 'gno' },
            { label: 'arb1 (Arbitrum One)', value: 'arb1' },
          ],
          defaultValue: 'eth',
        },
        {
          id: 'address',
          label: 'erc3770.sim.formatAddressWalkthrough.param.address',
          type: 'address',
          defaultValue: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
        },
      ],
      steps: [
        {
          id: 'step-submit',
          description: 'erc3770.sim.formatAddressWalkthrough.step.submit',
          mobileDescription: 'erc3770.sim.formatAddressWalkthrough.step.submit.mobile',
          highlightNodes: ['user', 'formatter'],
          highlightEdges: ['e-user-formatter'],
          durationMs: 1000,
        },
        {
          id: 'step-lookup',
          description: 'erc3770.sim.formatAddressWalkthrough.step.lookup',
          mobileDescription: 'erc3770.sim.formatAddressWalkthrough.step.lookup.mobile',
          highlightNodes: ['formatter', 'storage-registry'],
          highlightEdges: ['e-formatter-registry'],
          valueChanges: { 'storage-registry.shortName': 'chainId 1 → eth' },
          durationMs: 1200,
        },
        {
          id: 'step-build',
          description: 'erc3770.sim.formatAddressWalkthrough.step.build',
          mobileDescription: 'erc3770.sim.formatAddressWalkthrough.step.build.mobile',
          highlightNodes: ['formatter', 'storage-address'],
          highlightEdges: ['e-formatter-address'],
          valueChanges: {
            'storage-address.chainSpecific':
              '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359 → eth:0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
          },
          durationMs: 1200,
        },
        {
          id: 'step-resolve',
          description: 'erc3770.sim.formatAddressWalkthrough.step.resolve',
          mobileDescription: 'erc3770.sim.formatAddressWalkthrough.step.resolve.mobile',
          highlightNodes: ['storage-registry', 'storage-address', 'resolver', 'wallet'],
          highlightEdges: ['e-registry-resolver', 'e-address-resolver', 'e-resolver-wallet'],
          valueChanges: { 'resolver.chain': 'eth → Ethereum Mainnet (chainId 1)' },
          durationMs: 1000,
        },
      ],
    },
  ],
};
