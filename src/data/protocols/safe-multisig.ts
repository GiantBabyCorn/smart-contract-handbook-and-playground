import type { ProtocolEntry } from '../types';

export const entry: ProtocolEntry = {
  // ─── ERCMeta ───
  slug: 'safe-multisig',
  name: 'Safe Multisig',
  shortDescription: 'safe-multisig.short',
  category: 'governance',
  entryType: 'protocol',
  officialUrl: 'https://safe.global',
  relatedSlugs: ['oz-governor', 'erc1271', 'erc4337'],
  sortOrder: 3300,

  // ─── ERCContent ───
  introduction: 'safe-multisig.introduction',
  designPurpose: 'safe-multisig.designPurpose',
  commonUsage: 'safe-multisig.commonUsage',

  functions: [
    {
      name: 'execTransaction',
      signature: 'execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures) → bool success',
      type: 'write',
      params: [
        { name: 'to', type: 'address', description: 'safe-multisig.fn.execTransaction.params.to' },
        { name: 'value', type: 'uint256', description: 'safe-multisig.fn.execTransaction.params.value' },
        { name: 'data', type: 'bytes', description: 'safe-multisig.fn.execTransaction.params.data' },
        { name: 'operation', type: 'uint8', description: 'safe-multisig.fn.execTransaction.params.operation' },
        { name: 'safeTxGas', type: 'uint256', description: 'safe-multisig.fn.execTransaction.params.safeTxGas' },
        { name: 'baseGas', type: 'uint256', description: 'safe-multisig.fn.execTransaction.params.baseGas' },
        { name: 'gasPrice', type: 'uint256', description: 'safe-multisig.fn.execTransaction.params.gasPrice' },
        { name: 'gasToken', type: 'address', description: 'safe-multisig.fn.execTransaction.params.gasToken' },
        { name: 'refundReceiver', type: 'address', description: 'safe-multisig.fn.execTransaction.params.refundReceiver' },
        { name: 'signatures', type: 'bytes', description: 'safe-multisig.fn.execTransaction.params.signatures' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'safe-multisig.fn.execTransaction.returns.success' }],
      description: 'safe-multisig.fn.execTransaction.desc',
      defaultSimValues: { to: '0xTargetContract', value: '0', operation: '0' },
    },
    {
      name: 'approveHash',
      signature: 'approveHash(bytes32 hashToApprove)',
      type: 'write',
      params: [
        { name: 'hashToApprove', type: 'bytes32', description: 'safe-multisig.fn.approveHash.params.hashToApprove' },
      ],
      description: 'safe-multisig.fn.approveHash.desc',
      defaultSimValues: { hashToApprove: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' },
    },
    {
      name: 'addOwnerWithThreshold',
      signature: 'addOwnerWithThreshold(address owner, uint256 _threshold)',
      type: 'write',
      params: [
        { name: 'owner', type: 'address', description: 'safe-multisig.fn.addOwnerWithThreshold.params.owner' },
        { name: '_threshold', type: 'uint256', description: 'safe-multisig.fn.addOwnerWithThreshold.params.threshold' },
      ],
      description: 'safe-multisig.fn.addOwnerWithThreshold.desc',
      defaultSimValues: { owner: '0xNewOwner', _threshold: '2' },
    },
    {
      name: 'removeOwner',
      signature: 'removeOwner(address prevOwner, address owner, uint256 _threshold)',
      type: 'write',
      params: [
        { name: 'prevOwner', type: 'address', description: 'safe-multisig.fn.removeOwner.params.prevOwner' },
        { name: 'owner', type: 'address', description: 'safe-multisig.fn.removeOwner.params.owner' },
        { name: '_threshold', type: 'uint256', description: 'safe-multisig.fn.removeOwner.params.threshold' },
      ],
      description: 'safe-multisig.fn.removeOwner.desc',
      defaultSimValues: { owner: '0xRemovedOwner', _threshold: '2' },
    },
    {
      name: 'changeThreshold',
      signature: 'changeThreshold(uint256 _threshold)',
      type: 'write',
      params: [
        { name: '_threshold', type: 'uint256', description: 'safe-multisig.fn.changeThreshold.params.threshold' },
      ],
      description: 'safe-multisig.fn.changeThreshold.desc',
      defaultSimValues: { _threshold: '3' },
    },
    {
      name: 'getOwners',
      signature: 'getOwners() → address[]',
      type: 'read',
      params: [],
      returns: [{ name: 'owners', type: 'address[]', description: 'safe-multisig.fn.getOwners.returns.owners' }],
      description: 'safe-multisig.fn.getOwners.desc',
      defaultSimValues: {},
    },
    {
      name: 'getThreshold',
      signature: 'getThreshold() → uint256',
      type: 'read',
      params: [],
      returns: [{ name: 'threshold', type: 'uint256', description: 'safe-multisig.fn.getThreshold.returns.threshold' }],
      description: 'safe-multisig.fn.getThreshold.desc',
      defaultSimValues: {},
    },
    {
      name: 'isOwner',
      signature: 'isOwner(address owner) → bool',
      type: 'read',
      params: [
        { name: 'owner', type: 'address', description: 'safe-multisig.fn.isOwner.params.owner' },
      ],
      returns: [{ name: 'isOwner', type: 'bool', description: 'safe-multisig.fn.isOwner.returns.isOwner' }],
      description: 'safe-multisig.fn.isOwner.desc',
      defaultSimValues: { owner: '0xOwnerAddress' },
    },
    {
      name: 'nonce',
      signature: 'nonce() → uint256',
      type: 'read',
      params: [],
      returns: [{ name: 'nonce', type: 'uint256', description: 'safe-multisig.fn.nonce.returns.nonce' }],
      description: 'safe-multisig.fn.nonce.desc',
      defaultSimValues: {},
    },
  ],

  // ─── Schema v2 content sections ───
  composes: [
    { slug: 'erc1271', role: 'safe-multisig.compose.erc1271.role' },
    { slug: 'erc165', role: 'safe-multisig.compose.erc165.role' },
    { slug: 'erc4337', role: 'safe-multisig.compose.erc4337.role' },
    { erc: 712, role: 'safe-multisig.compose.erc712.role' },
  ],

  references: [
    {
      label: 'Safe docs — Smart account signatures (EIP-1271)',
      url: 'https://docs.safe.global/advanced/smart-account-signatures',
      kind: 'spec',
    },
    {
      label: 'Safe docs — Safe and ERC-4337 (Safe4337Module)',
      url: 'https://docs.safe.global/advanced/erc-4337/4337-safe',
      kind: 'spec',
    },
    {
      label: 'CompatibilityFallbackHandler.sol (ERC-1271 + ERC-165)',
      url: 'https://github.com/safe-global/safe-smart-account/blob/main/contracts/handler/CompatibilityFallbackHandler.sol',
      kind: 'impl',
    },
    {
      label: 'Safe.sol (EIP-712 SafeTx hashing)',
      url: 'https://github.com/safe-global/safe-smart-account/blob/main/contracts/Safe.sol',
      kind: 'impl',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'owner-a',
      type: 'user',
      label: 'safe-multisig.node.owner-a',
      data: { address: '0xOwnerA', balance: '5 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'owner-b',
      type: 'user',
      label: 'safe-multisig.node.owner-b',
      data: { address: '0xOwnerB', balance: '5 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'owner-c',
      type: 'user',
      label: 'safe-multisig.node.owner-c',
      data: { address: '0xOwnerC', balance: '5 ETH' },
    },
    {
      id: 'safe-contract',
      type: 'contract',
      label: 'safe-multisig.node.safe-contract',
      data: { functions: ['execTransaction', 'approveHash', 'getOwners', 'getThreshold', 'nonce'] },
      layoutHint: 'center',
    },
    {
      id: 'guard',
      type: 'contract',
      label: 'safe-multisig.node.guard',
      data: { functions: ['checkTransaction', 'checkAfterExecution'] },
    },
    {
      id: 'module',
      type: 'contract',
      label: 'safe-multisig.node.module',
      data: { functions: ['execTransactionFromModule'] },
    },
    {
      id: 'fallback-handler',
      type: 'contract',
      label: 'safe-multisig.node.fallback-handler',
      data: { functions: ['isValidSignature'] },
    },
    {
      id: 'target-contract',
      type: 'contract',
      label: 'safe-multisig.node.target-contract',
      data: { functions: ['anyFunction'] },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-ownerA-safe',
      source: 'owner-a',
      target: 'safe-contract',
      type: 'animated',
      label: 'safe-multisig.edge.signTx',
    },
    {
      id: 'e-ownerB-safe',
      source: 'owner-b',
      target: 'safe-contract',
      type: 'animated',
      label: 'safe-multisig.edge.signTx',
    },
    {
      id: 'e-ownerC-safe',
      source: 'owner-c',
      target: 'safe-contract',
      type: 'labeled',
      label: 'safe-multisig.edge.approveHash',
    },
    {
      id: 'e-safe-guard',
      source: 'safe-contract',
      target: 'guard',
      type: 'labeled',
      label: 'safe-multisig.edge.checkGuard',
    },
    {
      id: 'e-safe-target',
      source: 'safe-contract',
      target: 'target-contract',
      type: 'animated',
      label: 'safe-multisig.edge.execCall',
    },
    {
      id: 'e-module-safe',
      source: 'module',
      target: 'safe-contract',
      type: 'labeled',
      label: 'safe-multisig.edge.moduleExec',
    },
    {
      id: 'e-safe-fallback',
      source: 'safe-contract',
      target: 'fallback-handler',
      type: 'labeled',
      label: 'safe-multisig.edge.fallback',
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
      id: 'submit-confirm-multisig',
      name: 'safe-multisig.sim.submit-confirm-multisig.name',
      description: 'safe-multisig.sim.submit-confirm-multisig.desc',
      params: [
        {
          id: 'targetAddress',
          label: 'safe-multisig.sim.submit-confirm-multisig.param.targetAddress',
          type: 'address',
          defaultValue: '0xTargetContract',
        },
        {
          id: 'threshold',
          label: 'safe-multisig.sim.submit-confirm-multisig.param.threshold',
          type: 'uint256',
          defaultValue: '2',
        },
      ],
      steps: [
        {
          id: 'step-propose',
          description: 'safe-multisig.sim.submit-confirm-multisig.step.propose',
          mobileDescription: 'safe-multisig.sim.submit-confirm-multisig.step.propose.mobile',
          highlightNodes: ['owner-a', 'safe-contract'],
          highlightEdges: ['e-ownerA-safe'],
          valueChanges: { 'safe-contract.pendingTxHash': '0xabc... (nonce=5)' },
          durationMs: 1200,
        },
        {
          id: 'step-confirm',
          description: 'safe-multisig.sim.submit-confirm-multisig.step.confirm',
          mobileDescription: 'safe-multisig.sim.submit-confirm-multisig.step.confirm.mobile',
          highlightNodes: ['owner-b', 'safe-contract'],
          highlightEdges: ['e-ownerB-safe'],
          valueChanges: { 'safe-contract.confirmations': '1 → 2 (threshold reached)' },
          durationMs: 1200,
        },
        {
          id: 'step-guard-check',
          description: 'safe-multisig.sim.submit-confirm-multisig.step.guardCheck',
          mobileDescription: 'safe-multisig.sim.submit-confirm-multisig.step.guardCheck.mobile',
          highlightNodes: ['safe-contract', 'guard'],
          highlightEdges: ['e-safe-guard'],
          valueChanges: { 'guard.status': 'transaction validated' },
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'safe-multisig.sim.submit-confirm-multisig.step.execute',
          mobileDescription: 'safe-multisig.sim.submit-confirm-multisig.step.execute.mobile',
          highlightNodes: ['safe-contract', 'target-contract'],
          highlightEdges: ['e-safe-target'],
          valueChanges: {
            'safe-contract.nonce': '5 → 6',
            'target-contract.state': 'updated',
          },
          durationMs: 1500,
        },
      ],
    },
    {
      id: 'add-new-owner',
      name: 'safe-multisig.sim.add-new-owner.name',
      description: 'safe-multisig.sim.add-new-owner.desc',
      params: [
        {
          id: 'newOwner',
          label: 'safe-multisig.sim.add-new-owner.param.newOwner',
          type: 'address',
          defaultValue: '0xNewOwnerAddress',
        },
        {
          id: 'newThreshold',
          label: 'safe-multisig.sim.add-new-owner.param.newThreshold',
          type: 'uint256',
          defaultValue: '3',
        },
      ],
      steps: [
        {
          id: 'step-propose-add',
          description: 'safe-multisig.sim.add-new-owner.step.proposeAdd',
          mobileDescription: 'safe-multisig.sim.add-new-owner.step.proposeAdd.mobile',
          highlightNodes: ['owner-a', 'safe-contract'],
          highlightEdges: ['e-ownerA-safe'],
          valueChanges: { 'safe-contract.pendingTx': 'addOwnerWithThreshold(0xNewOwner, 3)' },
          durationMs: 1200,
        },
        {
          id: 'step-collect-sigs',
          description: 'safe-multisig.sim.add-new-owner.step.collectSigs',
          mobileDescription: 'safe-multisig.sim.add-new-owner.step.collectSigs.mobile',
          highlightNodes: ['owner-b', 'owner-c', 'safe-contract'],
          highlightEdges: ['e-ownerB-safe', 'e-ownerC-safe'],
          valueChanges: { 'safe-contract.confirmations': '1 → 3' },
          durationMs: 1500,
        },
        {
          id: 'step-add-owner',
          description: 'safe-multisig.sim.add-new-owner.step.addOwner',
          mobileDescription: 'safe-multisig.sim.add-new-owner.step.addOwner.mobile',
          highlightNodes: ['safe-contract'],
          highlightEdges: [],
          valueChanges: {
            'safe-contract.owners': '3 → 4 owners',
            'safe-contract.threshold': '2 → 3',
          },
          durationMs: 1500,
        },
      ],
    },
  ],

  contracts: [
    {
      chain: 'Ethereum',
      address: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
      label: 'Safe Singleton',
    },
  ],
};
