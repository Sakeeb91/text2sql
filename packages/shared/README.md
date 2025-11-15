# @text2sql/shared

Shared TypeScript types and utilities for the Text-to-SQL application monorepo.

## Overview

This package contains common type definitions that are used across both the backend (NestJS) and frontend (Next.js) applications. By centralizing these types, we ensure consistency and type safety throughout the entire application stack.

## Installation

This package is part of the monorepo and is automatically linked via pnpm workspaces. To use it in other packages:

```json
{
  "dependencies": {
    "@text2sql/shared": "workspace:*"
  }
}
```

## Usage

Import types in your backend or frontend code:

```typescript
import { QueryRequest, QueryResponse, HealthResponse } from '@text2sql/shared';

// Use in your API handlers
function handleQuery(request: QueryRequest): QueryResponse {
  // Implementation
}
```

## Available Types

### API Types

- **QueryRequest**: Request payload for natural language queries
- **QueryResponse**: Response containing SQL query and execution results
- **HealthResponse**: Health check endpoint response

### Database Types

- **Customer**: Customer entity schema
- **Order**: Order entity schema
- **TableSchema**: Database table metadata
- **ColumnDefinition**: Database column metadata

## Development

```bash
# Build the package
pnpm build

# Watch mode for development
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Type Safety

All types in this package are strictly typed with comprehensive JSDoc documentation. The TypeScript compiler is configured with strict mode enabled to catch potential type errors at compile time.

## Contributing

When adding new types:

1. Place them in the appropriate file under `src/types/`
2. Export them from `src/types/index.ts`
3. Add comprehensive JSDoc comments with examples
4. Ensure types match the Python Pydantic models in the existing codebase
5. Run `pnpm type-check` to verify no type errors

## License

MIT
