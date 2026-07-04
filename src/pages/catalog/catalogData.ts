import { allMeta } from '@/data/allMeta';
import catalogJson from '@/data/catalog.json';
import type { Category, EntryType, EipStatus, EntryTier } from '@/data/types';

/** Shape of a src/data/catalog.json row (see scripts/ingest_ercs.py). */
interface CatalogJsonRow {
  eip: number | null;
  slug: string;
  title: string;
  status: string | null;
  published: boolean;
  tier?: string | null;
  unofficial?: boolean;
}

/** One /catalog table row. Only PUBLISHED entries exist here: rows derive from
 *  the generated allMeta.ts (published-only), enriched with the EIP number and
 *  status/tier from the catalog.json lookup map. */
export interface CatalogRow {
  slug: string;
  name: string;
  eip: number | null;
  category: Category;
  entryType: EntryType;
  status: EipStatus | null;
  tier: EntryTier | null;
  unofficial: boolean;
}

const EIP_STATUSES: readonly EipStatus[] = [
  'Final',
  'Last Call',
  'Review',
  'Draft',
  'Stagnant',
  'Withdrawn',
];

/** Statuses offered in the filter dropdown (display order). */
export const STATUS_OPTIONS: readonly EipStatus[] = EIP_STATUSES;

function toEipStatus(value: string | null | undefined): EipStatus | null {
  return EIP_STATUSES.includes(value as EipStatus) ? (value as EipStatus) : null;
}

const catalogBySlug = new Map<string, CatalogJsonRow>(
  (catalogJson as unknown as CatalogJsonRow[]).map((row) => [row.slug, row]),
);

/** All published rows, unsorted/unfiltered (module-level: computed once). */
export const catalogRows: CatalogRow[] = allMeta.map((meta) => {
  const catalog = catalogBySlug.get(meta.slug);
  return {
    slug: meta.slug,
    name: meta.name,
    eip: catalog?.eip ?? null,
    category: meta.category,
    entryType: meta.entryType,
    status: meta.eipStatus ?? toEipStatus(catalog?.status),
    tier: meta.tier ?? (catalog?.tier === 'A' || catalog?.tier === 'B' ? catalog.tier : null),
    unofficial: meta.unofficial ?? catalog?.unofficial ?? false,
  };
});

export type SortKey = 'eip' | 'name' | 'category' | 'status' | 'tier';
export type SortDir = 'asc' | 'desc';

const STATUS_RANK = new Map<string, number>(EIP_STATUSES.map((s, i) => [s, i]));

function compare(a: CatalogRow, b: CatalogRow, key: SortKey): number {
  switch (key) {
    case 'eip': {
      // Protocols (no EIP) sort after all standards.
      const av = a.eip ?? Number.POSITIVE_INFINITY;
      const bv = b.eip ?? Number.POSITIVE_INFINITY;
      return av - bv;
    }
    case 'name':
      return a.name.localeCompare(b.name);
    case 'category':
      return a.category.localeCompare(b.category);
    case 'status': {
      const av = a.status ? (STATUS_RANK.get(a.status) ?? 99) : 100;
      const bv = b.status ? (STATUS_RANK.get(b.status) ?? 99) : 100;
      return av - bv;
    }
    case 'tier': {
      const av = a.tier ?? 'Z';
      const bv = b.tier ?? 'Z';
      return av < bv ? -1 : av > bv ? 1 : 0;
    }
  }
}

export function sortRows(rows: CatalogRow[], key: SortKey, dir: SortDir): CatalogRow[] {
  const sign = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const primary = compare(a, b, key);
    if (primary !== 0) return sign * primary;
    // Stable, locale-independent tiebreak.
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });
}

export interface CatalogFilters {
  q: string;
  category: string;
  status: string;
  type: string;
}

export function filterRows(rows: CatalogRow[], filters: CatalogFilters): CatalogRow[] {
  const q = filters.q.trim().toLowerCase();
  // "erc 20" / "erc-20" / "eip20" / "#20" all match EIP 20.
  const qNumber = q.replace(/^(erc|eip)[\s-]*|^#/, '');

  return rows.filter((row) => {
    if (filters.category && row.category !== filters.category) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.type && row.entryType !== filters.type) return false;
    if (!q) return true;

    if (row.name.toLowerCase().includes(q)) return true;
    if (row.slug.toLowerCase().includes(q)) return true;
    if (row.eip !== null && qNumber && String(row.eip).startsWith(qNumber)) return true;
    return false;
  });
}
