import { useTranslation } from 'react-i18next';
import type { Reference } from '@/data/types';
import ExternalLink from '@/components/common/ExternalLink';
import { Section, LazySection } from './shared';

// ---------------------------------------------------------------------------
// References section — grouped by kind (spec / impl / audit / article)
// ---------------------------------------------------------------------------

type ReferenceKind = Reference['kind'];

const KIND_ORDER: ReferenceKind[] = ['spec', 'impl', 'audit', 'article'];

/** Explicit key map — no dynamic key construction (docs/I18N_CONVENTIONS.md §8). */
const KIND_LABEL_KEYS: Record<ReferenceKind, string> = {
  spec: 'detailUi.refKind.spec',
  impl: 'detailUi.refKind.impl',
  audit: 'detailUi.refKind.audit',
  article: 'detailUi.refKind.article',
};

export interface ReferencesSectionProps {
  references: Reference[];
}

export function ReferencesSection({ references }: ReferencesSectionProps) {
  const { t } = useTranslation('common');

  const groups = KIND_ORDER.map((kind) => ({
    kind,
    items: references.filter((ref) => ref.kind === kind),
  })).filter((group) => group.items.length > 0);

  return (
    <LazySection height={120}>
      <Section id="references" title={t('detailUi.sections.references')}>
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.kind}>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--erc-color-text-muted)] mb-2">
                {t(KIND_LABEL_KEYS[group.kind])}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {group.items.map((ref) => (
                  <li key={ref.url}>
                    {/* Reference labels are literal resource titles — never translated. */}
                    <ExternalLink href={ref.url} className="text-sm font-medium" iconSize={12}>
                      {ref.label}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </LazySection>
  );
}
