import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * FundFlowEdge
 *
 * A thicker, green-coloured edge that communicates the transfer of funds or
 * tokens between nodes. Features:
 * - Bold stroke to imply value/weight
 * - An animated marching-dot overlay that flows in the direction of the arrow
 *   (edges are authored in the direction tokens move), reinforcing
 *   directionality
 * - An optional amount pill rendered mid-edge via EdgeLabelRenderer
 *
 * Simulation integration (plan §5.3): while a scenario run is in progress,
 * only the edges highlighted by the current step keep their particles moving
 * (the rest pause), and the step's computed token movement — when the compute
 * binding can identify one — overrides the pill label with the live amount.
 *
 * Reduced motion: when `prefers-reduced-motion: reduce` is set, the infinite
 * particle animation is skipped (hook drops the class; the injected `@media`
 * rule guards the class as belt-and-braces). The static dot pattern, the
 * highlight/selected colour states and the paused-edge dimming remain.
 */

// CSS keyframes for the flowing dots — injected once on first mount
const KEYFRAMES = `
@keyframes erc-fund-flow {
  to { stroke-dashoffset: -20; }
}
.erc-fund-flow {
  animation: erc-fund-flow 0.5s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .erc-fund-flow { animation: none; }
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
  const reducedMotion = useReducedMotion();

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
  const isHighlighted = fundData.highlighted === true;

  // Simulation state: while a run is in progress only highlighted fund-flow
  // edges animate, and the current step's computed token movement (if any)
  // labels the highlighted edge.
  const simRunning = useSimulationStore(
    (s) => s.scenario !== null && s.currentStepIndex >= 0,
  );
  const stepFlowLabel = useSimulationStore((s) => s.flowLabel);

  // Live computed movement wins on the active edge; otherwise prefer explicit
  // data.amount over the generic edge label.
  const displayAmount =
    (isHighlighted && stepFlowLabel ? stepFlowLabel : undefined) ??
    fundData.amount ??
    (typeof label === 'string' ? label : undefined);
  const particlesPaused = simRunning && !isHighlighted;

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

      {/* Dots flowing in the direction of the arrow — static when the user prefers reduced motion */}
      <path
        id={id}
        d={edgePath}
        className={reducedMotion ? undefined : 'erc-fund-flow'}
        fill="none"
        stroke={baseColor}
        strokeWidth={selected ? 3 : 2.5}
        strokeDasharray="4 16"
        strokeLinecap="round"
        style={{
          animationPlayState: particlesPaused ? 'paused' : 'running',
          opacity: particlesPaused ? 0.35 : 0.9,
          transition: 'opacity 0.2s',
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
