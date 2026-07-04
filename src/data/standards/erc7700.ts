import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7700',
  name: 'ERC-7700',
  shortDescription: 'erc7700.short',
  category: 'cross-chain',
  entryType: 'standard',
  eipNumber: 7700,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7700',
  relatedSlugs: ['erc7683', 'erc4804', 'erc1271'],
  sortOrder: 17700,
  eipStatus: 'Draft',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [155],
  references: [
    { label: 'ERC-7700 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7700', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7700.introduction',
  designPurpose: 'erc7700.designPurpose',
  commonUsage: 'erc7700.commonUsage',

  // ERC-7700 (CCIP-Store) specifies a revert-based routing convention and a set of
  // StorageRoutedTo__() error signatures — not a standardized callable Solidity interface.
  // The setValue/setAddr/setText functions in the spec are explicitly example code, so there
  // are no interface functions to extract.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'client',
      type: 'user',
      label: 'erc7700.node.client',
      data: { address: '0xClient' },
      layoutHint: 'source',
    },
    {
      id: 'erc7700-contract',
      type: 'contract',
      label: 'erc7700.node.contract',
      data: {},
      layoutHint: 'center',
    },
    {
      id: 'router-directive',
      type: 'storage',
      label: 'erc7700.node.router',
      data: {
        slots: [
          { key: 'StorageRoutedToL1', label: 'address contractL1' },
          { key: 'StorageRoutedToL2', label: 'address contractL2, uint256 chainId' },
          { key: 'StorageRoutedToDatabase', label: 'string gatewayUrl' },
        ],
      },
    },
    {
      id: 'gateway',
      type: 'contract',
      label: 'erc7700.node.gateway',
      data: {},
    },
    {
      id: 'external-storage',
      type: 'storage',
      label: 'erc7700.node.storage',
      data: {
        slots: [
          { key: 'selector', label: '0x2b45eb2b' },
          { key: 'dataSigner', label: 'address' },
          { key: 'dataSig', label: 'bytes' },
          { key: 'approval', label: 'bytes' },
          { key: 'encodedData', label: 'bytes' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'resolver',
      type: 'contract',
      label: 'erc7700.node.resolver',
      data: {},
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-client-contract',
      source: 'client',
      target: 'erc7700-contract',
      type: 'animated',
      label: 'erc7700.edge.submitWrite',
    },
    {
      id: 'e-contract-router',
      source: 'erc7700-contract',
      target: 'router-directive',
      type: 'labeled',
      label: 'erc7700.edge.revertRoute',
    },
    {
      id: 'e-router-client',
      source: 'router-directive',
      target: 'client',
      type: 'labeled',
      label: 'erc7700.edge.returnRoute',
    },
    {
      id: 'e-client-gateway',
      source: 'client',
      target: 'gateway',
      type: 'animated',
      label: 'erc7700.edge.postData',
    },
    {
      id: 'e-gateway-storage',
      source: 'gateway',
      target: 'external-storage',
      type: 'labeled',
      label: 'erc7700.edge.storeRecord',
    },
    {
      id: 'e-resolver-storage',
      source: 'resolver',
      target: 'external-storage',
      type: 'labeled',
      label: 'erc7700.edge.fetchData',
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
      id: 'store-record-walkthrough',
      name: 'erc7700.sim.storeRecordWalkthrough.name',
      description: 'erc7700.sim.storeRecordWalkthrough.desc',
      params: [
        {
          id: 'recordKey',
          label: 'erc7700.sim.storeRecordWalkthrough.param.recordKey',
          type: 'select',
          options: [
            { label: 'text/avatar', value: 'text/avatar' },
            { label: 'address/60', value: 'address/60' },
            { label: 'contenthash', value: 'contenthash' },
          ],
          defaultValue: 'text/avatar',
        },
        {
          id: 'recordValue',
          label: 'erc7700.sim.storeRecordWalkthrough.param.recordValue',
          type: 'select',
          options: [
            { label: 'https://namesys.xyz/logo.png', value: 'https://namesys.xyz/logo.png' },
            { label: 'namesys-eth', value: 'namesys-eth' },
          ],
          defaultValue: 'https://namesys.xyz/logo.png',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc7700.sim.storeRecordWalkthrough.step.call',
          mobileDescription: 'erc7700.sim.storeRecordWalkthrough.step.call.mobile',
          highlightNodes: ['client', 'erc7700-contract'],
          highlightEdges: ['e-client-contract'],
          durationMs: 1000,
        },
        {
          id: 'step-revert',
          description: 'erc7700.sim.storeRecordWalkthrough.step.revert',
          mobileDescription: 'erc7700.sim.storeRecordWalkthrough.step.revert.mobile',
          highlightNodes: ['erc7700-contract', 'router-directive', 'client'],
          highlightEdges: ['e-contract-router', 'e-router-client'],
          valueChanges: {
            'router-directive.StorageRoutedToDatabase': 'gatewayUrl = "https://api.namesys.xyz"',
          },
          durationMs: 1200,
        },
        {
          id: 'step-post',
          description: 'erc7700.sim.storeRecordWalkthrough.step.post',
          mobileDescription: 'erc7700.sim.storeRecordWalkthrough.step.post.mobile',
          highlightNodes: ['client', 'gateway', 'external-storage'],
          highlightEdges: ['e-client-gateway', 'e-gateway-storage'],
          valueChanges: {
            'external-storage.encodedData': 'text/avatar → "https://namesys.xyz/logo.png"',
            'external-storage.dataSigner': '0x…approved signer',
          },
          durationMs: 1300,
        },
        {
          id: 'step-read',
          description: 'erc7700.sim.storeRecordWalkthrough.step.read',
          mobileDescription: 'erc7700.sim.storeRecordWalkthrough.step.read.mobile',
          highlightNodes: ['resolver', 'external-storage'],
          highlightEdges: ['e-resolver-storage'],
          valueChanges: {
            'resolver.verified': 'approval ✓  dataSig ✓',
          },
          durationMs: 900,
        },
      ],
    },
  ],
};
