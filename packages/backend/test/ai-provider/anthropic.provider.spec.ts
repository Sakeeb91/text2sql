import type Anthropic from '@anthropic-ai/sdk';
import { APIError } from '@anthropic-ai/sdk';
import { AiProviderConfig, AiProviderType } from '@text2sql/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnthropicProvider } from '../../src/modules/ai-provider/providers/anthropic.provider';

const baseConfig: AiProviderConfig = {
  type: AiProviderType.ANTHROPIC,
  apiKey: 'test-key',
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.2,
};

interface MockAnthropicClient {
  messages: {
    create: ReturnType<typeof vi.fn>;
  };
  models: {
    retrieve: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
  };
}

const createMockClient = (): MockAnthropicClient => ({
  messages: {
    create: vi.fn(),
  },
  models: {
    retrieve: vi.fn(),
    list: vi.fn(),
  },
});

describe('AnthropicProvider', () => {
  let client: MockAnthropicClient;
  let provider: AnthropicProvider;

  beforeEach(() => {
    client = createMockClient();
    provider = new AnthropicProvider(baseConfig, client as unknown as Anthropic);
  });

  it('generates SQL from Claude responses', async () => {
    client.messages.create.mockResolvedValue({
      content: [{ type: 'text', text: '{"sql": "SELECT * FROM customers", "confidence": 0.92}' }],
      model: 'claude-3-5-sonnet-20241022',
      usage: { input_tokens: 10, output_tokens: 20 },
    });

    const result = await provider.generateSql({
      question: 'List all customers',
      databaseSchema: 'Table: customers',
    });

    expect(result.sqlQuery).toBe('SELECT * FROM customers');
    expect(result.confidence).toBeCloseTo(0.92);
    expect(result.providerMetadata?.model).toBe('claude-3-5-sonnet-20241022');
  });

  it('parses JSON responses wrapped in code fences', async () => {
    client.messages.create.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: '```json\n{"sql": "SELECT id FROM orders", "confidence": 0.81}\n```',
        },
      ],
    });

    const result = await provider.generateSql({
      question: 'Show order ids',
      databaseSchema: 'Table: orders',
    });

    expect(result.sqlQuery).toBe('SELECT id FROM orders');
    expect(result.confidence).toBeCloseTo(0.81);
  });

  it('retries on rate limits before succeeding', async () => {
    const headers = new Headers();
    const rateLimit = new APIError(
      429,
      { type: 'rate_limit_error', message: 'Rate limited' },
      'Rate limited',
      headers
    );

    client.messages.create
      .mockRejectedValueOnce(rateLimit)
      .mockResolvedValue({ content: [{ type: 'text', text: '{"sql": "SELECT 1"}' }] });

    vi.useFakeTimers();
    const promise = provider.generateSql({
      question: 'ping',
      databaseSchema: 'schema',
    });

    await vi.runOnlyPendingTimersAsync();
    vi.useRealTimers();

    await expect(promise).resolves.toMatchObject({ sqlQuery: 'SELECT 1' });
    expect(client.messages.create).toHaveBeenCalledTimes(2);
  });

  it('fails fast on authentication errors', async () => {
    const headers = new Headers();
    const authError = new APIError(
      401,
      { type: 'authentication_error', message: 'bad key' },
      'bad key',
      headers
    );

    client.messages.create.mockRejectedValue(authError);

    await expect(
      provider.generateSql({
        question: 'Hello',
        databaseSchema: 'schema',
      })
    ).rejects.toThrow(/bad key/i);
    expect(client.messages.create).toHaveBeenCalledTimes(1);
  });

  it('rejects non read-only SQL', async () => {
    client.messages.create.mockResolvedValue({
      content: [{ type: 'text', text: '{"sql": "DELETE FROM customers"}' }],
    });

    await expect(
      provider.generateSql({
        question: 'drop customers',
        databaseSchema: 'Table: customers',
      })
    ).rejects.toThrow(/read-only/i);
  });

  it('validates configuration using models.retrieve', async () => {
    client.models.retrieve.mockResolvedValue({ id: 'claude-3-5-sonnet-20241022' });

    await expect(provider.validateConfig()).resolves.toBe(true);
    expect(client.models.retrieve).toHaveBeenCalledWith('claude-3-5-sonnet-20241022');
  });
});
