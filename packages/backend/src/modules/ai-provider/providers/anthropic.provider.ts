/**
 * Anthropic provider implementation placeholder.
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  AiProviderConfig,
  AiProviderType,
  ProviderConfigurationError,
  ProviderError,
  SqlGenerationRequest,
  SqlGenerationResponse,
} from '@text2sql/shared';

import { BaseAiProvider } from '../base-ai-provider';
import { buildClaudeSqlPrompt } from '../prompts/claude-sql-prompt';
import {
  extractTextFromAnthropicResponse,
  extractJsonObject,
} from '../utils/anthropic-response-parser';
import { isReadOnlySql } from '../utils/sql-guard';

import {
  AnthropicProviderOptions,
  DEFAULT_ANTHROPIC_MODEL,
  DEFAULT_ANTHROPIC_PROVIDER_OPTIONS,
  DEFAULT_ANTHROPIC_TEMPERATURE,
} from './anthropic.types';

type MessagesCreateParams = Parameters<Anthropic['messages']['create']>[0];
type MessagesResponse = Awaited<ReturnType<Anthropic['messages']['create']>>;

export class AnthropicProvider extends BaseAiProvider {
  private readonly client: Anthropic;
  private readonly options: AnthropicProviderOptions;

  constructor(
    config: AiProviderConfig,
    client?: Anthropic,
    options?: Partial<AnthropicProviderOptions>
  ) {
    super(AiProviderType.ANTHROPIC, config);

    this.client =
      client ??
      new Anthropic({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      });

    this.options = {
      ...DEFAULT_ANTHROPIC_PROVIDER_OPTIONS,
      ...options,
    };
  }

  private get model(): string {
    if (typeof this.config.model === 'string' && this.config.model.trim().length > 0) {
      return this.config.model.trim();
    }
    return DEFAULT_ANTHROPIC_MODEL;
  }

  private get baseTemperature(): number {
    return typeof this.config.temperature === 'number'
      ? this.config.temperature
      : DEFAULT_ANTHROPIC_TEMPERATURE;
  }

  private get maxTokens(): number {
    if (typeof this.config.maxTokens === 'number') {
      return this.config.maxTokens;
    }
    return this.options.defaultMaxOutputTokens;
  }

  private buildRequest(
    question: string,
    schema: string,
    temperature: number
  ): MessagesCreateParams {
    return {
      model: this.model,
      system: buildClaudeSqlPrompt(schema),
      max_output_tokens: this.maxTokens,
      temperature,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
    };
  }

  private parseResponse(response: MessagesResponse): SqlGenerationResponse {
    const text = extractTextFromAnthropicResponse(response);
    const payload = extractJsonObject(text) as { sql?: unknown; confidence?: unknown };

    const sql =
      typeof payload.sql === 'string' && payload.sql.trim().length > 0 ? payload.sql.trim() : null;
    if (sql === null) {
      throw new ProviderError('Anthropic response did not include a SQL query', this.type, {
        operation: 'generateSql',
      });
    }

    if (!isReadOnlySql(sql)) {
      throw new ProviderError('Generated SQL query is not read-only', this.type, {
        operation: 'generateSql',
        metadata: { sql },
      });
    }

    const confidence =
      typeof payload.confidence === 'number' && Number.isFinite(payload.confidence)
        ? payload.confidence
        : undefined;

    return {
      sqlQuery: sql,
      confidence,
      providerMetadata: {
        model: (response as { model?: string }).model ?? this.model,
        stopReason: (response as { stop_reason?: string }).stop_reason,
        usage: (response as { usage?: unknown }).usage,
      },
    };
  }

  async generateSql(request: SqlGenerationRequest): Promise<SqlGenerationResponse> {
    const question = typeof request.question === 'string' ? request.question.trim() : '';
    if (question.length === 0) {
      throw new ProviderError('Question must be provided for SQL generation', this.type, {
        operation: 'generateSql',
      });
    }

    const temperature = request.temperature ?? this.baseTemperature;
    const params = this.buildRequest(question, request.databaseSchema ?? '', temperature);

    const response = await this.client.messages.create(params);
    return this.parseResponse(response);
  }

  override async validateConfig(): Promise<boolean> {
    await super.validateConfig();

    if (this.model.length === 0) {
      throw new ProviderConfigurationError(
        this.type,
        'Anthropic model name must be provided for this provider'
      );
    }

    return true;
  }
}
