"""End-to-end tests simulating realistic user interactions."""
from __future__ import annotations

import time
from typing import Iterator

import pytest

from app import main as main_module


@pytest.fixture()
def e2e_stubbed_openai(monkeypatch) -> Iterator[None]:
    """Provide a deterministic OpenAI stub for end-to-end scenarios."""
    mapping = {
        "what is our total revenue this month?": (
            "SELECT SUM(total_amount) AS revenue FROM orders "
            "WHERE order_date >= DATE('now', '-30 day');"
        ),
        "which customer has placed the most orders?": (
            "SELECT c.name, COUNT(o.id) AS orders_count "
            "FROM customers c JOIN orders o ON c.id = o.customer_id "
            "GROUP BY c.id ORDER BY orders_count DESC LIMIT 1;"
        ),
        "what are the top 5 selling products?": (
            "SELECT product_name, COUNT(id) AS sales FROM orders "
            "GROUP BY product_name ORDER BY sales DESC LIMIT 5;"
        ),
        "show me the average order value by customer": (
            "SELECT c.name, AVG(o.total_amount) AS average_order_value "
            "FROM customers c JOIN orders o ON c.id = o.customer_id "
            "GROUP BY c.name;"
        ),
        "how many new customers joined last week?": (
            "SELECT COUNT(*) AS new_customers "
            "FROM customers WHERE created_at >= DATE('now', '-7 day');"
        ),
    }

    def fake_generate(question: str, schema: str) -> str:
        return mapping.get(question.strip().lower(), "SELECT COUNT(*) AS total_customers FROM customers;")

    monkeypatch.setattr(main_module.openai_client, "generate_sql_query", fake_generate)
    yield


def test_business_intelligence_queries(client, e2e_stubbed_openai) -> None:
    """Exercise a suite of business-style questions against the API."""
    queries = [
        "What is our total revenue this month?",
        "Which customer has placed the most orders?",
        "What are the top 5 selling products?",
        "Show me the average order value by customer",
        "How many new customers joined last week?",
    ]

    for query in queries:
        response = client.post("/query", json={"question": query})
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert payload["sql_query"]
        assert isinstance(payload["results"], list)


def test_query_performance(client, e2e_stubbed_openai) -> None:
    """Verify that the API responds within the expected performance envelope."""
    start = time.perf_counter()
    response = client.post("/query", json={"question": "How many new customers joined last week?"})
    duration = time.perf_counter() - start

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert duration < 3.0


def test_response_structure_consistency(client, e2e_stubbed_openai) -> None:
    """Ensure responses include all expected fields even for repeated requests."""
    response = client.post("/query", json={"question": "What is our total revenue this month?"})
    payload = response.json()

    assert set(payload.keys()) == {"question", "sql_query", "results", "success", "error"}
    assert payload["error"] is None
