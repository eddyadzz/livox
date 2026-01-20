
import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Fix: Explicitly define the class component to satisfy TypeScript's property checks on state and props
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly declare the state field for strict TypeScript environments
  public override state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-8 text-center">
            <AlertTriangle size={64} className="text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
            <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}
