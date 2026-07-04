import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5750',
  name: 'ERC-5750',
  shortDescription: 'erc5750.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 5750,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5750',
  relatedSlugs: ['erc165', 'erc721', 'erc1155', 'erc2535'],
  sortOrder: 15750,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [165],
  relations: [
    { slug: 'erc165', kind: 'requires' },
    { slug: 'erc721', kind: 'usedWith' },
    { slug: 'erc1155', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-5750 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5750', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5750.introduction',
  designPurpose: 'erc5750.designPurpose',
  commonUsage: 'erc5750.commonUsage',

  // Convention-only ERC: the Specification section defines a method-level rule for the
  // trailing `bytes` parameter, not a Solidity interface. Per template §2/§6 → functions: [].
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5750.node.user',
      data: { address: '0xCaller' },
      layoutHint: 'source',
    },
    {
      id: 'fn-method',
      type: 'function',
      label: 'methodName1()',
      data: {
        fnType: 'write',
        signature: 'methodName1(uint256 _param1, address _param2, bytes calldata _data)',
      },
    },
    {
      id: 'erc5750-contract',
      type: 'contract',
      label: 'erc5750.node.contract',
      data: { functions: ['methodName1'] },
      layoutHint: 'center',
    },
    {
      id: 'storage-data',
      type: 'storage',
      label: 'erc5750.node.storageData',
      data: { slots: [{ key: '_data', label: 'bytes calldata' }] },
      layoutHint: 'storage',
    },
    {
      id: 'extension',
      type: 'contract',
      label: 'erc5750.node.extension',
      data: {},
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-method',
      source: 'user',
      target: 'fn-method',
      type: 'animated',
      label: 'erc5750.edge.callMethod',
    },
    { id: 'e-method-contract', source: 'fn-method', target: 'erc5750-contract', type: 'animated' },
    {
      id: 'e-contract-data',
      source: 'erc5750-contract',
      target: 'storage-data',
      type: 'labeled',
      label: 'erc5750.edge.readData',
    },
    {
      id: 'e-contract-extension',
      source: 'erc5750-contract',
      target: 'extension',
      type: 'labeled',
      label: 'erc5750.edge.invokeExtension',
    },
    {
      id: 'e-data-extension',
      source: 'storage-data',
      target: 'extension',
      type: 'labeled',
      label: 'erc5750.edge.forwardData',
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
      id: 'extension-call-walkthrough',
      name: 'erc5750.sim.extensionCallWalkthrough.name',
      description: 'erc5750.sim.extensionCallWalkthrough.desc',
      params: [
        {
          id: 'param1',
          label: 'erc5750.sim.extensionCallWalkthrough.param.param1',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'data',
          label: 'erc5750.sim.extensionCallWalkthrough.param.data',
          type: 'select',
          options: [
            { label: 'Signature', value: 'signature' },
            { label: 'Commitment', value: 'commitment' },
          ],
          defaultValue: 'signature',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5750.sim.extensionCallWalkthrough.step.call',
          mobileDescription: 'erc5750.sim.extensionCallWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-method'],
          highlightEdges: ['e-user-method'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc5750.sim.extensionCallWalkthrough.step.execute',
          mobileDescription: 'erc5750.sim.extensionCallWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-method', 'erc5750-contract', 'storage-data'],
          highlightEdges: ['e-method-contract', 'e-contract-data'],
          valueChanges: { 'storage-data._data': '0x → 0xSignaturePayload' },
          durationMs: 1200,
        },
        {
          id: 'step-extension',
          description: 'erc5750.sim.extensionCallWalkthrough.step.extension',
          mobileDescription: 'erc5750.sim.extensionCallWalkthrough.step.extension.mobile',
          highlightNodes: ['erc5750-contract', 'storage-data', 'extension'],
          highlightEdges: ['e-contract-extension', 'e-data-extension'],
          durationMs: 1000,
        },
      ],
    },
  ],
};
