import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1062',
  name: 'ERC-1062',
  shortDescription: 'erc1062.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 1062,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1062',
  relatedSlugs: ['erc1046', 'erc5219', 'erc4361', 'erc55'],
  sortOrder: 11062,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-1062 Specification', url: 'https://eips.ethereum.org/EIPS/eip-1062', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc1062.introduction',
  designPurpose: 'erc1062.designPurpose',
  commonUsage: 'erc1062.commonUsage',

  // ERC-1062's "## Specification" section defines only an off-chain Base58<->hex encoding
  // convention over two pre-existing ENS public resolver methods (setMultihash / multihash,
  // which appear in the Rationale, not the Specification). It introduces no new Solidity
  // interface, so functions is empty.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'publisher',
      type: 'user',
      label: 'erc1062.node.publisher',
      data: { address: '0xOwner' },
      layoutHint: 'source',
    },
    {
      id: 'encoder',
      type: 'contract',
      label: 'erc1062.node.encoder',
      data: { functions: [] },
    },
    {
      id: 'resolver',
      type: 'contract',
      label: 'erc1062.node.resolver',
      data: { functions: ['setMultihash', 'multihash'] },
      layoutHint: 'center',
    },
    {
      id: 'storage-multihash',
      type: 'storage',
      label: 'erc1062.node.storageMultihash',
      data: { slots: [{ key: 'multihashes', label: 'mapping(bytes32 => bytes)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'decoder',
      type: 'contract',
      label: 'erc1062.node.decoder',
      data: { functions: [] },
    },
    {
      id: 'browser',
      type: 'user',
      label: 'erc1062.node.browser',
      data: { address: '0xClient' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-publisher-encoder',
      source: 'publisher',
      target: 'encoder',
      type: 'animated',
      label: 'erc1062.edge.provideHash',
    },
    {
      id: 'e-encoder-resolver',
      source: 'encoder',
      target: 'resolver',
      type: 'animated',
      label: 'erc1062.edge.callSetMultihash',
    },
    {
      id: 'e-resolver-storage',
      source: 'resolver',
      target: 'storage-multihash',
      type: 'labeled',
      label: 'erc1062.edge.storeMultihash',
    },
    {
      id: 'e-storage-decoder',
      source: 'storage-multihash',
      target: 'decoder',
      type: 'labeled',
      label: 'erc1062.edge.readMultihash',
    },
    {
      id: 'e-decoder-browser',
      source: 'decoder',
      target: 'browser',
      type: 'animated',
      label: 'erc1062.edge.returnAddress',
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
      id: 'ipfs-resolution-walkthrough',
      name: 'erc1062.sim.ipfsResolutionWalkthrough.name',
      description: 'erc1062.sim.ipfsResolutionWalkthrough.desc',
      params: [
        {
          id: 'name',
          label: 'erc1062.sim.ipfsResolutionWalkthrough.param.name',
          type: 'select',
          options: [
            { label: 'portal.eth', value: 'portal.eth' },
            { label: 'mysite.eth', value: 'mysite.eth' },
          ],
          defaultValue: 'portal.eth',
        },
        {
          id: 'ipfsHash',
          label: 'erc1062.sim.ipfsResolutionWalkthrough.param.ipfsHash',
          type: 'select',
          options: [
            { label: 'QmYwAPJz…', value: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG' },
            { label: 'QmT78zSuB…', value: 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o' },
          ],
          defaultValue: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        },
      ],
      steps: [
        {
          id: 'step-publish',
          description: 'erc1062.sim.ipfsResolutionWalkthrough.step.publish',
          mobileDescription: 'erc1062.sim.ipfsResolutionWalkthrough.step.publish.mobile',
          highlightNodes: ['publisher', 'encoder'],
          highlightEdges: ['e-publisher-encoder'],
          durationMs: 1000,
        },
        {
          id: 'step-store',
          description: 'erc1062.sim.ipfsResolutionWalkthrough.step.store',
          mobileDescription: 'erc1062.sim.ipfsResolutionWalkthrough.step.store.mobile',
          highlightNodes: ['encoder', 'resolver', 'storage-multihash'],
          highlightEdges: ['e-encoder-resolver', 'e-resolver-storage'],
          valueChanges: { 'storage-multihash.multihashes': 'empty → 0x + hex-encoded multihash' },
          durationMs: 1200,
        },
        {
          id: 'step-read',
          description: 'erc1062.sim.ipfsResolutionWalkthrough.step.read',
          mobileDescription: 'erc1062.sim.ipfsResolutionWalkthrough.step.read.mobile',
          highlightNodes: ['storage-multihash', 'decoder'],
          highlightEdges: ['e-storage-decoder'],
          valueChanges: { 'decoder.output': '0x1220… → QmYwAPJz…' },
          durationMs: 1000,
        },
        {
          id: 'step-render',
          description: 'erc1062.sim.ipfsResolutionWalkthrough.step.render',
          mobileDescription: 'erc1062.sim.ipfsResolutionWalkthrough.step.render.mobile',
          highlightNodes: ['decoder', 'browser'],
          highlightEdges: ['e-decoder-browser'],
          durationMs: 800,
        },
      ],
    },
  ],
};
