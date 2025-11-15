/**
 * Abstract base class for AI providers.
 *
 * Handles shared validation behaviour while delegating SQL
 * generation to concrete provider implementations.
 */

import {
  AiProviderConfig,
  AiProviderType,
  IAiProvider,
  ProviderConfigurationError,
  SqlGenerationRequest,
  SqlGenerationResponse,
} from '@text2sql/shared';

export abstract class BaseAiProvider implements IAiProvider {
  protected constructor(
    public readonly type: AiProviderType,
    protected readonly config: AiProviderConfig
  ) {}

  abstract generateSql(request: SqlGenerationRequest): Promise<SqlGenerationResponse>;

  validateConfig(): Promise<boolean> {
    if (this.config.apiKey.trim().length === 0) {
      throw new ProviderConfigurationError(this.type, 'API key is required for provider');
    }

    return Promise.resolve(true);
  }

  async healthCheck(): Promise<boolean> {
    await this.validateConfig();
    return true;
  }
}
