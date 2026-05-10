/**
 * API Configuration
 *
 * Backend URL is read from EXPO_PUBLIC_API_URL env var.
 * Default: http://localhost:3000
 *
 * For device testing, set in .env:
 *   EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
 *
 * Expo automatically injects EXPO_PUBLIC_* vars at build time.
 */
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',

  endpoints: {
    startAuth: '/auth/start-auth',
    authStatus: (sessionId: string) => `/auth/status/${sessionId}`,
    me: '/auth/me',

    // Instamart
    instamartAddresses: '/instamart/addresses',
    instamartSearch: '/instamart/search',
    instamartCart: '/instamart/cart',
    instamartAddToCart: '/instamart/cart/add',
  },

  /** Polling parameters per API handoff doc */
  polling: {
    initialDelayMs: 2000,
    multiplier: 1.5,
    maxDelayMs: 10000,
    maxAttempts: 50, // ~5-7 minutes total per handoff doc
  },
} as const;
