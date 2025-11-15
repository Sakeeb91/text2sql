/**
 * AI provider enumeration.
 *
 * Enumerates the supported AI providers for SQL generation.
 */
export enum AiProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  CUSTOM = 'custom',
}

/**
 * Standardized configuration for AI providers.
 *
 * @property type - Provider implementation identifier
 * @property apiKey - Credential used to authenticate requests
 * @property baseUrl - Optional custom endpoint for OpenAI-compatible providers
 * @property model - Model identifier (varies by provider)
 * @property temperature - Optional temperature override per request
 * @property maxTokens - Maximum tokens the provider can return
 */
export interface AiProviderConfig {
  type: AiProviderType;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
