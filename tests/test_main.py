"""Unit tests for the FastAPI application layer."""

from __future__ import annotations

from app import main as main_module


def test_health_check_endpoint(client) -> None:
    """Health endpoint should return an OK response with a timestamp."""
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert "timestamp" in payload


def test_run_query_success(monkeypatch, client) -> None:
    """Happy-path query execution should return SQL and results."""

    def fake_generate(question: str, schema: str) -> str:
        assert "Table: customers" in schema
        return "SELECT 1 AS value"

    def fake_execute(sql: str) -> list[dict[str, int]]:
        assert sql == "SELECT 1 AS value"
        return [{"value": 1}]

    monkeypatch.setattr(main_module.openai_client, "generate_sql_query", fake_generate)
    monkeypatch.setattr(main_module.database, "execute_query", fake_execute)

    response = client.post("/query", json={"question": "Test query"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["sql_query"] == "SELECT 1 AS value"
    assert payload["results"][0]["value"] == 1


def test_run_query_error(monkeypatch, client) -> None:
    """When OpenAI generation fails the API should return a structured error."""

    def fake_generate(question: str, schema: str) -> str:
        raise ValueError("Generation failed")

    monkeypatch.setattr(main_module.openai_client, "generate_sql_query", fake_generate)

    response = client.post("/query", json={"question": "Bad query"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is False
    assert payload["sql_query"] == ""
    assert payload["error"] == "Generation failed"
