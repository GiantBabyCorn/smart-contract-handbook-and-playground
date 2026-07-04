import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc8119',
  name: 'ERC-8119',
  shortDescription: 'erc8119.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 8119,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-8119',
  relatedSlugs: ['erc7201', 'erc1046', 'erc721'],
  sortOrder: 18119,
  eipStatus: 'Draft',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-8119 Specification', url: 'https://eips.ethereum.org/EIPS/eip-8119', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc8119.introduction',
  designPurpose: 'erc8119.designPurpose',
  commonUsage: 'erc8119.commonUsage',

  // ERC-8119 specifies string key encoding formats for key-value storage, not a
  // Solidity interface, so there are no callable functions to document.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'app',
      type: 'user',
      label: 'erc8119.node.app',
      data: { address: '0xApp' },
      layoutHint: 'source',
    },
    {
      id: 'fn-slashForm',
      type: 'function',
      label: 'label/param',
      data: {
        fnType: 'read',
        signature: '<key-label>/<key-parameter>  or  <key-label>:<key-parameter>',
      },
    },
    {
      id: 'fn-bracketForm',
      type: 'function',
      label: 'label[p1][p2]',
      data: {
        fnType: 'read',
        signature: '<key-label>[<key-parameter-1>][<key-parameter-2>]...',
      },
    },
    {
      id: 'formatter',
      type: 'contract',
      label: 'erc8119.node.formatter',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'storage-metadata',
      type: 'storage',
      label: 'erc8119.node.storageMetadata',
      data: { slots: [{ key: '_metadata', label: 'mapping(string => bytes)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'parser',
      type: 'contract',
      label: 'erc8119.node.parser',
      data: {},
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-app-slashForm',
      source: 'app',
      target: 'fn-slashForm',
      type: 'animated',
      label: 'erc8119.edge.buildSlash',
    },
    {
      id: 'e-app-bracketForm',
      source: 'app',
      target: 'fn-bracketForm',
      type: 'animated',
      label: 'erc8119.edge.buildBracket',
    },
    { id: 'e-slashForm-formatter', source: 'fn-slashForm', target: 'formatter', type: 'animated' },
    { id: 'e-bracketForm-formatter', source: 'fn-bracketForm', target: 'formatter', type: 'animated' },
    {
      id: 'e-formatter-storage',
      source: 'formatter',
      target: 'storage-metadata',
      type: 'labeled',
      label: 'erc8119.edge.writeKey',
    },
    {
      id: 'e-storage-parser',
      source: 'storage-metadata',
      target: 'parser',
      type: 'labeled',
      label: 'erc8119.edge.parseKey',
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
      id: 'build-key-walkthrough',
      name: 'erc8119.sim.buildKeyWalkthrough.name',
      description: 'erc8119.sim.buildKeyWalkthrough.desc',
      params: [
        {
          id: 'keyLabel',
          label: 'erc8119.sim.buildKeyWalkthrough.param.keyLabel',
          type: 'select',
          options: [
            { label: 'registration', value: 'registration' },
            { label: 'user', value: 'user' },
          ],
          defaultValue: 'registration',
        },
        {
          id: 'keyParameter',
          label: 'erc8119.sim.buildKeyWalkthrough.param.keyParameter',
          type: 'select',
          options: [
            { label: '1', value: '1' },
            { label: 'alice', value: 'alice' },
          ],
          defaultValue: '1',
        },
      ],
      steps: [
        {
          id: 'step-build',
          description: 'erc8119.sim.buildKeyWalkthrough.step.build',
          mobileDescription: 'erc8119.sim.buildKeyWalkthrough.step.build.mobile',
          highlightNodes: ['app', 'fn-slashForm'],
          highlightEdges: ['e-app-slashForm'],
          valueChanges: { 'fn-slashForm.key': '"registration" + "/" + "1" = "registration/1"' },
          durationMs: 1000,
        },
        {
          id: 'step-format',
          description: 'erc8119.sim.buildKeyWalkthrough.step.format',
          mobileDescription: 'erc8119.sim.buildKeyWalkthrough.step.format.mobile',
          highlightNodes: ['fn-slashForm', 'formatter'],
          highlightEdges: ['e-slashForm-formatter'],
          durationMs: 1000,
        },
        {
          id: 'step-store',
          description: 'erc8119.sim.buildKeyWalkthrough.step.store',
          mobileDescription: 'erc8119.sim.buildKeyWalkthrough.step.store.mobile',
          highlightNodes: ['formatter', 'storage-metadata'],
          highlightEdges: ['e-formatter-storage'],
          valueChanges: { 'storage-metadata._metadata["registration/1"]': '0x → 0x6578616d706c6531' },
          durationMs: 1200,
        },
        {
          id: 'step-parse',
          description: 'erc8119.sim.buildKeyWalkthrough.step.parse',
          mobileDescription: 'erc8119.sim.buildKeyWalkthrough.step.parse.mobile',
          highlightNodes: ['storage-metadata', 'parser'],
          highlightEdges: ['e-storage-parser'],
          valueChanges: { 'parser.result': 'label="registration", parameter="1"' },
          durationMs: 900,
        },
      ],
    },
  ],
};
