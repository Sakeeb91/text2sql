# @text2sql/backend

NestJS backend API for the Text-to-SQL application.

## Status

🚧 **Under Development** – Phase 2 delivered the multi-provider AI abstraction + OpenAI integration. The remaining NestJS modules (database/query APIs) land in Phase 3.

## Planned Features

- **NestJS Framework**: Modern, scalable Node.js framework
- **TypeORM**: Database ORM with TypeScript support
- **AI Provider Abstraction**: Support for OpenAI, Anthropic, and custom providers
- **SQL Validation**: Security layer to ensure read-only queries
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Health Checks**: Kubernetes-ready health and readiness endpoints

## Development

This package is currently a placeholder for the API modules. The AI provider infrastructure is available today; implementation of the remaining endpoints begins in Phase 3.1 (Issue #24).

## AI Provider Module

Located in `src/modules/ai-provider`.

- `OpenAiProvider` uses the official `openai` SDK and the Responses API to generate JSON-structured SQL replies, reusing the Python system prompt plus strict read-only validation.
- Exponential backoff + retry logic handle rate limiting automatically; `ProviderError` metadata includes request IDs/statuses when errors surface.
- Configuration lives under `config/configuration.ts` and is validated at runtime via `AiProviderConfigService`.
- Run `pnpm ts:test -- --runInBand` to execute the Vitest suite, including the mocked OpenAI provider specs under `test/ai-provider`.

### Environment Configuration

1. Copy one of the templates from `env-templates/` to `.env.local` (development) or `.env` (production).
2. Update `DATABASE_URL` to point at your PostgreSQL instance (the Docker Compose stack ships with `postgres://postgres:postgres@postgres:5432/text2sql`).
3. Provide a valid `OPENAI_API_KEY` even when the AI provider module is mocked; validation currently requires it.

### Useful Scripts

Run the scripts from the monorepo root using pnpm:

- `pnpm ts:dev` – Runs the NestJS backend with hot reload (`nest start --watch`).
- `pnpm ts:lint` – Lints the backend with the shared ESLint config.
- `pnpm ts:type-check` – Executes `tsc --noEmit` for the backend.
- `pnpm ts:test` – Runs the Vitest suite (coverage optional via `pnpm ts:test:coverage`).
- `pnpm ts:build` – Produces the production build under `packages/backend/dist`.

## Dependencies

- `@text2sql/shared`: Shared types and utilities

## License

MIT
