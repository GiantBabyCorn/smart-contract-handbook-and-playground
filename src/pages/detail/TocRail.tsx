import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

// ---------------------------------------------------------------------------
// Table of contents — sticky rail (lg+) + mobile disclosure
// ---------------------------------------------------------------------------

export interface TocItem {
  id: string;
  label: string;
}

export interface TocProps {
  items: TocItem[];
  /** Scrolls the #main-content container to the section and updates the hash. */
  onNavigate: (id: string) => void;
}

/**
 * Track which section is currently "active" inside the #main-content scroll
 * container. An IntersectionObserver on every section triggers a cheap
 * recompute: the active section is the last one whose top edge sits above a
 * reading line at 30% of the container height.
 */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const idsKey = ids.join(',');

  useEffect(() => {
    const idList = idsKey ? idsKey.split(',') : [];
    const root = document.getElementById('main-content');
    if (!root || idList.length === 0) return;

    const recompute = () => {
      const rootRect = root.getBoundingClientRect();
      const line = rootRect.top + rootRect.height * 0.3;
      // The first existing section is the default; each later one takes over
      // once its top edge crosses the reading line.
      let current: string | null = null;
      for (const id of idList) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (current === null || el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };

    const observer = new IntersectionObserver(recompute, {
      root,
      threshold: [0, 0.25, 0.5, 1],
    });

    // Sections mount lazily — re-observe as they appear.
    const observed = new Set<Element>();
    const observeAll = () => {
      for (const id of idList) {
        const el = document.getElementById(id);
        if (el && !observed.has(el)) {
          observed.add(el);
          observer.observe(el);
        }
      }
    };
    observeAll();
    recompute();

    const mutationObserver = new MutationObserver(observeAll);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [idsKey]);

  return active;
}

function TocLink({
  item,
  isActive,
  onNavigate,
  className,
}: {
  item: TocItem;
  isActive: boolean;
  onNavigate: (id: string) => void;
  className?: string;
}) {
  return (
    <a
      href={`#${item.id}`}
      aria-current={isActive ? 'location' : undefined}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(item.id);
      }}
      className={cn(
        'block rounded-md px-2.5 py-1.5 text-xs transition-colors truncate',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)]',
        isActive
          ? 'bg-[var(--erc-color-accent)]/10 text-[var(--erc-color-accent)] font-semibold'
          : 'text-[var(--erc-color-text-secondary)] hover:text-[var(--erc-color-text-primary)] hover:bg-[var(--erc-color-bg-tertiary)]',
        className,
      )}
    >
      {item.label}
    </a>
  );
}

/** Desktop sticky rail (lg+). Hidden entirely below lg — MobileToc covers that. */
export function TocRail({ items, onNavigate }: TocProps) {
  const { t } = useTranslation('common');
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveSection(ids);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={t('detailUi.toc')}
      data-testid="toc-rail"
      className="hidden lg:block w-48 xl:w-56 shrink-0 self-start sticky top-6"
    >
      <p className="px-2.5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--erc-color-text-muted)]">
        {t('detailUi.toc')}
      </p>
      <ul className="flex flex-col gap-0.5 border-l border-[var(--erc-color-border)] pl-2">
        {items.map((item) => (
          <li key={item.id}>
            <TocLink item={item} isActive={active === item.id} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Mobile / tablet TOC — a collapsible disclosure rendered above the content. */
export function MobileToc({ items, onNavigate }: TocProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={t('detailUi.toc')}
      data-testid="toc-mobile"
      className="lg:hidden rounded-xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left',
          'text-sm font-semibold text-[var(--erc-color-text-primary)]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--erc-color-accent)]',
        )}
      >
        {t('detailUi.toc')}
        <span
          className={cn(
            'shrink-0 text-[var(--erc-color-text-muted)] transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {open && (
        <ul className="px-2 pb-2 flex flex-col gap-0.5">
          {items.map((item) => (
            <li key={item.id}>
              <TocLink
                item={item}
                isActive={false}
                onNavigate={(id) => {
                  setOpen(false);
                  onNavigate(id);
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
