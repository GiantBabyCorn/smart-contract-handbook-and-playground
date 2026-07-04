import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allMeta } from '@/data/allMeta';
import type { ERCMeta } from '@/data/types';
import { cn } from '@/utils/cn';
import { CATEGORY_LABELS } from '@/utils/constants';

// ---------------------------------------------------------------------------
// Prev/next entry navigation — ordered by sortOrder across published entries
// ---------------------------------------------------------------------------

export interface PrevNextNavProps {
  slug: string;
}

function orderedPublishedMeta(): ERCMeta[] {
  return allMeta
    .filter((m) => m.published !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
}

function NavCard({
  meta,
  direction,
}: {
  meta: ERCMeta;
  direction: 'prev' | 'next';
}) {
  const { t } = useTranslation('common');
  const directionLabel = direction === 'prev' ? t('detailUi.prev') : t('detailUi.next');
  const categoryLabel = t(CATEGORY_LABELS[meta.category] ?? meta.category);

  return (
    <Link
      to={`/${meta.slug}`}
      rel={direction}
      aria-label={`${directionLabel}: ${meta.name} (${categoryLabel})`}
      className={cn(
        'flex-1 flex flex-col gap-1 rounded-xl px-4 py-3 min-w-0',
        'border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)]',
        'hover:border-[var(--erc-color-accent)]/40 hover:bg-[var(--erc-color-bg-tertiary)]',
        'transition-all duration-150 group',
        'focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus:outline-none',
        direction === 'next' && 'items-end text-right',
      )}
    >
      <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-[var(--erc-color-text-muted)]">
        {direction === 'prev' && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        )}
        {directionLabel}
        {direction === 'next' && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        )}
      </span>
      <span className="text-sm font-semibold text-[var(--erc-color-text-primary)] group-hover:text-[var(--erc-color-accent)] transition-colors truncate max-w-full">
        {meta.name}
      </span>
      <span className="text-xs text-[var(--erc-color-text-muted)] truncate max-w-full">
        {categoryLabel}
      </span>
    </Link>
  );
}

export function PrevNextNav({ slug }: PrevNextNavProps) {
  const { t } = useTranslation('common');

  const { prev, next } = useMemo(() => {
    const ordered = orderedPublishedMeta();
    const index = ordered.findIndex((m) => m.slug === slug);
    if (index === -1) return { prev: undefined, next: undefined };
    return {
      prev: index > 0 ? ordered[index - 1] : undefined,
      next: index < ordered.length - 1 ? ordered[index + 1] : undefined,
    };
  }, [slug]);

  if (!prev && !next) return null;

  return (
    <nav
      aria-label={t('detailUi.entryNav')}
      data-testid="prev-next-nav"
      className="flex items-stretch gap-3"
    >
      {prev ? <NavCard meta={prev} direction="prev" /> : <div className="flex-1" aria-hidden="true" />}
      {next ? <NavCard meta={next} direction="next" /> : <div className="flex-1" aria-hidden="true" />}
    </nav>
  );
}
