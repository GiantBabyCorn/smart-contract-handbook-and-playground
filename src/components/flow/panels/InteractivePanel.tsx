import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ContractFunction,
  FlowNodeDef,
  FlowEdgeDef,
  SimulationScenario,
} from '@/data/types';
import {
  buildInteractiveScenario,
  type InteractiveStepTemplates,
} from '@/features/simulation/InteractiveEngine';
import { allMeta } from '@/data/allMeta';
import { slugOfPlaygroundId } from '@/stores/usePlaygroundStore';
import { cn } from '@/utils/cn';
import ParamField from './ParamField';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InteractivePanelProps {
  /** Flat function list (detail-page drawer). Ignored when `functionsBySlug`
   *  is provided. */
  functions?: ContractFunction[];
  /** Playground: functions grouped per entry slug — rendered as collapsible
   *  per-contract groups. */
  functionsBySlug?: Record<string, ContractFunction[]>;
  /** Group ordering for `functionsBySlug` (defaults to object key order). */
  groupOrder?: string[];
  flowNodes: FlowNodeDef[];
  flowEdges: FlowEdgeDef[];
  onExecute: (scenario: SimulationScenario) => void;
  currentStep?: number;
  totalSteps?: number;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onStepForward?: () => void;
  onStepBack?: () => void;
  onReset?: () => void;
}

interface FnGroup {
  /** null in flat (single-entry) mode — renders without a group header. */
  slug: string | null;
  name: string | null;
  fns: ContractFunction[];
}

interface SelectedFn {
  key: string;
  fn: ContractFunction;
}

// ─── Constants / helpers ─────────────────────────────────────────────────────

const FN_TYPE_COLORS: Record<string, string> = {
  read: 'bg-[var(--erc-color-fn-read)]/10 text-[var(--erc-color-fn-read)] border-[var(--erc-color-fn-read)]/25',
  write: 'bg-[var(--erc-color-fn-write)]/10 text-[var(--erc-color-fn-write)] border-[var(--erc-color-fn-write)]/25',
  event: 'bg-[var(--erc-color-fn-event)]/10 text-[var(--erc-color-fn-event)] border-[var(--erc-color-fn-event)]/25',
};

// Re-render when lazily loaded entry namespaces arrive so node labels and
// step narration resolve as soon as their namespace is available.
const I18N_BIND_OPTIONS = { bindI18n: 'languageChanged loaded' };

/** Entry-content labels are authored as slug-prefixed keys
 *  ('erc20.node.user'); locale files store them flat per entry namespace. */
const ENTRY_KEY_RE = /^([a-z0-9-]+)\.((?:node|edge|fn|sim)\..+)$/;

const ENTRY_NAME_BY_SLUG = new Map(allMeta.map((m) => [m.slug, m.name]));

function fnKey(slug: string | null, fn: ContractFunction): string {
  return `${slug ?? 'fn'}:${fn.name}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ControlButton({
  onClick,
  disabled = false,
  ariaLabel,
  children,
  accent = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-md border shrink-0',
        'transition-all duration-150 p-0',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        accent
          ? 'border-[var(--erc-color-accent)] bg-[var(--erc-color-accent)] text-white'
          : 'border-[var(--erc-color-border)] bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-primary)]',
      )}
    >
      {children}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InteractivePanel({
  functions,
  functionsBySlug,
  groupOrder,
  flowNodes,
  flowEdges,
  onExecute,
  currentStep = -1,
  totalSteps = 0,
  isPlaying = false,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
}: InteractivePanelProps) {
  const { t, i18n } = useTranslation('common', I18N_BIND_OPTIONS);
  const [selected, setSelected] = useState<SelectedFn | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [hasExecuted, setHasExecuted] = useState(false);
  const [filter, setFilter] = useState('');
  const [collapsedSlugs, setCollapsedSlugs] = useState<Set<string>>(new Set());
  const [startNodeId, setStartNodeId] = useState<string | null>(null);
  const [localScenario, setLocalScenario] = useState<SimulationScenario | null>(
    null,
  );

  // ─── Grouping ──────────────────────────────────────────────────────────────

  const groups: FnGroup[] = useMemo(() => {
    if (functionsBySlug) {
      const order = groupOrder ?? Object.keys(functionsBySlug);
      return order
        .filter((slug) => (functionsBySlug[slug]?.length ?? 0) > 0)
        .map((slug) => ({
          slug,
          name: ENTRY_NAME_BY_SLUG.get(slug) ?? slug,
          fns: functionsBySlug[slug],
        }));
    }
    if (functions && functions.length > 0) {
      return [{ slug: null, name: null, fns: functions }];
    }
    return [];
  }, [functionsBySlug, groupOrder, functions]);

  // Load the entry namespaces so group labels / narration resolve.
  const groupSlugsKey = useMemo(
    () =>
      groups
        .map((g) => g.slug)
        .filter((s): s is string => s !== null)
        .sort()
        .join(','),
    [groups],
  );
  useEffect(() => {
    if (groupSlugsKey) void i18n.loadNamespaces(groupSlugsKey.split(','));
  }, [groupSlugsKey, i18n]);

  const filteredGroups: FnGroup[] = useMemo(() => {
    const query = filter.toLowerCase().trim();
    if (!query) return groups;
    return groups
      .map((g) => ({
        ...g,
        fns: g.fns.filter(
          (fn) =>
            fn.name.toLowerCase().includes(query) ||
            fn.signature.toLowerCase().includes(query),
        ),
      }))
      .filter((g) => g.fns.length > 0);
  }, [groups, filter]);

  // A selection whose entry was removed from the canvas is treated as none
  // (derived, not reset in an effect — the stale state is overwritten on the
  // next selection anyway).
  const activeSelected =
    selected &&
    groups.some((g) => g.fns.some((fn) => fnKey(g.slug, fn) === selected.key))
      ? selected
      : null;

  // ─── Entry point selection (playground: several user nodes may exist) ─────

  const userNodes = useMemo(
    () => flowNodes.filter((n) => n.type === 'user'),
    [flowNodes],
  );

  // Fall back to the first user node when nothing (or a since-removed node)
  // is selected.
  const effectiveStartNodeId =
    startNodeId && userNodes.some((n) => n.id === startNodeId)
      ? startNodeId
      : userNodes.length > 0
        ? userNodes[0].id
        : undefined;

  // ─── i18n resolution for labels & step narration ───────────────────────────

  const resolveLabel = useCallback(
    (raw: string): string => {
      const match = ENTRY_KEY_RE.exec(raw);
      if (!match) return raw;
      return t(match[2], { ns: match[1], defaultValue: raw });
    },
    [t],
  );

  const templates = useMemo<InteractiveStepTemplates>(
    () => ({
      startAt: (label) =>
        t('interactive.stepFrom', { label, defaultValue: 'Start from {{label}}' }),
      callReaches: (label) =>
        t('interactive.stepCall', { label, defaultValue: 'Call reaches {{label}}' }),
      updateStorage: (label) =>
        t('interactive.stepStorage', {
          label,
          defaultValue: 'Update storage: {{label}}',
        }),
      emitEvent: (label) =>
        t('interactive.stepEvent', { label, defaultValue: 'Emit event: {{label}}' }),
      interactWith: (label) =>
        t('interactive.stepInteract', {
          label,
          defaultValue: 'Interact with {{label}}',
        }),
    }),
    [t],
  );

  /** Option label for a user node: "ERC-20 · Alice (user)". */
  const userNodeLabel = useCallback(
    (node: FlowNodeDef): string => {
      const label = resolveLabel(node.label);
      const slug = slugOfPlaygroundId(node.id);
      const entryName = slug ? ENTRY_NAME_BY_SLUG.get(slug) : undefined;
      return entryName ? `${entryName} · ${label}` : label;
    },
    [resolveLabel],
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectFn = useCallback((slug: string | null, fn: ContractFunction) => {
    setSelected({ key: fnKey(slug, fn), fn });
    setHasExecuted(false);
    setLocalScenario(null);
    // Pre-fill params with defaults
    const defaults: Record<string, string> = {};
    for (const p of fn.params) {
      defaults[p.name] = fn.defaultSimValues?.[p.name] ?? '';
    }
    setParamValues(defaults);
  }, []);

  const handleParamChange = useCallback((id: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleGroup = useCallback((slug: string) => {
    setCollapsedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const handleExecute = useCallback(() => {
    if (!activeSelected) return;
    const scenario = buildInteractiveScenario(
      activeSelected.fn,
      flowNodes,
      flowEdges,
      paramValues,
      {
        startNodeId: effectiveStartNodeId,
        resolveLabel,
        templates,
      },
    );
    setHasExecuted(true);
    setLocalScenario(scenario);
    onExecute(scenario);
  }, [
    activeSelected,
    flowNodes,
    flowEdges,
    paramValues,
    effectiveStartNodeId,
    resolveLabel,
    templates,
    onExecute,
  ]);

  const progressPct =
    totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const showPlayback = activeSelected !== null && hasExecuted && totalSteps > 0;

  const currentStepDescription =
    showPlayback &&
    localScenario &&
    currentStep >= 0 &&
    currentStep < localScenario.steps.length
      ? localScenario.steps[currentStep].description
      : null;

  const showFilterEmptyState =
    filter.trim().length > 0 && filteredGroups.length === 0;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* ── Function list ──── */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[var(--erc-color-text-secondary)] uppercase tracking-wide">
          {t('interactive.selectFunction', 'Select Function')}
        </span>

        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('interactive.filterFunctions', 'Filter functions...')}
          data-testid="fn-filter"
          className={cn(
            'w-full rounded-md text-xs px-2.5 py-1.5',
            'bg-[var(--erc-color-bg-primary)] border border-[var(--erc-color-border)]',
            'text-[var(--erc-color-text-primary)] placeholder:text-[var(--erc-color-text-muted)]',
            'outline-none focus:border-[var(--erc-color-accent)] focus:ring-1 focus:ring-[var(--erc-color-accent)]',
          )}
        />

        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {showFilterEmptyState && (
            <p className="px-1 py-2 text-[11px] text-[var(--erc-color-text-muted)]">
              {t('interactive.noFunctions', 'No functions match your filter')}
            </p>
          )}
          {filteredGroups.map((group) => {
            const isCollapsed =
              group.slug !== null && collapsedSlugs.has(group.slug);
            return (
              <div key={group.slug ?? 'flat'} className="flex flex-col gap-1">
                {group.slug !== null && (
                  <button
                    type="button"
                    data-testid={`fn-group-${group.slug}`}
                    onClick={() => toggleGroup(group.slug!)}
                    aria-expanded={!isCollapsed}
                    className={cn(
                      'flex items-center gap-1.5 px-1.5 py-1 rounded-md text-left',
                      'text-[11px] font-semibold text-[var(--erc-color-text-secondary)]',
                      'hover:bg-[var(--erc-color-bg-tertiary)] transition-colors',
                    )}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      aria-hidden="true"
                      className={cn(
                        'shrink-0 transition-transform',
                        isCollapsed ? '-rotate-90' : '',
                      )}
                    >
                      <path
                        d="M2 3.5l3 3 3-3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="truncate">{group.name}</span>
                    <span className="ml-auto shrink-0 rounded-full bg-[var(--erc-color-bg-tertiary)] px-1.5 text-[9px] text-[var(--erc-color-text-muted)]">
                      {group.fns.length}
                    </span>
                  </button>
                )}
                {!isCollapsed &&
                  group.fns.map((fn) => {
                    const key = fnKey(group.slug, fn);
                    return (
                      <button
                        key={key}
                        type="button"
                        data-testid={
                          group.slug
                            ? `fn-item-${group.slug}-${fn.name}`
                            : `fn-item-${fn.name}`
                        }
                        onClick={() => handleSelectFn(group.slug, fn)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-left border transition-all',
                          activeSelected?.key === key
                            ? 'border-[var(--erc-color-accent)] bg-[var(--erc-color-accent)]/5'
                            : 'border-[var(--erc-color-border)] bg-[var(--erc-color-bg-primary)] hover:bg-[var(--erc-color-bg-tertiary)]',
                        )}
                      >
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border shrink-0',
                            FN_TYPE_COLORS[fn.type] ?? '',
                          )}
                        >
                          {fn.type}
                        </span>
                        <span className="text-xs font-mono text-[var(--erc-color-text-primary)] truncate">
                          {fn.name}
                        </span>
                      </button>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Entry point (shown when several user nodes are on the canvas) ──── */}
      {userNodes.length > 1 && (
        <div className="flex flex-col gap-1 border-t border-[var(--erc-color-border)] pt-3">
          <label
            htmlFor="interactive-entry-point"
            className="text-xs font-semibold text-[var(--erc-color-text-secondary)] uppercase tracking-wide"
          >
            {t('interactive.entryPoint', 'Entry point')}
          </label>
          <select
            id="interactive-entry-point"
            data-testid="entry-point-select"
            value={effectiveStartNodeId ?? ''}
            onChange={(e) => setStartNodeId(e.target.value)}
            className={cn(
              'w-full rounded-md text-xs px-2.5 py-1.5',
              'bg-[var(--erc-color-bg-primary)] border border-[var(--erc-color-border)]',
              'text-[var(--erc-color-text-primary)]',
              'outline-none focus:border-[var(--erc-color-accent)]',
            )}
          >
            {userNodes.map((node) => (
              <option key={node.id} value={node.id}>
                {userNodeLabel(node)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Param form ──── */}
      {activeSelected && activeSelected.fn.params.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-[var(--erc-color-border)] pt-3">
          <span className="text-xs font-semibold text-[var(--erc-color-text-secondary)] uppercase tracking-wide">
            {t('interactive.parameters', 'Parameters')}
          </span>
          {activeSelected.fn.params.map((p) => (
            <ParamField
              key={p.name}
              param={{
                id: p.name,
                label: `${p.name}: ${p.type}`,
                type:
                  p.type === 'bool'
                    ? 'bool'
                    : p.type === 'address'
                      ? 'address'
                      : 'uint256',
                defaultValue: activeSelected.fn.defaultSimValues?.[p.name] ?? '',
              }}
              value={paramValues[p.name] ?? ''}
              onChange={handleParamChange}
            />
          ))}
        </div>
      )}

      {/* ── Execute button ──── */}
      {activeSelected && (
        <button
          type="button"
          data-testid="interactive-execute"
          onClick={handleExecute}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'text-sm font-semibold transition-all duration-150',
            'bg-[var(--erc-color-accent)] text-white',
            'hover:opacity-90 active:scale-[0.98]',
          )}
        >
          {/* Play icon */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
          </svg>
          {t('interactive.execute', 'Execute')} {activeSelected.fn.name}
        </button>
      )}

      {/* ── Playback controls (shown after execution) ──── */}
      {showPlayback && (
        <div className="flex flex-col gap-2 border-t border-[var(--erc-color-border)] pt-3">
          {/* Progress bar */}
          <div className="flex items-center gap-2 text-[11px] text-[var(--erc-color-text-secondary)]">
            <span>
              {currentStep + 1} / {totalSteps}
            </span>
            <div className="flex-1 h-1 rounded-full bg-[var(--erc-color-bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--erc-color-accent)] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Step narration */}
          {currentStepDescription && (
            <p
              data-testid="interactive-step-desc"
              aria-live="polite"
              aria-label={t('interactive.currentStep', 'Current step')}
              className={cn(
                'text-xs leading-snug rounded-md px-2.5 py-2',
                'bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-secondary)]',
              )}
            >
              {currentStepDescription}
            </p>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <ControlButton
              onClick={onReset}
              ariaLabel={t('sim.reset', 'Reset')}
            >
              {/* Reset icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2 7a5 5 0 019.33-2.5M12 7a5 5 0 01-9.33 2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </ControlButton>

            <ControlButton
              onClick={onStepBack}
              disabled={currentStep <= 0}
              ariaLabel={t('sim.stepBack', 'Step back')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 11L4 7l5-4v8z" fill="currentColor" />
              </svg>
            </ControlButton>

            {isPlaying ? (
              <ControlButton
                onClick={onPause}
                ariaLabel={t('sim.pause', 'Pause')}
                accent
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="3" y="2" width="3" height="10" rx="0.5" fill="currentColor" />
                  <rect x="8" y="2" width="3" height="10" rx="0.5" fill="currentColor" />
                </svg>
              </ControlButton>
            ) : (
              <ControlButton
                onClick={onPlay}
                disabled={currentStep >= totalSteps - 1}
                ariaLabel={t('sim.play', 'Play')}
                accent
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
                </svg>
              </ControlButton>
            )}

            <ControlButton
              onClick={onStepForward}
              disabled={currentStep >= totalSteps - 1}
              ariaLabel={t('sim.stepForward', 'Step forward')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 3l5 4-5 4V3z" fill="currentColor" />
              </svg>
            </ControlButton>
          </div>
        </div>
      )}
    </div>
  );
}
