import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
  detail: string | null;
}

function parseErrorMessage(error: unknown): { message: string; detail: string | null } {
  const raw = error instanceof Error ? error.message : String(error || 'Unexpected application error.');
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && typeof parsed.error === 'string') {
      const pathNote = parsed.path ? `Path: ${parsed.path}` : null;
      return {
        message: parsed.error,
        detail: [parsed.operationType ? `Operation: ${parsed.operationType}` : null, pathNote]
          .filter(Boolean)
          .join(' • ') || null
      };
    }
  } catch {
    // Plain error string
  }
  return { message: raw, detail: null };
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      message: '',
      detail: null
    };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const { message, detail } = parseErrorMessage(error);
    return {
      hasError: true,
      message,
      detail
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error('MARS UI ErrorBoundary caught error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-lg">
                M
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">MARS Workspace Interrupted</h1>
                <p className="text-xs text-slate-500">An unexpected runtime error occurred.</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-sm text-rose-900 break-words">
              {this.state.message || 'Unable to render the application.'}
              {this.state.detail && (
                <p className="mt-1.5 text-xs text-rose-700 font-mono">{this.state.detail}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
              >
                Reload Workspace
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
