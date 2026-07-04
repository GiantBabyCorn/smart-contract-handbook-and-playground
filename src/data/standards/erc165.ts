import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc165',
  name: 'ERC-165',
  shortDescription: 'erc165.short',
  category: 'utility',
  entryType: 'standard',
  eipNumber: 165,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-165',
  relatedSlugs: ['erc173', 'erc721', 'erc1155'],
  sortOrder: 600,
  eipStatus: 'Final',

  // ─── ERCContent ───
  introduction: 'erc165.introduction',
  designPurpose: 'erc165.designPurpose',
  commonUsage: 'erc165.commonUsage',

  functions: [
    {
      name: 'supportsInterface',
      signature: 'supportsInterface(bytes4 interfaceId) → bool',
      type: 'read',
      params: [
        { name: 'interfaceId', type: 'bytes4', description: 'erc165.fn.supportsInterface.params.interfaceId' },
      ],
      returns: [
        { name: 'supported', type: 'bool', description: 'erc165.fn.supportsInterface.returns.supported' },
      ],
      description: 'erc165.fn.supportsInterface.desc',
      defaultSimValues: { interfaceId: '0x80ac58cd' },
    },
  ],

  // ─── Schema v2 content sections ───
  security: [
    {
      severity: 'medium',
      title: 'erc165.sec.trust.title',
      desc: 'erc165.sec.trust.desc',
      mitigation: 'erc165.sec.trust.mitigation',
      source: 'https://eips.ethereum.org/EIPS/eip-165',
    },
  ],

  codeExamples: [
    {
      title: 'erc165.code.iface.title',
      lang: 'solidity',
      // Canonical interface from the EIP-165 specification (CC0).
      code: `interface ERC165 {
    /// @notice Query if a contract implements an interface
    /// @param interfaceID The interface identifier, as specified in ERC-165
    /// @dev Interface identification is specified in ERC-165. This function
    ///  uses less than 30,000 gas.
    /// @return \`true\` if the contract implements \`interfaceID\` and
    ///  \`interfaceID\` is not 0xffffffff, \`false\` otherwise
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}`,
    },
  ],

  gasNotes: 'erc165.gas.notes',

  references: [
    {
      label: 'OpenZeppelin ERC165 implementation',
      url: 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/introspection/ERC165.sol',
      kind: 'impl',
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'caller',
      type: 'user',
      label: 'erc165.node.caller',
      data: { address: '0xCaller' },
      layoutHint: 'source',
    },
    {
      id: 'erc165-contract',
      type: 'contract',
      label: 'erc165.node.contract',
      data: { functions: ['supportsInterface'] },
      layoutHint: 'center',
    },
    {
      id: 'fn-supportsInterface',
      type: 'function',
      label: 'supportsInterface()',
      data: { fnType: 'read', signature: 'supportsInterface(bytes4 interfaceId) → bool' },
    },
    {
      id: 'interface-registry',
      type: 'storage',
      label: 'erc165.node.interfaceRegistry',
      data: {
        slots: [
          { key: '_supportedInterfaces', label: 'mapping(bytes4 => bool)' },
        ],
      },
      layoutHint: 'storage',
    },
    {
      id: 'result',
      type: 'tokenFlow',
      label: 'erc165.node.result',
      data: { symbol: 'bool', amount: 'true / false' },
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-caller-fn',
      source: 'caller',
      target: 'fn-supportsInterface',
      type: 'animated',
      label: 'erc165.edge.query',
    },
    {
      id: 'e-fn-contract',
      source: 'fn-supportsInterface',
      target: 'erc165-contract',
      type: 'animated',
    },
    {
      id: 'e-contract-registry',
      source: 'erc165-contract',
      target: 'interface-registry',
      type: 'labeled',
      label: 'erc165.edge.lookupRegistry',
    },
    {
      id: 'e-contract-result',
      source: 'erc165-contract',
      target: 'result',
      type: 'labeled',
      label: 'erc165.edge.returnBool',
    },
    {
      id: 'e-result-caller',
      source: 'result',
      target: 'caller',
      type: 'fundFlow',
      label: 'erc165.edge.response',
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
      id: 'interface-query',
      name: 'erc165.sim.interfaceQuery.name',
      description: 'erc165.sim.interfaceQuery.desc',
      params: [
        {
          id: 'interfaceId',
          label: 'erc165.sim.interfaceQuery.param.interfaceId',
          type: 'select',
          options: [
            { label: 'ERC-165  (0x01ffc9a7)', value: '0x01ffc9a7' },
            { label: 'ERC-721  (0x80ac58cd)', value: '0x80ac58cd' },
            { label: 'ERC-20   (0x36372b07)', value: '0x36372b07' },
          ],
          defaultValue: '0x01ffc9a7',
        },
      ],
      steps: [
        {
          id: 'step-call',
          description: 'erc165.sim.interfaceQuery.step.call',
          mobileDescription: 'erc165.sim.interfaceQuery.step.call.mobile',
          highlightNodes: ['caller', 'fn-supportsInterface'],
          highlightEdges: ['e-caller-fn'],
          valueChanges: { 'fn-supportsInterface.input': 'interfaceId = 0x01ffc9a7' },
          durationMs: 1000,
        },
        {
          id: 'step-lookup',
          description: 'erc165.sim.interfaceQuery.step.lookup',
          mobileDescription: 'erc165.sim.interfaceQuery.step.lookup.mobile',
          highlightNodes: ['fn-supportsInterface', 'erc165-contract', 'interface-registry'],
          highlightEdges: ['e-fn-contract', 'e-contract-registry'],
          valueChanges: { 'interface-registry._supportedInterfaces[0x01ffc9a7]': 'true' },
          durationMs: 1200,
        },
        {
          id: 'step-return',
          description: 'erc165.sim.interfaceQuery.step.return',
          mobileDescription: 'erc165.sim.interfaceQuery.step.return.mobile',
          highlightNodes: ['erc165-contract', 'result', 'caller'],
          highlightEdges: ['e-contract-result', 'e-result-caller'],
          valueChanges: { 'result.value': 'true', 'caller.lastResponse': 'supportsInterface → true' },
          durationMs: 800,
        },
      ],
    },
  ],
};
