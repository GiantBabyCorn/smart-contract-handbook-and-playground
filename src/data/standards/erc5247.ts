import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5247',
  name: 'ERC-5247',
  shortDescription: 'erc5247.short',
  category: 'governance',
  entryType: 'standard',
  eipNumber: 5247,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5247',
  relatedSlugs: ['erc173', 'erc4337', 'erc7579'],
  sortOrder: 15247,
  eipStatus: 'Review',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-5247 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5247', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5247.introduction',
  designPurpose: 'erc5247.designPurpose',
  commonUsage: 'erc5247.commonUsage',

  functions: [
    {
      name: 'createProposal',
      signature:
        'createProposal(uint256 proposalId, address[] calldata targets, uint256[] calldata values, uint256[] calldata gasLimits, bytes[] calldata calldatas, bytes calldata extraParams) → uint256 registeredProposalId',
      type: 'write',
      params: [
        { name: 'proposalId', type: 'uint256', description: 'erc5247.fn.createProposal.params.proposalId' },
        { name: 'targets', type: 'address[]', description: 'erc5247.fn.createProposal.params.targets' },
        { name: 'values', type: 'uint256[]', description: 'erc5247.fn.createProposal.params.values' },
        { name: 'gasLimits', type: 'uint256[]', description: 'erc5247.fn.createProposal.params.gasLimits' },
        { name: 'calldatas', type: 'bytes[]', description: 'erc5247.fn.createProposal.params.calldatas' },
        { name: 'extraParams', type: 'bytes', description: 'erc5247.fn.createProposal.params.extraParams' },
      ],
      returns: [
        {
          name: 'registeredProposalId',
          type: 'uint256',
          description: 'erc5247.fn.createProposal.returns.registeredProposalId',
        },
      ],
      description: 'erc5247.fn.createProposal.desc',
      defaultSimValues: { proposalId: '1' },
    },
    {
      name: 'executeProposal',
      signature: 'executeProposal(uint256 proposalId, bytes calldata extraParams)',
      type: 'write',
      params: [
        { name: 'proposalId', type: 'uint256', description: 'erc5247.fn.executeProposal.params.proposalId' },
        { name: 'extraParams', type: 'bytes', description: 'erc5247.fn.executeProposal.params.extraParams' },
      ],
      description: 'erc5247.fn.executeProposal.desc',
      defaultSimValues: { proposalId: '1' },
    },
    {
      name: 'ProposalCreated',
      signature:
        'ProposalCreated(address indexed proposer, uint256 indexed proposalId, address[] targets, uint256[] values, uint256[] gasLimits, bytes[] calldatas, bytes extraParams)',
      type: 'event',
      params: [
        { name: 'proposer', type: 'address', description: 'erc5247.fn.ProposalCreated.params.proposer' },
        { name: 'proposalId', type: 'uint256', description: 'erc5247.fn.ProposalCreated.params.proposalId' },
        { name: 'targets', type: 'address[]', description: 'erc5247.fn.ProposalCreated.params.targets' },
        { name: 'values', type: 'uint256[]', description: 'erc5247.fn.ProposalCreated.params.values' },
        { name: 'gasLimits', type: 'uint256[]', description: 'erc5247.fn.ProposalCreated.params.gasLimits' },
        { name: 'calldatas', type: 'bytes[]', description: 'erc5247.fn.ProposalCreated.params.calldatas' },
        { name: 'extraParams', type: 'bytes', description: 'erc5247.fn.ProposalCreated.params.extraParams' },
      ],
      description: 'erc5247.fn.ProposalCreated.desc',
    },
    {
      name: 'ProposalExecuted',
      signature: 'ProposalExecuted(address indexed executor, uint256 indexed proposalId, bytes extraParams)',
      type: 'event',
      params: [
        { name: 'executor', type: 'address', description: 'erc5247.fn.ProposalExecuted.params.executor' },
        { name: 'proposalId', type: 'uint256', description: 'erc5247.fn.ProposalExecuted.params.proposalId' },
        { name: 'extraParams', type: 'bytes', description: 'erc5247.fn.ProposalExecuted.params.extraParams' },
      ],
      description: 'erc5247.fn.ProposalExecuted.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5247.node.user',
      data: { address: '0xProposer' },
      layoutHint: 'source',
    },
    {
      id: 'erc5247-contract',
      type: 'contract',
      label: 'erc5247.node.contract',
      data: { functions: ['createProposal', 'executeProposal'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-createProposal',
      type: 'function',
      label: 'createProposal()',
      data: {
        fnType: 'write',
        signature:
          'createProposal(uint256 proposalId, address[] calldata targets, uint256[] calldata values, uint256[] calldata gasLimits, bytes[] calldata calldatas, bytes calldata extraParams) → uint256 registeredProposalId',
      },
    },
    {
      id: 'fn-executeProposal',
      type: 'function',
      label: 'executeProposal()',
      data: { fnType: 'write', signature: 'executeProposal(uint256 proposalId, bytes calldata extraParams)' },
    },
    {
      id: 'storage-proposals',
      type: 'storage',
      label: 'erc5247.node.storageProposals',
      data: { slots: [{ key: 'proposals', label: 'mapping(uint256 => Proposal)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'event-proposalCreated',
      type: 'function',
      label: 'ProposalCreated event',
      data: {
        fnType: 'event',
        signature:
          'ProposalCreated(address indexed proposer, uint256 indexed proposalId, address[] targets, uint256[] values, uint256[] gasLimits, bytes[] calldatas, bytes extraParams)',
      },
    },
    {
      id: 'event-proposalExecuted',
      type: 'function',
      label: 'ProposalExecuted event',
      data: {
        fnType: 'event',
        signature: 'ProposalExecuted(address indexed executor, uint256 indexed proposalId, bytes extraParams)',
      },
    },
  ],

  flowEdges: [
    {
      id: 'e-user-createProposal',
      source: 'user',
      target: 'fn-createProposal',
      type: 'animated',
      label: 'erc5247.edge.callCreateProposal',
    },
    { id: 'e-createProposal-contract', source: 'fn-createProposal', target: 'erc5247-contract', type: 'animated' },
    {
      id: 'e-user-executeProposal',
      source: 'user',
      target: 'fn-executeProposal',
      type: 'animated',
      label: 'erc5247.edge.callExecuteProposal',
    },
    { id: 'e-executeProposal-contract', source: 'fn-executeProposal', target: 'erc5247-contract', type: 'animated' },
    {
      id: 'e-contract-storage',
      source: 'erc5247-contract',
      target: 'storage-proposals',
      type: 'labeled',
      label: 'erc5247.edge.storeProposal',
    },
    {
      id: 'e-contract-createdEvent',
      source: 'erc5247-contract',
      target: 'event-proposalCreated',
      type: 'labeled',
      label: 'erc5247.edge.emitProposalCreated',
    },
    {
      id: 'e-contract-executedEvent',
      source: 'erc5247-contract',
      target: 'event-proposalExecuted',
      type: 'labeled',
      label: 'erc5247.edge.emitProposalExecuted',
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
      id: 'create-proposal-walkthrough',
      name: 'erc5247.sim.createProposalWalkthrough.name',
      description: 'erc5247.sim.createProposalWalkthrough.desc',
      params: [
        {
          id: 'proposalId',
          label: 'erc5247.sim.createProposalWalkthrough.param.proposalId',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'target',
          label: 'erc5247.sim.createProposalWalkthrough.param.target',
          type: 'address',
          defaultValue: '0xTarget',
        },
        {
          id: 'value',
          label: 'erc5247.sim.createProposalWalkthrough.param.value',
          type: 'uint256',
          defaultValue: '0',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5247.sim.createProposalWalkthrough.step.call',
          mobileDescription: 'erc5247.sim.createProposalWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-createProposal'],
          highlightEdges: ['e-user-createProposal'],
          durationMs: 1000,
        },
        {
          id: 'step-store',
          description: 'erc5247.sim.createProposalWalkthrough.step.store',
          mobileDescription: 'erc5247.sim.createProposalWalkthrough.step.store.mobile',
          highlightNodes: ['fn-createProposal', 'erc5247-contract', 'storage-proposals'],
          highlightEdges: ['e-createProposal-contract', 'e-contract-storage'],
          valueChanges: { 'storage-proposals.proposals[1]': '(none) → Proposal(1 call)' },
          durationMs: 1200,
        },
        {
          id: 'step-created',
          description: 'erc5247.sim.createProposalWalkthrough.step.created',
          mobileDescription: 'erc5247.sim.createProposalWalkthrough.step.created.mobile',
          highlightNodes: ['erc5247-contract', 'event-proposalCreated'],
          highlightEdges: ['e-contract-createdEvent'],
          durationMs: 900,
        },
        {
          id: 'step-execute',
          description: 'erc5247.sim.createProposalWalkthrough.step.execute',
          mobileDescription: 'erc5247.sim.createProposalWalkthrough.step.execute.mobile',
          highlightNodes: ['user', 'fn-executeProposal', 'erc5247-contract', 'event-proposalExecuted'],
          highlightEdges: ['e-user-executeProposal', 'e-executeProposal-contract', 'e-contract-executedEvent'],
          durationMs: 1000,
        },
      ],
    },
  ],
};
