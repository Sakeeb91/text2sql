"""Integration tests covering the FastAPI query workflow."""
from __future__ import annotations

from collections.abc import Iterator

import pytest

from app import main as main_module
from app.database import execute_query


@pytest.fixture()
def stubbed_openai(monkeypatch) -> Iterator[None]:
    """Stub the OpenAI client to return deterministic SQL for test scenarios."""
    mapping = {
        "how many customers are in the database?": "SELECT COUNT(*) AS total_customers FROM customers;",
        "list all orders with customer names": (
            "SELECT c.name, o.product_name FROM customers c "
            "JOIN orders o ON c.id = o.customer_id;"
        ),
        "what is the total revenue?": "SELECT SUM(total_amount) AS total_revenue FROM orders;",
        "how many customers?": "SELECT COUNT(*) AS total_customers FROM customers;",
        "show me the things": (
            "SELECT name FROM customers WHERE city IS NOT NULL ORDER BY created_at DESC LIMIT 5;"
        ),
    }

    def fake_generate(question: str, schema: str) -> str:
        key = question.strip().lower()
        if "delete" in key or "drop" in key:
            raise ValueError("Only read-only queries are supported.")
        return mapping.get(key, "SELECT 1;")

    monkeypatch.setattr(main_module.openai_client, "generate_sql_query", fake_generate)
    yield


def test_complete_query_flow(client, stubbed_openai) -> None:
    """Test entire flow: question -> SQL -> execution -> results."""
    test_cases = [
        {
            "question": "How many customers are in the database?",
            "expected_tables": ["customers"],
            "expected_operation": "count",
        },
        {
            "question": "List all orders with customer names",
            "expected_tables": ["customers", "orders"],
            "expected_operation": "join",
        },
        {
            "question": "What is the total revenue?",
            "expected_tables": ["orders"],
            "expected_operation": "sum",
        },
    ]

    for case in test_cases:
        response = client.post("/query", json={"question": case["question"]})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        sql = data["sql_query"].lower()
        assert case["expected_operation"].lower() in sql
        for table in case["expected_tables"]:
            assert table in sql
        assert isinstance(data["results"], list)


def test_error_handling_scenarios(client, stubbed_openai) -> None:
    """Test various error conditions and ensure graceful handling."""
    ambiguous_response = client.post("/query", json={"question": "Show me the things"})
    assert ambiguous_response.status_code == 200
    ambiguous_data = ambiguous_response.json()
    assert ambiguous_data["success"] is True
    assert ambiguous_data["sql_query"]

    destructive_response = client.post("/query", json={"question": "Delete all customers"})
    assert destructive_response.status_code == 200
    destructive_data = destructive_response.json()
    assert destructive_data["success"] is False
    assert "read-only" in destructive_data["error"].lower()


def test_database_state_unchanged(client, stubbed_openai) -> None:
    """Verify that repeated API calls do not modify the database state."""
    initial_customers = execute_query("SELECT COUNT(*) AS count FROM customers")[0]["count"]
    initial_orders = execute_query("SELECT COUNT(*) AS count FROM orders")[0]["count"]

    for _ in range(5):
        response = client.post("/query", json={"question": "How many customers?"})
        assert response.status_code == 200
        assert response.json()["success"] is True

    final_customers = execute_query("SELECT COUNT(*) AS count FROM customers")[0]["count"]
    final_orders = execute_query("SELECT COUNT(*) AS count FROM orders")[0]["count"]

    assert initial_customers == final_customers
    assert initial_orders == final_orders
