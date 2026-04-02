import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc3643',
  name: 'ERC-3643',
  shortDescription: 'erc3643.short',
  category: 'rwa',
  entryType: 'standard',
  eipNumber: 3643,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-3643',
  relatedSlugs: ['erc20', 'erc1271', 'erc3525'],
  sortOrder: 1700,

  // ─── ERCContent ───
  introduction: 'erc3643.introduction',
  designPurpose: 'erc3643.designPurpose',
  commonUsage: 'erc3643.commonUsage',

  functions: [
    {
      name: 'transfer',
      signature: 'transfer(address to, uint256 amount) → bool',
      type: 'write',
      params: [
        { name: 'to', type: 'address', description: 'erc3643.fn.transfer.params.to' },
        { name: 'amount', type: 'uint256', description: 'erc3643.fn.transfer.params.amount' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc3643.fn.transfer.returns.success' }],
      description: 'erc3643.fn.transfer.desc',
      defaultSimValues: { to: '0xInvestorB', amount: '1000' },
    },
    {
      name: 'isVerified',
      signature: 'isVerified(address investor) → bool',
      type: 'read',
      params: [
        { name: 'investor', type: 'address', description: 'erc3643.fn.isVerified.params.investor' },
      ],
      returns: [{ name: 'verified', type: 'bool', description: 'erc3643.fn.isVerified.returns.verified' }],
      description: 'erc3643.fn.isVerified.desc',
      defaultSimValues: { investor: '0xInvestorA' },
    },
    {
      name: 'identityRegistry',
      signature: 'identityRegistry() → address',
      type: 'read',
      params: [],
      returns: [{ name: 'registry', type: 'address', description: 'erc3643.fn.identityRegistry.returns.registry' }],
      description: 'erc3643.fn.identityRegistry.desc',
      defaultSimValues: {},
    },
    {
      name: 'compliance',
      signature: 'compliance() → address',
      type: 'read',
      params: [],
      returns: [{ name: 'complianceModule', type: 'address', description: 'erc3643.fn.compliance.returns.complianceModule' }],
      description: 'erc3643.fn.compliance.desc',
      defaultSimValues: {},
    },
    {
      name: 'pause',
      signature: 'pause()',
      type: 'write',
      params: [],
      description: 'erc3643.fn.pause.desc',
      defaultSimValues: {},
    },
    {
      name: 'freeze',
      signature: 'freeze(address userAddress)',
      type: 'write',
      params: [
        { name: 'userAddress', type: 'address', description: 'erc3643.fn.freeze.params.userAddress' },
      ],
      description: 'erc3643.fn.freeze.desc',
      defaultSimValues: { userAddress: '0xSuspiciousInvestor' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'investor',
      type: 'user',
      label: 'erc3643.node.investor',
      data: { address: '0xInvestorA', balance: '10000 TREX' },
      layoutHint: 'source',
    },
    {
      id: 'token-contract',
      type: 'contract',
      label: 'erc3643.node.tokenContract',
      data: { functions: ['transfer', 'pause', 'freeze', 'isVerified'] },
      layoutHint: 'center',
    },
    {
      id: 'identity-registry',
      type: 'contract',
      label: 'erc3643.node.identityRegistry',
      data: { functions: ['isVerified', 'registerIdentity', 'deleteIdentity'] },
    },
    {
      id: 'compliance-module',
      type: 'contract',
      label: 'erc3643.node.complianceModule',
      data: { functions: ['canTransfer', 'transferred', 'created', 'destroyed'] },
    },
    {
      id: 'trusted-issuer',
      type: 'contract',
      label: 'erc3643.node.trustedIssuer',
      data: { functions: ['addTrustedIssuer', 'removeTrustedIssuer', 'isTrustedIssuer'] },
    },
    {
      id: 'claim-registry',
      type: 'contract',
      label: 'erc3643.node.claimRegistry',
      data: { functions: ['addClaim', 'getClaim', 'removeClaim'] },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-investor-token',
      source: 'investor',
      target: 'token-contract',
      type: 'animated',
      label: 'erc3643.edge.transfer',
    },
    {
      id: 'e-token-identity',
      source: 'token-contract',
      target: 'identity-registry',
      type: 'labeled',
      label: 'erc3643.edge.checkIdentity',
    },
    {
      id: 'e-token-compliance',
      source: 'token-contract',
      target: 'compliance-module',
      type: 'labeled',
      label: 'erc3643.edge.checkCompliance',
    },
    {
      id: 'e-identity-issuer',
      source: 'identity-registry',
      target: 'trusted-issuer',
      type: 'labeled',
      label: 'erc3643.edge.verifyIssuer',
    },
    {
      id: 'e-identity-claim',
      source: 'identity-registry',
      target: 'claim-registry',
      type: 'labeled',
      label: 'erc3643.edge.fetchClaim',
    },
    {
      id: 'e-compliance-token',
      source: 'compliance-module',
      target: 'token-contract',
      type: 'fundFlow',
      label: 'erc3643.edge.approveTransfer',
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
      id: 'compliant-transfer',
      name: 'erc3643.sim.compliantTransfer.name',
      description: 'erc3643.sim.compliantTransfer.desc',
      params: [
        {
          id: 'sender',
          label: 'erc3643.sim.compliantTransfer.param.sender',
          type: 'address',
          defaultValue: '0xInvestorA',
        },
        {
          id: 'recipient',
          label: 'erc3643.sim.compliantTransfer.param.recipient',
          type: 'address',
          defaultValue: '0xInvestorB',
        },
        {
          id: 'amount',
          label: 'erc3643.sim.compliantTransfer.param.amount',
          type: 'uint256',
          defaultValue: '1000',
        },
      ],
      steps: [
        {
          id: 'step-initiate',
          description: 'erc3643.sim.compliantTransfer.step.initiate',
          mobileDescription: 'erc3643.sim.compliantTransfer.step.initiate.mobile',
          highlightNodes: ['investor', 'token-contract'],
          highlightEdges: ['e-investor-token'],
          valueChanges: { 'token-contract.pendingTransfer': '0xInvestorA → 0xInvestorB: 1000' },
          durationMs: 1000,
        },
        {
          id: 'step-identity-check',
          description: 'erc3643.sim.compliantTransfer.step.identityCheck',
          mobileDescription: 'erc3643.sim.compliantTransfer.step.identityCheck.mobile',
          highlightNodes: ['token-contract', 'identity-registry', 'trusted-issuer', 'claim-registry'],
          highlightEdges: ['e-token-identity', 'e-identity-issuer', 'e-identity-claim'],
          valueChanges: {
            'identity-registry.senderVerified': 'true',
            'identity-registry.recipientVerified': 'true',
          },
          durationMs: 1400,
        },
        {
          id: 'step-compliance-check',
          description: 'erc3643.sim.compliantTransfer.step.complianceCheck',
          mobileDescription: 'erc3643.sim.compliantTransfer.step.complianceCheck.mobile',
          highlightNodes: ['token-contract', 'compliance-module'],
          highlightEdges: ['e-token-compliance', 'e-compliance-token'],
          valueChanges: {
            'compliance-module.canTransfer': 'true',
            'compliance-module.countryRule': 'passed',
          },
          durationMs: 1200,
        },
        {
          id: 'step-settle',
          description: 'erc3643.sim.compliantTransfer.step.settle',
          mobileDescription: 'erc3643.sim.compliantTransfer.step.settle.mobile',
          highlightNodes: ['investor', 'token-contract'],
          highlightEdges: ['e-investor-token'],
          valueChanges: {
            'investor.balance': '10000 → 9000 TREX',
            'recipient.balance': '0 → 1000 TREX',
          },
          durationMs: 1100,
        },
      ],
    },
  ],
};
