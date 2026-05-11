import { StartAuthResponse, AuthStatusResponse, UserMeResponse } from './types';

/**
 * Service for interacting with the backend authentication API.
 */
export interface IAuthService {
  /**
   * Initiates the OAuth flow with the backend.
   * @returns sessionId and the URL to open in the browser.
   */
  startAuth(): Promise<StartAuthResponse>;

  /**
   * Checks the status of an ongoing authentication session.
   * @param sessionId The ID returned by startAuth.
   */
  getAuthStatus(sessionId: string): Promise<AuthStatusResponse>;

  /**
   * Validates the current backend token and retrieves user info.
   * @param token The JWT backend token.
   * @returns User info or null if the token is invalid/expired.
   */
  getMe(token: string): Promise<UserMeResponse | null>;
}
