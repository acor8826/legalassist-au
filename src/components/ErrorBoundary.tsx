import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('[ErrorBoundary] Error caught:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { componentName, onError } = this.props;

    console.error(`[ErrorBoundary${componentName ? ` - ${componentName}` : ''}] Error details:`, {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack
    });

    this.setState({
      error,
      errorInfo
    });

    if (onError) {
      onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    console.log('[ErrorBoundary] Resetting error state');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallbackComponent, componentName } = this.props;

    if (hasError) {
      if (fallbackComponent) {
        return fallbackComponent;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6 bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-4">
            {/* Error Icon */}
            <div className="flex items-center justify-center">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900">
                {componentName ? `${componentName} Error` : 'Something went wrong'}
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>

            {/* Error Details (Development only) */}
            {import.meta.env.MODE === 'development' && error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
                  View Error Details
                </summary>
                <div className="mt-2 p-3 bg-slate-100 rounded text-xs font-mono overflow-auto max-h-48">
                  <div className="text-red-600 font-semibold mb-2">
                    {error.toString()}
                  </div>
                  {errorInfo && (
                    <pre className="text-slate-700 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={this.handleReset}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-4 py-2 rounded-lg
                  bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                  text-white font-medium
                  transition-colors
                  min-h-[44px]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                "
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="
                  flex-1 px-4 py-2 rounded-lg
                  border-2 border-slate-300
                  text-slate-700 font-medium
                  hover:bg-slate-50 active:bg-slate-100
                  transition-colors
                  min-h-[44px]
                  focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                "
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}
