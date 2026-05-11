import React, { createContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '@/src/services/auth/implementations/AuthService';
import { secureStorage } from '@/src/services/auth/implementations/SecureStorage';
import { pollAuthStatus } from '@/src/services/auth/polling';
import { PollingAbortedError, PollingTimeoutError, PollingFailedError } from '@/src/services/auth/interfaces/errors';

// ─── State ─────────────────────────────────────────────────────────────────

export type AuthPhase =
  | 'initializing'     // Checking local storage + validating token on launch
  | 'unauthenticated'  // No valid session — show login
  | 'authenticating'   // Browser open + polling in progress
  | 'authenticated';   // Valid backendToken — show main app

export interface AuthState {
  phase: AuthPhase;
  backendToken: string | null;
  userId: string | null;
  error: string | null;
  pollingProgress: number; // 0-1
}

const initialState: AuthState = {
  phase: 'initializing',
  backendToken: null,
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
        backendToken: action.token,
        userId: action.userId,
        error: null,
        pollingProgress: 0,
      };

    case 'SET_UNAUTHENTICATED':
      return {
        phase: 'unauthenticated',
        backendToken: null,
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
  beginAuth: () => Promise<void>;
  cancelAuth: () => void;
  signOut: () => Promise<void>;
  invalidateSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const abortRef = useRef<AbortController | null>(null);

  // ── Session Recovery ────────────────────────────────────────────────

  const restoreSession = useCallback(async () => {
    try {
      const token = await secureStorage.getBackendToken();
      if (!token) {
        dispatch({ type: 'SET_UNAUTHENTICATED' });
        return;
      }

      const user = await authService.getMe(token);
      if (user?.authenticated) {
        dispatch({ type: 'SET_AUTHENTICATED', token, userId: user.userId });
      } else {
        await secureStorage.clearAll();
        dispatch({ type: 'SET_UNAUTHENTICATED' });
      }
    } catch (err) {
      console.error('[AuthStore] Recovery failed:', err);
      dispatch({ type: 'SET_UNAUTHENTICATED' });
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ── Auth Flow ───────────────────────────────────────────────────────

  const beginAuth = useCallback(async () => {
    dispatch({ type: 'SET_AUTHENTICATING' });

    try {
      const { sessionId, authorizeUrl } = await authService.startAuth();
      await secureStorage.savePollingSessionId(sessionId);

      WebBrowser.openBrowserAsync(authorizeUrl, { showInRecents: true })
        .catch(() => { /* handled by polling */ });

      const controller = new AbortController();
      abortRef.current = controller;

      const result = await pollAuthStatus(
        sessionId,
        controller.signal,
        (attempt, max) => dispatch({ type: 'SET_POLLING_PROGRESS', progress: attempt / max }),
      );

      await secureStorage.saveBackendToken(result.backendToken);
      await secureStorage.clearPollingSessionId();
      WebBrowser.dismissBrowser();

      dispatch({
        type: 'SET_AUTHENTICATED',
        token: result.backendToken,
        userId: result.userId ?? 'unknown',
      });

    } catch (err) {
      WebBrowser.dismissBrowser();
      await secureStorage.clearPollingSessionId();

      if (err instanceof PollingAbortedError) {
        dispatch({ type: 'SET_UNAUTHENTICATED' });
        return;
      }

      const message = err instanceof PollingTimeoutError 
        ? 'Login timed out' 
        : err instanceof PollingFailedError 
          ? err.message 
          : 'Authentication failed';

      dispatch({ type: 'SET_ERROR', error: message });
    }
  }, []);

  const cancelAuth = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    WebBrowser.dismissBrowser();
    dispatch({ type: 'SET_UNAUTHENTICATED' });
  }, []);

  const signOut = useCallback(async () => {
    await secureStorage.clearAll();
    dispatch({ type: 'SET_UNAUTHENTICATED' });
  }, []);

  const invalidateSession = useCallback(async () => {
    await secureStorage.clearAll();
    dispatch({ type: 'SET_UNAUTHENTICATED', error: 'Session expired' });
  }, []);

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
