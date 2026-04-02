import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1822',
  name: 'ERC-1822',
  shortDescription: 'erc1822.short',
  category: 'proxy',
  entryType: 'standard',
  eipNumber: 1822,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1822',
  relatedSlugs: ['erc1967', 'erc2535'],
  sortOrder: 1000,

  // ─── ERCContent ───
  introduction: 'erc1822.introduction',
  designPurpose: 'erc1822.designPurpose',
  commonUsage: 'erc1822.commonUsage',

  functions: [
    {
      name: 'proxiableUUID',
      signature: 'proxiableUUID() → bytes32',
      type: 'read',
      params: [],
      returns: [
        { name: 'slot', type: 'bytes32', description: 'erc1822.fn.proxiableUUID.returns.slot' },
      ],
      description: 'erc1822.fn.proxiableUUID.desc',
      defaultSimValues: {},
    },
    {
      name: 'upgradeTo',
      signature: 'upgradeTo(address newImplementation)',
      type: 'write',
      params: [
        { name: 'newImplementation', type: 'address', description: 'erc1822.fn.upgradeTo.params.newImplementation' },
      ],
      description: 'erc1822.fn.upgradeTo.desc',
      defaultSimValues: { newImplementation: '0xNewImplAddress' },
    },
    {
      name: 'upgradeToAndCall',
      signature: 'upgradeToAndCall(address newImplementation, bytes memory data)',
      type: 'write',
      params: [
        { name: 'newImplementation', type: 'address', description: 'erc1822.fn.upgradeToAndCall.params.newImplementation' },
        { name: 'data', type: 'bytes', description: 'erc1822.fn.upgradeToAndCall.params.data' },
      ],
      description: 'erc1822.fn.upgradeToAndCall.desc',
      defaultSimValues: {
        newImplementation: '0xNewImplAddress',
        data: '0x',
      },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'admin',
      type: 'user',
      label: 'erc1822.node.admin',
      data: { address: '0xAdmin' },
      layoutHint: 'source',
    },
    {
      id: 'proxy-contract',
      type: 'proxy',
      label: 'erc1822.node.proxy',
      data: { implementation: '0xOldImpl' },
      layoutHint: 'center',
    },
    {
      id: 'old-implementation',
      type: 'contract',
      label: 'erc1822.node.oldImplementation',
      data: { functions: ['proxiableUUID'] },
      layoutHint: 'center',
    },
    {
      id: 'new-implementation',
      type: 'contract',
      label: 'erc1822.node.newImplementation',
      data: { functions: ['proxiableUUID', 'upgradeTo', 'upgradeToAndCall'] },
      layoutHint: 'sink',
    },
    {
      id: 'storage',
      type: 'storage',
      label: 'erc1822.node.storage',
      data: {
        slots: [
          { key: 'PROXIABLE_SLOT', label: 'keccak256("PROXIABLE") = 0xc5f16f0f…' },
          { key: 'implementation', label: 'address (stored at PROXIABLE_SLOT)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'fn-upgradeTo',
      type: 'function',
      label: 'upgradeTo()',
      data: { fnType: 'write', signature: 'upgradeTo(address newImplementation)' },
    },
    {
      id: 'event-upgraded',
      type: 'function',
      label: 'Upgraded event',
      data: { fnType: 'event', signature: 'Upgraded(address indexed implementation)' },
    },
  ],

  flowEdges: [
    {
      id: 'e-admin-fn',
      source: 'admin',
      target: 'fn-upgradeTo',
      type: 'animated',
      label: 'erc1822.edge.callUpgrade',
    },
    {
      id: 'e-fn-proxy',
      source: 'fn-upgradeTo',
      target: 'proxy-contract',
      type: 'animated',
    },
    {
      id: 'e-proxy-oldImpl',
      source: 'proxy-contract',
      target: 'old-implementation',
      type: 'labeled',
      label: 'erc1822.edge.verifyProxiableUUID',
    },
    {
      id: 'e-proxy-storage',
      source: 'proxy-contract',
      target: 'storage',
      type: 'labeled',
      label: 'erc1822.edge.writeSlot',
    },
    {
      id: 'e-proxy-newImpl',
      source: 'proxy-contract',
      target: 'new-implementation',
      type: 'fundFlow',
      label: 'erc1822.edge.pointToNew',
    },
    {
      id: 'e-proxy-event',
      source: 'proxy-contract',
      target: 'event-upgraded',
      type: 'labeled',
      label: 'erc1822.edge.emitUpgraded',
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
      id: 'uups-upgrade',
      name: 'erc1822.sim.uupsUpgrade.name',
      description: 'erc1822.sim.uupsUpgrade.desc',
      params: [
        {
          id: 'admin',
          label: 'erc1822.sim.uupsUpgrade.param.admin',
          type: 'address',
          defaultValue: '0xAdmin',
        },
        {
          id: 'newImpl',
          label: 'erc1822.sim.uupsUpgrade.param.newImpl',
          type: 'address',
          defaultValue: '0xImplV2',
        },
      ],
      steps: [
        {
          id: 'step-call-upgrade',
          description: 'erc1822.sim.uupsUpgrade.step.callUpgrade',
          mobileDescription: 'erc1822.sim.uupsUpgrade.step.callUpgrade.mobile',
          highlightNodes: ['admin', 'fn-upgradeTo'],
          highlightEdges: ['e-admin-fn'],
          valueChanges: { 'fn-upgradeTo.input': 'newImplementation = 0xImplV2' },
          durationMs: 1000,
        },
        {
          id: 'step-verify-uuid',
          description: 'erc1822.sim.uupsUpgrade.step.verifyUUID',
          mobileDescription: 'erc1822.sim.uupsUpgrade.step.verifyUUID.mobile',
          highlightNodes: ['fn-upgradeTo', 'proxy-contract', 'old-implementation'],
          highlightEdges: ['e-fn-proxy', 'e-proxy-oldImpl'],
          valueChanges: {
            'old-implementation.proxiableUUID': '0xc5f16f0f… (PROXIABLE) ✓',
            'proxy-contract.check': 'new impl supports proxiableUUID',
          },
          durationMs: 1300,
        },
        {
          id: 'step-write-slot',
          description: 'erc1822.sim.uupsUpgrade.step.writeSlot',
          mobileDescription: 'erc1822.sim.uupsUpgrade.step.writeSlot.mobile',
          highlightNodes: ['proxy-contract', 'storage'],
          highlightEdges: ['e-proxy-storage'],
          valueChanges: {
            'storage.PROXIABLE_SLOT': '0xOldImpl → 0xImplV2',
          },
          durationMs: 1200,
        },
        {
          id: 'step-point-new',
          description: 'erc1822.sim.uupsUpgrade.step.pointNew',
          mobileDescription: 'erc1822.sim.uupsUpgrade.step.pointNew.mobile',
          highlightNodes: ['proxy-contract', 'new-implementation', 'event-upgraded'],
          highlightEdges: ['e-proxy-newImpl', 'e-proxy-event'],
          valueChanges: {
            'proxy-contract.implementation': '0xImplV2',
            'event-upgraded.lastEvent': 'Upgraded(0xImplV2)',
          },
          durationMs: 1000,
        },
      ],
    },
  ],
};
