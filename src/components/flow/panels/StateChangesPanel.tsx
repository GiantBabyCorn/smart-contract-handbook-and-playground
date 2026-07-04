import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SimulationScenario } from '@/data/types';
import type { StepMeta } from '@/stores/useSimulationStore';
import { cn } from '@/utils/cn';

/**
 * StateChangesPanel — per-step storage/balance diffs (plan §5.2).
 *
 * - One row per changed variable: `variable: old → new` with a ▲/▼ delta
 *   arrow PLUS colour (never colour-only), monospace values.
 * - Clickable step timeline to review past snapshots.
 * - When the final step is in view, an initial → final summary block shows
 *   the first vs last value of every touched variable.
 * - Revert steps render a red-bordered banner with the translated reason.
 * - aria-live="polite" announces the latest change for screen readers.
 * - Styled exclusively with theme CSS variables → works in dark and light.
 */

export interface StateChangesPanelProps {
  scenario: SimulationScenario;
  /** Index of the most recently executed step (-1 = not started). */
  currentStepIndex: number;
  /** stepId → { key: 'old → new' } effective (computed or authored) changes. */
  stepResults: Record<string, Record<string, string>>;
  /** stepId → engine-computed revert info. */
  stepMeta: Record<string, StepMeta>;
  /** Resolves entry-namespace i18n keys (step descriptions, authored revert reasons). */
  resolveText: (key: string) => string;
}

const ARROW = ' → ';

function splitTransition(value: string): { from: string | null; to: string } {
  const idx = value.indexOf(ARROW);
  if (idx < 0) return { from: null, to: value };
  return { from: value.slice(0, idx), to: value.slice(idx + ARROW.length) };
}

/** Best-effort numeric prefix parse ('1,000', '2.99 TOKEN-B', '1000e18'). */
function leadingNumber(s: string): number | null {
  const m = s.trim().match(/^[+-]?[\d,]+(?:\.\d+)?(?:e\d+)?/i);
  if (!m) return null;
  const n = Number(m[0].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

type Direction = 'up' | 'down' | null;

function directionOf(from: string | null, to: string): Direction {
  if (from === null) return null;
  const a = leadingNumber(from);
  const b = leadingNumber(to);
  if (a === null || b === null || a === b) return null;
  return b > a ? 'up' : 'down';
}

function DeltaArrow({ direction }: { direction: Direction }) {
  const { t } = useTranslation('simulation');
  if (direction === null) return null;
  const up = direction === 'up';
  return (
    <span
      className="shrink-0 text-[10px] leading-none font-bold"
      style={{ color: up ? 'var(--erc-color-success)' : 'var(--erc-color-error)' }}
    >
      <span aria-hidden="true">{up ? '▲' : '▼'}</span>
      <span className="sr-only">{up ? t('state.increase') : t('state.decrease')}</span>
    </span>
  );
}

function ChangeRow({ changeKey, value }: { changeKey: string; value: string }) {
  const { from, to } = splitTransition(value);
  const direction = directionOf(from, to);
  const dot = changeKey.indexOf('.');
  const nodeId = dot > 0 ? changeKey.slice(0, dot) : null;
  const varName = dot > 0 ? changeKey.slice(dot + 1) : changeKey;

  return (
    <li
      data-testid="state-change-row"
      className="flex flex-col gap-0.5 py-1.5 border-b border-[var(--erc-color-border)] last:border-b-0"
    >
      <code className="text-[10px] font-mono leading-tight break-all">
        {nodeId && (
          <span className="text-[var(--erc-color-text-muted)]">{nodeId}.</span>
        )}
        <span className="text-[var(--erc-color-text-secondary)]">{varName}</span>
      </code>
      <span className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--erc-color-text-primary)]">
        {from !== null ? (
          <>
            <span className="break-all">{from}</span>
            <span aria-hidden="true" className="text-[var(--erc-color-text-muted)] shrink-0">
              →
            </span>
            <span
              className="break-all font-semibold"
              style={
                direction
                  ? { color: direction === 'up' ? 'var(--erc-color-success)' : 'var(--erc-color-error)' }
                  : undefined
              }
            >
              {to}
            </span>
          </>
        ) : (
          <span className="break-all">{to}</span>
        )}
        <DeltaArrow direction={direction} />
      </span>
    </li>
  );
}

export default function StateChangesPanel({
  scenario,
  currentStepIndex,
  stepResults,
  stepMeta,
  resolveText,
}: StateChangesPanelProps) {
  const { t } = useTranslation('simulation');
  // Reviewing a past snapshot is anchored to the step it was requested at:
  // as soon as currentStepIndex moves (forward, back, or reset) the anchor
  // no longer matches and the view falls back to "follow latest" — no state
  // reconciliation effect required.
  const [review, setReview] = useState<{ anchor: number; index: number } | null>(null);

  const hasRun = currentStepIndex >= 0;
  const viewedIndex =
    review !== null && review.anchor === currentStepIndex && review.index <= currentStepIndex
      ? review.index
      : currentStepIndex;
  const viewedStep = hasRun ? scenario.steps[viewedIndex] : undefined;
  const viewedChanges = viewedStep ? stepResults[viewedStep.id] : undefined;
  const viewedMeta: StepMeta | undefined = viewedStep
    ? (stepMeta[viewedStep.id] ??
      (viewedStep.isRevert
        ? { isRevert: true, revertReason: viewedStep.revertReason }
        : undefined))
    : undefined;

  // Engine-computed reasons live in the simulation namespace ('revert.…');
  // authored reasons are entry-namespace keys resolved via resolveText.
  const revertReasonKey = viewedMeta?.revertReason;
  const revertReasonText = revertReasonKey
    ? revertReasonKey.startsWith('revert.')
      ? t(revertReasonKey)
      : resolveText(revertReasonKey)
    : null;

  // Initial → final summary across all executed steps (shown on the last step).
  const isAtFinalStep = hasRun && currentStepIndex >= scenario.steps.length - 1;
  const summary = useMemo(() => {
    if (!isAtFinalStep || viewedIndex !== currentStepIndex) return [];
    const first: Record<string, string> = {};
    const last: Record<string, string> = {};
    for (let i = 0; i <= currentStepIndex && i < scenario.steps.length; i++) {
      const changes = stepResults[scenario.steps[i].id];
      if (!changes) continue;
      for (const [key, value] of Object.entries(changes)) {
        const { from, to } = splitTransition(value);
        if (!(key in first)) first[key] = from ?? to;
        last[key] = to;
      }
    }
    return Object.keys(last).map((key) => ({ key, from: first[key], to: last[key] }));
  }, [isAtFinalStep, viewedIndex, currentStepIndex, scenario.steps, stepResults]);

  // Screen-reader announcement for the most recent execution.
  const announcement = useMemo(() => {
    if (!hasRun) return '';
    const step = scenario.steps[currentStepIndex];
    if (!step) return '';
    const meta =
      stepMeta[step.id] ??
      (step.isRevert ? { isRevert: true, revertReason: step.revertReason } : undefined);
    if (meta?.isRevert) {
      const key = meta.revertReason;
      const reason = key ? (key.startsWith('revert.') ? t(key) : resolveText(key)) : '';
      return `${t('state.stepLabel', { n: currentStepIndex + 1 })}: ${t('state.reverted')}. ${reason}`;
    }
    const changes = stepResults[step.id];
    const detail = changes
      ? Object.entries(changes)
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ')
      : resolveText(step.description);
    return t('state.announce', { n: currentStepIndex + 1, summary: detail });
  }, [hasRun, currentStepIndex, scenario.steps, stepResults, stepMeta, t, resolveText]);

  return (
    <section
      data-testid="state-changes-panel"
      aria-label={t('state.title')}
      className="px-4 py-3 border-b border-[var(--erc-color-border)] flex flex-col gap-2"
    >
      <span className="text-[11px] font-semibold text-[var(--erc-color-text-secondary)] uppercase tracking-wider">
        {t('state.title')}
      </span>

      {/* Live region — announces the latest executed change politely. */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {!hasRun ? (
        <p className="m-0 text-[11px] text-[var(--erc-color-text-muted)]">
          {t('state.empty')}
        </p>
      ) : (
        <>
          {/* ── Clickable step timeline ── */}
          <div className="flex flex-wrap gap-1" role="group" aria-label={t('panel.steps')}>
            {scenario.steps.slice(0, currentStepIndex + 1).map((step, i) => {
              const meta =
                stepMeta[step.id] ??
                (step.isRevert ? { isRevert: true } : undefined);
              const isViewed = i === viewedIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() =>
                    setReview(
                      i === currentStepIndex ? null : { anchor: currentStepIndex, index: i },
                    )
                  }
                  aria-pressed={isViewed}
                  aria-label={t('state.stepLabel', { n: i + 1 })}
                  className={cn(
                    'w-6 h-6 rounded text-[10px] font-mono font-semibold border transition-colors',
                    isViewed
                      ? 'bg-[var(--erc-color-accent)] text-white border-[var(--erc-color-accent)]'
                      : 'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-secondary)] border-[var(--erc-color-border)] hover:border-[var(--erc-color-accent)]',
                  )}
                  style={
                    meta?.isRevert && !isViewed
                      ? { borderColor: 'var(--erc-color-error)', color: 'var(--erc-color-error)' }
                      : undefined
                  }
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* ── Viewed step description ── */}
          {viewedStep && (
            <p className="m-0 text-[11px] leading-snug text-[var(--erc-color-text-muted)]">
              {resolveText(viewedStep.description)}
            </p>
          )}

          {/* ── Revert banner ── */}
          {viewedMeta?.isRevert && (
            <div
              data-testid="state-revert-banner"
              role="status"
              className="rounded-md px-2.5 py-2 text-[11px] leading-snug"
              style={{
                border: '1.5px solid var(--erc-color-error)',
                background: 'color-mix(in srgb, var(--erc-color-error) 10%, transparent)',
                color: 'var(--erc-color-error)',
              }}
            >
              <span className="font-semibold flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
                  <path d="M6 1L11.5 10.5H0.5L6 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <line x1="6" y1="4.5" x2="6" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="6" cy="8.8" r="0.7" fill="currentColor" />
                </svg>
                {t('state.reverted')}
              </span>
              {revertReasonText && <span className="block mt-0.5">{revertReasonText}</span>}
            </div>
          )}

          {/* ── Change rows for the viewed step ── */}
          {viewedChanges && Object.keys(viewedChanges).length > 0 ? (
            <ul className="m-0 p-0 list-none">
              {Object.entries(viewedChanges).map(([key, value]) => (
                <ChangeRow key={key} changeKey={key} value={value} />
              ))}
            </ul>
          ) : (
            !viewedMeta?.isRevert && (
              <p className="m-0 text-[11px] text-[var(--erc-color-text-muted)] italic">
                —
              </p>
            )
          )}

          {/* ── Initial → final summary (only on the last step) ── */}
          {summary.length > 0 && (
            <div
              data-testid="state-summary"
              className="mt-1 rounded-md border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-tertiary)] px-2.5 py-2"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--erc-color-text-secondary)]">
                {t('state.summary')}
              </span>
              <ul className="m-0 mt-1 p-0 list-none flex flex-col gap-1">
                {summary.map(({ key, from, to }) => {
                  const direction = directionOf(from ?? null, to);
                  return (
                    <li key={key} className="flex flex-col">
                      <code className="text-[10px] font-mono text-[var(--erc-color-text-muted)] break-all">
                        {key}
                      </code>
                      <span className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--erc-color-text-primary)]">
                        <span className="break-all">{from}</span>
                        <span aria-hidden="true" className="text-[var(--erc-color-text-muted)]">→</span>
                        <span className="break-all font-semibold">{to}</span>
                        <DeltaArrow direction={direction} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
