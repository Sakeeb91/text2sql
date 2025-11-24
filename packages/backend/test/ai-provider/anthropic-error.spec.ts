import { APIError } from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';

import {
  classifyAnthropicError,
  isRetryableAnthropicError,
} from '../../src/modules/ai-provider/utils/anthropic-error';

describe('classifyAnthropicError', () => {
  it('marks rate limit errors as retryable', () => {
    const error = new APIError(
      429,
      { type: 'rate_limit_error', message: 'Too many' },
      'Too many',
      new Headers()
    );

    const result = classifyAnthropicError(error);

    expect(result.rateLimited).toBe(true);
    expect(result.retryable).toBe(true);
    expect(result.status).toBe(429);
  });

  it('treats overloaded errors as retryable', () => {
    const error = new APIError(
      529,
      { type: 'overloaded_error', message: 'Busy' },
      'Busy',
      new Headers()
    );

    const result = classifyAnthropicError(error);

    expect(result.overloaded).toBe(true);
    expect(isRetryableAnthropicError(error)).toBe(true);
  });

  it('flags authentication errors as non-retryable', () => {
    const error = new APIError(
      401,
      { type: 'authentication_error', message: 'Invalid key' },
      'Invalid key',
      new Headers()
    );

    const result = classifyAnthropicError(error);

    expect(result.authError).toBe(true);
    expect(result.retryable).toBe(false);
  });

  it('falls back to generic error classification', () => {
    const result = classifyAnthropicError(new Error('oops'));

    expect(result.retryable).toBe(false);
    expect(result.message).toContain('oops');
  });
});
