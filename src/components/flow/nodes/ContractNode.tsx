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
  const { label, functions, highlighted } = data as ContractNodeData & { highlighted?: boolean };
  const fnList = Array.isArray(functions) ? (functions as string[]) : [];
  const isHighlighted = highlighted === true;

  return (
    <div
      aria-label={`Contract: ${label}`}
      style={{
        minWidth: 200,
        background: 'var(--erc-color-node-bg)',
        border: `1.5px solid ${isHighlighted ? 'var(--erc-color-accent)' : selected ? 'var(--erc-color-accent)' : 'var(--erc-color-node-border)'}`,
        borderRadius: '0.5rem',
        boxShadow: isHighlighted
          ? '0 0 12px 2px var(--erc-color-accent), 0 0 0 2px var(--erc-color-accent)'
          : selected
            ? '0 0 0 2px var(--erc-color-accent)'
            : '0 2px 8px rgba(0,0,0,0.4)',
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
          borderBottom:
            fnList.length > 0 ? '1px solid var(--erc-color-node-border)' : 'none',
          background: 'rgba(99,102,241,0.12)',
        }}
      >
        {/* Solidity icon (from thesvg) */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="var(--erc-color-accent)"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path d="M4.409 6.608L7.981.255l3.572 6.353H4.409zM8.411 0l3.569 6.348L15.552 0H8.411zm4.036 17.392l3.572 6.354 3.575-6.354h-7.147zm-.608-10.284h-7.43l3.715 6.605 3.715-6.605zm.428-.25h7.428L15.982.255l-3.715 6.603zM15.589 24l-3.569-6.349L8.448 24h7.141zm-3.856-6.858H4.306l3.712 6.603 3.715-6.603zm.428-.25h7.433l-3.718-6.605-3.715 6.605z" />
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
