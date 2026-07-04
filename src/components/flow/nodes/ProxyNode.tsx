import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface ProxyNodeData {
  label: string;
  implementation?: string;
  [key: string]: unknown;
}

/**
 * ProxyNode
 *
 * Represents a proxy contract (e.g. ERC-1967 transparent or UUPS proxy) that
 * delegates calls to an implementation address. Rendered with a dashed border
 * to visually communicate the delegation / indirection pattern.
 */
function ProxyNode({ data, selected }: NodeProps) {
  // Non-suspending: nodes render deep inside the React Flow canvas, where a
  // suspend would blank the whole diagram; the legend key shares the badge's
  // wording ("Proxy") and the defaultValue bridges the namespace load.
  const { t } = useTranslation('simulation', { useSuspense: false });
  const { label, implementation, highlighted } = data as ProxyNodeData & { highlighted?: boolean };
  const isHighlighted = highlighted === true;

  const shortImpl =
    implementation && implementation.length > 12
      ? `${implementation.slice(0, 6)}…${implementation.slice(-4)}`
      : implementation;

  return (
    <div
      aria-label={`Proxy contract: ${label}${implementation ? `, delegates to ${implementation}` : ''}`}
      style={{
        minWidth: 200,
        background: 'var(--erc-color-node-bg)',
        // Dashed border is the primary visual signal for delegation
        border: `1.5px dashed ${
          isHighlighted ? 'var(--erc-color-category-proxy)' : selected ? 'var(--erc-color-category-proxy)' : 'var(--erc-color-node-border)'
        }`,
        borderRadius: '0.5rem',
        boxShadow: isHighlighted
          ? '0 0 12px 2px var(--erc-color-category-proxy), 0 0 0 2px var(--erc-color-category-proxy)'
          : selected
            ? '0 0 0 2px var(--erc-color-category-proxy)'
            : '0 2px 8px rgba(0,0,0,0.35)',
        fontFamily: 'var(--erc-font-body)',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 0.75rem',
          borderBottom: '1px dashed var(--erc-color-node-border)',
          background: 'rgba(168,85,247,0.08)',
        }}
      >
        {/* Proxy / redirect icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          {/* Arrow curving right — symbolises delegation */}
          <path
            d="M2 8h8M7 5l3 3-3 3"
            stroke="var(--erc-color-category-proxy)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 3v10"
            stroke="var(--erc-color-category-proxy)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="2 2"
          />
        </svg>

        <span
          style={{
            fontWeight: 700,
            fontSize: '0.875rem',
            color: 'var(--erc-color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>

        {/* "proxy" badge */}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--erc-color-category-proxy)',
            border: '1px solid var(--erc-color-category-proxy)',
            borderRadius: '0.2rem',
            padding: '0.05rem 0.3rem',
            flexShrink: 0,
          }}
        >
          {t('legend.proxy', 'proxy')}
        </span>
      </div>

      {/* Implementation address row */}
      {shortImpl && (
        <div
          style={{
            padding: '0.35rem 0.75rem 0.45rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0, opacity: 0.6 }}
          >
            <path
              d="M2 6h8M7 3l3 3-3 3"
              stroke="var(--erc-color-text-muted)"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            title={implementation}
            style={{
              fontSize: '0.6875rem',
              color: 'var(--erc-color-text-muted)',
              fontFamily: 'var(--erc-font-mono)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {shortImpl}
          </span>
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        aria-label="Input connection"
        style={{
          background: 'var(--erc-color-category-proxy)',
          border: '2px solid var(--erc-color-node-bg)',
          width: 10,
          height: 10,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        aria-label="Output connection"
        style={{
          background: 'var(--erc-color-category-proxy)',
          border: '2px solid var(--erc-color-node-bg)',
          width: 10,
          height: 10,
        }}
      />
    </div>
  );
}

export default memo(ProxyNode);
