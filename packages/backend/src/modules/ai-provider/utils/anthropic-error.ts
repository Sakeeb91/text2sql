import { APIError } from '@anthropic-ai/sdk';

const RETRYABLE_STATUSES = new Set([408, 409, 425, 429, 500, 502, 503, 504, 529]);

export interface ClassifiedAnthropicError {
  status?: number;
  type?: string;
  message: string;
  retryable: boolean;
  authError: boolean;
  rateLimited: boolean;
  overloaded: boolean;
}

export const classifyAnthropicError = (error: unknown): ClassifiedAnthropicError => {
  if (error instanceof APIError) {
    const status = typeof error.status === 'number' ? error.status : undefined;
    const details = (error as { error?: { type?: unknown; message?: unknown } | undefined }).error;
    const type = typeof details?.type === 'string' ? details.type : undefined;
    const message =
      typeof details?.message === 'string'
        ? details.message
        : typeof error.message === 'string'
          ? error.message
          : 'Anthropic API error';

    const rateLimited = status === 429 || type === 'rate_limit_error';
    const overloaded = status === 529 || type === 'overloaded_error';
    const retryable =
      rateLimited || overloaded || (typeof status === 'number' && RETRYABLE_STATUSES.has(status));
    const authError = status === 401 || status === 403 || type === 'authentication_error';

    return {
      status,
      type,
      message,
      retryable,
      authError,
      rateLimited,
      overloaded,
    };
  }

  const fallbackMessage =
    error instanceof Error && typeof error.message === 'string'
      ? error.message
      : 'Anthropic API request failed';

  return {
    message: fallbackMessage,
    retryable: false,
    authError: false,
    rateLimited: false,
    overloaded: false,
  };
};

export const isRetryableAnthropicError = (error: unknown): boolean =>
  classifyAnthropicError(error).retryable;
