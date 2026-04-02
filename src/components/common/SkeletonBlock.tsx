import { cn } from '@/utils/cn';

// ---------------------------------------------------------------------------
// Primitive pulse block
// ---------------------------------------------------------------------------

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[var(--erc-color-bg-tertiary)]',
        className,
      )}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Home skeleton — mirrors the hero + feature cards layout
// ---------------------------------------------------------------------------

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-10 p-8 max-w-5xl mx-auto w-full" role="status" aria-label="Loading home page">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 pt-12">
        <Pulse className="h-10 w-64 rounded-full" />
        <Pulse className="h-6 w-80" />
        <Pulse className="h-4 w-full max-w-2xl" />
        <Pulse className="h-4 w-5/6 max-w-2xl" />
        <div className="flex gap-3 mt-2">
          <Pulse className="h-11 w-36 rounded-full" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-6 rounded-xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)]">
            <Pulse className="h-8 w-24" />
            <Pulse className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3 p-6 rounded-xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)]">
            <Pulse className="h-10 w-10 rounded-lg" />
            <Pulse className="h-5 w-3/4" />
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-5/6" />
            <Pulse className="h-4 w-4/5" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail skeleton — mirrors the detail page layout
// ---------------------------------------------------------------------------

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 w-full" role="status" aria-label="Loading detail page">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Pulse className="h-6 w-20 rounded-full" />
          <Pulse className="h-6 w-16 rounded-full" />
        </div>
        <Pulse className="h-9 w-72" />
        <Pulse className="h-5 w-96 max-w-full" />
        <div className="flex gap-2 mt-1">
          <Pulse className="h-8 w-28 rounded-lg" />
          <Pulse className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Two-column area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Introduction section */}
          <div className="rounded-xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] p-6 flex flex-col gap-3">
            <Pulse className="h-6 w-40" />
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-5/6" />
            <Pulse className="h-4 w-4/5" />
          </div>

          {/* Flow chart area */}
          <div className="rounded-xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] overflow-hidden">
            <div className="p-4 border-b border-[var(--erc-color-border)]">
              <Pulse className="h-5 w-32" />
            </div>
            <Pulse className="h-80 w-full rounded-none" />
          </div>

          {/* Functions */}
          <div className="rounded-xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] p-6 flex flex-col gap-4">
            <Pulse className="h-6 w-36" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2 p-4 rounded-lg border border-[var(--erc-color-border)]">
                <div className="flex items-center gap-2">
                  <Pulse className="h-5 w-14 rounded-full" />
                  <Pulse className="h-5 w-40" />
                </div>
                <Pulse className="h-4 w-full" />
                <Pulse className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Simulation panel */}
          <div className="rounded-xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] p-4 flex flex-col gap-3">
            <Pulse className="h-5 w-28" />
            {[0, 1, 2].map((i) => (
              <Pulse key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>

          {/* Related */}
          <div className="rounded-xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] p-4 flex flex-col gap-3">
            <Pulse className="h-5 w-24" />
            {[0, 1, 2].map((i) => (
              <Pulse key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

interface SkeletonBlockProps {
  type?: 'home' | 'detail';
}

export default function SkeletonBlock({ type = 'home' }: SkeletonBlockProps) {
  return type === 'detail' ? <DetailSkeleton /> : <HomeSkeleton />;
}
