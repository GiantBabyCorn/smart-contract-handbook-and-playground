import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allMeta } from '@/data/allMeta';
import { CATEGORY_ORDER, CATEGORY_LABELS } from '@/utils/constants';
import { cn } from '@/utils/cn';
import SidebarSearch from './SidebarSearch';
import SidebarMenuItem from './SidebarMenuItem';

interface SidebarProps {
  /** Callback fired after user navigates (used by MobileNav to close itself). */
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { t } = useTranslation('common');

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
      aria-label="ERC Explorer navigation"
      className="flex flex-col h-full w-full overflow-hidden"
    >
      {/* ── Logo / brand header ─────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2.5 px-4 py-4 border-b border-[var(--erc-color-border)]">
        <img
          src="/logo.svg"
          alt=""
          className="w-7 h-auto shrink-0"
          aria-hidden="true"
        />
        <Link
          to="/"
          onClick={onNavigate}
          className={cn(
            'text-base font-semibold leading-tight',
            'text-[var(--erc-color-text-primary)]',
            'hover:text-[var(--erc-color-accent)] transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] rounded',
          )}
        >
          ERC Explorer
        </Link>
      </div>

      {/* ── Sticky search ───────────────────────────────────────── */}
      <div className="shrink-0 pt-2 pb-1">
        <SidebarSearch onNavigate={onNavigate} />
      </div>

      {/* ── Scrollable category list ─────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-2 pb-4"
        role="tree"
        aria-label="Standards and protocols"
      >
        {Array.from(grouped.entries()).map(([category, items]) => {
          const labelKey = CATEGORY_LABELS[category];
          const label = labelKey ? t(labelKey) : category;

          return (
            <div key={category} role="group" aria-label={label}>
              {/* Category heading */}
              <div className="px-2 pt-4 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--erc-color-text-muted)]">
                  {label}
                </span>
              </div>

              {/* Items */}
              <ul role="none" className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.slug} role="treeitem">
                    <SidebarMenuItem item={item} onNavigate={onNavigate} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 border-t border-[var(--erc-color-border)]">
        <p className="text-[10px] text-[var(--erc-color-text-muted)]">
          {allMeta.filter((m) => m.entryType === 'standard').length} standards
          &nbsp;·&nbsp;
          {allMeta.filter((m) => m.entryType === 'protocol').length} protocols
        </p>
      </div>
    </nav>
  );
}
