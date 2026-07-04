import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allMeta } from '@/data/allMeta';
import { cn } from '@/utils/cn';
import { useSearch } from './useSearch';
import { useSearchModalStore } from './useSearchModalStore';
import { getRecentEntries, addRecentEntry } from './recentEntries';

interface PaletteRow {
  slug: string;
  name: string;
  category: string;
  entryType: 'standard' | 'protocol';
  short: string;
}

/**
 * Global Ctrl-K / Cmd-K search palette (plan.md 8.0 search v2).
 * Portal dialog with focus trap, arrow-key navigation, Enter-to-navigate and
 * a recent-entries list (localStorage) when the query is empty.
 */
export default function CommandPalette() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { isOpen, close, toggle } = useSearchModalStore();
  const { query, setQuery, results, isSearching, warm } = useSearch(10);

  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Recomputed on every open (isOpen flips false → true); openEntry closes
  // the palette, so additions are always picked up by the next open.
  const recents = useMemo(() => (isOpen ? getRecentEntries() : []), [isOpen]);

  // ── Global hotkey (active even while closed) ──────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  // ── Open/close side effects ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    warm();
    document.body.style.overflow = 'hidden';
    // Focus after the portal content is in the DOM.
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = '';
      restoreFocusRef.current?.focus?.();
    };
  }, [isOpen, warm]);

  const handleClose = useCallback(() => {
    close();
    setQuery('');
    setActiveIndex(0);
  }, [close, setQuery]);

  // ── Rows: search results, or recents when the query is empty ─────────
  const trimmed = query.trim();
  const rows = useMemo<PaletteRow[]>(() => {
    if (trimmed) {
      return results.map((r) => ({
        slug: r.slug,
        name: r.name,
        category: r.category,
        entryType: r.entryType,
        short: r.short,
      }));
    }
    return recents
      .map((slug) => allMeta.find((m) => m.slug === slug))
      .filter((m) => m !== undefined)
      .map((m) => ({
        slug: m.slug,
        name: m.name,
        category: m.category,
        entryType: m.entryType,
        short: '',
      }));
  }, [trimmed, results, recents]);

  // Async result updates can shrink the list — clamp instead of resetting in
  // an effect (typing resets the index via the input's onChange handler).
  const active = rows.length === 0 ? 0 : Math.min(activeIndex, rows.length - 1);

  const openEntry = useCallback(
    (slug: string) => {
      addRecentEntry(slug);
      handleClose();
      navigate(`/${slug}`);
    },
    [navigate, handleClose],
  );

  // ── Keyboard handling inside the dialog ───────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rows.length > 0) setActiveIndex((active + 1) % rows.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rows.length > 0) setActiveIndex((active - 1 + rows.length) % rows.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const row = rows[active];
      if (row) openEntry(row.slug);
    } else if (e.key === 'Tab') {
      // Focus trap: the input is the palette's only tab stop.
      e.preventDefault();
    }
  };

  if (!isOpen) return null;

  const activeId = rows[active] ? `palette-opt-${rows[active].slug}` : undefined;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center px-4 pt-[12vh]"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('search.button')}
        data-testid="command-palette"
        className={cn(
          'relative w-full max-w-xl overflow-hidden rounded-xl',
          'border border-[var(--erc-color-border)]',
          'bg-[var(--erc-color-bg-secondary)] shadow-2xl shadow-black/40',
        )}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 border-b border-[var(--erc-color-border)]">
          <span className="shrink-0 text-[var(--erc-color-text-muted)]" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={rows.length > 0}
            aria-controls="palette-results"
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label={t('search.placeholder')}
            placeholder={t('search.placeholder')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            autoComplete="off"
            spellCheck={false}
            className={cn(
              'flex-1 py-3.5 bg-transparent text-sm',
              'text-[var(--erc-color-text-primary)]',
              'placeholder:text-[var(--erc-color-text-muted)]',
              'focus:outline-none',
            )}
          />
          <kbd
            className={cn(
              'shrink-0 px-1.5 py-0.5 rounded border border-[var(--erc-color-border)]',
              'text-[10px] font-medium text-[var(--erc-color-text-muted)]',
            )}
          >
            esc
          </kbd>
        </div>

        {/* Results / recents */}
        <div className="max-h-[50vh] overflow-y-auto">
          {rows.length === 0 ? (
            <p
              className="px-4 py-6 text-sm text-center text-[var(--erc-color-text-muted)]"
              role="status"
            >
              {trimmed
                ? isSearching
                  ? t('search.loading')
                  : t('search.noResults')
                : t('search.recent')}
            </p>
          ) : (
            <>
              {!trimmed && (
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--erc-color-text-muted)]">
                  {t('search.recent')}
                </p>
              )}
              <ul
                id="palette-results"
                role="listbox"
                aria-label={t('search.button')}
                className="py-1.5"
              >
                {rows.map((row, index) => (
                  <li key={row.slug} role="presentation">
                    <div
                      id={`palette-opt-${row.slug}`}
                      role="option"
                      aria-selected={index === active}
                      data-slug={row.slug}
                      onClick={() => openEntry(row.slug)}
                      onMouseMove={() => setActiveIndex(index)}
                      className={cn(
                        'flex items-center gap-3 mx-1.5 px-2.5 py-2.5 rounded-lg cursor-pointer',
                        'transition-colors duration-100',
                        index === active
                          ? 'bg-[var(--erc-color-accent)]/10 text-[var(--erc-color-text-primary)]'
                          : 'text-[var(--erc-color-text-secondary)]',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'shrink-0 w-1.5 h-1.5 rounded-full',
                          row.entryType === 'standard'
                            ? 'bg-[var(--erc-color-accent)]'
                            : 'bg-[var(--erc-color-category-defi)]',
                        )}
                      />
                      <span className="flex-1 min-w-0 flex flex-col">
                        <span className="text-sm font-medium leading-snug truncate">
                          {row.name}
                        </span>
                        {row.short && (
                          <span className="text-[11px] leading-tight text-[var(--erc-color-text-muted)] truncate">
                            {row.short}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-[var(--erc-color-text-muted)] capitalize">
                        {row.category}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Footer hints */}
        <div
          aria-hidden="true"
          className={cn(
            'flex items-center gap-4 px-4 py-2 border-t border-[var(--erc-color-border)]',
            'text-[10px] text-[var(--erc-color-text-muted)]',
          )}
        >
          <span>↑↓</span>
          <span>↵</span>
          <span>esc</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
