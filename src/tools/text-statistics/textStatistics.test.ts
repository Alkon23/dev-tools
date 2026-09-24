import { describe, expect, it } from 'vitest';
import { formatBytes, getTextStatistics } from './textStatistics';

describe('getTextStatistics', () => {
  it('returns zero counts for empty and whitespace-only input', () => {
    expect(getTextStatistics('')).toEqual({ characters: 0, words: 0, lines: 0, bytes: 0 });
    expect(getTextStatistics('   ')).toEqual({ characters: 3, words: 0, lines: 1, bytes: 3 });
  });

  it('counts words and all common line endings', () => {
    expect(getTextStatistics('one  two\r\nthree\rfour\nfive')).toEqual({
      characters: 25,
      words: 5,
      lines: 4,
      bytes: 25,
    });
  });

  it('uses UTF-16 length for characters and UTF-8 length for bytes', () => {
    expect(getTextStatistics('😀')).toEqual({ characters: 2, words: 1, lines: 1, bytes: 4 });
  });
});

describe('formatBytes', () => {
  it.each([
    [0, '0 Bytes'],
    [10, '10 Bytes'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [1024 ** 2, '1 MB'],
  ])('formats %i bytes as %s', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});
