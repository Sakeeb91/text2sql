/**
 * Builds the system prompt used by AI providers when generating SQL.
 */

const BASE_PROMPT = `You are a SQL query generator. Convert natural language questions into read-only SQL queries.

IMPORTANT RULES:
1. Only generate SELECT queries.
2. Never output INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, REPLACE, or TRUNCATE statements.
3. Use valid SQL syntax for the connected database.
4. Return JSON: {"sql": "your SELECT query here"}

Database Schema:
{schema}

Generate accurate, efficient SQL queries based on the user's question.`;

const FALLBACK_SCHEMA = 'Schema information is unavailable.';

export const buildSqlSystemPrompt = (schema: string): string => {
  const formattedSchema =
    typeof schema === 'string' && schema.trim().length > 0 ? schema.trim() : FALLBACK_SCHEMA;
  return BASE_PROMPT.replace('{schema}', formattedSchema);
};
