import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getEntryBySlug, prefetchEntry } from '@/data/registry';
import type { ERCEntry } from '@/data/types';
import SEOHead from '@/components/common/SEOHead';
import SkeletonBlock from '@/components/common/SkeletonBlock';
import { useSimulation } from '@/features/simulation/useSimulation';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { EntryHeader, OverviewSections, RelatedEntriesSection } from './detail/EntrySections';
import { FunctionsSection } from './detail/FnCard';
import { FlowSection } from './detail/FlowSection';
import { SimulationDrawer } from './detail/SimulationDrawer';
import { SecuritySection } from './detail/SecuritySection';
import { CodeExamplesSection } from './detail/CodeExamplesSection';
import { ErrorsSection } from './detail/ErrorsSection';
import { GasNotesSection } from './detail/GasNotesSection';
import { ReferencesSection } from './detail/ReferencesSection';
import { CompositionSection } from './detail/CompositionSection';
import { TocRail, MobileToc, type TocItem } from './detail/TocRail';
import { PrevNextNav } from './detail/PrevNextNav';
import { ForceMountContext } from './detail/forceMountContext';
import NotFoundPage from './NotFoundPage';

// ---------------------------------------------------------------------------
// Hash deep-link helpers
// ---------------------------------------------------------------------------

function currentHashId(): string {
  return decodeURIComponent(window.location.hash.replace(/^#/, ''));
}

/** Scroll a section into view after the next two frames (commit + layout). */
function scrollToSection(id: string, behavior: ScrollBehavior): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' });
    });
  });
}

// ---------------------------------------------------------------------------
// Detail page content (loaded entry)
// ---------------------------------------------------------------------------

function EntryContent({ entry }: { entry: ERCEntry }) {
  // Load the entry-specific namespace (slug) for translated content fields
  const { t: tEntry } = useTranslation(entry.slug);
  const { t: tCommon } = useTranslation('common');
  const { t: tSim } = useTranslation('simulation');

  // Simulation engine
  const sim = useSimulation();

  // Hash deep-links (e.g. /erc165#functions): LazySection's observer never
  // fires for below-the-fold anchors on a cold load, so a hash forces every
  // lazy section to mount, then we scroll to the target after paint.
  // TOC navigation flips the same switch so offsets are final before the
  // smooth scroll starts.
  const [forceMountAll, setForceMountAll] = useState(() => currentHashId() !== '');

  // Initial mount only — EntryContent remounts per entry via key={slug}.
  useEffect(() => {
    const id = currentHashId();
    if (id) scrollToSection(id, 'auto');
  }, []);

  const handleTocNavigate = useCallback((id: string) => {
    setForceMountAll(true);
    scrollToSection(id, 'smooth');
    // Hash-only update: no router navigation, no scroll reset.
    window.history.replaceState(window.history.state, '', `#${id}`);
  }, []);

  // Fully reset simulation state (scenario selection, step, highlights,
  // results) when the entry changes so nothing bleeds across entries.
  useEffect(() => {
    useSimulationStore.setState({
      scenario: null,
      currentStepIndex: -1,
      isPlaying: false,
      params: {},
      stepResults: {},
      highlightedNodes: [],
      highlightedEdges: [],
      error: null,
    });
  }, [entry.slug]);

  // Build description for SEO using the translation key if possible
  const description = tEntry('short', { defaultValue: entry.shortDescription });

  // Schema v2 sections render only when their field is present.
  const composes = entry.entryType === 'protocol' ? entry.composes : undefined;
  const hasSecurity = Boolean(entry.security && entry.security.length > 0);
  const hasCodeExamples = Boolean(entry.codeExamples && entry.codeExamples.length > 0);
  const hasErrors = Boolean(entry.errors && entry.errors.length > 0);
  const hasGasNotes = Boolean(entry.gasNotes);
  const hasComposes = Boolean(composes && composes.length > 0);
  const hasReferences = Boolean(entry.references && entry.references.length > 0);

  // TOC lists only the sections present on this page, in DOM order.
  const tocItems = useMemo<TocItem[]>(() => {
    const items: TocItem[] = [
      { id: 'introduction', label: tCommon('detailUi.sections.introduction') },
      { id: 'design-purpose', label: tCommon('detailUi.sections.designPurpose') },
      { id: 'common-usage', label: tCommon('detailUi.sections.commonUsage') },
    ];
    if (entry.flowNodes.length > 0) items.push({ id: 'flow-diagram', label: tSim('flow.title') });
    if (entry.functions.length > 0)
      items.push({ id: 'functions', label: tCommon('detailUi.sections.functions') });
    if (hasSecurity) items.push({ id: 'security', label: tCommon('detailUi.sections.security') });
    if (hasCodeExamples)
      items.push({ id: 'code-examples', label: tCommon('detailUi.sections.codeExamples') });
    if (hasErrors) items.push({ id: 'errors', label: tCommon('detailUi.sections.errors') });
    if (hasGasNotes) items.push({ id: 'gas', label: tCommon('detailUi.sections.gas') });
    if (hasComposes)
      items.push({ id: 'composition', label: tCommon('detailUi.sections.composition') });
    if (hasReferences)
      items.push({ id: 'references', label: tCommon('detailUi.sections.references') });
    if (entry.relatedSlugs.length > 0)
      items.push({ id: 'related', label: tCommon('detailUi.sections.related') });
    return items;
  }, [
    entry,
    hasSecurity,
    hasCodeExamples,
    hasErrors,
    hasGasNotes,
    hasComposes,
    hasReferences,
    tCommon,
    tSim,
  ]);

  return (
    <ForceMountContext.Provider value={forceMountAll}>
      <SEOHead
        title={entry.name}
        description={description}
        slug={entry.slug}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* ── Page header ─────────────────────────────────────── */}
        <EntryHeader entry={entry} description={description} />

        {/* ── Mobile table of contents ────────────────────────── */}
        <MobileToc items={tocItems} onNavigate={handleTocNavigate} />

        {/* ── Content column + sticky TOC rail (lg+) ──────────── */}
        <div className="flex items-start gap-8">
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Introduction / Design Purpose / Common Usage */}
            <OverviewSections entry={entry} tEntry={tEntry} />

            {/* Flow diagram — Resizable + Fullscreen */}
            {entry.flowNodes.length > 0 && (
              <FlowSection entry={entry} sim={sim} tCommon={tCommon} />
            )}

            {/* Functions list */}
            {entry.functions.length > 0 && (
              <FunctionsSection slug={entry.slug} functions={entry.functions} tEntry={tEntry} />
            )}

            {/* ── Schema v2 sections (render only when authored) ── */}
            {hasSecurity && (
              <SecuritySection slug={entry.slug} security={entry.security!} tEntry={tEntry} />
            )}
            {hasCodeExamples && (
              <CodeExamplesSection
                slug={entry.slug}
                codeExamples={entry.codeExamples!}
                tEntry={tEntry}
              />
            )}
            {hasErrors && (
              <ErrorsSection slug={entry.slug} errors={entry.errors!} tEntry={tEntry} />
            )}
            {hasGasNotes && (
              <GasNotesSection slug={entry.slug} gasNotes={entry.gasNotes!} tEntry={tEntry} />
            )}
            {hasComposes && (
              <CompositionSection slug={entry.slug} composes={composes!} tEntry={tEntry} />
            )}
            {hasReferences && <ReferencesSection references={entry.references!} />}

            {/* Related entries — always at the bottom */}
            {entry.relatedSlugs.length > 0 && (
              <RelatedEntriesSection slugs={entry.relatedSlugs} />
            )}

            {/* Prev/next entry navigation */}
            <PrevNextNav slug={entry.slug} />
          </div>

          <TocRail items={tocItems} onNavigate={handleTocNavigate} />
        </div>

        {/* ── Simulation — Slide-out drawer (all screens) ──── */}
        {entry.simulations.length > 0 && (
          <SimulationDrawer entry={entry} sim={sim} tCommon={tCommon} />
        )}
      </div>
    </ForceMountContext.Provider>
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

  // Scroll restoration: navigating to another entry must land at the top of
  // the scrollable main container (AppShell's <main id="main-content">) —
  // unless a hash deep-link targets a section (EntryContent scrolls to it).
  useEffect(() => {
    if (!window.location.hash) {
      document.getElementById('main-content')?.scrollTo(0, 0);
    }
  }, [slug]);

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
      {/* key remounts the content per entry so no local UI state (drawer,
          expanded cards, sim engine) carries over between entries */}
      <EntryContent key={entry.slug} entry={entry} />
    </div>
  );
}
