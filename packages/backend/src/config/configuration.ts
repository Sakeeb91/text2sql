/**
 * Application configuration factory.
 *
 * This module provides typed configuration values loaded from environment variables.
 */

import { AiProviderConfig, AiProviderType } from '@text2sql/shared';

interface AiProvidersConfig {
  defaultProvider: AiProviderType;
  providers: Partial<Record<AiProviderType, AiProviderConfig>>;
}

interface AppConfig {
  port: number;
  nodeEnv: string;
  database: {
    url: string;
  };
  aiProviders: AiProvidersConfig;
}

const parseNumber = (value: string | undefined, fallback?: number): number | undefined => {
  if (value === undefined || value === null) {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
};

const sanitizeString = (value: string | undefined | null): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const buildProviderConfig = (
  type: AiProviderType,
  raw: Partial<Omit<AiProviderConfig, 'type'>>
): AiProviderConfig | undefined => {
  const apiKey = raw.apiKey;
  if (apiKey === undefined || apiKey === null) {
    return undefined;
  }
  const trimmedKey = apiKey.trim();
  if (trimmedKey.length === 0) {
    return undefined;
  }

  return {
    type,
    apiKey: trimmedKey,
    baseUrl: sanitizeString(raw.baseUrl ?? undefined),
    model: sanitizeString(raw.model ?? undefined),
    temperature: raw.temperature,
    maxTokens: raw.maxTokens,
  };
};

export const configuration = (): AppConfig => {
  const openAiConfig = buildProviderConfig(AiProviderType.OPENAI, {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    baseUrl: process.env.OPENAI_BASE_URL,
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    temperature: parseNumber(process.env.OPENAI_TEMPERATURE, 0.1),
    maxTokens: parseNumber(process.env.OPENAI_MAX_TOKENS),
  });

  const anthropicConfig = buildProviderConfig(AiProviderType.ANTHROPIC, {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
    baseUrl: process.env.ANTHROPIC_BASE_URL,
    model: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20240620',
    temperature: parseNumber(process.env.ANTHROPIC_TEMPERATURE, 0.2),
    maxTokens: parseNumber(process.env.ANTHROPIC_MAX_TOKENS),
  });

  const customConfig = buildProviderConfig(AiProviderType.CUSTOM, {
    apiKey: process.env.CUSTOM_API_KEY ?? '',
    baseUrl: process.env.CUSTOM_API_BASE_URL,
    model: process.env.CUSTOM_API_MODEL,
    temperature: parseNumber(process.env.CUSTOM_API_TEMPERATURE),
    maxTokens: parseNumber(process.env.CUSTOM_API_MAX_TOKENS),
  });

  const providers: Partial<Record<AiProviderType, AiProviderConfig>> = {};
  if (openAiConfig !== undefined) {
    providers[AiProviderType.OPENAI] = openAiConfig;
  }
  if (anthropicConfig !== undefined) {
    providers[AiProviderType.ANTHROPIC] = anthropicConfig;
  }
  if (customConfig !== undefined) {
    providers[AiProviderType.CUSTOM] = customConfig;
  }

  return {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    database: {
      url: process.env.DATABASE_URL ?? 'sqlite:///./data/database.db',
    },
    aiProviders: {
      defaultProvider:
        (process.env.AI_PROVIDER_DEFAULT as AiProviderType | undefined) ?? AiProviderType.OPENAI,
      providers,
    },
  };
};
