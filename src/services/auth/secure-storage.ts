import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'AUTH_TOKEN';
const POLLING_SESSION_KEY = 'swiggygo_polling_session_id';

/**
 * Secure storage wrapper for auth data.
 *
 * Stores TWO things:
 * 1. sessionToken (JWT from backend) — the persistent login credential
 * 2. pollingSessionId (temporary) — the active auth attempt ID for polling
 *
 * Uses expo-secure-store (encrypted keychain/keystore).
 * Never stores Swiggy OAuth tokens — those live on the backend only.
 */
export const SecureStorage = {
  // ─── Session Token (persistent login) ─────────────────────────

  async saveSessionToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
    } catch (e) {
      console.warn('[SecureStorage] Failed to save session token:', e);
    }
  },

  async getSessionToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    } catch (e) {
      console.warn('[SecureStorage] Failed to read session token:', e);
      return null;
    }
  },

  async clearSessionToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    } catch (e) {
      console.warn('[SecureStorage] Failed to clear session token:', e);
    }
  },

  // ─── Polling Session ID (temporary, for active auth attempt) ──

  async savePollingSessionId(sessionId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(POLLING_SESSION_KEY, sessionId);
    } catch (e) {
      console.warn('[SecureStorage] Failed to save polling session ID:', e);
    }
  },

  async getPollingSessionId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(POLLING_SESSION_KEY);
    } catch (e) {
      console.warn('[SecureStorage] Failed to read polling session ID:', e);
      return null;
    }
  },

  async clearPollingSessionId(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(POLLING_SESSION_KEY);
    } catch (e) {
      console.warn('[SecureStorage] Failed to clear polling session ID:', e);
    }
  },

  // ─── Full Cleanup ─────────────────────────────────────────────

  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearSessionToken(),
      this.clearPollingSessionId(),
    ]);
  },
};
