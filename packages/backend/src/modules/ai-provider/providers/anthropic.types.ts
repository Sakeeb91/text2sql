export interface AnthropicProviderOptions {
  maxRetries: number;
  baseRetryDelayMs: number;
  maxRetryDelayMs: number;
  defaultMaxOutputTokens: number;
}

export const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-sonnet-20241022';
export const DEFAULT_ANTHROPIC_TEMPERATURE = 0.2;
export const DEFAULT_ANTHROPIC_MAX_OUTPUT_TOKENS = 1024;

export const DEFAULT_ANTHROPIC_PROVIDER_OPTIONS: AnthropicProviderOptions = {
  maxRetries: 3,
  baseRetryDelayMs: 300,
  maxRetryDelayMs: 2_000,
  defaultMaxOutputTokens: DEFAULT_ANTHROPIC_MAX_OUTPUT_TOKENS,
};
