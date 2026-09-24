import { describe, expect, it } from 'vitest';
import { convertTextCase } from './textCase';

describe('convertTextCase', () => {
  it.each([
    ['sentence', 'Ship useful developer tools.'],
    ['title', 'Ship Useful Developer Tools'],
    ['camel', 'shipUsefulDeveloperTools'],
    ['kebab', 'ship-useful-developer-tools'],
  ] as const)('converts words to %s case', (format, expected) => {
    expect(convertTextCase('ship_usefulDeveloper-tools', format)).toBe(expected);
  });

  it('returns an empty value for whitespace-only input', () => {
    expect(convertTextCase('   ', 'title')).toBe('');
  });
});
