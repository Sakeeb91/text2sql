/**
 * AI Provider module.
 *
 * Provides abstraction layer for multiple AI providers (OpenAI, Anthropic, etc.).
 * This module will be implemented in Phase 2.
 */

import { Module, OnModuleInit } from '@nestjs/common';
import { AiProviderType } from '@text2sql/shared';

import { AiProviderConfigService } from './ai-provider-config.service';
import { AiProviderFactory } from './ai-provider.factory';
import { AiProviderService } from './ai-provider.service';
import { AnthropicProvider } from './providers/anthropic.provider';
import { CustomApiProvider } from './providers/custom.provider';
import { OpenAiProvider } from './providers/openai.provider';

@Module({
  providers: [AiProviderConfigService, AiProviderService],
  exports: [AiProviderConfigService, AiProviderService],
})
export class AiProviderModule implements OnModuleInit {
  onModuleInit(): void {
    AiProviderFactory.reset();
    AiProviderFactory.register(AiProviderType.OPENAI, OpenAiProvider);
    AiProviderFactory.register(AiProviderType.ANTHROPIC, AnthropicProvider);
    AiProviderFactory.register(AiProviderType.CUSTOM, CustomApiProvider);
  }
}
