# syntax=docker/dockerfile:1.6

ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm"
ENV PNPM_STORE_DIR="/pnpm/store"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY . .
RUN pnpm --filter @text2sql/backend... build

FROM base AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["pnpm", "--filter", "@text2sql/backend", "dev"]

FROM node:${NODE_VERSION} AS production
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate
WORKDIR /app
RUN addgroup -g 1000 appuser && adduser -D -u 1000 -G appuser appuser
COPY --from=builder --chown=appuser:appuser /app/packages/backend/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app/packages/backend/package.json ./package.json
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"
CMD ["node", "dist/main.js"]
