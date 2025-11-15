/**
 * Service responsible for loading and validating AI provider configuration.
 */

import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { AiProviderConfig, AiProviderType, ProviderConfigurationError } from '@text2sql/shared';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { configuration } from '../../config/configuration';

import { AiProviderConfigDto } from './dto/ai-provider-config.dto';

type AppConfig = ConfigType<typeof configuration>;

@Injectable()
export class AiProviderConfigService {
  constructor(private readonly configService: ConfigService<AppConfig>) {}

  get defaultProvider(): AiProviderType {
    return this.aiProvidersConfig.defaultProvider ?? AiProviderType.OPENAI;
  }

  getSupportedProviders(): AiProviderType[] {
    return Object.keys(this.providers) as AiProviderType[];
  }

  getProviderConfig(type?: AiProviderType): AiProviderConfig {
    const providerType = type ?? this.defaultProvider;
    const config = this.providers[providerType];

    if (config === undefined) {
      throw new ProviderConfigurationError(providerType, 'Configuration not found for provider', {
        metadata: { providerType },
      });
    }

    return this.validateConfig({ ...config, type: providerType });
  }

  private validateConfig(config: AiProviderConfig): AiProviderConfig {
    const dto = plainToInstance(AiProviderConfigDto, config);
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ProviderConfigurationError(
        config.type,
        'Provider configuration validation failed',
        {
          metadata: { errors: errors.map((error) => error.toString()) },
        }
      );
    }

    return config;
  }

  private get providers(): Partial<Record<AiProviderType, AiProviderConfig>> {
    return this.aiProvidersConfig.providers ?? {};
  }

  private get aiProvidersConfig(): AppConfig['aiProviders'] {
    const maybeConfig: unknown = this.configService.get('aiProviders', { infer: true });

    if (!this.isAiProvidersConfig(maybeConfig)) {
      return {
        defaultProvider: AiProviderType.OPENAI,
        providers: {},
      };
    }

    return maybeConfig;
  }

  private isAiProvidersConfig(value: unknown): value is AppConfig['aiProviders'] {
    if (value === null || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<AppConfig['aiProviders']>;

    if (
      candidate.defaultProvider !== undefined &&
      !Object.values(AiProviderType).includes(candidate.defaultProvider)
    ) {
      return false;
    }

    if (candidate.providers !== undefined && typeof candidate.providers !== 'object') {
      return false;
    }

    return true;
  }
}
