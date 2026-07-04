import { useTranslation } from 'react-i18next';
import type { ContractError } from '@/data/types';
import type { EntryTFunction } from '@/i18n/entryText';
import { resolveEntryText } from '@/i18n/entryText';
import { Section, LazySection } from './shared';

// ---------------------------------------------------------------------------
// Errors & reverts section — table of name/signature + revert condition
// ---------------------------------------------------------------------------

export interface ErrorsSectionProps {
  slug: string;
  errors: ContractError[];
  tEntry: EntryTFunction;
}

export function ErrorsSection({ slug, errors, tEntry }: ErrorsSectionProps) {
  const { t } = useTranslation('common');

  return (
    <LazySection height={140}>
      <Section id="errors" title={t('detailUi.sections.errors')}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--erc-color-border)]">
                <th scope="col" className="py-2 pr-4 font-semibold text-[var(--erc-color-text-muted)] uppercase tracking-wider text-[11px]">
                  {t('detailUi.errorsTable.name')}
                </th>
                <th scope="col" className="py-2 font-semibold text-[var(--erc-color-text-muted)] uppercase tracking-wider text-[11px]">
                  {t('detailUi.errorsTable.condition')}
                </th>
              </tr>
            </thead>
            <tbody>
              {errors.map((error) => (
                <tr key={error.name} className="border-b border-[var(--erc-color-border)] last:border-b-0 align-top">
                  <td className="py-2.5 pr-4">
                    <code className="font-mono font-semibold text-[var(--erc-color-error)] break-all">
                      {error.name}
                    </code>
                    {error.sig && (
                      <code className="mt-1 block font-mono text-[11px] text-[var(--erc-color-text-muted)] break-all">
                        {error.sig}
                      </code>
                    )}
                  </td>
                  <td className="py-2.5 text-[var(--erc-color-text-secondary)] leading-relaxed">
                    {resolveEntryText(tEntry, slug, error.condition)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </LazySection>
  );
}
