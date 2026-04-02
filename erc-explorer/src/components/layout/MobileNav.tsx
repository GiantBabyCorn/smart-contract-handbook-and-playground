import { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { useSidebarStore } from '@/stores/useSidebarStore';
import Sidebar from './Sidebar';

/**
 * Full-screen mobile navigation drawer.
 * Visible only on small screens (< md breakpoint).
 * Opens/closes via useSidebarStore.isMobileNavOpen.
 */
export default function MobileNav() {
  const { isMobileNavOpen, setMobileNavOpen } = useSidebarStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Trap focus inside drawer when open
  useEffect(() => {
    if (!isMobileNavOpen) return;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus first focusable element in drawer
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
      'a, button, input, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileNavOpen) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen, setMobileNavOpen]);

  const close = () => setMobileNavOpen(false);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          'md:hidden',
          isMobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[min(80vw,320px)] flex flex-col',
          'bg-[var(--erc-color-sidebar-bg)]',
          'border-r border-[var(--erc-color-border)]',
          'shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          'md:hidden',
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Close button row */}
        <div className="flex items-center justify-end px-3 pt-3 shrink-0">
          <button
            type="button"
            onClick={close}
            aria-label="Close navigation menu"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              'text-[var(--erc-color-text-secondary)]',
              'hover:bg-[var(--erc-color-bg-tertiary)]',
              'hover:text-[var(--erc-color-text-primary)]',
              'transition-colors duration-150',
              'focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus:outline-none',
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Sidebar content (shared with desktop) */}
        <div className="flex-1 overflow-hidden">
          <Sidebar onNavigate={close} />
        </div>
      </div>
    </>
  );
}
