import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// Fallback UI — used as the render prop of ErrorBoundary
// ---------------------------------------------------------------------------

interface ErrorFallbackUIProps {
  error?: Error;
  onReset?: () => void;
}

function ErrorFallbackUI({ error, onReset }: ErrorFallbackUIProps) {
  const { t } = useTranslation('common');

  const handleReload = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      role="alert"
      className="flex min-h-[320px] flex-col items-center justify-center gap-5 p-8 text-center"
    >
      {/* Error icon */}
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--erc-color-error)]/10 text-[var(--erc-color-error)]"
        aria-hidden="true"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <h2 className="text-xl font-semibold text-[var(--erc-color-text-primary)]">
          {t('error.title')}
        </h2>
        <p className="text-sm text-[var(--erc-color-text-secondary)] leading-relaxed">
          {t('error.description')}
        </p>
        {error?.message && (
          <p className="mt-1 rounded-md bg-[var(--erc-color-bg-tertiary)] px-3 py-2 font-mono text-xs text-[var(--erc-color-text-muted)] text-left break-all">
            {error.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleReload}
        className="rounded-lg bg-[var(--erc-color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--erc-color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erc-color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--erc-color-bg-primary)]"
      >
        {t('error.reload')}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Class-based ErrorBoundary
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | undefined;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ErrorFallbackUI error={this.state.error} onReset={this.handleReset} />
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Default export — standalone fallback component for use as render prop / slot
// ---------------------------------------------------------------------------

export default function ErrorFallback({ error, onReset }: ErrorFallbackUIProps) {
  return <ErrorFallbackUI error={error} onReset={onReset} />;
}
