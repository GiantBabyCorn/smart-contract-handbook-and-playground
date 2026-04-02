import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  /** Show a copy-to-clipboard button */
  showCopy?: boolean;
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback – silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy code'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      className={cn(
        'absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-md',
        'border transition-all duration-150',
        copied
          ? 'border-[var(--erc-color-success)] bg-[var(--erc-color-success)]/10 text-[var(--erc-color-success)]'
          : 'border-[var(--erc-color-border)] bg-[var(--erc-color-bg-tertiary)] text-[var(--erc-color-text-secondary)]',
        'hover:border-[var(--erc-color-accent)] hover:text-[var(--erc-color-accent)]',
      )}
    >
      {copied ? (
        // Check icon
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        // Copy icon
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Language badge
// ---------------------------------------------------------------------------

const LANGUAGE_DISPLAY: Record<string, string> = {
  solidity: 'Solidity',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  js: 'JavaScript',
  json: 'JSON',
  bash: 'Shell',
  shell: 'Shell',
  sh: 'Shell',
  rust: 'Rust',
  python: 'Python',
  py: 'Python',
};

// ---------------------------------------------------------------------------
// Shiki-highlighted code block (lazy loaded)
// ---------------------------------------------------------------------------

type HighlightFn = (code: string, lang: string) => Promise<string>;

let highlightCache: HighlightFn | null = null;
let highlightPromise: Promise<HighlightFn> | null = null;

async function loadHighlighter(): Promise<HighlightFn> {
  if (highlightCache) return highlightCache;
  if (highlightPromise) return highlightPromise;

  highlightPromise = (async () => {
    const { createHighlighter } = await import('shiki');
    const highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['solidity', 'typescript', 'javascript', 'json', 'bash', 'rust', 'python'],
    });

    const fn: HighlightFn = async (code, lang) => {
      const safeLang = highlighter.getLoadedLanguages().includes(lang as never) ? lang : 'text';
      return highlighter.codeToHtml(code, {
        lang: safeLang,
        themes: { dark: 'github-dark', light: 'github-light' },
        defaultColor: false,
      });
    };

    highlightCache = fn;
    return fn;
  })();

  return highlightPromise;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CodeBlock({
  code,
  language = 'solidity',
  className,
  showCopy = true,
}: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setIsLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    setHtml(null);

    loadHighlighter()
      .then((highlight) => highlight(code, language))
      .then((result) => {
        if (!abortRef.current) {
          setHtml(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!abortRef.current) setIsLoading(false);
      });

    return () => {
      abortRef.current = true;
    };
  }, [code, language]);

  const displayLang = LANGUAGE_DISPLAY[language.toLowerCase()] ?? language;

  return (
    <div
      className={cn(
        'relative rounded-xl border border-[var(--erc-color-border)] overflow-hidden',
        'bg-[var(--erc-color-bg-secondary)]',
        className,
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--erc-color-border)] bg-[var(--erc-color-bg-tertiary)]">
        <span className="text-xs font-medium text-[var(--erc-color-text-muted)] uppercase tracking-wide">
          {displayLang}
        </span>
        {/* Three dots decorative */}
        <div className="flex gap-1.5" aria-hidden="true">
          {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c) => (
            <span key={c} className={cn('w-2.5 h-2.5 rounded-full opacity-50', c)} />
          ))}
        </div>
      </div>

      {/* Code area */}
      <div className="relative">
        {showCopy && <CopyButton code={code} />}

        {isLoading || !html ? (
          // Fallback plain-text while Shiki loads
          <pre
            className={cn(
              'overflow-x-auto p-4 text-sm leading-relaxed',
              'font-mono text-[var(--erc-color-text-primary)]',
              isLoading && 'animate-pulse opacity-60',
            )}
            aria-label={`${displayLang} code`}
          >
            <code>{code}</code>
          </pre>
        ) : (
          <div
            // Shiki outputs its own <pre><code> with inline styles for both themes
            // The data-theme-aware CSS vars let our custom themes pick the right one
            dangerouslySetInnerHTML={{ __html: html }}
            className="shiki-wrapper overflow-x-auto text-sm [&_pre]:p-4 [&_pre]:leading-relaxed [&_pre]:m-0"
            aria-label={`${displayLang} code`}
          />
        )}
      </div>
    </div>
  );
}
