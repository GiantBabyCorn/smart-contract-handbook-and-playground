import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7710',
  name: 'ERC-7710',
  shortDescription: 'erc7710.short',
  category: 'account',
  entryType: 'standard',
  eipNumber: 7710,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7710',
  relatedSlugs: ['erc7579', 'erc1271', 'erc4337', 'erc7702'],
  sortOrder: 17710,
  eipStatus: 'Draft',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [1271, 7579],
  relations: [
    { slug: 'erc7579', kind: 'requires' },
    { slug: 'erc1271', kind: 'requires' },
    { slug: 'erc4337', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-7710 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7710', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7710.introduction',
  designPurpose: 'erc7710.designPurpose',
  commonUsage: 'erc7710.commonUsage',

  functions: [
    {
      name: 'redeemDelegations',
      signature:
        'redeemDelegations(bytes[] calldata _permissionContexts, bytes32[] calldata _modes, bytes[] calldata _executionCallData)',
      type: 'write',
      params: [
        {
          name: '_permissionContexts',
          type: 'bytes[]',
          description: 'erc7710.fn.redeemDelegations.params.permissionContexts',
        },
        { name: '_modes', type: 'bytes32[]', description: 'erc7710.fn.redeemDelegations.params.modes' },
        {
          name: '_executionCallData',
          type: 'bytes[]',
          description: 'erc7710.fn.redeemDelegations.params.executionCallData',
        },
      ],
      description: 'erc7710.fn.redeemDelegations.desc',
      defaultSimValues: { _permissionContexts: '0x', _modes: '0x00', _executionCallData: '0x' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'delegate',
      type: 'user',
      label: 'erc7710.node.delegate',
      data: { address: '0xDelegate' },
      layoutHint: 'source',
    },
    {
      id: 'erc7710-contract',
      type: 'contract',
      label: 'erc7710.node.contract',
      data: { functions: ['redeemDelegations'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-redeemDelegations',
      type: 'function',
      label: 'redeemDelegations()',
      data: {
        fnType: 'write',
        signature:
          'redeemDelegations(bytes[] calldata _permissionContexts, bytes32[] calldata _modes, bytes[] calldata _executionCallData)',
      },
    },
    {
      id: 'delegator',
      type: 'contract',
      label: 'erc7710.node.delegator',
      data: {},
    },
    {
      id: 'target',
      type: 'contract',
      label: 'erc7710.node.target',
      data: {},
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-delegate-redeem',
      source: 'delegate',
      target: 'fn-redeemDelegations',
      type: 'animated',
      label: 'erc7710.edge.callRedeem',
    },
    { id: 'e-redeem-contract', source: 'fn-redeemDelegations', target: 'erc7710-contract', type: 'animated' },
    {
      id: 'e-contract-delegator',
      source: 'erc7710-contract',
      target: 'delegator',
      type: 'labeled',
      label: 'erc7710.edge.callDelegator',
    },
    {
      id: 'e-delegator-target',
      source: 'delegator',
      target: 'target',
      type: 'labeled',
      label: 'erc7710.edge.executeAction',
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
      id: 'redeem-delegation-walkthrough',
      name: 'erc7710.sim.redeemDelegationWalkthrough.name',
      description: 'erc7710.sim.redeemDelegationWalkthrough.desc',
      params: [
        {
          id: 'delegator',
          label: 'erc7710.sim.redeemDelegationWalkthrough.param.delegator',
          type: 'address',
          defaultValue: '0xDelegatorAccount',
        },
        {
          id: 'target',
          label: 'erc7710.sim.redeemDelegationWalkthrough.param.target',
          type: 'address',
          defaultValue: '0xTargetContract',
        },
        {
          id: 'mode',
          label: 'erc7710.sim.redeemDelegationWalkthrough.param.mode',
          type: 'select',
          options: [
            { label: 'Single call', value: 'single' },
            { label: 'Batch call', value: 'batch' },
          ],
          defaultValue: 'single',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc7710.sim.redeemDelegationWalkthrough.step.call',
          mobileDescription: 'erc7710.sim.redeemDelegationWalkthrough.step.call.mobile',
          highlightNodes: ['delegate', 'fn-redeemDelegations'],
          highlightEdges: ['e-delegate-redeem'],
          durationMs: 1000,
        },
        {
          id: 'step-validate',
          description: 'erc7710.sim.redeemDelegationWalkthrough.step.validate',
          mobileDescription: 'erc7710.sim.redeemDelegationWalkthrough.step.validate.mobile',
          highlightNodes: ['fn-redeemDelegations', 'erc7710-contract', 'delegator'],
          highlightEdges: ['e-redeem-contract', 'e-contract-delegator'],
          valueChanges: { 'erc7710-contract.authority': 'permissionContext → verified' },
          durationMs: 1200,
        },
        {
          id: 'step-execute',
          description: 'erc7710.sim.redeemDelegationWalkthrough.step.execute',
          mobileDescription: 'erc7710.sim.redeemDelegationWalkthrough.step.execute.mobile',
          highlightNodes: ['delegator', 'target'],
          highlightEdges: ['e-delegator-target'],
          valueChanges: { 'target.state': 'updated on behalf of delegator' },
          durationMs: 900,
        },
      ],
    },
  ],
};
