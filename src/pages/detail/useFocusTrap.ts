import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);
}

/**
 * Modal-dialog focus trap (plan §5.7):
 * - while `active`, Tab / Shift+Tab cycle inside `ref`'s subtree;
 * - Escape invokes `onEscape`;
 * - the first focusable element receives focus on activation;
 * - focus is restored to the previously focused element (the opener)
 *   on deactivation.
 *
 * Used by the simulation drawer and the flow fullscreen overlay — pair with
 * role="dialog" and aria-modal="true" on the container.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void,
): void {
  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Move focus inside the dialog (first focusable, else the container).
    const initial = getFocusable(container)[0] ?? container;
    initial.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onEscape) {
          e.stopPropagation();
          onEscape();
        }
        return;
      }
      if (e.key !== 'Tab') return;

      const items = getFocusable(container);
      if (items.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const inside = current instanceof HTMLElement && container.contains(current);

      if (e.shiftKey) {
        if (!inside || current === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      previouslyFocused?.focus();
    };
  }, [ref, active, onEscape]);
}
