import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc8001',
  name: 'ERC-8001',
  shortDescription: 'erc8001.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 8001,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-8001',
  relatedSlugs: ['erc1271', 'erc5267', 'erc2098', 'erc7683'],
  sortOrder: 18001,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [712, 1271, 2098, 5267],
  relations: [
    { slug: 'erc1271', kind: 'requires' },
    { slug: 'erc2098', kind: 'requires' },
    { slug: 'erc5267', kind: 'requires' },
    { slug: 'erc7683', kind: 'alternative' },
  ],
  references: [
    { label: 'ERC-8001 Specification', url: 'https://eips.ethereum.org/EIPS/eip-8001', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc8001.introduction',
  designPurpose: 'erc8001.designPurpose',
  commonUsage: 'erc8001.commonUsage',

  functions: [
    {
      name: 'proposeCoordination',
      signature:
        'proposeCoordination(AgentIntent intent, bytes signature, CoordinationPayload payload) → bytes32 intentHash',
      type: 'write',
      params: [
        { name: 'intent', type: 'AgentIntent', description: 'erc8001.fn.proposeCoordination.params.intent' },
        { name: 'signature', type: 'bytes', description: 'erc8001.fn.proposeCoordination.params.signature' },
        { name: 'payload', type: 'CoordinationPayload', description: 'erc8001.fn.proposeCoordination.params.payload' },
      ],
      returns: [{ name: 'intentHash', type: 'bytes32', description: 'erc8001.fn.proposeCoordination.returns.intentHash' }],
      description: 'erc8001.fn.proposeCoordination.desc',
      defaultSimValues: { signature: '0xSig' },
    },
    {
      name: 'acceptCoordination',
      signature: 'acceptCoordination(bytes32 intentHash, AcceptanceAttestation attestation) → bool allAccepted',
      type: 'write',
      params: [
        { name: 'intentHash', type: 'bytes32', description: 'erc8001.fn.acceptCoordination.params.intentHash' },
        { name: 'attestation', type: 'AcceptanceAttestation', description: 'erc8001.fn.acceptCoordination.params.attestation' },
      ],
      returns: [{ name: 'allAccepted', type: 'bool', description: 'erc8001.fn.acceptCoordination.returns.allAccepted' }],
      description: 'erc8001.fn.acceptCoordination.desc',
      defaultSimValues: { intentHash: '0xIntentHash' },
    },
    {
      name: 'executeCoordination',
      signature:
        'executeCoordination(bytes32 intentHash, CoordinationPayload payload, bytes executionData) → (bool success, bytes result)',
      type: 'write',
      params: [
        { name: 'intentHash', type: 'bytes32', description: 'erc8001.fn.executeCoordination.params.intentHash' },
        { name: 'payload', type: 'CoordinationPayload', description: 'erc8001.fn.executeCoordination.params.payload' },
        { name: 'executionData', type: 'bytes', description: 'erc8001.fn.executeCoordination.params.executionData' },
      ],
      returns: [
        { name: 'success', type: 'bool', description: 'erc8001.fn.executeCoordination.returns.success' },
        { name: 'result', type: 'bytes', description: 'erc8001.fn.executeCoordination.returns.result' },
      ],
      description: 'erc8001.fn.executeCoordination.desc',
      defaultSimValues: { intentHash: '0xIntentHash', executionData: '0x' },
    },
    {
      name: 'cancelCoordination',
      signature: 'cancelCoordination(bytes32 intentHash, string reason)',
      type: 'write',
      params: [
        { name: 'intentHash', type: 'bytes32', description: 'erc8001.fn.cancelCoordination.params.intentHash' },
        { name: 'reason', type: 'string', description: 'erc8001.fn.cancelCoordination.params.reason' },
      ],
      description: 'erc8001.fn.cancelCoordination.desc',
      defaultSimValues: { intentHash: '0xIntentHash', reason: 'superseded' },
    },
    {
      name: 'getCoordinationStatus',
      signature:
        'getCoordinationStatus(bytes32 intentHash) → (Status status, address proposer, address[] participants, address[] acceptedBy, uint256 expiry)',
      type: 'read',
      params: [{ name: 'intentHash', type: 'bytes32', description: 'erc8001.fn.getCoordinationStatus.params.intentHash' }],
      returns: [
        { name: 'status', type: 'Status', description: 'erc8001.fn.getCoordinationStatus.returns.status' },
        { name: 'proposer', type: 'address', description: 'erc8001.fn.getCoordinationStatus.returns.proposer' },
        { name: 'participants', type: 'address[]', description: 'erc8001.fn.getCoordinationStatus.returns.participants' },
        { name: 'acceptedBy', type: 'address[]', description: 'erc8001.fn.getCoordinationStatus.returns.acceptedBy' },
        { name: 'expiry', type: 'uint256', description: 'erc8001.fn.getCoordinationStatus.returns.expiry' },
      ],
      description: 'erc8001.fn.getCoordinationStatus.desc',
      defaultSimValues: { intentHash: '0xIntentHash' },
    },
    {
      name: 'CoordinationProposed',
      signature:
        'CoordinationProposed(bytes32 indexed intentHash, address indexed proposer, bytes32 coordinationType, uint256 participantCount, uint256 coordinationValue)',
      type: 'event',
      params: [
        { name: 'intentHash', type: 'bytes32', description: 'erc8001.fn.CoordinationProposed.params.intentHash' },
        { name: 'proposer', type: 'address', description: 'erc8001.fn.CoordinationProposed.params.proposer' },
        { name: 'coordinationType', type: 'bytes32', description: 'erc8001.fn.CoordinationProposed.params.coordinationType' },
        { name: 'participantCount', type: 'uint256', description: 'erc8001.fn.CoordinationProposed.params.participantCount' },
        { name: 'coordinationValue', type: 'uint256', description: 'erc8001.fn.CoordinationProposed.params.coordinationValue' },
      ],
      description: 'erc8001.fn.CoordinationProposed.desc',
    },
    {
      name: 'CoordinationAccepted',
      signature:
        'CoordinationAccepted(bytes32 indexed intentHash, address indexed participant, bytes32 acceptanceHash, uint256 acceptedCount, uint256 requiredCount)',
      type: 'event',
      params: [
        { name: 'intentHash', type: 'bytes32', description: 'erc8001.fn.CoordinationAccepted.params.intentHash' },
        { name: 'participant', type: 'address', description: 'erc8001.fn.CoordinationAccepted.params.participant' },
        { name: 'acceptanceHash', type: 'bytes32', description: 'erc8001.fn.CoordinationAccepted.params.acceptanceHash' },
        { name: 'acceptedCount', type: 'uint256', description: 'erc8001.fn.CoordinationAccepted.params.acceptedCount' },
        { name: 'requiredCount', type: 'uint256', description: 'erc8001.fn.CoordinationAccepted.params.requiredCount' },
      ],
      description: 'erc8001.fn.CoordinationAccepted.desc',
    },
    {
      name: 'CoordinationExecuted',
      signature:
        'CoordinationExecuted(bytes32 indexed intentHash, address indexed executor, bool success, uint256 gasUsed, bytes result)',
      type: 'event',
      params: [
        { name: 'intentHash', type: 'bytes32', description: 'erc8001.fn.CoordinationExecuted.params.intentHash' },
        { name: 'executor', type: 'address', description: 'erc8001.fn.CoordinationExecuted.params.executor' },
        { name: 'success', type: 'bool', description: 'erc8001.fn.CoordinationExecuted.params.success' },
        { name: 'gasUsed', type: 'uint256', description: 'erc8001.fn.CoordinationExecuted.params.gasUsed' },
        { name: 'result', type: 'bytes', description: 'erc8001.fn.CoordinationExecuted.params.result' },
      ],
      description: 'erc8001.fn.CoordinationExecuted.desc',
    },
    {
      name: 'CoordinationCancelled',
      signature:
        'CoordinationCancelled(bytes32 indexed intentHash, address indexed canceller, string reason, uint8 finalStatus)',
      type: 'event',
      params: [
        { name: 'intentHash', type: 'bytes32', description: 'erc8001.fn.CoordinationCancelled.params.intentHash' },
        { name: 'canceller', type: 'address', description: 'erc8001.fn.CoordinationCancelled.params.canceller' },
        { name: 'reason', type: 'string', description: 'erc8001.fn.CoordinationCancelled.params.reason' },
        { name: 'finalStatus', type: 'uint8', description: 'erc8001.fn.CoordinationCancelled.params.finalStatus' },
      ],
      description: 'erc8001.fn.CoordinationCancelled.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc8001.node.user',
      data: { address: '0xInitiator' },
      layoutHint: 'source',
    },
    {
      id: 'erc8001-contract',
      type: 'contract',
      label: 'erc8001.node.contract',
      data: {
        functions: ['proposeCoordination', 'acceptCoordination', 'executeCoordination', 'cancelCoordination', 'getCoordinationStatus'],
      },
      layoutHint: 'center',
    },
    {
      id: 'fn-proposeCoordination',
      type: 'function',
      label: 'proposeCoordination()',
      data: {
        fnType: 'write',
        signature: 'proposeCoordination(AgentIntent intent, bytes signature, CoordinationPayload payload) → bytes32 intentHash',
      },
    },
    {
      id: 'fn-acceptCoordination',
      type: 'function',
      label: 'acceptCoordination()',
      data: {
        fnType: 'write',
        signature: 'acceptCoordination(bytes32 intentHash, AcceptanceAttestation attestation) → bool allAccepted',
      },
    },
    {
      id: 'storage-intents',
      type: 'storage',
      label: 'erc8001.node.storageIntents',
      data: {
        slots: [
          { key: '_intents', label: 'mapping(bytes32 => Intent)' },
          { key: '_agentNonces', label: 'mapping(address => uint64)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-proposed',
      type: 'function',
      label: 'CoordinationProposed event',
      data: {
        fnType: 'event',
        signature:
          'CoordinationProposed(bytes32 indexed intentHash, address indexed proposer, bytes32 coordinationType, uint256 participantCount, uint256 coordinationValue)',
      },
    },
    {
      id: 'participant',
      type: 'user',
      label: 'erc8001.node.participant',
      data: { address: '0xParticipant' },
      layoutHint: 'source',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-propose',
      source: 'user',
      target: 'fn-proposeCoordination',
      type: 'animated',
      label: 'erc8001.edge.callPropose',
    },
    {
      id: 'e-propose-contract',
      source: 'fn-proposeCoordination',
      target: 'erc8001-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc8001-contract',
      target: 'storage-intents',
      type: 'labeled',
      label: 'erc8001.edge.storeIntent',
    },
    {
      id: 'e-contract-event',
      source: 'erc8001-contract',
      target: 'event-proposed',
      type: 'labeled',
      label: 'erc8001.edge.emitProposed',
    },
    {
      id: 'e-participant-accept',
      source: 'participant',
      target: 'fn-acceptCoordination',
      type: 'animated',
      label: 'erc8001.edge.callAccept',
    },
    {
      id: 'e-accept-contract',
      source: 'fn-acceptCoordination',
      target: 'erc8001-contract',
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
      id: 'propose-coordination-walkthrough',
      name: 'erc8001.sim.proposeCoordinationWalkthrough.name',
      description: 'erc8001.sim.proposeCoordinationWalkthrough.desc',
      params: [
        {
          id: 'coordinationType',
          label: 'erc8001.sim.proposeCoordinationWalkthrough.param.coordinationType',
          type: 'select',
          options: [
            { label: 'MEV_SANDWICH_COORD_V1', value: 'MEV_SANDWICH_COORD_V1' },
            { label: 'LIQUIDATION_COORD_V1', value: 'LIQUIDATION_COORD_V1' },
          ],
          defaultValue: 'MEV_SANDWICH_COORD_V1',
        },
        {
          id: 'proposer',
          label: 'erc8001.sim.proposeCoordinationWalkthrough.param.proposer',
          type: 'address',
          defaultValue: '0xInitiator',
        },
        {
          id: 'expiry',
          label: 'erc8001.sim.proposeCoordinationWalkthrough.param.expiry',
          type: 'uint256',
          defaultValue: '1735689600',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc8001.sim.proposeCoordinationWalkthrough.step.call',
          mobileDescription: 'erc8001.sim.proposeCoordinationWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-proposeCoordination'],
          highlightEdges: ['e-user-propose'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc8001.sim.proposeCoordinationWalkthrough.step.execute',
          mobileDescription: 'erc8001.sim.proposeCoordinationWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-proposeCoordination', 'erc8001-contract', 'storage-intents'],
          highlightEdges: ['e-propose-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-intents._intents[intentHash]': 'None → Proposed',
            'storage-intents._agentNonces[0xInitiator]': '0 → 1',
          },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc8001.sim.proposeCoordinationWalkthrough.step.event',
          mobileDescription: 'erc8001.sim.proposeCoordinationWalkthrough.step.event.mobile',
          highlightNodes: ['erc8001-contract', 'event-proposed'],
          highlightEdges: ['e-contract-event'],
          valueChanges: {
            'event-proposed.lastEvent': 'CoordinationProposed(intentHash, 0xInitiator, MEV_SANDWICH_COORD_V1, 3, 0)',
          },
          durationMs: 800,
        },
      ],
    },
  ],
};
