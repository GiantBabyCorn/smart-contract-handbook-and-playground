import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { allMeta } from '@/data/allMeta';
import { CATEGORY_ORDER, CATEGORY_LABELS } from '@/utils/constants';
import { cn } from '@/utils/cn';

interface ContractPaletteProps {
  addedSlugs: string[];
  onAdd: (slug: string) => void;
  onRemove: (slug: string) => void;
}

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  token: 'bg-[var(--erc-color-category-token)]/15 text-[var(--erc-color-category-token)]',
  nft: 'bg-[var(--erc-color-category-nft)]/15 text-[var(--erc-color-category-nft)]',
  proxy: 'bg-[var(--erc-color-category-proxy)]/15 text-[var(--erc-color-category-proxy)]',
  defi: 'bg-[var(--erc-color-category-defi)]/15 text-[var(--erc-color-category-defi)]',
  account: 'bg-[var(--erc-color-category-account)]/15 text-[var(--erc-color-category-account)]',
};

export default function ContractPalette({
  addedSlugs,
  onAdd,
  onRemove,
}: ContractPaletteProps) {
  const { t } = useTranslation('common');
  const [search, setSearch] = useState('');

  const grouped = useMemo(() => {
    const query = search.toLowerCase().trim();
    const map = new Map<string, typeof allMeta>();

    for (const category of CATEGORY_ORDER) {
      const items = allMeta
        .filter(
          (m) =>
            m.category === category &&
            (!query || m.name.toLowerCase().includes(query) || m.slug.includes(query)),
        )
        .sort((a, b) => a.sortOrder - b.sortOrder);
      if (items.length > 0) {
        map.set(category, items);
      }
    }

    return map;
  }, [search]);

  const handleAdd = useCallback(
    (slug: string) => {
      onAdd(slug);
    },
    [onAdd],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="px-3 py-2.5 border-b border-[var(--erc-color-border)]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('playground.searchContracts', 'Search contracts...')}
          className={cn(
            'w-full rounded-md text-xs px-2.5 py-1.5',
            'bg-[var(--erc-color-bg-primary)] border border-[var(--erc-color-border)]',
            'text-[var(--erc-color-text-primary)] placeholder:text-[var(--erc-color-text-muted)]',
            'outline-none focus:border-[var(--erc-color-accent)] focus:ring-1 focus:ring-[var(--erc-color-accent)]',
          )}
        />
      </div>

      {/* Category groups */}
      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-3">
        {[...grouped.entries()].map(([category, items]) => (
          <div key={category}>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--erc-color-text-muted)] px-1">
              {t(CATEGORY_LABELS[category] ?? category)}
            </span>
            <div className="mt-1 flex flex-col gap-0.5">
              {items.map((item) => {
                const isAdded = addedSlugs.includes(item.slug);
                return (
                  <div
                    key={item.slug}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-lg',
                      'border border-transparent',
                      isAdded
                        ? 'bg-[var(--erc-color-accent)]/5 border-[var(--erc-color-accent)]/20'
                        : 'hover:bg-[var(--erc-color-bg-tertiary)]',
                    )}
                  >
                    <span
                      className={cn(
                        'shrink-0 text-[9px] font-semibold px-1 py-0.5 rounded uppercase tracking-wide',
                        CATEGORY_BADGE_COLORS[item.category] ??
                          'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-muted)]',
                      )}
                    >
                      {item.entryType === 'standard' ? 'ERC' : 'DeFi'}
                    </span>
                    <span className="flex-1 text-xs text-[var(--erc-color-text-primary)] truncate">
                      {item.name}
                    </span>
                    {isAdded ? (
                      <button
                        type="button"
                        onClick={() => onRemove(item.slug)}
                        className="shrink-0 text-[10px] px-1.5 py-0.5 rounded text-[var(--erc-color-text-muted)] hover:text-red-400 border border-[var(--erc-color-border)] transition-colors"
                      >
                        {t('playground.remove', 'Remove')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAdd(item.slug)}
                        className="shrink-0 text-[10px] px-1.5 py-0.5 rounded text-[var(--erc-color-accent)] hover:bg-[var(--erc-color-accent)]/10 border border-[var(--erc-color-accent)]/30 transition-colors"
                      >
                        {t('playground.addContract', 'Add')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
