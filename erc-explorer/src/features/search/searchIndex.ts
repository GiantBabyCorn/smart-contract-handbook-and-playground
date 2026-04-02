import MiniSearch from 'minisearch';
import type { ERCMeta } from '@/data/types';
import { allMeta } from '@/data/allMeta';

/**
 * Module-level singleton so the index is built only once per session and
 * shared across all callers (useMiniSearch, SidebarSearch, etc.).
 */
let searchInstance: MiniSearch<ERCMeta> | null = null;

/**
 * Returns the lazily-initialised MiniSearch index for the ERC/protocol catalogue.
 *
 * Indexed fields:
 *   - `name`             – boosted 2× so "ERC-20" surfaces before description matches
 *   - `slug`             – allows direct slug-based lookups
 *   - `shortDescription` – i18n keys are stored here; callers should also index
 *                          resolved translations if needed (see note below)
 *
 * Stored fields include everything needed to render a search result row without
 * touching the full entry data file.
 *
 * Note: `shortDescription` values in allMeta are i18n keys (e.g. "erc20.short").
 * If translated strings need to be searchable, callers should pass a translated
 * copy of allMeta to `addAll()` after the first call returns. For now the slug
 * and name fields provide sufficient quality for MVP search.
 */
export function getSearchIndex(): MiniSearch<ERCMeta> {
  if (searchInstance !== null) return searchInstance;

  searchInstance = new MiniSearch<ERCMeta>({
    idField: 'slug',
    fields: ['name', 'slug', 'shortDescription'],
    storeFields: ['slug', 'name', 'shortDescription', 'category', 'entryType'],
    searchOptions: {
      boost: { name: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
    // Tokeniser: split on whitespace, hyphens, and underscores so that
    // "ERC-20", "erc20", and "erc 20" all produce the same tokens.
    tokenize: (text) =>
      text
        .toLowerCase()
        .split(/[\s\-_]+/)
        .filter(Boolean),
    processTerm: (term) => term.toLowerCase(),
  });

  searchInstance.addAll(allMeta);
  return searchInstance;
}

/**
 * Replace the current index contents with a new collection.
 * Call this when the catalogue is updated at runtime (e.g. after lazy-loading
 * additional protocol entries) or when translated descriptions become available.
 */
export function rebuildSearchIndex(entries: ERCMeta[]): MiniSearch<ERCMeta> {
  searchInstance = null; // force re-creation with fresh options
  const index = getSearchIndex(); // creates instance
  // addAll was already called in getSearchIndex via allMeta; remove those
  // then add the caller's entries if they differ.
  if (entries !== allMeta) {
    index.removeAll();
    index.addAll(entries);
  }
  return index;
}
