# Text-to-SQL Application

A production-ready API that converts natural language questions into SQL queries using OpenAI's language models, FastAPI, and SQLite.

## Overview

This application provides a RESTful API endpoint that accepts natural language questions and returns both the generated SQL query and its execution results. The system is designed with security in mind, generating only read-only SELECT queries to prevent unauthorized data modifications.

## Features

- **Natural Language to SQL**: Convert plain English questions into valid SQL queries
- **Security-First Design**: Only SELECT queries are allowed; INSERT/UPDATE/DELETE operations are blocked
- **RESTful API**: Clean, well-documented FastAPI endpoints
- **Schema-Aware**: Automatically inspects database schema to generate context-aware queries
- **Docker Support**: Fully containerized application with Docker Compose
- **Persistent Storage**: SQLite database with volume mapping for data persistence

## Architecture

The application is built with a modular architecture:

```
text2sql/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database layer with SQLAlchemy
│   ├── openai_client.py     # OpenAI integration
│   └── models.py            # Pydantic models for request/response
├── tests/
│   ├── __init__.py
│   ├── test_api.py
│   ├── test_database.py
│   └── test_openai.py
├── data/
│   └── .gitkeep             # Placeholder until the database is created
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```

## Technology Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI applications
- **SQLAlchemy**: SQL toolkit and ORM for database operations
- **OpenAI API**: GPT-4o-mini model for natural language processing
- **SQLite**: Lightweight, serverless database
- **Pydantic**: Data validation using Python type annotations
- **Docker**: Containerization and deployment

## Prerequisites

- Python 3.9 or higher
- OpenAI API key
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

5. Run the application:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker Deployment

1. Clone the repository and navigate to the project directory

2. Create `.env` file with your OpenAI API key:
```bash
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

3. Build and run with Docker Compose:
```bash
docker-compose up --build
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

## Usage Examples

### Example 1: Count Query
```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "How many total orders do we have?"}'
```

### Example 2: Aggregation Query
```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "Show me the number of orders per customer"}'
```

### Example 3: Filtering Query
```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "List all customers from New York"}'
```

## Security Features

1. **Read-Only Queries**: System prompt explicitly instructs the model to generate only SELECT statements
2. **SQL Validation**: Server-side validation rejects any query containing INSERT, UPDATE, or DELETE
3. **Error Handling**: Comprehensive error handling prevents information leakage
4. **Environment Variables**: Sensitive credentials stored in environment variables

## Testing

Run the test suite:
```bash
pytest tests/ -v
```

Run tests with coverage:
```bash
pytest tests/ --cov=app --cov-report=html
```

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

Environment variables in `.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./data/database.db
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.1
```

## Development Roadmap

- [ ] Phase 1: Project Setup & Configuration
- [ ] Phase 2: Database Layer Implementation
- [ ] Phase 3: OpenAI Integration
- [ ] Phase 4: FastAPI Application
- [ ] Phase 5: Containerization
- [ ] Phase 6: Testing & Documentation

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

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Author

Sakeeb Rahman ([@Sakeeb91](https://github.com/Sakeeb91))
