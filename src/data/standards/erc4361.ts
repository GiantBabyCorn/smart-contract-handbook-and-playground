import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc4361',
  name: 'ERC-4361',
  shortDescription: 'erc4361.short',
  category: 'identity',
  entryType: 'standard',
  eipNumber: 4361,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-4361',
  relatedSlugs: ['erc1271', 'erc5267', 'erc7702'],
  sortOrder: 2100,

  // ─── ERCContent ───
  introduction: 'erc4361.introduction',
  designPurpose: 'erc4361.designPurpose',
  commonUsage: 'erc4361.commonUsage',

  functions: [
    {
      name: 'constructMessage',
      signature: 'constructMessage(SiweMessage calldata message) → string',
      type: 'read',
      params: [
        { name: 'message', type: 'SiweMessage', description: 'erc4361.fn.constructMessage.params.message' },
      ],
      returns: [{ name: 'messageString', type: 'string', description: 'erc4361.fn.constructMessage.returns.messageString' }],
      description: 'erc4361.fn.constructMessage.desc',
      defaultSimValues: { message: '0x' },
    },
    {
      name: 'signMessage',
      signature: 'signMessage(bytes32 messageHash) → bytes signature',
      type: 'write',
      params: [
        { name: 'messageHash', type: 'bytes32', description: 'erc4361.fn.signMessage.params.messageHash' },
      ],
      returns: [{ name: 'signature', type: 'bytes', description: 'erc4361.fn.signMessage.returns.signature' }],
      description: 'erc4361.fn.signMessage.desc',
      defaultSimValues: { messageHash: '0xMessageHash' },
    },
    {
      name: 'verifySignature',
      signature: 'verifySignature(string calldata message, bytes calldata signature) → address signer',
      type: 'read',
      params: [
        { name: 'message', type: 'string', description: 'erc4361.fn.verifySignature.params.message' },
        { name: 'signature', type: 'bytes', description: 'erc4361.fn.verifySignature.params.signature' },
      ],
      returns: [{ name: 'signer', type: 'address', description: 'erc4361.fn.verifySignature.returns.signer' }],
      description: 'erc4361.fn.verifySignature.desc',
      defaultSimValues: { message: 'example.com wants you to sign in...', signature: '0xSig' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user-wallet',
      type: 'user',
      label: 'erc4361.node.userWallet',
      data: { address: '0xUser', balance: '0.1 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'dapp-frontend',
      type: 'contract',
      label: 'erc4361.node.dappFrontend',
      data: { functions: ['constructMessage', 'requestSignature'] },
    },
    {
      id: 'dapp-server',
      type: 'contract',
      label: 'erc4361.node.dappServer',
      data: { functions: ['verifySignature', 'createSession', 'revokeSession'] },
      layoutHint: 'center',
    },
    {
      id: 'siwe-message',
      type: 'storage',
      label: 'erc4361.node.siweMessage',
      data: {
        slots: [
          { key: 'domain', label: 'string' },
          { key: 'address', label: 'address' },
          { key: 'nonce', label: 'string' },
          { key: 'issuedAt', label: 'string' },
          { key: 'chainId', label: 'uint256' },
        ],
      },
    },
    {
      id: 'signature',
      type: 'tokenFlow',
      label: 'erc4361.node.signature',
      data: { symbol: 'SIG', amount: 'bytes65' },
    },
    {
      id: 'session',
      type: 'storage',
      label: 'erc4361.node.session',
      data: {
        slots: [
          { key: 'address', label: 'address' },
          { key: 'expiresAt', label: 'timestamp' },
          { key: 'nonce', label: 'string' },
        ],
      },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-frontend-wallet',
      source: 'dapp-frontend',
      target: 'user-wallet',
      type: 'animated',
      label: 'erc4361.edge.requestSign',
    },
    {
      id: 'e-frontend-siwe',
      source: 'dapp-frontend',
      target: 'siwe-message',
      type: 'labeled',
      label: 'erc4361.edge.constructMessage',
    },
    {
      id: 'e-wallet-signature',
      source: 'user-wallet',
      target: 'signature',
      type: 'animated',
      label: 'erc4361.edge.signMessage',
    },
    {
      id: 'e-signature-server',
      source: 'signature',
      target: 'dapp-server',
      type: 'animated',
      label: 'erc4361.edge.submitSignature',
    },
    {
      id: 'e-server-session',
      source: 'dapp-server',
      target: 'session',
      type: 'fundFlow',
      label: 'erc4361.edge.createSession',
    },
    {
      id: 'e-siwe-server',
      source: 'siwe-message',
      target: 'dapp-server',
      type: 'labeled',
      label: 'erc4361.edge.verifyNonce',
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
      id: 'siwe-auth',
      name: 'erc4361.sim.siweAuth.name',
      description: 'erc4361.sim.siweAuth.desc',
      params: [
        {
          id: 'userAddress',
          label: 'erc4361.sim.siweAuth.param.userAddress',
          type: 'address',
          defaultValue: '0xMyWallet',
        },
        {
          id: 'domain',
          label: 'erc4361.sim.siweAuth.param.domain',
          type: 'select',
          options: [
            { label: 'app.example.com', value: 'app.example.com' },
            { label: 'defi.protocol.io', value: 'defi.protocol.io' },
          ],
          defaultValue: 'app.example.com',
        },
      ],
      steps: [
        {
          id: 'step-request',
          description: 'erc4361.sim.siweAuth.step.request',
          mobileDescription: 'erc4361.sim.siweAuth.step.request.mobile',
          highlightNodes: ['dapp-frontend', 'siwe-message'],
          highlightEdges: ['e-frontend-siwe'],
          valueChanges: {
            'siwe-message.domain': 'app.example.com',
            'siwe-message.nonce': 'raNdOmN0nce42',
            'siwe-message.issuedAt': '2026-04-02T00:00:00Z',
          },
          durationMs: 900,
        },
        {
          id: 'step-prompt',
          description: 'erc4361.sim.siweAuth.step.prompt',
          mobileDescription: 'erc4361.sim.siweAuth.step.prompt.mobile',
          highlightNodes: ['dapp-frontend', 'user-wallet'],
          highlightEdges: ['e-frontend-wallet'],
          valueChanges: { 'user-wallet.popup': 'SIWE message displayed' },
          durationMs: 1000,
        },
        {
          id: 'step-sign',
          description: 'erc4361.sim.siweAuth.step.sign',
          mobileDescription: 'erc4361.sim.siweAuth.step.sign.mobile',
          highlightNodes: ['user-wallet', 'signature'],
          highlightEdges: ['e-wallet-signature'],
          valueChanges: {
            'signature.value': '0xABC...65 bytes ECDSA signature',
            'user-wallet.signed': 'true',
          },
          durationMs: 1100,
        },
        {
          id: 'step-verify',
          description: 'erc4361.sim.siweAuth.step.verify',
          mobileDescription: 'erc4361.sim.siweAuth.step.verify.mobile',
          highlightNodes: ['signature', 'dapp-server', 'siwe-message'],
          highlightEdges: ['e-signature-server', 'e-siwe-server'],
          valueChanges: {
            'dapp-server.recoveredAddress': '0xMyWallet',
            'dapp-server.nonceConsumed': 'raNdOmN0nce42',
          },
          durationMs: 1200,
        },
        {
          id: 'step-session',
          description: 'erc4361.sim.siweAuth.step.session',
          mobileDescription: 'erc4361.sim.siweAuth.step.session.mobile',
          highlightNodes: ['dapp-server', 'session'],
          highlightEdges: ['e-server-session'],
          valueChanges: {
            'session.address': '0xMyWallet',
            'session.expiresAt': '2026-04-03T00:00:00Z',
            'session.status': 'active',
          },
          durationMs: 1000,
        },
      ],
    },
  ],
};
