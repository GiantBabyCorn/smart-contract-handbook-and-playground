import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7562',
  name: 'ERC-7562',
  shortDescription: 'erc7562.short',
  category: 'account',
  entryType: 'standard',
  eipNumber: 7562,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7562',
  relatedSlugs: ['erc4337', 'erc7702', 'erc7579', 'erc6900'],
  sortOrder: 17562,
  eipStatus: 'Draft',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  relations: [
    { slug: 'erc4337', kind: 'usedWith' },
    { slug: 'erc7702', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-7562 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7562', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7562.introduction',
  designPurpose: 'erc7562.designPurpose',
  commonUsage: 'erc7562.commonUsage',

  // ERC-7562 specifies off-chain opcode, storage, and reputation rules for bundlers,
  // not a Solidity interface, so there are no callable functions to document.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'sender',
      type: 'user',
      label: 'erc7562.node.sender',
      data: { address: '0xSender' },
      layoutHint: 'source',
    },
    {
      id: 'erc7562-contract',
      type: 'contract',
      label: 'erc7562.node.contract',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'storage-associated',
      type: 'storage',
      label: 'erc7562.node.storageAssociated',
      data: {
        slots: [
          { key: 'account storage', label: 'STO-010: always allowed' },
          { key: 'associated slots', label: 'keccak(A||x)+n, n in 0..128' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'storage-reputation',
      type: 'storage',
      label: 'erc7562.node.storageReputation',
      data: {
        slots: [
          { key: 'opsSeen', label: 'per-entity UserOperations seen' },
          { key: 'opsIncluded', label: 'per-entity UserOperations included' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'mempool',
      type: 'contract',
      label: 'erc7562.node.mempool',
      data: {},
      layoutHint: 'sink',
    },
    {
      id: 'peer',
      type: 'user',
      label: 'erc7562.node.peer',
      data: { address: '0xPeer' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-sender-validation',
      source: 'sender',
      target: 'erc7562-contract',
      type: 'animated',
      label: 'erc7562.edge.submitOp',
    },
    {
      id: 'e-validation-associated',
      source: 'erc7562-contract',
      target: 'storage-associated',
      type: 'labeled',
      label: 'erc7562.edge.checkStorage',
    },
    {
      id: 'e-validation-reputation',
      source: 'erc7562-contract',
      target: 'storage-reputation',
      type: 'labeled',
      label: 'erc7562.edge.updateReputation',
    },
    {
      id: 'e-validation-mempool',
      source: 'erc7562-contract',
      target: 'mempool',
      type: 'labeled',
      label: 'erc7562.edge.acceptOp',
    },
    {
      id: 'e-mempool-peer',
      source: 'mempool',
      target: 'peer',
      type: 'labeled',
      label: 'erc7562.edge.propagate',
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
      id: 'validate-op-walkthrough',
      name: 'erc7562.sim.validateOpWalkthrough.name',
      description: 'erc7562.sim.validateOpWalkthrough.desc',
      params: [
        {
          id: 'entity',
          label: 'erc7562.sim.validateOpWalkthrough.param.entity',
          type: 'select',
          options: [
            { label: 'account', value: 'account' },
            { label: 'paymaster', value: 'paymaster' },
            { label: 'factory', value: 'factory' },
          ],
          defaultValue: 'paymaster',
        },
        {
          id: 'staked',
          label: 'erc7562.sim.validateOpWalkthrough.param.staked',
          type: 'bool',
          defaultValue: 'true',
        },
      ],
      steps: [
        {
          id: 'step-submit',
          description: 'erc7562.sim.validateOpWalkthrough.step.submit',
          mobileDescription: 'erc7562.sim.validateOpWalkthrough.step.submit.mobile',
          highlightNodes: ['sender', 'erc7562-contract'],
          highlightEdges: ['e-sender-validation'],
          durationMs: 1000,
        },
        {
          id: 'step-trace',
          description: 'erc7562.sim.validateOpWalkthrough.step.trace',
          mobileDescription: 'erc7562.sim.validateOpWalkthrough.step.trace.mobile',
          highlightNodes: ['erc7562-contract', 'storage-associated'],
          highlightEdges: ['e-validation-associated'],
          durationMs: 1200,
        },
        {
          id: 'step-reputation',
          description: 'erc7562.sim.validateOpWalkthrough.step.reputation',
          mobileDescription: 'erc7562.sim.validateOpWalkthrough.step.reputation.mobile',
          highlightNodes: ['erc7562-contract', 'storage-reputation'],
          highlightEdges: ['e-validation-reputation'],
          valueChanges: { 'storage-reputation.opsSeen': '41 → 42' },
          durationMs: 1100,
        },
        {
          id: 'step-accept',
          description: 'erc7562.sim.validateOpWalkthrough.step.accept',
          mobileDescription: 'erc7562.sim.validateOpWalkthrough.step.accept.mobile',
          highlightNodes: ['erc7562-contract', 'mempool', 'peer'],
          highlightEdges: ['e-validation-mempool', 'e-mempool-peer'],
          durationMs: 900,
        },
      ],
    },
  ],
};
