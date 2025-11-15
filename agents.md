# Agent Runbook

Use this checklist whenever you need to reproduce the current set of fixes or apply similar ones.

1. **Sync + Install**
   - `git pull --rebase`
   - `pnpm install` (ensures workspace deps + Husky hooks are set up)
   - `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && pip install ruff black mypy bandit safety`
2. **Python validation**
   - `ruff check .`
   - `black --check .`
   - `mypy app/ --ignore-missing-imports --no-strict-optional`
   - `pytest`
3. **TypeScript validation**
   - `pnpm ts:lint`
   - `pnpm ts:type-check`
   - `pnpm ts:test`
   - `pnpm ts:test:coverage`
   - `pnpm ts:build`
4. **Commit + Push**
   - `git status -sb`
   - `git add <files>`
   - `git commit -m "<message>"`
   - `git push origin main`
5. **Mandatory follow-up**
   - Open the GitHub Actions run that corresponds to the push.
   - Inspect each job’s logs (especially the TypeScript matrix) until _every_ required check reports success.
   - If a job fails, gather the failure log, reproduce locally, and iterate before repeating the push.
