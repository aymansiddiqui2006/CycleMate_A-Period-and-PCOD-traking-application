import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-pink-50/30">
          <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full text-center mx-4 border border-pink-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              We encountered an unexpected error. Don't worry — your data is safe!
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/dashboard';
              }}
              className="flex items-center gap-2 mx-auto bg-gradient-to-r from-[#FF6B8A] to-pink-400 text-white font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all"
            >
              <RefreshCw size={18} />
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
