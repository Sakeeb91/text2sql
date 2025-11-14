# Text-to-SQL Application

A production-ready application that converts natural language questions into SQL queries using AI language models. Features a FastAPI backend, Streamlit web interface, and an in-progress TypeScript/NestJS migration for enhanced scalability and multi-provider AI support.

## Overview

This project contains two implementations:

### Python/FastAPI Stack (Production Ready ✅)

1. **FastAPI Backend**: A RESTful API that accepts natural language questions and returns both the generated SQL query and its execution results.
2. **Streamlit Frontend**: An interactive web interface for querying data using natural language.

The system is designed with security in mind, generating only read-only SELECT queries to prevent unauthorized data modifications.

### TypeScript/NestJS Stack (In Development 🚧)

A modern TypeScript monorepo architecture with:

- **NestJS Backend**: Modular backend with AI provider abstraction layer
- **Next.js Frontend**: (Planned) Modern React-based UI
- **Shared Types Package**: Type-safe contracts across the stack

See [MONOREPO.md](MONOREPO.md) for details on the TypeScript migration.

### Why Two Stacks?

The project maintains both Python and TypeScript implementations to serve different needs:

**Python/FastAPI Stack:**

- ✅ Production-ready and fully tested
- ✅ Quick to deploy and iterate
- ✅ Excellent for data science and ML workflows
- ✅ Simpler deployment with fewer dependencies

**TypeScript/NestJS Stack:**

- 🎯 Enterprise-grade scalability and maintainability
- 🎯 Type safety across the entire stack
- 🎯 Multi-provider AI support (OpenAI, Anthropic, custom)
- 🎯 Modern frontend with Next.js
- 🎯 Better suited for large teams and complex features

Both implementations will coexist, allowing you to choose the stack that best fits your needs. The Python stack is recommended for immediate use, while the TypeScript stack is being developed for enhanced features and scalability.

## Features

### Core Features (Both Stacks)

**Natural Language to SQL Processing:**

- Convert plain English questions into valid SQL queries using AI
- Schema-aware query generation with automatic database inspection
- Security-first design: only SELECT queries allowed
- Comprehensive error handling and validation

**API Capabilities:**

- RESTful API with clean, well-documented endpoints
- Auto-generated Swagger/OpenAPI documentation
- CORS enabled for frontend integration
- Health check endpoints for monitoring

### Python/FastAPI Stack Features ✅

**Backend:**

- FastAPI with Uvicorn ASGI server
- SQLAlchemy ORM with SQLite database
- OpenAI GPT-4o-mini integration (Responses API)
- 85%+ test coverage with pytest
- Docker and Docker Compose support
- GitHub Actions CI/CD with 7 parallel jobs

**Frontend:**

- 🔍 Interactive Streamlit web interface
- 📊 Live results display in interactive tables
- 📥 CSV export functionality
- 💡 Pre-loaded example questions
- ⚙️ Easy API configuration
- ✅ Real-time API health monitoring

### TypeScript/NestJS Stack Features 🚧

**Backend (In Progress):**

- NestJS modular architecture
- TypeORM for database operations
- AI Provider Abstraction Layer (multi-provider support)
- Global exception filters and validation pipes
- Swagger documentation auto-generation
- Type-safe API contracts with shared types

**Frontend (Planned):**

- Next.js 14 with App Router
- Server-side rendering for better performance
- AI provider selector in UI
- Modern, responsive design with Tailwind CSS
- Type-safe API client with React Query

**Shared Package (Completed):**

- Centralized TypeScript type definitions
- API request/response types
- Database entity types
- Schema metadata types

## Architecture

### Python/FastAPI Architecture (Current Production)

The application uses a modern client-server architecture:

```
┌─────────────────┐      HTTP/JSON      ┌──────────────────┐
│   Streamlit     │ ──────────────────> │   FastAPI        │
│   Frontend      │                     │   Backend        │
│  (User Interface)│ <────────────────── │  (REST API)      │
└─────────────────┘    Query Results    └──────────────────┘
                                                │
                                                ├─> SQLite Database
                                                └─> OpenAI API
```

### TypeScript Monorepo Architecture (In Development)

```
┌─────────────────┐      HTTP/JSON      ┌──────────────────┐
│   Next.js       │ ──────────────────> │   NestJS         │
│   Frontend      │                     │   Backend        │
│  (Planned)      │ <────────────────── │  (In Progress)   │
└─────────────────┘                     └──────────────────┘
        │                                        │
        │                                        ├─> TypeORM + Database
        └────────────────────────────────────────┤
                   @text2sql/shared              └─> AI Provider Layer
                   (Shared Types ✅)                 (OpenAI, Anthropic, Custom)
```

### Project Structure

```
text2sql/
├── app/                      # Python FastAPI Backend (Production)
│   ├── main.py              # API endpoints + CORS
│   ├── database.py          # Database layer with SQLAlchemy
│   ├── openai_client.py     # OpenAI integration
│   └── models.py            # Pydantic models
├── streamlit_app/           # Streamlit Frontend (Production)
│   ├── streamlit_app.py     # Web interface
│   ├── requirements.txt     # Frontend dependencies
│   └── .streamlit/
│       └── config.toml      # Theme configuration
├── packages/                # TypeScript Monorepo (In Development)
│   ├── backend/            # NestJS backend (Phase 3)
│   │   ├── src/
│   │   │   ├── modules/    # Feature modules (health, query, ai-provider, database)
│   │   │   ├── config/     # Configuration and validation
│   │   │   ├── common/     # Shared utilities and filters
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── package.json
│   ├── frontend/           # Next.js frontend (Phase 4 - Planned)
│   │   └── package.json
│   └── shared/             # Shared TypeScript types (Phase 1.1 ✅)
│       ├── src/
│       │   └── types/      # API and database types
│       └── package.json
├── tests/                   # Python test suite
├── docs/                    # Documentation
│   ├── DEPLOYMENT.md       # Deployment guide
│   ├── CLAUDE.md           # Developer guide
│   ├── database.md         # Database documentation
│   └── ci-cd-pipeline.md   # CI/CD documentation
├── scripts/                 # Utility scripts
│   ├── setup.sh            # Project setup
│   ├── run_tests.sh        # Test runner
│   └── deploy.sh           # Deployment helper
├── Dockerfile               # Backend container
├── docker-compose.yml       # Local development
├── pnpm-workspace.yaml      # TypeScript workspace config
├── package.json             # Root monorepo scripts
├── requirements.txt         # Python backend dependencies
└── MONOREPO.md             # TypeScript migration guide
```

## Technology Stack

### Python Stack (Production)

**Backend:**

- **FastAPI**: Modern, fast web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI applications
- **SQLAlchemy**: SQL toolkit and ORM for database operations
- **OpenAI API**: GPT-4o-mini model for natural language processing
- **SQLite**: Lightweight, serverless database
- **Pydantic**: Data validation using Python type annotations

**Frontend:**

- **Streamlit**: Interactive web application framework
- **Pandas**: Data manipulation and CSV export
- **Requests**: HTTP client for API communication

**DevOps:**

- **Docker**: Containerization and local development
- **GitHub Actions**: CI/CD pipeline with automated testing
- **Render/Railway**: Cloud deployment platforms

### TypeScript Stack (In Development)

**Backend (NestJS):**

- **NestJS**: Progressive Node.js framework with TypeScript
- **TypeORM**: TypeScript-first ORM for database operations
- **AI Provider Abstraction**: Multi-provider support (OpenAI, Anthropic, custom)
- **Swagger/OpenAPI**: Auto-generated API documentation
- **Class Validator**: Request validation with decorators

**Frontend (Planned):**

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe frontend development
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Data fetching and state management

**Shared:**

- **pnpm Workspaces**: Monorepo package management
- **TypeScript Project References**: Fast incremental builds
- **ESLint + Prettier**: Code quality and formatting
- **Husky**: Git hooks for pre-commit checks

## Quick Start

Choose your preferred stack:

### Python/FastAPI Stack (Production Ready)

**Option 1: Run Locally**

**Prerequisites:**

- Python 3.9 or higher
- OpenAI API key
- Docker and Docker Compose (optional, for containerized deployment)

See [Installation](#installation) below for detailed setup instructions.

**Option 2: Deploy Your Own**

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for step-by-step guides to deploy on:

- **Render** (recommended, free tier)
- **Railway** (fast deployments, free tier)
- **Fly.io** (global edge deployment)
- **Streamlit Cloud** (frontend hosting, free)

### TypeScript/NestJS Stack (In Development)

**Prerequisites:**

- Node.js >= 18.0.0
- pnpm >= 8.0.0

**Setup:**

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run in development mode
pnpm dev
```

See [MONOREPO.md](MONOREPO.md) for detailed TypeScript development guide.

## Installation

### Python/FastAPI Installation

#### Prerequisites

- Python 3.9 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Docker and Docker Compose (optional, for containerized deployment)

#### Local Development

1. Clone the repository:

```bash
git clone https://github.com/Sakeeb91/text2sql.git
cd text2sql
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

5. Run the backend API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

6. (Optional) Run the Streamlit frontend:

```bash
# In a new terminal
cd streamlit_app
pip install -r requirements.txt
streamlit run streamlit_app.py
```

7. Access the application:
   - **API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs
   - **Streamlit UI**: http://localhost:8501 (if running)

### TypeScript/NestJS Installation

#### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

#### Setup

1. Install pnpm (if not already installed):

```bash
npm install -g pnpm
```

2. Install all workspace dependencies:

```bash
pnpm install
```

3. Build all packages:

```bash
pnpm build
```

4. Run in development mode:

```bash
# Run all packages
pnpm dev

# Or run specific package
cd packages/backend
pnpm dev
```

5. Access the NestJS application:
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/docs
   - Health Check: http://localhost:3000/health

See [MONOREPO.md](MONOREPO.md) for more details on the TypeScript stack.

### Docker Deployment (Python Stack)

Docker provides a consistent, isolated environment for running the Python application. The setup includes automatic database persistence, health checks, and easy configuration.

#### Prerequisites

- Docker Engine 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose 2.0+ (included with Docker Desktop)

#### Quick Start

1. Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/Sakeeb91/text2sql.git
cd text2sql
```

2. Create `.env` file with your OpenAI API key:

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

3. Build and run with Docker Compose:

```bash
docker-compose up --build
```

4. Access the application:
   - API: http://localhost:8000
   - Swagger UI: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

#### Docker Commands

```bash
# Build and start in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f text2sql-api

# Stop the application
docker-compose down

# Stop and remove volumes (deletes database)
docker-compose down -v

# Restart the application
docker-compose restart

# Check container status and health
docker-compose ps
```

#### Volume Persistence

The SQLite database is stored in `./data` and persists across container restarts:

```bash
# Database location on host
./data/database.db

# Mounted to container
/app/data/database.db
```

**Important**: Don't delete the `./data` directory unless you want to reset the database.

#### Environment Variables

Configure the application using environment variables in `.env`:

| Variable             | Description                | Default                        | Required |
| -------------------- | -------------------------- | ------------------------------ | -------- |
| `OPENAI_API_KEY`     | Your OpenAI API key        | -                              | ✅ Yes   |
| `DATABASE_URL`       | Database connection string | `sqlite:///./data/database.db` | No       |
| `OPENAI_MODEL`       | OpenAI model to use        | `gpt-4o-mini`                  | No       |
| `OPENAI_TEMPERATURE` | Model temperature (0-2)    | `0.1`                          | No       |

### Docker Deployment (TypeScript Stack)

Phase 1.5 introduces an opt-in Compose profile for the NestJS backend. The Python stack remains the default; enable the TypeScript profile when you want to work with the Node stack.

#### Quick Start

```bash
# Copy the dev template for local usage
cp packages/backend/env-templates/.env.development.example packages/backend/.env.local

# Start PostgreSQL + NestJS backend
docker compose --profile typescript up ts-postgres ts-backend

# Optional: include the placeholder frontend wiring
docker compose --profile typescript up ts-postgres ts-backend ts-frontend
```

Services in the profile:

| Service       | Purpose                              | Host Port | Notes                                       |
| ------------- | ------------------------------------ | --------- | ------------------------------------------- |
| `ts-postgres` | PostgreSQL 15 with persistent volume | `5432`    | Uses volume `ts-postgres-data`              |
| `ts-backend`  | NestJS API + hot reload              | `3000`    | Mounts src/test directories for live coding |
| `ts-frontend` | Placeholder Next.js container        | _n/a_     | Keeps env + networking ready for Phase 4    |

- Backend container runs the `development` stage from `packages/backend/Dockerfile` (`pnpm --filter @text2sql/backend dev`).
- Source directories are bind-mounted; `node_modules` stay inside the container while `ts-pnpm-store` caches pnpm artifacts.
- `DATABASE_URL` defaults to `postgresql://postgres:postgres@ts-postgres:5432/text2sql` within the Compose network.
- See [docs/typescript-devops.md](docs/typescript-devops.md) for troubleshooting and advanced scenarios.

#### Health Checks

The container includes automatic health checks that run every 30 seconds:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' text2sql-api

# View health check history
docker inspect text2sql-api | grep -A 10 Health
```

Health check statuses:

- `starting`: Container is starting up (first 40 seconds)
- `healthy`: Application is responding correctly
- `unhealthy`: Application failed health check (container will restart)

#### Resource Requirements

Minimum requirements:

- **CPU**: 1 core
- **Memory**: 512MB
- **Disk**: 200MB (plus database size)

Recommended for production:

- **CPU**: 2 cores
- **Memory**: 1GB
- **Disk**: 1GB

#### Production Deployment

For production environments, consider:

1. **Use a production database**: Replace SQLite with PostgreSQL or MySQL

   ```yaml
   environment:
     - DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```

2. **Add nginx reverse proxy**: For SSL/TLS termination and load balancing

3. **Enable Docker secrets**: For sensitive environment variables

   ```yaml
   secrets:
     - openai_api_key
   ```

4. **Implement logging**: Configure log aggregation

   ```yaml
   logging:
     driver: 'json-file'
     options:
       max-size: '10m'
       max-file: '3'
   ```

5. **Add monitoring**: Use tools like Prometheus, Grafana, or DataDog

#### Troubleshooting

##### Port Already in Use

**Error**: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution**: Change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - '8001:8000' # Use port 8001 instead
```

##### Container Exits Immediately

**Solution**: Check the logs for errors:

```bash
docker-compose logs text2sql-api
```

Common causes:

- Missing `OPENAI_API_KEY` in `.env`
- Syntax error in `.env` file
- Port conflict

##### Database Permission Errors

**Error**: `PermissionError: [Errno 13] Permission denied: '/app/data/database.db'`

**Solution**: Fix directory permissions:

```bash
chmod 777 data/
docker-compose restart
```

##### Build Failures

**Solution**: Clear Docker cache and rebuild:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

##### OpenAI API Errors

**Error**: `Invalid API key` or `Rate limit exceeded`

**Solution**:

1. Verify API key in `.env` file
2. Check API key validity at https://platform.openai.com/api-keys
3. Ensure you have sufficient API credits

#### Docker Image Details

- **Base Image**: `python:3.11-slim`
- **Image Size**: ~200MB (optimized with multi-stage build)
- **User**: Non-root user (`appuser`) for security
- **Exposed Ports**: 8000
- **Working Directory**: `/app`

#### Security Best Practices

1. **Never commit `.env` files**: They contain sensitive API keys
2. **Use Docker secrets** in production instead of environment variables
3. **Run as non-root user**: Already configured in Dockerfile
4. **Keep base images updated**: Regularly rebuild with latest Python security patches
5. **Scan for vulnerabilities**: Use `docker scan text2sql-api`

#### Testing in Docker

Run tests inside the container:

```bash
# Build test image
docker-compose -f docker-compose.test.yml build

# Run tests
docker-compose -f docker-compose.test.yml run test pytest

# Run with coverage
docker-compose -f docker-compose.test.yml run test pytest --cov=app
```

## API Documentation

Once the application is running, visit:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Endpoints

#### POST /query

Convert a natural language question to SQL and execute it.

**Request Body:**

```json
{
  "question": "How many customers do we have?"
}
```

**Response:**

```json
{
  "question": "How many customers do we have?",
  "sql_query": "SELECT COUNT(*) as customer_count FROM customers;",
  "results": [{ "customer_count": 150 }],
  "success": true
}
```

#### GET /health

Health check endpoint to verify the API is running.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET /

Root endpoint returning basic API metadata.

**Response:**

```json
{
  "name": "Text-to-SQL API",
  "description": "Convert natural language questions into SQL queries.",
  "version": "0.1.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET /schema

Return a human-readable summary of the current database schema. Useful for debugging and development.

**Response:**

```json
{
  "schema": "Table: customers\nColumns: id (INTEGER), name (TEXT), email (TEXT), city (TEXT), created_at (TIMESTAMP)\n\nTable: orders\nColumns: id (INTEGER), customer_id (INTEGER), product_name (TEXT), quantity (INTEGER), total_amount (DECIMAL), order_date (TIMESTAMP)"
}
```

#### GET /tables

Return the list of tables with their row counts. Useful for diagnostics and quick sanity checks.

**Response:**

```json
{
  "tables": [
    { "name": "customers", "row_count": 14 },
    { "name": "orders", "row_count": 24 }
  ]
}
```

## Query Playbook

The following prompts highlight common analysis tasks supported by the seeded dataset:

### Counting & Aggregations

- "How many customers are in the database?"
- "What is the total revenue?"
- "How many orders were placed last month?"

### Filtering & Segmentation

- "List all customers from New York."
- "Show orders above $500."
- "List customers who joined in 2024."

### Grouping & Sorting

- "Top 10 customers by revenue."
- "Products sorted by popularity."
- "Monthly sales trends."

### Operational Insights

- "Which customer has placed the most orders?"
- "What are the top 5 selling products?"
- "Show me the average order value by customer."
- "How many new customers joined last week?"

Each question can be issued via `POST /query`:

```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "How many customers are in the database?"}'
```

## Security Features

1. **Read-Only Queries**: System prompt explicitly instructs the model to generate only SELECT statements
2. **SQL Validation**: Server-side validation rejects any query containing INSERT, UPDATE, or DELETE
3. **Error Handling**: Comprehensive error handling prevents information leakage
4. **Environment Variables**: Sensitive credentials stored in environment variables

## Testing

The repository ships with unit, integration, and end-to-end test suites. Pytest is configured to collect coverage automatically (see `pytest.ini`).

### Quick Start

```bash
# Run the full test matrix with coverage enforcement (>=85%)
pytest
```

### Focused Suites

```bash
# Unit tests
pytest tests/test_models.py tests/test_main.py tests/test_openai.py -v

# Integration flow tests
pytest tests/test_integration.py -v

# End-to-end scenarios and performance checks
pytest tests/test_e2e.py -v
```

### Coverage Reports

```bash
# Terminal summary with missing lines
pytest --cov=app --cov-report=term-missing

# Generate HTML coverage artifacts
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

Key coverage targets:

- `app/database.py`: 100%
- `app/openai_client.py`: >90%
- `app/main.py`: >85%
- `app/models.py`: 100%

## API Testing with Postman

A ready-to-use Postman collection is available at `docs/postman/text2sql-api.postman_collection.json`. Import it to exercise:

- Health check request
- Representative query prompts (happy-path and error scenarios)
- Environment variable placeholders for `OPENAI_API_KEY` and API base URL

## Performance Benchmarks

Automated end-to-end tests assert the following baseline targets:

- Query generation and execution: <3 seconds (wall-clock)
- Database reads: <500ms for seeded dataset queries
- FastAPI startup: <10 seconds on a typical developer laptop

These checks run as part of `tests/test_e2e.py`. Use `pytest -k performance` (or run the file directly) to monitor regressions.

## Database Schema

The application includes a sample database with the following tables:

### customers

- id (INTEGER PRIMARY KEY)
- name (TEXT)
- email (TEXT)
- city (TEXT)
- created_at (TIMESTAMP)

### orders

- id (INTEGER PRIMARY KEY)
- customer_id (INTEGER FOREIGN KEY)
- product_name (TEXT)
- quantity (INTEGER)
- total_amount (DECIMAL)
- order_date (TIMESTAMP)

## Configuration

### Backend Environment Variables

Configure in `.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./data/database.db
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.1
# Comma-separated origins for CORS (defaults shown)
CORS_ALLOW_ORIGINS=http://localhost:8501,https://*.streamlit.app
```

### Frontend Environment Variables

For Streamlit deployment:

```env
API_URL=https://your-backend-url.onrender.com
```

### TypeScript Stack Environment Templates

Phase 1.5 introduces dedicated template files for the NestJS backend under `packages/backend/env-templates/`:

- `.env.development.example` – Local development defaults (Node 20 + PostgreSQL on localhost).
- `.env.test.example` – Isolated test database/port for CI environments.
- `.env.production.example` – Hardened defaults for container images or managed hosting.

Copy the template that matches your scenario to `.env.local` or `.env` inside `packages/backend/`, then override:

```bash
cp packages/backend/env-templates/.env.development.example packages/backend/.env.local
```

> **Tip:** When running the TypeScript stack, set `DATABASE_URL` to a PostgreSQL DSN (the Docker Compose stack provides `postgresql://postgres:postgres@postgres:5432/text2sql`).

## Cloud Deployment

This project is ready to deploy to production! See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for comprehensive guides.

### Backend Deployment

Deploy the FastAPI backend to:

- **[Render](https://render.com)** - Uses `.deploy/render.yaml` (free tier available)
- **[Railway](https://railway.app)** - Uses `.deploy/railway.json` (free tier available)
- **[Fly.io](https://fly.io)** - Manual setup (free tier available)
- **Docker** - Any platform supporting Docker containers

### Frontend Deployment

Deploy the Streamlit UI to:

- **[Streamlit Cloud](https://streamlit.io/cloud)** - Free hosting for Streamlit apps

### Quick Deploy Steps

1. **Deploy Backend** (choose one platform):

   ```bash
   # Render: Connect GitHub repo, auto-detects .deploy/render.yaml
   # Railway: Connect GitHub repo, auto-detects .deploy/railway.json
   # Fly.io: flyctl launch && flyctl deploy
   ```

2. **Deploy Frontend**:

   ```bash
   # Streamlit Cloud: Connect GitHub, point to streamlit_app/streamlit_app.py
   # Set API_URL environment variable to your backend URL
   ```

3. **Done!** Your app is live 🚀

Full instructions in [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Development Roadmap

### Python/FastAPI Stack ✅ (Production Ready)

- [x] Phase 1: Project Setup & Configuration
- [x] Phase 2: Database Layer Implementation (99% test coverage)
- [x] Phase 3: OpenAI Integration (Responses API)
- [x] Phase 4: FastAPI Application (CORS, validation, error handling)
- [x] Phase 5: Containerization (Docker + Docker Compose)
- [x] Phase 6: Testing & Documentation (85%+ coverage, comprehensive docs)
- [x] Phase 7: Streamlit Frontend (interactive UI with CSV export)
- [x] Phase 8: Cloud Deployment Configurations (Render, Railway, Fly.io)
- [x] Phase 9: CI/CD Pipeline (GitHub Actions with 7 parallel jobs)

**Status**: Fully functional and deployed. Ready for production use.

### TypeScript/NestJS Stack 🚧 (In Progress)

#### Completed

- [x] **Phase 1.1**: Initialize TypeScript Monorepo
  - [x] pnpm workspace configuration
  - [x] TypeScript project references
  - [x] ESLint + Prettier setup
  - [x] Husky pre-commit hooks
  - [x] Shared types package (`@text2sql/shared`)
  - [x] Basic NestJS structure with modules
  - [x] Health endpoint implementation
  - [x] Swagger/OpenAPI documentation setup
  - [x] Global exception filters and validation

#### In Progress

- [ ] **Phase 2**: AI Provider Abstraction Layer
  - [ ] Design provider interface
  - [ ] Implement OpenAI provider
  - [ ] Implement Anthropic provider
  - [ ] Add custom provider support
  - [ ] Provider configuration and switching

#### Planned

- [ ] **Phase 3**: NestJS Backend Implementation
  - [ ] Port database models to TypeORM
  - [ ] Implement SQL validation and security
  - [ ] Create query endpoints
  - [ ] Add comprehensive error handling
  - [ ] Database schema inspection

- [ ] **Phase 4**: Next.js Frontend Implementation
  - [ ] Setup Next.js 14 with App Router
  - [ ] Build query interface with Tailwind CSS
  - [ ] Implement AI provider selector
  - [ ] Add results visualization
  - [ ] CSV export functionality

- [ ] **Phase 5**: Testing & CI/CD
  - [ ] Port unit tests to Jest
  - [ ] Port integration tests
  - [ ] Add frontend tests (Vitest + Playwright)
  - [ ] Setup TypeScript CI/CD pipeline
  - [ ] E2E testing across stacks

- [ ] **Phase 6**: Documentation & Deployment
  - [ ] Update documentation for TypeScript stack
  - [ ] Configure cloud deployment for NestJS
  - [ ] Create migration guide from Python to TypeScript
  - [ ] Performance comparison benchmarks

**Current Focus**: Phase 2 - AI Provider Abstraction Layer

See [MONOREPO.md](MONOREPO.md) for detailed TypeScript migration documentation.

## Contributing

Contributions are welcome! This project has two active development tracks:

### Contributing to Python/FastAPI Stack

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes in `app/`, `tests/`, or `streamlit_app/`
4. Run tests and linting:
   ```bash
   pytest --cov=app --cov-fail-under=85
   black app/ tests/
   ruff check app/ tests/
   ```
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

**Guidelines:**

- Maintain 85%+ test coverage
- Follow Black formatting (120 char line length)
- Pass all CI checks (see [docs/ci-cd-pipeline.md](docs/ci-cd-pipeline.md))

### Contributing to TypeScript/NestJS Stack

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/typescript-feature`)
3. Make your changes in `packages/`
4. Run quality checks:
   ```bash
   pnpm type-check
   pnpm lint
   pnpm format
   pnpm build
   ```
5. Commit your changes (pre-commit hooks will run automatically)
6. Push to the branch (`git push origin feature/typescript-feature`)
7. Open a Pull Request

**Guidelines:**

- Follow TypeScript strict mode
- Add JSDoc comments to all public APIs
- Use ESLint and Prettier configurations
- Update relevant documentation in [MONOREPO.md](MONOREPO.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on the article: [Creating a Text-to-SQL App with OpenAI, FastAPI, SQLite](https://www.kdnuggets.com/creating-a-text-to-sql-app-with-openai-fastapi-sqlite)
- OpenAI for their powerful language models
- FastAPI community for the excellent framework

## Screenshots

### Streamlit Web Interface

_(Add screenshots after deployment)_

### API Documentation

Access interactive API docs at `/docs`:

- Swagger UI with try-it-out functionality
- Complete request/response schemas
- Example queries and responses

## Project Documentation

### Python/FastAPI Documentation

- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Complete deployment guide for all platforms
- **[docs/CLAUDE.md](docs/CLAUDE.md)** - Developer guide for AI assistants
- **[docs/database.md](docs/database.md)** - Database layer documentation (99% coverage)
- **[docs/ci-cd-pipeline.md](docs/ci-cd-pipeline.md)** - CI/CD setup and workflows
- **[streamlit_app/README.md](streamlit_app/README.md)** - Frontend-specific documentation

### TypeScript/NestJS Documentation

- **[MONOREPO.md](MONOREPO.md)** - TypeScript monorepo architecture and migration guide
- **[packages/backend/README.md](packages/backend/README.md)** - NestJS backend documentation
- **[packages/shared/README.md](packages/shared/README.md)** - Shared types package documentation
- **[packages/frontend/README.md](packages/frontend/README.md)** - Next.js frontend documentation (planned)

## Quick Start Scripts

### Python Stack Scripts

Use the helper scripts in `scripts/` for common tasks:

```bash
# Setup project (creates venv, installs dependencies)
./scripts/setup.sh

# Run tests
./scripts/run_tests.sh

# Run tests without coverage
./scripts/run_tests.sh --no-cov

# Deploy to specific platform
./scripts/deploy.sh render     # Deploy to Render
./scripts/deploy.sh railway    # Deploy to Railway
./scripts/deploy.sh streamlit  # Deploy frontend
./scripts/deploy.sh docker     # Run with Docker
```

### TypeScript Stack Scripts

Use pnpm workspace scripts for TypeScript development:

```bash
# Development
pnpm dev              # Run all packages in dev mode
pnpm build            # Build all packages

# Code Quality
pnpm lint             # Lint all packages
pnpm format           # Format all files
pnpm type-check       # Type check all packages

# Testing (when implemented)
pnpm test             # Run all tests

# Cleanup
pnpm clean            # Remove all build artifacts
```

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Author

Sakeeb Rahman ([@Sakeeb91](https://github.com/Sakeeb91))
