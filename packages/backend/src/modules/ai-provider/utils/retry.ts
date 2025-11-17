/**
 * Simple exponential backoff helpers used by AI providers.
 */

export const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

export interface BackoffConfig {
  baseDelayMs: number;
  maxDelayMs: number;
  jitterMs?: number;
}

export const calculateBackoffDelay = (attempt: number, config: BackoffConfig): number => {
  const exponent = Math.max(attempt, 0);
  const exponentialDelay = Math.min(config.maxDelayMs, config.baseDelayMs * 2 ** exponent);
  const jitter = config.jitterMs ?? 100;
  const randomJitter = Math.random() * jitter;
  return Math.round(exponentialDelay + randomJitter);
};
