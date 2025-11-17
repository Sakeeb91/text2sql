import { describe, expect, it, vi } from 'vitest';

import { calculateBackoffDelay, sleep } from '../../src/modules/ai-provider/utils/retry';

describe('retry helpers', () => {
  it('calculates exponential delay with jitter', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // deterministic jitter

    const delay = calculateBackoffDelay(2, {
      baseDelayMs: 100,
      maxDelayMs: 1000,
      jitterMs: 0,
    });

    expect(delay).toBe(400);

    (Math.random as unknown as { mockRestore: () => void }).mockRestore();
  });

  it('sleeps for requested duration', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    void sleep(50).then(callback);
    vi.advanceTimersByTime(50);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
