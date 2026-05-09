import React, { createContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import {
  startAuth,
  getMe,
  pollAuthStatus,
  SecureStorage,
  PollingTimeoutError,
  PollingAbortedError,
  PollingFailedError,
} from '@/src/services/auth';

// ─── State ─────────────────────────────────────────────────────────────────

export type AuthPhase =
  | 'initializing'     // Checking SecureStore + /auth/me on app launch
  | 'unauthenticated'  // No valid session — show login
  | 'authenticating'   // Browser open + polling in progress
  | 'authenticated';   // Valid sessionToken — show main app

export interface AuthState {
  phase: AuthPhase;
  sessionToken: string | null;
  userId: string | null;
  error: string | null;
  /** Polling progress (0–1) for UI indicator */
  pollingProgress: number;
}

const initialState: AuthState = {
  phase: 'initializing',
  sessionToken: null,
  userId: null,
  error: null,
  pollingProgress: 0,
};

// ─── Actions ───────────────────────────────────────────────────────────────

type AuthAction =
  | { type: 'SET_INITIALIZING' }
  | { type: 'SET_AUTHENTICATED'; token: string; userId: string }
  | { type: 'SET_UNAUTHENTICATED'; error?: string }
  | { type: 'SET_AUTHENTICATING' }
  | { type: 'SET_POLLING_PROGRESS'; progress: number }
  | { type: 'SET_ERROR'; error: string };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_INITIALIZING':
      return { ...state, phase: 'initializing', error: null };

    case 'SET_AUTHENTICATED':
      return {
        phase: 'authenticated',
        sessionToken: action.token,
        userId: action.userId,
        error: null,
        pollingProgress: 0,
      };

    case 'SET_UNAUTHENTICATED':
      return {
        phase: 'unauthenticated',
        sessionToken: null,
        userId: null,
        error: action.error ?? null,
        pollingProgress: 0,
      };

    case 'SET_AUTHENTICATING':
      return { ...state, phase: 'authenticating', error: null, pollingProgress: 0 };

    case 'SET_POLLING_PROGRESS':
      return { ...state, pollingProgress: action.progress };

    case 'SET_ERROR':
      return { ...state, error: action.error, phase: 'unauthenticated' };

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────

interface AuthContextValue {
  state: AuthState;
  /** Initiate the full backend-driven OAuth flow */
  beginAuth: () => Promise<void>;
  /** Cancel an in-progress auth attempt */
  cancelAuth: () => void;
  /** Log out and clear stored session */
  signOut: () => Promise<void>;
  /** Force re-authentication (called on 401) */
  invalidateSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const abortRef = useRef<AbortController | null>(null);

  // ── On mount: restore session from SecureStore ──────────────────────

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStorage.getSessionToken();

        if (!token) {
          dispatch({ type: 'SET_UNAUTHENTICATED' });
          return;
        }

        // Validate session against backend
        const meResult = await getMe(token);

        if (meResult && meResult.authenticated) {
          dispatch({ type: 'SET_AUTHENTICATED', token, userId: meResult.userId });
        } else {
          // Token expired or invalid — clear and require re-auth
          await SecureStorage.clearSessionToken();
          dispatch({ type: 'SET_UNAUTHENTICATED' });
        }
      } catch {
        // Network error during validation — if we have a token, 
        // trust it temporarily (offline support)
        const token = await SecureStorage.getSessionToken();
        if (token) {
          dispatch({ type: 'SET_AUTHENTICATED', token, userId: 'offline' });
        } else {
          dispatch({ type: 'SET_UNAUTHENTICATED' });
        }
      }
    })();
  }, []);

  // ── Begin OAuth flow ────────────────────────────────────────────────

  const beginAuth = useCallback(async () => {
    dispatch({ type: 'SET_AUTHENTICATING' });

    try {
      // 1. Call backend to start OAuth flow
      const { sessionId, authorizeUrl } = await startAuth();

      // 2. Store the polling sessionId
      await SecureStorage.savePollingSessionId(sessionId);

      // 3. Open the Swiggy OAuth URL in system browser
      //    Using openBrowserAsync (not openAuthSessionAsync) since
      //    we don't have deep linking for MVP.
      WebBrowser.openBrowserAsync(authorizeUrl, {
        showInRecents: true,
      }).catch(() => {
        // Browser dismissed by user — polling handles this
      });

      // 4. Create AbortController for cancellation
      const controller = new AbortController();
      abortRef.current = controller;

      // 5. Start polling with exponential backoff
      const result = await pollAuthStatus(
        sessionId,
        controller.signal,
        (attempt, maxAttempts) => {
          dispatch({
            type: 'SET_POLLING_PROGRESS',
            progress: attempt / maxAttempts,
          });
        },
      );

      // 6. Success! Store the session token
      await SecureStorage.saveSessionToken(result.sessionToken);
      await SecureStorage.clearPollingSessionId();

      // 7. Dismiss the browser
      WebBrowser.dismissBrowser();

      // 8. Validate the new token to get userId
      const meResult = await getMe(result.sessionToken);
      const userId = meResult?.userId ?? 'unknown';

      dispatch({
        type: 'SET_AUTHENTICATED',
        token: result.sessionToken,
        userId,
      });

    } catch (err) {
      WebBrowser.dismissBrowser();
      await SecureStorage.clearPollingSessionId();

      if (err instanceof PollingAbortedError) {
        dispatch({ type: 'SET_UNAUTHENTICATED', error: undefined });
        return;
      }

      const message =
        err instanceof PollingTimeoutError
          ? 'Login timed out. Please try again.'
          : err instanceof PollingFailedError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Authentication failed';

      dispatch({ type: 'SET_UNAUTHENTICATED', error: message });
    }
  }, []);

  // ── Cancel auth ─────────────────────────────────────────────────────

  const cancelAuth = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    WebBrowser.dismissBrowser();
    dispatch({ type: 'SET_UNAUTHENTICATED' });
  }, []);

  // ── Sign out ────────────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    await SecureStorage.clearAll();
    dispatch({ type: 'SET_UNAUTHENTICATED' });
  }, []);

  // ── Invalidate session (called on 401) ──────────────────────────────

  const invalidateSession = useCallback(async () => {
    await SecureStorage.clearAll();
    dispatch({ type: 'SET_UNAUTHENTICATED', error: 'Session expired. Please log in again.' });
  }, []);

  // ── Context value ───────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({ state, beginAuth, cancelAuth, signOut, invalidateSession }),
    [state, beginAuth, cancelAuth, signOut, invalidateSession],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
