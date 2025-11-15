/**
 * OpenAI provider implementation placeholder.
 *
 * The actual network integration will be added in a later phase.
 */

import {
  AiProviderConfig,
  AiProviderType,
  ProviderError,
  SqlGenerationRequest,
  SqlGenerationResponse,
} from '@text2sql/shared';

import { BaseAiProvider } from '../base-ai-provider';

export class OpenAiProvider extends BaseAiProvider {
  constructor(config: AiProviderConfig) {
    super(AiProviderType.OPENAI, config);
  }

  async generateSql(request: SqlGenerationRequest): Promise<SqlGenerationResponse> {
    await this.validateConfig();
    throw new ProviderError('OpenAI SQL generation is not implemented yet', this.type, {
      operation: 'generateSql',
      metadata: { questionLength: request.question.length },
    });
  }
}
