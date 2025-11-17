import { AiProviderConfig, AiProviderType } from '@text2sql/shared';
import type OpenAIClient from 'openai';
import { APIError } from 'openai/error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OpenAiProvider } from '../../src/modules/ai-provider/providers/openai.provider';

const baseConfig: AiProviderConfig = {
  type: AiProviderType.OPENAI,
  apiKey: 'test-key',
  model: 'gpt-4o-mini',
  temperature: 0.1,
};

interface MockOpenAiClient {
  responses: {
    create: ReturnType<typeof vi.fn>;
  };
  models: {
    retrieve: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
  };
}

const createMockClient = (): MockOpenAiClient => ({
  responses: {
    create: vi.fn(),
  },
  models: {
    retrieve: vi.fn(),
    list: vi.fn(),
  },
});

describe('OpenAiProvider', () => {
  let client: MockOpenAiClient;
  let provider: OpenAiProvider;

  beforeEach(() => {
    client = createMockClient();
    provider = new OpenAiProvider(baseConfig, client as unknown as OpenAIClient);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates SQL from structured response', async () => {
    client.responses.create.mockResolvedValue({
      output_text: '{"sql": "SELECT * FROM customers"}',
      model: 'gpt-4o-mini',
      usage: { total_tokens: 42 },
    });

    const result = await provider.generateSql({
      question: 'List customers',
      databaseSchema: 'Table: customers',
    });

    expect(result.sqlQuery).toBe('SELECT * FROM customers');
    expect(result.providerMetadata?.model).toBe('gpt-4o-mini');
  });

  it('throws when response cannot be parsed', async () => {
    client.responses.create.mockResolvedValue({
      output_text: 'not-json',
    });

    await expect(
      provider.generateSql({
        question: 'List customers',
        databaseSchema: 'schema',
      })
    ).rejects.toThrow(/valid JSON/i);
  });

  it('rejects SQL that is not read-only', async () => {
    client.responses.create.mockResolvedValue({
      output_text: '{"sql": "DELETE FROM customers"}',
    });

    await expect(
      provider.generateSql({
        question: 'List customers',
        databaseSchema: 'schema',
      })
    ).rejects.toThrow(/not read-only/i);
  });

  it('retries on rate limits and eventually succeeds', async () => {
    const headers = { 'x-request-id': 'retry' } as Headers;
    const rateLimitError = new APIError(429, { code: 'rate_limit_exceeded' }, 'Too many', headers);
    client.responses.create
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValue({ output_text: '{"sql": "SELECT 1"}' });

    vi.useFakeTimers();
    const promise = provider.generateSql({
      question: 'ping',
      databaseSchema: 'schema',
    });

    await vi.runOnlyPendingTimersAsync();
    vi.useRealTimers();

    await expect(promise).resolves.toMatchObject({ sqlQuery: 'SELECT 1' });
    expect(client.responses.create).toHaveBeenCalledTimes(2);
  });

  it('validates configuration via models.retrieve', async () => {
    client.models.retrieve.mockResolvedValue({ id: 'gpt-4o-mini' });

    await expect(provider.validateConfig()).resolves.toBe(true);
    expect(client.models.retrieve).toHaveBeenCalledWith('gpt-4o-mini');
  });

  it('fails health check when listing models errors', async () => {
    client.models.list.mockRejectedValue(new Error('offline'));

    await expect(provider.healthCheck()).rejects.toThrow(/health check/i);
    expect(client.models.list).toHaveBeenCalled();
  });
});
