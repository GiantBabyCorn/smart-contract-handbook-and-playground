import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc3525',
  name: 'ERC-3525 (SFT)',
  shortDescription: 'erc3525.short',
  category: 'token',
  entryType: 'standard',
  eipNumber: 3525,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-3525',
  relatedSlugs: ['erc20', 'erc721', 'erc1155', 'erc2981'],
  sortOrder: 1600,

  // ─── ERCContent ───
  introduction: 'erc3525.introduction',
  designPurpose: 'erc3525.designPurpose',
  commonUsage: 'erc3525.commonUsage',

  functions: [
    {
      name: 'valueDecimals',
      signature: 'valueDecimals() → uint8',
      type: 'read',
      params: [],
      returns: [{ name: 'decimals', type: 'uint8', description: 'erc3525.fn.valueDecimals.returns.decimals' }],
      description: 'erc3525.fn.valueDecimals.desc',
      defaultSimValues: {},
    },
    {
      name: 'valueOf',
      signature: 'valueOf(uint256 tokenId) → uint256',
      type: 'read',
      params: [{ name: 'tokenId', type: 'uint256', description: 'erc3525.fn.valueOf.params.tokenId' }],
      returns: [{ name: 'value', type: 'uint256', description: 'erc3525.fn.valueOf.returns.value' }],
      description: 'erc3525.fn.valueOf.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'slotOf',
      signature: 'slotOf(uint256 tokenId) → uint256',
      type: 'read',
      params: [{ name: 'tokenId', type: 'uint256', description: 'erc3525.fn.slotOf.params.tokenId' }],
      returns: [{ name: 'slot', type: 'uint256', description: 'erc3525.fn.slotOf.returns.slot' }],
      description: 'erc3525.fn.slotOf.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'approve',
      signature: 'approve(uint256 tokenId, address to, uint256 value)',
      type: 'write',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc3525.fn.approve.params.tokenId' },
        { name: 'to', type: 'address', description: 'erc3525.fn.approve.params.to' },
        { name: 'value', type: 'uint256', description: 'erc3525.fn.approve.params.value' },
      ],
      description: 'erc3525.fn.approve.desc',
      defaultSimValues: { tokenId: '1', to: '0xSpender', value: '500000000000000000000' },
    },
    {
      name: 'allowance',
      signature: 'allowance(uint256 tokenId, address operator) → uint256',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc3525.fn.allowance.params.tokenId' },
        { name: 'operator', type: 'address', description: 'erc3525.fn.allowance.params.operator' },
      ],
      returns: [{ name: 'value', type: 'uint256', description: 'erc3525.fn.allowance.returns.value' }],
      description: 'erc3525.fn.allowance.desc',
      defaultSimValues: { tokenId: '1', operator: '0xOperator' },
    },
    {
      name: 'transferValueFrom',
      signature: 'transferValueFrom(uint256 fromTokenId, uint256 toTokenId, uint256 value)',
      type: 'write',
      params: [
        { name: 'fromTokenId', type: 'uint256', description: 'erc3525.fn.transferValueFrom.params.fromTokenId' },
        { name: 'toTokenId', type: 'uint256', description: 'erc3525.fn.transferValueFrom.params.toTokenId' },
        { name: 'value', type: 'uint256', description: 'erc3525.fn.transferValueFrom.params.value' },
      ],
      description: 'erc3525.fn.transferValueFrom.desc',
      defaultSimValues: { fromTokenId: '1', toTokenId: '2', value: '250000000000000000000' },
    },
    {
      name: 'TransferValue',
      signature: 'TransferValue(uint256 indexed fromTokenId, uint256 indexed toTokenId, uint256 value)',
      type: 'event',
      params: [
        { name: 'fromTokenId', type: 'uint256', description: 'erc3525.fn.TransferValue.params.fromTokenId' },
        { name: 'toTokenId', type: 'uint256', description: 'erc3525.fn.TransferValue.params.toTokenId' },
        { name: 'value', type: 'uint256', description: 'erc3525.fn.TransferValue.params.value' },
      ],
      description: 'erc3525.fn.TransferValue.desc',
    },
    {
      name: 'ApprovalValue',
      signature: 'ApprovalValue(uint256 indexed tokenId, address indexed operator, uint256 value)',
      type: 'event',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc3525.fn.ApprovalValue.params.tokenId' },
        { name: 'operator', type: 'address', description: 'erc3525.fn.ApprovalValue.params.operator' },
        { name: 'value', type: 'uint256', description: 'erc3525.fn.ApprovalValue.params.value' },
      ],
      description: 'erc3525.fn.ApprovalValue.desc',
    },
    {
      name: 'SlotChanged',
      signature: 'SlotChanged(uint256 indexed tokenId, uint256 indexed oldSlot, uint256 indexed newSlot)',
      type: 'event',
      params: [
        { name: 'tokenId', type: 'uint256', description: 'erc3525.fn.SlotChanged.params.tokenId' },
        { name: 'oldSlot', type: 'uint256', description: 'erc3525.fn.SlotChanged.params.oldSlot' },
        { name: 'newSlot', type: 'uint256', description: 'erc3525.fn.SlotChanged.params.newSlot' },
      ],
      description: 'erc3525.fn.SlotChanged.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'holder',
      type: 'user',
      label: 'erc3525.node.holder',
      data: { address: '0xHolder', balance: 'tokenId #1 (slot 5, value 1000)' },
      layoutHint: 'source',
    },
    {
      id: 'erc3525-contract',
      type: 'contract',
      label: 'erc3525.node.contract',
      data: {
        functions: [
          'valueDecimals', 'valueOf', 'slotOf', 'approve',
          'allowance', 'transferValueFrom',
          'balanceOf', 'ownerOf', 'safeTransferFrom',
        ],
      },
      layoutHint: 'center',
    },
    {
      id: 'recipient',
      type: 'user',
      label: 'erc3525.node.recipient',
      data: { address: '0xRecipient', balance: 'tokenId #2 (slot 5, value 0)' },
      layoutHint: 'sink',
    },
    {
      id: 'storage-slot-value',
      type: 'storage',
      label: 'erc3525.node.storageSlotValue',
      data: {
        slots: [
          { key: '_values', label: 'mapping(uint256 tokenId => uint256 value)' },
          { key: '_slots', label: 'mapping(uint256 tokenId => uint256 slot)' },
          { key: '_valueApprovals', label: 'mapping(uint256 tokenId => mapping(address => uint256))' },
          { key: '_owners', label: 'mapping(uint256 tokenId => address)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'fn-transferValueFrom',
      type: 'function',
      label: 'transferValueFrom()',
      data: { fnType: 'write', signature: 'transferValueFrom(uint256 fromTokenId, uint256 toTokenId, uint256 value)' },
    },
    {
      id: 'fn-approve-value',
      type: 'function',
      label: 'approve(tokenId, addr, value)',
      data: { fnType: 'write', signature: 'approve(uint256 tokenId, address to, uint256 value)' },
    },
    {
      id: 'slot-validator',
      type: 'contract',
      label: 'erc3525.node.slotValidator',
      data: { functions: ['onERC3525Received'] },
      layoutHint: 'center',
    },
    {
      id: 'event-transfer-value',
      type: 'function',
      label: 'TransferValue event',
      data: { fnType: 'event', signature: 'TransferValue(uint256 indexed fromTokenId, uint256 indexed toTokenId, uint256 value)' },
    },
    {
      id: 'event-approval-value',
      type: 'function',
      label: 'ApprovalValue event',
      data: { fnType: 'event', signature: 'ApprovalValue(uint256 indexed tokenId, address indexed operator, uint256 value)' },
    },
  ],

  flowEdges: [
    {
      id: 'e-holder-transferValue',
      source: 'holder',
      target: 'fn-transferValueFrom',
      type: 'animated',
      label: 'erc3525.edge.callTransferValue',
    },
    {
      id: 'e-transferValue-contract',
      source: 'fn-transferValueFrom',
      target: 'erc3525-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc3525-contract',
      target: 'storage-slot-value',
      type: 'labeled',
      label: 'erc3525.edge.updateValues',
    },
    {
      id: 'e-contract-validator',
      source: 'erc3525-contract',
      target: 'slot-validator',
      type: 'labeled',
      label: 'erc3525.edge.validateSlot',
    },
    {
      id: 'e-contract-recipient',
      source: 'erc3525-contract',
      target: 'recipient',
      type: 'fundFlow',
      label: 'erc3525.edge.valueTransferred',
    },
    {
      id: 'e-holder-approve',
      source: 'holder',
      target: 'fn-approve-value',
      type: 'animated',
      label: 'erc3525.edge.callApproveValue',
    },
    {
      id: 'e-approve-contract',
      source: 'fn-approve-value',
      target: 'erc3525-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-event-transfer',
      source: 'erc3525-contract',
      target: 'event-transfer-value',
      type: 'labeled',
      label: 'erc3525.edge.emitTransferValue',
    },
    {
      id: 'e-contract-event-approval',
      source: 'erc3525-contract',
      target: 'event-approval-value',
      type: 'labeled',
      label: 'erc3525.edge.emitApprovalValue',
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
      id: 'value-transfer-sft',
      name: 'erc3525.sim.valueTransfer.name',
      description: 'erc3525.sim.valueTransfer.desc',
      params: [
        {
          id: 'fromTokenId',
          label: 'erc3525.sim.valueTransfer.param.fromTokenId',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'toTokenId',
          label: 'erc3525.sim.valueTransfer.param.toTokenId',
          type: 'uint256',
          defaultValue: '2',
        },
        {
          id: 'value',
          label: 'erc3525.sim.valueTransfer.param.value',
          type: 'uint256',
          defaultValue: '500000000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-check-slot',
          description: 'erc3525.sim.valueTransfer.step.checkSlot',
          mobileDescription: 'erc3525.sim.valueTransfer.step.checkSlot.mobile',
          highlightNodes: ['holder', 'erc3525-contract', 'storage-slot-value'],
          highlightEdges: [],
          valueChanges: {
            'storage-slot-value._slots[1]': 'slot 5',
            'storage-slot-value._slots[2]': 'slot 5 (must match)',
            'storage-slot-value._values[1]': '1000',
          },
          durationMs: 1000,
        },
        {
          id: 'step-call',
          description: 'erc3525.sim.valueTransfer.step.call',
          mobileDescription: 'erc3525.sim.valueTransfer.step.call.mobile',
          highlightNodes: ['holder', 'fn-transferValueFrom'],
          highlightEdges: ['e-holder-transferValue'],
          durationMs: 900,
        },
        {
          id: 'step-validate-and-update',
          description: 'erc3525.sim.valueTransfer.step.validateAndUpdate',
          mobileDescription: 'erc3525.sim.valueTransfer.step.validateAndUpdate.mobile',
          highlightNodes: ['fn-transferValueFrom', 'erc3525-contract', 'slot-validator', 'storage-slot-value'],
          highlightEdges: ['e-transferValue-contract', 'e-contract-validator', 'e-contract-storage'],
          valueChanges: {
            'storage-slot-value._values[1]': '1000 → 500',
            'storage-slot-value._values[2]': '0 → 500',
          },
          durationMs: 1500,
        },
        {
          id: 'step-recipient-updated',
          description: 'erc3525.sim.valueTransfer.step.recipientUpdated',
          mobileDescription: 'erc3525.sim.valueTransfer.step.recipientUpdated.mobile',
          highlightNodes: ['erc3525-contract', 'recipient', 'event-transfer-value'],
          highlightEdges: ['e-contract-recipient', 'e-contract-event-transfer'],
          valueChanges: { 'recipient.balance': 'tokenId #2 (slot 5, value 500)' },
          durationMs: 1000,
        },
      ],
    },
    {
      id: 'value-approval',
      name: 'erc3525.sim.valueApproval.name',
      description: 'erc3525.sim.valueApproval.desc',
      params: [
        {
          id: 'tokenId',
          label: 'erc3525.sim.valueApproval.param.tokenId',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'operator',
          label: 'erc3525.sim.valueApproval.param.operator',
          type: 'address',
          defaultValue: '0xDeFiProtocol',
        },
        {
          id: 'approvedValue',
          label: 'erc3525.sim.valueApproval.param.approvedValue',
          type: 'uint256',
          defaultValue: '300000000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-approve',
          description: 'erc3525.sim.valueApproval.step.approve',
          highlightNodes: ['holder', 'fn-approve-value'],
          highlightEdges: ['e-holder-approve'],
          durationMs: 1000,
        },
        {
          id: 'step-store-allowance',
          description: 'erc3525.sim.valueApproval.step.storeAllowance',
          highlightNodes: ['fn-approve-value', 'erc3525-contract', 'storage-slot-value'],
          highlightEdges: ['e-approve-contract', 'e-contract-storage'],
          valueChanges: { 'storage-slot-value._valueApprovals[1][0xDeFiProtocol]': '0 → 300e18' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc3525.sim.valueApproval.step.event',
          highlightNodes: ['erc3525-contract', 'event-approval-value'],
          highlightEdges: ['e-contract-event-approval'],
          durationMs: 700,
        },
      ],
    },
  ],
};
