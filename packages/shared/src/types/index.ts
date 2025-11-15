/**
 * Shared types and utilities for the Text-to-SQL application.
 *
 * This package provides TypeScript type definitions that are used
 * across both the backend (NestJS) and frontend (Next.js) applications.
 *
 * @packageDocumentation
 */

// Re-export all API types
export type { QueryRequest, QueryResponse, HealthResponse } from './api.types';

// Re-export all database types
export type { Customer, Order, TableSchema, ColumnDefinition } from './database.types';
