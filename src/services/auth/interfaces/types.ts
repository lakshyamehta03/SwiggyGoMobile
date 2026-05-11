/**
 * Authentication Data Transfer Objects
 */

export type AuthStatus = 'PENDING' | 'AUTHENTICATED' | 'FAILED';

export interface StartAuthResponse {
  sessionId: string;
  authorizeUrl: string;
}

export interface AuthStatusResponse {
  sessionId: string;
  status: AuthStatus;
  userId?: string;
  backendToken?: string;
  error?: string;
}

export interface UserMeResponse {
  userId: string;
  authenticated: boolean;
}

export interface AuthSession {
  backendToken: string;
  userId: string;
}
