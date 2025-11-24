const CODE_BLOCK_PATTERN = /```(?:json)?\s*([\s\S]*?)```/i;

const toText = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
};

export const extractTextFromAnthropicResponse = (response: unknown): string => {
  if (response === null || response === undefined) {
    throw new Error('Anthropic response was empty.');
  }

  const content = (response as { content?: unknown }).content;
  if (!Array.isArray(content)) {
    throw new Error('Anthropic response did not contain any content blocks.');
  }

  const collected = content
    .map((block) => {
      if (block === null || typeof block !== 'object') {
        return undefined;
      }
      const type = (block as { type?: unknown }).type;
      const text = (block as { text?: unknown }).text;
      if (type === 'text') {
        return toText(text);
      }
      return undefined;
    })
    .filter((text): text is string => typeof text === 'string');

  if (collected.length === 0) {
    throw new Error('Anthropic response did not include text content.');
  }

  return collected.join('\\n');
};

const tryParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

export const extractJsonObject = (text: string): unknown => {
  const trimmed = toText(text);
  if (trimmed === undefined) {
    throw new Error('Anthropic response text was empty.');
  }

  const parsed = tryParseJson(trimmed);
  if (parsed !== undefined) {
    return parsed;
  }

  const codeMatch = trimmed.match(CODE_BLOCK_PATTERN);
  if (codeMatch?.[1] !== undefined) {
    const fromCodeBlock = tryParseJson(codeMatch[1] ?? '');
    if (fromCodeBlock !== undefined) {
      return fromCodeBlock;
    }
  }

  const braceMatch = trimmed.match(/\{[\s\S]*\}/);
  if (braceMatch?.[0] !== undefined) {
    const fromBraces = tryParseJson(braceMatch[0] ?? '');
    if (fromBraces !== undefined) {
      return fromBraces;
    }
  }

  throw new Error('Could not extract valid JSON from Anthropic response.');
};
