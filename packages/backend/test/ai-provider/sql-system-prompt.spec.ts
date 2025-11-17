import { describe, expect, it } from 'vitest';

import { buildSqlSystemPrompt } from '../../src/modules/ai-provider/prompts/sql-system-prompt';

describe('buildSqlSystemPrompt', () => {
  it('injects schema into prompt', () => {
    const prompt = buildSqlSystemPrompt('Table: customers');
    expect(prompt).toContain('Table: customers');
    expect(prompt).toMatch(/Only generate SELECT queries/);
  });

  it('falls back when schema is blank', () => {
    const prompt = buildSqlSystemPrompt('   ');
    expect(prompt).toContain('Schema information is unavailable.');
  });
});
