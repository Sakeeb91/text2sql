/**
 * Coordinates provider instantiation and switching.
 */

import { Injectable, Logger } from '@nestjs/common';
import { AiProviderType, IAiProvider, ProviderValidationError } from '@text2sql/shared';

import { AiProviderConfigService } from './ai-provider-config.service';
import { AiProviderFactory } from './ai-provider.factory';

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);
  private readonly providerCache = new Map<AiProviderType, IAiProvider>();
  private activeProviderType?: AiProviderType;

  constructor(private readonly configService: AiProviderConfigService) {}

  getAvailableProviders(): AiProviderType[] {
    return this.configService.getSupportedProviders();
  }

  async getProvider(type?: AiProviderType): Promise<IAiProvider> {
    const providerType = type ?? this.activeProviderType ?? this.configService.defaultProvider;
    return this.lookupProvider(providerType);
  }

  async useProvider(type: AiProviderType): Promise<IAiProvider> {
    this.activeProviderType = type;
    return this.lookupProvider(type);
  }

  async refreshProvider(type?: AiProviderType): Promise<IAiProvider> {
    const providerType = type ?? this.activeProviderType ?? this.configService.defaultProvider;
    this.providerCache.delete(providerType);
    return this.lookupProvider(providerType);
  }

  private async lookupProvider(type: AiProviderType): Promise<IAiProvider> {
    const cached = this.providerCache.get(type);
    if (cached !== undefined) {
      return cached;
    }

    const instance = await this.instantiateProvider(type);
    this.providerCache.set(type, instance);
    return instance;
  }

  private async instantiateProvider(type: AiProviderType): Promise<IAiProvider> {
    const config = this.configService.getProviderConfig(type);
    const provider = AiProviderFactory.create(config);

    const isValid = await provider.validateConfig();
    if (!isValid) {
      throw new ProviderValidationError(type, 'Provider configuration validation failed');
    }

    const healthy = await provider.healthCheck();
    if (!healthy) {
      throw new ProviderValidationError(type, 'Provider health check failed', {
        operation: 'healthCheck',
      });
    }

    this.logger.log(`Initialized ${type} AI provider`);
    return provider;
  }
}
