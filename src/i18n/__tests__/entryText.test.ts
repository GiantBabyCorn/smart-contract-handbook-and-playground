import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createInstance, type i18n as I18nInstance } from 'i18next';
import { stripEntryPrefix, resolveEntryText } from '../entryText';

// Real locale resource — locks the flat-dotted-key convention against the
// actual file shipped to production, not a synthetic fixture.
const enErc20 = JSON.parse(
  readFileSync(resolve(__dirname, '../locales/en/erc20.json'), 'utf-8'),
) as Record<string, string>;

describe('stripEntryPrefix', () => {
  it('strips the slug prefix from data-file keys', () => {
    expect(stripEntryPrefix('erc20', 'erc20.fn.transfer.desc')).toBe(
      'fn.transfer.desc',
    );
    expect(stripEntryPrefix('erc20', 'erc20.node.user')).toBe('node.user');
    expect(stripEntryPrefix('uniswap-v2', 'uniswap-v2.sim.swap.name')).toBe(
      'sim.swap.name',
    );
  });

  it('passes non-prefixed keys through unchanged', () => {
    expect(stripEntryPrefix('erc20', 'fn.transfer.desc')).toBe(
      'fn.transfer.desc',
    );
    expect(stripEntryPrefix('erc20', 'introduction')).toBe('introduction');
  });

  it('passes plain (non-key) labels through unchanged', () => {
    expect(stripEntryPrefix('erc20', 'transfer()')).toBe('transfer()');
    expect(stripEntryPrefix('erc20', 'Transfer event')).toBe('Transfer event');
  });

  it('only strips an exact `${slug}.` prefix', () => {
    // Similar-but-different slug must not be stripped.
    expect(stripEntryPrefix('erc20', 'erc201.fn.x')).toBe('erc201.fn.x');
    expect(stripEntryPrefix('erc2', 'erc20.fn.x')).toBe('erc20.fn.x');
  });
});

describe('i18next flat dotted-key resolution (lock-in)', () => {
  let i18n: I18nInstance;

  beforeAll(async () => {
    i18n = createInstance();
    await i18n.init({
      lng: 'en',
      fallbackLng: 'en',
      ns: ['erc20'],
      defaultNS: 'erc20',
      resources: { en: { erc20: enErc20 } },
      interpolation: { escapeValue: false },
    });
  });

  it('resolves a flat dotted key from the real en/erc20.json', () => {
    // The JSON stores the literal key "fn.totalSupply.desc" (flat, with
    // dots). i18next's default `ignoreJSONStructure: true` must find it.
    const result = i18n.t('fn.totalSupply.desc', { ns: 'erc20' });
    expect(result).toBe(enErc20['fn.totalSupply.desc']);
    expect(result).not.toBe('fn.totalSupply.desc');
    expect(result).toMatch(/total number of tokens/i);
  });

  it('slug-prefixed keys MISS the namespace (the bug stripEntryPrefix fixes)', () => {
    const result = i18n.t('erc20.fn.totalSupply.desc', {
      ns: 'erc20',
      defaultValue: 'MISS',
    });
    expect(result).toBe('MISS');
  });

  it('resolveEntryText resolves prefixed data-file keys end-to-end', () => {
    const tEntry = i18n.getFixedT('en', 'erc20');
    expect(resolveEntryText(tEntry, 'erc20', 'erc20.fn.totalSupply.desc')).toBe(
      enErc20['fn.totalSupply.desc'],
    );
    // Flow node / edge labels
    expect(resolveEntryText(tEntry, 'erc20', 'erc20.node.user')).toBe(
      'Token Holder',
    );
    expect(resolveEntryText(tEntry, 'erc20', 'erc20.edge.callTransfer')).toBe(
      'Call transfer()',
    );
    // Simulation scenario name / step / param label
    expect(
      resolveEntryText(tEntry, 'erc20', 'erc20.sim.basicTransfer.name'),
    ).toBe('Basic Token Transfer');
    expect(
      resolveEntryText(tEntry, 'erc20', 'erc20.sim.basicTransfer.param.sender'),
    ).toBe('Sender address');
  });

  it('resolveEntryText falls back to the original value for plain labels', () => {
    const tEntry = i18n.getFixedT('en', 'erc20');
    expect(resolveEntryText(tEntry, 'erc20', 'transfer()')).toBe('transfer()');
    expect(resolveEntryText(tEntry, 'erc20', 'Transfer event')).toBe(
      'Transfer event',
    );
  });
});
