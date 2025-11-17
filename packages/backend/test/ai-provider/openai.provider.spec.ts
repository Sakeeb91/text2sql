import { AiProviderConfig, AiProviderType } from '@text2sql/shared';
import type OpenAIClient from 'openai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
});
