import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc181',
  name: 'ERC-181',
  shortDescription: 'erc181.short',
  category: 'identity',
  entryType: 'standard',
  eipNumber: 181,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-181',
  relatedSlugs: ['erc165', 'erc55', 'erc4361'],
  sortOrder: 10181,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-181 Specification', url: 'https://eips.ethereum.org/EIPS/eip-181', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc181.introduction',
  designPurpose: 'erc181.designPurpose',
  commonUsage: 'erc181.commonUsage',

  functions: [
    {
      name: 'claim',
      signature: 'claim(address owner) → bytes32 node',
      type: 'write',
      params: [
        { name: 'owner', type: 'address', description: 'erc181.fn.claim.params.owner' },
      ],
      returns: [{ name: 'node', type: 'bytes32', description: 'erc181.fn.claim.returns.node' }],
      description: 'erc181.fn.claim.desc',
      defaultSimValues: { owner: '0xUser' },
    },
    {
      name: 'claimWithResolver',
      signature: 'claimWithResolver(address owner, address resolver) → bytes32 node',
      type: 'write',
      params: [
        { name: 'owner', type: 'address', description: 'erc181.fn.claimWithResolver.params.owner' },
        { name: 'resolver', type: 'address', description: 'erc181.fn.claimWithResolver.params.resolver' },
      ],
      returns: [{ name: 'node', type: 'bytes32', description: 'erc181.fn.claimWithResolver.returns.node' }],
      description: 'erc181.fn.claimWithResolver.desc',
      defaultSimValues: { owner: '0xUser', resolver: '0xResolver' },
    },
    {
      name: 'setName',
      signature: 'setName(string name) → bytes32 node',
      type: 'write',
      params: [
        { name: 'name', type: 'string', description: 'erc181.fn.setName.params.name' },
      ],
      returns: [{ name: 'node', type: 'bytes32', description: 'erc181.fn.setName.returns.node' }],
      description: 'erc181.fn.setName.desc',
      defaultSimValues: { name: 'alice.eth' },
    },
    {
      name: 'name',
      signature: 'name(bytes32 node) → string',
      type: 'read',
      params: [
        { name: 'node', type: 'bytes32', description: 'erc181.fn.name.params.node' },
      ],
      returns: [{ name: 'name', type: 'string', description: 'erc181.fn.name.returns.name' }],
      description: 'erc181.fn.name.desc',
      defaultSimValues: { node: '0xReverseNode' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc181.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'erc181-contract',
      type: 'contract',
      label: 'erc181.node.contract',
      data: { functions: ['claim', 'claimWithResolver', 'setName'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-claim',
      type: 'function',
      label: 'claim()',
      data: { fnType: 'write', signature: 'claim(address owner) → bytes32 node' },
    },
    {
      id: 'fn-setName',
      type: 'function',
      label: 'setName()',
      data: { fnType: 'write', signature: 'setName(string name) → bytes32 node' },
    },
    {
      id: 'storage-reverse',
      type: 'storage',
      label: 'erc181.node.storageReverse',
      data: {
        slots: [
          { key: 'ens.owner', label: 'mapping(bytes32 => address)' },
          { key: 'resolver.name', label: 'mapping(bytes32 => string)' },
        ],
      },
      layoutHint: 'storage',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-claim',
      source: 'user',
      target: 'fn-claim',
      type: 'animated',
      label: 'erc181.edge.callClaim',
    },
    {
      id: 'e-user-setName',
      source: 'user',
      target: 'fn-setName',
      type: 'animated',
      label: 'erc181.edge.callSetName',
    },
    { id: 'e-claim-contract', source: 'fn-claim', target: 'erc181-contract', type: 'animated' },
    { id: 'e-setName-contract', source: 'fn-setName', target: 'erc181-contract', type: 'animated' },
    {
      id: 'e-contract-storage',
      source: 'erc181-contract',
      target: 'storage-reverse',
      type: 'labeled',
      label: 'erc181.edge.updateReverse',
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
      id: 'set-name-walkthrough',
      name: 'erc181.sim.setNameWalkthrough.name',
      description: 'erc181.sim.setNameWalkthrough.desc',
      params: [
        {
          id: 'caller',
          label: 'erc181.sim.setNameWalkthrough.param.caller',
          type: 'address',
          defaultValue: '0xUser',
        },
        {
          id: 'name',
          label: 'erc181.sim.setNameWalkthrough.param.name',
          type: 'select',
          options: [
            { label: 'alice.eth', value: 'alice.eth' },
            { label: 'treasury.eth', value: 'treasury.eth' },
          ],
          defaultValue: 'alice.eth',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc181.sim.setNameWalkthrough.step.call',
          mobileDescription: 'erc181.sim.setNameWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-setName'],
          highlightEdges: ['e-user-setName'],
          durationMs: 1000,
        },
        {
          id: 'step-claim',
          description: 'erc181.sim.setNameWalkthrough.step.claim',
          mobileDescription: 'erc181.sim.setNameWalkthrough.step.claim.mobile',
          highlightNodes: ['fn-setName', 'erc181-contract'],
          highlightEdges: ['e-setName-contract'],
          valueChanges: { 'erc181-contract.node': 'namehash(hex(caller) + ".addr.reverse")' },
          durationMs: 1100,
        },
        {
          id: 'step-store',
          description: 'erc181.sim.setNameWalkthrough.step.store',
          mobileDescription: 'erc181.sim.setNameWalkthrough.step.store.mobile',
          highlightNodes: ['erc181-contract', 'storage-reverse'],
          highlightEdges: ['e-contract-storage'],
          valueChanges: { 'storage-reverse.resolver.name': '"" → "alice.eth"' },
          durationMs: 1200,
        },
      ],
    },
  ],
};
