import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7786',
  name: 'ERC-7786',
  shortDescription: 'erc7786.short',
  category: 'cross-chain',
  entryType: 'standard',
  eipNumber: 7786,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7786',
  relatedSlugs: ['erc7683', 'erc165', 'erc1271'],
  sortOrder: 17786,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [7930],
  references: [
    { label: 'ERC-7786 Specification', url: 'https://eips.ethereum.org/EIPS/eip-7786', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc7786.introduction',
  designPurpose: 'erc7786.designPurpose',
  commonUsage: 'erc7786.commonUsage',

  functions: [
    {
      name: 'supportsAttribute',
      signature: 'supportsAttribute(bytes4 selector) → bool',
      type: 'read',
      params: [{ name: 'selector', type: 'bytes4', description: 'erc7786.fn.supportsAttribute.params.selector' }],
      returns: [{ name: 'supported', type: 'bool', description: 'erc7786.fn.supportsAttribute.returns.supported' }],
      description: 'erc7786.fn.supportsAttribute.desc',
      defaultSimValues: { selector: '0x39f87ba1' },
    },
    {
      name: 'sendMessage',
      signature:
        'sendMessage(bytes calldata recipient, bytes calldata payload, bytes[] calldata attributes) → bytes32',
      type: 'write',
      params: [
        { name: 'recipient', type: 'bytes', description: 'erc7786.fn.sendMessage.params.recipient' },
        { name: 'payload', type: 'bytes', description: 'erc7786.fn.sendMessage.params.payload' },
        { name: 'attributes', type: 'bytes[]', description: 'erc7786.fn.sendMessage.params.attributes' },
      ],
      returns: [{ name: 'sendId', type: 'bytes32', description: 'erc7786.fn.sendMessage.returns.sendId' }],
      description: 'erc7786.fn.sendMessage.desc',
      defaultSimValues: { recipient: '0xRecipient', payload: '0x', attributes: '[]' },
    },
    {
      name: 'receiveMessage',
      signature: 'receiveMessage(bytes32 receiveId, bytes calldata sender, bytes calldata payload) → bytes4',
      type: 'write',
      params: [
        { name: 'receiveId', type: 'bytes32', description: 'erc7786.fn.receiveMessage.params.receiveId' },
        { name: 'sender', type: 'bytes', description: 'erc7786.fn.receiveMessage.params.sender' },
        { name: 'payload', type: 'bytes', description: 'erc7786.fn.receiveMessage.params.payload' },
      ],
      returns: [{ name: 'selector', type: 'bytes4', description: 'erc7786.fn.receiveMessage.returns.selector' }],
      description: 'erc7786.fn.receiveMessage.desc',
      defaultSimValues: { receiveId: '0xReceiveId', sender: '0xSender', payload: '0x' },
    },
    {
      name: 'MessageSent',
      signature:
        'MessageSent(bytes32 indexed sendId, bytes sender, bytes recipient, bytes payload, uint256 value, bytes[] attributes)',
      type: 'event',
      params: [
        { name: 'sendId', type: 'bytes32', description: 'erc7786.fn.MessageSent.params.sendId' },
        { name: 'sender', type: 'bytes', description: 'erc7786.fn.MessageSent.params.sender' },
        { name: 'recipient', type: 'bytes', description: 'erc7786.fn.MessageSent.params.recipient' },
        { name: 'payload', type: 'bytes', description: 'erc7786.fn.MessageSent.params.payload' },
        { name: 'value', type: 'uint256', description: 'erc7786.fn.MessageSent.params.value' },
        { name: 'attributes', type: 'bytes[]', description: 'erc7786.fn.MessageSent.params.attributes' },
      ],
      description: 'erc7786.fn.MessageSent.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc7786.node.user',
      data: { address: '0xSender' },
      layoutHint: 'source',
    },
    {
      id: 'erc7786-contract',
      type: 'contract',
      label: 'erc7786.node.contract',
      data: { functions: ['sendMessage', 'supportsAttribute'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-sendMessage',
      type: 'function',
      label: 'sendMessage()',
      data: {
        fnType: 'write',
        signature:
          'sendMessage(bytes calldata recipient, bytes calldata payload, bytes[] calldata attributes) → bytes32',
      },
    },
    {
      id: 'event-messageSent',
      type: 'function',
      label: 'MessageSent event',
      data: {
        fnType: 'event',
        signature:
          'MessageSent(bytes32 indexed sendId, bytes sender, bytes recipient, bytes payload, uint256 value, bytes[] attributes)',
      },
    },
    {
      id: 'bridge',
      type: 'contract',
      label: 'erc7786.node.bridge',
      data: {},
    },
    {
      id: 'fn-receiveMessage',
      type: 'function',
      label: 'receiveMessage()',
      data: {
        fnType: 'write',
        signature: 'receiveMessage(bytes32 receiveId, bytes calldata sender, bytes calldata payload) → bytes4',
      },
    },
    {
      id: 'recipient',
      type: 'contract',
      label: 'erc7786.node.recipient',
      data: { functions: ['receiveMessage'] },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-sendMessage',
      source: 'user',
      target: 'fn-sendMessage',
      type: 'animated',
      label: 'erc7786.edge.callSendMessage',
    },
    { id: 'e-sendMessage-contract', source: 'fn-sendMessage', target: 'erc7786-contract', type: 'animated' },
    {
      id: 'e-contract-event',
      source: 'erc7786-contract',
      target: 'event-messageSent',
      type: 'labeled',
      label: 'erc7786.edge.emitMessageSent',
    },
    {
      id: 'e-contract-bridge',
      source: 'erc7786-contract',
      target: 'bridge',
      type: 'animated',
      label: 'erc7786.edge.relayMessage',
    },
    {
      id: 'e-bridge-recipient',
      source: 'bridge',
      target: 'fn-receiveMessage',
      type: 'animated',
      label: 'erc7786.edge.deliverMessage',
    },
    { id: 'e-receiveMessage-recipient', source: 'fn-receiveMessage', target: 'recipient', type: 'animated' },
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
      id: 'send-message-walkthrough',
      name: 'erc7786.sim.sendMessageWalkthrough.name',
      description: 'erc7786.sim.sendMessageWalkthrough.desc',
      params: [
        {
          id: 'recipient',
          label: 'erc7786.sim.sendMessageWalkthrough.param.recipient',
          type: 'address',
          defaultValue: '0xRecipient',
        },
        {
          id: 'payload',
          label: 'erc7786.sim.sendMessageWalkthrough.param.payload',
          type: 'select',
          options: [
            { label: 'Token transfer call', value: 'transfer' },
            { label: 'Governance vote', value: 'vote' },
          ],
          defaultValue: 'transfer',
        },
        {
          id: 'value',
          label: 'erc7786.sim.sendMessageWalkthrough.param.value',
          type: 'uint256',
          defaultValue: '0',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc7786.sim.sendMessageWalkthrough.step.call',
          mobileDescription: 'erc7786.sim.sendMessageWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-sendMessage'],
          highlightEdges: ['e-user-sendMessage'],
          durationMs: 1000,
        },
        {
          id: 'step-emit',
          description: 'erc7786.sim.sendMessageWalkthrough.step.emit',
          mobileDescription: 'erc7786.sim.sendMessageWalkthrough.step.emit.mobile',
          highlightNodes: ['fn-sendMessage', 'erc7786-contract', 'event-messageSent'],
          highlightEdges: ['e-sendMessage-contract', 'e-contract-event'],
          valueChanges: { 'event-messageSent.sendId': '0x0 → 0xSendId' },
          durationMs: 1200,
        },
        {
          id: 'step-relay',
          description: 'erc7786.sim.sendMessageWalkthrough.step.relay',
          mobileDescription: 'erc7786.sim.sendMessageWalkthrough.step.relay.mobile',
          highlightNodes: ['erc7786-contract', 'bridge'],
          highlightEdges: ['e-contract-bridge'],
          durationMs: 1000,
        },
        {
          id: 'step-receive',
          description: 'erc7786.sim.sendMessageWalkthrough.step.receive',
          mobileDescription: 'erc7786.sim.sendMessageWalkthrough.step.receive.mobile',
          highlightNodes: ['bridge', 'fn-receiveMessage', 'recipient'],
          highlightEdges: ['e-bridge-recipient', 'e-receiveMessage-recipient'],
          valueChanges: { 'recipient.returned': '0x2432ef26' },
          durationMs: 900,
        },
      ],
    },
  ],
};
