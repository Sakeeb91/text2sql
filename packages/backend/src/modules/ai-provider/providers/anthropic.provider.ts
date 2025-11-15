/**
 * Anthropic provider implementation placeholder.
 */

import {
  AiProviderConfig,
  AiProviderType,
  ProviderError,
  SqlGenerationRequest,
  SqlGenerationResponse,
} from '@text2sql/shared';

import { BaseAiProvider } from '../base-ai-provider';

export class AnthropicProvider extends BaseAiProvider {
  constructor(config: AiProviderConfig) {
    super(AiProviderType.ANTHROPIC, config);
  }

  async generateSql(request: SqlGenerationRequest): Promise<SqlGenerationResponse> {
    await this.validateConfig();

    throw new ProviderError('Anthropic SQL generation is not implemented yet', this.type, {
      operation: 'generateSql',
      metadata: { questionLength: request.question.length },
    });
  }
}
