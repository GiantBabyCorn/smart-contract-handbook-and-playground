import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc8004',
  name: 'ERC-8004',
  shortDescription: 'erc8004.short',
  category: 'identity',
  entryType: 'standard',
  eipNumber: 8004,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-8004',
  relatedSlugs: ['erc721', 'erc1271', 'erc5267', 'erc6551'],
  sortOrder: 18004,
  eipStatus: 'Draft',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [155, 712, 721, 1271],
  relations: [
    { slug: 'erc721', kind: 'requires' },
    { slug: 'erc1271', kind: 'requires' },
  ],
  references: [
    { label: 'ERC-8004 Specification', url: 'https://eips.ethereum.org/EIPS/eip-8004', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc8004.introduction',
  designPurpose: 'erc8004.designPurpose',
  commonUsage: 'erc8004.commonUsage',

  functions: [
    {
      name: 'register',
      signature: 'register(string agentURI) → uint256',
      type: 'write',
      params: [{ name: 'agentURI', type: 'string', description: 'erc8004.fn.register.params.agentURI' }],
      returns: [{ name: 'agentId', type: 'uint256', description: 'erc8004.fn.register.returns.agentId' }],
      description: 'erc8004.fn.register.desc',
      defaultSimValues: { agentURI: 'ipfs://cid' },
    },
    {
      name: 'setAgentURI',
      signature: 'setAgentURI(uint256 agentId, string newURI)',
      type: 'write',
      params: [
        { name: 'agentId', type: 'uint256', description: 'erc8004.fn.setAgentURI.params.agentId' },
        { name: 'newURI', type: 'string', description: 'erc8004.fn.setAgentURI.params.newURI' },
      ],
      description: 'erc8004.fn.setAgentURI.desc',
      defaultSimValues: { agentId: '1', newURI: 'ipfs://cid2' },
    },
    {
      name: 'setMetadata',
      signature: 'setMetadata(uint256 agentId, string metadataKey, bytes metadataValue)',
      type: 'write',
      params: [
        { name: 'agentId', type: 'uint256', description: 'erc8004.fn.setMetadata.params.agentId' },
        { name: 'metadataKey', type: 'string', description: 'erc8004.fn.setMetadata.params.metadataKey' },
        { name: 'metadataValue', type: 'bytes', description: 'erc8004.fn.setMetadata.params.metadataValue' },
      ],
      description: 'erc8004.fn.setMetadata.desc',
      defaultSimValues: { agentId: '1', metadataKey: 'website', metadataValue: '0x68747470' },
    },
    {
      name: 'setAgentWallet',
      signature: 'setAgentWallet(uint256 agentId, address newWallet, uint256 deadline, bytes signature)',
      type: 'write',
      params: [
        { name: 'agentId', type: 'uint256', description: 'erc8004.fn.setAgentWallet.params.agentId' },
        { name: 'newWallet', type: 'address', description: 'erc8004.fn.setAgentWallet.params.newWallet' },
        { name: 'deadline', type: 'uint256', description: 'erc8004.fn.setAgentWallet.params.deadline' },
        { name: 'signature', type: 'bytes', description: 'erc8004.fn.setAgentWallet.params.signature' },
      ],
      description: 'erc8004.fn.setAgentWallet.desc',
      defaultSimValues: { agentId: '1', newWallet: '0xWallet', deadline: '1735689600', signature: '0xSig' },
    },
    {
      name: 'giveFeedback',
      signature:
        'giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)',
      type: 'write',
      params: [
        { name: 'agentId', type: 'uint256', description: 'erc8004.fn.giveFeedback.params.agentId' },
        { name: 'value', type: 'int128', description: 'erc8004.fn.giveFeedback.params.value' },
        { name: 'valueDecimals', type: 'uint8', description: 'erc8004.fn.giveFeedback.params.valueDecimals' },
        { name: 'tag1', type: 'string', description: 'erc8004.fn.giveFeedback.params.tag1' },
        { name: 'tag2', type: 'string', description: 'erc8004.fn.giveFeedback.params.tag2' },
        { name: 'endpoint', type: 'string', description: 'erc8004.fn.giveFeedback.params.endpoint' },
        { name: 'feedbackURI', type: 'string', description: 'erc8004.fn.giveFeedback.params.feedbackURI' },
        { name: 'feedbackHash', type: 'bytes32', description: 'erc8004.fn.giveFeedback.params.feedbackHash' },
      ],
      description: 'erc8004.fn.giveFeedback.desc',
      defaultSimValues: { agentId: '1', value: '87', valueDecimals: '0', tag1: 'starred' },
    },
    {
      name: 'validationRequest',
      signature: 'validationRequest(address validatorAddress, uint256 agentId, string requestURI, bytes32 requestHash)',
      type: 'write',
      params: [
        { name: 'validatorAddress', type: 'address', description: 'erc8004.fn.validationRequest.params.validatorAddress' },
        { name: 'agentId', type: 'uint256', description: 'erc8004.fn.validationRequest.params.agentId' },
        { name: 'requestURI', type: 'string', description: 'erc8004.fn.validationRequest.params.requestURI' },
        { name: 'requestHash', type: 'bytes32', description: 'erc8004.fn.validationRequest.params.requestHash' },
      ],
      description: 'erc8004.fn.validationRequest.desc',
      defaultSimValues: { validatorAddress: '0xValidator', agentId: '1', requestURI: 'ipfs://req', requestHash: '0xReqHash' },
    },
    {
      name: 'validationResponse',
      signature: 'validationResponse(bytes32 requestHash, uint8 response, string responseURI, bytes32 responseHash, string tag)',
      type: 'write',
      params: [
        { name: 'requestHash', type: 'bytes32', description: 'erc8004.fn.validationResponse.params.requestHash' },
        { name: 'response', type: 'uint8', description: 'erc8004.fn.validationResponse.params.response' },
        { name: 'responseURI', type: 'string', description: 'erc8004.fn.validationResponse.params.responseURI' },
        { name: 'responseHash', type: 'bytes32', description: 'erc8004.fn.validationResponse.params.responseHash' },
        { name: 'tag', type: 'string', description: 'erc8004.fn.validationResponse.params.tag' },
      ],
      description: 'erc8004.fn.validationResponse.desc',
      defaultSimValues: { requestHash: '0xReqHash', response: '100', responseURI: 'ipfs://res', responseHash: '0xResHash', tag: 'hard-finality' },
    },
    {
      name: 'Registered',
      signature: 'Registered(uint256 indexed agentId, string agentURI, address indexed owner)',
      type: 'event',
      params: [
        { name: 'agentId', type: 'uint256', description: 'erc8004.fn.Registered.params.agentId' },
        { name: 'agentURI', type: 'string', description: 'erc8004.fn.Registered.params.agentURI' },
        { name: 'owner', type: 'address', description: 'erc8004.fn.Registered.params.owner' },
      ],
      description: 'erc8004.fn.Registered.desc',
    },
    {
      name: 'NewFeedback',
      signature:
        'NewFeedback(uint256 indexed agentId, address indexed clientAddress, uint64 feedbackIndex, int128 value, uint8 valueDecimals, string indexed indexedTag1, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)',
      type: 'event',
      params: [
        { name: 'agentId', type: 'uint256', description: 'erc8004.fn.NewFeedback.params.agentId' },
        { name: 'clientAddress', type: 'address', description: 'erc8004.fn.NewFeedback.params.clientAddress' },
        { name: 'feedbackIndex', type: 'uint64', description: 'erc8004.fn.NewFeedback.params.feedbackIndex' },
        { name: 'value', type: 'int128', description: 'erc8004.fn.NewFeedback.params.value' },
        { name: 'valueDecimals', type: 'uint8', description: 'erc8004.fn.NewFeedback.params.valueDecimals' },
        { name: 'indexedTag1', type: 'string', description: 'erc8004.fn.NewFeedback.params.indexedTag1' },
        { name: 'tag1', type: 'string', description: 'erc8004.fn.NewFeedback.params.tag1' },
        { name: 'tag2', type: 'string', description: 'erc8004.fn.NewFeedback.params.tag2' },
        { name: 'endpoint', type: 'string', description: 'erc8004.fn.NewFeedback.params.endpoint' },
        { name: 'feedbackURI', type: 'string', description: 'erc8004.fn.NewFeedback.params.feedbackURI' },
        { name: 'feedbackHash', type: 'bytes32', description: 'erc8004.fn.NewFeedback.params.feedbackHash' },
      ],
      description: 'erc8004.fn.NewFeedback.desc',
    },
    {
      name: 'ValidationRequest',
      signature: 'ValidationRequest(address indexed validatorAddress, uint256 indexed agentId, string requestURI, bytes32 indexed requestHash)',
      type: 'event',
      params: [
        { name: 'validatorAddress', type: 'address', description: 'erc8004.fn.ValidationRequest.params.validatorAddress' },
        { name: 'agentId', type: 'uint256', description: 'erc8004.fn.ValidationRequest.params.agentId' },
        { name: 'requestURI', type: 'string', description: 'erc8004.fn.ValidationRequest.params.requestURI' },
        { name: 'requestHash', type: 'bytes32', description: 'erc8004.fn.ValidationRequest.params.requestHash' },
      ],
      description: 'erc8004.fn.ValidationRequest.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc8004.node.user',
      data: { address: '0xOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc8004-contract',
      type: 'contract',
      label: 'erc8004.node.contract',
      data: {
        functions: ['register', 'setAgentURI', 'setMetadata', 'setAgentWallet', 'giveFeedback', 'validationRequest', 'validationResponse'],
      },
      layoutHint: 'center',
    },
    {
      id: 'fn-register',
      type: 'function',
      label: 'register()',
      data: { fnType: 'write', signature: 'register(string agentURI) → uint256' },
    },
    {
      id: 'fn-giveFeedback',
      type: 'function',
      label: 'giveFeedback()',
      data: {
        fnType: 'write',
        signature:
          'giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)',
      },
    },
    {
      id: 'storage-agents',
      type: 'storage',
      label: 'erc8004.node.storageAgents',
      data: {
        slots: [
          { key: '_owners', label: 'mapping(uint256 => address)' },
          { key: '_agentURIs', label: 'mapping(uint256 => string)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-registered',
      type: 'function',
      label: 'Registered event',
      data: { fnType: 'event', signature: 'Registered(uint256 indexed agentId, string agentURI, address indexed owner)' },
    },
    {
      id: 'client',
      type: 'user',
      label: 'erc8004.node.client',
      data: { address: '0xClient' },
      layoutHint: 'source',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-register',
      source: 'user',
      target: 'fn-register',
      type: 'animated',
      label: 'erc8004.edge.callRegister',
    },
    {
      id: 'e-register-contract',
      source: 'fn-register',
      target: 'erc8004-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc8004-contract',
      target: 'storage-agents',
      type: 'labeled',
      label: 'erc8004.edge.updateAgents',
    },
    {
      id: 'e-contract-event',
      source: 'erc8004-contract',
      target: 'event-registered',
      type: 'labeled',
      label: 'erc8004.edge.emitRegistered',
    },
    {
      id: 'e-client-giveFeedback',
      source: 'client',
      target: 'fn-giveFeedback',
      type: 'animated',
      label: 'erc8004.edge.callGiveFeedback',
    },
    {
      id: 'e-giveFeedback-contract',
      source: 'fn-giveFeedback',
      target: 'erc8004-contract',
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
      id: 'register-agent-walkthrough',
      name: 'erc8004.sim.registerAgentWalkthrough.name',
      description: 'erc8004.sim.registerAgentWalkthrough.desc',
      params: [
        {
          id: 'agentURI',
          label: 'erc8004.sim.registerAgentWalkthrough.param.agentURI',
          type: 'select',
          options: [
            { label: 'ipfs://cid', value: 'ipfs://cid' },
            { label: 'https://example.com/agent.json', value: 'https://example.com/agent.json' },
          ],
          defaultValue: 'ipfs://cid',
        },
        {
          id: 'owner',
          label: 'erc8004.sim.registerAgentWalkthrough.param.owner',
          type: 'address',
          defaultValue: '0xOwner',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc8004.sim.registerAgentWalkthrough.step.call',
          mobileDescription: 'erc8004.sim.registerAgentWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-register'],
          highlightEdges: ['e-user-register'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc8004.sim.registerAgentWalkthrough.step.execute',
          mobileDescription: 'erc8004.sim.registerAgentWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-register', 'erc8004-contract', 'storage-agents'],
          highlightEdges: ['e-register-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-agents._owners[1]': '0x0 → 0xOwner',
            'storage-agents._agentURIs[1]': '"" → "ipfs://cid"',
          },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc8004.sim.registerAgentWalkthrough.step.event',
          mobileDescription: 'erc8004.sim.registerAgentWalkthrough.step.event.mobile',
          highlightNodes: ['erc8004-contract', 'event-registered'],
          highlightEdges: ['e-contract-event'],
          valueChanges: { 'event-registered.lastEvent': 'Registered(1, "ipfs://cid", 0xOwner)' },
          durationMs: 800,
        },
      ],
    },
  ],
};
