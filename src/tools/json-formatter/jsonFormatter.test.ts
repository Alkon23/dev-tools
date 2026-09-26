import { describe, expect, it } from 'vitest';
import { formatJson, sortJsonKeys } from './jsonFormatter';

describe('JSON formatting', () => {
  it('accepts JSON5 and emits sorted, strict, prettified JSON', () => {
    const result = formatJson(`{
      // JSON5 comment
      unquoted: 'value',
      nested: { zebra: 1, alpha: 2, },
    }`, { mode: 'prettify', indentSize: 2, sortKeys: true });

    expect(result).toEqual({
      error: false,
      value: `{
  "nested": {
    "alpha": 2,
    "zebra": 1
  },
  "unquoted": "value"
}`,
    });
  });

  it('sorts objects recursively without changing array order', () => {
    expect(sortJsonKeys({ z: [{ b: 1, a: 2 }, 3], a: true })).toEqual({
      a: true,
      z: [{ a: 2, b: 1 }, 3],
    });
  });

  it('minifies without sorting parsed keys', () => {
    expect(formatJson('{ zebra: 1, alpha: 2 }', {
      mode: 'minify',
      indentSize: 8,
      sortKeys: true,
    })).toEqual({ error: false, value: '{"zebra":1,"alpha":2}' });
  });

  it('supports every JSON primitive, including null and false', () => {
    for (const [input, output] of [['null', 'null'], ['false', 'false'], ['0', '0'], ['"text"', '"text"']]) {
      expect(formatJson(input, { mode: 'prettify', indentSize: 3, sortKeys: true })).toEqual({
        error: false,
        value: output,
      });
    }
  });

  it('clamps indentation and distinguishes empty from malformed input', () => {
    expect(formatJson('', { mode: 'prettify', indentSize: 3, sortKeys: true })).toEqual({ error: false, value: '' });
    expect(formatJson('   ', { mode: 'prettify', indentSize: 3, sortKeys: true })).toEqual({ error: true, value: '' });
    expect(formatJson('{ nope', { mode: 'prettify', indentSize: 3, sortKeys: true })).toEqual({ error: true, value: '' });
    expect(formatJson('{a: 1}', { mode: 'prettify', indentSize: 20, sortKeys: false }).value).toContain(`${' '.repeat(10)}"a"`);
  });
});
