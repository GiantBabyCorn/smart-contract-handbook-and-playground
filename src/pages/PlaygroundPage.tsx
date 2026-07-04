import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { getEntryBySlug } from '@/data/registry';
import { usePlaygroundStore, type XY } from '@/stores/usePlaygroundStore';
import {
  buildSharedState,
  decodeShareParam,
  encodeShareParam,
} from '@/components/playground/playgroundShare';
import { allMeta } from '@/data/allMeta';
import { useSimulation } from '@/features/simulation/useSimulation';
import type { SimulationScenario } from '@/data/types';
import SEOHead from '@/components/common/SEOHead';
import { cn } from '@/utils/cn';

const PlaygroundCanvas = lazy(
  () => import('@/components/playground/PlaygroundCanvas'),
);
const ContractPalette = lazy(
  () => import('@/components/playground/ContractPalette'),
);
const InteractivePanel = lazy(
  () => import('@/components/flow/panels/InteractivePanel'),
);

export default function PlaygroundPage() {
  const { t } = useTranslation('common');
  const store = usePlaygroundStore();
  const sim = useSimulation();
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [placingSlug, setPlacingSlug] = useState<string | null>(null);
  const [toast, setToast] = useState<'copied' | 'failed' | null>(null);
  const toastTimer = useRef<number | null>(null);
  const restoreStartedRef = useRef(false);

  // ─── Restore from ?state= (takes precedence over the localStorage autosave) ─
  // The started-ref (not an abort flag) guards StrictMode's double effect
  // invocation: the first run must complete even though its cleanup fired,
  // otherwise the restore would be cancelled AND blocked from re-running.
  useEffect(() => {
    if (restoreStartedRef.current) return;
    restoreStartedRef.current = true;

    const stateParam = new URLSearchParams(window.location.search).get('state');
    if (!stateParam) return;

    void (async () => {
      try {
        const shared = await decodeShareParam(stateParam);
        const entryPairs = await Promise.all(
          shared.slugs.map(
            async (slug) => [slug, await getEntryBySlug(slug)] as const,
          ),
        );
        usePlaygroundStore
          .getState()
          .loadShared(shared, Object.fromEntries(entryPairs));
      } catch (err) {
        // Oversized/corrupt state → keep whatever the autosave restored.
        console.warn('[playground] Ignoring invalid ?state= payload:', err);
      } finally {
        // Clean the (long) param out of the URL bar — but only if it is
        // still there (the user may have navigated away meanwhile).
        const url = new URL(window.location.href);
        if (url.searchParams.has('state')) {
          url.searchParams.delete('state');
          window.history.replaceState(window.history.state, '', url);
        }
      }
    })();
  }, []);

  // ─── Late-fill functionsBySlug (states migrated from persist v0/v1) ────────
  const { addedSlugs, functionsBySlug } = store;
  useEffect(() => {
    for (const slug of addedSlugs) {
      if (!functionsBySlug[slug]) {
        void getEntryBySlug(slug).then((entry) => {
          if (entry) {
            usePlaygroundStore.getState().setFunctions(slug, entry.functions);
          }
        });
      }
    }
  }, [addedSlugs, functionsBySlug]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleAdd = useCallback(async (slug: string) => {
    const entry = await getEntryBySlug(slug);
    if (entry) usePlaygroundStore.getState().addEntry(slug, entry);
  }, []);

  /** Drop / tap-to-place: add at an explicit canvas position (or move the
   *  already-added entry's cluster there). */
  const handleAddAt = useCallback(async (slug: string, position: XY) => {
    setPlacingSlug(null);
    const state = usePlaygroundStore.getState();
    if (state.addedSlugs.includes(slug)) {
      state.setAnchor(slug, position);
      return;
    }
    const entry = await getEntryBySlug(slug);
    if (entry) {
      usePlaygroundStore.getState().addEntry(slug, entry, { anchor: position });
    }
  }, []);

  const handleLoadPreset = useCallback(
    async (slugs: string[]) => {
      // Sequential so addedSlugs order (and thus placement order) is stable.
      for (const slug of slugs) {
        await handleAdd(slug);
      }
    },
    [handleAdd],
  );

  /** Mobile sheet: tapping an item arms tap-to-place on the canvas. */
  const handleArmPlacement = useCallback((slug: string) => {
    setPlacingSlug(slug);
    setPaletteOpen(false);
  }, []);

  const showToast = useCallback((kind: 'copied' | 'failed') => {
    setToast(kind);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const shared = buildSharedState(usePlaygroundStore.getState());
      const param = await encodeShareParam(shared);
      const url = new URL(window.location.href);
      url.searchParams.set('state', param);
      await navigator.clipboard.writeText(url.toString());
      showToast('copied');
    } catch (err) {
      console.warn('[playground] Share failed:', err);
      showToast('failed');
    }
  }, [showToast]);

  const handleExecute = useCallback(
    (scenario: SimulationScenario) => {
      sim.loadScenario(scenario);
      setRightPanelOpen(true);
    },
    [sim],
  );

  const hasFunctions = addedSlugs.some(
    (slug) => (functionsBySlug[slug]?.length ?? 0) > 0,
  );
  const placingName = placingSlug
    ? (allMeta.find((m) => m.slug === placingSlug)?.name ?? placingSlug)
    : null;

  return (
    <>
      <SEOHead
        title={t('playground.title', 'Playground')}
        description="Compose smart contracts and simulate interactions"
        slug="playground"
      />

      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* ── Left panel: Contract palette (desktop) ──── */}
        <div
          className={cn(
            'shrink-0 w-[280px] border-r border-[var(--erc-color-border)]',
            'bg-[var(--erc-color-bg-secondary)] flex-col',
            'hidden md:flex',
          )}
        >
          <div className="px-3 py-3 border-b border-[var(--erc-color-border)]">
            <h1 className="text-sm font-semibold text-[var(--erc-color-text-primary)]">
              {t('playground.title', 'Playground')}
            </h1>
            <p className="text-[11px] text-[var(--erc-color-text-muted)] mt-0.5">
              {t('playground.subtitle', 'Compose contracts & test interactions')}
            </p>
          </div>
          <Suspense
            fallback={
              <div className="p-3 flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-8 rounded-lg bg-[var(--erc-color-bg-tertiary)] animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <ContractPalette
              addedSlugs={store.addedSlugs}
              onAdd={(slug) => void handleAdd(slug)}
              onRemove={store.removeEntry}
              testIdPrefix="palette"
              hint={t(
                'playground.dragHint',
                'Drag an item onto the canvas, or click Add',
              )}
            />
          </Suspense>
        </div>

        {/* ── Center: Flow canvas ──── */}
        <div className="flex-1 relative">
          {/* Mobile: open palette (bottom sheet) */}
          <button
            type="button"
            data-testid="playground-open-palette"
            onClick={() => setPaletteOpen(true)}
            className={cn(
              'md:hidden absolute bottom-4 left-4 z-20',
              'flex items-center gap-1.5 px-3 py-2 rounded-full shadow-lg',
              'bg-[var(--erc-color-accent)] text-white text-xs font-medium',
            )}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {t('playground.openPalette', 'Add contracts')}
          </button>

          {/* Mobile: open simulation panel */}
          {store.nodes.length > 0 && (
            <div className="md:hidden absolute top-3 right-3 z-20 flex gap-1.5">
              <button
                type="button"
                onClick={() => setRightPanelOpen((v) => !v)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium',
                  'bg-[var(--erc-color-bg-secondary)] border border-[var(--erc-color-border)]',
                  'text-[var(--erc-color-text-secondary)]',
                )}
              >
                {rightPanelOpen
                  ? t('playground.close', 'Close')
                  : t('playground.simulate', 'Simulate')}
              </button>
            </div>
          )}

          {/* Tap-to-place hint banner */}
          {placingSlug && (
            <div
              data-testid="placing-hint"
              className={cn(
                'absolute top-3 left-1/2 -translate-x-1/2 z-30',
                'flex items-center gap-2.5 px-3 py-2 rounded-lg shadow-lg max-w-[90%]',
                'bg-[var(--erc-color-bg-secondary)] border border-[var(--erc-color-accent)]/40',
              )}
            >
              <span className="text-xs text-[var(--erc-color-text-primary)]">
                {t('playground.tapToPlace', {
                  name: placingName,
                  defaultValue: 'Tap the canvas to place {{name}}',
                })}
              </span>
              <button
                type="button"
                onClick={() => setPlacingSlug(null)}
                className="text-xs font-medium text-[var(--erc-color-accent)] shrink-0"
              >
                {t('playground.cancel', 'Cancel')}
              </button>
            </div>
          )}

          {/* Share toast */}
          {toast && (
            <div
              data-testid="playground-toast"
              role="status"
              className={cn(
                'absolute bottom-6 left-1/2 -translate-x-1/2 z-30',
                'px-3.5 py-2 rounded-lg text-xs shadow-lg',
                'bg-[var(--erc-color-bg-secondary)] border border-[var(--erc-color-border)]',
                'text-[var(--erc-color-text-primary)]',
              )}
            >
              {toast === 'copied'
                ? t('playground.linkCopied', 'Link copied to clipboard')
                : t('playground.shareFailed', 'Could not copy the link')}
            </div>
          )}

          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--erc-color-accent)] border-t-transparent rounded-full" />
              </div>
            }
          >
            <PlaygroundCanvas
              flowNodes={store.nodes}
              flowEdges={store.edges}
              highlightedNodes={sim.highlightedNodes}
              highlightedEdges={sim.highlightedEdges}
              onConnect={store.addEdge}
              onClear={store.clear}
              onShare={() => void handleShare()}
              onAddAt={(slug, position) => void handleAddAt(slug, position)}
              placingSlug={placingSlug}
              onLoadPreset={(slugs) => void handleLoadPreset(slugs)}
            />
          </Suspense>
        </div>

        {/* ── Right panel: Interactive simulation ──── */}
        <div
          className={cn(
            'shrink-0 w-[320px] border-l border-[var(--erc-color-border)]',
            'bg-[var(--erc-color-bg-secondary)] flex flex-col overflow-y-auto',
            'transition-transform duration-300',
            // On mobile: slide from right
            rightPanelOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0',
            // On desktop: always visible if there are contracts
            store.nodes.length === 0 && 'hidden',
            'fixed md:relative right-0 top-0 bottom-0 z-30 md:z-auto',
          )}
        >
          <div className="px-3 py-3 border-b border-[var(--erc-color-border)] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--erc-color-text-primary)]">
                {t('sim.interactive', 'Interactive')}
              </h2>
              <p className="text-[11px] text-[var(--erc-color-text-muted)] mt-0.5">
                {t('interactive.selectFunction', 'Select a function to simulate')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRightPanelOpen(false)}
              aria-label={t('playground.close', 'Close')}
              className="md:hidden p-1 text-[var(--erc-color-text-secondary)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {hasFunctions ? (
            <Suspense fallback={null}>
              <InteractivePanel
                functionsBySlug={functionsBySlug}
                groupOrder={addedSlugs}
                flowNodes={store.nodes}
                flowEdges={store.edges}
                onExecute={handleExecute}
                currentStep={sim.currentStepIndex}
                totalSteps={sim.totalSteps}
                isPlaying={sim.isPlaying}
                onPlay={sim.play}
                onPause={sim.pause}
                onStepForward={sim.stepForward}
                onStepBack={sim.stepBack}
                onReset={sim.reset}
              />
            </Suspense>
          ) : (
            <div className="p-4 text-center text-xs text-[var(--erc-color-text-muted)]">
              {t('playground.empty', 'Add contracts from the palette to get started')}
            </div>
          )}
        </div>

        {/* ── Mobile: palette bottom sheet ──── */}
        {paletteOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 z-40 bg-black/40"
              onClick={() => setPaletteOpen(false)}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t('playground.title', 'Playground')}
              data-testid="playground-palette-sheet"
              className={cn(
                'md:hidden fixed inset-x-0 bottom-0 z-50 h-[70vh]',
                'rounded-t-2xl border-t border-[var(--erc-color-border)]',
                'bg-[var(--erc-color-bg-secondary)] flex flex-col shadow-2xl',
              )}
            >
              <div className="relative flex items-center justify-between px-4 pt-3 pb-2 border-b border-[var(--erc-color-border)]">
                <div
                  className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--erc-color-border)]"
                  aria-hidden="true"
                />
                <h2 className="text-sm font-semibold text-[var(--erc-color-text-primary)]">
                  {t('playground.openPalette', 'Add contracts')}
                </h2>
                <button
                  type="button"
                  data-testid="playground-close-palette"
                  onClick={() => setPaletteOpen(false)}
                  aria-label={t('playground.close', 'Close')}
                  className="p-1 text-[var(--erc-color-text-secondary)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <p className="px-4 pt-2 text-[10px] text-[var(--erc-color-text-muted)]">
                {t(
                  'playground.tapHint',
                  'Tap an item, then tap the canvas to place it',
                )}
              </p>
              <div className="flex-1 min-h-0">
                <Suspense fallback={null}>
                  <ContractPalette
                    addedSlugs={store.addedSlugs}
                    onAdd={handleArmPlacement}
                    onRemove={store.removeEntry}
                    testIdPrefix="mpalette"
                  />
                </Suspense>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
