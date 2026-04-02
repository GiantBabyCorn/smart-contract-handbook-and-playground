import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface UserNodeData {
  label: string;
  address?: string;
  balance?: string;
  [key: string]: unknown;
}

/**
 * UserNode
 *
 * Represents an external account (EOA) or user interacting with a contract.
 * Visually distinct from ContractNode — uses an accent-pink tint and an
 * inline SVG person icon. Optionally shows a truncated address and ETH balance.
 */
function UserNode({ data, selected }: NodeProps) {
  const { label, address, balance } = data as UserNodeData;

  // Shorten 0x address for display: 0x1234…abcd
  const shortAddress =
    address && address.length > 12
      ? `${address.slice(0, 6)}…${address.slice(-4)}`
      : address;

  return (
    <div
      aria-label={`User: ${label}${address ? `, address ${address}` : ''}`}
      style={{
        minWidth: 150,
        background: 'var(--erc-color-node-bg)',
        border: `1.5px solid ${
          selected ? 'var(--erc-color-category-account)' : 'var(--erc-color-node-border)'
        }`,
        borderRadius: '0.75rem',
        boxShadow: selected
          ? '0 0 0 2px var(--erc-color-category-account)'
          : '0 2px 8px rgba(0,0,0,0.35)',
        fontFamily: 'var(--erc-font-body)',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Body */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.75rem 0.875rem 0.625rem',
          background: 'rgba(236,72,153,0.07)',
        }}
      >
        {/* Person icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="14"
            cy="9"
            r="5"
            stroke="var(--erc-color-category-account)"
            strokeWidth="1.75"
          />
          <path
            d="M4 24c0-5.523 4.477-10 10-10s10 4.477 10 10"
            stroke="var(--erc-color-category-account)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>

        {/* Label */}
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.8125rem',
            color: 'var(--erc-color-text-primary)',
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>
      </div>

      {/* Optional address / balance row */}
      {(shortAddress || balance) && (
        <div
          style={{
            borderTop: '1px solid var(--erc-color-node-border)',
            padding: '0.3rem 0.75rem 0.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem',
          }}
        >
          {shortAddress && (
            <span
              title={address}
              style={{
                fontSize: '0.6875rem',
                color: 'var(--erc-color-text-muted)',
                fontFamily: 'var(--erc-font-mono)',
                textAlign: 'center',
              }}
            >
              {shortAddress}
            </span>
          )}
          {balance && (
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--erc-color-fn-read)',
                fontFamily: 'var(--erc-font-mono)',
                textAlign: 'center',
              }}
            >
              {balance}
            </span>
          )}
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        aria-label="Input connection"
        style={{
          background: 'var(--erc-color-category-account)',
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
          background: 'var(--erc-color-category-account)',
          border: '2px solid var(--erc-color-node-bg)',
          width: 10,
          height: 10,
        }}
      />
    </div>
  );
}

export default memo(UserNode);
