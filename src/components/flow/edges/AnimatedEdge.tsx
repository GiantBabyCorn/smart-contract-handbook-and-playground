import { memo } from 'react';
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

/**
 * AnimatedEdge
 *
 * A smooth-step edge rendered with an animated dashed stroke that marches in
 * the direction of the arrow, visually communicating ongoing data / call flow.
 * Colour is driven by --erc-color-edge-animated so it updates with the theme.
 *
 * The animation is a pure CSS keyframe injected once as a <style> tag so we
 * avoid runtime style recalculations on every frame.
 */

const ANIM_KEYFRAMES = `
@keyframes erc-edge-march {
  to { stroke-dashoffset: -24; }
}
`;

let styleInjected = false;
function ensureKeyframes() {
  if (styleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = ANIM_KEYFRAMES;
  document.head.appendChild(style);
  styleInjected = true;
}

function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
}: EdgeProps) {
  ensureKeyframes();

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const color = selected
    ? 'var(--erc-color-accent-hover)'
    : 'var(--erc-color-edge-animated)';

  return (
    <>
      {/* Faint base line so the dashes have a visible track */}
      <BaseEdge
        id={`${id}-base`}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: 1.5,
          strokeOpacity: 0.25,
          fill: 'none',
        }}
        markerEnd={markerEnd}
      />

      {/* Animated dashed overlay */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={selected ? 2.5 : 2}
        strokeDasharray="8 8"
        strokeLinecap="round"
        style={{
          animation: 'erc-edge-march 0.6s linear infinite',
        }}
        aria-label="Animated flow edge"
      />
    </>
  );
}

export default memo(AnimatedEdge);
