import { useCallback, useState } from 'react';
import { Panel } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import type { SimulationScenario, SimulationParam } from '@/data/types';

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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        height: '2rem',
        borderRadius: '0.375rem',
        border: `1px solid ${accent ? 'var(--erc-color-accent)' : 'var(--erc-color-border)'}`,
        background: accent ? 'var(--erc-color-accent)' : 'var(--erc-color-bg-tertiary)',
        color: accent ? '#fff' : 'var(--erc-color-text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.15s, opacity 0.15s',
        padding: 0,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function ParamField({
  param,
  value,
  onChange,
}: {
  param: SimulationParam;
  value: string;
  onChange: (id: string, val: string) => void;
}) {
  const fieldId = `sim-param-${param.id}`;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--erc-color-bg-primary)',
    border: '1px solid var(--erc-color-border)',
    borderRadius: '0.3rem',
    color: 'var(--erc-color-text-primary)',
    fontFamily: 'var(--erc-font-mono)',
    fontSize: '0.75rem',
    padding: '0.3rem 0.5rem',
    boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      <label
        htmlFor={fieldId}
        style={{
          fontSize: '0.6875rem',
          color: 'var(--erc-color-text-secondary)',
          fontFamily: 'var(--erc-font-body)',
        }}
      >
        {param.label}
      </label>

      {param.type === 'select' && param.options ? (
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(param.id, e.target.value)}
          style={inputStyle}
        >
          {param.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : param.type === 'bool' ? (
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(param.id, e.target.value)}
          style={inputStyle}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
        <input
          id={fieldId}
          type="text"
          value={value}
          onChange={(e) => onChange(param.id, e.target.value)}
          placeholder={param.defaultValue}
          style={inputStyle}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * SimulationPanel
 *
 * A React Flow Panel overlay rendered in the bottom-left of the canvas. Lets
 * users select a simulation scenario, tweak parameters, and step through the
 * simulation with play/pause/step/reset controls. All user-facing strings go
 * through the 'simulation' i18n namespace.
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

  // Local collapse state so the panel can be minimised
  const [collapsed, setCollapsed] = useState(false);

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) ?? null;
  const totalSteps = activeScenario?.steps.length ?? 0;
  const currentStepData = activeScenario?.steps[currentStep] ?? null;
  const progressPct = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const handleParamChange = useCallback(
    (id: string, val: string) => {
      onParamChange?.(id, val);
    },
    [onParamChange],
  );

  return (
    <Panel
      position="bottom-left"
      style={{ margin: '0.75rem' }}
    >
      <div
        role="region"
        aria-label={t('panel.title')}
        style={{
          width: '260px',
          background: 'var(--erc-color-bg-secondary)',
          border: '1px solid var(--erc-color-border)',
          borderRadius: '0.5rem',
          fontFamily: 'var(--erc-font-body)',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        {/* ── Panel header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            borderBottom: collapsed ? 'none' : '1px solid var(--erc-color-border)',
            background: 'var(--erc-color-bg-tertiary)',
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'var(--erc-color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {/* Play circle icon */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="6" stroke="var(--erc-color-accent)" strokeWidth="1.25" />
              <path
                d="M5.5 4.5l4 2.5-4 2.5V4.5z"
                fill="var(--erc-color-accent)"
              />
            </svg>
            {t('panel.title')}
          </span>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand simulation panel' : 'Collapse simulation panel'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--erc-color-text-secondary)',
              padding: '0.15rem',
              lineHeight: 1,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              style={{
                transform: collapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            >
              <path
                d="M3 5l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* ── Scenario selector ── */}
            <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--erc-color-border)' }}>
              <label
                htmlFor="sim-scenario-select"
                style={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  color: 'var(--erc-color-text-secondary)',
                  marginBottom: '0.3rem',
                }}
              >
                {t('panel.scenario')}
              </label>
              {scenarios.length === 0 ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: 'var(--erc-color-text-muted)',
                  }}
                >
                  {t('panel.noScenario')}
                </p>
              ) : (
                <select
                  id="sim-scenario-select"
                  value={activeScenarioId ?? ''}
                  onChange={(e) => onScenarioChange?.(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--erc-color-bg-primary)',
                    border: '1px solid var(--erc-color-border)',
                    borderRadius: '0.3rem',
                    color: 'var(--erc-color-text-primary)',
                    fontFamily: 'var(--erc-font-body)',
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.5rem',
                  }}
                >
                  <option value="" disabled>
                    {t('panel.noScenario')}
                  </option>
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ── Parameters ── */}
            {activeScenario && activeScenario.params.length > 0 && (
              <div
                style={{
                  padding: '0.6rem 0.75rem',
                  borderBottom: '1px solid var(--erc-color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--erc-color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
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
              <div
                style={{
                  padding: '0.6rem 0.75rem',
                  borderBottom: '1px solid var(--erc-color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {/* Progress indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--erc-color-text-secondary)',
                    }}
                  >
                    {t('panel.step', {
                      current: currentStep + 1,
                      total: totalSteps,
                    })}
                  </span>
                  {/* Step description */}
                  {currentStepData && (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        color: 'var(--erc-color-text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '120px',
                      }}
                      title={currentStepData.description}
                    >
                      {currentStepData.description}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div
                  role="progressbar"
                  aria-valuenow={currentStep + 1}
                  aria-valuemin={1}
                  aria-valuemax={totalSteps}
                  aria-label={`Simulation progress: step ${currentStep + 1} of ${totalSteps}`}
                  style={{
                    height: '4px',
                    borderRadius: '999px',
                    background: 'var(--erc-color-border)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPct}%`,
                      background: 'var(--erc-color-accent)',
                      borderRadius: '999px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                {/* Step dots */}
                {totalSteps <= 12 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      flexWrap: 'wrap',
                    }}
                    aria-hidden="true"
                  >
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background:
                            i < currentStep
                              ? 'var(--erc-color-sim-completed)'
                              : i === currentStep
                                ? 'var(--erc-color-sim-active)'
                                : 'var(--erc-color-sim-pending)',
                          transition: 'background 0.2s',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Buttons row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {/* Step back */}
                  <ControlButton
                    onClick={onStepBack}
                    disabled={currentStep === 0 || isPlaying}
                    ariaLabel={t('controls.stepBack')}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M9 2L4 6l5 4V2z" fill="currentColor" />
                      <line x1="2" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </ControlButton>

                  {/* Play / Pause — accent coloured */}
                  {isPlaying ? (
                    <ControlButton
                      onClick={onPause}
                      ariaLabel={t('controls.pause')}
                      accent
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <rect x="2.5" y="2" width="2.5" height="8" rx="0.5" fill="currentColor" />
                        <rect x="7" y="2" width="2.5" height="8" rx="0.5" fill="currentColor" />
                      </svg>
                    </ControlButton>
                  ) : (
                    <ControlButton
                      onClick={onPlay}
                      disabled={totalSteps === 0}
                      ariaLabel={t('controls.play')}
                      accent
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M3 2l7 4-7 4V2z" fill="currentColor" />
                      </svg>
                    </ControlButton>
                  )}

                  {/* Step forward */}
                  <ControlButton
                    onClick={onStepForward}
                    disabled={currentStep >= totalSteps - 1 || isPlaying}
                    ariaLabel={t('controls.stepForward')}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M3 2l5 4-5 4V2z" fill="currentColor" />
                      <line x1="10" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </ControlButton>

                  {/* Reset */}
                  <ControlButton
                    onClick={onReset}
                    disabled={isPlaying}
                    ariaLabel={t('controls.reset')}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M2 6a4 4 0 1 1 1.2 2.8"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path d="M2 9.5V6.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </ControlButton>
                </div>
              </div>
            )}

            {/* ── Status badge ── */}
            {activeScenario && (
              <div
                style={{
                  padding: '0.4rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isPlaying
                      ? 'var(--erc-color-sim-active)'
                      : currentStep >= totalSteps - 1 && totalSteps > 0
                        ? 'var(--erc-color-sim-completed)'
                        : 'var(--erc-color-sim-pending)',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--erc-color-text-muted)',
                  }}
                >
                  {isPlaying
                    ? t('status.running')
                    : currentStep >= totalSteps - 1 && totalSteps > 0
                      ? t('status.completed')
                      : t('status.idle')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
