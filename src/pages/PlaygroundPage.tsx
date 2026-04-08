import { Suspense, lazy, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getEntryBySlug } from '@/data/registry';
import { usePlaygroundStore } from '@/stores/usePlaygroundStore';
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

  const handleAdd = useCallback(
    async (slug: string) => {
      const entry = await getEntryBySlug(slug);
      if (entry) store.addEntry(slug, entry);
    },
    [store],
  );

  const handleExecute = useCallback(
    (scenario: SimulationScenario) => {
      sim.loadScenario(scenario);
      setRightPanelOpen(true);
    },
    [sim],
  );

  return (
    <>
      <SEOHead
        title={t('playground.title', 'Playground')}
        description="Compose smart contracts and simulate interactions"
        slug="playground"
      />

      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* ── Left panel: Contract palette ──── */}
        <div
          className={cn(
            'shrink-0 w-[280px] border-r border-[var(--erc-color-border)]',
            'bg-[var(--erc-color-bg-secondary)] flex flex-col',
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
              onAdd={handleAdd}
              onRemove={store.removeEntry}
            />
          </Suspense>
        </div>

        {/* ── Center: Flow canvas ──── */}
        <div className="flex-1 relative">
          {/* Mobile palette toggle */}
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
              {rightPanelOpen ? 'Close' : 'Simulate'}
            </button>
          </div>
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
              className="md:hidden p-1 text-[var(--erc-color-text-secondary)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {store.functions.length > 0 ? (
            <Suspense fallback={null}>
              <InteractivePanel
                functions={store.functions}
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
      </div>
    </>
  );
}
