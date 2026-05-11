import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ISecureStorage } from '../interfaces/ISecureStorage';

const KEYS = {
  BACKEND_TOKEN: 'swiggygo_backend_token',
  POLLING_SESSION_ID: 'swiggygo_polling_session_id',
} as const;

/**
 * SecureStorageAdapter
 * 
 * Uses expo-secure-store on native platforms.
 * Falls back to localStorage on Web (since SecureStore is not fully supported).
 */
export class SecureStorageAdapter implements ISecureStorage {
  private isWeb = Platform.OS === 'web';

  async saveBackendToken(token: string): Promise<void> {
    if (this.isWeb) {
      localStorage.setItem(KEYS.BACKEND_TOKEN, token);
      return;
    }
    await SecureStore.setItemAsync(KEYS.BACKEND_TOKEN, token);
  }

  async getBackendToken(): Promise<string | null> {
    if (this.isWeb) {
      return localStorage.getItem(KEYS.BACKEND_TOKEN);
    }
    return await SecureStore.getItemAsync(KEYS.BACKEND_TOKEN);
  }

  async clearBackendToken(): Promise<void> {
    if (this.isWeb) {
      localStorage.removeItem(KEYS.BACKEND_TOKEN);
      return;
    }
    await SecureStore.deleteItemAsync(KEYS.BACKEND_TOKEN);
  }

  async savePollingSessionId(id: string): Promise<void> {
    if (this.isWeb) {
      localStorage.setItem(KEYS.POLLING_SESSION_ID, id);
      return;
    }
    await SecureStore.setItemAsync(KEYS.POLLING_SESSION_ID, id);
  }

  async getPollingSessionId(): Promise<string | null> {
    if (this.isWeb) {
      return localStorage.getItem(KEYS.POLLING_SESSION_ID);
    }
    return await SecureStore.getItemAsync(KEYS.POLLING_SESSION_ID);
  }

  async clearPollingSessionId(): Promise<void> {
    if (this.isWeb) {
      localStorage.removeItem(KEYS.POLLING_SESSION_ID);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(KEYS.POLLING_SESSION_ID);
    } catch (e) {
      console.warn('SecureStore.deleteItemAsync failed', e);
    }
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearBackendToken(),
      this.clearPollingSessionId(),
    ]);
  }

  async getItem(key: string): Promise<string | null> {
    if (this.isWeb) {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (this.isWeb) {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
}

/**
 * Singleton instance of SecureStorageAdapter
 */
export const secureStorage = new SecureStorageAdapter();
