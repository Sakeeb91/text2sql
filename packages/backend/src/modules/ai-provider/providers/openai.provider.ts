import {
  AiProviderConfig,
  AiProviderType,
  ProviderConfigurationError,
  ProviderError,
  ProviderValidationError,
  SqlGenerationRequest,
  SqlGenerationResponse,
} from '@text2sql/shared';
import OpenAIClient from 'openai';

import { BaseAiProvider } from '../base-ai-provider';
import { buildSqlSystemPrompt } from '../prompts/sql-system-prompt';
import { classifyOpenAiError } from '../utils/openai-error';
import { extractTextFromOpenAiResponse } from '../utils/openai-response-parser';
import { calculateBackoffDelay, sleep } from '../utils/retry';
import { isReadOnlySql } from '../utils/sql-guard';

import {
  DEFAULT_OPENAI_MODEL,
  DEFAULT_OPENAI_PROVIDER_OPTIONS,
  DEFAULT_OPENAI_TEMPERATURE,
  OpenAiProviderOptions,
} from './openai.types';

type ResponsesResponse = Awaited<ReturnType<OpenAIClient['responses']['create']>>;
type ResponseMessage = {
  role: 'system' | 'user';
  content: Array<{ type: 'text'; text: string }>;
};

export class OpenAiProvider extends BaseAiProvider {
  private readonly client: OpenAIClient;
  private readonly options: OpenAiProviderOptions;

  constructor(
    config: AiProviderConfig,
    client?: OpenAIClient,
    options?: Partial<OpenAiProviderOptions>
  ) {
    super(AiProviderType.OPENAI, config);

    this.client =
      client ??
      new OpenAIClient({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      });

    this.options = {
      ...DEFAULT_OPENAI_PROVIDER_OPTIONS,
      ...options,
    };
  }

  private get model(): string {
    return typeof this.config.model === 'string' && this.config.model.trim().length > 0
      ? this.config.model.trim()
      : DEFAULT_OPENAI_MODEL;
  }

  private get baseTemperature(): number {
    return typeof this.config.temperature === 'number'
      ? this.config.temperature
      : DEFAULT_OPENAI_TEMPERATURE;
  }

  private buildMessages(schema: string, question: string): ResponseMessage[] {
    return [
      {
        role: 'system',
        content: [{ type: 'text', text: buildSqlSystemPrompt(schema) }],
      },
      {
        role: 'user',
        content: [{ type: 'text', text: question }],
      },
    ];
  }

  private parseSqlPayload(response: ResponsesResponse): SqlGenerationResponse {
    const rawText = extractTextFromOpenAiResponse(response);

    let payload: unknown;
    try {
      payload = JSON.parse(rawText);
    } catch (error) {
      throw new ProviderError(
        'OpenAI response was not valid JSON',
        this.type,
        {
          operation: 'generateSql',
        },
        error instanceof Error ? error : undefined
      );
    }

    const sql =
      typeof (payload as { sql?: unknown }).sql === 'string'
        ? (payload as { sql: string }).sql.trim()
        : undefined;
    if (sql === undefined || sql.length === 0) {
      throw new ProviderError('OpenAI response did not contain a SQL query', this.type, {
        operation: 'generateSql',
        metadata: { payload },
      });
    }

    if (!isReadOnlySql(sql)) {
      throw new ProviderError('Generated SQL query is not read-only', this.type, {
        operation: 'generateSql',
        metadata: { sql },
      });
    }

    return {
      sqlQuery: sql,
      providerMetadata: {
        model: (response as { model?: string }).model ?? this.model,
        usage: (response as { usage?: unknown }).usage,
      },
    };
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        const classification = classifyOpenAiError(error);

        const lastAttempt = attempt >= this.options.maxRetries || !classification.retryable;
        if (lastAttempt) {
          throw new ProviderError(
            classification.message,
            this.type,
            {
              operation: operationName,
              metadata: {
                status: classification.status,
                code: classification.code,
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

    throw new ProviderError('OpenAI request failed after retries', this.type, {
      operation: operationName,
    });
  }

  async generateSql(request: SqlGenerationRequest): Promise<SqlGenerationResponse> {
    const question = typeof request.question === 'string' ? request.question.trim() : '';
    if (question.length === 0) {
      throw new ProviderError('Question must be provided for SQL generation', this.type, {
        operation: 'generateSql',
      });
    }

    const temperature = request.temperature ?? this.baseTemperature;
    const input = this.buildMessages(request.databaseSchema ?? '', question);

    const response = await this.executeWithRetry(
      () =>
        this.client.responses.create({
          model: this.model,
          temperature,
          response_format: { type: 'json_object' },
          max_output_tokens: this.config.maxTokens,
          input,
        }),
      'generateSql'
    );

    return this.parseSqlPayload(response);
  }

  async validateConfig(): Promise<boolean> {
    await super.validateConfig();

    if (this.model.length === 0) {
      throw new ProviderConfigurationError(
        this.type,
        'OpenAI model name must be provided for this provider'
      );
    }

    try {
      await this.client.models.retrieve(this.model);
      return true;
    } catch (error) {
      throw new ProviderValidationError(
        this.type,
        'Failed to validate OpenAI provider configuration',
        {
          operation: 'models.retrieve',
          metadata: { model: this.model },
        },
        error instanceof Error ? error : undefined
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list({ limit: 1 });
      return true;
    } catch (error) {
      throw new ProviderValidationError(
        this.type,
        'OpenAI provider health check failed',
        { operation: 'models.list' },
        error instanceof Error ? error : undefined
      );
    }
  }
}
