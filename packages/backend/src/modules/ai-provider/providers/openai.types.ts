export interface OpenAiProviderOptions {
  maxRetries: number;
  baseRetryDelayMs: number;
  maxRetryDelayMs: number;
}

export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
export const DEFAULT_OPENAI_TEMPERATURE = 0.1;

export const DEFAULT_OPENAI_PROVIDER_OPTIONS: OpenAiProviderOptions = {
  maxRetries: 3,
  baseRetryDelayMs: 250,
  maxRetryDelayMs: 2_000,
};
