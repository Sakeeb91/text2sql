/**
 * API request and response types for the Text-to-SQL application.
 *
 * These types are shared between the backend and frontend to ensure
 * type safety across the entire application stack.
 */

/**
 * Request payload for natural language query endpoint.
 *
 * @property question - The natural language question to convert to SQL
 *
 * @example
 * ```typescript
 * const request: QueryRequest = {
 *   question: "How many customers do we have?"
 * };
 * ```
 */
export interface QueryRequest {
  question: string;
}

/**
 * Response payload containing generated SQL and execution results.
 *
 * @property question - The original natural language question
 * @property sql_query - The generated SQL query (empty string on failure)
 * @property results - Array of result rows as key-value objects
 * @property success - Whether the query generation and execution succeeded
 * @property error - Error message if success is false (optional)
 *
 * @example
 * ```typescript
 * const response: QueryResponse = {
 *   question: "How many customers do we have?",
 *   sql_query: "SELECT COUNT(*) as customer_count FROM customers;",
 *   results: [{ customer_count: 150 }],
 *   success: true
 * };
 * ```
 */
export interface QueryResponse {
  question: string;
  sql_query: string;
  results: Array<Record<string, unknown>>;
  success: boolean;
  error?: string;
}

/**
 * Health check response payload.
 *
 * @property status - Health status indicator (typically "ok" or "healthy")
 * @property timestamp - ISO 8601 timestamp of the health check
 *
 * @example
 * ```typescript
 * const health: HealthResponse = {
 *   status: "ok",
 *   timestamp: "2024-01-15T10:30:00.000Z"
 * };
 * ```
 */
export interface HealthResponse {
  status: string;
  timestamp: string;
}
