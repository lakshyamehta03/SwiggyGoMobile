/**
 * Auth Service — Public API
 *
 * Backend-driven OAuth flow (replaces old mock OTP approach).
 * Old mock files are preserved in implementations/ and factories/ for reference.
 */

// API client (typed backend endpoints)
export { startAuth, getAuthStatus, getMe, AuthApiError } from './api-client';
export type {
  StartAuthResponse,
  AuthStatusResponse,
  UserMeResponse,
  AuthStatus,
} from './api-client';

// Polling engine
export { pollAuthStatus, PollingTimeoutError, PollingAbortedError, PollingFailedError } from './polling';
export type { PollingResult } from './polling';

// Secure storage
export { SecureStorage } from './secure-storage';
