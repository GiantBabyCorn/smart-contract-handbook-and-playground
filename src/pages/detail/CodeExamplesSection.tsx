import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CodeExample } from '@/data/types';
import type { EntryTFunction } from '@/i18n/entryText';
import { resolveEntryText } from '@/i18n/entryText';
import CodeBlock from '@/components/common/CodeBlock';
import { cn } from '@/utils/cn';
import { Section, LazySection } from './shared';

// ---------------------------------------------------------------------------
// Code examples section — tabbed when there are multiple examples
// ---------------------------------------------------------------------------

export interface CodeExamplesSectionProps {
  slug: string;
  codeExamples: CodeExample[];
  tEntry: EntryTFunction;
}

export function CodeExamplesSection({ slug, codeExamples, tEntry }: CodeExamplesSectionProps) {
  const { t } = useTranslation('common');
  const [activeIndex, setActiveIndex] = useState(0);

  const active = codeExamples[Math.min(activeIndex, codeExamples.length - 1)];

  return (
    <LazySection height={240}>
      <Section id="code-examples" title={t('detailUi.sections.codeExamples')}>
        <div className="flex flex-col gap-3">
          {codeExamples.length > 1 ? (
            <>
              <div
                role="tablist"
                aria-label={t('detailUi.sections.codeExamples')}
                className="flex flex-wrap gap-1.5"
              >
                {codeExamples.map((example, index) => (
                  <button
                    key={example.title}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)]',
                      index === activeIndex
                        ? 'bg-[var(--erc-color-accent)]/10 text-[var(--erc-color-accent)] border-[var(--erc-color-accent)]/40'
                        : 'bg-[var(--erc-color-bg-primary)] text-[var(--erc-color-text-secondary)] border-[var(--erc-color-border)] hover:border-[var(--erc-color-accent)]/30',
                    )}
                  >
                    {resolveEntryText(tEntry, slug, example.title)}
                  </button>
                ))}
              </div>
              <div role="tabpanel">
                <CodeBlock code={active.code} language={active.lang} />
              </div>
            </>
          ) : (
            codeExamples.map((example) => (
              <div key={example.title} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-[var(--erc-color-text-primary)]">
                  {resolveEntryText(tEntry, slug, example.title)}
                </h3>
                <CodeBlock code={example.code} language={example.lang} />
              </div>
            ))
          )}
        </div>
      </Section>
    </LazySection>
  );
}
