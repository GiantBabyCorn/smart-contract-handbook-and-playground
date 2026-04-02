import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc6551',
  name: 'ERC-6551',
  shortDescription: 'erc6551.short',
  category: 'account',
  entryType: 'standard',
  eipNumber: 6551,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-6551',
  relatedSlugs: ['erc721', 'erc4337', 'erc1155'],
  sortOrder: 1300,

  // ─── ERCContent ───
  introduction: 'erc6551.introduction',
  designPurpose: 'erc6551.designPurpose',
  commonUsage: 'erc6551.commonUsage',

  functions: [
    {
      name: 'createAccount',
      signature: 'createAccount(address implementation, bytes32 salt, uint256 chainId, address tokenContract, uint256 tokenId) → address account',
      type: 'write',
      params: [
        { name: 'implementation', type: 'address', description: 'erc6551.fn.createAccount.params.implementation' },
        { name: 'salt', type: 'bytes32', description: 'erc6551.fn.createAccount.params.salt' },
        { name: 'chainId', type: 'uint256', description: 'erc6551.fn.createAccount.params.chainId' },
        { name: 'tokenContract', type: 'address', description: 'erc6551.fn.createAccount.params.tokenContract' },
        { name: 'tokenId', type: 'uint256', description: 'erc6551.fn.createAccount.params.tokenId' },
      ],
      returns: [{ name: 'account', type: 'address', description: 'erc6551.fn.createAccount.returns.account' }],
      description: 'erc6551.fn.createAccount.desc',
      defaultSimValues: {
        implementation: '0xImplementation',
        salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
        chainId: '1',
        tokenContract: '0xNFTContract',
        tokenId: '42',
      },
    },
    {
      name: 'account',
      signature: 'account(address implementation, bytes32 salt, uint256 chainId, address tokenContract, uint256 tokenId) → address',
      type: 'read',
      params: [
        { name: 'implementation', type: 'address', description: 'erc6551.fn.account.params.implementation' },
        { name: 'salt', type: 'bytes32', description: 'erc6551.fn.account.params.salt' },
        { name: 'chainId', type: 'uint256', description: 'erc6551.fn.account.params.chainId' },
        { name: 'tokenContract', type: 'address', description: 'erc6551.fn.account.params.tokenContract' },
        { name: 'tokenId', type: 'uint256', description: 'erc6551.fn.account.params.tokenId' },
      ],
      returns: [{ name: 'accountAddress', type: 'address', description: 'erc6551.fn.account.returns.accountAddress' }],
      description: 'erc6551.fn.account.desc',
      defaultSimValues: { chainId: '1', tokenId: '42' },
    },
    {
      name: 'execute',
      signature: 'execute(address to, uint256 value, bytes calldata data, uint8 operation) → bytes',
      type: 'write',
      params: [
        { name: 'to', type: 'address', description: 'erc6551.fn.execute.params.to' },
        { name: 'value', type: 'uint256', description: 'erc6551.fn.execute.params.value' },
        { name: 'data', type: 'bytes', description: 'erc6551.fn.execute.params.data' },
        { name: 'operation', type: 'uint8', description: 'erc6551.fn.execute.params.operation' },
      ],
      returns: [{ name: 'result', type: 'bytes', description: 'erc6551.fn.execute.returns.result' }],
      description: 'erc6551.fn.execute.desc',
      defaultSimValues: { to: '0xTarget', value: '0', operation: '0' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'nft-owner',
      type: 'user',
      label: 'erc6551.node.nftOwner',
      data: { address: '0xNFTOwner', balance: '1 NFT' },
      layoutHint: 'source',
    },
    {
      id: 'erc721-token',
      type: 'contract',
      label: 'erc6551.node.erc721Token',
      data: { functions: ['ownerOf', 'tokenURI'] },
    },
    {
      id: 'registry',
      type: 'contract',
      label: 'erc6551.node.registry',
      data: { functions: ['createAccount', 'account'] },
      layoutHint: 'center',
    },
    {
      id: 'tba-account',
      type: 'contract',
      label: 'erc6551.node.tbaAccount',
      data: { functions: ['execute', 'token', 'owner'] },
    },
    {
      id: 'target',
      type: 'contract',
      label: 'erc6551.node.target',
      data: {},
      layoutHint: 'sink',
    },
    {
      id: 'storage',
      type: 'storage',
      label: 'erc6551.node.storage',
      data: {
        slots: [
          { key: 'chainId', label: 'uint256' },
          { key: 'tokenContract', label: 'address' },
          { key: 'tokenId', label: 'uint256' },
        ],
      },
      layoutHint: 'storage',
    },
  ],

  flowEdges: [
    {
      id: 'e-owner-registry',
      source: 'nft-owner',
      target: 'registry',
      type: 'animated',
      label: 'erc6551.edge.createAccount',
    },
    {
      id: 'e-registry-erc721',
      source: 'registry',
      target: 'erc721-token',
      type: 'labeled',
      label: 'erc6551.edge.verifyOwnership',
    },
    {
      id: 'e-registry-tba',
      source: 'registry',
      target: 'tba-account',
      type: 'animated',
      label: 'erc6551.edge.deployTBA',
    },
    {
      id: 'e-tba-storage',
      source: 'tba-account',
      target: 'storage',
      type: 'labeled',
      label: 'erc6551.edge.storeBinding',
    },
    {
      id: 'e-owner-tba',
      source: 'nft-owner',
      target: 'tba-account',
      type: 'animated',
      label: 'erc6551.edge.callExecute',
    },
    {
      id: 'e-tba-target',
      source: 'tba-account',
      target: 'target',
      type: 'fundFlow',
      label: 'erc6551.edge.execute',
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
      id: 'create-use-tba',
      name: 'erc6551.sim.createUseTba.name',
      description: 'erc6551.sim.createUseTba.desc',
      params: [
        {
          id: 'tokenContract',
          label: 'erc6551.sim.createUseTba.param.tokenContract',
          type: 'address',
          defaultValue: '0xNFTContract',
        },
        {
          id: 'tokenId',
          label: 'erc6551.sim.createUseTba.param.tokenId',
          type: 'uint256',
          defaultValue: '42',
        },
        {
          id: 'targetContract',
          label: 'erc6551.sim.createUseTba.param.targetContract',
          type: 'address',
          defaultValue: '0xDeFiProtocol',
        },
      ],
      steps: [
        {
          id: 'step-lookup',
          description: 'erc6551.sim.createUseTba.step.lookup',
          mobileDescription: 'erc6551.sim.createUseTba.step.lookup.mobile',
          highlightNodes: ['nft-owner', 'erc721-token'],
          highlightEdges: ['e-registry-erc721'],
          valueChanges: { 'erc721-token.ownerOf(42)': '0xNFTOwner' },
          durationMs: 1000,
        },
        {
          id: 'step-deploy',
          description: 'erc6551.sim.createUseTba.step.deploy',
          mobileDescription: 'erc6551.sim.createUseTba.step.deploy.mobile',
          highlightNodes: ['nft-owner', 'registry', 'tba-account'],
          highlightEdges: ['e-owner-registry', 'e-registry-tba'],
          valueChanges: { 'registry.accounts': '0 → 1', 'tba-account.address': '0xTBAAddress (CREATE2)' },
          durationMs: 1400,
        },
        {
          id: 'step-bind',
          description: 'erc6551.sim.createUseTba.step.bind',
          mobileDescription: 'erc6551.sim.createUseTba.step.bind.mobile',
          highlightNodes: ['tba-account', 'storage'],
          highlightEdges: ['e-tba-storage'],
          valueChanges: {
            'storage.chainId': '1',
            'storage.tokenContract': '0xNFTContract',
            'storage.tokenId': '42',
          },
          durationMs: 1100,
        },
        {
          id: 'step-execute',
          description: 'erc6551.sim.createUseTba.step.execute',
          mobileDescription: 'erc6551.sim.createUseTba.step.execute.mobile',
          highlightNodes: ['nft-owner', 'tba-account', 'target'],
          highlightEdges: ['e-owner-tba', 'e-tba-target'],
          valueChanges: { 'target.state': 'updated by TBA' },
          durationMs: 1300,
        },
      ],
    },
  ],
};
