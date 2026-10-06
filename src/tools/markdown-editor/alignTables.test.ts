import { describe, expect, it } from 'vitest';
import { alignMarkdownTables } from './alignTables';

describe('alignMarkdownTables', () => {
  it('sizes columns from the longest cells and preserves GFM alignment markers', () => {
    const input = '| Key | Count | Note |\n| :--- | ---: | :---: |\n| a | 100 | yes |\n| longer label | 2 | no |';
    const result = alignMarkdownTables(input);

    expect(result.text).toBe(
      '| Key          | Count | Note |\n' +
      '| :----------- | ----: | :--: |\n' +
      '| a            |   100 | yes  |\n' +
      '| longer label |     2 |  no  |',
    );
    expect(alignMarkdownTables(result.text).text).toBe(result.text);
  });

  it('leaves prose, malformed tables, escaped pipes, and fenced examples intact', () => {
    const input = 'Hi | there\n| a | b |\n| not a separator | nope |\n\n```md\n| a | b |\n| --- | --- |\n| x | longer |\n```\n\n| Name | Data |\n| --- | --- |\n| a\\|b | longer |';
    const result = alignMarkdownTables(input);

    expect(result.text).toContain('Hi | there\n| a | b |\n| not a separator | nope |');
    expect(result.text).toContain('```md\n| a | b |\n| --- | --- |\n| x | longer |\n```');
    expect(result.text).toContain('| Name | Data   |\n| ---- | ------ |\n| a\\|b | longer |');
  });

  it('maps cursor offsets back to the content of an aligned cell', () => {
    const input = '| A | B |\n| --- | --- |\n| small | long value |';
    const result = alignMarkdownTables(input);
    const inCell = input.indexOf('small') + 3;
    const afterTable = input.length;

    expect(result.text.slice(result.mapOffset(inCell) - 3, result.mapOffset(inCell) + 2)).toBe('small');
    expect(result.mapOffset(afterTable)).toBe(result.text.length);
  });

  it('preserves Windows line endings in imported tables', () => {
    const input = '| Col | Value |\r\n| --- | --- |\r\n| a | longer |\r\n';
    const result = alignMarkdownTables(input);
    expect(result.text).toBe('| Col | Value  |\r\n| --- | ------ |\r\n| a   | longer |\r\n');
    expect(result.mapOffset(input.indexOf('longer') + 3)).toBe(result.text.indexOf('longer') + 3);
  });

  it('keeps pipes inside inline code in the same table cell', () => {
    const input = '| Name | Example |\n| --- | --- |\n| a | `one | two` |';
    expect(alignMarkdownTables(input).text).toBe('| Name | Example     |\n| ---- | ----------- |\n| a    | `one | two` |');
  });

  it('keeps padding and delimiter positions within the original cell', () => {
    const input = '| Name | Value |\n| --- | --- |\n| a    | longer |';
    const result = alignMarkdownTables(input);
    const start = input.indexOf('a    |');
    const newStart = result.text.indexOf('a    |');
    for (let offset = 0; offset <= 5; offset++) {
      expect(result.mapOffset(start + offset)).toBe(newStart + offset);
    }
    const leading = input.indexOf('| a') + 1;
    expect(result.mapOffset(leading)).toBe(result.text.indexOf('| a') + 1);
  });

  it('maps an empty cell and shrinking padding without moving into another cell', () => {
    const input = '| A | B |\n| --- | --- |\n|      | long value |';
    const result = alignMarkdownTables(input);
    const emptyStart = input.lastIndexOf('\n') + 2;
    const newEmptyStart = result.text.lastIndexOf('\n') + 2;
    const closingPipe = result.text.indexOf('|', newEmptyStart);
    for (let offset = 0; offset < 6; offset++) {
      expect(result.mapOffset(emptyStart + offset)).toBeGreaterThanOrEqual(newEmptyStart);
      expect(result.mapOffset(emptyStart + offset)).toBeLessThanOrEqual(closingPipe);
    }

    const padded = '| A | B |\n| --- | --- |\n| x          | y |';
    const aligned = alignMarkdownTables(padded);
    expect(aligned.mapOffset(padded.indexOf('x') + 7)).toBe(aligned.text.indexOf('|', aligned.text.indexOf('x')));
  });
});
