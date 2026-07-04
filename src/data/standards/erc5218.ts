import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc5218',
  name: 'ERC-5218',
  shortDescription: 'erc5218.short',
  category: 'nft',
  entryType: 'standard',
  eipNumber: 5218,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-5218',
  relatedSlugs: ['erc721', 'erc2981', 'erc6551', 'erc165'],
  sortOrder: 15218,
  eipStatus: 'Stagnant',
  tier: 'B',
  published: true,

  // ─── Schema v2 ───
  requires: [721],
  relations: [
    { slug: 'erc721', kind: 'requires' },
    { slug: 'erc2981', kind: 'usedWith' },
  ],
  references: [
    { label: 'ERC-5218 Specification', url: 'https://eips.ethereum.org/EIPS/eip-5218', kind: 'spec' },
  ],

  // ─── ERCContent ───
  introduction: 'erc5218.introduction',
  designPurpose: 'erc5218.designPurpose',
  commonUsage: 'erc5218.commonUsage',

  functions: [
    {
      name: 'isLicenseActive',
      signature: 'isLicenseActive(uint256 _licenseId) → bool',
      type: 'read',
      params: [{ name: '_licenseId', type: 'uint256', description: 'erc5218.fn.isLicenseActive.params.licenseId' }],
      returns: [{ name: 'active', type: 'bool', description: 'erc5218.fn.isLicenseActive.returns.active' }],
      description: 'erc5218.fn.isLicenseActive.desc',
      defaultSimValues: { licenseId: '1' },
    },
    {
      name: 'getLicenseIdByTokenId',
      signature: 'getLicenseIdByTokenId(uint256 _tokenId) → uint256',
      type: 'read',
      params: [{ name: '_tokenId', type: 'uint256', description: 'erc5218.fn.getLicenseIdByTokenId.params.tokenId' }],
      returns: [
        { name: 'licenseId', type: 'uint256', description: 'erc5218.fn.getLicenseIdByTokenId.returns.licenseId' },
      ],
      description: 'erc5218.fn.getLicenseIdByTokenId.desc',
      defaultSimValues: { tokenId: '1' },
    },
    {
      name: 'createLicense',
      signature:
        'createLicense(uint256 _tokenId, uint256 _parentLicenseId, address _licenseHolder, string memory _uri, address _revoker) → uint256',
      type: 'write',
      params: [
        { name: '_tokenId', type: 'uint256', description: 'erc5218.fn.createLicense.params.tokenId' },
        { name: '_parentLicenseId', type: 'uint256', description: 'erc5218.fn.createLicense.params.parentLicenseId' },
        { name: '_licenseHolder', type: 'address', description: 'erc5218.fn.createLicense.params.licenseHolder' },
        { name: '_uri', type: 'string', description: 'erc5218.fn.createLicense.params.uri' },
        { name: '_revoker', type: 'address', description: 'erc5218.fn.createLicense.params.revoker' },
      ],
      returns: [{ name: 'licenseId', type: 'uint256', description: 'erc5218.fn.createLicense.returns.licenseId' }],
      description: 'erc5218.fn.createLicense.desc',
      defaultSimValues: {
        tokenId: '1',
        parentLicenseId: '0',
        licenseHolder: '0xHolder',
        uri: 'ipfs://license',
        revoker: '0xRevoker',
      },
    },
    {
      name: 'revokeLicense',
      signature: 'revokeLicense(uint256 _licenseId)',
      type: 'write',
      params: [{ name: '_licenseId', type: 'uint256', description: 'erc5218.fn.revokeLicense.params.licenseId' }],
      description: 'erc5218.fn.revokeLicense.desc',
      defaultSimValues: { licenseId: '1' },
    },
    {
      name: 'transferSublicense',
      signature: 'transferSublicense(uint256 _licenseId, address _licenseHolder)',
      type: 'write',
      params: [
        { name: '_licenseId', type: 'uint256', description: 'erc5218.fn.transferSublicense.params.licenseId' },
        { name: '_licenseHolder', type: 'address', description: 'erc5218.fn.transferSublicense.params.licenseHolder' },
      ],
      description: 'erc5218.fn.transferSublicense.desc',
      defaultSimValues: { licenseId: '2', licenseHolder: '0xNewHolder' },
    },
    {
      name: 'CreateLicense',
      signature:
        'CreateLicense(uint256 _licenseId, uint256 _tokenId, uint256 _parentLicenseId, address _licenseHolder, string _uri, address _revoker)',
      type: 'event',
      params: [
        { name: '_licenseId', type: 'uint256', description: 'erc5218.fn.CreateLicense.params.licenseId' },
        { name: '_tokenId', type: 'uint256', description: 'erc5218.fn.CreateLicense.params.tokenId' },
        { name: '_parentLicenseId', type: 'uint256', description: 'erc5218.fn.CreateLicense.params.parentLicenseId' },
        { name: '_licenseHolder', type: 'address', description: 'erc5218.fn.CreateLicense.params.licenseHolder' },
        { name: '_uri', type: 'string', description: 'erc5218.fn.CreateLicense.params.uri' },
        { name: '_revoker', type: 'address', description: 'erc5218.fn.CreateLicense.params.revoker' },
      ],
      description: 'erc5218.fn.CreateLicense.desc',
    },
    {
      name: 'RevokeLicense',
      signature: 'RevokeLicense(uint256 _licenseId)',
      type: 'event',
      params: [{ name: '_licenseId', type: 'uint256', description: 'erc5218.fn.RevokeLicense.params.licenseId' }],
      description: 'erc5218.fn.RevokeLicense.desc',
    },
    {
      name: 'TransferLicense',
      signature: 'TransferLicense(uint256 _licenseId, address _licenseHolder)',
      type: 'event',
      params: [
        { name: '_licenseId', type: 'uint256', description: 'erc5218.fn.TransferLicense.params.licenseId' },
        { name: '_licenseHolder', type: 'address', description: 'erc5218.fn.TransferLicense.params.licenseHolder' },
      ],
      description: 'erc5218.fn.TransferLicense.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc5218.node.user',
      data: { address: '0xOwner' },
      layoutHint: 'source',
    },
    {
      id: 'erc5218-contract',
      type: 'contract',
      label: 'erc5218.node.contract',
      data: { functions: ['createLicense', 'revokeLicense', 'transferSublicense', 'isLicenseActive'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-createLicense',
      type: 'function',
      label: 'createLicense()',
      data: {
        fnType: 'write',
        signature:
          'createLicense(uint256 _tokenId, uint256 _parentLicenseId, address _licenseHolder, string memory _uri, address _revoker) → uint256',
      },
    },
    {
      id: 'storage-licenses',
      type: 'storage',
      label: 'erc5218.node.storageLicenses',
      data: {
        slots: [
          { key: '_licenses', label: 'mapping(uint256 => License)' },
          { key: '_licenseIds', label: 'mapping(uint256 => uint256)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'event-createLicense',
      type: 'function',
      label: 'CreateLicense event',
      data: {
        fnType: 'event',
        signature:
          'CreateLicense(uint256 _licenseId, uint256 _tokenId, uint256 _parentLicenseId, address _licenseHolder, string _uri, address _revoker)',
      },
    },
    {
      id: 'licenseHolder',
      type: 'user',
      label: 'erc5218.node.licenseHolder',
      data: { address: '0xHolder' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-createLicense',
      source: 'user',
      target: 'fn-createLicense',
      type: 'animated',
      label: 'erc5218.edge.callCreateLicense',
    },
    {
      id: 'e-createLicense-contract',
      source: 'fn-createLicense',
      target: 'erc5218-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-storage',
      source: 'erc5218-contract',
      target: 'storage-licenses',
      type: 'labeled',
      label: 'erc5218.edge.recordLicense',
    },
    {
      id: 'e-contract-event',
      source: 'erc5218-contract',
      target: 'event-createLicense',
      type: 'labeled',
      label: 'erc5218.edge.emitCreateLicense',
    },
    {
      id: 'e-contract-holder',
      source: 'erc5218-contract',
      target: 'licenseHolder',
      type: 'labeled',
      label: 'erc5218.edge.grantLicense',
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
      id: 'create-license-walkthrough',
      name: 'erc5218.sim.createLicenseWalkthrough.name',
      description: 'erc5218.sim.createLicenseWalkthrough.desc',
      params: [
        {
          id: 'tokenId',
          label: 'erc5218.sim.createLicenseWalkthrough.param.tokenId',
          type: 'uint256',
          defaultValue: '1',
        },
        {
          id: 'parentLicenseId',
          label: 'erc5218.sim.createLicenseWalkthrough.param.parentLicenseId',
          type: 'uint256',
          defaultValue: '0',
        },
        {
          id: 'licenseHolder',
          label: 'erc5218.sim.createLicenseWalkthrough.param.licenseHolder',
          type: 'address',
          defaultValue: '0xHolder',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc5218.sim.createLicenseWalkthrough.step.call',
          mobileDescription: 'erc5218.sim.createLicenseWalkthrough.step.call.mobile',
          highlightNodes: ['user', 'fn-createLicense'],
          highlightEdges: ['e-user-createLicense'],
          durationMs: 1000,
        },
        {
          id: 'step-execute',
          description: 'erc5218.sim.createLicenseWalkthrough.step.execute',
          mobileDescription: 'erc5218.sim.createLicenseWalkthrough.step.execute.mobile',
          highlightNodes: ['fn-createLicense', 'erc5218-contract', 'storage-licenses'],
          highlightEdges: ['e-createLicense-contract', 'e-contract-storage'],
          valueChanges: {
            'storage-licenses._licenses[1]': 'active=true, tokenId=1, holder=0xHolder',
            'storage-licenses._licenseIds[1]': '0 → 1',
          },
          durationMs: 1200,
        },
        {
          id: 'step-grant',
          description: 'erc5218.sim.createLicenseWalkthrough.step.grant',
          mobileDescription: 'erc5218.sim.createLicenseWalkthrough.step.grant.mobile',
          highlightNodes: ['erc5218-contract', 'licenseHolder'],
          highlightEdges: ['e-contract-holder'],
          valueChanges: { 'licenseHolder.license': 'root license #1' },
          durationMs: 1000,
        },
        {
          id: 'step-event',
          description: 'erc5218.sim.createLicenseWalkthrough.step.event',
          mobileDescription: 'erc5218.sim.createLicenseWalkthrough.step.event.mobile',
          highlightNodes: ['erc5218-contract', 'event-createLicense'],
          highlightEdges: ['e-contract-event'],
          durationMs: 800,
        },
      ],
    },
  ],
};
