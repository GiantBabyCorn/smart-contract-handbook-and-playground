import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc6900',
  name: 'ERC-6900',
  shortDescription: 'erc6900.short',
  category: 'account',
  entryType: 'standard',
  eipNumber: 6900,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-6900',
  relatedSlugs: ['erc7579', 'erc4337'],
  sortOrder: 2200,

  // ─── ERCContent ───
  introduction: 'erc6900.introduction',
  designPurpose: 'erc6900.designPurpose',
  commonUsage: 'erc6900.commonUsage',

  functions: [
    {
      name: 'installPlugin',
      signature: 'installPlugin(address plugin, bytes32 manifestHash, bytes calldata pluginInstallData, FunctionReference[] calldata dependencies)',
      type: 'write',
      params: [
        { name: 'plugin', type: 'address', description: 'erc6900.fn.installPlugin.params.plugin' },
        { name: 'manifestHash', type: 'bytes32', description: 'erc6900.fn.installPlugin.params.manifestHash' },
        { name: 'pluginInstallData', type: 'bytes', description: 'erc6900.fn.installPlugin.params.pluginInstallData' },
        { name: 'dependencies', type: 'FunctionReference[]', description: 'erc6900.fn.installPlugin.params.dependencies' },
      ],
      description: 'erc6900.fn.installPlugin.desc',
      defaultSimValues: { plugin: '0xMultisigPlugin', manifestHash: '0xManifestHash', pluginInstallData: '0x' },
    },
    {
      name: 'uninstallPlugin',
      signature: 'uninstallPlugin(address plugin, bytes calldata config, bytes calldata pluginUninstallData)',
      type: 'write',
      params: [
        { name: 'plugin', type: 'address', description: 'erc6900.fn.uninstallPlugin.params.plugin' },
        { name: 'config', type: 'bytes', description: 'erc6900.fn.uninstallPlugin.params.config' },
        { name: 'pluginUninstallData', type: 'bytes', description: 'erc6900.fn.uninstallPlugin.params.pluginUninstallData' },
      ],
      description: 'erc6900.fn.uninstallPlugin.desc',
      defaultSimValues: { plugin: '0xMultisigPlugin', config: '0x', pluginUninstallData: '0x' },
    },
    {
      name: 'executeFromPluginExternal',
      signature: 'executeFromPluginExternal(address target, uint256 value, bytes calldata data) → bytes',
      type: 'write',
      params: [
        { name: 'target', type: 'address', description: 'erc6900.fn.executeFromPluginExternal.params.target' },
        { name: 'value', type: 'uint256', description: 'erc6900.fn.executeFromPluginExternal.params.value' },
        { name: 'data', type: 'bytes', description: 'erc6900.fn.executeFromPluginExternal.params.data' },
      ],
      returns: [{ name: 'result', type: 'bytes', description: 'erc6900.fn.executeFromPluginExternal.returns.result' }],
      description: 'erc6900.fn.executeFromPluginExternal.desc',
      defaultSimValues: { target: '0xTargetProtocol', value: '0', data: '0x' },
    },
    {
      name: 'getInstalledPlugins',
      signature: 'getInstalledPlugins() → address[]',
      type: 'read',
      params: [],
      returns: [{ name: 'plugins', type: 'address[]', description: 'erc6900.fn.getInstalledPlugins.returns.plugins' }],
      description: 'erc6900.fn.getInstalledPlugins.desc',
      defaultSimValues: {},
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'account-owner',
      type: 'user',
      label: 'erc6900.node.accountOwner',
      data: { address: '0xOwner', balance: '1 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'modular-account',
      type: 'contract',
      label: 'erc6900.node.modularAccount',
      data: { functions: ['installPlugin', 'uninstallPlugin', 'execute', 'getInstalledPlugins'] },
      layoutHint: 'center',
    },
    {
      id: 'validation-plugin',
      type: 'contract',
      label: 'erc6900.node.validationPlugin',
      data: { functions: ['userOpValidationFunction', 'runtimeValidationFunction'] },
    },
    {
      id: 'execution-plugin',
      type: 'contract',
      label: 'erc6900.node.executionPlugin',
      data: { functions: ['executeFromPlugin', 'executeFromPluginExternal', 'pluginManifest'] },
    },
    {
      id: 'hook',
      type: 'contract',
      label: 'erc6900.node.hook',
      data: { functions: ['preUserOpValidationHook', 'preRuntimeValidationHook', 'preExecutionHook', 'postExecutionHook'] },
    },
    {
      id: 'permission-manager',
      type: 'contract',
      label: 'erc6900.node.permissionManager',
      data: { functions: ['checkPermissions', 'grantPermission', 'revokePermission'] },
    },
    {
      id: 'target',
      type: 'contract',
      label: 'erc6900.node.target',
      data: {},
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-owner-account',
      source: 'account-owner',
      target: 'modular-account',
      type: 'animated',
      label: 'erc6900.edge.installPlugin',
    },
    {
      id: 'e-account-permission',
      source: 'modular-account',
      target: 'permission-manager',
      type: 'labeled',
      label: 'erc6900.edge.checkManifest',
    },
    {
      id: 'e-account-validation',
      source: 'modular-account',
      target: 'validation-plugin',
      type: 'labeled',
      label: 'erc6900.edge.validateUserOp',
    },
    {
      id: 'e-account-hook',
      source: 'modular-account',
      target: 'hook',
      type: 'labeled',
      label: 'erc6900.edge.runHooks',
    },
    {
      id: 'e-account-execution',
      source: 'modular-account',
      target: 'execution-plugin',
      type: 'animated',
      label: 'erc6900.edge.routeExecution',
    },
    {
      id: 'e-execution-target',
      source: 'execution-plugin',
      target: 'target',
      type: 'fundFlow',
      label: 'erc6900.edge.executeFromPlugin',
    },
    {
      id: 'e-account-target',
      source: 'modular-account',
      target: 'target',
      type: 'animated',
      label: 'erc6900.edge.directExecute',
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
      id: 'plugin-install-exec',
      name: 'erc6900.sim.pluginInstallExec.name',
      description: 'erc6900.sim.pluginInstallExec.desc',
      params: [
        {
          id: 'accountAddress',
          label: 'erc6900.sim.pluginInstallExec.param.accountAddress',
          type: 'address',
          defaultValue: '0xModularAccount',
        },
        {
          id: 'pluginAddress',
          label: 'erc6900.sim.pluginInstallExec.param.pluginAddress',
          type: 'address',
          defaultValue: '0xMultisigPlugin',
        },
        {
          id: 'targetContract',
          label: 'erc6900.sim.pluginInstallExec.param.targetContract',
          type: 'address',
          defaultValue: '0xDeFiProtocol',
        },
      ],
      steps: [
        {
          id: 'step-check-manifest',
          description: 'erc6900.sim.pluginInstallExec.step.checkManifest',
          mobileDescription: 'erc6900.sim.pluginInstallExec.step.checkManifest.mobile',
          highlightNodes: ['account-owner', 'modular-account', 'permission-manager'],
          highlightEdges: ['e-owner-account', 'e-account-permission'],
          valueChanges: {
            'permission-manager.manifestHash': '0xManifestHash verified',
            'permission-manager.dependenciesMet': 'true',
          },
          durationMs: 1100,
        },
        {
          id: 'step-install',
          description: 'erc6900.sim.pluginInstallExec.step.install',
          mobileDescription: 'erc6900.sim.pluginInstallExec.step.install.mobile',
          highlightNodes: ['modular-account', 'validation-plugin', 'execution-plugin', 'hook'],
          highlightEdges: ['e-account-validation', 'e-account-execution', 'e-account-hook'],
          valueChanges: {
            'modular-account.plugins': '[] → [0xMultisigPlugin]',
            'validation-plugin.selectors': 'registered',
            'hook.selectors': 'registered',
          },
          durationMs: 1400,
        },
        {
          id: 'step-validate-op',
          description: 'erc6900.sim.pluginInstallExec.step.validateOp',
          mobileDescription: 'erc6900.sim.pluginInstallExec.step.validateOp.mobile',
          highlightNodes: ['modular-account', 'validation-plugin', 'hook'],
          highlightEdges: ['e-account-validation', 'e-account-hook'],
          valueChanges: {
            'validation-plugin.result': 'multisig threshold met',
            'hook.preCheck': 'passed',
          },
          durationMs: 1200,
        },
        {
          id: 'step-execute',
          description: 'erc6900.sim.pluginInstallExec.step.execute',
          mobileDescription: 'erc6900.sim.pluginInstallExec.step.execute.mobile',
          highlightNodes: ['execution-plugin', 'target'],
          highlightEdges: ['e-execution-target'],
          valueChanges: {
            'target.state': 'updated via plugin execution',
            'hook.postCheck': 'passed',
          },
          durationMs: 1300,
        },
      ],
    },
  ],
};
