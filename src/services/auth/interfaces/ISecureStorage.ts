/**
 * Interface for secure local storage of sensitive auth data.
 */
export interface ISecureStorage {
  /** Saves the backend JWT token */
  saveBackendToken(token: string): Promise<void>;
  
  /** Retrieves the backend JWT token */
  getBackendToken(): Promise<string | null>;
  
  /** Clears the backend JWT token */
  clearBackendToken(): Promise<void>;

  /** Saves the current polling session ID (for recovery) */
  savePollingSessionId(id: string): Promise<void>;
  
  /** Retrieves the current polling session ID */
  getPollingSessionId(): Promise<string | null>;
  
  /** Clears the current polling session ID */
  clearPollingSessionId(): Promise<void>;

  /** Clears all auth data */
  clearAll(): Promise<void>;

  /** Generic storage methods with web fallback */
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
