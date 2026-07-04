import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18next from 'i18next';

/**
 * Class components cannot use the useTranslation hook; read from the shared
 * i18next singleton with an English default so the boundary still renders
 * meaningfully before init (or in tests without i18n).
 */
function tr(key: string, defaultValue: string): string {
  try {
    return i18next.isInitialized
      ? i18next.t(key, { ns: 'simulation', defaultValue })
      : defaultValue;
  } catch {
    return defaultValue;
  }
}

interface Props {
  children: ReactNode;
  /** Optional custom fallback. If omitted, a default error card is shown. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * FlowErrorBoundary
 *
 * Class-based React error boundary that wraps the flow canvas. Any unhandled
 * render-time exception inside the boundary is caught here, preventing the
 * entire page from crashing and showing a user-friendly fallback instead.
 */
export default class FlowErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[FlowErrorBoundary] Caught error in flow canvas:', error, info);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { error } = this.state;

    return (
      <div
        role="alert"
        aria-label="Flow diagram error"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          minHeight: '240px',
          padding: '2rem',
          background: 'var(--erc-color-bg-primary)',
          color: 'var(--erc-color-text-primary)',
          fontFamily: 'var(--erc-font-body)',
          gap: '1rem',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="22" stroke="var(--erc-color-error)" strokeWidth="2" />
          <path
            d="M24 14v12"
            stroke="var(--erc-color-error)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="24" cy="33" r="1.5" fill="var(--erc-color-error)" />
        </svg>

        <div>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--erc-color-text-primary)',
            }}
          >
            {tr('flow.renderError', 'Failed to render flow diagram')}
          </p>
          <p
            style={{
              margin: '0.5rem 0 0',
              fontSize: '0.8125rem',
              color: 'var(--erc-color-text-secondary)',
              maxWidth: '480px',
            }}
          >
            {error?.message ??
              tr('flow.renderErrorHint', 'An unexpected error occurred while drawing the diagram.')}
          </p>
        </div>

        <button
          type="button"
          onClick={this.handleReset}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1.25rem',
            background: 'var(--erc-color-accent)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontFamily: 'var(--erc-font-body)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          aria-label={tr('flow.retry', 'Try again')}
        >
          {tr('flow.retry', 'Try again')}
        </button>
      </div>
    );
  }
}
