const FALLBACK_SCHEMA = 'Schema information is unavailable.';

const CLAUDE_SQL_PROMPT = `You are Claude, an expert SQL assistant. Convert natural language questions into a single read-only SELECT query.

Rules:
- Only emit SELECT statements. Never use INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, REPLACE, or TRUNCATE.
- Do not include multiple statements or SQL comments.
- Use the provided schema to keep joins and column names accurate.
- Return JSON only in the shape {"sql": "<query>", "confidence": 0.9}.

Database Schema:
{schema}

Respond with JSON only—no explanations or extra text.`;

const formatSchema = (schema: string): string => {
  const trimmed = schema.trim();
  return trimmed.length > 0 ? trimmed : FALLBACK_SCHEMA;
};

export const buildClaudeSqlPrompt = (schema: string): string =>
  CLAUDE_SQL_PROMPT.replace('{schema}', formatSchema(schema));
