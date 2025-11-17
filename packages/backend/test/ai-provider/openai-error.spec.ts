import { APIError } from 'openai/error';
import { describe, expect, it } from 'vitest';

import {
  classifyOpenAiError,
  isRetryableOpenAiError,
} from '../../src/modules/ai-provider/utils/openai-error';

const headers = { 'x-request-id': 'test' } as Headers;

describe('classifyOpenAiError', () => {
  it('classifies rate limit errors', () => {
    const error = new APIError(429, { code: 'rate_limit_exceeded' }, 'Too many requests', headers);
    const result = classifyOpenAiError(error);

    expect(result.rateLimited).toBe(true);
    expect(result.retryable).toBe(true);
  });

  it('classifies auth errors', () => {
    const error = new APIError(401, { code: 'invalid_api_key' }, 'Invalid key', headers);
    const result = classifyOpenAiError(error);

    expect(result.authError).toBe(true);
    expect(result.retryable).toBe(false);
  });

  it('provides fallback classification', () => {
    const result = classifyOpenAiError(new Error('boom'));
    expect(result.message).toBe('boom');
    expect(result.retryable).toBe(false);
  });

  it('exposes helper for retry logic', () => {
    const error = new APIError(503, { code: 'server_error' }, 'Please retry', headers);
    expect(isRetryableOpenAiError(error)).toBe(true);
  });
});
