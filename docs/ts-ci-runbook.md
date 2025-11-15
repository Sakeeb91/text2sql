# TypeScript CI Runbook

This document captures what was required to repair the failing TypeScript GitHub Actions jobs (`ts-test-matrix` and the downstream required check), so future runs can be unblocked quickly.

## Symptom

- The `Vitest Suite (Node xx)` jobs failed within a second after starting Vitest.
- Logs showed `Error: Failed to resolve entry for package "@text2sql/shared"`.
- Locally the tests passed because `packages/shared/dist` already existed from prior builds.

## Root Cause

GitHub Actions performs a fresh checkout for every job, so `packages/shared/dist` is absent unless it is built during the workflow. The backend Vitest suite imports types from `@text2sql/shared`, but the package’s `main` points at `./dist/index.js`, so Vitest cannot resolve the module until it has been compiled.

## Fix

Update the root `package.json` scripts so every task that relies on the shared package builds it first:

- `ts:type-check`
- `ts:test`
- `ts:test:coverage`

Each script now runs `pnpm --filter @text2sql/shared build` just before invoking the backend command. This mirrors what CI already does for `ts:type-check` but extends it to the Vitest targets.

## Verification

After editing `package.json`:

1. `pnpm ts:lint`
2. `pnpm ts:type-check`
3. `pnpm ts:test`
4. `pnpm ts:test:coverage`
5. `pnpm ts:build`

All commands should pass locally. Push the commit and monitor the TypeScript workflow in GitHub Actions until every job is ✅.
