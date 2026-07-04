/**
 * Pure simulation math shared by the Web Worker and unit tests.
 *
 * All arithmetic uses BigInt to avoid floating-point precision loss.
 * These are intentionally simplified on-chain math models for UI simulation
 * purposes — they approximate real protocol behaviour without requiring
 * full EVM execution.
 *
 * `simulation.worker.ts` exposes this object via comlink; tests import it
 * directly (no Worker/DOM required). See docs/adr/002-worker-over-wasm.md.
 */

// ─── Worker API types ─────────────────────────────────────────────────────────

export interface TokenTransferOp {
  op: 'transfer' | 'approve' | 'transferFrom';
  ok: boolean;
  /** i18n key in the `simulation` namespace (e.g. 'revert.insufficientBalance'). */
  revertReason?: string;
  /** Ordered storage-variable transitions produced by this operation.
   *  Variables use role-based names matching the entry data's valueChanges
   *  keys: '_balances[sender]', '_balances[recipient]', '_allowances[owner][spender]'. */
  changes: Array<{ variable: string; before: string; after: string }>;
}

export interface TokenTransferResult {
  ops: TokenTransferOp[];
  /** Final balances by account (wei strings). */
  balances: Record<string, string>;
  /** Final allowances keyed '<owner>:<spender>' (wei strings). */
  allowances: Record<string, string>;
}

export interface SimWorkerApi {
  computeSwap(params: { reserveIn: string; reserveOut: string; amountIn: string }): { amountOut: string; priceImpact: string };
  computeConcentratedSwap(params: { tickLower: number; tickUpper: number; liquidity: string; amountIn: string }): { amountOut: string; crossedTicks: number };
  computeInterest(params: { principal: string; ratePerSecond: string; duration: number }): { accruedInterest: string; totalDebt: string };
  computeCdpRatio(params: { collateral: string; debt: string; price: string }): { ratio: string; isLiquidatable: boolean };
  computeFacetRoute(params: { selector: string; facets: Array<{ selectors: string[]; address: string }> }): { matchedFacet: string };
  computeStableswap(params: { balances: string[]; amountIn: string; indexIn: number; indexOut: number; amp: string }): { amountOut: string; fee: string };
  computeRebase(params: { shares: string; totalShares: string; totalPooledEth: string; newRewards: string }): { newBalance: string; rewardPerShare: string };
  computeTokenTransfer(params: {
    sender: string;
    recipient: string;
    spender?: string;
    amount: string;
    /** Sender's starting balance in wei; defaults to 1000e18. */
    initialBalance?: string;
  }): TokenTransferResult;
}

/**
 * Structural type accepted by the engine: the comlink `Remote<SimWorkerApi>`
 * proxy (Promise-returning) or the plain `simMath` object (sync, for tests).
 */
export type SimWorkerLike = {
  [K in keyof SimWorkerApi]: (
    ...args: Parameters<SimWorkerApi[K]>
  ) => ReturnType<SimWorkerApi[K]> | Promise<ReturnType<SimWorkerApi[K]>>;
};

// ─── Implementation ───────────────────────────────────────────────────────────

const PRECISION = 10n ** 18n;

/** Default demo balance: 1000 tokens (18 decimals) — matches the authored
 *  flow diagrams' initial world state (e.g. erc20 'user' node: '1000 TOKEN'). */
export const DEFAULT_INITIAL_BALANCE = (1000n * PRECISION).toString();

export const simMath: SimWorkerApi = {
  // ─── Uniswap V2 constant-product AMM ────────────────────────────────────────
  computeSwap({ reserveIn, reserveOut, amountIn }) {
    const rIn = BigInt(reserveIn);
    const rOut = BigInt(reserveOut);
    const aIn = BigInt(amountIn);

    if (rIn === 0n || rOut === 0n || aIn === 0n) {
      return { amountOut: '0', priceImpact: '0.00%' };
    }

    // amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
    const amountInWithFee = aIn * 997n;
    const numerator = amountInWithFee * rOut;
    const denominator = rIn * 1000n + amountInWithFee;
    const amountOut = numerator / denominator;

    // Price impact: deviation from the ideal no-fee, zero-slippage output.
    // idealOut = amountIn * reserveOut / reserveIn
    // impact (bps) = (idealOut - amountOut) * 10000 / idealOut
    const idealOut = (aIn * rOut) / rIn;
    const impact =
      idealOut > 0n ? ((idealOut - amountOut) * 10000n) / idealOut : 0n;

    return {
      amountOut: amountOut.toString(),
      priceImpact: (Number(impact) / 100).toFixed(2) + '%',
    };
  },

  // ─── Uniswap V3 concentrated liquidity (simplified) ─────────────────────────
  computeConcentratedSwap({ tickLower, tickUpper, liquidity, amountIn }) {
    const L = BigInt(liquidity);
    const aIn = BigInt(amountIn);
    const tickRange = BigInt(Math.max(tickUpper - tickLower, 1));

    if (L === 0n || aIn === 0n) {
      return { amountOut: '0', crossedTicks: 0 };
    }

    // Effective liquidity scaled by range density.
    // Wider range → liquidity is spread thinner → larger price impact per swap.
    const effectiveLiquidity = (L * tickRange) / 1000n;

    // CFMM-style: output is bounded by the effective liquidity in this range.
    const amountOut =
      (aIn * effectiveLiquidity) / (effectiveLiquidity + aIn);

    // Estimate crossed ticks: larger swaps relative to liquidity-per-tick cross more ticks.
    const liquidityPerTick =
      Number(L) / Math.max(tickUpper - tickLower, 1);
    const crossedTicks = Math.min(
      Math.max(1, Math.floor(Number(aIn) / Math.max(liquidityPerTick / 100, 1))),
      tickUpper - tickLower,
    );

    return {
      amountOut: amountOut.toString(),
      crossedTicks,
    };
  },

  // ─── Aave / Compound lending interest accrual ────────────────────────────────
  computeInterest({ principal, ratePerSecond, duration }) {
    // Linear approximation of compound interest:
    // interest ≈ P * rate * t  (rate is 1e18 fixed-point per second)
    // Full compound: A = P * (1 + r)^t would require loop or float — not suitable here.
    const P = BigInt(principal);
    const rate = BigInt(ratePerSecond);

    if (P === 0n || rate === 0n || duration <= 0) {
      return { accruedInterest: '0', totalDebt: P.toString() };
    }

    const interest = (P * rate * BigInt(duration)) / PRECISION;
    const totalDebt = P + interest;

    return {
      accruedInterest: interest.toString(),
      totalDebt: totalDebt.toString(),
    };
  },

  // ─── MakerDAO CDP collateralisation ratio ────────────────────────────────────
  computeCdpRatio({ collateral, debt, price }) {
    // collateralValue = collateral * price / 1e18  (price is 1e18 fixed-point USD)
    // ratio = collateralValue / debt  expressed as a percentage string
    const col = BigInt(collateral);
    const d = BigInt(debt);
    const p = BigInt(price);

    if (d === 0n) {
      return { ratio: 'Infinity', isLiquidatable: false };
    }

    const collateralValue = (col * p) / PRECISION;
    // Work in basis-points for precision before converting to a human-readable string.
    const ratioBps = (collateralValue * 10000n) / d;
    const ratioPercent = Number(ratioBps) / 100;

    return {
      ratio: ratioPercent.toFixed(2) + '%',
      // Standard CDP liquidation threshold is 150%.
      isLiquidatable: ratioPercent < 150,
    };
  },

  // ─── ERC-2535 Diamond facet routing ─────────────────────────────────────────
  computeFacetRoute({ selector, facets }) {
    const matched = facets.find((f) => f.selectors.includes(selector));
    // Return the zero address sentinel when no facet handles the selector.
    return {
      matchedFacet:
        matched?.address ?? '0x0000000000000000000000000000000000000000',
    };
  },

  // ─── Curve StableSwap (simplified) ──────────────────────────────────────────
  computeStableswap({ balances, amountIn, indexIn, indexOut, amp }) {
    // Simplified Curve-style StableSwap.
    // Full implementation requires Newton's method for invariant D; here we use
    // a linear approximation modulated by pool imbalance and amplification.
    const bals = balances.map(BigInt);
    const aIn = BigInt(amountIn);
    const A = BigInt(amp);
    const n = BigInt(bals.length);

    if (aIn === 0n || bals.length < 2) {
      return { amountOut: '0', fee: '0' };
    }

    // 0.04% swap fee (4 bps) — consistent with typical Curve pool settings.
    const fee = (aIn * 4n) / 10000n;
    const amountInAfterFee = aIn - fee;

    // Stablecoin output is close to 1:1; adjust for pool imbalance.
    // Higher A → closer to constant-sum → less slippage on imbalanced pools.
    const sum = bals.reduce((acc, b) => acc + b, 0n);
    const balIn = bals[indexIn] ?? 0n;
    const balOut = bals[indexOut] ?? 0n;

    // Imbalance factor: excess of the input reserve over the output reserve.
    const imbalance =
      balIn > balOut ? ((balIn - balOut) * 100n) / (sum + 1n) : 0n;

    // A * n dampens the imbalance penalty — larger amplification = tighter peg.
    const slippagePenalty =
      (amountInAfterFee * imbalance) / (A * n * 100n + 1n);
    const amountOut = amountInAfterFee - slippagePenalty;

    return {
      amountOut: (amountOut > 0n ? amountOut : 0n).toString(),
      fee: fee.toString(),
    };
  },

  // ─── Lido stETH rebase ───────────────────────────────────────────────────────
  computeRebase({ shares, totalShares, totalPooledEth, newRewards }) {
    // Lido-style: each holder's token balance is derived from their share of
    // the total pooled ETH.  After a rebase the pool grows by newRewards.
    // newBalance = shares * (totalPooledEth + newRewards) / totalShares
    const s = BigInt(shares);
    const ts = BigInt(totalShares);
    const tpe = BigInt(totalPooledEth);
    const rewards = BigInt(newRewards);

    if (ts === 0n) {
      return { newBalance: '0', rewardPerShare: '0' };
    }

    const newTotalPooled = tpe + rewards;
    const newBalance = (s * newTotalPooled) / ts;
    // rewardPerShare expressed in wei (1e18 fixed-point per share unit).
    const rewardPerShare = (rewards * PRECISION) / ts;

    return {
      newBalance: newBalance.toString(),
      rewardPerShare: rewardPerShare.toString(),
    };
  },

  // ─── Generic ERC-20 token model ─────────────────────────────────────────────
  computeTokenTransfer({ sender, recipient, spender, amount, initialBalance }) {
    const amt = BigInt(amount);
    const balances = new Map<string, bigint>();
    balances.set(sender, BigInt(initialBalance ?? DEFAULT_INITIAL_BALANCE));
    if (!balances.has(recipient)) balances.set(recipient, 0n);
    const allowances = new Map<string, bigint>();
    const ops: TokenTransferOp[] = [];

    const move = (
      op: TokenTransferOp['op'],
      from: string,
      to: string,
      value: bigint,
      viaAllowance: boolean,
    ): void => {
      const allowKey = `${from}:${spender}`;
      const fromBefore = balances.get(from) ?? 0n;
      const toBefore = balances.get(to) ?? 0n;
      const allowanceBefore = allowances.get(allowKey) ?? 0n;

      const unchanged = (): TokenTransferOp['changes'] => {
        const rows = [
          { variable: '_balances[sender]', before: fromBefore.toString(), after: fromBefore.toString() },
          { variable: '_balances[recipient]', before: toBefore.toString(), after: toBefore.toString() },
        ];
        if (viaAllowance) {
          rows.push({
            variable: '_allowances[owner][spender]',
            before: allowanceBefore.toString(),
            after: allowanceBefore.toString(),
          });
        }
        return rows;
      };

      if (viaAllowance && value > allowanceBefore) {
        ops.push({ op, ok: false, revertReason: 'revert.insufficientAllowance', changes: unchanged() });
        return;
      }
      if (value > fromBefore) {
        ops.push({ op, ok: false, revertReason: 'revert.insufficientBalance', changes: unchanged() });
        return;
      }

      // Debit first, then credit reading the CURRENT balance so a self-transfer
      // (from === to) nets out to no change.
      balances.set(from, fromBefore - value);
      balances.set(to, (balances.get(to) ?? 0n) + value);

      const changes: TokenTransferOp['changes'] = [
        { variable: '_balances[sender]', before: fromBefore.toString(), after: (balances.get(from) ?? 0n).toString() },
        { variable: '_balances[recipient]', before: toBefore.toString(), after: (balances.get(to) ?? 0n).toString() },
      ];
      if (viaAllowance) {
        allowances.set(allowKey, allowanceBefore - value);
        changes.push({
          variable: '_allowances[owner][spender]',
          before: allowanceBefore.toString(),
          after: (allowances.get(allowKey) ?? 0n).toString(),
        });
      }
      ops.push({ op, ok: true, changes });
    };

    if (spender) {
      // approve(spender, amount) …
      const allowKey = `${sender}:${spender}`;
      const before = allowances.get(allowKey) ?? 0n;
      allowances.set(allowKey, amt);
      ops.push({
        op: 'approve',
        ok: true,
        changes: [
          { variable: '_allowances[owner][spender]', before: before.toString(), after: amt.toString() },
        ],
      });
      // … then the spender pulls 20% of the granted allowance via transferFrom
      // (demo semantics: keeps the default numbers aligned with the authored
      // scenario — approve 500 → transferFrom 100 — while staying param-driven).
      move('transferFrom', sender, recipient, amt / 5n, true);
    } else {
      move('transfer', sender, recipient, amt, false);
    }

    return {
      ops,
      balances: Object.fromEntries(
        [...balances.entries()].map(([k, v]) => [k, v.toString()]),
      ),
      allowances: Object.fromEntries(
        [...allowances.entries()].map(([k, v]) => [k, v.toString()]),
      ),
    };
  },
};
