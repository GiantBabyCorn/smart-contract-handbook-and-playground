import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc6093',
  name: 'ERC-6093',
  shortDescription: 'erc6093.short',
  category: 'token',
  entryType: 'standard',
  eipNumber: 6093,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-6093',
  relatedSlugs: ['erc20', 'erc721', 'erc1155'],
  sortOrder: 16093,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20, 721, 1155],
  relations: [
    { slug: 'erc20', kind: 'requires' },
    { slug: 'erc721', kind: 'requires' },
    { slug: 'erc1155', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-6093 Specification', url: 'https://eips.ethereum.org/EIPS/eip-6093', kind: 'spec' },
    {
      label: 'OpenZeppelin IERC6093',
      url: 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/interfaces/draft-IERC6093.sol',
      kind: 'impl',
    },
  ],

  // ─── ERCContent ───
  introduction: 'erc6093.introduction',
  designPurpose: 'erc6093.designPurpose',
  commonUsage: 'erc6093.commonUsage',

  // ERC-6093 specifies a naming convention for Solidity custom errors, not a
  // callable interface (no functions or events) — so functions is empty.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc6093.node.user',
      data: { address: '0xCaller' },
      layoutHint: 'source',
    },
    {
      id: 'token',
      type: 'contract',
      label: 'erc6093.node.token',
      data: { functions: [] },
      layoutHint: 'center',
    },
    {
      id: 'storage-state',
      type: 'storage',
      label: 'erc6093.node.storageState',
      data: {
        slots: [
          { key: '_balances', label: 'mapping(address => uint256)' },
          { key: '_allowances', label: 'mapping(address => mapping(address => uint256))' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'storage-error',
      type: 'storage',
      label: 'erc6093.node.storageError',
      data: {
        slots: [{ key: 'revertData', label: 'ERC20InsufficientBalance(address,uint256,uint256)' }],
      },
    },
    {
      id: 'decoder',
      type: 'contract',
      label: 'erc6093.node.decoder',
      data: { functions: [] },
    },
    {
      id: 'wallet',
      type: 'user',
      label: 'erc6093.node.wallet',
      data: { address: '0xClient' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-token',
      source: 'user',
      target: 'token',
      type: 'animated',
      label: 'erc6093.edge.callToken',
    },
    {
      id: 'e-token-state',
      source: 'token',
      target: 'storage-state',
      type: 'labeled',
      label: 'erc6093.edge.checkState',
    },
    {
      id: 'e-token-error',
      source: 'token',
      target: 'storage-error',
      type: 'labeled',
      label: 'erc6093.edge.revertError',
    },
    {
      id: 'e-error-decoder',
      source: 'storage-error',
      target: 'decoder',
      type: 'animated',
      label: 'erc6093.edge.decodeError',
    },
    {
      id: 'e-decoder-wallet',
      source: 'decoder',
      target: 'wallet',
      type: 'animated',
      label: 'erc6093.edge.showMessage',
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
      id: 'error-decoding-walkthrough',
      name: 'erc6093.sim.errorDecodingWalkthrough.name',
      description: 'erc6093.sim.errorDecodingWalkthrough.desc',
      params: [
        {
          id: 'sender',
          label: 'erc6093.sim.errorDecodingWalkthrough.param.sender',
          type: 'address',
          defaultValue: '0xCaller',
        },
        {
          id: 'amount',
          label: 'erc6093.sim.errorDecodingWalkthrough.param.amount',
          type: 'uint256',
          defaultValue: '1000000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc6093.sim.errorDecodingWalkthrough.step.call',
          mobileDescription: 'erc6093.sim.errorDecodingWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'token'],
          highlightEdges: ['e-user-token'],
          durationMs: 1000,
        },
        {
          id: 'step-check',
          description: 'erc6093.sim.errorDecodingWalkthrough.step.check',
          mobileDescription: 'erc6093.sim.errorDecodingWalkthrough.step.check.mobile',
          highlightNodes: ['token', 'storage-state'],
          highlightEdges: ['e-token-state'],
          valueChanges: { 'storage-state._balances[sender]': 'balance < needed amount' },
          durationMs: 1200,
        },
        {
          id: 'step-revert',
          description: 'erc6093.sim.errorDecodingWalkthrough.step.revert',
          mobileDescription: 'erc6093.sim.errorDecodingWalkthrough.step.revert.mobile',
          highlightNodes: ['token', 'storage-error'],
          highlightEdges: ['e-token-error'],
          valueChanges: { 'storage-error.revertData': 'ERC20InsufficientBalance(sender, balance, needed)' },
          durationMs: 1200,
        },
        {
          id: 'step-decode',
          description: 'erc6093.sim.errorDecodingWalkthrough.step.decode',
          mobileDescription: 'erc6093.sim.errorDecodingWalkthrough.step.decode.mobile',
          highlightNodes: ['storage-error', 'decoder', 'wallet'],
          highlightEdges: ['e-error-decoder', 'e-decoder-wallet'],
          durationMs: 1000,
        },
      ],
    },
  ],
};
