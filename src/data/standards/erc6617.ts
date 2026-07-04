import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc6617',
  name: 'ERC-6617',
  shortDescription: 'erc6617.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 6617,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-6617',
  relatedSlugs: ['erc173', 'erc165', 'erc7579'],
  sortOrder: 16617,
  eipStatus: 'Review',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  relations: [{ slug: 'erc173', kind: 'alternative' }],
  references: [
    { label: 'ERC-6617 Specification', url: 'https://eips.ethereum.org/EIPS/eip-6617', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc6617.introduction',
  designPurpose: 'erc6617.designPurpose',
  commonUsage: 'erc6617.commonUsage',

  functions: [
    {
      name: 'hasPermission',
      signature: 'hasPermission(address _user, uint256 _requiredPermission) → bool',
      type: 'read',
      params: [
        { name: '_user', type: 'address', description: 'erc6617.fn.hasPermission.params._user' },
        {
          name: '_requiredPermission',
          type: 'uint256',
          description: 'erc6617.fn.hasPermission.params._requiredPermission',
        },
      ],
      returns: [{ name: 'result', type: 'bool', description: 'erc6617.fn.hasPermission.returns.result' }],
      description: 'erc6617.fn.hasPermission.desc',
      defaultSimValues: { _user: '0xUser', _requiredPermission: '4' },
    },
    {
      name: 'grantPermission',
      signature: 'grantPermission(address _user, uint256 _permissionToAdd) → bool',
      type: 'write',
      params: [
        { name: '_user', type: 'address', description: 'erc6617.fn.grantPermission.params._user' },
        {
          name: '_permissionToAdd',
          type: 'uint256',
          description: 'erc6617.fn.grantPermission.params._permissionToAdd',
        },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc6617.fn.grantPermission.returns.success' }],
      description: 'erc6617.fn.grantPermission.desc',
      defaultSimValues: { _user: '0xUser', _permissionToAdd: '4' },
    },
    {
      name: 'revokePermission',
      signature: 'revokePermission(address _user, uint256 _permissionToRevoke) → bool',
      type: 'write',
      params: [
        { name: '_user', type: 'address', description: 'erc6617.fn.revokePermission.params._user' },
        {
          name: '_permissionToRevoke',
          type: 'uint256',
          description: 'erc6617.fn.revokePermission.params._permissionToRevoke',
        },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc6617.fn.revokePermission.returns.success' }],
      description: 'erc6617.fn.revokePermission.desc',
      defaultSimValues: { _user: '0xUser', _permissionToRevoke: '4' },
    },
    {
      name: 'PermissionGranted',
      signature: 'PermissionGranted(address indexed _grantor, uint256 indexed _permission, address indexed _user)',
      type: 'event',
      params: [
        { name: '_grantor', type: 'address', description: 'erc6617.fn.PermissionGranted.params._grantor' },
        { name: '_permission', type: 'uint256', description: 'erc6617.fn.PermissionGranted.params._permission' },
        { name: '_user', type: 'address', description: 'erc6617.fn.PermissionGranted.params._user' },
      ],
      description: 'erc6617.fn.PermissionGranted.desc',
    },
    {
      name: 'PermissionRevoked',
      signature: 'PermissionRevoked(address indexed _revoker, uint256 indexed _permission, address indexed _user)',
      type: 'event',
      params: [
        { name: '_revoker', type: 'address', description: 'erc6617.fn.PermissionRevoked.params._revoker' },
        { name: '_permission', type: 'uint256', description: 'erc6617.fn.PermissionRevoked.params._permission' },
        { name: '_user', type: 'address', description: 'erc6617.fn.PermissionRevoked.params._user' },
      ],
      description: 'erc6617.fn.PermissionRevoked.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc6617.node.user',
      data: { address: '0xGrantor' },
      layoutHint: 'source',
    },
    {
      id: 'erc6617-contract',
      type: 'contract',
      label: 'erc6617.node.contract',
      data: { functions: ['hasPermission', 'grantPermission', 'revokePermission'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-grantPermission',
      type: 'function',
      label: 'grantPermission()',
      data: { fnType: 'write', signature: 'grantPermission(address _user, uint256 _permissionToAdd) → bool' },
    },
    {
      id: 'storage-permissions',
      type: 'storage',
      label: 'erc6617.node.storagePermissions',
      data: { slots: [{ key: '_permissions', label: 'mapping(address => uint256)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-permissionGranted',
      type: 'function',
      label: 'PermissionGranted event',
      data: {
        fnType: 'event',
        signature: 'PermissionGranted(address indexed _grantor, uint256 indexed _permission, address indexed _user)',
      },
    },
    {
      id: 'target-user',
      type: 'user',
      label: 'erc6617.node.targetUser',
      data: { address: '0xUser' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-grant',
      source: 'user',
      target: 'fn-grantPermission',
      type: 'animated',
      label: 'erc6617.edge.callGrant',
    },
    {
      id: 'e-grant-contract',
      source: 'fn-grantPermission',
      target: 'erc6617-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc6617-contract',
      target: 'storage-permissions',
      type: 'labeled',
      label: 'erc6617.edge.updatePermissions',
    },
    {
      id: 'e-contract-event',
      source: 'erc6617-contract',
      target: 'event-permissionGranted',
      type: 'labeled',
      label: 'erc6617.edge.emitGranted',
    },
    {
      id: 'e-contract-targetUser',
      source: 'erc6617-contract',
      target: 'target-user',
      type: 'labeled',
      label: 'erc6617.edge.grantToUser',
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
      id: 'grant-permission-walkthrough',
      name: 'erc6617.sim.grantPermissionWalkthrough.name',
      description: 'erc6617.sim.grantPermissionWalkthrough.desc',
      params: [
        {
          id: 'targetUser',
          label: 'erc6617.sim.grantPermissionWalkthrough.param.targetUser',
          type: 'address',
          defaultValue: '0xUser',
        },
        {
          id: 'permission',
          label: 'erc6617.sim.grantPermissionWalkthrough.param.permission',
          type: 'uint256',
          defaultValue: '4',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc6617.sim.grantPermissionWalkthrough.step.call',
          mobileDescription: 'erc6617.sim.grantPermissionWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-grantPermission'],
          highlightEdges: ['e-user-grant'],
          valueChanges: { 'fn-grantPermission.input': '_user = 0xUser, _permissionToAdd = 4' },
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc6617.sim.grantPermissionWalkthrough.step.execute',
          mobileDescription: 'erc6617.sim.grantPermissionWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-grantPermission', 'erc6617-contract', 'storage-permissions'],
          highlightEdges: ['e-grant-contract', 'e-contract-storage'],
          valueChanges: { 'storage-permissions._permissions[0xUser]': '0b010 → 0b110' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc6617.sim.grantPermissionWalkthrough.step.event',
          mobileDescription: 'erc6617.sim.grantPermissionWalkthrough.step.event.mobile',
          highlightNodes: ['erc6617-contract', 'event-permissionGranted', 'target-user'],
          highlightEdges: ['e-contract-event', 'e-contract-targetUser'],
          valueChanges: { 'event-permissionGranted.lastEvent': 'PermissionGranted(0xGrantor, 4, 0xUser)' },
          durationMs: 900,
        },
      ],
    },
  ],
};
