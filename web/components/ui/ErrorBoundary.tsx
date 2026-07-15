"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-dvh bg-[#060609] flex items-center justify-center p-8">
          <div className="glass-card max-w-md w-full text-center flex flex-col items-center gap-6 p-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5546FF] to-[#fc6432] flex items-center justify-center shadow-lg shadow-[#5546FF]/20">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                An unexpected error occurred. Please try again.
              </p>
            </div>
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 rounded-xl bg-[#5546FF] text-white font-semibold text-sm hover:bg-[#4436EE] transition-all active:scale-[0.98]"
            >
              Retry
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
