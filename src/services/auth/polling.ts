import { API_CONFIG } from '@/src/config/api-config';
import { authService } from './implementations/AuthService';
import { PollingAbortedError, PollingFailedError, PollingTimeoutError } from './interfaces/errors';
import { AuthStatusResponse } from './interfaces/types';

export interface PollingResult {
  backendToken: string;
  userId?: string;
}

/**
 * Start polling for auth completion.
 *
 * @param sessionId  - The sessionId from /auth/start-auth
 * @param signal     - AbortSignal to cancel polling
 * @param onTick     - Optional callback on each poll attempt (for UI progress)
 * @returns          - The backend token and userId on success
 */
export async function pollAuthStatus(
  sessionId: string,
  signal?: AbortSignal,
  onTick?: (attempt: number, maxAttempts: number) => void,
): Promise<PollingResult> {
  const { initialDelayMs, multiplier, maxDelayMs, maxAttempts } = API_CONFIG.polling;

  let delay = initialDelayMs;
  let attempts = 0;

  while (attempts < maxAttempts) {
    if (signal?.aborted) throw new PollingAbortedError();

    try {
      const response: AuthStatusResponse = await authService.getAuthStatus(sessionId);

      if (response.status === 'AUTHENTICATED' && response.backendToken) {
        return {
          backendToken: response.backendToken,
          userId: response.userId,
        };
      }

      if (response.status === 'FAILED') {
        throw new PollingFailedError(response.error ?? 'Authentication denied');
      }

      // PENDING
      attempts++;
      onTick?.(attempts, maxAttempts);

    } catch (err) {
      if (err instanceof PollingFailedError || err instanceof PollingAbortedError) {
        throw err;
      }
      // Log and continue polling on network errors
      console.warn(`[Polling] Attempt ${attempts} failed:`, err);
    }

    await sleep(delay, signal);
    delay = Math.min(delay * multiplier, maxDelayMs);
  }

  throw new PollingTimeoutError();
}

/** Abortable sleep helper */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new PollingAbortedError());

    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new PollingAbortedError());
    }, { once: true });
  });
}
