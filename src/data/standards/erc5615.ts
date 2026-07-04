import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5615',
  name: 'ERC-5615',
  shortDescription: 'erc5615.short',
  category: 'nft',
  entryType: 'standard',
  eipNumber: 5615,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5615',
  relatedSlugs: ['erc1155', 'erc721', 'erc20', 'erc165'],
  sortOrder: 15615,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [1155],
  relations: [{ slug: 'erc1155', kind: 'extends' }],
  references: [
    { label: 'ERC-5615 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5615', kind: 'spec' },
    {
      label: 'OpenZeppelin ERC1155Supply',
      url: 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/extensions/ERC1155Supply.sol',
      kind: 'impl',
    },
  ],

  // ─── ERCContent ───
  introduction: 'erc5615.introduction',
  designPurpose: 'erc5615.designPurpose',
  commonUsage: 'erc5615.commonUsage',

  functions: [
    {
      name: 'exists',
      signature: 'exists(uint256 id) → bool',
      type: 'read',
      params: [{ name: 'id', type: 'uint256', description: 'erc5615.fn.exists.params.id' }],
      returns: [{ name: 'exists', type: 'bool', description: 'erc5615.fn.exists.returns.exists' }],
      description: 'erc5615.fn.exists.desc',
      defaultSimValues: { id: '1' },
    },
    {
      name: 'totalSupply',
      signature: 'totalSupply(uint256 id) → uint256',
      type: 'read',
      params: [{ name: 'id', type: 'uint256', description: 'erc5615.fn.totalSupply.params.id' }],
      returns: [{ name: 'totalSupply', type: 'uint256', description: 'erc5615.fn.totalSupply.returns.totalSupply' }],
      description: 'erc5615.fn.totalSupply.desc',
      defaultSimValues: { id: '1' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5615.node.user',
      data: { address: '0xReader' },
      layoutHint: 'source',
    },
    {
      id: 'erc5615-contract',
      type: 'contract',
      label: 'erc5615.node.contract',
      data: { functions: ['totalSupply', 'exists'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-totalSupply',
      type: 'function',
      label: 'totalSupply()',
      data: { fnType: 'read', signature: 'totalSupply(uint256 id) → uint256' },
    },
    {
      id: 'fn-exists',
      type: 'function',
      label: 'exists()',
      data: { fnType: 'read', signature: 'exists(uint256 id) → bool' },
    },
    {
      id: 'storage-supply',
      type: 'storage',
      label: 'erc5615.node.storageSupply',
      data: { slots: [{ key: '_totalSupply', label: 'mapping(uint256 => uint256)' }] },
      layoutHint: 'storage',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-totalSupply',
      source: 'user',
      target: 'fn-totalSupply',
      type: 'animated',
      label: 'erc5615.edge.callTotalSupply',
    },
    { id: 'e-totalSupply-contract', source: 'fn-totalSupply', target: 'erc5615-contract', type: 'animated' },
    {
      id: 'e-user-exists',
      source: 'user',
      target: 'fn-exists',
      type: 'animated',
      label: 'erc5615.edge.callExists',
    },
    { id: 'e-exists-contract', source: 'fn-exists', target: 'erc5615-contract', type: 'animated' },
    {
      id: 'e-contract-storage',
      source: 'erc5615-contract',
      target: 'storage-supply',
      type: 'labeled',
      label: 'erc5615.edge.readSupply',
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
      id: 'total-supply-walkthrough',
      name: 'erc5615.sim.totalSupplyWalkthrough.name',
      description: 'erc5615.sim.totalSupplyWalkthrough.desc',
      params: [
        {
          id: 'id',
          label: 'erc5615.sim.totalSupplyWalkthrough.param.id',
          type: 'uint256',
          defaultValue: '1',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5615.sim.totalSupplyWalkthrough.step.call',
          mobileDescription: 'erc5615.sim.totalSupplyWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-totalSupply'],
          highlightEdges: ['e-user-totalSupply'],
          durationMs: 1000,
        },
        {
          id: 'step-read',
          description: 'erc5615.sim.totalSupplyWalkthrough.step.read',
          mobileDescription: 'erc5615.sim.totalSupplyWalkthrough.step.read.mobile',
          highlightNodes: ['fn-totalSupply', 'erc5615-contract', 'storage-supply'],
          highlightEdges: ['e-totalSupply-contract', 'e-contract-storage'],
          valueChanges: { 'storage-supply._totalSupply[1]': '→ 500' },
          durationMs: 1200,
        },
        {
          id: 'step-exists',
          description: 'erc5615.sim.totalSupplyWalkthrough.step.exists',
          mobileDescription: 'erc5615.sim.totalSupplyWalkthrough.step.exists.mobile',
          highlightNodes: ['user', 'fn-exists', 'erc5615-contract'],
          highlightEdges: ['e-user-exists', 'e-exists-contract'],
          durationMs: 900,
        },
      ],
    },
  ],
};
