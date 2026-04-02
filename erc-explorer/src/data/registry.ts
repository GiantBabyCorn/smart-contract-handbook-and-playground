import type { ERCEntry } from './types';

const modules = import.meta.glob<{ entry: ERCEntry }>(
  ['./standards/*.ts', './protocols/*.ts'],
);

const fullCache = new Map<string, ERCEntry>();

export async function getEntryBySlug(slug: string): Promise<ERCEntry | null> {
  if (fullCache.has(slug)) return fullCache.get(slug)!;
  const key = Object.keys(modules).find((k) => k.includes(`/${slug}.ts`));
  if (!key) return null;
  const mod = await modules[key]();
  fullCache.set(slug, mod.entry);
  return mod.entry;
}
