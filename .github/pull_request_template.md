## Summary

Provide a concise summary of the changes and the motivation behind them.

## Changes

- [ ] New endpoints
- [ ] Tests
- [ ] Documentation
- [ ] Build/CI
- [ ] Refactors

## Implementation Details

- Key design decisions
- Notable trade-offs
- Backward compatibility considerations

## Screenshots / Demo (if applicable)

Paste screenshots or a brief demo description.

## How to Test

1. Run `./scripts/run_tests.sh -v`
2. Start the API: `uvicorn app.main:app --reload`
3. Verify:
   - GET `/` returns metadata
   - GET `/health` returns ok + timestamp
   - GET `/schema` returns schema text
   - POST `/query` returns SQL + results (or error)

## Related Issues

Closes #17

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Follows project conventions and style
- [ ] Self-reviewed for readability and maintainability

