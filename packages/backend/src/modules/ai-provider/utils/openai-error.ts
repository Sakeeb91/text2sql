import { APIError } from 'openai/error';

const RETRYABLE_STATUSES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

export interface ClassifiedOpenAiError {
  status?: number;
  code?: string;
  message: string;
  retryable: boolean;
  authError: boolean;
  rateLimited: boolean;
}

export const classifyOpenAiError = (error: unknown): ClassifiedOpenAiError => {
  if (error instanceof APIError) {
    const status = typeof error.status === 'number' ? error.status : undefined;
    const details = error.error as { code?: unknown } | undefined;
    const code = typeof details?.code === 'string' ? details.code : undefined;
    const message = typeof error.message === 'string' ? error.message : 'OpenAI API error';

    const rateLimited = status === 429 || code === 'rate_limit_exceeded';
    const authError = status === 401 || status === 403 || code === 'invalid_api_key';
    const retryable = rateLimited || (typeof status === 'number' && RETRYABLE_STATUSES.has(status));

    return { status, code, message, retryable, authError, rateLimited };
  }

  const fallbackMessage =
    error instanceof Error && typeof error.message === 'string'
      ? error.message
      : 'OpenAI API request failed';
  return {
    message: fallbackMessage,
    retryable: false,
    authError: false,
    rateLimited: false,
  };
};

export const isRetryableOpenAiError = (error: unknown): boolean =>
  classifyOpenAiError(error).retryable;
