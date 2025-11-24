import { describe, expect, it } from 'vitest';

import { buildClaudeSqlPrompt } from '../../src/modules/ai-provider/prompts/claude-sql-prompt';

describe('buildClaudeSqlPrompt', () => {
  it('injects schema into the prompt', () => {
    const prompt = buildClaudeSqlPrompt('Table: orders');

    expect(prompt).toContain('Table: orders');
    expect(prompt).toMatch(/JSON only/i);
  });

  it('falls back when schema is blank', () => {
    const prompt = buildClaudeSqlPrompt('   ');

    expect(prompt).toContain('Schema information is unavailable.');
  });
});
