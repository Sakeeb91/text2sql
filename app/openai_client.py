"""OpenAI client utilities for generating read-only SQL queries.

Responsibilities:
- Format system prompts with database schema context
- Safely call the OpenAI Responses API with explicit response_format
- Extract text from multiple possible SDK response shapes
- Validate that generated SQL is strictly read-only and a single statement
"""

from __future__ import annotations

import json
import os
import re
from typing import Any, Iterable

from openai import OpenAI

try:  # Allow compatibility with multiple OpenAI SDK versions.
    from openai import OpenAIError
except ImportError:  # pragma: no cover - fallback for older SDKs
    from openai.error import OpenAIError  # type: ignore

# Lazily configured client; environment variables are loaded by app.__init__.
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.1"))

SYSTEM_PROMPT = """You are a SQL query generator. Convert natural language questions into read-only SQLite SQL queries.

IMPORTANT RULES:
1. Only generate SELECT queries.
2. Never output INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, REPLACE, or TRUNCATE statements.
3. Use valid SQLite syntax.
4. Return JSON: {{"sql": "your SELECT query here"}}

Database Schema:
{schema}

Generate accurate, efficient SQL queries based on the user's question."""

DISALLOWED_KEYWORDS = re.compile(r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE)\b", re.IGNORECASE)


def _strip_sql_comments(sql: str) -> str:
    """Remove SQL single-line and multi-line comments before validation."""
    return re.sub(r"(--[^\n]*|/\*.*?\*/)", "", sql, flags=re.MULTILINE | re.DOTALL)


def _extract_text_from_response(response: Any) -> str:
    """Extract response text from the OpenAI Responses API payload.

    Supports multiple SDK variants by checking several attributes in order:
    - output_text
    - output[].content[].text
    - choices[].message.content
    - choices[].text
    """
    text = getattr(response, "output_text", None)
    if isinstance(text, str) and text.strip():
        return text.strip()

    output = getattr(response, "output", None)
    if isinstance(output, Iterable):
        collected: list[str] = []
        for item in output:
            contents = getattr(item, "content", None)
            if not isinstance(contents, Iterable):
                continue
            for content in contents:
                content_text = getattr(content, "text", None)
                if isinstance(content_text, str) and content_text.strip():
                    collected.append(content_text.strip())
        if collected:
            return " ".join(collected)

    choices = getattr(response, "choices", None)
    if isinstance(choices, Iterable):
        for choice in choices:
            message = getattr(choice, "message", None)
            if isinstance(message, dict):
                content = message.get("content")
                if isinstance(content, str) and content.strip():
                    return content.strip()
            text = getattr(choice, "text", None)
            if isinstance(text, str) and text.strip():
                return text.strip()

    raise ValueError("OpenAI response did not include text output.")


def validate_query_is_read_only(sql: str) -> bool:
    """Validate that the SQL statement is read-only."""
    if not isinstance(sql, str):
        return False

    cleaned = _strip_sql_comments(sql).strip()
    if not cleaned:
        return False

    statements = [statement.strip() for statement in re.split(r";+", cleaned) if statement.strip()]
    if len(statements) != 1:
        return False

    statement = statements[0]
    if not statement.lower().startswith("select"):
        return False

    if DISALLOWED_KEYWORDS.search(statement):
        return False

    return True


def generate_sql_query(question: str, schema: str) -> str:
    """Generate a validated, read-only SQL query from a natural language question.

    Ensures:
    - Non-empty question input
    - JSON response structure containing the `sql` field
    - SQL passes read-only validation guard
    """
    if not question or not question.strip():
        raise ValueError("Question must be a non-empty string.")

    formatted_schema = schema.strip() or "Schema information is unavailable."
    messages = [
        {
            "role": "system",
            "content": [{"type": "text", "text": SYSTEM_PROMPT.format(schema=formatted_schema)}],
        },
        {
            "role": "user",
            "content": [{"type": "text", "text": question.strip()}],
        },
    ]

    responses_api = getattr(client, "responses", None)
    if responses_api is None or not hasattr(responses_api, "create"):
        raise RuntimeError("OpenAI client does not expose the Responses API.")

    try:
        response = responses_api.create(
            model=MODEL,
            temperature=TEMPERATURE,
            response_format={"type": "json_object"},
            input=messages,
        )
    except OpenAIError as exc:
        raise RuntimeError("Failed to generate SQL via OpenAI.") from exc

    raw_text = _extract_text_from_response(response)

    try:
        payload = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError("OpenAI response was not valid JSON.") from exc

    sql_query = payload.get("sql")
    if not isinstance(sql_query, str) or not sql_query.strip():
        raise ValueError("OpenAI response did not contain a SQL query.")

    if not validate_query_is_read_only(sql_query):
        raise ValueError("Generated SQL query is not read-only.")

    return sql_query.strip()
