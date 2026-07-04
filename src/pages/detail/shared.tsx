import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { cn } from '@/utils/cn';
import { useLazySection } from '@/hooks/useLazySection';
import { ForceMountContext } from './forceMountContext';

// ---------------------------------------------------------------------------
// Anchor-link button — appears on hover/focus, copies the section URL
// ---------------------------------------------------------------------------

function AnchorLinkButton({ id }: { id: string }) {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    // The collapsible header toggles on click — copying must not collapse.
    e.stopPropagation();
    const { origin, pathname, search } = window.location;
    try {
      await navigator.clipboard.writeText(`${origin}${pathname}${search}#${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently ignore.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      // Keep Enter/Space activation local — the collapsible header listens
      // for the same keys to toggle the section.
      onKeyDown={(e) => e.stopPropagation()}
      data-testid="section-anchor-copy"
      aria-label={copied ? t('detailUi.linkCopied') : t('detailUi.copyLink')}
      title={copied ? t('detailUi.linkCopied') : t('detailUi.copyLink')}
      className={cn(
        'shrink-0 flex h-6 w-6 items-center justify-center rounded-md',
        'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)]',
        copied
          ? 'text-[var(--erc-color-success)]'
          : 'text-[var(--erc-color-text-muted)] hover:text-[var(--erc-color-accent)]',
      )}
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

export interface SectionProps {
  id?: string;
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function Section({
  id,
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
}: SectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn(
        'rounded-2xl border border-[var(--erc-color-border)]',
        'bg-[var(--erc-color-bg-secondary)]',
        'overflow-hidden scroll-mt-4',
      )}
    >
      <div
        className={cn(
          'group px-5 py-4 flex items-center justify-between gap-2',
          (expanded || !collapsible) && 'border-b border-[var(--erc-color-border)]',
          collapsible && 'cursor-pointer hover:bg-[var(--erc-color-bg-tertiary)] transition-colors select-none',
        )}
        onClick={collapsible ? () => setExpanded((v) => !v) : undefined}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? expanded : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={collapsible ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        } : undefined}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <h2
            id={id ? `${id}-heading` : undefined}
            className="text-base font-semibold text-[var(--erc-color-text-primary)] truncate"
          >
            {title}
          </h2>
          {id && <AnchorLinkButton id={id} />}
        </span>
        {collapsible && (
          <span
            className={cn(
              'shrink-0 text-[var(--erc-color-text-muted)] transition-transform duration-200',
              !expanded && '-rotate-90',
            )}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        )}
      </div>
      {(!collapsible || expanded) && (
        <motion.div
          initial={collapsible ? { opacity: 0, height: 0 } : false}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="p-5"
        >
          {children}
        </motion.div>
      )}
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// Lazy-rendered section — only mounts children when scrolled near viewport
// ---------------------------------------------------------------------------

export interface LazySectionProps {
  children: React.ReactNode;
  /** Placeholder height in pixels while waiting to enter viewport */
  height?: number;
}

export function LazySection({ children, height = 120 }: LazySectionProps) {
  const force = useContext(ForceMountContext);
  const { ref, isVisible } = useLazySection('300px', force);

  return (
    <div ref={ref}>
      {isVisible ? (
        children
      ) : (
        <div
          className="rounded-2xl border border-[var(--erc-color-border)] bg-[var(--erc-color-bg-secondary)] animate-pulse"
          style={{ height }}
        />
      )}
    </div>
  );
}
