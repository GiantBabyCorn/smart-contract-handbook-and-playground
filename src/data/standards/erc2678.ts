import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2678',
  name: 'ERC-2678',
  shortDescription: 'erc2678.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 2678,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2678',
  relatedSlugs: ['erc20', 'erc55', 'erc681'],
  sortOrder: 12678,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-2678 Specification', url: 'https://eips.ethereum.org/EIPS/eip-2678', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc2678.introduction',
  designPurpose: 'erc2678.designPurpose',
  commonUsage: 'erc2678.commonUsage',

  // ERC-2678 specifies a JSON package-manifest data format (EthPM v3), not a Solidity
  // interface, so there are no callable functions to document.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'author',
      type: 'user',
      label: 'erc2678.node.author',
      data: { address: '0xAuthor' },
      layoutHint: 'source',
    },
    {
      id: 'package-manager',
      type: 'contract',
      label: 'erc2678.node.packageManager',
      data: {},
      layoutHint: 'center',
    },
    {
      id: 'manifest',
      type: 'storage',
      label: 'erc2678.node.manifest',
      data: {
        slots: [
          { key: 'manifest', label: 'ethpm/3' },
          { key: 'name', label: 'string' },
          { key: 'version', label: 'semver' },
          { key: 'sources', label: 'source tree' },
          { key: 'contractTypes', label: 'ABI + bytecode' },
          { key: 'compilers', label: 'name + version' },
          { key: 'deployments', label: 'BIP122 URI → instance' },
          { key: 'buildDependencies', label: 'name → CID' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'ipfs',
      type: 'contract',
      label: 'erc2678.node.ipfs',
      data: {},
    },
    {
      id: 'registry',
      type: 'contract',
      label: 'erc2678.node.registry',
      data: {},
    },
    {
      id: 'consumer',
      type: 'user',
      label: 'erc2678.node.consumer',
      data: { address: '0xConsumer' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-author-manager',
      source: 'author',
      target: 'package-manager',
      type: 'animated',
      label: 'erc2678.edge.assemble',
    },
    {
      id: 'e-manager-manifest',
      source: 'package-manager',
      target: 'manifest',
      type: 'labeled',
      label: 'erc2678.edge.serialize',
    },
    {
      id: 'e-manifest-ipfs',
      source: 'manifest',
      target: 'ipfs',
      type: 'animated',
      label: 'erc2678.edge.publish',
    },
    {
      id: 'e-ipfs-registry',
      source: 'ipfs',
      target: 'registry',
      type: 'labeled',
      label: 'erc2678.edge.register',
    },
    {
      id: 'e-registry-consumer',
      source: 'registry',
      target: 'consumer',
      type: 'animated',
      label: 'erc2678.edge.resolve',
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
      id: 'publish-package-walkthrough',
      name: 'erc2678.sim.publishPackageWalkthrough.name',
      description: 'erc2678.sim.publishPackageWalkthrough.desc',
      params: [
        {
          id: 'packageName',
          label: 'erc2678.sim.publishPackageWalkthrough.param.packageName',
          type: 'select',
          options: [
            { label: 'wallet', value: 'wallet' },
            { label: 'safe-math-lib', value: 'safe-math-lib' },
            { label: 'standard-token', value: 'standard-token' },
          ],
          defaultValue: 'wallet',
        },
        {
          id: 'version',
          label: 'erc2678.sim.publishPackageWalkthrough.param.version',
          type: 'select',
          options: [
            { label: '1.0.0', value: '1.0.0' },
            { label: '2.1.0', value: '2.1.0' },
          ],
          defaultValue: '1.0.0',
        },
      ],
      steps: [
        {
          id: 'step-assemble',
          description: 'erc2678.sim.publishPackageWalkthrough.step.assemble',
          mobileDescription: 'erc2678.sim.publishPackageWalkthrough.step.assemble.mobile',
          highlightNodes: ['author', 'package-manager'],
          highlightEdges: ['e-author-manager'],
          durationMs: 1000,
        },
        {
          id: 'step-serialize',
          description: 'erc2678.sim.publishPackageWalkthrough.step.serialize',
          mobileDescription: 'erc2678.sim.publishPackageWalkthrough.step.serialize.mobile',
          highlightNodes: ['package-manager', 'manifest'],
          highlightEdges: ['e-manager-manifest'],
          valueChanges: {
            'manifest.manifest': 'ethpm/3',
            'manifest.name': 'wallet',
            'manifest.version': '1.0.0',
          },
          durationMs: 1200,
        },
        {
          id: 'step-publish',
          description: 'erc2678.sim.publishPackageWalkthrough.step.publish',
          mobileDescription: 'erc2678.sim.publishPackageWalkthrough.step.publish.mobile',
          highlightNodes: ['manifest', 'ipfs', 'registry'],
          highlightEdges: ['e-manifest-ipfs', 'e-ipfs-registry'],
          valueChanges: {
            'ipfs.uri': 'ipfs://Qm…',
            'registry.release': 'wallet@1.0.0',
          },
          durationMs: 1100,
        },
        {
          id: 'step-consume',
          description: 'erc2678.sim.publishPackageWalkthrough.step.consume',
          mobileDescription: 'erc2678.sim.publishPackageWalkthrough.step.consume.mobile',
          highlightNodes: ['registry', 'consumer'],
          highlightEdges: ['e-registry-consumer'],
          durationMs: 900,
        },
      ],
    },
  ],
};
