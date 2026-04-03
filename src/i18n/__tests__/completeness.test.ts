import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

const LOCALES_DIR = resolve(__dirname, '../locales');
const LOCALES = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es'];

function getJsonFiles(locale: string): string[] {
  const dir = join(LOCALES_DIR, locale);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();
}

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

function loadJson(locale: string, filename: string): Record<string, unknown> {
  const filepath = join(LOCALES_DIR, locale, filename);
  return JSON.parse(readFileSync(filepath, 'utf-8'));
}

describe('i18n Completeness', () => {
  const enFiles = getJsonFiles('en');

  it('English locale has translation files', () => {
    expect(enFiles.length).toBeGreaterThan(0);
  });

  describe.each(LOCALES.filter((l) => l !== 'en'))('locale %s', (locale) => {
    it('has the same set of JSON files as en/', () => {
      const localeFiles = getJsonFiles(locale);
      expect(localeFiles).toEqual(enFiles);
    });

    describe.each(enFiles)('file %s', (filename) => {
      it('has the same key set as en/', () => {
        const enKeys = flattenKeys(loadJson('en', filename));
        const localeKeys = flattenKeys(loadJson(locale, filename));
        expect(localeKeys).toEqual(enKeys);
      });

      it('has no empty string values', () => {
        const data = loadJson(locale, filename);
        const flat = flattenKeys(data);
        const getValue = (obj: Record<string, unknown>, key: string): unknown => {
          const parts = key.split('.');
          let current: unknown = obj;
          for (const part of parts) {
            if (typeof current !== 'object' || current === null) return undefined;
            current = (current as Record<string, unknown>)[part];
          }
          return current;
        };
        for (const key of flat) {
          const value = getValue(data, key);
          if (typeof value === 'string') {
            expect(value.trim(), `Empty value at ${locale}/${filename}:${key}`).not.toBe('');
          }
        }
      });
    });
  });

  describe('English locale', () => {
    describe.each(enFiles)('file %s', (filename) => {
      it('has no empty string values', () => {
        const data = loadJson('en', filename);
        const flat = flattenKeys(data);
        const getValue = (obj: Record<string, unknown>, key: string): unknown => {
          const parts = key.split('.');
          let current: unknown = obj;
          for (const part of parts) {
            if (typeof current !== 'object' || current === null) return undefined;
            current = (current as Record<string, unknown>)[part];
          }
          return current;
        };
        for (const key of flat) {
          const value = getValue(data, key);
          if (typeof value === 'string') {
            expect(value.trim(), `Empty value at en/${filename}:${key}`).not.toBe('');
          }
        }
      });
    });
  });
});
