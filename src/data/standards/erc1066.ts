import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1066',
  name: 'ERC-1066',
  shortDescription: 'erc1066.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 1066,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1066',
  relatedSlugs: ['erc20', 'erc165', 'erc1271', 'erc3643'],
  sortOrder: 11066,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-1066 Specification', url: 'https://eips.ethereum.org/EIPS/eip-1066', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc1066.introduction',
  designPurpose: 'erc1066.designPurpose',
  commonUsage: 'erc1066.commonUsage',

  // ERC-1066 specifies a byte-encoding convention and a code table, not a Solidity
  // interface — the functions shown in the spec are illustrative, so there is none to list.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc1066.node.caller',
      data: { address: '0xCaller' },
      layoutHint: 'source',
    },
    {
      id: 'erc1066-contract',
      type: 'contract',
      label: 'erc1066.node.contract',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'storage-codetable',
      type: 'storage',
      label: 'erc1066.node.storageCodeTable',
      data: {
        slots: [
          { key: 'high nibble', label: 'category (0x0*–0xF*)' },
          { key: 'low nibble', label: 'reason (0x*0–0x*F)' },
          { key: '0x01', label: 'Success' },
          { key: '0x51', label: 'Transfer Successful' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'storage-return',
      type: 'storage',
      label: 'erc1066.node.storageReturn',
      data: {
        slots: [
          { key: 'status', label: 'byte (first return value)' },
          { key: 'value', label: 'optional payload (later returns)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'consumer',
      type: 'user',
      label: 'erc1066.node.consumer',
      data: { address: '0xConsumer' },
      layoutHint: 'sink',
    },
    {
      id: 'translator',
      type: 'contract',
      label: 'erc1066.node.translator',
      data: {},
    },
  ],

  flowEdges: [
    {
      id: 'e-user-contract',
      source: 'user',
      target: 'erc1066-contract',
      type: 'animated',
      label: 'erc1066.edge.callFunction',
    },
    {
      id: 'e-contract-codetable',
      source: 'erc1066-contract',
      target: 'storage-codetable',
      type: 'labeled',
      label: 'erc1066.edge.selectCode',
    },
    {
      id: 'e-codetable-return',
      source: 'storage-codetable',
      target: 'storage-return',
      type: 'labeled',
      label: 'erc1066.edge.encodeByte',
    },
    {
      id: 'e-return-consumer',
      source: 'storage-return',
      target: 'consumer',
      type: 'animated',
      label: 'erc1066.edge.reactToCode',
    },
    {
      id: 'e-return-translator',
      source: 'storage-return',
      target: 'translator',
      type: 'labeled',
      label: 'erc1066.edge.translateCode',
    },
    {
      id: 'e-translator-consumer',
      source: 'translator',
      target: 'consumer',
      type: 'animated',
      label: 'erc1066.edge.showMessage',
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
      id: 'status-code-walkthrough',
      name: 'erc1066.sim.statusCodeWalkthrough.name',
      description: 'erc1066.sim.statusCodeWalkthrough.desc',
      params: [
        {
          id: 'outcome',
          label: 'erc1066.sim.statusCodeWalkthrough.param.outcome',
          type: 'select',
          options: [
            { label: 'Success (0x01)', value: '0x01' },
            { label: 'Transfer Successful (0x51)', value: '0x51' },
            { label: 'Insufficient Funds (0x54)', value: '0x54' },
          ],
          defaultValue: '0x51',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc1066.sim.statusCodeWalkthrough.step.call',
          mobileDescription: 'erc1066.sim.statusCodeWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'erc1066-contract'],
          highlightEdges: ['e-user-contract'],
          durationMs: 1000,
        },
        {
          id: 'step-encode',
          description: 'erc1066.sim.statusCodeWalkthrough.step.encode',
          mobileDescription: 'erc1066.sim.statusCodeWalkthrough.step.encode.mobile',
          highlightNodes: ['erc1066-contract', 'storage-codetable', 'storage-return'],
          highlightEdges: ['e-contract-codetable', 'e-codetable-return'],
          valueChanges: { 'storage-return.status': 'category 0x5 + reason 0x1 → 0x51 (Transfer Successful)' },
          durationMs: 1200,
        },
        {
          id: 'step-return',
          description: 'erc1066.sim.statusCodeWalkthrough.step.return',
          mobileDescription: 'erc1066.sim.statusCodeWalkthrough.step.return.mobile',
          highlightNodes: ['storage-return', 'consumer'],
          highlightEdges: ['e-return-consumer'],
          valueChanges: { 'consumer.reaction': '0x51 is odd → non-blocking, caller continues' },
          durationMs: 1000,
        },
        {
          id: 'step-translate',
          description: 'erc1066.sim.statusCodeWalkthrough.step.translate',
          mobileDescription: 'erc1066.sim.statusCodeWalkthrough.step.translate.mobile',
          highlightNodes: ['storage-return', 'translator', 'consumer'],
          highlightEdges: ['e-return-translator', 'e-translator-consumer'],
          valueChanges: { 'translator.message': '0x51 → "Transfer Successful"' },
          durationMs: 900,
        },
      ],
    },
  ],
};
