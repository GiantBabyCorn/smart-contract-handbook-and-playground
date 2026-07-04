import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { allMeta } from '@/data/allMeta';
import type { ERCEntry } from '@/data/types';
import type { EntryTFunction } from '@/i18n/entryText';
import ExternalLink from '@/components/common/ExternalLink';
import StatusBadge from '@/pages/catalog/StatusBadge';
import { cn } from '@/utils/cn';
import { CATEGORY_LABELS } from '@/utils/constants';
import { CATEGORY_BADGE_CLASSES } from '@/data/categories';
import { Section, LazySection } from './shared';

// ---------------------------------------------------------------------------
// "Requires: EIP-…" links — resolve against published entries in allMeta
// ---------------------------------------------------------------------------

function RequiresList({ requires }: { requires: number[] }) {
  return (
    <>
      {requires.map((eip, index) => {
        const slug = `erc${eip}`;
        const published = allMeta.some((m) => m.slug === slug && m.published !== false);
        const label = `EIP-${eip}`;
        return (
          <span key={eip}>
            {index > 0 && <span aria-hidden="true">{', '}</span>}
            {published ? (
              <Link
                to={`/${slug}`}
                className="font-medium text-[var(--erc-color-accent)] hover:underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus:outline-none rounded-sm"
              >
                {label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--erc-color-text-secondary)]">{label}</span>
            )}
          </span>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Page header — badges, title, short description, metadata, official link
// ---------------------------------------------------------------------------

export interface EntryHeaderProps {
  entry: ERCEntry;
  /** Localised short description (computed once in DetailPage, shared with SEO). */
  description: string;
}

export function EntryHeader({ entry, description }: EntryHeaderProps) {
  const { t } = useTranslation('common');
  const categoryStyle =
    CATEGORY_BADGE_CLASSES[entry.category] ??
    'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-muted)] border-transparent';

  const typeLabel =
    entry.entryType === 'standard' ? t('catalogUi.standard') : t('catalogUi.protocol');

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-3"
    >
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border uppercase tracking-wide',
            categoryStyle,
          )}
        >
          {t(CATEGORY_LABELS[entry.category] ?? entry.category)}
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border',
            entry.entryType === 'standard'
              ? 'bg-[var(--erc-color-accent)]/10 text-[var(--erc-color-accent)] border-[var(--erc-color-accent)]/25'
              : 'bg-[var(--erc-color-category-defi)]/10 text-[var(--erc-color-category-defi)] border-[var(--erc-color-category-defi)]/25',
          )}
        >
          {entry.entryType === 'standard'
            ? `EIP-${(entry as { eipNumber?: number }).eipNumber ?? ''}`
            : t('catalogUi.protocol')}
        </span>
        {/* Official EIP lifecycle status + unofficial flag (schema v2) */}
        {(entry.eipStatus || entry.unofficial) && (
          <StatusBadge status={entry.eipStatus ?? null} unofficial={entry.unofficial ?? false} />
        )}
      </div>

      {/* Name */}
      <h1 className="text-2xl sm:text-3xl font-black text-[var(--erc-color-text-primary)] leading-tight">
        {entry.name}
      </h1>

      {/* Short description */}
      <p className="text-base text-[var(--erc-color-text-secondary)] leading-relaxed max-w-2xl">
        {description}
      </p>

      {/* Quick info — inline metadata */}
      <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--erc-color-text-muted)]">
        <div className="flex items-center gap-1.5">
          <dt>{t('catalogUi.type')}:</dt>
          <dd className="font-medium text-[var(--erc-color-text-secondary)]">{typeLabel}</dd>
        </div>
        <span aria-hidden="true" className="text-[var(--erc-color-border)]">·</span>
        <div className="flex items-center gap-1.5">
          <dt>{t('catalogUi.category')}:</dt>
          <dd className="font-medium text-[var(--erc-color-text-secondary)]">
            {t(CATEGORY_LABELS[entry.category] ?? entry.category)}
          </dd>
        </div>
        {entry.entryType === 'standard' && (entry as { eipNumber?: number }).eipNumber && (
          <>
            <span aria-hidden="true" className="text-[var(--erc-color-border)]">·</span>
            <div className="flex items-center gap-1.5">
              <dt>{t('detailUi.meta.eip')}:</dt>
              <dd className="font-medium text-[var(--erc-color-text-secondary)]">
                {(entry as { eipNumber: number }).eipNumber}
              </dd>
            </div>
          </>
        )}
        <span aria-hidden="true" className="text-[var(--erc-color-border)]">·</span>
        <div className="flex items-center gap-1.5">
          <dt>{t('detailUi.meta.functions')}:</dt>
          <dd className="font-medium text-[var(--erc-color-text-secondary)]">{entry.functions.length}</dd>
        </div>
        <span aria-hidden="true" className="text-[var(--erc-color-border)]">·</span>
        <div className="flex items-center gap-1.5">
          <dt>{t('detailUi.meta.simulations')}:</dt>
          <dd className="font-medium text-[var(--erc-color-text-secondary)]">{entry.simulations.length}</dd>
        </div>
        {/* EIP dependencies (schema v2 `requires`) */}
        {entry.requires && entry.requires.length > 0 && (
          <>
            <span aria-hidden="true" className="text-[var(--erc-color-border)]">·</span>
            <div className="flex items-center gap-1.5">
              <dt>{t('detailUi.meta.requires')}:</dt>
              <dd>
                <RequiresList requires={entry.requires} />
              </dd>
            </div>
          </>
        )}
      </dl>

      {/* Action links */}
      <div className="flex flex-wrap items-center gap-3 mt-1">
        <ExternalLink
          href={entry.officialUrl}
          className="text-sm font-medium"
          ariaLabel={t('detailUi.officialSpecFor', { name: entry.name })}
        >
          {t('detailUi.officialSpec')}
        </ExternalLink>
      </div>
    </motion.header>
  );
}

// ---------------------------------------------------------------------------
// Overview sections — Introduction / Design Purpose / Common Usage
// ---------------------------------------------------------------------------

export interface OverviewSectionsProps {
  entry: ERCEntry;
  tEntry: EntryTFunction;
}

export function OverviewSections({ entry, tEntry }: OverviewSectionsProps) {
  const { t } = useTranslation('common');

  return (
    <>
      {/* Introduction */}
      <Section id="introduction" title={t('detailUi.sections.introduction')} collapsible defaultExpanded>
        <p className="text-sm text-[var(--erc-color-text-secondary)] leading-relaxed whitespace-pre-line">
          {tEntry('introduction', { defaultValue: entry.introduction })}
        </p>
      </Section>

      {/* Design Purpose */}
      <LazySection height={100}>
        <Section id="design-purpose" title={t('detailUi.sections.designPurpose')} collapsible defaultExpanded>
          <p className="text-sm text-[var(--erc-color-text-secondary)] leading-relaxed whitespace-pre-line">
            {tEntry('designPurpose', { defaultValue: entry.designPurpose })}
          </p>
        </Section>
      </LazySection>

      {/* Common Usage */}
      <LazySection height={100}>
        <Section id="common-usage" title={t('detailUi.sections.commonUsage')} collapsible defaultExpanded>
          <p className="text-sm text-[var(--erc-color-text-secondary)] leading-relaxed whitespace-pre-line">
            {tEntry('commonUsage', { defaultValue: entry.commonUsage })}
          </p>
        </Section>
      </LazySection>
    </>
  );
}

// ---------------------------------------------------------------------------
// Related entries
// ---------------------------------------------------------------------------

function RelatedEntries({ slugs }: { slugs: string[] }) {
  const { t } = useTranslation('common');
  const items = slugs
    .map((s) => allMeta.find((m) => m.slug === s))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  if (items.length === 0) return null;

  return (
    <Section id="related" title={t('detailUi.sections.related')}>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-label={t('detailUi.sections.related')}>
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              to={`/${item.slug}`}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5',
                'border border-[var(--erc-color-border)]',
                'hover:border-[var(--erc-color-accent)]/40',
                'hover:bg-[var(--erc-color-bg-tertiary)]',
                'transition-all duration-150 group',
                'focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus:outline-none',
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  item.entryType === 'standard'
                    ? 'bg-[var(--erc-color-accent)]'
                    : 'bg-[var(--erc-color-category-defi)]',
                )}
                aria-hidden="true"
              />
              <span className="flex-1 text-sm font-medium text-[var(--erc-color-text-secondary)] group-hover:text-[var(--erc-color-text-primary)] truncate transition-colors">
                {item.name}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-[var(--erc-color-text-muted)] group-hover:text-[var(--erc-color-accent)] transition-colors">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export interface RelatedEntriesSectionProps {
  slugs: string[];
}

export function RelatedEntriesSection({ slugs }: RelatedEntriesSectionProps) {
  return (
    <LazySection height={80}>
      <RelatedEntries slugs={slugs} />
    </LazySection>
  );
}
