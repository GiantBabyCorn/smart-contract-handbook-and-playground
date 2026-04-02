import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5267',
  name: 'ERC-5267',
  shortDescription: 'erc5267.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 5267,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5267',
  relatedSlugs: ['erc2612', 'erc1271', 'erc4361'],
  sortOrder: 1800,

  // ─── ERCContent ───
  introduction: 'erc5267.introduction',
  designPurpose: 'erc5267.designPurpose',
  commonUsage: 'erc5267.commonUsage',

  functions: [
    {
      name: 'eip712Domain',
      signature: 'eip712Domain() → (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)',
      type: 'read',
      params: [],
      returns: [
        { name: 'fields', type: 'bytes1', description: 'erc5267.fn.eip712Domain.returns.fields' },
        { name: 'name', type: 'string', description: 'erc5267.fn.eip712Domain.returns.name' },
        { name: 'version', type: 'string', description: 'erc5267.fn.eip712Domain.returns.version' },
        { name: 'chainId', type: 'uint256', description: 'erc5267.fn.eip712Domain.returns.chainId' },
        { name: 'verifyingContract', type: 'address', description: 'erc5267.fn.eip712Domain.returns.verifyingContract' },
        { name: 'salt', type: 'bytes32', description: 'erc5267.fn.eip712Domain.returns.salt' },
        { name: 'extensions', type: 'uint256[]', description: 'erc5267.fn.eip712Domain.returns.extensions' },
      ],
      description: 'erc5267.fn.eip712Domain.desc',
      defaultSimValues: {},
    },
    {
      name: 'EIP712DomainChanged',
      signature: 'EIP712DomainChanged()',
      type: 'event',
      params: [],
      description: 'erc5267.fn.EIP712DomainChanged.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'dapp',
      type: 'user',
      label: 'erc5267.node.dapp',
      data: { address: '0xDApp' },
      layoutHint: 'source',
    },
    {
      id: 'erc5267-contract',
      type: 'contract',
      label: 'erc5267.node.contract',
      data: { functions: ['eip712Domain'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-eip712Domain',
      type: 'function',
      label: 'eip712Domain()',
      data: { fnType: 'read', signature: 'eip712Domain() → (bytes1, string, string, uint256, address, bytes32, uint256[])' },
    },
    {
      id: 'domain-info',
      type: 'storage',
      label: 'erc5267.node.domainInfo',
      data: {
        slots: [
          { key: '_name', label: 'string' },
          { key: '_version', label: 'string' },
          { key: 'chainId', label: 'uint256 (block.chainid)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'eip712-context',
      type: 'tokenFlow',
      label: 'erc5267.node.eip712Context',
      data: { symbol: 'EIP-712', amount: 'DOMAIN_SEPARATOR' },
      layoutHint: 'sink',
    },
    {
      id: 'event-domainChanged',
      type: 'function',
      label: 'EIP712DomainChanged event',
      data: { fnType: 'event', signature: 'EIP712DomainChanged()' },
    },
  ],

  flowEdges: [
    {
      id: 'e-dapp-fn',
      source: 'dapp',
      target: 'fn-eip712Domain',
      type: 'animated',
      label: 'erc5267.edge.discoverDomain',
    },
    {
      id: 'e-fn-contract',
      source: 'fn-eip712Domain',
      target: 'erc5267-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-domainInfo',
      source: 'erc5267-contract',
      target: 'domain-info',
      type: 'labeled',
      label: 'erc5267.edge.readDomainFields',
    },
    {
      id: 'e-contract-eip712',
      source: 'erc5267-contract',
      target: 'eip712-context',
      type: 'labeled',
      label: 'erc5267.edge.buildDomainSeparator',
    },
    {
      id: 'e-eip712-dapp',
      source: 'eip712-context',
      target: 'dapp',
      type: 'fundFlow',
      label: 'erc5267.edge.domainReturned',
    },
    {
      id: 'e-contract-event',
      source: 'erc5267-contract',
      target: 'event-domainChanged',
      type: 'labeled',
      label: 'erc5267.edge.emitChanged',
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
      id: 'domain-discovery',
      name: 'erc5267.sim.domainDiscovery.name',
      description: 'erc5267.sim.domainDiscovery.desc',
      params: [
        {
          id: 'contractAddress',
          label: 'erc5267.sim.domainDiscovery.param.contractAddress',
          type: 'address',
          defaultValue: '0xContractAddress',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5267.sim.domainDiscovery.step.call',
          mobileDescription: 'erc5267.sim.domainDiscovery.step.call.mobile',
          highlightNodes: ['dapp', 'fn-eip712Domain'],
          highlightEdges: ['e-dapp-fn'],
          valueChanges: { 'dapp.action': 'Calling eip712Domain()' },
          durationMs: 900,
        },
        {
          id: 'step-read',
          description: 'erc5267.sim.domainDiscovery.step.read',
          mobileDescription: 'erc5267.sim.domainDiscovery.step.read.mobile',
          highlightNodes: ['fn-eip712Domain', 'erc5267-contract', 'domain-info'],
          highlightEdges: ['e-fn-contract', 'e-contract-domainInfo'],
          valueChanges: {
            'domain-info._name': '"MyToken"',
            'domain-info._version': '"1"',
            'domain-info.chainId': '1 (Ethereum Mainnet)',
          },
          durationMs: 1200,
        },
        {
          id: 'step-build',
          description: 'erc5267.sim.domainDiscovery.step.build',
          mobileDescription: 'erc5267.sim.domainDiscovery.step.build.mobile',
          highlightNodes: ['erc5267-contract', 'eip712-context'],
          highlightEdges: ['e-contract-eip712'],
          valueChanges: {
            'eip712-context.separator': 'keccak256(abi.encode(TYPE_HASH, nameHash, versionHash, chainId, address(this)))',
          },
          durationMs: 1200,
        },
        {
          id: 'step-return',
          description: 'erc5267.sim.domainDiscovery.step.return',
          mobileDescription: 'erc5267.sim.domainDiscovery.step.return.mobile',
          highlightNodes: ['eip712-context', 'dapp'],
          highlightEdges: ['e-eip712-dapp'],
          valueChanges: {
            'dapp.domainSeparator': '0x1234…abcd',
            'dapp.readyToSign': 'true',
          },
          durationMs: 800,
        },
      ],
    },
  ],
};
