import { describe, expect, it } from 'vitest';
import { formatXml } from './xmlFormatter';

const prettyOptions = { collapseContent: true, indentSize: 2, mode: 'prettify' as const };

describe('XML formatting', () => {
  it('prettifies nested XML and collapses text content by default', () => {
    expect(formatXml('<hello><world>foo</world><world>bar</world></hello>', prettyOptions)).toEqual({
      error: false,
      value: '<hello>\n  <world>foo</world>\n  <world>bar</world>\n</hello>',
    });
  });

  it('supports expanded content and clamps indentation', () => {
    const result = formatXml('<root><item>value</item></root>', {
      collapseContent: false,
      indentSize: 20,
      mode: 'prettify',
    });
    expect(result.error).toBe(false);
    expect(result.value).toContain(`${' '.repeat(10)}<item>`);
    expect(result.value).toContain(`${' '.repeat(20)}value`);
  });

  it('minifies formatted XML', () => {
    expect(formatXml('<root>\n  <item>one</item>\n  <item>two</item>\n</root>', {
      collapseContent: true,
      indentSize: 8,
      mode: 'minify',
    })).toEqual({
      error: false,
      value: '<root><item>one</item><item>two</item></root>',
    });
  });

  it('preserves declarations, comments, CDATA, and processing instructions', () => {
    const result = formatXml(
      '<?xml version="1.0"?><root><!--note--><?work now?><raw><![CDATA[<x>&value]]></raw></root>',
      prettyOptions,
    );
    expect(result.error).toBe(false);
    expect(result.value).toContain('<?xml version="1.0"?>');
    expect(result.value).toContain('<!--note-->');
    expect(result.value).toContain('<?work now?>');
    expect(result.value).toContain('<![CDATA[<x>&value]]>');
  });

  it('preserves mixed content and xml:space content', () => {
    expect(formatXml('<root><p>Hello <b>world</b>!</p><pre xml:space="preserve">  a\n b  </pre></root>', prettyOptions).value)
      .toContain('<p>Hello <b>world</b>!</p>');
    expect(formatXml('<root><pre xml:space="preserve">  a\n b  </pre></root>', prettyOptions).value)
      .toContain('<pre xml:space="preserve">  a\n b  </pre>');
  });

  it('distinguishes empty input from malformed XML', () => {
    expect(formatXml('', prettyOptions)).toEqual({ error: false, value: '' });
    expect(formatXml('   ', prettyOptions)).toEqual({ error: true, value: '' });
    expect(formatXml('<root><item></root>', prettyOptions)).toEqual({ error: true, value: '' });
    expect(formatXml('<first/><second/>', prettyOptions)).toEqual({ error: true, value: '' });
    expect(formatXml('<parsererror/>', prettyOptions)).toEqual({ error: false, value: '<parsererror></parsererror>' });
  });
});
