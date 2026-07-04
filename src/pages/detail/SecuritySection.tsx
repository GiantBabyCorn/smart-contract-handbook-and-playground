import { useTranslation } from 'react-i18next';
import type { SecurityNote } from '@/data/types';
import type { EntryTFunction } from '@/i18n/entryText';
import { resolveEntryText } from '@/i18n/entryText';
import ExternalLink from '@/components/common/ExternalLink';
import { cn } from '@/utils/cn';
import { Section, LazySection } from './shared';

// ---------------------------------------------------------------------------
// Severity badge — colour + icon + text label (never colour-only)
// ---------------------------------------------------------------------------

type Severity = SecurityNote['severity'];

const SEVERITY_STYLES: Record<Severity, { badge: string; border: string }> = {
  critical: {
    badge: 'bg-[var(--erc-color-error)]/12 text-[var(--erc-color-error)] border-[var(--erc-color-error)]/30',
    border: 'border-l-[var(--erc-color-error)]',
  },
  high: {
    badge: 'bg-[var(--erc-color-warning)]/12 text-[var(--erc-color-warning)] border-[var(--erc-color-warning)]/30',
    border: 'border-l-[var(--erc-color-warning)]',
  },
  medium: {
    badge: 'bg-[var(--erc-color-accent)]/12 text-[var(--erc-color-accent)] border-[var(--erc-color-accent)]/30',
    border: 'border-l-[var(--erc-color-accent)]',
  },
  info: {
    badge: 'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-secondary)] border-[var(--erc-color-border)]',
    border: 'border-l-[var(--erc-color-text-muted)]',
  },
};

function SeverityIcon({ severity }: { severity: Severity }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  } as const;

  switch (severity) {
    case 'critical':
      // Octagon alert
      return (
        <svg {...common}>
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'high':
      // Triangle alert
      return (
        <svg {...common}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'medium':
      // Circle alert
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'info':
      // Circle info
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

/** Explicit key map — no dynamic key construction (docs/I18N_CONVENTIONS.md §8). */
const SEVERITY_LABEL_KEYS: Record<Severity, string> = {
  critical: 'detailUi.severity.critical',
  high: 'detailUi.severity.high',
  medium: 'detailUi.severity.medium',
  info: 'detailUi.severity.info',
};

function SeverityBadge({ severity }: { severity: Severity }) {
  const { t } = useTranslation('common');
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 border',
        'text-[10px] font-bold uppercase tracking-wide shrink-0',
        SEVERITY_STYLES[severity].badge,
      )}
    >
      <SeverityIcon severity={severity} />
      {t(SEVERITY_LABEL_KEYS[severity])}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Security considerations section
// ---------------------------------------------------------------------------

export interface SecuritySectionProps {
  slug: string;
  security: SecurityNote[];
  tEntry: EntryTFunction;
}

export function SecuritySection({ slug, security, tEntry }: SecuritySectionProps) {
  const { t } = useTranslation('common');

  return (
    <LazySection height={160}>
      <Section id="security" title={t('detailUi.sections.security')}>
        <ul className="flex flex-col gap-3">
          {security.map((note) => (
            <li
              key={note.title}
              className={cn(
                'rounded-xl border border-[var(--erc-color-border)] border-l-4',
                'bg-[var(--erc-color-bg-primary)] p-4 flex flex-col gap-2',
                SEVERITY_STYLES[note.severity].border,
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={note.severity} />
                <h3 className="text-sm font-semibold text-[var(--erc-color-text-primary)]">
                  {resolveEntryText(tEntry, slug, note.title)}
                </h3>
              </div>
              <p className="text-xs text-[var(--erc-color-text-secondary)] leading-relaxed">
                {resolveEntryText(tEntry, slug, note.desc)}
              </p>
              {note.mitigation && (
                <p className="text-xs leading-relaxed">
                  <span className="font-semibold text-[var(--erc-color-success)]">
                    {t('detailUi.security.mitigation')}
                  </span>{' '}
                  <span className="text-[var(--erc-color-text-secondary)]">
                    {resolveEntryText(tEntry, slug, note.mitigation)}
                  </span>
                </p>
              )}
              {note.source && (
                <ExternalLink href={note.source} className="text-xs font-medium self-start" iconSize={11}>
                  {t('detailUi.security.source')}
                </ExternalLink>
              )}
            </li>
          ))}
        </ul>
      </Section>
    </LazySection>
  );
}
