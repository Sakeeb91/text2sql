# Text-to-SQL Application

A production-ready application that converts natural language questions into SQL queries using OpenAI's language models. Includes a FastAPI backend and a beautiful Streamlit web interface.

## Overview

This application consists of two components:

1. **FastAPI Backend**: A RESTful API that accepts natural language questions and returns both the generated SQL query and its execution results.
2. **Streamlit Frontend**: An interactive web interface for querying data using natural language.

The system is designed with security in mind, generating only read-only SELECT queries to prevent unauthorized data modifications.

## Features

### Backend API
- **Natural Language to SQL**: Convert plain English questions into valid SQL queries
- **Security-First Design**: Only SELECT queries are allowed; INSERT/UPDATE/DELETE operations are blocked
- **RESTful API**: Clean, well-documented FastAPI endpoints
- **Schema-Aware**: Automatically inspects database schema to generate context-aware queries
- **Docker Support**: Fully containerized application with Docker Compose
- **CORS Enabled**: Ready for frontend integration

### Frontend UI
- **🔍 Interactive Web Interface**: Beautiful Streamlit-based UI
- **📊 Live Results Display**: View query results in interactive tables
- **📥 CSV Export**: Download results for further analysis
- **💡 Example Questions**: Pre-loaded examples to get started quickly
- **⚙️ API Configuration**: Easy backend URL configuration
- **✅ Health Monitoring**: Real-time API status checking

## Architecture

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

### Project Structure

```
text2sql/
├── app/                      # FastAPI Backend
│   ├── main.py              # API endpoints + CORS
│   ├── database.py          # Database layer with SQLAlchemy
│   ├── openai_client.py     # OpenAI integration
│   └── models.py            # Pydantic models
├── streamlit_app/           # Streamlit Frontend
│   ├── streamlit_app.py     # Web interface
│   ├── requirements.txt     # Frontend dependencies
│   └── .streamlit/
│       └── config.toml      # Theme configuration
├── tests/                   # Test suite
├── docs/                    # Documentation
├── Dockerfile               # Backend container
├── docker-compose.yml       # Local development
├── render.yaml             # Render deployment
├── railway.json            # Railway deployment
├── DEPLOYMENT.md           # Deployment guide
└── requirements.txt        # Backend dependencies
```

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI applications
- **SQLAlchemy**: SQL toolkit and ORM for database operations
- **OpenAI API**: GPT-4o-mini model for natural language processing
- **SQLite**: Lightweight, serverless database
- **Pydantic**: Data validation using Python type annotations

### Frontend
- **Streamlit**: Interactive web application framework
- **Pandas**: Data manipulation and CSV export
- **Requests**: HTTP client for API communication

### DevOps
- **Docker**: Containerization and local development
- **GitHub Actions**: CI/CD pipeline with automated testing
- **Render/Railway**: Cloud deployment platforms

## Quick Start

### Option 1: Try the Deployed App (Coming Soon)

Once deployed, you can access:
- **Web Interface**: Visit the Streamlit app URL
- **API Endpoints**: Access the FastAPI backend directly

### Option 2: Run Locally

**Prerequisites:**
- Python 3.9 or higher
- OpenAI API key
- Docker and Docker Compose (optional, for containerized deployment)

See [Installation](#installation) below for detailed setup instructions.

### Option 3: Deploy Your Own

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guides to deploy on:
- **Render** (recommended, free tier)
- **Railway** (fast deployments, free tier)
- **Fly.io** (global edge deployment)
- **Streamlit Cloud** (frontend hosting, free)

## Prerequisites

- Python 3.9 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Docker and Docker Compose (optional, for containerized deployment)

## Installation

### Local Development

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

### Docker Deployment

Docker provides a consistent, isolated environment for running the application. The setup includes automatic database persistence, health checks, and easy configuration.

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

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | - | ✅ Yes |
| `DATABASE_URL` | Database connection string | `sqlite:///./data/database.db` | No |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4o-mini` | No |
| `OPENAI_TEMPERATURE` | Model temperature (0-2) | `0.1` | No |

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
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

5. **Add monitoring**: Use tools like Prometheus, Grafana, or DataDog

#### Troubleshooting

##### Port Already in Use

**Error**: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution**: Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Use port 8001 instead
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
  "results": [
    {"customer_count": 150}
  ],
  "success": true
}
```

#### GET /health

Health check endpoint to verify the API is running.

**Response:**
```json
{
  "status": "healthy"
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

A ready-to-use Postman collection is available at `docs/text2sql-api.postman_collection.json`. Import it to exercise:
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
```

### Frontend Environment Variables

For Streamlit deployment:

```env
API_URL=https://your-backend-url.onrender.com
```

## Cloud Deployment

This project is ready to deploy to production! See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive guides.

### Backend Deployment

Deploy the FastAPI backend to:
- **[Render](https://render.com)** - Uses `render.yaml` (free tier available)
- **[Railway](https://railway.app)** - Uses `railway.json` (free tier available)
- **[Fly.io](https://fly.io)** - Manual setup (free tier available)
- **Docker** - Any platform supporting Docker containers

### Frontend Deployment

Deploy the Streamlit UI to:
- **[Streamlit Cloud](https://streamlit.io/cloud)** - Free hosting for Streamlit apps

### Quick Deploy Steps

1. **Deploy Backend** (choose one platform):
   ```bash
   # Render: Connect GitHub repo, auto-detects render.yaml
   # Railway: Connect GitHub repo, auto-detects railway.json
   # Fly.io: flyctl launch && flyctl deploy
   ```

2. **Deploy Frontend**:
   ```bash
   # Streamlit Cloud: Connect GitHub, point to streamlit_app/streamlit_app.py
   # Set API_URL environment variable to your backend URL
   ```

3. **Done!** Your app is live 🚀

Full instructions in [DEPLOYMENT.md](DEPLOYMENT.md).

## Development Roadmap

- [x] Phase 1: Project Setup & Configuration
- [x] Phase 2: Database Layer Implementation
- [x] Phase 3: OpenAI Integration
- [x] Phase 4: FastAPI Application
- [x] Phase 5: Containerization
- [x] Phase 6: Testing & Documentation
- [x] Phase 7: Streamlit Frontend
- [x] Phase 8: Cloud Deployment Configurations

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on the article: [Creating a Text-to-SQL App with OpenAI, FastAPI, SQLite](https://www.kdnuggets.com/creating-a-text-to-sql-app-with-openai-fastapi-sqlite)
- OpenAI for their powerful language models
- FastAPI community for the excellent framework

## Screenshots

### Streamlit Web Interface
*(Add screenshots after deployment)*

### API Documentation
Access interactive API docs at `/docs`:
- Swagger UI with try-it-out functionality
- Complete request/response schemas
- Example queries and responses

## Project Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for all platforms
- **[CLAUDE.md](CLAUDE.md)** - Developer guide for Claude Code
- **[docs/database.md](docs/database.md)** - Database layer documentation
- **[docs/ci-cd-pipeline.md](docs/ci-cd-pipeline.md)** - CI/CD setup and workflows
- **[streamlit_app/README.md](streamlit_app/README.md)** - Frontend-specific documentation

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Author

Sakeeb Rahman ([@Sakeeb91](https://github.com/Sakeeb91))
