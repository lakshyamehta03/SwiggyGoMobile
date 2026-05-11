import { IAuthService } from '../interfaces/IAuthService';
import { StartAuthResponse, AuthStatusResponse, UserMeResponse } from '../interfaces/types';
import { API_CONFIG } from '@/src/config/api-config';

export class AuthApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

export class AuthService implements IAuthService {
  private readonly baseUrl: string;
  private readonly endpoints: typeof API_CONFIG.endpoints;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.endpoints = API_CONFIG.endpoints;
  }

  async startAuth(): Promise<StartAuthResponse> {
    const url = `${this.baseUrl}${this.endpoints.startAuth}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new AuthApiError(`Failed to start auth: ${res.statusText}`, res.status);
    }

    return res.json();
  }

  async getAuthStatus(sessionId: string): Promise<AuthStatusResponse> {
    const url = `${this.baseUrl}${this.endpoints.authStatus(sessionId)}`;
    const res = await fetch(url);

    if (res.status === 404) {
      return { sessionId, status: 'FAILED', error: 'Session not found' };
    }

    if (!res.ok) {
      throw new AuthApiError(`Failed to get auth status: ${res.statusText}`, res.status);
    }

    return res.json();
  }

  async getMe(token: string): Promise<UserMeResponse | null> {
    const url = `${this.baseUrl}${this.endpoints.me}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      return null;
    }

    if (!res.ok) {
      throw new AuthApiError(`Failed to get user info: ${res.statusText}`, res.status);
    }

    return res.json();
  }
}

/**
 * Singleton instance of AuthService
 */
export const authService = new AuthService();
