import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SimulationScenario } from '@/data/types';
import { cn } from '@/utils/cn';
import ParamField from './ParamField';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SimulationPanelProps {
  /** Available scenarios for this ERC entry */
  scenarios: SimulationScenario[];
  /** Currently active scenario id, or null if none selected */
  activeScenarioId?: string | null;
  /** Current step index within the active scenario (0-based) */
  currentStep?: number;
  /** Whether the simulation is currently auto-playing */
  isPlaying?: boolean;
  /** Callback: user selected a scenario */
  onScenarioChange?: (scenarioId: string) => void;
  /** Callback: user changed a parameter value */
  onParamChange?: (paramId: string, value: string) => void;
  /** Current parameter values keyed by paramId */
  paramValues?: Record<string, string>;
  /** Playback controls */
  onPlay?: () => void;
  onPause?: () => void;
  onStepForward?: () => void;
  onStepBack?: () => void;
  onReset?: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ControlButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
  accent?: boolean;
}

function ControlButton({
  onClick,
  disabled = false,
  ariaLabel,
  children,
  accent = false,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-md border shrink-0',
        'transition-all duration-150 p-0',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        accent
          ? 'border-[var(--erc-color-accent)] bg-[var(--erc-color-accent)] text-white'
          : 'border-[var(--erc-color-border)] bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-primary)]',
      )}
    >
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * SimulationPanel — standalone page-level component (NOT a React Flow Panel).
 * Rendered in the DetailPage sidebar. Lets users select a simulation scenario,
 * tweak parameters, and step through with play/pause/step/reset controls.
 */
export default function SimulationPanel({
  scenarios,
  activeScenarioId = null,
  currentStep = 0,
  isPlaying = false,
  onScenarioChange,
  onParamChange,
  paramValues = {},
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
}: SimulationPanelProps) {
  const { t } = useTranslation('simulation');

  const [collapsed, setCollapsed] = useState(false);

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) ?? null;
  const totalSteps = activeScenario?.steps.length ?? 0;
  // currentStep can be -1 when scenario is loaded but not yet started
  const displayStep = Math.max(0, currentStep);
  const hasStarted = currentStep >= 0;
  const currentStepData = hasStarted ? (activeScenario?.steps[displayStep] ?? null) : null;
  const progressPct = hasStarted && totalSteps > 0 ? ((displayStep + 1) / totalSteps) * 100 : 0;

  const handleParamChange = useCallback(
    (id: string, val: string) => {
      onParamChange?.(id, val);
    },
    [onParamChange],
  );

  return (
    <div
      role="region"
      aria-label={t('panel.title')}
      className="w-full"
    >
      {/* ── Panel header ── */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3',
          !collapsed && 'border-b border-[var(--erc-color-border)]',
          'bg-[var(--erc-color-bg-tertiary)]',
        )}
      >
        <span className="font-semibold text-sm text-[var(--erc-color-text-primary)] flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="var(--erc-color-accent)" strokeWidth="1.25" />
            <path d="M5.5 4.5l4 2.5-4 2.5V4.5z" fill="var(--erc-color-accent)" />
          </svg>
          {t('panel.title')}
        </span>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand simulation panel' : 'Collapse simulation panel'}
          className="p-0.5 text-[var(--erc-color-text-secondary)] hover:text-[var(--erc-color-text-primary)] transition-colors"
        >
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
            className={cn('transition-transform duration-200', collapsed && 'rotate-180')}
          >
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="flex flex-col">
          {/* ── Scenario selector ── */}
          <div className="px-4 py-3 border-b border-[var(--erc-color-border)]">
            <label
              htmlFor="sim-scenario-select"
              className="block text-[11px] text-[var(--erc-color-text-secondary)] mb-1"
            >
              {t('panel.scenario')}
            </label>
            {scenarios.length === 0 ? (
              <p className="m-0 text-xs text-[var(--erc-color-text-muted)]">
                {t('panel.noScenario')}
              </p>
            ) : (
              <select
                id="sim-scenario-select"
                value={activeScenarioId ?? ''}
                onChange={(e) => onScenarioChange?.(e.target.value)}
                className={cn(
                  'w-full rounded-md text-xs px-2 py-1.5',
                  'bg-[var(--erc-color-bg-primary)] border border-[var(--erc-color-border)]',
                  'text-[var(--erc-color-text-primary)]',
                  'focus:border-[var(--erc-color-accent)] focus:ring-1 focus:ring-[var(--erc-color-accent)] outline-none',
                )}
              >
                <option value="" disabled>{t('panel.noScenario')}</option>
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* ── Parameters ── */}
          {activeScenario && activeScenario.params.length > 0 && (
            <div className="px-4 py-3 border-b border-[var(--erc-color-border)] flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-[var(--erc-color-text-secondary)] uppercase tracking-wider">
                {t('panel.parameters')}
              </span>
              {activeScenario.params.map((param) => (
                <ParamField
                  key={param.id}
                  param={param}
                  value={paramValues[param.id] ?? param.defaultValue}
                  onChange={handleParamChange}
                />
              ))}
            </div>
          )}

          {/* ── Playback controls ── */}
          {activeScenario && (
            <div className="px-4 py-3 border-b border-[var(--erc-color-border)] flex flex-col gap-2.5">
              {/* Progress info */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[var(--erc-color-text-secondary)]">
                  {hasStarted
                    ? t('panel.step', { current: displayStep + 1, total: totalSteps })
                    : t('panel.step', { current: 0, total: totalSteps })}
                </span>
                {currentStepData && (
                  <span
                    className="text-[10px] text-[var(--erc-color-text-muted)] truncate max-w-[160px]"
                    title={currentStepData.description}
                  >
                    {currentStepData.description}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div
                role="progressbar"
                aria-valuenow={hasStarted ? displayStep + 1 : 0}
                aria-valuemin={0}
                aria-valuemax={totalSteps}
                aria-label={`Simulation progress: step ${hasStarted ? displayStep + 1 : 0} of ${totalSteps}`}
                className="h-1 rounded-full bg-[var(--erc-color-border)] overflow-hidden"
              >
                <div
                  className="h-full rounded-full bg-[var(--erc-color-accent)] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Step dots */}
              {totalSteps <= 12 && (
                <div className="flex gap-1 flex-wrap" aria-hidden="true">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
                      style={{
                        background: !hasStarted
                          ? 'var(--erc-color-sim-pending)'
                          : i < displayStep
                            ? 'var(--erc-color-sim-completed)'
                            : i === displayStep
                              ? 'var(--erc-color-sim-active)'
                              : 'var(--erc-color-sim-pending)',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Buttons row */}
              <div className="flex items-center gap-1.5">
                <ControlButton onClick={onStepBack} disabled={!hasStarted || displayStep === 0 || isPlaying} ariaLabel={t('controls.stepBack')}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M9 2L4 6l5 4V2z" fill="currentColor" />
                    <line x1="2" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </ControlButton>

                {isPlaying ? (
                  <ControlButton onClick={onPause} ariaLabel={t('controls.pause')} accent>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <rect x="2.5" y="2" width="2.5" height="8" rx="0.5" fill="currentColor" />
                      <rect x="7" y="2" width="2.5" height="8" rx="0.5" fill="currentColor" />
                    </svg>
                  </ControlButton>
                ) : (
                  <ControlButton onClick={onPlay} disabled={totalSteps === 0} ariaLabel={t('controls.play')} accent>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M3 2l7 4-7 4V2z" fill="currentColor" />
                    </svg>
                  </ControlButton>
                )}

                <ControlButton onClick={onStepForward} disabled={(!hasStarted && totalSteps === 0) || (hasStarted && displayStep >= totalSteps - 1) || isPlaying} ariaLabel={t('controls.stepForward')}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M3 2l5 4-5 4V2z" fill="currentColor" />
                    <line x1="10" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </ControlButton>

                <ControlButton onClick={onReset} disabled={isPlaying} ariaLabel={t('controls.reset')}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6a4 4 0 1 1 1.2 2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                    <path d="M2 9.5V6.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </ControlButton>
              </div>
            </div>
          )}

          {/* ── Status badge ── */}
          {activeScenario && (
            <div className="px-4 py-2.5 flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: isPlaying
                    ? 'var(--erc-color-sim-active)'
                    : hasStarted && displayStep >= totalSteps - 1 && totalSteps > 0
                      ? 'var(--erc-color-sim-completed)'
                      : 'var(--erc-color-sim-pending)',
                }}
                aria-hidden="true"
              />
              <span className="text-[11px] text-[var(--erc-color-text-muted)]">
                {isPlaying
                  ? t('status.running')
                  : hasStarted && displayStep >= totalSteps - 1 && totalSteps > 0
                    ? t('status.completed')
                    : t('status.idle')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
