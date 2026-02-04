import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Always load env from the project root (this file's directory),
  // not from the current working directory of the running process.
  //
  // Vite's `loadEnv` filters by prefixes; in some setups using '' can behave
  // unexpectedly, so we load both and merge to be safe.
  const envAll = loadEnv(mode, __dirname, '');
  const envVite = loadEnv(mode, __dirname, 'VITE_');
  const env = { ...envAll, ...envVite };

  // Safe, non-secret startup signal to help debug env loading.
  // (This prints only a boolean, not the value.)
  // eslint-disable-next-line no-console
  console.log('[env] mode:', mode);
  // eslint-disable-next-line no-console
  console.log('[env] VITE_GOOGLE_CLIENT_ID loaded:', Boolean(env.VITE_GOOGLE_CLIENT_ID));
  // eslint-disable-next-line no-console
  console.log('[env] GEMINI_API_KEY loaded:', Boolean(env.GEMINI_API_KEY));
  // eslint-disable-next-line no-console
  console.log('[env] process.env has VITE_GOOGLE_CLIENT_ID:', Boolean(process.env.VITE_GOOGLE_CLIENT_ID));
  // eslint-disable-next-line no-console
  console.log('[env] process.env has GEMINI_API_KEY:', Boolean(process.env.GEMINI_API_KEY));

  // Extra diagnostics to confirm whether the env file is readable and contains the expected keys.
  // We do NOT print any secret values.
  try {
    const envFilePath = path.resolve(__dirname, '.env.local');
    const exists = fs.existsSync(envFilePath);
    const contents = exists ? fs.readFileSync(envFilePath, 'utf8') : '';
    // eslint-disable-next-line no-console
    console.log('[env] .env.local exists:', exists);
    // eslint-disable-next-line no-console
    console.log('[env] .env.local contains VITE_GOOGLE_CLIENT_ID key:', /^\s*VITE_GOOGLE_CLIENT_ID\s*=/m.test(contents));
    // eslint-disable-next-line no-console
    console.log('[env] .env.local contains GEMINI_API_KEY key:', /^\s*GEMINI_API_KEY\s*=/m.test(contents));

    // Print detected key names (NOT values) to debug unicode/hidden characters.
    const lines = contents.split(/\r?\n/);
    const keys = lines
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => l.split('=')[0]);
    // eslint-disable-next-line no-console
    console.log('[env] .env.local keys detected:', keys.map((k) => JSON.stringify(k)).join(', '));
    // eslint-disable-next-line no-console
    console.log(
      '[env] key match check VITE_GOOGLE_CLIENT_ID:',
      keys.some((k) => k === 'VITE_GOOGLE_CLIENT_ID')
    );
    const maybeVite = keys.find((k) => k.toLowerCase().includes('vite') || k.toLowerCase().includes('google'));
    if (maybeVite) {
      // eslint-disable-next-line no-console
      console.log(
        '[env] suspicious key codepoints:',
        Array.from(maybeVite)
          .map((ch) => ch.codePointAt(0)?.toString(16))
          .join(' ')
      );
    }
  } catch {
    // eslint-disable-next-line no-console
    console.log('[env] .env.local read failed');
  }

  return {
    envDir: __dirname,
    server: {
      port: 3000,
      host: '0.0.0.0',
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
    },
    plugins: [react()],
    define: {
      // Gemini key (support both old/new naming)
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY),

      // Google client id (prefer VITE_*, keep legacy key as fallback)
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID),
      __VITE_GOOGLE_CLIENT_ID__: JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID),

      // Supabase
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
