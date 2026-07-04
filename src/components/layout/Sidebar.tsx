import { useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allMeta } from '@/data/allMeta';
import { CATEGORY_ORDER, CATEGORY_LABELS, SITE_NAME } from '@/utils/constants';
import { useSidebarGroupsStore } from '@/stores/useSidebarGroupsStore';
import { cn } from '@/utils/cn';
import SidebarSearch from './SidebarSearch';
import SidebarMenuItem from './SidebarMenuItem';

/** Above this many entries a category shows the first 10 + a "view all" link. */
const OVERFLOW_THRESHOLD = 12;
const OVERFLOW_VISIBLE = 10;

interface SidebarProps {
  /** Callback fired after user navigates (used by MobileNav to close itself). */
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { t } = useTranslation('common');
  const { closedCategories, toggleCategory } = useSidebarGroupsStore();

  // Group items by category, sorted by sortOrder within each group
  const grouped = useMemo(() => {
    const map = new Map<string, typeof allMeta>();

    for (const category of CATEGORY_ORDER) {
      const items = allMeta
        .filter((m) => m.category === category)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      if (items.length > 0) {
        map.set(category, items);
      }
    }

    return map;
  }, []);

  return (
    <nav
      aria-label="Smart Contract Handbook navigation"
      className="flex flex-col h-full w-full overflow-hidden"
    >
      {/* ── Logo / brand header ─────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2.5 px-4 py-4 border-b border-[var(--erc-color-border)]">
        <img src="/logo.svg" alt="" className="w-7 h-auto shrink-0" aria-hidden="true" />
        <Link
          to="/"
          onClick={onNavigate}
          // Product name: deliberately kept in English in every locale
          // (shared SITE_NAME constant); translate="no" shields it from
          // browser auto-translation.
          translate="no"
          className={cn(
            'text-base font-semibold leading-tight',
            'text-[var(--erc-color-text-primary)]',
            'hover:text-[var(--erc-color-accent)] transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] rounded',
          )}
        >
          {SITE_NAME}
        </Link>
      </div>

      {/* ── Playground + Catalog links ─────────────────────────── */}
      <div className="shrink-0 px-2 pt-2 space-y-1">
        <NavLink
          to="/playground"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all',
              'border',
              isActive
                ? 'bg-[var(--erc-color-accent)]/10 border-[var(--erc-color-accent)]/30 text-[var(--erc-color-accent)]'
                : 'border-[var(--erc-color-border)] text-[var(--erc-color-text-secondary)] hover:bg-[var(--erc-color-bg-tertiary)] hover:text-[var(--erc-color-text-primary)]',
            )
          }
        >
          {/* Grid/compose icon */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect
              x="1"
              y="1"
              width="5"
              height="5"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <rect
              x="8"
              y="1"
              width="5"
              height="5"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <rect
              x="1"
              y="8"
              width="5"
              height="5"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <path
              d="M10.5 8.5v4M8.5 10.5h4"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
          {t('nav.playground', 'Playground')}
        </NavLink>

        <NavLink
          to="/catalog"
          onClick={onNavigate}
          data-testid="sidebar-catalog-link"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all',
              'border',
              isActive
                ? 'bg-[var(--erc-color-accent)]/10 border-[var(--erc-color-accent)]/30 text-[var(--erc-color-accent)]'
                : 'border-[var(--erc-color-border)] text-[var(--erc-color-text-secondary)] hover:bg-[var(--erc-color-bg-tertiary)] hover:text-[var(--erc-color-text-primary)]',
            )
          }
        >
          {/* Table/list icon */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect
              x="1"
              y="1.5"
              width="12"
              height="11"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <path d="M1 5h12M5.5 5v7.5" stroke="currentColor" strokeWidth="1.25" />
          </svg>
          {t('nav.catalog')}
        </NavLink>
      </div>

      {/* ── Sticky search ───────────────────────────────────────── */}
      <div className="shrink-0 pt-2 pb-1">
        <SidebarSearch onNavigate={onNavigate} />
      </div>

      {/* ── Scrollable category list ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {Array.from(grouped.entries()).map(([category, items]) => {
          const labelKey = CATEGORY_LABELS[category];
          const label = labelKey ? t(labelKey) : category;
          const isOpen = !closedCategories.includes(category);
          const overflows = items.length > OVERFLOW_THRESHOLD;
          const visibleItems = overflows ? items.slice(0, OVERFLOW_VISIBLE) : items;
          const listId = `sidebar-group-${category}`;

          return (
            <section key={category} aria-label={label}>
              {/* Category heading — collapsible */}
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                aria-expanded={isOpen}
                aria-controls={listId}
                className={cn(
                  'group flex w-full items-center gap-1.5 px-2 pt-4 pb-1 rounded',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)]',
                )}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={cn(
                    'shrink-0 text-[var(--erc-color-text-muted)] transition-transform duration-150',
                    isOpen ? 'rotate-90' : 'rotate-0',
                  )}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--erc-color-text-muted)] group-hover:text-[var(--erc-color-text-secondary)] transition-colors">
                  {label}
                </span>
                <span
                  className={cn(
                    'ml-auto shrink-0 min-w-[1.25rem] px-1 py-px rounded-full text-center',
                    'text-[10px] font-semibold tabular-nums',
                    'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-muted)]',
                  )}
                >
                  {items.length}
                </span>
              </button>

              {/* Items */}
              {isOpen && (
                <ul id={listId} className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <li key={item.slug}>
                      <SidebarMenuItem item={item} onNavigate={onNavigate} />
                    </li>
                  ))}
                  {overflows && (
                    <li>
                      <Link
                        to={`/catalog?category=${encodeURIComponent(category)}`}
                        onClick={onNavigate}
                        className={cn(
                          'flex items-center w-full px-3 py-2 rounded-lg text-left text-xs font-medium',
                          'text-[var(--erc-color-accent)]',
                          'hover:bg-[var(--erc-color-bg-tertiary)] transition-colors',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus-visible:ring-inset',
                        )}
                      >
                        {t('sidebar.viewAll', { count: items.length })}
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 border-t border-[var(--erc-color-border)]">
        <p className="text-[10px] text-[var(--erc-color-text-muted)]">
          {t('sidebar.footerCounts', {
            standards: allMeta.filter((m) => m.entryType === 'standard').length,
            protocols: allMeta.filter((m) => m.entryType === 'protocol').length,
          })}
        </p>
      </div>
    </nav>
  );
}
