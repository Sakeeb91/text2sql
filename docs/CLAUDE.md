# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Text-to-SQL API: A FastAPI application that converts natural language questions into SQL queries using OpenAI's GPT-4o-mini model and executes them against a SQLite database. The system enforces read-only operations for security.

## Commands

### Development

```bash
# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run the application locally
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Access API documentation
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

### Testing

```bash
# Run all tests with coverage (minimum 85% required)
pytest

# Run specific test suites
pytest tests/test_models.py tests/test_main.py tests/test_openai.py -v  # Unit tests
pytest tests/test_integration.py -v  # Integration tests
pytest tests/test_e2e.py -v  # End-to-end tests

# Run single test
pytest tests/test_database.py::test_specific_function -v

# Generate HTML coverage report
pytest --cov=app --cov-report=html
open htmlcov/index.html

# Coverage with missing lines
pytest --cov=app --cov-report=term-missing
```

### Code Quality

```bash
# Lint with Ruff
ruff check .

# Auto-fix with Ruff
ruff check . --fix

# Format with Black (line length: 120)
black .

# Check formatting without modifying
black --check .

# Type checking (advisory only)
mypy app/ --ignore-missing-imports --no-strict-optional

# Security scanning
bandit -r app/ -ll
safety check
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f text2sql-api

# Stop and remove containers
docker-compose down

# Stop and remove volumes (deletes database)
docker-compose down -v

# Check container health
docker-compose ps
docker inspect --format='{{.State.Health.Status}}' text2sql-api
```

## Architecture

### Module Structure

```
app/
├── __init__.py
├── main.py              # FastAPI app with /health and /query endpoints
├── database.py          # SQLAlchemy ORM, schema inspection, query execution
├── openai_client.py     # OpenAI Responses API integration, SQL generation
└── models.py            # Pydantic models: QueryRequest, QueryResponse, HealthResponse
```

### Key Architectural Patterns

**Three-Layer Architecture:**
1. **API Layer** (`main.py`): FastAPI endpoints handle HTTP requests/responses
2. **Business Logic** (`openai_client.py`): Generates SQL using OpenAI, validates read-only queries
3. **Data Layer** (`database.py`): SQLAlchemy engine, schema inspection, query execution

**Request Flow:**
1. POST /query receives natural language question
2. `database.get_database_schema()` retrieves current schema
3. `openai_client.generate_sql_query()` generates SQL via OpenAI Responses API
4. Validation ensures only SELECT queries (blocks INSERT/UPDATE/DELETE/DROP/etc.)
5. `database.execute_query()` executes validated SQL
6. Results returned as JSON with question, sql_query, results, success

### Security Model

**Read-Only SQL Enforcement:**
- System prompt instructs model to generate only SELECT queries
- `validate_query_is_read_only()` strips comments, checks for disallowed keywords
- Regex pattern blocks: INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, REPLACE, TRUNCATE
- Single statement validation (rejects multiple statements separated by semicolons)

### Database Layer

**Tables:**
- `customers`: id, name, email, city, created_at
- `orders`: id, customer_id, product_name, quantity, total_amount, order_date

**Deterministic Seeding:**
- `_build_customers_seed()`: 14 customers across 14 cities
- `_build_orders_seed()`: 24 orders referencing 8 products
- Seed runs only if tables are empty (idempotent)

**Connection Handling:**
- SQLite with `check_same_thread=False` for FastAPI concurrency
- NullPool for SQLite (no connection pooling)
- Database file: `./data/database.db` (configurable via DATABASE_URL)

### OpenAI Integration

**Responses API Usage:**
- Endpoint: `client.responses.create()`
- Model: `gpt-4o-mini` (configurable via OPENAI_MODEL)
- Temperature: `0.1` (configurable via OPENAI_TEMPERATURE)
- Response format: `json_object` with schema `{"sql": "SELECT ..."}`

**Response Extraction:**
- `_extract_text_from_response()` handles Responses API output structure
- Parses JSON to extract SQL query
- Validates query before returning

## Environment Variables

Required in `.env` (copy from `.env.example`):

```env
OPENAI_API_KEY=your_openai_api_key_here  # Required
DATABASE_URL=sqlite:///./data/database.db  # Optional (default shown)
OPENAI_MODEL=gpt-4o-mini  # Optional (default shown)
OPENAI_TEMPERATURE=0.1  # Optional (default shown)
```

## Code Style and Standards

**Formatting:**
- Line length: 120 characters
- Formatter: Black with target Python 3.9+
- Import sorting: Ruff (isort rules)

**Linting:**
- Ruff checks: pycodestyle (E/W), pyflakes (F), isort (I), flake8-bugbear (B), comprehensions (C4), pyupgrade (UP)
- Ignored: E501 (line length handled by Black), B008, C901, UP035/UP006/UP045 (Python 3.9 compatibility)

**Type Hints:**
- Use `from __future__ import annotations` for forward references
- Prefer `Optional[X]` over `X | None` (Python 3.9 compatibility)
- Type checking with mypy is advisory (continue-on-error: true)

**Testing:**
- Minimum coverage: 85% (enforced in pytest.ini and CI)
- Target coverage: database.py (100%), openai_client.py (>90%), main.py (>85%), models.py (100%)
- Markers: `@pytest.mark.slow`, `@pytest.mark.integration`, `@pytest.mark.e2e`

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push to main/develop and PRs:

1. **code-quality**: Ruff, Black, mypy, Bandit, Safety
2. **test-matrix**: Pytest with coverage on Python 3.9-3.12 (Ubuntu + macOS for 3.11)
3. **api-contract-validation**: Start server, validate OpenAPI schema, test endpoints
4. **database-integrity**: Test init_db, schema inspection, query execution
5. **performance-check**: E2E performance benchmarks (advisory)
6. **documentation-validation**: Markdown linting (when docs/ or README.md changed)
7. **pr-summary**: Automated comment on PRs with results

Required secrets: `OPENAI_API_KEY` (or uses fallback `sk-test-key-for-ci` for CI)

## Common Development Tasks

**Adding a New Endpoint:**
1. Define Pydantic models in `app/models.py`
2. Add endpoint function in `app/main.py` with route decorator
3. Write tests in `tests/test_api.py`
4. Update OpenAPI examples in model `Config.json_schema_extra`

**Modifying Database Schema:**
1. Update table definitions in `app/database.py` (customers_table, orders_table)
2. Adjust seed data functions if needed (`_build_customers_seed`, `_build_orders_seed`)
3. Update tests in `tests/test_database.py`
4. Note: No migrations framework - schema changes require manual database recreation

**Changing OpenAI Integration:**
1. Modify `SYSTEM_PROMPT` in `app/openai_client.py` for prompt engineering
2. Update validation in `validate_query_is_read_only()` for new SQL patterns
3. Adjust `_extract_text_from_response()` if response structure changes
4. Mock OpenAI responses in tests using `tests/conftest.py` fixtures

**Running Integration Tests Against Real OpenAI:**
- Set valid `OPENAI_API_KEY` in `.env`
- Run `pytest tests/test_integration.py tests/test_e2e.py -v`
- Note: Uses real API credits, responses may vary

## Known Constraints

- SQLite database (single-file, no horizontal scaling)
- OpenAI Responses API required (not compatible with older Chat Completions API directly)
- Single-statement SQL only (no multi-query batching)
- Docker user runs as non-root `appuser` (UID 1000) for security
- Coverage must remain ≥85% for CI to pass
