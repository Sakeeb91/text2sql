## Summary
Add diagnostics for table row counts via a new GET /tables endpoint. This complements `/schema` by exposing table names and row counts for quick sanity checks and observability.

## Changes
- feat(models): add `TableInfo` and `TablesResponse` models
- feat(database): add `get_table_row_counts()` helper
- feat(api): new `GET /tables` endpoint (returns names and row counts)
- test(api): add tests for `/tables` payload and invariants
- test(database): cover `get_table_row_counts` structure
- docs(readme): document `/tables` with example response
- docs(database): reference `/tables` for diagnostics
- docs(postman): add request for `/tables`
- docs(contributing): add contribution guidelines
- docs(models): add OpenAPI examples for tables responses
- refactor(openai): expand disallowed SQL keywords (PRAGMA, ATTACH, VACUUM)
- chore(env): add `.env.example` with documented variables

## Alignment with Codebase
- Matches existing FastAPI and Pydantic conventions (`response_model`, typed responses)
- Preserves security invariants; table counts are read-only and do not expose sensitive data
- Keeps module-level docstrings concise and high-signal per repo style
- Adds examples on models to improve OpenAPI docs consistency

## Implementation Notes
- Row counts gathered via `COUNT(*)` per table; acceptable for the small seeded SQLite dataset
- Reuses existing SQLAlchemy engine; no duplicate session/engine setup
- Postman collection extended to include the new endpoint for manual verification

## Testing
- Full suite passing locally:
  - 49 passed, 1 skipped
  - Coverage: 99.6% (>= 85% gate)
- Added unit tests for API and database helpers related to `/tables`

## Docs
- README: new section for `GET /tables`
- docs/database.md: curl example for `/tables`
- CONTRIBUTING: code style, testing, commit message guidance
- Postman: new request stub

## Screenshots / Demo
- Swagger: `/docs` will now list `GET /tables` with example schema

Closes #18


