import type { SimulationScenario, SimulationStep } from '@/data/types';
import type { SimWorkerLike } from './simMath';
import { formatTokenAmount, stripFormatting, isDigits } from './units';

/**
 * Compute-binding layer (plan §5.1, ADR 005 §5).
 *
 * When a scenario declares `compute`, the engine calls the worker with the
 * CURRENT user params and derives live per-step `valueChanges` that replace
 * the hard-coded authored strings. Authored values remain the per-key
 * fallback whenever a key cannot be mapped, and the whole authored set is
 * used when the worker fails or `compute` is absent.
 *
 * Value-mapping contract: authored valueChanges keys are `nodeId.varExpr`
 * (e.g. 'storage-balances._balances[sender]', 'liquidity-pool.reserve0').
 * Each ComputeBinding kind knows which canonical variables it produces and
 * matches them against the varExpr part; computed values are emitted in the
 * same `old → new` display format so the panel/nodes parse both sources
 * identically.
 *
 * World-model constants (initial reserves/balances) mirror the entry
 * diagrams' authored initial state (erc20 user: 1000 TOKEN; uniswap pool:
 * 1000 TOKEN-A / 3000 TOKEN-B). A future schema rev could move them into
 * the binding (`compute.state`).
 */

export interface ComputedStepResult {
  /** Full replacement for the step's valueChanges (unmapped keys keep the authored value). */
  changes: Record<string, string>;
  isRevert?: boolean;
  /** i18n key in the `simulation` namespace (e.g. 'revert.insufficientBalance'). */
  revertReason?: string;
  /** Token-movement label for highlighted fundFlow edges (e.g. '+2.988 TOKEN-B'). */
  flowLabel?: string;
}

export interface ComputedRun {
  steps: Record<string, ComputedStepResult>;
}

const WAD = 10n ** 18n;

const ARROW = ' → ';

const fmt = (v: bigint | string): string => formatTokenAmount(v);

const transition = (before: bigint, after: bigint, symbol: string): string =>
  `${fmt(before)}${ARROW}${fmt(after)} ${symbol}`;

/** Split an authored valueChanges key into node id and variable expression. */
function splitKey(key: string): { nodeId: string; varExpr: string } {
  const dot = key.indexOf('.');
  if (dot <= 0) return { nodeId: '', varExpr: key };
  return { nodeId: key.slice(0, dot), varExpr: key.slice(dot + 1) };
}

/** Resolve bound worker args from `compute.inputs` (paramId → argName). */
function mapInputs(
  scenario: SimulationScenario,
  params: Record<string, string>,
): Record<string, string> {
  const args: Record<string, string> = {};
  const inputs = scenario.compute?.inputs ?? {};
  for (const [paramId, argName] of Object.entries(inputs)) {
    const fallback = scenario.params.find((p) => p.id === paramId)?.defaultValue;
    const raw = params[paramId] ?? fallback;
    if (raw !== undefined) args[argName] = stripFormatting(raw);
  }
  return args;
}

// ─── tokenTransfer ────────────────────────────────────────────────────────────

async function runTokenTransfer(
  api: SimWorkerLike,
  scenario: SimulationScenario,
  args: Record<string, string>,
): Promise<ComputedRun> {
  const SYMBOL = 'TOKEN';
  const sender = args.sender || '0xSender';
  const recipient = args.recipient || '0xRecipient';
  const spender = args.spender || undefined;
  const amount = args.amount ?? '0';

  const result = await api.computeTokenTransfer({ sender, recipient, spender, amount });

  const moveOp = result.ops.find((o) => o.op === 'transfer' || o.op === 'transferFrom');
  const senderBal = moveOp?.changes.find((c) => c.variable === '_balances[sender]');
  const recipientBal = moveOp?.changes.find((c) => c.variable === '_balances[recipient]');
  // The allowance can transition more than once (approve → transferFrom):
  // consume the queue in authored step order.
  const allowanceQueue = result.ops.flatMap((o) =>
    o.changes.filter((c) => c.variable === '_allowances[owner][spender]'),
  );
  const moved =
    moveOp?.ok && senderBal ? BigInt(senderBal.before) - BigInt(senderBal.after) : 0n;
  const revert = moveOp && !moveOp.ok
    ? { isRevert: true as const, revertReason: moveOp.revertReason }
    : null;

  const steps: Record<string, ComputedStepResult> = {};
  for (const step of scenario.steps) {
    if (!step.valueChanges) continue;
    const out: ComputedStepResult = { changes: {} };
    for (const [key, authored] of Object.entries(step.valueChanges)) {
      const { nodeId, varExpr } = splitKey(key);
      const isSenderVar =
        varExpr === '_balances[sender]' ||
        (varExpr === 'balance' && !nodeId.includes('recipient'));
      const isRecipientVar =
        varExpr === '_balances[recipient]' ||
        (varExpr === 'balance' && nodeId.includes('recipient'));

      if (isSenderVar && senderBal) {
        out.changes[key] = transition(BigInt(senderBal.before), BigInt(senderBal.after), SYMBOL);
        if (revert) Object.assign(out, revert);
      } else if (isRecipientVar && recipientBal) {
        out.changes[key] = transition(BigInt(recipientBal.before), BigInt(recipientBal.after), SYMBOL);
        if (revert) Object.assign(out, revert);
        else if (moved > 0n) out.flowLabel = `+${fmt(moved)} ${SYMBOL}`;
      } else if (varExpr.startsWith('_allowances[')) {
        const next = allowanceQueue.shift();
        if (next) {
          out.changes[key] = transition(BigInt(next.before), BigInt(next.after), SYMBOL);
          if (revert && next.before === next.after) Object.assign(out, revert);
        } else {
          out.changes[key] = authored;
        }
      } else if (varExpr === 'lastEvent') {
        if (moveOp?.ok) {
          // Comma form (from, to, value) — never embed the ' → ' transition
          // separator inside a single value.
          out.changes[key] = `Transfer(${sender}, ${recipient}, ${fmt(moved)} ${SYMBOL})`;
        } else {
          out.changes[key] = '—';
          if (revert) Object.assign(out, revert);
        }
      } else {
        out.changes[key] = authored;
      }
    }
    steps[step.id] = out;
  }
  return { steps };
}

// ─── swap (Uniswap V2 constant product) ───────────────────────────────────────

const SWAP_WORLD = {
  reserveIn: 1000n * WAD, // 1000 TOKEN-A — matches the authored pool state
  reserveOut: 3000n * WAD, // 3000 TOKEN-B
  symbolIn: 'TOKEN-A',
  symbolOut: 'TOKEN-B',
};

async function runSwap(
  api: SimWorkerLike,
  scenario: SimulationScenario,
  args: Record<string, string>,
): Promise<ComputedRun> {
  const amountIn = BigInt(args.amountIn ?? '0');
  const reserveIn = args.reserveIn ? BigInt(args.reserveIn) : SWAP_WORLD.reserveIn;
  const reserveOut = args.reserveOut ? BigInt(args.reserveOut) : SWAP_WORLD.reserveOut;

  const { amountOut, priceImpact } = await api.computeSwap({
    reserveIn: reserveIn.toString(),
    reserveOut: reserveOut.toString(),
    amountIn: amountIn.toString(),
  });
  const out = BigInt(amountOut);
  const newReserveIn = reserveIn + amountIn;
  const newReserveOut = reserveOut - out;

  const steps: Record<string, ComputedStepResult> = {};
  for (const step of scenario.steps) {
    if (!step.valueChanges) continue;
    const res: ComputedStepResult = { changes: {} };
    for (const [key, authored] of Object.entries(step.valueChanges)) {
      const { varExpr } = splitKey(key);
      if (varExpr === 'reserve0') {
        res.changes[key] = transition(reserveIn, newReserveIn, SWAP_WORLD.symbolIn);
      } else if (varExpr === 'reserve1') {
        res.changes[key] =
          `${transition(reserveOut, newReserveOut, SWAP_WORLD.symbolOut)} (impact ${priceImpact})`;
      } else if (varExpr === 'tokenB') {
        res.changes[key] = `0${ARROW}${fmt(out)} ${SWAP_WORLD.symbolOut}`;
        if (out > 0n) res.flowLabel = `+${fmt(out)} ${SWAP_WORLD.symbolOut}`;
      } else if (varExpr === 'tokenA') {
        res.changes[key] = `-${fmt(amountIn)} ${SWAP_WORLD.symbolIn}`;
        if (amountIn > 0n) res.flowLabel = `${fmt(amountIn)} ${SWAP_WORLD.symbolIn}`;
      } else {
        res.changes[key] = authored;
      }
    }
    steps[step.id] = res;
  }
  return { steps };
}

// ─── Generic kinds (interest / cdp / stableswap / rebase) ─────────────────────
//
// No shipped entry binds these yet; the generic mapper makes every
// ComputeBinding kind usable: bound args merge over world defaults, and any
// step key whose varExpr equals a result field name gets the live value.

const GENERIC_DEFAULTS: Record<string, Record<string, unknown>> = {
  interest: {
    principal: (1000n * WAD).toString(),
    ratePerSecond: '1585489599', // ≈5% APR as 1e18 fixed-point per second
    duration: 31536000, // one year
  },
  cdp: {
    collateral: (2n * WAD).toString(),
    debt: (2000n * WAD).toString(),
    price: (3000n * WAD).toString(),
  },
  stableswap: {
    balances: [(1000000n * WAD).toString(), (1000000n * WAD).toString()],
    amountIn: (1000n * WAD).toString(),
    indexIn: 0,
    indexOut: 1,
    amp: '100',
  },
  rebase: {
    shares: (100n * WAD).toString(),
    totalShares: (1000000n * WAD).toString(),
    totalPooledEth: (1050000n * WAD).toString(),
    newRewards: (100n * WAD).toString(),
  },
};

/** Numeric-arg names that must be JS numbers rather than decimal strings. */
const NUMBER_ARGS = new Set(['duration', 'indexIn', 'indexOut', 'tickLower', 'tickUpper']);

function formatResultValue(value: unknown): string {
  if (typeof value === 'string' && isDigits(value) && value.length > 6) {
    // Large integers are wei-scale amounts — humanise them.
    return fmt(value);
  }
  return String(value);
}

async function runGeneric(
  api: SimWorkerLike,
  scenario: SimulationScenario,
  kind: 'interest' | 'cdp' | 'stableswap' | 'rebase',
  args: Record<string, string>,
): Promise<ComputedRun> {
  const merged: Record<string, unknown> = { ...GENERIC_DEFAULTS[kind] };
  for (const [name, value] of Object.entries(args)) {
    merged[name] = NUMBER_ARGS.has(name) ? Number(value) : value;
  }

  let result: Record<string, unknown>;
  switch (kind) {
    case 'interest':
      result = { ...(await api.computeInterest(merged as Parameters<SimWorkerLike['computeInterest']>[0])) };
      break;
    case 'cdp':
      result = { ...(await api.computeCdpRatio(merged as Parameters<SimWorkerLike['computeCdpRatio']>[0])) };
      break;
    case 'stableswap':
      result = { ...(await api.computeStableswap(merged as Parameters<SimWorkerLike['computeStableswap']>[0])) };
      break;
    case 'rebase':
      result = { ...(await api.computeRebase(merged as Parameters<SimWorkerLike['computeRebase']>[0])) };
      break;
  }

  const steps: Record<string, ComputedStepResult> = {};
  for (const step of scenario.steps) {
    if (!step.valueChanges) continue;
    const res: ComputedStepResult = { changes: {} };
    for (const [key, authored] of Object.entries(step.valueChanges)) {
      const { varExpr } = splitKey(key);
      res.changes[key] =
        varExpr in result ? formatResultValue(result[varExpr]) : authored;
    }
    steps[step.id] = res;
  }
  return { steps };
}

// ─── Entry point ──────────────────────────────────────────────────────────────

/**
 * Run the scenario's compute binding against the worker and derive live
 * per-step valueChanges. Returns null when the scenario has no binding.
 * Worker/mapping errors propagate to the caller (the engine falls back to
 * the authored values).
 */
export async function computeScenarioRun(
  api: SimWorkerLike,
  scenario: SimulationScenario,
  params: Record<string, string>,
): Promise<ComputedRun | null> {
  const binding = scenario.compute;
  if (!binding) return null;

  const args = mapInputs(scenario, params);
  switch (binding.kind) {
    case 'tokenTransfer':
      return runTokenTransfer(api, scenario, args);
    case 'swap':
      return runSwap(api, scenario, args);
    case 'interest':
    case 'cdp':
    case 'stableswap':
    case 'rebase':
      return runGeneric(api, scenario, binding.kind, args);
    default:
      return null;
  }
}

/** Extract the current (right-hand / final) value from an `old → new` display string. */
export function currentValueOf(display: string): string {
  const idx = display.lastIndexOf(ARROW);
  return idx >= 0 ? display.slice(idx + ARROW.length) : display;
}

/**
 * Fold executed step changes (steps 0..uptoIndex) into a per-node map of
 * current variable values — drives the storage-node value badges.
 */
export function foldNodeValues(
  steps: SimulationStep[],
  changesFor: (step: SimulationStep, index: number) => Record<string, string> | undefined,
  uptoIndex: number,
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (let i = 0; i <= uptoIndex && i < steps.length; i++) {
    const changes = changesFor(steps[i], i);
    if (!changes) continue;
    for (const [key, value] of Object.entries(changes)) {
      const { nodeId, varExpr } = splitKey(key);
      if (!nodeId) continue;
      (out[nodeId] ??= {})[varExpr] = currentValueOf(value);
    }
  }
  return out;
}
