import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounceValue } from 'usehooks-ts';
import { ensureSearchIndex, isSearchIndexReady, searchSync, type SearchHit } from './searchClient';

export interface UseSearchReturn {
  /** Current (un-debounced) input value — bind to the search input's `value`. */
  query: string;
  /** Update the query string (bind to the input's `onChange` handler). */
  setQuery: (q: string) => void;
  /** Matched entries, empty when query is blank or the index has no hits. */
  results: SearchHit[];
  /** True while debouncing or while the corpus for the language is loading. */
  isSearching: boolean;
  /** Prefetch the corpus (call on input focus / palette open). */
  warm: () => void;
}

/**
 * Debounced full-text search over the static per-locale corpus.
 * The corpus is fetched lazily (call `warm()` on focus, or just type — the
 * first query awaits the fetch) and refetched when the language changes.
 */
export function useSearch(limit = 12): UseSearchReturn {
  const { i18n } = useTranslation();
  const lng = i18n.resolvedLanguage ?? i18n.language ?? 'en';

  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounceValue(query, 200);
  // Bumped when an index build completes — invalidates the results memo.
  const [indexVersion, setIndexVersion] = useState(0);

  const warm = useCallback(() => {
    if (isSearchIndexReady(lng)) return;
    void ensureSearchIndex(lng).then(() => setIndexVersion((v) => v + 1));
  }, [lng]);

  // Kick off the corpus fetch when a query arrives before the index exists.
  useEffect(() => {
    if (!debouncedQuery.trim() || isSearchIndexReady(lng)) return;
    let cancelled = false;
    void ensureSearchIndex(lng).then(() => {
      if (!cancelled) setIndexVersion((v) => v + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, lng]);

  const results = useMemo<SearchHit[]>(() => {
    // indexVersion re-runs this memo once an index finishes building.
    void indexVersion;
    const q = debouncedQuery.trim();
    if (!q) return [];
    return searchSync(lng, q, limit);
  }, [debouncedQuery, lng, limit, indexVersion]);

  const waitingForIndex = debouncedQuery.trim() !== '' && !isSearchIndexReady(lng);

  return {
    query,
    setQuery,
    results,
    isSearching: waitingForIndex || query !== debouncedQuery,
    warm,
  };
}
