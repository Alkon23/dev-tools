import { describe, expect, it } from 'vitest';
import { convertTextToUnicode, convertUnicodeToText } from './textToUnicode';

describe('convertTextToUnicode', () => {
  it('converts text to decimal character references', () => {
    expect(convertTextToUnicode('it-tools')).toBe('&#105;&#116;&#45;&#116;&#111;&#111;&#108;&#115;');
    expect(convertTextToUnicode('A B')).toBe('&#65;&#32;&#66;');
  });

  it('preserves UTF-16 surrogate pairs used by the reference format', () => {
    expect(convertTextToUnicode('😀')).toBe('&#55357;&#56832;');
  });

  it('returns an empty value for empty text', () => {
    expect(convertTextToUnicode('')).toBe('');
  });
});

describe('convertUnicodeToText', () => {
  it('converts decimal character references to text', () => {
    expect(convertUnicodeToText('&#105;&#116;&#45;&#116;&#111;&#111;&#108;&#115;')).toBe('it-tools');
    expect(convertUnicodeToText('&#55357;&#56832;')).toBe('😀');
  });

  it('converts entities embedded in ordinary text and leaves unsupported forms unchanged', () => {
    expect(convertUnicodeToText('Value: &#65; / &#x42; / &#;')).toBe('Value: A / &#x42; / &#;');
  });

  it('returns an empty value for empty input', () => {
    expect(convertUnicodeToText('')).toBe('');
  });
});
