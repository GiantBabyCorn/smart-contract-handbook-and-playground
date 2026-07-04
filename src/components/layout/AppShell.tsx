import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSidebarStore } from '@/stores/useSidebarStore';
import CommandPalette from '@/features/search/CommandPalette';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import { cn } from '@/utils/cn';

/**
 * Root layout shell.
 * Desktop: fixed sidebar on left + scrollable main content on right.
 * Mobile: no sidebar visible; hamburger in TopBar opens MobileNav drawer.
 */
export default function AppShell() {
  const { t } = useTranslation('common');
  const { isOpen } = useSidebarStore();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--erc-color-bg-primary)]">
      {/* ── Skip link: first focusable element on the page ───────── */}
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only',
          'focus:fixed focus:top-2 focus:left-2 focus:z-[200]',
          'focus:px-3 focus:py-2 focus:rounded-lg',
          'focus:bg-[var(--erc-color-accent)] focus:text-white',
          'text-sm font-medium focus:outline-none',
        )}
      >
        {t('a11y.skipToContent')}
      </a>

      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      {/* `inert` removes the collapsed (w-0, visually hidden) sidebar's
          links from the tab order and accessibility tree. */}
      <aside
        aria-label="Site navigation"
        inert={!isOpen}
        className={cn(
          'hidden md:flex flex-col shrink-0 h-full',
          'border-r border-[var(--erc-color-border)]',
          'bg-[var(--erc-color-sidebar-bg)]',
          'transition-all duration-300 ease-in-out',
          isOpen ? 'w-72' : 'w-0 overflow-hidden',
        )}
      >
        <Sidebar />
      </aside>

      {/* ── Main area ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar />
        <main id="main-content" className="flex-1 overflow-y-auto focus:outline-none" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      {/* ── Mobile nav drawer (rendered at root level for z-index) ─ */}
      <MobileNav />

      {/* ── Global Ctrl-K / Cmd-K search palette ─────────────────── */}
      <CommandPalette />
    </div>
  );
}
