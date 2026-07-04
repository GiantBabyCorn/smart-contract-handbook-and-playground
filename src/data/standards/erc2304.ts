import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2304',
  name: 'ERC-2304',
  shortDescription: 'erc2304.short',
  category: 'identity',
  entryType: 'standard',
  eipNumber: 2304,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2304',
  relatedSlugs: ['erc165', 'erc55', 'erc681'],
  sortOrder: 12304,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [137],
  relations: [
    { slug: 'erc165', kind: 'usedWith' },
    { slug: 'erc55', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-2304 Specification', url: 'https://eips.ethereum.org/EIPS/eip-2304', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc2304.introduction',
  designPurpose: 'erc2304.designPurpose',
  commonUsage: 'erc2304.commonUsage',

  functions: [
    {
      name: 'addr',
      signature: 'addr(bytes32 node, uint coinType) → bytes',
      type: 'read',
      params: [
        { name: 'node', type: 'bytes32', description: 'erc2304.fn.addr.params.node' },
        { name: 'coinType', type: 'uint', description: 'erc2304.fn.addr.params.coinType' },
      ],
      returns: [{ name: 'address', type: 'bytes', description: 'erc2304.fn.addr.returns.address' }],
      description: 'erc2304.fn.addr.desc',
      defaultSimValues: { node: '0xNode', coinType: '60' },
    },
    {
      name: 'setAddr',
      signature: 'setAddr(bytes32 node, uint coinType, bytes addr)',
      type: 'write',
      params: [
        { name: 'node', type: 'bytes32', description: 'erc2304.fn.setAddr.params.node' },
        { name: 'coinType', type: 'uint', description: 'erc2304.fn.setAddr.params.coinType' },
        { name: 'addr', type: 'bytes', description: 'erc2304.fn.setAddr.params.addr' },
      ],
      description: 'erc2304.fn.setAddr.desc',
      defaultSimValues: {
        node: '0xNode',
        coinType: '60',
        addr: '0x314159265dD8dbb310642f98f50C066173C1259b',
      },
    },
    {
      name: 'AddressChanged',
      signature: 'AddressChanged(bytes32 indexed node, uint coinType, bytes newAddress)',
      type: 'event',
      params: [
        { name: 'node', type: 'bytes32', description: 'erc2304.fn.AddressChanged.params.node' },
        { name: 'coinType', type: 'uint', description: 'erc2304.fn.AddressChanged.params.coinType' },
        {
          name: 'newAddress',
          type: 'bytes',
          description: 'erc2304.fn.AddressChanged.params.newAddress',
        },
      ],
      description: 'erc2304.fn.AddressChanged.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc2304.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'erc2304-contract',
      type: 'contract',
      label: 'erc2304.node.contract',
      data: { functions: ['addr', 'setAddr'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-setAddr',
      type: 'function',
      label: 'setAddr()',
      data: { fnType: 'write', signature: 'setAddr(bytes32 node, uint coinType, bytes addr)' },
    },
    {
      id: 'fn-addr',
      type: 'function',
      label: 'addr()',
      data: { fnType: 'read', signature: 'addr(bytes32 node, uint coinType) → bytes' },
    },
    {
      id: 'storage-addresses',
      type: 'storage',
      label: 'erc2304.node.storageAddresses',
      data: { slots: [{ key: '_addresses', label: 'mapping(bytes32 => mapping(uint => bytes))' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-addressChanged',
      type: 'function',
      label: 'AddressChanged event',
      data: {
        fnType: 'event',
        signature: 'AddressChanged(bytes32 indexed node, uint coinType, bytes newAddress)',
      },
    },
    {
      id: 'wallet',
      type: 'user',
      label: 'erc2304.node.wallet',
      data: { address: '0xWallet' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-setAddr',
      source: 'user',
      target: 'fn-setAddr',
      type: 'animated',
      label: 'erc2304.edge.callSetAddr',
    },
    { id: 'e-setAddr-contract', source: 'fn-setAddr', target: 'erc2304-contract', type: 'animated' },
    {
      id: 'e-contract-storage',
      source: 'erc2304-contract',
      target: 'storage-addresses',
      type: 'labeled',
      label: 'erc2304.edge.updateAddresses',
    },
    {
      id: 'e-contract-event',
      source: 'erc2304-contract',
      target: 'event-addressChanged',
      type: 'labeled',
      label: 'erc2304.edge.emitAddressChanged',
    },
    {
      id: 'e-wallet-addr',
      source: 'wallet',
      target: 'fn-addr',
      type: 'animated',
      label: 'erc2304.edge.callAddr',
    },
    { id: 'e-addr-contract', source: 'fn-addr', target: 'erc2304-contract', type: 'animated' },
    {
      id: 'e-contract-wallet',
      source: 'erc2304-contract',
      target: 'wallet',
      type: 'labeled',
      label: 'erc2304.edge.returnAddress',
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
      id: 'set-addr-walkthrough',
      name: 'erc2304.sim.setAddrWalkthrough.name',
      description: 'erc2304.sim.setAddrWalkthrough.desc',
      params: [
        {
          id: 'node',
          label: 'erc2304.sim.setAddrWalkthrough.param.node',
          type: 'select',
          options: [
            { label: 'alice.eth', value: 'alice.eth' },
            { label: 'vault.eth', value: 'vault.eth' },
          ],
          defaultValue: 'alice.eth',
        },
        {
          id: 'coinType',
          label: 'erc2304.sim.setAddrWalkthrough.param.coinType',
          type: 'select',
          options: [
            { label: 'Bitcoin (0)', value: '0' },
            { label: 'Ethereum (60)', value: '60' },
            { label: 'Binance (714)', value: '714' },
          ],
          defaultValue: '60',
        },
        {
          id: 'addr',
          label: 'erc2304.sim.setAddrWalkthrough.param.addr',
          type: 'address',
          defaultValue: '0x314159265dD8dbb310642f98f50C066173C1259b',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc2304.sim.setAddrWalkthrough.step.call',
          mobileDescription: 'erc2304.sim.setAddrWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-setAddr'],
          highlightEdges: ['e-user-setAddr'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc2304.sim.setAddrWalkthrough.step.execute',
          mobileDescription: 'erc2304.sim.setAddrWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-setAddr', 'erc2304-contract', 'storage-addresses'],
          highlightEdges: ['e-setAddr-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-addresses._addresses': 'empty → 0x314159265dD8dbb310642f98f50C066173C1259b',
          },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc2304.sim.setAddrWalkthrough.step.event',
          mobileDescription: 'erc2304.sim.setAddrWalkthrough.step.event.mobile',
          highlightNodes: ['erc2304-contract', 'event-addressChanged'],
          highlightEdges: ['e-contract-event'],
          valueChanges: {
            'event-addressChanged.lastEvent': 'AddressChanged(alice.eth, 60, 0x314159…)',
          },
          durationMs: 800,
        },
      ],
    },
  ],
};
