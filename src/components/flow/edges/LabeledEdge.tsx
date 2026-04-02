import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

/**
 * LabeledEdge
 *
 * A bezier edge that renders its label as a pill-shaped overlay at the
 * midpoint of the path. The label is injected via EdgeLabelRenderer so it
 * sits above the canvas SVG layer and can use full HTML/CSS styling.
 */
function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  selected,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = selected
    ? 'var(--erc-color-accent-hover)'
    : 'var(--erc-color-border)';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 2 : 1.5,
          fill: 'none',
          transition: 'stroke 0.15s, stroke-width 0.15s',
        }}
        markerEnd={markerEnd}
      />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              // Pill container
              background: 'var(--erc-color-bg-secondary)',
              border: `1px solid ${selected ? 'var(--erc-color-accent)' : 'var(--erc-color-border)'}`,
              borderRadius: '999px',
              padding: '0.175rem 0.55rem',
              fontSize: '0.6875rem',
              fontFamily: 'var(--erc-font-body)',
              fontWeight: 500,
              color: selected
                ? 'var(--erc-color-accent-hover)'
                : 'var(--erc-color-text-secondary)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              // Slightly elevate the pill above the edge line
              boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            aria-label={`Edge label: ${label}`}
            className="nodrag nopan"
          >
            {label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(LabeledEdge);
