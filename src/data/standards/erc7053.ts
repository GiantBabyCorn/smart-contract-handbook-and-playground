import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7053',
  name: 'ERC-7053',
  shortDescription: 'erc7053.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 7053,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7053',
  relatedSlugs: ['erc721', 'erc1155', 'erc1046'],
  sortOrder: 17053,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  relations: [
    { slug: 'erc721', kind: 'usedWith' },
    { slug: 'erc1155', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-7053 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7053', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7053.introduction',
  designPurpose: 'erc7053.designPurpose',
  commonUsage: 'erc7053.commonUsage',

  functions: [
    {
      name: 'commit',
      signature: 'commit(string assetCid, string commitData) → uint256 blockNumber',
      type: 'write',
      params: [
        { name: 'assetCid', type: 'string', description: 'erc7053.fn.commit.params.assetCid' },
        { name: 'commitData', type: 'string', description: 'erc7053.fn.commit.params.commitData' },
      ],
      returns: [
        { name: 'blockNumber', type: 'uint256', description: 'erc7053.fn.commit.returns.blockNumber' },
      ],
      description: 'erc7053.fn.commit.desc',
      defaultSimValues: { assetCid: 'QmPhotoCid', commitData: '{"type":"created"}' },
    },
    {
      name: 'Commit',
      signature: 'Commit(address indexed recorder, string indexed assetCid, string commitData)',
      type: 'event',
      params: [
        { name: 'recorder', type: 'address', description: 'erc7053.fn.Commit.params.recorder' },
        { name: 'assetCid', type: 'string', description: 'erc7053.fn.Commit.params.assetCid' },
        { name: 'commitData', type: 'string', description: 'erc7053.fn.Commit.params.commitData' },
      ],
      description: 'erc7053.fn.Commit.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc7053.node.user',
      data: { address: '0xRecorder' },
      layoutHint: 'source',
    },
    {
      id: 'erc7053-contract',
      type: 'contract',
      label: 'erc7053.node.contract',
      data: { functions: ['commit'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-commit',
      type: 'function',
      label: 'commit()',
      data: {
        fnType: 'write',
        signature: 'commit(string assetCid, string commitData) → uint256 blockNumber',
      },
    },
    {
      id: 'storage-logs',
      type: 'storage',
      label: 'erc7053.node.storageLogs',
      data: { slots: [{ key: 'recordLogs', label: 'mapping(string => uint256[])' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-commit',
      type: 'function',
      label: 'Commit event',
      data: {
        fnType: 'event',
        signature: 'Commit(address indexed recorder, string indexed assetCid, string commitData)',
      },
    },
  ],

  flowEdges: [
    {
      id: 'e-user-commit',
      source: 'user',
      target: 'fn-commit',
      type: 'animated',
      label: 'erc7053.edge.callCommit',
    },
    { id: 'e-commit-contract', source: 'fn-commit', target: 'erc7053-contract', type: 'animated' },
    {
      id: 'e-contract-logs',
      source: 'erc7053-contract',
      target: 'storage-logs',
      type: 'labeled',
      label: 'erc7053.edge.updateLogs',
    },
    {
      id: 'e-contract-event',
      source: 'erc7053-contract',
      target: 'event-commit',
      type: 'labeled',
      label: 'erc7053.edge.emitCommit',
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
      id: 'commit-walkthrough',
      name: 'erc7053.sim.commitWalkthrough.name',
      description: 'erc7053.sim.commitWalkthrough.desc',
      params: [
        {
          id: 'assetCid',
          label: 'erc7053.sim.commitWalkthrough.param.assetCid',
          type: 'select',
          options: [
            { label: 'QmPhotoCid', value: 'QmPhotoCid' },
            { label: 'QmVideoCid', value: 'QmVideoCid' },
          ],
          defaultValue: 'QmPhotoCid',
        },
        {
          id: 'commitData',
          label: 'erc7053.sim.commitWalkthrough.param.commitData',
          type: 'select',
          options: [
            { label: '{"type":"created"}', value: '{"type":"created"}' },
            { label: '{"type":"updated"}', value: '{"type":"updated"}' },
          ],
          defaultValue: '{"type":"created"}',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc7053.sim.commitWalkthrough.step.call',
          mobileDescription: 'erc7053.sim.commitWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-commit'],
          highlightEdges: ['e-user-commit'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc7053.sim.commitWalkthrough.step.execute',
          mobileDescription: 'erc7053.sim.commitWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-commit', 'erc7053-contract', 'storage-logs'],
          highlightEdges: ['e-commit-contract', 'e-contract-logs'],
          valueChanges: { 'storage-logs.recordLogs[QmPhotoCid]': '[] → [block.number]' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc7053.sim.commitWalkthrough.step.event',
          mobileDescription: 'erc7053.sim.commitWalkthrough.step.event.mobile',
          highlightNodes: ['erc7053-contract', 'event-commit'],
          highlightEdges: ['e-contract-event'],
          valueChanges: { 'event-commit.lastEvent': 'Commit(0xRecorder, "QmPhotoCid", ...)' },
          durationMs: 800,
        },
      ],
    },
  ],
};
