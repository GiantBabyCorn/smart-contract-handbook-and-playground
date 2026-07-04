import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5568',
  name: 'ERC-5568',
  shortDescription: 'erc5568.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 5568,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5568',
  relatedSlugs: ['erc4337', 'erc1271', 'erc7702'],
  sortOrder: 15568,
  eipStatus: 'Review',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [140],
  references: [
    { label: 'ERC-5568 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5568', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5568.introduction',
  designPurpose: 'erc5568.designPurpose',
  commonUsage: 'erc5568.commonUsage',

  functions: [
    {
      name: 'walletSignal24',
      signature:
        'walletSignal24(bytes32 selector, bytes function_data) → (uint24 instruction_id, bytes instruction_data)',
      type: 'read',
      params: [
        { name: 'selector', type: 'bytes32', description: 'erc5568.fn.walletSignal24.params.selector' },
        {
          name: 'function_data',
          type: 'bytes',
          description: 'erc5568.fn.walletSignal24.params.function_data',
        },
      ],
      returns: [
        {
          name: 'instruction_id',
          type: 'uint24',
          description: 'erc5568.fn.walletSignal24.returns.instruction_id',
        },
        {
          name: 'instruction_data',
          type: 'bytes',
          description: 'erc5568.fn.walletSignal24.returns.instruction_data',
        },
      ],
      description: 'erc5568.fn.walletSignal24.desc',
      defaultSimValues: { selector: '0x095ea7b3', function_data: '0x' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5568.node.user',
      data: { address: '0xWallet' },
      layoutHint: 'source',
    },
    {
      id: 'erc5568-contract',
      type: 'contract',
      label: 'erc5568.node.contract',
      data: { functions: ['walletSignal24'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-walletSignal24',
      type: 'function',
      label: 'walletSignal24()',
      data: {
        fnType: 'read',
        signature:
          'walletSignal24(bytes32 selector, bytes function_data) → (uint24 instruction_id, bytes instruction_data)',
      },
    },
    {
      id: 'event-walletSignal24',
      type: 'function',
      label: 'WalletSignal24 error',
      data: { fnType: 'event', signature: 'WalletSignal24(uint24 instruction_id, bytes instruction_data)' },
    },
    {
      id: 'handler',
      type: 'user',
      label: 'erc5568.node.handler',
      data: { address: '0xUser' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-walletSignal24',
      source: 'user',
      target: 'fn-walletSignal24',
      type: 'animated',
      label: 'erc5568.edge.callWalletSignal24',
    },
    {
      id: 'e-walletSignal24-contract',
      source: 'fn-walletSignal24',
      target: 'erc5568-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-signal',
      source: 'erc5568-contract',
      target: 'event-walletSignal24',
      type: 'labeled',
      label: 'erc5568.edge.emitWalletSignal24',
    },
    {
      id: 'e-signal-handler',
      source: 'event-walletSignal24',
      target: 'handler',
      type: 'labeled',
      label: 'erc5568.edge.resolveAction',
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
      id: 'wallet-signal-walkthrough',
      name: 'erc5568.sim.walletSignalWalkthrough.name',
      description: 'erc5568.sim.walletSignalWalkthrough.desc',
      params: [
        {
          id: 'selector',
          label: 'erc5568.sim.walletSignalWalkthrough.param.selector',
          type: 'select',
          options: [
            { label: 'Token approval', value: 'approve' },
            { label: 'HTTP request', value: 'http' },
            { label: 'Key rotation', value: 'rotate' },
          ],
          defaultValue: 'approve',
        },
        {
          id: 'instructionId',
          label: 'erc5568.sim.walletSignalWalkthrough.param.instructionId',
          type: 'uint256',
          defaultValue: '5568',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5568.sim.walletSignalWalkthrough.step.call',
          mobileDescription: 'erc5568.sim.walletSignalWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-walletSignal24'],
          highlightEdges: ['e-user-walletSignal24'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc5568.sim.walletSignalWalkthrough.step.execute',
          mobileDescription: 'erc5568.sim.walletSignalWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-walletSignal24', 'erc5568-contract', 'event-walletSignal24'],
          highlightEdges: ['e-walletSignal24-contract', 'e-contract-signal'],
          valueChanges: { 'event-walletSignal24.instruction_id': '0 → 5568' },
          durationMs: 1200,
        },
        {
          id: 'step-signal',
          description: 'erc5568.sim.walletSignalWalkthrough.step.signal',
          mobileDescription: 'erc5568.sim.walletSignalWalkthrough.step.signal.mobile',
          highlightNodes: ['event-walletSignal24', 'handler'],
          highlightEdges: ['e-signal-handler'],
          durationMs: 800,
        },
      ],
    },
  ],
};
