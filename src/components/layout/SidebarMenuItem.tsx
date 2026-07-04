import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import type { ERCMeta } from '@/data/types';
import { prefetchEntry } from '@/data/registry';

interface SidebarMenuItemProps {
  item: ERCMeta;
  /** If provided, overrides the default entry type badge. */
  onNavigate?: () => void;
}

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  token: 'bg-[var(--erc-color-category-token)]/15 text-[var(--erc-color-category-token)]',
  nft: 'bg-[var(--erc-color-category-nft)]/15 text-[var(--erc-color-category-nft)]',
  proxy: 'bg-[var(--erc-color-category-proxy)]/15 text-[var(--erc-color-category-proxy)]',
  defi: 'bg-[var(--erc-color-category-defi)]/15 text-[var(--erc-color-category-defi)]',
  account: 'bg-[var(--erc-color-category-account)]/15 text-[var(--erc-color-category-account)]',
  utility: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)]',
  identity: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)]',
  oracle: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)]',
  governance: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)]',
  'cross-chain': 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)]',
  rwa: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)]',
};

export default function SidebarMenuItem({ item, onNavigate }: SidebarMenuItemProps) {
  // Short descriptions come from the resident generated 'catalog' namespace
  // (flat "<slug>.short" keys — scripts/gen_catalog_ns.py). Reading the
  // per-entry namespace here would trigger one JSON request per menu item.
  const { t } = useTranslation('catalog');
  const shortDesc = t(`${item.slug}.short`, { defaultValue: '' });

  return (
    <NavLink
      to={`/${item.slug}`}
      onClick={onNavigate}
      onMouseEnter={() => prefetchEntry(item.slug)}
      onFocus={() => prefetchEntry(item.slug)}
      aria-label={`${item.name}${shortDesc ? ` — ${shortDesc}` : ''}`}
      title={shortDesc || item.name}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left',
          'transition-all duration-150 outline-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus-visible:ring-inset',
          isActive
            ? 'bg-[var(--erc-color-accent)]/10 border-l-2 border-[var(--erc-color-accent)] pl-[10px] text-[var(--erc-color-text-primary)]'
            : 'border-l-2 border-transparent text-[var(--erc-color-text-secondary)] hover:bg-[var(--erc-color-bg-tertiary)] hover:text-[var(--erc-color-text-primary)]',
        )
      }
    >
      {/* Entry type indicator dot */}
      <span
        aria-hidden="true"
        className={cn(
          'shrink-0 w-1.5 h-1.5 rounded-full mt-1',
          item.entryType === 'standard'
            ? 'bg-[var(--erc-color-accent)]'
            : 'bg-[var(--erc-color-category-defi)]',
        )}
      />

      {/* Name + short description */}
      <span className="flex-1 min-w-0 flex flex-col">
        <span className="text-sm font-medium leading-snug truncate">{item.name}</span>
        {shortDesc && (
          <span className="text-[11px] leading-tight text-[var(--erc-color-text-muted)] truncate">
            {shortDesc}
          </span>
        )}
      </span>

      {/* Optional badge for entryType */}
      <span
        className={cn(
          'hidden group-hover:inline-flex shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide',
          CATEGORY_BADGE_COLORS[item.category] ??
            'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-muted)]',
        )}
        aria-hidden="true"
      >
        {item.entryType === 'standard' ? 'ERC' : 'protocol'}
      </span>
    </NavLink>
  );
}
