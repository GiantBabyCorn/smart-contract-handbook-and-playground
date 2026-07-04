import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import type { EipStatus } from '@/data/types';

/** Official EIP lifecycle terms are proper nouns — rendered untranslated,
 *  matching the project convention for external names. */
const STATUS_STYLES: Record<EipStatus, string> = {
  Final: 'bg-[var(--erc-color-success)]/15 text-[var(--erc-color-success)]',
  'Last Call': 'bg-[var(--erc-color-warning)]/15 text-[var(--erc-color-warning)]',
  Review: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)]',
  Draft: 'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-secondary)]',
  Stagnant:
    'bg-transparent text-[var(--erc-color-text-muted)] border border-dashed border-[var(--erc-color-border)]',
  Withdrawn: 'bg-[var(--erc-color-error)]/15 text-[var(--erc-color-error)]',
};

interface StatusBadgeProps {
  status: EipStatus | null;
  unofficial: boolean;
}

export default function StatusBadge({ status, unofficial }: StatusBadgeProps) {
  const { t } = useTranslation('common');

  if (!status && !unofficial) {
    return (
      <span aria-hidden="true" className="text-[var(--erc-color-text-muted)]">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {status && (
        <span
          data-testid="status-badge"
          className={cn(
            'inline-flex px-1.5 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap',
            STATUS_STYLES[status],
          )}
        >
          {status}
        </span>
      )}
      {unofficial && (
        <span
          className={cn(
            'inline-flex px-1.5 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap',
            'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-muted)]',
            'border border-[var(--erc-color-border)]',
          )}
        >
          {t('catalogUi.unofficial')}
        </span>
      )}
    </span>
  );
}
