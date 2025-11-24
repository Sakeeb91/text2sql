import { describe, expect, it } from 'vitest';

import {
  extractJsonObject,
  extractTextFromAnthropicResponse,
} from '../../src/modules/ai-provider/utils/anthropic-response-parser';

describe('extractTextFromAnthropicResponse', () => {
  it('collects text blocks from the response', () => {
    const text = extractTextFromAnthropicResponse({
      content: [
        { type: 'text', text: 'First line' },
        { type: 'text', text: 'Second line' },
      ],
    });

    expect(text).toContain('First line');
    expect(text).toContain('Second line');
  });

  it('throws when no text content is present', () => {
    expect(() => extractTextFromAnthropicResponse({ content: [] })).toThrow(/text content/i);
  });
});

describe('extractJsonObject', () => {
  it('parses direct JSON payload', () => {
    const payload = extractJsonObject('{"sql": "SELECT 1"}') as { sql: string };
    expect(payload.sql).toBe('SELECT 1');
  });

  it('parses JSON inside a code block', () => {
    const payload = extractJsonObject('```json\n{"sql": "SELECT 2"}\n```') as { sql: string };
    expect(payload.sql).toBe('SELECT 2');
  });

  it('parses JSON embedded in prose', () => {
    const payload = extractJsonObject('Result:\n{ "sql": "SELECT 3" }') as { sql: string };
    expect(payload.sql).toBe('SELECT 3');
  });

  it('throws when JSON cannot be extracted', () => {
    expect(() => extractJsonObject('not-json')).toThrow(/valid json/i);
  });
});
