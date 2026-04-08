import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';

interface GroupNodeData {
  label: string;
  style?: 'default' | 'dashed';
  [key: string]: unknown;
}

/**
 * GroupNode
 *
 * A visual container that wraps related child nodes (e.g. diamond proxy + its
 * storage). Renders as a labeled rectangle with a semi-transparent background.
 * Children are nested via React Flow's `parentId` mechanism — the group node
 * itself carries no Handles since edges connect to children directly.
 */
function GroupNode({ data }: NodeProps) {
  const { label, style: borderStyle } = data as GroupNodeData;
  const isDashed = borderStyle === 'dashed';

  return (
    <div
      aria-label={`Group: ${label}`}
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--erc-color-bg-secondary)',
        border: `1.5px ${isDashed ? 'dashed' : 'solid'} var(--erc-color-border)`,
        borderRadius: '0.75rem',
        opacity: 0.85,
      }}
    >
      {/* Top-left label badge */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.15rem 0.5rem',
          background: 'var(--erc-color-bg-tertiary)',
          border: '1px solid var(--erc-color-border)',
          borderRadius: '0.3rem',
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: 'var(--erc-color-text-secondary)',
          fontFamily: 'var(--erc-font-body)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default memo(GroupNode);
