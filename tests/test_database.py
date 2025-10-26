"""Database integration tests for the SQLAlchemy layer."""
from __future__ import annotations

from pathlib import Path

import pytest
from sqlalchemy import text

from app import database


@pytest.fixture(scope="module", autouse=True)
def setup_database() -> None:
    """Ensure the database is freshly initialised for this test module."""
    db_path = database.DATABASE_FILE
    if isinstance(db_path, Path) and db_path.exists():
        db_path.unlink()
    database.init_db()
    yield


def test_database_connection() -> None:
    """Verify that the application can establish a working database connection."""
    with database.engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        assert result.scalar_one() == 1


def test_get_database_schema() -> None:
    """Ensure schema inspection enumerates both tables and their columns."""
    schema = database.get_database_schema()
    assert "Table: customers" in schema
    assert "Table: orders" in schema
    assert "id (INTEGER)" in schema
    assert "name (VARCHAR" in schema or "name (TEXT" in schema


def test_execute_query_select() -> None:
    """Verify SELECT queries return data in the expected structure."""
    result = database.execute_query("SELECT COUNT(*) AS count FROM customers")
    assert len(result) > 0
    assert "count" in result[0]
    assert result[0]["count"] >= 10


def test_execute_query_invalid_sql() -> None:
    """Ensure invalid SQL statements raise a database execution error."""
    with pytest.raises(database.DatabaseExecutionError):
        database.execute_query("INVALID SQL STATEMENT")


def test_execute_query_returns_dict_list() -> None:
    """SELECT queries should return a list of dictionary rows."""
    rows = database.execute_query("SELECT * FROM customers ORDER BY id LIMIT 1")
    assert isinstance(rows, list)
    assert rows
    assert isinstance(rows[0], dict)


def test_sample_data_exists() -> None:
    """Sample seed data should populate both customers and orders tables."""
    customers = database.execute_query("SELECT COUNT(*) AS count FROM customers")
    orders = database.execute_query("SELECT COUNT(*) AS count FROM orders")
    assert customers[0]["count"] >= 10
    assert orders[0]["count"] >= 20


def test_foreign_key_relationships() -> None:
    """Joined queries should succeed and return aggregated order counts per customer."""
    result = database.execute_query(
        """
        SELECT c.name, COUNT(o.id) AS order_count
        FROM customers c
        LEFT JOIN orders o ON c.id = o.customer_id
        GROUP BY c.id
        ORDER BY c.id
        """
    )
    assert len(result) >= 10
    # At least one customer must have orders to validate the join behaviour.
    assert any(row["order_count"] > 0 for row in result)
