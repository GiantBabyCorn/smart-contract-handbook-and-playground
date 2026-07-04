import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1077',
  name: 'ERC-1077',
  shortDescription: 'erc1077.short',
  category: 'account',
  entryType: 'standard',
  eipNumber: 1077,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1077',
  relatedSlugs: ['erc1271', 'erc20', 'erc4337', 'erc7702'],
  sortOrder: 11077,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [20, 191, 1271, 1344],
  relations: [
    { slug: 'erc20', kind: 'requires' },
    { slug: 'erc1271', kind: 'requires' },
    { slug: 'erc4337', kind: 'alternative' },
  ],
  references: [
    { label: 'ERC-1077 Specification', url: 'https://eips.ethereum.org/EIPS/eip-1077', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc1077.introduction',
  designPurpose: 'erc1077.designPurpose',
  commonUsage: 'erc1077.commonUsage',

  functions: [
    {
      name: 'executeGasRelay',
      signature:
        'executeGasRelay(bytes calldata _execData, uint256 _gasPrice, uint256 _gasLimit, address _gasToken, address _gasRelayer, bytes calldata _signature)',
      type: 'write',
      params: [
        { name: '_execData', type: 'bytes', description: 'erc1077.fn.executeGasRelay.params.execData' },
        { name: '_gasPrice', type: 'uint256', description: 'erc1077.fn.executeGasRelay.params.gasPrice' },
        { name: '_gasLimit', type: 'uint256', description: 'erc1077.fn.executeGasRelay.params.gasLimit' },
        { name: '_gasToken', type: 'address', description: 'erc1077.fn.executeGasRelay.params.gasToken' },
        { name: '_gasRelayer', type: 'address', description: 'erc1077.fn.executeGasRelay.params.gasRelayer' },
        { name: '_signature', type: 'bytes', description: 'erc1077.fn.executeGasRelay.params.signature' },
      ],
      description: 'erc1077.fn.executeGasRelay.desc',
      defaultSimValues: {
        gasPrice: '20000000000',
        gasLimit: '100000',
        gasToken: '0x0000000000000000000000000000000000000000',
      },
    },
    {
      name: 'executeGasRelayMsg',
      signature:
        'executeGasRelayMsg(uint256 _nonce, bytes memory _execData, uint256 _gasPrice, uint256 _gasLimit, address _gasToken, address _gasRelayer) → bytes',
      type: 'read',
      params: [
        { name: '_nonce', type: 'uint256', description: 'erc1077.fn.executeGasRelayMsg.params.nonce' },
        { name: '_execData', type: 'bytes', description: 'erc1077.fn.executeGasRelayMsg.params.execData' },
        { name: '_gasPrice', type: 'uint256', description: 'erc1077.fn.executeGasRelayMsg.params.gasPrice' },
        { name: '_gasLimit', type: 'uint256', description: 'erc1077.fn.executeGasRelayMsg.params.gasLimit' },
        { name: '_gasToken', type: 'address', description: 'erc1077.fn.executeGasRelayMsg.params.gasToken' },
        { name: '_gasRelayer', type: 'address', description: 'erc1077.fn.executeGasRelayMsg.params.gasRelayer' },
      ],
      returns: [{ name: 'message', type: 'bytes', description: 'erc1077.fn.executeGasRelayMsg.returns.message' }],
      description: 'erc1077.fn.executeGasRelayMsg.desc',
    },
    {
      name: 'executeGasRelayERC191Msg',
      signature:
        'executeGasRelayERC191Msg(uint256 _nonce, bytes memory _execData, uint256 _gasPrice, uint256 _gasLimit, address _gasToken, address _gasRelayer) → bytes',
      type: 'read',
      params: [
        { name: '_nonce', type: 'uint256', description: 'erc1077.fn.executeGasRelayERC191Msg.params.nonce' },
        { name: '_execData', type: 'bytes', description: 'erc1077.fn.executeGasRelayERC191Msg.params.execData' },
        { name: '_gasPrice', type: 'uint256', description: 'erc1077.fn.executeGasRelayERC191Msg.params.gasPrice' },
        { name: '_gasLimit', type: 'uint256', description: 'erc1077.fn.executeGasRelayERC191Msg.params.gasLimit' },
        { name: '_gasToken', type: 'address', description: 'erc1077.fn.executeGasRelayERC191Msg.params.gasToken' },
        { name: '_gasRelayer', type: 'address', description: 'erc1077.fn.executeGasRelayERC191Msg.params.gasRelayer' },
      ],
      returns: [{ name: 'message', type: 'bytes', description: 'erc1077.fn.executeGasRelayERC191Msg.returns.message' }],
      description: 'erc1077.fn.executeGasRelayERC191Msg.desc',
    },
    {
      name: 'lastNonce',
      signature: 'lastNonce() → uint nonce',
      type: 'read',
      params: [],
      returns: [{ name: 'nonce', type: 'uint', description: 'erc1077.fn.lastNonce.returns.nonce' }],
      description: 'erc1077.fn.lastNonce.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc1077.node.user',
      data: { address: '0xOwner' },
      layoutHint: 'source',
    },
    {
      id: 'relayer',
      type: 'user',
      label: 'erc1077.node.relayer',
      data: { address: '0xRelayer' },
      layoutHint: 'source',
    },
    {
      id: 'erc1077-contract',
      type: 'contract',
      label: 'erc1077.node.contract',
      data: { functions: ['executeGasRelay', 'executeGasRelayMsg', 'executeGasRelayERC191Msg', 'lastNonce'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-executeGasRelay',
      type: 'function',
      label: 'executeGasRelay()',
      data: {
        fnType: 'write',
        signature:
          'executeGasRelay(bytes calldata _execData, uint256 _gasPrice, uint256 _gasLimit, address _gasToken, address _gasRelayer, bytes calldata _signature)',
      },
    },
    {
      id: 'storage-nonce',
      type: 'storage',
      label: 'erc1077.node.storageNonce',
      data: { slots: [{ key: 'lastNonce', label: 'uint256' }] },
      layoutHint: 'storage',
    },
    {
      id: 'gas-refund',
      type: 'tokenFlow',
      label: 'erc1077.node.gasRefund',
      data: { symbol: 'gasToken', amount: 'gasSpent × gasPrice' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-relayer',
      source: 'user',
      target: 'relayer',
      type: 'animated',
      label: 'erc1077.edge.signMessage',
    },
    {
      id: 'e-relayer-fn',
      source: 'relayer',
      target: 'fn-executeGasRelay',
      type: 'animated',
      label: 'erc1077.edge.submitRelay',
    },
    {
      id: 'e-fn-contract',
      source: 'fn-executeGasRelay',
      target: 'erc1077-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-nonce',
      source: 'erc1077-contract',
      target: 'storage-nonce',
      type: 'labeled',
      label: 'erc1077.edge.updateNonce',
    },
    {
      id: 'e-contract-refund',
      source: 'erc1077-contract',
      target: 'gas-refund',
      type: 'labeled',
      label: 'erc1077.edge.payGas',
    },
    {
      id: 'e-refund-relayer',
      source: 'gas-refund',
      target: 'relayer',
      type: 'fundFlow',
      label: 'erc1077.edge.refundRelayer',
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
      id: 'gas-relay-walkthrough',
      name: 'erc1077.sim.gasRelayWalkthrough.name',
      description: 'erc1077.sim.gasRelayWalkthrough.desc',
      params: [
        {
          id: 'gasToken',
          label: 'erc1077.sim.gasRelayWalkthrough.param.gasToken',
          type: 'address',
          defaultValue: '0x0000000000000000000000000000000000000000',
        },
        {
          id: 'gasPrice',
          label: 'erc1077.sim.gasRelayWalkthrough.param.gasPrice',
          type: 'uint256',
          defaultValue: '20000000000',
        },
        {
          id: 'gasLimit',
          label: 'erc1077.sim.gasRelayWalkthrough.param.gasLimit',
          type: 'uint256',
          defaultValue: '100000',
        },
      ],
      steps: [
        {
          id: 'step-sign',
          description: 'erc1077.sim.gasRelayWalkthrough.step.sign',
          mobileDescription: 'erc1077.sim.gasRelayWalkthrough.step.sign.mobile',
          highlightNodes: ['user', 'relayer'],
          highlightEdges: ['e-user-relayer'],
          durationMs: 1000,
        },
        {
          id: 'step-submit',
          description: 'erc1077.sim.gasRelayWalkthrough.step.submit',
          mobileDescription: 'erc1077.sim.gasRelayWalkthrough.step.submit.mobile',
          highlightNodes: ['relayer', 'fn-executeGasRelay', 'erc1077-contract'],
          highlightEdges: ['e-relayer-fn', 'e-fn-contract'],
          durationMs: 1100,
        },
        {
          id: 'step-execute',
          description: 'erc1077.sim.gasRelayWalkthrough.step.execute',
          mobileDescription: 'erc1077.sim.gasRelayWalkthrough.step.execute.mobile',
          highlightNodes: ['erc1077-contract', 'storage-nonce'],
          highlightEdges: ['e-contract-nonce'],
          valueChanges: { 'storage-nonce.lastNonce': '5 → 6' },
          durationMs: 1200,
        },
        {
          id: 'step-refund',
          description: 'erc1077.sim.gasRelayWalkthrough.step.refund',
          mobileDescription: 'erc1077.sim.gasRelayWalkthrough.step.refund.mobile',
          highlightNodes: ['erc1077-contract', 'gas-refund', 'relayer'],
          highlightEdges: ['e-contract-refund', 'e-refund-relayer'],
          valueChanges: { 'gas-refund.amount': 'gasSpent × gasPrice' },
          durationMs: 900,
        },
      ],
    },
  ],
};
