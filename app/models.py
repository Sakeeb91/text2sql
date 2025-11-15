"""Pydantic models shared across the application."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Incoming natural-language question payload."""

    question: str = Field(..., min_length=1, description="Natural language question to convert to SQL")

    class Config:
        json_schema_extra = {
            "example": {
                "question": "How many customers do we have?",
            }
        }


class QueryResponse(BaseModel):
    """Response containing generated SQL and execution results."""

    question: str
    sql_query: str
    results: list[dict[str, Any]] = Field(default_factory=list)
    success: bool = True
    error: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "question": "How many customers do we have?",
                "sql_query": "SELECT COUNT(*) as customer_count FROM customers;",
                "results": [{"customer_count": 150}],
                "success": True,
                "error": None,
            }
        }


class HealthResponse(BaseModel):
    """Health check response payload."""

    status: str
    timestamp: str


class SchemaResponse(BaseModel):
    """Database schema response payload."""

    # BaseModel already exposes a .schema() helper; ignore the clash so the API can
    # keep returning a field literally named "schema".
    schema: str  # type: ignore[assignment]


class TableInfo(BaseModel):
    """Metadata about a single database table."""

    name: str
    row_count: int

    class Config:
        json_schema_extra = {
            "example": {
                "name": "customers",
                "row_count": 14,
            }
        }


class TablesResponse(BaseModel):
    """Response payload for the list of tables and their row counts."""

    tables: list[TableInfo] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "tables": [
                    {"name": "customers", "row_count": 14},
                    {"name": "orders", "row_count": 24},
                ]
            }
        }
