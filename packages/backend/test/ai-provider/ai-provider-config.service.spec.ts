import { ConfigService, ConfigType } from '@nestjs/config';
import { AiProviderConfig, AiProviderType, ProviderConfigurationError } from '@text2sql/shared';
import { describe, expect, it, vi } from 'vitest';

import { configuration } from '../../src/config/configuration';
import { AiProviderConfigService } from '../../src/modules/ai-provider/ai-provider-config.service';

type AppConfig = ConfigType<typeof configuration>;

const createConfigService = (
  aiProviders: AppConfig['aiProviders'] | undefined
): ConfigService<AppConfig> => {
  const get = vi.fn((key: string) => {
    if (key === 'aiProviders') {
      return aiProviders;
    }
    return undefined;
  });

  return {
    get,
  } as unknown as ConfigService<AppConfig>;
};

const baseConfig: AiProviderConfig = {
  type: AiProviderType.OPENAI,
  apiKey: 'test-key',
  model: 'gpt-4o-mini',
};

describe('AiProviderConfigService', () => {
  it('returns default provider from configuration', () => {
    const service = new AiProviderConfigService(
      createConfigService({
        defaultProvider: AiProviderType.ANTHROPIC,
        providers: { [AiProviderType.ANTHROPIC]: baseConfig },
      })
    );

    expect(service.defaultProvider).toBe(AiProviderType.ANTHROPIC);
  });

  it('returns provider configuration when available', () => {
    const service = new AiProviderConfigService(
      createConfigService({
        defaultProvider: AiProviderType.OPENAI,
        providers: { [AiProviderType.OPENAI]: baseConfig },
      })
    );

    const config = service.getProviderConfig(AiProviderType.OPENAI);

    expect(config.apiKey).toBe('test-key');
    expect(config.type).toBe(AiProviderType.OPENAI);
  });

  it('throws when provider configuration is missing', () => {
    const service = new AiProviderConfigService(
      createConfigService({
        defaultProvider: AiProviderType.OPENAI,
        providers: {},
      })
    );

    expect(() => service.getProviderConfig(AiProviderType.OPENAI)).toThrow(
      ProviderConfigurationError
    );
  });

  it('throws when configuration fails validation', () => {
    const invalidConfig: AiProviderConfig = {
      ...baseConfig,
      apiKey: '',
    };

    const service = new AiProviderConfigService(
      createConfigService({
        defaultProvider: AiProviderType.OPENAI,
        providers: { [AiProviderType.OPENAI]: invalidConfig },
      })
    );

    expect(() => service.getProviderConfig(AiProviderType.OPENAI)).toThrow(
      ProviderConfigurationError
    );
  });

  it('lists providers from configuration', () => {
    const service = new AiProviderConfigService(
      createConfigService({
        defaultProvider: AiProviderType.OPENAI,
        providers: {
          [AiProviderType.OPENAI]: baseConfig,
          [AiProviderType.ANTHROPIC]: {
            ...baseConfig,
            type: AiProviderType.ANTHROPIC,
          },
        },
      })
    );

    expect(service.getSupportedProviders()).toEqual([
      AiProviderType.OPENAI,
      AiProviderType.ANTHROPIC,
    ]);
  });
});
