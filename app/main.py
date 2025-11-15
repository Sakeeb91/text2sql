"""FastAPI application entrypoint.

This module wires together the API surface area, including:
- CORS configuration (configurable via CORS_ALLOW_ORIGINS)
- Health checks for operational monitoring
- Root metadata endpoint for simple discovery
- Query endpoint that converts natural language into read-only SQL
- Schema endpoint to expose the current database structure
- Tables endpoint to list tables with row counts
"""

from __future__ import annotations

import os
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app import database, openai_client
from app.models import (
    HealthResponse,
    QueryRequest,
    QueryResponse,
    SchemaResponse,
    TableInfo,
    TablesResponse,
)

app = FastAPI(
    title="Text-to-SQL API",
    description="Convert natural language questions into SQL queries.",
    version="0.1.0",
)

# Add CORS middleware to allow Streamlit frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:8501,https://*.streamlit.app").split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    """Initialise the database and seed sample data for the API."""
    database.init_db()


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return a minimal payload indicating the API is responsive."""
    return HealthResponse(status="ok", timestamp=datetime.now(timezone.utc).isoformat())


@app.get("/", status_code=status.HTTP_200_OK)
async def root() -> dict[str, str]:
    """Return basic API metadata for quick inspection without opening docs."""
    return {
        "name": app.title,
        "description": app.description or "",
        "version": app.version or "",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/query", response_model=QueryResponse, status_code=status.HTTP_200_OK)
def run_query(payload: QueryRequest) -> QueryResponse:
    """Convert a natural language question into SQL and return execution results."""
    try:
        schema = database.get_database_schema()
        sql_query = openai_client.generate_sql_query(payload.question, schema)
        results = database.execute_query(sql_query)
        return QueryResponse(
            question=payload.question,
            sql_query=sql_query,
            results=results,
            success=True,
        )
    except (ValueError, RuntimeError, database.DatabaseExecutionError) as exc:
        # Return a structured error payload while keeping the response schema consistent.
        return QueryResponse(
            question=payload.question,
            sql_query="",
            results=[],
            success=False,
            error=str(exc),
        )
    except Exception as exc:  # pragma: no cover - defensive guard
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@app.get("/schema", response_model=SchemaResponse, status_code=status.HTTP_200_OK)
async def get_schema() -> SchemaResponse:
    """Expose the current database schema as a diagnostic and developer aid."""
    return SchemaResponse(schema=database.get_database_schema())


@app.get("/tables", response_model=TablesResponse, status_code=status.HTTP_200_OK)
async def list_tables() -> TablesResponse:
    """List all database tables with their row counts."""
    table_rows = database.get_table_row_counts()
    table_info = [TableInfo(name=row["name"], row_count=row["row_count"]) for row in table_rows]
    return TablesResponse(tables=table_info)
