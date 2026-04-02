import { useState } from 'react';
import { Panel } from '@xyflow/react';

// ─── Legend data ──────────────────────────────────────────────────────────────

interface LegendItem {
  color: string;
  label: string;
  description?: string;
}

const NODE_LEGEND: LegendItem[] = [
  {
    color: 'var(--erc-color-accent)',
    label: 'Contract',
    description: 'Smart contract',
  },
  {
    color: 'var(--erc-color-text-secondary)',
    label: 'Function',
    description: 'Contract function',
  },
  {
    color: 'var(--erc-color-category-account)',
    label: 'User',
    description: 'External account / EOA',
  },
  {
    color: 'var(--erc-color-category-proxy)',
    label: 'Proxy',
    description: 'Delegating proxy contract',
  },
  {
    color: 'var(--erc-color-category-defi)',
    label: 'Storage',
    description: 'On-chain storage slots',
  },
  {
    color: 'var(--erc-color-category-token)',
    label: 'Token Flow',
    description: 'Token transfer event',
  },
];

const EDGE_LEGEND: Array<LegendItem & { dashed?: boolean; thick?: boolean }> = [
  {
    color: 'var(--erc-color-edge-animated)',
    label: 'Animated',
    description: 'Animated call flow',
    dashed: true,
  },
  {
    color: 'var(--erc-color-border)',
    label: 'Labeled',
    description: 'Edge with a label',
  },
  {
    color: 'var(--erc-color-category-token)',
    label: 'Fund Flow',
    description: 'Token / ETH transfer',
    thick: true,
  },
];

const FN_TYPE_LEGEND: LegendItem[] = [
  {
    color: 'var(--erc-color-fn-read)',
    label: 'read',
    description: 'View / pure function',
  },
  {
    color: 'var(--erc-color-fn-write)',
    label: 'write',
    description: 'State-mutating function',
  },
  {
    color: 'var(--erc-color-fn-event)',
    label: 'event',
    description: 'Emitted event',
  },
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

function NodeLegendRow({ item }: { item: LegendItem }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.15rem 0',
      }}
      title={item.description}
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
        {item.label}
      </span>
    </div>
  );
}

function EdgeLegendRow({
  item,
}: {
  item: LegendItem & { dashed?: boolean; thick?: boolean };
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.15rem 0',
      }}
      title={item.description}
    >
      {/* Miniature edge line */}
      <svg
        width="24"
        height="8"
        viewBox="0 0 24 8"
        fill="none"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
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
        {item.label}
      </span>
    </div>
  );
}

function FnTypeLegendRow({ item }: { item: LegendItem }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.15rem 0',
      }}
      title={item.description}
    >
      {/* Pill badge mirroring FunctionNode badge */}
      <span
        style={{
          fontSize: '0.55rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: item.color,
          border: `1px solid ${item.color}`,
          borderRadius: '0.2rem',
          padding: '0.05rem 0.3rem',
          lineHeight: 1.5,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {item.label}
      </span>
      <span
        style={{
          fontSize: '0.6875rem',
          color: 'var(--erc-color-text-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        {item.description}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * LegendPanel
 *
 * A collapsible React Flow Panel rendered in the bottom-right corner. Documents
 * all node types, edge types, and function type badges so users can interpret
 * the diagram without external documentation.
 */
export default function LegendPanel() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Panel position="bottom-right" style={{ margin: '0.75rem' }}>
      <div
        role="complementary"
        aria-label="Flow diagram legend"
        style={{
          minWidth: '160px',
          background: 'var(--erc-color-bg-secondary)',
          border: '1px solid var(--erc-color-border)',
          borderRadius: '0.5rem',
          fontFamily: 'var(--erc-font-body)',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
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
              <circle
                cx="4.5"
                cy="4.5"
                r="3"
                stroke="var(--erc-color-accent)"
                strokeWidth="1.25"
              />
              <path
                d="M7 6.5l3.5 3.5M9 8.5l1 1"
                stroke="var(--erc-color-accent)"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
            Legend
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
            }}
          >
            {/* Node types */}
            <section aria-label="Node types">
              <SectionTitle>Nodes</SectionTitle>
              {NODE_LEGEND.map((item) => (
                <NodeLegendRow key={item.label} item={item} />
              ))}
            </section>

            {/* Edge types */}
            <section aria-label="Edge types">
              <SectionTitle>Edges</SectionTitle>
              {EDGE_LEGEND.map((item) => (
                <EdgeLegendRow key={item.label} item={item} />
              ))}
            </section>

            {/* Function type badges */}
            <section aria-label="Function types">
              <SectionTitle>Functions</SectionTitle>
              {FN_TYPE_LEGEND.map((item) => (
                <FnTypeLegendRow key={item.label} item={item} />
              ))}
            </section>
          </div>
        )}
      </div>
    </Panel>
  );
}
