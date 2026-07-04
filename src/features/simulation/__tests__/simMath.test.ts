import { describe, it, expect } from 'vitest';
import { simMath, DEFAULT_INITIAL_BALANCE } from '../simMath';

const WAD = 10n ** 18n;

describe('computeSwap — constant product AMM', () => {
  const reserveIn = 1000n * WAD;
  const reserveOut = 3000n * WAD;

  it('k invariant is non-decreasing and strictly grows with the 0.3% fee', () => {
    const amounts = [
      1n, // dust
      10n ** 9n, // 1 gwei
      1n * WAD,
      100n * WAD,
      500n * WAD,
      12345n * WAD, // larger than the pool
    ];
    const kBefore = reserveIn * reserveOut;

    for (const aIn of amounts) {
      const { amountOut } = simMath.computeSwap({
        reserveIn: reserveIn.toString(),
        reserveOut: reserveOut.toString(),
        amountIn: aIn.toString(),
      });
      const out = BigInt(amountOut);
      expect(out < reserveOut).toBe(true);
      const kAfter = (reserveIn + aIn) * (reserveOut - out);
      // Fee + floor division mean k must strictly grow for any positive input.
      expect(kAfter > kBefore, `k must grow for amountIn=${aIn}`).toBe(true);
    }
  });

  it('larger input yields larger (but sublinear) output', () => {
    const out100 = BigInt(
      simMath.computeSwap({
        reserveIn: reserveIn.toString(),
        reserveOut: reserveOut.toString(),
        amountIn: (100n * WAD).toString(),
      }).amountOut,
    );
    const out500 = BigInt(
      simMath.computeSwap({
        reserveIn: reserveIn.toString(),
        reserveOut: reserveOut.toString(),
        amountIn: (500n * WAD).toString(),
      }).amountOut,
    );
    expect(out500 > out100).toBe(true);
    // Price impact: 5x the input must return less than 5x the output.
    expect(out500 < out100 * 5n).toBe(true);
  });

  it('returns zero output for empty reserves or zero input', () => {
    expect(
      simMath.computeSwap({ reserveIn: '0', reserveOut: '10', amountIn: '5' }).amountOut,
    ).toBe('0');
    expect(
      simMath.computeSwap({
        reserveIn: reserveIn.toString(),
        reserveOut: reserveOut.toString(),
        amountIn: '0',
      }).amountOut,
    ).toBe('0');
  });
});

describe('computeTokenTransfer — generic ERC-20 model', () => {
  it('transfer moves the amount and conserves total supply', () => {
    const amount = 250n * WAD;
    const res = simMath.computeTokenTransfer({
      sender: '0xAlice',
      recipient: '0xBob',
      amount: amount.toString(),
    });

    expect(res.ops).toHaveLength(1);
    const op = res.ops[0];
    expect(op.op).toBe('transfer');
    expect(op.ok).toBe(true);

    const senderBal = op.changes.find((c) => c.variable === '_balances[sender]');
    const recipientBal = op.changes.find((c) => c.variable === '_balances[recipient]');
    expect(senderBal).toEqual({
      variable: '_balances[sender]',
      before: DEFAULT_INITIAL_BALANCE,
      after: (750n * WAD).toString(),
    });
    expect(recipientBal).toEqual({
      variable: '_balances[recipient]',
      before: '0',
      after: amount.toString(),
    });

    // Conservation: sum of balances equals the initial supply.
    const total = Object.values(res.balances).reduce((acc, v) => acc + BigInt(v), 0n);
    expect(total).toBe(BigInt(DEFAULT_INITIAL_BALANCE));
  });

  it('reverts with insufficientBalance when amount exceeds the balance', () => {
    const res = simMath.computeTokenTransfer({
      sender: '0xAlice',
      recipient: '0xBob',
      amount: (2000n * WAD).toString(),
    });
    const op = res.ops[0];
    expect(op.ok).toBe(false);
    expect(op.revertReason).toBe('revert.insufficientBalance');
    // Balances unchanged.
    for (const change of op.changes) {
      expect(change.after).toBe(change.before);
    }
    expect(res.balances['0xAlice']).toBe(DEFAULT_INITIAL_BALANCE);
    expect(res.balances['0xBob']).toBe('0');
  });

  it('approve + transferFrom traces both allowance transitions (20% pull)', () => {
    const allowance = 500n * WAD;
    const res = simMath.computeTokenTransfer({
      sender: '0xOwner',
      recipient: '0xRecipient',
      spender: '0xSpender',
      amount: allowance.toString(),
    });

    expect(res.ops.map((o) => o.op)).toEqual(['approve', 'transferFrom']);
    expect(res.ops.every((o) => o.ok)).toBe(true);

    const approveChange = res.ops[0].changes[0];
    expect(approveChange.variable).toBe('_allowances[owner][spender]');
    expect(approveChange.before).toBe('0');
    expect(approveChange.after).toBe(allowance.toString());

    const pull = allowance / 5n; // demo semantics: spender pulls 20%
    const tfAllowance = res.ops[1].changes.find(
      (c) => c.variable === '_allowances[owner][spender]',
    );
    expect(tfAllowance?.before).toBe(allowance.toString());
    expect(tfAllowance?.after).toBe((allowance - pull).toString());

    expect(res.balances['0xOwner']).toBe((BigInt(DEFAULT_INITIAL_BALANCE) - pull).toString());
    expect(res.balances['0xRecipient']).toBe(pull.toString());
    expect(res.allowances['0xOwner:0xSpender']).toBe((allowance - pull).toString());
  });

  it('self-transfer nets to no balance change', () => {
    const res = simMath.computeTokenTransfer({
      sender: '0xAlice',
      recipient: '0xAlice',
      amount: (100n * WAD).toString(),
    });
    expect(res.ops[0].ok).toBe(true);
    expect(res.balances['0xAlice']).toBe(DEFAULT_INITIAL_BALANCE);
  });
});
