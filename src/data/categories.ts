import type { Category } from './types';

/**
 * Category registry — the single source of truth for entry categories
 * (plan.md §B1).
 *
 * Everything category-shaped derives from the ordered `CATEGORIES` array
 * below: sidebar/catalog ordering, i18n label keys, theme colour variables
 * and badge styling. Adding a category means adding one row here, the two
 * `--erc-color-category-*` variables in `src/styles/themes.css` (dark +
 * light) and the `sidebar.categories.*` label in all six locales.
 *
 * Kept in sync manually with:
 * - `Category` union in `src/data/types.ts`
 * - `VALID_CATEGORIES` in `scripts/scaffold_entry.py` (Python cannot import TS)
 */
export interface CategoryDef {
  /** Stable id used in entry data files and URLs (`?category=`). */
  id: Category;
  /** i18n key in the `common` namespace. */
  labelKey: string;
  /** CSS custom-property reference for the category hue. */
  color: string;
  /**
   * Badge styling for detail/catalog surfaces. Kept as literal Tailwind
   * class strings (not composed at runtime) so the Tailwind scanner sees
   * and generates them.
   */
  badgeClass: string;
}

/** Ordered registry — array order is the canonical display order (sidebar, catalog filters). */
export const CATEGORIES: readonly CategoryDef[] = [
  {
    id: 'token',
    labelKey: 'sidebar.categories.token',
    color: 'var(--erc-color-category-token)',
    badgeClass:
      'bg-[var(--erc-color-category-token)]/15 text-[var(--erc-color-category-token)] border-[var(--erc-color-category-token)]/30',
  },
  {
    id: 'nft',
    labelKey: 'sidebar.categories.nft',
    color: 'var(--erc-color-category-nft)',
    badgeClass:
      'bg-[var(--erc-color-category-nft)]/15 text-[var(--erc-color-category-nft)] border-[var(--erc-color-category-nft)]/30',
  },
  {
    id: 'proxy',
    labelKey: 'sidebar.categories.proxy',
    color: 'var(--erc-color-category-proxy)',
    badgeClass:
      'bg-[var(--erc-color-category-proxy)]/15 text-[var(--erc-color-category-proxy)] border-[var(--erc-color-category-proxy)]/30',
  },
  {
    id: 'account',
    labelKey: 'sidebar.categories.account',
    color: 'var(--erc-color-category-account)',
    badgeClass:
      'bg-[var(--erc-color-category-account)]/15 text-[var(--erc-color-category-account)] border-[var(--erc-color-category-account)]/30',
  },
  {
    id: 'identity',
    labelKey: 'sidebar.categories.identity',
    color: 'var(--erc-color-category-identity)',
    badgeClass:
      'bg-[var(--erc-color-category-identity)]/15 text-[var(--erc-color-category-identity)] border-[var(--erc-color-category-identity)]/30',
  },
  {
    id: 'utility',
    labelKey: 'sidebar.categories.utility',
    color: 'var(--erc-color-category-utility)',
    badgeClass:
      'bg-[var(--erc-color-category-utility)]/15 text-[var(--erc-color-category-utility)] border-[var(--erc-color-category-utility)]/30',
  },
  {
    id: 'defi',
    labelKey: 'sidebar.categories.defi',
    color: 'var(--erc-color-category-defi)',
    badgeClass:
      'bg-[var(--erc-color-category-defi)]/15 text-[var(--erc-color-category-defi)] border-[var(--erc-color-category-defi)]/30',
  },
  {
    id: 'oracle',
    labelKey: 'sidebar.categories.oracle',
    color: 'var(--erc-color-category-oracle)',
    badgeClass:
      'bg-[var(--erc-color-category-oracle)]/15 text-[var(--erc-color-category-oracle)] border-[var(--erc-color-category-oracle)]/30',
  },
  {
    id: 'governance',
    labelKey: 'sidebar.categories.governance',
    color: 'var(--erc-color-category-governance)',
    badgeClass:
      'bg-[var(--erc-color-category-governance)]/15 text-[var(--erc-color-category-governance)] border-[var(--erc-color-category-governance)]/30',
  },
  {
    id: 'cross-chain',
    labelKey: 'sidebar.categories.crossChain',
    color: 'var(--erc-color-category-cross-chain)',
    badgeClass:
      'bg-[var(--erc-color-category-cross-chain)]/15 text-[var(--erc-color-category-cross-chain)] border-[var(--erc-color-category-cross-chain)]/30',
  },
  {
    id: 'rwa',
    labelKey: 'sidebar.categories.rwa',
    color: 'var(--erc-color-category-rwa)',
    badgeClass:
      'bg-[var(--erc-color-category-rwa)]/15 text-[var(--erc-color-category-rwa)] border-[var(--erc-color-category-rwa)]/30',
  },
];

// ─── Derived helper maps ─────────────────────────────────────────────────────

/** Canonical display order of category ids. */
export const CATEGORY_ORDER: string[] = CATEGORIES.map((c) => c.id);

/** id → i18n label key (`common` namespace). */
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.labelKey]),
);

/** id → CSS custom-property reference. */
export const CATEGORY_COLOR_VARS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.color]),
);

/** id → badge Tailwind classes. */
export const CATEGORY_BADGE_CLASSES: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.badgeClass]),
);

/** id → position in the canonical order (for sorting). */
export const CATEGORY_SORT_INDEX: Record<string, number> = Object.fromEntries(
  CATEGORIES.map((c, i) => [c.id, i]),
);

/** Colour for a category id, falling back to the accent colour for unknown ids. */
export function getCategoryColor(id: string): string {
  return CATEGORY_COLOR_VARS[id] ?? 'var(--erc-color-accent)';
}
