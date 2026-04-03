import { describe, it, expect } from 'vitest';
import { allMeta } from '../allMeta';
import type { ERCEntry, StandardEntry } from '../types';

// Dynamically import all entry data files
async function loadEntry(slug: string, entryType: string): Promise<ERCEntry> {
  const subdir = entryType === 'standard' ? 'standards' : 'protocols';
  const mod = await import(`../${subdir}/${slug}.ts`);
  return mod.entry;
}

describe('Entry Registry', () => {
  it('allMeta has entries', () => {
    expect(allMeta.length).toBeGreaterThan(0);
  });

  it('all slugs are unique', () => {
    const slugs = allMeta.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all sortOrders are unique', () => {
    const orders = allMeta.map((m) => m.sortOrder);
    expect(new Set(orders).size).toBe(orders.length);
  });

  describe.each(allMeta.map((m) => [m.slug, m.entryType]))(
    'entry %s (%s)',
    (slug, entryType) => {
      it('has a data file that exports entry', async () => {
        const entry = await loadEntry(slug, entryType);
        expect(entry).toBeDefined();
        expect(entry.slug).toBe(slug);
      });

      it('has a non-empty officialUrl starting with https://', async () => {
        const entry = await loadEntry(slug, entryType);
        expect(entry.officialUrl).toBeTruthy();
        expect(entry.officialUrl).toMatch(/^https:\/\//);
      });

      it('has at least 1 function defined', async () => {
        const entry = await loadEntry(slug, entryType);
        expect(entry.functions.length).toBeGreaterThan(0);
      });

      it('has flow nodes with unique IDs', async () => {
        const entry = await loadEntry(slug, entryType);
        if (entry.flowNodes.length === 0) return;
        const ids = entry.flowNodes.map((n) => n.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('has flow edges referencing valid node IDs', async () => {
        const entry = await loadEntry(slug, entryType);
        const nodeIds = new Set(entry.flowNodes.map((n) => n.id));
        for (const edge of entry.flowEdges) {
          expect(nodeIds.has(edge.source)).toBe(true);
          expect(nodeIds.has(edge.target)).toBe(true);
        }
      });

      if (entryType === 'standard') {
        it('has an eipNumber', async () => {
          const entry = (await loadEntry(slug, entryType)) as StandardEntry;
          expect(entry.eipNumber).toBeGreaterThan(0);
        });
      }
    },
  );
});
