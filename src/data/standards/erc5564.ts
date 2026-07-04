import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5564',
  name: 'ERC-5564',
  shortDescription: 'erc5564.short',
  category: 'identity',
  entryType: 'standard',
  eipNumber: 5564,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5564',
  relatedSlugs: ['erc4337', 'erc20', 'erc721', 'erc4361'],
  sortOrder: 15564,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-5564 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5564', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5564.introduction',
  designPurpose: 'erc5564.designPurpose',
  commonUsage: 'erc5564.commonUsage',

  functions: [
    {
      name: 'generateStealthAddress',
      signature:
        'generateStealthAddress(bytes memory stealthMetaAddress) → (address stealthAddress, bytes memory ephemeralPubKey, bytes1 viewTag)',
      type: 'read',
      params: [
        {
          name: 'stealthMetaAddress',
          type: 'bytes',
          description: 'erc5564.fn.generateStealthAddress.params.stealthMetaAddress',
        },
      ],
      returns: [
        { name: 'stealthAddress', type: 'address', description: 'erc5564.fn.generateStealthAddress.returns.stealthAddress' },
        { name: 'ephemeralPubKey', type: 'bytes', description: 'erc5564.fn.generateStealthAddress.returns.ephemeralPubKey' },
        { name: 'viewTag', type: 'bytes1', description: 'erc5564.fn.generateStealthAddress.returns.viewTag' },
      ],
      description: 'erc5564.fn.generateStealthAddress.desc',
      defaultSimValues: { stealthMetaAddress: '0xMetaAddress' },
    },
    {
      name: 'checkStealthAddress',
      signature:
        'checkStealthAddress(address stealthAddress, bytes memory ephemeralPubKey, bytes memory viewingKey, bytes memory spendingPubKey) → bool',
      type: 'read',
      params: [
        { name: 'stealthAddress', type: 'address', description: 'erc5564.fn.checkStealthAddress.params.stealthAddress' },
        { name: 'ephemeralPubKey', type: 'bytes', description: 'erc5564.fn.checkStealthAddress.params.ephemeralPubKey' },
        { name: 'viewingKey', type: 'bytes', description: 'erc5564.fn.checkStealthAddress.params.viewingKey' },
        { name: 'spendingPubKey', type: 'bytes', description: 'erc5564.fn.checkStealthAddress.params.spendingPubKey' },
      ],
      returns: [{ name: 'isRecipient', type: 'bool', description: 'erc5564.fn.checkStealthAddress.returns.isRecipient' }],
      description: 'erc5564.fn.checkStealthAddress.desc',
    },
    {
      name: 'computeStealthKey',
      signature:
        'computeStealthKey(address stealthAddress, bytes memory ephemeralPubKey, bytes memory viewingKey, bytes memory spendingKey) → bytes memory',
      type: 'read',
      params: [
        { name: 'stealthAddress', type: 'address', description: 'erc5564.fn.computeStealthKey.params.stealthAddress' },
        { name: 'ephemeralPubKey', type: 'bytes', description: 'erc5564.fn.computeStealthKey.params.ephemeralPubKey' },
        { name: 'viewingKey', type: 'bytes', description: 'erc5564.fn.computeStealthKey.params.viewingKey' },
        { name: 'spendingKey', type: 'bytes', description: 'erc5564.fn.computeStealthKey.params.spendingKey' },
      ],
      returns: [{ name: 'stealthKey', type: 'bytes', description: 'erc5564.fn.computeStealthKey.returns.stealthKey' }],
      description: 'erc5564.fn.computeStealthKey.desc',
    },
    {
      name: 'announce',
      signature:
        'announce(uint256 schemeId, address stealthAddress, bytes memory ephemeralPubKey, bytes memory metadata)',
      type: 'write',
      params: [
        { name: 'schemeId', type: 'uint256', description: 'erc5564.fn.announce.params.schemeId' },
        { name: 'stealthAddress', type: 'address', description: 'erc5564.fn.announce.params.stealthAddress' },
        { name: 'ephemeralPubKey', type: 'bytes', description: 'erc5564.fn.announce.params.ephemeralPubKey' },
        { name: 'metadata', type: 'bytes', description: 'erc5564.fn.announce.params.metadata' },
      ],
      description: 'erc5564.fn.announce.desc',
      defaultSimValues: { schemeId: '1', stealthAddress: '0xStealth', ephemeralPubKey: '0xEphemeral', metadata: '0x8f' },
    },
    {
      name: 'Announcement',
      signature:
        'Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)',
      type: 'event',
      params: [
        { name: 'schemeId', type: 'uint256', description: 'erc5564.fn.Announcement.params.schemeId' },
        { name: 'stealthAddress', type: 'address', description: 'erc5564.fn.Announcement.params.stealthAddress' },
        { name: 'caller', type: 'address', description: 'erc5564.fn.Announcement.params.caller' },
        { name: 'ephemeralPubKey', type: 'bytes', description: 'erc5564.fn.Announcement.params.ephemeralPubKey' },
        { name: 'metadata', type: 'bytes', description: 'erc5564.fn.Announcement.params.metadata' },
      ],
      description: 'erc5564.fn.Announcement.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5564.node.user',
      data: { address: '0xSender' },
      layoutHint: 'source',
    },
    {
      id: 'erc5564-contract',
      type: 'contract',
      label: 'erc5564.node.contract',
      data: { functions: ['announce'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-announce',
      type: 'function',
      label: 'announce()',
      data: {
        fnType: 'write',
        signature: 'announce(uint256 schemeId, address stealthAddress, bytes memory ephemeralPubKey, bytes memory metadata)',
      },
    },
    {
      id: 'event-announcement',
      type: 'function',
      label: 'Announcement event',
      data: {
        fnType: 'event',
        signature:
          'Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)',
      },
    },
    {
      id: 'recipient',
      type: 'user',
      label: 'erc5564.node.recipient',
      data: { address: '0xStealth' },
      layoutHint: 'sink',
    },
    {
      id: 'fn-check',
      type: 'function',
      label: 'checkStealthAddress()',
      data: {
        fnType: 'read',
        signature:
          'checkStealthAddress(address stealthAddress, bytes memory ephemeralPubKey, bytes memory viewingKey, bytes memory spendingPubKey) → bool',
      },
    },
  ],

  flowEdges: [
    { id: 'e-user-announce', source: 'user', target: 'fn-announce', type: 'animated', label: 'erc5564.edge.callAnnounce' },
    { id: 'e-announce-contract', source: 'fn-announce', target: 'erc5564-contract', type: 'animated' },
    { id: 'e-contract-event', source: 'erc5564-contract', target: 'event-announcement', type: 'labeled', label: 'erc5564.edge.emitAnnouncement' },
    { id: 'e-event-recipient', source: 'event-announcement', target: 'recipient', type: 'labeled', label: 'erc5564.edge.scanAnnouncement' },
    { id: 'e-recipient-check', source: 'recipient', target: 'fn-check', type: 'animated', label: 'erc5564.edge.callCheck' },
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
      id: 'announce-walkthrough',
      name: 'erc5564.sim.announceWalkthrough.name',
      description: 'erc5564.sim.announceWalkthrough.desc',
      params: [
        {
          id: 'schemeId',
          label: 'erc5564.sim.announceWalkthrough.param.schemeId',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'stealthAddress',
          label: 'erc5564.sim.announceWalkthrough.param.stealthAddress',
          type: 'address',
          defaultValue: '0xStealth',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5564.sim.announceWalkthrough.step.call',
          mobileDescription: 'erc5564.sim.announceWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-announce'],
          highlightEdges: ['e-user-announce'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc5564.sim.announceWalkthrough.step.execute',
          mobileDescription: 'erc5564.sim.announceWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-announce', 'erc5564-contract'],
          highlightEdges: ['e-announce-contract'],
          valueChanges: { 'erc5564-contract.caller': '0xSender' },
          durationMs: 1000,
        },
        {
          id: 'step-emit',
          description: 'erc5564.sim.announceWalkthrough.step.emit',
          mobileDescription: 'erc5564.sim.announceWalkthrough.step.emit.mobile',
          highlightNodes: ['erc5564-contract', 'event-announcement'],
          highlightEdges: ['e-contract-event'],
          valueChanges: { 'event-announcement.lastEvent': 'Announcement(1, 0xStealth, 0xSender, …)' },
          durationMs: 900,
        },
        {
          id: 'step-scan',
          description: 'erc5564.sim.announceWalkthrough.step.scan',
          mobileDescription: 'erc5564.sim.announceWalkthrough.step.scan.mobile',
          highlightNodes: ['event-announcement', 'recipient', 'fn-check'],
          highlightEdges: ['e-event-recipient', 'e-recipient-check'],
          valueChanges: { 'recipient.viewTagMatch': 'true' },
          durationMs: 1100,
        },
      ],
    },
  ],
};
