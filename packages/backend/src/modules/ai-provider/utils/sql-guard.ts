/**
 * Utility helpers to ensure generated SQL remains read-only.
 */

const DISALLOWED_KEYWORDS =
  /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE|PRAGMA|ATTACH|VACUUM)\b/i;

const MULTI_STATEMENT_DELIMITER = /;+/;
const SQL_COMMENT_PATTERN = /(--[^\n]*|\/\*.*?\*\/)/gms;

const stripComments = (sql: string): string => sql.replace(SQL_COMMENT_PATTERN, ' ');

const compactWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

/**
 * Normalizes SQL prior to validation by removing comments and redundant whitespace.
 */
export const normalizeSql = (sql: string): string => compactWhitespace(stripComments(sql));

/**
 * Returns true if the provided SQL statement is a single, read-only SELECT query.
 */
export const isReadOnlySql = (sql: string): boolean => {
  if (typeof sql !== 'string') {
    return false;
  }

  const normalized = normalizeSql(sql);
  if (normalized.length === 0) {
    return false;
  }

  const statements = normalized
    .split(MULTI_STATEMENT_DELIMITER)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  if (statements.length !== 1) {
    return false;
  }

  const [statement] = statements;
  if (!statement.toLowerCase().startsWith('select')) {
    return false;
  }

  if (DISALLOWED_KEYWORDS.test(statement)) {
    return false;
  }

  return true;
};
