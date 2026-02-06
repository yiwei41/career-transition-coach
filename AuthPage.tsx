import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { waitForGoogleScript } from './googleAuth';
import { useLanguage } from './LanguageContext';

declare global {
  interface Window {
    google?: any;
  }
}

type Mode = 'login' | 'signup';

interface AuthPageProps {
  onGoogleSignIn?: () => Promise<void> | void;
  onEmailLogin?: (email: string, password: string) => Promise<void> | void;
  onEmailSignup?: (email: string, password: string) => Promise<void> | void;
  onGuestContinue?: () => Promise<void> | void;
}

const AuthPage: React.FC<AuthPageProps> = ({
  onGoogleSignIn,
  onEmailLogin,
  onEmailSignup,
  onGuestContinue,
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('login');
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoogleButton, setShowGoogleButton] = useState(false);
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email';
    if (!password.trim()) return 'Password is required';
    if (password.length < 6) return 'Min 6 characters';
    return null;
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setEmailLoading(true);
    try {
      if (mode === 'login') {
        if (onEmailLogin) {
          await onEmailLogin(email, password);
        } else {
          await new Promise((res) => setTimeout(res, 500));
          console.log('Email login', { email });
        }
      } else {
        if (onEmailSignup) {
          await onEmailSignup(email, password);
        } else {
          await new Promise((res) => setTimeout(res, 500));
          console.log('Email signup', { email });
        }
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError(null);
  };

  useEffect(() => {
    let isMounted = true;
    
    // Initialize Google Sign-In callback when component mounts
    waitForGoogleScript()
      .then(() => {
        if (!isMounted) return;
        
        const CLIENT_ID =
          import.meta.env.VITE_GOOGLE_CLIENT_ID || __VITE_GOOGLE_CLIENT_ID__;
        if (!CLIENT_ID || !window.google?.accounts?.id) {
          console.error('Google Client ID missing or script not loaded');
          setShowGoogleButton(false);
          return;
        }

        // Initialize callback - this MUST be called before renderButton
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response: any) => {
            console.log('Google callback received:', response);
            if (response && response.credential) {
              localStorage.setItem('ctc_google_id_token', response.credential);
              localStorage.setItem('ctc_auth_method', 'google');
              // Try to decode user info from JWT token
              try {
                const payload = JSON.parse(atob(response.credential.split('.')[1]));
                localStorage.setItem('ctc_google_user', JSON.stringify(payload));
              } catch (e) {
                console.error('Failed to decode Google token', e);
              }
              sessionStorage.setItem('ctc_from_auth', 'true');
              window.location.href = '/builder';
            } else {
              setError('No credential returned from Google');
              setGoogleLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render Google button
        if (googleButtonRef.current && isMounted) {
          try {
            // Clear any existing content
            googleButtonRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              type: 'standard',
              theme: 'filled_blue',
              size: 'large',
              text: 'signin_with',
              // Google expects a number here; using '100%' triggers GSI_LOGGER warnings.
              width: 320,
            });
            setShowGoogleButton(true);
            console.log('Google button rendered successfully');
          } catch (err) {
            console.error('Failed to render Google button:', err);
            setShowGoogleButton(false);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load Google script:', err);
        if (isMounted) {
          setShowGoogleButton(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGoogle = async () => {
    // Fallback handler for when Google button doesn't render or doesn't work
    setError(null);
    setGoogleLoading(true);
    try {
      console.log('Starting Google login...');
      await waitForGoogleScript();
      console.log('Google script loaded');
      
      const CLIENT_ID =
        import.meta.env.VITE_GOOGLE_CLIENT_ID || __VITE_GOOGLE_CLIENT_ID__;
      console.log('CLIENT_ID:', CLIENT_ID ? 'Found' : 'Missing');
      
      if (!CLIENT_ID) {
        throw new Error('Google Client ID not configured. Check your .env.local file.');
      }
      if (!window.google?.accounts?.id) {
        throw new Error('Google Identity script not loaded');
      }

      // Re-initialize to ensure callback is set
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: any) => {
          console.log('Google callback (fallback) received:', response);
          if (response && response.credential) {
            localStorage.setItem('ctc_google_id_token', response.credential);
            localStorage.setItem('ctc_auth_method', 'google');
            window.location.href = '/builder';
          } else {
            setError('No credential returned from Google');
            setGoogleLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      console.log('Google initialized, trying prompt...');
      
      // Try One Tap prompt
      window.google.accounts.id.prompt((notification: any) => {
        console.log('One Tap notification:', notification);
        if (notification.isNotDisplayed()) {
          console.log('One Tap not displayed - trying alternative method');
          // One Tap not available - create a popup button instead
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'fixed';
          tempDiv.style.left = '50%';
          tempDiv.style.top = '50%';
          tempDiv.style.transform = 'translate(-50%, -50%)';
          tempDiv.style.zIndex = '10000';
          tempDiv.style.backgroundColor = 'white';
          tempDiv.style.padding = '20px';
          tempDiv.style.borderRadius = '8px';
          tempDiv.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          document.body.appendChild(tempDiv);

          window.google.accounts.id.renderButton(tempDiv, {
            type: 'standard',
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
          });

          // Auto-click after render
          setTimeout(() => {
            const button = tempDiv.querySelector('div[role="button"]') as HTMLElement;
            if (button) {
              console.log('Clicking Google button...');
              button.click();
            } else {
              console.error('Google button not found in temp div');
              document.body.removeChild(tempDiv);
              setError('Failed to render Google sign-in. Please refresh and try again.');
              setGoogleLoading(false);
            }
          }, 500);
        } else if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
          setError('Google sign-in was cancelled. Please try again.');
          setGoogleLoading(false);
        }
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed';
      setError(msg);
      console.error('Google sign-in error:', e);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-warm-200 rounded-3xl px-6 py-8 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white mb-2" aria-hidden="true">
              <i className="fas fa-sparkles" aria-hidden="true"></i>
            </div>
            <span className="text-sm font-medium text-gray-500 mb-3 tracking-tight">Coach.Ai</span>
            <h1 className="text-gray-900 text-xl font-medium tracking-normal leading-snug text-center">
              {t.auth.welcome}
            </h1>
          </div>

          {/* Google renders its own button into this container.
              IMPORTANT: do not render React children inside the same node, or React
              can crash during reconciliation (removeChild errors). */}
          <div ref={googleButtonRef} className="mb-1 flex justify-center min-h-[48px]" />

          {/* Fallback button (separate node to avoid DOM conflicts) */}
          {!showGoogleButton && (
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || emailLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-gray-900 text-sm font-semibold py-3.5 shadow-sm border border-warm-200 hover:bg-warm-50 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-busy={googleLoading}
            >
              {googleLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <i className="fab fa-google text-base" aria-hidden="true" />
                  <span>{t.auth.googleSignIn}</span>
                </>
              )}
            </button>
          )}

          <p className="text-[11px] text-gray-500 mb-6 text-center leading-relaxed max-w-[260px] mx-auto">
            {t.auth.privacyNote}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Guest continue button clicked');
              try {
                localStorage.setItem('ctc_auth_method', 'guest');
                console.log('Stored guest auth method, navigating to /builder');
                if (onGuestContinue) {
                  onGuestContinue();
                }
                // Force navigation
                window.location.href = '/builder';
              } catch (err) {
                console.error('Error in guest continue:', err);
                alert('Error: ' + (err instanceof Error ? err.message : String(err)));
              }
            }}
            className="w-full text-xs text-gray-600 mb-2 underline underline-offset-4 decoration-gray-400 hover:text-gray-900 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-full py-1 cursor-pointer"
          >
            {t.auth.guestContinue}
          </button>

          <div className="flex items-center mb-2">
            <div className="flex-1 h-px bg-warm-200" />
            <span className="mx-3 text-[11px] text-gray-400">
              or
            </span>
            <div className="flex-1 h-px bg-warm-200" />
          </div>
          <button
            type="button"
            onClick={() => setShowEmail((v) => !v)}
            className="w-full text-xs text-gray-600 underline underline-offset-4 decoration-gray-400 hover:text-primary-600 text-center mb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-full py-2 transition-colors"
          >
            {showEmail ? t.auth.hideEmail : t.auth.useEmail}
          </button>

          {showEmail && (
            <form className="mt-3 space-y-3" onSubmit={handleEmailSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-600"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-warm-50 border border-warm-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-600"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-warm-50 border border-warm-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 mt-1" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={googleLoading || emailLoading}
                className="w-full inline-flex items-center justify-center rounded-full bg-primary-600 text-white text-sm font-semibold py-2.5 mt-1 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-busy={emailLoading}
              >
                {emailLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin mr-2" />
                    {mode === 'login' ? 'Logging in…' : 'Creating…'}
                  </>
                ) : mode === 'login' ? (
                  t.auth.logIn
                ) : (
                  t.auth.createAccount
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-gray-500">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={toggleMode}
                className="hover:text-primary-600 underline underline-offset-2 decoration-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-full px-1 py-0.5 transition-colors"
              >
                {t.auth.newHere} <span className="font-medium">{t.auth.createAccount}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleMode}
                className="hover:text-primary-600 underline underline-offset-2 decoration-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-full px-1 py-0.5 transition-colors"
              >
                {t.auth.alreadyHaveAccount} <span className="font-medium">{t.auth.logIn}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

