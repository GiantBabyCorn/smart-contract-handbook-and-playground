import { describe, it, expect } from 'vitest';
import {
  weiToEth,
  ethToWei,
  formatThousands,
  formatTokenAmount,
  validateParam,
  stripFormatting,
} from '../units';

describe('wei ↔ ETH conversion (BigInt-safe string math)', () => {
  it('converts ETH to wei', () => {
    expect(ethToWei('1')).toBe('1000000000000000000');
    expect(ethToWei('1.5')).toBe('1500000000000000000');
    expect(ethToWei('0')).toBe('0');
    expect(ethToWei('0.000000000000000001')).toBe('1');
    expect(ethToWei('250')).toBe('250000000000000000000');
  });

  it('converts wei to ETH', () => {
    expect(weiToEth('1000000000000000000')).toBe('1');
    expect(weiToEth('1500000000000000000')).toBe('1.5');
    expect(weiToEth('1')).toBe('0.000000000000000001');
    expect(weiToEth('0')).toBe('0');
  });

  it('round-trips losslessly up to 18 decimals', () => {
    const samples = ['1', '1.5', '123.456789012345678901'.slice(0, 22), '0.000000000000000001'];
    for (const eth of samples) {
      expect(weiToEth(ethToWei(eth))).toBe(eth.replace(/0+$/, '').replace(/\.$/, '') || '0');
    }
    // And the exact monster value beyond float precision:
    const wei = '123456789012345678901';
    expect(ethToWei(weiToEth(wei))).toBe(wei);
  });

  it('truncates (never rounds) decimals beyond 18 places', () => {
    expect(ethToWei('1.9999999999999999999')).toBe('1999999999999999999');
  });

  it('accepts thousand separators in input', () => {
    expect(ethToWei('1,000')).toBe('1000000000000000000000');
    expect(stripFormatting('1,234,567')).toBe('1234567');
  });
});

describe('display formatting', () => {
  it('adds thousand separators', () => {
    expect(formatThousands('1234567')).toBe('1,234,567');
    expect(formatThousands('123')).toBe('123');
    expect(formatThousands('1234567.891')).toBe('1,234,567.891');
  });

  it('humanises wei amounts with up to 4 truncated decimals', () => {
    expect(formatTokenAmount('1000000000000000000000')).toBe('1,000');
    expect(formatTokenAmount('750000000000000000000')).toBe('750');
    expect(formatTokenAmount('2988023114444881161')).toBe('2.988');
    expect(formatTokenAmount(0n)).toBe('0');
  });
});

describe('validateParam', () => {
  it('accepts full hex addresses and demo aliases', () => {
    expect(validateParam('address', '0x' + 'a1'.repeat(20)).ok).toBe(true);
    expect(validateParam('address', '0xAlice').ok).toBe(true);
    expect(validateParam('address', '0xTokenA,0xTokenB').ok).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(validateParam('address', 'Alice')).toEqual({
      ok: false,
      errorKey: 'param.invalidAddress',
    });
    expect(validateParam('address', '0x123').ok).toBe(false); // digits-only alias
    expect(validateParam('address', '').ok).toBe(false);
  });

  it('accepts digit-only uint256 values (with separators)', () => {
    expect(validateParam('uint256', '100').ok).toBe(true);
    expect(validateParam('uint256', '1,000,000').ok).toBe(true);
    // uint256 max (78 digits)
    expect(
      validateParam(
        'uint256',
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      ).ok,
    ).toBe(true);
  });

  it('rejects non-integers and overflow-length values', () => {
    expect(validateParam('uint256', '12a')).toEqual({
      ok: false,
      errorKey: 'param.invalidUint',
    });
    expect(validateParam('uint256', '1.5').ok).toBe(false);
    expect(validateParam('uint256', '').ok).toBe(false);
    expect(validateParam('uint256', '9'.repeat(79)).ok).toBe(false);
  });

  it('always accepts bool and select values', () => {
    expect(validateParam('bool', 'true').ok).toBe(true);
    expect(validateParam('select', 'anything').ok).toBe(true);
  });
});
