import { describe, expect, it } from 'vitest';

import { extractTextFromOpenAiResponse } from '../../src/modules/ai-provider/utils/openai-response-parser';

describe('extractTextFromOpenAiResponse', () => {
  it('reads output_text field', () => {
    expect(extractTextFromOpenAiResponse({ output_text: '  SELECT 1  ' })).toBe('SELECT 1');
  });

  it('reads nested output content', () => {
    const payload = {
      output: [
        {
          content: [{ text: 'first' }, { content: 'second' }],
        },
      ],
    };

    expect(extractTextFromOpenAiResponse(payload)).toBe('first second');
  });

  it('reads chat completion choices', () => {
    const payload = {
      choices: [
        {
          message: {
            content: 'SELECT * FROM users',
          },
        },
      ],
    };

    expect(extractTextFromOpenAiResponse(payload)).toBe('SELECT * FROM users');
  });

  it('throws when no textual output is found', () => {
    expect(() => extractTextFromOpenAiResponse({})).toThrow(/did not contain textual output/i);
  });
});
