import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc2535',
  name: 'ERC-2535',
  shortDescription: 'erc2535.short',
  category: 'proxy',
  entryType: 'standard',
  eipNumber: 2535,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-2535',
  relatedSlugs: ['erc1967', 'erc1822', 'erc173'],
  sortOrder: 1100,

  // ─── ERCContent ───
  introduction: 'erc2535.introduction',
  designPurpose: 'erc2535.designPurpose',
  commonUsage: 'erc2535.commonUsage',

  functions: [
    {
      name: 'diamondCut',
      signature: 'diamondCut((address facetAddress, uint8 action, bytes4[] functionSelectors)[] _diamondCut, address _init, bytes _calldata)',
      type: 'write',
      params: [
        { name: '_diamondCut', type: 'FacetCut[]', description: 'erc2535.fn.diamondCut.params.diamondCut' },
        { name: '_init', type: 'address', description: 'erc2535.fn.diamondCut.params.init' },
        { name: '_calldata', type: 'bytes', description: 'erc2535.fn.diamondCut.params.calldata' },
      ],
      description: 'erc2535.fn.diamondCut.desc',
      defaultSimValues: {
        _init: '0x0000000000000000000000000000000000000000',
        _calldata: '0x',
      },
    },
    {
      name: 'facets',
      signature: 'facets() → (address facetAddress, bytes4[] functionSelectors)[]',
      type: 'read',
      params: [],
      returns: [
        { name: 'facets_', type: 'Facet[]', description: 'erc2535.fn.facets.returns.facets' },
      ],
      description: 'erc2535.fn.facets.desc',
      defaultSimValues: {},
    },
    {
      name: 'facetFunctionSelectors',
      signature: 'facetFunctionSelectors(address _facet) → bytes4[]',
      type: 'read',
      params: [
        { name: '_facet', type: 'address', description: 'erc2535.fn.facetFunctionSelectors.params.facet' },
      ],
      returns: [
        { name: 'facetFunctionSelectors_', type: 'bytes4[]', description: 'erc2535.fn.facetFunctionSelectors.returns.selectors' },
      ],
      description: 'erc2535.fn.facetFunctionSelectors.desc',
      defaultSimValues: { _facet: '0xFacetAddress' },
    },
    {
      name: 'facetAddresses',
      signature: 'facetAddresses() → address[]',
      type: 'read',
      params: [],
      returns: [
        { name: 'facetAddresses_', type: 'address[]', description: 'erc2535.fn.facetAddresses.returns.addresses' },
      ],
      description: 'erc2535.fn.facetAddresses.desc',
      defaultSimValues: {},
    },
    {
      name: 'facetAddress',
      signature: 'facetAddress(bytes4 _functionSelector) → address',
      type: 'read',
      params: [
        { name: '_functionSelector', type: 'bytes4', description: 'erc2535.fn.facetAddress.params.selector' },
      ],
      returns: [
        { name: 'facetAddress_', type: 'address', description: 'erc2535.fn.facetAddress.returns.facet' },
      ],
      description: 'erc2535.fn.facetAddress.desc',
      defaultSimValues: { _functionSelector: '0x1f931c1c' },
    },
    {
      name: 'DiamondCut',
      signature: 'DiamondCut((address facetAddress, uint8 action, bytes4[] functionSelectors)[] _diamondCut, address _init, bytes _calldata)',
      type: 'event',
      params: [
        { name: '_diamondCut', type: 'FacetCut[]', description: 'erc2535.fn.DiamondCut.params.diamondCut' },
        { name: '_init', type: 'address', description: 'erc2535.fn.DiamondCut.params.init' },
        { name: '_calldata', type: 'bytes', description: 'erc2535.fn.DiamondCut.params.calldata' },
      ],
      description: 'erc2535.fn.DiamondCut.desc',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'user',
      type: 'user',
      label: 'erc2535.node.user',
      data: { address: '0xUser' },
      layoutHint: 'source',
    },
    {
      id: 'diamond-group',
      type: 'group',
      label: 'erc2535.node.diamondGroup',
      data: { style: 'dashed' },
      layoutHint: 'center',
    },
    {
      id: 'diamond-proxy',
      type: 'proxy',
      label: 'erc2535.node.diamondProxy',
      data: { implementation: 'selector routing' },
      layoutHint: 'center',
      parentId: 'diamond-group',
    },
    {
      id: 'facet-a',
      type: 'contract',
      label: 'erc2535.node.facetA',
      data: { functions: ['transfer()', 'approve()'] },
      layoutHint: 'sink',
    },
    {
      id: 'facet-b',
      type: 'contract',
      label: 'erc2535.node.facetB',
      data: { functions: ['stake()', 'unstake()'] },
      layoutHint: 'sink',
    },
    {
      id: 'facet-c',
      type: 'contract',
      label: 'erc2535.node.facetC',
      data: { functions: ['vote()', 'delegate()'] },
      layoutHint: 'sink',
    },
    {
      id: 'diamond-storage',
      type: 'storage',
      label: 'erc2535.node.diamondStorage',
      data: {
        slots: [
          { key: 'selectorToFacet', label: 'mapping(bytes4 => address)' },
          { key: 'facetToSelectors', label: 'mapping(address => bytes4[])' },
          { key: 'facetAddresses', label: 'address[]' },
        ],
      },
      layoutHint: 'storage',
      parentId: 'diamond-group',
    },
    {
      id: 'diamond-cut-facet',
      type: 'contract',
      label: 'erc2535.node.diamondCutFacet',
      data: { functions: ['diamondCut'] },
      layoutHint: 'center',
    },
  ],

  flowEdges: [
    {
      id: 'e-user-diamond',
      source: 'user',
      target: 'diamond-proxy',
      type: 'animated',
      label: 'erc2535.edge.callWithSelector',
    },
    {
      id: 'e-diamond-storage',
      source: 'diamond-proxy',
      target: 'diamond-storage',
      type: 'labeled',
      label: 'erc2535.edge.lookupSelector',
    },
    {
      id: 'e-diamond-facetA',
      source: 'diamond-proxy',
      target: 'facet-a',
      type: 'animated',
      label: 'erc2535.edge.delegateToFacetA',
    },
    {
      id: 'e-diamond-facetB',
      source: 'diamond-proxy',
      target: 'facet-b',
      type: 'animated',
      label: 'erc2535.edge.delegateToFacetB',
    },
    {
      id: 'e-diamond-facetC',
      source: 'diamond-proxy',
      target: 'facet-c',
      type: 'animated',
      label: 'erc2535.edge.delegateToFacetC',
    },
    {
      id: 'e-user-cutFacet',
      source: 'user',
      target: 'diamond-cut-facet',
      type: 'animated',
      label: 'erc2535.edge.callDiamondCut',
    },
    {
      id: 'e-cutFacet-storage',
      source: 'diamond-cut-facet',
      target: 'diamond-storage',
      type: 'labeled',
      label: 'erc2535.edge.updateMappings',
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
      id: 'function-call-routing',
      name: 'erc2535.sim.functionCallRouting.name',
      description: 'erc2535.sim.functionCallRouting.desc',
      params: [
        {
          id: 'caller',
          label: 'erc2535.sim.functionCallRouting.param.caller',
          type: 'address',
          defaultValue: '0xUser',
        },
        {
          id: 'selector',
          label: 'erc2535.sim.functionCallRouting.param.selector',
          type: 'select',
          options: [
            { label: 'transfer() → Facet A (0xa9059cbb)', value: '0xa9059cbb' },
            { label: 'stake() → Facet B (0xa694fc3a)', value: '0xa694fc3a' },
            { label: 'vote() → Facet C (0x15373e3d)', value: '0x15373e3d' },
          ],
          defaultValue: '0xa9059cbb',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc2535.sim.functionCallRouting.step.call',
          mobileDescription: 'erc2535.sim.functionCallRouting.step.call.mobile',
          highlightNodes: ['user', 'diamond-proxy'],
          highlightEdges: ['e-user-diamond'],
          valueChanges: { 'diamond-proxy.incomingSelector': '0xa9059cbb (transfer)' },
          durationMs: 1000,
        },
        {
          id: 'step-lookup',
          description: 'erc2535.sim.functionCallRouting.step.lookup',
          mobileDescription: 'erc2535.sim.functionCallRouting.step.lookup.mobile',
          highlightNodes: ['diamond-proxy', 'diamond-storage'],
          highlightEdges: ['e-diamond-storage'],
          valueChanges: {
            'diamond-storage.selectorToFacet[0xa9059cbb]': '0xFacetA',
            'diamond-proxy.resolvedFacet': '0xFacetA',
          },
          durationMs: 1200,
        },
        {
          id: 'step-delegate',
          description: 'erc2535.sim.functionCallRouting.step.delegate',
          mobileDescription: 'erc2535.sim.functionCallRouting.step.delegate.mobile',
          highlightNodes: ['diamond-proxy', 'facet-a'],
          highlightEdges: ['e-diamond-facetA'],
          valueChanges: {
            'facet-a.executionContext': 'diamond proxy storage',
            'diamond-proxy.mode': 'delegatecall → 0xFacetA',
          },
          durationMs: 1300,
        },
      ],
    },
    {
      id: 'diamond-cut-add-facet',
      name: 'erc2535.sim.diamondCutAddFacet.name',
      description: 'erc2535.sim.diamondCutAddFacet.desc',
      params: [
        {
          id: 'admin',
          label: 'erc2535.sim.diamondCutAddFacet.param.admin',
          type: 'address',
          defaultValue: '0xOwner',
        },
        {
          id: 'newFacet',
          label: 'erc2535.sim.diamondCutAddFacet.param.newFacet',
          type: 'address',
          defaultValue: '0xFacetD',
        },
      ],
      steps: [
        {
          id: 'step-prepare-cut',
          description: 'erc2535.sim.diamondCutAddFacet.step.prepareCut',
          mobileDescription: 'erc2535.sim.diamondCutAddFacet.step.prepareCut.mobile',
          highlightNodes: ['user', 'diamond-cut-facet'],
          highlightEdges: ['e-user-cutFacet'],
          valueChanges: {
            'diamond-cut-facet.pendingCut': '{ facetAddress: 0xFacetD, action: Add, selectors: [0xdeadbeef] }',
          },
          durationMs: 1000,
        },
        {
          id: 'step-validate-facet',
          description: 'erc2535.sim.diamondCutAddFacet.step.validateFacet',
          mobileDescription: 'erc2535.sim.diamondCutAddFacet.step.validateFacet.mobile',
          highlightNodes: ['diamond-cut-facet', 'diamond-storage'],
          highlightEdges: ['e-cutFacet-storage'],
          valueChanges: {
            'diamond-storage.selectorToFacet[0xdeadbeef]': 'address(0) → 0xFacetD',
            'diamond-storage.facetAddresses': '[0xFacetA, 0xFacetB, 0xFacetC] → append 0xFacetD',
          },
          durationMs: 1400,
        },
        {
          id: 'step-init-call',
          description: 'erc2535.sim.diamondCutAddFacet.step.initCall',
          mobileDescription: 'erc2535.sim.diamondCutAddFacet.step.initCall.mobile',
          highlightNodes: ['diamond-cut-facet', 'facet-a'],
          highlightEdges: ['e-diamond-facetA'],
          valueChanges: {
            'diamond-cut-facet.initResult': 'delegatecall _init(calldata) success',
          },
          durationMs: 1100,
        },
        {
          id: 'step-emit-event',
          description: 'erc2535.sim.diamondCutAddFacet.step.emitEvent',
          mobileDescription: 'erc2535.sim.diamondCutAddFacet.step.emitEvent.mobile',
          highlightNodes: ['diamond-cut-facet', 'diamond-proxy'],
          highlightEdges: ['e-user-cutFacet', 'e-diamond-storage'],
          valueChanges: {
            'diamond-proxy.facetCount': '3 → 4',
            'diamond-cut-facet.lastEvent': 'DiamondCut([{ 0xFacetD, Add, [0xdeadbeef] }], 0x0, 0x)',
          },
          durationMs: 900,
        },
      ],
    },
  ],
};
