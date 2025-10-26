"""Tests for the OpenAI SQL generation client."""
from __future__ import annotations

import importlib
import json
from types import SimpleNamespace

import pytest


@pytest.fixture()
def openai_client_module(monkeypatch):
    """Reload the OpenAI client module with deterministic environment variables."""
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setenv("OPENAI_MODEL", "gpt-4o-mini")
    monkeypatch.setenv("OPENAI_TEMPERATURE", "0.1")

    import app.openai_client as module

    return importlib.reload(module)


class DummyResponse:
    """Minimal response stub matching the OpenAI Responses API surface."""

    def __init__(self, text: str) -> None:
        self.output_text = text
        content = SimpleNamespace(text=text)
        self.output = [SimpleNamespace(content=[content])]


def test_generate_sql_query_valid_select(openai_client_module, monkeypatch):
    """Verify that a valid SELECT query is returned when OpenAI succeeds."""
    expected_sql = "SELECT COUNT(*) AS customer_count FROM customers;"

    recorded = {}

    def fake_create(**kwargs):
        recorded.update(kwargs)
        return DummyResponse(json.dumps({"sql": expected_sql}))

    monkeypatch.setattr(
        openai_client_module,
        "client",
        SimpleNamespace(responses=SimpleNamespace(create=fake_create)),
    )

    schema = "Table: customers (id INTEGER, name TEXT)"
    result = openai_client_module.generate_sql_query("How many customers do we have?", schema)

    assert result == expected_sql
    assert recorded["model"] == openai_client_module.MODEL
    assert recorded["temperature"] == pytest.approx(float(openai_client_module.TEMPERATURE))
    assert recorded["response_format"] == {"type": "json_object"}
    assert recorded["input"][0]["role"] == "system"


def test_validate_query_is_read_only_valid(openai_client_module):
    """Ensure read-only SELECT statements are accepted."""
    assert openai_client_module.validate_query_is_read_only("SELECT * FROM customers")
    assert openai_client_module.validate_query_is_read_only("  select id, name from orders;  ")


def test_validate_query_is_read_only_invalid(openai_client_module):
    """Ensure mutating queries are rejected."""
    invalid_queries = [
        "INSERT INTO customers VALUES (1, 'test');",
        "UPDATE customers SET name='test';",
        "DELETE FROM orders WHERE id = 1;",
        "DROP TABLE customers;",
        "ALTER TABLE customers ADD COLUMN foo TEXT;",
        "TRUNCATE TABLE orders;",
        "CREATE TABLE temp (id INTEGER);",
    ]
    for query in invalid_queries:
        assert openai_client_module.validate_query_is_read_only(query) is False


def test_generate_sql_query_api_error(openai_client_module, monkeypatch):
    """Verify graceful error handling when the OpenAI API fails."""

    def fake_create(**_kwargs):
        raise openai_client_module.OpenAIError("boom")

    monkeypatch.setattr(
        openai_client_module,
        "client",
        SimpleNamespace(responses=SimpleNamespace(create=fake_create)),
    )

    with pytest.raises(RuntimeError, match="Failed to generate SQL"):
        openai_client_module.generate_sql_query("List customers", "Schema info")


def test_generate_sql_query_json_parsing_error(openai_client_module, monkeypatch):
    """Ensure invalid JSON payloads raise a ValueError."""

    def fake_create(**_kwargs):
        return DummyResponse("not-json")

    monkeypatch.setattr(
        openai_client_module,
        "client",
        SimpleNamespace(responses=SimpleNamespace(create=fake_create)),
    )

    with pytest.raises(ValueError, match="valid JSON"):
        openai_client_module.generate_sql_query("List customers", "Schema info")


def test_generate_sql_query_with_joins(openai_client_module, monkeypatch):
    """Verify complex queries with JOIN clauses are propagated."""
    sql_with_join = (
        "SELECT c.name, COUNT(o.id) AS order_count "
        "FROM customers c JOIN orders o ON c.id = o.customer_id "
        "GROUP BY c.name;"
    )

    def fake_create(**_kwargs):
        return DummyResponse(json.dumps({"sql": sql_with_join}))

    monkeypatch.setattr(
        openai_client_module,
        "client",
        SimpleNamespace(responses=SimpleNamespace(create=fake_create)),
    )

    schema = """
    Table: customers (id INTEGER, name TEXT)
    Table: orders (id INTEGER, customer_id INTEGER, total_amount NUMERIC)
    """
    result = openai_client_module.generate_sql_query("Show total orders per customer", schema)

    assert result == sql_with_join
    assert "JOIN" in result.upper()


def test_generate_sql_query_with_realistic_schema(openai_client_module, monkeypatch):
    """Integration-style test using a concrete schema string."""
    generated_sql = "SELECT COUNT(*) FROM orders WHERE order_date >= DATE('now', '-30 day');"

    def fake_create(**_kwargs):
        return DummyResponse(json.dumps({"sql": generated_sql}))

    monkeypatch.setattr(
        openai_client_module,
        "client",
        SimpleNamespace(responses=SimpleNamespace(create=fake_create)),
    )

    schema = """
    Table: customers (id INTEGER, name TEXT, email TEXT, city TEXT, created_at TIMESTAMP)
    Table: orders (id INTEGER, customer_id INTEGER, product_name TEXT, quantity INTEGER, total_amount DECIMAL, order_date TIMESTAMP)
    """

    result = openai_client_module.generate_sql_query(
        "How many orders were placed in the last 30 days?", schema
    )

    assert openai_client_module.validate_query_is_read_only(result)
    assert "orders" in result.lower()
