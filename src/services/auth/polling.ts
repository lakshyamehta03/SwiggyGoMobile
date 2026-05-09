/**
 * Exponential Backoff Polling Engine
 *
 * Polls GET /auth/status/:sessionId until:
 *   - AUTHENTICATED → returns sessionToken
 *   - FAILED → throws with error message
 *   - Timeout (maxAttempts) → throws timeout error
 *   - Aborted (AbortController) → throws abort error
 *
 * Parameters from API handoff doc:
 *   Initial: 2s, multiplier: 1.5×, max: 10s, ~50 attempts (~5-7 min)
 *
 * Network errors are retried without incrementing the attempt counter.
 */

import { API_CONFIG } from '@/src/config/api-config';
import { getAuthStatus, type AuthStatusResponse } from './api-client';

export interface PollingResult {
  sessionToken: string;
}

export class PollingTimeoutError extends Error {
  constructor() {
    super('Authentication timed out. Please try again.');
    this.name = 'PollingTimeoutError';
  }
}

export class PollingAbortedError extends Error {
  constructor() {
    super('Authentication was cancelled.');
    this.name = 'PollingAbortedError';
  }
}

export class PollingFailedError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'PollingFailedError';
  }
}

/**
 * Start polling for auth completion.
 *
 * @param sessionId  - The sessionId from /auth/start-auth
 * @param signal     - AbortSignal to cancel polling (user taps "Cancel")
 * @param onTick     - Optional callback on each poll attempt (for UI progress)
 * @returns          - The sessionToken on success
 */
export async function pollAuthStatus(
  sessionId: string,
  signal?: AbortSignal,
  onTick?: (attempt: number, maxAttempts: number) => void,
): Promise<PollingResult> {
  const { initialDelayMs, multiplier, maxDelayMs, maxAttempts } = API_CONFIG.polling;

  let delay: number = initialDelayMs;
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Check if cancelled
    if (signal?.aborted) {
      throw new PollingAbortedError();
    }

    try {
      const response: AuthStatusResponse = await getAuthStatus(sessionId);

      if (response.status === 'AUTHENTICATED' && response.sessionToken) {
        return { sessionToken: response.sessionToken };
      }

      if (response.status === 'FAILED') {
        throw new PollingFailedError(response.error ?? 'Authentication denied');
      }

      // PENDING — continue polling
      attempts++;
      onTick?.(attempts, maxAttempts);

    } catch (err) {
      // Re-throw our own error types
      if (
        err instanceof PollingFailedError ||
        err instanceof PollingAbortedError
      ) {
        throw err;
      }

      // Network errors: retry without incrementing attempts
      console.warn(`[Polling] Network error (attempt ${attempts}):`, err);
    }

    // Wait with exponential backoff
    await sleep(delay, signal);
    delay = Math.min(delay * multiplier, maxDelayMs);
  }

  throw new PollingTimeoutError();
}

/** Abortable sleep */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new PollingAbortedError());
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new PollingAbortedError());
    }, { once: true });
  });
}
