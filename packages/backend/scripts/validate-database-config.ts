/* eslint-disable no-console */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { validationSchema } from '../src/config/validation.schema';

const templates = [
  '../env-templates/.env.development.example',
  '../env-templates/.env.test.example',
  '../env-templates/.env.production.example',
];

function parseEnvFile(filePath: string): Record<string, string> {
  const fileContent = readFileSync(filePath, 'utf-8');
  const result: Record<string, string> = {};

  for (const line of fileContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue;
    }
    const segments: string[] = trimmed.split('=');
    const [rawKey, ...rawValueParts] = segments;
    if (rawKey === undefined) {
      continue;
    }
    const key = rawKey.trim();
    const value = rawValueParts.join('=').trim();
    if (key.length > 0) {
      result[key] = value;
    }
  }

  return result;
}

function validateTemplate(templatePath: string): void {
  const env = parseEnvFile(templatePath);
  const { error } = validationSchema.validate(env, {
    abortEarly: false,
    convert: true,
  });

  if (error != null) {
    throw new Error(`Validation failed for ${templatePath}:\n${error.message}`);
  }

  const databaseUrl = env.DATABASE_URL ?? '';

  if (!databaseUrl.startsWith('postgresql://')) {
    throw new Error(`DATABASE_URL must be PostgreSQL in ${templatePath}`);
  }
}

try {
  for (const relativeTemplate of templates) {
    const fullPath = join(__dirname, relativeTemplate);
    validateTemplate(fullPath);
    console.log(`✓ ${relativeTemplate} validated successfully`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
