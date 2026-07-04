import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allMeta } from '@/data/allMeta';
import type { ComposedStandard } from '@/data/types';
import type { EntryTFunction } from '@/i18n/entryText';
import { resolveEntryText } from '@/i18n/entryText';
import { cn } from '@/utils/cn';
import { Section, LazySection } from './shared';

// ---------------------------------------------------------------------------
// Composition section — the standards a protocol composes, as role cards.
// (The interactive composition graph is a later phase — plan.md §9.)
// ---------------------------------------------------------------------------

export interface CompositionSectionProps {
  slug: string;
  composes: ComposedStandard[];
  tEntry: EntryTFunction;
}

function composedKey(item: ComposedStandard): string {
  return item.slug ?? (item.erc !== undefined ? `erc-${item.erc}` : item.role);
}

function composedLabel(item: ComposedStandard): string {
  if (item.slug) {
    const meta = allMeta.find((m) => m.slug === item.slug && m.published !== false);
    if (meta) return meta.name;
  }
  if (item.erc !== undefined) return `ERC-${item.erc}`;
  return item.slug ?? '';
}

export function CompositionSection({ slug, composes, tEntry }: CompositionSectionProps) {
  const { t } = useTranslation('common');

  return (
    <LazySection height={140}>
      <Section id="composition" title={t('detailUi.sections.composition')}>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {composes.map((item) => {
            const meta = item.slug
              ? allMeta.find((m) => m.slug === item.slug && m.published !== false)
              : undefined;
            const label = composedLabel(item);

            const cardBody = (
              <>
                <span className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 bg-[var(--erc-color-accent)]"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold text-[var(--erc-color-text-primary)] truncate">
                    {label}
                  </span>
                </span>
                <span className="text-xs text-[var(--erc-color-text-secondary)] leading-relaxed">
                  {resolveEntryText(tEntry, slug, item.role)}
                </span>
              </>
            );

            const cardClass = cn(
              'flex flex-col gap-1.5 rounded-xl px-4 py-3 h-full',
              'border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-primary)]',
            );

            return (
              <li key={composedKey(item)}>
                {meta ? (
                  <Link
                    to={`/${meta.slug}`}
                    className={cn(
                      cardClass,
                      'hover:border-[var(--erc-color-accent)]/40 hover:bg-[var(--erc-color-bg-tertiary)]',
                      'transition-all duration-150',
                      'focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus:outline-none',
                    )}
                  >
                    {cardBody}
                  </Link>
                ) : (
                  <div className={cardClass}>{cardBody}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Section>
    </LazySection>
  );
}
