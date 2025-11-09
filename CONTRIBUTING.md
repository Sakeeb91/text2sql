## Contributing Guide

Thank you for contributing! This project maintains two stacks:
- Python/FastAPI (production-ready)
- TypeScript/NestJS (in progress)

Please follow the conventions below to keep the codebase consistent, maintainable, and well-documented.

### Workflow
- Fork the repository
- Create a feature branch: `git checkout -b feat/short-description`
- Keep commits small and meaningful; group related changes together
- Ensure tests pass locally before opening a PR
- Open a PR with a clear title and description (see template below)

### Commit Messages
- Use conventional commits:
  - `feat(api): add GET /tables endpoint`
  - `fix(database): handle empty SQL input`
  - `docs(readme): clarify local setup`
  - `test(openai): cover JSON parse error path`
  - `chore(env): add .env.example`
- Each commit should represent a logical change with context.

### Python Code Style
- Python 3.9+
- Formatting: Black (120 chars), import order consistent with project
- Type hints required; prefer explicit return annotations
- Tests: `pytest --cov=app --cov-fail-under=85`
- Docstrings:
  - Module-level docstrings summarizing responsibilities
  - Public functions/classes include concise, high-signal docstrings
  - Document invariants and edge cases where non-obvious

### FastAPI Conventions
- Define Pydantic models in `app/models.py`
- Use `response_model` on routes for clear contracts
- Return structured error payloads where applicable
- Add examples to Pydantic models via `Config.json_schema_extra`

### Database Layer
- Use helpers in `app/database.py` (do not duplicate engine/session creation)
- Return lists of dictionaries for query results
- Propagate errors via `DatabaseExecutionError` for execution failures

### OpenAI Client
- Keep prompts and validation logic in `app/openai_client.py`
- Ensure only read-only SQL (single SELECT statement) is accepted
- Handle multiple SDK output shapes gracefully

### Tests
- Prefer focused unit tests + minimal integration coverage
- Keep test naming descriptive and scenarios realistic
- Use `monkeypatch` for external calls (OpenAI) and to isolate behavior

### Documentation
- Update `README.md` and relevant docs in `docs/` for user-facing changes
- Update Postman collection for new/changed endpoints
- Include examples and sample payloads where helpful

### Pull Request Template
```
## Summary
Concise description of what changed and why.

## Changes
- feat(...): short bullet
- fix(...): short bullet
- docs(...): short bullet

## Alignment with Codebase
- Mentions of conventions followed (typing, error handling, security)

## Testing
- Suites run locally
- Coverage outcome

## Screenshots / Demo
Optional
```

### CI/CD
- PRs must pass tests and coverage gate (>=85%)
- Avoid large, unrelated changes; prefer smaller PRs with focused scope

We appreciate your contributions! 🙌


