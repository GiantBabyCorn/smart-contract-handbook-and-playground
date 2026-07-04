import { useParams, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useSearchModalStore } from '@/features/search/useSearchModalStore';
import { allMeta } from '@/data/allMeta';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { cn } from '@/utils/cn';

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function HamburgerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function SidebarToggleIcon({ isOpen }: { isOpen: boolean }) {
  return isOpen ? (
    // Panel-left-close icon
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <polyline points="15 9 12 12 15 15" />
    </svg>
  ) : (
    // Panel-left-open icon
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <polyline points="12 9 15 12 12 15" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TopBar() {
  const { t } = useTranslation('common');
  const { slug } = useParams<{ slug: string }>();
  const { pathname } = useLocation();
  const { isOpen, toggle, setMobileNavOpen } = useSidebarStore();
  const openSearch = useSearchModalStore((s) => s.open);

  // Determine the page title. Note: useMatches() cannot be used to detect the
  // home page — the pathless layout route always matches '/' for every URL.
  const path = pathname.replace(/\/+$/, '') || '/';
  const entry = slug ? allMeta.find((m) => m.slug === slug) : undefined;
  const pageTitle =
    entry?.name ??
    (path === '/'
      ? t('nav.home')
      : path === '/playground'
        ? t('nav.playground')
        : path === '/catalog'
          ? t('nav.catalog')
          : t('notFound.title'));

  return (
    <header
      className={cn(
        'shrink-0 h-14 flex items-center gap-2 px-4',
        'border-b border-[var(--erc-color-border)]',
        'bg-[var(--erc-color-bg-secondary)]',
        'z-30',
      )}
    >
      {/* ── Desktop: sidebar toggle ─────────────────────────── */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        className={cn(
          'hidden md:flex items-center justify-center',
          'h-8 w-8 rounded-lg',
          'text-[var(--erc-color-text-secondary)]',
          'hover:bg-[var(--erc-color-bg-tertiary)]',
          'hover:text-[var(--erc-color-text-primary)]',
          'transition-colors duration-150',
          'focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus:outline-none',
        )}
      >
        <SidebarToggleIcon isOpen={isOpen} />
      </button>

      {/* ── Mobile: hamburger ──────────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation menu"
        className={cn(
          'flex md:hidden items-center justify-center',
          'h-8 w-8 rounded-lg',
          'text-[var(--erc-color-text-secondary)]',
          'hover:bg-[var(--erc-color-bg-tertiary)]',
          'hover:text-[var(--erc-color-text-primary)]',
          'transition-colors duration-150',
        )}
      >
        <HamburgerIcon />
      </button>

      {/* ── Breadcrumbs / page title ────────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex-1 flex items-center gap-1.5 min-w-0">
        {slug && (
          <>
            <Link
              to="/"
              aria-label={t('nav.home')}
              className={cn(
                'shrink-0 flex items-center gap-1',
                'text-sm text-[var(--erc-color-text-muted)]',
                'hover:text-[var(--erc-color-text-secondary)]',
                'transition-colors duration-150',
              )}
            >
              <HomeIcon />
              <span className="hidden sm:inline">{t('nav.home')}</span>
            </Link>
            <span className="text-[var(--erc-color-text-muted)]" aria-hidden="true">
              /
            </span>
          </>
        )}
        {pageTitle && (
          // <p>, not <h1>: pages own their h1 (avoids a duplicate-h1 outline).
          <p
            className={cn('text-sm font-semibold truncate', 'text-[var(--erc-color-text-primary)]')}
          >
            {pageTitle}
          </p>
        )}
      </nav>

      {/* ── Right actions ──────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-1">
        <button
          type="button"
          onClick={openSearch}
          aria-label={t('search.button')}
          title={t('search.button')}
          data-testid="topbar-search-button"
          className={cn(
            'flex items-center gap-2',
            'h-8 px-2 rounded-lg',
            'text-[var(--erc-color-text-secondary)]',
            'hover:bg-[var(--erc-color-bg-tertiary)]',
            'hover:text-[var(--erc-color-text-primary)]',
            'transition-colors duration-150',
            'focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus:outline-none',
          )}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="hidden lg:flex items-center gap-1.5 text-xs">
            {t('search.button')}
            <kbd
              aria-hidden="true"
              className={cn(
                'px-1.5 py-0.5 rounded border border-[var(--erc-color-border)]',
                'text-[10px] font-medium text-[var(--erc-color-text-muted)]',
              )}
            >
              {IS_MAC ? '⌘K' : 'Ctrl K'}
            </kbd>
          </span>
        </button>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
