import { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { getEntryBySlug } from '@/data/registry';
import { allMeta } from '@/data/allMeta';
import type { ERCEntry, ContractFunction } from '@/data/types';
import SEOHead from '@/components/common/SEOHead';
import ExternalLink from '@/components/common/ExternalLink';
import SkeletonBlock from '@/components/common/SkeletonBlock';
import { cn } from '@/utils/cn';
import { useSimulation } from '@/features/simulation/useSimulation';
import NotFoundPage from './NotFoundPage';

// Lazy-load heavy components
const FlowCanvas = lazy(() => import('@/components/flow/FlowCanvas'));
const SimulationPanel = lazy(() => import('@/components/flow/panels/SimulationPanel'));

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

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
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
      <div className="px-5 py-4 border-b border-[var(--erc-color-border)]">
        <h2
          id={id ? `${id}-heading` : undefined}
          className="text-base font-semibold text-[var(--erc-color-text-primary)]"
        >
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </motion.section>
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

        {/* ── Two-column layout ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Introduction */}
            <Section id="introduction" title="Introduction">
              <p className="text-sm text-[var(--erc-color-text-secondary)] leading-relaxed whitespace-pre-line">
                {tEntry('introduction', { defaultValue: entry.introduction })}
              </p>
            </Section>

            {/* Design Purpose */}
            <Section id="design-purpose" title="Design Purpose">
              <p className="text-sm text-[var(--erc-color-text-secondary)] leading-relaxed whitespace-pre-line">
                {tEntry('designPurpose', { defaultValue: entry.designPurpose })}
              </p>
            </Section>

            {/* Common Usage */}
            <Section id="common-usage" title="Common Usage">
              <p className="text-sm text-[var(--erc-color-text-secondary)] leading-relaxed whitespace-pre-line">
                {tEntry('commonUsage', { defaultValue: entry.commonUsage })}
              </p>
            </Section>

            {/* Flow diagram */}
            {entry.flowNodes.length > 0 && (
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
                <div className="px-5 py-4 border-b border-[var(--erc-color-border)]">
                  <h2 id="flow-diagram-heading" className="text-base font-semibold text-[var(--erc-color-text-primary)]">
                    Interaction Flow
                  </h2>
                  <p className="text-xs text-[var(--erc-color-text-muted)] mt-0.5">
                    {tCommon('a11y.flowDiagram')}
                  </p>
                </div>
                <div className="h-[400px] sm:h-[500px]" aria-label={tCommon('a11y.flowDiagram')}>
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
                    />
                  </Suspense>
                </div>
              </motion.section>
            )}

            {/* Functions list */}
            {entry.functions.length > 0 && (
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
            )}
          </div>

          {/* Right sidebar column */}
          <div className="flex flex-col gap-4">
            {/* Simulation panel */}
            {entry.simulations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className={cn(
                  'rounded-2xl border border-[var(--erc-color-border)]',
                  'bg-[var(--erc-color-bg-secondary)]',
                  'overflow-hidden',
                )}
              >
                <div className="px-4 py-3.5 border-b border-[var(--erc-color-border)]">
                  <h2 className="text-sm font-semibold text-[var(--erc-color-text-primary)]">
                    Simulation
                  </h2>
                  <p className="text-xs text-[var(--erc-color-text-muted)] mt-0.5">
                    {tCommon('a11y.simulationPanel')}
                  </p>
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
                  <SimulationPanel
                    scenarios={entry.simulations}
                    activeScenarioId={sim.scenario?.id ?? null}
                    currentStep={Math.max(0, sim.currentStepIndex)}
                    isPlaying={sim.isPlaying}
                    paramValues={sim.params}
                    onScenarioChange={(id) => {
                      const s = entry.simulations.find((s) => s.id === id);
                      if (s) sim.loadScenario(s);
                    }}
                    onParamChange={sim.setParam}
                    onPlay={sim.play}
                    onPause={sim.pause}
                    onStepForward={sim.stepForward}
                    onStepBack={sim.stepBack}
                    onReset={sim.reset}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* Quick info card */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={cn(
                'rounded-2xl border border-[var(--erc-color-border)]',
                'bg-[var(--erc-color-bg-secondary)] p-4',
                'flex flex-col gap-3',
              )}
            >
              <h2 className="text-sm font-semibold text-[var(--erc-color-text-primary)]">
                Quick Info
              </h2>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--erc-color-text-muted)]">Type</dt>
                  <dd className="font-medium text-[var(--erc-color-text-secondary)] capitalize">{entry.entryType}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--erc-color-text-muted)]">Category</dt>
                  <dd className="font-medium text-[var(--erc-color-text-secondary)] capitalize">{entry.category}</dd>
                </div>
                {entry.entryType === 'standard' && (entry as { eipNumber?: number }).eipNumber && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--erc-color-text-muted)]">EIP Number</dt>
                    <dd className="font-medium text-[var(--erc-color-text-secondary)]">
                      {(entry as { eipNumber: number }).eipNumber}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--erc-color-text-muted)]">Functions</dt>
                  <dd className="font-medium text-[var(--erc-color-text-secondary)]">{entry.functions.length}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--erc-color-text-muted)]">Simulations</dt>
                  <dd className="font-medium text-[var(--erc-color-text-secondary)]">{entry.simulations.length}</dd>
                </div>
              </dl>
            </motion.div>

            {/* Related entries */}
            {entry.relatedSlugs.length > 0 && (
              <RelatedEntries slugs={entry.relatedSlugs} />
            )}
          </div>
        </div>
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

  useEffect(() => {
    if (!slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntry(null);
      return;
    }

    let cancelled = false;
    setEntry(undefined); // reset to loading state

    getEntryBySlug(slug).then((result) => {
      if (!cancelled) setEntry(result);
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Loading
  if (entry === undefined) {
    return <SkeletonBlock type="detail" />;
  }

  // Not found
  if (entry === null) {
    return <NotFoundPage />;
  }

  return <EntryContent entry={entry} />;
}
