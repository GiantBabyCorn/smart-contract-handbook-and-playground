import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc4804',
  name: 'ERC-4804',
  shortDescription: 'erc4804.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 4804,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-4804',
  relatedSlugs: ['erc5219', 'erc681', 'erc4361'],
  sortOrder: 14804,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [137],
  relations: [{ slug: 'erc5219', kind: 'usedWith' }],
  references: [
    { label: 'ERC-4804 Specification', url: 'https://eips.ethereum.org/EIPS/eip-4804', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc4804.introduction',
  designPurpose: 'erc4804.designPurpose',
  commonUsage: 'erc4804.commonUsage',

  // ERC-4804 specifies a URL grammar and translation convention, not a Solidity interface —
  // no functions to extract.
  functions: [],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'browser',
      type: 'user',
      label: 'erc4804.node.browser',
      data: { address: '0xClient' },
      layoutHint: 'source',
    },
    {
      id: 'resolver',
      type: 'contract',
      label: 'erc4804.node.resolver',
      data: {},
      layoutHint: 'center',
    },
    {
      id: 'url',
      type: 'storage',
      label: 'erc4804.node.url',
      data: {
        slots: [
          { key: 'scheme', label: 'web3:// | w3://' },
          { key: 'contractName', label: 'address / name.eth' },
          { key: 'chainid', label: 'uint (optional)' },
          { key: 'method', label: 'string (optional)' },
          { key: 'arguments', label: '[type!] value …' },
          { key: 'query', label: 'returns=(…)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'name-service',
      type: 'contract',
      label: 'erc4804.node.nameService',
      data: {},
    },
    {
      id: 'call-message',
      type: 'storage',
      label: 'erc4804.node.callMessage',
      data: {
        slots: [
          { key: 'To', label: 'address' },
          { key: 'From', label: 'address (0x0 default)' },
          { key: 'Calldata', label: 'bytes (ABI)' },
        ],
      },
    },
    {
      id: 'target',
      type: 'contract',
      label: 'erc4804.node.target',
      data: {},
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-browser-resolver',
      source: 'browser',
      target: 'resolver',
      type: 'animated',
      label: 'erc4804.edge.submitUrl',
    },
    {
      id: 'e-resolver-url',
      source: 'resolver',
      target: 'url',
      type: 'labeled',
      label: 'erc4804.edge.parseUrl',
    },
    {
      id: 'e-resolver-ns',
      source: 'resolver',
      target: 'name-service',
      type: 'animated',
      label: 'erc4804.edge.resolveName',
    },
    {
      id: 'e-resolver-message',
      source: 'resolver',
      target: 'call-message',
      type: 'labeled',
      label: 'erc4804.edge.buildMessage',
    },
    {
      id: 'e-message-target',
      source: 'call-message',
      target: 'target',
      type: 'animated',
      label: 'erc4804.edge.callTarget',
    },
    {
      id: 'e-target-browser',
      source: 'target',
      target: 'browser',
      type: 'labeled',
      label: 'erc4804.edge.returnContent',
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
      id: 'resolve-url-walkthrough',
      name: 'erc4804.sim.resolveUrlWalkthrough.name',
      description: 'erc4804.sim.resolveUrlWalkthrough.desc',
      params: [
        {
          id: 'url',
          label: 'erc4804.sim.resolveUrlWalkthrough.param.url',
          type: 'select',
          options: [
            { label: 'web3://vitalik.eth/', value: 'web3://vitalik.eth/' },
            {
              label: 'web3://cyberbrokers-meta.eth/renderBroker/9999',
              value: 'web3://cyberbrokers-meta.eth/renderBroker/9999',
            },
            {
              label: 'web3://usdc/balanceOf/vitalik.eth?returns=(uint256)',
              value: 'web3://usdc/balanceOf/vitalik.eth?returns=(uint256)',
            },
          ],
          defaultValue: 'web3://cyberbrokers-meta.eth/renderBroker/9999',
        },
      ],
      steps: [
        {
          id: 'step-submit',
          description: 'erc4804.sim.resolveUrlWalkthrough.step.submit',
          mobileDescription: 'erc4804.sim.resolveUrlWalkthrough.step.submit.mobile',
          highlightNodes: ['browser', 'resolver'],
          highlightEdges: ['e-browser-resolver'],
          durationMs: 1000,
        },
        {
          id: 'step-parse',
          description: 'erc4804.sim.resolveUrlWalkthrough.step.parse',
          mobileDescription: 'erc4804.sim.resolveUrlWalkthrough.step.parse.mobile',
          highlightNodes: ['resolver', 'url', 'name-service'],
          highlightEdges: ['e-resolver-url', 'e-resolver-ns'],
          valueChanges: {
            'url.contractName': 'cyberbrokers-meta.eth',
            'url.method': 'renderBroker(uint256)',
            'name-service.To': '0x…resolved address',
          },
          durationMs: 1200,
        },
        {
          id: 'step-build',
          description: 'erc4804.sim.resolveUrlWalkthrough.step.build',
          mobileDescription: 'erc4804.sim.resolveUrlWalkthrough.step.build.mobile',
          highlightNodes: ['resolver', 'call-message'],
          highlightEdges: ['e-resolver-message'],
          valueChanges: {
            'call-message.To': '0x… (cyberbrokers-meta.eth)',
            'call-message.Calldata': 'keccak("renderBroker(uint256)")[0:4] + abi.encode(9999)',
          },
          durationMs: 1000,
        },
        {
          id: 'step-call',
          description: 'erc4804.sim.resolveUrlWalkthrough.step.call',
          mobileDescription: 'erc4804.sim.resolveUrlWalkthrough.step.call.mobile',
          highlightNodes: ['call-message', 'target', 'browser'],
          highlightEdges: ['e-message-target', 'e-target-browser'],
          valueChanges: {
            'target.return': 'SVG image bytes',
            'browser.rendered': 'renderBroker(9999) displayed',
          },
          durationMs: 900,
        },
      ],
    },
  ],
};
