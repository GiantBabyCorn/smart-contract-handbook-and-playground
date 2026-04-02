import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1271',
  name: 'ERC-1271',
  shortDescription: 'erc1271.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 1271,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1271',
  relatedSlugs: ['erc4361', 'erc5267', 'safe-multisig'],
  sortOrder: 1500,

  // ─── ERCContent ───
  introduction: 'erc1271.introduction',
  designPurpose: 'erc1271.designPurpose',
  commonUsage: 'erc1271.commonUsage',

  functions: [
    {
      name: 'isValidSignature',
      signature: 'isValidSignature(bytes32 hash, bytes memory signature) → bytes4 magicValue',
      type: 'read',
      params: [
        { name: 'hash', type: 'bytes32', description: 'erc1271.fn.isValidSignature.params.hash' },
        { name: 'signature', type: 'bytes', description: 'erc1271.fn.isValidSignature.params.signature' },
      ],
      returns: [
        { name: 'magicValue', type: 'bytes4', description: 'erc1271.fn.isValidSignature.returns.magicValue' },
      ],
      description: 'erc1271.fn.isValidSignature.desc',
      defaultSimValues: {
        hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
        signature: '0x',
      },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'verifier',
      type: 'user',
      label: 'erc1271.node.verifier',
      data: { address: '0xDApp' },
      layoutHint: 'source',
    },
    {
      id: 'erc1271-contract',
      type: 'contract',
      label: 'erc1271.node.contract',
      data: { functions: ['isValidSignature'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-isValidSignature',
      type: 'function',
      label: 'isValidSignature()',
      data: { fnType: 'read', signature: 'isValidSignature(bytes32 hash, bytes memory signature) → bytes4' },
    },
    {
      id: 'signer',
      type: 'user',
      label: 'erc1271.node.signer',
      data: { address: '0xSigner' },
      layoutHint: 'sink',
    },
    {
      id: 'signature-storage',
      type: 'storage',
      label: 'erc1271.node.signatureStorage',
      data: {
        slots: [
          { key: 'owners', label: 'mapping(address => bool)' },
          { key: 'threshold', label: 'uint256' },
          { key: 'approvedHashes', label: 'mapping(address => mapping(bytes32 => uint256))' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'magic-value',
      type: 'tokenFlow',
      label: 'erc1271.node.magicValue',
      data: { symbol: 'bytes4', amount: '0x1626ba7e' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-verifier-fn',
      source: 'verifier',
      target: 'fn-isValidSignature',
      type: 'animated',
      label: 'erc1271.edge.verifyRequest',
    },
    {
      id: 'e-fn-contract',
      source: 'fn-isValidSignature',
      target: 'erc1271-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc1271-contract',
      target: 'signature-storage',
      type: 'labeled',
      label: 'erc1271.edge.checkOwners',
    },
    {
      id: 'e-contract-signer',
      source: 'erc1271-contract',
      target: 'signer',
      type: 'labeled',
      label: 'erc1271.edge.recoverSigner',
    },
    {
      id: 'e-contract-magic',
      source: 'erc1271-contract',
      target: 'magic-value',
      type: 'labeled',
      label: 'erc1271.edge.returnMagic',
    },
    {
      id: 'e-magic-verifier',
      source: 'magic-value',
      target: 'verifier',
      type: 'fundFlow',
      label: 'erc1271.edge.validSignal',
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
      id: 'contract-sig-verification',
      name: 'erc1271.sim.contractSigVerification.name',
      description: 'erc1271.sim.contractSigVerification.desc',
      params: [
        {
          id: 'hash',
          label: 'erc1271.sim.contractSigVerification.param.hash',
          type: 'uint256',
          defaultValue: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
        },
        {
          id: 'signature',
          label: 'erc1271.sim.contractSigVerification.param.signature',
          type: 'uint256',
          defaultValue: '0xabcdef...',
        },
      ],
      steps: [
        {
          id: 'step-submit',
          description: 'erc1271.sim.contractSigVerification.step.submit',
          mobileDescription: 'erc1271.sim.contractSigVerification.step.submit.mobile',
          highlightNodes: ['verifier', 'fn-isValidSignature'],
          highlightEdges: ['e-verifier-fn'],
          valueChanges: {
            'fn-isValidSignature.input': 'hash=0xd9eb…, signature=0xabcd…',
          },
          durationMs: 1000,
        },
        {
          id: 'step-recover',
          description: 'erc1271.sim.contractSigVerification.step.recover',
          mobileDescription: 'erc1271.sim.contractSigVerification.step.recover.mobile',
          highlightNodes: ['fn-isValidSignature', 'erc1271-contract', 'signer'],
          highlightEdges: ['e-fn-contract', 'e-contract-signer'],
          valueChanges: { 'signer.recovered': 'ecrecover → 0xSigner' },
          durationMs: 1200,
        },
        {
          id: 'step-check-owner',
          description: 'erc1271.sim.contractSigVerification.step.checkOwner',
          mobileDescription: 'erc1271.sim.contractSigVerification.step.checkOwner.mobile',
          highlightNodes: ['erc1271-contract', 'signature-storage'],
          highlightEdges: ['e-contract-storage'],
          valueChanges: { 'signature-storage.owners[0xSigner]': 'true ✓' },
          durationMs: 1000,
        },
        {
          id: 'step-return',
          description: 'erc1271.sim.contractSigVerification.step.return',
          mobileDescription: 'erc1271.sim.contractSigVerification.step.return.mobile',
          highlightNodes: ['erc1271-contract', 'magic-value', 'verifier'],
          highlightEdges: ['e-contract-magic', 'e-magic-verifier'],
          valueChanges: {
            'magic-value.value': '0x1626ba7e (MAGIC_VALUE)',
            'verifier.result': 'signature valid ✓',
          },
          durationMs: 900,
        },
      ],
    },
  ],
};
