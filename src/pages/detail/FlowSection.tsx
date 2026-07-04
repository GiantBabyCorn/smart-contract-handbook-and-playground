import { useEffect, useState, useCallback, useRef, Suspense, lazy } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { ERCEntry } from '@/data/types';
import type { useSimulation } from '@/features/simulation/useSimulation';
import { cn } from '@/utils/cn';
import { LazySection } from './shared';
import { useFocusTrap } from './useFocusTrap';

// Lazy-load the heavy React Flow canvas
const FlowCanvas = lazy(() => import('@/components/flow/FlowCanvas'));

export interface FlowSectionProps {
  entry: ERCEntry;
  sim: ReturnType<typeof useSimulation>;
  tCommon: (key: string) => string;
}

/** Interaction Flow section — lazy-mounts the flow diagram when scrolled near the viewport. */
export function FlowSection({ entry, sim, tCommon }: FlowSectionProps) {
  return (
    <LazySection height={620}>
      <FlowDiagramSection entry={entry} sim={sim} tCommon={tCommon} />
    </LazySection>
  );
}

// ---------------------------------------------------------------------------
// Flow diagram — Resizable + Fullscreen
// ---------------------------------------------------------------------------

function FlowDiagramSection({ entry, sim, tCommon }: FlowSectionProps) {
  const { t } = useTranslation('simulation');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [height, setHeight] = useState(620);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const exitFullscreen = useCallback(() => setIsFullscreen(false), []);

  // Fullscreen is a modal dialog: trap Tab inside, Escape exits, and focus
  // returns to the "Fullscreen" opener button on close.
  useFocusTrap(fullscreenRef, isFullscreen, exitFullscreen);

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

  const flowCanvasFallback = (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[var(--erc-color-border)] border-t-[var(--erc-color-accent)] rounded-full" aria-label={t('flow.computing')} />
    </div>
  );

  const flowCanvasProps = {
    flowNodes: entry.flowNodes,
    flowEdges: entry.flowEdges,
    elkLayoutOptions: entry.elkLayoutOptions,
    slug: entry.slug,
    highlightedNodes: sim.highlightedNodes,
    highlightedEdges: sim.highlightedEdges,
  };

  // Inline canvas sits inside the scrollable article: wheel scrolls the
  // page, Ctrl/Cmd+wheel zooms, nodes are locked (see FlowCanvas drag
  // policy). Fullscreen has no page scroll, so plain-wheel zoom and node
  // dragging are enabled there.
  const flowCanvas = (
    <Suspense fallback={flowCanvasFallback}>
      <FlowCanvas {...flowCanvasProps} />
    </Suspense>
  );
  const fullscreenFlowCanvas = (
    <Suspense fallback={flowCanvasFallback}>
      <FlowCanvas {...flowCanvasProps} zoomOnScroll />
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
              {t('flow.title')}
            </h2>
            <p className="text-xs text-[var(--erc-color-text-muted)] mt-0.5">
              {tCommon('a11y.flowDiagram')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--erc-color-accent)] text-white hover:opacity-90 transition-opacity shrink-0"
            aria-label={t('flow.fullscreen')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1 -mt-0.5" aria-hidden="true">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            {t('flow.fullscreen')}
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
          aria-label={t('flow.resize')}
          role="separator"
        >
          <div className="w-8 h-0.5 rounded-full bg-[var(--erc-color-text-muted)] opacity-40" />
        </div>
      </motion.section>

      {/* Fullscreen overlay — modal dialog (focus trap + Escape via useFocusTrap) */}
      {isFullscreen && (
        <div
          ref={fullscreenRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${entry.name} — ${t('flow.title')}`}
          className="fixed inset-0 z-50 bg-[var(--erc-color-bg-primary)] flex flex-col"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] shrink-0">
            <h2 className="text-base font-semibold text-[var(--erc-color-text-primary)]">
              {entry.name} — {t('flow.title')}
            </h2>
            <button
              type="button"
              onClick={exitFullscreen}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[var(--erc-color-accent)] text-white hover:opacity-90 transition-opacity"
            >
              {t('flow.exitFullscreen')}
            </button>
          </div>
          <div className="flex-1">
            {fullscreenFlowCanvas}
          </div>
        </div>
      )}
    </>
  );
}
