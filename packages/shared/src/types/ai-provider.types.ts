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

/**
 * Payload sent to an AI provider when requesting SQL generation.
 */
export interface SqlGenerationRequest {
  question: string;
  databaseSchema: string;
  temperature?: number;
}

/**
 * Standardized response returned by an AI provider.
 */
export interface SqlGenerationResponse {
  sqlQuery: string;
  confidence?: number;
  providerMetadata?: Record<string, unknown>;
}

/**
 * Contract implemented by every AI provider integration.
 */
export interface IAiProvider {
  readonly type: AiProviderType;
  generateSql(request: SqlGenerationRequest): Promise<SqlGenerationResponse>;
  validateConfig(): Promise<boolean>;
  healthCheck(): Promise<boolean>;
}

/**
 * Structured context that can be attached to provider errors.
 */
export interface ProviderErrorContext {
  operation?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Base error for AI provider failures.
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly providerType: AiProviderType,
    public readonly context?: ProviderErrorContext,
    public override readonly cause?: Error
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

/**
 * Error thrown when provider configuration is invalid.
 */
export class ProviderConfigurationError extends ProviderError {
  constructor(
    providerType: AiProviderType,
    message = 'Invalid AI provider configuration',
    context?: ProviderErrorContext,
    cause?: Error
  ) {
    super(message, providerType, context, cause);
    this.name = 'ProviderConfigurationError';
  }
}

/**
 * Error thrown when provider validation or health checks fail.
 */
export class ProviderValidationError extends ProviderError {
  constructor(
    providerType: AiProviderType,
    message = 'AI provider validation failed',
    context?: ProviderErrorContext,
    cause?: Error
  ) {
    super(message, providerType, context, cause);
    this.name = 'ProviderValidationError';
  }
}
