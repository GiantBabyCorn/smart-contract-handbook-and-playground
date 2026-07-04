import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContractFunction } from '@/data/types';
import { cn } from '@/utils/cn';
import { stripEntryPrefix, type EntryTFunction } from '@/i18n/entryText';
import { Section, LazySection } from './shared';

// ---------------------------------------------------------------------------
// Function type badge
// ---------------------------------------------------------------------------

function FnTypeBadge({ type }: { type: 'read' | 'write' | 'event' }) {
  const map = {
    read: 'bg-[var(--erc-color-fn-read)]/10 text-[var(--erc-color-fn-read)] border-[var(--erc-color-fn-read)]/25',
    write: 'bg-[var(--erc-color-fn-write)]/10 text-[var(--erc-color-fn-write)] border-[var(--erc-color-fn-write)]/25',
    event: 'bg-[var(--erc-color-fn-event)]/10 text-[var(--erc-color-fn-event)] border-[var(--erc-color-fn-event)]/25',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border',
        map[type],
      )}
    >
      {type}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Function card
// ---------------------------------------------------------------------------

export interface FunctionCardProps {
  fn: ContractFunction;
  tFn: (key: string) => string;
}

export function FunctionCard({ fn, tFn }: FunctionCardProps) {
  const { t } = useTranslation('common');
  const [expanded, setExpanded] = useState(false);
  const hasParams = fn.params.length > 0;
  const hasReturns = fn.returns && fn.returns.length > 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--erc-color-border)]',
        'bg-[var(--erc-color-bg-primary)]',
        'overflow-hidden transition-all duration-150',
        expanded && 'border-[var(--erc-color-accent)]/30',
      )}
    >
      {/* Header row — expanding always reveals the full description, even for
          functions without params/returns */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          'w-full flex items-start gap-3 px-4 py-3 text-left',
          'hover:bg-[var(--erc-color-bg-tertiary)] transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--erc-color-accent)]',
        )}
      >
        <FnTypeBadge type={fn.type} />
        <div className="flex-1 min-w-0">
          <code className="text-sm font-semibold font-mono text-[var(--erc-color-text-primary)] break-all">
            {fn.signature}
          </code>
          <p
            className={cn(
              'mt-1 text-xs text-[var(--erc-color-text-secondary)] leading-snug',
              !expanded && 'line-clamp-2',
            )}
          >
            {tFn(fn.description)}
          </p>
        </div>
        {/* Chevron */}
        <span
          className={cn(
            'shrink-0 mt-0.5 text-[var(--erc-color-text-muted)] transition-transform duration-200',
            expanded && 'rotate-180',
          )}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Expanded details — only when there is structured content beyond the
          description (which un-clamps in the header above) */}
      {expanded && (hasParams || hasReturns) && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--erc-color-border)] flex flex-col gap-3">
          {hasParams && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--erc-color-text-muted)] mb-2">
                {t('detailUi.fn.parameters')}
              </p>
              <ul className="space-y-1.5">
                {fn.params.map((p) => (
                  <li key={p.name} className="flex items-start gap-2 text-xs">
                    <code className="shrink-0 font-mono font-semibold text-[var(--erc-color-accent)]">{p.name}</code>
                    <span className="text-[var(--erc-color-text-muted)]">{p.type}</span>
                    <span className="text-[var(--erc-color-text-secondary)]">{`— ${tFn(p.description)}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasReturns && fn.returns && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--erc-color-text-muted)] mb-2">
                {t('detailUi.fn.returns')}
              </p>
              <ul className="space-y-1.5">
                {fn.returns.map((r) => (
                  <li key={r.name} className="flex items-start gap-2 text-xs">
                    <code className="shrink-0 font-mono font-semibold text-[var(--erc-color-success)]">{r.name}</code>
                    <span className="text-[var(--erc-color-text-muted)]">{r.type}</span>
                    <span className="text-[var(--erc-color-text-secondary)]">{`— ${tFn(r.description)}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Functions & Events section
// ---------------------------------------------------------------------------

export interface FunctionsSectionProps {
  slug: string;
  functions: ContractFunction[];
  tEntry: EntryTFunction;
}

export function FunctionsSection({ slug, functions, tEntry }: FunctionsSectionProps) {
  const { t } = useTranslation('common');

  return (
    <LazySection height={200}>
      <Section id="functions" title={`${t('detailUi.sections.functions')} (${functions.length})`}>
        <div className="flex flex-col gap-2">
          {functions.map((fn) => (
            <FunctionCard
              key={fn.signature}
              fn={fn}
              tFn={(key) =>
                tEntry(stripEntryPrefix(slug, key), { defaultValue: key })
              }
            />
          ))}
        </div>
      </Section>
    </LazySection>
  );
}
