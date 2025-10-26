"""Placeholder OpenAI client interactions for the bootstrap phase."""
from __future__ import annotations

import os

from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_sql_query(question: str, schema: str) -> str:
    """Stub for natural-language to SQL translation (implemented in Phase 3)."""
    raise NotImplementedError("Phase 3 will implement SQL generation via OpenAI.")


def validate_query_is_read_only(sql: str) -> bool:
    """Basic read-only guard used until proper validation is implemented."""
    return sql.lstrip().lower().startswith("select")
