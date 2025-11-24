/**
 * Environment variable validation schema.
 *
 * Uses Joi to validate environment variables at application startup.
 */

import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().allow('sqlite:///').default('sqlite:///./data/database.db'),
  AI_PROVIDER_DEFAULT: Joi.string().valid('openai', 'anthropic', 'custom').default('openai'),
  OPENAI_API_KEY: Joi.string().allow('').default(''),
  OPENAI_BASE_URL: Joi.string().uri().optional(),
  OPENAI_MODEL: Joi.string().default('gpt-4o-mini'),
  OPENAI_TEMPERATURE: Joi.number().min(0).max(2).default(0.1),
  OPENAI_MAX_TOKENS: Joi.number().integer().positive().optional(),
  ANTHROPIC_API_KEY: Joi.string().allow('').default(''),
  ANTHROPIC_BASE_URL: Joi.string().uri().optional(),
  ANTHROPIC_MODEL: Joi.string().default('claude-3-5-sonnet-20241022'),
  ANTHROPIC_TEMPERATURE: Joi.number().min(0).max(2).default(0.2),
  ANTHROPIC_MAX_TOKENS: Joi.number().integer().positive().optional(),
  CUSTOM_API_KEY: Joi.string().allow('').default(''),
  CUSTOM_API_BASE_URL: Joi.string().uri().optional(),
  CUSTOM_API_MODEL: Joi.string().optional(),
  CUSTOM_API_TEMPERATURE: Joi.number().min(0).max(2).optional(),
  CUSTOM_API_MAX_TOKENS: Joi.number().integer().positive().optional(),
});
