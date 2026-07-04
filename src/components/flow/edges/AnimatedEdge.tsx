import { memo } from 'react';
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * AnimatedEdge
 *
 * A smooth-step edge rendered with an animated dashed stroke that marches in
 * the direction of the arrow, visually communicating ongoing data / call flow.
 * Colour is driven by --erc-color-edge-animated so it updates with the theme.
 *
 * The animation is a pure CSS keyframe injected once as a <style> tag so we
 * avoid runtime style recalculations on every frame.
 *
 * Reduced motion: when `prefers-reduced-motion: reduce` is set, the infinite
 * march animation is skipped (useReducedMotion drops the class, and the
 * injected `@media` rule guards the class itself as belt-and-braces). The
 * static dashed stroke and the highlight/selected colour states remain.
 */

const ANIM_KEYFRAMES = `
@keyframes erc-edge-march {
  to { stroke-dashoffset: -24; }
}
.erc-edge-march {
  animation: erc-edge-march 0.6s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .erc-edge-march { animation: none; }
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
  data,
}: EdgeProps) {
  ensureKeyframes();
  const reducedMotion = useReducedMotion();

  const isHighlighted = (data as { highlighted?: boolean } | undefined)?.highlighted === true;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const color = isHighlighted || selected
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

      {/* Dashed overlay — marching animation unless the user prefers reduced motion */}
      <path
        id={id}
        d={edgePath}
        className={reducedMotion ? undefined : 'erc-edge-march'}
        fill="none"
        stroke={color}
        strokeWidth={isHighlighted ? 3 : selected ? 2.5 : 2}
        strokeDasharray="8 8"
        strokeLinecap="round"
        aria-label="Animated flow edge"
      />
    </>
  );
}

export default memo(AnimatedEdge);
