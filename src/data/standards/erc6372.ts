import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc6372',
  name: 'ERC-6372',
  shortDescription: 'erc6372.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 6372,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-6372',
  relatedSlugs: ['erc5267', 'erc165', 'erc20'],
  sortOrder: 16372,
  eipStatus: 'Review',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-6372 Specification', url: 'https://eips.ethereum.org/EIPS/eip-6372', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc6372.introduction',
  designPurpose: 'erc6372.designPurpose',
  commonUsage: 'erc6372.commonUsage',

  functions: [
    {
      name: 'clock',
      signature: 'clock() → uint48',
      type: 'read',
      params: [],
      returns: [
        { name: 'timepoint', type: 'uint48', description: 'erc6372.fn.clock.returns.timepoint' },
      ],
      description: 'erc6372.fn.clock.desc',
      defaultSimValues: {},
    },
    {
      name: 'CLOCK_MODE',
      signature: 'CLOCK_MODE() → string',
      type: 'read',
      params: [],
      returns: [
        { name: 'descriptor', type: 'string', description: 'erc6372.fn.CLOCK_MODE.returns.descriptor' },
      ],
      description: 'erc6372.fn.CLOCK_MODE.desc',
      defaultSimValues: {},
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc6372.node.user',
      data: { address: '0xObserver' },
      layoutHint: 'source',
    },
    {
      id: 'erc6372-contract',
      type: 'contract',
      label: 'erc6372.node.contract',
      data: { functions: ['clock', 'CLOCK_MODE'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-clock',
      type: 'function',
      label: 'clock()',
      data: { fnType: 'read', signature: 'clock() → uint48' },
    },
    {
      id: 'fn-clockMode',
      type: 'function',
      label: 'CLOCK_MODE()',
      data: { fnType: 'read', signature: 'CLOCK_MODE() → string' },
    },
    {
      id: 'clock-source',
      type: 'storage',
      label: 'erc6372.node.clockSource',
      data: {
        slots: [
          { key: 'block.timestamp', label: 'uint48 timepoint (timestamp mode)' },
          { key: 'block.number', label: 'uint48 timepoint (block mode)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'clock-result',
      type: 'tokenFlow',
      label: 'erc6372.node.clockResult',
      data: { symbol: 'timepoint', amount: 'CLOCK_MODE' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-clock',
      source: 'user',
      target: 'fn-clock',
      type: 'animated',
      label: 'erc6372.edge.callClock',
    },
    {
      id: 'e-clock-contract',
      source: 'fn-clock',
      target: 'erc6372-contract',
      type: 'animated',
    },
    {
      id: 'e-user-clockMode',
      source: 'user',
      target: 'fn-clockMode',
      type: 'animated',
      label: 'erc6372.edge.callClockMode',
    },
    {
      id: 'e-clockMode-contract',
      source: 'fn-clockMode',
      target: 'erc6372-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-source',
      source: 'erc6372-contract',
      target: 'clock-source',
      type: 'labeled',
      label: 'erc6372.edge.readClockSource',
    },
    {
      id: 'e-contract-result',
      source: 'erc6372-contract',
      target: 'clock-result',
      type: 'labeled',
      label: 'erc6372.edge.buildTimepoint',
    },
    {
      id: 'e-result-user',
      source: 'clock-result',
      target: 'user',
      type: 'fundFlow',
      label: 'erc6372.edge.returnTimepoint',
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
      id: 'clock-discovery',
      name: 'erc6372.sim.clockDiscovery.name',
      description: 'erc6372.sim.clockDiscovery.desc',
      params: [
        {
          id: 'contractAddress',
          label: 'erc6372.sim.clockDiscovery.param.contractAddress',
          type: 'address',
          defaultValue: '0xVotingToken',
        },
        {
          id: 'mode',
          label: 'erc6372.sim.clockDiscovery.param.mode',
          type: 'select',
          options: [
            { label: 'Timestamp', value: 'timestamp' },
            { label: 'Block number', value: 'blocknumber' },
          ],
          defaultValue: 'timestamp',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc6372.sim.clockDiscovery.step.call',
          mobileDescription: 'erc6372.sim.clockDiscovery.step.call.mobile',
          highlightNodes: ['user', 'fn-clock'],
          highlightEdges: ['e-user-clock'],
          valueChanges: { 'user.action': 'Calling clock()' },
          durationMs: 900,
        },
        {
          id: 'step-read',
          description: 'erc6372.sim.clockDiscovery.step.read',
          mobileDescription: 'erc6372.sim.clockDiscovery.step.read.mobile',
          highlightNodes: ['fn-clock', 'erc6372-contract', 'clock-source'],
          highlightEdges: ['e-clock-contract', 'e-contract-source'],
          valueChanges: {
            'clock-source.block.timestamp': '1750000000',
            'clock-source.block.number': '20000000',
          },
          durationMs: 1200,
        },
        {
          id: 'step-mode',
          description: 'erc6372.sim.clockDiscovery.step.mode',
          mobileDescription: 'erc6372.sim.clockDiscovery.step.mode.mobile',
          highlightNodes: ['user', 'fn-clockMode', 'erc6372-contract'],
          highlightEdges: ['e-user-clockMode', 'e-clockMode-contract'],
          valueChanges: { 'erc6372-contract.CLOCK_MODE': 'mode=timestamp' },
          durationMs: 1000,
        },
        {
          id: 'step-return',
          description: 'erc6372.sim.clockDiscovery.step.return',
          mobileDescription: 'erc6372.sim.clockDiscovery.step.return.mobile',
          highlightNodes: ['erc6372-contract', 'clock-result', 'user'],
          highlightEdges: ['e-contract-result', 'e-result-user'],
          valueChanges: {
            'user.timepoint': '1750000000 (uint48)',
            'user.clockMode': 'mode=timestamp',
          },
          durationMs: 900,
        },
      ],
    },
  ],
};
