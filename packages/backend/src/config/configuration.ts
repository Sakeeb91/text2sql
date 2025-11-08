/**
 * Application configuration factory.
 *
 * This module provides typed configuration values loaded from environment variables.
 */

export const configuration = () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    url: process.env.DATABASE_URL ?? 'sqlite:///./data/database.db',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE ?? '0.1'),
  },
});

