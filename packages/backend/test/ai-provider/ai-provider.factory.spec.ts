import {
  AiProviderConfig,
  AiProviderType,
  ProviderConfigurationError,
  SqlGenerationRequest,
  SqlGenerationResponse,
} from '@text2sql/shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { AiProviderFactory } from '../../src/modules/ai-provider/ai-provider.factory';

class TestProvider {
  readonly type: AiProviderType;

  constructor(private readonly config: AiProviderConfig) {
    this.type = config.type;
  }

  generateSql(_request: SqlGenerationRequest): Promise<SqlGenerationResponse> {
    return Promise.resolve({ sqlQuery: 'SELECT 1' });
  }

  validateConfig(): Promise<boolean> {
    return Promise.resolve(this.config.apiKey.length > 0);
  }

  healthCheck(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

describe('AiProviderFactory', () => {
  beforeEach(() => {
    AiProviderFactory.reset();
  });

  it('should create provider from registered constructor', () => {
    AiProviderFactory.register(AiProviderType.OPENAI, TestProvider);

    const config: AiProviderConfig = {
      type: AiProviderType.OPENAI,
      apiKey: 'test',
    };

    const instance = AiProviderFactory.create(config);

    expect(instance).toBeInstanceOf(TestProvider);
    expect(instance.type).toBe(AiProviderType.OPENAI);
  });

  it('should throw for unknown provider type', () => {
    const config: AiProviderConfig = {
      type: AiProviderType.OPENAI,
      apiKey: 'test',
    };

    expect(() => AiProviderFactory.create(config)).toThrow(ProviderConfigurationError);
  });

  it('should list available providers', () => {
    AiProviderFactory.register(AiProviderType.OPENAI, TestProvider);

    const providers = AiProviderFactory.availableProviders();

    expect(providers).toContain(AiProviderType.OPENAI);
  });
});
