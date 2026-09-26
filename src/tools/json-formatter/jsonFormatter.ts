import JSON5 from 'json5';

export type JsonFormatMode = 'prettify' | 'minify';

export interface JsonFormatOptions {
  indentSize: number;
  mode: JsonFormatMode;
  sortKeys: boolean;
}

export interface JsonFormatResult {
  error: boolean;
  value: string;
}

export function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortJsonKeys(child)]),
    );
  }

  return value;
}

export function formatJson(input: string, options: JsonFormatOptions): JsonFormatResult {
  if (input === '') {
    return { error: false, value: '' };
  }

  try {
    const parsed = JSON5.parse(input);
    const value = options.mode === 'prettify' && options.sortKeys ? sortJsonKeys(parsed) : parsed;
    const indent = options.mode === 'prettify' ? Math.min(10, Math.max(0, options.indentSize)) : 0;
    return { error: false, value: JSON.stringify(value, null, indent) };
  } catch {
    return { error: true, value: '' };
  }
}
