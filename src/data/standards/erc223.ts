import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc223',
  name: 'ERC-223',
  shortDescription: 'erc223.short',
  category: 'token',
  entryType: 'standard',
  eipNumber: 223,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-223',
  relatedSlugs: ['erc20', 'erc721', 'erc1155'],
  sortOrder: 10223,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  relations: [{ slug: 'erc20', kind: 'alternative' }],
  references: [
    { label: 'ERC-223 Specification', url: 'https://eips.ethereum.org/EIPS/eip-223', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc223.introduction',
  designPurpose: 'erc223.designPurpose',
  commonUsage: 'erc223.commonUsage',

  functions: [
    {
      name: 'totalSupply',
      signature: 'totalSupply() → uint256',
      type: 'read',
      params: [],
      returns: [{ name: 'supply', type: 'uint256', description: 'erc223.fn.totalSupply.returns.supply' }],
      description: 'erc223.fn.totalSupply.desc',
      defaultSimValues: {},
    },
    {
      name: 'balanceOf',
      signature: 'balanceOf(address _owner) → uint256',
      type: 'read',
      params: [{ name: 'owner', type: 'address', description: 'erc223.fn.balanceOf.params.owner' }],
      returns: [{ name: 'balance', type: 'uint256', description: 'erc223.fn.balanceOf.returns.balance' }],
      description: 'erc223.fn.balanceOf.desc',
      defaultSimValues: { owner: '0xYourAddress' },
    },
    {
      name: 'transfer',
      signature: 'transfer(address _to, uint _value) → bool',
      type: 'write',
      params: [
        { name: 'to', type: 'address', description: 'erc223.fn.transfer.params.to' },
        { name: 'value', type: 'uint', description: 'erc223.fn.transfer.params.value' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc223.fn.transfer.returns.success' }],
      description: 'erc223.fn.transfer.desc',
      defaultSimValues: { to: '0xRecipient', value: '1000000000000000000' },
    },
    {
      name: 'transfer',
      signature: 'transfer(address _to, uint _value, bytes calldata _data) → bool',
      type: 'write',
      params: [
        { name: 'to', type: 'address', description: 'erc223.fn.transferData.params.to' },
        { name: 'value', type: 'uint', description: 'erc223.fn.transferData.params.value' },
        { name: 'data', type: 'bytes', description: 'erc223.fn.transferData.params.data' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc223.fn.transferData.returns.success' }],
      description: 'erc223.fn.transferData.desc',
      defaultSimValues: { to: '0xRecipient', value: '1000000000000000000', data: '0x' },
    },
    {
      name: 'tokenReceived',
      signature: 'tokenReceived(address _from, uint _value, bytes calldata _data) → bytes4',
      type: 'write',
      params: [
        { name: 'from', type: 'address', description: 'erc223.fn.tokenReceived.params.from' },
        { name: 'value', type: 'uint', description: 'erc223.fn.tokenReceived.params.value' },
        { name: 'data', type: 'bytes', description: 'erc223.fn.tokenReceived.params.data' },
      ],
      returns: [{ name: 'magic', type: 'bytes4', description: 'erc223.fn.tokenReceived.returns.magic' }],
      description: 'erc223.fn.tokenReceived.desc',
      defaultSimValues: { from: '0xSender', value: '1000000000000000000', data: '0x' },
    },
    {
      name: 'Transfer',
      signature: 'Transfer(address indexed _from, address indexed _to, uint256 _value, bytes _data)',
      type: 'event',
      params: [
        { name: 'from', type: 'address', description: 'erc223.fn.Transfer.params.from' },
        { name: 'to', type: 'address', description: 'erc223.fn.Transfer.params.to' },
        { name: 'value', type: 'uint256', description: 'erc223.fn.Transfer.params.value' },
        { name: 'data', type: 'bytes', description: 'erc223.fn.Transfer.params.data' },
      ],
      description: 'erc223.fn.Transfer.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc223.node.user',
      data: { address: '0xSender', balance: '1000 TOKEN' },
      layoutHint: 'source',
    },
    {
      id: 'erc223-contract',
      type: 'contract',
      label: 'erc223.node.contract',
      data: { functions: ['transfer', 'balanceOf', 'totalSupply', 'tokenReceived'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-transfer',
      type: 'function',
      label: 'transfer()',
      data: { fnType: 'write', signature: 'transfer(address _to, uint _value, bytes calldata _data) → bool' },
    },
    {
      id: 'storage-balances',
      type: 'storage',
      label: 'erc223.node.storageBalances',
      data: {
        slots: [
          { key: 'balances', label: 'mapping(address => uint256)' },
          { key: '_totalSupply', label: 'uint256' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'fn-tokenReceived',
      type: 'function',
      label: 'tokenReceived()',
      data: { fnType: 'write', signature: 'tokenReceived(address _from, uint _value, bytes calldata _data) → bytes4' },
    },
    {
      id: 'recipient',
      type: 'user',
      label: 'erc223.node.recipient',
      data: { address: '0xRecipient', balance: '0 TOKEN' },
      layoutHint: 'sink',
    },
    {
      id: 'event-transfer',
      type: 'function',
      label: 'Transfer event',
      data: { fnType: 'event', signature: 'Transfer(address indexed _from, address indexed _to, uint256 _value, bytes _data)' },
    },
  ],

  flowEdges: [
    {
      id: 'e-user-transfer',
      source: 'user',
      target: 'fn-transfer',
      type: 'animated',
      label: 'erc223.edge.callTransfer',
    },
    {
      id: 'e-transfer-contract',
      source: 'fn-transfer',
      target: 'erc223-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc223-contract',
      target: 'storage-balances',
      type: 'labeled',
      label: 'erc223.edge.updateBalances',
    },
    {
      id: 'e-contract-tokenReceived',
      source: 'erc223-contract',
      target: 'fn-tokenReceived',
      type: 'labeled',
      label: 'erc223.edge.callTokenReceived',
    },
    {
      id: 'e-tokenReceived-recipient',
      source: 'fn-tokenReceived',
      target: 'recipient',
      type: 'animated',
    },
    {
      id: 'e-contract-event',
      source: 'erc223-contract',
      target: 'event-transfer',
      type: 'labeled',
      label: 'erc223.edge.emitTransfer',
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
      id: 'token-transfer-walkthrough',
      name: 'erc223.sim.tokenTransferWalkthrough.name',
      description: 'erc223.sim.tokenTransferWalkthrough.desc',
      params: [
        {
          id: 'to',
          label: 'erc223.sim.tokenTransferWalkthrough.param.to',
          type: 'address',
          defaultValue: '0xRecipient',
        },
        {
          id: 'value',
          label: 'erc223.sim.tokenTransferWalkthrough.param.value',
          type: 'uint256',
          defaultValue: '1000000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc223.sim.tokenTransferWalkthrough.step.call',
          mobileDescription: 'erc223.sim.tokenTransferWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-transfer'],
          highlightEdges: ['e-user-transfer'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc223.sim.tokenTransferWalkthrough.step.execute',
          mobileDescription: 'erc223.sim.tokenTransferWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-transfer', 'erc223-contract', 'storage-balances'],
          highlightEdges: ['e-transfer-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-balances.balances[sender]': '1000e18 → 999e18',
            'storage-balances.balances[recipient]': '0 → 1e18',
          },
          durationMs: 1200,
        },
        {
          id: 'step-notify',
          description: 'erc223.sim.tokenTransferWalkthrough.step.notify',
          mobileDescription: 'erc223.sim.tokenTransferWalkthrough.step.notify.mobile',
          highlightNodes: ['erc223-contract', 'fn-tokenReceived', 'recipient'],
          highlightEdges: ['e-contract-tokenReceived', 'e-tokenReceived-recipient'],
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc223.sim.tokenTransferWalkthrough.step.event',
          mobileDescription: 'erc223.sim.tokenTransferWalkthrough.step.event.mobile',
          highlightNodes: ['erc223-contract', 'event-transfer'],
          highlightEdges: ['e-contract-event'],
          durationMs: 800,
        },
      ],
    },
  ],
};
