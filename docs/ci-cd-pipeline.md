# CI/CD Pipeline Documentation

## Overview

This project uses a comprehensive GitHub Actions CI/CD pipeline that provides high confidence for merging pull requests. The pipeline is designed to catch issues early, maintain code quality, and ensure the application works correctly across different environments.

## Pipeline Architecture

The CI pipeline consists of **7 parallel jobs** organized into required checks and advisory checks:

### Required Checks (Must Pass to Merge)

1. **Code Quality Checks**
2. **Test Matrix**
3. **API Contract Validation**
4. **Database Integrity**

### Advisory Checks (Informational)

5. **Performance Benchmarks**
6. **Documentation Validation**
7. **PR Summary Comment**

## Job Descriptions

### 1. Code Quality Checks

**Purpose**: Enforce code standards, security, and type safety

**Steps**:

- **Ruff Linter**: Fast Python linter checking for code style, bugs, and best practices
- **Black Formatter**: Ensures consistent code formatting (120 char line length)
- **MyPy Type Checker**: Static type checking (advisory mode)
- **Bandit Security Scanner**: Scans for common security issues (advisory mode)
- **Safety Dependency Scanner**: Checks for known vulnerabilities in dependencies (advisory mode)

**Why It's Required**: Prevents code quality issues from entering the codebase

**Configuration**: See `pyproject.toml` for linting and formatting rules

### 2. Test Matrix

**Purpose**: Ensure compatibility across Python versions and operating systems

**Matrix**:

```yaml
Python Versions: 3.9, 3.10, 3.11, 3.12
Operating Systems: Ubuntu (all versions), macOS (Python 3.11 only)
```

**Steps**:

- Install dependencies
- Run full test suite with coverage
- Enforce 85% minimum coverage threshold
- Upload coverage to Codecov (for Python 3.11/Ubuntu)

**Why It's Required**: Ensures the application works on different environments

**Coverage Reports**: Available in job artifacts and on Codecov

### 3. API Contract Validation

**Purpose**: Ensure API endpoints are working and schema is valid

**Steps**:

- Start FastAPI server
- Validate OpenAPI schema is accessible
- Test health endpoint returns success
- Test query endpoint structure
- Upload OpenAPI schema as artifact

**Why It's Required**: Prevents breaking API changes from being merged

**Artifacts**: OpenAPI schema saved for comparison between versions

### 4. Database Integrity

**Purpose**: Verify database layer works correctly from scratch

**Steps**:

- Test database initialization
- Test schema inspection
- Test query execution
- Run all database-specific tests

**Why It's Required**: Ensures database operations are reliable and deterministic

### 5. Performance Benchmarks (Advisory)

**Purpose**: Monitor API response time and catch performance regressions

**Steps**:

- Run performance-specific tests
- Measure query endpoint response time
- Compare against baseline (< 3 seconds)

**Why It's Advisory**: Performance can vary by environment, useful for trends but shouldn't block merges

**Action on Failure**: Review performance metrics but doesn't block PR

### 6. Documentation Validation (Advisory)

**Purpose**: Ensure documentation is well-formatted and links work

**Triggered**: Only when documentation files change (docs/, README.md)

**Steps**:

- Markdown linting
- Link validation (all links return 200)

**Why It's Advisory**: Documentation issues shouldn't block functional changes

### 7. PR Summary Comment

**Purpose**: Provide at-a-glance view of CI results

**Steps**:

- Wait for all required checks
- Generate summary with pass/fail status
- Post comment on pull request

**Content**:

- Status of all required checks
- Links to detailed results
- Coverage information
- Links to artifacts

## TypeScript Workflow (Phase 1.5)

A dedicated workflow (`.github/workflows/ts-ci.yml`) keeps the NestJS backend honest while it evolves.

### Job Overview

1. **ts-code-quality** – ESLint, Prettier check, and TypeScript type-checking via `pnpm ts:*` scripts.
2. **ts-test-matrix** – Vitest test suite on Node 18/20/22.
3. **ts-coverage** – Generates `coverage/typescript/backend` artifacts and uploads to Codecov.
4. **ts-build** – Runs `pnpm ts:build` to ensure the NestJS bundle compiles.
5. **ts-database-integrity** – Executes `pnpm ts:env:validate` to verify the new env templates and PostgreSQL DSNs.
6. **ts-performance-check** – Builds the backend, launches it on port 4010, and pings `/health` as a smoke/perf check.
7. **ts-security-scan** – `pnpm audit --prod` (advisory) for dependency vulnerabilities.
8. **ts-pr-summary** – Comments on PRs with the TypeScript job results.
9. **ts-required** – Gatekeeper job; fails if code-quality, test matrix, or build jobs fail.

### Triggers

The workflow runs on the same branches/PRs as the Python pipeline (`main`, `develop`, `feat/**`, `issue/**`).

## Triggering the Pipeline

The pipeline runs automatically on:

```yaml
Push to branches:
  - main
  - develop
  - issue/**
  - docs/**

Pull requests to:
  - main
```

## Local Development Workflow

Before pushing, run these checks locally to catch issues early:

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Format code
black app/ tests/

# Check linting
ruff check app/ tests/

# Run tests with coverage
pytest --cov=app --cov-report=term-missing

# Type checking
mypy app/ --ignore-missing-imports
```

## Configuration Files

### pyproject.toml

Central configuration for all tools:

```toml
[tool.black]
line-length = 120
target-version = ['py39', 'py310', 'py311', 'py312']

[tool.ruff.lint]
select = ["E", "W", "F", "I", "B", "C4", "UP"]
ignore = ["E501", "UP035", "UP006", "UP045"]

[tool.pytest.ini_options]
addopts = ["--cov=app", "--cov-fail-under=85"]
```

### .github/workflows/ci.yml

Main CI pipeline definition with all Python-focused jobs

### .github/workflows/ts-ci.yml

TypeScript CI workflow with pnpm caching, Vitest coverage, Docker-friendly health checks, and PR summaries.

### requirements-dev.txt

Development tools and dependencies

## Branch Protection Rules

Recommended settings for the `main` branch:

```yaml
Required status checks: ✓ Code Quality Checks
  ✓ Test Matrix (Python 3.11, ubuntu-latest)
  ✓ API Contract Validation
  ✓ Database Integrity
  ✓ TypeScript Required Checks
  ✓ All Required Checks Passed

Additional settings: ✓ Require branches to be up to date before merging
  ✓ Require pull request reviews (1 approver)
  ✓ Dismiss stale reviews when new commits are pushed
  ✓ Require review from code owners
```

## Setting Up Branch Protection

1. Go to Repository Settings → Branches
2. Click "Add rule" for branch name pattern: `main`
3. Enable "Require status checks to pass before merging"
4. Select these required checks:
   - `Code Quality Checks`
   - `Tests (Python 3.11, ubuntu-latest)`
   - `API Contract Validation`
   - `Database Integrity Tests`
   - `All Required Checks Passed`
5. Enable "Require branches to be up to date"
6. Save changes

## Troubleshooting CI Failures

### Code Quality Failures

**Problem**: Ruff or Black checks fail

**Solution**:

```bash
# Auto-fix most issues
black app/ tests/
ruff check --fix app/ tests/

# Check what remains
ruff check app/ tests/
```

### Test Failures

**Problem**: Tests fail in CI but pass locally

**Possible Causes**:

1. Missing environment variable (OPENAI_API_KEY)
2. Python version differences
3. Database state issues

**Solution**:

```bash
# Test with specific Python version
python3.11 -m pytest

# Clean database and retry
rm -rf data/database.db
pytest
```

### Coverage Failures

**Problem**: Coverage below 85% threshold

**Solution**:

```bash
# See which lines are missing coverage
pytest --cov=app --cov-report=term-missing

# Add tests for uncovered lines
# Check app/openai_client.py - this is usually the culprit
```

### API Contract Failures

**Problem**: API endpoints don't match schema

**Solution**:

- Check FastAPI server starts successfully
- Verify OpenAPI schema at http://localhost:8000/openapi.json
- Ensure response models match Pydantic definitions

### Type Checking Warnings

**Problem**: MyPy reports type errors

**Note**: Type checking is currently advisory (won't block merge)

**Solution**:

```bash
mypy app/ --ignore-missing-imports
# Fix reported issues for better code quality
```

## Performance Monitoring

The performance check measures query endpoint response time:

**Baseline**: < 3 seconds per query
**Measured**: p95 latency of 5 consecutive queries

**If performance degrades**:

1. Check OpenAI API latency
2. Profile SQL query execution
3. Review any new database operations
4. Check for N+1 query patterns

## Security Scanning

Two security tools run in advisory mode:

### Bandit

Scans Python code for common security issues:

- SQL injection vulnerabilities
- Hardcoded passwords
- Insecure random number generation
- Use of unsafe functions

### Safety

Checks dependencies for known CVEs:

- Compares requirements.txt against vulnerability database
- Reports critical/high severity issues

**Recommendation**: Review security reports even if advisory

## Codecov Integration

Coverage reports are uploaded to Codecov for:

- Historical coverage tracking
- PR coverage diffs
- Coverage visualization

**Setup**: Add `CODECOV_TOKEN` to repository secrets for full integration

## Environment Variables

The CI pipeline uses these environment variables:

```yaml
OPENAI_API_KEY:
  - Value: ${{ secrets.OPENAI_API_KEY }}
  - Fallback: 'sk-test-key-for-ci' (for testing without API)
  - Usage: OpenAI client authentication

PYTHON_VERSION:
  - Value: "3.11"
  - Usage: Default Python version for most jobs

MIN_COVERAGE:
  - Value: 85
  - Usage: Minimum required test coverage percentage
```

**Setting Secrets**:

1. Go to Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add `OPENAI_API_KEY` with your API key
4. Save

## Artifacts

CI jobs generate artifacts for debugging:

### Security Reports

- Location: `security-reports/bandit-report.json`
- Retention: 90 days
- Contains: Detailed security scan results

### OpenAPI Schema

- Location: `openapi-schema/openapi.json`
- Retention: 90 days
- Contains: Current API schema definition

**Downloading Artifacts**:

1. Go to Actions → Select workflow run
2. Scroll to "Artifacts" section
3. Click to download

## Best Practices

### For Developers

1. **Run checks locally first**: Catch issues before pushing

   ```bash
   black app/ tests/ && ruff check app/ tests/ && pytest
   ```

2. **Keep tests fast**: CI runs on every push, slow tests hurt productivity

3. **Write meaningful commit messages**: CI logs reference commits

4. **Fix advisory warnings**: Don't let them accumulate

### For Reviewers

1. **Check CI status before reviewing**: Don't waste time on failing PRs

2. **Review coverage reports**: Ensure new code is tested

3. **Look at security scan results**: Even if advisory

4. **Verify API changes**: Check OpenAPI schema artifact if endpoints changed

### For Merging

1. **Ensure all required checks pass**: Never override required checks

2. **Review PR summary comment**: Quick overview of CI results

3. **Check advisory checks**: Fix before merging if possible

4. **Verify branch is up to date**: Prevents merge conflicts

## Continuous Improvement

Monitor these metrics over time:

- **Test execution time**: Should stay under 2 minutes
- **Coverage percentage**: Aim to maintain or improve
- **Linting issues**: Should decrease over time
- **Security vulnerabilities**: Should be fixed promptly

## CI Pipeline Evolution

### Phase 1 (Current)

- ✅ Multi-Python version testing
- ✅ Code quality enforcement
- ✅ Security scanning
- ✅ API contract validation

### Phase 2 (Planned)

- [ ] Automated dependency updates (Dependabot)
- [ ] Docker image building and scanning
- [ ] E2E tests against staging environment
- [ ] Performance regression detection
- [ ] Automatic changelog generation

### Phase 3 (Future)

- [ ] Continuous deployment to staging
- [ ] Blue-green deployments to production
- [ ] Automated rollback on failure
- [ ] Load testing in CI
- [ ] Cost optimization tracking

## Getting Help

**CI Failures**: Check this document first, then:

1. Review job logs in GitHub Actions
2. Download artifacts for detailed reports
3. Reproduce locally with same Python version
4. Ask in team chat with link to failing run

**Configuration Changes**:

- Open an issue before modifying CI pipeline
- Test changes in feature branch first
- Document any new requirements

## Related Documentation

- [Database Layer Documentation](./database.md)
- [Testing Strategy](../tests/README.md) (if exists)
- [Contributing Guidelines](../CONTRIBUTING.md) (if exists)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Changelog

### 2025-10-30

- Initial CI/CD pipeline implementation
- Added code quality checks with ruff and black
- Added test matrix for Python 3.9-3.12
- Added API contract validation
- Added database integrity tests
- Added performance benchmarks (advisory)
- Added documentation validation (advisory)
- Added automated PR summary comments
