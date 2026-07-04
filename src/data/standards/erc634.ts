import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc634',
  name: 'ERC-634',
  shortDescription: 'erc634.short',
  category: 'identity',
  entryType: 'standard',
  eipNumber: 634,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-634',
  relatedSlugs: ['erc165', 'erc721', 'erc4361'],
  sortOrder: 10634,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [137, 165],
  relations: [{ slug: 'erc165', kind: 'requires' }],
  references: [
    { label: 'ERC-634 Specification', url: 'https://eips.ethereum.org/EIPS/eip-634', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc634.introduction',
  designPurpose: 'erc634.designPurpose',
  commonUsage: 'erc634.commonUsage',

  functions: [
    {
      name: 'text',
      signature: 'text(bytes32 node, string key) → string',
      type: 'read',
      params: [
        { name: 'node', type: 'bytes32', description: 'erc634.fn.text.params.node' },
        { name: 'key', type: 'string', description: 'erc634.fn.text.params.key' },
      ],
      returns: [{ name: 'text', type: 'string', description: 'erc634.fn.text.returns.text' }],
      description: 'erc634.fn.text.desc',
      defaultSimValues: { node: 'ricmoo.eth', key: 'email' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc634.node.user',
      data: { address: '0xClient' },
      layoutHint: 'source',
    },
    {
      id: 'erc634-contract',
      type: 'contract',
      label: 'erc634.node.contract',
      data: { functions: ['text'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-text',
      type: 'function',
      label: 'text()',
      data: { fnType: 'read', signature: 'text(bytes32 node, string key) → string' },
    },
    {
      id: 'storage-texts',
      type: 'storage',
      label: 'erc634.node.storageTexts',
      data: {
        slots: [{ key: '_texts', label: 'mapping(bytes32 => mapping(string => string))' }],
      },
      layoutHint: 'storage',
    },
    {
      id: 'result',
      type: 'tokenFlow',
      label: 'erc634.node.result',
      data: { symbol: 'string', amount: 'text value' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-text',
      source: 'user',
      target: 'fn-text',
      type: 'animated',
      label: 'erc634.edge.query',
    },
    {
      id: 'e-text-contract',
      source: 'fn-text',
      target: 'erc634-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc634-contract',
      target: 'storage-texts',
      type: 'labeled',
      label: 'erc634.edge.readTexts',
    },
    {
      id: 'e-contract-result',
      source: 'erc634-contract',
      target: 'result',
      type: 'labeled',
      label: 'erc634.edge.returnText',
    },
    {
      id: 'e-result-user',
      source: 'result',
      target: 'user',
      type: 'fundFlow',
      label: 'erc634.edge.response',
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
      id: 'text-record-query',
      name: 'erc634.sim.textRecordQuery.name',
      description: 'erc634.sim.textRecordQuery.desc',
      params: [
        {
          id: 'node',
          label: 'erc634.sim.textRecordQuery.param.node',
          type: 'select',
          options: [
            { label: 'ricmoo.eth', value: 'ricmoo.eth' },
            { label: 'vitalik.eth', value: 'vitalik.eth' },
          ],
          defaultValue: 'ricmoo.eth',
        },
        {
          id: 'key',
          label: 'erc634.sim.textRecordQuery.param.key',
          type: 'select',
          options: [
            { label: 'email', value: 'email' },
            { label: 'url', value: 'url' },
            { label: 'avatar', value: 'avatar' },
            { label: 'com.twitter', value: 'com.twitter' },
          ],
          defaultValue: 'email',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc634.sim.textRecordQuery.step.call',
          mobileDescription: 'erc634.sim.textRecordQuery.step.call.mobile',
          highlightNodes: ['user', 'fn-text'],
          highlightEdges: ['e-user-text'],
          valueChanges: { 'fn-text.input': 'node = namehash("ricmoo.eth"), key = "email"' },
          durationMs: 1000,
        },
        {
          id: 'step-lookup',
          description: 'erc634.sim.textRecordQuery.step.lookup',
          mobileDescription: 'erc634.sim.textRecordQuery.step.lookup.mobile',
          highlightNodes: ['fn-text', 'erc634-contract', 'storage-texts'],
          highlightEdges: ['e-text-contract', 'e-contract-storage'],
          valueChanges: { 'storage-texts._texts[node]["email"]': '"ricmoo@example.com"' },
          durationMs: 1200,
        },
        {
          id: 'step-return',
          description: 'erc634.sim.textRecordQuery.step.return',
          mobileDescription: 'erc634.sim.textRecordQuery.step.return.mobile',
          highlightNodes: ['erc634-contract', 'result', 'user'],
          highlightEdges: ['e-contract-result', 'e-result-user'],
          valueChanges: { 'result.value': '"ricmoo@example.com"' },
          durationMs: 800,
        },
      ],
    },
  ],
};
