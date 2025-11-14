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
  OPENAI_API_KEY: Joi.string().required(),
  OPENAI_MODEL: Joi.string().default('gpt-4o-mini'),
  OPENAI_TEMPERATURE: Joi.number().min(0).max(2).default(0.1),
});
