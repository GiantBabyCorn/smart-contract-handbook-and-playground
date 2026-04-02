import { cn } from '@/utils/cn';

// ---------------------------------------------------------------------------
// External link icon
// ---------------------------------------------------------------------------

function ExternalLinkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="inline-block shrink-0"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Icon size in px (default 14) */
  iconSize?: number;
  /** Whether to show the external link icon (default true) */
  showIcon?: boolean;
  /** Additional aria-label for screen readers */
  ariaLabel?: string;
}

/**
 * Safe external link that always opens in a new tab with
 * `rel="noopener noreferrer"` to prevent tab-napping attacks.
 */
export default function ExternalLink({
  href,
  children,
  className,
  iconSize = 14,
  showIcon = true,
  ariaLabel,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel ?? undefined}
      className={cn(
        'inline-flex items-center gap-1 transition-colors duration-150',
        'text-[var(--erc-color-accent)] hover:text-[var(--erc-color-accent-hover)]',
        'underline-offset-2 hover:underline',
        className,
      )}
    >
      {children}
      {showIcon && <ExternalLinkIcon size={iconSize} />}
    </a>
  );
}
