"""Unit tests for Pydantic models."""
from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.models import HealthResponse, QueryRequest, QueryResponse


def test_query_request_validation_success() -> None:
    """Verify QueryRequest validates input correctly."""
    request = QueryRequest(question="How many customers?")
    assert request.question == "How many customers?"


def test_query_request_validation_failure() -> None:
    """Empty question strings should fail validation."""
    with pytest.raises(ValidationError):
        QueryRequest(question="")


def test_query_response_model_defaults() -> None:
    """Verify QueryResponse default structure."""
    response = QueryResponse(question="test", sql_query="SELECT 1")
    assert response.success is True
    assert response.results == []
    assert response.error is None


def test_query_response_custom_values() -> None:
    """Verify QueryResponse handles provided values."""
    response = QueryResponse(
        question="test",
        sql_query="SELECT 1",
        results=[{"count": 1}],
        success=False,
        error="failure",
    )
    assert response.success is False
    assert response.error == "failure"


def test_health_response_representation() -> None:
    """Ensure HealthResponse preserves provided status and timestamp."""
    payload = HealthResponse(status="ok", timestamp="2024-01-01T00:00:00Z")
    assert payload.status == "ok"
    assert payload.timestamp.endswith("Z")
