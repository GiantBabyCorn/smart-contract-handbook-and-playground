import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ContractFunction,
  FlowNodeDef,
  FlowEdgeDef,
  SimulationScenario,
} from '@/data/types';
import { buildInteractiveScenario } from '@/features/simulation/InteractiveEngine';
import { cn } from '@/utils/cn';
import ParamField from './ParamField';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InteractivePanelProps {
  functions: ContractFunction[];
  flowNodes: FlowNodeDef[];
  flowEdges: FlowEdgeDef[];
  onExecute: (scenario: SimulationScenario) => void;
  currentStep?: number;
  totalSteps?: number;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onStepForward?: () => void;
  onStepBack?: () => void;
  onReset?: () => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const FN_TYPE_COLORS: Record<string, string> = {
  read: 'bg-[var(--erc-color-fn-read)]/10 text-[var(--erc-color-fn-read)] border-[var(--erc-color-fn-read)]/25',
  write: 'bg-[var(--erc-color-fn-write)]/10 text-[var(--erc-color-fn-write)] border-[var(--erc-color-fn-write)]/25',
  event: 'bg-[var(--erc-color-fn-event)]/10 text-[var(--erc-color-fn-event)] border-[var(--erc-color-fn-event)]/25',
};

function ControlButton({
  onClick,
  disabled = false,
  ariaLabel,
  children,
  accent = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InteractivePanel({
  functions,
  flowNodes,
  flowEdges,
  onExecute,
  currentStep = -1,
  totalSteps = 0,
  isPlaying = false,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
}: InteractivePanelProps) {
  const { t } = useTranslation('common');
  const [selectedFn, setSelectedFn] = useState<ContractFunction | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [hasExecuted, setHasExecuted] = useState(false);

  const handleSelectFn = useCallback((fn: ContractFunction) => {
    setSelectedFn(fn);
    setHasExecuted(false);
    // Pre-fill params with defaults
    const defaults: Record<string, string> = {};
    for (const p of fn.params) {
      defaults[p.name] = fn.defaultSimValues?.[p.name] ?? '';
    }
    setParamValues(defaults);
  }, []);

  const handleParamChange = useCallback((id: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleExecute = useCallback(() => {
    if (!selectedFn) return;
    const scenario = buildInteractiveScenario(
      selectedFn,
      flowNodes,
      flowEdges,
      paramValues,
    );
    setHasExecuted(true);
    onExecute(scenario);
  }, [selectedFn, flowNodes, flowEdges, paramValues, onExecute]);

  const progressPct =
    totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* ── Function list ──── */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-[var(--erc-color-text-secondary)] uppercase tracking-wide">
          {t('interactive.selectFunction', 'Select Function')}
        </span>
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {functions.map((fn) => (
            <button
              key={fn.name}
              type="button"
              onClick={() => handleSelectFn(fn)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-left border transition-all',
                selectedFn?.name === fn.name
                  ? 'border-[var(--erc-color-accent)] bg-[var(--erc-color-accent)]/5'
                  : 'border-[var(--erc-color-border)] bg-[var(--erc-color-bg-primary)] hover:bg-[var(--erc-color-bg-tertiary)]',
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border shrink-0',
                  FN_TYPE_COLORS[fn.type] ?? '',
                )}
              >
                {fn.type}
              </span>
              <span className="text-xs font-mono text-[var(--erc-color-text-primary)] truncate">
                {fn.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Param form ──── */}
      {selectedFn && selectedFn.params.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-[var(--erc-color-border)] pt-3">
          <span className="text-xs font-semibold text-[var(--erc-color-text-secondary)] uppercase tracking-wide">
            {t('interactive.parameters', 'Parameters')}
          </span>
          {selectedFn.params.map((p) => (
            <ParamField
              key={p.name}
              param={{
                id: p.name,
                label: `${p.name}: ${p.type}`,
                type:
                  p.type === 'bool'
                    ? 'bool'
                    : p.type === 'address'
                      ? 'address'
                      : 'uint256',
                defaultValue:
                  selectedFn.defaultSimValues?.[p.name] ?? '',
              }}
              value={paramValues[p.name] ?? ''}
              onChange={handleParamChange}
            />
          ))}
        </div>
      )}

      {/* ── Execute button ──── */}
      {selectedFn && (
        <button
          type="button"
          onClick={handleExecute}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'text-sm font-semibold transition-all duration-150',
            'bg-[var(--erc-color-accent)] text-white',
            'hover:opacity-90 active:scale-[0.98]',
          )}
        >
          {/* Play icon */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
          </svg>
          {t('interactive.execute', 'Execute')} {selectedFn.name}
        </button>
      )}

      {/* ── Playback controls (shown after execution) ──── */}
      {hasExecuted && totalSteps > 0 && (
        <div className="flex flex-col gap-2 border-t border-[var(--erc-color-border)] pt-3">
          {/* Progress bar */}
          <div className="flex items-center gap-2 text-[11px] text-[var(--erc-color-text-secondary)]">
            <span>
              {currentStep + 1} / {totalSteps}
            </span>
            <div className="flex-1 h-1 rounded-full bg-[var(--erc-color-bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--erc-color-accent)] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <ControlButton
              onClick={onReset}
              ariaLabel={t('sim.reset', 'Reset')}
            >
              {/* Reset icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2 7a5 5 0 019.33-2.5M12 7a5 5 0 01-9.33 2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </ControlButton>

            <ControlButton
              onClick={onStepBack}
              disabled={currentStep <= 0}
              ariaLabel={t('sim.stepBack', 'Step back')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 11L4 7l5-4v8z" fill="currentColor" />
              </svg>
            </ControlButton>

            {isPlaying ? (
              <ControlButton
                onClick={onPause}
                ariaLabel={t('sim.pause', 'Pause')}
                accent
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="3" y="2" width="3" height="10" rx="0.5" fill="currentColor" />
                  <rect x="8" y="2" width="3" height="10" rx="0.5" fill="currentColor" />
                </svg>
              </ControlButton>
            ) : (
              <ControlButton
                onClick={onPlay}
                disabled={currentStep >= totalSteps - 1}
                ariaLabel={t('sim.play', 'Play')}
                accent
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
                </svg>
              </ControlButton>
            )}

            <ControlButton
              onClick={onStepForward}
              disabled={currentStep >= totalSteps - 1}
              ariaLabel={t('sim.stepForward', 'Step forward')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 3l5 4-5 4V3z" fill="currentColor" />
              </svg>
            </ControlButton>
          </div>
        </div>
      )}
    </div>
  );
}
