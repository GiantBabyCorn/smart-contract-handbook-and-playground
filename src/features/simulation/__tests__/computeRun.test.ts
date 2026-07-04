import { describe, it, expect } from 'vitest';
import { entry as erc20 } from '@/data/standards/erc20';
import { entry as uniswapV2 } from '@/data/protocols/uniswap-v2';
import type { SimulationScenario } from '@/data/types';
import { simMath } from '../simMath';
import { computeScenarioRun, foldNodeValues, currentValueOf } from '../computeRun';
import { SimulationEngine, type EnginePatch } from '../SimulationEngine';

const WAD = 10n ** 18n;

function scenarioOf(entry: { simulations: SimulationScenario[] }, id: string): SimulationScenario {
  const s = entry.simulations.find((x) => x.id === id);
  if (!s) throw new Error(`missing scenario ${id}`);
  return s;
}

describe('computeScenarioRun — erc20 tokenTransfer binding', () => {
  const scenario = scenarioOf(erc20, 'basic-transfer');

  it('derives live valueChanges from the amount param', async () => {
    const run = await computeScenarioRun(simMath, scenario, {
      sender: '0xAlice',
      recipient: '0xBob',
      amount: (250n * WAD).toString(),
    });
    expect(run).not.toBeNull();
    const steps = run!.steps;

    expect(steps['step-call'].changes['user.balance']).toBe('1,000 → 750 TOKEN');
    expect(steps['step-validate'].changes['storage-balances._balances[sender]']).toBe(
      '1,000 → 750 TOKEN',
    );
    expect(steps['step-validate'].changes['storage-balances._balances[recipient]']).toBe(
      '0 → 250 TOKEN',
    );
    expect(steps['step-tokenflow'].changes['recipient.balance']).toBe('0 → 250 TOKEN');
    expect(steps['step-tokenflow'].flowLabel).toBe('+250 TOKEN');
    expect(steps['step-event'].changes['event-transfer.lastEvent']).toContain('0xAlice');
    expect(steps['step-event'].changes['event-transfer.lastEvent']).toContain('250 TOKEN');
    expect(steps['step-validate'].isRevert).toBeUndefined();
  });

  it('marks steps as reverted when the amount exceeds the balance', async () => {
    const run = await computeScenarioRun(simMath, scenario, {
      sender: '0xAlice',
      recipient: '0xBob',
      amount: (5000n * WAD).toString(),
    });
    const steps = run!.steps;
    expect(steps['step-validate'].isRevert).toBe(true);
    expect(steps['step-validate'].revertReason).toBe('revert.insufficientBalance');
    // Values unchanged on revert.
    expect(steps['step-validate'].changes['storage-balances._balances[sender]']).toBe(
      '1,000 → 1,000 TOKEN',
    );
  });

  it('maps both allowance transitions in approve-and-transfer', async () => {
    const approveScenario = scenarioOf(erc20, 'approve-and-transfer');
    const run = await computeScenarioRun(simMath, approveScenario, {
      owner: '0xOwner',
      spender: '0xSpender',
      allowanceAmount: (500n * WAD).toString(),
    });
    const steps = run!.steps;
    expect(
      steps['step-storage-allowance'].changes['storage-balances._allowances[owner][spender]'],
    ).toBe('0 → 500 TOKEN');
    expect(
      steps['step-transferFrom'].changes['storage-balances._allowances[owner][spender]'],
    ).toBe('500 → 400 TOKEN');
    expect(steps['step-transferFrom'].changes['recipient.balance']).toBe('0 → 100 TOKEN');
  });
});

describe('computeScenarioRun — uniswap-v2 swap binding', () => {
  const scenario = scenarioOf(uniswapV2, 'token-swap');

  it('derives reserves and output from amountIn', async () => {
    const run = await computeScenarioRun(simMath, scenario, {
      amountIn: (100n * WAD).toString(),
    });
    const steps = run!.steps;
    expect(steps['step-constant-product'].changes['liquidity-pool.reserve0']).toBe(
      '1,000 → 1,100 TOKEN-A',
    );
    expect(steps['step-constant-product'].changes['liquidity-pool.reserve1']).toMatch(
      /^3,000 → 2,7\d\d(\.\d+)? TOKEN-B \(impact /,
    );
    expect(steps['step-receive-tokens'].changes['trader.tokenB']).toMatch(/^0 → 2\d\d(\.\d+)? TOKEN-B$/);
    expect(steps['step-receive-tokens'].flowLabel).toMatch(/^\+2\d\d(\.\d+)? TOKEN-B$/);
    // Unmapped keys keep the authored value.
    expect(steps['step-route-pair'].changes['factory.pair']).toBe('WETH/USDC pair resolved');
  });

  it('different inputs produce different outputs (100 vs 500)', async () => {
    const run100 = await computeScenarioRun(simMath, scenario, {
      amountIn: (100n * WAD).toString(),
    });
    const run500 = await computeScenarioRun(simMath, scenario, {
      amountIn: (500n * WAD).toString(),
    });
    const out100 = run100!.steps['step-receive-tokens'].changes['trader.tokenB'];
    const out500 = run500!.steps['step-receive-tokens'].changes['trader.tokenB'];
    expect(out100).not.toBe(out500);
    expect(run500!.steps['step-constant-product'].changes['liquidity-pool.reserve0']).toBe(
      '1,000 → 1,500 TOKEN-A',
    );
  });

  it('returns null when the scenario has no compute binding', async () => {
    const addLiquidity = scenarioOf(uniswapV2, 'add-liquidity');
    expect(await computeScenarioRun(simMath, addLiquidity, {})).toBeNull();
  });
});

describe('computeScenarioRun — generic kind (interest)', () => {
  it('maps result fields onto matching varExpr keys', async () => {
    const scenario: SimulationScenario = {
      id: 'accrue',
      name: 'x',
      description: 'x',
      compute: { kind: 'interest', inputs: { principal: 'principal' } },
      params: [
        { id: 'principal', label: 'x', type: 'uint256', defaultValue: (1000n * WAD).toString() },
      ],
      steps: [
        {
          id: 's1',
          description: 'x',
          highlightNodes: [],
          highlightEdges: [],
          valueChanges: { 'debt.totalDebt': 'authored', 'debt.unrelated': 'kept' },
          durationMs: 100,
        },
      ],
    };
    const run = await computeScenarioRun(simMath, scenario, {
      principal: (1000n * WAD).toString(),
    });
    const changes = run!.steps['s1'].changes;
    expect(changes['debt.totalDebt']).not.toBe('authored');
    expect(changes['debt.totalDebt']).toMatch(/^1,0/); // principal + linear interest
    expect(changes['debt.unrelated']).toBe('kept');
  });
});

describe('foldNodeValues / currentValueOf', () => {
  it('folds executed changes into per-node current values', () => {
    const scenario = scenarioOf(erc20, 'basic-transfer');
    const computedChanges: Record<string, Record<string, string>> = {
      'step-call': { 'user.balance': '1,000 → 750 TOKEN' },
      'step-validate': {
        'storage-balances._balances[sender]': '1,000 → 750 TOKEN',
        'storage-balances._balances[recipient]': '0 → 250 TOKEN',
      },
    };
    const folded = foldNodeValues(
      scenario.steps,
      (step) => computedChanges[step.id],
      1,
    );
    expect(folded['user']?.['balance']).toBe('750 TOKEN');
    expect(folded['storage-balances']?.['_balances[sender]']).toBe('750 TOKEN');
    expect(folded['storage-balances']?.['_balances[recipient]']).toBe('250 TOKEN');
  });

  it('currentValueOf takes the right-hand side of a transition', () => {
    expect(currentValueOf('1,000 → 750 TOKEN')).toBe('750 TOKEN');
    expect(currentValueOf('single value')).toBe('single value');
  });
});

describe('SimulationEngine — compute wiring', () => {
  function makeEngine() {
    const patches: EnginePatch[] = [];
    const engine = new SimulationEngine((p) => patches.push(p));
    engine.setWorker(simMath);
    return { engine, patches };
  }

  it('stepForward records computed stepResults driven by current params', async () => {
    const { engine, patches } = makeEngine();
    const scenario = scenarioOf(erc20, 'basic-transfer');
    const params = {
      sender: '0xAlice',
      recipient: '0xBob',
      amount: (250n * WAD).toString(),
    };

    await engine.stepForward(scenario, -1, params); // step-call
    await engine.stepForward(scenario, 0, params); // step-validate

    const resultPatches = patches.filter((p) => p.stepResults);
    expect(resultPatches).toHaveLength(2);
    expect(resultPatches[1].stepResults?.['step-validate']?.[
      'storage-balances._balances[sender]'
    ]).toBe('1,000 → 750 TOKEN');

    // Node values folded up to the latest step.
    const nodePatches = patches.filter((p) => p.nodeValues);
    const lastNodeValues = nodePatches[nodePatches.length - 1].nodeValues!;
    expect(lastNodeValues['storage-balances']['_balances[sender]']).toBe('750 TOKEN');
  });

  it('changing a param mid-run resets the run (resetRun patch)', async () => {
    const { engine, patches } = makeEngine();
    const scenario = scenarioOf(erc20, 'basic-transfer');
    await engine.stepForward(scenario, -1, { amount: (100n * WAD).toString() });

    engine.setParam('amount', (500n * WAD).toString(), 0);
    const last = patches[patches.length - 1];
    expect(last.resetRun).toBe(true);
    expect(last.params).toEqual({ amount: (500n * WAD).toString() });
  });

  it('param change before start does not reset, only updates', () => {
    const { engine, patches } = makeEngine();
    engine.setParam('amount', '1', -1);
    const last = patches[patches.length - 1];
    expect(last.resetRun).toBeUndefined();
    expect(last.params).toEqual({ amount: '1' });
  });

  it('falls back to authored valueChanges when the scenario has no binding', async () => {
    const { engine, patches } = makeEngine();
    const scenario = scenarioOf(uniswapV2, 'add-liquidity');
    await engine.stepForward(scenario, -1, {});
    const resultPatch = patches.find((p) => p.stepResults);
    expect(resultPatch?.stepResults?.['step-approve-tokens']?.['trader.allowance']).toBe(
      'Router approved for TOKEN-A and TOKEN-B',
    );
  });
});
