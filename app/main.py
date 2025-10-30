"""FastAPI application entrypoint."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app import database, openai_client
from app.models import HealthResponse, QueryRequest, QueryResponse

app = FastAPI(
    title="Text-to-SQL API",
    description="Convert natural language questions into SQL queries.",
    version="0.1.0",
)

# Add CORS middleware to allow Streamlit frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8501",  # Local Streamlit development
        "https://*.streamlit.app",  # Streamlit Cloud apps
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
    """Simple health check endpoint for bootstrap phase."""
    return HealthResponse(status="ok", timestamp=datetime.now(timezone.utc).isoformat())


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
