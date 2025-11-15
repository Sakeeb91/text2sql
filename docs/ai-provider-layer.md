# AI Provider Abstraction Layer

Phase 2 introduces a strategy/factory-based abstraction that allows the backend to swap between OpenAI, Anthropic, and any OpenAI-compatible provider at runtime. This document summarizes the shape of the shared interfaces, Nest module wiring, and configuration workflow.

## Shared Types

Location: `packages/shared/src/types/ai-provider.types.ts`

- `AiProviderType` – enum of `openai`, `anthropic`, and `custom`
- `AiProviderConfig` – normalized credentials, model, temperature, and max token fields
- `SqlGenerationRequest` / `SqlGenerationResponse` – payload contracts
- `IAiProvider` – provider contract that exposes `generateSql`, `validateConfig`, and `healthCheck`
- `ProviderError` hierarchy – common error surface used by the backend

These exports keep Nest and Next.js code in sync and ensure additional providers follow the same contract.

## Provider Factory and Service

Location: `packages/backend/src/modules/ai-provider`

- `BaseAiProvider` performs API key validation and exposes helper behaviour for implementers.
- `AiProviderFactory` maintains a registry that maps `AiProviderType` to provider constructors. Registration happens when `AiProviderModule` initializes.
- `AiProviderService` pulls configuration, instantiates providers through the factory, runs validation/health checks, and caches instances. Consumers can switch providers dynamically via `useProvider(AiProviderType)` or refresh an instance with `refreshProvider`.

## Configuration Flow

The backend exposes a typed configuration object (`AppConfig`) that now includes `aiProviders`. The `configuration.ts` factory converts environment variables into provider configs, and `AiProviderConfigService` validates them with `class-validator`.

### Environment Variables

| Variable                                                                                       | Description                                      |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `AI_PROVIDER_DEFAULT`                                                                          | `openai`, `anthropic`, or `custom`               |
| `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`, `OPENAI_TEMPERATURE`, `OPENAI_MAX_TOKENS` | OpenAI credentials and tuning                    |
| `ANTHROPIC_*`                                                                                  | Anthropic credentials (same structure as OpenAI) |
| `CUSTOM_API_*`                                                                                 | Generic OpenAI-compatible API credentials        |

See `packages/backend/env-templates/.env.example` for a ready-to-edit template.

### Validation

`AiProviderConfigDto` defines `class-validator` rules for each config field. `AiProviderConfigService` uses `plainToInstance` + `validateSync` to guard against missing keys, invalid enums, or invalid numeric ranges. Any validation failure throws `ProviderConfigurationError`.

## Adding a Provider

1. Create a new class in `packages/backend/src/modules/ai-provider/providers` that extends `BaseAiProvider`.
2. Register the class inside `AiProviderModule.onModuleInit`.
3. Update shared `AiProviderType` and add new env variables if necessary.
4. Optionally document provider-specific fields in this file.

## Health Checks

Every provider implementation inherits the default validation/health behaviour. Implementors can override `healthCheck()` to perform remote readiness checks. `AiProviderService` only caches providers that pass both validation and health, raising `ProviderValidationError` otherwise.
