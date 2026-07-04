import { useState } from 'react';
import { Panel } from '@xyflow/react';
import { useTranslation } from 'react-i18next';

// ─── Legend data ──────────────────────────────────────────────────────────────
// Labels/descriptions are simulation-namespace i18n keys; the same
// legend.*Desc keys back the node-click popover's type descriptions.

interface LegendItem {
  color: string;
  labelKey: string;
  descKey: string;
}

const NODE_LEGEND: LegendItem[] = [
  { color: 'var(--erc-color-accent)', labelKey: 'legend.contract', descKey: 'legend.contractDesc' },
  { color: 'var(--erc-color-text-secondary)', labelKey: 'legend.function', descKey: 'legend.functionDesc' },
  { color: 'var(--erc-color-category-account)', labelKey: 'legend.user', descKey: 'legend.userDesc' },
  { color: 'var(--erc-color-category-proxy)', labelKey: 'legend.proxy', descKey: 'legend.proxyDesc' },
  { color: 'var(--erc-color-category-defi)', labelKey: 'legend.storage', descKey: 'legend.storageDesc' },
  { color: 'var(--erc-color-category-token)', labelKey: 'legend.tokenFlow', descKey: 'legend.tokenFlowDesc' },
];

const EDGE_LEGEND: Array<LegendItem & { dashed?: boolean; thick?: boolean }> = [
  { color: 'var(--erc-color-edge-animated)', labelKey: 'legend.animated', descKey: 'legend.animatedDesc', dashed: true },
  { color: 'var(--erc-color-border)', labelKey: 'legend.labeled', descKey: 'legend.labeledDesc' },
  { color: 'var(--erc-color-category-token)', labelKey: 'legend.fundFlow', descKey: 'legend.fundFlowDesc', thick: true },
];

// Badge text stays the literal Solidity-ish term (read/write/event) — code
// vocabulary is not translated; only the description is.
const FN_TYPE_LEGEND: Array<{ color: string; badge: string; descKey: string }> = [
  { color: 'var(--erc-color-fn-read)', badge: 'read', descKey: 'legend.readDesc' },
  { color: 'var(--erc-color-fn-write)', badge: 'write', descKey: 'legend.writeDesc' },
  { color: 'var(--erc-color-fn-event)', badge: 'event', descKey: 'legend.eventDesc' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: '0 0 0.35rem',
        fontSize: '0.625rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: 'var(--erc-color-text-muted)',
      }}
    >
      {children}
    </p>
  );
}

function NodeLegendRow({ item, label, description }: { item: LegendItem; label: string; description: string }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.15rem 0' }}
      title={description}
    >
      {/* Colour swatch — small rounded square to represent a node */}
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '2px',
          background: item.color,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <span
        style={{
          fontSize: '0.6875rem',
          color: 'var(--erc-color-text-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function EdgeLegendRow({
  item,
  label,
  description,
}: {
  item: LegendItem & { dashed?: boolean; thick?: boolean };
  label: string;
  description: string;
}) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.15rem 0' }}
      title={description}
    >
      {/* Miniature edge line */}
      <svg width="24" height="8" viewBox="0 0 24 8" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <line
          x1="0"
          y1="4"
          x2="20"
          y2="4"
          stroke={item.color}
          strokeWidth={item.thick ? 3 : 1.5}
          strokeDasharray={item.dashed ? '4 4' : undefined}
          strokeLinecap="round"
        />
        {/* Arrow head */}
        <path
          d="M17 1.5L21 4l-4 2.5"
          stroke={item.color}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span
        style={{
          fontSize: '0.6875rem',
          color: 'var(--erc-color-text-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function FnTypeLegendRow({ color, badge, description }: { color: string; badge: string; description: string }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.15rem 0' }}
      title={description}
    >
      {/* Pill badge mirroring FunctionNode badge */}
      <span
        style={{
          fontSize: '0.55rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color,
          border: `1px solid ${color}`,
          borderRadius: '0.2rem',
          padding: '0.05rem 0.3rem',
          lineHeight: 1.5,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {badge}
      </span>
      <span
        style={{
          fontSize: '0.6875rem',
          color: 'var(--erc-color-text-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        {description}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * LegendPanel
 *
 * A collapsible React Flow Panel (top-left, clear of Controls/MiniMap).
 * Documents all node types, edge types, and function type badges so users can
 * interpret the diagram without external documentation. Defaults to collapsed
 * on <lg screens where canvas space is scarce.
 */
export default function LegendPanel() {
  const { t } = useTranslation('simulation');
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024,
  );

  return (
    <Panel position="top-left" style={{ margin: '0.75rem' }}>
      <div
        role="complementary"
        aria-label={t('legend.title')}
        style={{
          minWidth: collapsed ? undefined : '160px',
          background: 'var(--erc-color-bg-secondary)',
          border: '1px solid var(--erc-color-border)',
          borderRadius: '0.5rem',
          fontFamily: 'var(--erc-font-body)',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls="legend-body"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            width: '100%',
            padding: '0.45rem 0.75rem',
            background: 'var(--erc-color-bg-tertiary)',
            border: 'none',
            borderBottom: collapsed ? 'none' : '1px solid var(--erc-color-border)',
            cursor: 'pointer',
            color: 'var(--erc-color-text-primary)',
            fontFamily: 'var(--erc-font-body)',
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {/* Key icon */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="4.5" cy="4.5" r="3" stroke="var(--erc-color-accent)" strokeWidth="1.25" />
              <path
                d="M7 6.5l3.5 3.5M9 8.5l1 1"
                stroke="var(--erc-color-accent)"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
            {t('legend.title')}
          </span>

          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            style={{
              transform: collapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          >
            <path
              d="M2.5 4.5l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Body */}
        {!collapsed && (
          <div
            id="legend-body"
            style={{
              padding: '0.6rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              maxHeight: '320px',
              overflowY: 'auto',
            }}
          >
            {/* Node types */}
            <section aria-label={t('legend.nodes')}>
              <SectionTitle>{t('legend.nodes')}</SectionTitle>
              {NODE_LEGEND.map((item) => (
                <NodeLegendRow
                  key={item.labelKey}
                  item={item}
                  label={t(item.labelKey)}
                  description={t(item.descKey)}
                />
              ))}
            </section>

            {/* Edge types */}
            <section aria-label={t('legend.edges')}>
              <SectionTitle>{t('legend.edges')}</SectionTitle>
              {EDGE_LEGEND.map((item) => (
                <EdgeLegendRow
                  key={item.labelKey}
                  item={item}
                  label={t(item.labelKey)}
                  description={t(item.descKey)}
                />
              ))}
            </section>

            {/* Function type badges */}
            <section aria-label={t('legend.functions')}>
              <SectionTitle>{t('legend.functions')}</SectionTitle>
              {FN_TYPE_LEGEND.map((item) => (
                <FnTypeLegendRow
                  key={item.badge}
                  color={item.color}
                  badge={item.badge}
                  description={t(item.descKey)}
                />
              ))}
            </section>
          </div>
        )}
      </div>
    </Panel>
  );
}
