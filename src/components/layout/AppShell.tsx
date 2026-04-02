import { Outlet } from 'react-router-dom';
import { useSidebarStore } from '@/stores/useSidebarStore';
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
  const { isOpen } = useSidebarStore();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--erc-color-bg-primary)]">
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside
        aria-label="Site navigation"
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
        <main
          id="main-content"
          className="flex-1 overflow-y-auto focus:outline-none"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>

      {/* ── Mobile nav drawer (rendered at root level for z-index) ─ */}
      <MobileNav />
    </div>
  );
}
