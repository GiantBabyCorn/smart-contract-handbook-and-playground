import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7201',
  name: 'ERC-7201',
  shortDescription: 'erc7201.short',
  category: 'proxy',
  entryType: 'standard',
  eipNumber: 7201,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7201',
  relatedSlugs: ['erc1967', 'erc2535', 'erc1822'],
  sortOrder: 17201,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  relations: [
    { slug: 'erc2535', kind: 'usedWith' },
    { slug: 'erc1967', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-7201 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7201', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7201.introduction',
  designPurpose: 'erc7201.designPurpose',
  commonUsage: 'erc7201.commonUsage',

  // ERC-7201 specifies a NatSpec annotation and a storage-location formula, not a
  // Solidity interface, so there are no callable functions to document.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'developer',
      type: 'user',
      label: 'erc7201.node.developer',
      data: { address: '0xDev' },
      layoutHint: 'source',
    },
    {
      id: 'namespace-struct',
      type: 'contract',
      label: 'erc7201.node.struct',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'fn-erc7201',
      type: 'function',
      label: 'erc7201(id)',
      data: { fnType: 'read', signature: 'erc7201(string id) → bytes32' },
    },
    {
      id: 'storage-namespace',
      type: 'storage',
      label: 'erc7201.node.storageNamespace',
      data: {
        slots: [
          { key: 'NAMESPACE_LOCATION', label: 'erc7201(id) = keccak256(keccak256(id) - 1) & ~0xff' },
          { key: 'namespace fields', label: 'struct vars at root + n' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'storage-default',
      type: 'storage',
      label: 'erc7201.node.storageDefault',
      data: {
        slots: [{ key: 'slot 0', label: 'sequential Solidity/Vyper layout (root = 0)' }],
      },
      layoutHint: 'storage',
    },
    {
      id: 'tooling',
      type: 'contract',
      label: 'erc7201.node.tooling',
      data: {},
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-developer-struct',
      source: 'developer',
      target: 'namespace-struct',
      type: 'animated',
      label: 'erc7201.edge.declareNamespace',
    },
    {
      id: 'e-struct-formula',
      source: 'namespace-struct',
      target: 'fn-erc7201',
      type: 'animated',
      label: 'erc7201.edge.deriveRoot',
    },
    {
      id: 'e-formula-namespace',
      source: 'fn-erc7201',
      target: 'storage-namespace',
      type: 'labeled',
      label: 'erc7201.edge.rootAt',
    },
    {
      id: 'e-namespace-default',
      source: 'storage-namespace',
      target: 'storage-default',
      type: 'labeled',
      label: 'erc7201.edge.disjointFrom',
    },
    {
      id: 'e-struct-tooling',
      source: 'namespace-struct',
      target: 'tooling',
      type: 'labeled',
      label: 'erc7201.edge.exposeLayout',
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
      id: 'derive-namespace-walkthrough',
      name: 'erc7201.sim.deriveNamespaceWalkthrough.name',
      description: 'erc7201.sim.deriveNamespaceWalkthrough.desc',
      params: [
        {
          id: 'namespaceId',
          label: 'erc7201.sim.deriveNamespaceWalkthrough.param.namespaceId',
          type: 'select',
          options: [
            { label: 'example.main', value: 'example.main' },
            { label: 'foobar', value: 'foobar' },
          ],
          defaultValue: 'example.main',
        },
      ],
      steps: [
        {
          id: 'step-declare',
          description: 'erc7201.sim.deriveNamespaceWalkthrough.step.declare',
          mobileDescription: 'erc7201.sim.deriveNamespaceWalkthrough.step.declare.mobile',
          highlightNodes: ['developer', 'namespace-struct'],
          highlightEdges: ['e-developer-struct'],
          valueChanges: { 'namespace-struct.annotation': '@custom:storage-location erc7201:example.main' },
          durationMs: 1000,
        },
        {
          id: 'step-derive',
          description: 'erc7201.sim.deriveNamespaceWalkthrough.step.derive',
          mobileDescription: 'erc7201.sim.deriveNamespaceWalkthrough.step.derive.mobile',
          highlightNodes: ['namespace-struct', 'fn-erc7201'],
          highlightEdges: ['e-struct-formula'],
          valueChanges: { 'fn-erc7201.result': 'keccak256(keccak256("example.main") - 1) & ~0xff' },
          durationMs: 1200,
        },
        {
          id: 'step-root',
          description: 'erc7201.sim.deriveNamespaceWalkthrough.step.root',
          mobileDescription: 'erc7201.sim.deriveNamespaceWalkthrough.step.root.mobile',
          highlightNodes: ['fn-erc7201', 'storage-namespace'],
          highlightEdges: ['e-formula-namespace'],
          valueChanges: {
            'storage-namespace.NAMESPACE_LOCATION':
              '0x183a6125c38840424c4a85fa12bab2ab606c4b6d0e7cc73c0c06ba5300eab500',
          },
          durationMs: 1100,
        },
        {
          id: 'step-isolate',
          description: 'erc7201.sim.deriveNamespaceWalkthrough.step.isolate',
          mobileDescription: 'erc7201.sim.deriveNamespaceWalkthrough.step.isolate.mobile',
          highlightNodes: ['storage-namespace', 'storage-default', 'tooling'],
          highlightEdges: ['e-namespace-default', 'e-struct-tooling'],
          durationMs: 900,
        },
      ],
    },
  ],
};
