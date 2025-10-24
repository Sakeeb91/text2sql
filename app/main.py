"""FastAPI application entrypoint."""
from fastapi import FastAPI

app = FastAPI(
    title="Text-to-SQL API",
    description="Convert natural language questions into SQL queries.",
    version="0.1.0",
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Simple health check endpoint for bootstrap phase."""
    return {"status": "ok"}
