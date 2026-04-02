import { RouterProvider } from 'react-router-dom';
import { Suspense, Component, type ReactNode, type ErrorInfo } from 'react';
import { router } from './router';
import { useThemeSync } from '@/hooks/useThemeSync';
import ErrorFallback from '@/components/common/ErrorFallback';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

function AppInner() {
  useThemeSync();
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[var(--erc-color-bg-primary)] text-[var(--erc-color-text-muted)]">Loading...</div>}>
        <AppInner />
      </Suspense>
    </ErrorBoundary>
  );
}
