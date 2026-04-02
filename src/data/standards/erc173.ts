import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc173',
  name: 'ERC-173',
  shortDescription: 'erc173.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 173,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-173',
  relatedSlugs: ['erc165', 'erc2535'],
  sortOrder: 700,

  // ─── ERCContent ───
  introduction: 'erc173.introduction',
  designPurpose: 'erc173.designPurpose',
  commonUsage: 'erc173.commonUsage',

  functions: [
    {
      name: 'owner',
      signature: 'owner() → address',
      type: 'read',
      params: [],
      returns: [{ name: 'owner', type: 'address', description: 'erc173.fn.owner.returns.owner' }],
      description: 'erc173.fn.owner.desc',
      defaultSimValues: {},
    },
    {
      name: 'transferOwnership',
      signature: 'transferOwnership(address newOwner)',
      type: 'write',
      params: [
        { name: 'newOwner', type: 'address', description: 'erc173.fn.transferOwnership.params.newOwner' },
      ],
      description: 'erc173.fn.transferOwnership.desc',
      defaultSimValues: { newOwner: '0xNewOwner' },
    },
    {
      name: 'OwnershipTransferred',
      signature: 'OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
      type: 'event',
      params: [
        { name: 'previousOwner', type: 'address', description: 'erc173.fn.OwnershipTransferred.params.previousOwner' },
        { name: 'newOwner', type: 'address', description: 'erc173.fn.OwnershipTransferred.params.newOwner' },
      ],
      description: 'erc173.fn.OwnershipTransferred.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'owner',
      type: 'user',
      label: 'erc173.node.owner',
      data: { address: '0xCurrentOwner' },
      layoutHint: 'source',
    },
    {
      id: 'new-owner',
      type: 'user',
      label: 'erc173.node.newOwner',
      data: { address: '0xNewOwner' },
      layoutHint: 'sink',
    },
    {
      id: 'erc173-contract',
      type: 'contract',
      label: 'erc173.node.contract',
      data: { functions: ['owner', 'transferOwnership'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-transferOwnership',
      type: 'function',
      label: 'transferOwnership()',
      data: { fnType: 'write', signature: 'transferOwnership(address newOwner)' },
    },
    {
      id: 'storage',
      type: 'storage',
      label: 'erc173.node.storage',
      data: {
        slots: [
          { key: '_owner', label: 'address' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-ownership',
      type: 'function',
      label: 'OwnershipTransferred event',
      data: { fnType: 'event', signature: 'OwnershipTransferred(address indexed previousOwner, address indexed newOwner)' },
    },
  ],

  flowEdges: [
    {
      id: 'e-owner-fn',
      source: 'owner',
      target: 'fn-transferOwnership',
      type: 'animated',
      label: 'erc173.edge.callTransfer',
    },
    {
      id: 'e-fn-contract',
      source: 'fn-transferOwnership',
      target: 'erc173-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc173-contract',
      target: 'storage',
      type: 'labeled',
      label: 'erc173.edge.updateOwner',
    },
    {
      id: 'e-contract-newOwner',
      source: 'erc173-contract',
      target: 'new-owner',
      type: 'fundFlow',
      label: 'erc173.edge.ownershipGranted',
    },
    {
      id: 'e-contract-event',
      source: 'erc173-contract',
      target: 'event-ownership',
      type: 'labeled',
      label: 'erc173.edge.emitEvent',
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
      id: 'transfer-ownership',
      name: 'erc173.sim.transferOwnership.name',
      description: 'erc173.sim.transferOwnership.desc',
      params: [
        {
          id: 'currentOwner',
          label: 'erc173.sim.transferOwnership.param.currentOwner',
          type: 'address',
          defaultValue: '0xAlice',
        },
        {
          id: 'newOwner',
          label: 'erc173.sim.transferOwnership.param.newOwner',
          type: 'address',
          defaultValue: '0xBob',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc173.sim.transferOwnership.step.call',
          mobileDescription: 'erc173.sim.transferOwnership.step.call.mobile',
          highlightNodes: ['owner', 'fn-transferOwnership'],
          highlightEdges: ['e-owner-fn'],
          valueChanges: { 'fn-transferOwnership.input': 'newOwner = 0xBob' },
          durationMs: 1000,
        },
        {
          id: 'step-validate',
          description: 'erc173.sim.transferOwnership.step.validate',
          mobileDescription: 'erc173.sim.transferOwnership.step.validate.mobile',
          highlightNodes: ['fn-transferOwnership', 'erc173-contract'],
          highlightEdges: ['e-fn-contract'],
          valueChanges: { 'erc173-contract.check': 'msg.sender == _owner ✓' },
          durationMs: 1000,
        },
        {
          id: 'step-update-storage',
          description: 'erc173.sim.transferOwnership.step.updateStorage',
          mobileDescription: 'erc173.sim.transferOwnership.step.updateStorage.mobile',
          highlightNodes: ['erc173-contract', 'storage'],
          highlightEdges: ['e-contract-storage'],
          valueChanges: { 'storage._owner': '0xAlice → 0xBob' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc173.sim.transferOwnership.step.event',
          mobileDescription: 'erc173.sim.transferOwnership.step.event.mobile',
          highlightNodes: ['erc173-contract', 'new-owner', 'event-ownership'],
          highlightEdges: ['e-contract-newOwner', 'e-contract-event'],
          valueChanges: {
            'new-owner.role': 'owner',
            'event-ownership.lastEvent': 'OwnershipTransferred(0xAlice, 0xBob)',
          },
          durationMs: 900,
        },
      ],
    },
  ],
};
