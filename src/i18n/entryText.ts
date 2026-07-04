/**
 * Entry-content i18n helpers.
 *
 * Data files author translation keys WITH the entry slug prefix
 * (e.g. `erc20.fn.transfer.desc`) per project convention, while the locale
 * JSON files (`locales/{lng}/{slug}.json`) store FLAT keys WITHOUT the
 * prefix (literal `"fn.transfer.desc"`, resolved by i18next's flat
 * dotted-key fallback — `ignoreJSONStructure: true`, the default).
 *
 * Every lookup of an entry-content key must therefore strip the slug prefix
 * before querying the entry's namespace, otherwise the lookup always misses
 * and the raw key leaks into the UI.
 */

/** Remove the `${slug}.` prefix from an entry i18n key, if present. */
export function stripEntryPrefix(slug: string, key: string): string {
  return key.startsWith(`${slug}.`) ? key.slice(slug.length + 1) : key;
}

/** Minimal shape of an i18next `t` function used by {@link resolveEntryText}. */
export type EntryTFunction = (
  key: string,
  options: { defaultValue: string; ns?: string },
) => string;

/**
 * Resolve an entry-content key (`{slug}.section.detail`) against the entry's
 * namespace via `t`. Values that are not authored as translation keys (plain
 * labels like `transfer()`) fall back to themselves unchanged.
 */
export function resolveEntryText(
  t: EntryTFunction,
  slug: string,
  key: string,
): string {
  return t(stripEntryPrefix(slug, key), { defaultValue: key });
}
