import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1967',
  name: 'ERC-1967',
  shortDescription: 'erc1967.short',
  category: 'proxy',
  entryType: 'standard',
  eipNumber: 1967,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1967',
  relatedSlugs: ['erc1822', 'erc2535'],
  sortOrder: 900,

  // ─── ERCContent ───
  introduction: 'erc1967.introduction',
  designPurpose: 'erc1967.designPurpose',
  commonUsage: 'erc1967.commonUsage',

  functions: [
    {
      name: 'implementation',
      signature: 'implementation() → address',
      type: 'read',
      params: [],
      returns: [
        { name: 'impl', type: 'address', description: 'erc1967.fn.implementation.returns.impl' },
      ],
      description: 'erc1967.fn.implementation.desc',
      defaultSimValues: {},
    },
    {
      name: 'admin',
      signature: 'admin() → address',
      type: 'read',
      params: [],
      returns: [
        { name: 'admin', type: 'address', description: 'erc1967.fn.admin.returns.admin' },
      ],
      description: 'erc1967.fn.admin.desc',
      defaultSimValues: {},
    },
    {
      name: 'Upgraded',
      signature: 'Upgraded(address indexed implementation)',
      type: 'event',
      params: [
        { name: 'implementation', type: 'address', description: 'erc1967.fn.Upgraded.params.implementation' },
      ],
      description: 'erc1967.fn.Upgraded.desc',
    },
    {
      name: 'AdminChanged',
      signature: 'AdminChanged(address previousAdmin, address newAdmin)',
      type: 'event',
      params: [
        { name: 'previousAdmin', type: 'address', description: 'erc1967.fn.AdminChanged.params.previousAdmin' },
        { name: 'newAdmin', type: 'address', description: 'erc1967.fn.AdminChanged.params.newAdmin' },
      ],
      description: 'erc1967.fn.AdminChanged.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc1967.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'proxy-contract',
      type: 'proxy',
      label: 'erc1967.node.proxy',
      data: { implementation: '0xImplV1' },
      layoutHint: 'center',
    },
    {
      id: 'implementation-contract',
      type: 'contract',
      label: 'erc1967.node.implementation',
      data: { functions: ['implementation', 'admin'] },
      layoutHint: 'center',
    },
    {
      id: 'admin',
      type: 'user',
      label: 'erc1967.node.admin',
      data: { address: '0xAdmin' },
      layoutHint: 'source',
    },
    {
      id: 'storage-slots',
      type: 'storage',
      label: 'erc1967.node.storageSlots',
      data: {
        slots: [
          { key: 'IMPLEMENTATION_SLOT', label: 'bytes32 = keccak256("eip1967.proxy.implementation") - 1' },
          { key: 'ADMIN_SLOT', label: 'bytes32 = keccak256("eip1967.proxy.admin") - 1' },
          { key: 'BEACON_SLOT', label: 'bytes32 = keccak256("eip1967.proxy.beacon") - 1' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-upgraded',
      type: 'function',
      label: 'Upgraded event',
      data: { fnType: 'event', signature: 'Upgraded(address indexed implementation)' },
    },
    {
      id: 'event-adminChanged',
      type: 'function',
      label: 'AdminChanged event',
      data: { fnType: 'event', signature: 'AdminChanged(address previousAdmin, address newAdmin)' },
    },
  ],

  flowEdges: [
    {
      id: 'e-user-proxy',
      source: 'user',
      target: 'proxy-contract',
      type: 'animated',
      label: 'erc1967.edge.callProxy',
    },
    {
      id: 'e-proxy-impl',
      source: 'proxy-contract',
      target: 'implementation-contract',
      type: 'animated',
      label: 'erc1967.edge.delegatecall',
    },
    {
      id: 'e-proxy-storage',
      source: 'proxy-contract',
      target: 'storage-slots',
      type: 'labeled',
      label: 'erc1967.edge.readSlot',
    },
    {
      id: 'e-admin-proxy',
      source: 'admin',
      target: 'proxy-contract',
      type: 'animated',
      label: 'erc1967.edge.upgrade',
    },
    {
      id: 'e-proxy-upgraded',
      source: 'proxy-contract',
      target: 'event-upgraded',
      type: 'labeled',
      label: 'erc1967.edge.emitUpgraded',
    },
    {
      id: 'e-proxy-adminChanged',
      source: 'proxy-contract',
      target: 'event-adminChanged',
      type: 'labeled',
      label: 'erc1967.edge.emitAdminChanged',
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
      id: 'delegatecall-proxy',
      name: 'erc1967.sim.delegatecallProxy.name',
      description: 'erc1967.sim.delegatecallProxy.desc',
      params: [
        {
          id: 'caller',
          label: 'erc1967.sim.delegatecallProxy.param.caller',
          type: 'address',
          defaultValue: '0xUser',
        },
        {
          id: 'proxyAddress',
          label: 'erc1967.sim.delegatecallProxy.param.proxyAddress',
          type: 'address',
          defaultValue: '0xProxy',
        },
      ],
      steps: [
        {
          id: 'step-call-proxy',
          description: 'erc1967.sim.delegatecallProxy.step.callProxy',
          mobileDescription: 'erc1967.sim.delegatecallProxy.step.callProxy.mobile',
          highlightNodes: ['user', 'proxy-contract'],
          highlightEdges: ['e-user-proxy'],
          valueChanges: { 'user.action': 'Calling 0xProxy with calldata' },
          durationMs: 1000,
        },
        {
          id: 'step-read-slot',
          description: 'erc1967.sim.delegatecallProxy.step.readSlot',
          mobileDescription: 'erc1967.sim.delegatecallProxy.step.readSlot.mobile',
          highlightNodes: ['proxy-contract', 'storage-slots'],
          highlightEdges: ['e-proxy-storage'],
          valueChanges: {
            'storage-slots.IMPLEMENTATION_SLOT': '0xImplV1',
            'proxy-contract.resolvedImpl': '0xImplV1',
          },
          durationMs: 1100,
        },
        {
          id: 'step-delegatecall',
          description: 'erc1967.sim.delegatecallProxy.step.delegatecall',
          mobileDescription: 'erc1967.sim.delegatecallProxy.step.delegatecall.mobile',
          highlightNodes: ['proxy-contract', 'implementation-contract'],
          highlightEdges: ['e-proxy-impl'],
          valueChanges: {
            'implementation-contract.context': 'proxy storage + proxy msg.sender',
            'proxy-contract.executionMode': 'delegatecall → 0xImplV1',
          },
          durationMs: 1400,
        },
        {
          id: 'step-return',
          description: 'erc1967.sim.delegatecallProxy.step.return',
          mobileDescription: 'erc1967.sim.delegatecallProxy.step.return.mobile',
          highlightNodes: ['implementation-contract', 'proxy-contract', 'user'],
          highlightEdges: ['e-proxy-impl', 'e-user-proxy'],
          valueChanges: {
            'user.result': 'returndata from implementation',
          },
          durationMs: 900,
        },
      ],
    },
  ],
};
