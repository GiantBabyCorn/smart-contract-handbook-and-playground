import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  // ─── ERCMeta ───
  slug: 'erc7579',
  name: 'ERC-7579',
  shortDescription: 'erc7579.short',
  category: 'account',
  entryType: 'standard',
  eipNumber: 7579,
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-7579',
  relatedSlugs: ['erc4337', 'erc6900', 'erc7702'],
  sortOrder: 2000,

  // ─── ERCContent ───
  introduction: 'erc7579.introduction',
  designPurpose: 'erc7579.designPurpose',
  commonUsage: 'erc7579.commonUsage',

  functions: [
    {
      name: 'installModule',
      signature: 'installModule(uint256 moduleTypeId, address module, bytes calldata initData)',
      type: 'write',
      params: [
        { name: 'moduleTypeId', type: 'uint256', description: 'erc7579.fn.installModule.params.moduleTypeId' },
        { name: 'module', type: 'address', description: 'erc7579.fn.installModule.params.module' },
        { name: 'initData', type: 'bytes', description: 'erc7579.fn.installModule.params.initData' },
      ],
      description: 'erc7579.fn.installModule.desc',
      defaultSimValues: { moduleTypeId: '1', module: '0xValidatorModule', initData: '0x' },
    },
    {
      name: 'uninstallModule',
      signature: 'uninstallModule(uint256 moduleTypeId, address module, bytes calldata deInitData)',
      type: 'write',
      params: [
        { name: 'moduleTypeId', type: 'uint256', description: 'erc7579.fn.uninstallModule.params.moduleTypeId' },
        { name: 'module', type: 'address', description: 'erc7579.fn.uninstallModule.params.module' },
        { name: 'deInitData', type: 'bytes', description: 'erc7579.fn.uninstallModule.params.deInitData' },
      ],
      description: 'erc7579.fn.uninstallModule.desc',
      defaultSimValues: { moduleTypeId: '1', module: '0xValidatorModule', deInitData: '0x' },
    },
    {
      name: 'executeFromExecutor',
      signature: 'executeFromExecutor(ModeCode mode, bytes calldata executionCalldata) → bytes[]',
      type: 'write',
      params: [
        { name: 'mode', type: 'ModeCode', description: 'erc7579.fn.executeFromExecutor.params.mode' },
        { name: 'executionCalldata', type: 'bytes', description: 'erc7579.fn.executeFromExecutor.params.executionCalldata' },
      ],
      returns: [{ name: 'returnData', type: 'bytes[]', description: 'erc7579.fn.executeFromExecutor.returns.returnData' }],
      description: 'erc7579.fn.executeFromExecutor.desc',
      defaultSimValues: { executionCalldata: '0x' },
    },
    {
      name: 'isModuleInstalled',
      signature: 'isModuleInstalled(uint256 moduleTypeId, address module, bytes calldata additionalContext) → bool',
      type: 'read',
      params: [
        { name: 'moduleTypeId', type: 'uint256', description: 'erc7579.fn.isModuleInstalled.params.moduleTypeId' },
        { name: 'module', type: 'address', description: 'erc7579.fn.isModuleInstalled.params.module' },
        { name: 'additionalContext', type: 'bytes', description: 'erc7579.fn.isModuleInstalled.params.additionalContext' },
      ],
      returns: [{ name: 'installed', type: 'bool', description: 'erc7579.fn.isModuleInstalled.returns.installed' }],
      description: 'erc7579.fn.isModuleInstalled.desc',
      defaultSimValues: { moduleTypeId: '1', module: '0xValidatorModule', additionalContext: '0x' },
    },
    {
      name: 'accountId',
      signature: 'accountId() → string',
      type: 'read',
      params: [],
      returns: [{ name: 'id', type: 'string', description: 'erc7579.fn.accountId.returns.id' }],
      description: 'erc7579.fn.accountId.desc',
      defaultSimValues: {},
    },
  ],

  // ─── ERCFlow ───
  flowNodes: [
    {
      id: 'account-owner',
      type: 'user',
      label: 'erc7579.node.accountOwner',
      data: { address: '0xOwner', balance: '1 ETH' },
      layoutHint: 'source',
    },
    {
      id: 'smart-account',
      type: 'contract',
      label: 'erc7579.node.smartAccount',
      data: { functions: ['installModule', 'uninstallModule', 'execute', 'isModuleInstalled', 'accountId'] },
      layoutHint: 'center',
    },
    {
      id: 'validator-module',
      type: 'contract',
      label: 'erc7579.node.validatorModule',
      data: { functions: ['validateUserOp', 'isValidSignatureWithSender'] },
    },
    {
      id: 'executor-module',
      type: 'contract',
      label: 'erc7579.node.executorModule',
      data: { functions: ['executeFromExecutor'] },
    },
    {
      id: 'fallback-module',
      type: 'contract',
      label: 'erc7579.node.fallbackModule',
      data: { functions: ['handle'] },
    },
    {
      id: 'hook-module',
      type: 'contract',
      label: 'erc7579.node.hookModule',
      data: { functions: ['preCheck', 'postCheck'] },
    },
    {
      id: 'target',
      type: 'contract',
      label: 'erc7579.node.target',
      data: {},
      layoutHint: 'sink',
    },
  ],

  flowEdges: [
    {
      id: 'e-owner-account',
      source: 'account-owner',
      target: 'smart-account',
      type: 'animated',
      label: 'erc7579.edge.installModule',
    },
    {
      id: 'e-account-validator',
      source: 'smart-account',
      target: 'validator-module',
      type: 'labeled',
      label: 'erc7579.edge.validateOp',
    },
    {
      id: 'e-account-hook',
      source: 'smart-account',
      target: 'hook-module',
      type: 'labeled',
      label: 'erc7579.edge.prePostCheck',
    },
    {
      id: 'e-account-executor',
      source: 'smart-account',
      target: 'executor-module',
      type: 'animated',
      label: 'erc7579.edge.delegateExecution',
    },
    {
      id: 'e-account-fallback',
      source: 'smart-account',
      target: 'fallback-module',
      type: 'labeled',
      label: 'erc7579.edge.fallback',
    },
    {
      id: 'e-executor-target',
      source: 'executor-module',
      target: 'target',
      type: 'fundFlow',
      label: 'erc7579.edge.executeFromExecutor',
    },
    {
      id: 'e-account-target',
      source: 'smart-account',
      target: 'target',
      type: 'animated',
      label: 'erc7579.edge.execute',
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
      id: 'install-validator',
      name: 'erc7579.sim.installValidator.name',
      description: 'erc7579.sim.installValidator.desc',
      params: [
        {
          id: 'accountAddress',
          label: 'erc7579.sim.installValidator.param.accountAddress',
          type: 'address',
          defaultValue: '0xModularAccount',
        },
        {
          id: 'validatorModule',
          label: 'erc7579.sim.installValidator.param.validatorModule',
          type: 'address',
          defaultValue: '0xECDSAValidator',
        },
        {
          id: 'moduleType',
          label: 'erc7579.sim.installValidator.param.moduleType',
          type: 'select',
          options: [
            { label: 'Validator (1)', value: '1' },
            { label: 'Executor (2)', value: '2' },
            { label: 'Fallback (3)', value: '3' },
            { label: 'Hook (4)', value: '4' },
          ],
          defaultValue: '1',
        },
      ],
      steps: [
        {
          id: 'step-call-install',
          description: 'erc7579.sim.installValidator.step.callInstall',
          mobileDescription: 'erc7579.sim.installValidator.step.callInstall.mobile',
          highlightNodes: ['account-owner', 'smart-account'],
          highlightEdges: ['e-owner-account'],
          valueChanges: { 'smart-account.pendingModule': '0xECDSAValidator (type=1)' },
          durationMs: 1000,
        },
        {
          id: 'step-hook-precheck',
          description: 'erc7579.sim.installValidator.step.hookPrecheck',
          mobileDescription: 'erc7579.sim.installValidator.step.hookPrecheck.mobile',
          highlightNodes: ['smart-account', 'hook-module'],
          highlightEdges: ['e-account-hook'],
          valueChanges: { 'hook-module.preCheck': 'passed' },
          durationMs: 900,
        },
        {
          id: 'step-register',
          description: 'erc7579.sim.installValidator.step.register',
          mobileDescription: 'erc7579.sim.installValidator.step.register.mobile',
          highlightNodes: ['smart-account', 'validator-module'],
          highlightEdges: ['e-account-validator'],
          valueChanges: {
            'smart-account.modules[1]': '0xECDSAValidator → installed',
            'validator-module.initialized': 'true',
          },
          durationMs: 1200,
        },
        {
          id: 'step-verify',
          description: 'erc7579.sim.installValidator.step.verify',
          mobileDescription: 'erc7579.sim.installValidator.step.verify.mobile',
          highlightNodes: ['smart-account', 'validator-module'],
          highlightEdges: ['e-account-validator'],
          valueChanges: { 'smart-account.isModuleInstalled(1, 0xECDSAValidator)': 'true' },
          durationMs: 800,
        },
      ],
    },
    {
      id: 'execute-via-executor',
      name: 'erc7579.sim.executeViaExecutor.name',
      description: 'erc7579.sim.executeViaExecutor.desc',
      params: [
        {
          id: 'executorModule',
          label: 'erc7579.sim.executeViaExecutor.param.executorModule',
          type: 'address',
          defaultValue: '0xScheduledExecutor',
        },
        {
          id: 'targetContract',
          label: 'erc7579.sim.executeViaExecutor.param.targetContract',
          type: 'address',
          defaultValue: '0xDeFiProtocol',
        },
      ],
      steps: [
        {
          id: 'step-executor-trigger',
          description: 'erc7579.sim.executeViaExecutor.step.trigger',
          mobileDescription: 'erc7579.sim.executeViaExecutor.step.trigger.mobile',
          highlightNodes: ['executor-module', 'smart-account'],
          highlightEdges: ['e-account-executor'],
          valueChanges: { 'executor-module.triggered': 'scheduled job fired' },
          durationMs: 1000,
        },
        {
          id: 'step-hook-check',
          description: 'erc7579.sim.executeViaExecutor.step.hookCheck',
          mobileDescription: 'erc7579.sim.executeViaExecutor.step.hookCheck.mobile',
          highlightNodes: ['smart-account', 'hook-module'],
          highlightEdges: ['e-account-hook'],
          valueChanges: { 'hook-module.preCheck': 'passed', 'hook-module.spendLimit': 'within limit' },
          durationMs: 900,
        },
        {
          id: 'step-execute',
          description: 'erc7579.sim.executeViaExecutor.step.execute',
          mobileDescription: 'erc7579.sim.executeViaExecutor.step.execute.mobile',
          highlightNodes: ['executor-module', 'target'],
          highlightEdges: ['e-executor-target'],
          valueChanges: { 'target.state': 'updated by executor', 'smart-account.nonce': 'n → n+1' },
          durationMs: 1300,
        },
      ],
    },
  ],
};
