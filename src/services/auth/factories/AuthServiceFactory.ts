import type { IAuthService } from '../interfaces/AuthService';
import { MockAuthService } from '../implementations/MockAuthService';

export type AuthProviderType = 'mock' | 'swiggy';

/**
 * Factory for creating auth service instances.
 *
 * Usage:
 *   const auth = AuthServiceFactory.create('mock');
 *   const otpResponse = await auth.requestOTP('9876543210');
 *
 * Swapping to real Swiggy auth is a one-line change:
 *   AuthServiceFactory.create('swiggy');
 */
export class AuthServiceFactory {
  private static instances = new Map<AuthProviderType, IAuthService>();

  static create(provider: AuthProviderType = 'mock'): IAuthService {
    const cached = this.instances.get(provider);
    if (cached) return cached;

    let service: IAuthService;

    switch (provider) {
      case 'mock':
        service = new MockAuthService();
        break;

      case 'swiggy':
        // Phase 2: Real Swiggy auth integration
        // import { SwiggyAuthService } from '../implementations/SwiggyAuthService';
        // service = new SwiggyAuthService(SWIGGY_API_BASE_URL);
        throw new Error(
          'SwiggyAuthService is not yet implemented. ' +
          'Create src/services/auth/implementations/SwiggyAuthService.ts ' +
          'implementing IAuthService with real Swiggy OTP APIs.'
        );

      default:
        throw new Error(`Unknown auth provider: "${provider}"`);
    }

    this.instances.set(provider, service);
    return service;
  }

  static clearInstances(): void {
    this.instances.clear();
  }
}
