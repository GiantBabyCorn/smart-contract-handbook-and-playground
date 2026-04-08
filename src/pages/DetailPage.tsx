import { useEffect, useState, useCallback, useRef, useTransition, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { getEntryBySlug, prefetchEntry } from '@/data/registry';
import { allMeta } from '@/data/allMeta';
import type { ERCEntry, ContractFunction } from '@/data/types';
import SEOHead from '@/components/common/SEOHead';
import ExternalLink from '@/components/common/ExternalLink';
import SkeletonBlock from '@/components/common/SkeletonBlock';
import { cn } from '@/utils/cn';
import { useSimulation } from '@/features/simulation/useSimulation';
import { useLazySection } from '@/hooks/useLazySection';
import NotFoundPage from './NotFoundPage';

// Lazy-load heavy components
const FlowCanvas = lazy(() => import('@/components/flow/FlowCanvas'));
const SimulationPanel = lazy(() => import('@/components/flow/panels/SimulationPanel'));
const InteractivePanel = lazy(() => import('@/components/flow/panels/InteractivePanel'));

// ---------------------------------------------------------------------------
// Category badge colour map
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  token: 'bg-[var(--erc-color-category-token)]/15 text-[var(--erc-color-category-token)] border-[var(--erc-color-category-token)]/30',
  nft: 'bg-[var(--erc-color-category-nft)]/15 text-[var(--erc-color-category-nft)] border-[var(--erc-color-category-nft)]/30',
  proxy: 'bg-[var(--erc-color-category-proxy)]/15 text-[var(--erc-color-category-proxy)] border-[var(--erc-color-category-proxy)]/30',
  defi: 'bg-[var(--erc-color-category-defi)]/15 text-[var(--erc-color-category-defi)] border-[var(--erc-color-category-defi)]/30',
  account: 'bg-[var(--erc-color-category-account)]/15 text-[var(--erc-color-category-account)] border-[var(--erc-color-category-account)]/30',
  utility: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)] border-[var(--erc-color-accent)]/30',
  identity: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)] border-[var(--erc-color-accent)]/30',
  oracle: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)] border-[var(--erc-color-accent)]/30',
  governance: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)] border-[var(--erc-color-accent)]/30',
  'cross-chain': 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)] border-[var(--erc-color-accent)]/30',
  rwa: 'bg-[var(--erc-color-accent)]/15 text-[var(--erc-color-accent)] border-[var(--erc-color-accent)]/30',
};

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

function FunctionCard({ fn, tFn }: { fn: ContractFunction; tFn: (key: string) => string }) {
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
      {/* Header row */}
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
          <p className="mt-1 text-xs text-[var(--erc-color-text-secondary)] leading-snug line-clamp-2">
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

      {/* Expanded details */}
      {expanded && (hasParams || hasReturns) && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--erc-color-border)] flex flex-col gap-3">
          {hasParams && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--erc-color-text-muted)] mb-2">
                Parameters
              </p>
              <ul className="space-y-1.5">
                {fn.params.map((p) => (
                  <li key={p.name} className="flex items-start gap-2 text-xs">
                    <code className="shrink-0 font-mono font-semibold text-[var(--erc-color-accent)]">{p.name}</code>
                    <span className="text-[var(--erc-color-text-muted)]">{p.type}</span>
                    <span className="text-[var(--erc-color-text-secondary)]">— {tFn(p.description)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasReturns && fn.returns && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--erc-color-text-muted)] mb-2">
                Returns
              </p>
              <ul className="space-y-1.5">
                {fn.returns.map((r) => (
                  <li key={r.name} className="flex items-start gap-2 text-xs">
                    <code className="shrink-0 font-mono font-semibold text-[var(--erc-color-success)]">{r.name}</code>
                    <span className="text-[var(--erc-color-text-muted)]">{r.type}</span>
                    <span className="text-[var(--erc-color-text-secondary)]">— {tFn(r.description)}</span>
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
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
  id,
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn(
        'rounded-2xl border border-[var(--erc-color-border)]',
        'bg-[var(--erc-color-bg-secondary)]',
        'overflow-hidden',
      )}
    >
      <div
        className={cn(
          'px-5 py-4 flex items-center justify-between gap-2',
          (expanded || !collapsible) && 'border-b border-[var(--erc-color-border)]',
          collapsible && 'cursor-pointer hover:bg-[var(--erc-color-bg-tertiary)] transition-colors select-none',
        )}
        onClick={collapsible ? () => setExpanded((v) => !v) : undefined}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? expanded : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={collapsible ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        } : undefined}
      >
        <h2
          id={id ? `${id}-heading` : undefined}
          className="text-base font-semibold text-[var(--erc-color-text-primary)]"
        >
          {title}
        </h2>
        {collapsible && (
          <span
            className={cn(
              'shrink-0 text-[var(--erc-color-text-muted)] transition-transform duration-200',
              !expanded && '-rotate-90',
            )}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        )}
      </div>
      {(!collapsible || expanded) && (
        <motion.div
          initial={collapsible ? { opacity: 0, height: 0 } : false}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="p-5"
        >
          {children}
        </motion.div>
      )}
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// Lazy-rendered section — only mounts children when scrolled near viewport
// ---------------------------------------------------------------------------

function LazySection({
  children,
  height = 120,
}: {
  children: React.ReactNode;
  /** Placeholder height in pixels while waiting to enter viewport */
  height?: number;
}) {
  const { ref, isVisible } = useLazySection('300px');

  return (
    <div ref={ref}>
      {isVisible ? (
        children
      ) : (
        <div
          className="rounded-2xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] animate-pulse"
          style={{ height }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Related entries
// ---------------------------------------------------------------------------

function RelatedEntries({ slugs }: { slugs: string[] }) {
  const { t } = useTranslation('common');
  const items = slugs
    .map((s) => allMeta.find((m) => m.slug === s))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  if (items.length === 0) return null;

  return (
    <Section id="related" title="Related Standards & Protocols">
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-label={t('nav.home')}>
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              to={`/${item.slug}`}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5',
                'border border-[var(--erc-color-border)]',
                'hover:border-[var(--erc-color-accent)]/40',
                'hover:bg-[var(--erc-color-bg-tertiary)]',
                'transition-all duration-150 group',
                'focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus:outline-none',
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  item.entryType === 'standard'
                    ? 'bg-[var(--erc-color-accent)]'
                    : 'bg-[var(--erc-color-category-defi)]',
                )}
                aria-hidden="true"
              />
              <span className="flex-1 text-sm font-medium text-[var(--erc-color-text-secondary)] group-hover:text-[var(--erc-color-text-primary)] truncate transition-colors">
                {item.name}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-[var(--erc-color-text-muted)] group-hover:text-[var(--erc-color-accent)] transition-colors">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Simulation panel props helper
// ---------------------------------------------------------------------------

function simPanelProps(entry: ERCEntry, sim: ReturnType<typeof useSimulation>) {
  return {
    scenarios: entry.simulations,
    activeScenarioId: sim.scenario?.id ?? null,
    currentStep: sim.currentStepIndex,
    isPlaying: sim.isPlaying,
    paramValues: sim.params,
    onScenarioChange: (id: string) => {
      const s = entry.simulations.find((s) => s.id === id);
      if (s) sim.loadScenario(s);
    },
    onParamChange: sim.setParam,
    onPlay: sim.play,
    onPause: sim.pause,
    onStepForward: sim.stepForward,
    onStepBack: sim.stepBack,
    onReset: sim.reset,
  };
}

// ---------------------------------------------------------------------------
// Flow diagram — Resizable + Fullscreen
// ---------------------------------------------------------------------------

function FlowDiagramSection({
  entry,
  sim,
  tCommon,
}: {
  entry: ERCEntry;
  sim: ReturnType<typeof useSimulation>;
  tCommon: (key: string) => string;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [height, setHeight] = useState(620);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      startY.current = e.clientY;
      startH.current = height;
      e.preventDefault();
    },
    [height],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientY - startY.current;
      setHeight(Math.max(250, Math.min(900, startH.current + delta)));
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const flowCanvas = (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--erc-color-border)] border-t-[var(--erc-color-accent)] rounded-full" aria-label="Loading flow diagram" />
        </div>
      }
    >
      <FlowCanvas
        flowNodes={entry.flowNodes}
        flowEdges={entry.flowEdges}
        elkLayoutOptions={entry.elkLayoutOptions}
        highlightedNodes={sim.highlightedNodes}
        highlightedEdges={sim.highlightedEdges}
      />
    </Suspense>
  );

  return (
    <>
      <motion.section
        id="flow-diagram"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        aria-labelledby="flow-diagram-heading"
        className={cn(
          'rounded-2xl border border-[var(--erc-color-border)]',
          'bg-[var(--erc-color-bg-secondary)]',
          'overflow-hidden',
        )}
      >
        <div className="px-5 py-4 border-b border-[var(--erc-color-border)] flex items-center justify-between gap-2">
          <div>
            <h2 id="flow-diagram-heading" className="text-base font-semibold text-[var(--erc-color-text-primary)]">
              Interaction Flow
            </h2>
            <p className="text-xs text-[var(--erc-color-text-muted)] mt-0.5">
              {tCommon('a11y.flowDiagram')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--erc-color-accent)] text-white hover:opacity-90 transition-opacity shrink-0"
            aria-label="Open flow diagram in fullscreen"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1 -mt-0.5" aria-hidden="true">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            Fullscreen
          </button>
        </div>
        {/* Resizable canvas container */}
        <div style={{ height }} aria-label={tCommon('a11y.flowDiagram')}>
          {flowCanvas}
        </div>
        {/* Resize handle */}
        <div
          onMouseDown={onMouseDown}
          className="h-2.5 cursor-ns-resize bg-[var(--erc-color-bg-tertiary)] border-t border-[var(--erc-color-border)] flex items-center justify-center hover:bg-[var(--erc-color-accent)]/10 transition-colors"
          aria-label="Drag to resize flow diagram"
          role="separator"
        >
          <div className="w-8 h-0.5 rounded-full bg-[var(--erc-color-text-muted)] opacity-40" />
        </div>
      </motion.section>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[var(--erc-color-bg-primary)] flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] shrink-0">
            <h2 className="text-base font-semibold text-[var(--erc-color-text-primary)]">
              {entry.name} — Interaction Flow
            </h2>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[var(--erc-color-accent)] text-white hover:opacity-90 transition-opacity"
            >
              Exit Fullscreen
            </button>
          </div>
          <div className="flex-1">
            {flowCanvas}
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Simulation — Right drawer (all screen sizes)
// ---------------------------------------------------------------------------

const SIM_TOOLTIP_KEY = 'sim-tooltip-dismissed';

function SimulationDrawer({
  entry,
  sim,
  tCommon,
}: {
  entry: ERCEntry;
  sim: ReturnType<typeof useSimulation>;
  tCommon: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'scenario' | 'interactive'>('scenario');
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

  const handleToggle = useCallback(() => {
    dismissTooltip();
    setOpen((v) => !v);
  }, [dismissTooltip]);

  return (
    <>
      {/* Toggle button — fixed at bottom-right */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
        {/* First-time tooltip bubble */}
        {showTooltip && !open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className={cn(
              'relative px-3.5 py-2.5 rounded-xl shadow-lg max-w-[220px]',
              'bg-[var(--erc-color-bg-secondary)] border border-[var(--erc-color-accent)]/40',
              'text-xs text-[var(--erc-color-text-secondary)] leading-snug',
            )}
          >
            <button
              type="button"
              onClick={dismissTooltip}
              className="absolute top-1 right-1.5 text-[var(--erc-color-text-muted)] hover:text-[var(--erc-color-text-primary)] transition-colors"
              aria-label="Dismiss tooltip"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <span className="pr-3">
              Try the <strong className="text-[var(--erc-color-accent)]">Simulation</strong> to see how data flows through the contract!
            </span>
            {/* Arrow pointing down towards button */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45 bg-[var(--erc-color-bg-secondary)] border-r border-b border-[var(--erc-color-accent)]/40" />
          </motion.div>
        )}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg',
            'bg-[var(--erc-color-accent)] text-white text-sm font-medium',
            'hover:opacity-90 transition-opacity',
            showTooltip && !open && 'animate-pulse',
          )}
          aria-label={open ? 'Close simulation panel' : 'Open simulation panel'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
            <path d="M5.5 4.5l4 2.5-4 2.5V4.5z" fill="currentColor" />
          </svg>
          {open ? 'Close' : 'Simulation'}
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[55] bg-black/40 transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer sliding in from the right */}
      <div
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
                Simulation
              </h2>
              <p className="text-xs text-[var(--erc-color-text-muted)] mt-0.5">
                {tCommon('a11y.simulationPanel')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 text-[var(--erc-color-text-secondary)] hover:text-[var(--erc-color-text-primary)] transition-colors"
              aria-label="Close simulation drawer"
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

// ---------------------------------------------------------------------------
// Detail page content (loaded entry)
// ---------------------------------------------------------------------------

function EntryContent({ entry }: { entry: ERCEntry }) {
  // Load the entry-specific namespace (slug) for translated content fields
  const { t: tEntry } = useTranslation(entry.slug);
  const { t: tCommon } = useTranslation('common');

  // Simulation engine
  const sim = useSimulation();

  const categoryStyle =
    CATEGORY_COLORS[entry.category] ??
    'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-muted)] border-transparent';

  // Build description for SEO using the translation key if possible
  const description = tEntry('short', { defaultValue: entry.shortDescription });

  return (
    <>
      <SEOHead
        title={entry.name}
        description={description}
        slug={entry.slug}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* ── Page header ─────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-3"
        >
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border uppercase tracking-wide',
                categoryStyle,
              )}
            >
              {entry.category}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border',
                entry.entryType === 'standard'
                  ? 'bg-[var(--erc-color-accent)]/10 text-[var(--erc-color-accent)] border-[var(--erc-color-accent)]/25'
                  : 'bg-[var(--erc-color-category-defi)]/10 text-[var(--erc-color-category-defi)] border-[var(--erc-color-category-defi)]/25',
              )}
            >
              {entry.entryType === 'standard'
                ? `EIP-${(entry as { eipNumber?: number }).eipNumber ?? ''}`
                : 'Protocol'}
            </span>
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--erc-color-text-primary)] leading-tight">
            {entry.name}
          </h1>

          {/* Short description */}
          <p className="text-base text-[var(--erc-color-text-secondary)] leading-relaxed max-w-2xl">
            {description}
          </p>

          {/* Quick info — inline metadata */}
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--erc-color-text-muted)]">
            <div className="flex items-center gap-1.5">
              <dt>Type:</dt>
              <dd className="font-medium text-[var(--erc-color-text-secondary)] capitalize">{entry.entryType}</dd>
            </div>
            <span aria-hidden="true" className="text-[var(--erc-color-border)]">·</span>
            <div className="flex items-center gap-1.5">
              <dt>Category:</dt>
              <dd className="font-medium text-[var(--erc-color-text-secondary)] capitalize">{entry.category}</dd>
            </div>
            {entry.entryType === 'standard' && (entry as { eipNumber?: number }).eipNumber && (
              <>
                <span aria-hidden="true" className="text-[var(--erc-color-border)]">·</span>
                <div className="flex items-center gap-1.5">
                  <dt>EIP:</dt>
                  <dd className="font-medium text-[var(--erc-color-text-secondary)]">
                    {(entry as { eipNumber: number }).eipNumber}
                  </dd>
                </div>
              </>
            )}
            <span aria-hidden="true" className="text-[var(--erc-color-border)]">·</span>
            <div className="flex items-center gap-1.5">
              <dt>Functions:</dt>
              <dd className="font-medium text-[var(--erc-color-text-secondary)]">{entry.functions.length}</dd>
            </div>
            <span aria-hidden="true" className="text-[var(--erc-color-border)]">·</span>
            <div className="flex items-center gap-1.5">
              <dt>Simulations:</dt>
              <dd className="font-medium text-[var(--erc-color-text-secondary)]">{entry.simulations.length}</dd>
            </div>
          </dl>

          {/* Action links */}
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <ExternalLink
              href={entry.officialUrl}
              className="text-sm font-medium"
              ariaLabel={`Official specification for ${entry.name}`}
            >
              Official Specification
            </ExternalLink>
          </div>
        </motion.header>

        {/* ── Full-width content ─────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Introduction */}
          <Section id="introduction" title="Introduction" collapsible defaultExpanded>
            <p className="text-sm text-[var(--erc-color-text-secondary)] leading-relaxed whitespace-pre-line">
              {tEntry('introduction', { defaultValue: entry.introduction })}
            </p>
          </Section>

          {/* Design Purpose */}
          <LazySection height={100}>
            <Section id="design-purpose" title="Design Purpose" collapsible defaultExpanded>
              <p className="text-sm text-[var(--erc-color-text-secondary)] leading-relaxed whitespace-pre-line">
                {tEntry('designPurpose', { defaultValue: entry.designPurpose })}
              </p>
            </Section>
          </LazySection>

          {/* Common Usage */}
          <LazySection height={100}>
            <Section id="common-usage" title="Common Usage" collapsible defaultExpanded>
              <p className="text-sm text-[var(--erc-color-text-secondary)] leading-relaxed whitespace-pre-line">
                {tEntry('commonUsage', { defaultValue: entry.commonUsage })}
              </p>
            </Section>
          </LazySection>

          {/* Flow diagram — Resizable + Fullscreen */}
          {entry.flowNodes.length > 0 && (
            <LazySection height={620}>
              <FlowDiagramSection
                entry={entry}
                sim={sim}
                tCommon={tCommon}
              />
            </LazySection>
          )}

          {/* Functions list */}
          {entry.functions.length > 0 && (
            <LazySection height={200}>
              <Section id="functions" title={`Functions & Events (${entry.functions.length})`}>
                <div className="flex flex-col gap-2">
                  {entry.functions.map((fn) => (
                    <FunctionCard
                      key={fn.signature}
                      fn={fn}
                      tFn={(key) => tEntry(key, { defaultValue: key })}
                    />
                  ))}
                </div>
              </Section>
            </LazySection>
          )}

          {/* Related entries — always at the bottom */}
          {entry.relatedSlugs.length > 0 && (
            <LazySection height={80}>
              <RelatedEntries slugs={entry.relatedSlugs} />
            </LazySection>
          )}
        </div>

        {/* ── Simulation — Slide-out drawer (all screens) ──── */}
        {entry.simulations.length > 0 && (
          <SimulationDrawer entry={entry} sim={sim} tCommon={tCommon} />
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function DetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [entry, setEntry] = useState<ERCEntry | null | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntry(null);
      return;
    }

    let cancelled = false;

    getEntryBySlug(slug).then((result) => {
      if (cancelled) return;
      // Use startTransition to keep the previous entry visible while the new
      // one loads — avoids a skeleton flash on every navigation.
      startTransition(() => {
        setEntry(result);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [slug, startTransition]);

  // Prefetch related entries in the background once we have data
  useEffect(() => {
    if (entry) {
      entry.relatedSlugs.forEach(prefetchEntry);
    }
  }, [entry]);

  // Cold start — no previous entry to show
  if (entry === undefined) {
    return <SkeletonBlock type="detail" />;
  }

  // Not found
  if (entry === null) {
    return <NotFoundPage />;
  }

  return (
    <div className={isPending ? 'opacity-60 transition-opacity duration-200' : ''}>
      <EntryContent entry={entry} />
    </div>
  );
}
