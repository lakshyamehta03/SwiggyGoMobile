/**
 * Backend Auth API Client
 *
 * Typed wrapper for the 3 backend endpoints defined in
 * "API Handoff: Swiggy OAuth & Session Management".
 * Thin fetch layer — no state management, no storage, just HTTP.
 */

import { API_CONFIG } from '@/src/config/api-config';

// ─── DTOs (match backend contract exactly) ─────────────────────────────────

export type AuthStatus = 'PENDING' | 'AUTHENTICATED' | 'FAILED';

export interface StartAuthResponse {
  sessionId: string;
  authorizeUrl: string;
}

/** Matches `AuthSession` DTO from handoff doc */
export interface AuthStatusResponse {
  status: AuthStatus;
  sessionToken?: string; // Only when AUTHENTICATED
  error?: string;        // Only when FAILED
}

/** Matches `UserProfile` DTO from handoff doc */
export interface UserMeResponse {
  userId: string;
  authenticated: boolean;
}

// ─── Error Types ────────────────────────────────────────────────────────────

export class AuthApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isAuthExpired: boolean = false,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

// ─── Client ─────────────────────────────────────────────────────────────────

const { baseUrl, endpoints } = API_CONFIG;

/**
 * POST /auth/start-auth
 * Public — initiates OAuth flow, returns sessionId + authorizeUrl.
 */
export async function startAuth(): Promise<StartAuthResponse> {
  console.log("Starting auth...", `${baseUrl}${endpoints.startAuth}`);
  const res = await fetch(`${baseUrl}${endpoints.startAuth}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    console.log("start-auth failed", `${baseUrl}${endpoints.startAuth}`);
    throw new AuthApiError(
      `start-auth failed: ${res.status}`,
      res.status,
    );
  }

  return res.json();
}

/**
 * GET /auth/status/:sessionId
 * Public — polls for auth completion.
 */
export async function getAuthStatus(sessionId: string): Promise<AuthStatusResponse> {
  const res = await fetch(`${baseUrl}${endpoints.authStatus(sessionId)}`);

  if (res.status === 404) {
    // Session not found or expired (TTL: 1 hour per handoff doc)
    return { status: 'FAILED', error: 'Session expired or not found' };
  }

  if (!res.ok) {
    throw new AuthApiError(
      `auth-status failed: ${res.status}`,
      res.status,
    );
  }

  return res.json();
}

/**
 * GET /auth/me
 * Authenticated — validates session token.
 * Returns null if 401 (expired/invalid).
 */
export async function getMe(sessionToken: string): Promise<UserMeResponse | null> {
  const res = await fetch(`${baseUrl}${endpoints.me}`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  if (res.status === 401) {
    return null; // Session expired
  }

  if (!res.ok) {
    throw new AuthApiError(`/auth/me failed: ${res.status}`, res.status);
  }

  return res.json();
}
