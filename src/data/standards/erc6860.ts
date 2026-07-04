import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc6860',
  name: 'ERC-6860',
  shortDescription: 'erc6860.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 6860,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-6860',
  relatedSlugs: ['erc681', 'erc5219', 'erc4361'],
  sortOrder: 16860,
  eipStatus: 'Draft',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [137],
  references: [
    { label: 'ERC-6860 Specification', url: 'https://eips.ethereum.org/EIPS/eip-6860', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc6860.introduction',
  designPurpose: 'erc6860.designPurpose',
  commonUsage: 'erc6860.commonUsage',

  // ERC-6860 is mostly an ABNF URL grammar plus a translation algorithm, but its
  // Specification section does define one Solidity interface member — the resolveMode()
  // mode-detection hook the target contract exposes — which is extracted here.
  functions: [
    {
      name: 'resolveMode',
      signature: 'resolveMode() → bytes32',
      type: 'read',
      params: [],
      returns: [
        { name: 'mode', type: 'bytes32', description: 'erc6860.fn.resolveMode.returns.mode' },
      ],
      description: 'erc6860.fn.resolveMode.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'browser',
      type: 'user',
      label: 'erc6860.node.browser',
      data: { address: '0xClient' },
      layoutHint: 'source',
    },
    {
      id: 'resolver',
      type: 'contract',
      label: 'erc6860.node.resolver',
      data: {},
      layoutHint: 'center',
    },
    {
      id: 'url-parts',
      type: 'storage',
      label: 'erc6860.node.urlParts',
      data: {
        slots: [
          { key: 'contractName', label: 'address / ENS name' },
          { key: 'chainid', label: 'uint (optional)' },
          { key: 'pathQuery', label: 'method + arguments' },
          { key: 'fragment', label: 'string (not sent)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'fn-resolveMode',
      type: 'function',
      label: 'resolveMode()',
      data: { fnType: 'read', signature: 'resolveMode() → bytes32' },
    },
    {
      id: 'target',
      type: 'contract',
      label: 'erc6860.node.target',
      data: { functions: ['resolveMode'] },
    },
    {
      id: 'evm-message',
      type: 'storage',
      label: 'erc6860.node.evmMessage',
      data: {
        slots: [
          { key: 'To', label: 'target address' },
          { key: 'From', label: 'userinfo / 0x0' },
          { key: 'Calldata', label: 'bytes' },
        ],
      },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-browser-resolver',
      source: 'browser',
      target: 'resolver',
      type: 'animated',
      label: 'erc6860.edge.requestUrl',
    },
    {
      id: 'e-resolver-url',
      source: 'resolver',
      target: 'url-parts',
      type: 'labeled',
      label: 'erc6860.edge.parseUrl',
    },
    {
      id: 'e-resolver-resolveMode',
      source: 'resolver',
      target: 'fn-resolveMode',
      type: 'animated',
      label: 'erc6860.edge.detectMode',
    },
    {
      id: 'e-resolveMode-target',
      source: 'fn-resolveMode',
      target: 'target',
      type: 'animated',
    },
    {
      id: 'e-resolver-evm',
      source: 'resolver',
      target: 'evm-message',
      type: 'labeled',
      label: 'erc6860.edge.buildMessage',
    },
    {
      id: 'e-evm-target',
      source: 'evm-message',
      target: 'target',
      type: 'labeled',
      label: 'erc6860.edge.sendCall',
    },
    {
      id: 'e-target-browser',
      source: 'target',
      target: 'browser',
      type: 'fundFlow',
      label: 'erc6860.edge.returnData',
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
      id: 'url-translation-walkthrough',
      name: 'erc6860.sim.urlTranslationWalkthrough.name',
      description: 'erc6860.sim.urlTranslationWalkthrough.desc',
      params: [
        {
          id: 'url',
          label: 'erc6860.sim.urlTranslationWalkthrough.param.url',
          type: 'select',
          options: [
            {
              label: 'web3://cyberbrokers-meta.eth/renderBroker/9999',
              value: 'web3://cyberbrokers-meta.eth/renderBroker/9999',
            },
            { label: 'web3://vitalikblog.eth:5/', value: 'web3://vitalikblog.eth:5/' },
            {
              label: 'web3://0xA0b8…/balanceOf/vitalik.eth?returns=(uint256)',
              value:
                'web3://0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/balanceOf/vitalik.eth?returns=(uint256)',
            },
          ],
          defaultValue: 'web3://cyberbrokers-meta.eth/renderBroker/9999',
        },
      ],
      steps: [
        {
          id: 'step-request',
          description: 'erc6860.sim.urlTranslationWalkthrough.step.request',
          mobileDescription: 'erc6860.sim.urlTranslationWalkthrough.step.request.mobile',
          highlightNodes: ['browser', 'resolver'],
          highlightEdges: ['e-browser-resolver'],
          durationMs: 1000,
        },
        {
          id: 'step-parse',
          description: 'erc6860.sim.urlTranslationWalkthrough.step.parse',
          mobileDescription: 'erc6860.sim.urlTranslationWalkthrough.step.parse.mobile',
          highlightNodes: ['resolver', 'url-parts'],
          highlightEdges: ['e-resolver-url'],
          valueChanges: {
            'url-parts.contractName': 'cyberbrokers-meta.eth → 0x…',
            'url-parts.pathQuery': 'renderBroker/9999',
          },
          durationMs: 1200,
        },
        {
          id: 'step-detect',
          description: 'erc6860.sim.urlTranslationWalkthrough.step.detect',
          mobileDescription: 'erc6860.sim.urlTranslationWalkthrough.step.detect.mobile',
          highlightNodes: ['resolver', 'fn-resolveMode', 'target'],
          highlightEdges: ['e-resolver-resolveMode', 'e-resolveMode-target'],
          valueChanges: { 'target.resolveMode': '"" → auto' },
          durationMs: 1000,
        },
        {
          id: 'step-call',
          description: 'erc6860.sim.urlTranslationWalkthrough.step.call',
          mobileDescription: 'erc6860.sim.urlTranslationWalkthrough.step.call.mobile',
          highlightNodes: ['resolver', 'evm-message', 'target', 'browser'],
          highlightEdges: ['e-resolver-evm', 'e-evm-target', 'e-target-browser'],
          valueChanges: {
            'evm-message.Calldata': '0x + renderBroker(uint256)[0:4] + abi.encode(9999)',
          },
          durationMs: 900,
        },
      ],
    },
  ],
};
