declare global {
  interface Window {
    google?: any;
  }
}

declare const __VITE_GOOGLE_CLIENT_ID__: string | undefined;

function getGoogleClientId(): string | undefined {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || __VITE_GOOGLE_CLIENT_ID__;
}

/** Load Google GSI script dynamically (avoids blocking initial page load) */
export function loadGoogleScript(): Promise<void> {
  if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google script failed to load'));
    document.head.appendChild(script);
  });
}

export function waitForGoogleScript(): Promise<void> {
  return loadGoogleScript().then(
    () =>
      new Promise<void>((resolve, reject) => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          if (window.google?.accounts?.id) {
            clearInterval(checkInterval);
            resolve();
          } else if (attempts > 50) {
            clearInterval(checkInterval);
            reject(new Error('Google Identity script failed to load'));
          }
        }, 100);
      })
  );
}

export function initializeGoogleSignIn(
  callback: (credential: string) => void,
  onError: (error: Error) => void
): void {
  const CLIENT_ID = getGoogleClientId();
  if (!CLIENT_ID) {
    onError(new Error('Missing VITE_GOOGLE_CLIENT_ID. Check your .env.local file.'));
    return;
  }

  waitForGoogleScript()
    .then(() => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: any) => {
          if (response && response.credential) {
            callback(response.credential);
          } else {
            onError(new Error('No credential returned'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    })
    .catch(onError);
}

export async function signInWithGoogle(): Promise<string> {
  const CLIENT_ID = getGoogleClientId();
  if (!CLIENT_ID) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID. Check your .env.local file.');
  }

  await waitForGoogleScript();

  return new Promise((resolve, reject) => {
    try {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: any) => {
          if (response && response.credential) {
            resolve(response.credential);
          } else {
            reject(new Error('No credential returned'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Try One Tap first
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          // One Tap not available - user needs to click button
          // This is expected for first-time users
          // The button click will trigger the flow
        } else if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
          reject(new Error('Sign-in was cancelled'));
        }
      });
    } catch (err) {
      reject(err instanceof Error ? err : new Error('Google sign-in failed'));
    }
  });
}

