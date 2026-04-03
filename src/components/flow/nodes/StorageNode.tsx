import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface StorageSlot {
  key: string;
  label: string;
}

interface StorageNodeData {
  label: string;
  slots?: StorageSlot[];
  [key: string]: unknown;
}

/**
 * StorageNode
 *
 * Visualises a contract's on-chain storage layout. Shows a database-style icon
 * in the header and renders each storage slot as a key → label row, making the
 * data structure immediately readable at a glance.
 */
function StorageNode({ data, selected }: NodeProps) {
  const { label, slots, highlighted } = data as StorageNodeData & { highlighted?: boolean };
  const isHighlighted = highlighted === true;
  const slotList: StorageSlot[] = Array.isArray(slots) ? slots : [];

  return (
    <div
      aria-label={`Storage: ${label}`}
      style={{
        minWidth: 190,
        background: 'var(--erc-color-node-bg)',
        border: `1.5px solid ${isHighlighted ? 'var(--erc-color-category-defi)' : selected ? 'var(--erc-color-category-defi)' : 'var(--erc-color-node-border)'}`,
        borderRadius: '0.5rem',
        boxShadow: isHighlighted
          ? '0 0 12px 2px var(--erc-color-category-defi), 0 0 0 2px var(--erc-color-category-defi)'
          : selected
            ? '0 0 0 2px var(--erc-color-category-defi)'
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
          borderBottom: slotList.length > 0 ? '1px solid var(--erc-color-node-border)' : 'none',
          background: 'rgba(59,130,246,0.09)',
        }}
      >
        {/* Database icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          {/* Bottom cylinder half */}
          <ellipse
            cx="8"
            cy="11"
            rx="5"
            ry="2"
            stroke="var(--erc-color-category-defi)"
            strokeWidth="1.4"
          />
          {/* Top cylinder cap */}
          <ellipse
            cx="8"
            cy="5"
            rx="5"
            ry="2"
            stroke="var(--erc-color-category-defi)"
            strokeWidth="1.4"
          />
          {/* Side walls */}
          <line
            x1="3"
            y1="5"
            x2="3"
            y2="11"
            stroke="var(--erc-color-category-defi)"
            strokeWidth="1.4"
          />
          <line
            x1="13"
            y1="5"
            x2="13"
            y2="11"
            stroke="var(--erc-color-category-defi)"
            strokeWidth="1.4"
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

      {/* Slot rows */}
      {slotList.length > 0 && (
        <ul
          aria-label={`Storage slots of ${label}`}
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '0.25rem 0',
            // Slightly different background to distinguish from contract nodes
            background: 'rgba(59,130,246,0.04)',
          }}
        >
          {slotList.map((slot) => (
            <li
              key={slot.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                padding: '0.2rem 0.75rem',
                borderBottom: '1px solid var(--erc-color-node-border)',
              }}
            >
              {/* Slot key */}
              <code
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--erc-color-category-defi)',
                  fontFamily: 'var(--erc-font-mono)',
                  flexShrink: 0,
                }}
              >
                {slot.key}
              </code>

              {/* Small arrow separator */}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
                style={{ flexShrink: 0, opacity: 0.45 }}
              >
                <path
                  d="M2 5h6M5.5 2.5L8 5l-2.5 2.5"
                  stroke="var(--erc-color-text-muted)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Slot label */}
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--erc-color-text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {slot.label}
              </span>
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
          background: 'var(--erc-color-category-defi)',
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
          background: 'var(--erc-color-category-defi)',
          border: '2px solid var(--erc-color-node-bg)',
          width: 10,
          height: 10,
        }}
      />
    </div>
  );
}

export default memo(StorageNode);
