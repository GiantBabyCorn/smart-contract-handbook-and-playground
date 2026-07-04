import { useTranslation } from 'react-i18next';
import type { EntryTFunction } from '@/i18n/entryText';
import { resolveEntryText } from '@/i18n/entryText';
import { Section, LazySection } from './shared';

// ---------------------------------------------------------------------------
// Gas notes section — a single callout paragraph
// ---------------------------------------------------------------------------

export interface GasNotesSectionProps {
  slug: string;
  gasNotes: string;
  tEntry: EntryTFunction;
}

export function GasNotesSection({ slug, gasNotes, tEntry }: GasNotesSectionProps) {
  const { t } = useTranslation('common');

  return (
    <LazySection height={100}>
      <Section id="gas" title={t('detailUi.sections.gas')}>
        <div className="flex items-start gap-3 rounded-xl border border-[var(--erc-color-warning)]/30 bg-[var(--erc-color-warning)]/10 p-4">
          <span className="shrink-0 mt-0.5 text-[var(--erc-color-warning)]" aria-hidden="true">
            {/* Fuel icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="22" x2="15" y2="22" />
              <line x1="4" y1="9" x2="14" y2="9" />
              <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
              <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
            </svg>
          </span>
          <p className="text-xs text-[var(--erc-color-text-secondary)] leading-relaxed whitespace-pre-line">
            {resolveEntryText(tEntry, slug, gasNotes)}
          </p>
        </div>
      </Section>
    </LazySection>
  );
}
