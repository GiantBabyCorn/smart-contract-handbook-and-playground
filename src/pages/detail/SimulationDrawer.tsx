import { useEffect, useState, useCallback, useRef, Suspense, lazy } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { ERCEntry } from '@/data/types';
import type { useSimulation } from '@/features/simulation/useSimulation';
import { cn } from '@/utils/cn';
import { useFocusTrap } from './useFocusTrap';

// Lazy-load heavy simulation panels
const SimulationPanel = lazy(() => import('@/components/flow/panels/SimulationPanel'));
const InteractivePanel = lazy(() => import('@/components/flow/panels/InteractivePanel'));

// ---------------------------------------------------------------------------
// Simulation panel props helper
// ---------------------------------------------------------------------------

function simPanelProps(entry: ERCEntry, sim: ReturnType<typeof useSimulation>) {
  return {
    scenarios: entry.simulations,
    slug: entry.slug,
    activeScenarioId: sim.scenario?.id ?? null,
    currentStep: sim.currentStepIndex,
    isPlaying: sim.isPlaying,
    speed: sim.speed,
    paramValues: sim.params,
    stepResults: sim.stepResults,
    stepMeta: sim.stepMeta,
    onScenarioChange: (id: string) => {
      const s = entry.simulations.find((s) => s.id === id);
      if (s) sim.loadScenario(s);
    },
    onParamChange: sim.setParam,
    onSpeedChange: sim.setSpeed,
    onPlay: sim.play,
    onPause: sim.pause,
    onStepForward: sim.stepForward,
    onStepBack: sim.stepBack,
    onReset: sim.reset,
  };
}

// ---------------------------------------------------------------------------
// Simulation — Right drawer (all screen sizes)
// ---------------------------------------------------------------------------

const SIM_TOOLTIP_KEY = 'sim-tooltip-dismissed';

export interface SimulationDrawerProps {
  entry: ERCEntry;
  sim: ReturnType<typeof useSimulation>;
  tCommon: (key: string) => string;
}

export function SimulationDrawer({ entry, sim, tCommon }: SimulationDrawerProps) {
  const { t } = useTranslation('simulation');
  const [open, setOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'scenario' | 'interactive'>('scenario');
  const drawerRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(() => {
    try {
      return !localStorage.getItem(SIM_TOOLTIP_KEY);
    } catch {
      return false;
    }
  });

  const dismissTooltip = useCallback(() => {
    setShowTooltip(false);
    try {
      localStorage.setItem(SIM_TOOLTIP_KEY, '1');
    } catch { /* ignore */ }
  }, []);

  // Auto-dismiss the onboarding tooltip after 8 s (in addition to the X)
  useEffect(() => {
    if (!showTooltip) return;
    const timer = window.setTimeout(dismissTooltip, 8000);
    return () => window.clearTimeout(timer);
  }, [showTooltip, dismissTooltip]);

  const handleToggle = useCallback(() => {
    dismissTooltip();
    setOpen((v) => !v);
  }, [dismissTooltip]);

  const close = useCallback(() => setOpen(false), []);

  // Modal a11y: trap Tab inside the drawer while open, close on Escape,
  // restore focus to the FAB (the opener) on close.
  useFocusTrap(drawerRef, open, close);

  return (
    <>
      {/* First-time tooltip bubble — fixed ABOVE the FAB with a clear gap so
          it never covers the FAB or the flow controls; arrow points at FAB */}
      {showTooltip && !open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
          className={cn(
            'fixed bottom-20 right-4 z-[59] px-3.5 py-2.5 rounded-xl shadow-lg max-w-[220px]',
            'bg-[var(--erc-color-bg-secondary)] border border-[var(--erc-color-accent)]/40',
            'text-xs text-[var(--erc-color-text-secondary)] leading-snug',
          )}
        >
          <button
            type="button"
            onClick={dismissTooltip}
            className="absolute top-1 right-1.5 text-[var(--erc-color-text-muted)] hover:text-[var(--erc-color-text-primary)] transition-colors"
            aria-label={t('drawer.dismiss')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <span className="pr-3">{t('drawer.tooltip')}</span>
          {/* Arrow pointing down towards the Simulation FAB */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45 bg-[var(--erc-color-bg-secondary)] border-r border-b border-[var(--erc-color-accent)]/40" />
        </motion.div>
      )}

      {/* Toggle button — fixed at bottom-right */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg',
            'bg-[var(--erc-color-accent)] text-white text-sm font-medium',
            'hover:opacity-90 transition-opacity',
            showTooltip && !open && 'animate-pulse',
          )}
          aria-label={open ? t('drawer.close') : t('drawer.open')}
          aria-expanded={open}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
            <path d="M5.5 4.5l4 2.5-4 2.5V4.5z" fill="currentColor" />
          </svg>
          {open ? t('popover.close') : t('drawer.title')}
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[55] bg-black/40 transition-opacity"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Drawer sliding in from the right.
          Kept in the DOM while closed (translated off-canvas) but marked
          inert so hidden controls leave the tab order / a11y tree. */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal={open || undefined}
        aria-label={t('drawer.title')}
        inert={!open}
        className={cn(
          'fixed top-0 bottom-0 right-0 z-[60] w-[360px] max-w-[85vw]',
          'border-l border-[var(--erc-color-border)]',
          'bg-[var(--erc-color-bg-secondary)]',
          'transition-transform duration-300 ease-in-out overflow-auto',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="px-4 py-3.5 border-b border-[var(--erc-color-border)] flex flex-col gap-2 sticky top-0 bg-[var(--erc-color-bg-secondary)] z-10">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[var(--erc-color-text-primary)]">
                {t('drawer.title')}
              </h2>
              <p className="text-xs text-[var(--erc-color-text-muted)] mt-0.5">
                {tCommon('a11y.simulationPanel')}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="p-1 text-[var(--erc-color-text-secondary)] hover:text-[var(--erc-color-text-primary)] transition-colors"
              aria-label={t('drawer.close')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {/* Mode toggle: Scenarios | Interactive */}
          <div className="flex rounded-lg border border-[var(--erc-color-border)] overflow-hidden">
            <button
              type="button"
              onClick={() => setDrawerMode('scenario')}
              aria-pressed={drawerMode === 'scenario'}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium transition-colors',
                drawerMode === 'scenario'
                  ? 'bg-[var(--erc-color-accent)] text-white'
                  : 'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-secondary)] hover:text-[var(--erc-color-text-primary)]',
              )}
            >
              {tCommon('sim.scenarios')}
            </button>
            <button
              type="button"
              onClick={() => setDrawerMode('interactive')}
              aria-pressed={drawerMode === 'interactive'}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium transition-colors',
                drawerMode === 'interactive'
                  ? 'bg-[var(--erc-color-accent)] text-white'
                  : 'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-secondary)] hover:text-[var(--erc-color-text-primary)]',
              )}
            >
              {tCommon('sim.interactive')}
            </button>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="p-4 flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-[var(--erc-color-bg-tertiary)] animate-pulse" />
              ))}
            </div>
          }
        >
          {drawerMode === 'scenario' ? (
            <SimulationPanel {...simPanelProps(entry, sim)} />
          ) : (
            <InteractivePanel
              functions={entry.functions}
              flowNodes={entry.flowNodes}
              flowEdges={entry.flowEdges}
              onExecute={(scenario) => sim.loadScenario(scenario)}
              currentStep={sim.currentStepIndex}
              totalSteps={sim.totalSteps}
              isPlaying={sim.isPlaying}
              onPlay={sim.play}
              onPause={sim.pause}
              onStepForward={sim.stepForward}
              onStepBack={sim.stepBack}
              onReset={sim.reset}
            />
          )}
        </Suspense>
      </div>
    </>
  );
}
