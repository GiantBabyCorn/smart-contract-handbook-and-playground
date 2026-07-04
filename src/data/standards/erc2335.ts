import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2335',
  name: 'ERC-2335',
  shortDescription: 'erc2335.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 2335,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2335',
  relatedSlugs: ['erc1271', 'erc2098', 'erc4361'],
  sortOrder: 12335,
  eipStatus: 'Review',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [2333, 2334],
  references: [
    { label: 'ERC-2335 Specification', url: 'https://eips.ethereum.org/EIPS/eip-2335', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc2335.introduction',
  designPurpose: 'erc2335.designPurpose',
  commonUsage: 'erc2335.commonUsage',

  // ERC-2335 specifies a JSON keystore file format and its decryption procedure, not a
  // Solidity interface, so there are no callable on-chain functions to document.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc2335.node.user',
      data: { address: '0xKeyOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc2335-keystore',
      type: 'contract',
      label: 'erc2335.node.keystore',
      data: { functions: ['kdf', 'checksum', 'cipher'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-kdf',
      type: 'function',
      label: 'kdf()',
      data: { fnType: 'read', signature: 'kdf(password, params) → decryption_key' },
    },
    {
      id: 'fn-checksum',
      type: 'function',
      label: 'checksum()',
      data: {
        fnType: 'read',
        signature: 'checksum(decryption_key[16:32] | cipher.message) → valid_password',
      },
    },
    {
      id: 'fn-cipher',
      type: 'function',
      label: 'cipher()',
      data: { fnType: 'read', signature: 'cipher(decryption_key, cipher.message) → secret' },
    },
    {
      id: 'storage-file',
      type: 'storage',
      label: 'erc2335.node.storageFile',
      data: {
        slots: [
          { key: 'crypto.kdf', label: 'module: scrypt / pbkdf2' },
          { key: 'crypto.checksum', label: 'module: sha256' },
          { key: 'crypto.cipher', label: 'module: aes-128-ctr' },
          { key: 'pubkey', label: 'BLS12-381 public key' },
          { key: 'path', label: 'ERC-2334 key path' },
          { key: 'version', label: '4' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'signer',
      type: 'contract',
      label: 'erc2335.node.signer',
      data: {},
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-kdf',
      source: 'user',
      target: 'fn-kdf',
      type: 'animated',
      label: 'erc2335.edge.providePassword',
    },
    {
      id: 'e-kdf-keystore',
      source: 'fn-kdf',
      target: 'erc2335-keystore',
      type: 'animated',
    },
    {
      id: 'e-keystore-file',
      source: 'erc2335-keystore',
      target: 'storage-file',
      type: 'labeled',
      label: 'erc2335.edge.readModules',
    },
    {
      id: 'e-keystore-checksum',
      source: 'erc2335-keystore',
      target: 'fn-checksum',
      type: 'animated',
      label: 'erc2335.edge.verifyPassword',
    },
    {
      id: 'e-keystore-cipher',
      source: 'erc2335-keystore',
      target: 'fn-cipher',
      type: 'animated',
      label: 'erc2335.edge.decryptSecret',
    },
    {
      id: 'e-cipher-signer',
      source: 'fn-cipher',
      target: 'signer',
      type: 'labeled',
      label: 'erc2335.edge.recoverKey',
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
      id: 'decrypt-keystore-walkthrough',
      name: 'erc2335.sim.decryptKeystoreWalkthrough.name',
      description: 'erc2335.sim.decryptKeystoreWalkthrough.desc',
      params: [
        {
          id: 'password',
          label: 'erc2335.sim.decryptKeystoreWalkthrough.param.password',
          type: 'select',
          options: [
            { label: 'testpassword🔑', value: 'testpassword🔑' },
            { label: 'validator-pass', value: 'validator-pass' },
          ],
          defaultValue: 'testpassword🔑',
        },
        {
          id: 'kdf',
          label: 'erc2335.sim.decryptKeystoreWalkthrough.param.kdf',
          type: 'select',
          options: [
            { label: 'scrypt', value: 'scrypt' },
            { label: 'pbkdf2', value: 'pbkdf2' },
          ],
          defaultValue: 'scrypt',
        },
      ],
      steps: [
        {
          id: 'step-derive',
          description: 'erc2335.sim.decryptKeystoreWalkthrough.step.derive',
          mobileDescription: 'erc2335.sim.decryptKeystoreWalkthrough.step.derive.mobile',
          highlightNodes: ['user', 'fn-kdf'],
          highlightEdges: ['e-user-kdf'],
          durationMs: 1000,
        },
        {
          id: 'step-verify',
          description: 'erc2335.sim.decryptKeystoreWalkthrough.step.verify',
          mobileDescription: 'erc2335.sim.decryptKeystoreWalkthrough.step.verify.mobile',
          highlightNodes: ['fn-kdf', 'erc2335-keystore', 'fn-checksum'],
          highlightEdges: ['e-kdf-keystore', 'e-keystore-checksum'],
          valueChanges: { 'fn-checksum.valid_password': 'false → true' },
          durationMs: 1200,
        },
        {
          id: 'step-decrypt',
          description: 'erc2335.sim.decryptKeystoreWalkthrough.step.decrypt',
          mobileDescription: 'erc2335.sim.decryptKeystoreWalkthrough.step.decrypt.mobile',
          highlightNodes: ['erc2335-keystore', 'storage-file', 'fn-cipher'],
          highlightEdges: ['e-keystore-file', 'e-keystore-cipher'],
          durationMs: 1100,
        },
        {
          id: 'step-recover',
          description: 'erc2335.sim.decryptKeystoreWalkthrough.step.recover',
          mobileDescription: 'erc2335.sim.decryptKeystoreWalkthrough.step.recover.mobile',
          highlightNodes: ['fn-cipher', 'signer'],
          highlightEdges: ['e-cipher-signer'],
          valueChanges: { 'signer.secret': 'unset → recovered BLS12-381 private key' },
          durationMs: 900,
        },
      ],
    },
  ],
};
