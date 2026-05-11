/**
 * Auth Service — Public API
 */

// Types & Interfaces
export * from './interfaces/types';
export * from './interfaces/errors';
export * from './interfaces/IAuthService';
export * from './interfaces/ISecureStorage';

// Implementations (Singletons)
export { authService } from './implementations/AuthService';
export { secureStorage as SecureStorage } from './implementations/SecureStorage';

// Polling
export { pollAuthStatus } from './polling';
export type { PollingResult } from './polling';
