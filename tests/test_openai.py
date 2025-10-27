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


def test_extract_text_from_response_output_fallback(openai_client_module):
    """Ensure _extract_text_from_response handles streaming output structures."""

    class AltResponse:
        output_text = None

        def __init__(self) -> None:
            content = SimpleNamespace(text="payload")
            self.output = [SimpleNamespace(content=[content])]

    extracted = openai_client_module._extract_text_from_response(AltResponse())
    assert extracted == "payload"


def test_extract_text_from_response_no_text(openai_client_module):
    """A response without text should raise a ValueError."""

    class EmptyResponse:
        output_text = None
        output = []
        choices = []

    with pytest.raises(ValueError, match="did not include text"):
        openai_client_module._extract_text_from_response(EmptyResponse())


def test_extract_text_from_response_skips_invalid_chunks(openai_client_module):
    """Non-iterable content chunks should be ignored."""

    class MixedResponse:
        output_text = None

        def __init__(self) -> None:
            valid_content = SimpleNamespace(text="payload")
            self.output = [
                SimpleNamespace(content=None),
                SimpleNamespace(content=[valid_content]),
            ]

    extracted = openai_client_module._extract_text_from_response(MixedResponse())
    assert extracted == "payload"


def test_generate_sql_query_missing_responses_api(openai_client_module, monkeypatch):
    """Ensure a helpful error is raised when the Responses API is unavailable."""
    monkeypatch.setattr(openai_client_module, "client", SimpleNamespace())

    with pytest.raises(RuntimeError, match="does not expose the Responses API"):
        openai_client_module.generate_sql_query("Question", "Schema")


def test_validate_query_read_only_multiple_statements(openai_client_module):
    """Multiple statements should not pass the read-only guard."""
    sql = "SELECT 1; SELECT 2;"
    assert openai_client_module.validate_query_is_read_only(sql) is False


def test_extract_text_from_response_choices(openai_client_module):
    """Ensure choices fallback is used when provided."""

    class ChoiceResponse:
        output_text = None
        output = []

        def __init__(self) -> None:
            self.choices = [SimpleNamespace(message={"content": "choice-content"})]

    extracted = openai_client_module._extract_text_from_response(ChoiceResponse())
    assert extracted == "choice-content"


def test_extract_text_from_response_choices_text_field(openai_client_module):
    """Support choices that expose plain text fields."""

    class ChoiceResponse:
        output_text = None
        output = []

        def __init__(self) -> None:
            self.choices = [SimpleNamespace(message=None, text="inline-text")]

    extracted = openai_client_module._extract_text_from_response(ChoiceResponse())
    assert extracted == "inline-text"


def test_validate_query_is_read_only_non_string(openai_client_module):
    """Non-string inputs should be rejected."""
    assert openai_client_module.validate_query_is_read_only(None) is False


def test_validate_query_is_read_only_comments(openai_client_module):
    """Statements resolving to empty strings after stripping comments are invalid."""
    assert openai_client_module.validate_query_is_read_only("-- comment only") is False


def test_validate_query_is_read_only_disallowed_keyword(openai_client_module):
    """Disallowed SQL verbs embedded in the statement should fail validation."""
    sql = "SELECT note FROM audit_logs WHERE note LIKE 'update';"
    assert openai_client_module.validate_query_is_read_only(sql) is False


def test_generate_sql_query_empty_question(openai_client_module):
    """Blank questions should fail validation before hitting OpenAI."""
    with pytest.raises(ValueError, match="non-empty string"):
        openai_client_module.generate_sql_query("   ", "schema")


def test_generate_sql_query_missing_sql_field(openai_client_module, monkeypatch):
    """Responses without an sql field should raise a ValueError."""

    def fake_create(**_kwargs):
        return DummyResponse(json.dumps({"not_sql": "value"}))

    monkeypatch.setattr(
        openai_client_module,
        "client",
        SimpleNamespace(responses=SimpleNamespace(create=fake_create)),
    )

    with pytest.raises(ValueError, match="did not contain a SQL query"):
        openai_client_module.generate_sql_query("List customers", "Schema info")


def test_generate_sql_query_not_read_only(openai_client_module, monkeypatch):
    """Generated SQL must pass the read-only validation guard."""

    def fake_create(**_kwargs):
        return DummyResponse(json.dumps({"sql": "DELETE FROM customers"}))

    monkeypatch.setattr(
        openai_client_module,
        "client",
        SimpleNamespace(responses=SimpleNamespace(create=fake_create)),
    )

    with pytest.raises(ValueError, match="not read-only"):
        openai_client_module.generate_sql_query("Delete customers", "schema")
