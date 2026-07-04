import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1577',
  name: 'ERC-1577',
  shortDescription: 'erc1577.short',
  category: 'identity',
  entryType: 'standard',
  eipNumber: 1577,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1577',
  relatedSlugs: ['erc165', 'erc4361', 'erc1046'],
  sortOrder: 11577,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  relations: [{ slug: 'erc165', kind: 'usedWith' }],
  references: [
    { label: 'ERC-1577 Specification', url: 'https://eips.ethereum.org/EIPS/eip-1577', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc1577.introduction',
  designPurpose: 'erc1577.designPurpose',
  commonUsage: 'erc1577.commonUsage',

  // ERC-1577 specifies a multicodec encoding for the contenthash field, not a Solidity interface — no functions.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc1577.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'encoder',
      type: 'contract',
      label: 'erc1577.node.encoder',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'storage-contenthash',
      type: 'storage',
      label: 'erc1577.node.storageContenthash',
      data: { slots: [{ key: 'contenthash', label: '<protoCode uvarint><value []byte>' }] },
      layoutHint: 'storage',
    },
    {
      id: 'resolver',
      type: 'contract',
      label: 'erc1577.node.resolver',
      data: { functions: [] },
    },
    {
      id: 'decoder',
      type: 'contract',
      label: 'erc1577.node.decoder',
      data: { functions: [] },
    },
    {
      id: 'network',
      type: 'user',
      label: 'erc1577.node.network',
      data: {},
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-encoder',
      source: 'user',
      target: 'encoder',
      type: 'animated',
      label: 'erc1577.edge.submitAddress',
    },
    {
      id: 'e-encoder-storage',
      source: 'encoder',
      target: 'storage-contenthash',
      type: 'labeled',
      label: 'erc1577.edge.encodeContenthash',
    },
    {
      id: 'e-storage-resolver',
      source: 'storage-contenthash',
      target: 'resolver',
      type: 'labeled',
      label: 'erc1577.edge.readContenthash',
    },
    {
      id: 'e-resolver-decoder',
      source: 'resolver',
      target: 'decoder',
      type: 'animated',
      label: 'erc1577.edge.returnContenthash',
    },
    {
      id: 'e-decoder-network',
      source: 'decoder',
      target: 'network',
      type: 'animated',
      label: 'erc1577.edge.fetchContent',
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
      id: 'resolve-walkthrough',
      name: 'erc1577.sim.resolveWalkthrough.name',
      description: 'erc1577.sim.resolveWalkthrough.desc',
      params: [
        {
          id: 'protocol',
          label: 'erc1577.sim.resolveWalkthrough.param.protocol',
          type: 'select',
          options: [
            { label: 'IPFS (0xe3)', value: '0xe3' },
            { label: 'Swarm (0xe4)', value: '0xe4' },
          ],
          defaultValue: '0xe3',
        },
      ],
      steps: [
        {
          id: 'step-submit',
          description: 'erc1577.sim.resolveWalkthrough.step.submit',
          mobileDescription: 'erc1577.sim.resolveWalkthrough.step.submit.mobile',
          highlightNodes: ['user', 'encoder'],
          highlightEdges: ['e-user-encoder'],
          durationMs: 1000,
        },
        {
          id: 'step-encode',
          description: 'erc1577.sim.resolveWalkthrough.step.encode',
          mobileDescription: 'erc1577.sim.resolveWalkthrough.step.encode.mobile',
          highlightNodes: ['encoder', 'storage-contenthash'],
          highlightEdges: ['e-encoder-storage'],
          valueChanges: {
            'storage-contenthash.contenthash':
              'empty → 0xe3010170122029f2d17be6139079dc48696d1f582a8530eb9805b561eda517e22a892c7e3f1f',
          },
          durationMs: 1200,
        },
        {
          id: 'step-resolve',
          description: 'erc1577.sim.resolveWalkthrough.step.resolve',
          mobileDescription: 'erc1577.sim.resolveWalkthrough.step.resolve.mobile',
          highlightNodes: ['storage-contenthash', 'resolver', 'decoder'],
          highlightEdges: ['e-storage-resolver', 'e-resolver-decoder'],
          durationMs: 1000,
        },
        {
          id: 'step-decode',
          description: 'erc1577.sim.resolveWalkthrough.step.decode',
          mobileDescription: 'erc1577.sim.resolveWalkthrough.step.decode.mobile',
          highlightNodes: ['decoder', 'network'],
          highlightEdges: ['e-decoder-network'],
          valueChanges: { 'decoder.protoCode': '0xe3 → IPFS' },
          durationMs: 1000,
        },
      ],
    },
  ],
};
