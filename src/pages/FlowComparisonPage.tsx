import { Suspense, lazy, useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { entry as erc20Entry } from '@/data/standards/erc20';
import { cn } from '@/utils/cn';

const FlowCanvas = lazy(() => import('@/components/flow/FlowCanvas'));

// ---------------------------------------------------------------------------
// Shared spinner fallback
// ---------------------------------------------------------------------------

function Spinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[var(--erc-color-border)] border-t-[var(--erc-color-accent)] rounded-full" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Variant card wrapper
// ---------------------------------------------------------------------------

function VariantCard({
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
      <div className="relative">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Variant A: Fullscreen Modal
// ---------------------------------------------------------------------------

function VariantA() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <VariantCard
      label="A — Fullscreen Modal"
      description="Click the button to open the flow diagram in a fullscreen overlay. Best for focused exploration without page distractions."
    >
      <div className="h-[300px] relative">
        <Suspense fallback={<Spinner />}>
          <FlowCanvas
            flowNodes={erc20Entry.flowNodes}
            flowEdges={erc20Entry.flowEdges}
            elkLayoutOptions={erc20Entry.elkLayoutOptions}
          />
        </Suspense>
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute top-3 right-3 z-10 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--erc-color-accent)] text-white hover:opacity-90 transition-opacity"
        >
          Fullscreen
        </button>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[var(--erc-color-bg-primary)]">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--erc-color-accent)] text-white hover:opacity-90 transition-opacity"
            >
              Exit Fullscreen
            </button>
          </div>
          <Suspense fallback={<Spinner />}>
            <FlowCanvas
              flowNodes={erc20Entry.flowNodes}
              flowEdges={erc20Entry.flowEdges}
              elkLayoutOptions={erc20Entry.elkLayoutOptions}
            />
          </Suspense>
        </div>
      )}
    </VariantCard>
  );
}

// ---------------------------------------------------------------------------
// Variant B: Resizable Container
// ---------------------------------------------------------------------------

function VariantB() {
  const [height, setHeight] = useState(400);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    startH.current = height;
    e.preventDefault();
  }, [height]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientY - startY.current;
      setHeight(Math.max(200, Math.min(900, startH.current + delta)));
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <VariantCard
      label="B — Resizable Container"
      description="Drag the bottom handle to resize the diagram container. Allows users to choose their preferred viewing size."
    >
      <div style={{ height }} className="relative">
        <Suspense fallback={<Spinner />}>
          <FlowCanvas
            flowNodes={erc20Entry.flowNodes}
            flowEdges={erc20Entry.flowEdges}
            elkLayoutOptions={erc20Entry.elkLayoutOptions}
          />
        </Suspense>
      </div>
      {/* Resize handle */}
      <div
        onMouseDown={onMouseDown}
        className="h-3 cursor-ns-resize bg-[var(--erc-color-bg-tertiary)] border-t border-[var(--erc-color-border)] flex items-center justify-center hover:bg-[var(--erc-color-accent)]/10 transition-colors"
      >
        <div className="w-10 h-1 rounded-full bg-[var(--erc-color-text-muted)] opacity-50" />
      </div>
      <div className="px-4 py-2 text-xs text-[var(--erc-color-text-muted)] text-center">
        Current height: {height}px
      </div>
    </VariantCard>
  );
}

// ---------------------------------------------------------------------------
// Variant C: Split Pane (Overview + Zoomed Detail)
// ---------------------------------------------------------------------------

function VariantC() {
  return (
    <VariantCard
      label="C — Split Pane (Overview + Detail)"
      description="Left pane shows the full overview at min zoom. Right pane shows a zoomed-in detail view. Click nodes in the overview to focus the detail pane."
    >
      <div className="grid grid-cols-2 divide-x divide-[var(--erc-color-border)]">
        {/* Overview — smaller, shows full flow */}
        <div className="h-[400px] relative">
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 text-[10px] font-semibold uppercase bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-muted)] rounded">
            Overview
          </div>
          <Suspense fallback={<Spinner />}>
            <FlowCanvas
              flowNodes={erc20Entry.flowNodes}
              flowEdges={erc20Entry.flowEdges}
              elkLayoutOptions={erc20Entry.elkLayoutOptions}
            />
          </Suspense>
        </div>
        {/* Detail — zoomed in */}
        <div className="h-[400px] relative">
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 text-[10px] font-semibold uppercase bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-muted)] rounded">
            Detail (zoom in to read)
          </div>
          <Suspense fallback={<Spinner />}>
            <FlowCanvas
              flowNodes={erc20Entry.flowNodes}
              flowEdges={erc20Entry.flowEdges}
              elkLayoutOptions={erc20Entry.elkLayoutOptions}
            />
          </Suspense>
        </div>
      </div>
    </VariantCard>
  );
}

// ---------------------------------------------------------------------------
// Variant D: Tall Scrollable
// ---------------------------------------------------------------------------

function VariantD() {
  return (
    <VariantCard
      label="D — Tall Scrollable Container"
      description="Much larger container (800px) so nodes have more space. The page scrolls naturally to reveal the full diagram."
    >
      <div className="h-[800px]">
        <Suspense fallback={<Spinner />}>
          <FlowCanvas
            flowNodes={erc20Entry.flowNodes}
            flowEdges={erc20Entry.flowEdges}
            elkLayoutOptions={erc20Entry.elkLayoutOptions}
          />
        </Suspense>
      </div>
    </VariantCard>
  );
}

// ---------------------------------------------------------------------------
// Variant E: Step-by-Step Node Focus
// ---------------------------------------------------------------------------

function VariantE() {
  const nodeGroups = [
    { label: 'Step 1: User initiates transfer', nodeIds: ['user', 'fn-transfer'] },
    { label: 'Step 2: Contract processes', nodeIds: ['fn-transfer', 'erc20-contract', 'storage-balances'] },
    { label: 'Step 3: Token flow to recipient', nodeIds: ['erc20-contract', 'token-flow', 'recipient'] },
    { label: 'Step 4: Approve flow', nodeIds: ['user', 'fn-approve', 'erc20-contract', 'spender'] },
    { label: 'Step 5: TransferFrom via spender', nodeIds: ['spender', 'fn-transferFrom', 'erc20-contract', 'event-transfer'] },
  ];

  const [step, setStep] = useState(0);
  const group = nodeGroups[step];

  return (
    <VariantCard
      label="E — Step-by-Step Focus"
      description="Navigate through the flow one group of nodes at a time. Each step highlights the relevant nodes, making complex flows easier to follow."
    >
      {/* Step navigation */}
      <div className="px-4 py-3 border-b border-[var(--erc-color-border)] flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-2.5 py-1 text-xs font-medium rounded-md border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-primary)] disabled:opacity-40"
        >
          Prev
        </button>
        <span className="flex-1 text-sm font-medium text-[var(--erc-color-text-primary)] text-center">
          {group.label}
        </span>
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(nodeGroups.length - 1, s + 1))}
          disabled={step === nodeGroups.length - 1}
          className="px-2.5 py-1 text-xs font-medium rounded-md border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-primary)] disabled:opacity-40"
        >
          Next
        </button>
      </div>
      {/* Step dots */}
      <div className="flex justify-center gap-1.5 py-2">
        {nodeGroups.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i === step ? 'bg-[var(--erc-color-accent)]' : 'bg-[var(--erc-color-border)]',
            )}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>
      <div className="h-[400px]">
        <Suspense fallback={<Spinner />}>
          <FlowCanvas
            flowNodes={erc20Entry.flowNodes}
            flowEdges={erc20Entry.flowEdges}
            elkLayoutOptions={erc20Entry.elkLayoutOptions}
            highlightedNodes={group.nodeIds}
          />
        </Suspense>
      </div>
    </VariantCard>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FlowComparisonPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
      <header>
        <Link to="/" className="text-sm text-[var(--erc-color-accent)] hover:underline mb-2 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-2xl font-black text-[var(--erc-color-text-primary)]">
          Interaction Flow — Layout Comparison
        </h1>
        <p className="text-sm text-[var(--erc-color-text-secondary)] mt-2 max-w-2xl">
          5 different approaches to improve the Interaction Flow diagram readability.
          All use ERC-20 flow data. Compare and pick the best approach.
        </p>
      </header>

      <VariantA />
      <VariantB />
      <VariantC />
      <VariantD />
      <VariantE />
    </div>
  );
}
