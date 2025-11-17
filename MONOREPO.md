# Text-to-SQL TypeScript Monorepo

This document describes the TypeScript monorepo structure for the Text-to-SQL application migration.

## Overview

This monorepo contains the TypeScript/Node.js implementation of the Text-to-SQL application, organized using pnpm workspaces. The structure supports independent development of backend, frontend, and shared packages while maintaining type safety across the entire stack.

## Architecture

```
text2sql/
├── packages/
│   ├── backend/          # NestJS backend API
│   ├── frontend/         # Next.js frontend UI
│   └── shared/           # Shared TypeScript types and utilities
├── pnpm-workspace.yaml   # Workspace configuration
├── package.json          # Root package with scripts
├── tsconfig.base.json    # Base TypeScript configuration
├── tsconfig.json         # Root TypeScript project references
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
└── .husky/               # Git hooks for code quality
```

## Workspaces

### @text2sql/shared

**Status**: ✅ Implemented (Phase 1.1)

Shared TypeScript types and utilities used across backend and frontend.

**Key Features**:

- API request/response types (QueryRequest, QueryResponse, HealthResponse)
- Database entity types (Customer, Order)
- Schema metadata types (TableSchema, ColumnDefinition)
- Comprehensive JSDoc documentation

**Usage**:

```typescript
import { QueryRequest, QueryResponse } from '@text2sql/shared';
```

### @text2sql/backend

**Status**: 🚧 Planned (Phase 3)

NestJS backend API with TypeORM and AI provider abstraction.

**Planned Features**:

- RESTful API endpoints
- Multiple AI provider support (OpenAI, Anthropic, custom)
- SQL validation and security
- Database schema inspection
- Health check endpoints

### @text2sql/frontend

**Status**: 🚧 Planned (Phase 4)

Next.js 14 frontend with App Router and Server Components.

**Planned Features**:

- Interactive query interface
- Real-time results display
- AI provider selector
- CSV export functionality
- Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

Install pnpm if you haven't already:

```bash
npm install -g pnpm
```

### Installation

1. Install all dependencies:

```bash
pnpm install
```

2. Build all packages:

```bash
pnpm build
```

### Environment Management

- Copy `.env.example` at the repo root to `.env` for shared variables (OpenAI, database URL, etc.)
- Package-specific templates live in `packages/backend/env-templates/` for development, test, and production
- The NestJS backend reads `.env.local` and `.env` automatically through `@nestjs/config`
- Use PostgreSQL connection strings (`postgresql://postgres:postgres@localhost:5432/text2sql`) when exercising the TS stack
- Keep secrets (real `.env` files) out of version control; only the `*.example` templates are committed

### Development

Run all packages in development mode:

```bash
pnpm dev
```

Run specific package:

```bash
cd packages/shared
pnpm dev
```

## Scripts

### Root Level

- `pnpm dev` - Run all packages in development mode (parallel)
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check formatting without modifying
- `pnpm type-check` - Type check all packages
- `pnpm test` - Run tests in all packages
- `pnpm clean` - Clean all build artifacts

### Package Level

Each package has its own scripts:

- `pnpm build` - Build the package
- `pnpm dev` - Run in development/watch mode
- `pnpm type-check` - Type check the package
- `pnpm lint` - Lint the package
- `pnpm clean` - Clean build artifacts

## DevOps (Phase 1.5)

- `packages/backend/Dockerfile` provides both development (`target=development`) and production images with pnpm caching, non-root user, and health checks.
- `docker-compose.yml` ships a `typescript` profile (`ts-postgres`, `ts-backend`, `ts-frontend`) for local NestJS development against PostgreSQL.
- Environment templates live in `packages/backend/env-templates/` and map directly to development, test, and production scenarios (Compose + CI share them).
- See `docs/typescript-devops.md` for detailed workflows covering Docker builds, Compose commands, and troubleshooting tips.

## Code Quality

### TypeScript

All packages use strict TypeScript configuration:

- Strict mode enabled
- No implicit any
- Unused variables/parameters detection
- Strict null checks
- No unchecked indexed access

### ESLint

Comprehensive ESLint rules enforcing:

- TypeScript best practices
- Import ordering and organization
- Async/await patterns
- No floating promises
- Explicit function return types

### Prettier

Consistent code formatting:

- Single quotes
- 2 space indentation
- 100 character line length
- Trailing commas (ES5)
- Semicolons required

### Pre-commit Hooks

Husky and lint-staged automatically run on commit:

- ESLint with auto-fix
- Prettier formatting
- Type checking

## Type Safety

### Shared Types

The `@text2sql/shared` package ensures type consistency across the stack:

1. **API Contracts**: Request/response types match between backend and frontend
2. **Database Entities**: Consistent data models across all layers
3. **Type Inference**: Full TypeScript inference in IDE

### Workspace Dependencies

Packages reference each other using workspace protocol:

```json
{
  "dependencies": {
    "@text2sql/shared": "workspace:*"
  }
}
```

This ensures:

- Always use the latest local version
- Type definitions are always in sync
- No need to publish to npm for development

## Project References

TypeScript project references enable:

- Faster incremental builds
- Better IDE performance
- Enforced dependency graph
- Parallel compilation

The root `tsconfig.json` references all packages:

```json
{
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/backend" },
    { "path": "./packages/frontend" }
  ]
}
```

## Migration Strategy

This monorepo is part of a phased migration from Python/FastAPI to TypeScript/NestJS:

### Phase 1: Project Setup ✅

- [x] Initialize monorepo structure
- [x] Setup TypeScript configuration
- [x] Configure code quality tools
- [x] Create shared types package

### Phase 2: AI Provider Abstraction ✅

- [x] Design provider interface
- [x] Implement OpenAI provider
- [x] Implement Anthropic provider
- [x] Add custom provider support
- [x] Provider configuration/validation + dynamic switching

### Phase 3: Backend Implementation 🚧

- [ ] Port database models
- [ ] Implement SQL validation
- [ ] Create API endpoints
- [ ] Add middleware and error handling

### Phase 4: Frontend Implementation 🚧

- [ ] Setup Next.js with App Router
- [ ] Build query interface
- [ ] Implement provider selector
- [ ] Add results visualization

### Phase 5: Testing 🚧

- [ ] Port unit tests to Jest
- [ ] Port integration tests
- [ ] Add frontend tests (Vitest + Playwright)
- [ ] Setup CI/CD pipeline

### Phase 6: Documentation & Deployment 🚧

- [ ] Update documentation
- [ ] Configure cloud deployment
- [ ] Create migration guide

## Coexistence with Python

During migration, both Python and TypeScript codebases coexist:

- **Python**: `app/`, `tests/`, `requirements.txt`
- **TypeScript**: `packages/`, `package.json`, `pnpm-workspace.yaml`

The Python API continues to work while TypeScript implementation is developed in parallel.

## Contributing

When contributing to the TypeScript monorepo:

1. Follow the established code style (enforced by ESLint/Prettier)
2. Add comprehensive JSDoc comments to all public APIs
3. Ensure all types are strictly typed (no `any`)
4. Write tests for new functionality
5. Update documentation as needed
6. Run `pnpm type-check` and `pnpm lint` before committing

## Troubleshooting

### pnpm install fails

Ensure you have pnpm >= 8.0.0:

```bash
pnpm --version
npm install -g pnpm@latest
```

### Type errors in IDE

Rebuild project references:

```bash
pnpm clean
pnpm build
```

Restart your TypeScript server in VS Code:

- Cmd+Shift+P → "TypeScript: Restart TS Server"

### Husky hooks not running

Reinstall husky:

```bash
pnpm prepare
```

Make sure `.husky/pre-commit` is executable:

```bash
chmod +x .husky/pre-commit
```

## Resources

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
