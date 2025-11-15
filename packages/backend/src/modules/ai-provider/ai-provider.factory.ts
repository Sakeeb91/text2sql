/**
 * Factory responsible for instantiating AI providers.
 */

import {
  AiProviderConfig,
  AiProviderType,
  IAiProvider,
  ProviderConfigurationError,
} from '@text2sql/shared';

type AiProviderConstructor = new (config: AiProviderConfig) => IAiProvider;

export class AiProviderFactory {
  private static readonly providers = new Map<AiProviderType, AiProviderConstructor>();

  static register(type: AiProviderType, provider: AiProviderConstructor): void {
    this.providers.set(type, provider);
  }

  static create(config: AiProviderConfig): IAiProvider {
    const ProviderClass = this.providers.get(config.type);
    if (ProviderClass === undefined) {
      throw new ProviderConfigurationError(config.type, 'Unknown AI provider type', {
        metadata: { registeredProviders: Array.from(this.providers.keys()) },
      });
    }

    return new ProviderClass(config);
  }

  static availableProviders(): AiProviderType[] {
    return Array.from(this.providers.keys());
  }

  static reset(): void {
    this.providers.clear();
  }
}
