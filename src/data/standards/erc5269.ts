import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5269',
  name: 'ERC-5269',
  shortDescription: 'erc5269.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 5269,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5269',
  relatedSlugs: ['erc165', 'erc5750', 'erc5267', 'erc721'],
  sortOrder: 15269,
  eipStatus: 'Review',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [5750],
  relations: [
    { slug: 'erc5750', kind: 'requires' },
    { slug: 'erc165', kind: 'alternative' },
  ],
  references: [
    { label: 'ERC-5269 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5269', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5269.introduction',
  designPurpose: 'erc5269.designPurpose',
  commonUsage: 'erc5269.commonUsage',

  functions: [
    {
      name: 'supportERC',
      signature:
        'supportERC(address caller, uint256 majorERCIdentifier, bytes32 minorERCIdentifier, bytes calldata extraData) → bytes32 ercStatus',
      type: 'read',
      params: [
        { name: 'caller', type: 'address', description: 'erc5269.fn.supportERC.params.caller' },
        {
          name: 'majorERCIdentifier',
          type: 'uint256',
          description: 'erc5269.fn.supportERC.params.majorERCIdentifier',
        },
        {
          name: 'minorERCIdentifier',
          type: 'bytes32',
          description: 'erc5269.fn.supportERC.params.minorERCIdentifier',
        },
        { name: 'extraData', type: 'bytes', description: 'erc5269.fn.supportERC.params.extraData' },
      ],
      returns: [
        { name: 'ercStatus', type: 'bytes32', description: 'erc5269.fn.supportERC.returns.ercStatus' },
      ],
      description: 'erc5269.fn.supportERC.desc',
      defaultSimValues: { majorERCIdentifier: '5269', minorERCIdentifier: '0' },
    },
    {
      name: 'OnSupportERC',
      signature:
        'OnSupportERC(address indexed caller, uint256 indexed majorERCIdentifier, bytes32 indexed minorERCIdentifier, bytes32 ercStatus, bytes extraData)',
      type: 'event',
      params: [
        { name: 'caller', type: 'address', description: 'erc5269.fn.OnSupportERC.params.caller' },
        {
          name: 'majorERCIdentifier',
          type: 'uint256',
          description: 'erc5269.fn.OnSupportERC.params.majorERCIdentifier',
        },
        {
          name: 'minorERCIdentifier',
          type: 'bytes32',
          description: 'erc5269.fn.OnSupportERC.params.minorERCIdentifier',
        },
        { name: 'ercStatus', type: 'bytes32', description: 'erc5269.fn.OnSupportERC.params.ercStatus' },
        { name: 'extraData', type: 'bytes', description: 'erc5269.fn.OnSupportERC.params.extraData' },
      ],
      description: 'erc5269.fn.OnSupportERC.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5269.node.user',
      data: { address: '0xCaller' },
      layoutHint: 'source',
    },
    {
      id: 'erc5269-contract',
      type: 'contract',
      label: 'erc5269.node.contract',
      data: { functions: ['supportERC'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-supportERC',
      type: 'function',
      label: 'supportERC()',
      data: {
        fnType: 'read',
        signature:
          'supportERC(address caller, uint256 majorERCIdentifier, bytes32 minorERCIdentifier, bytes calldata extraData) → bytes32 ercStatus',
      },
    },
    {
      id: 'storage-support',
      type: 'storage',
      label: 'erc5269.node.storageSupport',
      data: { slots: [{ key: '_supported', label: 'ERC number → bytes32 status' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-onSupportERC',
      type: 'function',
      label: 'OnSupportERC event',
      data: {
        fnType: 'event',
        signature:
          'OnSupportERC(address indexed caller, uint256 indexed majorERCIdentifier, bytes32 indexed minorERCIdentifier, bytes32 ercStatus, bytes extraData)',
      },
    },
  ],

  flowEdges: [
    {
      id: 'e-user-supportERC',
      source: 'user',
      target: 'fn-supportERC',
      type: 'animated',
      label: 'erc5269.edge.callSupportERC',
    },
    { id: 'e-supportERC-contract', source: 'fn-supportERC', target: 'erc5269-contract', type: 'animated' },
    {
      id: 'e-contract-storage',
      source: 'erc5269-contract',
      target: 'storage-support',
      type: 'labeled',
      label: 'erc5269.edge.readSupport',
    },
    {
      id: 'e-contract-user',
      source: 'erc5269-contract',
      target: 'user',
      type: 'labeled',
      label: 'erc5269.edge.returnStatus',
    },
    {
      id: 'e-contract-event',
      source: 'erc5269-contract',
      target: 'event-onSupportERC',
      type: 'labeled',
      label: 'erc5269.edge.emitOnSupport',
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
      id: 'support-query-walkthrough',
      name: 'erc5269.sim.supportQueryWalkthrough.name',
      description: 'erc5269.sim.supportQueryWalkthrough.desc',
      params: [
        {
          id: 'caller',
          label: 'erc5269.sim.supportQueryWalkthrough.param.caller',
          type: 'address',
          defaultValue: '0xCaller',
        },
        {
          id: 'majorERCIdentifier',
          label: 'erc5269.sim.supportQueryWalkthrough.param.majorERCIdentifier',
          type: 'uint256',
          defaultValue: '5269',
        },
        {
          id: 'minorERCIdentifier',
          label: 'erc5269.sim.supportQueryWalkthrough.param.minorERCIdentifier',
          type: 'select',
          options: [
            { label: '0 (entire ERC)', value: '0' },
            { label: 'ERC721Metadata', value: 'ERC721Metadata' },
          ],
          defaultValue: '0',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5269.sim.supportQueryWalkthrough.step.call',
          mobileDescription: 'erc5269.sim.supportQueryWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-supportERC'],
          highlightEdges: ['e-user-supportERC'],
          durationMs: 1000,
        },
        {
          id: 'step-lookup',
          description: 'erc5269.sim.supportQueryWalkthrough.step.lookup',
          mobileDescription: 'erc5269.sim.supportQueryWalkthrough.step.lookup.mobile',
          highlightNodes: ['fn-supportERC', 'erc5269-contract', 'storage-support'],
          highlightEdges: ['e-supportERC-contract', 'e-contract-storage'],
          valueChanges: { 'storage-support._supported[5269]': 'keccak256("DRAFTv1")' },
          durationMs: 1200,
        },
        {
          id: 'step-return',
          description: 'erc5269.sim.supportQueryWalkthrough.step.return',
          mobileDescription: 'erc5269.sim.supportQueryWalkthrough.step.return.mobile',
          highlightNodes: ['erc5269-contract', 'user'],
          highlightEdges: ['e-contract-user'],
          valueChanges: { 'user.ercStatus': 'keccak256("DRAFTv1")' },
          durationMs: 900,
        },
        {
          id: 'step-declare',
          description: 'erc5269.sim.supportQueryWalkthrough.step.declare',
          mobileDescription: 'erc5269.sim.supportQueryWalkthrough.step.declare.mobile',
          highlightNodes: ['erc5269-contract', 'event-onSupportERC'],
          highlightEdges: ['e-contract-event'],
          durationMs: 800,
        },
      ],
    },
  ],
};
