import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

/**
 * FundFlowEdge
 *
 * A thicker, green-coloured edge that communicates the transfer of funds or
 * tokens between nodes. Features:
 * - Bold stroke to imply value/weight
 * - An animated marching-dot overlay that flows in the direction of the arrow,
 *   reinforcing directionality
 * - An optional amount pill rendered mid-edge via EdgeLabelRenderer
 */

// CSS keyframe for the flowing dots — injected once on first mount
const KEYFRAMES = `
@keyframes erc-fund-flow {
  to { stroke-dashoffset: -20; }
}
`;

let keyframesInjected = false;
function ensureKeyframes() {
  if (keyframesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
  keyframesInjected = true;
}

interface FundFlowData {
  amount?: string;
  [key: string]: unknown;
}

function FundFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  label,
  selected,
  markerEnd,
}: EdgeProps) {
  ensureKeyframes();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });

  const fundData = (data ?? {}) as FundFlowData & { highlighted?: boolean };
  // Prefer explicit data.amount over the generic edge label
  const displayAmount = fundData.amount ?? (typeof label === 'string' ? label : undefined);
  const isHighlighted = fundData.highlighted === true;

  const baseColor = isHighlighted || selected ? 'var(--erc-color-success)' : 'var(--erc-color-category-token)';

  return (
    <>
      {/* Thick base stroke — the "pipe" carrying funds */}
      <BaseEdge
        id={`${id}-base`}
        path={edgePath}
        style={{
          stroke: baseColor,
          strokeWidth: selected ? 5 : 4,
          strokeOpacity: 0.3,
          fill: 'none',
          transition: 'stroke-width 0.15s',
        }}
        markerEnd={markerEnd}
      />

      {/* Slightly thinner solid line on top */}
      <path
        d={edgePath}
        fill="none"
        stroke={baseColor}
        strokeWidth={selected ? 3 : 2.5}
        strokeOpacity={0.85}
      />

      {/* Animated dots flowing in the direction of the arrow */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={baseColor}
        strokeWidth={selected ? 3 : 2.5}
        strokeDasharray="4 16"
        strokeLinecap="round"
        style={{
          animation: 'erc-fund-flow 0.5s linear infinite',
          opacity: 0.9,
        }}
        aria-label="Fund flow edge"
      />

      {/* Amount label pill */}
      {displayAmount && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              background: 'var(--erc-color-bg-secondary)',
              border: `1.5px solid ${baseColor}`,
              borderRadius: '999px',
              padding: '0.175rem 0.6rem',
              fontSize: '0.6875rem',
              fontFamily: 'var(--erc-font-mono)',
              fontWeight: 600,
              color: baseColor,
              whiteSpace: 'nowrap',
              userSelect: 'none',
              boxShadow: '0 1px 6px rgba(0,0,0,0.4)',
            }}
            aria-label={`Transfer amount: ${displayAmount}`}
            className="nodrag nopan"
          >
            {displayAmount}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(FundFlowEdge);
