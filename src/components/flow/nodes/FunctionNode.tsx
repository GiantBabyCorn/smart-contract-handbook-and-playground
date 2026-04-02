import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface FunctionNodeData {
  label: string;
  fnType: 'read' | 'write' | 'event';
  signature?: string;
  [key: string]: unknown;
}

const FN_TYPE_STYLES: Record<
  FunctionNodeData['fnType'],
  { color: string; bgColor: string; label: string }
> = {
  read: {
    color: 'var(--erc-color-fn-read)',
    bgColor: 'rgba(34,197,94,0.10)',
    label: 'read',
  },
  write: {
    color: 'var(--erc-color-fn-write)',
    bgColor: 'rgba(245,158,11,0.10)',
    label: 'write',
  },
  event: {
    color: 'var(--erc-color-fn-event)',
    bgColor: 'rgba(168,85,247,0.10)',
    label: 'event',
  },
};

/**
 * FunctionNode
 *
 * Renders a contract function in the flow diagram, colour-coded by whether it
 * is a view/pure (read), state-mutating (write), or event-emitting (event)
 * function. Displays the function name prominently and the full signature as a
 * monospace subtitle if provided.
 */
function FunctionNode({ data, selected }: NodeProps) {
  const { label, fnType, signature } = data as FunctionNodeData;
  const fnStyle = FN_TYPE_STYLES[fnType] ?? FN_TYPE_STYLES.read;

  return (
    <div
      aria-label={`${fnStyle.label} function: ${label}`}
      style={{
        minWidth: 180,
        background: 'var(--erc-color-node-bg)',
        border: `1.5px solid ${selected ? fnStyle.color : 'var(--erc-color-node-border)'}`,
        borderRadius: '0.5rem',
        boxShadow: selected
          ? `0 0 0 2px ${fnStyle.color}`
          : '0 2px 8px rgba(0,0,0,0.35)',
        fontFamily: 'var(--erc-font-body)',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Coloured top accent bar */}
      <div
        style={{ height: '3px', background: fnStyle.color, opacity: 0.85 }}
        aria-hidden="true"
      />

      {/* Header: label + type badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem 0.375rem',
          background: fnStyle.bgColor,
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

        <span
          aria-label={`Function type: ${fnStyle.label}`}
          style={{
            fontSize: '0.625rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: fnStyle.color,
            border: `1px solid ${fnStyle.color}`,
            borderRadius: '0.25rem',
            padding: '0.1rem 0.35rem',
            flexShrink: 0,
            lineHeight: 1.4,
          }}
        >
          {fnStyle.label}
        </span>
      </div>

      {/* Signature subtitle */}
      {signature && (
        <div
          style={{
            padding: '0.3rem 0.75rem 0.45rem',
            borderTop: '1px solid var(--erc-color-node-border)',
          }}
        >
          <code
            title={signature}
            style={{
              display: 'block',
              fontSize: '0.6875rem',
              color: 'var(--erc-color-text-secondary)',
              fontFamily: 'var(--erc-font-mono)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {signature}
          </code>
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        aria-label="Input connection"
        style={{
          background: fnStyle.color,
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
          background: fnStyle.color,
          border: '2px solid var(--erc-color-node-bg)',
          width: 10,
          height: 10,
        }}
      />
    </div>
  );
}

export default memo(FunctionNode);
