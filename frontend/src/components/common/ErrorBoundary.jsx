import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
          <div className="card-panel p-8 max-w-md w-full text-center space-y-4 border-rose-500/40 bg-zinc-900/90 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <h2 className="text-xl font-bold text-zinc-100">Something went wrong</h2>

            <p className="text-xs text-zinc-400 leading-relaxed">
              AI LifeOS encountered an unhandled rendering state. Your data is safe in local persistence.
            </p>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-24">
              {this.state.error?.toString() || 'Unknown runtime exception'}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              Reload AI LifeOS
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
