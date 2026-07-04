import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2009',
  name: 'ERC-2009',
  shortDescription: 'erc2009.short',
  category: 'rwa',
  entryType: 'standard',
  eipNumber: 2009,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2009',
  relatedSlugs: ['erc3643', 'erc20', 'erc3525'],
  sortOrder: 12009,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [1066],
  relations: [
    { slug: 'erc3643', kind: 'alternative' },
    { slug: 'erc20', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-2009 Specification', url: 'https://eips.ethereum.org/EIPS/eip-2009', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc2009.introduction',
  designPurpose: 'erc2009.designPurpose',
  commonUsage: 'erc2009.commonUsage',

  functions: [
    {
      name: 'checkTransferAllowed',
      signature: 'checkTransferAllowed(bytes32 tokenId, address from, address to, uint256 value) → byte',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'bytes32', description: 'erc2009.fn.checkTransferAllowed.params.tokenId' },
        { name: 'from', type: 'address', description: 'erc2009.fn.checkTransferAllowed.params.from' },
        { name: 'to', type: 'address', description: 'erc2009.fn.checkTransferAllowed.params.to' },
        { name: 'value', type: 'uint256', description: 'erc2009.fn.checkTransferAllowed.params.value' },
      ],
      returns: [
        { name: 'status', type: 'byte', description: 'erc2009.fn.checkTransferAllowed.returns.status' },
      ],
      description: 'erc2009.fn.checkTransferAllowed.desc',
      defaultSimValues: { tokenId: '0xTOKENA', from: '0xHolderA', to: '0xHolderB', value: '1000' },
    },
    {
      name: 'checkMintAllowed',
      signature: 'checkMintAllowed(bytes32 tokenId, address to, uint256 value) → byte',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'bytes32', description: 'erc2009.fn.checkMintAllowed.params.tokenId' },
        { name: 'to', type: 'address', description: 'erc2009.fn.checkMintAllowed.params.to' },
        { name: 'value', type: 'uint256', description: 'erc2009.fn.checkMintAllowed.params.value' },
      ],
      returns: [
        { name: 'status', type: 'byte', description: 'erc2009.fn.checkMintAllowed.returns.status' },
      ],
      description: 'erc2009.fn.checkMintAllowed.desc',
      defaultSimValues: { tokenId: '0xTOKENA', to: '0xHolderB', value: '1000' },
    },
    {
      name: 'checkBurnAllowed',
      signature: 'checkBurnAllowed(bytes32 tokenId, address from, uint256 value) → byte',
      type: 'read',
      params: [
        { name: 'tokenId', type: 'bytes32', description: 'erc2009.fn.checkBurnAllowed.params.tokenId' },
        { name: 'from', type: 'address', description: 'erc2009.fn.checkBurnAllowed.params.from' },
        { name: 'value', type: 'uint256', description: 'erc2009.fn.checkBurnAllowed.params.value' },
      ],
      returns: [
        { name: 'status', type: 'byte', description: 'erc2009.fn.checkBurnAllowed.returns.status' },
      ],
      description: 'erc2009.fn.checkBurnAllowed.desc',
      defaultSimValues: { tokenId: '0xTOKENA', from: '0xHolderA', value: '1000' },
    },
    {
      name: 'updateTransferAccumulated',
      signature: 'updateTransferAccumulated(bytes32 tokenId, address from, address to, uint256 value)',
      type: 'write',
      params: [
        { name: 'tokenId', type: 'bytes32', description: 'erc2009.fn.updateTransferAccumulated.params.tokenId' },
        { name: 'from', type: 'address', description: 'erc2009.fn.updateTransferAccumulated.params.from' },
        { name: 'to', type: 'address', description: 'erc2009.fn.updateTransferAccumulated.params.to' },
        { name: 'value', type: 'uint256', description: 'erc2009.fn.updateTransferAccumulated.params.value' },
      ],
      description: 'erc2009.fn.updateTransferAccumulated.desc',
      defaultSimValues: { tokenId: '0xTOKENA', from: '0xHolderA', to: '0xHolderB', value: '1000' },
    },
    {
      name: 'addToken',
      signature: 'addToken(bytes32 tokenId, address token)',
      type: 'write',
      params: [
        { name: 'tokenId', type: 'bytes32', description: 'erc2009.fn.addToken.params.tokenId' },
        { name: 'token', type: 'address', description: 'erc2009.fn.addToken.params.token' },
      ],
      description: 'erc2009.fn.addToken.desc',
      defaultSimValues: { tokenId: '0xTOKENA', token: '0xRegulatedToken' },
    },
    {
      name: 'authorizeAccumulatedOperator',
      signature: 'authorizeAccumulatedOperator(address operator) → bool',
      type: 'write',
      params: [
        { name: 'operator', type: 'address', description: 'erc2009.fn.authorizeAccumulatedOperator.params.operator' },
      ],
      returns: [
        { name: 'success', type: 'bool', description: 'erc2009.fn.authorizeAccumulatedOperator.returns.success' },
      ],
      description: 'erc2009.fn.authorizeAccumulatedOperator.desc',
      defaultSimValues: { operator: '0xOperator' },
    },
    {
      name: 'revokeAccumulatedOperator',
      signature: 'revokeAccumulatedOperator(address operator) → bool',
      type: 'write',
      params: [
        { name: 'operator', type: 'address', description: 'erc2009.fn.revokeAccumulatedOperator.params.operator' },
      ],
      returns: [
        { name: 'success', type: 'bool', description: 'erc2009.fn.revokeAccumulatedOperator.returns.success' },
      ],
      description: 'erc2009.fn.revokeAccumulatedOperator.desc',
      defaultSimValues: { operator: '0xOperator' },
    },
    {
      name: 'TokenAdded',
      signature: 'TokenAdded(bytes32 indexed tokenId, address indexed token)',
      type: 'event',
      params: [
        { name: 'tokenId', type: 'bytes32', description: 'erc2009.fn.TokenAdded.params.tokenId' },
        { name: 'token', type: 'address', description: 'erc2009.fn.TokenAdded.params.token' },
      ],
      description: 'erc2009.fn.TokenAdded.desc',
    },
    {
      name: 'AuthorizedAccumulatedOperator',
      signature: 'AuthorizedAccumulatedOperator(address indexed operator, bytes32 indexed tokenId)',
      type: 'event',
      params: [
        { name: 'operator', type: 'address', description: 'erc2009.fn.AuthorizedAccumulatedOperator.params.operator' },
        { name: 'tokenId', type: 'bytes32', description: 'erc2009.fn.AuthorizedAccumulatedOperator.params.tokenId' },
      ],
      description: 'erc2009.fn.AuthorizedAccumulatedOperator.desc',
    },
    {
      name: 'RevokedAccumulatedOperator',
      signature: 'RevokedAccumulatedOperator(address indexed operator, bytes32 indexed tokenId)',
      type: 'event',
      params: [
        { name: 'operator', type: 'address', description: 'erc2009.fn.RevokedAccumulatedOperator.params.operator' },
        { name: 'tokenId', type: 'bytes32', description: 'erc2009.fn.RevokedAccumulatedOperator.params.tokenId' },
      ],
      description: 'erc2009.fn.RevokedAccumulatedOperator.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc2009.node.user',
      data: { address: '0xRegulatedToken' },
      layoutHint: 'source',
    },
    {
      id: 'erc2009-contract',
      type: 'contract',
      label: 'erc2009.node.contract',
      data: { functions: ['checkTransferAllowed', 'updateTransferAccumulated', 'addToken', 'authorizeAccumulatedOperator'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-addToken',
      type: 'function',
      label: 'addToken()',
      data: { fnType: 'write', signature: 'addToken(bytes32 tokenId, address token)' },
    },
    {
      id: 'fn-checkTransferAllowed',
      type: 'function',
      label: 'checkTransferAllowed()',
      data: { fnType: 'read', signature: 'checkTransferAllowed(bytes32 tokenId, address from, address to, uint256 value) → byte' },
    },
    {
      id: 'fn-updateTransferAccumulated',
      type: 'function',
      label: 'updateTransferAccumulated()',
      data: { fnType: 'write', signature: 'updateTransferAccumulated(bytes32 tokenId, address from, address to, uint256 value)' },
    },
    {
      id: 'storage-accumulated',
      type: 'storage',
      label: 'erc2009.node.storageAccumulated',
      data: {
        slots: [
          { key: '_tokens', label: 'mapping(bytes32 => address)' },
          { key: '_accumulated', label: 'mapping(bytes32 => uint256)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-tokenAdded',
      type: 'function',
      label: 'TokenAdded event',
      data: { fnType: 'event', signature: 'TokenAdded(bytes32 indexed tokenId, address indexed token)' },
    },
  ],

  flowEdges: [
    { id: 'e-user-addToken', source: 'user', target: 'fn-addToken', type: 'animated', label: 'erc2009.edge.callAddToken' },
    { id: 'e-addToken-contract', source: 'fn-addToken', target: 'erc2009-contract', type: 'animated' },
    { id: 'e-user-check', source: 'user', target: 'fn-checkTransferAllowed', type: 'animated', label: 'erc2009.edge.callCheck' },
    { id: 'e-check-contract', source: 'fn-checkTransferAllowed', target: 'erc2009-contract', type: 'animated' },
    { id: 'e-user-update', source: 'user', target: 'fn-updateTransferAccumulated', type: 'animated', label: 'erc2009.edge.callUpdate' },
    { id: 'e-update-contract', source: 'fn-updateTransferAccumulated', target: 'erc2009-contract', type: 'animated' },
    { id: 'e-contract-storage', source: 'erc2009-contract', target: 'storage-accumulated', type: 'labeled', label: 'erc2009.edge.writeStorage' },
    { id: 'e-contract-event', source: 'erc2009-contract', target: 'event-tokenAdded', type: 'labeled', label: 'erc2009.edge.emitTokenAdded' },
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
      id: 'compliance-check-walkthrough',
      name: 'erc2009.sim.complianceCheckWalkthrough.name',
      description: 'erc2009.sim.complianceCheckWalkthrough.desc',
      params: [
        {
          id: 'from',
          label: 'erc2009.sim.complianceCheckWalkthrough.param.from',
          type: 'address',
          defaultValue: '0xHolderA',
        },
        {
          id: 'to',
          label: 'erc2009.sim.complianceCheckWalkthrough.param.to',
          type: 'address',
          defaultValue: '0xHolderB',
        },
        {
          id: 'value',
          label: 'erc2009.sim.complianceCheckWalkthrough.param.value',
          type: 'uint256',
          defaultValue: '1000',
        },
      ],
      steps: [
        {
          id: 'step-register',
          description: 'erc2009.sim.complianceCheckWalkthrough.step.register',
          mobileDescription: 'erc2009.sim.complianceCheckWalkthrough.step.register.mobile',
          highlightNodes: ['user', 'fn-addToken', 'erc2009-contract', 'storage-accumulated', 'event-tokenAdded'],
          highlightEdges: ['e-user-addToken', 'e-addToken-contract', 'e-contract-storage', 'e-contract-event'],
          valueChanges: { 'storage-accumulated._tokens': '{} → { TOKEN_A: 0xRegulatedToken }' },
          durationMs: 1200,
        },
        {
          id: 'step-check',
          description: 'erc2009.sim.complianceCheckWalkthrough.step.check',
          mobileDescription: 'erc2009.sim.complianceCheckWalkthrough.step.check.mobile',
          highlightNodes: ['user', 'fn-checkTransferAllowed', 'erc2009-contract'],
          highlightEdges: ['e-user-check', 'e-check-contract'],
          valueChanges: { 'erc2009-contract.status': '0x11 (Allowed)' },
          durationMs: 1000,
        },
        {
          id: 'step-update',
          description: 'erc2009.sim.complianceCheckWalkthrough.step.update',
          mobileDescription: 'erc2009.sim.complianceCheckWalkthrough.step.update.mobile',
          highlightNodes: ['user', 'fn-updateTransferAccumulated', 'erc2009-contract', 'storage-accumulated'],
          highlightEdges: ['e-user-update', 'e-update-contract', 'e-contract-storage'],
          valueChanges: { 'storage-accumulated._accumulated': '4000 → 5000' },
          durationMs: 1200,
        },
      ],
    },
  ],
};
