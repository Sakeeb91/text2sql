/**
 * Generic provider implementation for OpenAI-compatible APIs.
 */

import {
  AiProviderConfig,
  AiProviderType,
  ProviderError,
  SqlGenerationRequest,
  SqlGenerationResponse,
} from '@text2sql/shared';

import { BaseAiProvider } from '../base-ai-provider';

export class CustomApiProvider extends BaseAiProvider {
  constructor(config: AiProviderConfig) {
    super(AiProviderType.CUSTOM, config);
  }

  async generateSql(request: SqlGenerationRequest): Promise<SqlGenerationResponse> {
    await this.validateConfig();

    throw new ProviderError('Custom provider integration is not implemented yet', this.type, {
      operation: 'generateSql',
      metadata: {
        questionLength: request.question.length,
        baseUrl: this.config.baseUrl,
      },
    });
  }
}
