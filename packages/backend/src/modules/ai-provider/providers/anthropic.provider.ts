/**
 * Anthropic provider implementation placeholder.
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  AiProviderConfig,
  AiProviderType,
  ProviderConfigurationError,
  ProviderError,
  ProviderValidationError,
  SqlGenerationRequest,
  SqlGenerationResponse,
} from '@text2sql/shared';

import { BaseAiProvider } from '../base-ai-provider';
import { buildClaudeSqlPrompt } from '../prompts/claude-sql-prompt';
import { classifyAnthropicError } from '../utils/anthropic-error';
import {
  extractTextFromAnthropicResponse,
  extractJsonObject,
} from '../utils/anthropic-response-parser';
import { calculateBackoffDelay, sleep } from '../utils/retry';
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
    if (typeof this.config.maxTokens === 'number' && this.config.maxTokens > 0) {
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
      max_tokens: this.maxTokens,
      temperature,
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

    const response = await this.executeWithRetry(
      () => this.client.messages.create(params),
      'generateSql'
    );
    return this.parseResponse(response);
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        const classification = classifyAnthropicError(error);
        const shouldRetry = classification.retryable && attempt < this.options.maxRetries;
        if (!shouldRetry) {
          throw new ProviderError(
            classification.message,
            this.type,
            {
              operation: operationName,
              metadata: {
                status: classification.status,
                type: classification.type,
              },
            },
            error instanceof Error ? error : undefined
          );
        }

        const delay = calculateBackoffDelay(attempt, {
          baseDelayMs: this.options.baseRetryDelayMs,
          maxDelayMs: this.options.maxRetryDelayMs,
          jitterMs: 200,
        });

        await sleep(delay);
      }
    }

    throw new ProviderError('Anthropic request failed after retries', this.type, {
      operation: operationName,
    });
  }

  override async validateConfig(): Promise<boolean> {
    await super.validateConfig();

    if (this.model.length === 0) {
      throw new ProviderConfigurationError(
        this.type,
        'Anthropic model name must be provided for this provider'
      );
    }

    try {
      await this.client.models.retrieve(this.model);
      return true;
    } catch (error) {
      throw new ProviderValidationError(
        this.type,
        'Failed to validate Anthropic provider configuration',
        {
          operation: 'models.retrieve',
          metadata: { model: this.model },
        },
        error instanceof Error ? error : undefined
      );
    }
  }

  override async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list({ limit: 1 });
      return true;
    } catch (error) {
      throw new ProviderValidationError(
        this.type,
        'Anthropic provider health check failed',
        { operation: 'models.list' },
        error instanceof Error ? error : undefined
      );
    }
  }
}
