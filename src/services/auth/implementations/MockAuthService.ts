import type {
  IAuthService,
  OTPRequestResponse,
  OTPVerifyResponse,
  AuthSession,
  AuthUser,
} from '../interfaces/AuthService';

/**
 * MockAuthService — Phase 1 auth provider.
 *
 * Simulates realistic Swiggy phone-number OTP login:
 * - Any valid 10-digit Indian phone number is accepted
 * - OTP "1234" always succeeds (or any 4-digit code after 2s delay)
 * - Returns a mock session with a fake JWT-like token
 * - Simulates network delay (500–1000ms)
 *
 * Works fully in Expo Go — no backend needed.
 */
export class MockAuthService implements IAuthService {
  readonly providerName = 'mock';

  private otpStore = new Map<string, { code: string; expiresAt: number }>();

  async requestOTP(phoneNumber: string): Promise<OTPRequestResponse> {
    // Simulate network delay
    await this.delay(500, 1000);

    // Validate phone number (Indian 10-digit)
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      return {
        success: false,
        otpLength: 4,
        expiresInSeconds: 0,
        error: 'Please enter a valid 10-digit phone number',
      };
    }

    // Generate mock OTP (always "1234" for easy testing)
    const otp = '1234';
    this.otpStore.set(cleaned, {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    console.log(`[MockAuth] OTP for ${cleaned}: ${otp}`);

    return {
      success: true,
      maskedPhone: `******${cleaned.slice(-4)}`,
      otpLength: 4,
      expiresInSeconds: 300,
    };
  }

  async verifyOTP(phoneNumber: string, otpCode: string): Promise<OTPVerifyResponse> {
    // Simulate network delay
    await this.delay(800, 1500);

    const cleaned = phoneNumber.replace(/\D/g, '');
    const stored = this.otpStore.get(cleaned);

    // Accept "1234" always, or the stored OTP
    if (otpCode !== '1234' && (!stored || stored.code !== otpCode)) {
      return {
        success: false,
        error: 'Invalid OTP. Please try again.',
      };
    }

    // Check expiry
    if (stored && Date.now() > stored.expiresAt) {
      return {
        success: false,
        error: 'OTP has expired. Please request a new one.',
      };
    }

    // Clean up
    this.otpStore.delete(cleaned);

    // Generate mock session
    const user: AuthUser = {
      id: `user_${cleaned.slice(-4)}_${Date.now()}`,
      phoneNumber: cleaned,
      name: 'SwiggyGo User',
    };

    const session: AuthSession = {
      user,
      accessToken: `mock_token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    return { success: true, session };
  }

  async refreshSession(session: AuthSession): Promise<AuthSession | null> {
    await this.delay(300, 600);

    // Mock: always return a renewed session
    return {
      ...session,
      accessToken: `mock_token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
  }

  async logout(_session: AuthSession): Promise<void> {
    await this.delay(200, 400);
    // Mock: nothing to invalidate server-side
  }

  private delay(minMs: number, maxMs: number): Promise<void> {
    const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
