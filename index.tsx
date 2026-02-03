
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import AuthPage from './AuthPage';

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

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthRoute />} />
        <Route path="/builder" element={<App />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

