import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface ContractNodeData {
  label: string;
  functions?: string[];
  [key: string]: unknown;
}

/**
 * ContractNode
 *
 * Renders a Solidity contract in the flow diagram. Displays the contract name
 * prominently and lists its function names (if provided) as a compact list.
 */
function ContractNode({ data, selected }: NodeProps) {
  const { label, functions } = data as ContractNodeData;
  const fnList = Array.isArray(functions) ? (functions as string[]) : [];

  return (
    <div
      aria-label={`Contract: ${label}`}
      style={{
        minWidth: 200,
        background: 'var(--erc-color-node-bg)',
        border: `1.5px solid ${selected ? 'var(--erc-color-accent)' : 'var(--erc-color-node-border)'}`,
        borderRadius: '0.5rem',
        boxShadow: selected
          ? '0 0 0 2px var(--erc-color-accent)'
          : '0 2px 8px rgba(0,0,0,0.4)',
        fontFamily: 'var(--erc-font-body)',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 0.75rem',
          borderBottom:
            fnList.length > 0 ? '1px solid var(--erc-color-node-border)' : 'none',
          background: 'rgba(99,102,241,0.12)',
        }}
      >
        {/* Contract icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <rect
            x="2"
            y="1"
            width="10"
            height="13"
            rx="1.5"
            stroke="var(--erc-color-accent)"
            strokeWidth="1.5"
          />
          <path
            d="M5 5h5M5 7.5h5M5 10h3"
            stroke="var(--erc-color-accent)"
            strokeWidth="1.2"
            strokeLinecap="round"
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
      </div>

      {/* Function list */}
      {fnList.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '0.375rem 0',
          }}
          aria-label={`Functions of ${label}`}
        >
          {fnList.map((fn) => (
            <li
              key={fn}
              style={{
                padding: '0.2rem 0.75rem',
                fontSize: '0.75rem',
                color: 'var(--erc-color-text-secondary)',
                fontFamily: 'var(--erc-font-mono)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fn}
            </li>
          ))}
        </ul>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        aria-label="Input connection"
        style={{
          background: 'var(--erc-color-accent)',
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
          background: 'var(--erc-color-accent)',
          border: '2px solid var(--erc-color-node-bg)',
          width: 10,
          height: 10,
        }}
      />
    </div>
  );
}

export default memo(ContractNode);
