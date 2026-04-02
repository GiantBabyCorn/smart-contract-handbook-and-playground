import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7702',
  name: 'ERC-7702',
  shortDescription: 'erc7702.short',
  category: 'account',
  entryType: 'standard',
  eipNumber: 7702,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7702',
  relatedSlugs: ['erc4337', 'erc7579', 'erc4361'],
  sortOrder: 1400,

  // ─── ERCContent ───
  introduction: 'erc7702.introduction',
  designPurpose: 'erc7702.designPurpose',
  commonUsage: 'erc7702.commonUsage',

  functions: [
    {
      name: 'authorize',
      signature: 'authorize(address delegation) → bytes authorization',
      type: 'write',
      params: [
        { name: 'delegation', type: 'address', description: 'erc7702.fn.authorize.params.delegation' },
      ],
      returns: [{ name: 'authorization', type: 'bytes', description: 'erc7702.fn.authorize.returns.authorization' }],
      description: 'erc7702.fn.authorize.desc',
      defaultSimValues: { delegation: '0xDelegationContract' },
    },
    {
      name: 'execute',
      signature: 'execute(address to, uint256 value, bytes calldata data) → bytes result',
      type: 'write',
      params: [
        { name: 'to', type: 'address', description: 'erc7702.fn.execute.params.to' },
        { name: 'value', type: 'uint256', description: 'erc7702.fn.execute.params.value' },
        { name: 'data', type: 'bytes', description: 'erc7702.fn.execute.params.data' },
      ],
      returns: [{ name: 'result', type: 'bytes', description: 'erc7702.fn.execute.returns.result' }],
      description: 'erc7702.fn.execute.desc',
      defaultSimValues: { to: '0xTarget', value: '0', data: '0x' },
    },
    {
      name: 'executeBatch',
      signature: 'executeBatch(Call[] calldata calls) → bytes[] results',
      type: 'write',
      params: [
        { name: 'calls', type: 'Call[]', description: 'erc7702.fn.executeBatch.params.calls' },
      ],
      returns: [{ name: 'results', type: 'bytes[]', description: 'erc7702.fn.executeBatch.returns.results' }],
      description: 'erc7702.fn.executeBatch.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'eoa',
      type: 'user',
      label: 'erc7702.node.eoa',
      data: { address: '0xEOA', balance: '1 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'authorization-tuple',
      type: 'contract',
      label: 'erc7702.node.authorizationTuple',
      data: { functions: [] },
    },
    {
      id: 'validator',
      type: 'contract',
      label: 'erc7702.node.validator',
      data: { functions: ['validateSignature'] },
    },
    {
      id: 'delegation-contract',
      type: 'proxy',
      label: 'erc7702.node.delegationContract',
      data: { implementation: '0xDelegationImpl' },
      layoutHint: 'center',
    },
    {
      id: 'target',
      type: 'contract',
      label: 'erc7702.node.target',
      data: {},
      layoutHint: 'sink',
    },
    {
      id: 'storage',
      type: 'storage',
      label: 'erc7702.node.storage',
      data: {
        slots: [
          { key: 'delegation', label: 'address (EOA code pointer)' },
          { key: 'nonce', label: 'uint256' },
        ],
      },
      layoutHint: 'storage',
    },
  ],

  flowEdges: [
    {
      id: 'e-eoa-authtuple',
      source: 'eoa',
      target: 'authorization-tuple',
      type: 'animated',
      label: 'erc7702.edge.signAuthorization',
    },
    {
      id: 'e-authtuple-validator',
      source: 'authorization-tuple',
      target: 'validator',
      type: 'labeled',
      label: 'erc7702.edge.verifySignature',
    },
    {
      id: 'e-validator-delegation',
      source: 'validator',
      target: 'delegation-contract',
      type: 'animated',
      label: 'erc7702.edge.setCode',
    },
    {
      id: 'e-delegation-storage',
      source: 'delegation-contract',
      target: 'storage',
      type: 'labeled',
      label: 'erc7702.edge.storeDelegation',
    },
    {
      id: 'e-eoa-delegation',
      source: 'eoa',
      target: 'delegation-contract',
      type: 'animated',
      label: 'erc7702.edge.callExecute',
    },
    {
      id: 'e-delegation-target',
      source: 'delegation-contract',
      target: 'target',
      type: 'fundFlow',
      label: 'erc7702.edge.execute',
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
      id: 'eoa-delegation',
      name: 'erc7702.sim.eoaDelegation.name',
      description: 'erc7702.sim.eoaDelegation.desc',
      params: [
        {
          id: 'eoaAddress',
          label: 'erc7702.sim.eoaDelegation.param.eoaAddress',
          type: 'address',
          defaultValue: '0xMyEOA',
        },
        {
          id: 'delegationImpl',
          label: 'erc7702.sim.eoaDelegation.param.delegationImpl',
          type: 'address',
          defaultValue: '0xSmartAccountImpl',
        },
        {
          id: 'targetContract',
          label: 'erc7702.sim.eoaDelegation.param.targetContract',
          type: 'address',
          defaultValue: '0xDeFiProtocol',
        },
      ],
      steps: [
        {
          id: 'step-sign-auth',
          description: 'erc7702.sim.eoaDelegation.step.signAuth',
          mobileDescription: 'erc7702.sim.eoaDelegation.step.signAuth.mobile',
          highlightNodes: ['eoa', 'authorization-tuple'],
          highlightEdges: ['e-eoa-authtuple'],
          valueChanges: { 'authorization-tuple.content': 'chainId=1, address=0xSmartAccountImpl, nonce=0' },
          durationMs: 1100,
        },
        {
          id: 'step-verify',
          description: 'erc7702.sim.eoaDelegation.step.verify',
          mobileDescription: 'erc7702.sim.eoaDelegation.step.verify.mobile',
          highlightNodes: ['authorization-tuple', 'validator'],
          highlightEdges: ['e-authtuple-validator'],
          valueChanges: { 'validator.result': 'signature valid' },
          durationMs: 1000,
        },
        {
          id: 'step-set-code',
          description: 'erc7702.sim.eoaDelegation.step.setCode',
          mobileDescription: 'erc7702.sim.eoaDelegation.step.setCode.mobile',
          highlightNodes: ['validator', 'delegation-contract', 'storage'],
          highlightEdges: ['e-validator-delegation', 'e-delegation-storage'],
          valueChanges: {
            'eoa.code': '0x (EOA) → 0xEF0100... (delegation designator)',
            'storage.delegation': '0xSmartAccountImpl',
          },
          durationMs: 1400,
        },
        {
          id: 'step-execute',
          description: 'erc7702.sim.eoaDelegation.step.execute',
          mobileDescription: 'erc7702.sim.eoaDelegation.step.execute.mobile',
          highlightNodes: ['eoa', 'delegation-contract', 'target'],
          highlightEdges: ['e-eoa-delegation', 'e-delegation-target'],
          valueChanges: { 'target.state': 'updated', 'eoa.actingAs': 'smart account' },
          durationMs: 1300,
        },
      ],
    },
  ],
};
