import { useState, useMemo, useRef, useEffect } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import MiniSearch from 'minisearch';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allMeta } from '@/data/allMeta';
import { cn } from '@/utils/cn';
import type { ERCMeta } from '@/data/types';

// ---------------------------------------------------------------------------
// Build MiniSearch index once (module-level singleton)
// ---------------------------------------------------------------------------

const miniSearch = new MiniSearch<ERCMeta>({
  idField: 'slug',
  fields: ['name', 'slug'],
  storeFields: ['slug', 'name', 'category', 'entryType'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
    boost: { name: 2 },
  },
});

miniSearch.addAll(allMeta);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SidebarSearchProps {
  /** Called when user selects a result (e.g. close mobile nav) */
  onNavigate?: () => void;
}

export default function SidebarSearch({ onNavigate }: SidebarSearchProps) {
  const { t } = useTranslation('common');
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounceValue(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo<ERCMeta[]>(() => {
    const q = debouncedQuery.trim();
    if (!q) return [];
    const hits = miniSearch.search(q);
    // Map ids back to full ERCMeta objects
    return hits
      .slice(0, 10)
      .map((h) => allMeta.find((m) => m.slug === h.id)!)
      .filter(Boolean);
  }, [debouncedQuery]);

  // Show dropdown when there are results or a non-empty query with no results
  useEffect(() => {
    setIsOpen(debouncedQuery.trim().length > 0);
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const firstItem = listRef.current?.querySelector<HTMLAnchorElement>('a[role="option"]');
      firstItem?.focus();
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const items = listRef.current?.querySelectorAll<HTMLAnchorElement>('a[role="option"]');
    if (!items) return;
    const arr = Array.from(items);
    const focused = document.activeElement as HTMLElement;
    const idx = arr.indexOf(focused as HTMLAnchorElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      arr[(idx + 1) % arr.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx <= 0) {
        inputRef.current?.focus();
      } else {
        arr[idx - 1]?.focus();
      }
    } else if (e.key === 'Escape') {
      handleClear();
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative px-3 py-2">
      {/* Search input */}
      <div className="relative flex items-center">
        <span
          className="absolute left-3 text-[var(--erc-color-text-muted)] pointer-events-none"
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label={t('sidebar.search')}
          aria-expanded={isOpen}
          aria-controls="sidebar-search-results"
          aria-autocomplete="list"
          placeholder={t('sidebar.search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            'w-full rounded-lg text-sm',
            'pl-8 pr-8 py-2',
            'bg-[var(--erc-color-bg-tertiary)]',
            'border border-[var(--erc-color-border)]',
            'text-[var(--erc-color-text-primary)]',
            'placeholder:text-[var(--erc-color-text-muted)]',
            'focus:outline-none focus:border-[var(--erc-color-accent)]',
            'focus:ring-1 focus:ring-[var(--erc-color-accent)]',
            'transition-colors duration-150',
            // Hide browser-native clear button on Safari/Chrome
            '[&::-webkit-search-cancel-button]:hidden',
          )}
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2.5 p-0.5 rounded text-[var(--erc-color-text-muted)] hover:text-[var(--erc-color-text-primary)] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-3 right-3 top-full mt-1 z-50',
            'rounded-lg border border-[var(--erc-color-border)]',
            'bg-[var(--erc-color-bg-secondary)]',
            'shadow-xl shadow-black/30',
            'overflow-hidden',
          )}
        >
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--erc-color-text-muted)]" role="status">
              {t('sidebar.noResults')}
            </p>
          ) : (
            <ul
              ref={listRef}
              id="sidebar-search-results"
              role="listbox"
              aria-label="Search results"
              onKeyDown={handleListKeyDown}
              className="py-1 max-h-72 overflow-y-auto"
            >
              {results.map((item) => (
                <li key={item.slug} role="presentation">
                  <NavLink
                    to={`/${item.slug}`}
                    role="option"
                    aria-selected={false}
                    onClick={() => {
                      setQuery('');
                      setIsOpen(false);
                      onNavigate?.();
                    }}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 w-full px-4 py-2.5',
                        'text-sm transition-colors duration-100',
                        'focus:outline-none',
                        isActive
                          ? 'bg-[var(--erc-color-accent)]/10 text-[var(--erc-color-text-primary)]'
                          : 'text-[var(--erc-color-text-secondary)] hover:bg-[var(--erc-color-bg-tertiary)] hover:text-[var(--erc-color-text-primary)] focus:bg-[var(--erc-color-bg-tertiary)]',
                      )
                    }
                  >
                    <span
                      className={cn(
                        'shrink-0 w-1.5 h-1.5 rounded-full',
                        item.entryType === 'standard'
                          ? 'bg-[var(--erc-color-accent)]'
                          : 'bg-[var(--erc-color-category-defi)]',
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1 font-medium truncate">{item.name}</span>
                    <span className="shrink-0 text-xs text-[var(--erc-color-text-muted)] capitalize">
                      {item.category}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
