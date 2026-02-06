import './index.css';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';

const App = lazy(() => import('./App'));
const AuthPage = lazy(() => import('./AuthPage'));

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
          <div className="max-w-lg bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-xl font-bold text-red-600 mb-2">Loading Error</h1>
            <pre className="text-sm text-gray-700 overflow-auto max-h-64 whitespace-pre-wrap break-words">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AuthRoute: React.FC = () => {
  return (
    <AuthPage
      onGuestContinue={async () => {
        localStorage.setItem('ctc_auth_method', 'guest');
        sessionStorage.setItem('ctc_from_auth', 'true');
        window.location.href = '/builder';
      }}
    />
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const Fallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-warm-50 text-gray-600">
    Loading…
  </div>
);

const routes = (
  <LanguageProvider>
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/builder" element={<App />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </LanguageProvider>
);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      {routes}
    </ErrorBoundary>
  </React.StrictMode>
);
