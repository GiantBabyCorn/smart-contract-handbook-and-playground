import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5219',
  name: 'ERC-5219',
  shortDescription: 'erc5219.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 5219,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5219',
  relatedSlugs: ['erc165', 'erc4361', 'erc721'],
  sortOrder: 15219,
  eipStatus: 'Final',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  references: [
    { label: 'ERC-5219 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5219', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5219.introduction',
  designPurpose: 'erc5219.designPurpose',
  commonUsage: 'erc5219.commonUsage',

  functions: [
    {
      name: 'request',
      signature:
        'request(string[] resource, KeyValue[] params) → (uint16 statusCode, string body, KeyValue[] headers)',
      type: 'read',
      params: [
        { name: 'resource', type: 'string[]', description: 'erc5219.fn.request.params.resource' },
        { name: 'params', type: 'KeyValue[]', description: 'erc5219.fn.request.params.params' },
      ],
      returns: [
        { name: 'statusCode', type: 'uint16', description: 'erc5219.fn.request.returns.statusCode' },
        { name: 'body', type: 'string', description: 'erc5219.fn.request.returns.body' },
        { name: 'headers', type: 'KeyValue[]', description: 'erc5219.fn.request.returns.headers' },
      ],
      description: 'erc5219.fn.request.desc',
      defaultSimValues: { resource: '["index.html"]', params: '[]' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5219.node.user',
      data: { address: '0xClient' },
      layoutHint: 'source',
    },
    {
      id: 'erc5219-contract',
      type: 'contract',
      label: 'erc5219.node.contract',
      data: { functions: ['request'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-request',
      type: 'function',
      label: 'request()',
      data: {
        fnType: 'read',
        signature: 'request(string[], KeyValue[]) → (uint16, string, KeyValue[])',
      },
    },
    {
      id: 'storage-resources',
      type: 'storage',
      label: 'erc5219.node.resources',
      data: { slots: [{ key: 'content', label: 'mapping(string => bytes)' }] },
      layoutHint: 'storage',
    },
    {
      id: 'response',
      type: 'tokenFlow',
      label: 'erc5219.node.response',
      data: { symbol: 'HTTP', amount: '200 OK' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-request',
      source: 'user',
      target: 'fn-request',
      type: 'animated',
      label: 'erc5219.edge.callRequest',
    },
    {
      id: 'e-request-contract',
      source: 'fn-request',
      target: 'erc5219-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-resources',
      source: 'erc5219-contract',
      target: 'storage-resources',
      type: 'labeled',
      label: 'erc5219.edge.readResources',
    },
    {
      id: 'e-contract-response',
      source: 'erc5219-contract',
      target: 'response',
      type: 'labeled',
      label: 'erc5219.edge.buildResponse',
    },
    {
      id: 'e-response-user',
      source: 'response',
      target: 'user',
      type: 'fundFlow',
      label: 'erc5219.edge.returnResponse',
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
      id: 'request-walkthrough',
      name: 'erc5219.sim.requestWalkthrough.name',
      description: 'erc5219.sim.requestWalkthrough.desc',
      params: [
        {
          id: 'resource',
          label: 'erc5219.sim.requestWalkthrough.param.resource',
          type: 'select',
          options: [
            { label: '/', value: '/' },
            { label: '/index.html', value: '/index.html' },
            { label: '/api/token/1', value: '/api/token/1' },
          ],
          defaultValue: '/index.html',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5219.sim.requestWalkthrough.step.call',
          mobileDescription: 'erc5219.sim.requestWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-request'],
          highlightEdges: ['e-user-request'],
          durationMs: 1000,
        },
        {
          id: 'step-resolve',
          description: 'erc5219.sim.requestWalkthrough.step.resolve',
          mobileDescription: 'erc5219.sim.requestWalkthrough.step.resolve.mobile',
          highlightNodes: ['fn-request', 'erc5219-contract', 'storage-resources'],
          highlightEdges: ['e-request-contract', 'e-contract-resources'],
          valueChanges: { 'storage-resources.content["/index.html"]': '"<html>…</html>"' },
          durationMs: 1200,
        },
        {
          id: 'step-build',
          description: 'erc5219.sim.requestWalkthrough.step.build',
          mobileDescription: 'erc5219.sim.requestWalkthrough.step.build.mobile',
          highlightNodes: ['erc5219-contract', 'response'],
          highlightEdges: ['e-contract-response'],
          valueChanges: {
            'response.statusCode': '200',
            'response.headers': 'Content-Type: text/html',
          },
          durationMs: 1000,
        },
        {
          id: 'step-return',
          description: 'erc5219.sim.requestWalkthrough.step.return',
          mobileDescription: 'erc5219.sim.requestWalkthrough.step.return.mobile',
          highlightNodes: ['response', 'user'],
          highlightEdges: ['e-response-user'],
          valueChanges: { 'user.rendered': 'index.html displayed' },
          durationMs: 800,
        },
      ],
    },
  ],
};
