import { useTranslation } from 'react-i18next';
import { PLAYGROUND_PRESETS } from './presets';
import { cn } from '@/utils/cn';

interface PlaygroundOnboardingProps {
  onLoadPreset: (slugs: string[]) => void;
}

const STEP_ICONS = [
  // 1 — add contracts (plus in a box)
  <svg key="i1" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2.5" y="2.5" width="15" height="15" rx="3.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2.5" />
    <path d="M10 6.5v7M6.5 10h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,
  // 2 — pick a function (cursor on a list)
  <svg key="i2" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 5h9M3 9h6M3 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M11 9.5l6 2.4-2.6 1-1 2.6-2.4-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>,
  // 3 — run the simulation (play)
  <svg key="i3" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8.2 7l5 3-5 3V7z" fill="currentColor" />
  </svg>,
];

/**
 * Empty-canvas onboarding: a 3-step how-to plus one-click preset combos.
 * Rendered inside the canvas overlay; the parent overlay is pointer-events-none
 * so this container re-enables pointer events for its buttons.
 */
export default function PlaygroundOnboarding({
  onLoadPreset,
}: PlaygroundOnboardingProps) {
  const { t } = useTranslation('common');

  const steps = [
    {
      title: t('playground.step1Title', 'Add contracts'),
      desc: t(
        'playground.step1Desc',
        'Drag standards from the palette onto the canvas, or click Add',
      ),
    },
    {
      title: t('playground.step2Title', 'Pick a function'),
      desc: t(
        'playground.step2Desc',
        'Select a function in the right panel and fill in its parameters',
      ),
    },
    {
      title: t('playground.step3Title', 'Run the simulation'),
      desc: t(
        'playground.step3Desc',
        'Execute and watch the call flow across your contracts',
      ),
    },
  ];

  return (
    <div
      data-testid="playground-onboarding"
      className="pointer-events-auto flex max-h-full w-full max-w-2xl flex-col items-center gap-6 overflow-y-auto p-6"
    >
      <h2 className="text-base font-semibold text-[var(--erc-color-text-primary)]">
        {t('playground.onboardingTitle', 'Get started in three steps')}
      </h2>

      {/* ── 3-step cards ──── */}
      <div className="flex w-full flex-col items-stretch gap-2 md:flex-row md:items-center">
        {steps.map((step, i) => (
          <div key={step.title} className="contents">
            {i > 0 && (
              <div
                className="flex shrink-0 items-center justify-center text-[var(--erc-color-text-muted)]"
                aria-hidden="true"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="rotate-90 md:rotate-0"
                >
                  <path
                    d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            <div
              className={cn(
                'flex flex-1 flex-col gap-2 rounded-xl border border-[var(--erc-color-border)]',
                'bg-[var(--erc-color-bg-secondary)] p-3.5 shadow-sm',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                    'bg-[var(--erc-color-accent)] text-[10px] font-bold text-white',
                  )}
                >
                  {i + 1}
                </span>
                <span className="text-[var(--erc-color-accent)]">{STEP_ICONS[i]}</span>
              </div>
              <span className="text-xs font-semibold text-[var(--erc-color-text-primary)]">
                {step.title}
              </span>
              <span className="text-[11px] leading-snug text-[var(--erc-color-text-muted)]">
                {step.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Preset combos ──── */}
      <div className="flex w-full flex-col items-center gap-2.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--erc-color-text-muted)]">
          {t('playground.presetsTitle', 'Or start from a preset combo')}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {PLAYGROUND_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              data-testid={`playground-preset-${preset.id}`}
              onClick={() => onLoadPreset(preset.slugs)}
              className={cn(
                'flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left',
                'border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)]',
                'transition-colors hover:border-[var(--erc-color-accent)]/60',
                'hover:bg-[var(--erc-color-accent)]/5',
              )}
            >
              <span className="text-xs font-semibold text-[var(--erc-color-text-primary)]">
                {preset.name}
              </span>
              <span className="text-[10px] text-[var(--erc-color-text-muted)]">
                {t(preset.descKey)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
