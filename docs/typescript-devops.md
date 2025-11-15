# TypeScript DevOps Guide

Phase 1.5 adds containerization and CI hooks for the NestJS backend. This guide explains how to work with the Docker assets and supporting tooling.

## Docker Images

### Build Locally

```bash
# Production image
docker build -f packages/backend/Dockerfile -t text2sql-backend:latest .
```

- **Multi-stage build** keeps the final image slim (<200MB).
- Installs dependencies with `pnpm --filter @text2sql/backend... build` so shared package builds automatically.
- Runs as non-root `appuser` and exposes port `3000`.
- Includes a healthcheck that pings `/health` before marking the container healthy.

### Development Target

The same Dockerfile exposes a `development` target used by Docker Compose for live reload:

```bash
docker build --target development -f packages/backend/Dockerfile -t text2sql-backend:dev .
```

This stage keeps the TypeScript sources and `pnpm` workspace installed so `nest start --watch` works inside the container.

## Docker Compose (TypeScript Stack)

A secondary stack is defined in `docker-compose.yml` under the `typescript` profile.

```bash
# Start PostgreSQL + NestJS backend
docker compose --profile typescript up ts-postgres ts-backend

# Add the placeholder frontend container as well
docker compose --profile typescript up ts-postgres ts-backend ts-frontend
```

Services:

- `ts-postgres`: PostgreSQL 15 with persistent volume `ts-postgres-data`.
- `ts-backend`: Builds from `packages/backend/Dockerfile` (development target) and watches for code changes.
- `ts-frontend`: Placeholder for the future Next.js client. Keeps the network + env wiring ready.

> The existing FastAPI service (`text2sql-api`) continues to run without profiles. TypeScript services are opt-in via `--profile typescript`.

### Live Reload Volumes

Only source directories are mounted into the backend container:

- `./packages/backend/src`
- `./packages/backend/test`
- `./packages/shared/src`

`node_modules` remain inside the container to avoid cross-platform permission issues. The `ts-pnpm-store` named volume caches pnpm artifacts across rebuilds.

## Environment Files

- Root `.env` continues to hold shared API credentials.
- Package-specific templates live under `packages/backend/env-templates/`.
- For Compose, override `DATABASE_URL` with the service name (`postgresql://postgres:postgres@ts-postgres:5432/text2sql`).
- `packages/backend/env-templates/.env.example` documents the AI provider settings (`AI_PROVIDER_DEFAULT`, `OPENAI_*`, `ANTHROPIC_*`, `CUSTOM_API_*`). Copy it to `.env.local` and fill the provider you plan to exercise. Unused providers can keep blank keys.
- Reference [docs/ai-provider-layer.md](./ai-provider-layer.md) for details on the abstraction and which env vars map to each provider.

## Health Checks

- Dockerfile production image exposes `/health` checks via `node -e ...`.
- Compose services inherit the same behavior using `wget` for the dev target and `pg_isready` for PostgreSQL.

Keep this guide close when iterating on the TypeScript stack so Docker, Compose, and CI stay aligned.
