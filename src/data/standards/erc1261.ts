import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1261',
  name: 'ERC-1261',
  shortDescription: 'erc1261.short',
  category: 'identity',
  entryType: 'standard',
  eipNumber: 1261,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1261',
  relatedSlugs: ['erc165', 'erc173', 'erc721', 'erc3643'],
  sortOrder: 11261,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [165, 173],
  relations: [
    { slug: 'erc165', kind: 'requires' },
    { slug: 'erc173', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-1261 Specification', url: 'https://eips.ethereum.org/EIPS/eip-1261', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc1261.introduction',
  designPurpose: 'erc1261.designPurpose',
  commonUsage: 'erc1261.commonUsage',

  functions: [
    {
      name: 'requestMembership',
      signature: 'requestMembership(uint[] calldata _attributeIndexes)',
      type: 'write',
      params: [
        { name: '_attributeIndexes', type: 'uint[]', description: 'erc1261.fn.requestMembership.params.attributeIndexes' },
      ],
      description: 'erc1261.fn.requestMembership.desc',
      defaultSimValues: { _attributeIndexes: '0' },
    },
    {
      name: 'forfeitMembership',
      signature: 'forfeitMembership()',
      type: 'write',
      params: [],
      description: 'erc1261.fn.forfeitMembership.desc',
      defaultSimValues: {},
    },
    {
      name: 'approveRequest',
      signature: 'approveRequest(address _user)',
      type: 'write',
      params: [
        { name: '_user', type: 'address', description: 'erc1261.fn.approveRequest.params.user' },
      ],
      description: 'erc1261.fn.approveRequest.desc',
      defaultSimValues: { _user: '0xMember' },
    },
    {
      name: 'discardRequest',
      signature: 'discardRequest(address _user)',
      type: 'write',
      params: [
        { name: '_user', type: 'address', description: 'erc1261.fn.discardRequest.params.user' },
      ],
      description: 'erc1261.fn.discardRequest.desc',
      defaultSimValues: { _user: '0xMember' },
    },
    {
      name: 'assignTo',
      signature: 'assignTo(address _to, uint[] calldata _attributeIndexes)',
      type: 'write',
      params: [
        { name: '_to', type: 'address', description: 'erc1261.fn.assignTo.params.to' },
        { name: '_attributeIndexes', type: 'uint[]', description: 'erc1261.fn.assignTo.params.attributeIndexes' },
      ],
      description: 'erc1261.fn.assignTo.desc',
      defaultSimValues: { _to: '0xMember', _attributeIndexes: '0' },
    },
    {
      name: 'revokeFrom',
      signature: 'revokeFrom(address _from)',
      type: 'write',
      params: [
        { name: '_from', type: 'address', description: 'erc1261.fn.revokeFrom.params.from' },
      ],
      description: 'erc1261.fn.revokeFrom.desc',
      defaultSimValues: { _from: '0xMember' },
    },
    {
      name: 'isCurrentMember',
      signature: 'isCurrentMember(address _to) → bool',
      type: 'read',
      params: [
        { name: '_to', type: 'address', description: 'erc1261.fn.isCurrentMember.params.to' },
      ],
      returns: [
        { name: 'isMember', type: 'bool', description: 'erc1261.fn.isCurrentMember.returns.isMember' },
      ],
      description: 'erc1261.fn.isCurrentMember.desc',
      defaultSimValues: { _to: '0xMember' },
    },
    {
      name: 'Assigned',
      signature: 'Assigned(address indexed _to, uint[] attributeIndexes)',
      type: 'event',
      params: [
        { name: '_to', type: 'address', description: 'erc1261.fn.Assigned.params.to' },
        { name: 'attributeIndexes', type: 'uint[]', description: 'erc1261.fn.Assigned.params.attributeIndexes' },
      ],
      description: 'erc1261.fn.Assigned.desc',
    },
    {
      name: 'Revoked',
      signature: 'Revoked(address indexed _to)',
      type: 'event',
      params: [
        { name: '_to', type: 'address', description: 'erc1261.fn.Revoked.params.to' },
      ],
      description: 'erc1261.fn.Revoked.desc',
    },
    {
      name: 'RequestedMembership',
      signature: 'RequestedMembership(address indexed _to)',
      type: 'event',
      params: [
        { name: '_to', type: 'address', description: 'erc1261.fn.RequestedMembership.params.to' },
      ],
      description: 'erc1261.fn.RequestedMembership.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc1261.node.user',
      data: { address: '0xOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc1261-contract',
      type: 'contract',
      label: 'erc1261.node.contract',
      data: {
        functions: ['requestMembership', 'approveRequest', 'assignTo', 'revokeFrom', 'forfeitMembership', 'isCurrentMember'],
      },
      layoutHint: 'center',
    },
    {
      id: 'fn-assignTo',
      type: 'function',
      label: 'assignTo()',
      data: { fnType: 'write', signature: 'assignTo(address _to, uint[] calldata _attributeIndexes)' },
    },
    {
      id: 'fn-revokeFrom',
      type: 'function',
      label: 'revokeFrom()',
      data: { fnType: 'write', signature: 'revokeFrom(address _from)' },
    },
    {
      id: 'storage-members',
      type: 'storage',
      label: 'erc1261.node.storageMembers',
      data: {
        slots: [
          { key: '_isCurrentMember', label: 'mapping(address => bool)' },
          { key: '_attributes', label: 'mapping(address => bytes32[])' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-assigned',
      type: 'function',
      label: 'Assigned event',
      data: { fnType: 'event', signature: 'Assigned(address indexed _to, uint[] attributeIndexes)' },
    },
    {
      id: 'member',
      type: 'user',
      label: 'erc1261.node.member',
      data: { address: '0xMember' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-assignTo',
      source: 'user',
      target: 'fn-assignTo',
      type: 'animated',
      label: 'erc1261.edge.callAssign',
    },
    {
      id: 'e-assignTo-contract',
      source: 'fn-assignTo',
      target: 'erc1261-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc1261-contract',
      target: 'storage-members',
      type: 'labeled',
      label: 'erc1261.edge.updateMembers',
    },
    {
      id: 'e-contract-event',
      source: 'erc1261-contract',
      target: 'event-assigned',
      type: 'labeled',
      label: 'erc1261.edge.emitAssigned',
    },
    {
      id: 'e-contract-member',
      source: 'erc1261-contract',
      target: 'member',
      type: 'labeled',
      label: 'erc1261.edge.grantMembership',
    },
    {
      id: 'e-user-revoke',
      source: 'user',
      target: 'fn-revokeFrom',
      type: 'animated',
      label: 'erc1261.edge.callRevoke',
    },
    {
      id: 'e-revoke-contract',
      source: 'fn-revokeFrom',
      target: 'erc1261-contract',
      type: 'animated',
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
      id: 'assign-membership-walkthrough',
      name: 'erc1261.sim.assignMembership.name',
      description: 'erc1261.sim.assignMembership.desc',
      params: [
        {
          id: 'to',
          label: 'erc1261.sim.assignMembership.param.to',
          type: 'address',
          defaultValue: '0xMember',
        },
        {
          id: 'attributeIndexes',
          label: 'erc1261.sim.assignMembership.param.attributeIndexes',
          type: 'select',
          options: [
            { label: '[0]', value: '0' },
            { label: '[0, 2]', value: '0, 2' },
          ],
          defaultValue: '0',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc1261.sim.assignMembership.step.call',
          mobileDescription: 'erc1261.sim.assignMembership.step.call.mobile',
          highlightNodes: ['user', 'fn-assignTo'],
          highlightEdges: ['e-user-assignTo'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc1261.sim.assignMembership.step.execute',
          mobileDescription: 'erc1261.sim.assignMembership.step.execute.mobile',
          highlightNodes: ['fn-assignTo', 'erc1261-contract', 'storage-members'],
          highlightEdges: ['e-assignTo-contract', 'e-contract-storage'],
          valueChanges: { 'storage-members._isCurrentMember[0xMember]': 'false → true' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc1261.sim.assignMembership.step.event',
          mobileDescription: 'erc1261.sim.assignMembership.step.event.mobile',
          highlightNodes: ['erc1261-contract', 'event-assigned', 'member'],
          highlightEdges: ['e-contract-event', 'e-contract-member'],
          durationMs: 800,
        },
      ],
    },
  ],
};
