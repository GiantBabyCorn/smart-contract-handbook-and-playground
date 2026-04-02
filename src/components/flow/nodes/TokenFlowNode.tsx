import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface TokenFlowNodeData {
  label: string;
  symbol?: string;
  amount?: string;
  [key: string]: unknown;
}

/**
 * TokenFlowNode
 *
 * Represents a token transfer event within the flow diagram. Shows the token
 * symbol as a prominent badge and the amount in monospace. A right-pointing
 * arrow reinforces the directional "flow" metaphor.
 */
function TokenFlowNode({ data, selected }: NodeProps) {
  const { label, symbol, amount, highlighted } = data as TokenFlowNodeData & { highlighted?: boolean };
  const isHighlighted = highlighted === true;

  return (
    <div
      aria-label={`Token flow: ${label}${symbol ? ` (${symbol})` : ''}${amount ? `, amount ${amount}` : ''}`}
      style={{
        minWidth: 160,
        background: 'var(--erc-color-node-bg)',
        border: `1.5px solid ${
          isHighlighted ? 'var(--erc-color-category-token)' : selected ? 'var(--erc-color-category-token)' : 'var(--erc-color-node-border)'
        }`,
        borderRadius: '0.5rem',
        boxShadow: isHighlighted
          ? '0 0 12px 2px var(--erc-color-category-token), 0 0 0 2px var(--erc-color-category-token)'
          : selected
            ? '0 0 0 2px var(--erc-color-category-token)'
            : '0 2px 8px rgba(0,0,0,0.35)',
        fontFamily: 'var(--erc-font-body)',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Coloured left border stripe to hint at flow direction */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            width: '4px',
            background: 'var(--erc-color-category-token)',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />

        <div
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            background: 'rgba(34,197,94,0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
          }}
        >
          {/* Top row: label + symbol badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.4rem',
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: 'var(--erc-color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {label}
            </span>

            {symbol && (
              <span
                aria-label={`Token symbol: ${symbol}`}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--erc-color-category-token)',
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid var(--erc-color-category-token)',
                  borderRadius: '0.25rem',
                  padding: '0.05rem 0.35rem',
                  flexShrink: 0,
                  letterSpacing: '0.04em',
                }}
              >
                {symbol}
              </span>
            )}
          </div>

          {/* Amount row with flow arrow */}
          {amount && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {/* Flow direction arrow */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7h8M7.5 4L11 7l-3.5 3"
                  stroke="var(--erc-color-category-token)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <code
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--erc-color-fn-read)',
                  fontFamily: 'var(--erc-font-mono)',
                }}
              >
                {amount}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        aria-label="Input connection"
        style={{
          background: 'var(--erc-color-category-token)',
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
          background: 'var(--erc-color-category-token)',
          border: '2px solid var(--erc-color-node-bg)',
          width: 10,
          height: 10,
        }}
      />
    </div>
  );
}

export default memo(TokenFlowNode);
