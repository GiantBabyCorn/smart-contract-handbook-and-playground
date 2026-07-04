import type { SimulationParam } from '@/data/types';

/**
 * BigInt-safe unit conversion, formatting and parameter validation helpers
 * for the simulation UI (plan §5.5).
 *
 * All arithmetic is string/BigInt based — never floats — so 18-decimal token
 * amounts round-trip losslessly (wei ↔ ETH).
 */

const WAD = 10n ** 18n;

/** uint256 max is 78 decimal digits (2^256 − 1 ≈ 1.16e77). */
const UINT256_MAX_DIGITS = 78;

export function isDigits(s: string): boolean {
  return /^\d+$/.test(s);
}

/** Strip display-only formatting (thousand separators, spaces, underscores). */
export function stripFormatting(s: string): string {
  return s.replace(/[,\s_]/g, '');
}

/** '1234567' → '1,234,567' (an existing fraction part is left untouched). */
export function formatThousands(value: string): string {
  const [int, frac] = value.split('.');
  const sign = int.startsWith('-') ? '-' : '';
  const digits = sign ? int.slice(1) : int;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return sign + grouped + (frac !== undefined ? `.${frac}` : '');
}

/** wei → exact ETH decimal string ('1500000000000000000' → '1.5'). */
export function weiToEth(wei: string): string {
  const w = BigInt(stripFormatting(wei));
  const neg = w < 0n;
  const abs = neg ? -w : w;
  const int = (abs / WAD).toString();
  const frac = (abs % WAD).toString().padStart(18, '0').replace(/0+$/, '');
  return `${neg ? '-' : ''}${int}${frac ? `.${frac}` : ''}`;
}

/**
 * ETH decimal string → wei ('1.5' → '1500000000000000000').
 * Decimals beyond 18 places are truncated (never rounded — BigInt semantics).
 */
export function ethToWei(eth: string): string {
  const clean = stripFormatting(eth);
  const [intPart = '', fracPart = ''] = clean.split('.');
  const frac = (fracPart + '0'.repeat(18)).slice(0, 18);
  return (BigInt(intPart || '0') * WAD + BigInt(frac || '0')).toString();
}

/**
 * Humanise a wei-scale (18-decimal) amount for display:
 * up to `maxDp` decimals (truncated) with thousand separators.
 * '2988023114444881161' → '2.988'.
 */
export function formatTokenAmount(wei: bigint | string, maxDp = 4): string {
  const eth = weiToEth(typeof wei === 'bigint' ? wei.toString() : wei);
  const [int, frac = ''] = eth.split('.');
  const trimmed = frac.slice(0, maxDp).replace(/0+$/, '');
  return formatThousands(int) + (trimmed ? `.${trimmed}` : '');
}

// ─── Parameter validation ─────────────────────────────────────────────────────

export type ParamValidation =
  | { ok: true }
  | { ok: false; errorKey: 'param.invalidAddress' | 'param.invalidUint' };

const FULL_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/**
 * Entry data uses readable demo aliases instead of real addresses
 * ('0xAlice', '0xOwner', '0xTokenA', …): 0x + letter + alphanumerics.
 * These must validate loosely so authored defaults stay runnable.
 */
const ALIAS_RE = /^0x[A-Za-z][A-Za-z0-9]{0,30}$/;

/**
 * Validate a simulation parameter value.
 * - address: full 0x…40-hex address OR demo alias; comma-separated lists are
 *   allowed because path-style params are authored as '0xTokenA,0xTokenB'.
 * - uint256: digits only (after stripping separators), ≤ 78 digits.
 */
export function validateParam(
  type: SimulationParam['type'],
  value: string,
): ParamValidation {
  if (type === 'address') {
    const parts = value.split(',').map((p) => p.trim());
    const ok =
      parts.length > 0 &&
      parts.every((p) => FULL_ADDRESS_RE.test(p) || ALIAS_RE.test(p));
    return ok ? { ok: true } : { ok: false, errorKey: 'param.invalidAddress' };
  }
  if (type === 'uint256') {
    const raw = stripFormatting(value);
    const ok = isDigits(raw) && raw.length <= UINT256_MAX_DIGITS;
    return ok ? { ok: true } : { ok: false, errorKey: 'param.invalidUint' };
  }
  return { ok: true };
}
