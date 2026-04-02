import { Suspense, lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import { entry as erc20Entry } from '@/data/standards/erc20';
import { useSimulation } from '@/features/simulation/useSimulation';
import { cn } from '@/utils/cn';

const FlowCanvas = lazy(() => import('@/components/flow/FlowCanvas'));
const SimulationPanel = lazy(() => import('@/components/flow/panels/SimulationPanel'));

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

function Spinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[var(--erc-color-border)] border-t-[var(--erc-color-accent)] rounded-full" />
    </div>
  );
}

function SimSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-10 rounded-lg bg-[var(--erc-color-bg-tertiary)] animate-pulse" />
      ))}
    </div>
  );
}

function LayoutCard({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--erc-color-border)]">
        <h2 className="text-base font-semibold text-[var(--erc-color-text-primary)]">{label}</h2>
        <p className="text-xs text-[var(--erc-color-text-muted)] mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

// Shared simulation props builder
function useSimProps() {
  const sim = useSimulation();
  return {
    sim,
    panelProps: {
      scenarios: erc20Entry.simulations,
      activeScenarioId: sim.scenario?.id ?? null,
      currentStep: sim.currentStepIndex,
      isPlaying: sim.isPlaying,
      paramValues: sim.params,
      onScenarioChange: (id: string) => {
        const s = erc20Entry.simulations.find((s) => s.id === id);
        if (s) sim.loadScenario(s);
      },
      onParamChange: sim.setParam,
      onPlay: sim.play,
      onPause: sim.pause,
      onStepForward: sim.stepForward,
      onStepBack: sim.stepBack,
      onReset: sim.reset,
    },
  };
}

// ---------------------------------------------------------------------------
// Layout A: Bottom Panel
// ---------------------------------------------------------------------------

function LayoutA() {
  const { sim, panelProps } = useSimProps();

  return (
    <LayoutCard
      label="A — Bottom Panel"
      description="Flow diagram on top (full width), Simulation controls below. Both visible simultaneously with minimal eye travel."
    >
      <div className="h-[400px]">
        <Suspense fallback={<Spinner />}>
          <FlowCanvas
            flowNodes={erc20Entry.flowNodes}
            flowEdges={erc20Entry.flowEdges}
            elkLayoutOptions={erc20Entry.elkLayoutOptions}
            highlightedNodes={sim.highlightedNodes}
            highlightedEdges={sim.highlightedEdges}
          />
        </Suspense>
      </div>
      <div className="border-t border-[var(--erc-color-border)]">
        <Suspense fallback={<SimSkeleton />}>
          <SimulationPanel {...panelProps} />
        </Suspense>
      </div>
    </LayoutCard>
  );
}

// ---------------------------------------------------------------------------
// Layout B: Floating Overlay
// ---------------------------------------------------------------------------

function LayoutB() {
  const { sim, panelProps } = useSimProps();
  const [overlayVisible, setOverlayVisible] = useState(true);

  return (
    <LayoutCard
      label="B — Floating Overlay"
      description="Flow diagram takes full width. Simulation panel floats as a positioned overlay on top of the diagram, toggleable."
    >
      <div className="h-[500px] relative">
        <Suspense fallback={<Spinner />}>
          <FlowCanvas
            flowNodes={erc20Entry.flowNodes}
            flowEdges={erc20Entry.flowEdges}
            elkLayoutOptions={erc20Entry.elkLayoutOptions}
            highlightedNodes={sim.highlightedNodes}
            highlightedEdges={sim.highlightedEdges}
          />
        </Suspense>

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setOverlayVisible((v) => !v)}
          className="absolute top-3 right-3 z-20 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--erc-color-accent)] text-white hover:opacity-90 transition-opacity"
        >
          {overlayVisible ? 'Hide Simulation' : 'Show Simulation'}
        </button>

        {/* Floating simulation panel */}
        {overlayVisible && (
          <div className="absolute bottom-3 right-3 z-10 w-[320px] max-h-[420px] overflow-auto rounded-xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] shadow-lg">
            <Suspense fallback={<SimSkeleton />}>
              <SimulationPanel {...panelProps} />
            </Suspense>
          </div>
        )}
      </div>
    </LayoutCard>
  );
}

// ---------------------------------------------------------------------------
// Layout C: Side-by-Side 50/50
// ---------------------------------------------------------------------------

function LayoutC() {
  const { sim, panelProps } = useSimProps();

  return (
    <LayoutCard
      label="C — Side-by-Side 50/50"
      description="Equal-width columns: Flow on the left, Simulation on the right. Both large enough to use comfortably."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--erc-color-border)]">
        <div className="h-[450px]">
          <Suspense fallback={<Spinner />}>
            <FlowCanvas
              flowNodes={erc20Entry.flowNodes}
              flowEdges={erc20Entry.flowEdges}
              elkLayoutOptions={erc20Entry.elkLayoutOptions}
              highlightedNodes={sim.highlightedNodes}
              highlightedEdges={sim.highlightedEdges}
            />
          </Suspense>
        </div>
        <div className="max-h-[450px] overflow-auto">
          <Suspense fallback={<SimSkeleton />}>
            <SimulationPanel {...panelProps} />
          </Suspense>
        </div>
      </div>
    </LayoutCard>
  );
}

// ---------------------------------------------------------------------------
// Layout D: Tabbed View
// ---------------------------------------------------------------------------

function LayoutD() {
  const { sim, panelProps } = useSimProps();
  const [activeTab, setActiveTab] = useState<'flow' | 'simulation'>('flow');

  return (
    <LayoutCard
      label="D — Tabbed View"
      description="Two tabs sharing the same space: 'Flow' and 'Simulation'. Maximizes available space for each view but only one visible at a time."
    >
      {/* Tab buttons */}
      <div className="flex border-b border-[var(--erc-color-border)]">
        {(['flow', 'simulation'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'text-[var(--erc-color-accent)] border-b-2 border-[var(--erc-color-accent)] bg-[var(--erc-color-accent)]/5'
                : 'text-[var(--erc-color-text-muted)] hover:text-[var(--erc-color-text-primary)] hover:bg-[var(--erc-color-bg-tertiary)]',
            )}
          >
            {tab === 'flow' ? 'Interaction Flow' : 'Simulation'}
          </button>
        ))}
      </div>

      {activeTab === 'flow' ? (
        <div className="h-[450px]">
          <Suspense fallback={<Spinner />}>
            <FlowCanvas
              flowNodes={erc20Entry.flowNodes}
              flowEdges={erc20Entry.flowEdges}
              elkLayoutOptions={erc20Entry.elkLayoutOptions}
              highlightedNodes={sim.highlightedNodes}
              highlightedEdges={sim.highlightedEdges}
            />
          </Suspense>
        </div>
      ) : (
        <div className="min-h-[300px]">
          <Suspense fallback={<SimSkeleton />}>
            <SimulationPanel {...panelProps} />
          </Suspense>
        </div>
      )}
    </LayoutCard>
  );
}

// ---------------------------------------------------------------------------
// Layout E: Right Drawer
// ---------------------------------------------------------------------------

function LayoutE() {
  const { sim, panelProps } = useSimProps();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <LayoutCard
      label="E — Right Drawer"
      description="Flow diagram takes full width. Simulation slides in from the right as a collapsible drawer panel."
    >
      <div className="relative h-[500px] overflow-hidden">
        {/* Flow canvas — shrinks when drawer opens */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{ right: drawerOpen ? 320 : 0 }}
        >
          <Suspense fallback={<Spinner />}>
            <FlowCanvas
              flowNodes={erc20Entry.flowNodes}
              flowEdges={erc20Entry.flowEdges}
              elkLayoutOptions={erc20Entry.elkLayoutOptions}
              highlightedNodes={sim.highlightedNodes}
              highlightedEdges={sim.highlightedEdges}
            />
          </Suspense>
        </div>

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          className={cn(
            'absolute top-3 z-20 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--erc-color-accent)] text-white hover:opacity-90 transition-all duration-300',
            drawerOpen ? 'right-[328px]' : 'right-3',
          )}
        >
          {drawerOpen ? 'Close' : 'Simulation'}
        </button>

        {/* Drawer */}
        <div
          className={cn(
            'absolute top-0 bottom-0 right-0 w-[320px] border-l border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] transition-transform duration-300 overflow-auto',
            drawerOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <Suspense fallback={<SimSkeleton />}>
            <SimulationPanel {...panelProps} />
          </Suspense>
        </div>
      </div>
    </LayoutCard>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SimulationLayoutComparisonPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
      <header>
        <Link to="/" className="text-sm text-[var(--erc-color-accent)] hover:underline mb-2 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-2xl font-black text-[var(--erc-color-text-primary)]">
          Simulation Layout — Comparison
        </h1>
        <p className="text-sm text-[var(--erc-color-text-secondary)] mt-2 max-w-2xl">
          5 different layouts for positioning the Simulation panel relative to the Interaction Flow diagram.
          All use ERC-20 data. Each layout has its own simulation state — select a scenario and try the controls.
        </p>
      </header>

      <LayoutA />
      <LayoutB />
      <LayoutC />
      <LayoutD />
      <LayoutE />
    </div>
  );
}
