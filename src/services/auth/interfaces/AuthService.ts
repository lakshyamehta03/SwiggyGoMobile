/**
 * Auth Service Interfaces
 *
 * All auth providers (Mock, Swiggy, Google) must implement IAuthService.
 * The UI layer depends ONLY on these interfaces.
 *
 * Migration path:
 *   Phase 1 (MVP):  MockAuthService    — works in Expo Go, simulated OTP
 *   Phase 2:        SwiggyAuthService  — real Swiggy login/OTP APIs
 *   Phase 3:        OAuth providers    — Google, Apple sign-in
 */

/** User profile returned after authentication */
export interface AuthUser {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

/** Session data persisted locally */
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp (ms)
}

/** Response from initiating OTP flow */
export interface OTPRequestResponse {
  success: boolean;
  /** Masked phone number for UI display (e.g., ******7890) */
  maskedPhone?: string;
  /** OTP length for UI input fields */
  otpLength: number;
  /** Seconds until OTP expires */
  expiresInSeconds: number;
  error?: string;
}

/** Response from verifying OTP */
export interface OTPVerifyResponse {
  success: boolean;
  session?: AuthSession;
  error?: string;
}

/**
 * The contract every auth provider must fulfill.
 * Swap providers by changing the factory — zero UI changes needed.
 */
export interface IAuthService {
  /** Human-readable name of this auth provider */
  readonly providerName: string;

  /** Request OTP for a phone number */
  requestOTP(phoneNumber: string): Promise<OTPRequestResponse>;

  /** Verify the OTP code */
  verifyOTP(phoneNumber: string, otpCode: string): Promise<OTPVerifyResponse>;

  /** Refresh an expired session */
  refreshSession(session: AuthSession): Promise<AuthSession | null>;

  /** Log out — invalidate session on server */
  logout(session: AuthSession): Promise<void>;
}
