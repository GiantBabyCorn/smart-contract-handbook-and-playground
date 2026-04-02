import { useState, useMemo } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { getSearchIndex } from './searchIndex';
import type { ERCMeta } from '@/data/types';

export interface UseMiniSearchReturn {
  /** Current (un-debounced) input value — bind to the search input's `value`. */
  query: string;
  /** Update the query string (bind to the input's `onChange` handler). */
  setQuery: (q: string) => void;
  /** Matched entries, empty when query is blank or has no results. */
  results: ERCMeta[];
  /** True while the debounce timer is running (query ≠ debounced query). */
  isSearching: boolean;
}

/**
 * Hook that wraps the MiniSearch index with a 300 ms debounce so that the
 * search is not re-computed on every keystroke.
 *
 * Results are memoised on the debounced query string, so components that call
 * this hook will only re-render when the debounce settles.
 */
export function useMiniSearch(): UseMiniSearchReturn {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounceValue(query, 300);

  const results = useMemo<ERCMeta[]>(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return [];

    try {
      const index = getSearchIndex();
      // MiniSearch returns SearchResult objects that include all storeFields
      // plus `id`, `score`, and `match`.  We cast to ERCMeta because we store
      // every ERCMeta field needed by the UI — the extra MiniSearch fields are
      // harmless extras on the runtime object.
      return index.search(trimmed) as unknown as ERCMeta[];
    } catch {
      // Gracefully degrade if the index is in a bad state.
      return [];
    }
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    results,
    isSearching: query !== debouncedQuery,
  };
}
