/**
 * Extracts textual output from the various OpenAI SDK response shapes.
 */

const isIterable = (value: unknown): value is Iterable<unknown> =>
  typeof value === 'object' && value !== null && Symbol.iterator in value;

const normalizeText = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const combined = value
      .map((entry) => normalizeText(entry))
      .filter((entry): entry is string => typeof entry === 'string');
    if (combined.length > 0) {
      return combined.join(' ');
    }
  }

  return undefined;
};

const readOutputCollection = (output: unknown): string | undefined => {
  if (!isIterable(output)) {
    return undefined;
  }

  const collected: string[] = [];
  for (const item of output) {
    const content = (item as { content?: unknown }).content;
    if (!isIterable(content)) {
      continue;
    }
    for (const chunk of content) {
      const text =
        normalizeText((chunk as { text?: unknown }).text) ??
        normalizeText((chunk as { content?: unknown }).content);
      if (text !== undefined) {
        collected.push(text);
      }
    }
  }

  if (collected.length > 0) {
    return collected.join(' ');
  }

  return undefined;
};

const readChoices = (choices: unknown): string | undefined => {
  if (!isIterable(choices)) {
    return undefined;
  }

  for (const choice of choices) {
    const message = (choice as { message?: unknown }).message;
    const messageContent =
      (message as { content?: unknown[] | string })?.content ?? (choice as { text?: unknown }).text;
    const extracted = normalizeText(messageContent);
    if (extracted !== undefined) {
      return extracted;
    }
  }

  return undefined;
};

export const extractTextFromOpenAiResponse = (response: unknown): string => {
  if (response === null || response === undefined) {
    throw new Error('OpenAI response was empty.');
  }

  const outputText = normalizeText((response as { output_text?: unknown }).output_text);
  if (outputText !== undefined) {
    return outputText;
  }

  const output = readOutputCollection((response as { output?: unknown }).output);
  if (output !== undefined) {
    return output;
  }

  const choiceContent = readChoices((response as { choices?: unknown }).choices);
  if (choiceContent !== undefined) {
    return choiceContent;
  }

  throw new Error('OpenAI response did not contain textual output.');
};
