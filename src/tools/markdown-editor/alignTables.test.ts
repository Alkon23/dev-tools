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
});
