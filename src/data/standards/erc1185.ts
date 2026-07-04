import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc1185',
  name: 'ERC-1185',
  shortDescription: 'erc1185.short',
  category: 'identity',
  entryType: 'standard',
  eipNumber: 1185,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-1185',
  relatedSlugs: ['erc165', 'erc4361', 'erc5219'],
  sortOrder: 11185,
  eipStatus: 'Review',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [137],
  references: [
    { label: 'ERC-1185 Specification', url: 'https://eips.ethereum.org/EIPS/eip-1185', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc1185.introduction',
  designPurpose: 'erc1185.designPurpose',
  commonUsage: 'erc1185.commonUsage',

  functions: [
    {
      name: 'setDNSRecords',
      signature: 'setDNSRecords(bytes32 node, bytes data)',
      type: 'write',
      params: [
        { name: 'node', type: 'bytes32', description: 'erc1185.fn.setDNSRecords.params.node' },
        { name: 'data', type: 'bytes', description: 'erc1185.fn.setDNSRecords.params.data' },
      ],
      description: 'erc1185.fn.setDNSRecords.desc',
      defaultSimValues: { node: '0xNamehash' },
    },
    {
      name: 'clearDNSZone',
      signature: 'clearDNSZone(bytes32 node)',
      type: 'write',
      params: [{ name: 'node', type: 'bytes32', description: 'erc1185.fn.clearDNSZone.params.node' }],
      description: 'erc1185.fn.clearDNSZone.desc',
      defaultSimValues: { node: '0xNamehash' },
    },
    {
      name: 'dnsRecords',
      signature: 'dnsRecords(bytes32 node, bytes32 name, uint16 resource) → bytes',
      type: 'read',
      params: [
        { name: 'node', type: 'bytes32', description: 'erc1185.fn.dnsRecords.params.node' },
        { name: 'name', type: 'bytes32', description: 'erc1185.fn.dnsRecords.params.name' },
        { name: 'resource', type: 'uint16', description: 'erc1185.fn.dnsRecords.params.resource' },
      ],
      returns: [{ name: 'records', type: 'bytes', description: 'erc1185.fn.dnsRecords.returns.records' }],
      description: 'erc1185.fn.dnsRecords.desc',
      defaultSimValues: { node: '0xNamehash', resource: '1' },
    },
    {
      name: 'hasDNSRecords',
      signature: 'hasDNSRecords(bytes32 node, bytes32 name) → bool',
      type: 'read',
      params: [
        { name: 'node', type: 'bytes32', description: 'erc1185.fn.hasDNSRecords.params.node' },
        { name: 'name', type: 'bytes32', description: 'erc1185.fn.hasDNSRecords.params.name' },
      ],
      returns: [{ name: 'exists', type: 'bool', description: 'erc1185.fn.hasDNSRecords.returns.exists' }],
      description: 'erc1185.fn.hasDNSRecords.desc',
      defaultSimValues: { node: '0xNamehash' },
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc1185.node.user',
      data: { address: '0xOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc1185-contract',
      type: 'contract',
      label: 'erc1185.node.contract',
      data: { functions: ['setDNSRecords', 'clearDNSZone', 'dnsRecords', 'hasDNSRecords'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-setDNSRecords',
      type: 'function',
      label: 'setDNSRecords()',
      data: { fnType: 'write', signature: 'setDNSRecords(bytes32 node, bytes data)' },
    },
    {
      id: 'fn-dnsRecords',
      type: 'function',
      label: 'dnsRecords()',
      data: { fnType: 'read', signature: 'dnsRecords(bytes32 node, bytes32 name, uint16 resource) → bytes' },
    },
    {
      id: 'storage-records',
      type: 'storage',
      label: 'erc1185.node.storageRecords',
      data: {
        slots: [
          { key: 'records', label: 'node → version → name → resource → bytes' },
          { key: 'versions', label: 'mapping(bytes32 => uint256)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-dnsRecordChanged',
      type: 'function',
      label: 'DNSRecordChanged event',
      data: {
        fnType: 'event',
        signature: 'DNSRecordChanged(bytes32 indexed node, bytes name, uint16 resource, bytes record)',
      },
    },
  ],

  flowEdges: [
    {
      id: 'e-user-setRecords',
      source: 'user',
      target: 'fn-setDNSRecords',
      type: 'animated',
      label: 'erc1185.edge.callSetRecords',
    },
    {
      id: 'e-setRecords-contract',
      source: 'fn-setDNSRecords',
      target: 'erc1185-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-records',
      source: 'erc1185-contract',
      target: 'storage-records',
      type: 'labeled',
      label: 'erc1185.edge.updateRecords',
    },
    {
      id: 'e-contract-event',
      source: 'erc1185-contract',
      target: 'event-dnsRecordChanged',
      type: 'labeled',
      label: 'erc1185.edge.emitChanged',
    },
    {
      id: 'e-user-query',
      source: 'user',
      target: 'fn-dnsRecords',
      type: 'animated',
      label: 'erc1185.edge.queryRecords',
    },
    {
      id: 'e-query-contract',
      source: 'fn-dnsRecords',
      target: 'erc1185-contract',
      type: 'animated',
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
      id: 'set-records-walkthrough',
      name: 'erc1185.sim.setRecordsWalkthrough.name',
      description: 'erc1185.sim.setRecordsWalkthrough.desc',
      params: [
        {
          id: 'domain',
          label: 'erc1185.sim.setRecordsWalkthrough.param.domain',
          type: 'select',
          options: [
            { label: 'example.com', value: 'example.com' },
            { label: 'ethereum.eth', value: 'ethereum.eth' },
          ],
          defaultValue: 'example.com',
        },
        {
          id: 'recordType',
          label: 'erc1185.sim.setRecordsWalkthrough.param.recordType',
          type: 'select',
          options: [
            { label: 'A 1.2.3.4', value: 'A 1.2.3.4' },
            { label: 'CNAME', value: 'CNAME' },
          ],
          defaultValue: 'A 1.2.3.4',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc1185.sim.setRecordsWalkthrough.step.call',
          mobileDescription: 'erc1185.sim.setRecordsWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-setDNSRecords'],
          highlightEdges: ['e-user-setRecords'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc1185.sim.setRecordsWalkthrough.step.execute',
          mobileDescription: 'erc1185.sim.setRecordsWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-setDNSRecords', 'erc1185-contract', 'storage-records'],
          highlightEdges: ['e-setRecords-contract', 'e-contract-records'],
          valueChanges: { 'storage-records.records': 'empty → A 1.2.3.4 (DNS wire format)' },
          durationMs: 1200,
        },
        {
          id: 'step-event',
          description: 'erc1185.sim.setRecordsWalkthrough.step.event',
          mobileDescription: 'erc1185.sim.setRecordsWalkthrough.step.event.mobile',
          highlightNodes: ['erc1185-contract', 'event-dnsRecordChanged'],
          highlightEdges: ['e-contract-event'],
          durationMs: 800,
        },
      ],
    },
  ],
};
