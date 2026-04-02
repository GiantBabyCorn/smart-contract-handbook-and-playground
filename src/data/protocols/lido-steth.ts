import type { ProtocolEntry } from '../types';

export const entry: ProtocolEntry = {
  // ─── ERCMeta ───
  slug: 'lido-steth',
  name: 'Lido stETH',
  shortDescription: 'lido-steth.short',
  category: 'defi',
  entryType: 'protocol',
  officialUrl: 'https://lido.fi',
  relatedSlugs: ['eigenlayer', 'erc20', 'erc4626'],
  sortOrder: 3100,

  // ─── ERCContent ───
  introduction: 'lido-steth.introduction',
  designPurpose: 'lido-steth.designPurpose',
  commonUsage: 'lido-steth.commonUsage',

  functions: [
    {
      name: 'submit',
      signature: 'submit(address _referral) payable → uint256 shares',
      type: 'write',
      params: [
        { name: '_referral', type: 'address', description: 'lido-steth.fn.submit.params.referral' },
      ],
      returns: [{ name: 'shares', type: 'uint256', description: 'lido-steth.fn.submit.returns.shares' }],
      description: 'lido-steth.fn.submit.desc',
      defaultSimValues: { _referral: '0x0000000000000000000000000000000000000000', value: '1000000000000000000' },
    },
    {
      name: 'approve',
      signature: 'approve(address _spender, uint256 _amount) → bool',
      type: 'write',
      params: [
        { name: '_spender', type: 'address', description: 'lido-steth.fn.approve.params.spender' },
        { name: '_amount', type: 'uint256', description: 'lido-steth.fn.approve.params.amount' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'lido-steth.fn.approve.returns.success' }],
      description: 'lido-steth.fn.approve.desc',
      defaultSimValues: { _spender: '0xSpenderAddress', _amount: '1000000000000000000' },
    },
    {
      name: 'transferShares',
      signature: 'transferShares(address _recipient, uint256 _sharesAmount) → uint256 tokensAmount',
      type: 'write',
      params: [
        { name: '_recipient', type: 'address', description: 'lido-steth.fn.transferShares.params.recipient' },
        { name: '_sharesAmount', type: 'uint256', description: 'lido-steth.fn.transferShares.params.sharesAmount' },
      ],
      returns: [{ name: 'tokensAmount', type: 'uint256', description: 'lido-steth.fn.transferShares.returns.tokensAmount' }],
      description: 'lido-steth.fn.transferShares.desc',
      defaultSimValues: { _recipient: '0xRecipient', _sharesAmount: '900000000000000000' },
    },
    {
      name: 'getSharesByPooledEth',
      signature: 'getSharesByPooledEth(uint256 _ethAmount) → uint256 shares',
      type: 'read',
      params: [
        { name: '_ethAmount', type: 'uint256', description: 'lido-steth.fn.getSharesByPooledEth.params.ethAmount' },
      ],
      returns: [{ name: 'shares', type: 'uint256', description: 'lido-steth.fn.getSharesByPooledEth.returns.shares' }],
      description: 'lido-steth.fn.getSharesByPooledEth.desc',
      defaultSimValues: { _ethAmount: '1000000000000000000' },
    },
    {
      name: 'getPooledEthByShares',
      signature: 'getPooledEthByShares(uint256 _sharesAmount) → uint256 ethAmount',
      type: 'read',
      params: [
        { name: '_sharesAmount', type: 'uint256', description: 'lido-steth.fn.getPooledEthByShares.params.sharesAmount' },
      ],
      returns: [{ name: 'ethAmount', type: 'uint256', description: 'lido-steth.fn.getPooledEthByShares.returns.ethAmount' }],
      description: 'lido-steth.fn.getPooledEthByShares.desc',
      defaultSimValues: { _sharesAmount: '900000000000000000' },
    },
    {
      name: 'getTotalPooledEther',
      signature: 'getTotalPooledEther() → uint256',
      type: 'read',
      params: [],
      returns: [{ name: 'totalPooledEther', type: 'uint256', description: 'lido-steth.fn.getTotalPooledEther.returns.total' }],
      description: 'lido-steth.fn.getTotalPooledEther.desc',
      defaultSimValues: {},
    },
    {
      name: 'Transfer',
      signature: 'Transfer(address indexed from, address indexed to, uint256 value)',
      type: 'event',
      params: [
        { name: 'from', type: 'address', description: 'lido-steth.fn.Transfer.params.from' },
        { name: 'to', type: 'address', description: 'lido-steth.fn.Transfer.params.to' },
        { name: 'value', type: 'uint256', description: 'lido-steth.fn.Transfer.params.value' },
      ],
      description: 'lido-steth.fn.Transfer.desc',
    },
    {
      name: 'TransferShares',
      signature: 'TransferShares(address indexed from, address indexed to, uint256 sharesValue)',
      type: 'event',
      params: [
        { name: 'from', type: 'address', description: 'lido-steth.fn.TransferShares.params.from' },
        { name: 'to', type: 'address', description: 'lido-steth.fn.TransferShares.params.to' },
        { name: 'sharesValue', type: 'uint256', description: 'lido-steth.fn.TransferShares.params.sharesValue' },
      ],
      description: 'lido-steth.fn.TransferShares.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'staker',
      type: 'user',
      label: 'lido-steth.node.staker',
      data: { address: '0xStaker', balance: '10 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'lido-contract',
      type: 'contract',
      label: 'lido-steth.node.lido-contract',
      data: { functions: ['submit', 'approve', 'transferShares', 'getTotalPooledEther'] },
      layoutHint: 'center',
    },
    {
      id: 'steth-token',
      type: 'tokenFlow',
      label: 'lido-steth.node.steth-token',
      data: { symbol: 'stETH', amount: '0' },
    },
    {
      id: 'withdrawal-queue',
      type: 'contract',
      label: 'lido-steth.node.withdrawal-queue',
      data: { functions: ['requestWithdrawals', 'claimWithdrawal'] },
    },
    {
      id: 'beacon-chain',
      type: 'contract',
      label: 'lido-steth.node.beacon-chain',
      data: { functions: ['deposit'] },
      layoutHint: 'sink',
    },
    {
      id: 'oracle',
      type: 'contract',
      label: 'lido-steth.node.oracle',
      data: { functions: ['submitReport'] },
    },
    {
      id: 'node-operators',
      type: 'user',
      label: 'lido-steth.node.node-operators',
      data: { address: '0xNodeOperators', balance: 'N validators' },
    },
  ],

  flowEdges: [
    {
      id: 'e-staker-lido',
      source: 'staker',
      target: 'lido-contract',
      type: 'animated',
      label: 'lido-steth.edge.submitEth',
    },
    {
      id: 'e-lido-steth',
      source: 'lido-contract',
      target: 'steth-token',
      type: 'fundFlow',
      label: 'lido-steth.edge.mintSteth',
    },
    {
      id: 'e-steth-staker',
      source: 'steth-token',
      target: 'staker',
      type: 'fundFlow',
    },
    {
      id: 'e-lido-beacon',
      source: 'lido-contract',
      target: 'beacon-chain',
      type: 'animated',
      label: 'lido-steth.edge.depositEth',
    },
    {
      id: 'e-lido-operators',
      source: 'lido-contract',
      target: 'node-operators',
      type: 'labeled',
      label: 'lido-steth.edge.assignValidators',
    },
    {
      id: 'e-oracle-lido',
      source: 'oracle',
      target: 'lido-contract',
      type: 'labeled',
      label: 'lido-steth.edge.rebaseReport',
    },
    {
      id: 'e-staker-withdrawal',
      source: 'staker',
      target: 'withdrawal-queue',
      type: 'animated',
      label: 'lido-steth.edge.requestWithdrawal',
    },
    {
      id: 'e-withdrawal-lido',
      source: 'withdrawal-queue',
      target: 'lido-contract',
      type: 'labeled',
      label: 'lido-steth.edge.processWithdrawal',
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
      id: 'stake-eth-receive-steth',
      name: 'lido-steth.sim.stake-eth-receive-steth.name',
      description: 'lido-steth.sim.stake-eth-receive-steth.desc',
      params: [
        {
          id: 'ethAmount',
          label: 'lido-steth.sim.stake-eth-receive-steth.param.ethAmount',
          type: 'uint256',
          defaultValue: '1000000000000000000',
        },
        {
          id: 'referral',
          label: 'lido-steth.sim.stake-eth-receive-steth.param.referral',
          type: 'address',
          defaultValue: '0x0000000000000000000000000000000000000000',
        },
      ],
      steps: [
        {
          id: 'step-submit',
          description: 'lido-steth.sim.stake-eth-receive-steth.step.submit',
          mobileDescription: 'lido-steth.sim.stake-eth-receive-steth.step.submit.mobile',
          highlightNodes: ['staker', 'lido-contract'],
          highlightEdges: ['e-staker-lido'],
          valueChanges: { 'lido-contract.bufferedEther': '+1 ETH' },
          durationMs: 1200,
        },
        {
          id: 'step-mint-steth',
          description: 'lido-steth.sim.stake-eth-receive-steth.step.mintSteth',
          mobileDescription: 'lido-steth.sim.stake-eth-receive-steth.step.mintSteth.mobile',
          highlightNodes: ['lido-contract', 'steth-token', 'staker'],
          highlightEdges: ['e-lido-steth', 'e-steth-staker'],
          valueChanges: {
            'steth-token.amount': '0 → ~1 stETH',
            'staker.balance': '10 ETH → 9 ETH + 1 stETH',
          },
          durationMs: 1500,
        },
        {
          id: 'step-deposit-beacon',
          description: 'lido-steth.sim.stake-eth-receive-steth.step.depositBeacon',
          mobileDescription: 'lido-steth.sim.stake-eth-receive-steth.step.depositBeacon.mobile',
          highlightNodes: ['lido-contract', 'node-operators', 'beacon-chain'],
          highlightEdges: ['e-lido-operators', 'e-lido-beacon'],
          valueChanges: {
            'node-operators.validators': 'validator assigned',
            'beacon-chain.deposited': '+1 ETH to Beacon Chain',
          },
          durationMs: 1500,
        },
        {
          id: 'step-rebase',
          description: 'lido-steth.sim.stake-eth-receive-steth.step.rebase',
          mobileDescription: 'lido-steth.sim.stake-eth-receive-steth.step.rebase.mobile',
          highlightNodes: ['oracle', 'lido-contract', 'steth-token'],
          highlightEdges: ['e-oracle-lido'],
          valueChanges: {
            'lido-contract.totalPooledEther': 'increased by staking rewards',
            'steth-token.amount': '1 stETH → 1.0X stETH (rebase)',
          },
          durationMs: 2000,
        },
      ],
    },
  ],

  contracts: [
    {
      chain: 'Ethereum',
      address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      label: 'Lido stETH',
    },
  ],
};
