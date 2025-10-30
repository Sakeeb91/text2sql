# Database Layer Documentation

## Overview

The database layer provides SQLAlchemy-based database operations for the Text-to-SQL application. It manages a SQLite database with sample customer and order data, enabling natural language query generation and execution.

## Architecture

### Technology Stack
- **SQLAlchemy**: ORM and query execution
- **SQLite**: Lightweight, file-based database
- **Connection Pooling**: `NullPool` for SQLite thread safety

### Database Location
- Default: `data/database.db`
- Configurable via `DATABASE_URL` environment variable

## Database Schema

### Customers Table

```sql
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    city TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Auto-incrementing primary key
- `name`: Customer's full name (required)
- `email`: Unique email address (required)
- `city`: Customer's city of residence
- `created_at`: Timestamp of record creation

### Orders Table

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

**Fields:**
- `id`: Auto-incrementing primary key
- `customer_id`: Foreign key to customers table (required)
- `product_name`: Name of the product ordered (required)
- `quantity`: Number of items ordered (required)
- `total_amount`: Total order value with 2 decimal precision
- `order_date`: Timestamp of order creation

**Relationships:**
- `orders.customer_id` → `customers.id` (Many-to-One)

## Core Functions

### `init_db()`

Initialize the database schema and seed sample data if the database is empty.

```python
from app.database import init_db

init_db()
```

**Behavior:**
- Creates `data/` directory if it doesn't exist
- Creates tables if they don't exist
- Seeds sample data only if both tables are empty
- Safe to call multiple times (idempotent)

### `execute_query(sql: str) -> list[dict[str, Any]]`

Execute a SQL query and return results as a list of dictionaries.

```python
from app.database import execute_query

# SELECT query
results = execute_query("SELECT * FROM customers WHERE city = 'New York'")
# Returns: [{"id": 1, "name": "Alice Johnson", "email": "alice@...", ...}, ...]

# Aggregate query
count = execute_query("SELECT COUNT(*) as total FROM orders")
# Returns: [{"total": 24}]

# JOIN query
orders_by_customer = execute_query("""
    SELECT c.name, COUNT(o.id) as order_count
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    GROUP BY c.id
""")
```

**Parameters:**
- `sql`: SQL query string (required, non-empty)

**Returns:**
- List of dictionaries where each dict represents a row
- Empty list `[]` for queries that don't return rows (INSERT, UPDATE, etc.)

**Raises:**
- `ValueError`: If SQL string is empty or whitespace-only
- `DatabaseExecutionError`: If query execution fails

**Features:**
- Automatic connection management
- Row-to-dictionary conversion
- Proper error handling and cleanup

### `get_database_schema() -> str`

Inspect the database and return a formatted schema description.

```python
from app.database import get_database_schema

schema = get_database_schema()
print(schema)
```

**Output:**
```
Table: customers
Columns: id (INTEGER), name (VARCHAR), email (VARCHAR), city (VARCHAR), created_at (DATETIME)

Table: orders
Columns: id (INTEGER), customer_id (INTEGER), product_name (VARCHAR), quantity (INTEGER), total_amount (NUMERIC), order_date (DATETIME)
```

**Returns:**
- Formatted string with table names and column definitions
- Empty string if no tables exist

**Use Case:**
- Provide schema context to LLM for SQL generation
- Database documentation
- Schema validation

### `get_db() -> Generator[Session, None, None]`

Provide a scoped database session for dependency injection (FastAPI compatible).

```python
from app.database import get_db

# Direct usage
for session in get_db():
    result = session.execute(text("SELECT * FROM customers"))
    # session automatically closed after loop

# FastAPI dependency injection
from fastapi import Depends

@app.get("/customers")
def list_customers(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT * FROM customers"))
    return result.all()
```

**Returns:**
- Generator yielding SQLAlchemy `Session` object

**Features:**
- Automatic session cleanup
- Exception-safe resource management
- FastAPI compatible

## Sample Data

### Customers (14 records)

The database is seeded with 14 sample customers across various US cities:
- Alice Johnson (New York)
- Brian Smith (San Francisco)
- Carla Gomez (Chicago)
- ... and 11 more

**Data Characteristics:**
- Deterministic seed data (same every time)
- Created dates spanning from 2024-01-02 to 2024-01-15
- Diverse city distribution for geographic queries

### Orders (24 records)

24 sample orders with various products and quantities:
- Analytics Suite ($299.99)
- Reporting Dashboard ($149.00)
- Customer Insights ($199.50)
- ... and 5 more product types

**Data Characteristics:**
- Multiple orders per customer
- Order dates from February 2024
- Varying quantities (1-4 items)
- Total amounts calculated from base price × quantity

## Configuration

### Environment Variables

```bash
# .env file
DATABASE_URL=sqlite:///./data/database.db  # Default
# Or use PostgreSQL for production:
# DATABASE_URL=postgresql://user:pass@localhost/dbname
```

### Connection Arguments

```python
# Automatically configured based on database type
connect_args = {"check_same_thread": False}  # SQLite only
poolclass = NullPool  # SQLite only
```

## Error Handling

### DatabaseExecutionError

Custom exception raised when SQL execution fails.

```python
from app.database import execute_query, DatabaseExecutionError

try:
    result = execute_query("INVALID SQL")
except DatabaseExecutionError as e:
    print(f"Query failed: {e}")
    # Original SQLAlchemy error available via __cause__
```

### Common Error Scenarios

1. **Empty SQL Query**
   ```python
   execute_query("")  # Raises ValueError
   execute_query("   ")  # Raises ValueError
   ```

2. **Invalid SQL Syntax**
   ```python
   execute_query("SELCT * FROM customers")  # Raises DatabaseExecutionError
   ```

3. **Database Connection Failure**
   - Check `DATABASE_URL` configuration
   - Verify `data/` directory permissions
   - Ensure SQLite file is not locked

## Testing

### Running Tests

```bash
# Run all database tests
pytest tests/test_database.py -v

# Run with coverage
pytest tests/test_database.py --cov=app.database --cov-report=term-missing
```

### Test Coverage

Current coverage: **99%** (91/92 lines)

**Covered Scenarios:**
- Database connection establishment
- Schema inspection with tables and without
- Query execution for SELECT statements
- Query execution for non-SELECT statements (CREATE, DROP)
- Error handling for invalid SQL
- Error handling for empty SQL
- Result format validation (list of dicts)
- Sample data verification
- Foreign key relationship queries
- Session cleanup in context managers

### Mock Testing

```python
import pytest
from app.database import execute_query

def test_customer_query():
    results = execute_query("SELECT COUNT(*) as count FROM customers")
    assert results[0]["count"] >= 14
```

## Best Practices

### 1. Use Parameterized Queries

While the current implementation uses raw SQL for LLM-generated queries, consider parameterization for user inputs:

```python
# Avoid SQL injection
customer_id = user_input  # Could be malicious
sql = f"SELECT * FROM customers WHERE id = {customer_id}"  # DANGEROUS

# Better (when not using LLM-generated SQL)
from sqlalchemy import text
stmt = text("SELECT * FROM customers WHERE id = :id")
result = session.execute(stmt, {"id": customer_id})
```

### 2. Connection Management

Always use context managers or the provided helper functions:

```python
# Good - automatic cleanup
with engine.connect() as conn:
    result = conn.execute(text(sql))

# Good - using helper
results = execute_query(sql)

# Bad - manual connection management
conn = engine.connect()
result = conn.execute(text(sql))
conn.close()  # Might not execute if exception occurs
```

### 3. Schema Context for LLM

Always provide schema to LLM before generating SQL:

```python
from app.database import get_database_schema

schema = get_database_schema()
prompt = f"""
Database Schema:
{schema}

User Question: How many orders did Alice Johnson make?
Generate SQL:
"""
```

### 4. Error Handling in Production

```python
from app.database import execute_query, DatabaseExecutionError

def safe_query_execution(sql: str):
    try:
        return {"success": True, "data": execute_query(sql)}
    except ValueError as e:
        return {"success": False, "error": "Invalid query format"}
    except DatabaseExecutionError as e:
        return {"success": False, "error": "Query execution failed"}
```

## Migration Guide

### Adding New Tables

```python
from sqlalchemy import Table, Column, Integer, String, MetaData

# Define new table
new_table = Table(
    "products",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String, nullable=False),
)

# Create table
metadata.create_all(engine)
```

### Schema Changes

For production systems, consider using Alembic for migrations:

```bash
pip install alembic
alembic init alembic
alembic revision --autogenerate -m "Add products table"
alembic upgrade head
```

## Performance Considerations

### SQLite Limitations

- **Concurrent Writes**: Limited to one writer at a time
- **Threading**: `check_same_thread=False` allows multi-threaded access
- **Scale**: Recommended for < 100k rows per table

### Optimization Tips

1. **Indexing**: Add indexes for frequently queried columns
   ```sql
   CREATE INDEX idx_customer_city ON customers(city);
   CREATE INDEX idx_order_customer ON orders(customer_id);
   ```

2. **Query Optimization**: Use EXPLAIN to analyze queries
   ```python
   execute_query("EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1")
   ```

3. **Connection Pooling**: For production, use proper pooling
   ```python
   engine = create_engine(
       DATABASE_URL,
       pool_size=10,
       max_overflow=20,
       pool_pre_ping=True
   )
   ```

## Troubleshooting

### Database Locked Error

**Symptom**: `sqlite3.OperationalError: database is locked`

**Solutions:**
- Close all other connections to the database
- Use `NullPool` (already configured)
- Increase timeout: `create_engine(..., connect_args={"timeout": 30})`

### Missing Data Directory

**Symptom**: `FileNotFoundError` when accessing database

**Solution:**
```python
from pathlib import Path
Path("data").mkdir(exist_ok=True)
init_db()
```

### Sample Data Not Appearing

**Symptom**: Tables exist but are empty

**Solution:**
```python
# Sample data only seeds if BOTH tables are empty
# Drop tables and reinitialize
metadata.drop_all(engine)
init_db()
```

## API Reference

### Module: `app.database`

#### Constants

- `DATA_DIR`: Path to data directory (`Path("data")`)
- `DEFAULT_DATABASE_FILE`: Default database file path (`data/database.db`)
- `DATABASE_URL`: Connection string (from env or default)
- `DATABASE_FILE`: Resolved database file path
- `engine`: SQLAlchemy engine instance
- `SessionLocal`: Session factory
- `metadata`: SQLAlchemy metadata object
- `customers_table`: Customers table definition
- `orders_table`: Orders table definition

#### Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `init_db()` | None | None | Initialize database and seed data |
| `execute_query(sql)` | `sql: str` | `list[dict[str, Any]]` | Execute SQL and return results |
| `get_database_schema()` | None | `str` | Get formatted schema description |
| `get_db()` | None | `Generator[Session, None, None]` | Get database session (FastAPI) |

#### Exceptions

- `DatabaseExecutionError`: Raised when SQL execution fails

## Examples

### Example 1: Basic Query

```python
from app.database import init_db, execute_query

# Initialize database
init_db()

# Query all customers
customers = execute_query("SELECT * FROM customers")
for customer in customers:
    print(f"{customer['name']} - {customer['email']}")
```

### Example 2: Aggregate Analysis

```python
from app.database import execute_query

# Total revenue
revenue = execute_query("""
    SELECT SUM(total_amount) as total_revenue
    FROM orders
""")
print(f"Total Revenue: ${revenue[0]['total_revenue']}")

# Revenue by city
city_revenue = execute_query("""
    SELECT c.city, SUM(o.total_amount) as revenue
    FROM customers c
    JOIN orders o ON c.id = o.customer_id
    GROUP BY c.city
    ORDER BY revenue DESC
""")
for row in city_revenue:
    print(f"{row['city']}: ${row['revenue']}")
```

### Example 3: Complex JOIN

```python
from app.database import execute_query

# Top customers by order count
top_customers = execute_query("""
    SELECT
        c.name,
        c.email,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_spent
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    GROUP BY c.id
    ORDER BY total_spent DESC
    LIMIT 5
""")

for customer in top_customers:
    print(f"{customer['name']}: {customer['order_count']} orders, ${customer['total_spent']}")
```

### Example 4: FastAPI Integration

```python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.database import get_db, execute_query

app = FastAPI()

@app.get("/customers")
def list_customers(db: Session = Depends(get_db)):
    """List all customers using session dependency."""
    result = db.execute(text("SELECT * FROM customers"))
    return [dict(row) for row in result.mappings()]

@app.get("/query")
def execute_custom_query(sql: str):
    """Execute custom SQL query."""
    try:
        results = execute_query(sql)
        return {"success": True, "data": results}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

## Resources

- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [FastAPI SQL Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/)

## Changelog

### Version 1.0.0 (Phase 2)
- Initial database layer implementation
- SQLAlchemy integration with SQLite
- Customers and orders schema
- Query execution and schema inspection
- Sample data seeding
- Comprehensive test coverage (99%)
